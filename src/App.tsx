import { useState } from 'react';
import { Box, VStack, Heading, Text, Button } from '@chakra-ui/react';
import { StrategyPlayHost } from './components/StrategyPlayHost';
import type { GameResults } from './components/StrategyPlayHost';
import type { GameManifest } from './types/game-manifest';
import sampleGame from './examples/sample-game.json';
import { DevShowcase } from './dev/DevShowcase';
import { AdminApp } from './components/admin/AdminApp';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [showComponentShowcase, setShowComponentShowcase] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);

  const handleGameComplete = (results: GameResults) => {
    console.log('Game completed:', results);
    setGameResults(results);
    setGameStarted(false);
  };

  const handleStartGame = () => {
    setGameResults(null);
    setGameStarted(true);
  };

  const analytics = {
    trackEvent: (eventType: string, data: any) => {
      console.log('Analytics:', eventType, data);
    },
  };

  if (showAdminPortal) {
    return <AdminApp />;
  }

  if (showComponentShowcase) {
    return <DevShowcase />;
  }

  if (gameStarted) {
    return (
      <StrategyPlayHost
        gameManifest={sampleGame as GameManifest}
        onComplete={handleGameComplete}
        analytics={analytics}
      />
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <VStack gap={6} maxW="600px" mx="auto" p={6}>
        <Heading size="xl" textAlign="center" color="brand.600">
          DigiNativa Runtime Engine
        </Heading>
        
        <Text fontSize="lg" textAlign="center" color="gray.700">
          Demo av spelmotorn med Chakra UI integration
        </Text>

        {gameResults && (
          <Box 
            bg="green.50" 
            p={4} 
            borderRadius="md" 
            borderLeft="4px"
            borderLeftColor="green.500"
            w="100%"
          >
            <Heading size="md" color="green.700" mb={2}>
              Spel Avslutat! 🎉
            </Heading>
            <Text><strong>Poäng:</strong> {gameResults.score}/{gameResults.totalScore}</Text>
            <Text><strong>Tid:</strong> {Math.round(gameResults.timeSpent / 1000)} sekunder</Text>
            <Text><strong>Scener:</strong> {gameResults.scenesCompleted.length}</Text>
          </Box>
        )}

        <VStack gap={4} w="100%">
          <Button 
            onClick={handleStartGame}
            colorScheme="brand"
            size="lg"
            w="100%"
            maxW="300px"
          >
            Starta Demo Spel
          </Button>
          
          <Button 
            onClick={() => setShowComponentShowcase(true)}
            variant="outline"
            colorScheme="blue"
            size="lg"
            w="100%"
            maxW="300px"
          >
            Visa Component Showcase
          </Button>
          
          <Button 
            onClick={() => setShowAdminPortal(true)}
            variant="outline"
            colorScheme="purple"
            size="lg"
            w="100%"
            maxW="300px"
          >
            Enterprise Admin Portal
          </Button>
          
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Malmö Stad GDPR Training - 7 minuter
          </Text>
        </VStack>

        <Box bg="white" p={4} borderRadius="md" shadow="sm" w="100%">
          <Heading size="sm" mb={2}>Teknisk Info</Heading>
          <Text fontSize="sm" color="gray.600">
            • Chakra UI som foundation<br/>
            • Custom game scenes<br/>
            • Multi-tenant theming<br/>
            • WCAG 2.1 AA compliance<br/>
            • Mobile-first design
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}

export default App;