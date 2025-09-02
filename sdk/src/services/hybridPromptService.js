import { PromptService } from './promptService.js';
import { GroqService } from './groqService.js';

export class HybridPromptService {
  constructor() {
    this.chromeService = new PromptService();
    this.groqService = new GroqService();
    this.activeService = null;
  }

  async init(systemPrompt) {
    // Usa Groq primeiro (funciona sempre)
    try {
      await this.groqService.init(systemPrompt);
      this.activeService = this.groqService;
      console.log('✅ Usando Groq API (confiável)');
      return true;
    } catch (error) {
      console.warn('Groq falhou, tentando Chrome AI:', error);
    }

    // Fallback para Chrome AI (se disponível)
    if (window.LanguageModel) {
      try {
        await this.chromeService.init(systemPrompt);
        this.activeService = this.chromeService;
        console.log('✅ Usando Chrome AI (fallback)');
        return true;
      } catch (error) {
        console.error('Chrome AI também falhou:', error);
      }
    }

    console.error('Todos os serviços falharam');
    return false;
  }

  async prompt(text, signal) {
    if (!this.activeService) {
      throw new Error('Nenhum serviço de IA disponível');
    }

    return this.activeService.prompt(text, signal);
  }
}