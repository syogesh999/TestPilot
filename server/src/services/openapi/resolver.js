function resolveRef(refString, rootDoc) {
  if (!refString || typeof refString !== 'string' || !refString.startsWith('#/')) {
    return null;
  }

  const parts = refString.replace('#/', '').split('/');
  let current = rootDoc;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }

  return current;
}

function deepResolveRefs(obj, rootDoc, visited = new Set()) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj.$ref && typeof obj.$ref === 'string') {
    if (visited.has(obj.$ref)) {
      // Prevent infinite recursion in circular references
      return { type: 'object', description: 'Circular reference omitted' };
    }
    visited.add(obj.$ref);
    const resolved = resolveRef(obj.$ref, rootDoc);
    if (resolved) {
      // Merge any additional attributes alongside $ref if present
      const { $ref, ...rest } = obj;
      return deepResolveRefs({ ...resolved, ...rest }, rootDoc, visited);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepResolveRefs(item, rootDoc, new Set(visited)));
  }

  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = deepResolveRefs(obj[key], rootDoc, new Set(visited));
  }

  return result;
}

module.exports = { resolveRef, deepResolveRefs };
