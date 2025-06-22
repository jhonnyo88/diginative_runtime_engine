import React from 'react';
import { Box, Text, HStack, VStack, Image, Badge, Flex } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useCulturalTheme } from './CulturalThemeProvider';

// Municipal Branding Configuration
interface MunicipalBrand {
  id: string;
  name: string;
  displayName: string;
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  culturalAlignment: string[];
  professionalLevel: 'municipal' | 'regional' | 'national' | 'european';
  certificationAuthority: string;
  recognition: {
    governmental: boolean;
    international: boolean;
    eu_recognized: boolean;
  };
}

// Municipal Professional Branding Standards
const municipalBrandingStandards: MunicipalBrand[] = [
  {
    id: 'swedish_municipal',
    name: 'svenska_kommuner',
    displayName: 'Svenska Kommuner och Regioner',
    colors: {
      primary: '#4A90A4',
      secondary: '#F8F9FA', 
      accent: '#7FB069'
    },
    culturalAlignment: ['swedish'],
    professionalLevel: 'national',
    certificationAuthority: 'SKR - Sveriges Kommuner och Regioner',
    recognition: {
      governmental: true,
      international: false,
      eu_recognized: true
    }
  },
  {
    id: 'german_municipal',
    name: 'deutsche_stadte',
    displayName: 'Deutscher Städtetag',
    colors: {
      primary: '#1E3A8A',
      secondary: '#FFFFFF',
      accent: '#6B7280'
    },
    culturalAlignment: ['german'],
    professionalLevel: 'national',
    certificationAuthority: 'DST - Deutscher Städtetag',
    recognition: {
      governmental: true,
      international: false,
      eu_recognized: true
    }
  },
  {
    id: 'french_municipal',
    name: 'fonction_publique',
    displayName: 'Direction Générale de l\'Administration',
    colors: {
      primary: '#1E40AF',
      secondary: '#FAFAFA',
      accent: '#7C3AED'
    },
    culturalAlignment: ['french'],
    professionalLevel: 'national',
    certificationAuthority: 'DGAFP - Direction Générale de l\'Administration et de la Fonction Publique',
    recognition: {
      governmental: true,
      international: false,
      eu_recognized: true
    }
  },
  {
    id: 'dutch_municipal',
    name: 'vng',
    displayName: 'Vereniging van Nederlandse Gemeenten',
    colors: {
      primary: '#2563EB',
      secondary: '#FFFFFF',
      accent: '#F97316'
    },
    culturalAlignment: ['dutch'],
    professionalLevel: 'national',
    certificationAuthority: 'VNG - Vereniging van Nederlandse Gemeenten',
    recognition: {
      governmental: true,
      international: false,
      eu_recognized: true
    }
  },
  {
    id: 'european_municipal',
    name: 'cemr',
    displayName: 'Council of European Municipalities and Regions',
    colors: {
      primary: '#2563EB',
      secondary: '#FFFFFF',
      accent: '#F59E0B'
    },
    culturalAlignment: ['swedish', 'german', 'french', 'dutch'],
    professionalLevel: 'european',
    certificationAuthority: 'CEMR - Council of European Municipalities and Regions',
    recognition: {
      governmental: true,
      international: true,
      eu_recognized: true
    }
  }
];


interface MunicipalBrandingDisplayProps {
  showCertificationLevel?: boolean;
  showGovernmentRecognition?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MunicipalBrandingDisplay: React.FC<MunicipalBrandingDisplayProps> = ({
  showCertificationLevel = true,
  showGovernmentRecognition = true,
  size = 'md'
}) => {
  const { culturalContext, currentTheme } = useCulturalTheme();

  // Get relevant municipal brands for current cultural context

  // Get primary municipal brand for current context
  const _primaryBrand = relevantBrands.find(brand => 
    brand.professionalLevel === 'national'
  ) || relevantBrands[0];

  // Get European-level brand
  const _europeanBrand = municipalBrandingStandards.find(brand => 
    brand.professionalLevel === 'european'
  );



  return (
    <VStack spacing={config.spacing} align="stretch">
      
      {/* Primary Municipal Brand */}
      {primaryBrand && (
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <HStack 
            spacing={config.spacing} 
            p={config.spacing}
            bg={currentTheme.colors.surface}
            borderRadius="lg"
            border="1px solid"
            borderColor={primaryBrand.colors.primary + '30'}
          >
            
            {/* Municipal Logo Placeholder */}
            <Box
              w={config.logoSize}
              h={config.logoSize}
              bg={primaryBrand.colors.primary}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text 
                color="white" 
                fontSize="xs" 
                fontWeight="700"
                textAlign="center"
                lineHeight="tight"
              >
                {primaryBrand.name.substring(0, 3).toUpperCase()}
              </Text>
            </Box>

            {/* Brand Information */}
            <VStack spacing={1} align="start" flex={1}>
              <Text 
                fontSize={config.fontSize}
                fontWeight="600"
                color={primaryBrand.colors.primary}
                lineHeight="tight"
                noOfLines={1}
              >
                {primaryBrand.displayName}
              </Text>
              
              {showCertificationLevel && (
                <Text 
                  fontSize="xs"
                  color={currentTheme.colors.text.secondary}
                  lineHeight="tight"
                  noOfLines={2}
                >
                  {primaryBrand.certificationAuthority}
                </Text>
              )}

              {showGovernmentRecognition && (
                <HStack spacing={1} flexWrap="wrap">
                  {primaryBrand.recognition.governmental && (
                    <Badge 
                      colorScheme="green" 
                      size={config.badgeSize}
                      variant="solid"
                    >
                      Regering
                    </Badge>
                  )}
                  {primaryBrand.recognition.eu_recognized && (
                    <Badge 
                      colorScheme="blue" 
                      size={config.badgeSize}
                      variant="solid"
                    >
                      EU
                    </Badge>
                  )}
                </HStack>
              )}
            </VStack>

          </HStack>
        </MotionBox>
      )}

      {/* European Municipal Brand */}
      {europeanBrand && size !== 'sm' && (
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <HStack 
            spacing={config.spacing}
            p={config.spacing}
            bg="blue.50"
            borderRadius="lg"
            border="1px solid"
            borderColor="blue.200"
          >
            
            {/* European Logo Placeholder */}
            <Box
              w={config.logoSize}
              h={config.logoSize}
              bg={europeanBrand.colors.primary}
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Text 
                color="white" 
                fontSize="xs" 
                fontWeight="700"
                textAlign="center"
                lineHeight="tight"
              >
                EU
              </Text>
            </Box>

            {/* European Brand Information */}
            <VStack spacing={1} align="start" flex={1}>
              <Text 
                fontSize={config.fontSize}
                fontWeight="600"
                color={europeanBrand.colors.primary}
                lineHeight="tight"
                noOfLines={1}
              >
                {europeanBrand.displayName}
              </Text>
              
              {showCertificationLevel && (
                <Text 
                  fontSize="xs"
                  color="blue.600"
                  lineHeight="tight"
                  noOfLines={2}
                >
                  European Municipal Professional Standards
                </Text>
              )}

              {showGovernmentRecognition && (
                <HStack spacing={1}>
                  <Badge colorScheme="blue" size={config.badgeSize} variant="solid">
                    Europeisk
                  </Badge>
                  <Badge colorScheme="green" size={config.badgeSize} variant="solid">
                    Internationell
                  </Badge>
                </HStack>
              )}
            </VStack>

          </HStack>
        </MotionBox>
      )}

    </VStack>
  );
};

// Professional Certification Badge Component
interface ProfessionalCertificationBadgeProps {
  certificationLevel: string;
  culturalContext: string;
  issuedBy?: string;
  validUntil?: Date;
  size?: 'sm' | 'md' | 'lg';
}

export const ProfessionalCertificationBadge: React.FC<ProfessionalCertificationBadgeProps> = ({
  certificationLevel,
  culturalContext,
  issuedBy,
  validUntil,
  size = 'md'
}) => {
  const { currentTheme } = useCulturalTheme();

  // Get relevant municipal brand
  const _municipalBrand = municipalBrandingStandards.find(brand => 
    brand.culturalAlignment.includes(culturalContext) && 
    brand.professionalLevel === 'national'
  );



  return (
    <MotionBox
      initial={{ opacity: 0, rotateY: -10 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6 }}
      w={config.w}
      h={config.h}
      bg="white"
      borderRadius="xl"
      border="3px solid"
      borderColor={municipalBrand?.colors.primary || currentTheme.colors.primary}
      boxShadow="xl"
      position="relative"
      overflow="hidden"
    >
      
      {/* Header */}
      <Box
        bg={municipalBrand?.colors.primary || currentTheme.colors.primary}
        color="white"
        p={2}
        textAlign="center"
      >
        <Text fontSize="xs" fontWeight="700" letterSpacing="wide">
          PROFESSIONELL
        </Text>
        <Text fontSize="xs" fontWeight="700" letterSpacing="wide">
          CERTIFIERING
        </Text>
      </Box>

      {/* Content */}
      <VStack spacing={2} p={3} flex={1} justify="center">
        
        {/* Certification Level */}
        <Text
          fontSize={config.fontSize}
          fontWeight="700"
          color={municipalBrand?.colors.primary || currentTheme.colors.primary}
          textAlign="center"
          lineHeight="tight"
          noOfLines={3}
        >
          {certificationLevel}
        </Text>

        {/* Issued By */}
        {issuedBy && (
          <Text
            fontSize="xs"
            color="gray.600"
            textAlign="center"
            lineHeight="tight"
            noOfLines={2}
          >
            Utfärdat av: {issuedBy}
          </Text>
        )}

        {/* Validity */}
        {validUntil && (
          <Badge
            colorScheme="green"
            size={config.badgeSize}
            variant="solid"
          >
            Giltigt till {validUntil.getFullYear()}
          </Badge>
        )}

      </VStack>

      {/* Municipal Brand Logo */}
      {municipalBrand && (
        <Box
          position="absolute"
          bottom={2}
          right={2}
          w="20px"
          h="20px"
          bg={municipalBrand.colors.primary}
          borderRadius="sm"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="white" fontSize="2xs" fontWeight="700">
            {municipalBrand.name.substring(0, 2).toUpperCase()}
          </Text>
        </Box>
      )}

    </MotionBox>
  );
};

// Municipal Professional Standards Display
interface MunicipalStandardsDisplayProps {
  standards: string[];
  culturalContext: string;
}

export const MunicipalStandardsDisplay: React.FC<MunicipalStandardsDisplayProps> = ({
  standards,
  culturalContext
}) => {
  const { currentTheme } = useCulturalTheme();

  const culturalStandardsMap: Record<string, Record<string, string>> = {
    swedish: {
      'wcag_compliance': 'WCAG 2.1 AA Tillgänglighet',
      'gdpr_compliance': 'GDPR Dataskydd',
      'municipal_ethics': 'Kommunal Etik Standard',
      'professional_development': 'Professionell Utveckling Standard'
    },
    german: {
      'wcag_compliance': 'WCAG 2.1 AA Barrierefreiheit',
      'gdpr_compliance': 'DSGVO Datenschutz',
      'municipal_ethics': 'Verwaltungsethik Standard',
      'professional_development': 'Professionelle Entwicklung Standard'
    },
    french: {
      'wcag_compliance': 'WCAG 2.1 AA Accessibilité',
      'gdpr_compliance': 'RGPD Protection des Données',
      'municipal_ethics': 'Éthique du Service Public',
      'professional_development': 'Standard de Développement Professionnel'
    },
    dutch: {
      'wcag_compliance': 'WCAG 2.1 AA Toegankelijkheid',
      'gdpr_compliance': 'AVG Gegevensbescherming',
      'municipal_ethics': 'Gemeentelijke Ethiek Standard',
      'professional_development': 'Professionele Ontwikkeling Standard'
    }
  };


  return (
    <VStack spacing={2} align="stretch">
      <Text
        fontSize="sm"
        fontWeight="600"
        color={currentTheme.colors.primary}
        mb={1}
      >
        Professionella Standarder
      </Text>
      
      {standards.map((standard, index) => {
        
        return (
          <MotionBox
            key={standard}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <HStack spacing={2}>
              <Box
                w={2}
                h={2}
                bg={currentTheme.colors.accent}
                borderRadius="full"
                flexShrink={0}
              />
              <Text
                fontSize="xs"
                color={currentTheme.colors.text.secondary}
                lineHeight="tight"
              >
                {displayName}
              </Text>
            </HStack>
          </MotionBox>
        );
      })}
    </VStack>
  );
};

// Export municipal branding standards for external use
export { municipalBrandingStandards, type MunicipalBrand };