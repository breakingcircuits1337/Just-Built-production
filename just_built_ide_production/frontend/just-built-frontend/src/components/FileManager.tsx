import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Button, 
  Text, 
  Icon, 
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  InputGroup,
  InputRightElement,
  useToast,
  Progress,
  Badge,
  Tooltip,
  IconButton,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { FiFolder, FiFile, FiUpload, FiDownload, FiGithub, FiPlus, FiChevronRight, FiChevronDown, FiTrash2, FiCopy, FiEdit3 } from 'react-icons/fi';
import { filesApi, githubApi } from '../services/api';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  children?: FileItem[];
  lastModified?: Date;
}

interface FileManagerProps {
  onFileSelect: (file: FileItem) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isGithubOpen, onOpen: onGithubOpen, onClose: onGithubClose } = useDisclosure();
  const { isOpen: isNewFileOpen, onOpen: onNewFileOpen, onClose: onNewFileClose } = useDisclosure();
  
  const [githubRepo, setGithubRepo] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'file' | 'directory'>('file');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  const toast = useToast();

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await filesApi.listFiles();
        setFiles(response.data);
      } catch (error) {
        console.error('Failed to fetch files:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project files',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchFiles();
  }, [toast]);

  const toggleFolder = (path: string) => {
    const newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(path)) {
      newExpandedFolders.delete(path);
    } else {
      newExpandedFolders.add(path);
    }
    setExpandedFolders(newExpandedFolders);
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'file') {
      setSelectedFile(file);
      onFileSelect(file);
    } else {
      toggleFolder(file.path);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: 'No files selected',
        description: 'Please select files to upload',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadPromises = Array.from(selectedFiles).map(async (file) => {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          content: await file.text()
        };
        return filesApi.saveFile(fileData);
      });

      await Promise.all(uploadPromises);
      
      setUploadProgress(100);
      
      toast({
        title: 'Upload successful',
        description: `${selectedFiles.length} file(s) uploaded successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Refresh file list
      const response = await filesApi.listFiles();
      setFiles(response.data);
      
      onUploadClose();
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload files. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFiles(null);
    }
  };

  const handleGithubConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepo.trim()) {
      toast({
        title: 'Repository required',
        description: 'Please enter a repository URL',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await githubApi.connectRepo(githubRepo);
      toast({
        title: 'GitHub Connected',
        description: `Successfully connected to repository: ${githubRepo}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onGithubClose();
      setGithubRepo('');
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Failed to connect to GitHub repository',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNewFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter a file/folder name',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const newItem: FileItem = {
        name: newFileName,
        type: newFileType,
        path: `/${newFileName}`,
        size: newFileType === 'file' ? 0 : undefined,
        lastModified: new Date()
      };

      if (newFileType === 'file') {
        await filesApi.saveFile({
          name: newFileName,
          content: '',
          path: `/${newFileName}`
        });
      }

      // Add to local state
      setFiles(prev => [...prev, newItem]);
      
      toast({
        title: `${newFileType === 'file' ? 'File' : 'Folder'} created`,
        description: `${newFileName} has been created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      onNewFileClose();
      setNewFileName('');
    } catch (error) {
      toast({
        title: 'Creation failed',
        description: `Failed to create ${newFileType}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteFile = async (file: FileItem) => {
    try {
      // In a real implementation, this would call an API to delete the file
      setFiles(prev => prev.filter(f => f.path !== file.path));
      
      toast({
        title: 'File deleted',
        description: `${file.name} has been deleted`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Failed to delete file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') {
      return expandedFolders.has(file.path) ? FiChevronDown : FiChevronRight;
    }
    return FiFile;
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <Box key={item.path} ml={level * 4}>
        <Flex
          p={2} 
          _hover={{ bg: 'gray.100' }} 
          borderRadius="md"
          bg={selectedFile?.path === item.path ? 'blue.50' : 'transparent'}
          cursor="pointer"
          onClick={() => handleFileClick(item)}
          align="center"
        >
          <HStack flex="1" spacing={2}>
            <Icon 
              as={getFileIcon(item)}
              color={item.type === 'directory' ? 'blue.500' : 'gray.500'} 
            />
            <Text fontSize="sm">{item.name}</Text>
            {item.size && (
              <Badge size="sm" colorScheme="gray">
                {formatFileSize(item.size)}
              </Badge>
            )}
          </HStack>
          
          <HStack spacing={1} opacity={0} _groupHover={{ opacity: 1 }}>
            <Tooltip label="Copy path">
              <IconButton
                aria-label="Copy path"
                icon={<FiCopy />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(item.path);
                  toast({
                    title: 'Path copied',
                    status: 'success',
                    duration: 1000,
                  });
                }}
              />
            </Tooltip>
            <Tooltip label="Rename">
              <IconButton
                aria-label="Rename"
                icon={<FiEdit3 />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  // Implement rename functionality
                }}
              />
            </Tooltip>
            <Tooltip label="Delete">
              <IconButton
                aria-label="Delete"
                icon={<FiTrash2 />}
                size="xs"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFile(item);
                }}
              />
            </Tooltip>
          </HStack>
        </Flex>
        
        {item.type === 'directory' && 
         expandedFolders.has(item.path) && 
         item.children && 
         renderFileTree(item.children, level + 1)}
      </Box>
    ));
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" width="100%" height="100%">
      <VStack spacing={4} align="stretch" height="100%">
        <Flex justify="space-between" align="center">
          <Heading size="md">Project Files</Heading>
          <HStack>
            <Button size="sm" leftIcon={<FiPlus />} onClick={onNewFileOpen}>
              New
            </Button>
            <Button size="sm" leftIcon={<FiUpload />} onClick={onUploadOpen}>
              Upload
            </Button>
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<FiGithub />}>
                GitHub
              </MenuButton>
              <MenuList>
                <MenuItem onClick={onGithubOpen}>Connect Repository</MenuItem>
                <MenuItem>Clone Repository</MenuItem>
                <MenuItem>Push Changes</MenuItem>
                <MenuItem>Pull Changes</MenuItem>
                <MenuItem>View History</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
        
        <Box overflowY="auto" flex="1" className="group">
          {files.length > 0 ? (
            renderFileTree(files)
          ) : (
            <Box textAlign="center" py={8} color="gray.500">
              <Text>No files in project</Text>
              <Text fontSize="sm">Upload files or create new ones to get started</Text>
            </Box>
          )}
        </Box>
        
        {selectedFile && (
          <Box p={3} bg="gray.50" borderRadius="md">
            <Text fontSize="sm" fontWeight="medium">Selected: {selectedFile.name}</Text>
            <Text fontSize="xs" color="gray.600">{selectedFile.path}</Text>
            {selectedFile.size && (
              <Text fontSize="xs" color="gray.600">Size: {formatFileSize(selectedFile.size)}</Text>
            )}
          </Box>
        )}
        
        <HStack justify="space-between">
          <Button size="sm" leftIcon={<FiDownload />}>
            Download Project
          </Button>
          <Text fontSize="xs" color="gray.500">
            {files.length} item(s)
          </Text>
        </HStack>
      </VStack>
      
      {/* Upload Modal */}
      <Modal isOpen={isUploadOpen} onClose={onUploadClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload Files</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleUpload}>
            <ModalBody>
              <FormControl>
                <FormLabel>Select Files</FormLabel>
                <Input 
                  type="file" 
                  multiple 
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  accept="*/*"
                />
                {selectedFiles && (
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    {selectedFiles.length} file(s) selected
                  </Text>
                )}
              </FormControl>
              
              {isUploading && (
                <Box mt={4}>
                  <Text fontSize="sm" mb={2}>Uploading...</Text>
                  <Progress value={uploadProgress} colorScheme="blue" />
                </Box>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onUploadClose} disabled={isUploading}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit" disabled={isUploading || !selectedFiles}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* GitHub Modal */}
      <Modal isOpen={isGithubOpen} onClose={onGithubClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect to GitHub</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleGithubConnect}>
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Repository URL</FormLabel>
                <InputGroup>
                  <Input 
                    placeholder="username/repository or full URL" 
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                  <InputRightElement>
                    <Icon as={FiGithub} color="gray.500" />
                  </InputRightElement>
                </InputGroup>
                <Text fontSize="sm" color="gray.600" mt={2}>
                  Enter a GitHub repository URL or username/repository format
                </Text>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onGithubClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Connect
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
      
      {/* New File Modal */}
      <Modal isOpen={isNewFileOpen} onClose={onNewFileClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New {newFileType === 'file' ? 'File' : 'Folder'}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleNewFile}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <HStack>
                    <Button
                      size="sm"
                      variant={newFileType === 'file' ? 'solid' : 'outline'}
                      onClick={() => setNewFileType('file')}
                    >
                      File
                    </Button>
                    <Button
                      size="sm"
                      variant={newFileType === 'directory' ? 'solid' : 'outline'}
                      onClick={() => setNewFileType('directory')}
                    >
                      Folder
                    </Button>
                  </HStack>
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input 
                    placeholder={`Enter ${newFileType} name`}
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onNewFileClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Create
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FileManager;