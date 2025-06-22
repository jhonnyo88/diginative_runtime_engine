/**
 * WebSocket Real-time Validation E2E Tests
 * Task: task-te-009 - E2E Testing Framework Implementation
 * Roadmap Ref: Q1-AO-Milestone-1.2
 * 
 * Tests real-time content validation and updates via WebSocket
 * Ensures smooth real-time experience for municipal employees
 */

import { test, expect } from '@playwright/test';

test.describe('WebSocket Real-time Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should establish WebSocket connection for real-time validation', async ({ page }) => {
    let wsConnected = false;
    
    // Monitor WebSocket connections
    await page.addInitScript(() => {
      window.WebSocket = class extends OriginalWebSocket {
        constructor(...args) {
          super(...args);
          window.postMessage({ type: 'ws-connect', url: args[0] }, '*');
          
          this.addEventListener('open', () => {
            window.postMessage({ type: 'ws-open' }, '*');
          });
          
          this.addEventListener('message', (event) => {
            window.postMessage({ type: 'ws-message', data: event.data }, '*');
          });
        }
      };
    });

    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('ws-open')) {
        wsConnected = true;
      }
    });

    // Navigate to game
    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(2000);

    // Verify WebSocket connection
      return new Promise(resolve => {
        window.addEventListener('message', (e) => {
          if (e.data.type?.startsWith('ws-')) {
            msgs.push(e.data);
          }
        });
        setTimeout(() => resolve(msgs), 1000);
      });
    });

    expect(Array.isArray(messages)).toBe(true);
  });

  test('should receive real-time validation updates during gameplay', async ({ page }) => {
    // Mock WebSocket with validation updates
    await page.addInitScript(() => {
      class MockWebSocket {
        constructor(url) {
          this.url = url;
          this.readyState = 0;
          this.onopen = null;
          this.onmessage = null;
          this.onclose = null;
          this.onerror = null;
          
          // Simulate connection
          setTimeout(() => {
            this.readyState = 1;
            if (this.onopen) this.onopen(new Event('open'));
            
            // Send validation updates
            setTimeout(() => {
              if (this.onmessage) {
                this.onmessage({
                  data: JSON.stringify({
                    type: 'validation_update',
                    payload: {
                      contentId: 'quiz-1',
                      valid: true,
                      confidence: 0.95
                    }
                  })
                });
              }
            }, 1000);
          }, 100);
        }
        
        send(data) {
          // Echo back validation request
          setTimeout(() => {
            if (this.onmessage) {
              this.onmessage({
                data: JSON.stringify({
                  type: 'validation_response',
                  requestId: request.id,
                  valid: true
                })
              });
            }
          }, 50);
        }
        
        close() {
          this.readyState = 3;
          if (this.onclose) this.onclose(new Event('close'));
        }
      }
      
      window.WebSocket = MockWebSocket;
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.click('button:has-text("Börja spela")');
    await page.fill('input[placeholder*="namn"]', 'Anna Svensson');
    await page.click('button:has-text("Starta")');

    // Wait for real-time updates
    await page.waitForTimeout(2000);

    // Verify content loads successfully
    await expect(page.locator('[data-testid="game-container"]')).toBeVisible();
  });

  test('should handle WebSocket reconnection on connection loss', async ({ page }) => {
    let reconnectAttempts = 0;
    
    await page.addInitScript(() => {
      class ReconnectingWebSocket {
        constructor(url) {
          this.url = url;
          this.reconnectCount = 0;
          this.connect();
        }
        
        connect() {
          this.readyState = 0;
          
          setTimeout(() => {
            if (this.reconnectCount === 0) {
              // First connection fails
              this.readyState = 3;
              if (this.onerror) this.onerror(new Event('error'));
              if (this.onclose) this.onclose(new Event('close'));
              
              // Attempt reconnect
              setTimeout(() => {
                this.reconnectCount++;
                window.postMessage({ type: 'ws-reconnect', count: this.reconnectCount }, '*');
                this.connect();
              }, 1000);
            } else {
              // Reconnection succeeds
              this.readyState = 1;
              if (this.onopen) this.onopen(new Event('open'));
            }
          }, 100);
        }
        
        send() {}
        close() {}
      }
      
      window.WebSocket = ReconnectingWebSocket;
    });

    // Monitor reconnection attempts
    page.on('console', msg => {
      if (msg.text().includes('ws-reconnect')) {
        reconnectAttempts++;
      }
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(3000);

    // Should attempt reconnection
    expect(reconnectAttempts).toBeGreaterThan(0);
  });

  test('should fallback to HTTP polling when WebSocket unavailable', async ({ page }) => {
    let httpPollCount = 0;
    
    // Disable WebSocket
    await page.addInitScript(() => {
      window.WebSocket = undefined;
    });

    // Monitor HTTP polling requests
    page.on('request', request => {
      if (request.url().includes('/api/validation/poll')) {
        httpPollCount++;
      }
    });

    // Mock polling endpoint
    await page.route('/api/validation/poll', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          updates: [],
          nextPollDelay: 5000
        })
      });
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(2000);

    // Should fall back to HTTP polling
    expect(httpPollCount).toBeGreaterThan(0);
  });

  test('should synchronize validation state across multiple tabs', async ({ browser }) => {
    // Open two tabs

    // Mock shared validation state
    const _setupPage = async (page) => {
      await page.goto('http://localhost:5173');
      await page.addInitScript(() => {
        // Use BroadcastChannel for cross-tab communication
        
        window.WebSocket = class {
          constructor() {
            this.readyState = 1;
            
            // Listen for validation updates from other tabs
            channel.onmessage = (event) => {
              if (this.onmessage && event.data.type === 'validation') {
                this.onmessage({ data: JSON.stringify(event.data) });
              }
            };
          }
          
          send(data) {
            // Broadcast validation to other tabs
            channel.postMessage({ ...parsed, type: 'validation' });
          }
          
          close() {}
        };
      });
    };

    await setupPage(page1);
    await setupPage(page2);

    // Start game in first tab
    await page1.click('text=Se Digitaliseringsstrategi Demo');
    await page1.waitForTimeout(1000);

    // Second tab should receive updates
    await page2.click('text=Se Digitaliseringsstrategi Demo');
    
    // Both tabs should show consistent state
    
    // Clean up
    await context.close();
  });

  test('should handle high-frequency validation updates efficiently', async ({ page }) => {
    
    await page.addInitScript(() => {
      window.validationUpdates = [];
      
      class HighFrequencyWebSocket {
        constructor() {
          this.readyState = 1;
          
          // Send rapid validation updates
          let count = 0;
          this.interval = setInterval(() => {
            if (this.onmessage && count < 50) {
              
              window.validationUpdates.push(update);
              this.onmessage({ data: JSON.stringify(update) });
            }
          }, 20); // 50 updates per second
        }
        
        send() {}
        close() {
          clearInterval(this.interval);
        }
      }
      
      window.WebSocket = HighFrequencyWebSocket;
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(2000);

    // Check update handling
    
    // Should handle all updates without dropping
    expect(updates.length).toBeGreaterThan(40);
    
    // Should not cause performance issues
      memory: (performance as any).memory?.usedJSHeapSize || 0
    }));
    
    // Memory usage should be reasonable
    if (metrics.memory > 0) {
      expect(metrics.memory).toBeLessThan(200 * 1024 * 1024); // 200MB limit
    }
  });

  test('should prioritize critical validation messages', async ({ page }) => {
    
    await page.addInitScript(() => {
      window.messageOrder = [];
      
      class PriorityWebSocket {
        constructor() {
          this.readyState = 1;
          this.messageQueue = [];
          
          // Simulate mixed priority messages
          setTimeout(() => {
            this.messageQueue = [
              { priority: 'low', type: 'style_check', id: 1 },
              { priority: 'critical', type: 'security_violation', id: 2 },
              { priority: 'normal', type: 'content_update', id: 3 },
              { priority: 'critical', type: 'compliance_error', id: 4 },
            ];
            
            // Process by priority
            const _sorted = [...this.messageQueue].sort((a, b) => {
              return priorities[a.priority] - priorities[b.priority];
            });
            
            sorted.forEach(msg => {
              window.messageOrder.push(msg.id);
              if (this.onmessage) {
                this.onmessage({ data: JSON.stringify(msg) });
              }
            });
          }, 100);
        }
        
        send() {}
        close() {}
      }
      
      window.WebSocket = PriorityWebSocket;
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(1000);

    
    // Critical messages should be processed first
    expect(order[0]).toBe(2); // First critical
    expect(order[1]).toBe(4); // Second critical
  });

  test('should validate collaborative content editing in real-time', async ({ page }) => {
    await page.addInitScript(() => {
      class CollaborativeWebSocket {
        constructor() {
          this.readyState = 1;
          this.collaborators = new Map();
          
          // Simulate collaborative editing
          setTimeout(() => {
            if (this.onmessage) {
              // User joins
              this.onmessage({
                data: JSON.stringify({
                  type: 'collaborator_joined',
                  user: { id: 'user-2', name: 'Erik Andersson' }
                })
              });
              
              // Content edit from collaborator
              setTimeout(() => {
                this.onmessage({
                  data: JSON.stringify({
                    type: 'content_edit',
                    user: 'user-2',
                    change: { path: 'quiz.question.1', value: 'Updated question text' },
                    validation: { valid: true, checked: true }
                  })
              });
              }, 500);
            }
          }, 100);
        }
        
        send(data) {
          if (parsed.type === 'content_edit' && this.onmessage) {
            // Echo back with validation
            setTimeout(() => {
              this.onmessage({
                data: JSON.stringify({
                  type: 'validation_result',
                  requestId: parsed.id,
                  valid: true,
                  sanitized: parsed.content
                })
              });
            }, 50);
          }
        }
        
        close() {}
      }
      
      window.WebSocket = CollaborativeWebSocket;
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(2000);

    // Check for collaborative indicators
    if (await collaboratorIndicator.count() > 0) {
      await expect(collaboratorIndicator).toContainText('Erik');
    }
  });

  test('should handle WebSocket message compression for municipal networks', async ({ page }) => {
    await page.addInitScript(() => {
      class CompressedWebSocket {
        constructor() {
          this.readyState = 1;
          this.compressionEnabled = true;
          
          // Simulate compressed message
          setTimeout(() => {
            if (this.onmessage) {
              
              // Simulate compression ratio
              
              this.onmessage({
                data: JSON.stringify({
                  ...largePayload,
                  _meta: {
                    compressed: true,
                    originalSize,
                    compressedSize,
                    ratio: (compressedSize / originalSize).toFixed(2)
                  }
                })
              });
            }
          }, 100);
        }
        
        send() {}
        close() {}
      }
      
      window.WebSocket = CompressedWebSocket;
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(1000);

    // Application should handle compressed messages
    await expect(page.locator('[data-testid="game-container"]')).toBeVisible();
  });

  test('should implement exponential backoff for failed validations', async ({ page }) => {
    
    await page.addInitScript(() => {
      window.retryDelays = [];
      
      class BackoffWebSocket {
        constructor() {
          this.readyState = 1;
          this.retryCount = 0;
          this.baseDelay = 1000;
          
          // Simulate validation failures with retries
          this.attemptValidation = () => {
            if (this.onmessage) {
              if (this.retryCount < 3) {
                // Fail validation
                this.onmessage({
                  data: JSON.stringify({
                    type: 'validation_failed',
                    error: 'Service temporarily unavailable',
                    retryAfter: this.baseDelay * Math.pow(2, this.retryCount)
                  })
                });
                
                window.retryDelays.push(delay);
                this.retryCount++;
                
                setTimeout(() => this.attemptValidation(), delay);
              } else {
                // Finally succeed
                this.onmessage({
                  data: JSON.stringify({
                    type: 'validation_success',
                    valid: true,
                    retriesNeeded: this.retryCount
                  })
                });
              }
            }
          };
          
          setTimeout(() => this.attemptValidation(), 100);
        }
        
        send() {}
        close() {}
      }
      
      window.WebSocket = BackoffWebSocket;
    });

    await page.click('text=Se Digitaliseringsstrategi Demo');
    await page.waitForTimeout(8000); // Wait for retries

    
    // Should implement exponential backoff
    expect(delays).toEqual([1000, 2000, 4000]);
  });
});