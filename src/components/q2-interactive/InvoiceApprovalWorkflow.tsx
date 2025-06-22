/**
 * Invoice Approval Workflow - Municipal Finance Drag-Drop Interface  
 * Task: proposal-029 - Q2 Interactive Mechanics Implementation
 * 
 * Municipal invoice processing with multi-level approval and GDPR compliance
 * Optimized för European financial regulations and cultural sensitivity
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useDragDrop } from './hooks/useDragDrop';
import { useFinancialCompliance } from './hooks/useFinancialCompliance';

interface MunicipalInvoice {
  id: string;
  vendor: string;
  amount: number;
  currency: 'SEK' | 'EUR' | 'DKK';
  category: 'infrastructure' | 'services' | 'supplies' | 'maintenance' | 'emergency';
  department: string;
  submittedDate: string;
  dueDate: string;
  status: 'pending' | 'department_review' | 'finance_review' | 'supervisor_approval' | 'approved' | 'rejected' | 'paid';
  urgency: 'routine' | 'urgent' | 'emergency';
  documents: string[];
  municipalBudgetLine?: string;
  culturalCompliance: {
    taxRegulation: boolean;
    vatCompliance: boolean;
    localRegulations: boolean;
  };
}

interface InvoiceApprovalWorkflowProps {
  municipality: 'malmö' | 'göteborg' | 'stockholm' | 'berlin';
  invoices: MunicipalInvoice[];
  userRole: 'department_manager' | 'finance_officer' | 'supervisor' | 'mayor';
  budgetLimits: Record<string, number>;
  onInvoiceStatusChange: (invoiceId: string, newStatus: string, approvalNotes: string) => void;
  locale: 'sv' | 'de' | 'fr' | 'nl';
}

const APPROVAL_STAGES = {
  sv: {
    pending: 'Väntande',
    department_review: 'Avdelningsgranskning',
    finance_review: 'Ekonomigranskning',
    supervisor_approval: 'Chefsgodkännande',
    approved: 'Godkänd',
    rejected: 'Avvisad',
    paid: 'Betald'
  },
  de: {
    pending: 'Wartend',
    department_review: 'Abteilungsprüfung',
    finance_review: 'Finanzprüfung',
    supervisor_approval: 'Vorgesetztengenehmigung',
    approved: 'Genehmigt',
    rejected: 'Abgelehnt',
    paid: 'Bezahlt'
  },
  fr: {
    pending: 'En attente',
    department_review: 'Révision départementale',
    finance_review: 'Révision financière',
    supervisor_approval: 'Approbation superviseur',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    paid: 'Payé'
  },
  nl: {
    pending: 'Wachtend',
    department_review: 'Afdelingsbeoordeling',
    finance_review: 'Financiële beoordeling',
    supervisor_approval: 'Supervisorgoedkeuring',
    approved: 'Goedgekeurd',
    rejected: 'Afgewezen',
    paid: 'Betaald'
  }
};

const CATEGORY_COLORS = {
  infrastructure: '#3b82f6', // blue
  services: '#10b981',       // emerald
  supplies: '#f59e0b',       // amber
  maintenance: '#8b5cf6',    // violet
  emergency: '#ef4444'       // red
};

export const InvoiceApprovalWorkflow: React.FC<InvoiceApprovalWorkflowProps> = ({
  municipality,
  invoices,
  userRole,
  budgetLimits,
  onInvoiceStatusChange,
  locale
}) => {
  const [draggedInvoice, setDraggedInvoice] = useState<MunicipalInvoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  const { validateFinancialCompliance } = useFinancialCompliance();
  
  // Role-based stage access
  const accessibleStages = useMemo(() => {
    switch (userRole) {
      case 'department_manager':
        return ['pending', 'department_review'];
      case 'finance_officer':
        return ['department_review', 'finance_review'];
      case 'supervisor':
        return ['finance_review', 'supervisor_approval', 'approved', 'rejected'];
      case 'mayor':
        return ['supervisor_approval', 'approved', 'rejected', 'paid'];
      default:
        return ['pending'];
    }
  }, [userRole]);

  const handleInvoiceDrop = useCallback(async (invoiceId: string, targetStage: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return false;

    // Role permission check
    if (!accessibleStages.includes(targetStage)) {
      console.warn('Insufficient permissions för stage:', targetStage);
      return false;
    }

    // Budget validation för approvals
    if (['approved', 'paid'].includes(targetStage)) {
      const budgetLimit = budgetLimits[invoice.category] || 0;
      if (invoice.amount > budgetLimit) {
        console.warn('Invoice amount exceeds budget limit');
        return false;
      }
    }

    // Financial compliance validation
    const complianceCheck = await validateFinancialCompliance({
      invoice,
      targetStage,
      municipality,
      userRole,
      locale
    });

    if (!complianceCheck.isValid) {
      console.warn('Financial compliance failed:', complianceCheck.errors);
      return false;
    }

    // Cultural compliance validation för European standards
    if (!validateCulturalFinancialCompliance(invoice, locale)) {
      return false;
    }

    onInvoiceStatusChange(invoiceId, targetStage, complianceCheck.approvalNotes);
    return true;
  }, [invoices, accessibleStages, budgetLimits, municipality, userRole, locale, validateFinancialCompliance, onInvoiceStatusChange]);

  const validateInvoiceDrop = useCallback((invoiceId: string, targetStage: string): boolean => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return false;

    // Role permission check
    if (!accessibleStages.includes(targetStage)) {
      return false;
    }

    // Stage progression validation
    const stageOrder = ['pending', 'department_review', 'finance_review', 'supervisor_approval', 'approved', 'paid'];
    const currentStageIndex = stageOrder.indexOf(invoice.status);
    const targetStageIndex = stageOrder.indexOf(targetStage);

    // Allow progressive advancement, rejection at any stage, or paid från approved
    return (
      targetStageIndex > currentStageIndex || 
      targetStage === 'rejected' ||
      (invoice.status === 'approved' && targetStage === 'paid')
    );
  }, [invoices, accessibleStages]);

  const {
    handleDragStart,
    handleDragEnd, 
    handleDrop,
    isDragging
  } = useDragDrop({
    onDrop: handleInvoiceDrop,
    validateDrop: validateInvoiceDrop
  });

  const validateCulturalFinancialCompliance = (invoice: MunicipalInvoice, locale: string): boolean => {
    const { culturalCompliance } = invoice;
    
    // European financial regulations
    switch (locale) {
      case 'sv': // Swedish regulations
        return culturalCompliance.taxRegulation && culturalCompliance.vatCompliance;
      case 'de': // German regulations  
        return culturalCompliance.vatCompliance && culturalCompliance.localRegulations;
      case 'fr': // French regulations
        return culturalCompliance.taxRegulation && culturalCompliance.localRegulations;
      case 'nl': // Dutch regulations
        return culturalCompliance.vatCompliance && culturalCompliance.localRegulations;
      default:
        return true;
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : locale === 'de' ? 'de-DE' : locale === 'fr' ? 'fr-FR' : 'nl-NL', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors = {
      routine: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800', 
      emergency: 'bg-red-100 text-red-800'
    };
    
    return colors[urgency as keyof typeof colors] || colors.routine;
  };

  const stages = APPROVAL_STAGES[locale];

  return (
    <div className="invoice-approval-workflow" role="main" aria-label={`Invoice approval för ${municipality}`}>
      {/* Municipal Finance Header */}
      <div className="workflow-header bg-green-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-green-900">
          {locale === 'sv' && 'Fakturahantering'}
          {locale === 'de' && 'Rechnungsbearbeitung'}
          {locale === 'fr' && 'Traitement des factures'}
          {locale === 'nl' && 'Factuurverwerking'}
          {' - '}
          {municipality.charAt(0).toUpperCase() + municipality.slice(1)}
        </h2>
        <div className="flex justify-between items-center mt-2">
          <p className="text-green-700 text-sm">
            {locale === 'sv' && 'Dra och släpp fakturor för godkännande'}
            {locale === 'de' && 'Rechnungen zur Genehmigung ziehen und ablegen'}
            {locale === 'fr' && 'Glisser-déposer les factures pour approbation'}
            {locale === 'nl' && 'Sleep facturen voor goedkeuring'}
          </p>
          <span className="text-green-600 text-sm font-medium">
            {locale === 'sv' && `Roll: ${userRole}`}
            {locale === 'de' && `Rolle: ${userRole}`}
            {locale === 'fr' && `Rôle: ${userRole}`}
            {locale === 'nl' && `Rol: ${userRole}`}
          </span>
        </div>
      </div>

      {/* Approval Stages */}
      <div className="approval-stages flex gap-4 overflow-x-auto pb-4">
        {Object.entries(stages).map(([stageKey, stageLabel]) => {
          const isAccessible = accessibleStages.includes(stageKey);
          
          return (
            <div 
              key={stageKey}
              className={`approval-stage min-w-80 p-4 rounded-lg border-2 transition-colors ${
                isDragging && isAccessible 
                  ? 'border-green-400 bg-green-50 border-dashed' 
                  : isAccessible
                  ? 'border-green-200 bg-white'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
              onDragOver={isAccessible ? (e) => e.preventDefault() : undefined}
              onDrop={isAccessible ? (e) => handleDrop(e, stageKey) : undefined}
              role="region"
              aria-label={`${stageLabel} stage`}
            >
              <h3 className={`font-medium mb-3 ${isAccessible ? 'text-gray-900' : 'text-gray-500'}`}>
                {stageLabel}
                {!isAccessible && (
                  <span className="ml-2 text-xs">
                    {locale === 'sv' && '(Ej tillgänglig)'}
                    {locale === 'de' && '(Nicht verfügbar)'}
                    {locale === 'fr' && '(Non accessible)'}
                    {locale === 'nl' && '(Niet toegankelijk)'}
                  </span>
                )}
              </h3>
              
              {/* Invoices in this stage */}
              <div className="space-y-2">
                {invoices
                  .filter(invoice => invoice.status === stageKey)
                  .map(invoice => (
                    <div
                      key={invoice.id}
                      draggable={isAccessible}
                      onDragStart={isAccessible ? (e) => {
                        handleDragStart(e, invoice.id);
                        setDraggedInvoice(invoice);
                      } : undefined}
                      onDragEnd={isAccessible ? handleDragEnd : undefined}
                      onClick={() => setSelectedInvoice(selectedInvoice === invoice.id ? null : invoice.id)}
                      className={`invoice-card bg-white p-3 rounded border shadow-sm transition-all ${
                        isAccessible ? 'cursor-move hover:shadow-md' : 'cursor-default'
                      } ${selectedInvoice === invoice.id ? 'ring-2 ring-green-500' : ''}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`Invoice ${invoice.id} från ${invoice.vendor}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">{invoice.vendor}</span>
                        <div className="flex gap-1">
                          <span 
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: CATEGORY_COLORS[invoice.category] }}
                          >
                            {invoice.category}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${getUrgencyBadge(invoice.urgency)}`}>
                            {invoice.urgency}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-semibold text-green-700">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </div>
                        <div className="text-gray-600 text-xs mt-1">
                          <div>{invoice.department}</div>
                          <div>{invoice.dueDate}</div>
                          {invoice.municipalBudgetLine && (
                            <div className="text-blue-600 mt-1">
                              {locale === 'sv' && 'Budget:'} {invoice.municipalBudgetLine}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expanded details */}
                      {selectedInvoice === invoice.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-1">
                          <div><strong>Dokument:</strong> {invoice.documents.join(', ')}</div>
                          <div className="flex gap-2 text-green-600">
                            {invoice.culturalCompliance.taxRegulation && '✓ Skatt'}
                            {invoice.culturalCompliance.vatCompliance && '✓ Moms'}
                            {invoice.culturalCompliance.localRegulations && '✓ Lokala regler'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                }
                
                {/* Empty state */}
                {invoices.filter(invoice => invoice.status === stageKey).length === 0 && (
                  <div className="text-gray-400 text-sm text-center py-8">
                    {locale === 'sv' && 'Inga fakturor i detta steg'}
                    {locale === 'de' && 'Keine Rechnungen in dieser Phase'}
                    {locale === 'fr' && 'Aucune facture dans cette étape'}
                    {locale === 'nl' && 'Geen facturen in deze fase'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Financial Summary */}
      <div className="financial-summary mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-3">
          {locale === 'sv' && 'Ekonomisk översikt'}
          {locale === 'de' && 'Finanzübersicht'}  
          {locale === 'fr' && 'Aperçu financier'}
          {locale === 'nl' && 'Financieel overzicht'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-700 font-medium">
              {formatCurrency(
                invoices.filter(i => i.status === 'approved').reduce((sum, i) => sum + i.amount, 0),
                'SEK'
              )}
            </div>
            <div className="text-blue-600">
              {locale === 'sv' && 'Godkända'}
              {locale === 'de' && 'Genehmigt'}
              {locale === 'fr' && 'Approuvées'}
              {locale === 'nl' && 'Goedgekeurd'}
            </div>
          </div>
          <div>
            <div className="text-orange-700 font-medium">
              {invoices.filter(i => ['pending', 'department_review', 'finance_review'].includes(i.status)).length}
            </div>
            <div className="text-orange-600">
              {locale === 'sv' && 'Väntande'}
              {locale === 'de' && 'Wartend'}
              {locale === 'fr' && 'En attente'}
              {locale === 'nl' && 'Wachtend'}
            </div>
          </div>
          <div>
            <div className="text-red-700 font-medium">
              {invoices.filter(i => i.urgency === 'emergency').length}
            </div>
            <div className="text-red-600">
              {locale === 'sv' && 'Akut'}
              {locale === 'de' && 'Notfall'}
              {locale === 'fr' && 'Urgence'}
              {locale === 'nl' && 'Noodgeval'}
            </div>
          </div>
          <div>
            <div className="text-green-700 font-medium">
              {Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100)}%
            </div>
            <div className="text-green-600">
              {locale === 'sv' && 'Betalda'}
              {locale === 'de' && 'Bezahlt'}
              {locale === 'fr' && 'Payées'}
              {locale === 'nl' && 'Betaald'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceApprovalWorkflow;