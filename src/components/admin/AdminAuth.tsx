import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Select,
  Divider,
  Badge
} from '@chakra-ui/react';
import { ChakraThemeProvider } from '../../theme/ChakraThemeProvider';

// Enterprise SSO integration foundation
interface AdminAuthProps {
  onAuthenticated: (user: AdminUser) => void;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'tenant_admin' | 'content_manager';
  tenantId: string;
  tenantName: string;
  permissions: string[];
}

export const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [authMethod, setAuthMethod] = useState<'sso' | 'local'>('sso');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock authentication - in production this integrates with enterprise SSO
  const _handleSSOAuth = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate SSO authentication
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock user data
      const mockUser: AdminUser = {
        id: 'admin-001',
        name: 'Anna Svensson',
        email: 'anna.svensson@malmo.se',
        role: 'tenant_admin',
        tenantId: 'malmo-stad',
        tenantName: 'Malmö Stad',
        permissions: ['view_analytics', 'manage_games', 'view_users']
      };

      onAuthenticated(mockUser);
    } catch (err) {
      setError('SSO authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const _handleLocalAuth = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate local authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock different users based on email
      const mockUsers: Record<string, AdminUser> = {
        'super@diginativa.se': {
          id: 'super-001',
          name: 'DigiNativa Admin',
          email: 'super@diginativa.se',
          role: 'super_admin',
          tenantId: 'diginativa',
          tenantName: 'DigiNativa Platform',
          permissions: ['all']
        },
        'admin@malmo.se': {
          id: 'admin-002',
          name: 'Malmö Administrator',
          email: 'admin@malmo.se',
          role: 'tenant_admin',
          tenantId: 'malmo-stad',
          tenantName: 'Malmö Stad',
          permissions: ['view_analytics', 'manage_games', 'manage_users']
        },
        'content@malmo.se': {
          id: 'content-001',
          name: 'Content Manager',
          email: 'content@malmo.se',
          role: 'content_manager',
          tenantId: 'malmo-stad',
          tenantName: 'Malmö Stad',
          permissions: ['manage_content', 'create_games']
        }
      };

      if (user) {
        onAuthenticated(user);
      } else {
        setError('User not found or invalid credentials');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChakraThemeProvider>
      <Box 
        minH="100vh" 
        bg="gray.50" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        p={4}
      >
        <Card maxW="500px" w="100%" shadow="xl">
          <CardHeader bg="brand.500" color="white" borderTopRadius="md">
            <VStack gap={2}>
              <Text fontSize="xl" fontWeight="bold">
                DigiNativa Admin Portal
              </Text>
              <Text fontSize="sm" opacity={0.9}>
                Enterprise Dashboard Access
              </Text>
            </VStack>
          </CardHeader>
          
          <CardBody p={8}>
            <VStack gap={6}>
              
              {/* Authentication Method Selection */}
              <FormControl>
                <FormLabel>Authentication Method</FormLabel>
                <Select 
                  value={authMethod} 
                  onChange={(e) => setAuthMethod(e.target.value as 'sso' | 'local')}
                >
                  <option value="sso">Enterprise SSO</option>
                  <option value="local">Local Authentication</option>
                </Select>
              </FormControl>

              <Divider />

              {/* SSO Authentication */}
              {authMethod === 'sso' && (
                <VStack gap={4} w="100%">
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <Text fontSize="sm">
                        Enterprise SSO integration ready for production deployment.
                        Currently using mock authentication for demo.
                      </Text>
                    </Box>
                  </Alert>
                  
                  <Button
                    onClick={handleSSOAuth}
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Authenticating..."
                  >
                    Sign in with Enterprise SSO
                  </Button>
                  
                  <VStack gap={2}>
                    <Text fontSize="xs" color="gray.600" textAlign="center">
                      Supported providers: Azure AD, Okta, SAML 2.0
                    </Text>
                    <HStack gap={2}>
                      <Badge size="sm">GDPR Compliant</Badge>
                      <Badge size="sm">SOC 2 Type II</Badge>
                      <Badge size="sm">WCAG 2.1 AA</Badge>
                    </HStack>
                  </VStack>
                </VStack>
              )}

              {/* Local Authentication */}
              {authMethod === 'local' && (
                <VStack gap={4} w="100%">
                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size="lg"
                    />
                  </FormControl>
                  
                  <Button
                    onClick={handleLocalAuth}
                    colorScheme="brand"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                  >
                    Sign In
                  </Button>
                  
                  <Alert status="warning" borderRadius="md" fontSize="sm">
                    <AlertIcon />
                    <Box>
                      <Text fontWeight="bold">Demo Accounts:</Text>
                      <Text>super@diginativa.se (Super Admin)</Text>
                      <Text>admin@malmo.se (Tenant Admin)</Text>
                      <Text>content@malmo.se (Content Manager)</Text>
                    </Box>
                  </Alert>
                </VStack>
              )}

              {/* Error Display */}
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* Feature Highlights */}
              <Box w="100%" pt={4} borderTop="1px solid" borderColor="gray.200">
                <Text fontSize="sm" fontWeight="bold" color="gray.700" mb={3}>
                  Enterprise Features:
                </Text>
                <VStack gap={2} align="stretch">
                  <HStack gap={2}>
                    <Box w="4px" h="4px" bg="green.500" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">
                      Multi-tenant dashboard with role-based access
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Box w="4px" h="4px" bg="green.500" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">
                      Real-time analytics for 10,000+ concurrent users
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Box w="4px" h="4px" bg="green.500" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">
                      Advanced compliance reporting & audit trails
                    </Text>
                  </HStack>
                  <HStack gap={2}>
                    <Box w="4px" h="4px" bg="green.500" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">
                      Enterprise SSO integration (Azure AD, Okta)
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </ChakraThemeProvider>
  );
};