class CatalogService {
    constructor() {
        this.catalog = null;
        this.loadCatalog();
    }

    async loadCatalog() {
        try {
            const response = await fetch('./botData/projectsCatalog.json');
            this.catalog = await response.json();
        } catch (error) {
            console.error('Erro ao carregar catálogo:', error);
        }
    }

    getProjectsByTechnology(tech) {
        if (!this.catalog) return [];
        
        const projects = [];
        const techLower = tech.toLowerCase();
        
        this.catalog.projects.forEach(project => {
            if (project.technologies.some(t => t.toLowerCase().includes(techLower))) {
                projects.push(project);
            }
        });
        
        return projects;
    }

    getTechnologyInfo(tech) {
        if (!this.catalog) return null;
        
        const techLower = tech.toLowerCase();
        const categories = ['frontend', 'backend', 'cloud', 'tools'];
        
        for (const category of categories) {
            const techs = this.catalog.technologies[category];
            for (const [key, value] of Object.entries(techs)) {
                if (key.toLowerCase() === techLower) {
                    return { ...value, category, name: key };
                }
            }
        }
        
        return null;
    }

    getAllProjects() {
        return this.catalog?.projects || [];
    }

    getStats() {
        return this.catalog?.stats || {};
    }
}

export default CatalogService;