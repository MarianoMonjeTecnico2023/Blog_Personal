// ===== DASHBOARD =====
class Dashboard {
    constructor() {
        this.currentUser = null;
        this.selectedImages = [];
        this.maxImages = 4;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboardData();
    }

    // Verificar autenticación
    checkAuth() {
        if (!auth.isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }

        this.currentUser = auth.getCurrentUser();
        this.updateUserInfo();
    }

    // Actualizar información del usuario
    updateUserInfo() {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay && this.currentUser) {
            usernameDisplay.textContent = this.currentUser.username;
        }

        // Mostrar enlace de administración solo para admins
        const adminLink = document.getElementById('admin-link');
        if (adminLink && this.currentUser && this.currentUser.role === 'admin') {
            adminLink.style.display = 'block';
            adminLink.href = 'admin.html';
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botón de nueva historia
        document.getElementById('new-story-btn')?.addEventListener('click', () => this.showNewStoryModal());
        
        // Botón de crear borrador
        document.getElementById('create-draft-btn')?.addEventListener('click', () => this.showNewStoryModal());

        // Cerrar modales
        document.getElementById('new-story-modal-close')?.addEventListener('click', () => this.hideNewStoryModal());
        document.getElementById('delete-modal-close')?.addEventListener('click', () => this.hideDeleteModal());

        // Formulario de nueva historia
        document.getElementById('new-story-form')?.addEventListener('submit', (e) => this.handleNewStory(e));

        // Botón de guardar borrador
        document.getElementById('save-draft-btn')?.addEventListener('click', () => this.saveDraft());

        // Configurar tabs
        this.setupTabs();

        // Configurar subida de imágenes
        this.setupImageUpload();

        // Configurar logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            auth.logout();
        });

        // Configurar menú móvil
        this.setupMobileMenu();
    }

    // Configurar tabs
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Remover clase active de todos los botones y panes
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabPanes.forEach(pane => pane.classList.remove('active'));
                
                // Agregar clase active al botón clickeado y su pane correspondiente
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Cargar contenido según el tab
                this.loadTabContent(targetTab);
            });
        });
    }

    // Cargar contenido del tab
    loadTabContent(tabName) {
        switch (tabName) {
            case 'stories':
                this.loadMyStories();
                break;
            case 'images':
                this.loadMyImages();
                break;
            case 'drafts':
                this.loadDrafts();
                break;
        }
    }

    // Configurar subida de imágenes
    setupImageUpload() {
        const uploadArea = document.getElementById('images-upload-area');
        const preview = document.getElementById('images-preview');

        // Click en área de upload
        uploadArea?.addEventListener('click', () => {
            this.openImageSelector();
        });

        // Drag and drop
        uploadArea?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea?.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea?.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files);
            this.handleMultipleImages(files);
        });
    }

    // Abrir selector de imágenes
    openImageSelector() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            console.log('🎯 EVENTO CHANGE DETECTADO');
            console.log('📁 Archivos seleccionados en input:', e.target.files);
            const files = Array.from(e.target.files);
            console.log('🔄 Archivos convertidos a array:', files);
            console.log('📞 Llamando a handleMultipleImages...');
            this.handleMultipleImages(files);
        });
        
        input.click();
    }

    // Manejar múltiples imágenes
    async handleMultipleImages(files) {
        console.log('🚀 === INICIANDO SUBIDA DE IMÁGENES ===');
        console.log('📁 Archivos recibidos:', files);
        console.log('🔢 Número de archivos:', files.length);
        console.log('📍 Esta función se está ejecutando desde dashboard.js');
        
        // Filtrar solo imágenes
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            auth.showNotification('Por favor selecciona archivos de imagen válidos', 'error');
            return;
        }

        // Verificar límite de imágenes
        const availableSlots = this.maxImages - this.selectedImages.length;
        if (imageFiles.length > availableSlots) {
            auth.showNotification(`Solo puedes agregar ${availableSlots} imagen(es) más`, 'warning');
            imageFiles.splice(availableSlots);
        }

        // Validar tamaño de archivos
        const validFiles = imageFiles.filter(file => {
            if (file.size > 5 * 1024 * 1024) { // 5MB
                auth.showNotification(`La imagen "${file.name}" es demasiado grande (máximo 5MB)`, 'error');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Mostrar progreso
        this.showUploadProgress();

        try {
            // Subir imágenes una por una
            for (let i = 0; i < validFiles.length; i++) {
                const file = validFiles[i];
                const progress = ((i + 1) / validFiles.length) * 100;
                this.updateUploadProgress(progress, `Subiendo ${file.name}...`);

                // Mostrar preview inmediatamente y esperar a que se complete
                await this.addImagePreview(file);

                // Subir al servidor
                console.log(`🔄 Subiendo imagen ${i + 1}: ${file.name}`);
                console.log(`📤 Enviando petición a /upload-image...`);
                
                const uploadedImage = await api.uploadImage(file);
                
                console.log(`✅ Imagen ${i + 1} subida exitosamente:`, uploadedImage);
                console.log(`📋 Tipo de uploadedImage:`, typeof uploadedImage);
                console.log(`🔗 uploadedImage.url:`, uploadedImage?.url);
                console.log(`📄 uploadedImage completo:`, JSON.stringify(uploadedImage, null, 2));
                
                // Verificar que la imagen tiene URL
                if (!uploadedImage || !uploadedImage.url) {
                    console.error(`❌ ERROR: Imagen ${i + 1} no tiene URL válida`);
                    throw new Error(`Imagen ${file.name} no se subió correctamente`);
                }
                
                this.selectedImages.push(uploadedImage);
                console.log(`📝 Imagen ${i + 1} agregada a selectedImages`);
                console.log(`📊 selectedImages después de agregar imagen ${i + 1}:`, this.selectedImages);
                console.log(`🔢 selectedImages.length:`, this.selectedImages.length);
                console.log(`✅ URL de la imagen agregada:`, uploadedImage.url);

                // Actualizar preview con URL del servidor
                this.updateImagePreview(uploadedImage, i);
            }

            this.hideUploadProgress();
            this.updateImagesCounter();
            auth.showNotification(`${validFiles.length} imagen(es) subida(s) correctamente`, 'success');

        } catch (error) {
            console.error('Error al subir imágenes:', error);
            this.hideUploadProgress();
            
            // Manejar error de token expirado específicamente
            if (error.message.includes('Sesión expirada')) {
                auth.showNotification('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', 'error');
                // Redirigir al login después de un delay
                setTimeout(() => {
                    window.location.href = '/frontend/index.html';
                }, 2000);
            } else {
                auth.showNotification(`Error al subir imágenes: ${error.message}`, 'error');
            }
        }
    }

    // Mostrar progreso de subida
    showUploadProgress() {
        const progress = document.getElementById('upload-progress');
        if (progress) {
            progress.style.display = 'block';
        }
    }

    // Ocultar progreso de subida
    hideUploadProgress() {
        const progress = document.getElementById('upload-progress');
        if (progress) {
            progress.style.display = 'none';
        }
    }

    // Actualizar progreso de subida
    updateUploadProgress(percentage, text) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = text || `${Math.round(percentage)}%`;
        }
    }

    // Agregar preview de imagen
    addImagePreview(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('images-preview');
                const imageIndex = this.selectedImages.length;
                
                const imageDiv = document.createElement('div');
                imageDiv.className = 'image-preview-item';
                imageDiv.dataset.index = imageIndex;
                imageDiv.dataset.filename = file.name;
                imageDiv.innerHTML = `
                    <img src="${e.target.result}" alt="${file.name}" loading="lazy">
                    <button type="button" class="remove-image-btn" onclick="dashboard.removeImage(${imageIndex})">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="image-loading">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Subiendo...</span>
                    </div>
                `;
                
                preview.appendChild(imageDiv);
                resolve();
            };
            reader.readAsDataURL(file);
        });
    }

    // Actualizar preview con URL del servidor
    updateImagePreview(uploadedImage, index) {
        // Buscar el elemento por el índice correcto
        const imageDivs = document.querySelectorAll('.image-preview-item');
        const imageDiv = imageDivs[index];
        
        if (imageDiv) {
            const img = imageDiv.querySelector('img');
            const loading = imageDiv.querySelector('.image-loading');
            
            if (img) {
                img.src = uploadedImage.url;
                img.alt = uploadedImage.url.split('/').pop() || 'Imagen subida';
                console.log(`🖼️ Imagen ${index + 1} actualizada con URL:`, uploadedImage.url);
            }
            
            if (loading) {
                loading.style.display = 'none';
                console.log(`Loading oculto para imagen ${index + 1}`);
            }
        } else {
            console.error(`No se encontró el elemento de imagen con índice ${index}`);
            console.log('Elementos de imagen encontrados:', imageDivs.length);
            imageDivs.forEach((div, i) => {
                console.log(`Elemento ${i}:`, div.dataset.index, div.dataset.filename);
            });
        }
    }

    // Remover imagen específica
    removeImage(index) {
        this.selectedImages.splice(index, 1);
        this.updateImagesPreview();
        this.updateImagesCounter();
    }

    // Actualizar preview de todas las imágenes
    updateImagesPreview() {
        const preview = document.getElementById('images-preview');
        preview.innerHTML = '';

        this.selectedImages.forEach((image, index) => {
            // Solo mostrar imágenes válidas
            if (!image || !image.url) {
                console.warn(`Imagen ${index} inválida:`, image);
                return;
            }
            
            const imageDiv = document.createElement('div');
            imageDiv.className = 'image-preview-item';
            imageDiv.dataset.index = index;
            
            // Usar el nombre del archivo si está disponible, o generar uno
            const imageName = image.originalName || (image.url ? image.url.split('/').pop() : null) || `Imagen ${index + 1}`;
            
            imageDiv.innerHTML = `
                <img src="${image.url}" alt="${imageName}" loading="lazy">
                <button type="button" class="remove-image-btn" onclick="dashboard.removeImage(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(imageDiv);
        });
    }

    // Actualizar contador de imágenes
    updateImagesCounter() {
        const counter = document.getElementById('images-count');
        if (counter) {
            counter.textContent = this.selectedImages.length;
        }

        // Mostrar/ocultar área de upload según el límite
        const uploadArea = document.getElementById('images-upload-area');
        if (uploadArea) {
            if (this.selectedImages.length >= this.maxImages) {
                uploadArea.style.opacity = '0.5';
                uploadArea.style.pointerEvents = 'none';
            } else {
                uploadArea.style.opacity = '1';
                uploadArea.style.pointerEvents = 'auto';
            }
        }
    }

    // Mostrar modal de nueva historia
    showNewStoryModal() {
        const modal = document.getElementById('new-story-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('story-title')?.focus();
        }
    }

    // Ocultar modal de nueva historia
    hideNewStoryModal() {
        const modal = document.getElementById('new-story-modal');
        if (modal) {
            modal.classList.remove('active');
            
            // Resetear estado de edición
            delete modal.dataset.editStoryId;
            
            // Restaurar título y botón originales
            const modalTitle = modal.querySelector('.modal-header h2');
            const submitBtn = modal.querySelector('button[type="submit"]');
            
            if (modalTitle) modalTitle.textContent = 'Nueva Historia';
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Publicar Historia';
            
            // Limpiar formulario DESPUÉS de cerrar el modal
            setTimeout(() => {
                this.clearNewStoryForm();
            }, 100);
        }
    }

    // Ocultar modal de eliminación
    hideDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // Limpiar formulario de nueva historia
    clearNewStoryForm() {
        const form = document.getElementById('new-story-form');
        if (form) {
            form.reset();
            this.selectedImages = [];
            this.updateImagesPreview();
            this.updateImagesCounter();
        }
    }

    // Manejar nueva historia o edición
    async handleNewStory(e) {
        e.preventDefault();
        
        const form = e.target;
        const modal = document.getElementById('new-story-modal');
        const title = form.title.value.trim();
        const content = form.content.value.trim();
        const isEditing = modal.dataset.editStoryId;

        if (!title || !content) {
            auth.showNotification('Por favor completa todos los campos requeridos', 'error');
            return;
        }

        try {
            this.showLoading(form);
            
            // Debug: Ver qué contiene selectedImages
            console.log('=== DEBUG: PUBLICANDO HISTORIA ===');
            console.log('selectedImages:', this.selectedImages);
            console.log('selectedImages.length:', this.selectedImages.length);
            
            // Debug detallado de cada imagen
            this.selectedImages.forEach((img, index) => {
                console.log(`Imagen ${index}:`, img);
                console.log(`Imagen ${index} tipo:`, typeof img);
                console.log(`Imagen ${index} url:`, img?.url);
                console.log(`Imagen ${index} keys:`, img ? Object.keys(img) : 'null/undefined');
            });
            
            // Preparar datos de la historia con múltiples imágenes
            const imageUrls = this.selectedImages.map(img => img?.url).filter(url => url != null);
            console.log('imageUrls extraídas:', imageUrls);
            console.log('imageUrls.length:', imageUrls.length);
            
            const featuredImage = imageUrls.length > 0 ? imageUrls[0] : null;
            console.log('featuredImage:', featuredImage);
            console.log('=====================================');
            
            if (isEditing) {
                // Modo edición
                await api.updateStory(isEditing, title, content, featuredImage, imageUrls);
                auth.showNotification('¡Historia actualizada exitosamente!', 'success');
            } else {
                // Modo creación
                await api.createStory(title, content, featuredImage, imageUrls);
                auth.showNotification('¡Historia publicada exitosamente!', 'success');
            }
            
            // Recargar historias ANTES de cerrar el modal
            await this.loadMyStories();
            
            // Cerrar modal DESPUÉS de publicar
            this.hideNewStoryModal();
            
        } catch (error) {
            console.error('Error al procesar historia:', error);
            const action = isEditing ? 'actualizar' : 'publicar';
            auth.showNotification(`Error al ${action} la historia`, 'error');
        } finally {
            this.hideLoading(form);
        }
    }

    // Guardar borrador
    saveDraft() {
        const form = document.getElementById('new-story-form');
        const title = form.title.value.trim();
        const content = form.content.value.trim();

        if (!title && !content) {
            auth.showNotification('El borrador debe tener al menos un título o contenido', 'error');
            return;
        }

        // Por ahora solo mostramos una notificación
        // En el futuro se puede implementar el guardado de borradores
        auth.showNotification('Función de borradores en desarrollo', 'info');
    }

    // Mostrar loading en formulario
    showLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const modal = document.getElementById('new-story-modal');
        const isEditing = modal.dataset.editStoryId;
        
        if (submitBtn) {
            submitBtn.disabled = true;
            const action = isEditing ? 'Guardando...' : 'Publicando...';
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${action}`;
        }
    }

    // Ocultar loading en formulario
    hideLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const modal = document.getElementById('new-story-modal');
        const isEditing = modal.dataset.editStoryId;
        
        if (submitBtn) {
            submitBtn.disabled = false;
            const action = isEditing ? 'Guardar Cambios' : 'Publicar Historia';
            const icon = isEditing ? 'fa-save' : 'fa-paper-plane';
            submitBtn.innerHTML = `<i class="fas ${icon}"></i> ${action}`;
        }
    }

    // Cargar datos del dashboard
    async loadDashboardData() {
        try {
            // Por ahora solo cargamos las historias
            await this.loadMyStories();
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
        }
    }

    // Cargar mis historias
    async loadMyStories() {
        const grid = document.getElementById('my-stories-grid');
        const loading = document.getElementById('stories-loading');

        try {
            if (loading) loading.style.display = 'block';
            
            const response = await api.getMyStories();
            
            if (loading) loading.style.display = 'none';
            
            console.log('=== HISTORIAS DEL USUARIO ===');
            console.log('Respuesta:', response);
            console.log('Historias:', response.stories);
            console.log('=============================');
            
            if (response.stories && response.stories.length > 0) {
                grid.innerHTML = response.stories.map(story => this.createStoryCard(story)).join('');
            } else {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <h3>No hay historias publicadas</h3>
                        <p>Comienza a escribir tu primera historia</p>
                        <button class="btn btn-primary" onclick="dashboard.showNewStoryModal()">
                            <i class="fas fa-plus"></i>
                            Nueva Historia
                        </button>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error al cargar historias:', error);
            if (loading) loading.style.display = 'none';
            
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar historias</h3>
                    <p>Intenta recargar la página</p>
                </div>
            `;
        }
    }

    // Crear tarjeta de historia para el dashboard
    createStoryCard(story) {
        console.log('Creando tarjeta para historia:', {
            id: story._id,
            title: story.title,
            content: story.content.substring(0, 50) + '...'
        });
        
        const date = new Date(story.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Mostrar extracto
        const excerpt = story.content.length > 200 
            ? story.content.substring(0, 200) + '...' 
            : story.content;

        // Manejar múltiples imágenes
        let imageHtml = '';
        if (story.images && story.images.length > 0) {
            // Mostrar hasta 2 imágenes en la tarjeta del dashboard
            const imagesToShow = story.images.slice(0, 2);
            imageHtml = `
                <div class="story-images-grid">
                    ${imagesToShow.map((img, index) => `
                        <div class="story-image-item ${index === 0 ? 'main-image' : 'secondary-image'}">
                            <img src="${img}" alt="${story.title} - Imagen ${index + 1}" loading="lazy">
                            ${index === 0 && story.images.length > 2 ? 
                                `<div class="more-images-overlay">
                                    <span>+${story.images.length - 2}</span>
                                </div>` : ''
                            }
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (story.featuredImage) {
            // Fallback a imagen destacada
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
                    <h3 class="story-title">${this.escapeHtml(story.title)}</h3>
                    <p class="story-excerpt">${this.escapeHtml(excerpt)}</p>
                    <div class="story-meta">
                        <div class="story-date">${date}</div>
                        ${story.images && story.images.length > 0 ? 
                            `<div class="story-images-count">
                                <i class="fas fa-images"></i>
                                <span>${story.images.length} imagen${story.images.length !== 1 ? 'es' : ''}</span>
                            </div>` : ''
                        }
                    </div>
                    <div class="story-actions">
                        <button class="btn btn-sm btn-primary" onclick="dashboard.viewStory('${story._id}')">
                            <i class="fas fa-eye"></i>
                            Ver
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="dashboard.editStory('${story._id}')">
                            <i class="fas fa-edit"></i>
                            Editar
                        </button>
                        <button class="btn btn-sm btn-error" onclick="dashboard.deleteStory('${story._id}')">
                            <i class="fas fa-trash"></i>
                            Eliminar
                        </button>
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

    // Editar historia
    async editStory(storyId) {
        try {
            console.log('Editando historia:', storyId);
            
            // Cargar datos de la historia
            const response = await api.getMyStory(storyId);
            const story = response.story;
            
            // Llenar el formulario con los datos existentes
            this.fillStoryForm(story);
            
            // Mostrar modal en modo edición
            this.showEditModal(storyId);
            
        } catch (error) {
            console.error('Error cargando historia para editar:', error);
            auth.showNotification('Error al cargar la historia', 'error');
        }
    }

    // Llenar formulario con datos de la historia
    fillStoryForm(story) {
        const form = document.getElementById('new-story-form');
        if (!form) return;

        // Llenar campos básicos
        form.title.value = story.title;
        form.content.value = story.content;

        // Cargar imágenes existentes
        this.selectedImages = [];
        if (story.images && story.images.length > 0) {
            // Convertir URLs a objetos de imagen, filtrando nulls
            this.selectedImages = story.images
                .filter(url => url != null && url !== '')
                .map(url => ({ url }));
            console.log('Imágenes cargadas para edición:', this.selectedImages);
        }
        
        this.updateImagesPreview();
        this.updateImagesCounter();
    }

    // Mostrar modal en modo edición
    showEditModal(storyId) {
        const modal = document.getElementById('new-story-modal');
        const modalTitle = modal.querySelector('.modal-header h2');
        const submitBtn = modal.querySelector('button[type="submit"]');
        
        if (modal) {
            // Cambiar título y botón
            modalTitle.textContent = 'Editar Historia';
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
            
            // Guardar ID de la historia para la actualización
            modal.dataset.editStoryId = storyId;
            
            modal.classList.add('active');
            document.getElementById('story-title')?.focus();
        }
    }

    // Ver historia
    viewStory(storyId) {
        console.log('=== VER HISTORIA ===');
        console.log('ID recibido:', storyId);
        console.log('Tipo de ID:', typeof storyId);
        console.log('URL que se va a generar:', `story.html?id=${storyId}`);
        console.log('====================');
        window.location.href = `story.html?id=${storyId}`;
    }

    // Eliminar historia
    async deleteStory(storyId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta historia? Esta acción no se puede deshacer.')) {
            try {
                await api.deleteMyStory(storyId);
                auth.showNotification('Historia eliminada correctamente', 'success');
                
                // Recargar historias
                this.loadMyStories();
                
            } catch (error) {
                console.error('Error eliminando historia:', error);
                auth.showNotification('Error al eliminar la historia', 'error');
            }
        }
    }

    // Cargar mis imágenes
    async loadMyImages() {
        const grid = document.getElementById('my-images-grid');
        const loading = document.getElementById('images-loading');

        try {
            if (loading) loading.style.display = 'block';
            
            const response = await api.getMyImages();
            console.log('Respuesta de getMyImages:', response);
            
            if (loading) loading.style.display = 'none';
            
            // La API devuelve { images: [...], pagination: {...} }
            const images = response.images || [];
            console.log('Imágenes extraídas:', images);
            console.log('Número de imágenes:', images.length);
            
            if (images && images.length > 0) {
                grid.innerHTML = images.map(image => `
                    <div class="image-card">
                        <img src="${image.url}" alt="${image.publicId}">
                        <div class="image-actions">
                            <button class="btn btn-sm btn-outline" onclick="dashboard.copyImageUrl('${image.url}')">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="btn btn-sm btn-error" onclick="dashboard.deleteImage('${image.publicId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                grid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <h3>No hay imágenes subidas</h3>
                        <p>Sube imágenes para usarlas en tus historias</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error('Error al cargar imágenes:', error);
            if (loading) loading.style.display = 'none';
            
            grid.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error al cargar imágenes</h3>
                    <p>Intenta recargar la página</p>
                </div>
            `;
        }
    }

    // Cargar borradores
    loadDrafts() {
        const list = document.getElementById('drafts-list');
        
        // Por ahora mostramos un estado vacío
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-edit"></i>
                <h3>No hay borradores</h3>
                <p>Comienza a escribir tu primera historia</p>
                <button class="btn btn-primary" onclick="dashboard.showNewStoryModal()">
                    <i class="fas fa-plus"></i>
                    Crear Borrador
                </button>
            </div>
        `;
    }

    // Copiar URL de imagen
    copyImageUrl(url) {
        navigator.clipboard.writeText(url).then(() => {
            auth.showNotification('URL copiada al portapapeles', 'success');
        }).catch(() => {
            auth.showNotification('Error al copiar URL', 'error');
        });
    }

    // Eliminar imagen
    async deleteImage(publicId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
            try {
                await api.deleteImage(publicId);
                auth.showNotification('Imagen eliminada correctamente', 'success');
                this.loadMyImages(); // Recargar imágenes
            } catch (error) {
                console.error('Error al eliminar imagen:', error);
                auth.showNotification('Error al eliminar la imagen', 'error');
            }
        }
    }

    // Configurar menú móvil
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    }
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
    console.log('🚀 Dashboard inicializado correctamente');
}); 