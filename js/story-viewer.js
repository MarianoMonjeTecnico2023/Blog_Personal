// ===== STORY VIEWER =====
class StoryViewer {
    constructor() {
        this.storyId = null;
        this.story = null;
        this.currentImageIndex = 0;
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
            this.showError('ID de historia no válido');
            return;
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Modal de imagen
        document.getElementById('image-modal-close')?.addEventListener('click', () => this.hideImageModal());
        
        // Navegación de imágenes
        document.getElementById('prev-image')?.addEventListener('click', () => this.previousImage());
        document.getElementById('next-image')?.addEventListener('click', () => this.nextImage());
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideImageModal();
            }
        });

        // Navegación con flechas en modal
        document.addEventListener('keydown', (e) => {
            if (document.getElementById('image-modal').classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    this.previousImage();
                } else if (e.key === 'ArrowRight') {
                    this.nextImage();
                }
            }
        });
    }

    // Cargar historia
    async loadStory() {
        if (!this.storyId) return;

        try {
            this.showLoading();
            
            // Por ahora usamos datos de ejemplo
            // En el futuro esto vendría del servidor
            this.story = await this.getStoryData();
            
            this.renderStory();
            this.hideLoading();
            
        } catch (error) {
            console.error('Error cargando historia:', error);
            this.showError('Error al cargar la historia');
        }
    }

    // Obtener datos de la historia (simulado por ahora)
    async getStoryData() {
        // Simular delay de carga
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo - en el futuro esto vendría del servidor
        return {
            _id: this.storyId,
            title: 'Aprendiendo idiomas',
            content: `Hoy empecé a aprender los idiomas Italiano y Alemán de nivel II. Estoy muy feliz de que el gobierno de mi ciudad ofrezca estos cursos de idiomas a la población.

La experiencia ha sido increíble hasta ahora. Los profesores son muy dedicados y el material de estudio es excelente. Ya puedo mantener conversaciones básicas en ambos idiomas.

El italiano me resulta especialmente musical y expresivo, mientras que el alemán me desafía con su estructura gramatical más compleja. Ambos idiomas me están ayudando a expandir mi visión del mundo y a conectar con diferentes culturas.

Recomiendo a todos que aprovechen estas oportunidades de aprendizaje que ofrece la ciudad. Los idiomas abren puertas tanto en el ámbito personal como profesional.`,
            username: 'veggetassj',
            createdAt: new Date(),
            images: [
                'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
                'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800'
            ],
            featuredImage: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800'
        };
    }

    // Renderizar historia
    renderStory() {
        if (!this.story) return;

        // Actualizar título de la página
        document.title = `${this.story.title} - Mi Blog`;

        // Renderizar metadatos
        this.renderMeta();
        
        // Renderizar título
        document.getElementById('story-title').textContent = this.story.title;
        
        // Renderizar contenido
        this.renderContent();
        
        // Renderizar imágenes
        this.renderImages();
        
        // Mostrar contenido
        document.getElementById('story-content').style.display = 'block';
    }

    // Renderizar metadatos
    renderMeta() {
        const date = new Date(this.story.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        document.getElementById('story-author').textContent = this.story.username;
        document.getElementById('story-date').textContent = date;

        // Mostrar contador de imágenes si hay imágenes
        if (this.story.images && this.story.images.length > 0) {
            document.getElementById('story-images-count').style.display = 'flex';
            document.getElementById('images-count').textContent = 
                `${this.story.images.length} imagen${this.story.images.length !== 1 ? 'es' : ''}`;
        }
    }

    // Renderizar contenido
    renderContent() {
        const contentDiv = document.getElementById('story-text');
        
        // Convertir saltos de línea en párrafos
        const paragraphs = this.story.content.split('\n\n').filter(p => p.trim());
        
        contentDiv.innerHTML = paragraphs.map(paragraph => 
            `<p>${paragraph.trim()}</p>`
        ).join('');
    }

    // Renderizar imágenes
    renderImages() {
        if (!this.story.images || this.story.images.length === 0) {
            return;
        }

        const gallery = document.getElementById('story-images-gallery');
        const imagesContainer = document.getElementById('story-images');

        gallery.innerHTML = this.story.images.map((image, index) => `
            <div class="story-gallery-item" onclick="storyViewer.openImageModal(${index})">
                <img src="${image}" alt="Imagen ${index + 1}" loading="lazy">
                <div class="gallery-item-overlay">
                    <i class="fas fa-expand"></i>
                </div>
            </div>
        `).join('');

        imagesContainer.style.display = 'block';
    }

    // Abrir modal de imagen
    openImageModal(index) {
        this.currentImageIndex = index;
        this.updateImageModal();
        document.getElementById('image-modal').classList.add('active');
    }

    // Cerrar modal de imagen
    hideImageModal() {
        document.getElementById('image-modal').classList.remove('active');
    }

    // Actualizar modal de imagen
    updateImageModal() {
        if (!this.story.images || this.story.images.length === 0) return;

        const image = this.story.images[this.currentImageIndex];
        const modalImage = document.getElementById('modal-image');
        const imageCounter = document.getElementById('image-counter');
        const prevBtn = document.getElementById('prev-image');
        const nextBtn = document.getElementById('next-image');

        modalImage.src = image;
        modalImage.alt = `Imagen ${this.currentImageIndex + 1}`;
        imageCounter.textContent = `${this.currentImageIndex + 1} de ${this.story.images.length}`;

        // Habilitar/deshabilitar botones de navegación
        prevBtn.disabled = this.currentImageIndex === 0;
        nextBtn.disabled = this.currentImageIndex === this.story.images.length - 1;
    }

    // Imagen anterior
    previousImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
            this.updateImageModal();
        }
    }

    // Imagen siguiente
    nextImage() {
        if (this.currentImageIndex < this.story.images.length - 1) {
            this.currentImageIndex++;
            this.updateImageModal();
        }
    }

    // Mostrar loading
    showLoading() {
        document.getElementById('story-loading').style.display = 'flex';
        document.getElementById('story-content').style.display = 'none';
        document.getElementById('story-error').style.display = 'none';
    }

    // Ocultar loading
    hideLoading() {
        document.getElementById('story-loading').style.display = 'none';
    }

    // Mostrar error
    showError(message) {
        document.getElementById('story-loading').style.display = 'none';
        document.getElementById('story-content').style.display = 'none';
        document.getElementById('story-error').style.display = 'block';
    }
}

// Inicializar story viewer cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.storyViewer = new StoryViewer();
    console.log('🚀 Story Viewer inicializado correctamente');
}); 