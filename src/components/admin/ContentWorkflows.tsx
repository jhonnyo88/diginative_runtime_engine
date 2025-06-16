import React, { useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Textarea,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

// Bulk content management workflows for enterprise admins
// Supports import/export, bulk editing, and workflow automation

interface ContentItem {
  id: string;
  name: string;
  type: 'game' | 'scene' | 'assessment' | 'resource';
  status: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  lastModified: Date;
  modifiedBy: string;
  tenantId: string;
  tags: string[];
  metadata?: {
    version?: string;
    language?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number; // minutes
  };
}

interface BulkOperation {
  id: string;
  type: 'import' | 'export' | 'publish' | 'archive' | 'translate' | 'duplicate';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  itemCount: number;
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

interface ContentWorkflowsProps {
  tenantId: string;
  userRole: 'super_admin' | 'tenant_admin' | 'content_manager';
}

export const ContentWorkflows: React.FC<ContentWorkflowsProps> = ({
  tenantId,
  userRole
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);

  // Mock content data - in production this comes from API
  const [contentItems] = useState<ContentItem[]>([
    {
      id: 'gdpr-training-1',
      name: 'GDPR Training - Malmö Edition',
      type: 'game',
      status: 'published',
      lastModified: new Date('2025-01-15'),
      modifiedBy: 'anna.svensson@malmo.se',
      tenantId,
      tags: ['privacy', 'compliance', 'mandatory'],
      metadata: {
        version: '1.2.0',
        language: 'sv',
        difficulty: 'beginner',
        estimatedTime: 15
      }
    },
    {
      id: 'safety-quiz-intro',
      name: 'Workplace Safety Introduction',
      type: 'scene',
      status: 'review',
      lastModified: new Date('2025-01-14'),
      modifiedBy: 'lars.eriksson@malmo.se',
      tenantId,
      tags: ['safety', 'workplace', 'introduction'],
      metadata: {
        version: '1.0.0',
        language: 'sv',
        difficulty: 'beginner',
        estimatedTime: 8
      }
    },
    {
      id: 'ethics-assessment',
      name: 'Municipal Ethics Assessment',
      type: 'assessment',
      status: 'draft',
      lastModified: new Date('2025-01-13'),
      modifiedBy: 'maria.andersson@malmo.se',
      tenantId,
      tags: ['ethics', 'assessment', 'municipal'],
      metadata: {
        version: '0.9.0',
        language: 'sv',
        difficulty: 'intermediate',
        estimatedTime: 20
      }
    }
  ]);

  const canManageContent = userRole === 'super_admin' || userRole === 'tenant_admin';
  const canBulkEdit = userRole === 'super_admin' || userRole === 'tenant_admin';

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === contentItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(contentItems.map(item => item.id)));
    }
  };

  const startBulkOperation = useCallback((type: BulkOperation['type']) => {
    if (selectedItems.size === 0) return;

    const operation: BulkOperation = {
      id: `bulk-${Date.now()}`,
      type,
      status: 'queued',
      itemCount: selectedItems.size,
      progress: 0,
      startedAt: new Date()
    };

    setBulkOperations(prev => [operation, ...prev]);

    // Simulate operation progress
    setTimeout(() => {
      setBulkOperations(prev => 
        prev.map(op => 
          op.id === operation.id 
            ? { ...op, status: 'processing' as const }
            : op
        )
      );

      // Progress simulation
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(progressInterval);
          
          setBulkOperations(prev => 
            prev.map(op => 
              op.id === operation.id 
                ? { 
                    ...op, 
                    status: 'completed' as const, 
                    progress: 100,
                    completedAt: new Date()
                  }
                : op
            )
          );
          
          // Clear selections after completion
          setSelectedItems(new Set());
        } else {
          setBulkOperations(prev => 
            prev.map(op => 
              op.id === operation.id 
                ? { ...op, progress }
                : op
            )
          );
        }
      }, 500);
    }, 1000);
  }, [selectedItems]);

  // Import functionality placeholder for future implementation

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'green';
      case 'approved': return 'blue';
      case 'review': return 'orange';
      case 'draft': return 'gray';
      case 'archived': return 'red';
      default: return 'gray';
    }
  };

  const getOperationStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'processing': return 'blue';
      case 'failed': return 'red';
      case 'queued': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack gap={6} align="stretch">
        
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" gap={1}>
            <Text fontSize="xl" fontWeight="bold">
              Content Management Workflows
            </Text>
            <Text fontSize="sm" color="gray.600">
              Bulk operations, import/export, and workflow automation
            </Text>
          </VStack>
          
          {canManageContent && (
            <HStack gap={2}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => console.log('Import functionality coming soon')}
              >
                Import Content
              </Button>
              <Button
                colorScheme="brand"
                size="sm"
                disabled={selectedItems.size === 0}
                onClick={() => startBulkOperation('export')}
              >
                Export Selected ({selectedItems.size})
              </Button>
            </HStack>
          )}
        </HStack>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>Content Library</Tab>
            <Tab>Bulk Operations</Tab>
            <Tab>Workflow Templates</Tab>
            <Tab>Import/Export</Tab>
          </TabList>

          <TabPanels>
            {/* Content Library */}
            <TabPanel>
              <VStack gap={4} align="stretch">
                
                {/* Bulk Actions Bar */}
                {canBulkEdit && selectedItems.size > 0 && (
                  <Card bg="blue.50" borderColor="blue.200">
                    <CardBody py={3}>
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          {selectedItems.size} item{selectedItems.size === 1 ? '' : 's'} selected
                        </Text>
                        <HStack gap={2}>
                          <Button 
                            size="xs" 
                            variant="outline"
                            onClick={() => startBulkOperation('publish')}
                          >
                            Publish
                          </Button>
                          <Button 
                            size="xs" 
                            variant="outline"
                            onClick={() => startBulkOperation('archive')}
                          >
                            Archive
                          </Button>
                          <Button 
                            size="xs" 
                            variant="outline"
                            onClick={() => startBulkOperation('duplicate')}
                          >
                            Duplicate
                          </Button>
                          <Menu>
                            <MenuButton as={Button} size="xs" variant="outline">
                              More Actions
                            </MenuButton>
                            <MenuList>
                              <MenuItem onClick={() => startBulkOperation('translate')}>
                                Translate to English
                              </MenuItem>
                              <MenuItem onClick={() => setSelectedItems(new Set())}>
                                Clear Selection
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </HStack>
                      </HStack>
                    </CardBody>
                  </Card>
                )}

                {/* Content Table */}
                <Card>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>
                          <input
                            type="checkbox"
                            checked={selectedItems.size === contentItems.length}
                            onChange={handleSelectAll}
                          />
                        </Th>
                        <Th>Name</Th>
                        <Th>Type</Th>
                        <Th>Status</Th>
                        <Th>Modified</Th>
                        <Th>Language</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {contentItems.map(item => (
                        <Tr key={item.id}>
                          <Td>
                            <input
                              type="checkbox"
                              checked={selectedItems.has(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                            />
                          </Td>
                          <Td>
                            <VStack align="start" gap={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {item.name}
                              </Text>
                              <HStack gap={1}>
                                {item.tags.slice(0, 2).map(tag => (
                                  <Badge key={tag} size="xs" colorScheme="gray">
                                    {tag}
                                  </Badge>
                                ))}
                                {item.tags.length > 2 && (
                                  <Badge size="xs" colorScheme="gray">
                                    +{item.tags.length - 2}
                                  </Badge>
                                )}
                              </HStack>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" size="sm">
                              {item.type}
                            </Badge>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getStatusColor(item.status)} 
                              size="sm"
                            >
                              {item.status}
                            </Badge>
                          </Td>
                          <Td>
                            <VStack align="start" gap={0}>
                              <Text fontSize="xs">
                                {item.lastModified.toLocaleDateString()}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {item.modifiedBy.split('@')[0]}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <Badge size="sm" colorScheme="purple">
                              {item.metadata?.language?.toUpperCase() || 'SV'}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack gap={1}>
                              <Button size="xs" variant="outline">
                                Edit
                              </Button>
                              <Button size="xs" variant="outline">
                                Preview
                              </Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Card>
              </VStack>
            </TabPanel>

            {/* Bulk Operations */}
            <TabPanel>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  Recent Bulk Operations
                </Text>
                
                {bulkOperations.length === 0 ? (
                  <Alert status="info">
                    <InfoIcon />
                    No bulk operations have been performed yet. 
                    Select content items and use bulk actions to get started.
                  </Alert>
                ) : (
                  <VStack gap={3} align="stretch">
                    {bulkOperations.map(operation => (
                      <Card key={operation.id}>
                        <CardBody>
                          <HStack justify="space-between" mb={2}>
                            <VStack align="start" gap={0}>
                              <Text fontSize="sm" fontWeight="medium">
                                {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)} Operation
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {operation.itemCount} items • Started {operation.startedAt.toLocaleTimeString()}
                              </Text>
                            </VStack>
                            <Badge colorScheme={getOperationStatusColor(operation.status)}>
                              {operation.status}
                            </Badge>
                          </HStack>
                          
                          {operation.status === 'processing' && (
                            <Progress 
                              value={operation.progress} 
                              size="sm" 
                              colorScheme="blue"
                              borderRadius="full"
                            />
                          )}
                          
                          {operation.status === 'completed' && operation.completedAt && (
                            <Text fontSize="xs" color="green.600">
                              Completed at {operation.completedAt.toLocaleTimeString()}
                            </Text>
                          )}
                          
                          {operation.status === 'failed' && operation.errorMessage && (
                            <Text fontSize="xs" color="red.600">
                              Error: {operation.errorMessage}
                            </Text>
                          )}
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                )}
              </VStack>
            </TabPanel>

            {/* Workflow Templates */}
            <TabPanel>
              <VStack gap={4} align="stretch">
                <Text fontSize="lg" fontWeight="bold">
                  Automated Workflow Templates
                </Text>
                
                <SimpleGrid columns={2} gap={4}>
                  <Card>
                    <CardHeader>
                      <Text fontSize="md" fontWeight="bold">
                        Content Review Pipeline
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" gap={2}>
                        <Text fontSize="sm">
                          Automatically move content through draft → review → approved → published stages
                        </Text>
                        <Badge colorScheme="blue">5 steps</Badge>
                        <Button size="sm" variant="outline" w="full">
                          Configure Workflow
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <Text fontSize="md" fontWeight="bold">
                        Multi-language Translation
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" gap={2}>
                        <Text fontSize="sm">
                          Automatically translate content to multiple languages using AI
                        </Text>
                        <Badge colorScheme="purple">3 languages</Badge>
                        <Button size="sm" variant="outline" w="full">
                          Setup Translation
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
                
                <Alert status="info">
                  <InfoIcon />
                  Workflow automation is available in the Enterprise plan. 
                  Contact support to enable advanced workflow features.
                </Alert>
              </VStack>
            </TabPanel>

            {/* Import/Export */}
            <TabPanel>
              <VStack gap={6} align="stretch">
                
                {/* Import Section */}
                <Card>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">
                      Import Content
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack gap={4} align="stretch">
                      <Text fontSize="sm">
                        Import games, scenes, and assessments from various formats.
                        Supported: JSON, Excel (.xlsx), CSV, SCORM packages.
                      </Text>
                      
                      <HStack>
                        <Button colorScheme="brand">
                          Select Files
                        </Button>
                        <Button variant="outline">
                          Download Template
                        </Button>
                      </HStack>
                      
                      <Alert status="warning" size="sm">
                        <InfoIcon />
                        Always backup existing content before importing large datasets.
                      </Alert>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Export Section */}
                <Card>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">
                      Export Content
                    </Text>
                  </CardHeader>
                  <CardBody>
                    <VStack gap={4} align="stretch">
                      <Text fontSize="sm">
                        Export your content for backup, migration, or sharing with other tenants.
                      </Text>
                      
                      <SimpleGrid columns={3} gap={3}>
                        <Button variant="outline" size="sm">
                          JSON Export
                        </Button>
                        <Button variant="outline" size="sm">
                          Excel Export
                        </Button>
                        <Button variant="outline" size="sm">
                          SCORM Package
                        </Button>
                      </SimpleGrid>
                      
                      <Textarea 
                        placeholder="Optional: Add export notes or filters..."
                        size="sm"
                        rows={3}
                      />
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};