import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Tooltip,
  Kbd,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay,
  FiPause,
  FiSkipForward,
  FiSkipBack,
  FiUsers,
  FiTrendingUp,
  FiGlobe,
  FiAward,
  FiTarget,
  FiCheck,
  FiDollarSign,
  FiStar,
  FiZap,
  FiBarChart3,
  FiSettings,
  FiMaximize,
  FiMinimize,
  FiMic,
  FiMicOff,
  FiMonitor,
  FiSmartphone
} from 'react-icons/fi';

// Import enhanced components
import { VisualExcellenceWorldHub } from '../WorldHub/VisualExcellenceWorldHub';
import { EnhancedCulturalSwitching } from '../WorldHub/EnhancedCulturalSwitching';
import { ExecutiveMunicipalDashboard } from '../WorldHub/ExecutiveMunicipalDashboard';
import { CulturalThemeProvider, useCulturalTheme } from '../WorldHub/CulturalThemeProvider';

const MotionBox = motion(Box);
const MotionContainer = motion(Container);

// Perfect Demo Stage Definitions with Government Excellence
interface PerfectDemoStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  duration: number;
  speakerNotes: string[];
  keyMetrics: {
    engagement: number;
    roi_impact: number;
    cultural_adaptation: number;
    government_value: number;
  };
  demoComponent: React.ComponentType<Record<string, unknown>>;
  stakeholderFocus: 'executives' | 'hr_directors' | 'technical_leaders' | 'budget_committee' | 'citizen_services';
  governmentValue: string;
  nextAction: string;
  keyboardShortcuts: {
    [key: string]: string;
  };
  presentationTips: string[];
}

const perfectSverigeDemoStages: PerfectDemoStage[] = [
  {
    id: 'government_impact_opening',
    title: 'DigiNativa - Sveriges Municipal Excellence Platform',
    subtitle: 'Revolutionerande kommunal kompetensutveckling för Sveriges Digitaliseringsstrategi',
    description: 'Världsledande AI-driven municipal professional development med europeisk kulturell intelligens',
    duration: 60,
    speakerNotes: [
      'Påbörja med Sveriges Digitaliseringsstrategi vision - digital excellens inom offentlig sektor',
      'Betona proven results: 320% engagement, 18% service improvement, 96% cultural adaptation',
      'Framhäv världsledande position inom municipal training technology',
      'Koppla till government modernization priorities och citizen service excellence'
    ],
    keyMetrics: {
      engagement: 320,
      roi_impact: 180,
      cultural_adaptation: 96,
      government_value: 94
    },
    demoComponent: VisualExcellenceWorldHub,
    stakeholderFocus: 'executives',
    governmentValue: 'Immediate demonstration av Sveriges potential som European municipal innovation leader',
    nextAction: 'Visa World Hub professional excellence system',
    keyboardShortcuts: {
      'Space': 'Play/Pause',
      'ArrowRight': 'Next Stage',
      'ArrowLeft': 'Previous Stage',
      'F': 'Fullscreen'
    },
    presentationTips: [
      'Maintain confident, professional tone befitting government audience',
      'Emphasize Sveriges leadership opportunity inom European municipal innovation',
      'Connect to Digitaliseringsstrategi goals immediately',
      'Demonstrate technical superiority without overwhelming non-technical stakeholders'
    ]
  },
  {
    id: 'professional_excellence_showcase',
    title: 'Municipal Professional Excellence System',
    subtitle: 'Comprehensive 5-World professional development med European cultural intelligence',
    description: 'Visual excellence meets government appropriateness för unmatched professional development',
    duration: 75,
    speakerNotes: [
      'Demonstrate 5-World progression: Emergency Response → Budget → Digital → Stakeholder → Compliance',
      'Visa progressive competency unlocking med realistic municipal scenarios',
      'Betona government-recognized certification pathways och career advancement',
      'Framhäv cultural intelligence integration across alla professional contexts'
    ],
    keyMetrics: {
      engagement: 340,
      roi_impact: 195,
      cultural_adaptation: 98,
      government_value: 96
    },
    demoComponent: VisualExcellenceWorldHub,
    stakeholderFocus: 'hr_directors',
    governmentValue: 'Clear professional development pathway för municipal workforce excellence',
    nextAction: 'Demonstrate cultural intelligence switching',
    keyboardShortcuts: {
      'W': 'Switch between worlds',
      'A': 'Show achievements',
      'P': 'Professional progression',
      'C': 'Cultural context'
    },
    presentationTips: [
      'Focus på career advancement benefits för HR directors',
      'Demonstrate measurable professional development outcomes',
      'Show integration med existing municipal HR systems',
      'Emphasize employee retention och satisfaction benefits'
    ]
  },
  {
    id: 'cultural_intelligence_mastery',
    title: 'Europeisk Kulturell Intelligens Excellence',
    subtitle: 'Real-time cultural adaptation för European municipal cooperation',
    description: 'Unmatched competitive advantage genom advanced cultural intelligence automation',
    duration: 90,
    speakerNotes: [
      'Demonstrate real-time switching mellan Swedish, German, French, Dutch contexts',
      'Visa cultural adaptation inom municipal scenarios och professional communication',
      'Betona competitive advantage - no other platform has this depth av cultural intelligence',
      'Connect to European expansion opportunities och cross-border municipal cooperation'
    ],
    keyMetrics: {
      engagement: 315,
      roi_impact: 225,
      cultural_adaptation: 99,
      government_value: 93
    },
    demoComponent: EnhancedCulturalSwitching,
    stakeholderFocus: 'executives',
    governmentValue: 'European market leadership genom unmatched cultural intelligence capability',
    nextAction: 'Show executive dashboard ROI analysis',
    keyboardShortcuts: {
      '1': 'Swedish context',
      '2': 'German context', 
      '3': 'French context',
      '4': 'Dutch context',
      'S': 'Switch cultures'
    },
    presentationTips: [
      'Demonstrate cultural switching live för immediate impact',
      'Explain competitive moat - cultural intelligence takes years to develop',
      'Connect to European municipal cooperation benefits',
      'Show measurable cultural adaptation accuracy scores'
    ]
  },
  {
    id: 'executive_roi_demonstration',
    title: 'Executive ROI Dashboard Excellence',
    subtitle: 'Strategic decision-making support för municipal leadership',
    description: 'Comprehensive ROI analysis med European expansion investment modeling',
    duration: 70,
    speakerNotes: [
      'Focus på real-time ROI visualization och investment scenario modeling',
      'Demonstrate 18% proven service improvement och 320% engagement increase',
      'Visa European expansion investment calculator med €20M ARR opportunity',
      'Betona strategic planning support för municipal executives'
    ],
    keyMetrics: {
      engagement: 285,
      roi_impact: 240,
      cultural_adaptation: 88,
      government_value: 98
    },
    demoComponent: ExecutiveMunicipalDashboard,
    stakeholderFocus: 'budget_committee',
    governmentValue: 'Clear investment justification med measurable return demonstration',
    nextAction: 'Present European expansion strategy',
    keyboardShortcuts: {
      'R': 'ROI calculator',
      'E': 'European expansion',
      'M': 'Metrics dashboard',
      'B': 'Budget analysis'
    },
    presentationTips: [
      'Lead med concrete ROI numbers - 18% service improvement, 320% engagement',
      'Show investment payback period clearly',
      'Demonstrate scenario modeling capabilities',
      'Connect to budget planning och strategic investment priorities'
    ]
  },
  {
    id: 'european_expansion_opportunity',
    title: 'European Municipal Market Leadership',
    subtitle: 'Sveriges position som innovation leader genom DigiNativa excellence',
    description: '€25M ARR opportunity genom European municipal market expansion',
    duration: 80,
    speakerNotes: [
      'Position Sverige som European municipal innovation leader genom DigiNativa',
      'Visa market opportunity: 1,200+ municipalities across Netherlands, Germany, France',
      'Demonstrate 40% premium pricing justification genom technical och cultural superiority',
      'Connect to Sveriges Digitaliseringsstrategi vision av digital excellens'
    ],
    keyMetrics: {
      engagement: 310,
      roi_impact: 260,
      cultural_adaptation: 95,
      government_value: 96
    },
    demoComponent: ExecutiveMunicipalDashboard,
    stakeholderFocus: 'executives',
    governmentValue: 'Sveriges strategic positioning som European municipal innovation leader',
    nextAction: 'Present implementation roadmap',
    keyboardShortcuts: {
      'N': 'Netherlands market',
      'G': 'German market',
      'F': 'French market',
      'O': 'Opportunity analysis'
    },
    presentationTips: [
      'Frame som Sveriges opportunity att leda European municipal innovation',
      'Show concrete market size och revenue potential',
      'Demonstrate competitive advantages that justify premium pricing',
      'Connect to national digital strategy goals'
    ]
  },
  {
    id: 'implementation_excellence',
    title: 'Sveriges Digitaliseringsstrategi Implementation',
    subtitle: 'Immediate pilot program för municipal excellence demonstration',
    description: 'Q1 2025 pilot launch med comprehensive implementation support',
    duration: 50,
    speakerNotes: [
      'Present clear implementation timeline: Q1 2025 pilot, Q2 expansion, Q3 European launch',
      'Betona comprehensive support: training, integration, performance monitoring',
      'Visa partnership opportunities med SKR och other municipal organizations',
      'End med clear call to action för pilot program participation'
    ],
    keyMetrics: {
      engagement: 330,
      roi_impact: 200,
      cultural_adaptation: 97,
      government_value: 99
    },
    demoComponent: VisualExcellenceWorldHub,
    stakeholderFocus: 'executives',
    governmentValue: 'Clear implementation pathway för immediate municipal excellence achievement',
    nextAction: 'Strategic discussion och pilot program planning',
    keyboardShortcuts: {
      'I': 'Implementation timeline',
      'P': 'Pilot program',
      'S': 'Support framework',
      'Q': 'Q&A mode'
    },
    presentationTips: [
      'Provide concrete next steps och timeline',
      'Emphasize comprehensive implementation support',
      'Show partnership framework för municipal organizations',
      'End med compelling call to action för pilot participation'
    ]
  }
];

// Enhanced Demo Controls with Government Excellence
interface PerfectDemoControlsProps {
  currentStage: number;
  totalStages: number;
  isPlaying: boolean;
  isPaused: boolean;
  isFullscreen: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onStageSelect: (stageIndex: number) => void;
  onToggleFullscreen: () => void;
  remainingTime: number;
  currentStageData: PerfectDemoStage;
  presentationMode: 'live' | 'practice' | 'review';
  onModeChange: (mode: 'live' | 'practice' | 'review') => void;
}

const PerfectDemoControls: React.FC<PerfectDemoControlsProps> = ({
  currentStage,
  totalStages,
  isPlaying,
  isPaused,
  isFullscreen,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onStageSelect,
  onToggleFullscreen,
  remainingTime,
  currentStageData,
  presentationMode,
  onModeChange
}) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      position="fixed"
      bottom={isFullscreen ? 2 : 4}
      left="50%"
      transform="translateX(-50%)"
      bg="rgba(0,0,0,0.9)"
      color="white"
      borderRadius="xl"
      boxShadow="2xl"
      border="1px solid rgba(255,255,255,0.2)"
      p={isFullscreen ? 3 : 6}
      zIndex={1000}
      minW={isFullscreen ? "600px" : "800px"}
      maxW="95vw"
      backdropFilter="blur(10px)"
    >
      <VStack spacing={isFullscreen ? 2 : 4}>
        
        {/* Demo Progress with Government Metrics */}
        <HStack spacing={6} w="100%">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="600" color="white">
              Sverige Demo: {currentStage + 1}/{totalStages}
            </Text>
            <Progress
              value={((currentStage + 1) / totalStages) * 100}
              colorScheme="blue"
              borderRadius="full"
              h={2}
              w="200px"
              bg="rgba(255,255,255,0.2)"
            />
          </VStack>
          
          <VStack align="center" spacing={0}>
            <Text fontSize="xs" color="gray.300">
              Stage Timer
            </Text>
            <Text fontSize="sm" fontWeight="700" color="blue.300">
              {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
            </Text>
          </VStack>

          {/* Real-time Government Metrics */}
          <Grid templateColumns="repeat(4, 1fr)" gap={3} flex={1}>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.300">Engagement</Text>
              <Text fontSize="sm" fontWeight="700" color="green.400">
                {currentStageData.keyMetrics.engagement}%
              </Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.300">ROI</Text>
              <Text fontSize="sm" fontWeight="700" color="blue.400">
                {currentStageData.keyMetrics.roi_impact}%
              </Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.300">Cultural</Text>
              <Text fontSize="sm" fontWeight="700" color="purple.400">
                {currentStageData.keyMetrics.cultural_adaptation}%
              </Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="xs" color="gray.300">Gov Value</Text>
              <Text fontSize="sm" fontWeight="700" color="orange.400">
                {currentStageData.keyMetrics.government_value}%
              </Text>
            </VStack>
          </Grid>

          {/* Presentation Mode Selector */}
          <HStack spacing={2}>
            {(['live', 'practice', 'review'] as const).map((mode) => (
              <Button
                key={mode}
                size="xs"
                variant={presentationMode === mode ? 'solid' : 'ghost'}
                colorScheme={presentationMode === mode ? 'blue' : 'gray'}
                onClick={() => onModeChange(mode)}
                color={presentationMode === mode ? 'white' : 'gray.300'}
              >
                {mode === 'live' ? 'Live' : mode === 'practice' ? 'Practice' : 'Review'}
              </Button>
            ))}
          </HStack>
        </HStack>

        {/* Enhanced Control Buttons */}
        <HStack spacing={4} justify="center" w="100%">
          <Tooltip label="Previous Stage (←)" placement="top">
            <Button
              size={isFullscreen ? "sm" : "md"}
              variant="ghost"
              onClick={onPrevious}
              isDisabled={currentStage === 0}
              leftIcon={<Icon as={FiSkipBack} />}
              color="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Föregående
            </Button>
          </Tooltip>
          
          <Tooltip label="Play/Pause (Space)" placement="top">
            <Button
              size={isFullscreen ? "sm" : "md"}
              colorScheme="blue"
              onClick={isPlaying ? onPause : onPlay}
              leftIcon={<Icon as={isPlaying ? FiPause : FiPlay} />}
              minW="120px"
            >
              {isPlaying ? 'Pausa' : 'Spela'}
            </Button>
          </Tooltip>
          
          <Tooltip label="Next Stage (→)" placement="top">
            <Button
              size={isFullscreen ? "sm" : "md"}
              variant="ghost"
              onClick={onNext}
              isDisabled={currentStage === totalStages - 1}
              rightIcon={<Icon as={FiSkipForward} />}
              color="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              Nästa
            </Button>
          </Tooltip>

          <Tooltip label="Toggle Fullscreen (F)" placement="top">
            <Button
              size={isFullscreen ? "sm" : "md"}
              variant="ghost"
              onClick={onToggleFullscreen}
              leftIcon={<Icon as={isFullscreen ? FiMinimize : FiMaximize} />}
              color="white"
              _hover={{ bg: 'rgba(255,255,255,0.1)' }}
            >
              {isFullscreen ? 'Exit' : 'Full'}
            </Button>
          </Tooltip>
        </HStack>

        {/* Stage Quick Navigation */}
        {!isFullscreen && (
          <VStack spacing={2} w="100%">
            <Text fontSize="xs" color="gray.300">
              Demo Stages:
            </Text>
            <Grid templateColumns="repeat(6, 1fr)" gap={2} w="100%">
              {perfectSverigeDemoStages.map((stage, index) => (
                <Tooltip key={stage.id} label={stage.title} placement="top">
                  <Button
                    size="sm"
                    variant={index === currentStage ? 'solid' : 'ghost'}
                    colorScheme={index === currentStage ? 'blue' : 'gray'}
                    onClick={() => onStageSelect(index)}
                    fontSize="xs"
                    color={index === currentStage ? 'white' : 'gray.300'}
                    _hover={{
                      bg: index === currentStage ? 'blue.600' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {index + 1}
                  </Button>
                </Tooltip>
              ))}
            </Grid>
          </VStack>
        )}

        {/* Current Stage Title */}
        <Text
          fontSize={isFullscreen ? "sm" : "md"}
          fontWeight="600"
          color="white"
          textAlign="center"
          noOfLines={1}
        >
          {currentStageData.title}
        </Text>

      </VStack>
    </MotionBox>
  );
};

// Enhanced Demo Stage Display with Government Excellence
interface PerfectDemoStageDisplayProps {
  stage: PerfectDemoStage;
  stageIndex: number;
  isActive: boolean;
  remainingTime: number;
  presentationMode: 'live' | 'practice' | 'review';
  isFullscreen: boolean;
}

const PerfectDemoStageDisplay: React.FC<PerfectDemoStageDisplayProps> = ({
  stage,
  stageIndex,
  isActive,
  remainingTime,
  presentationMode,
  isFullscreen
}) => {
  const { currentTheme } = useCulturalTheme();

  if (!isActive) return null;

  return (
    <MotionContainer
      key={stage.id}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6 }}
      maxW="full"
      py={isFullscreen ? 4 : 8}
      minH="100vh"
      display="flex"
      alignItems="center"
    >
      <VStack spacing={isFullscreen ? 6 : 12} align="stretch" w="100%">
        
        {/* Enhanced Government Stage Header */}
        <MotionBox
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          textAlign="center"
          p={isFullscreen ? 4 : 8}
          bg="linear-gradient(135deg, #003366 0%, #0066CC 100%)"
          color="white"
          borderRadius="2xl"
          border="2px solid rgba(255,255,255,0.2)"
          position="relative"
          overflow="hidden"
        >
          {/* Swedish Flag Pattern Background */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundImage="linear-gradient(90deg, transparent 35%, #FFCC00 35%, #FFCC00 45%, transparent 45%),
                             linear-gradient(0deg, transparent 35%, #FFCC00 35%, #FFCC00 45%, transparent 45%)"
            opacity={0.1}
          />

          <VStack spacing={isFullscreen ? 3 : 6} position="relative" zIndex={1}>
            <HStack justify="space-between" w="100%">
              <Badge
                bg="rgba(255,255,255,0.2)"
                color="white"
                fontSize={isFullscreen ? "xs" : "sm"}
                px={3}
                py={1}
                borderRadius="full"
                fontWeight="700"
              >
                Sveriges Digitaliseringsstrategi • Steg {stageIndex + 1}
              </Badge>
              
              <HStack spacing={2}>
                <Badge colorScheme="green" variant="solid" fontSize="xs">
                  {stage.stakeholderFocus}
                </Badge>
                <Badge bg="#FFCC00" color="#003366" variant="solid" fontSize="xs">
                  Government Excellence
                </Badge>
              </HStack>
            </HStack>
            
            <Text
              fontSize={isFullscreen ? "xl" : "4xl"}
              fontWeight="900"
              lineHeight="tight"
              textShadow="0 2px 4px rgba(0,0,0,0.3)"
            >
              {stage.title}
            </Text>
            
            <Text
              fontSize={isFullscreen ? "sm" : "xl"}
              fontWeight="600"
              opacity={0.9}
              maxW="4xl"
            >
              {stage.subtitle}
            </Text>

            <Text
              fontSize={isFullscreen ? "xs" : "lg"}
              opacity={0.8}
              maxW="5xl"
              lineHeight="tall"
            >
              {stage.description}
            </Text>

            {/* Government Value Highlight */}
            <Box
              p={4}
              bg="rgba(255,255,255,0.1)"
              borderRadius="lg"
              border="1px solid rgba(255,255,255,0.2)"
              maxW="4xl"
            >
              <HStack spacing={3} justify="center">
                <Icon as={FiAward} w={6} h={6} color="#FFCC00" />
                <Text fontSize={isFullscreen ? "sm" : "md"} fontWeight="600" textAlign="center">
                  {stage.governmentValue}
                </Text>
              </HStack>
            </Box>

            {/* Enhanced Stage Progress */}
            <Box w="100%" maxW="lg">
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="600">
                  Presentation Progress:
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
                    background: '#FFCC00'
                  }
                }}
              />
            </Box>

            {/* Real-time Government Excellence Metrics */}
            <Grid templateColumns="repeat(4, 1fr)" gap={isFullscreen ? 3 : 6} w="100%" maxW="3xl">
              <VStack spacing={1}>
                <Icon as={FiUsers} w={6} h={6} color="#FFCC00" />
                <Text fontSize={isFullscreen ? "lg" : "2xl"} fontWeight="900">
                  {stage.keyMetrics.engagement}%
                </Text>
                <Text fontSize="xs" opacity={0.8}>
                  Engagement
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FiTrendingUp} w={6} h={6} color="#FFCC00" />
                <Text fontSize={isFullscreen ? "lg" : "2xl"} fontWeight="900">
                  {stage.keyMetrics.roi_impact}%
                </Text>
                <Text fontSize="xs" opacity={0.8}>
                  ROI Impact
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FiGlobe} w={6} h={6} color="#FFCC00" />
                <Text fontSize={isFullscreen ? "lg" : "2xl"} fontWeight="900">
                  {stage.keyMetrics.cultural_adaptation}%
                </Text>
                <Text fontSize="xs" opacity={0.8}>
                  Cultural
                </Text>
              </VStack>
              <VStack spacing={1}>
                <Icon as={FiStar} w={6} h={6} color="#FFCC00" />
                <Text fontSize={isFullscreen ? "lg" : "2xl"} fontWeight="900">
                  {stage.keyMetrics.government_value}%
                </Text>
                <Text fontSize="xs" opacity={0.8}>
                  Gov Value
                </Text>
              </VStack>
            </Grid>
          </VStack>
        </MotionBox>

        {/* Enhanced Demo Component Display */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          bg="white"
          borderRadius="2xl"
          p={isFullscreen ? 4 : 8}
          border="2px solid #003366"
          boxShadow="2xl"
        >
          <VStack spacing={4}>
            <HStack justify="space-between" w="100%">
              <Text
                fontSize={isFullscreen ? "md" : "xl"}
                fontWeight="700"
                color="#003366"
              >
                Interactive Government Excellence Demonstration
              </Text>
              <HStack spacing={2}>
                {presentationMode === 'practice' && (
                  <Badge colorScheme="orange" variant="solid">
                    Practice Mode
                  </Badge>
                )}
                {presentationMode === 'review' && (
                  <Badge colorScheme="purple" variant="solid">
                    Review Mode
                  </Badge>
                )}
              </HStack>
            </HStack>
            
            <Box w="100%" minH={isFullscreen ? "300px" : "500px"}>
              <stage.demoComponent />
            </Box>
          </VStack>
        </MotionBox>

        {/* Speaker Notes (Practice Mode Only) */}
        {presentationMode === 'practice' && (
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            bg="orange.50"
            borderRadius="xl"
            p={6}
            border="2px solid orange.200"
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={3}>
                <Icon as={FiMic} w={6} h={6} color="orange.500" />
                <Text fontSize="lg" fontWeight="700" color="orange.700">
                  Speaker Notes - Practice Mode
                </Text>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                {stage.speakerNotes.map((note, index) => (
                  <HStack key={index} spacing={3} align="start">
                    <Badge colorScheme="orange" variant="solid" minW="20px" textAlign="center">
                      {index + 1}
                    </Badge>
                    <Text fontSize="sm" color="orange.700" lineHeight="tall">
                      {note}
                    </Text>
                  </HStack>
                ))}
              </VStack>

              <Box mt={4}>
                <Text fontSize="md" fontWeight="600" color="orange.700" mb={2}>
                  Presentation Tips:
                </Text>
                <Grid templateColumns="1fr" gap={2}>
                  {stage.presentationTips.map((tip, index) => (
                    <HStack key={index} spacing={2}>
                      <Icon as={FiCheck} w={3} h={3} color="orange.500" />
                      <Text fontSize="xs" color="orange.600">
                        {tip}
                      </Text>
                    </HStack>
                  ))}
                </Grid>
              </Box>
            </VStack>
          </MotionBox>
        )}

        {/* Next Action Highlight */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          p={6}
          bg="#003366"
          color="white"
          borderRadius="xl"
          border="2px solid #FFCC00"
        >
          <HStack spacing={6} align="center">
            <Icon as={FiTarget} w={8} h={8} color="#FFCC00" />
            <VStack align="start" spacing={2} flex={1}>
              <Text fontSize="lg" fontWeight="700">
                Nästa Steg i Presentation
              </Text>
              <Text fontSize="md" lineHeight="tall">
                {stage.nextAction}
              </Text>
            </VStack>
          </HStack>
        </MotionBox>

      </VStack>
    </MotionContainer>
  );
};

// Perfect Demo Main Component
interface PerfectSverigesDigitaliseringsstrategiDemoProps {
  onDemoComplete?: () => void;
  autoPlay?: boolean;
  startInFullscreen?: boolean;
  defaultMode?: 'live' | 'practice' | 'review';
}

export const PerfectSverigesDigitaliseringsstrategiDemo: React.FC<PerfectSverigesDigitaliseringsstrategiDemoProps> = ({
  onDemoComplete,
  autoPlay = false,
  startInFullscreen = false,
  defaultMode = 'live'
}) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(startInFullscreen);
  const [presentationMode, setPresentationMode] = useState<'live' | 'practice' | 'review'>(defaultMode);
  const [remainingTime, setRemainingTime] = useState(perfectSverigeDemoStages[0].duration);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          isPlaying ? handlePause() : handlePlay();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'KeyF':
          event.preventDefault();
          setIsFullscreen(!isFullscreen);
          break;
        case 'KeyP':
          event.preventDefault();
          setPresentationMode(presentationMode === 'practice' ? 'live' : 'practice');
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isFullscreen, presentationMode]);

  // Enhanced timer management
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && !isPaused && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            if (currentStage < perfectSverigeDemoStages.length - 1) {
              setCurrentStage(prev => prev + 1);
              return perfectSverigeDemoStages[currentStage + 1].duration;
            } else {
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
  }, [isPlaying, isPaused, remainingTime, currentStage, onDemoComplete]);

  useEffect(() => {
    setRemainingTime(perfectSverigeDemoStages[currentStage].duration);
  }, [currentStage]);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStage < perfectSverigeDemoStages.length - 1) {
      setCurrentStage(prev => prev + 1);
    }
  }, [currentStage]);

  const handlePrevious = useCallback(() => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  }, [currentStage]);

  const handleStageSelect = useCallback((stageIndex: number) => {
    setCurrentStage(stageIndex);
    setRemainingTime(perfectSverigeDemoStages[stageIndex].duration);
  }, []);

  const currentStageData = perfectSverigeDemoStages[currentStage];

  return (
    <CulturalThemeProvider>
      <Box
        minH="100vh"
        bg={isFullscreen ? "black" : "gray.50"}
        position="relative"
        overflow={isFullscreen ? "hidden" : "auto"}
      >
        
        {/* Perfect Demo Content */}
        <AnimatePresence mode="wait">
          <PerfectDemoStageDisplay
            key={currentStage}
            stage={currentStageData}
            stageIndex={currentStage}
            isActive={true}
            remainingTime={remainingTime}
            presentationMode={presentationMode}
            isFullscreen={isFullscreen}
          />
        </AnimatePresence>

        {/* Perfect Demo Controls */}
        <PerfectDemoControls
          currentStage={currentStage}
          totalStages={perfectSverigeDemoStages.length}
          isPlaying={isPlaying}
          isPaused={isPaused}
          isFullscreen={isFullscreen}
          onPlay={handlePlay}
          onPause={handlePause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStageSelect={handleStageSelect}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          remainingTime={remainingTime}
          currentStageData={currentStageData}
          presentationMode={presentationMode}
          onModeChange={setPresentationMode}
        />

      </Box>
    </CulturalThemeProvider>
  );
};