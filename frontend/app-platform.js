// FundHub Platform - Multi-Fund Management
// Este archivo gestiona la interfaz principal con múltiples fondos

// ============================================
// ABI CONTRACTS
// ============================================

const FUND_FACTORY_ABI = [
    "function setNickname(string) external",
    "function getNickname(address) view returns (string)",
    "function isNicknameAvailable(string) view returns (bool)",
    "function getAddressByNickname(string) view returns (address)",
    "function createFund(string, string, uint256, bool, uint256, uint256, uint8) external returns (address)",
    "function getFundsByCreator(address) view returns (tuple(address fundAddress, address creator, string fundName, uint8 fundType, uint256 createdAt, bool isActive)[])",
    "function getFundsByParticipant(address) view returns (tuple(address fundAddress, address creator, string fundName, uint8 fundType, uint256 createdAt, bool isActive)[])",
    "function getAllFunds(uint256, uint256) view returns (tuple(address fundAddress, address creator, string fundName, uint8 fundType, uint256 createdAt, bool isActive)[])",
    "function getTotalFunds() view returns (uint256)",
    "function deactivateFund(address) external",
    "function registerParticipant(address, uint256) external",
    "event NicknameSet(address indexed user, string nickname)",
    "event FundCreated(address indexed fundAddress, address indexed creator, string fundName, uint8 fundType, uint256 indexed fundIndex)",
    "event FundDeactivated(address indexed fundAddress, address indexed creator, uint256 indexed fundIndex)"
];

const TRAVEL_FUND_V2_ABI = [
    "function getBalance() view returns (uint256)",
    "function totalContributions() view returns (uint256)",
    "function proposalCount() view returns (uint256)",
    "function getContributorCount() view returns (uint256)",
    "function tripName() view returns (string)",
    "function description() view returns (string)",
    "function targetAmount() view returns (uint256)",
    "function isPrivate() view returns (bool)",
    "function fundActive() view returns (bool)"
];

const TRAVEL_FUND_V2_ABI_FULL = [
    "function getBalance() view returns (uint256)",
    "function totalContributions() view returns (uint256)",
    "function proposalCount() view returns (uint256)",
    "function getContributorCount() view returns (uint256)",
    "function tripName() view returns (string)",
    "function description() view returns (string)",
    "function targetAmount() view returns (uint256)",
    "function isPrivate() view returns (bool)",
    "function fundActive() view returns (bool)",
    "function creator() view returns (address)",
    "function contributions(address) view returns (uint256)",
    "function isContributor(address) view returns (bool)",
    "function memberStatus(address) view returns (uint8)",
    "function getNickname(address) view returns (string)",
    "function getContributorsWithNicknames() view returns (address[], string[], uint256[])",
    "function getProposal(uint256) view returns (uint256 id, address proposer, string proposerNickname, address recipient, string recipientNickname, uint256 amount, string proposalDescription, uint256 votesFor, uint256 votesAgainst, uint256 createdAt, uint256 expiresAt, bool executed, bool cancelled, bool approved, bool expired)",
    "function hasUserVoted(uint256, address) view returns (bool)",
    "function deposit() payable",
    "function inviteMemberByNickname(string)",
    "function inviteMemberByAddress(address)",
    "function acceptInvitation()",
    "function createProposal(address, uint256, string) returns (uint256)",
    "function vote(uint256, bool)",
    "function executeProposal(uint256)",
    "function closeFund()",
    "event ContributionReceived(address indexed contributor, uint256 amount, uint256 totalContributions)",
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 amount, string description)",
    "event VoteCast(uint256 indexed proposalId, address indexed voter, bool inFavor)"
];

// ============================================
// GLOBAL STATE
// ============================================

let provider = null;
let signer = null;
let factoryContract = null;
let userAddress = null;
let userNickname = null;
let metamaskProviderDirect = null;

let allUserFunds = [];
let currentFilter = 'all';

// ============================================
// INITIALIZATION
// ============================================

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 FundHub Platform iniciando...");
    
    // Setup MetaMask provider (usar referencia directa como en V2)
    if (window.ethereum) {
        if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
            console.log(`📦 Detectados ${window.ethereum.providers.length} proveedores`);
            
            metamaskProviderDirect = window.ethereum.providers.find(p => {
                return p.isMetaMask && !p.isCoinbaseWallet && !p.overrideIsMetaMask;
            });
            
            if (!metamaskProviderDirect) {
                metamaskProviderDirect = window.ethereum.providers.find(p => p.isMetaMask);
            }
            
            if (metamaskProviderDirect) {
                console.log("✅ MetaMask encontrado en array de proveedores");
            }
        } else if (window.ethereum.isMetaMask) {
            metamaskProviderDirect = window.ethereum;
            console.log("✅ MetaMask detectado como proveedor único");
        }
    }
    
    setupEventListeners();
    await loadFactoryInfo();
});

function setupEventListeners() {
    // Dashboard
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('setNicknameBtn').addEventListener('click', setNickname);
    document.getElementById('createFundBtn').addEventListener('click', showCreateFundModal);
    document.getElementById('createFundForm').addEventListener('submit', createFund);
    document.getElementById('backToDashboard').addEventListener('click', backToDashboard);
    
    // Fund Detail Actions
    document.getElementById('depositBtn').addEventListener('click', depositToFund);
    document.getElementById('inviteBtn').addEventListener('click', inviteMember);
    document.getElementById('createProposalBtn').addEventListener('click', createProposal);
    document.getElementById('acceptInvitationBtn').addEventListener('click', acceptInvitation);
    document.getElementById('previewCloseFundBtn').addEventListener('click', previewCloseFund);
    document.getElementById('closeFundBtn').addEventListener('click', closeFund);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterFunds();
        });
    });
    
    // Fund Tab buttons
    document.querySelectorAll('.fund-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            switchFundTab(tab);
        });
    });
}

// ============================================
// WALLET CONNECTION
// ============================================

async function connectWallet() {
    try {
        showLoading("Conectando con MetaMask...");
        console.log("🔌 Iniciando conexión de wallet...");
        
        if (!metamaskProviderDirect) {
            hideLoading();
            showToast("⚠️ MetaMask no detectado. Por favor instala la extensión.", "error");
            return;
        }
        
        console.log("✅ Usando referencia directa a MetaMask");
        
        // Request account access
        await metamaskProviderDirect.request({ method: 'eth_requestAccounts' });
        
        // Create provider and signer
        provider = new ethers.BrowserProvider(metamaskProviderDirect);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        
        console.log("✅ Wallet conectada:", userAddress);
        
        // Verify network
        const network = await provider.getNetwork();
        if (network.chainId !== 31337n) {
            hideLoading();
            showToast("⚠️ Por favor cambia a la red Hardhat Local (Chain ID: 31337)", "warning");
            return;
        }
        
        // Update UI
        document.getElementById('connectWallet').innerHTML = `
            <span class="btn-icon">✅</span>
            <span>${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>
        `;
        document.getElementById('connectWallet').disabled = true;
        
        // Load factory contract
        await loadFactoryContract();
        
        // Check if user has nickname
        await checkUserNickname();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("❌ Error conectando wallet:", error);
        showToast("Error al conectar wallet: " + error.message, "error");
    }
}

async function loadFactoryInfo() {
    try {
        const response = await fetch('/factory-info.json');
        const factoryInfo = await response.json();
        console.log("📄 Factory info cargada:", factoryInfo.address);
        return factoryInfo;
    } catch (error) {
        console.error("Error cargando factory info:", error);
        return null;
    }
}

async function loadFactoryContract() {
    try {
        const factoryInfo = await loadFactoryInfo();
        if (!factoryInfo) {
            throw new Error("No se pudo cargar la información del Factory");
        }
        
        factoryContract = new ethers.Contract(
            factoryInfo.address,
            FUND_FACTORY_ABI,
            signer
        );
        
        console.log("✅ Factory contract conectado:", factoryInfo.address);
    } catch (error) {
        console.error("Error loading factory contract:", error);
        showToast("Error cargando el contrato Factory", "error");
    }
}

// ============================================
// NICKNAME MANAGEMENT
// ============================================

async function checkUserNickname() {
    try {
        showLoading("Verificando nickname...");
        
        const nickname = await factoryContract.getNickname(userAddress);
        
        // Si el nickname es igual a la dirección, no tiene nickname
        if (nickname.toLowerCase() === userAddress.toLowerCase()) {
            // No tiene nickname - es opcional, mostrar opción pero permitir continuar
            userNickname = null;
            document.getElementById('nicknameModal').style.display = 'flex';
            // Agregar botón para saltar el nickname
            const modal = document.getElementById('nicknameModal');
            if (!modal.querySelector('.skip-nickname-btn')) {
                const skipBtn = document.createElement('button');
                skipBtn.className = 'btn btn-secondary skip-nickname-btn';
                skipBtn.textContent = 'Continuar sin nickname';
                skipBtn.onclick = skipNickname;
                modal.querySelector('.modal-content').appendChild(skipBtn);
            }
            hideLoading();
        } else {
            // Usuario tiene nickname
            userNickname = nickname;
            document.getElementById('nicknameDisplay').textContent = userNickname;
            document.getElementById('userNickname').style.display = 'flex';
            
            // Cargar dashboard
            await loadDashboard();
            hideLoading();
        }
        
    } catch (error) {
        hideLoading();
        console.error("Error checking nickname:", error);
        showToast("Error verificando nickname", "error");
    }
}

async function skipNickname() {
    // Cerrar el modal y cargar dashboard sin nickname
    document.getElementById('nicknameModal').style.display = 'none';
    userNickname = null;
    await loadDashboard();
}

async function setNickname() {
    try {
        const nickname = document.getElementById('nicknameInput').value.trim();
        
        if (!nickname) {
            showToast("Por favor ingresa un nickname", "warning");
            return;
        }
        
        if (nickname.length < 3 || nickname.length > 32) {
            showToast("El nickname debe tener entre 3 y 32 caracteres", "warning");
            return;
        }
        
        // Validar que solo contenga letras y números
        if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
            showToast("Solo se permiten letras y números", "warning");
            return;
        }
        
        showLoading("Estableciendo nickname...");
        
        // Verificar disponibilidad
        const isAvailable = await factoryContract.isNicknameAvailable(nickname);
        if (!isAvailable) {
            hideLoading();
            showToast("Este nickname ya está en uso. Elige otro.", "warning");
            return;
        }
        
        // Set nickname
        const tx = await factoryContract.setNickname(nickname);
        await tx.wait();
        
        userNickname = nickname;
        document.getElementById('nicknameDisplay').textContent = userNickname;
        document.getElementById('userNickname').style.display = 'flex';
        
        // Cerrar modal
        document.getElementById('nicknameModal').style.display = 'none';
        
        showToast(`✅ Nickname "${userNickname}" establecido correctamente!`, "success");
        
        // Cargar dashboard
        await loadDashboard();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error setting nickname:", error);
        showToast("Error al establecer nickname: " + error.message, "error");
    }
}

// ============================================
// DASHBOARD
// ============================================

function getFundTypeIcon(fundType) {
    const icons = ['🌴', '💰', '🤝', '🎯'];
    return icons[fundType] || '🎯';
}

async function loadDashboard() {
    try {
        showLoading("Cargando tus fondos...");
        
        document.getElementById('dashboardSection').classList.add('active');
        
        // Cargar fondos del usuario
        await loadUserFunds();
        
        // Cargar invitaciones pendientes
        await loadPendingInvitations();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error loading dashboard:", error);
        showToast("Error cargando el dashboard", "error");
    }
}

async function loadPendingInvitations() {
    try {
        const invitationsList = document.getElementById('invitationsList');
        const pendingSection = document.getElementById('pendingInvitationsSection');
        const invitationsCountEl = document.getElementById('invitationsCount');
        
        invitationsList.innerHTML = '';
        
        let pendingCount = 0;
        
        // Get total number of funds
        const totalFunds = await factoryContract.getTotalFunds();
        console.log(`🔍 Buscando invitaciones en ${totalFunds} fondos totales...`);
        
        if (totalFunds === 0n) {
            pendingSection.style.display = 'none';
            return;
        }
        
        // Get all funds (in batches if needed)
        const batchSize = 50;
        const fundsToCheck = Number(totalFunds) > batchSize ? batchSize : Number(totalFunds);
        const allFunds = await factoryContract.getAllFunds(0, fundsToCheck);
        
        console.log(`📋 Revisando ${allFunds.length} fondos para invitaciones...`);
        
        // Check each fund for pending invitations
        for (const fund of allFunds) {
            try {
                const fundAddress = fund.fundAddress || fund[0];
                const fundContract = new ethers.Contract(
                    fundAddress,
                    TRAVEL_FUND_V2_ABI_FULL,
                    signer
                );
                
                const memberStatus = await fundContract.memberStatus(userAddress);
                
                // Status 1 = Invited (pending)
                if (memberStatus === 1n) {
                    pendingCount++;
                    
                    const fundName = fund.fundName || fund[2] || 'Sin nombre';
                    const creator = fund.creator || fund[1];
                    const fundType = fund.fundType !== undefined ? fund.fundType : (fund[3] || 0n);
                    
                    console.log(`🎫 Invitación encontrada: ${fundName}`);
                    
                    // Try to get creator nickname
                    let creatorDisplay = `${creator.slice(0, 6)}...${creator.slice(-4)}`;
                    try {
                        const creatorNickname = await factoryContract.getNickname(creator);
                        if (creatorNickname) {
                            creatorDisplay = creatorNickname;
                        }
                    } catch (e) {
                        // Use address if nickname fails
                    }
                    
                    const invitationItem = document.createElement('div');
                    invitationItem.className = 'invitation-item';
                    invitationItem.innerHTML = `
                        <div class="invitation-item-info">
                            <h4>
                                ${getFundTypeIcon(Number(fundType))}
                                ${fundName}
                            </h4>
                            <p>Invitado por: ${creatorDisplay}</p>
                        </div>
                        <div class="invitation-item-actions">
                            <button class="btn btn-success btn-sm" onclick="acceptFundInvitation('${fundAddress}', '${fundName}')">
                                ✅ Aceptar
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="openInvitedFund('${fundAddress}')">
                                👁️ Ver
                            </button>
                        </div>
                    `;
                    
                    invitationsList.appendChild(invitationItem);
                }
            } catch (error) {
                console.log(`⚠️ Error checking fund ${fund.fundAddress}:`, error.message);
                // Continue with next fund
            }
        }
        
        console.log(`✅ ${pendingCount} invitaciones pendientes encontradas`);
        
        if (pendingCount > 0) {
            pendingSection.style.display = 'block';
            invitationsCountEl.textContent = pendingCount;
        } else {
            pendingSection.style.display = 'none';
        }
        
    } catch (error) {
        console.error("Error loading pending invitations:", error);
        // Hide section on error
        document.getElementById('pendingInvitationsSection').style.display = 'none';
    }
}

window.acceptFundInvitation = async function(fundAddress, fundName) {
    try {
        showLoading(`Aceptando invitación a ${fundName}...`);
        
        const fundContract = new ethers.Contract(
            fundAddress,
            TRAVEL_FUND_V2_ABI_FULL,
            signer
        );
        
        const tx = await fundContract.acceptInvitation();
        await tx.wait();
        
        // BUG 4 FIX: Register participant in Factory after accepting invitation
        console.log("🔗 Registering participant in Factory...");
        try {
            const fundIndex = await findFundIndex(fundAddress);
            if (fundIndex !== null) {
                const registerTx = await factoryContract.registerParticipant(userAddress, fundIndex);
                await registerTx.wait();
                console.log("✅ Participant registered in Factory");
            }
        } catch (regError) {
            console.warn("⚠️ Could not register participant in Factory:", regError.message);
            // Continue anyway - user is still a member of the fund
        }
        
        showToast(`✅ Invitación aceptada! Ahora eres miembro de ${fundName}`, "success");
        
        // Force complete reload: clear state and reload everything
        allUserFunds = [];
        await loadUserFunds();
        await loadPendingInvitations();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error accepting invitation:", error);
        showToast("Error al aceptar invitación: " + error.message, "error");
    }
}

window.openInvitedFund = async function(fundAddress) {
    try {
        showLoading("Cargando detalles del fondo...");
        
        // Get fund info from factory
        const totalFunds = await factoryContract.getTotalFunds();
        const allFunds = await factoryContract.getAllFunds(0, Number(totalFunds));
        
        const fundInfo = allFunds.find(f => {
            const addr = f.fundAddress || f[0];
            return addr.toLowerCase() === fundAddress.toLowerCase();
        });
        
        if (!fundInfo) {
            throw new Error("Fondo no encontrado");
        }
        
        // Create temporary fund object
        currentFund = {
            fundAddress: fundInfo.fundAddress || fundInfo[0],
            creator: fundInfo.creator || fundInfo[1],
            fundName: fundInfo.fundName || fundInfo[2] || 'Sin nombre',
            fundType: fundInfo.fundType !== undefined ? fundInfo.fundType : (fundInfo[3] || 0n),
            createdAt: fundInfo.createdAt || fundInfo[4],
            isActive: fundInfo.isActive !== undefined ? fundInfo.isActive : (fundInfo[5] || true),
            isCreator: false,
            isParticipant: true
        };
        
        // Create contract instance
        currentFundContract = new ethers.Contract(
            fundAddress,
            TRAVEL_FUND_V2_ABI_FULL,
            signer
        );
        
        // Navigate to fund detail
        document.getElementById('dashboardSection').classList.remove('active');
        document.getElementById('fundDetailSection').classList.add('active');
        
        // Load fund details
        await loadFundDetailView();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error opening invited fund:", error);
        showToast("Error al abrir el fondo: " + error.message, "error");
    }
}

async function loadUserFunds() {
    try {
        // Obtener fondos creados por el usuario
        const fundsCreated = await factoryContract.getFundsByCreator(userAddress);
        
        // Obtener fondos donde participa
        const fundsParticipating = await factoryContract.getFundsByParticipant(userAddress);
        
        console.log("Fondos creados:", fundsCreated.length);
        console.log("Fondos participando:", fundsParticipating.length);
        
        // Combinar y eliminar duplicados
        const fundMap = new Map();
        
        for (const fund of fundsCreated) {
            const fundData = {
                fundAddress: fund.fundAddress || fund[0],
                creator: fund.creator || fund[1],
                fundName: fund.fundName || fund[2] || 'Sin nombre',
                fundType: fund.fundType !== undefined ? fund.fundType : (fund[3] || 0n),
                createdAt: fund.createdAt || fund[4],
                isActive: fund.isActive !== undefined ? fund.isActive : (fund[5] || true),
                isCreator: true,
                isParticipant: true
            };
            console.log("Fund creado:", fundData);
            fundMap.set(fundData.fundAddress, fundData);
        }
        
        for (const fund of fundsParticipating) {
            const fundAddress = fund.fundAddress || fund[0];
            if (fundMap.has(fundAddress)) {
                fundMap.get(fundAddress).isParticipant = true;
            } else {
                const fundData = {
                    fundAddress: fundAddress,
                    creator: fund.creator || fund[1],
                    fundName: fund.fundName || fund[2] || 'Sin nombre',
                    fundType: fund.fundType !== undefined ? fund.fundType : (fund[3] || 0n),
                    createdAt: fund.createdAt || fund[4],
                    isActive: fund.isActive !== undefined ? fund.isActive : (fund[5] || true),
                    isCreator: false,
                    isParticipant: true
                };
                console.log("Fund participando:", fundData);
                fundMap.set(fundData.fundAddress, fundData);
            }
        }
        
        allUserFunds = Array.from(fundMap.values());
        console.log("Total fondos cargados:", allUserFunds.length, allUserFunds);
        
        // Cargar detalles de cada fondo
        await loadAllFundsDetails();
        
        // Actualizar estadísticas
        updateStats();
        
        // Mostrar fondos
        displayFunds();
        
    } catch (error) {
        console.error("Error loading user funds:", error);
        showToast("Error cargando tus fondos", "error");
    }
}

async function loadAllFundsDetails() {
    // Cargar detalles adicionales de cada fondo (balance, etc.)
    for (let fund of allUserFunds) {
        try {
            if (!fund.fundAddress) {
                console.warn("Fund sin dirección, saltando...");
                continue;
            }
            
            const fundContract = new ethers.Contract(
                fund.fundAddress,
                TRAVEL_FUND_V2_ABI,
                provider
            );
            
            const balance = await fundContract.getBalance();
            const contributors = await fundContract.getContributorCount();
            const proposals = await fundContract.proposalCount();
            const target = await fundContract.targetAmount();
            
            fund.balance = ethers.formatEther(balance);
            fund.contributors = Number(contributors);
            fund.proposals = Number(proposals);
            fund.target = ethers.formatEther(target);
            // Si target es 0, no hay meta (sin límite)
            fund.progress = parseFloat(fund.target) > 0 
                ? (parseFloat(fund.balance) / parseFloat(fund.target)) * 100 
                : 0;
            
        } catch (error) {
            console.error(`Error loading details for fund ${fund.fundAddress}:`, error);
        }
    }
}

function updateStats() {
    const createdCount = allUserFunds.filter(f => f.isCreator).length;
    const participatingCount = allUserFunds.length;
    const totalValue = allUserFunds.reduce((sum, f) => sum + parseFloat(f.balance || 0), 0);
    
    document.getElementById('totalFundsCreated').textContent = createdCount;
    document.getElementById('totalFundsParticipating').textContent = participatingCount;
    document.getElementById('totalValueLocked').textContent = totalValue.toFixed(2);
    
    // Update filter counts
    document.getElementById('countAll').textContent = allUserFunds.length;
    document.getElementById('countCreated').textContent = createdCount;
    document.getElementById('countParticipating').textContent = participatingCount;
    document.getElementById('countTravel').textContent = allUserFunds.filter(f => f.fundType === 0n).length;
    document.getElementById('countSavings').textContent = allUserFunds.filter(f => f.fundType === 1n).length;
    document.getElementById('countShared').textContent = allUserFunds.filter(f => f.fundType === 2n).length;
}

function displayFunds() {
    filterFunds();
}

function filterFunds() {
    let filteredFunds = [...allUserFunds];
    
    switch(currentFilter) {
        case 'created':
            filteredFunds = filteredFunds.filter(f => f.isCreator);
            break;
        case 'participating':
            filteredFunds = filteredFunds.filter(f => f.isParticipant);
            break;
        case 'travel':
            filteredFunds = filteredFunds.filter(f => f.fundType === 0n);
            break;
        case 'savings':
            filteredFunds = filteredFunds.filter(f => f.fundType === 1n);
            break;
        case 'shared':
            filteredFunds = filteredFunds.filter(f => f.fundType === 2n);
            break;
    }
    
    const fundsGrid = document.getElementById('fundsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredFunds.length === 0) {
        fundsGrid.innerHTML = '';
        emptyState.style.display = 'flex';
    } else {
        emptyState.style.display = 'none';
        fundsGrid.innerHTML = filteredFunds.map(fund => createFundCard(fund)).join('');
    }
}

function createFundCard(fund) {
    const fundTypeIcons = ['🌴', '💰', '🤝', '🎯'];
    const fundTypeNames = ['Viaje', 'Ahorro', 'Compartido', 'Otro'];
    
    const icon = fundTypeIcons[Number(fund.fundType)] || '🎯';
    const typeName = fundTypeNames[Number(fund.fundType)] || 'Otro';
    const isInactive = !fund.isActive;
    
    return `
        <div class="fund-card ${isInactive ? 'fund-inactive' : ''}" onclick="openFund('${fund.fundAddress}')">
            <div class="fund-card-content">
                ${fund.isCreator && fund.isActive ? `
                <button class="fund-delete-btn" onclick="event.stopPropagation(); deleteFund('${fund.fundAddress}', '${fund.fundName}')" title="Desactivar fondo">
                    ✕
                </button>
                ` : ''}
                
                <div class="fund-card-header">
                    <div class="fund-icon">${icon}</div>
                    <div class="fund-card-title">
                        <h3>${fund.fundName}</h3>
                        <div class="fund-badges">
                            <span class="badge badge-type type-${typeName.toLowerCase()}">${typeName}</span>
                            ${isInactive ? '<span class="badge badge-status status-inactive">Inactivo</span>' : ''}
                            ${fund.isCreator ? '<span class="badge badge-creator">👑 Creador</span>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="fund-stats">
                    <div class="fund-stat">
                        <span class="fund-stat-label">Balance</span>
                        <span class="fund-stat-value">${parseFloat(fund.balance || 0).toFixed(2)} ETH</span>
                    </div>
                    <div class="fund-stat">
                        <span class="fund-stat-label">${parseFloat(fund.target || 0) > 0 ? 'Meta' : 'Límite'}</span>
                        <span class="fund-stat-value">${parseFloat(fund.target || 0) > 0 ? parseFloat(fund.target).toFixed(2) + ' ETH' : 'Sin límite'}</span>
                    </div>
                </div>
                
                ${parseFloat(fund.target || 0) > 0 ? `
                <div class="fund-progress">
                    <div class="fund-progress-label">
                        <span>Progreso</span>
                        <span>${(fund.progress || 0).toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(fund.progress || 0, 100)}%"></div>
                    </div>
                </div>
                ` : ''}
                
                <div class="fund-meta">
                    <span>👥 ${fund.contributors || 0} miembros</span>
                    <span>📊 ${fund.proposals || 0} propuestas</span>
                </div>
            </div>
        </div>
    `;
}

let currentFund = null;
let currentFundContract = null;

async function openFund(fundAddress) {
    try {
        console.log("openFund llamado con:", fundAddress);
        console.log("allUserFunds:", allUserFunds);
        showLoading("Cargando fondo...");
        
        if (!fundAddress || fundAddress === 'undefined') {
            throw new Error("Dirección de fondo inválida");
        }
        
        // Guardar fondo actual
        currentFund = allUserFunds.find(f => {
            console.log("Buscando:", f.fundAddress, "vs", fundAddress);
            return f.fundAddress && f.fundAddress.toLowerCase() === fundAddress.toLowerCase();
        });
        
        if (!currentFund) {
            console.error("Fondo no encontrado. Direcciones disponibles:", allUserFunds.map(f => f.fundAddress));
            throw new Error("Fondo no encontrado en tu lista");
        }
        
        console.log("Fondo encontrado:", currentFund);
        
        // Crear instancia del contrato del fondo
        currentFundContract = new ethers.Contract(
            fundAddress,
            TRAVEL_FUND_V2_ABI_FULL,
            signer
        );
        
        // Ocultar dashboard, mostrar detalle
        document.getElementById('dashboardSection').classList.remove('active');
        document.getElementById('fundDetailSection').classList.add('active');
        
        // Cargar detalles del fondo
        await loadFundDetailView();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error opening fund:", error);
        showToast("Error al abrir el fondo: " + error.message, "error");
    }
}

function backToDashboard() {
    document.getElementById('fundDetailSection').classList.remove('active');
    document.getElementById('dashboardSection').classList.add('active');
    currentFund = null;
    currentFundContract = null;
}

async function deleteFund(fundAddress, fundName) {
    try {
        const confirmed = confirm(`¿Estás seguro de que deseas desactivar el fondo "${fundName}"?\n\nEsta acción:\n• Marcará el fondo como inactivo\n• No eliminará los fondos del contrato\n• No se puede revertir\n\n¿Continuar?`);
        
        if (!confirmed) return;
        
        showLoading("Desactivando fondo...");
        
        const tx = await factoryContract.deactivateFund(fundAddress);
        await tx.wait();
        
        showToast("✅ Fondo desactivado exitosamente", "success");
        
        // Recargar fondos
        await loadUserFunds();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error deleting fund:", error);
        showToast("Error al desactivar el fondo: " + error.message, "error");
    }
}

// ============================================
// CREATE FUND
// ============================================

function showCreateFundModal() {
    document.getElementById('createFundModal').style.display = 'flex';
}

function closeCreateFundModal() {
    document.getElementById('createFundModal').style.display = 'none';
    document.getElementById('createFundForm').reset();
}

async function createFund(event) {
    event.preventDefault();
    
    try {
        const fundName = document.getElementById('fundName').value.trim();
        const description = document.getElementById('fundDescription').value.trim() || "Sin descripción";
        const targetAmount = document.getElementById('targetAmount').value;
        const isPrivate = document.getElementById('isPrivate').checked;
        const approvalPercentage = document.getElementById('approvalPercentage').value;
        const minimumVotes = document.getElementById('minimumVotes').value;
        const fundType = document.querySelector('input[name="fundType"]:checked').value;
        
        if (!fundName) {
            showToast("Por favor ingresa el nombre del grupo", "warning");
            return;
        }
        
        // targetAmount es opcional - 0 significa sin límite
        const targetAmountValue = targetAmount && parseFloat(targetAmount) > 0 ? parseFloat(targetAmount) : 0;
        
        showLoading("Creando grupo...");
        closeCreateFundModal();
        
        const targetAmountWei = ethers.parseEther(targetAmountValue.toString());
        
        // Crear fondo
        const tx = await factoryContract.createFund(
            fundName,
            description,
            targetAmountWei,
            isPrivate,
            parseInt(approvalPercentage),
            parseInt(minimumVotes),
            parseInt(fundType)
        );
        
        console.log("Transacción enviada:", tx.hash);
        await tx.wait();
        
        showToast(`✅ Fondo "${fundName}" creado exitosamente!`, "success");
        
        // Recargar fondos
        await loadUserFunds();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error creating fund:", error);
        showToast("Error al crear fondo: " + error.message, "error");
    }
}

// ============================================
// UI UTILITIES
// ============================================

/**
 * Find the fund index in Factory's allFunds array
 * @param {string} fundAddress - The fund address to search for
 * @returns {Promise<number|null>} The fund index or null if not found
 */
async function findFundIndex(fundAddress) {
    try {
        const totalFunds = await factoryContract.getTotalFunds();
        console.log(`🔍 Searching for fund ${fundAddress} in ${totalFunds} total funds...`);
        
        // Get all funds at once (more efficient than calling allFunds(i) individually)
        const allFunds = await factoryContract.getAllFunds(0, Number(totalFunds));
        
        // Search for matching address
        for (let i = 0; i < allFunds.length; i++) {
            const fund = allFunds[i];
            const addr = fund.fundAddress || fund[0];
            
            if (addr.toLowerCase() === fundAddress.toLowerCase()) {
                console.log(`✅ Fund found at index ${i}`);
                return i;
            }
        }
        
        console.log(`❌ Fund not found`);
        return null;
    } catch (error) {
        console.error("Error finding fund index:", error);
        return null;
    }
}

function showLoading(text = "Cargando...") {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Helper: Format address for display (0x1234...5678)
function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Helper: Create display text with nickname and address
function formatUserDisplay(nickname, address) {
    if (nickname && nickname !== '0x0000000000000000000000000000000000000000') {
        return `${nickname} (${formatAddress(address)})`;
    }
    return formatAddress(address);
}

// ============================================
// FUND DETAIL VIEW
// ============================================

async function loadFundDetailView() {
    try {
        const fundTypeIcons = ['🌴', '💰', '🤝', '🎯'];
        const fundTypeNames = ['Viaje', 'Ahorro', 'Compartido', 'Otro'];
        
        // Update header
        document.getElementById('fundHeaderIcon').textContent = fundTypeIcons[Number(currentFund.fundType)] || '🎯';
        document.getElementById('fundDetailName').textContent = currentFund.fundName;
        
        // Load contract data
        const description = await currentFundContract.description();
        const balance = await currentFundContract.getBalance();
        const target = await currentFundContract.targetAmount();
        const contributors = await currentFundContract.getContributorCount();
        const proposals = await currentFundContract.proposalCount();
        const isActive = await currentFundContract.fundActive();
        const isPrivate = await currentFundContract.isPrivate();
        const userContribution = await currentFundContract.contributions(userAddress);
        const memberStatus = await currentFundContract.memberStatus(userAddress);
        
        // Update UI
        document.getElementById('fundDetailDescription').textContent = description || 'Sin descripción';
        document.getElementById('fundTypeBadge').textContent = fundTypeNames[Number(currentFund.fundType)];
        document.getElementById('fundStatusBadge').textContent = isActive ? '🟢 Activo' : '🔴 Cerrado';
        document.getElementById('fundPrivacyBadge').textContent = isPrivate ? '🔒 Privado' : '🌐 Público';
        
        const balanceEth = ethers.formatEther(balance);
        const targetEth = ethers.formatEther(target);
        
        document.getElementById('fundBalance').textContent = `${parseFloat(balanceEth).toFixed(2)} ETH`;
        document.getElementById('fundMembers').textContent = contributors.toString();
        document.getElementById('fundProposals').textContent = proposals.toString();
        
        // Si targetAmount es 0, no hay meta - mostrar "Sin límite"
        if (parseFloat(targetEth) === 0) {
            document.getElementById('fundTarget').textContent = 'Sin límite';
            document.getElementById('fundProgress').textContent = '-';
            document.getElementById('fundProgressBar').style.width = '0%';
            // Ocultar la barra de progreso si quieres
            const progressSection = document.querySelector('.progress-section');
            if (progressSection) progressSection.style.display = 'none';
        } else {
            const progress = (parseFloat(balanceEth) / parseFloat(targetEth)) * 100;
            document.getElementById('fundTarget').textContent = `${parseFloat(targetEth).toFixed(2)} ETH`;
            document.getElementById('fundProgress').textContent = `${progress.toFixed(1)}%`;
            document.getElementById('fundProgressBar').style.width = `${Math.min(progress, 100)}%`;
            // Mostrar la barra de progreso
            const progressSection = document.querySelector('.progress-section');
            if (progressSection) progressSection.style.display = 'block';
        }
        
        // User contribution
        document.getElementById('userContribution').textContent = `${parseFloat(ethers.formatEther(userContribution)).toFixed(2)} ETH`;
        
        // Check invitation status (1 = Invited, 2 = Active)
        if (memberStatus === 1n) {
            document.getElementById('invitationBanner').style.display = 'flex';
        } else {
            document.getElementById('invitationBanner').style.display = 'none';
        }
        
        // Show/hide closed fund banner
        if (!isActive) {
            document.getElementById('closedFundBanner').style.display = 'flex';
        } else {
            document.getElementById('closedFundBanner').style.display = 'none';
        }
        
        // Check if user is creator and show/hide manage tab
        const isCreator = userAddress.toLowerCase() === currentFund.creator.toLowerCase();
        const manageTabBtn = document.querySelector('.fund-tab-btn[data-tab="manage"]');
        if (manageTabBtn) {
            manageTabBtn.style.display = isCreator ? 'flex' : 'none';
        }
        
        // If fund is closed, disable all action tabs except Members
        if (!isActive) {
            // Hide action tabs
            const depositTabBtn = document.querySelector('.fund-tab-btn[data-tab="deposit"]');
            const inviteTabBtn = document.querySelector('.fund-tab-btn[data-tab="invite"]');
            const proposeTabBtn = document.querySelector('.fund-tab-btn[data-tab="propose"]');
            const voteTabBtn = document.querySelector('.fund-tab-btn[data-tab="vote"]');
            
            if (depositTabBtn) depositTabBtn.style.display = 'none';
            if (inviteTabBtn) inviteTabBtn.style.display = 'none';
            if (proposeTabBtn) proposeTabBtn.style.display = 'none';
            if (voteTabBtn) voteTabBtn.style.display = 'none';
            if (manageTabBtn) manageTabBtn.style.display = 'none';
            
            // Switch to members tab automatically
            switchFundTab('members');
            
            // Show closed fund message
            showToast("⚠️ Este fondo está cerrado. No se permiten más acciones.", "warning");
        } else {
            // Show all tabs if fund is active
            const depositTabBtn = document.querySelector('.fund-tab-btn[data-tab="deposit"]');
            const inviteTabBtn = document.querySelector('.fund-tab-btn[data-tab="invite"]');
            const proposeTabBtn = document.querySelector('.fund-tab-btn[data-tab="propose"]');
            const voteTabBtn = document.querySelector('.fund-tab-btn[data-tab="vote"]');
            
            if (depositTabBtn) depositTabBtn.style.display = 'flex';
            if (inviteTabBtn) inviteTabBtn.style.display = isCreator ? 'flex' : 'none';
            if (proposeTabBtn) proposeTabBtn.style.display = 'flex';
            if (voteTabBtn) voteTabBtn.style.display = 'flex';
        }
        
        // Load members and proposals
        await loadMembers();
        await loadProposals();
        
    } catch (error) {
        console.error("Error loading fund details:", error);
        showToast("Error cargando detalles del fondo", "error");
    }
}

function switchFundTab(tabName) {
    // Remove active class from all tabs
    document.querySelectorAll('.fund-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab
    document.querySelector(`.fund-tab-btn[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    // Load history when history tab is selected
    if (tabName === 'history') {
        loadHistory();
    }
    
    // Load balances when balances tab is selected
    if (tabName === 'balances') {
        loadBalances();
    }
}

// ============================================
// FUND ACTIONS
// ============================================

async function depositToFund() {
    try {
        const amount = document.getElementById('depositAmount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast("Por favor ingresa un monto válido", "warning");
            return;
        }
        
        // BUG 1 FIX: Add extensive debugging to understand validation failure
        console.log("🔍 DEBUG - Checking deposit permissions...");
        console.log("  Current fund address:", currentFund.fundAddress);
        console.log("  User address:", userAddress);
        console.log("  Current fund contract:", currentFundContract.target);
        
        // Check authorization before attempting deposit
        const memberStatus = await currentFundContract.memberStatus(userAddress);
        const isPrivate = await currentFundContract.isPrivate();
        
        console.log("  Member status:", memberStatus, "(0=None, 1=Invited, 2=Active)");
        console.log("  Is private:", isPrivate);
        
        if (isPrivate && memberStatus === 0n) {
            console.log("❌ BLOCKED: User has no invitation");
            showToast("⚠️ Este es un fondo privado. Necesitas una invitación del creador para participar.", "warning");
            return;
        }
        
        if (isPrivate && memberStatus === 1n) {
            console.log("❌ BLOCKED: User has pending invitation");
            showToast("⚠️ Tienes una invitación pendiente. Acéptala primero en la pestaña 'Invitar' antes de depositar.", "warning");
            return;
        }
        
        console.log("✅ ALLOWED: User can deposit");
        showLoading("Depositando fondos...");
        
        const amountWei = ethers.parseEther(amount);
        const tx = await currentFundContract.deposit({ value: amountWei });
        await tx.wait();
        
        showToast(`✅ Depósito de ${amount} ETH exitoso!`, "success");
        
        // Reload fund details
        await loadFundDetailView();
        
        // Clear input
        document.getElementById('depositAmount').value = '';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error depositing:", error);
        
        // Better error messages
        let errorMsg = "Error al depositar";
        if (error.message.includes("No estas autorizado")) {
            errorMsg = "No estás autorizado para participar en este fondo privado. Necesitas ser invitado primero.";
        } else if (error.message.includes("insufficient funds")) {
            errorMsg = "Fondos insuficientes en tu cuenta";
        } else if (error.message.includes("user rejected")) {
            errorMsg = "Transacción cancelada";
        }
        
        showToast(errorMsg, "error");
    }
}

async function inviteMember() {
    try {
        const addressOrNickname = document.getElementById('inviteAddress').value.trim();
        
        if (!addressOrNickname) {
            showToast("Por favor ingresa un nickname o dirección", "warning");
            return;
        }
        
        // Validate not inviting yourself
        let targetAddress = addressOrNickname;
        if (!addressOrNickname.startsWith('0x')) {
            // It's a nickname, resolve it
            try {
                targetAddress = await factoryContract.getAddressByNickname(addressOrNickname);
                if (targetAddress === ethers.ZeroAddress) {
                    showToast(`❌ El nickname "${addressOrNickname}" no existe`, "error");
                    return;
                }
            } catch (e) {
                showToast(`❌ El nickname "${addressOrNickname}" no existe`, "error");
                return;
            }
        }
        
        // Check if inviting yourself
        if (targetAddress.toLowerCase() === userAddress.toLowerCase()) {
            showToast("⚠️ No puedes invitarte a ti mismo", "warning");
            return;
        }
        
        // Check member status
        const memberStatus = await currentFundContract.memberStatus(targetAddress);
        
        // 🔍 DEBUG: Verificar estado del destinatario
        console.log("🔍 DEBUG - Verificando permiso para invitar...");
        console.log("  Invitador (tú):", userAddress);
        console.log("  Destinatario:", targetAddress);
        console.log("  Fondo:", currentFundContract.target);
        console.log("  memberStatus del destinatario:", memberStatus, "(0=NotInvited, 1=Invited, 2=Active)");
        
        if (memberStatus === 1n) {
            showToast(`⚠️ ${addressOrNickname} ya tiene una invitación pendiente`, "warning");
            return;
        }
        if (memberStatus === 2n) {
            showToast(`⚠️ ${addressOrNickname} ya es miembro activo del fondo`, "warning");
            return;
        }
        try {
            const isContrib = await currentFundContract.isContributor(userAddress);
            const myContribution = await currentFundContract.contributions(userAddress);
            console.log("  isContributor:", isContrib);
            console.log("  Tu contribución:", ethers.formatEther(myContribution), "ETH");
        } catch (e) {
            console.error("  Error verificando isContributor:", e);
        }
        
        showLoading("Enviando invitación...");
        
        let tx;
        if (addressOrNickname.startsWith('0x')) {
            // It's an address
            tx = await currentFundContract.inviteMemberByAddress(addressOrNickname);
        } else {
            // It's a nickname
            tx = await currentFundContract.inviteMemberByNickname(addressOrNickname);
        }
        
        await tx.wait();
        
        showToast(`✅ Invitación enviada a ${addressOrNickname}!`, "success");
        
        // Clear input
        document.getElementById('inviteAddress').value = '';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error inviting member:", error);
        
        let errorMsg = "Error al invitar";
        if (error.message.includes("Ya esta invitado")) {
            errorMsg = "Esta persona ya fue invitada o ya es miembro del fondo";
        } else if (error.message.includes("Nickname not found")) {
            errorMsg = "Nickname no encontrado";
        } else if (error.message.includes("Only creator")) {
            errorMsg = "Solo el creador puede invitar miembros";
        }
        
        showToast(errorMsg, "error");
    }
}

async function acceptInvitation() {
    try {
        showLoading("Aceptando invitación...");
        
        const tx = await currentFundContract.acceptInvitation();
        await tx.wait();
        
        // BUG 4 FIX: Register participant in Factory after accepting invitation
        console.log("🔗 Registering participant in Factory...");
        try {
            const fundIndex = await findFundIndex(currentFund.fundAddress);
            if (fundIndex !== null) {
                const registerTx = await factoryContract.registerParticipant(userAddress, fundIndex);
                await registerTx.wait();
                console.log("✅ Participant registered in Factory");
            }
        } catch (regError) {
            console.warn("⚠️ Could not register participant in Factory:", regError.message);
            // Continue anyway - user is still a member of the fund
        }
        
        showToast("✅ Invitación aceptada! Ahora eres miembro activo", "success");
        
        // BUG 2 FIX: Force complete dashboard reload
        console.log("🔄 Reloading dashboard after accepting invitation...");
        allUserFunds = [];
        await loadUserFunds();
        await loadPendingInvitations();
        
        // PROBLEM 1 FIX: Navigate back to dashboard so user sees fund appear
        console.log("📍 Navigating back to dashboard to show updated funds list");
        hideLoading();
        backToDashboard();
        
    } catch (error) {
        hideLoading();
        console.error("Error accepting invitation:", error);
        showToast("Error al aceptar invitación: " + error.message, "error");
    }
}

async function createProposal() {
    try {
        const recipientInput = document.getElementById('proposalRecipient').value.trim();
        const amount = document.getElementById('proposalAmount').value;
        const description = document.getElementById('proposalDescription').value.trim();
        
        if (!recipientInput) {
            showToast("Por favor ingresa el destinatario", "warning");
            return;
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast("Por favor ingresa un monto válido", "warning");
            return;
        }
        
        if (!description) {
            showToast("Por favor ingresa una descripción", "warning");
            return;
        }
        
        // PROBLEM 2 FIX: Check if user is a contributor before allowing proposal
        const userContribution = await currentFundContract.contributions(userAddress);
        if (userContribution === 0n) {
            showToast("⚠️ Debes depositar fondos antes de crear propuestas. Ve a la pestaña 'Depositar' primero.", "warning");
            return;
        }
        
        showLoading("Creando propuesta...");
        
        // Resolve recipient address
        let recipientAddress;
        if (recipientInput.startsWith('0x')) {
            recipientAddress = recipientInput;
        } else {
            // Get address from nickname via factory
            recipientAddress = await factoryContract.getAddressByNickname(recipientInput);
        }
        
        const amountWei = ethers.parseEther(amount);
        const tx = await currentFundContract.createProposal(recipientAddress, amountWei, description);
        await tx.wait();
        
        showToast("✅ Propuesta creada exitosamente!", "success");
        
        // Clear inputs
        document.getElementById('proposalRecipient').value = '';
        document.getElementById('proposalAmount').value = '';
        document.getElementById('proposalDescription').value = '';
        
        // PROBLEM 2 FIX: Reload proposals and ensure they display
        console.log("🔄 Reloading proposals after creation...");
        await loadProposals();
        
        // Switch to vote tab
        console.log("📍 Switching to vote tab to show new proposal");
        switchFundTab('vote');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error creating proposal:", error);
        
        // PROBLEM 2 FIX: Better error messages for common issues
        let errorMsg = "Error al crear propuesta";
        if (error.message.includes("No eres contribuyente")) {
            errorMsg = "⚠️ Debes depositar fondos antes de crear propuestas. Ve a la pestaña 'Depositar' primero.";
        } else if (error.message.includes("Monto excede limite")) {
            errorMsg = "⚠️ El monto no puede exceder el 80% del balance del fondo";
        } else if (error.message.includes("Only active members")) {
            errorMsg = "⚠️ Solo miembros activos pueden crear propuestas. Acepta tu invitación primero.";
        } else {
            errorMsg = "Error al crear propuesta: " + error.message;
        }
        
        showToast(errorMsg, "error");
    }
}

// ============================================
// LOAD MEMBERS AND PROPOSALS
// ============================================

async function loadMembers() {
    try {
        const [addresses, nicknames, amounts] = await currentFundContract.getContributorsWithNicknames();
        
        const membersList = document.getElementById('membersList');
        const noMembers = document.getElementById('noMembers');
        
        if (addresses.length === 0) {
            membersList.innerHTML = '';
            noMembers.style.display = 'flex';
        } else {
            noMembers.style.display = 'none';
            
            membersList.innerHTML = addresses.map((address, i) => {
                const nickname = nicknames[i];
                const amount = ethers.formatEther(amounts[i]);
                const isCreator = address.toLowerCase() === currentFund.creator.toLowerCase();
                const displayName = nickname || formatAddress(address);
                const avatar = nickname ? nickname.substring(0, 2).toUpperCase() : address.substring(2, 4).toUpperCase();
                
                return `
                    <div class="member-card">
                        <div class="member-avatar">${avatar}</div>
                        <div class="member-info">
                            <h4>${displayName} ${isCreator ? '👑' : ''}</h4>
                            <p class="member-address" title="${address}">${formatAddress(address)}</p>
                        </div>
                        <div class="member-contribution">
                            <span>${parseFloat(amount).toFixed(2)} ETH</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
        
    } catch (error) {
        console.error("Error loading members:", error);
    }
}

async function loadProposals() {
    try {
        console.log("🔍 BUG 3 DEBUG - Loading proposals...");
        const proposalCount = await currentFundContract.proposalCount();
        console.log("  Proposal count:", proposalCount.toString());
        
        const proposalsList = document.getElementById('proposalsList');
        const noProposals = document.getElementById('noProposals');
        
        if (proposalCount === 0n) {
            console.log("  No proposals found, showing empty state");
            proposalsList.innerHTML = '';
            noProposals.style.display = 'flex';
        } else {
            console.log("  Loading", proposalCount.toString(), "proposals...");
            noProposals.style.display = 'none';
            
            const proposals = [];
            // PROBLEM 2 FIX: Proposals are 1-indexed, not 0-indexed
            for (let i = 1; i <= Number(proposalCount); i++) {
                try {
                    console.log(`  Loading proposal ${i}...`);
                    const proposal = await currentFundContract.getProposal(i);
                    console.log(`    Proposal ${i} data:`, proposal);
                    
                    // PROBLEM 2 FIX: Use hasUserVoted instead of hasVoted
                    const hasVoted = await currentFundContract.hasUserVoted(i, userAddress);
                    
                    // PROBLEM 2 FIX: Access proposal data by index (Proxy returns array)
                    // getProposal returns: id, proposer, proposerNickname, recipient, recipientNickname,
                    //                      amount, proposalDescription, votesFor, votesAgainst, createdAt,
                    //                      expiresAt, executed, cancelled, approved, expired
                    const proposalData = {
                        id: proposal[0],
                        proposer: proposal[1],
                        proposerNickname: proposal[2],
                        recipient: proposal[3],
                        recipientNickname: proposal[4],
                        amount: proposal[5],
                        description: proposal[6],
                        votesFor: proposal[7],
                        votesAgainst: proposal[8],
                        createdAt: proposal[9],
                        expiresAt: proposal[10],
                        executed: proposal[11],
                        cancelled: proposal[12],
                        approved: proposal[13],
                        expired: proposal[14],
                        hasVoted
                    };
                    
                    console.log(`    Proposer: ${proposalData.proposerNickname}, Recipient: ${proposalData.recipientNickname}`);
                    console.log(`    Executed: ${proposalData.executed}, Cancelled: ${proposalData.cancelled}`);
                    
                    proposals.push(proposalData);
                } catch (err) {
                    console.error(`Error loading proposal ${i}:`, err);
                }
            }
            
            console.log(`  Total proposals loaded: ${proposals.length}`);
            const activeProposals = proposals.filter(p => !p.executed && !p.cancelled);
            console.log(`  Active proposals (not executed/cancelled): ${activeProposals.length}`);
            
            // PROBLEM 2 FIX: Check if there are active proposals
            if (activeProposals.length === 0) {
                console.log("  No active proposals to display");
                proposalsList.innerHTML = '';
                noProposals.style.display = 'flex';
                return;
            }
            
            // BUG 3 FIX: Filter out both executed AND cancelled proposals
            proposalsList.innerHTML = activeProposals.map(proposal => {
                const amount = ethers.formatEther(proposal.amount);
                const votesFor = Number(proposal.votesFor);
                const votesAgainst = Number(proposal.votesAgainst);
                const totalVotes = votesFor + votesAgainst;
                const percentFor = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
                
                return `
                    <div class="proposal-card">
                        <div class="proposal-header">
                            <h4>Propuesta #${proposal.id}</h4>
                            <span class="proposal-amount">${parseFloat(amount).toFixed(2)} ETH</span>
                        </div>
                        
                        <p class="proposal-description">${proposal.description}</p>
                        
                        <div class="proposal-meta">
                            <span title="${proposal.proposer}">👤 Por: ${formatUserDisplay(proposal.proposerNickname, proposal.proposer)}</span>
                            <span title="${proposal.recipient}">🎯 Para: ${formatUserDisplay(proposal.recipientNickname, proposal.recipient)}</span>
                        </div>
                        
                        <div class="proposal-votes">
                            <div class="vote-bar">
                                <div class="vote-bar-fill" style="width: ${percentFor}%"></div>
                            </div>
                            <div class="vote-counts">
                                <span>✅ ${votesFor} a favor</span>
                                <span>❌ ${votesAgainst} en contra</span>
                            </div>
                        </div>
                        
                        ${proposal.hasVoted ? `
                            <div class="voted-badge">Ya votaste en esta propuesta</div>
                        ` : `
                            <div class="proposal-actions">
                                <button class="btn btn-success" onclick="voteProposal(${proposal.id}, true)">
                                    Votar a Favor
                                </button>
                                <button class="btn btn-danger" onclick="voteProposal(${proposal.id}, false)">
                                    Votar en Contra
                                </button>
                            </div>
                        `}
                        
                        ${proposal.approved && !proposal.executed ? `
                            <button class="btn btn-primary btn-block" onclick="executeProposal(${proposal.id})">
                                ⚡ Ejecutar Propuesta
                            </button>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }
        
    } catch (error) {
        console.error("Error loading proposals:", error);
    }
}

async function voteProposal(proposalId, inFavor) {
    try {
        showLoading("Votando...");
        
        const tx = await currentFundContract.vote(proposalId, inFavor);
        await tx.wait();
        
        showToast(`✅ Voto ${inFavor ? 'a favor' : 'en contra'} registrado!`, "success");
        
        await loadProposals();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error voting:", error);
        showToast("Error al votar: " + error.message, "error");
    }
}

async function executeProposal(proposalId) {
    try {
        showLoading("Ejecutando propuesta...");
        
        const tx = await currentFundContract.executeProposal(proposalId);
        await tx.wait();
        
        showToast("✅ Propuesta ejecutada! Fondos transferidos.", "success");
        
        await loadFundDetailView();
        await loadProposals();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error executing proposal:", error);
        showToast("Error al ejecutar propuesta: " + error.message, "error");
    }
}

async function loadHistory() {
    try {
        const proposalCount = await currentFundContract.proposalCount();
        
        const historyList = document.getElementById('historyList');
        const noHistory = document.getElementById('noHistory');
        
        if (proposalCount === 0n) {
            historyList.innerHTML = '';
            noHistory.style.display = 'flex';
            return;
        }
        
        noHistory.style.display = 'none';
        
        const allProposals = [];
        for (let i = 1; i <= Number(proposalCount); i++) {
            try {
                const proposal = await currentFundContract.getProposal(i);
                const hasVoted = await currentFundContract.hasUserVoted(i, userAddress);
                
                allProposals.push({
                    id: proposal[0],
                    proposer: proposal[1],
                    proposerNickname: proposal[2],
                    recipient: proposal[3],
                    recipientNickname: proposal[4],
                    amount: proposal[5],
                    description: proposal[6],
                    votesFor: proposal[7],
                    votesAgainst: proposal[8],
                    createdAt: proposal[9],
                    expiresAt: proposal[10],
                    executed: proposal[11],
                    cancelled: proposal[12],
                    approved: proposal[13],
                    expired: proposal[14],
                    hasVoted
                });
            } catch (err) {
                console.error(`Error loading proposal ${i}:`, err);
            }
        }
        
        if (allProposals.length === 0) {
            historyList.innerHTML = '';
            noHistory.style.display = 'flex';
            return;
        }
        
        // Sort by ID descending (most recent first)
        allProposals.sort((a, b) => Number(b.id) - Number(a.id));
        
        historyList.innerHTML = allProposals.map(proposal => {
            const amount = ethers.formatEther(proposal.amount);
            const votesFor = Number(proposal.votesFor);
            const votesAgainst = Number(proposal.votesAgainst);
            const totalVotes = votesFor + votesAgainst;
            const percentage = totalVotes > 0 ? (votesFor / totalVotes) * 100 : 0;
            
            // Determine status
            let statusBadge = '';
            let statusClass = '';
            if (proposal.executed) {
                statusBadge = '<span class="status-badge status-executed">✅ Ejecutada</span>';
                statusClass = 'proposal-executed';
            } else if (proposal.cancelled) {
                statusBadge = '<span class="status-badge status-cancelled">❌ Cancelada</span>';
                statusClass = 'proposal-cancelled';
            } else if (proposal.expired) {
                statusBadge = '<span class="status-badge status-expired">⏱️ Expirada</span>';
                statusClass = 'proposal-expired';
            } else if (proposal.approved) {
                statusBadge = '<span class="status-badge status-approved">👍 Aprobada</span>';
                statusClass = 'proposal-approved';
            } else {
                statusBadge = '<span class="status-badge status-active">🕒 Activa</span>';
                statusClass = 'proposal-active';
            }
            
            const createdDate = new Date(Number(proposal.createdAt) * 1000).toLocaleDateString('es-ES');
            
            return `
                <div class="proposal-card ${statusClass}">
                    <div class="proposal-header">
                        <h4>Propuesta #${proposal.id} ${statusBadge}</h4>
                        <span class="proposal-amount">${amount} ETH</span>
                    </div>
                    <p class="proposal-description">${proposal.description}</p>
                    <div class="proposal-meta">
                        <span title="${proposal.proposer}">👤 Por: ${formatUserDisplay(proposal.proposerNickname, proposal.proposer)}</span>
                        <span title="${proposal.recipient}">🎯 Para: ${formatUserDisplay(proposal.recipientNickname, proposal.recipient)}</span>
                    </div>
                    <div class="proposal-meta">
                        <span>📅 Creada: ${createdDate}</span>
                    </div>
                    <div class="proposal-votes">
                        <div class="vote-bar">
                            <div class="vote-bar-fill" style="width: ${percentage}%"></div>
                        </div>
                        <div class="vote-counts">
                            <span class="vote-for">👍 ${votesFor}</span>
                            <span class="vote-against">👎 ${votesAgainst}</span>
                            <span class="vote-percentage">${percentage.toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error loading history:", error);
    }
}

async function loadBalances() {
    try {
        console.log("📊 Calculating balances...");
        
        // Get all members and their contributions
        const [addresses, nicknames, contributions] = await currentFundContract.getContributorsWithNicknames();
        
        if (addresses.length === 0) {
            document.getElementById('balancesList').innerHTML = '';
            document.getElementById('noBalances').style.display = 'flex';
            return;
        }
        
        document.getElementById('noBalances').style.display = 'none';
        
        // Get all executed proposals (expenses)
        const proposalCount = await currentFundContract.proposalCount();
        const executedExpenses = [];
        let totalSpent = 0n;
        
        for (let i = 1; i <= Number(proposalCount); i++) {
            try {
                const proposal = await currentFundContract.getProposal(i);
                // proposal[11] is 'executed'
                if (proposal[11]) {
                    executedExpenses.push({
                        id: proposal[0],
                        recipient: proposal[3],
                        amount: proposal[5]
                    });
                    totalSpent += proposal[5];
                }
            } catch (err) {
                console.error(`Error loading proposal ${i}:`, err);
            }
        }
        
        console.log(`Total executed expenses: ${executedExpenses.length}`);
        console.log(`Total spent: ${ethers.formatEther(totalSpent)} ETH`);
        
        // Calculate total contributions
        let totalContributed = 0n;
        for (let contrib of contributions) {
            totalContributed += contrib;
        }
        
        // Calculate fair share per person (total spent / number of members)
        const memberCount = BigInt(addresses.length);
        const fairSharePerPerson = memberCount > 0n ? totalSpent / memberCount : 0n;
        
        console.log(`Fair share per person: ${ethers.formatEther(fairSharePerPerson)} ETH`);
        
        // Calculate balance for each member
        const balances = [];
        for (let i = 0; i < addresses.length; i++) {
            const contribution = contributions[i];
            const address = addresses[i];
            const nickname = nicknames[i] || formatAddress(address);
            
            // Balance = What they contributed - Their fair share of expenses
            const balance = contribution - fairSharePerPerson;
            
            balances.push({
                address,
                nickname,
                contribution,
                fairShare: fairSharePerPerson,
                balance,
                contributionEth: parseFloat(ethers.formatEther(contribution)),
                fairShareEth: parseFloat(ethers.formatEther(fairSharePerPerson)),
                balanceEth: parseFloat(ethers.formatEther(balance))
            });
        }
        
        // Sort by balance (most positive first)
        balances.sort((a, b) => Number(b.balance - a.balance));
        
        // Update summary stats
        const currentBalance = await currentFundContract.getBalance();
        document.getElementById('totalContributed').textContent = `${parseFloat(ethers.formatEther(totalContributed)).toFixed(4)} ETH`;
        document.getElementById('totalSpent').textContent = `${parseFloat(ethers.formatEther(totalSpent)).toFixed(4)} ETH`;
        document.getElementById('availableBalance').textContent = `${parseFloat(ethers.formatEther(currentBalance)).toFixed(4)} ETH`;
        
        // Render balances
        const balancesList = document.getElementById('balancesList');
        balancesList.innerHTML = balances.map(member => {
            const isPositive = member.balance > 0n;
            const isNegative = member.balance < 0n;
            const statusClass = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
            const statusText = isPositive ? 'Debe recibir' : isNegative ? 'Debe pagar' : 'Equilibrado';
            const statusIcon = isPositive ? '💰' : isNegative ? '💸' : '✅';
            
            const avatar = member.nickname && member.nickname !== formatAddress(member.address)
                ? member.nickname.substring(0, 2).toUpperCase()
                : member.address.substring(2, 4).toUpperCase();
            
            // Check if this is the current user and they owe money
            const isCurrentUser = member.address.toLowerCase() === userAddress.toLowerCase();
            const owesMoneyButton = isCurrentUser && isNegative 
                ? `<button class="btn btn-sm btn-primary" onclick="settleDebt(${Math.abs(member.balanceEth)})">
                       💳 Liquidar mi deuda
                   </button>`
                : '';
            
            return `
                <div class="balance-item ${statusClass}">
                    <div class="balance-item-info">
                        <div class="balance-avatar">${avatar}</div>
                        <div class="balance-details">
                            <div class="balance-name">
                                ${formatUserDisplay(member.nickname, member.address)}
                                ${isCurrentUser ? ' (Tú)' : ''}
                            </div>
                            <div class="balance-breakdown">
                                <span>💰 Aportó: ${member.contributionEth.toFixed(4)} ETH</span>
                                <span>📊 Parte justa: ${member.fairShareEth.toFixed(4)} ETH</span>
                            </div>
                            ${owesMoneyButton}
                        </div>
                    </div>
                    <div class="balance-amount ${statusClass}">
                        ${statusIcon} ${statusText}
                        <br>
                        <strong>${Math.abs(member.balanceEth).toFixed(4)} ETH</strong>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log("✅ Balances calculated and displayed");
        
    } catch (error) {
        console.error("Error loading balances:", error);
        document.getElementById('balancesList').innerHTML = `
            <div class="info-box warning-box">
                <p><strong>⚠️ Error al calcular balances:</strong></p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

/**
 * Quick debt settlement - switches to deposit tab and pre-fills the amount
 * @param {number} amount - Amount owed in ETH
 */
function settleDebt(amount) {
    try {
        // Switch to deposit tab
        switchFundTab('deposit');
        
        // Pre-fill the deposit amount with the exact debt amount
        const depositInput = document.getElementById('depositAmount');
        if (depositInput) {
            depositInput.value = amount.toFixed(4);
            depositInput.focus();
        }
        
        // Show informative message
        showToast(`💳 Monto pre-llenado con tu deuda exacta: ${amount.toFixed(4)} ETH`, 'info');
        
        console.log(`💸 Debt settlement initiated: ${amount} ETH`);
    } catch (error) {
        console.error("Error in settleDebt:", error);
        showToast("Error al preparar liquidación de deuda", "error");
    }
}

// ============================================
// FUND MANAGEMENT
// ============================================

async function previewCloseFund() {
    try {
        showLoading("Calculando distribución...");
        
        // Get fund data
        const balance = await currentFundContract.getBalance();
        const [addresses, nicknames, amounts] = await currentFundContract.getContributorsWithNicknames();
        
        if (addresses.length === 0) {
            showToast("No hay contribuyentes en este fondo", "warning");
            hideLoading();
            return;
        }
        
        const balanceEth = parseFloat(ethers.formatEther(balance));
        
        // Calculate total contributions
        let totalContributions = 0n;
        for (let amount of amounts) {
            totalContributions += amount;
        }
        
        // Build distribution preview
        let distributionHTML = '<div class="distribution-table">';
        distributionHTML += '<table><thead><tr><th>Miembro</th><th>Aportación</th><th>%</th><th>Recibirá</th></tr></thead><tbody>';
        
        for (let i = 0; i < addresses.length; i++) {
            const contribution = amounts[i];
            const contributionEth = parseFloat(ethers.formatEther(contribution));
            const percentage = totalContributions > 0n ? (Number(contribution) / Number(totalContributions)) * 100 : 0;
            const refundAmount = totalContributions > 0n ? (contributionEth * balanceEth) / parseFloat(ethers.formatEther(totalContributions)) : 0;
            
            distributionHTML += `
                <tr>
                    <td><strong>${nicknames[i]}</strong></td>
                    <td>${contributionEth.toFixed(4)} ETH</td>
                    <td>${percentage.toFixed(2)}%</td>
                    <td class="highlight">${refundAmount.toFixed(4)} ETH</td>
                </tr>
            `;
        }
        
        distributionHTML += '</tbody></table></div>';
        distributionHTML += `<div class="total-distribution"><strong>Balance Total a Distribuir:</strong> ${balanceEth.toFixed(4)} ETH</div>`;
        
        document.getElementById('distributionList').innerHTML = distributionHTML;
        document.getElementById('closeFundPreview').style.display = 'block';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error calculating distribution:", error);
        showToast("Error al calcular distribución: " + error.message, "error");
    }
}

async function closeFund() {
    try {
        // Debug: Check creator from contract
        const contractCreator = await currentFundContract.creator();
        console.log("🔍 DEBUG closeFund:");
        console.log("  Contract address:", currentFundContract.target);
        console.log("  Contract creator:", contractCreator);
        console.log("  Current user:", userAddress);
        console.log("  currentFund.creator:", currentFund.creator);
        console.log("  Match:", contractCreator.toLowerCase() === userAddress.toLowerCase());
        
        if (contractCreator.toLowerCase() !== userAddress.toLowerCase()) {
            showToast("⚠️ Solo el creador del fondo puede cerrarlo", "error");
            return;
        }
        
        // Confirmation
        const confirmed = confirm(
            "⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE\n\n" +
            "Se cerrará el fondo permanentemente y se distribuirán todos los fondos restantes proporcionalmente.\n\n" +
            "¿Estás seguro de que deseas continuar?"
        );
        
        if (!confirmed) return;
        
        // Double confirmation
        const doubleConfirmed = confirm(
            "🚨 ÚLTIMA CONFIRMACIÓN\n\n" +
            "Esta es tu última oportunidad para cancelar.\n\n" +
            "¿Realmente deseas cerrar y distribuir el fondo?"
        );
        
        if (!doubleConfirmed) return;
        
        showLoading("Cerrando fondo y distribuyendo...");
        
        const tx = await currentFundContract.closeFund();
        await tx.wait();
        
        hideLoading();
        
        showToast("✅ Fondo cerrado y fondos distribuidos exitosamente!", "success");
        
        // Reload fund details to show closed state
        await loadFundDetailView();
        
    } catch (error) {
        hideLoading();
        console.error("Error closing fund:", error);
        
        let errorMsg = "Error al cerrar el fondo";
        if (error.message.includes("Only creator")) {
            errorMsg = "⚠️ Solo el creador del fondo puede cerrarlo";
        } else if (error.message.includes("ya esta cerrado")) {
            errorMsg = "⚠️ El fondo ya está cerrado";
        } else {
            errorMsg = "Error al cerrar el fondo: " + error.message;
        }
        
        showToast(errorMsg, "error");
    }
}

