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
  FormLabel,
  Switch,
  Select,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { FiPlay, FiEdit, FiPlus, FiTrash2, FiCheck, FiArrowRight, FiSettings, FiCode, FiEye, FiHome } from 'react-icons/fi';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import LLMSelector from './components/LLMSelector';
import AgentBuilder from './components/AgentBuilder';
import FileManager from './components/FileManager';
import BuildDeploy from './components/BuildDeploy';
import ProjectDashboard from './components/ProjectDashboard';
import CodePreview from './components/CodePreview';
import AdvancedSettings from './components/AdvancedSettings';
import { llmApi } from './services/api';

interface Step {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  code?: string;
  estimatedTime?: string;
  dependencies?: number[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
  explanation?: string;
}

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  children?: FileItem[];
  lastModified?: Date;
}

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  purpose: string;
  securityLevel: string;
  customInstructions: string;
  expertise: string[];
  codingStyle: string;
  communicationStyle: {
    verbosity: number;
    formality: number;
    useEmojis: boolean;
    technicalLevel: number;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  lastModified: Date;
  collaborators: number;
  linesOfCode: number;
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'ide'>('dashboard');
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini']);
  const [isCybersecurityMode, setIsCybersecurityMode] = useState<boolean>(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [code, setCode] = useState<string>('// Welcome to Just Built IDE\n// Your AI-generated code will appear here\n\nconsole.log("Hello, World!");');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [isExecutingStep, setIsExecutingStep] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('javascript');
  const [currentFramework, setCurrentFramework] = useState<string>('');
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [advancedSettings, setAdvancedSettings] = useState<any>({});
  
  const { isOpen: isEditStepOpen, onOpen: onEditStepOpen, onClose: onEditStepClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [newStepTitle, setNewStepTitle] = useState<string>('');
  const [newStepDescription, setNewStepDescription] = useState<string>('');
  const [autoExecuteMode, setAutoExecuteMode] = useState<boolean>(false);
  const [executionProgress, setExecutionProgress] = useState<number>(0);
  
  const toast = useToast();

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    setCurrentView('ide');
    setUserInput(project.description);
    
    // Set appropriate language and framework based on project type
    switch (project.type) {
      case 'web-app':
        setCurrentLanguage('typescript');
        setCurrentFramework('react');
        break;
      case 'mobile-app':
        setCurrentLanguage('typescript');
        setCurrentFramework('react-native');
        break;
      case 'api':
        setCurrentLanguage('typescript');
        setCurrentFramework('express');
        break;
      default:
        setCurrentLanguage('javascript');
        setCurrentFramework('');
    }
    
    toast({
      title: 'Project Loaded',
      description: `Switched to ${project.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleNewProject = () => {
    setCurrentView('ide');
    setCurrentProject(null);
    setUserInput('');
    setSteps([]);
    setCode('// New project started\n// Describe what you want to build and click "Generate Plan"');
  };

  const handleModelSelect = (models: string[], config?: any) => {
    setSelectedModels(models);
    if (config) {
      setAdvancedSettings(prev => ({ ...prev, llmConfig: config }));
    }
    
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
    
    toast({
      title: 'Agent Created',
      description: `${agent.name} is now available for use`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    if (file.type === 'file') {
      // Determine language from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'jsx': 'javascript',
        'py': 'python',
        'html': 'html',
        'css': 'css',
        'json': 'json'
      };
      
      if (extension && languageMap[extension]) {
        setCurrentLanguage(languageMap[extension]);
      }
      
      // Simulate loading file content
      setCode(`// Content of ${file.name}\n// This would be the actual file content in a real implementation\n\n// File path: ${file.path}\n// Last modified: ${file.lastModified?.toLocaleString()}`);
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
      const response = await llmApi.generatePlan(userInput, selectedModels[0], advancedSettings.llmConfig);
      const planSteps = response.data.plan.map((step: any) => ({
        ...step,
        completed: false,
        status: 'pending' as const
      }));
      setSteps(planSteps);
      
      // Update current project if we have one
      if (currentProject) {
        setCurrentProject({
          ...currentProject,
          description: userInput,
          lastModified: new Date()
        });
      }
      
      toast({
        title: 'Plan Generated',
        description: `Created ${planSteps.length} development steps`,
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
    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    // Check dependencies
    const step = steps[stepIndex];
    if (step.dependencies) {
      const uncompletedDeps = step.dependencies.filter(depId => 
        !steps.find(s => s.id === depId)?.completed
      );
      
      if (uncompletedDeps.length > 0) {
        toast({
          title: 'Dependencies Required',
          description: `Complete steps ${uncompletedDeps.join(', ')} first`,
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
    }

    setIsExecutingStep(true);
    
    // Update step status to running
    const updatedSteps = [...steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'running' };
    setSteps(updatedSteps);
    
    try {
      const response = await llmApi.executeStep(stepId, userInput, advancedSettings.llmConfig);
      const data = response.data;
      
      if (data.code) {
        // Update step with generated code and explanation
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          completed: true,
          status: 'completed',
          code: data.code,
          explanation: data.explanation
        };
        setSteps(updatedSteps);
        setCode(data.code);
        
        // Detect language and framework from generated code
        if (data.code.includes('import React') || data.code.includes('from \'react\'')) {
          setCurrentLanguage('typescript');
          setCurrentFramework('react');
        } else if (data.code.includes('express') || data.code.includes('app.listen')) {
          setCurrentLanguage('javascript');
          setCurrentFramework('express');
        }
        
        toast({
          title: 'Step Completed',
          description: `${step.title} executed successfully`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      // Mark step as failed
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'failed' };
      setSteps(updatedSteps);
      
      toast({
        title: 'Execution Failed',
        description: 'Failed to execute step. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExecutingStep(false);
    }
  };

  const executeAllSteps = async () => {
    if (steps.length === 0) return;
    
    setAutoExecuteMode(true);
    setExecutionProgress(0);
    
    toast({
      title: 'Auto Execution Started',
      description: 'Executing all steps automatically',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.completed) {
        await executeStep(step.id);
        setExecutionProgress(((i + 1) / steps.length) * 100);
        
        // Wait between steps to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    setAutoExecuteMode(false);
    setExecutionProgress(100);
    
    toast({
      title: 'Auto Execution Complete',
      description: 'All steps have been executed',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
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
      completed: false,
      status: 'pending'
    });
    
    setNewStepTitle('');
    setNewStepDescription('');
    onEditStepOpen();
  };

  const saveNewStep = () => {
    if (!editingStep || !newStepTitle.trim() || !newStepDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both title and description',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
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

  const handleModalSave = () => {
    if (editingStep && editingStep.title) {
      saveEditedStep();
    } else {
      saveNewStep();
    }
  };

  const handleModalCancel = () => {
    setEditingStep(null);
    setNewStepTitle('');
    setNewStepDescription('');
    onEditStepClose();
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

  const getStepStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'running': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const getCompletedStepsCount = () => {
    return steps.filter(step => step.completed).length;
  };

  if (currentView === 'dashboard') {
    return (
      <Box height="100vh" bg="gray.50">
        <ProjectDashboard 
          onProjectSelect={handleProjectSelect}
          onNewProject={handleNewProject}
        />
      </Box>
    );
  }

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <Box bg="teal.600" color="white" p={4} as="header">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              aria-label="Back to dashboard"
              icon={<FiHome />}
              variant="ghost"
              color="white"
              onClick={() => setCurrentView('dashboard')}
            />
            <VStack align="start" spacing={0}>
              <Heading size="lg">Just Built IDE</Heading>
              {currentProject && (
                <Text fontSize="sm" opacity={0.9}>{currentProject.name}</Text>
              )}
            </VStack>
          </HStack>
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Badge colorScheme="green" fontSize="0.8em" p={1}>
                {selectedModels.length > 1 ? 'Mixture Mode' : selectedModels[0]}
              </Badge>
              {isCybersecurityMode && (
                <Badge colorScheme="blue" fontSize="0.8em" p={1}>
                  Security Mode
                </Badge>
              )}
              {currentFramework && (
                <Badge colorScheme="purple" fontSize="0.8em" p={1}>
                  {currentFramework}
                </Badge>
              )}
            </HStack>
            <HStack spacing={2}>
              <Switch
                isChecked={showPreview}
                onChange={(e) => setShowPreview(e.target.checked)}
                colorScheme="whiteAlpha"
              />
              <Text fontSize="sm">Preview</Text>
              <IconButton
                aria-label="Settings"
                icon={<FiSettings />}
                variant="ghost"
                color="white"
                onClick={onSettingsOpen}
              />
            </HStack>
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

        <Panel defaultSize={showPreview ? 35 : 50} minSize={30}>
          <Box height="100%" display="flex" flexDirection="column">
            <Box p={2} bg="gray.100" borderBottom="1px" borderColor="gray.200">
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <FiCode />
                  <Text fontWeight="medium">
                    {selectedFile ? `${selectedFile.name}` : 'Code Editor'}
                  </Text>
                  <Badge size="sm" colorScheme="blue">{currentLanguage}</Badge>
                </HStack>
                <HStack spacing={2}>
                  <Select size="sm" value={currentLanguage} onChange={(e) => setCurrentLanguage(e.target.value)}>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="json">JSON</option>
                  </Select>
                </HStack>
              </Flex>
            </Box>
            <Box flex="1" borderWidth="1px" borderColor="gray.200">
              <Editor
                height="100%"
                language={currentLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  renderWhitespace: 'selection',
                  bracketPairColorization: { enabled: true }
                }}
              />
            </Box>
          </Box>
        </Panel>

        {showPreview && (
          <>
            <PanelResizeHandle style={{ width: '4px', background: '#E2E8F0' }} />
            <Panel defaultSize={25} minSize={20}>
              <CodePreview
                code={code}
                language={currentLanguage}
                framework={currentFramework}
              />
            </Panel>
          </>
        )}

        <PanelResizeHandle style={{ width: '4px', background: '#E2E8F0' }} />

        <Panel defaultSize={30} minSize={20}>
          <Box height="100%" p={2}>
            <Tabs variant="enclosed" height="100%" display="flex" flexDirection="column">
              <TabList>
                <Tab>Plan</Tab>
                <Tab>LLM</Tab>
                <Tab>Agents</Tab>
                <Tab>Build</Tab>
              </TabList>

              <TabPanels flex="1" overflowY="auto">
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text mb={2} fontWeight="medium">Project Description</Text>
                      <Textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Describe what you want to build..."
                        size="sm"
                        rows={4}
                      />
                      <HStack mt={2} spacing={2}>
                        <Button
                          colorScheme="teal"
                          onClick={generatePlan}
                          isLoading={isGeneratingPlan}
                          loadingText="Generating..."
                          size="sm"
                        >
                          Generate Plan
                        </Button>
                        {steps.length > 0 && (
                          <Button
                            size="sm"
                            leftIcon={<FiPlay />}
                            onClick={executeAllSteps}
                            isDisabled={autoExecuteMode || isExecutingStep}
                            colorScheme="green"
                          >
                            Auto Run
                          </Button>
                        )}
                      </HStack>
                    </Box>

                    {autoExecuteMode && (
                      <Box>
                        <Text fontSize="sm" mb={2}>Execution Progress</Text>
                        <Progress value={executionProgress} colorScheme="green" size="sm" />
                      </Box>
                    )}

                    {steps.length > 0 && (
                      <>
                        <Divider />
                        <Box>
                          <Flex justify="space-between" align="center" mb={2}>
                            <Text fontWeight="medium">Development Plan</Text>
                            <HStack spacing={2}>
                              <Text fontSize="sm" color="gray.600">
                                {getCompletedStepsCount()}/{steps.length} completed
                              </Text>
                              <IconButton
                                aria-label="Add step"
                                icon={<FiPlus />}
                                size="sm"
                                onClick={addNewStep}
                              />
                            </HStack>
                          </Flex>
                          
                          <List spacing={2}>
                            {steps.map((step) => (
                              <ListItem 
                                key={step.id} 
                                p={3} 
                                borderWidth="1px" 
                                borderRadius="md"
                                bg={step.completed ? 'green.50' : step.status === 'running' ? 'blue.50' : 'white'}
                                borderColor={step.status === 'failed' ? 'red.200' : 'gray.200'}
                              >
                                <VStack align="stretch" spacing={2}>
                                  <Flex justify="space-between" align="center">
                                    <HStack>
                                      {step.completed ? (
                                        <ListIcon as={FiCheck} color="green.500" />
                                      ) : step.status === 'running' ? (
                                        <Box w={4} h={4}>
                                          <Progress size="sm" isIndeterminate colorScheme="blue" />
                                        </Box>
                                      ) : (
                                        <Text color="gray.500" fontWeight="bold" mr={2}>
                                          {step.id}.
                                        </Text>
                                      )}
                                      <VStack align="start" spacing={0}>
                                        <Text fontWeight="medium">{step.title}</Text>
                                        <Text fontSize="sm" color="gray.600">{step.description}</Text>
                                        {step.estimatedTime && (
                                          <Badge size="sm" colorScheme={getStepStatusColor(step.status)}>
                                            {step.estimatedTime}
                                          </Badge>
                                        )}
                                      </VStack>
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
                                      {!step.completed && step.status !== 'running' && (
                                        <IconButton
                                          aria-label="Execute step"
                                          icon={<FiArrowRight />}
                                          size="sm"
                                          colorScheme="teal"
                                          onClick={() => executeStep(step.id)}
                                          isDisabled={isExecutingStep}
                                        />
                                      )}
                                    </HStack>
                                  </Flex>
                                  
                                  {step.explanation && step.completed && (
                                    <Alert status="info" size="sm" borderRadius="md">
                                      <AlertIcon />
                                      <AlertDescription fontSize="sm">
                                        {step.explanation}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </VStack>
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
                      <Text fontWeight="medium" mb={2}>Active Agents:</Text>
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
                              {agent.expertise.map(exp => (
                                <Badge key={exp} colorScheme="green" size="sm">{exp}</Badge>
                              ))}
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

      {/* Edit Step Modal */}
      <Modal isOpen={isEditStepOpen} onClose={handleModalCancel}>
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
            <Button variant="ghost" mr={3} onClick={handleModalCancel}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleModalSave}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Advanced Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={onSettingsClose} size="6xl">
        <ModalOverlay />
        <ModalContent maxH="90vh">
          <ModalHeader>Advanced Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <AdvancedSettings onSettingsChange={setAdvancedSettings} />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSettingsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default App;