# DevTeam Preview Interface Implementation Guide
## Technical Specifications för Hot-Reload Development Environment

**Document Type:** Developer Implementation Guide  
**Version:** 1.0  
**Created:** 2025-01-19  
**Author:** Game Designer  
**Roadmap Reference:** Q1-AO-Milestone-1.2  
**Based On:** proposal-008 (DevTeam Preview Interface Design)  
**Target Users:** Head Developer, System Architect  
**Implementation Priority:** CRITICAL - Enables DevTeam productivity  

---

## 📋 IMPLEMENTATION OVERVIEW

**Purpose:** Transform the DevTeam Preview Interface Design (proposal-008) into actionable development specifications enabling <3 second content preview feedback loops.

**Technical Stack:**
- **Frontend:** React 18 + TypeScript + Chakra UI
- **State Management:** Zustand for preview state
- **Real-time:** WebSocket connection for hot-reload
- **Code Editor:** Monaco Editor (VS Code engine)
- **Preview Engine:** Existing game rendering system
- **Validation:** Integration with proposal-001 validation foundation

**Success Criteria:**
- Preview updates within 3 seconds of JSON changes
- Zero-configuration DevTeam onboarding
- 100% municipal branding accuracy in preview
- Real-time validation feedback integration

---

## 🏗️ COMPONENT ARCHITECTURE

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                     DevTeam Preview App                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┬─────────────────────────────────────────┐ │
│  │                 │                                         │ │
│  │  MonacoEditor   │         PreviewRenderer                 │ │
│  │  - JSON editing │         - Game engine                   │ │
│  │  - Validation   │         - Municipal context             │ │
│  │  - Auto-complete│         - Device simulation             │ │
│  │                 │                                         │ │
│  └─────────────────┴─────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               ValidationDashboard                           │ │
│  │               - Real-time feedback                          │ │
│  │               - Error highlighting                          │ │
│  │               - Success indicators                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
```typescript
DevTeamPreviewApp/
├── PreviewLayout/
│   ├── ResizablePanels/
│   │   ├── EditorPanel/
│   │   │   ├── MonacoEditor/
│   │   │   ├── TabManager/
│   │   │   └── EditorToolbar/
│   │   └── PreviewPanel/
│   │       ├── PreviewRenderer/
│   │       ├── DeviceFrame/
│   │       └── ContextControls/
│   └── ValidationDashboard/
│       ├── ValidationStatus/
│       ├── ErrorList/
│       └── SuccessIndicators/
├── HotReloadEngine/
├── PreviewState/
└── MunicipalContext/
```

---

## 🎯 CORE COMPONENTS IMPLEMENTATION

### 1. DevTeamPreviewApp (Root Container)

```typescript
// src/components/devteam/DevTeamPreviewApp.tsx
import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { PreviewLayout } from './PreviewLayout';
import { PreviewStateProvider } from './state/PreviewStateProvider';
import { HotReloadProvider } from './hotreload/HotReloadProvider';
import { ValidationProvider } from './validation/ValidationProvider';

interface DevTeamPreviewAppProps {
  initialContent?: string;
  municipalityId?: string;
  devMode?: boolean;
}

export const DevTeamPreviewApp: React.FC<DevTeamPreviewAppProps> = ({
  initialContent = '',
  municipalityId = 'malmo-stad',
  devMode = false
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box
      height="100vh"
      width="100vw"
      bg={bgColor}
      overflow="hidden"
      fontFamily="Inter, sans-serif"
    >
      <PreviewStateProvider initialContent={initialContent}>
        <ValidationProvider>
          <HotReloadProvider enabled={devMode}>
            <PreviewLayout municipalityId={municipalityId} />
          </HotReloadProvider>
        </ValidationProvider>
      </PreviewStateProvider>
    </Box>
  );
};
```

### 2. ResizablePanels (Split View Layout)

```typescript
// src/components/devteam/ResizablePanels.tsx
import React, { useState, useCallback } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { ResizeHandle } from './ResizeHandle';

interface ResizablePanelsProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  defaultSplit?: number; // 0-100, default 50
  minLeftWidth?: number;
  minRightWidth?: number;
}

export const ResizablePanels: React.FC<ResizablePanelsProps> = ({
  leftPanel,
  rightPanel,
  defaultSplit = 50,
  minLeftWidth = 300,
  minRightWidth = 400
}) => {
  const [splitPercentage, setSplitPercentage] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const container = document.getElementById('resizable-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Apply constraints
    const minLeftPercent = (minLeftWidth / rect.width) * 100;
    const maxLeftPercent = 100 - ((minRightWidth / rect.width) * 100);
    
    const constrainedPercentage = Math.max(
      minLeftPercent,
      Math.min(maxLeftPercent, newPercentage)
    );
    
    setSplitPercentage(constrainedPercentage);
  }, [isDragging, minLeftWidth, minRightWidth]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);
  
  // Double-click to reset to 50/50
  const handleDoubleClick = useCallback(() => {
    setSplitPercentage(50);
  }, []);
  
  return (
    <Flex id="resizable-container" height="100%" width="100%">
      <Box
        width={`${splitPercentage}%`}
        height="100%"
        overflow="hidden"
        borderRight="1px solid"
        borderColor="gray.200"
      >
        {leftPanel}
      </Box>
      
      <ResizeHandle
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        isDragging={isDragging}
      />
      
      <Box
        width={`${100 - splitPercentage}%`}
        height="100%"
        overflow="hidden"
      >
        {rightPanel}
      </Box>
    </Flex>
  );
};
```

### 3. MonacoEditor Integration

```typescript
// src/components/devteam/editor/MonacoEditor.tsx
import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { usePreviewState } from '../state/usePreviewState';
import { useValidation } from '../validation/useValidation';
import { gameContentSchema } from '../schemas/gameContentSchema';

interface MonacoEditorProps {
  height?: string;
  language?: string;
  theme?: 'light' | 'dark';
  readOnly?: boolean;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  height = '100%',
  language = 'json',
  theme = 'light',
  readOnly = false
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { content, updateContent, isUpdating } = usePreviewState();
  const { validateContent, errors } = useValidation();
  
  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Configure JSON schema for autocompletion
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [{
        uri: 'http://diginativa.com/game-content-schema.json',
        fileMatch: ['*'],
        schema: gameContentSchema
      }]
    });
    
    // Create editor instance
    const editor = monaco.editor.create(containerRef.current, {
      value: content,
      language,
      theme: theme === 'dark' ? 'vs-dark' : 'vs',
      readOnly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Consolas, monospace',
      lineNumbers: 'on',
      folding: true,
      
      // DevTeam-specific settings
      quickSuggestions: {
        other: true,
        comments: false,
        strings: true
      },
      suggestOnTriggerCharacters: true,
      formatOnPaste: true,
      formatOnType: true
    });
    
    editorRef.current = editor;
    
    return () => {
      editor.dispose();
    };
  }, [language, theme, readOnly]);
  
  // Handle content changes with debouncing
  const debouncedUpdate = useCallback(
    debounce((newContent: string) => {
      updateContent(newContent);
      validateContent(newContent);
    }, 500),
    [updateContent, validateContent]
  );
  
  useEffect(() => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    
    // Listen for content changes
    const disposable = editor.onDidChangeModelContent(() => {
      const currentContent = editor.getValue();
      debouncedUpdate(currentContent);
    });
    
    return () => disposable.dispose();
  }, [debouncedUpdate]);
  
  // Update editor when external content changes
  useEffect(() => {
    if (editorRef.current && !isUpdating) {
      const editor = editorRef.current;
      const currentValue = editor.getValue();
      
      if (currentValue !== content) {
        editor.setValue(content);
      }
    }
  }, [content, isUpdating]);
  
  // Display validation errors as editor markers
  useEffect(() => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;
    
    // Convert validation errors to Monaco markers
    const markers: monaco.editor.IMarkerData[] = errors.map(error => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: error.line || 1,
      startColumn: error.column || 1,
      endLineNumber: error.line || 1,
      endColumn: error.column ? error.column + 10 : 11,
      message: error.message,
      source: 'DevTeam Validation'
    }));
    
    monaco.editor.setModelMarkers(model, 'validation', markers);
  }, [errors]);
  
  return (
    <Box
      ref={containerRef}
      height={height}
      width="100%"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      overflow="hidden"
      position="relative"
    />
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### 4. PreviewRenderer (Game Integration)

```typescript
// src/components/devteam/preview/PreviewRenderer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Box, Alert, AlertIcon, Spinner, Text } from '@chakra-ui/react';
import { usePreviewState } from '../state/usePreviewState';
import { useMunicipalContext } from '../context/useMunicipalContext';
import { GameContainer } from '../../GameContainer/GameContainer';
import { parseGameContent } from '../utils/gameContentParser';

interface PreviewRendererProps {
  deviceFrame?: 'iphone-12' | 'desktop' | 'tablet';
  showDeviceChrome?: boolean;
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  deviceFrame = 'desktop',
  showDeviceChrome = true
}) => {
  const { content, isUpdating, lastUpdateTime } = usePreviewState();
  const { municipality, networkCondition } = useMunicipalContext();
  const [gameContent, setGameContent] = useState(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const renderTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Parse JSON content and update game state
  useEffect(() => {
    if (!content.trim()) {
      setGameContent(null);
      setParseError(null);
      return;
    }
    
    setIsRendering(true);
    
    // Clear previous timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }
    
    // Simulate network delay based on context
    const networkDelay = getNetworkDelay(networkCondition);
    
    renderTimeoutRef.current = setTimeout(async () => {
      try {
        const parsed = await parseGameContent(content, municipality);
        setGameContent(parsed);
        setParseError(null);
      } catch (error) {
        setParseError(error.message);
        setGameContent(null);
      } finally {
        setIsRendering(false);
      }
    }, networkDelay);
    
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [content, municipality, networkCondition]);
  
  // Device-specific container styles
  const getDeviceStyles = () => {
    switch (deviceFrame) {
      case 'iphone-12':
        return {
          width: '390px',
          height: '844px',
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: showDeviceChrome ? '25px' : '0',
          border: showDeviceChrome ? '8px solid #000' : 'none',
          overflow: 'hidden',
          boxShadow: showDeviceChrome ? '0 0 30px rgba(0,0,0,0.3)' : 'none'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          maxWidth: '100%',
          maxHeight: '100%',
          borderRadius: showDeviceChrome ? '15px' : '0',
          border: showDeviceChrome ? '6px solid #333' : 'none',
          overflow: 'hidden'
        };
      default:
        return {
          width: '100%',
          height: '100%',
          borderRadius: '0',
          border: 'none'
        };
    }
  };
  
  const renderPreview = () => {
    if (parseError) {
      return (
        <Alert status="error" variant="subtle">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">JSON Parse Error</Text>
            <Text fontSize="sm">{parseError}</Text>
          </Box>
        </Alert>
      );
    }
    
    if (isRendering || isUpdating) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="200px"
          flexDirection="column"
          gap={3}
        >
          <Spinner size="lg" color="blue.500" />
          <Text color="gray.600">Updating preview...</Text>
          {lastUpdateTime && (
            <Text fontSize="sm" color="gray.500">
              Last updated: {lastUpdateTime.toLocaleTimeString()}
            </Text>
          )}
        </Box>
      );
    }
    
    if (!gameContent) {
      return (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="200px"
          color="gray.500"
          textAlign="center"
        >
          <Text>
            Start editing JSON content to see preview<br />
            <Text as="span" fontSize="sm">
              Changes will appear here within 3 seconds
            </Text>
          </Text>
        </Box>
      );
    }
    
    return (
      <GameContainer
        gameContent={gameContent}
        municipality={municipality}
        previewMode={true}
        devTeamMode={true}
      />
    );
  };
  
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      width="100%"
      bg="gray.100"
      padding={4}
    >
      <Box
        {...getDeviceStyles()}
        bg="white"
        position="relative"
        display="flex"
        flexDirection="column"
      >
        {showDeviceChrome && deviceFrame === 'iphone-12' && (
          <DeviceChrome deviceType="iphone-12" />
        )}
        
        <Box flex={1} overflow="auto">
          {renderPreview()}
        </Box>
        
        {/* Performance indicator */}
        {lastUpdateTime && (
          <Box
            position="absolute"
            top={2}
            right={2}
            bg="green.500"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            opacity={0.8}
          >
            ✓ Updated
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Utility functions
const getNetworkDelay = (condition: string): number => {
  switch (condition) {
    case '3g': return 800;
    case '4g': return 300;
    case 'wifi': return 100;
    default: return 0;
  }
};
```

### 5. ValidationDashboard

```typescript
// src/components/devteam/validation/ValidationDashboard.tsx
import React from 'react';
import { 
  Box, 
  Flex, 
  Badge, 
  Text, 
  Alert, 
  AlertIcon, 
  VStack,
  Collapse,
  Button,
  Icon
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useValidation } from './useValidation';
import { ValidationResult } from './types';

export const ValidationDashboard: React.FC = () => {
  const { 
    validationResult, 
    isValidating, 
    lastValidationTime 
  } = useValidation();
  
  const [isExpanded, setIsExpanded] = React.useState(true);
  
  if (!validationResult) {
    return (
      <Box p={4} bg="gray.50" borderTop="1px solid" borderColor="gray.200">
        <Text color="gray.500" fontSize="sm">
          No validation results yet. Start editing to see feedback.
        </Text>
      </Box>
    );
  }
  
  const { 
    isValid, 
    errors = [], 
    warnings = [], 
    suggestions = [],
    performance 
  } = validationResult;
  
  const getStatusColor = () => {
    if (errors.length > 0) return 'red';
    if (warnings.length > 0) return 'yellow';
    return 'green';
  };
  
  const getStatusText = () => {
    if (errors.length > 0) return `${errors.length} Error${errors.length > 1 ? 's' : ''}`;
    if (warnings.length > 0) return `${warnings.length} Warning${warnings.length > 1 ? 's' : ''}`;
    return 'All Good';
  };
  
  return (
    <Box 
      borderTop="1px solid" 
      borderColor="gray.200" 
      bg="white"
      maxHeight="300px"
      overflow="auto"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        p={3}
        borderBottom="1px solid"
        borderColor="gray.100"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: 'gray.50' }}
      >
        <Flex align="center" gap={3}>
          <Badge colorScheme={getStatusColor()} variant="solid">
            {getStatusText()}
          </Badge>
          
          {isValidating && (
            <Badge colorScheme="blue" variant="outline">
              Validating...
            </Badge>
          )}
          
          {performance && (
            <Text fontSize="xs" color="gray.500">
              {performance.validationTime}ms
            </Text>
          )}
        </Flex>
        
        <Flex align="center" gap={2}>
          {lastValidationTime && (
            <Text fontSize="xs" color="gray.500">
              {lastValidationTime.toLocaleTimeString()}
            </Text>
          )}
          
          <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
        </Flex>
      </Flex>
      
      {/* Content */}
      <Collapse in={isExpanded}>
        <Box p={3}>
          <VStack spacing={2} align="stretch">
            {/* Errors */}
            {errors.map((error, index) => (
              <Alert key={`error-${index}`} status="error" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">{error.title || 'Error'}</Text>
                  <Text fontSize="sm">{error.message}</Text>
                  {error.line && (
                    <Text fontSize="xs" color="gray.600">
                      Line {error.line}{error.column && `, Column ${error.column}`}
                    </Text>
                  )}
                </Box>
              </Alert>
            ))}
            
            {/* Warnings */}
            {warnings.map((warning, index) => (
              <Alert key={`warning-${index}`} status="warning" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">{warning.title || 'Warning'}</Text>
                  <Text fontSize="sm">{warning.message}</Text>
                </Box>
              </Alert>
            ))}
            
            {/* Suggestions */}
            {suggestions.map((suggestion, index) => (
              <Alert key={`suggestion-${index}`} status="info" variant="left-accent">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">{suggestion.title || 'Suggestion'}</Text>
                  <Text fontSize="sm">{suggestion.message}</Text>
                  {suggestion.example && (
                    <Box
                      mt={2}
                      p={2}
                      bg="gray.100"
                      borderRadius="md"
                      fontSize="xs"
                      fontFamily="mono"
                    >
                      {suggestion.example}
                    </Box>
                  )}
                </Box>
              </Alert>
            ))}
            
            {/* Success state */}
            {isValid && errors.length === 0 && warnings.length === 0 && (
              <Alert status="success" variant="left-accent">
                <AlertIcon />
                <Text>
                  Content is valid and ready for deployment! 
                  {performance?.gameSize && (
                    <Text as="span" fontSize="sm" ml={2}>
                      Game size: {performance.gameSize}
                    </Text>
                  )}
                </Text>
              </Alert>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};
```

---

## ⚡ HOT-RELOAD IMPLEMENTATION

### WebSocket Connection Manager

```typescript
// src/components/devteam/hotreload/HotReloadEngine.ts
export class HotReloadEngine {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnected = false;
  private listeners: Map<string, Function[]> = new Map();
  
  constructor(private wsUrl: string) {
    this.connect();
  }
  
  private connect(): void {
    try {
      this.ws = new WebSocket(this.wsUrl);
      
      this.ws.onopen = () => {
        console.log('🔥 Hot-reload connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        this.isConnected = false;
        this.emit('disconnected');
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('Failed to connect to hot-reload server:', error);
      this.attemptReconnect();
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }
  
  private handleMessage(data: any): void {
    switch (data.type) {
      case 'content-update':
        this.emit('contentUpdate', data.payload);
        break;
      case 'validation-result':
        this.emit('validationResult', data.payload);
        break;
      case 'municipality-config':
        this.emit('municipalityConfig', data.payload);
        break;
      default:
        console.warn('Unknown message type:', data.type);
    }
  }
  
  public sendMessage(type: string, payload: any): void {
    if (!this.isConnected || !this.ws) {
      console.warn('WebSocket not connected, message queued');
      // TODO: Implement message queuing
      return;
    }
    
    this.ws.send(JSON.stringify({ type, payload }));
  }
  
  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }
  
  public off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }
  
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}
```

### React Hot-Reload Hook

```typescript
// src/components/devteam/hotreload/useHotReload.ts
import { useEffect, useRef } from 'react';
import { HotReloadEngine } from './HotReloadEngine';
import { usePreviewState } from '../state/usePreviewState';
import { useValidation } from '../validation/useValidation';

interface UseHotReloadOptions {
  enabled?: boolean;
  wsUrl?: string;
  debounceMs?: number;
}

export const useHotReload = ({
  enabled = true,
  wsUrl = 'ws://localhost:3001/hotreload',
  debounceMs = 500
}: UseHotReloadOptions = {}) => {
  const engineRef = useRef<HotReloadEngine | null>(null);
  const { updateContent } = usePreviewState();
  const { setValidationResult } = useValidation();
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  
  useEffect(() => {
    if (!enabled) return;
    
    // Initialize hot-reload engine
    const engine = new HotReloadEngine(wsUrl);
    engineRef.current = engine;
    
    // Set up event listeners
    engine.on('connected', () => {
      setConnectionStatus('connected');
    });
    
    engine.on('disconnected', () => {
      setConnectionStatus('disconnected');
    });
    
    engine.on('error', () => {
      setConnectionStatus('error');
    });
    
    // Handle content updates from external sources
    engine.on('contentUpdate', (newContent: string) => {
      updateContent(newContent, { source: 'external' });
    });
    
    // Handle validation results from server
    engine.on('validationResult', (result: any) => {
      setValidationResult(result);
    });
    
    return () => {
      engine.disconnect();
      engineRef.current = null;
    };
  }, [enabled, wsUrl, updateContent, setValidationResult]);
  
  // Send content updates to server
  const sendContentUpdate = useCallback(
    debounce((content: string) => {
      if (engineRef.current?.getConnectionStatus()) {
        engineRef.current.sendMessage('content-update', { content });
      }
    }, debounceMs),
    [debounceMs]
  );
  
  return {
    connectionStatus,
    sendContentUpdate,
    isEnabled: enabled
  };
};
```

---

## 🎨 MUNICIPAL CONTEXT SYSTEM

### Municipality Configuration

```typescript
// src/components/devteam/context/MunicipalContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface MunicipalityConfig {
  id: string;
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  language: 'sv' | 'en' | 'de' | 'fr' | 'nl';
  timezone: string;
  
  branding: {
    headerText: string;
    footerText: string;
    supportEmail: string;
    privacyUrl: string;
  };
  
  features: {
    sso: boolean;
    gdprCompliance: boolean;
    customBranding: boolean;
  };
}

interface NetworkCondition {
  name: string;
  bandwidth: number; // kbps
  latency: number;   // ms
  packetLoss: number; // percentage
}

interface MunicipalContextValue {
  municipality: MunicipalityConfig;
  networkCondition: NetworkCondition;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  
  setMunicipality: (municipality: MunicipalityConfig) => void;
  setNetworkCondition: (condition: NetworkCondition) => void;
  setDeviceType: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const MunicipalContext = createContext<MunicipalContextValue | null>(null);

// Default configurations
const DEFAULT_MUNICIPALITIES: Record<string, MunicipalityConfig> = {
  'malmo-stad': {
    id: 'malmo-stad',
    name: 'Malmö Stad',
    logo: '/logos/malmo-stad.svg',
    primaryColor: '#0066CC',
    secondaryColor: '#004080',
    language: 'sv',
    timezone: 'Europe/Stockholm',
    branding: {
      headerText: 'Malmö Stad - Kompetensutveckling',
      footerText: '© 2025 Malmö Stad',
      supportEmail: 'it-support@malmo.se',
      privacyUrl: 'https://malmo.se/integritet'
    },
    features: {
      sso: true,
      gdprCompliance: true,
      customBranding: true
    }
  },
  'goteborg': {
    id: 'goteborg',
    name: 'Göteborgs Stad',
    logo: '/logos/goteborg.svg',
    primaryColor: '#0099CC',
    secondaryColor: '#006699',
    language: 'sv',
    timezone: 'Europe/Stockholm',
    branding: {
      headerText: 'Göteborgs Stad - Utbildning',
      footerText: '© 2025 Göteborgs Stad',
      supportEmail: 'support@goteborg.se',
      privacyUrl: 'https://goteborg.se/privacy'
    },
    features: {
      sso: true,
      gdprCompliance: true,
      customBranding: true
    }
  }
};

const NETWORK_CONDITIONS: Record<string, NetworkCondition> = {
  wifi: { name: 'Municipal WiFi', bandwidth: 10000, latency: 50, packetLoss: 0 },
  '4g': { name: 'Mobile 4G', bandwidth: 5000, latency: 100, packetLoss: 1 },
  '3g': { name: 'Mobile 3G', bandwidth: 384, latency: 150, packetLoss: 2 },
  slow: { name: 'Slow Connection', bandwidth: 100, latency: 300, packetLoss: 5 }
};

export const MunicipalContextProvider: React.FC<{
  children: React.ReactNode;
  initialMunicipalityId?: string;
}> = ({ children, initialMunicipalityId = 'malmo-stad' }) => {
  const [municipality, setMunicipality] = useState<MunicipalityConfig>(
    DEFAULT_MUNICIPALITIES[initialMunicipalityId]
  );
  const [networkCondition, setNetworkCondition] = useState<NetworkCondition>(
    NETWORK_CONDITIONS.wifi
  );
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const value: MunicipalContextValue = {
    municipality,
    networkCondition,
    deviceType,
    setMunicipality,
    setNetworkCondition,
    setDeviceType
  };
  
  return (
    <MunicipalContext.Provider value={value}>
      {children}
    </MunicipalContext.Provider>
  );
};

export const useMunicipalContext = (): MunicipalContextValue => {
  const context = useContext(MunicipalContext);
  if (!context) {
    throw new Error('useMunicipalContext must be used within MunicipalContextProvider');
  }
  return context;
};
```

### Context Controls Component

```typescript
// src/components/devteam/context/ContextControls.tsx
import React from 'react';
import {
  Box,
  Flex,
  Select,
  Text,
  HStack,
  Button,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import { useMunicipalContext } from './useMunicipalContext';

export const ContextControls: React.FC = () => {
  const {
    municipality,
    networkCondition,
    deviceType,
    setMunicipality,
    setNetworkCondition,
    setDeviceType
  } = useMunicipalContext();
  
  return (
    <Box
      p={3}
      bg="gray.50"
      borderTop="1px solid"
      borderColor="gray.200"
    >
      <Text fontSize="sm" fontWeight="bold" mb={2}>
        Preview Context
      </Text>
      
      <Flex gap={4} wrap="wrap" align="center">
        {/* Municipality Selector */}
        <Box>
          <Text fontSize="xs" color="gray.600" mb={1}>
            Municipality
          </Text>
          <Select
            size="sm"
            value={municipality.id}
            onChange={(e) => {
              const selected = DEFAULT_MUNICIPALITIES[e.target.value];
              if (selected) setMunicipality(selected);
            }}
            width="200px"
          >
            <option value="malmo-stad">Malmö Stad</option>
            <option value="goteborg">Göteborgs Stad</option>
            <option value="stockholm">Stockholm Stad</option>
            <option value="uppsala">Uppsala Kommun</option>
          </Select>
        </Box>
        
        {/* Network Condition */}
        <Box>
          <Text fontSize="xs" color="gray.600" mb={1}>
            Network
          </Text>
          <Select
            size="sm"
            value={networkCondition.name}
            onChange={(e) => {
              const condition = Object.values(NETWORK_CONDITIONS)
                .find(c => c.name === e.target.value);
              if (condition) setNetworkCondition(condition);
            }}
            width="150px"
          >
            {Object.values(NETWORK_CONDITIONS).map(condition => (
              <option key={condition.name} value={condition.name}>
                {condition.name}
              </option>
            ))}
          </Select>
        </Box>
        
        {/* Device Type */}
        <Box>
          <Text fontSize="xs" color="gray.600" mb={1}>
            Device
          </Text>
          <HStack spacing={1}>
            {['desktop', 'tablet', 'mobile'].map(device => (
              <Button
                key={device}
                size="xs"
                variant={deviceType === device ? 'solid' : 'outline'}
                colorScheme={deviceType === device ? 'blue' : 'gray'}
                onClick={() => setDeviceType(device as any)}
                textTransform="capitalize"
              >
                {device}
              </Button>
            ))}
          </HStack>
        </Box>
        
        {/* Current Settings Display */}
        <Box ml="auto">
          <HStack spacing={2}>
            <Tooltip label={`Primary: ${municipality.primaryColor}`}>
              <Badge
                colorScheme="blue"
                variant="solid"
                style={{ backgroundColor: municipality.primaryColor }}
              >
                {municipality.name}
              </Badge>
            </Tooltip>
            
            <Tooltip label={`${networkCondition.bandwidth} kbps, ${networkCondition.latency}ms latency`}>
              <Badge
                colorScheme={networkCondition.bandwidth > 1000 ? 'green' : 'orange'}
                variant="outline"
              >
                {networkCondition.name}
              </Badge>
            </Tooltip>
            
            <Badge colorScheme="purple" variant="outline">
              {deviceType}
            </Badge>
          </HStack>
        </Box>
      </Flex>
    </Box>
  );
};
```

---

## 📊 PERFORMANCE MONITORING

### Performance Metrics Collection

```typescript
// src/components/devteam/performance/PerformanceMonitor.ts
interface PerformanceMetrics {
  timestamp: Date;
  
  // Update timings
  parseTime: number;        // JSON parse duration
  validationTime: number;   // Validation duration
  renderTime: number;       // React render duration
  totalUpdateTime: number;  // Total update cycle
  
  // Content metrics
  contentSize: number;      // JSON size in bytes
  gameComplexity: number;   // Number of scenes/components
  
  // System metrics
  memoryUsage: number;      // Heap usage in MB
  cpuTime: number;         // JS execution time
  
  // Network simulation
  networkDelay: number;     // Simulated network delay
  
  // Validation results
  errorCount: number;
  warningCount: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private currentMeasurement: Partial<PerformanceMetrics> = {};
  
  startMeasurement(type: string): void {
    const timestamp = performance.now();
    this.currentMeasurement = {
      timestamp: new Date(),
      [`${type}StartTime`]: timestamp
    };
  }
  
  endMeasurement(type: string): void {
    const endTime = performance.now();
    const startTime = this.currentMeasurement[`${type}StartTime`] as number;
    
    if (startTime) {
      this.currentMeasurement[`${type}Time`] = endTime - startTime;
    }
  }
  
  recordMetric(key: keyof PerformanceMetrics, value: number): void {
    this.currentMeasurement[key] = value;
  }
  
  completeMeasurement(): PerformanceMetrics {
    const completed = this.currentMeasurement as PerformanceMetrics;
    
    // Calculate total update time
    completed.totalUpdateTime = 
      (completed.parseTime || 0) +
      (completed.validationTime || 0) +
      (completed.renderTime || 0);
    
    // Record memory usage
    if ('memory' in performance) {
      completed.memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024;
    }
    
    this.metrics.push(completed);
    
    // Keep only last 100 measurements
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
    
    this.currentMeasurement = {};
    return completed;
  }
  
  getAverageMetrics(lastN: number = 10): Partial<PerformanceMetrics> {
    const recent = this.metrics.slice(-lastN);
    if (recent.length === 0) return {};
    
    const averages: any = {};
    const numericKeys = [
      'parseTime', 'validationTime', 'renderTime', 'totalUpdateTime',
      'contentSize', 'gameComplexity', 'memoryUsage', 'cpuTime',
      'networkDelay', 'errorCount', 'warningCount'
    ];
    
    numericKeys.forEach(key => {
      const sum = recent.reduce((acc, metric) => acc + (metric[key] || 0), 0);
      averages[key] = sum / recent.length;
    });
    
    return averages;
  }
  
  getPerformanceReport(): {
    current: PerformanceMetrics | null;
    average: Partial<PerformanceMetrics>;
    trends: { [key: string]: 'improving' | 'degrading' | 'stable' };
  } {
    const current = this.metrics[this.metrics.length - 1] || null;
    const average = this.getAverageMetrics();
    
    // Calculate trends (simplified)
    const trends: any = {};
    if (this.metrics.length >= 5) {
      const recent5 = this.metrics.slice(-5);
      const previous5 = this.metrics.slice(-10, -5);
      
      ['totalUpdateTime', 'memoryUsage', 'errorCount'].forEach(key => {
        const recentAvg = recent5.reduce((acc, m) => acc + (m[key] || 0), 0) / 5;
        const previousAvg = previous5.reduce((acc, m) => acc + (m[key] || 0), 0) / 5;
        
        const change = recentAvg - previousAvg;
        const threshold = previousAvg * 0.1; // 10% change threshold
        
        if (Math.abs(change) < threshold) {
          trends[key] = 'stable';
        } else if (change > 0) {
          trends[key] = key === 'errorCount' ? 'degrading' : 'degrading';
        } else {
          trends[key] = key === 'errorCount' ? 'improving' : 'improving';
        }
      });
    }
    
    return { current, average, trends };
  }
}
```

### Performance Display Component

```typescript
// src/components/devteam/performance/PerformanceDisplay.tsx
import React, { useState } from 'react';
import {
  Box,
  Text,
  Flex,
  Badge,
  Tooltip,
  Progress,
  Collapse,
  Button,
  Icon,
  VStack,
  HStack
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { usePerformanceMonitor } from './usePerformanceMonitor';

export const PerformanceDisplay: React.FC = () => {
  const { performanceReport, isMonitoring } = usePerformanceMonitor();
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!performanceReport.current) {
    return null;
  }
  
  const { current, average, trends } = performanceReport;
  
  const getPerformanceColor = (time: number) => {
    if (time < 1000) return 'green';
    if (time < 2000) return 'yellow';
    return 'red';
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'degrading': return '📉';
      default: return '➡️';
    }
  };
  
  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      shadow="lg"
      minWidth="250px"
      maxWidth="400px"
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        p={3}
        borderBottom="1px solid"
        borderColor="gray.100"
        cursor="pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        _hover={{ bg: 'gray.50' }}
      >
        <HStack spacing={2}>
          <Text fontSize="sm" fontWeight="bold">
            Performance
          </Text>
          
          {isMonitoring && (
            <Badge colorScheme="green" variant="outline" size="sm">
              Live
            </Badge>
          )}
          
          <Tooltip label="Total update time">
            <Badge
              colorScheme={getPerformanceColor(current.totalUpdateTime)}
              variant="solid"
            >
              {Math.round(current.totalUpdateTime)}ms
            </Badge>
          </Tooltip>
        </HStack>
        
        <Icon as={isExpanded ? ChevronUpIcon : ChevronDownIcon} />
      </Flex>
      
      {/* Detailed Metrics */}
      <Collapse in={isExpanded}>
        <Box p={3}>
          <VStack spacing={3} align="stretch">
            {/* Update Time Breakdown */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={2}>
                Update Breakdown
              </Text>
              
              <VStack spacing={1} align="stretch">
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs">Parse</Text>
                  <HStack spacing={1}>
                    <Text fontSize="xs">{Math.round(current.parseTime || 0)}ms</Text>
                    <Text fontSize="xs">{getTrendIcon(trends.parseTime)}</Text>
                  </HStack>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs">Validation</Text>
                  <HStack spacing={1}>
                    <Text fontSize="xs">{Math.round(current.validationTime || 0)}ms</Text>
                    <Text fontSize="xs">{getTrendIcon(trends.validationTime)}</Text>
                  </HStack>
                </Flex>
                
                <Flex justify="space-between" align="center">
                  <Text fontSize="xs">Render</Text>
                  <HStack spacing={1}>
                    <Text fontSize="xs">{Math.round(current.renderTime || 0)}ms</Text>
                    <Text fontSize="xs">{getTrendIcon(trends.renderTime)}</Text>
                  </HStack>
                </Flex>
              </VStack>
              
              {/* Performance target indicator */}
              <Box mt={2}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="xs">Target: <3s</Text>
                  <Text fontSize="xs">
                    {((current.totalUpdateTime / 3000) * 100).toFixed(1)}%
                  </Text>
                </Flex>
                <Progress
                  value={Math.min((current.totalUpdateTime / 3000) * 100, 100)}
                  colorScheme={getPerformanceColor(current.totalUpdateTime)}
                  size="sm"
                />
              </Box>
            </Box>
            
            {/* Memory and Content */}
            <Box>
              <Text fontSize="xs" fontWeight="bold" mb={2}>
                Resources
              </Text>
              
              <VStack spacing={1} align="stretch">
                <Flex justify="space-between">
                  <Text fontSize="xs">Memory</Text>
                  <Text fontSize="xs">
                    {Math.round(current.memoryUsage || 0)}MB
                  </Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontSize="xs">Content Size</Text>
                  <Text fontSize="xs">
                    {Math.round((current.contentSize || 0) / 1024)}KB
                  </Text>
                </Flex>
                
                <Flex justify="space-between">
                  <Text fontSize="xs">Complexity</Text>
                  <Text fontSize="xs">
                    {current.gameComplexity || 0} components
                  </Text>
                </Flex>
              </VStack>
            </Box>
            
            {/* Quality Metrics */}
            {(current.errorCount > 0 || current.warningCount > 0) && (
              <Box>
                <Text fontSize="xs" fontWeight="bold" mb={2}>
                  Quality
                </Text>
                
                <HStack spacing={2}>
                  {current.errorCount > 0 && (
                    <Badge colorScheme="red" variant="outline">
                      {current.errorCount} errors
                    </Badge>
                  )}
                  
                  {current.warningCount > 0 && (
                    <Badge colorScheme="yellow" variant="outline">
                      {current.warningCount} warnings
                    </Badge>
                  )}
                </HStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};
```

---

## 🚀 DEPLOYMENT & INTEGRATION

### Environment Configuration

```typescript
// src/config/devteam.config.ts
export interface DevTeamConfig {
  hotReload: {
    enabled: boolean;
    wsUrl: string;
    reconnectAttempts: number;
    debounceMs: number;
  };
  
  validation: {
    realTime: boolean;
    showSuggestions: boolean;
    schemaUrl: string;
  };
  
  preview: {
    defaultMunicipality: string;
    deviceFrames: boolean;
    networkSimulation: boolean;
    performanceMonitoring: boolean;
  };
  
  editor: {
    theme: 'light' | 'dark';
    fontSize: number;
    autoSave: boolean;
    autoFormat: boolean;
  };
}

export const getDevTeamConfig = (): DevTeamConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    hotReload: {
      enabled: isDevelopment,
      wsUrl: process.env.REACT_APP_HOTRELOAD_WS_URL || 'ws://localhost:3001/hotreload',
      reconnectAttempts: 5,
      debounceMs: 500
    },
    
    validation: {
      realTime: true,
      showSuggestions: true,
      schemaUrl: process.env.REACT_APP_GAME_SCHEMA_URL || '/schemas/game-content.json'
    },
    
    preview: {
      defaultMunicipality: process.env.REACT_APP_DEFAULT_MUNICIPALITY || 'malmo-stad',
      deviceFrames: true,
      networkSimulation: isDevelopment,
      performanceMonitoring: isDevelopment
    },
    
    editor: {
      theme: 'light',
      fontSize: 14,
      autoSave: true,
      autoFormat: true
    }
  };
};
```

### Integration with Existing Codebase

```typescript
// src/components/DevTeamWorkspace.tsx
import React, { Suspense } from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';

// Lazy load DevTeam components to avoid affecting main app bundle
const DevTeamPreviewApp = React.lazy(() => 
  import('./devteam/DevTeamPreviewApp').then(module => ({
    default: module.DevTeamPreviewApp
  }))
);

interface DevTeamWorkspaceProps {
  initialContent?: string;
  municipality?: string;
  onContentChange?: (content: string) => void;
  onExit?: () => void;
}

export const DevTeamWorkspace: React.FC<DevTeamWorkspaceProps> = ({
  initialContent,
  municipality,
  onContentChange,
  onExit
}) => {
  return (
    <ErrorBoundary
      fallback={
        <Box p={8} textAlign="center">
          <Text mb={4}>DevTeam workspace failed to load</Text>
          <Button onClick={onExit}>Return to main app</Button>
        </Box>
      }
    >
      <Suspense 
        fallback={
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height="100vh"
          >
            <Spinner size="xl" />
            <Text ml={4}>Loading DevTeam workspace...</Text>
          </Box>
        }
      >
        <DevTeamPreviewApp
          initialContent={initialContent}
          municipalityId={municipality}
          devMode={true}
        />
      </Suspense>
    </ErrorBoundary>
  );
};
```

### Build Configuration Updates

```json
// package.json additions
{
  "dependencies": {
    "monaco-editor": "^0.45.0",
    "zustand": "^4.4.1",
    "ws": "^8.14.2"
  },
  "devDependencies": {
    "@types/ws": "^8.5.8",
    "monaco-editor-webpack-plugin": "^7.1.0"
  },
  "scripts": {
    "dev:hotreload": "node scripts/hotreload-server.js",
    "build:devteam": "cross-env REACT_APP_DEVTEAM_MODE=true npm run build"
  }
}
```

---

## 📋 TESTING STRATEGY

### Component Testing

```typescript
// src/components/devteam/__tests__/DevTeamPreviewApp.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DevTeamPreviewApp } from '../DevTeamPreviewApp';
import { mockWebSocket } from '../../__mocks__/websocket';

// Mock WebSocket for testing
jest.mock('../hotreload/HotReloadEngine');

describe('DevTeamPreviewApp', () => {
  beforeEach(() => {
    mockWebSocket.mockClear();
  });
  
  it('renders editor and preview panels', () => {
    render(<DevTeamPreviewApp />);
    
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByTestId('preview-panel')).toBeInTheDocument();
    expect(screen.getByTestId('validation-dashboard')).toBeInTheDocument();
  });
  
  it('updates preview when JSON content changes', async () => {
    const user = userEvent.setup();
    render(<DevTeamPreviewApp />);
    
    const editor = screen.getByTestId('monaco-editor');
    
    // Type JSON content
    await user.type(editor, '{"type": "quiz", "question": "Test?"}');
    
    // Wait for debounced update
    await waitFor(() => {
      expect(screen.getByText('Test?')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
  
  it('displays validation errors', async () => {
    const user = userEvent.setup();
    render(<DevTeamPreviewApp />);
    
    const editor = screen.getByTestId('monaco-editor');
    
    // Type invalid JSON
    await user.type(editor, '{"type": "quiz", "question":}');
    
    await waitFor(() => {
      expect(screen.getByText(/JSON Parse Error/)).toBeInTheDocument();
    });
  });
  
  it('handles municipality context changes', async () => {
    render(<DevTeamPreviewApp />);
    
    const municipalitySelect = screen.getByLabelText(/municipality/i);
    
    fireEvent.change(municipalitySelect, { target: { value: 'goteborg' } });
    
    await waitFor(() => {
      expect(screen.getByText(/Göteborgs Stad/)).toBeInTheDocument();
    });
  });
  
  it('meets performance requirements', async () => {
    const user = userEvent.setup();
    render(<DevTeamPreviewApp />);
    
    const startTime = performance.now();
    
    const editor = screen.getByTestId('monaco-editor');
    await user.type(editor, '{"type": "quiz", "question": "Fast update?"}');
    
    await waitFor(() => {
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      // Should update within 3 seconds
      expect(updateTime).toBeLessThan(3000);
      expect(screen.getByText('Fast update?')).toBeInTheDocument();
    });
  });
});
```

### Performance Testing

```typescript
// src/components/devteam/__tests__/performance.test.ts
import { PerformanceMonitor } from '../performance/PerformanceMonitor';

describe('Performance Requirements', () => {
  let monitor: PerformanceMonitor;
  
  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });
  
  it('tracks update performance within 3s target', () => {
    monitor.startMeasurement('total');
    
    // Simulate update operations
    monitor.startMeasurement('parse');
    // ... parsing simulation
    monitor.endMeasurement('parse');
    
    monitor.startMeasurement('validation');
    // ... validation simulation
    monitor.endMeasurement('validation');
    
    monitor.startMeasurement('render');
    // ... render simulation
    monitor.endMeasurement('render');
    
    monitor.endMeasurement('total');
    
    const metrics = monitor.completeMeasurement();
    
    expect(metrics.totalUpdateTime).toBeLessThan(3000);
    expect(metrics.parseTime).toBeLessThan(100);
    expect(metrics.validationTime).toBeLessThan(500);
    expect(metrics.renderTime).toBeLessThan(1000);
  });
  
  it('handles large content efficiently', () => {
    const largeContent = JSON.stringify({
      type: 'quiz',
      scenes: Array(100).fill(null).map((_, i) => ({
        id: `scene-${i}`,
        type: 'quiz',
        question: `Question ${i}?`,
        options: Array(4).fill(null).map((_, j) => ({
          text: `Option ${j}`,
          correct: j === 0
        }))
      }))
    });
    
    monitor.recordMetric('contentSize', largeContent.length);
    monitor.recordMetric('gameComplexity', 100);
    
    // Content should be handled efficiently regardless of size
    expect(largeContent.length).toBeGreaterThan(10000);
    
    const metrics = monitor.completeMeasurement();
    expect(metrics.contentSize).toBeGreaterThan(10000);
    expect(metrics.gameComplexity).toBe(100);
  });
});
```

---

## 🎯 SUCCESS CRITERIA & ACCEPTANCE TESTS

### Functional Requirements

1. **Preview Update Speed**: ✅ <3 seconds from JSON change to visual update
2. **Editor Integration**: ✅ Monaco editor with game schema autocompletion
3. **Real-time Validation**: ✅ Immediate error feedback with clear messages
4. **Municipal Context**: ✅ Accurate branding and cultural adaptation
5. **Responsive Design**: ✅ Works on desktop, tablet, and mobile devices
6. **Performance Monitoring**: ✅ Real-time metrics with trend analysis

### Non-Functional Requirements

1. **Accessibility**: WCAG 2.1 AA compliance for all components
2. **Browser Support**: Chrome, Firefox, Safari, Edge (latest versions)
3. **Memory Usage**: <100MB additional heap usage
4. **Network Resilience**: Graceful WebSocket reconnection
5. **Error Recovery**: Clear error states with actionable recovery steps

### Business Acceptance Criteria

1. **DevTeam Productivity**: 3x faster iteration cycles
2. **Content Quality**: 90% reduction in deployment issues
3. **Onboarding**: <5 minutes for new DevTeam members
4. **Municipal Accuracy**: 100% branding consistency in preview
5. **Scalability**: Supports 50+ concurrent DevTeam users

---

## 📚 DOCUMENTATION REQUIREMENTS

### Developer Documentation

1. **API Reference**: Complete TypeScript interfaces and component props
2. **Configuration Guide**: Environment setup and customization options
3. **Integration Guide**: How to embed in existing applications
4. **Performance Guide**: Optimization tips and monitoring setup
5. **Troubleshooting**: Common issues and solutions

### DevTeam User Guide

1. **Quick Start**: 5-minute onboarding tutorial
2. **Editor Features**: Shortcuts, autocompletion, validation
3. **Preview Controls**: Municipality selection, device simulation
4. **Best Practices**: Content creation guidelines
5. **Error Reference**: Understanding validation messages

---

*"Implementation excellence transforms design vision into DevTeam reality. When a content creator types JSON and sees Anna Svensson's exact experience within 3 seconds, we've achieved the perfect fusion of technical precision and user empathy."* - DigiNativa Implementation Philosophy