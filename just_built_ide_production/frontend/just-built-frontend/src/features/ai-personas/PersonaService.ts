# AI Development Personas Implementation

This module implements the AI Development Personas feature, allowing users to create customized AI developers with specific traits, expertise levels, and coding styles.

```typescript
import { LLMProvider, LLMModel } from '../types/llm';

// Types for AI Development Personas
export interface PersonalityTrait {
  id: string;
  name: string;
  description: string;
  strength: number; // 1-10 scale
}

export interface ExpertiseArea {
  id: string;
  name: string;
  description: string;
  level: number; // 1-10 scale
}

export interface CodingStylePreference {
  id: string;
  name: string;
  description: string;
  examples: {
    language: string;
    before: string;
    after: string;
  }[];
}

export interface DocumentationStyle {
  id: string;
  name: string;
  description: string;
  verbosity: number; // 1-10 scale
  includeExamples: boolean;
  formatPreference: 'markdown' | 'jsdoc' | 'javadoc' | 'numpy' | 'custom';
  customFormat?: string;
}

export interface AIPersona {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  baseModel: LLMModel;
  personalityTraits: PersonalityTrait[];
  expertiseAreas: ExpertiseArea[];
  codingStyle: CodingStylePreference;
  documentationStyle: DocumentationStyle;
  communicationStyle: {
    verbosity: number; // 1-10 scale
    formality: number; // 1-10 scale
    useEmojis: boolean;
    useHumor: boolean;
    technicalLevel: number; // 1-10 scale
  };
  createdAt: Date;
  updatedAt: Date;
}

// Predefined personality traits
export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  {
    id: 'detail-oriented',
    name: 'Detail-Oriented',
    description: 'Focuses on precision and thoroughness in code and documentation',
    strength: 8
  },
  {
    id: 'innovative',
    name: 'Innovative',
    description: 'Prioritizes creative solutions and cutting-edge approaches',
    strength: 7
  },
  {
    id: 'pragmatic',
    name: 'Pragmatic',
    description: 'Focuses on practical, maintainable solutions over theoretical perfection',
    strength: 9
  },
  {
    id: 'efficiency-focused',
    name: 'Efficiency-Focused',
    description: 'Prioritizes performance and resource optimization',
    strength: 8
  },
  {
    id: 'security-minded',
    name: 'Security-Minded',
    description: 'Emphasizes secure coding practices and vulnerability prevention',
    strength: 9
  },
  {
    id: 'user-centered',
    name: 'User-Centered',
    description: 'Prioritizes user experience and interface design',
    strength: 7
  }
];

// Predefined expertise areas
export const EXPERTISE_AREAS: ExpertiseArea[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    description: 'Expertise in UI frameworks, responsive design, and client-side logic',
    level: 8
  },
  {
    id: 'backend',
    name: 'Backend Development',
    description: 'Expertise in server architecture, APIs, and databases',
    level: 8
  },
  {
    id: 'fullstack',
    name: 'Full Stack Development',
    description: 'Balanced expertise across frontend and backend technologies',
    level: 7
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Expertise in CI/CD, containerization, and infrastructure',
    level: 7
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Expertise in secure coding, vulnerability assessment, and penetration testing',
    level: 9
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    description: 'Expertise in native and cross-platform mobile development',
    level: 7
  },
  {
    id: 'data',
    name: 'Data Engineering',
    description: 'Expertise in data processing, storage, and analysis',
    level: 8
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    description: 'Expertise in ML algorithms, model training, and deployment',
    level: 8
  }
];

// Predefined coding styles
export const CODING_STYLES: CodingStylePreference[] = [
  {
    id: 'clean-readable',
    name: 'Clean and Readable',
    description: 'Prioritizes readability and maintainability with clear naming and structure',
    examples: [
      {
        language: 'javascript',
        before: `function x(a,b){return a.filter(i=>i>b).map(i=>i*2);}`,
        after: `function filterAndDoubleNumbers(numbers, threshold) {
  const filteredNumbers = numbers.filter(number => number > threshold);
  return filteredNumbers.map(number => number * 2);
}`
      }
    ]
  },
  {
    id: 'concise',
    name: 'Concise',
    description: 'Prioritizes brevity and efficiency with compact code',
    examples: [
      {
        language: 'javascript',
        before: `function filterAndDoubleNumbers(numbers, threshold) {
  const filteredNumbers = numbers.filter(number => number > threshold);
  return filteredNumbers.map(number => number * 2);
}`,
        after: `const filterAndDouble = (nums, t) => nums.filter(n => n > t).map(n => n * 2);`
      }
    ]
  },
  {
    id: 'functional',
    name: 'Functional',
    description: 'Emphasizes pure functions, immutability, and functional programming patterns',
    examples: [
      {
        language: 'javascript',
        before: `function processData(data) {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].active) {
      let processed = transform(data[i]);
      result.push(processed);
    }
  }
  return result;
}`,
        after: `const processData = data => 
  data
    .filter(item => item.active)
    .map(transform);`
      }
    ]
  },
  {
    id: 'object-oriented',
    name: 'Object-Oriented',
    description: 'Focuses on classes, inheritance, and object-oriented design patterns',
    examples: [
      {
        language: 'typescript',
        before: `function createUser(name, email) {
  return {
    name,
    email,
    sendEmail: function(subject, body) {
      // Send email logic
    }
  };
}`,
        after: `class User {
  private name: string;
  private email: string;
  
  constructor(name: string, email: string) {
    this.name = name;
    this.email = email;
  }
  
  public sendEmail(subject: string, body: string): void {
    // Send email logic
  }
}`
      }
    ]
  }
];

// Predefined documentation styles
export const DOCUMENTATION_STYLES: DocumentationStyle[] = [
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    description: 'Detailed documentation with examples, parameter descriptions, and usage notes',
    verbosity: 9,
    includeExamples: true,
    formatPreference: 'jsdoc'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Brief, essential documentation focusing on purpose and parameters',
    verbosity: 3,
    includeExamples: false,
    formatPreference: 'markdown'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate documentation with clear descriptions and occasional examples',
    verbosity: 6,
    includeExamples: true,
    formatPreference: 'markdown'
  }
];

// Template personas
export const TEMPLATE_PERSONAS: AIPersona[] = [
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'Expert in modern frontend development with focus on user experience',
    baseModel: {
      provider: 'gemini',
      modelName: 'gemini-pro',
      version: '1.0'
    },
    personalityTraits: [
      PERSONALITY_TRAITS.find(t => t.id === 'user-centered')!,
      PERSONALITY_TRAITS.find(t => t.id === 'detail-oriented')!
    ],
    expertiseAreas: [
      EXPERTISE_AREAS.find(e => e.id === 'frontend')!
    ],
    codingStyle: CODING_STYLES.find(s => s.id === 'clean-readable')!,
    documentationStyle: DOCUMENTATION_STYLES.find(d => d.id === 'balanced')!,
    communicationStyle: {
      verbosity: 7,
      formality: 5,
      useEmojis: true,
      useHumor: true,
      technicalLevel: 8
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'security-expert',
    name: 'Security Expert',
    description: 'Specialized in secure coding practices and vulnerability prevention',
    baseModel: {
      provider: 'mistral',
      modelName: 'mistral-large',
      version: '1.0'
    },
    personalityTraits: [
      PERSONALITY_TRAITS.find(t => t.id === 'security-minded')!,
      PERSONALITY_TRAITS.find(t => t.id === 'detail-oriented')!
    ],
    expertiseAreas: [
      EXPERTISE_AREAS.find(e => e.id === 'security')!
    ],
    codingStyle: CODING_STYLES.find(s => s.id === 'clean-readable')!,
    documentationStyle: DOCUMENTATION_STYLES.find(d => d.id === 'comprehensive')!,
    communicationStyle: {
      verbosity: 8,
      formality: 8,
      useEmojis: false,
      useHumor: false,
      technicalLevel: 9
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'fullstack-pragmatist',
    name: 'Fullstack Pragmatist',
    description: 'Balanced full-stack developer focused on practical, maintainable solutions',
    baseModel: {
      provider: 'groq',
      modelName: 'llama3-70b',
      version: '1.0'
    },
    personalityTraits: [
      PERSONALITY_TRAITS.find(t => t.id === 'pragmatic')!,
      PERSONALITY_TRAITS.find(t => t.id === 'efficiency-focused')!
    ],
    expertiseAreas: [
      EXPERTISE_AREAS.find(e => e.id === 'fullstack')!
    ],
    codingStyle: CODING_STYLES.find(s => s.id === 'concise')!,
    documentationStyle: DOCUMENTATION_STYLES.find(d => d.id === 'minimal')!,
    communicationStyle: {
      verbosity: 5,
      formality: 4,
      useEmojis: false,
      useHumor: true,
      technicalLevel: 7
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Persona management service
export class PersonaService {
  private personas: AIPersona[] = [...TEMPLATE_PERSONAS];
  
  public getPersonas(): AIPersona[] {
    return [...this.personas];
  }
  
  public getPersonaById(id: string): AIPersona | undefined {
    return this.personas.find(p => p.id === id);
  }
  
  public createPersona(persona: Omit<AIPersona, 'id' | 'createdAt' | 'updatedAt'>): AIPersona {
    const newPersona: AIPersona = {
      ...persona,
      id: `persona-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.personas.push(newPersona);
    return newPersona;
  }
  
  public updatePersona(id: string, updates: Partial<AIPersona>): AIPersona | undefined {
    const index = this.personas.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    
    const updatedPersona: AIPersona = {
      ...this.personas[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.personas[index] = updatedPersona;
    return updatedPersona;
  }
  
  public deletePersona(id: string): boolean {
    const initialLength = this.personas.length;
    this.personas = this.personas.filter(p => p.id !== id);
    return this.personas.length < initialLength;
  }
  
  // Generate prompt modifiers based on persona
  public generatePersonaPromptModifiers(personaId: string): string {
    const persona = this.getPersonaById(personaId);
    if (!persona) return '';
    
    let promptModifiers = `You are ${persona.name}, ${persona.description}.\n\n`;
    
    // Add personality traits
    promptModifiers += 'Your personality traits:\n';
    persona.personalityTraits.forEach(trait => {
      promptModifiers += `- ${trait.name}: ${trait.description}\n`;
    });
    
    // Add expertise areas
    promptModifiers += '\nYour areas of expertise:\n';
    persona.expertiseAreas.forEach(area => {
      promptModifiers += `- ${area.name} (Level ${area.level}/10): ${area.description}\n`;
    });
    
    // Add coding style
    promptModifiers += `\nYou write code in a ${persona.codingStyle.name} style: ${persona.codingStyle.description}\n`;
    
    // Add documentation style
    promptModifiers += `\nYour documentation style is ${persona.documentationStyle.name}: ${persona.documentationStyle.description}\n`;
    
    // Add communication style
    const comm = persona.communicationStyle;
    promptModifiers += '\nWhen communicating:';
    promptModifiers += `\n- You are ${comm.verbosity > 7 ? 'very detailed' : comm.verbosity < 4 ? 'concise' : 'moderately detailed'}`;
    promptModifiers += `\n- Your tone is ${comm.formality > 7 ? 'formal' : comm.formality < 4 ? 'casual' : 'conversational'}`;
    if (comm.useEmojis) promptModifiers += '\n- You occasionally use relevant emojis';
    if (comm.useHumor) promptModifiers += '\n- You incorporate appropriate humor';
    promptModifiers += `\n- You explain concepts at a ${comm.technicalLevel > 7 ? 'highly technical' : comm.technicalLevel < 4 ? 'beginner-friendly' : 'moderately technical'} level`;
    
    return promptModifiers;
  }
}

export default new PersonaService();
```
