export class GroqService {
  constructor() {
    this.config = null;
    this.systemPrompt = '';
    this.conversationHistory = [];
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
      
      // Adiciona ao histórico mesmo nas respostas simuladas
      this.conversationHistory.push(
        { role: 'user', content: text },
        { role: 'assistant', content: mockResponse }
      );
      
      if (this.conversationHistory.length > 6) {
        this.conversationHistory = this.conversationHistory.slice(-6);
      }
      
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
            ...this.conversationHistory,
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
      
      // Adiciona ao histórico
      this.conversationHistory.push(
        { role: 'user', content: text },
        { role: 'assistant', content: content }
      );
      
      // Mantém apenas últimas 6 mensagens (3 trocas)
      if (this.conversationHistory.length > 6) {
        this.conversationHistory = this.conversationHistory.slice(-6);
      }
      
      return this.#createAsyncIterator(content);
    } catch (error) {
      console.error('Groq API error:', error);
      // Fallback para resposta simulada em caso de erro
      const mockResponse = this.#generateMockResponse(text);
      
      this.conversationHistory.push(
        { role: 'user', content: text },
        { role: 'assistant', content: mockResponse }
      );
      
      if (this.conversationHistory.length > 6) {
        this.conversationHistory = this.conversationHistory.slice(-6);
      }
      
      return this.#createAsyncIterator(mockResponse);
    }
  }

  #generateMockResponse(text) {
    const textLower = text.toLowerCase();
    
    // Cumprimentos
    if (textLower.match(/\b(oi|olá|hey|ola|e ai)\b/)) {
      return 'Olá! Sou o assistente do Lukas Gomes, desenvolvedor Full Stack de Fortaleza-CE!\n\nPosso te ajudar com informações sobre:\n• 13 repositórios no GitHub (5 originais + 8 forks)\n• Tecnologias: JavaScript, Python, HTML/CSS, React\n• Especialidades: Chatbots AI, GitHub Pages\n• Contato para oportunidades\n\nO que você gostaria de saber?';
    }
    
    // Python
    if (textLower.includes('python')) {
      return 'Python é uma das especialidades do Lukas (nível intermediário/avançado)!\n\n**Projetos Python:**\n• **Git_Projects** - Portfólio técnico (1 star)\n• **Exercicios_praticos_InfinitySchool** - Exercícios educacionais (1 star, 1 fork)\n• **Desafios_Infinity_School** - Desafios de lógica\n\n**Aplicações:** Lógica de programação, algoritmos, automação\n\nQuer saber mais sobre algum projeto específico?';
    }
    
    // JavaScript
    if (textLower.includes('javascript') || textLower.includes('js')) {
      return 'JavaScript é a especialidade AVANÇADA do Lukas! 🚀\n\n**4 Projetos JavaScript:**\n• **lukasdevjobs1** - Site pessoal + Chatbot AI (1 star)\n  🔗 https://lukasdevjobs1.github.io/lukasdevjobs1/\n• **bia** - Projeto JavaScript (1 star)\n• **profile-chat** - ChatBot AI profissional\n  🔗 https://lukasdevjobs1.github.io/profile-chat/\n• **semana-javascript-expert09** - Chatbot offline\n\n**Especialidades:** Chatbots AI, APIs, desenvolvimento frontend\n\nInteressado em algum projeto?';
    }
    
    // Projetos gerais
    if (textLower.match(/\b(projeto|repositório|github|portfólio)\b/)) {
      return 'O Lukas tem um portfólio impressionante no GitHub! 💼\n\n**Estatísticas:**\n• 13 repositórios totais\n• 11 estrelas acumuladas\n• 1 fork recebido\n• 2 sites no GitHub Pages\n\n**Destaques:**\n🌟 **lukasdevjobs1** - Site pessoal com IA\n🌟 **Git_Projects** - Portfólio técnico\n🌟 **profile-chat** - ChatBot profissional\n\n🔗 GitHub: https://github.com/lukasdevjobs1\n\nQuer detalhes de algum projeto?';
    }
    
    // Tecnologias
    if (textLower.match(/\b(tecnologia|stack|skill|habilidade)\b/)) {
      return 'Stack técnico do Lukas por nível de expertise:\n\n**AVANÇADO:**\n• JavaScript (4 projetos)\n• HTML/CSS (3 projetos)\n• Git/GitHub (13 repos)\n• Chatbot Development (3 projetos)\n\n**INTERMEDIÁRIO/AVANÇADO:**\n• Python (3 projetos)\n• GitHub Pages (2 sites)\n• AI Integration\n\n**EM DESENVOLVIMENTO:**\n• React\n• AWS (MCP Servers)\n\nQual tecnologia te interessa mais?';
    }
    
    // Contato/Recrutamento
    if (textLower.match(/\b(contato|recrutador|oportunidade|vaga|trabalho)\b/)) {
      return 'Interessado em conectar com o Lukas? 📞\n\n**Contatos Profissionais:**\n• 📧 Email: luk.devjobs@gmail.com\n• 🔗 LinkedIn: linkedin.com/in/lukas-gomes-4470a2269/\n• 📱 WhatsApp: Disponível\n• 🐈 GitHub: github.com/lukasdevjobs1\n\n**Localização:** Fortaleza-CE\n**Formação:** Análise e Desenvolvimento de Sistemas - UniSantaCruz\n\nRecrutadores são sempre bem-vindos! 🚀';
    }
    
    // Chatbot/IA
    if (textLower.match(/\b(chatbot|ia|inteligência|bot)\b/)) {
      return 'Chatbots com IA são a ESPECIALIDADE do Lukas! 🤖\n\n**3 Projetos de Chatbot:**\n• **Este chatbot** - Sistema híbrido (Chrome AI + Groq)\n• **profile-chat** - ChatBot profissional\n• **semana-javascript-expert09** - Chatbot 100% offline\n\n**Tecnologias usadas:**\n• JavaScript avançado\n• APIs de IA\n• Prompt engineering\n• Integração com modelos\n\nEste próprio chat é exemplo do trabalho dele! 🚀';
    }
    
    // Resposta padrão mais inteligente
    return `Sou o assistente do Lukas Gomes! 🚀\n\nPosso te ajudar com:\n• Informações sobre projetos (13 repos)\n• Tecnologias (JavaScript, Python, etc.)\n• Contato profissional\n• Especialidades em Chatbots AI\n\nO que você gostaria de saber? Digite 'projetos', 'python', 'javascript' ou 'contato'!`;
  }

  async *#createAsyncIterator(text) {
    yield text;
  }
}