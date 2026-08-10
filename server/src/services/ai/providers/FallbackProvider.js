class FallbackProvider {
  async analyzeRunFailures(run, results) {
    const failedResults = results.filter((r) => r.status === 'FAIL' || r.status === 'ERROR');

    const probableCauses = failedResults.map((f) => {
      const endpoint = `${f.requestMeta?.method || 'GET'} ${f.requestMeta?.url || ''}`;
      let issue = 'Unexpected API response behavior';
      let recommendation = 'Review API endpoint implementation and OpenAPI schema contract';

      if (f.failures && f.failures.length > 0) {
        const firstFail = f.failures[0];
        if (firstFail.assertionType === 'STATUS_CODE') {
          issue = `Status code mismatch: expected ${firstFail.expected}, got ${firstFail.actual}`;
          recommendation = `Ensure controller handles input validation errors cleanly and returns HTTP status ${firstFail.expected}`;
        } else if (firstFail.assertionType === 'JSON_SCHEMA') {
          issue = `Response JSON Schema contract violation: ${firstFail.message}`;
          recommendation = `Align response DTO object fields with the schema defined in openapi.yaml`;
        }
      } else if (f.errorDetails) {
        issue = `Execution Error: ${f.errorDetails}`;
        recommendation = `Verify target server port, connectivity, and database availability`;
      }

      return {
        endpoint,
        issue,
        recommendation,
      };
    });

    const recommendations = [
      'Enforce input schema validation middleware for all POST/PUT routes',
      'Ensure unauthenticated requests consistently return HTTP 401 Unauthorized',
      'Verify min/max numeric constraints in endpoint request handlers',
    ];

    return {
      summary: `Automated Analysis Report: Test suite run completed with ${run.summary.passed} PASSED, ${run.summary.failed} FAILED, and ${run.summary.error} ERRORS out of ${run.summary.total} total cases. Overall Quality Score is ${run.summary.qualityScore}/100.`,
      probableCauses,
      recommendations,
    };
  }

  async suggestEdgeCases(endpoint) {
    return [
      `Test sending empty string for required text parameters in ${endpoint.path}`,
      `Test payload with max length overflow for string properties`,
    ];
  }
}

module.exports = FallbackProvider;
