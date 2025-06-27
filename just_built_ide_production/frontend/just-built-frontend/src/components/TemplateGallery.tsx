import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
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
  Select,
  Image,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { FiCode, FiStar, FiDownload, FiEye } from 'react-icons/fi';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  rating: number;
  downloads: number;
  preview?: string;
  features: string[];
  estimatedTime: string;
}

interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
  onClose: () => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onTemplateSelect, onClose }) => {
  const [templates] = useState<Template[]>([
    {
      id: '1',
      name: 'E-commerce Store',
      description: 'Complete e-commerce solution with product catalog, shopping cart, and payment integration',
      category: 'web-app',
      framework: 'react',
      difficulty: 'intermediate',
      tags: ['e-commerce', 'stripe', 'authentication', 'responsive'],
      rating: 4.8,
      downloads: 1250,
      features: ['Product Management', 'Shopping Cart', 'Payment Processing', 'User Authentication', 'Admin Dashboard'],
      estimatedTime: '2-3 hours'
    },
    {
      id: '2',
      name: 'Task Management App',
      description: 'Productivity app with task tracking, team collaboration, and project management',
      category: 'web-app',
      framework: 'vue',
      difficulty: 'beginner',
      tags: ['productivity', 'collaboration', 'drag-drop', 'real-time'],
      rating: 4.6,
      downloads: 890,
      features: ['Task Boards', 'Team Collaboration', 'Real-time Updates', 'File Attachments', 'Time Tracking'],
      estimatedTime: '1-2 hours'
    },
    {
      id: '3',
      name: 'Social Media Dashboard',
      description: 'Analytics dashboard for social media management with charts and insights',
      category: 'web-app',
      framework: 'react',
      difficulty: 'advanced',
      tags: ['analytics', 'charts', 'dashboard', 'social-media'],
      rating: 4.9,
      downloads: 2100,
      features: ['Data Visualization', 'Multi-platform Integration', 'Custom Reports', 'Real-time Analytics'],
      estimatedTime: '3-4 hours'
    },
    {
      id: '4',
      name: 'REST API Server',
      description: 'Scalable REST API with authentication, database integration, and documentation',
      category: 'api',
      framework: 'express',
      difficulty: 'intermediate',
      tags: ['api', 'authentication', 'database', 'documentation'],
      rating: 4.7,
      downloads: 1560,
      features: ['JWT Authentication', 'Database ORM', 'API Documentation', 'Rate Limiting', 'Error Handling'],
      estimatedTime: '2-3 hours'
    },
    {
      id: '5',
      name: 'Mobile Chat App',
      description: 'Real-time chat application with push notifications and media sharing',
      category: 'mobile-app',
      framework: 'react-native',
      difficulty: 'advanced',
      tags: ['chat', 'real-time', 'push-notifications', 'media'],
      rating: 4.5,
      downloads: 750,
      features: ['Real-time Messaging', 'Push Notifications', 'Media Sharing', 'Group Chats', 'Offline Support'],
      estimatedTime: '4-5 hours'
    },
    {
      id: '6',
      name: 'Portfolio Website',
      description: 'Professional portfolio website with animations and responsive design',
      category: 'web-app',
      framework: 'svelte',
      difficulty: 'beginner',
      tags: ['portfolio', 'animations', 'responsive', 'seo'],
      rating: 4.4,
      downloads: 980,
      features: ['Responsive Design', 'Smooth Animations', 'SEO Optimized', 'Contact Form', 'Blog Section'],
      estimatedTime: '1-2 hours'
    },
    {
      id: '7',
      name: 'Data Visualization Tool',
      description: 'Interactive data visualization tool with multiple chart types and export options',
      category: 'web-app',
      framework: 'angular',
      difficulty: 'advanced',
      tags: ['data-viz', 'charts', 'export', 'interactive'],
      rating: 4.8,
      downloads: 1340,
      features: ['Multiple Chart Types', 'Data Import/Export', 'Interactive Filters', 'Custom Themes'],
      estimatedTime: '3-4 hours'
    },
    {
      id: '8',
      name: 'Weather App',
      description: 'Weather application with location services and detailed forecasts',
      category: 'mobile-app',
      framework: 'flutter',
      difficulty: 'beginner',
      tags: ['weather', 'location', 'api', 'forecast'],
      rating: 4.3,
      downloads: 650,
      features: ['Current Weather', '7-day Forecast', 'Location Services', 'Weather Maps', 'Notifications'],
      estimatedTime: '1-2 hours'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterFramework, setFilterFramework] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const toast = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    const matchesFramework = filterFramework === 'all' || template.framework === filterFramework;
    const matchesDifficulty = filterDifficulty === 'all' || template.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesFramework && matchesDifficulty;
  });

  const handleTemplateSelect = (template: Template) => {
    onTemplateSelect(template);
    toast({
      title: 'Template Selected',
      description: `${template.name} template will be used for your project`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    onPreviewOpen();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'green';
      case 'intermediate': return 'orange';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getFrameworkIcon = (framework: string) => {
    const icons: Record<string, string> = {
      'react': '⚛️',
      'vue': '💚',
      'angular': '🅰️',
      'svelte': '🧡',
      'express': '🚀',
      'react-native': '📱',
      'flutter': '🐦',
      'django': '🐍',
      'flask': '🌶️'
    };
    return icons[framework] || '⚡';
  };

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="xl">Template Gallery</Heading>
            <Text color="gray.600">Choose from our collection of pre-built templates</Text>
          </VStack>
          <Button onClick={onClose}>Close</Button>
        </Flex>

        {/* Filters */}
        <HStack spacing={4} wrap="wrap">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Categories</option>
            <option value="web-app">Web App</option>
            <option value="mobile-app">Mobile App</option>
            <option value="api">API</option>
            <option value="desktop-app">Desktop App</option>
          </Select>
          <Select
            value={filterFramework}
            onChange={(e) => setFilterFramework(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Frameworks</option>
            <option value="react">React</option>
            <option value="vue">Vue.js</option>
            <option value="angular">Angular</option>
            <option value="svelte">Svelte</option>
            <option value="express">Express</option>
            <option value="react-native">React Native</option>
            <option value="flutter">Flutter</option>
          </Select>
          <Select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </HStack>

        {/* Templates Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              transition="all 0.2s"
            >
              <CardHeader pb={2}>
                <VStack align="start" spacing={2}>
                  <HStack justify="space-between" width="100%">
                    <HStack>
                      <Text fontSize="lg">{getFrameworkIcon(template.framework)}</Text>
                      <Heading size="md" noOfLines={1}>{template.name}</Heading>
                    </HStack>
                    <HStack>
                      <FiStar />
                      <Text fontSize="sm">{template.rating}</Text>
                    </HStack>
                  </HStack>
                  <HStack spacing={2}>
                    <Badge colorScheme={getDifficultyColor(template.difficulty)} size="sm">
                      {template.difficulty}
                    </Badge>
                    <Badge colorScheme="purple" size="sm">
                      {template.framework}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {template.category}
                    </Badge>
                  </HStack>
                </VStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="stretch" spacing={3}>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {template.description}
                  </Text>
                  
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>Key Features:</Text>
                    <VStack align="start" spacing={1}>
                      {template.features.slice(0, 3).map((feature, index) => (
                        <Text key={index} fontSize="xs" color="gray.600">
                          • {feature}
                        </Text>
                      ))}
                      {template.features.length > 3 && (
                        <Text fontSize="xs" color="gray.500">
                          +{template.features.length - 3} more features
                        </Text>
                      )}
                    </VStack>
                  </Box>

                  <HStack justify="space-between" fontSize="sm" color="gray.600">
                    <HStack>
                      <FiDownload />
                      <Text>{template.downloads.toLocaleString()}</Text>
                    </HStack>
                    <Text>{template.estimatedTime}</Text>
                  </HStack>

                  <HStack wrap="wrap" spacing={1}>
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} size="sm" colorScheme="gray" variant="subtle">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge size="sm" colorScheme="gray" variant="outline">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </HStack>

                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      leftIcon={<FiEye />}
                      variant="outline"
                      onClick={() => handlePreview(template)}
                      flex="1"
                    >
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      leftIcon={<FiCode />}
                      colorScheme="teal"
                      onClick={() => handleTemplateSelect(template)}
                      flex="1"
                    >
                      Use Template
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {filteredTemplates.length === 0 && (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500">No templates match your criteria</Text>
            <Text color="gray.400" mt={2}>Try adjusting your search or filter settings</Text>
          </Box>
        )}
      </VStack>

      {/* Template Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text>{getFrameworkIcon(selectedTemplate?.framework || '')}</Text>
              <Text>{selectedTemplate?.name}</Text>
              <Badge colorScheme={getDifficultyColor(selectedTemplate?.difficulty || '')}>
                {selectedTemplate?.difficulty}
              </Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedTemplate && (
              <VStack spacing={4} align="stretch">
                <Text>{selectedTemplate.description}</Text>
                
                <Box>
                  <Heading size="sm" mb={2}>Features</Heading>
                  <SimpleGrid columns={2} spacing={2}>
                    {selectedTemplate.features.map((feature, index) => (
                      <Text key={index} fontSize="sm">• {feature}</Text>
                    ))}
                  </SimpleGrid>
                </Box>

                <HStack spacing={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Framework</Text>
                    <Text fontSize="sm" color="gray.600">{selectedTemplate.framework}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Estimated Time</Text>
                    <Text fontSize="sm" color="gray.600">{selectedTemplate.estimatedTime}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Downloads</Text>
                    <Text fontSize="sm" color="gray.600">{selectedTemplate.downloads.toLocaleString()}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium">Rating</Text>
                    <HStack>
                      <FiStar />
                      <Text fontSize="sm" color="gray.600">{selectedTemplate.rating}</Text>
                    </HStack>
                  </Box>
                </HStack>

                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Tags</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} colorScheme="gray" variant="subtle">
                        {tag}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onPreviewClose}>
              Close
            </Button>
            <Button 
              colorScheme="teal" 
              onClick={() => selectedTemplate && handleTemplateSelect(selectedTemplate)}
            >
              Use This Template
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default TemplateGallery;