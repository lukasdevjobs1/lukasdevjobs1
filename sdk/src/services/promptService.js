export class PromptService {
  #messages = [];
  #session = null;
  
  async init(initialPrompts) {
    if (!window.LanguageModel) return;

    this.#messages.push({
      role: "system",
      content: initialPrompts,
    });

    return this.#createSession();
  }

  async #createSession() {
    try {
      this.#session = await LanguageModel.create({
        initialPrompts: this.#messages,
        expectedInputLanguages: ["pt"],
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

    this.#messages.push({
      role: "user",
      content: text,
    });

    return this.#session.promptStreaming(this.#messages, { signal });
  }
}