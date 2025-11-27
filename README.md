# 🚀 Aprende Solidity - Tu Primer Smart Contract en Ethereum

¡Bienvenido! Este proyecto te guiará paso a paso para crear y desplegar tu primer smart contract en Ethereum.

## ⭐ NUEVO: TravelFund V2 - UX Simplificada

**TravelFund V2** es una versión mejorada con:
- 👤 **Sistema de Nicknames**: Usa alias en lugar de direcciones 0x...
- 🎫 **Invitaciones**: Sistema de acceso por invitación para fondos privados
- 🔒 **Seguridad mejorada**: Protección contra reentrancy, límites de contribuyentes
- 📊 **Mejor UI**: Auto-carga del contrato, sin configuración manual
- 📈 **Metas de fundraising**: Tracking de progreso hacia objetivo

### 🚀 Inicio Rápido V2

```powershell
.\start-v2.ps1
```

Este script automáticamente:
1. Compila el contrato TravelFundV2
2. Inicia la red local de Hardhat
3. Despliega el contrato con datos de ejemplo
4. Inicia el servidor frontend
5. Abre el navegador en http://localhost:3001/index-v2.html

### 📖 Documentación Completa

- **Guía detallada**: `docs/GuiaDetallada.txt` (1500+ líneas)
- **Auditoría de seguridad**: `docs/SecurityAudit.txt`
- **Contratos**: `contracts/TravelFundV2.sol` (700+ líneas)

---

## 📋 ¿Qué es un Smart Contract?

Un smart contract es un programa que se ejecuta en la blockchain de Ethereum. Es como un contrato tradicional, pero automático y descentralizado. Una vez desplegado, nadie puede modificarlo ni detenerlo.

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
