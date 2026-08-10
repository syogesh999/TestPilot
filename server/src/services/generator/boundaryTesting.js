const { generateSampleValue } = require('./happyPath');

function generateBoundaryTests(endpoint) {
  const { path, method, requestBody, id } = endpoint;
  const tests = [];

  if (!requestBody || !requestBody.schema || !requestBody.schema.properties) {
    return tests;
  }

  const baseBody = generateSampleValue(requestBody.schema);
  const properties = requestBody.schema.properties;

  for (const [propName, propSchema] of Object.entries(properties)) {
    // Numeric boundary tests (minimum, maximum)
    if (propSchema.type === 'integer' || propSchema.type === 'number') {
      const min = propSchema.minimum;
      const max = propSchema.maximum;

      if (min !== undefined) {
        // min - 1 (Invalid)
        tests.push({
          endpointId: id,
          type: 'BOUNDARY',
          description: `Boundary: Below minimum for '${propName}' (${propName} = ${min - 1}, min = ${min})`,
          reason: `Boundary value test: Property '${propName}' has minimum constraint ${min}. Setting value to ${min - 1} should be rejected with HTTP 400.`,
          priority: 'MEDIUM',
          request: {
            method,
            path,
            headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
            queryParams: {},
            pathParams: {},
            body: { ...baseBody, [propName]: min - 1 },
          },
          expectedResponse: { statusCode: 400 },
          assertions: [{ type: 'STATUS_CODE', expected: 400, message: `Expected HTTP 400 for ${propName} < minimum (${min})` }],
        });

        // min (Valid boundary)
        tests.push({
          endpointId: id,
          type: 'BOUNDARY',
          description: `Boundary: At minimum limit for '${propName}' (${propName} = ${min})`,
          reason: `Boundary value test: Property '${propName}' exactly equals lower boundary ${min}. Should accept with success code.`,
          priority: 'LOW',
          request: {
            method,
            path,
            headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
            queryParams: {},
            pathParams: {},
            body: { ...baseBody, [propName]: min },
          },
          expectedResponse: { statusCode: 200 },
          assertions: [{ type: 'STATUS_CODE', expected: 200, message: `Expected success for ${propName} = minimum (${min})` }],
        });
      }

      if (max !== undefined) {
        // max + 1 (Invalid)
        tests.push({
          endpointId: id,
          type: 'BOUNDARY',
          description: `Boundary: Above maximum for '${propName}' (${propName} = ${max + 1}, max = ${max})`,
          reason: `Boundary value test: Property '${propName}' has maximum constraint ${max}. Setting value to ${max + 1} should be rejected with HTTP 400.`,
          priority: 'MEDIUM',
          request: {
            method,
            path,
            headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
            queryParams: {},
            pathParams: {},
            body: { ...baseBody, [propName]: max + 1 },
          },
          expectedResponse: { statusCode: 400 },
          assertions: [{ type: 'STATUS_CODE', expected: 400, message: `Expected HTTP 400 for ${propName} > maximum (${max})` }],
        });
      }
    }

    // String length boundary tests (minLength, maxLength)
    if (propSchema.type === 'string') {
      const minLength = propSchema.minLength;
      const maxLength = propSchema.maxLength;

      if (minLength !== undefined && minLength > 0) {
        const tooShort = 'a'.repeat(minLength - 1);
        tests.push({
          endpointId: id,
          type: 'BOUNDARY',
          description: `Boundary: Below minLength for '${propName}' (length = ${tooShort.length}, min = ${minLength})`,
          reason: `Boundary length test: Property '${propName}' requires minLength ${minLength}. Length ${tooShort.length} should return HTTP 400.`,
          priority: 'MEDIUM',
          request: {
            method,
            path,
            headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
            queryParams: {},
            pathParams: {},
            body: { ...baseBody, [propName]: tooShort },
          },
          expectedResponse: { statusCode: 400 },
          assertions: [{ type: 'STATUS_CODE', expected: 400, message: `Expected HTTP 400 for ${propName} length < minLength` }],
        });
      }

      if (maxLength !== undefined) {
        const tooLong = 'a'.repeat(maxLength + 1);
        tests.push({
          endpointId: id,
          type: 'BOUNDARY',
          description: `Boundary: Exceeds maxLength for '${propName}' (length = ${tooLong.length}, max = ${maxLength})`,
          reason: `Boundary length test: Property '${propName}' has maxLength ${maxLength}. Length ${tooLong.length} should return HTTP 400.`,
          priority: 'MEDIUM',
          request: {
            method,
            path,
            headers: { 'Content-Type': requestBody.mediaType || 'application/json' },
            queryParams: {},
            pathParams: {},
            body: { ...baseBody, [propName]: tooLong },
          },
          expectedResponse: { statusCode: 400 },
          assertions: [{ type: 'STATUS_CODE', expected: 400, message: `Expected HTTP 400 for ${propName} length > maxLength` }],
        });
      }
    }
  }

  return tests;
}

module.exports = { generateBoundaryTests };
