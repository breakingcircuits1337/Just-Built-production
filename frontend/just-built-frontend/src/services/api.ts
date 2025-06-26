import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000/api' 
    : '/.netlify/functions',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const llmApi = {
  getModels: () => api.get('/llm/models'),
  generatePlan: (input: string, model: string) => 
    api.post('/llm/generate-plan', { input, model }),
  executeStep: (stepId: number, planId: string) => 
    api.post('/llm/execute-step', { step_id: stepId, plan_id: planId }),
};

export const filesApi = {
  listFiles: () => api.get('/files/list'),
  saveFile: (fileData: any) => api.post('/files/save', fileData),
};

export const githubApi = {
  listRepos: () => api.get('/github/repos'),
};

export const buildApi = {
  getOptions: () => api.get('/build/options'),
  startBuild: (buildConfig: any) => api.post('/build/start', buildConfig),
};

export default api;