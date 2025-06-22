import React, { useMemo } from 'react';
import { Box, Text, Flex, Progress, Badge, VStack, HStack } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterContext } from '../../contexts/CharacterContext';
import { useAchievementProgress } from '../../hooks/useAchievementProgress';

// European Cultural Theme Integration
interface CulturalTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundGradient: string;
  welcomeMessage: string;
  progressLanguage: string;
  certificationLevel: string;
}

const culturalThemes: Record<string, CulturalTheme> = {
  swedish: {
    primaryColor: '#4A90A4', // Natural Swedish Blue
    secondaryColor: '#F8F9FA', // Nordic White
    accentColor: '#7FB069', // Sustainable Green
    textColor: '#2D3748',
    backgroundGradient: 'linear-gradient(135deg, #4A90A4 0%, #7FB069 100%)',
    welcomeMessage: 'Välkommen tillbaka, kommunal professional',
    progressLanguage: 'Kollektiv kompetensutveckling',
    certificationLevel: 'Svensk Kommunal Excellence'
  },
  german: {
    primaryColor: '#1E3A8A', // Professional Prussian Blue
    secondaryColor: '#FFFFFF', // Systematic White
    accentColor: '#6B7280', // Methodical Gray
    textColor: '#1F2937',
    backgroundGradient: 'linear-gradient(135deg, #1E3A8A 0%, #6B7280 100%)',
    welcomeMessage: 'Willkommen zurück, Verwaltungsprofi',
    progressLanguage: 'Systematische Kompetenzentwicklung',
    certificationLevel: 'Deutsche Verwaltungsexzellenz'
  },
  french: {
    primaryColor: '#1E40AF', // Elegant République Blue
    secondaryColor: '#FAFAFA', // Sophisticated White
    accentColor: '#7C3AED', // Cultural Sophistication Purple
    textColor: '#374151',
    backgroundGradient: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 100%)',
    welcomeMessage: 'Bienvenue, professionnel du service public',
    progressLanguage: 'Excellence du développement professionnel',
    certificationLevel: 'Excellence du Service Public Français'
  },
  dutch: {
    primaryColor: '#2563EB', // Direct Professional Blue
    secondaryColor: '#FFFFFF', // Clear White
    accentColor: '#F97316', // Innovation Orange
    textColor: '#1F2937',
    backgroundGradient: 'linear-gradient(135deg, #2563EB 0%, #F97316 100%)',
    welcomeMessage: 'Welkom terug, bestuurlijke professional',
    progressLanguage: 'Praktische competentieontwikkeling',
    certificationLevel: 'Nederlandse Bestuurlijke Excellentie'
  }
};

interface HeroScoreDisplayProps {
  totalScore: number;
  maxScore: number;
  worldCompletionPercentage: number;
  currentCertificationLevel: string;
  nextMilestone: {
    name: string;
    requiredScore: number;
    pointsRemaining: number;
  };
  professionalStreak: number;
  teamRanking: {
    percentage: number;
    total: number;
  };
}


export const HeroScoreDisplay: React.FC<HeroScoreDisplayProps> = ({
  totalScore,
  maxScore,
  worldCompletionPercentage,
  currentCertificationLevel,
  nextMilestone,
  professionalStreak,
  teamRanking
}) => {
  const { currentPersona } = useCharacterContext();
  const { achievements } = useAchievementProgress();
  
  // Determine cultural theme based on current persona
