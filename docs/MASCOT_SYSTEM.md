# 🐜 Sistema de Mascota - Ant Pool

## Descripción General

El Sistema de Mascota es una funcionalidad complementaria diseñada para **aumentar la retención de usuarios** sin interferir con la funcionalidad principal de división de gastos de Ant Pool. Está integrado con el sistema de Colonia Viva para recompensar la actividad semanal.

## Filosofía de Diseño

- **Complementario, no central**: La mascota es un extra divertido, no el enfoque principal
- **No invasivo**: No interrumpe el flujo de división de gastos
- **Recompensa la actividad**: Motiva a los usuarios a mantener sus grupos activos
- **Simple y escalable**: Sistema fácil de entender con 12 prendas totales

## Estructura del Sistema

### 1. Catálogo de Prendas (Wardrobe)

**Total: 12 prendas**
- 6 prendas de cabeza (head)
- 6 accesorios (accessory)

#### Categoría: Cabeza 🎩

| ID | Emoji | Nombre | Rareza |
|----|-------|--------|--------|
| `hat_explorer` | 🎩 | Sombrero Explorador | Común |
| `crown_gold` | 👑 | Corona Dorada | Rara |
| `cap_casual` | 🧢 | Gorra Casual | Común |
| `cap_graduate` | 🎓 | Gorro Graduado | Común |
| `helmet_adventure` | ⛑️ | Casco Aventurero | Rara |
| `crown_flower` | 🌺 | Corona Floral | Rara |

#### Categoría: Accesorios 🎒

| ID | Emoji | Nombre | Rareza |
|----|-------|--------|--------|
| `backpack` | 🎒 | Mochila Viajera | Común |
| `wings` | 🪽 | Alas Brillantes | Rara |
| `pickaxe` | ⛏️ | Pico Minero | Común |
| `guitar` | 🎸 | Guitarra | Rara |
| `tablet` | 📱 | Tablet | Común |
| `star_magic` | 🌟 | Estrella Mágica | Rara |

### 2. Sistema de Niveles

Cada prenda puede mejorar de nivel al obtener copias duplicadas:

| Nivel | Estrellas | Copias Requeridas | Color |
|-------|-----------|-------------------|--------|
| Básico | ⭐ | 1 | Gris (#9ca3af) |
| Plata | ⭐⭐ | 3 | Plata (#c0c0c0) |
| Oro | ⭐⭐⭐ | 6 | Oro (#ffd700) |

**Mecánica:**
- Primera vez que obtienes una prenda → Nivel Básico ⭐
- Al obtener la 3ª copia → Mejora a Nivel Plata ⭐⭐
- Al obtener la 6ª copia → Mejora a Nivel Oro ⭐⭐⭐

### 3. Sistema de Equipamiento

- **2 slots disponibles**: Cabeza + Accesorio
- Solo puedes equipar prendas que hayas desbloqueado
- Las prendas equipadas se muestran en:
  - Header del grupo (mini preview junto a la colonia)
  - Pestaña "Mascota" (preview grande)

## Integración con Cofres Semanales

### Probabilidad de Recompensas según Estado de Colonia

El sistema ajusta las probabilidades de obtener prendas raras según el estado de la colonia:

| Estado Colonia | Prendas Comunes | Prendas Raras |
|----------------|-----------------|---------------|
| **Formando** (🌱) | 100% | 0% |
| **Activa** (🐜) | 70% | 30% |
| **Estable** (💎) | 40% | 60% |
| **Consolidada** (👑) | 50% | 50% (todas disponibles) |

### Flujo de Recompensa

1. **Usuario abre cofre semanal**
2. Sistema determina prenda aleatoria según estado de colonia
3. Prenda se agrega al guardarropa
4. Si es nueva → Badge "¡NUEVO!"
5. Si mejora de nivel → Badge "¡Subió a Plata/Oro!"
6. Se muestra en modal del cofre
7. Usuario puede equiparla desde pestaña "Mascota"

## Estructura de Datos Firebase

```
groups/
  {groupId}/
    mascot/
      equipped/
        head: "hat_explorer"      // ID de prenda equipada (null si vacío)
        accessory: "backpack"     // ID de prenda equipada (null si vacío)
      wardrobe/
        {itemId}/                 // Ej: "crown_gold"
          copies: 4               // Número de copias obtenidas
          level: "silver"         // basic | silver | gold
          lastObtained: 1705622400000  // Timestamp última obtención
```

## Ubicación en UI

### 1. Header del Grupo
```
🌴 Grupo Viaje Europa  ✏️  🎩🐜🎒  🐜 Activa
                            ↑
                     Mini preview mascota
```

### 2. Pestaña "Mascota" (Nueva)
Ubicada entre "Members" y "Manage" en `//*[@id="fundDetailSection"]/div[5]`

**Contenido:**
- Preview grande de la mascota con prendas equipadas
- Sección "Equipado" mostrando slots actuales
- Colección completa (12 prendas)
  - Desbloqueadas: Muestra emoji, nivel, copias
  - Bloqueadas: Muestra ❓
- Información sobre cómo obtener más prendas

### 3. Modal de Cofre Semanal
Sección adicional mostrando:
- Emoji grande de la prenda obtenida
- Nombre de la prenda
- Badge si es nueva o mejoró
- Contador de copias (X/6)
- Hint: "Visita la pestaña Mascota para equipar"

## Archivos del Sistema

### JavaScript
- **`frontend/mascot-system.js`** (510 líneas)
  - Catálogo de prendas
  - Lógica de niveles
  - Funciones de equipamiento
  - Renderizado de preview
  - Integración con Firebase

### CSS
- **`frontend/mascot-styles.css`** (380 líneas)
  - Estilos de pestaña mascota
  - Preview grande y mini
  - Colección de prendas
  - Slots de equipamiento
  - Responsive móvil

### Integración
- **`frontend/app.html`**
  - Nueva pestaña "Mascota"
  - Container para mini preview en header
  - Inclusión de scripts y estilos

- **`frontend/app-platform.js`**
  - Carga de pestaña mascota
  - Visibilidad solo en Simple Mode
  - Actualización de header

- **`frontend/colony-system.js`**
  - Integración en `openChestModal()`
  - Llamada a `addItemToWardrobe()`
  - Actualización de header mascota

### Base de Datos
- **`database.rules.json`**
  - Reglas de seguridad para `/groups/{id}/mascot`
  - Validación de equipped slots
  - Validación de wardrobe items

## Funciones Principales

### getMascotData(groupId)
Obtiene datos de mascota desde Firebase.

```javascript
const mascotData = await MascotSystem.getMascotData(groupId);
// Returns: { equipped: {head, accessory}, wardrobe: {...} }
```

### equipItem(groupId, itemId)
Equipa una prenda en su slot correspondiente.

```javascript
await MascotSystem.equipItem(groupId, 'crown_gold');
// Equipa corona en slot "head"
```

### addItemToWardrobe(groupId, itemId)
Agrega copia de prenda al guardarropa (desde cofre).

```javascript
const reward = await MascotSystem.addItemToWardrobe(groupId, 'backpack');
// Returns: { itemId, item, isNew, upgraded, oldLevel, newLevel, copies }
```

### loadMascotTab(groupId)
Carga contenido completo de pestaña mascota.

```javascript
await MascotSystem.loadMascotTab(groupId);
```

### updateMascotHeader(groupId)
Actualiza mini preview en header del grupo.

```javascript
await MascotSystem.updateMascotHeader(groupId);
```

## Métricas de Éxito

Para evaluar si el sistema cumple su objetivo de retención:

1. **% de usuarios que abren cofres semanales**
   - Meta: >60% de usuarios activos
   
2. **% de usuarios que equipan prendas**
   - Meta: >40% de usuarios que tienen prendas
   
3. **Tasa de retención semanal**
   - Comparar semanas antes/después del sistema
   - Meta: +10-15% retención

4. **Engagement con pestaña Mascota**
   - Visitas a pestaña por usuario activo
   - Meta: >2 visitas/semana

## Escalabilidad Futura (Opcional)

Si el sistema demuestra alto engagement, se puede considerar:

### Fase 2 (Opcional)
- Agregar 12 prendas más (6 cabeza + 6 accesorios)
- Nuevas categorías de rareza (Épico, Legendario)
- Sistema de colecciones (sets temáticos)

### Fase 3 (Opcional)
- Eventos especiales con prendas exclusivas
- Trading de prendas entre grupos
- Estadísticas de colección

**IMPORTANTE**: Estas fases solo se implementarán si:
1. Métricas Fase 1 son exitosas (>60% engagement)
2. No afectan simplicidad de división de gastos
3. Usuarios piden más contenido explícitamente

## Testing

### Crear Cofre de Prueba (Console)
```javascript
ColonySystem.createTestChest('groupId')
```

### Agregar Prenda Manualmente (Console)
```javascript
MascotSystem.addItemToWardrobe('groupId', 'crown_gold')
```

### Ver Datos Mascota (Console)
```javascript
const data = await MascotSystem.getMascotData('groupId')
console.log(data)
```

## Notas Importantes

1. **Solo Simple Mode**: Sistema solo visible en grupos Simple Mode
2. **No Bloqueante**: Si mascot-system.js falla, app sigue funcionando
3. **Backward Compatible**: Grupos viejos sin mascota funcionan normalmente
4. **Feature Flag**: Controlado por `window.MascotSystem` availability
5. **Seguridad**: Solo miembros del grupo pueden modificar mascota

## Roadmap de Implementación

- [x] Diseño simplificado del sistema
- [x] Implementación de catálogo (12 prendas)
- [x] Sistema de niveles (3 niveles)
- [x] UI de pestaña Mascota
- [x] Integración con cofres semanales
- [x] Reglas de seguridad Firebase
- [x] Deployment a producción
- [ ] Monitoreo de métricas (semana 1-2)
- [ ] Ajustes según feedback
- [ ] Decisión sobre Fase 2 (después de 1 mes)

---

**Versión**: 1.0  
**Fecha**: Enero 2026  
**Autor**: Ant Pool Team  
**Estado**: ✅ Deployed to Production
