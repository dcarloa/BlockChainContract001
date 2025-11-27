# 🚀 Scripts de Inicio - TravelFund

Este proyecto incluye varios scripts para facilitar el inicio de la aplicación. Elige el que mejor se adapte a tus necesidades.

## 📋 Scripts Disponibles

### 1. `start-simple.ps1` ⭐ **RECOMENDADO - Comienza desde Cero**

**Versión simplificada que ejecuta todo en una sola terminal (V2 VACÍO)**

```powershell
.\start-simple.ps1
```

**Qué hace:**
- ✅ Compila los contratos
- ✅ Inicia la red local de Hardhat (en background)
- ✅ Despliega **TravelFundV2 VACÍO** (sin datos precargados)
- ✅ Inicia el servidor frontend
- ✅ Abre automáticamente el navegador en `index-v2.html`

**Detener:** Presiona `Ctrl+C` en la terminal

**Ideal para:** Crear tu propio fondo desde cero, uso real, aprendizaje paso a paso

**Estado inicial:**
- 🆕 Fondo vacío sin contribuyentes
- 👤 Tú eres el creador
- 💰 Balance: 0 ETH
- 📝 Sin propuestas

---

### 2. `start-demo.ps1` 🎬 **Demo con Datos Precargados**

**Script con datos de ejemplo para probar funcionalidades (V2 CON DATOS)**

```powershell
.\start-demo.ps1
```

**Qué hace:**
- ✅ Compila los contratos
- ✅ Inicia la red local de Hardhat
- ✅ Despliega **TravelFundV2 CON DATOS DE EJEMPLO**
- ✅ Inicia el servidor frontend
- ✅ Abre el navegador automáticamente

**Detener:** Presiona `Ctrl+C` en la terminal

**Ideal para:** Ver la aplicación funcionando, demos, explorar características

**Datos precargados:**
- 👥 4 usuarios: Alice, Bob, Charlie, Diana
- 💰 9 ETH depositados
- 📝 2 propuestas activas
- 🗳️ 1 propuesta aprobada y ejecutada

---

### 3. `start-v2.ps1` 🎯 **Script Inteligente Multi-Terminal**

**Script completo que detecta servicios existentes (V2 VACÍO)**

```powershell
.\start-v2.ps1
```

**Qué hace:**
- ✅ Verifica Node.js y dependencias
- ✅ Compila los contratos
- ✅ Detecta si la red ya está corriendo (no duplica)
- ✅ Despliega **TravelFundV2 VACÍO**
- ✅ Detecta si el servidor ya está corriendo (no duplica)
- ✅ Abre el navegador automáticamente
- ✅ Muestra instrucciones detalladas de MetaMask

**Detener:** Cierra las ventanas de PowerShell que se abrieron

**Ideal para:** Desarrollo avanzado, múltiples terminales, servicios persistentes

---

### 4. `start-simple-v1.ps1` 📦 **Para TravelFund V1**

**Versión simplificada para el contrato original (sin nicknames ni invitaciones)**

```powershell
.\start-simple-v1.ps1
```

**Qué hace:**
- ✅ Compila los contratos
- ✅ Inicia la red local de Hardhat
- ✅ Despliega **TravelFund V1** (contrato original)
- ✅ Inicia el servidor frontend
- ✅ Abre el navegador en `index.html` (interfaz V1)

**Detener:** Presiona `Ctrl+C` en la terminal

**Ideal para:** Comparar V1 vs V2, aprender desde lo básico, compatibilidad

---

## 🔄 Comparación Rápida

| Característica | start-simple.ps1 | start-demo.ps1 | start-v2.ps1 | start-simple-v1.ps1 |
|----------------|------------------|----------------|--------------|---------------------|
| **Versión** | V2 | V2 | V2 | V1 |
| **Datos iniciales** | ⭐ Vacío (desde cero) | 📦 Precargado (ejemplo) | ⭐ Vacío (desde cero) | ⭐ Vacío |
| **Terminales** | 1 (todo junto) | 1 (todo junto) | 3 (separadas) | 1 (todo junto) |
| **Detección de servicios** | ❌ Reinicia todo | ❌ Reinicia todo | ✅ Detecta existentes | ❌ Reinicia todo |
| **Auto-apertura navegador** | ✅ | ✅ | ✅ | ✅ |
| **Nicknames** | ✅ | ✅ | ✅ | ❌ |
| **Invitaciones** | ✅ | ✅ | ✅ | ❌ |
| **Recomendado para** | ⭐ Uso real | 🎬 Demos/Explorar | 🔧 Desarrollo | 📚 Aprendizaje básico |

---

## 🆚 Diferencias V1 vs V2

### TravelFund V1 (Original)
- ✅ Funcionalidad básica de fondo compartido
- ✅ Sistema de votación democrática
- ✅ Propuestas y ejecución
- ❌ Sin nicknames (solo direcciones 0x...)
- ❌ Sin sistema de invitaciones
- ❌ Sin límites de seguridad avanzados
- ❌ Sin metas de fundraising

**Interfaz:** `http://localhost:3001/index.html`

### TravelFund V2 (Mejorado) ⭐
- ✅ **TODO lo de V1 +**
- ✅ Sistema de nicknames (alias únicos)
- ✅ Invitaciones para fondos privados
- ✅ Protección contra reentrancy
- ✅ Límite de 50 miembros (anti-DoS)
- ✅ Límite de 80% por propuesta
- ✅ Expiración automática (30 días)
- ✅ Metas y progreso de fundraising
- ✅ Auto-carga del contrato
- ✅ Interfaz simplificada

**Interfaz:** `http://localhost:3001/index-v2.html`

---

## 🛠️ Inicio Manual (Avanzado)

Si prefieres ejecutar cada paso manualmente:

### Para V2:

```powershell
# Terminal 1: Red local
npx hardhat node

# Terminal 2: Desplegar contrato
npx hardhat run scripts/deployTravelFundV2.js --network localhost

# Terminal 3: Servidor frontend
node scripts/server.js

# Abrir: http://localhost:3001/index-v2.html
```

### Para V1:

```powershell
# Terminal 1: Red local
npx hardhat node

# Terminal 2: Desplegar contrato
npx hardhat run scripts/deployTravelFund.js --network localhost

# Terminal 3: Servidor frontend
node scripts/server.js

# Abrir: http://localhost:3001/index.html
```

---

## ❓ FAQ

### ¿Cuál script debo usar?

- **⭐ Crear mi propio fondo:** `.\start-simple.ps1` (VACÍO - más común)
- **🎬 Ver cómo funciona primero:** `.\start-demo.ps1` (CON DATOS)
- **🔧 Desarrollo avanzado:** `.\start-v2.ps1` (multi-terminal)
- **📚 Aprender desde básico:** `.\start-simple-v1.ps1` (versión original)
- **💻 Control total:** Inicio manual

### ¿Puedo cambiar entre vacío y con datos?

Sí, simplemente:
1. Detener todos los servicios actuales (`Ctrl+C`)
2. Ejecutar el script que quieras:
   - `.\start-simple.ps1` → Comienza vacío
   - `.\start-demo.ps1` → Con datos de ejemplo
3. El contrato se desplegará nuevamente con una dirección nueva

### ¿Cuál es la diferencia entre vacío y con datos?

**VACÍO (start-simple.ps1):**
- ✅ Tú creas todo desde cero
- ✅ Experiencia real de usuario
- ✅ Aprendes cada paso
- ❌ Sin datos para explorar inmediatamente

**CON DATOS (start-demo.ps1):**
- ✅ Ver todas las características funcionando
- ✅ Perfecto para demos
- ✅ Explorar sin configurar
- ❌ No experimentas crear desde cero

### ¿Por qué hay tres scripts para V2?

- **`start-simple.ps1`**: ⭐ Uso real - Vacío, una terminal
- **`start-demo.ps1`**: 🎬 Exploración rápida - Con datos, una terminal  
- **`start-v2.ps1`**: 🔧 Desarrollo - Vacío, detecta servicios, tres terminales

### Error: "Address already in use"

Significa que ya hay servicios corriendo. Opciones:
1. Usa `start-v2.ps1` que detecta automáticamente
2. O detén todos los procesos: `Stop-Process -Name node -Force`

### ¿Cómo detener todo?

- **Con `start-simple.ps1` o `start-simple-v1.ps1`:** Presiona `Ctrl+C` en la terminal
- **Con `start-v2.ps1`:** Cierra las ventanas de PowerShell que se abrieron
- **Manual:** `Stop-Process -Name node -Force` en PowerShell

---

## 📚 Más Información

- **Guía rápida V2:** `QUICK_START_V2.md`
- **Guía completa:** `docs/GuiaDetallada.txt`
- **Auditoría de seguridad:** `docs/SecurityAudit.txt`
- **README principal:** `README.md`

---

**¿Listo para empezar?**

```powershell
# ⭐ Crear tu propio fondo desde cero (RECOMENDADO)
.\start-simple.ps1

# 🎬 Ver demo con datos de ejemplo
.\start-demo.ps1
```

¡Disfruta tu TravelFund! 🎉
