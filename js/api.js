// ===== API CLIENT =====
class API {
    constructor() {
        this.baseURL = 'https://blog-server-53il.onrender.com';
        this.token = localStorage.getItem('token');
    }

    // Configurar headers con token
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Actualizar token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    // Método genérico para hacer peticiones
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const config = {
                headers: this.getHeaders(),
                ...options
            };

            const response = await fetch(url, config);
            
            // Si la respuesta no es exitosa, lanzar error
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Si la respuesta es 204 (No Content), retornar null
            if (response.status === 204) {
                return null;
            }

            // Intentar parsear JSON
            const data = await response.json();
            return data;
        } catch (error) {
            throw error;
        }
    }

    // ===== AUTENTICACIÓN =====
    
    // Registrar usuario
    async register(username, password) {
        return this.request('/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    // Iniciar sesión
    async login(username, password) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    // Cerrar sesión
    logout() {
        this.setToken(null);
    }

    // ===== HISTORIAS =====
    
    // Obtener historias públicas
    async getStories(page = 1, limit = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        return this.request(`/stories?${params}`);
    }

    // Crear nueva historia
    async createStory(title, content, featuredImage = null, images = []) {
        return this.request('/stories', {
            method: 'POST',
            body: JSON.stringify({ 
                title, 
                content, 
                featuredImage,
                images: images || []
            })
        });
    }

    // Obtener historias del usuario autenticado
    async getMyStories(page = 1, limit = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        return this.request(`/my-stories?${params}`);
    }

    // Obtener una historia específica del usuario
    async getMyStory(storyId) {
        return this.request(`/my-stories/${storyId}`);
    }

    // Actualizar una historia del usuario
    async updateStory(storyId, title, content, featuredImage = null, images = []) {
        return this.request(`/my-stories/${storyId}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                title, 
                content, 
                featuredImage,
                images: images || []
            })
        });
    }

    // Eliminar una historia del usuario
    async deleteMyStory(storyId) {
        return this.request(`/my-stories/${storyId}`, {
            method: 'DELETE'
        });
    }

    // ===== IMÁGENES =====
    
    // Subir imagen
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const url = `${this.baseURL}/upload-image`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                // Si el token expiró, intentar renovar o redirigir al login
                if (response.status === 401 && errorData.message?.includes('Token')) {
                    // Limpiar token expirado
                    this.logout();
                    // Lanzar error específico para token expirado
                    throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
                }
                
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Retornar solo la parte image del resultado
            return result.image;
        } catch (error) {
            throw error;
        }
    }

    // Obtener imágenes del usuario
    async getMyImages(page = 1, limit = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        return this.request(`/my-images?${params}`);
    }

    // Eliminar imagen
    async deleteImage(publicId) {
        const encodedPublicId = encodeURIComponent(publicId);
        return this.request(`/delete-image/${encodedPublicId}`, {
            method: 'DELETE'
        });
    }

    // ===== ADMINISTRACIÓN =====
    
    // Obtener todas las historias (admin)
    async getAdminStories(page = 1, limit = 20, status = 'all') {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString()
        });
        
        if (status !== 'all') {
            params.append('status', status);
        }
        
        return this.request(`/admin/stories?${params}`);
    }

    // Eliminar historia (admin)
    async deleteStory(storyId) {
        return this.request(`/admin/stories/${storyId}`, {
            method: 'DELETE'
        });
    }

    // Banear usuario (admin)
    async banUser(username, reason) {
        return this.request(`/admin/users/${username}/ban`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
    }

    // Desbanear usuario (admin)
    async unbanUser(username) {
        return this.request(`/admin/users/${username}/unban`, {
            method: 'POST'
        });
    }

    // Obtener estadísticas (admin)
    async getAdminStats() {
        return this.request('/admin/stats');
    }

    // ===== UTILIDADES =====
    
    // Health check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error('Servidor no disponible');
            }
        } catch (error) {
            throw new Error('No se puede conectar al servidor');
        }
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!this.token;
    }

    // Obtener información del usuario desde el token
    getUserFromToken() {
        if (!this.token) return null;
        
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            return {
                username: payload.username,
                role: payload.role || 'user',
                exp: payload.exp
            };
        } catch (error) {
            return null;
        }
    }

    // Verificar si el token ha expirado
    isTokenExpired() {
        const user = this.getUserFromToken();
        if (!user) return true;
        
        return Date.now() >= user.exp * 1000;
    }
}

// Crear instancia global de la API
const api = new API();

// Exportar para uso en otros archivos
window.api = api; 
