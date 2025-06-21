/**
 * Permit Processing Workflow - Municipal Drag-Drop Interface
 * Task: proposal-029 - Q2 Interactive Mechanics Implementation
 * 
 * Advanced municipal permit processing with drag-drop approval workflow
 * Optimized for Anna Svensson iPhone 12 + European compliance
 */

import React, { useState, useCallback, useRef } from 'react';
import { useDragDrop } from './hooks/useDragDrop';
import { useMunicipalCompliance } from './hooks/useMunicipalCompliance';

interface PermitApplication {
  id: string;
  type: 'building' | 'business' | 'event' | 'parking';
  applicant: string;
  municipality: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  submittedDate: string;
  requiredDocuments: string[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  culturalConsiderations?: {
    swedishCompliance: boolean;
    germanRequirements?: boolean;
    frenchRegulations?: boolean;
    dutchStandards?: boolean;
  };
}

interface PermitProcessingWorkflowProps {
  municipality: 'malmö' | 'göteborg' | 'stockholm' | 'berlin';
  permits: PermitApplication[];
  onPermitStatusChange: (permitId: string, newStatus: string, reviewNotes: string) => void;
  locale: 'sv' | 'de' | 'fr' | 'nl';
}

const PROCESSING_STAGES = {
  sv: {
    pending: 'Väntande',
    document_review: 'Dokumentgranskning', 
    compliance_check: 'Regelefterlevnad',
    supervisor_approval: 'Godkännande',
    approved: 'Godkänd',
    rejected: 'Avvisad'
  },
  de: {
    pending: 'Wartend',
    document_review: 'Dokumentenprüfung',
    compliance_check: 'Compliance-Prüfung', 
    supervisor_approval: 'Genehmigung',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt'
  },
  fr: {
    pending: 'En attente',
    document_review: 'Révision documentaire',
    compliance_check: 'Vérification conformité',
    supervisor_approval: 'Approbation',
    approved: 'Approuvé',
    rejected: 'Rejeté'
  },
  nl: {
    pending: 'Wachtend',
    document_review: 'Documentbeoordeling',
    compliance_check: 'Compliance controle',
    supervisor_approval: 'Goedkeuring',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen'
  }
};

export const PermitProcessingWorkflow: React.FC<PermitProcessingWorkflowProps> = ({
  municipality,
  permits,
  onPermitStatusChange,
  locale
}) => {
  const [draggedPermit, setDraggedPermit] = useState<PermitApplication | null>(null);
  const [processingStage, setProcessingStage] = useState<string>('pending');
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const { validateMunicipalCompliance } = useMunicipalCompliance();
  const { 
    handleDragStart,
    handleDragEnd,
    handleDrop,
    isDragging 
  } = useDragDrop({
    onDrop: handlePermitDrop,
    validateDrop: validatePermitDrop
  });

  const handlePermitDrop = useCallback(async (permitId: string, targetStage: string) => {
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return false;

    // Municipal compliance validation
    const complianceCheck = await validateMunicipalCompliance({
      permit,
      targetStage,
      municipality,
      locale
    });

    if (!complianceCheck.isValid) {
      console.warn('Permit processing compliance failed:', complianceCheck.errors);
      return false;
    }

    // Cultural sensitivity check för European markets
    if (permit.culturalConsiderations) {
      const culturalValidation = validateCulturalCompliance(permit, locale);
      if (!culturalValidation.isValid) {
        return false;
      }
    }

    onPermitStatusChange(permitId, targetStage, complianceCheck.reviewNotes);
    return true;
  }, [permits, municipality, locale, onPermitStatusChange, validateMunicipalCompliance]);

  const validatePermitDrop = useCallback((permitId: string, targetStage: string): boolean => {
    const permit = permits.find(p => p.id === permitId);
    if (!permit) return false;

    // Stage progression validation
    const stageOrder = ['pending', 'document_review', 'compliance_check', 'supervisor_approval'];
    const currentStageIndex = stageOrder.indexOf(permit.status);
    const targetStageIndex = stageOrder.indexOf(targetStage);

    // Allow progressive advancement or rejection at any stage
    return targetStageIndex > currentStageIndex || targetStage === 'rejected';
  }, [permits]);

  const validateCulturalCompliance = (permit: PermitApplication, locale: string) => {
    if (!permit.culturalConsiderations) return { isValid: true };

    switch (locale) {
      case 'sv':
        return { isValid: permit.culturalConsiderations.swedishCompliance };
      case 'de':
        return { isValid: permit.culturalConsiderations.germanRequirements || false };
      case 'fr':
        return { isValid: permit.culturalConsiderations.frenchRegulations || false };
      case 'nl':
        return { isValid: permit.culturalConsiderations.dutchStandards || false };
      default:
        return { isValid: true };
    }
  };

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'emergency': return '#dc2626'; // red-600
      case 'high': return '#ea580c'; // orange-600  
      case 'medium': return '#ca8a04'; // yellow-600
      case 'low': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  };

  const stages = PROCESSING_STAGES[locale];

  return (
    <div className="permit-processing-workflow" role="main" aria-label={`Permit processing för ${municipality}`}>
      {/* Municipal Header */}
      <div className="workflow-header bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-blue-900">
          {stages.pending} - {municipality.charAt(0).toUpperCase() + municipality.slice(1)}
        </h2>
        <p className="text-blue-700 text-sm mt-1">
          {locale === 'sv' && 'Dra och släpp tillstånd för bearbetning'}
          {locale === 'de' && 'Genehmigungen zur Bearbeitung ziehen und ablegen'}
          {locale === 'fr' && 'Glisser-déposer les permis pour traitement'}
          {locale === 'nl' && 'Sleep en zet vergunningen neer voor verwerking'}
        </p>
      </div>

      {/* Processing Stages */}
      <div className="processing-stages flex gap-4 overflow-x-auto pb-4">
        {Object.entries(stages).map(([stageKey, stageLabel]) => (
          <div 
            key={stageKey}
            ref={stageKey === processingStage ? dropZoneRef : undefined}
            className={`processing-stage min-w-80 p-4 rounded-lg border-2 border-dashed transition-colors ${
              isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, stageKey)}
            role="region"
            aria-label={`${stageLabel} stage`}
          >
            <h3 className="font-medium text-gray-900 mb-3">{stageLabel}</h3>
            
            {/* Permits in this stage */}
            <div className="space-y-2">
              {permits
                .filter(permit => permit.status === stageKey)
                .map(permit => (
                  <div
                    key={permit.id}
                    draggable
                    onDragStart={(e) => {
                      handleDragStart(e, permit.id);
                      setDraggedPermit(permit);
                    }}
                    onDragEnd={handleDragEnd}
                    className="permit-card bg-white p-3 rounded border shadow-sm cursor-move hover:shadow-md transition-shadow"
                    role="button"
                    tabIndex={0}
                    aria-label={`Permit ${permit.id} för ${permit.applicant}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm">{permit.applicant}</span>
                      <span 
                        className="px-2 py-1 rounded text-xs text-white"
                        style={{ backgroundColor: getUrgencyColor(permit.urgency) }}
                      >
                        {permit.urgency}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <div>{permit.type}</div>
                      <div>{permit.submittedDate}</div>
                      {permit.culturalConsiderations && (
                        <div className="mt-1 text-blue-600">
                          {locale === 'sv' && '🇸🇪 Svensk standard'}
                          {locale === 'de' && '🇩🇪 Deutsche Norm'}
                          {locale === 'fr' && '🇫🇷 Norme française'}
                          {locale === 'nl' && '🇳🇱 Nederlandse standaard'}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              }
              
              {/* Empty state */}
              {permits.filter(permit => permit.status === stageKey).length === 0 && (
                <div className="text-gray-400 text-sm text-center py-8">
                  {locale === 'sv' && 'Inga tillstånd i detta steg'}
                  {locale === 'de' && 'Keine Genehmigungen in dieser Phase'}
                  {locale === 'fr' && 'Aucun permis dans cette étape'}
                  {locale === 'nl' && 'Geen vergunningen in deze fase'}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Municipal Performance Indicators */}
      <div className="performance-indicators mt-6 p-4 bg-green-50 rounded-lg">
        <h3 className="font-medium text-green-900 mb-2">
          {locale === 'sv' && 'Prestationsstatistik'}
          {locale === 'de' && 'Leistungsstatistik'}  
          {locale === 'fr' && 'Statistiques de performance'}
          {locale === 'nl' && 'Prestatiestatistieken'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-green-700 font-medium">
              {permits.filter(p => p.status === 'approved').length}
            </div>
            <div className="text-green-600">
              {locale === 'sv' && 'Godkända'}
              {locale === 'de' && 'Genehmigt'}
              {locale === 'fr' && 'Approuvés'}
              {locale === 'nl' && 'Goedgekeurd'}
            </div>
          </div>
          <div>
            <div className="text-blue-700 font-medium">
              {permits.filter(p => ['pending', 'document_review', 'compliance_check'].includes(p.status)).length}
            </div>
            <div className="text-blue-600">
              {locale === 'sv' && 'Under behandling'}
              {locale === 'de' && 'In Bearbeitung'}
              {locale === 'fr' && 'En traitement'}
              {locale === 'nl' && 'In behandeling'}
            </div>
          </div>
          <div>
            <div className="text-orange-700 font-medium">
              {permits.filter(p => p.urgency === 'high' || p.urgency === 'emergency').length}
            </div>
            <div className="text-orange-600">
              {locale === 'sv' && 'Brådskande'}
              {locale === 'de' && 'Dringend'}
              {locale === 'fr' && 'Urgent'}
              {locale === 'nl' && 'Urgent'}
            </div>
          </div>
          <div>
            <div className="text-purple-700 font-medium">
              {Math.round((permits.filter(p => p.status === 'approved').length / permits.length) * 100)}%
            </div>
            <div className="text-purple-600">
              {locale === 'sv' && 'Godkännandegrad'}
              {locale === 'de' && 'Genehmigungsrate'}
              {locale === 'fr' && "Taux d'approbation"}
              {locale === 'nl' && 'Goedkeuringspercentage'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermitProcessingWorkflow;