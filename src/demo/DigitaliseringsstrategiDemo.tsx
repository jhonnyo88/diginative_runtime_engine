import React, { useState } from 'react';
import { Box, Button, Text, VStack, Alert, AlertIcon, useToast, HStack, Heading, Badge, Card, CardBody } from '@chakra-ui/react';
import { StrategyPlayHost } from '../components/StrategyPlayHost';
import type { GameResults } from '../components/StrategyPlayHost';
import { type GameManifest } from '../types/game-manifest';
import { GameContainer } from '../components/GameContainer';
import { UsernameModal } from '../components/UsernameModal';
import demoGameData from '../../examples/digitaliseringsstrategi-demo.json';

export const DigitaliseringsstrategiDemo: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const toast = useToast();

  const handleStartGameClick = () => {
    setShowUsernameModal(true);
  };

  const handleUsernameSubmit = (name: string) => {
    setPlayerName(name);
    setShowUsernameModal(false);
    
    try {
      console.log('Starting demo game with data:', demoGameData);
      console.log('Player name:', name);
      setGameStarted(true);
      setError(null);
    } catch (err) {
      console.error('Failed to start game:', err);
      setError(`Failed to start game: ${err}`);
    }
  };

  const handleUsernameCancel = () => {
    setShowUsernameModal(false);
    setPlayerName('');
  };

  const handleGameComplete = (results: GameResults) => {
    console.log('Game completed:', results);
    setGameResults(results);
    setGameStarted(false);
  };

  const handleSceneChange = (sceneId: string) => {
    console.log('Scene changed to:', sceneId);
  };

  if (error) {
    return (
      <GameContainer variant="default" municipalTheme="sweden" errorBoundary>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => {
          setError(null);
          setGameStarted(false);
        }}>
          Försök igen
        </Button>
      </GameContainer>
    );
  }

  if (gameResults) {
    return (
      <GameContainer variant="default" municipalTheme="sweden" errorBoundary>
        <VStack spacing={4} align="stretch">
          <Text fontSize="2xl" fontWeight="bold" color="green.600">
            🎉 Spel slutfört!
          </Text>
          
          <Box bg="green.50" p={4} borderRadius="md" border="1px" borderColor="green.200">
            <Text><strong>Spel ID:</strong> {gameResults.gameId}</Text>
            <Text><strong>Poäng:</strong> {gameResults.score}/{gameResults.totalScore}</Text>
            <Text><strong>Tid:</strong> {Math.round(gameResults.timeSpent / 1000)} sekunder</Text>
            <Text><strong>Slutförda scener:</strong> {gameResults.scenesCompleted.join(', ')}</Text>
          </Box>

          <VStack spacing={3}>
            <Button 
              colorScheme="blue" 
              onClick={() => {
                setGameResults(null);
                setGameStarted(false);
                setShowUsernameModal(false);
                setPlayerName('');
              }}
            >
              Spela igen
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => {
                window.location.href = '/';
              }}
            >
              Tillbaka till startsidan
            </Button>
          </VStack>
        </VStack>
      </GameContainer>
    );
  }

  if (gameStarted) {
    try {
      return (
        <GameContainer variant="fullscreen" municipalTheme="sweden" errorBoundary bg="gray.50">
          <StrategyPlayHost
            gameManifest={demoGameData as GameManifest}
            onComplete={handleGameComplete}
            onSceneChange={handleSceneChange}
            culturalContext="swedish_mobile"
            playerName={playerName}
            analytics={{
              trackEvent: (eventType: string, data: Record<string, unknown>) => {
                console.log('Analytics:', eventType, data);
              }
            }}
          />
        </GameContainer>
      );
    } catch (err) {
      console.error('Error rendering StrategyPlayHost:', err);
      setError(`Game rendering error: ${err}`);
      setGameStarted(false);
      return null;
    }
  }

  return (
    <GameContainer variant="default" municipalTheme="sweden" errorBoundary>
      <Box minH="100vh">
        {/* Municipal Header Section */}
        <Box 
          as="header" 
          role="banner"
          bg="brand.500"
          color="white"
          py={{ base: 6, md: 8 }}
          px={4}
        >
          <VStack spacing={4} maxW="1200px" mx="auto">
            <HStack spacing={4} justify="center" align="center">
              <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                🏛️ Malmö Stad
              </Text>
              <Text fontSize="sm" opacity={0.9}>×</Text>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="semibold">
                DigiNativa
              </Text>
            </HStack>
            
            <Heading 
              as="h1" 
              size={{ base: "lg", md: "xl" }} 
              textAlign="center"
              fontWeight="bold"
            >
              Digitaliseringsstrategi-utbildning för kommunal personal
            </Heading>
            
            <Badge 
              bg="white" 
              color="brand.500" 
              px={3} 
              py={1} 
              borderRadius="full"
              fontWeight="semibold"
            >
              ✓ Säker kommunal plattform
            </Badge>
          </VStack>
        </Box>

        {/* Centered Content Section */}
        <Box as="main" py={{ base: 12, md: 16 }} px={4}>
          <VStack spacing={{ base: 8, md: 12 }} maxW="480px" mx="auto">
            <VStack spacing={4} textAlign="center">
              <Heading 
                as="h2" 
                size={{ base: "xl", md: "2xl" }} 
                color="gray.900"
                fontWeight="bold"
                lineHeight="shorter"
              >
                Digitaliseringsstrategi-utbildning
              </Heading>
              
              <Text 
                fontSize={{ base: "lg", md: "xl" }} 
                color="gray.600"
                lineHeight="base"
              >
                Lär dig Sveriges nya digitaliseringsstrategi på 7 minuter
              </Text>
              
              <Text 
                fontSize="md" 
                color="brand.600"
                fontWeight="semibold"
              >
                Relevant för din roll som kommunal förvaltare
              </Text>
            </VStack>

            <Card shadow="md" borderRadius="lg" w="100%">
              <CardBody>
                <VStack spacing={4} align="start">
                  <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                    📚 Vad du lär dig:
                  </Text>
                  <VStack align="start" spacing={2} w="100%">
                    <Text fontSize="md" color="gray.700">
                      • Strategins påverkan på kommunal verksamhet
                    </Text>
                    <Text fontSize="md" color="gray.700">
                      • Konkreta åtgärder för digital förvaltning
                    </Text>
                    <Text fontSize="md" color="gray.700">
                      • AI och säkerhetsaspekter för kommuner
                    </Text>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>

            <HStack 
              spacing={2} 
              justify="center" 
              fontSize="sm" 
              color="gray.600"
              flexWrap="wrap"
            >
              <Text fontWeight="semibold">Interaktiv utbildning</Text>
              <Text>•</Text>
              <Text fontWeight="semibold">7 minuter</Text>
              <Text>•</Text>
              <Text fontWeight="semibold">Malmö Stad</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Prominent Action Section */}
        <Box pb={{ base: 8, md: 12 }} px={4}>
          <VStack spacing={6} maxW="480px" mx="auto" textAlign="center">
            <Button 
              size="lg" 
              colorScheme="brand" 
              onClick={handleStartGameClick}
              w={{ base: "100%", md: "auto" }}
              minW={{ md: "280px" }}
              h={{ base: "48px", md: "56px" }}
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              px={8}
            >
              Starta digitaliseringsstrategiutbildningen
            </Button>
            
            <HStack 
              spacing={4} 
              justify="center" 
              fontSize="sm" 
              color="gray.600"
              flexWrap="wrap"
            >
              <Text>🔒 Säker inloggning</Text>
              <Text>💾 Sparade framsteg</Text>
              <Text>⏱️ 7 minuter</Text>
            </HStack>
            
            <Text fontSize="sm" color="gray.500">
              Support: <Text as="span" color="brand.600" fontWeight="semibold">it-support@malmo.se</Text>
            </Text>
          </VStack>
        </Box>
      </Box>

      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={handleUsernameCancel}
        onSubmit={handleUsernameSubmit}
        title="Välkommen till digitaliseringsstrategiutbildningen!"
        subtitle="Ange ditt namn för att få en personlig kommunal utbildningsupplevelse"
        municipalTheme="sweden"
        isRequired={true}
      />
    </GameContainer>
  );
};

export default DigitaliseringsstrategiDemo;