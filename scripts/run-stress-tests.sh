#!/bin/bash

# AI Content Stress Testing Runner
# Task: proposal-029 - AI Content Stress Testing Framework
# 
# Orchestrates stress testing for peak municipal traffic scenarios

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
STRESS_TEST_DIR="src/tests/stress"
REPORTS_DIR="stress-test-reports"
K6_IMAGE="grafana/k6:latest"
BASE_URL="${BASE_URL:-http://localhost:5173}"
WS_URL="${WS_URL:-ws://localhost:5173/ws}"

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

print_header() {
    echo -e "${PURPLE}$1${NC}"
}

# Function to check if K6 is available
check_k6() {
    if command -v k6 &> /dev/null; then
        print_success "K6 found locally"
        return 0
    elif command -v docker &> /dev/null; then
        print_warning "K6 not found locally, will use Docker"
        return 1
    else
        print_error "Neither K6 nor Docker found. Please install one of them."
        echo "K6 installation: https://k6.io/docs/getting-started/installation/"
        echo "Docker installation: https://docs.docker.com/get-docker/"
        exit 1
    fi
}

# Function to run K6 test
run_k6_test() {
    local test_file="$1"
    local test_name="$2"
    local additional_opts="$3"
    local use_docker="$4"
    
    print_header "🚀 Running $test_name"
    echo "=================================================="
    
    # Create reports directory
    mkdir -p "$REPORTS_DIR"
    
    local report_file="$REPORTS_DIR/${test_name}-$(date +%Y%m%d_%H%M%S).json"
    local html_report="$REPORTS_DIR/${test_name}-$(date +%Y%m%d_%H%M%S).html"
    
    if [ "$use_docker" = true ]; then
        print_status "Running with Docker..."
        docker run --rm -i \
            -v "$(pwd):/app" \
            -w /app \
            -e BASE_URL="$BASE_URL" \
            -e WS_URL="$WS_URL" \
            --network="host" \
            $K6_IMAGE run \
            --out json="$report_file" \
            $additional_opts \
            "$test_file"
    else
        print_status "Running with local K6..."
        BASE_URL="$BASE_URL" WS_URL="$WS_URL" k6 run \
            --out json="$report_file" \
            $additional_opts \
            "$test_file"
    fi
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_success "$test_name completed successfully"
        
        # Generate HTML report if available
        if [ -f "$report_file" ] && command -v k6 &> /dev/null; then
            print_status "Generating HTML report..."
            k6 run --out web-dashboard="$html_report" --iterations 1 --vus 1 "$test_file" || true
        fi
        
        # Parse and display key metrics
        if [ -f "$report_file" ]; then
            print_status "Key metrics:"
            echo "  📊 Report: $report_file"
            
            # Extract key metrics using jq if available
            if command -v jq &> /dev/null; then
                local http_req_duration=$(jq -r '.metrics.http_req_duration.values.avg // "N/A"' "$report_file" 2>/dev/null)
                local http_req_failed=$(jq -r '.metrics.http_req_failed.values.rate // "N/A"' "$report_file" 2>/dev/null)
                local vus_max=$(jq -r '.metrics.vus_max.values.max // "N/A"' "$report_file" 2>/dev/null)
                
                echo "  ⏱️  Average response time: ${http_req_duration}ms"
                echo "  ❌ Failed requests rate: ${http_req_failed}%"
                echo "  👥 Max virtual users: $vus_max"
            fi
        fi
    else
        print_error "$test_name failed with exit code $exit_code"
        return $exit_code
    fi
}

# Function to check if development server is running
check_dev_server() {
    print_status "Checking if development server is running..."
    
    if curl -f "$BASE_URL" > /dev/null 2>&1; then
        print_success "Development server is running at $BASE_URL"
        return 0
    else
        print_warning "Development server not detected at $BASE_URL"
        return 1
    fi
}

# Function to start development server if needed
start_dev_server() {
    if ! check_dev_server; then
        print_status "Starting development server..."
        
        if [ -f "package.json" ]; then
            npm run dev &
            DEV_SERVER_PID=$!
            
            print_status "Waiting for server to be ready..."
            local retries=0
            local max_retries=30
            
            while [ $retries -lt $max_retries ]; do
                if curl -f "$BASE_URL" > /dev/null 2>&1; then
                    print_success "Development server ready"
                    return 0
                fi
                
                sleep 2
                retries=$((retries + 1))
                print_status "Waiting... ($retries/$max_retries)"
            done
            
            print_error "Failed to start development server"
            return 1
        else
            print_error "package.json not found. Please run from project root."
            return 1
        fi
    fi
}

# Function to run pre-stress checks
run_pre_checks() {
    print_header "🔍 Running Pre-Stress Checks"
    echo "================================"
    
    # Check system resources
    print_status "Checking system resources..."
    
    # Check available memory
    if command -v free &> /dev/null; then
        local available_mem=$(free -m | awk 'NR==2{printf "%.1f", $7/1024}')
        echo "  💾 Available memory: ${available_mem}GB"
        
        if (( $(echo "$available_mem < 2.0" | bc -l) )); then
            print_warning "Low available memory. Consider closing other applications."
        fi
    fi
    
    # Check CPU usage
    if command -v top &> /dev/null; then
        local cpu_idle=$(top -bn1 | grep "Cpu(s)" | awk '{print $8}' | sed 's/%id,//')
        echo "  🖥️  CPU idle: ${cpu_idle}%"
    fi
    
    # Check disk space
    local disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    echo "  💿 Disk usage: ${disk_usage}%"
    
    if [ "$disk_usage" -gt 90 ]; then
        print_warning "High disk usage. Consider freeing up space."
    fi
    
    # Verify test files exist
    print_status "Verifying test files..."
    
    local test_files=(
        "$STRESS_TEST_DIR/ai-content-load.test.js"
        "$STRESS_TEST_DIR/municipal-websocket-stress.test.js"
    )
    
    for test_file in "${test_files[@]}"; do
        if [ -f "$test_file" ]; then
            print_success "Found: $test_file"
        else
            print_error "Missing: $test_file"
            return 1
        fi
    done
    
    print_success "Pre-checks completed"
}

# Function to run all stress tests
run_all_tests() {
    local use_docker=$1
    local exit_codes=()
    
    print_header "🎯 Municipal AI Content Stress Testing Suite"
    echo "=============================================="
    echo "Target URL: $BASE_URL"
    echo "WebSocket URL: $WS_URL"
    echo "Start time: $(date)"
    echo ""
    
    # Test 1: AI Content Generation Load
    print_status "Test 1/2: AI Content Generation Load Testing"
    run_k6_test "$STRESS_TEST_DIR/ai-content-load.test.js" \
                 "ai-content-load" \
                 "--tag testid=ai-content-load" \
                 "$use_docker"
    exit_codes+=($?)
    
    echo ""
    
    # Test 2: WebSocket Stress Testing
    print_status "Test 2/2: Municipal WebSocket Stress Testing"
    run_k6_test "$STRESS_TEST_DIR/municipal-websocket-stress.test.js" \
                 "websocket-stress" \
                 "--tag testid=websocket-stress" \
                 "$use_docker"
    exit_codes+=($?)
    
    echo ""
    
    # Summary
    print_header "📊 Stress Testing Summary"
    echo "========================="
    
    local total_tests=${#exit_codes[@]}
    local passed_tests=0
    local failed_tests=0
    
    for i in "${!exit_codes[@]}"; do
        local test_num=$((i + 1))
        if [ "${exit_codes[$i]}" -eq 0 ]; then
            print_success "Test $test_num: PASSED"
            passed_tests=$((passed_tests + 1))
        else
            print_error "Test $test_num: FAILED (exit code: ${exit_codes[$i]})"
            failed_tests=$((failed_tests + 1))
        fi
    done
    
    echo ""
    echo "Results: $passed_tests passed, $failed_tests failed, $total_tests total"
    echo "Reports directory: $REPORTS_DIR"
    echo "End time: $(date)"
    
    if [ $failed_tests -gt 0 ]; then
        print_error "Some stress tests failed. Check reports for details."
        return 1
    else
        print_success "All stress tests passed! 🎉"
        return 0
    fi
}

# Function for cleanup
cleanup() {
    print_status "Cleaning up..."
    
    if [ ! -z "$DEV_SERVER_PID" ]; then
        print_status "Stopping development server (PID: $DEV_SERVER_PID)..."
        kill $DEV_SERVER_PID 2>/dev/null || true
        wait $DEV_SERVER_PID 2>/dev/null || true
    fi
    
    print_status "Cleanup completed"
}

# Function to display help
show_help() {
    echo "AI Content Stress Testing Runner"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -s, --start-server      Start development server if not running"
    echo "  -c, --check-only        Run pre-checks only, don't execute tests"
    echo "  -t, --test TEST_NAME    Run specific test only (ai-content-load|websocket-stress)"
    echo "  --base-url URL          Set base URL (default: http://localhost:5173)"
    echo "  --ws-url URL           Set WebSocket URL (default: ws://localhost:5173/ws)"
    echo "  --use-docker           Force use of Docker even if K6 is available locally"
    echo ""
    echo "Examples:"
    echo "  $0                      Run all stress tests"
    echo "  $0 -s                   Start server and run tests"
    echo "  $0 -c                   Run pre-checks only"
    echo "  $0 -t ai-content-load   Run only AI content load test"
    echo "  $0 --base-url http://production.example.com"
    echo ""
}

# Main execution
main() {
    local start_server=false
    local check_only=false
    local specific_test=""
    local use_docker=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--start-server)
                start_server=true
                shift
                ;;
            -c|--check-only)
                check_only=true
                shift
                ;;
            -t|--test)
                specific_test="$2"
                shift 2
                ;;
            --base-url)
                BASE_URL="$2"
                shift 2
                ;;
            --ws-url)
                WS_URL="$2"
                shift 2
                ;;
            --use-docker)
                use_docker=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Trap cleanup on script exit
    trap cleanup EXIT INT TERM
    
    # Check for K6 availability
    if ! check_k6; then
        use_docker=true
    fi
    
    # Run pre-checks
    if ! run_pre_checks; then
        print_error "Pre-checks failed. Aborting."
        exit 1
    fi
    
    if [ "$check_only" = true ]; then
        print_success "Pre-checks completed successfully."
        exit 0
    fi
    
    # Start development server if requested
    if [ "$start_server" = true ]; then
        start_dev_server
    fi
    
    # Ensure development server is available
    if ! check_dev_server; then
        print_error "Development server not available. Use -s to start it automatically."
        exit 1
    fi
    
    # Run specific test or all tests
    if [ ! -z "$specific_test" ]; then
        case "$specific_test" in
            "ai-content-load")
                run_k6_test "$STRESS_TEST_DIR/ai-content-load.test.js" \
                           "ai-content-load" \
                           "--tag testid=ai-content-load" \
                           "$use_docker"
                ;;
            "websocket-stress")
                run_k6_test "$STRESS_TEST_DIR/municipal-websocket-stress.test.js" \
                           "websocket-stress" \
                           "--tag testid=websocket-stress" \
                           "$use_docker"
                ;;
            *)
                print_error "Unknown test: $specific_test"
                echo "Available tests: ai-content-load, websocket-stress"
                exit 1
                ;;
        esac
    else
        run_all_tests "$use_docker"
    fi
}

# Run main function
main "$@"