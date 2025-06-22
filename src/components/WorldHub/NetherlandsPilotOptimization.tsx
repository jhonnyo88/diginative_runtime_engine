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
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGlobe,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiCheck,
  FiStar,
  FiBarChart3,
  FiSettings,
  FiFlag,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiAward,
  FiShield,
  FiBookOpen
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';


// Netherlands Market Analysis and Optimization
interface NetherlandsMarketData {
  municipalityCount: number;
  averageEmployees: number;
  digitalMaturity: number;
  trainingBudgetPerEmployee: number;
  europeanCooperationIndex: number;
  dutchEfficiencyExpectation: number;
  pilotReadinessScore: number;
}

interface DutchMunicipalScenario {
  id: string;
  municipality: string;
  scenario: string;
  dutchContext: string;
  practicalFocus: string;
  efficiencyGain: string;
  directBenefit: string;
  implementationTime: string;
  costSaving: number;
  pilotSuitability: number;
}

// Netherlands Market Data
const netherlandsMarketData: NetherlandsMarketData = {
  municipalityCount: 342,
  averageEmployees: 280,
  digitalMaturity: 78,
  trainingBudgetPerEmployee: 1250,
  europeanCooperationIndex: 89,
  dutchEfficiencyExpectation: 95,
  pilotReadinessScore: 87
};

// Dutch Municipal Scenarios optimized for Netherlands pilot
const dutchMunicipalScenarios: DutchMunicipalScenario[] = [
  {
    id: 'amsterdam_emergency_efficiency',
    municipality: 'Gemeente Amsterdam',
    scenario: 'Emergency Response Coordination - Directe Efficiency',
    dutchContext: 'Dutch directness applied to crisis management - clear protocols, immediate action, no bureaucratic delays',
    practicalFocus: 'Streamlined emergency coordination with direct communication channels and efficient resource allocation',
    efficiencyGain: '34% faster emergency response time through elimination of administrative overhead',
    directBenefit: '€180,000 annual savings through reduced emergency coordination costs and improved citizen safety',
    implementationTime: '6 weeks - practical setup with immediate operational benefits',
    costSaving: 180000,
    pilotSuitability: 94
  },
  {
    id: 'rotterdam_budget_optimization',
    municipality: 'Gemeente Rotterdam',
    scenario: 'Municipal Budget Planning - Practical Financial Management',
    dutchContext: 'No-nonsense approach to budget planning with transparent resource allocation and direct ROI focus',
    practicalFocus: 'Data-driven budget decisions with clear cost-benefit analysis and efficient allocation processes',
    efficiencyGain: '28% reduction in budget planning time with 15% more accurate financial forecasting',
    directBenefit: '€240,000 annual efficiency gain through optimized budget processes and reduced administrative costs',
    implementationTime: '4 weeks - immediate integration with existing financial systems',
    costSaving: 240000,
    pilotSuitability: 92
  },
  {
    id: 'utrecht_digital_transformation',
    municipality: 'Gemeente Utrecht',
    scenario: 'Digital Transformation Leadership - Practical Innovation',
    dutchContext: 'Pragmatic digital leadership focused on measurable results and efficient citizen service delivery',
    practicalFocus: 'Results-oriented digital initiatives with clear implementation timelines and practical benefits',
    efficiencyGain: '42% faster digital project delivery with 25% higher citizen satisfaction scores',
    directBenefit: '€320,000 value creation through accelerated digital transformation and improved service quality',
    implementationTime: '8 weeks - systematic rollout with proven methodologies',
    costSaving: 320000,
    pilotSuitability: 89
  },
  {
    id: 'den_haag_stakeholder_management',
    municipality: 'Gemeente Den Haag',
    scenario: 'Stakeholder Relations - Direct Communication Excellence',
    dutchContext: 'Honest, transparent stakeholder engagement with practical solutions and efficient decision-making',
    practicalFocus: 'Clear communication protocols with direct feedback mechanisms and efficient consensus building',
    efficiencyGain: '38% improvement in stakeholder satisfaction with 45% faster decision-making processes',
    directBenefit: '€210,000 annual value through improved stakeholder relations and reduced consultation costs',
    implementationTime: '5 weeks - immediate stakeholder engagement optimization',
    costSaving: 210000,
    pilotSuitability: 91
  },
  {
    id: 'eindhoven_cross_cultural',
    municipality: 'Gemeente Eindhoven',
    scenario: 'European Cross-Cultural Competency - International Efficiency',
    dutchContext: 'Practical international cooperation with efficient cross-border collaboration and direct cultural adaptation',
    practicalFocus: 'Streamlined European municipal cooperation with practical cultural intelligence application',
    efficiencyGain: '52% more effective European collaboration with 30% faster cross-border project completion',
    directBenefit: '€280,000 opportunity value through enhanced European cooperation and international funding access',
    implementationTime: '7 weeks - systematic cultural competency development',
    costSaving: 280000,
    pilotSuitability: 88
  }
];

// Netherlands Pilot Optimization Metrics
interface PilotOptimizationMetric {
  category: string;
  metric: string;
  current: number;
  target: number;
  improvement: number;
  priority: 'high' | 'medium' | 'low';
}

const pilotOptimizationMetrics: PilotOptimizationMetric[] = [
  {
    category: 'Dutch Efficiency',
    metric: 'Task Completion Speed',
    current: 78,
    target: 95,
    improvement: 22,
    priority: 'high'
  },
  {
    category: 'Direct Communication',
    metric: 'Clear Information Delivery',
    current: 82,
    target: 98,
    improvement: 20,
    priority: 'high'
  },
  {
    category: 'Practical Results',
    metric: 'Measurable Outcomes',
    current: 85,
    target: 96,
    improvement: 13,
    priority: 'high'
  },
  {
    category: 'Cost Efficiency',
    metric: 'Budget Optimization',
    current: 73,
    target: 92,
    improvement: 26,
    priority: 'high'
  },
  {
    category: 'Cultural Adaptation',
    metric: 'Dutch Context Alignment',
    current: 89,
    target: 97,
    improvement: 9,
    priority: 'medium'
  },
  {
    category: 'European Integration',
    metric: 'Cross-Border Cooperation',
    current: 76,
    target: 90,
    improvement: 18,
    priority: 'medium'
  }
];

// Dutch Municipal Scenario Card
interface DutchScenarioCardProps {
  scenario: DutchMunicipalScenario;
  isOptimized?: boolean;
}

const DutchMunicipalScenarioCard: React.FC<DutchScenarioCardProps> = ({ 
  scenario, 
  isOptimized = true 
}) => {
  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      bg="white"
      borderColor="orange.200"
      borderWidth="2px"
      boxShadow="lg"
      _hover={{
        boxShadow: "0 12px 35px orange.200"
      }}
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          
          {/* Scenario Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700" color="orange.600">
                {scenario.municipality}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {scenario.scenario}
              </Text>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Badge colorScheme="orange" variant="solid">
                🇳🇱 Dutch Optimized
              </Badge>
              <Text fontSize="sm" fontWeight="600" color="orange.500">
                {scenario.pilotSuitability}% Pilot Ready
              </Text>
            </VStack>
          </HStack>

          {/* Dutch Context */}
          <Box p={3} bg="orange.50" borderRadius="md" border="1px solid orange.200">
            <Text fontSize="sm" fontWeight="600" color="orange.700" mb={1}>
              Dutch Cultural Context:
            </Text>
            <Text fontSize="xs" color="orange.700" lineHeight="tall">
              {scenario.dutchContext}
            </Text>
          </Box>

          {/* Practical Focus */}
          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiTarget} w={4} h={4} color="orange.500" />
              <Text fontSize="sm" fontWeight="600" color="orange.600">
                Practical Focus:
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.700" lineHeight="tall">
              {scenario.practicalFocus}
            </Text>
          </VStack>

          {/* Efficiency Metrics */}
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <VStack spacing={1}>
              <Text fontSize="xs" color="gray.600">Efficiency Gain</Text>
              <Text fontSize="sm" fontWeight="700" color="green.500">
                {scenario.efficiencyGain.split(' ')[0]}
              </Text>
            </VStack>
            <VStack spacing={1}>
              <Text fontSize="xs" color="gray.600">Cost Saving</Text>
              <Text fontSize="sm" fontWeight="700" color="blue.500">
                €{(scenario.costSaving / 1000).toFixed(0)}k
              </Text>
            </VStack>
          </Grid>

          {/* Direct Benefit */}
          <Box p={3} bg="green.50" borderRadius="md" border="1px solid green.200">
            <Text fontSize="sm" fontWeight="600" color="green.700" mb={1}>
              Direct Benefit:
            </Text>
            <Text fontSize="xs" color="green.700" lineHeight="tall">
              {scenario.directBenefit}
            </Text>
          </Box>

          {/* Implementation Timeline */}
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Icon as={FiClock} w={4} h={4} color="blue.500" />
              <Text fontSize="sm" fontWeight="600" color="blue.600">
                Implementation:
              </Text>
            </HStack>
            <Text fontSize="sm" fontWeight="700" color="blue.500">
              {scenario.implementationTime.split(' ')[0]}
            </Text>
          </HStack>

          {/* Pilot Suitability Progress */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color="gray.600">Pilot Suitability:</Text>
              <Text fontSize="xs" fontWeight="600" color="orange.600">
                {scenario.pilotSuitability}%
              </Text>
            </HStack>
            <Progress
              value={scenario.pilotSuitability}
              colorScheme="orange"
              size="sm"
              borderRadius="full"
            />
          </Box>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Pilot Optimization Metrics Display
const PilotOptimizationMetricsDisplay: React.FC = () => {
  return (
    <Card bg="blue.50" borderColor="blue.200">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          <HStack spacing={3}>
            <Icon as={FiBarChart3} w={6} h={6} color="blue.500" />
            <Text fontSize="lg" fontWeight="700" color="blue.700">
              Netherlands Pilot Optimization Metrics
            </Text>
          </HStack>

          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            {pilotOptimizationMetrics.map((metric) => (
              <VStack key={metric.metric} spacing={3} align="stretch">
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="600" color="blue.700">
                      {metric.metric}
                    </Text>
                    <Text fontSize="xs" color="blue.600">
                      {metric.category}
                    </Text>
                  </VStack>
                  <Badge 
                    colorScheme={metric.priority === 'high' ? 'red' : 'yellow'} 
                    variant="solid"
                  >
                    {metric.priority}
                  </Badge>
                </HStack>

                <HStack justify="space-between">
                  <Text fontSize="xs" color="gray.600">Current: {metric.current}%</Text>
                  <Text fontSize="xs" color="gray.600">Target: {metric.target}%</Text>
                </HStack>

                <Progress
                  value={(metric.current / metric.target) * 100}
                  colorScheme={metric.improvement > 20 ? "orange" : "green"}
                  size="md"
                  borderRadius="full"
                />

                <Text fontSize="xs" color="green.600" fontWeight="600">
                  +{metric.improvement}% improvement potential
                </Text>

              </VStack>
            ))}
          </Grid>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Netherlands Market Analysis
const NetherlandsMarketAnalysis: React.FC = () => {
  const _totalMarketValue = netherlandsMarketData.municipalityCount * 
                          netherlandsMarketData.averageEmployees * 
                          netherlandsMarketData.trainingBudgetPerEmployee;

  return (
    <Card bg="orange.50" borderColor="orange.200">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          <HStack spacing={3}>
            <Icon as={FiMapPin} w={6} h={6} color="orange.500" />
            <Text fontSize="lg" fontWeight="700" color="orange.700">
              Netherlands Municipal Market Analysis
            </Text>
          </HStack>

          <Grid templateColumns="repeat(4, 1fr)" gap={4}>
            <Stat>
              <StatLabel color="orange.600">Municipalities</StatLabel>
              <StatNumber color="orange.700">{netherlandsMarketData.municipalityCount}</StatNumber>
              <StatHelpText color="orange.600">Total addressable market</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color="orange.600">Avg Employees</StatLabel>
              <StatNumber color="orange.700">{netherlandsMarketData.averageEmployees}</StatNumber>
              <StatHelpText color="orange.600">Per municipality</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color="orange.600">Digital Maturity</StatLabel>
              <StatNumber color="orange.700">{netherlandsMarketData.digitalMaturity}%</StatNumber>
              <StatHelpText color="orange.600">
                <StatArrow type="increase" />
                High readiness
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel color="orange.600">Training Budget</StatLabel>
              <StatNumber color="orange.700">€{netherlandsMarketData.trainingBudgetPerEmployee}</StatNumber>
              <StatHelpText color="orange.600">Per employee/year</StatHelpText>
            </Stat>
          </Grid>

          <Divider />

          <VStack spacing={4} align="stretch">
            <Text fontSize="md" fontWeight="600" color="orange.700">
              Market Opportunity Assessment:
            </Text>
            
            <Grid templateColumns="repeat(3, 1fr)" gap={4}>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="800" color="orange.500">
                  €{(totalMarketValue / 1000000).toFixed(0)}M
                </Text>
                <Text fontSize="sm" color="orange.600" textAlign="center">
                  Total Market Value
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="800" color="green.500">
                  {netherlandsMarketData.pilotReadinessScore}%
                </Text>
                <Text fontSize="sm" color="orange.600" textAlign="center">
                  Pilot Readiness
                </Text>
              </VStack>
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="800" color="blue.500">
                  {netherlandsMarketData.dutchEfficiencyExpectation}%
                </Text>
                <Text fontSize="sm" color="orange.600" textAlign="center">
                  Efficiency Expectation
                </Text>
              </VStack>
            </Grid>

            <Text fontSize="sm" color="orange.700" lineHeight="tall">
              Netherlands municipal market demonstrates high digital maturity och strong efficiency expectations, 
              making it ideal för DigiNativa pilot deployment. Dutch directness och practical focus align 
              perfectly med our results-oriented professional development approach.
            </Text>
          </VStack>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Main Netherlands Pilot Optimization Component
interface NetherlandsPilotOptimizationProps {
  onPilotMetricsUpdate?: (metrics: PilotOptimizationMetric[]) => void;
}

export const NetherlandsPilotOptimization: React.FC<NetherlandsPilotOptimizationProps> = ({
  onPilotMetricsUpdate = () => console.log('Netherlands pilot metrics updated')
}) => {
  const { currentTheme } = useCulturalTheme();

  // Calculate overall pilot readiness
  const pilotReadiness = dutchMunicipalScenarios.reduce((sum, scenario) => sum + scenario.pilotSuitability, 0) / 
    dutchMunicipalScenarios.length;


  return (
    <VStack spacing={8} align="stretch">
      
      {/* Netherlands Pilot Optimization Overview */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card bg={currentTheme.colors.surface} borderColor="orange.300">
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiFlag} w={8} h={8} color="orange.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800" color="orange.600">
                      Netherlands Pilot Market Optimization
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      Dutch efficiency-focused European market preparation
                    </Text>
                  </VStack>
                </HStack>
                
                <VStack align="end" spacing={1}>
                  <Badge colorScheme="orange" variant="solid" p={2} borderRadius="lg">
                    🇳🇱 Dutch Directheid
                  </Badge>
                  <Text fontSize="xs" color="gray.600">
                    Practical Results Focus
                  </Text>
                </VStack>
              </HStack>

              {/* Pilot Readiness Dashboard */}
              <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="orange.500">
                    {avgPilotSuitability}%
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Pilot Readiness
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="green.500">
                    €{(totalCostSavings / 1000).toFixed(0)}k
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Total Cost Savings
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="blue.500">
                    {dutchMunicipalScenarios.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Optimized Scenarios
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="purple.500">
                    6 weeks
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Avg Implementation
                  </Text>
                </VStack>
              </Grid>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Netherlands Market Analysis */}
      <NetherlandsMarketAnalysis />

      {/* Pilot Optimization Metrics */}
      <PilotOptimizationMetricsDisplay />

      {/* Dutch Municipal Scenarios */}
      <Box>
        <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
          Dutch Municipal Scenarios - Pilot Optimized:
        </Text>
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          {dutchMunicipalScenarios.map((scenario) => (
            <DutchMunicipalScenarioCard
              key={scenario.id}
              scenario={scenario}
              isOptimized={true}
            />
          ))}
        </Grid>
      </Box>

      {/* Netherlands Pilot Excellence Summary */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
      >
        <Card bg="green.50" borderColor="green.200">
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              
              <HStack spacing={3}>
                <Icon as={FiAward} w={6} h={6} color="green.500" />
                <Text fontSize="lg" fontWeight="700" color="green.700">
                  Netherlands Pilot Market Leadership Positioning
                </Text>
              </HStack>

              <Text fontSize="sm" color="green.700" lineHeight="tall">
                Netherlands pilot optimization leverages Dutch directness, practical efficiency, och results-oriented municipal culture för optimal European market entry. Each scenario demonstrates clear cost savings, measurable efficiency gains, och direct implementation benefits aligned med Dutch municipal expectations.
              </Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="green.500">
                    95%
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Dutch Efficiency Alignment
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    Direct
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Communication Style
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="orange.500">
                    Practical
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Results Focus
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