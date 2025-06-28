import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Avatar,
  AvatarGroup,
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
  Switch,
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
  StatHelpText,
  List,
  ListItem,
  ListIcon,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  TagLabel,
  TagCloseButton
} from '@chakra-ui/react';
import {
  FiUsers,
  FiUserPlus,
  FiMessageSquare,
  FiVideo,
  FiShare2,
  FiSettings,
  FiClock,
  FiEdit,
  FiTrash2,
  FiMoreVertical,
  FiCheck,
  FiX,
  FiEye,
  FiLock,
  FiUnlock,
  FiGitBranch,
  FiActivity,
  FiBell,
  FiMail,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiCode,
  FiGitCommit
} from 'react-icons/fi';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canShare: boolean;
    canManageUsers: boolean;
  };
}

interface Comment {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  lineNumber?: number;
  fileName?: string;
  resolved: boolean;
  replies: Comment[];
}

interface Activity {
  id: string;
  userId: string;
  type: 'edit' | 'comment' | 'join' | 'leave' | 'share' | 'deploy';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface CollaborationHubProps {
  projectId: string;
  currentUserId: string;
  onClose: () => void;
}

const CollaborationHub: React.FC<CollaborationHubProps> = ({ 
  projectId, 
  currentUserId, 
  onClose 
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Collaborator['role']>('editor');
  const [newComment, setNewComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [selectedLine, setSelectedLine] = useState<number>(0);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'comments' | 'activity' | 'settings'>('overview');
  
  const toast = useToast();
  const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
  const { isOpen: isCommentOpen, onOpen: onCommentOpen, onClose: onCommentClose } = useDisclosure();

  useEffect(() => {
    initializeCollaboration();
  }, [projectId]);

  const initializeCollaboration = () => {
    // Mock data initialization
    const mockCollaborators: Collaborator[] = [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: 'https://bit.ly/sage-adebayo',
        role: 'owner',
        status: 'online',
        lastSeen: new Date(),
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: true,
          canManageUsers: true
        }
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        avatar: 'https://bit.ly/kent-c-dodds',
        role: 'editor',
        status: 'online',
        lastSeen: new Date(Date.now() - 300000),
        permissions: {
          canEdit: true,
          canComment: true,
          canShare: false,
          canManageUsers: false
        }
      },
      {
        id: 'user-3',
        name: 'Carol Davis',
        email: 'carol@example.com',
        avatar: 'https://bit.ly/prosper-baba',
        role: 'viewer',
        status: 'away',
        lastSeen: new Date(Date.now() - 1800000),
        permissions: {
          canEdit: false,
          canComment: true,
          canShare: false,
          canManageUsers: false
        }
      }
    ];

    const mockComments: Comment[] = [
      {
        id: 'comment-1',
        authorId: 'user-2',
        content: 'This function could be optimized for better performance',
        timestamp: new Date(Date.now() - 3600000),
        lineNumber: 45,
        fileName: 'App.tsx',
        resolved: false,
        replies: [
          {
            id: 'reply-1',
            authorId: 'user-1',
            content: 'Good point! I\'ll refactor this in the next iteration.',
            timestamp: new Date(Date.now() - 3000000),
            resolved: false,
            replies: []
          }
        ]
      },
      {
        id: 'comment-2',
        authorId: 'user-3',
        content: 'The UI looks great! Maybe we could add some loading states?',
        timestamp: new Date(Date.now() - 7200000),
        fileName: 'components/Dashboard.tsx',
        resolved: true,
        replies: []
      }
    ];

    const mockActivities: Activity[] = [
      {
        id: 'activity-1',
        userId: 'user-2',
        type: 'edit',
        description: 'Modified App.tsx - Added error handling',
        timestamp: new Date(Date.now() - 1800000),
        metadata: { file: 'App.tsx', linesChanged: 12 }
      },
      {
        id: 'activity-2',
        userId: 'user-3',
        type: 'comment',
        description: 'Added comment on Dashboard component',
        timestamp: new Date(Date.now() - 3600000),
        metadata: { file: 'components/Dashboard.tsx' }
      },
      {
        id: 'activity-3',
        userId: 'user-1',
        type: 'deploy',
        description: 'Deployed to staging environment',
        timestamp: new Date(Date.now() - 7200000),
        metadata: { environment: 'staging', version: '1.2.3' }
      }
    ];

    setCollaborators(mockCollaborators);
    setComments(mockComments);
    setActivities(mockActivities);
  };

  const inviteCollaborator = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter an email address',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Check if user is already invited
    if (collaborators.some(c => c.email === inviteEmail)) {
      toast({
        title: 'Already Invited',
        description: 'This user is already a collaborator',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newCollaborator: Collaborator = {
      id: `user-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'offline',
      lastSeen: new Date(),
      permissions: getPermissionsForRole(inviteRole)
    };

    setCollaborators(prev => [...prev, newCollaborator]);
    setInviteEmail('');
    onInviteClose();

    toast({
      title: 'Invitation Sent',
      description: `Invited ${inviteEmail} as ${inviteRole}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getPermissionsForRole = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner':
        return { canEdit: true, canComment: true, canShare: true, canManageUsers: true };
      case 'admin':
        return { canEdit: true, canComment: true, canShare: true, canManageUsers: true };
      case 'editor':
        return { canEdit: true, canComment: true, canShare: false, canManageUsers: false };
      case 'viewer':
        return { canEdit: false, canComment: true, canShare: false, canManageUsers: false };
      default:
        return { canEdit: false, canComment: false, canShare: false, canManageUsers: false };
    }
  };

  const addComment = () => {
    if (!newComment.trim()) {
      toast({
        title: 'Comment Required',
        description: 'Please enter a comment',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: currentUserId,
      content: newComment,
      timestamp: new Date(),
      lineNumber: selectedLine || undefined,
      fileName: selectedFile || undefined,
      resolved: false,
      replies: []
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    onCommentClose();

    // Add activity
    const activity: Activity = {
      id: `activity-${Date.now()}`,
      userId: currentUserId,
      type: 'comment',
      description: `Added comment${selectedFile ? ` on ${selectedFile}` : ''}`,
      timestamp: new Date(),
      metadata: { file: selectedFile, line: selectedLine }
    };

    setActivities(prev => [activity, ...prev]);

    toast({
      title: 'Comment Added',
      description: 'Your comment has been posted',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, resolved: true }
        : comment
    ));

    toast({
      title: 'Comment Resolved',
      description: 'Comment has been marked as resolved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const removeCollaborator = (collaboratorId: string) => {
    setCollaborators(prev => prev.filter(c => c.id !== collaboratorId));
    
    toast({
      title: 'Collaborator Removed',
      description: 'User has been removed from the project',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const updateCollaboratorRole = (collaboratorId: string, newRole: Collaborator['role']) => {
    setCollaborators(prev => prev.map(c => 
      c.id === collaboratorId 
        ? { ...c, role: newRole, permissions: getPermissionsForRole(newRole) }
        : c
    ));

    toast({
      title: 'Role Updated',
      description: 'Collaborator role has been updated',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'online': return 'green';
      case 'away': return 'yellow';
      case 'offline': return 'gray';
      default: return 'gray';
    }
  };

  const getRoleColor = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return 'purple';
      case 'admin': return 'red';
      case 'editor': return 'blue';
      case 'viewer': return 'gray';
      default: return 'gray';
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'edit': return FiEdit;
      case 'comment': return FiMessageSquare;
      case 'join': return FiUserPlus;
      case 'leave': return FiX;
      case 'share': return FiShare2;
      case 'deploy': return FiGitCommit;
      default: return FiActivity;
    }
  };

  const currentUser = collaborators.find(c => c.id === currentUserId);
  const onlineUsers = collaborators.filter(c => c.status === 'online');
  const unresolvedComments = comments.filter(c => !c.resolved);

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Collaboration Hub</Heading>
            <Text color="gray.600">Manage team collaboration and communication</Text>
          </VStack>
          <HStack spacing={4}>
            <HStack spacing={2}>
              <AvatarGroup size="sm" max={4}>
                {onlineUsers.map(user => (
                  <Avatar key={user.id} name={user.name} src={user.avatar} />
                ))}
              </AvatarGroup>
              <Text fontSize="sm" color="gray.600">
                {onlineUsers.length} online
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Button size="sm" leftIcon={<FiUserPlus />} onClick={onInviteOpen}>
                Invite
              </Button>
              <Button size="sm" leftIcon={<FiMessageSquare />} onClick={onCommentOpen}>
                Comment
              </Button>
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      <Flex flex="1">
        {/* Sidebar Navigation */}
        <Box width="200px" bg="gray.50" borderRight="1px" borderColor="gray.200" p={4}>
          <VStack spacing={2} align="stretch">
            <Button
              variant={viewMode === 'overview' ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              leftIcon={<FiUsers />}
              onClick={() => setViewMode('overview')}
              size="sm"
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'comments' ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              leftIcon={<FiMessageSquare />}
              onClick={() => setViewMode('comments')}
              size="sm"
            >
              Comments
              {unresolvedComments.length > 0 && (
                <Badge ml={2} colorScheme="red" size="sm">
                  {unresolvedComments.length}
                </Badge>
              )}
            </Button>
            <Button
              variant={viewMode === 'activity' ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              leftIcon={<FiActivity />}
              onClick={() => setViewMode('activity')}
              size="sm"
            >
              Activity
            </Button>
            <Button
              variant={viewMode === 'settings' ? 'solid' : 'ghost'}
              justifyContent="flex-start"
              leftIcon={<FiSettings />}
              onClick={() => setViewMode('settings')}
              size="sm"
            >
              Settings
            </Button>
          </VStack>
        </Box>

        {/* Main Content */}
        <Box flex="1" p={6} overflow="auto">
          {viewMode === 'overview' && (
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Stat>
                  <StatLabel>Total Collaborators</StatLabel>
                  <StatNumber>{collaborators.length}</StatNumber>
                  <StatHelpText>
                    {onlineUsers.length} currently online
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Active Comments</StatLabel>
                  <StatNumber>{unresolvedComments.length}</StatNumber>
                  <StatHelpText>
                    {comments.length - unresolvedComments.length} resolved
                  </StatHelpText>
                </Stat>
                <Stat>
                  <StatLabel>Recent Activity</StatLabel>
                  <StatNumber>{activities.length}</StatNumber>
                  <StatHelpText>
                    Last 24 hours
                  </StatHelpText>
                </Stat>
              </SimpleGrid>

              <Box>
                <Heading size="md" mb={4}>Team Members</Heading>
                <VStack spacing={3} align="stretch">
                  {collaborators.map(collaborator => (
                    <Box
                      key={collaborator.id}
                      p={4}
                      bg="white"
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Box position="relative">
                            <Avatar size="md" name={collaborator.name} src={collaborator.avatar} />
                            <Box
                              position="absolute"
                              bottom="0"
                              right="0"
                              width="12px"
                              height="12px"
                              bg={`${getStatusColor(collaborator.status)}.500`}
                              borderRadius="full"
                              border="2px solid white"
                            />
                          </Box>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{collaborator.name}</Text>
                            <Text fontSize="sm" color="gray.600">{collaborator.email}</Text>
                            <HStack spacing={2}>
                              <Badge colorScheme={getRoleColor(collaborator.role)} size="sm">
                                {collaborator.role}
                              </Badge>
                              <Badge colorScheme={getStatusColor(collaborator.status)} size="sm">
                                {collaborator.status}
                              </Badge>
                            </HStack>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={1}>
                          <Text fontSize="xs" color="gray.500">
                            Last seen: {collaborator.lastSeen.toLocaleString()}
                          </Text>
                          {currentUser?.permissions.canManageUsers && collaborator.id !== currentUserId && (
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="User options"
                                icon={<FiMoreVertical />}
                                size="sm"
                                variant="ghost"
                              />
                              <MenuList>
                                <MenuItem onClick={() => updateCollaboratorRole(collaborator.id, 'admin')}>
                                  Make Admin
                                </MenuItem>
                                <MenuItem onClick={() => updateCollaboratorRole(collaborator.id, 'editor')}>
                                  Make Editor
                                </MenuItem>
                                <MenuItem onClick={() => updateCollaboratorRole(collaborator.id, 'viewer')}>
                                  Make Viewer
                                </MenuItem>
                                <MenuItem 
                                  color="red.500"
                                  onClick={() => removeCollaborator(collaborator.id)}
                                >
                                  Remove User
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={4}>Recent Activity</Heading>
                <VStack spacing={2} align="stretch">
                  {activities.slice(0, 5).map(activity => {
                    const user = collaborators.find(c => c.id === activity.userId);
                    const IconComponent = getActivityIcon(activity.type);
                    
                    return (
                      <HStack key={activity.id} spacing={3} p={3} bg="gray.50" borderRadius="md">
                        <IconComponent size={16} />
                        <VStack align="start" spacing={0} flex="1">
                          <Text fontSize="sm">
                            <strong>{user?.name}</strong> {activity.description}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {activity.timestamp.toLocaleString()}
                          </Text>
                        </VStack>
                      </HStack>
                    );
                  })}
                </VStack>
              </Box>
            </VStack>
          )}

          {viewMode === 'comments' && (
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Comments & Discussions</Heading>
                <Button size="sm" leftIcon={<FiMessageSquare />} onClick={onCommentOpen}>
                  Add Comment
                </Button>
              </HStack>

              <HStack spacing={4}>
                <Select placeholder="Filter by file" size="sm" maxW="200px">
                  <option value="App.tsx">App.tsx</option>
                  <option value="components/Dashboard.tsx">Dashboard.tsx</option>
                  <option value="utils/helpers.ts">helpers.ts</option>
                </Select>
                <Select placeholder="Filter by status" size="sm" maxW="150px">
                  <option value="unresolved">Unresolved</option>
                  <option value="resolved">Resolved</option>
                </Select>
              </HStack>

              <VStack spacing={4} align="stretch">
                {comments.map(comment => {
                  const author = collaborators.find(c => c.id === comment.authorId);
                  
                  return (
                    <Box
                      key={comment.id}
                      p={4}
                      bg="white"
                      border="1px"
                      borderColor={comment.resolved ? 'green.200' : 'gray.200'}
                      borderRadius="md"
                    >
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={3}>
                          <Avatar size="sm" name={author?.name} src={author?.avatar} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium" fontSize="sm">{author?.name}</Text>
                            <Text fontSize="xs" color="gray.500">
                              {comment.timestamp.toLocaleString()}
                            </Text>
                          </VStack>
                          {comment.fileName && (
                            <Badge size="sm" colorScheme="blue">
                              {comment.fileName}
                              {comment.lineNumber && `:${comment.lineNumber}`}
                            </Badge>
                          )}
                          {comment.resolved && (
                            <Badge size="sm" colorScheme="green">
                              Resolved
                            </Badge>
                          )}
                        </HStack>
                        {!comment.resolved && (
                          <IconButton
                            aria-label="Resolve comment"
                            icon={<FiCheck />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => resolveComment(comment.id)}
                          />
                        )}
                      </HStack>
                      
                      <Text mb={3}>{comment.content}</Text>
                      
                      {comment.replies.length > 0 && (
                        <VStack spacing={2} align="stretch" pl={4} borderLeft="2px" borderColor="gray.200">
                          {comment.replies.map(reply => {
                            const replyAuthor = collaborators.find(c => c.id === reply.authorId);
                            return (
                              <HStack key={reply.id} spacing={3}>
                                <Avatar size="xs" name={replyAuthor?.name} src={replyAuthor?.avatar} />
                                <VStack align="start" spacing={0} flex="1">
                                  <HStack>
                                    <Text fontWeight="medium" fontSize="sm">{replyAuthor?.name}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {reply.timestamp.toLocaleString()}
                                    </Text>
                                  </HStack>
                                  <Text fontSize="sm">{reply.content}</Text>
                                </VStack>
                              </HStack>
                            );
                          })}
                        </VStack>
                      )}
                    </Box>
                  );
                })}
              </VStack>
            </VStack>
          )}

          {viewMode === 'activity' && (
            <VStack spacing={4} align="stretch">
              <Heading size="md">Project Activity</Heading>
              
              <VStack spacing={3} align="stretch">
                {activities.map(activity => {
                  const user = collaborators.find(c => c.id === activity.userId);
                  const IconComponent = getActivityIcon(activity.type);
                  
                  return (
                    <Box
                      key={activity.id}
                      p={4}
                      bg="white"
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                    >
                      <HStack spacing={3}>
                        <Box
                          p={2}
                          bg="gray.100"
                          borderRadius="md"
                        >
                          <IconComponent size={16} />
                        </Box>
                        <VStack align="start" spacing={1} flex="1">
                          <Text>
                            <strong>{user?.name}</strong> {activity.description}
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {activity.timestamp.toLocaleString()}
                          </Text>
                          {activity.metadata && (
                            <HStack spacing={2}>
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <Badge key={key} size="sm" variant="outline">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </HStack>
                          )}
                        </VStack>
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </VStack>
          )}

          {viewMode === 'settings' && (
            <VStack spacing={6} align="stretch">
              <Heading size="md">Collaboration Settings</Heading>
              
              <Box p={4} bg="white" border="1px" borderColor="gray.200" borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Real-time Collaboration</Heading>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Enable Real-time Sync</Text>
                      <Text fontSize="sm" color="gray.600">
                        Sync changes across all collaborators in real-time
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={isRealTimeEnabled}
                      onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Notifications</Text>
                      <Text fontSize="sm" color="gray.600">
                        Receive notifications for comments and mentions
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </Box>

              <Box p={4} bg="white" border="1px" borderColor="gray.200" borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Project Permissions</Heading>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text>Allow public viewing</Text>
                      <Switch colorScheme="teal" />
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Require approval for new members</Text>
                      <Switch colorScheme="teal" />
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Allow external sharing</Text>
                      <Switch colorScheme="teal" />
                    </HStack>
                  </VStack>
                </VStack>
              </Box>

              <Box p={4} bg="white" border="1px" borderColor="gray.200" borderRadius="md">
                <VStack spacing={4} align="stretch">
                  <Heading size="sm">Communication Preferences</Heading>
                  
                  <FormControl>
                    <FormLabel>Default notification method</FormLabel>
                    <Select defaultValue="email">
                      <option value="email">Email</option>
                      <option value="in-app">In-app only</option>
                      <option value="both">Both email and in-app</option>
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Comment resolution timeout</FormLabel>
                    <Select defaultValue="7">
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">1 week</option>
                      <option value="30">1 month</option>
                    </Select>
                  </FormControl>
                </VStack>
              </Box>
            </VStack>
          )}
        </Box>
      </Flex>

      {/* Invite Modal */}
      <Modal isOpen={isInviteOpen} onClose={onInviteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Collaborator</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Collaborator['role'])}
                >
                  <option value="viewer">Viewer - Can view and comment</option>
                  <option value="editor">Editor - Can edit and comment</option>
                  <option value="admin">Admin - Full access except ownership</option>
                </Select>
              </FormControl>
              
              <Alert status="info">
                <AlertIcon />
                <AlertDescription>
                  The invited user will receive an email with instructions to join the project.
                </AlertDescription>
              </Alert>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onInviteClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={inviteCollaborator}>
              Send Invitation
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Comment Modal */}
      <Modal isOpen={isCommentOpen} onClose={onCommentClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Comment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>File (optional)</FormLabel>
                <Select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  placeholder="Select a file"
                >
                  <option value="App.tsx">App.tsx</option>
                  <option value="components/Dashboard.tsx">Dashboard.tsx</option>
                  <option value="utils/helpers.ts">helpers.ts</option>
                </Select>
              </FormControl>
              
              {selectedFile && (
                <FormControl>
                  <FormLabel>Line Number (optional)</FormLabel>
                  <Input
                    type="number"
                    value={selectedLine}
                    onChange={(e) => setSelectedLine(parseInt(e.target.value) || 0)}
                    placeholder="Enter line number"
                  />
                </FormControl>
              )}
              
              <FormControl isRequired>
                <FormLabel>Comment</FormLabel>
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your comment..."
                  rows={4}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCommentClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={addComment}>
              Add Comment
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CollaborationHub;