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
}

export interface LLMModel {
  id: string;
  name: string;
  available: boolean;
  endpoint?: string;
}

// Mock API implementations
export const llmApi = {
  async generatePlan(userInput: string, model: string): Promise<ApiResponse<{ plan: PlanStep[] }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock plan generation
    const mockPlan: PlanStep[] = [
      {
        id: 1,
        title: "Project Setup",
        description: "Initialize project structure and dependencies",
        completed: false
      },
      {
        id: 2,
        title: "Core Implementation",
        description: "Implement main functionality based on requirements",
        completed: false
      },
      {
        id: 3,
        title: "Testing & Validation",
        description: "Add tests and validate functionality",
        completed: false
      },
      {
        id: 4,
        title: "Final Polish",
        description: "Add styling and final touches",
        completed: false
      }
    ];

    return {
      data: { plan: mockPlan },
      success: true,
      message: "Plan generated successfully"
    };
  },

  async executeStep(stepId: number, context: string): Promise<ApiResponse<{ code: string }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockCode = `// Step ${stepId} implementation
function step${stepId}Implementation() {
  console.log('Executing step ${stepId}');
  // Implementation code would go here
  return 'Step ${stepId} completed successfully';
}

step${stepId}Implementation();`;

    return {
      data: { code: mockCode },
      success: true,
      message: `Step ${stepId} executed successfully`
    };
  },

  async getModels(): Promise<ApiResponse<{ models: LLMModel[] }>> {
    const mockModels: LLMModel[] = [
      {
        id: 'gemini',
        name: 'Google Gemini',
        available: true
      },
      {
        id: 'gpt-4',
        name: 'OpenAI GPT-4',
        available: true
      },
      {
        id: 'claude',
        name: 'Anthropic Claude',
        available: true
      },
      {
        id: 'ollama',
        name: 'Ollama Local',
        available: true,
        endpoint: 'http://localhost:11434'
      }
    ];

    return {
      data: { models: mockModels },
      success: true
    };
  }
};

export const buildApi = {
  async startBuild(config: BuildConfig): Promise<ApiResponse> {
    // Simulate build process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      data: { buildId: 'build_' + Date.now() },
      success: true,
      message: `Build started for ${config.type}`
    };
  }
};

export const filesApi = {
  async listFiles(): Promise<ApiResponse<FileItem[]>> {
    const mockFiles: FileItem[] = [
      {
        name: 'src',
        type: 'directory',
        path: '/src',
        children: [
          {
            name: 'App.tsx',
            type: 'file',
            path: '/src/App.tsx',
            size: 1024
          },
          {
            name: 'components',
            type: 'directory',
            path: '/src/components',
            children: [
              {
                name: 'LLMSelector.tsx',
                type: 'file',
                path: '/src/components/LLMSelector.tsx',
                size: 512
              }
            ]
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        size: 256
      }
    ];

    return {
      data: mockFiles,
      success: true
    };
  },

  async saveFile(fileData: any): Promise<ApiResponse> {
    // Simulate file save
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: { fileId: 'file_' + Date.now() },
      success: true,
      message: 'File saved successfully'
    };
  }
};

export const githubApi = {
  async connectRepo(repoUrl: string): Promise<ApiResponse> {
    // Simulate GitHub connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      data: { repoId: 'repo_' + Date.now() },
      success: true,
      message: `Connected to ${repoUrl}`
    };
  }
};