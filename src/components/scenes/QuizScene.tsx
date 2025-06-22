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
  onComplete: (results: Record<string, unknown>) => void;
  analytics?: {
    trackEvent: (eventType: string, data: Record<string, unknown>) => void;
  };
}

// Data transformation helper to handle both option_text and text formats

export const QuizScene: React.FC<QuizSceneProps> = ({
  scene,
  onComplete,
  analytics,
}) => {
  // Transform the scene to handle data format variations from different sources
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // TASK-HD-014: Removed showCelebration state - no more popup celebrations
  
  // Game Designer spec: Animation support handled by CSS








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