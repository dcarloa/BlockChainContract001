# 🐜 Ant Pool - Sistema de Miembros Involucrados (Involved Members)

## 📋 Resumen del Problema

Has encontrado un error común: **"No estas involucrado en esta propuesta"**

Esto sucede cuando intentas votar en una propuesta donde NO fuiste seleccionado como miembro involucrado durante la creación.

---

## 🔍 ¿Cómo Funciona el Sistema de Voting?

### Regla Principal
**Solo los miembros seleccionados en "Involved Members" pueden votar en una propuesta.**

### Dos Modos de Votación

#### 1️⃣ **Modo Normal** (Solo Involucrados)
- Cuando creas una propuesta, seleccionas qué miembros están involucrados
- **SOLO esos miembros pueden votar**
- Ejemplo: Hotel para 3 personas → Solo esas 3 votan

#### 2️⃣ **Modo Consentimiento Completo** (Borrowed Funds)
- Se activa automáticamente cuando el gasto excede las contribuciones de los involucrados
- **TODOS los miembros del fondo deben votar**
- Ejemplo: Gasto de $100 pero involucrados solo aportaron $60 → Se "piden prestados" $40 → Todos votan

---

## ✅ Solución: Cómo Votar en tus Propias Propuestas

### Paso 1: Al Crear la Propuesta
Cuando llenes el formulario "Proponer Uso de Fondos":

1. ✅ **Verifica que TU checkbox esté marcado**
2. ⚠️ **NO desmarques tu propio checkbox**
3. 👥 Marca los otros miembros que participan en el gasto

### Paso 2: Verifica Antes de Crear
Antes de hacer click en "📝 Proponer Uso de Fondos":

- [ ] ¿Está mi checkbox marcado?
- [ ] ¿Están marcados todos los involucrados?
- [ ] ¿El monto es correcto?

### Paso 3: Ahora Podrás Votar
Si seguiste los pasos, verás:
- ✅ Botones "Votar a Favor" y "Votar en Contra" habilitados
- 👥 Badge que dice "Only involved members can vote"

---

## 🛠️ Mejoras Implementadas

### 1. **Warning Box Prominente**
Al crear propuestas verás una caja amarilla que dice:

```
⚠️ IMPORTANTE:
• Only selected members can vote!
• Make sure to check YOUR OWN checkbox if you want to vote
• If you uncheck yourself, you won't be able to vote on your own proposal
```

### 2. **Badge Visual en Propuestas**
Cada propuesta ahora muestra:
```
👥 Only involved members can vote on this proposal
```

### 3. **Mensaje de Error Mejorado**
Si intentas votar sin estar involucrado:

```
⚠️ You cannot vote on this proposal!

Reason: You were not selected as an 'involved member' when this proposal was created.

Only members checked in the 'Involved Members' section during proposal creation can vote.

Tip: When creating proposals, make sure to check YOUR OWN checkbox if you want to vote!
```

---

## 💡 Casos de Uso Comunes

### Caso 1: Solo Yo (Individual)
**Escenario:** Compré algo para el fondo con mi dinero personal

**Solución:**
- ✅ Marcar solo MI checkbox
- ✅ Yo soy el único que vota
- ✅ Si se aprueba, me reembolsan del fondo común

### Caso 2: Gasto Grupal (Algunos)
**Escenario:** Hotel para 3 de 5 miembros

**Solución:**
- ✅ Marcar checkboxes de los 3 que van
- ✅ Solo esos 3 votan (60% de 3 = 2 votos necesarios)
- ⚠️ Los otros 2 NO pueden votar

### Caso 3: Gasto de Todos (Full Group)
**Escenario:** Cena grupal donde todos participan

**Solución:**
- ✅ Click en "Seleccionar Todos"
- ✅ Todos pueden votar
- ✅ Se necesita 60% del total

### Caso 4: Borrowed Funds (Automático)
**Escenario:** Gasto de $100, pero involucrados solo aportaron $60

**Sistema automáticamente:**
- 🔴 Activa modo "Requires Full Consent"
- 🔴 TODOS deben votar (no solo involucrados)
- 🔴 Muestra alerta de "Borrowed Funds"
- 🔴 Indica cuánto se pide prestado

---

## 🔧 Troubleshooting

### ❌ "No estas involucrado en esta propuesta"

**Causa:** No marcaste tu checkbox al crear la propuesta

**Solución:**
1. No puedes votar en esta propuesta (ya está creada)
2. Para la siguiente: ✅ Marca tu checkbox ANTES de crear
3. O pide al creador que cancele y cree una nueva incluyéndote

### ❌ "Ya votaste en esta propuesta"

**Causa:** Ya emitiste tu voto anteriormente

**Solución:**
- No se puede cambiar el voto
- El sistema registró tu voto permanentemente
- Espera a que se ejecute o expire

### ❌ Propuesta no se ejecuta

**Posibles Causas:**
1. No alcanzó 60% de votos a favor
2. Requiere más votos (verifica el contador)
3. La propuesta expiró (30 días)

**Solución:**
- Revisa el porcentaje de aprobación
- Pide a más involucrados que voten
- Si expiró, crea una nueva propuesta

---

## 📊 Lógica del Smart Contract

```solidity
function vote(uint256 _proposalId, bool _inFavor) external {
    Proposal storage proposal = proposals[_proposalId];
    
    // Si requiere consentimiento completo, cualquier contribuidor puede votar
    // Si no, solo los involucrados pueden votar
    if (!proposal.requiresFullConsent) {
        require(
            proposal.isInvolved[msg.sender], 
            "No estas involucrado en esta propuesta"
        );
    }
    
    // ... resto del voto
}
```

**Traducción:**
- Si `requiresFullConsent = false` → Solo involucrados votan
- Si `requiresFullConsent = true` → Todos votan
- El sistema decide automáticamente basado en borrowed funds

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)
- ✅ Siempre incluirte si quieres votar
- ✅ Marcar solo a los realmente involucrados
- ✅ Usar "Seleccionar Todos" para gastos grupales
- ✅ Revisar la lista antes de crear
- ✅ Leer el warning box amarillo

### ❌ DON'T (No Hacer)
- ❌ Desmarcarte a ti mismo sin darte cuenta
- ❌ Marcar a todos si no están involucrados
- ❌ Ignorar el warning amarillo
- ❌ Asumir que siempre puedes votar

---

## 🐜 Filosofía del Sistema

**¿Por qué solo involucrados pueden votar?**

En una colonia de hormigas, las hormigas que trabajan en una tarea específica toman las decisiones sobre esa tarea:

- 🐜 Hormigas constructoras deciden sobre construcción
- 🐜 Hormigas recolectoras deciden sobre comida
- 🐜 Hormigas soldado deciden sobre defensa

**En Ant Pool:**
- 👥 Miembros de un gasto deciden sobre ese gasto
- 🗳️ Democracia enfocada, no dictadura de mayoría
- ⚖️ Justicia: solo quienes pagan, deciden

**Excepción: Borrowed Funds**
Si un gasto requiere dinero de miembros no involucrados, **todos** deben dar consentimiento. Porque están "prestando" su parte del fondo común.

---

## 📞 Resumen Rápido

1. **Crear propuesta** → Marca TU checkbox ✅
2. **Marca involucrados** → Solo ellos votan 👥
3. **Propuesta creada** → Badge muestra reglas 📋
4. **Intentas votar** → Sistema valida si estás involucrado 🔍
5. **Error si no estás** → Mensaje claro explica por qué ⚠️

**La regla de oro:** Si quieres votar, ¡marca tu checkbox! 🐜

---

¿Preguntas? Revisa el warning amarillo en el formulario o el mensaje de error detallado.
