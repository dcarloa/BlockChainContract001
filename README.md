# 💰 SplitExpense - Gestor de Gastos Compartidos en Blockchain

¡Bienvenido! **SplitExpense** es una plataforma descentralizada para gestionar gastos compartidos en grupo, similar a Splitwise pero construida sobre Ethereum.

**🌐 Producción:**
- Primary: https://antpool.cloud
- Secondary: https://blockchaincontract001.web.app
- **🛡️ Admin Dashboard**: https://blockchaincontract001.web.app/admin-dashboard.html
- **⚙️ Admin Setup**: https://blockchaincontract001.web.app/admin-setup.html

## 🎯 ¿Qué es SplitExpense?

Una plataforma para administrar gastos compartidos de forma transparente y justa:
- 🌴 **Viajes grupales** - Administra gastos de hoteles, comidas, actividades
- 🏠 **Roommates** - Comparte gastos de renta, servicios, compras
- 🎉 **Eventos** - Organiza gastos de fiestas, reuniones, cenas
- 💼 **Proyectos** - Administra gastos de equipos de trabajo
- 🤝 **Cualquier gasto compartido** - Mantén todo transparente y justo

## ✨ Características Principales

- 💰 **Bote Común**: Todos aportan a un fondo compartido
- 📝 **Propuestas de Gasto**: Cualquier miembro propone pagar del bote a proveedores externos
- 🗳️ **Votación Democrática**: El grupo vota si aprueba o rechaza usar el dinero del bote
- 💸 **Pagos Directos**: Si se aprueba, el dinero se envía del bote directo al proveedor
- ⚖️ **Balances Automáticos**: Cálculo automático de quién debe aportar más al bote
- 🔐 **Transparencia Blockchain**: Todos los gastos inmutables y verificables
- 👥 **Grupos Ilimitados**: Crea grupos para diferentes propósitos
- 🎯 **Meta Opcional**: Define presupuesto o déjalo libre
- 💳 **Liquidaciones Rápidas**: Botón para saldar deudas en un clic

### 🚀 Inicio Rápido

```powershell
.\start-platform-clean.ps1
```

Este script automáticamente:
1. Compila los contratos
2. Inicia Hardhat Network local
3. Despliega el Factory y sistema completo
4. Inicia el servidor frontend
5. Abre el navegador en http://localhost:3001

### 📖 Documentación

- **Inicio rápido**: `QUICK_START_V2.md`
- **Guía detallada**: `docs/GuiaDetallada.txt`
- **Auditoría de seguridad**: `docs/SecurityAudit.txt`
- **Smart contracts**: `contracts/` (FundFactory.sol, TravelFundV2.sol)

---

## 💡 Cómo Funciona

### 1. Crea un Grupo
```
Ejemplo: "Viaje Cancún 2025"
Tipo: Viaje
Miembros: Privado (con invitaciones)
Meta: 0 ETH (opcional - sin límite de gastos)
```

### 2. Todos Aportan al Bote Común
```
Alice aporta: 3 ETH
Bob aporta: 2.5 ETH
Charlie aporta: 2 ETH
Diana aporta: 1.5 ETH
Total en bote: 9 ETH
```

### 3. Propón Pagar a Proveedores
```
Bob propone: "Pagar 4 ETH al Hotel Marriott (0x123...)"
El grupo vota si aprueba usar el dinero del bote
Si se aprueba → 4 ETH se envían directo del bote al hotel
```

### 4. Ve los Balances
```
Sistema calcula automáticamente:
Parte justa = Total gastado / Número de miembros
Balance = Lo que aportaste - Tu parte justa
```

### 5. Liquida Deudas (Si es necesario)
```
Si tu balance es negativo (gastaste más de tu parte justa)
Usa el botón "Liquidar deuda"
Aporta dinero adicional al bote común
```

## 🛠️ Requisitos Previos

- **Node.js** (versión 16 o superior) - [Descargar aquí](https://nodejs.org/)
- **VS Code** (ya lo tienes instalado)
- Conocimientos básicos de programación (cualquier lenguaje)

## 📚 Paso 1: Instalar las Dependencias

El proyecto ya está configurado con Hardhat. Solo necesitas instalar las dependencias:

```powershell
npm install
```

Esto instalará:
- Hardhat (framework de desarrollo)
- Herramientas de testing
- Librerías de Ethereum

## 📝 Paso 2: Tu Primer Smart Contract - HelloWorld

Navega a `contracts/HelloWorld.sol` y verás tu primer contrato:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HelloWorld {
    string public message;
    
    constructor(string memory initialMessage) {
        message = initialMessage;
    }
    
    function setMessage(string memory newMessage) public {
        message = newMessage;
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}
```

### 🔍 Explicación del Código:

1. **`pragma solidity ^0.8.19;`** - Especifica la versión de Solidity
2. **`contract HelloWorld`** - Define el contrato (como una clase en otros lenguajes)
3. **`string public message`** - Variable de estado que se almacena en la blockchain
4. **`constructor`** - Se ejecuta una sola vez al desplegar el contrato
5. **`function setMessage`** - Modifica el estado (requiere gas)
6. **`function getMessage`** - Solo lee el estado (no requiere gas)

## 🧪 Paso 3: Compilar el Contrato

```powershell
npx hardhat compile
```

Esto genera los archivos de bytecode que se desplegarán en la blockchain.

## ✅ Paso 4: Probar el Contrato

Navega a `test/HelloWorld.test.js` y ejecuta:

```powershell
npx hardhat test
```

Verás que todas las pruebas pasan. ¡Tu contrato funciona!

## 🚀 Paso 5: Desplegar Localmente

### 5.1 Iniciar una blockchain local

```powershell
npx hardhat node
```

Esto crea una blockchain local con 20 cuentas de prueba.

### 5.2 Desplegar el contrato (en otra terminal)

```powershell
npx hardhat run scripts/deploy.js --network localhost
```

¡Felicidades! Tu contrato está desplegado en tu blockchain local.

## 🪙 Paso 6: Smart Contract Intermedio - Token Simple

En `contracts/SimpleToken.sol` encontrarás un contrato más avanzado que crea un token:

```solidity
// Un token básico que puedes enviar a otras direcciones
```

Este contrato te enseña:
- Mapeos (como diccionarios)
- Eventos (logs en la blockchain)
- Control de permisos
- Aritmética segura

## 🌐 Paso 7: Desplegar en una Red de Prueba (Testnet)

### 7.1 Obtener Ether de prueba

1. Instala MetaMask: https://metamask.io/
2. Cambia a la red "Sepolia Test Network"
3. Obtén ETH gratis en: https://sepoliafaucet.com/

### 7.2 Configurar tu clave privada

Crea un archivo `.env` (¡NUNCA lo subas a Git!):

```
PRIVATE_KEY=tu_clave_privada_aquí
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/tu_api_key
```

### 7.3 Desplegar en Sepolia

```powershell
npx hardhat run scripts/deploy.js --network sepolia
```

## 📖 Conceptos Importantes

### Gas
- Cada operación en Ethereum cuesta "gas"
- Leer datos es gratis, escribir datos cuesta ETH
- Contratos más complejos = más gas

### Tipos de Funciones
- **`view`**: Solo lee, no modifica estado (gratis)
- **`pure`**: No lee ni modifica estado (gratis)
- **Sin modificador**: Modifica el estado (cuesta gas)

### Visibilidad
- **`public`**: Cualquiera puede llamar la función
- **`private`**: Solo dentro del contrato
- **`internal`**: Contrato y contratos herederos
- **`external`**: Solo desde fuera del contrato

## 🎯 Próximos Pasos

1. ✅ Completa los tutoriales de este proyecto
2. 📚 Aprende sobre:
   - Eventos y logs
   - Herencia de contratos
   - Interfaces
   - Librerías
3. 🔐 Estudia seguridad:
   - Reentrancy attacks
   - Integer overflow/underflow
   - Access control
4. 🌟 Proyectos para practicar:
   - Sistema de votación
   - Subastas
   - NFTs básicos
   - Crowdfunding

## 📚 Recursos Recomendados

- [Documentación oficial de Solidity](https://docs.soliditylang.org/)
- [CryptoZombies](https://cryptozombies.io/) - Tutorial interactivo
- [Ethernaut](https://ethernaut.openzeppelin.com/) - Juegos de seguridad
- [OpenZeppelin](https://www.openzeppelin.com/) - Contratos seguros y auditados

## 🛡️ Panel de Administración

### Acceso al Dashboard
1. **Primera vez**: Visita https://blockchaincontract001.web.app/admin-setup.html
2. Inicia sesión con tu cuenta
3. Copia tu UID o haz clic en "Agregarme como Admin"
4. Accede al dashboard: https://blockchaincontract001.web.app/admin-dashboard.html

### Métricas Disponibles
- 👥 **Usuarios**: Total, activos (7d), crecimiento mensual
- 🏘️ **Grupos**: Total, nuevos por semana, tipos
- 💰 **Transacciones**: Total, volumen, por moneda
- 🐜 **Colonias**: Activas, cofres abiertos
- 🎭 **Mascotas**: Activas, nivel promedio
- 📊 **Gráficos**: Crecimiento de usuarios, volumen de transacciones, distribución de monedas

### Documentación Completa
Ver `frontend/ADMIN_DASHBOARD.md` para instrucciones detalladas de configuración y uso.

## ⚠️ Advertencias de Seguridad

- 🔴 NUNCA compartas tu clave privada
- 🔴 NUNCA despliegues en mainnet sin auditoría
- 🔴 Siempre usa redes de prueba primero
- 🔴 Agrega `.env` a tu `.gitignore`

## 💡 Consejos

- Empieza con contratos simples
- Lee mucho código de otros desarrolladores
- Participa en la comunidad
- Practica, practica, practica

## 🐛 Problemas Comunes

**Error: "Cannot find module"**
```powershell
npm install
```

**Error de gas**
- Aumenta el gas limit en hardhat.config.js

**Contrato no se despliega**
- Verifica que tengas suficiente ETH de prueba
- Revisa la configuración de red

---

¡Buena suerte en tu viaje por el desarrollo de smart contracts! 🚀
