import { PromptService } from './promptService.js';
import { GroqService } from './groqService.js';

export class HybridPromptService {
  constructor() {
    this.chromeService = new PromptService();
    this.groqService = new GroqService();
    this.activeService = null;
  }

  async init(systemPrompt) {
    // Tenta Chrome AI primeiro
    if (window.LanguageModel) {
      try {
        await this.chromeService.init(systemPrompt);
        this.activeService = this.chromeService;
        console.log('✅ Usando Chrome AI');
        return true;
      } catch (error) {
        console.warn('Chrome AI falhou, usando Groq:', error);
      }
    }

    // Fallback para Groq
    try {
      await this.groqService.init(systemPrompt);
      this.activeService = this.groqService;
      console.log('✅ Usando Groq API');
      return true;
    } catch (error) {
      console.error('Ambos serviços falharam:', error);
      return false;
    }
  }

  async prompt(text, signal) {
    if (!this.activeService) {
      throw new Error('Nenhum serviço de IA disponível');
    }

    return this.activeService.prompt(text, signal);
  }
}