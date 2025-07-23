import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Flex,
  Spacer,
  Badge,
  IconButton,
  Tooltip,
  useToast,
  Textarea,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { FiSend, FiMic, FiMicOff, FiRefreshCw, FiSettings, FiMessageSquare, FiCode, FiHelpCircle } from 'react-icons/fi';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    confidence?: number;
  };
}

interface AIAssistantProps {
  onCodeGenerate?: (code: string) => void;
  onStepSuggest?: (steps: any[]) => void;
  currentContext?: {
    project?: string;
    code?: string;
    language?: string;
  };
}

const AIAssistant: React.FC<AIAssistantProps> = ({ 
  onCodeGenerate, 
  onStepSuggest, 
  currentContext 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI development assistant. I can help you with code generation, debugging, planning, and answering development questions. How can I assist you today?',
      timestamp: new Date(),
      metadata: { model: 'gemini', confidence: 0.95 }
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  const [assistantMode, setAssistantMode] = useState<'chat' | 'code' | 'plan'>('chat');
  const [enableVoice] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Simulate AI response based on mode and context
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const response = await generateAIResponse(inputMessage, assistantMode);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          model: selectedModel,
          tokens: Math.floor(Math.random() * 500) + 100,
          confidence: 0.85 + Math.random() * 0.15
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle special responses
      if (response.code && onCodeGenerate) {
        onCodeGenerate(response.code);
      }
      if (response.steps && onStepSuggest) {
        onStepSuggest(response.steps);
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (input: string, mode: string) => {
    const lowerInput = input.toLowerCase();
    
    if (mode === 'code' || lowerInput.includes('code') || lowerInput.includes('function') || lowerInput.includes('component')) {
      return {
        content: `I'll help you with that code. Here's a solution based on your request:

\`\`\`javascript
// Generated code based on your request
function handleUserRequest() {
  // Implementation details
  console.log('Processing your request...');
  
  // Add your specific logic here
  return {
    success: true,
    message: 'Request processed successfully'
  };
}

// Usage example
const result = handleUserRequest();
console.log(result);
\`\`\`

This code provides a basic structure for your request. Would you like me to modify or expand on any part of it?`,
        code: `function handleUserRequest() {
  console.log('Processing your request...');
  return {
    success: true,
    message: 'Request processed successfully'
  };
}`
      };
    }
    
    if (mode === 'plan' || lowerInput.includes('plan') || lowerInput.includes('steps') || lowerInput.includes('how to')) {
      return {
        content: `Based on your request, here's a suggested development plan:

1. **Planning & Setup** (15 minutes)
   - Define requirements and scope
   - Set up development environment
   - Initialize project structure

2. **Core Implementation** (30 minutes)
   - Implement main functionality
   - Add error handling
   - Write basic tests

3. **UI/UX Development** (20 minutes)
   - Create user interface
   - Add styling and responsive design
   - Implement user interactions

4. **Testing & Optimization** (15 minutes)
   - Test functionality thoroughly
   - Optimize performance
   - Fix any issues

5. **Documentation & Deployment** (10 minutes)
   - Add documentation
   - Prepare for deployment
   - Final review

Would you like me to elaborate on any of these steps or adjust the plan?`,
        steps: [
          { title: 'Planning & Setup', description: 'Define requirements and set up environment', estimatedTime: '15 minutes' },
          { title: 'Core Implementation', description: 'Implement main functionality', estimatedTime: '30 minutes' },
          { title: 'UI/UX Development', description: 'Create user interface', estimatedTime: '20 minutes' },
          { title: 'Testing & Optimization', description: 'Test and optimize', estimatedTime: '15 minutes' },
          { title: 'Documentation & Deployment', description: 'Document and deploy', estimatedTime: '10 minutes' }
        ]
      };
    }
    
    // General chat responses
    const responses = [
      `I understand you're asking about "${input}". Let me help you with that.

Based on your current context${currentContext?.project ? ` (working on ${currentContext.project})` : ''}, I can suggest several approaches:

• **Approach 1**: Start with a simple implementation and iterate
• **Approach 2**: Use established patterns and best practices  
• **Approach 3**: Consider performance and scalability from the beginning

Would you like me to elaborate on any of these approaches or provide specific code examples?`,

      `Great question! For "${input}", here are some key considerations:

**Technical Aspects:**
- Choose the right tools and frameworks
- Consider maintainability and scalability
- Follow coding best practices

**Implementation Strategy:**
- Break down into smaller, manageable tasks
- Test incrementally as you build
- Document your decisions and code

**Best Practices:**
- Use version control effectively
- Write clean, readable code
- Consider edge cases and error handling

Is there a specific aspect you'd like me to focus on?`,

      `I can help you with "${input}". Here's my analysis:

**Current Situation:**
${currentContext?.language ? `You're working with ${currentContext.language}` : 'You\'re starting a new development task'}

**Recommendations:**
1. Start with a clear understanding of requirements
2. Choose appropriate tools and technologies
3. Plan your implementation approach
4. Consider testing and validation strategies

**Next Steps:**
- Define specific goals and success criteria
- Identify potential challenges and solutions
- Create a timeline for implementation

Would you like me to help you with any specific part of this process?`
    ];
    
    return {
      content: responses[Math.floor(Math.random() * responses.length)]
    };
  };

  const handleVoiceToggle = () => {
    if (!enableVoice) {
      toast({
        title: 'Voice not available',
        description: 'Voice input is not available in this demo',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsListening(!isListening);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'assistant',
        content: 'Chat cleared! How can I help you with your development work?',
        timestamp: new Date(),
        metadata: { model: selectedModel, confidence: 0.95 }
      }
    ]);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'code': return <FiCode />;
      case 'plan': return <FiHelpCircle />;
      default: return <FiMessageSquare />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'code': return 'blue';
      case 'plan': return 'green';
      default: return 'teal';
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {/* Header */}
      <Box p={4} borderBottom="1px" borderColor="gray.200" bg="white">
        <VStack spacing={3}>
          <Flex width="100%" align="center">
            <HStack>
              <Avatar size="sm" name="AI Assistant" bg="teal.500" />
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">AI Assistant</Text>
                <Text fontSize="xs" color="gray.600">
                  {selectedModel} • {assistantMode} mode
                </Text>
              </VStack>
            </HStack>
            <Spacer />
            <HStack>
              <Tooltip label="Clear chat">
                <IconButton
                  aria-label="Clear chat"
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="ghost"
                  onClick={clearChat}
                />
              </Tooltip>
              <Tooltip label="Settings">
                <IconButton
                  aria-label="Settings"
                  icon={<FiSettings />}
                  size="sm"
                  variant="ghost"
                />
              </Tooltip>
            </HStack>
          </Flex>
          
          <HStack spacing={4} width="100%">
            <FormControl>
              <FormLabel fontSize="xs">Mode</FormLabel>
              <Select
                size="sm"
                value={assistantMode}
                onChange={(e) => setAssistantMode(e.target.value as any)}
              >
                <option value="chat">General Chat</option>
                <option value="code">Code Assistant</option>
                <option value="plan">Planning Helper</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel fontSize="xs">Model</FormLabel>
              <Select
                size="sm"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="gemini">Gemini</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude">Claude</option>
              </Select>
            </FormControl>
          </HStack>
        </VStack>
      </Box>

      {/* Messages */}
      <Box flex="1" overflowY="auto" p={4}>
        <VStack spacing={4} align="stretch">
          {messages.map((message) => (
            <Flex
              key={message.id}
              justify={message.type === 'user' ? 'flex-end' : 'flex-start'}
            >
              <Box
                maxW="80%"
                bg={message.type === 'user' ? 'teal.500' : 'gray.100'}
                color={message.type === 'user' ? 'white' : 'gray.800'}
                p={3}
                borderRadius="lg"
                borderBottomRightRadius={message.type === 'user' ? 'sm' : 'lg'}
                borderBottomLeftRadius={message.type === 'assistant' ? 'sm' : 'lg'}
              >
                <Text fontSize="sm" whiteSpace="pre-wrap">
                  {message.content}
                </Text>
                <HStack justify="space-between" mt={2} spacing={2}>
                  <Text fontSize="xs" opacity={0.7}>
                    {formatTimestamp(message.timestamp)}
                  </Text>
                  {message.metadata && (
                    <HStack spacing={1}>
                      {message.metadata.model && (
                        <Badge size="xs" colorScheme="gray">
                          {message.metadata.model}
                        </Badge>
                      )}
                      {message.metadata.confidence && (
                        <Badge size="xs" colorScheme="green">
                          {Math.round(message.metadata.confidence * 100)}%
                        </Badge>
                      )}
                    </HStack>
                  )}
                </HStack>
              </Box>
            </Flex>
          ))}
          {isLoading && (
            <Flex justify="flex-start">
              <Box
                bg="gray.100"
                p={3}
                borderRadius="lg"
                borderBottomLeftRadius="sm"
              >
                <Text fontSize="sm" color="gray.600">
                  AI is thinking...
                </Text>
              </Box>
            </Flex>
          )}
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      {/* Input */}
      <Box p={4} borderTop="1px" borderColor="gray.200" bg="white">
        <VStack spacing={3}>
          <HStack spacing={2} width="100%">
            <Badge colorScheme={getModeColor(assistantMode)} variant="subtle">
              {getModeIcon(assistantMode)}
              <Text ml={1}>{assistantMode}</Text>
            </Badge>
            {currentContext?.project && (
              <Badge colorScheme="purple" variant="outline" fontSize="xs">
                {currentContext.project}
              </Badge>
            )}
            {currentContext?.language && (
              <Badge colorScheme="blue" variant="outline" fontSize="xs">
                {currentContext.language}
              </Badge>
            )}
          </HStack>
          
          <HStack spacing={2} width="100%">
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask me anything about ${assistantMode === 'code' ? 'coding' : assistantMode === 'plan' ? 'planning' : 'development'}...`}
              size="sm"
              resize="none"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <VStack spacing={1}>
              <Tooltip label={isListening ? 'Stop listening' : 'Voice input'}>
                <IconButton
                  aria-label="Voice input"
                  icon={isListening ? <FiMicOff /> : <FiMic />}
                  size="sm"
                  colorScheme={isListening ? 'red' : 'gray'}
                  variant={isListening ? 'solid' : 'outline'}
                  onClick={handleVoiceToggle}
                  isDisabled={!enableVoice}
                />
              </Tooltip>
              <Button
                leftIcon={<FiSend />}
                size="sm"
                colorScheme="teal"
                onClick={handleSendMessage}
                isLoading={isLoading}
                isDisabled={!inputMessage.trim()}
              >
                Send
              </Button>
            </VStack>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default AIAssistant;