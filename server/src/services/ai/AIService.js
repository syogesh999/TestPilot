const OpenAIProvider = require('./providers/OpenAIProvider');
const OllamaProvider = require('./providers/OllamaProvider');
const FallbackProvider = require('./providers/FallbackProvider');
const logger = require('../../config/logger');

class AIService {
  constructor() {
    this.openAIProvider = new OpenAIProvider();
    this.ollamaProvider = new OllamaProvider();
    this.fallbackProvider = new FallbackProvider();
  }

  async getProvider() {
    if (this.openAIProvider.isAvailable()) {
      logger.info('Using OpenAI Cloud AI provider');
      return this.openAIProvider;
    }

    const isOllamaAvailable = await this.ollamaProvider.isAvailable();
    if (isOllamaAvailable) {
      logger.info('Using Ollama local AI provider');
      return this.ollamaProvider;
    }

    logger.info('No cloud/local AI key detected. Using Rule-based Fallback AI Engine');
    return this.fallbackProvider;
  }

  async analyzeRunFailures(run, results) {
    const provider = await this.getProvider();
    return provider.analyzeRunFailures(run, results);
  }

  async suggestEdgeCases(endpoint) {
    const provider = await this.getProvider();
    return provider.suggestEdgeCases(endpoint);
  }
}

module.exports = new AIService();
