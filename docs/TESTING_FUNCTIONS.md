# 🧪 Funciones de Testing - Sistema de Retención

Esta guía describe todas las funciones de testing disponibles para probar el sistema de Colonia Viva y Mascota sin esperar una semana.

## 📦 Funciones de Cofres (Colony System)

### 1. Crear Cofre de Prueba (Semana Actual)

```javascript
// Crear cofre con estado "active" (default)
// Ver el groupId: console.log('Current Fund:', currentFund)
ColonySystem.createTestChest('groupId')
//await MascotSystem.loadMascotTab(currentFund.fundAddress)

// Crear cofre con estado específico
ColonySystem.createTestChest('groupId', 'forming')    // 🌱
ColonySystem.createTestChest('groupId', 'active')     // 🐜
ColonySystem.createTestChest('groupId', 'stable')     // 💎
ColonySystem.createTestChest('groupId', 'consolidated') // 👑

// Crear cofre con opciones personalizadas
ColonySystem.createTestChest('groupId', 'stable', {
    expenses: 10,      // Número de gastos
    members: 5,        // Miembros activos
    weekOffset: -1     // -1 = semana pasada, 0 = actual, 1 = próxima
})
```

**Resultado:**
```
✅ Test chest created for -NqXz...
   State: stable
   Week ID: 2026-W03
   Expenses: 10, Members: 5
💡 Reload the page to see the banner!
```

### 2. Crear Historial de Cofres (Múltiples Semanas)

```javascript
// Crear cofres de las últimas 3 semanas (progresión automática de estados)
ColonySystem.createTestChestHistory('groupId', 3)

// Crear cofres de las últimas 5 semanas
ColonySystem.createTestChestHistory('groupId', 5)

// Resultado automático:
// Semana -4: forming
// Semana -3: active
// Semana -2: stable
// Semana -1: consolidated
// Semana actual: consolidated
```

**Resultado:**
```
🎁 Creating 5 test chests for group: -NqXz...
✅ Test chest created for -NqXz...
   State: forming
   Week ID: 2025-W52
...
✅ Created 5 test chests
💡 Reload the page to see the latest banner!
```

### 3. Crear Cofre Rápido y Auto-Verificar

```javascript
// Crea cofre Y automáticamente verifica si aparece el banner
ColonySystem.quickTestChest('groupId')
ColonySystem.quickTestChest('groupId', 'stable')
```

**Resultado:**
```
🚀 Quick Test: Creating chest for current week...
✅ Test chest created for -NqXz...
🔍 Checking for banner...
[Colony] Chest found, showing banner...
```

### 4. Eliminar Cofre de Prueba

```javascript
// Eliminar cofre de la semana actual
ColonySystem.deleteTestChest('groupId')

// Eliminar cofre de semana específica
ColonySystem.deleteTestChest('groupId', '2026-W02')
```

### 5. Trigger Manual de Evaluación Semanal

```javascript
// Ejecutar Cloud Function manualmente (evalúa TODOS los grupos)
ColonySystem.triggerWeeklyEvaluation()

// Forzar recreación de cofres existentes
ColonySystem.triggerWeeklyEvaluation(true)
```

**Nota:** Requiere autenticación y ejecuta la Cloud Function real.

## 🐜 Funciones de Mascota (Mascot System)

### 1. Agregar Prenda Aleatoria

```javascript
// Agregar prenda aleatoria según estado de colonia
MascotSystem.testAddRandomItem('groupId', 'active')

// Estados disponibles:
MascotSystem.testAddRandomItem('groupId', 'forming')      // Solo prendas comunes
MascotSystem.testAddRandomItem('groupId', 'active')       // 70% común, 30% rara
MascotSystem.testAddRandomItem('groupId', 'stable')       // 40% común, 60% rara
MascotSystem.testAddRandomItem('groupId', 'consolidated') // Todas disponibles
```

**Resultado:**
```
🎁 Test item added:
   Item: 🎩 Sombrero Explorador
   New: Yes
   Upgraded: No
   Copies: 1/6
   Level: basic ⭐
```

### 2. Agregar Prenda Específica

```javascript
// Agregar prenda por ID (ver catálogo completo abajo)
MascotSystem.addItemToWardrobe('groupId', 'crown_gold')
MascotSystem.addItemToWardrobe('groupId', 'backpack')
MascotSystem.addItemToWardrobe('groupId', 'wings')
```

### 3. Desbloquear Todas las Prendas

```javascript
// Desbloquear todas (12 prendas) en nivel básico
MascotSystem.testUnlockAllItems('groupId', 'basic')

// Desbloquear todas en nivel plata (3 copias cada una)
MascotSystem.testUnlockAllItems('groupId', 'silver')

// Desbloquear todas en nivel oro (6 copias cada una)
MascotSystem.testUnlockAllItems('groupId', 'gold')
```

**Resultado:**
```
🔓 Unlocking all items at gold level...
✅ All 12 items unlocked at gold level
```

### 4. Simular Apertura de Cofre Completo

```javascript
// Simula abrir un cofre: crea cofre + agrega prenda + muestra
MascotSystem.quickTestChest('groupId')
```

**Resultado:**
```
🚀 Quick Test: Opening chest with random item...
🎁 Test item added:
   Item: 👑 Corona Dorada
   New: Yes
   ...
💡 Visit the Mascot tab to see your new item!
```

### 5. Equipar Prenda

```javascript
// Equipar prenda específica
MascotSystem.equipItem('groupId', 'crown_gold')
MascotSystem.equipItem('groupId', 'backpack')
```

## 📋 Catálogo Completo de Prendas

### Cabeza (6 prendas)

| ID | Emoji | Nombre | Rareza |
|----|-------|--------|--------|
| `hat_explorer` | 🎩 | Sombrero Explorador | Común |
| `cap_casual` | 🧢 | Gorra Casual | Común |
| `cap_graduate` | 🎓 | Gorro Graduado | Común |
| `crown_gold` | 👑 | Corona Dorada | Rara |
| `helmet_adventure` | ⛑️ | Casco Aventurero | Rara |
| `crown_flower` | 🌺 | Corona Floral | Rara |

### Accesorios (6 prendas)

| ID | Emoji | Nombre | Rareza |
|----|-------|--------|--------|
| `backpack` | 🎒 | Mochila Viajera | Común |
| `pickaxe` | ⛏️ | Pico Minero | Común |
| `tablet` | 📱 | Tablet | Común |
| `wings` | 🪽 | Alas Brillantes | Rara |
| `guitar` | 🎸 | Guitarra | Rara |
| `star_magic` | 🌟 | Estrella Mágica | Rara |

## 🔄 Flujos de Testing Completos

### Flujo 1: Probar Cofre Semanal Completo

```javascript
// 1. Crear cofre de prueba
await ColonySystem.quickTestChest('groupId', 'stable')

// 2. Refrescar página para ver banner
location.reload()

// 3. Hacer clic en "Abrir Cofre" en el banner
// 4. Ver prenda obtenida en modal
// 5. Ir a pestaña "Mascota"
// 6. Equipar prenda
```

### Flujo 2: Simular Progresión de 4 Semanas

```javascript
// Crear historial de cofres (últimas 4 semanas)
await ColonySystem.createTestChestHistory('groupId', 4)

// Agregar prendas para cada semana simulada
await MascotSystem.testAddRandomItem('groupId', 'forming')
await MascotSystem.testAddRandomItem('groupId', 'active')
await MascotSystem.testAddRandomItem('groupId', 'stable')
await MascotSystem.testAddRandomItem('groupId', 'stable')

// Recargar para ver estado final
location.reload()
```

### Flujo 3: Completar Colección Rápidamente

```javascript
// Opción A: Desbloquear todo en oro directamente
await MascotSystem.testUnlockAllItems('groupId', 'gold')

// Opción B: Simulación más realista (básico → plata → oro)
// Primeras 12 prendas (básico)
for (let i = 0; i < 12; i++) {
    await MascotSystem.testAddRandomItem('groupId', 'active')
}

// +24 prendas aleatorias (algunas subirán a plata)
for (let i = 0; i < 24; i++) {
    await MascotSystem.testAddRandomItem('groupId', 'stable')
}

// Recargar y verificar
location.reload()
```

### Flujo 4: Probar Mejora de Nivel

```javascript
// Agregar misma prenda 6 veces para verla mejorar
const itemId = 'crown_gold'

// 1ª vez: Básico ⭐
await MascotSystem.addItemToWardrobe('groupId', itemId)

// 2ª vez: Básico ⭐ (2/6)
await MascotSystem.addItemToWardrobe('groupId', itemId)

// 3ª vez: ¡MEJORA A PLATA! ⭐⭐
await MascotSystem.addItemToWardrobe('groupId', itemId)

// 4ª-5ª vez: Plata ⭐⭐
await MascotSystem.addItemToWardrobe('groupId', itemId)
await MascotSystem.addItemToWardrobe('groupId', itemId)

// 6ª vez: ¡MEJORA A ORO! ⭐⭐⭐
await MascotSystem.addItemToWardrobe('groupId', itemId)

// Recargar para ver cambios
await MascotSystem.loadMascotTab('groupId')
```

## 🔍 Funciones de Inspección

### Ver Datos de Colonia

```javascript
// Ver estado actual de la colonia
const colony = await ColonySystem.getColonyData('groupId')
console.log('Colony State:', colony.state)
console.log('Total Activity:', colony.totalActivity)
console.log('Consecutive Weeks:', colony.consecutiveActiveWeeks)
```

### Ver Datos de Mascota

```javascript
// Ver mascota y guardarropa
const mascot = await MascotSystem.getMascotData('groupId')
console.log('Equipped:', mascot.equipped)
console.log('Wardrobe:', mascot.wardrobe)

// Contar prendas desbloqueadas
const unlockedCount = Object.keys(mascot.wardrobe).length
console.log(`Unlocked: ${unlockedCount}/12`)
```

### Ver Cofre Actual

```javascript
// Ver cofre de la semana actual
const weekId = ColonySystem.getCurrentWeekId()
const chest = await ColonySystem.getWeeklyChest('groupId', weekId)
console.log('Current Chest:', chest)
```

### Ver Semana Actual

```javascript
// Ver ID de semana actual
const currentWeek = ColonySystem.getCurrentWeekId()
console.log('Current Week:', currentWeek) // "2026-W03"

// Ver semana pasada
const lastWeek = ColonySystem.getCurrentWeekId(-1)
console.log('Last Week:', lastWeek) // "2026-W02"

// Ver dentro de 2 semanas
const futureWeek = ColonySystem.getCurrentWeekId(2)
console.log('Future Week:', futureWeek) // "2026-W05"
```

## 🗑️ Funciones de Limpieza

### Limpiar Datos de Prueba

```javascript
// Eliminar cofre de prueba actual
await ColonySystem.deleteTestChest('groupId')

// Eliminar múltiples cofres (últimas 5 semanas)
for (let i = 0; i <= 4; i++) {
    const weekId = ColonySystem.getCurrentWeekId(-i)
    await ColonySystem.deleteTestChest('groupId', weekId)
}

// Resetear mascota (requiere acceso directo a Firebase)
await firebase.database().ref(`groups/${groupId}/mascot`).remove()
console.log('✅ Mascot data cleared')
```

## ⚠️ Notas Importantes

1. **Recargar después de crear cofres**: Los cofres se crean en Firebase, pero el banner solo aparece después de refrescar la página o llamar a `checkWeeklyChest()`.

2. **Group ID**: Obtén el groupId desde la URL o desde:
   ```javascript
   const groupId = currentFund?.fundAddress || currentFund?.groupId
   ```

3. **Autenticación requerida**: Todas estas funciones requieren que estés autenticado en Firebase.

4. **No afecta producción**: Estas funciones solo modifican datos del grupo actual. No afectan a otros usuarios ni grupos.

5. **Cloud Functions**: `triggerWeeklyEvaluation()` ejecuta la Cloud Function real que afecta TODOS los grupos. Úsala con cuidado.

## 📚 Combinaciones Útiles

### Escenario: Demo Completo para Cliente

```javascript
const groupId = 'YOUR_GROUP_ID'

// 1. Crear historial de progresión
await ColonySystem.createTestChestHistory(groupId, 4)

// 2. Agregar variedad de prendas
await MascotSystem.testUnlockAllItems(groupId, 'basic')

// 3. Mejorar algunas a plata
await MascotSystem.addItemToWardrobe(groupId, 'crown_gold')
await MascotSystem.addItemToWardrobe(groupId, 'crown_gold')
await MascotSystem.addItemToWardrobe(groupId, 'wings')
await MascotSystem.addItemToWardrobe(groupId, 'wings')

// 4. Equipar las mejores
await MascotSystem.equipItem(groupId, 'crown_gold')
await MascotSystem.equipItem(groupId, 'wings')

// 5. Recargar para ver todo
location.reload()
```

### Escenario: Testing de Mejoras de Nivel

```javascript
const groupId = 'YOUR_GROUP_ID'

// Probar mejora básico → plata → oro
async function testItemUpgrade(itemId) {
    console.log(`Testing upgrade for ${itemId}`)
    
    for (let i = 1; i <= 6; i++) {
        const result = await MascotSystem.addItemToWardrobe(groupId, itemId)
        console.log(`Copy ${i}: ${result.newLevel} ${MascotSystem.ITEM_LEVELS[result.newLevel].stars}`)
        
        if (result.upgraded) {
            console.log(`🎉 UPGRADED to ${result.newLevel}!`)
        }
    }
}

await testItemUpgrade('crown_gold')
```

---

**Última Actualización**: Enero 2026  
**Versión**: 1.0
