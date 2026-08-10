const YAML = require('yaml');

function parseSpecContent(content) {
  if (typeof content !== 'string') {
    throw new Error('Specification content must be a string');
  }

  const trimmed = content.trim();
  let document;
  let format = 'json';

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      document = JSON.parse(trimmed);
      format = 'json';
    } catch (err) {
      throw new Error(`JSON syntax error: ${err.message}`);
    }
  } else {
    try {
      document = YAML.parse(trimmed);
      format = 'yaml';
    } catch (err) {
      throw new Error(`YAML syntax error: ${err.message}`);
    }
  }

  if (!document || typeof document !== 'object') {
    throw new Error('Parsed OpenAPI spec must be a non-null object');
  }

  // Version detection
  const openapiVer = document.openapi || document.swagger;
  if (!openapiVer) {
    throw new Error('Specification is missing "openapi" or "swagger" version declaration field');
  }

  if (!openapiVer.startsWith('3.') && !openapiVer.startsWith('2.')) {
    throw new Error(`Unsupported OpenAPI specification version: ${openapiVer}. Supports 3.x and 2.x.`);
  }

  if (!document.paths || typeof document.paths !== 'object') {
    throw new Error('OpenAPI specification missing mandatory "paths" object');
  }

  return {
    document,
    format,
    version: openapiVer,
  };
}

module.exports = { parseSpecContent };
