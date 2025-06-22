import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Icon,
  Button,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiDollarSign,
  FiGlobe,
  FiAward,
  FiBarChart3,
  FiClock,
  FiCheckCircle,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';
import { MunicipalBrandingDisplay } from './MunicipalBrandingSystem';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Executive Dashboard Data Interfaces
interface ROIMetrics {
  totalInvestment: number;
  calculatedReturn: number;
  roiPercentage: number;
  citizenSatisfactionIncrease: number;
  serviceEfficiencyGain: number;
  staffEngagementIncrease: number;
  complianceImprovement: number;
  periodMonths: number;
}

interface ProfessionalDevelopmentMetrics {
  totalParticipants: number;
  activeUsers: number;
  completionRate: number;
  averageSkillIncrease: number;
  certificationAchievements: number;
  crossWorldCompetencyGains: number;
  leadershipReadiness: number;
}

interface EuropeanExpansionMetrics {
  targetMarkets: string[];
  marketPenetration: Record<string, number>;
  revenueProjection: number;
  culturalAdaptationScore: number;
  competitiveAdvantage: number;
  strategicPartnerships: number;
}

interface ExecutiveDashboardData {
  municipalName: string;
  reportingPeriod: string;
  lastUpdated: Date;
  roiMetrics: ROIMetrics;
  professionalMetrics: ProfessionalDevelopmentMetrics;
  europeanMetrics: EuropeanExpansionMetrics;
  keyAchievements: string[];
  strategicRecommendations: string[];
}

// Sample Executive Dashboard Data
const sampleExecutiveDashboard: ExecutiveDashboardData = {
  municipalName: 'Stockholm Kommune',
  reportingPeriod: 'Q4 2024 - Q1 2025',
  lastUpdated: new Date('2025-01-22'),
  roiMetrics: {
    totalInvestment: 450000, // SEK
    calculatedReturn: 810000, // SEK
    roiPercentage: 180,
    citizenSatisfactionIncrease: 18,
    serviceEfficiencyGain: 24,
    staffEngagementIncrease: 320,
    complianceImprovement: 45,
    periodMonths: 6
  },
  professionalMetrics: {
    totalParticipants: 127,
    activeUsers: 108,
    completionRate: 85,
    averageSkillIncrease: 42,
    certificationAchievements: 89,
    crossWorldCompetencyGains: 67,
    leadershipReadiness: 156
  },
  europeanMetrics: {
    targetMarkets: ['Svenska', 'Deutsche', 'Française', 'Nederlandse'],
    marketPenetration: {
      svenska: 15,
      deutsche: 8,
      française: 5,
      nederlandse: 12
    },
    revenueProjection: 20000000, // EUR
    culturalAdaptationScore: 92,
    competitiveAdvantage: 88,
    strategicPartnerships: 4
  },
  keyAchievements: [
    'Överträffat alla Q1 2025 professionella utvecklingsmål',
    'Implementerat omfattande europeisk kulturell intelligens',
    'Uppnått 18% förbättring av medborgarservice',
    'Etablerat strategiska partnerskap med 4 europeiska kommuner'
  ],
  strategicRecommendations: [
    'Expandera till tyska marknaden Q2 2025 för optimal ROI',
    'Implementera avancerad kompetenssyntes för ledarskapsexcellens',
    'Fördjupa kulturell anpassning för konkurrensfördelar',
    'Utveckla gränsöverskridande kommunalt samarbete'
  ]
};

interface ExecutiveROIDisplayProps {
  roiData: ROIMetrics;
  municipalName: string;
}

const ExecutiveROIDisplay: React.FC<ExecutiveROIDisplayProps> = ({ roiData, municipalName }) => {
  const { currentTheme } = useCulturalTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <VStack spacing={6} align="stretch">
      
      {/* ROI Summary Header */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
          <CardHeader pb={3}>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                  Municipal ROI Analysis
                </Text>
                <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                  DigiNativa Professional Development Investment - {municipalName}
                </Text>
              </VStack>
              <Badge colorScheme="green" variant="solid" p={2} borderRadius="lg">
                {roiData.roiPercentage}% ROI
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              
              <VStack spacing={3}>
                <Stat textAlign="center">
                  <StatLabel color={currentTheme.colors.text.secondary}>Total Investment</StatLabel>
                  <StatNumber color={currentTheme.colors.primary} fontSize="2xl">
                    {formatCurrency(roiData.totalInvestment)}
                  </StatNumber>
                  <StatHelpText color={currentTheme.colors.text.muted}>
                    {roiData.periodMonths} månaders period
                  </StatHelpText>
                </Stat>
              </VStack>

              <VStack spacing={3}>
                <Stat textAlign="center">
                  <StatLabel color={currentTheme.colors.text.secondary}>Calculated Return</StatLabel>
                  <StatNumber color="green.500" fontSize="2xl">
                    {formatCurrency(roiData.calculatedReturn)}
                  </StatNumber>
                  <StatHelpText color="green.500">
                    <StatArrow type="increase" />
                    {roiData.roiPercentage}% över investering
                  </StatHelpText>
                </Stat>
              </VStack>

            </Grid>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Service Impact Metrics */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          
          <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.accent + '30'}>
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack w="100%" justify="space-between">
                  <Icon as={FiUsers} w={8} h={8} color={currentTheme.colors.primary} />
                  <Text fontSize="3xl" fontWeight="800" color={currentTheme.colors.primary}>
                    +{roiData.citizenSatisfactionIncrease}%
                  </Text>
                </HStack>
                <VStack spacing={1} w="100%">
                  <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                    Medborgarservice Förbättring
                  </Text>
                  <Progress 
                    value={roiData.citizenSatisfactionIncrease * 4} 
                    colorScheme="blue" 
                    w="100%" 
                    borderRadius="full"
                    bg={currentTheme.colors.accent + '20'}
                  />
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                    Mätbar förbättring av kommunal serviceleverage
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.accent + '30'}>
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack w="100%" justify="space-between">
                  <Icon as={FiTrendingUp} w={8} h={8} color="green.500" />
                  <Text fontSize="3xl" fontWeight="800" color="green.500">
                    +{roiData.staffEngagementIncrease}%
                  </Text>
                </HStack>
                <VStack spacing={1} w="100%">
                  <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                    Medarbetarengagemang
                  </Text>
                  <Progress 
                    value={Math.min(roiData.staffEngagementIncrease / 4, 100)} 
                    colorScheme="green" 
                    w="100%" 
                    borderRadius="full"
                    bg="green.100"
                  />
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                    Dramatisk förbättring av professionell motivation
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

        </Grid>
      </MotionBox>

      {/* Efficiency & Compliance */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          
          <Card bg={currentTheme.colors.surface} borderColor="orange.200">
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack w="100%" justify="space-between">
                  <Icon as={FiClock} w={8} h={8} color="orange.500" />
                  <Text fontSize="3xl" fontWeight="800" color="orange.500">
                    +{roiData.serviceEfficiencyGain}%
                  </Text>
                </HStack>
                <VStack spacing={1} w="100%">
                  <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                    Serviceeffektivitet
                  </Text>
                  <Progress 
                    value={roiData.serviceEfficiencyGain * 3} 
                    colorScheme="orange" 
                    w="100%" 
                    borderRadius="full"
                    bg="orange.100"
                  />
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                    Snabbare handläggning och bättre resursanvändning
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={currentTheme.colors.surface} borderColor="purple.200">
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack w="100%" justify="space-between">
                  <Icon as={FiCheckCircle} w={8} h={8} color="purple.500" />
                  <Text fontSize="3xl" fontWeight="800" color="purple.500">
                    +{roiData.complianceImprovement}%
                  </Text>
                </HStack>
                <VStack spacing={1} w="100%">
                  <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                    Efterlevnadsexcellens
                  </Text>
                  <Progress 
                    value={roiData.complianceImprovement * 2} 
                    colorScheme="purple" 
                    w="100%" 
                    borderRadius="full"
                    bg="purple.100"
                  />
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                    Förbättrad regelefterlevnad och kvalitetsstandarder
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

        </Grid>
      </MotionBox>

    </VStack>
  );
};

interface ProfessionalDevelopmentExecutiveViewProps {
  metrics: ProfessionalDevelopmentMetrics;
  municipalName: string;
}

const ProfessionalDevelopmentExecutiveView: React.FC<ProfessionalDevelopmentExecutiveViewProps> = ({ 
  metrics, 
  municipalName 
}) => {
  const { currentTheme } = useCulturalTheme();

  return (
    <VStack spacing={6} align="stretch">
      
      {/* Participation Overview */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                Professional Development Engagement - {municipalName}
              </Text>
              <Badge colorScheme="blue" variant="solid" p={2} borderRadius="lg">
                {metrics.completionRate}% Completion Rate
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              
              <Stat textAlign="center">
                <StatLabel color={currentTheme.colors.text.secondary}>Total Participants</StatLabel>
                <StatNumber color={currentTheme.colors.primary} fontSize="3xl">
                  {metrics.totalParticipants}
                </StatNumber>
                <StatHelpText color={currentTheme.colors.text.muted}>
                  Municipal professionals enrolled
                </StatHelpText>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={currentTheme.colors.text.secondary}>Active Users</StatLabel>
                <StatNumber color="green.500" fontSize="3xl">
                  {metrics.activeUsers}
                </StatNumber>
                <StatHelpText color="green.500">
                  <StatArrow type="increase" />
                  {Math.round((metrics.activeUsers / metrics.totalParticipants) * 100)}% engagement
                </StatHelpText>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={currentTheme.colors.text.secondary}>Certifications</StatLabel>
                <StatNumber color={currentTheme.colors.accent} fontSize="3xl">
                  {metrics.certificationAchievements}
                </StatNumber>
                <StatHelpText color={currentTheme.colors.text.muted}>
                  Government-recognized achievements
                </StatHelpText>
              </Stat>

            </Grid>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Competency Development */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          
          <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.accent + '30'}>
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack w="100%" justify="space-between">
                  <Icon as={FiBarChart3} w={8} h={8} color={currentTheme.colors.primary} />
                  <Text fontSize="3xl" fontWeight="800" color={currentTheme.colors.primary}>
                    +{metrics.averageSkillIncrease}%
                  </Text>
                </HStack>
                <VStack spacing={1} w="100%">
                  <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                    Genomsnittlig Kompetensutveckling
                  </Text>
                  <Progress 
                    value={metrics.averageSkillIncrease} 
                    colorScheme="blue" 
                    w="100%" 
                    borderRadius="full"
                    bg={currentTheme.colors.accent + '20'}
                  />
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                    Mätbar förbättring av professionella färdigheter
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={currentTheme.colors.surface} borderColor="orange.200">
            <CardBody p={6}>
              <VStack spacing={4}>
                <HStack w="100%" justify="space-between">
                  <Icon as={FiTarget} w={8} h={8} color="orange.500" />
                  <Text fontSize="3xl" fontWeight="800" color="orange.500">
                    {metrics.crossWorldCompetencyGains}%
                  </Text>
                </HStack>
                <VStack spacing={1} w="100%">
                  <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                    Tvärfunktionell Expertis
                  </Text>
                  <Progress 
                    value={metrics.crossWorldCompetencyGains} 
                    colorScheme="orange" 
                    w="100%" 
                    borderRadius="full"
                    bg="orange.100"
                  />
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                    Helhetskompetens över kommunala domäner
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

        </Grid>
      </MotionBox>

      {/* Leadership Readiness */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card bg="green.50" borderColor="green.200">
          <CardBody p={6}>
            <VStack spacing={4}>
              <HStack w="100%" justify="space-between">
                <Icon as={FiAward} w={10} h={10} color="green.500" />
                <VStack align="end" spacing={1}>
                  <Text fontSize="4xl" fontWeight="800" color="green.500">
                    {metrics.leadershipReadiness}%
                  </Text>
                  <Text fontSize="sm" color="green.600" fontWeight="600">
                    Leadership Readiness Index
                  </Text>
                </VStack>
              </HStack>
              <VStack spacing={2} w="100%">
                <Text fontSize="xl" fontWeight="700" color="green.700" textAlign="center">
                  Strategisk Ledarskapskapacitet
                </Text>
                <Progress 
                  value={Math.min(metrics.leadershipReadiness, 100)} 
                  colorScheme="green" 
                  w="100%" 
                  borderRadius="full"
                  h={3}
                  bg="green.100"
                />
                <Text fontSize="md" color="green.600" textAlign="center">
                  {Math.round(metrics.totalParticipants * (metrics.leadershipReadiness / 100))} medarbetare redo för ledningsroller
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

    </VStack>
  );
};

interface EuropeanExpansionExecutiveViewProps {
  metrics: EuropeanExpansionMetrics;
  municipalName: string;
}

const EuropeanExpansionExecutiveView: React.FC<EuropeanExpansionExecutiveViewProps> = ({ 
  metrics, 
  municipalName 
}) => {
  const { currentTheme } = useCulturalTheme();

  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <VStack spacing={6} align="stretch">
      
      {/* Revenue Projection Header */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
          <CardHeader>
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                  European Market Expansion Strategy
                </Text>
                <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                  {municipalName} Leadership Position in European Municipal Innovation
                </Text>
              </VStack>
              <Badge colorScheme="green" variant="solid" p={3} borderRadius="lg" fontSize="md">
                {formatEUR(metrics.revenueProjection)} ARR Target
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={6}>
              
              <Stat textAlign="center">
                <StatLabel color={currentTheme.colors.text.secondary}>Cultural Adaptation</StatLabel>
                <StatNumber color={currentTheme.colors.primary} fontSize="3xl">
                  {metrics.culturalAdaptationScore}%
                </StatNumber>
                <StatHelpText color="green.500">
                  <StatArrow type="increase" />
                  Europa-ledande kulturell intelligens
                </StatHelpText>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={currentTheme.colors.text.secondary}>Competitive Advantage</StatLabel>
                <StatNumber color="green.500" fontSize="3xl">
                  {metrics.competitiveAdvantage}%
                </StatNumber>
                <StatHelpText color="green.500">
                  <StatArrow type="increase" />
                  Teknisk överlägenhet
                </StatHelpText>
              </Stat>

              <Stat textAlign="center">
                <StatLabel color={currentTheme.colors.text.secondary}>Strategic Partnerships</StatLabel>
                <StatNumber color={currentTheme.colors.accent} fontSize="3xl">
                  {metrics.strategicPartnerships}
                </StatNumber>
                <StatHelpText color={currentTheme.colors.text.muted}>
                  Europeiska kommunala partnerskap
                </StatHelpText>
              </Stat>

            </Grid>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Market Penetration */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          
          {Object.entries(metrics.marketPenetration).map(([market, penetration], index) => {
            const marketConfig = {
              svenska: { name: 'Svenska Marknaden', color: 'blue', icon: FiGlobe },
              deutsche: { name: 'Deutsche Markt', color: 'purple', icon: FiTarget },
              française: { name: 'Marché Français', color: 'pink', icon: FiUsers },
              nederlandse: { name: 'Nederlandse Markt', color: 'orange', icon: FiTrendingUp }
            };
            
            const config = marketConfig[market as keyof typeof marketConfig];
            if (!config) return null;

            return (
              <Card key={market} bg={currentTheme.colors.surface} borderColor={`${config.color}.200`}>
                <CardBody p={6}>
                  <VStack spacing={4}>
                    <HStack w="100%" justify="space-between">
                      <Icon as={config.icon} w={8} h={8} color={`${config.color}.500`} />
                      <Text fontSize="3xl" fontWeight="800" color={`${config.color}.500`}>
                        {penetration}%
                      </Text>
                    </HStack>
                    <VStack spacing={1} w="100%">
                      <Text fontSize="lg" fontWeight="600" color={currentTheme.colors.text.primary}>
                        {config.name}
                      </Text>
                      <Progress 
                        value={penetration * 5} 
                        colorScheme={config.color} 
                        w="100%" 
                        borderRadius="full"
                        bg={`${config.color}.100`}
                      />
                      <Text fontSize="sm" color={currentTheme.colors.text.secondary} textAlign="center">
                        Marknadsposition och tillväxtpotential
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}

        </Grid>
      </MotionBox>

      {/* Strategic Opportunity */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody p={8}>
            <VStack spacing={6}>
              <HStack w="100%" justify="center">
                <Icon as={FiDollarSign} w={12} h={12} color="blue.500" />
                <VStack align="center" spacing={1}>
                  <Text fontSize="4xl" fontWeight="800" color="blue.500">
                    {formatEUR(metrics.revenueProjection)}
                  </Text>
                  <Text fontSize="lg" color="blue.600" fontWeight="600">
                    Annual Recurring Revenue Target
                  </Text>
                </VStack>
              </HStack>
              
              <VStack spacing={3} w="100%">
                <Text fontSize="xl" fontWeight="700" color="blue.700" textAlign="center">
                  Sveriges Position som Europeisk Municipal Innovation Leader
                </Text>
                <Text fontSize="md" color="blue.600" textAlign="center" maxW="3xl">
                  Genom DigiNativa's kulturella intelligens och tekniska excellens positionerar sig {municipalName} som den ledande kraften i europeisk kommunal digital transformation
                </Text>
                
                <Grid templateColumns="repeat(4, 1fr)" gap={4} w="100%" mt={4}>
                  {metrics.targetMarkets.map((market, index) => (
                    <VStack key={market} spacing={2}>
                      <Badge colorScheme="blue" variant="outline" p={2} borderRadius="lg">
                        {market}
                      </Badge>
                      <Text fontSize="xs" color="blue.600" textAlign="center">
                        Strategic Market
                      </Text>
                    </VStack>
                  ))}
                </Grid>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

    </VStack>
  );
};

interface ExecutiveMunicipalDashboardProps {
  dashboardData?: ExecutiveDashboardData;
  onExportReport?: () => void;
  onSchedulePresentation?: () => void;
}

export const ExecutiveMunicipalDashboard: React.FC<ExecutiveMunicipalDashboardProps> = ({
  dashboardData = sampleExecutiveDashboard,
  onExportReport = () => console.log('Export executive report'),
  onSchedulePresentation = () => console.log('Schedule stakeholder presentation')
}) => {
  const { currentTheme } = useCulturalTheme();
  const [activeTab, setActiveTab] = useState(0);

  const tabData = [
    { label: 'Municipal ROI', icon: FiDollarSign },
    { label: 'Professional Development', icon: FiUsers },
    { label: 'European Expansion', icon: FiGlobe }
  ];

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        
        {/* Executive Dashboard Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
            <CardHeader>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                
                <VStack align="start" spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color={currentTheme.colors.primary}>
                    Executive Municipal Dashboard
                  </Text>
                  <HStack spacing={4} flexWrap="wrap">
                    <Text fontSize="md" color={currentTheme.colors.text.secondary}>
                      {dashboardData.municipalName}
                    </Text>
                    <Badge colorScheme="blue" variant="outline">
                      {dashboardData.reportingPeriod}
                    </Badge>
                    <Text fontSize="sm" color={currentTheme.colors.text.muted}>
                      Uppdaterat: {dashboardData.lastUpdated.toLocaleDateString('sv-SE')}
                    </Text>
                  </HStack>
                </VStack>

                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<FiBarChart3 />}
                    onClick={onExportReport}
                    colorScheme="blue"
                  >
                    Export Report
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<FiUsers />}
                    onClick={onSchedulePresentation}
                  >
                    Schedule Presentation
                  </Button>
                </HStack>

              </Flex>
            </CardHeader>
          </Card>
        </MotionBox>

        {/* Municipal Branding */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <MunicipalBrandingDisplay size="sm" />
        </MotionBox>

        {/* Executive Tabs */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed" colorScheme="blue">
            <TabList>
              {tabData.map((tab, index) => (
                <Tab key={index} fontWeight="600" fontSize="md">
                  <HStack spacing={2}>
                    <Icon as={tab.icon} w={5} h={5} />
                    <Text>{tab.label}</Text>
                  </HStack>
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              
              {/* Municipal ROI Tab */}
              <TabPanel p={6}>
                <ExecutiveROIDisplay 
                  roiData={dashboardData.roiMetrics}
                  municipalName={dashboardData.municipalName}
                />
              </TabPanel>

              {/* Professional Development Tab */}
              <TabPanel p={6}>
                <ProfessionalDevelopmentExecutiveView
                  metrics={dashboardData.professionalMetrics}
                  municipalName={dashboardData.municipalName}
                />
              </TabPanel>

              {/* European Expansion Tab */}
              <TabPanel p={6}>
                <EuropeanExpansionExecutiveView
                  metrics={dashboardData.europeanMetrics}
                  municipalName={dashboardData.municipalName}
                />
              </TabPanel>

            </TabPanels>
          </Tabs>
        </MotionBox>

        {/* Key Achievements & Recommendations */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
            
            {/* Key Achievements */}
            <Card bg={currentTheme.colors.surface} borderColor="green.200">
              <CardHeader>
                <HStack spacing={3}>
                  <Icon as={FiAward} w={6} h={6} color="green.500" />
                  <Text fontSize="lg" fontWeight="700" color="green.700">
                    Nyckelframgångar
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {dashboardData.keyAchievements.map((achievement, index) => (
                    <HStack key={index} spacing={3} align="start">
                      <Icon as={FiCheckCircle} w={5} h={5} color="green.500" flexShrink={0} mt={0.5} />
                      <Text fontSize="sm" color={currentTheme.colors.text.primary} lineHeight="short">
                        {achievement}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Strategic Recommendations */}
            <Card bg={currentTheme.colors.surface} borderColor="blue.200">
              <CardHeader>
                <HStack spacing={3}>
                  <Icon as={FiTarget} w={6} h={6} color="blue.500" />
                  <Text fontSize="lg" fontWeight="700" color="blue.700">
                    Strategiska Rekommendationer
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {dashboardData.strategicRecommendations.map((recommendation, index) => (
                    <HStack key={index} spacing={3} align="start">
                      <Icon as={FiArrowUp} w={5} h={5} color="blue.500" flexShrink={0} mt={0.5} />
                      <Text fontSize="sm" color={currentTheme.colors.text.primary} lineHeight="short">
                        {recommendation}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

          </Grid>
        </MotionBox>

      </VStack>
    </Container>
  );
};