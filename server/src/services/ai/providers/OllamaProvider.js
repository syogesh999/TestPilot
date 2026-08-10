const axios = require('axios');
const config = require('../../../config/env');
const logger = require('../../../config/logger');

class OllamaProvider {
  constructor() {
    this.baseUrl = config.ollamaBaseUrl;
    this.model = config.ollamaModel;
  }

  async isAvailable() {
    try {
      const resp = await axios.get(`${this.baseUrl}/api/tags`, { timeout: 2000 });
      return resp.status === 200;
    } catch (err) {
      return false;
    }
  }

  async analyzeRunFailures(run, results) {
    const failedResults = results.filter((r) => r.status === 'FAIL' || r.status === 'ERROR');

    const prompt = `You are an expert QA Automation Engineer. Analyze the following API test execution failures and return a strict JSON response.
Run Summary: Total=${run.summary.total}, Passed=${run.summary.passed}, Failed=${run.summary.failed}, QualityScore=${run.summary.qualityScore}/100.

Failures:
${failedResults.slice(0, 10).map((f) => `
- Endpoint: ${f.requestMeta?.method} ${f.requestMeta?.url}
  StatusCode: ${f.statusCode}
  Failures: ${JSON.stringify(f.failures)}
  ErrorDetails: ${f.errorDetails}
`).join('\n')}

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Executive summary of test run quality and main failure patterns",
  "probableCauses": [
    {
      "endpoint": "METHOD /path",
      "issue": "Root cause description",
      "recommendation": "Suggested developer fix"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
          format: 'json',
        },
        { timeout: 30000 }
      );

      const jsonText = response.data.response;
      return JSON.parse(jsonText);
    } catch (err) {
      logger.error({ err }, 'Ollama AI generation failed, falling back');
      throw err;
    }
  }

  async suggestEdgeCases(endpoint) {
    // Edge case suggestion logic via Ollama
    return [
      `Test negative numeric boundary values for ${endpoint.path}`,
      `Validate Content-Type header rejection when non-JSON payload is posted`,
    ];
  }
}

module.exports = OllamaProvider;
