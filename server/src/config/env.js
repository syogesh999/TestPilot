const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const props = {};

const loadPropertiesFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    content.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('!')) {
        const index = trimmed.indexOf('=');
        if (index !== -1) {
          const key = trimmed.substring(0, index).trim();
          const value = trimmed.substring(index + 1).trim();
          props[key] = value;
        }
      }
    });
  }
};

// Load root and server application.properties files
loadPropertiesFile(path.join(__dirname, '../../../application.properties'));
loadPropertiesFile(path.join(__dirname, '../../application.properties'));

const getVal = (envKey, propKey, defaultValue) => {
  return process.env[envKey] || props[propKey] || defaultValue;
};

const config = {
  env: getVal('NODE_ENV', 'server.env', 'development'),
  port: parseInt(getVal('PORT', 'server.port', '5000'), 10),
  mongoUri: getVal('MONGODB_URI', 'mongodb.uri', ''),
  jwtSecret: getVal('JWT_SECRET', 'jwt.secret', 'testpilot_default_super_secret_jwt_key_2026'),
  clientUrl: getVal('CLIENT_URL', 'client.url', 'http://localhost:5173'),
  logLevel: getVal('LOG_LEVEL', 'server.log.level', 'info'),
  requestTimeoutMs: parseInt(getVal('REQUEST_TIMEOUT_MS', 'request.timeout.ms', '15000'), 10),
  maxResponseBytes: parseInt(getVal('MAX_RESPONSE_BYTES', 'max.response.bytes', '1048576'), 10),
  geminiApiKey: getVal('GEMINI_API_KEY', 'gemini.api.key', ''),
  geminiModel: getVal('GEMINI_MODEL', 'gemini.model', 'gemini-1.5-flash'),
  openaiApiKey: getVal('OPENAI_API_KEY', 'openai.api.key', ''),
  openaiModel: getVal('OPENAI_MODEL', 'openai.model', 'gpt-4o-mini'),
  ollamaBaseUrl: getVal('OLLAMA_BASE_URL', 'ollama.base.url', 'http://localhost:11434'),
  ollamaModel: getVal('OLLAMA_MODEL', 'ollama.model', 'llama3.2'),
};

module.exports = config;
