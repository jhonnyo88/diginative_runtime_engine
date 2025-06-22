/**
 * Custom Cypress Commands for Municipal Real Device Testing
 * Anna Svensson iPhone 12 Experience Commands
 */

// Tab navigation command for accessibility testing
Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject, options = {}) => {
  const selector = subject ? cy.wrap(subject) : cy.get('body');
  
  return selector.trigger('keydown', {
    key: 'Tab',
    code: 'Tab',
    which: 9,
    keyCode: 9,
    shiftKey: options.shift || false,
    ...options
  });
});

// Enhanced touch interaction for real devices
Cypress.Commands.add('realTouch', { prevSubject: true }, (subject, options = {}) => {
  const { x = 0, y = 0, duration = 100 } = options;
  
  return cy.wrap(subject)
    .trigger('touchstart', {
      touches: [{ clientX: x, clientY: y }],
      force: true,
      ...options
    })
    .wait(duration)
    .trigger('touchend', {
      force: true,
      ...options
    });
});

// Swipe gesture simulation
Cypress.Commands.add('swipe', { prevSubject: true }, (subject, direction, distance = 100) => {
  const startX = direction === 'left' ? distance : direction === 'right' ? 0 : distance / 2;
  const startY = direction === 'up' ? distance : direction === 'down' ? 0 : distance / 2;
  const endX = direction === 'left' ? 0 : direction === 'right' ? distance : distance / 2;
  const endY = direction === 'up' ? 0 : direction === 'down' ? distance : distance / 2;
  
  return cy.wrap(subject)
    .trigger('touchstart', {
      touches: [{ clientX: startX, clientY: startY }],
      force: true
    })
    .trigger('touchmove', {
      touches: [{ clientX: endX, clientY: endY }],
      force: true
    })
    .trigger('touchend', { force: true });
});

// Long press simulation for context menus
Cypress.Commands.add('longPress', { prevSubject: true }, (subject, duration = 1000) => {
  return cy.wrap(subject)
    .trigger('touchstart', { force: true })
    .wait(duration)
    .trigger('touchend', { force: true });
});

// Municipal specific login simulation
Cypress.Commands.add('loginAsMunicipalEmployee', (employeeData = {}) => {
  const defaultEmployee = {
    name: 'Anna Svensson',
    municipality: 'Malmö',
    department: 'IT',
    role: 'employee',
    deviceType: 'iPhone 12',
    ...employeeData
  };
  
  cy.window().then((win) => {
    // Set authentication tokens
    win.localStorage.setItem('municipalAuth', JSON.stringify({
      token: 'mock-jwt-token',
      user: defaultEmployee,
      permissions: ['read_content', 'take_quiz', 'view_results'],
      expiresAt: Date.now() + 3600000 // 1 hour
    }));
    
    // Set user preferences
    win.localStorage.setItem('userPreferences', JSON.stringify({
      language: 'sv-SE',
      theme: 'municipal-blue',
      fontSize: 'medium',
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        screenReader: false
      }
    }));
  });
  
  cy.log(`👤 Logged in as ${defaultEmployee.name} from ${defaultEmployee.municipality}`);
});

// Network simulation for municipal conditions
Cypress.Commands.add('simulateSlowNetwork', (type = 'municipal-3g') => {
  const networkProfiles = {
    'municipal-3g': { latency: 300, downloadSpeed: 1.6, uploadSpeed: 0.8 },
    'municipal-wifi': { latency: 50, downloadSpeed: 10, uploadSpeed: 5 },
    'municipal-4g': { latency: 100, downloadSpeed: 8, uploadSpeed: 3 }
  };
  
  const profile = networkProfiles[type] || networkProfiles['municipal-3g'];
  
  cy.intercept('**/*', (req) => {
    req.reply((res) => {
      return new Promise(resolve => {
        // Simulate variable latency with occasional spikes
        const baseLatency = profile.latency;
        const variableLatency = Math.random() * 100; // ±100ms variance
        const spike = Math.random() < 0.05 ? 1000 : 0; // 5% chance of 1s spike
        const totalLatency = baseLatency + variableLatency + spike;
        
        setTimeout(() => resolve(res), totalLatency);
      });
    });
  });
  
  cy.log(`🌐 Network simulation: ${type} (${profile.latency}ms latency)`);
});

// Screenshot with device info
Cypress.Commands.add('screenshotWithDeviceInfo', (name, options = {}) => {
  cy.window().then((win) => {
    const deviceInfo = {
      userAgent: win.navigator.userAgent,
      viewport: `${win.innerWidth}x${win.innerHeight}`,
      pixelRatio: win.devicePixelRatio,
      timestamp: new Date().toISOString()
    };
    
    const filename = `${name}-iphone12-${Date.now()}`;
    
    cy.screenshot(filename, {
      capture: 'viewport',
      overwrite: true,
      ...options
    });
    
    // Log device info for reference
    cy.writeFile(`cypress/screenshots/${filename}-device-info.json`, deviceInfo);
    
    cy.log(`📱 Screenshot with device info: ${filename}`);
  });
});

// Wait for municipal branding to load
Cypress.Commands.add('waitForMunicipalBranding', (timeout = 10000) => {
  cy.get('body', { timeout }).should('satisfy', ($body) => {
    const text = $body.text();
    return text.includes('Malmö') || 
           text.includes('Municipal') || 
           text.includes('Kommun') ||
           $body.find('[data-testid="municipal-logo"]').length > 0;
  });
  
  cy.log('🏛️ Municipal branding loaded');
});

// Check for and dismiss iOS-specific UI elements
Cypress.Commands.add('handleiOSElements', () => {
  // Handle iOS Safari address bar behavior
  cy.window().then((win) => {
    if (win.navigator.userAgent.includes('iPhone')) {
      // Scroll to hide address bar
      cy.scrollTo(0, 100);
      cy.wait(500);
      cy.scrollTo(0, 0);
    }
  });
  
  // Handle potential iOS permission dialogs
  cy.get('body').then(($body) => {
    // Check for location permission dialog
    if ($body.find('[data-testid="location-permission"]').length > 0) {
      cy.get('[data-testid="location-permission"] button:contains("Allow")').click();
    }
    
    // Check for notification permission dialog
    if ($body.find('[data-testid="notification-permission"]').length > 0) {
      cy.get('[data-testid="notification-permission"] button:contains("Allow")').click();
    }
  });
});

// Accessibility audit command
Cypress.Commands.add('auditAccessibility', (options = {}) => {
  const { logViolations = true, failOnViolations = false } = options;
  
  cy.get('body').then(($body) => {
    const violations = [];
    
    // Check for missing alt text
    $body.find('img:not([alt])').each((index, img) => {
      if (!img.hasAttribute('role') || img.getAttribute('role') !== 'presentation') {
        violations.push({
          type: 'missing-alt-text',
          element: img.tagName,
          selector: img.id ? `#${img.id}` : `img:nth-of-type(${index + 1})`
        });
      }
    });
    
    // Check for form inputs without labels
    $body.find('input, select, textarea').each((index, input) => {
      const hasLabel = input.labels && input.labels.length > 0;
      const hasAriaLabel = input.hasAttribute('aria-label');
      const hasAriaLabelledBy = input.hasAttribute('aria-labelledby');
      
      if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
        violations.push({
          type: 'missing-label',
          element: input.tagName,
          selector: input.id ? `#${input.id}` : `${input.tagName.toLowerCase()}:nth-of-type(${index + 1})`
        });
      }
    });
    
    // Check for buttons without accessible text
    $body.find('button').each((index, button) => {
      const hasText = button.textContent.trim().length > 0;
      const hasAriaLabel = button.hasAttribute('aria-label');
      const hasTitle = button.hasAttribute('title');
      
      if (!hasText && !hasAriaLabel && !hasTitle) {
        violations.push({
          type: 'missing-button-text',
          element: button.tagName,
          selector: button.id ? `#${button.id}` : `button:nth-of-type(${index + 1})`
        });
      }
    });
    
    if (logViolations && violations.length > 0) {
      cy.log('♿ Accessibility violations found:', violations);
      cy.task('testAccessibilityCompliance', violations);
    }
    
    if (failOnViolations && violations.length > 0) {
      throw new Error(`Accessibility violations found: ${violations.length}`);
    }
    
    return violations;
  });
});

// Performance measurement for specific actions
Cypress.Commands.add('measureActionPerformance', (actionName, actionFn) => {
  cy.window().then((win) => {
    const startTime = win.performance.now();
    win.performance.mark(`${actionName}-start`);
    
    // Execute the action
    return actionFn().then(() => {
      const endTime = win.performance.now();
      win.performance.mark(`${actionName}-end`);
      win.performance.measure(actionName, `${actionName}-start`, `${actionName}-end`);
      
      const duration = endTime - startTime;
      
      cy.log(`⏱️ ${actionName} took ${duration.toFixed(2)}ms`);
      
      // Log for municipal compliance
      cy.task('logMunicipalMetrics', {
        action: actionName,
        duration: duration,
        timestamp: new Date().toISOString(),
        device: 'iPhone 12'
      });
      
      return duration;
    });
  });
});

// Type definitions for TypeScript support
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      tab(options?: { shift?: boolean }): Chainable<Element>
      realTouch(options?: { x?: number, y?: number, duration?: number }): Chainable<Element>
      swipe(direction: 'left' | 'right' | 'up' | 'down', distance?: number): Chainable<Element>
      longPress(duration?: number): Chainable<Element>
      loginAsMunicipalEmployee(employeeData?: object): Chainable<void>
      simulateSlowNetwork(type?: 'municipal-3g' | 'municipal-wifi' | 'municipal-4g'): Chainable<void>
      screenshotWithDeviceInfo(name: string, options?: object): Chainable<void>
      waitForMunicipalBranding(timeout?: number): Chainable<void>
      handleiOSElements(): Chainable<void>
      auditAccessibility(options?: { logViolations?: boolean, failOnViolations?: boolean }): Chainable<void>
      measureActionPerformance(actionName: string, actionFn: () => Cypress.Chainable): Chainable<number>
      municipalLogin(userType?: string): Chainable<void>
      simulateMunicipalNetwork(): Chainable<void>
      checkAccessibility(): Chainable<void>
      measurePerformance(): Chainable<void>
      takeScreenshotForRegression(name: string, options?: object): Chainable<void>
      verifyMunicipalBranding(): Chainable<void>
    }
  }
}

export {};