/**
 * Infrastructure Monitoring Dashboard
 * Provides real-time visibility into system health and performance
 * 
 * Supports Q1-Foundation-Autonomi-Milestone-1.1
 */

import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Badge, Stack, Grid, Card, CardBody, CardHeader, Stat, StatLabel, StatNumber, StatHelpText, Progress, Alert, AlertIcon } from '@chakra-ui/react';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';
import type { InfrastructureHealth, ServiceHealth, PerformanceMetric } from '../../services/infrastructure-monitoring';

export const MonitoringDashboard: React.FC = () => {
  const [health, setHealth] = useState<InfrastructureHealth | null>(null);
  const [performanceBaseline, setPerformanceBaseline] = useState<Record<string, number>>({});
  const [updateTime, setUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    
    // Update dashboard every 5 seconds

    updateDashboard(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const _getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy':
      case 'up':
        return 'green';
      case 'degraded':
        return 'yellow';
      case 'unhealthy':
      case 'down':
        return 'red';
      default:
        return 'gray';
    }
  };

  const _formatMetricValue = (value: number, unit: string): string => {
    if (unit === 'ms') {
      return `${value.toFixed(2)}ms`;
    } else if (unit === 'percent') {
      return `${value.toFixed(1)}%`;
    } else if (unit === 'bytes') {
      return `${(value / 1024 / 1024).toFixed(2)}MB`;
    }
    return value.toFixed(2);
  };

  if (!health) {
    return (
      <Box p={8}>
        <Text>Loading monitoring data...</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Stack spacing={6}>
        <Box>
          <Heading size="lg" mb={2}>Infrastructure Monitoring</Heading>
          <Text color="gray.600">
            Last updated: {updateTime.toLocaleTimeString()}
          </Text>
        </Box>

        {/* Overall Health Status */}
        <Alert status={health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'error'}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">
              System Status: <Badge colorScheme={getStatusColor(health.status)}>{health.status.toUpperCase()}</Badge>
            </Text>
          </Box>
        </Alert>

        {/* Service Health Grid */}
        <Box>
          <Heading size="md" mb={4}>Service Health</Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={4}>
            {Object.values(health.services).map((service: ServiceHealth) => (
              <Card key={service.name}>
                <CardHeader pb={2}>
                  <Text fontWeight="bold">{service.name}</Text>
                </CardHeader>
                <CardBody pt={2}>
                  <Stack spacing={2}>
                    <Badge colorScheme={getStatusColor(service.status)} alignSelf="flex-start">
                      {service.status.toUpperCase()}
                    </Badge>
                    {service.responseTime && (
                      <Text fontSize="sm" color="gray.600">
                        Response time: {service.responseTime}ms
                      </Text>
                    )}
                    {service.error && (
                      <Text fontSize="sm" color="red.500">
                        {service.error}
                      </Text>
                    )}
                    <Text fontSize="xs" color="gray.500">
                      Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>

        {/* Performance Metrics */}
        <Box>
          <Heading size="md" mb={4}>Performance Baselines</Heading>
          <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={4}>
            {Object.entries(performanceBaseline).map(([metric, value]) => (
              <Card key={metric}>
                <CardBody>
                  <Stat>
                    <StatLabel>{metric.replace(/_/g, ' ').toUpperCase()}</StatLabel>
                    <StatNumber>{formatMetricValue(value, metric.includes('time') ? 'ms' : 'count')}</StatNumber>
                    <StatHelpText>Average</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>

        {/* Web Vitals */}
        <Box>
          <Heading size="md" mb={4}>Web Vitals</Heading>
          <Stack spacing={3}>
            {['lcp', 'fid', 'cls'].map(vital => {
              if (!value) return null;
              
              const _isGood = vital === 'lcp' ? value < 2500 :
                           vital === 'fid' ? value < 100 :
                           value < 0.1;
              
              return (
                <Box key={vital}>
                  <Text fontWeight="bold" mb={1}>
                    {vital.toUpperCase()} - {vital === 'lcp' ? 'Largest Contentful Paint' :
                                           vital === 'fid' ? 'First Input Delay' :
                                           'Cumulative Layout Shift'}
                  </Text>
                  <Progress 
                    value={isGood ? 100 : 50} 
                    colorScheme={isGood ? 'green' : 'yellow'}
                    size="sm"
                    mb={1}
                  />
                  <Text fontSize="sm" color="gray.600">
                    {formatMetricValue(value, vital === 'cls' ? 'count' : 'ms')}
                  </Text>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
  return <Box><Text>Component</Text></Box>;
};