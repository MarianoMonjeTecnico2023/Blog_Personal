// ===== PANEL DE ADMINISTRACIÓN =====
class AdminPanel {
    constructor() {
        this.currentTab = 'stories';
        this.currentPage = 1;
        this.stories = [];
        this.users = [];
        this.stats = {};
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.setupEventListeners();
        this.loadStats();
        this.loadStories();
    }

    // Verificar acceso de administrador
    async checkAdminAccess() {
        try {
            // Verificar si el usuario es admin
            const user = await api.getUserFromToken();
            if (!user || user.role !== 'admin') {
                this.showError('Acceso denegado. Se requieren permisos de administrador.');
                setTimeout(() => {
                    redirectTo('index.html');
                }, 3000);
                return;
            }

            // Actualizar nombre de usuario
            document.getElementById('username').textContent = user.username;
            
        } catch (error) {
            this.showError('Error verificando permisos de administrador.');
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Filtros
        document.getElementById('story-status-filter')?.addEventListener('change', (e) => {
            this.currentPage = 1;
            this.loadStories(e.target.value);
        });

        // Formulario de baneo
        document.getElementById('ban-user-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.banUser();
        });
    }

    // Cambiar tab
    switchTab(tabName) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Actualizar contenido
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Cargar datos según el tab
        switch (tabName) {
            case 'stories':
                this.loadStories();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'moderation':
                this.loadModerationData();
                break;
            case 'logs':
                this.loadLogs();
                break;
        }
    }

    // Cargar estadísticas
    async loadStats() {
        try {
            const stats = await api.getAdminStats();
            this.stats = stats;
            this.updateStatsDisplay();
        } catch (error) {
            // Error cargando estadísticas
        }
    }

    // Actualizar display de estadísticas
    updateStatsDisplay() {
        document.getElementById('total-stories').textContent = this.stats.stories?.total || 0;
        document.getElementById('total-users').textContent = this.stats.users?.total || 0;
        document.getElementById('flagged-stories').textContent = this.stats.stories?.flagged || 0;
        document.getElementById('banned-users').textContent = this.stats.users?.banned || 0;
    }

    // Cargar historias
    async loadStories(status = 'all') {
        try {
            const response = await api.getAdminStories(this.currentPage, 20, status);
            this.stories = response.stories;
            this.renderStoriesTable();
            this.renderStoriesPagination(response.pagination);
        } catch (error) {
            this.showError('Error al cargar las historias');
        }
    }

    // Renderizar tabla de historias
    renderStoriesTable() {
        const tbody = document.getElementById('stories-tbody');
        if (!tbody) return;

        if (this.stories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <p>No hay historias para mostrar</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.stories.map(story => `
            <tr>
                <td>
                    <div class="story-info">
                        <strong>${this.escapeHtml(story.title)}</strong>
                        <small>${this.escapeHtml(story.content.substring(0, 50))}...</small>
                    </div>
                </td>
                <td>${this.escapeHtml(story.username)}</td>
                <td>
                    <span class="status-badge status-${story.status}">
                        ${this.getStatusText(story.status)}
                    </span>
                </td>
                <td>${new Date(story.createdAt).toLocaleDateString('es-ES')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" onclick="admin.viewStoryDetails('${story._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${story.status === 'active' ? 
                            `<button class="btn btn-sm btn-warning" onclick="admin.flagStory('${story._id}')">
                                <i class="fas fa-flag"></i>
                            </button>` : ''
                        }
                        ${story.status === 'flagged' ? 
                            `<button class="btn btn-sm btn-success" onclick="admin.approveStory('${story._id}')">
                                <i class="fas fa-check"></i>
                            </button>` : ''
                        }
                        <button class="btn btn-sm btn-error" onclick="admin.deleteStory('${story._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Renderizar paginación de historias
    renderStoriesPagination(pagination) {
        const container = document.getElementById('stories-pagination');
        if (!container) return;

        if (pagination.pages <= 1) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'flex';
        container.innerHTML = `
            <button class="btn btn-outline" ${pagination.page <= 1 ? 'disabled' : ''} 
                    onclick="admin.changePage(${pagination.page - 1})">
                <i class="fas fa-chevron-left"></i>
                Anterior
            </button>
            <span class="page-info">
                Página ${pagination.page} de ${pagination.pages}
            </span>
            <button class="btn btn-outline" ${pagination.page >= pagination.pages ? 'disabled' : ''} 
                    onclick="admin.changePage(${pagination.page + 1})">
                Siguiente
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }

    // Cambiar página
    changePage(page) {
        this.currentPage = page;
        this.loadStories();
    }

    // Cargar usuarios
    async loadUsers() {
        try {
            // Por ahora usamos datos de ejemplo
            this.users = [
                { username: 'admin', role: 'admin', status: 'active', lastLogin: new Date() },
                { username: 'veggetassj', role: 'user', status: 'active', lastLogin: new Date() }
            ];
            this.renderUsersTable();
        } catch (error) {
            // Error cargando usuarios
        }
    }

    // Renderizar tabla de usuarios
    renderUsersTable() {
        const container = document.getElementById('users-list');
        if (!container) return;

        if (this.users.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>No hay usuarios registrados</h3>
                    <p>Los usuarios aparecerán aquí cuando se registren.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Fecha de Registro</th>
                        <th>Último Login</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.users.map(user => `
                        <tr>
                            <td>
                                <div class="user-info">
                                    <strong>${this.escapeHtml(user.username)}</strong>
                                </div>
                            </td>
                            <td>
                                <span class="role-badge role-${user.role}">
                                    ${user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                </span>
                            </td>
                            <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                            <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Nunca'}</td>
                            <td>
                                <span class="status-badge ${user.isBanned ? 'status-banned' : 'status-active'}">
                                    ${user.isBanned ? 'Baneado' : 'Activo'}
                                </span>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-outline" onclick="admin.viewUserDetails('${user.username}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${user.role === 'admin' ? 
                                        `<button class="btn btn-sm btn-warning" onclick="admin.changeUserRole('${user.username}', 'user')" title="Quitar admin">
                                            <i class="fas fa-user-minus"></i>
                                        </button>` :
                                        `<button class="btn btn-sm btn-success" onclick="admin.changeUserRole('${user.username}', 'admin')" title="Hacer admin">
                                            <i class="fas fa-user-shield"></i>
                                        </button>`
                                    }
                                    ${user.isBanned ? 
                                        `<button class="btn btn-sm btn-success" onclick="admin.unbanUser('${user.username}')">
                                            <i class="fas fa-user-check"></i>
                                        </button>` :
                                        `<button class="btn btn-sm btn-error" onclick="admin.showBanModal('${user.username}')">
                                            <i class="fas fa-ban"></i>
                                        </button>`
                                    }
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // Cargar datos de moderación
    async loadModerationData() {
        try {
            // Cargar historias reportadas
            const flaggedStories = this.stories.filter(s => s.status === 'flagged');
            this.renderFlaggedStories(flaggedStories);

            // Cargar usuarios baneados
            const bannedUsers = this.users.filter(u => u.status === 'banned');
            this.renderBannedUsers(bannedUsers);
        } catch (error) {
            // Error cargando datos de moderación
        }
    }

    // Renderizar historias reportadas
    renderFlaggedStories(stories) {
        const container = document.getElementById('flagged-stories-list');
        if (!container) return;

        if (stories.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay historias reportadas</p>';
            return;
        }

        container.innerHTML = stories.map(story => `
            <div class="moderation-item">
                <div class="item-info">
                    <strong>${this.escapeHtml(story.title)}</strong>
                    <small>por ${this.escapeHtml(story.username)}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-success" onclick="admin.approveStory('${story._id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="admin.deleteStory('${story._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Renderizar usuarios baneados
    renderBannedUsers(users) {
        const container = document.getElementById('banned-users-list');
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay usuarios baneados</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="moderation-item">
                <div class="item-info">
                    <strong>${this.escapeHtml(user.username)}</strong>
                    <small>Baneado</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-success" onclick="admin.unbanUser('${user.username}')">
                        <i class="fas fa-user-check"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Cargar logs
    async loadLogs() {
        try {
            const container = document.getElementById('activity-logs');
            if (!container) return;

            // Por ahora mostramos logs de ejemplo
            container.innerHTML = `
                <div class="log-item">
                    <div class="log-time">${new Date().toLocaleString('es-ES')}</div>
                    <div class="log-message">Usuario veggetassj publicó una nueva historia</div>
                </div>
                <div class="log-item">
                    <div class="log-time">${new Date(Date.now() - 3600000).toLocaleString('es-ES')}</div>
                    <div class="log-message">Usuario admin inició sesión</div>
                </div>
            `;
        } catch (error) {
            // Error cargando logs
        }
    }

    // Acciones de historias
    async deleteStory(storyId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta historia?')) return;

        try {
            await api.deleteStory(storyId);
            this.showSuccess('Historia eliminada correctamente');
            this.loadStories();
            this.loadStats();
        } catch (error) {
            this.showError('Error al eliminar la historia');
        }
    }

    async flagStory(storyId) {
        try {
            // Implementar flag de historia
            this.showSuccess('Historia marcada como reportada');
            this.loadStories();
        } catch (error) {
            this.showError('Error al marcar la historia');
        }
    }

    async approveStory(storyId) {
        try {
            // Implementar aprobación de historia
            this.showSuccess('Historia aprobada correctamente');
            this.loadStories();
        } catch (error) {
            this.showError('Error al aprobar la historia');
        }
    }

    // Acciones de usuarios
    showBanModal(username) {
        document.getElementById('ban-user-modal').classList.add('active');
        document.getElementById('ban-user-modal').dataset.username = username;
    }

    closeBanModal() {
        document.getElementById('ban-user-modal').classList.remove('active');
        document.getElementById('ban-reason').value = '';
    }

    async banUser() {
        const username = document.getElementById('ban-user-modal').dataset.username;
        const reason = document.getElementById('ban-reason').value;

        try {
            await api.banUser(username, reason);
            this.showSuccess('Usuario baneado correctamente');
            this.closeBanModal();
            this.loadUsers();
            this.loadStats();
        } catch (error) {
            this.showError('Error al banear el usuario');
        }
    }

    async unbanUser(username) {
        if (!confirm('¿Estás seguro de que quieres desbanear a este usuario?')) return;

        try {
            await api.unbanUser(username);
            this.showSuccess('Usuario desbaneado correctamente');
            this.loadUsers();
            this.loadStats();
        } catch (error) {
            this.showError('Error al desbanear el usuario');
        }
    }

    // Cambiar rol de usuario
    async changeUserRole(username, newRole) {
        try {
            const confirmMessage = newRole === 'admin' 
                ? `¿Estás seguro de que quieres hacer admin al usuario "${username}"?`
                : `¿Estás seguro de que quieres quitar los privilegios de admin al usuario "${username}"?`;
            
            if (!confirm(confirmMessage)) {
                return;
            }

            await api.changeUserRole(username, newRole);
            
            this.showSuccess(`Rol de usuario ${username} cambiado a ${newRole === 'admin' ? 'administrador' : 'usuario'} correctamente.`);
            
            // Recargar la lista de usuarios
            this.loadUsers();
            
        } catch (error) {
            this.showError(`Error cambiando rol de usuario: ${error.message}`);
        }
    }

    // Modales
    async viewStoryDetails(storyId) {
        try {
            const story = this.stories.find(s => s._id === storyId);
            if (!story) return;

            const modal = document.getElementById('story-details-modal');
            const content = document.getElementById('story-details-content');

            content.innerHTML = `
                <div class="story-details">
                    <h3>${this.escapeHtml(story.title)}</h3>
                    <p><strong>Autor:</strong> ${this.escapeHtml(story.username)}</p>
                    <p><strong>Estado:</strong> ${this.getStatusText(story.status)}</p>
                    <p><strong>Fecha:</strong> ${new Date(story.createdAt).toLocaleString('es-ES')}</p>
                    <div class="story-content">
                        <h4>Contenido:</h4>
                        <p>${this.escapeHtml(story.content)}</p>
                    </div>
                    ${story.images && story.images.length > 0 ? `
                        <div class="story-images">
                            <h4>Imágenes (${story.images.length}):</h4>
                            <div class="images-grid">
                                ${story.images.map(img => `
                                    <img src="${img}" alt="Imagen de la historia" loading="lazy">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;

            modal.classList.add('active');
        } catch (error) {
            // Error mostrando detalles de historia
        }
    }

    closeStoryModal() {
        document.getElementById('story-details-modal').classList.remove('active');
    }

    async viewUserDetails(username) {
        try {
            const user = this.users.find(u => u.username === username);
            if (!user) return;

            const modal = document.getElementById('user-details-modal');
            const content = document.getElementById('user-details-content');

            content.innerHTML = `
                <div class="user-details">
                    <h3>${this.escapeHtml(user.username)}</h3>
                    <p><strong>Rol:</strong> ${user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
                    <p><strong>Estado:</strong> ${user.status === 'active' ? 'Activo' : 'Baneado'}</p>
                    <p><strong>Último login:</strong> ${user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-ES') : 'Nunca'}</p>
                </div>
            `;

            modal.classList.add('active');
        } catch (error) {
            // Error mostrando detalles de usuario
        }
    }

    closeUserModal() {
        document.getElementById('user-details-modal').classList.remove('active');
    }

    // Utilidades
    getStatusText(status) {
        const statusMap = {
            'active': 'Activa',
            'flagged': 'Reportada',
            'deleted': 'Eliminada'
        };
        return statusMap[status] || status;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Notificaciones
    showSuccess(message) {
        // Implementar notificación de éxito
    }

    showError(message) {
        // Implementar notificación de error
    }

    // Refresh functions
    refreshStories() {
        this.loadStories();
    }

    refreshUsers() {
        this.loadUsers();
    }

    clearLogs() {
        if (confirm('¿Estás seguro de que quieres limpiar todos los logs?')) {
            document.getElementById('activity-logs').innerHTML = '<p>Logs limpiados</p>';
        }
    }
}

// Crear instancia global
const admin = new AdminPanel();

// Exportar para uso en otros archivos
window.admin = admin; 