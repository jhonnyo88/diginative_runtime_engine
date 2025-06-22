import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

// Enhanced Emotion Visualization Component
const EmotionIndicator: React.FC<{
  emotion: MunicipalEmotionType;
  intensity: 'subtle' | 'moderate' | 'clear';
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
}> = ({ emotion, intensity, culturalContext }) => {
  
    return colorMap[emotion] || 'gray';
  };



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
  
  // Municipal branding colors with fallback
  
  // Anna Svensson mobile-first optimization (Game Designer requirement)
  const _isMobile = true; // Assume mobile-first as per Anna Svensson persona

  // Process scene data with player name replacement
