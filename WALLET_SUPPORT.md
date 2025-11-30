# 🔌 Multi-Wallet Support - SplitExpense

## Wallets Soportadas

SplitExpense soporta múltiples wallets para dar la mejor experiencia a todos los usuarios, tanto en desktop como móvil.

### 🖥️ **Desktop (Navegador)**

#### 1. **MetaMask** 🦊
- **Instalación**: [metamask.io](https://metamask.io/download/)
- **Plataformas**: Chrome, Firefox, Brave, Edge
- **Detección**: Automática si está instalada
- **Conexión**: Click en "MetaMask" → Aprobar en extensión

#### 2. **Coinbase Wallet** 🔵
- **Instalación**: [wallet.coinbase.com](https://www.coinbase.com/wallet)
- **Plataformas**: Chrome, Firefox, Brave, Edge
- **Detección**: Automática si está instalada
- **Conexión**: Click en "Coinbase Wallet" → Aprobar en extensión
- **Nota**: También funciona como "Base Wallet"

---

### 📱 **Móvil (iOS & Android)**

#### 1. **MetaMask Mobile** 🦊
- **Instalación**: 
  - iOS: [App Store](https://apps.apple.com/app/metamask/id1438144202)
  - Android: [Play Store](https://play.google.com/store/apps/details?id=io.metamask)
- **Conexión**: 
  - Opción A: Abrir app → Navegar a la dApp
  - Opción B: Click "MetaMask Mobile" → Abre la app automáticamente
- **Deep Link**: Sí ✅

#### 2. **Coinbase Wallet Mobile** 🔵
- **Instalación**:
  - iOS: [App Store](https://apps.apple.com/app/coinbase-wallet/id1278383455)
  - Android: [Play Store](https://play.google.com/store/apps/details?id=org.toshi)
- **Conexión**:
  - Opción A: Abrir app → Navegar a la dApp
  - Opción B: Click "Coinbase Wallet" → Abre la app automáticamente
- **Deep Link**: Sí ✅
- **Ventajas**: Integración nativa con Base network

#### 3. **WalletConnect** 📱
- **Compatibilidad**: Funciona con cualquier wallet que soporte WalletConnect
- **Conexión**: Escanear código QR con tu wallet móvil
- **Wallets soportadas**: Trust Wallet, Rainbow, Argent, y 100+ más

---

## 🔄 Cómo Funciona

### En Desktop:
```
Usuario click "Conectar Wallet"
    ↓
Se abre modal con wallets detectadas
    ↓
Usuario selecciona su wallet preferida
    ↓
Se abre popup de la extensión
    ↓
Usuario aprueba conexión
    ↓
✅ Conectado!
```

### En Móvil:
```
Usuario click "Conectar Wallet"
    ↓
Se abre modal con opciones móviles
    ↓
Usuario elige:
    A) MetaMask Mobile → Abre app directamente
    B) Coinbase Wallet → Abre app directamente
    C) WalletConnect → Escanea QR con cualquier wallet
    ↓
✅ Conectado!
```

---

## 🎯 Detección Automática

El sistema detecta automáticamente:

- ✅ Si estás en desktop o móvil
- ✅ Qué wallets tienes instaladas
- ✅ Si tienes múltiples wallets (muestra todas)
- ✅ La red actual de tu wallet

---

## 🔐 Seguridad

- **Sin custodia**: Tu wallet siempre bajo tu control
- **Permisos claros**: Solo pides lo necesario
- **Open source**: Código verificable en GitHub
- **Sin claves privadas**: Nunca pedimos ni almacenamos tus claves

---

## 🌐 Redes Soportadas

### Actual (Desarrollo):
- **Hardhat Local**: Chain ID 31337

### Próximamente (Producción):
- **Base Sepolia** (Testnet): Chain ID 84532
- **Base Mainnet**: Chain ID 8453
- **Polygon PoS**: Chain ID 137

---

## 📖 Guías de Usuario

### Primera Vez con Wallets

Si nunca has usado una wallet crypto:

1. **Instala MetaMask** (más fácil para principiantes):
   - Desktop: [metamask.io/download](https://metamask.io/download/)
   - Móvil: Busca "MetaMask" en App Store / Play Store

2. **Crea tu wallet**:
   - Sigue el wizard de configuración
   - **MUY IMPORTANTE**: Guarda tu frase de recuperación en lugar seguro
   - Nunca compartas tu frase con nadie

3. **Conecta a SplitExpense**:
   - Ve a [blockchaincontract001.web.app](https://blockchaincontract001.web.app)
   - Click "Lanzar App"
   - Click "Conectar Wallet"
   - Selecciona MetaMask
   - Aprueba la conexión

### Usando en Móvil

**Opción Recomendada: MetaMask Mobile**

1. Instala MetaMask Mobile
2. Abre la app
3. En el navegador interno de MetaMask, ve a:
   ```
   blockchaincontract001.web.app/app.html
   ```
4. La wallet se conectará automáticamente

**Alternativa: WalletConnect**

1. Abre SplitExpense en tu navegador móvil
2. Click "Conectar Wallet" → "WalletConnect"
3. Escanea el QR con tu wallet
4. Aprueba la conexión

---

## 🛠️ Para Desarrolladores

### Agregar Soporte para Nueva Wallet

Edita `frontend/wallet-connector.js`:

```javascript
// En detectWallets()
if (window.ethereum.isTuWallet) {
    wallets.push({
        id: 'tuwallet',
        name: 'Tu Wallet',
        icon: '🎨',
        detected: true,
        provider: window.ethereum
    });
}
```

### Testing

```javascript
// En consola del navegador
console.log(window.walletConnector.supportedWallets);
// Ver wallets detectadas

await window.connectWallet();
// Abrir selector de wallet
```

---

## ❓ FAQ

### ¿Por qué no veo mi wallet?

Si tu wallet no aparece, verifica:
- ✅ Está instalada la extensión/app
- ✅ Está desbloqueada
- ✅ Refresca la página (F5)
- ✅ Usa WalletConnect como fallback

### ¿Puedo usar múltiples wallets?

Sí, pero solo una a la vez. Para cambiar:
1. Desconecta la wallet actual
2. Refresca la página
3. Conecta con otra wallet

### ¿Es seguro conectar mi wallet?

Sí. Solo solicitas permisos de lectura inicialmente. Para transacciones, siempre aprobarás cada una en tu wallet.

### ¿Qué pasa si cambio de cuenta en mi wallet?

La app detectará el cambio y actualizará automáticamente. Puede que necesites refrescar la página.

---

## 📞 Soporte

Si tienes problemas conectando tu wallet:

1. **Verifica**: Wallet instalada y desbloqueada
2. **Red**: Estás en la red correcta (Hardhat Local o Base)
3. **Browser**: Usa Chrome, Firefox, Brave o Edge
4. **Logs**: Abre consola (F12) y busca errores
5. **Issues**: [GitHub Issues](https://github.com/dcarloa/BlockChainContract001/issues)

---

**Última actualización**: Noviembre 2025
