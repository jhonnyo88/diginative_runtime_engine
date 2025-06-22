import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Icon,
  Button,
  Avatar,
  Flex,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiAward,
  FiGlobe,
  FiCheck,
  FiStar,
  FiUsers,
  FiTrendingUp,
  FiFlag,
  FiSettings
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';
import { MunicipalBrandingDisplay, municipalBrandingStandards, type MunicipalBrand } from './MunicipalBrandingSystem';


// Enhanced Municipal Branding Integration
interface MunicipalBrandingConfiguration {
  id: string;
  name: string;
  displayName: string;
  municipalityName: string;
  region: string;
  country: string;
  population: number;
  brandingStandards: {
    primary: MunicipalBrand;
    secondary?: MunicipalBrand;
    european: MunicipalBrand;
  };
  certificationLevels: {
    current: string;
    target: string;
    requirements: string[];
  };
  professionalDevelopmentAlignment: {
    hrIntegration: boolean;
    careerPathways: string[];
    performanceMetrics: string[];
  };
  visualIdentity: {
    logoUrl?: string;
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography: {
      fontFamily: string;
      headingWeight: number;
    };
  };
  stakeholderRecognition: {
    executiveApproval: boolean;
    hrDepartmentEndorsement: boolean;
    unionSupport: boolean;
    citizenAwareness: number; // percentage
  };
}

// Sample Municipal Branding Configurations
const municipalBrandingConfigurations: MunicipalBrandingConfiguration[] = [
  {
    id: 'stockholm_municipality',
    name: 'stockholm',
    displayName: 'Stockholms Stad',
    municipalityName: 'Stockholm',
    region: 'Stockholm County',
    country: 'Sweden',
    population: 978000,
    brandingStandards: {
      primary: municipalBrandingStandards.find(b => b.name === 'svenska_kommuner')!,
      european: municipalBrandingStandards.find(b => b.name === 'cemr')!
    },
    certificationLevels: {
      current: 'Kompetent Kommunal Professional',
      target: 'Expert Kommunal Professional',
      requirements: [
        'Digital Transformation World completion',
        'European Cultural Intelligence certification',
        'Stakeholder Relations mastery'
      ]
    },
    professionalDevelopmentAlignment: {
      hrIntegration: true,
      careerPathways: ['Senior Handläggare', 'Enhetschef', 'Avdelningschef', 'Förvaltningschef'],
      performanceMetrics: ['Citizen Service Quality', 'Digital Adoption Rate', 'Cross-Cultural Competency']
    },
    visualIdentity: {
      colorScheme: {
        primary: '#003366',
        secondary: '#F8F9FA',
        accent: '#0066CC'
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
        headingWeight: 700
      }
    },
    stakeholderRecognition: {
      executiveApproval: true,
      hrDepartmentEndorsement: true,
      unionSupport: true,
      citizenAwareness: 78
    }
  },
  {
    id: 'gothenburg_municipality',
    name: 'gothenburg',
    displayName: 'Göteborgs Stad',
    municipalityName: 'Göteborg',
    region: 'Västra Götaland County',
    country: 'Sweden',
    population: 579000,
    brandingStandards: {
      primary: municipalBrandingStandards.find(b => b.name === 'svenska_kommuner')!,
      european: municipalBrandingStandards.find(b => b.name === 'cemr')!
    },
    certificationLevels: {
      current: 'Skicklig Kommunal Professional',
      target: 'Master Kommunal Professional',
      requirements: [
        'All 5 World completions',
        'Cross-European collaboration project',
        'Innovation leadership demonstration'
      ]
    },
    professionalDevelopmentAlignment: {
      hrIntegration: true,
      careerPathways: ['Projektledare', 'Strategisk chef', 'Kommundirektör'],
      performanceMetrics: ['Innovation Index', 'European Collaboration Score', 'Sustainability Impact']
    },
    visualIdentity: {
      colorScheme: {
        primary: '#006633',
        secondary: '#FFFFFF',
        accent: '#33CC66'
      },
      typography: {
        fontFamily: 'Source Sans Pro, sans-serif',
        headingWeight: 600
      }
    },
    stakeholderRecognition: {
      executiveApproval: true,
      hrDepartmentEndorsement: true,
      unionSupport: true,
      citizenAwareness: 84
    }
  },
  {
    id: 'berlin_municipality',
    name: 'berlin',
    displayName: 'Berlin Verwaltung',
    municipalityName: 'Berlin',
    region: 'Berlin',
    country: 'Germany',
    population: 3677000,
    brandingStandards: {
      primary: municipalBrandingStandards.find(b => b.name === 'deutsche_stadte')!,
      european: municipalBrandingStandards.find(b => b.name === 'cemr')!
    },
    certificationLevels: {
      current: 'Erfahrene Verwaltungsfachkraft',
      target: 'Experte Verwaltungsfachkraft',
      requirements: [
        'Systematische Prozessoptimierung',
        'Europäische Verwaltungskooperation',
        'Qualitätsmanagementsystem Implementation'
      ]
    },
    professionalDevelopmentAlignment: {
      hrIntegration: true,
      careerPathways: ['Sachbearbeiter', 'Referent', 'Abteilungsleiter', 'Staatssekretär'],
      performanceMetrics: ['Process Efficiency', 'Quality Standards Compliance', 'Cross-Border Cooperation']
    },
    visualIdentity: {
      colorScheme: {
        primary: '#CC0000',
        secondary: '#FFFFFF',
        accent: '#000000'
      },
      typography: {
        fontFamily: 'Roboto, sans-serif',
        headingWeight: 700
      }
    },
    stakeholderRecognition: {
      executiveApproval: true,
      hrDepartmentEndorsement: true,
      unionSupport: true,
      citizenAwareness: 72
    }
  }
];

interface MunicipalBrandingCardProps {
  configuration: MunicipalBrandingConfiguration;
  isActive: boolean;
  onClick: () => void;
}

const MunicipalBrandingCard: React.FC<MunicipalBrandingCardProps> = ({
  configuration,
  isActive,
  onClick
}) => {
  const { currentTheme } = useCulturalTheme();

  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      cursor="pointer"
      onClick={onClick}
      bg={isActive ? configuration.visualIdentity.colorScheme.primary + '10' : 'white'}
      borderColor={isActive ? configuration.visualIdentity.colorScheme.primary : 'gray.200'}
      borderWidth="2px"
      boxShadow={isActive ? `0 8px 25px ${configuration.visualIdentity.colorScheme.primary}30` : 'md'}
      _hover={{
        boxShadow: `0 12px 35px ${configuration.visualIdentity.colorScheme.primary}40`
      }}
      transition="all 0.3s ease"
    >
      <CardHeader pb={3}>
        <HStack justify="space-between">
          <HStack spacing={3}>
            {/* Municipal Logo/Identity */}
            <Box
              w={12}
              h={12}
              bg={configuration.visualIdentity.colorScheme.primary}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="white" fontWeight="700" fontSize="sm">
                {configuration.municipalityName.substring(0, 2).toUpperCase()}
              </Text>
            </Box>
            
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="700" color={configuration.visualIdentity.colorScheme.primary}>
                {configuration.displayName}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {configuration.population.toLocaleString()} invånare • {configuration.region}
              </Text>
            </VStack>
          </HStack>
          
          {isActive && (
            <Icon as={FiCheck} w={6} h={6} color={configuration.visualIdentity.colorScheme.primary} />
          )}
        </HStack>
      </CardHeader>
      
      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          
          {/* Certification Status */}
          <Box>
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                Professional Certification:
              </Text>
              <Badge
                colorScheme="blue"
                variant="solid"
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
              >
                {configuration.certificationLevels.current}
              </Badge>
            </HStack>
            <Text fontSize="xs" color="gray.600">
              Target: {configuration.certificationLevels.target}
            </Text>
          </Box>

          {/* Branding Standards */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
              Certification Authorities:
            </Text>
            <VStack spacing={1} align="stretch">
              <HStack spacing={2}>
                <Icon as={FiShield} w={3} h={3} color={configuration.visualIdentity.colorScheme.primary} />
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {configuration.brandingStandards.primary.certificationAuthority}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Icon as={FiGlobe} w={3} h={3} color="blue.500" />
                <Text fontSize="xs" color="gray.600" noOfLines={1}>
                  {configuration.brandingStandards.european.certificationAuthority}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Stakeholder Recognition */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
              Stakeholder Support:
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              <HStack spacing={2}>
                <Icon 
                  as={configuration.stakeholderRecognition.executiveApproval ? FiCheck : FiUsers} 
                  w={3} 
                  h={3} 
                  color={configuration.stakeholderRecognition.executiveApproval ? "green.500" : "gray.400"} 
                />
                <Text fontSize="xs" color="gray.600">
                  Executive
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Icon 
                  as={configuration.stakeholderRecognition.hrDepartmentEndorsement ? FiCheck : FiUsers} 
                  w={3} 
                  h={3} 
                  color={configuration.stakeholderRecognition.hrDepartmentEndorsement ? "green.500" : "gray.400"} 
                />
                <Text fontSize="xs" color="gray.600">
                  HR
                </Text>
              </HStack>
            </Grid>
            <HStack justify="space-between" mt={2}>
              <Text fontSize="xs" color="gray.600">
                Citizen Awareness:
              </Text>
              <Text fontSize="xs" fontWeight="600" color={configuration.visualIdentity.colorScheme.primary}>
                {configuration.stakeholderRecognition.citizenAwareness}%
              </Text>
            </HStack>
          </Box>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

interface MunicipalBrandingDetailsProps {
  configuration: MunicipalBrandingConfiguration;
}

const MunicipalBrandingDetails: React.FC<MunicipalBrandingDetailsProps> = ({ configuration }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card bg="white" borderColor={configuration.visualIdentity.colorScheme.primary + '30'} borderWidth="2px">
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="700" color={configuration.visualIdentity.colorScheme.primary}>
              {configuration.displayName} - Professional Development Integration
            </Text>
            <Badge colorScheme="green" variant="solid" p={2} borderRadius="lg">
              Active Configuration
            </Badge>
          </HStack>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={6} align="stretch">
            
            {/* Municipal Branding Display Integration */}
            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
                Official Municipal Branding:
              </Text>
              <MunicipalBrandingDisplay size="md" />
            </Box>

            <Divider />

            {/* Professional Development Alignment */}
            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
                Professional Development Alignment:
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="md" fontWeight="600" color={configuration.visualIdentity.colorScheme.primary}>
                    Career Pathways:
                  </Text>
                  {configuration.professionalDevelopmentAlignment.careerPathways.map((pathway, index) => (
                    <HStack key={index} spacing={3}>
                      <Icon as={FiTrendingUp} w={4} h={4} color={configuration.visualIdentity.colorScheme.accent} />
                      <Text fontSize="sm" color="gray.600">
                        {pathway}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                <VStack align="stretch" spacing={3}>
                  <Text fontSize="md" fontWeight="600" color={configuration.visualIdentity.colorScheme.primary}>
                    Performance Metrics:
                  </Text>
                  {configuration.professionalDevelopmentAlignment.performanceMetrics.map((metric, index) => (
                    <HStack key={index} spacing={3}>
                      <Icon as={FiStar} w={4} h={4} color={configuration.visualIdentity.colorScheme.accent} />
                      <Text fontSize="sm" color="gray.600">
                        {metric}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

              </Grid>
            </Box>

            <Divider />

            {/* Certification Requirements */}
            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
                Certification Progression:
              </Text>
              
              <HStack spacing={4} mb={4}>
                <Badge colorScheme="blue" variant="solid" p={2} borderRadius="lg">
                  Current: {configuration.certificationLevels.current}
                </Badge>
                <Icon as={FiTrendingUp} w={5} h={5} color={configuration.visualIdentity.colorScheme.primary} />
                <Badge colorScheme="green" variant="outline" p={2} borderRadius="lg">
                  Target: {configuration.certificationLevels.target}
                </Badge>
              </HStack>

              <Text fontSize="md" fontWeight="600" color={configuration.visualIdentity.colorScheme.primary} mb={3}>
                Requirements för Next Level:
              </Text>
              <VStack spacing={2} align="stretch">
                {configuration.certificationLevels.requirements.map((requirement, index) => (
                  <HStack key={index} spacing={3}>
                    <Icon as={FiCheck} w={4} h={4} color="green.500" />
                    <Text fontSize="sm" color="gray.600">
                      {requirement}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Divider />

            {/* Stakeholder Recognition Details */}
            <Box>
              <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
                Stakeholder Recognition Status:
              </Text>
              
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <Card bg={configuration.stakeholderRecognition.executiveApproval ? "green.50" : "gray.50"}>
                  <CardBody p={4} textAlign="center">
                    <Icon 
                      as={configuration.stakeholderRecognition.executiveApproval ? FiCheck : FiUsers} 
                      w={8} 
                      h={8} 
                      color={configuration.stakeholderRecognition.executiveApproval ? "green.500" : "gray.400"}
                      mb={2}
                    />
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      Executive Approval
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {configuration.stakeholderRecognition.executiveApproval ? "Approved" : "Pending"}
                    </Text>
                  </CardBody>
                </Card>

                <Card bg={configuration.stakeholderRecognition.hrDepartmentEndorsement ? "green.50" : "gray.50"}>
                  <CardBody p={4} textAlign="center">
                    <Icon 
                      as={configuration.stakeholderRecognition.hrDepartmentEndorsement ? FiCheck : FiUsers} 
                      w={8} 
                      h={8} 
                      color={configuration.stakeholderRecognition.hrDepartmentEndorsement ? "green.500" : "gray.400"}
                      mb={2}
                    />
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      HR Endorsement
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {configuration.stakeholderRecognition.hrDepartmentEndorsement ? "Endorsed" : "Pending"}
                    </Text>
                  </CardBody>
                </Card>

                <Card bg="blue.50">
                  <CardBody p={4} textAlign="center">
                    <Text fontSize="2xl" fontWeight="800" color="blue.500" mb={1}>
                      {configuration.stakeholderRecognition.citizenAwareness}%
                    </Text>
                    <Text fontSize="sm" fontWeight="600" color="gray.700">
                      Citizen Awareness
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Public Recognition
                    </Text>
                  </CardBody>
                </Card>
              </Grid>
            </Box>

          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
};

interface MunicipalBrandingIntegrationProps {
  onConfigurationChange?: (configurationId: string) => void;
  showDetailedView?: boolean;
}

export const MunicipalBrandingIntegration: React.FC<MunicipalBrandingIntegrationProps> = ({
  onConfigurationChange = () => console.log('Municipal branding configuration changed'),
  showDetailedView = true
}) => {
  const { culturalContext } = useCulturalTheme();
  const [selectedConfiguration, setSelectedConfiguration] = useState<string>(
    municipalBrandingConfigurations[0].id
  );

  // Filter configurations by cultural context
};
