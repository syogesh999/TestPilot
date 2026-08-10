const { parseSpecContent } = require('../../src/services/openapi/parser');
const { extractEndpoints } = require('../../src/services/openapi/extractor');

describe('OpenAPI Importer & Extractor Unit Tests', () => {
  const sampleYaml = `
openapi: 3.0.0
info:
  title: Test API
  version: 1.0.0
paths:
  /users:
    get:
      summary: List users
      responses:
        '200':
          description: OK
    post:
      summary: Create user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - email
              properties:
                email:
                  type: string
  `;

  test('parseSpecContent correctly parses valid YAML string', () => {
    const result = parseSpecContent(sampleYaml);
    expect(result.format).toBe('yaml');
    expect(result.version).toBe('3.0.0');
    expect(result.document.info.title).toBe('Test API');
  });

  test('extractEndpoints correctly extracts GET and POST endpoints', () => {
    const parsed = parseSpecContent(sampleYaml);
    const { endpoints } = extractEndpoints(parsed.document);

    expect(endpoints.length).toBe(2);
    const getEndpoint = endpoints.find((e) => e.method === 'GET');
    const postEndpoint = endpoints.find((e) => e.method === 'POST');

    expect(getEndpoint).toBeDefined();
    expect(postEndpoint).toBeDefined();
    expect(postEndpoint.requestBody.required).toBe(true);
  });
});
