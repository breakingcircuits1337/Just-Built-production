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
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure as useAlertDisclosure
} from '@chakra-ui/react';
import { FiPlus, FiFolder, FiClock, FiUsers, FiTrendingUp, FiMoreVertical, FiEdit, FiTrash2, FiCopy, FiDownload } from 'react-icons/fi';

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
  tags?: string[];
  framework?: string;
}

interface ProjectDashboardProps {
  onProjectSelect: (project: Project) => void;
  onNewProject: () => void;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ onProjectSelect, onNewProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    type: 'web-app',
    framework: 'react'
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useAlertDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    // Simulate loading projects with more realistic data
    setTimeout(() => {
      const mockProjects: Project[] = [
        {
          id: '1',
          name: 'E-commerce Platform',
          description: 'Full-stack e-commerce solution with React and Node.js, featuring user authentication, payment processing, and inventory management',
          type: 'web-app',
          framework: 'react',
          status: 'active',
          progress: 75,
          lastModified: new Date(Date.now() - 3600000),
          collaborators: 3,
          linesOfCode: 15420,
          tags: ['e-commerce', 'react', 'node.js', 'stripe']
        },
        {
          id: '2',
          name: 'Mobile Task Manager',
          description: 'React Native app for task management with offline sync and team collaboration features',
          type: 'mobile-app',
          framework: 'react-native',
          status: 'completed',
          progress: 100,
          lastModified: new Date(Date.now() - 86400000),
          collaborators: 2,
          linesOfCode: 8930,
          tags: ['mobile', 'react-native', 'productivity']
        },
        {
          id: '3',
          name: 'API Gateway Service',
          description: 'Microservices API gateway with authentication, rate limiting, and monitoring',
          type: 'api',
          framework: 'express',
          status: 'paused',
          progress: 45,
          lastModified: new Date(Date.now() - 172800000),
          collaborators: 1,
          linesOfCode: 5670,
          tags: ['api', 'microservices', 'express', 'auth']
        },
        {
          id: '4',
          name: 'Data Analytics Dashboard',
          description: 'Real-time analytics dashboard with interactive charts and data visualization',
          type: 'web-app',
          framework: 'vue',
          status: 'active',
          progress: 60,
          lastModified: new Date(Date.now() - 7200000),
          collaborators: 4,
          linesOfCode: 12340,
          tags: ['analytics', 'vue', 'charts', 'dashboard']
        },
        {
          id: '5',
          name: 'Chat Application',
          description: 'Real-time chat application with WebSocket support and file sharing',
          type: 'web-app',
          framework: 'react',
          status: 'active',
          progress: 30,
          lastModified: new Date(Date.now() - 14400000),
          collaborators: 2,
          linesOfCode: 6780,
          tags: ['chat', 'websocket', 'real-time']
        }
      ];
      setProjects(mockProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    const matchesType = filterType === 'all' || project.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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
      framework: newProject.framework,
      status: 'active',
      progress: 0,
      lastModified: new Date(),
      collaborators: 1,
      linesOfCode: 0,
      tags: [newProject.framework, newProject.type]
    };

    setProjects(prev => [project, ...prev]);
    setNewProject({ name: '', description: '', type: 'web-app', framework: 'react' });
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

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setNewProject({
      name: project.name,
      description: project.description,
      type: project.type,
      framework: project.framework || 'react'
    });
    onEditOpen();
  };

  const handleUpdateProject = () => {
    if (!selectedProject || !newProject.name.trim()) {
      toast({
        title: 'Invalid data',
        description: 'Please provide valid project information',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id 
        ? { 
            ...p, 
            name: newProject.name,
            description: newProject.description,
            type: newProject.type,
            framework: newProject.framework,
            lastModified: new Date()
          }
        : p
    ));

    onEditClose();
    setSelectedProject(null);
    setNewProject({ name: '', description: '', type: 'web-app', framework: 'react' });
    
    toast({
      title: 'Project updated',
      description: 'Project has been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDeleteProject = () => {
    if (!selectedProject) return;

    setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
    onDeleteClose();
    setSelectedProject(null);
    
    toast({
      title: 'Project deleted',
      description: 'Project has been deleted successfully',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDuplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: Date.now().toString(),
      name: `${project.name} (Copy)`,
      progress: 0,
      lastModified: new Date(),
      collaborators: 1
    };

    setProjects(prev => [duplicatedProject, ...prev]);
    
    toast({
      title: 'Project duplicated',
      description: `${duplicatedProject.name} has been created`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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
      case 'library': return '📚';
      case 'game': return '🎮';
      default: return '📁';
    }
  };

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    const completedProjects = projects.filter(p => p.status === 'completed').length;
    const totalLinesOfCode = projects.reduce((sum, p) => sum + p.linesOfCode, 0);
    const totalCollaborators = projects.reduce((sum, p) => sum + p.collaborators, 0);
    
    return { totalProjects, activeProjects, completedProjects, totalLinesOfCode, totalCollaborators };
  };

  const stats = getProjectStats();

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Heading size="lg" mb={4}>Loading Projects...</Heading>
        <Progress size="lg" isIndeterminate colorScheme="teal" />
      </Box>
    );
  }

  return (
    <Box p={6} maxW="1400px" mx="auto">
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
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Stat>
            <StatLabel>Total Projects</StatLabel>
            <StatNumber>{stats.totalProjects}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Active</StatLabel>
            <StatNumber>{stats.activeProjects}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              9.05%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Completed</StatLabel>
            <StatNumber>{stats.completedProjects}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              15.23%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Lines of Code</StatLabel>
            <StatNumber>{stats.totalLinesOfCode.toLocaleString()}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              12.45%
            </StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Collaborators</StatLabel>
            <StatNumber>{stats.totalCollaborators}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              5.67%
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Divider />

        {/* Filters */}
        <HStack spacing={4} wrap="wrap">
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </Select>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Types</option>
            <option value="web-app">Web App</option>
            <option value="mobile-app">Mobile App</option>
            <option value="api">API</option>
            <option value="desktop-app">Desktop App</option>
            <option value="library">Library</option>
            <option value="game">Game</option>
          </Select>
        </HStack>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                cursor="pointer"
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                transition="all 0.2s"
                position="relative"
              >
                <CardHeader pb={2}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex="1" onClick={() => onProjectSelect(project)}>
                      <HStack>
                        <Text fontSize="lg">{getTypeIcon(project.type)}</Text>
                        <Heading size="md" noOfLines={1}>{project.name}</Heading>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge colorScheme={getStatusColor(project.status)} size="sm">
                          {project.status.toUpperCase()}
                        </Badge>
                        {project.framework && (
                          <Badge colorScheme="purple" size="sm">
                            {project.framework}
                          </Badge>
                        )}
                      </HStack>
                    </VStack>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        aria-label="Project options"
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem icon={<FiEdit />} onClick={() => handleEditProject(project)}>
                          Edit Project
                        </MenuItem>
                        <MenuItem icon={<FiCopy />} onClick={() => handleDuplicateProject(project)}>
                          Duplicate
                        </MenuItem>
                        <MenuItem icon={<FiDownload />}>
                          Export
                        </MenuItem>
                        <MenuItem 
                          icon={<FiTrash2 />} 
                          color="red.500"
                          onClick={() => {
                            setSelectedProject(project);
                            onDeleteOpen();
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </HStack>
                </CardHeader>
                <CardBody pt={0} onClick={() => onProjectSelect(project)}>
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

                    {project.tags && project.tags.length > 0 && (
                      <HStack wrap="wrap" spacing={1}>
                        {project.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} size="sm" colorScheme="gray" variant="subtle">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge size="sm" colorScheme="gray" variant="outline">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : (
          <Box textAlign="center" py={12}>
            <FiFolder size={48} color="gray" />
            <Heading size="md" mt={4} color="gray.600">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all' 
                ? 'No projects match your filters' 
                : 'No projects yet'}
            </Heading>
            <Text color="gray.500" mt={2}>
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first AI-generated project to get started'}
            </Text>
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
              
              <HStack spacing={4} width="100%">
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

                <FormControl>
                  <FormLabel>Framework</FormLabel>
                  <Select
                    value={newProject.framework}
                    onChange={(e) => setNewProject(prev => ({ ...prev, framework: e.target.value }))}
                  >
                    <option value="react">React</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                    <option value="svelte">Svelte</option>
                    <option value="express">Express.js</option>
                    <option value="fastapi">FastAPI</option>
                    <option value="django">Django</option>
                    <option value="flask">Flask</option>
                    <option value="react-native">React Native</option>
                    <option value="flutter">Flutter</option>
                    <option value="electron">Electron</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </HStack>
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

      {/* Edit Project Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Project</ModalHeader>
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
              
              <HStack spacing={4} width="100%">
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

                <FormControl>
                  <FormLabel>Framework</FormLabel>
                  <Select
                    value={newProject.framework}
                    onChange={(e) => setNewProject(prev => ({ ...prev, framework: e.target.value }))}
                  >
                    <option value="react">React</option>
                    <option value="vue">Vue.js</option>
                    <option value="angular">Angular</option>
                    <option value="svelte">Svelte</option>
                    <option value="express">Express.js</option>
                    <option value="fastapi">FastAPI</option>
                    <option value="django">Django</option>
                    <option value="flask">Flask</option>
                    <option value="react-native">React Native</option>
                    <option value="flutter">Flutter</option>
                    <option value="electron">Electron</option>
                    <option value="other">Other</option>
                  </Select>
                </FormControl>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleUpdateProject}>
              Update Project
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteProject} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ProjectDashboard;