/**
 * SAML Authentication Routes
 * Enterprise SSO endpoints for municipal integration
 * 
 * Roadmap Ref: Q1-MER-Milestone-1.3
 * Business Impact: Unlocks €10M+ enterprise market
 */

import { Router, type Request, type Response } from 'express';
import { 
  enterpriseSAMLProvider,
  initiateSAMLLogin,
  handleSAMLCallback,
  initiateSAMLLogout,
  getSAMLUser,
  isValidSAMLSession,
  type MunicipalTenant,
  type SAMLAuthResult 
} from '../../../services/enterprise-saml-provider';


// Middleware for SAML session validation
const validateSAMLSession = (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.headers['x-saml-session-id'];
  const user = getSAMLUser(sessionId as string);
  
  if (!sessionId || !isValidSAMLSession(sessionId as string)) {
    return res.status(401).json({
      error: 'SAML authentication required',
      loginUrl: '/auth/saml/select-municipality'
    });
  }
  
  if (!user) {
    return res.status(401).json({
      error: 'Invalid SAML session',
      loginUrl: '/auth/saml/select-municipality'
    });
  }
  
  req.samlUser = user;
  req.samlSessionId = sessionId as string;
  next();
};

// GET /auth/saml/municipalities - List available municipalities for SSO
router.get('/municipalities', (req: Request, res: Response) => {
  try {

    res.json({
      success: true,
      municipalities,
      total: municipalities.length
    });
  } catch (error) {
    console.error('Failed to get municipalities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load municipalities'
    });
  }
});

// GET /auth/saml/login/:tenantId - Initiate SAML login for specific municipality
router.get('/login/:tenantId', async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const { returnUrl } = req.query;

  try {
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `Municipality not found: ${tenantId}`
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        success: false,
        error: `Municipality SSO is currently disabled: ${tenant.name}`
      });
    }

    // Store return URL in session for post-login redirect
    if (returnUrl && typeof returnUrl === 'string') {
      req.session = req.session || {};
      req.session.returnUrl = returnUrl;
    }

    
    // For API clients, return the URL
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        loginUrl,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          country: tenant.country
        }
      });
    } else {
      // For browser clients, redirect to IdP
      res.redirect(loginUrl);
    }
  } catch (error) {
    console.error(`SAML login initiation failed for tenant ${tenantId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate SAML login',
      details: error.message
    });
  }
});

// POST /auth/saml/callback/:tenantId - Handle SAML callback from IdP
router.post('/callback/:tenantId', async (req: Request, res: Response) => {
  const { tenantId } = req.params;
  const { SAMLResponse, RelayState } = req.body;

  if (!SAMLResponse) {
    return res.status(400).json({
      success: false,
      error: 'Missing SAML response'
    });
  }

  try {
    const result: SAMLAuthResult = await handleSAMLCallback(tenantId, SAMLResponse, RelayState);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error || 'SAML authentication failed'
      });
    }

    // Store session information
    req.session = req.session || {};
    req.session.samlSessionId = result.sessionId;
    req.session.tenantId = result.tenantId;
    req.session.userId = result.user?.email;

    delete req.session.returnUrl;

    // For API clients
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        user: {
          email: result.user?.email,
          displayName: result.user?.displayName,
          municipality: result.user?.municipality,
          roles: result.user?.roles
        },
        sessionId: result.sessionId,
        redirectUrl: returnUrl
      });
    } else {
      // For browser clients, redirect to application
      res.redirect(returnUrl);
    }
  } catch (error) {
    console.error(`SAML callback processing failed for tenant ${tenantId}:`, error);
    res.status(500).json({
      success: false,
      error: 'SAML authentication processing failed',
      details: error.message
    });
  }
});

// GET /auth/saml/logout - Initiate SAML logout
router.get('/logout', async (req: Request, res: Response) => {

  if (!sessionId || !tenantId) {
    return res.redirect('/auth/logout/success');
  }

  try {

    // Clear session
    req.session = null;

    // For API clients
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        logoutUrl
      });
    } else {
      // For browser clients, redirect to IdP logout
      res.redirect(logoutUrl);
    }
  } catch (error) {
    console.error('SAML logout failed:', error);
    
    // Clear session anyway
    req.session = null;
    
    res.status(500).json({
      success: false,
      error: 'Logout failed',
      fallbackUrl: '/auth/logout/success'
    });
  }
});

// GET /auth/saml/status - Check current SAML authentication status
router.get('/status', (req: Request, res: Response) => {

  if (!sessionId || !isValidSAMLSession(sessionId)) {
    return res.json({
      authenticated: false,
      loginUrl: '/auth/saml/select-municipality'
    });
  }


  res.json({
    authenticated: true,
    user: user ? {
      email: user.email,
      displayName: user.displayName,
      municipality: user.municipality,
      roles: user.roles,
      department: user.department
    } : null,
    tenant: tenant ? {
      id: tenant.id,
      name: tenant.name,
      country: tenant.country,
      branding: tenant.brandingConfig
    } : null,
    sessionId
  });
});

// GET /auth/saml/metadata/:tenantId - Service Provider metadata for IdP configuration
router.get('/metadata/:tenantId', (req: Request, res: Response) => {
  const { tenantId } = req.params;

  try {
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `Municipality not found: ${tenantId}`
      });
    }

    
    res.set('Content-Type', 'application/xml');
    res.send(metadata);
  } catch (error) {
    console.error(`Failed to generate metadata for tenant ${tenantId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate service provider metadata'
    });
  }
});

// Admin routes (require admin authentication)

// GET /auth/saml/admin/tenants - List all tenants with stats
adminRouter.get('/tenants', requireSAMLAuth, (req: Request, res: Response) => {
  // TODO: Add admin role check
  try {

    res.json({
      success: true,
      tenants,
      total: tenants.length
    });
  } catch (error) {
    console.error('Failed to get tenant list:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tenant information'
    });
  }
});

// PUT /auth/saml/admin/tenants/:tenantId - Update tenant configuration
adminRouter.put('/tenants/:tenantId', requireSAMLAuth, async (req: Request, res: Response) => {
  const { tenantId } = req.params;

  try {
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Tenant not found: ${tenantId}`
      });
    }

    
    res.json({
      success: true,
      tenant: updatedTenant
    });
  } catch (error) {
    console.error(`Failed to update tenant ${tenantId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tenant configuration'
    });
  }
});

// DELETE /auth/saml/admin/tenants/:tenantId - Deactivate tenant
adminRouter.delete('/tenants/:tenantId', requireSAMLAuth, (req: Request, res: Response) => {
  const { tenantId } = req.params;

  try {
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Tenant not found: ${tenantId}`
      });
    }

    res.json({
      success: true,
      message: `Tenant ${tenantId} has been deactivated`
    });
  } catch (error) {
    console.error(`Failed to deactivate tenant ${tenantId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate tenant'
    });
  }
});

// Mount admin routes
router.use('/admin', adminRouter);

export default router;

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      samlUser?: Record<string, unknown>;
      samlSessionId?: string;
    }
  }
}