export class GitHubService {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.username = 'lukasdevjobs1';
    this.cache = new Map();
  }

  async getRepositoryDetails(repoName) {
    const cacheKey = `repo_${repoName}`;
    
    // Verifica cache (válido por 10 minutos)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        return cached.data;
      }
    }

    try {
      // Busca dados básicos do repositório
      const repoResponse = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}`);
      if (!repoResponse.ok) {
        throw new Error(`Repository not found: ${repoName}`);
      }
      const repoData = await repoResponse.json();

      // Busca linguagens/tecnologias
      const languagesResponse = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}/languages`);
      const languages = languagesResponse.ok ? await languagesResponse.json() : {};

      // Busca README
      let readmeContent = '';
      try {
        const readmeResponse = await fetch(`${this.baseUrl}/repos/${this.username}/${repoName}/readme`);
        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          // Decodifica base64
          readmeContent = atob(readmeData.content.replace(/\n/g, ''));
        }
      } catch (error) {
        console.log(`No README found for ${repoName}`);
      }

      const projectDetails = {
        name: repoData.name,
        description: repoData.description || 'Sem descrição',
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        languages: languages,
        size: repoData.size,
        created: repoData.created_at,
        updated: repoData.updated_at,
        homepage: repoData.homepage,
        topics: repoData.topics || [],
        readme: readmeContent.substring(0, 2000), // Primeiros 2000 chars
        url: repoData.html_url,
        isForked: repoData.fork
      };

      // Salva no cache
      this.cache.set(cacheKey, {
        data: projectDetails,
        timestamp: Date.now()
      });

      return projectDetails;
    } catch (error) {
      console.error(`Error fetching repository ${repoName}:`, error);
      return null;
    }
  }

  async getAllRepositories() {
    const cacheKey = 'all_repos';
    
    // Verifica cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/users/${this.username}/repos?per_page=100&sort=updated`);
      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }
      
      const repos = await response.json();
      
      // Salva no cache
      this.cache.set(cacheKey, {
        data: repos,
        timestamp: Date.now()
      });

      return repos;
    } catch (error) {
      console.error('Error fetching all repositories:', error);
      return [];
    }
  }

  formatProjectInfo(projectDetails) {
    if (!projectDetails) return 'Projeto não encontrado.';

    const languagesList = Object.keys(projectDetails.languages).join(', ') || projectDetails.language || 'Não especificado';
    const createdDate = new Date(projectDetails.created).toLocaleDateString('pt-BR');
    const updatedDate = new Date(projectDetails.updated).toLocaleDateString('pt-BR');

    let info = `**${projectDetails.name}** ${projectDetails.isForked ? '(Fork)' : '(Original)'}\n`;
    info += `📝 ${projectDetails.description}\n`;
    info += `⭐ ${projectDetails.stars} stars | 🍴 ${projectDetails.forks} forks\n`;
    info += `💻 Tecnologias: ${languagesList}\n`;
    info += `📅 Criado: ${createdDate} | Atualizado: ${updatedDate}\n`;
    
    if (projectDetails.homepage) {
      info += `🌐 Site: ${projectDetails.homepage}\n`;
    }
    
    if (projectDetails.topics.length > 0) {
      info += `🏷️ Tags: ${projectDetails.topics.join(', ')}\n`;
    }

    info += `🔗 GitHub: ${projectDetails.url}\n`;

    if (projectDetails.readme && projectDetails.readme.length > 100) {
      info += `\n📖 **Sobre o projeto:**\n${projectDetails.readme.substring(0, 500)}...\n`;
    }

    return info;
  }
}