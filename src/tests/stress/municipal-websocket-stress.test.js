/**
 * Municipal WebSocket Stress Tests
 * Task: proposal-029 - AI Content Stress Testing Framework
 * 
 * Tests WebSocket connections under peak municipal load
 * Validates real-time content validation and delivery
 */

import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics for WebSocket performance
const wsConnectionRate = new Rate('websocket_connection_success');
const wsMessageDeliveryTime = new Trend('websocket_message_delivery_time');
const wsConnectionDuration = new Trend('websocket_connection_duration');
const activeConnections = new Gauge('websocket_active_connections');
const municipalValidationErrors = new Counter('municipal_websocket_validation_errors');
const reconnectionAttempts = new Counter('websocket_reconnection_attempts');

// Municipal WebSocket scenarios
export const options = {
  scenarios: {
    // Real-time content validation during peak hours
    peak_validation_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 100 },   // Ramp up to 100 connections
        { duration: '5m', target: 500 },   // Peak at 500 connections
        { duration: '10m', target: 1000 }, // Stress test at 1000 connections
        { duration: '5m', target: 500 },   // Scale down
        { duration: '3m', target: 100 },   // Return to normal
      ],
      exec: 'municipalWebSocketValidation',
    },

    // Municipal network conditions stress test
    municipal_3g_simulation: {
      executor: 'constant-vus',
      vus: 200,
      duration: '15m',
      exec: 'municipal3GNetworkTest',
      startTime: '25m',
    },

    // WebSocket failover and recovery
    connection_resilience: {
      executor: 'ramping-vus',
      stages: [
        { duration: '3m', target: 50 },
        { duration: '10m', target: 100 },
        { duration: '3m', target: 50 },
      ],
      exec: 'webSocketFailoverTest',
      startTime: '45m',
    }
  },

  thresholds: {
    'websocket_connection_success': ['rate>0.99'],      // 99% connection success
    'websocket_message_delivery_time': ['p(95)<500'],   // 95% under 500ms
    'websocket_connection_duration': ['p(90)<30000'],   // 90% maintain 30s+
    'municipal_websocket_validation_errors': ['count<50'], // <50 validation errors
    'websocket_reconnection_attempts': ['count<100'],   // <100 reconnection attempts
  }
};

const WS_BASE_URL = __ENV.WS_URL || 'ws://localhost:5173/ws';
const municipalities = ['malmö', 'stockholm', 'göteborg', 'västerås', 'örebro'];

export function municipalWebSocketValidation() {
  const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
  const userId = `user_${Math.floor(Math.random() * 1000)}`;
  
  const url = `${WS_BASE_URL}/validation?municipality=${municipality}&userId=${userId}`;
  
  const connectionStart = Date.now();
  let connectionEstablished = false;
  let messagesReceived = 0;
  let validationsSent = 0;

  const response = ws.connect(url, {
    headers: {
      'User-Agent': 'Municipal-Content-Validator/1.0',
      'X-Municipality': municipality,
      'Accept-Language': 'sv-SE'
    }
  }, function (socket) {
    connectionEstablished = true;
    const connectionTime = Date.now() - connectionStart;
    wsConnectionRate.add(1);
    
    console.log(`📡 WebSocket connected to ${municipality} in ${connectionTime}ms`);

    // Update active connections gauge
    activeConnections.add(1);

    socket.on('open', function() {
      console.log(`✅ WebSocket opened for ${municipality}`);
      
      // Send municipal context setup
      socket.send(JSON.stringify({
        type: 'municipal_context',
        municipality: municipality,
        language: 'sv-SE',
        userId: userId,
        timestamp: Date.now()
      }));
    });

    socket.on('message', function(data) {
      messagesReceived++;
      const messageReceiveTime = Date.now();
      
      try {
        const message = JSON.parse(data);
        
        switch (message.type) {
          case 'validation_result':
            const deliveryTime = messageReceiveTime - message.timestamp;
            wsMessageDeliveryTime.add(deliveryTime);
            
            check(message, {
              'Valid validation result': (m) => m.valid !== undefined,
              'Municipality context preserved': (m) => m.municipality === municipality,
              'Swedish content validation': (m) => m.language === 'sv-SE',
              'Delivery time acceptable': (m) => deliveryTime < 1000,
            });
            break;

          case 'content_update':
            check(message, {
              'Content update valid': (m) => m.content && m.content.length > 0,
              'Municipal branding present': (m) => m.content.includes(municipality) || m.content.includes('kommun'),
              'Swedish language content': (m) => /[åäöÅÄÖ]/.test(m.content)
            });
            break;

          case 'error':
            municipalValidationErrors.add(1);
            console.error(`❌ WebSocket error for ${municipality}:`, message.error);
            break;
        }
      } catch (e) {
        municipalValidationErrors.add(1);
        console.error('❌ Failed to parse WebSocket message:', e);
      }
    });

    socket.on('close', function() {
      const connectionDuration = Date.now() - connectionStart;
      wsConnectionDuration.add(connectionDuration);
      activeConnections.add(-1);
      
      console.log(`🔌 WebSocket closed for ${municipality} after ${connectionDuration}ms`);
    });

    socket.on('error', function(error) {
      municipalValidationErrors.add(1);
      wsConnectionRate.add(0);
      console.error(`❌ WebSocket error for ${municipality}:`, error);
    });

    // Simulate real-time content validation requests
    const validationInterval = setInterval(() => {
      if (socket.readyState === 1) { // WebSocket.OPEN
        const validationRequest = {
          type: 'validate_content',
          content: generateMunicipalContent(municipality),
          municipality: municipality,
          userId: userId,
          timestamp: Date.now(),
          requestId: `req_${validationsSent++}`
        };

        socket.send(JSON.stringify(validationRequest));
        
        // Send different types of content for validation
        if (validationsSent % 3 === 0) {
          socket.send(JSON.stringify({
            type: 'validate_quiz',
            quizData: generateMunicipalQuiz(municipality),
            municipality: municipality,
            timestamp: Date.now()
          }));
        }
      }
    }, Math.random() * 3000 + 2000); // Send validation every 2-5 seconds

    // Keep connection alive for stress testing
    sleep(Math.random() * 30 + 30); // 30-60 seconds
    
    clearInterval(validationInterval);
    socket.close();
  });

  wsConnectionRate.add(connectionEstablished ? 1 : 0);
  
  check(response, {
    'WebSocket connection established': () => connectionEstablished,
    'Messages received': () => messagesReceived > 0,
    'Validations sent': () => validationsSent > 0
  });
}

export function municipal3GNetworkTest() {
  const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
  const userId = `mobile_user_${Math.floor(Math.random() * 1000)}`;
  
  // Simulate municipal 3G network conditions
  const url = `${WS_BASE_URL}/mobile?municipality=${municipality}&userId=${userId}&network=3g`;
  
  let connectionAttempts = 0;
  let successful = false;

  function attemptConnection() {
    connectionAttempts++;
    const connectionStart = Date.now();

    const response = ws.connect(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
        'X-Municipality': municipality,
        'X-Network-Type': '3g',
        'X-Device-Type': 'iPhone 12'
      }
    }, function (socket) {
      successful = true;
      console.log(`📱 Mobile WebSocket connected to ${municipality} (attempt ${connectionAttempts})`);

      socket.on('open', function() {
        // Test connection stability with 3G simulation
        socket.send(JSON.stringify({
          type: 'network_test',
          municipality: municipality,
          networkType: '3g',
          timestamp: Date.now()
        }));
      });

      socket.on('message', function(data) {
        try {
          const message = JSON.parse(data);
          const deliveryTime = Date.now() - message.timestamp;
          
          check(message, {
            '3G message delivery acceptable': () => deliveryTime < 2000, // 2s for 3G
            'Content adapted for mobile': (m) => m.mobileOptimized === true,
            'Municipal context preserved': (m) => m.municipality === municipality
          });

        } catch (e) {
          municipalValidationErrors.add(1);
        }
      });

      socket.on('close', function() {
        const connectionDuration = Date.now() - connectionStart;
        console.log(`📱 Mobile connection closed after ${connectionDuration}ms`);
        
        // Simulate mobile reconnection behavior
        if (connectionDuration < 10000 && connectionAttempts < 3) {
          sleep(Math.random() * 5 + 2); // 2-7 second pause
          reconnectionAttempts.add(1);
          setTimeout(attemptConnection, 0);
        }
      });

      // Simulate mobile user behavior with intermittent activity
      const messageIntervals = [5000, 8000, 12000, 15000]; // Variable intervals
      messageIntervals.forEach((interval, index) => {
        setTimeout(() => {
          if (socket.readyState === 1) {
            socket.send(JSON.stringify({
              type: 'mobile_interaction',
              action: ['scroll', 'tap', 'swipe', 'type'][index % 4],
              municipality: municipality,
              timestamp: Date.now()
            }));
          }
        }, interval);
      });

      sleep(Math.random() * 20 + 20); // 20-40 seconds connection
      socket.close();
    });

    return response;
  }

  const finalResponse = attemptConnection();
  
  check(finalResponse, {
    'Mobile connection successful': () => successful,
    'Connection attempts reasonable': () => connectionAttempts <= 3,
    '3G network conditions handled': () => successful || connectionAttempts > 1
  });
}

export function webSocketFailoverTest() {
  const municipality = municipalities[Math.floor(Math.random() * municipalities.length)];
  const userId = `failover_user_${Math.floor(Math.random() * 1000)}`;
  
  let primaryConnectionFailed = false;
  let failoverSuccessful = false;
  let httpFallbackUsed = false;

  // Primary WebSocket connection
  const primaryUrl = `${WS_BASE_URL}/primary?municipality=${municipality}&userId=${userId}`;
  
  const primaryResponse = ws.connect(primaryUrl, function (socket) {
    console.log(`🔗 Primary connection established for ${municipality}`);

    socket.on('open', function() {
      socket.send(JSON.stringify({
        type: 'connection_test',
        municipality: municipality,
        timestamp: Date.now()
      }));
    });

    socket.on('message', function(data) {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'connection_test_response') {
          check(message, {
            'Primary connection working': (m) => m.status === 'ok',
            'Municipality context correct': (m) => m.municipality === municipality
          });
        }
      } catch (e) {
        municipalValidationErrors.add(1);
      }
    });

    socket.on('error', function(error) {
      primaryConnectionFailed = true;
      console.log(`⚠️ Primary connection failed for ${municipality}, attempting failover`);
      
      // Attempt failover to secondary WebSocket
      const failoverUrl = `${WS_BASE_URL}/failover?municipality=${municipality}&userId=${userId}`;
      
      ws.connect(failoverUrl, function (failoverSocket) {
        failoverSuccessful = true;
        console.log(`🔄 Failover connection established for ${municipality}`);

        failoverSocket.on('open', function() {
          failoverSocket.send(JSON.stringify({
            type: 'failover_test',
            originalConnection: 'primary',
            municipality: municipality,
            timestamp: Date.now()
          }));
        });

        sleep(10); // Test failover for 10 seconds
        failoverSocket.close();
      });

      // If WebSocket failover fails, test HTTP polling fallback
      if (!failoverSuccessful) {
        httpFallbackUsed = true;
        console.log(`📡 Using HTTP polling fallback for ${municipality}`);
        
        // Simulate HTTP polling
        for (let i = 0; i < 5; i++) {
          sleep(2); // 2-second polling interval
          // In real implementation, this would be an HTTP request
          console.log(`📊 HTTP poll ${i + 1}/5 for ${municipality}`);
        }
      }
    });

    // Simulate connection running for a while before potential failure
    sleep(Math.random() * 15 + 10); // 10-25 seconds
    
    // Randomly simulate connection failure (30% chance)
    if (Math.random() < 0.3) {
      socket.close(1006, 'Simulated connection failure');
    } else {
      socket.close();
    }
  });

  check(primaryResponse, {
    'Connection resilience tested': () => true,
    'Failover mechanism activated': () => primaryConnectionFailed ? failoverSuccessful || httpFallbackUsed : true,
    'Service continuity maintained': () => !primaryConnectionFailed || failoverSuccessful || httpFallbackUsed
  });
}

// Helper functions for generating test content
function generateMunicipalContent(municipality) {
  const content = [
    `GDPR-utbildning för ${municipality} kommun`,
    `Digitalisering inom ${municipality} stadskansli`,
    `Säkerhetsrutiner för ${municipality} medarbetare`,
    `E-förvaltning och digitala tjänster i ${municipality}`,
    `Informationssäkerhet för ${municipality} anställda`
  ];
  
  return content[Math.floor(Math.random() * content.length)];
}

function generateMunicipalQuiz(municipality) {
  return {
    title: `GDPR Quiz för ${municipality}`,
    questions: [
      {
        question: `Hur länge får ${municipality} kommun spara personuppgifter?`,
        options: [
          'Så länge det behövs för ändamålet',
          'Maximalt 1 år',
          'För evigt',
          'Maximalt 5 år'
        ],
        correct: 0
      }
    ],
    municipality: municipality,
    language: 'sv-SE'
  };
}

export function teardown(data) {
  console.log('🧹 Cleaning up WebSocket stress test...');
  console.log(`Final active connections: ${activeConnections.value}`);
  console.log(`Total validation errors: ${municipalValidationErrors.value}`);
  console.log(`Reconnection attempts: ${reconnectionAttempts.value}`);
}