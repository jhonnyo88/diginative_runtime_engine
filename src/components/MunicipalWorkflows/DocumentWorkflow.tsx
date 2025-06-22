import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Icon,
  useToast,
  Progress,
  Button,
} from '@chakra-ui/react';
import { FiFile, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { DragDropProvider } from '../DragDrop/DragDropProvider';
import { Draggable } from '../DragDrop/Draggable';
import { DropZone } from '../DragDrop/DropZone';
import { DragItem } from '../DragDrop/DragDropProvider';

export interface Document {
  id: string;
  title: string;
  type: 'permit' | 'report' | 'invoice' | 'application';
  status: 'pending' | 'review' | 'approved' | 'rejected';
  department: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
}

interface WorkflowStage {
  id: string;
  name: string;
  accepts: string[];
  documents: Document[];
}

interface DocumentWorkflowProps {
  municipalTheme?: 'sweden' | 'germany' | 'france' | 'netherlands';
  onWorkflowComplete?: (documents: Document[]) => void;
}

export const DocumentWorkflow: React.FC<DocumentWorkflowProps> = ({
  municipalTheme = 'sweden',
  onWorkflowComplete,
}) => {
  
  const [stages, setStages] = useState<WorkflowStage[]>([
    {
      id: 'inbox',
      name: 'Inkorg',
      accepts: ['permit', 'report', 'invoice', 'application'],
      documents: [
        {
          id: 'doc1',
          title: 'Bygglovsansökan - Storgatan 12',
          type: 'permit',
          status: 'pending',
          department: 'Stadsbyggnad',
          priority: 'high',
          dueDate: '2025-01-25',
        },
        {
          id: 'doc2',
          title: 'Miljörapport Q4 2024',
          type: 'report',
          status: 'pending',
          department: 'Miljöförvaltning',
          priority: 'medium',
        },
        {
          id: 'doc3',
          title: 'Faktura - IT-tjänster',
          type: 'invoice',
          status: 'pending',
          department: 'Ekonomi',
          priority: 'low',
        },
      ],
    },
    {
      id: 'review',
      name: 'Granskning',
      accepts: ['permit', 'report', 'invoice', 'application'],
      documents: [],
    },
    {
      id: 'approved',
      name: 'Godkända',
      accepts: ['permit', 'report', 'invoice', 'application'],
      documents: [],
    },
  ]);

  const _handleDrop = (targetStageId: string) => (item: DragItem) => {
    
    setStages(prevStages => {
      
      // Remove from source stage
      if (item.sourceZone) {
        if (sourceStage) {
          sourceStage.documents = sourceStage.documents.filter(d => d.id !== document.id);
        }
      }
      
      // Add to target stage
      if (targetStage) {
        // Update document status based on stage
        if (targetStageId === 'review') {
          updatedDoc.status = 'review';
        } else if (targetStageId === 'approved') {
          updatedDoc.status = 'approved';
        }
        
        targetStage.documents.push(updatedDoc);
        
        // Show success toast
        toast({
          title: 'Dokument flyttat',
          description: `${document.title} har flyttats till ${targetStage.name}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Check if workflow is complete
        if (approvedStage && approvedStage.documents.length === 3) {
          onWorkflowComplete?.(approvedStage.documents);
          toast({
            title: 'Arbetsflöde slutfört!',
            description: 'Alla dokument har behandlats',
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      }
      
      return newStages;
    });
  };




  return (
    <DragDropProvider municipalTheme={municipalTheme}>
      <VStack spacing={6} align="stretch" p={6}>
        <Box>
          <Heading size="lg" mb={2}>Kommunal Dokumenthantering</Heading>
          <Text color="gray.600">Dra och släpp dokument mellan olika stadier</Text>
          <Progress 
            value={completionProgress} 
            mt={4} 
            colorScheme="blue" 
            borderRadius="md"
            hasStripe
            isAnimated
          />
        </Box>
        
        <HStack spacing={6} align="stretch" overflowX="auto" pb={4}>
          {stages.map(stage => (
            <DropZone
              key={stage.id}
              zoneId={stage.id}
              accepts={stage.accepts}
              onDrop={handleDrop(stage.id)}
              flex="1"
              minW="300px"
              bg="gray.50"
              p={4}
              borderRadius="lg"
            >
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">{stage.name}</Heading>
                  <Badge colorScheme="blue">{stage.documents.length}</Badge>
                </HStack>
                
                <VStack align="stretch" spacing={3} minH="400px">
                  {stage.documents.map(doc => (
                    <Draggable
                      key={doc.id}
                      itemId={doc.id}
                      itemType={doc.type}
                      itemData={doc}
                      sourceZone={stage.id}
                    >
                      <Box
                        bg="white"
                        p={4}
                        borderRadius="md"
                        boxShadow="sm"
                        borderWidth={1}
                        borderColor="gray.200"
                        _hover={{ boxShadow: 'md' }}
                      >
                        <HStack justify="space-between" mb={2}>
                          <Icon as={getDocumentIcon(doc.type)} color="blue.500" boxSize={5} />
                          <Badge colorScheme={getPriorityColor(doc.priority)}>
                            {doc.priority}
                          </Badge>
                        </HStack>
                        
                        <Text fontWeight="medium" fontSize="sm" mb={1}>
                          {doc.title}
                        </Text>
                        
                        <Text fontSize="xs" color="gray.600">
                          {doc.department}
                        </Text>
                        
                        {doc.dueDate && (
                          <Text fontSize="xs" color="red.500" mt={1}>
                            Deadline: {doc.dueDate}
                          </Text>
                        )}
                      </Box>
                    </Draggable>
                  ))}
                </VStack>
              </VStack>
            </DropZone>
          ))}
        </HStack>
        
        <Button
          colorScheme="blue"
          size="lg"
          isDisabled={completionProgress < 100}
          onClick={() => {
            onWorkflowComplete?.(approvedDocs);
          }}
        >
          Slutför arbetsflöde
        </Button>
      </VStack>
    </DragDropProvider>
  );
};