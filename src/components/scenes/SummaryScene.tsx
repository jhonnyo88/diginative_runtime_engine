import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Button, 
  Card,
  CardBody,
  Progress,
  Badge,
  Alert,
  SimpleGrid,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useBreakpointValue,
  Image,
  Link,
  Stack,
  Flex
} from '@chakra-ui/react';
import type { SummaryScene as SummarySceneType } from '../../types/game-manifest';
import { CheckIcon, StarIcon, ClockIcon, CertificateIcon } from '../icons/GameIcons';
import { validateMunicipalBranding, getMunicipalThemeOverrides, type MunicipalBranding } from '../../utils/municipalBranding';

interface SummarySceneProps {
  scene: SummarySceneType;
  onComplete: (results: Record<string, unknown>) => void;
  analytics?: {
    trackEvent: (eventType: string, data: Record<string, unknown>) => void;
  };
  // Municipal branding integration
  municipalBranding?: Partial<MunicipalBranding>;
}

export const SummaryScene: React.FC<SummarySceneProps> = ({
  scene,
  onComplete,
  analytics,
  municipalBranding,
}) => {
  const [showContent, setShowContent] = useState(false);
  
  // Professional completion entrance - subtle fade-in with reduced motion support
  useEffect(() => {
    return () => clearTimeout(timer);
  }, []);
  
  // Responsive design breakpoints for Anna Svensson iPhone 12 optimization
  
  // Accessibility - Check for reduced motion preference
  const _getTransition = (defaultTransition: string) => 
    prefersReducedMotion ? 'none' : defaultTransition;
  
  // Municipal branding validation and application
  const { sanitizedBranding } = validateMunicipalBranding(municipalBranding);

  // Municipal completion data - streamlined for professional context


  // Municipal color scheme - professional blue instead of gaming colors

  // Municipal Summary Header Component
  const _MunicipalSummaryHeader = () => (
    <Card 
      as="header"
      role="banner"
      bg={`linear-gradient(135deg, ${sanitizedBranding.primaryColor} 0%, ${sanitizedBranding.primaryColor}CC 100%)`}
      color="white"
      mb={6}
      borderRadius={isMobile ? "xl" : "2xl"}
      overflow="hidden"
      transform={showContent ? 'translateY(0)' : 'translateY(-10px)'}
      opacity={showContent ? 1 : 0}
      transition={getTransition('all 0.6s ease-out')}
      aria-labelledby="completion-title"
      aria-describedby="completion-description"
    >
      <CardBody p={isMobile ? 6 : 8}>
        <VStack spacing={4} textAlign="center">
          {/* Municipal Authority Header */}
          <HStack spacing={3} justify="center" role="group" aria-label="Municipal authority and completion status">
            {sanitizedBranding.logoUrl && (
              <Image 
                src={sanitizedBranding.logoUrl} 
                alt={`${sanitizedBranding.municipality} logotyp`}
                maxH="32px"
                objectFit="contain"
                role="img"
              />
            )}
            <Text 
              fontSize={isMobile ? "md" : "lg"} 
              fontWeight="medium" 
              opacity={0.9}
              role="text"
            >
              {sanitizedBranding.municipality}
            </Text>
            <CheckIcon w="20px" h="20px" color="white" aria-label="Godkänd status" />
          </HStack>
          
          {/* Professional Completion Title */}
          <Text 
            id="completion-title"
            as="h1"
            fontSize={isMobile ? "xl" : "2xl"} 
            fontWeight="bold"
            lineHeight="1.2"
            role="heading"
            aria-level={1}
          >
            GDPR-utbildning Slutförd
          </Text>
          
          {/* Municipal Certification */}
          <Text 
            id="completion-description"
            fontSize={isMobile ? "sm" : "md"} 
            opacity={0.9}
            fontWeight="medium"
            role="text"
          >
            Du har framgångsrikt genomfört din kompetensutveckling
          </Text>
          
          <Text 
            fontSize="sm" 
            opacity={0.8}
            fontWeight="medium"
            role="text"
            aria-label={`Certifierad av ${gameData.municipalContext.authority}`}
          >
            Certifierad av {gameData.municipalContext.authority}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
  
  return (
    <Box 
      as="main"
      role="main"
      p={isMobile ? 4 : 6} 
      maxW={isMobile ? "100%" : "800px"} 
      mx="auto" 
      minH="100vh" 
      bg="gray.50"
      sx={municipalTheme as any}
      aria-label="GDPR-utbildning sammanfattning"
    >
      <MunicipalSummaryHeader />

      {/* Essential Municipal Results Card */}
      <Card 
        as="section"
        role="region"
        aria-labelledby="results-heading"
        mb={6} 
        bg="white" 
        shadow="md"
        borderRadius={isMobile ? "xl" : "2xl"}
        transform={showContent ? 'translateY(0)' : 'translateY(10px)'}
        opacity={showContent ? 1 : 0}
        transition={getTransition('all 0.6s ease-out 0.3s')}
      >
        <CardBody p={isMobile ? 6 : 8}>
          <VStack spacing={6}>
            {/* Completion Status */}
            <VStack spacing={3} textAlign="center">
              <HStack spacing={3} justify="center" role="group" aria-label="Slutresultat">
                <CheckIcon w="24px" h="24px" color={`${sanitizedBranding.primaryColor}`} aria-label="Godkänd" />
                <Text 
                  id="results-heading"
                  as="h2"
                  fontSize={isMobile ? "xl" : "2xl"} 
                  fontWeight="bold" 
                  color={sanitizedBranding.primaryColor}
                  role="heading"
                  aria-level={2}
                >
                  Godkänd
                </Text>
              </HStack>
              
              <Text 
                fontSize={isMobile ? "md" : "lg"} 
                color="gray.700" 
                fontWeight="medium"
                role="text"
                aria-label={`Tid: ${gameData.totalTime}, Resultat: ${gameData.percentageScore} procent`}
              >
                {gameData.totalTime} • {gameData.percentageScore}% resultat
              </Text>
              
              {gameData.certificateEarned && (
                <HStack spacing={2} color={sanitizedBranding.primaryColor} role="group" aria-label="Certifikat information">
                  <CertificateIcon w="20px" h="20px" aria-label="Certifikat" />
                  <Text fontSize="md" fontWeight="medium" role="text">
                    Certifikat Erhållet
                  </Text>
                </HStack>
              )}
            </VStack>
            
            {/* Municipal Progress Bar */}
            <Box w="100%" maxW="300px" role="group" aria-label="Framstållning av resultat">
              <Progress
                value={gameData.percentageScore}
                size="lg"
                colorScheme={getMunicipalStatusColor(gameData.completionStatus)}
                borderRadius="full"
                bg="gray.200"
                aria-label={`Slutresultat: ${gameData.percentageScore} procent av möjliga poäng`}
                aria-valuenow={gameData.percentageScore}
                aria-valuemin={0}
                aria-valuemax={100}
                sx={{
                  '& > div': {
                    borderRadius: 'full',
                    background: sanitizedBranding.primaryColor
                  }
                }}
              />
              <Text 
                fontSize="sm" 
                color="gray.600" 
                textAlign="center" 
                mt={2}
                role="text"
              >
                Skickat till din tjänst-e-post
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Municipal Key Learnings */}
      <Card 
        as="section"
        role="region"
        aria-labelledby="learnings-heading"
        mb={6} 
        bg="white" 
        shadow="md"
        borderRadius={isMobile ? "xl" : "2xl"}
        transform={showContent ? 'translateY(0)' : 'translateY(10px)'}
        opacity={showContent ? 1 : 0}
        transition={getTransition('all 0.6s ease-out 0.6s')}
      >
        <CardBody p={isMobile ? 6 : 8}>
          <Text 
            id="learnings-heading"
            as="h2"
            fontSize={isMobile ? "lg" : "xl"} 
            fontWeight="bold" 
            mb={4} 
            color="gray.800"
            role="heading"
            aria-level={2}
          >
            Viktiga Lärdomar
          </Text>
          <VStack as="ul" spacing={3} align="stretch" role="list" aria-labelledby="learnings-heading">
            {gameData.keyLearnings.map((learning, index) => (
              <HStack 
                as="li"
                key={index} 
                spacing={3} 
                p={4} 
                bg={`${sanitizedBranding.primaryColor}1A`} 
                borderRadius="lg"
                role="listitem"
                tabIndex={0}
                aria-label={`Lärdom ${index + 1}: ${learning}`}
              >
                <CheckIcon color={sanitizedBranding.primaryColor} flexShrink={0} aria-hidden="true" />
                <Text fontSize={isMobile ? "sm" : "md"} color="gray.700" fontWeight="medium" role="text">
                  {learning}
                </Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Municipal Next Steps */}
      <Card 
        as="section"
        role="region"
        aria-labelledby="next-steps-heading"
        mb={6} 
        bg="white" 
        shadow="md"
        borderRadius={isMobile ? "xl" : "2xl"}
        transform={showContent ? 'translateY(0)' : 'translateY(10px)'}
        opacity={showContent ? 1 : 0}
        transition={getTransition('all 0.6s ease-out 0.9s')}
      >
        <CardBody p={isMobile ? 6 : 8}>
          <Text 
            id="next-steps-heading"
            as="h2"
            fontSize={isMobile ? "lg" : "xl"} 
            fontWeight="bold" 
            mb={4} 
            color="gray.800"
            role="heading"
            aria-level={2}
          >
            Nästa Steg
          </Text>
          <VStack as="ol" spacing={3} align="stretch" role="list" aria-labelledby="next-steps-heading">
            {gameData.nextSteps.map((step, index) => (
              <HStack 
                as="li"
                key={index} 
                spacing={4} 
                p={4} 
                bg="gray.50" 
                borderRadius="lg"
                role="listitem"
                tabIndex={0}
                aria-label={`Steg ${index + 1}: ${step}`}
              >
                <Box 
                  bg={sanitizedBranding.primaryColor}
                  color="white" 
                  borderRadius="full" 
                  w="28px" 
                  h="28px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  fontSize="sm" 
                  fontWeight="bold"
                  flexShrink={0}
                  aria-label={`Steg nummer ${index + 1}`}
                  role="text"
                >
                  {index + 1}
                </Box>
                <Text fontSize={isMobile ? "sm" : "md"} color="gray.700" fontWeight="medium" role="text">
                  {step}
                </Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Municipal Actions Panel */}
      <VStack 
        as="section"
        role="region"
        aria-labelledby="actions-heading"
        spacing={4} 
        mt={8}
      >
        {/* Screen reader heading for actions */}
        <Text 
          id="actions-heading"
          as="h2"
          fontSize="lg"
          fontWeight="bold"
          color="gray.800"
          position="absolute"
          left="-10000px"
          width="1px"
          height="1px"
          overflow="hidden"
          role="heading"
          aria-level={2}
        >
          Åtgärder
        </Text>
        
        {/* Primary Municipal Action */}
        <Button
          onClick={handleComplete}
          bg={sanitizedBranding.primaryColor}
          color="white"
          size="lg"
          w="100%"
          minH={isMobile ? "56px" : "64px"}
          fontSize={isMobile ? "lg" : "xl"}
          fontWeight="bold"
          borderRadius="xl"
          leftIcon={<CheckIcon aria-hidden="true" />}
          aria-label="Avsluta utbildningen och återgå till huvudmenyn"
          _hover={{
            bg: `${sanitizedBranding.primaryColor}E6`,
            transform: prefersReducedMotion ? 'none' : 'translateY(-1px)',
            shadow: 'lg',
          }}
          _active={{
            transform: prefersReducedMotion ? 'none' : 'translateY(0)',
          }}
          _focusVisible={{
            outline: '2px solid',
            outlineColor: 'white',
            outlineOffset: '2px'
          }}
          transition={getTransition('all 0.2s')}
        >
          Avsluta Utbildningen
        </Button>
        
        {/* Secondary Municipal Actions */}
        <Stack 
          direction={isMobile ? "column" : "row"} 
          spacing={3} 
          w="100%"
          role="group"
          aria-label="Ytterligare åtgärder"
        >
          <Button
            variant="outline"
            borderColor={sanitizedBranding.primaryColor}
            color={sanitizedBranding.primaryColor}
            size={isMobile ? "md" : "lg"}
            flex="1"
            minH={isMobile ? "48px" : "56px"}
            borderRadius="lg"
            leftIcon={<CertificateIcon aria-hidden="true" />}
            aria-label="Ladda ner ditt officiella GDPR-certifikat från Malmö Stad"
            onClick={() => {
              analytics?.trackEvent('municipal_certificate_download', {
                sceneId: scene.id,
                municipality: sanitizedBranding.municipality
              });
            }}
            _hover={{
              bg: `${sanitizedBranding.primaryColor}1A`
            }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: sanitizedBranding.primaryColor,
              outlineOffset: '2px'
            }}
            transition={getTransition('background-color 0.2s ease')}
          >
            Ladda ner Certifikat
          </Button>
          
          <Button
            variant="outline"
            borderColor={sanitizedBranding.primaryColor}
            color={sanitizedBranding.primaryColor}
            size={isMobile ? "md" : "lg"}
            flex="1"
            minH={isMobile ? "48px" : "56px"}
            borderRadius="lg"
            aria-label="Åtkomst till GDPR-resurser och verktyg för din arbetsplats"
            onClick={() => {
              analytics?.trackEvent('municipal_resources_access', {
                sceneId: scene.id,
                municipality: sanitizedBranding.municipality
              });
            }}
            _hover={{
              bg: `${sanitizedBranding.primaryColor}1A`
            }}
            _focusVisible={{
              outline: '2px solid',
              outlineColor: sanitizedBranding.primaryColor,
              outlineOffset: '2px'
            }}
            transition={getTransition('background-color 0.2s ease')}
          >
            Resurser för Arbetsplatsen
          </Button>
        </Stack>
      </VStack>

      {/* Municipal Footer */}
      <Box 
        as="footer"
        role="contentinfo"
        mt={8} 
        pt={6} 
        borderTop="1px solid" 
        borderColor="gray.200"
        aria-label="Sidans sidfot med supportinformation"
      >
        <VStack spacing={3}>
          <Text 
            fontSize="sm" 
            color="gray.600" 
            textAlign="center" 
            fontWeight="medium"
            role="text"
          >
            Tack för att du genomförde din kompetensutveckling!
          </Text>
          
          {/* Municipal Support Contact */}
          <VStack spacing={1} role="group" aria-label="Supportinformation">
            <Text 
              fontSize="sm" 
              color="gray.500" 
              textAlign="center"
              role="text"
              aria-label={`Support: ${gameData.municipalContext.supportContact}`}
            >
              Support: {gameData.municipalContext.supportContact}
            </Text>
            <Text 
              fontSize="xs" 
              color="gray.400" 
              textAlign="center"
              role="text"
              aria-label={`Leverantörer: ${sanitizedBranding.municipality} och DigiNativa, datum: ${new Date().toLocaleDateString('sv-SE')}`}
            >
              {sanitizedBranding.municipality} • DigiNativa • {new Date().toLocaleDateString('sv-SE')}
            </Text>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
};