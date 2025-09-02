export class PromptService {
  #session = null;
  #systemPrompt = "";
  
  async init(initialPrompts) {
    if (!window.ai || !window.ai.languageModel) {
      console.error('API de IA não disponível');
      return null;
    }

    this.#systemPrompt = initialPrompts;
    return this.#createSession();
  }

  async #createSession() {
    try {
      this.#session = await window.ai.languageModel.create({
        systemPrompt: this.#systemPrompt
      });
      return this.#session;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    }
  }

  async prompt(text, signal) {
    if (!this.#session) {
      await this.#createSession();
    }
    
    if (!this.#session) {
      throw new Error('Sessão de IA não disponível');
    }

    try {
      // Tenta streaming primeiro
      if (this.#session.promptStreaming) {
        return this.#session.promptStreaming(text, { signal });
      }
      
      // Fallback para prompt normal
      const response = await this.#session.prompt(text, { signal });
      return this.#createAsyncIterator(response);
    } catch (error) {
      console.error('Erro no prompt:', error);
      throw error;
    }
  }

  async *#createAsyncIterator(text) {
    yield text;
  }
}