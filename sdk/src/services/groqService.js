export class GroqService {
  constructor() {
    this.config = null;
    this.systemPrompt = '';
  }

  async init(systemPrompt) {
    this.systemPrompt = systemPrompt;
    
    try {
      const response = await fetch('./botData/api-config.json');
      this.config = await response.json();
      return true;
    } catch (error) {
      console.error('Erro ao carregar config da API:', error);
      return false;
    }
  }

  async prompt(text, signal) {
    if (!this.config) {
      throw new Error('Groq não configurado');
    }

    // Se a API key é demo, retorna resposta simulada
    if (this.config.groq.apiKey.includes('demo')) {
      const mockResponse = this.#generateMockResponse(text);
      return this.#createAsyncIterator(mockResponse);
    }

    try {
      const response = await fetch(this.config.groq.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.groq.model,
          messages: [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      return this.#createAsyncIterator(content);
    } catch (error) {
      console.error('Groq API error:', error);
      // Fallback para resposta simulada em caso de erro
      const mockResponse = this.#generateMockResponse(text);
      return this.#createAsyncIterator(mockResponse);
    }
  }

  #generateMockResponse(text) {
    const responses = {
      'oi': 'Olá! Sou o assistente do Lukas Gomes, desenvolvedor Full Stack de Fortaleza-CE! Quer conhecer os projetos dele? Confira o GitHub!',
      'python': 'O Lukas trabalhou em 3 projetos Python: Git_Projects (portfólio técnico), Exercicios_praticos_InfinitySchool (exercícios educacionais) e Desafios_Infinity_School (desafios de lógica).',
      'javascript': 'JavaScript é uma das especialidades avançadas do Lukas! Ele tem 4 projetos: lukasdevjobs1 (site pessoal + chatbot), bia, profile-chat e semana-javascript-expert09.',
      'projetos': 'O Lukas tem 13 repositórios no GitHub: 5 projetos originais e 8 forks educacionais. Destaques: lukasdevjobs1 (site pessoal), Git_Projects (portfólio) e profile-chat (chatbot AI).'
    };
    
    const textLower = text.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (textLower.includes(key)) {
        return response;
      }
    }
    
    return 'Sou o assistente do Lukas Gomes! Posso falar sobre seus projetos em JavaScript, Python, GitHub Pages e mais. O que você gostaria de saber?';
  }

  async *#createAsyncIterator(text) {
    yield text;
  }
}