import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Card,
  CardBody,
  Progress,
  Alert,
  AlertIcon,
  useTheme,
  useColorModeValue
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { processQuizSceneWithPlayerName } from '../../utils/playerNameReplacement';
import { MunicipalButton } from '../Button';
import { getButtonText } from '../../theme/municipalButtonTheme';

// DevTeam JSON Schema Types (from System Architect analysis)
interface QuizOption {
  option_id: string;
  text?: string; // Standard format
  option_text?: string; // Alternative format from game content
  is_correct: boolean;
}

interface QuizQuestion {
  question_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'multiple_select';
  question_text: string;
  options: QuizOption[];
  explanation: string;
  learning_objective: string;
  points: number;
}

interface QuizSceneData {
  scene_id: string;
  scene_type: 'QuizScene';
  title: string;
  description: string;
  questions: QuizQuestion[];
  passing_score: number; // percentage
  scene_duration: number; // seconds
  feedback_immediate: boolean;
}

interface QuizSceneProps {
  sceneData: QuizSceneData;
  onComplete: (results: QuizResults) => void;
  municipalBranding?: {
    primaryColor: string;
    logoUrl: string;
    municipality: string;
  };
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
  playerName?: string;
}

interface QuizResults {
  totalQuestions: number;
  correctAnswers: number;
  score: number; // percentage
  passed: boolean;
  timeSpent: number; // seconds
  answers: {
    question_id: string;
    selected_answers: string[];
    is_correct: boolean;
    points_earned: number;
  }[];
}

// Cultural adaptation (Game Designer specification)

export const QuizScene: React.FC<QuizSceneProps> = ({
  sceneData,
  onComplete,
  municipalBranding,
  culturalContext = 'swedish',
  playerName
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  

  // Utility function to get option text (handle both formats)
  const _getOptionText = (option: QuizOption): string => {
    return option.text || option.option_text || '';
  };

  // Validation for options (ensure no empty text)
  const _validateOptions = (options: QuizOption[]): boolean => {
    return options.every(option => getOptionText(option).trim().length > 0);
  };

  // Process scene data with player name replacement
