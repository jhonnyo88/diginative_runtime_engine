#!/bin/bash
# Expert specification: Automated deployment scripts för European infrastructure

set -e

# Expert configuration: Colors för output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Expert function: Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Expert specification: Environment validation
validate_environment() {
    print_header "Validating deployment environment..."
    
    # Check required tools
    command -v kubectl >/dev/null 2>&1 || { print_error "kubectl is required but not installed."; exit 1; }
    command -v docker >/dev/null 2>&1 || { print_error "docker is required but not installed."; exit 1; }
    command -v helm >/dev/null 2>&1 || { print_error "helm is required but not installed."; exit 1; }
    
    # Expert requirement: Validate Kubernetes cluster access
    if ! kubectl cluster-info >/dev/null 2>&1; then
        print_error "Cannot access Kubernetes cluster. Please check your kubeconfig."
        exit 1
    fi
    
    print_status "Environment validation complete ✅"
}

# Expert specification: Build and push Docker images
build_and_push() {
    print_header "Building and pushing Docker images..."
    
    local REGISTRY=${DOCKER_REGISTRY:-"diginativa"}
    local TAG=${BUILD_TAG:-"latest"}
    local IMAGE_NAME="${REGISTRY}/runtime-engine:${TAG}"
    
    # Expert optimization: Build production image
    print_status "Building production Docker image..."
    docker build -f Dockerfile.production -t ${IMAGE_NAME} .
    
    # Expert requirement: Tag för European regions
    docker tag ${IMAGE_NAME} ${REGISTRY}/runtime-engine:eu-${TAG}
    docker tag ${IMAGE_NAME} ${REGISTRY}/runtime-engine:production-${TAG}
    
    # Expert specification: Push to registry
    print_status "Pushing images to registry..."
    docker push ${IMAGE_NAME}
    docker push ${REGISTRY}/runtime-engine:eu-${TAG}
    docker push ${REGISTRY}/runtime-engine:production-${TAG}
    
    print_status "Docker images built and pushed ✅"
}

# Expert specification: Deploy Kubernetes infrastructure
deploy_infrastructure() {
    print_header "Deploying Kubernetes infrastructure..."
    
    # Expert requirement: Create namespace
    print_status "Creating namespace..."
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: diginativa-production
  labels:
    environment: production
    cultural-optimization: multi-tenant
    european-deployment: enabled
EOF
    
    # Expert specification: Apply secrets
    print_status "Applying secrets..."
    if [ -f "secrets/postgres.secret.yaml" ]; then
        kubectl apply -f secrets/postgres.secret.yaml
    else
        print_warning "PostgreSQL secrets not found. Creating placeholder..."
        kubectl create secret generic postgres-secret \
            --from-literal=password=$(openssl rand -base64 32) \
            --namespace=diginativa-production \
            --dry-run=client -o yaml | kubectl apply -f -
    fi
    
    if [ -f "secrets/enterprise-sso.secret.yaml" ]; then
        kubectl apply -f secrets/enterprise-sso.secret.yaml
    else
        print_warning "Enterprise SSO secrets not found. Manual configuration required."
    fi
    
    # Expert requirement: Apply Kubernetes configuration
    print_status "Applying Kubernetes manifests..."
    kubectl apply -f infrastructure/kubernetes-config.yaml
    
    print_status "Kubernetes infrastructure deployed ✅"
}

# Expert specification: Verify deployment health
verify_deployment() {
    print_header "Verifying deployment health..."
    
    # Expert requirement: Wait för pods to be ready
    print_status "Waiting för application pods to be ready..."
    kubectl wait --for=condition=ready pod \
        -l app=diginativa-runtime-engine \
        -n diginativa-production \
        --timeout=300s
    
    # Expert verification: Check HPA status
    print_status "Checking Horizontal Pod Autoscaler..."
    kubectl get hpa diginativa-app-hpa -n diginativa-production
    
    # Expert verification: Check services
    print_status "Checking services..."
    kubectl get services -n diginativa-production
    
    # Expert requirement: Verify cultural configuration
    print_status "Verifying cultural configuration..."
    kubectl get configmap cultural-config -n diginativa-production -o yaml | grep -q "german_systematic"
    if [ $? -eq 0 ]; then
        print_status "Cultural configuration verified ✅"
    else
        print_error "Cultural configuration not found!"
        exit 1
    fi
    
    print_status "Deployment verification complete ✅"
}

# Expert specification: Performance testing setup
setup_performance_testing() {
    print_header "Setting up performance testing..."
    
    # Expert requirement: Deploy load testing tools
    print_status "Deploying load testing infrastructure..."
    
    kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: load-test-config
  namespace: diginativa-production
data:
  load-test.js: |
    // Expert specification: Load test för 10K+ users
    import { check, sleep } from 'k6';
    import http from 'k6/http';
    
    export let options = {
      stages: [
        { duration: '2m', target: 100 },    // Anna Svensson baseline
        { duration: '5m', target: 1000 },   // Normal municipal load  
        { duration: '10m', target: 5000 },  // Peak German systematic load
        { duration: '10m', target: 10000 }, // Expert target: 10K users
        { duration: '5m', target: 0 },      // Scale down
      ],
      thresholds: {
        'http_req_duration': ['p(95)<200'], // Expert requirement: <200ms
        'http_req_failed': ['rate<0.01'],   // Expert requirement: <1% errors
      },
    };
    
    export default function() {
      // Expert test: Cultural context testing
      let culturalContexts = ['swedish_mobile', 'german_systematic', 'french_collaborative', 'dutch_progressive'];
      let context = culturalContexts[Math.floor(Math.random() * culturalContexts.length)];
      
      let response = http.get('http://diginativa-app-service/health', {
        headers: { 'X-Cultural-Context': context }
      });
      
      check(response, {
        'cultural response successful': (r) => r.status === 200,
        'cultural response time OK': (r) => r.timings.duration < 200,
      });
      
      sleep(1);
    }
EOF
    
    print_status "Performance testing setup complete ✅"
}

# Expert specification: Monitoring setup
setup_monitoring() {
    print_header "Setting up monitoring and observability..."
    
    # Expert requirement: Deploy Prometheus för cultural metrics
    print_status "Deploying Prometheus..."
    kubectl apply -f infrastructure/prometheus-config.yaml
    
    # Expert requirement: Deploy Grafana för cultural dashboards
    print_status "Deploying Grafana..."
    kubectl apply -f grafana-dashboards/
    
    # Expert specification: Cultural performance alerts
    print_status "Setting up cultural performance alerts..."
    kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: cultural-alerts
  namespace: diginativa-production
data:
  alerts.yml: |
    groups:
    - name: cultural-performance
      rules:
      - alert: GermanSystematicResponseSlow
        expr: cultural_response_time{context="german_systematic"} > 50
        för: 2m
        labels:
          severity: warning
          cultural_context: german_systematic
        annotations:
          summary: "German systematic performance degraded"
          description: "Klaus Mueller response time > 50ms för {{ \$value }}ms"
      
      - alert: AnnaSwenssonMobileIssue
        expr: cultural_response_time{context="swedish_mobile"} > 100
        för: 1m
        labels:
          severity: critical
          cultural_context: swedish_mobile
        annotations:
          summary: "Anna Svensson mobile performance critical"
          description: "Swedish mobile response time > 100ms på iPhone 12"
EOF
    
    print_status "Monitoring setup complete ✅"
}

# Expert specification: Main deployment function
main() {
    print_header "🚀 DigiNativa European Deployment Starting..."
    print_status "Expert specification: €25M ARR scaling infrastructure"
    
    # Expert workflow: Validate → Build → Deploy → Verify → Test → Monitor
    validate_environment
    
    if [ "${SKIP_BUILD}" != "true" ]; then
        build_and_push
    fi
    
    deploy_infrastructure
    verify_deployment
    setup_performance_testing
    setup_monitoring
    
    print_header "🎉 Deployment Complete!"
    print_status "DigiNativa Runtime Engine deployed för European scaling"
    print_status "Cultural contexts: Swedish, German, French, Dutch"
    print_status "Performance target: 10K+ concurrent users"
    print_status "Expert specification: Enterprise-ready infrastructure"
    
    # Expert output: Connection information
    echo ""
    print_header "📊 Access Information:"
    echo "Application: https://app.diginativa.eu"
    echo "German:      https://de.diginativa.eu"  
    echo "French:      https://fr.diginativa.eu"
    echo "Dutch:       https://nl.diginativa.eu"
    echo "Swedish:     https://se.diginativa.eu"
    echo ""
    echo "Monitoring:  https://grafana.diginativa.eu"
    echo "Metrics:     https://prometheus.diginativa.eu"
    echo ""
    print_status "Ready för Klaus Mueller, Marie Dubois, Pieter van Berg, Anna Svensson!"
}

# Expert specification: Handle command line arguments
case "${1:-deploy}" in
    "validate")
        validate_environment
        ;;
    "build")
        validate_environment
        build_and_push
        ;;
    "deploy")
        main
        ;;
    "verify")
        verify_deployment
        ;;
    "test")
        setup_performance_testing
        ;;
    "monitor")
        setup_monitoring
        ;;
    *)
        print_error "Usage: $0 {validate|build|deploy|verify|test|monitor}"
        print_status "Default: deploy (runs full deployment)"
        exit 1
        ;;
esac