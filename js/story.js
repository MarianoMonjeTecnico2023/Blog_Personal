// ===== VISUALIZADOR DE HISTORIA INDIVIDUAL =====
class StoryViewer {
    constructor() {
        this.storyId = null;
        this.story = null;
        this.init();
    }

    init() {
        this.getStoryIdFromURL();
        this.setupEventListeners();
        this.loadStory();
    }

    // Obtener ID de la historia desde la URL
    getStoryIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.storyId = urlParams.get('id');
        
        if (!this.storyId) {
            this.showError('No se especificó un ID de historia válido.');
            return;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón de compartir
        window.shareStory = () => this.shareStory();
    }

    // Cargar historia
    async loadStory() {
        if (!this.storyId) return;

        try {
            this.showLoading();
            
            // Obtener la historia del servidor
            const response = await fetch(`${api.baseURL}/stories/${this.storyId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('La historia no fue encontrada.');
                } else {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
            }
            
            const data = await response.json();
            this.story = data.story;
            
            this.renderStory();
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    // Renderizar historia
    renderStory() {
        if (!this.story) return;

        // Actualizar título de la página
        document.title = `${this.story.title} - Mi Blog`;

        // Renderizar contenido
        this.renderTitle();
        this.renderMeta();
        this.renderFeaturedImage();
        this.renderImagesGallery();
        this.renderContent();
        
        // Mostrar contenedor
        document.getElementById('story-container').style.display = 'block';
    }

    // Renderizar título
    renderTitle() {
        const titleElement = document.getElementById('story-title');
        if (titleElement) {
            titleElement.textContent = this.story.title;
        }
    }

    // Renderizar metadatos
    renderMeta() {
        // Autor
        const authorElement = document.getElementById('story-author');
        if (authorElement) {
            authorElement.textContent = this.story.username;
        }

        // Fecha
        const dateElement = document.getElementById('story-date');
        if (dateElement) {
            const date = new Date(this.story.createdAt);
            dateElement.textContent = date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Contador de imágenes
        const imagesCountElement = document.getElementById('story-images-count');
        const countElement = document.getElementById('images-count');
        
        if (this.story.images && this.story.images.length > 0) {
            if (imagesCountElement) imagesCountElement.style.display = 'block';
            if (countElement) {
                countElement.textContent = `${this.story.images.length} imagen${this.story.images.length !== 1 ? 'es' : ''}`;
            }
        } else {
            if (imagesCountElement) imagesCountElement.style.display = 'none';
        }
    }

    // Renderizar imagen destacada
    renderFeaturedImage() {
        const featuredContainer = document.getElementById('story-featured-image');
        const featuredImage = document.getElementById('featured-image');
        
        if (this.story.featuredImage) {
            if (featuredContainer) featuredContainer.style.display = 'block';
            if (featuredImage) {
                featuredImage.src = this.story.featuredImage;
                featuredImage.alt = this.story.title;
            }
        } else {
            if (featuredContainer) featuredContainer.style.display = 'none';
        }
    }

    // Renderizar galería de imágenes
    renderImagesGallery() {
        const galleryContainer = document.getElementById('story-images-gallery');
        const imagesGrid = document.getElementById('images-grid');
        
        if (!this.story.images || this.story.images.length === 0) {
            if (galleryContainer) galleryContainer.style.display = 'none';
            return;
        }

        if (galleryContainer) galleryContainer.style.display = 'block';
        
        if (imagesGrid) {
            imagesGrid.innerHTML = this.story.images
                .filter(url => url && url !== '') // Filtrar URLs vacías o null
                .map((url, index) => `
                    <div class="image-item">
                        <img src="${url}" alt="Imagen ${index + 1}" loading="lazy" onclick="storyViewer.openImageModal('${url}', ${index})">
                    </div>
                `).join('');
        }
    }

    // Renderizar contenido
    renderContent() {
        const contentElement = document.getElementById('story-content-text');
        if (contentElement) {
            // Convertir saltos de línea en <br> y escapar HTML
            const content = this.story.content
                .replace(/\n/g, '<br>')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            
            contentElement.innerHTML = content;
        }
    }

    // Mostrar loading
    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'flex';
        }
    }

    // Ocultar loading
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    // Mostrar error
    showError(message) {
        const error = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        
        if (error) error.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
    }

    // Abrir modal de imagen
    openImageModal(imageUrl, index) {
        // Por ahora solo abrimos la imagen en una nueva pestaña
        window.open(imageUrl, '_blank');
    }

    // Compartir historia
    shareStory() {
        if (navigator.share) {
            navigator.share({
                title: this.story.title,
                text: this.story.content.substring(0, 100) + '...',
                url: window.location.href
            });
        } else {
            // Fallback: copiar URL al portapapeles
            navigator.clipboard.writeText(window.location.href).then(() => {
                // Mostrar notificación
                this.showNotification('URL copiada al portapapeles', 'success');
            }).catch(() => {
                this.showNotification('Error al copiar URL', 'error');
            });
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Crear instancia global
const storyViewer = new StoryViewer();

// Exportar para uso en otros archivos
window.storyViewer = storyViewer; 