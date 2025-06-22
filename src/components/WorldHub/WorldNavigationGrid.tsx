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

  // Determine card interaction state

  // Status icon and color
