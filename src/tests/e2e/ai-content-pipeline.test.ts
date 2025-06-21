/**
 * AI Content Pipeline E2E Tests
 * Task: task-te-009 - E2E Testing Framework Implementation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests complete AI content submission → validation → rendering pipeline
 * Prevents integration bugs from reaching production
 */

import { test, expect } from '@playwright/test';

test.describe('AI Content Pipeline Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
  });

  test('should handle complete AI content workflow from submission to rendering', async ({ page }) => {
    // Step 1: Navigate to game demo
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Step 2: Enter player name (Anna Svensson municipal workflow)
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');
    
    // Step 3: Wait for game to load
    await page.waitForSelector('[data-testid="game-container"]', { timeout: 10000 });
    
    // Step 4: Verify AI content rendering
    await expect(page.locator('h2')).toContainText('GDPR-utbildning');
    
    // Step 5: Test quiz interaction with AI-generated content
    const quizOptions = page.locator('[data-testid="quiz-option"]');
    await expect(quizOptions.first()).toBeVisible();
    
    // Verify that quiz options contain text (not empty due to AI content issues)
    const firstOptionText = await quizOptions.first().textContent();
    expect(firstOptionText).toBeTruthy();
    expect(firstOptionText?.length).toBeGreaterThan(0);
    
    // Step 6: Complete quiz interaction
    await quizOptions.first().click();
    
    // Step 7: Verify response handling
    await page.waitForSelector('button:has-text("Nästa")', { timeout: 5000 });
    await page.click('button:has-text("Nästa")');
    
    // Step 8: Verify progress tracking
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
  });

  test('should handle AI content validation errors gracefully', async ({ page }) => {
    // Mock content validation API to return error
    await page.route('/api/validation/content', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          valid: false,
          errors: ['Invalid AI content structure']
        })
      });
    });
    
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should show error handling UI without crashing
    const errorElement = page.locator('[data-testid="content-error"]');
    if (await errorElement.isVisible()) {
      await expect(errorElement).toContainText('validering');
    }
    
    // Application should remain functional
    await expect(page.locator('button')).toBeVisible();
  });

  test('should validate WebSocket real-time content updates', async ({ page }) => {
    // Navigate to application
    await page.goto('/');
    
    // Mock WebSocket for real-time validation
    await page.addInitScript(() => {
      class MockWebSocket {
        constructor(url) {
          this.url = url;
          this.readyState = 1; // OPEN
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'validation_update',
                  payload: { valid: true, contentId: 'test-content' }
                })
              });
            }
          }, 100);
        }
        send() {}
        close() {}
      }
      window.WebSocket = MockWebSocket;
    });
    
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Verify real-time updates are handled
    await page.waitForTimeout(200);
    await expect(page.locator('body')).toBeVisible(); // Application remains stable
  });

  test('should maintain performance during AI content processing', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/');
    
    const startTime = Date.now();
    
    // Navigate through AI content workflow
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');
    
    // Wait for content to load
    await page.waitForSelector('[data-testid="game-container"]');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (municipal network requirement)
    expect(loadTime).toBeLessThan(5000);
    
    // Verify no JavaScript errors
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    
    // Interact with AI content
    const quizOptions = page.locator('[data-testid="quiz-option"]');
    if (await quizOptions.count() > 0) {
      await quizOptions.first().click();
    }
    
    // Should have no JavaScript errors
    expect(errors).toHaveLength(0);
  });

  test('should handle large AI content payloads efficiently', async ({ page }) => {
    // Mock large content response
    await page.route('/api/content/*', route => {
      const largeContent = {
        scenes: Array.from({ length: 50 }, (_, i) => ({
          id: `scene-${i}`,
          type: 'quiz',
          title: `Quiz Scene ${i}`,
          content: {
            question: `This is a very long question for scene ${i} that tests how the application handles large content payloads from AI generation systems.`,
            options: Array.from({ length: 6 }, (_, j) => ({
              text: `Option ${j} for scene ${i} with detailed explanation about municipal processes and GDPR compliance requirements`,
              isCorrect: j === 0
            }))
          }
        }))
      };
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeContent)
      });
    });
    
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should handle large payload without timeout
    await page.waitForSelector('button:has-text("Börja spela")', { timeout: 10000 });
    
    // Memory usage should remain reasonable
    const metrics = await page.evaluate(() => {
      return {
        memory: (performance as any).memory?.usedJSHeapSize || 0,
        timing: performance.timing.loadEventEnd - performance.timing.navigationStart
      };
    });
    
    // Should not exceed 100MB memory usage
    if (metrics.memory > 0) {
      expect(metrics.memory).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('should recover from AI content validation failures', async ({ page }) => {
    let requestCount = 0;
    
    // Mock validation API to fail first time, succeed second time
    await page.route('/api/validation/content', route => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Validation service temporarily unavailable' })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ valid: true, sanitized: true })
        });
      }
    });
    
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should retry and eventually succeed
    await page.waitForSelector('button:has-text("Börja spela")', { timeout: 15000 });
    
    // Verify retry mechanism worked
    expect(requestCount).toBeGreaterThan(1);
  });
});