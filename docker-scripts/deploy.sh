#!/bin/bash

# DigiNativa Runtime Engine - Deployment Script
# Zero-downtime deployment for Swedish municipal production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE=${1:-"docker-compose.yml"}
ENVIRONMENT=${2:-"production"}
BACKUP_ENABLED=${3:-"true"}

echo -e "${BLUE}🚀 DigiNativa Runtime Engine - Deployment${NC}"
echo -e "${BLUE}==========================================${NC}"
echo -e "Compose file: ${COMPOSE_FILE}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Backup enabled: ${BACKUP_ENABLED}"
echo -e "Timestamp: $(date)"
echo ""

# Validate environment
echo -e "${YELLOW}🔍 Validating deployment environment...${NC}"

if [ ! -f "${COMPOSE_FILE}" ]; then
    echo -e "${RED}❌ Compose file not found: ${COMPOSE_FILE}${NC}"
    exit 1
fi

if [ ! -f ".env" ] && [ ! -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${RED}❌ Environment file not found (.env or .env.${ENVIRONMENT})${NC}"
    echo -e "${YELLOW}💡 Copy .env.example to .env and configure your settings${NC}"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment validation passed${NC}"
echo ""

# Load environment variables
if [ -f ".env.${ENVIRONMENT}" ]; then
    echo -e "${YELLOW}📋 Loading environment: .env.${ENVIRONMENT}${NC}"
    set -a
    source ".env.${ENVIRONMENT}"
    set +a
elif [ -f ".env" ]; then
    echo -e "${YELLOW}📋 Loading environment: .env${NC}"
    set -a
    source ".env"
    set +a
fi

# Pre-deployment backup
if [ "${BACKUP_ENABLED}" = "true" ]; then
    echo -e "${YELLOW}💾 Creating pre-deployment backup...${NC}"
    
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "${BACKUP_DIR}"
    
    # Backup database if running
    if docker-compose -f "${COMPOSE_FILE}" ps postgres | grep -q "Up"; then
        echo -e "📊 Backing up PostgreSQL database..."
        docker-compose -f "${COMPOSE_FILE}" exec -T postgres pg_dumpall -U "${POSTGRES_USER:-diginativa}" > "${BACKUP_DIR}/postgres_backup.sql"
    fi
    
    # Backup Redis if running
    if docker-compose -f "${COMPOSE_FILE}" ps redis | grep -q "Up"; then
        echo -e "🔄 Backing up Redis data..."
        docker-compose -f "${COMPOSE_FILE}" exec -T redis redis-cli --rdb - > "${BACKUP_DIR}/redis_backup.rdb"
    fi
    
    # Backup volumes
    echo -e "💾 Backing up Docker volumes..."
    docker run --rm -v diginativa-postgres-data:/data -v "$(pwd)/${BACKUP_DIR}:/backup" alpine tar czf /backup/postgres-volume.tar.gz -C /data .
    docker run --rm -v diginativa-redis-data:/data -v "$(pwd)/${BACKUP_DIR}:/backup" alpine tar czf /backup/redis-volume.tar.gz -C /data .
    
    echo -e "${GREEN}✅ Backup completed: ${BACKUP_DIR}${NC}"
    echo ""
fi

# Health check function
check_health() {
    local service=$1
    local port=$2
    local path=${3:-"/health"}
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}🏥 Checking health: ${service}${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:${port}${path}" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ ${service} is healthy${NC}"
            return 0
        fi
        
        echo -e "   Attempt ${attempt}/${max_attempts}..."
        sleep 5
        ((attempt++))
    done
    
    echo -e "${RED}❌ ${service} health check failed${NC}"
    return 1
}

# Zero-downtime deployment
echo -e "${YELLOW}🔄 Starting zero-downtime deployment...${NC}"

# Pull latest images
echo -e "${YELLOW}📥 Pulling latest images...${NC}"
docker-compose -f "${COMPOSE_FILE}" pull

# Start/update infrastructure services first
echo -e "${YELLOW}🗄️  Starting infrastructure services...${NC}"
docker-compose -f "${COMPOSE_FILE}" up -d postgres redis prometheus grafana

# Wait for infrastructure to be ready
echo -e "${YELLOW}⏳ Waiting for infrastructure services...${NC}"
sleep 20

# Check database health
if ! check_health "PostgreSQL" "5432" ""; then
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi

# Start application with rolling update
echo -e "${YELLOW}🏗️  Deploying application...${NC}"
docker-compose -f "${COMPOSE_FILE}" up -d --scale diginativa-app=2 diginativa-app

# Wait for new instances to be ready
sleep 30

# Check application health
if ! check_health "Application" "8080" "/health"; then
    echo -e "${RED}❌ Application deployment failed${NC}"
    echo -e "${YELLOW}🔄 Rolling back...${NC}"
    docker-compose -f "${COMPOSE_FILE}" rollback
    exit 1
fi

# Start load balancer
echo -e "${YELLOW}⚖️  Starting load balancer...${NC}"
docker-compose -f "${COMPOSE_FILE}" up -d nginx-lb

# Final health check through load balancer
if ! check_health "Load Balancer" "80" "/health"; then
    echo -e "${RED}❌ Load balancer health check failed${NC}"
    exit 1
fi

# Post-deployment verification
echo -e "${YELLOW}🔍 Running post-deployment verification...${NC}"

# Check all services are running
EXPECTED_SERVICES=("diginativa-app" "postgres" "redis" "prometheus" "grafana" "nginx-lb")
for service in "${EXPECTED_SERVICES[@]}"; do
    if docker-compose -f "${COMPOSE_FILE}" ps "${service}" | grep -q "Up"; then
        echo -e "${GREEN}✅ ${service} is running${NC}"
    else
        echo -e "${RED}❌ ${service} is not running${NC}"
        exit 1
    fi
done

# Check resource usage
echo -e "${YELLOW}📊 Checking resource usage...${NC}"
echo -e "Memory usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Check logs for errors
echo -e "${YELLOW}📋 Checking recent logs for errors...${NC}"
if docker-compose -f "${COMPOSE_FILE}" logs --tail=50 diginativa-app | grep -i error; then
    echo -e "${YELLOW}⚠️  Errors found in application logs${NC}"
else
    echo -e "${GREEN}✅ No errors in recent logs${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary${NC}"
echo -e "${BLUE}==================${NC}"
echo -e "Environment: ${ENVIRONMENT}"
echo -e "Compose file: ${COMPOSE_FILE}"
echo -e "Backup location: ${BACKUP_DIR:-"N/A"}"
echo -e "Deployment time: $(date)"
echo ""
echo -e "${BLUE}🌐 Service Endpoints${NC}"
echo -e "${BLUE}==================${NC}"
echo -e "Application: http://localhost (via load balancer)"
echo -e "Direct app: http://localhost:8080"
echo -e "Grafana: http://localhost:3000"
echo -e "Prometheus: http://localhost:9090"
echo ""
echo -e "${GREEN}✅ DigiNativa Runtime Engine is live!${NC}"
echo ""
echo -e "${BLUE}🛠️  Management Commands${NC}"
echo -e "• View logs: ${YELLOW}docker-compose -f ${COMPOSE_FILE} logs -f${NC}"
echo -e "• Scale app: ${YELLOW}docker-compose -f ${COMPOSE_FILE} up -d --scale diginativa-app=N${NC}"
echo -e "• Stop all: ${YELLOW}docker-compose -f ${COMPOSE_FILE} down${NC}"
echo -e "• Monitor: ${YELLOW}docker-compose -f ${COMPOSE_FILE} ps${NC}"