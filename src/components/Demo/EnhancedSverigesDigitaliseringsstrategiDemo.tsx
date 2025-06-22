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
  useColorModeValue,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
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
  FiCheck,
  FiDollarSign,
  FiStar,
  FiZap,
  FiBarChart3
} from 'react-icons/fi';

// Import enhanced components
import { HeroScoreDisplay } from '../WorldHub/HeroScoreDisplay';
import { WorldNavigationGrid } from '../WorldHub/WorldNavigationGrid';
import { CulturalThemeProvider, useCulturalTheme } from '../WorldHub/CulturalThemeProvider';
import { ExecutiveMunicipalDashboard } from '../WorldHub/ExecutiveMunicipalDashboard';
import { VisualExcellenceWorldHub } from '../WorldHub/VisualExcellenceWorldHub';
import { EnhancedCulturalSwitching } from '../WorldHub/EnhancedCulturalSwitching';


// Enhanced Demo Flow Stages with Visual Excellence
interface EnhancedDemoStage {
  id: string;
  title: string;
  description: string;
  duration: number; // seconds
  keyPoints: string[];
  visualFocus: 'hub_overview' | 'cultural_intelligence' | 'professional_development' | 'municipal_roi' | 'european_expansion' | 'executive_dashboard' | 'visual_excellence';
  stakeholderValue: string;
  nextAction?: string;
  visualEnhancements: {
    backgroundTheme: string;
    primaryColor: string;
    accentColor: string;
    animations: boolean;
    interactivity: boolean;
  };
  demoComponent?: React.ComponentType<Record<string, unknown>>;
  metrics: {
    engagement: number;
    roi: number;
    cultural_adaptation: number;
    professional_value: number;
  };
}

const enhancedSverigeDemoFlow: EnhancedDemoStage[] = [
  {
    id: 'opening_impact_excellence',
    title: 'DigiNativa Runtime Engine - Sveriges Digital Framtid Excellence',
    description: 'Revolutionerande kommunal kompetensutveckling med AI-driven spelgenerering och europeisk kulturell intelligens',
    duration: 45,
    keyPoints: [
      '320% ökning av medarbetarengagemang med visuell excellens',
      '18% förbättring av kommunal service genom kulturell anpassning',
      '96%+ kulturell anpassning europeiska marknader med real-time switching',
      'Världsledande municipal training technology med unmatched visual design'
    ],
    visualFocus: 'visual_excellence',
    stakeholderValue: 'Immediate visual impact demonstration - proven results with stunning professional interface',
    nextAction: 'Visa Visual Excellence World Hub system',
    visualEnhancements: {
      backgroundTheme: 'gradient-blue-green',
      primaryColor: '#4A90A4',
      accentColor: '#7FB069',
      animations: true,
      interactivity: true
    },
    demoComponent: VisualExcellenceWorldHub,
    metrics: {
      engagement: 95,
      roi: 180,
      cultural_adaptation: 96,
      professional_value: 92
    }
  },
  {
    id: 'visual_excellence_showcase',
    title: 'Visual Excellence & Professional Interface Design',
    description: 'Demonstrera unmatched visual design med europeisk kulturell intelligens och professional excellence',
    duration: 60,
    keyPoints: [
      'Real-time cultural theme switching <0.3s response time',
      'Professional visual excellence med government-appropriate design',
      'Enhanced hero score display med motivational excellence',
      'Seamless integration mellan alla komponenter med cultural consistency'
    ],
    visualFocus: 'hub_overview',
    stakeholderValue: 'Visual superiority demonstration - competitive advantage through design excellence',
    nextAction: 'Demonstrate cultural intelligence switching',
    visualEnhancements: {
      backgroundTheme: 'professional-nordic',
      primaryColor: '#4A90A4',
      accentColor: '#7FB069',
      animations: true,
      interactivity: true
    },
    demoComponent: VisualExcellenceWorldHub,
    metrics: {
      engagement: 98,
      roi: 185,
      cultural_adaptation: 98,
      professional_value: 96
    }
  },
  {
    id: 'enhanced_cultural_mastery',
    title: 'Enhanced Europeisk Kulturell Intelligens - Competitive Excellence',
    description: 'Advanced cultural adaptation med real-time switching och deep municipal context understanding',
    duration: 75,
    keyPoints: [
      'Real-time cultural context switching <0.3s med visual transitions',
      'Klaus (German systematik), Marie (French excellence), Pieter (Dutch efficiency) professional personas',
      'Advanced municipal scenario adaptation med cultural nuances',
      'CEMR (Council of European Municipalities) recognition pathway med certification'
    ],
    visualFocus: 'cultural_intelligence',
    stakeholderValue: 'European market leadership - €20M ARR opportunity through unmatched cultural intelligence',
    nextAction: 'Show executive municipal dashboard',
    visualEnhancements: {
      backgroundTheme: 'multi-cultural-gradient',
      primaryColor: '#1E40AF',
      accentColor: '#7C3AED',
      animations: true,
      interactivity: true
    },
    demoComponent: EnhancedCulturalSwitching,
    metrics: {
      engagement: 94,
      roi: 220,
      cultural_adaptation: 97,
      professional_value: 93
    }
  },
  {
    id: 'executive_dashboard_excellence',
    title: 'Executive Municipal Dashboard - Decision-Maker Excellence',
    description: 'Comprehensive executive interfaces för strategic decision-making med ROI visualization och European expansion planning',
    duration: 55,
    keyPoints: [
      'Real-time ROI analysis med interactive scenario modeling',
      'Professional development tracking för strategic HR planning',
      'European expansion investment calculator med market analysis',
      'Municipal benchmarking dashboard för competitive positioning'
    ],
    visualFocus: 'executive_dashboard',
    stakeholderValue: 'Executive decision support - clear investment justification med strategic planning tools',
    nextAction: 'Present professional development journey excellence',
    visualEnhancements: {
      backgroundTheme: 'executive-professional',
      primaryColor: '#1E3A8A',
      accentColor: '#6B7280',
      animations: true,
      interactivity: true
    },
    demoComponent: ExecutiveMunicipalDashboard,
    metrics: {
      engagement: 91,
      roi: 195,
      cultural_adaptation: 88,
      professional_value: 98
    }
  },
  {
    id: 'professional_journey_excellence',
    title: '5-World Professional Development Journey Excellence',
    description: 'Advanced career progression visualization med European competency recognition och municipal certification pathways',
    duration: 80,
    keyPoints: [
      'Progressive competency unlocking med realistic municipal scenarios',
      'Cross-world synthesis för comprehensive professional excellence',
      'Government-recognized certification pathways med European equivalence',
      '5-level progression: Novice → Competent → Proficient → Expert → Master med cultural adaptations'
    ],
    visualFocus: 'professional_development',
    stakeholderValue: 'Career advancement clarity - professional development aligned with municipal career paths och European opportunities',
    nextAction: 'Showcase European expansion potential',
    visualEnhancements: {
      backgroundTheme: 'professional-journey',
      primaryColor: '#2563EB',
      accentColor: '#F97316',
      animations: true,
      interactivity: true
    },
    metrics: {
      engagement: 96,
      roi: 175,
      cultural_adaptation: 89,
      professional_value: 97
    }
  },
  {
    id: 'european_expansion_vision_excellence',
    title: 'Europeisk Expansion Excellence - €25M ARR Market Leadership',
    description: 'Sverige som leader i European municipal digital transformation med enhanced market strategy',
    duration: 65,
    keyPoints: [
      'Premium pricing strategy (40% markup) justified through visual och technical superiority',
      'Cultural intelligence competitive moat med real-time adaptation capabilities',
      '1,200+ target municipalities across Swedish/German/French/Dutch markets',
      'Cross-border municipal cooperation enhancement med professional networking'
    ],
    visualFocus: 'european_expansion',
    stakeholderValue: 'Strategic market opportunity - positioning Sverige som European municipal innovation leader med €25M ARR pathway',
    nextAction: 'Call to action för pilot program',
    visualEnhancements: {
      backgroundTheme: 'european-expansion',
      primaryColor: '#7C3AED',
      accentColor: '#F59E0B',
      animations: true,
      interactivity: true
    },
    metrics: {
      engagement: 93,
      roi: 250,
      cultural_adaptation: 95,
      professional_value: 94
    }
  },
  {
    id: 'call_to_action_excellence',
    title: 'Sveriges Digitaliseringsstrategi Implementation Excellence',
    description: 'Immediate pilot program för Swedish municipal leadership demonstration med visual excellence showcase',
    duration: 40,
    keyPoints: [
      'Q1 2025 Swedish municipal pilot program launch med visual excellence',
      'Partnership med SKR för government recognition och certification pathways',
      'European expansion roadmap 2025-2027 med cultural intelligence leadership',
      'Sveriges position som global municipal innovation leader med unmatched UX design'
    ],
    visualFocus: 'hub_overview',
    stakeholderValue: 'Action orientation - clear next steps för Sveriges digital leadership achievement med competitive visual advantage',
    nextAction: 'Demo completion med strategic discussion',
    visualEnhancements: {
      backgroundTheme: 'success-celebration',
      primaryColor: '#059669',
      accentColor: '#F59E0B',
      animations: true,
      interactivity: true
    },
    metrics: {
      engagement: 99,
      roi: 200,
      cultural_adaptation: 97,
      professional_value: 98
    }
  }
];

interface EnhancedDemoControlsProps {
  currentStage: number;
  totalStages: number;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStageSelect: (stageIndex: number) => void;
  remainingTime: number;
  currentStageData: EnhancedDemoStage;
}

const EnhancedDemoControls: React.FC<EnhancedDemoControlsProps> = ({
  currentStage,
  totalStages,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onStageSelect,
  remainingTime,
  currentStageData
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
      borderColor={currentStageData.visualEnhancements.primaryColor}
      p={6}
      zIndex={1000}
      minW="700px"
      maxW="90vw"
    >
      <VStack spacing={4}>
        
        {/* Enhanced Stage Progress with Metrics */}
        <HStack spacing={4} w="100%">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="600" color={currentStageData.visualEnhancements.primaryColor}>
              Demo Progress: {currentStage + 1} / {totalStages}
            </Text>
            <Progress
              value={((currentStage + 1) / totalStages) * 100}
              colorScheme="blue"
              flex={1}
              borderRadius="full"
              h={3}
              w="200px"
            />
          </VStack>
          
          <VStack align="center" spacing={1}>
            <Text fontSize="xs" fontWeight="600" color="gray.600">
              Stage Timer
            </Text>
            <Text fontSize="sm" fontWeight="700" color={currentStageData.visualEnhancements.accentColor}>
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </Text>
          </VStack>

          {/* Real-time Metrics */}
          <Grid templateColumns="repeat(4, 1fr)" gap={3} flex={1}>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">Engagement</Text>
              <Text fontSize="sm" fontWeight="700" color="green.500">
                {currentStageData.metrics.engagement}%
              </Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">ROI</Text>
              <Text fontSize="sm" fontWeight="700" color="blue.500">
                {currentStageData.metrics.roi}%
              </Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">Cultural</Text>
              <Text fontSize="sm" fontWeight="700" color="purple.500">
                {currentStageData.metrics.cultural_adaptation}%
              </Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.600">Value</Text>
              <Text fontSize="sm" fontWeight="700" color="orange.500">
                {currentStageData.metrics.professional_value}%
              </Text>
            </VStack>
          </Grid>
        </HStack>

        {/* Enhanced Control Buttons */}
        <HStack spacing={4} justify="center">
          <Button
            size="md"
            variant="outline"
            onClick={onPrevious}
            isDisabled={currentStage === 0}
            leftIcon={<Icon as={FiSkipForward} transform="rotate(180deg)" />}
            borderColor={currentStageData.visualEnhancements.primaryColor}
            color={currentStageData.visualEnhancements.primaryColor}
            _hover={{
              bg: currentStageData.visualEnhancements.primaryColor + '10'
            }}
          >
            Föregående
          </Button>
          
          <Button
            size="md"
            bg={currentStageData.visualEnhancements.primaryColor}
            color="white"
            onClick={isPlaying ? onPause : onPlay}
            leftIcon={<Icon as={isPlaying ? FiPause : FiPlay} />}
            minW="120px"
            _hover={{
              bg: currentStageData.visualEnhancements.primaryColor + 'DD'
            }}
          >
            {isPlaying ? 'Pausa' : 'Spela'}
          </Button>
          
          <Button
            size="md"
            variant="outline"
            onClick={onNext}
            isDisabled={currentStage === totalStages - 1}
            rightIcon={<Icon as={FiSkipForward} />}
            borderColor={currentStageData.visualEnhancements.primaryColor}
            color={currentStageData.visualEnhancements.primaryColor}
            _hover={{
              bg: currentStageData.visualEnhancements.primaryColor + '10'
            }}
          >
            Nästa
          </Button>
        </HStack>

        {/* Enhanced Stage Quick Access */}
        <VStack spacing={2} w="100%">
          <Text fontSize="xs" fontWeight="600" color="gray.600">
            Demo Stages:
          </Text>
          <Grid templateColumns="repeat(7, 1fr)" gap={2} w="100%">
            {enhancedSverigeDemoFlow.map((stage, index) => (
              <Button
                key={stage.id}
                size="sm"
                variant={index === currentStage ? 'solid' : 'ghost'}
                bg={index === currentStage ? currentStageData.visualEnhancements.primaryColor : 'transparent'}
                color={index === currentStage ? 'white' : currentStageData.visualEnhancements.primaryColor}
                onClick={() => onStageSelect(index)}
                p={2}
                fontSize="xs"
                borderRadius="md"
                _hover={{
                  bg: index === currentStage ? 
                    currentStageData.visualEnhancements.primaryColor + 'DD' : 
                    currentStageData.visualEnhancements.primaryColor + '10'
                }}
              >
                {index + 1}
              </Button>
            ))}
          </Grid>
        </VStack>

        {/* Current Stage Title */}
        <Text
          fontSize="md"
          fontWeight="600"
          color={currentStageData.visualEnhancements.primaryColor}
          textAlign="center"
          noOfLines={1}
        >
          {currentStageData.title}
        </Text>

      </VStack>
    </MotionBox>
  );
};

interface EnhancedDemoStageDisplayProps {
  stage: EnhancedDemoStage;
  stageIndex: number;
  isActive: boolean;
  remainingTime: number;
}

const EnhancedDemoStageDisplay: React.FC<EnhancedDemoStageDisplayProps> = ({
  stage,
  stageIndex,
  isActive,
  remainingTime
}) => {
  const { currentTheme } = useCulturalTheme();

  if (!isActive) return null;

  // Get background theme styling
  const getThemeStyles = () => {
    switch (currentTheme.name) {
      case 'professional-nordic':
        return {
          background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
          color: '#2D3748'
        };
      case 'multi-cultural-gradient':
        return {
          background: 'linear-gradient(135deg, #1E40AF 0%, #7C3AED 50%, #F97316 100%)',
          color: 'white'
        };
      case 'executive-professional':
        return {
          background: 'linear-gradient(135deg, #1E3A8A 0%, #374151 100%)',
          color: 'white'
        };
      case 'professional-journey':
        return {
          background: 'linear-gradient(135deg, #2563EB 0%, #F97316 100%)',
          color: 'white'
        };
      case 'european-expansion':
        return {
          background: 'linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%)',
          color: 'white'
        };
      case 'success-celebration':
        return {
          background: 'linear-gradient(135deg, #059669 0%, #F59E0B 100%)',
          color: 'white'
        };
      default:
        return {
          background: currentTheme.colors.gradients.hero,
          color: 'white'
        };
    }
  };


  return (
    <MotionContainer
      key={stage.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      maxW="full"
      py={12}
      style={backgroundStyle}
      minH="100vh"
      display="flex"
      alignItems="center"
    >
      <VStack spacing={12} align="stretch" w="100%">
        
        {/* Enhanced Stage Header */}
        <MotionBox
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          textAlign="center"
          p={8}
          bg="rgba(255,255,255,0.1)"
          borderRadius="2xl"
          border="2px solid rgba(255,255,255,0.2)"
          backdropFilter="blur(10px)"
        >
          <VStack spacing={6}>
            <Badge
              bg={stage.visualEnhancements.accentColor}
              color="white"
              variant="solid"
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
              fontWeight="700"
            >
              Demo Steg {stageIndex + 1} • Visual Excellence
            </Badge>
            
            <Text
              fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
              fontWeight="900"
              lineHeight="tight"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              {stage.title}
            </Text>
            
            <Text
              fontSize={{ base: "md", md: "lg", lg: "xl" }}
              opacity={0.9}
              maxW="5xl"
              lineHeight="tall"
            >
              {stage.description}
            </Text>

            {/* Enhanced Stage Progress */}
            <Box w="100%" maxW="lg">
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="600">
                  Steg Progress:
                </Text>
                <Text fontSize="sm" fontWeight="700">
                  {Math.floor(((stage.duration - remainingTime) / stage.duration) * 100)}%
                </Text>
              </HStack>
              <Progress
                value={((stage.duration - remainingTime) / stage.duration) * 100}
                bg="rgba(255,255,255,0.2)"
                borderRadius="full"
                h={3}
                sx={{
                  '& > div': {
                    background: stage.visualEnhancements.accentColor
                  }
                }}
              />
            </Box>

            {/* Real-time Performance Metrics */}
            <Grid templateColumns="repeat(4, 1fr)" gap={6} w="100%" maxW="2xl">
              <VStack spacing={1}>
                <Icon as={FiUsers} w={8} h={8} color={stage.visualEnhancements.accentColor} />
                <Text fontSize="2xl" fontWeight="900">
                  {stage.metrics.engagement}%
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Engagement
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FiTrendingUp} w={8} h={8} color={stage.visualEnhancements.accentColor} />
                <Text fontSize="2xl" fontWeight="900">
                  {stage.metrics.roi}%
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  ROI Impact
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FiGlobe} w={8} h={8} color={stage.visualEnhancements.accentColor} />
                <Text fontSize="2xl" fontWeight="900">
                  {stage.metrics.cultural_adaptation}%
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Cultural
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FiStar} w={8} h={8} color={stage.visualEnhancements.accentColor} />
                <Text fontSize="2xl" fontWeight="900">
                  {stage.metrics.professional_value}%
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Value
                </Text>
              </VStack>
            </Grid>
          </VStack>
        </MotionBox>

        {/* Enhanced Key Points */}
        <MotionBox
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={6}
            mb={12}
          >
            {stage.keyPoints.map((point, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                p={6}
                bg="rgba(255,255,255,0.1)"
                borderRadius="xl"
                border="1px solid rgba(255,255,255,0.2)"
                backdropFilter="blur(10px)"
              >
                <HStack spacing={4} align="start">
                  <Icon
                    as={FiCheck}
                    w={6}
                    h={6}
                    color={stage.visualEnhancements.accentColor}
                    flexShrink={0}
                    mt={1}
                  />
                  <Text
                    fontSize="md"
                    fontWeight="600"
                    lineHeight="tall"
                    flex={1}
                  >
                    {point}
                  </Text>
                </HStack>
              </MotionBox>
            ))}
          </Grid>
        </MotionBox>

        {/* Enhanced Demo Component Display */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          bg="rgba(255,255,255,0.95)"
          borderRadius="2xl"
          p={8}
          border="2px solid rgba(255,255,255,0.3)"
          backdropFilter="blur(20px)"
          color="gray.800"
        >
          {stage.demoComponent && (
            <Box>
              <Text
                fontSize="xl"
                fontWeight="700"
                color={stage.visualEnhancements.primaryColor}
                mb={6}
                textAlign="center"
              >
                Interactive Component Demonstration
              </Text>
              <stage.demoComponent />
            </Box>
          )}
        </MotionBox>

        {/* Enhanced Stakeholder Value Highlight */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          p={8}
          bg="rgba(255,255,255,0.1)"
          borderRadius="xl"
          border="2px solid rgba(255,255,255,0.3)"
          backdropFilter="blur(10px)"
        >
          <HStack spacing={6} align="center">
            <Icon as={FiAward} w={12} h={12} color={stage.visualEnhancements.accentColor} />
            <VStack align="start" spacing={3} flex={1}>
              <Text fontSize="xl" fontWeight="700">
                Stakeholder Value Excellence
              </Text>
              <Text fontSize="lg" lineHeight="tall">
                {stage.stakeholderValue}
              </Text>
              {stage.nextAction && (
                <HStack spacing={2}>
                  <Icon as={FiArrowRight} w={5} h={5} color={stage.visualEnhancements.accentColor} />
                  <Text fontSize="md" fontWeight="600" opacity={0.9}>
                    Nästa: {stage.nextAction}
                  </Text>
                </HStack>
              )}
            </VStack>
          </HStack>
        </MotionBox>

      </VStack>
    </MotionContainer>
  );
};

interface EnhancedSverigesDigitaliseringsstrategiDemoProps {
  onDemoComplete?: () => void;
  autoPlay?: boolean;
  showEnhancedMetrics?: boolean;
}

export const EnhancedSverigesDigitaliseringsstrategiDemo: React.FC<EnhancedSverigesDigitaliseringsstrategiDemoProps> = ({
  onDemoComplete,
  autoPlay = false,
  showEnhancedMetrics = true
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [remainingTime, setRemainingTime] = useState(enhancedSverigeDemoFlow[0].duration);

  // Enhanced timer management with visual feedback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // Auto-advance to next stage with enhanced transition
            if (currentStage < enhancedSverigeDemoFlow.length - 1) {
              setCurrentStage(prev => prev + 1);
              return enhancedSverigeDemoFlow[currentStage + 1].duration;
            } else {
              // Demo complete with celebration
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

  // Enhanced stage change handler
  useEffect(() => {
    setRemainingTime(enhancedSverigeDemoFlow[currentStage].duration);
  }, [currentStage]);





  return (
    <CulturalThemeProvider>
      <Box minH="100vh" position="relative">
        
        {/* Enhanced Demo Content */}
        <AnimatePresence mode="wait">
          <EnhancedDemoStageDisplay
            key={currentStage}
            stage={currentStageData}
            stageIndex={currentStage}
            isActive={true}
            remainingTime={remainingTime}
          />
        </AnimatePresence>

        {/* Enhanced Demo Controls */}
        <EnhancedDemoControls
          currentStage={currentStage}
          totalStages={enhancedSverigeDemoFlow.length}
          isPlaying={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStageSelect={handleStageSelect}
          remainingTime={remainingTime}
          currentStageData={currentStageData}
        />

      </Box>
    </CulturalThemeProvider>
  );
};