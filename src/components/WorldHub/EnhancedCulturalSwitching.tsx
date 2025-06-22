import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  Progress,
  Icon,
  Tooltip,
  useColorModeValue,
  Flex,
  Avatar
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGlobe, FiZap, FiCheck, FiArrowRight, FiStar } from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';
import { useCharacterContext } from '../../contexts/CharacterContext';

const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Enhanced Cultural Context Definitions
interface EnhancedCulturalContext {
  id: string;
  name: string;
  displayName: string;
  flagEmoji: string;
  language: string;
  personalityAvatar: string;
  professionalFocus: string;
  communicationStyle: string;
  decisionMaking: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  culturalValues: string[];
  professionalStrengths: string[];
  workApproach: string;
  adaptationScore: number;
  masteryLevel: 'developing' | 'competent' | 'proficient' | 'expert' | 'master';
  switchingAnimation: 'slide' | 'fade' | 'scale' | 'rotate';
}

// Enhanced Cultural Contexts
const enhancedCulturalContexts: EnhancedCulturalContext[] = [
  {
    id: 'swedish_lagom',
    name: 'swedish',
    displayName: 'Svenska Lagom',
    flagEmoji: '🇸🇪',
    language: 'Svenska',
    personalityAvatar: 'Anna Svensson',
    professionalFocus: 'Demokratisk Konsensus & Hållbar Utveckling',
    communicationStyle: 'Kollektiv & Inkluderande',
    decisionMaking: 'Konsensusbaserat',
    colors: {
      primary: '#4A90A4',
      secondary: '#F8F9FA',
      accent: '#7FB069',
      gradient: 'linear-gradient(135deg, #4A90A4 0%, #7FB069 100%)'
    },
    culturalValues: ['Lagom', 'Jantelagen', 'Trygghet', 'Hållbarhet', 'Demokrati'],
    professionalStrengths: ['Konsensusbyggande', 'Långsiktig planering', 'Kollegial samverkan'],
    workApproach: 'Balanserad utveckling med kollektivt ansvar',
    adaptationScore: 96,
    masteryLevel: 'expert',
    switchingAnimation: 'slide'
  },
  {
    id: 'german_systematik',
    name: 'german',
    displayName: 'Deutsche Systematik',
    flagEmoji: '🇩🇪',
    language: 'Deutsch',
    personalityAvatar: 'Klaus Weber',
    professionalFocus: 'Systematisk Excellens & Processoptimering',
    communicationStyle: 'Strukturerad & Grundlig',
    decisionMaking: 'Hierarkisk & Methodisk',
    colors: {
      primary: '#1E3A8A',
      secondary: '#FFFFFF',
      accent: '#6B7280',
      gradient: 'linear-gradient(135deg, #1E3A8A 0%, #6B7280 100%)'
    },
    culturalValues: ['Gründlichkeit', 'Ordnung', 'Pünktlichkeit', 'Qualität', 'Verantwortung'],
    professionalStrengths: ['Systematisk analys', 'Processexcellens', 'Kvalitetskontroll'],
    workApproach: 'Metodisk genomförande med detaljfokus',
    adaptationScore: 94,
    masteryLevel: 'expert',
    switchingAnimation: 'scale'
  },
  {
    id: 'french_service_public',
    name: 'french',
    displayName: 'Service Public Français',
    flagEmoji: '🇫🇷',
    language: 'Français',
    personalityAvatar: 'Marie Dubois',
    professionalFocus: 'Diplomatisk Excellens & Kulturell Sophistication',
    communicationStyle: 'Diplomatisk & Raffinerad',
    decisionMaking: 'Hierarkisk & Diplomatisk',
    colors: {
      primary: '#1E40AF',
      secondary: '#FAFAFA',
      accent: '#7C3AED',
      gradient: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)'
    },
    culturalValues: ['Excellence', 'Sophistication', 'Dignité', 'Savoir-vivre', 'République'],
    professionalStrengths: ['Diplomatisk förhandling', 'Kulturell förfining', 'Strategisk kommunikation'],
    workApproach: 'Raffinerad approach med professionell dignitet',
    adaptationScore: 92,
    masteryLevel: 'proficient',
    switchingAnimation: 'fade'
  },
  {
    id: 'dutch_efficiency',
    name: 'dutch',
    displayName: 'Nederlandse Efficiëntie',
    flagEmoji: '🇳🇱',
    language: 'Nederlands',
    personalityAvatar: 'Pieter van der Berg',
    professionalFocus: 'Praktisk Innovation & Direkt Resultat',
    communicationStyle: 'Direkt & Praktisk',
    decisionMaking: 'Participativ & Effektiv',
    colors: {
      primary: '#2563EB',
      secondary: '#FFFFFF',
      accent: '#F97316',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #F97316 100%)'
    },
    culturalValues: ['Directheid', 'Pragmatisme', 'Innovatie', 'Efficiëntie', 'Resultaat'],
    professionalStrengths: ['Praktisk problemlösning', 'Innovation ledarskap', 'Effektiv implementering'],
    workApproach: 'Direkt approach med fokus på mätbara resultat',
    adaptationScore: 93,
    masteryLevel: 'expert',
    switchingAnimation: 'rotate'
  }
];

// Cultural Switching Performance Metrics
interface CulturalSwitchingMetrics {
  switchingSpeed: number; // milliseconds
  adaptationAccuracy: number; // percentage
  contextRetention: number; // percentage
  userSatisfaction: number; // percentage
  professionalRelevance: number; // percentage
}

interface CulturalContextCardProps {
  context: EnhancedCulturalContext;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  switchingMetrics?: CulturalSwitchingMetrics;
}

const CulturalContextCard: React.FC<CulturalContextCardProps> = ({
  context,
  isActive,
  isHovered,
  onClick,
  onHover,
  switchingMetrics
}) => {
  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'master': return 'purple';
      case 'expert': return 'green';
      case 'proficient': return 'blue';
      case 'competent': return 'orange';
      default: return 'gray';
    }
  };

  const masteryLabels = {
    developing: 'Utvecklande',
    competent: 'Kompetent',
    proficient: 'Skicklig',
    expert: 'Expert',
    master: 'Mästare'
  };

  return (
    <MotionBox
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <MotionButton
        onClick={onClick}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
        variant={isActive ? 'solid' : 'outline'}
        colorScheme={isActive ? 'blue' : 'gray'}
        size="lg"
        h="auto"
        p={6}
        borderRadius="xl"
        border="2px solid"
        borderColor={isActive ? context.colors.primary : 'gray.200'}
        bg={isActive ? context.colors.primary : 'white'}
        color={isActive ? 'white' : context.colors.primary}
        boxShadow={isActive ? `0 8px 25px ${context.colors.primary}30` : 'lg'}
        _hover={{
          borderColor: context.colors.primary,
          bg: isActive ? context.colors.primary : context.colors.primary + '10',
          transform: 'translateY(-2px)',
          boxShadow: `0 12px 35px ${context.colors.primary}40`
        }}
        transition="all 0.3s ease"
        w="100%"
        maxW="300px"
      >
        <VStack spacing={4} align="stretch" w="100%">
          
          {/* Cultural Header */}
          <HStack justify="space-between" w="100%">
            <HStack spacing={3}>
              <Text fontSize="2xl">{context.flagEmoji}</Text>
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" lineHeight="tight">
                  {context.displayName}
                </Text>
                <Text fontSize="sm" opacity={0.8} lineHeight="tight">
                  {context.personalityAvatar}
                </Text>
              </VStack>
            </HStack>
            
            {isActive && (
              <Icon as={FiCheck} w={6} h={6} color="white" />
            )}
          </HStack>

          {/* Professional Focus */}
          <Box>
            <Text fontSize="sm" fontWeight="600" mb={1}>
              {context.professionalFocus}
            </Text>
            <Text fontSize="xs" opacity={0.8} lineHeight="short">
              {context.workApproach}
            </Text>
          </Box>

          {/* Adaptation Score & Mastery */}
          <HStack justify="space-between" w="100%">
            <VStack align="start" spacing={1}>
              <Text fontSize="xs" fontWeight="600">
                Adaptation Score
              </Text>
              <HStack spacing={2}>
                <Progress 
                  value={context.adaptationScore} 
                  size="sm" 
                  colorScheme={getMasteryColor(context.masteryLevel)}
                  w="60px"
                  borderRadius="full"
                />
                <Text fontSize="xs" fontWeight="700">
                  {context.adaptationScore}%
                </Text>
              </HStack>
            </VStack>
            
            <Badge
              colorScheme={getMasteryColor(context.masteryLevel)}
              variant="solid"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
            >
              {masteryLabels[context.masteryLevel]}
            </Badge>
          </HStack>

          {/* Cultural Values Preview */}
          <Box>
            <Text fontSize="xs" fontWeight="600" mb={2}>
              Kulturella Värden:
            </Text>
            <HStack spacing={1} flexWrap="wrap">
              {context.culturalValues.slice(0, 3).map((value, index) => (
                <Badge
                  key={index}
                  size="sm"
                  variant="outline"
                  borderColor={isActive ? 'white' : context.colors.primary}
                  color={isActive ? 'white' : context.colors.primary}
                  fontSize="2xs"
                >
                  {value}
                </Badge>
              ))}
              {context.culturalValues.length > 3 && (
                <Text fontSize="2xs" opacity={0.6}>
                  +{context.culturalValues.length - 3}
                </Text>
              )}
            </HStack>
          </Box>

          {/* Switching Performance (if available) */}
          {switchingMetrics && isHovered && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <VStack spacing={2} align="stretch">
                <Text fontSize="xs" fontWeight="600">
                  Switching Performance:
                </Text>
                <HStack justify="space-between">
                  <Text fontSize="2xs">Speed:</Text>
                  <Text fontSize="2xs" fontWeight="600">
                    {switchingMetrics.switchingSpeed}ms
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="2xs">Accuracy:</Text>
                  <Text fontSize="2xs" fontWeight="600">
                    {switchingMetrics.adaptationAccuracy}%
                  </Text>
                </HStack>
              </VStack>
            </MotionBox>
          )}

        </VStack>
      </MotionButton>
    </MotionBox>
  );
};

interface CulturalSwitchingPreviewProps {
  fromContext: EnhancedCulturalContext;
  toContext: EnhancedCulturalContext;
  isVisible: boolean;
}

const CulturalSwitchingPreview: React.FC<CulturalSwitchingPreviewProps> = ({
  fromContext,
  toContext,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      bg="white"
      borderRadius="xl"
      p={6}
      boxShadow="2xl"
      border="2px solid"
      borderColor={toContext.colors.primary}
      maxW="400px"
      w="100%"
    >
      <VStack spacing={4} align="stretch">
        
        <Text fontSize="lg" fontWeight="700" color={toContext.colors.primary} textAlign="center">
          Cultural Context Switching
        </Text>

        {/* Transition Animation */}
        <HStack justify="center" spacing={4}>
          <VStack spacing={1}>
            <Text fontSize="lg">{fromContext.flagEmoji}</Text>
            <Text fontSize="xs" color="gray.600">
              {fromContext.displayName}
            </Text>
          </VStack>
          
          <MotionBox
            animate={{ x: [0, 10, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon as={FiArrowRight} w={6} h={6} color={toContext.colors.primary} />
          </MotionBox>
          
          <VStack spacing={1}>
            <Text fontSize="lg">{toContext.flagEmoji}</Text>
            <Text fontSize="xs" color={toContext.colors.primary}>
              {toContext.displayName}
            </Text>
          </VStack>
        </HStack>

        {/* Context Differences */}
        <VStack spacing={3} align="stretch">
          <Box p={3} bg={toContext.colors.primary + '10'} borderRadius="md">
            <Text fontSize="sm" fontWeight="600" color={toContext.colors.primary} mb={1}>
              Communication Style:
            </Text>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.600">
                {fromContext.communicationStyle}
              </Text>
              <Icon as={FiArrowRight} w={3} h={3} color={toContext.colors.primary} />
              <Text fontSize="xs" color={toContext.colors.primary} fontWeight="600">
                {toContext.communicationStyle}
              </Text>
            </HStack>
          </Box>

          <Box p={3} bg={toContext.colors.accent + '10'} borderRadius="md">
            <Text fontSize="sm" fontWeight="600" color={toContext.colors.primary} mb={1}>
              Decision Making:
            </Text>
            <HStack justify="space-between">
              <Text fontSize="xs" color="gray.600">
                {fromContext.decisionMaking}
              </Text>
              <Icon as={FiArrowRight} w={3} h={3} color={toContext.colors.primary} />
              <Text fontSize="xs" color={toContext.colors.primary} fontWeight="600">
                {toContext.decisionMaking}
              </Text>
            </HStack>
          </Box>
        </VStack>

        {/* Switching Confirmation */}
        <HStack justify="center" spacing={2} mt={4}>
          <Icon as={FiZap} w={4} h={4} color={toContext.colors.accent} />
          <Text fontSize="sm" color={toContext.colors.primary} fontWeight="600">
            Switching to {toContext.displayName}
          </Text>
        </HStack>

      </VStack>
    </MotionBox>
  );
};

interface EnhancedCulturalSwitchingProps {
  onCulturalSwitch?: (contextId: string) => void;
  showDetailedView?: boolean;
  enableSwitchingPreview?: boolean;
  performanceMetrics?: Record<string, CulturalSwitchingMetrics>;
}

export const EnhancedCulturalSwitching: React.FC<EnhancedCulturalSwitchingProps> = ({
  onCulturalSwitch = () => console.log('Cultural context switched'),
  showDetailedView = true,
  enableSwitchingPreview = true,
  performanceMetrics = {}
}) => {
  const { culturalContext, switchTheme } = useCulturalTheme();
  const { currentPersona } = useCharacterContext();
  
  const [hoveredContext, setHoveredContext] = useState<string | null>(null);
  const [switchingInProgress, setSwitchingInProgress] = useState(false);
  const [switchingPreview, setSwitchingPreview] = useState<{
    from: EnhancedCulturalContext;
    to: EnhancedCulturalContext;
  } | null>(null);

  const currentContext = enhancedCulturalContexts.find(ctx => ctx.name === culturalContext);
  
  const handleContextSwitch = async (targetContextId: string) => {
    const targetContext = enhancedCulturalContexts.find(ctx => ctx.id === targetContextId);
    
    if (!targetContext || !currentContext) return;
    
    // Start switching process
    setSwitchingInProgress(true);
    
    if (enableSwitchingPreview) {
      setSwitchingPreview({ from: currentContext, to: targetContext });
    }

    // Simulate switching delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Perform the actual switch
    switchTheme(targetContext.name);
    onCulturalSwitch(targetContextId);
    
    // Complete switching
    setSwitchingInProgress(false);
    setSwitchingPreview(null);
  };

  // Real-time switching performance calculation
  const switchingSpeed = useMemo(() => {
    return Math.random() * 200 + 150; // 150-350ms simulated
  }, [culturalContext]);

  const overallAdaptationScore = useMemo(() => {
    return Math.round(
      enhancedCulturalContexts.reduce((sum, ctx) => sum + ctx.adaptationScore, 0) / 
      enhancedCulturalContexts.length
    );
  }, []);

  return (
    <Box position="relative">
      <VStack spacing={6} align="stretch">
        
        {/* Cultural Switching Header */}
        <VStack spacing={3} align="stretch">
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FiGlobe} w={8} h={8} color={currentContext?.colors.primary} />
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="700" color={currentContext?.colors.primary}>
                  European Cultural Intelligence
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Instant adaptation across municipal contexts
                </Text>
              </VStack>
            </HStack>
            
            <VStack align="end" spacing={1}>
              <HStack spacing={2}>
                <Icon as={FiStar} w={4} h={4} color={currentContext?.colors.accent} />
                <Text fontSize="sm" fontWeight="600" color={currentContext?.colors.primary}>
                  {overallAdaptationScore}% Mastery
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500">
                <Icon as={FiZap} w={3} h={3} display="inline" mr={1} />
                {switchingSpeed}ms switching
              </Text>
            </VStack>
          </HStack>

          {/* Current Context Display */}
          {currentContext && (
            <Box
              p={4}
              bg={currentContext.colors.gradient}
              borderRadius="lg"
              color="white"
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="rgba(255,255,255,0.1)"
                borderRadius="lg"
              />
              <HStack justify="space-between" position="relative" zIndex={1}>
                <HStack spacing={3}>
                  <Text fontSize="2xl">{currentContext.flagEmoji}</Text>
                  <VStack align="start" spacing={0}>
                    <Text fontSize="lg" fontWeight="700">
                      Active: {currentContext.displayName}
                    </Text>
                    <Text fontSize="sm" opacity={0.9}>
                      {currentContext.personalityAvatar} • {currentContext.professionalFocus}
                    </Text>
                  </VStack>
                </HStack>
                
                <Badge
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                  border="1px solid rgba(255,255,255,0.3)"
                  fontSize="sm"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  {currentContext.adaptationScore}% Adaptation
                </Badge>
              </HStack>
            </Box>
          )}
        </VStack>

        {/* Cultural Context Cards */}
        <Box>
          <Text fontSize="md" fontWeight="600" color="gray.700" mb={4}>
            Switch Cultural Context:
          </Text>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
            {enhancedCulturalContexts.map((context) => (
              <CulturalContextCard
                key={context.id}
                context={context}
                isActive={context.name === culturalContext}
                isHovered={hoveredContext === context.id}
                onClick={() => handleContextSwitch(context.id)}
                onHover={(hovered) => setHoveredContext(hovered ? context.id : null)}
                switchingMetrics={performanceMetrics[context.id]}
              />
            ))}
          </Grid>
        </Box>

        {/* Detailed Cultural Information (if enabled) */}
        {showDetailedView && currentContext && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              p={6}
              bg="white"
              borderRadius="xl"
              border="2px solid"
              borderColor={currentContext.colors.primary + '20'}
              boxShadow="lg"
            >
              <VStack spacing={4} align="stretch">
                
                <Text fontSize="lg" fontWeight="700" color={currentContext.colors.primary}>
                  {currentContext.displayName} Professional Characteristics
                </Text>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  
                  {/* Professional Strengths */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="md" fontWeight="600" color="gray.700">
                      Professional Strengths:
                    </Text>
                    {currentContext.professionalStrengths.map((strength, index) => (
                      <HStack key={index} spacing={3}>
                        <Icon as={FiCheck} w={4} h={4} color={currentContext.colors.accent} />
                        <Text fontSize="sm" color="gray.600">
                          {strength}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>

                  {/* Cultural Values */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="md" fontWeight="600" color="gray.700">
                      Core Cultural Values:
                    </Text>
                    <Flex flexWrap="wrap" gap={2}>
                      {currentContext.culturalValues.map((value, index) => (
                        <Badge
                          key={index}
                          colorScheme="blue"
                          variant="outline"
                          borderColor={currentContext.colors.primary}
                          color={currentContext.colors.primary}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                        >
                          {value}
                        </Badge>
                      ))}
                    </Flex>
                  </VStack>

                </Grid>

                {/* Work Approach */}
                <Box
                  p={4}
                  bg={currentContext.colors.primary + '05'}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={currentContext.colors.primary + '20'}
                >
                  <Text fontSize="sm" fontWeight="600" color={currentContext.colors.primary} mb={2}>
                    Professional Work Approach:
                  </Text>
                  <Text fontSize="sm" color="gray.600" lineHeight="tall">
                    {currentContext.workApproach}
                  </Text>
                </Box>

              </VStack>
            </Box>
          </MotionBox>
        )}

      </VStack>

      {/* Switching Preview Overlay */}
      <AnimatePresence>
        {switchingPreview && (
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0,0,0,0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
          >
            <CulturalSwitchingPreview
              fromContext={switchingPreview.from}
              toContext={switchingPreview.to}
              isVisible={true}
            />
          </MotionBox>
        )}
      </AnimatePresence>

      {/* Switching Progress Indicator */}
      {switchingInProgress && (
        <Box
          position="fixed"
          top={4}
          right={4}
          bg="white"
          p={4}
          borderRadius="lg"
          boxShadow="xl"
          border="2px solid"
          borderColor={currentContext?.colors.primary}
          zIndex={999}
        >
          <HStack spacing={3}>
            <MotionBox
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Icon as={FiZap} w={5} h={5} color={currentContext?.colors.primary} />
            </MotionBox>
            <Text fontSize="sm" fontWeight="600" color={currentContext?.colors.primary}>
              Switching Cultural Context...
            </Text>
          </HStack>
        </Box>
      )}

    </Box>
  );
};