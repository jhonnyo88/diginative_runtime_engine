import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Flex,
  Progress,
  Badge,
  Icon,
  Grid,
  Image,
  Fade,
  ScaleFade,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiUsers,
  FiTrendingUp,
  FiGlobe,
  FiAward,
  FiTarget,
  FiCheck
} from 'react-icons/fi';

// Import our implemented components
import { HeroScoreDisplay } from '../WorldHub/HeroScoreDisplay';
import { WorldNavigationGrid } from '../WorldHub/WorldNavigationGrid';
import { CulturalThemeProvider, useCulturalTheme } from '../WorldHub/CulturalThemeProvider';


// Demo Flow Stages for Sveriges Digitaliseringsstrategi Presentation
interface DemoStage {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  keyPoints: string[];
  visualFocus: 'hub_overview' | 'cultural_intelligence' | 'professional_development' | 'municipal_roi' | 'european_expansion';
  stakeholderValue: string;
  nextAction?: string;
}

const sverigeDemoFlow: DemoStage[] = [
  {
    id: 'opening_impact',
    title: 'DigiNativa Runtime Engine - Sveriges Digital Framtid',
    description: 'Revolutionerande kommunal kompetensutveckling med AI-driven spelgenerering',
    duration: 30,
    keyPoints: [
      '320% ökning av medarbetarengagemang',
      '18% förbättring av kommunal service',
      '90%+ kulturell anpassning europeiska marknader',
      'Världsledande municipal training technology'
    ],
    visualFocus: 'hub_overview',
    stakeholderValue: 'Immediate impact demonstration - proven results från Q2 success',
    nextAction: 'Visa Anna Svensson professional journey'
  },
  {
    id: 'anna_svenska_professional',
    title: 'Anna Svensson - Svenska Kommunal Professional Excellence',
    description: 'Lagom-baserad kompetensutveckling med konsensus och hållbarhet',
    duration: 45,
    keyPoints: [
      'Svenska lagom principles i professional development',
      'Demokratisk consensus-building genom realistic scenarier',
      'Hållbar competency growth med work-life balance',
      'SKR (Sveriges Kommuner och Regioner) certification alignment'
    ],
    visualFocus: 'cultural_intelligence',
    stakeholderValue: 'Swedish cultural authenticity - respecting myndigheter values while driving innovation',
    nextAction: 'Demonstrate cross-cultural European intelligence'
  },
  {
    id: 'european_cultural_mastery',
    title: 'Europeisk Kulturell Intelligens - Competitive Advantage',
    description: 'Seamless adaptation across Swedish, German, French, Dutch municipal contexts',
    duration: 60,
    keyPoints: [
      'Real-time cultural context switching <0.3s',
      'Klaus (German systematik), Marie (French excellence), Pieter (Dutch efficiency)',
      'Cross-border municipal cooperation simulation',
      'CEMR (Council of European Municipalities) recognition pathway'
    ],
    visualFocus: 'cultural_intelligence',
    stakeholderValue: 'European market leadership - €20M ARR opportunity through cultural intelligence',
    nextAction: 'Show professional development ROI measurement'
  },
  {
    id: 'municipal_roi_demonstration',
    title: 'Mätbar Municipal ROI - Stakeholder Value Evidence',
    description: 'Quantified professional development return med government accountability',
    duration: 40,
    keyPoints: [
      '18% validated municipal service improvement',
      'Real-time competency tracking med career advancement metrics',
      'Budget committee cost-benefit analysis integration',
      'Citizen service enhancement measurement'
    ],
    visualFocus: 'municipal_roi',
    stakeholderValue: 'Investment justification - clear training ROI for municipal leadership buy-in',
    nextAction: 'Present professional development journey visualization'
  },
  {
    id: 'professional_journey_excellence',
    title: '5-World Professional Development Journey',
    description: 'Emergency Response → Budget → Digital → Stakeholder → Compliance mastery',
    duration: 75,
    keyPoints: [
      'Progressive competency unlocking med realistic municipal scenarios',
      'Cross-world synthesis för comprehensive professional excellence',
      'Government-recognized certification pathways',
      '5-level progression: Novice → Competent → Proficient → Expert → Master'
    ],
    visualFocus: 'professional_development',
    stakeholderValue: 'Career advancement clarity - professional development aligned with municipal career paths',
    nextAction: 'Showcase European expansion potential'
  },
  {
    id: 'european_expansion_vision',
    title: 'Europeisk Expansion - €20M ARR Market Opportunity',
    description: 'Sverige som leader i European municipal digital transformation',
    duration: 50,
    keyPoints: [
      'Premium pricing strategy (40% markup) justified through technical superiority',
      'Cultural intelligence competitive moat',
      '1,050 target municipalities across Swedish/German/French/Dutch markets',
      'Cross-border municipal cooperation enhancement'
    ],
    visualFocus: 'european_expansion',
    stakeholderValue: 'Strategic opportunity - positioning Sverige as European municipal innovation leader',
    nextAction: 'Call to action för pilot program'
  },
  {
    id: 'call_to_action',
    title: 'Sveriges Digitaliseringsstrategi Implementation',
    description: 'Immediate pilot program för Swedish municipal leadership demonstration',
    duration: 30,
    keyPoints: [
      'Q1 2025 Swedish municipal pilot program launch',
      'Partnership med SKR för government recognition',
      'European expansion roadmap 2025-2027',
      'Sveriges position som global municipal innovation leader'
    ],
    visualFocus: 'hub_overview',
    stakeholderValue: 'Action orientation - clear next steps för Sveriges digital leadership achievement',
    nextAction: 'Demo completion med strategic discussion'
  }
];

interface DemoControlsProps {
  currentStage: number;
  totalStages: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStageSelect: (stageIndex: number) => void;
  remainingTime: number;
}

const DemoControls: React.FC<DemoControlsProps> = ({
  currentStage,
  totalStages,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onStageSelect,
  remainingTime
}) => {
  const { currentTheme } = useCulturalTheme();

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      position="fixed"
      bottom={4}
      left="50%"
      transform="translateX(-50%)"
      bg="white"
      borderRadius="xl"
      boxShadow="2xl"
      border="2px solid"
      borderColor={currentTheme.colors.primary}
      p={4}
      zIndex={1000}
      minW="600px"
    >
      <VStack spacing={3}>
        
        {/* Stage Progress */}
        <HStack spacing={2} w="100%">
          <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary}>
            Demo Progress:
          </Text>
          <Text fontSize="sm" color="gray.600">
            {currentStage + 1} / {totalStages}
          </Text>
          <Progress
            value={((currentStage + 1) / totalStages) * 100}
            colorScheme="blue"
            flex={1}
            borderRadius="full"
          />
          <Text fontSize="xs" color="gray.500">
            {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
          </Text>
        </HStack>

        {/* Control Buttons */}
        <HStack spacing={3} justify="center">
          <Button
            size="sm"
            variant="outline"
            onClick={onPrevious}
            isDisabled={currentStage === 0}
            leftIcon={<Icon as={FiSkipForward} transform="rotate(180deg)" />}
          >
            Föregående
          </Button>
          
          <Button
            size="sm"
            colorScheme="blue"
            onClick={isPlaying ? onPause : onPlay}
            leftIcon={<Icon as={isPlaying ? FiPause : FiPlay} />}
            minW="100px"
          >
            {isPlaying ? 'Pausa' : 'Spela'}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onNext}
            isDisabled={currentStage === totalStages - 1}
            rightIcon={<Icon as={FiSkipForward} />}
          >
            Nästa
          </Button>
        </HStack>

        {/* Stage Quick Access */}
        <Grid templateColumns="repeat(7, 1fr)" gap={1} w="100%">
          {sverigeDemoFlow.map((stage, index) => (
            <Button
              key={stage.id}
              size="xs"
              variant={index === currentStage ? 'solid' : 'ghost'}
              colorScheme={index === currentStage ? 'blue' : 'gray'}
              onClick={() => onStageSelect(index)}
              p={1}
              fontSize="xs"
            >
              {index + 1}
            </Button>
          ))}
        </Grid>

      </VStack>
    </MotionBox>
  );
};

interface DemoStageDisplayProps {
  stage: DemoStage;
  stageIndex: number;
  isActive: boolean;
  remainingTime: number;
}

const DemoStageDisplay: React.FC<DemoStageDisplayProps> = ({
  stage,
  stageIndex,
  isActive,
  remainingTime
}) => {
  const { currentTheme } = useCulturalTheme();

  if (!isActive) return null;

  // Sample data that changes based on demo stage
      case 'cultural_intelligence':
        return {
          totalScore: 3150,
          worldCompletion: 75,
          achievements: 12,
          teamRanking: 12
        };
      case 'professional_development':
        return {
          totalScore: 3650,
          worldCompletion: 85,
          achievements: 18,
          teamRanking: 8
        };
      case 'municipal_roi':
        return {
          totalScore: 4200,
          worldCompletion: 95,
          achievements: 25,
          teamRanking: 5
        };
      default:
        return {
          totalScore: 2847,
          worldCompletion: 67,
          achievements: 8,
          teamRanking: 15
        };
    }
  };


  return (
    <MotionContainer
      key={stage.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
      maxW="7xl"
      py={8}
    >
      <VStack spacing={8} align="stretch">
        
        {/* Stage Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          textAlign="center"
          p={6}
          bg={currentTheme.colors.surface}
          borderRadius="xl"
          border="2px solid"
          borderColor={currentTheme.colors.primary}
        >
          <VStack spacing={4}>
            <Badge
              colorScheme="blue"
              variant="solid"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              Demo Steg {stageIndex + 1}
            </Badge>
            
            <Text
              fontSize="3xl"
              fontWeight="800"
              color={currentTheme.colors.primary}
              lineHeight="tight"
            >
              {stage.title}
            </Text>
            
            <Text
              fontSize="lg"
              color={currentTheme.colors.text.secondary}
              maxW="4xl"
            >
              {stage.description}
            </Text>

            {/* Stage Progress */}
            <Box w="100%" maxW="md">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="600">
                  Steg Progress:
                </Text>
                <Text fontSize="sm" color={currentTheme.colors.primary}>
                  {Math.floor(((stage.duration - remainingTime) / stage.duration) * 100)}%
                </Text>
              </HStack>
              <Progress
                value={((stage.duration - remainingTime) / stage.duration) * 100}
                colorScheme="blue"
                bg={currentTheme.colors.accent + '20'}
                borderRadius="full"
                h={2}
              />
            </Box>
          </VStack>
        </MotionBox>

        {/* Key Points */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Grid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
            gap={4}
            mb={8}
          >
            {stage.keyPoints.map((point, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                p={4}
                bg={currentTheme.colors.surface}
                borderRadius="lg"
                border="1px solid"
                borderColor={currentTheme.colors.accent + '30'}
              >
                <HStack spacing={3}>
                  <Icon
                    as={FiCheck}
                    w={5}
                    h={5}
                    color={currentTheme.colors.accent}
                  />
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color={currentTheme.colors.text.primary}
                    flex={1}
                  >
                    {point}
                  </Text>
                </HStack>
              </MotionBox>
            ))}
          </Grid>
        </MotionBox>

        {/* Visual Focus Component */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {stage.visualFocus === 'hub_overview' && (
            <HeroScoreDisplay
              totalScore={demoData.totalScore}
              maxScore={5000}
              worldCompletionPercentage={demoData.worldCompletion}
              currentCertificationLevel="Kompetent Kommunal Professional"
              nextMilestone={{
                name: 'Skicklig Kommunal Professional',
                requiredScore: 3500,
                pointsRemaining: 3500 - demoData.totalScore
              }}
              professionalStreak={8}
              teamRanking={{
                percentage: demoData.teamRanking,
                total: 127
              }}
            />
          )}

          {stage.visualFocus === 'professional_development' && (
            <WorldNavigationGrid
              worldProgresses={[
                {
                  worldId: 'emergency_response',
                  completionPercentage: 100,
                  status: 'completed',
                  achievements: ['crisis_leadership', 'multi_agency_coordination']
                },
                {
                  worldId: 'budget_planning',
                  completionPercentage: 100,
                  status: 'completed',
                  achievements: ['democratic_budget_facilitation']
                },
                {
                  worldId: 'digital_transformation',
                  completionPercentage: 85,
                  status: 'in_progress',
                  achievements: ['digital_innovation_leadership'],
                  estimatedTimeRemaining: '15 min'
                },
                {
                  worldId: 'stakeholder_relations',
                  completionPercentage: 0,
                  status: 'available',
                  achievements: []
                },
                {
                  worldId: 'regulatory_compliance',
                  completionPercentage: 0,
                  status: 'locked',
                  achievements: []
                }
              ]}
              onWorldSelect={(worldId) => console.log('Demo world selected:', worldId)}
            />
          )}

          {(stage.visualFocus === 'cultural_intelligence' || 
            stage.visualFocus === 'municipal_roi' || 
            stage.visualFocus === 'european_expansion') && (
            <Box
              p={8}
              bg={currentTheme.colors.surface}
              borderRadius="xl"
              border="2px solid"
              borderColor={currentTheme.colors.primary}
              textAlign="center"
            >
              <VStack spacing={6}>
                <Icon
                  as={stage.visualFocus === 'cultural_intelligence' ? FiGlobe :
                     stage.visualFocus === 'municipal_roi' ? FiTrendingUp : FiTarget}
                  w={16}
                  h={16}
                  color={currentTheme.colors.primary}
                />
                <Text
                  fontSize="xl"
                  fontWeight="700"
                  color={currentTheme.colors.primary}
                >
                  {stage.visualFocus === 'cultural_intelligence' ? 'Europeisk Kulturell Intelligens' :
                   stage.visualFocus === 'municipal_roi' ? 'Municipal ROI Dashboard' : 'European Expansion Strategy'}
                </Text>
                <Text
                  fontSize="md"
                  color={currentTheme.colors.text.secondary}
                  maxW="2xl"
                >
                  {stage.stakeholderValue}
                </Text>
                
                {/* Dynamic metrics based on focus */}
                <Grid templateColumns="repeat(3, 1fr)" gap={6} w="100%">
                  <VStack>
                    <Text fontSize="3xl" fontWeight="800" color={currentTheme.colors.primary}>
                      {stage.visualFocus === 'cultural_intelligence' ? '90%+' :
                       stage.visualFocus === 'municipal_roi' ? '18%' : '€20M'}
                    </Text>
                    <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                      {stage.visualFocus === 'cultural_intelligence' ? 'Cultural Adaptation' :
                       stage.visualFocus === 'municipal_roi' ? 'Service Improvement' : 'ARR Target'}
                    </Text>
                  </VStack>
                  <VStack>
                    <Text fontSize="3xl" fontWeight="800" color={currentTheme.colors.accent}>
                      {stage.visualFocus === 'cultural_intelligence' ? '4' :
                       stage.visualFocus === 'municipal_roi' ? '320%' : '1,050'}
                    </Text>
                    <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                      {stage.visualFocus === 'cultural_intelligence' ? 'European Markets' :
                       stage.visualFocus === 'municipal_roi' ? 'Engagement Increase' : 'Target Municipalities'}
                    </Text>
                  </VStack>
                  <VStack>
                    <Text fontSize="3xl" fontWeight="800" color="green.500">
                      {stage.visualFocus === 'cultural_intelligence' ? '<0.3s' :
                       stage.visualFocus === 'municipal_roi' ? 'Real-time' : '40%'}
                    </Text>
                    <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                      {stage.visualFocus === 'cultural_intelligence' ? 'Context Switch' :
                       stage.visualFocus === 'municipal_roi' ? 'ROI Tracking' : 'Premium Pricing'}
                    </Text>
                  </VStack>
                </Grid>
              </VStack>
            </Box>
          )}
        </MotionBox>

        {/* Stakeholder Value Highlight */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
          p={6}
          bg="blue.50"
          borderRadius="xl"
          border="2px solid"
          borderColor="blue.200"
        >
          <HStack spacing={4}>
            <Icon as={FiAward} w={8} h={8} color="blue.500" />
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="lg" fontWeight="700" color="blue.700">
                Stakeholder Value
              </Text>
              <Text fontSize="md" color="blue.600">
                {stage.stakeholderValue}
              </Text>
              {stage.nextAction && (
                <Text fontSize="sm" color="blue.500" fontStyle="italic">
                  Nästa: {stage.nextAction}
                </Text>
              )}
            </VStack>
          </HStack>
        </MotionBox>

      </VStack>
    </MotionContainer>
  );
};

interface SverigesDigitaliseringsstrategiDemoProps {
  onDemoComplete?: () => void;
  autoPlay?: boolean;
}

export const SverigesDigitaliseringsstrategiDemo: React.FC<SverigesDigitaliseringsstrategiDemoProps> = ({
  onDemoComplete,
  autoPlay = false
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [remainingTime, setRemainingTime] = useState(sverigeDemoFlow[0].duration);

  // Timer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Auto-advance to next stage
            if (currentStage < sverigeDemoFlow.length - 1) {
              setCurrentStage(prev => prev + 1);
              return sverigeDemoFlow[currentStage + 1].duration;
            } else {
              // Demo complete
              setIsPlaying(false);
              onDemoComplete?.();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying, remainingTime, currentStage, onDemoComplete]);

  // Stage change handler
  useEffect(() => {
    setRemainingTime(sverigeDemoFlow[currentStage].duration);
  }, [currentStage]);




  return (
    <CulturalThemeProvider>
      <Box minH="100vh" bg="gray.50" position="relative">
        
        {/* Demo Content */}
        <AnimatePresence mode="wait">
          <DemoStageDisplay
            key={currentStage}
            stage={sverigeDemoFlow[currentStage]}
            stageIndex={currentStage}
            isActive={true}
            remainingTime={remainingTime}
          />
        </AnimatePresence>

        {/* Demo Controls */}
        <DemoControls
          currentStage={currentStage}
          totalStages={sverigeDemoFlow.length}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStageSelect={handleStageSelect}
          remainingTime={remainingTime}
        />

      </Box>
    </CulturalThemeProvider>
  );
};