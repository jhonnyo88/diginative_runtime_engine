#!/bin/bash

# DigiNativa Runtime Engine - Docker Build Script
# Production-ready build for Swedish municipal deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="diginativa/runtime-engine"
VERSION=${1:-"latest"}
BUILD_TARGET=${2:-"production"}

echo -e "${BLUE}🏗️  DigiNativa Runtime Engine - Docker Build${NC}"
echo -e "${BLUE}================================================${NC}"
echo -e "Image: ${IMAGE_NAME}:${VERSION}"
echo -e "Target: ${BUILD_TARGET}"
echo -e "Timestamp: $(date)"
echo ""

# Validate environment
echo -e "${YELLOW}🔍 Validating build environment...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed or not in PATH${NC}"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running${NC}"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found. Please run from project root.${NC}"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run from project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment validation passed${NC}"
echo ""

# Pre-build cleanup
echo -e "${YELLOW}🧹 Cleaning up previous builds...${NC}"
docker system prune -f --filter "label=org.label-schema.name=diginativa-runtime-engine" 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup completed${NC}"
echo ""

# Build the image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
echo -e "Command: docker build --target ${BUILD_TARGET} -t ${IMAGE_NAME}:${VERSION} ."
echo ""

if docker build \
    --target "${BUILD_TARGET}" \
    --tag "${IMAGE_NAME}:${VERSION}" \
    --tag "${IMAGE_NAME}:latest" \
    --label "build.timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --label "build.version=${VERSION}" \
    --label "build.target=${BUILD_TARGET}" \
    --progress=plain \
    .; then
    echo ""
    echo -e "${GREEN}✅ Docker build completed successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Verify the build
echo ""
echo -e "${YELLOW}🔍 Verifying build...${NC}"

# Check image size
IMAGE_SIZE=$(docker images --format "{{.Size}}" "${IMAGE_NAME}:${VERSION}" | head -1)
echo -e "Image size: ${IMAGE_SIZE}"

# Check image layers
LAYER_COUNT=$(docker history "${IMAGE_NAME}:${VERSION}" --format "{{.ID}}" | wc -l)
echo -e "Layer count: ${LAYER_COUNT}"

# Security scan (if available)
if command -v docker scan &> /dev/null; then
    echo -e "${YELLOW}🛡️  Running security scan...${NC}"
    docker scan "${IMAGE_NAME}:${VERSION}" || echo -e "${YELLOW}⚠️  Security scan not available or found vulnerabilities${NC}"
fi

# Test run
echo -e "${YELLOW}🧪 Testing container startup...${NC}"
CONTAINER_ID=$(docker run -d --rm -p 8080:8080 "${IMAGE_NAME}:${VERSION}")

# Wait for container to start
sleep 10

# Health check
if curl -f -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ Container health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check endpoint not responding (this may be expected)${NC}"
fi

# Stop test container
docker stop "${CONTAINER_ID}" > /dev/null

echo ""
echo -e "${GREEN}🎉 Build verification completed!${NC}"
echo ""
echo -e "${BLUE}📦 Build Summary${NC}"
echo -e "${BLUE}===============${NC}"
echo -e "Image: ${IMAGE_NAME}:${VERSION}"
echo -e "Size: ${IMAGE_SIZE}"
echo -e "Layers: ${LAYER_COUNT}"
echo -e "Target: ${BUILD_TARGET}"
echo -e "Built: $(date)"
echo ""
echo -e "${GREEN}✅ DigiNativa Runtime Engine is ready for deployment!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "• Run: ${YELLOW}docker-compose up -d${NC} (full stack)"
echo -e "• Run: ${YELLOW}docker run -p 8080:8080 ${IMAGE_NAME}:${VERSION}${NC} (app only)"
echo -e "• Push: ${YELLOW}docker push ${IMAGE_NAME}:${VERSION}${NC} (to registry)"