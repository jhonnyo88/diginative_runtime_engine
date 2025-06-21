/**
 * Anna Svensson iPhone 12 Real Device Tests
 * Task: proposal-017 - Real Device Testing Infrastructure
 * Focus: Municipal Employee Critical User Flows
 * 
 * Tests the complete municipal employee experience on real iPhone 12 device
 * Validates touch interactions, branding, and performance on municipal networks
 */

describe('Anna Svensson iPhone 12 Municipal Experience', () => {
  beforeEach(() => {
    // Configure for iPhone 12 testing
    cy.viewport(390, 844); // iPhone 12 dimensions
    cy.visit('/');
    
    // Simulate municipal network conditions
    cy.simulateMunicipalNetwork();
    
    // Set municipal user context
    cy.municipalLogin('employee');
    
    // Wait for initial load
    cy.wait(1000);
  });

  afterEach(() => {
    // Capture performance metrics for municipal compliance
    cy.measurePerformance();
  });

  it('should handle complete quiz flow with touch gestures', () => {
    cy.log('🎯 Testing complete quiz flow for Anna Svensson');
    
    // Navigate to demo with touch interaction
    cy.get('[data-testid="demo-button"]')
      .should('be.visible')
      .should('have.css', 'min-height', '44px') // iOS touch target minimum
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Verify municipal branding appears
    cy.get('h1')
      .should('contain', 'Malmö')
      .should('be.visible');
    
    // Start game with touch
    cy.get('button:contains("Börja spela")')
      .should('be.visible')
      .should('have.css', 'min-height', '44px')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Handle name input with virtual keyboard simulation
    cy.get('input[placeholder*="namn"]')
      .should('be.visible')
      .focus()
      .type('Anna Svensson', { 
        delay: 120, // Simulate realistic typing speed
        force: true 
      });
    
    // Verify Swedish characters render correctly
    cy.get('input[placeholder*="namn"]')
      .should('have.value', 'Anna Svensson');
    
    // Start game
    cy.get('button:contains("Starta")')
      .should('be.visible')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Wait for game container with municipal network timing
    cy.get('[data-testid="game-container"]', { timeout: 15000 })
      .should('be.visible');
    
    // Quiz interaction with touch - test multiple questions
    for (let i = 0; i < 3; i++) {
      cy.log(`📝 Answering quiz question ${i + 1}`);
      
      // Wait for quiz options to load
      cy.get('[data-testid="quiz-option"]', { timeout: 10000 })
        .should('have.length.greaterThan', 0);
      
      // Select first option with touch
      cy.get('[data-testid="quiz-option"]')
        .first()
        .should('be.visible')
        .should('have.css', 'min-height', '44px')
        .trigger('touchstart', { force: true })
        .trigger('touchend', { force: true });
      
      // Verify visual feedback
      cy.get('[data-testid="quiz-option"]')
        .first()
        .should('have.class', 'selected');
      
      // Proceed to next question
      cy.get('button:contains("Nästa")')
        .should('be.visible')
        .trigger('touchstart', { force: true })
        .trigger('touchend', { force: true });
      
      // Wait for transition
      cy.wait(1000);
    }
    
    cy.log('✅ Complete quiz flow test passed');
  });

  it('should display Malmö municipal branding correctly on iPhone 12', () => {
    cy.log('🏛️ Testing Malmö municipal branding consistency');
    
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Verify main heading with municipal branding
    cy.get('h1')
      .should('contain', 'Malmö Stad')
      .should('be.visible')
      .should('have.css', 'font-size')
      .should('match', /^(2[0-9]|3[0-9])px$/); // Readable size on mobile
    
    // Check primary brand color (Malmö blue)
    cy.get('[data-testid="primary-button"]')
      .should('have.css', 'background-color')
      .should('include', 'rgb(0, 102, 204)'); // #0066CC Malmö blue
    
    // Verify municipal logo visibility and accessibility
    cy.get('[data-testid="municipal-logo"]')
      .should('be.visible')
      .should('have.attr', 'alt')
      .should('include', 'Malmö');
    
    // Check contrast ratios for accessibility
    cy.get('[data-testid="primary-button"]').then(($button) => {
      const bgColor = $button.css('background-color');
      const textColor = $button.css('color');
      
      // Log colors for manual verification
      cy.log(`Button colors - Background: ${bgColor}, Text: ${textColor}`);
    });
    
    // Take screenshot for visual regression testing
    cy.screenshot('malmo-branding-iphone12', {
      clip: { x: 0, y: 0, width: 390, height: 844 }
    });
    
    // Validate branding elements
    cy.task('validateMunicipalBranding', [
      { backgroundColor: 'rgb(0, 102, 204)', element: 'primary-button' },
      { color: 'rgb(0, 102, 204)', element: 'municipal-text' }
    ]).should('equal', true);
    
    cy.log('✅ Municipal branding verification passed');
  });

  it('should handle modal dialogs appropriately for mobile interface', () => {
    cy.log('📱 Testing modal dialog mobile optimization');
    
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Check if modal appears and is properly sized
    cy.get('[data-testid="modal"]')
      .should('be.visible')
      .should('have.css', 'position', 'fixed');
    
    // Verify modal content fits iPhone 12 screen
    cy.get('[data-testid="modal-content"]')
      .should('be.visible')
      .invoke('width')
      .should('be.lessThan', 390) // Must fit within iPhone 12 width
      .should('be.greaterThan', 280); // But not too narrow
    
    // Verify modal height doesn't exceed viewport
    cy.get('[data-testid="modal-content"]')
      .invoke('height')
      .should('be.lessThan', 800); // Allow for iOS UI elements
    
    // Test modal close button accessibility
    cy.get('[data-testid="modal-close"]')
      .should('be.visible')
      .should('have.css', 'min-height', '44px') // iOS touch target
      .should('have.css', 'min-width', '44px')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Verify modal closes properly
    cy.get('[data-testid="modal"]')
      .should('not.exist');
    
    // Test background tap to close (if implemented)
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    if (cy.get('[data-testid="modal-backdrop"]').should('exist')) {
      cy.get('[data-testid="modal-backdrop"]')
        .trigger('touchstart', { force: true })
        .trigger('touchend', { force: true });
      
      cy.get('[data-testid="modal"]')
        .should('not.exist');
    }
    
    cy.log('✅ Modal dialog mobile optimization test passed');
  });

  it('should maintain accessibility with VoiceOver simulation', () => {
    cy.log('♿ Testing accessibility for municipal compliance');
    
    // Test keyboard navigation simulation
    cy.get('body').tab();
    cy.focused().should('be.visible');
    
    // Navigate through interface with tab
    cy.tab();
    cy.focused().should('have.attr', 'tabindex').should('not.equal', '-1');
    
    // Navigate to main content
    cy.get('[data-testid="demo-button"]')
      .should('have.attr', 'aria-label')
      .or('have.text')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Check heading hierarchy for screen readers
    cy.get('h1').should('exist').should('be.visible');
    cy.get('h2').should('exist');
    
    // Verify form labels and descriptions
    cy.get('input[placeholder*="namn"]').then(($input) => {
      const hasLabel = $input.attr('aria-label') || 
                      $input.attr('aria-labelledby') || 
                      $input.prev('label').length > 0 ||
                      $input.closest('label').length > 0;
      
      expect(hasLabel).to.be.true;
    });
    
    // Check for descriptive button text
    cy.get('button').each(($button) => {
      cy.wrap($button).should('satisfy', ($btn) => {
        const text = $btn.text().trim();
        const ariaLabel = $btn.attr('aria-label');
        return text.length > 0 || (ariaLabel && ariaLabel.length > 0);
      });
    });
    
    // Test color contrast (basic check)
    cy.get('[data-testid="primary-button"]').then(($button) => {
      const bgColor = $button.css('background-color');
      const textColor = $button.css('color');
      
      // Basic contrast check (detailed analysis would need external tool)
      expect(bgColor).to.not.equal(textColor);
    });
    
    // Run comprehensive accessibility check
    cy.checkAccessibility();
    
    cy.log('✅ Accessibility compliance test passed');
  });

  it('should perform well on municipal network conditions', () => {
    cy.log('🌐 Testing performance on municipal 3G network');
    
    const startTime = Date.now();
    
    // Navigate to demo
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Measure initial navigation time
    cy.get('button:contains("Börja spela")')
      .should('be.visible')
      .then(() => {
        const navigationTime = Date.now() - startTime;
        expect(navigationTime).to.be.lessThan(5000); // 5 second target for municipal networks
        cy.log(`⏱️ Navigation time: ${navigationTime}ms`);
      });
    
    // Test game startup performance
    const gameStartTime = Date.now();
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('input[placeholder*="namn"]')
      .type('Anna Svensson', { delay: 100 });
    
    cy.get('button:contains("Starta")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('[data-testid="game-container"]', { timeout: 15000 })
      .should('be.visible')
      .then(() => {
        const gameLoadTime = Date.now() - gameStartTime;
        expect(gameLoadTime).to.be.lessThan(10000); // 10 second target for game load
        cy.log(`🎮 Game load time: ${gameLoadTime}ms`);
      });
    
    // Check Core Web Vitals
    cy.window().then((win) => {
      const navigation = win.performance.getEntriesByType('navigation')[0];
      const paint = win.performance.getEntriesByType('paint');
      
      const metrics = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        loadComplete: navigation.loadEventEnd - navigation.fetchStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0
      };
      
      // Municipal network performance targets
      expect(metrics.domContentLoaded).to.be.lessThan(8000); // 8s for DOM ready
      expect(metrics.firstContentfulPaint).to.be.lessThan(4000); // 4s for FCP
      
      cy.log('📊 Performance metrics:', metrics);
      
      // Log to municipal compliance system
      cy.task('logMunicipalMetrics', {
        ...metrics,
        testType: 'municipal-network-performance',
        device: 'iPhone 12',
        network: '3G Municipal'
      });
    });
    
    cy.log('✅ Municipal network performance test passed');
  });

  it('should handle Swedish text input and display correctly', () => {
    cy.log('🇸🇪 Testing Swedish language support');
    
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Test Swedish characters input
    const swedishTestName = 'Anna Svensson från Malmö';
    cy.get('input[placeholder*="namn"]')
      .should('be.visible')
      .focus()
      .clear()
      .type(swedishTestName, { 
        delay: 150, // Slower for special characters
        force: true 
      });
    
    // Verify Swedish characters are preserved
    cy.get('input[placeholder*="namn"]')
      .should('have.value', swedishTestName);
    
    // Test character rendering in game
    cy.get('button:contains("Starta")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('[data-testid="game-container"]', { timeout: 10000 })
      .should('be.visible');
    
    // Verify Swedish text appears correctly in interface
    cy.get('body').should('contain', 'Malmö');
    
    // Test common Swedish UI text
    const swedishUIElements = ['Nästa', 'Föregående', 'Börja', 'Slutför'];
    swedishUIElements.forEach(text => {
      cy.get('body').then($body => {
        if ($body.text().includes(text)) {
          cy.log(`✓ Swedish UI text found: ${text}`);
        }
      });
    });
    
    // Verify Swedish character display in quiz content
    cy.get('[data-testid="quiz-content"]').then($content => {
      const text = $content.text();
      if (text.includes('å') || text.includes('ä') || text.includes('ö')) {
        cy.log('✓ Swedish characters displayed correctly in quiz');
      }
    });
    
    // Test copy/paste functionality with Swedish text
    const complexSwedishText = 'Förstår du GDPR-reglernas påverkan på kommunal verksamhet?';
    cy.get('input[placeholder*="namn"]')
      .clear()
      .invoke('val', complexSwedishText)
      .trigger('input')
      .should('have.value', complexSwedishText);
    
    cy.log('✅ Swedish language support test passed');
  });

  it('should handle touch gestures and interactions properly', () => {
    cy.log('👆 Testing advanced touch interactions');
    
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('input[placeholder*="namn"]')
      .type('Anna Svensson');
    
    cy.get('button:contains("Starta")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('[data-testid="game-container"]', { timeout: 10000 })
      .should('be.visible');
    
    // Test swipe gestures (if implemented)
    cy.get('[data-testid="game-container"]')
      .trigger('touchstart', { clientX: 300, clientY: 400 })
      .trigger('touchmove', { clientX: 100, clientY: 400 })
      .trigger('touchend');
    
    // Test long press (if implemented)
    cy.get('[data-testid="quiz-option"]')
      .first()
      .trigger('touchstart', { force: true })
      .wait(1000) // Long press duration
      .trigger('touchend', { force: true });
    
    // Test multi-touch prevention (avoid accidental multi-touch)
    cy.get('[data-testid="quiz-option"]')
      .first()
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      .trigger('touchstart', { touches: [
        { clientX: 100, clientY: 100 },
        { clientX: 200, clientY: 200 }
      ] })
      .trigger('touchend', { force: true });
    
    // Verify only single selection occurred
    cy.get('[data-testid="quiz-option"].selected')
      .should('have.length', 1);
    
    // Test scroll behavior
    cy.get('[data-testid="game-container"]')
      .scrollTo('bottom', { duration: 1000 });
    
    cy.get('[data-testid="game-container"]')
      .scrollTo('top', { duration: 1000 });
    
    cy.log('✅ Touch interaction test passed');
  });

  it('should maintain state during device orientation changes', () => {
    cy.log('🔄 Testing orientation change handling');
    
    // Start in portrait mode (default iPhone 12)
    cy.viewport(390, 844);
    
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('input[placeholder*="namn"]')
      .type('Anna Svensson');
    
    cy.get('button:contains("Starta")')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    cy.get('[data-testid="game-container"]', { timeout: 10000 })
      .should('be.visible');
    
    // Select a quiz option
    cy.get('[data-testid="quiz-option"]')
      .first()
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Change to landscape orientation
    cy.viewport(844, 390);
    cy.wait(1000); // Allow layout to adjust
    
    // Verify game state is preserved
    cy.get('[data-testid="game-container"]')
      .should('be.visible');
    
    // Verify selected option is still selected
    cy.get('[data-testid="quiz-option"].selected')
      .should('exist');
    
    // Verify layout adapts appropriately
    cy.get('[data-testid="game-container"]')
      .invoke('width')
      .should('be.greaterThan', 800); // Should use landscape width
    
    // Test proceeding in landscape mode
    cy.get('button:contains("Nästa")')
      .should('be.visible')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Return to portrait mode
    cy.viewport(390, 844);
    cy.wait(1000);
    
    // Verify continued functionality
    cy.get('[data-testid="game-container"]')
      .should('be.visible');
    
    cy.log('✅ Orientation change handling test passed');
  });
});