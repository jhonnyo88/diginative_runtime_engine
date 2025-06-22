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
  ScaleFade,
  Button,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiStar, FiGlobe, FiZap, FiTarget, FiTrendingUp } from 'react-icons/fi';

// Import enhanced components
import { HeroScoreDisplay } from './HeroScoreDisplay';
import { WorldNavigationGrid } from './WorldNavigationGrid';
import { AchievementBadgeSystem } from './AchievementBadgeSystem';
import { CulturalThemeProvider, CulturalThemeSelector, useCulturalTheme } from './CulturalThemeProvider';
import { MunicipalBrandingDisplay } from './MunicipalBrandingSystem';
import { ExecutiveMunicipalDashboard } from './ExecutiveMunicipalDashboard';
import { AdvancedCulturalIntelligence } from './AdvancedCulturalIntelligence';
import { ProfessionalDevelopmentJourney } from './ProfessionalDevelopmentJourney';

// Import existing contexts and hooks
import { useCharacterContext } from '../../contexts/CharacterContext';
import { useAchievementProgress } from '../../hooks/useAchievementProgress';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

// Enhanced Visual Excellence Interfaces
interface VisualEnhancementSettings {
  enableParticleEffects: boolean;
  enableSmoothTransitions: boolean;
  enableCulturalAnimations: boolean;
  enableProfessionalMotivation: boolean;
  visualIntensity: 'minimal' | 'standard' | 'enhanced' | 'maximum';
  performanceMode: 'quality' | 'balanced' | 'performance';
}

interface WorldHubSection {
  id: string;
  name: string;
  displayName: string;
  icon: any;
  component: React.ComponentType<any>;
  requiresData?: boolean;
  culturalAdaptive?: boolean;
  professionalFocus?: boolean;
}

// Enhanced sample data with cultural intelligence
const enhancedHubData = {
  totalScore: 3247,
  maxScore: 5000,
  worldCompletionPercentage: 73,
  currentCertificationLevel: 'Skicklig Kommunal Professional',
  nextMilestone: {
    name: 'Expert Kommunal Professional',
    requiredScore: 4500,
    pointsRemaining: 1253
  },
  professionalStreak: 12,
  teamRanking: {
    percentage: 8,
    total: 156
  },
  worldProgresses: [
    {
      worldId: 'emergency_response',
      completionPercentage: 100,
      status: 'completed' as const,
      lastAccessed: new Date('2025-01-20'),
      achievements: ['crisis_decision_leadership', 'multi_agency_coordination', 'citizen_communication_excellence']
    },
    {
      worldId: 'budget_planning',
      completionPercentage: 95,
      status: 'completed' as const,
      lastAccessed: new Date('2025-01-21'),
      achievements: ['democratic_budget_facilitation', 'stakeholder_consensus_building']
    },
    {
      worldId: 'digital_transformation',
      completionPercentage: 78,
      status: 'in_progress' as const,
      lastAccessed: new Date('2025-01-22'),
      achievements: ['digital_innovation_leadership'],
      estimatedTimeRemaining: '8 min'
    },
    {
      worldId: 'stakeholder_relations',
      completionPercentage: 15,
      status: 'available' as const,
      achievements: []
    },
    {
      worldId: 'regulatory_compliance',
      completionPercentage: 0,
      status: 'locked' as const,
      achievements: []
    }
  ],
  europeanCulturalMastery: {
    swedish: 96,
    german: 87,
    french: 82,
    dutch: 91
  },
  professionalNetworking: {
    mentors: 3,
    peers: 24,
    mentorees: 6,
    europeanConnections: 15
  }
};

// Enhanced achievements with European cultural variants
const enhancedAchievements = [
  {
    id: 'crisis_decision_leadership',
    title: 'Krisbeslut Ledarskap',
    description: 'Excellens i konsensusbaserat krisbeslut under tidspress',
    category: 'world_specific' as const,
    level: 'proficient' as const,
    worldId: 'emergency_response',
    icon: FiZap,
    color: '#DC2626',
    earned: true,
    earnedDate: new Date('2025-01-20'),
    europeanRecognition: true,
    culturalVariants: {
      swedish: {
        title: 'Konsensusbaserat Krisbeslut Excellence',
        description: 'Demokratiskt krisbeslut med kollektivt ansvar och lagom-principer'
      },
      german: {
        title: 'Systematische Krisenentscheidung Excellence',
        description: 'Methodische Krisenentscheidung mit gründlicher Prozessexzellenz'
      },
      french: {
        title: 'Excellence en Décision de Crise',
        description: 'Prise de décision de crise avec raffinement diplomatique'
      },
      dutch: {
        title: 'Excellentie in Crisisbesluiten',
        description: 'Directe, efficiënte crisisbesluiten met praktische resultaten'
      }
    }
  },
  {
    id: 'digital_innovation_leadership',
    title: 'Digital Innovation Ledarskap',
    description: 'Ledande digital transformation inom kommunal verksamhet',
    category: 'cross_world_synthesis' as const,
    level: 'expert' as const,
    worldId: 'digital_transformation',
    icon: FiTrendingUp,
    color: '#0EA5E9',
    earned: true,
    earnedDate: new Date('2025-01-22'),
    europeanRecognition: true,
    culturalVariants: {
      swedish: {
        title: 'Hållbar Digital Innovation',
        description: 'Balanserad digital transformation med demokratiskt deltagande'
      },
      german: {
        title: 'Systematische Digitale Innovation',
        description: 'Methodische digitale Transformation mit Prozessexzellenz'
      },
      french: {
        title: 'Innovation Numérique Raffinée',
        description: 'Transformation numérique avec sophistication du service public'
      },
      dutch: {
        title: 'Praktische Digitale Innovatie',
        description: 'Efficiënte digitale transformatie met directe resultaten'
      }
    }
  },
  {
    id: 'european_cultural_mastery',
    title: 'Europeisk Kulturell Expertis',
    description: 'Masterskap inom cross-kulturell kommunal samverkan',
    category: 'cultural_intelligence' as const,
    level: 'master' as const,
    worldId: null,
    icon: FiGlobe,
    color: '#7C3AED',
    earned: true,
    earnedDate: new Date('2025-01-22'),
    europeanRecognition: true,
    culturalVariants: {
      swedish: {
        title: 'Europeisk Kulturell Intelligens Mastery',
        description: 'Exceptionell cross-kulturell kompetens för svensk municipal ledarskap'
      },
      german: {
        title: 'Europäische Kulturelle Kompetenz Mastery',
        description: 'Überlegene interkulturelle Führung für deutsche Verwaltungsexzellenz'
      },
      french: {
        title: 'Maîtrise Culturelle Européenne',
        description: 'Excellence culturelle interculturelle pour le service public français'
      },
      dutch: {
        title: 'Europese Culturele Competentie Mastery',
        description: 'Superieure interculturele competentie voor Nederlandse bestuurlijke excellentie'
      }
    }
  }
];

// World Hub sections configuration
const worldHubSections: WorldHubSection[] = [
  {
    id: 'hero_score',
    name: 'hero_score',
    displayName: 'Professional Achievement Center',
    icon: FiStar,
    component: HeroScoreDisplay,
    requiresData: true,
    culturalAdaptive: true,
    professionalFocus: true
  },
  {
    id: 'world_navigation',
    name: 'world_navigation',
    displayName: '5-World Professional Development',
    icon: FiTarget,
    component: WorldNavigationGrid,
    requiresData: true,
    culturalAdaptive: true,
    professionalFocus: true
  },
  {
    id: 'achievement_system',
    name: 'achievement_system',
    displayName: 'European Achievement Recognition',
    icon: FiZap,
    component: AchievementBadgeSystem,
    requiresData: true,
    culturalAdaptive: true,
    professionalFocus: true
  }
];

interface VisualExcellenceHubContentProps {
  hubData: typeof enhancedHubData;
  achievements: typeof enhancedAchievements;
  visualSettings: VisualEnhancementSettings;
  onWorldSelect: (worldId: string) => void;
  onSettingsClick: () => void;
  onAchievementClick: (achievement: any) => void;
}

const VisualExcellenceHubContent: React.FC<VisualExcellenceHubContentProps> = ({
  hubData,
  achievements,
  visualSettings,
  onWorldSelect,
  onSettingsClick,
  onAchievementClick
}) => {
  const { currentTheme, culturalContext } = useCulturalTheme();
  const { currentPersona } = useCharacterContext();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('hero_score');

  // Enhanced background gradients with cultural intelligence
  const bgGradient = useColorModeValue(
    currentTheme.colors.gradients.hero,
    'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)'
  );

  const surfaceColor = useColorModeValue(
    currentTheme.colors.surface,
    'gray.800'
  );

  // Initialize loading with staggered animations
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Cultural welcome message with European professional excellence
  const welcomeMessage = useMemo(() => {
    const culturalWelcomes = {
      swedish: `Välkommen ${currentPersona?.name || 'Professional'} - Din kommunala excellens inspirerar kollektivet`,
      german: `Willkommen ${currentPersona?.name || 'Professional'} - Ihre systematische Kompetenz stärkt die Verwaltung`,
      french: `Bienvenue ${currentPersona?.name || 'Professional'} - Votre excellence élève le service public`,
      dutch: `Welkom ${currentPersona?.name || 'Professional'} - Uw competentie levert directe resultaten`
    };
    return culturalWelcomes[culturalContext as keyof typeof culturalWelcomes] || culturalWelcomes.swedish;
  }, [currentPersona, culturalContext]);

  // Professional status with European recognition
  const professionalStatus = useMemo(() => {
    const totalCulturalMastery = Object.values(hubData.europeanCulturalMastery).reduce((sum, val) => sum + val, 0) / 4;
    
    if (totalCulturalMastery >= 90 && hubData.totalScore >= 4000) {
      return 'Europeisk Municipal Innovation Leader';
    } else if (totalCulturalMastery >= 85 && hubData.totalScore >= 3000) {
      return 'Avancerad Cross-Cultural Professional';
    } else if (totalCulturalMastery >= 75 && hubData.totalScore >= 2000) {
      return 'Kompetent Municipal Professional';
    } else {
      return 'Utvecklande Municipal Professional';
    }
  }, [hubData]);

  return (
    <Box minH="100vh" bg={currentTheme.colors.background}>
      
      {/* Enhanced Hero Background Section with Cultural Intelligence */}
      <Box
        background={bgGradient}
        position="relative"
        overflow="hidden"
        pb={12}
        pt={8}
      >
        {/* Dynamic Particle Background (if enabled) */}
        {visualSettings.enableParticleEffects && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundImage={`radial-gradient(circle at 25% 25%, ${currentTheme.colors.primary}15 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, ${currentTheme.colors.accent}10 1px, transparent 1px)`}
            backgroundSize="60px 60px, 40px 40px"
            opacity={0.4}
            animation={visualSettings.enableCulturalAnimations ? "float 20s ease-in-out infinite" : "none"}
          />
        )}

        {/* Cultural Decoration Pattern */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage="radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)"
          backgroundSize="80px 80px"
          opacity={0.2}
        />

        <Container maxW="7xl" position="relative" zIndex={1}>
          
          {/* Enhanced Header with Professional Status */}
          <MotionBox
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Flex align="center" justify="space-between" mb={10} flexWrap="wrap" gap={4}>
              
              {/* Professional Identity Display */}
              <VStack align="start" spacing={3}>
                <HStack spacing={4}>
                  <Box
                    w={4}
                    h={4}
                    bg={currentTheme.colors.accent}
                    borderRadius="full"
                    boxShadow={`0 0 20px ${currentTheme.colors.accent}50`}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="white"
                    opacity={0.9}
                    letterSpacing="wide"
                  >
                    {currentTheme.displayName} • {professionalStatus}
                  </Text>
                </HStack>
                <Text
                  fontSize="2xl"
                  fontWeight="800"
                  color="white"
                  letterSpacing={currentTheme.typography.letterSpacing.wide}
                  textShadow="0 2px 4px rgba(0,0,0,0.3)"
                >
                  {welcomeMessage}
                </Text>
                <HStack spacing={4}>
                  <Text fontSize="sm" color="white" opacity={0.8}>
                    {hubData.worldProgresses.filter(w => w.status === 'completed').length}/5 Worlds Complete
                  </Text>
                  <Text fontSize="sm" color="white" opacity={0.8}>
                    •
                  </Text>
                  <Text fontSize="sm" color="white" opacity={0.8}>
                    {achievements.filter(a => a.earned).length} Achievements
                  </Text>
                  <Text fontSize="sm" color="white" opacity={0.8}>
                    •
                  </Text>
                  <Text fontSize="sm" color="white" opacity={0.8}>
                    {hubData.professionalNetworking.europeanConnections} European Connections
                  </Text>
                </HStack>
              </VStack>

              {/* Enhanced Action Controls */}
              <VStack spacing={4}>
                <HStack spacing={4}>
                  
                  {/* Municipal Branding Integration */}
                  <Box
                    bg="rgba(255,255,255,0.1)"
                    borderRadius="lg"
                    p={3}
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255,255,255,0.2)"
                  >
                    <MunicipalBrandingDisplay size="sm" />
                  </Box>

                  {/* Cultural Theme Selector with Visual Enhancement */}
                  <Box
                    bg="rgba(255,255,255,0.1)"
                    borderRadius="lg"
                    p={3}
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255,255,255,0.2)"
                  >
                    <CulturalThemeSelector />
                  </Box>

                  {/* Enhanced Settings */}
                  <IconButton
                    aria-label="Inställningar"
                    icon={<FiSettings />}
                    variant="ghost"
                    color="white"
                    size="lg"
                    onClick={onSettingsClick}
                    bg="rgba(255,255,255,0.1)"
                    backdropFilter="blur(10px)"
                    border="1px solid rgba(255,255,255,0.2)"
                    _hover={{
                      bg: 'rgba(255,255,255,0.2)',
                      transform: visualSettings.enableSmoothTransitions ? 'translateY(-2px) scale(1.05)' : 'translateY(-1px)'
                    }}
                    transition={visualSettings.enableSmoothTransitions ? "all 0.3s ease" : "all 0.1s ease"}
                  />
                  
                </HStack>

                {/* European Cultural Mastery Indicator */}
                <HStack spacing={2}>
                  {Object.entries(hubData.europeanCulturalMastery).map(([culture, mastery]) => (
                    <Box
                      key={culture}
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={mastery >= 90 ? 'green.400' : mastery >= 80 ? 'yellow.400' : 'orange.400'}
                      boxShadow={`0 0 8px ${mastery >= 90 ? 'green' : mastery >= 80 ? 'yellow' : 'orange'}.400`}
                      title={`${culture}: ${mastery}%`}
                    />
                  ))}
                  <Text fontSize="xs" color="white" opacity={0.8} ml={2}>
                    European Cultural Mastery
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </MotionBox>

          {/* Enhanced Hero Score Display with Staggered Animation */}
          <AnimatePresence>
            {isLoaded && (
              <MotionBox
                key="hero-score"
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: visualSettings.enableSmoothTransitions ? 0.8 : 0.4, 
                  ease: "easeOut",
                  delay: 0.3 
                }}
              >
                <HeroScoreDisplay
                  totalScore={hubData.totalScore}
                  maxScore={hubData.maxScore}
                  worldCompletionPercentage={hubData.worldCompletionPercentage}
                  currentCertificationLevel={hubData.currentCertificationLevel}
                  nextMilestone={hubData.nextMilestone}
                  professionalStreak={hubData.professionalStreak}
                  teamRanking={hubData.teamRanking}
                />
              </MotionBox>
            )}
          </AnimatePresence>

        </Container>
      </Box>

      {/* Enhanced Main Content Section with Professional Excellence */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={16} align="stretch">
          
          {/* Professional Development Pathway */}
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: visualSettings.enableSmoothTransitions ? 0.6 : 0.3, 
              duration: visualSettings.enableSmoothTransitions ? 0.8 : 0.5 
            }}
          >
            <VStack spacing={6} align="stretch">
              <Box textAlign="center">
                <Text
                  fontSize="3xl"
                  fontWeight="800"
                  color={currentTheme.colors.primary}
                  mb={3}
                  letterSpacing={currentTheme.typography.letterSpacing.wide}
                >
                  Professional Development Excellence
                </Text>
                <Text
                  fontSize="lg"
                  color={currentTheme.colors.text.secondary}
                  maxW="3xl"
                  mx="auto"
                  lineHeight="tall"
                >
                  {currentTheme.cultural.professionalPhrases.progress}
                </Text>
              </Box>

              {/* 5-World Navigation Grid with Enhanced Visuals */}
              <WorldNavigationGrid
                worldProgresses={hubData.worldProgresses}
                onWorldSelect={onWorldSelect}
              />
            </VStack>
          </MotionBox>

          {/* European Achievement Recognition System */}
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: visualSettings.enableSmoothTransitions ? 0.9 : 0.5, 
              duration: visualSettings.enableSmoothTransitions ? 0.8 : 0.5 
            }}
          >
            <Box
              bg={surfaceColor}
              borderRadius="2xl"
              p={10}
              border="2px solid"
              borderColor={currentTheme.colors.primary + '20'}
              boxShadow="2xl"
              position="relative"
              overflow="hidden"
            >
              {/* Achievement Background Pattern */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundImage={`linear-gradient(45deg, ${currentTheme.colors.accent}05 25%, transparent 25%),
                                 linear-gradient(-45deg, ${currentTheme.colors.accent}05 25%, transparent 25%)`}
                backgroundSize="20px 20px"
                opacity={0.5}
              />

              <VStack spacing={8} align="stretch" position="relative" zIndex={1}>
                
                {/* Enhanced Section Header */}
                <VStack spacing={4}>
                  <HStack spacing={4} justify="center">
                    <Box
                      w={12}
                      h={12}
                      borderRadius="full"
                      bg={currentTheme.colors.primary}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow={`0 0 30px ${currentTheme.colors.primary}30`}
                    >
                      <FiZap color="white" size={24} />
                    </Box>
                    <Text
                      fontSize="3xl"
                      fontWeight="800"
                      color={currentTheme.colors.primary}
                      textAlign="center"
                    >
                      Europeiska Professionella Prestationer
                    </Text>
                  </HStack>
                  
                  <Text
                    fontSize="lg"
                    color={currentTheme.colors.text.secondary}
                    textAlign="center"
                    maxW="4xl"
                    mx="auto"
                  >
                    Spåra din kompetensutveckling genom kommunala domäner, kulturell intelligens och europeisk professionell excellens
                  </Text>

                  {/* Professional Statistics */}
                  <Grid templateColumns="repeat(4, 1fr)" gap={6} w="100%" mt={6}>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="800" color={currentTheme.colors.primary}>
                        {achievements.filter(a => a.earned).length}
                      </Text>
                      <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                        Earned Achievements
                      </Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="800" color="green.500">
                        {achievements.filter(a => a.earned && a.europeanRecognition).length}
                      </Text>
                      <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                        European Recognized
                      </Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="800" color={currentTheme.colors.accent}>
                        {Math.round(Object.values(hubData.europeanCulturalMastery).reduce((sum, val) => sum + val, 0) / 4)}%
                      </Text>
                      <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                        Cultural Mastery
                      </Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Text fontSize="2xl" fontWeight="800" color="purple.500">
                        {hubData.professionalNetworking.europeanConnections}
                      </Text>
                      <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                        European Network
                      </Text>
                    </VStack>
                  </Grid>
                </VStack>

                {/* Enhanced Achievement System */}
                <AchievementBadgeSystem
                  achievements={achievements}
                  onAchievementClick={onAchievementClick}
                />

              </VStack>
            </Box>
          </MotionBox>

        </VStack>
      </Container>

    </Box>
  );
};

// Visual Enhancement Settings Panel
interface VisualSettingsPanelProps {
  settings: VisualEnhancementSettings;
  onSettingsChange: (settings: VisualEnhancementSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

const VisualSettingsPanel: React.FC<VisualSettingsPanelProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onClose
}) => {
  const { currentTheme } = useCulturalTheme();

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof VisualEnhancementSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <MotionBox
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      position="fixed"
      top={0}
      right={0}
      w="400px"
      h="100vh"
      bg={currentTheme.colors.surface}
      boxShadow="2xl"
      p={6}
      zIndex={1000}
      overflowY="auto"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="700" color={currentTheme.colors.primary}>
            Visual Excellence Settings
          </Text>
          <Button size="sm" variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </HStack>

        <VStack spacing={4} align="stretch">
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="particle-effects" mb="0" flex="1">
              Particle Effects
            </FormLabel>
            <Switch
              id="particle-effects"
              isChecked={settings.enableParticleEffects}
              onChange={(e) => handleSettingChange('enableParticleEffects', e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="smooth-transitions" mb="0" flex="1">
              Smooth Transitions
            </FormLabel>
            <Switch
              id="smooth-transitions"
              isChecked={settings.enableSmoothTransitions}
              onChange={(e) => handleSettingChange('enableSmoothTransitions', e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="cultural-animations" mb="0" flex="1">
              Cultural Animations
            </FormLabel>
            <Switch
              id="cultural-animations"
              isChecked={settings.enableCulturalAnimations}
              onChange={(e) => handleSettingChange('enableCulturalAnimations', e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>

          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="professional-motivation" mb="0" flex="1">
              Professional Motivation
            </FormLabel>
            <Switch
              id="professional-motivation"
              isChecked={settings.enableProfessionalMotivation}
              onChange={(e) => handleSettingChange('enableProfessionalMotivation', e.target.checked)}
              colorScheme="blue"
            />
          </FormControl>
        </VStack>
      </VStack>
    </MotionBox>
  );
};

// Main Visual Excellence World Hub Component
interface VisualExcellenceWorldHubProps {
  onWorldSelect?: (worldId: string) => void;
  onSettingsClick?: () => void;
  onAchievementClick?: (achievement: any) => void;
  initialVisualSettings?: Partial<VisualEnhancementSettings>;
}

export const VisualExcellenceWorldHub: React.FC<VisualExcellenceWorldHubProps> = ({
  onWorldSelect = (worldId) => console.log('World selected:', worldId),
  onSettingsClick = () => console.log('Settings clicked'),
  onAchievementClick = (achievement) => console.log('Achievement clicked:', achievement),
  initialVisualSettings = {}
}) => {
  const [visualSettings, setVisualSettings] = useState<VisualEnhancementSettings>({
    enableParticleEffects: true,
    enableSmoothTransitions: true,
    enableCulturalAnimations: true,
    enableProfessionalMotivation: true,
    visualIntensity: 'enhanced',
    performanceMode: 'balanced',
    ...initialVisualSettings
  });

  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    onSettingsClick();
  };

  return (
    <CulturalThemeProvider>
      <Box position="relative">
        <VisualExcellenceHubContent
          hubData={enhancedHubData}
          achievements={enhancedAchievements}
          visualSettings={visualSettings}
          onWorldSelect={onWorldSelect}
          onSettingsClick={handleSettingsClick}
          onAchievementClick={onAchievementClick}
        />
        
        <AnimatePresence>
          <VisualSettingsPanel
            settings={visualSettings}
            onSettingsChange={setVisualSettings}
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
          />
        </AnimatePresence>
      </Box>
    </CulturalThemeProvider>
  );
};