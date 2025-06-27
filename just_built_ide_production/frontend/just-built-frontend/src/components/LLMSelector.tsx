import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Card, 
  CardBody, 
  CardHeader, 
  Stack, 
  Switch, 
  Text, 
  Checkbox, 
  Badge,
  Divider,
  Button,
  useToast,
  Progress,
  HStack,
  VStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { llmApi } from '../services/api';

interface LLMModel {
  id: string;
  name: string;
  available: boolean;
  endpoint?: string;
  description?: string;
  capabilities?: string[];
  pricing?: string;
}

interface LLMConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

interface LLMSelectorProps {
  onModelSelect: (models: string[], config?: LLMConfig) => void;
}

const LLMSelector: React.FC<LLMSelectorProps> = ({ onModelSelect }) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini']);
  const [mixtureMode, setMixtureMode] = useState<boolean>(false);
  const [isCybersecurityMode, setIsCybersecurityMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [config, setConfig] = useState<LLMConfig>({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: ''
  });
  const toast = useToast();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoading(true);
        const response = await llmApi.getModels();
        
        // Enhanced model data with descriptions and capabilities
        const enhancedModels = response.data.models.map((model: LLMModel) => ({
          ...model,
          description: getModelDescription(model.id),
          capabilities: getModelCapabilities(model.id),
          pricing: getModelPricing(model.id)
        }));
        
        setModels(enhancedModels);
      } catch (error) {
        console.error('Failed to fetch LLM models:', error);
        toast({
          title: 'Error fetching models',
          description: 'Could not load available LLM models',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [toast]);

  const getModelDescription = (modelId: string): string => {
    const descriptions: Record<string, string> = {
      'gemini': 'Google\'s advanced multimodal AI model with strong reasoning capabilities',
      'gpt-4': 'OpenAI\'s most capable model with excellent code generation and reasoning',
      'claude': 'Anthropic\'s helpful, harmless, and honest AI assistant',
      'ollama': 'Run open-source models locally for privacy and control'
    };
    return descriptions[modelId] || 'Advanced language model for code generation';
  };

  const getModelCapabilities = (modelId: string): string[] => {
    const capabilities: Record<string, string[]> = {
      'gemini': ['Code Generation', 'Multimodal', 'Reasoning', 'Analysis'],
      'gpt-4': ['Code Generation', 'Problem Solving', 'Documentation', 'Debugging'],
      'claude': ['Code Review', 'Explanation', 'Safety', 'Reasoning'],
      'ollama': ['Privacy', 'Local Processing', 'Customizable', 'Offline']
    };
    return capabilities[modelId] || ['Code Generation'];
  };

  const getModelPricing = (modelId: string): string => {
    const pricing: Record<string, string> = {
      'gemini': 'Pay per use',
      'gpt-4': 'Premium',
      'claude': 'Pay per use',
      'ollama': 'Free (Local)'
    };
    return pricing[modelId] || 'Contact for pricing';
  };

  const handleModelChange = (modelId: string) => {
    if (mixtureMode) {
      // In mixture mode, allow multiple selections (up to 4)
      if (selectedModels.includes(modelId)) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      } else {
        if (selectedModels.length < 4) {
          setSelectedModels([...selectedModels, modelId]);
        } else {
          toast({
            title: 'Maximum models reached',
            description: 'Mixture mode supports up to 4 models',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } else {
      // In single model mode, only allow one selection
      setSelectedModels([modelId]);
    }
  };

  const handleMixtureModeToggle = () => {
    const newMixtureMode = !mixtureMode;
    setMixtureMode(newMixtureMode);
    
    // If turning off mixture mode, keep only the first selected model
    if (!newMixtureMode && selectedModels.length > 1) {
      setSelectedModels([selectedModels[0]]);
    }
  };

  const handleCybersecurityModeToggle = () => {
    setIsCybersecurityMode(!isCybersecurityMode);
    
    if (!isCybersecurityMode) {
      // Enable cybersecurity mode - update system prompt
      setConfig(prev => ({
        ...prev,
        systemPrompt: prev.systemPrompt + '\n\nYou are operating in cybersecurity mode. Focus on defensive security practices, ethical hacking techniques, and secure coding patterns. Always prioritize security best practices and explain potential vulnerabilities.'
      }));
    } else {
      // Disable cybersecurity mode - remove security-specific prompt
      setConfig(prev => ({
        ...prev,
        systemPrompt: prev.systemPrompt.replace(/\n\nYou are operating in cybersecurity mode.*/, '')
      }));
    }
    
    toast({
      title: isCybersecurityMode ? 'Standard Mode' : 'Cybersecurity Mode',
      description: isCybersecurityMode 
        ? 'Switched to standard development mode' 
        : 'Switched to ethical cybersecurity mode for defensive security development',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleConfigChange = (field: keyof LLMConfig, value: number | string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyModelSelection = () => {
    if (selectedModels.length === 0) {
      toast({
        title: 'No model selected',
        description: 'Please select at least one model',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onModelSelect(selectedModels, config);
    
    toast({
      title: 'LLM Configuration Updated',
      description: mixtureMode 
        ? `Using ${selectedModels.length} models in mixture mode` 
        : `Using ${models.find(m => m.id === selectedModels[0])?.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const resetToDefaults = () => {
    setConfig({
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0,
      presencePenalty: 0,
      systemPrompt: ''
    });
    toast({
      title: 'Configuration Reset',
      description: 'All settings have been reset to defaults',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  if (isLoading) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" width="100%">
        <VStack spacing={4}>
          <Heading size="md">Loading Models...</Heading>
          <Progress size="lg" isIndeterminate colorScheme="teal" width="100%" />
        </VStack>
      </Box>
    );
  }

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" width="100%">
      <VStack spacing={4} align="stretch">
        <Heading size="md">LLM Configuration</Heading>
        
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontWeight="medium">Mixture Mode</Text>
            <Switch 
              isChecked={mixtureMode} 
              onChange={handleMixtureModeToggle} 
              colorScheme="teal"
            />
          </HStack>
          <Text fontSize="sm" color="gray.600">
            {mixtureMode 
              ? 'Multiple LLMs will collaborate to build your application (select up to 4)' 
              : 'Single LLM will handle the entire development process'}
          </Text>
        </Box>
        
        <Box>
          <HStack justify="space-between" align="center" mb={2}>
            <Text fontWeight="medium">Cybersecurity Mode</Text>
            <Switch 
              isChecked={isCybersecurityMode} 
              onChange={handleCybersecurityModeToggle} 
              colorScheme="blue"
            />
          </HStack>
          <Text fontSize="sm" color="gray.600">
            Specialized configuration for ethical security development and defensive purposes
          </Text>
          {isCybersecurityMode && (
            <Alert status="info" mt={2} borderRadius="md">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                White Hat Security Development Mode: Focus on defensive security practices and ethical hacking techniques.
              </AlertDescription>
            </Alert>
          )}
        </Box>
        
        <Divider />
        
        <Box>
          <Text fontWeight="medium" mb={3}>
            {mixtureMode ? 'Select Models (up to 4):' : 'Select Model:'}
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {models.map((model) => (
              <Card 
                key={model.id}
                variant={selectedModels.includes(model.id) ? 'filled' : 'outline'}
                borderColor={selectedModels.includes(model.id) ? 'teal.500' : 'gray.200'}
                bg={selectedModels.includes(model.id) ? 'teal.50' : 'white'}
                cursor="pointer"
                onClick={() => handleModelChange(model.id)}
                _hover={{ borderColor: 'teal.300' }}
                transition="all 0.2s"
              >
                <CardHeader pb={2}>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Heading size="sm">{model.name}</Heading>
                      <Badge colorScheme={model.available ? 'green' : 'red'} size="sm">
                        {model.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </VStack>
                    {mixtureMode ? (
                      <Checkbox 
                        isChecked={selectedModels.includes(model.id)}
                        colorScheme="teal"
                        onChange={() => {}}
                        isDisabled={!model.available}
                      />
                    ) : (
                      <Box 
                        w={4} 
                        h={4} 
                        borderRadius="full" 
                        borderWidth={2}
                        borderColor="teal.500"
                        bg={selectedModels.includes(model.id) ? 'teal.500' : 'transparent'}
                      />
                    )}
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="start" spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      {model.description}
                    </Text>
                    <HStack wrap="wrap" spacing={1}>
                      {model.capabilities?.map(capability => (
                        <Badge key={capability} size="sm" colorScheme="blue">
                          {capability}
                        </Badge>
                      ))}
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {model.pricing}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
        
        <Divider />
        
        <Box>
          <Text fontWeight="medium" mb={4}>Advanced Configuration</Text>
          
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel fontSize="sm">Temperature: {config.temperature}</FormLabel>
              <Slider
                value={config.temperature}
                onChange={(value) => handleConfigChange('temperature', value)}
                min={0}
                max={2}
                step={0.1}
              >
                <SliderMark value={0} mt="2" ml="-2" fontSize="xs">Conservative</SliderMark>
                <SliderMark value={2} mt="2" ml="-2" fontSize="xs">Creative</SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">Max Tokens: {config.maxTokens}</FormLabel>
              <Slider
                value={config.maxTokens}
                onChange={(value) => handleConfigChange('maxTokens', value)}
                min={256}
                max={8192}
                step={256}
              >
                <SliderMark value={256} mt="2" ml="-2" fontSize="xs">Short</SliderMark>
                <SliderMark value={8192} mt="2" ml="-2" fontSize="xs">Long</SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="sm">System Prompt</FormLabel>
              <Textarea
                value={config.systemPrompt}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                placeholder="Enter custom instructions for the AI..."
                rows={4}
                fontSize="sm"
              />
            </FormControl>
          </VStack>
        </Box>
        
        <Divider />
        
        <HStack justify="space-between">
          <Button 
            variant="outline"
            onClick={resetToDefaults}
            size="sm"
          >
            Reset to Defaults
          </Button>
          <Button 
            colorScheme="teal" 
            onClick={applyModelSelection}
            isDisabled={selectedModels.length === 0}
          >
            Apply Configuration
          </Button>
        </HStack>
        
        {selectedModels.length > 0 && (
          <Box p={3} bg="white" borderRadius="md" borderWidth="1px">
            <Text fontSize="sm" fontWeight="medium" mb={2}>Current Selection:</Text>
            <HStack wrap="wrap" spacing={2}>
              {selectedModels.map(modelId => {
                const model = models.find(m => m.id === modelId);
                return (
                  <Badge key={modelId} colorScheme="teal">
                    {model?.name || modelId}
                  </Badge>
                );
              })}
              {mixtureMode && (
                <Badge colorScheme="purple">Mixture Mode</Badge>
              )}
              {isCybersecurityMode && (
                <Badge colorScheme="orange">Security Mode</Badge>
              )}
            </HStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default LLMSelector;