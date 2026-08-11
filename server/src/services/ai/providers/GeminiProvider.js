const axios = require('axios');
const config = require('../../../config/env');
const logger = require('../../../config/logger');

class GeminiProvider {
  constructor() {
    this.apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY;
    this.model = config.geminiModel || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 20000,
        }
      );

      const jsonText = response.data.candidates[0].content.parts[0].text;
      return JSON.parse(jsonText);
    } catch (err) {
      logger.error({ err: err.message }, 'Google Gemini API analysis failed');
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

module.exports = GeminiProvider;
