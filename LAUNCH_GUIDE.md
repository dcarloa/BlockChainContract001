# 🚀 Guía de Lanzamiento - Ant Pool

## ✅ Completado

Los siguientes archivos han sido creados y están listos para usar:

### 📄 Documentos Legales
- ✅ `privacy-policy.html` - Política de Privacidad (GDPR/CCPA compliant)
- ✅ `terms-of-service.html` - Términos de Servicio
- ✅ `cookie-consent.js` - Banner de consentimiento de cookies

### 🔧 Configuración Técnica
- ✅ `manifest.json` - PWA manifest para app instalable
- ✅ `sitemap.xml` - Mapa del sitio para SEO
- ✅ `robots.txt` - Instrucciones para bots de búsqueda
- ✅ Google Analytics integrado en `index.html` y `app.html`
- ✅ Meta tags SEO y Open Graph añadidos
- ✅ Structured Data (JSON-LD) para SEO

---

## 🔴 ACCIONES REQUERIDAS

### 1. Configurar Google Analytics (CRÍTICO)

**Pasos:**
1. Ir a [Google Analytics](https://analytics.google.com/)
2. Crear una nueva propiedad para "Ant Pool"
3. Copiar tu ID de medición (formato: `G-XXXXXXXXXX`)
4. Reemplazar `G-XXXXXXXXXX` en estos archivos:
   - `frontend/index.html` (línea 5)
   - `frontend/app.html` (línea 5)

```javascript
// Buscar y reemplazar:
gtag('config', 'G-XXXXXXXXXX');
// Por:
gtag('config', 'G-TU-ID-REAL');
```

### 2. Actualizar Información Legal

**Privacy Policy (`privacy-policy.html`):**
- Línea 131: Reemplazar `privacy@antpool.app` con tu email real
- Línea 140: Agregar tu dirección física del negocio
- Línea 145: Reemplazar `dpo@antpool.app` con email del DPO

**Terms of Service (`terms-of-service.html`):**
- Línea 234: Reemplazar `legal@antpool.app` con tu email legal
- Línea 235: Reemplazar `support@antpool.app` con tu email de soporte
- Línea 200: Especificar tu jurisdicción legal (ej: "State of California, USA")

### 3. Crear Iconos para PWA

Necesitas generar iconos en estos tamaños y guardarlos en `frontend/assets/`:
- `icon-72.png` (72x72)
- `icon-96.png` (96x96)
- `icon-128.png` (128x128)
- `icon-144.png` (144x144)
- `icon-152.png` (152x152)
- `icon-192.png` (192x192)
- `icon-384.png` (384x384)
- `icon-512.png` (512x512)

**Herramientas recomendadas:**
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)

### 4. Configurar Firebase Hosting

Actualizar `firebase.json` para incluir nuevos archivos:

```json
{
  "hosting": {
    "public": "frontend",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=7200"
          }
        ]
      },
      {
        "source": "manifest.json",
        "headers": [
          {
            "key": "Content-Type",
            "value": "application/manifest+json"
          }
        ]
      }
    ]
  }
}
```

### 5. Configurar Google Ads

**Antes de crear campañas:**

1. **Verificar dominio en Google Search Console:**
   - Ir a [Search Console](https://search.google.com/search-console)
   - Añadir propiedad: `blockchaincontract001.web.app`
   - Subir `sitemap.xml`

2. **Crear cuenta Google Ads:**
   - Ir a [Google Ads](https://ads.google.com/)
   - Vincular con Google Analytics
   - Configurar conversiones:
     - Registro de usuario
     - Creación de grupo
     - Primera contribución

3. **Configurar eventos de conversión:**
   Los eventos ya están implementados en `app.html`:
   - `group_created`
   - `expense_added`
   - `wallet_connected`

### 6. Configurar Cookie Consent Banner

El banner ya está implementado en `cookie-consent.js`. Se mostrará automáticamente en la primera visita.

**Para personalizar:**
- Editar colores en líneas 80-200 de `cookie-consent.js`
- Modificar textos en líneas 40-70

---

## 📊 Métricas a Monitorear en Google Analytics

### Eventos Clave (Ya Configurados)
- `group_created` - Cuando se crea un grupo
- `expense_added` - Cuando se añade un gasto
- `wallet_connected` - Cuando se conecta MetaMask

### Conversiones Sugeridas
1. **Registro de Usuario** - Valor: $0 (lead)
2. **Primera Creación de Grupo** - Valor: $5 (engagement)
3. **Primer Gasto Añadido** - Valor: $10 (activation)

### KPIs a Revisar Semanalmente
- Usuarios activos diarios (DAU)
- Grupos creados por día
- Tasa de retención (7 días, 30 días)
- Tiempo promedio en app
- Tasa de conversión: visitante → registro → grupo creado

---

## 🎯 Campaña Google Ads Sugerida

### Presupuesto Inicial
- **$10-20 USD/día** para empezar
- **Duración:** 2 semanas de prueba
- **Total:** $140-280 USD

### Palabras Clave Sugeridas

**Alta Intención (CPC alto ~$2-5):**
- "split bills app"
- "expense sharing app"
- "shared expense tracker"
- "group expense app"

**Media Intención (CPC medio ~$1-2):**
- "how to split expenses"
- "roommate expense tracker"
- "travel expense app"
- "group payment app"

**Larga Cola (CPC bajo ~$0.50-1):**
- "split bills with roommates"
- "track shared expenses friends"
- "settle debts app"
- "blockchain expense sharing"

### Texto de Anuncio Sugerido

**Título 1:** Split Expenses Like Ants Work Together  
**Título 2:** 100% Free • No Hidden Fees  
**Título 3:** Track Group Expenses Instantly  

**Descripción 1:** Create groups, share expenses, and settle debts transparently. No bank account required.  
**Descripción 2:** Join thousands using Ant Pool for travel, roommates, and events. Start free today!  

**URL Final:** https://blockchaincontract001.web.app/  
**URLs Visibles:** antpool.app, blockchainexpenses.app

---

## 🔒 Cumplimiento Legal

### GDPR (Europa)
- ✅ Política de privacidad publicada
- ✅ Banner de cookies con opt-in
- ✅ Derecho a exportar/eliminar datos
- ⚠️ **PENDIENTE:** Nombrar DPO si procesas >5000 usuarios/mes

### CCPA (California)
- ✅ Política de privacidad incluye derechos CCPA
- ✅ No vendemos datos (declarado)
- ✅ Opción de eliminar cuenta

### México (LFPDPPP)
- ✅ Aviso de privacidad publicado
- ⚠️ **PENDIENTE:** Registro ante INAI si es persona moral

---

## 📝 Checklist Pre-Lanzamiento

### Antes de Activar Google Ads:
- [ ] Reemplazar IDs de Google Analytics
- [ ] Actualizar emails de contacto legal
- [ ] Generar y subir iconos PWA
- [ ] Probar banner de cookies
- [ ] Verificar dominio en Search Console
- [ ] Subir sitemap.xml
- [ ] Configurar eventos de conversión en GA4
- [ ] Probar app en móvil (iOS + Android)
- [ ] Verificar que Privacy Policy es accesible desde footer
- [ ] Testear formulario de contacto (si existe)

### Primera Semana Post-Lanzamiento:
- [ ] Revisar Analytics diariamente
- [ ] Ajustar pujas de Google Ads
- [ ] Pausar keywords con CTR <1%
- [ ] A/B test de landing page
- [ ] Recopilar feedback de primeros usuarios
- [ ] Monitorear errores en consola (Firebase)

---

## 🚨 Problemas Comunes y Soluciones

### Error: "Google Analytics no registra eventos"
**Solución:** Verificar que:
1. Cookie consent fue aceptado
2. ID de GA4 es correcto
3. CSP permite `www.googletagmanager.com`

### Error: "PWA no se instala"
**Solución:** 
1. Verificar que `manifest.json` es accesible
2. Generar todos los iconos requeridos
3. Servir con HTTPS (Firebase Hosting ya lo hace)

### Error: "Google Ads rechaza anuncio"
**Posibles razones:**
1. Privacy Policy no accesible → Verificar link en footer
2. Falta información de contacto → Añadir email/teléfono
3. Política de cookies no clara → Revisar `privacy-policy.html`

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisar [Firebase Docs](https://firebase.google.com/docs)
2. Consultar [Google Analytics Help](https://support.google.com/analytics)
3. Ver [Google Ads Support](https://support.google.com/google-ads)

---

## 🎉 ¡Listo para Lanzar!

Una vez completados todos los pasos del checklist, ejecuta:

```bash
firebase deploy --only hosting
```

Y estarás listo para activar tu campaña de Google Ads. 🚀

**¡Buena suerte con el lanzamiento de Ant Pool! 🐜**
