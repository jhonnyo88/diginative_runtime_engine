/**
 * DigiNativa Runtime Engine - Real-time Monitoring Dashboard
 * Development and production monitoring for Swedish municipal deployment
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Badge,
  Text,
  VStack,
  HStack,
  Progress,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  Collapse,
  IconButton
} from '@chakra-ui/react';
import { performanceAnalytics } from '../services/performance-analytics';
import { captureMetric } from '../services/error-monitoring';

interface MonitoringDashboardProps {
  show?: boolean;
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  minimal?: boolean;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  show = false,
  position = 'bottom-right'
}) => {
  const [isOpen, setIsOpen] = useState(show);
  const [sessionData, setSessionData] = useState<Record<string, unknown>>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<Record<string, unknown>>(null);
  const [isEnabled, setIsEnabled] = useState(false);


  useEffect(() => {
    // Only show in development or when explicitly enabled
    setIsEnabled(isDev || isEnabledByConfig);

    if (!isEnabled) return;

    }, 2000);

    return () => clearInterval(interval);
  }, [isEnabled]);





  if (!isEnabled) return null;

  return (
    <Box style={getPositionStyles()}>
      {/* Toggle Button */}
      <IconButton
        aria-label={isOpen ? 'Hide monitoring' : 'Show monitoring'}
        icon={<span>{isOpen ? '📊' : '📈'}</span>}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        mb={2}
        boxShadow="md"
      />

      <Collapse in={isOpen}>
        <Box
          bg={bgColor}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          p={4}
          boxShadow="lg"
        >
          <VStack spacing={4} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="bold" color="blue.600">
                DigiNativa Monitor
              </Text>
              <Badge colorScheme="green" size="sm">
                Live
              </Badge>
            </HStack>

            {/* Session Info */}
            {sessionData && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={2}>
                  Session ({sessionData.municipality})
                </Text>
                <SimpleGrid columns={2} spacing={2}>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Duration</StatLabel>
                    <StatNumber fontSize="sm">
                      {formatDuration(sessionData.summary.duration)}
                    </StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Games</StatLabel>
                    <StatNumber fontSize="sm">
                      {sessionData.summary.gamesPlayed}
                    </StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Interactions</StatLabel>
                    <StatNumber fontSize="sm">
                      {sessionData.summary.totalInteractions}
                    </StatNumber>
                  </Stat>
                  <Stat size="sm">
                    <StatLabel fontSize="xs">Completion</StatLabel>
                    <StatNumber fontSize="sm">
                      {Math.round(sessionData.summary.completionRate * 100)}%
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </Box>
            )}

            {/* Performance Metrics */}
            {performanceMetrics && (
              <Box>
                <Text fontSize="xs" fontWeight="semibold" mb={2}>
                  Performance
                </Text>
                <VStack spacing={2} align="stretch">
                  <Box>
                    <HStack justify="space-between">
                      <Text fontSize="xs">Memory Usage</Text>
                      <Text fontSize="xs" fontWeight="bold">
                        {formatBytes(performanceMetrics.memoryUsage)}
                      </Text>
                    </HStack>
                    <Progress
                      value={performanceMetrics.memoryPercent}
                      size="sm"
                      colorScheme={performanceMetrics.memoryPercent > 80 ? 'red' : 'green'}
                    />
                  </Box>
                  
                  {sessionData?.summary.averageResponseTime > 0 && (
                    <Stat size="sm">
                      <StatLabel fontSize="xs">Avg Response Time</StatLabel>
                      <StatNumber fontSize="sm">
                        {Math.round(sessionData.summary.averageResponseTime)}ms
                      </StatNumber>
                      <StatHelpText fontSize="xs">
                        {sessionData.summary.averageResponseTime > 100 ? 'Slow' : 'Good'}
                      </StatHelpText>
                    </Stat>
                  )}
                </VStack>
              </Box>
            )}

            {/* Anna Svensson 7-minute session alert */}
            {sessionData?.summary.duration > 360000 && (
              <Alert status="warning" size="sm">
                <AlertIcon />
                <Text fontSize="xs">
                  Session &gt; 6min (Anna target: 7min)
                </Text>
              </Alert>
            )}

            {/* Device info */}
            <HStack justify="space-between">
              <Badge size="sm" colorScheme="blue">
                {sessionData?.deviceType || 'unknown'}
              </Badge>
              {sessionData?.municipality && (
                <Badge size="sm" colorScheme="purple">
                  {sessionData.municipality}
                </Badge>
              )}
            </HStack>

            {/* Quick actions */}
            <HStack spacing={2}>
              <Button
                size="xs"
                onClick={() => {
                  captureMetric({
                    name: 'manual_test_metric',
                    value: Date.now(),
                    unit: 'count',
                    tags: { source: 'monitoring_dashboard' }
                  });
                }}
              >
                Test Metric
              </Button>
              <Button
                size="xs"
                onClick={() => {
                  localStorage.setItem('diginativa_monitoring_enabled', 'false');
                  setIsEnabled(false);
                }}
              >
                Disable
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

// Hook for easy integration
export function useMonitoringDashboard(autoShow = false) {
  const [showDashboard, setShowDashboard] = useState(autoShow);

  useEffect(() => {
    // Only show dashboard if explicitly enabled in localStorage
    
    if (isEnabled) {
      setShowDashboard(true);
    } else {
      // Respect the autoShow parameter if not explicitly enabled
      setShowDashboard(autoShow);
    }

    // Keyboard shortcut to toggle (Ctrl+Shift+M)

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDashboard]);

  return {
    showDashboard,
    setShowDashboard,
    MonitoringDashboard: () => <MonitoringDashboard show={showDashboard} />
  };
}