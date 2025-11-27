// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title HelloWorld
 * @dev El contrato más simple para aprender Solidity
 * 
 * Este contrato te enseña:
 * - Cómo declarar variables
 * - Cómo crear funciones
 * - La diferencia entre funciones que modifican estado y las que solo leen
 */
contract HelloWorld {
    // Variable de estado - se almacena permanentemente en la blockchain
    // "public" genera automáticamente una función getter
    string public message;
    
    // Contador para demostrar modificación de estado
    uint256 public messageChangeCount;
    
    // Evento que se emite cuando cambia el mensaje
    // Los eventos son como logs que quedan registrados en la blockchain
    event MessageChanged(string oldMessage, string newMessage, address changedBy);
    
    /**
     * @dev Constructor - se ejecuta UNA SOLA VEZ al desplegar el contrato
     * @param initialMessage El mensaje inicial que tendrá el contrato
     */
    constructor(string memory initialMessage) {
        message = initialMessage;
        messageChangeCount = 0;
    }
    
    /**
     * @dev Cambia el mensaje almacenado
     * Esta función MODIFICA el estado, por lo tanto requiere gas
     * @param newMessage El nuevo mensaje a almacenar
     */
    function setMessage(string memory newMessage) public {
        string memory oldMessage = message;
        message = newMessage;
        messageChangeCount++;
        
        // Emitir evento para que aplicaciones externas puedan escucharlo
        emit MessageChanged(oldMessage, newMessage, msg.sender);
    }
    
    /**
     * @dev Obtiene el mensaje actual
     * Esta función es "view" - solo LEE el estado, NO lo modifica
     * Las funciones view NO requieren gas cuando se llaman externamente
     * @return El mensaje actual
     */
    function getMessage() public view returns (string memory) {
        return message;
    }
    
    /**
     * @dev Obtiene información sobre quién está llamando la función
     * msg.sender es una variable global que contiene la dirección que llamó la función
     * @return La dirección del llamador
     */
    function whoAmI() public view returns (address) {
        return msg.sender;
    }
    
    /**
     * @dev Función pure - no lee ni modifica el estado
     * Solo hace cálculos con los parámetros que recibe
     * @param text Texto a procesar
     * @return El texto con un prefijo
     */
    function addGreeting(string memory text) public pure returns (string memory) {
        return string(abi.encodePacked("Hello, ", text, "!"));
    }
}
