/**
 * Cypress Support File for Real Device Testing
 * Municipal Testing Utilities and Commands
 */

import './commands';

// Municipal testing utilities
Cypress.Commands.add('municipalLogin', (userType = 'employee') => {
  cy.window().then((win) => {
    win.localStorage.setItem('municipalUser', JSON.stringify({
      type: userType,
      municipality: 'malmo',
      department: 'IT',
      userId: 'anna.svensson',
      deviceType: 'iPhone 12',
      accessibilityNeeds: 'standard'
    }));
    
    win.localStorage.setItem('userPreferences', JSON.stringify({
      language: 'sv-SE',
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false
    }));
  });
});

Cypress.Commands.add('simulateMunicipalNetwork', () => {
  cy.intercept('**/*', (req) => {
    req.reply((res) => {
      // Simulate municipal network conditions
      // 3G connection with occasional latency spikes
      const baseLatency = Math.random() * 200 + 100; // 100-300ms
      const occasionalSpike = Math.random() < 0.1 ? 1000 : 0; // 10% chance of 1s spike
      const totalLatency = baseLatency + occasionalSpike;
      
      return new Promise(resolve => {
        setTimeout(() => resolve(res), totalLatency);
      });
    });
  });
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.log('♿ Running accessibility compliance check');
  
  // Basic accessibility checks for municipal compliance
  cy.get('body').should('be.visible');
  
  // Check for proper heading structure
  let headingLevels = [];
  cy.get('h1, h2, h3, h4, h5, h6').each(($heading) => {
    const level = parseInt($heading.prop('tagName').charAt(1));
    headingLevels.push(level);
  }).then(() => {
    // Verify heading hierarchy
    if (headingLevels.length > 0) {
      expect(headingLevels[0]).to.equal(1); // Should start with h1
    }
  });
  
  // Check images have alt text
  cy.get('img').each(($img) => {
    cy.wrap($img).should('satisfy', ($el) => {
      const alt = $el.attr('alt');
      const ariaLabel = $el.attr('aria-label');
      const role = $el.attr('role');
      
      // Alt text required unless decorative
      return alt !== undefined || ariaLabel || role === 'presentation';
    });
  });
  
  // Check form inputs have labels
  cy.get('input, select, textarea').each(($input) => {
    cy.wrap($input).should('satisfy', ($el) => {
      const id = $el.attr('id');
      const ariaLabel = $el.attr('aria-label');
      const ariaLabelledBy = $el.attr('aria-labelledby');
      const placeholder = $el.attr('placeholder');
      
      // Check for associated label
      if (id) {
        const hasLabel = Cypress.$(`label[for="${id}"]`).length > 0;
        if (hasLabel) return true;
      }
      
      // Check for parent label
      const parentLabel = $el.closest('label').length > 0;
      if (parentLabel) return true;
      
      // Check for ARIA labeling
      if (ariaLabel || ariaLabelledBy) return true;
      
      // Placeholder as fallback (not ideal but acceptable)
      return placeholder && placeholder.length > 0;
    });
  });
  
  // Check button accessibility
  cy.get('button, [role="button"]').each(($button) => {
    cy.wrap($button).should('satisfy', ($el) => {
      const text = $el.text().trim();
      const ariaLabel = $el.attr('aria-label');
      const title = $el.attr('title');
      
      return text.length > 0 || ariaLabel || title;
    });
  });
  
  // Check color contrast (basic check)
  cy.get('[data-testid="primary-button"], .primary-button').then(($buttons) => {
    $buttons.each((index, button) => {
      const $button = Cypress.$(button);
      const bgColor = $button.css('background-color');
      const textColor = $button.css('color');
      
      // Basic contrast check - ensure colors are different
      expect(bgColor).to.not.equal(textColor);
      
      // Log for manual verification
      cy.log(`Button ${index + 1} - BG: ${bgColor}, Text: ${textColor}`);
    });
  });
  
  // Check focus indicators
  cy.get('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').then(($focusable) => {
    if ($focusable.length > 0) {
      cy.wrap($focusable.first()).focus().then(($focused) => {
        const outline = $focused.css('outline');
        const outlineWidth = $focused.css('outline-width');
        const boxShadow = $focused.css('box-shadow');
        
        // Should have visible focus indicator
        const hasVisibleFocus = 
          (outline && outline !== 'none' && outlineWidth !== '0px') ||
          (boxShadow && boxShadow !== 'none');
          
        expect(hasVisibleFocus).to.be.true;
      });
    }
  });
});

// Performance monitoring for municipal compliance
Cypress.Commands.add('measurePerformance', () => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    const paint = win.performance.getEntriesByType('paint');
    const resources = win.performance.getEntriesByType('resource');
    
    const metrics = {
      // Core navigation metrics
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
      loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
      
      // Paint metrics
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      
      // Resource metrics
      totalResources: resources.length,
      totalResourceSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      
      // Memory usage (if available)
      memoryUsed: win.performance.memory ? win.performance.memory.usedJSHeapSize : 0,
      
      // Device info
      userAgent: win.navigator.userAgent,
      viewport: {
        width: win.innerWidth,
        height: win.innerHeight
      },
      
      // Test metadata
      timestamp: new Date().toISOString(),
      testPage: win.location.pathname
    };
    
    // Log to console for debugging
    cy.log('📊 Performance Metrics:', JSON.stringify(metrics, null, 2));
    
    // Send to municipal compliance system
    cy.task('logMunicipalMetrics', metrics);
    
    // Assert performance targets for municipal networks
    if (metrics.domContentLoaded > 0) {
      expect(metrics.domContentLoaded).to.be.lessThan(10000); // 10s max for DOM ready
    }
    
    if (metrics.firstContentfulPaint > 0) {
      expect(metrics.firstContentfulPaint).to.be.lessThan(5000); // 5s max for FCP
    }
    
    // Resource size should be reasonable for mobile
    if (metrics.totalResourceSize > 0) {
      expect(metrics.totalResourceSize).to.be.lessThan(5 * 1024 * 1024); // 5MB max
    }
  });
});

// Screenshot utilities for visual regression
Cypress.Commands.add('takeScreenshotForRegression', (name, options = {}) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}`;
  
  cy.screenshot(filename, {
    capture: 'viewport',
    ...options
  });
  
  // Log screenshot location for municipal compliance
  cy.log(`📸 Screenshot saved: cypress/screenshots/${filename}.png`);
});

// Municipal branding verification
Cypress.Commands.add('verifyMunicipalBranding', () => {
  cy.log('🏛️ Verifying municipal branding compliance');
  
  // Check for Malmö branding elements
  cy.get('body').then(($body) => {
    const bodyText = $body.text();
    const hasMunicipalBranding = bodyText.includes('Malmö') || 
                                bodyText.includes('Municipal') ||
                                bodyText.includes('Kommun');
    
    if (hasMunicipalBranding) {
      cy.log('✅ Municipal branding detected');
    } else {
      cy.log('⚠️ No municipal branding detected - verify implementation');
    }
  });
  
  // Check for brand colors
  cy.get('[data-testid="primary-button"], .primary-button, .btn-primary').then(($buttons) => {
    if ($buttons.length > 0) {
      const bgColor = $buttons.first().css('background-color');
      
      // Malmö brand colors
      const malmoBlue = 'rgb(0, 102, 204)';
      const malmoGreen = 'rgb(106, 168, 79)';
      
      if (bgColor === malmoBlue || bgColor === malmoGreen) {
        cy.log(`✅ Municipal brand color detected: ${bgColor}`);
      } else {
        cy.log(`⚠️ Non-standard brand color: ${bgColor}`);
      }
    }
  });
});

// Error logging for municipal compliance
Cypress.on('fail', (error, runnable) => {
  // Log test failures for municipal compliance tracking
  const failureData = {
    testName: runnable.title,
    error: error.message,
    timestamp: new Date().toISOString(),
    device: 'iPhone 12',
    userAgent: window.navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  };
  
  cy.writeFile('cypress/logs/test-failures.json', failureData, { flag: 'a+' });
  
  throw error; // Re-throw to maintain normal Cypress behavior
});

// Performance monitoring setup
beforeEach(() => {
  // Mark test start for performance measurement
  cy.window().then((win) => {
    win.testStartTime = Date.now();
    
    // Clear any existing performance entries
    if (win.performance.clearMarks) {
      win.performance.clearMarks();
    }
    if (win.performance.clearMeasures) {
      win.performance.clearMeasures();
    }
  });
});

// Municipal compliance setup
before(() => {
  // Ensure log directories exist
  cy.task('log', '📋 Setting up municipal compliance logging');
  
  // Create performance log file header
  const logHeader = `# Municipal Performance Log - iPhone 12 Testing\n# Started: ${new Date().toISOString()}\n\n`;
  cy.writeFile('cypress/logs/municipal-performance.log', logHeader);
  
  // Create accessibility log file header
  const accessibilityHeader = `# Municipal Accessibility Compliance Log\n# Started: ${new Date().toISOString()}\n\n`;
  cy.writeFile('cypress/logs/accessibility-compliance.log', accessibilityHeader);
});

// Clean up after tests
after(() => {
  cy.task('log', '🧹 Municipal testing session completed');
});