import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Textarea, 
  useToast,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Divider,
  List,
  ListItem,
  ListIcon,
  IconButton,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FiPlay, FiEdit, FiPlus, FiTrash2, FiCheck, FiX, FiArrowRight } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import LLMSelector from './components/LLMSelector';
import AgentBuilder from './components/AgentBuilder';
import FileManager from './components/FileManager';
import BuildDeploy from './components/BuildDeploy';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  code?: string;
}

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  children?: FileItem[];
}

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  purpose: string;
  securityLevel: string;
  customInstructions: string;
}

function App() {
  const [userInput, setUserInput] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini']);
  const [isCybersecurityMode, setIsCybersecurityMode] = useState<boolean>(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [code, setCode] = useState<string>('// Code will appear here as steps are executed');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const { isOpen: isEditStepOpen, onOpen: onEditStepOpen, onClose: onEditStepClose } = useDisclosure();
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [newStepTitle, setNewStepTitle] = useState<string>('');
  const [newStepDescription, setNewStepDescription] = useState<string>('');
  const toast = useToast();

  const handleModelSelect = (models: string[]) => {
    setSelectedModels(models);
    toast({
      title: 'LLM Configuration Updated',
      description: models.length > 1 
        ? `Using ${models.length} models in mixture mode` 
        : `Using ${models[0]}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAgentCreate = (agent: AgentConfig) => {
    setAgents([...agents, agent]);
    if (agent.purpose.includes('security') || isCybersecurityMode) {
      setIsCybersecurityMode(true);
    }
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    if (file.type === 'file') {
      setCode(`// Content of ${file.name}\n// This would be the actual file content in a real implementation`);
    }
  };

  const generatePlan = async () => {
    if (!userInput.trim()) {
      toast({
        title: 'Input required',
        description: 'Please describe what you want to build',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGeneratingPlan(true);
    
    try {
      const response = await fetch('/.netlify/functions/llm/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: userInput,
          model: selectedModels[0]
        })
      });

      const data = await response.json();
      setSteps(data.plan);
      
      toast({
        title: 'Plan Generated',
        description: 'Development plan has been created based on your requirements',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate plan. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const executeStep = async (stepId: number) => {
    setCurrentStep(stepId);
    
    try {
      const response = await fetch('/.netlify/functions/llm/execute-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          step_id: stepId,
          plan_id: 'current'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        const stepIndex = steps.findIndex(step => step.id === stepId);
        if (stepIndex !== -1) {
          const updatedSteps = [...steps];
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            completed: true,
            code: data.code
          };
          setSteps(updatedSteps);
          setCode(data.code);
          
          toast({
            title: 'Step Executed',
            description: `Step ${stepId}: ${updatedSteps[stepIndex].title} completed`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to execute step. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const executeAllSteps = () => {
    if (steps.length === 0) return;
    
    toast({
      title: 'Auto Run Started',
      description: 'Executing all steps automatically',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    let currentStepIndex = 0;
    
    const runNextStep = () => {
      if (currentStepIndex >= steps.length) return;
      
      const step = steps[currentStepIndex];
      executeStep(step.id);
      
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setTimeout(runNextStep, 3000);
      } else {
        toast({
          title: 'All Steps Completed',
          description: 'The entire plan has been executed successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    
    runNextStep();
  };

  const openEditStep = (step: Step) => {
    setEditingStep(step);
    setNewStepTitle(step.title);
    setNewStepDescription(step.description);
    onEditStepOpen();
  };

  const saveEditedStep = () => {
    if (!editingStep) return;
    
    const updatedSteps = steps.map(step => 
      step.id === editingStep.id 
        ? { ...step, title: newStepTitle, description: newStepDescription } 
        : step
    );
    
    setSteps(updatedSteps);
    onEditStepClose();
    
    toast({
      title: 'Step Updated',
      description: 'The step has been successfully updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const addNewStep = () => {
    const newId = steps.length > 0 ? Math.max(...steps.map(step => step.id)) + 1 : 1;
    
    setEditingStep({
      id: newId,
      title: '',
      description: '',
      completed: false
    });
    
    setNewStepTitle('');
    setNewStepDescription('');
    onEditStepOpen();
  };

  const saveNewStep = () => {
    if (!editingStep) return;
    
    const newStep = {
      ...editingStep,
      title: newStepTitle,
      description: newStepDescription
    };
    
    setSteps([...steps, newStep]);
    onEditStepClose();
    
    toast({
      title: 'Step Added',
      description: 'A new step has been added to the plan',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const deleteStep = (stepId: number) => {
    const updatedSteps = steps.filter(step => step.id !== stepId);
    setSteps(updatedSteps);
    
    toast({
      title: 'Step Deleted',
      description: 'The step has been removed from the plan',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Box bg="teal.600" color="white" p={4} as="header">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Just Built IDE</Heading>
          <HStack spacing={4}>
            <Badge colorScheme="green" fontSize="0.8em" p={1}>
              {selectedModels.length > 1 ? 'Mixture Mode' : selectedModels[0]}
            </Badge>
            {isCybersecurityMode && (
              <Badge colorScheme="blue" fontSize="0.8em" p={1}>
                Cybersecurity Mode
              </Badge>
            )}
          </HStack>
        </Flex>
      </Box>

      <PanelGroup direction="horizontal" style={{ flex: 1 }}>
        <Panel defaultSize={20} minSize={15}>
          <Box height="100%" p={2}>
            <FileManager onFileSelect={handleFileSelect} />
          </Box>
        </Panel>

        <PanelResizeHandle style={{ width: '4px', background: '#E2E8F0' }} />

        <Panel defaultSize={50} minSize={30}>
          <Box height="100%" display="flex" flexDirection="column">
            <Box p={2} bg="gray.100">
              <Text fontWeight="medium">
                {selectedFile ? `Editing: ${selectedFile.path}` : 'Code Editor'}
              </Text>
            </Box>
            <Box flex="1" borderWidth="1px" borderColor="gray.200">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on'
                }}
              />
            </Box>
          </Box>
        </Panel>

        <PanelResizeHandle style={{ width: '4px', background: '#E2E8F0' }} />

        <Panel defaultSize={30} minSize={20}>
          <Box height="100%" p={2}>
            <Tabs variant="enclosed" height="100%" display="flex" flexDirection="column">
              <TabList>
                <Tab>Project Plan</Tab>
                <Tab>LLM Config</Tab>
                <Tab>Agents</Tab>
                <Tab>Build</Tab>
              </TabList>

              <TabPanels flex="1" overflowY="auto">
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text mb={2} fontWeight="medium">What would you like to build?</Text>
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Describe what you want to build..."
                        size="sm"
                        rows={4}
                      />
                      <Button
                        mt={2}
                        colorScheme="teal"
                        onClick={generatePlan}
                        isLoading={isGeneratingPlan}
                        loadingText="Generating Plan"
                      >
                        Generate Plan
                      </Button>
                    </Box>

                    {steps.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="medium">Development Plan</Text>
                            <HStack>
                              <Button size="sm" leftIcon={<FiPlus />} onClick={addNewStep}>
                                Add Step
                              </Button>
                              <Button 
                                size="sm" 
                                colorScheme="teal" 
                                leftIcon={<FiPlay />}
                                onClick={executeAllSteps}
                              >
                                Auto Run
                              </Button>
                            </HStack>
                          </Flex>
                          
                          <List spacing={2}>
                            {steps.map((step) => (
                              <ListItem 
                                key={step.id} 
                                p={2} 
                                borderWidth="1px" 
                                borderRadius="md"
                                bg={step.completed ? 'green.50' : 'white'}
                              >
                                <Flex justify="space-between" align="center">
                                  <HStack>
                                    {step.completed ? (
                                      <ListIcon as={FiCheck} color="green.500" />
                                    ) : (
                                      <Text color="gray.500" fontWeight="bold" mr={2}>
                                        {step.id}.
                                      </Text>
                                    )}
                                    <Box>
                                      <Text fontWeight="medium">{step.title}</Text>
                                      <Text fontSize="sm" color="gray.600">{step.description}</Text>
                                    </Box>
                                  </HStack>
                                  <HStack>
                                    <IconButton
                                      aria-label="Edit step"
                                      icon={<FiEdit />}
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => openEditStep(step)}
                                    />
                                    <IconButton
                                      aria-label="Delete step"
                                      icon={<FiTrash2 />}
                                      size="sm"
                                      variant="ghost"
                                      colorScheme="red"
                                      onClick={() => deleteStep(step.id)}
                                    />
                                    {!step.completed && (
                                      <IconButton
                                        aria-label="Execute step"
                                        icon={<FiArrowRight />}
                                        size="sm"
                                        colorScheme="teal"
                                        onClick={() => executeStep(step.id)}
                                      />
                                    )}
                                  </HStack>
                                </Flex>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <LLMSelector onModelSelect={handleModelSelect} />
                </TabPanel>

                <TabPanel>
                  <AgentBuilder 
                    onAgentCreate={handleAgentCreate} 
                    isCybersecurityMode={isCybersecurityMode} 
                  />
                  
                  {agents.length > 0 && (
                    <Box mt={4}>
                      <Text fontWeight="medium" mb={2}>Created Agents:</Text>
                      <List spacing={2}>
                        {agents.map((agent, index) => (
                          <ListItem 
                            key={index} 
                            p={2} 
                            borderWidth="1px" 
                            borderRadius="md"
                          >
                            <Text fontWeight="medium">{agent.name}</Text>
                            <Text fontSize="sm" color="gray.600">{agent.description}</Text>
                            <HStack mt={1} spacing={2}>
                              <Badge colorScheme="purple">{agent.model}</Badge>
                              <Badge colorScheme="blue">{agent.purpose}</Badge>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </TabPanel>

                <TabPanel>
                  <BuildDeploy onBuildStart={() => {}} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Panel>
      </PanelGroup>

      <Modal isOpen={isEditStepOpen} onClose={onEditStepClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingStep && editingStep.title ? 'Edit Step' : 'Add New Step'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Step Title</FormLabel>
                <Input 
                  value={newStepTitle} 
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="Enter step title"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea 
                  value={newStepDescription} 
                  onChange={(e) => setNewStepDescription(e.target.value)}
                  placeholder="Enter step description"
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditStepClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={editingStep && editingStep.title ? saveEditedStep : saveNewStep}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;