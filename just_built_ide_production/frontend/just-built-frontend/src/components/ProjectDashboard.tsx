import React, { useState, useEffect } from 'react';
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
  Progress,
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
  Input,
  Textarea,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider
} from '@chakra-ui/react';
import { FiPlus, FiFolder, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';

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

interface ProjectDashboardProps {
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ onProjectSelect, onNewProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'web-app'
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    // Simulate loading projects
    setTimeout(() => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React and Node.js',
          type: 'web-app',
          status: 'active',
          progress: 75,
          lastModified: new Date(Date.now() - 3600000),
          collaborators: 3,
          linesOfCode: 15420
        },
        {
          id: '2',
          name: 'Mobile Task Manager',
          description: 'React Native app for task management',
          type: 'mobile-app',
          status: 'completed',
          progress: 100,
          lastModified: new Date(Date.now() - 86400000),
          collaborators: 2,
          linesOfCode: 8930
        },
        {
          id: '3',
          name: 'API Gateway Service',
          description: 'Microservices API gateway with authentication',
          type: 'api',
          status: 'paused',
          progress: 45,
          lastModified: new Date(Date.now() - 172800000),
          collaborators: 1,
          linesOfCode: 5670
        }
      ];
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateProject = () => {
    if (!newProject.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a project name',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      type: newProject.type,
      status: 'active',
      progress: 0,
      lastModified: new Date(),
      collaborators: 1,
      linesOfCode: 0
    };

    setProjects(prev => [project, ...prev]);
    setNewProject({ name: '', description: '', type: 'web-app' });
    onClose();
    
    toast({
      title: 'Project created',
      description: `${project.name} has been created successfully`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    onProjectSelect(project);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'completed': return 'blue';
      case 'paused': return 'orange';
      default: return 'gray';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web-app': return '🌐';
      case 'mobile-app': return '📱';
      case 'api': return '🔌';
      case 'desktop-app': return '💻';
      default: return '📁';
    }
  };

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg" mb={4}>Loading Projects...</Heading>
        <Progress size="lg" isIndeterminate colorScheme="teal" />
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="xl">Project Dashboard</Heading>
            <Text color="gray.600">Manage your AI-generated projects</Text>
          </VStack>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="teal"
            onClick={onOpen}
            size="lg"
          >
            New Project
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Stat>
            <StatLabel>Total Projects</StatLabel>
            <StatNumber>{projects.length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Active Projects</StatLabel>
            <StatNumber>{projects.filter(p => p.status === 'active').length}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              9.05%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Total Lines of Code</StatLabel>
            <StatNumber>{projects.reduce((sum, p) => sum + p.linesOfCode, 0).toLocaleString()}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              12.45%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Collaborators</StatLabel>
            <StatNumber>{projects.reduce((sum, p) => sum + p.collaborators, 0)}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              5.67%
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {projects.map((project) => (
              <Card
                key={project.id}
                cursor="pointer"
                onClick={() => onProjectSelect(project)}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
              >
                <CardHeader pb={2}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex="1">
                      <HStack>
                        <Text fontSize="lg">{getTypeIcon(project.type)}</Text>
                        <Heading size="md" noOfLines={1}>{project.name}</Heading>
                      </HStack>
                      <Badge colorScheme={getStatusColor(project.status)} size="sm">
                        {project.status.toUpperCase()}
                      </Badge>
                    </VStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {project.description}
                    </Text>
                    
                    <Box>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="sm" fontWeight="medium">Progress</Text>
                        <Text fontSize="sm" color="gray.600">{project.progress}%</Text>
                      </HStack>
                      <Progress value={project.progress} colorScheme="teal" size="sm" />
                    </Box>

                    <HStack justify="space-between" fontSize="sm" color="gray.600">
                      <HStack>
                        <FiClock />
                        <Text>{project.lastModified.toLocaleDateString()}</Text>
                      </HStack>
                      <HStack>
                        <FiUsers />
                        <Text>{project.collaborators}</Text>
                      </HStack>
                    </HStack>

                    <HStack justify="space-between" fontSize="sm" color="gray.600">
                      <HStack>
                        <FiTrendingUp />
                        <Text>{project.linesOfCode.toLocaleString()} lines</Text>
                      </HStack>
                      <Badge variant="outline" colorScheme="gray">
                        {project.type}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={12}>
            <FiFolder size={48} color="gray" />
            <Heading size="md" mt={4} color="gray.600">No projects yet</Heading>
            <Text color="gray.500" mt={2}>Create your first AI-generated project to get started</Text>
            <Button mt={4} colorScheme="teal" onClick={onOpen}>
              Create Project
            </Button>
          </Box>
        )}
      </VStack>

      {/* New Project Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Project Name</FormLabel>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what you want to build..."
                  rows={4}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Project Type</FormLabel>
                <Select
                  value={newProject.type}
                  onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="web-app">Web Application</option>
                  <option value="mobile-app">Mobile Application</option>
                  <option value="desktop-app">Desktop Application</option>
                  <option value="api">API Service</option>
                  <option value="library">Library/Package</option>
                  <option value="game">Game</option>
                  <option value="other">Other</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleCreateProject}>
              Create Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProjectDashboard;