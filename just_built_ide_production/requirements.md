# Just Built IDE - Requirements Analysis

## Overview
"Just Built" is a web browser-based Integrated Development Environment (IDE) that leverages multiple Large Language Models (LLMs) to automate application development. The system allows users to input project requirements in natural language, after which the selected LLM researches the topic, creates a step-by-step development plan, and can automatically execute the plan to build the requested application. This document outlines the comprehensive requirements for the Just Built IDE.

## Core Functionality

### Project Planning and Execution
The IDE will provide a workflow where users describe what they want to build in natural language. The system will then:
1. Research information related to the user query using integrated RAG (Retrieval-Augmented Generation)
2. Generate a detailed, step-by-step development plan
3. Display this plan to the user for review
4. Allow users to edit existing steps or add new steps as needed
5. Provide options for automatic execution of the entire plan or manual execution of individual steps

### LLM Integration and Selection
The IDE will support multiple LLM backends with the following capabilities:
- User selection of preferred LLM for code generation
- Support for major LLM providers including:
  - Google's Gemini
  - Mistral AI
  - Groq
  - Local models via OLLAMA (connecting to 127.0.0.1:9632)
- A "mixture mode" allowing 2-4 different LLMs to collaborate on building the application
- User control over which LLMs participate in mixture mode when using 3 or fewer models

### Code Editor Interface
The interface will include:
- A dedicated code editor panel where the LLM writes and displays generated code
- Syntax highlighting and code formatting capabilities
- Real-time updates as the LLM generates code
- Options for user intervention and editing

### File Management
The IDE will support comprehensive file operations including:
- Upload functionality for existing code and assets
- Download capability for completed projects and individual files
- Import/export functionality for project configurations and templates
- GitHub integration for repository creation, cloning, pushing, and pulling

### Build and Deployment Options
The system will provide flexible build options:
- Building applications for local use (desktop/mobile applications)
- Building applications for web deployment
- Hybrid build options supporting both local and web deployment
- Export options for different platforms and environments

### Specialized Agent Support
The IDE will include specialized agent configurations:
- Custom agent creation capabilities for Gemini, Mistral, and Groq
- A dedicated cybersecurity agent specifically designed for ethical security projects
- Clear identification of the system as being used for defensive security purposes
- Safeguards to ensure AI is used for ethical "white hat" security development

### Performance Optimization
To maintain high-quality code generation over extended sessions:
- Implementation of a "rest" option allowing the LLM to pause and reset
- Context preservation mechanisms ensuring the LLM remembers previous work after reset
- Progress tracking to avoid redundant work after resets
- Optimization techniques to prevent model degradation during long coding sessions

## Technical Requirements

### Frontend Components
- Responsive web interface compatible with modern browsers
- Split-pane layout with code editor, plan display, and control panels
- Intuitive UI for LLM selection and configuration
- Real-time progress indicators for automated build steps

### Backend Services
- API integration with multiple LLM providers
- Local model support via OLLAMA
- GitHub API integration
- File storage and management system
- Build pipeline for various deployment targets

### Security Considerations
- Secure handling of API keys and credentials
- Ethical use guidelines for security-related development
- Code scanning for potential vulnerabilities
- User authentication and authorization

## Implementation Priorities
1. Core IDE interface and code editor functionality
2. LLM integration and selection mechanisms
3. Project planning and step execution framework
4. File management and GitHub integration
5. Build and deployment options
6. Specialized agent configurations
7. Performance optimization features

This requirements document will guide the development of the Just Built IDE, ensuring all user-requested features are properly implemented and integrated into a cohesive development environment.
