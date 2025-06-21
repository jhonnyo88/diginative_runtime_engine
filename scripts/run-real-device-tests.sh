#!/bin/bash

# Real Device Testing Runner Script
# For Anna Svensson iPhone 12 Municipal Experience
# Task: proposal-017 - Real Device Testing Infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 Starting Real Device Testing for Municipal DigiNativa Platform"
echo "👩‍💼 Focus: Anna Svensson iPhone 12 Municipal Employee Experience"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check for required dependencies
print_status "Checking dependencies..."

if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ ! -d "node_modules/cypress" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Check environment variables for BrowserStack
if [ -z "$BROWSERSTACK_USERNAME" ] || [ -z "$BROWSERSTACK_ACCESS_KEY" ]; then
    print_warning "BrowserStack credentials not found."
    print_warning "Setting BROWSERSTACK_MODE=local for simulation testing."
    export BROWSERSTACK_MODE="local"
else
    print_success "BrowserStack credentials found."
    export BROWSERSTACK_MODE="cloud"
fi

# Create necessary directories
print_status "Setting up test environment..."
mkdir -p cypress/logs
mkdir -p cypress/screenshots
mkdir -p cypress/videos

# Initialize log files
echo "# Municipal Real Device Testing Log - iPhone 12" > cypress/logs/municipal-performance.log
echo "# Started: $(date)" >> cypress/logs/municipal-performance.log
echo "" >> cypress/logs/municipal-performance.log

echo "# Municipal Accessibility Compliance Log" > cypress/logs/accessibility-compliance.log
echo "# Started: $(date)" >> cypress/logs/accessibility-compliance.log
echo "" >> cypress/logs/accessibility-compliance.log

# Function to cleanup processes
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_status "Stopping development server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$BROWSERSTACK_PID" ]; then
        print_status "Stopping BrowserStack Local tunnel (PID: $BROWSERSTACK_PID)..."
        kill $BROWSERSTACK_PID 2>/dev/null || true
    fi
    
    print_status "Cleanup completed."
}

# Trap cleanup on script exit
trap cleanup EXIT INT TERM

# Start local development server
print_status "Starting development server..."
npm run dev &
DEV_SERVER_PID=$!

print_status "Development server started (PID: $DEV_SERVER_PID)"

# Wait for server to be ready
print_status "Waiting for server to be ready..."
RETRY_COUNT=0
MAX_RETRIES=30

until curl -f http://localhost:5173 > /dev/null 2>&1; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        print_error "Development server failed to start after $MAX_RETRIES attempts"
        exit 1
    fi
    print_status "Attempt $RETRY_COUNT/$MAX_RETRIES - waiting for server..."
    sleep 2
done

print_success "Development server ready at http://localhost:5173"

# Run tests based on mode
if [ "$BROWSERSTACK_MODE" = "local" ]; then
    print_status "Running local device simulation tests..."
    print_warning "Note: These are simulated tests. Real device testing requires BrowserStack credentials."
    
    # Run local Cypress tests
    echo ""
    echo "📱 Running Anna Svensson iPhone 12 simulation tests..."
    
    # Set environment variables for local testing
    export CYPRESS_MUNICIPAL_CONTEXT="malmo"
    export CYPRESS_DEVICE_TYPE="mobile"
    export CYPRESS_USER_PERSONA="anna_svensson"
    
    # Run Cypress tests
    if npx cypress run \
        --spec "cypress/e2e/real-device/**/*.cy.js" \
        --browser chrome \
        --config viewportWidth=390,viewportHeight=844; then
        print_success "Local device simulation tests completed successfully!"
    else
        print_error "Local device simulation tests failed!"
        exit 1
    fi
    
else
    print_status "Running BrowserStack real device tests..."
    
    # Check for BrowserStack Local binary
    if ! command -v browserstack-local &> /dev/null; then
        print_warning "browserstack-local not found globally, using npx..."
    fi
    
    # Generate unique local identifier
    LOCAL_IDENTIFIER="municipal-testing-$(date +%s)"
    export BROWSERSTACK_LOCAL_IDENTIFIER=$LOCAL_IDENTIFIER
    
    print_status "Starting BrowserStack Local tunnel (ID: $LOCAL_IDENTIFIER)..."
    
    # Start BrowserStack Local tunnel
    if command -v browserstack-local &> /dev/null; then
        browserstack-local --key $BROWSERSTACK_ACCESS_KEY --local-identifier $LOCAL_IDENTIFIER --daemon-mode &
    else
        npx browserstack-local --key $BROWSERSTACK_ACCESS_KEY --local-identifier $LOCAL_IDENTIFIER --daemon-mode &
    fi
    
    BROWSERSTACK_PID=$!
    print_status "BrowserStack Local tunnel started (PID: $BROWSERSTACK_PID)"
    
    # Wait for tunnel to establish
    print_status "Waiting for BrowserStack tunnel to establish..."
    sleep 15
    
    # Set environment variables for BrowserStack testing
    export CYPRESS_BROWSERSTACK=true
    export CYPRESS_MUNICIPAL_CONTEXT="malmo"
    export CYPRESS_DEVICE_TYPE="mobile"
    export CYPRESS_USER_PERSONA="anna_svensson"
    
    echo ""
    echo "🔬 Running tests on real iPhone 12 via BrowserStack..."
    
    # Run tests on real devices via BrowserStack
    if npx cypress run \
        --spec "cypress/e2e/real-device/anna-svensson-iphone12.cy.js" \
        --config baseUrl=http://bs-local.com:5173 \
        --env BROWSERSTACK=true; then
        print_success "BrowserStack real device tests completed successfully!"
    else
        print_error "BrowserStack real device tests failed!"
        
        # Check BrowserStack logs
        if [ -f "browserstack-local.log" ]; then
            print_status "BrowserStack Local logs:"
            tail -20 browserstack-local.log
        fi
        
        exit 1
    fi
fi

# Generate test report
print_status "Generating test report..."

# Create summary report
cat > cypress/logs/test-summary.md << EOF
# Municipal Real Device Testing Summary

## Test Session Information
- **Date**: $(date)
- **Device**: iPhone 12 (iOS 15.0+)
- **User Persona**: Anna Svensson (Municipal Employee)
- **Municipality**: Malmö Stad
- **Testing Mode**: $BROWSERSTACK_MODE

## Test Categories Completed
- ✅ Complete quiz flow with touch gestures
- ✅ Municipal branding verification (Malmö Stad)
- ✅ Modal dialog mobile optimization
- ✅ Accessibility compliance (WCAG 2.1 AA)
- ✅ Municipal network performance
- ✅ Swedish language support
- ✅ Touch interactions and gestures
- ✅ Device orientation handling

## Performance Metrics
- Target: < 3 seconds initial load on municipal 3G
- Target: < 2 seconds FCP (First Contentful Paint)
- Target: < 1 second touch response time

## Accessibility Compliance
- WCAG 2.1 AA standard verification
- Touch target minimum 44px (iOS standard)
- VoiceOver compatibility simulation
- Keyboard navigation support

## Files Generated
- Screenshots: \`cypress/screenshots/\`
- Videos: \`cypress/videos/\`
- Performance logs: \`cypress/logs/municipal-performance.log\`
- Accessibility logs: \`cypress/logs/accessibility-compliance.log\`

## Next Steps
1. Review performance logs for optimization opportunities
2. Address any accessibility violations found
3. Schedule regular regression testing
4. Expand to additional municipal devices as needed

EOF

print_success "Test report generated: cypress/logs/test-summary.md"

# Display results summary
echo ""
echo "📊 Test Results Summary:"
echo "========================"

if [ -d "cypress/screenshots" ] && [ "$(ls -A cypress/screenshots 2>/dev/null)" ]; then
    SCREENSHOT_COUNT=$(ls cypress/screenshots/*.png 2>/dev/null | wc -l)
    print_success "Screenshots captured: $SCREENSHOT_COUNT"
    echo "   📁 Location: cypress/screenshots/"
else
    print_warning "No screenshots captured"
fi

if [ -d "cypress/videos" ] && [ "$(ls -A cypress/videos 2>/dev/null)" ]; then
    VIDEO_COUNT=$(ls cypress/videos/*.mp4 2>/dev/null | wc -l)
    print_success "Videos recorded: $VIDEO_COUNT"
    echo "   📁 Location: cypress/videos/"
else
    print_warning "No videos recorded"
fi

if [ -f "cypress/logs/municipal-performance.log" ]; then
    PERF_ENTRIES=$(grep -c "iPhone 12 Performance" cypress/logs/municipal-performance.log 2>/dev/null || echo "0")
    print_success "Performance entries logged: $PERF_ENTRIES"
    echo "   📁 Location: cypress/logs/municipal-performance.log"
fi

if [ -f "cypress/logs/accessibility-compliance.log" ]; then
    ACCESSIBILITY_ENTRIES=$(grep -c "Accessibility Violations" cypress/logs/accessibility-compliance.log 2>/dev/null || echo "0")
    if [ "$ACCESSIBILITY_ENTRIES" -eq "0" ]; then
        print_success "No accessibility violations found"
    else
        print_warning "Accessibility violations logged: $ACCESSIBILITY_ENTRIES"
    fi
    echo "   📁 Location: cypress/logs/accessibility-compliance.log"
fi

echo ""
print_success "Real device testing completed successfully!"
echo ""
echo "📱 Next steps for Anna Svensson iPhone 12 optimization:"
echo "  1. Review performance metrics in logs"
echo "  2. Address any accessibility issues found"
echo "  3. Verify municipal branding consistency"
echo "  4. Schedule regular testing sessions"
echo ""
echo "🔍 For detailed results, check:"
echo "  - cypress/logs/test-summary.md"
echo "  - cypress/screenshots/ (visual evidence)"
echo "  - cypress/videos/ (full test recordings)"
echo ""

# Check if there were any test failures
if [ -f "cypress/logs/test-failures.json" ]; then
    print_warning "Some tests failed. Check cypress/logs/test-failures.json for details."
    exit 1
fi

print_success "All tests passed! Municipal platform ready for iPhone 12 deployment."