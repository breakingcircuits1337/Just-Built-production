import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Textarea,
  Select,
  Switch,
  Button,
  FormControl,
  FormLabel,
  Divider,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark
} from '@chakra-ui/react';

interface ProjectSettingsProps {
  project?: any;
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ 
  project, 
  onSettingsChange, 
  onClose 
}) => {
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      name: project?.name || '',
      description: project?.description || '',
      type: project?.type || 'web-app',
      framework: project?.framework || 'react',
      language: project?.language || 'typescript',
      version: project?.version || '1.0.0',
      license: project?.license || 'MIT',
      repository: project?.repository || '',
      homepage: project?.homepage || '',
      keywords: project?.keywords || []
    },
    
    // Development Settings
    development: {
      enableHotReload: true,
      enableSourceMaps: true,
      enableLinting: true,
      enablePrettier: true,
      enableTypeChecking: true,
      strictMode: false,
      experimentalFeatures: false,
      debugMode: false
    },
    
    // Build Settings
    build: {
      target: 'es2020',
      minify: true,
      sourceMaps: true,
      bundleAnalyzer: false,
      optimization: 'balanced',
      outputDir: 'dist',
      publicPath: '/',
      generateSW: false
    },
    
    // AI Settings
    ai: {
      preferredModel: 'gemini',
      codeStyle: 'clean',
      commentLevel: 'moderate',
      testGeneration: true,
      documentationGeneration: true,
      optimizationLevel: 'standard',
      securityChecks: true,
      performanceOptimization: false
    },
    
    // Collaboration Settings
    collaboration: {
      enableRealTimeSync: true,
      allowComments: true,
      requireApproval: false,
      autoSave: true,
      autoSaveInterval: 30,
      versionControl: true,
      branchProtection: false,
      codeReview: false
    },
    
    // Deployment Settings
    deployment: {
      provider: 'netlify',
      autoDeployment: false,
      buildCommand: 'npm run build',
      outputDirectory: 'dist',
      environmentVariables: {},
      customDomain: '',
      httpsRedirect: true,
      compressionEnabled: true
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
  };

  const handleSave = () => {
    onSettingsChange(settings);
    toast({
      title: 'Settings Saved',
      description: 'Project settings have been updated successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    onClose();
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      general: {
        name: project?.name || '',
        description: project?.description || '',
        type: project?.type || 'web-app',
        framework: project?.framework || 'react',
        language: project?.language || 'typescript',
        version: project?.version || '1.0.0',
        license: 'MIT',
        repository: '',
        homepage: '',
        keywords: []
      },
      development: {
        enableHotReload: true,
        enableSourceMaps: true,
        enableLinting: true,
        enablePrettier: true,
        enableTypeChecking: true,
        strictMode: false,
        experimentalFeatures: false,
        debugMode: false
      },
      build: {
        target: 'es2020',
        minify: true,
        sourceMaps: true,
        bundleAnalyzer: false,
        optimization: 'balanced',
        outputDir: 'dist',
        publicPath: '/',
        generateSW: false
      },
      ai: {
        preferredModel: 'gemini',
        codeStyle: 'clean',
        commentLevel: 'moderate',
        testGeneration: true,
        documentationGeneration: true,
        optimizationLevel: 'standard',
        securityChecks: true,
        performanceOptimization: false
      },
      collaboration: {
        enableRealTimeSync: true,
        allowComments: true,
        requireApproval: false,
        autoSave: true,
        autoSaveInterval: 30,
        versionControl: true,
        branchProtection: false,
        codeReview: false
      },
      deployment: {
        provider: 'netlify',
        autoDeployment: false,
        buildCommand: 'npm run build',
        outputDirectory: 'dist',
        environmentVariables: {},
        customDomain: '',
        httpsRedirect: true,
        compressionEnabled: true
      }
    });
    
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to defaults',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6} height="100%" overflow="auto">
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Project Settings</Heading>
            <Text color="gray.600">Configure your project preferences and build options</Text>
          </VStack>
          <HStack>
            <Button variant="outline" onClick={handleReset}>
              Reset to Defaults
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSave}>
              Save Settings
            </Button>
          </HStack>
        </HStack>

        <Tabs variant="enclosed">
          <TabList>
            <Tab>General</Tab>
            <Tab>Development</Tab>
            <Tab>Build</Tab>
            <Tab>AI Assistant</Tab>
            <Tab>Collaboration</Tab>
            <Tab>Deployment</Tab>
          </TabList>

          <TabPanels>
            {/* General Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">General Project Information</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Project Name</FormLabel>
                    <Input
                      value={settings.general.name}
                      onChange={(e) => updateSetting('general', 'name', e.target.value)}
                      placeholder="Enter project name"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Version</FormLabel>
                    <Input
                      value={settings.general.version}
                      onChange={(e) => updateSetting('general', 'version', e.target.value)}
                      placeholder="1.0.0"
                    />
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={settings.general.description}
                    onChange={(e) => updateSetting('general', 'description', e.target.value)}
                    placeholder="Describe your project..."
                    rows={3}
                  />
                </FormControl>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Project Type</FormLabel>
                    <Select
                      value={settings.general.type}
                      onChange={(e) => updateSetting('general', 'type', e.target.value)}
                    >
                      <option value="web-app">Web Application</option>
                      <option value="mobile-app">Mobile Application</option>
                      <option value="desktop-app">Desktop Application</option>
                      <option value="api">API Service</option>
                      <option value="library">Library/Package</option>
                      <option value="game">Game</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Framework</FormLabel>
                    <Select
                      value={settings.general.framework}
                      onChange={(e) => updateSetting('general', 'framework', e.target.value)}
                    >
                      <option value="react">React</option>
                      <option value="vue">Vue.js</option>
                      <option value="angular">Angular</option>
                      <option value="svelte">Svelte</option>
                      <option value="express">Express.js</option>
                      <option value="fastapi">FastAPI</option>
                      <option value="django">Django</option>
                      <option value="flask">Flask</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Language</FormLabel>
                    <Select
                      value={settings.general.language}
                      onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>License</FormLabel>
                    <Select
                      value={settings.general.license}
                      onChange={(e) => updateSetting('general', 'license', e.target.value)}
                    >
                      <option value="MIT">MIT</option>
                      <option value="Apache-2.0">Apache 2.0</option>
                      <option value="GPL-3.0">GPL 3.0</option>
                      <option value="BSD-3-Clause">BSD 3-Clause</option>
                      <option value="ISC">ISC</option>
                      <option value="Unlicense">Unlicense</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Repository URL</FormLabel>
                    <Input
                      value={settings.general.repository}
                      onChange={(e) => updateSetting('general', 'repository', e.target.value)}
                      placeholder="https://github.com/username/repo"
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Development Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Development Environment</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="medium">Development Features</Text>
                    
                    <HStack justify="space-between">
                      <Text>Hot Reload</Text>
                      <Switch
                        isChecked={settings.development.enableHotReload}
                        onChange={(e) => updateSetting('development', 'enableHotReload', e.target.checked)}
                        colorScheme="teal"
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Source Maps</Text>
                      <Switch
                        isChecked={settings.development.enableSourceMaps}
                        onChange={(e) => updateSetting('development', 'enableSourceMaps', e.target.checked)}
                        colorScheme="teal"
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>ESLint</Text>
                      <Switch
                        isChecked={settings.development.enableLinting}
                        onChange={(e) => updateSetting('development', 'enableLinting', e.target.checked)}
                        colorScheme="teal"
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Prettier</Text>
                      <Switch
                        isChecked={settings.development.enablePrettier}
                        onChange={(e) => updateSetting('development', 'enablePrettier', e.target.checked)}
                        colorScheme="teal"
                      />
                    </HStack>
                  </VStack>

                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="medium">Advanced Options</Text>
                    
                    <HStack justify="space-between">
                      <Text>Type Checking</Text>
                      <Switch
                        isChecked={settings.development.enableTypeChecking}
                        onChange={(e) => updateSetting('development', 'enableTypeChecking', e.target.checked)}
                        colorScheme="teal"
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Strict Mode</Text>
                      <Switch
                        isChecked={settings.development.strictMode}
                        onChange={(e) => updateSetting('development', 'strictMode', e.target.checked)}
                        colorScheme="orange"
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Experimental Features</Text>
                      <Switch
                        isChecked={settings.development.experimentalFeatures}
                        onChange={(e) => updateSetting('development', 'experimentalFeatures', e.target.checked)}
                        colorScheme="red"
                      />
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text>Debug Mode</Text>
                      <Switch
                        isChecked={settings.development.debugMode}
                        onChange={(e) => updateSetting('development', 'debugMode', e.target.checked)}
                        colorScheme="blue"
                      />
                    </HStack>
                  </VStack>
                </SimpleGrid>

                {settings.development.experimentalFeatures && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <AlertDescription>
                      Experimental features may be unstable and could affect development experience.
                    </AlertDescription>
                  </Alert>
                )}
              </VStack>
            </TabPanel>

            {/* Build Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Build Configuration</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Target</FormLabel>
                    <Select
                      value={settings.build.target}
                      onChange={(e) => updateSetting('build', 'target', e.target.value)}
                    >
                      <option value="es5">ES5</option>
                      <option value="es2015">ES2015</option>
                      <option value="es2017">ES2017</option>
                      <option value="es2020">ES2020</option>
                      <option value="esnext">ESNext</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Optimization</FormLabel>
                    <Select
                      value={settings.build.optimization}
                      onChange={(e) => updateSetting('build', 'optimization', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="basic">Basic</option>
                      <option value="balanced">Balanced</option>
                      <option value="aggressive">Aggressive</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Output Directory</FormLabel>
                    <Input
                      value={settings.build.outputDir}
                      onChange={(e) => updateSetting('build', 'outputDir', e.target.value)}
                      placeholder="dist"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Public Path</FormLabel>
                    <Input
                      value={settings.build.publicPath}
                      onChange={(e) => updateSetting('build', 'publicPath', e.target.value)}
                      placeholder="/"
                    />
                  </FormControl>
                </SimpleGrid>

                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="medium">Build Options</Text>
                  
                  <HStack justify="space-between">
                    <Text>Minification</Text>
                    <Switch
                      isChecked={settings.build.minify}
                      onChange={(e) => updateSetting('build', 'minify', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Source Maps</Text>
                    <Switch
                      isChecked={settings.build.sourceMaps}
                      onChange={(e) => updateSetting('build', 'sourceMaps', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Bundle Analyzer</Text>
                    <Switch
                      isChecked={settings.build.bundleAnalyzer}
                      onChange={(e) => updateSetting('build', 'bundleAnalyzer', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Service Worker</Text>
                    <Switch
                      isChecked={settings.build.generateSW}
                      onChange={(e) => updateSetting('build', 'generateSW', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* AI Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">AI Assistant Configuration</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Preferred Model</FormLabel>
                    <Select
                      value={settings.ai.preferredModel}
                      onChange={(e) => updateSetting('ai', 'preferredModel', e.target.value)}
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="gpt-4">OpenAI GPT-4</option>
                      <option value="claude">Anthropic Claude</option>
                      <option value="ollama">Ollama (Local)</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Code Style</FormLabel>
                    <Select
                      value={settings.ai.codeStyle}
                      onChange={(e) => updateSetting('ai', 'codeStyle', e.target.value)}
                    >
                      <option value="clean">Clean & Readable</option>
                      <option value="compact">Compact</option>
                      <option value="functional">Functional</option>
                      <option value="object-oriented">Object-Oriented</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>

                <FormControl>
                  <FormLabel>Comment Level</FormLabel>
                  <Select
                    value={settings.ai.commentLevel}
                    onChange={(e) => updateSetting('ai', 'commentLevel', e.target.value)}
                  >
                    <option value="minimal">Minimal</option>
                    <option value="moderate">Moderate</option>
                    <option value="detailed">Detailed</option>
                    <option value="comprehensive">Comprehensive</option>
                  </Select>
                </FormControl>

                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="medium">AI Features</Text>
                  
                  <HStack justify="space-between">
                    <Text>Test Generation</Text>
                    <Switch
                      isChecked={settings.ai.testGeneration}
                      onChange={(e) => updateSetting('ai', 'testGeneration', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Documentation Generation</Text>
                    <Switch
                      isChecked={settings.ai.documentationGeneration}
                      onChange={(e) => updateSetting('ai', 'documentationGeneration', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Security Checks</Text>
                    <Switch
                      isChecked={settings.ai.securityChecks}
                      onChange={(e) => updateSetting('ai', 'securityChecks', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Performance Optimization</Text>
                    <Switch
                      isChecked={settings.ai.performanceOptimization}
                      onChange={(e) => updateSetting('ai', 'performanceOptimization', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Collaboration Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Collaboration & Sharing</Heading>
                
                <FormControl>
                  <FormLabel>Auto-save Interval (seconds): {settings.collaboration.autoSaveInterval}</FormLabel>
                  <Slider
                    value={settings.collaboration.autoSaveInterval}
                    onChange={(value) => updateSetting('collaboration', 'autoSaveInterval', value)}
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
                  <Text fontWeight="medium">Collaboration Features</Text>
                  
                  <HStack justify="space-between">
                    <Text>Real-time Sync</Text>
                    <Switch
                      isChecked={settings.collaboration.enableRealTimeSync}
                      onChange={(e) => updateSetting('collaboration', 'enableRealTimeSync', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Allow Comments</Text>
                    <Switch
                      isChecked={settings.collaboration.allowComments}
                      onChange={(e) => updateSetting('collaboration', 'allowComments', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Require Approval</Text>
                    <Switch
                      isChecked={settings.collaboration.requireApproval}
                      onChange={(e) => updateSetting('collaboration', 'requireApproval', e.target.checked)}
                      colorScheme="orange"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Auto Save</Text>
                    <Switch
                      isChecked={settings.collaboration.autoSave}
                      onChange={(e) => updateSetting('collaboration', 'autoSave', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Version Control</Text>
                    <Switch
                      isChecked={settings.collaboration.versionControl}
                      onChange={(e) => updateSetting('collaboration', 'versionControl', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Branch Protection</Text>
                    <Switch
                      isChecked={settings.collaboration.branchProtection}
                      onChange={(e) => updateSetting('collaboration', 'branchProtection', e.target.checked)}
                      colorScheme="red"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Code Review</Text>
                    <Switch
                      isChecked={settings.collaboration.codeReview}
                      onChange={(e) => updateSetting('collaboration', 'codeReview', e.target.checked)}
                      colorScheme="blue"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>

            {/* Deployment Settings */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading size="md">Deployment Configuration</Heading>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Provider</FormLabel>
                    <Select
                      value={settings.deployment.provider}
                      onChange={(e) => updateSetting('deployment', 'provider', e.target.value)}
                    >
                      <option value="netlify">Netlify</option>
                      <option value="vercel">Vercel</option>
                      <option value="github-pages">GitHub Pages</option>
                      <option value="aws">AWS</option>
                      <option value="azure">Azure</option>
                      <option value="gcp">Google Cloud</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Build Command</FormLabel>
                    <Input
                      value={settings.deployment.buildCommand}
                      onChange={(e) => updateSetting('deployment', 'buildCommand', e.target.value)}
                      placeholder="npm run build"
                    />
                  </FormControl>
                </SimpleGrid>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel>Output Directory</FormLabel>
                    <Input
                      value={settings.deployment.outputDirectory}
                      onChange={(e) => updateSetting('deployment', 'outputDirectory', e.target.value)}
                      placeholder="dist"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Custom Domain</FormLabel>
                    <Input
                      value={settings.deployment.customDomain}
                      onChange={(e) => updateSetting('deployment', 'customDomain', e.target.value)}
                      placeholder="example.com"
                    />
                  </FormControl>
                </SimpleGrid>

                <VStack align="stretch" spacing={3}>
                  <Text fontWeight="medium">Deployment Options</Text>
                  
                  <HStack justify="space-between">
                    <Text>Auto Deployment</Text>
                    <Switch
                      isChecked={settings.deployment.autoDeployment}
                      onChange={(e) => updateSetting('deployment', 'autoDeployment', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>HTTPS Redirect</Text>
                    <Switch
                      isChecked={settings.deployment.httpsRedirect}
                      onChange={(e) => updateSetting('deployment', 'httpsRedirect', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                  
                  <HStack justify="space-between">
                    <Text>Compression</Text>
                    <Switch
                      isChecked={settings.deployment.compressionEnabled}
                      onChange={(e) => updateSetting('deployment', 'compressionEnabled', e.target.checked)}
                      colorScheme="teal"
                    />
                  </HStack>
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  );
};

export default ProjectSettings;