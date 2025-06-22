import { useState } from 'react';
import { Box, VStack, Heading, Text, Button, HStack, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, IconButton } from '@chakra-ui/react';
import { StrategyPlayHost } from './components/StrategyPlayHost';
import type { GameResults } from './components/StrategyPlayHost';
import type { GameManifest } from './types/game-manifest';
import sampleGame from './examples/sample-game.json';
import { DevShowcase } from './dev/DevShowcase';
import { DigitaliseringsstrategiDemo } from './demo/DigitaliseringsstrategiDemo';
import { AdminApp } from './components/admin/AdminApp';
import { useMonitoringDashboard } from './utils/monitoring-dashboard';
import { useAuth } from './contexts/AuthContext';
import { GameProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);
  const [showComponentShowcase, setShowComponentShowcase] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);
  const [showDigitaliseringsDemo, setShowDigitaliseringsDemo] = useState(false);
  
  // Authentication state
  const { user, isAuthenticated, logout } = useAuth();
  
  // Technical information modal
  const { isOpen: isTechModalOpen, onOpen: onTechModalOpen, onClose: onTechModalClose } = useDisclosure();
  
  // Initialize monitoring dashboard for development and production oversight
  const { MonitoringDashboard } = useMonitoringDashboard(false);

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
    trackEvent: (eventType: string, data: Record<string, unknown>) => {
      console.log('Analytics:', eventType, data);
    },
  };

  if (showAdminPortal) {
    return <AdminApp />;
  }

  if (showComponentShowcase) {
    return <DevShowcase />;
  }

  if (showDigitaliseringsDemo) {
    return <DigitaliseringsstrategiDemo />;
  }

  if (gameStarted) {
    return (
      <GameProtectedRoute>
        <StrategyPlayHost
          gameManifest={sampleGame as GameManifest}
          onComplete={handleGameComplete}
          analytics={analytics}
          playerName={user?.displayName}
        />
      </GameProtectedRoute>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" display="flex" justifyContent="center" alignItems="center">
      <VStack gap={6} maxW="600px" w="100%" mx="auto" p={8} align="center">
        {/* User authentication status */}
        {isAuthenticated && user && (
          <Box w="100%" bg="gray.50" p={4} borderRadius="md" border="1px" borderColor="gray.200">
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Text fontSize="sm" fontWeight="bold">
                  Välkommen, {user.displayName}
                </Text>
                <HStack spacing={2}>
                  <Badge colorScheme="blue" size="sm">
                    {user.municipality}
                  </Badge>
                  <Badge colorScheme="green" size="sm">
                    {user.role}
                  </Badge>
                </HStack>
              </VStack>
              <Button size="sm" variant="outline" onClick={logout}>
                Logga ut
              </Button>
            </HStack>
          </Box>
        )}

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

        <VStack gap={4} w="100%" align="center" maxW="400px">
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
            onClick={() => setShowDigitaliseringsDemo(true)}
            colorScheme="green"
            size="lg"
            w="100%"
            maxW="300px"
          >
            🇸🇪 Digitaliseringsstrategi Demo
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

        {/* Technical info button */}
        <HStack justify="center" w="100%">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTechModalOpen}
            color="gray.600"
            _hover={{ bg: 'gray.100' }}
          >
            ⚙️ Läs mer om tekniken
          </Button>
        </HStack>
      </VStack>
      
      {/* Real-time monitoring dashboard */}
      <MonitoringDashboard />
      
      {/* Technical Information Modal */}
      <Modal isOpen={isTechModalOpen} onClose={onTechModalClose} size="md" isCentered>
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent mx={4} maxW="500px" borderRadius="lg" shadow="lg" border="2px solid" borderColor="blue.500">
          <ModalHeader pb={2}>
            <Text fontSize="xl" fontWeight="bold" color="blue.600">
              ⚙️ Teknisk Information
            </Text>
            <Text fontSize="sm" color="gray.600" fontWeight="normal">
              DigiNativa Runtime Engine - Tekniska Specifikationer
            </Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  🏗️ Arkitektur & Foundation
                </Heading>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">• <strong>Chakra UI</strong> - Modern React component library</Text>
                  <Text fontSize="sm">• <strong>TypeScript</strong> - Type-safe utveckling</Text>
                  <Text fontSize="sm">• <strong>Vite</strong> - Snabb build och utvecklingsserver</Text>
                  <Text fontSize="sm">• <strong>Custom game scenes</strong> - Modulär spelarkitektur</Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  🎨 Design & Användarupplevelse
                </Heading>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">• <strong>Multi-tenant theming</strong> - Kommunspecifika teman</Text>
                  <Text fontSize="sm">• <strong>WCAG 2.1 AA compliance</strong> - Tillgänglighetsstandard</Text>
                  <Text fontSize="sm">• <strong>Mobile-first design</strong> - Optimerat för Anna Svensson (iPhone 12)</Text>
                  <Text fontSize="sm">• <strong>Responsive layout</strong> - Fungerar på alla enheter</Text>
                </VStack>
              </Box>

              <Box>
                <Heading size="sm" mb={3} color="gray.700">
                  📊 Monitoring & Analytics
                </Heading>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">• <strong>Real-time monitoring</strong> - Live prestandaövervakning</Text>
                  <Text fontSize="sm">• <strong>Error tracking</strong> - Automatisk felrapportering</Text>
                  <Text fontSize="sm">• <strong>Performance analytics</strong> - Detaljerad användaranalys</Text>
                  <Text fontSize="sm">• <strong>Session tracking</strong> - 7-minuters optimering för Anna</Text>
                </VStack>
              </Box>

              <Box bg="blue.50" p={4} borderRadius="md" border="1px" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800">
                  <strong>🔒 Säkerhet & GDPR:</strong> Alla användardata behandlas enligt GDPR. 
                  Spelsessioner lagras lokalt och skickas endast anonymiserat för prestandaanalys.
                </Text>
              </Box>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;