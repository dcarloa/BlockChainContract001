# 🛡️ Guía Rápida de Implementación de Seguridad

## ✅ Implementado

### 1. Rate Limiting System
**Archivo:** `frontend/rate-limiter.js`

**Límites configurados:**
- ✅ Crear grupos: 5 por hora
- ✅ Agregar gastos: 20 por minuto  
- ✅ Registrar pagos: 10 por minuto
- ✅ Invitar miembros: 10 por hora
- ✅ Gastos recurrentes: 3 por hora
- ✅ Actualizar grupo: 20 por hora

### 2. Input Validation & Sanitization
**Archivo:** `frontend/sanitizer.js`

**Funcionalidades:**
- ✅ Sanitizar HTML (DOMPurify)
- ✅ Sanitizar texto plano
- ✅ Validar URLs
- ✅ Validar emails
- ✅ Validar números

**Validadores:**
- ✅ `validateGroupInfo()` - Grupos
- ✅ `validateExpenseInfo()` - Gastos
- ✅ `validateSettlementInfo()` - Pagos
- ✅ `validateEmail()` - Emails
- ✅ `validateNickname()` - Nombres

### 3. Firebase Security Rules
**Archivo:** `database.rules.json`

**Validaciones agregadas:**
- ✅ Nombres de grupo: max 100 caracteres
- ✅ Descripciones: max 500 caracteres
- ✅ Montos: 0-10,000,000
- ✅ Códigos de moneda: formato ISO (USD, EUR)
- ✅ Miembros por grupo: max 50
- ✅ Gastos por grupo: max 1,000
- ✅ Pagos por grupo: max 500
- ✅ Gastos recurrentes: max 50
- ✅ Grupos por usuario: max 50

### 4. Code Integration
**Archivos modificados:**
- ✅ `frontend/mode-manager.js`
  - `createSimpleGroup()` - Rate limiting + validación
  - `addSimpleExpense()` - Rate limiting + validación
  - `recordSettlement()` - Rate limiting + validación

---

## 📋 Pasos para Activar

### Paso 1: Agregar Scripts a HTML

**Agrega en `frontend/app.html` ANTES de `app-platform.js`:**

```html
<!-- DOMPurify para sanitización XSS -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>

<!-- Security utilities -->
<script src="rate-limiter.js"></script>
<script src="sanitizer.js"></script>
```

**Orden correcto de scripts:**
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-database-compat.js"></script>

<!-- App Scripts -->
<script src="firebase-credentials.js"></script>
<script src="firebase-config.js"></script>

<!-- ✅ NUEVO: Security -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
<script src="rate-limiter.js"></script>
<script src="sanitizer.js"></script>

<!-- Application -->
<script src="mode-manager.js"></script>
<script src="form-wizard.js"></script>
<script src="app-platform.js"></script>
```

### Paso 2: Agregar a index.html (Landing Page)

**Agrega en `frontend/index.html`:**

```html
<!-- Antes de cerrar </body> -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
<script src="rate-limiter.js"></script>
<script src="sanitizer.js"></script>
```

### Paso 3: Desplegar Database Rules

```powershell
# Desplegar solo las reglas de seguridad
firebase deploy --only database

# Verificar deployment
# Ir a: Firebase Console → Realtime Database → Rules
# Debe mostrar las nuevas validaciones
```

### Paso 4: Desplegar Hosting

```powershell
# Desplegar archivos actualizados
firebase deploy --only hosting

# O desplegar todo
firebase deploy
```

---

## 🧪 Testing de Seguridad

### Test 1: Rate Limiting (Crear Grupos)

```javascript
// Abrir consola del navegador (F12)

// Intentar crear 6 grupos seguidos (límite es 5/hora)
for (let i = 0; i < 6; i++) {
    try {
        await modeManager.createSimpleGroup({
            name: `Test Group ${i}`,
            description: 'Testing rate limits',
            targetAmount: 1000,
            currency: 'USD'
        });
        console.log(`✅ Grupo ${i} creado`);
    } catch (error) {
        console.error(`❌ Grupo ${i} falló:`, error.message);
    }
}

// Resultado esperado:
// ✅ Grupo 0 creado
// ✅ Grupo 1 creado
// ✅ Grupo 2 creado
// ✅ Grupo 3 creado
// ✅ Grupo 4 creado
// ❌ Grupo 5 falló: ⏱️ Límite de operaciones excedido. Por favor espera 59 minutos y 30 segundos
```

### Test 2: XSS Protection

```javascript
// Intentar crear grupo con nombre malicioso
try {
    await modeManager.createSimpleGroup({
        name: '<script>alert("XSS")</script>',
        description: '<img src=x onerror="alert(1)">',
        targetAmount: 1000
    });
} catch (error) {
    console.error('Error:', error.message);
}

// Verificar en Firebase Console que el nombre guardado sea:
// "&lt;script&gt;alert(\"XSS\")&lt;/script&gt;"
// (escapado, no ejecutable)
```

### Test 3: Input Validation

```javascript
// Test 3a: Nombre muy largo
try {
    await modeManager.createSimpleGroup({
        name: 'A'.repeat(200), // 200 caracteres
        description: 'Test',
        targetAmount: 1000
    });
} catch (error) {
    console.error('✅ Validación funcionó:', error.message);
    // Esperado: "Nombre muy largo (máximo 100 caracteres)"
}

// Test 3b: Monto negativo
try {
    await modeManager.addSimpleExpense({
        description: 'Test expense',
        amount: -100
    });
} catch (error) {
    console.error('✅ Validación funcionó:', error.message);
    // Esperado: "El monto debe ser mayor a cero"
}

// Test 3c: Monto excesivo
try {
    await modeManager.addSimpleExpense({
        description: 'Test expense',
        amount: 999999999999
    });
} catch (error) {
    console.error('✅ Validación funcionó:', error.message);
    // Esperado: "El monto es demasiado alto (máximo 1,000,000)"
}
```

### Test 4: Firebase Rules

```javascript
// Intentar crear gasto directamente en Firebase sin validación
const expenseData = {
    description: 'A'.repeat(1000), // Muy largo - debe fallar
    amount: -50, // Negativo - debe fallar
    timestamp: Date.now()
};

try {
    await window.FirebaseConfig.writeDb(
        `groups/test-group-id/expenses/test-expense`,
        expenseData
    );
} catch (error) {
    console.error('✅ Firebase rechazó:', error.message);
    // Esperado: "PERMISSION_DENIED" o validación fallida
}
```

---

## 📊 Verificar en Firebase Console

### 1. Database Rules Activas

1. Ir a: https://console.firebase.google.com
2. Seleccionar proyecto: `blockchaincontract001`
3. Realtime Database → Rules
4. Verificar que las reglas estén actualizadas

### 2. Monitorear Uso

1. Firebase Console → Usage and billing
2. Verificar:
   - Operaciones de lectura/escritura
   - Storage usado
   - Bandwidth
3. Configurar alertas de presupuesto

### 3. Ver Logs de Operaciones

1. Firebase Console → Realtime Database
2. Ver estructura de datos
3. Verificar que los datos cumplan validaciones

---

## ⚠️ Problemas Comunes

### Error: "RateLimiter is not defined"

**Causa:** Scripts de seguridad no cargados  
**Solución:** Verificar que `rate-limiter.js` esté incluido en HTML ANTES de `mode-manager.js`

### Error: "Validators is not defined"

**Causa:** `sanitizer.js` no cargado  
**Solución:** Incluir `sanitizer.js` en HTML

### Error: "DOMPurify is not defined"

**Causa:** CDN de DOMPurify no cargado  
**Solución:** Agregar script de DOMPurify ANTES de `sanitizer.js`

### Rate limiting no funciona

**Causa:** localStorage bloqueado  
**Solución:** Verificar que el navegador permita localStorage

### Firebase Rules rechazan operaciones válidas

**Causa:** Rules muy restrictivas o datos malformados  
**Solución:** Revisar Firebase Console → Database → Rules → Simulator

---

## 🔧 Configuración Opcional

### Ajustar Límites de Rate Limiting

**Editar:** `frontend/rate-limiter.js`

```javascript
const RATE_LIMITS = {
    createGroup: { 
        maxAttempts: 10,  // Cambiar de 5 a 10
        windowMs: 3600000 // 1 hora
    },
    // ... otros límites
};
```

### Limpiar Rate Limits (Solo Testing)

```javascript
// En consola del navegador:
window.RateLimiter.reset(); // Resetear todos
window.RateLimiter.reset('createGroup'); // Resetear solo grupos
```

### Ver Límites Restantes

```javascript
// Ver cuántos intentos quedan
const info = window.getRateLimitInfo('createGroup');
console.log(`Quedan ${info.remaining} de ${info.total}`);
console.log(`Se resetea en ${info.resetIn} segundos`);
```

---

## 📈 Próximos Pasos (Opcional)

### Fase 2: Firebase Cloud Functions

Implementar validación server-side:

```javascript
// functions/index.js
exports.validateGroupCreation = functions.database
    .ref('/groups/{groupId}')
    .onCreate(async (snapshot, context) => {
        const group = snapshot.val();
        
        // Contar grupos del usuario
        const userGroupsRef = admin.database()
            .ref(`users/${group.createdBy}/groups`);
        const count = (await userGroupsRef.once('value')).numChildren();
        
        // Si excede límite, eliminar
        if (count > 50) {
            await snapshot.ref.remove();
            console.log(`Grupo eliminado: límite excedido`);
        }
    });
```

### Fase 3: Monitoreo Avanzado

- Firebase Performance Monitoring
- Google Analytics para rastrear abuso
- Alertas automáticas de uso anormal

---

## ✅ Checklist Final

**Antes de producción:**
- [ ] DOMPurify incluido en todos los HTMLs
- [ ] rate-limiter.js cargado
- [ ] sanitizer.js cargado
- [ ] database.rules.json desplegadas
- [ ] Testing de rate limiting completado
- [ ] Testing de XSS completado
- [ ] Testing de validación completado
- [ ] Firebase budget alerts configuradas
- [ ] Documentación de seguridad compartida

**Verificaciones post-deployment:**
- [ ] Scripts de seguridad cargando correctamente
- [ ] Rate limiting funcionando en producción
- [ ] Validaciones de Firebase activas
- [ ] Sin errores en consola del navegador
- [ ] Grupos creados tienen datos sanitizados

---

## 📞 Soporte

Si encuentras problemas:
1. Verificar consola del navegador (F12)
2. Revisar Firebase Console → Database → Rules
3. Comprobar que todos los scripts estén cargados
4. Limpiar caché del navegador

**Estado:** ✅ LISTO PARA IMPLEMENTAR  
**Tiempo estimado:** 15-30 minutos  
**Complejidad:** Baja (solo agregar scripts y desplegar)
