const { request } = require('@playwright/test');
const { validateTargetUrl } = require('../../middleware/ssrfProtection');
const { validateContract } = require('../validator/contractValidator');
const config = require('../../config/env');
const logger = require('../../config/logger');

async function executeSingleTestCase(apiContext, testCase, environment) {
  const { request: reqDef, expectedResponse } = testCase;
  const baseUrl = environment.baseUrl.replace(/\/$/, '');

  // Build target URL
  let path = reqDef.path;
  if (reqDef.pathParams) {
    const paramsObj = reqDef.pathParams instanceof Map ? Object.fromEntries(reqDef.pathParams) : reqDef.pathParams;
    for (const [key, val] of Object.entries(paramsObj)) {
      path = path.replace(`{${key}}`, encodeURIComponent(String(val)));
    }
  }

  let fullUrl = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  // Append query params if present
  if (reqDef.queryParams) {
    const qObj = reqDef.queryParams instanceof Map ? Object.fromEntries(reqDef.queryParams) : reqDef.queryParams;
    const queryEntries = Object.entries(qObj).filter(([_, v]) => v !== undefined && v !== null);
    if (queryEntries.length > 0) {
      const searchParams = new URLSearchParams();
      queryEntries.forEach(([k, v]) => searchParams.append(k, String(v)));
      fullUrl += `?${searchParams.toString()}`;
    }
  }

  // Check SSRF
  const ssrfCheck = validateTargetUrl(fullUrl, true);
  if (!ssrfCheck.valid) {
    return {
      status: 'ERROR',
      statusCode: null,
      durationMs: 0,
      requestMeta: { url: fullUrl, method: reqDef.method },
      responseMeta: null,
      failures: [],
      errorDetails: `SSRF Blocked: ${ssrfCheck.reason}`,
    };
  }

  // Construct Headers (Merge Environment Auth + Test Case Headers)
  const headers = {
    'User-Agent': 'TestPilot-API-Quality-Engine/1.0',
    ...(reqDef.headers instanceof Map ? Object.fromEntries(reqDef.headers) : (reqDef.headers || {})),
  };

  if (environment.authConfig && (environment.authConfig.authType === 'bearer' || environment.authConfig.type === 'bearer') && environment.authConfig.token) {
    // Only set environment auth if test case doesn't intentionally override or test invalid auth
    if (testCase.type !== 'AUTHENTICATION' && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${environment.authConfig.token}`;
    }
  }

  const startTime = Date.now();
  let response = null;

  try {
    const fetchOptions = {
      headers,
      timeout: config.requestTimeoutMs,
    };

    if (reqDef.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(reqDef.method)) {
      fetchOptions.data = reqDef.body;
    }

    response = await apiContext.fetch(fullUrl, {
      method: reqDef.method,
      ...fetchOptions,
    });

    const durationMs = Date.now() - startTime;
    const statusCode = response.status();
    const respHeaders = response.headers();

    let respBody = null;
    const contentType = respHeaders['content-type'] || '';
    if (contentType.includes('application/json')) {
      try {
        respBody = await response.json();
      } catch (e) {
        respBody = await response.text();
      }
    } else {
      respBody = await response.text();
    }

    const resultMeta = {
      url: fullUrl,
      method: reqDef.method,
      headers,
      body: reqDef.body,
    };

    const responseMeta = {
      headers: respHeaders,
      body: respBody,
    };

    // Run Contract & Assertion Validation
    const validation = validateContract(testCase, {
      statusCode,
      headers: respHeaders,
      body: respBody,
    });

    return {
      status: validation.passed ? 'PASS' : 'FAIL',
      statusCode,
      durationMs,
      requestMeta: resultMeta,
      responseMeta,
      failures: validation.failures,
      errorDetails: null,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error({ err: error, url: fullUrl }, 'Playwright API Request Execution Error');

    return {
      status: 'ERROR',
      statusCode: null,
      durationMs,
      requestMeta: { url: fullUrl, method: reqDef.method, headers },
      responseMeta: null,
      failures: [],
      errorDetails: error.message || 'Network error / request timeout',
    };
  }
}

async function runTestSuite(testCases, environment) {
  const apiContext = await request.newContext({
    ignoreHTTPSErrors: true,
  });

  const results = [];

  try {
    for (const testCase of testCases) {
      if (!testCase.enabled) {
        results.push({
          testCaseId: testCase._id,
          status: 'SKIPPED',
          durationMs: 0,
          failures: [],
        });
        continue;
      }

      const res = await executeSingleTestCase(apiContext, testCase, environment);
      results.push({
        testCaseId: testCase._id,
        ...res,
      });
    }
  } finally {
    await apiContext.dispose();
  }

  return results;
}

module.exports = { executeSingleTestCase, runTestSuite };
