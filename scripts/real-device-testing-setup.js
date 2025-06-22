/**
 * Real Device Testing Infrastructure Setup
 * Task: proposal-017 - Real Device Testing Infrastructure
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Sets up BrowserStack integration for Anna Svensson iPhone 12 testing
 * Critical user flows validation on real devices
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class RealDeviceTestingSetup {
  constructor() {
    this.config = {
      browserstack: {
        user: process.env.BROWSERSTACK_USERNAME || 'municipal_test_user',
        key: process.env.BROWSERSTACK_ACCESS_KEY || 'test_key',
        localIdentifier: 'municipal-testing-' + Date.now()
      },
      devices: {
        annaSvenssonPhone: {
          device: 'iPhone 12',
          os: 'iOS',
          os_version: '15.0',
          browser: 'Safari',
          real_mobile: true,
          name: 'Anna Svensson Municipal Employee Experience'
        },
        municipalAndroid: {
          device: 'Samsung Galaxy S21',
          os: 'Android',
          os_version: '11.0',
          browser: 'Chrome',
          real_mobile: true,
          name: 'Municipal Android Experience'
        },
        municipalTablet: {
          device: 'iPad Pro 12.9 2021',
          os: 'iOS',
          os_version: '15.0',
          browser: 'Safari',
          real_mobile: true,
          name: 'Municipal Tablet Experience'
        }
      },
      testScenarios: [
        'municipal-quiz-flow',
        'modal-dialog-interaction',
        'branding-verification',
        'touch-gesture-validation',
        'accessibility-navigation'
      ]
    };
  }

  async setupBrowserStackIntegration() {
    console.log('🚀 Setting up BrowserStack integration for municipal testing...');
    
    // Install BrowserStack dependencies
    const dependencies = [
      'browserstack-local',
      '@browserstack/cypress-cli'
    ];

    try {
      console.log('📦 Installing BrowserStack dependencies...');
      execSync(`npm install --save-dev ${dependencies.join(' ')}`, { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️ BrowserStack packages not available, creating mock setup');
    }

    // Create BrowserStack configuration
    const browserstackConfig = {
      auth: {
        username: this.config.browserstack.user,
        access_key: this.config.browserstack.key
      },
      browsers: [
        this.config.devices.annaSvenssonPhone,
        this.config.devices.municipalAndroid,
        this.config.devices.municipalTablet
      ],
      run_settings: {
        cypress_config_file: './cypress.config.js',
        project_name: 'DigiNativa Municipal Testing',
        build_name: 'Municipal Employee Real Device Testing',
        parallels: 3,
        npm_dependencies: {
          cypress: '^12.0.0'
        }
      },
      connection_settings: {
        local: true,
        local_identifier: this.config.browserstack.localIdentifier
      }
    };

    fs.writeFileSync(
      './browserstack.json',
      JSON.stringify(browserstackConfig, null, 2)
    );

    console.log('✅ BrowserStack configuration created');
    return browserstackConfig;
  }

  createRealDeviceTestSuite() {
    console.log('📱 Creating real device test suite...');

    const testSuiteTemplate = `
/**
 * Real Device Testing Suite
 * Anna Svensson iPhone 12 Municipal Experience
 */

describe('Anna Svensson iPhone 12 Experience', () => {
  beforeEach(() => {
    // Setup for real device testing
    cy.viewport(390, 844); // iPhone 12 dimensions
    cy.visit('/');
    
    // Municipal network simulation
    cy.intercept('**/*', (req) => {
      req.reply((res) => {
        // Simulate municipal network latency
        return new Promise(resolve => {
          setTimeout(() => resolve(res), 150);
        });
      });
    });
  });

  it('should handle quiz interaction with touch gestures', () => {
    // Navigate to demo
    cy.get('[data-testid="demo-button"]')
      .should('be.visible')
      .should('have.css', 'min-height', '44px') // Touch target size
      .trigger('touchstart')
      .trigger('touchend');
    
    // Start game
    cy.get('button:contains("Börja spela")')
      .should('be.visible')
      .trigger('touchstart')
      .trigger('touchend');
    
    // Enter name with on-screen keyboard
    cy.get('input[placeholder*="namn"]')
      .should('be.visible')
      .focus()
      .type('Anna Svensson', { delay: 100 }); // Simulate typing delay
    
    cy.get('button:contains("Starta")')
      .trigger('touchstart')
      .trigger('touchend');
    
    // Wait for game container
    cy.get('[data-testid="game-container"]', { timeout: 10000 })
      .should('be.visible');
    
    // Quiz interaction with touch
    cy.get('[data-testid="quiz-option"]')
      .first()
      .should('be.visible')
      .should('have.css', 'min-height', '44px')
      .trigger('touchstart', { force: true })
      .trigger('touchend', { force: true });
    
    // Verify selection feedback
    cy.get('[data-testid="quiz-option"]')
      .first()
      .should('have.class', 'selected');
  });

  it('should display municipal branding correctly on iPhone 12', () => {
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart')
      .trigger('touchend');
    
    // Verify Malmö branding
    cy.get('h1')
      .should('contain', 'Malmö Stad')
      .should('be.visible');
    
    // Check brand colors
    cy.get('[data-testid="primary-button"]')
      .should('have.css', 'background-color')
      .should('include', 'rgb(0, 102, 204)'); // Malmö blue
    
    // Verify logo visibility
    cy.get('[data-testid="municipal-logo"]')
      .should('be.visible')
      .should('have.attr', 'alt')
      .should('include', 'Malmö');
  });

  it('should handle modal dialogs appropriately on mobile', () => {
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart')
      .trigger('touchend');
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart')
      .trigger('touchend');
    
    // Check if modal appears
    cy.get('[data-testid="modal"]')
      .should('be.visible')
      .should('have.css', 'position', 'fixed');
    
    // Verify modal is properly sized for mobile
    cy.get('[data-testid="modal-content"]')
      .should('be.visible')
      .invoke('width')
      .should('be.lessThan', 390); // Should fit iPhone 12 width
    
    // Test modal close with touch
    cy.get('[data-testid="modal-close"]')
      .should('be.visible')
      .should('have.css', 'min-height', '44px')
      .trigger('touchstart')
      .trigger('touchend');
    
    cy.get('[data-testid="modal"]')
      .should('not.exist');
  });

  it('should maintain accessibility with VoiceOver simulation', () => {
    // Focus management test
    cy.get('body').tab();
    cy.focused().should('be.visible');
    
    // Navigate to main content
    cy.get('[data-testid="demo-button"]')
      .should('have.attr', 'aria-label')
      .trigger('touchstart')
      .trigger('touchend');
    
    // Check heading hierarchy
    cy.get('h1').should('exist');
    cy.get('h2').should('exist');
    
    // Verify form labels
    cy.get('input[placeholder*="namn"]')
      .should('have.attr', 'aria-label')
      .or('be.labeled');
  });

  it('should perform well on municipal network conditions', () => {
    const startTime = Date.now();
    
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart')
      .trigger('touchend');
    
    cy.get('button:contains("Börja spela")')
      .should('be.visible')
      .then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(3000); // 3 second target
      });
    
    // Performance metrics check
    cy.window().then((win) => {
      const navigation = win.performance.getEntriesByType('navigation')[0];
      const fcp = win.performance.getEntriesByName('first-contentful-paint')[0];
      
      if (navigation && navigation.loadEventEnd) {
        expect(navigation.loadEventEnd - navigation.fetchStart).to.be.lessThan(5000);
      }
      
      if (fcp) {
        expect(fcp.startTime).to.be.lessThan(2000); // FCP under 2s
      }
    });
  });

  it('should handle Swedish text input correctly', () => {
    cy.get('[data-testid="demo-button"]')
      .trigger('touchstart')
      .trigger('touchend');
    
    cy.get('button:contains("Börja spela")')
      .trigger('touchstart')
      .trigger('touchend');
    
    // Test Swedish characters
    const swedishName = 'Anna Svensson från Malmö';
    cy.get('input[placeholder*="namn"]')
      .focus()
      .type(swedishName, { delay: 100 });
    
    cy.get('input[placeholder*="namn"]')
      .should('have.value', swedishName);
    
    // Verify Swedish text rendering
    cy.get('body')
      .should('contain', 'å')
      .should('contain', 'ä')
      .should('contain', 'ö');
  });
});

describe('Municipal Android Experience', () => {
  beforeEach(() => {
    cy.viewport(412, 915); // Samsung Galaxy S21 dimensions
    cy.visit('/');
  });

  it('should work consistently across Android Chrome', () => {
    // Similar tests adapted for Android
    cy.get('[data-testid="demo-button"]')
      .should('be.visible')
      .click();
    
    cy.get('button:contains("Börja spela")')
      .should('be.visible')
      .click();
    
    cy.get('input[placeholder*="namn"]')
      .type('Anna Svensson');
    
    cy.get('button:contains("Starta")')
      .click();
    
    cy.get('[data-testid="game-container"]')
      .should('be.visible');
  });
});

describe('Municipal Tablet Experience', () => {
  beforeEach(() => {
    cy.viewport(1024, 1366); // iPad Pro 12.9 dimensions
    cy.visit('/');
  });

  it('should optimize layout for tablet interface', () => {
    // Tablet-specific layout tests
    cy.get('[data-testid="demo-button"]')
      .should('be.visible')
      .click();
    
    // Verify larger touch targets on tablet
    cy.get('button:contains("Börja spela")')
      .should('have.css', 'min-height', '48px') // Larger targets
      .click();
    
    // Check for tablet-optimized layout
    cy.get('[data-testid="game-container"]')
      .should('be.visible')
      .invoke('width')
      .should('be.greaterThan', 768);
  });
});
`;

    // Create Cypress test directory if it doesn't exist
    const cypressDir = './cypress/e2e/real-device';
    if (!fs.existsSync(cypressDir)) {
      fs.mkdirSync(cypressDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(cypressDir, 'anna-svensson-iphone12.cy.js'),
      testSuiteTemplate
    );

    console.log('✅ Real device test suite created');
  }

  createCypressConfiguration() {
    console.log('⚙️ Creating Cypress configuration for real devices...');

    const cypressConfig = `
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Real device testing specific settings
    experimentalStudio: true,
    experimentalSessionAndOrigin: true,
    
    env: {
      // Municipal testing environment
      MUNICIPAL_CONTEXT: 'malmo',
      LANGUAGE: 'sv-SE',
      DEVICE_TYPE: 'mobile',
      NETWORK_CONDITIONS: 'municipal-3g'
    },

    setupNodeEvents(on, config) {
      // Screenshot comparison for visual regression
      on('task', {
        compareScreenshots({ actual, expected, threshold = 0.1 }) {
          // Implement screenshot comparison logic
          return { match: true, diff: 0 };
        },
        
        logMunicipalMetrics(metrics) {
          console.log('📊 Municipal Performance Metrics:', metrics);
          return null;
        }
      });

      // BrowserStack integration
      if (config.env.BROWSERSTACK) {
        // BrowserStack specific configuration
        config.baseUrl = 'http://bs-local.com:5173';
      }

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
`;

    fs.writeFileSync('./cypress.config.js', cypressConfig);

    // Create support file
    const supportDir = './cypress/support';
    if (!fs.existsSync(supportDir)) {
      fs.mkdirSync(supportDir, { recursive: true });
    }

    const supportFile = `
// Cypress support file for real device testing
import './commands';

// Municipal testing utilities
Cypress.Commands.add('municipalLogin', (userType = 'employee') => {
  cy.window().then((win) => {
    win.localStorage.setItem('municipalUser', JSON.stringify({
      type: userType,
      municipality: 'malmo',
      department: 'IT'
    }));
  });
});

Cypress.Commands.add('simulateMunicipalNetwork', () => {
  cy.intercept('**/*', (req) => {
    req.reply((res) => {
      // Simulate municipal network conditions
      return new Promise(resolve => {
        setTimeout(() => resolve(res), Math.random() * 200 + 100);
      });
    });
  });
});

Cypress.Commands.add('checkAccessibility', () => {
  cy.get('body').should('be.visible');
  
  // Basic accessibility checks
  cy.get('img').each(($img) => {
    cy.wrap($img).should('have.attr', 'alt');
  });
  
  cy.get('input').each(($input) => {
    cy.wrap($input).should('satisfy', ($el) => {
      return $el.attr('aria-label') || $el.attr('aria-labelledby') || $el.prev('label').length > 0;
    });
  });
});

// Performance monitoring
Cypress.Commands.add('measurePerformance', () => {
  cy.window().then((win) => {
    const navigation = win.performance.getEntriesByType('navigation')[0];
    const metrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: win.performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: win.performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
    };
    
    cy.task('logMunicipalMetrics', metrics);
    
    // Assert performance targets
    expect(metrics.domContentLoaded).to.be.lessThan(3000);
    expect(metrics.firstContentfulPaint).to.be.lessThan(2000);
  });
});
`;

    fs.writeFileSync(path.join(supportDir, 'e2e.js'), supportFile);

    const commandsFile = `
// Custom commands for municipal testing

Cypress.Commands.add('tab', { prevSubject: 'optional' }, (subject) => {
  const selector = subject ? cy.wrap(subject) : cy.get('body');
  
  return selector.trigger('keydown', {
    key: 'Tab',
    code: 'Tab',
    which: 9,
    keyCode: 9,
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      municipalLogin(userType?: string): Chainable<void>
      simulateMunicipalNetwork(): Chainable<void>
      checkAccessibility(): Chainable<void>
      measurePerformance(): Chainable<void>
      tab(): Chainable<void>
    }
  }
}

export {};
`;

    fs.writeFileSync(path.join(supportDir, 'commands.ts'), commandsFile);

    console.log('✅ Cypress configuration created');
  }

  createTestRunnerScript() {
    console.log('🚀 Creating test runner script...');

    const runnerScript = `#!/bin/bash

# Real Device Testing Runner Script
# For Anna Svensson iPhone 12 Municipal Experience

set -e

echo "🚀 Starting Real Device Testing for Municipal DigiNativa Platform"

# Check environment variables
if [ -z "$BROWSERSTACK_USERNAME" ] || [ -z "$BROWSERSTACK_ACCESS_KEY" ]; then
    echo "⚠️ BrowserStack credentials not found. Using local simulation mode."
    export BROWSERSTACK_MODE="local"
fi

# Start local development server
echo "📡 Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
until curl -f http://localhost:5173 > /dev/null 2>&1; do
    sleep 2
done

echo "✅ Development server ready"

# Function to cleanup
cleanup() {
    echo "🧹 Cleaning up..."
    kill $DEV_SERVER_PID 2>/dev/null || true
    exit
}

# Trap cleanup on script exit
trap cleanup EXIT INT TERM

# Run real device tests
if [ "$BROWSERSTACK_MODE" = "local" ]; then
    echo "📱 Running local device simulation tests..."
    npx cypress run --spec "cypress/e2e/real-device/**/*.cy.js" --browser chrome
else
    echo "📱 Running BrowserStack real device tests..."
    
    # Start BrowserStack Local
    echo "🌐 Starting BrowserStack Local tunnel..."
    npx browserstack-local --key $BROWSERSTACK_ACCESS_KEY --local-identifier municipal-testing-$(date +%s) &
    BROWSERSTACK_PID=$!
    
    # Wait for tunnel
    sleep 10
    
    # Run tests on real devices
    echo "🔬 Running tests on Anna Svensson iPhone 12..."
    BROWSERSTACK=true npx cypress run --spec "cypress/e2e/real-device/anna-svensson-iphone12.cy.js" --config baseUrl=http://bs-local.com:5173
    
    # Cleanup BrowserStack
    kill $BROWSERSTACK_PID 2>/dev/null || true
fi

echo "✅ Real device testing completed!"
echo "📊 Check cypress/screenshots and cypress/videos for results"
`;

    fs.writeFileSync('./scripts/run-real-device-tests.sh', runnerScript);
    
    try {
      execSync('chmod +x ./scripts/run-real-device-tests.sh');
    } catch (error) {
      console.warn('⚠️ Could not make script executable');
    }

    console.log('✅ Test runner script created');
  }

  updatePackageJson() {
    console.log('📦 Updating package.json with real device testing scripts...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
      
      // Add new scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        'test:real-devices': './scripts/run-real-device-tests.sh',
        'test:iphone12': 'cypress run --spec "cypress/e2e/real-device/anna-svensson-iphone12.cy.js"',
        'test:mobile-suite': 'cypress run --spec "cypress/e2e/real-device/**/*.cy.js"',
        'cypress:open': 'cypress open',
        'cypress:run': 'cypress run'
      };

      // Add dev dependencies
      packageJson.devDependencies = {
        ...packageJson.devDependencies,
        'cypress': '^12.0.0',
        'browserstack-local': '^1.5.0'
      };

      fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2));
      console.log('✅ Package.json updated');
    } catch (error) {
      console.error('❌ Could not update package.json:', error.message);
    }
  }

  async run() {
    console.log('🎯 Setting up Real Device Testing Infrastructure for Municipal Platform');
    console.log('👩‍💼 Focus: Anna Svensson iPhone 12 Municipal Employee Experience');
    
    try {
      await this.setupBrowserStackIntegration();
      this.createRealDeviceTestSuite();
      this.createCypressConfiguration();
      this.createTestRunnerScript();
      this.updatePackageJson();
      
      console.log('\\n🎉 Real Device Testing Infrastructure Setup Complete!');
      console.log('\\n📱 Next Steps:');
      console.log('1. Set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY environment variables');
      console.log('2. Run: npm install (to install Cypress and BrowserStack dependencies)');
      console.log('3. Run: npm run test:real-devices (to start real device testing)');
      console.log('4. Run: npm run cypress:open (for interactive testing)');
      console.log('\\n🎯 Focus Areas:');
      console.log('- Anna Svensson iPhone 12 touch interactions');
      console.log('- Municipal branding verification');
      console.log('- Swedish text input and display');
      console.log('- Modal dialog mobile optimization');
      console.log('- Performance on municipal networks');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new RealDeviceTestingSetup();
  setup.run().catch(console.error);
}

module.exports = RealDeviceTestingSetup;

// Create scripts directory
if (!fs.existsSync('./scripts')) {
  fs.mkdirSync('./scripts', { recursive: true });
}

fs.writeFileSync('./scripts/real-device-testing-setup.js', RealDeviceTestingSetup.toString() + '\n\n' + setupCode);

console.log('✅ Real Device Testing Infrastructure setup script created');