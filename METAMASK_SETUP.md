# 🦊 Guía de Configuración de MetaMask

## ⚠️ Problema: Se Conecta Otra Wallet (Coinbase, Brave, etc.)

Si al hacer click en "Connect Wallet" se abre **Coinbase Wallet** u otra wallet en lugar de MetaMask, sigue estos pasos:

---

## ✅ Solución 1: Desactivar Temporalmente Otras Wallets

### Para Chrome/Brave:

1. Abre el menú de extensiones (icono de puzzle 🧩)
2. Click en "Administrar extensiones"
3. **Desactiva** temporalmente:
   - Coinbase Wallet
   - Brave Wallet (si aplica)
   - Cualquier otra wallet cripto
4. Mantén **solo MetaMask activado**
5. Recarga la página de TravelFund

### Para Firefox:

1. Menú → Add-ons y Temas
2. Click en "Extensiones"
3. **Desactiva** otras wallets
4. Mantén solo MetaMask activado
5. Recarga la página

---

## ✅ Solución 2: Establecer MetaMask como Predeterminado

### En Windows:

1. Abre MetaMask
2. Ve a **Configuración** (⚙️)
3. Busca **"Default wallet"** o **"Wallet predeterminada"**
4. Selecciona **MetaMask**
5. Reinicia el navegador

### Método Alternativo:

1. Desinstala temporalmente otras wallets
2. Usa solo MetaMask durante el desarrollo
3. Reinstala otras wallets después

---

## ✅ Solución 3: Usar Perfiles de Navegador Separados

### Chrome/Brave:

1. Crea un nuevo perfil de navegador:
   - Menú → Configuración → Personas → Agregar
2. En el **nuevo perfil**:
   - Instala **solo MetaMask**
   - No instales otras wallets
3. Usa este perfil solo para desarrollo con TravelFund

**Ventajas:**
- ✅ Sin conflictos entre wallets
- ✅ Configuración limpia solo para desarrollo
- ✅ Puedes mantener tus otras wallets en el perfil principal

---

## 🛠️ Verificar que MetaMask Funciona Correctamente

### 1. Abrir Consola del Navegador:
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña **Console**

### 2. Ejecutar este comando:
```javascript
window.ethereum.isMetaMask
```

**Resultado esperado:**
- ✅ Si devuelve `true` → MetaMask detectado correctamente
- ❌ Si devuelve `undefined` o `false` → MetaMask no está activo

### 3. Verificar proveedores múltiples:
```javascript
window.ethereum.providers?.map(p => ({ 
    isMetaMask: p.isMetaMask, 
    isCoinbase: p.isCoinbaseWallet 
}))
```

**Resultado esperado:**
```javascript
// ✅ CORRECTO - MetaMask primero
[
  { isMetaMask: true, isCoinbase: undefined },
  { isMetaMask: undefined, isCoinbase: true }
]

// ❌ PROBLEMA - Coinbase primero
[
  { isMetaMask: undefined, isCoinbase: true },
  { isMetaMask: true, isCoinbase: undefined }
]
```

---

## 📋 Configuración de Red Hardhat Local en MetaMask

### Paso 1: Abrir MetaMask

1. Click en el icono de MetaMask en tu navegador
2. Ingresa tu contraseña

### Paso 2: Agregar Red Personalizada

1. Click en el selector de red (arriba a la izquierda)
2. Click en **"Agregar red"** o **"Add network"**
3. Click en **"Agregar una red manualmente"**

### Paso 3: Ingresar Datos

Completa con estos valores:

| Campo | Valor |
|-------|-------|
| **Nombre de red** | `Hardhat Local` |
| **Nueva URL de RPC** | `http://127.0.0.1:8545` |
| **ID de cadena** | `31337` |
| **Símbolo de moneda** | `ETH` |
| **URL del explorador de bloques** | (dejar vacío) |

### Paso 4: Guardar

1. Click en **"Guardar"**
2. MetaMask cambiará automáticamente a la red Hardhat Local

---

## 🔑 Importar Cuenta de Prueba

### Cuenta #0 (Creador del Fondo):

**Dirección:**
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Clave Privada:**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Cómo Importar:

1. Abre MetaMask
2. Click en el **icono de cuenta** (círculo de colores arriba a la derecha)
3. Click en **"Importar cuenta"** o **"Import Account"**
4. Selecciona **"Clave privada"** o **"Private Key"**
5. Pega la clave privada de arriba
6. Click en **"Importar"**

### ⚠️ Advertencia de Seguridad:

- 🔴 **NUNCA uses estas claves en mainnet**
- 🔴 **Son solo para pruebas locales**
- 🔴 **No envíes ETH real a estas direcciones**

---

## 🧪 Cuentas Adicionales de Prueba

### Cuenta #1:
```
Dirección: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Clave: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### Cuenta #2:
```
Dirección: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Clave: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

### Cuenta #3:
```
Dirección: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Clave: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

**Cada cuenta tiene 10,000 ETH de prueba** 💰

---

## 🔧 Troubleshooting Común

### Problema: "No se puede conectar a la red"

**Solución:**
1. Verifica que Hardhat node esté corriendo:
   ```powershell
   # Deberías ver: "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545"
   ```
2. Si no está corriendo, ejecuta:
   ```powershell
   npx hardhat node
   ```

### Problema: "Chain ID no coincide"

**Solución:**
1. En MetaMask, ve a Configuración → Redes
2. Edita "Hardhat Local"
3. Verifica que el Chain ID sea exactamente `31337`
4. Guarda los cambios

### Problema: "Transacción fallida - nonce muy alto"

**Solución:**
1. Ve a Configuración → Avanzado
2. Click en **"Reiniciar cuenta"** o **"Reset Account"**
3. Esto limpia el historial de transacciones local
4. Intenta nuevamente

### Problema: "Sin fondos en la cuenta"

**Solución:**
1. Asegúrate de estar en la red **Hardhat Local** (Chain ID 31337)
2. Verifica que importaste la cuenta correcta
3. Si cambiaste de red, Hardhat reinició con nuevas cuentas

---

## 📚 Recursos Adicionales

- **Documentación MetaMask:** https://docs.metamask.io/
- **Hardhat Network:** https://hardhat.org/hardhat-network/
- **Guía completa del proyecto:** `QUICK_START_V2.md`
- **Scripts de inicio:** `START_SCRIPTS.md`

---

## 🎯 Checklist Final

Antes de usar TravelFund, verifica:

- [ ] MetaMask instalado y desbloqueado
- [ ] Otras wallets desactivadas o MetaMask como predeterminado
- [ ] Red "Hardhat Local" agregada (RPC: http://127.0.0.1:8545, Chain ID: 31337)
- [ ] Cuenta de prueba importada
- [ ] Hardhat node corriendo (`npx hardhat node`)
- [ ] Servidor frontend corriendo (`node scripts/server.js`)
- [ ] Navegador abierto en http://localhost:3001/index-v2.html

**¡Listo! Ahora puedes conectar tu wallet y empezar a usar TravelFund V2** 🎉

---

## 💡 Consejo Pro

**Usa el script automático para evitar problemas:**

```powershell
.\start-simple.ps1
```

Este script:
- ✅ Inicia Hardhat node
- ✅ Despliega el contrato
- ✅ Inicia el servidor
- ✅ Abre el navegador
- ✅ Todo en un solo comando

**¡Menos configuración manual = menos errores!** 😎
