import React, { useMemo } from 'react';
import { 
  Grid, 
  Box, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Progress, 
  Icon, 
  Button,
  Image,
  Flex,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, 
  FiDollarSign, 
  FiMonitor, 
  FiUsers, 
  FiCheckCircle,
  FiLock,
  FiClock,
  FiPlay
} from 'react-icons/fi';
import { useCharacterContext } from '../../contexts/CharacterContext';

// World Definition Types
interface WorldInfo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  estimatedTime: string;
  icon: Record<string, unknown>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    gradientStart: string;
    gradientEnd: string;
  };
  prerequisites: string[];
  culturalFocus: Record<string, string>;
}

interface WorldProgress {
  worldId: string;
  completionPercentage: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  lastAccessed?: Date;
  achievements: string[];
  estimatedTimeRemaining?: string;
}

// 5-World Municipal Professional Development Architecture
const worldsConfig: WorldInfo[] = [
  {
    id: 'emergency_response',
    title: 'Crisis Management & Emergency Response',
    subtitle: 'Municipal emergency coordination excellence',
    description: 'Develop professional competency in crisis decision-making, multi-agency coordination, and citizen safety leadership through realistic emergency scenarios.',
    difficulty: 'Foundation',
    estimatedTime: '45-60 min',
    icon: FiShield,
    theme: {
      primaryColor: '#DC2626', // Emergency Red
      secondaryColor: '#FEF2F2', // Light Red Background
      gradientStart: '#DC2626',
      gradientEnd: '#F97316'
    },
    prerequisites: [],
    culturalFocus: {
      swedish: 'Konsensusbaserad krisberedskap',
      german: 'Systematisk krishantering',
      french: 'Coordination de crise raffinée', 
      dutch: 'Efficiënte crisisrespons'
    }
  },
  {
    id: 'budget_planning',
    title: 'Democratic Budget Planning & Resource Allocation',
    subtitle: 'Municipal financial stewardship',
    description: 'Master democratic budget processes, stakeholder engagement, and resource optimization through complex municipal financial scenarios.',
    difficulty: 'Intermediate',
    estimatedTime: '50-70 min',
    icon: FiDollarSign,
    theme: {
      primaryColor: '#059669', // Financial Green
      secondaryColor: '#F0FDF4', // Light Green Background
      gradientStart: '#059669',
      gradientEnd: '#0891B2'
    },
    prerequisites: ['emergency_response'],
    culturalFocus: {
      swedish: 'Demokratisk budgetplanering',
      german: 'Systematische Haushaltsplanung',
      french: 'Planification budgétaire excellente',
      dutch: 'Efficiënte budgetplanning'
    }
  },
  {
    id: 'digital_transformation',
    title: 'Municipal Innovation & Digital Excellence', 
    subtitle: 'Government service modernization',
    description: 'Lead digital transformation initiatives, citizen service innovation, and technology integration in municipal contexts.',
    difficulty: 'Advanced',
    estimatedTime: '60-80 min',
    icon: FiMonitor,
    theme: {
      primaryColor: '#7C3AED', // Innovation Purple
      secondaryColor: '#FAF5FF', // Light Purple Background
      gradientStart: '#7C3AED',
      gradientEnd: '#2563EB'
    },
    prerequisites: ['emergency_response'],
    culturalFocus: {
      swedish: 'Digital demokrati och innovation',
      german: 'Systematische Digitalisierung',
      french: 'Innovation numérique du service public',
      dutch: 'Praktische digitale innovatie'
    }
  },
  {
    id: 'stakeholder_relations',
    title: 'Stakeholder Engagement & Municipal Diplomacy',
    subtitle: 'Professional communication excellence',
    description: 'Develop advanced communication, negotiation, and diplomatic skills for complex municipal stakeholder relationships.',
    difficulty: 'Expert',
    estimatedTime: '55-75 min',
    icon: FiUsers,
    theme: {
      primaryColor: '#0891B2', // Diplomatic Blue
      secondaryColor: '#F0F9FF', // Light Blue Background
      gradientStart: '#0891B2',
      gradientEnd: '#059669'
    },
    prerequisites: ['budget_planning', 'digital_transformation'],
    culturalFocus: {
      swedish: 'Konsensusbyggande kommunikation',
      german: 'Professionelle Stakeholder-Verwaltung',
      french: 'Excellence diplomatique municipale',
      dutch: 'Directe stakeholder communicatie'
    }
  },
  {
    id: 'regulatory_compliance',
    title: 'Quality Assurance & Regulatory Excellence',
    subtitle: 'Municipal standards mastery',
    description: 'Achieve mastery in regulatory compliance, quality management, audit preparation, and systematic excellence across all municipal domains.',
    difficulty: 'Master',
    estimatedTime: '70-90 min',
    icon: FiCheckCircle,
    theme: {
      primaryColor: '#374151', // Professional Gray
      secondaryColor: '#F9FAFB', // Light Gray Background  
      gradientStart: '#374151',
      gradientEnd: '#6B7280'
    },
    prerequisites: ['budget_planning', 'digital_transformation', 'stakeholder_relations'],
    culturalFocus: {
      swedish: 'Systematisk kvalitetssäkring',
      german: 'Regulatory Compliance Exzellenz',
      french: 'Excellence réglementaire systémique',
      dutch: 'Systematische compliance borging'
    }
  }
];

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface WorldCardProps {
  world: WorldInfo;
  progress: WorldProgress;
  onWorldSelect: (worldId: string) => void;
  culturalContext: string;
  index: number;
}

const WorldCard: React.FC<WorldCardProps> = ({ 
  world, 
  progress, 
  onWorldSelect, 
  culturalContext,
  index 
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Determine card interaction state
  const isLocked = progress.status === 'locked';
  const isAvailable = progress.status === 'available';
  const isInProgress = progress.status === 'in_progress';
  const isCompleted = progress.status === 'completed';

  // Status icon and color
  const statusConfig = useMemo(() => {
    switch (progress.status) {
      case 'completed':
        return { icon: FiCheckCircle, color: '#059669', text: 'Slutförd' };
      case 'in_progress':
        return { icon: FiPlay, color: world.theme.primaryColor, text: `${progress.completionPercentage}% slutförd` };
      case 'available':
        return { icon: FiPlay, color: world.theme.primaryColor, text: 'Tillgänglig' };
      case 'locked':
      default:
        return { icon: FiLock, color: '#9CA3AF', text: 'Låst' };
    }
  }, [progress.status, progress.completionPercentage, world.theme.primaryColor]);

  // Cultural title adaptation
  const culturalTitle = world.culturalFocus[culturalContext] || world.title;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={!isLocked ? { y: -4, boxShadow: '2xl' } : {}}
      whileTap={!isLocked ? { scale: 0.98 } : {}}
    >
      <Box
        bg={cardBg}
        borderRadius="xl"
        border="2px solid"
        borderColor={isCompleted ? statusConfig.color : isLocked ? borderColor : world.theme.primaryColor}
        overflow="hidden"
        position="relative"
        cursor={isLocked ? 'not-allowed' : 'pointer'}
        opacity={isLocked ? 0.6 : 1}
        transition="all 0.3s ease"
        onClick={() => !isLocked && onWorldSelect(world.id)}
        minH="320px"
      >
        {/* Header with gradient background */}
        <Box
          h="80px"
          background={`linear-gradient(135deg, ${world.theme.gradientStart} 0%, ${world.theme.gradientEnd} 100%)`}
          position="relative"
          overflow="hidden"
        >
          {/* Decorative pattern overlay */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            backgroundImage="radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 2px, transparent 2px), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 2px, transparent 2px)"
            backgroundSize="30px 30px"
          />
          
          {/* World icon */}
          <Flex align="center" justify="center" h="100%" position="relative" zIndex={1}>
            <Icon 
              as={world.icon} 
              w={10} 
              h={10} 
              color="white" 
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
          </Flex>
        </Box>

        {/* Card content */}
        <VStack spacing={4} p={6} align="stretch">
          
          {/* Title and status */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between" align="flex-start">
              <Text 
                fontSize="lg" 
                fontWeight="700" 
                color={isLocked ? 'gray.500' : world.theme.primaryColor}
                lineHeight="tight"
                noOfLines={2}
                flex={1}
              >
                {world.title}
              </Text>
              <Icon 
                as={statusConfig.icon} 
                w={5} 
                h={5} 
                color={statusConfig.color}
                flexShrink={0}
                ml={2}
              />
            </HStack>
            
            <Text 
              fontSize="sm" 
              color="gray.600" 
              fontWeight="600"
              noOfLines={1}
            >
              {world.subtitle}
            </Text>
          </VStack>

          {/* Cultural focus */}
          <Text 
            fontSize="sm" 
            color={world.theme.primaryColor}
            fontWeight="600"
            fontStyle="italic"
            noOfLines={1}
          >
            {culturalTitle}
          </Text>

          {/* Difficulty and time */}
          <HStack spacing={3}>
            <Badge 
              colorScheme={world.difficulty === 'Foundation' ? 'green' : 
                         world.difficulty === 'Intermediate' ? 'blue' :
                         world.difficulty === 'Advanced' ? 'purple' :
                         world.difficulty === 'Expert' ? 'orange' : 'red'}
              variant="solid"
              fontSize="xs"
              px={2}
              py={1}
            >
              {world.difficulty}
            </Badge>
            <HStack spacing={1}>
              <Icon as={FiClock} w={3} h={3} color="gray.500" />
              <Text fontSize="xs" color="gray.600" fontWeight="500">
                {world.estimatedTime}
              </Text>
            </HStack>
          </HStack>

          {/* Progress bar (if in progress) */}
          {isInProgress && (
            <Box>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.600" fontWeight="600">
                  Framsteg
                </Text>
                <Text fontSize="xs" color={world.theme.primaryColor} fontWeight="700">
                  {progress.completionPercentage}%
                </Text>
              </HStack>
              <Progress 
                value={progress.completionPercentage} 
                colorScheme="blue"
                bg="gray.100"
                borderRadius="full"
                h={2}
              />
              {progress.estimatedTimeRemaining && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  ~{progress.estimatedTimeRemaining} kvar
                </Text>
              )}
            </Box>
          )}

          {/* Prerequisites (if locked) */}
          {isLocked && world.prerequisites.length > 0 && (
            <Box>
              <Text fontSize="xs" color="gray.500" fontWeight="600" mb={1}>
                Kräver slutförande av:
              </Text>
              <VStack spacing={1} align="stretch">
                {world.prerequisites.map((prereq) => {
                  const prereqWorld = worldsConfig.find(w => w.id === prereq);
                  return (
                    <Text key={prereq} fontSize="xs" color="gray.400">
                      • {prereqWorld?.title || prereq}
                    </Text>
                  );
                })}
              </VStack>
            </Box>
          )}

          {/* Action button */}
          <MotionButton
            colorScheme={isCompleted ? 'green' : 'blue'}
            variant={isLocked ? 'outline' : 'solid'}
            size="sm"
            isDisabled={isLocked}
            whileHover={!isLocked ? { scale: 1.02 } : {}}
            whileTap={!isLocked ? { scale: 0.98 } : {}}
            onClick={(e) => {
              e.stopPropagation();
              if (!isLocked) onWorldSelect(world.id);
            }}
          >
            {isCompleted ? 'Repetera' : 
             isInProgress ? 'Fortsätt' : 
             isAvailable ? 'Starta' : 'Låst'}
          </MotionButton>

        </VStack>
      </Box>
    </MotionBox>
  );
};

interface WorldNavigationGridProps {
  worldProgresses: WorldProgress[];
  onWorldSelect: (worldId: string) => void;
}

export const WorldNavigationGrid: React.FC<WorldNavigationGridProps> = ({
  worldProgresses,
  onWorldSelect
}) => {
  const { currentPersona } = useCharacterContext();
  
  // Determine cultural context
  const culturalContext = useMemo(() => {
    const personaThemeMap: Record<string, string> = {
      'Anna': 'swedish',
      'Klaus': 'german',
      'Marie': 'french', 
      'Pieter': 'dutch'
    };
    return personaThemeMap[currentPersona?.name || 'Anna'] || 'swedish';
  }, [currentPersona]);

  return (
    <VStack spacing={6} w="100%">
      
      {/* Section header */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        w="100%"
      >
        <VStack spacing={2}>
          <Text 
            fontSize="2xl" 
            fontWeight="800" 
            color="gray.700"
            textAlign="center"
          >
            Kommunala Kompetensutvecklingsvärldar
          </Text>
          <Text 
            fontSize="md" 
            color="gray.600"
            textAlign="center"
            maxW="2xl"
          >
            Utveckla yrkeskompetens genom realistiska kommunala scenarier i fem specialiserade världar
          </Text>
        </VStack>
      </MotionBox>

      {/* World cards grid */}
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        }}
        gap={6}
        w="100%"
        maxW="6xl"
      >
        {worldsConfig.map((world, index) => {
          const progress = worldProgresses.find(p => p.worldId === world.id) || {
            worldId: world.id,
            completionPercentage: 0,
            status: 'locked' as const,
            achievements: []
          };

          return (
            <WorldCard
              key={world.id}
              world={world}
              progress={progress}
              onWorldSelect={onWorldSelect}
              culturalContext={culturalContext}
              index={index}
            />
          );
        })}
      </Grid>

    </VStack>
  );
};