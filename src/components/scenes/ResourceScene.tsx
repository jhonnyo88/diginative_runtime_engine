import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { ResourceScene as ResourceSceneType } from '../../types/game-manifest';

interface ResourceSceneProps {
  scene: ResourceSceneType;
  onComplete: (results: any) => void;
  analytics?: {
    trackEvent: (eventType: string, data: any) => void;
  };
}

export const ResourceScene: React.FC<ResourceSceneProps> = ({
  scene,
  onComplete,
}) => {
  // TODO: Implement full resource functionality
  return (
    <Box p={4} textAlign="center">
      <Text fontSize="xl" mb={4}>Resource Scene</Text>
      <Text mb={4}>Title: {scene.title}</Text>
      <Text mb={6}>This component will be implemented in Phase 2</Text>
      <Button 
        onClick={() => onComplete({ nextScene: scene.navigation?.next })}
        colorScheme="brand"
      >
        Continue
      </Button>
    </Box>
  );
};