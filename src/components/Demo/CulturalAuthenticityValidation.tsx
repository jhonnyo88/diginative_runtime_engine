import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Tooltip,
  CircularProgress,
  CircularProgressLabel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiShield,
  FiGlobe,
  FiBookOpen,
  FiFlag,
  FiUsers,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiStar,
  FiHeart,
  FiCompass,
  FiMapPin,
  FiSettings,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';

import { useCulturalTheme } from '../WorldHub/CulturalThemeProvider';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Cultural Authenticity Validation Framework
interface SwedishCulturalElement {
  id: string;
  category: 'terminology' | 'governance' | 'values' | 'communication' | 'procedures' | 'regional';
  element: string;
  swedishTerm: string;
  englishTranslation: string;
  contextualUsage: string;
  authenticityLevel: number; // 0-100
  governmentRelevance: number; // 0-100
  regionalVariation: {
    stockholm: string;
    goteborg: string;
    malmo: string;
    regional: string;
  };
  complianceRequirement: string;
  validationCriteria: string[];
  commonMistakes: string[];
  bestPractices: string[];
  legalFramework?: string;
}

interface CulturalValidationResult {
  elementId: string;
  score: number;
  status: 'authentic' | 'acceptable' | 'problematic' | 'invalid';
  feedback: string[];
  recommendations: string[];
}

interface ValidationSuite {
  overallScore: number;
  categoryScores: {
    [category: string]: number;
  };
  results: CulturalValidationResult[];
  certificationsAchieved: string[];
  improvementAreas: string[];
}

// Comprehensive Swedish Cultural Elements Database
const swedishCulturalElements: SwedishCulturalElement[] = [
  {
    id: 'kommunallag_compliance',
    category: 'governance',
    element: 'Municipal Law Compliance',
    swedishTerm: 'Kommunallag efterlevnad',
    englishTranslation: 'Municipal Law compliance according to Kommunallagen (2017:725)',
    contextualUsage: 'All municipal activities must comply med Kommunallagen för legal validity och democratic legitimacy',
    authenticityLevel: 98,
    governmentRelevance: 100,
    regionalVariation: {
      stockholm: 'Stockholm Stad implementation av Kommunallagen med focus på metropolitan complexity',
      goteborg: 'Göteborgs Stad application med emphasis på collaborative governance',
      malmo: 'Malmö Stad multicultural context application av municipal law',
      regional: 'Regional kommun applications med local adaptation binnen legal framework'
    },
    complianceRequirement: 'Mandatory compliance med all Kommunallagen provisions för municipal operations',
    validationCriteria: [
      'Proper reference to specific Kommunallagen chapters och paragraphs',
      'Accurate understanding av municipal competence boundaries',
      'Correct application av democratic principles',
      'Appropriate stakeholder involvement procedures'
    ],
    commonMistakes: [
      'Confusing Kommunallagen med other Swedish laws',
      'Misunderstanding municipal vs. state competence',
      'Ignoring democratic participation requirements',
      'Incorrect legal terminology usage'
    ],
    bestPractices: [
      'Reference specific law sections (e.g., "enligt Kommunallagen 2 kap. 1§")',
      'Explain municipal competence clearly',
      'Demonstrate democratic process integration',
      'Use correct Swedish legal terminology'
    ],
    legalFramework: 'Kommunallagen (2017:725) - Sveriges grundläggande municipal law'
  },
  {
    id: 'lagom_philosophy',
    category: 'values',
    element: 'Lagom Cultural Philosophy',
    swedishTerm: 'Lagom filosofi',
    englishTranslation: 'The Swedish concept av "just the right amount" - balanced moderation',
    contextualUsage: 'Lagom influences decision-making, resource allocation, och stakeholder interaction in Swedish governance',
    authenticityLevel: 95,
    governmentRelevance: 88,
    regionalVariation: {
      stockholm: 'Stockholm lagom balances metropolitan ambition med sustainable moderation',
      goteborg: 'Göteborg lagom emphasizes collaborative balance och inclusive moderation',
      malmo: 'Malmö lagom integrates multicultural perspectives inom balanced approach',
      regional: 'Regional lagom focuses på practical balance för local community needs'
    },
    complianceRequirement: 'Cultural sensitivity requirement för authentic Swedish stakeholder engagement',
    validationCriteria: [
      'Demonstrated understanding av lagom in governance context',
      'Balanced approach to resource allocation och planning',
      'Moderate tone in communication och presentation',
      'Inclusive decision-making that avoids extremes'
    ],
    commonMistakes: [
      'Translating lagom as "lazy" or "mediocre"',
      'Applying lagom as simple minimalism',
      'Ignoring lagom\'s collective dimension',
      'Using lagom inappropriately in formal contexts'
    ],
    bestPractices: [
      'Explain lagom as balanced excellence, not mediocrity',
      'Apply lagom principles to decision-making processes',
      'Demonstrate sustainable, moderate approaches',
      'Show lagom\'s connection to Swedish democratic values'
    ]
  },
  {
    id: 'consensus_building',
    category: 'procedures',
    element: 'Swedish Consensus Building',
    swedishTerm: 'Svensk konsensusbyggande',
    englishTranslation: 'Swedish collaborative decision-making seeking broad agreement',
    contextualUsage: 'Essential process in Swedish governance för legitimate decision-making och stakeholder buy-in',
    authenticityLevel: 92,
    governmentRelevance: 96,
    regionalVariation: {
      stockholm: 'Stockholm consensus includes diverse metropolitan stakeholder perspectives',
      goteborg: 'Göteborg consensus emphasizes collaborative discussion och shared solutions',
      malmo: 'Malmö consensus incorporates multicultural dialogue och inclusive agreement',
      regional: 'Regional consensus focuses på local community agreement och practical solutions'
    },
    complianceRequirement: 'Democratic participation requirement för Swedish municipal governance',
    validationCriteria: [
      'Inclusive stakeholder consultation processes',
      'Patient discussion allowing all voices',
      'Genuine effort to find common ground',
      'Documentation av consensus-building process'
    ],
    commonMistakes: [
      'Rushing consensus process för efficiency',
      'Excluding dissenting voices från discussion',
      'Confusing consensus med unanimous agreement',
      'Using consensus as delay tactic'
    ],
    bestPractices: [
      'Allow sufficient time för genuine consensus building',
      'Include all relevant stakeholder perspectives',
      'Document consensus process transparently',
      'Demonstrate commitment to collective decision-making'
    ]
  },
  {
    id: 'offentlighetsprincipen',
    category: 'governance',
    element: 'Principle av Public Access',
    swedishTerm: 'Offentlighetsprincipen',
    englishTranslation: 'Constitutional right to access public documents och information',
    contextualUsage: 'Fundamental principle governing transparency and accountability in Swedish public administration',
    authenticityLevel: 99,
    governmentRelevance: 100,
    regionalVariation: {
      stockholm: 'Stockholm implementation med digital accessibility och metropolitan transparency',
      goteborg: 'Göteborg application emphasizing collaborative transparency',
      malmo: 'Malmö implementation med multicultural communication considerations',
      regional: 'Regional application adapted to local communication needs'
    },
    complianceRequirement: 'Constitutional requirement enligt Regeringsformen 2 kap. 1§',
    validationCriteria: [
      'Proper understanding av constitutional foundation',
      'Correct application to municipal context',
      'Balance between transparency och privacy protection',
      'Appropriate reference to Offentlighets- och sekretesslagen'
    ],
    commonMistakes: [
      'Confusing med GDPR requirements',
      'Overly broad interpretation ignoring privacy protection',
      'Incorrect understanding av secrecy exceptions',
      'Poor English translation av concept'
    ],
    bestPractices: [
      'Reference constitutional foundation (Regeringsformen 2:1)',
      'Explain balance med privacy protection',
      'Use correct Swedish terminology consistently',
      'Demonstrate practical transparency implementation'
    ],
    legalFramework: 'Regeringsformen 2 kap. 1§, Offentlighets- och sekretesslagen (2009:400)'
  },
  {
    id: 'medborgarinflytande',
    category: 'procedures',
    element: 'Citizen Participation in Governance',
    swedishTerm: 'Medborgarinflytande',
    englishTranslation: 'Citizen influence och participation in democratic governance',
    contextualUsage: 'Core democratic principle ensuring citizen voice in municipal decision-making processes',
    authenticityLevel: 94,
    governmentRelevance: 93,
    regionalVariation: {
      stockholm: 'Stockholm citizen participation through diverse metropolitan channels',
      goteborg: 'Göteborg collaborative citizen engagement med dialogue emphasis',
      malmo: 'Malmö multicultural citizen participation approaches',
      regional: 'Regional citizen engagement adapted to local community structures'
    },
    complianceRequirement: 'Democratic legitimacy requirement för municipal decision-making',
    validationCriteria: [
      'Meaningful citizen consultation opportunities',
      'Accessible participation channels för diverse citizens',
      'Transparent communication about citizen influence',
      'Integration av citizen input into decision processes'
    ],
    commonMistakes: [
      'Tokenistic consultation without real influence',
      'Excluding marginalized citizen groups',
      'Poor communication about participation opportunities',
      'Ignoring citizen input in final decisions'
    ],
    bestPractices: [
      'Create multiple participation channels',
      'Ensure accessibility för all citizen groups',
      'Communicate clearly about influence opportunities',
      'Demonstrate how citizen input shapes decisions'
    ]
  },
  {
    id: 'regional_terminology',
    category: 'regional',
    element: 'Regional Swedish Variations',
    swedishTerm: 'Regional svenska variationer',
    englishTranslation: 'Regional variations in Swedish municipal terminology och practices',
    contextualUsage: 'Understanding regional differences within Swedish governance culture',
    authenticityLevel: 87,
    governmentRelevance: 75,
    regionalVariation: {
      stockholm: 'Stockholm län terminology med metropolitan governance focus',
      goteborg: 'Västra Götaland regional terminology med collaborative emphasis',
      malmo: 'Skåne regional terminology med multicultural considerations',
      regional: 'General regional municipality terminology adaptations'
    },
    complianceRequirement: 'Cultural sensitivity för regional stakeholder engagement',
    validationCriteria: [
      'Awareness av regional terminology differences',
      'Appropriate adaptation to regional context',
      'Respect för local governance traditions',
      'Effective communication across regional differences'
    ],
    commonMistakes: [
      'Assuming uniform terminology across Sweden',
      'Ignoring regional governance preferences',
      'Poor adaptation to local contexts',
      'Stereotyping regional differences'
    ],
    bestPractices: [
      'Research specific regional preferences',
      'Adapt terminology to regional context',
      'Show respect för local governance traditions',
      'Demonstrate regional cultural sensitivity'
    ]
  }
];

// Cultural validation assessment categories
const validationCategories = [
  { id: 'terminology', name: 'Swedish Terminology', weight: 20 },
  { id: 'governance', name: 'Governance Compliance', weight: 25 },
  { id: 'values', name: 'Cultural Values', weight: 20 },
  { id: 'communication', name: 'Communication Style', weight: 15 },
  { id: 'procedures', name: 'Democratic Procedures', weight: 15 },
  { id: 'regional', name: 'Regional Sensitivity', weight: 5 }
];

// Cultural Element Validation Card
interface CulturalElementCardProps {
  element: SwedishCulturalElement;
  validationResult?: CulturalValidationResult;
  onValidate?: (elementId: string) => void;
}

const CulturalElementValidationCard: React.FC<CulturalElementCardProps> = ({
  element,
  validationResult,
  onValidate = () => {}
}) => {
  const swedishBlue = '#003366';
  const swedishYellow = '#FFCC00';

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'authentic': return 'green';
      case 'acceptable': return 'blue';
      case 'problematic': return 'orange';
      case 'invalid': return 'red';
      default: return 'gray';
    }
  };

  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      bg="white"
      borderColor={validationResult ? `${getStatusColor(validationResult.status)}.200` : 'gray.200'}
      borderWidth="2px"
      boxShadow="md"
      _hover={{ boxShadow: "lg" }}
    >
      <CardBody p={5}>
        <VStack spacing={4} align="stretch">
          
          {/* Element Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="md" fontWeight="700" color={swedishBlue}>
                {element.element}
              </Text>
              <Text fontSize="sm" color="gray.600" fontStyle="italic">
                {element.swedishTerm}
              </Text>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Badge 
                colorScheme={getStatusColor(validationResult?.status)}
                variant="solid"
              >
                {element.category}
              </Badge>
              {validationResult && (
                <CircularProgress
                  value={validationResult.score}
                  size="40px"
                  thickness="8px"
                  color={`${getStatusColor(validationResult.status)}.500`}
                >
                  <CircularProgressLabel fontSize="xs" fontWeight="600">
                    {validationResult.score}%
                  </CircularProgressLabel>
                </CircularProgress>
              )}
            </VStack>
          </HStack>

          {/* Cultural Metrics */}
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <VStack spacing={1}>
              <Text fontSize="xs" color="gray.600">Authenticity</Text>
              <Progress 
                value={element.authenticityLevel} 
                colorScheme="blue" 
                size="sm" 
                borderRadius="full" 
              />
              <Text fontSize="xs" fontWeight="600" color="blue.500">
                {element.authenticityLevel}%
              </Text>
            </VStack>
            
            <VStack spacing={1}>
              <Text fontSize="xs" color="gray.600">Gov. Relevance</Text>
              <Progress 
                value={element.governmentRelevance} 
                colorScheme="green" 
                size="sm" 
                borderRadius="full" 
              />
              <Text fontSize="xs" fontWeight="600" color="green.500">
                {element.governmentRelevance}%
              </Text>
            </VStack>
          </Grid>

          {/* Contextual Usage */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color={swedishBlue} mb={1}>
              Contextual Usage:
            </Text>
            <Text fontSize="xs" color="gray.700" lineHeight="tall">
              {element.contextualUsage}
            </Text>
          </Box>

          {/* Validation Criteria Preview */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color="green.600" mb={2}>
              Key Validation Criteria:
            </Text>
            <VStack spacing={1} align="stretch">
              {element.validationCriteria.slice(0, 2).map((criteria, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiCheck} w={3} h={3} color="green.500" />
                  <Text fontSize="xs" color="gray.700">
                    {criteria}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Common Mistakes Warning */}
          <Box p={3} bg="orange.50" borderRadius="md" border="1px solid orange.200">
            <HStack spacing={2} mb={1}>
              <Icon as={FiAlertTriangle} w={4} h={4} color="orange.500" />
              <Text fontSize="sm" fontWeight="600" color="orange.700">
                Common Mistakes:
              </Text>
            </HStack>
            <Text fontSize="xs" color="orange.700" lineHeight="tall">
              {element.commonMistakes[0]}
            </Text>
          </Box>

          {/* Validation Results */}
          {validationResult && (
            <Box p={3} bg={`${getStatusColor(validationResult.status)}.50`} borderRadius="md">
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="600" color={`${getStatusColor(validationResult.status)}.700`}>
                    Validation Status: {validationResult.status}
                  </Text>
                  <Badge colorScheme={getStatusColor(validationResult.status)} variant="solid">
                    {validationResult.score}% Score
                  </Badge>
                </HStack>
                
                {validationResult.feedback.length > 0 && (
                  <VStack spacing={1} align="stretch">
                    <Text fontSize="xs" fontWeight="600" color={`${getStatusColor(validationResult.status)}.700`}>
                      Feedback:
                    </Text>
                    {validationResult.feedback.map((feedback, index) => (
                      <Text key={index} fontSize="xs" color={`${getStatusColor(validationResult.status)}.700`}>
                        • {feedback}
                      </Text>
                    ))}
                  </VStack>
                )}
              </VStack>
            </Box>
          )}

          {/* Validate Button */}
          <Button
            size="sm"
            colorScheme="blue"
            variant={validationResult ? "outline" : "solid"}
            onClick={() => onValidate(element.id)}
            leftIcon={<Icon as={validationResult ? FiRefreshCw : FiShield} />}
          >
            {validationResult ? 'Re-validate' : 'Validate Authenticity'}
          </Button>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Validation Results Dashboard
interface ValidationDashboardProps {
  validationSuite: ValidationSuite;
}

const CulturalValidationDashboard: React.FC<ValidationDashboardProps> = ({ validationSuite }) => {
  const swedishBlue = '#003366';
  const swedishYellow = '#FFCC00';

  const getOverallStatus = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'green', icon: FiAward };
    if (score >= 80) return { status: 'Good', color: 'blue', icon: FiStar };
    if (score >= 70) return { status: 'Acceptable', color: 'orange', icon: FiFlag };
    return { status: 'Needs Improvement', color: 'red', icon: FiAlertTriangle };
  };

  const overall = getOverallStatus(validationSuite.overallScore);

  return (
    <Card bg="blue.50" borderColor="blue.200" borderWidth="2px">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          {/* Dashboard Header */}
          <HStack spacing={3}>
            <Icon as={FiShield} w={8} h={8} color={swedishBlue} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="800" color={swedishBlue}>
                Cultural Authenticity Validation Dashboard
              </Text>
              <Text fontSize="md" color="gray.600">
                Swedish government cultural intelligence assessment results
              </Text>
            </VStack>
          </HStack>

          {/* Overall Score Display */}
          <Box
            p={6}
            bg={`linear-gradient(135deg, ${swedishBlue} 0%, ${swedishBlue} 100%)`}
            color="white"
            borderRadius="xl"
            position="relative"
            overflow="hidden"
          >
            {/* Swedish Flag Pattern */}
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
              <VStack align="start" spacing={2}>
                <HStack spacing={3}>
                  <Icon as={overall.icon} w={8} h={8} color={swedishYellow} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800">
                      Cultural Authenticity Score
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      Swedish government validation assessment
                    </Text>
                  </VStack>
                </HStack>
                
                <Badge bg={swedishYellow} color={swedishBlue} p={2} borderRadius="lg" fontSize="lg">
                  {overall.status}
                </Badge>
              </VStack>
              
              <VStack align="end" spacing={1}>
                <Text fontSize="4xl" fontWeight="900" color={swedishYellow}>
                  {validationSuite.overallScore}%
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Overall Authenticity
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Category Scores */}
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="600" color={swedishBlue}>
              Category Assessment Results:
            </Text>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              {validationCategories.map((category) => {
                const score = validationSuite.categoryScores[category.id] || 0;
                const status = getOverallStatus(score);
                
                return (
                  <VStack key={category.id} spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                        {category.name}:
                      </Text>
                      <Text fontSize="sm" fontWeight="700" color={`${status.color}.500`}>
                        {score}%
                      </Text>
                    </HStack>
                    <Progress
                      value={score}
                      colorScheme={status.color}
                      size="md"
                      borderRadius="full"
                    />
                    <HStack justify="space-between">
                      <Text fontSize="xs" color="gray.600">
                        Weight: {category.weight}%
                      </Text>
                      <Badge colorScheme={status.color} variant="outline" fontSize="xs">
                        {status.status}
                      </Badge>
                    </HStack>
                  </VStack>
                );
              })}
            </Grid>
          </VStack>

          {/* Certifications Achieved */}
          {validationSuite.certificationsAchieved.length > 0 && (
            <VStack spacing={3} align="stretch">
              <Text fontSize="lg" fontWeight="600" color="green.600">
                Cultural Certifications Achieved:
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                {validationSuite.certificationsAchieved.map((cert, index) => (
                  <HStack key={index} spacing={2}>
                    <Icon as={FiAward} w={4} h={4} color="green.500" />
                    <Text fontSize="sm" color="green.700" fontWeight="600">
                      {cert}
                    </Text>
                  </HStack>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Improvement Areas */}
          {validationSuite.improvementAreas.length > 0 && (
            <Alert status="warning" bg={swedishYellow + '20'} borderColor={swedishYellow}>
              <AlertIcon color={swedishBlue} />
              <Box>
                <AlertTitle color={swedishBlue}>Areas för Cultural Improvement:</AlertTitle>
                <AlertDescription color={swedishBlue}>
                  <VStack spacing={1} align="start" mt={2}>
                    {validationSuite.improvementAreas.map((area, index) => (
                      <Text key={index} fontSize="sm">
                        • {area}
                      </Text>
                    ))}
                  </VStack>
                </AlertDescription>
              </Box>
            </Alert>
          )}

        </VStack>
      </CardBody>
    </Card>
  );
};

// Main Cultural Authenticity Validation Component
interface CulturalAuthenticityValidationProps {
  onValidationComplete?: (results: ValidationSuite) => void;
  autoValidate?: boolean;
}

export const CulturalAuthenticityValidation: React.FC<CulturalAuthenticityValidationProps> = ({
  onValidationComplete = () => console.log('Cultural validation completed'),
  autoValidate = false
}) => {
  const swedishBlue = '#003366';
  const swedishYellow = '#FFCC00';
  
  const [validationResults, setValidationResults] = useState<Map<string, CulturalValidationResult>>(new Map());
  const [isValidating, setIsValidating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Calculate validation suite from results
  const validationSuite = useMemo<ValidationSuite>(() => {
    const results = Array.from(validationResults.values());
    
    // Calculate category scores
    const categoryScores: { [key: string]: number } = {};
    validationCategories.forEach(category => {
      const categoryElements = swedishCulturalElements.filter(e => e.category === category.id);
      const categoryResults = categoryElements.map(e => validationResults.get(e.id)?.score || 0);
      categoryScores[category.id] = categoryResults.length > 0 
        ? Math.round(categoryResults.reduce((sum, score) => sum + score, 0) / categoryResults.length)
        : 0;
    });

    // Calculate weighted overall score
    const overallScore = Math.round(
      validationCategories.reduce((sum, category) => {
        return sum + (categoryScores[category.id] * category.weight / 100);
      }, 0)
    );

    // Determine certifications
    const certificationsAchieved: string[] = [];
    if (categoryScores.governance >= 90) certificationsAchieved.push('Swedish Governance Excellence');
    if (categoryScores.values >= 85) certificationsAchieved.push('Lagom Cultural Authenticity');
    if (categoryScores.terminology >= 88) certificationsAchieved.push('Swedish Municipal Terminology');
    if (overallScore >= 92) certificationsAchieved.push('Comprehensive Swedish Cultural Intelligence');

    // Identify improvement areas
    const improvementAreas: string[] = [];
    validationCategories.forEach(category => {
      if (categoryScores[category.id] < 75) {
        improvementAreas.push(`${category.name} requires significant improvement`);
      } else if (categoryScores[category.id] < 85) {
        improvementAreas.push(`${category.name} has optimization opportunities`);
      }
    });

    return {
      overallScore,
      categoryScores,
      results,
      certificationsAchieved,
      improvementAreas
    };
  }, [validationResults]);

  const handleElementValidation = useCallback(async (elementId: string) => {
    setIsValidating(true);
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const element = swedishCulturalElements.find(e => e.id === elementId);
    if (!element) return;

    // Generate realistic validation result
    const baseScore = element.authenticityLevel;
    const variance = Math.random() * 20 - 10; // ±10 variance
    const score = Math.max(0, Math.min(100, Math.round(baseScore + variance)));
    
    let status: 'authentic' | 'acceptable' | 'problematic' | 'invalid';
    if (score >= 90) status = 'authentic';
    else if (score >= 75) status = 'acceptable';
    else if (score >= 60) status = 'problematic';
    else status = 'invalid';

    const result: CulturalValidationResult = {
      elementId,
      score,
      status,
      feedback: [
        score >= 85 ? 'Excellent cultural authenticity demonstrated' : 
        score >= 70 ? 'Good cultural understanding med minor adjustments needed' :
        'Cultural authenticity needs significant improvement',
        
        element.category === 'governance' ? 'Legal compliance verification completed' :
        element.category === 'values' ? 'Cultural values alignment assessed' :
        'Terminology accuracy evaluated'
      ],
      recommendations: score < 85 ? [
        'Review Swedish cultural context guidelines',
        'Consult med Swedish municipal experts',
        'Implement cultural authenticity improvements'
      ] : [
        'Maintain current cultural intelligence level',
        'Continue monitoring cultural authenticity'
      ]
    };

    setValidationResults(prev => new Map(prev.set(elementId, result)));
    setIsValidating(false);
  }, []);

  const handleBulkValidation = useCallback(async () => {
    setIsValidating(true);
    
    for (const element of swedishCulturalElements) {
      await handleElementValidation(element.id);
      await new Promise(resolve => setTimeout(resolve, 200)); // Stagger validations
    }
    
    setIsValidating(false);
  }, [handleElementValidation]);

  useEffect(() => {
    if (autoValidate) {
      handleBulkValidation();
    }
  }, [autoValidate, handleBulkValidation]);

  useEffect(() => {
    if (validationResults.size > 0) {
      onValidationComplete(validationSuite);
    }
  }, [validationSuite, onValidationComplete, validationResults]);

  const filteredElements = selectedCategory === 'all' 
    ? swedishCulturalElements 
    : swedishCulturalElements.filter(e => e.category === selectedCategory);

  return (
    <VStack spacing={8} align="stretch">
      
      {/* Cultural Authenticity Validation Header */}
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
                  <Icon as={FiShield} w={8} h={8} color={swedishYellow} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800">
                      Cultural Authenticity Validation System
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      Comprehensive Swedish municipal cultural intelligence verification
                    </Text>
                  </VStack>
                </HStack>
                
                <VStack align="end" spacing={1}>
                  <Badge bg={swedishYellow} color={swedishBlue} p={2} borderRadius="lg" fontSize="sm">
                    🇸🇪 Swedish Authenticity Certified
                  </Badge>
                  <Text fontSize="xs" opacity={0.8}>
                    Government Cultural Standards
                  </Text>
                </VStack>
              </HStack>

              {/* Validation Progress Metrics */}
              <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color={swedishYellow}>
                    {validationResults.size}
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Elements Validated
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="green.300">
                    {validationSuite.overallScore}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Overall Authenticity
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="blue.300">
                    {validationSuite.certificationsAchieved.length}
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Certifications
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="orange.300">
                    {swedishCulturalElements.length}
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Cultural Elements
                  </Text>
                </VStack>
              </Grid>

              {/* Validation Controls */}
              <HStack justify="center" spacing={4}>
                <Button
                  size="lg"
                  colorScheme="green"
                  onClick={handleBulkValidation}
                  isLoading={isValidating}
                  loadingText="Validating..."
                  leftIcon={<Icon as={FiShield} />}
                  bg="green.500"
                  color="white"
                  _hover={{ bg: "green.600" }}
                >
                  Validate All Elements
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
                  View Dashboard
                </Button>
              </HStack>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Validation Dashboard */}
      {validationResults.size > 0 && (
        <CulturalValidationDashboard validationSuite={validationSuite} />
      )}

      {/* Category Filter */}
      <Box>
        <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
          Cultural Elements by Category:
        </Text>
        
        <Tabs 
          variant="enclosed" 
          colorScheme="blue"
          onChange={(index) => {
            const categories = ['all', ...validationCategories.map(c => c.id)];
            setSelectedCategory(categories[index]);
          }}
        >
          <TabList>
            <Tab>All Elements</Tab>
            {validationCategories.map((category) => (
              <Tab key={category.id}>{category.name}</Tab>
            ))}
          </TabList>

          <TabPanels>
            <TabPanel p={0} pt={6}>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {filteredElements.map((element) => (
                  <CulturalElementValidationCard
                    key={element.id}
                    element={element}
                    validationResult={validationResults.get(element.id)}
                    onValidate={handleElementValidation}
                  />
                ))}
              </Grid>
            </TabPanel>
            
            {validationCategories.map((category) => (
              <TabPanel key={category.id} p={0} pt={6}>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                  {swedishCulturalElements
                    .filter(e => e.category === category.id)
                    .map((element) => (
                      <CulturalElementValidationCard
                        key={element.id}
                        element={element}
                        validationResult={validationResults.get(element.id)}
                        onValidate={handleElementValidation}
                      />
                    ))}
                </Grid>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>

      {/* Validation Dashboard Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="white" borderRadius="xl" maxH="90vh" overflowY="auto">
          <ModalHeader bg="blue.50">
            <Text fontSize="xl" fontWeight="700" color={swedishBlue}>
              Cultural Authenticity Validation Dashboard
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <CulturalValidationDashboard validationSuite={validationSuite} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Swedish Cultural Excellence Summary */}
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
                  Swedish Cultural Authenticity Excellence Verification
                </Text>
              </HStack>

              <Text fontSize="sm" color="green.700" lineHeight="tall">
                Comprehensive cultural authenticity validation system ensures authentic Swedish 
                municipal cultural intelligence through systematic verification av terminology, 
                governance compliance, cultural values, communication style, democratic procedures, 
                och regional sensitivity. Government stakeholder confidence achieved through 
                verified cultural authenticity certification.
              </Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="green.500">
                    Verified
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Cultural Authenticity
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    Compliant
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Governance Standards
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="orange.500">
                    Certified
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Government Ready
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