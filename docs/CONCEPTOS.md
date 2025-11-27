# 📚 Conceptos Fundamentales de Solidity

## 🎯 Índice
1. [Tipos de Datos](#tipos-de-datos)
2. [Variables de Estado vs Locales](#variables)
3. [Funciones y Modificadores](#funciones)
4. [Visibilidad](#visibilidad)
5. [Eventos](#eventos)
6. [Mappings](#mappings)
7. [Gas y Optimización](#gas)
8. [Seguridad Básica](#seguridad)

## 🔢 Tipos de Datos

### Tipos de Valor

```solidity
// Enteros sin signo (no negativos)
uint8 numero8bits;    // 0 a 255
uint256 numero256bits; // 0 a 2^256 - 1
uint numero;          // por defecto es uint256

// Enteros con signo (pueden ser negativos)
int8 enteroConSigno;  // -128 a 127
int256 enteroGrande;  // -2^255 a 2^255 - 1

// Booleano
bool esVerdad = true;
bool esFalso = false;

// Dirección (de cuenta Ethereum)
address miDireccion = 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb;
address payable direccionQuePuedeRecibirEther;

// Bytes
bytes32 hash;         // 32 bytes fijos
bytes datoDinamico;   // tamaño dinámico

// String
string texto = "Hola Ethereum";
```

### Tipos de Referencia

```solidity
// Arrays
uint[] arrayDinamico;
uint[10] arrayFijo;
string[] nombres;

// Structs (estructuras personalizadas)
struct Persona {
    string nombre;
    uint edad;
    address wallet;
}

// Mappings (como diccionarios)
mapping(address => uint) balances;
mapping(uint => Persona) personas;
```

## 📦 Variables

### Variables de Estado
Se almacenan permanentemente en la blockchain (cuestan gas escribir):

```solidity
contract MiContrato {
    uint public contador;           // Almacenada en blockchain
    address public owner;           // Almacenada en blockchain
    mapping(address => uint) saldos; // Almacenado en blockchain
}
```

### Variables Locales
Existen solo durante la ejecución de la función (más baratas):

```solidity
function calcular(uint x) public pure returns (uint) {
    uint resultado = x * 2;  // Variable local
    return resultado;
}
```

### Variables Globales
Disponibles automáticamente:

```solidity
msg.sender    // Dirección que llamó la función
msg.value     // Cantidad de Ether enviada
block.timestamp // Timestamp del bloque actual
block.number  // Número del bloque actual
tx.gasprice   // Precio del gas de la transacción
```

## ⚙️ Funciones

### Tipos de Funciones

```solidity
// View: Solo lee, no modifica estado (gratis si se llama externamente)
function obtenerBalance() public view returns (uint) {
    return balance;
}

// Pure: No lee ni modifica estado (gratis si se llama externamente)
function sumar(uint a, uint b) public pure returns (uint) {
    return a + b;
}

// Payable: Puede recibir Ether
function depositar() public payable {
    balance += msg.value;
}

// Sin modificador: Modifica el estado (cuesta gas)
function incrementar() public {
    contador++;
}
```

### Modificadores Personalizados

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "No eres el dueño");
    _;  // Aquí se ejecuta la función
}

function funcionImportante() public onlyOwner {
    // Solo el dueño puede ejecutar esto
}
```

## 👁️ Visibilidad

```solidity
contract Visibilidad {
    uint private secreto;        // Solo dentro de este contrato
    uint internal compartido;    // Este contrato + herederos
    uint public publico;         // Cualquiera (genera getter automático)
    uint external externo;       // Solo desde fuera del contrato
    
    function funcionPrivada() private { }     // Solo este contrato
    function funcionInterna() internal { }    // Este + herederos
    function funcionPublica() public { }      // Cualquiera
    function funcionExterna() external { }    // Solo desde fuera
}
```

## 📣 Eventos

Los eventos son logs que quedan registrados en la blockchain:

```solidity
// Declarar evento
event Transfer(address indexed from, address indexed to, uint value);

// Emitir evento
function transferir(address to, uint amount) public {
    // ... lógica de transferencia ...
    emit Transfer(msg.sender, to, amount);
}

// Las aplicaciones pueden escuchar eventos:
// myContract.on("Transfer", (from, to, value) => {
//     console.log(`${from} envió ${value} a ${to}`);
// });
```

**¿Por qué usar eventos?**
- Son más baratos que almacenar en variables de estado
- Aplicaciones frontend pueden escucharlos
- Crean un historial de actividad del contrato

## 🗺️ Mappings

Son como diccionarios o hash maps:

```solidity
// Declarar mapping
mapping(address => uint) public balances;
mapping(uint => string) public nombres;
mapping(address => mapping(address => uint)) public allowances; // Mapping anidado

// Usar mapping
function asignarBalance(address usuario, uint cantidad) public {
    balances[usuario] = cantidad;
}

function obtenerBalance(address usuario) public view returns (uint) {
    return balances[usuario]; // Si no existe, retorna 0
}
```

**Características:**
- No se puede iterar sobre un mapping
- Todas las claves "existen" (retornan valor por defecto si no se han asignado)
- Muy eficientes en gas

## ⛽ Gas y Optimización

### ¿Qué consume gas?

```solidity
// 💸 CARO (modifica estado)
function caro() public {
    contador++;                    // Escritura en estado
    usuarios[msg.sender] = true;   // Escritura en estado
    emit Evento();                 // Menos caro pero no gratis
}

// 🆓 GRATIS (solo lectura, si se llama externamente)
function gratis() public view returns (uint) {
    return contador;  // Solo lectura
}
```

### Tips de Optimización

```solidity
// ❌ MAL - Lee del estado múltiples veces
function malo() public view returns (uint) {
    uint total = contador + contador + contador;
    return total;
}

// ✅ BIEN - Lee del estado una sola vez
function bueno() public view returns (uint) {
    uint temp = contador;  // Una sola lectura
    uint total = temp + temp + temp;
    return total;
}

// ✅ Usa uint256 en lugar de uint8/uint16 (más eficiente)
uint256 public valor;  // Mejor que uint8

// ✅ Marca funciones como view/pure cuando sea posible
function calcular(uint x) public pure returns (uint) {
    return x * 2;
}
```

## 🔐 Seguridad Básica

### 1. Validación con require

```solidity
function transferir(address to, uint amount) public {
    require(to != address(0), "Direccion invalida");
    require(balance[msg.sender] >= amount, "Balance insuficiente");
    require(amount > 0, "Monto debe ser positivo");
    
    // ... lógica segura ...
}
```

### 2. Control de Acceso

```solidity
address public owner;

modifier onlyOwner() {
    require(msg.sender == owner, "No autorizado");
    _;
}

function funcionCritica() public onlyOwner {
    // Solo el dueño puede ejecutar esto
}
```

### 3. Checks-Effects-Interactions Pattern

```solidity
// ✅ CORRECTO
function retirar(uint amount) public {
    // 1. Checks (validaciones)
    require(balances[msg.sender] >= amount, "Balance insuficiente");
    
    // 2. Effects (cambios de estado)
    balances[msg.sender] -= amount;
    
    // 3. Interactions (llamadas externas)
    payable(msg.sender).transfer(amount);
}

// ❌ PELIGROSO (vulnerable a reentrancy)
function retirarMal(uint amount) public {
    require(balances[msg.sender] >= amount);
    
    // Llamada externa ANTES de actualizar estado
    payable(msg.sender).transfer(amount);
    
    // El atacante puede volver a llamar antes de llegar aquí
    balances[msg.sender] -= amount;
}
```

### 4. Integer Overflow/Underflow

En Solidity 0.8.0+ esto está protegido automáticamente:

```solidity
// Solidity 0.8.0+ automáticamente revierte si hay overflow
uint8 numero = 255;
numero++; // Revierte automáticamente

// En versiones anteriores necesitabas SafeMath
// import "@openzeppelin/contracts/utils/math/SafeMath.sol";
```

### 5. No confíes en block.timestamp para lógica crítica

```solidity
// ⚠️ Los mineros pueden manipular el timestamp ligeramente
function manejadorDeTiempo() public {
    // OK para ventanas de tiempo amplias (días, semanas)
    if (block.timestamp > tiempoLimite) {
        // hacer algo
    }
    
    // ❌ NO uses para lógica crítica de segundos/minutos
}
```

## 🎓 Ejercicios Prácticos

### Ejercicio 1: Contrato de Almacenamiento
Crea un contrato que permita a los usuarios almacenar y recuperar un número favorito.

### Ejercicio 2: Lista de Tareas
Crea un contrato donde los usuarios puedan agregar, completar y listar sus tareas.

### Ejercicio 3: Sistema de Votación
Crea un sistema simple de votación donde se pueda votar por opciones predefinidas.

---

💡 **Recuerda**: La práctica es la clave. Experimenta con estos conceptos en tus contratos y no tengas miedo de cometer errores en las redes de prueba. ¡Para eso están!
