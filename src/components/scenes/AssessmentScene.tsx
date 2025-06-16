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
  Circle,
  SimpleGrid,
  Divider
} from '@chakra-ui/react';
import type { AssessmentScene as AssessmentSceneType } from '../../types/game-manifest';
import { CheckIcon, StarIcon, CertificateIcon } from '../icons/GameIcons';

interface AssessmentSceneProps {
  scene: AssessmentSceneType;
  onComplete: (results: any) => void;
  analytics?: {
    trackEvent: (eventType: string, data: any) => void;
  };
}

export const AssessmentScene: React.FC<AssessmentSceneProps> = ({
  scene,
  onComplete,
  analytics,
}) => {
  const [animationStep, setAnimationStep] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  // Game Designer spec: Progressive reveal of results
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationStep(1), 500);
    const timer2 = setTimeout(() => setAnimationStep(2), 1500);
    const timer3 = setTimeout(() => setAnimationStep(3), 2500);
    const timer4 = setTimeout(() => setShowCertificate(true), 3500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, []);

  // Mock assessment data - in real implementation this comes from game state
  const assessmentData = {
    score: 85,
    maxScore: 100,
    percentageScore: 85,
    passThreshold: 80,
    achievements: [
      { id: 'first_try', name: 'Första försöket', description: 'Klarade på första försöket', icon: 'star' },
      { id: 'perfect_quiz', name: 'Quiz-mästare', description: 'Alla quizfrågor rätt', icon: 'check' },
      { id: 'fast_learner', name: 'Snabb elev', description: 'Slutförde under 5 minuter', icon: 'certificate' }
    ],
    categoryScores: [
      { category: 'GDPR Grundläggande', score: 90, maxScore: 100 },
      { category: 'Datahantering', score: 85, maxScore: 100 },
      { category: 'Användarrättigheter', score: 80, maxScore: 100 }
    ],
    timeSpent: '4 min 23 sek',
    passed: true
  };

  const handleContinue = () => {
    analytics?.trackEvent('assessment_complete', {
      sceneId: scene.id,
      score: assessmentData.score,
      passed: assessmentData.passed,
      timeSpent: assessmentData.timeSpent,
      achievements: assessmentData.achievements.map(a => a.id)
    });

    onComplete({
      nextScene: scene.navigation?.next,
      score: assessmentData.score,
      maxScore: assessmentData.maxScore,
      passed: assessmentData.passed,
      achievements: assessmentData.achievements,
      assessment: assessmentData
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'blue';
    if (percentage >= 70) return 'yellow';
    return 'red';
  };

  const getAchievementIcon = (iconType: string) => {
    switch (iconType) {
      case 'star': return <StarIcon color="yellow.500" />;
      case 'check': return <CheckIcon color="green.500" />;
      case 'certificate': return <CertificateIcon color="blue.500" />;
      default: return <CheckIcon />;
    }
  };

  return (
    <Box p={4} maxW="600px" mx="auto" minH="100vh" bg="gray.50">
      {/* Header */}
      <VStack gap={6} mb={8}>
        <Text 
          fontSize="2xl" 
          fontWeight="bold" 
          textAlign="center"
          color="gray.800"
        >
          {scene.title || 'Utvärdering Slutförd'}
        </Text>
        
        {scene.description && (
          <Text 
            fontSize="md" 
            textAlign="center"
            color="gray.600"
            maxW="400px"
          >
            {scene.description}
          </Text>
        )}
      </VStack>

      {/* Main Score Display - Game Designer spec: Circular progress */}
      <Card mb={6} bg="white" shadow="lg">
        <CardBody p={8}>
          <VStack gap={6}>
            {/* Circular Score Progress */}
            <Box position="relative" width="160px" height="160px">
              <Circle
                size="160px"
                bg={`\${getScoreColor(assessmentData.percentageScore)}.50`}
                border="8px solid"
                borderColor={`\${getScoreColor(assessmentData.percentageScore)}.500`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
                transform={animationStep >= 1 ? 'scale(1)' : 'scale(0.8)'}
                opacity={animationStep >= 1 ? 1 : 0}
                transition="all 0.6s ease-out"
              >
                <Text 
                  fontSize="3xl" 
                  fontWeight="bold" 
                  color={`\${getScoreColor(assessmentData.percentageScore)}.700`}
                >
                  {assessmentData.percentageScore}%
                </Text>
                <Text fontSize="sm" color="gray.600" fontWeight="medium">
                  {assessmentData.score}/{assessmentData.maxScore} poäng
                </Text>
              </Circle>
              
              {/* Progress ring animation */}
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                borderRadius="full"
              >
                <Progress
                  value={animationStep >= 1 ? assessmentData.percentageScore : 0}
                  size="lg"
                  colorScheme={getScoreColor(assessmentData.percentageScore)}
                  bg="transparent"
                  sx={{
                    '& > div': {
                      borderRadius: 'full',
                      transition: 'all 1.5s ease-out'
                    }
                  }}
                />
              </Box>
            </Box>
            
            {/* Pass/Fail Status */}
            <Alert 
              status={assessmentData.passed ? 'success' : 'error'}
              borderRadius="xl"
              bg={assessmentData.passed ? 'green.50' : 'red.50'}
              border="2px solid"
              borderColor={assessmentData.passed ? 'green.200' : 'red.200'}
              opacity={animationStep >= 2 ? 1 : 0}
              transform={animationStep >= 2 ? 'translateY(0)' : 'translateY(20px)'}
              transition="all 0.6s ease-out"
            >
              <Box ml={3}>
                <Text fontWeight="bold" fontSize="lg">
                  {assessmentData.passed 
                    ? '🎉 Grattis! Du har klarat kursen'
                    : '📚 Kursen inte slutförd'}
                </Text>
                <Text fontSize="sm" mt={1}>
                  {assessmentData.passed 
                    ? `Du fick ${assessmentData.percentageScore}% (krävs ${scene.passThreshold || 80}%)`
                    : `Du behöver ${scene.passThreshold || 80}% för att klara (du fick ${assessmentData.percentageScore}%)`}
                </Text>
              </Box>
            </Alert>
          </VStack>
        </CardBody>
      </Card>

      {/* Category Breakdown */}
      {assessmentData.categoryScores.length > 0 && (
        <Card mb={6} bg="white" shadow="lg"
          opacity={animationStep >= 2 ? 1 : 0}
          transform={animationStep >= 2 ? 'translateY(0)' : 'translateY(20px)'}
          transition="all 0.6s ease-out 0.3s"
        >
          <CardBody p={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
              Resultat per område
            </Text>
            <VStack gap={4}>
              {assessmentData.categoryScores.map((category, index) => {
                const percentage = Math.round((category.score / category.maxScore) * 100);
                return (
                  <Box key={index} w="100%">
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="md" fontWeight="medium" color="gray.700">
                        {category.category}
                      </Text>
                      <Badge 
                        colorScheme={getScoreColor(percentage)}
                        fontSize="sm"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {percentage}%
                      </Badge>
                    </HStack>
                    <Progress 
                      value={percentage} 
                      colorScheme={getScoreColor(percentage)}
                      size="md"
                      borderRadius="full"
                      bg="gray.200"
                    />
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Achievements - Game Designer spec: Municipal appropriate celebration */}
      {assessmentData.achievements.length > 0 && (
        <Card mb={6} bg="white" shadow="lg"
          opacity={animationStep >= 3 ? 1 : 0}
          transform={animationStep >= 3 ? 'translateY(0)' : 'translateY(20px)'}
          transition="all 0.6s ease-out 0.6s"
        >
          <CardBody p={6}>
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.800">
              Uppnådda mål
            </Text>
            <SimpleGrid columns={1} gap={3}>
              {assessmentData.achievements.map((achievement, index) => (
                <Card key={achievement.id} bg="blue.50" border="1px solid" borderColor="blue.200">
                  <CardBody p={4}>
                    <HStack gap={3}>
                      <Box flexShrink={0}>
                        {getAchievementIcon(achievement.icon)}
                      </Box>
                      <Box>
                        <Text fontWeight="bold" color="blue.800">
                          {achievement.name}
                        </Text>
                        <Text fontSize="sm" color="blue.600">
                          {achievement.description}
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Certificate Section - Game Designer spec: Municipal certification */}
      {showCertificate && assessmentData.passed && (
        <Card mb={6} bg="gradient-to-r from-blue.500 to-blue.600" color="white" shadow="xl"
          opacity={showCertificate ? 1 : 0}
          transform={showCertificate ? 'translateY(0)' : 'translateY(20px)'}
          transition="all 0.8s ease-out"
        >
          <CardBody p={8} textAlign="center">
            <VStack gap={4}>
              <CertificateIcon w="48px" h="48px" color="white" />
              <Text fontSize="xl" fontWeight="bold">
                Certifiering Erhållen
              </Text>
              <Text fontSize="md" opacity={0.9}>
                Du har framgångsrikt slutfört {scene.title || 'denna kurs'} och uppfyller 
                kraven för certifiering inom {scene.certificationArea || 'detta område'}.
              </Text>
              <Divider borderColor="blue.300" />
              <VStack gap={2}>
                <Text fontSize="sm" opacity={0.8}>
                  Certifiering giltig till: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE')}
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Slutförd på: {assessmentData.timeSpent}
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Action Buttons - Game Designer spec: 56px touch targets */}
      <VStack gap={4} mt={8}>
        {assessmentData.passed ? (
          <Button
            onClick={handleContinue}
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
            Fortsätt till nästa steg
          </Button>
        ) : (
          <VStack gap={3} w="100%">
            <Button
              onClick={() => {
                // In real implementation, restart the assessment
                onComplete({ restart: true });
              }}
              colorScheme="blue"
              size="lg"
              w="100%"
              minH="56px"
              fontSize="lg"
              fontWeight="bold"
              borderRadius="xl"
            >
              Försök igen
            </Button>
            <Button
              onClick={handleContinue}
              variant="outline"
              colorScheme="gray"
              size="lg"
              w="100%"
              minH="56px"
              fontSize="md"
              borderRadius="xl"
            >
              Avsluta ändå
            </Button>
          </VStack>
        )}
        
        {/* Supervisor sharing - Game Designer spec */}
        {assessmentData.passed && showCertificate && (
          <Button
            variant="outline"
            colorScheme="blue"
            size="md"
            w="100%"
            minH="48px"
            fontSize="sm"
            borderRadius="lg"
            onClick={() => {
              analytics?.trackEvent('certificate_share', {
                sceneId: scene.id,
                score: assessmentData.score
              });
              // In real implementation, open sharing dialog
            }}
          >
            📧 Dela resultat med chef
          </Button>
        )}
      </VStack>

      {/* Meta Information */}
      <Box mt={8} pt={6} borderTop="1px solid" borderColor="gray.200">
        <HStack justify="space-between" fontSize="sm" color="gray.500">
          <Text>Slutförd: {new Date().toLocaleDateString('sv-SE')}</Text>
          <Text>Tid: {assessmentData.timeSpent}</Text>
        </HStack>
      </Box>
    </Box>
  );
};