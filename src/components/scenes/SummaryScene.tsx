import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  HStack,
  Text, 
  Button, 
  Card,
  CardBody,
  Progress,
  Badge,
  Alert,
  SimpleGrid,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import type { SummaryScene as SummarySceneType } from '../../types/game-manifest';
import { CheckIcon, StarIcon, ClockIcon, CertificateIcon } from '../icons/GameIcons';

interface SummarySceneProps {
  scene: SummarySceneType;
  onComplete: (results: any) => void;
  analytics?: {
    trackEvent: (eventType: string, data: any) => void;
  };
}

export const SummaryScene: React.FC<SummarySceneProps> = ({
  scene,
  onComplete,
  analytics,
}) => {
  const [showContent, setShowContent] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  // Game Designer spec: Celebration animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setAnimationStep(1), 800);
    const timer3 = setTimeout(() => setAnimationStep(2), 1500);
    const timer4 = setTimeout(() => setAnimationStep(3), 2200);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Mock game completion data - in real implementation from game state
  const gameData = {
    totalScore: 147,
    maxPossibleScore: 160,
    percentageScore: 92,
    totalTime: '6 min 45 sek',
    scenesCompleted: 5,
    totalScenes: 5,
    achievements: [
      { id: 'perfect_score', name: 'Expert', description: 'Över 90% totalt', earned: true },
      { id: 'speed_demon', name: 'Effektiv', description: 'Under 7 minuter', earned: true },
      { id: 'no_mistakes', name: 'Felfri', description: 'Inga fel svar', earned: false }
    ],
    keyLearnings: [
      'GDPR personuppgifter och rättigheter',
      'Datahantering och säkerhet',
      'Anmälningsplikt vid incidenter',
      'Användarrättigheter och samtycke'
    ],
    nextSteps: [
      'Implementera GDPR-rutiner på din arbetsplats',
      'Informera kollegor om viktiga punkter',
      'Kontakta IT-avdelningen vid frågor'
    ],
    certificateEarned: true
  };

  const handleComplete = () => {
    analytics?.trackEvent('game_summary_complete', {
      sceneId: scene.id,
      totalScore: gameData.totalScore,
      percentageScore: gameData.percentageScore,
      timeSpent: gameData.totalTime,
      achievementsEarned: gameData.achievements.filter(a => a.earned).length
    });

    onComplete({ 
      gameCompleted: true,
      finalScore: gameData.totalScore,
      maxScore: gameData.maxPossibleScore,
      timeSpent: gameData.totalTime,
      certificateEarned: gameData.certificateEarned
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'blue';
    if (percentage >= 70) return 'yellow';
    return 'red';
  };

  return (
    <Box p={4} maxW="600px" mx="auto" minH="100vh" bg="gray.50">
      {/* Celebration Header */}
      <VStack 
        gap={6} 
        mb={8} 
        textAlign="center"
        transform={showContent ? 'translateY(0)' : 'translateY(-20px)'}
        opacity={showContent ? 1 : 0}
        transition="all 0.8s ease-out"
      >
        <Box 
          fontSize="4xl"
          transform={animationStep >= 1 ? 'scale(1)' : 'scale(0.8)'}
          transition="all 0.6s ease-out"
        >
          🎉
        </Box>
        
        <Text 
          fontSize="2xl" 
          fontWeight="bold" 
          color="green.600"
          transform={animationStep >= 1 ? 'translateY(0)' : 'translateY(10px)'}
          opacity={animationStep >= 1 ? 1 : 0}
          transition="all 0.6s ease-out 0.2s"
        >
          {scene.title || 'Fantastiskt arbete, Anna!'}
        </Text>
        
        {scene.message && (
          <Text 
            fontSize="lg" 
            color="gray.600"
            maxW="400px"
            transform={animationStep >= 1 ? 'translateY(0)' : 'translateY(10px)'}
            opacity={animationStep >= 1 ? 1 : 0}
            transition="all 0.6s ease-out 0.4s"
          >
            {scene.message}
          </Text>
        )}
      </VStack>

      {/* Overall Performance Card */}
      <Card 
        mb={6} 
        bg="white" 
        shadow="lg"
        transform={animationStep >= 2 ? 'translateY(0)' : 'translateY(20px)'}
        opacity={animationStep >= 2 ? 1 : 0}
        transition="all 0.6s ease-out"
      >
        <CardBody p={6}>
          <VStack gap={6}>
            <Text fontSize="xl" fontWeight="bold" color="gray.800">
              Ditt Slutresultat
            </Text>
            
            {/* Score Circle */}
            <Box position="relative">
              <Progress
                value={gameData.percentageScore}
                size="xl"
                colorScheme={getScoreColor(gameData.percentageScore)}
                borderRadius="full"
                bg="gray.200"
                w="120px"
                h="120px"
                sx={{
                  '& > div': {
                    borderRadius: 'full',
                    transition: 'all 1.5s ease-out 0.5s'
                  }
                }}
              />
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                textAlign="center"
              >
                <Text 
                  fontSize="2xl" 
                  fontWeight="bold" 
                  color={`\${getScoreColor(gameData.percentageScore)}.700`}
                >
                  {gameData.percentageScore}%
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {gameData.totalScore}/{gameData.maxPossibleScore}
                </Text>
              </Box>
            </Box>
            
            {/* Quick Stats */}
            <SimpleGrid columns={3} gap={6} w="100%">
              <Stat textAlign="center">
                <StatLabel color="gray.600">Tid</StatLabel>
                <StatNumber fontSize="md" color="blue.600">
                  <HStack justify="center">
                    <ClockIcon w="16px" h="16px" />
                    <Text>{gameData.totalTime}</Text>
                  </HStack>
                </StatNumber>
              </Stat>
              
              <Stat textAlign="center">
                <StatLabel color="gray.600">Avklarat</StatLabel>
                <StatNumber fontSize="md" color="green.600">
                  <HStack justify="center">
                    <CheckIcon w="16px" h="16px" />
                    <Text>{gameData.scenesCompleted}/{gameData.totalScenes}</Text>
                  </HStack>
                </StatNumber>
              </Stat>
              
              <Stat textAlign="center">
                <StatLabel color="gray.600">Utmärkelser</StatLabel>
                <StatNumber fontSize="md" color="yellow.600">
                  <HStack justify="center">
                    <StarIcon w="16px" h="16px" />
                    <Text>{gameData.achievements.filter(a => a.earned).length}</Text>
                  </HStack>
                </StatNumber>
              </Stat>
            </SimpleGrid>
          </VStack>
        </CardBody>
      </Card>

      {/* Achievements */}
      {gameData.achievements.some(a => a.earned) && (
        <Card 
          mb={6} 
          bg="white" 
          shadow="lg"
          transform={animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)'}
          opacity={animationStep >= 3 ? 1 : 0}
          transition="all 0.6s ease-out 0.3s"
        >
          <CardBody p={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
              Erhållna Utmärkelser
            </Text>
            <VStack gap={3}>
              {gameData.achievements.filter(a => a.earned).map((achievement) => (
                <Card key={achievement.id} bg="yellow.50" border="1px solid" borderColor="yellow.200" w="100%">
                  <CardBody p={4}>
                    <HStack gap={3}>
                      <StarIcon color="yellow.500" flexShrink={0} />
                      <Box>
                        <Text fontWeight="bold" color="yellow.800">
                          {achievement.name}
                        </Text>
                        <Text fontSize="sm" color="yellow.600">
                          {achievement.description}
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Key Learnings Summary */}
      <Card 
        mb={6} 
        bg="white" 
        shadow="lg"
        transform={animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)'}
        opacity={animationStep >= 3 ? 1 : 0}
        transition="all 0.6s ease-out 0.6s"
      >
        <CardBody p={6}>
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
            Viktiga Lärdomar
          </Text>
          <VStack gap={3} align="stretch">
            {gameData.keyLearnings.map((learning, index) => (
              <HStack key={index} gap={3} p={3} bg="blue.50" borderRadius="lg">
                <CheckIcon color="blue.500" flexShrink={0} />
                <Text fontSize="sm" color="blue.700">
                  {learning}
                </Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Next Steps */}
      <Card 
        mb={6} 
        bg="white" 
        shadow="lg"
        transform={animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)'}
        opacity={animationStep >= 3 ? 1 : 0}
        transition="all 0.6s ease-out 0.9s"
      >
        <CardBody p={6}>
          <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
            Nästa Steg
          </Text>
          <VStack gap={3} align="stretch">
            {gameData.nextSteps.map((step, index) => (
              <HStack key={index} gap={3} p={3} bg="green.50" borderRadius="lg">
                <Box 
                  bg="green.500" 
                  color="white" 
                  borderRadius="full" 
                  w="24px" 
                  h="24px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center" 
                  fontSize="sm" 
                  fontWeight="bold"
                  flexShrink={0}
                >
                  {index + 1}
                </Box>
                <Text fontSize="sm" color="green.700">
                  {step}
                </Text>
              </HStack>
            ))}
          </VStack>
        </CardBody>
      </Card>

      {/* Certificate Notice */}
      {gameData.certificateEarned && (
        <Alert 
          status="success" 
          borderRadius="xl"
          bg="blue.600"
          color="white"
          border="none"
          mb={6}
          transform={animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)'}
          opacity={animationStep >= 3 ? 1 : 0}
          transition="all 0.8s ease-out 1.2s"
        >
          <CertificateIcon color="white" />
          <Box ml={3}>
            <Text fontWeight="bold" fontSize="md">
              Certifikat Erhållet! 🏆
            </Text>
            <Text fontSize="sm" opacity={0.9}>
              Ditt certifikat har skickats till din e-post och är tillgängligt i ditt användarkonto.
            </Text>
          </Box>
        </Alert>
      )}

      {/* Action Buttons */}
      <VStack gap={4} mt={8}>
        <Button
          onClick={handleComplete}
          colorScheme="green"
          size="lg"
          w="100%"
          minH="56px"
          fontSize="lg"
          fontWeight="bold"
          borderRadius="xl"
          leftIcon={<CheckIcon />}
          _hover={{
            transform: 'translateY(-2px)',
            shadow: 'lg',
          }}
          _active={{
            transform: 'translateY(0)',
          }}
          transition="all 0.2s"
        >
          Avsluta Kursen
        </Button>
        
        {/* Additional Actions */}
        <HStack gap={3} w="100%">
          <Button
            variant="outline"
            colorScheme="blue"
            size="md"
            flex="1"
            minH="48px"
            borderRadius="lg"
            onClick={() => {
              analytics?.trackEvent('summary_share_results', {
                sceneId: scene.id,
                score: gameData.percentageScore
              });
            }}
          >
            📊 Dela Resultat
          </Button>
          
          <Button
            variant="outline"
            colorScheme="blue"
            size="md"
            flex="1"
            minH="48px"
            borderRadius="lg"
            onClick={() => {
              analytics?.trackEvent('summary_view_certificate', {
                sceneId: scene.id
              });
            }}
          >
            📜 Visa Certifikat
          </Button>
        </HStack>
      </VStack>

      {/* Footer */}
      <Box mt={8} pt={6} borderTop="1px solid" borderColor="gray.200">
        <VStack gap={2}>
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Tack för att du genomförde denna utbildning!
          </Text>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            DigiNativa Runtime Engine • {new Date().toLocaleDateString('sv-SE')}
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};