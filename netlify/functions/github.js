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
    if (event.path === '/.netlify/functions/github/repos') {
      const mockRepos = [
        {
          name: "my-project",
          url: "https://github.com/user/my-project",
          stars: 5
        },
        {
          name: "another-project",
          url: "https://github.com/user/another-project",
          stars: 10
        }
      ];

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(mockRepos)
      };
    }

    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Not Found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};