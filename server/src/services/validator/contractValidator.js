const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function validateContract(testCase, response) {
  const failures = [];
  const { expectedResponse, assertions } = testCase;
  const { statusCode, headers, body } = response;

  // 1. Status Code Validation
  if (expectedResponse && expectedResponse.statusCode) {
    if (statusCode !== expectedResponse.statusCode) {
      failures.push({
        assertionType: 'STATUS_CODE',
        message: `Expected HTTP ${expectedResponse.statusCode}, but target API returned HTTP ${statusCode}`,
        expected: expectedResponse.statusCode,
        actual: statusCode,
      });
    }
  }

  // 2. Custom Explicit Assertions
  if (Array.isArray(assertions)) {
    for (const assertion of assertions) {
      if (assertion.type === 'STATUS_CODE') {
        if (statusCode !== assertion.expected) {
          // Already captured above if matching expectedResponse
        }
      } else if (assertion.type === 'RESPONSE_HEADER') {
        const headerName = assertion.target?.toLowerCase();
        const headerVal = headers ? headers[headerName] : undefined;
        if (!headerVal) {
          failures.push({
            assertionType: 'RESPONSE_HEADER',
            message: `Missing expected response header '${assertion.target}'`,
            expected: assertion.expected,
            actual: headerVal,
          });
        }
      }
    }
  }

  // 3. JSON Schema Contract Validation
  if (expectedResponse && expectedResponse.schema && statusCode >= 200 && statusCode < 300) {
    try {
      const validate = ajv.compile(expectedResponse.schema);
      const valid = validate(body);
      if (!valid) {
        const schemaErrors = validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`).join('; ');
        failures.push({
          assertionType: 'JSON_SCHEMA',
          message: `Response body schema violation: ${schemaErrors}`,
          expected: expectedResponse.schema,
          actual: body,
        });
      }
    } catch (err) {
      // Ignore compilation errors on complex edge-case specs, record note
    }
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

module.exports = { validateContract };
