const axios = require('axios');
const config = require('../../../config/env');
const logger = require('../../../config/logger');

class OpenAIProvider {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  isAvailable() {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  async analyzeRunFailures(run, results) {
    const failedResults = results.filter((r) => r.status === 'FAIL' || r.status === 'ERROR');

    const prompt = `You are a Senior API Quality & Security Engineer. Analyze these API test failures and return a strict JSON response.
Run Summary: Total=${run.summary.total}, Passed=${run.summary.passed}, Failed=${run.summary.failed}, QualityScore=${run.summary.qualityScore}/100.

Failures:
${failedResults.slice(0, 15).map((f) => `
- Endpoint: ${f.requestMeta?.method} ${f.requestMeta?.url}
  StatusCode: ${f.statusCode}
  Failures: ${JSON.stringify(f.failures)}
  ErrorDetails: ${f.errorDetails}
`).join('\n')}

Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Executive summary of quality report and failure patterns",
  "probableCauses": [
    {
      "endpoint": "METHOD /path",
      "issue": "Root cause description",
      "recommendation": "Actionable developer fix"
    }
  ],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are an API Testing Engine that outputs strict JSON.' },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        }
      );

      const jsonText = response.data.choices[0].message.content;
      return JSON.parse(jsonText);
    } catch (err) {
      logger.error({ err: err.message }, 'OpenAI API analysis failed');
      throw err;
    }
  }

  async suggestEdgeCases(endpoint) {
    return [
      `Validate payload rejection on negative boundary values for ${endpoint.path}`,
      `Test request handling with oversized headers or unlisted Content-Type`,
    ];
  }
}

module.exports = OpenAIProvider;
