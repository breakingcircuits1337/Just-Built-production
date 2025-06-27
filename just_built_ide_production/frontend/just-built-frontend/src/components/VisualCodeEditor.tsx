import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Select,
  Input,
  FormControl,
  FormLabel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  ColorPicker,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Badge,
  Tooltip,
  Flex,
  Spacer
} from '@chakra-ui/react';
import { 
  FiSquare, 
  FiType, 
  FiMousePointer, 
  FiImage, 
  FiList, 
  FiGrid,
  FiCode,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiCopy,
  FiMove,
  FiRotateCw
} from 'react-icons/fi';

interface SketchElement {
  id: string;
  type: 'container' | 'text' | 'button' | 'input' | 'image' | 'list' | 'card';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: {
    text?: string;
    placeholder?: string;
    backgroundColor?: string;
    color?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: string;
    borderWidth?: number;
    borderColor?: string;
  };
  children?: string[];
}

interface VisualCodeEditorProps {
  onCodeGenerate: (code: string, framework: string) => void;
  onClose: () => void;
}

const VisualCodeEditor: React.FC<VisualCodeEditorProps> = ({ onCodeGenerate, onClose }) => {
  const [elements, setElements] = useState<SketchElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [targetFramework, setTargetFramework] = useState('react');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const toast = useToast();
  const { isOpen: isPropertiesOpen, onOpen: onPropertiesOpen, onClose: onPropertiesClose } = useDisclosure();

  const tools = [
    { id: 'select', name: 'Select', icon: FiMousePointer },
    { id: 'container', name: 'Container', icon: FiSquare },
    { id: 'text', name: 'Text', icon: FiType },
    { id: 'button', name: 'Button', icon: FiSquare },
    { id: 'input', name: 'Input', icon: FiSquare },
    { id: 'image', name: 'Image', icon: FiImage },
    { id: 'list', name: 'List', icon: FiList },
    { id: 'card', name: 'Card', icon: FiGrid }
  ];

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool === 'select') {
      // Check if clicking on an existing element
      const clickedElement = elements.find(el => 
        x >= el.x && x <= el.x + el.width && 
        y >= el.y && y <= el.y + el.height
      );
      
      if (clickedElement) {
        setSelectedElement(clickedElement.id);
        setDragStart({ x: x - clickedElement.x, y: y - clickedElement.y });
      } else {
        setSelectedElement(null);
      }
    } else {
      // Start drawing new element
      setIsDrawing(true);
      setDragStart({ x, y });
    }
  }, [selectedTool, elements]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !isDrawing || !dragStart) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool !== 'select') {
      // Update preview of new element being drawn
      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);
      const elementX = Math.min(x, dragStart.x);
      const elementY = Math.min(y, dragStart.y);
      
      // Visual feedback could be added here
    }
  }, [isDrawing, dragStart, selectedTool]);

  const handleCanvasMouseUp = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current || !dragStart) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (selectedTool !== 'select' && isDrawing) {
      const width = Math.abs(x - dragStart.x);
      const height = Math.abs(y - dragStart.y);
      const elementX = Math.min(x, dragStart.x);
      const elementY = Math.min(y, dragStart.y);
      
      if (width > 10 && height > 10) {
        const newElement: SketchElement = {
          id: `element-${Date.now()}`,
          type: selectedTool as any,
          x: elementX,
          y: elementY,
          width,
          height,
          properties: getDefaultProperties(selectedTool)
        };
        
        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
      }
    }
    
    setIsDrawing(false);
    setDragStart(null);
  }, [selectedTool, isDrawing, dragStart]);

  const getDefaultProperties = (type: string) => {
    switch (type) {
      case 'text':
        return {
          text: 'Sample Text',
          fontSize: 16,
          color: '#000000',
          fontWeight: 'normal'
        };
      case 'button':
        return {
          text: 'Button',
          backgroundColor: '#3182ce',
          color: '#ffffff',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 'medium'
        };
      case 'input':
        return {
          placeholder: 'Enter text...',
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 4
        };
      case 'container':
        return {
          backgroundColor: '#f7fafc',
          borderWidth: 1,
          borderColor: '#e2e8f0',
          borderRadius: 8
        };
      case 'image':
        return {
          backgroundColor: '#edf2f7'
        };
      case 'card':
        return {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e2e8f0'
        };
      default:
        return {};
    }
  };

  const updateElementProperty = (elementId: string, property: string, value: any) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, properties: { ...el.properties, [property]: value } }
        : el
    ));
  };

  const deleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  const duplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        id: `element-${Date.now()}`,
        x: element.x + 20,
        y: element.y + 20
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const generateCode = () => {
    if (elements.length === 0) {
      toast({
        title: 'No Elements',
        description: 'Please add some elements to generate code',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    let code = '';
    
    switch (targetFramework) {
      case 'react':
        code = generateReactCode();
        break;
      case 'vue':
        code = generateVueCode();
        break;
      case 'html':
        code = generateHTMLCode();
        break;
      default:
        code = generateReactCode();
    }
    
    onCodeGenerate(code, targetFramework);
    
    toast({
      title: 'Code Generated',
      description: `Generated ${targetFramework} code from your design`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const generateReactCode = () => {
    const imports = `import React from 'react';\nimport './styles.css';\n\n`;
    
    const componentCode = `function GeneratedComponent() {
  return (
    <div className="container" style={{ position: 'relative', width: '${canvasSize.width}px', height: '${canvasSize.height}px' }}>
${elements.map(el => generateReactElement(el)).join('\n')}
    </div>
  );
}

export default GeneratedComponent;`;

    const styles = generateCSS();
    
    return `${imports}${componentCode}\n\n/* CSS Styles */\n${styles}`;
  };

  const generateReactElement = (element: SketchElement) => {
    const style = {
      position: 'absolute',
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      ...element.properties
    };
    
    const styleString = Object.entries(style)
      .map(([key, value]) => `${key}: '${value}'`)
      .join(', ');
    
    switch (element.type) {
      case 'text':
        return `      <p style={{ ${styleString} }}>${element.properties.text || 'Text'}</p>`;
      case 'button':
        return `      <button style={{ ${styleString} }}>${element.properties.text || 'Button'}</button>`;
      case 'input':
        return `      <input placeholder="${element.properties.placeholder || ''}" style={{ ${styleString} }} />`;
      case 'image':
        return `      <img src="https://via.placeholder.com/${element.width}x${element.height}" alt="Image" style={{ ${styleString} }} />`;
      case 'container':
        return `      <div style={{ ${styleString} }}></div>`;
      case 'card':
        return `      <div style={{ ${styleString} }}>
        <div style={{ padding: '16px' }}>
          <h3>Card Title</h3>
          <p>Card content goes here</p>
        </div>
      </div>`;
      default:
        return `      <div style={{ ${styleString} }}></div>`;
    }
  };

  const generateVueCode = () => {
    return `<template>
  <div class="container" :style="{ position: 'relative', width: '${canvasSize.width}px', height: '${canvasSize.height}px' }">
${elements.map(el => generateVueElement(el)).join('\n')}
  </div>
</template>

<script>
export default {
  name: 'GeneratedComponent',
  data() {
    return {
      // Component data
    }
  }
}
</script>

<style scoped>
${generateCSS()}
</style>`;
  };

  const generateVueElement = (element: SketchElement) => {
    const style = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;`;
    
    switch (element.type) {
      case 'text':
        return `    <p style="${style}">${element.properties.text || 'Text'}</p>`;
      case 'button':
        return `    <button style="${style}">${element.properties.text || 'Button'}</button>`;
      case 'input':
        return `    <input placeholder="${element.properties.placeholder || ''}" style="${style}" />`;
      default:
        return `    <div style="${style}"></div>`;
    }
  };

  const generateHTMLCode = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Layout</title>
    <style>
        ${generateCSS()}
    </style>
</head>
<body>
    <div class="container" style="position: relative; width: ${canvasSize.width}px; height: ${canvasSize.height}px;">
${elements.map(el => generateHTMLElement(el)).join('\n')}
    </div>
</body>
</html>`;
  };

  const generateHTMLElement = (element: SketchElement) => {
    const style = `position: absolute; left: ${element.x}px; top: ${element.y}px; width: ${element.width}px; height: ${element.height}px;`;
    
    switch (element.type) {
      case 'text':
        return `        <p style="${style}">${element.properties.text || 'Text'}</p>`;
      case 'button':
        return `        <button style="${style}">${element.properties.text || 'Button'}</button>`;
      case 'input':
        return `        <input placeholder="${element.properties.placeholder || ''}" style="${style}" />`;
      default:
        return `        <div style="${style}"></div>`;
    }
  };

  const generateCSS = () => {
    return `.container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
}

button {
  border: none;
  cursor: pointer;
  font-weight: 500;
}

input {
  border: 1px solid #e2e8f0;
  padding: 8px 12px;
  border-radius: 4px;
}

.card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}`;
  };

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
        <Flex justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Visual Code Editor</Heading>
            <Text color="gray.600">Design your UI visually and generate code</Text>
          </VStack>
          <HStack spacing={4}>
            <Select value={targetFramework} onChange={(e) => setTargetFramework(e.target.value)} width="150px">
              <option value="react">React</option>
              <option value="vue">Vue.js</option>
              <option value="html">HTML/CSS</option>
            </Select>
            <Button colorScheme="teal" onClick={generateCode}>
              Generate Code
            </Button>
            <Button onClick={onClose}>Close</Button>
          </HStack>
        </Flex>
      </Box>

      <Flex flex="1">
        {/* Toolbar */}
        <Box width="80px" bg="gray.50" borderRight="1px" borderColor="gray.200" p={2}>
          <VStack spacing={2}>
            {tools.map(tool => (
              <Tooltip key={tool.id} label={tool.name} placement="right">
                <IconButton
                  aria-label={tool.name}
                  icon={<tool.icon />}
                  size="md"
                  variant={selectedTool === tool.id ? 'solid' : 'ghost'}
                  colorScheme={selectedTool === tool.id ? 'teal' : 'gray'}
                  onClick={() => setSelectedTool(tool.id)}
                />
              </Tooltip>
            ))}
          </VStack>
        </Box>

        {/* Canvas */}
        <Box flex="1" bg="gray.100" overflow="auto" position="relative">
          <Box p={4}>
            <Box
              ref={canvasRef}
              width={`${canvasSize.width}px`}
              height={`${canvasSize.height}px`}
              bg="white"
              border="1px"
              borderColor="gray.300"
              position="relative"
              cursor={selectedTool === 'select' ? 'default' : 'crosshair'}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
            >
              {elements.map(element => (
                <Box
                  key={element.id}
                  position="absolute"
                  left={`${element.x}px`}
                  top={`${element.y}px`}
                  width={`${element.width}px`}
                  height={`${element.height}px`}
                  border={selectedElement === element.id ? '2px solid #3182ce' : '1px solid #e2e8f0'}
                  bg={element.properties.backgroundColor || 'transparent'}
                  color={element.properties.color}
                  borderRadius={`${element.properties.borderRadius || 0}px`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={`${element.properties.fontSize || 14}px`}
                  fontWeight={element.properties.fontWeight}
                  cursor="pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElement(element.id);
                  }}
                >
                  {element.type === 'text' && (element.properties.text || 'Text')}
                  {element.type === 'button' && (element.properties.text || 'Button')}
                  {element.type === 'input' && (
                    <Text fontSize="sm" color="gray.500">
                      {element.properties.placeholder || 'Input'}
                    </Text>
                  )}
                  {element.type === 'image' && (
                    <Text fontSize="sm" color="gray.500">Image</Text>
                  )}
                  {element.type === 'container' && (
                    <Text fontSize="xs" color="gray.400">Container</Text>
                  )}
                  {element.type === 'card' && (
                    <VStack spacing={1}>
                      <Text fontSize="sm" fontWeight="bold">Card</Text>
                      <Text fontSize="xs" color="gray.500">Content</Text>
                    </VStack>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Properties Panel */}
        <Box width="300px" bg="white" borderLeft="1px" borderColor="gray.200" p={4}>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Properties</Heading>
            
            {selectedElementData ? (
              <>
                <Box>
                  <Text fontWeight="medium" mb={2}>Element: {selectedElementData.type}</Text>
                  <Badge colorScheme="blue">{selectedElementData.id}</Badge>
                </Box>

                <FormControl>
                  <FormLabel>Position & Size</FormLabel>
                  <HStack spacing={2}>
                    <Input
                      placeholder="X"
                      value={selectedElementData.x}
                      onChange={(e) => updateElementProperty(selectedElementData.id, 'x', parseInt(e.target.value) || 0)}
                      size="sm"
                    />
                    <Input
                      placeholder="Y"
                      value={selectedElementData.y}
                      onChange={(e) => updateElementProperty(selectedElementData.id, 'y', parseInt(e.target.value) || 0)}
                      size="sm"
                    />
                  </HStack>
                  <HStack spacing={2} mt={2}>
                    <Input
                      placeholder="Width"
                      value={selectedElementData.width}
                      onChange={(e) => updateElementProperty(selectedElementData.id, 'width', parseInt(e.target.value) || 0)}
                      size="sm"
                    />
                    <Input
                      placeholder="Height"
                      value={selectedElementData.height}
                      onChange={(e) => updateElementProperty(selectedElementData.id, 'height', parseInt(e.target.value) || 0)}
                      size="sm"
                    />
                  </HStack>
                </FormControl>

                {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                  <FormControl>
                    <FormLabel>Text</FormLabel>
                    <Input
                      value={selectedElementData.properties.text || ''}
                      onChange={(e) => updateElementProperty(selectedElementData.id, 'text', e.target.value)}
                      size="sm"
                    />
                  </FormControl>
                )}

                {selectedElementData.type === 'input' && (
                  <FormControl>
                    <FormLabel>Placeholder</FormLabel>
                    <Input
                      value={selectedElementData.properties.placeholder || ''}
                      onChange={(e) => updateElementProperty(selectedElementData.id, 'placeholder', e.target.value)}
                      size="sm"
                    />
                  </FormControl>
                )}

                <FormControl>
                  <FormLabel>Background Color</FormLabel>
                  <Input
                    type="color"
                    value={selectedElementData.properties.backgroundColor || '#ffffff'}
                    onChange={(e) => updateElementProperty(selectedElementData.id, 'backgroundColor', e.target.value)}
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Text Color</FormLabel>
                  <Input
                    type="color"
                    value={selectedElementData.properties.color || '#000000'}
                    onChange={(e) => updateElementProperty(selectedElementData.id, 'color', e.target.value)}
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Border Radius: {selectedElementData.properties.borderRadius || 0}px</FormLabel>
                  <Slider
                    value={selectedElementData.properties.borderRadius || 0}
                    onChange={(value) => updateElementProperty(selectedElementData.id, 'borderRadius', value)}
                    max={50}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                {(selectedElementData.type === 'text' || selectedElementData.type === 'button') && (
                  <FormControl>
                    <FormLabel>Font Size: {selectedElementData.properties.fontSize || 14}px</FormLabel>
                    <Slider
                      value={selectedElementData.properties.fontSize || 14}
                      onChange={(value) => updateElementProperty(selectedElementData.id, 'fontSize', value)}
                      min={8}
                      max={48}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                )}

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<FiCopy />}
                    onClick={() => duplicateElement(selectedElementData.id)}
                    flex="1"
                  >
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    onClick={() => deleteElement(selectedElementData.id)}
                    flex="1"
                  >
                    Delete
                  </Button>
                </HStack>
              </>
            ) : (
              <Text color="gray.500" textAlign="center">
                Select an element to edit its properties
              </Text>
            )}

            <Box mt={8}>
              <Text fontWeight="medium" mb={2}>Canvas Settings</Text>
              <HStack spacing={2}>
                <Input
                  placeholder="Width"
                  value={canvasSize.width}
                  onChange={(e) => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                  size="sm"
                />
                <Input
                  placeholder="Height"
                  value={canvasSize.height}
                  onChange={(e) => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                  size="sm"
                />
              </HStack>
            </Box>

            <Box>
              <Text fontWeight="medium" mb={2}>Elements ({elements.length})</Text>
              <VStack spacing={1} align="stretch" maxH="200px" overflowY="auto">
                {elements.map(element => (
                  <Box
                    key={element.id}
                    p={2}
                    bg={selectedElement === element.id ? 'blue.50' : 'gray.50'}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <Text fontSize="sm" fontWeight="medium">{element.type}</Text>
                    <Text fontSize="xs" color="gray.600">
                      {element.x}, {element.y} • {element.width}×{element.height}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
};

export default VisualCodeEditor;