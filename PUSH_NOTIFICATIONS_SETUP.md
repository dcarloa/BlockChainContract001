# Push Notifications Setup Guide

## 🚀 Configuración Paso a Paso

### 1. Firebase Console - Upgrade a Blaze Plan

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **blockchaincontract001**
3. Click en **⚙️ Settings** (esquina inferior izquierda)
4. Click en **Usage and Billing**
5. Click en **Modify Plan** → Selecciona **Blaze (Pay as you go)**
6. Ingresa información de pago (tarjeta de crédito)
7. ✅ Confirma upgrade

**Costo esperado:** ~$5-10/mes con uso normal

---

### 2. Firebase Console - Generar VAPID Keys

1. En Firebase Console, ve a **⚙️ Project Settings**
2. Click en tab **Cloud Messaging**
3. Scroll hasta **Web Push certificates**
4. Click en **Generate key pair**
5. **Copia la clave generada** (algo como: `BNzY...`)

---

### 3. Actualizar Código con VAPID Key

#### A. Service Worker (`frontend/service-worker.js`)

Busca línea ~270 y reemplaza la configuración de Firebase:

```javascript
firebase.initializeApp({
    apiKey: "TU_API_KEY_ACTUAL",
    authDomain: "blockchaincontract001.firebaseapp.com",
    databaseURL: "https://blockchaincontract001-default-rtdb.firebaseio.com",
    projectId: "blockchaincontract001",
    storageBucket: "blockchaincontract001.appspot.com",
    messagingSenderId: "TU_SENDER_ID",
    appId: "TU_APP_ID"
});
```

**Dónde encontrar estos valores:**
- Firebase Console → Project Settings → General → Your apps → Web app

#### B. Firebase Messaging (`frontend/firebase-messaging.js`)

Busca línea ~107 y reemplaza:

```javascript
const token = await messagingInstance.getToken({
    vapidKey: 'PEGA_AQUI_TU_VAPID_KEY' // La key que copiaste en paso 2
});
```

---

### 4. Instalar Dependencias de Cloud Functions

```bash
cd functions
npm install
```

Esto instalará:
- firebase-admin
- firebase-functions

---

### 5. Deploy Cloud Functions

```bash
# Deploy solo las functions
firebase deploy --only functions

# O deploy completo (hosting + functions + database rules)
firebase deploy
```

---

### 6. Verificar Instalación

1. **Abre la app** en navegador
2. **Inicia sesión** con Google
3. **Abre perfil** → Tab "Settings"
4. **Activa** "🔔 Push Notifications"
5. **Acepta permiso** en el browser
6. ✅ Debería decir "Push notifications enabled"

**Verificar en Firebase Console:**
- Database → fcmTokens → {tu_userId} → Debe aparecer un token

---

### 7. Probar Notificaciones

#### Opción A: Crear gasto en un grupo

1. Abre un grupo en Simple Mode
2. Agrega un gasto
3. **Deberías recibir notificación** (si estás en otro tab o app cerrada)

#### Opción B: Test manual desde Firebase Console

1. Cloud Messaging → Send test message
2. Pega tu FCM token (copiado de Database)
3. Agrega título y mensaje
4. Click Send

---

## 📱 Instalar como PWA para Testing

**En Android/iOS:**
1. Abre antpool.cloud en Chrome/Safari
2. Menu → "Add to Home Screen"
3. Abre la app desde home screen
4. Cierra la app completamente
5. Pide a otro usuario crear un gasto en tu grupo
6. ✅ Debería llegar notificación push

---

## 🔍 Troubleshooting

### "Permission denied"
- Usuario debe aceptar permisos en browser
- Revisar que HTTPS esté activo (obligatorio)

### "FCM token not saved"
- Verificar que Firebase está inicializado
- Verificar que usuario está autenticado
- Check console para errores

### "No notification received"
- Verificar que Cloud Function se deployed correctamente
- Check Firebase Functions logs: `firebase functions:log`
- Verificar que token existe en Database

### "Invalid VAPID key"
- Asegurarse de copiar VAPID key completa
- No incluir comillas ni espacios
- Debe empezar con "B" y tener ~170 caracteres

---

## 💰 Monitoreo de Costos

1. Firebase Console → Usage and Billing
2. Ver **Functions invocations** (debe ser mínimo)
3. Configurar **Budget alerts** para evitar sorpresas
   - $10 → Email warning
   - $25 → Email warning
   - $50 → Stop services

---

## 🎯 Siguientes Pasos Opcionales

- [ ] Agregar analytics de notificaciones (cuántas se abren)
- [ ] Permitir silenciar notificaciones por grupo
- [ ] Agregar notificaciones programadas (resúmenes diarios)
- [ ] Personalizar sonido/vibración por tipo

---

## ⚠️ Advertencias Importantes

1. **VAPID Key es secreta**: No commitear a GitHub
2. **Service Worker cache**: Los cambios pueden tardar en verse
   - Force refresh: Ctrl+Shift+R
   - O Application → Service Workers → Unregister
3. **Permisos**: Si usuario niega, debe ir a browser settings para reactivar
4. **iOS Safari**: Soporte limitado para notificaciones PWA (solo desde iOS 16.4+)

---

## 📞 Soporte

Si algo falla:
1. Check browser console (F12)
2. Check Firebase Functions logs: `firebase functions:log`
3. Verificar que Blaze plan está activo
4. Asegurarse de que todas las keys están correctas
