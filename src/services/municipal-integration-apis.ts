// Expert specification: Municipal System Integration APIs
// SharePoint/SAP connector implementation för European municipal systems

import { AxiosResponse } from 'axios';

// Expert requirement: Municipal system integration blueprints
export interface MunicipalSystemIntegrations {
  // Document management systems
  sharepoint_integration: SharePointConnector;
  alfresco_integration: AlfrescoConnector;
  
  // HR systems integration
  sap_successfactors: SAPSuccessFactorsConnector;
  workday: WorkdayConnector;
  
  // Municipal portal integration
  drupal_integration: DrupalConnector;
  wordpress_integration: WordPressConnector;
}

// Expert specification: SharePoint integration för document management
export class SharePointConnector {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private siteUrl: string;

  constructor(config: SharePointConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.tenantId = config.tenantId;
    this.siteUrl = config.siteUrl;
  }

  // Expert implementation: Authentication with Microsoft Graph API
  async authenticate(): Promise<string> {
    try {
      const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
      
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          scope: 'https://graph.microsoft.com/.default'
        })
      });

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      throw new MunicipalIntegrationError(`SharePoint authentication failed: ${error.message}`);
    }
  }

  // Expert requirement: Learning materials access
  async getLearningMaterials(municipalContext: string): Promise<LearningMaterial[]> {
    try {
      const accessToken = await this.authenticate();
      const apiUrl = `https://graph.microsoft.com/v1.0/sites/${this.siteUrl}/drive/root/children`;
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      
      return data.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        url: item.webUrl,
        type: this.detectFileType(item.name),
        municipalContext: municipalContext,
        lastModified: item.lastModifiedDateTime,
        size: item.size
      }));
    } catch (error) {
      throw new MunicipalIntegrationError(`Failed to fetch learning materials: ${error.message}`);
    }
  }

  // Expert requirement: Completion certificates upload
  async uploadCompletionCertificate(
    certificate: CompletionCertificate,
    municipalContext: string
  ): Promise<UploadResult> {
    try {
      const accessToken = await this.authenticate();
      const fileName = `${certificate.userId}_${certificate.gameId}_${Date.now()}.pdf`;
      const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${this.siteUrl}/drive/root:/certificates/${fileName}:/content`;
      
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/pdf'
        },
        body: certificate.pdfData
      });

      const data = await response.json();
      
      // Expert requirement: Municipal audit trail
      await this.logCertificateUpload(certificate, municipalContext, data.id);
      
      return {
        success: true,
        fileId: data.id,
        url: data.webUrl,
        municipalContext: municipalContext
      };
    } catch (error) {
      throw new MunicipalIntegrationError(`Certificate upload failed: ${error.message}`);
    }
  }

  private detectFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const fileTypes = {
      'pdf': 'document',
      'docx': 'document', 
      'pptx': 'presentation',
      'xlsx': 'spreadsheet',
      'mp4': 'video',
      'jpg': 'image',
      'png': 'image'
    };
    
    return fileTypes[extension || ''] || 'unknown';
  }

  private async logCertificateUpload(
    certificate: CompletionCertificate,
    municipalContext: string,
    fileId: string
  ): Promise<void> {
    // Expert requirement: Municipal compliance logging
    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'certificate_uploaded',
      userId: certificate.userId,
      gameId: certificate.gameId,
      municipalContext: municipalContext,
      sharePointFileId: fileId,
      complianceScore: certificate.score
    };
    
    console.log('Municipal certificate upload logged:', logEntry);
    // Implementation: Send to municipal audit system
  }
}

// Expert specification: SAP SuccessFactors integration för HR systems
export class SAPSuccessFactorsConnector {
  private apiUrl: string;
  private companyId: string;
  private username: string;
  private password: string;

  constructor(config: SAPConfig) {
    this.apiUrl = config.apiUrl;
    this.companyId = config.companyId;
    this.username = config.username;
    this.password = config.password;
  }

  // Expert requirement: Employee synchronization
  async syncEmployeeData(municipalTenantId: string): Promise<EmployeeSyncResult> {
    try {
      const employees = await this.fetchEmployees();
      const learningProfiles = await this.mapToLearningProfiles(employees, municipalTenantId);
      
      return {
        totalEmployees: employees.length,
        syncedProfiles: learningProfiles.length,
        municipalContext: municipalTenantId,
        syncTimestamp: new Date().toISOString(),
        culturalMapping: this.determineCulturalMapping(municipalTenantId)
      };
    } catch (error) {
      throw new MunicipalIntegrationError(`SAP employee sync failed: ${error.message}`);
    }
  }

  private async fetchEmployees(): Promise<Employee[]> {
    try {
      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      const response = await fetch(`${this.apiUrl}/odata/v2/User`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      return data.d.results.map((user: any) => ({
        id: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        jobTitle: user.title,
        manager: user.manager,
        location: user.location
      }));
    } catch (error) {
      throw new MunicipalIntegrationError(`Failed to fetch SAP employees: ${error.message}`);
    }
  }

  private async mapToLearningProfiles(
    employees: Employee[],
    municipalTenantId: string
  ): Promise<LearningProfile[]> {
    const culturalContext = this.determineCulturalMapping(municipalTenantId);
    
    return employees.map(employee => ({
      userId: `${municipalTenantId}:${employee.id}`,
      email: employee.email,
      displayName: `${employee.firstName} ${employee.lastName}`,
      department: employee.department,
      jobTitle: employee.jobTitle,
      culturalContext: culturalContext,
      learningPreferences: this.generateLearningPreferences(culturalContext),
      municipalRole: this.mapMunicipalRole(employee.jobTitle),
      trainingRequirements: this.getTrainingRequirements(employee.department)
    }));
  }

  // Expert requirement: Real-time completion tracking
  async reportLearningCompletion(
    completion: LearningCompletion,
    municipalTenantId: string
  ): Promise<void> {
    try {
      const sapLearningRecord = {
        userId: completion.userId.split(':')[1], // Remove tenant prefix
        courseId: completion.gameId,
        completionDate: completion.completedAt,
        score: completion.score,
        certificateUrl: completion.certificateUrl,
        municipalContext: municipalTenantId
      };

      await this.sendToSAP('/learning/completions', sapLearningRecord);
      
      // Expert requirement: Municipal reporting
      await this.generateMunicipalReport(completion, municipalTenantId);
    } catch (error) {
      throw new MunicipalIntegrationError(`SAP completion reporting failed: ${error.message}`);
    }
  }

  private determineCulturalMapping(municipalTenantId: string): CulturalContext {
    // Expert mapping: Municipal tenant to cultural context
    if (municipalTenantId.includes('_de') || municipalTenantId.includes('german')) {
      return 'german_systematic';
    } else if (municipalTenantId.includes('_fr') || municipalTenantId.includes('french')) {
      return 'french_collaborative';
    } else if (municipalTenantId.includes('_nl') || municipalTenantId.includes('dutch')) {
      return 'dutch_progressive';
    } else {
      return 'swedish_mobile';
    }
  }

  private generateLearningPreferences(culturalContext: CulturalContext): LearningPreferences {
    switch (culturalContext) {
      case 'german_systematic':
        return {
          preferredDuration: '15-20 minutes',
          informationDensity: 'detailed',
          assessmentStyle: 'comprehensive',
          feedbackLevel: 'detailed_analytical'
        };
      case 'french_collaborative':
        return {
          preferredDuration: '10-15 minutes',
          informationDensity: 'contextual',
          assessmentStyle: 'collaborative',
          feedbackLevel: 'socially_aware'
        };
      case 'dutch_progressive':
        return {
          preferredDuration: '5-10 minutes',
          informationDensity: 'minimal',
          assessmentStyle: 'efficient',
          feedbackLevel: 'direct_actionable'
        };
      case 'swedish_mobile':
        return {
          preferredDuration: '7 minutes',
          informationDensity: 'balanced',
          assessmentStyle: 'practical',
          feedbackLevel: 'professional_mobile'
        };
    }
  }

  private mapMunicipalRole(jobTitle: string): MunicipalRole {
    const titleLower = jobTitle.toLowerCase();
    
    if (titleLower.includes('administrator') || titleLower.includes('förvaltare')) {
      return 'administrator';
    } else if (titleLower.includes('manager') || titleLower.includes('chef')) {
      return 'manager';
    } else if (titleLower.includes('specialist') || titleLower.includes('expert')) {
      return 'specialist';
    } else {
      return 'employee';
    }
  }

  private getTrainingRequirements(department: string): string[] {
    const deptLower = department.toLowerCase();
    const requirements = ['gdpr_compliance', 'municipal_ethics'];
    
    if (deptLower.includes('it') || deptLower.includes('digital')) {
      requirements.push('cybersecurity', 'digital_transformation');
    }
    
    if (deptLower.includes('hr') || deptLower.includes('personal')) {
      requirements.push('employee_privacy', 'recruitment_compliance');
    }
    
    if (deptLower.includes('finance') || deptLower.includes('ekonomi')) {
      requirements.push('financial_compliance', 'procurement_rules');
    }
    
    return requirements;
  }

  private async sendToSAP(endpoint: string, data: any): Promise<void> {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    
    await fetch(`${this.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
  }

  private async generateMunicipalReport(
    completion: LearningCompletion,
    municipalTenantId: string
  ): Promise<void> {
    const report = {
      municipalTenant: municipalTenantId,
      completionData: completion,
      complianceStatus: completion.score >= 80 ? 'compliant' : 'needs_improvement',
      reportDate: new Date().toISOString(),
      nextTrainingDue: this.calculateNextTraining(completion.gameId)
    };
    
    console.log('Municipal compliance report generated:', report);
    // Implementation: Send to municipal reporting system
  }

  private calculateNextTraining(gameId: string): string {
    // Expert requirement: Municipal training cycles
    const trainingCycles = {
      'gdpr-training': 12, // Annual GDPR training
      'ethics-training': 24, // Biannual ethics training
      'security-training': 6, // Semi-annual security training
      'default': 12
    };
    
    const months = trainingCycles[gameId] || trainingCycles.default;
    const nextTraining = new Date();
    nextTraining.setMonth(nextTraining.getMonth() + months);
    
    return nextTraining.toISOString();
  }
}

// Expert specification: Workday integration
export class WorkdayConnector {
  private apiUrl: string;
  private tenant: string;
  private username: string;
  private password: string;

  constructor(config: WorkdayConfig) {
    this.apiUrl = config.apiUrl;
    this.tenant = config.tenant;
    this.username = config.username;
    this.password = config.password;
  }

  // Expert requirement: Employee profile to learning assignment mapping
  async syncLearningAssignments(municipalTenantId: string): Promise<AssignmentSyncResult> {
    try {
      const assignments = await this.fetchLearningAssignments();
      const mappedAssignments = await this.mapToDiginativaGames(assignments, municipalTenantId);
      
      return {
        totalAssignments: assignments.length,
        mappedGames: mappedAssignments.length,
        municipalContext: municipalTenantId,
        syncTimestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new MunicipalIntegrationError(`Workday assignment sync failed: ${error.message}`);
    }
  }

  private async fetchLearningAssignments(): Promise<WorkdayAssignment[]> {
    try {
      const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      const response = await fetch(`${this.apiUrl}/ccx/api/v1/${this.tenant}/learning`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      return data.assignments || [];
    } catch (error) {
      throw new MunicipalIntegrationError(`Failed to fetch Workday assignments: ${error.message}`);
    }
  }

  private async mapToDiginativaGames(
    assignments: WorkdayAssignment[],
    municipalTenantId: string
  ): Promise<GameAssignment[]> {
    return assignments.map(assignment => ({
      workdayId: assignment.id,
      gameId: this.mapToGameId(assignment.courseTitle),
      userId: `${municipalTenantId}:${assignment.employeeId}`,
      dueDate: assignment.dueDate,
      priority: assignment.mandatory ? 'high' : 'medium',
      culturalContext: this.determineCulturalMapping(municipalTenantId),
      municipalRequirement: this.isMunicipalRequirement(assignment.courseTitle)
    }));
  }

  private mapToGameId(courseTitle: string): string {
    const titleLower = courseTitle.toLowerCase();
    const gameMapping = {
      'gdpr': 'malmo-gdpr-training',
      'data protection': 'gdpr-comprehensive',
      'ethics': 'municipal-ethics-training',
      'security': 'cybersecurity-basics',
      'digital transformation': 'digital-strategy-implementation'
    };
    
    for (const [keyword, gameId] of Object.entries(gameMapping)) {
      if (titleLower.includes(keyword)) {
        return gameId;
      }
    }
    
    return 'general-municipal-training';
  }

  private isMunicipalRequirement(courseTitle: string): boolean {
    const municipalKeywords = ['municipal', 'kommun', 'government', 'public sector', 'compliance'];
    const titleLower = courseTitle.toLowerCase();
    
    return municipalKeywords.some(keyword => titleLower.includes(keyword));
  }

  // Expert requirement: Digital certificate issuance
  async issueCertificate(
    completion: LearningCompletion,
    municipalTenantId: string
  ): Promise<CertificateResult> {
    try {
      const certificateData = {
        employeeId: completion.userId.split(':')[1],
        courseId: completion.gameId,
        completionDate: completion.completedAt,
        score: completion.score,
        issuer: 'DigiNativa Runtime Engine',
        municipalAuthority: municipalTenantId,
        culturalContext: completion.culturalContext
      };

      const certificate = await this.generateCertificate(certificateData);
      await this.uploadToWorkday(certificate);
      
      return {
        certificateId: certificate.id,
        downloadUrl: certificate.url,
        issuedAt: new Date().toISOString(),
        validUntil: this.calculateCertificateExpiry(completion.gameId)
      };
    } catch (error) {
      throw new MunicipalIntegrationError(`Certificate issuance failed: ${error.message}`);
    }
  }

  private async generateCertificate(data: any): Promise<any> {
    // Expert implementation: PDF certificate generation
    const certificate = {
      id: `cert_${Date.now()}`,
      url: `https://certificates.diginativa.eu/${data.employeeId}/${data.courseId}`,
      pdfData: await this.generateCertificatePDF(data)
    };
    
    return certificate;
  }

  private async generateCertificatePDF(data: any): Promise<Buffer> {
    // Expert requirement: Municipal-appropriate certificate design
    // Implementation: Use PDF generation library with municipal branding
    const pdfContent = `Municipal Training Certificate
    
Employee: ${data.employeeId}
Course: ${data.courseId}
Completion Date: ${data.completionDate}
Score: ${data.score}%
Municipal Authority: ${data.municipalAuthority}
Cultural Context: ${data.culturalContext}

This certificate verifies successful completion of municipal training requirements.`;
    
    return Buffer.from(pdfContent); // Placeholder - use actual PDF library
  }

  private async uploadToWorkday(certificate: any): Promise<void> {
    const auth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
    
    await fetch(`${this.apiUrl}/ccx/api/v1/${this.tenant}/certificates`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(certificate)
    });
  }

  private calculateCertificateExpiry(gameId: string): string {
    // Expert requirement: Municipal certificate validity periods
    const validityPeriods = {
      'gdpr-training': 12, // 1 year
      'ethics-training': 24, // 2 years
      'security-training': 6, // 6 months
      'default': 12
    };
    
    const months = validityPeriods[gameId] || validityPeriods.default;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + months);
    
    return expiry.toISOString();
  }
}

// Expert type definitions
interface SharePointConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  siteUrl: string;
}

interface SAPConfig {
  apiUrl: string;
  companyId: string;
  username: string;
  password: string;
}

interface WorkdayConfig {
  apiUrl: string;
  tenant: string;
  username: string;
  password: string;
}

interface LearningMaterial {
  id: string;
  name: string;
  url: string;
  type: string;
  municipalContext: string;
  lastModified: string;
  size: number;
}

interface CompletionCertificate {
  userId: string;
  gameId: string;
  score: number;
  completedAt: string;
  pdfData: Buffer;
  culturalContext?: string;
}

interface UploadResult {
  success: boolean;
  fileId: string;
  url: string;
  municipalContext: string;
}

interface Employee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  manager: string;
  location: string;
}

interface LearningProfile {
  userId: string;
  email: string;
  displayName: string;
  department: string;
  jobTitle: string;
  culturalContext: CulturalContext;
  learningPreferences: LearningPreferences;
  municipalRole: MunicipalRole;
  trainingRequirements: string[];
}

interface LearningCompletion {
  userId: string;
  gameId: string;
  score: number;
  completedAt: string;
  certificateUrl?: string;
  culturalContext?: CulturalContext;
}

interface EmployeeSyncResult {
  totalEmployees: number;
  syncedProfiles: number;
  municipalContext: string;
  syncTimestamp: string;
  culturalMapping: CulturalContext;
}

interface LearningPreferences {
  preferredDuration: string;
  informationDensity: string;
  assessmentStyle: string;
  feedbackLevel: string;
}

type CulturalContext = 'german_systematic' | 'french_collaborative' | 'dutch_progressive' | 'swedish_mobile';
type MunicipalRole = 'administrator' | 'manager' | 'specialist' | 'employee';

interface WorkdayAssignment {
  id: string;
  employeeId: string;
  courseTitle: string;
  dueDate: string;
  mandatory: boolean;
}

interface GameAssignment {
  workdayId: string;
  gameId: string;
  userId: string;
  dueDate: string;
  priority: string;
  culturalContext: CulturalContext;
  municipalRequirement: boolean;
}

interface AssignmentSyncResult {
  totalAssignments: number;
  mappedGames: number;
  municipalContext: string;
  syncTimestamp: string;
}

interface CertificateResult {
  certificateId: string;
  downloadUrl: string;
  issuedAt: string;
  validUntil: string;
}

// Expert implementations placeholders
class AlfrescoConnector {
  // Expert requirement: Alfresco document management integration
}

class DrupalConnector {
  // Expert requirement: Drupal municipal portal integration
}

class WordPressConnector {
  // Expert requirement: WordPress municipal website integration
}

class MunicipalIntegrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MunicipalIntegrationError';
  }
}