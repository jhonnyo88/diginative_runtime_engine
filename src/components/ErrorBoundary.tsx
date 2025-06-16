/**
 * DigiNativa Runtime Engine - React Error Boundary
 * Municipal-grade error handling with accessibility support
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react';
import { captureError } from '../services/error-monitoring';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Capture error for monitoring
    captureError({
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity: 'high',
      category: 'runtime',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId
      }
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console for development
    console.error('Error caught by boundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI with accessibility and municipal design
      return (
        <Box
          role="alert"
          aria-live="assertive"
          p={8}
          bg="red.50"
          borderRadius="lg"
          border="2px solid"
          borderColor="red.200"
          maxW="600px"
          mx="auto"
          mt={8}
        >
          <VStack spacing={6} align="stretch">
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <Heading as="h2" size="md" color="red.700">
                  Ett oväntat fel uppstod
                </Heading>
                <Text color="red.600" mt={1}>
                  Vi ber om ursäkt för besväret. Felet har rapporterats automatiskt.
                </Text>
              </Box>
            </Alert>

            <Box>
              <Text fontSize="sm" color="gray.600" mb={4}>
                <strong>Fel-ID:</strong> {this.state.errorId}
              </Text>
              
              <Text fontSize="sm" color="gray.600" mb={4}>
                Som kommunal användare kan du:
              </Text>
              
              <VStack spacing={2} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  • Försöka igen genom att klicka på "Försök igen" nedan
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Ladda om sidan helt om problemet kvarstår
                </Text>
                <Text fontSize="sm" color="gray.600">
                  • Kontakta IT-support med fel-ID:t ovan
                </Text>
              </VStack>
            </Box>

            <VStack spacing={3}>
              <Button
                colorScheme="blue"
                onClick={this.handleRetry}
                size="lg"
                w="full"
                aria-label="Försök igen att ladda innehållet"
              >
                Försök igen
              </Button>
              
              <Button
                variant="outline"
                onClick={this.handleReload}
                size="md"
                w="full"
                aria-label="Ladda om hela sidan"
              >
                Ladda om sidan
              </Button>
            </VStack>

            {/* Development error details */}
            {import.meta.env.DEV && this.state.error && (
              <Box
                mt={6}
                p={4}
                bg="gray.100"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.300"
              >
                <Text fontSize="xs" fontWeight="bold" mb={2}>
                  Utvecklingsinfo:
                </Text>
                <Text fontSize="xs" fontFamily="mono" color="red.600">
                  {this.state.error.message}
                </Text>
                {this.state.error.stack && (
                  <Text fontSize="xs" fontFamily="mono" color="gray.600" mt={2}>
                    {this.state.error.stack}
                  </Text>
                )}
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

// High-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Game-specific error boundary
export function GameErrorBoundary({ children, gameId }: { children: ReactNode; gameId?: string }) {
  const handleGameError = (error: Error, errorInfo: ErrorInfo) => {
    captureError({
      name: error.name,
      message: error.message,
      stack: error.stack,
      severity: 'high',
      category: 'game-content',
      context: {
        gameId
      },
      metadata: {
        componentStack: errorInfo.componentStack,
        gameSpecific: true
      }
    });
  };

  const fallback = (
    <Alert status="error" borderRadius="md" m={4}>
      <AlertIcon />
      <Box>
        <Text fontWeight="bold">Spelet kunde inte laddas</Text>
        <Text fontSize="sm" mt={1}>
          Ett fel uppstod när spelet skulle startas. Försök igen eller kontakta support.
        </Text>
      </Box>
    </Alert>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleGameError}>
      {children}
    </ErrorBoundary>
  );
}