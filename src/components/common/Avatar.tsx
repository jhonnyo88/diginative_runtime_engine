import React from 'react';
import { Avatar as ChakraAvatar, Box } from '@chakra-ui/react';

// Define AvatarProps for Chakra UI v2 compatibility
interface AvatarProps {
  name?: string;
  src?: string;
  size?: string;
  bg?: string;
  color?: string;
}

// Game Designer spec: Character Avatar Styles implementation
// Based on task-005 specifications for municipal-appropriate styling

interface CharacterAvatarProps extends Omit<AvatarProps, 'src'> {
  character?: {
    name: string;
    avatar?: string;
    role?: string;
    type?: 'municipal' | 'legal' | 'it' | 'manager' | 'hr' | 'training';
  };
  showIndicator?: boolean;
  indicatorColor?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  showIndicator = true,
  indicatorColor = 'brand.500',
  size = 'lg',
  ...props
}) => {
  // Game Designer spec: Default professional avatars for different roles

  // Game Designer spec: Size mapping for Anna Svensson mobile optimization

  
  return (
    <Box position="relative" display="inline-block">
      <ChakraAvatar
        src={character?.avatar || getDefaultAvatar(character?.type)}
        name={character?.name || 'Anställd'}
        size={size}
        border={`${dimensions.border} solid`}
        borderColor={indicatorColor}
        bg="gray.100"
        color="gray.600"
        fontWeight="medium"
        // Game Designer spec: High-quality rendering for professional context
        style={{
          objectFit: 'cover'
        }}
        {...props}
      />
      
      {/* Professional indicator - Game Designer spec: Municipal context */}
      {showIndicator && (
        <Box
          position="absolute"
          bottom="-2px"
          right="-2px"
          w={dimensions.indicator}
          h={dimensions.indicator}
          bg={indicatorColor}
          borderRadius="full"
          border="2px solid white"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Role indicator icon */}
          <Box
            w="60%"
            h="60%"
            bg="white"
            borderRadius="full"
          />
        </Box>
      )}
    </Box>
  );
};

// Avatar group for multiple characters - Game Designer spec
export const CharacterAvatarGroup: React.FC<{
  characters: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    type?: 'municipal' | 'legal' | 'it' | 'manager' | 'hr' | 'training';
  }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ characters, max = 3, size = 'md' }) => {

  return (
    <Box display="flex" alignItems="center">
      {visibleCharacters.map((character, index) => (
        <Box
          key={character.id}
          ml={index > 0 ? '-8px' : '0'}
          position="relative"
          zIndex={characters.length - index}
        >
          <Box border="2px solid white" borderRadius="full">
            <CharacterAvatar
              character={character}
              size={size}
            />
          </Box>
        </Box>
      ))}
      
      {remainingCount > 0 && (
        <Box
          ml="-8px"
          w={size === 'sm' ? '32px' : size === 'md' ? '48px' : '64px'}
          h={size === 'sm' ? '32px' : size === 'md' ? '48px' : '64px'}
          bg="gray.200"
          borderRadius="full"
          border="2px solid white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={size === 'sm' ? 'xs' : 'sm'}
          fontWeight="medium"
          color="gray.600"
        >
          +{remainingCount}
        </Box>
      )}
    </Box>
  );
};

// Preset avatar configurations for common municipal roles
  annaManager: {
    name: 'Anna Svensson',
    role: 'Kommunal administratör',
    type: 'municipal' as const,
    avatar: '/avatars/anna-svensson.svg'
  },
  legalAdvisor: {
    name: 'Lars Eriksson',
    role: 'Juridisk rådgivare',
    type: 'legal' as const,
    avatar: '/avatars/lars-eriksson.svg'
  },
  itSpecialist: {
    name: 'Maria Andersson',
    role: 'IT-specialist',
    type: 'it' as const,
    avatar: '/avatars/maria-andersson.svg'
  },
  hrManager: {
    name: 'Per Johansson',
    role: 'HR-chef',
    type: 'manager' as const,
    avatar: '/avatars/per-johansson.svg'
  },
  trainingCoordinator: {
    name: 'Karin Nilsson',
    role: 'Utbildningskoordinator',
    type: 'training' as const,
    avatar: '/avatars/karin-nilsson.svg'
  }
};