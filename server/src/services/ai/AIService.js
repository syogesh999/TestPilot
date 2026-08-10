const OllamaProvider = require('./providers/OllamaProvider');
const FallbackProvider = require('./providers/FallbackProvider');
const logger = require('../../config/logger');

class AIService {
  constructor() {
    this.ollamaProvider = new OllamaProvider();
    this.fallbackProvider = new FallbackProvider();
  }

  async getProvider() {
    const isAvailable = await this.ollamaProvider.isAvailable();
    if (isAvailable) {
      logger.info('Using Ollama local AI provider');
      return this.ollamaProvider;
    }
    logger.info('Ollama offline/unavailable. Falling back to Rule-based AI Engine');
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
