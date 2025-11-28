// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./TravelFundV2.sol";

/**
 * @title FundFactory
 * @dev Factory pattern para crear múltiples fondos independientes
 * 
 * CARACTERÍSTICAS:
 * ✅ Cada usuario puede crear fondos ilimitados
 * ✅ Registry global de todos los fondos
 * ✅ Búsqueda de fondos por creador o participante
 * ✅ Sistema de nickname global (una vez por usuario)
 * ✅ Tipos de fondos: Viaje, Ahorro, Cuenta Compartida, Otro
 * 
 * @author GitHub Copilot
 */
contract FundFactory {
    
    // ============================================
    // ESTRUCTURAS Y ENUMS
    // ============================================
    
    enum FundType {
        Travel,          // Fondo de viaje
        Savings,         // Ahorro grupal
        SharedAccount,   // Cuenta compartida
        Other            // Otro propósito
    }
    
    struct FundInfo {
        address fundAddress;      // Dirección del contrato del fondo
        address creator;          // Quien creó el fondo
        string fundName;          // Nombre del fondo
        FundType fundType;        // Tipo de fondo
        uint256 createdAt;        // Timestamp de creación
        bool isActive;            // Si el fondo está activo
    }
    
    // ============================================
    // VARIABLES DE ESTADO
    // ============================================
    
    // Mapping de dirección de usuario => nickname
    mapping(address => string) public nicknames;
    
    // Mapping de nickname => dirección (para búsqueda inversa)
    mapping(string => address) public nicknameToAddress;
    
    // Array de todos los fondos creados
    FundInfo[] public allFunds;
    
    // Mapping de creador => índices de sus fondos
    mapping(address => uint256[]) public fundsByCreator;
    
    // Mapping de participante => índices de fondos donde participa
    mapping(address => uint256[]) public fundsByParticipant;
    
    // Mapping para verificar si un nickname ya existe
    mapping(string => bool) public nicknameExists;
    
    // ============================================
    // EVENTOS
    // ============================================
    
    event NicknameSet(address indexed user, string nickname);
    event FundCreated(
        address indexed fundAddress,
        address indexed creator,
        string fundName,
        FundType fundType,
        uint256 indexed fundIndex
    );
    event FundParticipantAdded(address indexed fundAddress, address indexed participant, uint256 fundIndex);
    event FundDeactivated(address indexed fundAddress, address indexed creator, uint256 indexed fundIndex);
    
    // ============================================
    // FUNCIONES DE NICKNAME (GLOBAL)
    // ============================================
    
    /**
     * @dev Establecer nickname del usuario (una sola vez, global para todos los fondos)
     */
    function setNickname(string memory _nickname) external {
        require(bytes(_nickname).length >= 3 && bytes(_nickname).length <= 32, "Nickname: 3-32 caracteres");
        require(bytes(nicknames[msg.sender]).length == 0, "Ya tienes un nickname establecido");
        require(!nicknameExists[_nickname], "Nickname ya esta en uso");
        
        // Validar que solo contenga letras y números
        bytes memory nicknameBytes = bytes(_nickname);
        for (uint i = 0; i < nicknameBytes.length; i++) {
            bytes1 char = nicknameBytes[i];
            require(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A),   // a-z
                "Solo letras y numeros permitidos"
            );
        }
        
        nicknames[msg.sender] = _nickname;
        nicknameToAddress[_nickname] = msg.sender;
        nicknameExists[_nickname] = true;
        
        emit NicknameSet(msg.sender, _nickname);
    }
    
    /**
     * @dev Obtener nickname de una dirección
     */
    function getNickname(address _address) external view returns (string memory) {
        string memory nickname = nicknames[_address];
        if (bytes(nickname).length == 0) {
            return addressToString(_address);
        }
        return nickname;
    }
    
    /**
     * @dev Obtener nickname de una dirección (para contratos externos)
     * Devuelve string vacío si no tiene nickname
     */
    function getNicknameByAddress(address _address) external view returns (string memory) {
        return nicknames[_address];
    }
    
    /**
     * @dev Verificar si un nickname está disponible
     */
    function isNicknameAvailable(string memory _nickname) external view returns (bool) {
        return !nicknameExists[_nickname];
    }
    
    /**
     * @dev Obtener dirección desde nickname
     */
    function getAddressByNickname(string memory _nickname) external view returns (address) {
        address addr = nicknameToAddress[_nickname];
        require(addr != address(0), "Nickname no existe");
        return addr;
    }
    
    // ============================================
    // FUNCIONES DE CREACIÓN DE FONDOS
    // ============================================
    
    /**
     * @dev Crear un nuevo fondo
     */
    function createFund(
        string memory _fundName,
        string memory _description,
        uint256 _targetAmount,
        bool _isPrivate,
        uint256 _approvalPercentage,
        uint256 _minimumVotes,
        FundType _fundType
    ) external returns (address) {
        require(bytes(nicknames[msg.sender]).length > 0, "Debes establecer un nickname primero");
        require(bytes(_fundName).length > 0, "El nombre del fondo es requerido");
        require(_approvalPercentage > 0 && _approvalPercentage <= 100, "Porcentaje invalido");
        require(_minimumVotes > 0, "Minimo de votos debe ser mayor a 0");
        
        // Generar Fund ID único
        string memory fundId = generateFundId(_fundName);
        
        // Crear nuevo contrato TravelFundV2
        TravelFundV2 newFund = new TravelFundV2(
            msg.sender,      // El creador real es quien llama al Factory
            address(this),   // Dirección del Factory para consultar nicknames
            fundId,
            _fundName,
            _description,
            _targetAmount,
            _isPrivate,
            _approvalPercentage,
            _minimumVotes
        );
        
        address fundAddress = address(newFund);
        
        // Registrar el fondo
        uint256 fundIndex = allFunds.length;
        allFunds.push(FundInfo({
            fundAddress: fundAddress,
            creator: msg.sender,
            fundName: _fundName,
            fundType: _fundType,
            createdAt: block.timestamp,
            isActive: true
        }));
        
        // Agregar a los fondos del creador
        fundsByCreator[msg.sender].push(fundIndex);
        fundsByParticipant[msg.sender].push(fundIndex);
        
        emit FundCreated(fundAddress, msg.sender, _fundName, _fundType, fundIndex);
        
        return fundAddress;
    }
    
    /**
     * @dev Generar ID único para el fondo
     */
    function generateFundId(string memory _fundName) private view returns (string memory) {
        return string(abi.encodePacked(
            "FUND-",
            uint2str(block.timestamp),
            "-",
            substring(_fundName, 0, 5)
        ));
    }
    
    // ============================================
    // FUNCIONES DE CONSULTA
    // ============================================
    
    /**
     * @dev Obtener todos los fondos creados por un usuario
     */
    function getFundsByCreator(address _creator) external view returns (FundInfo[] memory) {
        uint256[] memory indices = fundsByCreator[_creator];
        FundInfo[] memory funds = new FundInfo[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            funds[i] = allFunds[indices[i]];
        }
        
        return funds;
    }
    
    /**
     * @dev Obtener todos los fondos donde participa un usuario
     */
    function getFundsByParticipant(address _participant) external view returns (FundInfo[] memory) {
        uint256[] memory indices = fundsByParticipant[_participant];
        FundInfo[] memory funds = new FundInfo[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            funds[i] = allFunds[indices[i]];
        }
        
        return funds;
    }
    
    /**
     * @dev Obtener información de un fondo específico
     */
    function getFundInfo(uint256 _fundIndex) external view returns (FundInfo memory) {
        require(_fundIndex < allFunds.length, "Fondo no existe");
        return allFunds[_fundIndex];
    }
    
    /**
     * @dev Obtener total de fondos creados
     */
    function getTotalFunds() external view returns (uint256) {
        return allFunds.length;
    }
    
    /**
     * @dev Obtener todos los fondos (paginado)
     */
    function getAllFunds(uint256 _offset, uint256 _limit) external view returns (FundInfo[] memory) {
        require(_offset < allFunds.length, "Offset fuera de rango");
        
        uint256 end = _offset + _limit;
        if (end > allFunds.length) {
            end = allFunds.length;
        }
        
        uint256 length = end - _offset;
        FundInfo[] memory funds = new FundInfo[](length);
        
        for (uint256 i = 0; i < length; i++) {
            funds[i] = allFunds[_offset + i];
        }
        
        return funds;
    }
    
    /**
     * @dev Registrar participación de un usuario en un fondo
     * (Solo puede ser llamado por el fondo mismo o manualmente por admins)
     */
    function registerParticipant(address _participant, uint256 _fundIndex) external {
        require(_fundIndex < allFunds.length, "Fondo no existe");
        // En producción, agregar require para verificar que msg.sender es el fondo
        
        fundsByParticipant[_participant].push(_fundIndex);
        
        emit FundParticipantAdded(allFunds[_fundIndex].fundAddress, _participant, _fundIndex);
    }
    
    /**
     * @dev Desactivar un fondo (solo el creador puede hacerlo)
     * @param _fundAddress Dirección del fondo a desactivar
     */
    function deactivateFund(address _fundAddress) external {
        require(_fundAddress != address(0), "Direccion invalida");
        
        // Buscar el fondo en el array
        uint256 fundIndex = type(uint256).max;
        for (uint256 i = 0; i < allFunds.length; i++) {
            if (allFunds[i].fundAddress == _fundAddress) {
                fundIndex = i;
                break;
            }
        }
        
        require(fundIndex != type(uint256).max, "Fondo no encontrado");
        require(allFunds[fundIndex].creator == msg.sender, "Solo el creador puede desactivar");
        require(allFunds[fundIndex].isActive, "Fondo ya desactivado");
        
        // Desactivar el fondo
        allFunds[fundIndex].isActive = false;
        
        emit FundDeactivated(_fundAddress, msg.sender, fundIndex);
    }
    
    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
    
    function addressToString(address _addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }
    
    function uint2str(uint256 _i) private pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    function substring(string memory str, uint startIndex, uint endIndex) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (endIndex > strBytes.length) {
            endIndex = strBytes.length;
        }
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }
}
