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

  
  const _handleContextSwitch = async (targetContextId: string) => {
    
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
