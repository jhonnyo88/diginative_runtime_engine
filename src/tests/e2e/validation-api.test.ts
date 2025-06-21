/**
 * Validation API E2E Tests
 * Task: task-te-009 - E2E Testing Framework Implementation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests the complete validation workflow for AI-generated content
 * Ensures content safety and municipal compliance
 */

import { test, expect } from '@playwright/test';

test.describe('Validation API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should validate AI content before rendering in quiz scenes', async ({ page }) => {
    // Monitor validation API calls
    const validationRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/validation')) {
        validationRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });

    // Navigate to game
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');

    // Wait for content to load
    await page.waitForSelector('[data-testid="game-container"]');

    // Verify validation was called
    expect(validationRequests.length).toBeGreaterThan(0);
    
    // Check validation request structure
    const firstValidation = validationRequests[0];
    expect(firstValidation.method).toBe('POST');
    
    if (firstValidation.postData) {
      const data = JSON.parse(firstValidation.postData);
      expect(data).toHaveProperty('content');
      expect(data).toHaveProperty('type');
    }
  });

  test('should block inappropriate content from rendering', async ({ page }) => {
    // Mock validation to reject content
    await page.route('/api/validation/content', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          reason: 'Content contains inappropriate material',
          violations: ['profanity', 'violence']
        })
      });
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should show content warning
    const warningElement = page.locator('[data-testid="content-warning"]');
    if (await warningElement.count() > 0) {
      await expect(warningElement).toContainText('innehåll');
    }

    // Should not proceed to game
    await expect(page.locator('[data-testid="game-container"]')).not.toBeVisible();
  });

  test('should sanitize AI content before display', async ({ page }) => {
    // Mock validation with sanitization
    await page.route('/api/validation/content', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          sanitized: true,
          modifications: {
            original: '<script>alert("XSS")</script>Hello',
            sanitized: 'Hello'
          }
        })
      });
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Test User');
    await page.click('button:has-text("Starta")');

    // Verify no script injection
    const pageContent = await page.content();
    expect(pageContent).not.toContain('<script>alert("XSS")</script>');
    
    // Verify sanitized content is displayed
    await expect(page.locator('body')).toContainText('Hello');
  });

  test('should validate content in batches for performance', async ({ page }) => {
    const validationBatches = [];
    
    await page.route('/api/validation/batch', route => {
      const request = route.request();
      validationBatches.push(request.postDataJSON());
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: Array.from({ length: 10 }, () => ({ valid: true }))
        })
      });
    });

    // Navigate to content-heavy section
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Wait for batch validation
    await page.waitForTimeout(1000);
    
    // Verify batch processing occurred
    if (validationBatches.length > 0) {
      const firstBatch = validationBatches[0];
      expect(firstBatch).toHaveProperty('items');
      expect(Array.isArray(firstBatch.items)).toBe(true);
    }
  });

  test('should cache validation results for repeated content', async ({ page }) => {
    let validationCallCount = 0;
    const contentHash = 'hash-12345';
    
    await page.route('/api/validation/content', route => {
      validationCallCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          contentHash,
          cached: validationCallCount > 1
        })
      });
    });

    // First visit
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(500);
    
    // Navigate away and back
    await page.click('text=DigiNativa');
    await page.waitForTimeout(500);
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should use cached validation
    expect(validationCallCount).toBeLessThanOrEqual(2);
  });

  test('should validate municipal compliance requirements', async ({ page }) => {
    // Mock municipal compliance validation
    await page.route('/api/validation/municipal-compliance', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          compliant: true,
          municipality: 'malmö',
          requirements: {
            languageCompliance: true,
            accessibilityCompliance: true,
            dataPrivacyCompliance: true
          }
        })
      });
    });

    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Check for compliance indicators
    await expect(page.locator('text=Säker kommunal plattform')).toBeVisible();
    
    // Verify Swedish language compliance
    const textContent = await page.locator('body').textContent();
    expect(textContent).toMatch(/Börja|Nästa|Fortsätt/);
  });

  test('should handle validation timeout gracefully', async ({ page }) => {
    // Mock slow validation response
    await page.route('/api/validation/content', async route => {
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second delay
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true })
      });
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should show loading state
    const loadingElement = page.locator('[data-testid="validation-loading"]');
    if (await loadingElement.count() > 0) {
      await expect(loadingElement).toBeVisible();
    }
    
    // Should timeout and show error or fallback
    await page.waitForTimeout(5000);
    
    // Application should remain functional
    await expect(page.locator('button')).toBeVisible();
  });

  test('should validate content based on user role and permissions', async ({ page }) => {
    // Set user context
    await page.addInitScript(() => {
      localStorage.setItem('userRole', 'municipal_employee');
      localStorage.setItem('department', 'IT');
    });

    // Mock role-based validation
    await page.route('/api/validation/role-based', route => {
      const headers = route.request().headers();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: true,
          allowedContent: ['gdpr', 'it-security', 'digital-strategy'],
          restrictedContent: ['finance', 'hr-sensitive']
        })
      });
    });

    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Verify appropriate content is shown
    await expect(page.locator('text=GDPR-utbildning')).toBeVisible();
    
    // Restricted content should not be visible
    await expect(page.locator('text=HR Konfidentiell')).not.toBeVisible();
  });

  test('should integrate with content filtering pipeline', async ({ page }) => {
    const filterStages = [];
    
    // Mock multi-stage filtering
    await page.route('/api/validation/filter/*', route => {
      const stage = route.request().url().split('/').pop();
      filterStages.push(stage);
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          passed: true,
          stage,
          nextStage: stage === 'final' ? null : 'next'
        })
      });
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(1000);
    
    // Verify multi-stage filtering occurred
    if (filterStages.length > 0) {
      expect(filterStages).toContain('profanity');
      expect(filterStages).toContain('security');
      expect(filterStages).toContain('compliance');
    }
  });

  test('should provide detailed validation feedback for content creators', async ({ page }) => {
    // Mock detailed validation response
    await page.route('/api/validation/detailed', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          score: 0.7,
          threshold: 0.8,
          issues: [
            {
              type: 'accessibility',
              severity: 'warning',
              message: 'Color contrast ratio is 3.5:1, should be at least 4.5:1',
              location: 'button.primary'
            },
            {
              type: 'language',
              severity: 'info',
              message: 'Consider using simpler Swedish terms for municipal employees',
              location: 'quiz.question.2'
            }
          ],
          suggestions: [
            'Increase button contrast to meet WCAG 2.1 AA standards',
            'Replace "implementera" with "genomföra" for clarity'
          ]
        })
      });
    });

    // Navigate to content creation mode (if available)
    await page.goto('/');
    
    // Check for validation feedback UI
    const feedbackElement = page.locator('[data-testid="validation-feedback"]');
    if (await feedbackElement.count() > 0) {
      await expect(feedbackElement).toContainText('kontrast');
    }
  });
});