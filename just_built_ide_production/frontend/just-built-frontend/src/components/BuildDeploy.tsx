import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  HStack, 
  Button, 
  Text, 
  Radio, 
  RadioGroup,
  Stack,
  Checkbox,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  Divider,
  Badge,
  Progress,
  useToast,
  Alert,
  AlertIcon
} from '@chakra-ui/react';

interface BuildOption {
  id: string;
  name: string;
  description: string;
}

interface BuildDeployProps {
  onBuildStart: (config: BuildConfig) => void;
}

interface BuildConfig {
  type: string;
  platform?: string[];
  optimization: string;
  includeSourceMaps: boolean;
  additionalOptions: string;
}

const BuildDeploy: React.FC<BuildDeployProps> = ({ onBuildStart }) => {
  const [buildType, setBuildType] = useState<string>('web');
  const [platforms, setPlatforms] = useState<string[]>(['windows']);
  const [optimization, setOptimization] = useState<string>('standard');
  const [includeSourceMaps, setIncludeSourceMaps] = useState<boolean>(true);
  const [additionalOptions, setAdditionalOptions] = useState<string>('');
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildProgress, setBuildProgress] = useState<number>(0);
  const toast = useToast();

  const buildOptions: BuildOption[] = [
    { id: 'local', name: 'Local Build', description: 'Build for desktop or mobile applications' },
    { id: 'web', name: 'Web Deployment', description: 'Build for web servers and cloud hosting' },
    { id: 'hybrid', name: 'Hybrid Build', description: 'Build for both local and web environments' }
  ];

  const handlePlatformChange = (platform: string) => {
    if (platforms.includes(platform)) {
      setPlatforms(platforms.filter(p => p !== platform));
    } else {
      setPlatforms([...platforms, platform]);
    }
  };

  const startBuild = () => {
    // Validate build configuration
    if (buildType === 'local' && platforms.length === 0) {
      toast({
        title: 'Platform required',
        description: 'Please select at least one platform for local build',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const buildConfig: BuildConfig = {
      type: buildType,
      platform: buildType !== 'web' ? platforms : undefined,
      optimization,
      includeSourceMaps,
      additionalOptions
    };

    // Start mock build process
    setIsBuilding(true);
    setBuildProgress(0);

    // Simulate build progress
    const interval = setInterval(() => {
      setBuildProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          
          toast({
            title: 'Build Complete',
            description: `${buildType} build completed successfully`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Notify parent component
          onBuildStart(buildConfig);
          
          return 100;
        }
        return newProgress;
      });
    }, 800);
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" width="100%">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Build & Deployment</Heading>
        
        <Box>
          <Text fontWeight="medium" mb={2}>Build Type</Text>
          <RadioGroup onChange={setBuildType} value={buildType}>
            <Stack direction="column" spacing={3}>
              {buildOptions.map(option => (
                <Radio key={option.id} value={option.id} colorScheme="teal">
                  <Box>
                    <Text fontWeight="medium">{option.name}</Text>
                    <Text fontSize="sm" color="gray.600">{option.description}</Text>
                  </Box>
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </Box>
        
        <Divider />
        
        {(buildType === 'local' || buildType === 'hybrid') && (
          <Box>
            <Text fontWeight="medium" mb={2}>Target Platforms</Text>
            <Stack spacing={2}>
              <Checkbox 
                isChecked={platforms.includes('windows')} 
                onChange={() => handlePlatformChange('windows')}
                colorScheme="blue"
              >
                Windows
              </Checkbox>
              <Checkbox 
                isChecked={platforms.includes('macos')} 
                onChange={() => handlePlatformChange('macos')}
                colorScheme="blue"
              >
                macOS
              </Checkbox>
              <Checkbox 
                isChecked={platforms.includes('linux')} 
                onChange={() => handlePlatformChange('linux')}
                colorScheme="blue"
              >
                Linux
              </Checkbox>
              {buildType === 'hybrid' && (
                <>
                  <Checkbox 
                    isChecked={platforms.includes('android')} 
                    onChange={() => handlePlatformChange('android')}
                    colorScheme="green"
                  >
                    Android
                  </Checkbox>
                  <Checkbox 
                    isChecked={platforms.includes('ios')} 
                    onChange={() => handlePlatformChange('ios')}
                    colorScheme="green"
                  >
                    iOS
                  </Checkbox>
                </>
              )}
            </Stack>
          </Box>
        )}
        
        <FormControl>
          <FormLabel>Optimization Level</FormLabel>
          <Select 
            value={optimization}
            onChange={(e) => setOptimization(e.target.value)}
          >
            <option value="none">None (Fastest Build)</option>
            <option value="standard">Standard (Balanced)</option>
            <option value="maximum">Maximum (Best Performance)</option>
          </Select>
        </FormControl>
        
        <HStack>
          <Checkbox 
            isChecked={includeSourceMaps} 
            onChange={(e) => setIncludeSourceMaps(e.target.checked)}
            colorScheme="teal"
          >
            Include Source Maps
          </Checkbox>
        </HStack>
        
        <FormControl>
          <FormLabel>Additional Build Options</FormLabel>
          <Textarea 
            value={additionalOptions}
            onChange={(e) => setAdditionalOptions(e.target.value)}
            placeholder="Enter any additional build options or flags"
            size="sm"
            rows={3}
          />
        </FormControl>
        
        <Divider />
        
        <Box>
          <Text fontWeight="medium" mb={2}>Build Configuration Summary:</Text>
          <HStack wrap="wrap" spacing={2} mb={3}>
            <Badge colorScheme="purple">{buildOptions.find(o => o.id === buildType)?.name}</Badge>
            {buildType !== 'web' && platforms.map(platform => (
              <Badge key={platform} colorScheme="blue">{platform}</Badge>
            ))}
            <Badge colorScheme="green">{optimization} optimization</Badge>
            {includeSourceMaps && <Badge colorScheme="gray">Source Maps</Badge>}
          </HStack>
          
          {isBuilding ? (
            <Box>
              <Text mb={2}>Building... {buildProgress}%</Text>
              <Progress value={buildProgress} size="sm" colorScheme="teal" borderRadius="md" />
            </Box>
          ) : (
            <Button 
              colorScheme="teal" 
              onClick={startBuild}
              isDisabled={buildType === 'local' && platforms.length === 0}
            >
              Start Build
            </Button>
          )}
        </Box>
        
        {buildProgress === 100 && (
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Build completed successfully! Your application is ready for deployment.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default BuildDeploy;
