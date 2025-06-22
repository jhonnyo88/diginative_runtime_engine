import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Progress,
  Icon,
  Button,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGlobe,
  FiUsers,
  FiTrendingUp,
  FiZap,
  FiClock,
  FiAward,
  FiTarget,
  FiSettings,
  FiStar,
  FiHeart,
  FiFlag,
  FiMap
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';


// Advanced Cultural Intelligence Interfaces
interface CulturalContextData {
  id: string;
  name: string;
  displayName: string;
  language: string;
  primaryValues: string[];
  communicationStyle: 'direct' | 'diplomatic' | 'consensus' | 'structured';
  decisionMaking: 'individual' | 'collective' | 'hierarchical' | 'participatory';
  workLifeBalance: 'integrated' | 'separated' | 'flexible' | 'structured';
  innovationApproach: 'cautious' | 'bold' | 'systematic' | 'collaborative';
  conflictResolution: 'avoidance' | 'confrontation' | 'mediation' | 'consensus';
  professionalHierarchy: 'flat' | 'moderate' | 'structured' | 'traditional';
  adaptationScore: number;
  authenticity: number;
  professionalRelevance: number;
}

interface MunicipalScenarioAdaptation {
  scenarioId: string;
  scenarioName: string;
  baseNarrative: string;
  culturalAdaptations: Record<string, {
    narrative: string;
    keyDecisionPoints: string[];
    culturalNuances: string[];
    professionalTerminology: Record<string, string>;
    expectedOutcomes: string[];
    stakeholderConsiderations: string[];
  }>;
  complexityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  municipalDomain: 'emergency_response' | 'budget_planning' | 'digital_transformation' | 'stakeholder_relations' | 'regulatory_compliance';
}

interface CrossCulturalInsight {
  id: string;
  insight: string;
  applicableContexts: string[];
  professionalImplication: string;
  implementationStrategy: string;
  measurableOutcome: string;
  validationMethod: string;
}

// Enhanced Cultural Context Definitions
const advancedCulturalContexts: CulturalContextData[] = [
  {
    id: 'swedish_lagom',
    name: 'swedish',
    displayName: 'Svenska Lagom',
    language: 'sv-SE',
    primaryValues: ['Consensus', 'Sustainability', 'Equality', 'Balance', 'Democratic Participation'],
    communicationStyle: 'consensus',
    decisionMaking: 'collective',
    workLifeBalance: 'integrated',
    innovationApproach: 'collaborative',
    conflictResolution: 'consensus',
    professionalHierarchy: 'flat',
    adaptationScore: 96,
    authenticity: 94,
    professionalRelevance: 98
  },
  {
    id: 'german_systematik',
    name: 'german',
    displayName: 'Deutsche Systematik',
    language: 'de-DE',
    primaryValues: ['Thoroughness', 'Process Excellence', 'Reliability', 'Precision', 'Long-term Planning'],
    communicationStyle: 'structured',
    decisionMaking: 'hierarchical',
    workLifeBalance: 'separated',
    innovationApproach: 'systematic',
    conflictResolution: 'mediation',
    professionalHierarchy: 'structured',
    adaptationScore: 94,
    authenticity: 96,
    professionalRelevance: 95
  },
  {
    id: 'french_service_public',
    name: 'french',
    displayName: 'Service Public Français',
    language: 'fr-FR',
    primaryValues: ['Excellence', 'Sophistication', 'Dignity', 'Cultural Pride', 'Republican Values'],
    communicationStyle: 'diplomatic',
    decisionMaking: 'hierarchical',
    workLifeBalance: 'flexible',
    innovationApproach: 'cautious',
    conflictResolution: 'mediation',
    professionalHierarchy: 'traditional',
    adaptationScore: 92,
    authenticity: 95,
    professionalRelevance: 93
  },
  {
    id: 'dutch_efficiency',
    name: 'dutch',
    displayName: 'Nederlandse Efficiëntie',
    language: 'nl-NL',
    primaryValues: ['Directness', 'Pragmatism', 'Innovation', 'Efficiency', 'Practical Results'],
    communicationStyle: 'direct',
    decisionMaking: 'participatory',
    workLifeBalance: 'flexible',
    innovationApproach: 'bold',
    conflictResolution: 'confrontation',
    professionalHierarchy: 'moderate',
    adaptationScore: 93,
    authenticity: 92,
    professionalRelevance: 96
  }
];

// Sample Municipal Scenario Adaptations
const sampleMunicipalScenarios: MunicipalScenarioAdaptation[] = [
  {
    scenarioId: 'crisis_budget_allocation',
    scenarioName: 'Crisis Budget Allocation',
    baseNarrative: 'A sudden infrastructure emergency requires immediate budget reallocation decisions affecting multiple municipal departments.',
    culturalAdaptations: {
      swedish: {
        narrative: 'En infrastrukturkris kräver omedelbar budgetomfördelning med konsensus från alla berörda avdelningar genom demokratisk process.',
        keyDecisionPoints: [
          'Samla alla berörda chefer för kollektiv beslutsfattning',
          'Säkerställ att alla röster hörs innan beslut fattas',
          'Prioritera långsiktig hållbarhet över snabba lösningar',
          'Dokumentera transparenta motiveringar för alla beslut'
        ],
        culturalNuances: [
          'Jantelagen - undvik att framhäva individuella beslut',
          'Lagom - balanserad resursfördelning som gynnar kollektivet',
          'Trygghet - säkerställ att beslutet känns tryggt för alla parter'
        ],
        professionalTerminology: {
          'emergency': 'nödsituation',
          'consensus': 'samförstånd', 
          'allocation': 'fördelning',
          'stakeholder': 'intressent'
        },
        expectedOutcomes: [
          'Enhälligt beslut som alla avdelningar stöder',
          'Transparent process som kan kommuniceras till medborgare',
          'Hållbar lösning som fungerar långsiktigt'
        ],
        stakeholderConsiderations: [
          'Kommunfullmäktige måste informeras omedelbart',
          'Fackliga representanter bör inkluderas i processen',
          'Medborgargrupper ska få information om påverkan'
        ]
      },
      german: {
        narrative: 'Ein plötzlicher Infrastrukturnotfall erfordert sofortige systematische Budgetumverteilungsentscheidungen mit gründlicher Dokumentation.',
        keyDecisionPoints: [
          'Systematische Analyse aller verfügbaren Budgetoptionen',
          'Detaillierte Risikoanalyse für jede Entscheidungsalternative',
          'Hierarchische Genehmigungsprozesse strikt befolgen',
          'Vollständige Dokumentation aller Entscheidungsgrundlagen'
        ],
        culturalNuances: [
          'Gründlichkeit - alle Aspekte müssen vollständig analysiert werden',
          'Ordnung - systematischer Prozess ist wichtiger als Geschwindigkeit',
          'Verantwortung - klare Zuständigkeiten und Haftung definieren'
        ],
        professionalTerminology: {
          'emergency': 'Notfall',
          'systematic': 'systematisch',
          'allocation': 'Zuteilung',
          'procedure': 'Verfahren'
        },
        expectedOutcomes: [
          'Gründlich dokumentierte Entscheidung mit vollständiger Begründung',
          'Systematischer Umsetzungsplan mit klaren Meilensteinen',
          'Rechtlich einwandfreie Prozessdokumentation'
        ],
        stakeholderConsiderations: [
          'Stadtrat muss formell alle Entscheidungen genehmigen',
          'Juristische Abteilung prüft alle rechtlichen Aspekte',
          'Finanzcontroller überwacht Budgetkonformität'
        ]
      },
      french: {
        narrative: 'Une urgence d\'infrastructure soudaine nécessite des décisions de réallocation budgétaire immédiates avec excellence diplomatique.',
        keyDecisionPoints: [
          'Consultation raffinée avec tous les directeurs concernés',
          'Présentation élégante des options à la hiérarchie',
          'Négociation diplomatique des priorités budgétaires',
          'Communication sophistiquée vers les parties prenantes'
        ],
        culturalNuances: [
          'Savoir-vivre - maintenir la dignité dans toutes les interactions',
          'Art de vivre - équilibrer efficacité et raffinement culturel',
          'République - servir l\'intérêt général avec honneur'
        ],
        professionalTerminology: {
          'emergency': 'urgence',
          'excellence': 'excellence',
          'allocation': 'répartition',
          'stakeholder': 'partie prenante'
        },
        expectedOutcomes: [
          'Solution élégante qui honore toutes les parties',
          'Processus diplomatique préservant les relations',
          'Décision qui élève le service public français'
        ],
        stakeholderConsiderations: [
          'Préfet doit être informé des implications régionales',
          'Conseil municipal nécessite présentation formelle',
          'Citoyens méritent communication raffinée et transparente'
        ]
      },
      dutch: {
        narrative: 'Een plotselinge infrastructuurcrisis vereist directe, praktische budgetherverdelingsbesluiten met efficiënte implementatie.',
        keyDecisionPoints: [
          'Directe analyse van beschikbare budgetopties',
          'Pragmatische prioritering gebaseerd op werkelijke impact',
          'Snelle besluitvorming met duidelijke verantwoordelijkheden',
          'Efficiënte communicatie naar alle betrokkenen'
        ],
        culturalNuances: [
          'Directheid - eerlijke, open communicatie over beperkingen',
          'Pragmatisme - praktische oplossingen boven theoretische perfectie',
          'Resultaatgerichtheid - focus op meetbare verbeteringen'
        ],
        professionalTerminology: {
          'emergency': 'noodsituatie',
          'efficiency': 'efficiëntie',
          'allocation': 'toewijzing',
          'practical': 'praktisch'
        },
        expectedOutcomes: [
          'Snelle, praktische oplossing die direct resultaat oplevert',
          'Transparante communicatie over trade-offs en beperkingen',
          'Efficiënte implementatie met meetbare verbeteringen'
        ],
        stakeholderConsiderations: [
          'Gemeenteraad wordt geïnformeerd via directe, duidelijke rapportage',
          'Bewoners krijgen eerlijke informatie over impact en tijdlijn',
          'Vakbonden worden direct betrokken bij personele gevolgen'
        ]
      }
    },
    complexityLevel: 'advanced',
    municipalDomain: 'budget_planning'
  }
];

// Cross-Cultural Professional Insights
const crossCulturalInsights: CrossCulturalInsight[] = [
  {
    id: 'consensus_vs_efficiency',
    insight: 'Svenska konsensusprocesser tar längre tid men skapar starkare genomförande, medan Nederlands direkthet ger snabbare resultat men kan kräva mer övertalning senare.',
    applicableContexts: ['swedish', 'dutch'],
    professionalImplication: 'Ledare måste anpassa tidsramar och förväntningar baserat på kulturell kontext för optimal resultat.',
    implementationStrategy: 'Planera 40% mer tid för svenska processer, 25% mindre för nederländska, men inkludera uppföljningsmöten.',
    measurableOutcome: 'Projekttider optimerade per kulturell kontext med 15% förbättrad genomförandegrad.',
    validationMethod: 'Spåra projektframgång och stakeholder-tillfredställelse per kulturell anpassningsmetod.'
  },
  {
    id: 'hierarchy_navigation',
    insight: 'Franska och tyska system kräver formell hierarkisk respekt, medan svenska och nederländska kulturer värdesätter plattare strukturer.',
    applicableContexts: ['french', 'german', 'swedish', 'dutch'],
    professionalImplication: 'Kommunikationsstrategier måste anpassas för hierarkisk appropriateness och beslutsfattande-effektivitet.',
    implementationStrategy: 'Utveckla kulturspecifika eskaleringsprotokoll och kommunikationskanaler för varje municipal kontext.',
    measurableOutcome: 'Förbättrad beslutsfattande-hastighet och reducerade kommunikationsmissförstånd med 30%.',
    validationMethod: 'Mät beslutsfattande-cykeltider och kvalitetsmetriker per kulturell anpassningsstrategi.'
  },
  {
    id: 'innovation_balance',
    insight: 'Nederlands bold innovation approach måste balanseras med svensk consensus-building och tysk systematic validation för europeisk municipal success.',
    applicableContexts: ['dutch', 'swedish', 'german'],
    professionalImplication: 'Innovationsprocesser kräver kulturell hybridisering för att maximera både kreativitet och genomförbarhet.',
    implementationStrategy: 'Integrera nederländsk brainstorming, svensk consensus-validering och tysk implementation-rigour.',
    measurableOutcome: 'Innovationsprojekt med 45% högre framgångsgrad och bredare stakeholder-acceptans.',
    validationMethod: 'Utvärdera innovationsframgång, tid-till-implementation och långsiktig hållbarhet.'
  }
];

interface CulturalIntelligenceMetricsProps {
  contextData: CulturalContextData[];
  selectedContext: string;
}

const CulturalIntelligenceMetrics: React.FC<CulturalIntelligenceMetricsProps> = ({
  contextData,
  selectedContext
}) => {
  const { currentTheme } = useCulturalTheme();

  if (!currentContext) return null;


  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                Cultural Intelligence Assessment
              </Text>
              <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                {currentContext.displayName} - Advanced Professional Adaptation
              </Text>
            </VStack>
            <Badge colorScheme="blue" variant="solid" p={2} borderRadius="lg">
              {Math.round((currentContext.adaptationScore + currentContext.authenticity + currentContext.professionalRelevance) / 3)}% Overall
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6}>
            
            {/* Metrics Grid */}
            <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%">
              {metricCategories.map((metric, index) => (
                <VStack key={metric.label} spacing={3}>
                  <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.text.primary} textAlign="center">
                    {metric.label}
                  </Text>
                  <Box position="relative" w="100px" h="100px">
                    <Progress
                      value={metric.value}
                      colorScheme={metric.color}
                      size="lg"
                      borderRadius="full"
                      transform="rotate(-90deg)"
                      w="100px"
                      h="4"
                      position="absolute"
                      top="48px"
                      left="0"
                      bg={currentTheme.colors.accent + '20'}
                    />
                    <Flex
                      position="absolute"
                      top="0"
                      left="0"
                      w="100px"
                      h="100px"
                      align="center"
                      justify="center"
                    >
                      <Text fontSize="xl" fontWeight="800" color={`${metric.color}.500`}>
                        {metric.value}%
                      </Text>
                    </Flex>
                  </Box>
                </VStack>
              ))}
            </Grid>

            {/* Cultural Characteristics */}
            <VStack spacing={4} w="100%">
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary}>
                Primary Cultural Values
              </Text>
              <Grid templateColumns="repeat(5, 1fr)" gap={2} w="100%">
                {currentContext.primaryValues.map((value, index) => (
                  <Badge
                    key={index}
                    colorScheme="blue"
                    variant="outline"
                    p={2}
                    borderRadius="md"
                    textAlign="center"
                    fontSize="xs"
                  >
                    {value}
                  </Badge>
                ))}
              </Grid>
            </VStack>

            {/* Professional Context */}
            <Grid templateColumns="repeat(2, 1fr)" gap={4} w="100%">
              <VStack spacing={2}>
                <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.text.primary}>
                  Communication Style
                </Text>
                <Badge colorScheme="green" variant="solid" p={2} borderRadius="lg">
                  {currentContext.communicationStyle}
                </Badge>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.text.primary}>
                  Decision Making
                </Text>
                <Badge colorScheme="purple" variant="solid" p={2} borderRadius="lg">
                  {currentContext.decisionMaking}
                </Badge>
              </VStack>
            </Grid>

          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
};

interface MunicipalScenarioAdaptationViewProps {
  scenario: MunicipalScenarioAdaptation;
  selectedContext: string;
}

const MunicipalScenarioAdaptationView: React.FC<MunicipalScenarioAdaptationViewProps> = ({
  scenario,
  selectedContext
}) => {
  const { currentTheme } = useCulturalTheme();

  if (!adaptation) return null;

  return (
    <MotionBox
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.accent + '30'}>
        <CardHeader>
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                {scenario.scenarioName}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="outline">
                  {scenario.municipalDomain.replace('_', ' ')}
                </Badge>
                <Badge colorScheme="purple" variant="outline">
                  {scenario.complexityLevel}
                </Badge>
              </HStack>
            </VStack>
            <Icon as={FiTarget} w={8} h={8} color={currentTheme.colors.primary} />
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={6} align="stretch">
            
            {/* Adapted Narrative */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={3}>
                Cultural Adaptation
              </Text>
              <Text fontSize="sm" color={currentTheme.colors.text.primary} lineHeight="tall">
                {adaptation.narrative}
              </Text>
            </Box>

            {/* Key Decision Points */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={3}>
                Kulturella Beslutspunkter
              </Text>
              <VStack spacing={2} align="stretch">
                {adaptation.keyDecisionPoints.map((point, index) => (
                  <HStack key={index} spacing={3} align="start">
                    <Icon as={FiZap} w={4} h={4} color={currentTheme.colors.accent} flexShrink={0} mt={0.5} />
                    <Text fontSize="sm" color={currentTheme.colors.text.primary} lineHeight="short">
                      {point}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Cultural Nuances */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={3}>
                Kulturella Nyanser
              </Text>
              <Grid templateColumns="1fr" gap={3}>
                {adaptation.culturalNuances.map((nuance, index) => (
                  <Box
                    key={index}
                    p={3}
                    bg={currentTheme.colors.accent + '10'}
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderLeftColor={currentTheme.colors.accent}
                  >
                    <Text fontSize="sm" color={currentTheme.colors.text.primary} fontStyle="italic">
                      {nuance}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </Box>

            {/* Expected Outcomes */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={3}>
                Förväntade Resultat
              </Text>
              <VStack spacing={2} align="stretch">
                {adaptation.expectedOutcomes.map((outcome, index) => (
                  <HStack key={index} spacing={3} align="start">
                    <Icon as={FiAward} w={4} h={4} color="green.500" flexShrink={0} mt={0.5} />
                    <Text fontSize="sm" color={currentTheme.colors.text.primary} lineHeight="short">
                      {outcome}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
};

interface CrossCulturalInsightsViewProps {
  insights: CrossCulturalInsight[];
  activeContexts: string[];
}

const CrossCulturalInsightsView: React.FC<CrossCulturalInsightsViewProps> = ({
  insights,
  activeContexts
}) => {
  const { currentTheme } = useCulturalTheme();
  

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
        Cross-Cultural Professional Insights
      </Text>
      
      {relevantInsights.map((insight, index) => (
        <MotionCard
          key={insight.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          bg={currentTheme.colors.surface}
          borderColor={currentTheme.colors.primary + '20'}
        >
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              
              {/* Insight Header */}
              <HStack justify="space-between">
                <HStack spacing={2}>
                  <Icon as={FiGlobe} w={6} h={6} color={currentTheme.colors.primary} />
                  <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary}>
                    Cross-Cultural Insight #{index + 1}
                  </Text>
                </HStack>
                <HStack spacing={1}>
                  {insight.applicableContexts.map(context => (
                    <Badge key={context} colorScheme="blue" size="sm" variant="outline">
                      {context}
                    </Badge>
                  ))}
                </HStack>
              </HStack>

              {/* Main Insight */}
              <Box
                p={4}
                bg={currentTheme.colors.accent + '10'}
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor={currentTheme.colors.accent}
              >
                <Text fontSize="md" color={currentTheme.colors.text.primary} lineHeight="tall" fontWeight="500">
                  {insight.insight}
                </Text>
              </Box>

              {/* Implementation Strategy */}
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary}>
                    Professional Implication
                  </Text>
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} lineHeight="short">
                    {insight.professionalImplication}
                  </Text>
                </VStack>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary}>
                    Implementation Strategy
                  </Text>
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} lineHeight="short">
                    {insight.implementationStrategy}
                  </Text>
                </VStack>
              </Grid>

              {/* Measurable Outcome */}
              <HStack spacing={3} p={3} bg="green.50" borderRadius="md">
                <Icon as={FiTrendingUp} w={5} h={5} color="green.500" />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontSize="sm" fontWeight="600" color="green.700">
                    Measurable Outcome
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    {insight.measurableOutcome}
                  </Text>
                </VStack>
              </HStack>

            </VStack>
          </CardBody>
        </MotionCard>
      ))}
    </VStack>
  );
};

interface AdvancedCulturalIntelligenceProps {
  onCulturalInsightGenerated?: (insight: CrossCulturalInsight) => void;
  onScenarioAdaptationComplete?: (scenarioId: string, culturalContext: string) => void;
}

export const AdvancedCulturalIntelligence: React.FC<AdvancedCulturalIntelligenceProps> = ({
  onCulturalInsightGenerated = () => console.log('Cultural insight generated'),
  onScenarioAdaptationComplete = () => console.log('Scenario adaptation completed')
}) => {
  const { currentTheme, culturalContext } = useCulturalTheme();
  const [selectedContext, setSelectedContext] = useState(culturalContext);
  const [selectedScenario, setSelectedScenario] = useState(sampleMunicipalScenarios[0]);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(true);
  const [adaptationIntensity, setAdaptationIntensity] = useState(75);

  // Update selected context when cultural context changes
  useEffect(() => {
    setSelectedContext(culturalContext);
  }, [culturalContext]);

};
