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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
  FormControl,
  FormLabel,
  Divider,
  Grid,
  CircularProgress,
  CircularProgressLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  FiHeart,
  FiUsers,
  FiBalance,
  FiCompass,
  FiClock,
  FiTarget,
  FiTrendingUp,
  FiCheck,
  FiPause,
  FiPlay,
  FiRefreshCw,
  FiSettings,
  FiStar,
  FiShield,
  FiGlobe
} from 'react-icons/fi';

import { useCulturalTheme } from '../WorldHub/CulturalThemeProvider';


// Lagom UX Flow Principles and Framework
interface LagomPrinciple {
  id: string;
  swedishName: string;
  englishName: string;
  description: string;
  uxApplication: string;
  balanceMetric: number;
  governmentRelevance: string;
  implementationGuidance: string;
}

interface LagomFlowState {
  balance: number;
  inclusivity: number;
  sustainability: number;
  moderation: number;
  consensus: number;
  transparency: number;
}

interface LagomUXSettings {
  paceModeration: number; // 0-100: slow to energetic
  inclusivityLevel: number; // 0-100: focused to comprehensive
  consensusBuilding: number; // 0-100: directive to collaborative
  informationDensity: number; // 0-100: minimal to comprehensive
  culturalAuthenticity: number; // 0-100: universal to deeply Swedish
  governmentFormality: number; // 0-100: casual to highly formal
}

// Core Lagom Principles for UX Design
const lagomPrinciples: LagomPrinciple[] = [
  {
    id: 'lagom_balance',
    swedishName: 'Lagom Balans',
    englishName: 'Perfect Balance',
    description: 'Inte för mycket, inte för lite - precis rätt mängd av allt',
    uxApplication: 'UX elements are sized, spaced, and timed för optimal user experience without overwhelming or underwhelming',
    balanceMetric: 95,
    governmentRelevance: 'Government officials appreciate measured, well-balanced interfaces that demonstrate thoughtful design',
    implementationGuidance: 'Use moderate animations (400-800ms), balanced color ratios (60-30-10), optimal information density'
  },
  {
    id: 'lagom_inclusivity',
    swedishName: 'Lagom Inkludering',
    englishName: 'Inclusive Participation',
    description: 'Alla ska känna sig välkomna och ha möjlighet att delta',
    uxApplication: 'UX design ensures all stakeholders can participate effectively regardless of technical expertise',
    balanceMetric: 92,
    governmentRelevance: 'Democratic participation is core to Swedish governance - technology must enable, not hinder',
    implementationGuidance: 'Progressive disclosure, multiple interaction modes, clear navigation paths för different user types'
  },
  {
    id: 'lagom_sustainability',
    swedishName: 'Lagom Hållbarhet',
    englishName: 'Sustainable Approach',
    description: 'Lösningar som fungerar på lång sikt utan att utmatta resurser',
    uxApplication: 'UX patterns that remain effective over time without causing user fatigue or system strain',
    balanceMetric: 88,
    governmentRelevance: 'Government systems must be sustainable för long-term use by many different users',
    implementationGuidance: 'Performance optimization, energy-efficient animations, timeless design patterns'
  },
  {
    id: 'lagom_moderation',
    swedishName: 'Lagom Måttfullhet',
    englishName: 'Thoughtful Moderation',
    description: 'Undvik extremer - hitta den genomtänkta medelvägen',
    uxApplication: 'UX avoids flashy extremes or stark minimalism, finding the thoughtful middle path',
    balanceMetric: 94,
    governmentRelevance: 'Government interfaces should be professional but not sterile, engaging but not frivolous',
    implementationGuidance: 'Moderate use av color, restrained but present micro-interactions, professional yet warm tone'
  },
  {
    id: 'lagom_consensus',
    swedishName: 'Lagom Konsensus',
    englishName: 'Collaborative Consensus',
    description: 'Beslutsfattande som bygger på dialog och gemensam förståelse',
    uxApplication: 'UX facilitates collaborative decision-making and builds understanding among stakeholders',
    balanceMetric: 96,
    governmentRelevance: 'Swedish government culture emphasizes consensus-building and collaborative governance',
    implementationGuidance: 'Collaborative tools, discussion facilitation, transparent decision tracking'
  },
  {
    id: 'lagom_transparency',
    swedishName: 'Lagom Transparens',
    englishName: 'Open Transparency',
    description: 'Öppenhet och klarhet utan att överväldigande med information',
    uxApplication: 'UX provides clear visibility into processes and decisions without information overload',
    balanceMetric: 91,
    governmentRelevance: 'Swedish offentlighetsprincipen requires transparency while maintaining practical usability',
    implementationGuidance: 'Progressive information disclosure, clear process visualization, accessible data presentation'
  }
];

// Lagom Flow Visualization Component
interface LagomFlowVisualizationProps {
  lagomState: LagomFlowState;
  isActive: boolean;
}

const LagomFlowVisualization: React.FC<LagomFlowVisualizationProps> = ({
  lagomState,
  isActive
}) => {

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.05, 1],
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }
      });
    } else {
      controls.stop();
    }
  }, [isActive, controls]);

    (lagomState.balance + lagomState.inclusivity + lagomState.sustainability + 
     lagomState.moderation + lagomState.consensus + lagomState.transparency) / 6
  );

  return (
    <MotionBox
      animate={controls}
      position="relative"
      w="300px"
      h="300px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Swedish Flag Circle Background */}
      <Box
        position="absolute"
        w="280px"
        h="280px"
        borderRadius="full"
        bg={`linear-gradient(135deg, ${swedishBlue} 0%, ${swedishBlue} 100%)`}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Swedish Cross Pattern */}
        <Box
          position="absolute"
          w="100%"
          h="100%"
          borderRadius="full"
          backgroundImage={`radial-gradient(circle at center, transparent 30%, ${swedishYellow} 30%, ${swedishYellow} 40%, transparent 40%),
                           radial-gradient(circle at center, transparent 45%, ${swedishYellow} 45%, ${swedishYellow} 55%, transparent 55%)`}
          opacity={0.6}
        />
      </Box>

      {/* Central Lagom Balance Display */}
      <VStack spacing={2} position="relative" zIndex={2}>
        <CircularProgress
          value={overallBalance}
          size="120px"
          thickness="8px"
          color={swedishYellow}
          trackColor="whiteAlpha.300"
        >
          <CircularProgressLabel color="white" fontSize="2xl" fontWeight="800">
            {overallBalance}%
          </CircularProgressLabel>
        </CircularProgress>
        
        <Text color="white" fontSize="sm" fontWeight="600" textAlign="center">
          Lagom Balance
        </Text>
        
        <Badge bg={swedishYellow} color={swedishBlue} px={3} py={1} borderRadius="full">
          Perfect Swedish UX
        </Badge>
      </VStack>

      {/* Lagom Principle Indicators */}
      {Object.entries(lagomState).map(([key, value], index) => {

        return (
          <Box
            key={key}
            position="absolute"
            left="50%"
            top="50%"
            transform={`translate(${x}px, ${y}px) translate(-50%, -50%)`}
            w="40px"
            h="40px"
            bg={value >= 85 ? "green.500" : value >= 70 ? "yellow.500" : "orange.500"}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="lg"
            border="3px solid white"
          >
            <Text color="white" fontSize="xs" fontWeight="700">
              {value}
            </Text>
          </Box>
        );
      })}

    </MotionBox>
  );
};

// Lagom UX Settings Control Panel
interface LagomUXControlPanelProps {
  settings: LagomUXSettings;
  onSettingsChange: (settings: LagomUXSettings) => void;
  lagomState: LagomFlowState;
}

const LagomUXControlPanel: React.FC<LagomUXControlPanelProps> = ({
  settings,
  onSettingsChange,
  lagomState
}) => {


  return (
    <Card bg="blue.50" borderColor="blue.200" borderWidth="2px">
      <CardBody p={6}>
        <VStack spacing={6} align="stretch">
          
          <HStack spacing={3}>
            <Icon as={FiSettings} w={6} h={6} color={swedishBlue} />
            <Text fontSize="lg" fontWeight="700" color={swedishBlue}>
              Lagom UX Flow Control Center
            </Text>
            <Badge bg={swedishYellow} color={swedishBlue} px={2} py={1}>
              Swedish Cultural Intelligence
            </Badge>
          </HStack>

          {/* UX Flow Settings */}
          <Grid templateColumns="repeat(2, 1fr)" gap={6}>
            
            {/* Pace Moderation */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                  Pace Moderation (Takttempo):
                </Text>
                <Text fontSize="sm" fontWeight="700" color={swedishBlue}>
                  {settings.paceModeration}%
                </Text>
              </HStack>
              <Slider
                value={settings.paceModeration}
                onChange={(value) => handleSettingChange('paceModeration', value)}
                min={0}
                max={100}
                step={5}
                colorScheme="blue"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color={swedishBlue} as={FiClock} />
                </SliderThumb>
              </Slider>
              <Text fontSize="xs" color="gray.600">
                Slow & thoughtful ← → Dynamic & engaging
              </Text>
            </VStack>

            {/* Inclusivity Level */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                  Inclusivity Level (Inkluderingsnivå):
                </Text>
                <Text fontSize="sm" fontWeight="700" color={swedishBlue}>
                  {settings.inclusivityLevel}%
                </Text>
              </HStack>
              <Slider
                value={settings.inclusivityLevel}
                onChange={(value) => handleSettingChange('inclusivityLevel', value)}
                min={0}
                max={100}
                step={5}
                colorScheme="green"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="green.500" as={FiUsers} />
                </SliderThumb>
              </Slider>
              <Text fontSize="xs" color="gray.600">
                Focused interface ← → Comprehensive participation
              </Text>
            </VStack>

            {/* Consensus Building */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                  Consensus Building (Konsensusbyggande):
                </Text>
                <Text fontSize="sm" fontWeight="700" color={swedishBlue}>
                  {settings.consensusBuilding}%
                </Text>
              </HStack>
              <Slider
                value={settings.consensusBuilding}
                onChange={(value) => handleSettingChange('consensusBuilding', value)}
                min={0}
                max={100}
                step={5}
                colorScheme="purple"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="purple.500" as={FiCompass} />
                </SliderThumb>
              </Slider>
              <Text fontSize="xs" color="gray.600">
                Direct decisions ← → Collaborative consensus
              </Text>
            </VStack>

            {/* Information Density */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                  Information Density (Informationstäthet):
                </Text>
                <Text fontSize="sm" fontWeight="700" color={swedishBlue}>
                  {settings.informationDensity}%
                </Text>
              </HStack>
              <Slider
                value={settings.informationDensity}
                onChange={(value) => handleSettingChange('informationDensity', value)}
                min={0}
                max={100}
                step={5}
                colorScheme="orange"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="orange.500" as={FiTarget} />
                </SliderThumb>
              </Slider>
              <Text fontSize="xs" color="gray.600">
                Minimal & clean ← → Rich & comprehensive
              </Text>
            </VStack>

            {/* Cultural Authenticity */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                  Cultural Authenticity (Kulturell äkthet):
                </Text>
                <Text fontSize="sm" fontWeight="700" color={swedishBlue}>
                  {settings.culturalAuthenticity}%
                </Text>
              </HStack>
              <Slider
                value={settings.culturalAuthenticity}
                onChange={(value) => handleSettingChange('culturalAuthenticity', value)}
                min={0}
                max={100}
                step={5}
                colorScheme="yellow"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="yellow.600" as={FiGlobe} />
                </SliderThumb>
              </Slider>
              <Text fontSize="xs" color="gray.600">
                Universal design ← → Deeply Swedish context
              </Text>
            </VStack>

            {/* Government Formality */}
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                  Government Formality (Myndighetsformalitet):
                </Text>
                <Text fontSize="sm" fontWeight="700" color={swedishBlue}>
                  {settings.governmentFormality}%
                </Text>
              </HStack>
              <Slider
                value={settings.governmentFormality}
                onChange={(value) => handleSettingChange('governmentFormality', value)}
                min={0}
                max={100}
                step={5}
                colorScheme="gray"
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="gray.600" as={FiShield} />
                </SliderThumb>
              </Slider>
              <Text fontSize="xs" color="gray.600">
                Casual & approachable ← → Formal & institutional
              </Text>
            </VStack>

          </Grid>

          {/* Lagom Balance Feedback */}
          <Alert status={lagomState.balance >= 90 ? "success" : lagomState.balance >= 70 ? "warning" : "error"}>
            <AlertIcon />
            <Box>
              <AlertTitle>
                Lagom Balance Status: {lagomState.balance >= 90 ? "Perfect" : lagomState.balance >= 70 ? "Good" : "Needs Adjustment"}
              </AlertTitle>
              <AlertDescription>
                {lagomState.balance >= 90 
                  ? "UX flow perfectly embodies Swedish lagom principles för government stakeholder engagement."
                  : lagomState.balance >= 70
                  ? "UX flow demonstrates good lagom balance med minor optimization opportunities."
                  : "UX flow needs adjustment to better reflect Swedish cultural values och government appropriateness."
                }
              </AlertDescription>
            </Box>
          </Alert>

        </VStack>
      </CardBody>
    </Card>
  );
};

// Lagom Principle Display Component
const LagomPrincipleDisplay: React.FC = () => {

  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="lg" fontWeight="700" color={swedishBlue}>
        Core Lagom Principles för UX Excellence:
      </Text>
      
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
        {lagomPrinciples.map((principle) => (
          <MotionCard
            key={principle.id}
            whileHover={{ scale: 1.02, y: -2 }}
            bg="white"
            borderColor="blue.200"
            borderWidth="2px"
            boxShadow="md"
            _hover={{ boxShadow: "lg" }}
          >
            <CardBody p={5}>
              <VStack spacing={4} align="stretch">
                
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="md" fontWeight="700" color={swedishBlue}>
                      {principle.swedishName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {principle.englishName}
                    </Text>
                  </VStack>
                  
                  <CircularProgress
                    value={principle.balanceMetric}
                    size="50px"
                    thickness="8px"
                    color="blue.500"
                  >
                    <CircularProgressLabel fontSize="xs" fontWeight="600">
                      {principle.balanceMetric}%
                    </CircularProgressLabel>
                  </CircularProgress>
                </HStack>

                <Text fontSize="sm" color="gray.700" lineHeight="tall">
                  {principle.description}
                </Text>

                <Divider />

                <VStack spacing={3} align="stretch">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="600" color={swedishBlue}>
                      UX Application:
                    </Text>
                    <Text fontSize="xs" color="gray.700" lineHeight="tall">
                      {principle.uxApplication}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="600" color="green.600">
                      Government Relevance:
                    </Text>
                    <Text fontSize="xs" color="gray.700" lineHeight="tall">
                      {principle.governmentRelevance}
                    </Text>
                  </VStack>

                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="600" color="orange.600">
                      Implementation Guidance:
                    </Text>
                    <Text fontSize="xs" color="gray.700" lineHeight="tall">
                      {principle.implementationGuidance}
                    </Text>
                  </VStack>
                </VStack>

              </VStack>
            </CardBody>
          </MotionCard>
        ))}
      </Grid>
    </VStack>
  );
};

// Main Lagom-Balanced UX Flow Component
interface LagomBalancedUXFlowProps {
  onSettingsUpdate?: (settings: LagomUXSettings) => void;
  onFlowStateChange?: (state: LagomFlowState) => void;
}

export const LagomBalancedUXFlow: React.FC<LagomBalancedUXFlowProps> = ({
  onSettingsUpdate = () => console.log('Lagom UX settings updated'),
  onFlowStateChange = () => console.log('Lagom flow state changed')
}) => {

  const [lagomSettings, setLagomSettings] = useState<LagomUXSettings>({
    paceModeration: 75,
    inclusivityLevel: 85,
    consensusBuilding: 90,
    informationDensity: 70,
    culturalAuthenticity: 95,
    governmentFormality: 80
  });

  const [isFlowActive, setIsFlowActive] = useState(false);

  // Calculate Lagom Flow State based on settings
  const _lagomState = useMemo<LagomFlowState>(() => {
    // Calculate balanced scores based on lagom principles
      (100 - Math.abs(lagomSettings.paceModeration - 75)) * 0.4 +
      (100 - Math.abs(lagomSettings.informationDensity - 70)) * 0.6
    );

      (lagomSettings.paceModeration * 0.3) + 
      (lagomSettings.culturalAuthenticity * 0.7)
    );
      100 - (Math.abs(lagomSettings.paceModeration - 75) + 
             Math.abs(lagomSettings.informationDensity - 70)) / 2
    );
      (lagomSettings.informationDensity * 0.6) + 
      (lagomSettings.governmentFormality * 0.4)
    );

    return {
      balance: Math.max(0, Math.min(100, balance)),
      inclusivity: Math.max(0, Math.min(100, inclusivity)),
      sustainability: Math.max(0, Math.min(100, sustainability)),
      moderation: Math.max(0, Math.min(100, moderation)),
      consensus: Math.max(0, Math.min(100, consensus)),
      transparency: Math.max(0, Math.min(100, transparency))
    };
  }, [lagomSettings]);


  useEffect(() => {
    onFlowStateChange(lagomState);
  }, [lagomState, onFlowStateChange]);

    (lagomState.balance + lagomState.inclusivity + lagomState.sustainability + 
     lagomState.moderation + lagomState.consensus + lagomState.transparency) / 6
  );

  return (
    <VStack spacing={8} align="stretch">
      
      {/* Lagom-Balanced UX Flow Header */}
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
                  <Icon as={FiBalance} w={8} h={8} color={swedishYellow} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800">
                      Lagom-Balanced UX Flow Excellence
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      Swedish cultural values integrated into government stakeholder UX design
                    </Text>
                  </VStack>
                </HStack>
                
                <VStack align="end" spacing={1}>
                  <Badge bg={swedishYellow} color={swedishBlue} p={2} borderRadius="lg" fontSize="sm">
                    🇸🇪 Authentic Swedish UX
                  </Badge>
                  <Text fontSize="xs" opacity={0.8}>
                    Government Excellence Optimized
                  </Text>
                </VStack>
              </HStack>

              {/* Overall Lagom Metrics */}
              <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color={swedishYellow}>
                    {overallLagomScore}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Overall Lagom Balance
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="green.300">
                    {lagomState.consensus}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Consensus Building
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="blue.300">
                    {lagomState.inclusivity}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Inclusivity Level
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="orange.300">
                    {lagomSettings.culturalAuthenticity}%
                  </Text>
                  <Text fontSize="sm" textAlign="center">
                    Cultural Authenticity
                  </Text>
                </VStack>
              </Grid>

              {/* Flow Control */}
              <HStack justify="center" spacing={4}>
                <Button
                  size="lg"
                  colorScheme={isFlowActive ? "red" : "green"}
                  onClick={() => setIsFlowActive(!isFlowActive)}
                  leftIcon={<Icon as={isFlowActive ? FiPause : FiPlay} />}
                  bg={isFlowActive ? "red.500" : "green.500"}
                  color="white"
                  _hover={{
                    bg: isFlowActive ? "red.600" : "green.600"
                  }}
                >
                  {isFlowActive ? 'Pausa Lagom Flow' : 'Aktivera Lagom Flow'}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  borderColor={swedishYellow}
                  color={swedishYellow}
                  _hover={{
                    bg: swedishYellow,
                    color: swedishBlue
                  }}
                  leftIcon={<Icon as={FiRefreshCw} />}
                  onClick={() => setLagomSettings({
                    paceModeration: 75,
                    inclusivityLevel: 85,
                    consensusBuilding: 90,
                    informationDensity: 70,
                    culturalAuthenticity: 95,
                    governmentFormality: 80
                  })}
                >
                  Reset till Optimal Lagom
                </Button>
              </HStack>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Lagom Flow Visualization and Controls */}
      <Grid templateColumns={{ base: "1fr", lg: "400px 1fr" }} gap={8}>
        
        {/* Lagom Flow Visualization */}
        <Box display="flex" justifyContent="center" alignItems="center">
          <LagomFlowVisualization
            lagomState={lagomState}
            isActive={isFlowActive}
          />
        </Box>

        {/* Lagom UX Control Panel */}
        <LagomUXControlPanel
          settings={lagomSettings}
          onSettingsChange={handleSettingsChange}
          lagomState={lagomState}
        />

      </Grid>

      {/* Lagom Principles Display */}
      <LagomPrincipleDisplay />

      {/* Swedish Government UX Excellence Summary */}
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
                  Swedish Government UX Excellence Through Lagom Balance
                </Text>
              </HStack>

              <Text fontSize="sm" color="green.700" lineHeight="tall">
                Lagom-balanced UX flow creates optimal government stakeholder experience by integrating 
                authentic Swedish cultural values med modern digital excellence. Perfect balance av 
                inclusivity, consensus-building, transparency, och sustainability ensures government 
                officials recognize both cultural authenticity och professional competence.
              </Text>

              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="green.500">
                    Perfect
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Cultural Balance
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    Inclusive
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Democratic Participation
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="orange.500">
                    Sustainable
                  </Text>
                  <Text fontSize="sm" color="green.600" textAlign="center">
                    Long-term Excellence
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