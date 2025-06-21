// AchievementEngine Component - Municipal Professional Achievement System
// Implements 5-level competency progression with cultural adaptations
// Integrates with Q2 mechanics: drag-drop workflows, timed challenges, branching narratives

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Tooltip,
  Grid,
  GridItem,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Flex,
  Divider
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  MunicipalCompetencyLevel,
  AchievementCategory,
  CulturalContext,
  ProfessionalAchievement,
  AchievementProgress,
  CompetencyProgress,
  AchievementMilestone,
  PeerRecognitionSystem
} from '../../types/achievement-system';
import { useAchievementProgress } from '../../hooks/useAchievementProgress';
import { useCulturalContext } from '../../contexts/CharacterContext';

// Professional icons mapping for achievement categories
const categoryIcons = {
  drag_drop_workflows: '📋',
  timed_challenges: '⏱️',
  branching_narratives: '🌳',
  character_relationships: '🤝',
  municipal_compliance: '✅',
  citizen_service: '👥',
  cultural_adaptation: '🌍',
  leadership_development: '👑',
  innovation_implementation: '💡',
  emergency_response: '🚨'
};

// Competency level styling and display
const competencyLevelConfig = {
  novice: {
    color: 'gray',
    displayName: 'Novice',
    description: 'Beginning municipal professional',
    icon: '🌱',
    progressThreshold: 20
  },
  competent: {
    color: 'blue',
    displayName: 'Competent',
    description: 'Developing municipal skills',
    icon: '🔨',
    progressThreshold: 40
  },
  proficient: {
    color: 'green',
    displayName: 'Proficient',
    description: 'Skilled municipal professional',
    icon: '⭐',
    progressThreshold: 60
  },
  expert: {
    color: 'purple',
    displayName: 'Expert',
    description: 'Advanced municipal expertise',
    icon: '🏆',
    progressThreshold: 80
  },
  master: {
    color: 'gold',
    displayName: 'Master',
    description: 'Municipal excellence leader',
    icon: '👑',
    progressThreshold: 100
  }
};

interface AchievementEngineProps {
  characterId: string;
  culturalContext: CulturalContext;
  onAchievementUnlocked?: (achievement: ProfessionalAchievement) => void;
  onMilestoneCompleted?: (milestone: AchievementMilestone) => void;
  enablePeerRecognition?: boolean;
  showDetailedProgress?: boolean;
  municipalBranding?: {
    primaryColor: string;
    municipality: string;
    logoUrl?: string;
  };
}

export const AchievementEngine: React.FC<AchievementEngineProps> = ({
  characterId,
  culturalContext,
  onAchievementUnlocked,
  onMilestoneCompleted,
  enablePeerRecognition = true,
  showDetailedProgress = true,
  municipalBranding
}) => {
  const { culturalContext: charCulturalContext } = useCulturalContext();
  const activeCulture = culturalContext || charCulturalContext.currentCulture;
  
  const {
    achievementProgress,
    updateCompetencyProgress,
    unlockAchievement,
    addPeerRecognition,
    calculateNextMilestone,
    getMunicipalServiceImpact
  } = useAchievementProgress(characterId);

  // Theme adaptations
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.400');
  
  const primaryColor = municipalBranding?.primaryColor || '#0066CC';

  // Cultural adaptations for achievement display
  const getCulturalDisplayName = (level: MunicipalCompetencyLevel): string => {
    const culturalMappings = {
      swedish: {
        novice: 'Nybörjare',
        competent: 'Kompetent',
        proficient: 'Skicklig',
        expert: 'Expert',
        master: 'Mästare'
      },
      german: {
        novice: 'Anfänger',
        competent: 'Kompetent',
        proficient: 'Qualifiziert',
        expert: 'Experte',
        master: 'Meister'
      },
      french: {
        novice: 'Novice',
        competent: 'Compétent',
        proficient: 'Qualifié',
        expert: 'Expert',
        master: 'Maître'
      },
      dutch: {
        novice: 'Beginner',
        competent: 'Competent',
        proficient: 'Bekwaam',
        expert: 'Expert',
        master: 'Meester'
      }
    };
    
    return culturalMappings[activeCulture]?.[level] || competencyLevelConfig[level].displayName;
  };

  // Calculate overall competency level
  const overallLevel = useMemo(() => {
    if (!achievementProgress) return 'novice';
    
    const totalProgress = achievementProgress.overallProgress;
    if (totalProgress >= 80) return 'master';
    if (totalProgress >= 60) return 'expert';
    if (totalProgress >= 40) return 'proficient';
    if (totalProgress >= 20) return 'competent';
    return 'novice';
  }, [achievementProgress]);

  // Group competencies by category
  const competenciesByCategory = useMemo(() => {
    if (!achievementProgress) return {};
    
    const grouped: Record<AchievementCategory, CompetencyProgress[]> = {} as any;
    
    Object.values(achievementProgress.competencyProgress).forEach(competency => {
      // Determine category from competency ID or default categorization
      const category = determineCompetencyCategory(competency.competencyId);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(competency);
    });
    
    return grouped;
  }, [achievementProgress]);

  const determineCompetencyCategory = (competencyId: string): AchievementCategory => {
    if (competencyId.includes('drag_drop')) return 'drag_drop_workflows';
    if (competencyId.includes('timed')) return 'timed_challenges';
    if (competencyId.includes('narrative')) return 'branching_narratives';
    if (competencyId.includes('relationship')) return 'character_relationships';
    if (competencyId.includes('compliance')) return 'municipal_compliance';
    if (competencyId.includes('citizen')) return 'citizen_service';
    if (competencyId.includes('cultural')) return 'cultural_adaptation';
    if (competencyId.includes('leadership')) return 'leadership_development';
    if (competencyId.includes('innovation')) return 'innovation_implementation';
    if (competencyId.includes('emergency')) return 'emergency_response';
    return 'citizen_service'; // Default category
  };

  // Competency Level Display Component
  const CompetencyLevelBadge: React.FC<{ 
    level: MunicipalCompetencyLevel; 
    progress: number;
    isCurrentLevel?: boolean;
  }> = ({ level, progress, isCurrentLevel = false }) => {
    const config = competencyLevelConfig[level];
    const culturalName = getCulturalDisplayName(level);
    
    return (
      <Tooltip label={`${culturalName}: ${config.description}`}>
        <Badge
          colorScheme={config.color}
          size="lg"
          px={3}
          py={1}
          borderRadius="full"
          fontWeight="bold"
          opacity={isCurrentLevel ? 1.0 : 0.7}
          border={isCurrentLevel ? '2px solid' : 'none'}
          borderColor={primaryColor}
        >
          <HStack spacing={1}>
            <Text fontSize="sm">{config.icon}</Text>
            <Text fontSize="sm">{culturalName}</Text>
            {isCurrentLevel && (
              <Text fontSize="xs" color="gray.500">
                {Math.round(progress)}%
              </Text>
            )}
          </HStack>
        </Badge>
      </Tooltip>
    );
  };

  // Achievement Category Card Component
  const CategoryCard: React.FC<{
    category: AchievementCategory;
    competencies: CompetencyProgress[];
  }> = ({ category, competencies }) => {
    const avgProgress = competencies.reduce((sum, comp) => sum + comp.progress, 0) / competencies.length;
    const avgLevel = competencies.reduce((acc, comp) => {
      const levelValue = Object.keys(competencyLevelConfig).indexOf(comp.currentLevel);
      return acc + levelValue;
    }, 0) / competencies.length;
    
    const displayLevel = Object.keys(competencyLevelConfig)[Math.floor(avgLevel)] as MunicipalCompetencyLevel;
    
    return (
      <Card bg={bgColor} borderColor={borderColor} shadow="sm">
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack spacing={2}>
              <Text fontSize="lg">{categoryIcons[category]}</Text>
              <Text fontWeight="bold" color={textColor}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </HStack>
            <CompetencyLevelBadge level={displayLevel} progress={avgProgress} />
          </HStack>
        </CardHeader>
        <CardBody pt={0}>
          <VStack spacing={3} align="stretch">
            <Progress
              value={avgProgress}
              colorScheme={competencyLevelConfig[displayLevel].color}
              size="md"
              borderRadius="full"
            />
            
            <Accordion allowToggle size="sm">
              {competencies.map((competency) => (
                <AccordionItem key={competency.competencyId} border="none">
                  <AccordionButton px={0} py={1}>
                    <Box flex="1" textAlign="left">
                      <HStack justify="space-between">
                        <Text fontSize="sm" color={textColor}>
                          {competency.competencyId.replace(/_/g, ' ')}
                        </Text>
                        <CompetencyLevelBadge 
                          level={competency.currentLevel} 
                          progress={competency.progress}
                          isCurrentLevel={true}
                        />
                      </HStack>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={2} px={0}>
                    <VStack spacing={2} align="stretch">
                      <Progress
                        value={competency.progress}
                        colorScheme={competencyLevelConfig[competency.currentLevel].color}
                        size="sm"
                      />
                      <Text fontSize="xs" color={mutedTextColor}>
                        Trend: {competency.trendDirection === 'improving' ? '📈' : 
                                competency.trendDirection === 'declining' ? '📉' : '➡️'} 
                        {competency.trendDirection}
                      </Text>
                      {competency.culturalAdaptationProgress[activeCulture] && (
                        <Text fontSize="xs" color={mutedTextColor}>
                          Cultural adaptation: {Math.round(competency.culturalAdaptationProgress[activeCulture])}%
                        </Text>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </CardBody>
      </Card>
    );
  };

  // Achievements Display Component
  const AchievementsPanel: React.FC = () => {
    if (!achievementProgress) return null;
    
    const recentAchievements = achievementProgress.achievementsEarned
      .sort((a, b) => b.unlockedDate.getTime() - a.unlockedDate.getTime())
      .slice(0, 5);
    
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Recent Achievements
        </Text>
        
        {recentAchievements.length === 0 ? (
          <Box textAlign="center" p={6} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
            <Text color={mutedTextColor}>
              Complete municipal training scenarios to unlock your first achievement!
            </Text>
          </Box>
        ) : (
          <VStack spacing={3}>
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.achievementId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card bg={bgColor} borderColor={borderColor} shadow="sm" w="100%">
                  <CardBody>
                    <HStack justify="space-between" align="start">
                      <VStack align="start" spacing={1} flex={1}>
                        <HStack>
                          <Text fontSize="lg">
                            {categoryIcons[achievement.achievementType]}
                          </Text>
                          <Text fontWeight="bold" color={textColor}>
                            {achievement.title}
                          </Text>
                          <CompetencyLevelBadge 
                            level={achievement.competencyLevel} 
                            progress={100}
                          />
                        </HStack>
                        <Text fontSize="sm" color={mutedTextColor}>
                          {achievement.description}
                        </Text>
                        <HStack spacing={4} mt={2}>
                          <Text fontSize="xs" color={mutedTextColor}>
                            🎯 Service Impact: {achievement.impactMetrics.citizenServiceImprovement}%
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            ⚡ Efficiency: {achievement.impactMetrics.processEfficiencyGain}%
                          </Text>
                          <Text fontSize="xs" color={mutedTextColor}>
                            ✅ Compliance: {achievement.impactMetrics.complianceScore}%
                          </Text>
                        </HStack>
                      </VStack>
                      <VStack align="end" spacing={1}>
                        <Text fontSize="xs" color={mutedTextColor}>
                          {achievement.unlockedDate.toLocaleDateString()}
                        </Text>
                        {achievement.municipalCredentials.governmentRecognition && (
                          <Badge colorScheme="green" size="sm">
                            Gov. Recognized
                          </Badge>
                        )}
                      </VStack>
                    </HStack>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </VStack>
        )}
      </VStack>
    );
  };

  // Milestones Panel Component
  const MilestonesPanel: React.FC = () => {
    if (!achievementProgress) return null;
    
    const nextMilestones = achievementProgress.nextMilestones.slice(0, 3);
    
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Upcoming Milestones
        </Text>
        
        {nextMilestones.map((milestone, index) => (
          <Card key={milestone.milestoneId} bg={bgColor} borderColor={borderColor} shadow="sm">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize="lg">{categoryIcons[milestone.category]}</Text>
                    <Text fontWeight="bold" color={textColor}>
                      {milestone.milestoneName}
                    </Text>
                  </HStack>
                  <Badge 
                    colorScheme={competencyLevelConfig[milestone.targetLevel].color}
                    size="lg"
                  >
                    {getCulturalDisplayName(milestone.targetLevel)}
                  </Badge>
                </HStack>
                
                <Text fontSize="sm" color={mutedTextColor}>
                  {milestone.municipalRelevance}
                </Text>
                
                <Divider />
                
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm" fontWeight="medium" color={textColor}>
                    Required Actions:
                  </Text>
                  {milestone.requiredActions.map((action, actionIndex) => (
                    <HStack key={actionIndex} spacing={2}>
                      <Box w={2} h={2} bg="gray.400" borderRadius="full" />
                      <Text fontSize="sm" color={mutedTextColor}>
                        {action}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
                
                <HStack justify="space-between" mt={2}>
                  <Badge colorScheme="blue" variant="outline">
                    Difficulty: {milestone.estimatedDifficulty}
                  </Badge>
                  <Text fontSize="xs" color={mutedTextColor}>
                    🎯 Impact: +{milestone.rewardValue.municipalServiceImpact} pts
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    );
  };

  // Peer Recognition Panel Component
  const PeerRecognitionPanel: React.FC = () => {
    if (!achievementProgress || !enablePeerRecognition) return null;
    
    const recentRecognitions = achievementProgress.peerRecognitions
      .sort((a, b) => new Date(b.validationDate || 0).getTime() - new Date(a.validationDate || 0).getTime())
      .slice(0, 3);
    
    return (
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold" color={textColor}>
          Peer Recognition
        </Text>
        
        {recentRecognitions.length === 0 ? (
          <Box textAlign="center" p={6} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
            <Text color={mutedTextColor}>
              No peer recognitions yet. Continue demonstrating excellence in municipal service!
            </Text>
          </Box>
        ) : (
          <VStack spacing={3}>
            {recentRecognitions.map((recognition) => (
              <Card key={recognition.recognitionId} bg={bgColor} borderColor={borderColor} shadow="sm">
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <HStack justify="space-between">
                      <HStack>
                        <Text fontSize="lg">🤝</Text>
                        <Text fontWeight="bold" color={textColor}>
                          {recognition.recognitionType.replace(/_/g, ' ')}
                        </Text>
                      </HStack>
                      <Badge 
                        colorScheme={recognition.validationStatus === 'approved' ? 'green' : 'yellow'}
                      >
                        {recognition.validationStatus}
                      </Badge>
                    </HStack>
                    
                    <Text fontSize="sm" color={textColor}>
                      From: {recognition.nominator.nominatorName}
                    </Text>
                    
                    <Text fontSize="sm" color={mutedTextColor}>
                      "{recognition.recognitionReason}"
                    </Text>
                    
                    <HStack justify="space-between">
                      <Text fontSize="xs" color={mutedTextColor}>
                        Impact Score: {recognition.impactScore}/100
                      </Text>
                      <Text fontSize="xs" color={mutedTextColor}>
                        {recognition.validationDate?.toLocaleDateString()}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>
    );
  };

  if (!achievementProgress) {
    return (
      <Box textAlign="center" p={8}>
        <Text color={mutedTextColor}>Loading achievement progress...</Text>
      </Box>
    );
  }

  return (
    <Box w="100%" maxW="1200px" mx="auto" p={4}>
      {/* Header Section */}
      <VStack spacing={4} mb={6}>
        {municipalBranding && (
          <HStack spacing={3}>
            {municipalBranding.logoUrl && (
              <Box w={10} h={10}>
                <img 
                  src={municipalBranding.logoUrl} 
                  alt={`${municipalBranding.municipality} logo`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </Box>
            )}
            <Text fontSize="lg" color={mutedTextColor}>
              {municipalBranding.municipality} Professional Development
            </Text>
          </HStack>
        )}
        
        {/* Overall Progress */}
        <Card w="100%" bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="100%">
                <VStack align="start" spacing={1}>
                  <Text fontSize="xl" fontWeight="bold" color={textColor}>
                    Municipal Professional Level
                  </Text>
                  <Text fontSize="sm" color={mutedTextColor}>
                    Overall Progress: {Math.round(achievementProgress.overallProgress)}%
                  </Text>
                </VStack>
                <CompetencyLevelBadge 
                  level={overallLevel} 
                  progress={achievementProgress.overallProgress}
                  isCurrentLevel={true}
                />
              </HStack>
              
              <Progress
                value={achievementProgress.overallProgress}
                colorScheme={competencyLevelConfig[overallLevel].color}
                size="lg"
                w="100%"
                borderRadius="full"
              />
              
              <HStack justify="space-between" w="100%" pt={2}>
                <Text fontSize="sm" color={mutedTextColor}>
                  🎯 Municipal Service Impact: {achievementProgress.municipalServiceImpactScore}/100
                </Text>
                <Text fontSize="sm" color={mutedTextColor}>
                  ⏱️ Next Level: {achievementProgress.estimatedTimeToNextLevel}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Main Content Tabs */}
      <Tabs variant="enclosed" colorScheme={competencyLevelConfig[overallLevel].color}>
        <TabList>
          <Tab>Competencies</Tab>
          <Tab>Achievements</Tab>
          <Tab>Milestones</Tab>
          {enablePeerRecognition && <Tab>Recognition</Tab>}
        </TabList>

        <TabPanels>
          {/* Competencies Tab */}
          <TabPanel px={0}>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
              {Object.entries(competenciesByCategory).map(([category, competencies]) => (
                <GridItem key={category}>
                  <CategoryCard 
                    category={category as AchievementCategory}
                    competencies={competencies}
                  />
                </GridItem>
              ))}
            </Grid>
          </TabPanel>

          {/* Achievements Tab */}
          <TabPanel px={0}>
            <AchievementsPanel />
          </TabPanel>

          {/* Milestones Tab */}
          <TabPanel px={0}>
            <MilestonesPanel />
          </TabPanel>

          {/* Peer Recognition Tab */}
          {enablePeerRecognition && (
            <TabPanel px={0}>
              <PeerRecognitionPanel />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AchievementEngine;