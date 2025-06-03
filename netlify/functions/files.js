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
      case '/.netlify/functions/files/list':
        const mockFiles = [
          {
            name: "index.html",
            type: "file",
            path: "/project/index.html",
            size: 1024
          },
          {
            name: "styles",
            type: "directory",
            path: "/project/styles",
            children: [
              {
                name: "main.css",
                type: "file",
                path: "/project/styles/main.css",
                size: 512
              }
            ]
          },
          {
            name: "scripts",
            type: "directory",
            path: "/project/scripts",
            children: [
              {
                name: "app.js",
                type: "file",
                path: "/project/scripts/app.js",
                size: 2048
              }
            ]
          }
        ];

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(mockFiles)
        };

      case '/.netlify/functions/files/save':
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            success: true,
            message: "File saved successfully"
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