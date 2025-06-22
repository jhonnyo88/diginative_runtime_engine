import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Icon,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  Divider,
  Grid,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
  Kbd
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlay,
  FiPause,
  FiSettings,
  FiUsers,
  FiMessageSquare,
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiShare2,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEdit3,
  FiSend,
  FiHeart,
  FiThumbsUp,
  FiThumbsDown,
  FiStar,
  FiTarget,
  FiZap,
  FiFlag,
  FiGlobe,
  FiClock,
  FiBarChart3,
  FiTrendingUp,
  FiCheck,
  FiX,
  FiAlertCircle
} from 'react-icons/fi';

import { useCulturalTheme } from '../WorldHub/CulturalThemeProvider';


// Interactive Demo Element Types
interface InteractiveElement {
  id: string;
  type: 'live_poll' | 'q_and_a' | 'scenario_builder' | 'real_time_customization' | 'feedback_collector' | 'cultural_adapter';
  title: string;
  swedishTitle: string;
  description: string;
  governmentRelevance: string;
  engagementLevel: number; // 0-100
  swedishCulturalAlignment: number; // 0-100
  implementationComplexity: 'low' | 'medium' | 'high';
  stakeholderTypes: string[];
  lagomPrinciples: string[];
  interactionDuration: number; // seconds
  expectedOutcome: string;
}

interface DemoSession {
  id: string;
  stakeholders: GovernmentStakeholder[];
  activeElements: string[];
  sessionDuration: number;
  culturalContext: 'stockholm' | 'goteborg' | 'malmo' | 'regional';
  engagementMetrics: {
    participation: number;
    satisfaction: number;
    understanding: number;
    conviction: number;
  };
}

interface GovernmentStakeholder {
  id: string;
  name: string;
  role: string;
  department: string;
  engagementStyle: 'analytical' | 'collaborative' | 'directive' | 'observational';
  culturalPreferences: {
    lagom: number;
    consensus: number;
    formality: number;
    detail: number;
  };
}

// Comprehensive Interactive Demo Elements
const interactiveElements: InteractiveElement[] = [
  {
    id: 'live_government_poll',
    type: 'live_poll',
    title: 'Live Government Stakeholder Polling',
    swedishTitle: 'Live regering intressent omröstning',
    description: 'Real-time polling system för government stakeholders med instant results och Swedish consensus building integration',
    governmentRelevance: 'Enables immediate stakeholder feedback och consensus assessment during demo presentation',
    engagementLevel: 92,
    swedishCulturalAlignment: 88,
    implementationComplexity: 'medium',
    stakeholderTypes: ['Kommunstyrelseordförande', 'IT-chef', 'HR-chef', 'Ekonomichef', 'Förvaltningschef'],
    lagomPrinciples: [
      'Balanced participation - not overwhelming, not superficial',
      'Inclusive polling ensuring all voices heard',
      'Moderate questioning avoiding extremes',
      'Transparent results building consensus'
    ],
    interactionDuration: 45,
    expectedOutcome: 'Immediate stakeholder consensus measurement och engagement validation för demo effectiveness'
  },
  {
    id: 'government_qa_session',
    type: 'q_and_a',
    title: 'Government Q&A Session Manager',
    swedishTitle: 'Regering fråga och svar session hanterare',
    description: 'Structured Q&A management system med Swedish cultural intelligence för government stakeholder questions',
    governmentRelevance: 'Facilitates systematic question handling med cultural sensitivity för government decision-making process',
    engagementLevel: 95,
    swedishCulturalAlignment: 94,
    implementationComplexity: 'high',
    stakeholderTypes: ['All government stakeholders', 'External observers', 'Technical experts'],
    lagomPrinciples: [
      'Comprehensive question coverage without overwhelming detail',
      'Patient discussion allowing thoughtful responses',
      'Balanced information sharing - transparent but focused',
      'Inclusive Q&A ensuring all stakeholders can participate'
    ],
    interactionDuration: 120,
    expectedOutcome: 'Thorough stakeholder understanding och concern resolution för informed decision-making'
  },
  {
    id: 'municipal_scenario_builder',
    type: 'scenario_builder',
    title: 'Municipal Scenario Builder',
    swedishTitle: 'Kommunal scenario byggare',
    description: 'Interactive tool för building custom municipal scenarios relevant to stakeholder contexts med Swedish governance integration',
    governmentRelevance: 'Demonstrates platform adaptability to specific municipal needs och governance contexts',
    engagementLevel: 89,
    swedishCulturalAlignment: 91,
    implementationComplexity: 'high',
    stakeholderTypes: ['Kommunstyrelseordförande', 'Förvaltningschefer', 'Verksamhetsansvariga'],
    lagomPrinciples: [
      'Realistic scenario complexity - detailed but achievable',
      'Collaborative scenario building involving stakeholder input',
      'Balanced municipal context representation',
      'Sustainable scenario solutions för long-term success'
    ],
    interactionDuration: 180,
    expectedOutcome: 'Customized demonstration av platform relevance för specific municipal context'
  },
  {
    id: 'real_time_cultural_customization',
    type: 'real_time_customization',
    title: 'Real-Time Cultural Customization',
    swedishTitle: 'Realtid kulturell anpassning',
    description: 'Live demonstration av cultural adaptation capabilities med immediate Swedish context switching',
    governmentRelevance: 'Shows platform cultural intelligence och adaptability för diverse Swedish municipal contexts',
    engagementLevel: 87,
    swedishCulturalAlignment: 96,
    implementationComplexity: 'medium',
    stakeholderTypes: ['Cultural experts', 'Regional representatives', 'Municipal leaders'],
    lagomPrinciples: [
      'Authentic cultural representation without stereotyping',
      'Balanced cultural adaptation - respectful och accurate',
      'Inclusive cultural switching supporting regional diversity',
      'Sustainable cultural intelligence för long-term authenticity'
    ],
    interactionDuration: 90,
    expectedOutcome: 'Demonstrated cultural intelligence superiority för government stakeholder confidence'
  },
  {
    id: 'stakeholder_feedback_collector',
    type: 'feedback_collector',
    title: 'Government Stakeholder Feedback Collector',
    swedishTitle: 'Regering intressent feedback insamlare',
    description: 'Comprehensive feedback collection system med Swedish cultural sensitivity för government stakeholder input',
    governmentRelevance: 'Captures detailed stakeholder feedback för demo effectiveness assessment och follow-up planning',
    engagementLevel: 78,
    swedishCulturalAlignment: 85,
    implementationComplexity: 'low',
    stakeholderTypes: ['All stakeholder types', 'Decision makers', 'Technical evaluators'],
    lagomPrinciples: [
      'Comprehensive feedback without overwhelming stakeholders',
      'Anonymous options supporting honest input',
      'Balanced feedback categories covering all concerns',
      'Respectful feedback collection maintaining dignity'
    ],
    interactionDuration: 60,
    expectedOutcome: 'Detailed stakeholder feedback för demo optimization och relationship development'
  },
  {
    id: 'cultural_context_adapter',
    type: 'cultural_adapter',
    title: 'Swedish Cultural Context Adapter',
    swedishTitle: 'Svensk kulturell kontext anpassare',
    description: 'Advanced cultural context adaptation system för real-time Swedish municipal culture alignment',
    governmentRelevance: 'Demonstrates deep understanding av Swedish governance culture för authentic stakeholder engagement',
    engagementLevel: 93,
    swedishCulturalAlignment: 98,
    implementationComplexity: 'high',
    stakeholderTypes: ['Cultural advisors', 'Municipal experts', 'Government representatives'],
    lagomPrinciples: [
      'Perfect cultural balance - authentic without exaggeration',
      'Inclusive cultural representation across Swedish regions',
      'Respectful cultural adaptation maintaining dignity',
      'Sustainable cultural intelligence för ongoing authenticity'
    ],
    interactionDuration: 75,
    expectedOutcome: 'Verified Swedish cultural authenticity för maximum government stakeholder confidence'
  }
];

// Interactive Element Component
interface InteractiveElementCardProps {
  element: InteractiveElement;
  isActive?: boolean;
  onActivate?: (elementId: string) => void;
  onDeactivate?: (elementId: string) => void;
}

const InteractiveElementCard: React.FC<InteractiveElementCardProps> = ({
  element,
  isActive = false,
  onActivate = () => {},
  onDeactivate = () => {}
}) => {




  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      bg={isActive ? 'blue.50' : 'white'}
      borderColor={isActive ? swedishBlue : 'gray.200'}
      borderWidth="2px"
      boxShadow={isActive ? `0 8px 25px ${swedishBlue}30` : 'md'}
      _hover={{ boxShadow: `0 12px 35px ${swedishBlue}40` }}
      transition="all 0.3s ease"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          
          {/* Element Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <HStack spacing={2}>
                <Icon as={TypeIcon} w={5} h={5} color={swedishBlue} />
                <Text fontSize="md" fontWeight="700" color={swedishBlue}>
                  {element.title}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" fontStyle="italic">
                {element.swedishTitle}
              </Text>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Badge 
                colorScheme={getComplexityColor(element.implementationComplexity)}
                variant="solid"
              >
                {element.implementationComplexity}
              </Badge>
              <HStack spacing={1}>
                <Icon as={FiClock} w={3} h={3} color="gray.500" />
                <Text fontSize="xs" color="gray.500">
                  {Math.floor(element.interactionDuration / 60)}:{(element.interactionDuration % 60).toString().padStart(2, '0')}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Description */}
          <Text fontSize="sm" color="gray.700" lineHeight="tall">
            {element.description}
          </Text>

          {/* Government Relevance */}
          <Box p={3} bg="blue.50" borderRadius="md" border="1px solid blue.200">
            <Text fontSize="sm" fontWeight="600" color="blue.700" mb={1}>
              Government Relevance:
            </Text>
            <Text fontSize="xs" color="blue.700" lineHeight="tall">
              {element.governmentRelevance}
            </Text>
          </Box>

          {/* Engagement Metrics */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <VStack spacing={2}>
              <Text fontSize="xs" color="gray.600">Engagement Level</Text>
              <CircularProgress
                value={element.engagementLevel}
                size="50px"
                thickness="8px"
                color="green.500"
              >
                <CircularProgressLabel fontSize="xs" fontWeight="600">
                  {element.engagementLevel}%
                </CircularProgressLabel>
              </CircularProgress>
            </VStack>
            
            <VStack spacing={2}>
              <Text fontSize="xs" color="gray.600">Swedish Cultural Alignment</Text>
              <CircularProgress
                value={element.swedishCulturalAlignment}
                size="50px"
                thickness="8px"
                color="blue.500"
              >
                <CircularProgressLabel fontSize="xs" fontWeight="600">
                  {element.swedishCulturalAlignment}%
                </CircularProgressLabel>
              </CircularProgress>
            </VStack>
          </Grid>

          {/* Lagom Principles Preview */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color={swedishBlue} mb={2}>
              Lagom Principles:
            </Text>
            <VStack spacing={1} align="stretch">
              {element.lagomPrinciples.slice(0, 2).map((principle, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiCheck} w={3} h={3} color="green.500" />
                  <Text fontSize="xs" color="gray.700" noOfLines={1}>
                    {principle}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Expected Outcome */}
          <Box p={3} bg={swedishYellow + '20'} borderRadius="md" border="1px solid" borderColor={swedishYellow + '40'}>
            <Text fontSize="sm" fontWeight="600" color={swedishBlue} mb={1}>
              Expected Outcome:
            </Text>
            <Text fontSize="xs" color={swedishBlue} lineHeight="tall">
              {element.expectedOutcome}
            </Text>
          </Box>

          {/* Activation Controls */}
          <HStack spacing={3}>
            <Button
              size="sm"
              colorScheme={isActive ? "red" : "blue"}
              variant={isActive ? "solid" : "outline"}
              onClick={() => isActive ? onDeactivate(element.id) : onActivate(element.id)}
              leftIcon={<Icon as={isActive ? FiPause : FiPlay} />}
              flex={1}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            
            <Tooltip label="View detailed configuration">
              <Button
                size="sm"
                variant="ghost"
                colorScheme="blue"
                leftIcon={<Icon as={FiSettings} />}
              >
                Configure
              </Button>
            </Tooltip>
          </HStack>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Live Demo Session Monitor
interface DemoSessionMonitorProps {
  session: DemoSession;
  activeElements: Set<string>;
}

const DemoSessionMonitor: React.FC<DemoSessionMonitorProps> = ({ session, activeElements }) => {

  const averageEngagement = Math.round(
    (session.engagementMetrics.participation + 
     session.engagementMetrics.satisfaction + 
     session.engagementMetrics.understanding + 
     session.engagementMetrics.conviction) / 4
  );

  return (
    <Card bg="green.50" borderColor="green.200" borderWidth="2px">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={FiTrendingUp} w={6} h={6} color="green.500" />
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="700" color="green.700">
                  Live Demo Session Monitor
                </Text>
                <Text fontSize="md" color="gray.600">
                  Real-time government stakeholder engagement tracking
                </Text>
              </VStack>
            </HStack>
            
            <VStack align="end" spacing={1}>
              <Badge colorScheme="green" variant="solid" p={2} borderRadius="lg">
                {session.culturalContext} Context
              </Badge>
              <Text fontSize="xs" color="gray.600">
                {activeElements.size} Active Elements
              </Text>
            </VStack>
          </HStack>

          {/* Overall Engagement Score */}
          <Box
            p={4}
            bg={`linear-gradient(135deg, ${swedishBlue} 0%, ${swedishBlue} 100%)`}
            color="white"
            borderRadius="lg"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundImage={`linear-gradient(90deg, transparent 35%, ${swedishYellow} 35%, ${swedishYellow} 45%, transparent 45%),
                               linear-gradient(0deg, transparent 35%, ${swedishYellow} 35%, ${swedishYellow} 45%, transparent 45%)`}
              opacity={0.2}
            />
            
            <HStack justify="space-between" position="relative" zIndex={1}>
              <VStack align="start" spacing={1}>
                <Text fontSize="md" fontWeight="600">
                  Overall Government Engagement:
                </Text>
                <Text fontSize="sm" opacity={0.9}>
                  Swedish stakeholder satisfaction tracking
                </Text>
              </VStack>
              
              <VStack align="end" spacing={1}>
                <Text fontSize="3xl" fontWeight="900" color={swedishYellow}>
                  {overallEngagement}%
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Live Score
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Detailed Engagement Metrics */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color="green.700">
                  Participation:
                </Text>
                <Text fontSize="sm" fontWeight="700" color="green.500">
                  {session.engagementMetrics.participation}%
                </Text>
              </HStack>
              <Progress
                value={session.engagementMetrics.participation}
                colorScheme="green"
                size="md"
                borderRadius="full"
              />
            </VStack>

            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color="blue.700">
                  Satisfaction:
                </Text>
                <Text fontSize="sm" fontWeight="700" color="blue.500">
                  {session.engagementMetrics.satisfaction}%
                </Text>
              </HStack>
              <Progress
                value={session.engagementMetrics.satisfaction}
                colorScheme="blue"
                size="md"
                borderRadius="full"
              />
            </VStack>

            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color="purple.700">
                  Understanding:
                </Text>
                <Text fontSize="sm" fontWeight="700" color="purple.500">
                  {session.engagementMetrics.understanding}%
                </Text>
              </HStack>
              <Progress
                value={session.engagementMetrics.understanding}
                colorScheme="purple"
                size="md"
                borderRadius="full"
              />
            </VStack>

            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color="orange.700">
                  Conviction:
                </Text>
                <Text fontSize="sm" fontWeight="700" color="orange.500">
                  {session.engagementMetrics.conviction}%
                </Text>
              </HStack>
              <Progress
                value={session.engagementMetrics.conviction}
                colorScheme="orange"
                size="md"
                borderRadius="full"
              />
            </VStack>

          </Grid>

          {/* Active Stakeholders */}
          <VStack spacing={3} align="stretch">
            <Text fontSize="md" fontWeight="600" color="green.700">
              Active Government Stakeholders:
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={3}>
              {session.stakeholders.map((stakeholder) => (
                <HStack key={stakeholder.id} spacing={3}>
                  <Icon as={FiUsers} w={4} h={4} color="green.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="600" color="green.700">
                      {stakeholder.name}
                    </Text>
                    <Text fontSize="xs" color="green.600">
                      {stakeholder.role} | {stakeholder.department}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </Grid>
          </VStack>

          {/* Session Status */}
          <Alert status="success" bg="green.100" borderColor="green.300">
            <AlertIcon color="green.500" />
            <Box>
              <AlertTitle color="green.700">Demo Session Active!</AlertTitle>
              <AlertDescription color="green.700">
                Government stakeholder engagement is optimal. Continue med current interactive elements för maximum impact.
              </AlertDescription>
            </Box>
          </Alert>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Quick Action Panel för Demo Control
const DemoQuickActionsPanel: React.FC = () => {

  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  return (
    <Card bg="gray.50" borderColor="gray.200">
      <CardBody p={4}>
        <VStack spacing={4} align="stretch">
          
          <Text fontSize="md" fontWeight="600" color={swedishBlue}>
            Demo Quick Actions:
          </Text>

          <Grid templateColumns="repeat(4, 1fr)" gap={3}>
            
            <Tooltip label="Toggle recording (R)">
              <Button
                size="sm"
                colorScheme={isRecording ? "red" : "gray"}
                variant={isRecording ? "solid" : "outline"}
                onClick={() => setIsRecording(!isRecording)}
                leftIcon={<Icon as={FiVideo} />}
              >
                {isRecording ? 'Stop' : 'Record'}
              </Button>
            </Tooltip>

            <Tooltip label="Toggle mute (M)">
              <Button
                size="sm"
                colorScheme={isMuted ? "red" : "gray"}
                variant={isMuted ? "solid" : "outline"}
                onClick={() => setIsMuted(!isMuted)}
                leftIcon={<Icon as={isMuted ? FiMicOff : FiMic} />}
              >
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
            </Tooltip>

            <Tooltip label="Share screen (S)">
              <Button
                size="sm"
                colorScheme={isScreenSharing ? "blue" : "gray"}
                variant={isScreenSharing ? "solid" : "outline"}
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                leftIcon={<Icon as={FiShare2} />}
              >
                Share
              </Button>
            </Tooltip>

            <Tooltip label="Download session (D)">
              <Button
                size="sm"
                colorScheme="green"
                variant="outline"
                leftIcon={<Icon as={FiDownload} />}
              >
                Export
              </Button>
            </Tooltip>

          </Grid>

          <Divider />

          <Text fontSize="sm" color="gray.600">
            Keyboard shortcuts: <Kbd>R</Kbd> Record, <Kbd>M</Kbd> Mute, <Kbd>S</Kbd> Share, <Kbd>D</Kbd> Download
          </Text>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Main Interactive Demo Elements Component
interface InteractiveDemoElementsProps {
  onElementActivated?: (elementId: string) => void;
  onElementDeactivated?: (elementId: string) => void;
  onSessionUpdate?: (metrics: Record<string, unknown>) => void;
}

export const InteractiveDemoElements: React.FC<InteractiveDemoElementsProps> = ({
  onElementActivated = () => console.log('Interactive element activated'),
  onElementDeactivated = () => console.log('Interactive element deactivated'),
  onSessionUpdate = () => console.log('Demo session updated')
}) => {

  const [activeElements, setActiveElements] = useState<Set<string>>(new Set());
  const [demoSession] = useState<DemoSession>({
    id: 'gov_demo_session_001',
    stakeholders: [
      {
        id: 'anna_svensson',
        name: 'Anna Svensson',
        role: 'Kommunstyrelseordförande',
        department: 'Kommunstyrelsen',
        engagementStyle: 'collaborative',
        culturalPreferences: { lagom: 95, consensus: 92, formality: 75, detail: 80 }
      },
      {
        id: 'lars_olsson',
        name: 'Lars Olsson',
        role: 'IT-chef',
        department: 'IT-förvaltningen',
        engagementStyle: 'analytical',
        culturalPreferences: { lagom: 85, consensus: 75, formality: 65, detail: 95 }
      },
      {
        id: 'maria_bergström',
        name: 'Maria Bergström',
        role: 'HR-chef',
        department: 'HR-förvaltningen',
        engagementStyle: 'collaborative',
        culturalPreferences: { lagom: 90, consensus: 88, formality: 70, detail: 75 }
      }
    ],
    activeElements: [],
    sessionDuration: 0,
    culturalContext: 'stockholm',
    engagementMetrics: {
      participation: 87,
      satisfaction: 91,
      understanding: 84,
      conviction: 89
    }
  });

  const { isOpen, onOpen, onClose } = useDisclosure();




  return (
    <VStack spacing={8} align="stretch">
      
      {/* Interactive Demo Elements Header */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card 
          bg={`linear-gradient(135deg, ${swedishBlue} 0%, ${swedishBlue} 100%)`}
          color="white"
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
            backgroundImage={`linear-gradient(90deg, transparent 35%, ${swedishYellow} 35%, ${swedishYellow} 45%, transparent 45%),
                             linear-gradient(0deg, transparent 35%, ${swedishYellow} 35%, ${swedishYellow} 45%, transparent 45%)`}
            opacity={0.2}
          />
          
          <CardBody p={6} position="relative" zIndex={1}>
            <VStack spacing={6} align="stretch">
              
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiZap} w={8} h={8} color={swedishYellow} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800">
                      Interactive Demo Elements Excellence
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      Government engagement optimization through Swedish cultural intelligence
                    </Text>
                  </VStack>
                </HStack>
                
                <VStack align="end" spacing={1}>
                  <Badge bg={swedishYellow} color={swedishBlue} p={2} borderRadius="lg" fontSize="sm">
                    🇸🇪 Government Interactive Excellence
                  </Badge>
                  <Text fontSize="xs" opacity={0.8}>
                    Real-time Stakeholder Engagement
                  </Text>
                </VStack>
              </HStack>

              {/* Demo Activity Metrics */}
              <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color={swedishYellow}>
                    {activeElements.size}
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Active Elements
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="green.300">
                    {Math.round(activationPercentage)}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Demo Activation
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="blue.300">
                    {demoSession.stakeholders.length}
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Gov Stakeholders
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="orange.300">
                    {Math.round(demoSession.engagementMetrics.conviction)}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Stakeholder Conviction
                  </Text>
                </VStack>
              </Grid>

              {/* Demo Session Controls */}
              <HStack justify="center" spacing={4}>
                <Button
                  size="lg"
                  colorScheme="green"
                  leftIcon={<Icon as={FiPlay} />}
                  bg="green.500"
                  color="white"
                  _hover={{ bg: "green.600" }}
                >
                  Start Interactive Demo
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  borderColor={swedishYellow}
                  color={swedishYellow}
                  _hover={{ bg: swedishYellow, color: swedishBlue }}
                  leftIcon={<Icon as={FiEye} />}
                  onClick={onOpen}
                >
                  Monitor Session
                </Button>
              </HStack>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Demo Session Monitor */}
      <DemoSessionMonitor session={demoSession} activeElements={activeElements} />

      {/* Quick Actions Panel */}
      <DemoQuickActionsPanel />

      {/* Interactive Elements Grid */}
      <Box>
        <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
          Interactive Demo Elements Portfolio:
        </Text>
        
        <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
          {interactiveElements.map((element) => (
            <InteractiveElementCard
              key={element.id}
              element={element}
              isActive={activeElements.has(element.id)}
              onActivate={handleElementActivation}
              onDeactivate={handleElementDeactivation}
            />
          ))}
        </Grid>
      </Box>

      {/* Session Monitor Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="white" borderRadius="xl" maxH="90vh" overflowY="auto">
          <ModalHeader bg="blue.50">
            <Text fontSize="xl" fontWeight="700" color={swedishBlue}>
              Live Demo Session Monitoring Dashboard
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <DemoSessionMonitor session={demoSession} activeElements={activeElements} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Swedish Government Excellence Summary */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card bg="green.50" borderColor="green.200" borderWidth="2px">
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              
              <HStack spacing={3}>
                <Icon as={FiStar} w={6} h={6} color="green.500" />
                <Text fontSize="lg" fontWeight="700" color="green.700">
                  Interactive Government Engagement Excellence Achievement
                </Text>
              </HStack>

              <Text fontSize="sm" color="green.700" lineHeight="tall">
                Interactive demo elements optimize government stakeholder engagement through Swedish 
                cultural intelligence med lagom-balanced interaction design. Real-time engagement 
                monitoring, culturally adapted Q&A sessions, live polling med consensus building, 
                och custom scenario builders create compelling demonstration experience för informed 
                government decision-making.
              </Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="green.500">
                    Interactive
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Real-time Engagement
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    Cultural
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Swedish Intelligence
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="orange.500">
                    Government
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Decision Support
                  </Text>
                </VStack>
              </Grid>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

    </VStack>
  );
};