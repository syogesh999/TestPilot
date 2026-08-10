const { deepResolveRefs } = require('./resolver');

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

function extractEndpoints(specDoc) {
  const resolvedDoc = deepResolveRefs(specDoc, specDoc);
  const endpoints = [];
  const globalSecurity = resolvedDoc.security || [];

  if (!resolvedDoc.paths) {
    return { endpoints: [], globalSecurity };
  }

  for (const [pathUrl, pathItem] of Object.entries(resolvedDoc.paths)) {
    if (!pathItem || typeof pathItem !== 'object') continue;

    const commonParams = pathItem.parameters || [];

    for (const method of HTTP_METHODS) {
      if (!pathItem[method]) continue;

      const operation = pathItem[method];
      const endpointId = `${method.toUpperCase()}_${pathUrl.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // Combine path-level and operation-level parameters
      const rawParams = [...commonParams, ...(operation.parameters || [])];
      const parameters = rawParams.map((p) => ({
        name: p.name,
        in: p.in, // path, query, header, cookie
        required: p.required || p.in === 'path',
        description: p.description || '',
        schema: p.schema || { type: p.type || 'string' },
      }));

      // Extract Request Body
      let requestBody = null;
      if (operation.requestBody) {
        const content = operation.requestBody.content || {};
        const mediaTypes = Object.keys(content);
        const primaryMediaType = mediaTypes.find((m) => m.includes('json')) || mediaTypes[0] || 'application/json';
        const bodyObj = content[primaryMediaType];

        requestBody = {
          required: !!operation.requestBody.required,
          mediaType: primaryMediaType,
          schema: bodyObj ? bodyObj.schema : { type: 'object' },
        };
      }

      // Extract Responses
      const responses = {};
      if (operation.responses) {
        for (const [statusCode, respObj] of Object.entries(operation.responses)) {
          const content = respObj.content || {};
          const mediaTypes = Object.keys(content);
          const primaryMediaType = mediaTypes.find((m) => m.includes('json')) || mediaTypes[0] || 'application/json';
          const respBody = content[primaryMediaType];

          responses[statusCode] = {
            description: respObj.description || '',
            headers: respObj.headers || {},
            schema: respBody ? respBody.schema : null,
          };
        }
      }

      // Extract Security
      const security = operation.security || globalSecurity;

      endpoints.push({
        id: endpointId,
        path: pathUrl,
        method: method.toUpperCase(),
        summary: operation.summary || operation.operationId || `${method.toUpperCase()} ${pathUrl}`,
        description: operation.description || '',
        parameters,
        requestBody,
        responses,
        security,
      });
    }
  }

  return {
    endpoints,
    securitySchemes: resolvedDoc.components?.securitySchemes || {},
    info: resolvedDoc.info || {},
  };
}

module.exports = { extractEndpoints };
