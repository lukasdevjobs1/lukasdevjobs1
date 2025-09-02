export class PromptService {
  #session = null;
  
  async init(initialPrompts) {
    if (!window.LanguageModel) return;

    try {
      this.#session = await LanguageModel.create({
        initialPrompts: [{
          role: "system",
          content: initialPrompts
        }]
      });
      return this.#session;
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      return null;
    }
  }

  async prompt(text, signal) {
    if (!this.#session) {
      throw new Error('Sessão de IA não disponível');
    }

    const response = await this.#session.prompt(text, { signal });
    return this.#createAsyncIterator(response);
  }

  async *#createAsyncIterator(text) {
    yield text;
  }
}