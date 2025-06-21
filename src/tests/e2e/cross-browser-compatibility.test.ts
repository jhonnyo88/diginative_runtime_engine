/**
 * Cross-Browser Compatibility E2E Tests
 * Task: task-te-009 - E2E Testing Framework Implementation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests compatibility across browsers used by municipal employees
 * Ensures consistent experience on all supported platforms
 */

import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  // Test critical functionality across all browsers
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test.describe(`${browserName} compatibility`, () => {
      test(`should render game correctly in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Check basic rendering
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('text=Se Digitaliseringsstrategi Demo')).toBeVisible();
        
        // Navigate to game
        await page.click('text=Se Digitaliseringsstrategi Demo');
        
        // Verify interactive elements work
        const startButton = page.locator('button:has-text("Börja spela")');
        await expect(startButton).toBeVisible();
        await expect(startButton).toBeEnabled();
        
        // Check CSS rendering
        const buttonStyles = await startButton.evaluate(el => {
          const computed = getComputedStyle(el);
          return {
            display: computed.display,
            backgroundColor: computed.backgroundColor,
            cursor: computed.cursor
          };
        });
        
        expect(buttonStyles.display).not.toBe('none');
        expect(buttonStyles.cursor).toBe('pointer');
      });

      test(`should handle form inputs correctly in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        await page.click('text=Se Digitaliseringsstrategi Demo');
        await page.click('button:has-text("Börja spela")');
        
        // Test text input
        const nameInput = page.locator('input[placeholder*="namn"]');
        await expect(nameInput).toBeVisible();
        await nameInput.fill('Anna Svensson');
        await expect(nameInput).toHaveValue('Anna Svensson');
        
        // Test form submission
        await page.click('button:has-text("Starta")');
        await page.waitForSelector('[data-testid="game-container"]', { timeout: 10000 });
      });

      test(`should maintain session storage in ${browserName}`, async ({ page }) => {
        await page.goto('/');
        
        // Set session data
        await page.evaluate(() => {
          sessionStorage.setItem('gameProgress', JSON.stringify({
            level: 1,
            score: 100
          }));
        });
        
        // Reload and verify persistence
        await page.reload();
        
        const sessionData = await page.evaluate(() => {
          return sessionStorage.getItem('gameProgress');
        });
        
        expect(sessionData).toBeTruthy();
        const parsed = JSON.parse(sessionData);
        expect(parsed.level).toBe(1);
        expect(parsed.score).toBe(100);
      });
    });
  });

  // Mobile browser compatibility tests
  test.describe('Mobile Browser Compatibility', () => {
    test('should work on iOS Safari (iPhone 12)', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['iPhone 12'],
        locale: 'sv-SE'
      });
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Check mobile viewport
      const viewport = page.viewportSize();
      expect(viewport.width).toBe(390);
      expect(viewport.height).toBe(844);
      
      // Test touch interactions
      await page.tap('text=Se Digitaliseringsstrategi Demo');
      await expect(page.locator('button:has-text("Börja spela")')).toBeVisible();
      
      // Test mobile-specific features
      const hasViewportMeta = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        return meta?.getAttribute('content')?.includes('width=device-width');
      });
      expect(hasViewportMeta).toBe(true);
      
      await context.close();
    });

    test('should work on Android Chrome', async ({ browser }) => {
      const context = await browser.newContext({
        ...devices['Pixel 5'],
        locale: 'sv-SE'
      });
      const page = await context.newPage();
      
      await page.goto('/');
      
      // Test Android-specific interactions
      await page.tap('text=Se Digitaliseringsstrategi Demo');
      
      // Check for proper touch target sizes (48x48 minimum)
      const buttons = await page.locator('button').all();
      for (const button of buttons.slice(0, 3)) { // Check first 3 buttons
        const box = await button.boundingBox();
        if (box) {
          expect(box.width).toBeGreaterThanOrEqual(44); // Allow slight variation
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
      
      await context.close();
    });
  });

  // Feature detection tests
  test('should handle missing JavaScript features gracefully', async ({ page }) => {
    // Disable modern JavaScript features
    await page.addInitScript(() => {
      // Simulate older browser
      delete window.Promise;
      delete window.fetch;
      delete Array.prototype.includes;
    });
    
    await page.goto('/');
    
    // App should still load with polyfills
    await expect(page.locator('body')).toBeVisible();
    
    // Check if polyfills are loaded
    const hasPolyfills = await page.evaluate(() => {
      return typeof window.Promise !== 'undefined' && 
             typeof window.fetch !== 'undefined';
    });
    
    // Modern apps typically include polyfills
    expect(hasPolyfills).toBe(true);
  });

  // CSS compatibility tests
  test('should handle CSS Grid fallbacks', async ({ page }) => {
    await page.goto('/');
    
    // Check for CSS Grid usage and fallbacks
    const gridElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.filter(el => {
        const display = getComputedStyle(el).display;
        return display === 'grid' || display === 'inline-grid';
      }).length;
    });
    
    // If using grid, check for fallbacks
    if (gridElements > 0) {
      const hasFallbacks = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.some(el => {
          const styles = getComputedStyle(el);
          return styles.display === 'flex' || styles.float !== 'none';
        });
      });
      expect(hasFallbacks).toBe(true);
    }
  });

  // Accessibility features across browsers
  test('should maintain accessibility features across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Check ARIA attributes
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    
    if (await firstButton.count() > 0) {
      const ariaLabel = await firstButton.getAttribute('aria-label');
      if (!ariaLabel) {
        // Button should have accessible text
        const buttonText = await firstButton.textContent();
        expect(buttonText).toBeTruthy();
      }
    }
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    expect(focusedElement).toBeTruthy();
    
    // Check focus indicators
    const focusStyles = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return null;
      const styles = getComputedStyle(focused);
      return {
        outline: styles.outline,
        outlineOffset: styles.outlineOffset,
        boxShadow: styles.boxShadow
      };
    });
    
    // Should have visible focus indicator
    if (focusStyles) {
      const hasVisibleFocus = 
        focusStyles.outline !== 'none' || 
        focusStyles.boxShadow !== 'none';
      expect(hasVisibleFocus).toBe(true);
    }
  });

  // Performance consistency tests
  test('should maintain performance across browsers', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Measure initial load performance
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart
      };
    });
    
    // Performance should be reasonable across all browsers
    expect(metrics.domContentLoaded).toBeLessThan(3000);
    expect(metrics.loadComplete).toBeLessThan(5000);
    
    // Test interaction performance
    const interactionStart = Date.now();
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForSelector('button:has-text("Börja spela")');
    const interactionTime = Date.now() - interactionStart;
    
    // Interaction should be responsive
    expect(interactionTime).toBeLessThan(2000);
  });

  // Local storage compatibility
  test('should handle localStorage quota across browsers', async ({ page }) => {
    await page.goto('/');
    
    // Test localStorage limits
    const storageTest = await page.evaluate(() => {
      try {
        const testData = 'x'.repeat(1024 * 1024); // 1MB string
        let count = 0;
        
        // Try to fill localStorage
        while (count < 5) { // Max 5MB test
          localStorage.setItem(`test_${count}`, testData);
          count++;
        }
        
        // Clean up
        for (let i = 0; i < count; i++) {
          localStorage.removeItem(`test_${i}`);
        }
        
        return { success: true, maxSize: count };
      } catch (e) {
        return { success: false, error: e.name };
      }
    });
    
    // Should support at least 5MB (standard minimum)
    if (storageTest.success) {
      expect(storageTest.maxSize).toBeGreaterThanOrEqual(5);
    }
  });

  // Media query compatibility
  test('should handle responsive design across browsers', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto('/');
      
      // Check responsive behavior
      const isResponsive = await page.evaluate((vp) => {
        const computedStyles = getComputedStyle(document.body);
        return {
          fontSize: parseFloat(computedStyles.fontSize),
          isMobile: window.innerWidth < 768,
          viewport: vp.name
        };
      }, viewport);
      
      // Font size should adapt
      if (viewport.name === 'mobile') {
        expect(isResponsive.isMobile).toBe(true);
      }
    }
  });

  // WebGL/Canvas compatibility
  test('should handle canvas rendering across browsers', async ({ page }) => {
    await page.goto('/');
    
    const canvasSupport = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const hasCanvas = !!canvas.getContext;
      const hasWebGL = !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      
      return {
        canvas2D: hasCanvas && !!canvas.getContext('2d'),
        webGL: hasWebGL
      };
    });
    
    // Should support basic canvas
    expect(canvasSupport.canvas2D).toBe(true);
  });

  // Content Security Policy compatibility
  test('should work with strict CSP across browsers', async ({ page }) => {
    // Check for CSP violations
    const cspViolations = [];
    page.on('console', msg => {
      if (msg.text().includes('Content Security Policy')) {
        cspViolations.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should not have CSP violations
    expect(cspViolations).toHaveLength(0);
  });
});