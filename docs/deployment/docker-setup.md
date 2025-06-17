# DigiNativa Runtime Engine - Docker Deployment Guide

## 🏗️ Production-Ready Containerization

This guide covers the complete Docker containerization setup for the DigiNativa Runtime Engine, optimized for Swedish municipal sector deployment with support for 10,000+ concurrent users.

## 📦 Container Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (nginx-lb)                │
│                         Port 80/443                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────┐
│              DigiNativa App Instances                      │
│                    Port 8080                               │
│            (Scalable: 1-N containers)                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┬─────────────┐
    │             │             │             │             │
┌───▼───┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐   ┌────▼────┐
│Redis  │   │PostgreSQL│   │Prometheus│   │ Grafana │   │  Nginx  │
│Session│   │Analytics │   │Monitoring│   │Dashboard│   │  Config │
│6379   │   │   5432   │   │   9090   │   │  3000   │   │   80    │
└───────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- 4GB+ available RAM
- 20GB+ available disk space

### 1. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit configuration for your deployment
nano .env
```

### 2. Build Application

```bash
# Build production container
./docker-scripts/build.sh latest production

# Or manually:
docker build --target production -t diginativa/runtime-engine:latest .
```

### 3. Deploy Full Stack

```bash
# Deploy with zero-downtime script
./docker-scripts/deploy.sh

# Or manually:
docker-compose up -d
```

## 🏛️ Municipal Sector Configuration

### Swedish Municipal Optimization

The containerization includes specific optimizations for Swedish municipal requirements:

- **GDPR Compliance**: Headers and data retention policies
- **WCAG 2.1 AA**: Accessibility-focused container configuration  
- **Anna Svensson Persona**: Mobile-first optimization for 45yo municipal administrator
- **7-Minute Sessions**: Optimized connection handling and auto-save
- **10,000+ Users**: Production-grade scaling and performance

### Security Features

```yaml
# Security headers automatically configured
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [Municipal-compliant policy]
```

## 📊 Monitoring & Analytics

### Grafana Dashboards

Access monitoring at `http://localhost:3000`:
- **Municipal Usage**: Real-time session analytics
- **Performance Metrics**: Response times, throughput
- **Anna Svensson Journey**: User experience tracking
- **System Health**: Infrastructure monitoring

### Prometheus Metrics

Key metrics collected:
- Game session duration and completion rates
- Municipal user distribution
- Mobile vs desktop usage patterns
- 7-minute session optimization effectiveness

## ⚡ Scaling Configuration

### Horizontal Scaling

```bash
# Scale application instances
docker-compose up -d --scale diginativa-app=5

# Auto-scaling with resource limits
# CPU: 70% trigger for scale-up
# Memory: 2GB limit per container
```

### Performance Tuning

For 10,000+ concurrent users:

```yaml
# nginx-lb.conf optimizations
worker_connections: 4096
keepalive_timeout: 65
gzip_comp_level: 6

# Application container limits
cpus: '2.0'
memory: 2G
```

## 🔧 Container Management

### Essential Commands

```bash
# View service status
docker-compose ps

# Follow application logs
docker-compose logs -f diginativa-app

# Monitor resource usage
docker stats

# Health check all services
docker-compose exec diginativa-app wget -q --spider http://localhost:8080/health
```

### Database Operations

```bash
# PostgreSQL backup
docker-compose exec postgres pg_dumpall -U diginativa > backup.sql

# Redis backup
docker-compose exec redis redis-cli --rdb backup.rdb

# Restore database
docker-compose exec -T postgres psql -U diginativa < backup.sql
```

## 🛡️ Security Best Practices

### Container Security

- **Non-root user**: All processes run as `diginativa` user
- **Read-only filesystem**: Containers use read-only root filesystem
- **Resource limits**: CPU and memory constraints prevent resource exhaustion
- **Health checks**: Automatic container health monitoring

### Network Security

```yaml
# Internal network isolation
networks:
  diginativa-network:
    driver: bridge
    
# Only expose necessary ports
ports:
  - "80:80"    # Load balancer only
  - "443:443"  # SSL termination
```

## 📱 Mobile Optimization

### Anna Svensson Persona Features

- **Preload Critical Resources**: CSS and JS preloading for faster mobile loading
- **HTTP/2 Server Push**: Automatic resource pushing for iPhone 12
- **Aggressive Caching**: 1-year cache for static assets
- **Gzip Compression**: 6-level compression for mobile networks

### Progressive Web App Support

```nginx
# PWA optimizations in nginx-site.conf
location ~* \.(html|htm)$ {
    add_header Link "</static/css/main.css>; rel=preload; as=style";
    http2_push /static/css/main.css;
    http2_push /static/js/main.js;
}
```

## 🔄 CI/CD Integration

### GitHub Actions Integration

The Docker setup integrates with the existing CI/CD pipeline:

```yaml
# .github/workflows/ci.yml includes:
- Docker build and security scan
- Container vulnerability assessment  
- Multi-platform image building
- Automated deployment to staging
```

### Deployment Automation

```bash
# Zero-downtime deployment
./docker-scripts/deploy.sh docker-compose.yml production true

# Includes:
# - Pre-deployment backup
# - Rolling update deployment  
# - Health check validation
# - Automatic rollback on failure
```

## 🌍 Environment Configurations

### Development

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up -d
```

### Staging

```bash
# Staging environment
docker-compose -f docker-compose.staging.yml up -d
```

### Production

```bash
# Production with full monitoring
docker-compose -f docker-compose.yml up -d
```

## 📈 Performance Benchmarks

### Municipal Sector Targets

- **Response Time**: < 200ms for game interactions
- **Throughput**: 10,000+ concurrent sessions
- **Availability**: 99.9% uptime SLA
- **Mobile Performance**: < 3s initial load on 4G

### Load Testing

```bash
# Run load tests against containerized app
docker run --rm -i artilleryio/artillery:latest quick \
  --count 100 --num 10 http://localhost/
```

## 🔍 Troubleshooting

### Common Issues

#### Container Won't Start
```bash
# Check logs
docker-compose logs diginativa-app

# Check health status
docker-compose ps
```

#### Database Connection Issues
```bash
# Verify PostgreSQL is ready
docker-compose exec postgres pg_isready -U diginativa

# Check connection from app
docker-compose exec diginativa-app nslookup postgres
```

#### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check for memory leaks
docker-compose exec diginativa-app cat /proc/meminfo
```

### Health Check Endpoints

- Application: `http://localhost:8080/health`
- Load Balancer: `http://localhost/health`  
- Metrics: `http://localhost:8080/metrics`
- Prometheus: `http://localhost:9090/-/healthy`

## 🎯 Municipal Compliance Checklist

- [x] GDPR-compliant data handling
- [x] WCAG 2.1 AA accessibility headers
- [x] Swedish language support ready
- [x] Municipal domain CORS configuration
- [x] Audit logging for compliance
- [x] Data retention policy implementation
- [x] Non-root container security
- [x] Resource usage monitoring
- [x] 7-minute session optimization
- [x] Mobile-first design support

## 📞 Support

For deployment issues or questions:
- Review container logs: `docker-compose logs`
- Check health endpoints listed above
- Verify environment configuration in `.env`
- Ensure Docker resources meet minimum requirements

## 🔗 Related Documentation

- [Main README](./README.md) - Project overview
- [CI/CD Pipeline](./.github/workflows/ci.yml) - Build automation
- [Game Designer Instructions](./claude_game_designer.md) - Content creation
- [Environment Configuration](./.env.example) - Full configuration reference