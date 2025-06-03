const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      }
    };
  }

  try {
    switch (event.path) {
      case '/.netlify/functions/llm/models':
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            models: [
              { id: "gemini", name: "Google Gemini", available: true },
              { id: "mistral", name: "Mistral AI", available: true },
              { id: "groq", name: "Groq", available: true },
              { id: "ollama", name: "Ollama (Local)", available: true, endpoint: "127.0.0.1:9632" }
            ]
          })
        };

      case '/.netlify/functions/llm/generate-plan':
        const { input, model } = JSON.parse(event.body);
        
        const mockPlan = [
          { id: 1, title: "Setup project structure", description: "Create basic folder structure and initialize project files", estimated_time: "5 minutes" },
          { id: 2, title: "Create HTML layout", description: "Implement the basic HTML structure for the application", estimated_time: "10 minutes" },
          { id: 3, title: "Add CSS styling", description: "Style the application with CSS to match design requirements", estimated_time: "15 minutes" },
          { id: 4, title: "Implement core functionality", description: "Add JavaScript code for the main application features", estimated_time: "30 minutes" },
          { id: 5, title: "Test and debug", description: "Test the application and fix any issues", estimated_time: "20 minutes" }
        ];

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            plan: mockPlan,
            model_used: model,
            input: input
          })
        };

      case '/.netlify/functions/llm/execute-step':
        const { step_id, plan_id } = JSON.parse(event.body);
        
        const mockCode = `
function setupApplication() {
  const app = document.getElementById('app');
  app.innerHTML = '<h1>Hello World</h1>';
  console.log('Application initialized');
  return app;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  setupApplication();
});`;

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            step_id: step_id,
            code: mockCode,
            message: `Step ${step_id} executed successfully`
          })
        };

      default:
        return {
          statusCode: 404,
          body: JSON.stringify({ error: 'Not Found' })
        };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};