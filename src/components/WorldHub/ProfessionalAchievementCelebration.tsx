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
  Grid,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Divider
} from '@chakra-ui/react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  FiAward,
  FiTrendingUp,
  FiUsers,
  FiTarget,
  FiStar,
  FiCheck,
  FiChevronRight,
  FiBriefcase,
  FiGlobe,
  FiShield,
  FiBook,
  FiCertificate,
  FiFlag
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';


// Professional Achievement Categories för Municipal Contexts
interface ProfessionalAchievement {
  id: string;
  category: 'competency' | 'certification' | 'collaboration' | 'innovation' | 'leadership';
  title: string;
  description: string;
  professionalValue: string;
  careerImpact: string;
  level: 1 | 2 | 3 | 4 | 5;
  earnedDate?: string;
  culturalAdaptation: {
    swedish: string;
    german: string;
    french: string;
    dutch: string;
  };
  municipalRelevance: string;
  workplaceAppropriate: boolean;
  governmentRecognized: boolean;
  europeanQualification?: string;
}

// Government-Appropriate Achievement Definitions
const professionalAchievements: ProfessionalAchievement[] = [
  {
    id: 'emergency_response_competency_1',
    category: 'competency',
    title: 'Emergency Response Coordination Competency',
    description: 'Demonstrated competency in municipal emergency response coordination procedures',
    professionalValue: 'Enhanced emergency management capabilities för municipal safety',
    careerImpact: 'Qualifies för senior emergency management positions',
    level: 1,
    culturalAdaptation: {
      swedish: 'Lagom approach to crisis management - balanced och methodical',
      german: 'Systematische emergency protocols with thorough documentation',
      french: 'Service public excellence in citizen safety coordination',
      dutch: 'Direct, efficient emergency response with clear communication'
    },
    municipalRelevance: 'Critical för municipal safety and citizen protection responsibilities',
    workplaceAppropriate: true,
    governmentRecognized: true,
    europeanQualification: 'EQF Level 5 Emergency Management'
  },
  {
    id: 'budget_planning_mastery_3',
    category: 'certification',
    title: 'Municipal Budget Planning Mastery Certification',
    description: 'Advanced certification in strategic municipal budget planning and resource allocation',
    professionalValue: 'Expert-level budget planning capabilities för municipal efficiency',
    careerImpact: 'Enables advancement to senior financial management roles',
    level: 3,
    earnedDate: '2024-12-15',
    culturalAdaptation: {
      swedish: 'Consensus-driven budget planning with stakeholder collaboration',
      german: 'Detailed financial analysis with systematic budget control',
      french: 'Strategic budget planning för public service excellence',
      dutch: 'Practical budget optimization with efficient resource allocation'
    },
    municipalRelevance: 'Essential för responsible municipal financial management',
    workplaceAppropriate: true,
    governmentRecognized: true,
    europeanQualification: 'EQF Level 6 Public Financial Management'
  },
  {
    id: 'digital_transformation_leadership_4',
    category: 'leadership',
    title: 'Digital Transformation Leadership Excellence',
    description: 'Leadership excellence in municipal digital transformation initiatives',
    professionalValue: 'Advanced leadership capabilities för digital modernization',
    careerImpact: 'Qualifies för executive digital strategy positions',
    level: 4,
    earnedDate: '2024-11-28',
    culturalAdaptation: {
      swedish: 'Collaborative digital innovation with consensus building',
      german: 'Systematic digital transformation with change management',
      french: 'Digital excellence leadership för public service modernization',
      dutch: 'Pragmatic digital leadership with results-focused implementation'
    },
    municipalRelevance: 'Vital för municipal digital strategy and modernization',
    workplaceAppropriate: true,
    governmentRecognized: true,
    europeanQualification: 'EQF Level 7 Digital Leadership'
  },
  {
    id: 'stakeholder_relations_expert_2',
    category: 'collaboration',
    title: 'Stakeholder Relations Professional Excellence',
    description: 'Professional excellence in municipal stakeholder engagement and relationship management',
    professionalValue: 'Enhanced stakeholder communication and relationship building',
    careerImpact: 'Enables advancement to senior public relations positions',
    level: 2,
    culturalAdaptation: {
      swedish: 'Transparent communication with consensus-seeking approach',
      german: 'Structured stakeholder engagement with clear processes',
      french: 'Diplomatic excellence in public service communication',
      dutch: 'Direct, honest communication with practical solutions'
    },
    municipalRelevance: 'Critical för effective municipal governance and citizen engagement',
    workplaceAppropriate: true,
    governmentRecognized: true,
    europeanQualification: 'EQF Level 5 Public Communication'
  },
  {
    id: 'cross_cultural_competency_5',
    category: 'innovation',
    title: 'European Cross-Cultural Competency Master',
    description: 'Master-level competency in European cross-cultural municipal cooperation',
    professionalValue: 'Advanced cultural intelligence för European municipal collaboration',
    careerImpact: 'Qualifies för international municipal cooperation leadership',
    level: 5,
    earnedDate: '2024-10-22',
    culturalAdaptation: {
      swedish: 'International collaboration with lagom balance and inclusivity',
      german: 'Systematic cross-cultural competency with methodical approach',
      french: 'Cultural diplomacy excellence för European cooperation',
      dutch: 'Practical international cooperation with efficient communication'
    },
    municipalRelevance: 'Essential för European municipal cooperation and knowledge sharing',
    workplaceAppropriate: true,
    governmentRecognized: true,
    europeanQualification: 'EQF Level 8 International Cooperation'
  }
];

// Government-Appropriate Achievement Icons

// Professional Achievement Celebration Components
interface AchievementBadgeProps {
  achievement: ProfessionalAchievement;
  isEarned: boolean;
  culturalContext: string;
  onAchievementSelect?: (achievement: ProfessionalAchievement) => void;
}

const ProfessionalAchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  isEarned,
  culturalContext,
  onAchievementSelect = () => {}
}) => {
  const { currentTheme } = useCulturalTheme();
  


  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      cursor="pointer"
      onClick={() => onAchievementSelect(achievement)}
      bg={isEarned ? "white" : "gray.50"}
      borderColor={isEarned ? colors.primary : "gray.200"}
      borderWidth="2px"
      opacity={isEarned ? 1 : 0.7}
      position="relative"
      overflow="hidden"
    >
      <CardBody p={4}>
        <VStack spacing={3} align="center">
          
          {/* Achievement Icon with Professional Styling */}
          <Box
            position="relative"
            w={16}
            h={16}
            bg={isEarned ? colors.primary : "gray.300"}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow={isEarned ? `0 4px 12px ${colors.primary}30` : "md"}
          >
            <Icon as={CategoryIcon} w={8} h={8} color="white" />
            
            {isEarned && (
              <Box
                position="absolute"
                top={-1}
                right={-1}
                w={6}
                h={6}
                bg="green.500"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="2px solid white"
              >
                <Icon as={FiCheck} w={3} h={3} color="white" />
              </Box>
            )}
          </Box>

          {/* Achievement Title */}
          <VStack spacing={1} align="center">
            <Text
              fontSize="sm"
              fontWeight="700"
              color={isEarned ? colors.primary : "gray.600"}
              textAlign="center"
              lineHeight="tight"
              noOfLines={2}
            >
              {achievement.title}
            </Text>
            
            <HStack spacing={1}>
              <Badge
                size="sm"
                colorScheme={isEarned ? "green" : "gray"}
                variant="solid"
              >
                Level {achievement.level}
              </Badge>
              {achievement.governmentRecognized && (
                <Badge size="sm" colorScheme="blue" variant="outline">
                  Gov. Recognized
                </Badge>
              )}
            </HStack>
          </VStack>

          {/* Professional Value Indicator */}
          <Box w="100%">
            <Text fontSize="xs" color="gray.600" mb={1}>
              Professional Value:
            </Text>
            <Progress
              value={achievement.level * 20}
              colorScheme={isEarned ? "green" : "gray"}
              size="sm"
              borderRadius="full"
            />
          </Box>

          {/* Earned Date Display */}
          {isEarned && achievement.earnedDate && (
            <Text fontSize="xs" color="green.600" fontWeight="600">
              Earned: {new Date(achievement.earnedDate).toLocaleDateString()}
            </Text>
          )}

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Achievement Detail Modal
interface AchievementDetailModalProps {
  achievement: ProfessionalAchievement | null;
  isOpen: boolean;
  onClose: () => void;
  culturalContext: string;
}

const ProfessionalAchievementDetailModal: React.FC<AchievementDetailModalProps> = ({
  achievement,
  isOpen,
  onClose,
  culturalContext
}) => {
  if (!achievement) return null;

  const { currentTheme } = useCulturalTheme();
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="white" borderRadius="xl" border="2px solid" borderColor={currentTheme.colors.primary + '30'}>
        <ModalHeader>
          <HStack spacing={3}>
            <Box
              w={12}
              h={12}
              bg={currentTheme.colors.primary}
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={CategoryIcon} w={6} h={6} color="white" />
            </Box>
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                {achievement.title}
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" variant="solid">
                  {achievement.category}
                </Badge>
                <Badge colorScheme="green" variant="outline">
                  Level {achievement.level}
                </Badge>
                {achievement.governmentRecognized && (
                  <Badge colorScheme="purple" variant="solid">
                    Government Recognized
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            
            {/* Achievement Status */}
            <Card bg={isEarned ? "green.50" : "gray.50"} borderColor={isEarned ? "green.200" : "gray.200"}>
              <CardBody p={4}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontSize="md" fontWeight="600" color={isEarned ? "green.700" : "gray.700"}>
                      {isEarned ? 'Achievement Earned' : 'In Progress'}
                    </Text>
                    {isEarned && achievement.earnedDate && (
                      <Text fontSize="sm" color="green.600">
                        Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                      </Text>
                    )}
                  </VStack>
                  {isEarned && <Icon as={FiCheck} w={8} h={8} color="green.500" />}
                </HStack>
              </CardBody>
            </Card>

            {/* Professional Description */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                Professional Description:
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                {achievement.description}
              </Text>
            </Box>

            {/* Professional Value */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                Professional Value:
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                {achievement.professionalValue}
              </Text>
            </Box>

            {/* Career Impact */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                Career Advancement Impact:
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                {achievement.careerImpact}
              </Text>
            </Box>

            {/* Cultural Adaptation */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                Cultural Context ({culturalContext}):
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall" fontStyle="italic">
                {culturalAdaptationText}
              </Text>
            </Box>

            {/* Municipal Relevance */}
            <Box>
              <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                Municipal Relevance:
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="tall">
                {achievement.municipalRelevance}
              </Text>
            </Box>

            {/* European Qualification */}
            {achievement.europeanQualification && (
              <Box>
                <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                  European Qualification Framework:
                </Text>
                <Badge colorScheme="purple" variant="solid" p={2} borderRadius="md">
                  {achievement.europeanQualification}
                </Badge>
              </Box>
            )}

            {/* Professional Progress Indicator */}
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary}>
                  Professional Competency Level:
                </Text>
                <Text fontSize="sm" fontWeight="700" color={currentTheme.colors.primary}>
                  {achievement.level}/5
                </Text>
              </HStack>
              <Progress
                value={achievement.level * 20}
                colorScheme="blue"
                size="lg"
                borderRadius="full"
              />
            </Box>

          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Main Professional Achievement Celebration Component
interface ProfessionalAchievementCelebrationProps {
  onAchievementProgress?: (achievementId: string, progress: number) => void;
}

export const ProfessionalAchievementCelebration: React.FC<ProfessionalAchievementCelebrationProps> = ({
  onAchievementProgress = () => console.log('Achievement progress updated')
}) => {
  const { culturalContext, currentTheme } = useCulturalTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAchievement, setSelectedAchievement] = useState<ProfessionalAchievement | null>(null);
  
  // Calculate achievement statistics


  // Group achievements by category
