import React, { useState, useMemo } from 'react';
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
  Progress,
  Badge,
  Icon,
  Button,
  Avatar,
  AvatarGroup,
  Flex,
  Divider,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiTrendingUp,
  FiTarget,
  FiAward,
  FiStar,
  FiMapPin,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiLock,
  FiUsers,
  FiBarChart3,
  FiFlag,
  FiZap
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';


// Professional Development Journey Interfaces
interface CompetencyLevel {
  id: string;
  name: string;
  displayName: string;
  level: number;
  requiredScore: number;
  skillRequirements: string[];
  culturalAdaptations: Record<string, {
    title: string;
    description: string;
    recognitionAuthority: string;
    careerBenefits: string[];
  }>;
  governmentRecognition: boolean;
  europeanEquivalence?: string;
}

interface MunicipalWorld {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  icon: Record<string, unknown>;
  competencyLevels: CompetencyLevel[];
  prerequisites: string[];
  estimatedTimeWeeks: number;
  realWorldApplication: string[];
  careerImpact: string;
}

interface ProfessionalMilestone {
  id: string;
  name: string;
  description: string;
  requiredWorlds: string[];
  requiredCompetencyLevel: number;
  unlocks: string[];
  careerAdvancement: {
    roles: string[];
    salaryImpact: string;
    leadership: string;
    responsibility: string;
  };
  europeanOpportunities: string[];
}

interface CareerProgressionPath {
  currentLevel: number;
  completedWorlds: string[];
  inProgressWorlds: string[];
  unlockedMilestones: string[];
  nextMilestone: ProfessionalMilestone;
  careerTrajectory: {
    shortTerm: string; // 6 months
    mediumTerm: string; // 1-2 years
    longTerm: string; // 3-5 years
  };
  professionalNetworking: {
    mentors: number;
    peers: number;
    mentorees: number;
  };
}

// Competency Level Definitions
const competencyLevels: CompetencyLevel[] = [
  {
    id: 'novice',
    name: 'novice',
    displayName: 'Novice Municipal Professional',
    level: 1,
    requiredScore: 0,
    skillRequirements: ['Basic Municipal Knowledge', 'Citizen Service Orientation', 'Professional Ethics'],
    culturalAdaptations: {
      swedish: {
        title: 'Nybörjare Kommunal Yrkesperson',
        description: 'Grundläggande kommunal kompetens med fokus på demokratiska värden och medborgarservice',
        recognitionAuthority: 'Sveriges Kommuner och Regioner (SKR)',
        careerBenefits: ['Grundlön enligt kollektivavtal', 'Introduktionsprogram', 'Mentorskap tillgängligt']
      },
      german: {
        title: 'Novize Verwaltungsfachkraft',
        description: 'Grundlegende Verwaltungskompetenzen mit systematischer Einführung in öffentliche Verwaltung',
        recognitionAuthority: 'Deutscher Städtetag (DST)',
        careerBenefits: ['Tarifgerechte Einstufung', 'Systematische Einarbeitung', 'Weiterbildungsgarantie']
      },
      french: {
        title: 'Novice Fonctionnaire Municipal',
        description: 'Compétences municipales de base avec introduction au service public français',
        recognitionAuthority: 'Direction Générale de l\'Administration Publique',
        careerBenefits: ['Rémunération selon grille', 'Formation initiale', 'Accompagnement professionnel']
      },
      dutch: {
        title: 'Beginnend Gemeenteambtenaar',
        description: 'Basis gemeentelijke competenties met focus op praktische resultaten',
        recognitionAuthority: 'Vereniging van Nederlandse Gemeenten (VNG)',
        careerBenefits: ['Salaris volgens cao', 'Praktijkgerichte training', 'Directe begeleiding']
      }
    },
    governmentRecognition: true
  },
  {
    id: 'competent',
    name: 'competent',
    displayName: 'Competent Municipal Professional',
    level: 2,
    requiredScore: 1500,
    skillRequirements: ['Cross-department Collaboration', 'Problem-solving Skills', 'Stakeholder Communication', 'Basic Project Management'],
    culturalAdaptations: {
      swedish: {
        title: 'Kompetent Kommunal Professional',
        description: 'Bevisad kompetens inom kommunal verksamhet med fokus på samverkan och konsensusbyggande',
        recognitionAuthority: 'Sveriges Kommuner och Regioner (SKR)',
        careerBenefits: ['Löneökning 8-12%', 'Projektledarroller', 'Kompetensutvecklingsbudget']
      },
      german: {
        title: 'Kompetente Verwaltungsfachkraft',
        description: 'Nachgewiesene Verwaltungskompetenz mit systematischer Projektverantwortung',
        recognitionAuthority: 'Deutscher Städtetag (DST)',
        careerBenefits: ['Gehaltserhöhung 10-15%', 'Projektverantwortung', 'Fortbildungsanspruch']
      },
      french: {
        title: 'Fonctionnaire Municipal Compétent',
        description: 'Compétence démontrée en administration municipale avec excellence du service public',
        recognitionAuthority: 'Direction Générale de l\'Administration Publique',
        careerBenefits: ['Augmentation 9-13%', 'Responsabilités étendues', 'Formation continue']
      },
      dutch: {
        title: 'Competent Gemeenteambtenaar',
        description: 'Bewezen gemeentelijke competentie met focus op efficiënte resultaten',
        recognitionAuthority: 'Vereniging van Nederlandse Gemeenten (VNG)',
        careerBenefits: ['Salarisverhoging 10-14%', 'Projectverantwoordelijkheid', 'Opleidingsbudget']
      }
    },
    governmentRecognition: true,
    europeanEquivalence: 'European Qualification Framework Level 5'
  },
  {
    id: 'proficient',
    name: 'proficient',
    displayName: 'Proficient Municipal Professional',
    level: 3,
    requiredScore: 3000,
    skillRequirements: ['Advanced Municipal Systems', 'Strategic Planning', 'Team Leadership', 'Cross-cultural Communication', 'Digital Innovation'],
    culturalAdaptations: {
      swedish: {
        title: 'Skicklig Kommunal Professional',
        description: 'Avancerad kommunal expertis med ledarskap inom demokratiska processer och innovation',
        recognitionAuthority: 'Sveriges Kommuner och Regioner (SKR)',
        careerBenefits: ['Löneökning 15-20%', 'Teamledningsroller', 'Strategisk planering', 'Mentorskap']
      },
      german: {
        title: 'Erfahrene Verwaltungsfachkraft',
        description: 'Fortgeschrittene Verwaltungsexpertise mit Führungsverantwortung und Prozessoptimierung',
        recognitionAuthority: 'Deutscher Städtetag (DST)',
        careerBenefits: ['Gehaltserhöhung 18-25%', 'Führungsposition', 'Strategische Planung', 'Expertise-Anerkennung']
      },
      french: {
        title: 'Fonctionnaire Municipal Expérimenté',
        description: 'Expertise municipale avancée avec leadership raffiné et innovation du service public',
        recognitionAuthority: 'Direction Générale de l\'Administration Publique',
        careerBenefits: ['Augmentation 16-22%', 'Encadrement d\'équipe', 'Planification stratégique', 'Reconnaissance d\'expertise']
      },
      dutch: {
        title: 'Ervaren Gemeenteambtenaar',
        description: 'Geavanceerde gemeentelijke expertise met leiderschap en praktische innovatie',
        recognitionAuthority: 'Vereniging van Nederlandse Gemeenten (VNG)',
        careerBenefits: ['Salarisverhoging 17-23%', 'Teamleiding', 'Strategische rol', 'Expertiseerkenning']
      }
    },
    governmentRecognition: true,
    europeanEquivalence: 'European Qualification Framework Level 6'
  },
  {
    id: 'expert',
    name: 'expert',
    displayName: 'Expert Municipal Professional',
    level: 4,
    requiredScore: 4500,
    skillRequirements: ['Municipal System Architecture', 'Policy Development', 'Crisis Leadership', 'European Municipal Standards', 'Change Management'],
    culturalAdaptations: {
      swedish: {
        title: 'Expert Kommunal Professional',
        description: 'Högsta nivå av kommunal expertis med systemledarskap och europeisk kompetens',
        recognitionAuthority: 'Sveriges Kommuner och Regioner (SKR) + CEMR',
        careerBenefits: ['Löneökning 25-35%', 'Systemledarskap', 'Policy utveckling', 'Europeiska uppdrag']
      },
      german: {
        title: 'Experte Verwaltungsfachkraft',
        description: 'Höchste Verwaltungsexpertise mit Systemführung und europäischer Anerkennung',
        recognitionAuthority: 'Deutscher Städtetag (DST) + CEMR',
        careerBenefits: ['Gehaltserhöhung 28-38%', 'Systemleitung', 'Politikberatung', 'Europäische Mandate']
      },
      french: {
        title: 'Expert Fonctionnaire Municipal',
        description: 'Excellence municipale suprême avec leadership systémique et reconnaissance européenne',
        recognitionAuthority: 'DGAFP + Conseil Européen des Municipalités',
        careerBenefits: ['Augmentation 26-36%', 'Leadership systémique', 'Développement politique', 'Missions européennes']
      },
      dutch: {
        title: 'Expert Gemeenteambtenaar',
        description: 'Hoogste gemeentelijke expertise met systeemleiderschap en Europese erkenning',
        recognitionAuthority: 'Vereniging van Nederlandse Gemeenten (VNG) + CEMR',
        careerBenefits: ['Salarisverhoging 27-37%', 'Systeemleiding', 'Beleidsontwikkeling', 'Europese opdrachten']
      }
    },
    governmentRecognition: true,
    europeanEquivalence: 'European Qualification Framework Level 7'
  },
  {
    id: 'master',
    name: 'master',
    displayName: 'Master Municipal Professional',
    level: 5,
    requiredScore: 6000,
    skillRequirements: ['Municipal Innovation Leadership', 'European Network Management', 'Strategic Transformation', 'Cultural Intelligence Mastery', 'Next-Generation Municipal Systems'],
    culturalAdaptations: {
      swedish: {
        title: 'Mästare Kommunal Professional',
        description: 'Exceptionell kommunal ledarskap med europeisk innovation och transformativ kapacitet',
        recognitionAuthority: 'SKR + CEMR + European Commission Recognition',
        careerBenefits: ['Löneökning 40-60%', 'Transformativ ledarskap', 'Europeisk nätverksansvar', 'Innovationsledarskap']
      },
      german: {
        title: 'Meister Verwaltungsfachkraft',
        description: 'Außergewöhnliche Verwaltungsführung mit europäischer Innovation und Transformationskompetenz',
        recognitionAuthority: 'DST + CEMR + Europäische Kommission',
        careerBenefits: ['Gehaltserhöhung 42-65%', 'Transformationsführung', 'Europäische Netzwerke', 'Innovationsleitung']
      },
      french: {
        title: 'Maître Fonctionnaire Municipal',
        description: 'Leadership municipal exceptionnel avec innovation européenne et capacité transformative',
        recognitionAuthority: 'DGAFP + CEMR + Commission Européenne',
        careerBenefits: ['Augmentation 41-62%', 'Leadership transformatif', 'Réseaux européens', 'Direction innovation']
      },
      dutch: {
        title: 'Meester Gemeenteambtenaar',
        description: 'Uitzonderlijk gemeentelijk leiderschap met Europese innovatie en transformatieve capaciteit',
        recognitionAuthority: 'VNG + CEMR + Europese Commissie',
        careerBenefits: ['Salarisverhoging 43-63%', 'Transformatief leiderschap', 'Europese netwerken', 'Innovatieleiding']
      }
    },
    governmentRecognition: true,
    europeanEquivalence: 'European Qualification Framework Level 8'
  }
];

// Municipal Worlds Definition
const municipalWorlds: MunicipalWorld[] = [
  {
    id: 'emergency_response',
    name: 'Emergency Response & Crisis Management',
    displayName: 'Krisberedskap & Krishantering',
    description: 'Utveckla ledarskapsfärdigheter för krishantering och nödsituationer',
    color: 'red',
    icon: FiZap,
    competencyLevels: competencyLevels,
    prerequisites: [],
    estimatedTimeWeeks: 4,
    realWorldApplication: [
      'Naturkatastrofer och samhällskriser',
      'Samordning mellan myndigheter',
      'Mediekommunikation under kriser',
      'Resursmobilisering och prioritering'
    ],
    careerImpact: 'Grundläggande krishanteringskompetens öppnar dörrar till ledningsroller inom kommunal säkerhet och beredskap'
  },
  {
    id: 'budget_planning',
    name: 'Budget Planning & Resource Allocation',
    displayName: 'Budgetplanering & Resursfördelning',
    description: 'Behärska demokratisk budgetprocess och strategisk resursförvaltning',
    color: 'green',
    icon: FiBarChart3,
    competencyLevels: competencyLevels,
    prerequisites: ['emergency_response'],
    estimatedTimeWeeks: 6,
    realWorldApplication: [
      'Demokratiska budgetprocesser',
      'Medborgardeltagande i budgetarbete',
      'Långsiktig ekonomisk planering',
      'Resuroptimering mellan avdelningar'
    ],
    careerImpact: 'Budgetkompetens är avgörande för chefsroller och strategiska positioner inom kommunal förvaltning'
  },
  {
    id: 'digital_transformation',
    name: 'Digital Transformation & Innovation',
    displayName: 'Digital Transformation & Innovation',
    description: 'Leda digitala förändringsprocesser och teknisk innovation',
    color: 'blue',
    icon: FiTrendingUp,
    competencyLevels: competencyLevels,
    prerequisites: ['emergency_response', 'budget_planning'],
    estimatedTimeWeeks: 8,
    realWorldApplication: [
      'E-förvaltning och digitala tjänster',
      'Automatisering av administrativa processer',
      'Cybersäkerhet och dataskydd',
      'Användarcentrerad tjänstedesign'
    ],
    careerImpact: 'Digital expertis positionerar för högsta ledningsroller och specialistfunktioner inom modern kommunal verksamhet'
  },
  {
    id: 'stakeholder_relations',
    name: 'Stakeholder Relations & Diplomacy',
    displayName: 'Intressentrelationer & Diplomati',
    description: 'Utveckla expertis inom kommunikation och diplomatiska relationer',
    color: 'purple',
    icon: FiUsers,
    competencyLevels: competencyLevels,
    prerequisites: ['budget_planning'],
    estimatedTimeWeeks: 7,
    realWorldApplication: [
      'Förhandling med externa parter',
      'Medborgarengagemang och deltagande',
      'Interkommunalt samarbete',
      'Media- och kommunikationsstrategi'
    ],
    careerImpact: 'Diplomatisk kompetens öppnar vägar till högsta politiska och administrativa positioner'
  },
  {
    id: 'regulatory_compliance',
    name: 'Regulatory Compliance & Quality Assurance',
    displayName: 'Regelefterlevnad & Kvalitetssäkring',
    description: 'Masterskap inom juridisk efterlevnad och kvalitetsledning',
    color: 'orange',
    icon: FiCheckCircle,
    competencyLevels: competencyLevels,
    prerequisites: ['digital_transformation', 'stakeholder_relations'],
    estimatedTimeWeeks: 10,
    realWorldApplication: [
      'Juridisk regelefterlevnad',
      'Kvalitetsmanagementsystem',
      'Risk- och internkontroll',
      'Europeiska standarder och direktiv'
    ],
    careerImpact: 'Masterskap inom efterlevnad och kvalitet leder till de högsta expertrollerna och systemansvar'
  }
];

// Professional Milestones
const professionalMilestones: ProfessionalMilestone[] = [
  {
    id: 'foundation_complete',
    name: 'Foundation Municipal Professional',
    description: 'Grundläggande kommunal kompetens etablerad',
    requiredWorlds: ['emergency_response'],
    requiredCompetencyLevel: 2,
    unlocks: ['Team Member Roles', 'Basic Project Participation', 'Mentorship Program'],
    careerAdvancement: {
      roles: ['Handläggare', 'Projektmedarbetare', 'Kundtjänstspecialist'],
      salaryImpact: '+8-12% löneutveckling',
      leadership: 'Informellt ledarskap inom team',
      responsibility: 'Ansvar för specifika arbetsprocesser'
    },
    europeanOpportunities: ['EU Exchange Programs', 'Cross-border Municipal Projects']
  },
  {
    id: 'intermediate_specialist',
    name: 'Intermediate Municipal Specialist',
    description: 'Flärdomänskompetens med projektledarskap',
    requiredWorlds: ['emergency_response', 'budget_planning'],
    requiredCompetencyLevel: 3,
    unlocks: ['Project Leadership', 'Cross-department Coordination', 'Professional Mentoring'],
    careerAdvancement: {
      roles: ['Projektledare', 'Enhetschef', 'Strategisk analytiker'],
      salaryImpact: '+18-25% löneutveckling',
      leadership: 'Formellt team- och projektledarskap',
      responsibility: 'Ansvar för avdelningsresultat och strategisk planering'
    },
    europeanOpportunities: ['European Municipal Networks', 'Best Practice Sharing Programs', 'Policy Development Participation']
  },
  {
    id: 'advanced_leader',
    name: 'Advanced Municipal Leader',
    description: 'Systemledarskap med europeisk kompetens',
    requiredWorlds: ['emergency_response', 'budget_planning', 'digital_transformation', 'stakeholder_relations'],
    requiredCompetencyLevel: 4,
    unlocks: ['Strategic System Leadership', 'European Network Participation', 'Policy Development Authority'],
    careerAdvancement: {
      roles: ['Förvaltningschef', 'Strategisk chef', 'Kommunalrådsrådgivare'],
      salaryImpact: '+30-45% löneutveckling',
      leadership: 'Systemledarskap över multipla avdelningar',
      responsibility: 'Strategisk transformation och policyutveckling'
    },
    europeanOpportunities: ['European Commission Advisory Roles', 'Municipal Innovation Leadership', 'Cross-border System Development']
  },
  {
    id: 'master_professional',
    name: 'Master Municipal Professional',
    description: 'Exceptionell expertis med transformativ kapacitet',
    requiredWorlds: ['emergency_response', 'budget_planning', 'digital_transformation', 'stakeholder_relations', 'regulatory_compliance'],
    requiredCompetencyLevel: 5,
    unlocks: ['Transformational Leadership', 'European Innovation Networks', 'Municipal System Architecture'],
    careerAdvancement: {
      roles: ['Kommundirektör', 'Europeisk nätverksledare', 'Transformationschef'],
      salaryImpact: '+50-75% löneutveckling',
      leadership: 'Transformativ systemledarskap',
      responsibility: 'Municipal innovation och europeisk nätverksledning'
    },
    europeanOpportunities: ['European Municipal Innovation Leadership', 'Commission Advisory Boards', 'Cross-European System Architecture']
  }
];

// Sample Career Progression Data
const sampleCareerProgression: CareerProgressionPath = {
  currentLevel: 3,
  completedWorlds: ['emergency_response', 'budget_planning'],
  inProgressWorlds: ['digital_transformation'],
  unlockedMilestones: ['foundation_complete', 'intermediate_specialist'],
  nextMilestone: professionalMilestones[2], // advanced_leader
  careerTrajectory: {
    shortTerm: 'Slutföra Digital Transformation för att bli Expert Municipal Professional',
    mediumTerm: 'Utveckla systemledarskap och uppnå Advanced Municipal Leader status',
    longTerm: 'Bygga europeisk nätverksledning mot Master Municipal Professional'
  },
  professionalNetworking: {
    mentors: 2,
    peers: 15,
    mentorees: 4
  }
};

interface CompetencyLevelVisualizationProps {
  levels: CompetencyLevel[];
  currentLevel: number;
  culturalContext: string;
}

const CompetencyLevelVisualization: React.FC<CompetencyLevelVisualizationProps> = ({
  levels,
  currentLevel,
  culturalContext
}) => {
  const { currentTheme } = useCulturalTheme();

  return (
    <VStack spacing={4} align="stretch">
      <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
        Professional Competency Progression
      </Text>
      
      {levels.map((level, index) => {

        return (
          <MotionCard
            key={level.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            bg={isCompleted ? 'green.50' : isCurrent ? 'blue.50' : 'gray.50'}
            borderColor={isCompleted ? 'green.200' : isCurrent ? 'blue.200' : 'gray.200'}
            opacity={isLocked ? 0.6 : 1}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                
                {/* Level Icon */}
                <Box
                  w={12}
                  h={12}
                  borderRadius="full"
                  bg={isCompleted ? 'green.500' : isCurrent ? 'blue.500' : 'gray.400'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Icon
                    as={isCompleted ? FiCheckCircle : isCurrent ? FiStar : FiLock}
                    w={6}
                    h={6}
                    color="white"
                  />
                </Box>

                {/* Level Content */}
                <VStack align="start" spacing={3} flex={1}>
                  
                  <HStack justify="space-between" w="100%">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
                        {adaptation?.title || level.displayName}
                      </Text>
                      <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
                        {adaptation?.description || `Level ${level.level} Municipal Professional`}
                      </Text>
                    </VStack>
                    
                    <VStack align="end" spacing={1}>
                      <Badge
                        colorScheme={isCompleted ? 'green' : isCurrent ? 'blue' : 'gray'}
                        variant="solid"
                        p={2}
                        borderRadius="lg"
                      >
                        Level {level.level}
                      </Badge>
                      {level.requiredScore > 0 && (
                        <Text fontSize="xs" color={currentTheme.colors.text.muted}>
                          {level.requiredScore}+ points
                        </Text>
                      )}
                    </VStack>
                  </HStack>

                  {/* Skill Requirements */}
                  <Box>
                    <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                      Core Competencies:
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                      {level.skillRequirements.map((skill, skillIndex) => (
                        <HStack key={skillIndex} spacing={2}>
                          <Icon as={FiTarget} w={3} h={3} color={currentTheme.colors.accent} />
                          <Text fontSize="xs" color={currentTheme.colors.text.secondary}>
                            {skill}
                          </Text>
                        </HStack>
                      ))}
                    </Grid>
                  </Box>

                  {/* Career Benefits */}
                  {adaptation && (
                    <Box>
                      <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary} mb={2}>
                        Career Benefits:
                      </Text>
                      <VStack spacing={1} align="start">
                        {adaptation.careerBenefits.map((benefit, benefitIndex) => (
                          <HStack key={benefitIndex} spacing={2}>
                            <Icon as={FiAward} w={3} h={3} color="green.500" />
                            <Text fontSize="xs" color={currentTheme.colors.text.secondary}>
                              {benefit}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  {/* Recognition Authority */}
                  {adaptation && (
                    <HStack spacing={2} mt={2}>
                      <Icon as={FiFlag} w={4} h={4} color={currentTheme.colors.accent} />
                      <Text fontSize="xs" color={currentTheme.colors.text.muted}>
                        Recognized by: {adaptation.recognitionAuthority}
                      </Text>
                    </HStack>
                  )}

                </VStack>
              </HStack>
            </CardBody>
          </MotionCard>
        );
      })}
    </VStack>
  );
};

interface WorldProgressionMapProps {
  worlds: MunicipalWorld[];
  completedWorlds: string[];
  inProgressWorlds: string[];
}

const WorldProgressionMap: React.FC<WorldProgressionMapProps> = ({
  worlds,
  completedWorlds,
  inProgressWorlds
}) => {
  const { currentTheme } = useCulturalTheme();

  const _getWorldStatus = (worldId: string): 'completed' | 'in_progress' | 'available' | 'locked' => {
    if (completedWorlds.includes(worldId)) return 'completed';
    if (inProgressWorlds.includes(worldId)) return 'in_progress';
    
    if (!world) return 'locked';
    
    const _allPrerequisitesMet = world.prerequisites.every(prereq => 
      completedWorlds.includes(prereq)
    );
    
    return allPrerequisitesMet ? 'available' : 'locked';
  };

  return (
    <VStack spacing={6} align="stretch">
      <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
        Municipal Professional Development Map
      </Text>
      
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {worlds.map((world, index) => {
          

          return (
            <MotionCard
              key={world.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              bg={config.bg}
              borderColor={config.borderColor}
              _hover={{ transform: status !== 'locked' ? 'translateY(-2px)' : 'none' }}
              cursor={status !== 'locked' ? 'pointer' : 'not-allowed'}
            >
              <CardBody p={6}>
                <VStack spacing={4} align="stretch">
                  
                  {/* World Header */}
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={world.icon} w={8} h={8} color={world.color + '.500'} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="md" fontWeight="700" color={currentTheme.colors.primary}>
                          {world.displayName}
                        </Text>
                        <Text fontSize="xs" color={currentTheme.colors.text.muted}>
                          {world.estimatedTimeWeeks} veckor
                        </Text>
                      </VStack>
                    </HStack>
                    <Icon as={config.icon} w={6} h={6} color={config.iconColor} />
                  </HStack>

                  {/* World Description */}
                  <Text fontSize="sm" color={currentTheme.colors.text.secondary} lineHeight="short">
                    {world.description}
                  </Text>

                  {/* Prerequisites */}
                  {world.prerequisites.length > 0 && (
                    <Box>
                      <Text fontSize="xs" fontWeight="600" color={currentTheme.colors.primary} mb={1}>
                        Prerequisites:
                      </Text>
                      <HStack spacing={1} flexWrap="wrap">
                        {world.prerequisites.map(prereq => (
                          <Badge
                            key={prereq}
                            size="sm"
                            colorScheme={completedWorlds.includes(prereq) ? 'green' : 'gray'}
                            variant="outline"
                          >
                            {worlds.find(w => w.id === prereq)?.displayName || prereq}
                          </Badge>
                        ))}
                      </HStack>
                    </Box>
                  )}

                  {/* Career Impact */}
                  <Box>
                    <Text fontSize="xs" fontWeight="600" color={currentTheme.colors.primary} mb={1}>
                      Career Impact:
                    </Text>
                    <Text fontSize="xs" color={currentTheme.colors.text.secondary} lineHeight="short">
                      {world.careerImpact}
                    </Text>
                  </Box>

                  {/* Progress Indicator */}
                  {status === 'in_progress' && (
                    <Progress value={65} colorScheme="blue" borderRadius="full" />
                  )}

                </VStack>
              </CardBody>
            </MotionCard>
          );
        })}
      </Grid>
    </VStack>
  );
};

interface CareerTrajectoryViewProps {
  progression: CareerProgressionPath;
  culturalContext: string;
}

const CareerTrajectoryView: React.FC<CareerTrajectoryViewProps> = ({
  progression,
  culturalContext
}) => {
  const { currentTheme } = useCulturalTheme();


  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="700" color={currentTheme.colors.primary}>
          Professional Development Trajectory
        </Text>
        <HStack spacing={4}>
          <HStack spacing={2}>
            <Icon as={FiUsers} w={5} h={5} color={currentTheme.colors.accent} />
            <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
              Mentors: {progression.professionalNetworking.mentors}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Icon as={FiUsers} w={5} h={5} color="blue.500" />
            <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
              Peers: {progression.professionalNetworking.peers}
            </Text>
          </HStack>
          <HStack spacing={2}>
            <Icon as={FiUsers} w={5} h={5} color="green.500" />
            <Text fontSize="sm" color={currentTheme.colors.text.secondary}>
              Mentorees: {progression.professionalNetworking.mentorees}
            </Text>
          </HStack>
        </HStack>
      </HStack>

      <Grid templateColumns="1fr" gap={4}>
        {timeframes.map((timeframe, index) => (
          <MotionCard
            key={timeframe.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            bg={currentTheme.colors.surface}
            borderColor={`${timeframe.color}.200`}
          >
            <CardBody p={6}>
              <HStack spacing={4} align="start">
                <Icon as={timeframe.icon} w={8} h={8} color={`${timeframe.color}.500`} flexShrink={0} />
                <VStack align="start" spacing={2} flex={1}>
                  <Text fontSize="md" fontWeight="600" color={`${timeframe.color}.700`}>
                    {timeframe.label}
                  </Text>
                  <Text fontSize="sm" color={currentTheme.colors.text.primary} lineHeight="tall">
                    {progression.careerTrajectory[timeframe.key as keyof typeof progression.careerTrajectory]}
                  </Text>
                </VStack>
              </HStack>
            </CardBody>
          </MotionCard>
        ))}
      </Grid>

      {/* Next Milestone */}
      <Card bg="blue.50" borderColor="blue.200">
        <CardBody p={6}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Icon as={FiAward} w={8} h={8} color="blue.500" />
                <VStack align="start" spacing={1}>
                  <Text fontSize="lg" fontWeight="700" color="blue.700">
                    Next Milestone: {progression.nextMilestone.name}
                  </Text>
                  <Text fontSize="sm" color="blue.600">
                    {progression.nextMilestone.description}
                  </Text>
                </VStack>
              </HStack>
              <Button colorScheme="blue" size="sm" leftIcon={<FiArrowRight />}>
                View Details
              </Button>
            </HStack>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="blue.700">
                  Career Advancement:
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="xs" color="blue.600">
                    Roles: {progression.nextMilestone.careerAdvancement.roles.join(', ')}
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Salary Impact: {progression.nextMilestone.careerAdvancement.salaryImpact}
                  </Text>
                  <Text fontSize="xs" color="blue.600">
                    Leadership: {progression.nextMilestone.careerAdvancement.leadership}
                  </Text>
                </VStack>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <Text fontSize="sm" fontWeight="600" color="blue.700">
                  European Opportunities:
                </Text>
                <VStack align="start" spacing={1}>
                  {progression.nextMilestone.europeanOpportunities.map((opportunity, index) => (
                    <Text key={index} fontSize="xs" color="blue.600">
                      • {opportunity}
                    </Text>
                  ))}
                </VStack>
              </VStack>
            </Grid>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

interface ProfessionalDevelopmentJourneyProps {
  careerProgression?: CareerProgressionPath;
  onMilestoneAchieved?: (milestoneId: string) => void;
  onWorldSelected?: (worldId: string) => void;
}

export const ProfessionalDevelopmentJourney: React.FC<ProfessionalDevelopmentJourneyProps> = ({
  careerProgression = sampleCareerProgression,
  onMilestoneAchieved = () => console.log('Milestone achieved'),
  onWorldSelected = () => console.log('World selected')
}) => {
  const { currentTheme, culturalContext } = useCulturalTheme();
  const [activeView, setActiveView] = useState<'competency' | 'worlds' | 'trajectory'>('trajectory');


  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={8} align="stretch">
        
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
            <CardHeader>
              <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Icon as={FiUser} w={8} h={8} color={currentTheme.colors.primary} />
                    <Text fontSize="2xl" fontWeight="800" color={currentTheme.colors.primary}>
                      Professional Development Journey
                    </Text>
                  </HStack>
                  <Text fontSize="md" color={currentTheme.colors.text.secondary}>
                    Clear career advancement path with European municipal excellence
                  </Text>
                </VStack>

                <HStack spacing={2}>
                  {viewTabs.map(tab => (
                    <Button
                      key={tab.id}
                      size="sm"
                      variant={activeView === tab.id ? 'solid' : 'outline'}
                      colorScheme="blue"
                      leftIcon={<Icon as={tab.icon} />}
                      onClick={() => setActiveView(tab.id as any)}
                    >
                      {tab.label}
                    </Button>
                  ))}
                </HStack>

              </Flex>
            </CardHeader>
          </Card>
        </MotionBox>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {activeView === 'trajectory' && (
            <MotionBox
              key="trajectory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CareerTrajectoryView
                progression={careerProgression}
                culturalContext={culturalContext}
              />
            </MotionBox>
          )}

          {activeView === 'competency' && (
            <MotionBox
              key="competency"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <CompetencyLevelVisualization
                levels={competencyLevels}
                currentLevel={careerProgression.currentLevel}
                culturalContext={culturalContext}
              />
            </MotionBox>
          )}

          {activeView === 'worlds' && (
            <MotionBox
              key="worlds"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <WorldProgressionMap
                worlds={municipalWorlds}
                completedWorlds={careerProgression.completedWorlds}
                inProgressWorlds={careerProgression.inProgressWorlds}
              />
            </MotionBox>
          )}
        </AnimatePresence>

      </VStack>
    </Container>
  );
};