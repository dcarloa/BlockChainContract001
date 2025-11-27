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
    "function getTotalFunds() view returns (uint256)",
    "event NicknameSet(address indexed user, string nickname)",
    "event FundCreated(address indexed fundAddress, address indexed creator, string fundName, uint8 fundType, uint256 indexed fundIndex)"
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
    "function memberStatus(address) view returns (uint8)",
    "function getNickname(address) view returns (string)",
    "function getContributorsWithNicknames() view returns (address[], string[], uint256[])",
    "function getProposal(uint256) view returns (uint256 id, address proposer, address recipient, uint256 amount, string description, uint256 votesFor, uint256 votesAgainst, uint256 createdAt, bool executed, bool approved)",
    "function hasVoted(uint256, address) view returns (bool)",
    "function deposit() payable",
    "function inviteMemberByNickname(string)",
    "function inviteMemberByAddress(address)",
    "function acceptInvitation()",
    "function createProposal(address, uint256, string) returns (uint256)",
    "function vote(uint256, bool)",
    "function executeProposal(uint256)",
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
            // Mostrar modal de nickname
            document.getElementById('nicknameModal').style.display = 'flex';
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

async function loadDashboard() {
    try {
        showLoading("Cargando tus fondos...");
        
        document.getElementById('dashboardSection').style.display = 'block';
        
        // Cargar fondos del usuario
        await loadUserFunds();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error loading dashboard:", error);
        showToast("Error cargando el dashboard", "error");
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
            fundMap.set(fund.fundAddress, {
                ...fund,
                isCreator: true,
                isParticipant: true
            });
        }
        
        for (const fund of fundsParticipating) {
            if (fundMap.has(fund.fundAddress)) {
                fundMap.get(fund.fundAddress).isParticipant = true;
            } else {
                fundMap.set(fund.fundAddress, {
                    ...fund,
                    isCreator: false,
                    isParticipant: true
                });
            }
        }
        
        allUserFunds = Array.from(fundMap.values());
        
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
            fund.progress = (parseFloat(fund.balance) / parseFloat(fund.target)) * 100;
            
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
    
    return `
        <div class="fund-card" onclick="openFund('${fund.fundAddress}')">
            <div class="fund-card-header">
                <div class="fund-icon">${icon}</div>
                <div class="fund-type-badge">${typeName}</div>
            </div>
            
            <h3 class="fund-name">${fund.fundName}</h3>
            
            <div class="fund-stats">
                <div class="fund-stat">
                    <span class="fund-stat-label">Balance</span>
                    <span class="fund-stat-value">${parseFloat(fund.balance || 0).toFixed(2)} ETH</span>
                </div>
                <div class="fund-stat">
                    <span class="fund-stat-label">Meta</span>
                    <span class="fund-stat-value">${parseFloat(fund.target || 0).toFixed(2)} ETH</span>
                </div>
            </div>
            
            <div class="fund-progress">
                <div class="fund-progress-bar">
                    <div class="fund-progress-fill" style="width: ${Math.min(fund.progress || 0, 100)}%"></div>
                </div>
                <span class="fund-progress-text">${(fund.progress || 0).toFixed(1)}%</span>
            </div>
            
            <div class="fund-meta">
                <span>👥 ${fund.contributors || 0} miembros</span>
                <span>📊 ${fund.proposals || 0} propuestas</span>
                ${fund.isCreator ? '<span class="creator-badge">👑 Creador</span>' : ''}
            </div>
        </div>
    `;
}

let currentFund = null;
let currentFundContract = null;

async function openFund(fundAddress) {
    try {
        showLoading("Cargando fondo...");
        
        if (!fundAddress) {
            throw new Error("Dirección de fondo inválida");
        }
        
        // Guardar fondo actual
        currentFund = allUserFunds.find(f => f.fundAddress && f.fundAddress.toLowerCase() === fundAddress.toLowerCase());
        if (!currentFund) {
            throw new Error("Fondo no encontrado en tu lista");
        }
        
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
            showToast("Por favor ingresa el nombre del fondo", "warning");
            return;
        }
        
        if (!targetAmount || parseFloat(targetAmount) <= 0) {
            showToast("Por favor ingresa una meta válida", "warning");
            return;
        }
        
        showLoading("Creando fondo...");
        closeCreateFundModal();
        
        const targetAmountWei = ethers.parseEther(targetAmount.toString());
        
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
        const progress = (parseFloat(balanceEth) / parseFloat(targetEth)) * 100;
        
        document.getElementById('fundBalance').textContent = `${parseFloat(balanceEth).toFixed(2)} ETH`;
        document.getElementById('fundTarget').textContent = `${parseFloat(targetEth).toFixed(2)} ETH`;
        document.getElementById('fundProgress').textContent = `${progress.toFixed(1)}%`;
        document.getElementById('fundMembers').textContent = contributors.toString();
        document.getElementById('fundProposals').textContent = proposals.toString();
        document.getElementById('fundProgressBar').style.width = `${Math.min(progress, 100)}%`;
        
        // User contribution
        document.getElementById('userContribution').textContent = `${parseFloat(ethers.formatEther(userContribution)).toFixed(2)} ETH`;
        
        // Check invitation status (1 = Invited, 2 = Active)
        if (memberStatus === 1n) {
            document.getElementById('invitationBanner').style.display = 'flex';
        } else {
            document.getElementById('invitationBanner').style.display = 'none';
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
        showToast("Error al depositar: " + error.message, "error");
    }
}

async function inviteMember() {
    try {
        const addressOrNickname = document.getElementById('inviteAddress').value.trim();
        
        if (!addressOrNickname) {
            showToast("Por favor ingresa un nickname o dirección", "warning");
            return;
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
        showToast("Error al invitar: " + error.message, "error");
    }
}

async function acceptInvitation() {
    try {
        showLoading("Aceptando invitación...");
        
        const tx = await currentFundContract.acceptInvitation();
        await tx.wait();
        
        showToast("✅ Invitación aceptada! Ahora eres miembro activo", "success");
        
        // Reload fund details
        await loadFundDetailView();
        
        hideLoading();
        
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
        
        // Reload proposals
        await loadProposals();
        
        // Switch to vote tab
        switchFundTab('vote');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error creating proposal:", error);
        showToast("Error al crear propuesta: " + error.message, "error");
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
                
                return `
                    <div class="member-card">
                        <div class="member-avatar">${nickname.substring(0, 2).toUpperCase()}</div>
                        <div class="member-info">
                            <h4>${nickname} ${isCreator ? '👑' : ''}</h4>
                            <p>${address}</p>
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
        const proposalCount = await currentFundContract.proposalCount();
        
        const proposalsList = document.getElementById('proposalsList');
        const noProposals = document.getElementById('noProposals');
        
        if (proposalCount === 0n) {
            proposalsList.innerHTML = '';
            noProposals.style.display = 'flex';
        } else {
            noProposals.style.display = 'none';
            
            const proposals = [];
            for (let i = 0; i < Number(proposalCount); i++) {
                try {
                    const proposal = await currentFundContract.getProposal(i);
                    const hasVoted = await currentFundContract.hasVoted(i, userAddress);
                    
                    // Get nicknames
                    const proposerNickname = await currentFundContract.getNickname(proposal.proposer);
                    const recipientNickname = await currentFundContract.getNickname(proposal.recipient);
                    
                    proposals.push({
                        id: i,
                        ...proposal,
                        proposerNickname,
                        recipientNickname,
                        hasVoted
                    });
                } catch (err) {
                    console.error(`Error loading proposal ${i}:`, err);
                }
            }
            
            proposalsList.innerHTML = proposals.filter(p => !p.executed).map(proposal => {
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
                            <span>👤 Por: ${proposal.proposerNickname}</span>
                            <span>🎯 Para: ${proposal.recipientNickname}</span>
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
