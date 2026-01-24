# 🛡️ Admin Dashboard

## Descripción

Dashboard de administración protegido con métricas en tiempo real del sistema Ant Pool.

## 🚀 Características

### Métricas Clave
- **Total de Usuarios**: Usuarios registrados + crecimiento mensual
- **Total de Grupos**: Grupos creados + crecimiento semanal
- **Transacciones**: Total de gastos + volumen total
- **Usuarios Activos**: Activos en últimos 7 días + % del total
- **Colonias Activas**: Grupos con sistema colonial + cofres abiertos
- **Mascots Activas**: Grupos con mascotas + nivel promedio

### Gráficos Interactivos
1. **Crecimiento de Usuarios** (últimos 30 días) - Línea
2. **Volumen de Transacciones** (últimos 7 días) - Barras
3. **Distribución de Monedas** - Dona
4. **Tipos de Grupos** - Pastel (Colony+Mascot, solo Colony, solo Mascot, ninguno)

### Tabla de Grupos Recientes
- 10 grupos más recientes
- Información: nombre, creador, miembros, gastos, estado, fecha
- Estado activo/inactivo basado en actividad de 7 días

## 🔒 Seguridad

### Sistema de Autenticación Multi-Nivel

1. **Hardcoded Admins** (Prioridad Alta)
   - Editar `ADMIN_UIDS` en `admin-dashboard.js`
   - Agregar UIDs de administradores específicos

2. **Firebase Admins** (Prioridad Media)
   - Almacenados en `system/admins/{uid}: true`
   - Solo otros admins pueden agregar nuevos admins

3. **Auto-Admin** (Primera Vez)
   - Si no hay admins configurados, el primer usuario se vuelve admin automáticamente
   - Útil para configuración inicial

### Protección de Rutas
- Redirección automática a `index.html` si no hay sesión
- Pantalla de "Access Denied" si el usuario no es admin
- Todas las queries verifican permisos de Firebase Rules

## 📝 Instalación

### 1. Configurar Administradores

**Opción A: Hardcoded (Recomendado para producción)**

Editar `frontend/admin-dashboard.js`:

```javascript
const ADMIN_UIDS = [
    'tu-uid-de-firebase-aqui',
    'otro-admin-uid-aqui',
];
```

**Para obtener tu UID:**
1. Abrir consola del navegador en `index.html`
2. Ejecutar: `firebase.auth().currentUser.uid`
3. Copiar el UID mostrado

**Opción B: Firebase Database**

```javascript
// En consola de Firebase o mediante script
firebase.database().ref('system/admins/TU_UID').set(true);
```

**Opción C: Auto-Admin (Solo desarrollo)**

Dejar `ADMIN_UIDS = []` vacío. El primer usuario que acceda será admin automáticamente.

### 2. Desplegar Firebase Rules

```bash
firebase deploy --only database
```

### 3. Desplegar Archivos

```bash
firebase deploy --only hosting
```

## 🌐 Acceso

### URL de Producción
```
https://blockchaincontract001.web.app/admin-dashboard.html
```

### URL Local (Desarrollo)
```
http://localhost:8080/admin-dashboard.html
```

## 🔧 Configuración Avanzada

### Agregar Nuevo Admin (Desde Consola)

```javascript
// En admin-dashboard.html (como admin existente)
const newAdminUid = 'uid-del-nuevo-admin';
firebase.database().ref('system/admins/' + newAdminUid).set(true)
    .then(() => console.log('Admin agregado'))
    .catch(err => console.error(err));
```

### Remover Admin

```javascript
firebase.database().ref('system/admins/UID_A_REMOVER').remove();
```

### Personalizar Métricas

Editar funciones en `admin-dashboard.js`:
- `loadUserMetrics()` - Usuarios
- `loadGroupMetrics()` - Grupos
- `loadTransactionMetrics()` - Transacciones
- `loadColonyMetrics()` - Colonias
- `loadMascotMetrics()` - Mascotas

### Personalizar Gráficos

Modificar funciones Chart.js:
- `createUserGrowthChart()` - Gráfico de usuarios
- `createTransactionChart()` - Gráfico de transacciones
- `createCurrencyChart()` - Gráfico de monedas
- `createGroupTypeChart()` - Gráfico de tipos

## 📊 Datos en Tiempo Real

El dashboard se actualiza automáticamente cuando:
- Se crea un nuevo usuario
- Se crea un nuevo grupo
- Se agrega un gasto

Los listeners están configurados en `setupRealtimeListeners()`.

## 🎨 Personalización Visual

### Colores del Tema

Editar variables CSS en `admin-dashboard.html`:

```css
:root {
    --admin-primary: #667eea;     /* Azul principal */
    --admin-secondary: #764ba2;   /* Morado secundario */
    --admin-success: #10b981;     /* Verde éxito */
    --admin-warning: #f59e0b;     /* Naranja advertencia */
    --admin-danger: #ef4444;      /* Rojo peligro */
    --admin-info: #3b82f6;        /* Azul info */
}
```

### Agregar Nuevas Métricas

1. Agregar tarjeta en HTML:
```html
<div class="metric-card">
    <span class="metric-icon">📈</span>
    <div class="metric-label">Nueva Métrica</div>
    <div class="metric-value" id="newMetric">-</div>
    <div class="metric-change">Descripción</div>
</div>
```

2. Crear función de carga:
```javascript
async function loadNewMetric() {
    // Tu lógica aquí
    document.getElementById('newMetric').textContent = value;
}
```

3. Agregar a `initDashboard()`:
```javascript
await Promise.all([
    // ... métricas existentes
    loadNewMetric()
]);
```

## 🐛 Troubleshooting

### "Access Denied"

1. Verificar que tu UID esté en `ADMIN_UIDS`
2. Verificar que exista en `system/admins/{uid}` en Firebase
3. Revisar Firebase Rules deployment

### Métricas Muestran "-"

1. Abrir consola del navegador
2. Buscar errores de Firebase
3. Verificar permisos de lectura en Database Rules
4. Verificar estructura de datos en Firebase Console

### Gráficos No Se Muestran

1. Verificar que Chart.js se cargue correctamente
2. Abrir consola y buscar errores
3. Verificar que existan datos en Firebase

### Firebase Rules Error

```bash
# Re-desplegar rules
firebase deploy --only database

# Verificar sintaxis
firebase database:get / --project blockchaincontract001
```

## 📈 Métricas Disponibles

### Usuarios
- Total registrados
- Activos (7 días)
- Nuevos (30 días)
- % de activación

### Grupos
- Total creados
- Nuevos (7 días)
- Con Colony
- Con Mascot
- Con ambos sistemas

### Transacciones
- Total de gastos
- Volumen total (multi-moneda)
- Por moneda
- Por día (7 días)

### Sistemas Gamificados
- Colonias activas
- Cofres abiertos
- Mascotas activas
- Nivel promedio de mascotas

## 🔐 Seguridad Best Practices

1. **Nunca compartir UIDs públicamente**
2. **Usar HTTPS siempre** (Firebase Hosting lo hace automáticamente)
3. **Auditar lista de admins regularmente**
4. **Rotar admins si alguien deja el equipo**
5. **No hardcodear admins en commits públicos** (usar variables de entorno)

## 🚀 Roadmap

### Próximas Funcionalidades
- [ ] Exportar datos a CSV/Excel
- [ ] Filtros por fecha personalizada
- [ ] Alertas automáticas (thresholds)
- [ ] Modo oscuro
- [ ] Dashboard móvil optimizado
- [ ] Logs de actividad de admins
- [ ] Backup automático de datos
- [ ] API REST para integraciones

## 📞 Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Revisar Firebase Console para errores
3. Verificar browser console para logs

## 📄 Licencia

Parte del proyecto Ant Pool - Uso interno exclusivo para administradores.
