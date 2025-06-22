/**
 * Enterprise SAML Provider Service
 * SAML 2.0 Service Provider implementation for municipal integration
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Business Impact: Unlocks €10M+ enterprise market
 */

import { SAML } from '@node-saml/node-saml';
import { type Request, type Response } from 'express';

export interface SAMLConfiguration {
  entityID: string;
  privateKey: string;
  cert: string;
  callbackUrl: string;
  entryPoint: string;
  issuer: string;
  identifierFormat?: string;
  signatureAlgorithm?: string;
  digestAlgorithm?: string;
}

export interface MunicipalTenant {
  id: string;
  name: string;
  country: 'SE' | 'DE' | 'FR' | 'NL';
  idpType: 'azure-ad' | 'okta' | 'adfs' | 'custom';
  samlConfig: SAMLConfiguration;
  brandingConfig: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    customDomain?: string;
  };
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface SAMLUser {
  nameID: string;
  sessionIndex: string;
  attributes: Record<string, string | string[]>;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  department?: string;
  municipality?: string;
  roles?: string[];
}

export interface SAMLAuthResult {
  success: boolean;
  user?: SAMLUser;
  error?: string;
  redirectUrl?: string;
  sessionId: string;
  tenantId: string;
}

class EnterpriseSAMLProvider {
  private tenants: Map<string, MunicipalTenant> = new Map();
  private samlInstances: Map<string, SAML> = new Map();
  private activeSessions: Map<string, SAMLUser> = new Map();

  constructor() {
    this.initializeDefaultTenants();
  }

  private initializeDefaultTenants(): void {
    // Swedish Municipality - Azure AD
    this.registerTenant({
      id: 'malmo_stad',
      name: 'Malmö Stad',
      country: 'SE',
      idpType: 'azure-ad',
      samlConfig: {
        entityID: 'diginativa-runtime-engine',
        privateKey: process.env.SAML_PRIVATE_KEY || '',
        cert: process.env.SAML_MALMO_CERT || '',
        callbackUrl: `${process.env.BASE_URL}/auth/saml/callback/malmo_stad`,
        entryPoint: process.env.SAML_MALMO_ENTRY_POINT || 'https://login.microsoftonline.com/malmo-tenant-id/saml2',
        issuer: 'diginativa-malmo',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
      },
      brandingConfig: {
        logoUrl: '/assets/logos/malmo-stad.svg',
        primaryColor: '#005580',
        secondaryColor: '#0080C7',
        customDomain: 'malmo.diginativa.se'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    });

    // German Municipality - Okta
    this.registerTenant({
      id: 'berlin_de',
      name: 'Stadt Berlin',
      country: 'DE',
      idpType: 'okta',
      samlConfig: {
        entityID: 'diginativa-runtime-engine',
        privateKey: process.env.SAML_PRIVATE_KEY || '',
        cert: process.env.SAML_BERLIN_CERT || '',
        callbackUrl: `${process.env.BASE_URL}/auth/saml/callback/berlin_de`,
        entryPoint: process.env.SAML_BERLIN_ENTRY_POINT || 'https://berlin-gov.okta.com/app/saml_app/exk123/sso/saml',
        issuer: 'diginativa-berlin',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
        signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
      },
      brandingConfig: {
        logoUrl: '/assets/logos/berlin-logo.svg',
        primaryColor: '#E30613',
        secondaryColor: '#000000',
        customDomain: 'berlin.diginativa.de'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    });

    // French Municipality - Azure AD
    this.registerTenant({
      id: 'paris_fr',
      name: 'Ville de Paris',
      country: 'FR',
      idpType: 'azure-ad',
      samlConfig: {
        entityID: 'diginativa-runtime-engine',
        privateKey: process.env.SAML_PRIVATE_KEY || '',
        cert: process.env.SAML_PARIS_CERT || '',
        callbackUrl: `${process.env.BASE_URL}/auth/saml/callback/paris_fr`,
        entryPoint: process.env.SAML_PARIS_ENTRY_POINT || 'https://login.microsoftonline.com/paris-tenant-id/saml2',
        issuer: 'diginativa-paris',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
      },
      brandingConfig: {
        logoUrl: '/assets/logos/paris-logo.svg',
        primaryColor: '#C5002E',
        secondaryColor: '#002654',
        customDomain: 'paris.diginativa.fr'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    });

    // Dutch Municipality - Okta
    this.registerTenant({
      id: 'amsterdam_nl',
      name: 'Gemeente Amsterdam',
      country: 'NL',
      idpType: 'okta',
      samlConfig: {
        entityID: 'diginativa-runtime-engine',
        privateKey: process.env.SAML_PRIVATE_KEY || '',
        cert: process.env.SAML_AMSTERDAM_CERT || '',
        callbackUrl: `${process.env.BASE_URL}/auth/saml/callback/amsterdam_nl`,
        entryPoint: process.env.SAML_AMSTERDAM_ENTRY_POINT || 'https://amsterdam-gov.okta.com/app/saml_app/exk456/sso/saml',
        issuer: 'diginativa-amsterdam',
        identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:emailAddress',
        signatureAlgorithm: 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
      },
      brandingConfig: {
        logoUrl: '/assets/logos/amsterdam-logo.svg',
        primaryColor: '#FF0000',
        secondaryColor: '#000000',
        customDomain: 'amsterdam.diginativa.nl'
      },
      isActive: true,
      createdAt: new Date().toISOString()
    });
  }

  public registerTenant(tenant: MunicipalTenant): void {
    this.tenants.set(tenant.id, tenant);
    
    // Create SAML instance for this tenant
    const samlInstance = new SAML(tenant.samlConfig);
    this.samlInstances.set(tenant.id, samlInstance);
    
    console.info(`Registered SAML tenant: ${tenant.name} (${tenant.id})`);
  }

  public getTenant(tenantId: string): MunicipalTenant | undefined {
    return this.tenants.get(tenantId);
  }

  public getAllTenants(): MunicipalTenant[] {
    return Array.from(this.tenants.values()).filter(tenant => tenant.isActive);
  }

  public async initiateLogin(tenantId: string): Promise<string> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    if (!tenant.isActive) {
      throw new Error(`Tenant is inactive: ${tenantId}`);
    }

    const samlInstance = this.samlInstances.get(tenantId);
    if (!samlInstance) {
      throw new Error(`SAML instance not configured for tenant: ${tenantId}`);
    }

    try {
      const loginUrl = await samlInstance.getAuthorizeUrl('', '');
      console.info(`Initiated SAML login for tenant ${tenantId}: ${loginUrl}`);
      return loginUrl;
    } catch (error) {
      console.error(`Failed to initiate SAML login for tenant ${tenantId}:`, error);
      throw new Error(`SAML login initiation failed: ${error.message}`);
    }
  }

  public async handleCallback(
    tenantId: string, 
    samlResponse: string, 
    relayState?: string
  ): Promise<SAMLAuthResult> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return {
        success: false,
        error: `Tenant not found: ${tenantId}`,
        sessionId: '',
        tenantId
      };
    }

    const samlInstance = this.samlInstances.get(tenantId);
    if (!samlInstance) {
      return {
        success: false,
        error: `SAML instance not configured for tenant: ${tenantId}`,
        sessionId: '',
        tenantId
      };
    }

    try {
      const result = await samlInstance.validatePostResponse({ SAMLResponse: samlResponse });
      
      if (!result || !result.profile) {
        return {
          success: false,
          error: 'Invalid SAML response',
          sessionId: '',
          tenantId
        };
      }

      const user: SAMLUser = {
        nameID: result.profile.nameID,
        sessionIndex: result.profile.sessionIndex || '',
        attributes: result.profile.attributes || {},
        email: this.extractAttribute(result.profile.attributes, 'email', 'emailaddress', 'mail'),
        displayName: this.extractAttribute(result.profile.attributes, 'displayname', 'name'),
        firstName: this.extractAttribute(result.profile.attributes, 'firstname', 'givenname'),
        lastName: this.extractAttribute(result.profile.attributes, 'lastname', 'surname'),
        department: this.extractAttribute(result.profile.attributes, 'department'),
        municipality: tenant.name,
        roles: this.extractRoles(result.profile.attributes, tenant)
      };

      const sessionId = this.generateSessionId();
      this.activeSessions.set(sessionId, user);

      // Update tenant last login
      tenant.lastLogin = new Date().toISOString();

      console.info(`Successful SAML authentication for ${user.email} in tenant ${tenantId}`);

      return {
        success: true,
        user,
        sessionId,
        tenantId,
        redirectUrl: relayState || '/dashboard'
      };
    } catch (error) {
      console.error(`SAML callback validation failed for tenant ${tenantId}:`, error);
      return {
        success: false,
        error: `Authentication failed: ${error.message}`,
        sessionId: '',
        tenantId
      };
    }
  }

  public async initiateLogout(
    tenantId: string, 
    sessionId: string, 
    nameID?: string
  ): Promise<string> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const samlInstance = this.samlInstances.get(tenantId);
    if (!samlInstance) {
      throw new Error(`SAML instance not configured for tenant: ${tenantId}`);
    }

    const user = this.activeSessions.get(sessionId);
    if (user) {
      try {
        const logoutUrl = await samlInstance.getLogoutUrl(user, '');
        
        // Remove session
        this.activeSessions.delete(sessionId);
        
        console.info(`Initiated SAML logout for session ${sessionId} in tenant ${tenantId}`);
        return logoutUrl;
      } catch (error) {
        console.error(`Failed to initiate SAML logout:`, error);
        // Fallback: just remove session
        this.activeSessions.delete(sessionId);
        return '/auth/logout/success';
      }
    }

    return '/auth/logout/success';
  }

  public getUser(sessionId: string): SAMLUser | undefined {
    return this.activeSessions.get(sessionId);
  }

  public isValidSession(sessionId: string): boolean {
    return this.activeSessions.has(sessionId);
  }

  public generateServiceProviderMetadata(tenantId: string): string {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const samlInstance = this.samlInstances.get(tenantId);
    if (!samlInstance) {
      throw new Error(`SAML instance not configured for tenant: ${tenantId}`);
    }

    return samlInstance.generateServiceProviderMetadata(tenant.samlConfig.cert, tenant.samlConfig.cert);
  }

  private extractAttribute(attributes: Record<string, unknown>, ...keys: string[]): string | undefined {
    if (!attributes) return undefined;
    
    for (const key of keys) {
      const value = attributes[key] || attributes[key.toLowerCase()] || attributes[key.toUpperCase()];
      if (value) {
        return Array.isArray(value) ? value[0] : value;
      }
    }
    
    return undefined;
  }

  private extractRoles(attributes: Record<string, unknown>, tenant: MunicipalTenant): string[] {
    const roles: string[] = [];
    
    // Extract roles from SAML attributes
    const roleAttributes = attributes?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
                          attributes?.role ||
                          attributes?.roles ||
                          attributes?.groups;
    
    if (roleAttributes) {
      const roleArray = Array.isArray(roleAttributes) ? roleAttributes : [roleAttributes];
      roles.push(...roleArray);
    }

    // Add default municipal role
    roles.push(`municipal_employee_${tenant.country.toLowerCase()}`);
    
    return roles;
  }

  private generateSessionId(): string {
    return `saml_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Admin methods for tenant management
  public async updateTenantConfig(tenantId: string, updates: Partial<MunicipalTenant>): Promise<boolean> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    // Update tenant configuration
    Object.assign(tenant, updates);
    
    // Recreate SAML instance if SAML config changed
    if (updates.samlConfig) {
      const samlInstance = new SAML(tenant.samlConfig);
      this.samlInstances.set(tenantId, samlInstance);
    }

    console.info(`Updated tenant configuration for ${tenantId}`);
    return true;
  }

  public deactivateTenant(tenantId: string): boolean {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return false;
    }

    tenant.isActive = false;
    
    // Remove all active sessions for this tenant
    const sessionsToRemove = Array.from(this.activeSessions.entries())
      .filter(([_, user]) => user.municipality === tenant.name)
      .map(([sessionId]) => sessionId);
    
    sessionsToRemove.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
    });

    console.info(`Deactivated tenant ${tenantId} and removed ${sessionsToRemove.length} sessions`);
    return true;
  }

  public getTenantStats(tenantId: string): {
    activeSessions: number;
    lastLogin?: string;
    totalLogins: number;
  } {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      return { activeSessions: 0, totalLogins: 0 };
    }

    const activeSessions = Array.from(this.activeSessions.values())
      .filter(user => user.municipality === tenant.name).length;

    return {
      activeSessions,
      lastLogin: tenant.lastLogin,
      totalLogins: 0 // TODO: Implement login tracking
    };
  }
}

// Create singleton instance
export const enterpriseSAMLProvider = new EnterpriseSAMLProvider();

// Export convenience methods
export const initiateSAMLLogin = (tenantId: string) => enterpriseSAMLProvider.initiateLogin(tenantId);
export const handleSAMLCallback = (tenantId: string, samlResponse: string, relayState?: string) => 
  enterpriseSAMLProvider.handleCallback(tenantId, samlResponse, relayState);
export const initiateSAMLLogout = (tenantId: string, sessionId: string, nameID?: string) =>
  enterpriseSAMLProvider.initiateLogout(tenantId, sessionId, nameID);
export const getSAMLUser = (sessionId: string) => enterpriseSAMLProvider.getUser(sessionId);
export const isValidSAMLSession = (sessionId: string) => enterpriseSAMLProvider.isValidSession(sessionId);