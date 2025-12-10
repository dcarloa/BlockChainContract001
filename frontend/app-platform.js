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
    "function getProposal(uint256) view returns (uint256 id, address proposer, string proposerNickname, address recipient, string recipientNickname, uint256 amount, string proposalDescription, uint256 votesFor, uint256 votesAgainst, uint256 createdAt, uint256 expiresAt, bool executed, bool cancelled, bool approved, bool expired, bool requiresFullConsent, uint256 borrowedAmount, uint256 borrowedPerPerson)",
    "function hasUserVoted(uint256, address) view returns (bool)",
    "function deposit() payable",
    "function inviteMemberByNickname(string)",
    "function inviteMemberByAddress(address)",
    "function acceptInvitation()",
    "function createProposal(address, uint256, string, address[]) returns (uint256)",
    "function vote(uint256, bool)",
    "function executeProposal(uint256)",
    "function closeFund()",
    "function getProposalInvolvedMembers(uint256) view returns (address[])",
    "function isUserInvolved(uint256, address) view returns (bool)",
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
    
    // Initialize Firebase (always) with retry
    let firebaseInitialized = false;
    if (window.FirebaseConfig) {
        firebaseInitialized = await window.FirebaseConfig.initialize();
        
        if (firebaseInitialized) {
            // Setup Firebase auth state listener
            window.FirebaseConfig.onAuthStateChanged = (user) => {
                updateUIForFirebaseUser(user);
            };
        } else {
            console.error("❌ Firebase initialization failed");
            showToast("Firebase initialization failed. Some features may not work.", "error");
        }
    } else {
        console.error("❌ FirebaseConfig not available");
        showToast("Firebase not loaded. Please refresh the page.", "error");
    }
    
    // Load factory info for blockchain mode (only if wallet available)
    if (window.ethereum) {
        await loadFactoryInfo();
        
        // Intentar reconectar wallet automáticamente si ya estaba conectada
        console.log("🔄 Iniciando proceso de auto-reconexión...");
        await autoReconnectWallet();
        console.log("✅ Proceso de auto-reconexión completado");
    } else {
        console.log("ℹ️ No wallet detected - Simple Mode only");
        // Show sign in button for Simple Mode
        document.getElementById('signInSimpleMode').style.display = 'flex';
        document.getElementById('connectWallet').style.display = 'none';
    }
    
    // Show dashboard anyway
    showDashboard();
    
    // Load user funds (both Simple and Blockchain modes)
    await loadUserFunds();
});

function setupEventListeners() {
    // Dashboard
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('disconnectWallet').addEventListener('click', disconnectWallet);
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
        const t = translations[getCurrentLanguage()];
        showLoading(t.app.loading.selectWallet);
        console.log("🔌 Iniciando conexión multi-wallet...");
        
        // Clear disconnect flag when manually connecting
        localStorage.removeItem('walletDisconnected');
        
        // Use the wallet connector to show selector and connect
        const walletResult = await window.walletConnector.showWalletSelector();
        
        console.log("✅ Wallet conectada:", walletResult.walletName, walletResult.address);
        showLoading(`${t.app.loading.connecting} ${walletResult.walletName}...`);
        
        // Create provider and signer from selected wallet
        provider = new ethers.BrowserProvider(walletResult.provider);
        signer = await provider.getSigner();
        userAddress = walletResult.address;
        
        // Verify network
        const network = await provider.getNetwork();
        console.log("🌐 Red detectada:", network.chainId);
        
        // Check if on correct network (Base Sepolia)
        if (network.chainId !== 84532n) {
            hideLoading();
            
            // Show network switcher
            const switchNetwork = confirm(
                `⚠️ Wrong network detected (Chain ID: ${network.chainId})\n\n` +
                `To use this app you need to be on Base Sepolia (Chain ID: 84532)\n\n` +
                `Do you want to switch network automatically?`
            );
            
            if (switchNetwork) {
                try {
                    showLoading(t.app.loading.switchingNetwork);
                    await window.walletConnector.switchNetwork(84532);
                    // Reload after network switch
                    location.reload();
                    return;
                } catch (switchError) {
                    hideLoading();
                    showToast("❌ Error switching network. Please change it manually.", "error");
                    return;
                }
            } else {
                showToast("⚠️ Please switch to Base Sepolia network (Chain ID: 84532)", "warning");
                return;
            }
        }
        
        // Update UI with wallet info
        const walletIcon = walletResult.walletType === 'metamask' ? '🦊' : 
                          walletResult.walletType === 'coinbase' ? '🔵' : '📱';
        
        document.getElementById('connectWallet').innerHTML = `
            <span class="btn-icon">${walletIcon}</span>
            <span>${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>
        `;
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('disconnectWallet').style.display = 'inline-flex';
        
        // Load factory contract
        await loadFactoryContract();
        
        // Check if user has nickname
        await checkUserNickname();
        
        hideLoading();
        showToast(`✅ Conectado con ${walletResult.walletName}`, "success");
        
    } catch (error) {
        hideLoading();
        console.error("❌ Error connecting wallet:", error);
        
        if (error.message.includes('User rejected')) {
            showToast("❌ Connection cancelled by user", "warning");
        } else {
            showToast("❌ Error connecting wallet: " + error.message, "error");
        }
    }
}

async function disconnectWallet() {
    try {
        // Confirm disconnection
        const confirmed = confirm(
            "Are you sure you want to disconnect your wallet?\n\n" +
            "You will be redirected to the home page."
        );
        
        if (!confirmed) {
            return;
        }
        
        const t = translations[getCurrentLanguage()];
        showLoading(t.app.loading.disconnecting);
        
        // Set flag to prevent auto-reconnect
        localStorage.setItem('walletDisconnected', 'true');
        
        // Clear all state
        provider = null;
        signer = null;
        userAddress = null;
        userNickname = null;
        factoryContract = null;
        currentFund = null;
        currentFundContract = null;
        allFunds = [];
        
        // Reset UI
        document.getElementById('connectWallet').innerHTML = `
            <span class="btn-icon">🦊</span>
            <span>Conectar Wallet</span>
        `;
        document.getElementById('connectWallet').style.display = 'inline-flex';
        document.getElementById('connectWallet').disabled = false;
        document.getElementById('connectWallet').style.opacity = '1';
        document.getElementById('disconnectWallet').style.display = 'none';
        document.getElementById('userNickname').style.display = 'none';
        
        // Hide dashboard and fund detail sections
        document.getElementById('dashboardSection').classList.remove('active');
        document.getElementById('fundDetailSection').classList.remove('active');
        
        hideLoading();
        
        // Show success message and redirect
        showToast("✅ Wallet disconnected successfully", "success");
        
        setTimeout(() => {
            showLoading(t.app.loading.redirecting);
            setTimeout(() => {
                window.location.href = '/index.html';
            }, 1000);
        }, 1500);
        
    } catch (error) {
        hideLoading();
        console.error("Error disconnecting wallet:", error);
        showToast("❌ Error disconnecting: " + error.message, "error");
    }
}

async function autoReconnectWallet() {
    try {
        // Check if user manually disconnected
        const wasDisconnected = localStorage.getItem('walletDisconnected');
        if (wasDisconnected === 'true') {
            console.log("🚫 Usuario desconectó manualmente - no auto-reconectar");
            return;
        }
        
        // Verificar si hay una conexión previa guardada
        if (!window.ethereum) {
            console.log("⚠️ No hay wallet disponible");
            return;
        }

        console.log("🔍 Verificando conexión previa...");

        // Usar el proveedor de MetaMask directamente si está disponible
        const ethereumProvider = metamaskProviderDirect || window.ethereum;
        console.log("📱 Usando proveedor:", metamaskProviderDirect ? "MetaMask directo" : "window.ethereum");

        // Intentar obtener cuentas sin solicitar permiso
        const accounts = await ethereumProvider.request({ 
            method: 'eth_accounts' 
        });

        if (!accounts || accounts.length === 0) {
            console.log("ℹ️ No hay cuentas conectadas previamente");
            return;
        }

        console.log("🔄 Reconectando wallet automáticamente...");
        console.log("📍 Cuenta encontrada:", accounts[0]);
        
        // Reconectar silenciosamente usando el mismo proveedor
        provider = new ethers.BrowserProvider(ethereumProvider);
        
        console.log("🔗 Provider creado");
        
        signer = await provider.getSigner();
        userAddress = accounts[0];

        console.log("✍️ Signer obtenido");

        // Verificar red
        const network = await provider.getNetwork();
        console.log("🌐 Red detectada - Chain ID:", network.chainId);
        
        if (network.chainId !== 84532n) {
            console.log("⚠️ Red incorrecta (esperada: 84532), no se reconectará automáticamente");
            return;
        }

        console.log("✅ Red correcta (Base Sepolia)");

        // Actualizar UI
        const walletIcon = '🦊'; // Por defecto MetaMask
        document.getElementById('connectWallet').innerHTML = `
            <span class="btn-icon">${walletIcon}</span>
            <span>${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>
        `;
        document.getElementById('connectWallet').style.display = 'none';
        document.getElementById('disconnectWallet').style.display = 'inline-flex';

        console.log("🎨 UI actualizada");

        // Cargar factory contract
        console.log("📦 Cargando factory contract...");
        await loadFactoryContract();

        // Verificar si tiene nickname - SOLO reconectar si tiene nickname
        console.log("👤 Verificando nickname para cuenta:", userAddress);
        const nickname = await factoryContract.getNickname(userAddress);
        console.log("🏷️  Nickname obtenido:", nickname);
        
        if (nickname.toLowerCase() !== userAddress.toLowerCase()) {
            // Usuario tiene nickname - cargar dashboard automáticamente
            userNickname = nickname;
            console.log("✅ Usuario tiene nickname:", userNickname);
            document.getElementById('nicknameDisplay').textContent = userNickname;
            document.getElementById('userNickname').style.display = 'flex';
            
            try {
                await loadDashboard();
                console.log("✅ Wallet reconectada y dashboard cargado automáticamente");
            } catch (dashboardError) {
                console.error("❌ Error cargando dashboard:", dashboardError);
                throw dashboardError; // Re-lanzar para que el catch general limpie el estado
            }
        } else {
            // Usuario NO tiene nickname - NO reconectar automáticamente
            console.log("ℹ️ Usuario NO tiene nickname, cancelando auto-reconnect");
            
            // Limpiar estado
            provider = null;
            signer = null;
            userAddress = null;
            factoryContract = null;
            
            // Restaurar UI a estado inicial
            document.getElementById('connectWallet').innerHTML = `
                <span class="btn-icon">🦊</span>
                <span>Conectar Wallet</span>
            `;
            document.getElementById('connectWallet').style.display = 'inline-flex';
            document.getElementById('disconnectWallet').style.display = 'none';
            document.getElementById('userNickname').style.display = 'none';
            
            console.log("🔄 Auto-reconnect cancelado - usuario debe conectar manualmente y establecer nickname");
            return; // Salir sin completar el reconnect
        }

        console.log("✅ Proceso de auto-reconexión completado");
    } catch (error) {
        console.error("❌ Error en auto-reconnect:", error);
        console.error("   Mensaje:", error.message);
        
        // Limpiar estado en caso de error
        provider = null;
        signer = null;
        userAddress = null;
        userNickname = null;
        factoryContract = null;
        
        // Restaurar UI a estado inicial
        document.getElementById('connectWallet').innerHTML = `
            <span class="btn-icon">🦊</span>
            <span>Conectar Wallet</span>
        `;
        document.getElementById('connectWallet').style.display = 'inline-flex';
        document.getElementById('disconnectWallet').style.display = 'none';
        document.getElementById('userNickname').style.display = 'none';
        
        // Restaurar el evento click original
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.onclick = connectWallet;
        
        console.log("🔄 Estado restaurado después de error en auto-reconnect");
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
        const t = translations[getCurrentLanguage()];
        showLoading(t.app.loading.verifyingNickname);
        
        const nickname = await factoryContract.getNickname(userAddress);
        
        // Si el nickname es igual a la dirección, no tiene nickname
        if (nickname.toLowerCase() === userAddress.toLowerCase()) {
            // No tiene nickname - OBLIGATORIO establecerlo
            userNickname = null;
            hideLoading();
            document.getElementById('nicknameModal').style.display = 'flex';
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
            showToast("Please enter a nickname", "warning");
            return;
        }
        
        if (nickname.length < 3 || nickname.length > 32) {
            showToast("Nickname must be between 3 and 32 characters", "warning");
            return;
        }
        
        // Validate that it only contains letters and numbers
        if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
            showToast("Only letters and numbers are allowed", "warning");
            return;
        }
        
        showLoading("Verificando nickname actual...");
        
        // Verificar si el usuario ya tiene un nickname
        const currentNickname = await factoryContract.getNickname(userAddress);
        if (currentNickname.toLowerCase() !== userAddress.toLowerCase()) {
            hideLoading();
            showToast(`⚠️ You already have a nickname set: "${currentNickname}"`, "warning");
            // Update UI with existing nickname
            userNickname = currentNickname;
            document.getElementById('nicknameDisplay').textContent = userNickname;
            document.getElementById('userNickname').style.display = 'flex';
            document.getElementById('nicknameModal').style.display = 'none';
            // Cargar dashboard
            await loadDashboard();
            return;
        }
        
        const t = translations[getCurrentLanguage()];
        showLoading(t.app.loading.checkingAvailability);
        
        // Verificar disponibilidad del nickname
        const isAvailable = await factoryContract.isNicknameAvailable(nickname);
        if (!isAvailable) {
            hideLoading();
            showToast("This nickname is already in use. Choose another.", "warning");
            return;
        }
        
        showLoading(t.app.loading.settingNickname);
        
        // Set nickname
        const tx = await factoryContract.setNickname(nickname);
        await tx.wait();
        
        userNickname = nickname;
        document.getElementById('nicknameDisplay').textContent = userNickname;
        document.getElementById('userNickname').style.display = 'flex';
        
        // Cerrar modal
        document.getElementById('nicknameModal').style.display = 'none';
        
        showToast(`✅ Nickname "${userNickname}" set successfully!`, "success");
        
        // Load dashboard
        await loadDashboard();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error setting nickname:", error);
        showToast("Error setting nickname: " + error.message, "error");
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
        const t = translations[getCurrentLanguage()];
        showLoading(t.app.loading.loadingFunds);
        
        document.getElementById('dashboardSection').classList.add('active');
        
        // Cargar fondos del usuario
        await loadUserFunds();
        
        // Cargar invitaciones pendientes
        await loadPendingInvitations();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error loading dashboard:", error);
        showToast("Error loading dashboard", "error");
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
                            <p>Invited by: ${creatorDisplay}</p>
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
        showLoading(`Accepting invitation to ${fundName}...`);
        
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
        
        // Refresh dashboard to show new fund
        allUserFunds = [];
        await refreshCurrentView();
        await loadPendingInvitations();
        
        showToast(`✅ Invitation accepted! You are now a member of ${fundName}`, "success");
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error accepting invitation:", error);
        showToast("Error accepting invitation: " + error.message, "error");
    }
}

window.openInvitedFund = async function(fundAddress) {
    try {
        showLoading("Loading fund details...");
        
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
        showToast("Error opening fund: " + error.message, "error");
    }
}

function showDashboard() {
    // Make sure dashboard section is visible
    document.getElementById('dashboardSection').classList.add('active');
    document.getElementById('fundDetailSection').classList.remove('active');
    
    // Enable create fund button for both modes
    const createBtn = document.getElementById('createFundBtn');
    if (createBtn) {
        createBtn.disabled = false;
        createBtn.style.display = 'flex';
    }
}

function updateUIForFirebaseUser(user) {
    const firebaseUserBadge = document.getElementById('firebaseUser');
    const firebaseUserDisplay = document.getElementById('firebaseUserDisplay');
    const signInBtn = document.getElementById('signInSimpleMode');
    
    if (user) {
        // User is signed in
        console.log("✅ Firebase user signed in:", user.email);
        firebaseUserBadge.style.display = 'flex';
        firebaseUserDisplay.textContent = user.displayName || user.email;
        if (signInBtn) signInBtn.style.display = 'none';
        
        // Reload funds to show Simple Mode groups
        loadUserFunds();
    } else {
        // User is signed out
        console.log("🚪 Firebase user signed out");
        firebaseUserBadge.style.display = 'none';
        if (signInBtn && !window.ethereum) {
            signInBtn.style.display = 'flex';
        }
    }
}

async function loadUserFunds() {
    try {
        const fundMap = new Map();
        
        // Load Blockchain Mode funds (if wallet connected)
        if (factoryContract && userAddress) {
            // Obtener fondos creados por el usuario
            const fundsCreated = await factoryContract.getFundsByCreator(userAddress);
            
            // Obtener fondos donde participa
            const fundsParticipating = await factoryContract.getFundsByParticipant(userAddress);
            
            console.log("Blockchain funds created:", fundsCreated.length);
            console.log("Blockchain funds participating:", fundsParticipating.length);
            
            // Add created funds
            for (const fund of fundsCreated) {
                const fundData = {
                    fundAddress: fund.fundAddress || fund[0],
                    creator: fund.creator || fund[1],
                    fundName: fund.fundName || fund[2] || 'Sin nombre',
                    fundType: fund.fundType !== undefined ? fund.fundType : (fund[3] || 0n),
                    createdAt: fund.createdAt || fund[4],
                    isActive: fund.isActive !== undefined ? fund.isActive : (fund[5] || true),
                    isCreator: true,
                    isParticipant: true,
                    mode: 'blockchain'
                };
                console.log("Blockchain fund created:", fundData);
                fundMap.set(fundData.fundAddress, fundData);
            }
            
            // Add participating funds
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
                        isParticipant: true,
                        mode: 'blockchain'
                    };
                    console.log("Blockchain fund participating:", fundData);
                    fundMap.set(fundData.fundAddress, fundData);
                }
            }
        }
        
        // Load Simple Mode funds (if Firebase authenticated)
        if (window.FirebaseConfig && window.FirebaseConfig.isAuthenticated()) {
            try {
                const currentUser = window.FirebaseConfig.getCurrentUser();
                const userGroups = await window.FirebaseConfig.readDb(`users/${currentUser.uid}/groups`);
                
                if (userGroups) {
                    console.log("Simple mode groups found:", Object.keys(userGroups).length);
                    
                    for (const [groupId, groupInfo] of Object.entries(userGroups)) {
                        const groupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
                        
                        if (groupData && groupData.isActive) {
                            const fundData = {
                                fundAddress: groupId, // Use groupId as identifier
                                creator: groupData.createdByEmail,
                                fundName: groupData.name,
                                fundType: 3, // Other type for Simple Mode
                                createdAt: groupData.createdAt,
                                isActive: true,
                                isCreator: groupInfo.role === 'creator',
                                isParticipant: true,
                                mode: 'simple',
                                // Simple mode specific data
                                description: groupData.description,
                                targetAmount: groupData.targetAmount,
                                currency: groupData.currency || 'USD',
                                memberCount: Object.keys(groupData.members || {}).length
                            };
                            
                            console.log("Simple mode group:", fundData);
                            fundMap.set(groupId, fundData);
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading Simple Mode groups:", error);
            }
        }
        
        // Combinar y eliminar duplicados
        const totalFunds = fundMap.size;
        
        allUserFunds = Array.from(fundMap.values());
        console.log("Total funds loaded (both modes):", allUserFunds.length, allUserFunds);
        
        // Cargar detalles de cada fondo
        await loadAllFundsDetails();
        
        // Actualizar estadísticas
        updateStats();
        
        // Mostrar fondos
        displayFunds();
        
    } catch (error) {
        console.error("Error loading user funds:", error);
        showToast("Error loading your funds", "error");
    }
}

async function loadAllFundsDetails() {
    // Cargar detalles adicionales de cada fondo (balance, etc.)
    for (let fund of allUserFunds) {
        try {
            if (!fund.fundAddress) {
                console.warn("Fund without address, skipping...");
                continue;
            }
            
            if (fund.mode === 'simple') {
                // Load Simple Mode details from Firebase
                const groupData = await window.FirebaseConfig.readDb(`groups/${fund.fundAddress}`);
                
                if (groupData) {
                    // Calculate total balance from approved expenses
                    const expenses = groupData.expenses || {};
                    let totalExpenses = 0;
                    let expenseCount = 0;
                    
                    for (const expense of Object.values(expenses)) {
                        if (expense.status === 'approved') {
                            totalExpenses += expense.amount;
                            expenseCount++;
                        }
                    }
                    
                    fund.balance = totalExpenses.toFixed(2);
                    fund.contributors = fund.memberCount || 0;
                    fund.proposals = expenseCount;
                    fund.target = fund.targetAmount || 0;
                    fund.progress = fund.target > 0 
                        ? (totalExpenses / fund.target) * 100 
                        : 0;
                }
                
            } else {
                // Load Blockchain Mode details from smart contract
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
            }
            
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
    document.getElementById('totalValueLocked').textContent = formatEth(totalValue);
    
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
        
        // Filter out hidden funds from localStorage
        const hiddenFunds = JSON.parse(localStorage.getItem('hiddenFunds') || '[]');
        const visibleFunds = filteredFunds.filter(fund => 
            !hiddenFunds.includes(fund.fundAddress.toLowerCase())
        );
        
        if (visibleFunds.length === 0) {
            fundsGrid.innerHTML = '';
            emptyState.style.display = 'flex';
        } else {
            fundsGrid.innerHTML = visibleFunds.map(fund => createFundCard(fund)).join('');
        }
    }
}

function createFundCard(fund) {
    const currentLang = getCurrentLanguage();
    const t = translations[currentLang];
    
    const fundTypeIcons = ['🌴', '💰', '🤝', '🎯'];
    const fundTypeKeys = ['travel', 'savings', 'shared', 'other'];
    
    const icon = fundTypeIcons[Number(fund.fundType)] || '🎯';
    const typeKey = fundTypeKeys[Number(fund.fundType)] || 'other';
    const typeName = t.app.fundDetail.badges[typeKey];
    const isInactive = !fund.isActive;
    
    return `
        <div class="fund-card ${isInactive ? 'fund-inactive' : ''}" onclick="openFund('${fund.fundAddress}')">
            <div class="fund-card-content">
                ${fund.isCreator ? `
                <div class="fund-actions">
                    ${fund.isActive ? `
                    <button class="fund-action-btn fund-pause-btn" onclick="event.stopPropagation(); deactivateFund('${fund.fundAddress}', '${fund.fundName}')" title="Pausar fondo (desactivar transacciones)">
                        ⏸️
                    </button>
                    ` : ''}
                    <button class="fund-action-btn fund-hide-btn" onclick="event.stopPropagation(); hideFund('${fund.fundAddress}', '${fund.fundName}')" title="Ocultar de mi vista">
                        🚫
                    </button>
                </div>
                ` : ''}
                
                <div class="fund-card-header">
                    <div class="fund-icon">${icon}</div>
                    <div class="fund-card-title">
                        <h3>${fund.fundName}</h3>
                        <div class="fund-badges">
                            ${fund.mode === 'simple' ? `<span class="badge badge-mode mode-simple">📝 Simple</span>` : `<span class="badge badge-mode mode-blockchain">⛓️ Blockchain</span>`}
                            <span class="badge badge-type type-${typeKey}">${typeName}</span>
                            ${isInactive ? `<span class="badge badge-status status-inactive">${t.app.dashboard.card.inactive}</span>` : ''}
                            ${fund.isCreator ? `<span class="badge badge-creator">👑 ${t.app.fundDetail.badges.creator}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="fund-stats">
                    <div class="fund-stat">
                        <span class="fund-stat-label">${t.app.fundDetail.info.balance}</span>
                        <span class="fund-stat-value">${fund.mode === 'simple' ? `$${fund.balance || 0}` : `${formatEth(fund.balance || 0)} ETH`}</span>
                    </div>
                    <div class="fund-stat">
                        <span class="fund-stat-label">${parseFloat(fund.target || 0) > 0 ? t.app.fundDetail.info.target : t.app.fundDetail.info.target}</span>
                        <span class="fund-stat-value">${parseFloat(fund.target || 0) > 0 ? (fund.mode === 'simple' ? `$${fund.target}` : formatEth(fund.target) + ' ETH') : t.app.fundDetail.info.noLimit}</span>
                    </div>
                </div>
                
                ${parseFloat(fund.target || 0) > 0 ? `
                <div class="fund-progress">
                    <div class="fund-progress-label">
                        <span>${t.app.fundDetail.info.progress}</span>
                        <span>${(fund.progress || 0).toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(fund.progress || 0, 100)}%"></div>
                    </div>
                </div>
                ` : ''}
                
                <div class="fund-meta">
                    <span>👥 ${fund.contributors || 0} ${t.app.dashboard.card.members}</span>
                    <span>📊 ${fund.proposals || 0} ${t.app.fundDetail.info.proposals.toLowerCase()}</span>
                </div>
            </div>
        </div>
    `;
}

let currentFund = null;
let currentFundContract = null;

async function openFund(fundAddress) {
    try {
        const t = translations[getCurrentLanguage()];
        console.log("openFund called with:", fundAddress);
        console.log("allUserFunds:", allUserFunds);
        showLoading(t.app.loading.loadingFund);
        
        if (!fundAddress || fundAddress === 'undefined') {
            throw new Error("Invalid fund address");
        }
        
        // Find current fund
        currentFund = allUserFunds.find(f => {
            console.log("Searching:", f.fundAddress, "vs", fundAddress);
            return f.fundAddress && f.fundAddress.toLowerCase() === fundAddress.toLowerCase();
        });
        
        if (!currentFund) {
            console.error("Fund not found. Available addresses:", allUserFunds.map(f => f.fundAddress));
            throw new Error("Fund not found in your list");
        }
        
        console.log("Fund found:", currentFund);
        
        // Initialize based on mode
        if (currentFund.mode === 'simple') {
            // Simple Mode - Initialize mode manager with this group
            await window.modeManager.initializeMode(fundAddress);
            currentFundContract = null; // No smart contract for Simple Mode
        } else {
            // Blockchain Mode - Create contract instance
            currentFundContract = new ethers.Contract(
                fundAddress,
                TRAVEL_FUND_V2_ABI_FULL,
                signer
            );
        }
        
        // Hide dashboard, show detail
        document.getElementById('dashboardSection').classList.remove('active');
        document.getElementById('fundDetailSection').classList.add('active');
        
        // Load fund detail view
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

async function deactivateFund(fundAddress, fundName) {
    try {
        const confirmed = confirm(
            `⏸️ ¿Pausar el fondo "${fundName}"?\n\n` +
            `Esta acción:\n` +
            `• Bloqueará todas las transacciones (depósitos, propuestas, votos)\n` +
            `• El fondo seguirá visible en modo solo lectura\n` +
            `• Podrás ver el historial y balances\n` +
            `• Solo el creador puede reactivarlo llamando al contrato\n\n` +
            `¿Continuar?`
        );
        
        if (!confirmed) return;
        
        showLoading("Desactivando fondo...");
        
        const tx = await factoryContract.deactivateFund(fundAddress);
        await tx.wait();
        
        // Refresh view to show deactivated state
        await refreshCurrentView();
        
        showToast("✅ Fund deactivated. Now in read-only mode.", "success");
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error deactivating fund:", error);
        showToast("Error al desactivar el fondo: " + error.message, "error");
    }
}

async function hideFund(fundAddress, fundName) {
    try {
        const confirmed = confirm(
            `🗑️ ¿Ocultar el fondo "${fundName}"?\n\n` +
            `Esta acción:\n` +
            `• Ocultará el fondo de tu interfaz\n` +
            `• El fondo seguirá existiendo en la blockchain\n` +
            `• Los fondos NO se eliminarán del contrato\n` +
            `• Solo se guardará tu preferencia localmente\n` +
            `• Podrás volver a verlo limpiando el storage del navegador\n\n` +
            `¿Continuar?`
        );
        
        if (!confirmed) return;
        
        showLoading("Ocultando fondo...");
        
        // Get hidden funds from localStorage
        let hiddenFunds = JSON.parse(localStorage.getItem('hiddenFunds') || '[]');
        
        // Add this fund to hidden list
        if (!hiddenFunds.includes(fundAddress.toLowerCase())) {
            hiddenFunds.push(fundAddress.toLowerCase());
            localStorage.setItem('hiddenFunds', JSON.stringify(hiddenFunds));
        }
        
        // Refresh view to hide the fund
        await refreshCurrentView();
        
        showToast("✅ Fondo ocultado de tu vista", "success");
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error hiding fund:", error);
        showToast("Error al ocultar el fondo: " + error.message, "error");
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
        const groupMode = document.querySelector('input[name="groupMode"]:checked').value;
        
        if (!fundName) {
            showToast("Please enter the fund name", "warning");
            return;
        }
        
        // targetAmount is optional - 0 means no limit
        const targetAmountValue = targetAmount && parseFloat(targetAmount) > 0 ? parseFloat(targetAmount) : 0;
        
        closeCreateFundModal();
        
        // Route based on selected mode
        if (groupMode === 'simple') {
            // SIMPLE MODE - Firebase
            await createSimpleFund({
                name: fundName,
                description: description,
                targetAmount: targetAmountValue,
                isPrivate: isPrivate,
                approvalPercentage: parseInt(approvalPercentage),
                minimumVotes: parseInt(minimumVotes),
                fundType: parseInt(fundType)
            });
        } else {
            // BLOCKCHAIN MODE - Smart Contract
            await createBlockchainFund({
                name: fundName,
                description: description,
                targetAmount: targetAmountValue,
                isPrivate: isPrivate,
                approvalPercentage: parseInt(approvalPercentage),
                minimumVotes: parseInt(minimumVotes),
                fundType: parseInt(fundType)
            });
        }
        
    } catch (error) {
        hideLoading();
        console.error("Error creating fund:", error);
        showToast("Error creating fund: " + error.message, "error");
    }
}

/**
 * Create Simple Mode fund (Firebase)
 */
async function createSimpleFund(fundInfo) {
    try {
        showLoading("Creating Simple Mode group...");
        
        // Check if user is authenticated with Firebase
        if (!window.FirebaseConfig.isAuthenticated()) {
            // Show sign-in modal
            hideLoading();
            await showSignInModal();
            
            // After sign in, retry
            if (!window.FirebaseConfig.isAuthenticated()) {
                throw new Error("Sign in required to create Simple Mode group");
            }
            showLoading("Creating Simple Mode group...");
        }
        
        // Create group in Firebase
        const groupId = await window.modeManager.createSimpleGroup({
            name: fundInfo.name,
            description: fundInfo.description,
            targetAmount: fundInfo.targetAmount,
            currency: 'USD' // Can be changed later
        });
        
        console.log("✅ Simple group created:", groupId);
        showToast(`✅ Group "${fundInfo.name}" created successfully!`, "success");
        
        // Reload funds list
        await loadUserFunds();
        
        // Show dashboard
        document.getElementById('dashboardSection').classList.add('active');
        document.getElementById('fundDetailSection').classList.remove('active');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("❌ Error creating simple fund:", error);
        throw error;
    }
}

/**
 * Create Blockchain Mode fund (Smart Contract)
 */
async function createBlockchainFund(fundInfo) {
    try {
        showLoading("Creating blockchain fund...");
        
        const targetAmountWei = ethers.parseEther(fundInfo.targetAmount.toString());
        
        // Crear fondo en blockchain
        const tx = await factoryContract.createFund(
            fundInfo.name,
            fundInfo.description,
            targetAmountWei,
            fundInfo.isPrivate,
            fundInfo.approvalPercentage,
            fundInfo.minimumVotes,
            fundInfo.fundType
        );
        
        console.log("Transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed:", receipt.hash);
        
        showToast(`✅ Fund "${fundInfo.name}" created successfully!`, "success");
        
        // Give time for blockchain state to update
        showLoading("🐜 Waiting for colony confirmation...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reload funds
        showLoading("Loading your new fund...");
        await loadUserFunds();
        
        // Show dashboard
        document.getElementById('dashboardSection').classList.add('active');
        document.getElementById('fundDetailSection').classList.remove('active');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("❌ Error creating blockchain fund:", error);
        throw error;
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

function showLoading(text) {
    if (!text) {
        const t = translations[getCurrentLanguage()];
        text = t.app.loading.default;
    }
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
// SIGN IN MODAL (Simple Mode)
// ============================================

function showSignInModal() {
    return new Promise((resolve) => {
        const modal = document.getElementById('signInModal');
        modal.style.display = 'block';
        
        // Store resolve function to call when user signs in
        window._signInResolve = resolve;
        
        // Reset forms
        document.getElementById('emailSignInForm').style.display = 'none';
        document.getElementById('createAccountForm').style.display = 'none';
        document.querySelector('.sign-in-buttons').style.display = 'flex';
    });
}

function closeSignInModal() {
    const modal = document.getElementById('signInModal');
    modal.style.display = 'none';
    
    if (window._signInResolve) {
        window._signInResolve();
        window._signInResolve = null;
    }
}

async function signInWithWallet() {
    try {
        closeSignInModal();
        await connectWallet();
    } catch (error) {
        console.error("❌ Wallet connection error:", error);
        showToast("Wallet connection failed: " + error.message, "error");
    }
}

async function signInWithGoogleOnly() {
    try {
        // Show warning first
        const confirmGoogle = confirm(
            "⚠️ Sign in with Google (Limited Access)\n\n" +
            "You will ONLY have access to Simple Mode features:\n" +
            "✅ Track expenses\n" +
            "✅ Split bills with friends\n" +
            "✅ View balances\n\n" +
            "You will NOT be able to:\n" +
            "❌ Use Blockchain Mode\n" +
            "❌ Create automatic payments\n" +
            "❌ Use smart contracts\n\n" +
            "You can connect a wallet later to unlock blockchain features.\n\n" +
            "Continue with Google Sign-In?"
        );
        
        if (!confirmGoogle) {
            return;
        }
        
        showLoading("Signing in with Google...");
        const user = await window.FirebaseConfig.signInWithGoogle();
        console.log("✅ Signed in:", user.email);
        showToast(`Welcome ${user.displayName || user.email}!`, "success");
        closeSignInModal();
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error("❌ Google sign-in error:", error);
        showToast("Sign in failed: " + error.message, "error");
    }
}

function showEmailSignIn() {
    document.querySelector('.sign-in-buttons').style.display = 'none';
    document.getElementById('createAccountForm').style.display = 'none';
    document.getElementById('emailSignInForm').style.display = 'block';
}

function closeEmailSignIn() {
    document.querySelector('.sign-in-buttons').style.display = 'flex';
    document.getElementById('emailSignInForm').style.display = 'none';
    document.getElementById('createAccountForm').style.display = 'none';
}

function showCreateAccount() {
    document.getElementById('emailSignInForm').style.display = 'none';
    document.getElementById('createAccountForm').style.display = 'block';
}

async function handleEmailSignIn(event) {
    event.preventDefault();
    
    try {
        const email = document.getElementById('signInEmail').value;
        const password = document.getElementById('signInPassword').value;
        
        // Check if user is trying to sign in for the first time
        if (!window.ethereum) {
            const confirmEmail = confirm(
                "⚠️ Sign in with Email (Limited Access)\n\n" +
                "Without a crypto wallet, you will ONLY have Simple Mode:\n" +
                "✅ Track expenses\n" +
                "✅ Split bills\n\n" +
                "You will NOT have blockchain features.\n" +
                "Connect a wallet later to unlock full access.\n\n" +
                "Continue?"
            );
            
            if (!confirmEmail) {
                return;
            }
        }
        
        showLoading("Signing in...");
        const user = await window.FirebaseConfig.signInWithEmail(email, password);
        console.log("✅ Signed in:", user.email);
        showToast(`Welcome back!`, "success");
        closeSignInModal();
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error("❌ Email sign-in error:", error);
        showToast("Sign in failed: " + error.message, "error");
    }
}

async function handleCreateAccount(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('createName').value;
        const email = document.getElementById('createEmail').value;
        const password = document.getElementById('createPassword').value;
        
        // Warn about limited access without wallet
        if (!window.ethereum) {
            const confirmCreate = confirm(
                "⚠️ Creating Account (Limited Access)\n\n" +
                "Without a crypto wallet (MetaMask), you will ONLY have access to:\n" +
                "✅ Simple Mode - Expense tracking\n" +
                "✅ Split bills with friends\n" +
                "✅ View who owes what\n\n" +
                "You will NOT be able to use:\n" +
                "❌ Blockchain Mode\n" +
                "❌ Automatic smart contract payments\n" +
                "❌ On-chain transactions\n\n" +
                "You can connect a wallet anytime later to unlock blockchain features.\n\n" +
                "Create account with limited access?"
            );
            
            if (!confirmCreate) {
                return;
            }
        }
        
        showLoading("Creating account...");
        const user = await window.FirebaseConfig.createAccount(email, password, name);
        console.log("✅ Account created:", user.email);
        showToast(`Welcome ${name}!`, "success");
        closeSignInModal();
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error("❌ Account creation error:", error);
        showToast("Account creation failed: " + error.message, "error");
    }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

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

// Helper: Format ETH with smart decimals (shows more decimals for small amounts)
function formatEth(value) {
    const num = parseFloat(value);
    
    if (num === 0) return '0.00';
    if (num >= 1) return num.toFixed(2); // >= 1 ETH: 2 decimals
    if (num >= 0.01) return num.toFixed(4); // >= 0.01 ETH: 4 decimals
    if (num >= 0.0001) return num.toFixed(6); // >= 0.0001 ETH: 6 decimals
    
    // For very small amounts, use scientific notation or show all significant digits
    return num.toFixed(8); // Show up to 8 decimals for tiny amounts
}

// Helper: Refresh current view after transaction
async function refreshCurrentView() {
    try {
        if (currentFund && document.getElementById('fundDetailSection').classList.contains('active')) {
            // Estamos en la vista de detalle de un fondo
            console.log("🔄 Refrescando vista de fondo...");
            await loadFundDetailView();
            
            // Recargar también la pestaña activa específica
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const tabId = activeTab.id;
                console.log("🔄 Recargando pestaña activa:", tabId);
                
                if (tabId === 'voteTab') {
                    await loadProposals();
                } else if (tabId === 'historyTab') {
                    await loadHistory();
                } else if (tabId === 'balancesTab') {
                    await loadBalances();
                } else if (tabId === 'manageTab') {
                    await loadKickMembersList();
                }
            }
        } else if (document.getElementById('dashboardSection').classList.contains('active')) {
            // Estamos en el dashboard
            console.log("🔄 Refrescando dashboard...");
            await loadUserFunds();
        }
    } catch (error) {
        console.error("Error refreshing view:", error);
    }
}

// ============================================
// FUND DETAIL VIEW
// ============================================

async function loadFundDetailView() {
    try {
        const currentLang = getCurrentLanguage();
        const t = translations[currentLang];
        
        const fundTypeIcons = ['🌴', '💰', '🤝', '🎯'];
        const fundTypeKeys = ['travel', 'savings', 'shared', 'other'];
        
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
        const typeKey = fundTypeKeys[Number(currentFund.fundType)] || 'other';
        document.getElementById('fundDetailDescription').textContent = description || t.app.fundDetail.info.loading;
        document.getElementById('fundTypeBadge').textContent = t.app.fundDetail.badges[typeKey];
        document.getElementById('fundStatusBadge').textContent = isActive ? `🟢 ${t.app.fundDetail.info.active}` : `🔴 ${t.app.fundDetail.info.inactive}`;
        document.getElementById('fundPrivacyBadge').textContent = isPrivate ? `🔒 ${t.app.fundDetail.info.private}` : `🌐 ${t.app.fundDetail.info.public}`;
        
        const balanceEth = ethers.formatEther(balance);
        const targetEth = ethers.formatEther(target);
        
        document.getElementById('fundBalance').textContent = `${formatEth(balanceEth)} ETH`;
        document.getElementById('fundMembers').textContent = contributors.toString();
        document.getElementById('fundProposals').textContent = proposals.toString();
        
        // Si targetAmount es 0, no hay meta - mostrar "Sin límite"
        if (parseFloat(targetEth) === 0) {
            document.getElementById('fundTarget').textContent = t.app.fundDetail.info.noLimit;
            document.getElementById('fundProgress').textContent = '-';
            document.getElementById('fundProgressBar').style.width = '0%';
            // Ocultar la barra de progreso si quieres
            const progressSection = document.querySelector('.progress-section');
            if (progressSection) progressSection.style.display = 'none';
        } else {
            const progress = (parseFloat(balanceEth) / parseFloat(targetEth)) * 100;
            document.getElementById('fundTarget').textContent = `${formatEth(targetEth)} ETH`;
            document.getElementById('fundProgress').textContent = `${progress.toFixed(1)}%`;
            document.getElementById('fundProgressBar').style.width = `${Math.min(progress, 100)}%`;
            // Mostrar la barra de progreso
            const progressSection = document.querySelector('.progress-section');
            if (progressSection) progressSection.style.display = 'block';
        }
        
        // User contribution
        document.getElementById('userContribution').textContent = `${formatEth(ethers.formatEther(userContribution))} ETH`;
        
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
            showToast("⚠️ This fund is closed. No more actions allowed.", "warning");
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
        showToast("Error loading fund details", "error");
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
    
    // Load kick members list when manage tab is selected
    if (tabName === 'manage') {
        loadKickMembersList();
    }
    
    // Load involved members checkboxes when propose tab is selected
    if (tabName === 'propose') {
        loadInvolvedMembersCheckboxes();
    }
}

// ============================================
// FUND ACTIONS
// ============================================

async function depositToFund() {
    try {
        const amount = document.getElementById('depositAmount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast("Please enter a valid amount", "warning");
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
            showToast("⚠️ This is a private fund. You need an invitation from the creator to participate.", "warning");
            return;
        }
        
        if (isPrivate && memberStatus === 1n) {
            console.log("❌ BLOCKED: User has pending invitation");
            showToast("⚠️ You have a pending invitation. Accept it first in the 'Invite' tab before depositing.", "warning");
            return;
        }
        
        console.log("✅ ALLOWED: User can deposit");
        
        // Show message BEFORE MetaMask popup
        showToast("🐜 Confirm the deposit in your wallet...", "info");
        
        const amountWei = ethers.parseEther(amount);
        const tx = await currentFundContract.deposit({ value: amountWei });
        
        // Now show loading after user confirmed
        showLoading("⏳ Waiting for blockchain confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Deposit confirmed - tx:", receipt.hash);
        
        showToast(`✅ Deposit of ${amount} ETH successful!`, "success");
        
        // Give time for state to update - longer delay for balance recalculation
        showLoading("🐜 Recalculating balances...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Reload fund details
        await loadFundDetailView();
        
        // Clear input
        document.getElementById('depositAmount').value = '';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error depositing:", error);
        
        // Better error messages
        let errorMsg = "Error depositing";
        if (error.message.includes("No estas autorizado")) {
            errorMsg = "You are not authorized to participate in this private fund. You need to be invited first.";
        } else if (error.message.includes("insufficient funds")) {
            errorMsg = "Insufficient funds in your account";
        } else if (error.message.includes("user rejected")) {
            errorMsg = "Transaction cancelled";
        }
        
        showToast(errorMsg, "error");
    }
}

async function inviteMember() {
    try {
        const addressOrNickname = document.getElementById('inviteAddress').value.trim();
        
        if (!addressOrNickname) {
            showToast("Please enter a nickname or address", "warning");
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
            showToast("⚠️ You cannot invite yourself", "warning");
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
            showToast(`⚠️ ${addressOrNickname} already has a pending invitation`, "warning");
            return;
        }
        if (memberStatus === 2n) {
            showToast(`⚠️ ${addressOrNickname} is already an active member of the fund`, "warning");
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
        
        showLoading("Sending invitation...");
        
        let tx;
        if (addressOrNickname.startsWith('0x')) {
            // It's an address
            tx = await currentFundContract.inviteMemberByAddress(addressOrNickname);
        } else {
            // It's a nickname
            tx = await currentFundContract.inviteMemberByNickname(addressOrNickname);
        }
        
        const receipt = await tx.wait();
        console.log("✅ Invitation sent - tx:", receipt.hash);
        
        showToast(`✅ Invitation sent to ${addressOrNickname}!`, "success");
        
        // Give time for state to update
        showLoading("🐜 Updating members...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh view to show updated members
        await refreshCurrentView();
        
        // Clear input
        document.getElementById('inviteAddress').value = '';
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error inviting member:", error);
        
        let errorMsg = "Error sending invitation";
        if (error.message.includes("Ya esta invitado")) {
            errorMsg = "This person has already been invited or is already a member of the fund";
        } else if (error.message.includes("Nickname not found")) {
            errorMsg = "Nickname not found";
        } else if (error.message.includes("Only creator")) {
            errorMsg = "Solo el creador puede invitar miembros";
        }
        
        showToast(errorMsg, "error");
    }
}

async function acceptInvitation() {
    try {
        const t = translations[getCurrentLanguage()];
        showLoading(t.app.loading.acceptingInvitation);
        
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
        
        showToast("✅ Invitation accepted! You are now an active member", "success");
        
        // Give time for state to update
        showLoading("🐜 Updating colonies...");
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
        showToast("Error accepting invitation: " + error.message, "error");
    }
}

async function createProposal() {
    try {
        const t = translations[getCurrentLanguage()];
        const recipientInput = document.getElementById('proposalRecipient').value.trim();
        const amount = document.getElementById('proposalAmount').value;
        const description = document.getElementById('proposalDescription').value.trim();
        
        if (!recipientInput) {
            showToast("Please enter the recipient", "warning");
            return;
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast("Please enter a valid amount", "warning");
            return;
        }
        
        if (!description) {
            showToast("Please enter a description", "warning");
            return;
        }
        
        // Get selected involved members
        const selectedMembers = getSelectedInvolvedMembers();
        if (selectedMembers.length === 0) {
            showToast(t.app.fundDetail.propose.noMembersSelected, "warning");
            return;
        }
        
        // IMPORTANT: Verify the creator is included in involved members
        const userIsInvolved = selectedMembers.some(addr => addr.toLowerCase() === userAddress.toLowerCase());
        if (!userIsInvolved) {
            showToast("⚠️ You must include yourself in the involved members to vote on this proposal. Check your own checkbox!", "warning");
            return;
        }
        
        // NEW: Validate involved members have sufficient contributions
        const amountWei = ethers.parseEther(amount);
        let totalFromInvolved = 0n;
        const insufficientMembers = [];
        
        for (const memberAddr of selectedMembers) {
            const contribution = await currentFundContract.contributions(memberAddr);
            totalFromInvolved += contribution;
            
            // Check if member hasn't contributed
            if (contribution === 0n) {
                const memberNickname = await factoryContract.getNickname(memberAddr);
                insufficientMembers.push(formatUserDisplay(memberNickname, memberAddr));
            }
        }
        
        // Warn if involved members have insufficient funds
        if (insufficientMembers.length > 0) {
            const memberList = insufficientMembers.join(', ');
            showToast(`⚠️ Warning: ${memberList} ha${insufficientMembers.length > 1 ? 've' : 's'} not contributed yet. They won't be able to cover their share.`, "warning");
        }
        
        // Calculate if we need to borrow from non-involved members
        const willBorrowFromOthers = amountWei > totalFromInvolved;
        
        if (willBorrowFromOthers) {
            const borrowedAmount = amountWei - totalFromInvolved;
            const [allAddresses] = await currentFundContract.getContributorsWithNicknames();
            const nonInvolvedCount = allAddresses.length - selectedMembers.length;
            
            if (nonInvolvedCount > 0) {
                const borrowedPerPerson = borrowedAmount / BigInt(nonInvolvedCount);
                
                const confirmBorrow = confirm(
                    `⚠️ IMPORTANT NOTICE:\n\n` +
                    `The involved members' contributions (${ethers.formatEther(totalFromInvolved)} ETH) ` +
                    `are not enough to cover ${amount} ETH.\n\n` +
                    `This proposal will BORROW ${ethers.formatEther(borrowedAmount)} ETH ` +
                    `from non-involved members (~${ethers.formatEther(borrowedPerPerson)} ETH each).\n\n` +
                    `✅ All members will be notified and included in the vote.\n` +
                    `✅ 100% approval required when borrowing funds.\n\n` +
                    `Do you want to continue?`
                );
                
                if (!confirmBorrow) {
                    return;
                }
            }
        }
        
        // PROBLEM 2 FIX: Check if user is a contributor before allowing proposal
        const userContribution = await currentFundContract.contributions(userAddress);
        if (userContribution === 0n) {
            showToast("⚠️ You must deposit funds before creating proposals. Go to the 'Deposit' tab first.", "warning");
            return;
        }
        
        // Resolve recipient address
        let recipientAddress;
        if (recipientInput.startsWith('0x')) {
            recipientAddress = recipientInput;
        } else {
            // Get address from nickname via factory
            recipientAddress = await factoryContract.getAddressByNickname(recipientInput);
        }
        
        console.log("Creating proposal with involved members:", selectedMembers);
        
        // Show message BEFORE MetaMask popup
        showToast("🐜 Confirm the transaction in your wallet...", "info");
        
        const tx = await currentFundContract.createProposal(
            recipientAddress, 
            amountWei, 
            description,
            selectedMembers
        );
        
        // Now show loading after user confirmed
        showLoading("⏳ Waiting for blockchain confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Propuesta creada - tx:", receipt.hash);
        
        showToast(t.app.fundDetail.propose.success, "success");
        
        // Dar tiempo para que el estado se actualice en blockchain
        showLoading("🐜 Syncing with the colony... (this may take a few seconds)");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Refresh view to show new proposal
        await refreshCurrentView();
        
        // Clear inputs
        document.getElementById('proposalRecipient').value = '';
        document.getElementById('proposalAmount').value = '';
        document.getElementById('proposalDescription').value = '';
        
        // Reset member selection
        loadInvolvedMembersCheckboxes();
        
        // Switch to vote tab to show new proposal
        switchFundTab('vote');
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error creating proposal:", error);
        
        // PROBLEM 2 FIX: Better error messages for common issues
        let errorMsg = "Error creating proposal";
        if (error.message.includes("No eres contribuyente")) {
            errorMsg = "⚠️ You must deposit funds before creating proposals. Go to the 'Deposit' tab first.";
        } else if (error.message.includes("Monto excede limite")) {
            errorMsg = "⚠️ Amount cannot exceed 80% of fund balance";
        } else if (error.message.includes("Only active members")) {
            errorMsg = "⚠️ Only active members can create proposals. Accept your invitation first.";
        } else if (error.message.includes("Debe seleccionar al menos un miembro")) {
            errorMsg = "⚠️ You must select at least one involved member";
        } else {
            errorMsg = "Error creating proposal: " + error.message;
        }
        
        showToast(errorMsg, "error");
    }
}

// Helper function to get selected involved members
function getSelectedInvolvedMembers() {
    const checkboxes = document.querySelectorAll('.member-checkbox-item input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Load involved members checkboxes
async function loadInvolvedMembersCheckboxes() {
    try {
        if (!currentFundContract) return;
        
        const [addresses, nicknames] = await currentFundContract.getContributorsWithNicknames();
        const container = document.getElementById('involvedMembersList');
        
        if (!container) return;
        
        if (addresses.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No hay miembros disponibles</p>';
            return;
        }
        
        container.innerHTML = addresses.map((address, i) => {
            const nickname = nicknames[i];
            const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
            
            return `
                <label class="member-checkbox-item" for="member-${i}">
                    <input 
                        type="checkbox" 
                        id="member-${i}" 
                        value="${address}"
                        checked
                        onchange="toggleMemberCheckbox(this)"
                    >
                    <div class="member-checkbox-label">
                        <span>${nickname}</span>
                        <span class="member-checkbox-address">${shortAddr}</span>
                    </div>
                </label>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error loading involved members:", error);
    }
}

// Toggle member checkbox selection
function toggleMemberCheckbox(checkbox) {
    const label = checkbox.closest('.member-checkbox-item');
    if (checkbox.checked) {
        label.classList.add('selected');
    } else {
        label.classList.remove('selected');
    }
}

// Make functions globally accessible
window.toggleMemberCheckbox = toggleMemberCheckbox;

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
                            <span>${formatEth(amount)} ETH</span>
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
                    
                    // NEW: Check if current user is involved in this proposal
                    const isUserInvolved = await currentFundContract.isUserInvolved(i, userAddress);
                    
                    // PROBLEM 2 FIX: Access proposal data by index (Proxy returns array)
                    // getProposal returns: id, proposer, proposerNickname, recipient, recipientNickname,
                    //                      amount, proposalDescription, votesFor, votesAgainst, createdAt,
                    //                      expiresAt, executed, cancelled, approved, expired,
                    //                      requiresFullConsent, borrowedAmount, borrowedPerPerson
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
                        requiresFullConsent: proposal[15],
                        borrowedAmount: proposal[16],
                        borrowedPerPerson: proposal[17],
                        hasVoted,
                        isInvolved: isUserInvolved
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
                
                // Preparar alerta de dinero prestado si aplica
                const borrowedAlert = proposal.requiresFullConsent ? `
                    <div class="borrowed-funds-alert">
                        <div class="alert-header">
                            <span class="alert-icon">⚠️</span>
                            <strong>${t.app.fundDetail.vote.borrowedWarning}</strong>
                        </div>
                        <p class="alert-text">${t.app.fundDetail.vote.borrowedWarningText}</p>
                        <div class="borrowed-details">
                            <div class="borrowed-item">
                                <span>${t.app.fundDetail.vote.totalBorrowed}</span>
                                <strong>${formatEth(ethers.formatEther(proposal.borrowedAmount))} ETH</strong>
                            </div>
                            <div class="borrowed-item">
                                <span>${t.app.fundDetail.vote.borrowedPerPerson}</span>
                                <strong>${formatEth(ethers.formatEther(proposal.borrowedPerPerson))} ETH</strong>
                            </div>
                        </div>
                        <p class="alert-footer">${t.app.fundDetail.vote.allMustVote}</p>
                    </div>
                ` : '';
                
                return `
                    <div class="proposal-card ${proposal.requiresFullConsent ? 'requires-full-consent' : ''}">
                        <div class="proposal-header">
                            <h4>Proposal #${proposal.id}</h4>
                            <span class="proposal-amount">${formatEth(amount)} ETH</span>
                        </div>
                        
                        ${!proposal.requiresFullConsent ? `
                            <div class="proposal-info-badge" style="background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); padding: 8px 12px; border-radius: 8px; margin: 8px 0; font-size: 0.85rem;">
                                👥 Only involved members can vote on this proposal
                            </div>
                        ` : ''}
                        
                        ${borrowedAlert}
                        
                        <p class="proposal-description">${proposal.description}</p>
                        
                        <div class="proposal-meta">
                            <span title="${proposal.proposer}">👤 From: ${formatUserDisplay(proposal.proposerNickname, proposal.proposer)}</span>
                            <span title="${proposal.recipient}">🎯 To: ${formatUserDisplay(proposal.recipientNickname, proposal.recipient)}</span>
                        </div>
                        
                        <div class="proposal-votes">
                            <div class="vote-bar">
                                <div class="vote-bar-fill" style="width: ${percentFor}%"></div>
                            </div>
                            <div class="vote-counts">
                                <span>✅ ${votesFor} for</span>
                                <span>❌ ${votesAgainst} against</span>
                            </div>
                        </div>
                        
                        ${!proposal.isInvolved ? `
                            <div class="info-box" style="background: rgba(100, 116, 139, 0.1); border: 1px solid rgba(100, 116, 139, 0.3); padding: 12px; margin-top: 12px; border-radius: 8px; text-align: center;">
                                👁️ <strong>You are not included in this proposal</strong><br>
                                <small>Only involved members can vote on this expense</small>
                            </div>
                        ` : proposal.hasVoted ? `
                            <div class="voted-badge">You already voted on this proposal</div>
                        ` : `
                            <div class="proposal-actions">
                                <button class="btn btn-success" onclick="voteProposal(${proposal.id}, true)">
                                    Vote For
                                </button>
                                <button class="btn btn-danger" onclick="voteProposal(${proposal.id}, false)">
                                    Vote Against
                                </button>
                            </div>
                        `}
                        
                        ${proposal.approved && !proposal.executed ? `
                            <button class="btn btn-primary btn-block" onclick="executeProposal(${proposal.id})">
                                ⚡ Execute Proposal
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
        // Show message BEFORE MetaMask popup
        showToast("🐜 Confirm the vote in your wallet...", "info");
        
        const tx = await currentFundContract.vote(proposalId, inFavor);
        
        // Now show loading after user confirmed
        showLoading("⏳ Waiting for blockchain confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Voto registrado - tx:", receipt.hash);
        
        showToast(`✅ Vote ${inFavor ? 'for' : 'against'} registered!`, "success");
        
        // Dar tiempo para que el estado se actualice
        showLoading("🐜 Syncing vote count... (this may take a few seconds)");
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Refresh view to show updated votes
        await refreshCurrentView();
        
        // Show manual refresh option if needed
        showToast("🔄 If vote doesn't appear, refresh the page (F5)", "info");
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error voting:", error);
        
        // Better error message for common case
        let errorMsg = "Error voting";
        if (error.message.includes("No estas involucrado") || error.message.includes("not involved")) {
            errorMsg = "⚠️ You cannot vote on this proposal!\n\n" +
                      "Reason: You were not selected as an 'involved member' when this proposal was created.\n\n" +
                      "Only members checked in the 'Involved Members' section during proposal creation can vote.\n\n" +
                      "Tip: When creating proposals, make sure to check YOUR OWN checkbox if you want to vote!";
        } else if (error.message.includes("Ya votaste")) {
            errorMsg = "⚠️ You already voted on this proposal";
        } else {
            errorMsg = "Error voting: " + error.message;
        }
        
        showToast(errorMsg, "error");
    }
}

async function executeProposal(proposalId) {
    try {
        // Show message BEFORE MetaMask popup
        showToast("🐜 Confirm the execution in your wallet...", "info");
        
        const tx = await currentFundContract.executeProposal(proposalId);
        
        // Now show loading after user confirmed
        showLoading("⏳ Waiting for blockchain confirmation...");
        const receipt = await tx.wait();
        console.log("✅ Proposal executed - tx:", receipt.hash);
        
        showToast("✅ Proposal executed! Funds transferred.", "success");
        
        // Dar tiempo para que el estado se actualice
        showLoading("🐜 Actualizando balances...");
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Refresh view to show executed proposal and updated balance
        await refreshCurrentView();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error executing proposal:", error);
        showToast("Error executing proposal: " + error.message, "error");
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
                const isUserInvolved = await currentFundContract.isUserInvolved(i, userAddress);
                
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
                    hasVoted,
                    isInvolved: isUserInvolved
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
                statusBadge = '<span class="status-badge status-executed">✅ Executed</span>';
                statusClass = 'proposal-executed';
            } else if (proposal.cancelled) {
                statusBadge = '<span class="status-badge status-cancelled">❌ Cancelled</span>';
                statusClass = 'proposal-cancelled';
            } else if (proposal.expired) {
                statusBadge = '<span class="status-badge status-expired">⏱️ Expired</span>';
                statusClass = 'proposal-expired';
            } else if (proposal.approved) {
                statusBadge = '<span class="status-badge status-approved">👍 Approved</span>';
                statusClass = 'proposal-approved';
            } else {
                statusBadge = '<span class="status-badge status-active">🕒 Active</span>';
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
                        <span title="${proposal.proposer}">👤 From: ${formatUserDisplay(proposal.proposerNickname, proposal.proposer)}</span>
                        <span title="${proposal.recipient}">🎯 To: ${formatUserDisplay(proposal.recipientNickname, proposal.recipient)}</span>
                    </div>
                    <div class="proposal-meta">
                        <span>📅 Created: ${createdDate}</span>
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
        
        // Filter out members with exactly zero balance (fully settled)
        const displayBalances = balances.filter(m => m.balance !== 0n);
        
        // Update summary stats
        const currentBalance = await currentFundContract.getBalance();
        document.getElementById('totalContributed').textContent = `${parseFloat(ethers.formatEther(totalContributed)).toFixed(4)} ETH`;
        document.getElementById('totalSpent').textContent = `${parseFloat(ethers.formatEther(totalSpent)).toFixed(4)} ETH`;
        document.getElementById('availableBalance').textContent = `${parseFloat(ethers.formatEther(currentBalance)).toFixed(4)} ETH`;
        
        // Render balances
        const balancesList = document.getElementById('balancesList');
        
        if (displayBalances.length === 0) {
            balancesList.innerHTML = `
                <div class="info-box success-box" style="text-align: center; padding: 2rem;">
                    <h3>✅ All Balanced!</h3>
                    <p>Everyone has settled their debts. The colony is in perfect harmony! 🐜</p>
                </div>
            `;
            return;
        }
        
        balancesList.innerHTML = displayBalances.map(member => {
            const isPositive = member.balance > 0n;
            const isNegative = member.balance < 0n;
            const statusClass = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
            const statusText = isPositive ? 'Should receive' : isNegative ? 'Should pay' : 'Balanced';
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
        showToast(`💳 Amount pre-filled: ${amount.toFixed(4)} ETH. Confirm to settle your debt.`, 'info');
        
        console.log(`💸 Debt settlement initiated: ${amount} ETH`);
    } catch (error) {
        console.error("Error in settleDebt:", error);
        showToast("Error preparing debt settlement", "error");
    }
}

// ============================================
// FUND MANAGEMENT
// ============================================

/**
 * Load members list for kicking in manage tab
 */
async function loadKickMembersList() {
    try {
        const kickMembersList = document.getElementById('kickMembersList');
        const noMembersToKick = document.getElementById('noMembersToKick');
        
        if (!currentFundContract || !userAddress) {
            return;
        }
        
        // Check if user is creator
        const contractCreator = await currentFundContract.creator();
        if (contractCreator.toLowerCase() !== userAddress.toLowerCase()) {
            kickMembersList.style.display = 'none';
            noMembersToKick.style.display = 'block';
            return;
        }
        
        // Get all contributors
        const [addresses, nicknames, contributions] = await currentFundContract.getContributorsWithNicknames();
        const currentBalance = await currentFundContract.getBalance();
        const totalContributions = await currentFundContract.totalContributions();
        
        // Filter out creator
        const membersToShow = [];
        for (let i = 0; i < addresses.length; i++) {
            if (addresses[i].toLowerCase() !== contractCreator.toLowerCase()) {
                membersToShow.push({
                    address: addresses[i],
                    nickname: nicknames[i],
                    contribution: contributions[i]
                });
            }
        }
        
        if (membersToShow.length === 0) {
            kickMembersList.style.display = 'none';
            noMembersToKick.style.display = 'block';
            return;
        }
        
        // Build member cards
        let html = '';
        for (const member of membersToShow) {
            const contributionEth = parseFloat(ethers.formatEther(member.contribution));
            const currentBalanceEth = parseFloat(ethers.formatEther(currentBalance));
            const totalContributionsEth = parseFloat(ethers.formatEther(totalContributions));
            
            // Calculate refund amount
            let refundAmount = 0;
            if (totalContributionsEth > 0 && currentBalanceEth > 0) {
                refundAmount = (contributionEth / totalContributionsEth) * currentBalanceEth;
            }
            
            html += `
                <div class="kick-member-card">
                    <div class="member-info">
                        <div class="member-avatar">${member.nickname.charAt(0).toUpperCase()}</div>
                        <div class="member-details">
                            <div class="member-name">${formatUserDisplay(member.nickname, member.address)}</div>
                            <div class="member-stats">
                                <span>💰 Aportó: ${contributionEth.toFixed(4)} ETH</span>
                                <span>💸 Recibirá: ${refundAmount.toFixed(4)} ETH</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-danger" onclick="kickMemberConfirm('${member.address}', '${member.nickname}', ${refundAmount})">
                        👋 Expulsar
                    </button>
                </div>
            `;
        }
        
        kickMembersList.innerHTML = html;
        kickMembersList.style.display = 'block';
        noMembersToKick.style.display = 'none';
        
    } catch (error) {
        console.error("Error loading members to kick:", error);
    }
}

/**
 * Confirm and kick a member from the fund
 */
async function kickMemberConfirm(memberAddress, memberNickname, refundAmount) {
    try {
        const confirmed = confirm(
            `⚠️ ¿Expulsar a ${memberNickname}?\n\n` +
            `Esta acción:\n` +
            `• Removerá permanentemente al miembro del grupo\n` +
            `• Le devolverá ${refundAmount.toFixed(4)} ETH\n` +
            `• No podrá votar ni participar más\n\n` +
            `¿Continuar?`
        );
        
        if (!confirmed) return;
        
        showLoading("Expulsando miembro...");
        
        const tx = await currentFundContract.kickMember(memberAddress);
        await tx.wait();
        
        // Refresh view to show updated members and balance
        await refreshCurrentView();
        
        hideLoading();
        showToast(`✅ ${memberNickname} ha sido expulsado del grupo`, "success");
        
    } catch (error) {
        hideLoading();
        console.error("Error kicking member:", error);
        showToast("Error al expulsar miembro: " + error.message, "error");
    }
}

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
        showToast("Error calculating distribution: " + error.message, "error");
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
        
        // Refresh view to show closed state
        await refreshCurrentView();
        
        hideLoading();
        
        showToast("✅ Fund closed and funds distributed successfully!", "success");
        
    } catch (error) {
        hideLoading();
        console.error("Error closing fund:", error);
        
        let errorMsg = "Error al cerrar el fondo";
        if (error.message.includes("Only creator")) {
            errorMsg = "⚠️ Only the fund creator can close it";
        } else if (error.message.includes("ya esta cerrado")) {
            errorMsg = "⚠️ The fund is already closed";
        } else {
            errorMsg = "Error closing fund: " + error.message;
        }
        
        showToast(errorMsg, "error");
    }
}

// ============================================
// QR SCANNER FUNCTIONALITY
// ============================================

let html5QrCode = null;
let scannedAddressValue = null;
let isScannerRunning = false;
let isProcessingScan = false; // Flag to prevent multiple scan processing

// Make functions globally accessible
window.openQRScanner = openQRScanner;
window.closeQRScanner = closeQRScanner;
window.confirmScannedAddress = confirmScannedAddress;

function openQRScanner() {
    const modal = document.getElementById('qrScannerModal');
    modal.style.display = 'flex';
    
    // Reset state and UI
    const qrReader = document.getElementById('qrReader');
    if (qrReader) qrReader.style.display = 'block';
    
    document.getElementById('qrScanResult').style.display = 'none';
    document.getElementById('cancelScanBtn').style.display = 'block';
    document.getElementById('qrConfirmCheckbox').checked = false;
    document.getElementById('confirmQRBtn').disabled = true;
    scannedAddressValue = null;
    isProcessingScan = false; // Reset processing flag
    
    // Initialize QR scanner
    html5QrCode = new Html5Qrcode("qrReader");
    
    const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
    };
    
    html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanError
    ).then(() => {
        isScannerRunning = true;
        console.log("QR Scanner started successfully");
    }).catch(err => {
        console.error("Error starting QR scanner:", err);
        isScannerRunning = false;
        const t = translations[getCurrentLanguage()];
        showToast(t.app.fundDetail.qrScanner.cameraError, "error");
        closeQRScanner();
    });
}

function onScanSuccess(decodedText, decodedResult) {
    // Prevent multiple scan processing
    if (isProcessingScan) {
        console.log("Already processing a scan, ignoring...");
        return;
    }
    
    isProcessingScan = true;
    console.log("QR Code detected:", decodedText);
    
    // Extract ethereum address from QR code
    let address = decodedText.trim();
    
    // Handle ethereum: URI format
    if (address.startsWith('ethereum:')) {
        address = address.replace('ethereum:', '').split('?')[0].split('@')[0];
    }
    
    // Validate Ethereum address format
    if (!isValidEthereumAddress(address)) {
        const t = translations[getCurrentLanguage()];
        showToast(`⚠️ ${t.app.fundDetail.qrScanner.invalidQR}`, "error");
        isProcessingScan = false;
        return;
    }
    
    // Stop scanner if it's running
    if (html5QrCode && isScannerRunning) {
        html5QrCode.stop().then(() => {
            console.log("QR Scanner stopped after successful scan");
            isScannerRunning = false;
            scannedAddressValue = address;
            displayScannedAddress(address);
        }).catch(err => {
            console.error("Error stopping scanner:", err);
            isScannerRunning = false;
            scannedAddressValue = address;
            displayScannedAddress(address);
        });
    } else {
        scannedAddressValue = address;
        displayScannedAddress(address);
    }
}

function onScanError(errorMessage) {
    // Ignore scan errors (happens continuously while scanning)
    // console.warn("QR Scan error:", errorMessage);
}

function isValidEthereumAddress(address) {
    // Check if it's a valid Ethereum address format (0x + 40 hex characters)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function displayScannedAddress(address) {
    document.getElementById('scannedAddress').textContent = address;
    
    // Hide the QR reader and show results
    const qrReader = document.getElementById('qrReader');
    if (qrReader) qrReader.style.display = 'none';
    
    document.getElementById('qrScanResult').style.display = 'block';
    document.getElementById('cancelScanBtn').style.display = 'none';
    
    // Reset checkbox and button state
    const checkbox = document.getElementById('qrConfirmCheckbox');
    const confirmBtn = document.getElementById('confirmQRBtn');
    if (checkbox) checkbox.checked = false;
    if (confirmBtn) confirmBtn.disabled = true;
}

function confirmScannedAddress() {
    const t = translations[getCurrentLanguage()];
    
    if (!scannedAddressValue) {
        showToast(`⚠️ ${t.app.fundDetail.qrScanner.noAddress}`, "error");
        return;
    }
    
    if (!document.getElementById('qrConfirmCheckbox').checked) {
        showToast(`⚠️ ${t.app.fundDetail.qrScanner.mustConfirm}`, "warning");
        return;
    }
    
    // Set the address in the input field
    document.getElementById('proposalRecipient').value = scannedAddressValue;
    
    // Show success message
    showToast(`✅ ${t.app.fundDetail.qrScanner.scanSuccess}`, "success");
    
    // Close modal
    closeQRScanner();
}

function closeQRScanner() {
    // Stop scanner if running
    if (html5QrCode && isScannerRunning) {
        html5QrCode.stop().then(() => {
            console.log("QR Scanner stopped on close");
            html5QrCode.clear();
            html5QrCode = null;
            isScannerRunning = false;
            isProcessingScan = false;
        }).catch(err => {
            console.error("Error stopping QR scanner:", err);
            html5QrCode = null;
            isScannerRunning = false;
            isProcessingScan = false;
        });
    } else if (html5QrCode) {
        // Scanner already stopped, just clear it
        html5QrCode.clear();
        html5QrCode = null;
        isScannerRunning = false;
        isProcessingScan = false;
    }
    
    // Hide modal
    document.getElementById('qrScannerModal').style.display = 'none';
    
    // Reset state
    scannedAddressValue = null;
    isProcessingScan = false;
}

// Setup QR scanner event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Open QR scanner button
    const openQRBtn = document.getElementById('openQRScannerBtn');
    if (openQRBtn) {
        openQRBtn.addEventListener('click', openQRScanner);
    }
    
    // Close QR scanner buttons
    const closeBtn1 = document.getElementById('closeQRScannerBtn1');
    if (closeBtn1) {
        closeBtn1.addEventListener('click', closeQRScanner);
    }
    
    const cancelBtn = document.getElementById('cancelScanBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeQRScanner);
    }
    
    const cancelBtn2 = document.getElementById('qrCancelBtn2');
    if (cancelBtn2) {
        cancelBtn2.addEventListener('click', closeQRScanner);
    }
    
    // Confirm button
    const confirmBtn = document.getElementById('confirmQRBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', confirmScannedAddress);
    }
    
    // Checkbox for enabling confirm button
    const checkbox = document.getElementById('qrConfirmCheckbox');
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            const confirmButton = document.getElementById('confirmQRBtn');
            if (confirmButton) {
                confirmButton.disabled = !this.checked;
            }
        });
    }
    
    // Select/Deselect all members buttons
    const selectAllBtn = document.getElementById('selectAllMembersBtn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.member-checkbox-item input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = true;
                toggleMemberCheckbox(cb);
            });
        });
    }
    
    const deselectAllBtn = document.getElementById('deselectAllMembersBtn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.member-checkbox-item input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                toggleMemberCheckbox(cb);
            });
        });
    }
});

