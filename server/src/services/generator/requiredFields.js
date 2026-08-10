const { generateSampleValue } = require('./happyPath');

function generateRequiredFieldsTests(endpoint) {
  const { path, method, requestBody, id } = endpoint;
  const tests = [];

  if (!requestBody || !requestBody.schema) {
    return tests;
  }

  const schema = requestBody.schema;
  const required = schema.required || [];

  if (!Array.isArray(required) || required.length === 0) {
    return tests;
  }

  const baseBody = generateSampleValue(schema);

  for (const field of required) {
    if (typeof baseBody === 'object' && baseBody !== null && field in baseBody) {
      const mutatedBody = { ...baseBody };
      delete mutatedBody[field];

      tests.push({
        endpointId: id,
        type: 'REQUIRED_FIELD',
        description: `Negative: Omit required property '${field}' in ${method} ${path}`,
        reason: `Contract test: Omitting required property '${field}' should be rejected with HTTP 400 Bad Request.`,
        priority: 'HIGH',
        request: {
          method,
          path,
          headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
          queryParams: {},
          pathParams: {},
          body: mutatedBody,
        },
        expectedResponse: {
          statusCode: 400,
        },
        assertions: [
          {
            type: 'STATUS_CODE',
            expected: 400,
            message: `Expected server to reject payload missing required field '${field}' with HTTP 400`,
          },
        ],
      });
    }
  }

  return tests;
}

module.exports = { generateRequiredFieldsTests };
