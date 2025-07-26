# Mi Blog Personal

Un blog personal moderno y responsive con sistema de autenticación, gestión de historias y subida de imágenes.

## Características

- ✅ Sistema de autenticación (registro/login)
- ✅ Dashboard para usuarios autenticados
- ✅ Creación y gestión de historias
- ✅ Subida múltiple de imágenes (hasta 4 por historia)
- ✅ Vista individual de historias
- ✅ Diseño responsive
- ✅ Interfaz moderna y intuitiva

## Estructura del Proyecto

```
Blog/
├── index.html          # Página principal
├── dashboard.html      # Dashboard de usuario
├── story.html         # Vista individual de historia
├── css/
│   ├── style.css      # Estilos globales
│   ├── components.css # Componentes UI
│   └── responsive.css # Diseño responsive
├── js/
│   ├── api.js         # Cliente API
│   ├── auth.js        # Autenticación
│   ├── main.js        # Funcionalidad principal
│   ├── stories.js     # Gestión de historias
│   ├── dashboard.js   # Dashboard
│   └── story-viewer.js # Vista de historia
└── README.md          # Este archivo
```

## Configuración para Prueba Piloto

### 1. Backend (Servidor)
Asegúrate de que el servidor esté ejecutándose en `http://localhost:3000`

### 2. Frontend
1. Abre `index.html` en tu navegador
2. O ejecuta un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```

### 3. Pruebas Recomendadas

#### Autenticación
- [ ] Registro de nuevo usuario
- [ ] Inicio de sesión
- [ ] Cerrar sesión
- [ ] Persistencia de sesión

#### Dashboard
- [ ] Acceso al dashboard
- [ ] Creación de nueva historia
- [ ] Subida de imágenes (1-4)
- [ ] Vista de historias propias
- [ ] Gestión de imágenes

#### Historias
- [ ] Visualización de historias en la página principal
- [ ] Vista individual de historia
- [ ] Galería de imágenes en historias
- [ ] Navegación entre historias

#### Responsive
- [ ] Funcionamiento en móvil
- [ ] Funcionamiento en tablet
- [ ] Funcionamiento en desktop

## Notas Importantes

- El backend debe estar ejecutándose en el puerto 3000
- Las imágenes se suben a Cloudinary
- Los tokens JWT se almacenan en localStorage
- El diseño es completamente responsive

## Próximos Pasos para Producción

1. Configurar dominio y hosting
2. Configurar SSL/HTTPS
3. Optimizar imágenes
4. Implementar SEO
5. Configurar analytics
6. Implementar backup automático
7. Configurar monitoreo de errores

## Soporte

Para reportar problemas o solicitar nuevas características, contacta al desarrollador. 