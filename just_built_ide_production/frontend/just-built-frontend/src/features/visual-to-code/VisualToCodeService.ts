# Visual-to-Code Transformation Implementation

This module implements the Visual-to-Code Transformation feature, allowing users to sketch UI designs or flowcharts that the system transforms into functional code.

```typescript
import { v4 as uuidv4 } from 'uuid';
import { LLMProvider } from '../types/llm';

// Types for Visual-to-Code Transformation
export interface SketchElement {
  id: string;
  type: 'container' | 'text' | 'button' | 'input' | 'image' | 'list' | 'card' | 'navbar' | 'custom';
  x: number;
  y: number;
  width: number;
  height: number;
  properties: {
    text?: string;
    placeholder?: string;
    src?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    fontSize?: number;
    fontWeight?: string;
    alignment?: 'left' | 'center' | 'right';
    orientation?: 'horizontal' | 'vertical';
    [key: string]: any;
  };
  children: string[]; // IDs of child elements
  parentId?: string;
  zIndex: number;
}

export interface SketchRelation {
  id: string;
  type: 'contains' | 'connects' | 'aligns' | 'groups';
  sourceId: string;
  targetId: string;
  properties: Record<string, any>;
}

export interface Sketch {
  id: string;
  name: string;
  description?: string;
  created: Date;
  updated: Date;
  elements: Map<string, SketchElement>;
  relations: SketchRelation[];
  width: number;
  height: number;
  background: string;
  metadata: Record<string, any>;
}

export interface GeneratedCode {
  id: string;
  sketchId: string;
  language: string;
  framework: string;
  code: string;
  created: Date;
  metadata: {
    components: string[];
    libraries: string[];
    cssFramework?: string;
    responsive: boolean;
    [key: string]: any;
  };
}

export interface CodeGenerationOptions {
  language: string;
  framework: string;
  cssFramework?: string;
  responsive: boolean;
  componentLibrary?: string;
  includeComments: boolean;
  accessibility: boolean;
  darkModeSupport: boolean;
}

// Visual-to-Code Transformation Service
export class VisualToCodeService {
  private sketches: Map<string, Sketch> = new Map();
  private generatedCodes: Map<string, GeneratedCode> = new Map();
  private llmProvider: LLMProvider;
  
  constructor(llmProvider: LLMProvider) {
    this.llmProvider = llmProvider;
  }
  
  // Create a new sketch
  public createSketch(name: string, width: number = 1200, height: number = 800): Sketch {
    const id = uuidv4();
    const now = new Date();
    
    const sketch: Sketch = {
      id,
      name,
      created: now,
      updated: now,
      elements: new Map(),
      relations: [],
      width,
      height,
      background: '#ffffff',
      metadata: {}
    };
    
    this.sketches.set(id, sketch);
    return sketch;
  }
  
  // Get a sketch by ID
  public getSketch(id: string): Sketch | undefined {
    return this.sketches.get(id);
  }
  
  // Update sketch properties
  public updateSketch(id: string, updates: Partial<Omit<Sketch, 'id' | 'created' | 'elements' | 'relations'>>): Sketch | undefined {
    const sketch = this.getSketch(id);
    if (!sketch) return undefined;
    
    const updatedSketch: Sketch = {
      ...sketch,
      ...updates,
      updated: new Date()
    };
    
    this.sketches.set(id, updatedSketch);
    return updatedSketch;
  }
  
  // Add an element to a sketch
  public addElement(sketchId: string, element: Omit<SketchElement, 'id' | 'children' | 'zIndex'>): SketchElement | undefined {
    const sketch = this.getSketch(sketchId);
    if (!sketch) return undefined;
    
    const id = uuidv4();
    const zIndex = sketch.elements.size + 1;
    
    const newElement: SketchElement = {
      ...element,
      id,
      children: [],
      zIndex
    };
    
    // Update parent-child relationship if parent exists
    if (newElement.parentId) {
      const parent = sketch.elements.get(newElement.parentId);
      if (parent) {
        parent.children.push(id);
        sketch.elements.set(parent.id, parent);
      }
    }
    
    sketch.elements.set(id, newElement);
    sketch.updated = new Date();
    
    return newElement;
  }
  
  // Update an element in a sketch
  public updateElement(sketchId: string, elementId: string, updates: Partial<Omit<SketchElement, 'id' | 'children'>>): SketchElement | undefined {
    const sketch = this.getSketch(sketchId);
    if (!sketch) return undefined;
    
    const element = sketch.elements.get(elementId);
    if (!element) return undefined;
    
    // Handle parent change
    if (updates.parentId !== undefined && updates.parentId !== element.parentId) {
      // Remove from old parent
      if (element.parentId) {
        const oldParent = sketch.elements.get(element.parentId);
        if (oldParent) {
          oldParent.children = oldParent.children.filter(id => id !== elementId);
          sketch.elements.set(oldParent.id, oldParent);
        }
      }
      
      // Add to new parent
      if (updates.parentId) {
        const newParent = sketch.elements.get(updates.parentId);
        if (newParent) {
          newParent.children.push(elementId);
          sketch.elements.set(newParent.id, newParent);
        }
      }
    }
    
    const updatedElement: SketchElement = {
      ...element,
      ...updates
    };
    
    sketch.elements.set(elementId, updatedElement);
    sketch.updated = new Date();
    
    return updatedElement;
  }
  
  // Remove an element from a sketch
  public removeElement(sketchId: string, elementId: string): boolean {
    const sketch = this.getSketch(sketchId);
    if (!sketch) return false;
    
    const element = sketch.elements.get(elementId);
    if (!element) return false;
    
    // Remove from parent
    if (element.parentId) {
      const parent = sketch.elements.get(element.parentId);
      if (parent) {
        parent.children = parent.children.filter(id => id !== elementId);
        sketch.elements.set(parent.id, parent);
      }
    }
    
    // Remove children recursively
    for (const childId of element.children) {
      this.removeElement(sketchId, childId);
    }
    
    // Remove relations involving this element
    sketch.relations = sketch.relations.filter(
      relation => relation.sourceId !== elementId && relation.targetId !== elementId
    );
    
    // Remove the element
    sketch.elements.delete(elementId);
    sketch.updated = new Date();
    
    return true;
  }
  
  // Add a relation between elements
  public addRelation(sketchId: string, relation: Omit<SketchRelation, 'id'>): SketchRelation | undefined {
    const sketch = this.getSketch(sketchId);
    if (!sketch) return undefined;
    
    const sourceElement = sketch.elements.get(relation.sourceId);
    const targetElement = sketch.elements.get(relation.targetId);
    
    if (!sourceElement || !targetElement) return undefined;
    
    const id = uuidv4();
    const newRelation: SketchRelation = {
      ...relation,
      id
    };
    
    sketch.relations.push(newRelation);
    sketch.updated = new Date();
    
    return newRelation;
  }
  
  // Remove a relation
  public removeRelation(sketchId: string, relationId: string): boolean {
    const sketch = this.getSketch(sketchId);
    if (!sketch) return false;
    
    const initialLength = sketch.relations.length;
    sketch.relations = sketch.relations.filter(relation => relation.id !== relationId);
    
    if (sketch.relations.length < initialLength) {
      sketch.updated = new Date();
      return true;
    }
    
    return false;
  }
  
  // Generate code from a sketch
  public async generateCode(sketchId: string, options: CodeGenerationOptions): Promise<GeneratedCode | undefined> {
    const sketch = this.getSketch(sketchId);
    if (!sketch) return undefined;
    
    // In a real implementation, this would use the LLM to analyze the sketch
    // and generate appropriate code based on the options
    
    // For now, we'll create a mock implementation that generates simple HTML/CSS
    // based on the sketch elements
    
    const mockCode = this.generateMockCode(sketch, options);
    
    const generatedCode: GeneratedCode = {
      id: uuidv4(),
      sketchId,
      language: options.language,
      framework: options.framework,
      code: mockCode,
      created: new Date(),
      metadata: {
        components: Array.from(sketch.elements.values()).map(e => e.type),
        libraries: [],
        cssFramework: options.cssFramework,
        responsive: options.responsive
      }
    };
    
    this.generatedCodes.set(generatedCode.id, generatedCode);
    return generatedCode;
  }
  
  // Get generated code by ID
  public getGeneratedCode(id: string): GeneratedCode | undefined {
    return this.generatedCodes.get(id);
  }
  
  // Get all generated codes for a sketch
  public getGeneratedCodesForSketch(sketchId: string): GeneratedCode[] {
    return Array.from(this.generatedCodes.values())
      .filter(code => code.sketchId === sketchId);
  }
  
  // Analyze an image to create a sketch
  public async analyzeImage(imageData: string): Promise<Sketch | undefined> {
    // In a real implementation, this would use computer vision and LLM
    // to analyze the image and create a sketch
    
    console.log('Analyzing image to create sketch...');
    
    // Create a simple mock sketch for demonstration
    const sketch = this.createSketch('Sketch from Image');
    
    // Add some mock elements
    this.addElement(sketch.id, {
      type: 'container',
      x: 0,
      y: 0,
      width: sketch.width,
      height: sketch.height,
      properties: {
        backgroundColor: '#f5f5f5'
      }
    });
    
    this.addElement(sketch.id, {
      type: 'navbar',
      x: 0,
      y: 0,
      width: sketch.width,
      height: 60,
      properties: {
        backgroundColor: '#333333',
        color: '#ffffff'
      }
    });
    
    this.addElement(sketch.id, {
      type: 'text',
      x: 20,
      y: 15,
      width: 200,
      height: 30,
      properties: {
        text: 'My Application',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff'
      }
    });
    
    this.addElement(sketch.id, {
      type: 'container',
      x: 50,
      y: 100,
      width: sketch.width - 100,
      height: 400,
      properties: {
        backgroundColor: '#ffffff',
        borderRadius: 8
      }
    });
    
    return sketch;
  }
  
  // Generate mock code based on sketch
  private generateMockCode(sketch: Sketch, options: CodeGenerationOptions): string {
    const elements = Array.from(sketch.elements.values());
    
    // Sort elements by z-index
    elements.sort((a, b) => a.zIndex - b.zIndex);
    
    // Generate code based on the framework option
    switch (options.framework.toLowerCase()) {
      case 'react':
        return this.generateReactCode(sketch, elements, options);
      case 'vue':
        return this.generateVueCode(sketch, elements, options);
      case 'angular':
        return this.generateAngularCode(sketch, elements, options);
      default:
        return this.generateHTMLCode(sketch, elements, options);
    }
  }
  
  // Generate React code
  private generateReactCode(sketch: Sketch, elements: SketchElement[], options: CodeGenerationOptions): string {
    let imports = `import React from 'react';\n`;
    
    if (options.cssFramework === 'tailwind') {
      // No additional imports needed for Tailwind
    } else if (options.cssFramework === 'bootstrap') {
      imports += `import 'bootstrap/dist/css/bootstrap.min.css';\n`;
    } else if (options.componentLibrary === 'chakra') {
      imports += `import { ChakraProvider, Box, Text, Button, Input, Image, Stack, Flex, Heading } from '@chakra-ui/react';\n`;
    } else {
      imports += `import './styles.css';\n`;
    }
    
    let componentCode = '';
    
    // Find root elements (those without parents)
    const rootElements = elements.filter(e => !e.parentId);
    
    // Generate JSX for each root element
    const jsxContent = rootElements.map(element => this.generateReactJSX(element, elements, options)).join('\n');
    
    if (options.componentLibrary === 'chakra') {
      componentCode = `
function App() {
  return (
    <ChakraProvider>
      ${jsxContent}
    </ChakraProvider>
  );
}
`;
    } else {
      componentCode = `
function App() {
  return (
    <div className="app">
      ${jsxContent}
    </div>
  );
}
`;
    }
    
    return `${imports}
${componentCode}

export default App;
`;
  }
  
  // Generate React JSX for an element
  private generateReactJSX(element: SketchElement, allElements: SketchElement[], options: CodeGenerationOptions): string {
    const { type, properties } = element;
    const children = element.children.map(id => allElements.find(e => e.id === id)).filter(Boolean) as SketchElement[];
    
    // Generate style object or class names
    let style = '';
    let className = '';
    
    if (options.cssFramework === 'tailwind') {
      className = this.generateTailwindClasses(element);
    } else if (options.cssFramework === 'bootstrap') {
      className = this.generateBootstrapClasses(element);
    } else if (options.componentLibrary === 'chakra') {
      style = this.generateChakraProps(element);
    } else {
      style = this.generateInlineStyles(element);
    }
    
    // Generate component based on type
    switch (type) {
      case 'container':
        if (options.componentLibrary === 'chakra') {
          return `<Box ${style}>
  ${children.map(child => this.generateReactJSX(child, allElements, options)).join('\n  ')}
</Box>`;
        } else {
          return `<div${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}>
  ${children.map(child => this.generateReactJSX(child, allElements, options)).join('\n  ')}
</div>`;
        }
        
      case 'text':
        if (options.componentLibrary === 'chakra') {
          return `<Text ${style}>${properties.text || ''}</Text>`;
        } else {
          return `<p${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}>${properties.text || ''}</p>`;
        }
        
      case 'button':
        if (options.componentLibrary === 'chakra') {
          return `<Button ${style}>${properties.text || 'Button'}</Button>`;
        } else {
          return `<button${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}>${properties.text || 'Button'}</button>`;
        }
        
      case 'input':
        if (options.componentLibrary === 'chakra') {
          return `<Input ${style} placeholder="${properties.placeholder || ''}" />`;
        } else {
          return `<input${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''} placeholder="${properties.placeholder || ''}" />`;
        }
        
      case 'image':
        if (options.componentLibrary === 'chakra') {
          return `<Image ${style} src="${properties.src || 'https://via.placeholder.com/150'}" alt="Image" />`;
        } else {
          return `<img${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''} src="${properties.src || 'https://via.placeholder.com/150'}" alt="Image" />`;
        }
        
      case 'navbar':
        if (options.componentLibrary === 'chakra') {
          return `<Flex as="nav" ${style}>
  ${children.map(child => this.generateReactJSX(child, allElements, options)).join('\n  ')}
</Flex>`;
        } else {
          return `<nav${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}>
  ${children.map(child => this.generateReactJSX(child, allElements, options)).join('\n  ')}
</nav>`;
        }
        
      default:
        if (options.componentLibrary === 'chakra') {
          return `<Box ${style}>
  ${children.map(child => this.generateReactJSX(child, allElements, options)).join('\n  ')}
</Box>`;
        } else {
          return `<div${className ? ` className="${className}"` : ''}${style ? ` style={${style}}` : ''}>
  ${children.map(child => this.generateReactJSX(child, allElements, options)).join('\n  ')}
</div>`;
        }
    }
  }
  
  // Generate Vue code
  private generateVueCode(sketch: Sketch, elements: SketchElement[], options: CodeGenerationOptions): string {
    // Simplified implementation for now
    return `<template>
  <div class="app">
    <!-- Generated from sketch: ${sketch.name} -->
    <!-- This would contain Vue template code based on the sketch -->
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      // Component data would go here
    }
  }
}
</script>

<style>
/* CSS styles would go here */
</style>`;
  }
  
  // Generate Angular code
  private generateAngularCode(sketch: Sketch, elements: SketchElement[], options: CodeGenerationOptions): string {
    // Simplified implementation for now
    return `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: \`
    <div class="app">
      <!-- Generated from sketch: ${sketch.name} -->
      <!-- This would contain Angular template code based on the sketch -->
    </div>
  \`,
  styles: [\`
    /* CSS styles would go here */
  \`]
})
export class AppComponent {
  // Component logic would go here
}`;
  }
  
  // Generate HTML code
  private generateHTMLCode(sketch: Sketch, elements: SketchElement[], options: CodeGenerationOptions): string {
    // Find root elements (those without parents)
    const rootElements = elements.filter(e => !e.parentId);
    
    // Generate HTML for each root element
    const htmlContent = rootElements.map(element => this.generateHTML(element, elements, options)).join('\n');
    
    // Generate CSS
    const css = this.generateCSS(elements, options);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sketch.name}</title>
  ${options.cssFramework === 'bootstrap' ? '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' : ''}
  ${options.cssFramework === 'tailwind' ? '<script src="https://cdn.tailwindcss.com"></script>' : ''}
  ${options.cssFramework ? '' : '<style>\n' + css + '\n</style>'}
</head>
<body>
${htmlContent}
${options.cssFramework === 'bootstrap' ? '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>' : ''}
</body>
</html>`;
  }
  
  // Generate HTML for an element
  private generateHTML(element: SketchElement, allElements: SketchElement[], options: CodeGenerationOptions): string {
    const { type, properties } = element;
    const children = element.children.map(id => allElements.find(e => e.id === id)).filter(Boolean) as SketchElement[];
    
    // Generate class or style attribute
    let classAttr = '';
    let styleAttr = '';
    
    if (options.cssFramework === 'tailwind') {
      classAttr = ` class="${this.generateTailwindClasses(element)}"`;
    } else if (options.cssFramework === 'bootstrap') {
      classAttr = ` class="${this.generateBootstrapClasses(element)}"`;
    } else {
      styleAttr = ` style="${this.generateInlineStylesString(element)}"`;
    }
    
    // Generate HTML based on type
    switch (type) {
      case 'container':
        return `<div${classAttr}${styleAttr}>
  ${children.map(child => this.generateHTML(child, allElements, options)).join('\n  ')}
</div>`;
        
      case 'text':
        return `<p${classAttr}${styleAttr}>${properties.text || ''}</p>`;
        
      case 'button':
        return `<button${classAttr}${styleAttr}>${properties.text || 'Button'}</button>`;
        
      case 'input':
        return `<input${classAttr}${styleAttr} placeholder="${properties.placeholder || ''}" />`;
        
      case 'image':
        return `<img${classAttr}${styleAttr} src="${properties.src || 'https://via.placeholder.com/150'}" alt="Image" />`;
        
      case 'navbar':
        return `<nav${classAttr}${styleAttr}>
  ${children.map(child => this.generateHTML(child, allElements, options)).join('\n  ')}
</nav>`;
        
      default:
        return `<div${classAttr}${styleAttr}>
  ${children.map(child => this.generateHTML(child, allElements, options)).join('\n  ')}
</div>`;
    }
  }
  
  // Generate CSS
  private generateCSS(elements: SketchElement[], options: CodeGenerationOptions): string {
    let css = '';
    
    // Add base styles
    css += `body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.app {
  width: 100%;
  min-height: 100vh;
}
`;
    
    // Add styles for each element
    elements.forEach(element => {
      css += `
.element-${element.id} {
  ${this.generateCSSProperties(element)}
}
`;
    });
    
    return css;
  }
  
  // Generate CSS properties for an element
  private generateCSSProperties(element: SketchElement): string {
    const { x, y, width, height, properties } = element;
    let css = '';
    
    css += `position: absolute;\n`;
    css += `left: ${x}px;\n`;
    css += `top: ${y}px;\n`;
    css += `width: ${width}px;\n`;
    css += `height: ${height}px;\n`;
    
    if (properties.backgroundColor) {
      css += `background-color: ${properties.backgroundColor};\n`;
    }
    
    if (properties.color) {
      css += `color: ${properties.color};\n`;
    }
    
    if (properties.borderRadius) {
      css += `border-radius: ${properties.borderRadius}px;\n`;
    }
    
    if (properties.fontSize) {
      css += `font-size: ${properties.fontSize}px;\n`;
    }
    
    if (properties.fontWeight) {
      css += `font-weight: ${properties.fontWeight};\n`;
    }
    
    if (properties.alignment) {
      css += `text-align: ${properties.alignment};\n`;
    }
    
    return css;
  }
  
  // Generate inline styles object for React
  private generateInlineStyles(element: SketchElement): string {
    const { x, y, width, height, properties } = element;
    const styles: Record<string, any> = {
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`
    };
    
    if (properties.backgroundColor) {
      styles.backgroundColor = properties.backgroundColor;
    }
    
    if (properties.color) {
      styles.color = properties.color;
    }
    
    if (properties.borderRadius) {
      styles.borderRadius = `${properties.borderRadius}px`;
    }
    
    if (properties.fontSize) {
      styles.fontSize = `${properties.fontSize}px`;
    }
    
    if (properties.fontWeight) {
      styles.fontWeight = properties.fontWeight;
    }
    
    if (properties.alignment) {
      styles.textAlign = properties.alignment;
    }
    
    return JSON.stringify(styles);
  }
  
  // Generate inline styles string for HTML
  private generateInlineStylesString(element: SketchElement): string {
    const { x, y, width, height, properties } = element;
    let styles = '';
    
    styles += `position: absolute; `;
    styles += `left: ${x}px; `;
    styles += `top: ${y}px; `;
    styles += `width: ${width}px; `;
    styles += `height: ${height}px; `;
    
    if (properties.backgroundColor) {
      styles += `background-color: ${properties.backgroundColor}; `;
    }
    
    if (properties.color) {
      styles += `color: ${properties.color}; `;
    }
    
    if (properties.borderRadius) {
      styles += `border-radius: ${properties.borderRadius}px; `;
    }
    
    if (properties.fontSize) {
      styles += `font-size: ${properties.fontSize}px; `;
    }
    
    if (properties.fontWeight) {
      styles += `font-weight: ${properties.fontWeight}; `;
    }
    
    if (properties.alignment) {
      styles += `text-align: ${properties.alignment}; `;
    }
    
    return styles.trim();
  }
  
  // Generate Tailwind classes
  private generateTailwindClasses(element: SketchElement): string {
    const { properties } = element;
    let classes = '';
    
    // Position classes would be handled differently in a real implementation
    // as Tailwind doesn't have direct absolute positioning classes
    
    // Width and height
    // This is simplified; in a real implementation we'd map pixel values to Tailwind sizes
    classes += ' w-full h-full';
    
    if (properties.backgroundColor) {
      // Map color to Tailwind color class (simplified)
      classes += ' bg-gray-200';
    }
    
    if (properties.color) {
      // Map color to Tailwind color class (simplified)
      classes += ' text-gray-800';
    }
    
    if (properties.borderRadius) {
      classes += ' rounded';
    }
    
    if (properties.fontSize) {
      // Map font size to Tailwind size class (simplified)
      classes += ' text-base';
    }
    
    if (properties.fontWeight === 'bold') {
      classes += ' font-bold';
    }
    
    if (properties.alignment) {
      classes += ` text-${properties.alignment}`;
    }
    
    return classes.trim();
  }
  
  // Generate Bootstrap classes
  private generateBootstrapClasses(element: SketchElement): string {
    const { type, properties } = element;
    let classes = '';
    
    // Base classes based on element type
    switch (type) {
      case 'container':
        classes += 'container';
        break;
      case 'button':
        classes += 'btn btn-primary';
        break;
      case 'input':
        classes += 'form-control';
        break;
      case 'navbar':
        classes += 'navbar navbar-expand-lg navbar-dark bg-dark';
        break;
      default:
        break;
    }
    
    // Additional classes based on properties
    if (properties.backgroundColor && type !== 'button' && type !== 'navbar') {
      // Simplified mapping to Bootstrap bg classes
      classes += ' bg-light';
    }
    
    if (properties.alignment) {
      classes += ` text-${properties.alignment}`;
    }
    
    return classes.trim();
  }
  
  // Generate Chakra UI props
  private generateChakraProps(element: SketchElement): string {
    const { x, y, width, height, properties } = element;
    let props = '';
    
    props += `position="absolute" `;
    props += `left="${x}px" `;
    props += `top="${y}px" `;
    props += `width="${width}px" `;
    props += `height="${height}px" `;
    
    if (properties.backgroundColor) {
      props += `bg="${properties.backgroundColor}" `;
    }
    
    if (properties.color) {
      props += `color="${properties.color}" `;
    }
    
    if (properties.borderRadius) {
      props += `borderRadius="${properties.borderRadius}px" `;
    }
    
    if (properties.fontSize) {
      props += `fontSize="${properties.fontSize}px" `;
    }
    
    if (properties.fontWeight) {
      props += `fontWeight="${properties.fontWeight}" `;
    }
    
    if (properties.alignment) {
      props += `textAlign="${properties.alignment}" `;
    }
    
    return props.trim();
  }
}

export default VisualToCodeService;
```
