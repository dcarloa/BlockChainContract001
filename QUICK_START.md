# 🚀 Guía Rápida - TravelFund DApp

## ✅ Estado Actual

Tu aplicación TravelFund está completamente configurada y funcionando:

- ✅ Nodo Hardhat corriendo en: http://127.0.0.1:8545
- ✅ Contrato desplegado en: **0x5FbDB2315678afecb367f032d93F642f64180aa3**
- ✅ Frontend corriendo en: http://localhost:3001

## 🔧 Configuración de MetaMask

### 1. Agregar Red Local de Hardhat

1. Abre MetaMask
2. Click en la red (arriba)
3. "Agregar red" → "Agregar una red manualmente"
4. Configurar:
   - **Nombre de la red:** Hardhat Local
   - **Nueva URL de RPC:** http://127.0.0.1:8545
   - **ID de cadena:** 31337
   - **Símbolo de moneda:** ETH
5. Guardar y cambiar a esta red

### 2. Importar Cuenta de Prueba

Importa una de estas cuentas de prueba (tienen 10,000 ETH cada una):

**Cuenta #0 (Deployer):**
- Dirección: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Clave privada: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**Cuenta #1 (Amigo 1):**
- Dirección: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Clave privada: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Cuenta #2 (Amigo 2):**
- Dirección: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Clave privada: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

> ⚠️ **IMPORTANTE:** Estas claves privadas son SOLO para desarrollo local. NUNCA las uses en mainnet.

Para importar:
1. MetaMask → Menu (3 puntos) → "Importar cuenta"
2. Seleccionar "Clave privada"
3. Pegar la clave privada
4. Importar

## 🎮 Usar la Aplicación

### Paso 1: Conectar Wallet
1. Ve a http://localhost:3001
2. Click en "Conectar Wallet"
3. Autoriza la conexión en MetaMask

### Paso 2: Configurar Contrato
1. Copia la dirección del contrato: `0x5FbDB2315678afecb367f032d93F642f64180aa3`
2. Pégala en el campo "Dirección del Contrato"
3. Click en "Establecer Contrato"

### Paso 3: Explorar Funciones

#### 💰 Depositar Fondos
- Tab "Depositar"
- Ingresa cantidad en ETH
- Click "Depositar"

#### 📝 Crear Propuesta
- Tab "Proponer"
- Ingresa dirección del destinatario
- Ingresa monto
- Ingresa descripción
- Click "Crear Propuesta"

#### 🗳️ Votar
- Tab "Votar"
- Verás lista de propuestas pendientes
- Click "👍 A Favor" o "👎 En Contra"

#### ⚡ Ejecutar Propuesta Aprobada
- Tab "Ejecutar"
- Verás propuestas aprobadas
- Click "Ejecutar Propuesta"

#### 🛠️ Cerrar Fondo
- Tab "Gestionar"
- Solo el creador puede cerrar el fondo
- Click "Cerrar Fondo"
- Luego todos pueden retirar su parte proporcional

## 🔄 Iniciar el Entorno (TODO EN UNA TERMINAL)

Para iniciar todo desde una sola terminal:

```powershell
.\start-simple.ps1
```

Este script:
1. Limpia procesos anteriores
2. Inicia el nodo de Hardhat en background
3. Despliega el contrato
4. Inicia el servidor frontend

Todo corre en la misma terminal. Presiona **Ctrl+C** para detener todos los servicios.

### Script Alternativo (Ventanas Separadas)

Si prefieres ventanas separadas para cada servicio:

```powershell
.\start-dev.ps1
```

## 📋 Comandos Útiles

### Ver logs del nodo Hardhat
Los logs aparecen en la ventana de PowerShell del nodo.

### Probar el contrato desde consola
```powershell
npx hardhat console --network localhost
```

Luego:
```javascript
const fund = await ethers.getContractAt("TravelFund", "0x5FbDB2315678afecb367f032d93F642f64180aa3")
await fund.getBalance()
await fund.tripName()
```

### Ejecutar tests
```powershell
npx hardhat test
```

### Ver solo tests de TravelFund
```powershell
npx hardhat test test/TravelFund.test.js
```

## 🐛 Solución de Problemas

### ⚠️ "MetaMask No Detectado" o errores "Unexpected error"

**Problema:** La página muestra un warning amarillo o errores en consola sobre MetaMask.

**Solución:**
1. Instala MetaMask desde https://metamask.io/download/
2. Una vez instalado, recarga la página (F5)
3. Verás el botón "Conectar Wallet" activo

### Error: "Cannot connect to network localhost"
- Asegúrate de que el nodo Hardhat esté corriendo
- Revisa que esté en http://127.0.0.1:8545
- Si usaste `start-simple.ps1`, verifica que no haya errores en la terminal

### MetaMask no se conecta o muestra error de red
1. Abre MetaMask
2. Click en la red (arriba)
3. Asegúrate de estar en "Hardhat Local"
4. Si no existe, agrégala:
   - RPC: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Símbolo: `ETH`

### "Insufficient funds"
- Asegúrate de haber importado una cuenta de prueba
- Cada cuenta tiene 10,000 ETH de prueba
- Revisa que estés en la red "Hardhat Local"

### Error "Nonce too high" o transacciones fallando
- En MetaMask: Configuración → Avanzado → "Reset Account"
- Esto limpia el historial de transacciones
- Útil cuando reinicias el nodo de Hardhat

### Frontend no carga o muestra página en blanco
- Verifica que el servidor esté corriendo en puerto 3001
- Revisa la terminal donde ejecutaste el script
- Refresca la página con Ctrl+F5 (borrar caché)
- Abre la consola del navegador (F12) para ver errores

### El script se detiene o no responde
- Presiona **Ctrl+C** para detener
- Espera unos segundos a que limpie los procesos
- Ejecuta `.\start-simple.ps1` nuevamente

## 📚 Documentación Adicional

- `docs/TRAVELFUND.md` - Documentación completa del contrato
- `docs/CONCEPTOS.md` - Conceptos de Solidity
- `docs/SEGURIDAD.md` - Mejores prácticas de seguridad
- `frontend/README.md` - Guía del frontend

## 🎯 Próximos Pasos

1. Experimenta depositando fondos desde diferentes cuentas
2. Crea propuestas y prueba el sistema de votación
3. Intenta ejecutar propuestas aprobadas
4. Modifica el contrato para agregar nuevas funcionalidades
5. Lee la documentación para entender cómo funciona todo

¡Disfruta aprendiendo Solidity! 🎉
