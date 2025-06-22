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
const getCulturalQuizStyles = (context: string, theme: any) => {
  switch (context) {
    case 'swedish':
      return {
        feedbackStyle: 'encouraging_brief',
        progressDisplay: 'clean_linear',
        colors: theme.colors.blue
      };
    case 'german':
      return {
        feedbackStyle: 'detailed_systematic',
        progressDisplay: 'comprehensive_detailed',
        colors: theme.colors.gray
      };
    case 'french':
      return {
        feedbackStyle: 'collaborative_refined',
        progressDisplay: 'elegant_informative',
        colors: theme.colors.purple
      };
    case 'dutch':
      return {
        feedbackStyle: 'efficient_direct',
        progressDisplay: 'minimal_effective',
        colors: theme.colors.orange
      };
    default:
      return {
        feedbackStyle: 'encouraging_brief',
        progressDisplay: 'clean_linear',
        colors: theme.colors.blue
      };
  }
};

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
  
  const theme = useTheme();
  const culturalStyles = getCulturalQuizStyles(culturalContext, theme);
  const primaryColor = municipalBranding?.primaryColor || culturalStyles.colors[500];
  const bgColor = useColorModeValue('white', 'gray.800');

  // Utility function to get option text (handle both formats)
  const getOptionText = (option: QuizOption): string => {
    return option.text || option.option_text || '';
  };

  // Validation for options (ensure no empty text)
  const validateOptions = (options: QuizOption[]): boolean => {
    return options.every(option => getOptionText(option).trim().length > 0);
  };

  // Process scene data with player name replacement
  const processedSceneData = useMemo(() => {
    return playerName ? processQuizSceneWithPlayerName(sceneData, playerName) : sceneData;
  }, [sceneData, playerName]);
  
  // Anna Svensson mobile-first (Game Designer requirement)
  const isMobile = true;

  const currentQuestion = processedSceneData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / processedSceneData.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === processedSceneData.questions.length - 1;

  // Validate current question options
  const hasValidOptions = validateOptions(currentQuestion.options);
  
  if (!hasValidOptions) {
    console.error('QuizScene: Missing option text in question', currentQuestion.question_id);
  }

  // Keyboard shortcuts (Game Designer requirement: 1-9 for quick selection)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key;
      
      // Number keys 1-9 for quick option selection
      if (/^[1-9]$/.test(key)) {
        e.preventDefault();
        const optionIndex = parseInt(key) - 1;
        if (optionIndex < currentQuestion.options.length) {
          const optionId = currentQuestion.options[optionIndex].option_id;
          handleAnswerChange(optionId);
        }
      }
      
      // Enter to submit/continue
      if (e.key === 'Enter') {
        e.preventDefault();
        if (showFeedback) {
          handleNext();
        } else if (answers[currentQuestion.question_id]?.length > 0) {
          handleSubmitAnswer();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, answers, showFeedback]);

  const handleAnswerChange = (optionId: string) => {
    const questionId = currentQuestion.question_id;
    
    if (currentQuestion.question_type === 'multiple_select') {
      // Multiple selection
      const currentAnswers = answers[questionId] || [];
      const newAnswers = currentAnswers.includes(optionId)
        ? currentAnswers.filter(id => id !== optionId)
        : [...currentAnswers, optionId];
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));
    } else {
      // Single selection (multiple_choice, true_false)
      setAnswers(prev => ({
        ...prev,
        [questionId]: [optionId]
      }));
    }
  };

  const handleSubmitAnswer = () => {
    if (sceneData.feedback_immediate) {
      setShowFeedback(true);
    } else {
      handleNext();
    }
  };

  const handleNext = () => {
    setShowFeedback(false);
    
    if (isLastQuestion) {
      // Calculate final results
      const results = calculateResults();
      setIsSubmitting(true);
      
      setTimeout(() => {
        onComplete(results);
      }, 500);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const calculateResults = (): QuizResults => {
    const questionResults = sceneData.questions.map(question => {
      const selectedAnswers = answers[question.question_id] || [];
      const correctOptions = question.options.filter(opt => opt.is_correct).map(opt => opt.option_id);
      
      const isCorrect = selectedAnswers.length === correctOptions.length &&
        selectedAnswers.every(id => correctOptions.includes(id));
      
      return {
        question_id: question.question_id,
        selected_answers: selectedAnswers,
        is_correct: isCorrect,
        points_earned: isCorrect ? question.points : 0
      };
    });

    const correctAnswers = questionResults.filter(r => r.is_correct).length;
    const totalPoints = sceneData.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = questionResults.reduce((sum, r) => sum + r.points_earned, 0);
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const timeSpent = Math.round((Date.now() - startTime) / 1000);

    return {
      totalQuestions: sceneData.questions.length,
      correctAnswers,
      score,
      passed: score >= sceneData.passing_score,
      timeSpent,
      answers: questionResults
    };
  };

  const isAnswerCorrect = () => {
    const selectedAnswers = answers[currentQuestion.question_id] || [];
    const correctOptions = currentQuestion.options.filter(opt => opt.is_correct).map(opt => opt.option_id);
    
    return selectedAnswers.length === correctOptions.length &&
      selectedAnswers.every(id => correctOptions.includes(id));
  };

  const renderQuestionContent = () => {
    const selectedAnswers = answers[currentQuestion.question_id] || [];

    switch (currentQuestion.question_type) {
      case 'multiple_choice':
      case 'true_false':
        return (
          <RadioGroup
            value={selectedAnswers[0] || ''}
            onChange={(value) => handleAnswerChange(value)}
          >
            <VStack align="start" spacing={3}>
              {currentQuestion.options.map((option, index) => (
                <Radio
                  key={option.option_id}
                  value={option.option_id}
                  size="lg"
                  colorScheme="blue"
                  // 48px minimum touch target (Anna Svensson requirement)
                  minH="48px"
                  w="100%"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                  // Keyboard shortcut indicator
                  position="relative"
                >
                  <HStack justify="space-between" w="100%">
                    <Text fontSize={isMobile ? "md" : "lg"}>
                      {getOptionText(option)}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {index + 1}
                    </Text>
                  </HStack>
                </Radio>
              ))}
            </VStack>
          </RadioGroup>
        );

      case 'multiple_select':
        return (
          <CheckboxGroup value={selectedAnswers} onChange={setAnswers}>
            <VStack align="start" spacing={3}>
              {currentQuestion.options.map((option, index) => (
                <Checkbox
                  key={option.option_id}
                  value={option.option_id}
                  onChange={() => handleAnswerChange(option.option_id)}
                  size="lg"
                  colorScheme="blue"
                  minH="48px"
                  w="100%"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: 'gray.50' }}
                >
                  <HStack justify="space-between" w="100%">
                    <Text fontSize={isMobile ? "md" : "lg"}>
                      {getOptionText(option)}
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      {index + 1}
                    </Text>
                  </HStack>
                </Checkbox>
              ))}
            </VStack>
          </CheckboxGroup>
        );

      default:
        return <Text>Okänd frågetype</Text>;
    }
  };

  return (
    <Box
      maxW="100%"
      mx="auto"
      p={isMobile ? 4 : 6}
      minH="100vh"
      bg={bgColor}
      borderTop={municipalBranding ? `4px solid ${primaryColor}` : undefined}
    >
      {/* Municipal header */}
      {municipalBranding && (
        <HStack mb={6} justify="space-between" align="center">
          <Text fontSize="sm" color="gray.600">
            {municipalBranding.municipality}
          </Text>
          {municipalBranding.logoUrl && (
            <Box w="40px" h="40px">
              <img 
                src={municipalBranding.logoUrl} 
                alt={`${municipalBranding.municipality} logotyp`}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
          )}
        </HStack>
      )}

      {/* Progress indicator */}
      <VStack spacing={4} mb={6}>
        <Progress 
          value={progress} 
          colorScheme="blue"
          bg="gray.200"
          w="100%"
          h="8px"
          borderRadius="full"
          aria-label={`Fråga ${currentQuestionIndex + 1} av ${sceneData.questions.length}`}
        />
        <HStack justify="space-between" w="100%">
          <Text fontSize="sm" color="gray.600">
            {sceneData.title}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {currentQuestionIndex + 1} / {sceneData.questions.length}
          </Text>
        </HStack>
      </VStack>

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card bg={bgColor} shadow="md" mb={6}>
            <CardBody>
              <VStack align="start" spacing={4}>
                <Text 
                  fontSize={isMobile ? "lg" : "xl"} 
                  fontWeight="semibold"
                  lineHeight="tall"
                >
                  {currentQuestion.question_text}
                </Text>
                
                {hasValidOptions ? renderQuestionContent() : (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium">
                        Fel i frågans svarsalternativ
                      </Text>
                      <Text fontSize="sm">
                        Ett eller flera svarsalternativ saknar text. Kontakta support.
                      </Text>
                    </VStack>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Immediate feedback */}
      {showFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert 
            status={isAnswerCorrect() ? "success" : "error"}
            mb={6}
            borderRadius="md"
          >
            <AlertIcon />
            <VStack align="start" spacing={2}>
              <Text fontWeight="medium">
                {isAnswerCorrect() ? "Rätt svar!" : "Fel svar"}
              </Text>
              <Text fontSize="sm">
                {currentQuestion.explanation}
              </Text>
            </VStack>
          </Alert>
        </motion.div>
      )}

      {/* Navigation controls */}
      <HStack justify="center" spacing={4}>
        {!showFeedback ? (
          <MunicipalButton
            onClick={handleSubmitAnswer}
            variant="municipal-primary"
            culturalContext={culturalContext}
            municipalEntity={municipalBranding?.municipality}
            isDisabled={!answers[currentQuestion.question_id]?.length || !hasValidOptions}
            aria-label="Svara på frågan"
          >
            {getButtonText('submit', culturalContext)}
          </MunicipalButton>
        ) : (
          <MunicipalButton
            onClick={handleNext}
            variant="municipal-primary"
            culturalContext={culturalContext}
            municipalEntity={municipalBranding?.municipality}
            isLoading={isSubmitting}
            loadingText={isLastQuestion ? "Slutför..." : "Nästa..."}
          >
            {isLastQuestion ? getButtonText('finish', culturalContext) : getButtonText('next', culturalContext)}
          </MunicipalButton>
        )}
      </HStack>

      {/* Keyboard shortcuts help */}
      <Box mt={6} p={3} bg="gray.50" borderRadius="md" fontSize="xs" color="gray.600">
        <Text>
          💡 Tangentbordsgenvägar: Tryck 1-{currentQuestion.options.length} för att välja, Enter för att svara/fortsätta
        </Text>
      </Box>

      {/* Accessibility helpers */}
      <Box srOnly>
        <div aria-live="polite" aria-atomic="true">
          Fråga {currentQuestionIndex + 1} av {sceneData.questions.length}. 
          {showFeedback && (isAnswerCorrect() ? "Rätt svar!" : "Fel svar")}
        </div>
      </Box>
    </Box>
  );
};

export default QuizScene;