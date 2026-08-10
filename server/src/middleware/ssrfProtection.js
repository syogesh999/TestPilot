const url = require('url');

const BLOCKED_HOSTS = [
  '169.254.169.254', // AWS/GCP Metadata Service
  'metadata.google.internal',
  '169.254.169.254.xip.io',
  '0.0.0.0',
];

function isPrivateIP(hostname) {
  if (BLOCKED_HOSTS.includes(hostname.toLowerCase())) {
    return true;
  }
  return false;
}

function validateTargetUrl(targetUrl, allowLocalhost = true) {
  try {
    const parsed = new url.URL(targetUrl);
    const hostname = parsed.hostname.toLowerCase();

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, reason: `Unsupported protocol: ${parsed.protocol}. Only http: and https: are allowed.` };
    }

    if (BLOCKED_HOSTS.includes(hostname)) {
      return { valid: false, reason: `Security Restriction: Target address ${hostname} is blocked (SSRF Protection).` };
    }

    if (!allowLocalhost) {
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return { valid: false, reason: `Security Restriction: Local network target ${hostname} is disallowed.` };
      }
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: `Invalid target URL: ${err.message}` };
  }
}

module.exports = { validateTargetUrl, isPrivateIP };
