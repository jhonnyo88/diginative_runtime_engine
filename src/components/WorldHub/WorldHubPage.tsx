import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Flex,
  Grid,
  Spacer,
  IconButton,
  useColorModeValue,
  Fade,
  ScaleFade
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiUser, FiGlobe } from 'react-icons/fi';

// Import our implemented components
import { HeroScoreDisplay } from './HeroScoreDisplay';
import { WorldNavigationGrid } from './WorldNavigationGrid';
import { AchievementBadgeSystem } from './AchievementBadgeSystem';
import { CulturalThemeProvider, CulturalThemeSelector, useCulturalTheme } from './CulturalThemeProvider';

// Import existing contexts and hooks
import { useCharacterContext } from '../../contexts/CharacterContext';
import { useAchievementProgress } from '../../hooks/useAchievementProgress';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

// Sample data interfaces (these would come from real state management)
interface WorldProgress {
  worldId: string;
  completionPercentage: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  lastAccessed?: Date;
  achievements: string[];
  estimatedTimeRemaining?: string;
}

interface HubData {
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
  worldProgresses: WorldProgress[];
}

// Sample data (would be replaced with real data from state management)
const sampleHubData: HubData = {
  totalScore: 2847,
  maxScore: 5000,
  worldCompletionPercentage: 67,
  currentCertificationLevel: 'Kompetent Kommunal Professional',
  nextMilestone: {
    name: 'Skicklig Kommunal Professional',
    requiredScore: 3500,
    pointsRemaining: 653
  },
  professionalStreak: 8,
  teamRanking: {
    percentage: 15,
    total: 127
  },
  worldProgresses: [
    {
      worldId: 'emergency_response',
      completionPercentage: 100,
      status: 'completed',
      lastAccessed: new Date('2025-01-20'),
      achievements: ['crisis_decision_leadership', 'multi_agency_coordination']
    },
    {
      worldId: 'budget_planning',
      completionPercentage: 67,
      status: 'in_progress',
      lastAccessed: new Date('2025-01-21'),
      achievements: ['democratic_budget_facilitation'],
      estimatedTimeRemaining: '25 min'
    },
    {
      worldId: 'digital_transformation',
      completionPercentage: 0,
      status: 'available',
      achievements: []
    },
    {
      worldId: 'stakeholder_relations',
      completionPercentage: 0,
      status: 'locked',
      achievements: []
    },
    {
      worldId: 'regulatory_compliance',
      completionPercentage: 0,
      status: 'locked',
      achievements: []
    }
  ]
};

// Sample achievements data
const sampleAchievements = [
  {
    id: 'crisis_decision_leadership',
    title: 'Krisbeslut Ledarskap',
    description: 'Visa excellens i krisbeslut under tidspress',
    category: 'world_specific' as const,
    level: 'competent' as const,
    worldId: 'emergency_response',
    icon: FiSettings, // Would be proper icons
    color: '#DC2626',
    earned: true,
    earnedDate: new Date('2025-01-20'),
    culturalVariants: {
      swedish: {
        title: 'Konsensusbaserat Krisbeslut',
        description: 'Demokratiskt krisbeslut med kollektivt ansvar'
      },
      german: {
        title: 'Systematische Krisenentscheidung',
        description: 'Methodische Krisenentscheidung mit Prozessexzellenz'
      },
      french: {
        title: 'Décision de Crise Raffinée',
        description: 'Prise de décision de crise avec excellence diplomatique'
      },
      dutch: {
        title: 'Efficiënte Crisisbesluiten',
        description: 'Directe crisisbesluiten met praktische resultaten'
      }
    }
  },
  {
    id: 'democratic_budget_facilitation',
    title: 'Demokratisk Budgetfacilitering',
    description: 'Expertis i demokratiska budgetprocesser',
    category: 'world_specific' as const,
    level: 'competent' as const,
    worldId: 'budget_planning',
    icon: FiUser,
    color: '#059669',
    earned: true,
    earnedDate: new Date('2025-01-21'),
    culturalVariants: {
      swedish: {
        title: 'Lagom Budgetdemokrati',
        description: 'Balanserad demokratisk budgetprocess'
      },
      german: {
        title: 'Systematische Haushaltsdemokratie',
        description: 'Methodische demokratische Haushaltsführung'
      },
      french: {
        title: 'Démocratie Budgétaire Raffinée',
        description: 'Processus budgétaire démocratique sophistiqué'
      },
      dutch: {
        title: 'Praktische Budgetdemocratic',
        description: 'Directe democratische budgetprocessen'
      }
    }
  }
];

interface WorldHubPageContentProps {
  hubData: HubData;
  onWorldSelect: (worldId: string) => void;
  onSettingsClick: () => void;
}

const WorldHubPageContent: React.FC<WorldHubPageContentProps> = ({
  hubData,
  onWorldSelect,
  onSettingsClick
}) => {
  const { currentTheme, culturalContext } = useCulturalTheme();
  const { currentPersona } = useCharacterContext();
  const [isLoaded, setIsLoaded] = useState(false);

  const bgGradient = useColorModeValue(
    currentTheme.colors.gradients.hero,
    'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)'
  );

  const surfaceColor = useColorModeValue(
    currentTheme.colors.surface,
    'gray.800'
  );

  // Initialize loading animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Cultural welcome message
  const welcomeMessage = useMemo(() => {
    return currentTheme.cultural.professionalPhrases.welcome;
  }, [currentTheme]);

  return (
    <Box minH="100vh" bg={currentTheme.colors.background}>
      
      {/* Hero Background Section */}
      <Box
        background={bgGradient}
        position="relative"
        overflow="hidden"
        pb={8}
        pt={6}
      >
        {/* Decorative Background Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage="radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px)"
          backgroundSize="40px 40px"
          opacity={0.3}
        />

        <Container maxW="7xl" position="relative" zIndex={1}>
          
          {/* Header */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Flex align="center" justify="space-between" mb={8}>
              
              {/* Cultural Context Display */}
              <VStack align="start" spacing={1}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color="white"
                  opacity={0.9}
                  letterSpacing="wide"
                >
                  {currentTheme.displayName}
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="700"
                  color="white"
                  letterSpacing={currentTheme.typography.letterSpacing.wide}
                >
                  Kommunal Kompetensutveckling
                </Text>
              </VStack>

              {/* Action Buttons */}
              <HStack spacing={3}>
                
                {/* Cultural Theme Selector */}
                <Box
                  bg="rgba(255,255,255,0.1)"
                  borderRadius="lg"
                  p={2}
                  backdropFilter="blur(10px)"
                >
                  <CulturalThemeSelector />
                </Box>

                {/* Settings */}
                <IconButton
                  aria-label="Inställningar"
                  icon={<FiSettings />}
                  variant="ghost"
                  color="white"
                  size="lg"
                  onClick={onSettingsClick}
                  _hover={{
                    bg: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)'
                  }}
                />
                
              </HStack>
            </Flex>
          </MotionBox>

          {/* Hero Score Display */}
          <AnimatePresence>
            {isLoaded && (
              <ScaleFade initialScale={0.9} in={isLoaded}>
                <HeroScoreDisplay
                  totalScore={hubData.totalScore}
                  maxScore={hubData.maxScore}
                  worldCompletionPercentage={hubData.worldCompletionPercentage}
                  currentCertificationLevel={hubData.currentCertificationLevel}
                  nextMilestone={hubData.nextMilestone}
                  professionalStreak={hubData.professionalStreak}
                  teamRanking={hubData.teamRanking}
                />
              </ScaleFade>
            )}
          </AnimatePresence>

        </Container>
      </Box>

      {/* Main Content Section */}
      <Container maxW="7xl" py={12}>
        <VStack spacing={12} align="stretch">
          
          {/* Cultural Welcome Message */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Box
              bg={surfaceColor}
              borderRadius="xl"
              p={6}
              border="2px solid"
              borderColor={currentTheme.colors.primary + '20'}
              textAlign="center"
            >
              <Text
                fontSize="xl"
                fontWeight="600"
                color={currentTheme.colors.primary}
                letterSpacing={currentTheme.typography.letterSpacing.wide}
              >
                {welcomeMessage}
              </Text>
              <Text
                fontSize="md"
                color={currentTheme.colors.text.secondary}
                mt={2}
                maxW="2xl"
                mx="auto"
              >
                {currentTheme.cultural.professionalPhrases.progress}
              </Text>
            </Box>
          </MotionBox>

          {/* World Navigation Grid */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <WorldNavigationGrid
              worldProgresses={hubData.worldProgresses}
              onWorldSelect={onWorldSelect}
            />
          </MotionBox>

          {/* Achievement Badge System */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Box
              bg={surfaceColor}
              borderRadius="xl"
              p={8}
              border="2px solid"
              borderColor={currentTheme.colors.primary + '20'}
            >
              <VStack spacing={6} align="stretch">
                
                {/* Section Header */}
                <VStack spacing={2}>
                  <Text
                    fontSize="2xl"
                    fontWeight="800"
                    color={currentTheme.colors.primary}
                    textAlign="center"
                  >
                    Professionella Prestationer
                  </Text>
                  <Text
                    fontSize="md"
                    color={currentTheme.colors.text.secondary}
                    textAlign="center"
                    maxW="2xl"
                  >
                    Spåra din kompetensutveckling genom kommunala domäner och kulturell intelligens
                  </Text>
                </VStack>

                {/* Achievement System */}
                <AchievementBadgeSystem
                  achievements={sampleAchievements}
                  onAchievementClick={(achievement) => {
                    console.log('Achievement clicked:', achievement);
                  }}
                />

              </VStack>
            </Box>
          </MotionBox>

        </VStack>
      </Container>

    </Box>
  );
};

// Main World Hub Page with Cultural Theme Provider
interface WorldHubPageProps {
  onWorldSelect?: (worldId: string) => void;
  onSettingsClick?: () => void;
}

export const WorldHubPage: React.FC<WorldHubPageProps> = ({
  onWorldSelect = (worldId) => console.log('World selected:', worldId),
  onSettingsClick = () => console.log('Settings clicked')
}) => {
  return (
    <CulturalThemeProvider>
      <WorldHubPageContent
        hubData={sampleHubData}
        onWorldSelect={onWorldSelect}
        onSettingsClick={onSettingsClick}
      />
    </CulturalThemeProvider>
  );
};