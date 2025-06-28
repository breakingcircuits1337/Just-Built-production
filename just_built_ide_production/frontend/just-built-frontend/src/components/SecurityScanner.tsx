import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  useToast,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Flex,
  Spacer,
  IconButton,
  Tooltip,
  Select,
  Switch,
  FormControl,
  FormLabel,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import {
  FiShield,
  FiAlertTriangle,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiX,
  FiPlay,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiSettings,
  FiLock,
  FiUnlock,
  FiCode,
  FiFileText,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: 'vulnerability' | 'code-quality' | 'dependency' | 'configuration' | 'best-practice';
  title: string;
  description: string;
  file: string;
  line?: number;
  column?: number;
  cwe?: string;
  cvss?: number;
  recommendation: string;
  codeSnippet?: string;
  fixSuggestion?: string;
  references: string[];
}

interface ScanResult {
  id: string;
  timestamp: Date;
  duration: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  infoIssues: number;
  score: number;
  issues: SecurityIssue[];
}

interface SecurityScannerProps {
  code: string;
  language: string;
  framework?: string;
  onClose: () => void;
}

const SecurityScanner: React.FC<SecurityScannerProps> = ({ 
  code, 
  language, 
  framework, 
  onClose 
}) => {
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [currentScan, setCurrentScan] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<SecurityIssue | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [autoScan, setAutoScan] = useState(true);
  const [scanConfig, setScanConfig] = useState({
    includeVulnerabilities: true,
    includeCodeQuality: true,
    includeDependencies: true,
    includeConfiguration: true,
    includeBestPractices: true
  });

  const toast = useToast();
  const { isOpen: isIssueDetailOpen, onOpen: onIssueDetailOpen, onClose: onIssueDetailClose } = useDisclosure();
  const { isOpen: isConfigOpen, onOpen: onConfigOpen, onClose: onConfigClose } = useDisclosure();

  useEffect(() => {
    if (autoScan && code) {
      performScan();
    }
  }, [code, language, framework, autoScan]);

  const performScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    try {
      // Simulate scanning progress
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate scan duration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setScanProgress(100);
      
      // Generate mock scan results
      const mockIssues = generateMockIssues();
      const scanResult: ScanResult = {
        id: `scan-${Date.now()}`,
        timestamp: new Date(),
        duration: 2.1,
        totalIssues: mockIssues.length,
        criticalIssues: mockIssues.filter(i => i.severity === 'critical').length,
        highIssues: mockIssues.filter(i => i.severity === 'high').length,
        mediumIssues: mockIssues.filter(i => i.severity === 'medium').length,
        lowIssues: mockIssues.filter(i => i.severity === 'low').length,
        infoIssues: mockIssues.filter(i => i.severity === 'info').length,
        score: calculateSecurityScore(mockIssues),
        issues: mockIssues
      };

      setScanResults(prev => [scanResult, ...prev]);
      setCurrentScan(scanResult);

      toast({
        title: 'Security Scan Complete',
        description: `Found ${mockIssues.length} issues in ${scanResult.duration}s`,
        status: mockIssues.some(i => i.severity === 'critical') ? 'error' : 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'Failed to complete security scan',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const generateMockIssues = (): SecurityIssue[] => {
    const issues: SecurityIssue[] = [];

    // Check for common security issues based on language and code content
    if (code.includes('eval(') || code.includes('Function(')) {
      issues.push({
        id: 'eval-usage',
        severity: 'critical',
        type: 'vulnerability',
        title: 'Code Injection Vulnerability',
        description: 'Use of eval() or Function() constructor can lead to code injection attacks',
        file: 'main.js',
        line: 42,
        cwe: 'CWE-94',
        cvss: 9.3,
        recommendation: 'Avoid using eval() or Function() constructor. Use safer alternatives like JSON.parse() for data parsing.',
        codeSnippet: 'eval(userInput); // Dangerous!',
        fixSuggestion: 'JSON.parse(userInput); // Safer alternative',
        references: [
          'https://owasp.org/www-community/attacks/Code_Injection',
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval'
        ]
      });
    }

    if (code.includes('innerHTML') && !code.includes('DOMPurify')) {
      issues.push({
        id: 'xss-innerHTML',
        severity: 'high',
        type: 'vulnerability',
        title: 'Cross-Site Scripting (XSS) Risk',
        description: 'Direct use of innerHTML without sanitization can lead to XSS attacks',
        file: 'component.tsx',
        line: 28,
        cwe: 'CWE-79',
        cvss: 7.5,
        recommendation: 'Sanitize user input before setting innerHTML or use textContent instead',
        codeSnippet: 'element.innerHTML = userInput;',
        fixSuggestion: 'element.textContent = userInput; // or use DOMPurify.sanitize(userInput)',
        references: [
          'https://owasp.org/www-community/attacks/xss/',
          'https://github.com/cure53/DOMPurify'
        ]
      });
    }

    if (code.includes('localStorage') || code.includes('sessionStorage')) {
      issues.push({
        id: 'sensitive-storage',
        severity: 'medium',
        type: 'best-practice',
        title: 'Sensitive Data in Local Storage',
        description: 'Storing sensitive data in localStorage/sessionStorage is not secure',
        file: 'auth.ts',
        line: 15,
        recommendation: 'Use secure HTTP-only cookies or encrypted storage for sensitive data',
        codeSnippet: 'localStorage.setItem("token", authToken);',
        fixSuggestion: '// Use secure HTTP-only cookies instead',
        references: [
          'https://owasp.org/www-project-cheat-sheets/cheatsheets/HTML5_Security_Cheat_Sheet.html'
        ]
      });
    }

    if (code.includes('http://') && !code.includes('localhost')) {
      issues.push({
        id: 'insecure-protocol',
        severity: 'medium',
        type: 'configuration',
        title: 'Insecure HTTP Protocol',
        description: 'Using HTTP instead of HTTPS for external requests',
        file: 'api.ts',
        line: 8,
        recommendation: 'Use HTTPS for all external API calls to ensure data encryption',
        codeSnippet: 'fetch("http://api.example.com/data")',
        fixSuggestion: 'fetch("https://api.example.com/data")',
        references: [
          'https://owasp.org/www-project-cheat-sheets/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html'
        ]
      });
    }

    if (!code.includes('helmet') && framework === 'express') {
      issues.push({
        id: 'missing-helmet',
        severity: 'medium',
        type: 'dependency',
        title: 'Missing Security Headers',
        description: 'Express application should use helmet for security headers',
        file: 'server.js',
        line: 5,
        recommendation: 'Install and configure helmet middleware for security headers',
        codeSnippet: 'app.use(express.json());',
        fixSuggestion: 'app.use(helmet());\napp.use(express.json());',
        references: [
          'https://helmetjs.github.io/',
          'https://owasp.org/www-project-secure-headers/'
        ]
      });
    }

    if (code.includes('console.log') || code.includes('console.error')) {
      issues.push({
        id: 'console-logging',
        severity: 'low',
        type: 'code-quality',
        title: 'Console Logging in Production',
        description: 'Console statements should be removed from production code',
        file: 'utils.ts',
        line: 23,
        recommendation: 'Remove console statements or use a proper logging library',
        codeSnippet: 'console.log("Debug info:", data);',
        fixSuggestion: '// Use a logging library like winston or remove for production',
        references: [
          'https://owasp.org/www-project-cheat-sheets/cheatsheets/Logging_Cheat_Sheet.html'
        ]
      });
    }

    if (code.includes('Math.random()')) {
      issues.push({
        id: 'weak-random',
        severity: 'low',
        type: 'best-practice',
        title: 'Weak Random Number Generation',
        description: 'Math.random() is not cryptographically secure',
        file: 'crypto.ts',
        line: 12,
        recommendation: 'Use crypto.getRandomValues() for cryptographic purposes',
        codeSnippet: 'const id = Math.random().toString(36);',
        fixSuggestion: 'const array = new Uint32Array(1);\ncrypto.getRandomValues(array);\nconst id = array[0].toString(36);',
        references: [
          'https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues'
        ]
      });
    }

    // Add some informational best practices
    issues.push({
      id: 'csp-recommendation',
      severity: 'info',
      type: 'best-practice',
      title: 'Content Security Policy Recommended',
      description: 'Implementing CSP can help prevent XSS attacks',
      file: 'index.html',
      recommendation: 'Add Content-Security-Policy meta tag or HTTP header',
      references: [
        'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
        'https://owasp.org/www-project-cheat-sheets/cheatsheets/Content_Security_Policy_Cheat_Sheet.html'
      ]
    });

    return issues;
  };

  const calculateSecurityScore = (issues: SecurityIssue[]): number => {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
        case 'info':
          score -= 0;
          break;
      }
    });

    return Math.max(0, score);
  };

  const getSeverityColor = (severity: SecurityIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      case 'info': return 'gray';
      default: return 'gray';
    }
  };

  const getSeverityIcon = (severity: SecurityIssue['severity']) => {
    switch (severity) {
      case 'critical': return FiAlertTriangle;
      case 'high': return FiAlertCircle;
      case 'medium': return FiAlertCircle;
      case 'low': return FiInfo;
      case 'info': return FiInfo;
      default: return FiInfo;
    }
  };

  const getTypeIcon = (type: SecurityIssue['type']) => {
    switch (type) {
      case 'vulnerability': return FiShield;
      case 'code-quality': return FiCode;
      case 'dependency': return FiFileText;
      case 'configuration': return FiSettings;
      case 'best-practice': return FiCheck;
      default: return FiInfo;
    }
  };

  const filteredIssues = currentScan?.issues.filter(issue => {
    const severityMatch = filterSeverity === 'all' || issue.severity === filterSeverity;
    const typeMatch = filterType === 'all' || issue.type === filterType;
    return severityMatch && typeMatch;
  }) || [];

  const exportReport = () => {
    if (!currentScan) return;

    const report = {
      scan: {
        timestamp: currentScan.timestamp,
        duration: currentScan.duration,
        score: currentScan.score
      },
      summary: {
        totalIssues: currentScan.totalIssues,
        criticalIssues: currentScan.criticalIssues,
        highIssues: currentScan.highIssues,
        mediumIssues: currentScan.mediumIssues,
        lowIssues: currentScan.lowIssues,
        infoIssues: currentScan.infoIssues
      },
      issues: currentScan.issues
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${currentScan.timestamp.toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Report Exported',
      description: 'Security report has been downloaded',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Security Scanner</Heading>
            <Text color="gray.600">Analyze code for security vulnerabilities and best practices</Text>
          </VStack>
          <HStack spacing={4}>
            <HStack spacing={2}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-scan" mb="0" fontSize="sm">
                  Auto Scan
                </FormLabel>
                <Switch
                  id="auto-scan"
                  isChecked={autoScan}
                  onChange={(e) => setAutoScan(e.target.checked)}
                  colorScheme="teal"
                />
              </FormControl>
              <Button size="sm" leftIcon={<FiSettings />} onClick={onConfigOpen}>
                Configure
              </Button>
              <Button 
                size="sm" 
                leftIcon={<FiPlay />} 
                colorScheme="teal" 
                onClick={performScan}
                isLoading={isScanning}
                loadingText="Scanning..."
              >
                Scan Now
              </Button>
              {currentScan && (
                <Button size="sm" leftIcon={<FiDownload />} onClick={exportReport}>
                  Export Report
                </Button>
              )}
              <Button onClick={onClose}>Close</Button>
            </HStack>
          </HStack>
        </Flex>
      </Box>

      {/* Scanning Progress */}
      {isScanning && (
        <Box p={4} bg="blue.50" borderBottom="1px" borderColor="blue.200">
          <VStack spacing={2}>
            <Text fontWeight="medium">Scanning for security issues...</Text>
            <Progress value={scanProgress} colorScheme="blue" width="100%" />
            <Text fontSize="sm" color="gray.600">{scanProgress}% complete</Text>
          </VStack>
        </Box>
      )}

      <Flex flex="1">
        {/* Main Content */}
        <Box flex="1" p={6} overflow="auto">
          {currentScan ? (
            <VStack spacing={6} align="stretch">
              {/* Security Score */}
              <Box p={6} bg="white" border="1px" borderColor="gray.200" borderRadius="lg">
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={1}>
                    <Heading size="md">Security Score</Heading>
                    <Text color="gray.600">Overall security assessment</Text>
                  </VStack>
                  <VStack align="end" spacing={1}>
                    <Text fontSize="3xl" fontWeight="bold" color={currentScan.score >= 80 ? 'green.500' : currentScan.score >= 60 ? 'yellow.500' : 'red.500'}>
                      {currentScan.score}
                    </Text>
                    <Text fontSize="sm" color="gray.600">out of 100</Text>
                  </VStack>
                </HStack>
                <Progress 
                  value={currentScan.score} 
                  colorScheme={currentScan.score >= 80 ? 'green' : currentScan.score >= 60 ? 'yellow' : 'red'}
                  size="lg"
                />
              </Box>

              {/* Summary Statistics */}
              <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                <Stat>
                  <StatLabel>Critical</StatLabel>
                  <StatNumber color="red.500">{currentScan.criticalIssues}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>High</StatLabel>
                  <StatNumber color="orange.500">{currentScan.highIssues}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Medium</StatLabel>
                  <StatNumber color="yellow.500">{currentScan.mediumIssues}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Low</StatLabel>
                  <StatNumber color="blue.500">{currentScan.lowIssues}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Info</StatLabel>
                  <StatNumber color="gray.500">{currentScan.infoIssues}</StatNumber>
                </Stat>
              </SimpleGrid>

              {/* Filters */}
              <HStack spacing={4}>
                <Select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} maxW="200px">
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </Select>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} maxW="200px">
                  <option value="all">All Types</option>
                  <option value="vulnerability">Vulnerabilities</option>
                  <option value="code-quality">Code Quality</option>
                  <option value="dependency">Dependencies</option>
                  <option value="configuration">Configuration</option>
                  <option value="best-practice">Best Practices</option>
                </Select>
                <Text fontSize="sm" color="gray.600">
                  Showing {filteredIssues.length} of {currentScan.totalIssues} issues
                </Text>
              </HStack>

              {/* Issues List */}
              <VStack spacing={4} align="stretch">
                {filteredIssues.map(issue => {
                  const SeverityIcon = getSeverityIcon(issue.severity);
                  const TypeIcon = getTypeIcon(issue.type);
                  
                  return (
                    <Box
                      key={issue.id}
                      p={4}
                      bg="white"
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => {
                        setSelectedIssue(issue);
                        onIssueDetailOpen();
                      }}
                      _hover={{ borderColor: 'blue.300', shadow: 'md' }}
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={3}>
                          <Box color={`${getSeverityColor(issue.severity)}.500`}>
                            <SeverityIcon size={20} />
                          </Box>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{issue.title}</Text>
                            <Text fontSize="sm" color="gray.600">{issue.description}</Text>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={1}>
                          <Badge colorScheme={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {issue.type}
                          </Badge>
                        </VStack>
                      </HStack>
                      
                      <HStack spacing={4} fontSize="sm" color="gray.600">
                        <HStack>
                          <TypeIcon size={14} />
                          <Text>{issue.file}</Text>
                          {issue.line && <Text>Line {issue.line}</Text>}
                        </HStack>
                        {issue.cwe && (
                          <Badge size="sm" colorScheme="purple">
                            {issue.cwe}
                          </Badge>
                        )}
                        {issue.cvss && (
                          <Badge size="sm" colorScheme="red">
                            CVSS {issue.cvss}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </VStack>
            </VStack>
          ) : (
            <VStack spacing={6} align="center" justify="center" height="100%">
              <FiShield size={64} color="gray" />
              <VStack spacing={2} textAlign="center">
                <Heading size="lg" color="gray.600">No Scan Results</Heading>
                <Text color="gray.500">
                  Click "Scan Now" to analyze your code for security issues
                </Text>
              </VStack>
              <Button 
                leftIcon={<FiPlay />} 
                colorScheme="teal" 
                onClick={performScan}
                isLoading={isScanning}
                loadingText="Scanning..."
              >
                Start Security Scan
              </Button>
            </VStack>
          )}
        </Box>

        {/* Sidebar */}
        <Box width="300px" bg="gray.50" borderLeft="1px" borderColor="gray.200" p={4}>
          <VStack spacing={4} align="stretch">
            <Box>
              <Heading size="sm" mb={2}>Scan History</Heading>
              <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
                {scanResults.map(scan => (
                  <Box
                    key={scan.id}
                    p={3}
                    bg={scan.id === currentScan?.id ? 'blue.50' : 'white'}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => setCurrentScan(scan)}
                    border="1px"
                    borderColor={scan.id === currentScan?.id ? 'blue.200' : 'gray.200'}
                  >
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {scan.timestamp.toLocaleString()}
                      </Text>
                      <HStack spacing={2}>
                        <Badge size="sm" colorScheme={scan.score >= 80 ? 'green' : scan.score >= 60 ? 'yellow' : 'red'}>
                          Score: {scan.score}
                        </Badge>
                        <Badge size="sm" variant="outline">
                          {scan.totalIssues} issues
                        </Badge>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Box>
              <Heading size="sm" mb={2}>Security Tips</Heading>
              <VStack spacing={2} align="stretch">
                <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px" borderColor="blue.400">
                  <Text fontSize="sm" fontWeight="medium" color="blue.800">
                    Input Validation
                  </Text>
                  <Text fontSize="xs" color="blue.700">
                    Always validate and sanitize user inputs
                  </Text>
                </Box>
                <Box p={3} bg="green.50" borderRadius="md" borderLeft="4px" borderColor="green.400">
                  <Text fontSize="sm" fontWeight="medium" color="green.800">
                    HTTPS Only
                  </Text>
                  <Text fontSize="xs" color="green.700">
                    Use HTTPS for all external communications
                  </Text>
                </Box>
                <Box p={3} bg="purple.50" borderRadius="md" borderLeft="4px" borderColor="purple.400">
                  <Text fontSize="sm" fontWeight="medium" color="purple.800">
                    Dependency Updates
                  </Text>
                  <Text fontSize="xs" color="purple.700">
                    Keep dependencies updated to latest secure versions
                  </Text>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>

      {/* Issue Detail Modal */}
      <Modal isOpen={isIssueDetailOpen} onClose={onIssueDetailClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Security Issue Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedIssue && (
              <VStack spacing={4} align="stretch">
                <HStack spacing={3}>
                  <Badge colorScheme={getSeverityColor(selectedIssue.severity)} size="lg">
                    {selectedIssue.severity.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{selectedIssue.type}</Badge>
                  {selectedIssue.cwe && (
                    <Badge colorScheme="purple">{selectedIssue.cwe}</Badge>
                  )}
                  {selectedIssue.cvss && (
                    <Badge colorScheme="red">CVSS {selectedIssue.cvss}</Badge>
                  )}
                </HStack>

                <Box>
                  <Heading size="md" mb={2}>{selectedIssue.title}</Heading>
                  <Text color="gray.600">{selectedIssue.description}</Text>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2}>Location:</Text>
                  <Code p={2} borderRadius="md">
                    {selectedIssue.file}
                    {selectedIssue.line && `:${selectedIssue.line}`}
                    {selectedIssue.column && `:${selectedIssue.column}`}
                  </Code>
                </Box>

                {selectedIssue.codeSnippet && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Vulnerable Code:</Text>
                    <Box p={4} bg="red.50" borderRadius="md" border="1px" borderColor="red.200">
                      <Code fontSize="sm">{selectedIssue.codeSnippet}</Code>
                    </Box>
                  </Box>
                )}

                {selectedIssue.fixSuggestion && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>Suggested Fix:</Text>
                    <Box p={4} bg="green.50" borderRadius="md" border="1px" borderColor="green.200">
                      <Code fontSize="sm">{selectedIssue.fixSuggestion}</Code>
                    </Box>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="medium" mb={2}>Recommendation:</Text>
                  <Text>{selectedIssue.recommendation}</Text>
                </Box>

                {selectedIssue.references.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>References:</Text>
                    <List spacing={1}>
                      {selectedIssue.references.map((ref, index) => (
                        <ListItem key={index}>
                          <ListIcon as={FiEye} color="blue.500" />
                          <Text as="a" href={ref} target="_blank" color="blue.500" textDecoration="underline">
                            {ref}
                          </Text>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onIssueDetailClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Configuration Modal */}
      <Modal isOpen={isConfigOpen} onClose={onConfigClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Scan Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontWeight="medium">Select scan types to include:</Text>
              
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text>Vulnerability Scanning</Text>
                  <Switch
                    isChecked={scanConfig.includeVulnerabilities}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, includeVulnerabilities: e.target.checked }))}
                    colorScheme="teal"
                  />
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Code Quality Analysis</Text>
                  <Switch
                    isChecked={scanConfig.includeCodeQuality}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, includeCodeQuality: e.target.checked }))}
                    colorScheme="teal"
                  />
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Dependency Scanning</Text>
                  <Switch
                    isChecked={scanConfig.includeDependencies}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, includeDependencies: e.target.checked }))}
                    colorScheme="teal"
                  />
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Configuration Review</Text>
                  <Switch
                    isChecked={scanConfig.includeConfiguration}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, includeConfiguration: e.target.checked }))}
                    colorScheme="teal"
                  />
                </HStack>
                
                <HStack justify="space-between">
                  <Text>Best Practices Check</Text>
                  <Switch
                    isChecked={scanConfig.includeBestPractices}
                    onChange={(e) => setScanConfig(prev => ({ ...prev, includeBestPractices: e.target.checked }))}
                    colorScheme="teal"
                  />
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onConfigClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={onConfigClose}>
              Save Configuration
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SecurityScanner;