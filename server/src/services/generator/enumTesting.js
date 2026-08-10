const { generateSampleValue } = require('./happyPath');

function generateEnumTests(endpoint) {
  const { path, method, requestBody, id } = endpoint;
  const tests = [];

  if (!requestBody || !requestBody.schema || !requestBody.schema.properties) {
    return tests;
  }

  const baseBody = generateSampleValue(requestBody.schema);
  const properties = requestBody.schema.properties;

  for (const [propName, propSchema] of Object.entries(properties)) {
    if (propSchema.enum && Array.isArray(propSchema.enum) && propSchema.enum.length > 0) {
      const invalidEnumValue = `INVALID_ENUM_${Date.now()}`;

      tests.push({
        endpointId: id,
        type: 'ENUM',
        description: `Enum: Invalid value '${invalidEnumValue}' for property '${propName}'`,
        reason: `Enum constraint test: Property '${propName}' only accepts allowed values: [${propSchema.enum.join(', ')}]. Sending '${invalidEnumValue}' should return HTTP 400.`,
        priority: 'MEDIUM',
        request: {
          method,
          path,
          headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
          queryParams: {},
          pathParams: {},
          body: { ...baseBody, [propName]: invalidEnumValue },
        },
        expectedResponse: { statusCode: 400 },
        assertions: [
          {
            type: 'STATUS_CODE',
            expected: 400,
            message: `Expected server to reject unlisted enum value for '${propName}' with HTTP 400`,
          },
        ],
      });
    }
  }

  return tests;
}

module.exports = { generateEnumTests };
