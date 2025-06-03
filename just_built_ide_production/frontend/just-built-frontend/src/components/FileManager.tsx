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
  useToast
} from '@chakra-ui/react';
import { FiFolder, FiFile, FiUpload, FiDownload, FiGithub, FiPlus, FiTrash2, FiEdit, FiChevronRight, FiChevronDown } from 'react-icons/fi';

interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  children?: FileItem[];
}

interface FileManagerProps {
  onFileSelect: (file: FileItem) => void;
}

const FileManager: React.FC<FileManagerProps> = ({ onFileSelect }) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const { isOpen: isGithubOpen, onOpen: onGithubOpen, onClose: onGithubClose } = useDisclosure();
  const [githubRepo, setGithubRepo] = useState('');
  const toast = useToast();

  useEffect(() => {
    // In a real implementation, this would fetch from the backend API
    const fetchFiles = async () => {
      try {
        // Mock data for now - would be replaced with actual API call
        const mockFiles: FileItem[] = [
          {
            name: 'src',
            type: 'directory',
            path: '/project/src',
            children: [
              { name: 'index.html', type: 'file', path: '/project/src/index.html', size: 1024 },
              { name: 'styles.css', type: 'file', path: '/project/src/styles.css', size: 512 },
              { name: 'app.js', type: 'file', path: '/project/src/app.js', size: 2048 }
            ]
          },
          {
            name: 'assets',
            type: 'directory',
            path: '/project/assets',
            children: [
              { name: 'logo.png', type: 'file', path: '/project/assets/logo.png', size: 4096 }
            ]
          },
          { name: 'README.md', type: 'file', path: '/project/README.md', size: 256 }
        ];
        setFiles(mockFiles);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };

    fetchFiles();
  }, []);

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

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would upload files to the backend
    toast({
      title: 'Upload successful',
      description: 'Files have been uploaded to the project',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onUploadClose();
  };

  const handleGithubConnect = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would connect to GitHub
    toast({
      title: 'GitHub Connected',
      description: `Successfully connected to repository: ${githubRepo}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onGithubClose();
  };

  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <Box key={item.path} ml={level * 4}>
        <HStack 
          p={2} 
          _hover={{ bg: 'gray.100' }} 
          borderRadius="md"
          bg={selectedFile?.path === item.path ? 'blue.50' : 'transparent'}
          cursor="pointer"
          onClick={() => handleFileClick(item)}
        >
          {item.type === 'directory' && (
            <Icon 
              as={expandedFolders.has(item.path) ? FiChevronDown : FiChevronRight} 
              color="gray.500"
            />
          )}
          <Icon 
            as={item.type === 'directory' ? FiFolder : FiFile} 
            color={item.type === 'directory' ? 'blue.500' : 'gray.500'} 
          />
          <Text>{item.name}</Text>
        </HStack>
        
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
        <HStack justify="space-between">
          <Heading size="md">Project Files</Heading>
          <HStack>
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
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
        
        <Box overflowY="auto" flex="1">
          {renderFileTree(files)}
        </Box>
        
        <HStack justify="space-between">
          <Button size="sm" leftIcon={<FiPlus />}>New File</Button>
          <Button size="sm" leftIcon={<FiDownload />}>Download</Button>
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
                <Input type="file" multiple />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onUploadClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" type="submit">
                Upload
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
                    placeholder="username/repository" 
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                  <InputRightElement>
                    <Icon as={FiGithub} color="gray.500" />
                  </InputRightElement>
                </InputGroup>
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
    </Box>
  );
};

export default FileManager;
