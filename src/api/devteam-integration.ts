/**
 * DevTeam Integration API
 * Automated pipeline for AI-generated content to deployed municipal games
 * Target: 90% automation from content submission to game deployment
 * Processing time: <30 minutes JSON to deployed game
 */

import { z } from 'zod';
import { validateGameManifest } from '../utils/contentValidation';
import { applyMunicipalBrandingToManifest, validateMunicipalBranding, getMunicipalContext } from '../utils/municipalBranding';
import { processGameManifestWithPlayerName } from '../utils/playerNameReplacement';

// Processing status tracking
export enum ProcessingStatus {
  RECEIVED = 'received',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  BRANDING = 'branding',
  PACKAGING = 'packaging',
  DEPLOYING = 'deploying',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Deployment formats
export enum DeploymentFormat {
  WEB = 'web',
  SCORM = 'scorm',
  PWA = 'pwa'
}

// Municipal markets
export enum MunicipalMarket {
  SWEDEN = 'sweden',
  GERMANY = 'germany',
  FRANCE = 'france',
  NETHERLANDS = 'netherlands'
}

// Processing result
export interface ProcessingResult {
  jobId: string;
  status: ProcessingStatus;
  progress: number; // 0-100
  message: string;
  startTime: string;
  endTime?: string;
  deploymentUrls?: {
    web?: string;
    scorm?: string;
    pwa?: string;
  };
  errors?: string[];
}

// Content submission request schema
export const ContentSubmissionSchema = z.object({
  gameManifest: z.object({
    gameId: z.string(),
    metadata: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string(),
      duration: z.string(),
      difficulty: z.string(),
      tags: z.array(z.string()),
      learningObjectives: z.array(z.string()),
      targetAudience: z.string(),
      language: z.string(),
      version: z.string()
    }),
    scenes: z.array(z.any()), // Validated by contentValidation
    theme: z.any().optional()
  }),
  deploymentOptions: z.object({
    formats: z.array(z.nativeEnum(DeploymentFormat)),
    markets: z.array(z.nativeEnum(MunicipalMarket)),
    municipalityId: z.string(),
    brandingLevel: z.enum(['minimal', 'standard', 'full']).default('standard')
  }),
  processingOptions: z.object({
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
    webhookUrl: z.string().url().optional(),
    dryRun: z.boolean().default(false)
  }).optional()
});

export type ContentSubmissionRequest = z.infer<typeof ContentSubmissionSchema>;

// Processing job tracking
const processingJobs = new Map<string, ProcessingResult>();

/**
 * Submit content for processing
 * POST /api/v1/process-content
 */
export async function submitContent(request: ContentSubmissionRequest): Promise<ProcessingResult> {
  const jobId = generateJobId();
  const startTime = new Date().toISOString();
  
  // Initialize job tracking
  const job: ProcessingResult = {
    jobId,
    status: ProcessingStatus.RECEIVED,
    progress: 0,
    message: 'Content received, starting validation',
    startTime
  };
  
  processingJobs.set(jobId, job);
  
  // Start async processing
  processContentAsync(jobId, request).catch(error => {
    updateJobStatus(jobId, ProcessingStatus.FAILED, 0, `Processing failed: ${error.message}`, [error.message]);
  });
  
  return job;
}

/**
 * Get processing status
 * GET /api/v1/process-content/:jobId
 */
export async function getProcessingStatus(jobId: string): Promise<ProcessingResult | null> {
  return processingJobs.get(jobId) || null;
}

/**
 * Get all active jobs
 * GET /api/v1/process-content
 */
export async function getAllJobs(): Promise<ProcessingResult[]> {
  return Array.from(processingJobs.values());
}

/**
 * Async content processing pipeline
 */
async function processContentAsync(jobId: string, request: ContentSubmissionRequest): Promise<void> {
  try {
    // Step 1: Validation (<5s)
    updateJobStatus(jobId, ProcessingStatus.VALIDATING, 10, 'Validating content structure');
    const validationResult = await validateContent(request.gameManifest);
    
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Step 2: Content processing
    updateJobStatus(jobId, ProcessingStatus.PROCESSING, 30, 'Processing game content');
    const processedManifest = await processGameContent(request.gameManifest);
    
    // Step 3: Municipal branding injection
    updateJobStatus(jobId, ProcessingStatus.BRANDING, 50, 'Applying municipal branding');
    const brandedManifest = await applyMunicipalBranding(
      processedManifest,
      request.deploymentOptions.municipalityId,
      request.deploymentOptions.brandingLevel
    );
    
    // Step 4: Multi-format packaging
    updateJobStatus(jobId, ProcessingStatus.PACKAGING, 70, 'Creating deployment packages');
    const packages = await createDeploymentPackages(
      brandedManifest,
      request.deploymentOptions.formats
    );
    
    // Step 5: Deployment
    updateJobStatus(jobId, ProcessingStatus.DEPLOYING, 90, 'Deploying to municipal infrastructure');
    const deploymentUrls = await deployPackages(
      packages,
      request.deploymentOptions
    );
    
    // Step 6: Complete
    updateJobStatus(
      jobId, 
      ProcessingStatus.COMPLETED, 
      100, 
      'Game successfully deployed',
      [],
      deploymentUrls
    );
    
    // Webhook notification if provided
    if (request.processingOptions?.webhookUrl) {
      await notifyWebhook(request.processingOptions.webhookUrl, processingJobs.get(jobId)!);
    }
    
  } catch (error: any) {
    updateJobStatus(jobId, ProcessingStatus.FAILED, 0, `Processing failed: ${error.message}`, [error.message]);
    throw error;
  }
}

/**
 * Validate game content with <5s feedback
 */
async function validateContent(gameManifest: any): Promise<{isValid: boolean; errors: string[]}> {
  const startTime = Date.now();
  
  try {
    const validation = validateGameManifest(gameManifest);
    
    // Ensure <5s feedback
    const elapsed = Date.now() - startTime;
    if (elapsed > 5000) {
      console.warn(`Validation took ${elapsed}ms, exceeding 5s target`);
    }
    
    return validation;
  } catch (error: any) {
    return { isValid: false, errors: [error.message] };
  }
}

/**
 * Process game content (enhance, optimize, prepare)
 */
async function processGameContent(gameManifest: any): Promise<any> {
  // Add player name placeholders
  const processedManifest = { ...gameManifest };
  
  // Process each scene
  processedManifest.scenes = processedManifest.scenes.map((scene: any) => {
    // Ensure scene has proper structure
    return {
      ...scene,
      processed: true,
      processingTimestamp: new Date().toISOString()
    };
  });
  
  return processedManifest;
}

/**
 * Apply municipal branding based on municipality and level
 */
async function applyMunicipalBranding(
  gameManifest: any,
  municipalityId: string,
  brandingLevel: string
): Promise<any> {
  // Get municipal branding configuration
  const municipalBranding = getMunicipalBranding(municipalityId);
  
  // Validate branding configuration
  const brandingValidation = validateMunicipalBranding(municipalBranding);
  if (!brandingValidation.isValid) {
    throw new Error(`Invalid municipal branding: ${brandingValidation.errors.join(', ')}`);
  }
  
  // Apply branding to manifest
  const brandedManifest = applyMunicipalBrandingToManifest(
    gameManifest,
    {
      ...brandingValidation.sanitizedBranding,
      brandingLevel
    }
  );
  
  return brandedManifest;
}

/**
 * Create deployment packages for different formats
 */
async function createDeploymentPackages(
  gameManifest: any,
  formats: DeploymentFormat[]
): Promise<Map<DeploymentFormat, any>> {
  const packages = new Map<DeploymentFormat, any>();
  
  for (const format of formats) {
    switch (format) {
      case DeploymentFormat.WEB:
        packages.set(format, await createWebPackage(gameManifest));
        break;
      case DeploymentFormat.SCORM:
        packages.set(format, await createSCORMPackage(gameManifest));
        break;
      case DeploymentFormat.PWA:
        packages.set(format, await createPWAPackage(gameManifest));
        break;
    }
  }
  
  return packages;
}

/**
 * Deploy packages to infrastructure
 */
async function deployPackages(
  packages: Map<DeploymentFormat, any>,
  options: ContentSubmissionRequest['deploymentOptions']
): Promise<ProcessingResult['deploymentUrls']> {
  const deploymentUrls: ProcessingResult['deploymentUrls'] = {};
  
  for (const [format, packageData] of packages) {
    const url = await deployToInfrastructure(format, packageData, options);
    deploymentUrls[format] = url;
  }
  
  return deploymentUrls;
}

/**
 * Helper functions
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

function updateJobStatus(
  jobId: string,
  status: ProcessingStatus,
  progress: number,
  message: string,
  errors?: string[],
  deploymentUrls?: ProcessingResult['deploymentUrls']
): void {
  const job = processingJobs.get(jobId);
  if (!job) return;
  
  job.status = status;
  job.progress = progress;
  job.message = message;
  
  if (errors) {
    job.errors = errors;
  }
  
  if (deploymentUrls) {
    job.deploymentUrls = deploymentUrls;
  }
  
  if (status === ProcessingStatus.COMPLETED || status === ProcessingStatus.FAILED) {
    job.endTime = new Date().toISOString();
  }
  
  processingJobs.set(jobId, job);
}

/**
 * Get municipal branding configuration
 */
function getMunicipalBranding(municipalityId: string): any {
  // Municipal branding database integration
  const municipalityBrandings: Record<string, any> = {
    'malmo': {
      municipality: 'Malmö Stad',
      primaryColor: '#005293',
      secondaryColor: '#E6F3FF',
      logoUrl: 'https://malmo.se/images/malmo-logo.svg',
      culturalContext: 'swedish',
      brandingConfig: {
        fontFamily: 'Inter, -apple-system, sans-serif',
        borderRadius: '8px',
        spacing: 'standard'
      }
    },
    'stockholm': {
      municipality: 'Stockholms Stad',
      primaryColor: '#006633',
      secondaryColor: '#E8F5E9',
      logoUrl: 'https://stockholm.se/images/stockholm-logo.svg',
      culturalContext: 'swedish',
      brandingConfig: {
        fontFamily: 'Inter, sans-serif',
        borderRadius: '4px',
        spacing: 'compact'
      }
    },
    'gothenburg': {
      municipality: 'Göteborgs Stad',
      primaryColor: '#004B8D',
      secondaryColor: '#E3F2FD',
      logoUrl: 'https://goteborg.se/images/goteborg-logo.svg',
      culturalContext: 'swedish',
      brandingConfig: {
        fontFamily: 'Inter, sans-serif',
        borderRadius: '8px',
        spacing: 'spacious'
      }
    },
    'berlin': {
      municipality: 'Stadt Berlin',
      primaryColor: '#E3000F',
      secondaryColor: '#FFEBEE',
      logoUrl: 'https://berlin.de/images/berlin-logo.svg',
      culturalContext: 'german',
      brandingConfig: {
        fontFamily: 'Inter, sans-serif',
        borderRadius: '4px',
        spacing: 'compact'
      }
    },
    'paris': {
      municipality: 'Ville de Paris',
      primaryColor: '#004494',
      secondaryColor: '#E3F2FD',
      logoUrl: 'https://paris.fr/images/paris-logo.svg',
      culturalContext: 'french',
      brandingConfig: {
        fontFamily: 'Inter, Georgia, serif',
        borderRadius: '12px',
        spacing: 'spacious'
      }
    },
    'amsterdam': {
      municipality: 'Gemeente Amsterdam',
      primaryColor: '#EC0000',
      secondaryColor: '#FFEBEE',
      logoUrl: 'https://amsterdam.nl/images/amsterdam-logo.svg',
      culturalContext: 'dutch',
      brandingConfig: {
        fontFamily: 'Inter, sans-serif',
        borderRadius: '6px',
        spacing: 'standard'
      }
    }
  };
  
  // Normalize municipality ID
  const normalizedId = municipalityId.toLowerCase().replace(/[\s-_]/g, '');
  
  // Get branding or determine from context
  const branding = municipalityBrandings[normalizedId];
  if (branding) {
    return branding;
  }
  
  // Fallback: determine cultural context from ID
  const culturalContext = getMunicipalContext(municipalityId);
  
  return {
    municipality: municipalityId,
    primaryColor: '#005AA0',
    secondaryColor: '#E6F3FF',
    culturalContext,
    brandingConfig: {
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      spacing: 'standard'
    }
  };
}

/**
 * Package creation functions (stubs for now)
 */
async function createWebPackage(gameManifest: any): Promise<any> {
  // Web deployment package
  const webPackage = {
    type: 'web',
    manifest: gameManifest,
    deployment: {
      format: 'static-site',
      entry: 'index.html',
      assets: [
        'runtime-engine.js',
        'game-manifest.json',
        'assets/**/*'
      ],
      buildConfig: {
        minify: true,
        optimize: true,
        lighthouse: {
          performance: 95,
          accessibility: 100,
          bestPractices: 95,
          seo: 90
        }
      }
    },
    municipalConfig: {
      branding: gameManifest.theme?.municipalMetadata,
      analytics: {
        provider: 'matomo',
        siteId: gameManifest.theme?.municipalMetadata?.municipality
      }
    }
  };
  
  return webPackage;
}

async function createSCORMPackage(gameManifest: any): Promise<any> {
  // SCORM 2004 package for LMS integration
  const scormPackage = {
    type: 'scorm',
    manifest: gameManifest,
    scormVersion: '2004 4th Edition',
    deployment: {
      format: 'scorm-package',
      entry: 'index.html',
      manifestFile: 'imsmanifest.xml',
      metadata: {
        identifier: `com.diginativa.${gameManifest.gameId}`,
        title: gameManifest.metadata.title,
        description: gameManifest.metadata.description,
        masteryScore: 80,
        maxTimeAllowed: 'PT0H30M0S', // 30 minutes
        completionThreshold: 0.8
      },
      tracking: {
        scoreTracking: true,
        progressTracking: true,
        interactionTracking: true,
        objectiveTracking: true
      }
    },
    lmsCompatibility: {
      moodle: true,
      cornerstone: true,
      successFactors: true,
      workday: true
    }
  };
  
  return scormPackage;
}

async function createPWAPackage(gameManifest: any): Promise<any> {
  // Progressive Web App package
  const pwaPackage = {
    type: 'pwa',
    manifest: gameManifest,
    deployment: {
      format: 'progressive-web-app',
      entry: 'index.html',
      serviceWorker: 'sw.js',
      webManifest: {
        name: gameManifest.metadata.title,
        short_name: gameManifest.metadata.title.substring(0, 12),
        description: gameManifest.metadata.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: gameManifest.theme?.colors?.primary || '#005AA0',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      offlineSupport: {
        strategy: 'cache-first',
        cacheAssets: true,
        cacheApi: false,
        offlinePage: '/offline.html'
      },
      installPrompt: {
        enabled: true,
        timing: 'after-engagement',
        customMessage: `Installera ${gameManifest.metadata.title} för att spela offline`
      }
    },
    features: {
      pushNotifications: false,
      backgroundSync: false,
      webShare: true,
      installable: true
    }
  };
  
  return pwaPackage;
}

async function deployToInfrastructure(
  format: DeploymentFormat,
  packageData: any,
  options: any
): Promise<string> {
  // Multi-region deployment strategy
  const deploymentRegions = {
    sweden: 'eu-north-1',
    germany: 'eu-central-1',
    france: 'eu-west-3',
    netherlands: 'eu-west-1'
  };
  
  // Determine deployment region based on markets
  const primaryMarket = options.markets[0] || 'sweden';
  const region = deploymentRegions[primaryMarket as keyof typeof deploymentRegions];
  
  // Generate deployment URL based on format
  const baseUrl = 'https://games.diginativa.se';
  const municipalityPath = options.municipalityId.toLowerCase();
  const gamePath = packageData.manifest.gameId;
  
  let deploymentUrl: string;
  
  switch (format) {
    case DeploymentFormat.WEB:
      deploymentUrl = `${baseUrl}/${municipalityPath}/${gamePath}/`;
      break;
      
    case DeploymentFormat.SCORM:
      deploymentUrl = `${baseUrl}/scorm/${municipalityPath}/${gamePath}/scorm-package.zip`;
      break;
      
    case DeploymentFormat.PWA:
      deploymentUrl = `${baseUrl}/apps/${municipalityPath}/${gamePath}/`;
      break;
      
    default:
      deploymentUrl = `${baseUrl}/${municipalityPath}/${gamePath}/${format}`;
  }
  
  // Simulate deployment process
  console.log(`Deploying ${format} package to ${region}:`, deploymentUrl);
  
  // In production, this would:
  // 1. Upload to CDN (CloudFront/Fastly)
  // 2. Configure edge locations
  // 3. Set up SSL certificates
  // 4. Configure caching policies
  // 5. Set up monitoring/analytics
  
  return deploymentUrl;
}

async function notifyWebhook(url: string, result: ProcessingResult): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });
  } catch (error) {
    console.error('Webhook notification failed:', error);
  }
}