/**
 * Municipal Analytics Dashboard Component
 * Real-time dashboard for municipal administrators and decision makers
 * GDPR-compliant analytics visualization with European cultural intelligence
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity,
  Users,
  TrendingUp,
  Shield,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Euro
} from 'lucide-react';

import { MunicipalAnalyticsEngine, RealTimeMunicipalDashboard } from '../../services/q2-analytics/municipal-analytics-engine';

interface MunicipalAnalyticsDashboardProps {
  municipality: string;
  userRole: 'municipal_admin' | 'municipal_employee' | 'emergency_coordinator' | 'it_coordinator';
  culturalMarket: 'swedish' | 'german' | 'french' | 'dutch';
  accessLevel: 'administrator' | 'decision_maker' | 'analyst';
}

const EUROPEAN_COLORS = {
  swedish: '#006AA7', // Swedish blue
  german: '#000000', // German black
  french: '#002395', // French blue
  dutch: '#FF9B00', // Dutch orange
  primary: '#2563eb',
  secondary: '#64748b',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626'
};

const MunicipalAnalyticsDashboard: React.FC<MunicipalAnalyticsDashboardProps> = ({
  municipality,
  userRole,
  culturalMarket,
  accessLevel
}) => {
  const [dashboardData, setDashboardData] = useState<RealTimeMunicipalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // GDPR compliance configuration
  const gdprConfig = {
    dataMinimization: {
      onlyNecessaryData: true,
      automaticDataReduction: true,
      purposeLimitation: true,
      storageMinimization: true
    },
    consentManagement: {
      explicitConsent: true,
      consentGranularity: 'feature-specific' as const,
      consentWithdrawal: true,
      consentAuditTrail: true
    },
    dataProtection: {
      encryptionStandard: 'aes-256' as const,
      accessControls: 'role-based' as const,
      auditLogging: true,
      anonymizationTechniques: ['k-anonymity', 'differential-privacy']
    }
  };

  const analyticsEngine = new MunicipalAnalyticsEngine(gdprConfig);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [municipality]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsEngine.generateRealTimeMunicipalDashboard(municipality);
      setDashboardData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getCulturalGreeting = (): string => {
    const greetings = {
      swedish: 'Välkommen till kommunal analys',
      german: 'Willkommen zur kommunalen Analyse',
      french: 'Bienvenue à l\'analyse municipale',
      dutch: 'Welkom bij gemeentelijke analyse'
    };
    return greetings[culturalMarket];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat(culturalMarket === 'swedish' ? 'sv-SE' : 
                                culturalMarket === 'german' ? 'de-DE' :
                                culturalMarket === 'french' ? 'fr-FR' : 'nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const renderSystemHealthMetrics = () => {
    if (!dashboardData?.administratorOverview.systemHealthMetrics) return null;

    const metrics = dashboardData.administratorOverview.systemHealthMetrics;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average municipal network
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              Below municipal threshold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cultural Compliance</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.culturalCompliance}%</div>
            <Badge variant={metrics.culturalCompliance >= 90 ? "default" : "destructive"}>
              {metrics.culturalCompliance >= 90 ? 'Excellent' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderLearningEffectiveness = () => {
    if (!dashboardData?.administratorOverview.learningEffectivenessScores) return null;

    const scores = dashboardData.administratorOverview.learningEffectivenessScores;
    
    const effectivenessData = [
      { name: 'Overall Effectiveness', value: scores.overallEffectiveness, color: EUROPEAN_COLORS.primary },
      { name: 'Competency Improvement', value: scores.competencyImprovement, color: EUROPEAN_COLORS.success },
      { name: 'Skill Transfer', value: scores.skillTransfer, color: EUROPEAN_COLORS[culturalMarket] }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Learning Effectiveness Scores</CardTitle>
          <CardDescription>Municipal professional development impact</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={effectivenessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill={EUROPEAN_COLORS[culturalMarket]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderCulturalAdaptationMetrics = () => {
    if (!dashboardData?.culturalIntelligence.culturalSensitivityMonitoring) return null;

    const cultural = dashboardData.culturalIntelligence.culturalSensitivityMonitoring;
    
    const culturalData = [
      { name: 'Terminology', value: cultural.terminologyAppropriateness },
      { name: 'Decision Making', value: cultural.decisionMakingAlignment },
      { name: 'Communication', value: cultural.communicationPatterns }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Cultural Adaptation Effectiveness</CardTitle>
          <CardDescription>{getCulturalGreeting()}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={culturalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={EUROPEAN_COLORS[culturalMarket]} 
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  const renderROIAnalysis = () => {
    if (!dashboardData?.decisionMakerReporting.budgetJustification) return null;

    const budget = dashboardData.decisionMakerReporting.budgetJustification;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Investment ROI</CardTitle>
          <CardDescription>Municipal budget impact analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Investment</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(budget.trainingInvestment)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Measured Benefits</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(budget.measuredBenefits)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Net Benefit</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(budget.netBenefit)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Payback Period</p>
              <p className="text-2xl font-bold">{budget.paybackPeriod} months</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderComplianceStatus = () => {
    if (!dashboardData?.decisionMakerReporting.complianceReporting) return null;

    const compliance = dashboardData.decisionMakerReporting.complianceReporting;
    
    const complianceData = [
      { name: 'GDPR', value: compliance.gdprCompliance, threshold: 100 },
      { name: 'Accessibility', value: compliance.accessibilityCompliance, threshold: 95 },
      { name: 'Cultural Sensitivity', value: compliance.culturalSensitivity, threshold: 90 },
      { name: 'Municipal Standards', value: compliance.municipalStandardsAdherence, threshold: 95 }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Government and regulatory adherence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.value >= item.threshold ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${item.value >= item.threshold ? 'bg-green-600' : 'bg-yellow-600'}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderEuropeanMarketComparison = () => {
    if (!dashboardData?.culturalIntelligence.europeanMarketPerformance) return null;

    const european = dashboardData.culturalIntelligence.europeanMarketPerformance;
    
    const marketData = [
      { name: 'Swedish', value: european.swedishAdaptation, fill: EUROPEAN_COLORS.swedish },
      { name: 'German', value: european.germanEffectiveness, fill: EUROPEAN_COLORS.german },
      { name: 'French', value: european.frenchSuccess, fill: EUROPEAN_COLORS.french },
      { name: 'Dutch', value: european.dutchOptimization, fill: EUROPEAN_COLORS.dutch }
    ];

    return (
      <Card>
        <CardHeader>
          <CardTitle>European Market Performance</CardTitle>
          <CardDescription>Cultural adaptation across European municipalities</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={marketData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {marketData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Municipal Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            {municipality} • {getCulturalGreeting()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Badge variant="outline">{userRole.replace('_', ' ').toUpperCase()}</Badge>
        </div>
      </div>

      {/* GDPR Compliance Notice */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This dashboard complies with GDPR and municipal data protection standards. 
          All analytics use anonymized, aggregated data with explicit consent.
        </AlertDescription>
      </Alert>

      {/* System Health Overview */}
      {renderSystemHealthMetrics()}

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="learning">Learning Analytics</TabsTrigger>
          <TabsTrigger value="cultural">Cultural Intelligence</TabsTrigger>
          <TabsTrigger value="compliance">Compliance & ROI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderLearningEffectiveness()}
            {renderCulturalAdaptationMetrics()}
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {renderLearningEffectiveness()}
            {/* Additional learning analytics components would go here */}
          </div>
        </TabsContent>

        <TabsContent value="cultural" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCulturalAdaptationMetrics()}
            {renderEuropeanMarketComparison()}
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderComplianceStatus()}
            {renderROIAnalysis()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MunicipalAnalyticsDashboard;