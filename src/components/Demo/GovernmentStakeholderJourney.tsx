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
  Progress,
  useColorModeValue,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepIcon,
  StepNumber,
  StepTitle,
  StepDescription,
  StepSeparator,
  useSteps,
  Grid,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiUsers,
  FiTarget,
  FiEye,
  FiThumbsUp,
  FiCheckCircle,
  FiClock,
  FiStar,
  FiTrendingUp,
  FiShield,
  FiGlobe,
  FiAward,
  FiNavigation,
  FiCompass,
  FiFlag,
  FiHeart,
  FiZap,
  FiBookOpen,
  FiSettings
} from 'react-icons/fi';

import { useCulturalTheme } from '../WorldHub/CulturalThemeProvider';


// Swedish Government Stakeholder Types
interface SwedishGovernmentStakeholder {
  id: string;
  role: string;
  swedishTitle: string;
  department: string;
  decisionLevel: 'operational' | 'tactical' | 'strategic' | 'executive';
  primaryConcerns: string[];
  successMetrics: string[];
  communicationStyle: 'analytical' | 'collaborative' | 'directive' | 'diplomatic';
  culturalContext: {
    lagomPreference: number; // 0-100
    consensusNeed: number; // 0-100
    transparencyExpectation: number; // 0-100
    formalityLevel: number; // 0-100
  };
  journeyStages: StakeholderJourneyStage[];
  expectedOutcome: string;
  followUpRequirements: string[];
}

interface StakeholderJourneyStage {
  id: string;
  stageName: string;
  swedishName: string;
  duration: number; // minutes
  objectives: string[];
  stakeholderExperience: string;
  culturalAdaptation: string;
  interactionType: 'presentation' | 'demonstration' | 'discussion' | 'validation' | 'decision';
  lagomApproach: string;
  expectedReaction: string;
  successCriteria: string[];
  riskMitigation: string;
}

// Comprehensive Swedish Government Stakeholder Definitions
const swedishGovernmentStakeholders: SwedishGovernmentStakeholder[] = [
  {
    id: 'kommunstyrelseordforande',
    role: 'Municipal Board Chairperson',
    swedishTitle: 'Kommunstyrelseordförande',
    department: 'Kommunstyrelsen',
    decisionLevel: 'executive',
    primaryConcerns: [
      'Municipal budget impact och financial sustainability',
      'Citizen service quality improvement',
      'Political implications och stakeholder consensus',
      'Long-term strategic alignment med municipal goals',
      'Democratic participation och transparency'
    ],
    successMetrics: [
      'Clear ROI demonstration med specific cost-benefit analysis',
      'Citizen satisfaction improvement metrics',
      'Political stakeholder support consensus',
      'Implementation timeline feasibility',
      'Risk assessment och mitigation strategies'
    ],
    communicationStyle: 'collaborative',
    culturalContext: {
      lagomPreference: 95,
      consensusNeed: 92,
      transparencyExpectation: 88,
      formalityLevel: 75
    },
    journeyStages: [
      {
        id: 'executive_introduction',
        stageName: 'Executive Introduction & Context Setting',
        swedishName: 'Verkställande introduktion och kontextsättning',
        duration: 15,
        objectives: [
          'Establish credibility och professional competence',
          'Align med municipal strategic priorities',
          'Demonstrate understanding av Swedish governance culture'
        ],
        stakeholderExperience: 'Professional, respectful approach that acknowledges executive responsibility och decision-making authority',
        culturalAdaptation: 'Swedish executive courtesy - formal but warm, showing respect för position while building personal connection',
        interactionType: 'presentation',
        lagomApproach: 'Balanced introduction - thorough but concise, confident but not overwhelming',
        expectedReaction: 'Recognition av professional competence och cultural understanding',
        successCriteria: [
          'Executive engagement och active listening',
          'Questions about strategic alignment',
          'Appreciation för cultural sensitivity'
        ],
        riskMitigation: 'Prepare för budget concerns by having clear financial benefit summary ready'
      },
      {
        id: 'strategic_value_demonstration',
        stageName: 'Strategic Value Demonstration',
        swedishName: 'Strategisk värdedemonstration',
        duration: 25,
        objectives: [
          'Show clear alignment med Sveriges Digitaliseringsstrategi',
          'Demonstrate municipal service improvement potential',
          'Present compelling ROI och cost-benefit analysis'
        ],
        stakeholderExperience: 'Data-driven presentation med concrete examples relevant to their municipality',
        culturalAdaptation: 'Swedish preference för evidence-based decision making med collaborative discussion',
        interactionType: 'demonstration',
        lagomApproach: 'Comprehensive but focused presentation - enough detail för informed decision without overwhelming',
        expectedReaction: 'Interest in specific implementation details och budget implications',
        successCriteria: [
          'Detailed questions about implementation',
          'Discussion av specific municipal applications',
          'Request för additional financial analysis'
        ],
        riskMitigation: 'Have backup scenarios för different budget levels och implementation timelines'
      },
      {
        id: 'consensus_building_discussion',
        stageName: 'Consensus Building Discussion',
        swedishName: 'Konsensusbyggande diskussion',
        duration: 20,
        objectives: [
          'Address stakeholder concerns thoroughly',
          'Build consensus around implementation approach',
          'Establish implementation timeline och milestones'
        ],
        stakeholderExperience: 'Collaborative discussion where their concerns are heard och addressed systematically',
        culturalAdaptation: 'Swedish consensus-building process - ensuring all voices heard before moving forward',
        interactionType: 'discussion',
        lagomApproach: 'Patient, thorough discussion that builds genuine agreement rather than rushing to decision',
        expectedReaction: 'Appreciation för inclusive approach och willingness to address concerns',
        successCriteria: [
          'Clear articulation av remaining concerns',
          'Agreement on next steps och timeline',
          'Commitment to stakeholder consultation process'
        ],
        riskMitigation: 'Prepare för extended discussion - Swedish consensus building takes time but creates strong buy-in'
      }
    ],
    expectedOutcome: 'Executive sponsorship för pilot implementation med clear budget allocation och timeline',
    followUpRequirements: [
      'Detailed implementation plan med timeline och budget',
      'Stakeholder communication strategy',
      'Risk assessment och mitigation plan',
      'Performance measurement framework'
    ]
  },
  {
    id: 'it_chef',
    role: 'IT Director',
    swedishTitle: 'IT-chef',
    department: 'IT-förvaltningen',
    decisionLevel: 'tactical',
    primaryConcerns: [
      'Technical integration med existing systems',
      'Security och data protection compliance',
      'System performance och reliability',
      'Staff training och change management',
      'Long-term technical sustainability'
    ],
    successMetrics: [
      'Technical architecture compatibility assessment',
      'Security compliance verification',
      'Performance benchmarks och SLA commitments',
      'Training plan och resource requirements',
      'Technical support och maintenance framework'
    ],
    communicationStyle: 'analytical',
    culturalContext: {
      lagomPreference: 85,
      consensusNeed: 75,
      transparencyExpectation: 95,
      formalityLevel: 65
    },
    journeyStages: [
      {
        id: 'technical_deep_dive',
        stageName: 'Technical Architecture Deep Dive',
        swedishName: 'Teknisk arkitektur fördjupning',
        duration: 30,
        objectives: [
          'Present comprehensive technical architecture',
          'Demonstrate system integration capabilities',
          'Address security och compliance requirements'
        ],
        stakeholderExperience: 'Detailed technical presentation med hands-on demonstration av system capabilities',
        culturalAdaptation: 'Swedish technical culture - thorough, systematic, evidence-based approach',
        interactionType: 'demonstration',
        lagomApproach: 'Comprehensive technical detail without overwhelming - right level för informed technical assessment',
        expectedReaction: 'Deep technical questions about architecture, security, och integration',
        successCriteria: [
          'Detailed technical architecture questions',
          'Security compliance discussion',
          'Integration scenario validation'
        ],
        riskMitigation: 'Have detailed technical documentation ready för complex integration scenarios'
      },
      {
        id: 'security_compliance_validation',
        stageName: 'Security & Compliance Validation',
        swedishName: 'Säkerhet och compliance-validering',
        duration: 20,
        objectives: [
          'Demonstrate GDPR och Swedish data protection compliance',
          'Show security architecture och monitoring',
          'Present audit trail och governance capabilities'
        ],
        stakeholderExperience: 'Comprehensive security review med live demonstration av compliance features',
        culturalAdaptation: 'Swedish systematic approach to risk management och legal compliance',
        interactionType: 'validation',
        lagomApproach: 'Thorough security review without creating unnecessary anxiety - confident but measured',
        expectedReaction: 'Detailed security questions och compliance verification requests',
        successCriteria: [
          'Approval av security architecture',
          'Compliance documentation acceptance',
          'Audit process agreement'
        ],
        riskMitigation: 'Prepare comprehensive compliance documentation och third-party security certifications'
      },
      {
        id: 'implementation_planning',
        stageName: 'Implementation Planning & Resource Assessment',
        swedishName: 'Implementeringsplanering och resursbedömning',
        duration: 25,
        objectives: [
          'Define implementation timeline och milestones',
          'Assess resource requirements och training needs',
          'Establish technical support framework'
        ],
        stakeholderExperience: 'Collaborative planning session för practical implementation details',
        culturalAdaptation: 'Swedish systematic planning approach - thorough preparation för successful implementation',
        interactionType: 'discussion',
        lagomApproach: 'Realistic timeline that ensures success without unnecessary delays',
        expectedReaction: 'Practical questions about timeline, resources, och change management',
        successCriteria: [
          'Agreement on implementation approach',
          'Resource allocation confirmation',
          'Training plan approval'
        ],
        riskMitigation: 'Have flexible implementation options för different resource availability scenarios'
      }
    ],
    expectedOutcome: 'Technical approval med implementation plan och resource commitment',
    followUpRequirements: [
      'Detailed technical integration plan',
      'Security assessment report',
      'Training curriculum development',
      'Technical support agreement'
    ]
  },
  {
    id: 'hr_chef',
    role: 'HR Director', 
    swedishTitle: 'HR-chef',
    department: 'HR-förvaltningen',
    decisionLevel: 'tactical',
    primaryConcerns: [
      'Employee development och career advancement',
      'Training effectiveness och engagement',
      'Change management och adoption',
      'Performance measurement och outcomes',
      'Staff satisfaction och retention'
    ],
    successMetrics: [
      'Employee engagement improvement metrics',
      'Skills development assessment framework',
      'Training completion och effectiveness rates',
      'Career advancement pathway clarity',
      'ROI on professional development investment'
    ],
    communicationStyle: 'diplomatic',
    culturalContext: {
      lagomPreference: 90,
      consensusNeed: 88,
      transparencyExpectation: 82,
      formalityLevel: 70
    },
    journeyStages: [
      {
        id: 'professional_development_showcase',
        stageName: 'Professional Development Excellence Showcase',
        swedishName: 'Professionell utveckling excellens-showcase',
        duration: 25,
        objectives: [
          'Demonstrate comprehensive professional development capabilities',
          'Show career advancement pathways och certification',
          'Present employee engagement och motivation features'
        ],
        stakeholderExperience: 'Inspiring presentation av professional development opportunities med real impact examples',
        culturalAdaptation: 'Swedish emphasis på personal development och work-life balance',
        interactionType: 'demonstration',
        lagomApproach: 'Comprehensive development offering without overwhelming employees - sustainable growth focus',
        expectedReaction: 'Interest in employee development outcomes och career progression',
        successCriteria: [
          'Questions about specific development programs',
          'Discussion av employee engagement strategies',
          'Interest in measurement och evaluation methods'
        ],
        riskMitigation: 'Prepare specific examples av career advancement success stories from similar contexts'
      },
      {
        id: 'change_management_discussion',
        stageName: 'Change Management & Adoption Strategy',
        swedishName: 'Förändringsledning och adoptionsstrategi',
        duration: 20,
        objectives: [
          'Address change management concerns',
          'Present adoption support framework',
          'Discuss employee communication strategy'
        ],
        stakeholderExperience: 'Collaborative discussion about supporting employees through change process',
        culturalAdaptation: 'Swedish approach to change - inclusive, supportive, ensuring no one left behind',
        interactionType: 'discussion',
        lagomApproach: 'Realistic change timeline that supports employees without rushing or prolonging unnecessarily',
        expectedReaction: 'Detailed questions about employee support och change timeline',
        successCriteria: [
          'Agreement on change management approach',
          'Employee communication plan approval',
          'Support resource allocation'
        ],
        riskMitigation: 'Have multiple change management scenarios för different organizational readiness levels'
      },
      {
        id: 'measurement_outcomes_planning',
        stageName: 'Measurement & Outcomes Planning',
        swedishName: 'Mätning och resultatplanering', 
        duration: 15,
        objectives: [
          'Establish success metrics och measurement framework',
          'Define reporting och evaluation processes',
          'Set realistic timeline för outcome assessment'
        ],
        stakeholderExperience: 'Data-focused discussion about measuring och demonstrating program success',
        culturalAdaptation: 'Swedish preference för evidence-based evaluation och continuous improvement',
        interactionType: 'validation',
        lagomApproach: 'Comprehensive measurement without creating excessive administrative burden',
        expectedReaction: 'Interest in specific metrics och evaluation methodology',
        successCriteria: [
          'Agreement on success metrics',
          'Evaluation timeline approval',
          'Reporting framework acceptance'
        ],
        riskMitigation: 'Prepare flexible measurement framework that can adapt to organizational priorities'
      }
    ],
    expectedOutcome: 'HR endorsement med employee development program integration approval',
    followUpRequirements: [
      'Detailed training curriculum development',
      'Change management implementation plan',
      'Employee communication strategy',
      'Success measurement framework'
    ]
  }
];

// Government Stakeholder Journey Step Component
interface StakeholderJourneyStepProps {
  stage: StakeholderJourneyStage;
  isActive: boolean;
  isCompleted: boolean;
  stakeholderType: string;
}

const StakeholderJourneyStepCard: React.FC<StakeholderJourneyStepProps> = ({
  stage,
  isActive,
  isCompleted,
  stakeholderType
}) => {

  return (
    <MotionCard
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      bg={isActive ? 'blue.50' : isCompleted ? 'green.50' : 'white'}
      borderColor={isActive ? swedishBlue : isCompleted ? 'green.500' : 'gray.200'}
      borderWidth="2px"
      boxShadow={isActive ? `0 8px 25px ${swedishBlue}30` : 'md'}
    >
      <CardBody p={5}>
        <VStack spacing={4} align="stretch">
          
          {/* Stage Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="md" fontWeight="700" color={swedishBlue}>
                {stage.stageName}
              </Text>
              <Text fontSize="sm" color="gray.600" fontStyle="italic">
                {stage.swedishName}
              </Text>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Badge 
                colorScheme={isCompleted ? "green" : isActive ? "blue" : "gray"}
                variant="solid"
              >
                {stage.interactionType}
              </Badge>
              <HStack spacing={1}>
                <Icon as={FiClock} w={3} h={3} color="gray.500" />
                <Text fontSize="xs" color="gray.500">
                  {stage.duration} min
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Objectives */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color={swedishBlue} mb={2}>
              Objectives:
            </Text>
            <VStack spacing={1} align="stretch">
              {stage.objectives.map((objective, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiTarget} w={3} h={3} color="blue.500" />
                  <Text fontSize="xs" color="gray.700">
                    {objective}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Stakeholder Experience */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color="green.600" mb={1}>
              Stakeholder Experience:
            </Text>
            <Text fontSize="xs" color="gray.700" lineHeight="tall">
              {stage.stakeholderExperience}
            </Text>
          </Box>

          {/* Lagom Approach */}
          <Box p={3} bg={swedishYellow + '20'} borderRadius="md" border="1px solid" borderColor={swedishYellow + '40'}>
            <Text fontSize="sm" fontWeight="600" color={swedishBlue} mb={1}>
              Lagom Approach:
            </Text>
            <Text fontSize="xs" color={swedishBlue} lineHeight="tall">
              {stage.lagomApproach}
            </Text>
          </Box>

          {/* Success Criteria */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color="purple.600" mb={2}>
              Success Criteria:
            </Text>
            <VStack spacing={1} align="stretch">
              {stage.successCriteria.map((criteria, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiCheckCircle} w={3} h={3} color="green.500" />
                  <Text fontSize="xs" color="gray.700">
                    {criteria}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Stakeholder Profile Display
interface StakeholderProfileProps {
  stakeholder: SwedishGovernmentStakeholder;
}

const StakeholderProfileDisplay: React.FC<StakeholderProfileProps> = ({ stakeholder }) => {

  return (
    <Card bg="blue.50" borderColor="blue.200" borderWidth="2px">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          {/* Stakeholder Header */}
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={FiUser} w={8} h={8} color={swedishBlue} />
              <VStack align="start" spacing={0}>
                <Text fontSize="xl" fontWeight="800" color={swedishBlue}>
                  {stakeholder.role}
                </Text>
                <Text fontSize="md" color="gray.600">
                  {stakeholder.swedishTitle} | {stakeholder.department}
                </Text>
              </VStack>
            </HStack>
            
            <VStack align="end" spacing={1}>
              <Badge bg={swedishYellow} color={swedishBlue} p={2} borderRadius="lg">
                {stakeholder.decisionLevel}
              </Badge>
              <Text fontSize="xs" color="gray.600">
                {stakeholder.communicationStyle}
              </Text>
            </VStack>
          </HStack>

          {/* Cultural Context Metrics */}
          <Box>
            <Text fontSize="md" fontWeight="600" color={swedishBlue} mb={3}>
              Swedish Cultural Context Profile:
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Lagom Preference:</Text>
                  <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                    {stakeholder.culturalContext.lagomPreference}%
                  </Text>
                </HStack>
                <Progress 
                  value={stakeholder.culturalContext.lagomPreference} 
                  colorScheme="blue" 
                  size="sm" 
                  borderRadius="full" 
                />
              </VStack>

              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Consensus Need:</Text>
                  <Text fontSize="sm" fontWeight="600" color="green.600">
                    {stakeholder.culturalContext.consensusNeed}%
                  </Text>
                </HStack>
                <Progress 
                  value={stakeholder.culturalContext.consensusNeed} 
                  colorScheme="green" 
                  size="sm" 
                  borderRadius="full" 
                />
              </VStack>

              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Transparency Expectation:</Text>
                  <Text fontSize="sm" fontWeight="600" color="purple.600">
                    {stakeholder.culturalContext.transparencyExpectation}%
                  </Text>
                </HStack>
                <Progress 
                  value={stakeholder.culturalContext.transparencyExpectation} 
                  colorScheme="purple" 
                  size="sm" 
                  borderRadius="full" 
                />
              </VStack>

              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Formality Level:</Text>
                  <Text fontSize="sm" fontWeight="600" color="orange.600">
                    {stakeholder.culturalContext.formalityLevel}%
                  </Text>
                </HStack>
                <Progress 
                  value={stakeholder.culturalContext.formalityLevel} 
                  colorScheme="orange" 
                  size="sm" 
                  borderRadius="full" 
                />
              </VStack>

            </Grid>
          </Box>

          {/* Primary Concerns & Success Metrics */}
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            
            <VStack spacing={3} align="stretch">
              <Text fontSize="md" fontWeight="600" color="red.600">
                Primary Concerns:
              </Text>
              {stakeholder.primaryConcerns.map((concern, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiShield} w={3} h={3} color="red.500" />
                  <Text fontSize="xs" color="gray.700" lineHeight="tall">
                    {concern}
                  </Text>
                </HStack>
              ))}
            </VStack>

            <VStack spacing={3} align="stretch">
              <Text fontSize="md" fontWeight="600" color="green.600">
                Success Metrics:
              </Text>
              {stakeholder.successMetrics.map((metric, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiTrendingUp} w={3} h={3} color="green.500" />
                  <Text fontSize="xs" color="gray.700" lineHeight="tall">
                    {metric}
                  </Text>
                </HStack>
              ))}
            </VStack>

          </Grid>

          {/* Expected Outcome */}
          <Alert status="success" bg={swedishYellow + '20'} borderColor={swedishYellow}>
            <AlertIcon color={swedishBlue} />
            <Box>
              <AlertTitle color={swedishBlue}>Expected Outcome:</AlertTitle>
              <AlertDescription color={swedishBlue}>
                {stakeholder.expectedOutcome}
              </AlertDescription>
            </Box>
          </Alert>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Main Government Stakeholder Journey Component
interface GovernmentStakeholderJourneyProps {
  selectedStakeholderId?: string;
  onStakeholderChange?: (stakeholderId: string) => void;
  onJourneyProgress?: (stageId: string, progress: number) => void;
}

export const GovernmentStakeholderJourney: React.FC<GovernmentStakeholderJourneyProps> = ({
  selectedStakeholderId = 'kommunstyrelseordforande',
  onStakeholderChange = () => console.log('Stakeholder changed'),
  onJourneyProgress = () => console.log('Journey progress updated')
}) => {
  
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());
  const { isOpen, onOpen, onClose } = useDisclosure();

  const _selectedStakeholder = swedishGovernmentStakeholders.find(
    s => s.id === selectedStakeholderId
  ) || swedishGovernmentStakeholders[0];

  const { activeStep, setActiveStep } = useSteps({
    index: activeStageIndex,
    count: selectedStakeholder.journeyStages.length,
  });


  const _totalJourneyTime = selectedStakeholder.journeyStages.reduce(
    (sum, stage) => sum + stage.duration, 0
  );


  return (
    <VStack spacing={8} align="stretch">
      
      {/* Government Stakeholder Journey Header */}
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
                  <Icon as={FiNavigation} w={8} h={8} color={swedishYellow} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800">
                      Government Stakeholder Journey Excellence
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      Swedish government official engagement UX optimized för cultural authenticity
                    </Text>
                  </VStack>
                </HStack>
                
                <VStack align="end" spacing={1}>
                  <Badge bg={swedishYellow} color={swedishBlue} p={2} borderRadius="lg" fontSize="sm">
                    🇸🇪 Swedish Government UX
                  </Badge>
                  <Text fontSize="xs" opacity={0.8}>
                    Lagom-Balanced Stakeholder Experience
                  </Text>
                </VStack>
              </HStack>

              {/* Journey Progress Metrics */}
              <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color={swedishYellow}>
                    {Math.round(completionPercentage)}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Journey Progress
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="green.300">
                    {completedStages.size}/{selectedStakeholder.journeyStages.length}
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Stages Completed
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="blue.300">
                    {totalJourneyTime} min
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Total Journey Time
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="orange.300">
                    {Math.round(selectedStakeholder.culturalContext.lagomPreference)}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Lagom Alignment
                  </Text>
                </VStack>
              </Grid>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Stakeholder Selection & Profile */}
      <Tabs variant="enclosed" colorScheme="blue" onChange={(index) => {
        onStakeholderChange(stakeholder.id);
        setActiveStageIndex(0);
        setCompletedStages(new Set());
        setActiveStep(0);
      }}>
        <TabList>
          {swedishGovernmentStakeholders.map((stakeholder) => (
            <Tab key={stakeholder.id} fontSize="sm">
              {stakeholder.swedishTitle}
            </Tab>
          ))}
        </TabList>

        <TabPanels>
          {swedishGovernmentStakeholders.map((stakeholder) => (
            <TabPanel key={stakeholder.id} p={0} pt={6}>
              <StakeholderProfileDisplay stakeholder={stakeholder} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>

      {/* Journey Stages Stepper */}
      <Box>
        <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
          Stakeholder Journey Stages för {selectedStakeholder.swedishTitle}:
        </Text>
        
        <Stepper index={activeStep} orientation="vertical" height="400px" gap="0">
          {selectedStakeholder.journeyStages.map((stage, index) => (
            <Step key={stage.id}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0" minW="300px">
                <StepTitle>{stage.stageName}</StepTitle>
                <StepDescription>{stage.swedishName} • {stage.duration} min</StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Detailed Journey Stage Cards */}
      <VStack spacing={6} align="stretch">
        <Text fontSize="lg" fontWeight="600" color="gray.700">
          Detailed Journey Stage Analysis:
        </Text>
        
        {selectedStakeholder.journeyStages.map((stage, index) => (
          <StakeholderJourneyStepCard
            key={stage.id}
            stage={stage}
            isActive={index === activeStageIndex}
            isCompleted={completedStages.has(index)}
            stakeholderType={selectedStakeholder.role}
          />
        ))}
      </VStack>

      {/* Journey Controls */}
      <Card bg="gray.50" borderColor="gray.200">
        <CardBody p={6}>
          <VStack spacing={4} align="stretch">
            
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="700" color={swedishBlue}>
                Journey Control Center
              </Text>
              <Badge colorScheme="blue" variant="solid">
                Stage {activeStageIndex + 1} av {selectedStakeholder.journeyStages.length}
              </Badge>
            </HStack>

            <Progress 
              value={completionPercentage} 
              colorScheme="blue" 
              size="lg" 
              borderRadius="full" 
            />

            <HStack justify="center" spacing={4}>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => handleStageComplete(activeStageIndex)}
                isDisabled={completedStages.has(activeStageIndex)}
                leftIcon={<Icon as={FiCheckCircle} />}
              >
                Complete Current Stage
              </Button>
              
              <Button
                variant="outline"
                colorScheme="blue"
                size="lg"
                onClick={onOpen}
                leftIcon={<Icon as={FiEye} />}
              >
                Preview Journey Summary
              </Button>
            </HStack>

          </VStack>
        </CardBody>
      </Card>

      {/* Journey Summary Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="white" borderRadius="xl" maxH="90vh" overflowY="auto">
          <ModalHeader bg="blue.50">
            <Text fontSize="xl" fontWeight="700" color={swedishBlue}>
              Journey Summary för {selectedStakeholder.swedishTitle}
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <VStack spacing={6} align="stretch">
              
              <Alert status="info" bg={swedishYellow + '20'} borderColor={swedishYellow}>
                <AlertIcon color={swedishBlue} />
                <Box>
                  <AlertTitle color={swedishBlue}>Expected Journey Outcome:</AlertTitle>
                  <AlertDescription color={swedishBlue}>
                    {selectedStakeholder.expectedOutcome}
                  </AlertDescription>
                </Box>
              </Alert>

              <Divider />

              <VStack spacing={3} align="stretch">
                <Text fontSize="lg" fontWeight="600" color={swedishBlue}>
                  Follow-up Requirements:
                </Text>
                {selectedStakeholder.followUpRequirements.map((requirement, index) => (
                  <HStack key={index} spacing={2}>
                    <Icon as={FiBookOpen} w={4} h={4} color="blue.500" />
                    <Text fontSize="sm" color="gray.700">
                      {requirement}
                    </Text>
                  </HStack>
                ))}
              </VStack>

            </VStack>
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
                <Icon as={FiAward} w={6} h={6} color="green.500" />
                <Text fontSize="lg" fontWeight="700" color="green.700">
                  Swedish Government Stakeholder Excellence Achievement
                </Text>
              </HStack>

              <Text fontSize="sm" color="green.700" lineHeight="tall">
                Government stakeholder journey UX optimizes för Swedish cultural authenticity med 
                lagom-balanced engagement that respects consensus-building, transparency expectations, 
                och appropriate formality levels. Each journey stage incorporates authentic Swedish 
                governance culture while delivering compelling technology demonstration för informed 
                decision-making.
              </Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="green.500">
                    Cultural
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Authentic Swedish Values
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    Consensus
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Democratic Decision-Making
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="orange.500">
                    Professional
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Government Excellence
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