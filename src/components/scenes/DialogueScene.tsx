import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  Avatar,
  SimpleGrid,
} from '@chakra-ui/react';
import { NextIcon } from '../icons/GameIcons';
import { CharacterAvatar } from '../common/Avatar';
import type { DialogueScene as DialogueSceneType } from '../../types/game-manifest';

interface DialogueSceneProps {
  scene: DialogueSceneType;
  onComplete: (results: any) => void;
  analytics?: {
    trackEvent: (eventType: string, data: any) => void;
  };
}

export const DialogueScene: React.FC<DialogueSceneProps> = ({
  scene,
  onComplete,
  analytics,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showChoices, setShowChoices] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  const currentMessage = scene.messages[currentMessageIndex];
  const isLastMessage = currentMessageIndex === scene.messages.length - 1;

  // Auto-advance messages with delay
  useEffect(() => {
    if (currentMessage?.delay && currentMessageIndex < scene.messages.length - 1) {
      const timer = setTimeout(() => {
        setCurrentMessageIndex(prev => prev + 1);
      }, currentMessage.delay);
      return () => clearTimeout(timer);
    }
  }, [currentMessage, currentMessageIndex, scene.messages.length]);

  // Show choices when all messages are displayed
  useEffect(() => {
    if (isLastMessage && scene.choices) {
      setShowChoices(true);
    }
  }, [isLastMessage, scene.choices]);

  const handleNext = () => {
    analytics?.trackEvent('dialogue_next', {
      sceneId: scene.id,
      messageIndex: currentMessageIndex,
    });

    if (currentMessageIndex < scene.messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
    } else if (scene.choices) {
      setShowChoices(true);
    } else {
      // No choices, complete scene
      onComplete({
        nextScene: scene.navigation?.next,
        answers: { messagesSeen: scene.messages.length },
      });
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    const choice = scene.choices?.find(c => c.id === choiceId);
    if (!choice) return;

    setSelectedChoice(choiceId);
    
    analytics?.trackEvent('dialogue_choice', {
      sceneId: scene.id,
      choiceId,
      choiceText: choice.text,
    });

    // Complete scene with choice results
    setTimeout(() => {
      onComplete({
        nextScene: choice.nextScene || scene.navigation?.next,
        score: choice.points || 0,
        answers: { 
          choiceId,
          choiceText: choice.text,
          messagesSeen: scene.messages.length,
        },
      });
    }, 500); // Brief delay for visual feedback
  };

  const getCharacterInfo = (characterId?: string) => {
    if (!characterId) return scene.character;
    // In the future, we might have a character lookup
    return scene.character;
  };

  const character = getCharacterInfo(currentMessage?.characterId);

  return (
    <Box p={4} h="100vh" display="flex" flexDirection="column">
      {/* Scene header */}
      {scene.title && (
        <Text 
          fontSize="lg" 
          fontWeight="bold" 
          mb={4} 
          textAlign="center"
          color="gray.700"
        >
          {scene.title}
        </Text>
      )}

      {/* Main dialogue area */}
      <VStack flex="1" gap={4} justify="center" maxW="500px" mx="auto">
        
        {/* Character avatar and info - Game Designer spec: Clear speaker identification */}
        {character && (
          <HStack gap={3} alignSelf="flex-start" mb={4}>
            <CharacterAvatar 
              character={{
                name: character.name,
                avatar: character.avatar,
                role: character.role,
                type: 'municipal'
              }}
              size="lg"
              showIndicator={true}
              indicatorColor="brand.500"
            />
            <VStack align="start" gap={1}>
              <Text fontWeight="bold" fontSize="md" color="gray.800">
                {character.name}
              </Text>
              {character.role && (
                <Text fontSize="sm" color="brand.600" fontWeight="medium">
                  {character.role}
                </Text>
              )}
            </VStack>
          </HStack>
        )}

        {/* Current message - Game Designer spec: Speech bubble design */}
        <Box 
          key={currentMessageIndex}
          bg="white" 
          shadow="lg" 
          borderLeft="6px"
          borderLeftColor="brand.500"
          maxW="100%"
          p={6}
          borderRadius="xl"
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            left: '-12px',
            top: '24px',
            border: '12px solid transparent',
            borderRightColor: 'white',
            borderLeftWidth: 0,
          }}
          role="region"
          aria-label={`Message from ${character?.name || 'Speaker'}`}
          aria-live="polite"
        >
          <Text 
            fontSize="lg" 
            lineHeight="1.7"
            color="gray.900"
            fontWeight="normal"
          >
            {currentMessage?.text}
          </Text>
          
          {/* Message metadata for accessibility */}
          <Text 
            fontSize="xs" 
            color="gray.500" 
            mt={2}
            aria-label="Message progress"
          >
            {currentMessageIndex + 1} av {scene.messages.length}
          </Text>
        </Box>

        {/* Progress indicator */}
        <HStack gap={2} mt={4}>
          {scene.messages.map((_, index) => (
            <Box
              key={index}
              w="8px"
              h="8px"
              borderRadius="full"
              bg={index <= currentMessageIndex ? 'brand.500' : 'gray.300'}
              transition="all 0.2s"
            />
          ))}
        </HStack>
      </VStack>

      {/* Action area */}
      <Box mt={6} id="scene-actions">
        {showChoices && scene.choices ? (
          // Show choice buttons
          <VStack gap={3}>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Välj ditt svar:
            </Text>
            <VStack gap={3} w="100%">
                {scene.choices.map((choice) => (
                  <Button
                    key={choice.id}
                    variant={selectedChoice === choice.id ? 'solid' : 'outline'}
                    colorScheme={selectedChoice === choice.id ? 'brand' : 'gray'}
                    onClick={() => handleChoiceSelect(choice.id)}
                    disabled={selectedChoice !== null && selectedChoice !== choice.id}
                    minH="64px"
                    textAlign="left"
                    whiteSpace="normal"
                    p={6}
                    borderRadius="lg"
                    fontWeight="medium"
                    fontSize="md"
                    border="2px solid"
                    borderColor={selectedChoice === choice.id ? 'brand.500' : 'gray.200'}
                    _hover={{
                      borderColor: 'brand.300',
                      transform: 'translateY(-2px)',
                      shadow: 'lg',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.2s"
                    aria-label={`Choice: ${choice.text}`}
                    role="button"
                    tabIndex={0}
                  >
                    <HStack gap={3} w="100%">
                      <Box
                        w="8px"
                        h="8px"
                        borderRadius="full"
                        bg={selectedChoice === choice.id ? 'white' : 'transparent'}
                        border="2px solid"
                        borderColor={selectedChoice === choice.id ? 'white' : 'gray.400'}
                      />
                      <Text flex="1" textAlign="left">
                        {choice.text}
                      </Text>
                    </HStack>
                  </Button>
                ))}
            </VStack>
          </VStack>
        ) : (
          // Show next button - Game Designer spec: 48px minimum touch targets
          <Button
            onClick={handleNext}
            colorScheme="brand"
            size="lg"
            w="100%"
            maxW="320px"
            mx="auto"
            display="block"
            minH="56px"
            fontSize="lg"
            fontWeight="bold"
            borderRadius="xl"
            _hover={{
              transform: 'translateY(-2px)',
              shadow: 'lg',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            transition="all 0.2s"
            aria-label={isLastMessage ? 'Fortsätt till nästa del' : 'Nästa meddelande'}
            rightIcon={<NextIcon />}
          >
            {isLastMessage ? 'Fortsätt' : 'Nästa'}
          </Button>
        )}
      </Box>
    </Box>
  );
};