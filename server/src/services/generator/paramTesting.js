const { generateSampleValue } = require('./happyPath');

function generateParamTests(endpoint) {
  const { path, method, parameters, id } = endpoint;
  const tests = [];

  if (!Array.isArray(parameters) || parameters.length === 0) {
    return tests;
  }

  // Find required parameters
  const requiredParams = parameters.filter((p) => p.required);

  for (const param of requiredParams) {
    if (param.in === 'query') {
      tests.push({
        endpointId: id,
        type: 'PARAMETER',
        description: `Parameter: Missing required query parameter '${param.name}' in ${method} ${path}`,
        reason: `Query parameter '${param.name}' is marked required. Omitting it should result in HTTP 400 Bad Request.`,
        priority: 'HIGH',
        request: {
          method,
          path,
          headers: {},
          queryParams: {}, // Missing required param
          pathParams: {},
          body: null,
        },
        expectedResponse: { statusCode: 400 },
        assertions: [
          {
            type: 'STATUS_CODE',
            expected: 400,
            message: `Expected HTTP 400 for missing required query param '${param.name}'`,
          },
        ],
      });
    }
  }

  return tests;
}

module.exports = { generateParamTests };
