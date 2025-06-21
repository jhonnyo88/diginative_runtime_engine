# Infrastructure Monitoring Guide

## Overview
This guide documents the infrastructure monitoring foundation setup for DigiNativa Runtime Engine, supporting Q1-Foundation-Autonomi-Milestone-1.1 for autonomous operation reliability.

## Components

### 1. Infrastructure Monitoring Service
Location: `src/services/infrastructure-monitoring.ts`

The core monitoring service provides:
- **Sentry Error Tracking**: Automated error reporting with municipal context
- **Performance Monitoring**: Web Vitals tracking (LCP, FID, CLS)
- **Health Checks**: Periodic infrastructure endpoint monitoring
- **Metrics Collection**: Performance baseline measurements

### 2. Health Check API Endpoints
Location: `src/api/routes/health.ts`

Available endpoints:
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system information
- `GET /api/health/database` - Database connectivity check
- `GET /api/health/auth` - Authentication service check

### 3. Monitoring Dashboard
Location: `src/components/monitoring/MonitoringDashboard.tsx`

Real-time dashboard showing:
- Overall system health status
- Individual service health
- Performance baselines
- Web Vitals metrics

## Configuration

### Environment Variables
Add to your `.env` file:
```env
VITE_SENTRY_DSN=your-sentry-dsn-here
```

### Initialization
The monitoring service is automatically initialized in `src/main.tsx`:

```typescript
const infrastructureMonitoring = InfrastructureMonitoring.getInstance();
infrastructureMonitoring.initialize({
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enablePerformanceMonitoring: true,
  enableHealthChecks: true,
  healthCheckEndpoints: [
    { name: 'api', url: '/api/health', interval: 60000 },
    { name: 'database', url: '/api/health/database', interval: 120000 },
    { name: 'auth', url: '/api/health/auth', interval: 180000 }
  ]
});
```

## Usage

### Error Reporting
Errors are automatically captured through the Enhanced Error Boundary:
```typescript
monitoring.reportError(error, {
  errorId: 'unique-id',
  municipalTheme: 'theme-name',
  componentStack: errorInfo.componentStack
});
```

### Custom Metrics
Record custom performance metrics:
```typescript
monitoring.recordMetric({
  name: 'custom_operation',
  value: 123.45,
  unit: 'ms',
  timestamp: Date.now(),
  tags: { operation: 'data-fetch' }
});
```

### Health Status
Get current infrastructure health:
```typescript
const health = monitoring.getHealthStatus();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
```

## Monitoring Dashboard Integration

To add the monitoring dashboard to your admin interface:

```typescript
import { MonitoringDashboard } from './components/monitoring';

// In your admin routes
<Route path="/admin/monitoring" element={<MonitoringDashboard />} />
```

## Performance Baselines

The system automatically tracks and calculates baselines for:
- Web Vitals (LCP, FID, CLS)
- API response times
- Custom application metrics

Baselines are calculated as rolling averages of the last 1000 measurements.

## Health Check Implementation

When implementing actual health checks (replacing the TODOs in health.ts):

1. **Database Health Check**:
   - Test database connection
   - Measure query latency
   - Check connection pool status

2. **Auth Service Health Check**:
   - Verify auth provider availability
   - Test token validation endpoint
   - Check SSO connectivity

## Alerts and Notifications

Critical failures are automatically reported to Sentry with appropriate severity levels:
- Critical service failures trigger immediate alerts
- Performance degradation is logged for trend analysis
- Municipal context is included for better debugging

## Best Practices

1. **Error Context**: Always include municipal context when reporting errors
2. **Performance Metrics**: Use consistent naming conventions for metrics
3. **Health Checks**: Keep health check endpoints lightweight
4. **Dashboard Access**: Restrict monitoring dashboard to admin users only
5. **Baseline Updates**: Review performance baselines monthly

## Troubleshooting

### Common Issues

1. **Sentry Not Reporting**:
   - Verify VITE_SENTRY_DSN is set correctly
   - Check network connectivity
   - Ensure enableErrorTracking is true

2. **Health Checks Failing**:
   - Verify endpoint URLs are correct
   - Check CORS configuration
   - Ensure services are running

3. **Performance Metrics Missing**:
   - Check browser PerformanceObserver support
   - Verify enablePerformanceMonitoring is true
   - Check for content security policy issues

## Future Enhancements

- Implement actual database and auth health checks
- Add custom alert thresholds
- Integrate with municipal notification systems
- Add historical trend analysis
- Implement SLA tracking