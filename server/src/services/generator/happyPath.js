function generateSampleValue(schema, fieldName = '') {
  if (!schema) return 'sample_value';

  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) {
    return schema.enum[0];
  }

  if (schema.example !== undefined) return schema.example;
  if (schema.default !== undefined) return schema.default;

  const type = schema.type || 'string';

  switch (type) {
    case 'string':
      if (schema.format === 'email' || fieldName.toLowerCase().includes('email')) {
        return 'test.user@example.com';
      }
      if (schema.format === 'date-time' || schema.format === 'date') {
        return new Date().toISOString();
      }
      if (schema.format === 'uuid') {
        return '123e4567-e89b-12d3-a456-426614174000';
      }
      if (schema.format === 'password' || fieldName.toLowerCase().includes('pass')) {
        return 'SecretPass123!';
      }
      if (schema.minLength) {
        return 'a'.repeat(schema.minLength);
      }
      return `${fieldName || 'test'}_sample`;

    case 'integer':
    case 'number':
      if (schema.minimum !== undefined) return schema.minimum;
      if (schema.maximum !== undefined) return schema.maximum;
      return 42;

    case 'boolean':
      return true;

    case 'array':
      const itemSchema = schema.items || { type: 'string' };
      return [generateSampleValue(itemSchema, fieldName)];

    case 'object':
      const obj = {};
      const properties = schema.properties || {};
      for (const [propName, propSchema] of Object.entries(properties)) {
        obj[propName] = generateSampleValue(propSchema, propName);
      }
      return obj;

    default:
      return 'sample_data';
  }
}

function generateHappyPathTest(endpoint) {
  const { path, method, parameters, requestBody, responses, id } = endpoint;

  // Build path & query params
  const pathParams = {};
  const queryParams = {};
  const headers = {};

  parameters.forEach((param) => {
    const val = generateSampleValue(param.schema || { type: 'string' }, param.name);
    if (param.in === 'path') {
      pathParams[param.name] = val;
    } else if (param.in === 'query') {
      queryParams[param.name] = val;
    } else if (param.in === 'header') {
      headers[param.name] = val;
    }
  });

  // Build request body
  let body = null;
  if (requestBody && requestBody.schema) {
    body = generateSampleValue(requestBody.schema);
    if (requestBody.mediaType) {
      headers['Content-Type'] = requestBody.mediaType;
    }
  }

  // Determine expected success status code
  let expectedStatus = 200;
  if (responses['201']) expectedStatus = 201;
  else if (responses['204']) expectedStatus = 204;
  else if (responses['200']) expectedStatus = 200;
  else {
    const successKey = Object.keys(responses).find((k) => k.startsWith('2'));
    if (successKey) expectedStatus = parseInt(successKey, 10);
  }

  const successResponse = responses[expectedStatus.toString()];

  return {
    endpointId: id,
    type: 'HAPPY_PATH',
    description: `Happy Path: Valid ${method} request to ${path}`,
    reason: `Validates that sending a fully contract-compliant request to ${path} returns HTTP ${expectedStatus}.`,
    priority: 'CRITICAL',
    request: {
      method,
      path,
      headers,
      queryParams,
      pathParams,
      body,
    },
    expectedResponse: {
      statusCode: expectedStatus,
      schema: successResponse ? successResponse.schema : null,
    },
    assertions: [
      {
        type: 'STATUS_CODE',
        expected: expectedStatus,
        message: `Expected response status code ${expectedStatus}`,
      },
      ...(successResponse && successResponse.schema ? [{
        type: 'JSON_SCHEMA',
        expected: successResponse.schema,
        message: 'Response body must strictly conform to OpenAPI response schema',
      }] : []),
    ],
  };
}

module.exports = { generateHappyPathTest, generateSampleValue };
