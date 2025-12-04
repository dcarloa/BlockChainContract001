// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

interface IFundFactory {
    function getNicknameByAddress(address _address) external view returns (string memory);
}

/**
 * @title TravelFundV2
 * @dev Fondo compartido descentralizado para gastos de viaje - Versión Mejorada
 * 
 * NUEVAS CARACTERÍSTICAS:
 * ✅ Sistema de nicknames/alias para mejor UX
 * ✅ Sistema de invitaciones para fondos privados
 * ✅ Protección contra reentrancy
 * ✅ Límites de seguridad (contribuyentes, montos, tiempo)
 * ✅ Cancelación de propuestas
 * ✅ Expiración automática de propuestas
 * ✅ Metadata del fondo (ID único, descripción, meta)
 * 
 * @author GitHub Copilot
 * @notice Este contrato permite crear fondos compartidos con votación democrática
 */
contract TravelFundV2 {
    
    // ============================================
    // CONSTANTES Y LÍMITES DE SEGURIDAD
    // ============================================
    
    uint256 public constant MAX_CONTRIBUTORS = 50;           // Máximo de participantes
    uint256 public constant PROPOSAL_EXPIRATION = 30 days;   // Propuestas expiran en 30 días
    uint256 public constant MAX_PROPOSAL_PERCENTAGE = 80;    // Máx 80% del balance por propuesta
    uint256 public constant MAX_NICKNAME_LENGTH = 32;        // Longitud máxima de nickname
    uint256 private constant REENTRANCY_GUARD = 1;
    uint256 private constant REENTRANCY_LOCKED = 2;
    
    // ============================================
    // ESTRUCTURAS DE DATOS
    // ============================================
    
    /**
     * @dev Estados posibles de membresía en el fondo
     */
    enum MemberStatus { 
        NotInvited,    // No ha sido invitado
        Invited,       // Invitado pero no ha aceptado
        Active         // Miembro activo
    }
    
    /**
     * @dev Estructura de cada propuesta de gasto
     */
    struct Proposal {
        uint256 id;
        address proposer;
        address payable recipient;
        uint256 amount;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 createdAt;
        uint256 expiresAt;
        bool executed;
        bool cancelled;
        bool approved;
        address[] involvedMembers;     // Miembros involucrados en esta propuesta
        bool requiresFullConsent;      // Si necesita aprobación de todos (usa dinero de no-involucrados)
        uint256 borrowedAmount;        // Cantidad total que se pide prestada de no-involucrados
        uint256 borrowedPerPerson;     // Cantidad prestada por cada no-involucrado
        mapping(address => bool) hasVoted;
        mapping(address => bool) isInvolved;  // Para verificación rápida
    }
    
    // ============================================
    // VARIABLES DE ESTADO
    // ============================================
    
    // Metadata del fondo
    string public fundId;              // ID único del fondo
    string public tripName;            // Nombre del viaje
    string public description;         // Descripción del fondo
    address public creator;            // Creador del fondo
    IFundFactory public factory;       // Referencia al Factory para nicknames globales
    uint256 public targetAmount;       // Meta de recaudación (opcional)
    bool public isPrivate;             // Si requiere invitación
    bool public fundActive;            // Estado del fondo
    
    // Configuración de votación
    uint256 public approvalPercentage; // % de votos necesarios (ej: 60)
    uint256 public minimumVotes;       // Mínimo de votos requeridos
    
    // Finanzas
    uint256 public totalContributions; // Total depositado
    uint256 public proposalCount;      // Contador de propuestas
    
    // Sistema de identidad (nicknames)
    mapping(address => string) public nicknames;           // address => nickname
    mapping(string => bool) private nicknameTaken;         // nickname => está usado
    mapping(string => address) private nicknameToAddress;  // nickname => address
    
    // Sistema de membresía
    mapping(address => MemberStatus) public memberStatus;  // Estado de cada miembro
    mapping(address => bool) public isContributor;         // Verificación rápida
    mapping(address => uint256) public contributions;      // Contribución de cada uno
    address[] public contributors;                         // Lista de contribuyentes
    
    // Propuestas
    mapping(uint256 => Proposal) public proposals;
    
    // Protección contra reentrancy (implementación manual)
    uint256 private reentrancyStatus;
    
    // ============================================
    // EVENTOS
    // ============================================
    
    event FundCreated(
        string fundId, 
        string tripName, 
        address creator, 
        bool isPrivate, 
        uint256 approvalPercentage
    );
    event NicknameSet(address indexed user, string nickname);
    event MemberInvited(address indexed inviter, address indexed invitee, string inviteeNickname);
    event InvitationAccepted(address indexed member, string nickname);
    event ContributionReceived(address indexed contributor, uint256 amount, uint256 totalContributions);
    event ProposalCreated(
        uint256 indexed proposalId, 
        address indexed proposer, 
        uint256 amount, 
        string description,
        uint256 expiresAt
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool inFavor);
    event ProposalApproved(uint256 indexed proposalId);
    event ProposalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amount);
    event ProposalCancelled(uint256 indexed proposalId, address indexed proposer);
    event FundClosed(uint256 remainingBalance);
    event RefundIssued(address indexed contributor, uint256 amount);
    event MemberKicked(address indexed member, uint256 refundAmount, address indexed kickedBy);
    
    // ============================================
    // MODIFICADORES
    // ============================================
    
    modifier onlyContributor() {
        require(isContributor[msg.sender], "No eres contribuyente del fondo");
        _;
    }
    
    modifier onlyCreator() {
        require(msg.sender == creator, "Solo el creador puede ejecutar esto");
        _;
    }
    
    modifier fundIsActive() {
        require(fundActive, "El fondo no esta activo");
        _;
    }
    
    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId > 0 && _proposalId <= proposalCount, "Propuesta no existe");
        _;
    }
    
    modifier onlyAuthorized() {
        if (isPrivate) {
            require(
                memberStatus[msg.sender] == MemberStatus.Active || msg.sender == creator,
                "No estas autorizado para participar"
            );
        }
        _;
    }
    
    modifier nonReentrant() {
        require(reentrancyStatus != REENTRANCY_LOCKED, "Reentrancy detectado");
        reentrancyStatus = REENTRANCY_LOCKED;
        _;
        reentrancyStatus = REENTRANCY_GUARD;
    }
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    
    /**
     * @dev Inicializa el fondo de viaje
     * @param _fundId ID único del fondo (generado en frontend)
     * @param _tripName Nombre del viaje
     * @param _description Descripción del fondo
     * @param _targetAmount Meta de recaudación (0 = sin meta)
     * @param _isPrivate Si requiere invitación para unirse
     * @param _approvalPercentage Porcentaje de votos necesarios (1-100)
     * @param _minimumVotes Número mínimo de votos requeridos
     */
    constructor(
        address _creator,
        address _factory,
        string memory _fundId,
        string memory _tripName,
        string memory _description,
        uint256 _targetAmount,
        bool _isPrivate,
        uint256 _approvalPercentage,
        uint256 _minimumVotes
    ) {
        require(_creator != address(0), "Creador no puede ser address(0)");
        require(_factory != address(0), "Factory no puede ser address(0)");
        require(bytes(_fundId).length > 0, "Fund ID requerido");
        require(bytes(_tripName).length > 0, "Nombre del viaje requerido");
        require(_approvalPercentage > 0 && _approvalPercentage <= 100, "Porcentaje debe estar entre 1 y 100");
        require(_minimumVotes > 0, "Debe haber al menos 1 voto minimo");
        
        creator = _creator;
        factory = IFundFactory(_factory);
        fundId = _fundId;
        tripName = _tripName;
        description = _description;
        targetAmount = _targetAmount;
        isPrivate = _isPrivate;
        approvalPercentage = _approvalPercentage;
        minimumVotes = _minimumVotes;
        fundActive = true;
        reentrancyStatus = REENTRANCY_GUARD;
        
        // El creador es automáticamente miembro activo
        memberStatus[_creator] = MemberStatus.Active;
        
        emit FundCreated(_fundId, _tripName, _creator, _isPrivate, _approvalPercentage);
    }
    
    // ============================================
    // FUNCIONES DE IDENTIDAD (NICKNAMES)
    // ============================================
    
    /**
     * @dev Establece un nickname único para el usuario
     * @param _nickname Apodo del usuario (3-32 caracteres)
     */
    function setNickname(string memory _nickname) external {
        require(bytes(_nickname).length >= 3, "Nickname muy corto (min 3 caracteres)");
        require(bytes(_nickname).length <= MAX_NICKNAME_LENGTH, "Nickname muy largo");
        require(!_hasSpecialCharacters(_nickname), "Nickname solo puede contener letras y numeros");
        
        // Si ya tiene nickname, liberar el anterior
        string memory oldNickname = nicknames[msg.sender];
        if (bytes(oldNickname).length > 0) {
            nicknameTaken[oldNickname] = false;
            delete nicknameToAddress[oldNickname];
        }
        
        require(!nicknameTaken[_nickname], "Nickname ya en uso");
        
        nicknames[msg.sender] = _nickname;
        nicknameTaken[_nickname] = true;
        nicknameToAddress[_nickname] = msg.sender;
        
        emit NicknameSet(msg.sender, _nickname);
    }
    
    /**
     * @dev Obtiene el nickname de una dirección
     * @param _address Dirección a consultar
     * @return nickname Nickname del usuario o dirección si no tiene
     */
    function getNickname(address _address) public view returns (string memory) {
        // Consultar nickname global del Factory
        string memory nickname = factory.getNicknameByAddress(_address);
        if (bytes(nickname).length > 0) {
            return nickname;
        }
        // Si no tiene nickname, devolver dirección como string
        return _addressToString(_address);
    }
    
    /**
     * @dev Obtiene la dirección de un nickname
     * @param _nickname Nickname a buscar
     * @return address Dirección del usuario (address(0) si no existe)
     */
    function getAddressByNickname(string memory _nickname) public view returns (address) {
        return nicknameToAddress[_nickname];
    }
    
    /**
     * @dev Verifica si un nickname está disponible
     * @param _nickname Nickname a verificar
     * @return bool true si está disponible
     */
    function isNicknameAvailable(string memory _nickname) public view returns (bool) {
        return !nicknameTaken[_nickname];
    }
    
    // ============================================
    // FUNCIONES DE INVITACIÓN
    // ============================================
    
    /**
     * @dev Invita a un nuevo miembro al fondo (por dirección)
     * @param _member Dirección del miembro a invitar
     */
    function inviteMemberByAddress(address _member) external onlyContributor {
        require(_member != address(0), "Direccion invalida");
        require(_member != msg.sender, "No puedes invitarte a ti mismo");
        require(memberStatus[_member] == MemberStatus.NotInvited, "Ya esta invitado o es miembro");
        require(contributors.length < MAX_CONTRIBUTORS, "Fondo lleno");
        
        memberStatus[_member] = MemberStatus.Invited;
        
        emit MemberInvited(msg.sender, _member, getNickname(_member));
    }
    
    /**
     * @dev Invita a un nuevo miembro al fondo (por nickname)
     * @param _nickname Nickname del miembro a invitar
     */
    function inviteMemberByNickname(string memory _nickname) external onlyContributor {
        address member = nicknameToAddress[_nickname];
        require(member != address(0), "Nickname no encontrado");
        require(member != msg.sender, "No puedes invitarte a ti mismo");
        require(memberStatus[member] == MemberStatus.NotInvited, "Ya esta invitado o es miembro");
        require(contributors.length < MAX_CONTRIBUTORS, "Fondo lleno");
        
        memberStatus[member] = MemberStatus.Invited;
        
        emit MemberInvited(msg.sender, member, _nickname);
    }
    
    /**
     * @dev Acepta una invitación al fondo
     */
    function acceptInvitation() external {
        require(memberStatus[msg.sender] == MemberStatus.Invited, "No tienes invitacion pendiente");
        
        memberStatus[msg.sender] = MemberStatus.Active;
        
        emit InvitationAccepted(msg.sender, getNickname(msg.sender));
    }
    
    /**
     * @dev Obtiene la lista de miembros invitados (solo creador)
     * @return addresses Lista de direcciones invitadas
     */
    function getInvitedMembers() external view onlyCreator returns (address[] memory) {
        uint256 count = 0;
        
        // Contar invitados (nota: esto es costoso, usar con precaución)
        for (uint256 i = 0; i < contributors.length; i++) {
            if (memberStatus[contributors[i]] == MemberStatus.Invited) {
                count++;
            }
        }
        
        address[] memory invited = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < contributors.length; i++) {
            if (memberStatus[contributors[i]] == MemberStatus.Invited) {
                invited[index] = contributors[i];
                index++;
            }
        }
        
        return invited;
    }
    
    // ============================================
    // FUNCIONES DE CONTRIBUCIÓN
    // ============================================
    
    /**
     * @dev Depositar fondos al fondo de viaje
     */
    function deposit() external payable fundIsActive onlyAuthorized nonReentrant {
        require(msg.value > 0, "Debes enviar ETH");
        require(contributors.length < MAX_CONTRIBUTORS, "Fondo lleno");
        
        // Si es primera vez, agregarlo a la lista
        if (!isContributor[msg.sender]) {
            contributors.push(msg.sender);
            isContributor[msg.sender] = true;
        }
        
        contributions[msg.sender] += msg.value;
        totalContributions += msg.value;
        
        emit ContributionReceived(msg.sender, msg.value, totalContributions);
    }
    
    /**
     * @dev Obtiene el progreso hacia la meta (si existe)
     * @return percentage Porcentaje alcanzado (0-100)
     */
    function getProgressPercentage() public view returns (uint256) {
        if (targetAmount == 0) return 0;
        if (address(this).balance >= targetAmount) return 100;
        return (address(this).balance * 100) / targetAmount;
    }
    
    // ============================================
    // FUNCIONES DE PROPUESTAS
    // ============================================
    
    /**
     * @dev Crear una propuesta de gasto
     * @param _recipient Dirección que recibirá el pago
     * @param _amount Monto a solicitar
     * @param _description Descripción del gasto
     * @param _involvedMembers Lista de direcciones de miembros involucrados en este gasto
     */
    function createProposal(
        address payable _recipient,
        uint256 _amount,
        string calldata _description,
        address[] calldata _involvedMembers
    ) external onlyContributor fundIsActive returns (uint256) {
        require(_recipient != address(0), "Destinatario invalido");
        require(_amount > 0, "El monto debe ser mayor a 0");
        require(bytes(_description).length > 0, "Debe incluir descripcion");
        require(bytes(_description).length <= 500, "Descripcion muy larga");
        require(_involvedMembers.length > 0, "Debe seleccionar al menos un miembro involucrado");
        require(_involvedMembers.length <= contributors.length, "Numero de miembros invalido");
        
        uint256 maxAllowed = (address(this).balance * MAX_PROPOSAL_PERCENTAGE) / 100;
        require(_amount <= maxAllowed, "Monto excede limite permitido (80% del balance)");
        
        // Validar que todos los miembros involucrados sean contribuyentes activos
        for (uint256 i = 0; i < _involvedMembers.length; i++) {
            require(isContributor[_involvedMembers[i]], "Miembro no es contribuyente activo");
            // Verificar que no haya duplicados
            for (uint256 j = i + 1; j < _involvedMembers.length; j++) {
                require(_involvedMembers[i] != _involvedMembers[j], "Miembros duplicados");
            }
        }
        
        proposalCount++;
        
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.recipient = _recipient;
        newProposal.amount = _amount;
        newProposal.description = _description;
        newProposal.createdAt = block.timestamp;
        newProposal.expiresAt = block.timestamp + PROPOSAL_EXPIRATION;
        newProposal.executed = false;
        newProposal.cancelled = false;
        newProposal.approved = false;
        
        // Guardar miembros involucrados
        for (uint256 i = 0; i < _involvedMembers.length; i++) {
            newProposal.involvedMembers.push(_involvedMembers[i]);
            newProposal.isInvolved[_involvedMembers[i]] = true;
        }
        
        // Calcular si se necesita dinero de miembros no involucrados
        uint256 totalFromInvolved = 0;
        for (uint256 i = 0; i < _involvedMembers.length; i++) {
            totalFromInvolved += contributions[_involvedMembers[i]];
        }
        
        if (_amount > totalFromInvolved) {
            // Se necesita dinero de no-involucrados
            newProposal.requiresFullConsent = true;
            newProposal.borrowedAmount = _amount - totalFromInvolved;
            
            // Calcular cuánto se pide prestado por cada no-involucrado
            uint256 nonInvolvedCount = contributors.length - _involvedMembers.length;
            if (nonInvolvedCount > 0) {
                newProposal.borrowedPerPerson = newProposal.borrowedAmount / nonInvolvedCount;
            }
        } else {
            newProposal.requiresFullConsent = false;
            newProposal.borrowedAmount = 0;
            newProposal.borrowedPerPerson = 0;
        }
        
        emit ProposalCreated(
            proposalCount, 
            msg.sender, 
            _amount, 
            _description,
            newProposal.expiresAt
        );
        
        return proposalCount;
    }
    
    /**
     * @dev Cancelar una propuesta propia (solo si no hay votos)
     * @param _proposalId ID de la propuesta
     */
    function cancelProposal(uint256 _proposalId) external proposalExists(_proposalId) {
        Proposal storage proposal = proposals[_proposalId];
        
        require(msg.sender == proposal.proposer, "Solo el proposer puede cancelar");
        require(!proposal.executed, "Propuesta ya ejecutada");
        require(!proposal.cancelled, "Propuesta ya cancelada");
        require(
            proposal.votesFor + proposal.votesAgainst == 0, 
            "No se puede cancelar con votos existentes"
        );
        
        proposal.cancelled = true;
        
        emit ProposalCancelled(_proposalId, msg.sender);
    }
    
    /**
     * @dev Votar por una propuesta
     * @param _proposalId ID de la propuesta
     * @param _inFavor true para votar a favor, false para votar en contra
     */
    function vote(uint256 _proposalId, bool _inFavor) 
        external 
        onlyContributor 
        fundIsActive 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(!proposal.executed, "La propuesta ya fue ejecutada");
        require(!proposal.cancelled, "La propuesta fue cancelada");
        require(!isProposalExpired(_proposalId), "La propuesta expiro");
        require(!proposal.hasVoted[msg.sender], "Ya votaste en esta propuesta");
        
        // Si requiere consentimiento completo, cualquier contribuidor puede votar
        // Si no, solo los involucrados pueden votar
        if (!proposal.requiresFullConsent) {
            require(proposal.isInvolved[msg.sender], "No estas involucrado en esta propuesta");
        }
        
        proposal.hasVoted[msg.sender] = true;
        
        if (_inFavor) {
            proposal.votesFor++;
        } else {
            proposal.votesAgainst++;
        }
        
        emit VoteCast(_proposalId, msg.sender, _inFavor);
        
        // Verificar si se alcanzó el umbral de aprobación
        _checkApproval(_proposalId);
    }
    
    /**
     * @dev Verifica si una propuesta alcanzó los votos necesarios
     * @param _proposalId ID de la propuesta
     */
    function _checkApproval(uint256 _proposalId) internal {
        Proposal storage proposal = proposals[_proposalId];
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        
        // Si requiere consentimiento completo, usar todos los contribuidores
        // Si no, usar solo los involucrados
        uint256 voterBase = proposal.requiresFullConsent ? contributors.length : proposal.involvedMembers.length;
        
        // Verificar si se alcanzó el mínimo de votos
        uint256 effectiveMinimumVotes = minimumVotes < voterBase ? minimumVotes : voterBase;
        if (totalVotes < effectiveMinimumVotes) {
            return;
        }
        
        // Calcular el porcentaje de votos a favor basado en la base de votantes
        uint256 approvalRate = (proposal.votesFor * 100) / voterBase;
        
        if (approvalRate >= approvalPercentage) {
            proposal.approved = true;
            emit ProposalApproved(_proposalId);
        }
    }
    
    /**
     * @dev Ejecutar una propuesta aprobada
     * @param _proposalId ID de la propuesta
     */
    function executeProposal(uint256 _proposalId) 
        external 
        nonReentrant
        fundIsActive 
        proposalExists(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        
        require(!proposal.executed, "Propuesta ya ejecutada");
        require(!proposal.cancelled, "Propuesta cancelada");
        require(proposal.approved, "Propuesta no esta aprobada");
        require(!isProposalExpired(_proposalId), "Propuesta expirada");
        require(address(this).balance >= proposal.amount, "Fondos insuficientes");
        
        proposal.executed = true;
        
        // Transferir fondos
        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        require(success, "Transferencia fallida");
        
        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.amount);
    }
    
    /**
     * @dev Verifica si una propuesta expiró
     * @param _proposalId ID de la propuesta
     * @return bool true si expiró
     */
    function isProposalExpired(uint256 _proposalId) public view returns (bool) {
        return block.timestamp > proposals[_proposalId].expiresAt;
    }
    
    // ============================================
    // FUNCIONES DE GESTIÓN DEL FONDO
    // ============================================
    
    // Nota: La función closeFund() está implementada más adelante con distribución automática
    
    // ============================================
    // FUNCIONES DE CONSULTA
    // ============================================
    
    /**
     * @dev Obtener balance actual del fondo
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Obtener número de contribuyentes
     */
    function getContributorCount() external view returns (uint256) {
        return contributors.length;
    }
    
    /**
     * @dev Obtener lista de contribuyentes con sus nicknames
     */
    function getContributorsWithNicknames() external view returns (
        address[] memory addresses,
        string[] memory contributorNicknames,
        uint256[] memory amounts
    ) {
        uint256 count = contributors.length;
        addresses = new address[](count);
        contributorNicknames = new string[](count);
        amounts = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            address contributor = contributors[i];
            addresses[i] = contributor;
            contributorNicknames[i] = getNickname(contributor);
            amounts[i] = contributions[contributor];
        }
        
        return (addresses, contributorNicknames, amounts);
    }
    
    /**
     * @dev Obtener información de una propuesta
     */
    function getProposal(uint256 _proposalId) external view proposalExists(_proposalId) returns (
        uint256 id,
        address proposer,
        string memory proposerNickname,
        address recipient,
        string memory recipientNickname,
        uint256 amount,
        string memory proposalDescription,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 createdAt,
        uint256 expiresAt,
        bool executed,
        bool cancelled,
        bool approved,
        bool expired,
        bool requiresFullConsent,
        uint256 borrowedAmount,
        uint256 borrowedPerPerson
    ) {
        Proposal storage p = proposals[_proposalId];
        return (
            p.id,
            p.proposer,
            getNickname(p.proposer),
            p.recipient,
            getNickname(p.recipient),
            p.amount,
            p.description,
            p.votesFor,
            p.votesAgainst,
            p.createdAt,
            p.expiresAt,
            p.executed,
            p.cancelled,
            p.approved,
            isProposalExpired(_proposalId),
            p.requiresFullConsent,
            p.borrowedAmount,
            p.borrowedPerPerson
        );
    }
    
    /**
     * @dev Verifica si un usuario votó en una propuesta
     */
    function hasUserVoted(uint256 _proposalId, address _user) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (bool) 
    {
        return proposals[_proposalId].hasVoted[_user];
    }
    
    /**
     * @dev Obtiene los miembros involucrados en una propuesta
     */
    function getProposalInvolvedMembers(uint256 _proposalId) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (address[] memory) 
    {
        return proposals[_proposalId].involvedMembers;
    }
    
    /**
     * @dev Verifica si un usuario está involucrado en una propuesta
     */
    function isUserInvolved(uint256 _proposalId, address _user) 
        external 
        view 
        proposalExists(_proposalId) 
        returns (bool) 
    {
        return proposals[_proposalId].isInvolved[_user];
    }
    
    /**
     * @dev Obtener información completa del fondo
     */
    function getFundInfo() external view returns (
        string memory id,
        string memory name,
        string memory desc,
        address fundCreator,
        string memory creatorNickname,
        uint256 target,
        uint256 currentBalance,
        uint256 totalContrib,
        uint256 contributorCount,
        uint256 proposalCountValue,
        bool active,
        bool private_,
        uint256 approvalPct,
        uint256 minVotes
    ) {
        return (
            fundId,
            tripName,
            description,
            creator,
            getNickname(creator),
            targetAmount,
            address(this).balance,
            totalContributions,
            contributors.length,
            proposalCount,
            fundActive,
            isPrivate,
            approvalPercentage,
            minimumVotes
        );
    }
    
    // ============================================
    // GESTIÓN DEL FONDO
    // ============================================
    
    /**
     * @dev Expulsa a un miembro del grupo devolviéndole su parte proporcional
     * Solo el creador puede ejecutar esta función
     * El miembro recibe: (su contribución / total contribuciones) * balance actual
     * @param _member Dirección del miembro a expulsar
     */
    function kickMember(address _member) external onlyCreator fundIsActive nonReentrant {
        require(_member != address(0), "Direccion invalida");
        require(_member != creator, "No puedes expulsarte a ti mismo");
        require(isContributor[_member], "No es un miembro del grupo");
        require(contributions[_member] > 0, "El miembro no ha contribuido");
        
        uint256 memberContribution = contributions[_member];
        uint256 currentBalance = address(this).balance;
        
        // Calcular parte proporcional: (contribución del miembro / total) * balance actual
        uint256 refundAmount = 0;
        if (currentBalance > 0 && totalContributions > 0) {
            refundAmount = (memberContribution * currentBalance) / totalContributions;
        }
        
        // Remover al miembro del array de contributors
        for (uint256 i = 0; i < contributors.length; i++) {
            if (contributors[i] == _member) {
                // Mover el último elemento a esta posición y reducir el tamaño
                contributors[i] = contributors[contributors.length - 1];
                contributors.pop();
                break;
            }
        }
        
        // Actualizar estado del miembro
        isContributor[_member] = false;
        memberStatus[_member] = MemberStatus.NotInvited;
        totalContributions -= memberContribution;
        contributions[_member] = 0;
        
        // Devolver fondos si hay balance
        if (refundAmount > 0) {
            (bool success, ) = payable(_member).call{value: refundAmount}("");
            require(success, "Fallo al enviar reembolso");
        }
        
        emit MemberKicked(_member, refundAmount, msg.sender);
    }
    
    /**
     * @dev Cierra el fondo y distribuye el balance proporcionalmente entre contribuyentes
     * Solo el creador puede ejecutar esta función
     * Todos los fondos restantes se distribuyen según la proporción de contribución
     */
    function closeFund() external onlyCreator nonReentrant {
        require(fundActive, "El fondo ya esta cerrado");
        require(contributors.length > 0, "No hay contribuyentes para distribuir");
        
        fundActive = false;
        uint256 currentBalance = address(this).balance;
        
        // Si no hay balance, solo cerrar el fondo
        if (currentBalance == 0) {
            emit FundClosed(0);
            return;
        }
        
        // Distribuir proporcionalmente
        for (uint256 i = 0; i < contributors.length; i++) {
            address payable contributor = payable(contributors[i]);
            uint256 contribution = contributions[contributor];
            
            if (contribution > 0) {
                // Calcular proporción: (contribución / total) * balance
                uint256 refundAmount = (contribution * currentBalance) / totalContributions;
                
                if (refundAmount > 0) {
                    (bool success, ) = contributor.call{value: refundAmount}("");
                    require(success, "Fallo al enviar fondos");
                    
                    emit RefundIssued(contributor, refundAmount);
                }
            }
        }
        
        emit FundClosed(currentBalance);
    }
    
    // ============================================
    // FUNCIONES HELPER PRIVADAS
    // ============================================
    
    /**
     * @dev Verifica si un string contiene caracteres especiales
     */
    function _hasSpecialCharacters(string memory str) private pure returns (bool) {
        bytes memory b = bytes(str);
        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            if (!(
                (char >= 0x30 && char <= 0x39) || // 0-9
                (char >= 0x41 && char <= 0x5A) || // A-Z
                (char >= 0x61 && char <= 0x7A)    // a-z
            )) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * @dev Convierte una dirección a string hexadecimal
     */
    function _addressToString(address _addr) private pure returns (string memory) {
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
}
