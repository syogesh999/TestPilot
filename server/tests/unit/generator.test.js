const { generateHappyPathTest } = require('../../src/services/generator/happyPath');
const { generateRequiredFieldsTests } = require('../../src/services/generator/requiredFields');
const { generateBoundaryTests } = require('../../src/services/generator/boundaryTesting');
const { generateEnumTests } = require('../../src/services/generator/enumTesting');

describe('Deterministic Test Generators Unit Tests', () => {
  const sampleEndpoint = {
    id: 'POST__users',
    path: '/users',
    method: 'POST',
    summary: 'Create User',
    parameters: [],
    requestBody: {
      required: true,
      mediaType: 'application/json',
      schema: {
        type: 'object',
        required: ['email', 'name'],
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer', minimum: 18, maximum: 100 },
          role: { type: 'string', enum: ['admin', 'user'] },
        },
      },
    },
    responses: {
      '201': { description: 'Created' },
    },
  };

  test('generateHappyPathTest generates contract-compliant payload and HTTP 201 expected status', () => {
    const happy = generateHappyPathTest(sampleEndpoint);
    expect(happy.type).toBe('HAPPY_PATH');
    expect(happy.expectedResponse.statusCode).toBe(201);
    expect(happy.request.body.email).toBe('test.user@example.com');
    expect(happy.request.body.age).toBe(18);
  });

  test('generateRequiredFieldsTests generates negative tests for missing email and name', () => {
    const reqTests = generateRequiredFieldsTests(sampleEndpoint);
    expect(reqTests.length).toBe(2);
    expect(reqTests.some((t) => t.description.includes("'email'"))).toBe(true);
    expect(reqTests.some((t) => t.description.includes("'name'"))).toBe(true);
    expect(reqTests[0].expectedResponse.statusCode).toBe(400);
  });

  test('generateBoundaryTests generates min, min-1, max+1 boundary tests for age', () => {
    const boundaryTests = generateBoundaryTests(sampleEndpoint);
    expect(boundaryTests.length).toBeGreaterThan(0);
    const belowMin = boundaryTests.find((t) => t.description.includes('Below minimum'));
    expect(belowMin).toBeDefined();
    expect(belowMin.request.body.age).toBe(17);
  });

  test('generateEnumTests generates test case for unlisted enum value', () => {
    const enumTests = generateEnumTests(sampleEndpoint);
    expect(enumTests.length).toBe(1);
    expect(enumTests[0].type).toBe('ENUM');
    expect(enumTests[0].expectedResponse.statusCode).toBe(400);
  });
});
