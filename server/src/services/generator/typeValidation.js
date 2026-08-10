const { generateSampleValue } = require('./happyPath');

function getInvalidTypeValue(expectedType) {
  switch (expectedType) {
    case 'string':
      return 12345; // number instead of string
    case 'integer':
    case 'number':
      return 'invalid_numeric_string'; // string instead of number
    case 'boolean':
      return 'not_a_boolean'; // string instead of boolean
    case 'array':
      return 'not_an_array'; // string instead of array
    case 'object':
      return 'not_an_object'; // string instead of object
    default:
      return null;
  }
}

function generateTypeValidationTests(endpoint) {
  const { path, method, requestBody, id } = endpoint;
  const tests = [];

  if (!requestBody || !requestBody.schema || !requestBody.schema.properties) {
    return tests;
  }

  const baseBody = generateSampleValue(requestBody.schema);
  const properties = requestBody.schema.properties;

  for (const [propName, propSchema] of Object.entries(properties)) {
    const expectedType = propSchema.type || 'string';
    const invalidVal = getInvalidTypeValue(expectedType);

    if (invalidVal !== null && typeof baseBody === 'object' && baseBody !== null) {
      const mutatedBody = { ...baseBody, [propName]: invalidVal };

      tests.push({
        endpointId: id,
        type: 'TYPE_VALIDATION',
        description: `Negative: Send invalid type for property '${propName}' (${typeof invalidVal} instead of ${expectedType})`,
        reason: `Contract test: Property '${propName}' requires type '${expectedType}'. Sending invalid type '${typeof invalidVal}' should return HTTP 400.`,
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
            message: `Expected server to reject invalid type for field '${propName}' with HTTP 400`,
          },
        ],
      });
    }
  }

  return tests;
}

module.exports = { generateTypeValidationTests };
