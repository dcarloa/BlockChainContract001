# 💎 Sistema de Suscripción - Freemium

Sistema completo de suscripción FREE vs PRO para AntPool.

## 🚀 Estado Actual

**LAUNCH_MODE = true** - Todas las funcionalidades están disponibles para todos los usuarios.

Cuando estés listo para activar las restricciones:
1. Cambia `LAUNCH_MODE = false` en `subscription-manager.js` línea 10
2. Redespliega en Firebase
3. Las validaciones se activarán automáticamente

## 📊 Planes de Suscripción

### 🆓 FREE
- ✅ **3 grupos activos**
- ✅ Hasta **10 miembros** por grupo
- ✅ Gastos ilimitados
- ✅ Liquidaciones básicas y Smart
- ✅ Estadísticas simples (totales, balances)
- ✅ Invitaciones por enlace
- ❌ Sin acceso a analíticos
- ❌ Solo **1 cofre semanal**
- ❌ Solo **2 minijuegos** (1 atendido: Memory Match, 1 no atendido: Treasure Hunt)
- ❌ Sin gastos recurrentes
- ❌ Sin budget
- ❌ **Marca de agua**: "Powered by AntPool"

### 💎 PRO
- ✅ Hasta **100 grupos** (candado de seguridad)
- ✅ Hasta **100 miembros** por grupo (candado de seguridad)
- ✅ Sistema de Colonia completo con mejores recompensas
- ✅ **2 cofres semanales** (más recompensas)
- ✅ **7 Challenge Games** completos
- ✅ Analíticos avanzados
- ✅ Gráficas avanzadas (Chart.js)
- ✅ Gastos recurrentes automatizados
- ✅ Budget tracking
- ✅ Exportar datos (CSV/Excel)
- ✅ **Sin marca de agua**

## 🔧 Archivos del Sistema

### Archivos Principales
- `frontend/subscription-manager.js` - Lógica central del sistema
- `frontend/subscription-styles.css` - Estilos de badges, modals, etc.

### Integraciones
El sistema está integrado en:
- `frontend/mode-manager.js` (línea 87) - Validación al crear grupos
- `frontend/app-platform.js` (línea 5141) - Validación al agregar miembros
- `frontend/app.html` (líneas 52-63) - Carga de scripts y estilos

## 📝 Uso del Sistema

### En el Código

```javascript
// Verificar si usuario es PRO
const isPro = await window.SubscriptionManager.isPro(userId);

// Verificar si puede crear grupo
const canCreate = await window.SubscriptionManager.canCreateGroup(userId);
if (!canCreate.allowed) {
    window.SubscriptionManager.showUpgradeModal(
        window.SubscriptionManager.FEATURES.MULTIPLE_GROUPS
    );
    return;
}

// Verificar si puede agregar miembro
const canAdd = await window.SubscriptionManager.canAddMember(userId, groupId);
if (!canAdd.allowed) {
    showToast(canAdd.reason, 'error');
    return;
}

// Verificar acceso a feature específica
const canUse = await window.SubscriptionManager.canAccessFeature(
    userId,
    window.SubscriptionManager.FEATURES.ANALYTICS
);

// Obtener minijuegos permitidos
const allowed = await window.SubscriptionManager.getAllowedMinigames(userId);
// Retorna: { attended: ['memoryMatch'], unattended: ['treasureHunt'], total: 2 }

// Verificar si puede jugar un minigame específico
const canPlay = await window.SubscriptionManager.canPlayMinigame(userId, 'wordScramble');
```

### Features Disponibles

```javascript
window.SubscriptionManager.FEATURES = {
    MULTIPLE_GROUPS: 'multiple_groups',
    UNLIMITED_MEMBERS: 'unlimited_members',
    ANALYTICS: 'analytics',
    RECURRING_EXPENSES: 'recurring_expenses',
    BUDGET: 'budget',
    ADVANCED_CHARTS: 'advanced_charts',
    ALL_MINIGAMES: 'all_minigames',
    MULTIPLE_CHESTS: 'multiple_chests',
    EXPORT_DATA: 'export_data',
    NO_WATERMARK: 'no_watermark'
}
```

### Mostrar Modal de Upgrade

```javascript
// Con feature específica
window.SubscriptionManager.showUpgradeModal(
    window.SubscriptionManager.FEATURES.ALL_MINIGAMES
);

// Modal genérico
window.SubscriptionManager.showUpgradeModal();
```

## 🎨 UI Components

### PRO Badge
Agregar badge PRO a elementos:

```javascript
const element = document.querySelector('.feature-title');
window.SubscriptionManager.addProBadge(element);
```

En HTML con CSS:
```html
<h3>Advanced Analytics <span class="pro-badge">PRO</span></h3>
```

### Watermark (Free Tier)
El watermark aparece automáticamente en usuarios FREE.
Para ocultarlo en PRO, agregar en el código:

```javascript
const isPro = await window.SubscriptionManager.isPro(userId);
if (isPro) {
    const watermark = document.querySelector('.antpool-watermark');
    if (watermark) watermark.remove();
}
```

### Feature Bloqueada
Para mostrar feature bloqueada visualmente:

```html
<div class="feature-locked">
    <div class="feature-content">
        <!-- Contenido bloqueado -->
    </div>
</div>
```

## 👨‍💼 Funciones de Admin

### Establecer Suscripción Manualmente
```javascript
// Desde consola del navegador
await window.SubscriptionManager.setUserSubscription(
    'userId123',
    window.SubscriptionManager.SUBSCRIPTION_TIERS.PRO,
    365  // días (opcional)
);
```

### Iniciar Trial
```javascript
// Trial de 14 días
await window.SubscriptionManager.startTrial('userId123', 14);
```

### Ver Estado de Suscripción
```javascript
const status = await window.SubscriptionManager.getSubscriptionStatus('userId123');
console.log(status);
// {
//   tier: 'pro',
//   tierDisplay: 'PRO',
//   status: 'active',
//   daysLeft: 350,
//   isActive: true,
//   isTrial: false
// }
```

## 🔍 Testing

### Probar Límite de Grupos (FREE)
```javascript
// Cambiar temporalmente LAUNCH_MODE = false
// Crear 4 grupos seguidos
for (let i = 0; i < 4; i++) {
    try {
        await window.modeManager.createSimpleGroup({
            name: `Test Group ${i}`,
            description: 'Testing group limits'
        });
        console.log(`✅ Group ${i} created`);
    } catch (error) {
        console.log(`❌ Group ${i} failed:`, error.message);
    }
}
// Esperado: 3 exitosos, 1 rechazado con modal de upgrade
```

### Probar Límite de Miembros
```javascript
// Simular agregar 11 miembros a un grupo
// (requiere crear usuarios de prueba o simular)
const result = await window.SubscriptionManager.canAddMember(userId, groupId);
console.log(result);
// Esperado después del 10mo miembro: { allowed: false, reason: '...' }
```

### Verificar Minigames
```javascript
const user = firebase.auth().currentUser;
const games = await window.SubscriptionManager.getAllowedMinigames(user.uid);
console.log('Allowed games:', games);

// Con LAUNCH_MODE=true: 7 juegos
// Con LAUNCH_MODE=false y FREE tier: 2 juegos
```

## 💳 Integración de Pagos

### ✅ Stripe Integrado y Funcional

El sistema de suscripción está **completamente conectado con Stripe**:

#### Frontend
- **Checkout**: Redirige a Stripe Checkout al hacer clic en "Upgrade to PRO"
- **Callback**: Maneja automáticamente el retorno desde Stripe (success/cancelled)
- **Customer Portal**: Usuarios PRO pueden gestionar su suscripción

#### Backend (Cloud Functions)
- **`stripeWebhook`**: Recibe eventos de Stripe y actualiza Firebase
  - `checkout.session.completed` → Activa suscripción PRO
  - `customer.subscription.updated` → Actualiza estado/expiración
  - `customer.subscription.deleted` → Revierte a FREE
  
- **`createStripeCheckoutSession`**: Crea sesión de pago
  - Plan: PRO Monthly $4.99/month
  - Price ID: `price_1SmMb0B6L1CVc8RDGEi8cqVQ`

- **`createStripePortalSession`**: Portal de gestión para usuarios PRO

#### Flujo Completo
1. Usuario hace clic en "Upgrade to PRO" (en modal o perfil)
2. Frontend llama a `createStripeCheckoutSession`
3. Redirige a Stripe Checkout
4. Usuario completa pago
5. Stripe envía webhook → Cloud Function actualiza Firebase
6. Usuario regresa con `?payment=success`
7. Frontend detecta éxito y recarga página
8. Sistema valida `tier: 'pro'` y activa features

#### Estado Actual
- ✅ Stripe configurado en Firebase Functions
- ✅ Webhook procesando eventos correctamente
- ✅ Modal de upgrade conectado a Stripe
- ✅ Callback handling implementado
- ✅ Customer Portal para gestión de suscripciones

### Configuración en Firebase

```bash
# Configurar Stripe keys (ya hecho)
firebase functions:config:set stripe.secret_key="sk_..."
firebase functions:config:set stripe.webhook_secret="whsec_..."
```

### Testing

```javascript
// Modo test (usa keys de Stripe test)
// Tarjeta de prueba: 4242 4242 4242 4242
// Fecha: Cualquier fecha futura
// CVC: Cualquier 3 dígitos
```

## 📚 Estructura de Firebase

```
users/
  {userId}/
    subscription/
      tier: "free" | "pro"
      status: "active" | "expired" | "trial"
      startedAt: timestamp
      expiresAt: timestamp (opcional)
      updatedAt: timestamp
```

## ✅ Checklist para Activación

Cuando estés listo para activar el sistema:

- [x] 1. Integración de pagos (Stripe ✅)
- [x] 2. Implementar `handleUpgrade()` con sistema de pago ✅
- [x] 3. Cloud Function para webhook de pagos ✅
- [x] 4. Configurar precios mensuales ✅ ($4.99/month)
- [ ] 5. Cambiar `LAUNCH_MODE = false`
- [ ] 6. Hacer deploy
- [ ] 7. Probar flujo completo: Free → Upgrade → PRO
- [ ] 8. Configurar emails de confirmación (opcional)
- [ ] 9. Crear página de pricing (opcional)
- [ ] 10. Actualizar FAQs

## 🎯 Próximas Implementaciones

Para completar el sistema, faltan estas integraciones:

### 1. Validaciones en Minigames
```javascript
// En challenge-games.js, antes de iniciar juego
const canPlay = await window.SubscriptionManager.canPlayMinigame(userId, gameId);
if (!canPlay.allowed) {
    window.SubscriptionManager.showUpgradeModal(
        window.SubscriptionManager.FEATURES.ALL_MINIGAMES
    );
    return;
}
```

### 2. Validaciones en Analytics
```javascript
// En loadAnalytics() o función similar
const canAccess = await window.SubscriptionManager.canAccessFeature(
    userId,
    window.SubscriptionManager.FEATURES.ANALYTICS
);
if (!canAccess.allowed) {
    // Mostrar versión limitada o modal de upgrade
    window.SubscriptionManager.showUpgradeModal(
        window.SubscriptionManager.FEATURES.ANALYTICS
    );
    return;
}
```

### 3. Validaciones en Gastos Recurrentes
```javascript
// En createRecurringExpense()
const canUse = await window.SubscriptionManager.canAccessFeature(
    userId,
    window.SubscriptionManager.FEATURES.RECURRING_EXPENSES
);
if (!canUse.allowed) {
    window.SubscriptionManager.showUpgradeModal(
        window.SubscriptionManager.FEATURES.RECURRING_EXPENSES
    );
    return;
}
```

### 4. Validaciones en Budget
```javascript
// En setBudget() o función similar
const canUse = await window.SubscriptionManager.canAccessFeature(
    userId,
    window.SubscriptionManager.FEATURES.BUDGET
);
if (!canUse.allowed) {
    window.SubscriptionManager.showUpgradeModal(
        window.SubscriptionManager.FEATURES.BUDGET
    );
    return;
}
```

### 5. Validaciones en Cofres Semanales
```javascript
// En mascot-system.js, al abrir cofre
const userIsPro = await window.SubscriptionManager.isPro(userId);
const maxChests = userIsPro ? 2 : 1;

// Verificar cuántos cofres ha abierto esta semana
// Si alcanzó el límite, mostrar upgrade modal
```

### 6. Exportación de Datos
```javascript
// En función de export
const canExport = await window.SubscriptionManager.canAccessFeature(
    userId,
    window.SubscriptionManager.FEATURES.EXPORT_DATA
);
if (!canExport.allowed) {
    window.SubscriptionManager.showUpgradeModal(
        window.SubscriptionManager.FEATURES.EXPORT_DATA
    );
    return;
}
```

## 💡 Consejos

1. **Durante Desarrollo**: Mantén `LAUNCH_MODE = true`
2. **Testing**: Usa funciones de admin para simular suscripciones
3. **Feedback**: El modal de upgrade muestra claramente los beneficios PRO
4. **UX**: Los badges PRO son sutiles pero informativos
5. **Performance**: Las validaciones son asíncronas pero rápidas (Firebase cache)

## 🐛 Troubleshooting

### "SubscriptionManager is not defined"
Verificar que `subscription-manager.js` esté cargado antes que otros scripts en `app.html`.

### Modal no aparece
```javascript
// Verificar en consola
console.log(window.SubscriptionManager);
// Debe mostrar objeto con todas las funciones
```

### Validaciones no funcionan
```javascript
// Verificar LAUNCH_MODE
console.log(window.SubscriptionManager.LAUNCH_MODE);
// Si es true, todas las validaciones retornan {allowed: true}
```

---

**Creado**: Enero 2026  
**Estado**: ✅ Funcional (LAUNCH_MODE activo)  
**Próximo paso**: Integración de pagos
