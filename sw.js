// Service Worker para Mi Blog
const CACHE_NAME = 'mi-blog-v1';
const urlsToCache = [
    '/',
    '/frontend/index.html',
    '/frontend/css/style.css',
    '/frontend/css/components.css',
    '/frontend/css/responsive.css',
    '/frontend/js/api.js',
    '/frontend/js/auth.js',
    '/frontend/js/stories.js',
    '/frontend/js/main.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eliminando cache antiguo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver respuesta del cache si existe
                if (response) {
                    return response;
                }
                
                // Si no está en cache, hacer petición a la red
                return fetch(event.request)
                    .then((response) => {
                        // No cachear peticiones que no sean exitosas
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Clonar la respuesta para cachearla
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    });
            })
    );
}); 