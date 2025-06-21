# Hot-Reload Preview Interface Implementation
## DevTeam Workflow Optimization Specification

**Document Type:** Implementation Specification  
**Version:** 1.0  
**Created:** 2025-06-19  
**Author:** Game Designer  
**Roadmap Reference:** Q1-AO-Milestone-1.2  
**Based On:** proposal-008 (DevTeam Preview Interface Design)  
**Target Users:** Head Developer, System Architect  
**Implementation Priority:** CRITICAL - Enables <3s content preview feedback loops  

---

## 📋 EXECUTIVE SUMMARY

**Purpose:** Transform proposal-008 DevTeam Preview Interface Design into actionable implementation specifications enabling real-time content preview with <3 second update latency for optimal DevTeam workflow.

**Core Requirements:**
- **Performance Target:** <3 second preview updates after JSON changes
- **Component Architecture:** Split-view editor/preview with resizable panes
- **Municipal Context:** Full municipality branding and settings simulation
- **DevTeam Integration:** WebSocket hot-reload with validation dashboard
- **Enterprise Grade:** Professional workflow suitable for municipal contracts

**Success Criteria:**
- Zero-configuration DevTeam onboarding experience
- Real-time validation feedback integration
- Perfect municipal context simulation
- Mobile-responsive preview for all device testing

---

## 🏗️ COMPONENT ARCHITECTURE

### High-Level System Design
```
┌─────────────────────────────────────────────────────────────────┐
│                   HotReloadPreviewApp                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┬─────────────────────────────────────────┐ │
│  │                 │                                         │ │
│  │  EditorPanel    │         PreviewPanel                    │ │
│  │  - Monaco       │         - Game Renderer                 │ │
│  │  - Validation   │         - Municipal Context             │ │
│  │  - Hot Keys     │         - Device Simulation             │ │
│  │                 │                                         │ │
│  └─────────────────┴─────────────────────────────────────────┘ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │               ValidationDashboard                           │ │
│  │               - Real-time status                            │ │
│  │               - Error highlighting                          │ │
│  │               - Performance metrics                         │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy Implementation
```typescript
// src/components/devteam/HotReloadPreviewApp.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { EditorPanel } from './EditorPanel/EditorPanel';
import { PreviewPanel } from './PreviewPanel/PreviewPanel';
import { ValidationDashboard } from './ValidationDashboard/ValidationDashboard';
import { HotReloadProvider } from './providers/HotReloadProvider';
import { PreviewStateProvider } from './providers/PreviewStateProvider';
import { ValidationProvider } from './providers/ValidationProvider';
import { MunicipalContextProvider } from './providers/MunicipalContextProvider';

interface HotReloadPreviewAppProps {
  initialContent?: string;
  municipalityId?: string;
  devMode?: boolean;
  onContentChange?: (content: string) => void;
  onValidationChange?: (results: ValidationResults) => void;
}

export const HotReloadPreviewApp: React.FC<HotReloadPreviewAppProps> = ({
  initialContent = '',
  municipalityId = 'malmo-stad',
  devMode = true,
  onContentChange,
  onValidationChange
}) => {
  return (
    <PreviewStateProvider initialContent={initialContent}>
      <ValidationProvider onValidationChange={onValidationChange}>
        <HotReloadProvider enabled={devMode}>
          <MunicipalContextProvider municipalityId={municipalityId}>
            <PreviewLayout 
              onContentChange={onContentChange}
            />
          </MunicipalContextProvider>
        </HotReloadProvider>
      </ValidationProvider>
    </PreviewStateProvider>
  );
};

// Main layout component
const PreviewLayout: React.FC<{
  onContentChange?: (content: string) => void;
}> = ({ onContentChange }) => {
  const [panelSizes, setPanelSizes] = useState([50, 50]);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box 
      height="100vh" 
      width="100vw" 
      bg={bgColor}
      display="flex"
      flexDirection="column"
    >
      <PreviewToolbar />
      
      <Box flex={1} display="flex" overflow="hidden">
        <ResizablePanels
          sizes={panelSizes}
          onResize={setPanelSizes}
          minSizes={[300, 400]}
        >
          <EditorPanel onContentChange={onContentChange} />
          <PreviewPanel />
        </ResizablePanels>
      </Box>
      
      <ValidationDashboard />
    </Box>
  );
};
```

---

## 📝 EDITOR PANEL IMPLEMENTATION

### Monaco Editor Integration
```typescript
// src/components/devteam/EditorPanel/EditorPanel.tsx
import React, { useCallback, useRef, useEffect } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { Editor } from '@monaco-editor/react';
import { EditorToolbar } from './EditorToolbar';
import { TabManager } from './TabManager';
import { usePreviewState } from '../providers/PreviewStateProvider';
import { useValidation } from '../providers/ValidationProvider';
import { useHotReload } from '../providers/HotReloadProvider';

interface EditorPanelProps {
  onContentChange?: (content: string) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  onContentChange
}) => {
  const editorRef = useRef<any>(null);
  const { content, updateContent } = usePreviewState();
  const { validateContent } = useValidation();
  const { triggerHotReload } = useHotReload();
  
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Configure JSON schema validation
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: "http://diginativa.se/game-content-schema.json",
          fileMatch: ["*"],
          schema: {
            type: "object",
            properties: {
              scenes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { 
                      type: "string",
                      enum: ["intro", "quiz", "dialogue", "ending"]
                    },
                    title: { type: "string" },
                    content: { type: "string" }
                  },
                  required: ["type", "title"]
                }
              }
            },
            required: ["scenes"]
          }
        }
      ]
    });
    
    // Configure editor shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      triggerHotReload();
    });
  }, []);
  
  const handleContentChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      updateContent(value);
      onContentChange?.(value);
      
      // Trigger validation with debouncing
      const debounceTimer = setTimeout(() => {
        validateContent(value);
        triggerHotReload();
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [updateContent, onContentChange, validateContent, triggerHotReload]);
  
  const handleSave = useCallback(() => {
    // Implement save functionality
    console.log('Saving content...');
  }, []);
  
  return (
    <VStack spacing={0} height="100%" width="100%">
      <EditorToolbar onSave={handleSave} />
      
      <TabManager />
      
      <Box flex={1} width="100%">
        <Editor
          height="100%"
          language="json"
          value={content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            automaticLayout: true,
            folding: true,
            bracketMatching: 'always',
            autoIndent: 'advanced',
            formatOnPaste: true,
            formatOnType: true,
            tabSize: 2,
            insertSpaces: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true
          }}
        />
      </Box>
    </VStack>
  );
};
```

### Editor Toolbar Components
```typescript
// src/components/devteam/EditorPanel/EditorToolbar.tsx
import React from 'react';
import { 
  HStack, 
  IconButton, 
  Text, 
  Spacer, 
  Badge,
  useColorModeValue 
} from '@chakra-ui/react';
import { 
  FaSave, 
  FaPlay, 
  FaCog, 
  FaExpand,
  FaCode
} from 'react-icons/fa';
import { useValidation } from '../providers/ValidationProvider';

interface EditorToolbarProps {
  onSave: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  onSave
}) => {
  const { validationResults } = useValidation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const getValidationBadge = () => {
    if (!validationResults) return null;
    
    const { errors, warnings } = validationResults;
    const totalIssues = errors.length + warnings.length;
    
    if (totalIssues === 0) {
      return <Badge colorScheme="green">Valid</Badge>;
    }
    
    return (
      <Badge colorScheme={errors.length > 0 ? 'red' : 'yellow'}>
        {totalIssues} issue{totalIssues !== 1 ? 's' : ''}
      </Badge>
    );
  };
  
  return (
    <HStack
      width="100%"
      padding={3}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      spacing={2}
    >
      <Text fontSize="sm" fontWeight="medium" color="gray.600">
        Content Editor
      </Text>
      
      {getValidationBadge()}
      
      <Spacer />
      
      <IconButton
        aria-label="Save content"
        icon={<FaSave />}
        size="sm"
        variant="ghost"
        onClick={onSave}
      />
      
      <IconButton
        aria-label="Preview content"
        icon={<FaPlay />}
        size="sm"
        variant="ghost"
        colorScheme="blue"
      />
      
      <IconButton
        aria-label="Format JSON"
        icon={<FaCode />}
        size="sm"
        variant="ghost"
      />
      
      <IconButton
        aria-label="Settings"
        icon={<FaCog />}
        size="sm"
        variant="ghost"
      />
    </HStack>
  );
};
```

---

## 🎮 PREVIEW PANEL IMPLEMENTATION

### Game Renderer Integration
```typescript
// src/components/devteam/PreviewPanel/PreviewPanel.tsx
import React, { useMemo } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { PreviewToolbar } from './PreviewToolbar';
import { DeviceFrame } from './DeviceFrame';
import { MunicipalContextControls } from './MunicipalContextControls';
import { GameRenderer } from '../../GameContainer/GameContainer';
import { usePreviewState } from '../providers/PreviewStateProvider';
import { useMunicipalContext } from '../providers/MunicipalContextProvider';
import { useValidation } from '../providers/ValidationProvider';

export const PreviewPanel: React.FC = () => {
  const { content } = usePreviewState();
  const { municipality, deviceType } = useMunicipalContext();
  const { validationResults } = useValidation();
  
  const gameContent = useMemo(() => {
    try {
      return JSON.parse(content || '{}');
    } catch (error) {
      return null;
    }
  }, [content]);
  
  const isValid = validationResults?.errors.length === 0;
  
  return (
    <VStack spacing={0} height="100%" width="100%">
      <PreviewToolbar />
      
      <MunicipalContextControls />
      
      <Box flex={1} width="100%" overflow="hidden">
        <DeviceFrame deviceType={deviceType}>
          {isValid && gameContent ? (
            <GameRenderer
              gameContent={gameContent}
              municipality={municipality}
              devMode={true}
            />
          ) : (
            <PreviewErrorState 
              validationResults={validationResults}
              hasContent={!!content}
            />
          )}
        </DeviceFrame>
      </Box>
    </VStack>
  );
};

// Error state for invalid content
const PreviewErrorState: React.FC<{
  validationResults?: ValidationResults;
  hasContent: boolean;
}> = ({ validationResults, hasContent }) => {
  return (
    <Box
      height="100%"
      width="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
      color="gray.600"
      textAlign="center"
      padding={6}
    >
      {!hasContent ? (
        <Text>Start typing JSON content to see preview...</Text>
      ) : (
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="medium">
            Unable to preview content
          </Text>
          {validationResults?.errors.map((error, index) => (
            <Text key={index} fontSize="sm" color="red.500">
              {error.message}
            </Text>
          ))}
        </VStack>
      )}
    </Box>
  );
};
```

### Device Frame Simulation
```typescript
// src/components/devteam/PreviewPanel/DeviceFrame.tsx
import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';

interface DeviceFrameProps {
  deviceType: 'desktop' | 'tablet' | 'mobile';
  children: React.ReactNode;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  deviceType,
  children
}) => {
  const frameColor = useColorModeValue('gray.300', 'gray.600');
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const getDeviceDimensions = () => {
    switch (deviceType) {
      case 'mobile':
        return { width: '390px', height: '844px' }; // iPhone 12
      case 'tablet':
        return { width: '768px', height: '1024px' }; // iPad
      case 'desktop':
      default:
        return { width: '100%', height: '100%' };
    }
  };
  
  const dimensions = getDeviceDimensions();
  const isMobileOrTablet = deviceType !== 'desktop';
  
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.100"
      padding={isMobileOrTablet ? 4 : 0}
    >
      <Box
        width={dimensions.width}
        height={dimensions.height}
        maxWidth="100%"
        maxHeight="100%"
        bg={bgColor}
        border={isMobileOrTablet ? "8px solid" : "none"}
        borderColor={frameColor}
        borderRadius={isMobileOrTablet ? "24px" : "none"}
        overflow="hidden"
        position="relative"
        boxShadow={isMobileOrTablet ? "0 0 20px rgba(0,0,0,0.1)" : "none"}
      >
        {isMobileOrTablet && (
          <>
            {/* Device notch for mobile */}
            {deviceType === 'mobile' && (
              <Box
                position="absolute"
                top="0"
                left="50%"
                transform="translateX(-50%)"
                width="150px"
                height="25px"
                bg={frameColor}
                borderBottomRadius="16px"
                zIndex={10}
              />
            )}
            
            {/* Home indicator for mobile */}
            {deviceType === 'mobile' && (
              <Box
                position="absolute"
                bottom="8px"
                left="50%"
                transform="translateX(-50%)"
                width="134px"
                height="5px"
                bg="gray.400"
                borderRadius="3px"
                zIndex={10}
              />
            )}
          </>
        )}
        
        <Box
          width="100%"
          height="100%"
          paddingTop={deviceType === 'mobile' ? "25px" : "0"}
          paddingBottom={deviceType === 'mobile' ? "20px" : "0"}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
```

---

## 🏛️ MUNICIPAL CONTEXT CONTROLS

### Context Provider Implementation
```typescript
// src/components/devteam/providers/MunicipalContextProvider.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

interface Municipality {
  id: string;
  name: string;
  primaryColor: string;
  logo: string;
  language: 'sv' | 'de' | 'fr' | 'nl';
  region: 'sweden' | 'germany' | 'france' | 'netherlands';
}

interface MunicipalContextState {
  municipality: Municipality;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  theme: 'light' | 'dark';
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

interface MunicipalContextValue extends MunicipalContextState {
  setMunicipality: (municipality: Municipality) => void;
  setDeviceType: (type: 'desktop' | 'tablet' | 'mobile') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateAccessibility: (settings: Partial<MunicipalContextState['accessibility']>) => void;
}

const MunicipalContext = createContext<MunicipalContextValue | undefined>(undefined);

export const useMunicipalContext = () => {
  const context = useContext(MunicipalContext);
  if (!context) {
    throw new Error('useMunicipalContext must be used within MunicipalContextProvider');
  }
  return context;
};

const DEFAULT_MUNICIPALITIES: Record<string, Municipality> = {
  'malmo-stad': {
    id: 'malmo-stad',
    name: 'Malmö Stad',
    primaryColor: '#0066CC',
    logo: '/assets/logos/malmo-stad.svg',
    language: 'sv',
    region: 'sweden'
  },
  'cologne': {
    id: 'cologne',
    name: 'Stadt Köln',
    primaryColor: '#C41E3A',
    logo: '/assets/logos/cologne.svg',
    language: 'de',
    region: 'germany'
  },
  'paris': {
    id: 'paris',
    name: 'Ville de Paris',
    primaryColor: '#003366',
    logo: '/assets/logos/paris.svg',
    language: 'fr',
    region: 'france'
  },
  'amsterdam': {
    id: 'amsterdam',
    name: 'Gemeente Amsterdam',
    primaryColor: '#ED1C24',
    logo: '/assets/logos/amsterdam.svg',
    language: 'nl',
    region: 'netherlands'
  }
};

export const MunicipalContextProvider: React.FC<{
  children: React.ReactNode;
  municipalityId?: string;
}> = ({ children, municipalityId = 'malmo-stad' }) => {
  const [state, setState] = useState<MunicipalContextState>({
    municipality: DEFAULT_MUNICIPALITIES[municipalityId],
    deviceType: 'desktop',
    theme: 'light',
    accessibility: {
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium'
    }
  });
  
  const setMunicipality = useCallback((municipality: Municipality) => {
    setState(prev => ({ ...prev, municipality }));
  }, []);
  
  const setDeviceType = useCallback((deviceType: 'desktop' | 'tablet' | 'mobile') => {
    setState(prev => ({ ...prev, deviceType }));
  }, []);
  
  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setState(prev => ({ ...prev, theme }));
  }, []);
  
  const updateAccessibility = useCallback((settings: Partial<MunicipalContextState['accessibility']>) => {
    setState(prev => ({ 
      ...prev, 
      accessibility: { ...prev.accessibility, ...settings }
    }));
  }, []);
  
  const value: MunicipalContextValue = {
    ...state,
    setMunicipality,
    setDeviceType,
    setTheme,
    updateAccessibility
  };
  
  return (
    <MunicipalContext.Provider value={value}>
      {children}
    </MunicipalContext.Provider>
  );
};
```

### Municipal Context Controls UI
```typescript
// src/components/devteam/PreviewPanel/MunicipalContextControls.tsx
import React from 'react';
import {
  HStack,
  Select,
  IconButton,
  Text,
  Spacer,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { 
  FaDesktop, 
  FaTabletAlt, 
  FaMobile,
  FaMoon,
  FaSun,
  FaAccessibleIcon
} from 'react-icons/fa';
import { useMunicipalContext } from '../providers/MunicipalContextProvider';

export const MunicipalContextControls: React.FC = () => {
  const {
    municipality,
    deviceType,
    theme,
    accessibility,
    setMunicipality,
    setDeviceType,
    setTheme,
    updateAccessibility
  } = useMunicipalContext();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const municipalities = [
    { id: 'malmo-stad', name: 'Malmö Stad (🇸🇪)' },
    { id: 'cologne', name: 'Stadt Köln (🇩🇪)' },
    { id: 'paris', name: 'Ville de Paris (🇫🇷)' },
    { id: 'amsterdam', name: 'Amsterdam (🇳🇱)' }
  ];
  
  return (
    <HStack
      width="100%"
      padding={3}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      spacing={4}
    >
      <Text fontSize="sm" fontWeight="medium" color="gray.600">
        Preview Context:
      </Text>
      
      <Select
        value={municipality.id}
        onChange={(e) => {
          const newMunicipality = municipalities.find(m => m.id === e.target.value);
          if (newMunicipality) {
            // In real implementation, load municipality config
            console.log('Switch to municipality:', newMunicipality.id);
          }
        }}
        size="sm"
        width="200px"
      >
        {municipalities.map(muni => (
          <option key={muni.id} value={muni.id}>
            {muni.name}
          </option>
        ))}
      </Select>
      
      <Spacer />
      
      <HStack spacing={1}>
        <Tooltip label="Desktop Preview">
          <IconButton
            aria-label="Desktop preview"
            icon={<FaDesktop />}
            size="sm"
            variant={deviceType === 'desktop' ? 'solid' : 'ghost'}
            onClick={() => setDeviceType('desktop')}
          />
        </Tooltip>
        
        <Tooltip label="Tablet Preview">
          <IconButton
            aria-label="Tablet preview"
            icon={<FaTabletAlt />}
            size="sm"
            variant={deviceType === 'tablet' ? 'solid' : 'ghost'}
            onClick={() => setDeviceType('tablet')}
          />
        </Tooltip>
        
        <Tooltip label="Mobile Preview (iPhone 12)">
          <IconButton
            aria-label="Mobile preview"
            icon={<FaMobile />}
            size="sm"
            variant={deviceType === 'mobile' ? 'solid' : 'ghost'}
            onClick={() => setDeviceType('mobile')}
          />
        </Tooltip>
      </HStack>
      
      <Tooltip label="Toggle Theme">
        <IconButton
          aria-label="Toggle theme"
          icon={theme === 'light' ? <FaMoon /> : <FaSun />}
          size="sm"
          variant="ghost"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />
      </Tooltip>
      
      <Tooltip label="Accessibility Settings">
        <IconButton
          aria-label="Accessibility settings"
          icon={<FaAccessibleIcon />}
          size="sm"
          variant={accessibility.highContrast ? 'solid' : 'ghost'}
          onClick={() => updateAccessibility({ 
            highContrast: !accessibility.highContrast 
          })}
        />
      </Tooltip>
    </HStack>
  );
};
```

---

## ⚡ HOT-RELOAD IMPLEMENTATION

### WebSocket Hot-Reload Provider
```typescript
// src/components/devteam/providers/HotReloadProvider.tsx
import React, { createContext, useContext, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@chakra-ui/react';

interface HotReloadContextValue {
  isConnected: boolean;
  triggerHotReload: () => void;
  lastUpdate: Date | null;
  updateCount: number;
}

const HotReloadContext = createContext<HotReloadContextValue | undefined>(undefined);

export const useHotReload = () => {
  const context = useContext(HotReloadContext);
  if (!context) {
    throw new Error('useHotReload must be used within HotReloadProvider');
  }
  return context;
};

export const HotReloadProvider: React.FC<{
  children: React.ReactNode;
  enabled?: boolean;
}> = ({ children, enabled = true }) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [updateCount, setUpdateCount] = React.useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const toast = useToast();
  
  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!enabled) return;
    
    try {
      const wsUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3001/hot-reload'
        : `wss://${window.location.host}/hot-reload`;
        
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        console.log('Hot-reload WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.type === 'hot-reload') {
            setLastUpdate(new Date());
            setUpdateCount(prev => prev + 1);
            
            // Trigger preview update
            window.dispatchEvent(new CustomEvent('hot-reload-update', {
              detail: message.data
            }));
          }
        } catch (error) {
          console.error('Error parsing hot-reload message:', error);
        }
      };
      
      wsRef.current.onclose = () => {
        setIsConnected(false);
        console.log('Hot-reload WebSocket disconnected');
        
        // Attempt reconnection
        if (enabled) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('Hot-reload WebSocket error:', error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      
      // Retry connection
      if (enabled) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      }
    }
  }, [enabled]);
  
  const triggerHotReload = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'trigger-reload',
        timestamp: new Date().toISOString()
      }));
    } else {
      // Fallback to manual reload
      setLastUpdate(new Date());
      setUpdateCount(prev => prev + 1);
      
      window.dispatchEvent(new CustomEvent('hot-reload-update', {
        detail: { manual: true }
      }));
    }
  }, []);
  
  // Initialize WebSocket connection
  useEffect(() => {
    if (enabled) {
      connectWebSocket();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled, connectWebSocket]);
  
  const value: HotReloadContextValue = {
    isConnected,
    triggerHotReload,
    lastUpdate,
    updateCount
  };
  
  return (
    <HotReloadContext.Provider value={value}>
      {children}
    </HotReloadContext.Provider>
  );
};
```

---

## 📊 VALIDATION DASHBOARD

### Real-Time Validation Display
```typescript
// src/components/devteam/ValidationDashboard/ValidationDashboard.tsx
import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  Icon,
  Collapse,
  useDisclosure,
  useColorModeValue
} from '@chakra-ui/react';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { useValidation } from '../providers/ValidationProvider';
import { useHotReload } from '../providers/HotReloadProvider';

export const ValidationDashboard: React.FC = () => {
  const { validationResults } = useValidation();
  const { isConnected, lastUpdate, updateCount } = useHotReload();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  if (!validationResults) return null;
  
  const { errors, warnings, info } = validationResults;
  const hasIssues = errors.length > 0 || warnings.length > 0;
  
  const getStatusColor = () => {
    if (errors.length > 0) return 'red';
    if (warnings.length > 0) return 'yellow';
    return 'green';
  };
  
  const getStatusIcon = () => {
    if (errors.length > 0) return FaTimesCircle;
    if (warnings.length > 0) return FaExclamationTriangle;
    return FaCheckCircle;
  };
  
  return (
    <Box
      width="100%"
      bg={bgColor}
      borderTop="1px"
      borderColor={borderColor}
      maxHeight={isOpen ? "300px" : "auto"}
      overflow="hidden"
    >
      {/* Dashboard Header */}
      <HStack
        padding={3}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
      >
        <Icon
          as={getStatusIcon()}
          color={`${getStatusColor()}.500`}
          boxSize={4}
        />
        
        <Text fontSize="sm" fontWeight="medium">
          Validation Dashboard
        </Text>
        
        <HStack spacing={2}>
          {errors.length > 0 && (
            <Badge colorScheme="red" variant="subtle">
              {errors.length} error{errors.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {warnings.length > 0 && (
            <Badge colorScheme="yellow" variant="subtle">
              {warnings.length} warning{warnings.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {!hasIssues && (
            <Badge colorScheme="green" variant="subtle">
              Valid
            </Badge>
          )}
        </HStack>
        
        <Box flex={1} />
        
        <HStack spacing={2} fontSize="xs" color="gray.500">
          <Text>
            WS: {isConnected ? '🟢' : '🔴'}
          </Text>
          
          {lastUpdate && (
            <Text>
              Last: {lastUpdate.toLocaleTimeString()}
            </Text>
          )}
          
          <Text>
            Updates: {updateCount}
          </Text>
        </HStack>
        
        <Icon as={isOpen ? FaChevronDown : FaChevronUp} boxSize={3} />
      </HStack>
      
      {/* Dashboard Content */}
      <Collapse in={isOpen}>
        <Box
          maxHeight="250px"
          overflowY="auto"
          padding={3}
          borderTop="1px"
          borderColor={borderColor}
        >
          <VStack spacing={3} align="stretch">
            {/* Errors */}
            {errors.length > 0 && (
              <ValidationSection
                title="Errors"
                items={errors}
                colorScheme="red"
                icon={FaTimesCircle}
              />
            )}
            
            {/* Warnings */}
            {warnings.length > 0 && (
              <ValidationSection
                title="Warnings"
                items={warnings}
                colorScheme="yellow"
                icon={FaExclamationTriangle}
              />
            )}
            
            {/* Info */}
            {info.length > 0 && (
              <ValidationSection
                title="Information"
                items={info}
                colorScheme="blue"
                icon={FaCheckCircle}
              />
            )}
            
            {/* Success state */}
            {!hasIssues && (
              <Box textAlign="center" padding={4}>
                <Icon as={FaCheckCircle} color="green.500" boxSize={8} />
                <Text color="green.500" fontWeight="medium" marginTop={2}>
                  Content validates successfully
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Ready for preview and deployment
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  );
};

// Individual validation section component
const ValidationSection: React.FC<{
  title: string;
  items: ValidationItem[];
  colorScheme: string;
  icon: any;
}> = ({ title, items, colorScheme, icon }) => {
  return (
    <Box>
      <HStack marginBottom={2}>
        <Icon as={icon} color={`${colorScheme}.500`} boxSize={4} />
        <Text fontSize="sm" fontWeight="medium">
          {title} ({items.length})
        </Text>
      </HStack>
      
      <VStack spacing={1} align="stretch" paddingLeft={6}>
        {items.map((item, index) => (
          <Box
            key={index}
            padding={2}
            bg={useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`)}
            borderLeft="3px solid"
            borderLeftColor={`${colorScheme}.500`}
            borderRadius="md"
          >
            <Text fontSize="sm" fontWeight="medium">
              {item.message}
            </Text>
            {item.path && (
              <Text fontSize="xs" color="gray.500">
                Path: {item.path}
              </Text>
            )}
            {item.suggestion && (
              <Text fontSize="xs" color={`${colorScheme}.600`}>
                Suggestion: {item.suggestion}
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### <3 Second Update Target Implementation
```typescript
// src/components/devteam/providers/PreviewStateProvider.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface PreviewStateContextValue {
  content: string;
  updateContent: (content: string) => void;
  lastUpdateTime: number | null;
  averageUpdateTime: number;
  updateHistory: number[];
}

const PreviewStateContext = createContext<PreviewStateContextValue | undefined>(undefined);

export const usePreviewState = () => {
  const context = useContext(PreviewStateContext);
  if (!context) {
    throw new Error('usePreviewState must be used within PreviewStateProvider');
  }
  return context;
};

export const PreviewStateProvider: React.FC<{
  children: React.ReactNode;
  initialContent?: string;
}> = ({ children, initialContent = '' }) => {
  const [content, setContent] = useState(initialContent);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);
  const [updateHistory, setUpdateHistory] = useState<number[]>([]);
  const updateStartTimeRef = useRef<number>(0);
  
  const updateContent = useCallback((newContent: string) => {
    const startTime = performance.now();
    updateStartTimeRef.current = startTime;
    
    // Batch updates to prevent excessive re-renders
    setContent(newContent);
    
    // Measure update performance
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const updateTime = endTime - startTime;
      
      setLastUpdateTime(updateTime);
      setUpdateHistory(prev => {
        const newHistory = [...prev, updateTime].slice(-10); // Keep last 10 updates
        return newHistory;
      });
      
      // Log performance warnings
      if (updateTime > 3000) {
        console.warn(`Preview update took ${updateTime.toFixed(2)}ms - exceeds 3s target`);
      }
    });
  }, []);
  
  const averageUpdateTime = updateHistory.length > 0
    ? updateHistory.reduce((sum, time) => sum + time, 0) / updateHistory.length
    : 0;
  
  const value: PreviewStateContextValue = {
    content,
    updateContent,
    lastUpdateTime,
    averageUpdateTime,
    updateHistory
  };
  
  return (
    <PreviewStateContext.Provider value={value}>
      {children}
    </PreviewStateContext.Provider>
  );
};
```

### Performance Monitoring Component
```typescript
// src/components/devteam/PerformanceMonitor.tsx
import React from 'react';
import { Box, Text, HStack, Progress, useColorModeValue } from '@chakra-ui/react';
import { usePreviewState } from './providers/PreviewStateProvider';

export const PerformanceMonitor: React.FC = () => {
  const { lastUpdateTime, averageUpdateTime, updateHistory } = usePreviewState();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  const getPerformanceColor = (time: number) => {
    if (time < 1000) return 'green';
    if (time < 2000) return 'yellow';
    return 'red';
  };
  
  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg={bgColor}
      padding={3}
      borderRadius="md"
      boxShadow="md"
      fontSize="xs"
      minWidth="200px"
    >
      <Text fontWeight="bold" marginBottom={2}>
        Preview Performance
      </Text>
      
      {lastUpdateTime !== null && (
        <HStack justify="space-between" marginBottom={1}>
          <Text>Last Update:</Text>
          <Text color={`${getPerformanceColor(lastUpdateTime)}.500`}>
            {lastUpdateTime.toFixed(0)}ms
          </Text>
        </HStack>
      )}
      
      <HStack justify="space-between" marginBottom={1}>
        <Text>Average:</Text>
        <Text color={`${getPerformanceColor(averageUpdateTime)}.500`}>
          {averageUpdateTime.toFixed(0)}ms
        </Text>
      </HStack>
      
      <Box marginTop={2}>
        <Text marginBottom={1}>Target: &lt;3000ms</Text>
        <Progress
          value={Math.min((averageUpdateTime / 3000) * 100, 100)}
          colorScheme={getPerformanceColor(averageUpdateTime)}
          size="sm"
        />
      </Box>
      
      {updateHistory.length >= 3 && (
        <Text marginTop={2} fontSize="2xs" color="gray.500">
          Trend: {updateHistory.slice(-3).every((time, i, arr) => 
            i === 0 || time <= arr[i-1]
          ) ? '📈 Improving' : '📉 Degrading'}
        </Text>
      )}
    </Box>
  );
};
```

---

## 🎯 INTEGRATION GUIDELINES

### Head Developer Implementation Checklist
```typescript
// Integration steps for Head Developer
interface ImplementationChecklist {
  setup: [
    "Install @monaco-editor/react dependency",
    "Configure WebSocket server for hot-reload",
    "Set up development environment variables",
    "Create component directory structure"
  ];
  
  development: [
    "Implement HotReloadPreviewApp main component",
    "Create provider components (state, validation, hot-reload, municipal context)",
    "Build EditorPanel with Monaco integration",
    "Implement PreviewPanel with game renderer",
    "Add ValidationDashboard with real-time feedback",
    "Configure municipal context controls"
  ];
  
  testing: [
    "Test <3 second preview update performance",
    "Validate WebSocket reconnection logic",
    "Test all device frame simulations",
    "Verify municipal context switching",
    "Test validation error display",
    "Performance test with large JSON files"
  ];
  
  integration: [
    "Connect to existing GameContainer component",
    "Integrate with DevTeamContentValidator",
    "Add municipal branding system",
    "Configure accessibility features",
    "Set up error monitoring",
    "Document API endpoints needed"
  ];
}
```

### Required Backend Endpoints
```typescript
interface RequiredEndpoints {
  webSocket: {
    path: "/hot-reload";
    protocol: "ws" | "wss";
    events: [
      "connection",
      "hot-reload-trigger", 
      "content-update",
      "validation-result",
      "disconnection"
    ];
  };
  
  rest: {
    "/api/municipalities": {
      method: "GET";
      response: "Municipality[]";
      purpose: "Load available municipalities for context selection";
    };
    
    "/api/validate": {
      method: "POST";
      body: "{ content: string }";
      response: "ValidationResults";
      purpose: "Server-side content validation";
    };
    
    "/api/preview/save": {
      method: "POST";
      body: "{ content: string, municipalityId: string }";
      response: "{ success: boolean, id: string }";
      purpose: "Save preview content for sharing";
    };
  };
}
```

---

## 📊 SUCCESS METRICS

### Performance Targets
- **Preview Update Time:** <3 seconds (CRITICAL)
- **WebSocket Reconnection:** <5 seconds
- **JSON Parsing:** <100ms for files up to 1MB
- **Component Render:** <16ms per frame (60fps)
- **Memory Usage:** <50MB for preview application

### User Experience Metrics
- **DevTeam Onboarding:** Zero configuration required
- **Error Recovery:** Self-service resolution >80%
- **Municipal Context:** 100% accurate branding simulation
- **Device Testing:** Perfect mobile/tablet/desktop preview
- **Validation Feedback:** Real-time with <500ms delay

### Integration Success
- **Component Isolation:** No conflicts with existing code
- **API Compatibility:** Full integration with validation system
- **Municipal Branding:** Support for 4+ European regions
- **Accessibility:** WCAG 2.1 AA compliance maintained
- **Documentation:** Complete implementation guide provided

---

*"The preview interface bridges the gap between DevTeam creativity and technical implementation. When content creators can see their vision rendered instantly with perfect municipal context, productivity soars and quality increases exponentially."* - DigiNativa Development Philosophy