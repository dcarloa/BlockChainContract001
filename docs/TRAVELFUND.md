# 🧳 TravelFund - Fondo de Viaje Compartido

## 📋 ¿Qué es TravelFund?

**TravelFund** es un smart contract que permite a un grupo de amigos gestionar un fondo común para gastos de viaje de forma **descentralizada, transparente y democrática**.

Ningún amigo tiene control total del dinero: **todos deciden juntos** qué gastos aprobar mediante votación on-chain.

## 🎯 Características Principales

✅ **Control Compartido**: Ninguna persona tiene poder absoluto sobre los fondos
✅ **Transparencia Total**: Todos los depósitos, propuestas y votos están en la blockchain
✅ **Votación Democrática**: Los gastos se aprueban por mayoría configurable
✅ **Seguridad**: Fondos protegidos por smart contract inmutable
✅ **Flexibilidad**: Cierre del fondo y retiro proporcional si se cancela el viaje

## 🏗️ Arquitectura del Contrato

### **Roles**

1. **Creador del Fondo**: Quien despliega el contrato. Puede cerrar el fondo.
2. **Contribuyentes**: Cualquiera que deposite ETH. Pueden:
   - Crear propuestas de gasto
   - Votar en propuestas
   - Retirar fondos proporcionales si se cierra

### **Flujo de Trabajo**

```
1. CREAR FONDO
   ↓
2. AMIGOS DEPOSITAN → Se convierten en contribuyentes
   ↓
3. CREAR PROPUESTA → "Pagar hotel X cantidad"
   ↓
4. VOTACIÓN → Cada contribuyente vota ✅ o ❌
   ↓
5. APROBACIÓN → Si se alcanza el umbral (ej: 60%)
   ↓
6. EJECUCIÓN → Los fondos se transfieren al destinatario
   ↓
7. (Opcional) CERRAR FONDO → Retiros proporcionales
```

## 🚀 Cómo Usar

### **1. Desplegar el Contrato**

```javascript
// Compilar
npx hardhat compile

// Desplegar en red local
npx hardhat node  // Terminal 1
npx hardhat run scripts/deployTravelFund.js --network localhost  // Terminal 2

// Desplegar en testnet (Sepolia)
npx hardhat run scripts/deployTravelFund.js --network sepolia
```

**Parámetros del constructor:**
- `tripName`: Nombre del viaje (ej: "Viaje a Cancún 2025")
- `approvalPercentage`: % de votos necesarios (1-100, recomendado: 60)
- `minimumVotes`: Número mínimo de votos (recomendado: 2)

### **2. Depositar Fondos**

Cualquier persona puede depositar ETH y convertirse en contribuyente:

```javascript
// Opción 1: Usando la función deposit()
await travelFund.deposit({ value: ethers.parseEther("2.5") });

// Opción 2: Enviando ETH directamente
await signer.sendTransaction({
  to: travelFundAddress,
  value: ethers.parseEther("2.5")
});
```

### **3. Crear una Propuesta de Gasto**

Solo los contribuyentes pueden crear propuestas:

```javascript
await travelFund.createProposal(
  "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",  // Dirección destinatario
  ethers.parseEther("3"),                         // Monto (3 ETH)
  "Hotel Cancún - 3 noches + desayuno"           // Descripción
);
```

### **4. Votar en una Propuesta**

Cada contribuyente puede votar una sola vez:

```javascript
// Votar a favor
await travelFund.vote(1, true);

// Votar en contra
await travelFund.vote(1, false);
```

La propuesta se aprueba automáticamente si alcanza el umbral configurado.

### **5. Ejecutar una Propuesta Aprobada**

Una vez aprobada, cualquiera puede ejecutarla:

```javascript
await travelFund.executeProposal(1);
```

Esto transfiere los fondos al destinatario especificado.

### **6. Cerrar el Fondo (Opcional)**

Si el viaje se cancela, el creador puede cerrar el fondo:

```javascript
// Solo el creador puede hacer esto
await travelFund.closeFund();
```

### **7. Retirar Fondos Proporcionales**

Después del cierre, cada contribuyente puede retirar su parte:

```javascript
await travelFund.withdrawProportional();
```

Cada uno recibe una cantidad proporcional a su contribución inicial.

## 📊 Funciones de Consulta

```javascript
// Ver balance del fondo
await travelFund.getBalance();

// Ver contribuyentes
await travelFund.getContributors();

// Ver número de contribuyentes
await travelFund.getContributorCount();

// Ver mi contribución
await travelFund.contributions(myAddress);

// Ver detalles de una propuesta
await travelFund.getProposal(1);

// Verificar si alguien votó
await travelFund.hasVoted(1, address);

// Calcular votos faltantes para aprobar
await travelFund.votesNeededForApproval(1);

// Ver mi parte proporcional
await travelFund.getMyProportionalShare();
```

## 💡 Ejemplos de Uso

### **Escenario 1: Viaje a Cancún (4 amigos)**

```javascript
// 1. Desplegar el fondo
const TravelFund = await ethers.getContractFactory("TravelFund");
const fund = await TravelFund.deploy("Cancún 2025", 60, 2);

// 2. Los amigos depositan
await fund.connect(friend1).deposit({ value: ethers.parseEther("5") });
await fund.connect(friend2).deposit({ value: ethers.parseEther("4") });
await fund.connect(friend3).deposit({ value: ethers.parseEther("3") });
await fund.connect(friend4).deposit({ value: ethers.parseEther("3") });
// Total: 15 ETH

// 3. Propuesta: Pagar hotel
await fund.connect(friend1).createProposal(
  hotelAddress,
  ethers.parseEther("6"),
  "Hotel Cancún - 3 noches"
);

// 4. Votación (necesitan 60% = 3 de 4)
await fund.connect(friend1).vote(1, true);
await fund.connect(friend2).vote(1, true);
await fund.connect(friend3).vote(1, true);
// ✅ Aprobada automáticamente

// 5. Ejecutar
await fund.executeProposal(1);
// Hotel recibe 6 ETH, quedan 9 ETH

// 6. Segunda propuesta: Tours
await fund.connect(friend2).createProposal(
  tourOperatorAddress,
  ethers.parseEther("4"),
  "Tours Chichen Itza + Cenote"
);

// 7. Votación y ejecución...
```

### **Escenario 2: Viaje Cancelado**

```javascript
// Si el viaje se cancela antes de gastar todo:
await fund.connect(creator).closeFund();

// Cada amigo retira su parte proporcional:
await fund.connect(friend1).withdrawProportional();
await fund.connect(friend2).withdrawProportional();
// etc.

// Si se depositó 15 ETH y se gastó 6 ETH:
// Quedan 9 ETH para dividir proporcionalmente
// Friend1 depositó 5/15 = 33.33% → recibe ~3 ETH
// Friend2 depositó 4/15 = 26.67% → recibe ~2.4 ETH
```

## 🔐 Seguridad y Mejores Prácticas

### ✅ **Lo que el contrato HACE:**

- Protege los fondos con votación democrática
- Previene retiros no autorizados
- Registra todas las transacciones en la blockchain
- Permite transparencia total

### ⚠️ **Consideraciones Importantes:**

1. **Configuración inicial crítica**:
   - Elige un `approvalPercentage` razonable (50-70%)
   - El `minimumVotes` evita que una propuesta se apruebe con muy pocos votos

2. **Confianza en destinatarios**:
   - Verifica siempre la dirección del destinatario
   - Considera usar contratos verificados para hoteles/servicios

3. **No es reversible**:
   - Una vez ejecutada una propuesta, no se puede revertir
   - Asegúrate de que todos voten conscientemente

4. **Gas costs**:
   - Cada acción (depósito, voto, ejecución) cuesta gas
   - Considera esto al calcular presupuesto

### 🛡️ **Protecciones Implementadas:**

- ✅ Solo contribuyentes pueden crear propuestas y votar
- ✅ Prevención de doble voto
- ✅ Verificación de saldo antes de aprobar propuestas
- ✅ Re-entrancy protection con patrón checks-effects-interactions
- ✅ Validaciones de direcciones y montos

## 🧪 Testing

El contrato incluye tests exhaustivos:

```bash
npx hardhat test test/TravelFund.test.js
```

**Tests cubiertos:**
- ✅ Despliegue y configuración
- ✅ Depósitos múltiples
- ✅ Creación de propuestas
- ✅ Votación y aprobación
- ✅ Ejecución de gastos
- ✅ Cierre y retiros proporcionales
- ✅ Escenarios completos end-to-end

## 📈 Casos de Uso Reales

### **1. Viaje entre amigos**
Grupo de amigos ahorra para vacaciones y gestiona gastos democráticamente.

### **2. Retiro corporativo**
Equipo de trabajo organiza un retiro y gestiona el presupuesto de forma transparente.

### **3. Evento familiar**
Familia organiza reunión familiar y cada quien aporta para gastos comunes.

### **4. Viaje de estudios**
Grupo de estudiantes ahorra y decide gastos para un viaje académico.

## 🔄 Posibles Mejoras Futuras

Ideas para extender el contrato:

1. **Límites de tiempo**: Propuestas expiran después de X días
2. **Veto del creador**: Opción de veto en casos específicos
3. **Múltiples niveles de aprobación**: Gastos pequeños vs grandes
4. **Integración con stablecoins**: Usar USDC/USDT en lugar de ETH
5. **NFT de membresía**: Emitir NFT a cada contribuyente
6. **Sistema de reembolsos**: Reembolsar a alguien que pagó por adelantado
7. **Propuestas recurrentes**: Para gastos periódicos

## 📚 Recursos Adicionales

- [Documentación de Hardhat](https://hardhat.org/docs)
- [Guía de Solidity](https://docs.soliditylang.org/)
- [Conceptos de DAO](https://ethereum.org/en/dao/)
- [Seguridad en Smart Contracts](../docs/SEGURIDAD.md)

## 🤝 Contribuir

¿Ideas para mejorar TravelFund? ¡Contribuciones son bienvenidas!

## ⚖️ Licencia

MIT License - Úsalo libremente para tus proyectos

---

💡 **Tip**: Prueba primero en una testnet (Sepolia) antes de usar con dinero real en mainnet.

🎉 **¡Disfruta tu viaje con transparencia y democracia en la blockchain!**
