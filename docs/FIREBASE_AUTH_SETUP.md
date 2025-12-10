# 🔧 Firebase Authentication Setup

## Error: `auth/configuration-not-found`

Este error ocurre cuando el dominio de tu app no está autorizado en Firebase Authentication.

### ✅ Solución - Autorizar Dominio

1. **Ve a Firebase Console:**
   - https://console.firebase.google.com/

2. **Selecciona tu proyecto:**
   - `blockchaincontract001`

3. **Ve a Authentication:**
   - Click en "Authentication" en el menú lateral
   - Click en la pestaña "Settings"
   - Scroll hasta "Authorized domains"

4. **Agrega tu dominio:**
   - Click en "Add domain"
   - Agrega: `blockchaincontract001.web.app`
   - Click "Add"

5. **Verifica que estén estos dominios:**
   - ✅ `localhost` (para desarrollo local)
   - ✅ `blockchaincontract001.web.app` (tu app desplegada)
   - ✅ `blockchaincontract001.firebaseapp.com` (dominio alternativo)

### 🔍 Verificación

Después de agregar el dominio:

1. Espera 1-2 minutos para que los cambios se propaguen
2. Recarga tu app: https://blockchaincontract001.web.app
3. Intenta "Sign In with Google" de nuevo
4. Debería funcionar correctamente

### ⚙️ Configuración Adicional (Opcional)

#### Habilitar Proveedores de Autenticación:

1. En Firebase Console → Authentication → Sign-in method
2. Asegúrate de que estén habilitados:
   - ✅ **Google** (debe tener un ícono verde)
   - ✅ **Email/Password** (debe estar enabled)

#### Configurar Google OAuth:

1. Click en "Google" provider
2. Verifica:
   - ✅ Enable está activado
   - ✅ Project support email está configurado
   - ✅ Web SDK configuration tiene Client ID
3. Click "Save"

### 🐛 Troubleshooting

#### Error persiste después de agregar dominio:

1. **Clear browser cache:**
   - Ctrl+Shift+Del
   - Clear cached images and files
   - Reload app

2. **Verifica en Consola:**
   - Abre DevTools (F12)
   - Ve a Console
   - Busca errores relacionados con Firebase

3. **Verifica CSP:**
   - El Content-Security-Policy debe incluir:
     - `https://apis.google.com`
     - `https://accounts.google.com`
     - `https://*.googleapis.com`

4. **Intenta en ventana incógnito:**
   - Abre una ventana privada/incógnito
   - Ve a tu app
   - Intenta sign-in
   - Esto descarta problemas de cache

#### Popup bloqueado:

- Navegadores pueden bloquear el popup de Google
- Verifica que permites popups para tu dominio
- En Chrome: Click en el ícono de "popup blocked" en la barra de direcciones

### 📝 Notas

- Los cambios en Firebase pueden tardar algunos minutos
- El error `auth/configuration-not-found` es específico de dominios no autorizados
- Una vez configurado, funcionará permanentemente
- No necesitas redeployar tu app después de cambiar configuración de Firebase

---

**Siguiente paso:** Una vez completado esto, podrás usar Google Sign-In sin problemas! 🚀
