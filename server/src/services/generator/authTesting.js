function generateAuthTests(endpoint) {
  const { path, method, security, id } = endpoint;
  const tests = [];

  if (!security || security.length === 0) {
    return tests;
  }

  // 1. Missing Token Test
  tests.push({
    endpointId: id,
    type: 'AUTHENTICATION',
    description: `Auth: Missing authorization header for protected route ${method} ${path}`,
    reason: `Security test: ${method} ${path} requires authentication. Omitting the Authorization header must return HTTP 401 Unauthorized.`,
    priority: 'HIGH',
    request: {
      method,
      path,
      headers: {}, // Omit auth header intentionally
      queryParams: {},
      pathParams: {},
      body: null,
    },
    expectedResponse: { statusCode: 401 },
    assertions: [
      {
        type: 'STATUS_CODE',
        expected: 401,
        message: 'Expected HTTP 401 Unauthorized when requesting protected endpoint without token',
      },
    ],
  });

  // 2. Malformed Token Test
  tests.push({
    endpointId: id,
    type: 'AUTHENTICATION',
    description: `Auth: Malformed token for protected route ${method} ${path}`,
    reason: `Security test: Sending an invalid/malformed Bearer token must return HTTP 401 Unauthorized.`,
    priority: 'HIGH',
    request: {
      method,
      path,
      headers: { Authorization: 'Bearer INVALID_EXPIRED_MALFORMED_TOKEN_XYZ' },
      queryParams: {},
      pathParams: {},
      body: null,
    },
    expectedResponse: { statusCode: 401 },
    assertions: [
      {
        type: 'STATUS_CODE',
        expected: 401,
        message: 'Expected HTTP 401 Unauthorized for malformed Bearer token',
      },
    ],
  });

  return tests;
}

module.exports = { generateAuthTests };
