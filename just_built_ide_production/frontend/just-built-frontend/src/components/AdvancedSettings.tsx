import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Switch,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Divider,
  Badge,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';

interface AdvancedSettingsProps {
  onSettingsChange: (settings: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ onSettingsChange }) => {
  const [settings, setSettings] = useState({
    // AI Configuration
    aiSettings: {
      contextWindow: 4096,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      maxRetries: 3,
      timeoutSeconds: 30,
      enableStreaming: true,
      enableCaching: true
    },
    
    // Code Generation
    codeSettings: {
      codeStyle: 'clean',
      includeComments: true,
      includeTests: false,
      includeDocumentation: true,
      optimizeForPerformance: false,
      enableTypeScript: true,
      enableLinting: true,
      autoFormat: true
    },
    
    // Security
    securitySettings: {
      enableSecurityScanning: true,
      blockMaliciousCode: true,
      enableSandboxing: true,
      logSecurityEvents: true,
      requireCodeReview: false,
      enableVulnerabilityChecks: true
    },
    
    // Performance
    performanceSettings: {
      enableCodeSplitting: true,
      enableMinification: true,
      enableCompression: true,
      enableCaching: true,
      optimizeImages: true,
      enableLazyLoading: true,
      bundleAnalysis: false
    },
    
    // Collaboration
    collaborationSettings: {
      enableRealTimeSync: true,
      enableComments: true,
      enableVersionControl: true,
      autoSaveInterval: 30,
      enableNotifications: true,
      shareByDefault: false
    },
    
    // Development
    developmentSettings: {
      enableHotReload: true,
      enableSourceMaps: true,
      enableDebugging: true,
      enableProfiling: false,
      enableExperimentalFeatures: false,
      verboseLogging: false
    }
  });

  const toast = useToast();

  const updateSetting = (category: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [key]: value
      }
    };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const resetToDefaults = () => {
    // Reset to default values
    const defaultSettings = {
      aiSettings: {
        contextWindow: 4096,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0,
        maxRetries: 3,
        timeoutSeconds: 30,
        enableStreaming: true,
        enableCaching: true
      },
      codeSettings: {
        codeStyle: 'clean',
        includeComments: true,
        includeTests: false,
        includeDocumentation: true,
        optimizeForPerformance: false,
        enableTypeScript: true,
        enableLinting: true,
        autoFormat: true
      },
      securitySettings: {
        enableSecurityScanning: true,
        blockMaliciousCode: true,
        enableSandboxing: true,
        logSecurityEvents: true,
        requireCodeReview: false,
        enableVulnerabilityChecks: true
      },
      performanceSettings: {
        enableCodeSplitting: true,
        enableMinification: true,
        enableCompression: true,
        enableCaching: true,
        optimizeImages: true,
        enableLazyLoading: true,
        bundleAnalysis: false
      },
      collaborationSettings: {
        enableRealTimeSync: true,
        enableComments: true,
        enableVersionControl: true,
        autoSaveInterval: 30,
        enableNotifications: true,
        shareByDefault: false
      },
      developmentSettings: {
        enableHotReload: true,
        enableSourceMaps: true,
        enableDebugging: true,
        enableProfiling: false,
        enableExperimentalFeatures: false,
        verboseLogging: false
      }
    };
    
    setSettings(defaultSettings);
    onSettingsChange(defaultSettings);
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to defaults',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'just-built-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Settings Exported',
      description: 'Settings have been exported to file',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={4} height="100%" overflow="auto">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Advanced Settings</Heading>
            <Text color="gray.600">Configure AI behavior, code generation, and system preferences</Text>
          </VStack>
          <HStack>
            <Button size="sm" onClick={exportSettings}>
              Export Settings
            </Button>
            <Button size="sm" variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
          </HStack>
        </HStack>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            Changes to these settings will affect all future AI interactions and code generation.
          </AlertDescription>
        </Alert>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>AI Configuration</Tab>
            <Tab>Code Generation</Tab>
            <Tab>Security</Tab>
            <Tab>Performance</Tab>
            <Tab>Collaboration</Tab>
            <Tab>Development</Tab>
          </TabList>

          <TabPanels>
            {/* AI Configuration */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">AI Model Configuration</Heading>
                
                <FormControl>
                  <FormLabel>Context Window Size: {settings.aiSettings.contextWindow}</FormLabel>
                  <Slider
                    value={settings.aiSettings.contextWindow}
                    onChange={(value) => updateSetting('aiSettings', 'contextWindow', value)}
                    min={1024}
                    max={32768}
                    step={1024}
                  >
                    <SliderMark value={1024} mt="2" ml="-2" fontSize="sm">1K</SliderMark>
                    <SliderMark value={32768} mt="2" ml="-2" fontSize="sm">32K</SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel>Temperature: {settings.aiSettings.temperature}</FormLabel>
                  <Slider
                    value={settings.aiSettings.temperature}
                    onChange={(value) => updateSetting('aiSettings', 'temperature', value)}
                    min={0}
                    max={2}
                    step={0.1}
                  >
                    <SliderMark value={0} mt="2" ml="-2" fontSize="sm">Conservative</SliderMark>
                    <SliderMark value={2} mt="2" ml="-2" fontSize="sm">Creative</SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <HStack spacing={4}>
                  <FormControl>
                    <FormLabel>Max Retries</FormLabel>
                    <Input
                      type="number"
                      value={settings.aiSettings.maxRetries}
                      onChange={(e) => updateSetting('aiSettings', 'maxRetries', parseInt(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Timeout (seconds)</FormLabel>
                    <Input
                      type="number"
                      value={settings.aiSettings.timeoutSeconds}
                      onChange={(e) => updateSetting('aiSettings', 'timeoutSeconds', parseInt(e.target.value))}
                      min={10}
                      max={300}
                    />
                  </FormControl>
                </HStack>

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>Enable Streaming Responses</Text>
                    <Switch
                      isChecked={settings.aiSettings.enableStreaming}
                      onChange={(e) => updateSetting('aiSettings', 'enableStreaming', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Response Caching</Text>
                    <Switch
                      isChecked={settings.aiSettings.enableCaching}
                      onChange={(e) => updateSetting('aiSettings', 'enableCaching', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Code Generation */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Code Generation Preferences</Heading>
                
                <FormControl>
                  <FormLabel>Code Style</FormLabel>
                  <Select
                    value={settings.codeSettings.codeStyle}
                    onChange={(e) => updateSetting('codeSettings', 'codeStyle', e.target.value)}
                  >
                    <option value="clean">Clean & Readable</option>
                    <option value="compact">Compact</option>
                    <option value="functional">Functional</option>
                    <option value="object-oriented">Object-Oriented</option>
                  </Select>
                </FormControl>

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>Include Comments</Text>
                    <Switch
                      isChecked={settings.codeSettings.includeComments}
                      onChange={(e) => updateSetting('codeSettings', 'includeComments', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Generate Tests</Text>
                    <Switch
                      isChecked={settings.codeSettings.includeTests}
                      onChange={(e) => updateSetting('codeSettings', 'includeTests', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Include Documentation</Text>
                    <Switch
                      isChecked={settings.codeSettings.includeDocumentation}
                      onChange={(e) => updateSetting('codeSettings', 'includeDocumentation', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Optimize for Performance</Text>
                    <Switch
                      isChecked={settings.codeSettings.optimizeForPerformance}
                      onChange={(e) => updateSetting('codeSettings', 'optimizeForPerformance', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable TypeScript</Text>
                    <Switch
                      isChecked={settings.codeSettings.enableTypeScript}
                      onChange={(e) => updateSetting('codeSettings', 'enableTypeScript', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Linting</Text>
                    <Switch
                      isChecked={settings.codeSettings.enableLinting}
                      onChange={(e) => updateSetting('codeSettings', 'enableLinting', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Auto Format Code</Text>
                    <Switch
                      isChecked={settings.codeSettings.autoFormat}
                      onChange={(e) => updateSetting('codeSettings', 'autoFormat', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Security */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Security Configuration</Heading>
                
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Security settings help protect against malicious code generation and ensure safe development practices.
                  </AlertDescription>
                </Alert>

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Enable Security Scanning</Text>
                      <Text fontSize="sm" color="gray.600">Scan generated code for vulnerabilities</Text>
                    </VStack>
                    <Switch
                      isChecked={settings.securitySettings.enableSecurityScanning}
                      onChange={(e) => updateSetting('securitySettings', 'enableSecurityScanning', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Block Malicious Code</Text>
                      <Text fontSize="sm" color="gray.600">Prevent generation of potentially harmful code</Text>
                    </VStack>
                    <Switch
                      isChecked={settings.securitySettings.blockMaliciousCode}
                      onChange={(e) => updateSetting('securitySettings', 'blockMaliciousCode', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Enable Sandboxing</Text>
                      <Text fontSize="sm" color="gray.600">Run code in isolated environment</Text>
                    </VStack>
                    <Switch
                      isChecked={settings.securitySettings.enableSandboxing}
                      onChange={(e) => updateSetting('securitySettings', 'enableSandboxing', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Log Security Events</Text>
                      <Text fontSize="sm" color="gray.600">Keep audit trail of security-related activities</Text>
                    </VStack>
                    <Switch
                      isChecked={settings.securitySettings.logSecurityEvents}
                      onChange={(e) => updateSetting('securitySettings', 'logSecurityEvents', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Require Code Review</Text>
                      <Text fontSize="sm" color="gray.600">Require manual review before execution</Text>
                    </VStack>
                    <Switch
                      isChecked={settings.securitySettings.requireCodeReview}
                      onChange={(e) => updateSetting('securitySettings', 'requireCodeReview', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text>Enable Vulnerability Checks</Text>
                      <Text fontSize="sm" color="gray.600">Check dependencies for known vulnerabilities</Text>
                    </VStack>
                    <Switch
                      isChecked={settings.securitySettings.enableVulnerabilityChecks}
                      onChange={(e) => updateSetting('securitySettings', 'enableVulnerabilityChecks', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Performance */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Performance Optimization</Heading>

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>Enable Code Splitting</Text>
                    <Switch
                      isChecked={settings.performanceSettings.enableCodeSplitting}
                      onChange={(e) => updateSetting('performanceSettings', 'enableCodeSplitting', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Minification</Text>
                    <Switch
                      isChecked={settings.performanceSettings.enableMinification}
                      onChange={(e) => updateSetting('performanceSettings', 'enableMinification', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Compression</Text>
                    <Switch
                      isChecked={settings.performanceSettings.enableCompression}
                      onChange={(e) => updateSetting('performanceSettings', 'enableCompression', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Caching</Text>
                    <Switch
                      isChecked={settings.performanceSettings.enableCaching}
                      onChange={(e) => updateSetting('performanceSettings', 'enableCaching', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Optimize Images</Text>
                    <Switch
                      isChecked={settings.performanceSettings.optimizeImages}
                      onChange={(e) => updateSetting('performanceSettings', 'optimizeImages', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Lazy Loading</Text>
                    <Switch
                      isChecked={settings.performanceSettings.enableLazyLoading}
                      onChange={(e) => updateSetting('performanceSettings', 'enableLazyLoading', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Bundle Analysis</Text>
                    <Switch
                      isChecked={settings.performanceSettings.bundleAnalysis}
                      onChange={(e) => updateSetting('performanceSettings', 'bundleAnalysis', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Collaboration */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Collaboration Settings</Heading>

                <FormControl>
                  <FormLabel>Auto-save Interval (seconds): {settings.collaborationSettings.autoSaveInterval}</FormLabel>
                  <Slider
                    value={settings.collaborationSettings.autoSaveInterval}
                    onChange={(value) => updateSetting('collaborationSettings', 'autoSaveInterval', value)}
                    min={10}
                    max={300}
                    step={10}
                  >
                    <SliderMark value={10} mt="2" ml="-2" fontSize="sm">10s</SliderMark>
                    <SliderMark value={300} mt="2" ml="-2" fontSize="sm">5m</SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>Enable Real-time Sync</Text>
                    <Switch
                      isChecked={settings.collaborationSettings.enableRealTimeSync}
                      onChange={(e) => updateSetting('collaborationSettings', 'enableRealTimeSync', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Comments</Text>
                    <Switch
                      isChecked={settings.collaborationSettings.enableComments}
                      onChange={(e) => updateSetting('collaborationSettings', 'enableComments', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Version Control</Text>
                    <Switch
                      isChecked={settings.collaborationSettings.enableVersionControl}
                      onChange={(e) => updateSetting('collaborationSettings', 'enableVersionControl', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Notifications</Text>
                    <Switch
                      isChecked={settings.collaborationSettings.enableNotifications}
                      onChange={(e) => updateSetting('collaborationSettings', 'enableNotifications', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Share by Default</Text>
                    <Switch
                      isChecked={settings.collaborationSettings.shareByDefault}
                      onChange={(e) => updateSetting('collaborationSettings', 'shareByDefault', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Development */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Development Environment</Heading>

                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>Enable Hot Reload</Text>
                    <Switch
                      isChecked={settings.developmentSettings.enableHotReload}
                      onChange={(e) => updateSetting('developmentSettings', 'enableHotReload', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Source Maps</Text>
                    <Switch
                      isChecked={settings.developmentSettings.enableSourceMaps}
                      onChange={(e) => updateSetting('developmentSettings', 'enableSourceMaps', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Debugging</Text>
                    <Switch
                      isChecked={settings.developmentSettings.enableDebugging}
                      onChange={(e) => updateSetting('developmentSettings', 'enableDebugging', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Profiling</Text>
                    <Switch
                      isChecked={settings.developmentSettings.enableProfiling}
                      onChange={(e) => updateSetting('developmentSettings', 'enableProfiling', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Enable Experimental Features</Text>
                    <Switch
                      isChecked={settings.developmentSettings.enableExperimentalFeatures}
                      onChange={(e) => updateSetting('developmentSettings', 'enableExperimentalFeatures', e.target.checked)}
                      colorScheme="orange"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Verbose Logging</Text>
                    <Switch
                      isChecked={settings.developmentSettings.verboseLogging}
                      onChange={(e) => updateSetting('developmentSettings', 'verboseLogging', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>

                {settings.developmentSettings.enableExperimentalFeatures && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>
                      Experimental features may be unstable and could affect system performance.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default AdvancedSettings;