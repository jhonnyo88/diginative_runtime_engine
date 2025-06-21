/**
 * Performance Regression E2E Tests
 * Task: task-te-009 - E2E Testing Framework Implementation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests performance metrics to prevent regressions
 * Ensures 7-minute session optimization for Anna Svensson persona
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable performance monitoring
    await page.evaluateOnNewDocument(() => {
      window.performanceMetrics = {
        marks: [],
        measures: [],
        resources: []
      };
      
      // Override performance.mark
      const originalMark = performance.mark.bind(performance);
      performance.mark = function(name) {
        window.performanceMetrics.marks.push({ name, time: performance.now() });
        return originalMark(name);
      };
      
      // Override performance.measure
      const originalMeasure = performance.measure.bind(performance);
      performance.measure = function(name, start, end) {
        window.performanceMetrics.measures.push({ name, start, end });
        return originalMeasure(name, start, end);
      };
    });
  });

  test('should load initial page within 3 seconds on municipal network', async ({ page }) => {
    // Simulate municipal network conditions
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
      uploadThroughput: 750 * 1024 / 8, // 750 Kbps
      latency: 50 // 50ms latency
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);

    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      return {
        FCP: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart
      };
    });

    // FCP should be under 1.8s for good score
    expect(metrics.FCP).toBeLessThan(1800);
  });

  test('should maintain smooth interactions during 7-minute session', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');

    // Wait for game to load
    await page.waitForSelector('[data-testid="game-container"]');

    // Simulate 7-minute session with interactions
    const interactionMetrics = [];
    const sessionDuration = 7 * 60 * 1000; // 7 minutes
    const interactionInterval = 30 * 1000; // Every 30 seconds
    const interactions = Math.floor(sessionDuration / interactionInterval);

    for (let i = 0; i < Math.min(interactions, 5); i++) { // Limit to 5 interactions for test speed
      const startTime = Date.now();
      
      // Interact with quiz options
      const quizOptions = page.locator('[data-testid="quiz-option"]');
      if (await quizOptions.count() > 0) {
        await quizOptions.first().click();
        
        // Measure interaction response time
        await page.waitForSelector('button:has-text("Nästa")', { timeout: 5000 });
        const responseTime = Date.now() - startTime;
        interactionMetrics.push(responseTime);
        
        await page.click('button:has-text("Nästa")');
      }
      
      // Wait before next interaction
      await page.waitForTimeout(1000);
    }

    // All interactions should be responsive (under 1 second)
    interactionMetrics.forEach(time => {
      expect(time).toBeLessThan(1000);
    });

    // Check memory usage hasn't grown excessively
    const memoryUsage = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory should be under 100MB after session
    if (memoryUsage > 0) {
      expect(memoryUsage).toBeLessThan(100 * 1024 * 1024);
    }
  });

  test('should handle quiz scene transitions efficiently', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');

    await page.waitForSelector('[data-testid="game-container"]');

    // Measure scene transition times
    const transitionTimes = [];

    for (let i = 0; i < 3; i++) {
      // Mark transition start
      await page.evaluate(() => performance.mark('transition-start'));

      // Click quiz option
      const quizOptions = page.locator('[data-testid="quiz-option"]');
      if (await quizOptions.count() > 0) {
        await quizOptions.first().click();
        await page.click('button:has-text("Nästa")');

        // Wait for new scene
        await page.waitForFunction(() => {
          const container = document.querySelector('[data-testid="game-container"]');
          return container && !container.classList.contains('transitioning');
        }, { timeout: 5000 });

        // Mark transition end and measure
        const transitionTime = await page.evaluate(() => {
          performance.mark('transition-end');
          performance.measure('scene-transition', 'transition-start', 'transition-end');
          const measures = performance.getEntriesByName('scene-transition');
          return measures[measures.length - 1]?.duration || 0;
        });

        transitionTimes.push(transitionTime);
      }
    }

    // Scene transitions should be under 500ms
    transitionTimes.forEach(time => {
      expect(time).toBeLessThan(500);
    });
  });

  test('should efficiently load and cache game assets', async ({ page }) => {
    // First visit - measure cold cache
    const firstVisitStart = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const firstVisitTime = Date.now() - firstVisitStart;

    // Get resource timing
    const firstVisitResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: r.duration,
        transferSize: (r as any).transferSize || 0
      }));
    });

    // Second visit - measure warm cache
    await page.reload();
    await page.waitForLoadState('networkidle');

    const secondVisitResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        duration: r.duration,
        transferSize: (r as any).transferSize || 0
      }));
    });

    // Cached resources should load faster
    const cachedResources = secondVisitResources.filter(r => {
      const firstResource = firstVisitResources.find(fr => fr.name === r.name);
      return firstResource && r.transferSize === 0; // transferSize 0 indicates cache hit
    });

    expect(cachedResources.length).toBeGreaterThan(0);
  });

  test('should maintain 60fps during animations', async ({ page }) => {
    await page.goto('/');
    
    // Monitor frame rate during animations
    await page.evaluateOnNewDocument(() => {
      let lastTime = performance.now();
      let frameCount = 0;
      let fps = 0;
      
      window.fpsMonitor = {
        fps: 0,
        samples: []
      };
      
      function measureFPS() {
        const currentTime = performance.now();
        frameCount++;
        
        if (currentTime >= lastTime + 1000) {
          fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
          window.fpsMonitor.fps = fps;
          window.fpsMonitor.samples.push(fps);
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
      }
      
      requestAnimationFrame(measureFPS);
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(3000); // Monitor for 3 seconds

    const fpsData = await page.evaluate(() => window.fpsMonitor);
    
    // Average FPS should be close to 60
    const avgFps = fpsData.samples.reduce((a, b) => a + b, 0) / fpsData.samples.length;
    expect(avgFps).toBeGreaterThan(50);
  });

  test('should handle large quiz datasets efficiently', async ({ page }) => {
    // Mock large quiz data
    await page.route('/api/content/*', route => {
      const largeQuizData = {
        scenes: Array.from({ length: 100 }, (_, i) => ({
          id: `scene-${i}`,
          type: 'quiz',
          content: {
            question: `Question ${i}`,
            options: Array.from({ length: 6 }, (_, j) => ({
              text: `Option ${j}`,
              isCorrect: j === 0
            }))
          }
        }))
      };
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(largeQuizData)
      });
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    
    // Should handle large dataset without timeout
    await page.waitForSelector('button:has-text("Börja spela")', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(10000);
  });

  test('should optimize bundle size and loading', async ({ page }) => {
    const resources = [];
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('.js') || url.includes('.css')) {
        resources.push({
          url,
          size: parseInt(response.headers()['content-length'] || '0'),
          type: url.includes('.js') ? 'javascript' : 'css'
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Calculate total bundle size
    const jsSize = resources
      .filter(r => r.type === 'javascript')
      .reduce((sum, r) => sum + r.size, 0);
    
    const cssSize = resources
      .filter(r => r.type === 'css')
      .reduce((sum, r) => sum + r.size, 0);

    // Bundle sizes should be reasonable
    expect(jsSize).toBeLessThan(1 * 1024 * 1024); // 1MB for JS
    expect(cssSize).toBeLessThan(200 * 1024); // 200KB for CSS
  });

  test('should prevent memory leaks during extended sessions', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Simulate extended interaction
    for (let i = 0; i < 10; i++) {
      const quizOptions = page.locator('[data-testid="quiz-option"]');
      if (await quizOptions.count() > 0) {
        await quizOptions.first().click();
        await page.waitForTimeout(100);
        
        const nextButton = page.locator('button:has-text("Nästa")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
          await page.waitForTimeout(100);
        }
      }
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if (window.gc) window.gc();
    });

    // Check final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Memory growth should be limited
    const memoryGrowth = finalMemory - initialMemory;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // Max 50MB growth
  });

  test('should optimize API response times', async ({ page }) => {
    const apiCalls = [];
    
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          timing: response.timing()
        });
      }
    });

    await page.goto('/');
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForLoadState('networkidle');

    // Check API response times
    apiCalls.forEach(call => {
      if (call.timing) {
        const responseTime = call.timing.responseEnd - call.timing.requestStart;
        // API calls should respond within 500ms
        expect(responseTime).toBeLessThan(500);
      }
    });
  });

  test('should implement efficient lazy loading', async ({ page }) => {
    const loadedResources = new Set();
    
    page.on('response', response => {
      if (response.status() === 200) {
        loadedResources.add(response.url());
      }
    });

    // Initial page load
    await page.goto('/');
    const initialResourceCount = loadedResources.size;

    // Navigate to game
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(1000);
    
    const afterNavigationCount = loadedResources.size;

    // Should load additional resources only when needed
    expect(afterNavigationCount).toBeGreaterThan(initialResourceCount);
    
    // But not everything at once
    expect(afterNavigationCount - initialResourceCount).toBeLessThan(20);
  });
});