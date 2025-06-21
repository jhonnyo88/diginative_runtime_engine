import React, { useState } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Button, 
  Card, 
  CardBody,
  Alert,
  Progress,
  Badge,
  Image,
} from '@chakra-ui/react';
import type { QuizScene as QuizSceneType } from '../../types/game-manifest';
import { CheckIcon, CloseIcon } from '../icons/GameIcons';
import { ButtonFeedback } from '../animations/CelebrationEffects';
import { useAnimations } from '../../hooks/useAnimations';

interface QuizSceneProps {
  scene: QuizSceneType;
  onComplete: (results: any) => void;
  analytics?: {
    trackEvent: (eventType: string, data: any) => void;
  };
}

// Data transformation helper to handle both option_text and text formats
const transformQuizOptions = (options: any[]): QuizSceneType['options'] => {
  return options.map(option => ({
    id: option.id || option.option_id,
    text: option.text || option.option_text || '',
    isCorrect: option.isCorrect !== undefined ? option.isCorrect : option.is_correct,
    feedback: option.feedback || option.feedback_text,
    points: option.points || option.partial_credit || 1
  }));
};

export const QuizScene: React.FC<QuizSceneProps> = ({
  scene,
  onComplete,
  analytics,
}) => {
  // Transform the scene to handle data format variations from different sources
  const normalizedScene = {
    ...scene,
    question: scene.question || (scene as any).question_text || '',
    options: transformQuizOptions(scene.options || (scene as any).questions?.[0]?.options || [])
  };
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // TASK-HD-014: Removed showCelebration state - no more popup celebrations
  
  // Game Designer spec: Animation support handled by CSS

  const maxAttempts = normalizedScene.maxAttempts || 3;
  const allowMultiple = normalizedScene.allowMultiple || false;

  const handleAnswerSelect = (optionId: string) => {
    if (isSubmitted) return;

    analytics?.trackEvent('quiz_answer_select', {
      sceneId: normalizedScene.id,
      optionId,
      attempt: attempts + 1,
    });

    if (allowMultiple) {
      // Multiple selection
      setSelectedAnswers(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single selection
      setSelectedAnswers([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswers.length === 0) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setIsSubmitted(true);

    // Calculate score
    const correctAnswers = normalizedScene.options.filter(option => option.isCorrect);
    const selectedCorrect = selectedAnswers.filter(answerId => 
      normalizedScene.options.find(opt => opt.id === answerId)?.isCorrect
    );
    
    const isCorrect = allowMultiple 
      ? selectedCorrect.length === correctAnswers.length && selectedAnswers.length === correctAnswers.length
      : selectedCorrect.length > 0;

    const score = isCorrect ? (selectedCorrect.reduce((sum, answerId) => {
      const option = scene.options.find(opt => opt.id === answerId);
      return sum + (option?.points || 1);
    }, 0)) : 0;

    const maxScore = correctAnswers.reduce((sum, option) => sum + (option.points || 1), 0);

    analytics?.trackEvent('quiz_submit', {
      sceneId: normalizedScene.id,
      selectedAnswers,
      isCorrect,
      score,
      attempt: newAttempts,
    });

    // Show feedback if enabled
    if (normalizedScene.showFeedback !== false) {
      setShowFeedback(true);
      
      // TASK-HD-014: Removed intrusive celebration popup
      // Achievement System Redesign: No interruptions during quiz workflow
      
      // Auto-advance after feedback delay
      setTimeout(() => {
        if (isCorrect || newAttempts >= maxAttempts) {
          onComplete({
            nextScene: normalizedScene.navigation?.next,
            score,
            maxScore,
            answers: selectedAnswers,
            attempts: newAttempts,
            isCorrect,
          });
        } else {
          // Allow retry
          setIsSubmitted(false);
          setShowFeedback(false);
          setSelectedAnswers([]);
        }
      }, 3000);
    } else {
      // No feedback, complete immediately
      onComplete({
        nextScene: scene.navigation?.next,
        score,
        maxScore,
        answers: selectedAnswers,
        attempts: newAttempts,
        isCorrect,
      });
    }
  };

  const getSelectedFeedback = () => {
    return selectedAnswers.map(answerId => {
      const option = normalizedScene.options.find(opt => opt.id === answerId);
      return option?.feedback;
    }).filter(Boolean).join(' ');
  };

  const isCorrectAnswer = (optionId: string) => {
    return normalizedScene.options.find(opt => opt.id === optionId)?.isCorrect || false;
  };

  const getButtonVariant = (optionId: string) => {
    if (!isSubmitted) {
      return selectedAnswers.includes(optionId) ? 'solid' : 'outline';
    }
    
    // After submission, show correct/incorrect styling
    if (selectedAnswers.includes(optionId)) {
      return isCorrectAnswer(optionId) ? 'solid' : 'outline';
    }
    
    // Show correct answers that weren't selected
    return isCorrectAnswer(optionId) ? 'outline' : 'ghost';
  };

  const getButtonColorScheme = (optionId: string) => {
    if (!isSubmitted) {
      return selectedAnswers.includes(optionId) ? 'brand' : 'gray';
    }
    
    if (selectedAnswers.includes(optionId)) {
      return isCorrectAnswer(optionId) ? 'green' : 'red';
    }
    
    return isCorrectAnswer(optionId) ? 'green' : 'gray';
  };

  return (
    <Box p={4} maxW="600px" mx="auto">
      {/* Scene header */}
      <VStack spacing={4} mb={6}>
        {normalizedScene.title && (
          <Text fontSize="xl" fontWeight="bold" textAlign="center">
            {normalizedScene.title}
          </Text>
        )}
        
        {/* Attempts indicator */}
        {maxAttempts > 1 && (
          <Badge colorScheme="gray" fontSize="sm">
            Försök {attempts + 1} av {maxAttempts}
          </Badge>
        )}
        
        {/* Progress bar for attempts */}
        {maxAttempts > 1 && attempts > 0 && (
          <Progress 
            value={(attempts / maxAttempts) * 100} 
            w="100%" 
            colorScheme="brand"
            size="sm"
          />
        )}
      </VStack>

      {/* Media content */}
      {normalizedScene.media && (
        <Box mb={6} textAlign="center">
          {normalizedScene.questionType === 'image' && (
            <Image 
              src={normalizedScene.media.url} 
              alt={normalizedScene.media.alt}
              maxH="200px"
              mx="auto"
              borderRadius="md"
            />
          )}
          {normalizedScene.media.caption && (
            <Text fontSize="sm" color="gray.600" mt={2}>
              {normalizedScene.media.caption}
            </Text>
          )}
        </Box>
      )}

      {/* Question */}
      <Card mb={6} bg="blue.50" borderLeft="4px" borderLeftColor="brand.500">
        <CardBody>
          <Text fontSize="lg" fontWeight="medium" lineHeight="1.6">
            {normalizedScene.question}
          </Text>
        </CardBody>
      </Card>

      {/* Answer options */}
      <VStack spacing={3} mb={6}>
        {normalizedScene.options.map((option) => (
          <ButtonFeedback key={option.id} feedbackType="subtle" disabled={isSubmitted}>
            <Button
            key={option.id}
            variant={getButtonVariant(option.id)}
            colorScheme={getButtonColorScheme(option.id)}
            onClick={() => handleAnswerSelect(option.id)}
            disabled={isSubmitted}
            w="100%"
            minH="64px"
            textAlign="left"
            justifyContent="flex-start"
            whiteSpace="normal"
            p={6}
            borderRadius="lg"
            border="2px solid"
            borderColor={
              selectedAnswers.includes(option.id) 
                ? isSubmitted && isCorrectAnswer(option.id) 
                  ? 'green.500' 
                  : isSubmitted && !isCorrectAnswer(option.id)
                    ? 'red.500'
                    : 'brand.500'
                : 'gray.200'
            }
            _hover={{
              borderColor: 'brand.300',
              transform: 'translateY(-1px)',
              shadow: 'md',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.2s"
            position="relative"
            role="button"
            aria-label={`Answer option: ${option.text}`}
            aria-pressed={selectedAnswers.includes(option.id)}
          >
            <HStack gap={4} w="100%">
              {/* Answer indicator - Game Designer spec: Visual selection state */}
              <Box
                w="20px"
                h="20px"
                borderRadius="full"
                border="2px solid"
                borderColor={
                  selectedAnswers.includes(option.id)
                    ? isSubmitted && isCorrectAnswer(option.id)
                      ? 'green.500'
                      : isSubmitted && !isCorrectAnswer(option.id)
                        ? 'red.500'
                        : 'brand.500'
                    : 'gray.300'
                }
                bg={
                  selectedAnswers.includes(option.id)
                    ? isSubmitted && isCorrectAnswer(option.id)
                      ? 'green.500'
                      : isSubmitted && !isCorrectAnswer(option.id)
                        ? 'red.500'
                        : 'brand.500'
                    : 'transparent'
                }
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                {selectedAnswers.includes(option.id) && (
                  <Box w="8px" h="8px" borderRadius="full" bg="white" />
                )}
              </Box>
              
              <Text flex="1" textAlign="left" fontSize="md" fontWeight="medium">
                {option.text}
              </Text>
              
              {/* Feedback indicator when submitted */}
              {isSubmitted && selectedAnswers.includes(option.id) && (
                <Box color={isCorrectAnswer(option.id) ? 'green.500' : 'red.500'}>
                  {isCorrectAnswer(option.id) ? (
                    <CheckIcon w="20px" h="20px" />
                  ) : (
                    <CloseIcon w="20px" h="20px" />
                  )}
                </Box>
              )}
            </HStack>
          </Button>
          </ButtonFeedback>
        ))}
      </VStack>

      {/* Feedback */}
      {showFeedback && (
        <Alert 
          status={selectedAnswers.some(id => isCorrectAnswer(id)) ? 'success' : 'error'}
          mb={4}
        >
          {selectedAnswers.some(id => isCorrectAnswer(id)) ? (
            <CheckIcon color="green.500" />
          ) : (
            <CloseIcon color="red.500" />
          )}
          <Box ml={3}>
            <Text fontWeight="medium">
              {selectedAnswers.some(id => isCorrectAnswer(id)) ? 'Korrekt!' : 'Tyvärr, det var fel.'}
            </Text>
            {getSelectedFeedback() && (
              <Text fontSize="sm" mt={1}>
                {getSelectedFeedback()}
              </Text>
            )}
          </Box>
        </Alert>
      )}

      {/* Submit button */}
      {!isSubmitted && (
        <Button
          onClick={handleSubmit}
          colorScheme="brand"
          size="lg"
          w="100%"
          isDisabled={selectedAnswers.length === 0}
          mt={4}
        >
          {allowMultiple ? 'Skicka svar' : 'Svara'}
        </Button>
      )}

      {/* Instructions */}
      {!isSubmitted && allowMultiple && (
        <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
          Du kan välja flera alternativ
        </Text>
      )}
      
      {/* TASK-HD-014: Celebration effects removed for municipal professional context */}
    </Box>
  );
};