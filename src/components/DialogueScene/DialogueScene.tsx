import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Progress,
  useTheme,
  useColorModeValue,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { processDialogueSceneWithPlayerName } from '../../utils/playerNameReplacement';
import { MunicipalButton } from '../Button';
import { getButtonText } from '../../theme/municipalButtonTheme';
import { MunicipalEmotionType, getEmotionVisualization, getCulturalEmotionVariant, mapLegacyEmotion } from '../../types/character-emotions';
import { MunicipalArchetypeId, getArchetypeById, getCulturalArchetypeVariant } from '../../types/character-archetypes';
import CharacterRelationshipManager, { RelationshipType, InteractionType } from '../../services/character-relationship-manager';

// Enhanced DevTeam JSON Schema Types with Character System Support
interface DialogueTurn {
  speaker: string;
  character_id: string;
  text: string;
  emotion: 'neutral' | 'concerned' | 'confident' | 'questioning' | MunicipalEmotionType;
  timing: number; // milliseconds
  // Enhanced character-driven properties
  archetype?: MunicipalArchetypeId;
  relationshipContext?: string;
  emotionIntensity?: 'subtle' | 'moderate' | 'clear';
  municipalContext?: string;
}

interface DialogueSceneData {
  scene_id: string;
  scene_type: 'DialogueScene';
  title: string;
  description: string;
  characters: {
    character_id: string;
    name: string;
    role: string;
    avatar_description: string;
    // Enhanced character system properties
    archetype?: MunicipalArchetypeId;
    department?: string;
    experience_level?: string;
    personality_traits?: string[];
  }[];
  dialogue_turns: DialogueTurn[];
  learning_objectives: string[];
  scene_duration: number; // seconds
  // Character-driven enhancements
  relationship_dynamics?: {
    character_relationships: Array<{
      character1_id: string;
      character2_id: string;
      relationship_type: RelationshipType;
      relationship_strength: number;
    }>;
  };
  municipal_context?: {
    scenario_type: string;
    department: string;
    service_area: string;
    stakeholders: string[];
  };
}

interface DialogueSceneProps {
  sceneData: DialogueSceneData;
  onComplete: () => void;
  municipalBranding?: {
    primaryColor: string;
    logoUrl: string;
    municipality: string;
  };
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
  playerName?: string;
  // Character system enhancements
  relationshipManager?: CharacterRelationshipManager;
  enableCharacterSystem?: boolean;
  onCharacterInteraction?: (character1Id: string, character2Id: string, interactionType: InteractionType, outcome: 'positive' | 'neutral' | 'negative') => void;
}

// Cultural adaptation based on Game Designer specifications
const getCulturalStyles = (context: string, theme: any) => {
  switch (context) {
    case 'swedish':
      return {
        spacing: 'medium',
        informationDensity: 'clean_minimal',
        colors: theme.colors.blue
      };
    case 'german':
      return {
        spacing: 'tight',
        informationDensity: 'systematic_detailed',
        colors: theme.colors.gray
      };
    case 'french':
      return {
        spacing: 'elegant',
        informationDensity: 'refined_collaborative',
        colors: theme.colors.purple
      };
    case 'dutch':
      return {
        spacing: 'efficient',
        informationDensity: 'progressive_minimal',
        colors: theme.colors.orange
      };
    default:
      return {
        spacing: 'medium',
        informationDensity: 'clean_minimal',
        colors: theme.colors.blue
      };
  }
};

// Enhanced Emotion Visualization Component
const EmotionIndicator: React.FC<{
  emotion: MunicipalEmotionType;
  intensity: 'subtle' | 'moderate' | 'clear';
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
}> = ({ emotion, intensity, culturalContext }) => {
  const emotionData = getEmotionVisualization(emotion, culturalContext);
  const culturalVariant = getCulturalEmotionVariant(emotion, culturalContext);
  
  const getEmotionColor = (emotion: MunicipalEmotionType) => {
    const colorMap: Record<MunicipalEmotionType, string> = {
      supportive: 'green',
      analytical: 'blue', 
      concerned: 'orange',
      satisfied: 'purple',
      determined: 'red',
      collaborative: 'teal',
      neutral: 'gray',
      confident: 'blue',
      questioning: 'yellow'
    };
    return colorMap[emotion] || 'gray';
  };

  const getIntensityProps = (intensity: 'subtle' | 'moderate' | 'clear') => {
    switch (intensity) {
      case 'subtle': return { size: 'sm', opacity: 0.7 };
      case 'moderate': return { size: 'md', opacity: 0.8 };
      case 'clear': return { size: 'lg', opacity: 1.0 };
      default: return { size: 'md', opacity: 0.8 };
    }
  };

  const intensityProps = getIntensityProps(intensity);
  const emotionColor = getEmotionColor(emotion);

  return (
    <Tooltip 
      label={`${emotionData.displayName}: ${culturalVariant?.localizedDescription || emotionData.accessibilityLabel}`}
      aria-label={emotionData.accessibilityLabel}
    >
      <Badge
        colorScheme={emotionColor}
        size={intensityProps.size}
        opacity={intensityProps.opacity}
        borderRadius="full"
        px={2}
        py={1}
        fontSize="xs"
        fontWeight="medium"
      >
        {emotionData.displayName}
      </Badge>
    </Tooltip>
  );
};

// Character Archetype Indicator Component
const ArchetypeIndicator: React.FC<{
  archetype: MunicipalArchetypeId;
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
}> = ({ archetype, culturalContext }) => {
  const archetypeData = getArchetypeById(archetype);
  const culturalVariant = getCulturalArchetypeVariant(archetype, culturalContext);
  
  return (
    <Tooltip 
      label={`${culturalVariant?.localizedTitle || archetypeData.displayName}: ${archetypeData.description}`}
    >
      <Text 
        fontSize="xs" 
        color="gray.500"
        fontStyle="italic"
        textTransform="capitalize"
      >
        {culturalVariant?.localizedTitle || archetypeData.displayName}
      </Text>
    </Tooltip>
  );
};

export const DialogueScene: React.FC<DialogueSceneProps> = ({
  sceneData,
  onComplete,
  municipalBranding,
  culturalContext = 'swedish',
  playerName,
  relationshipManager,
  enableCharacterSystem = true,
  onCharacterInteraction
}) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const theme = useTheme();
  const culturalStyles = getCulturalStyles(culturalContext, theme);
  
  // Municipal branding colors with fallback
  const primaryColor = municipalBranding?.primaryColor || culturalStyles.colors[500];
  // const bgColor = useColorModeValue('white', 'gray.800');
  const containerBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Anna Svensson mobile-first optimization (Game Designer requirement)
  const isMobile = true; // Assume mobile-first as per Anna Svensson persona

  // Process scene data with player name replacement
  const processedSceneData = useMemo(() => {
    return playerName ? processDialogueSceneWithPlayerName(sceneData, playerName) : sceneData;
  }, [sceneData, playerName]);

  // Safety checks for undefined data
  const dialogueTurns = processedSceneData.dialogue_turns || [];
  const characters = processedSceneData.characters || [];
  
  const currentTurn = dialogueTurns[currentTurnIndex];
  const character = characters.find((c: any) => c.character_id === currentTurn?.character_id);
  const progress = dialogueTurns.length > 0 ? ((currentTurnIndex + 1) / dialogueTurns.length) * 100 : 0;

  // Character system enhancements
  const currentEmotion = useMemo(() => {
    if (!currentTurn?.emotion) return 'neutral' as MunicipalEmotionType;
    // Map legacy emotions to new system
    return typeof currentTurn.emotion === 'string' && 
           ['neutral', 'concerned', 'confident', 'questioning'].includes(currentTurn.emotion)
           ? mapLegacyEmotion(currentTurn.emotion)
           : currentTurn.emotion as MunicipalEmotionType;
  }, [currentTurn]);

  const currentArchetype = useMemo(() => {
    return currentTurn?.archetype || character?.archetype;
  }, [currentTurn, character]);

  // Initialize relationship manager if not provided
  const activeRelationshipManager = useMemo(() => {
    return relationshipManager || new CharacterRelationshipManager();
  }, [relationshipManager]);

  // Keyboard navigation (WCAG 2.1 AA requirement)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleNextTurn();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTurnIndex]);

  const handleNextTurn = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);

    // Track character interaction if character system is enabled
    if (enableCharacterSystem && currentTurn && onCharacterInteraction) {
      const nextTurn = dialogueTurns[currentTurnIndex + 1];
      if (nextTurn && nextTurn.character_id !== currentTurn.character_id) {
        // Determine interaction outcome based on emotions
        const outcome = determineInteractionOutcome(currentEmotion, nextTurn.emotion as MunicipalEmotionType);
        onCharacterInteraction(
          currentTurn.character_id,
          nextTurn.character_id,
          'daily_coordination', // Default interaction type for dialogue
          outcome
        );
      }
    }
    
    if (currentTurnIndex < dialogueTurns.length - 1) {
      setTimeout(() => {
        setCurrentTurnIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      // Scene complete
      setTimeout(() => {
        onComplete();
        setIsAnimating(false);
      }, 500);
    }
  };

  // Helper function to determine interaction outcome based on emotions
  const determineInteractionOutcome = (
    emotion1: MunicipalEmotionType, 
    emotion2: MunicipalEmotionType
  ): 'positive' | 'neutral' | 'negative' => {
    const positiveEmotions: MunicipalEmotionType[] = ['supportive', 'collaborative', 'satisfied', 'confident'];
    const negativeEmotions: MunicipalEmotionType[] = ['concerned', 'determined'];
    
    const isPositive1 = positiveEmotions.includes(emotion1);
    const isPositive2 = positiveEmotions.includes(emotion2);
    const isNegative1 = negativeEmotions.includes(emotion1);
    const isNegative2 = negativeEmotions.includes(emotion2);
    
    if (isPositive1 && isPositive2) return 'positive';
    if (isNegative1 && isNegative2) return 'negative';
    if ((isPositive1 && isNegative2) || (isNegative1 && isPositive2)) return 'neutral';
    return 'neutral';
  };

  // Accessibility: Screen reader announcements
  const announceProgress = () => {
    return `Dialogue turn ${currentTurnIndex + 1} of ${dialogueTurns.length}. ${Math.round(progress)}% complete.`;
  };

  // Early return if no data
  if (!dialogueTurns.length) {
    return (
      <Box p={6} textAlign="center">
        <Text color="red.500">Ingen dialogdata tillgänglig</Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="100%"
      mx="auto"
      p={isMobile ? 4 : 6}
      minH="100vh"
      bg={containerBg}
      // Municipal branding integration
      borderTop={municipalBranding ? `4px solid ${primaryColor}` : undefined}
    >
      {/* Municipal header with logo */}
      {municipalBranding && (
        <HStack mb={6} justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            {municipalBranding.municipality}
          </Text>
          {municipalBranding.logoUrl && (
            <Box w="40px" h="40px">
              <img 
                src={municipalBranding.logoUrl} 
                alt={`${municipalBranding.municipality} logotyp`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
          )}
        </HStack>
      )}

      {/* Progress indicator */}
      <VStack spacing={4} mb={6}>
        <Progress 
          value={progress} 
          colorScheme={primaryColor.includes('#') ? undefined : 'blue'}
          bg="gray.200"
          w="100%"
          h="8px"
          borderRadius="full"
          aria-label={announceProgress()}
        />
        <Text fontSize="sm" color={mutedTextColor} textAlign="center">
          {processedSceneData.title}
        </Text>
      </VStack>

      {/* Main dialogue content */}
      <VStack spacing={6} align="stretch">
        {currentTurn && character && (
          <motion.div
            key={currentTurnIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <VStack spacing={4} align="stretch" maxW={isMobile ? "100%" : "600px"} mx="auto">
              {/* Chat bubble with message */}
              <Box 
                position="relative"
                bg={character.character_id === 'player' ? primaryColor : cardBg}
                color={character.character_id === 'player' ? 'white' : textColor}
                p={4}
                borderRadius="18px"
                maxW="85%"
                alignSelf={character.character_id === 'player' ? "flex-end" : "flex-start"}
                shadow="sm"
                border={character.character_id === 'player' ? 'none' : '1px solid'}
                borderColor={character.character_id === 'player' ? 'transparent' : useColorModeValue('gray.200', 'gray.600')}
                _before={{
                  content: `""`,
                  position: 'absolute',
                  bottom: '-8px',
                  [character.character_id === 'player' ? 'right' : 'left']: '20px',
                  width: '0',
                  height: '0',
                  borderLeft: character.character_id === 'player' ? 'none' : '8px solid transparent',
                  borderRight: character.character_id === 'player' ? '8px solid transparent' : 'none',
                  borderTop: character.character_id === 'player' ? `8px solid ${primaryColor}` : `8px solid ${cardBg}`,
                }}
              >
                <VStack align="start" spacing={2}>
                  <VStack align="start" spacing={1}>
                    <HStack spacing={2} align="center">
                      <Avatar
                        name={character.character_id === 'player' && playerName ? playerName : character.name}
                        size="xs"
                        bg={character.character_id === 'player' ? 'whiteAlpha.300' : primaryColor}
                        color={character.character_id === 'player' ? 'white' : 'white'}
                      />
                      <Text 
                        fontSize="sm"
                        fontWeight="semibold"
                        color={character.character_id === 'player' ? 'whiteAlpha.900' : primaryColor}
                      >
                        {character.character_id === 'player' && playerName ? playerName : character.name}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color={character.character_id === 'player' ? 'whiteAlpha.700' : mutedTextColor}
                        textTransform="capitalize"
                      >
                        {character.role}
                      </Text>
                    </HStack>
                    
                    {/* Enhanced character system indicators */}
                    {enableCharacterSystem && (
                      <HStack spacing={2} align="center">
                        {/* Emotion indicator */}
                        <EmotionIndicator
                          emotion={currentEmotion}
                          intensity={currentTurn?.emotionIntensity || 'moderate'}
                          culturalContext={culturalContext}
                        />
                        
                        {/* Archetype indicator */}
                        {currentArchetype && (
                          <ArchetypeIndicator
                            archetype={currentArchetype}
                            culturalContext={culturalContext}
                          />
                        )}
                        
                        {/* Municipal context indicator */}
                        {currentTurn?.municipalContext && (
                          <Badge 
                            variant="outline" 
                            colorScheme="gray" 
                            size="sm"
                            fontSize="xs"
                          >
                            {currentTurn.municipalContext}
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </VStack>
                  
                  <Text 
                    fontSize={isMobile ? "md" : "lg"}
                    lineHeight="tall"
                    color={character.character_id === 'player' ? 'white' : textColor}
                  >
                    {currentTurn.text}
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </motion.div>
        )}

        {/* Navigation controls */}
        <HStack justify="center" mt={8}>
          <MunicipalButton
            onClick={handleNextTurn}
            variant="municipal-primary"
            culturalContext={culturalContext}
            municipalEntity={municipalBranding?.municipality}
            isLoading={isAnimating}
            loadingText="Nästa..."
            aria-label={`Nästa dialogrunda. ${announceProgress()}`}
          >
            {currentTurnIndex < dialogueTurns.length - 1 ? getButtonText('next', culturalContext) : getButtonText('finish', culturalContext)}
          </MunicipalButton>
        </HStack>

        {/* Learning objectives footer */}
        <Box mt={8} p={4} bg={useColorModeValue('gray.100', 'gray.800')} borderRadius="md">
          <Text fontSize="sm" fontWeight="medium" mb={2} color={textColor}>
            Läringsmål:
          </Text>
          <VStack align="start" spacing={1}>
            {(processedSceneData.learning_objectives || []).map((objective: any, index: number) => (
              <Text key={index} fontSize="sm" color={mutedTextColor}>
                • {objective}
              </Text>
            ))}
          </VStack>
        </Box>
      </VStack>

      {/* Hidden accessibility helpers */}
      <Box srOnly>
        <div aria-live="polite" aria-atomic="true">
          {announceProgress()}
        </div>
      </Box>
    </Box>
  );
};

export default DialogueScene;