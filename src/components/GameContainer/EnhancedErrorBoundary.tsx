/**
 * Enhanced ErrorBoundary Component
 * Municipal Professional Error UX for DigiNativa Runtime Engine
 * 
 * Provides professional error handling worthy of Swedish government standards
 * Optimized error recovery patterns for Anna Svensson persona
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Container,
  Divider,
  Code,
  Collapse,
  Icon,
  Link
} from '@chakra-ui/react';
import { 
  FiRefreshCw, 
  FiHome, 
  FiAlertTriangle, 
  FiChevronDown, 
  FiChevronUp,
  FiMail,
  FiPhone 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { InfrastructureMonitoring } from '../../services/infrastructure-monitoring';

// Municipal theme types from GameContainer
type MunicipalTheme = 'sweden' | 'germany' | 'france' | 'netherlands';
type BrandingLevel = 'minimal' | 'standard' | 'full';

// Error boundary props
interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  municipalTheme?: MunicipalTheme;
  brandingLevel?: BrandingLevel;
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>;
}

// Error boundary state
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

// Error fallback component props
export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  municipalTheme: MunicipalTheme;
  brandingLevel: BrandingLevel;
  onRetry: () => void;
  onGoHome: () => void;
  onToggleDetails: () => void;
  showDetails: boolean;
}

// Municipal contact information

// Municipal color schemes

// Error messages in different languages

// Motion components

/**
 * Default Error Fallback Component
 * Municipal professional error UX
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  errorId,
  municipalTheme,
  brandingLevel,
  onRetry,
  onGoHome,
  onToggleDetails,
  showDetails
}) => {
  
  // Color mode values
  
  return (
    <Container maxW="lg" py={16}>
      <MotionVStack
        spacing={8}
        align="center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Error Icon and Title */}
        <VStack spacing={4} textAlign="center">
          <MotionBox
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Icon
              as={FiAlertTriangle}
              w={16}
              h={16}
              color={municipalColors.error}
            />
          </MotionBox>
          
          <VStack spacing={2}>
            <Heading
              size="lg"
              color={municipalColors.primary}
              textAlign="center"
            >
              {messages.title}
            </Heading>
            <Text
              fontSize="md"
              color="gray.600"
              textAlign="center"
              maxW="400px"
            >
              {messages.subtitle}
            </Text>
          </VStack>
        </VStack>
        
        {/* Error Alert */}
        <Alert
          status="error"
          variant="left-accent"
          bg={bgColor}
          border="1px"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
          w="100%"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle mr={2}>
              {messages.title}
            </AlertTitle>
            <AlertDescription>
              {messages.description}
            </AlertDescription>
          </Box>
        </Alert>
        
        {/* Action Buttons */}
        <HStack spacing={4} w="100%">
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="blue"
            bg={municipalColors.primary}
            size="lg"
            flex={1}
            onClick={onRetry}
            _hover={{
              bg: municipalColors.primary,
              opacity: 0.9
            }}
          >
            {messages.retryButton}
          </Button>
          
          <Button
            leftIcon={<FiHome />}
            variant="outline"
            borderColor={municipalColors.primary}
            color={municipalColors.primary}
            size="lg"
            flex={1}
            onClick={onGoHome}
            _hover={{
              bg: municipalColors.secondary
            }}
          >
            {messages.homeButton}
          </Button>
        </HStack>
        
        {/* Error ID and Reporting Status */}
        <VStack spacing={2} w="100%">
          <HStack w="100%" justify="space-between" p={4} bg="gray.50" borderRadius="md">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                {messages.errorIdLabel}:
              </Text>
              <Code fontSize="xs" colorScheme="gray">
                {errorId}
              </Code>
            </VStack>
            <Text fontSize="xs" color="green.600" fontWeight="medium">
              ✓ {messages.reportedLabel}
            </Text>
          </HStack>
          
          {/* Toggle Details Button */}
          <Button
            leftIcon={showDetails ? <FiChevronUp /> : <FiChevronDown />}
            variant="ghost"
            size="sm"
            onClick={onToggleDetails}
            color="gray.600"
          >
            {messages.detailsButton}
          </Button>
        </VStack>
        
        {/* Error Details (Collapsible) */}
        <Collapse in={showDetails} style={{ width: '100%' }}>
          <Box
            w="100%"
            p={4}
            bg="gray.50"
            borderRadius="lg"
            border="1px"
            borderColor="gray.200"
          >
            <VStack align="start" spacing={4}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Tekniska detaljer:
              </Text>
              
              {error && (
                <Box w="100%">
                  <Text fontSize="xs" color="gray.600" mb={2}>
                    Felmeddelande:
                  </Text>
                  <Code
                    p={2}
                    fontSize="xs"
                    w="100%"
                    whiteSpace="pre-wrap"
                    bg="red.50"
                    color="red.800"
                  >
                    {error.message}
                  </Code>
                </Box>
              )}
              
              {errorInfo && errorInfo.componentStack && (
                <Box w="100%">
                  <Text fontSize="xs" color="gray.600" mb={2}>
                    Komponentstack:
                  </Text>
                  <Code
                    p={2}
                    fontSize="xs"
                    w="100%"
                    whiteSpace="pre-wrap"
                    bg="gray.100"
                    color="gray.800"
                    maxH="200px"
                    overflowY="auto"
                  >
                    {errorInfo.componentStack}
                  </Code>
                </Box>
              )}
            </VStack>
          </Box>
        </Collapse>
        
        <Divider />
        
        {/* Support Contact Information */}
        <Box w="100%" p={6} bg={municipalColors.secondary} borderRadius="lg">
          <VStack spacing={4}>
            <Heading size="md" color={municipalColors.primary}>
              {messages.contactTitle}
            </Heading>
            
            <Text fontSize="sm" color="gray.700" textAlign="center">
              {messages.contactDescription}
            </Text>
            
            <VStack spacing={3} w="100%">
              <HStack>
                <Icon as={FiMail} color={municipalColors.primary} />
                <Link
                  href={`mailto:${contact.supportEmail}?subject=Fel-ID: ${errorId}`}
                  color={municipalColors.primary}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  {contact.supportEmail}
                </Link>
              </HStack>
              
              <HStack>
                <Icon as={FiPhone} color={municipalColors.primary} />
                <Text fontSize="sm" color="gray.700">
                  {contact.supportPhone}
                </Text>
              </HStack>
              
              <Text fontSize="xs" color="gray.600" textAlign="center">
                {contact.contactHours}
              </Text>
            </VStack>
          </VStack>
        </Box>
      </MotionVStack>
    </Container>
  );
};

/**
 * Enhanced Error Boundary Class Component
 */
export class EnhancedErrorBoundary extends Component<
  EnhancedErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    };
  }
  
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate unique error ID
    
    return {
      hasError: true,
      error,
      errorId
    };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo
    });
    
    // Log error for monitoring (in production, send to monitoring service)
    console.error('Enhanced ErrorBoundary caught an error:', error, errorInfo);
    
    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }
  
  reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      
      console.log('Error Report:', errorReport);
      
      // Report to Infrastructure Monitoring Service
      if (monitoring) {
        monitoring.reportError(error, {
          errorId: this.state.errorId,
          municipalTheme: this.props.municipalTheme,
          brandingLevel: this.props.brandingLevel,
          componentStack: errorInfo.componentStack,
          url: window.location.href
        });
      }
      
      // Also send to API endpoint for backup
      try {
        await fetch('/api/error-reporting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport)
        });
      } catch (apiError) {
        console.warn('Failed to send error report to API:', apiError);
      }
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };
  
  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false
    });
  };
  
  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };
  
  handleToggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    }));
  };
  
  render() {
    if (this.state.hasError) {
      
      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId}
          municipalTheme={this.props.municipalTheme || 'sweden'}
          brandingLevel={this.props.brandingLevel || 'standard'}
          onRetry={this.handleRetry}
          onGoHome={this.handleGoHome}
          onToggleDetails={this.handleToggleDetails}
          showDetails={this.state.showDetails}
        />
      );
    }
    
    return this.props.children;
  }
}

export default EnhancedErrorBoundary;