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

    // Configurar tooltips
    setupTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip-text';
                tooltip.textContent = e.target.dataset.tooltip;
                e.target.appendChild(tooltip);
            });

            element.addEventListener('mouseleave', (e) => {
                const tooltip = e.target.querySelector('.tooltip-text');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }

    // Configurar lazy loading para imágenes
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[data-src]');
            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // Configurar formularios
    setupForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // Prevenir envío por defecto si no hay manejador específico
                if (!form.dataset.handler) {
                    e.preventDefault();
                    auth.showNotification('Formulario en desarrollo', 'info');
                }
            });
        });
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
        });

        // Mejorar contraste para usuarios con preferencias de alto contraste
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
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
});

// Manejar errores no capturados
window.addEventListener('error', (e) => {
    // Error no capturado
});

// Manejar promesas rechazadas
window.addEventListener('unhandledrejection', (e) => {
    // Promesa rechazada no manejada
}); 