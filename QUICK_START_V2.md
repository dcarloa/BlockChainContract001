# 🚀 GUÍA RÁPIDA - TRAVELFUND V2

## ✨ ¿Qué es nuevo en V2?

TravelFund V2 simplifica dramáticamente la experiencia de usuario:

### Características Principales:

1. **👤 Sistema de Nicknames**
   - Ya no necesitas recordar direcciones 0x...
   - Cada usuario elige un alias único (3-32 caracteres)
   - Busca y menciona amigos por su nickname

2. **🎫 Invitaciones**
   - Los fondos privados requieren invitación
   - El creador invita a amigos por nickname o dirección
   - Los invitados deben aceptar antes de participar
   - Límite de 50 miembros por seguridad

3. **🔒 Seguridad Mejorada**
   - Protección contra reentrancy (manual guard)
   - Límite máximo de propuesta: 80% del balance
   - Expiración automática: 30 días
   - Sin DoS: máximo 50 contribuyentes

4. **📊 Metas y Progreso**
   - Define un monto objetivo para el viaje
   - Barra de progreso visual
   - Estadísticas en tiempo real

5. **🎯 Auto-Carga**
   - No necesitas pegar la dirección del contrato manualmente
   - Se carga automáticamente desde contract-info.json
   - Información completa del fondo en una sola llamada

## 🚀 INICIO RÁPIDO

### Opción 1: Script Automático (Recomendado)

```powershell
.\start-v2.ps1
```

Este script hace todo por ti:
- ✅ Compila el contrato
- ✅ Inicia la red local (si no está corriendo)
- ✅ Despliega TravelFundV2 con datos de ejemplo
- ✅ Inicia el servidor frontend (si no está corriendo)
- ✅ Abre el navegador automáticamente

### Opción 2: Manual (Paso a Paso)

#### 1. Compilar
```powershell
npx hardhat compile
```

#### 2. Iniciar Red Local
```powershell
npx hardhat node
```
(Deja esta terminal abierta)

#### 3. Desplegar Contrato (nueva terminal)
```powershell
npx hardhat run scripts/deployTravelFundV2.js --network localhost
```

#### 4. Iniciar Servidor Frontend (nueva terminal)
```powershell
node scripts/server.js
```

#### 5. Abrir Navegador
```
http://localhost:3001/index-v2.html
```

## 🦊 CONFIGURAR METAMASK

### 1. Agregar Red Hardhat Local

- **Nombre de red**: Hardhat Local
- **RPC URL**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Símbolo**: ETH

### 2. Importar Cuentas de Prueba

Hardhat proporciona 20 cuentas con 10,000 ETH cada una.

**Cuenta #0** (Deployer - Alice):
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

**Cuenta #1** (Bob):
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Cuenta #2** (Charlie):
```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

**Cuenta #3** (Diana):
```
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

## 📱 USAR LA APLICACIÓN

### Paso 1: Conectar Wallet

1. Click en "Connect Wallet"
2. MetaMask se abrirá automáticamente
3. Selecciona una cuenta de prueba
4. Acepta la conexión

### Paso 2: Establecer Nickname

1. Ingresa un nickname único (3-32 caracteres)
2. Solo letras y números permitidos
3. Click en "Set Nickname"
4. Confirma la transacción en MetaMask

**Ejemplos de nicknames válidos**:
- ✅ Alice
- ✅ Bob123
- ✅ TravelFan2024
- ❌ A (muy corto)
- ❌ Alice! (caracteres especiales no permitidos)

### Paso 3: Explorar el Fondo

Una vez que tu nickname está establecido, verás:

- 📋 **Información del fondo**: Nombre, descripción, estado
- 📊 **Progreso**: Barra visual hacia la meta
- 💰 **Estadísticas**: Balance, contribuyentes, propuestas
- 👤 **Tu contribución**: Cuánto has depositado

### Paso 4: Invitar Amigos (si eres el creador)

**Pestaña "Invite":**

1. Ingresa el nickname del amigo (ej: "Bob")
   - O su dirección si no tiene nickname
2. Click en "Send Invitation"
3. Confirma en MetaMask

Tu amigo verá una notificación para aceptar la invitación.

### Paso 5: Aceptar Invitación (si fuiste invitado)

1. Verás un banner: "Tienes una invitación pendiente"
2. Click en "Accept Invitation"
3. Confirma en MetaMask
4. ¡Ahora puedes depositar y votar!

### Paso 6: Depositar Fondos

**Pestaña "Deposit":**

1. Ingresa el monto en ETH (ej: 2.5)
2. Click en "Deposit Funds"
3. Confirma en MetaMask
4. Tu contribución se reflejará en tiempo real

### Paso 7: Crear Propuesta

**Pestaña "Propose":**

1. **Destinatario**: Ingresa el nickname del beneficiario (ej: "Bob")
2. **Monto**: Cuánto ETH se pagará (máximo 80% del balance)
3. **Descripción**: Explica para qué es el gasto
4. Click en "Create Proposal"
5. Confirma en MetaMask

**Ejemplo**:
- Destinatario: Bob
- Monto: 4.0 ETH
- Descripción: "Hotel en Cancún - 3 noches todo incluido"

### Paso 8: Votar en Propuestas

**Pestaña "Vote":**

Verás todas las propuestas activas con:
- 📝 Descripción completa
- 💰 Monto solicitado
- 👤 Propuesto por (nickname)
- 🎯 Destinatario (nickname)
- 📊 Votos actuales (a favor / en contra)

**Para votar**:
1. Lee la propuesta cuidadosamente
2. Click en "Vote For" (a favor) o "Vote Against" (en contra)
3. Confirma en MetaMask

**Si tu propuesta fue aprobada**:
- Verás un botón "Execute Proposal"
- Click para ejecutar y transferir los fondos
- El destinatario recibirá el ETH inmediatamente

### Paso 9: Ver Miembros

**Pestaña "Members":**

Verás la lista completa de contribuyentes:
- 👤 Nickname
- 📧 Dirección Ethereum
- 💰 Total contribuido

## 🎯 FLUJO COMPLETO DE EJEMPLO

### Escenario: Viaje a Cancún 2025

1. **Alice crea el fondo**:
   - Nickname: "Alice"
   - Meta: 20 ETH
   - Privado: Sí
   - Deposita: 3 ETH

2. **Alice invita amigos**:
   - Invita a "Bob"
   - Invita a "Charlie"
   - Invita a "Diana"

3. **Amigos aceptan y depositan**:
   - Bob acepta → deposita 2.5 ETH
   - Charlie acepta → deposita 2 ETH
   - Diana acepta → deposita 1.5 ETH
   - **Total**: 9 ETH (45% de la meta)

4. **Bob propone pagar el hotel**:
   - Destinatario: Bob
   - Monto: 4 ETH
   - Descripción: "Hotel en Cancún - 3 noches todo incluido"

5. **Todos votan**:
   - Alice: ✅ A favor
   - Bob: ✅ A favor
   - Charlie: ✅ A favor
   - **Resultado**: 3 votos a favor (75% > 60% requerido) ✅ APROBADA

6. **Bob ejecuta la propuesta**:
   - Click en "Execute Proposal"
   - Bob recibe 4 ETH
   - Balance del fondo: 5 ETH restantes

7. **Diana propone actividades**:
   - Destinatario: Diana
   - Monto: 1.5 ETH
   - Descripción: "Snorkel + Buceo + Equipo"
   - Todos votan...

## ⚠️ ERRORES COMUNES

### "Nickname ya está en uso"
- Alguien más ya tomó ese nickname
- Elige uno diferente

### "Not authorized to participate"
- Fondo privado: necesitas una invitación
- Espera a que el creador te invite

### "El monto excede el 80% del balance"
- Límite de seguridad
- Reduce el monto de la propuesta

### "Proposal expired"
- Las propuestas expiran en 30 días
- Crea una nueva propuesta

### "Fund at maximum capacity (50 members)"
- El fondo alcanzó el límite de seguridad
- No se pueden agregar más miembros

## 🔧 TROUBLESHOOTING

### La transacción falla

1. **Verifica el balance**: ¿Tienes suficiente ETH?
2. **Revisa el gas**: ¿MetaMask estimó correctamente?
3. **Consola del navegador**: Abre DevTools (F12) y busca errores

### No se cargan los datos

1. **Refresh**: F5 en el navegador
2. **Network**: ¿Estás en "Hardhat Local"?
3. **Contrato**: ¿Se desplegó correctamente?

### MetaMask no se conecta

1. **Desbloquea MetaMask**: Ingresa tu contraseña
2. **Red correcta**: Chain ID 31337
3. **Reinicia MetaMask**: Cierra y abre la extensión

## 📚 RECURSOS ADICIONALES

### Documentación Completa

- **GuiaDetallada.txt**: Explicación técnica completa
  - Arquitectura del sistema
  - Smart contract línea por línea
  - Integración con MetaMask
  - 10 problemas comunes resueltos

- **SecurityAudit.txt**: Auditoría de seguridad
  - Score: 7.5/10
  - Vulnerabilidades analizadas
  - Mejoras implementadas en V2
  - Vectores de ataque probados

### Código Fuente

- **TravelFundV2.sol**: Smart contract (700+ líneas)
- **app-v2.js**: Frontend Web3 logic
- **index-v2.html**: Interfaz de usuario

### Cuentas de Prueba

Usa cualquiera de estas 20 cuentas (cada una con 10,000 ETH):

```
Account #0:  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Alice)
Account #1:  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Bob)
Account #2:  0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC (Charlie)
Account #3:  0x90F79bf6EB2c4f870365E785982E1f101E93b906 (Diana)
Account #4-19: Ver output de `npx hardhat node`
```

## 💡 CONSEJOS Y MEJORES PRÁCTICAS

### Nicknames

- ✅ Cortos y memorables
- ✅ Sin espacios ni caracteres especiales
- ✅ Representativos (tu nombre o apodo)

### Propuestas

- 📝 Descripción clara y detallada
- 💰 Monto razonable (no todo el balance)
- 🗣️ Comunica con el grupo antes de proponer

### Votación

- 🤔 Revisa cada propuesta cuidadosamente
- 💬 Discute con el grupo
- ⏰ Vota antes de que expire (30 días)

### Seguridad

- 🔐 Nunca compartas tu clave privada
- 🧪 Solo usa estas claves en Hardhat Local (testnet)
- ⚠️ NO uses estas claves en mainnet

## 🎉 ¡DISFRUTA TU VIAJE!

TravelFund V2 hace que organizar viajes en grupo sea:
- ✅ Transparente
- ✅ Democrático
- ✅ Seguro
- ✅ Fácil de usar

¿Preguntas? Revisa:
- docs/GuiaDetallada.txt
- docs/SecurityAudit.txt

---

**Hecho con ❤️ usando Ethereum, Hardhat & Solidity**
