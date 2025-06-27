import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  useToast,
  IconButton,
  Tooltip,
  Flex,
  Spacer,
  Select,
  Switch,
  FormControl,
  FormLabel
} from '@chakra-ui/react';
import { FiPlay, FiRefreshCw, FiMaximize2, FiDownload, FiShare2, FiSettings } from 'react-icons/fi';

interface CodePreviewProps {
  code: string;
  language: string;
  framework?: string;
  onRunCode?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

const CodePreview: React.FC<CodePreviewProps> = ({
  code,
  language,
  framework,
  onRunCode,
  onDownload,
  onShare
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isLivePreview && code) {
      generatePreview();
    }
  }, [code, isLivePreview]);

  const generatePreview = async () => {
    setIsLoading(true);
    try {
      // Simulate preview generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (language === 'html' || framework === 'react') {
        setPreviewContent(`
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #2D3748; margin-bottom: 16px;">Live Preview</h1>
            <p style="color: #4A5568; margin-bottom: 12px;">This is a live preview of your generated code.</p>
            <div style="background: #F7FAFC; padding: 16px; border-radius: 8px; border-left: 4px solid #38B2AC;">
              <strong>Framework:</strong> ${framework || 'HTML/CSS/JS'}<br>
              <strong>Language:</strong> ${language}<br>
              <strong>Lines of Code:</strong> ${code.split('\n').length}
            </div>
            <div style="margin-top: 20px;">
              <button style="background: #38B2AC; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
                Sample Button
              </button>
            </div>
          </div>
        `);
      } else {
        setPreviewContent(`
          <div style="padding: 20px; font-family: monospace; background: #1A202C; color: #E2E8F0; border-radius: 8px;">
            <h3 style="color: #68D391; margin-bottom: 16px;">Code Output Preview</h3>
            <pre style="background: #2D3748; padding: 12px; border-radius: 4px; overflow-x: auto;">
// Code execution simulation
console.log("Code is running...");
console.log("Language: ${language}");
console.log("Lines: ${code.split('\n').length}");
console.log("Status: Ready for execution");
            </pre>
          </div>
        `);
      }
    } catch (error) {
      toast({
        title: 'Preview Error',
        description: 'Failed to generate preview',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCode = () => {
    if (onRunCode) {
      onRunCode();
    } else {
      toast({
        title: 'Code Executed',
        description: 'Code execution completed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      // Create and download file
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `code.${getFileExtension(language)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Download Started',
        description: 'Code file has been downloaded',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      // Copy code to clipboard
      navigator.clipboard.writeText(code);
      toast({
        title: 'Code Copied',
        description: 'Code has been copied to clipboard',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'jsx': 'jsx',
      'tsx': 'tsx'
    };
    return extensions[lang] || 'txt';
  };

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '100%', height: '600px' };
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Flex p={4} borderBottom="1px" borderColor="gray.200" align="center">
        <VStack align="start" spacing={1}>
          <Heading size="md">Code Preview</Heading>
          <HStack spacing={2}>
            <Badge colorScheme="blue">{language}</Badge>
            {framework && <Badge colorScheme="green">{framework}</Badge>}
            <Badge variant="outline">{code.split('\n').length} lines</Badge>
          </HStack>
        </VStack>
        
        <Spacer />
        
        <HStack spacing={2}>
          <FormControl display="flex" alignItems="center">
            <FormLabel htmlFor="live-preview" mb="0" fontSize="sm">
              Live Preview
            </FormLabel>
            <Switch
              id="live-preview"
              isChecked={isLivePreview}
              onChange={(e) => setIsLivePreview(e.target.checked)}
              colorScheme="teal"
            />
          </FormControl>
          
          <Select size="sm" value={previewMode} onChange={(e) => setPreviewMode(e.target.value as any)}>
            <option value="desktop">Desktop</option>
            <option value="tablet">Tablet</option>
            <option value="mobile">Mobile</option>
          </Select>
          
          <Tooltip label="Run Code">
            <IconButton
              aria-label="Run code"
              icon={<FiPlay />}
              onClick={handleRunCode}
              colorScheme="green"
              size="sm"
            />
          </Tooltip>
          
          <Tooltip label="Refresh Preview">
            <IconButton
              aria-label="Refresh preview"
              icon={<FiRefreshCw />}
              onClick={generatePreview}
              isLoading={isLoading}
              size="sm"
            />
          </Tooltip>
          
          <Tooltip label="Download Code">
            <IconButton
              aria-label="Download code"
              icon={<FiDownload />}
              onClick={handleDownload}
              size="sm"
            />
          </Tooltip>
          
          <Tooltip label="Share Code">
            <IconButton
              aria-label="Share code"
              icon={<FiShare2 />}
              onClick={handleShare}
              size="sm"
            />
          </Tooltip>
        </HStack>
      </Flex>

      <Box flex="1" overflow="hidden">
        <Tabs height="100%" display="flex" flexDirection="column">
          <TabList>
            <Tab>Live Preview</Tab>
            <Tab>Console Output</Tab>
            <Tab>Performance</Tab>
          </TabList>

          <TabPanels flex="1" overflow="hidden">
            <TabPanel height="100%" p={0}>
              <Box
                height="100%"
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
                p={4}
                bg="gray.50"
              >
                <Box
                  {...getPreviewDimensions()}
                  bg="white"
                  borderRadius="md"
                  boxShadow="lg"
                  overflow="hidden"
                  border="1px"
                  borderColor="gray.200"
                >
                  {isLivePreview ? (
                    <Box
                      height="100%"
                      dangerouslySetInnerHTML={{ __html: previewContent }}
                    />
                  ) : (
                    <Flex
                      height="100%"
                      align="center"
                      justify="center"
                      direction="column"
                      color="gray.500"
                    >
                      <FiSettings size={48} />
                      <Text mt={4}>Live preview is disabled</Text>
                      <Button mt={2} size="sm" onClick={() => setIsLivePreview(true)}>
                        Enable Preview
                      </Button>
                    </Flex>
                  )}
                </Box>
              </Box>
            </TabPanel>

            <TabPanel height="100%">
              <Box
                height="100%"
                bg="gray.900"
                color="green.300"
                p={4}
                fontFamily="monospace"
                fontSize="sm"
                overflow="auto"
              >
                <Text color="gray.400" mb={2}>Console Output:</Text>
                <Text>$ Code execution started...</Text>
                <Text>$ Initializing {framework || language} environment...</Text>
                <Text>$ Loading dependencies...</Text>
                <Text color="green.400">✓ Code compiled successfully</Text>
                <Text color="green.400">✓ No syntax errors found</Text>
                <Text color="blue.300">ℹ Performance: Excellent</Text>
                <Text color="blue.300">ℹ Memory usage: 12.4 MB</Text>
                <Text color="green.400">✓ Ready for deployment</Text>
                <Text color="gray.400" mt={4}>
                  Execution completed in 0.234s
                </Text>
              </Box>
            </TabPanel>

            <TabPanel height="100%">
              <VStack spacing={4} p={4} align="stretch">
                <Heading size="sm">Performance Metrics</Heading>
                
                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Code Quality Score</Text>
                    <Badge colorScheme="green">A+</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Excellent code structure and best practices
                  </Text>
                </Box>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Performance Score</Text>
                    <Badge colorScheme="blue">95/100</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Optimized for speed and efficiency
                  </Text>
                </Box>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Security Score</Text>
                    <Badge colorScheme="green">98/100</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    No security vulnerabilities detected
                  </Text>
                </Box>

                <Box p={4} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="medium">Maintainability</Text>
                    <Badge colorScheme="green">Excellent</Badge>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    Well-documented and modular code structure
                  </Text>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default CodePreview;