# Testing Notifications

## Para probar el sistema de notificaciones

### Opción 1: Crear una notificación de prueba desde la consola

Abre la consola del navegador (`F12`) y ejecuta este código:

```javascript
// Crear notificación de prueba
const user = firebase.auth().currentUser;
if (user) {
    const testNotif = {
        type: 'expense_added',
        title: '💸 Test Notification',
        message: 'This is a test notification to verify the system works',
        fundId: 'test-group',
        timestamp: Date.now(),
        read: false
    };
    
    firebase.database().ref(`notifications/${user.uid}`).push(testNotif)
        .then(() => {
            console.log('✅ Test notification created!');
            // Reload notifications
            if (typeof loadNotifications === 'function') {
                loadNotifications();
            }
        })
        .catch(err => console.error('Error:', err));
} else {
    console.error('No user logged in');
}
```

### Opción 2: Agregar un gasto en un grupo

1. Ve a cualquier grupo en Simple Mode
2. Agrega un gasto nuevo
3. Todos los demás miembros del grupo deberían recibir una notificación

### Opción 3: Registrar un pago

1. Ve a un grupo y mira los balances
2. Haz click en "Record Payment" para cualquier deuda
3. La persona que recibe el pago debería ver una notificación

### Verificar que funciona:

1. Después de crear notificaciones, deberías ver:
   - Badge rojo con número en el botón de campana
   - Al hacer click en la campana, se abre el panel
   - Las notificaciones aparecen en el panel
   - Después de 2 segundos, se marcan como leídas
   - El badge desaparece cuando no hay notificaciones sin leer

### Debug:

Si no funciona, revisa la consola del navegador:
- `🔔 Initializing notification system...` ✅
- `✅ Notification system initialized` ✅
- NO debe haber errores de `permission_denied`

Si hay errores de permisos, verifica que las reglas de Firebase estén actualizadas ejecutando:
```bash
firebase deploy --only database
```
