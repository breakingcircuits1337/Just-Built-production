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
  Divider,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark
} from '@chakra-ui/react';

interface AgentConfig {
  name: string;
  description: string;
  model: string;
  purpose: string;
  securityLevel: string;
  customInstructions: string;
  expertise: string[];
  codingStyle: string;
  communicationStyle: {
    verbosity: number;
    formality: number;
    useEmojis: boolean;
    technicalLevel: number;
  };
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
    customInstructions: '',
    expertise: [],
    codingStyle: 'clean-readable',
    communicationStyle: {
      verbosity: 5,
      formality: 5,
      useEmojis: false,
      technicalLevel: 5
    }
  });
  
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAgentConfig({
      ...agentConfig,
      [name]: value
    });
  };

  const handleCommunicationStyleChange = (field: string, value: number | boolean) => {
    setAgentConfig({
      ...agentConfig,
      communicationStyle: {
        ...agentConfig.communicationStyle,
        [field]: value
      }
    });
  };

  const handleExpertiseToggle = (expertise: string) => {
    const currentExpertise = agentConfig.expertise;
    const newExpertise = currentExpertise.includes(expertise)
      ? currentExpertise.filter(e => e !== expertise)
      : [...currentExpertise, expertise];
    
    setAgentConfig({
      ...agentConfig,
      expertise: newExpertise
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
      customInstructions: '',
      expertise: [],
      codingStyle: 'clean-readable',
      communicationStyle: {
        verbosity: 5,
        formality: 5,
        useEmojis: false,
        technicalLevel: 5
      }
    });
  };

  const expertiseOptions = [
    'Frontend Development',
    'Backend Development',
    'Full Stack',
    'DevOps',
    'Security',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'UI/UX Design',
    'Testing & QA'
  ];

  const codingStyles = [
    { value: 'clean-readable', label: 'Clean & Readable' },
    { value: 'concise', label: 'Concise' },
    { value: 'functional', label: 'Functional' },
    { value: 'object-oriented', label: 'Object-Oriented' },
    { value: 'performance-focused', label: 'Performance-Focused' }
  ];

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="gray.50" width="100%">
      <VStack spacing={4} align="stretch">
        <Heading size="md">AI Agent Builder</Heading>
        
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
            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Agent Name</FormLabel>
                <Input 
                  name="name"
                  value={agentConfig.name}
                  onChange={handleInputChange}
                  placeholder="Enter a name for your agent"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Base Model</FormLabel>
                <Select 
                  name="model"
                  value={agentConfig.model}
                  onChange={handleInputChange}
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="gpt-4">OpenAI GPT-4</option>
                  <option value="claude">Anthropic Claude</option>
                  <option value="ollama">Ollama (Local)</option>
                </Select>
              </FormControl>
            </HStack>
            
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
                  <option value="devops">DevOps Engineer</option>
                  {isCybersecurityMode && (
                    <>
                      <option value="security-audit">Security Auditing</option>
                      <option value="vulnerability-assessment">Vulnerability Assessment</option>
                      <option value="defensive-coding">Defensive Coding Practices</option>
                    </>
                  )}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Coding Style</FormLabel>
                <Select 
                  name="codingStyle"
                  value={agentConfig.codingStyle}
                  onChange={handleInputChange}
                >
                  {codingStyles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
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
              <FormLabel>Areas of Expertise</FormLabel>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Select areas where this agent should have specialized knowledge:
                </Text>
                <VStack align="stretch" spacing={2}>
                  {expertiseOptions.map(expertise => (
                    <HStack key={expertise} justify="space-between">
                      <Text>{expertise}</Text>
                      <Switch
                        isChecked={agentConfig.expertise.includes(expertise)}
                        onChange={() => handleExpertiseToggle(expertise)}
                        colorScheme="teal"
                      />
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </FormControl>
            
            <Divider />
            
            <Box>
              <Text fontWeight="medium" mb={4}>Communication Style</Text>
              
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Verbosity Level: {agentConfig.communicationStyle.verbosity}</FormLabel>
                  <Slider
                    value={agentConfig.communicationStyle.verbosity}
                    onChange={(value) => handleCommunicationStyleChange('verbosity', value)}
                    min={1}
                    max={10}
                    step={1}
                  >
                    <SliderMark value={1} mt="2" ml="-2" fontSize="sm">Concise</SliderMark>
                    <SliderMark value={10} mt="2" ml="-4" fontSize="sm">Detailed</SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Formality Level: {agentConfig.communicationStyle.formality}</FormLabel>
                  <Slider
                    value={agentConfig.communicationStyle.formality}
                    onChange={(value) => handleCommunicationStyleChange('formality', value)}
                    min={1}
                    max={10}
                    step={1}
                  >
                    <SliderMark value={1} mt="2" ml="-2" fontSize="sm">Casual</SliderMark>
                    <SliderMark value={10} mt="2" ml="-2" fontSize="sm">Formal</SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Technical Level: {agentConfig.communicationStyle.technicalLevel}</FormLabel>
                  <Slider
                    value={agentConfig.communicationStyle.technicalLevel}
                    onChange={(value) => handleCommunicationStyleChange('technicalLevel', value)}
                    min={1}
                    max={10}
                    step={1}
                  >
                    <SliderMark value={1} mt="2" ml="-2" fontSize="sm">Beginner</SliderMark>
                    <SliderMark value={10} mt="2" ml="-2" fontSize="sm">Expert</SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>
                
                <HStack justify="space-between">
                  <Text>Use Emojis</Text>
                  <Switch
                    isChecked={agentConfig.communicationStyle.useEmojis}
                    onChange={(e) => handleCommunicationStyleChange('useEmojis', e.target.checked)}
                    colorScheme="teal"
                  />
                </HStack>
              </VStack>
            </Box>
            
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
                {agentConfig.expertise.map(exp => (
                  <Badge key={exp} colorScheme="green">{exp}</Badge>
                ))}
                {isCybersecurityMode && (
                  <Badge colorScheme="orange">Ethical Security Focus</Badge>
                )}
                {agentConfig.securityLevel !== 'standard' && (
                  <Badge colorScheme="red">{agentConfig.securityLevel} Security</Badge>
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