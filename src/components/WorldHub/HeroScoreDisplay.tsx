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

const MotionBox = motion(Box);
const MotionText = motion(Text);

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
  const culturalContext = useMemo(() => {
    const personaThemeMap: Record<string, string> = {
      'Anna': 'swedish',
      'Klaus': 'german', 
      'Marie': 'french',
      'Pieter': 'dutch'
    };
    return personaThemeMap[currentPersona?.name || 'Anna'] || 'swedish';
  }, [currentPersona]);

  const theme = culturalThemes[culturalContext];

  // Calculate completion ring progress (0-100)
  const completionProgress = (totalScore / maxScore) * 100;

  // Professional motivation elements
  const motivationalElements = useMemo(() => {
    const europeanRecognitionLevel = totalScore > 3500 ? 'cross_border_qualified' : 
                                   totalScore > 2500 ? 'advanced_competency' :
                                   totalScore > 1500 ? 'intermediate_professional' : 'foundation_level';
    
    const culturalMotivation = {
      swedish: {
        cross_border_qualified: 'Kvalificerad för europeisk kommunal samverkan',
        advanced_competency: 'Avancerad kommunal kompetensnivå',
        intermediate_professional: 'Mellanliggande yrkeskompetens',
        foundation_level: 'Grundläggande kommunal kompetens'
      },
      german: {
        cross_border_qualified: 'Qualifiziert für europäische Verwaltungskooperation',
        advanced_competency: 'Fortgeschrittene Verwaltungskompetenz',
        intermediate_professional: 'Mittlere Fachkompetenz',
        foundation_level: 'Grundlegende Verwaltungskompetenz'
      },
      french: {
        cross_border_qualified: 'Qualifié pour la coopération européenne',
        advanced_competency: 'Compétence avancée du service public',
        intermediate_professional: 'Compétence professionnelle intermédiaire',
        foundation_level: 'Compétence de base du service public'
      },
      dutch: {
        cross_border_qualified: 'Gekwalificeerd voor Europese samenwerking',
        advanced_competency: 'Geavanceerde bestuurlijke competentie',
        intermediate_professional: 'Tussenliggende professionele competentie',
        foundation_level: 'Basis bestuurlijke competentie'
      }
    };

    return culturalMotivation[culturalContext][europeanRecognitionLevel];
  }, [totalScore, culturalContext]);

  return (
    <MotionBox
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      bg={theme.secondaryColor}
      borderRadius="xl"
      p={8}
      boxShadow="2xl"
      border="2px solid"
      borderColor={theme.primaryColor}
      position="relative"
      overflow="hidden"
      minH="400px"
    >
      {/* Background Gradient Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        background={theme.backgroundGradient}
        opacity={0.05}
        borderRadius="xl"
      />

      {/* Main Content */}
      <VStack spacing={6} position="relative" zIndex={1}>
        
        {/* Cultural Welcome Message */}
        <MotionText
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          fontSize="lg"
          fontWeight="600"
          color={theme.textColor}
          textAlign="center"
          letterSpacing="wide"
        >
          {theme.welcomeMessage}
        </MotionText>

        {/* Central Score Display with Completion Ring */}
        <Box position="relative" w="200px" h="200px">
          {/* SVG Completion Ring */}
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            style={{ position: 'absolute', top: 0, left: 0 }}
          >
            {/* Background Circle */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={theme.accentColor}
              strokeWidth="8"
              opacity={0.2}
            />
            {/* Progress Circle */}
            <motion.circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={theme.primaryColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={534.07} // 2 * π * r
              strokeDashoffset={534.07 - (534.07 * completionProgress / 100)}
              initial={{ strokeDashoffset: 534.07 }}
              animate={{ strokeDashoffset: 534.07 - (534.07 * completionProgress / 100) }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
              transform="rotate(-90 100 100)"
            />
          </svg>

          {/* Central Score Number */}
          <Flex
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            direction="column"
            align="center"
            justify="center"
          >
            <MotionText
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              fontSize="4xl"
              fontWeight="800"
              color={theme.primaryColor}
              lineHeight="1"
            >
              {totalScore.toLocaleString()}
            </MotionText>
            <Text
              fontSize="sm"
              fontWeight="600"
              color={theme.textColor}
              opacity={0.7}
              mt={1}
            >
              {theme.progressLanguage}
            </Text>
          </Flex>
        </Box>

        {/* Professional Level Badge */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <Badge
            variant="solid"
            bg={theme.primaryColor}
            color={theme.secondaryColor}
            fontSize="md"
            px={4}
            py={2}
            borderRadius="full"
            fontWeight="600"
            letterSpacing="wide"
          >
            {theme.certificationLevel}
          </Badge>
        </MotionBox>

        {/* Professional Motivation Elements */}
        <VStack spacing={3} w="100%">
          
          {/* Next Milestone */}
          <MotionBox
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            w="100%"
          >
            <HStack justify="space-between" w="100%">
              <Text fontSize="sm" fontWeight="600" color={theme.textColor}>
                Nästa milstolpe:
              </Text>
              <Text fontSize="sm" color={theme.accentColor} fontWeight="600">
                {nextMilestone.pointsRemaining} poäng kvar
              </Text>
            </HStack>
            <Progress
              value={(totalScore / nextMilestone.requiredScore) * 100}
              colorScheme="blue"
              bg={theme.accentColor + '20'}
              borderRadius="full"
              h={2}
              mt={1}
            />
            <Text fontSize="xs" color={theme.textColor} opacity={0.8} mt={1}>
              {nextMilestone.name}
            </Text>
          </MotionBox>

          {/* Professional Streak */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4 }}
            w="100%"
          >
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="600" color={theme.textColor}>
                Professionell serie:
              </Text>
              <Badge
                colorScheme="green"
                fontSize="xs"
                px={2}
                py={1}
                borderRadius="md"
              >
                {professionalStreak} sessioner
              </Badge>
            </HStack>
          </MotionBox>

          {/* Team Excellence Ranking */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            w="100%"
          >
            <HStack justify="space-between">
              <Text fontSize="sm" fontWeight="600" color={theme.textColor}>
                Kommunal team excellence:
              </Text>
              <Text fontSize="sm" color={theme.primaryColor} fontWeight="700">
                Topp {teamRanking.percentage}%
              </Text>
            </HStack>
          </MotionBox>

          {/* European Recognition */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            w="100%"
            p={3}
            bg={theme.primaryColor + '10'}
            borderRadius="md"
            border="1px solid"
            borderColor={theme.primaryColor + '30'}
          >
            <Text
              fontSize="sm"
              fontWeight="600"
              color={theme.primaryColor}
              textAlign="center"
            >
              {motivationalElements}
            </Text>
          </MotionBox>

        </VStack>
      </VStack>
    </MotionBox>
  );
};