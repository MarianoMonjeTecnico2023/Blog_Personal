// ===== SISTEMA DE AUTENTICACIÓN =====
class Auth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    // Inicializar autenticación
    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        this.setupModals();
    }

    // Verificar estado de autenticación al cargar
    checkAuthStatus() {
        if (api.isAuthenticated() && !api.isTokenExpired()) {
            this.currentUser = api.getUserFromToken();
            this.updateUI();
        } else {
            // Limpiar token expirado o inválido
            api.logout();
            this.currentUser = null;
            this.updateUI();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botones de autenticación
        document.getElementById('login-btn')?.addEventListener('click', () => this.showLoginModal());
        document.getElementById('register-btn')?.addEventListener('click', () => this.showRegisterModal());
        
        // Botón de logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Botón de usuario para mostrar/ocultar dropdown
        document.getElementById('user-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropdown = document.getElementById('dropdown-menu');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });

        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            const dropdown = document.getElementById('dropdown-menu');
            if (userMenu && !userMenu.contains(e.target) && dropdown) {
                dropdown.classList.remove('show');
            }
        });

        // Switches entre modales
        document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideLoginModal();
            this.showRegisterModal();
        });

        document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.hideRegisterModal();
            this.showLoginModal();
        });

        // Formularios
        document.getElementById('login-form')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form')?.addEventListener('submit', (e) => this.handleRegister(e));

        // Cerrar modales
        document.getElementById('login-modal-close')?.addEventListener('click', () => this.hideLoginModal());
        document.getElementById('register-modal-close')?.addEventListener('click', () => this.hideRegisterModal());
    }

    // Configurar modales
    setupModals() {
        // Cerrar modales con botón X
        document.getElementById('login-modal-close')?.addEventListener('click', () => this.hideLoginModal());
        document.getElementById('register-modal-close')?.addEventListener('click', () => this.hideRegisterModal());

        // Cerrar modales haciendo clic fuera
        document.getElementById('login-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'login-modal') {
                this.hideLoginModal();
            }
        });

        document.getElementById('register-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'register-modal') {
                this.hideRegisterModal();
            }
        });

        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideLoginModal();
                this.hideRegisterModal();
            }
        });
    }

    // Mostrar modal de login
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('login-username')?.focus();
        }
    }

    // Ocultar modal de login
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('active');
            this.clearLoginForm();
        }
    }

    // Mostrar modal de registro
    showRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('active');
            document.getElementById('register-username')?.focus();
        }
    }

    // Ocultar modal de registro
    hideRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('active');
            this.clearRegisterForm();
        }
    }

    // Limpiar formulario de login
    clearLoginForm() {
        const form = document.getElementById('login-form');
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }
    }

    // Limpiar formulario de registro
    clearRegisterForm() {
        const form = document.getElementById('register-form');
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }
    }

    // Limpiar errores del formulario
    clearFormErrors(form) {
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.classList.remove('error');
        });

        const errorMessages = form.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.remove());
    }

    // Manejar login
    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value;

        // Validaciones
        if (!username || !password) {
            this.showFormError(form, 'Por favor completa todos los campos');
            return;
        }

        try {
            this.showLoading(form);
            const response = await api.login(username, password);
            
            this.currentUser = api.getUserFromToken();
            this.updateUI();
            this.hideLoginModal();
            
            this.showNotification('¡Bienvenido de vuelta!', 'success');
            
            // Recargar historias si estamos en la página principal
            if (window.loadStories) {
                window.loadStories();
            }
            
        } catch (error) {
            let errorMessage = 'Error al iniciar sesión';
            
            if (error.message.includes('401')) {
                errorMessage = 'Usuario o contraseña incorrectos';
            } else if (error.message.includes('400')) {
                errorMessage = 'Datos inválidos. Verifica la información ingresada.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Error del servidor. Intenta más tarde.';
            } else {
                errorMessage = error.message || 'Error al iniciar sesión';
            }
            
            this.showFormError(form, errorMessage);
        } finally {
            this.hideLoading(form);
        }
    }

    // Manejar registro
    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const username = form.username.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;

        // Validaciones
        if (!username || !password || !confirmPassword) {
            this.showFormError(form, 'Por favor completa todos los campos');
            return;
        }

        if (username.length < 3) {
            this.showFormError(form, 'El nombre de usuario debe tener al menos 3 caracteres');
            return;
        }

        if (password.length < 8) {
            this.showFormError(form, 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            this.showFormError(form, 'Las contraseñas no coinciden');
            return;
        }

        // Validar formato de contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
        if (!passwordRegex.test(password)) {
            this.showFormError(form, 'La contraseña debe contener al menos una minúscula, una mayúscula y un número');
            return;
        }

        try {
            this.showLoading(form);
            await api.register(username, password);
            
            this.hideRegisterModal();
            this.showLoginModal();
            
            this.showNotification('¡Registro exitoso! Ahora puedes iniciar sesión', 'success');
            
        } catch (error) {
            let errorMessage = 'Error al registrarse';
            
            if (error.message.includes('409')) {
                errorMessage = 'El nombre de usuario ya existe. Intenta con otro nombre.';
            } else if (error.message.includes('400')) {
                errorMessage = 'Datos inválidos. Verifica la información ingresada.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Error del servidor. Intenta más tarde.';
            } else {
                errorMessage = error.message || 'Error al registrarse';
            }
            
            this.showFormError(form, errorMessage);
        } finally {
            this.hideLoading(form);
        }
    }

    // Mostrar error en formulario
    showFormError(form, message) {
        this.clearFormErrors(form);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        form.insertBefore(errorDiv, form.firstChild);
    }

    // Mostrar loading en formulario
    showLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        }
    }

    // Ocultar loading en formulario
    hideLoading(form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Enviar';
        }
    }

    // Actualizar interfaz de usuario
    updateUI() {
        const authButtons = document.querySelector('.nav-auth');
        const userMenu = document.getElementById('user-menu');
        const usernameDisplay = document.getElementById('username-display');
        const adminLink = document.getElementById('admin-link');

        if (this.currentUser && api.isAuthenticated() && !api.isTokenExpired()) {
            // Usuario autenticado válido
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                if (usernameDisplay) {
                    usernameDisplay.textContent = this.currentUser.username;
                }
            }
            
            // Mostrar enlace de administración solo para admins
            if (adminLink && this.currentUser.role === 'admin') {
                adminLink.style.display = 'block';
                adminLink.href = 'admin.html';
            } else if (adminLink) {
                adminLink.style.display = 'none';
            }
        } else {
            // Usuario no autenticado o token expirado
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            
            // Ocultar enlace de administración
            if (adminLink) {
                adminLink.style.display = 'none';
            }
        }
    }

    // Cerrar sesión
    logout() {
        api.logout();
        this.currentUser = null;
        this.updateUI();
        
        // Redirigir a la página principal considerando el subdirectorio
        const currentPath = window.location.pathname;
        const basePath = currentPath.includes('/Blog_Personal/') ? '/Blog_Personal/' : '/';
        
        if (!currentPath.endsWith('index.html') && !currentPath.endsWith('/')) {
            window.location.href = basePath + 'index.html';
        }
        
        this.showNotification('Sesión cerrada correctamente', 'info');
    }

    // Limpiar estado de autenticación (para tokens expirados)
    clearAuthState() {
        api.logout();
        this.currentUser = null;
        this.updateUI();
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        // Agregar al DOM
        document.body.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Ocultar después de 5 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return api.isAuthenticated() && !api.isTokenExpired();
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si el usuario es admin (esto se puede implementar más adelante)
    isAdmin() {
        // Por ahora retornamos false, se puede implementar cuando tengamos la información del rol
        return false;
    }
}

// Crear instancia global de Auth
const auth = new Auth();

// Exportar para uso en otros archivos
window.auth = auth; 