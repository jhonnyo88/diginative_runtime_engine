import React from 'react';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Spinner, 
  Progress,
  Alert,
  Button,
  Card,
  CardBody
} from '@chakra-ui/react';
import { LoadingSkeleton } from '../animations/SceneTransition';
import { RestartIcon, InfoIcon } from '../icons/GameIcons';

// Game Designer spec: Loading states for 3-second Anna Svensson patience optimization

interface LoadingStateProps {
  type: 'scene' | 'content' | 'quiz' | 'assessment';
  message?: string;
  progress?: number;
  showProgress?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message,
  progress,
  showProgress = false
}) => {
  const getLoadingMessage = () => {
    const messages = {
      scene: 'Laddar scen...',
      content: 'Förbereder innehåll...',
      quiz: 'Förbereder frågor...',
      assessment: 'Beräknar resultat...'
    };
    return message || messages[type];
  };

  return (
    <VStack gap={6} p={8} textAlign="center" maxW="400px" mx="auto">
      {/* Loading spinner with municipal branding */}
      <Box position="relative">
        <Spinner
          size="xl"
          color="brand.500"
          thickness="4px"
          speed="0.8s"
          emptyColor="gray.200"
        />
        {/* Anna Svensson optimization: Clear feedback within 3 seconds */}
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          fontSize="xs"
          color="brand.600"
          fontWeight="bold"
        >
          {Math.round((progress || 0))}%
        </Box>
      </Box>

      {/* Loading message */}
      <Text fontSize="lg" fontWeight="medium" color="gray.700">
        {getLoadingMessage()}
      </Text>

      {/* Progress indicator */}
      {showProgress && typeof progress === 'number' && (
        <Box w="100%">
          <Progress 
            value={progress} 
            colorScheme="brand"
            size="md"
            borderRadius="full"
            bg="gray.200"
          />
          <Text fontSize="sm" color="gray.600" mt={2}>
            {Math.round(progress)}% slutfört
          </Text>
        </Box>
      )}

      {/* Patience indicator - Game Designer spec */}
      <Text fontSize="sm" color="gray.500">
        Vänligen vänta ett ögonblick...
      </Text>
    </VStack>
  );
};

// Scene loading skeleton - Game Designer spec: Content placeholder patterns
export const SceneLoadingSkeleton: React.FC<{
  sceneType: 'dialogue' | 'quiz' | 'assessment';
}> = ({ sceneType }) => {
  const renderDialogueSkeleton = () => (
    <VStack gap={4} p={4} maxW="500px" mx="auto">
      {/* Avatar skeleton */}
      <HStack gap={3} alignSelf="flex-start" w="100%">
        <Box w="64px" h="64px" bg="gray.200" borderRadius="full" />
        <VStack align="start" gap={2}>
          <LoadingSkeleton height="20px" borderRadius="md" />
          <LoadingSkeleton height="16px" borderRadius="md" />
        </VStack>
      </HStack>
      
      {/* Message skeleton */}
      <Card w="100%" bg="gray.50">
        <CardBody p={6}>
          <VStack gap={2} align="stretch">
            <LoadingSkeleton height="24px" count={3} />
          </VStack>
        </CardBody>
      </Card>
      
      {/* Button skeleton */}
      <LoadingSkeleton height="56px" borderRadius="xl" />
    </VStack>
  );

  const renderQuizSkeleton = () => (
    <VStack gap={4} p={4} maxW="600px" mx="auto">
      {/* Question skeleton */}
      <Card w="100%" bg="blue.50">
        <CardBody>
          <LoadingSkeleton height="28px" count={2} />
        </CardBody>
      </Card>
      
      {/* Answer options skeleton */}
      <VStack gap={3} w="100%">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} height="64px" borderRadius="lg" />
        ))}
      </VStack>
      
      {/* Submit button skeleton */}
      <LoadingSkeleton height="48px" borderRadius="lg" />
    </VStack>
  );

  const renderAssessmentSkeleton = () => (
    <VStack gap={6} p={4} maxW="600px" mx="auto">
      {/* Score circle skeleton */}
      <Box w="160px" h="160px" bg="gray.200" borderRadius="full" mx="auto" />
      
      {/* Stats skeleton */}
      <HStack gap={6} w="100%">
        {[1, 2, 3].map((i) => (
          <VStack key={i} gap={2} flex="1">
            <LoadingSkeleton height="16px" />
            <LoadingSkeleton height="24px" />
          </VStack>
        ))}
      </HStack>
      
      {/* Content cards skeleton */}
      <VStack gap={4} w="100%">
        {[1, 2].map((i) => (
          <Card key={i} w="100%">
            <CardBody>
              <LoadingSkeleton height="24px" count={3} />
            </CardBody>
          </Card>
        ))}
      </VStack>
    </VStack>
  );

  const skeletonRenderers = {
    dialogue: renderDialogueSkeleton,
    quiz: renderQuizSkeleton,
    assessment: renderAssessmentSkeleton
  };

  return (
    <Box 
      w="100%" 
      minH="400px" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      opacity={0.7}
    >
      {skeletonRenderers[sceneType]()}
    </Box>
  );
};

// Network error state - Game Designer spec: Error handling visual patterns
export const NetworkErrorState: React.FC<{
  onRetry?: () => void;
  onOfflineMode?: () => void;
}> = ({ onRetry, onOfflineMode }) => {
  return (
    <VStack gap={6} p={8} textAlign="center" maxW="400px" mx="auto">
      <Alert status="warning" borderRadius="xl" bg="orange.50">
        <InfoIcon color="orange.500" />
        <Box ml={3}>
          <Text fontWeight="bold">Anslutningsproblem</Text>
          <Text fontSize="sm" mt={1}>
            Kontrollera din internetanslutning och försök igen.
          </Text>
        </Box>
      </Alert>

      <VStack gap={3} w="100%">
        {onRetry && (
          <Button
            onClick={onRetry}
            colorScheme="blue"
            size="lg"
            w="100%"
            leftIcon={<RestartIcon />}
          >
            Försök igen
          </Button>
        )}
        
        {onOfflineMode && (
          <Button
            onClick={onOfflineMode}
            variant="outline"
            colorScheme="gray"
            size="lg"
            w="100%"
          >
            Fortsätt offline
          </Button>
        )}
      </VStack>

      <Text fontSize="sm" color="gray.500">
        Anna Svensson optimering: Automatisk återförsök om 30 sekunder
      </Text>
    </VStack>
  );
};

// Progressive loading component - Game Designer spec: 3-second patience window
export const ProgressiveLoader: React.FC<{
  stages: Array<{
    name: string;
    duration: number;
    message: string;
  }>;
  onComplete: () => void;
}> = ({ stages, onComplete }) => {
  const [currentStage, setCurrentStage] = React.useState(0);
  const [stageProgress, setStageProgress] = React.useState(0);

  React.useEffect(() => {
    if (currentStage >= stages.length) {
      onComplete();
      return;
    }

    const stage = stages[currentStage];
    const interval = setInterval(() => {
      setStageProgress(prev => {
        const next = prev + (100 / (stage.duration / 100));
        if (next >= 100) {
          setCurrentStage(curr => curr + 1);
          setStageProgress(0);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStage, stages, onComplete]);

  const currentStageData = stages[currentStage];
  const overallProgress = ((currentStage * 100) + stageProgress) / stages.length;

  if (!currentStageData) return null;

  return (
    <LoadingState
      type="content"
      message={currentStageData.message}
      progress={overallProgress}
      showProgress={true}
    />
  );
};