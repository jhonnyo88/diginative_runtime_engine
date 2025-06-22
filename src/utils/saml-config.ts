/**
 * SAML Configuration Utilities
 * Helper functions for SAML setup and validation
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Business Impact: Simplifies municipal IT admin configuration
 */

import type { SAMLConfiguration, MunicipalTenant } from '../services/enterprise-saml-provider';

export interface SwedishMunicipalityConfig {
  municipalityName: string;
  municipalityCode: string;
  region: string;
  azureAdTenantId: string;
  entityId: string;
  ssoUrl: string;
  sloUrl: string;
  x509Certificate: string;
  contactEmail: string;
  contactPhone: string;
  organizationName: string;
  organizationDisplayName: string;
  organizationUrl: string;
}

export const SWEDISH_MUNICIPALITIES: Record<string, SwedishMunicipalityConfig> = {
  malmo_stad: {
    municipalityName: 'Malmö Stad',
    municipalityCode: '1280',
    region: 'Skåne',
    azureAdTenantId: process.env.AZURE_AD_MALMO_TENANT_ID || 'malmo-tenant-id',
    entityId: 'https://login.microsoftonline.com/malmo-tenant-id',
    ssoUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_MALMO_TENANT_ID || 'malmo-tenant-id'}/saml2`,
    sloUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_MALMO_TENANT_ID || 'malmo-tenant-id'}/saml2`,
    x509Certificate: process.env.MALMO_X509_CERT || '',
    contactEmail: 'it-support@malmo.se',
    contactPhone: '+46 40 34 10 00',
    organizationName: 'Malmö Stad',
    organizationDisplayName: 'Malmö Stad',
    organizationUrl: 'https://malmo.se'
  },
  
  goteborg_stad: {
    municipalityName: 'Göteborgs Stad',
    municipalityCode: '1480',
    region: 'Västra Götaland',
    azureAdTenantId: process.env.AZURE_AD_GOTEBORG_TENANT_ID || 'goteborg-tenant-id',
    entityId: 'https://login.microsoftonline.com/goteborg-tenant-id',
    ssoUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_GOTEBORG_TENANT_ID || 'goteborg-tenant-id'}/saml2`,
    sloUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_GOTEBORG_TENANT_ID || 'goteborg-tenant-id'}/saml2`,
    x509Certificate: process.env.GOTEBORG_X509_CERT || '',
    contactEmail: 'it-support@goteborg.se',
    contactPhone: '+46 31 365 00 00',
    organizationName: 'Göteborgs Stad',
    organizationDisplayName: 'Göteborgs Stad',
    organizationUrl: 'https://goteborg.se'
  },
  
  stockholm_stad: {
    municipalityName: 'Stockholms Stad',
    municipalityCode: '0180',
    region: 'Stockholm',
    azureAdTenantId: process.env.AZURE_AD_STOCKHOLM_TENANT_ID || 'stockholm-tenant-id',
    entityId: 'https://login.microsoftonline.com/stockholm-tenant-id',
    ssoUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_STOCKHOLM_TENANT_ID || 'stockholm-tenant-id'}/saml2`,
    sloUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_STOCKHOLM_TENANT_ID || 'stockholm-tenant-id'}/saml2`,
    x509Certificate: process.env.STOCKHOLM_X509_CERT || '',
    contactEmail: 'it-support@stockholm.se',
    contactPhone: '+46 8 508 00 000',
    organizationName: 'Stockholms Stad',
    organizationDisplayName: 'Stockholms Stad',
    organizationUrl: 'https://stockholm.se'
  }
};

export interface SAMLSessionConfig {
  sessionTimeoutMinutes: number;
  allowedClockDrift: number;
  maxSessionsPerUser: number;
  requireEncryptedAssertions: boolean;
  forceAuthn: boolean;
  signRequests: boolean;
  signatureAlgorithm: string;
  digestAlgorithm: string;
}

export const DEFAULT_SAML_SESSION_CONFIG: SAMLSessionConfig = {
  sessionTimeoutMinutes: 480, // 8 hours
  allowedClockDrift: 300, // 5 minutes
  maxSessionsPerUser: 3,
  requireEncryptedAssertions: process.env.NODE_ENV === 'production',
  forceAuthn: false,
  signRequests: true,
  signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
};

export function generateSAMLConfiguration(municipalityId: string): SwedishMunicipalityConfig {
  const config = SWEDISH_MUNICIPALITIES[municipalityId];
  if (!config) {
    throw new Error(`Municipality configuration not found for: ${municipalityId}`);
  }
  return config;
}

export function validateMunicipalityConfig(config: SwedishMunicipalityConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.municipalityName?.trim()) {
    errors.push('Municipality name is required');
  }
  
  if (!config.municipalityCode?.trim()) {
    errors.push('Municipality code is required');
  }
  
  if (!config.azureAdTenantId?.trim()) {
    errors.push('Azure AD tenant ID is required');
  }
  
  if (!config.x509Certificate?.trim()) {
    errors.push('X.509 certificate is required');
  }
  
  if (!config.contactEmail?.trim() || !config.contactEmail.includes('@')) {
    errors.push('Valid contact email is required');
  }
  
  if (!config.organizationUrl?.trim() || !config.organizationUrl.startsWith('https://')) {
    errors.push('Valid organization URL is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getMunicipalityBranding(municipalityId: string): {
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
} {
  const brandingMap: Record<string, any> = {
    malmo_stad: {
      logoUrl: '/assets/logos/malmo-stad.svg',
      primaryColor: '#005580',
      secondaryColor: '#0080C7',
      customDomain: 'malmo.diginative.se'
    },
    goteborg_stad: {
      logoUrl: '/assets/logos/goteborg-stad.svg',
      primaryColor: '#0066CC',
      secondaryColor: '#003366',
      customDomain: 'goteborg.diginative.se'
    },
    stockholm_stad: {
      logoUrl: '/assets/logos/stockholm-stad.svg',
      primaryColor: '#004B87',
      secondaryColor: '#FFD700',
      customDomain: 'stockholm.diginative.se'
    }
  };
  
  return brandingMap[municipalityId] || {
    logoUrl: '/assets/logos/default-municipality.svg',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    customDomain: 'municipality.diginative.se'
  };
}

export interface SAMLConfigTemplate {
  name: string;
  description: string;
  idpType: 'azure-ad' | 'okta' | 'adfs' | 'custom';
  template: Partial<SAMLConfiguration>;
  requiredEnvVars: string[];
  setupInstructions: string[];
}

export interface SAMLValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingEnvVars: string[];
}

// Predefined SAML configuration templates for common IdPs
export const SAML_CONFIG_TEMPLATES: SAMLConfigTemplate[] = [
  {
    name: 'Microsoft Azure AD',
    description: 'Standard Azure AD SAML 2.0 configuration for Swedish municipalities',
    idpType: 'azure-ad',
    template: {
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
    },
    requiredEnvVars: [
      'SAML_PRIVATE_KEY',
      'SAML_{TENANT}_CERT', 
      'SAML_{TENANT}_ENTRY_POINT',
      'BASE_URL'
    ],
    setupInstructions: [
      '1. Log in to Azure AD Admin Center',
      '2. Navigate to Enterprise Applications > New Application',
      '3. Create custom SAML application',
      '4. Configure Basic SAML Configuration:',
      '   - Identifier: diginativa-runtime-engine',
      '   - Reply URL: {BASE_URL}/auth/saml/callback/{tenant_id}',
      '5. Download Certificate (Base64)',
      '6. Copy Sign on URL for entry point',
      '7. Configure user attributes and claims'
    ]
  },
  {
    name: 'Okta',
    description: 'Standard Okta SAML 2.0 configuration for German government',
    idpType: 'okta',
    template: {
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
    },
    requiredEnvVars: [
      'SAML_PRIVATE_KEY',
      'SAML_{TENANT}_CERT',
      'SAML_{TENANT}_ENTRY_POINT',
      'BASE_URL'
    ],
    setupInstructions: [
      '1. Log in to Okta Admin Console',
      '2. Navigate to Applications > Create App Integration',
      '3. Select SAML 2.0',
      '4. General Settings: Enter app name',
      '5. SAML Settings:',
      '   - Single sign on URL: {BASE_URL}/auth/saml/callback/{tenant_id}',
      '   - Audience URI: diginativa-runtime-engine',
      '6. Configure Attribute Statements',
      '7. Download X.509 Certificate',
      '8. Copy Identity Provider Single Sign-On URL'
    ]
  },
  {
    name: 'ADFS (Active Directory Federation Services)',
    description: 'ADFS SAML configuration for legacy government systems',
    idpType: 'adfs',
    template: {
      identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:windowsDomainQualifiedName',
      signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
      digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256'
    },
    requiredEnvVars: [
      'SAML_PRIVATE_KEY',
      'SAML_{TENANT}_CERT',
      'SAML_{TENANT}_ENTRY_POINT',
      'BASE_URL'
    ],
    setupInstructions: [
      '1. Open ADFS Management Console',
      '2. Add Relying Party Trust',
      '3. Import metadata or enter manually:',
      '   - Relying Party Identifier: diginativa-runtime-engine',
      '   - SAML 2.0 SSO URL: {BASE_URL}/auth/saml/callback/{tenant_id}',
      '4. Configure Claim Rules',
      '5. Export Token-Signing Certificate',
      '6. Note Federation Service Identifier URL'
    ]
  }
];

/**
 * Validates SAML configuration for a municipal tenant
 */
export function validateSAMLConfig(config: SAMLConfiguration, tenantId: string): SAMLValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missingEnvVars: string[] = [];

  // Required fields validation
  if (!config.entityID) {
    errors.push('Entity ID is required');
  }

  if (!config.callbackUrl) {
    errors.push('Callback URL is required');
  } else if (!isValidURL(config.callbackUrl)) {
    errors.push('Callback URL must be a valid HTTPS URL');
  }

  if (!config.entryPoint) {
    errors.push('IdP Entry Point URL is required');
  } else if (!isValidURL(config.entryPoint)) {
    errors.push('Entry Point must be a valid HTTPS URL');
  }

  if (!config.cert) {
    errors.push('IdP Certificate is required');
  } else if (!isValidX509Certificate(config.cert)) {
    errors.push('Invalid X.509 certificate format');
  }

  if (!config.privateKey) {
    missingEnvVars.push('SAML_PRIVATE_KEY');
  } else if (!isValidPrivateKey(config.privateKey)) {
    warnings.push('Private key format may be invalid');
  }

  // Security validation
  if (config.signatureAlgorithm && !isSupportedSignatureAlgorithm(config.signatureAlgorithm)) {
    warnings.push('Signature algorithm not recommended for security');
  }

  if (!config.signatureAlgorithm) {
    warnings.push('No signature algorithm specified - defaulting to SHA-256');
  }

  // URL validation for tenant-specific URLs
  if (config.callbackUrl && !config.callbackUrl.includes(tenantId)) {
    warnings.push('Callback URL should include tenant ID for proper routing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missingEnvVars
  };
}

/**
 * Generates environment variable template for a tenant
 */
export function generateEnvTemplate(tenantId: string, template?: SAMLConfigTemplate): string {
  const upperTenant = tenantId.toUpperCase();
  
  const envVars = [
    `# SAML Configuration for ${tenantId}`,
    `SAML_${upperTenant}_ENTRY_POINT=https://your-idp.com/saml/sso`,
    `SAML_${upperTenant}_CERT="-----BEGIN CERTIFICATE-----\\nYour IdP Certificate Here\\n-----END CERTIFICATE-----"`,
    '',
    '# Shared SAML Configuration (if not already set)',
    'SAML_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour Service Provider Private Key\\n-----END PRIVATE KEY-----"',
    'BASE_URL=https://your-domain.com',
    ''
  ];

  if (template) {
    envVars.push(`# Template: ${template.name}`);
    envVars.push(`# ${template.description}`);
    envVars.push('');
  }

  return envVars.join('\n');
}

/**
 * Generates Service Provider metadata XML for IdP configuration
 */
export function generateSPMetadataTemplate(
  tenantId: string, 
  entityId: string = 'diginativa-runtime-engine',
  baseUrl: string = process.env.BASE_URL || 'https://your-domain.com'
): string {
  const callbackUrl = `${baseUrl}/auth/saml/callback/${tenantId}`;
  const metadataUrl = `${baseUrl}/auth/saml/metadata/${tenantId}`;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" 
                     entityID="${entityId}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:KeyDescriptor use="signing">
      <ds:KeyInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#">
        <ds:X509Data>
          <ds:X509Certificate>
            <!-- Your Service Provider Certificate will be inserted here -->
          </ds:X509Certificate>
        </ds:X509Data>
      </ds:KeyInfo>
    </md:KeyDescriptor>
    <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:persistent</md:NameIDFormat>
    <md:AssertionConsumerService 
        Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
        Location="${callbackUrl}"
        index="0" />
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
}

/**
 * Creates a complete tenant configuration with validation
 */
export function createTenantConfig(
  tenantId: string,
  name: string,
  country: 'SE' | 'DE' | 'FR' | 'NL',
  idpType: 'azure-ad' | 'okta' | 'adfs' | 'custom',
  samlConfig: Partial<SAMLConfiguration>
): { tenant: MunicipalTenant; validation: SAMLValidationResult } {
  const template = SAML_CONFIG_TEMPLATES.find(t => t.idpType === idpType);
  const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
  
  const fullSamlConfig: SAMLConfiguration = {
    entityID: 'diginativa-runtime-engine',
    callbackUrl: `${baseUrl}/auth/saml/callback/${tenantId}`,
    issuer: `diginativa-${tenantId}`,
    privateKey: process.env.SAML_PRIVATE_KEY || '',
    cert: '',
    entryPoint: '',
    ...template?.template,
    ...samlConfig
  };

  const tenant: MunicipalTenant = {
    id: tenantId,
    name,
    country,
    idpType,
    samlConfig: fullSamlConfig,
    brandingConfig: {
      primaryColor: getDefaultPrimaryColor(country),
      secondaryColor: getDefaultSecondaryColor(country)
    },
    isActive: false, // Inactive until properly configured
    createdAt: new Date().toISOString()
  };

  const validation = validateSAMLConfig(fullSamlConfig, tenantId);

  return { tenant, validation };
}

/**
 * Helper functions
 */
function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidX509Certificate(cert: string): boolean {
  return cert.includes('-----BEGIN CERTIFICATE-----') && 
         cert.includes('-----END CERTIFICATE-----');
}

function isValidPrivateKey(key: string): boolean {
  return (key.includes('-----BEGIN PRIVATE KEY-----') && key.includes('-----END PRIVATE KEY-----')) ||
         (key.includes('-----BEGIN RSA PRIVATE KEY-----') && key.includes('-----END RSA PRIVATE KEY-----'));
}

function isSupportedSignatureAlgorithm(algorithm: string): boolean {
  const supportedAlgorithms = [
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha384',
    'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512'
  ];
  return supportedAlgorithms.includes(algorithm);
}

function getDefaultPrimaryColor(country: string): string {
  const colors = {
    SE: '#005580', // Swedish blue
    DE: '#000000', // German black
    FR: '#002654', // French blue
    NL: '#FF0000'  // Dutch red
  };
  return colors[country] || '#3B82F6';
}

function getDefaultSecondaryColor(country: string): string {
  const colors = {
    SE: '#0080C7', // Swedish light blue
    DE: '#E30613', // German red
    FR: '#C5002E', // French red
    NL: '#000000'  // Dutch black
  };
  return colors[country] || '#1E40AF';
}

/**
 * Test SAML configuration connectivity
 */
export async function testSAMLConnection(config: SAMLConfiguration): Promise<{
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}> {
  try {
    // Test IdP metadata endpoint
    if (config.entryPoint) {
      const metadataUrl = config.entryPoint.replace('/sso/saml', '/metadata') || config.entryPoint;
      
      const response = await fetch(metadataUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml'
        }
      });

      if (!response.ok) {
        throw new Error(`IdP metadata not accessible: ${response.status}`);
      }

      const metadata = await response.text();
      
      return {
        success: true,
        metadata: {
          accessible: true,
          contentType: response.headers.get('content-type'),
          size: metadata.length
        }
      };
    }

    return {
      success: false,
      error: 'No entry point configured for testing'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    };
  }
}