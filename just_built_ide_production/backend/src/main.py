import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))  # DON'T CHANGE THIS !!!

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Routes for LLM operations
@app.route('/api/llm/models', methods=['GET'])
def get_available_models():
    """Return a list of available LLM models"""
    models = [
        {"id": "gemini", "name": "Google Gemini", "available": True},
        {"id": "mistral", "name": "Mistral AI", "available": True},
        {"id": "groq", "name": "Groq", "available": True},
        {"id": "ollama", "name": "Ollama (Local)", "available": True, "endpoint": "127.0.0.1:9632"}
    ]
    return jsonify(models)

@app.route('/api/llm/generate-plan', methods=['POST'])
def generate_plan():
    """Generate a development plan based on user input"""
    data = request.json
    user_input = data.get('input', '')
    selected_model = data.get('model', 'gemini')
    
    # Mock response for now - will be replaced with actual LLM calls
    mock_plan = [
        {"id": 1, "title": "Setup project structure", "description": "Create basic folder structure and initialize project files", "estimated_time": "5 minutes"},
        {"id": 2, "title": "Create HTML layout", "description": "Implement the basic HTML structure for the application", "estimated_time": "10 minutes"},
        {"id": 3, "title": "Add CSS styling", "description": "Style the application with CSS to match design requirements", "estimated_time": "15 minutes"},
        {"id": 4, "title": "Implement core functionality", "description": "Add JavaScript code for the main application features", "estimated_time": "30 minutes"},
        {"id": 5, "title": "Test and debug", "description": "Test the application and fix any issues", "estimated_time": "20 minutes"}
    ]
    
    return jsonify({
        "plan": mock_plan,
        "model_used": selected_model,
        "input": user_input
    })

@app.route('/api/llm/execute-step', methods=['POST'])
def execute_step():
    """Execute a specific step in the development plan"""
    data = request.json
    step_id = data.get('step_id')
    plan_id = data.get('plan_id')
    
    # Mock response - will be replaced with actual LLM code generation
    mock_code = """
    function setupApplication() {
      const app = document.getElementById('app');
      app.innerHTML = '<h1>Hello World</h1>';
      console.log('Application initialized');
      return app;
    }
    
    // Initialize the application
    document.addEventListener('DOMContentLoaded', () => {
      setupApplication();
    });
    """
    
    return jsonify({
        "success": True,
        "step_id": step_id,
        "code": mock_code,
        "message": f"Step {step_id} executed successfully"
    })

# Routes for file management
@app.route('/api/files/list', methods=['GET'])
def list_files():
    """List all files in the project"""
    # Mock response - will be replaced with actual file system operations
    mock_files = [
        {"name": "index.html", "type": "file", "path": "/project/index.html", "size": 1024},
        {"name": "styles", "type": "directory", "path": "/project/styles", "children": [
            {"name": "main.css", "type": "file", "path": "/project/styles/main.css", "size": 512}
        ]},
        {"name": "scripts", "type": "directory", "path": "/project/scripts", "children": [
            {"name": "app.js", "type": "file", "path": "/project/scripts/app.js", "size": 2048}
        ]}
    ]
    return jsonify(mock_files)

@app.route('/api/files/save', methods=['POST'])
def save_file():
    """Save a file to the project"""
    # Will be implemented with actual file system operations
    return jsonify({"success": True, "message": "File saved successfully"})

# GitHub integration routes
@app.route('/api/github/repos', methods=['GET'])
def list_github_repos():
    """List GitHub repositories for the authenticated user"""
    # Will be implemented with GitHub API integration
    mock_repos = [
        {"name": "my-project", "url": "https://github.com/user/my-project", "stars": 5},
        {"name": "another-project", "url": "https://github.com/user/another-project", "stars": 10}
    ]
    return jsonify(mock_repos)

# Build and deployment routes
@app.route('/api/build/options', methods=['GET'])
def get_build_options():
    """Get available build options"""
    options = [
        {"id": "local", "name": "Local Build", "description": "Build for local use"},
        {"id": "web", "name": "Web Deployment", "description": "Build for web deployment"},
        {"id": "hybrid", "name": "Hybrid Build", "description": "Build for both local and web use"}
    ]
    return jsonify(options)

@app.route('/api/build/start', methods=['POST'])
def start_build():
    """Start a build process"""
    data = request.json
    build_type = data.get('type', 'web')
    
    return jsonify({
        "success": True,
        "build_id": "build-123",
        "message": f"Build process started for {build_type}"
    })

# Serve static files from the React build directory in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
