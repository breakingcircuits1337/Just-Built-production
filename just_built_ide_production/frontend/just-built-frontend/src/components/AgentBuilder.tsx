import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
  Divider
} from '@chakra-ui/react';

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  purpose: string;
  securityLevel: string;
  customInstructions: string;
}

interface AgentBuilderProps {
  onAgentCreate: (agent: AgentConfig) => void;
  isCybersecurityMode: boolean;
}

const AgentBuilder: React.FC<AgentBuilderProps> = ({ onAgentCreate, isCybersecurityMode }) => {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    model: 'gemini',
    purpose: 'general',
    securityLevel: 'standard',
    customInstructions: ''
  });
  
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgentConfig({
      ...agentConfig,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!agentConfig.name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please provide a name for your agent',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    // Create the agent
    onAgentCreate(agentConfig);
    
    toast({
      title: 'Agent Created',
      description: `${agentConfig.name} has been successfully created`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Reset form for next agent
    setAgentConfig({
      name: '',
      description: '',
      model: 'gemini',
      purpose: 'general',
      securityLevel: 'standard',
      customInstructions: ''
    });
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" width="100%">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Custom Agent Builder</Heading>
        
        {isCybersecurityMode && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Cybersecurity Mode enabled. This agent will be configured for ethical security development and defensive purposes only.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Agent Name</FormLabel>
              <Input 
                name="name"
                value={agentConfig.name}
                onChange={handleInputChange}
                placeholder="Enter a name for your agent"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea 
                name="description"
                value={agentConfig.description}
                onChange={handleInputChange}
                placeholder="Describe what this agent will do"
                rows={3}
              />
            </FormControl>
            
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Base Model</FormLabel>
                <Select 
                  name="model"
                  value={agentConfig.model}
                  onChange={handleInputChange}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="mistral">Mistral AI</option>
                  <option value="groq">Groq</option>
                  <option value="ollama">Ollama (Local)</option>
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Primary Purpose</FormLabel>
                <Select 
                  name="purpose"
                  value={agentConfig.purpose}
                  onChange={handleInputChange}
                >
                  <option value="general">General Development</option>
                  <option value="frontend">Frontend Specialist</option>
                  <option value="backend">Backend Specialist</option>
                  <option value="fullstack">Full Stack Development</option>
                  {isCybersecurityMode && (
                    <>
                      <option value="security-audit">Security Auditing</option>
                      <option value="vulnerability-assessment">Vulnerability Assessment</option>
                      <option value="defensive-coding">Defensive Coding Practices</option>
                    </>
                  )}
                </Select>
              </FormControl>
            </HStack>
            
            {isCybersecurityMode && (
              <FormControl isRequired>
                <FormLabel>Security Level</FormLabel>
                <Select 
                  name="securityLevel"
                  value={agentConfig.securityLevel}
                  onChange={handleInputChange}
                >
                  <option value="standard">Standard (General Security Practices)</option>
                  <option value="enhanced">Enhanced (Detailed Security Analysis)</option>
                  <option value="maximum">Maximum (Comprehensive Security Focus)</option>
                </Select>
              </FormControl>
            )}
            
            <FormControl>
              <FormLabel>Custom Instructions</FormLabel>
              <Textarea 
                name="customInstructions"
                value={agentConfig.customInstructions}
                onChange={handleInputChange}
                placeholder="Add any specific instructions for your agent"
                rows={5}
              />
            </FormControl>
            
            <Divider />
            
            <Box>
              <Text fontWeight="medium" mb={2}>Agent Configuration Summary:</Text>
              <HStack wrap="wrap" spacing={2}>
                <Badge colorScheme="purple">{agentConfig.model}</Badge>
                <Badge colorScheme="blue">{agentConfig.purpose}</Badge>
                {isCybersecurityMode && (
                  <Badge colorScheme="green">Ethical Security Focus</Badge>
                )}
                {agentConfig.securityLevel !== 'standard' && (
                  <Badge colorScheme="orange">{agentConfig.securityLevel} Security</Badge>
                )}
              </HStack>
            </Box>
            
            <Button type="submit" colorScheme="teal" alignSelf="flex-start">
              Create Agent
            </Button>
          </VStack>
        </form>
      </VStack>
    </Box>
  );
};

export default AgentBuilder;
