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
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('setNicknameBtn').addEventListener('click', setNickname);
    document.getElementById('createFundBtn').addEventListener('click', showCreateFundModal);
    document.getElementById('createFundForm').addEventListener('submit', createFund);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentFilter = e.target.dataset.filter;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterFunds();
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
        await loadFundDetails();
        
        // Actualizar estadísticas
        updateStats();
        
        // Mostrar fondos
        displayFunds();
        
    } catch (error) {
        console.error("Error loading user funds:", error);
        showToast("Error cargando tus fondos", "error");
    }
}

async function loadFundDetails() {
    // Cargar detalles adicionales de cada fondo (balance, etc.)
    for (let fund of allUserFunds) {
        try {
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

function openFund(fundAddress) {
    // Guardar la dirección del fondo en localStorage
    localStorage.setItem('selectedFund', fundAddress);
    // Redirigir a la página del fondo
    window.location.href = `/fund.html?address=${fundAddress}`;
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
