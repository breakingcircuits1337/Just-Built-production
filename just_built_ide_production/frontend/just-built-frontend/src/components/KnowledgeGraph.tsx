import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Select,
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
  FormControl,
  FormLabel,
  Textarea,
  IconButton,
  Tooltip,
  Flex,
  Spacer,
  Alert,
  AlertIcon,
  AlertDescription,
  SimpleGrid,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText
} from '@chakra-ui/react';
import {
  FiSearch,
  FiPlus,
  FiRefreshCw,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiFilter,
  FiBookmark,
  FiTrendingUp,
  FiGitBranch,
  FiCode,
  FiBook,
  FiSettings,
  FiEye,
  FiEdit,
  FiTrash2
} from 'react-icons/fi';

interface KnowledgeNode {
  id: string;
  type: 'concept' | 'library' | 'framework' | 'language' | 'pattern' | 'tool' | 'bestPractice';
  name: string;
  description: string;
  url?: string;
  popularity: number;
  maturity: number;
  tags: string[];
  connections: string[];
  x?: number;
  y?: number;
}

interface KnowledgeGraphProps {
  onRecommendation: (recommendations: any[]) => void;
  onClose: () => void;
  currentContext?: {
    code?: string;
    language?: string;
    framework?: string;
  };
}

const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ 
  onRecommendation, 
  onClose, 
  currentContext 
}) => {
  const [nodes, setNodes] = useState<KnowledgeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'recommendations'>('graph');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toast = useToast();
  const { isOpen: isNodeModalOpen, onOpen: onNodeModalOpen, onClose: onNodeModalClose } = useDisclosure();
  const { isOpen: isAddNodeOpen, onOpen: onAddNodeOpen, onClose: onAddNodeClose } = useDisclosure();

  const [newNode, setNewNode] = useState({
    name: '',
    type: 'concept' as KnowledgeNode['type'],
    description: '',
    url: '',
    tags: ''
  });

  useEffect(() => {
    initializeKnowledgeGraph();
  }, []);

  useEffect(() => {
    if (currentContext) {
      generateRecommendations();
    }
  }, [currentContext, nodes]);

  useEffect(() => {
    if (viewMode === 'graph') {
      drawGraph();
    }
  }, [nodes, viewMode, zoomLevel, selectedNode]);

  const initializeKnowledgeGraph = () => {
    const mockNodes: KnowledgeNode[] = [
      {
        id: 'react',
        type: 'framework',
        name: 'React',
        description: 'A JavaScript library for building user interfaces',
        url: 'https://reactjs.org',
        popularity: 95,
        maturity: 90,
        tags: ['frontend', 'javascript', 'ui', 'component-based'],
        connections: ['typescript', 'chakra-ui', 'next-js', 'redux'],
        x: 400,
        y: 300
      },
      {
        id: 'typescript',
        type: 'language',
        name: 'TypeScript',
        description: 'A typed superset of JavaScript that compiles to plain JavaScript',
        url: 'https://typescriptlang.org',
        popularity: 88,
        maturity: 85,
        tags: ['language', 'javascript', 'typing', 'microsoft'],
        connections: ['react', 'node-js', 'angular'],
        x: 600,
        y: 200
      },
      {
        id: 'chakra-ui',
        type: 'library',
        name: 'Chakra UI',
        description: 'A simple, modular and accessible component library for React',
        url: 'https://chakra-ui.com',
        popularity: 75,
        maturity: 80,
        tags: ['ui', 'components', 'react', 'accessibility'],
        connections: ['react', 'emotion'],
        x: 200,
        y: 200
      },
      {
        id: 'node-js',
        type: 'framework',
        name: 'Node.js',
        description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine',
        url: 'https://nodejs.org',
        popularity: 92,
        maturity: 95,
        tags: ['backend', 'javascript', 'runtime', 'server'],
        connections: ['typescript', 'express', 'npm'],
        x: 400,
        y: 500
      },
      {
        id: 'express',
        type: 'framework',
        name: 'Express.js',
        description: 'Fast, unopinionated, minimalist web framework for Node.js',
        url: 'https://expressjs.com',
        popularity: 85,
        maturity: 90,
        tags: ['backend', 'web', 'api', 'middleware'],
        connections: ['node-js', 'mongodb', 'rest-api'],
        x: 600,
        y: 500
      },
      {
        id: 'rest-api',
        type: 'pattern',
        name: 'REST API',
        description: 'Representational State Transfer architectural style for web services',
        popularity: 90,
        maturity: 95,
        tags: ['api', 'architecture', 'http', 'web'],
        connections: ['express', 'graphql', 'http'],
        x: 800,
        y: 400
      },
      {
        id: 'component-pattern',
        type: 'pattern',
        name: 'Component Pattern',
        description: 'A design pattern for building reusable UI components',
        popularity: 85,
        maturity: 90,
        tags: ['pattern', 'ui', 'reusability', 'architecture'],
        connections: ['react', 'vue', 'angular'],
        x: 200,
        y: 400
      },
      {
        id: 'responsive-design',
        type: 'bestPractice',
        name: 'Responsive Design',
        description: 'Design approach to make web pages render well on different devices',
        popularity: 95,
        maturity: 90,
        tags: ['css', 'mobile', 'design', 'accessibility'],
        connections: ['css-grid', 'flexbox', 'media-queries'],
        x: 100,
        y: 300
      }
    ];

    setNodes(mockNodes);
  };

  const generateRecommendations = async () => {
    if (!currentContext) return;

    setIsLoading(true);
    
    try {
      // Simulate API call for recommendations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const contextTags = [
        currentContext.language,
        currentContext.framework,
        ...(currentContext.code?.includes('async') ? ['async'] : []),
        ...(currentContext.code?.includes('useState') ? ['state-management'] : []),
        ...(currentContext.code?.includes('API') ? ['api'] : [])
      ].filter(Boolean);

      const relevantNodes = nodes.filter(node => 
        node.tags.some(tag => contextTags.includes(tag)) ||
        contextTags.some(contextTag => node.name.toLowerCase().includes(contextTag?.toLowerCase() || ''))
      );

      const mockRecommendations = relevantNodes.slice(0, 5).map(node => ({
        node,
        relevanceScore: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
        reason: `Relevant to your ${currentContext.language} project using ${currentContext.framework}`,
        codeExample: generateCodeExample(node)
      }));

      setRecommendations(mockRecommendations);
      onRecommendation(mockRecommendations);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodeExample = (node: KnowledgeNode) => {
    switch (node.id) {
      case 'react':
        return `import React, { useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`;
      case 'chakra-ui':
        return `import { Box, Button, Text } from '@chakra-ui/react';

function MyComponent() {
  return (
    <Box p={4}>
      <Text fontSize="xl" mb={4}>
        Welcome to Chakra UI
      </Text>
      <Button colorScheme="blue">
        Click me
      </Button>
    </Box>
  );
}`;
      case 'express':
        return `const express = require('express');
const app = express();

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`;
      default:
        return `// Example usage of ${node.name}\n// Check documentation: ${node.url}`;
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom
    ctx.save();
    ctx.scale(zoomLevel, zoomLevel);

    // Draw connections
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode && node.x && node.y && connectedNode.x && connectedNode.y) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(connectedNode.x, connectedNode.y);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      if (!node.x || !node.y) return;

      const isSelected = selectedNode === node.id;
      const radius = 30 + (node.popularity / 100) * 20;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = getNodeColor(node.type);
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#3182ce';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Node label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(node.name, node.x, node.y + 4);
    });

    ctx.restore();
  };

  const getNodeColor = (type: KnowledgeNode['type']) => {
    switch (type) {
      case 'concept': return '#9f7aea';
      case 'library': return '#4299e1';
      case 'framework': return '#48bb78';
      case 'language': return '#ed8936';
      case 'pattern': return '#38b2ac';
      case 'tool': return '#e53e3e';
      case 'bestPractice': return '#d69e2e';
      default: return '#718096';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) / zoomLevel;
    const y = (event.clientY - rect.top) / zoomLevel;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      if (!node.x || !node.y) return false;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      const radius = 30 + (node.popularity / 100) * 20;
      return distance <= radius;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      onNodeModalOpen();
    }
  };

  const addNewNode = () => {
    if (!newNode.name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter a name for the node',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const node: KnowledgeNode = {
      id: `node-${Date.now()}`,
      name: newNode.name,
      type: newNode.type,
      description: newNode.description,
      url: newNode.url,
      popularity: 50,
      maturity: 50,
      tags: newNode.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      connections: [],
      x: 400 + Math.random() * 200 - 100,
      y: 300 + Math.random() * 200 - 100
    };

    setNodes(prev => [...prev, node]);
    setNewNode({ name: '', type: 'concept', description: '', url: '', tags: '' });
    onAddNodeClose();

    toast({
      title: 'Node Added',
      description: `Added ${node.name} to the knowledge graph`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || node.type === filterType;
    return matchesSearch && matchesType;
  });

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Knowledge Graph</Heading>
            <Text color="gray.600">Explore programming concepts and their relationships</Text>
          </VStack>
          <HStack spacing={4}>
            <HStack spacing={2}>
              <Input
                placeholder="Search knowledge..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="sm"
                width="200px"
              />
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} size="sm" width="150px">
                <option value="all">All Types</option>
                <option value="concept">Concepts</option>
                <option value="library">Libraries</option>
                <option value="framework">Frameworks</option>
                <option value="language">Languages</option>
                <option value="pattern">Patterns</option>
                <option value="tool">Tools</option>
                <option value="bestPractice">Best Practices</option>
              </Select>
            </HStack>
            <HStack spacing={2}>
              <Select value={viewMode} onChange={(e) => setViewMode(e.target.value as any)} size="sm">
                <option value="graph">Graph View</option>
                <option value="list">List View</option>
                <option value="recommendations">Recommendations</option>
              </Select>
              {viewMode === 'graph' && (
                <>
                  <IconButton
                    aria-label="Zoom out"
                    icon={<FiZoomOut />}
                    size="sm"
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                  />
                  <IconButton
                    aria-label="Zoom in"
                    icon={<FiZoomIn />}
                    size="sm"
                    onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                  />
                </>
              )}
              <Button size="sm" leftIcon={<FiPlus />} onClick={onAddNodeOpen}>
                Add Node
              </Button>
              <Button size="sm" leftIcon={<FiRefreshCw />} onClick={generateRecommendations} isLoading={isLoading}>
                Refresh
              </Button>
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Flex flex="1">
        {/* Main Content */}
        <Box flex="1" overflow="hidden">
          {viewMode === 'graph' && (
            <Box position="relative" height="100%">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ width: '100%', height: '100%', cursor: 'pointer' }}
                onClick={handleCanvasClick}
              />
              <Box position="absolute" bottom={4} left={4}>
                <Badge>Zoom: {Math.round(zoomLevel * 100)}%</Badge>
              </Box>
            </Box>
          )}

          {viewMode === 'list' && (
            <Box p={4} height="100%" overflow="auto">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {filteredNodes.map(node => (
                  <Box
                    key={node.id}
                    p={4}
                    bg="white"
                    border="1px"
                    borderColor="gray.200"
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => {
                      setSelectedNode(node.id);
                      onNodeModalOpen();
                    }}
                    _hover={{ borderColor: 'blue.300', shadow: 'md' }}
                  >
                    <VStack align="start" spacing={2}>
                      <HStack>
                        <Badge colorScheme={getNodeTypeColorScheme(node.type)}>
                          {node.type}
                        </Badge>
                        <Text fontWeight="bold">{node.name}</Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {node.description}
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="xs">Popularity:</Text>
                        <Progress value={node.popularity} size="sm" width="60px" />
                        <Text fontSize="xs">{node.popularity}%</Text>
                      </HStack>
                      <HStack wrap="wrap" spacing={1}>
                        {node.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} size="sm" variant="outline">
                            {tag}
                          </Badge>
                        ))}
                        {node.tags.length > 3 && (
                          <Badge size="sm" variant="outline">
                            +{node.tags.length - 3}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {viewMode === 'recommendations' && (
            <Box p={4} height="100%" overflow="auto">
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Recommendations for Your Project</Heading>
                  <Button size="sm" onClick={generateRecommendations} isLoading={isLoading}>
                    Refresh Recommendations
                  </Button>
                </HStack>

                {currentContext && (
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      Based on your {currentContext.language} project using {currentContext.framework}
                    </AlertDescription>
                  </Alert>
                )}

                {recommendations.length > 0 ? (
                  <VStack spacing={4} align="stretch">
                    {recommendations.map((rec, index) => (
                      <Box
                        key={index}
                        p={4}
                        bg="white"
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                      >
                        <HStack justify="space-between" mb={2}>
                          <HStack>
                            <Badge colorScheme={getNodeTypeColorScheme(rec.node.type)}>
                              {rec.node.type}
                            </Badge>
                            <Text fontWeight="bold">{rec.node.name}</Text>
                            <Badge colorScheme="green">
                              {Math.round(rec.relevanceScore * 100)}% match
                            </Badge>
                          </HStack>
                          {rec.node.url && (
                            <Button size="xs" as="a" href={rec.node.url} target="_blank">
                              Learn More
                            </Button>
                          )}
                        </HStack>
                        <Text fontSize="sm" color="gray.600" mb={2}>
                          {rec.reason}
                        </Text>
                        <Text fontSize="sm" mb={3}>
                          {rec.node.description}
                        </Text>
                        {rec.codeExample && (
                          <Box>
                            <Text fontSize="sm" fontWeight="medium" mb={2}>
                              Example Usage:
                            </Text>
                            <Box
                              p={3}
                              bg="gray.100"
                              borderRadius="md"
                              fontFamily="monospace"
                              fontSize="sm"
                              overflow="auto"
                            >
                              <pre>{rec.codeExample}</pre>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Box textAlign="center" py={8}>
                    <Text color="gray.500">
                      No recommendations available. Try adding some code context.
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          )}
        </Box>

        {/* Sidebar */}
        <Box width="300px" bg="gray.50" borderLeft="1px" borderColor="gray.200" p={4}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>Graph Statistics</Heading>
              <SimpleGrid columns={1} spacing={2}>
                <Stat size="sm">
                  <StatLabel>Total Nodes</StatLabel>
                  <StatNumber>{nodes.length}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel>Connections</StatLabel>
                  <StatNumber>{nodes.reduce((sum, node) => sum + node.connections.length, 0)}</StatNumber>
                </Stat>
                <Stat size="sm">
                  <StatLabel>Coverage</StatLabel>
                  <StatNumber>{filteredNodes.length}</StatNumber>
                  <StatHelpText>Matching filter</StatHelpText>
                </Stat>
              </SimpleGrid>
            </Box>

            <Box>
              <Heading size="sm" mb={2">Node Types</Heading>
              <VStack spacing={1} align="stretch">
                {['concept', 'library', 'framework', 'language', 'pattern', 'tool', 'bestPractice'].map(type => {
                  const count = nodes.filter(n => n.type === type).length;
                  return (
                    <HStack key={type} justify="space-between">
                      <Badge colorScheme={getNodeTypeColorScheme(type)} size="sm">
                        {type}
                      </Badge>
                      <Text fontSize="sm">{count}</Text>
                    </HStack>
                  );
                })}
              </VStack>
            </Box>

            {selectedNodeData && (
              <Box>
                <Heading size="sm" mb={2}>Selected Node</Heading>
                <VStack align="stretch" spacing={2}>
                  <Text fontSize="sm"><strong>Name:</strong> {selectedNodeData.name}</Text>
                  <Text fontSize="sm"><strong>Type:</strong> {selectedNodeData.type}</Text>
                  <Text fontSize="sm"><strong>Popularity:</strong> {selectedNodeData.popularity}%</Text>
                  <Text fontSize="sm"><strong>Connections:</strong> {selectedNodeData.connections.length}</Text>
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>
      </Flex>

      {/* Modals */}
      <Modal isOpen={isNodeModalOpen} onClose={onNodeModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Node Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNodeData && (
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Badge colorScheme={getNodeTypeColorScheme(selectedNodeData.type)}>
                    {selectedNodeData.type}
                  </Badge>
                  <Heading size="md">{selectedNodeData.name}</Heading>
                </HStack>
                
                <Text>{selectedNodeData.description}</Text>
                
                {selectedNodeData.url && (
                  <Button as="a" href={selectedNodeData.url} target="_blank" size="sm" width="fit-content">
                    Visit Documentation
                  </Button>
                )}
                
                <SimpleGrid columns={2} spacing={4}>
                  <Stat>
                    <StatLabel>Popularity</StatLabel>
                    <StatNumber>{selectedNodeData.popularity}%</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Maturity</StatLabel>
                    <StatNumber>{selectedNodeData.maturity}%</StatNumber>
                  </Stat>
                </SimpleGrid>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Tags:</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {selectedNodeData.tags.map(tag => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </HStack>
                </Box>
                
                <Box>
                  <Text fontWeight="medium" mb={2}>Connected to:</Text>
                  <VStack align="stretch" spacing={1}>
                    {selectedNodeData.connections.map(connectionId => {
                      const connectedNode = nodes.find(n => n.id === connectionId);
                      return connectedNode ? (
                        <HStack key={connectionId} justify="space-between">
                          <Text fontSize="sm">{connectedNode.name}</Text>
                          <Badge size="sm" colorScheme={getNodeTypeColorScheme(connectedNode.type)}>
                            {connectedNode.type}
                          </Badge>
                        </HStack>
                      ) : null;
                    })}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onNodeModalClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isAddNodeOpen} onClose={onAddNodeClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Node</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={newNode.name}
                  onChange={(e) => setNewNode(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter node name"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Type</FormLabel>
                <Select
                  value={newNode.type}
                  onChange={(e) => setNewNode(prev => ({ ...prev, type: e.target.value as any }))}
                >
                  <option value="concept">Concept</option>
                  <option value="library">Library</option>
                  <option value="framework">Framework</option>
                  <option value="language">Language</option>
                  <option value="pattern">Pattern</option>
                  <option value="tool">Tool</option>
                  <option value="bestPractice">Best Practice</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newNode.description}
                  onChange={(e) => setNewNode(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this node"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>URL</FormLabel>
                <Input
                  value={newNode.url}
                  onChange={(e) => setNewNode(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Documentation URL (optional)"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  value={newNode.tags}
                  onChange={(e) => setNewNode(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Comma-separated tags"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddNodeClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={addNewNode}>
              Add Node
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const getNodeTypeColorScheme = (type: string) => {
  switch (type) {
    case 'concept': return 'purple';
    case 'library': return 'blue';
    case 'framework': return 'green';
    case 'language': return 'orange';
    case 'pattern': return 'teal';
    case 'tool': return 'red';
    case 'bestPractice': return 'yellow';
    default: return 'gray';
  }
};

export default KnowledgeGraph;