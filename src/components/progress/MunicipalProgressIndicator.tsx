import React, { useState } from 'react';
import { 
  Box, 
  Progress, 
  HStack,
  VStack,
  Text,
  Tooltip,
  useBreakpointValue
} from '@chakra-ui/react';
import { CheckIcon, StarIcon } from '../icons/GameIcons';

export interface AchievementMilestone {
  id: string;
  percentage: number; // 25, 50, 75, 100
  title: string; // 'GDPR Grundkunskaper', 'Datahantering', etc.
  description: string; // Achievement description
  competence: string; // Municipal competence developed
  achieved: boolean;
}

export interface MunicipalProgressIndicatorProps {
  // Progress Data
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSections: string[];
    achievementMilestones: AchievementMilestone[];
    competenciesEarned: string[];
  };
  
  // Municipal Visual Design
  visualDesign: {
    baseColor: string; // '#E2E8F0' - Light gray progress track
    progressColor: string; // '#0066CC' - Municipal blue progress
    milestoneColor: string; // '#004C99' - Darker blue for achievements
    textColor: string; // '#333333' - High contrast text
  };
  
  // Achievement Integration
  achievementIntegration: {
    milestoneMarkers: boolean; // Show achievement points on progress bar
    hoverDetails: boolean; // Show achievement details on hover
    clickableMarkers: boolean; // Click to view achievement details
    professionalLabels: boolean; // Show competence labels
  };
  
  // Accessibility Features
  accessibility: {
    ariaLabel: string; // 'GDPR-utbildning framsteg med kompetensmål'
    ariaValueText: string; // '3 av 5 sektioner slutförda, 2 kompetenser utvecklade'
    keyboardNavigation: boolean; // Tab to milestone details
  };
  
  // Cultural Context
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch';
  municipalEntity: string; // 'Malmö Stad', 'Berlin Stadt', etc.
  
  // Event Handlers
  onMilestoneClick?: (milestone: AchievementMilestone) => void;
  onMilestoneHover?: (milestone: AchievementMilestone) => void;
}

export const MunicipalProgressIndicator: React.FC<MunicipalProgressIndicatorProps> = ({
  progress,
  visualDesign,
  achievementIntegration,
  accessibility,
  culturalContext,
  municipalEntity,
  onMilestoneClick,
  onMilestoneHover
}) => {
  const [hoveredMilestone, setHoveredMilestone] = useState<string | null>(null);
  
  // Responsive design
  
  // Calculate current progress percentage
  
  // Cultural text adaptations

  // Handle milestone interaction


  // Milestone marker component
  const MilestoneMarker: React.FC<{ milestone: AchievementMilestone; position: number }> = ({ 
    milestone, 
    position 
  }) => {

    const _marker = (
      <Box
        position="absolute"
        left={`${position}%`}
        top="50%"
        transform="translate(-50%, -50%)"
        w={milestoneSize}
        h={milestoneSize}
        borderRadius="full"
        border="2px solid"
        borderColor={isAchieved ? visualDesign.milestoneColor : visualDesign.baseColor}
        bg={isAchieved ? visualDesign.milestoneColor : 'white'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor={isClickable ? 'pointer' : 'default'}
        zIndex={2}
        transition="all 0.2s ease"
        _hover={isClickable ? {
          transform: 'translate(-50%, -50%) scale(1.1)',
          boxShadow: 'md'
        } : Record<string, unknown>}
        onClick={() => handleMilestoneClick(milestone)}
        onMouseEnter={() => handleMilestoneHover(milestone, true)}
        onMouseLeave={() => handleMilestoneHover(milestone, false)}
        role={isClickable ? 'button' : 'presentation'}
        aria-label={isClickable ? `${milestone.title} - ${isAchieved ? 'uppnått' : 'ej uppnått'}` : undefined}
        tabIndex={accessibility.keyboardNavigation && isClickable ? 0 : -1}
        onKeyDown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleMilestoneClick(milestone);
          }
        }}
      >
        {isAchieved && (
          <CheckIcon 
            w={isMobile ? "8px" : "10px"} 
            h={isMobile ? "8px" : "10px"} 
            color="white" 
            aria-hidden="true"
          />
        )}
      </Box>
    );

    if (showTooltip) {
      return (
        <Tooltip
          label={
            <VStack spacing={1} textAlign="left">
              <Text fontSize="sm" fontWeight="bold">{milestone.title}</Text>
              <Text fontSize="xs">{milestone.description}</Text>
              <Text fontSize="xs" fontStyle="italic" color="gray.300">
                {milestone.competence}
              </Text>
            </VStack>
          }
          placement="top"
          hasArrow
          bg={visualDesign.milestoneColor}
          color="white"
          fontSize="sm"
          px={3}
          py={2}
          borderRadius="md"
          isOpen={hoveredMilestone === milestone.id}
        >
          {marker}
        </Tooltip>
      );
    }

    return marker;
  };

  return (
    <VStack spacing={4} w="100%" role="group" aria-label={accessibility.ariaLabel}>
      {/* Progress Bar with Milestones */}
      <Box w="100%" position="relative">
        {/* Main Progress Bar */}
        <Progress
          value={progressPercentage}
          size="lg"
          bg={visualDesign.baseColor}
          borderRadius="full"
          h={progressHeight}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={accessibility.ariaValueText}
          sx={{
            '& > div': {
              borderRadius: 'full',
              background: `linear-gradient(90deg, ${visualDesign.progressColor} 0%, ${visualDesign.milestoneColor} 100%)`,
              transition: 'width 0.8s ease-out'
            }
          }}
        />

        {/* Achievement Milestone Markers */}
        {achievementIntegration.milestoneMarkers && 
          progress.achievementMilestones.map((milestone) => (
            <MilestoneMarker
              key={milestone.id}
              milestone={milestone}
              position={milestone.percentage}
            />
          ))
        }
      </Box>

      {/* Professional Progress Information */}
      <HStack 
        justify="space-between" 
        w="100%" 
        fontSize={isMobile ? "sm" : "md"}
        color={visualDesign.textColor}
      >
        <Text fontWeight="medium">
          {progress.currentStep} av {progress.totalSteps} sektioner {getCulturalText('completed')}
        </Text>
        <Text fontSize="sm" opacity={0.8}>
          {Math.round(progressPercentage)}%
        </Text>
      </HStack>

      {/* Competencies Earned Display */}
      {achievementIntegration.professionalLabels && progress.competenciesEarned.length > 0 && (
        <Box w="100%">
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            color={visualDesign.textColor}
            mb={2}
          >
            {progress.competenciesEarned.length} {getCulturalText('competencies')}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {progress.competenciesEarned.map((competence, index) => (
              <Box
                key={index}
                bg={`${visualDesign.progressColor}1A`}
                color={visualDesign.milestoneColor}
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="medium"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <StarIcon w="10px" h="10px" aria-hidden="true" />
                <Text>{competence}</Text>
              </Box>
            ))}
          </HStack>
        </Box>
      )}

      {/* Municipal Context Footer */}
      <Text 
        fontSize="xs" 
        color={visualDesign.textColor}
        opacity={0.7}
        textAlign="center"
        fontWeight="medium"
      >
        {getCulturalText('progress_label')} • {municipalEntity}
      </Text>
    </VStack>
  );
};

// Default municipal GDPR training milestones
export const DefaultGDPRMilestones: AchievementMilestone[] = [
  {
    id: 'gdpr_basics',
    percentage: 25,
    title: 'GDPR Grundkunskaper',
    description: 'Förståelse för personuppgifter och rättigheter',
    competence: 'Grundläggande dataskydd',
    achieved: false
  },
  {
    id: 'data_handling',
    percentage: 50,
    title: 'Datahantering',
    description: 'Säker hantering av personuppgifter i kommunal verksamhet',
    competence: 'Säker databehandling',
    achieved: false
  },
  {
    id: 'incident_response',
    percentage: 75,
    title: 'Incidenthantering',
    description: 'Kunskap om anmälningsplikt och incidenthantering',
    competence: 'Juridisk efterlevnad',
    achieved: false
  },
  {
    id: 'gdpr_expert',
    percentage: 100,
    title: 'GDPR Expert',
    description: 'Fullständig behärskning av kommunal GDPR-tillämpning',
    competence: 'GDPR Specialist',
    achieved: false
  }
];

// Cultural adaptations for milestones
  culturalContext: 'swedish' | 'german' | 'french' | 'dutch'
): AchievementMilestone[] => {
  
  switch (culturalContext) {
    case 'german':
      return baseMilestones.map(milestone => ({
        ...milestone,
        title: milestone.id === 'gdpr_basics' ? 'DSGVO Grundlagen' :
                milestone.id === 'data_handling' ? 'Datenverarbeitung' :
                milestone.id === 'incident_response' ? 'Vorfallbehandlung' :
                'DSGVO Experte',
        description: milestone.id === 'gdpr_basics' ? 'Verständnis für personenbezogene Daten und Rechte' :
                     milestone.id === 'data_handling' ? 'Sichere Verarbeitung personenbezogener Daten in Behörden' :
                     milestone.id === 'incident_response' ? 'Kenntnis der Meldepflicht und Vorfallbehandlung' :
                     'Vollständige Beherrschung der behördlichen DSGVO-Anwendung',
        competence: milestone.id === 'gdpr_basics' ? 'Grundlegender Datenschutz' :
                    milestone.id === 'data_handling' ? 'Sichere Datenverarbeitung' :
                    milestone.id === 'incident_response' ? 'Rechtliche Compliance' :
                    'DSGVO Spezialist'
      }));
    
    case 'french':
      return baseMilestones.map(milestone => ({
        ...milestone,
        title: milestone.id === 'gdpr_basics' ? 'Bases RGPD' :
                milestone.id === 'data_handling' ? 'Traitement des Données' :
                milestone.id === 'incident_response' ? 'Gestion d\'Incidents' :
                'Expert RGPD',
        description: milestone.id === 'gdpr_basics' ? 'Compréhension des données personnelles et des droits' :
                     milestone.id === 'data_handling' ? 'Traitement sécurisé des données personnelles dans l\'administration' :
                     milestone.id === 'incident_response' ? 'Connaissance de l\'obligation de notification et gestion d\'incidents' :
                     'Maîtrise complète de l\'application RGPD municipale',
        competence: milestone.id === 'gdpr_basics' ? 'Protection des données de base' :
                    milestone.id === 'data_handling' ? 'Traitement sécurisé des données' :
                    milestone.id === 'incident_response' ? 'Conformité juridique' :
                    'Spécialiste RGPD'
      }));
    
    case 'dutch':
      return baseMilestones.map(milestone => ({
        ...milestone,
        title: milestone.id === 'gdpr_basics' ? 'AVG Basiskennis' :
                milestone.id === 'data_handling' ? 'Gegevensverwerking' :
                milestone.id === 'incident_response' ? 'Incidentafhandeling' :
                'AVG Expert',
        description: milestone.id === 'gdpr_basics' ? 'Begrip van persoonsgegevens en rechten' :
                     milestone.id === 'data_handling' ? 'Veilige verwerking van persoonsgegevens in gemeentelijke activiteiten' :
                     milestone.id === 'incident_response' ? 'Kennis van meldingsplicht en incidentafhandeling' :
                     'Volledige beheersing van gemeentelijke AVG-toepassing',
        competence: milestone.id === 'gdpr_basics' ? 'Basis gegevensbescherming' :
                    milestone.id === 'data_handling' ? 'Veilige gegevensverwerking' :
                    milestone.id === 'incident_response' ? 'Juridische naleving' :
                    'AVG Specialist'
      }));
    
    default: // Swedish
      return baseMilestones;
  }
};