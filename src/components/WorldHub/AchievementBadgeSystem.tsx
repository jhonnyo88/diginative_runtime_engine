import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  Icon,
  Tooltip,
  Grid,
  Progress,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShield,
  FiDollarSign,
  FiMonitor,
  FiUsers,
  FiCheckCircle,
  FiAward,
  FiTrendingUp,
  FiGlobe,
  FiStar,
  FiTarget
} from 'react-icons/fi';
import { useCharacterContext } from '../../contexts/CharacterContext';

// Municipal Professional Achievement Types
interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'world_specific' | 'cross_world_synthesis' | 'cultural_intelligence' | 'professional_certification';
  level: 'novice' | 'competent' | 'proficient' | 'expert' | 'master';
  worldId?: string;
  icon: any;
  color: string;
  earned: boolean;
  progress?: number;
  earnedDate?: Date;
  culturalVariants: Record<string, { title: string; description: string }>;
}

interface CompetencyLevel {
  level: 'novice' | 'competent' | 'proficient' | 'expert' | 'master';
  title: string;
  description: string;
  requiredAchievements: number;
  color: string;
  culturalTitles: Record<string, string>;
}

// 5-Level Municipal Professional Competency Framework
const competencyLevels: CompetencyLevel[] = [
  {
    level: 'novice',
    title: 'Nybörjare Kommunal Professional',
    description: 'Grundläggande förståelse för kommunal verksamhet',
    requiredAchievements: 3,
    color: '#10B981',
    culturalTitles: {
      swedish: 'Nybörjare Kommunal Professional',
      german: 'Novize Verwaltungsprofi',
      french: 'Novice du Service Public',
      dutch: 'Beginnende Bestuurlijke Professional'
    }
  },
  {
    level: 'competent',
    title: 'Kompetent Kommunal Professional',
    description: 'Solid grund i kommunala arbetsprocesser',
    requiredAchievements: 8,
    color: '#3B82F6',
    culturalTitles: {
      swedish: 'Kompetent Kommunal Professional',
      german: 'Kompetenter Verwaltungsprofi',
      french: 'Professionnel Compétent du Service Public',
      dutch: 'Competente Bestuurlijke Professional'
    }
  },
  {
    level: 'proficient',
    title: 'Skicklig Kommunal Professional',
    description: 'Avancerad kompetens inom flera kommunala domäner',
    requiredAchievements: 15,
    color: '#8B5CF6',
    culturalTitles: {
      swedish: 'Skicklig Kommunal Professional',
      german: 'Versierter Verwaltungsprofi',
      french: 'Professionnel Accompli du Service Public',
      dutch: 'Bekwame Bestuurlijke Professional'
    }
  },
  {
    level: 'expert',
    title: 'Expert Kommunal Professional',
    description: 'Expertis inom kommunal verksamhet och ledarskap',
    requiredAchievements: 25,
    color: '#F59E0B',
    culturalTitles: {
      swedish: 'Expert Kommunal Professional',
      german: 'Experte Verwaltungsprofi',
      french: 'Expert du Service Public',
      dutch: 'Expert Bestuurlijke Professional'
    }
  },
  {
    level: 'master',
    title: 'Mästare Kommunal Professional',
    description: 'Mästerskap inom kommunal excellens och innovation',
    requiredAchievements: 35,
    color: '#EF4444',
    culturalTitles: {
      swedish: 'Mästare Kommunal Professional',
      german: 'Meister Verwaltungsprofi',
      french: 'Maître du Service Public',
      dutch: 'Meester Bestuurlijke Professional'
    }
  }
];

// Municipal Professional Achievements Configuration
const achievementsConfig: Achievement[] = [
  // Emergency Response World Achievements
  {
    id: 'crisis_decision_leadership',
    title: 'Krisbeslut Ledarskap',
    description: 'Visa excellens i krisbeslut under tidspress',
    category: 'world_specific',
    level: 'competent',
    worldId: 'emergency_response',
    icon: FiShield,
    color: '#DC2626',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Konsensusbaserat Krisbeslut',
        description: 'Demokratiskt krisbeslut med kollektivt ansvar'
      },
      german: {
        title: 'Systematische Krisenentscheidung',
        description: 'Methodische Krisenentscheidung mit Prozessexzellenz'
      },
      french: {
        title: 'Décision de Crise Raffinée',
        description: 'Prise de décision de crise avec excellence diplomatique'
      },
      dutch: {
        title: 'Efficiënte Crisisbesluiten',
        description: 'Directe crisisbesluiten met praktische resultaten'
      }
    }
  },
  {
    id: 'multi_agency_coordination',
    title: 'Flermyndighetssamordning',
    description: 'Framgångsrik koordination mellan flera myndigheter',
    category: 'world_specific',
    level: 'proficient',
    worldId: 'emergency_response',
    icon: FiUsers,
    color: '#DC2626',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Kollaborativ Myndighetssamordning',
        description: 'Konsensusbyggande mellan svenska myndigheter'
      },
      german: {
        title: 'Systematische Behördenkoordination',
        description: 'Methodische Koordination deutscher Behörden'
      },
      french: {
        title: 'Coordination Institutionnelle Raffinée',
        description: 'Coordination sophistiquée des institutions françaises'
      },
      dutch: {
        title: 'Praktische Agentschapscoördinatie',
        description: 'Efficiënte coördinatie van Nederlandse instanties'
      }
    }
  },

  // Budget Planning World Achievements
  {
    id: 'democratic_budget_facilitation',
    title: 'Demokratisk Budgetfacilitering',
    description: 'Expertis i demokratiska budgetprocesser',
    category: 'world_specific',
    level: 'competent',
    worldId: 'budget_planning',
    icon: FiDollarSign,
    color: '#059669',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Lagom Budgetdemokrati',
        description: 'Balanserad demokratisk budgetprocess'
      },
      german: {
        title: 'Systematische Haushaltsdemokratie',
        description: 'Methodische demokratische Haushaltsführung'
      },
      french: {
        title: 'Démocratie Budgétaire Raffinée',
        description: 'Processus budgétaire démocratique sophistiqué'
      },
      dutch: {
        title: 'Praktische Budgetdemocratic',
        description: 'Directe democratische budgetprocessen'
      }
    }
  },

  // Digital Transformation World Achievements
  {
    id: 'digital_innovation_leadership',
    title: 'Digital Innovationsledarskap',
    description: 'Ledarskap inom kommunal digitalisering',
    category: 'world_specific',
    level: 'expert',
    worldId: 'digital_transformation',
    icon: FiMonitor,
    color: '#7C3AED',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Digital Demokratisk Innovation',
        description: 'Digitalisering med svenska demokratiska värden'
      },
      german: {
        title: 'Systematische Digitale Innovation',
        description: 'Methodische digitale Transformation'
      },
      french: {
        title: 'Innovation Numérique Raffinée',
        description: 'Transformation numérique sophistiquée du service public'
      },
      dutch: {
        title: 'Praktische Digitale Innovatie',
        description: 'Directe digitale transformatie met resultaat'
      }
    }
  },

  // Cross-World Synthesis Achievements
  {
    id: 'municipal_leadership_synthesis',
    title: 'Kommunal Ledarskapssyntes',
    description: 'Integration av kompetenser från alla kommunala domäner',
    category: 'cross_world_synthesis',
    level: 'expert',
    icon: FiAward,
    color: '#F59E0B',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Holistisk Kommunal Ledarskap',
        description: 'Integrerad kommunal excellens med svenska värden'
      },
      german: {
        title: 'Ganzheitliche Verwaltungsführung',
        description: 'Systematische Integration aller Verwaltungsbereiche'
      },
      french: {
        title: 'Leadership Municipal Intégré',
        description: 'Synthèse sophistiquée du leadership municipal'
      },
      dutch: {
        title: 'Geïntegreerd Bestuurlijk Leiderschap',
        description: 'Praktische integratie van alle bestuurlijke domeinen'
      }
    }
  },

  // European Cultural Intelligence Achievements
  {
    id: 'european_municipal_diplomacy',
    title: 'Europeisk Kommunal Diplomati',
    description: 'Mästerskap i gränsöverskridande kommunal samverkan',
    category: 'cultural_intelligence',
    level: 'master',
    icon: FiGlobe,
    color: '#2563EB',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Europeisk Konsensusbyggande',
        description: 'Svenska konsensus principer i europeisk kontext'
      },
      german: {
        title: 'Europäische Verwaltungsdiplomatie',
        description: 'Deutsche Systematik in europäischer Zusammenarbeit'
      },
      french: {
        title: 'Diplomatie Municipale Européenne',
        description: 'Excellence française dans la coopération européenne'
      },
      dutch: {
        title: 'Europese Bestuurlijke Diplomatie',
        description: 'Nederlandse efficiëntie in Europese samenwerking'
      }
    }
  },

  // Professional Certification Achievements
  {
    id: 'certified_municipal_professional',
    title: 'Certifierad Kommunal Professional',
    description: 'Officiell erkännande av kommunal yrkeskompetens',
    category: 'professional_certification',
    level: 'proficient',
    icon: FiStar,
    color: '#8B5CF6',
    earned: false,
    culturalVariants: {
      swedish: {
        title: 'Certifierad Svenska Kommunal Professional',
        description: 'Officiell svenska kommunal kompetenscertifiering'
      },
      german: {
        title: 'Zertifizierter Deutscher Verwaltungsprofi',
        description: 'Offizielle deutsche Verwaltungskompetenz-Zertifizierung'
      },
      french: {
        title: 'Professionnel Certifié du Service Public',
        description: 'Certification officielle française du service public'
      },
      dutch: {
        title: 'Gecertificeerde Nederlandse Bestuurder',
        description: 'Officiële Nederlandse bestuurlijke competentiecertificering'
      }
    }
  }
];

const MotionBox = motion(Box);
const MotionBadge = motion(Badge);

interface AchievementBadgeProps {
  achievement: Achievement;
  culturalContext: string;
  size?: 'sm' | 'md' | 'lg';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  culturalContext, 
  size = 'md' 
}) => {
  const badgeBg = useColorModeValue('white', 'gray.800');
  const borderColor = achievement.earned ? achievement.color : 'gray.300';
  
  const culturalVariant = achievement.culturalVariants[culturalContext];
  const displayTitle = culturalVariant?.title || achievement.title;
  const displayDescription = culturalVariant?.description || achievement.description;

  const sizeConfig = {
    sm: { w: '60px', h: '60px', iconSize: 4, fontSize: 'xs' },
    md: { w: '80px', h: '80px', iconSize: 5, fontSize: 'sm' },
    lg: { w: '100px', h: '100px', iconSize: 6, fontSize: 'md' }
  };

  return (
    <Tooltip
      label={
        <VStack spacing={1} align="start">
          <Text fontWeight="600" fontSize="sm">{displayTitle}</Text>
          <Text fontSize="xs" opacity={0.9}>{displayDescription}</Text>
          {achievement.earned && achievement.earnedDate && (
            <Text fontSize="xs" opacity={0.7}>
              Intjänad: {achievement.earnedDate.toLocaleDateString('sv-SE')}
            </Text>
          )}
          {!achievement.earned && achievement.progress && (
            <Text fontSize="xs" opacity={0.7}>
              Framsteg: {achievement.progress}%
            </Text>
          )}
        </VStack>
      }
      placement="top"
      hasArrow
    >
      <MotionBox
        w={sizeConfig[size].w}
        h={sizeConfig[size].h}
        bg={badgeBg}
        borderRadius="xl"
        border="3px solid"
        borderColor={borderColor}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        cursor="pointer"
        opacity={achievement.earned ? 1 : 0.4}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition="all 0.2s ease"
      >
        <Icon
          as={achievement.icon}
          w={sizeConfig[size].iconSize}
          h={sizeConfig[size].iconSize}
          color={achievement.earned ? achievement.color : 'gray.400'}
        />
        
        {achievement.earned && (
          <MotionBox
            position="absolute"
            top="-8px"
            right="-8px"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <Icon
              as={FiCheckCircle}
              w={4}
              h={4}
              color="green.500"
              bg="white"
              borderRadius="full"
            />
          </MotionBox>
        )}

        {!achievement.earned && achievement.progress && (
          <Box
            position="absolute"
            bottom="-12px"
            left="50%"
            transform="translateX(-50%)"
            w="90%"
          >
            <Progress
              value={achievement.progress}
              size="xs"
              colorScheme="blue"
              borderRadius="full"
              bg="gray.200"
            />
          </Box>
        )}
      </MotionBox>
    </Tooltip>
  );
};

interface CompetencyLevelDisplayProps {
  currentLevel: CompetencyLevel;
  earnedAchievements: number;
  culturalContext: string;
}

const CompetencyLevelDisplay: React.FC<CompetencyLevelDisplayProps> = ({
  currentLevel,
  earnedAchievements,
  culturalContext
}) => {
  const currentLevelTitle = currentLevel.culturalTitles[culturalContext] || currentLevel.title;
  const progressToNext = Math.min(100, (earnedAchievements / currentLevel.requiredAchievements) * 100);
  
  const nextLevel = competencyLevels.find(level => 
    level.requiredAchievements > currentLevel.requiredAchievements
  );

  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      bg="white"
      borderRadius="xl"
      p={6}
      border="2px solid"
      borderColor={currentLevel.color}
      boxShadow="lg"
    >
      <VStack spacing={4}>
        
        {/* Current level badge */}
        <HStack spacing={3}>
          <Icon as={FiTarget} w={6} h={6} color={currentLevel.color} />
          <VStack spacing={0} align="start">
            <Text fontSize="lg" fontWeight="700" color={currentLevel.color}>
              {currentLevelTitle}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {currentLevel.description}
            </Text>
          </VStack>
        </HStack>

        {/* Progress to next level */}
        {nextLevel && (
          <Box w="100%">
            <HStack justify="space-between" mb={2}>
              <Text fontSize="sm" fontWeight="600" color="gray.700">
                Framsteg till nästa nivå
              </Text>
              <Text fontSize="sm" color={currentLevel.color} fontWeight="700">
                {earnedAchievements}/{nextLevel.requiredAchievements}
              </Text>
            </HStack>
            <Progress
              value={(earnedAchievements / nextLevel.requiredAchievements) * 100}
              colorScheme="blue"
              bg="gray.100"
              borderRadius="full"
              h={3}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              {nextLevel.requiredAchievements - earnedAchievements} prestationer kvar till {nextLevel.culturalTitles[culturalContext] || nextLevel.title}
            </Text>
          </Box>
        )}

      </VStack>
    </MotionBox>
  );
};

interface AchievementBadgeSystemProps {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}

export const AchievementBadgeSystem: React.FC<AchievementBadgeSystemProps> = ({
  achievements,
  onAchievementClick
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

  // Calculate current competency level
  const earnedAchievements = achievements.filter(a => a.earned).length;
  const currentLevel = [...competencyLevels]
    .reverse()
    .find(level => earnedAchievements >= level.requiredAchievements) || competencyLevels[0];

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    return {
      world_specific: achievements.filter(a => a.category === 'world_specific'),
      cross_world_synthesis: achievements.filter(a => a.category === 'cross_world_synthesis'),
      cultural_intelligence: achievements.filter(a => a.category === 'cultural_intelligence'),
      professional_certification: achievements.filter(a => a.category === 'professional_certification')
    };
  }, [achievements]);

  const categoryConfig = {
    world_specific: {
      title: 'Världsspecifika Prestationer',
      description: 'Kompetenser inom enskilda kommunala domäner',
      icon: FiShield
    },
    cross_world_synthesis: {
      title: 'Tvärsektoriell Syntes',
      description: 'Integration av kompetenser från flera domäner',
      icon: FiTrendingUp
    },
    cultural_intelligence: {
      title: 'Kulturell Intelligens',
      description: 'Europeisk kommunal samverkan och diplomati',
      icon: FiGlobe
    },
    professional_certification: {
      title: 'Professionell Certifiering',
      description: 'Officiellt erkända yrkeskompetenser',
      icon: FiAward
    }
  };

  return (
    <VStack spacing={8} w="100%" align="stretch">
      
      {/* Current competency level */}
      <CompetencyLevelDisplay
        currentLevel={currentLevel}
        earnedAchievements={earnedAchievements}
        culturalContext={culturalContext}
      />

      {/* Achievement categories */}
      <Accordion allowMultiple defaultIndex={[0, 1]}>
        {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
          const config = categoryConfig[category as keyof typeof categoryConfig];
          const earnedInCategory = categoryAchievements.filter(a => a.earned).length;
          
          return (
            <AccordionItem key={category}>
              <AccordionButton
                _expanded={{ bg: 'blue.50' }}
                borderRadius="lg"
                mb={2}
              >
                <Box flex={1} textAlign="left">
                  <HStack spacing={3}>
                    <Icon as={config.icon} w={5} h={5} color="blue.500" />
                    <VStack spacing={0} align="start">
                      <HStack spacing={2}>
                        <Text fontSize="lg" fontWeight="600">
                          {config.title}
                        </Text>
                        <Badge colorScheme="blue" variant="solid">
                          {earnedInCategory}/{categoryAchievements.length}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.600">
                        {config.description}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              
              <AccordionPanel pb={6}>
                <Grid
                  templateColumns={{
                    base: 'repeat(3, 1fr)',
                    md: 'repeat(4, 1fr)',
                    lg: 'repeat(6, 1fr)'
                  }}
                  gap={4}
                  justifyItems="center"
                >
                  {categoryAchievements.map((achievement) => (
                    <AchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      culturalContext={culturalContext}
                      size="md"
                    />
                  ))}
                </Grid>
              </AccordionPanel>
            </AccordionItem>
          );
        })}
      </Accordion>

    </VStack>
  );
};