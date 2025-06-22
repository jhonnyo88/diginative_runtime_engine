import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Icon,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiBarChart3,
  FiTarget,
  FiGlobe,
  FiSend,
  FiEdit3,
  FiEye,
  FiDownload,
  FiShare2,
  FiMessageSquare,
  FiVideo,
  FiCheckCircle,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

import { useCulturalTheme } from './CulturalThemeProvider';

const MotionBox = motion(Box);
const MotionCard = motion(Card);

// Stakeholder Management System
interface Stakeholder {
  id: string;
  name: string;
  title: string;
  organization: string;
  role: 'executive' | 'hr_director' | 'technical_leader' | 'budget_committee' | 'citizen_representative';
  influence: 'high' | 'medium' | 'low';
  support: 'champion' | 'supporter' | 'neutral' | 'skeptic' | 'blocker';
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
  communicationPreference: 'formal' | 'collaborative' | 'data_driven' | 'personal';
  lastContact: string;
  engagementScore: number;
  primaryConcerns: string[];
  successMetrics: string[];
  preferredChannels: ('email' | 'meeting' | 'presentation' | 'phone' | 'document')[];
}

// Communication Templates
interface CommunicationTemplate {
  id: string;
  name: string;
  stakeholderRole: string;
  culturalContext: string;
  type: 'email' | 'presentation' | 'report' | 'proposal' | 'update';
  subject: string;
  content: string;
  tone: 'formal' | 'collaborative' | 'technical' | 'executive';
  keyMessages: string[];
  callToAction: string;
  successFactors: string[];
}

// Sample Stakeholder Data
const stakeholders: Stakeholder[] = [
  {
    id: 'anna_svensson_executive',
    name: 'Anna Svensson',
    title: 'Kommunstyrelseordförande',
    organization: 'Stockholm Stad',
    role: 'executive',
    influence: 'high',
    support: 'champion',
    culturalContext: 'swedish',
    communicationPreference: 'collaborative',
    lastContact: '2024-12-18',
    engagementScore: 94,
    primaryConcerns: ['Budget efficiency', 'Digital transformation progress', 'Employee development'],
    successMetrics: ['Cost reduction', 'Service improvement', 'Staff satisfaction'],
    preferredChannels: ['presentation', 'meeting', 'email']
  },
  {
    id: 'klaus_mueller_technical',
    name: 'Klaus Mueller',
    title: 'IT-Direktor',
    organization: 'Stadt München',
    role: 'technical_leader',
    influence: 'high',
    support: 'supporter',
    culturalContext: 'german',
    communicationPreference: 'data_driven',
    lastContact: '2024-12-20',
    engagementScore: 87,
    primaryConcerns: ['Technical integration', 'Security compliance', 'Performance metrics'],
    successMetrics: ['System reliability', 'Security scores', 'User adoption'],
    preferredChannels: ['document', 'presentation', 'email']
  },
  {
    id: 'marie_dubois_hr',
    name: 'Marie Dubois',
    title: 'Directrice des Ressources Humaines',
    organization: 'Ville de Paris',
    role: 'hr_director',
    influence: 'medium',
    support: 'neutral',
    culturalContext: 'french',
    communicationPreference: 'formal',
    lastContact: '2024-12-15',
    engagementScore: 73,
    primaryConcerns: ['Professional development quality', 'Employee engagement', 'Training effectiveness'],
    successMetrics: ['Skills advancement', 'Employee satisfaction', 'Career progression'],
    preferredChannels: ['email', 'document', 'meeting']
  },
  {
    id: 'pieter_van_berg_budget',
    name: 'Pieter van Berg',
    title: 'Wethouder Financiën',
    organization: 'Gemeente Amsterdam',
    role: 'budget_committee',
    influence: 'high',
    support: 'skeptic',
    culturalContext: 'dutch',
    communicationPreference: 'data_driven',
    lastContact: '2024-12-22',
    engagementScore: 68,
    primaryConcerns: ['ROI demonstration', 'Cost justification', 'Budget allocation'],
    successMetrics: ['Cost savings', 'Efficiency gains', 'Revenue generation'],
    preferredChannels: ['presentation', 'document', 'phone']
  }
];

// Cultural Communication Templates
const communicationTemplates: CommunicationTemplate[] = [
  {
    id: 'swedish_executive_update',
    name: 'Swedish Executive Consensus Update',
    stakeholderRole: 'executive',
    culturalContext: 'swedish',
    type: 'email',
    subject: 'DigiNativa Progress Update - Collaborative Municipal Excellence',
    content: `Hej {name},

Jag ville dela våra senaste framsteg med DigiNativa municipal professional development platform och få dina tankar.

**Framsteg Denna Månad:**
- 320% ökning av medarbetarengagemang i professional development
- 18% förbättring av service quality genom enhanced training
- 96% kulturell anpassningsframgång across European contexts

**Nästa Steg för Diskussion:**
Vi skulle uppskatta dina synpunkter på implementation strategy för Q1 2025. Lagom approach som alltid - vi vill säkerställa att alla stakeholders känner sig included i processen.

Kan vi boka ett collaborative meeting för att diskutera European expansion opportunities och hur det alignar med Stockholm Stads digital strategy?

Vänliga hälsningar och tack för ditt continued support,
DigiNativa Team`,
    tone: 'collaborative',
    keyMessages: ['Consensus building', 'Collaborative approach', 'Shared success'],
    callToAction: 'Book collaborative meeting to discuss European expansion',
    successFactors: ['Inclusive language', 'Lagom balance', 'Consensus seeking']
  },
  {
    id: 'german_technical_report',
    name: 'German Technical Systematic Analysis',
    stakeholderRole: 'technical_leader',
    culturalContext: 'german',
    type: 'report',
    subject: 'DigiNativa Technical Implementation Analysis - Systematic Evaluation',
    content: `Sehr geehrter Herr {name},

Hiermit übermitteln wir den detaillierten technischen Implementierungsbericht för DigiNativa municipal professional development platform.

**Systematische Analyseergebnisse:**

1. **Technische Leistung:**
   - Server Response Time: <600ms (Target: <2s) ✓
   - System Uptime: 99.97% ✓
   - Security Compliance: ISO 27001, GDPR full compliance ✓

2. **Integration Analysis:**
   - Existing IT Infrastructure Compatibility: 98%
   - API Integration Points: 47 validated endpoints
   - Data Migration Strategy: Zero-downtime approach

3. **Performance Metrics:**
   - User Adoption Rate: 89% within first month
   - Technical Support Tickets: 78% reduction
   - System Efficiency: 34% improvement over legacy systems

**Systematische Empfehlungen:**
Basierend auf unserer methodischen Analyse empfehlen wir die schrittweise Implementation enligt attached deployment schedule.

Vollständige technische Dokumentation und detaillierte Projektpläne sind attached för Ihre thoroughly review.

Mit freundlichen Grüßen,
DigiNativa Technical Team`,
    tone: 'technical',
    keyMessages: ['Systematic analysis', 'Detailed documentation', 'Methodical approach'],
    callToAction: 'Review technical documentation and approve systematic implementation plan',
    successFactors: ['Thorough documentation', 'Systematic approach', 'Detailed analysis']
  },
  {
    id: 'french_hr_proposal',
    name: 'French HR Excellence Proposal',
    stakeholderRole: 'hr_director',
    culturalContext: 'french',
    type: 'proposal',
    subject: 'Proposition DigiNativa - Excellence en Développement Professionnel',
    content: `Madame {name},

Nous avons l\'honneur de vous présenter notre proposition d\'excellence för professional development transformation through DigiNativa platform.

**Excellence Professionnelle Framework:**

Notre approche sophisticated combine l\'intelligence culturelle européenne avec les standards français de service public excellence:

• **Développement Professionnel Sophistiqué:** 5-level competency progression aligned avec French professional qualification standards
• **Intelligence Culturelle Raffinée:** Adaptation élégante across European municipal contexts
• **Excellence de Service Public:** Integration parfaite avec les valeurs françaises de service public

**Bénéfices Stratégiques:**
- Enhancement significatif de professional competency (320% engagement increase)
- Amélioration de service quality (18% improvement demonstrated)
- Reconnaissance européenne för French municipal excellence leadership

Cette proposition représente une opportunité exceptionnelle för positioning French municipal services som European leaders in professional development excellence.

Nous sollicitons l\'honneur d\'une présentation détaillée för discussing cette initiative stratégique.

Cordialement et avec nos salutations distinguées,
L\'Équipe DigiNativa`,
    tone: 'formal',
    keyMessages: ['Service public excellence', 'Sophisticated approach', 'Strategic positioning'],
    callToAction: 'Request formal presentation to discuss strategic initiative',
    successFactors: ['Formal language', 'Sophisticated presentation', 'Service public values']
  },
  {
    id: 'dutch_budget_analysis',
    name: 'Dutch Budget Direct ROI Analysis',
    stakeholderRole: 'budget_committee',
    culturalContext: 'dutch',
    type: 'presentation',
    subject: 'DigiNativa ROI Analysis - Direct Financial Benefits',
    content: `Beste {name},

Direct to the point: DigiNativa delivers measurable financial benefits för municipal budget optimization.

**Direct Financial Impact:**

ROI Calculation (12 months):
• Investment: €180,000 total implementation
• Savings: €324,000 through efficiency gains
• Net ROI: 180% return on investment

**Practical Benefits:**
1. Staff Training Efficiency: 67% reduction in training time
2. Service Quality Improvement: 18% increase = reduced complaints/costs
3. Employee Retention: 34% improvement = reduced recruitment costs

**No-Nonsense Implementation:**
- Month 1-2: Setup och training (immediate productivity gains)
- Month 3-6: Full deployment (efficiency benefits begin)
- Month 6-12: Optimization (maximum ROI achievement)

**Bottom Line:**
€324,000 annual savings through proven professional development efficiency. 
Clear payback in 7 months. Practical, measurable, direct.

Want the detailed financial breakdown? Let\'s discuss practical implementation steps.

Vriendelijke groet,
DigiNativa Finance Team`,
    tone: 'executive',
    keyMessages: ['Direct benefits', 'Clear ROI', 'Practical implementation'],
    callToAction: 'Discuss practical implementation steps and detailed financial breakdown',
    successFactors: ['Direct communication', 'Clear numbers', 'Practical focus']
  }
];

// Stakeholder Role Colors
const roleColors = {
  executive: { bg: 'purple.50', border: 'purple.200', color: 'purple.700' },
  hr_director: { bg: 'green.50', border: 'green.200', color: 'green.700' },
  technical_leader: { bg: 'blue.50', border: 'blue.200', color: 'blue.700' },
  budget_committee: { bg: 'orange.50', border: 'orange.200', color: 'orange.700' },
  citizen_representative: { bg: 'gray.50', border: 'gray.200', color: 'gray.700' }
};

// Support Level Colors
const supportColors = {
  champion: 'green',
  supporter: 'blue',
  neutral: 'yellow',
  skeptic: 'orange',
  blocker: 'red'
};

// Stakeholder Card Component
interface StakeholderCardProps {
  stakeholder: Stakeholder;
  onSelect?: (stakeholder: Stakeholder) => void;
}

const StakeholderCard: React.FC<StakeholderCardProps> = ({ stakeholder, onSelect = () => {} }) => {
  const roleColor = roleColors[stakeholder.role];
  const supportColor = supportColors[stakeholder.support];

  return (
    <MotionCard
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      cursor="pointer"
      onClick={() => onSelect(stakeholder)}
      bg={roleColor.bg}
      borderColor={roleColor.border}
      borderWidth="2px"
      transition="all 0.3s ease"
      _hover={{
        boxShadow: `0 8px 25px ${roleColor.border}60`
      }}
    >
      <CardBody p={5}>
        <VStack spacing={4} align="stretch">
          
          {/* Stakeholder Header */}
          <HStack justify="space-between">
            <VStack align="start" spacing={1}>
              <Text fontSize="lg" fontWeight="700" color={roleColor.color}>
                {stakeholder.name}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {stakeholder.title}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {stakeholder.organization}
              </Text>
            </VStack>
            
            <VStack align="end" spacing={1}>
              <Badge colorScheme={supportColor} variant="solid">
                {stakeholder.support}
              </Badge>
              <Badge colorScheme="gray" variant="outline" fontSize="xs">
                {stakeholder.culturalContext}
              </Badge>
            </VStack>
          </HStack>

          {/* Engagement Score */}
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" fontWeight="600" color={roleColor.color}>
                Engagement Score:
              </Text>
              <Text fontSize="sm" fontWeight="700" color={roleColor.color}>
                {stakeholder.engagementScore}%
              </Text>
            </HStack>
            <Progress
              value={stakeholder.engagementScore}
              colorScheme={stakeholder.engagementScore >= 80 ? "green" : stakeholder.engagementScore >= 60 ? "yellow" : "red"}
              size="sm"
              borderRadius="full"
            />
          </Box>

          {/* Key Information */}
          <VStack spacing={2} align="stretch">
            <HStack spacing={2}>
              <Icon as={FiTarget} w={4} h={4} color={roleColor.color} />
              <Text fontSize="xs" color="gray.600">
                Influence: {stakeholder.influence} | {stakeholder.communicationPreference}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FiCalendar} w={4} h={4} color={roleColor.color} />
              <Text fontSize="xs" color="gray.600">
                Last Contact: {new Date(stakeholder.lastContact).toLocaleDateString()}
              </Text>
            </HStack>
          </VStack>

          {/* Primary Concerns Preview */}
          <Box>
            <Text fontSize="sm" fontWeight="600" color={roleColor.color} mb={1}>
              Primary Concerns:
            </Text>
            <Text fontSize="xs" color="gray.600" noOfLines={2}>
              {stakeholder.primaryConcerns.join(', ')}
            </Text>
          </Box>

        </VStack>
      </CardBody>
    </MotionCard>
  );
};

// Communication Template Component
interface CommunicationBuilderProps {
  stakeholder: Stakeholder;
  onSend?: (template: CommunicationTemplate) => void;
}

const CommunicationBuilder: React.FC<CommunicationBuilderProps> = ({ stakeholder, onSend = () => {} }) => {
  const { currentTheme } = useCulturalTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [customContent, setCustomContent] = useState('');

  // Filter templates by stakeholder role and cultural context
  const relevantTemplates = communicationTemplates.filter(
    template => 
      template.stakeholderRole === stakeholder.role && 
      template.culturalContext === stakeholder.culturalContext
  );

  const handleTemplateSelect = (template: CommunicationTemplate) => {
    setSelectedTemplate(template);
    setCustomContent(template.content.replace('{name}', stakeholder.name));
  };

  return (
    <VStack spacing={6} align="stretch">
      
      {/* Template Selection */}
      <Box>
        <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary} mb={3}>
          Cultural Communication Templates för {stakeholder.name}:
        </Text>
        <Grid templateColumns="1fr" gap={3}>
          {relevantTemplates.map((template) => (
            <Card
              key={template.id}
              cursor="pointer"
              onClick={() => handleTemplateSelect(template)}
              bg={selectedTemplate?.id === template.id ? currentTheme.colors.primary + '10' : "white"}
              borderColor={selectedTemplate?.id === template.id ? currentTheme.colors.primary : "gray.200"}
              borderWidth="2px"
              _hover={{ borderColor: currentTheme.colors.primary }}
            >
              <CardBody p={4}>
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" w="100%">
                    <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary}>
                      {template.name}
                    </Text>
                    <Badge colorScheme="blue" variant="outline">
                      {template.type}
                    </Badge>
                  </HStack>
                  <Text fontSize="xs" color="gray.600">
                    {template.subject}
                  </Text>
                  <HStack spacing={2}>
                    {template.keyMessages.slice(0, 3).map((message) => (
                      <Badge key={message} colorScheme="gray" variant="subtle" fontSize="xs">
                        {message}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Box>

      {/* Template Preview and Customization */}
      {selectedTemplate && (
        <Card bg="gray.50" borderColor="gray.200">
          <CardBody p={5}>
            <VStack spacing={4} align="stretch">
              
              <HStack justify="space-between">
                <Text fontSize="md" fontWeight="600" color={currentTheme.colors.primary}>
                  Communication Preview:
                </Text>
                <Badge colorScheme="green" variant="solid">
                  {selectedTemplate.culturalContext} Adapted
                </Badge>
              </HStack>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Subject:</FormLabel>
                <Input
                  value={selectedTemplate.subject}
                  readOnly
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">Content:</FormLabel>
                <Textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  minH="200px"
                  bg="white"
                  borderColor="gray.300"
                />
              </FormControl>

              <VStack spacing={3} align="stretch">
                <Text fontSize="sm" fontWeight="600" color={currentTheme.colors.primary}>
                  Success Factors för {stakeholder.culturalContext} Communication:
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                  {selectedTemplate.successFactors.map((factor) => (
                    <HStack key={factor} spacing={2}>
                      <Icon as={FiCheckCircle} w={3} h={3} color="green.500" />
                      <Text fontSize="xs" color="gray.600">
                        {factor}
                      </Text>
                    </HStack>
                  ))}
                </Grid>
              </VStack>

              <Button
                colorScheme="blue"
                size="md"
                leftIcon={<Icon as={FiSend} />}
                onClick={() => onSend(selectedTemplate)}
              >
                Send Cultural Communication
              </Button>

            </VStack>
          </CardBody>
        </Card>
      )}

    </VStack>
  );
};

// Stakeholder Detail Modal
interface StakeholderDetailModalProps {
  stakeholder: Stakeholder | null;
  isOpen: boolean;
  onClose: () => void;
}

const StakeholderDetailModal: React.FC<StakeholderDetailModalProps> = ({
  stakeholder,
  isOpen,
  onClose
}) => {
  if (!stakeholder) return null;

  const roleColor = roleColors[stakeholder.role];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent bg="white" borderRadius="xl" maxH="90vh" overflowY="auto">
        <ModalHeader bg={roleColor.bg} borderTopRadius="xl">
          <HStack spacing={3}>
            <Icon as={FiUsers} w={6} h={6} color={roleColor.color} />
            <VStack align="start" spacing={0}>
              <Text fontSize="xl" fontWeight="700" color={roleColor.color}>
                {stakeholder.name}
              </Text>
              <Text fontSize="md" color="gray.600">
                {stakeholder.title} | {stakeholder.organization}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody p={6}>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Overview</Tab>
              <Tab>Communication</Tab>
              <Tab>Engagement History</Tab>
              <Tab>Success Metrics</Tab>
            </TabList>

            <TabPanels>
              
              {/* Overview Tab */}
              <TabPanel p={0} pt={6}>
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  
                  {/* Stakeholder Profile */}
                  <Card>
                    <CardBody p={5}>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize="lg" fontWeight="700" color={roleColor.color}>
                          Stakeholder Profile
                        </Text>
                        
                        <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                          <Stat>
                            <StatLabel>Role</StatLabel>
                            <StatNumber fontSize="md">{stakeholder.role.replace('_', ' ')}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Influence</StatLabel>
                            <StatNumber fontSize="md">{stakeholder.influence}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Support Level</StatLabel>
                            <StatNumber fontSize="md">{stakeholder.support}</StatNumber>
                          </Stat>
                          <Stat>
                            <StatLabel>Cultural Context</StatLabel>
                            <StatNumber fontSize="md">{stakeholder.culturalContext}</StatNumber>
                          </Stat>
                        </Grid>

                        <Divider />

                        <VStack spacing={3} align="stretch">
                          <Text fontSize="md" fontWeight="600" color={roleColor.color}>
                            Communication Preferences:
                          </Text>
                          <Text fontSize="sm" color="gray.700">
                            Style: {stakeholder.communicationPreference}
                          </Text>
                          <HStack spacing={2} flexWrap="wrap">
                            {stakeholder.preferredChannels.map((channel) => (
                              <Badge key={channel} colorScheme="blue" variant="outline">
                                {channel}
                              </Badge>
                            ))}
                          </HStack>
                        </VStack>

                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Engagement Metrics */}
                  <Card>
                    <CardBody p={5}>
                      <VStack spacing={4} align="stretch">
                        <Text fontSize="lg" fontWeight="700" color={roleColor.color}>
                          Engagement Metrics
                        </Text>
                        
                        <Stat>
                          <StatLabel>Engagement Score</StatLabel>
                          <StatNumber>{stakeholder.engagementScore}%</StatNumber>
                          <StatHelpText>
                            <StatArrow type={stakeholder.engagementScore >= 70 ? 'increase' : 'decrease'} />
                            {stakeholder.engagementScore >= 70 ? 'Positive trend' : 'Needs attention'}
                          </StatHelpText>
                        </Stat>

                        <Progress
                          value={stakeholder.engagementScore}
                          colorScheme={stakeholder.engagementScore >= 80 ? "green" : stakeholder.engagementScore >= 60 ? "yellow" : "red"}
                          size="lg"
                          borderRadius="full"
                        />

                        <Text fontSize="sm" color="gray.600">
                          Last Contact: {new Date(stakeholder.lastContact).toLocaleDateString()}
                        </Text>

                      </VStack>
                    </CardBody>
                  </Card>

                </Grid>

                {/* Primary Concerns and Success Metrics */}
                <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={6}>
                  
                  <Card>
                    <CardBody p={5}>
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="md" fontWeight="600" color={roleColor.color}>
                          Primary Concerns:
                        </Text>
                        {stakeholder.primaryConcerns.map((concern, index) => (
                          <HStack key={index} spacing={2}>
                            <Icon as={FiAlertCircle} w={4} h={4} color="orange.500" />
                            <Text fontSize="sm" color="gray.700">
                              {concern}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardBody p={5}>
                      <VStack spacing={3} align="stretch">
                        <Text fontSize="md" fontWeight="600" color={roleColor.color}>
                          Success Metrics:
                        </Text>
                        {stakeholder.successMetrics.map((metric, index) => (
                          <HStack key={index} spacing={2}>
                            <Icon as={FiTarget} w={4} h={4} color="green.500" />
                            <Text fontSize="sm" color="gray.700">
                              {metric}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>
                    </CardBody>
                  </Card>

                </Grid>
              </TabPanel>

              {/* Communication Tab */}
              <TabPanel p={0} pt={6}>
                <CommunicationBuilder stakeholder={stakeholder} />
              </TabPanel>

              {/* Engagement History Tab */}
              <TabPanel p={0} pt={6}>
                <Text fontSize="md" color="gray.600">
                  Engagement history tracking would be implemented here with real-time data integration.
                </Text>
              </TabPanel>

              {/* Success Metrics Tab */}
              <TabPanel p={0} pt={6}>
                <Text fontSize="md" color="gray.600">
                  Detailed success metrics and ROI tracking would be implemented here.
                </Text>
              </TabPanel>

            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

// Main Enhanced Stakeholder Communication Component
interface EnhancedStakeholderCommunicationProps {
  onCommunicationSent?: (stakeholder: Stakeholder, template: CommunicationTemplate) => void;
}

export const EnhancedStakeholderCommunication: React.FC<EnhancedStakeholderCommunicationProps> = ({
  onCommunicationSent = () => console.log('Communication sent')
}) => {
  const { currentTheme } = useCulturalTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);

  const handleStakeholderSelect = (stakeholder: Stakeholder) => {
    setSelectedStakeholder(stakeholder);
    onOpen();
  };

  // Calculate stakeholder engagement statistics
  const avgEngagement = Math.round(stakeholders.reduce((sum, s) => sum + s.engagementScore, 0) / stakeholders.length);
  const highInfluenceStakeholders = stakeholders.filter(s => s.influence === 'high').length;
  const championStakeholders = stakeholders.filter(s => s.support === 'champion').length;

  return (
    <VStack spacing={8} align="stretch">
      
      {/* Enhanced Stakeholder Communication Overview */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card bg={currentTheme.colors.surface} borderColor={currentTheme.colors.primary + '30'}>
          <CardBody p={6}>
            <VStack spacing={6} align="stretch">
              
              <HStack justify="space-between">
                <HStack spacing={3}>
                  <Icon as={FiUsers} w={8} h={8} color={currentTheme.colors.primary} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="2xl" fontWeight="800" color={currentTheme.colors.primary}>
                      Enhanced Stakeholder Communication
                    </Text>
                    <Text fontSize="md" color="gray.600">
                      Cultural intelligence-driven stakeholder engagement framework
                    </Text>
                  </VStack>
                </HStack>
                
                <VStack align="end" spacing={1}>
                  <Badge colorScheme="blue" variant="solid" p={2} borderRadius="lg">
                    European Cultural Intelligence
                  </Badge>
                  <Text fontSize="xs" color="gray.600">
                    4-Market Adaptation
                  </Text>
                </VStack>
              </HStack>

              {/* Stakeholder Engagement Dashboard */}
              <Grid templateColumns="repeat(4, 1fr)" gap={6}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="blue.500">
                    {stakeholders.length}
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Active Stakeholders
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="green.500">
                    {avgEngagement}%
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Avg Engagement
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="purple.500">
                    {highInfluenceStakeholders}
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    High Influence
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="800" color="orange.500">
                    {championStakeholders}
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center">
                    Champions
                  </Text>
                </VStack>
              </Grid>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Stakeholder Directory */}
      <Box>
        <Text fontSize="lg" fontWeight="600" color="gray.700" mb={4}>
          European Municipal Stakeholder Directory:
        </Text>
        
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
          {stakeholders.map((stakeholder) => (
            <StakeholderCard
              key={stakeholder.id}
              stakeholder={stakeholder}
              onSelect={handleStakeholderSelect}
            />
          ))}
        </Grid>
      </Box>

      {/* Cultural Communication Excellence */}
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card bg="blue.50" borderColor="blue.200">
          <CardBody p={6}>
            <VStack spacing={4} align="stretch">
              
              <HStack spacing={3}>
                <Icon as={FiGlobe} w={6} h={6} color="blue.500" />
                <Text fontSize="lg" fontWeight="700" color="blue.700">
                  Cultural Communication Intelligence Framework
                </Text>
              </HStack>

              <Text fontSize="sm" color="blue.700" lineHeight="tall">
                Enhanced stakeholder communication framework with cultural intelligence adaptation för Swedish lagom consensus building, German systematic documentation, French sophisticated formality, och Dutch direct efficiency. Each communication template is culturally optimized för maximum stakeholder engagement and decision-making effectiveness.
              </Text>

              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    🇸🇪 Lagom
                  </Text>
                  <Text fontSize="sm" color="blue.600" textAlign="center">
                    Consensus Building
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    🇩🇪 Systematik
                  </Text>
                  <Text fontSize="sm" color="blue.600" textAlign="center">
                    Detailed Analysis
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    🇫🇷 Excellence
                  </Text>
                  <Text fontSize="sm" color="blue.600" textAlign="center">
                    Sophisticated Formality
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="800" color="blue.500">
                    🇳🇱 Directheid
                  </Text>
                  <Text fontSize="sm" color="blue.600" textAlign="center">
                    Practical Focus
                  </Text>
                </VStack>
              </Grid>

            </VStack>
          </CardBody>
        </Card>
      </MotionBox>

      {/* Stakeholder Detail Modal */}
      <StakeholderDetailModal
        stakeholder={selectedStakeholder}
        isOpen={isOpen}
        onClose={onClose}
      />

    </VStack>
  );
};