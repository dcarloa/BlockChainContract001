# 🎁 Sistema de Retención: Colonia Viva + Mascota

## Resumen Ejecutivo

Sistema completo de gamificación implementado en Ant Pool para **aumentar la retención de usuarios** mediante mecánicas semanales no invasivas.

### Componentes

1. **🐜 Colonia Viva** - Sistema de estados visuales del grupo
2. **🎁 Cofres Semanales** - Recompensas automáticas cada lunes
3. **👕 Sistema de Mascota** - Personalización con prendas coleccionables

## Deployment

✅ **Estado**: Deployed to Production  
🌐 **URL**: https://blockchaincontract001.web.app  
📅 **Fecha**: Enero 2026  

### Archivos Deployed

**Frontend:**
```
frontend/
  ├── colony-system.js       (465 líneas)
  ├── colony-styles.css      (380 líneas)
  ├── mascot-system.js       (510 líneas)
  ├── mascot-styles.css      (380 líneas)
  └── app.html               (modificado)
  └── app-platform.js        (modificado)
```

**Backend:**
```
functions/
  └── index.js               (evaluateWeeklyChests, evaluateWeeklyChestsManual)
  
database.rules.json          (reglas de seguridad)
```

**Documentación:**
```
docs/
  ├── COLONY_SYSTEM.md           (Sistema completo Colonia Viva)
  ├── COLONY_TESTING_GUIDE.md    (Guía de pruebas)
  ├── MASCOT_SYSTEM.md           (Sistema de mascota)
  └── MASCOT_USER_GUIDE.md       (Guía de usuario)
```

## Características Principales

### 1. Colonia Viva (Visual States)

**4 estados visuales:**
- 🌱 **Formando** (0 semanas) - Verde primavera
- 🐜 **Activa** (1-3 semanas) - Morado estándar  
- 💎 **Estable** (4-7 semanas) - Azul cristal
- 👑 **Consolidada** (8+ semanas) - Dorado

**Muestra:**
- Header del grupo (mini display)
- Modal de cofre semanal (visual grande SVG)

### 2. Cofres Semanales

**Trigger automático:**
- Cada **lunes 00:00 UTC** (Cloud Function scheduled)
- Si grupo cumple: ≥1 gasto OR ≥2 miembros activos

**Contenido:**
- Visual de estado de colonia
- Mensaje de felicitación
- **1 prenda aleatoria** para mascota

**UI:**
- Banner no invasivo en parte superior
- Modal elegante con animaciones
- Marca como abierto (no se repite)

### 3. Sistema de Mascota

**Catálogo:**
- 12 prendas totales
- 2 categorías: Cabeza (6) + Accesorios (6)
- 2 niveles de rareza: Común + Rara

**Progresión:**
- 3 niveles: Básico ⭐ → Plata ⭐⭐ → Oro ⭐⭐⭐
- Requiere copias: 1 → 3 → 6

**Equipamiento:**
- 2 slots: Cabeza + Accesorio
- Preview en header del grupo
- Pestaña completa "Mascota"

## Estructura de Datos Firebase

```javascript
groups/
  {groupId}/
    colony/
      state: "active"                    // forming | active | stable | consolidated
      totalActivity: 15                  // Total de actividad acumulada
      weeklyActivity: 3                  // Actividad semana actual
      consecutiveActiveWeeks: 2          // Semanas activas consecutivas
      lastActivityDate: 1705622400000    // Última fecha de actividad
      
    mascot/
      equipped/
        head: "hat_explorer"             // null si vacío
        accessory: "backpack"            // null si vacío
      wardrobe/
        crown_gold/
          copies: 4
          level: "silver"                // basic | silver | gold
          lastObtained: 1705622400000

weeklyChests/
  {groupId}/
    {weekId}/                            // Ej: "2026-W03"
      state: "active"
      description: "Gracias por mantener..."
      createdAt: 1705622400000
      isOpened: false                    // true cuando se abre
      openedBy: "userId"                 // null hasta que se abre
      openedAt: 1705622500000            // null hasta que se abre
```

## Flujo de Usuario

### Semana 1: Grupo Nuevo

```
1. Usuario crea grupo → Estado: 🌱 Formando
2. Registra gastos durante la semana
3. Lunes siguiente → Cloud Function evalúa
4. ✅ Cofre creado (tiene ≥1 gasto)
5. Banner aparece: "¡Cofre disponible!"
6. Usuario abre → Obtiene primera prenda (común)
7. Estado mejora a: 🐜 Activa
```

### Semana 4: Grupo Consolidándose

```
1. Estado actual: 🐜 Activa (3 semanas activas)
2. Grupo sigue activo durante semana
3. Lunes siguiente → Cofre creado
4. Estado mejora a: 💎 Estable
5. Probabilidad prendas raras aumenta a 60%
6. Usuario obtiene prenda rara
7. Si es 3ª copia → Mejora a nivel Plata ⭐⭐
```

### Semana 8+: Grupo Consolidado

```
1. Estado actual: 👑 Consolidada
2. Acceso a todas las prendas
3. Enfoque en completar colección (12/12)
4. Mejorar prendas favoritas a Oro ⭐⭐⭐
```

## Métricas de Éxito

### KPIs Principales

1. **Weekly Chest Open Rate**
   - Meta: >60% de usuarios activos
   - Actual: Pendiente monitoreo

2. **Item Equipment Rate**
   - Meta: >40% de usuarios con prendas
   - Actual: Pendiente monitoreo

3. **Weekly Retention**
   - Baseline: Medir antes del sistema
   - Meta: +10-15% retención
   - Actual: Pendiente monitoreo

4. **Mascot Tab Engagement**
   - Meta: >2 visitas/semana por usuario activo
   - Actual: Pendiente monitoreo

### Herramientas de Monitoreo

**Firebase Analytics:**
```javascript
// Eventos a trackear
gtag('event', 'weekly_chest_opened', { group_id, week_id, colony_state });
gtag('event', 'mascot_item_equipped', { group_id, item_id });
gtag('event', 'mascot_tab_viewed', { group_id });
gtag('event', 'mascot_item_upgraded', { item_id, new_level });
```

**Console Testing:**
```javascript
// Crear cofre de prueba
ColonySystem.createTestChest('groupId')

// Eliminar cofre de prueba
ColonySystem.deleteTestChest('groupId')

// Trigger manual de evaluación
ColonySystem.triggerWeeklyEvaluation()

// Ver datos mascota
MascotSystem.getMascotData('groupId')

// Agregar prenda manualmente
MascotSystem.addItemToWardrobe('groupId', 'crown_gold')
```

## Testing

### Pruebas Realizadas

✅ Creación automática de cofres (Cloud Function)  
✅ Banner aparece correctamente  
✅ Modal se abre sin errores  
✅ Prenda se agrega a wardrobe  
✅ Niveles mejoran correctamente (1→3→6 copias)  
✅ Equipamiento funciona  
✅ Preview en header se actualiza  
✅ Pestaña Mascota carga correctamente  
✅ Responsive en móvil  
✅ Reglas de seguridad Firebase  

### Casos Edge

✅ Grupo sin actividad → No recibe cofre  
✅ Cofre ya abierto → No se duplica  
✅ Usuario no miembro → No puede abrir cofre  
✅ Mascot system falla → App sigue funcionando  
✅ Prenda en Oro recibe copia → No crashea  

## Seguridad

### Reglas Firebase

```json
{
  "groups": {
    "$groupId": {
      "colony": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()"
      },
      "mascot": {
        ".read": "auth != null",
        ".write": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()"
      }
    }
  },
  "weeklyChests": {
    "$groupId": {
      "$weekId": {
        ".read": "auth != null && root.child('groups').child($groupId).child('members').child(auth.uid).exists()",
        ".write": "auth != null"
      }
    }
  }
}
```

## Roadmap

### Fase 1 (✅ Completada)
- [x] Sistema de Colonia Viva (4 estados)
- [x] Cofres semanales automáticos
- [x] Sistema de mascota básico (12 prendas)
- [x] UI completa y responsive
- [x] Deployment a producción
- [x] Documentación completa

### Fase 2 (📅 1 mes después - Condicional)

**Solo si métricas Fase 1 son exitosas:**
- [ ] Agregar 12 prendas más
- [ ] Sistema de colecciones (sets temáticos)
- [ ] Eventos especiales con prendas exclusivas
- [ ] Trading de prendas entre grupos

**Criterios para Fase 2:**
1. Chest Open Rate >60%
2. Item Equipment Rate >40%
3. Weekly Retention +10% o más
4. Feedback positivo de usuarios

## Comandos Útiles

### Deploy
```bash
firebase deploy --only "hosting,database"
firebase deploy --only "functions"
```

### Testing Local
```bash
firebase emulators:start
```

### Ver Logs Cloud Functions
```bash
firebase functions:log
```

## Troubleshooting

### Banner no aparece
1. Verificar que es lunes y hay cofre creado
2. Check console: `ColonySystem.checkWeeklyChest('groupId')`
3. Verificar isOpened === false

### Prenda no se agrega
1. Check console errors
2. Verificar que usuario es miembro del grupo
3. Ver database rules (permisos)

### Pestaña Mascota vacía
1. Verificar que grupo es Simple Mode
2. Check `window.MascotSystem` está cargado
3. Ver errores en console

## Soporte

**Documentación:**
- [COLONY_SYSTEM.md](./COLONY_SYSTEM.md) - Sistema técnico completo
- [COLONY_TESTING_GUIDE.md](./COLONY_TESTING_GUIDE.md) - Guía de pruebas
- [MASCOT_SYSTEM.md](./MASCOT_SYSTEM.md) - Sistema de mascota
- [MASCOT_USER_GUIDE.md](./MASCOT_USER_GUIDE.md) - Guía de usuario

**Contacto:**
- Issues en repositorio
- Email soporte Ant Pool

---

**Versión**: 1.0  
**Estado**: ✅ Production  
**Última Actualización**: Enero 2026
