/**
 * Username Modal Component
 * Centered modal dialog for critical user name input interaction
 * 
 * Based on Game Designer specifications:
 * - Modal popup vid game start
 * - Rubrik: "Välkommen! Vad heter du?"
 * - Enkel design med input-fält
 * - "Fortsätt"-knapp (inte bara "OK")
 * - Focus management och backdrop
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useColorModeValue,
  Box
} from '@chakra-ui/react';

export interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  title?: string;
  subtitle?: string;
  municipalTheme?: 'sweden' | 'germany' | 'france' | 'netherlands';
  isRequired?: boolean;
}

// Municipal theme colors

export const UsernameModal: React.FC<UsernameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Välkommen! Vad heter du?",
  subtitle = "Ange ditt namn för att få en personlig upplevelse",
  municipalTheme = 'sweden',
  isRequired = true
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');


  // Focus management - focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setError('');
    }
  }, [isOpen]);

  const _validateName = (inputName: string): boolean => {
    
    if (isRequired && trimmedName.length === 0) {
      setError('Namn krävs för att fortsätta');
      return false;
    }
    
    if (trimmedName.length > 50) {
      setError('Namnet är för långt (max 50 tecken)');
      return false;
    }
    
    // Basic validation - only letters, spaces, hyphens, apostrophes
    if (trimmedName.length > 0 && !nameRegex.test(trimmedName)) {
      setError('Namnet får endast innehålla bokstäver, mellanslag och bindestreck');
      return false;
    }
    
    setError('');
    return true;
  };





  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleCancel}
      isCentered
      closeOnOverlayClick={false} // Prevent accidental closure
      closeOnEsc={!isRequired} // Allow ESC only if not required
      size="md"
      motionPreset="slideInBottom"
    >
      <ModalOverlay bg={overlayColor} backdropFilter="blur(4px)" />
      <ModalContent
        bg={bgColor}
        borderRadius="lg"
        shadow="2xl"
        mx={4} // Mobile margins
        maxW="400px"
        borderTop={`4px solid ${themeColors.primary}`}
      >
        <ModalHeader pb={2}>
          <VStack spacing={2} align="start" w="100%">
            <Text 
              fontSize="xl" 
              fontWeight="bold" 
              color={themeColors.primary}
              lineHeight="shorter"
            >
              {title}
            </Text>
            {subtitle && (
              <Text 
                fontSize="sm" 
                color="gray.600" 
                fontWeight="normal"
                lineHeight="base"
              >
                {subtitle}
              </Text>
            )}
          </VStack>
        </ModalHeader>
        
        {!isRequired && <ModalCloseButton />}

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!error}>
              <FormLabel 
                fontSize="md" 
                fontWeight="semibold"
                color="gray.700"
              >
                Ditt namn
              </FormLabel>
              <Input
                ref={inputRef}
                placeholder="Skriv ditt förnamn..."
                value={name}
                onChange={handleNameChange}
                onKeyPress={handleKeyPress}
                size="lg"
                borderColor={error ? 'red.300' : 'gray.300'}
                focusBorderColor={error ? 'red.500' : themeColors.primary}
                _hover={{
                  borderColor: error ? 'red.400' : 'gray.400'
                }}
                maxLength={50}
                autoComplete="given-name"
                aria-describedby={error ? 'name-error' : undefined}
              />
              {error && (
                <Text 
                  id="name-error"
                  fontSize="sm" 
                  color="red.500" 
                  mt={2}
                  role="alert"
                >
                  {error}
                </Text>
              )}
            </FormControl>

            <VStack spacing={3} pt={2}>
              <Button
                onClick={handleSubmit}
                bg={themeColors.primary}
                color="white"
                _hover={{ opacity: 0.9 }}
                _active={{ transform: 'translateY(1px)' }}
                size="lg"
                w="100%"
                minH="48px" // Anna Svensson touch target
                isDisabled={isRequired && name.trim().length === 0}
                borderRadius="md"
                fontWeight="semibold"
              >
                Fortsätt
              </Button>

              {!isRequired && (
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  size="md"
                  color="gray.600"
                  _hover={{ bg: 'gray.100' }}
                >
                  Hoppa över
                </Button>
              )}
            </VStack>

            {/* Privacy notice */}
            <Box
              bg={themeColors.secondary}
              p={3}
              borderRadius="md"
              mt={4}
            >
              <Text fontSize="xs" color="gray.600" textAlign="center">
                🔒 Ditt namn används endast för att personalisera spelupplevelsen och sparas inte permanent.
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UsernameModal;