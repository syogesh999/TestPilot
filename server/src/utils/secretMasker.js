const MASK_PATTERNS = [
  /password/i,
  /pass/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /api[_-]?key/i,
  /bearer/i,
  /private[_-]?key/i,
];

function isSecretKey(key) {
  return MASK_PATTERNS.some((pattern) => pattern.test(key));
}

function maskSecrets(obj) {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => maskSecrets(item));
  }

  if (typeof obj === 'object') {
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
      if (isSecretKey(key) && typeof value === 'string' && value.length > 0) {
        masked[key] = value.length > 8
          ? `${value.slice(0, 4)}...${value.slice(-4)}`
          : '********';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSecrets(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  return obj;
}

module.exports = { maskSecrets, isSecretKey };
