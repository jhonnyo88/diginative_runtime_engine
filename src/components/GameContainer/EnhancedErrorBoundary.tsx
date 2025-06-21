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
const MUNICIPAL_CONTACTS = {
  sweden: {
    supportEmail: 'support@diginativa.se',
    supportPhone: '+46 40 34 10 00',
    municipality: 'Malmö Stad',
    contactHours: 'Vardagar 08:00-17:00'
  },
  germany: {
    supportEmail: 'support@diginativa.de',
    supportPhone: '+49 30 12345678',
    municipality: 'Berlin',
    contactHours: 'Werktags 09:00-17:00'
  },
  france: {
    supportEmail: 'support@diginativa.fr',
    supportPhone: '+33 1 23 45 67 89',
    municipality: 'Paris',
    contactHours: 'Jours ouvrables 09:00-17:00'
  },
  netherlands: {
    supportEmail: 'support@diginativa.nl',
    supportPhone: '+31 20 123 4567',
    municipality: 'Amsterdam',
    contactHours: 'Werkdagen 09:00-17:00'
  }
};

// Municipal color schemes
const MUNICIPAL_COLORS = {
  sweden: {
    primary: '#005293',
    secondary: '#E6F3FF',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669'
  },
  germany: {
    primary: '#1F2937',
    secondary: '#F3F4F6',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669'
  },
  france: {
    primary: '#7C3AED',
    secondary: '#F3E8FF',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669'
  },
  netherlands: {
    primary: '#EA580C',
    secondary: '#FFF7ED',
    error: '#DC2626',
    warning: '#D97706',
    success: '#059669'
  }
};

// Error messages in different languages
const ERROR_MESSAGES = {
  sweden: {
    title: 'Ett fel har uppstått',
    subtitle: 'Vi arbetar på att lösa problemet',
    description: 'Detta är ett tekniskt fel som vi behöver åtgärda. Du kan prova att ladda om sidan eller kontakta support om problemet kvarstår.',
    retryButton: 'Försök igen',
    homeButton: 'Tillbaka till start',
    detailsButton: 'Visa tekniska detaljer',
    contactTitle: 'Behöver du hjälp?',
    contactDescription: 'Kontakta vårt supportteam för teknisk hjälp.',
    errorIdLabel: 'Fel-ID',
    reportedLabel: 'Felet har rapporterats automatiskt'
  },
  germany: {
    title: 'Ein Fehler ist aufgetreten',
    subtitle: 'Wir arbeiten an der Lösung',
    description: 'Dies ist ein technischer Fehler, den wir beheben müssen. Sie können versuchen, die Seite neu zu laden oder den Support kontaktieren.',
    retryButton: 'Erneut versuchen',
    homeButton: 'Zurück zum Start',
    detailsButton: 'Technische Details anzeigen',
    contactTitle: 'Brauchen Sie Hilfe?',
    contactDescription: 'Kontaktieren Sie unser Support-Team für technische Hilfe.',
    errorIdLabel: 'Fehler-ID',
    reportedLabel: 'Der Fehler wurde automatisch gemeldet'
  },
  france: {
    title: 'Une erreur s\'est produite',
    subtitle: 'Nous travaillons à la résolution',
    description: 'Il s\'agit d\'une erreur technique que nous devons corriger. Vous pouvez essayer de recharger la page ou contacter le support.',
    retryButton: 'Réessayer',
    homeButton: 'Retour à l\'accueil',
    detailsButton: 'Afficher les détails techniques',
    contactTitle: 'Besoin d\'aide?',
    contactDescription: 'Contactez notre équipe de support pour une aide technique.',
    errorIdLabel: 'ID d\'erreur',
    reportedLabel: 'L\'erreur a été signalée automatiquement'
  },
  netherlands: {
    title: 'Er is een fout opgetreden',
    subtitle: 'We werken aan een oplossing',
    description: 'Dit is een technische fout die we moeten oplossen. U kunt proberen de pagina te herladen of contact opnemen met de support.',
    retryButton: 'Opnieuw proberen',
    homeButton: 'Terug naar start',
    detailsButton: 'Technische details tonen',
    contactTitle: 'Hulp nodig?',
    contactDescription: 'Neem contact op met ons supportteam voor technische hulp.',
    errorIdLabel: 'Fout-ID',
    reportedLabel: 'De fout is automatisch gerapporteerd'
  }
};

// Motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

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
  const municipalColors = MUNICIPAL_COLORS[municipalTheme];
  const messages = ERROR_MESSAGES[municipalTheme];
  const contact = MUNICIPAL_CONTACTS[municipalTheme];
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
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
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
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
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        municipalTheme: this.props.municipalTheme,
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      console.log('Error Report:', errorReport);
      
      // Report to Infrastructure Monitoring Service
      const monitoring = InfrastructureMonitoring.getInstance();
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
      const FallbackComponent = this.props.fallbackComponent || DefaultErrorFallback;
      
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