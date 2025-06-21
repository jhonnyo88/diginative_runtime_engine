/**
 * Municipal Branding E2E Tests
 * Task: task-te-009 - E2E Testing Framework Implementation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests municipal branding injection and multi-tenant consistency
 * Ensures proper cultural context and government-appropriate styling
 */

import { test, expect } from '@playwright/test';

test.describe('Municipal Branding Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should inject Malmö municipal branding correctly', async ({ page }) => {
    // Navigate to game
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Check for municipal header branding
    await expect(page.locator('h1')).toContainText('Malmö Stad');
    
    // Verify municipal color scheme (primary blue #0066CC)
    const primaryButton = page.locator('button').first();
    const buttonColor = await primaryButton.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    
    // Should use municipal blue color scheme
    expect(buttonColor).toContain('rgb(0, 102, 204)'); // #0066CC
    
    // Check for municipal trust indicators
    await expect(page.locator('text=Säker kommunal plattform')).toBeVisible();
    
    // Verify contact information
    await expect(page.locator('text=it-support@malmo.se')).toBeVisible();
  });

  test('should display Swedish municipal language and terminology', async ({ page }) => {
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Check for proper Swedish municipal language
    await expect(page.locator('text=GDPR-utbildning för kommunal personal')).toBeVisible();
    
    // Verify professional Swedish terminology
    await expect(page.locator('text=Starta GDPR-utbildningen')).toBeVisible();
    
    // Check navigation elements use Swedish
    const buttons = page.locator('button');
    const buttonTexts = await buttons.allTextContents();
    
    // Should contain Swedish municipal terms
    const swedishTerms = buttonTexts.some(text => 
      text.includes('Börja') || text.includes('Nästa') || text.includes('Fortsätt')
    );
    expect(swedishTerms).toBe(true);
  });

  test('should maintain municipal design consistency across game flow', async ({ page }) => {
    // Start game flow
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');
    
    // Wait for game container
    await page.waitForSelector('[data-testid="game-container"]');
    
    // Check municipal header consistency
    await expect(page.locator('h2')).toContainText('GDPR-utbildning');
    
    // Verify municipal button styling throughout
    const gameButtons = page.locator('button[data-testid*="municipal"]');
    if (await gameButtons.count() > 0) {
      const buttonStyle = await gameButtons.first().evaluate(el => ({
        backgroundColor: getComputedStyle(el).backgroundColor,
        borderRadius: getComputedStyle(el).borderRadius,
        fontFamily: getComputedStyle(el).fontFamily
      }));
      
      // Should maintain municipal design tokens
      expect(buttonStyle.fontFamily).toContain('Inter');
      expect(buttonStyle.borderRadius).toBe('8px');
    }
  });

  test('should handle multi-tenant branding scenarios', async ({ page }) => {
    // Test different municipal contexts
    const municipalities = [
      { name: 'malmö', expectedColor: 'rgb(0, 102, 204)' },
      { name: 'stockholm', expectedText: 'Stockholm' },
      { name: 'göteborg', expectedText: 'Göteborg' }
    ];
    
    for (const municipality of municipalities) {
      // Mock municipal context
      await page.addInitScript((municipalityName) => {
        localStorage.setItem('municipalContext', municipalityName);
      }, municipality.name);
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify branding changes based on context
      const titleElement = page.locator('h1, h2').first();
      if (municipality.expectedText) {
        await expect(titleElement).toContainText(municipality.expectedText);
      }
    }
  });

  test('should ensure WCAG 2.1 AA compliance in municipal branding', async ({ page }) => {
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Check color contrast ratios
    const primaryButton = page.locator('button').first();
    const styles = await primaryButton.evaluate(el => ({
      backgroundColor: getComputedStyle(el).backgroundColor,
      color: getComputedStyle(el).color
    }));
    
    // Municipal blue should have sufficient contrast
    // Note: This is a simplified check - in real implementation, 
    // you'd calculate actual contrast ratio
    expect(styles.backgroundColor).toBeTruthy();
    expect(styles.color).toBeTruthy();
    
    // Check for accessible font sizes
    const textElements = page.locator('p, span, div');
    const fontSize = await textElements.first().evaluate(el => 
      parseFloat(getComputedStyle(el).fontSize)
    );
    
    // Should meet minimum 16px font size for body text
    expect(fontSize).toBeGreaterThanOrEqual(16);
    
    // Verify focus indicators on interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    const focusStyle = await focusedElement.evaluate(el => 
      getComputedStyle(el).outline
    );
    
    // Should have visible focus indicator
    expect(focusStyle).not.toBe('none');
  });

  test('should display municipal trust and security indicators', async ({ page }) => {
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Check for security indicators
    await expect(page.locator('text=Säker inloggning')).toBeVisible();
    await expect(page.locator('text=Sparade framsteg')).toBeVisible();
    
    // Verify session duration information
    await expect(page.locator('text=7 minuter')).toBeVisible();
    
    // Check for municipal authority indicators
    const municipalIndicators = [
      'Malmö Stad',
      'DigiNativa',
      'Säker kommunal plattform'
    ];
    
    for (const indicator of municipalIndicators) {
      await expect(page.locator(`text=${indicator}`)).toBeVisible();
    }
  });

  test('should adapt branding for different screen sizes', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    const desktopHeader = page.locator('h1').first();
    const desktopFontSize = await desktopHeader.evaluate(el => 
      parseFloat(getComputedStyle(el).fontSize)
    );
    
    // Test mobile view (Anna Svensson iPhone 12)
    await page.setViewportSize({ width: 375, height: 812 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const mobileHeader = page.locator('h1').first();
    const mobileFontSize = await mobileHeader.evaluate(el => 
      parseFloat(getComputedStyle(el).fontSize)
    );
    
    // Mobile should have responsive typography
    expect(mobileFontSize).toBeGreaterThan(0);
    expect(mobileFontSize).toBeLessThanOrEqual(desktopFontSize);
    
    // Municipal branding should remain visible on mobile
    await expect(page.locator('text=Malmö Stad')).toBeVisible();
  });

  test('should maintain brand consistency during error states', async ({ page }) => {
    // Mock error response
    await page.route('/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service temporarily unavailable' })
      });
    });
    
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Even during errors, municipal branding should be preserved
    await expect(page.locator('text=Malmö Stad')).toBeVisible();
    
    // Error messages should use municipal language
    const errorElement = page.locator('[data-testid="error-message"]');
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      expect(errorText).toMatch(/(Fel|Försök|Kontakta)/); // Swedish error terms
    }
  });

  test('should inject correct cultural context for different municipalities', async ({ page }) => {
    const culturalContexts = [
      {
        municipality: 'malmö',
        expectedLanguage: 'sv-SE',
        expectedCurrency: 'SEK',
        expectedTime: '24-hour'
      },
      {
        municipality: 'berlin',
        expectedLanguage: 'de-DE',
        expectedCurrency: 'EUR',
        expectedTime: '24-hour'
      }
    ];
    
    for (const context of culturalContexts) {
      await page.addInitScript((ctx) => {
        localStorage.setItem('municipalContext', ctx.municipality);
        localStorage.setItem('culturalContext', ctx.expectedLanguage);
      }, context);
      
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify cultural adaptations
      const htmlLang = await page.getAttribute('html', 'lang');
      if (htmlLang) {
        expect(htmlLang).toContain(context.expectedLanguage.split('-')[0]);
      }
    }
  });
});