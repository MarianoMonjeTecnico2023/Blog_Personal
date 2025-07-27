// ===== SISTEMA DE HISTORIAS =====
class Stories {
    constructor() {
        this.currentPage = 1;
        this.totalPages = 1;
        this.stories = [];
        this.filteredStories = [];
        this.searchTerm = '';
        this.selectedAuthor = '';
        this.sortBy = 'newest';
        this.authors = [];
        this.loading = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadStories();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones de paginación
        document.getElementById('prev-page')?.addEventListener('click', () => this.previousPage());
        document.getElementById('next-page')?.addEventListener('click', () => this.nextPage());

        // Botones del hero
        document.getElementById('explore-btn')?.addEventListener('click', () => {
            document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth' });
        });

        document.getElementById('write-btn')?.addEventListener('click', () => {
            if (auth.isAuthenticated()) {
                // Redirigir al dashboard para escribir
                redirectTo('dashboard.html');
            } else {
                auth.showLoginModal();
            }
        });

        // Configurar búsqueda en tiempo real
        this.setupSearch();
    }

    // Configurar búsqueda en tiempo real
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;

        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Limpiar timeout anterior
            clearTimeout(searchTimeout);
            
            // Mostrar loading
            this.showSearchLoading();
            
            // Debounce: esperar 300ms después de que el usuario deje de escribir
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Búsqueda con Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                clearTimeout(searchTimeout);
                this.performSearch(e.target.value.trim());
            }
        });
    }

    // Realizar búsqueda
    async performSearch(query) {
        try {
            if (!query) {
                this.clearSearch();
                return;
            }

            // Filtrar historias localmente para búsqueda instantánea
            const filteredStories = this.allStories.filter(story => 
                story.title.toLowerCase().includes(query.toLowerCase()) ||
                story.content.toLowerCase().includes(query.toLowerCase()) ||
                story.username.toLowerCase().includes(query.toLowerCase())
            );

            this.renderStories(filteredStories);
            this.updateSearchResults(filteredStories.length, query);
            
        } catch (error) {
            this.showError('Error en la búsqueda: ' + error.message);
        }
    }

    // Mostrar loading de búsqueda
    showSearchLoading() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="search-loading">
                    <div class="spinner small"></div>
                    <span>Buscando...</span>
                </div>
            `;
            resultsContainer.style.display = 'block';
        }
    }

    // Actualizar resultados de búsqueda
    updateSearchResults(count, query) {
        const resultsContainer = document.getElementById('search-results');
        const resultsCount = document.getElementById('results-count');
        
        if (resultsContainer && resultsCount) {
            resultsCount.textContent = count;
            resultsContainer.innerHTML = `
                <span id="results-count">${count}</span> historias encontradas para "${query}"
                <button class="clear-search-btn" onclick="stories.clearSearch()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            resultsContainer.style.display = 'block';
        }
    }

    // Limpiar búsqueda
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const resultsContainer = document.getElementById('search-results');
        
        if (searchInput) {
            searchInput.value = '';
        }
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
        }
        
        this.renderStories(this.allStories);
    }

    // Cargar historias
    async loadStories(page = 1) {
        if (this.loading) return;

        try {
            this.loading = true;
            this.showLoading();

            const response = await api.getStories(page, 6); // 6 historias por página
            
            this.stories = response.stories;
            this.filteredStories = [...this.stories];
            this.currentPage = response.pagination.page;
            this.totalPages = response.pagination.pages;

            // Extraer autores únicos
            this.extractAuthors();
            
            this.renderStories();
            this.updatePagination();

        } catch (error) {
            this.showError('Error al cargar las historias. Por favor, intenta de nuevo.');
        } finally {
            this.loading = false;
            this.hideLoading();
        }
    }

    // Mostrar loading
    showLoading() {
        const grid = document.getElementById('stories-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Cargando historias...</p>
                </div>
            `;
        }
    }

    // Ocultar loading
    hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
    }

    // Mostrar error
    showError(message) {
        const grid = document.getElementById('stories-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="alert error">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            `;
        }
    }

    // Renderizar historias
    renderStories() {
        const grid = document.getElementById('stories-grid');
        if (!grid) return;

        if (this.filteredStories.length === 0) {
            grid.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1; padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--gray-600); margin-bottom: 0.5rem;">
                        ${this.searchTerm || this.selectedAuthor ? 'No se encontraron historias' : 'No hay historias aún'}
                    </h3>
                    <p style="color: var(--gray-500);">
                        ${this.searchTerm || this.selectedAuthor ? 
                            'No hay historias que coincidan con tu búsqueda.' : 
                            'Sé el primero en compartir una historia.'}
                    </p>
                    ${(this.searchTerm || this.selectedAuthor) ? 
                        '<button class="btn btn-primary" onclick="stories.clearFilters()">Limpiar filtros</button>' : 
                        (auth.isAuthenticated() ? 
                            '<button class="btn btn-primary" onclick="redirectTo(\'dashboard.html\')">Escribir Historia</button>' : 
                            '<button class="btn btn-primary" onclick="auth.showLoginModal()">Iniciar Sesión</button>')
                    }
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredStories.map(story => this.createStoryCard(story)).join('');
    }

    // Crear tarjeta de historia
    createStoryCard(story) {
        const date = new Date(story.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Mostrar más texto (300 caracteres en lugar de 150)
        const excerpt = story.content.length > 300 
            ? story.content.substring(0, 300) + '...' 
            : story.content;

        // Manejar múltiples imágenes
        let imageHtml = '';
        if (story.images && story.images.length > 0) {
            // Mostrar hasta 3 imágenes en la tarjeta
            const imagesToShow = story.images.slice(0, 3);
            imageHtml = `
                <div class="story-images-grid">
                    ${imagesToShow.map((img, index) => `
                        <div class="story-image-item ${index === 0 ? 'main-image' : 'secondary-image'}">
                            <img src="${img}" alt="${story.title} - Imagen ${index + 1}" loading="lazy">
                            ${index === 0 && story.images.length > 3 ? 
                                `<div class="more-images-overlay">
                                    <span>+${story.images.length - 3}</span>
                                </div>` : ''
                            }
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (story.featuredImage) {
            // Fallback a imagen destacada si no hay múltiples imágenes
            imageHtml = `
                <div class="story-image">
                    <img src="${story.featuredImage}" alt="${story.title}" loading="lazy">
                </div>
            `;
        } else {
            // Placeholder si no hay imágenes
            imageHtml = `
                <div class="story-image">
                    <i class="fas fa-image"></i>
                </div>
            `;
        }

        return `
            <article class="story-card">
                ${imageHtml}
                <div class="story-content">
                    <h3 class="story-title">
                        <a href="#" onclick="stories.viewStory('${story._id}')" style="color: inherit; text-decoration: none;">
                            ${this.escapeHtml(story.title)}
                        </a>
                    </h3>
                    <p class="story-excerpt">${this.escapeHtml(excerpt)}</p>
                    <div class="story-meta">
                        <div class="story-author">
                            <i class="fas fa-user"></i>
                            <span>${this.escapeHtml(story.username)}</span>
                        </div>
                        <div class="story-date">${date}</div>
                        ${story.images && story.images.length > 0 ? 
                            `<div class="story-images-count">
                                <i class="fas fa-images"></i>
                                <span>${story.images.length} imagen${story.images.length !== 1 ? 'es' : ''}</span>
                            </div>` : ''
                        }
                    </div>
                </div>
            </article>
        `;
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Actualizar paginación
    updatePagination() {
        const pagination = document.getElementById('pagination');
        const currentPageSpan = document.getElementById('current-page');
        const totalPagesSpan = document.getElementById('total-pages');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (!pagination) return;

        // Si hay filtros activos, ocultar paginación (mostrar todas las historias filtradas)
        if (this.searchTerm || this.selectedAuthor) {
            pagination.style.display = 'none';
            return;
        }

        if (this.totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';

        if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = this.totalPages;

        if (prevBtn) {
            prevBtn.disabled = this.currentPage <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
    }

    // Página anterior
    previousPage() {
        if (this.currentPage > 1) {
            this.loadStories(this.currentPage - 1);
        }
    }

    // Página siguiente
    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.loadStories(this.currentPage + 1);
        }
    }

    // Ver historia
    viewStory(storyId) {
        // Redirigir a la página de historia individual
        redirectTo(`story.html?id=${storyId}`);
    }

    // Recargar historias
    reload() {
        this.loadStories(this.currentPage);
    }

    // Extraer autores únicos
    extractAuthors() {
        const authorSet = new Set();
        this.stories.forEach(story => {
            if (story.username) {
                authorSet.add(story.username);
            }
        });
        
        this.authors = Array.from(authorSet).sort();
        this.updateAuthorFilter();
    }

    // Actualizar filtro de autores
    updateAuthorFilter() {
        const authorFilter = document.getElementById('author-filter');
        if (!authorFilter) return;

        // Mantener la opción seleccionada
        const currentValue = authorFilter.value;
        
        // Limpiar opciones existentes (excepto la primera)
        authorFilter.innerHTML = '<option value="">Todos los autores</option>';
        
        // Agregar autores
        this.authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorFilter.appendChild(option);
        });
        
        // Restaurar selección
        if (currentValue) {
            authorFilter.value = currentValue;
        }
    }

    // Aplicar filtros
    applyFilters() {
        let filtered = [...this.stories];

        // Filtro por búsqueda
        if (this.searchTerm.trim()) {
            const searchLower = this.searchTerm.toLowerCase();
            filtered = filtered.filter(story => 
                story.title.toLowerCase().includes(searchLower) ||
                story.content.toLowerCase().includes(searchLower) ||
                story.username.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por autor
        if (this.selectedAuthor) {
            filtered = filtered.filter(story => 
                story.username === this.selectedAuthor
            );
        }

        // Ordenar
        filtered = this.sortStoriesArray(filtered);

        this.filteredStories = filtered;
        this.renderStories();
        this.updateSearchResults();
    }

    // Ordenar array de historias
    sortStoriesArray(stories) {
        switch (this.sortBy) {
            case 'newest':
                return stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'oldest':
                return stories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'title':
                return stories.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return stories;
        }
    }

    // Búsqueda de historias
    searchStories() {
        this.applyFilters();
    }

    // Filtro por autor
    filterByAuthor() {
        const authorFilter = document.getElementById('author-filter');
        if (authorFilter) {
            this.selectedAuthor = authorFilter.value;
            this.applyFilters();
        }
    }

    // Ordenar historias
    sortStories() {
        const sortFilter = document.getElementById('sort-filter');
        if (sortFilter) {
            this.sortBy = sortFilter.value;
            this.applyFilters();
        }
    }

    // Actualizar resultados de búsqueda
    updateSearchResults() {
        const searchResults = document.getElementById('search-results');
        const resultsCount = document.getElementById('results-count');
        
        if (!searchResults || !resultsCount) return;
        
        const hasFilters = this.searchTerm || this.selectedAuthor;
        
        if (hasFilters) {
            resultsCount.textContent = this.filteredStories.length;
            searchResults.style.display = 'block';
        } else {
            searchResults.style.display = 'none';
        }
    }

    // Limpiar filtros
    clearFilters() {
        this.searchTerm = '';
        this.selectedAuthor = '';
        this.sortBy = 'newest';
        
        // Limpiar inputs
        const searchInput = document.getElementById('search-input');
        const authorFilter = document.getElementById('author-filter');
        const sortFilter = document.getElementById('sort-filter');
        
        if (searchInput) searchInput.value = '';
        if (authorFilter) authorFilter.value = '';
        if (sortFilter) sortFilter.value = 'newest';
        
        this.applyFilters();
    }
}

// Crear instancia global de Stories
const stories = new Stories();

// Exportar para uso en otros archivos
window.stories = stories;
window.loadStories = () => stories.reload(); 