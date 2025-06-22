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
  Grid,
  Progress,
  useColorModeValue,
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
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFlag,
  FiUsers,
  FiBuilding,
  FiShield,
  FiBookOpen,
  FiTrendingUp,
  FiTarget,
  FiGlobe,
  FiAward,
  FiCheck,
  FiPlay,
  FiStar,
  FiHeart,
  FiZap,
  FiMapPin,
  FiClock,
  FiBarChart3
} from 'react-icons/fi';

import { useCulturalTheme } from '../WorldHub/CulturalThemeProvider';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Swedish Municipal Demo Scenarios
interface SwedishDemoScenario {
  id: string;
  title: string;
  subtitle: string;
  municipality: string;
  region: 'Stockholm' | 'Göteborg' | 'Malmö' | 'Regional';
  world: 'emergency' | 'budget' | 'digital' | 'stakeholder' | 'compliance';
  description: string;
  swedishContext: string;
  lagomPrinciples: string[];
  kommunallawCompliance: string;
  consensusBuilding: string;
  swedishTerminology: {
    [key: string]: string;
  };
  stakeholderTypes: string[];
  demoFlow: DemoFlowStep[];
  culturalAuthenticity: number;
  governmentImpact: number;
  lagomBalance: number;
  expectedOutcome: string;
  followUpMaterials: string[];
}

interface DemoFlowStep {
  step: number;
  title: string;
  swedishTitle: string;
  duration: number;
  action: string;
  lagomApproach: string;
  expectedReaction: string;
  culturalNuance: string;
}

// Comprehensive Swedish Municipal Demo Scenarios
const swedishDemoScenarios: SwedishDemoScenario[] = [
  {
    id: 'stockholm_emergency_coordination',
    title: 'Stockholm Emergency Response Coordination Excellence',
    subtitle: 'Lagom-balanced crisis management med consensus-driven protocols',
    municipality: 'Stockholm Stad',
    region: 'Stockholm',
    world: 'emergency',
    description: 'Comprehensive emergency response coordination showcasing Swedish lagom balance between rapid response och thoughtful consensus building in crisis situations.',
    swedishContext: 'Stockholm Som Europas mest innovativa huvudstad kräver emergency response som balanserar snabb handling med genomtänkt samarbete. Lagom innebär att vi varken överreagerar eller underreagerar - vi hittar den perfekta balansen.',
    lagomPrinciples: [
      'Balanserad krisrespons - varken panik eller tröghet',
      'Måttlig resursallokering - rätt mängd vid rätt tidpunkt',
      'Inkluderande beslutsfattande även under press',
      'Hållbar efterhantering som tar hänsyn till alla berörda'
    ],
    kommunallawCompliance: 'Följer Kommunallagen 2017:725 för krisberedskap och räddningstjänst enligt 2§ kommunal kompetens och 3§ likställighetsprincipen.',
    consensusBuilding: 'Använder Swedish consensus model även i krissituationer - snabb konsultation med nyckelintressenter innan kritiska beslut, säkerställer bred accept av åtgärder.',
    swedishTerminology: {
      'Krisberedskap': 'Emergency preparedness with Swedish systematic approach',
      'Samverkan': 'Collaborative coordination between agencies',
      'Räddningstjänst': 'Municipal rescue services coordination',
      'Krishantering': 'Crisis management with consensus elements',
      'Säkerhetsskydd': 'Security protection protocols'
    },
    stakeholderTypes: [
      'Kommunstyrelseordförande (Municipal board chair)',
      'Säkerhetschef (Security chief)',
      'Räddningschef (Rescue service chief)',
      'Kommunikatör (Communications coordinator)',
      'Medborgarrepresentant (Citizen representative)'
    ],
    demoFlow: [
      {
        step: 1,
        title: 'Crisis Situation Recognition',
        swedishTitle: 'Krislägesidentifiering',
        duration: 45,
        action: 'Demonstrate AI-driven crisis detection with Swedish municipal protocols',
        lagomApproach: 'Balanced assessment - thorough but not over-analytical',
        expectedReaction: 'Government officials appreciate systematic yet timely approach',
        culturalNuance: 'Swedish preference for careful evaluation before action'
      },
      {
        step: 2,
        title: 'Stakeholder Consensus Building',
        swedishTitle: 'Intressentsamverkan',
        duration: 60,
        action: 'Show rapid consensus-building tools for emergency decisions',
        lagomApproach: 'Quick consultation without delaying critical response',
        expectedReaction: 'Recognition of Swedish democratic values even in crisis',
        culturalNuance: 'Demonstrates understanding of Swedish collective decision-making'
      },
      {
        step: 3,
        title: 'Coordinated Response Execution',
        swedishTitle: 'Samordnad responsverkställighet',
        duration: 90,
        action: 'Live coordination dashboard with multi-agency integration',
        lagomApproach: 'Optimal resource allocation - sufficient but not excessive',
        expectedReaction: 'Appreciation for measured, well-coordinated approach',
        culturalNuance: 'Swedish efficiency without waste or excess'
      },
      {
        step: 4,
        title: 'Community Communication',
        swedishTitle: 'Medborgarkommunikation',
        duration: 30,
        action: 'Transparent public communication with cultural sensitivity',
        lagomApproach: 'Clear information without causing unnecessary alarm',
        expectedReaction: 'Government officials value transparent yet calm approach',
        culturalNuance: 'Swedish openness balanced with responsibility'
      }
    ],
    culturalAuthenticity: 96,
    governmentImpact: 94,
    lagomBalance: 98,
    expectedOutcome: 'Government recognition of Swedish cultural values integration with modern emergency management excellence',
    followUpMaterials: [
      'Kommunallag compliance report',
      'Stockholm Stad integration blueprint',
      'Crisis management cultural guide',
      'Consensus-building protocol documentation'
    ]
  },
  {
    id: 'goteborg_budget_consensus',
    title: 'Göteborg Collaborative Budget Planning Excellence',
    subtitle: 'Transparent financial planning med inkluderande demokratiska processer',
    municipality: 'Göteborgs Stad',
    region: 'Göteborg',
    world: 'budget',
    description: 'Comprehensive budget planning showcase demonstrating Swedish collaborative approach to municipal financial management with transparency and consensus-building.',
    swedishContext: 'Göteborg som Sveriges andra stad exemplifierar collaborative budget planning där alla röster hörs. Lagom budget planning innebär att balansera ambitioner med realism, investering med sparsamhet.',
    lagomPrinciples: [
      'Balanserade budgetprioriteringar - varken för konservativt eller för aggressivt',
      'Inkluderande budgetprocess som hör alla intressenter',
      'Transparent ekonomisk kommunikation till medborgare',
      'Hållbar finansiell planering för framtida generationer'
    ],
    kommunallawCompliance: 'Följer Kommunallagen 5 kap. för ekonomisk förvaltning och 8 kap. för medborgarinflytande i budgetprocessen.',
    consensusBuilding: 'Implementerar participatory budgeting med Swedish consensus model - strukturerade dialogprocesser där alla politiska partier och medborgargrupper kan påverka.',
    swedishTerminology: {
      'Budgetprocess': 'Municipal budget planning process',
      'Medborgarinflytande': 'Citizen participation in governance',
      'Finansiell hållbarhet': 'Financial sustainability planning',
      'Verksamhetsplanering': 'Operational activity planning',
      'Ekonomistyrning': 'Financial management and control'
    },
    stakeholderTypes: [
      'Kommunalråd (Municipal councillor)',
      'Ekonomichef (Finance director)',
      'Förvaltningschef (Department head)',
      'Oppositionsrepresentant (Opposition representative)',
      'Medborgargrupp (Citizen group representative)'
    ],
    demoFlow: [
      {
        step: 1,
        title: 'Collaborative Budget Initiation',
        swedishTitle: 'Gemensam budgetinitiering',
        duration: 60,
        action: 'Multi-stakeholder budget planning dashboard launch',
        lagomApproach: 'Inclusive process that balances efficiency with participation',
        expectedReaction: 'Government officials appreciate democratic integration',
        culturalNuance: 'Swedish commitment to collective decision-making'
      },
      {
        step: 2,
        title: 'Transparent Financial Analysis',
        swedishTitle: 'Transparent ekonomisk analys',
        duration: 75,
        action: 'Real-time financial data visualization with citizen accessibility',
        lagomApproach: 'Complete transparency without overwhelming complexity',
        expectedReaction: 'Recognition of Swedish openness values',
        culturalNuance: 'Swedish trust-building through transparency'
      },
      {
        step: 3,
        title: 'Consensus-Building Facilitation',
        swedishTitle: 'Konsensusbyggande facilitering',
        duration: 90,
        action: 'AI-assisted consensus finding for budget priorities',
        lagomApproach: 'Finding compromise solutions that satisfy collective needs',
        expectedReaction: 'Appreciation for Swedish conflict resolution approach',
        culturalNuance: 'Swedish preference for win-win solutions'
      },
      {
        step: 4,
        title: 'Sustainable Planning Integration',
        swedishTitle: 'Hållbar planeringsintegration',
        duration: 45,
        action: 'Long-term sustainability impact assessment',
        lagomApproach: 'Balanced consideration of present needs and future responsibility',
        expectedReaction: 'Government officials value forward-thinking approach',
        culturalNuance: 'Swedish environmental and social responsibility'
      }
    ],
    culturalAuthenticity: 95,
    governmentImpact: 96,
    lagomBalance: 97,
    expectedOutcome: 'Government recognition of advanced democratic participation technology aligned with Swedish values',
    followUpMaterials: [
      'Participatory budgeting framework',
      'Göteborg integration strategy',
      'Democratic process enhancement guide',
      'Financial transparency protocol'
    ]
  },
  {
    id: 'malmo_digital_innovation',
    title: 'Malmö Digital Transformation Cultural Bridge',
    subtitle: 'Innovative digitalisering med cultural sensitivity för mångkulturell kommun',
    municipality: 'Malmö Stad',
    region: 'Malmö',
    world: 'digital',
    description: 'Digital transformation excellence showcasing Swedish innovation approach while respecting multicultural municipal context and ensuring inclusive digital development.',
    swedishContext: 'Malmö som Sveriges mest mångkulturella stad visar hur Swedish digital transformation kan vara inkluderande och culturally sensitive. Lagom digitalisering balanserar innovation med tillgänglighet för alla.',
    lagomPrinciples: [
      'Balanserad digitalisering - inte för snabb, inte för långsam',
      'Inkluderande teknologi som når alla medborgare',
      'Cultural sensitivity i alla digitala lösningar',
      'Hållbar digital utveckling som inte lämnar någon utanför'
    ],
    kommunallawCompliance: 'Följer Kommunallagen 1 kap. 9§ för likabehandling och 2§ för kommunal service till alla invånare oavsett bakgrund.',
    consensusBuilding: 'Använder multicultural consensus approach - involverar olika cultural communities i digital planning för att säkerställa broad acceptance.',
    swedishTerminology: {
      'Digitalisering': 'Digital transformation process',
      'Tillgänglighet': 'Accessibility for all citizens',
      'Mångfald': 'Diversity and inclusion',
      'Digital delaktighet': 'Digital participation and inclusion',
      'Innovationsprocess': 'Innovation development process'
    },
    stakeholderTypes: [
      'IT-chef (IT director)',
      'Mångfaldschef (Diversity coordinator)',
      'Digitaliseringsstrateg (Digital strategy coordinator)',
      'Medborgarrepresentant (Citizen representative)',
      'Integrationsansvarig (Integration responsible)'
    ],
    demoFlow: [
      {
        step: 1,
        title: 'Inclusive Digital Assessment',
        swedishTitle: 'Inkluderande digital kartläggning',
        duration: 50,
        action: 'Multi-cultural digital needs assessment tools',
        lagomApproach: 'Thorough but accessible evaluation process',
        expectedReaction: 'Appreciation for inclusive Swedish approach',
        culturalNuance: 'Swedish commitment to leaving no one behind'
      },
      {
        step: 2,
        title: 'Cultural Bridge Technology',
        swedishTitle: 'Kulturbrygga teknologi',
        duration: 70,
        action: 'AI-powered cultural adaptation in real-time',
        lagomApproach: 'Technology that connects rather than divides',
        expectedReaction: 'Recognition of Swedish innovation with humanity',
        culturalNuance: 'Swedish balance of technology and human values'
      },
      {
        step: 3,
        title: 'Community Co-Creation',
        swedishTitle: 'Gemensam skapandeprocess',
        duration: 85,
        action: 'Collaborative digital solution development',
        lagomApproach: 'Innovation through collective wisdom',
        expectedReaction: 'Government officials value participatory approach',
        culturalNuance: 'Swedish belief in collective problem-solving'
      },
      {
        step: 4,
        title: 'Sustainable Digital Future',
        swedishTitle: 'Hållbar digital framtid',
        duration: 40,
        action: 'Long-term digital inclusion strategy presentation',
        lagomApproach: 'Measured progress ensuring no one is left behind',
        expectedReaction: 'Appreciation for Swedish social responsibility',
        culturalNuance: 'Swedish commitment to collective welfare'
      }
    ],
    culturalAuthenticity: 94,
    governmentImpact: 95,
    lagomBalance: 96,
    expectedOutcome: 'Government recognition of Swedish innovation model that prioritizes inclusion and cultural sensitivity',
    followUpMaterials: [
      'Multicultural digital strategy',
      'Malmö integration case study',
      'Inclusive innovation framework',
      'Cultural sensitivity protocol'
    ]
  },
  {
    id: 'regional_stakeholder_cooperation',
    title: 'Regional Stakeholder Cooperation Excellence',
    subtitle: 'Cross-municipal collaboration med Swedish samverkan principles',
    municipality: 'Regional Samverkan',
    region: 'Regional',
    world: 'stakeholder',
    description: 'Inter-municipal cooperation showcase demonstrating Swedish collaborative governance model for regional challenges and shared resource optimization.',
    swedishContext: 'Regional samverkan exemplifierar Swedish approach till shared challenges. Lagom cooperation balanserar local autonomy med collective benefit, municipal independence med regional solidarity.',
    lagomPrinciples: [
      'Balanserat regionalt samarbete - varken centralisering eller fragmentering',
      'Respekt för kommunal självbestämmelse inom regional ram',
      'Rättvis resursfördelning mellan kommuner',
      'Långsiktig regional utveckling med lokal förankring'
    ],
    kommunallawCompliance: 'Följer Kommunallagen 3 kap. för interkommunalt samarbete och 9 kap. för gemensam nämnd bildning.',
    consensusBuilding: 'Regional consensus model där alla municipalities har voice i decision-making, ensuring local concerns are balanced med regional benefits.',
    swedishTerminology: {
      'Samverkan': 'Collaborative cooperation',
      'Regional utveckling': 'Regional development planning',
      'Kommunalt samarbete': 'Inter-municipal cooperation',
      'Resursoptimering': 'Resource optimization',
      'Gemensam nämnd': 'Joint municipal committee'
    },
    stakeholderTypes: [
      'Regionråd (Regional council representative)',
      'Kommunstyrelseordförande (Multiple municipal chairs)',
      'Samordningsansvarig (Coordination responsible)',
      'Näringslivschef (Business development coordinator)',
      'Medborgarnätverksrepresentant (Citizen network representative)'
    ],
    demoFlow: [
      {
        step: 1,
        title: 'Regional Challenge Identification',
        swedishTitle: 'Regional utmaningsidentifiering',
        duration: 55,
        action: 'Collaborative problem-mapping across municipalities',
        lagomApproach: 'Comprehensive but focused challenge assessment',
        expectedReaction: 'Recognition of systematic Swedish approach',
        culturalNuance: 'Swedish thoroughness in problem analysis'
      },
      {
        step: 2,
        title: 'Multi-Municipal Consensus Building',
        swedishTitle: 'Flerkommunal konsensusbyggande',
        duration: 80,
        action: 'AI-facilitated inter-municipal agreement finding',
        lagomApproach: 'Solutions that benefit all without harming any',
        expectedReaction: 'Appreciation for Swedish conflict resolution',
        culturalNuance: 'Swedish preference for collective solutions'
      },
      {
        step: 3,
        title: 'Resource Sharing Optimization',
        swedishTitle: 'Resursdelningsoptimering',
        duration: 65,
        action: 'Dynamic resource allocation across municipal boundaries',
        lagomApproach: 'Efficient sharing without creating dependency',
        expectedReaction: 'Government officials value cooperative efficiency',
        culturalNuance: 'Swedish balance of independence and cooperation'
      },
      {
        step: 4,
        title: 'Sustainable Regional Planning',
        swedishTitle: 'Hållbar regional planering',
        duration: 50,
        action: 'Long-term regional development visualization',
        lagomApproach: 'Growth that strengthens rather than destabilizes',
        expectedReaction: 'Recognition of Swedish sustainability commitment',
        culturalNuance: 'Swedish responsibility for future generations'
      }
    ],
    culturalAuthenticity: 97,
    governmentImpact: 93,
    lagomBalance: 95,
    expectedOutcome: 'Government appreciation for technology that strengthens Swedish democratic cooperation model',
    followUpMaterials: [
      'Regional cooperation framework',
      'Inter-municipal agreement templates',
      'Resource sharing optimization guide',
      'Swedish governance model documentation'
    ]
  },
  {
    id: 'national_compliance_excellence',
    title: 'National Compliance Excellence Framework',
    subtitle: 'Comprehensive regelefterlevnad med svensk transparens och rättssäkerhet',
    municipality: 'National Framework',
    region: 'Stockholm',
    world: 'compliance',
    description: 'National-level compliance framework showcasing Swedish approach to regulatory excellence, transparency, and legal security in municipal governance.',
    swedishContext: 'National compliance framework visar Swedish commitment till rättssäkerhet och transparens. Lagom compliance balanserar thorough adherence med practical implementation, legal security med operational efficiency.',
    lagomPrinciples: [
      'Balanserad regelefterlevnad - grundlig men inte byråkratisk',
      'Transparent compliance som bygger förtroende',
      'Proaktiv regelhantering som förebygger problem',
      'Rättssäker implementering som skyddar alla parter'
    ],
    kommunallawCompliance: 'Comprehensive framework covering all aspects av Kommunallagen, GDPR, Offentlighets- och sekretesslagen, och EU municipal directives.',
    consensusBuilding: 'National consensus on compliance standards utvecklat genom broad consultation med municipalities, legal experts, och citizen representatives.',
    swedishTerminology: {
      'Regelefterlevnad': 'Regulatory compliance',
      'Rättssäkerhet': 'Legal security and protection',
      'Transparens': 'Transparency and openness',
      'Offentlighetsprincipen': 'Principle of public access',
      'Dataskydd': 'Data protection and privacy'
    },
    stakeholderTypes: [
      'Jurist (Municipal legal counsel)',
      'Dataskyddsombud (Data protection officer)',
      'Kanslichef (Municipal chief executive)',
      'Revisionsansvarig (Audit responsible)',
      'Regeringsrepresentant (Government representative)'
    ],
    demoFlow: [
      {
        step: 1,
        title: 'Comprehensive Compliance Mapping',
        swedishTitle: 'Omfattande compliance-kartläggning',
        duration: 60,
        action: 'AI-powered regulatory requirement analysis',
        lagomApproach: 'Thorough coverage without overwhelming complexity',
        expectedReaction: 'Government officials appreciate systematic approach',
        culturalNuance: 'Swedish respect for rule of law'
      },
      {
        step: 2,
        title: 'Transparent Implementation',
        swedishTitle: 'Transparent implementering',
        duration: 70,
        action: 'Open compliance process with citizen accessibility',
        lagomApproach: 'Complete transparency balanced with practical operation',
        expectedReaction: 'Recognition of Swedish openness commitment',
        culturalNuance: 'Swedish principle of public access'
      },
      {
        step: 3,
        title: 'Proactive Risk Management',
        swedishTitle: 'Proaktiv riskhantering',
        duration: 55,
        action: 'Predictive compliance monitoring and prevention',
        lagomApproach: 'Preventive approach that avoids over-regulation',
        expectedReaction: 'Appreciation for Swedish forward-thinking',
        culturalNuance: 'Swedish preference for prevention over correction'
      },
      {
        step: 4,
        title: 'Legal Security Assurance',
        swedishTitle: 'Rättssäkerhetsgaranti',
        duration: 45,
        action: 'Comprehensive legal protection verification',
        lagomApproach: 'Strong protection without creating barriers',
        expectedReaction: 'Government confidence in legal security',
        culturalNuance: 'Swedish commitment to protecting all citizens'
      }
    ],
    culturalAuthenticity: 98,
    governmentImpact: 97,
    lagomBalance: 94,
    expectedOutcome: 'Government recognition of technology platform that strengthens Swedish legal and democratic traditions',
    followUpMaterials: [
      'National compliance framework documentation',
      'Legal security assessment report',
      'Transparency implementation guide',
      'Swedish governance protection protocol'
    ]
  }
];

// Swedish Demo Scenario Card Component
interface SwedishScenarioCardProps {
  scenario: SwedishDemoScenario;
  onSelect?: (scenario: SwedishDemoScenario) => void;
  isSelected?: boolean;
}

const SwedishDemoScenarioCard: React.FC<SwedishScenarioCardProps> = ({
  scenario,
  onSelect = () => {},
  isSelected = false
}) => {
  const swedishBlue = '#003366';
  const swedishYellow = '#FFCC00';

  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      cursor="pointer"
      onClick={() => onSelect(scenario)}
      bg={isSelected ? 'blue.50' : 'white'}
      borderColor={isSelected ? swedishBlue : 'gray.200'}
      borderWidth="2px"
      boxShadow={isSelected ? `0 8px 25px ${swedishBlue}30` : 'md'}
      _hover={{
        boxShadow: `0 12px 35px ${swedishBlue}40`
      }}
      transition="all 0.3s ease"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          
          {/* Swedish Flag Pattern Header */}
          <Box
            position="relative"
            p={4}
            bg={`linear-gradient(135deg, ${swedishBlue} 0%, ${swedishBlue} 100%)`}
            color="white"
            borderRadius="lg"
            overflow="hidden"
          >
            {/* Swedish Flag Cross Pattern */}
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              backgroundImage={`linear-gradient(90deg, transparent 35%, ${swedishYellow} 35%, ${swedishYellow} 45%, transparent 45%),
                               linear-gradient(0deg, transparent 35%, ${swedishYellow} 35%, ${swedishYellow} 45%, transparent 45%)`}
              opacity={0.3}
            />
            
            <VStack spacing={2} position="relative" zIndex={1}>
              <HStack justify="space-between" w="100%">
                <Badge bg={swedishYellow} color={swedishBlue} variant="solid" px={3} py={1}>
                  {scenario.region}
                </Badge>
                <Badge colorScheme="blue" variant="outline" color="white">
                  {scenario.world}
                </Badge>
              </HStack>
              
              <Text fontSize="lg" fontWeight="700" textAlign="center" lineHeight="tight">
                {scenario.title}
              </Text>
              
              <Text fontSize="sm" opacity={0.9} textAlign="center">
                {scenario.subtitle}
              </Text>
            </VStack>
          </Box>

          {/* Municipality & Context */}
          <VStack spacing={3} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiMapPin} w={4} h={4} color={swedishBlue} />
              <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                {scenario.municipality}
              </Text>
            </HStack>
            
            <Text fontSize="sm" color="gray.700" lineHeight="tall" noOfLines={3}>
              {scenario.description}
            </Text>
          </VStack>

          {/* Cultural Metrics */}
          <Grid templateColumns="repeat(3, 1fr)" gap={3}>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="800" color="blue.500">
                {scenario.culturalAuthenticity}%
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Cultural Authenticity
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="800" color="green.500">
                {scenario.governmentImpact}%
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Government Impact
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="lg" fontWeight="800" color="orange.500">
                {scenario.lagomBalance}%
              </Text>
              <Text fontSize="xs" color="gray.600" textAlign="center">
                Lagom Balance
              </Text>
            </VStack>
          </Grid>

          {/* Lagom Principles Preview */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color={swedishBlue} mb={2}>
              Lagom Principles:
            </Text>
            <VStack spacing={1} align="stretch">
              {scenario.lagomPrinciples.slice(0, 2).map((principle, index) => (
                <HStack key={index} spacing={2}>
                  <Icon as={FiCheck} w={3} h={3} color="green.500" />
                  <Text fontSize="xs" color="gray.700" noOfLines={1}>
                    {principle}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Demo Flow Summary */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={FiClock} w={4} h={4} color={swedishBlue} />
              <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                {scenario.demoFlow.reduce((sum, step) => sum + step.duration, 0)} min demo
              </Text>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              {scenario.demoFlow.length} steg
            </Text>
          </HStack>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Swedish Demo Portfolio Overview
const SwedishDemoPortfolioOverview: React.FC = () => {
  const swedishBlue = '#003366';
  const swedishYellow = '#FFCC00';

  const avgCulturalAuthenticity = Math.round(
    swedishDemoScenarios.reduce((sum, scenario) => sum + scenario.culturalAuthenticity, 0) / 
    swedishDemoScenarios.length
  );

  const avgGovernmentImpact = Math.round(
    swedishDemoScenarios.reduce((sum, scenario) => sum + scenario.governmentImpact, 0) / 
    swedishDemoScenarios.length
  );

  const avgLagomBalance = Math.round(
    swedishDemoScenarios.reduce((sum, scenario) => sum + scenario.lagomBalance, 0) / 
    swedishDemoScenarios.length
  );

  return (
    <Card bg="blue.50" borderColor="blue.200" borderWidth="2px">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          <HStack spacing={3}>
            <Icon as={FiFlag} w={8} h={8} color={swedishBlue} />
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="800" color={swedishBlue}>
                Swedish Demo Scenario Portfolio Excellence
              </Text>
              <Text fontSize="md" color="gray.600">
                Compelling government demonstrations med authentic Swedish cultural intelligence
              </Text>
            </VStack>
          </HStack>

          {/* Swedish Cultural Intelligence Metrics */}
          <Grid templateColumns="repeat(4, 1fr)" gap={6}>
            <Stat>
              <StatLabel color={swedishBlue}>Scenarios</StatLabel>
              <StatNumber color={swedishBlue}>{swedishDemoScenarios.length}</StatNumber>
              <StatHelpText color="gray.600">Complete demo portfolio</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color={swedishBlue}>Cultural Authenticity</StatLabel>
              <StatNumber color="blue.500">{avgCulturalAuthenticity}%</StatNumber>
              <StatHelpText color="gray.600">
                <StatArrow type="increase" />
                Exceptional authenticity
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color={swedishBlue}>Government Impact</StatLabel>
              <StatNumber color="green.500">{avgGovernmentImpact}%</StatNumber>
              <StatHelpText color="gray.600">
                <StatArrow type="increase" />
                High stakeholder value
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color={swedishBlue}>Lagom Balance</StatLabel>
              <StatNumber color="orange.500">{avgLagomBalance}%</StatNumber>
              <StatHelpText color="gray.600">Perfect Swedish balance</StatHelpText>
            </Stat>
          </Grid>

          <Divider />

          {/* Swedish Demo Excellence Highlights */}
          <VStack spacing={4} align="stretch">
            <Text fontSize="lg" fontWeight="700" color={swedishBlue}>
              Swedish Demo Excellence Highlights:
            </Text>
            
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <Icon as={FiHeart} w={5} h={5} color="red.500" />
                  <Text fontSize="md" fontWeight="600" color={swedishBlue}>
                    Lagom Cultural Integration
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                  Every scenario incorporates authentic Swedish lagom principles - balanced, 
                  moderate, inclusive approach that resonates med Swedish government officials.
                </Text>
              </VStack>
              
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <Icon as={FiUsers} w={5} h={5} color="blue.500" />
                  <Text fontSize="md" fontWeight="600" color={swedishBlue}>
                    Consensus-Building Technology
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                  Advanced consensus-building tools that support Swedish democratic decision-making 
                  processes, enhancing rather than replacing traditional Swedish governance.
                </Text>
              </VStack>
              
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <Icon as={FiShield} w={5} h={5} color="green.500" />
                  <Text fontSize="md" fontWeight="600" color={swedishBlue}>
                    Kommunallag Compliance
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                  Complete compliance med Swedish municipal law, demonstrating deep understanding 
                  av Swedish legal framework and governmental requirements.
                </Text>
              </VStack>
              
              <VStack spacing={3} align="stretch">
                <HStack spacing={2}>
                  <Icon as={FiGlobe} w={5} h={5} color="purple.500" />
                  <Text fontSize="md" fontWeight="600" color={swedishBlue}>
                    Regional Cultural Variation
                  </Text>
                </HStack>
                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                  Scenarios adapted för Stockholm, Göteborg, Malmö, and regional contexts, 
                  showing understanding av Swedish municipal diversity.
                </Text>
              </VStack>
            </Grid>

            <Alert status="success" bg={swedishYellow + '20'} borderColor={swedishYellow}>
              <AlertIcon color={swedishBlue} />
              <Box>
                <AlertTitle color={swedishBlue}>Swedish Government Recognition Optimized!</AlertTitle>
                <AlertDescription color={swedishBlue}>
                  Portfolio designed för maximum impact med Swedish government officials, 
                  incorporating authentic cultural values och modern technology excellence.
                </AlertDescription>
              </Box>
            </Alert>

          </VStack>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Main Swedish Demo Scenario Portfolio Component
interface SwedishDemoScenarioPortfolioProps {
  onScenarioSelect?: (scenario: SwedishDemoScenario) => void;
  selectedScenarioId?: string;
}

export const SwedishDemoScenarioPortfolio: React.FC<SwedishDemoScenarioPortfolioProps> = ({
  onScenarioSelect = () => console.log('Swedish demo scenario selected'),
  selectedScenarioId
}) => {
  const [selectedScenario, setSelectedScenario] = useState<SwedishDemoScenario | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleScenarioSelect = (scenario: SwedishDemoScenario) => {
    setSelectedScenario(scenario);
    onScenarioSelect(scenario);
    onOpen();
  };

  // Group scenarios by region
  const scenariosByRegion = useMemo(() => {
    return swedishDemoScenarios.reduce((acc, scenario) => {
      if (!acc[scenario.region]) {
        acc[scenario.region] = [];
      }
      acc[scenario.region].push(scenario);
      return acc;
    }, {} as Record<string, SwedishDemoScenario[]>);
  }, []);

  return (
    <VStack spacing={8} align="stretch">
      
      {/* Swedish Demo Portfolio Overview */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SwedishDemoPortfolioOverview />
      </MotionBox>

      {/* Regional Demo Scenarios */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>Stockholm</Tab>
          <Tab>Göteborg</Tab>
          <Tab>Malmö</Tab>
          <Tab>Regional</Tab>
          <Tab>All Scenarios</Tab>
        </TabList>

        <TabPanels>
          {Object.entries(scenariosByRegion).map(([region, scenarios]) => (
            <TabPanel key={region} p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                <Text fontSize="lg" fontWeight="600" color="gray.700">
                  {region} Demo Scenarios:
                </Text>
                <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                  {scenarios.map((scenario) => (
                    <SwedishDemoScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onSelect={handleScenarioSelect}
                      isSelected={scenario.id === selectedScenarioId}
                    />
                  ))}
                </Grid>
              </VStack>
            </TabPanel>
          ))}
          
          {/* All Scenarios Tab */}
          <TabPanel p={0} pt={6}>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="600" color="gray.700">
                Complete Swedish Demo Scenario Portfolio:
              </Text>
              <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
                {swedishDemoScenarios.map((scenario) => (
                  <SwedishDemoScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    onSelect={handleScenarioSelect}
                    isSelected={scenario.id === selectedScenarioId}
                  />
                ))}
              </Grid>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Scenario Detail Modal would be implemented here */}
      {selectedScenario && (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent bg="white" borderRadius="xl" maxH="90vh" overflowY="auto">
            <ModalHeader bg="blue.50">
              <Text fontSize="xl" fontWeight="700" color="#003366">
                {selectedScenario.title}
              </Text>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody p={6}>
              <Text fontSize="md" color="gray.600">
                Detailed scenario information would be displayed here...
              </Text>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

    </VStack>
  );
};