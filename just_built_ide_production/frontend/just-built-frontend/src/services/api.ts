import axios from 'axios';

// API service for Just Built IDE
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PlanStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  code?: string;
  estimatedTime?: string;
  dependencies?: number[];
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface BuildConfig {
  type: string;
  platform?: string[];
  optimization: string;
  includeSourceMaps: boolean;
  additionalOptions: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'directory';
  path: string;
  size?: number;
  children?: FileItem[];
  lastModified?: Date;
  content?: string;
}

export interface LLMModel {
  id: string;
  name: string;
  available: boolean;
  endpoint?: string;
  description?: string;
  capabilities?: string[];
  pricing?: string;
}

export interface LLMConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
}

export interface AgentConfig {
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

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api' 
    : '/.netlify/functions',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Enhanced mock API implementations with more realistic behavior
export const llmApi = {
  async getModels(): Promise<ApiResponse<{ models: LLMModel[] }>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockModels: LLMModel[] = [
      {
        id: 'gemini',
        name: 'Google Gemini Pro',
        available: true,
        description: 'Google\'s advanced multimodal AI model with strong reasoning capabilities',
        capabilities: ['Code Generation', 'Multimodal', 'Reasoning', 'Analysis'],
        pricing: 'Pay per use'
      },
      {
        id: 'gpt-4',
        name: 'OpenAI GPT-4',
        available: true,
        description: 'OpenAI\'s most capable model with excellent code generation and reasoning',
        capabilities: ['Code Generation', 'Problem Solving', 'Documentation', 'Debugging'],
        pricing: 'Premium'
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        available: true,
        description: 'Anthropic\'s helpful, harmless, and honest AI assistant',
        capabilities: ['Code Review', 'Explanation', 'Safety', 'Reasoning'],
        pricing: 'Pay per use'
      },
      {
        id: 'ollama',
        name: 'Ollama Local',
        available: true,
        endpoint: 'http://localhost:11434',
        description: 'Run open-source models locally for privacy and control',
        capabilities: ['Privacy', 'Local Processing', 'Customizable', 'Offline'],
        pricing: 'Free (Local)'
      }
    ];

    return {
      data: { models: mockModels },
      success: true
    };
  },

  async generatePlan(userInput: string, model: string, config?: LLMConfig): Promise<ApiResponse<{ plan: PlanStep[] }>> {
    // Simulate API delay based on input complexity
    const delay = Math.min(3000, userInput.length * 10 + 1000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Generate plan based on input keywords
    const keywords = userInput.toLowerCase();
    let mockPlan: PlanStep[] = [];
    
    if (keywords.includes('web') || keywords.includes('website') || keywords.includes('app')) {
      mockPlan = [
        {
          id: 1,
          title: "Project Setup & Architecture",
          description: "Initialize project structure, configure build tools, and set up development environment",
          completed: false,
          estimatedTime: "15 minutes",
          status: 'pending'
        },
        {
          id: 2,
          title: "Frontend Framework Setup",
          description: "Configure React/Vue/Angular framework with routing and state management",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [1],
          status: 'pending'
        },
        {
          id: 3,
          title: "UI Components & Styling",
          description: "Create reusable UI components and implement responsive design",
          completed: false,
          estimatedTime: "30 minutes",
          dependencies: [2],
          status: 'pending'
        },
        {
          id: 4,
          title: "Backend API Development",
          description: "Implement REST API endpoints and database integration",
          completed: false,
          estimatedTime: "25 minutes",
          dependencies: [1],
          status: 'pending'
        },
        {
          id: 5,
          title: "Integration & Testing",
          description: "Connect frontend to backend, implement error handling, and add tests",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [3, 4],
          status: 'pending'
        },
        {
          id: 6,
          title: "Deployment & Optimization",
          description: "Deploy application and optimize for performance",
          completed: false,
          estimatedTime: "15 minutes",
          dependencies: [5],
          status: 'pending'
        }
      ];
    } else if (keywords.includes('api') || keywords.includes('backend')) {
      mockPlan = [
        {
          id: 1,
          title: "API Architecture Design",
          description: "Design RESTful API structure and define endpoints",
          completed: false,
          estimatedTime: "10 minutes",
          status: 'pending'
        },
        {
          id: 2,
          title: "Database Schema Setup",
          description: "Create database models and relationships",
          completed: false,
          estimatedTime: "15 minutes",
          dependencies: [1],
          status: 'pending'
        },
        {
          id: 3,
          title: "Authentication & Authorization",
          description: "Implement user authentication and role-based access control",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [2],
          status: 'pending'
        },
        {
          id: 4,
          title: "Core API Endpoints",
          description: "Implement CRUD operations and business logic",
          completed: false,
          estimatedTime: "25 minutes",
          dependencies: [3],
          status: 'pending'
        },
        {
          id: 5,
          title: "Testing & Documentation",
          description: "Add unit tests and API documentation",
          completed: false,
          estimatedTime: "15 minutes",
          dependencies: [4],
          status: 'pending'
        }
      ];
    } else if (keywords.includes('mobile') || keywords.includes('app')) {
      mockPlan = [
        {
          id: 1,
          title: "Mobile App Setup",
          description: "Initialize React Native or Flutter project and configure dependencies",
          completed: false,
          estimatedTime: "15 minutes",
          status: 'pending'
        },
        {
          id: 2,
          title: "Navigation Structure",
          description: "Set up navigation system and screen architecture",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [1],
          status: 'pending'
        },
        {
          id: 3,
          title: "UI Components & Styling",
          description: "Create mobile-optimized UI components with responsive layouts",
          completed: false,
          estimatedTime: "30 minutes",
          dependencies: [2],
          status: 'pending'
        },
        {
          id: 4,
          title: "State Management",
          description: "Implement state management solution for app data",
          completed: false,
          estimatedTime: "25 minutes",
          dependencies: [2],
          status: 'pending'
        },
        {
          id: 5,
          title: "API Integration",
          description: "Connect to backend services and handle data fetching",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [3, 4],
          status: 'pending'
        },
        {
          id: 6,
          title: "Device Features",
          description: "Implement native device features like camera, location, notifications",
          completed: false,
          estimatedTime: "25 minutes",
          dependencies: [5],
          status: 'pending'
        },
        {
          id: 7,
          title: "Testing & Optimization",
          description: "Test on multiple devices and optimize performance",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [6],
          status: 'pending'
        }
      ];
    } else {
      // Generic plan for other types of projects
      mockPlan = [
        {
          id: 1,
          title: "Project Analysis & Planning",
          description: "Analyze requirements and create technical specification",
          completed: false,
          estimatedTime: "10 minutes",
          status: 'pending'
        },
        {
          id: 2,
          title: "Core Implementation",
          description: "Implement main functionality based on requirements",
          completed: false,
          estimatedTime: "30 minutes",
          dependencies: [1],
          status: 'pending'
        },
        {
          id: 3,
          title: "Feature Enhancement",
          description: "Add additional features and improvements",
          completed: false,
          estimatedTime: "20 minutes",
          dependencies: [2],
          status: 'pending'
        },
        {
          id: 4,
          title: "Testing & Validation",
          description: "Test functionality and validate against requirements",
          completed: false,
          estimatedTime: "15 minutes",
          dependencies: [3],
          status: 'pending'
        },
        {
          id: 5,
          title: "Documentation & Cleanup",
          description: "Add documentation and clean up code",
          completed: false,
          estimatedTime: "10 minutes",
          dependencies: [4],
          status: 'pending'
        }
      ];
    }

    return {
      data: { plan: mockPlan },
      success: true,
      message: `Plan generated successfully using ${model}`
    };
  },

  async executeStep(stepId: number, context: string, config?: LLMConfig): Promise<ApiResponse<{ code: string; explanation?: string }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Generate different code based on step ID
    const codeTemplates: Record<number, { code: string; explanation: string }> = {
      1: {
        code: `// Project Setup - Package.json and basic structure
{
  "name": "my-project",
  "version": "1.0.0",
  "description": "Generated project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "webpack --mode production",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0",
    "jest": "^29.0.0"
  }
}

// Basic project structure created
// - src/
// - public/
// - tests/
// - .env
// - README.md`,
        explanation: "Set up the basic project structure with package.json, folder organization, and essential dependencies."
      },
      2: {
        code: `// Frontend Framework Setup - React with Router
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Home from './components/Home';
import About from './components/About';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;

// Store configuration
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});`,
        explanation: "Configured React application with routing, state management using Redux Toolkit, and basic component structure."
      },
      3: {
        code: `// UI Components & Styling
import React from 'react';
import styled from 'styled-components';

const Container = styled.div\`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
\`;

const Header = styled.header\`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;
  text-align: center;
\`;

const Button = styled.button\`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #0056b3;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
\`;

const Card = styled.div\`
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin: 16px 0;
\`;

export { Container, Header, Button, Card };`,
        explanation: "Created reusable styled components with responsive design, hover effects, and modern styling patterns."
      },
      4: {
        code: `// Backend API Development
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        explanation: "Implemented Express.js backend with MongoDB integration, user model, and RESTful API endpoints with error handling."
      },
      5: {
        code: `// Integration & Testing
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// API service
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Custom hook for data fetching
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};

// Test file
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserList from './UserList';

test('renders user list', async () => {
  render(<UserList />);
  
  await waitFor(() => {
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});`,
        explanation: "Connected frontend to backend with proper error handling, created custom hooks for data fetching, and added basic tests."
      },
      6: {
        code: `// Deployment & Optimization
// Dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

// docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
  
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:

// Performance optimizations
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};`,
        explanation: "Configured Docker for containerized deployment, set up production build optimization, and implemented compression for better performance."
      },
      7: {
        code: `// Mobile App Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import DetailScreen from './screens/DetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen 
          name="HomeTab" 
          component={HomeStack} 
          options={{ headerShown: false, title: 'Home' }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;`,
        explanation: "Implemented a comprehensive navigation structure for a mobile app with tab navigation and nested stack navigation for detailed views."
      }
    };

    const template = codeTemplates[stepId] || {
      code: `// Step ${stepId} implementation
function step${stepId}Implementation() {
  console.log('Executing step ${stepId}');
  
  // Implementation details would go here
  // This is a placeholder for the actual functionality
  
  return {
    success: true,
    message: 'Step ${stepId} completed successfully'
  };
}

// Execute the step
const result = step${stepId}Implementation();
console.log(result);`,
      explanation: `Implemented step ${stepId} with basic functionality and logging.`
    };

    return {
      data: { 
        code: template.code,
        explanation: template.explanation
      },
      success: true,
      message: `Step ${stepId} executed successfully`
    };
  },

  async saveAgent(agent: AgentConfig): Promise<ApiResponse<{ agentId: string }>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { agentId: 'agent_' + Date.now() },
      success: true,
      message: `Agent "${agent.name}" saved successfully`
    };
  }
};

export const buildApi = {
  async getOptions(): Promise<ApiResponse<any[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: [
        { id: "local", name: "Local Build", description: "Build for local use" },
        { id: "web", name: "Web Deployment", description: "Build for web deployment" },
        { id: "hybrid", name: "Hybrid Build", description: "Build for both local and web use" }
      ],
      success: true
    };
  },

  async startBuild(config: BuildConfig): Promise<ApiResponse<{ buildId: string; status: string }>> {
    // Simulate build process with progress updates
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const buildId = 'build_' + Date.now();
    
    return {
      data: { 
        buildId,
        status: 'started'
      },
      success: true,
      message: `Build started for ${config.type} deployment`
    };
  },

  async getBuildStatus(buildId: string): Promise<ApiResponse<{ status: string; progress: number; logs: string[] }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate build progress
    const statuses = ['building', 'testing', 'packaging', 'deploying', 'completed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const progress = randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 90) + 10;
    
    return {
      data: {
        status: randomStatus,
        progress,
        logs: [
          'Installing dependencies...',
          'Running build process...',
          'Optimizing assets...',
          'Generating production bundle...'
        ]
      },
      success: true
    };
  }
};

export const filesApi = {
  async listFiles(): Promise<ApiResponse<FileItem[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockFiles: FileItem[] = [
      {
        name: 'src',
        type: 'directory',
        path: '/src',
        lastModified: new Date(Date.now() - 86400000), // 1 day ago
        children: [
          {
            name: 'App.tsx',
            type: 'file',
            path: '/src/App.tsx',
            size: 2048,
            lastModified: new Date(Date.now() - 3600000) // 1 hour ago
          },
          {
            name: 'components',
            type: 'directory',
            path: '/src/components',
            lastModified: new Date(Date.now() - 7200000), // 2 hours ago
            children: [
              {
                name: 'LLMSelector.tsx',
                type: 'file',
                path: '/src/components/LLMSelector.tsx',
                size: 4096,
                lastModified: new Date(Date.now() - 1800000) // 30 minutes ago
              },
              {
                name: 'FileManager.tsx',
                type: 'file',
                path: '/src/components/FileManager.tsx',
                size: 3072,
                lastModified: new Date(Date.now() - 900000) // 15 minutes ago
              }
            ]
          },
          {
            name: 'services',
            type: 'directory',
            path: '/src/services',
            lastModified: new Date(Date.now() - 5400000), // 1.5 hours ago
            children: [
              {
                name: 'api.ts',
                type: 'file',
                path: '/src/services/api.ts',
                size: 1536,
                lastModified: new Date(Date.now() - 600000) // 10 minutes ago
              }
            ]
          }
        ]
      },
      {
        name: 'public',
        type: 'directory',
        path: '/public',
        lastModified: new Date(Date.now() - 172800000), // 2 days ago
        children: [
          {
            name: 'index.html',
            type: 'file',
            path: '/public/index.html',
            size: 1024,
            lastModified: new Date(Date.now() - 172800000)
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        size: 512,
        lastModified: new Date(Date.now() - 43200000) // 12 hours ago
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        size: 256,
        lastModified: new Date(Date.now() - 86400000) // 1 day ago
      }
    ];

    return {
      data: mockFiles,
      success: true
    };
  },

  async saveFile(fileData: any): Promise<ApiResponse<{ fileId: string }>> {
    // Simulate file save with validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!fileData.name) {
      return {
        data: null as any,
        success: false,
        message: 'File name is required'
      };
    }
    
    return {
      data: { fileId: 'file_' + Date.now() },
      success: true,
      message: `File "${fileData.name}" saved successfully`
    };
  },

  async deleteFile(filePath: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: null,
      success: true,
      message: `File "${filePath}" deleted successfully`
    };
  },

  async getFileContent(filePath: string): Promise<ApiResponse<{ content: string }>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock file content based on file type
    let content = '';
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      content = `// ${filePath}
import React from 'react';

const Component = () => {
  return (
    <div>
      <h1>Hello from ${filePath}</h1>
    </div>
  );
};

export default Component;`;
    } else if (filePath.endsWith('.json')) {
      content = `{
  "name": "example",
  "version": "1.0.0",
  "description": "Generated file content"
}`;
    } else {
      content = `Content of ${filePath}`;
    }
    
    return {
      data: { content },
      success: true
    };
  }
};

export const githubApi = {
  async listRepos(): Promise<ApiResponse<any[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: [
        { name: "my-project", url: "https://github.com/user/my-project", stars: 5 },
        { name: "another-project", url: "https://github.com/user/another-project", stars: 10 }
      ],
      success: true
    };
  },

  async connectRepo(repoUrl: string): Promise<ApiResponse<{ repoId: string }>> {
    // Simulate GitHub connection with validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (!repoUrl.includes('github.com') && !repoUrl.includes('/')) {
      return {
        data: null as any,
        success: false,
        message: 'Invalid repository URL format'
      };
    }
    
    return {
      data: { repoId: 'repo_' + Date.now() },
      success: true,
      message: `Successfully connected to ${repoUrl}`
    };
  },

  async cloneRepo(repoUrl: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      data: null,
      success: true,
      message: `Repository cloned successfully from ${repoUrl}`
    };
  },

  async pushChanges(message: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      data: null,
      success: true,
      message: `Changes pushed successfully: "${message}"`
    };
  },

  async pullChanges(): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: null,
      success: true,
      message: 'Latest changes pulled successfully'
    };
  }
};

export const collaborationApi = {
  async getCollaborators(projectId: string): Promise<ApiResponse<any[]>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: [
        {
          id: 'user-1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          role: 'owner',
          status: 'online'
        },
        {
          id: 'user-2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          role: 'editor',
          status: 'online'
        },
        {
          id: 'user-3',
          name: 'Carol Davis',
          email: 'carol@example.com',
          role: 'viewer',
          status: 'offline'
        }
      ],
      success: true
    };
  },

  async inviteUser(projectId: string, email: string, role: string): Promise<ApiResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: null,
      success: true,
      message: `Invitation sent to ${email} for role ${role}`
    };
  },

  async addComment(projectId: string, comment: any): Promise<ApiResponse<{ commentId: string }>> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      data: { commentId: 'comment_' + Date.now() },
      success: true,
      message: 'Comment added successfully'
    };
  }
};

export const securityApi = {
  async scanCode(code: string, language: string): Promise<ApiResponse<any>> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate security scan results
    const issues = [];
    
    if (code.includes('eval(')) {
      issues.push({
        severity: 'critical',
        type: 'vulnerability',
        title: 'Code Injection Risk',
        description: 'Use of eval() can lead to code injection attacks'
      });
    }
    
    if (code.includes('http://')) {
      issues.push({
        severity: 'medium',
        type: 'best-practice',
        title: 'Insecure HTTP Protocol',
        description: 'Using HTTP instead of HTTPS for external requests'
      });
    }
    
    return {
      data: {
        score: issues.length > 0 ? 100 - (issues.length * 10) : 100,
        issues: issues
      },
      success: true
    };
  }
};

// Utility functions for API error handling
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const isApiError = (response: ApiResponse): boolean => {
  return !response.success;
};

export default api;