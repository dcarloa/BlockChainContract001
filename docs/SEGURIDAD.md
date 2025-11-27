# 🔐 Guía de Seguridad para Smart Contracts

## ⚠️ Vulnerabilidades Comunes

### 1. Reentrancy Attack

**El Problema:**
Un contrato malicioso puede llamar recursivamente a tu función antes de que termine de ejecutarse.

**Ejemplo Vulnerable:**

```solidity
// ❌ VULNERABLE
contract VulnerableBank {
    mapping(address => uint) public balances;
    
    function withdraw(uint amount) public {
        require(balances[msg.sender] >= amount);
        
        // PELIGRO: Llamada externa antes de actualizar el estado
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        
        balances[msg.sender] -= amount;  // Llega tarde
    }
}

// Atacante puede llamar withdraw() recursivamente
```

**Solución: Checks-Effects-Interactions Pattern**

```solidity
// ✅ SEGURO
contract SecureBank {
    mapping(address => uint) public balances;
    
    function withdraw(uint amount) public {
        // 1. Checks (validaciones)
        require(balances[msg.sender] >= amount, "Balance insuficiente");
        
        // 2. Effects (actualizar estado ANTES de interactuar)
        balances[msg.sender] -= amount;
        
        // 3. Interactions (llamadas externas al final)
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
    }
}
```

**Mejor Solución: ReentrancyGuard de OpenZeppelin**

```solidity
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BankWithGuard is ReentrancyGuard {
    mapping(address => uint) public balances;
    
    function withdraw(uint amount) public nonReentrant {
        require(balances[msg.sender] >= amount);
        balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}
```

### 2. Integer Overflow/Underflow

**El Problema (Solidity < 0.8.0):**

```solidity
// En Solidity < 0.8.0
uint8 numero = 255;
numero = numero + 1;  // Resulta en 0 (overflow)

uint8 numero2 = 0;
numero2 = numero2 - 1;  // Resulta en 255 (underflow)
```

**Solución en Solidity 0.8.0+:**

```solidity
// ✅ Solidity 0.8.0+ protege automáticamente
uint8 numero = 255;
numero++;  // Revierte automáticamente con error
```

**Solución en versiones antiguas:**

```solidity
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract OldVersion {
    using SafeMath for uint256;
    
    uint256 public value;
    
    function add(uint256 amount) public {
        value = value.add(amount);  // Seguro con SafeMath
    }
}
```

### 3. Access Control

**El Problema:**

```solidity
// ❌ Sin protección
contract Vulnerable {
    address public owner;
    
    function changeOwner(address newOwner) public {
        owner = newOwner;  // ¡Cualquiera puede cambiar el dueño!
    }
}
```

**Soluciones:**

```solidity
// ✅ OPCIÓN 1: Modifier manual
contract WithModifier {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "No eres el dueno");
        _;
    }
    
    function changeOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}

// ✅ OPCIÓN 2: OpenZeppelin Ownable
import "@openzeppelin/contracts/access/Ownable.sol";

contract WithOwnable is Ownable {
    function changeSettings() public onlyOwner {
        // Solo el dueño puede ejecutar esto
    }
}
```

### 4. Delegatecall Vulnerability

**El Problema:**
`delegatecall` ejecuta código en el contexto del contrato llamador.

```solidity
// ❌ PELIGROSO
contract Vulnerable {
    address public owner;
    
    function callExternal(address target, bytes memory data) public {
        // El contrato externo puede modificar nuestras variables
        target.delegatecall(data);
    }
}
```

**Solución:**

```solidity
// ✅ Evita delegatecall a menos que sepas exactamente qué hace
// Si es necesario, usa whitelisting
contract Safe {
    mapping(address => bool) public trustedContracts;
    
    function safeDelegateCall(address target, bytes memory data) public {
        require(trustedContracts[target], "Contrato no confiable");
        target.delegatecall(data);
    }
}
```

### 5. Front-Running

**El Problema:**
Los mineros pueden ver transacciones pendientes y ejecutar las suyas primero.

**Mitigaciones:**

```solidity
// Commit-Reveal Pattern
contract CommitReveal {
    mapping(address => bytes32) public commits;
    
    // Fase 1: Commit (enviar hash)
    function commit(bytes32 hash) public {
        commits[msg.sender] = hash;
    }
    
    // Fase 2: Reveal (revelar valor después)
    function reveal(uint value, bytes32 salt) public {
        require(keccak256(abi.encodePacked(value, salt)) == commits[msg.sender]);
        // Usar valor de forma segura
    }
}
```

### 6. Denial of Service (DoS)

**El Problema:**

```solidity
// ❌ VULNERABLE a DoS
contract VulnerableAuction {
    address public highestBidder;
    uint public highestBid;
    
    function bid() public payable {
        require(msg.value > highestBid);
        
        // Si esto falla, la función entera falla
        payable(highestBidder).transfer(highestBid);
        
        highestBidder = msg.sender;
        highestBid = msg.value;
    }
}
```

**Solución: Pull over Push Pattern**

```solidity
// ✅ SEGURO
contract SecureAuction {
    address public highestBidder;
    uint public highestBid;
    mapping(address => uint) public pendingReturns;
    
    function bid() public payable {
        require(msg.value > highestBid);
        
        // Guardar para que retiren después
        if (highestBidder != address(0)) {
            pendingReturns[highestBidder] += highestBid;
        }
        
        highestBidder = msg.sender;
        highestBid = msg.value;
    }
    
    function withdraw() public {
        uint amount = pendingReturns[msg.sender];
        require(amount > 0);
        
        pendingReturns[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }
}
```

## 🛠️ Herramientas de Seguridad

### 1. Slither (Análisis Estático)

```powershell
pip install slither-analyzer
slither .
```

### 2. Mythril (Análisis Simbólico)

```powershell
pip install mythril
myth analyze contracts/MyContract.sol
```

### 3. Echidna (Fuzzing)

Pruebas aleatorias para encontrar vulnerabilidades.

### 4. Tenderly

Plataforma para debugging y monitoreo de contratos.

## ✅ Checklist de Seguridad

Antes de desplegar en mainnet:

- [ ] ¿Usas Solidity 0.8.0 o superior?
- [ ] ¿Implementaste checks-effects-interactions?
- [ ] ¿Protegiste funciones críticas con access control?
- [ ] ¿Usaste ReentrancyGuard en funciones que transfieren ETH?
- [ ] ¿Validaste todas las entradas con require?
- [ ] ¿Evitaste usar tx.origin para autenticación?
- [ ] ¿Manejaste correctamente address(0)?
- [ ] ¿Implementaste límites de gas razonables?
- [ ] ¿Probaste con múltiples cuentas?
- [ ] ¿Ejecutaste herramientas de análisis estático?
- [ ] ¿Consideraste una auditoría externa?

## 📚 Mejores Prácticas

### 1. Usa Librerías Probadas

```solidity
// ✅ OpenZeppelin es el estándar de la industria
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
```

### 2. Principio de Menor Privilegio

```solidity
// Da solo los permisos necesarios
contract GoodPractice {
    address public admin;
    address public operator;
    
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }
    
    modifier onlyOperator() {
        require(msg.sender == operator);
        _;
    }
    
    function criticalFunction() public onlyAdmin { }
    function normalFunction() public onlyOperator { }
}
```

### 3. Circuit Breakers (Pausable)

```solidity
import "@openzeppelin/contracts/security/Pausable.sol";

contract EmergencyStop is Pausable, Ownable {
    function normalOperation() public whenNotPaused {
        // Operación normal
    }
    
    function emergencyStop() public onlyOwner {
        _pause();
    }
    
    function resume() public onlyOwner {
        _unpause();
    }
}
```

### 4. Rate Limiting

```solidity
contract RateLimited {
    mapping(address => uint) public lastAction;
    uint public constant COOLDOWN = 1 hours;
    
    modifier rateLimited() {
        require(
            block.timestamp >= lastAction[msg.sender] + COOLDOWN,
            "Espera el cooldown"
        );
        lastAction[msg.sender] = block.timestamp;
        _;
    }
    
    function limitedAction() public rateLimited {
        // Solo se puede ejecutar cada hora
    }
}
```

## 🎓 Recursos de Aprendizaje

1. **Ethernaut** - https://ethernaut.openzeppelin.com/
   Juegos de seguridad interactivos

2. **Damn Vulnerable DeFi** - https://www.damnvulnerabledefi.xyz/
   Retos de seguridad DeFi

3. **Secureum** - https://secureum.substack.com/
   Bootcamps de seguridad

4. **Smart Contract Weakness Classification**
   https://swcregistry.io/

## ⚠️ Reglas de Oro

1. **Nunca confíes en datos externos sin validar**
2. **Actualiza el estado antes de llamadas externas**
3. **Usa librerías auditadas (OpenZeppelin)**
4. **Prueba extensivamente antes de mainnet**
5. **Considera auditorías profesionales para contratos críticos**
6. **Implementa mecanismos de pausa de emergencia**
7. **Minimiza la complejidad**
8. **Documenta tu código exhaustivamente**

---

🔐 **Recuerda**: La seguridad es un proceso continuo, no un destino. Mantente actualizado con las últimas vulnerabilidades y mejores prácticas.
