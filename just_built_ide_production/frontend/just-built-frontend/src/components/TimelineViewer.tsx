import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Flex,
  Spacer,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Tooltip,
  SimpleGrid
} from '@chakra-ui/react';
import {
  FiClock,
  FiGitBranch,
  FiBookmark,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiRotateCcw,
  FiSave,
  FiEye,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';

interface TimelineNode {
  id: string;
  timestamp: Date;
  type: 'decision' | 'code' | 'plan' | 'explanation' | 'alternative' | 'user-edit';
  title: string;
  description: string;
  content: string;
  metadata: Record<string, any>;
  parentId?: string;
  childrenIds: string[];
  branchId: string;
  stepNumber: number;
}

interface TimelineBranch {
  id: string;
  name: string;
  description: string;
  created: Date;
  nodeIds: string[];
  isActive: boolean;
  parentBranchId?: string;
  branchPoint?: string;
}

interface TimelineViewerProps {
  projectId: string;
  onCodeRestore: (code: string) => void;
  onClose: () => void;
}

const TimelineViewer: React.FC<TimelineViewerProps> = ({ projectId, onCodeRestore, onClose }) => {
  const [timeline, setTimeline] = useState<{
    branches: TimelineBranch[];
    nodes: TimelineNode[];
    activeBranchId: string;
    activeNodeId: string;
    checkpoints: { name: string; nodeId: string }[];
  }>({
    branches: [],
    nodes: [],
    activeBranchId: '',
    activeNodeId: '',
    checkpoints: []
  });
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [newBranchName, setNewBranchName] = useState('');
  const [newCheckpointName, setNewCheckpointName] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'branches' | 'comparison'>('timeline');
  
  const toast = useToast();
  const { isOpen: isBranchModalOpen, onOpen: onBranchModalOpen, onClose: onBranchModalClose } = useDisclosure();
  const { isOpen: isCheckpointModalOpen, onOpen: onCheckpointModalOpen, onClose: onCheckpointModalClose } = useDisclosure();
  const { isOpen: isNodeDetailOpen, onOpen: onNodeDetailOpen, onClose: onNodeDetailClose } = useDisclosure();

  useEffect(() => {
    // Initialize with mock timeline data
    initializeTimeline();
  }, [projectId]);

  const initializeTimeline = () => {
    const mockBranches: TimelineBranch[] = [
      {
        id: 'main',
        name: 'Main',
        description: 'Main development branch',
        created: new Date(Date.now() - 3600000),
        nodeIds: ['node-1', 'node-2', 'node-3', 'node-4'],
        isActive: true
      },
      {
        id: 'feature-auth',
        name: 'Authentication Feature',
        description: 'Alternative approach for user authentication',
        created: new Date(Date.now() - 1800000),
        nodeIds: ['node-2', 'node-5', 'node-6'],
        isActive: false,
        parentBranchId: 'main',
        branchPoint: 'node-2'
      }
    ];

    const mockNodes: TimelineNode[] = [
      {
        id: 'node-1',
        timestamp: new Date(Date.now() - 3600000),
        type: 'plan',
        title: 'Project Initialization',
        description: 'Created initial project structure and plan',
        content: 'Initial project setup with React and TypeScript configuration',
        metadata: { model: 'gemini', confidence: 0.95 },
        childrenIds: ['node-2'],
        branchId: 'main',
        stepNumber: 1
      },
      {
        id: 'node-2',
        timestamp: new Date(Date.now() - 3000000),
        type: 'code',
        title: 'Component Structure',
        description: 'Generated main component structure',
        content: `import React from 'react';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World</h1>\n    </div>\n  );\n}\n\nexport default App;`,
        metadata: { model: 'gemini', linesAdded: 12 },
        parentId: 'node-1',
        childrenIds: ['node-3', 'node-5'],
        branchId: 'main',
        stepNumber: 2
      },
      {
        id: 'node-3',
        timestamp: new Date(Date.now() - 2400000),
        type: 'decision',
        title: 'Styling Approach',
        description: 'Decided to use Chakra UI for component styling',
        content: 'Analysis of styling options: CSS Modules vs Styled Components vs Chakra UI',
        metadata: { alternatives: ['styled-components', 'emotion', 'tailwind'] },
        parentId: 'node-2',
        childrenIds: ['node-4'],
        branchId: 'main',
        stepNumber: 3
      },
      {
        id: 'node-4',
        timestamp: new Date(Date.now() - 1800000),
        type: 'code',
        title: 'UI Implementation',
        description: 'Implemented UI components with Chakra UI',
        content: `import { ChakraProvider, Box, Heading } from '@chakra-ui/react';\n\nfunction App() {\n  return (\n    <ChakraProvider>\n      <Box p={8}>\n        <Heading>Welcome to the App</Heading>\n      </Box>\n    </ChakraProvider>\n  );\n}`,
        metadata: { model: 'gemini', linesAdded: 15, linesModified: 8 },
        parentId: 'node-3',
        childrenIds: [],
        branchId: 'main',
        stepNumber: 4
      },
      {
        id: 'node-5',
        timestamp: new Date(Date.now() - 2100000),
        type: 'alternative',
        title: 'Authentication Alternative',
        description: 'Alternative implementation using Firebase Auth',
        content: 'Firebase Authentication setup with Google and email providers',
        metadata: { model: 'claude', approach: 'firebase' },
        parentId: 'node-2',
        childrenIds: ['node-6'],
        branchId: 'feature-auth',
        stepNumber: 3
      },
      {
        id: 'node-6',
        timestamp: new Date(Date.now() - 1500000),
        type: 'code',
        title: 'Auth Implementation',
        description: 'Implemented Firebase authentication',
        content: `import { initializeApp } from 'firebase/app';\nimport { getAuth } from 'firebase/auth';\n\nconst firebaseConfig = {\n  // config\n};\n\nconst app = initializeApp(firebaseConfig);\nexport const auth = getAuth(app);`,
        metadata: { model: 'claude', linesAdded: 20 },
        parentId: 'node-5',
        childrenIds: [],
        branchId: 'feature-auth',
        stepNumber: 4
      }
    ];

    const mockCheckpoints = [
      { name: 'Initial Setup', nodeId: 'node-1' },
      { name: 'Basic Structure', nodeId: 'node-2' },
      { name: 'UI Complete', nodeId: 'node-4' }
    ];

    setTimeline({
      branches: mockBranches,
      nodes: mockNodes,
      activeBranchId: 'main',
      activeNodeId: 'node-4',
      checkpoints: mockCheckpoints
    });
  };

  const navigateToNode = (nodeId: string) => {
    const node = timeline.nodes.find(n => n.id === nodeId);
    if (node) {
      setTimeline(prev => ({
        ...prev,
        activeNodeId: nodeId,
        activeBranchId: node.branchId
      }));
      
      setSelectedNode(nodeId);
      
      toast({
        title: 'Timeline Navigation',
        description: `Navigated to: ${node.title}`,
        status: 'info',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const createBranch = () => {
    if (!newBranchName.trim()) {
      toast({
        title: 'Branch Name Required',
        description: 'Please enter a name for the new branch',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newBranch: TimelineBranch = {
      id: `branch-${Date.now()}`,
      name: newBranchName,
      description: `Branch created from ${timeline.activeNodeId}`,
      created: new Date(),
      nodeIds: [timeline.activeNodeId],
      isActive: true,
      parentBranchId: timeline.activeBranchId,
      branchPoint: timeline.activeNodeId
    };

    setTimeline(prev => ({
      ...prev,
      branches: prev.branches.map(b => ({ ...b, isActive: false })).concat(newBranch),
      activeBranchId: newBranch.id
    }));

    setNewBranchName('');
    onBranchModalClose();

    toast({
      title: 'Branch Created',
      description: `Created new branch: ${newBranch.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const createCheckpoint = () => {
    if (!newCheckpointName.trim()) {
      toast({
        title: 'Checkpoint Name Required',
        description: 'Please enter a name for the checkpoint',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newCheckpoint = {
      name: newCheckpointName,
      nodeId: timeline.activeNodeId
    };

    setTimeline(prev => ({
      ...prev,
      checkpoints: [...prev.checkpoints, newCheckpoint]
    }));

    setNewCheckpointName('');
    onCheckpointModalClose();

    toast({
      title: 'Checkpoint Created',
      description: `Created checkpoint: ${newCheckpoint.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const startPlayback = () => {
    setIsPlaying(true);
    // Implement playback logic here
    toast({
      title: 'Playback Started',
      description: 'Playing through development timeline',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    toast({
      title: 'Playback Stopped',
      description: 'Timeline playback stopped',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const restoreToNode = (nodeId: string) => {
    const node = timeline.nodes.find(n => n.id === nodeId);
    if (node && node.content) {
      onCodeRestore(node.content);
      navigateToNode(nodeId);
      
      toast({
        title: 'Code Restored',
        description: `Restored code from: ${node.title}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'decision': return 'purple';
      case 'code': return 'green';
      case 'plan': return 'blue';
      case 'explanation': return 'orange';
      case 'alternative': return 'yellow';
      case 'user-edit': return 'red';
      default: return 'gray';
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'decision': return FiGitBranch;
      case 'code': return FiEdit;
      case 'plan': return FiClock;
      case 'explanation': return FiEye;
      case 'alternative': return FiArrowRight;
      case 'user-edit': return FiEdit;
      default: return FiClock;
    }
  };

  const activeBranch = timeline.branches.find(b => b.id === timeline.activeBranchId);
  const activeNode = timeline.nodes.find(n => n.id === timeline.activeNodeId);
  const selectedNodeData = selectedNode ? timeline.nodes.find(n => n.id === selectedNode) : null;

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Development Timeline</Heading>
            <Text color="gray.600">Navigate through your development history</Text>
          </VStack>
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)} size="sm">
                <option value="timeline">Timeline View</option>
                <option value="branches">Branch View</option>
                <option value="comparison">Comparison View</option>
              </Select>
              <Select value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))} size="sm">
                <option value={0.5}>0.5x Speed</option>
                <option value={1}>1x Speed</option>
                <option value={2}>2x Speed</option>
                <option value={4}>4x Speed</option>
              </Select>
            </HStack>
            <HStack spacing={2}>
              <IconButton
                aria-label="Previous node"
                icon={<FiSkipBack />}
                size="sm"
                onClick={() => {
                  const currentIndex = timeline.nodes.findIndex(n => n.id === timeline.activeNodeId);
                  if (currentIndex > 0) {
                    navigateToNode(timeline.nodes[currentIndex - 1].id);
                  }
                }}
              />
              <IconButton
                aria-label={isPlaying ? "Pause playback" : "Start playback"}
                icon={isPlaying ? <FiPause /> : <FiPlay />}
                size="sm"
                colorScheme="teal"
                onClick={isPlaying ? stopPlayback : startPlayback}
              />
              <IconButton
                aria-label="Next node"
                icon={<FiSkipForward />}
                size="sm"
                onClick={() => {
                  const currentIndex = timeline.nodes.findIndex(n => n.id === timeline.activeNodeId);
                  if (currentIndex < timeline.nodes.length - 1) {
                    navigateToNode(timeline.nodes[currentIndex + 1].id);
                  }
                }}
              />
            </HStack>
            <HStack spacing={2}>
              <Button size="sm" leftIcon={<FiGitBranch />} onClick={onBranchModalOpen}>
                New Branch
              </Button>
              <Button size="sm" leftIcon={<FiBookmark />} onClick={onCheckpointModalOpen}>
                Checkpoint
              </Button>
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Flex flex="1">
        {/* Timeline Content */}
        <Box flex="1" p={4} overflow="auto">
          {viewMode === 'timeline' && (
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Active Branch: {activeBranch?.name}</Text>
                    <Text fontSize="sm" color="gray.600">{activeBranch?.description}</Text>
                  </VStack>
                  <Badge colorScheme="green">
                    {timeline.nodes.filter(n => n.branchId === timeline.activeBranchId).length} nodes
                  </Badge>
                </HStack>

                {/* Timeline Progress */}
                <Box mb={6}>
                  <Text fontSize="sm" mb={2}>Timeline Progress</Text>
                  <Progress 
                    value={(timeline.nodes.findIndex(n => n.id === timeline.activeNodeId) + 1) / timeline.nodes.length * 100}
                    colorScheme="teal"
                    size="lg"
                  />
                </Box>
              </Box>

              {/* Timeline Nodes */}
              <VStack spacing={4} align="stretch">
                {timeline.nodes
                  .filter(node => node.branchId === timeline.activeBranchId)
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((node, index) => {
                    const IconComponent = getNodeTypeIcon(node.type);
                    const isActive = node.id === timeline.activeNodeId;
                    const isSelected = node.id === selectedNode;
                    
                    return (
                      <Box
                        key={node.id}
                        position="relative"
                        pl={8}
                      >
                        {/* Timeline Line */}
                        {index < timeline.nodes.filter(n => n.branchId === timeline.activeBranchId).length - 1 && (
                          <Box
                            position="absolute"
                            left="15px"
                            top="40px"
                            width="2px"
                            height="60px"
                            bg="gray.300"
                          />
                        )}
                        
                        {/* Timeline Node */}
                        <Box
                          position="absolute"
                          left="8px"
                          top="8px"
                          width="16px"
                          height="16px"
                          borderRadius="full"
                          bg={isActive ? 'teal.500' : 'gray.300'}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconComponent size={8} color="white" />
                        </Box>
                        
                        {/* Node Content */}
                        <Box
                          p={4}
                          bg={isSelected ? 'blue.50' : isActive ? 'teal.50' : 'white'}
                          border="1px"
                          borderColor={isSelected ? 'blue.200' : isActive ? 'teal.200' : 'gray.200'}
                          borderRadius="md"
                          cursor="pointer"
                          onClick={() => setSelectedNode(node.id)}
                          _hover={{ bg: 'gray.50' }}
                        >
                          <HStack justify="space-between" mb={2}>
                            <VStack align="start" spacing={1}>
                              <HStack>
                                <Badge colorScheme={getNodeTypeColor(node.type)} size="sm">
                                  {node.type}
                                </Badge>
                                <Text fontWeight="bold">{node.title}</Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">{node.description}</Text>
                            </VStack>
                            <VStack align="end" spacing={1}>
                              <Text fontSize="xs" color="gray.500">
                                {node.timestamp.toLocaleTimeString()}
                              </Text>
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label="View details"
                                  icon={<FiEye />}
                                  size="xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(node.id);
                                    onNodeDetailOpen();
                                  }}
                                />
                                <IconButton
                                  aria-label="Restore to this point"
                                  icon={<FiRotateCcw />}
                                  size="xs"
                                  colorScheme="teal"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    restoreToNode(node.id);
                                  }}
                                />
                              </HStack>
                            </VStack>
                          </HStack>
                          
                          {node.metadata && (
                            <HStack spacing={2} mt={2}>
                              {node.metadata.model && (
                                <Badge size="xs" colorScheme="purple">
                                  {node.metadata.model}
                                </Badge>
                              )}
                              {node.metadata.linesAdded && (
                                <Badge size="xs" colorScheme="green">
                                  +{node.metadata.linesAdded} lines
                                </Badge>
                              )}
                              {node.metadata.confidence && (
                                <Badge size="xs" colorScheme="blue">
                                  {Math.round(node.metadata.confidence * 100)}% confidence
                                </Badge>
                              )}
                            </HStack>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
              </VStack>
            </VStack>
          )}

          {viewMode === 'branches' && (
            <VStack spacing={4} align="stretch">
              <Heading size="md">All Branches</Heading>
              {timeline.branches.map(branch => (
                <Box
                  key={branch.id}
                  p={4}
                  bg={branch.isActive ? 'teal.50' : 'white'}
                  border="1px"
                  borderColor={branch.isActive ? 'teal.200' : 'gray.200'}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => setTimeline(prev => ({
                    ...prev,
                    activeBranchId: branch.id,
                    branches: prev.branches.map(b => ({ ...b, isActive: b.id === branch.id }))
                  }))}
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <FiGitBranch />
                        <Text fontWeight="bold">{branch.name}</Text>
                        {branch.isActive && <Badge colorScheme="teal">Active</Badge>}
                      </HStack>
                      <Text fontSize="sm" color="gray.600">{branch.description}</Text>
                      <Text fontSize="xs" color="gray.500">
                        Created: {branch.created.toLocaleString()}
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Badge>{branch.nodeIds.length} nodes</Badge>
                      {branch.parentBranchId && (
                        <Text fontSize="xs" color="gray.500">
                          From: {timeline.branches.find(b => b.id === branch.parentBranchId)?.name}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          {viewMode === 'comparison' && (
            <VStack spacing={4} align="stretch">
              <Heading size="md">Branch Comparison</Heading>
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  Select two branches to compare their development paths and outcomes.
                </AlertDescription>
              </Alert>
              {/* Comparison interface would go here */}
            </VStack>
          )}
        </Box>

        {/* Sidebar */}
        <Box width="300px" bg="gray.50" borderLeft="1px" borderColor="gray.200" p={4}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>Current State</Heading>
              {activeNode && (
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm"><strong>Node:</strong> {activeNode.title}</Text>
                  <Text fontSize="sm"><strong>Type:</strong> {activeNode.type}</Text>
                  <Text fontSize="sm"><strong>Step:</strong> {activeNode.stepNumber}</Text>
                  <Text fontSize="sm"><strong>Time:</strong> {activeNode.timestamp.toLocaleString()}</Text>
                </VStack>
              )}
            </Box>

            <Box>
              <Heading size="sm" mb={2}>Checkpoints</Heading>
              <VStack spacing={2} align="stretch">
                {timeline.checkpoints.map((checkpoint, index) => (
                  <Box
                    key={index}
                    p={2}
                    bg="white"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => navigateToNode(checkpoint.nodeId)}
                    _hover={{ bg: 'gray.100' }}
                  >
                    <HStack>
                      <FiBookmark />
                      <Text fontSize="sm" fontWeight="medium">{checkpoint.name}</Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>Statistics</Heading>
              <SimpleGrid columns={1} spacing={2}>
                <Box p={2} bg="white" borderRadius="md">
                  <Text fontSize="xs" color="gray.600">Total Nodes</Text>
                  <Text fontWeight="bold">{timeline.nodes.length}</Text>
                </Box>
                <Box p={2} bg="white" borderRadius="md">
                  <Text fontSize="xs" color="gray.600">Branches</Text>
                  <Text fontWeight="bold">{timeline.branches.length}</Text>
                </Box>
                <Box p={2} bg="white" borderRadius="md">
                  <Text fontSize="xs" color="gray.600">Checkpoints</Text>
                  <Text fontWeight="bold">{timeline.checkpoints.length}</Text>
                </Box>
              </SimpleGrid>
            </Box>
          </VStack>
        </Box>
      </Flex>

      {/* Modals */}
      <Modal isOpen={isBranchModalOpen} onClose={onBranchModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Branch</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Branch Name</FormLabel>
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="Enter branch name"
                />
              </FormControl>
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  This will create a new branch from the current node: {activeNode?.title}
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBranchModalClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={createBranch}>
              Create Branch
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isCheckpointModalOpen} onClose={onCheckpointModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Checkpoint</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Checkpoint Name</FormLabel>
                <Input
                  value={newCheckpointName}
                  onChange={(e) => setNewCheckpointName(e.target.value)}
                  placeholder="Enter checkpoint name"
                />
              </FormControl>
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  This will create a checkpoint at the current node: {activeNode?.title}
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCheckpointModalClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={createCheckpoint}>
              Create Checkpoint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isNodeDetailOpen} onClose={onNodeDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Node Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNodeData && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" mb={2}>{selectedNodeData.title}</Text>
                  <Text color="gray.600" mb={4}>{selectedNodeData.description}</Text>
                  <HStack spacing={2} mb={4}>
                    <Badge colorScheme={getNodeTypeColor(selectedNodeData.type)}>
                      {selectedNodeData.type}
                    </Badge>
                    <Badge>Step {selectedNodeData.stepNumber}</Badge>
                    <Badge variant="outline">
                      {selectedNodeData.timestamp.toLocaleString()}
                    </Badge>
                  </HStack>
                </Box>
                
                {selectedNodeData.content && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Content:</Text>
                    <Box
                      p={4}
                      bg="gray.100"
                      borderRadius="md"
                      fontFamily="monospace"
                      fontSize="sm"
                      maxH="300px"
                      overflowY="auto"
                    >
                      <pre>{selectedNodeData.content}</pre>
                    </Box>
                  </Box>
                )}
                
                {selectedNodeData.metadata && Object.keys(selectedNodeData.metadata).length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Metadata:</Text>
                    <Box p={4} bg="gray.50" borderRadius="md">
                      {Object.entries(selectedNodeData.metadata).map(([key, value]) => (
                        <Text key={key} fontSize="sm">
                          <strong>{key}:</strong> {String(value)}
                        </Text>
                      ))}
                    </Box>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onNodeDetailClose}>
              Close
            </Button>
            {selectedNodeData && (
              <Button
                colorScheme="teal"
                onClick={() => {
                  restoreToNode(selectedNodeData.id);
                  onNodeDetailClose();
                }}
              >
                Restore to This Point
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TimelineViewer;