import React from 'react';
import { VStack, HStack, Text, Box, Divider } from '@chakra-ui/react';
import { MunicipalButton } from './MunicipalButton';
import { getButtonText } from '../../theme/municipalButtonTheme';

/**
 * Example implementations of the Municipal Button System
 * Based on Game Designer task-gd-007 specifications
 */
export const MunicipalButtonExamples: React.FC = () => {
  const [culturalContext, setCulturalContext] = React.useState<'swedish' | 'german' | 'french' | 'dutch'>('swedish');
  const [isLoading, setIsLoading] = React.useState(false);


  return (
    <VStack spacing={8} align="stretch" p={8}>
      <Text fontSize="2xl" fontWeight="bold">Municipal Button System Examples</Text>
      
      {/* Button Hierarchy */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Button Hierarchy</Text>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="sm" color="gray.600" mb={2}>Primary Actions (Main CTAs)</Text>
            <HStack spacing={4}>
              <MunicipalButton 
                variant="municipal-primary"
                culturalContext={culturalContext}
                onClick={handlePrimaryAction}
                isLoading={isLoading}
              >
                {getButtonText('start', culturalContext)}
              </MunicipalButton>
              <MunicipalButton 
                variant="municipal-primary"
                culturalContext={culturalContext}
              >
                {getButtonText('submit', culturalContext)}
              </MunicipalButton>
            </HStack>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.600" mb={2}>Secondary Actions (Support)</Text>
            <HStack spacing={4}>
              <MunicipalButton 
                variant="municipal-secondary"
                culturalContext={culturalContext}
              >
                {getButtonText('cancel', culturalContext)}
              </MunicipalButton>
              <MunicipalButton 
                variant="municipal-secondary"
                culturalContext={culturalContext}
              >
                {getButtonText('back', culturalContext)}
              </MunicipalButton>
            </HStack>
          </Box>

          <Box>
            <Text fontSize="sm" color="gray.600" mb={2}>Outline Actions (Tertiary)</Text>
            <HStack spacing={4}>
              <MunicipalButton 
                variant="municipal-outline"
                culturalContext={culturalContext}
              >
                {getButtonText('help', culturalContext)}
              </MunicipalButton>
              <MunicipalButton 
                variant="municipal-outline"
                culturalContext={culturalContext}
              >
                {getButtonText('support', culturalContext)}
              </MunicipalButton>
            </HStack>
          </Box>
        </VStack>
      </Box>

      <Divider />

      {/* Cultural Context Examples */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Cultural Context Adaptation</Text>
        <HStack spacing={4} mb={4}>
          {(['swedish', 'german', 'french', 'dutch'] as const).map((context) => (
            <MunicipalButton
              key={context}
              variant={context === culturalContext ? 'municipal-primary' : 'municipal-secondary'}
              onClick={() => setCulturalContext(context)}
              size="municipal-sm"
            >
              {context.charAt(0).toUpperCase() + context.slice(1)}
            </MunicipalButton>
          ))}
        </HStack>
        
        <VStack spacing={3} align="stretch">
          <MunicipalButton 
            variant={`${culturalContext}-primary` as any}
            culturalContext={culturalContext}
            municipalEntity={
              culturalContext === 'swedish' ? 'Malmö Stad' :
              culturalContext === 'german' ? 'Berlin' :
              culturalContext === 'french' ? 'Paris' :
              'Amsterdam'
            }
          >
            {getButtonText('start', culturalContext)}
          </MunicipalButton>
        </VStack>
      </Box>

      <Divider />

      {/* States and Interactions */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>States and Interactions</Text>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <MunicipalButton variant="municipal-primary">
              Normal State
            </MunicipalButton>
            <MunicipalButton variant="municipal-primary" isLoading>
              Loading State
            </MunicipalButton>
            <MunicipalButton variant="municipal-primary" isDisabled>
              Disabled State
            </MunicipalButton>
          </HStack>
        </VStack>
      </Box>

      <Divider />

      {/* Mobile Optimization (Anna Svensson) */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Mobile Optimization</Text>
        <Text fontSize="sm" color="gray.600" mb={4}>
          Buttons automatically optimize for Anna Svensson's iPhone 12 with 48px minimum touch targets
        </Text>
        <VStack spacing={4} align="stretch">
          <MunicipalButton 
            variant="municipal-primary"
            annaOptimization={true}
            culturalContext="swedish"
            municipalEntity="Malmö Stad"
          >
            Optimerad för mobil användning
          </MunicipalButton>
        </VStack>
      </Box>

      <Divider />

      {/* Accessibility Features */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Accessibility Features</Text>
        <VStack spacing={4} align="stretch">
          <MunicipalButton 
            variant="municipal-primary"
            culturalContext="swedish"
            accessibilityStandard="DOS2018"
            aria-label="Starta GDPR-utbildningen för Malmö Stad"
            aria-describedby="gdpr-training-description"
          >
            DOS 2018:1937 Compliant Button
          </MunicipalButton>
          <Text id="gdpr-training-description" fontSize="sm" color="gray.600">
            This button follows Swedish government accessibility standards
          </Text>
        </VStack>
      </Box>

      <Divider />

      {/* Real-world Usage Examples */}
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={4}>Real-world Usage</Text>
        <VStack spacing={6} align="stretch">
          {/* Quiz Scene Example */}
          <Box p={4} borderWidth={1} borderRadius="md">
            <Text fontSize="md" fontWeight="medium" mb={3}>Quiz Scene Navigation</Text>
            <HStack spacing={4}>
              <MunicipalButton 
                variant="municipal-primary"
                culturalContext={culturalContext}
                isDisabled={false}
                aria-label="Submit quiz answer"
              >
                {getButtonText('submit', culturalContext)}
              </MunicipalButton>
              <MunicipalButton 
                variant="municipal-secondary"
                culturalContext={culturalContext}
              >
                {getButtonText('tryAgain', culturalContext)}
              </MunicipalButton>
            </HStack>
          </Box>

          {/* Dialogue Scene Example */}
          <Box p={4} borderWidth={1} borderRadius="md">
            <Text fontSize="md" fontWeight="medium" mb={3}>Dialogue Scene Progress</Text>
            <HStack spacing={4}>
              <MunicipalButton 
                variant="municipal-primary"
                culturalContext={culturalContext}
                progressContext="section"
              >
                {getButtonText('next', culturalContext)}
              </MunicipalButton>
              <MunicipalButton 
                variant="municipal-outline"
                culturalContext={culturalContext}
              >
                {getButtonText('back', culturalContext)}
              </MunicipalButton>
            </HStack>
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
};