# 🌐 Configuración de Dominios - Ant Pool

## Dominios Configurados

### Dominio Principal
**URL:** https://antpool.cloud  
**Propósito:** Dominio de producción principal para usuarios finales  
**Estado:** ✅ Activo  

**Características:**
- URL amigable y fácil de recordar
- Mejor para marketing y SEO
- Dominio personalizado profesional
- Certificado SSL automático (Firebase Hosting)

### Dominio Secundario  
**URL:** https://blockchaincontract001.web.app  
**Propósito:** Dominio de respaldo y desarrollo  
**Estado:** ✅ Activo  

**Características:**
- Dominio Firebase gratuito
- Siempre disponible como fallback
- Útil para testing antes de deploy a producción
- Mismo contenido que el dominio principal

## 🔗 URLs Principales

### Landing Page
- **Principal:** https://antpool.cloud
- **Secundaria:** https://blockchaincontract001.web.app

### App Principal
- **Principal:** https://antpool.cloud/app.html
- **Secundaria:** https://blockchaincontract001.web.app/app.html

### Otras Páginas
- **Offline:** https://antpool.cloud/offline.html
- **SW Test:** https://antpool.cloud/sw-test.html

## 📋 Configuración en Firebase

### 1. Firebase Hosting
```bash
firebase deploy --only hosting
```

El deploy automáticamente actualiza **ambos dominios**:
- ✅ blockchaincontract001.web.app (automático)
- ✅ antpool.cloud (configurado en Firebase Console)

### 2. Configuración del Dominio Personalizado

**En Firebase Console:**
1. Hosting → Custom domains
2. Add custom domain: `antpool.cloud`
3. Seguir pasos de verificación DNS
4. Firebase provisiona SSL automáticamente

**Registros DNS requeridos:**
```
Type: A
Name: antpool.cloud
Value: (IP proporcionada por Firebase)

Type: A
Name: www.antpool.cloud
Value: (IP proporcionada por Firebase)
```

## 🔐 Configuración de Autenticación

### Firebase Authentication - Dominios Autorizados

**CRÍTICO:** Para que Google Sign-In funcione, ambos dominios deben estar autorizados:

**Firebase Console → Authentication → Settings → Authorized domains:**
- ✅ `antpool.cloud`
- ✅ `blockchaincontract001.web.app`
- ✅ `localhost` (para desarrollo)

**Sin esta configuración, el login de Google fallará con:**
```
Error: auth/unauthorized-domain
```

## 🌐 URLs en el Código

### Rutas Relativas (Recomendado)
Todos nuestros archivos usan rutas relativas para funcionar en cualquier dominio:

```javascript
// ✅ Correcto - Funciona en ambos dominios
start_url: "/"
redirect_uri: "/app.html"
manifest: "/manifest.json"

// ❌ Incorrecto - Solo funcionaría en un dominio
start_url: "https://antpool.cloud/"
```

### Meta Tags con URLs Absolutas
Solo en meta tags SEO usamos el dominio principal:

```html
<!-- index.html -->
<meta property="og:url" content="https://antpool.cloud/">
<meta property="og:image" content="https://antpool.cloud/assets/LogoAntPool.png">
```

## 📱 PWA en Ambos Dominios

El Service Worker funciona en **ambos dominios** porque usa rutas relativas:

```javascript
// service-worker.js
const STATIC_ASSETS = [
    '/',           // ✅ Funciona en antpool.cloud y blockchaincontract001.web.app
    '/app.html',   // ✅ Funciona en ambos
    '/index.html', // ✅ Funciona en ambos
];
```

**Resultado:**
- Instalable como PWA desde cualquier dominio
- Cache independiente por dominio
- Misma experiencia de usuario

## 🔄 Flujo de Deploy

### Desarrollo
```bash
# 1. Desarrollar localmente
npm run dev

# 2. Probar cambios en localhost
http://localhost:5000
```

### Staging/Testing
```bash
# 3. Deploy a Firebase (ambos dominios)
firebase deploy --only hosting

# 4. Verificar en dominio secundario primero
https://blockchaincontract001.web.app
```

### Producción
```bash
# 5. Si todo OK, verificar dominio principal
https://antpool.cloud

# 6. Usuarios acceden vía dominio principal
```

## 📊 Analytics y Tracking

**Google Analytics ID:** G-8G443F7LPT

Configurado para trackear tráfico de **ambos dominios**:
- antpool.cloud
- blockchaincontract001.web.app

**Referrers configurados:**
```javascript
// Ambos dominios reportan al mismo GA
gtag('config', 'G-8G443F7LPT');
```

## 🔍 SEO

### Sitemap
```xml
<!-- sitemap.xml -->
<url>
    <loc>https://antpool.cloud/</loc>
</url>
<url>
    <loc>https://antpool.cloud/app.html</loc>
</url>
```

### Robots.txt
```
Sitemap: https://antpool.cloud/sitemap.xml
```

**Nota:** Solo el dominio principal aparece en SEO para evitar contenido duplicado.

## ✅ Checklist de Configuración

### Firebase
- [x] Dominio personalizado agregado
- [x] SSL provisionado automáticamente
- [x] DNS configurado correctamente
- [x] Dominios autorizados en Authentication

### Código
- [x] Rutas relativas en manifest.json
- [x] Rutas relativas en service-worker.js
- [x] Meta tags con dominio principal
- [x] Sitemap con dominio principal

### Testing
- [x] PWA instalable en ambos dominios
- [x] Google Sign-In funciona en ambos
- [x] Service Worker activo en ambos
- [x] Offline mode funciona en ambos

## 🆘 Troubleshooting

### Error: "auth/unauthorized-domain"
**Solución:** Agregar dominio en Firebase Auth → Authorized domains

### SSL no funciona
**Solución:** Esperar 24-48 horas después de configurar DNS

### Dominio no resuelve
**Solución:** Verificar registros A en tu proveedor de DNS

### Service Worker no se registra
**Solución:** Verificar que la ruta sea `/service-worker.js` (relativa)

## 📞 Soporte

**Documentación Firebase:**
- [Custom Domains](https://firebase.google.com/docs/hosting/custom-domain)
- [Multiple Sites](https://firebase.google.com/docs/hosting/multisites)

**Dominio:** antpool.cloud  
**Firebase Project:** blockchaincontract001  
**Hosting Site:** blockchaincontract001.web.app
