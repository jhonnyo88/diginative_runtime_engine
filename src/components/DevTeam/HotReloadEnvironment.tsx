/**
 * Hot-Reload Development Environment
 * Q1-AO-Milestone-1.2 DevTeam Integration Component
 * 
 * Provides real-time preview interface for DevTeam content creation
 * Target: <3 second feedback loop for 10x faster iteration speed
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Progress,
  Badge,
  Tooltip,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  Code,
  Collapse,
  useColorModeValue
} from '@chakra-ui/react';
import {
  FiPlay,
  FiRefreshCw,
  FiSave,
  FiDownload,
  FiUpload,
  FiSettings,
  FiEye,
  FiCode,
  FiMonitor,
  FiZap,
  FiCheckCircle,
  FiAlertTriangle,
  FiX
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { DevTeamContentValidator } from '../../validation/devteam-content-validator';
import { GameContainer } from '../GameContainer/GameContainer';

// Motion components
const MotionBox = motion(Box);

// Hot-reload environment props
interface HotReloadEnvironmentProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
  municipalTheme?: 'sweden' | 'germany' | 'france' | 'netherlands';
  environment?: 'development' | 'staging' | 'production';
}

// Validation status type
interface ValidationStatus {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
    type: string;
  }>;
  warnings: Array<{
    path: string;
    message: string;
    type: string;
  }>;
  processingTime: number;
}

// Preview mode type
type PreviewMode = 'split' | 'preview-only' | 'editor-only';

/**
 * Hot-Reload Development Environment Component
 */
export const HotReloadEnvironment: React.FC<HotReloadEnvironmentProps> = ({
  initialContent = '',
  onContentChange,
  municipalTheme = 'sweden',
  environment = 'development'
}) => {
  // State management
  const [content, setContent] = useState(initialContent);
  const [parsedContent, setParsedContent] = useState<Record<string, unknown>>(null);
  const [validationStatus, setValidationStatus] = useState<ValidationStatus | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('split');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoValidation, setAutoValidation] = useState(true);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  
  // Refs
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket>();
  
  // Hooks
  const toast = useToast();
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const editorBg = useColorModeValue('gray.50', 'gray.900');
  
  // Initialize validator
  const validator = new DevTeamContentValidator();
  
  // WebSocket connection for real-time validation
  useEffect(() => {
    if (environment === 'development') {
      const ws = new WebSocket('ws://localhost:3001/devteam-validation');
      
      ws.onopen = () => {
        console.log('DevTeam validation WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const result = JSON.parse(event.data);
          if (result.type === 'validation') {
            setValidationStatus(result.data);
            setIsValidating(false);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.warn('WebSocket validation error:', error);
        // Fallback to local validation
      };
      
      wsRef.current = ws;
      
      return () => {
        ws.close();
      };
    }
  }, [environment]);
  
  // Auto-validation with debouncing
  const validateContent = useCallback(async (contentToValidate: string) => {
    if (!contentToValidate.trim()) {
      setValidationStatus(null);
      return;
    }
    
    setIsValidating(true);
    const startTime = performance.now();
    
    try {
      // Try WebSocket validation first
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'validate',
          content: contentToValidate,
          timestamp: Date.now()
        }));
      } else {
        // Fallback to local validation
        let parsedJson;
        try {
          parsedJson = JSON.parse(contentToValidate);
        } catch (parseError) {
          setValidationStatus({
            isValid: false,
            errors: [{
              path: 'root',
              message: 'Invalid JSON format',
              type: 'parse_error'
            }],
            warnings: [],
            processingTime: performance.now() - startTime
          });
          setIsValidating(false);
          return;
        }
        
        const result = validator.validateGameManifest(parsedJson);
        const processingTime = performance.now() - startTime;
        
        setValidationStatus({
          isValid: result.isValid,
          errors: result.errors,
          warnings: result.warnings,
          processingTime
        });
        
        if (result.isValid) {
          setParsedContent(parsedJson);
        }
        
        setIsValidating(false);
      }
    } catch (error) {
      setValidationStatus({
        isValid: false,
        errors: [{
          path: 'validation',
          message: 'Validation service error',
          type: 'service_error'
        }],
        warnings: [],
        processingTime: performance.now() - startTime
      });
      setIsValidating(false);
    }
  }, [validator]);
  
  // Debounced validation
  useEffect(() => {
    if (autoValidation && content) {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      
      validationTimeoutRef.current = setTimeout(() => {
        validateContent(content);
      }, 500); // 500ms debounce for responsive feel
    }
    
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [content, autoValidation, validateContent]);
  
  // Handle content change
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setLastUpdate(new Date());
    onContentChange?.(newContent);
  };
  
  // Manual validation trigger
  const handleValidateNow = () => {
    validateContent(content);
  };
  
  // Load example content
  const loadExampleContent = () => {
    const exampleGame = {
      gameId: 'devteam-example-001',
      version: '1.0.0',
      metadata: {
        title: 'GDPR Training Example',
        description: 'Example game for DevTeam testing',
        duration: '5 minutes',
        targetAudience: 'Municipal employees',
        language: 'sv'
      },
      scenes: [
        {
          id: 'scene-1',
          type: 'dialogue',
          messages: [
            {
              text: 'Välkommen till GDPR-utbildningen!',
              characterId: 'instructor'
            }
          ]
        },
        {
          id: 'scene-2',
          type: 'quiz',
          question: 'Vad står GDPR för?',
          options: [
            {
              id: 'opt-1',
              text: 'General Data Protection Regulation',
              isCorrect: true
            },
            {
              id: 'opt-2',
              text: 'Global Data Privacy Rules',
              isCorrect: false
            }
          ]
        }
      ]
    };
    
    handleContentChange(JSON.stringify(exampleGame, null, 2));
  };
  
  // Save content
  const handleSave = () => {
    if (validationStatus?.isValid) {
      toast({
        title: 'Content Saved',
        description: 'Valid content has been saved successfully',
        status: 'success',
        duration: 2000,
        isClosable: true
      });
    } else {
      toast({
        title: 'Cannot Save',
        description: 'Please fix validation errors before saving',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };
  
  // Render validation status
  const renderValidationStatus = () => (
    <VStack spacing={3} align="stretch">
      {/* Validation Progress */}
      {isValidating && (
        <Box>
          <HStack justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">Validating content...</Text>
            <Spinner size="sm" color="blue.500" />
          </HStack>
          <Progress size="sm" isIndeterminate colorScheme="blue" />
        </Box>
      )}
      
      {/* Validation Results */}
      {validationStatus && (
        <MotionBox
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert
            status={validationStatus.isValid ? 'success' : 'error'}
            variant="left-accent"
            borderRadius="md"
          >
            <AlertIcon />
            <VStack align="start" spacing={1} flex={1}>
              <HStack justify="space-between" w="100%">
                <Text fontSize="sm" fontWeight="semibold">
                  {validationStatus.isValid ? 'Valid Content' : 'Validation Errors'}
                </Text>
                <Badge
                  colorScheme={validationStatus.isValid ? 'green' : 'red'}
                  variant="subtle"
                >
                  {validationStatus.processingTime.toFixed(0)}ms
                </Badge>
              </HStack>
              
              {validationStatus.errors.length > 0 && (
                <Text fontSize="sm" color="red.600">
                  {validationStatus.errors.length} error{validationStatus.errors.length !== 1 ? 's' : ''} found
                </Text>
              )}
              
              {validationStatus.warnings.length > 0 && (
                <Text fontSize="sm" color="orange.600">
                  {validationStatus.warnings.length} warning{validationStatus.warnings.length !== 1 ? 's' : ''} found
                </Text>
              )}
            </VStack>
            
            <IconButton
              aria-label="Toggle details"
              icon={showValidationDetails ? <FiX /> : <FiEye />}
              size="sm"
              variant="ghost"
              onClick={() => setShowValidationDetails(!showValidationDetails)}
            />
          </Alert>
          
          {/* Validation Details */}
          <Collapse in={showValidationDetails}>
            <Box mt={3} p={4} bg={bgColor} border="1px" borderColor={borderColor} borderRadius="md">
              {validationStatus.errors.length > 0 && (
                <VStack align="start" spacing={2} mb={4}>
                  <Text fontSize="sm" fontWeight="semibold" color="red.600">
                    Errors:
                  </Text>
                  {validationStatus.errors.map((error, index) => (
                    <HStack key={index} align="start" spacing={2}>
                      <Badge colorScheme="red" variant="outline">
                        {error.path}
                      </Badge>
                      <Text fontSize="sm" color="red.600">
                        {error.message}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              )}
              
              {validationStatus.warnings.length > 0 && (
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="orange.600">
                    Warnings:
                  </Text>
                  {validationStatus.warnings.map((warning, index) => (
                    <HStack key={index} align="start" spacing={2}>
                      <Badge colorScheme="orange" variant="outline">
                        {warning.path}
                      </Badge>
                      <Text fontSize="sm" color="orange.600">
                        {warning.message}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>
          </Collapse>
        </MotionBox>
      )}
    </VStack>
  );
  
  return (
    <Box h="100vh" bg={bgColor}>
      {/* Header */}
      <Box px={6} py={4} borderBottom="1px" borderColor={borderColor}>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <HStack>
              <FiZap color="orange" />
              <Heading size="md">DevTeam Hot-Reload Environment</Heading>
              <Badge colorScheme="blue" variant="subtle">
                {environment}
              </Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Tooltip label="Auto-validation enabled">
              <IconButton
                aria-label="Toggle auto-validation"
                icon={autoValidation ? <FiCheckCircle /> : <FiPlay />}
                colorScheme={autoValidation ? 'green' : 'gray'}
                variant={autoValidation ? 'solid' : 'outline'}
                size="sm"
                onClick={() => setAutoValidation(!autoValidation)}
              />
            </Tooltip>
            
            <Button
              leftIcon={<FiRefreshCw />}
              size="sm"
              variant="outline"
              onClick={handleValidateNow}
              isLoading={isValidating}
            >
              Validate
            </Button>
            
            <Button
              leftIcon={<FiSave />}
              size="sm"
              colorScheme="blue"
              onClick={handleSave}
              isDisabled={!validationStatus?.isValid}
            >
              Save
            </Button>
            
            <Button
              leftIcon={<FiUpload />}
              size="sm"
              variant="outline"
              onClick={loadExampleContent}
            >
              Example
            </Button>
          </HStack>
        </HStack>
      </Box>
      
      {/* Main Content */}
      <HStack h="calc(100vh - 80px)" spacing={0}>
        {/* Editor Panel */}
        {(previewMode === 'split' || previewMode === 'editor-only') && (
          <VStack flex={previewMode === 'split' ? 1 : 2} h="100%" spacing={0}>
            {/* Editor Header */}
            <Box w="100%" px={4} py={2} borderRight="1px" borderColor={borderColor} bg={editorBg}>
              <HStack justify="space-between">
                <HStack>
                  <FiCode />
                  <Text fontSize="sm" fontWeight="semibold">JSON Editor</Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {content.length.toLocaleString()} characters
                </Text>
              </HStack>
            </Box>
            
            {/* Editor */}
            <Box flex={1} w="100%" position="relative">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Paste your DevTeam JSON content here..."
                style={{
                  width: '100%',
                  height: '100%',
                  padding: '16px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  backgroundColor: 'transparent'
                }}
              />
            </Box>
            
            {/* Validation Status */}
            <Box w="100%" p={4} borderTop="1px" borderColor={borderColor}>
              {renderValidationStatus()}
            </Box>
          </VStack>
        )}
        
        {/* Preview Panel */}
        {(previewMode === 'split' || previewMode === 'preview-only') && (
          <VStack flex={previewMode === 'split' ? 1 : 2} h="100%" spacing={0}>
            {/* Preview Header */}
            <Box w="100%" px={4} py={2} bg={editorBg}>
              <HStack justify="space-between">
                <HStack>
                  <FiEye />
                  <Text fontSize="sm" fontWeight="semibold">Live Preview</Text>
                  {validationStatus?.isValid && (
                    <Badge colorScheme="green" size="sm">
                      Ready
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={2}>
                  <Button
                    size="xs"
                    variant={previewMode === 'split' ? 'solid' : 'outline'}
                    onClick={() => setPreviewMode('split')}
                  >
                    Split
                  </Button>
                  <Button
                    size="xs"
                    variant={previewMode === 'preview-only' ? 'solid' : 'outline'}
                    onClick={() => setPreviewMode('preview-only')}
                  >
                    Preview
                  </Button>
                  <Button
                    size="xs"
                    variant={previewMode === 'editor-only' ? 'solid' : 'outline'}
                    onClick={() => setPreviewMode('editor-only')}
                  >
                    Editor
                  </Button>
                </HStack>
              </HStack>
            </Box>
            
            {/* Preview Content */}
            <Box flex={1} w="100%" overflow="auto" bg="gray.50">
              <AnimatePresence mode="wait">
                {validationStatus?.isValid && parsedContent ? (
                  <MotionBox
                    key="preview-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    h="100%"
                  >
                    <GameContainer
                      gameData={parsedContent}
                      municipalTheme={municipalTheme}
                      environment="preview"
                      isPreviewMode={true}
                    />
                  </MotionBox>
                ) : (
                  <MotionBox
                    key="preview-placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    h="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexDirection="column"
                    color="gray.500"
                  >
                    <FiMonitor size={48} />
                    <Text mt={4} fontSize="lg" fontWeight="semibold">
                      Preview Ready
                    </Text>
                    <Text fontSize="sm" textAlign="center" maxW="300px">
                      {!content ? 
                        'Add valid JSON content to see live preview' :
                        'Fix validation errors to enable preview'
                      }
                    </Text>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Box>
          </VStack>
        )}
      </HStack>
    </Box>
  );
};

export default HotReloadEnvironment;