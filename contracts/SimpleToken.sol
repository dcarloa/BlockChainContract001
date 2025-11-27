// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title SimpleToken
 * @dev Un token básico para aprender conceptos intermedios de Solidity
 * 
 * Este contrato te enseña:
 * - Mapeos (mapping) - como diccionarios o hash maps
 * - Eventos más complejos
 * - Control de acceso básico
 * - Aritmética con números enteros
 * - Require statements para validación
 */
contract SimpleToken {
    // Nombre del token
    string public name;
    
    // Símbolo del token (ej: BTC, ETH, USDT)
    string public symbol;
    
    // Número de decimales (generalmente 18 como ETH)
    uint8 public decimals;
    
    // Supply total de tokens
    uint256 public totalSupply;
    
    // Dueño del contrato (quien lo desplegó)
    address public owner;
    
    // Mapping: asocia cada dirección con su balance
    // Es como un diccionario: address => balance
    mapping(address => uint256) public balanceOf;
    
    // Mapping anidado para allowances (permisos de gasto)
    // owner => (spender => amount)
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Eventos - registros permanentes en la blockchain
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    
    // Modificador - reutilizable para verificar que el llamador es el dueño
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el dueno puede ejecutar esta funcion");
        _; // Aquí se ejecuta el código de la función
    }
    
    /**
     * @dev Constructor - crea el token con parámetros iniciales
     * @param _name Nombre del token
     * @param _symbol Símbolo del token
     * @param _initialSupply Cantidad inicial de tokens (en unidades mínimas)
     */
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = 18; // Estándar en Ethereum
        
        owner = msg.sender; // Quien despliega el contrato es el dueño
        
        // Crear (mintear) los tokens iniciales y dárselos al dueño
        totalSupply = _initialSupply;
        balanceOf[msg.sender] = _initialSupply;
        
        emit Transfer(address(0), msg.sender, _initialSupply);
    }
    
    /**
     * @dev Transferir tokens a otra dirección
     * @param _to Dirección destino
     * @param _value Cantidad de tokens a transferir
     * @return success True si la transferencia fue exitosa
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        // Validaciones con require
        require(_to != address(0), "No puedes enviar a la direccion cero");
        require(balanceOf[msg.sender] >= _value, "Balance insuficiente");
        
        // Realizar la transferencia
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev Aprobar a otra dirección para gastar tus tokens
     * Útil para contratos DeFi
     * @param _spender Dirección autorizada a gastar
     * @param _value Cantidad máxima que puede gastar
     * @return success True si la aprobación fue exitosa
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "No puedes aprobar a la direccion cero");
        
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev Transferir tokens desde una dirección (si tienes permiso)
     * @param _from Dirección origen
     * @param _to Dirección destino
     * @param _value Cantidad de tokens
     * @return success True si la transferencia fue exitosa
     */
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_from != address(0), "Direccion origen invalida");
        require(_to != address(0), "Direccion destino invalida");
        require(balanceOf[_from] >= _value, "Balance insuficiente");
        require(allowance[_from][msg.sender] >= _value, "Allowance insuficiente");
        
        // Realizar la transferencia
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev Crear nuevos tokens (solo el dueño puede hacerlo)
     * @param _to Dirección que recibirá los nuevos tokens
     * @param _value Cantidad de tokens a crear
     */
    function mint(address _to, uint256 _value) public onlyOwner {
        require(_to != address(0), "No puedes mintear a la direccion cero");
        
        totalSupply += _value;
        balanceOf[_to] += _value;
        
        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
    }
    
    /**
     * @dev Quemar (destruir) tokens
     * @param _value Cantidad de tokens a quemar
     */
    function burn(uint256 _value) public {
        require(balanceOf[msg.sender] >= _value, "Balance insuficiente para quemar");
        
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        
        emit Burn(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);
    }
    
    /**
     * @dev Obtener el balance de una dirección
     * @param _owner Dirección a consultar
     * @return balance El balance de la dirección
     */
    function getBalance(address _owner) public view returns (uint256 balance) {
        return balanceOf[_owner];
    }
}
