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
  CheckboxGroup, 
  VStack,
  Badge,
  Divider,
  Button,
  useToast
} from '@chakra-ui/react';

interface LLMModel {
  id: string;
  name: string;
  available: boolean;
  endpoint?: string;
}

interface LLMSelectorProps {
  onModelSelect: (models: string[]) => void;
}

const LLMSelector: React.FC<LLMSelectorProps> = ({ onModelSelect }) => {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gemini']);
  const [mixtureMode, setMixtureMode] = useState<boolean>(false);
  const [isCybersecurityMode, setIsCybersecurityMode] = useState<boolean>(false);
  const toast = useToast();

  useEffect(() => {
    // In a real implementation, this would fetch from the backend API
    const fetchModels = async () => {
      try {
        // Mock data for now - would be replaced with actual API call
        const mockModels: LLMModel[] = [
          { id: 'gemini', name: 'Google Gemini', available: true },
          { id: 'mistral', name: 'Mistral AI', available: true },
          { id: 'groq', name: 'Groq', available: true },
          { id: 'ollama', name: 'Ollama (Local)', available: true, endpoint: '127.0.0.1:9632' }
        ];
        setModels(mockModels);
      } catch (error) {
        console.error('Failed to fetch LLM models:', error);
        toast({
          title: 'Error fetching models',
          description: 'Could not load available LLM models',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchModels();
  }, [toast]);

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

  const applyModelSelection = () => {
    onModelSelect(selectedModels);
    
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

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" width="100%">
      <Stack spacing={4}>
        <Heading size="md">LLM Configuration</Heading>
        
        <Box>
          <Stack direction="row" justify="space-between" align="center" mb={2}>
            <Text fontWeight="medium">Mixture Mode</Text>
            <Switch 
              isChecked={mixtureMode} 
              onChange={handleMixtureModeToggle} 
              colorScheme="teal"
            />
          </Stack>
          <Text fontSize="sm" color="gray.600">
            {mixtureMode 
              ? 'Multiple LLMs will collaborate to build your application (select up to 4)' 
              : 'Single LLM will handle the entire development process'}
          </Text>
        </Box>
        
        <Box>
          <Stack direction="row" justify="space-between" align="center" mb={2}>
            <Text fontWeight="medium">Cybersecurity Mode</Text>
            <Switch 
              isChecked={isCybersecurityMode} 
              onChange={handleCybersecurityModeToggle} 
              colorScheme="blue"
            />
          </Stack>
          <Text fontSize="sm" color="gray.600">
            Specialized agent for ethical security development and defensive purposes
          </Text>
          {isCybersecurityMode && (
            <Badge colorScheme="blue" mt={2}>
              White Hat Security Development Enabled
            </Badge>
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
              >
                <CardHeader pb={2}>
                  <Stack direction="row" justify="space-between" align="center">
                    <Heading size="sm">{model.name}</Heading>
                    {mixtureMode ? (
                      <Checkbox 
                        isChecked={selectedModels.includes(model.id)}
                        colorScheme="teal"
                        onChange={() => {}}
                      />
                    ) : (
                      <Box 
                        w={4} 
                        h={4} 
                        borderRadius="full" 
                        borderWidth={1}
                        borderColor="teal.500"
                        bg={selectedModels.includes(model.id) ? 'teal.500' : 'transparent'}
                      />
                    )}
                  </Stack>
                </CardHeader>
                <CardBody pt={0}>
                  <Text fontSize="sm" color="gray.600">
                    {model.id === 'ollama' 
                      ? `Local model at ${model.endpoint}` 
                      : `Cloud-based ${model.name} model`}
                  </Text>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
        
        <Button 
          colorScheme="teal" 
          onClick={applyModelSelection}
          isDisabled={selectedModels.length === 0}
        >
          Apply Configuration
        </Button>
      </Stack>
    </Box>
  );
};

export default LLMSelector;
