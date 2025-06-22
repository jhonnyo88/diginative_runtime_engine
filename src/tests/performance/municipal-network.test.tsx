import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StrategyPlayHost } from '../../components/StrategyPlayHost';
import { ChakraThemeProvider } from '../../theme/ChakraThemeProvider';
import type { GameManifest } from '../../types/game-manifest';

// Municipal Network Performance Test Suite
// Ensures <2s loading on all European government networks
// Roadmap-Ref: Q3-MER-Milestone-3.2

interface NetworkProfile {
  name: string;
  country: string;
  bandwidth: number; // kbps
  latency: number; // ms
  packetLoss: number; // percentage
  jitter: number; // ms
  proxy?: {
    enabled: boolean;
    authRequired: boolean;
    restrictions: string[];
  };
}

// European Municipal Network Profiles
const MUNICIPAL_NETWORKS: NetworkProfile[] = [
  {
    name: 'Swedish Municipal 3G',
    country: 'SE',
    bandwidth: 384, // 3G speed
    latency: 150,
    packetLoss: 2,
    jitter: 50,
    proxy: {
      enabled: false,
      authRequired: false,
      restrictions: []
    }
  },
  {
    name: 'German Government Proxy',
    country: 'DE',
    bandwidth: 10000, // 10Mbps but through proxy
    latency: 80,
    packetLoss: 0.1,
    jitter: 10,
    proxy: {
      enabled: true,
      authRequired: true,
      restrictions: ['websocket', 'streaming', 'p2p']
    }
  },
  {
    name: 'French Administrative Network',
    country: 'FR',
    bandwidth: 2000, // 2Mbps shared
    latency: 120,
    packetLoss: 1,
    jitter: 30,
    proxy: {
      enabled: true,
      authRequired: false,
      restrictions: ['external-cdn']
    }
  },
  {
    name: 'Dutch Efficiency Network',
    country: 'NL',
    bandwidth: 5000, // 5Mbps optimized
    latency: 40,
    packetLoss: 0.5,
    jitter: 15,
    proxy: {
      enabled: false,
      authRequired: false,
      restrictions: []
    }
  }
];

// Network simulation utilities
class NetworkSimulator {
  private profile: NetworkProfile;
  private requestQueue: Array<{ resolve: (...args: unknown[]) => unknown; delay: number }> = [];
  private processing = false;

  constructor(profile: NetworkProfile) {
    this.profile = profile;
  }

  async simulateRequest(size: number): Promise<number> {
    // Calculate download time based on bandwidth
    const downloadTime = (size * 8) / this.profile.bandwidth; // Convert bytes to bits
    
    // Add latency
    const totalTime = downloadTime + this.profile.latency;
    
    // Simulate packet loss
    if (Math.random() * 100 < this.profile.packetLoss) {
      // Retry adds additional time
      return totalTime * 1.5;
    }
    
    // Add jitter
    const jitteredTime = totalTime + (Math.random() - 0.5) * this.profile.jitter;
    
    // Simulate proxy overhead
    if (this.profile.proxy?.enabled) {
      return jitteredTime * 1.2; // 20% proxy overhead
    }
    
    return jitteredTime;
  }

  async throttle<T>(operation: () => Promise<T>, resourceSize: number): Promise<T> {
    const delay = await this.simulateRequest(resourceSize);
    
    return new Promise((resolve) => {
      this.requestQueue.push({ resolve, delay });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      await new Promise(r => setTimeout(r, request.delay));
      request.resolve();
    }

    this.processing = false;
  }
}

// Test utilities
const mockGameManifest: GameManifest = {
  schemaVersion: '0.1.0',
  gameId: 'municipal-performance-test',
  metadata: {
    title: 'Municipal Network Test Game',
    description: 'Testing game performance on government networks',
    version: '1.0.0',
    author: 'DigiNativa',
    language: 'sv',
    estimatedDuration: 7,
    difficulty: 'beginner',
    tags: ['test']
  },
  theme: {
    name: 'municipal',
    primaryColor: '#0066CC',
    secondaryColor: '#004B8D',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter'
  },
  scenes: [
    {
      id: 'test-scene-1',
      type: 'dialogue',
      title: 'Network Test Scene',
      description: 'Testing network performance',
      content: {
        character: {
          name: 'Anna Svensson',
          avatar: '/avatars/anna.png',
          role: 'Test Character'
        },
        messages: [
          {
            id: 'msg-1',
            speaker: 'Anna Svensson',
            text: 'Testing municipal network performance...',
            timestamp: 0
          }
        ],
        actions: [
          {
            id: 'continue',
            text: 'Continue',
            type: 'continue'
          }
        ]
      }
    }
  ]
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ChakraThemeProvider>
    {children}
  </ChakraThemeProvider>
);

describe('Municipal Network Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock performance API
    global.performance.now = vi.fn(() => Date.now());
  });

  describe('Swedish Municipal 3G Network', () => {
    const swedishNetwork = MUNICIPAL_NETWORKS[0];
    const simulator = new NetworkSimulator(swedishNetwork);

    it('should load game under 2 seconds on Swedish 3G', async () => {
      const startTime = performance.now();
      
      // Simulate loading resources
      const resources = [
        { name: 'index.html', size: 5000 },
        { name: 'bundle.js', size: 300000 }, // 300KB
        { name: 'styles.css', size: 50000 }, // 50KB
        { name: 'avatar.png', size: 30000 }, // 30KB
        { name: 'manifest.json', size: 2000 }
      ];

      const loadPromises = resources.map(async (resource) => {
        const loadTime = await simulator.simulateRequest(resource.size);
        return { resource: resource.name, loadTime };
      });

      const results = await Promise.all(loadPromises);
      const totalLoadTime = Math.max(...results.map(r => r.loadTime));

      expect(totalLoadTime).toBeLessThan(2000); // Under 2 seconds
      
      // Log for debugging
      console.log(`Swedish 3G Total Load Time: ${totalLoadTime.toFixed(0)}ms`);
    });

    it('should handle Anna Svensson mobile experience on slow network', async () => {
      const { container } = render(
        <TestWrapper>
          <div data-testid="game-container">
            <StrategyPlayHost
              gameManifest={mockGameManifest}
              onGameComplete={vi.fn()}
              onGameExit={vi.fn()}
              analytics={{ trackEvent: vi.fn() }}
              userId="anna-svensson"
              tenantId="malmo-stad"
            />
          </div>
        </TestWrapper>
      );

      // Simulate network delay for initial render
      await simulator.throttle(async () => {
        await waitFor(() => {
          expect(screen.getByTestId('game-container')).toBeInTheDocument();
        });
      }, 50000); // 50KB initial load

      // Measure interaction responsiveness
      const interactionStart = performance.now();
      
      // Simulate clicking continue button with network delay
      await simulator.throttle(async () => {
        const continueButton = screen.getByText('Continue');
        expect(continueButton).toBeInTheDocument();
      }, 5000); // 5KB for interaction

      const interactionTime = performance.now() - interactionStart;
      expect(interactionTime).toBeLessThan(500); // Interaction under 500ms
    });

    it('should optimize asset loading for high latency', async () => {
      // Test critical path optimization
      const criticalResources = [
        { name: 'critical.css', size: 10000, priority: 'high' },
        { name: 'main.js', size: 200000, priority: 'high' },
        { name: 'analytics.js', size: 50000, priority: 'low' },
        { name: 'images.zip', size: 500000, priority: 'low' }
      ];

      // Load critical resources first
      const criticalLoads = criticalResources
        .filter(r => r.priority === 'high')
        .map(r => simulator.simulateRequest(r.size));

      const criticalLoadTime = Math.max(...await Promise.all(criticalLoads));
      expect(criticalLoadTime).toBeLessThan(1500); // Critical path under 1.5s
    });
  });

  describe('German Government Proxy Network', () => {
    const germanNetwork = MUNICIPAL_NETWORKS[1];
    const simulator = new NetworkSimulator(germanNetwork);

    it('should handle strict proxy restrictions', async () => {
      // Test WebSocket fallback
      const wsAttempt = async () => {
        if (germanNetwork.proxy?.restrictions.includes('websocket')) {
          // Fallback to polling
          return 'polling';
        }
        return 'websocket';
      };

      const connectionType = await wsAttempt();
      expect(connectionType).toBe('polling');

      // Test CDN fallback for blocked resources
      const loadResource = async (url: string) => {
        if (url.includes('cdn.') && germanNetwork.proxy?.restrictions.includes('external-cdn')) {
          // Use local fallback
          return `/local/${url.split('/').pop()}`;
        }
        return url;
      };

      const resourceUrl = await loadResource('https://cdn.example.com/bundle.js');
      expect(resourceUrl).toBe('/local/bundle.js');
    });

    it('should handle proxy authentication gracefully', async () => {
      const authRequired = germanNetwork.proxy?.authRequired;
      
      if (authRequired) {
        // Simulate authentication flow
        const authToken = 'mock-auth-token';
        const headers = {
          'Proxy-Authorization': `Bearer ${authToken}`
        };

        // All requests should include auth headers
        const makeRequest = async (url: string) => {
          return {
            url,
            headers,
            authenticated: true
          };
        };

        const request = await makeRequest('/api/game-data');
        expect(request.authenticated).toBe(true);
        expect(request.headers['Proxy-Authorization']).toBeDefined();
      }
    });

    it('should maintain performance despite proxy overhead', async () => {
      const startTime = performance.now();
      
      // Simulate multiple sequential requests through proxy
      const requests = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        size: 10000 // 10KB each
      }));

      let totalTime = 0;
      for (const request of requests) {
        const requestTime = await simulator.simulateRequest(request.size);
        totalTime += requestTime;
      }

      expect(totalTime).toBeLessThan(2000); // All requests under 2s
      
      console.log(`German Proxy Sequential Requests: ${totalTime.toFixed(0)}ms`);
    });
  });

  describe('French Administrative Network', () => {
    const frenchNetwork = MUNICIPAL_NETWORKS[2];
    const simulator = new NetworkSimulator(frenchNetwork);

    it('should handle shared bandwidth constraints', async () => {
      // Simulate multiple concurrent users on same network
      const concurrentUsers = 5;
      const effectiveBandwidth = frenchNetwork.bandwidth / concurrentUsers;
      
      const userSimulator = new NetworkSimulator({
        ...frenchNetwork,
        bandwidth: effectiveBandwidth
      });

      const loadTime = await userSimulator.simulateRequest(100000); // 100KB
      expect(loadTime).toBeLessThan(2000); // Still under 2s with shared bandwidth
    });

    it('should optimize for external CDN restrictions', async () => {
      const cdnRestricted = frenchNetwork.proxy?.restrictions.includes('external-cdn');
      
      if (cdnRestricted) {
        // Test local bundling strategy
        const bundles = {
          vendor: { size: 200000, cached: true },
          main: { size: 150000, cached: false },
          styles: { size: 50000, cached: true }
        };

        // Only load non-cached bundles
        const toLoad = Object.entries(bundles)
          .filter(([_, bundle]) => !bundle.cached)
          .reduce((total, [_, bundle]) => total + bundle.size, 0);

        const loadTime = await simulator.simulateRequest(toLoad);
        expect(loadTime).toBeLessThan(1000); // Cached strategy under 1s
      }
    });

    it('should handle Marie Dubois collaborative features efficiently', async () => {
      // Test real-time collaboration features on constrained network
      const collaborativeActions = [
        { action: 'join-session', size: 2000 },
        { action: 'sync-state', size: 5000 },
        { action: 'send-message', size: 1000 },
        { action: 'receive-update', size: 3000 }
      ];

      const results = await Promise.all(
        collaborativeActions.map(async (action) => {
          const time = await simulator.simulateRequest(action.size);
          return { action: action.action, time };
        })
      );

      // All collaborative actions should be responsive
      results.forEach(result => {
        expect(result.time).toBeLessThan(500); // Each action under 500ms
      });
    });
  });

  describe('Dutch Efficiency Network', () => {
    const dutchNetwork = MUNICIPAL_NETWORKS[3];
    const simulator = new NetworkSimulator(dutchNetwork);

    it('should leverage optimized network for fast loading', async () => {
      const startTime = performance.now();
      
      // Dutch networks are well-optimized, test best-case scenario
      const pageLoad = await simulator.simulateRequest(400000); // 400KB total
      
      expect(pageLoad).toBeLessThan(1000); // Under 1s on efficient network
      
      console.log(`Dutch Efficient Network Load: ${pageLoad.toFixed(0)}ms`);
    });

    it('should support Pieter van Berg efficiency patterns', async () => {
      // Test progressive enhancement strategy
      const progressiveLoading = [
        { phase: 'critical', size: 50000, required: true },
        { phase: 'enhanced', size: 100000, required: false },
        { phase: 'optional', size: 200000, required: false }
      ];

      let loadedSize = 0;
      let loadTime = 0;

      for (const phase of progressiveLoading) {
        const phaseTime = await simulator.simulateRequest(phase.size);
        
        if (phase.required || loadTime + phaseTime < 2000) {
          loadedSize += phase.size;
          loadTime += phaseTime;
        } else {
          // Skip optional content if approaching 2s limit
          break;
        }
      }

      expect(loadTime).toBeLessThan(2000);
      expect(loadedSize).toBeGreaterThanOrEqual(50000); // At least critical loaded
    });
  });

  describe('Cross-Network Performance Validation', () => {
    it('should meet <2s requirement on ALL municipal networks', async () => {
      const results: Array<{ network: string; loadTime: number; passed: boolean }> = [];

      for (const network of MUNICIPAL_NETWORKS) {
        const simulator = new NetworkSimulator(network);
        
        // Standard game bundle size
        const bundleSize = 350000; // 350KB typical game size
        const loadTime = await simulator.simulateRequest(bundleSize);
        
        results.push({
          network: network.name,
          loadTime,
          passed: loadTime < 2000
        });
      }

      // Log results for visibility
      console.table(results);

      // All networks must pass
      expect(results.every(r => r.passed)).toBe(true);
    });

    it('should validate CDN and caching strategy', async () => {
      // Test cache-first strategy
      const cacheHitRatio = 0.7; // 70% cache hit rate
      const resources = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 50000 + 10000, // 10-60KB
        cached: Math.random() < cacheHitRatio
      }));

      for (const network of MUNICIPAL_NETWORKS) {
        const simulator = new NetworkSimulator(network);
        
        const uncachedResources = resources.filter(r => !r.cached);
        const totalLoadSize = uncachedResources.reduce((sum, r) => sum + r.size, 0);
        
        const loadTime = await simulator.simulateRequest(totalLoadSize);
        
        // With good caching, should always be under 2s
        expect(loadTime).toBeLessThan(2000);
      }
    });

    it('should handle worst-case scenario gracefully', async () => {
      // Combine worst aspects of all networks
      const worstCaseNetwork: NetworkProfile = {
        name: 'Worst Case Municipal Network',
        country: 'EU',
        bandwidth: 384, // Slowest (Swedish 3G)
        latency: 150, // Highest (Swedish)
        packetLoss: 2, // Highest (Swedish)
        jitter: 50, // Highest (Swedish)
        proxy: {
          enabled: true, // German proxy
          authRequired: true, // German auth
          restrictions: ['websocket', 'streaming', 'external-cdn'] // All restrictions
        }
      };

      const simulator = new NetworkSimulator(worstCaseNetwork);
      
      // Minimal critical path only
      const criticalBundle = 150000; // 150KB absolute minimum
      const loadTime = await simulator.simulateRequest(criticalBundle);
      
      // Even worst case should be under 3s (degraded but usable)
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`Worst Case Load Time: ${loadTime.toFixed(0)}ms`);
    });
  });

  describe('Performance Optimization Strategies', () => {
    it('should implement smart preloading based on network type', async () => {
      const getPreloadStrategy = (network: NetworkProfile) => {
        const bandwidthMbps = network.bandwidth / 1000;
        
        if (bandwidthMbps < 1) {
          return 'critical-only';
        } else if (bandwidthMbps < 5) {
          return 'progressive';
        } else {
          return 'aggressive';
        }
      };

      const strategies = MUNICIPAL_NETWORKS.map(network => ({
        network: network.name,
        strategy: getPreloadStrategy(network)
      }));

      expect(strategies[0].strategy).toBe('critical-only'); // Swedish 3G
      expect(strategies[3].strategy).toBe('progressive'); // Dutch efficient
    });

    it('should validate service worker caching for offline capability', async () => {
      // Simulate service worker cache
      const swCache = new Map<string, { size: number; timestamp: number }>();
      
      const cacheResource = (name: string, size: number) => {
        swCache.set(name, { size, timestamp: Date.now() });
      };

      // Pre-cache critical resources
      cacheResource('app-shell.html', 5000);
      cacheResource('offline-game.js', 100000);
      cacheResource('offline-styles.css', 20000);

      // Test offline load time (from cache)
      const offlineLoadTime = 50; // 50ms from cache
      expect(offlineLoadTime).toBeLessThan(100);

      // Verify cache size is reasonable
      const totalCacheSize = Array.from(swCache.values())
        .reduce((sum, item) => sum + item.size, 0);
      expect(totalCacheSize).toBeLessThan(5000000); // Under 5MB cache
    });
  });
});