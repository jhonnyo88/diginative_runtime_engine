/**
 * DigiNativa Runtime Engine - Login Form Component
 * Municipal-grade authentication with accessibility focus
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Select,
  Divider,
  Link,
  Heading,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
  Checkbox,
  HStack
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import type { LoginCredentials } from '../../types/auth';
import { captureError } from '../../services/error-monitoring';
import { usePerformanceTracker } from '../../hooks/usePerformanceTracker';

interface LoginFormProps {
  onSuccess?: () => void;
  allowMunicipalitySelection?: boolean;
  showSSOOptions?: boolean;
  title?: string;
}

const MUNICIPALITIES = [
  { id: 'malmo', name: 'Malmö Stad' },
  { id: 'stockholm', name: 'Stockholm Stad' },
  { id: 'goteborg', name: 'Göteborg Stad' },
  { id: 'uppsala', name: 'Uppsala Kommun' },
  { id: 'linkoping', name: 'Linköping Kommun' }
];

const SSO_PROVIDERS = [
  { id: 'azure-ad', name: 'Microsoft Azure AD', description: 'Logga in med ditt Microsoft-konto' },
  { id: 'okta', name: 'Okta', description: 'Logga in med Okta' },
  { id: 'saml', name: 'SAML SSO', description: 'Single Sign-On via SAML' }
];

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  allowMunicipalitySelection = true,
  showSSOOptions = true,
  title = 'Logga in till DigiNativa'
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    municipality: 'malmo' // Default to Malmö for Anna Svensson
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { login, loginWithSSO, isLoading } = useAuth();
  const toast = useToast();
  
  // Performance tracking for login flow
  const { trackInteraction } = usePerformanceTracker({
    componentName: 'LoginForm',
    trackUserInteractions: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);

    const endTracking = trackInteraction('login_attempt');

    try {
      const result = await login(credentials);
      
      if (result.success) {
        endTracking({ result: 'success' });
        
        toast({
          title: 'Inloggning lyckades',
          description: `Välkommen, ${result.user?.displayName}!`,
          status: 'success',
          duration: 3000,
          isClosable: true
        });

        onSuccess?.();
      } else {
        endTracking({ result: 'error', errorCode: result.error?.code });
        
        setError(getErrorMessage(result.error?.code));
        
        captureError({
          name: 'LoginFormError',
          message: result.error?.message || 'Login failed',
          severity: 'medium',
          category: 'runtime',
          metadata: {
            errorCode: result.error?.code,
            municipality: credentials.municipality
          }
        });
      }
    } catch (error) {
      endTracking({ result: 'error', error: error });
      
      setError('Ett oväntat fel uppstod. Försök igen.');
      
      captureError({
        name: 'LoginFormException',
        message: error instanceof Error ? error.message : 'Unknown login error',
        severity: 'high',
        category: 'runtime'
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSSOLogin = async (provider: string) => {
    if (!credentials.municipality) {
      setError('Vänligen välj din kommun först');
      return;
    }

    const endTracking = trackInteraction('sso_login_attempt');

    try {
      await loginWithSSO(provider, credentials.municipality);
      endTracking({ result: 'success', provider });
    } catch (error) {
      endTracking({ result: 'error', provider, error });
      
      setError('SSO-inloggning misslyckades. Kontakta IT-support.');
      
      captureError({
        name: 'SSOLoginError',
        message: error instanceof Error ? error.message : 'SSO login failed',
        severity: 'high',
        category: 'runtime',
        metadata: { provider, municipality: credentials.municipality }
      });
    }
  };

  const getErrorMessage = (errorCode?: string): string => {
    switch (errorCode) {
      case 'INVALID_CREDENTIALS':
        return 'Felaktig e-post eller lösenord. Kontrollera dina uppgifter.';
      case 'ACCOUNT_LOCKED':
        return 'Ditt konto är låst. Kontakta IT-support för hjälp.';
      case 'ACCOUNT_DISABLED':
        return 'Ditt konto är inaktiverat. Kontakta din administratör.';
      case 'MUNICIPALITY_ACCESS_DENIED':
        return 'Du har inte tillgång till denna kommun.';
      case 'NETWORK_ERROR':
        return 'Nätverksfel. Kontrollera din internetanslutning.';
      default:
        return 'Inloggning misslyckades. Försök igen eller kontakta support.';
    }
  };

  return (
    <Box 
      maxW="400px" 
      mx="auto" 
      p={8} 
      bg="white" 
      borderRadius="lg" 
      boxShadow="lg"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" color="blue.700" mb={2}>
            {title}
          </Heading>
          <Text fontSize="sm" color="gray.600">
            För Sveriges kommuner
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            {allowMunicipalitySelection && (
              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">
                  Kommun
                </FormLabel>
                <Select
                  value={credentials.municipality}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    municipality: e.target.value
                  }))}
                  placeholder="Välj din kommun"
                  bg="gray.50"
                  aria-label="Välj kommun"
                >
                  {MUNICIPALITIES.map(municipality => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold">
                E-postadress
              </FormLabel>
              <Input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                placeholder="anna.svensson@malmo.se"
                bg="gray.50"
                autoComplete="email"
                aria-describedby="email-help"
              />
              <Text id="email-help" fontSize="xs" color="gray.500" mt={1}>
                Använd din kommunala e-postadress
              </Text>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize="sm" fontWeight="semibold">
                Lösenord
              </FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({
                    ...prev,
                    password: e.target.value
                  }))}
                  placeholder="Ange ditt lösenord"
                  bg="gray.50"
                  autoComplete="current-password"
                />
                <InputRightElement>
                  <IconButton
                    aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <HStack justify="space-between">
              <Checkbox
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                size="sm"
              >
                Kom ihåg mig
              </Checkbox>
              <Link fontSize="sm" color="blue.600" href="#forgot-password">
                Glömt lösenord?
              </Link>
            </HStack>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              isLoading={isLoggingIn || isLoading}
              loadingText="Loggar in..."
              disabled={!credentials.email || !credentials.password}
              w="full"
            >
              Logga in
            </Button>
          </VStack>
        </form>

        {/* Development hint */}
        {import.meta.env.DEV && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <Box>
              <Text fontSize="xs" fontWeight="bold">Utvecklingsläge</Text>
              <Text fontSize="xs">
                E-post: anna.svensson@malmo.se<br/>
                Lösenord: demo
              </Text>
            </Box>
          </Alert>
        )}

        {showSSOOptions && (
          <>
            <Divider />
            
            <Box>
              <Text fontSize="sm" fontWeight="semibold" mb={3} textAlign="center">
                Eller logga in med SSO
              </Text>
              
              <VStack spacing={2}>
                {SSO_PROVIDERS.map(provider => (
                  <Button
                    key={provider.id}
                    variant="outline"
                    size="sm"
                    w="full"
                    onClick={() => handleSSOLogin(provider.id)}
                    isLoading={isLoading}
                    leftIcon={<span>🔐</span>}
                  >
                    {provider.name}
                  </Button>
                ))}
              </VStack>
              
              <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
                Kontakta IT-support för SSO-konfiguration
              </Text>
            </Box>
          </>
        )}

        {/* GDPR Notice */}
        <Box p={3} bg="gray.50" borderRadius="md">
          <Text fontSize="xs" color="gray.600" textAlign="center">
            Genom att logga in accepterar du vår{' '}
            <Link color="blue.600" href="/privacy">
              integritetspolicy
            </Link>
            {' '}och{' '}
            <Link color="blue.600" href="/terms">
              användarvillkor
            </Link>
            . Vi följer GDPR och behandlar dina personuppgifter enligt gällande lagstiftning.
          </Text>
        </Box>

        {/* Accessibility info */}
        <Box textAlign="center">
          <Text fontSize="xs" color="gray.500">
            Behöver du hjälp med tillgänglighet?{' '}
            <Link color="blue.600" href="/accessibility">
              Läs vår tillgänglighetsguide
            </Link>
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};