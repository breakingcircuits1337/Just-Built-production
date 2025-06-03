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
      case '/.netlify/functions/build/options':
        const options = [
          {
            id: "local",
            name: "Local Build",
            description: "Build for local use"
          },
          {
            id: "web",
            name: "Web Deployment",
            description: "Build for web deployment"
          },
          {
            id: "hybrid",
            name: "Hybrid Build",
            description: "Build for both local and web use"
          }
        ];

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(options)
        };

      case '/.netlify/functions/build/start':
        const { type } = JSON.parse(event.body);
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            build_id: "build-123",
            message: `Build process started for ${type}`
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