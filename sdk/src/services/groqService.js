import { GitHubService } from './githubService.js';

export class GroqService {
  constructor() {
    this.config = null;
    this.systemPrompt = '';
    this.conversationHistory = [];
    this.githubService = new GitHubService();
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

    console.log('Usando API real da Groq com key:', this.config.groq.apiKey.substring(0, 10) + '...');

    // Detecta se está perguntando sobre um projeto específico
    const projectName = this.detectProjectMention(text);
    let enhancedSystemPrompt = this.systemPrompt;
    
    if (projectName) {
      console.log(`Buscando dados reais do projeto: ${projectName}`);
      const projectDetails = await this.githubService.getRepositoryDetails(projectName);
      if (projectDetails) {
        const projectInfo = this.githubService.formatProjectInfo(projectDetails);
        enhancedSystemPrompt += `\n\n### DADOS REAIS DO PROJETO ${projectName.toUpperCase()}:\n${projectInfo}`;
      }
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
            { role: 'system', content: enhancedSystemPrompt },
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
      
      return this.createAsyncIterator(content);
    } catch (error) {
      console.error('Groq API error:', error);
      // Fallback para resposta simulada em caso de erro
      const mockResponse = this.generateMockResponse(text);
      
      this.conversationHistory.push(
        { role: 'user', content: text },
        { role: 'assistant', content: mockResponse }
      );
      
      if (this.conversationHistory.length > 6) {
        this.conversationHistory = this.conversationHistory.slice(-6);
      }
      
      return this.createAsyncIterator(mockResponse);
    }
  }

  generateMockResponse(text) {
    const textLower = text.toLowerCase();
    
    // Cumprimentos
    if (textLower.match(/\b(oi|olá|hey|ola|e ai)\b/)) {
      return 'Olá! Sou o assistente do Lukas, desenvolvedor junior em evolução de Fortaleza-CE! Posso falar sobre seus 13 repositórios, projetos com IA e tecnologias. O que você quer saber?';
    }
    
    // Chatbots
    if (textLower.includes('chatbot') || textLower.includes('bot')) {
      return 'O Lukas tem 2 chatbots: este que você está usando (lukasdevjobs1) com sistema híbrido Chrome AI + Groq, e o semana-javascript-expert09 do desafio do Erick Wendel. Também tem o projeto bia com AWS + Amazon Q. Quer saber mais sobre algum?';
    }
    
    // Resposta padrão
    return 'Sou o assistente do Lukas Gomes! Posso falar sobre seus projetos, tecnologias (JavaScript, Python) e jornada como desenvolvedor junior. O que você quer saber?';
  }

  detectProjectMention(text) {
    const textLower = text.toLowerCase();
    
    // Lista de projetos conhecidos
    const projects = [
      'bia', 'lukasdevjobs1', 'git_projects', 'git-projects',
      'exercicios_praticos_infinityschool', 'exercicios-praticos-infinityschool',
      'profile-chat', 'profile_chat', 'semana-javascript-expert09',
      'desafios_infinity_school', 'desafios-infinity-school',
      'grokking_algorithms', 'grokking-algorithms', 'mcp',
      'developer-roadmap', 'developer_roadmap', 'bibliotecadev',
      'agents-prompts', 'agents_prompts'
    ];
    
    // Procura menções diretas de projetos
    for (const project of projects) {
      if (textLower.includes(project)) {
        // Converte para o nome real do repositório
        return this.normalizeProjectName(project);
      }
    }
    
    // Procura padrões como "projeto bia", "sobre o bia", etc.
    const patterns = [
      /(?:projeto|reposit[oó]rio|sobre o?|detalhes do?)\s+(\w+)/g,
      /\b(bia|lukasdevjobs1|git[_-]?projects)\b/g
    ];
    
    for (const pattern of patterns) {
      const matches = textLower.match(pattern);
      if (matches) {
        const projectName = matches[0].replace(/^(projeto|reposit[oó]rio|sobre o?|detalhes do?)\s+/, '');
        return this.normalizeProjectName(projectName);
      }
    }
    
    return null;
  }
  
  normalizeProjectName(name) {
    const nameMap = {
      'git_projects': 'Git_Projects',
      'git-projects': 'Git_Projects',
      'exercicios_praticos_infinityschool': 'Exercicios_praticos_InfinitySchool',
      'exercicios-praticos-infinityschool': 'Exercicios_praticos_InfinitySchool',
      'profile_chat': 'profile-chat',
      'desafios_infinity_school': 'Desafios_Infinity_School',
      'desafios-infinity-school': 'Desafios_Infinity_School',
      'grokking_algorithms': 'grokking_algorithms',
      'grokking-algorithms': 'grokking_algorithms',
      'developer_roadmap': 'developer-roadmap',
      'agents_prompts': 'Agents-Prompts',
      'agents-prompts': 'Agents-Prompts',
      'bibliotecadev': 'BibliotecaDev'
    };
    
    return nameMap[name.toLowerCase()] || name;
  }

  async *createAsyncIterator(text) {
    // Simula delay de "pensamento" da IA
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Simula streaming palavra por palavra
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      yield (i > 0 ? ' ' : '') + words[i];
      
      // Delay entre palavras para simular digitação
      if (i < words.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      }
    }
  }
}