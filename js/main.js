// ===== ARCHIVO PRINCIPAL =====

// Función helper para redirecciones
function redirectTo(path) {
    const currentPath = window.location.pathname;
    const basePath = currentPath.includes('/Blog_Personal/') ? '/Blog_Personal/' : '/';
    window.location.href = basePath + path;
}

// Hacer la función disponible globalmente
window.redirectTo = redirectTo;

class Main {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.checkServerConnection();
    }

    // Configurar navegación suave
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // Actualizar enlace activo
                this.updateActiveNavLink(link);
            });
        });

        // Actualizar enlace activo al hacer scroll
        window.addEventListener('scroll', () => {
            this.updateActiveNavLinkOnScroll();
        });
    }

    // Actualizar enlace activo
    updateActiveNavLink(clickedLink) {
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar clase active al enlace clickeado
        clickedLink.classList.add('active');
    }

    // Actualizar enlace activo basado en scroll
    updateActiveNavLinkOnScroll() {
        const sections = ['home', 'stories', 'about', 'contact'];
        const headerHeight = document.querySelector('.header').offsetHeight;
        
        let currentSection = '';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const sectionTop = section.offsetTop - headerHeight - 100;
                const sectionBottom = sectionTop + section.offsetHeight;
                const scrollPosition = window.scrollY;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSection = sectionId;
                }
            }
        });
        
        // Actualizar enlace activo
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Configurar efectos de scroll
    setupScrollEffects() {
        // Efecto de header al hacer scroll
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const currentScrollTop = window.scrollY;
            
            if (currentScrollTop > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'none';
            }
            
            lastScrollTop = currentScrollTop;
        });

        // Animaciones de entrada al hacer scroll
        this.setupScrollAnimations();
    }

    // Configurar animaciones de scroll
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observar elementos para animar
        const animateElements = document.querySelectorAll('.story-card, .feature, .contact-item');
        animateElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
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

            // Cerrar menú al hacer clic en un enlace
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    }

    // Verificar conexión con el servidor
    async checkServerConnection() {
        try {
            await api.healthCheck();
        } catch (error) {
            this.showServerError();
        }
    }

    // Mostrar error de servidor
    showServerError() {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            Error de conexión con el servidor. Algunas funciones pueden no estar disponibles.
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 1000);
    }

    // Configurar botones de acción
    setupActionButtons() {
        // Botón de escribir historia
        const writeBtn = document.getElementById('write-btn');
        if (writeBtn) {
            writeBtn.addEventListener('click', () => {
                if (auth.isAuthenticated()) {
                    redirectTo('dashboard.html');
                } else {
                    auth.showLoginModal();
                }
            });
        }

        // Botón de explorar historias
        const exploreBtn = document.getElementById('explore-btn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                document.getElementById('stories')?.scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }
    }

    // Configurar enlaces del footer
    setupFooterLinks() {
        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Por ahora solo mostramos una notificación
                auth.showNotification('Enlace en desarrollo', 'info');
            });
        });
    }

    // Configurar enlaces sociales
    setupSocialLinks() {
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                auth.showNotification('Enlaces sociales en desarrollo', 'info');
            });
        });
    }

    // Configurar lazy loading
    setupLazyLoading() {
        // Lazy loading de imágenes
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Lazy loading de contenido
        const contentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });

        document.querySelectorAll('.story-card, .stat-card').forEach(card => {
            contentObserver.observe(card);
        });
    }

    // Configurar tooltips mejorados
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        
        tooltipElements.forEach(element => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = element.dataset.tooltip;
            document.body.appendChild(tooltip);
            
            let timeout;
            
            element.addEventListener('mouseenter', (e) => {
                timeout = setTimeout(() => {
                    const rect = element.getBoundingClientRect();
                    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
                    tooltip.classList.add('show');
                }, 500);
            });
            
            element.addEventListener('mouseleave', () => {
                clearTimeout(timeout);
                tooltip.classList.remove('show');
            });
        });
    }

    // Configurar formularios mejorados
    setupForms() {
        // Validación en tiempo real
        document.querySelectorAll('form').forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
                
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        this.validateField(input);
                    }
                });
            });
            
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });
        });
    }
    
    // Validar campo individual
    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');
        
        // Limpiar errores previos
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Validar campo requerido
        if (required && !value) {
            this.showFieldError(field, 'Este campo es requerido');
            return false;
        }
        
        // Validar email
        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showFieldError(field, 'Email inválido');
                return false;
            }
        }
        
        // Validar contraseña
        if (type === 'password' && value) {
            if (value.length < 8) {
                this.showFieldError(field, 'La contraseña debe tener al menos 8 caracteres');
                return false;
            }
        }
        
        return true;
    }
    
    // Mostrar error de campo
    showFieldError(field, message) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
    }
    
    // Validar formulario completo
    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Configurar accesibilidad
    setupAccessibility() {
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            // Skip to main content
            if (e.key === 'Tab' && e.altKey) {
                e.preventDefault();
                document.querySelector('main')?.focus();
            }
            
            // Navegación con flechas en el menú
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeAllDropdowns();
            }
            
            // Navegación rápida
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'h':
                        e.preventDefault();
                        redirectTo('index.html');
                        break;
                    case 'd':
                        e.preventDefault();
                        if (auth.isAuthenticated()) {
                            redirectTo('dashboard.html');
                        }
                        break;
                    case 'a':
                        e.preventDefault();
                        if (auth.isAuthenticated() && auth.getCurrentUser()?.role === 'admin') {
                            redirectTo('admin.html');
                        }
                        break;
                }
            }
        });

        // Mejorar contraste para usuarios con preferencias de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Reducir movimiento para usuarios con preferencias
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // Mejorar focus visible
        this.setupFocusManagement();
    }
    
    // Configurar gestión de focus
    setupFocusManagement() {
        // Mantener focus dentro de modales
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.modal.active');
            if (modal && e.key === 'Tab') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }
    
    // Cerrar todos los modales
    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    // Cerrar todos los dropdowns
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    // Configurar PWA (Progressive Web App)
    setupPWA() {
        // Registrar service worker si está disponible
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/Blog_Personal/sw.js')
                    .then(registration => {
                        // Service Worker registrado correctamente
                    })
                    .catch(registrationError => {
                        // Error al registrar Service Worker
                    });
            });
        }

        // Configurar instalación de PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Mostrar botón de instalación si es necesario
            this.showInstallButton();
        });
    }

    // Mostrar botón de instalación
    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.className = 'btn btn-primary';
        installBtn.innerHTML = '<i class="fas fa-download"></i> Instalar App';
        installBtn.style.position = 'fixed';
        installBtn.style.bottom = '20px';
        installBtn.style.right = '20px';
        installBtn.style.zIndex = '1000';
        
        installBtn.addEventListener('click', () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    // Usuario aceptó la instalación
                }
                deferredPrompt = null;
                installBtn.remove();
            });
        });
        
        document.body.appendChild(installBtn);
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const app = new Main();
    
    // Configurar funciones adicionales
    app.setupActionButtons();
    app.setupFooterLinks();
    app.setupSocialLinks();
    app.setupTooltips();
    app.setupLazyLoading();
    app.setupForms();
    app.setupAccessibility();
    app.setupPWA();
    
    // Inicializar autenticación después de que todo esté configurado
    setTimeout(() => {
        if (typeof auth !== 'undefined') {
            auth.init();
            // Forzar actualización adicional
            setTimeout(() => {
                auth.updateUI();
            }, 100);
        } else {
            console.error('Auth no está disponible');
        }
    }, 100);
});

// También inicializar cuando la ventana esté completamente cargada
window.addEventListener('load', () => {
    if (typeof auth !== 'undefined') {
        auth.updateUI();
    }
});

// Manejar errores no capturados
window.addEventListener('error', (e) => {
    // Error no capturado
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', (e) => {
    // Promesa rechazada no manejada
}); 