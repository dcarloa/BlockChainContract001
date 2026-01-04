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
    try {
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
        console.log("🎯 Continuando con el flujo de inicialización...");
    } else {
        console.log("ℹ️ No wallet detected - Simple Mode only");
        // Hide wallet button if no wallet available
        document.getElementById('connectWallet').style.display = 'none';
    }
    
    console.log("🚀 Después del bloque de wallet, continuando...");
    
    // Check for invite link in URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinGroupId = urlParams.get('join');
    
    console.log('🔗 Checking for join parameter:', joinGroupId);
    
    if (joinGroupId) {
        console.log('📨 Join group ID found, handling join flow');
        // Save group ID to join after sign in
        sessionStorage.setItem('pendingGroupJoin', joinGroupId);
        
        // If not signed in, prompt to sign in
        if (!window.FirebaseConfig || !window.FirebaseConfig.getCurrentUser()) {
            console.log('⚠️ User not signed in, showing sign in prompt');
            showToast('Please sign in to join the group', 'info');
            setTimeout(() => {
                openSignInModal();
            }, 1000);
        } else {
            // If already signed in, join immediately
            console.log('✅ User signed in, joining group immediately');
            await handleGroupJoin(joinGroupId);
        }
    } else {
        console.log('✅ No join parameter, normal flow');
    }
    
    // Show Sign In button if user is not signed in with Firebase
    // (independent of wallet availability)
    console.log('🔍 Checking if user is signed in for UI update');
    if (!window.FirebaseConfig || !window.FirebaseConfig.getCurrentUser()) {
        console.log('👤 User not signed in, showing sign in button');
        document.getElementById('signInSimpleMode').style.display = 'flex';
    } else {
        console.log('👤 User signed in:', window.FirebaseConfig.getCurrentUser()?.email);
    }
    
    // Show dashboard anyway
    console.log('📊 About to call showDashboard()');
    showDashboard();
    console.log('📊 showDashboard() completed');
    
    // Load user funds (both Simple and Blockchain modes)
    console.log('💰 About to load user funds');
    await loadUserFunds();
    console.log('💰 User funds loaded');
    
    } catch (error) {
        console.error('❌ CRITICAL ERROR in DOMContentLoaded:', error);
        console.error('Stack trace:', error.stack);
        showToast('Application initialization error. Please refresh the page.', 'error');
    }
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
        
        // Update unified session badge
        updateUnifiedSessionBadge();
        
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
        
        // Update unified session badge
        updateUnifiedSessionBadge();
        
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

        // Intentar obtener cuentas sin solicitar permiso, con timeout de 2 segundos
        console.log("🔄 Solicitando cuentas...");
        console.log("⏰ Iniciando Promise.race con timeout de 2s...");
        const accounts = await Promise.race([
            ethereumProvider.request({ method: 'eth_accounts' }),
            new Promise((_, reject) => setTimeout(() => {
                console.log("⏱️ TIMEOUT EJECUTADO - rechazando promise");
                reject(new Error('Wallet timeout'));
            }, 2000))
        ]).catch(error => {
            console.log("⏱️ Timeout o error al obtener cuentas:", error.message);
            return null;
        });
        console.log("📋 Cuentas obtenidas:", accounts ? accounts.length : 'null');

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
            
            // Update unified session badge
            updateUnifiedSessionBadge();
            
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
            
            // Update unified session badge
            updateUnifiedSessionBadge();
            
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
        
        // Update unified session badge
        updateUnifiedSessionBadge();
        
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
            
            // Update unified session badge
            updateUnifiedSessionBadge();
            
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
            
            // Update unified session badge
            updateUnifiedSessionBadge();
            
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
        
        // Update unified session badge
        updateUnifiedSessionBadge();
        
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
    console.log('📊 showDashboard() called');
    // Hide FAB button and action card when showing dashboard
    const fabBtn = document.getElementById('addExpenseBtn');
    if (fabBtn) fabBtn.style.display = 'none';
    
    const addExpenseCard = document.getElementById('simpleAddExpenseCard');
    if (addExpenseCard) addExpenseCard.style.display = 'none';
    
    // Make sure dashboard section is visible
    const dashboardSection = document.getElementById('dashboardSection');
    const fundDetailSection = document.getElementById('fundDetailSection');
    
    console.log('📦 Dashboard section found:', !!dashboardSection);
    console.log('📦 Fund detail section found:', !!fundDetailSection);
    
    if (dashboardSection) {
        dashboardSection.classList.add('active');
        console.log('✅ Dashboard section activated');
    }
    if (fundDetailSection) {
        fundDetailSection.classList.remove('active');
    }
    
    // Enable create fund button for both modes
    const createBtn = document.getElementById('createFundBtn');
    if (createBtn) {
        createBtn.disabled = false;
        createBtn.style.display = 'flex';
    }
}

async function updateUIForFirebaseUser(user) {
    const signInBtn = document.getElementById('signInSimpleMode');
    const signOutBtn = document.getElementById('signOutFirebase');
    
    if (user) {
        // User is signed in
        console.log("✅ Firebase user signed in:", user.email);
        if (signInBtn) signInBtn.style.display = 'none';
        if (signOutBtn) signOutBtn.style.display = 'flex';
        
        // Update unified session badge
        updateUnifiedSessionBadge();
        
        // Initialize notification system now that Firebase is ready
        if (typeof initNotificationSystem === 'function') {
            initNotificationSystem();
        }
        
        // Check for pending group join
        const pendingGroupId = sessionStorage.getItem('pendingGroupJoin');
        if (pendingGroupId) {
            await handleGroupJoin(pendingGroupId);
        }
        
        // Reload funds to show Simple Mode groups
        loadUserFunds();
    } else {
        // User is signed out
        console.log("🚪 Firebase user signed out");
        if (signOutBtn) signOutBtn.style.display = 'none';
        // Always show Sign In button when Firebase user is logged out
        if (signInBtn) {
            signInBtn.style.display = 'flex';
        }
        
        // Update unified session badge
        updateUnifiedSessionBadge();
    }
}

/**
 * Update unified session badge showing both Firebase auth and wallet status
 */
function updateUnifiedSessionBadge() {
    const badge = document.getElementById('unifiedSessionBadge');
    const authDisplay = document.getElementById('sessionAuthDisplay');
    const walletDisplay = document.getElementById('sessionWalletDisplay');
    const userName = document.getElementById('sessionUserName');
    const walletAddress = document.getElementById('sessionWalletAddress');
    const statusDisplay = document.getElementById('sessionStatus');
    
    const firebaseUser = window.FirebaseConfig?.getCurrentUser();
    const hasWallet = !!userAddress;
    
    // If no authentication at all, hide badge
    if (!firebaseUser && !hasWallet) {
        badge.style.display = 'none';
        const profileBtnMobile = document.getElementById('profileBtnMobile');
        if (profileBtnMobile) profileBtnMobile.style.display = 'none';
        return;
    }
    
    // Show badge
    badge.style.display = 'flex';
    
    // Show mobile profile button if authenticated
    const profileBtnMobile = document.getElementById('profileBtnMobile');
    if (profileBtnMobile && firebaseUser) {
        profileBtnMobile.style.display = 'flex';
    }
    
    // Update auth display
    if (firebaseUser) {
        authDisplay.style.display = 'flex';
        userName.textContent = firebaseUser.displayName || firebaseUser.email;
    } else {
        authDisplay.style.display = 'none';
    }
    
    // Update wallet display
    if (hasWallet) {
        walletDisplay.style.display = 'flex';
        walletAddress.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
    } else {
        walletDisplay.style.display = 'none';
    }
    
    // Update status display
    if (firebaseUser && hasWallet) {
        statusDisplay.innerHTML = '<span class="status-full">✅ Full Access</span>';
        statusDisplay.title = 'You have access to Simple Mode AND Blockchain Mode';
    } else if (firebaseUser && !hasWallet) {
        statusDisplay.innerHTML = '<span class="status-limited">⚠️ Limited Access</span>';
        statusDisplay.title = 'Simple Mode only. Connect wallet for blockchain features.';
    } else if (!firebaseUser && hasWallet) {
        statusDisplay.innerHTML = '<span class="status-wallet-only">🦊 Wallet Only</span>';
        statusDisplay.title = 'Blockchain Mode available. Sign in for Simple Mode groups.';
    }
}

/**
 * Check if user has access to blockchain features
 * @returns {boolean} True if user has wallet connected
 */
function hasBlockchainAccess() {
    return !!userAddress && !!provider;
}

/**
 * Check if user has access to simple mode features
 * @returns {boolean} True if user is signed in with Firebase
 */
function hasSimpleModeAccess() {
    return window.FirebaseConfig?.isAuthenticated() || false;
}

/**
 * Show access denied modal with specific message
 * @param {string} mode - 'blockchain' or 'simple'
 */
function showAccessDeniedModal(mode) {
    let title, message, action;
    
    if (mode === 'blockchain') {
        title = '🔒 Blockchain Access Required';
        message = `You need to connect a wallet to access blockchain groups.
        
Your current session uses Google/Email authentication which only provides access to Simple Mode features.

To use blockchain features:
1. Connect a wallet (MetaMask, Coinbase, etc.)
2. Ensure you're on Base Sepolia network

Would you like to connect a wallet now?`;
        action = () => {
            if (confirm(message)) {
                connectWallet();
            }
        };
    } else {
        title = '🔒 Sign In Required';
        message = `You need to sign in to access Simple Mode groups.

To create and join Simple Mode groups, please sign in with:
• Google account
• Email/Password

Would you like to sign in now?`;
        action = () => {
            if (confirm(message)) {
                openSignInModal();
            }
        };
    }
    
    action();
}

async function loadUserFunds() {
    try {
        // Show loading state
        const loadingGroups = document.getElementById('loadingGroups');
        const fundsGrid = document.getElementById('fundsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (loadingGroups) loadingGroups.style.display = 'flex';
        if (fundsGrid) fundsGrid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';
        
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
                        
                        // Load all groups (active and paused)
                        if (groupData) {
                            const fundData = {
                                fundAddress: groupId, // Use groupId as identifier
                                creator: groupData.createdBy || groupData.createdByEmail, // Use UID, fallback to email for old groups
                                creatorEmail: groupData.createdByEmail, // Keep email for display
                                fundName: groupData.name,
                                fundType: 3, // Other type for Simple Mode
                                createdAt: groupData.createdAt,
                                isActive: groupData.isActive !== false, // Default to true if not set
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
        
        // Hide loading state
        if (loadingGroups) loadingGroups.style.display = 'none';
        
        // Mostrar fondos
        displayFunds();
        
    } catch (error) {
        console.error("Error loading user funds:", error);
        showToast("Error loading your funds", "error");
        
        // Hide loading state on error
        if (loadingGroups) loadingGroups.style.display = 'none';
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
                    // Calculate total balance from approved expenses by currency
                    const expenses = groupData.expenses || {};
                    let balanceByCurrency = {};
                    let expenseCount = 0;
                    
                    for (const expense of Object.values(expenses)) {
                        if (expense.status === 'approved') {
                            const currency = expense.currency || 'USD';
                            balanceByCurrency[currency] = (balanceByCurrency[currency] || 0) + expense.amount;
                            expenseCount++;
                        }
                    }
                    
                    // Store balance info
                    fund.balanceByCurrency = balanceByCurrency;
                    fund.currencies = Object.keys(balanceByCurrency);
                    
                    // For simple display, show total in first currency or 0
                    const currencies = Object.keys(balanceByCurrency);
                    if (currencies.length > 0) {
                        fund.balance = balanceByCurrency[currencies[0]].toFixed(2);
                        fund.primaryCurrency = currencies[0];
                    } else {
                        fund.balance = 0;
                        fund.primaryCurrency = 'USD';
                    }
                    
                    fund.contributors = fund.memberCount || 0;
                    fund.proposals = expenseCount;
                    fund.target = fund.targetAmount || 0;
                    fund.progress = fund.target > 0 
                        ? (parseFloat(fund.balance) / fund.target) * 100 
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
    
    // Calculate total spent in USD from Simple Mode groups
    let totalUSD = 0;
    const simpleFunds = allUserFunds.filter(f => f.mode === 'simple');
    
    for (const fund of simpleFunds) {
        if (fund.expenses) {
            Object.values(fund.expenses).forEach(expense => {
                if (expense.status === 'approved') {
                    const amount = expense.amount || 0;
                    const currency = expense.currency || 'USD';
                    
                    // Simple conversion (can be enhanced with real rates)
                    if (currency === 'USD') {
                        totalUSD += amount;
                    } else if (currency === 'EUR') {
                        totalUSD += amount * 1.1; // Approximate conversion
                    } else if (currency === 'GBP') {
                        totalUSD += amount * 1.27;
                    } else if (currency === 'MXN') {
                        totalUSD += amount * 0.05;
                    } else if (currency === 'COP') {
                        totalUSD += amount * 0.00025;
                    } else if (currency === 'BRL') {
                        totalUSD += amount * 0.2;
                    } else {
                        totalUSD += amount; // Default to USD
                    }
                }
            });
        }
    }
    
    document.getElementById('totalFundsCreated').textContent = createdCount;
    document.getElementById('totalFundsParticipating').textContent = participatingCount;
    document.getElementById('totalValueLocked').textContent = `$${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Update filter counts
    document.getElementById('countAll').textContent = allUserFunds.length;
    document.getElementById('countCreated').textContent = createdCount;
    document.getElementById('countParticipating').textContent = participatingCount;
    document.getElementById('countTravel').textContent = allUserFunds.filter(f => f.fundType === 0n).length;
    document.getElementById('countSavings').textContent = allUserFunds.filter(f => f.fundType === 1n).length;
    document.getElementById('countShared').textContent = allUserFunds.filter(f => f.fundType === 2n).length;
}

function displayFunds() {
    console.log('📊 displayFunds called, allUserFunds:', allUserFunds.length);
    filterFunds();
}

function filterFunds() {
    console.log('🔍 filterFunds called, currentFilter:', currentFilter);
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
    
    console.log('📋 Filtered funds count:', filteredFunds.length);
    console.log('📦 Elements found - fundsGrid:', !!fundsGrid, 'emptyState:', !!emptyState);
    
    if (filteredFunds.length === 0) {
        console.log('✅ No funds, showing empty state');
        if (fundsGrid) {
            fundsGrid.innerHTML = '';
            fundsGrid.style.display = 'none';
        }
        if (emptyState) {
            emptyState.style.display = 'flex';
        }
    } else {
        emptyState.style.display = 'none';
        
        // Filter out hidden funds from localStorage
        const hiddenFunds = JSON.parse(localStorage.getItem('hiddenFunds') || '[]');
        console.log(`🔍 Filtering ${filteredFunds.length} funds. Hidden funds:`, hiddenFunds);
        
        const visibleFunds = filteredFunds.filter(fund => {
            const isHidden = hiddenFunds.includes(fund.fundAddress.toLowerCase());
            if (isHidden) {
                console.log(`⚠️ Fund ${fund.fundName} (${fund.fundAddress}) is hidden`);
            }
            return !isHidden;
        });
        
        console.log(`✅ Showing ${visibleFunds.length} visible funds out of ${filteredFunds.length} total`);
        
        if (visibleFunds.length === 0) {
            fundsGrid.innerHTML = '';
            fundsGrid.style.display = 'none';
            emptyState.style.display = 'flex';
        } else {
            fundsGrid.style.display = 'grid';
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
                    <button class="fund-action-btn fund-pause-btn" onclick="event.stopPropagation(); deactivateFund('${fund.fundAddress}', '${fund.fundName}')" title="Pausar grupo">
                        ⏸️
                    </button>
                    ` : `
                    <button class="fund-action-btn fund-resume-btn" onclick="event.stopPropagation(); reactivateFund('${fund.fundAddress}', '${fund.fundName}')" title="Reactivar grupo">
                        ▶️
                    </button>
                    `}
                    <button class="fund-action-btn fund-hide-btn" onclick="event.stopPropagation(); hideFund('${fund.fundAddress}', '${fund.fundName}')" title="Eliminar grupo">
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
                        <span class="fund-stat-value">${fund.mode === 'simple' ? `$${fund.balance || 0} ${fund.primaryCurrency || 'USD'}` : `${formatEth(fund.balance || 0)} ETH`}</span>
                        ${fund.mode === 'simple' && fund.currencies && fund.currencies.length > 1 ? `<small class="fund-stat-hint">+${fund.currencies.length - 1} more</small>` : ''}
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
        
        // Check if group is paused
        if (!currentFund.isActive) {
            console.log("⚠️ Group is paused - read-only mode");
            showToast("⏸️ Este grupo está pausado. Solo lectura disponible.", "warning");
        }
        
        // Validate access based on fund mode
        if (currentFund.mode === 'blockchain' && !hasBlockchainAccess()) {
            hideLoading();
            showAccessDeniedModal('blockchain');
            return;
        }
        
        if (currentFund.mode === 'simple' && !hasSimpleModeAccess()) {
            hideLoading();
            showAccessDeniedModal('simple');
            return;
        }
        
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
        
        // Hide FAB button (will show if Simple Mode)
        const fabBtn = document.getElementById('addExpenseBtn');
        if (fabBtn) fabBtn.style.display = 'none';
        
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
    // Hide FAB button FIRST
    const fabBtn = document.getElementById('addExpenseBtn');
    if (fabBtn) fabBtn.style.display = 'none';
    
    document.getElementById('fundDetailSection').classList.remove('active');
    document.getElementById('dashboardSection').classList.add('active');
    currentFund = null;
    currentFundContract = null;
}

/**
 * Navigate to home/dashboard when clicking logo
 */
function goToHome() {
    // Close any open modals
    closeCreateFundModal();
    closeSignInModal();
    
    // Go back to dashboard if in detail view
    if (document.getElementById('fundDetailSection').classList.contains('active')) {
        backToDashboard();
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deactivateFund(fundAddress, fundName) {
    try {
        const confirmed = confirm(
            `⏸️ ¿Pausar el fondo "${fundName}"?\n\n` +
            `Esta acción:\n` +
            `• Bloqueará todas las transacciones (depósitos, propuestas, votos)\n` +
            `• El fondo seguirá visible en modo solo lectura\n` +
            `• Podrás ver el historial y balances\n` +
            `• Solo el creador puede reactivarlo llamando al contrato\n` +
            `• Se notificará a todos los miembros del grupo\n\n` +
            `¿Continuar?`
        );
        
        if (!confirmed) return;
        
        showLoading("Desactivando fondo...");
        
        // Find the fund to get its mode
        const fund = allUserFunds.find(f => f.fundAddress === fundAddress);
        
        if (fund && fund.mode === 'blockchain') {
            // Blockchain mode - use smart contract
            const tx = await factoryContract.deactivateFund(fundAddress);
            await tx.wait();
        } else if (fund && fund.mode === 'simple') {
            // Simple mode - update in Firebase
            await window.FirebaseConfig.writeDb(
                `groups/${fundAddress}/isActive`,
                false
            );
            await window.FirebaseConfig.writeDb(
                `groups/${fundAddress}/pausedAt`,
                Date.now()
            );
            await window.FirebaseConfig.writeDb(
                `groups/${fundAddress}/pausedBy`,
                window.FirebaseConfig.getCurrentUser().uid
            );
        }
        
        // Notify all group members
        console.log("📢 Sending pause notifications to group members...");
        await notifyGroupMembers(
            fundAddress,
            'group_paused',
            `El grupo "${fundName}" ha sido pausado por el creador`,
            { groupName: fundName }
        );
        console.log("✅ Pause notifications sent");
        
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

async function reactivateFund(fundAddress, fundName) {
    try {
        const confirmed = confirm(`▶️ ¿Reactivar el grupo "${fundName}"?\n\nEsta acción habilitará nuevamente el grupo y se notificará a todos los miembros.`);
        if (!confirmed) return;
        
        showLoading("Reactivando grupo...");
        
        const fund = allUserFunds.find(f => f.fundAddress === fundAddress);
        
        if (fund && fund.mode === 'simple') {
            await window.FirebaseConfig.writeDb(`groups/${fundAddress}/isActive`, true);
            await window.FirebaseConfig.writeDb(`groups/${fundAddress}/reactivatedAt`, Date.now());
            await window.FirebaseConfig.writeDb(`groups/${fundAddress}/reactivatedBy`, window.FirebaseConfig.getCurrentUser().uid);
        }
        
        console.log("📢 Sending reactivation notifications...");
        await notifyGroupMembers(fundAddress, 'group_reactivated', `El grupo "${fundName}" ha sido reactivado`, { groupName: fundName });
        console.log("✅ Reactivation notifications sent");
        
        await refreshCurrentView();
        showToast("✅ Grupo reactivado correctamente", "success");
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error reactivating fund:", error);
        showToast("Error al reactivar el grupo: " + error.message, "error");
    }
}


async function hideFund(fundAddress, fundName) {
    try {
        // Find the fund to check its mode
        const fund = allUserFunds.find(f => f.fundAddress === fundAddress);
        
        if (fund && fund.mode === 'simple') {
            // Simple Mode - delete group completely from Firebase
            const confirmed = confirm(
                `🗑️ ¿Eliminar el grupo "${fundName}"?\n\n` +
                `Esta acción:\n` +
                `• Eliminará PERMANENTEMENTE el grupo de Firebase\n` +
                `• Se borrarán todos los gastos, pagos y datos\n` +
                `• Esta acción NO se puede deshacer\n` +
                `• Se notificará a todos los miembros\n` +
                `• Todos los miembros perderán acceso\n\n` +
                `¿Estás seguro de continuar?`
            );
            
            if (!confirmed) return;
            
            showLoading("Eliminando grupo...");
            
            // Notify all group members BEFORE deleting
            console.log("📢 Sending deletion notifications to group members...");
            await notifyGroupMembers(
                fundAddress,
                'group_deleted',
                `El grupo "${fundName}" ha sido eliminado por el creador`,
                { groupName: fundName }
            );
            console.log("✅ Deletion notifications sent");
            
            // Get all members to remove group from their user data
            const groupData = await window.FirebaseConfig.readDb(`groups/${fundAddress}`);
            const members = groupData?.members || {};
            
            // Remove group from each member's user data
            for (const memberId of Object.keys(members)) {
                await window.FirebaseConfig.deleteDb(`users/${memberId}/groups/${fundAddress}`);
                console.log(`🗑️ Removed group from user ${memberId}`);
            }
            
            // Delete the entire group from Firebase
            await window.FirebaseConfig.deleteDb(`groups/${fundAddress}`);
            console.log(`🗑️ Group ${fundAddress} deleted from Firebase`);
            
            showToast("✅ Grupo eliminado correctamente", "success");
            
        } else {
            // Blockchain mode - just hide locally
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
            
            showToast("✅ Fondo ocultado de tu vista", "success");
        }
        
        // Refresh view to hide the fund
        await refreshCurrentView();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("Error hiding fund:", error);
        showToast("Error al ocultar/archivar el fondo: " + error.message, "error");
    }
}

// ============================================
// CREATE FUND
// ============================================

function showCreateFundModal() {
    document.getElementById('createFundModal').style.display = 'flex';
    
    // Check if wallet is connected
    const blockchainModeRadio = document.querySelector('input[name="groupMode"][value="blockchain"]');
    const blockchainModeCard = blockchainModeRadio ? blockchainModeRadio.closest('.mode-card') : null;
    const walletWarning = document.getElementById('walletWarning');
    
    if (!userAddress && blockchainModeCard) {
        // Wallet not connected - disable blockchain mode
        blockchainModeRadio.disabled = true;
        blockchainModeCard.classList.add('mode-disabled');
        if (walletWarning) {
            walletWarning.style.display = 'block';
        }
        
        // Ensure simple mode is selected
        const simpleModeRadio = document.querySelector('input[name="groupMode"][value="simple"]');
        if (simpleModeRadio) {
            simpleModeRadio.checked = true;
        }
    } else if (blockchainModeCard) {
        // Wallet is connected - enable blockchain mode
        blockchainModeRadio.disabled = false;
        blockchainModeCard.classList.remove('mode-disabled');
        if (walletWarning) {
            walletWarning.style.display = 'none';
        }
    }
}

function closeCreateFundModal() {
    document.getElementById('createFundModal').style.display = 'none';
    document.getElementById('createFundForm').reset();
    // Reset wizard to step 1
    if (typeof resetFormWizard === 'function') {
        resetFormWizard();
    }
}

async function createFund(event) {
    event.preventDefault();
    
    try {
        const fundName = document.getElementById('fundName').value.trim();
        const description = document.getElementById('fundDescription').value.trim() || "Sin descripción";
        const isPrivate = document.getElementById('isPrivate').value === 'true'; // Hidden field with default true
        const approvalPercentage = document.getElementById('approvalPercentage').value;
        const minimumVotes = document.getElementById('minimumVotes').value;
        const fundType = document.getElementById('fundType').value; // Hidden field with default 0
        const groupMode = document.querySelector('input[name="groupMode"]:checked').value;
        
        if (!fundName) {
            showToast("Please enter the fund name", "warning");
            return;
        }
        
        // Blockchain mode disabled for soft launch
        if (groupMode === 'blockchain') {
            showToast("🚀 Blockchain Mode is coming soon! Please use Simple Mode for now.", "info");
            return;
        }
        
        // No target amount - always 0 (no limit)
        const targetAmountValue = 0;
        
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
        // Check if user is authenticated with Firebase
        if (!window.FirebaseConfig.isAuthenticated()) {
            // Show informative message
            const shouldSignIn = confirm(
                "🔐 Simple Mode requires Google/Email Sign-In\n\n" +
                "Simple Mode uses Firebase (no blockchain) for:\n" +
                "✅ Free expense tracking\n" +
                "✅ Group balances calculation\n" +
                "✅ No gas fees\n\n" +
                "Your wallet is not needed for Simple Mode.\n\n" +
                "Would you like to sign in with Google/Email now?"
            );
            
            if (!shouldSignIn) {
                return;
            }
            
            // Show sign-in modal
            await showSignInModal();
            
            // After sign in, retry
            if (!window.FirebaseConfig.isAuthenticated()) {
                showToast("Sign in required to create Simple Mode group", "warning");
                return;
            }
        }
        
        showLoading("Creating Simple Mode group...");
        
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
        // Check if wallet is connected
        if (!userAddress || !factoryContract) {
            const shouldConnect = confirm(
                "🦊 Blockchain Mode requires MetaMask connection\n\n" +
                "Blockchain Mode uses smart contracts for:\n" +
                "✅ Automatic on-chain payments\n" +
                "✅ Transparent voting\n" +
                "✅ Decentralized fund management\n\n" +
                "⚠️ Requires gas fees for transactions.\n\n" +
                "Would you like to connect your wallet now?"
            );
            
            if (!shouldConnect) {
                return;
            }
            
            // Trigger wallet connection
            document.getElementById('connectWallet').click();
            showToast("Please connect your wallet and try again", "info");
            return;
        }
        
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

/**
 * Sign out from Firebase (Google/Email)
 */
async function signOutFromFirebase() {
    try {
        const confirmed = confirm(
            "🚪 Sign out from Simple Mode?\n\n" +
            "You will be signed out from Google/Email.\n" +
            "Your Simple Mode groups will not be accessible until you sign in again.\n\n" +
            "Your wallet connection (if any) will remain active.\n\n" +
            "Continue?"
        );
        
        if (!confirmed) {
            return;
        }
        
        showLoading("Signing out...");
        await window.FirebaseConfig.signOut();
        showToast("Signed out successfully", "success");
        
        // Reload to update UI
        await loadUserFunds();
        hideLoading();
    } catch (error) {
        hideLoading();
        console.error("❌ Sign out error:", error);
        showToast("Sign out failed: " + error.message, "error");
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
        
        // Check if Simple Mode or Blockchain Mode
        if (currentFund.mode === 'simple') {
            await loadSimpleModeDetailView();
            return;
        }
        
        // Blockchain Mode - existing logic
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
        
        document.getElementById('fundBalanceMain').textContent = `${formatEth(balanceEth)} ETH`;
        document.getElementById('fundMembers').textContent = contributors.toString();
        document.getElementById('fundProposals').textContent = proposals.toString();
        
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
        if (currentFund && currentFund.isSimpleMode) {
            loadSimpleModeExpenses();
        } else {
            loadHistory();
        }
    }
    
    // Load balances when balances tab is selected
    if (tabName === 'balances') {
        if (currentFund && currentFund.isSimpleMode) {
            loadSimpleModeBalances();
        } else {
            loadBalances();
        }
    }
    
    // Load members when members tab is selected
    if (tabName === 'members') {
        if (currentFund && currentFund.isSimpleMode) {
            loadSimpleModeMembers();
        } else {
            loadMembers();
        }
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

/**
 * Load Simple Mode group detail view (Splitwise-style)
 */
async function loadSimpleModeDetailView() {
    try {
        console.log("📖 Loading Simple Mode detail view for:", currentFund);
        console.log("📍 Step 1: Updating header icons...");
        
        const fundTypeIcons = ['🌴', '💰', '🤝', '🎯'];
        
        // Update header - safely check if elements exist
        const headerIcon = document.getElementById('fundHeaderIcon');
        const detailName = document.getElementById('fundDetailName');
        
        if (headerIcon) {
            headerIcon.textContent = fundTypeIcons[Number(currentFund.fundType)] || '🎯';
        }
        if (detailName) {
            detailName.textContent = currentFund.fundName || currentFund.name;
        }
        
        console.log("📍 Step 2: Reading Firebase data for group:", currentFund.fundAddress);
        
        // Get group data from Firebase
        const groupData = await window.FirebaseConfig.readDb(`groups/${currentFund.fundAddress}`);
        
        console.log("📍 Step 3: Firebase data received:", groupData ? "✅ YES" : "❌ NO");
        
        if (!groupData) {
            throw new Error("Group not found in Firebase");
        }
        
        // Update currentFund with Firebase data
        currentFund = {
            ...currentFund,
            ...groupData,
            fundId: currentFund.fundAddress,
            isSimpleMode: true
        };
        
        console.log("📍 Step 4: Updating UI elements...");
        
        // Helper function to safely update element
        const safeUpdate = (id, property, value) => {
            const el = document.getElementById(id);
            if (el) el[property] = value;
        };
        
        // Update UI safely
        safeUpdate('fundDetailDescription', 'textContent', groupData.description || 'No description');
        safeUpdate('fundTypeBadge', 'textContent', '📝 Simple Mode');
        safeUpdate('fundStatusBadge', 'textContent', '🟢 Active');
        safeUpdate('fundPrivacyBadge', 'textContent', groupData.isPrivate ? '🔒 Private' : '🌐 Public');
        
        // For Simple Mode: show stats differently
        const members = groupData.members ? Object.keys(groupData.members).length : 1;
        const expenses = groupData.expenses ? Object.keys(groupData.expenses).filter(k => 
            groupData.expenses[k].status === 'approved' || !groupData.expenses[k].status
        ).length : 0;
        
        // Calculate total spent with currency conversion
        const { totalUSD, currencyBreakdown } = await calculateTotalSpent(groupData);
        
        // Format balance display - simplified with breakdown
        const currencies = Object.keys(currencyBreakdown);
        const balanceMainEl = document.getElementById('fundBalanceMain');
        const balanceBreakdownEl = document.getElementById('fundBalanceBreakdown');
        
        if (currencies.length === 1 && currencies[0] === 'USD') {
            // Single currency USD - show simple
            safeUpdate('fundBalanceMain', 'textContent', `$${totalUSD.toFixed(2)}`);
            if (balanceBreakdownEl) balanceBreakdownEl.style.display = 'none';
        } else if (currencies.length === 1) {
            // Single non-USD currency
            const currency = currencies[0];
            const symbol = getCurrencySymbol(currency);
            safeUpdate('fundBalanceMain', 'textContent', `${symbol}${currencyBreakdown[currency].toFixed(2)} ${currency}`);
            safeUpdate('fundBalanceBreakdown', 'innerHTML', `≈ $${totalUSD.toFixed(2)} USD`);
            if (balanceBreakdownEl) balanceBreakdownEl.style.display = 'block';
        } else if (currencies.length > 1) {
            // Multiple currencies - show USD total with breakdown
            safeUpdate('fundBalanceMain', 'textContent', `$${totalUSD.toFixed(2)} USD`);
            const breakdown = currencies.map(curr => 
                `${getCurrencySymbol(curr)}${currencyBreakdown[curr].toFixed(2)} <span class="currency-code">${curr}</span>`
            ).join(' + ');
            safeUpdate('fundBalanceBreakdown', 'innerHTML', breakdown);
            if (balanceBreakdownEl) balanceBreakdownEl.style.display = 'block';
        } else {
            safeUpdate('fundBalanceMain', 'textContent', '$0.00');
            if (balanceBreakdownEl) balanceBreakdownEl.style.display = 'none';
        }
        
        safeUpdate('fundMembers', 'textContent', members.toString());
        safeUpdate('fundProposals', 'textContent', expenses.toString());
        
        // User's share/balance
        const myBalance = calculateMyBalance(groupData);
        const userBalanceText = myBalance >= 0 
            ? `You are owed $${Math.abs(myBalance).toFixed(2)}`
            : `You owe $${Math.abs(myBalance).toFixed(2)}`;
        safeUpdate('userContribution', 'textContent', userBalanceText);
        
        console.log("📍 Step 5: Hiding blockchain-specific elements...");
        
        // Hide blockchain-specific elements safely
        const inviteBanner = document.getElementById('invitationBanner');
        const closedBanner = document.getElementById('closedFundBanner');
        if (inviteBanner) inviteBanner.style.display = 'none';
        if (closedBanner) closedBanner.style.display = 'none';
        
        // Show/hide tabs for Simple Mode
        const depositTab = document.querySelector('.fund-tab-btn[data-tab="deposit"]');
        const voteTab = document.querySelector('.fund-tab-btn[data-tab="vote"]');
        const proposeTab = document.querySelector('.fund-tab-btn[data-tab="propose"]');
        const inviteTab = document.querySelector('.fund-tab-btn[data-tab="invite"]');
        const membersTab = document.querySelector('.fund-tab-btn[data-tab="members"]');
        const balancesTab = document.querySelector('.fund-tab-btn[data-tab="balances"]');
        const manageTab = document.querySelector('.fund-tab-btn[data-tab="manage"]');
        
        // Hide blockchain tabs
        if (depositTab) depositTab.style.display = 'none';
        if (voteTab) voteTab.style.display = 'none';
        if (proposeTab) proposeTab.style.display = 'none';
        
        // Show Simple Mode tabs
        if (inviteTab) {
            inviteTab.style.display = 'flex';
            inviteTab.textContent = '👥 Invite';
        }
        if (membersTab) membersTab.style.display = 'flex';
        if (balancesTab) balancesTab.style.display = 'flex';
        if (manageTab) manageTab.style.display = 'none'; // Hide for now
        
        console.log("📍 Step 6: Loading invite UI...");
        // Load Simple Mode invite UI
        loadSimpleModeInviteUI();
        
        console.log("📍 Step 7: Loading expenses...");
        // Load expenses (acts as "history" tab)
        await loadSimpleModeExpenses();
        
        console.log("📍 Step 7.5: Loading new features...");
        // Load new features: recurring expenses, budget status
        await loadRecurringExpenses();
        await loadBudgetStatus();
        
        // Show quick actions
        const quickActions = document.getElementById('simpleQuickActions');
        if (quickActions) {
            quickActions.style.display = 'grid';
        }
        
        console.log("📍 Step 8: Switching to history tab...");
        // Switch to expenses tab by default
        switchFundTab('history');
        
        console.log("📍 Step 9: Showing Add Expense UI elements...");
        
        // Show Add Expense Action Card
        const addExpenseCard = document.getElementById('simpleAddExpenseCard');
        if (addExpenseCard) {
            addExpenseCard.style.display = 'block';
            
            // Add click listener to card button
            const cardBtn = document.getElementById('addExpenseCardBtn');
            if (cardBtn) {
                // Remove existing listeners
                const newCardBtn = cardBtn.cloneNode(true);
                cardBtn.parentNode.replaceChild(newCardBtn, cardBtn);
                
                newCardBtn.addEventListener('click', function() {
                    console.log('🖱️ Action card button clicked!');
                    showAddExpenseModal();
                });
            }
        }
        
        // Show Add Expense FAB button ONLY if we're in detail view and group is active
        const fabBtn = document.getElementById('addExpenseBtn');
        const detailSection = document.getElementById('fundDetailSection');
        if (fabBtn && detailSection && detailSection.classList.contains('active')) {
            // Hide FAB if group is paused
            fabBtn.style.display = (currentFund && !currentFund.isActive) ? 'none' : 'flex';
            
            // Remove any existing listeners to avoid duplicates
            const newFabBtn = fabBtn.cloneNode(true);
            fabBtn.parentNode.replaceChild(newFabBtn, fabBtn);
            
            // Add click listener
            newFabBtn.addEventListener('click', function() {
                console.log('🖱️ FAB button clicked!');
                showAddExpenseModal();
            });
            
            console.log("✅ FAB button shown and click listener attached");
        } else {
            console.log("⚠️ FAB button not shown - element not found or section not active");
        }
        
        console.log("✅ Simple Mode detail view loaded successfully!");
        
    } catch (error) {
        console.error("❌ Error loading Simple Mode detail:", error);
        console.error("Error stack:", error.stack);
        showToast("Error loading group: " + error.message, "error");
        throw error; // Re-throw to be caught by caller
    }
}

/**
 * Calculate total spent in Simple Mode group
 */
async function calculateTotalSpent(groupData) {
    if (!groupData.expenses) return { totalUSD: 0, currencyBreakdown: {} };
    
    let totalUSD = 0;
    const currencyBreakdown = {};
    
    for (const expense of Object.values(groupData.expenses)) {
        if (expense.status === 'approved' || !expense.status) { // Include all in Simple Mode
            const currency = expense.currency || 'USD';
            const amount = Math.abs(expense.amount || 0);
            
            // Track by currency
            if (!currencyBreakdown[currency]) {
                currencyBreakdown[currency] = 0;
            }
            currencyBreakdown[currency] += amount;
            
            // Convert to USD for total
            const amountUSD = await convertToUSD(amount, currency);
            totalUSD += amountUSD;
        }
    }
    
    return { totalUSD, currencyBreakdown };
}

/**
 * Calculate my balance in Simple Mode group
 */
function calculateMyBalance(groupData) {
    // TODO: Implement balance calculation
    // This will be based on expenses and settlements
    return 0;
}

/**
 * Load Simple Mode expenses list
 */
async function loadSimpleModeExpenses() {
    const groupData = await window.FirebaseConfig.readDb(`groups/${currentFund.fundAddress}`);
    const historyContainer = document.getElementById('historyList');
    const searchSection = document.getElementById('expenseSearchSection');
    
    if (!historyContainer) {
        console.error('❌ History container not found (historyList)');
        return;
    }
    
    // Collect both expenses and settlements
    const items = [];
    
    // Add expenses
    if (groupData && groupData.expenses) {
        Object.entries(groupData.expenses).forEach(([id, expense]) => {
            items.push({
                id,
                type: 'expense',
                ...expense
            });
        });
    }
    
    // Add settlements (payments)
    if (groupData && groupData.settlements) {
        Object.entries(groupData.settlements).forEach(([id, settlement]) => {
            items.push({
                id,
                type: 'settlement',
                ...settlement
            });
        });
    }
    
    if (items.length === 0) {
        if (searchSection) searchSection.style.display = 'none';
        historyContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h4>No transactions yet</h4>
                <p>Add your first expense to start tracking</p>
                <button class="btn btn-primary" onclick="showAddExpenseModal()">
                    <span class="btn-icon">➕</span>
                    <span>Add Expense</span>
                </button>
            </div>
        `;
        return;
    }
    
    // Show search section when there are items
    if (searchSection) searchSection.style.display = 'block';
    
    // Sort by timestamp (newest first)
    items.sort((a, b) => {
        const timeA = a.recordedAt || a.timestamp || 0;
        const timeB = b.recordedAt || b.timestamp || 0;
        return timeB - timeA;
    });
    
    const currentUserId = firebase.auth().currentUser?.uid;
    
    historyContainer.innerHTML = items.map(item => {
        if (item.type === 'settlement') {
            return renderSettlementItem(item, currentUserId, groupData);
        } else {
            return renderExpenseItem(item, currentUserId, groupData);
        }
    }).join('');
}

/**
 * Render settlement item for history
 */
function renderSettlementItem(settlement, currentUserId, groupData) {
    const dateStr = new Date(settlement.recordedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const currency = groupData.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);
    const amountStr = `${currencySymbol}${settlement.amount}`;
    
    // Get member names
    const fromMember = groupData.members?.[settlement.from];
    const toMember = groupData.members?.[settlement.to];
    const fromName = fromMember?.name || fromMember?.email || 'Unknown';
    const toName = toMember?.name || toMember?.email || 'Unknown';
    
    const isCurrentUserInvolved = settlement.from === currentUserId || settlement.to === currentUserId;
    
    return `
        <div class="expense-card-compact settlement-card" data-settlement-id="${settlement.id}">
            <div class="expense-header">
                <div class="expense-header-left">
                    <h4 class="expense-title-compact">
                        💸 Payment: ${fromName} → ${toName}
                        <span class="expense-badge badge-payment">Paid</span>
                    </h4>
                    <span class="expense-date-compact">📅 ${dateStr}</span>
                </div>
                <div class="expense-header-right">
                    <div class="expense-amount-large payment-amount">
                        ${amountStr} <span class="currency-label">${currency}</span>
                    </div>
                </div>
            </div>
            ${settlement.notes ? `
                <div class="expense-details" style="display: block; padding-top: 8px;">
                    <p class="expense-notes">💬 ${settlement.notes}</p>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Render expense item for history
 */
function renderExpenseItem(expense, currentUserId, groupData) {
    // Format date properly
    let dateStr = 'No date';
    if (expense.date) {
        // If date is a string like "2025-12-13", parse it
        dateStr = new Date(expense.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } else if (expense.timestamp) {
        dateStr = new Date(expense.timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Format amount - preserve full precision and show correct currency
    const isNegative = expense.amount < 0;
    const absAmount = Math.abs(expense.amount);
    const currency = expense.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);
    const amountStr = absAmount % 1 === 0 ? `${currencySymbol}${absAmount}` : `${currencySymbol}${absAmount.toFixed(2)}`;
    // Show currency label for all currencies (including USD for debugging)
    const currencyLabel = ` <span class="currency-label">${currency}</span>`;
    const amountClass = isNegative ? 'expense-amount-negative' : 'expense-amount-large';
    const amountPrefix = isNegative ? '-' : '';
    
    console.log(`💰 Expense "${expense.description}": amount=${expense.amount}, currency=${expense.currency || 'undefined'}, display=${amountStr} ${currency}`);
    
    // Check if current user created/paid this expense
    const paidByArray = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
    const isCreator = paidByArray.includes(currentUserId);
    
    // Format paidBy display
    let paidByDisplay = expense.paidByName || '';
    if (!paidByDisplay && paidByArray.length > 0) {
        const names = paidByArray.map(uid => {
            const member = groupData.members?.[uid];
            return member?.name || member?.email || uid;
        });
        paidByDisplay = names.join(' & ');
    }
    
    // Count interactions
    const likesCount = expense.likes ? Object.keys(expense.likes).length : 0;
    const hasLiked = expense.likes && expense.likes[currentUserId];
    const commentsCount = expense.comments ? Object.keys(expense.comments).length : 0;
    const deleteRequestsCount = expense.deleteRequests ? Object.keys(expense.deleteRequests).length : 0;
    
    return `
        <div class="expense-card-compact" data-expense-id="${expense.id}">
            <div class="expense-header" onclick="toggleExpenseDetails('${expense.id}')">
                <div class="expense-header-left">
                    <h4 class="expense-title-compact">
                        ${isNegative ? '💰 ' : ''}${expense.description}
                        ${isNegative ? '<span class="expense-badge badge-payment">Payment</span>' : ''}
                    </h4>
                    <span class="expense-date-compact">📅 ${dateStr}</span>
                </div>
                <div class="expense-header-right">
                    <div class="${amountClass}">
                        ${amountPrefix}${amountStr}${currencyLabel}
                    </div>
                    <span class="expand-icon">▼</span>
                </div>
            </div>
            
            <div class="expense-details" style="display: none;">
                <div class="expense-meta">
                    <span class="meta-item">👤 ${paidByDisplay}</span>
                    <span class="meta-item">👥 ${expense.splitBetween.length} people</span>
                </div>
                ${expense.notes ? `<p class="expense-notes">💬 ${expense.notes}</p>` : ''}
                
                <!-- Interaction Bar -->
                <div class="expense-interactions">
                <button class="interaction-btn ${hasLiked ? 'active' : ''}" onclick="toggleLikeExpense('${expense.id}')" title="Like">
                    ${hasLiked ? '❤️' : '🤍'} ${likesCount > 0 ? likesCount : ''}
                </button>
                <button class="interaction-btn" onclick="showExpenseComments('${expense.id}')" title="Comments">
                    💬 ${commentsCount > 0 ? commentsCount : ''}
                </button>
                ${!isCreator ? `
                    <button class="interaction-btn ${deleteRequestsCount > 0 ? 'active' : ''}" onclick="requestDeleteExpense('${expense.id}')" title="Request deletion">
                        ⚠️ ${deleteRequestsCount > 0 ? deleteRequestsCount : ''}
                    </button>
                ` : `
                    <button class="interaction-btn btn-delete" onclick="deleteExpense('${expense.id}')" title="Delete expense">
                        🗑️ Delete
                    </button>
                `}
            </div>
            
                ${deleteRequestsCount > 0 && isCreator ? `
                    <div class="expense-alert">
                        <span class="alert-icon">⚠️</span>
                        <span>${deleteRequestsCount} member${deleteRequestsCount > 1 ? 's' : ''} requested deletion of this expense</span>
                        <button class="btn-link" onclick="showDeleteRequests('${expense.id}')">View requests</button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

/**
 * Load and display Simple Mode balances
 */
async function loadSimpleModeBalances() {
    try {
        console.log('⚖️ Loading Simple Mode balances...');
        console.log('📊 Current fund:', currentFund);
        
        // Set current group ID for mode manager  
        window.modeManager.currentGroupId = currentFund.fundId;
        window.modeManager.groupData = currentFund;
        
        // Calculate balances using mode manager
        const memberBalances = await window.modeManager.calculateSimpleBalances();
        
        console.log('💰 Member balances calculated:', memberBalances);
        
        const balancesList = document.getElementById('balancesList');
        const noBalances = document.getElementById('noBalances');
        const dashboard = document.getElementById('simpleModeBalanceDashboard');
        const timelineSection = document.getElementById('timelineFilterSection');
        const smartSettlementsSection = document.getElementById('smartSettlementsSection');
        
        if (!memberBalances || memberBalances.length === 0) {
            console.log('⚠️ No balances to display');
            if (balancesList) balancesList.innerHTML = '';
            if (noBalances) noBalances.style.display = 'flex';
            if (dashboard) dashboard.style.display = 'none';
            if (timelineSection) timelineSection.style.display = 'none';
            if (smartSettlementsSection) smartSettlementsSection.style.display = 'none';
            return;
        }
        
        if (noBalances) noBalances.style.display = 'none';
        if (dashboard) dashboard.style.display = 'block';
        if (timelineSection) timelineSection.style.display = 'block';
        
        // Show Smart Settlements button if there are unsettled debts
        const pairwiseDebts = simplifyDebts(memberBalances);
        if (smartSettlementsSection) {
            smartSettlementsSection.style.display = pairwiseDebts.length > 0 ? 'block' : 'none';
        }
        
        // Calculate stats for dashboard with currency conversion
        const groupData = await window.FirebaseConfig.readDb(`groups/${currentFund.fundAddress}`);
        let totalExpensesUSD = 0;
        let expenseCount = 0;
        const currencyTotals = {}; // Track totals by currency
        const hasMixedCurrencies = new Set();
        
        if (groupData.expenses) {
            // First pass: collect currency info
            for (const expense of Object.values(groupData.expenses)) {
                const currency = expense.currency || 'USD';
                hasMixedCurrencies.add(currency);
            }

            // Second pass: convert all to USD
            for (const expense of Object.values(groupData.expenses)) {
                const currency = expense.currency || 'USD';
                const amount = Math.abs(expense.amount || 0);
                
                if (!currencyTotals[currency]) {
                    currencyTotals[currency] = 0;
                }
                currencyTotals[currency] += amount;
                
                // Convert to USD for totals
                const amountUSD = await convertToUSD(amount, currency);
                totalExpensesUSD += amountUSD;
                expenseCount++;
            }
        }
        
        const memberCount = Object.keys(currentFund.members || {}).length;
        const currencies = Object.keys(currencyTotals);
        
        // Update dashboard stats
        let totalText = '';
        if (currencies.length === 1) {
            const currency = currencies[0];
            const symbol = getCurrencySymbol(currency);
            totalText = `${symbol}${currencyTotals[currency].toFixed(2)}`;
        } else if (currencies.length > 1) {
            // Show USD equivalent with original currencies
            const currencyList = currencies.map(curr => 
                `${getCurrencySymbol(curr)}${currencyTotals[curr].toFixed(2)}`
            ).join(' + ');
            totalText = `$${totalExpensesUSD.toFixed(2)} USD (${currencyList})`;
        } else {
            totalText = '$0.00';
        }
        
        document.getElementById('simpleModeTotalExpenses').textContent = totalText;
        document.getElementById('simpleModeTotalExpenses').title = currencies.length > 1 ? 
            'Converted to USD using current exchange rates' : '';
        
        // For per person
        if (currencies.length > 1) {
            const perPersonUSD = memberCount > 0 ? totalExpensesUSD / memberCount : 0;
            document.getElementById('simpleModePerPerson').textContent = `$${perPersonUSD.toFixed(2)} USD`;
            document.getElementById('simpleModePerPerson').title = 'Average per person (converted to USD)';
        } else if (currencies.length === 1) {
            const currency = currencies[0];
            const symbol = getCurrencySymbol(currency);
            const perPerson = memberCount > 0 ? currencyTotals[currency] / memberCount : 0;
            document.getElementById('simpleModePerPerson').textContent = `${symbol}${perPerson.toFixed(2)}`;
        } else {
            document.getElementById('simpleModePerPerson').textContent = '$0.00';
        }
        
        document.getElementById('simpleModeActiveMembers').textContent = memberCount;
        
        // Render balance chart
        renderBalanceChart(memberBalances);
        
        const currentUserId = firebase.auth().currentUser?.uid;
        
        // Reuse pairwiseDebts from earlier (already calculated for Smart Settlements button)
        // const pairwiseDebts = simplifyDebts(memberBalances); // Already declared above
        
        // Separate balances into: I owe, owes me
        const iOwe = pairwiseDebts.filter(debt => debt.from === currentUserId);
        const owesMe = pairwiseDebts.filter(debt => debt.to === currentUserId);
        
        let html = '';
        
        // Show debts I owe
        if (iOwe.length > 0) {
            html += '<h4 class="balance-section-title balance-owes">💸 You owe:</h4>';
            iOwe.forEach(debt => {
                const toMember = currentFund.members[debt.to];
                const toName = toMember?.name || toMember?.email || debt.to;
                html += `
                    <div class="balance-card-simple owes">
                        <div class="balance-card-content">
                            <div class="balance-info">
                                <div class="balance-avatar">${(toName || 'U').charAt(0).toUpperCase()}</div>
                                <div class="balance-details">
                                    <span class="balance-name">${toName}</span>
                                    <span class="balance-description">You owe this person</span>
                                </div>
                            </div>
                            <div class="balance-amount-display owes">
                                $${debt.amount.toFixed(2)}
                            </div>
                        </div>
                        <button class="btn btn-primary btn-record-payment" onclick="showRecordPaymentModal('${debt.to}', ${debt.amount})">
                            <span class="btn-icon">💰</span>
                            <span>Record Payment</span>
                        </button>
                    </div>
                `;
            });
        }
        
        // Show debts owed to me
        if (owesMe.length > 0) {
            html += '<h4 class="balance-section-title balance-owed">💰 Owes you:</h4>';
            owesMe.forEach(debt => {
                const fromMember = currentFund.members[debt.from];
                const fromName = fromMember?.name || fromMember?.email || debt.from;
                html += `
                    <div class="balance-card-simple owed">
                        <div class="balance-card-content">
                            <div class="balance-info">
                                <div class="balance-avatar">${(fromName || 'U').charAt(0).toUpperCase()}</div>
                                <div class="balance-details">
                                    <span class="balance-name">${fromName}</span>
                                    <span class="balance-description">This person owes you</span>
                                </div>
                            </div>
                            <div class="balance-amount-display owed">
                                $${debt.amount.toFixed(2)}
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        // Show all settled if no debts
        if (iOwe.length === 0 && owesMe.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <h4>All Settled!</h4>
                    <p>Everyone is even. No outstanding balances.</p>
                </div>
            `;
        }
        
        balancesList.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading balances:', error);
        showToast(`Error loading balances: ${error.message}`, 'error');
    }
}

/**
 * Render visual balance chart
 */
function renderBalanceChart(memberBalances) {
    const chartContainer = document.getElementById('balanceChart');
    if (!chartContainer) return;
    
    // Find max absolute balance for scaling
    const maxBalance = Math.max(...memberBalances.map(m => Math.abs(m.balance)));
    
    if (maxBalance === 0) {
        chartContainer.innerHTML = '<div class="chart-empty">No balances to display</div>';
        return;
    }
    
    let html = '<div class="chart-bars">';
    
    memberBalances.forEach(member => {
        const memberData = currentFund.members[member.memberId];
        const memberName = memberData?.name || memberData?.email || member.memberId;
        const shortName = memberName.split(' ')[0]; // First name only
        
        const percentage = (Math.abs(member.balance) / maxBalance) * 100;
        const isPositive = member.balance > 0;
        const isNegative = member.balance < 0;
        
        html += `
            <div class="chart-bar-item">
                <div class="chart-bar-label">${shortName}</div>
                <div class="chart-bar-container">
                    <div class="chart-bar ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}" 
                         style="width: ${percentage}%"
                         title="${memberName}: $${member.balance.toFixed(2)}">
                    </div>
                </div>
                <div class="chart-bar-value ${isPositive ? 'positive' : isNegative ? 'negative' : ''}">
                    ${isPositive ? '+' : ''}$${Math.abs(member.balance).toFixed(2)}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    chartContainer.innerHTML = html;
}

/**
 * Simplify debts using greedy algorithm (Splitwise-style)
 * Converts individual balances to optimal pairwise transactions
 */
function simplifyDebts(memberBalances) {
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = memberBalances.filter(m => m.balance > 0.01)
        .map(m => ({ id: m.memberId, amount: m.balance }))
        .sort((a, b) => b.amount - a.amount);
    
    const debtors = memberBalances.filter(m => m.balance < -0.01)
        .map(m => ({ id: m.memberId, amount: Math.abs(m.balance) }))
        .sort((a, b) => b.amount - a.amount);
    
    const transactions = [];
    
    let i = 0, j = 0;
    
    while (i < creditors.length && j < debtors.length) {
        const creditor = creditors[i];
        const debtor = debtors[j];
        
        const amount = Math.min(creditor.amount, debtor.amount);
        
        if (amount > 0.01) {
            transactions.push({
                from: debtor.id,
                to: creditor.id,
                amount: amount
            });
        }
        
        creditor.amount -= amount;
        debtor.amount -= amount;
        
        if (creditor.amount < 0.01) i++;
        if (debtor.amount < 0.01) j++;
    }
    
    return transactions;
}

// ============================================
// SMART SETTLEMENTS FUNCTIONS
// ============================================

// Store settlements for later use
let currentSettlements = [];

/**
 * Open Smart Settlements modal
 */
function openSmartSettlements() {
    const modal = document.getElementById('smartSettlementsModal');
    if (!modal) return;
    
    modal.classList.add('active');
    loadSmartSettlements();
}

/**
 * Close Smart Settlements modal
 */
function closeSmartSettlements(event) {
    if (!event || event.target.classList.contains('modal-overlay') || event.target.classList.contains('close-btn')) {
        const modal = document.getElementById('smartSettlementsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

/**
 * Load and display smart settlements
 */
async function loadSmartSettlements() {
    try {
        console.log('🎯 Loading smart settlements...');
        
        if (!currentFund) {
            showToast('No group selected', 'error');
            return;
        }
        
        // Set current group ID for mode manager
        window.modeManager.currentGroupId = currentFund.fundId;
        window.modeManager.groupData = currentFund;
        
        // Calculate balances
        const memberBalances = await window.modeManager.calculateSimpleBalances();
        
        if (!memberBalances || memberBalances.length === 0) {
            document.getElementById('noSettlements').style.display = 'flex';
            document.getElementById('settlementsList').style.display = 'none';
            document.getElementById('markAllSettledBtn').style.display = 'none';
            return;
        }
        
        // Simplify debts
        const settlements = simplifyDebts(memberBalances);
        
        // Store settlements globally for later use
        currentSettlements = settlements;
        
        if (settlements.length === 0) {
            document.getElementById('noSettlements').style.display = 'flex';
            document.getElementById('settlementsList').style.display = 'none';
            document.getElementById('markAllSettledBtn').style.display = 'none';
            return;
        }
        
        // Hide empty state
        document.getElementById('noSettlements').style.display = 'none';
        document.getElementById('settlementsList').style.display = 'block';
        document.getElementById('markAllSettledBtn').style.display = 'inline-flex';
        
        // Update stats
        const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
        document.getElementById('settlementsCount').textContent = settlements.length;
        document.getElementById('settlementsTotal').textContent = `$${totalAmount.toFixed(2)}`;
        
        // Render settlements
        const listContainer = document.getElementById('settlementsList');
        let html = '';
        
        settlements.forEach((settlement, index) => {
            const fromMember = currentFund.members[settlement.from];
            const toMember = currentFund.members[settlement.to];
            const fromName = fromMember?.name || fromMember?.email || 'Unknown';
            const toName = toMember?.name || toMember?.email || 'Unknown';
            
            html += `
                <div class="settlement-item" id="settlement-${index}">
                    <div class="settlement-arrow">→</div>
                    <div class="settlement-content">
                        <div class="settlement-from">
                            <div class="settlement-avatar">${fromName.charAt(0).toUpperCase()}</div>
                            <div class="settlement-name">${fromName}</div>
                        </div>
                        <div class="settlement-details">
                            <div class="settlement-label">pays</div>
                            <div class="settlement-amount">$${settlement.amount.toFixed(2)}</div>
                        </div>
                        <div class="settlement-to">
                            <div class="settlement-avatar">${toName.charAt(0).toUpperCase()}</div>
                            <div class="settlement-name">${toName}</div>
                        </div>
                    </div>
                    <button class="settlement-mark-btn" onclick="markSettlementComplete(${index})" title="Mark as complete">
                        <span class="btn-icon">✓</span>
                    </button>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading smart settlements:', error);
        showToast(`Error loading settlements: ${error.message}`, 'error');
    }
}

/**
 * Mtry {
        const settlementEl = document.getElementById(`settlement-${index}`);
        if (!settlementEl) return;
        
        const settlement = currentSettlements[index];
        if (!settlement) {
            showToast('Settlement not found', 'error');
            return;
        }
        
        // Record settlement in Firebase
        window.modeManager.currentGroupId = currentFund.fundId;
        const settlementInfo = {
            from: settlement.from,
            to: settlement.to,
            amount: settlement.amount,
            method: 'cash',
            notes: `Settled via Smart Settlements on ${new Date().toLocaleDateString()}`
        };
    try {
        const settlements = document.querySelectorAll('.settlement-item');
        
        if (settlements.length === 0) return;
        
        const confirmed = confirm(
            `Record all ${currentSettlements.length} payments?\n\n` +
            'This will register each payment in the group history and update balances.'
        );
        
        if (!confirmed) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        
        // Record all settlements
        for (let i = 0; i < currentSettlements.length; i++) {
            const settlement = currentSettlements[i];
            const settlementInfo = {
                from: settlement.from,
                to: settlement.to,
                amount: settlement.amount,
                method: 'cash',
                notes: `Settled via Smart Settlements on ${new Date().toLocaleDateString()}`
            };
            
            await window.modeManager.recordSettlement(settlementInfo);
            
            // Animate settlement
            const settlementEl = document.getElementById(`settlement-${i}`);
            if (settlementEl) {
                settlementEl.classList.add('settlement-completed');
            }
        }
        
        // Wait for animations
        setTimeout(async () => {
            showToast(`All ${currentSettlements.length} payments recorded successfully! 🎉`, 'success');
            closeSmartSettlements();
            
            // Reload data
            await loadSimpleModeBalances();
            await loadSimpleModeExpenses(); // Refresh history to show settlements
        }, 500);
        
    } catch (error) {
        console.error('Error recording settlements:', error);
        showToast('Error recording payments', 'error');
    });
            await loadSimpleModeBalances();
            await loadSimpleModeExpenses(); // Refresh history to show settlement
        }, 1000);
        
    } catch (error) {
        console.error('Error recording settlement:', error);
        showToast('Error recording payment', 'error');
    }
    }, 300);
    
    showToast('Settlement marked as complete! 🎉', 'success');
}

/**
 * Mark all settlements as complete
 */
async function markAllSettled() {
    try {
        if (currentFund && !currentFund.isActive) {
            showToast("⏸️ El grupo está pausado. No puedes registrar pagos.", "error");
            return;
        }
        
        console.log('🎯 Mark All Settled clicked');
        console.log('📊 Current settlements:', currentSettlements);
        
        const settlements = document.querySelectorAll('.settlement-item');
        console.log('📋 Settlement items in DOM:', settlements.length);
        
        if (settlements.length === 0) {
            console.warn('⚠️ No settlements to mark');
            return;
        }
        
        if (currentSettlements.length === 0) {
            console.warn('⚠️ No settlements data available');
            return;
        }
        
        const confirmed = confirm(
            `Record all ${currentSettlements.length} payments?\n\n` +
            'This will register each payment in the group history and update balances.'
        );
        
        if (!confirmed) {
            console.log('❌ User cancelled');
            return;
        }
        
        console.log('✅ Recording settlements...');
        window.modeManager.currentGroupId = currentFund.fundId;
        
        // Record all settlements
        for (let i = 0; i < currentSettlements.length; i++) {
            const settlement = currentSettlements[i];
            console.log(`📝 Recording settlement ${i + 1}/${currentSettlements.length}:`, settlement);
            
            const settlementInfo = {
                from: settlement.from,
                to: settlement.to,
                amount: settlement.amount,
                method: 'cash',
                notes: `Settled via Smart Settlements on ${new Date().toLocaleDateString()}`
            };
            
            await window.modeManager.recordSettlement(settlementInfo);
            console.log(`✅ Settlement ${i + 1} recorded`);
            
            // Animate settlement
            const settlementEl = document.getElementById(`settlement-${i}`);
            if (settlementEl) {
                settlementEl.classList.add('settlement-completed');
            }
        }
        
        console.log('🎉 All settlements recorded successfully');
        
        // Wait for animations
        setTimeout(async () => {
            showToast(`All ${currentSettlements.length} payments recorded successfully! 🎉`, 'success');
            closeSmartSettlements();
            
            console.log('🔄 Refreshing data...');
            // Reload data
            await loadSimpleModeBalances();
            await loadSimpleModeExpenses(); // Refresh history to show settlements
            console.log('✅ Data refreshed');
        }, 500);
        
    } catch (error) {
        console.error('❌ Error recording settlements:', error);
        console.error('Stack:', error.stack);
        showToast('Error recording payments: ' + error.message, 'error');
    }
}

// ============================================
// EXPENSE TIMELINE FUNCTIONS
// ============================================

/**
 * Toggle timeline visibility
 */
function toggleTimeline() {
    const content = document.getElementById('timelineContent');
    const icon = document.getElementById('timelineToggleIcon');
    const text = document.getElementById('timelineToggleText');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        icon.textContent = '▲';
        text.textContent = 'Hide Timeline';
        loadExpenseTimeline();
    } else {
        content.style.display = 'none';
        icon.textContent = '▼';
        text.textContent = 'Show Timeline';
    }
}

/**
 * Load and render expense timeline
 */
async function loadExpenseTimeline(startDate = null, endDate = null) {
    try {
        const timelineContainer = document.getElementById('expenseTimeline');
        if (!timelineContainer || !currentFund) return;
        
        console.log('📅 Loading expense timeline...');
        
        // Get expenses from Firebase
        const groupData = await window.FirebaseConfig.readDb(`groups/${currentFund.fundAddress}`);
        
        if (!groupData || !groupData.expenses) {
            timelineContainer.innerHTML = `
                <div class="timeline-empty">
                    <div class="timeline-empty-icon">📭</div>
                    <p>No expenses yet</p>
                </div>
            `;
            return;
        }
        
        // Convert expenses object to array and add IDs
        let expenses = Object.entries(groupData.expenses).map(([id, expense]) => ({
            id,
            ...expense
        }));
        
        // Filter by date range if provided
        if (startDate || endDate) {
            expenses = expenses.filter(expense => {
                const expenseDate = new Date(expense.timestamp);
                const start = startDate ? new Date(startDate) : null;
                const end = endDate ? new Date(endDate) : null;
                
                if (start && expenseDate < start) return false;
                if (end) {
                    // Set end date to end of day
                    end.setHours(23, 59, 59, 999);
                    if (expenseDate > end) return false;
                }
                return true;
            });
        }
        
        // Sort by timestamp (newest first)
        expenses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (expenses.length === 0) {
            timelineContainer.innerHTML = `
                <div class="timeline-empty">
                    <div class="timeline-empty-icon">🔍</div>
                    <p>No expenses found in the selected date range</p>
                </div>
            `;
            return;
        }
        
        // Group by date
        const groupedByDate = {};
        expenses.forEach(expense => {
            const date = new Date(expense.timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groupedByDate[date]) {
                groupedByDate[date] = [];
            }
            groupedByDate[date].push(expense);
        });
        
        // Render timeline
        let html = '';
        Object.entries(groupedByDate).forEach(([date, dateExpenses]) => {
            dateExpenses.forEach((expense, index) => {
                const isFirstOfDate = index === 0;
                const currency = expense.currency || 'USD';
                const symbol = getCurrencySymbol(currency);
                const amount = Math.abs(expense.amount || 0);
                const isNegative = (expense.amount || 0) < 0;
                
                // Get payer names
                let paidByText = 'Unknown';
                if (expense.paidBy) {
                    const payers = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
                    const payerNames = payers.map(payerId => {
                        const member = currentFund.members[payerId];
                        return member?.name || member?.email || payerId.substring(0, 8);
                    });
                    paidByText = payerNames.join(', ');
                }
                
                // Get category emoji
                const categoryEmoji = {
                    'food': '🍔',
                    'transport': '🚗',
                    'entertainment': '🎬',
                    'shopping': '🛍️',
                    'bills': '📄',
                    'other': '📦'
                }[expense.category] || '📦';
                
                html += `
                    <div class="timeline-item">
                        <div class="timeline-dot"></div>
                        ${isFirstOfDate ? `<div class="timeline-date">${date}</div>` : ''}
                        <div class="timeline-expense-card">
                            <div class="timeline-expense-header">
                                <div class="timeline-expense-desc">
                                    ${categoryEmoji} ${expense.description || 'No description'}
                                </div>
                                <div class="timeline-expense-amount ${isNegative ? 'negative' : ''}">
                                    ${isNegative ? '+' : '-'}${symbol}${amount.toFixed(2)}
                                </div>
                            </div>
                            <div class="timeline-expense-meta">
                                <span>👤 ${paidByText}</span>
                                <span>💱 ${currency}</span>
                                <span>🕐 ${new Date(expense.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        });
        
        timelineContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading timeline:', error);
        document.getElementById('expenseTimeline').innerHTML = `
            <div class="timeline-empty">
                <div class="timeline-empty-icon">⚠️</div>
                <p>Error loading timeline: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * Filter timeline by selected date range
 */
function filterTimelineByDate() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    loadExpenseTimeline(startDate, endDate);
}

/**
 * Reset date filter
 */
function resetDateFilter() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    loadExpenseTimeline();
}

/**
 * Load Simple Mode members list
 */
function loadSimpleModeMembers() {
    const membersList = document.getElementById('membersList');
    const noMembers = document.getElementById('noMembers');
    
    if (!currentFund || !currentFund.members) {
        if (membersList) membersList.innerHTML = '';
        if (noMembers) noMembers.style.display = 'flex';
        return;
    }

    const members = Object.entries(currentFund.members);
    
    if (members.length === 0) {
        if (membersList) membersList.innerHTML = '';
        if (noMembers) noMembers.style.display = 'flex';
        return;
    }

    if (noMembers) noMembers.style.display = 'none';

    const currentUserId = firebase.auth().currentUser?.uid;
    const isAdmin = currentFund.creator === currentUserId;

    membersList.innerHTML = members.map(([uid, member]) => {
        const joinDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : 'N/A';
        const isCurrentUser = uid === currentUserId;
        const isCreator = uid === currentFund.creator;

        let actionsHtml = '';
        if (!isCurrentUser && !isCreator) {
            if (isAdmin) {
                // Admin can remove directly
                actionsHtml = `
                    <button class="btn btn-danger btn-sm" onclick="removeMemberWithValidation('${uid}')">
                        <span>🚫 Remove</span>
                    </button>
                `;
            } else {
                // Regular members can only request removal
                actionsHtml = `
                    <button class="btn btn-warning btn-sm" onclick="requestMemberRemoval('${uid}')">
                        <span>⚠️ Request Removal</span>
                    </button>
                `;
            }
        }

        return `
            <div class="member-card">
                <div class="member-info">
                    <div class="member-avatar">
                        ${(member.name || member.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div class="member-details">
                        <h4>${member.name || member.email || uid}</h4>
                        <p class="member-email">${member.email || ''}</p>
                        <p class="member-meta">
                            ${isCreator ? '👑 Creator' : ''}
                            ${isCurrentUser && !isCreator ? '(You)' : ''}
                            • Joined ${joinDate}
                        </p>
                    </div>
                </div>
                ${actionsHtml ? `<div class="member-actions">${actionsHtml}</div>` : ''}
            </div>
        `;
    }).join('');
    
    // Load removal requests if user is admin
    if (isAdmin) {
        loadRemovalRequests();
    }
}

/**
 * Check if a member has pending balance
 */
async function checkMemberBalance(memberId) {
    try {
        const groupId = currentFund.fundId || currentFund.fundAddress;
        
        // Calculate balances
        const balances = {};
        
        // Initialize all members
        const members = Object.keys(currentFund.members);
        members.forEach(mid => {
            balances[mid] = 0;
        });
        
        // Get expenses
        const expensesData = await window.FirebaseConfig.readDb(`groups/${groupId}/expenses`);
        
        if (expensesData) {
            const expenses = Object.values(expensesData);
            
            // Process each expense
            for (const expense of expenses) {
                const paidBy = expense.paidBy;
                let amount = Number(expense.amount);
                
                // Convert to USD if needed
                const currency = expense.currency || 'USD';
                if (currency !== 'USD' && window.convertToUSD) {
                    amount = await window.convertToUSD(amount, currency);
                }
                
                const splitBetween = expense.splitBetween || [paidBy];
                const perPerson = Math.round((amount / splitBetween.length) * 100) / 100;
                
                const paidByArray = Array.isArray(paidBy) ? paidBy : [paidBy];
                const amountPerPayer = Math.round((amount / paidByArray.length) * 100) / 100;
                
                paidByArray.forEach(payerId => {
                    balances[payerId] = Math.round((balances[payerId] + amountPerPayer) * 100) / 100;
                });
                
                splitBetween.forEach(mid => {
                    balances[mid] = Math.round((balances[mid] - perPerson) * 100) / 100;
                });
            }
        }
        
        // Subtract settlements
        const settlementsData = await window.FirebaseConfig.readDb(`groups/${groupId}/settlements`);
        
        if (settlementsData) {
            for (const settlement of Object.values(settlementsData)) {
                const amount = Number(settlement.amount);
                balances[settlement.from] = Math.round((balances[settlement.from] + amount) * 100) / 100;
                balances[settlement.to] = Math.round((balances[settlement.to] - amount) * 100) / 100;
            }
        }
        
        const memberBalance = balances[memberId] || 0;
        return {
            hasBalance: Math.abs(memberBalance) > 0.01,
            balance: memberBalance
        };
        
    } catch (error) {
        console.error('Error checking member balance:', error);
        return { hasBalance: false, balance: 0 };
    }
}

/**
 * Remove a member from Simple Mode group with validation
 */
async function removeMemberWithValidation(memberId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in', 'error');
            return;
        }

        // Check if current user is admin
        if (currentFund.creator !== user.uid) {
            showToast('Only the group creator can remove members', 'error');
            return;
        }

        const member = currentFund.members[memberId];
        const memberName = member?.name || member?.email || memberId;

        // Check if member has pending balance
        showToast('Checking member balance...', 'info');
        const balanceCheck = await checkMemberBalance(memberId);
        
        if (balanceCheck.hasBalance) {
            const balanceText = balanceCheck.balance > 0 
                ? `is owed $${balanceCheck.balance.toFixed(2)}` 
                : `owes $${Math.abs(balanceCheck.balance).toFixed(2)}`;
            
            showToast(
                `Cannot remove ${memberName}: Member ${balanceText}. Settle all balances first.`,
                'error',
                5000
            );
            return;
        }

        const confirmed = confirm(
            `Remove ${memberName} from the group?\n\n` +
            `✅ Member has no pending balances\n\n` +
            `This will:\n` +
            `- Remove them from the group permanently\n` +
            `- They won't be able to access this group\n` +
            `- Past expenses they were part of will remain unchanged\n` +
            `- They will be notified of their removal`
        );

        if (!confirmed) return;

        const groupId = currentFund.fundId || currentFund.fundAddress;
        const groupName = currentFund.fundName;

        // Remove member from Firebase
        await window.FirebaseConfig.deleteDb(
            `groups/${groupId}/members/${memberId}`
        );

        // Notify the removed member
        if (typeof createNotification === 'function') {
            await createNotification(memberId, {
                type: 'member_removed',
                title: 'Removed from Group',
                message: `You have been removed from "${groupName}" by the group creator`,
                fundId: groupId,
                timestamp: Date.now(),
                read: false
            });
        }

        // Notify other group members
        if (typeof notifyGroupMembers === 'function') {
            await notifyGroupMembers(
                groupId,
                'member_removed',
                `${memberName} was removed from the group by ${user.displayName || user.email}`,
                { groupName }
            );
        }

        showToast(`${memberName} removed from group`, 'success');

        // Update local data
        delete currentFund.members[memberId];

        // Reload members list
        loadSimpleModeMembers();

    } catch (error) {
        console.error('Error removing member:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

/**
 * Request member removal (for non-admin members)
 */
async function requestMemberRemoval(targetMemberId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in', 'error');
            return;
        }

        const targetMember = currentFund.members[targetMemberId];
        const targetMemberName = targetMember?.name || targetMember?.email || targetMemberId;
        const groupId = currentFund.fundId || currentFund.fundAddress;
        const groupName = currentFund.fundName;

        const confirmed = confirm(
            `Request removal of ${targetMemberName}?\n\n` +
            `The group creator will review your request and decide whether to remove this member.`
        );

        if (!confirmed) return;

        // Create removal request
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const requestData = {
            requestedBy: user.uid,
            requestedByName: user.displayName || user.email,
            targetMember: targetMemberId,
            targetMemberName: targetMemberName,
            groupId: groupId,
            groupName: groupName,
            timestamp: Date.now(),
            status: 'pending'
        };

        await window.FirebaseConfig.writeDb(
            `groups/${groupId}/removalRequests/${requestId}`,
            requestData
        );

        // Notify the group creator
        if (typeof createNotification === 'function') {
            await createNotification(currentFund.creator, {
                type: 'removal_requested',
                title: 'Member Removal Request',
                message: `${user.displayName || user.email} requested to remove ${targetMemberName} from "${groupName}"`,
                fundId: groupId,
                requestId: requestId,
                timestamp: Date.now(),
                read: false
            });
        }

        showToast('Removal request sent to group creator', 'success');

    } catch (error) {
        console.error('Error requesting member removal:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

/**
 * Legacy function - redirects to new function
 */
async function removeMember(memberId) {
    await removeMemberWithValidation(memberId);
}

/**
 * Load removal requests for group creator
 */
async function loadRemovalRequests() {
    try {
        const user = firebase.auth().currentUser;
        if (!user || currentFund.creator !== user.uid) {
            return;
        }

        const groupId = currentFund.fundId || currentFund.fundAddress;
        const requestsData = await window.FirebaseConfig.readDb(`groups/${groupId}/removalRequests`);
        
        const requestsSection = document.getElementById('removalRequestsSection');
        const requestsList = document.getElementById('removalRequestsList');
        
        if (!requestsData) {
            if (requestsSection) requestsSection.style.display = 'none';
            return;
        }

        const pendingRequests = Object.entries(requestsData)
            .filter(([_, req]) => req.status === 'pending')
            .map(([id, req]) => ({ id, ...req }));

        if (pendingRequests.length === 0) {
            if (requestsSection) requestsSection.style.display = 'none';
            return;
        }

        if (requestsSection) requestsSection.style.display = 'block';
        if (requestsList) {
            requestsList.innerHTML = pendingRequests.map(req => {
                const timeAgo = getTimeAgo(req.timestamp);
                return `
                    <div class="removal-request-card" style="background: rgba(255, 193, 7, 0.1); border: 1px solid var(--warning); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
                        <div class="request-info">
                            <p class="request-message" style="margin-bottom: 0.25rem;">
                                <strong>${req.requestedByName}</strong> requested to remove 
                                <strong>${req.targetMemberName}</strong>
                            </p>
                            <p class="request-time" style="font-size: 0.75rem; color: var(--text-muted);">${timeAgo}</p>
                        </div>
                        <div class="request-actions" style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                            <button class="btn btn-success btn-sm" onclick="approveRemovalRequest('${req.id}')" style="padding: 0.4rem 0.75rem; font-size: 0.85rem;">
                                ✅ Approve
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="rejectRemovalRequest('${req.id}')" style="padding: 0.4rem 0.75rem; font-size: 0.85rem;">
                                ❌ Reject
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

    } catch (error) {
        console.error('Error loading removal requests:', error);
    }
}

/**
 * Approve a member removal request
 */
async function approveRemovalRequest(requestId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const groupId = currentFund.fundId || currentFund.fundAddress;
        const request = await window.FirebaseConfig.readDb(`groups/${groupId}/removalRequests/${requestId}`);
        
        if (!request) {
            showToast('Request not found', 'error');
            return;
        }

        // Check if target member still has balance
        const balanceCheck = await checkMemberBalance(request.targetMember);
        
        if (balanceCheck.hasBalance) {
            const balanceText = balanceCheck.balance > 0 
                ? `is owed $${balanceCheck.balance.toFixed(2)}` 
                : `owes $${Math.abs(balanceCheck.balance).toFixed(2)}`;
            
            showToast(
                `Cannot remove ${request.targetMemberName}: Member ${balanceText}. Settle all balances first.`,
                'error',
                5000
            );
            return;
        }

        const confirmed = confirm(
            `Approve removal of ${request.targetMemberName}?\n\n` +
            `✅ Member has no pending balances\n\n` +
            `This will remove them from the group permanently.`
        );

        if (!confirmed) return;

        // Remove member
        await window.FirebaseConfig.deleteDb(
            `groups/${groupId}/members/${request.targetMember}`
        );

        // Update request status
        await window.FirebaseConfig.updateDb(
            `groups/${groupId}/removalRequests/${requestId}`,
            { status: 'approved' }
        );

        // Notify the removed member
        if (typeof createNotification === 'function') {
            await createNotification(request.targetMember, {
                type: 'member_removed',
                title: 'Removed from Group',
                message: `You have been removed from "${request.groupName}" (request by ${request.requestedByName})`,
                fundId: groupId,
                timestamp: Date.now(),
                read: false
            });
        }

        // Notify the requester
        if (typeof createNotification === 'function') {
            await createNotification(request.requestedBy, {
                type: 'removal_requested',
                title: 'Removal Request Approved',
                message: `Your request to remove ${request.targetMemberName} from "${request.groupName}" was approved`,
                fundId: groupId,
                timestamp: Date.now(),
                read: false
            });
        }

        // Notify other members
        if (typeof notifyGroupMembers === 'function') {
            await notifyGroupMembers(
                groupId,
                'member_removed',
                `${request.targetMemberName} was removed from the group`,
                { groupName: request.groupName }
            );
        }

        showToast(`${request.targetMemberName} removed from group`, 'success');

        // Update local data
        delete currentFund.members[request.targetMember];

        // Reload
        loadSimpleModeMembers();

    } catch (error) {
        console.error('Error approving removal request:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

/**
 * Reject a member removal request
 */
async function rejectRemovalRequest(requestId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const groupId = currentFund.fundId || currentFund.fundAddress;
        const request = await window.FirebaseConfig.readDb(`groups/${groupId}/removalRequests/${requestId}`);
        
        if (!request) {
            showToast('Request not found', 'error');
            return;
        }

        const confirmed = confirm(`Reject removal request for ${request.targetMemberName}?`);
        if (!confirmed) return;

        // Update request status
        await window.FirebaseConfig.updateDb(
            `groups/${groupId}/removalRequests/${requestId}`,
            { status: 'rejected' }
        );

        // Notify the requester
        if (typeof createNotification === 'function') {
            await createNotification(request.requestedBy, {
                type: 'removal_requested',
                title: 'Removal Request Rejected',
                message: `Your request to remove ${request.targetMemberName} from "${request.groupName}" was rejected by the group creator`,
                fundId: groupId,
                timestamp: Date.now(),
                read: false
            });
        }

        showToast('Request rejected', 'success');

        // Reload
        loadRemovalRequests();

    } catch (error) {
        console.error('Error rejecting removal request:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// ============================================
// EXPENSE SOCIAL INTERACTIONS
// ============================================

/**
 * Toggle like on an expense
 */
async function toggleLikeExpense(expenseId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Sign in to like expenses', 'info');
            return;
        }

        const groupId = currentFund.fundId || currentFund.fundAddress;
        const likePath = `groups/${groupId}/expenses/${expenseId}/likes/${user.uid}`;
        const currentLike = await window.FirebaseConfig.readDb(likePath);

        if (currentLike) {
            // Remove like
            await window.FirebaseConfig.updateDb(likePath, null);
        } else {
            // Add like
            await window.FirebaseConfig.updateDb(likePath, {
                userId: user.uid,
                userName: user.displayName || user.email,
                timestamp: Date.now()
            });
        }

        // Reload expenses to show updated likes
        await loadSimpleModeExpenses();

    } catch (error) {
        console.error('Error toggling like:', error);
        showToast('Error updating like', 'error');
    }
}

/**
 * Show comments modal for an expense
 */
async function showExpenseComments(expenseId) {
    try {
        console.log('💬 Opening comments for expense:', expenseId);
        console.log('📂 Current fund:', currentFund);
        
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Sign in to view comments', 'info');
            return;
        }

        // Get expense data - use fundId instead of fundAddress for Simple Mode
        const groupId = currentFund.fundId || currentFund.fundAddress;
        const expensePath = `groups/${groupId}/expenses/${expenseId}`;
        console.log('📍 Reading expense from:', expensePath);
        
        const expense = await window.FirebaseConfig.readDb(expensePath);
        
        if (!expense) {
            console.error('❌ Expense not found at path:', expensePath);
            showToast('Expense not found', 'error');
            return;
        }

        console.log('✅ Expense loaded:', expense);

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.display = 'flex';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>💬 Comments: ${expense.description}</h3>
                    <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="commentsList" class="comments-list" style="max-height: 400px; overflow-y: auto; margin-bottom: 1rem;">
                        ${await renderComments(expense.comments || {})}
                    </div>
                    <div class="comment-form">
                        <textarea 
                            id="newCommentText" 
                            placeholder="Add a comment..." 
                            rows="3" 
                            class="input-modern"
                            style="resize: vertical; margin-bottom: 0.5rem;"
                        ></textarea>
                        <button 
                            class="btn btn-primary" 
                            onclick="addComment('${expenseId}')"
                            style="width: 100%;"
                        >
                            <span class="btn-icon">💬</span>
                            <span>Post Comment</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        console.log('✅ Comments modal opened');

    } catch (error) {
        console.error('❌ Error showing comments:', error);
        console.error('Stack:', error.stack);
        showToast('Error loading comments: ' + error.message, 'error');
    }
}

/**
 * Render comments HTML
 */
async function renderComments(comments) {
    if (!comments || Object.keys(comments).length === 0) {
        return '<div class="empty-state"><p>No comments yet. Be the first to comment!</p></div>';
    }

    const commentEntries = Object.entries(comments);
    commentEntries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    return commentEntries.map(([commentId, comment]) => {
        const date = new Date(comment.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">👤 ${comment.userName}</span>
                    <span class="comment-date">${date}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `;
    }).join('');
}

/**
 * Add a comment to an expense
 */
async function addComment(expenseId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Sign in to comment', 'info');
            return;
        }

        const commentText = document.getElementById('newCommentText').value.trim();
        if (!commentText) {
            showToast('Please enter a comment', 'warning');
            return;
        }

        const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const groupId = currentFund.fundId || currentFund.fundAddress;
        const commentPath = `groups/${groupId}/expenses/${expenseId}/comments/${commentId}`;

        await window.FirebaseConfig.updateDb(commentPath, {
            userId: user.uid,
            userName: user.displayName || user.email,
            text: commentText,
            timestamp: Date.now()
        });

        // Clear input
        document.getElementById('newCommentText').value = '';

        // Reload comments
        const expense = await window.FirebaseConfig.readDb(`groups/${groupId}/expenses/${expenseId}`);
        document.getElementById('commentsList').innerHTML = await renderComments(expense.comments || {});

        // Reload expenses list to update comment count
        await loadSimpleModeExpenses();

        showToast('Comment added', 'success');

    } catch (error) {
        console.error('Error adding comment:', error);
        showToast('Error posting comment', 'error');
    }
}

/**
 * Request deletion of an expense
 */
async function requestDeleteExpense(expenseId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Sign in to request deletion', 'info');
            return;
        }

        const confirmed = confirm(
            'Request deletion of this expense?\n\n' +
            'The expense creator will be notified and can decide to delete it.'
        );

        if (!confirmed) return;

        const groupId = currentFund.fundId || currentFund.fundAddress;
        const requestPath = `groups/${groupId}/expenses/${expenseId}/deleteRequests/${user.uid}`;

        // Get expense details to notify creator
        const expensePath = `groups/${groupId}/expenses/${expenseId}`;
        const expense = await window.FirebaseConfig.readDb(expensePath);

        await window.FirebaseConfig.updateDb(requestPath, {
            userId: user.uid,
            userName: user.displayName || user.email,
            reason: 'User requested deletion',
            timestamp: Date.now()
        });

        // 🔔 NOTIFICATION: Notify expense creator(s) about deletion request
        if (expense) {
            console.log('📧 Preparing deletion request notification');
            const paidByArray = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
            console.log('👥 Expense paid by:', paidByArray);
            
            const notificationData = {
                type: 'expense_delete_requested',
                title: 'Delete Request',
                message: `${user.displayName || user.email} requested to delete: ${expense.description} - ${expense.currency || '$'}${expense.amount}`,
                fundId: groupId,
                expenseId: expenseId
            };
            
            console.log('📬 Notification data:', notificationData);
            console.log('🔍 createNotification function available:', typeof createNotification === 'function');
            
            // Notify each payer who can delete the expense
            if (typeof createNotification === 'function') {
                let notificationsSent = 0;
                for (const payerId of paidByArray) {
                    if (payerId !== user.uid) { // Don't notify the requester
                        console.log('📨 Sending notification to:', payerId);
                        await createNotification(payerId, notificationData);
                        notificationsSent++;
                    } else {
                        console.log('⏭️ Skipping requester:', payerId);
                    }
                }
                console.log(`✅ Sent ${notificationsSent} deletion request notifications`);
            } else {
                console.error('❌ createNotification function not available');
            }
        } else {
            console.warn('⚠️ Expense not found, cannot send notification');
        }

        showToast('Deletion request sent', 'success');
        await loadSimpleModeExpenses();

    } catch (error) {
        console.error('Error requesting deletion:', error);
        showToast('Error sending request', 'error');
    }
}

/**
 * Show delete requests for an expense
 */
async function showDeleteRequests(expenseId) {
    try {
        const groupId = currentFund.fundId || currentFund.fundAddress;
        const expensePath = `groups/${groupId}/expenses/${expenseId}`;
        const expense = await window.FirebaseConfig.readDb(expensePath);
        
        if (!expense || !expense.deleteRequests) {
            showToast('No deletion requests found', 'info');
            return;
        }

        const requests = Object.values(expense.deleteRequests);
        const requestList = requests.map(req => {
            const date = new Date(req.timestamp).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            return `<li>👤 ${req.userName} - ${date}</li>`;
        }).join('');

        const confirmed = confirm(
            `${requests.length} member(s) requested deletion:\n\n` +
            requests.map(r => `• ${r.userName}`).join('\n') +
            '\n\nDo you want to delete this expense?'
        );

        if (confirmed) {
            await deleteExpense(expenseId);
        }

    } catch (error) {
        console.error('Error showing delete requests:', error);
        showToast('Error loading requests', 'error');
    }
}

/**
 * Delete an expense (only creator can do this)
 */
async function deleteExpense(expenseId) {
    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Sign in to delete expenses', 'info');
            return;
        }

        // Get expense to verify creator
        const groupId = currentFund.fundId || currentFund.fundAddress;
        const expensePath = `groups/${groupId}/expenses/${expenseId}`;
        const expense = await window.FirebaseConfig.readDb(expensePath);

        if (!expense) {
            showToast('Expense not found', 'error');
            return;
        }

        // Check if user is one of the payers
        const paidByArray = Array.isArray(expense.paidBy) ? expense.paidBy : [expense.paidBy];
        if (!paidByArray.includes(user.uid)) {
            showToast('Only those who paid can delete this expense', 'error');
            return;
        }

        const confirmed = confirm(
            `Delete expense: ${expense.description}?\n\n` +
            `Amount: $${expense.amount}\n` +
            `This action cannot be undone.`
        );

        if (!confirmed) return;

        // Delete expense
        await window.FirebaseConfig.deleteDb(expensePath);

        showToast('Expense deleted', 'success');
        
        // 🔔 NOTIFICATION: Notify all group members about deleted expense
        try {
            const message = `${user.displayName || user.email} deleted: ${expense.description} - ${expense.currency || '$'}${expense.amount}`;
            
            if (typeof notifyGroupMembers === 'function') {
                await notifyGroupMembers(groupId, 'expense_deleted', message, { groupName: currentFund?.fundName });
            }
        } catch (notifError) {
            console.error('Error sending delete notification:', notifError);
        }
        
        await loadSimpleModeExpenses();
        await loadSimpleModeBalances(); // Update balances
        
        // Refresh group info to update total balance
        await loadSimpleModeDetailView();

    } catch (error) {
        console.error('Error deleting expense:', error);
        showToast('Error deleting expense', 'error');
    }
}

/**
 * Load Simple Mode invite UI
 */
function loadSimpleModeInviteUI() {
    const inviteTabContent = document.getElementById('inviteTab');
    if (!inviteTabContent) return;

    // Generate shareable link
    const groupId = currentFund.fundId;
    const inviteLink = `${window.location.origin}${window.location.pathname}?join=${groupId}`;

    inviteTabContent.innerHTML = `
        <div class="tab-card">
            <h3>👥 Invite Members</h3>
            <p>Share this group with friends! No wallet needed for Simple Mode.</p>
            
            <div class="invite-method-card">
                <h4>📎 Share Link</h4>
                <p>Copy this link and send it via WhatsApp, email, or any messenger:</p>
                <div class="invite-link-container">
                    <input type="text" id="inviteLinkInput" class="input-modern" value="${inviteLink}" readonly>
                    <button class="btn btn-primary" onclick="copyInviteLink()">
                        <span class="btn-icon">📋</span>
                        <span>Copy</span>
                    </button>
                </div>
            </div>

            <div class="invite-method-card">
                <h4>✉️ Send Email Invitation</h4>
                <p>Send an email invitation directly:</p>
                <div class="form-group">
                    <input type="email" id="inviteEmail" class="input-modern" placeholder="friend@example.com">
                </div>
                <button class="btn btn-secondary" onclick="sendEmailInvite()">
                    <span class="btn-icon">📧</span>
                    <span>Send Invitation</span>
                </button>
            </div>

            <div class="info-box">
                <p><strong>ℹ️ How it works:</strong></p>
                <ul>
                    <li>Friends click the link or accept the email invite</li>
                    <li>They sign in with Google or create an account</li>
                    <li>They're automatically added to the group</li>
                    <li>No cryptocurrency wallet needed!</li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * Copy invite link to clipboard
 */
function copyInviteLink() {
    const input = document.getElementById('inviteLinkInput');
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999); // For mobile
    
    try {
        document.execCommand('copy');
        showToast('Link copied to clipboard! 📋', 'success');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(input.value).then(() => {
            showToast('Link copied to clipboard! 📋', 'success');
        }).catch(() => {
            showToast('Failed to copy link', 'error');
        });
    }
}

/**
 * Handle joining a group via invite link
 */
async function handleGroupJoin(groupId) {
    try {
        console.log(`🔗 handleGroupJoin called for group: ${groupId}`);
        
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('Please sign in first', 'error');
            return;
        }

        console.log(`👤 Current user: ${user.email} (UID: ${user.uid})`);

        // Check if group exists
        const groupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
        
        if (!groupData) {
            showToast('Group not found or invite link is invalid', 'error');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        const groupName = groupData.name || groupData.fundName || 'the group';
        console.log(`📋 Group found: "${groupName}"`);
        console.log(`👥 Group members:`, groupData.members ? Object.keys(groupData.members) : 'none');
        console.log(`🔍 Checking if ${user.uid} is a member...`);
        
        // Check if already a member
        if (groupData.members && groupData.members[user.uid]) {
            console.log(`✅ User IS already a member of "${groupName}"`);
            try {
                showLoading(`Opening "${groupName}"...`);
                
                // IMPORTANT: Ensure user's groups list has this group (repair if missing)
                const userGroupRef = await window.FirebaseConfig.readDb(`users/${user.uid}/groups/${groupId}`);
                if (!userGroupRef) {
                    console.log(`⚠️ Repairing missing user group reference for ${groupId}`);
                    await window.FirebaseConfig.updateDb(`users/${user.uid}/groups/${groupId}`, {
                        role: groupData.createdBy === user.email || groupData.creator === user.uid ? 'creator' : 'member',
                        joinedAt: Date.now()
                    });
                }
                
                // Clean up URL and open group
                window.history.replaceState({}, document.title, window.location.pathname);
                sessionStorage.removeItem('pendingGroupJoin');
                
                // Load the group completely
                currentFund = {
                    fundId: groupId,
                    fundAddress: groupId,
                    fundName: groupName,
                    fundType: groupData.fundType || 0,
                    isSimpleMode: true,
                    members: groupData.members,
                    creator: groupData.createdBy || groupData.creator,
                    name: groupName,
                    ...groupData
                };
                
                // Hide dashboard, show detail
                document.getElementById('dashboardSection').classList.remove('active');
                document.getElementById('fundDetailSection').classList.add('active');
                
                // Hide FAB first (will be shown by loadSimpleModeDetailView)
                const fabBtn = document.getElementById('addExpenseBtn');
                if (fabBtn) fabBtn.style.display = 'none';
                
                await loadSimpleModeDetailView();
                
                hideLoading();
                showToast(`✅ Welcome back to "${groupName}"!`, 'success');
                
                // Reload dashboard in background to show the group in list
                setTimeout(() => loadAllFundsDetails(), 500);
                
                return;
            } catch (error) {
                hideLoading();
                console.error('Error opening group:', error);
                showToast(`Error opening group: ${error.message}`, 'error');
                return;
            }
        }

        console.log(`❌ User is NOT a member yet. Adding to group...`);

        // Add user to group members
        console.log(`📝 Writing to groups/${groupId}/members/${user.uid}`);
        await window.FirebaseConfig.updateDb(`groups/${groupId}/members/${user.uid}`, {
            email: user.email,
            name: user.displayName || user.email,
            joinedAt: Date.now(),
            status: 'active'
        });
        console.log(`✅ User added to group members`);

        // Add group to user's groups list (CRITICAL for loadUserFunds to work)
        console.log(`📝 Writing to users/${user.uid}/groups/${groupId}`);
        await window.FirebaseConfig.updateDb(`users/${user.uid}/groups/${groupId}`, {
            role: 'member',
            joinedAt: Date.now()
        });
        console.log(`✅ User's group list updated`);
        
        // 🔔 NOTIFICATION: Notify all existing members that someone joined
        try {
            const userName = user.displayName || user.email;
            const message = `${userName} has joined ${groupName}`;
            
            if (typeof notifyGroupMembers === 'function') {
                await notifyGroupMembers(groupId, 'member_joined', message, { groupName });
            }
        } catch (notifError) {
            console.error('Error sending join notification:', notifError);
        }

        showToast(`✅ Successfully joined "${groupName}"!`, 'success');
        
        // Clean up URL and session
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('pendingGroupJoin');

        // Show loading
        showLoading(`Opening "${groupName}"...`);

        try {
            // Reload dashboard to get updated groups list
            await loadAllFundsDetails();
            
            // Re-read group data now that user is a member
            const updatedGroupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
            
            if (!updatedGroupData) {
                throw new Error('Could not load group data after joining');
            }
            
            // Now open the newly joined group with fresh data
            currentFund = {
                fundId: groupId,
                fundAddress: groupId,
                fundName: updatedGroupData.name || groupName,
                fundType: updatedGroupData.fundType || 3,
                isSimpleMode: true,
                members: updatedGroupData.members,
                creator: updatedGroupData.createdBy || updatedGroupData.creator,
                name: updatedGroupData.name || groupName,
                description: updatedGroupData.description,
                targetAmount: updatedGroupData.targetAmount,
                currency: updatedGroupData.currency || 'USD',
                ...updatedGroupData
            };
            
            console.log('📖 Opening group after join:', currentFund);
            
            // Hide dashboard, show detail
            document.getElementById('dashboardSection').classList.remove('active');
            document.getElementById('fundDetailSection').classList.add('active');
            
            // Hide FAB first (will be shown by loadSimpleModeDetailView)
            const fabBtn = document.getElementById('addExpenseBtn');
            if (fabBtn) fabBtn.style.display = 'none';
            
            await loadSimpleModeDetailView();
            
            hideLoading();
        } catch (error) {
            hideLoading();
            console.error('Error opening group after join:', error);
            showToast(`Error opening group: ${error.message}`, 'error');
            // Fallback: show dashboard
            await showDashboard();
        }

    } catch (error) {
        console.error('Error joining group:', error);
        showToast(`Error joining group: ${error.message}`, 'error');
    }
}

/**
 * Send email invitation
 */
async function sendEmailInvite() {
    const emailInput = document.getElementById('inviteEmail');
    if (!emailInput) return;

    const email = emailInput.value.trim();
    
    if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    try {
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in to send invites', 'error');
            return;
        }

        // Generate invite link
        const groupId = currentFund.fundId;
        const inviteLink = `${window.location.origin}${window.location.pathname}?join=${groupId}`;

        // TODO: Implement actual email sending via Firebase Functions or backend
        // For now, we'll just show a mailto link
        const subject = encodeURIComponent(`Join "${currentFund.fundName}" on Ant Pool`);
        const body = encodeURIComponent(
            `Hi!\n\n` +
            `${user.displayName || user.email} invited you to join the group "${currentFund.fundName}" on Ant Pool.\n\n` +
            `Click here to join: ${inviteLink}\n\n` +
            `Ant Pool makes it easy to track shared expenses with friends. No wallet needed!\n\n` +
            `See you there!`
        );

        const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;

        showToast('Opening email client... 📧', 'success');
        emailInput.value = '';

    } catch (error) {
        console.error('Error sending invite:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

/**
 * Show record payment modal
 */
function showRecordPaymentModal(toUserId, amount) {
    const modal = document.getElementById('recordPaymentModal');
    const form = document.getElementById('recordPaymentForm');
    if (!modal || !form) return;

    // Get member info
    const toMember = currentFund.members[toUserId];
    const toName = toMember?.name || toMember?.email || toUserId;

    // Set form values
    document.getElementById('paymentAmount').value = amount.toFixed(2);
    document.getElementById('paymentTo').value = toName;
    document.getElementById('paymentToId').value = toUserId;
    
    // Set default date to today
    const dateInput = document.getElementById('paymentDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Show modal
    modal.style.display = 'flex';
}

/**
 * Close record payment modal
 */
function closeRecordPaymentModal() {
    const modal = document.getElementById('recordPaymentModal');
    const form = document.getElementById('recordPaymentForm');
    
    if (form) form.reset();
    if (modal) modal.style.display = 'none';
}

/**
 * Handle payment submission
 */
async function handlePaymentSubmission(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    try {
        const amount = parseFloat(formData.get('amount'));
        const toUserId = formData.get('toUserId');
        const date = formData.get('date');
        const notes = formData.get('notes') || '';

        // Validate
        if (!amount || amount <= 0 || !toUserId) {
            showToast('Invalid payment information', 'error');
            return;
        }

        // Get current user
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in to record payments', 'error');
            return;
        }

        // Create settlement record
        const settlementInfo = {
            from: user.uid,
            to: toUserId,
            amount,
            method: 'cash', // Default to cash
            notes: notes || `Payment on ${date}`
        };

        // Set current group ID for mode manager
        window.modeManager.currentGroupId = currentFund.fundId;

        // Record settlement via mode manager
        await window.modeManager.recordSettlement(settlementInfo);

        showToast('Payment recorded successfully! ✅', 'success');
        closeRecordPaymentModal();

        // Refresh balances
        await loadSimpleModeBalances();

    } catch (error) {
        console.error('Error recording payment:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

// ============================================
// SIMPLE MODE - ADD EXPENSE
// ============================================

// Toggle FAB menu
function toggleFabMenu() {
    const fabContainer = document.getElementById('addExpenseBtn');
    const fabMenu = document.getElementById('fabMenu');
    
    if (!fabContainer || !fabMenu) return;
    
    const isActive = fabContainer.classList.toggle('active');
    
    if (isActive) {
        fabMenu.style.display = 'flex';
    } else {
        fabMenu.style.display = 'none';
    }
}

// Close FAB menu when clicking outside
document.addEventListener('click', function(event) {
    const fabContainer = document.getElementById('addExpenseBtn');
    const fabMenu = document.getElementById('fabMenu');
    
    if (!fabContainer || !fabMenu) return;
    
    if (!fabContainer.contains(event.target) && fabContainer.classList.contains('active')) {
        fabContainer.classList.remove('active');
        fabMenu.style.display = 'none';
    }
});

function showAddExpenseModal() {
    console.log('🔵 showAddExpenseModal called');
    
    // Check if group is paused
    if (currentFund && !currentFund.isActive) {
        showToast("⏸️ El grupo está pausado. No puedes agregar gastos.", "error");
        return;
    }
    
    // Close FAB menu if open
    const fabContainer = document.getElementById('addExpenseBtn');
    const fabMenu = document.getElementById('fabMenu');
    if (fabContainer && fabMenu) {
        fabContainer.classList.remove('active');
        fabMenu.style.display = 'none';
    }
    
    const modal = document.getElementById('addExpenseModal');
    if (!modal) {
        console.error('❌ Modal not found');
        return;
    }

    console.log('📦 Current fund:', currentFund);
    console.log('👥 Current fund members:', currentFund ? currentFund.members : 'NO FUND');

    // Populate members
    populateExpenseMembers();

    // Set default date to today
    const dateInput = document.querySelector('#addExpenseForm input[type="date"]');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Show modal
    modal.style.display = 'flex';
    console.log('✅ Modal displayed');
}

function showAddRecurringExpenseModal() {
    // Close FAB menu
    const fabContainer = document.getElementById('addExpenseBtn');
    const fabMenu = document.getElementById('fabMenu');
    if (fabContainer && fabMenu) {
        fabContainer.classList.remove('active');
        fabMenu.style.display = 'none';
    }
    
    showToast('Recurring expenses feature coming soon!', 'info');
}

function closeAddExpenseModal() {
    const modal = document.getElementById('addExpenseModal');
    const form = document.getElementById('addExpenseForm');
    
    if (form) form.reset();
    if (modal) modal.style.display = 'none';
}

function populateExpenseMembers() {
    if (!currentFund || !currentFund.members) return;

    const paidByContainer = document.getElementById('expensePaidBy');
    const splitContainer = document.getElementById('expenseSplitBetween');

    console.log('📋 Populating expense members:', Object.keys(currentFund.members).length, 'members');

    if (!paidByContainer) {
        console.error('❌ Paid by container not found');
        return;
    }
    if (!splitContainer) {
        console.error('❌ Split container not found');
        return;
    }

    // Clear existing options
    paidByContainer.innerHTML = '';
    splitContainer.innerHTML = '';

    // Add members to both sections with checkboxes
    let memberIndex = 0;
    Object.entries(currentFund.members).forEach(([uid, member]) => {
        // Add to "Paid by" checkboxes
        const paidByDiv = document.createElement('div');
        paidByDiv.className = 'checkbox-option';
        paidByDiv.innerHTML = `
            <input type="checkbox" name="paidBy" value="${uid}" id="paidby_${uid}">
            <label for="paidby_${uid}">
                <span class="member-avatar">${(member.name || member.email || 'U').charAt(0).toUpperCase()}</span>
                <span class="member-name">${member.name || member.email || uid}</span>
            </label>
        `;
        paidByContainer.appendChild(paidByDiv);
        console.log('✅ Added member to paid by:', member.name || member.email);

        // Add to "Split between" with share counter
        const splitDiv = document.createElement('div');
        splitDiv.className = 'member-share-item';
        splitDiv.id = `split-member-item-${memberIndex}`;
        splitDiv.dataset.uid = uid;
        splitDiv.dataset.shares = '1';
        
        splitDiv.innerHTML = `
            <label class="member-share-checkbox" for="split_${uid}">
                <input type="checkbox" name="splitBetween" value="${uid}" id="split_${uid}" checked onchange="toggleExpenseShare(this, ${memberIndex})">
                <div class="member-share-info">
                    <span class="member-avatar">${(member.name || member.email || 'U').charAt(0).toUpperCase()}</span>
                    <span class="member-share-name">${member.name || member.email || uid}</span>
                </div>
            </label>
            <div class="member-share-controls" id="split-share-controls-${memberIndex}">
                <button type="button" class="share-btn share-btn-minus" onclick="decrementExpenseShare(${memberIndex})" title="Quitar una porción">
                    −
                </button>
                <div class="share-counter" id="split-share-count-${memberIndex}">
                    <span class="share-number">1</span>
                    <span class="share-label">person</span>
                </div>
                <button type="button" class="share-btn share-btn-plus" onclick="incrementExpenseShare(${memberIndex})" title="Agregar una porción">
                    +
                </button>
            </div>
        `;
        splitContainer.appendChild(splitDiv);
        memberIndex++;
    });

    console.log('✅ Members populated successfully');
}

// ============================================
// EXPENSE SHARE MANAGEMENT FUNCTIONS
// ============================================

// Toggle expense share selection
function toggleExpenseShare(checkbox, index) {
    const item = checkbox.closest('.member-share-item');
    const controls = document.getElementById(`split-share-controls-${index}`);
    
    if (checkbox.checked) {
        item.classList.add('selected');
        if (controls) controls.style.display = 'flex';
        item.dataset.shares = '1';
        updateExpenseShareDisplay(index, 1);
    } else {
        item.classList.remove('selected');
        if (controls) controls.style.display = 'none';
        item.dataset.shares = '0';
    }
}

// Increment share count for expense
function incrementExpenseShare(index) {
    const item = document.getElementById(`split-member-item-${index}`);
    if (!item) return;
    
    let shares = parseInt(item.dataset.shares) || 1;
    shares++;
    item.dataset.shares = shares.toString();
    updateExpenseShareDisplay(index, shares);
}

// Decrement share count for expense
function decrementExpenseShare(index) {
    const item = document.getElementById(`split-member-item-${index}`);
    if (!item) return;
    
    let shares = parseInt(item.dataset.shares) || 1;
    if (shares > 1) {
        shares--;
        item.dataset.shares = shares.toString();
        updateExpenseShareDisplay(index, shares);
    }
}

// Update share display for expense
function updateExpenseShareDisplay(index, shares) {
    const counter = document.getElementById(`split-share-count-${index}`);
    if (!counter) return;
    
    const number = counter.querySelector('.share-number');
    const label = counter.querySelector('.share-label');
    
    if (number) number.textContent = shares;
    if (label) label.textContent = shares > 1 ? 'people' : 'person';
    
    // Visual feedback
    counter.style.transform = 'scale(1.15)';
    setTimeout(() => {
        counter.style.transform = 'scale(1)';
    }, 150);
}

// Make functions globally accessible
window.toggleExpenseShare = toggleExpenseShare;
window.incrementExpenseShare = incrementExpenseShare;
window.decrementExpenseShare = decrementExpenseShare;

// ============================================
// CURRENCY UTILITIES
// ============================================

const CURRENCY_SYMBOLS = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'MXN': '$',
    'COP': '$',
    'BRL': 'R$',
    'CAD': 'CA$',
    'AUD': 'A$',
    'JPY': '¥',
    'CNY': '¥',
    'INR': '₹',
    'CHF': 'CHF'
};

/**
 * Format currency with symbol
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (USD, EUR, etc.)
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = 'USD') {
    const symbol = CURRENCY_SYMBOLS[currency] || '$';
    const formattedAmount = amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    });
    return `${symbol}${formattedAmount}`;
}

// Cache for exchange rates
let exchangeRatesCache = null;
let exchangeRatesCacheTime = null;
const CACHE_DURATION = 3600000; // 1 hour

/**
 * Fetch current exchange rates from API
 * @returns {Object} Exchange rates with USD as base
 */
async function fetchExchangeRates() {
    try {
        // Check cache first
        if (exchangeRatesCache && exchangeRatesCacheTime && 
            (Date.now() - exchangeRatesCacheTime < CACHE_DURATION)) {
            console.log('💱 Using cached exchange rates');
            return exchangeRatesCache;
        }

        console.log('💱 Fetching exchange rates from API...');
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();
        exchangeRatesCache = data.rates;
        exchangeRatesCacheTime = Date.now();
        
        console.log('✅ Exchange rates updated:', Object.keys(exchangeRatesCache).length, 'currencies');
        return exchangeRatesCache;

    } catch (error) {
        console.error('❌ Error fetching exchange rates:', error);
        // Fallback rates (approximate, updated Dec 2024)
        return {
            USD: 1,
            EUR: 0.92,
            GBP: 0.79,
            MXN: 17.5,
            COP: 4100,
            BRL: 4.95,
            CAD: 1.36,
            AUD: 1.52,
            JPY: 149,
            CNY: 7.24,
            INR: 83.2,
            CHF: 0.88
        };
    }
}

/**
 * Convert amount from one currency to USD
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code
 * @returns {Promise<number>} Amount in USD
 */
async function convertToUSD(amount, fromCurrency = 'USD') {
    if (!fromCurrency || fromCurrency === 'USD') {
        return amount;
    }

    try {
        const rates = await fetchExchangeRates();
        const rate = rates[fromCurrency];
        
        if (!rate) {
            console.warn(`⚠️ No exchange rate for ${fromCurrency}, using 1:1`);
            return amount;
        }

        // Convert to USD: divide by the rate (since rates are from USD)
        const converted = amount / rate;
        console.log(`💱 Converted ${amount} ${fromCurrency} to ${converted.toFixed(2)} USD (rate: ${rate})`);
        return converted;

    } catch (error) {
        console.error('Error converting currency:', error);
        return amount;
    }
}

// Make convertToUSD available globally for mode-manager
window.convertToUSD = convertToUSD;

/**
 * Update currency symbol in the form
 */
function updateCurrencySymbol() {
    const currencySelect = document.getElementById('expenseCurrency');
    const currencySymbol = document.getElementById('currencySymbol');
    
    if (currencySelect && currencySymbol) {
        const currency = currencySelect.value;
        currencySymbol.textContent = CURRENCY_SYMBOLS[currency] || '$';
    }
}

/**
 * Get currency symbol for a currency code
 */
function getCurrencySymbol(currency) {
    return CURRENCY_SYMBOLS[currency] || '$';
}

// ============================================
// EXPENSE SUBMISSION
// ============================================

async function handleExpenseSubmission(event) {
    console.log('🚀 handleExpenseSubmission CALLED!', event);
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    console.log('📋 Form element:', form);
    console.log('📦 FormData created');

    try {
        // Get form values
        const description = formData.get('description');
        const rawAmount = formData.get('amount');
        const amount = Math.round(Number(rawAmount) * 100) / 100; // Round to 2 decimals
        const date = formData.get('date');
        const notes = formData.get('notes') || '';
        const currency = formData.get('currency') || 'USD';

        console.log('💰 Form submission - Amount:', rawAmount, '→ Parsed:', amount);
        console.log('💱 Form submission - Currency from form:', formData.get('currency'), '→ Final:', currency);
        console.log('📝 Form submission - Description:', description);
        console.log('🔍 All form data:', Array.from(formData.entries()));

        // Get selected members who paid (can be multiple)
        const paidBy = Array.from(form.querySelectorAll('input[name="paidBy"]:checked'))
            .map(cb => cb.value);

        // Get selected members for split with share multipliers
        const splitItems = document.querySelectorAll('.member-share-item');
        const splitBetween = [];
        splitItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                const uid = checkbox.value;
                const shares = parseInt(item.dataset.shares) || 1;
                // Add the member multiple times based on shares
                for (let i = 0; i < shares; i++) {
                    splitBetween.push(uid);
                }
            }
        });

        // Validate
        if (!description || !amount || paidBy.length === 0 || splitBetween.length === 0) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        if (amount === 0) {
            showToast('Amount cannot be zero', 'error');
            return;
        }

        // Get current user
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in to add expenses', 'error');
            return;
        }

        // Get paid by names (can be multiple)
        const paidByNames = paidBy.map(uid => {
            const member = currentFund.members[uid];
            return member?.name || member?.email || uid;
        });
        const paidByName = paidByNames.join(' & ');

        // Get category from form
        const categoryElement = document.getElementById('expenseCategory');
        const category = categoryElement ? categoryElement.value : 'other';

        // Create expense object
        const expenseInfo = {
            description,
            amount,
            splitBetween,
            category,
            notes,
            receipt: null,
            date: date || new Date().toISOString().split('T')[0], // Include date
            paidBy,
            paidByName,
            currency: currency || 'USD'
        };

        // Set current group ID for mode manager
        window.modeManager.currentGroupId = currentFund.fundId;

        // Save to Firebase via mode manager
        await window.modeManager.addSimpleExpense(expenseInfo);

        showToast('Expense added successfully! ✅', 'success');
        closeAddExpenseModal();

        // Refresh expense list and balances
        await loadSimpleModeExpenses();
        await loadSimpleModeBalances();
        
        // Refresh group info to update total balance
        await loadSimpleModeDetailView();

    } catch (error) {
        console.error('Error adding expense:', error);
        showToast(`Error adding expense: ${error.message}`, 'error');
    }
}

// Attach form handlers when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('addExpenseForm');
    if (expenseForm) {
        console.log('✅ Attaching submit handler to addExpenseForm');
        expenseForm.addEventListener('submit', handleExpenseSubmission);
    } else {
        console.error('❌ addExpenseForm not found in DOM');
    }
    
    const paymentForm = document.getElementById('recordPaymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmission);
    }
});

/**
 * Approve an expense
 */
async function approveExpense(expenseId) {
    try {
        if (currentFund && !currentFund.isActive) {
            showToast("⏸️ El grupo está pausado. No puedes aprobar gastos.", "error");
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in to approve expenses', 'error');
            return;
        }

        // Set current group ID for mode manager
        window.modeManager.currentGroupId = currentFund.fundId;

        // Approve the expense
        const success = await window.modeManager.approveExpense(expenseId, true);

        if (success) {
            showToast('Expense approved! ✅', 'success');
            // Refresh expense list
            await loadSimpleModeExpenses();
        } else {
            showToast('Failed to approve expense', 'error');
        }

    } catch (error) {
        console.error('Error approving expense:', error);
        showToast(`Error: ${error.message}`, 'error');
    }
}

/**
 * Reject an expense
 */
async function rejectExpense(expenseId) {
    try {
        if (currentFund && !currentFund.isActive) {
            showToast("⏸️ El grupo está pausado. No puedes rechazar gastos.", "error");
            return;
        }
        
        const user = firebase.auth().currentUser;
        if (!user) {
            showToast('You must be signed in to reject expenses', 'error');
            return;
        }

        const confirmed = confirm('Are you sure you want to reject this expense?');
        if (!confirmed) return;

        // Set current group ID for mode manager
        window.modeManager.currentGroupId = currentFund.fundId;

        // Reject the expense
        const success = await window.modeManager.approveExpense(expenseId, false);

        if (success) {
            showToast('Expense rejected ❌', 'info');
            // Refresh expense list
            await loadSimpleModeExpenses();
        } else {
            showToast('Failed to reject expense', 'error');
        }

    } catch (error) {
        console.error('Error rejecting expense:', error);
        showToast(`Error: ${error.message}`, 'error');
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

// Helper function to get selected involved members (with share multipliers)
function getSelectedInvolvedMembers() {
    const items = document.querySelectorAll('.member-share-item');
    const members = [];
    
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            const address = checkbox.value;
            const shares = parseInt(item.dataset.shares) || 1;
            
            // Add the member address multiple times based on shares
            for (let i = 0; i < shares; i++) {
                members.push(address);
            }
        }
    });
    
    return members;
}

// Load involved members checkboxes with share counters
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
                <div class="member-share-item" id="member-item-${i}" data-address="${address}" data-shares="1">
                    <label class="member-share-checkbox" for="member-${i}">
                        <input 
                            type="checkbox" 
                            id="member-${i}" 
                            value="${address}"
                            checked
                            onchange="toggleMemberShare(this, ${i})"
                        >
                        <div class="member-share-info">
                            <span class="member-share-name">${nickname}</span>
                            <span class="member-share-address">${shortAddr}</span>
                        </div>
                    </label>
                    <div class="member-share-controls" id="share-controls-${i}">
                        <button type="button" class="share-btn share-btn-minus" onclick="decrementShare(${i})" title="Quitar una porción">
                            −
                        </button>
                        <div class="share-counter" id="share-count-${i}">
                            <span class="share-number">1</span>
                            <span class="share-label">person</span>
                        </div>
                        <button type="button" class="share-btn share-btn-plus" onclick="incrementShare(${i})" title="Agregar una porción">
                            +
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error("Error loading involved members:", error);
    }
}

// Toggle member share selection
function toggleMemberShare(checkbox, index) {
    const item = checkbox.closest('.member-share-item');
    const controls = document.getElementById(`share-controls-${index}`);
    
    if (checkbox.checked) {
        item.classList.add('selected');
        controls.style.display = 'flex';
        item.dataset.shares = '1';
        updateShareDisplay(index, 1);
    } else {
        item.classList.remove('selected');
        controls.style.display = 'none';
        item.dataset.shares = '0';
    }
}

// Increment share count for a member
function incrementShare(index) {
    const item = document.getElementById(`member-item-${index}`);
    if (!item) return;
    
    let shares = parseInt(item.dataset.shares) || 1;
    shares++;
    item.dataset.shares = shares.toString();
    updateShareDisplay(index, shares);
}

// Decrement share count for a member
function decrementShare(index) {
    const item = document.getElementById(`member-item-${index}`);
    if (!item) return;
    
    let shares = parseInt(item.dataset.shares) || 1;
    if (shares > 1) {
        shares--;
        item.dataset.shares = shares.toString();
        updateShareDisplay(index, shares);
    }
}

// Update share display
function updateShareDisplay(index, shares) {
    const counter = document.getElementById(`share-count-${index}`);
    if (!counter) return;
    
    const number = counter.querySelector('.share-number');
    const label = counter.querySelector('.share-label');
    
    if (number) number.textContent = shares;
    if (label) label.textContent = shares > 1 ? 'people' : 'person';
    
    // Visual feedback
    counter.style.transform = 'scale(1.15)';
    setTimeout(() => {
        counter.style.transform = 'scale(1)';
    }, 150);
}

// Make functions globally accessible
window.toggleMemberShare = toggleMemberShare;
window.incrementShare = incrementShare;
window.decrementShare = decrementShare;

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
            const items = document.querySelectorAll('.member-share-item');
            items.forEach((item, index) => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    toggleMemberShare(checkbox, index);
                }
            });
        });
    }
    
    const deselectAllBtn = document.getElementById('deselectAllMembersBtn');
    if (deselectAllBtn) {
        deselectAllBtn.addEventListener('click', () => {
            const items = document.querySelectorAll('.member-share-item');
            items.forEach((item, index) => {
                const checkbox = item.querySelector('input[type="checkbox"]');
                if (checkbox && checkbox.checked) {
                    checkbox.checked = false;
                    toggleMemberShare(checkbox, index);
                }
            });
        });
    }
});

// ============================================
// SETTINGS MODAL FUNCTIONS
// ============================================

/**
 * Open app settings modal
 */
function openAppSettings() {
    const modal = document.getElementById('appSettingsModal');
    if (modal) {
        modal.classList.add('active');
        updateAppSettingsUI();
    }
}

/**
 * Close app settings modal
 */
function closeAppSettings(event) {
    if (!event || event.target.classList.contains('modal-overlay') || event.target.classList.contains('close-btn')) {
        const modal = document.getElementById('appSettingsModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

/**
 * Update settings UI with current values
 */
function updateAppSettingsUI() {
    // Update language buttons active state
    const currentLang = getCurrentLanguage();
    document.querySelectorAll('.setting-option[data-lang]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === currentLang) {
            btn.classList.add('active');
        }
    });
    
    // Update theme buttons active state
    const currentTheme = getCurrentTheme();
    document.querySelectorAll('.setting-option[data-theme]').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === currentTheme) {
            btn.classList.add('active');
        }
    });
    
    console.log('⚙️ Settings modal opened - Lang:', currentLang, 'Theme:', currentTheme);
}

/**
 * Change language
 */
function changeLanguage(lang) {
    if (typeof setLanguage === 'function') {
        setLanguage(lang);
    } else {
        console.error('setLanguage function not found');
    }
}

/**
 * Change theme
 */
function changeTheme(theme) {
    if (typeof setTheme === 'function') {
        setTheme(theme);
        updateAppSettingsUI(); // Update UI immediately after theme change
        closeAppSettings(); // Close modal after theme change
    } else {
        console.error('setTheme function not found');
    }
}

// ============================================
// EXPENSE FILTERING FUNCTIONS
// ============================================

/**
 * Filter expenses by search term and date range
 */
function filterExpenses() {
    const searchTerm = document.getElementById('expenseSearchInput')?.value.toLowerCase() || '';
    const startDate = document.getElementById('expenseFilterStart')?.value || '';
    const endDate = document.getElementById('expenseFilterEnd')?.value || '';
    
    const expenseCards = document.querySelectorAll('.expense-card-compact');
    let visibleCount = 0;
    
    expenseCards.forEach(card => {
        const title = card.querySelector('.expense-title')?.textContent.toLowerCase() || '';
        const notes = card.querySelector('.expense-notes')?.textContent.toLowerCase() || '';
        const dateElement = card.querySelector('.meta-item:nth-child(3)')?.textContent || '';
        
        // Check if search term matches
        const matchesSearch = !searchTerm || title.includes(searchTerm) || notes.includes(searchTerm);
        
        // Check if date is in range
        let matchesDate = true;
        if (startDate || endDate) {
            // Extract date from element - it's in format "📅 Dec 13, 2025"
            const dateMatch = dateElement.match(/(\w+)\s+(\d+),\s+(\d+)/);
            if (dateMatch) {
                const [, month, day, year] = dateMatch;
                const months = {
                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                };
                const expenseDate = new Date(year, months[month], day);
                
                if (startDate) {
                    const start = new Date(startDate);
                    if (expenseDate < start) matchesDate = false;
                }
                
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (expenseDate > end) matchesDate = false;
                }
            }
        }
        
        // Show/hide card based on filters
        if (matchesSearch && matchesDate) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show message if no results
    const historyList = document.getElementById('historyList');
    const existingNoResults = historyList?.querySelector('.no-results-message');
    
    if (visibleCount === 0 && !existingNoResults) {
        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-message';
        noResultsDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h4>No expenses found</h4>
                <p>Try adjusting your filters</p>
            </div>
        `;
        historyList.appendChild(noResultsDiv);
    } else if (visibleCount > 0 && existingNoResults) {
        existingNoResults.remove();
    }
}

/**
 * Clear all expense filters
 */
function clearExpenseFilters() {
    const searchInput = document.getElementById('expenseSearchInput');
    const startDate = document.getElementById('expenseFilterStart');
    const endDate = document.getElementById('expenseFilterEnd');
    
    if (searchInput) searchInput.value = '';
    if (startDate) startDate.value = '';
    if (endDate) endDate.value = '';
    
    filterExpenses();
}

/**
 * Toggle expense card details (expand/collapse)
 */
function toggleExpenseDetails(expenseId) {
    const card = document.querySelector(`[data-expense-id="${expenseId}"]`);
    if (!card) return;
    
    const details = card.querySelector('.expense-details');
    const expandIcon = card.querySelector('.expand-icon');
    
    if (details.style.display === 'none') {
        details.style.display = 'block';
        expandIcon.textContent = '▲';
        card.classList.add('expanded');
    } else {
        details.style.display = 'none';
        expandIcon.textContent = '▼';
        card.classList.remove('expanded');
    }
}
// ============================================
// RECURRING EXPENSES
// ============================================

function showRecurringExpenseModal() {
    const modal = document.getElementById('recurringExpenseModal');
    modal.style.display = 'flex';
    populateRecurringMembers();
}

function closeRecurringExpenseModal() {
    const modal = document.getElementById('recurringExpenseModal');
    modal.style.display = 'none';
    document.getElementById('recurringExpenseForm').reset();
}

function updateRecurringFrequencyOptions() {
    const frequency = document.getElementById('recurringFrequency').value;
    const dayOfMonthField = document.getElementById('dayOfMonthField');
    const dayOfWeekField = document.getElementById('dayOfWeekField');
    
    if (frequency === 'monthly') {
        dayOfMonthField.style.display = 'block';
        dayOfWeekField.style.display = 'none';
    } else if (frequency === 'weekly') {
        dayOfMonthField.style.display = 'none';
        dayOfWeekField.style.display = 'block';
    } else {
        dayOfMonthField.style.display = 'none';
        dayOfWeekField.style.display = 'none';
    }
}

function updateRecurringCurrencySymbol() {
    const currency = document.getElementById('recurringCurrency').value;
    document.getElementById('recurringCurrencySymbol').textContent = CURRENCY_SYMBOLS[currency] || '$';
}

// ============================================
// RECURRING EXPENSE SHARE MANAGEMENT
// ============================================

// Toggle recurring share selection
function toggleRecurringShare(checkbox, index) {
    const item = checkbox.closest('.member-share-item');
    const controls = document.getElementById(`recurring-share-controls-${index}`);
    
    if (checkbox.checked) {
        item.classList.add('selected');
        if (controls) controls.style.display = 'flex';
        item.dataset.shares = '1';
        updateRecurringShareDisplay(index, 1);
    } else {
        item.classList.remove('selected');
        if (controls) controls.style.display = 'none';
        item.dataset.shares = '0';
    }
}

// Increment share count for recurring
function incrementRecurringShare(index) {
    const item = document.getElementById(`recurring-member-item-${index}`);
    if (!item) return;
    
    let shares = parseInt(item.dataset.shares) || 1;
    shares++;
    item.dataset.shares = shares.toString();
    updateRecurringShareDisplay(index, shares);
}

// Decrement share count for recurring
function decrementRecurringShare(index) {
    const item = document.getElementById(`recurring-member-item-${index}`);
    if (!item) return;
    
    let shares = parseInt(item.dataset.shares) || 1;
    if (shares > 1) {
        shares--;
        item.dataset.shares = shares.toString();
        updateRecurringShareDisplay(index, shares);
    }
}

// Update share display for recurring
function updateRecurringShareDisplay(index, shares) {
    const counter = document.getElementById(`recurring-share-count-${index}`);
    if (!counter) return;
    
    const number = counter.querySelector('.share-number');
    const label = counter.querySelector('.share-label');
    
    if (number) number.textContent = shares;
    if (label) label.textContent = shares > 1 ? 'people' : 'person';
    
    // Visual feedback
    counter.style.transform = 'scale(1.15)';
    setTimeout(() => {
        counter.style.transform = 'scale(1)';
    }, 150);
}

// Make functions globally accessible
window.toggleRecurringShare = toggleRecurringShare;
window.incrementRecurringShare = incrementRecurringShare;
window.decrementRecurringShare = decrementRecurringShare;

function populateRecurringMembers() {
    const paidByContainer = document.getElementById('recurringPaidBy');
    const splitContainer = document.getElementById('recurringSplitBetween');
    
    if (!currentFund || !currentFund.members) return;
    
    const currentUserId = firebase.auth().currentUser?.uid;
    const members = Object.entries(currentFund.members);
    
    // Populate paid by (checkboxes)
    paidByContainer.innerHTML = members.map(([uid, member]) => `
        <label class="member-checkbox">
            <input type="checkbox" name="recurringPaidBy" value="${uid}" ${uid === currentUserId ? 'checked' : ''}>
            <span>${member.name || member.email}</span>
        </label>
    `).join('');
    
    // Populate split between with share counters
    splitContainer.innerHTML = '';
    members.forEach(([uid, member], index) => {
        const splitDiv = document.createElement('div');
        splitDiv.className = 'member-share-item';
        splitDiv.id = `recurring-member-item-${index}`;
        splitDiv.dataset.uid = uid;
        splitDiv.dataset.shares = '1';
        
        splitDiv.innerHTML = `
            <label class="member-share-checkbox" for="recurring_split_${uid}">
                <input type="checkbox" name="recurringSplitBetween" value="${uid}" id="recurring_split_${uid}" checked onchange="toggleRecurringShare(this, ${index})">
                <div class="member-share-info">
                    <span class="member-share-name">${member.name || member.email}</span>
                </div>
            </label>
            <div class="member-share-controls" id="recurring-share-controls-${index}">
                <button type="button" class="share-btn share-btn-minus" onclick="decrementRecurringShare(${index})" title="Quitar una porción">
                    −
                </button>
                <div class="share-counter" id="recurring-share-count-${index}">
                    <span class="share-number">1</span>
                    <span class="share-label">person</span>
                </div>
                <button type="button" class="share-btn share-btn-plus" onclick="incrementRecurringShare(${index})" title="Agregar una porción">
                    +
                </button>
            </div>
        `;
        splitContainer.appendChild(splitDiv);
    });
}

// Handle recurring expense form submission
document.addEventListener('DOMContentLoaded', () => {
    const recurringForm = document.getElementById('recurringExpenseForm');
    if (recurringForm) {
        recurringForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const description = document.getElementById('recurringDescription').value.trim();
                const amount = parseFloat(document.getElementById('recurringAmount').value);
                const currency = document.getElementById('recurringCurrency').value;
                const frequency = document.getElementById('recurringFrequency').value;
                const dayOfMonth = parseInt(document.getElementById('recurringDayOfMonth').value);
                const dayOfWeek = parseInt(document.getElementById('recurringDayOfWeek').value);
                
                // Get category
                const categoryElement = document.getElementById('recurringCategory');
                const category = categoryElement ? categoryElement.value : 'housing';
                
                // Get paidBy (can be multiple)
                const paidByCheckboxes = document.querySelectorAll('input[name="recurringPaidBy"]:checked');
                const paidBy = Array.from(paidByCheckboxes).map(cb => cb.value);
                
                // Get splitBetween with share multipliers
                const splitItems = document.querySelectorAll('#recurringSplitBetween .member-share-item');
                const splitBetween = [];
                splitItems.forEach(item => {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    if (checkbox && checkbox.checked) {
                        const uid = checkbox.value;
                        const shares = parseInt(item.dataset.shares) || 1;
                        // Add the member multiple times based on shares
                        for (let i = 0; i < shares; i++) {
                            splitBetween.push(uid);
                        }
                    }
                });
                
                if (paidBy.length === 0) {
                    showToast('Please select who pays this recurring expense', 'warning');
                    return;
                }
                
                if (splitBetween.length === 0) {
                    showToast('Please select who splits this recurring expense', 'warning');
                    return;
                }
                
                // Get paidByName(s)
                const paidByNames = paidBy.map(uid => {
                    const member = currentFund.members[uid];
                    return member?.name || member?.email || uid;
                });
                const paidByName = paidByNames.join(' & ');
                
                showLoading('Creating recurring expense...');
                
                window.modeManager.currentGroupId = currentFund.fundId;
                
                await window.modeManager.createRecurringExpense({
                    description,
                    amount,
                    currency,
                    category,
                    frequency,
                    dayOfMonth,
                    dayOfWeek,
                    paidBy,
                    paidByName,
                    splitBetween
                });
                
                hideLoading();
                showToast('✅ Recurring expense created!', 'success');
                closeRecurringExpenseModal();
                
                // Reload recurring expenses list
                await loadRecurringExpenses();
                
            } catch (error) {
                hideLoading();
                console.error('Error creating recurring expense:', error);
                showToast('Error: ' + error.message, 'error');
            }
        });
    }
});

async function loadRecurringExpenses() {
    try {
        if (!currentFund || !currentFund.fundId) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        const recurring = await window.modeManager.loadRecurringExpenses();
        
        const section = document.getElementById('recurringExpensesSection');
        const list = document.getElementById('recurringExpensesList');
        const count = document.getElementById('recurringCount');
        
        if (!recurring || recurring.length === 0) {
            section.style.display = 'none';
            return;
        }
        
        section.style.display = 'block';
        count.textContent = recurring.length;
        
        list.innerHTML = recurring.map(rec => {
            const frequencyIcons = { daily: '📅', weekly: '📆', monthly: '🗓️' };
            const icon = frequencyIcons[rec.frequency] || '🔄';
            const nextDue = new Date(rec.nextDue).toLocaleDateString();
            
            return `
                <div class="recurring-card" style="background: rgba(102, 126, 234, 0.1); border-left: 3px solid #667eea; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 1.2rem;">${icon}</span>
                                <strong style="font-size: 1rem;">${rec.description}</strong>
                            </div>
                            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">
                                <span style="color: #667eea; font-weight: bold;">${formatCurrency(rec.amount, rec.currency)}</span>
                                • ${capitalizeFirst(rec.frequency)}
                                • Next: ${nextDue}
                            </div>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.25rem;">
                                Paid by: ${rec.paidByName}
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-icon-small" onclick="toggleRecurringExpense('${rec.id}')" title="${rec.isActive ? 'Pause' : 'Resume'}">
                                ${rec.isActive ? '⏸️' : '▶️'}
                            </button>
                            <button class="btn-icon-small" onclick="deleteRecurringExpense('${rec.id}')" title="Delete">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading recurring expenses:', error);
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function toggleRecurringExpense(recurringId) {
    try {
        window.modeManager.currentGroupId = currentFund.fundId;
        const recurring = await window.FirebaseConfig.readDb(
            `groups/${currentFund.fundId}/recurringExpenses/${recurringId}`
        );
        
        await window.modeManager.updateRecurringExpense(recurringId, {
            isActive: !recurring.isActive
        });
        
        showToast(recurring.isActive ? 'Recurring expense paused' : 'Recurring expense resumed', 'success');
        await loadRecurringExpenses();
        
    } catch (error) {
        console.error('Error toggling recurring expense:', error);
        showToast('Error updating recurring expense', 'error');
    }
}

async function deleteRecurringExpense(recurringId) {
    try {
        const confirmed = confirm('Delete this recurring expense? Past expenses created by it will remain.');
        if (!confirmed) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        await window.modeManager.deleteRecurringExpense(recurringId);
        
        showToast('Recurring expense deleted', 'success');
        await loadRecurringExpenses();
        
    } catch (error) {
        console.error('Error deleting recurring expense:', error);
        showToast('Error deleting recurring expense', 'error');
    }
}

// Show manage recurring expenses modal
function showManageRecurringModal() {
    const modal = document.getElementById('manageRecurringModal');
    modal.style.display = 'flex';
    loadAllRecurringExpenses();
}

function closeManageRecurringModal() {
    const modal = document.getElementById('manageRecurringModal');
    modal.style.display = 'none';
}

async function loadAllRecurringExpenses() {
    try {
        if (!currentFund || !currentFund.fundId) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        const recurring = await window.modeManager.loadRecurringExpenses();
        
        const container = document.getElementById('manageRecurringList');
        if (!recurring || recurring.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: rgba(255,255,255,0.6);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
                    <p>No recurring expenses yet</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">
                        Create one to automatically track rent, subscriptions, or other regular payments
                    </p>
                </div>
            `;
            return;
        }
        
        const getCategoryIcon = (category) => {
            const icons = {
                'food': '🍕',
                'transport': '🚗',
                'housing': '🏠',
                'utilities': '💡',
                'entertainment': '🎬',
                'shopping': '🛍️',
                'health': '⚕️',
                'travel': '✈️',
                'subscription': '📺',
                'other': '🎯'
            };
            return icons[category] || '🎯';
        };
        
        container.innerHTML = recurring.map(rec => {
            const icon = getCategoryIcon(rec.category);
            const statusBadge = rec.isActive 
                ? '<span class="status-badge status-active">● Active</span>'
                : '<span class="status-badge status-paused">⏸ Paused</span>';
            
            const nextDue = new Date(rec.nextDue).toLocaleDateString();
            const daysUntil = Math.ceil((new Date(rec.nextDue) - new Date()) / (1000 * 60 * 60 * 24));
            const daysText = daysUntil > 0 
                ? `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`
                : daysUntil === 0 
                    ? 'today'
                    : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''} ago`;
            
            return `
                <div class="recurring-card-manage" onclick="showRecurringDetails('${rec.id}')" style="cursor: pointer; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="font-size: 2rem;">${icon}</div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                <strong style="font-size: 1.1rem;">${rec.description}</strong>
                                ${statusBadge}
                            </div>
                            <div style="display: flex; gap: 2rem; flex-wrap: wrap; font-size: 0.9rem; color: rgba(255,255,255,0.8);">
                                <div>
                                    <span style="color: rgba(255,255,255,0.6);">Amount:</span>
                                    <strong style="color: #667eea; margin-left: 0.25rem;">${formatCurrency(rec.amount, rec.currency)}</strong>
                                </div>
                                <div>
                                    <span style="color: rgba(255,255,255,0.6);">Frequency:</span>
                                    <strong style="margin-left: 0.25rem;">${capitalizeFirst(rec.frequency)}</strong>
                                </div>
                                <div>
                                    <span style="color: rgba(255,255,255,0.6);">Next Due:</span>
                                    <strong style="margin-left: 0.25rem;">${nextDue} (${daysText})</strong>
                                </div>
                            </div>
                            <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-top: 0.5rem;">
                                Paid by: ${rec.paidByName} • Split: ${rec.splitBetween.length} member${rec.splitBetween.length > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading all recurring expenses:', error);
    }
}

async function showRecurringDetails(recurringId) {
    try {
        window.modeManager.currentGroupId = currentFund.fundId;
        const rec = await window.FirebaseConfig.readDb(
            `groups/${currentFund.fundId}/recurringExpenses/${recurringId}`
        );
        
        if (!rec) {
            showToast('Recurring expense not found', 'error');
            return;
        }
        
        const icon = {
            'food': '🍕', 'transport': '🚗', 'housing': '🏠', 'utilities': '💡',
            'entertainment': '🎬', 'shopping': '🛍️', 'health': '⚕️', 'travel': '✈️',
            'subscription': '📺', 'other': '🎯'
        }[rec.category] || '🎯';
        
        const statusBadge = rec.isActive 
            ? '<span class="status-badge status-active">● Active</span>'
            : '<span class="status-badge status-paused">⏸ Paused</span>';
        
        const nextDue = new Date(rec.nextDue).toLocaleDateString();
        const daysUntil = Math.ceil((new Date(rec.nextDue) - new Date()) / (1000 * 60 * 60 * 24));
        const daysText = daysUntil > 0 
            ? `in ${daysUntil} day${daysUntil > 1 ? 's' : ''}`
            : daysUntil === 0 
                ? 'today'
                : `${Math.abs(daysUntil)} day${Math.abs(daysUntil) > 1 ? 's' : ''} ago`;
        
        // Get member names
        const splitNames = rec.splitBetween.map(uid => {
            const member = currentFund.members[uid];
            return member?.name || member?.email || uid;
        }).join(', ');
        
        const frequencyText = rec.frequency === 'weekly' && rec.dayOfWeek !== undefined
            ? `${capitalizeFirst(rec.frequency)} (${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][rec.dayOfWeek]})`
            : rec.frequency === 'monthly' && rec.dayOfMonth
                ? `${capitalizeFirst(rec.frequency)} (Day ${rec.dayOfMonth})`
                : capitalizeFirst(rec.frequency);
        
        const content = document.getElementById('recurringDetailsContent');
        content.innerHTML = `
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 4rem; margin-bottom: 0.5rem;">${icon}</div>
                <h3 style="margin: 0; font-size: 1.5rem;">${rec.description}</h3>
                <div style="margin-top: 0.5rem;">${statusBadge}</div>
            </div>
            
            <div style="background: rgba(102, 126, 234, 0.1); border-left: 3px solid #667eea; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">Amount</div>
                        <div style="font-size: 1.3rem; font-weight: bold; color: #667eea;">
                            ${formatCurrency(rec.amount, rec.currency)}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">Frequency</div>
                        <div style="font-size: 1.1rem; font-weight: bold;">
                            ${frequencyText}
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">Next Due</div>
                        <div style="font-size: 1.1rem; font-weight: bold;">
                            ${nextDue}
                        </div>
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">
                            ${daysText}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 0.5rem;">
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">Paid by</div>
                    <div style="font-weight: bold;">${rec.paidByName}</div>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.6); margin-bottom: 0.25rem;">Split between</div>
                    <div style="font-weight: bold;">${splitNames}</div>
                </div>
            </div>
            
            <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem; justify-content: center;">
                <button class="btn ${rec.isActive ? 'btn-secondary' : 'btn-primary'}" onclick="toggleRecurringFromDetails('${rec.id}', ${rec.isActive})">
                    ${rec.isActive ? '⏸️ Pause' : '▶️ Resume'}
                </button>
            </div>
        `;
        
        // Store recurringId for delete button
        window.currentRecurringId = recurringId;
        
        const modal = document.getElementById('recurringDetailsModal');
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error loading recurring details:', error);
        showToast('Error loading details', 'error');
    }
}

function closeRecurringDetailsModal() {
    const modal = document.getElementById('recurringDetailsModal');
    modal.style.display = 'none';
    window.currentRecurringId = null;
}

async function toggleRecurringFromDetails(recurringId, currentlyActive) {
    try {
        window.modeManager.currentGroupId = currentFund.fundId;
        await window.modeManager.updateRecurringExpense(recurringId, {
            isActive: !currentlyActive
        });
        
        showToast(currentlyActive ? 'Recurring expense paused' : 'Recurring expense resumed', 'success');
        closeRecurringDetailsModal();
        await loadAllRecurringExpenses();
        await loadRecurringExpenses();
        
    } catch (error) {
        console.error('Error toggling recurring expense:', error);
        showToast('Error updating recurring expense', 'error');
    }
}

async function confirmDeleteRecurring() {
    if (!window.currentRecurringId) return;
    
    try {
        const confirmed = confirm('Delete this recurring expense? Past expenses created by it will remain.');
        if (!confirmed) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        await window.modeManager.deleteRecurringExpense(window.currentRecurringId);
        
        showToast('Recurring expense deleted', 'success');
        closeRecurringDetailsModal();
        await loadAllRecurringExpenses();
        await loadRecurringExpenses();
        
    } catch (error) {
        console.error('Error deleting recurring expense:', error);
        showToast('Error deleting recurring expense', 'error');
    }
}

// ============================================
// BUDGET
// ============================================

function showBudgetModal() {
    const modal = document.getElementById('budgetModal');
    modal.style.display = 'flex';
    loadCurrentBudget();
}

function closeBudgetModal() {
    const modal = document.getElementById('budgetModal');
    modal.style.display = 'none';
    document.getElementById('budgetForm').reset();
}

function updateBudgetCurrencySymbol() {
    const currency = document.getElementById('budgetCurrency').value;
    document.getElementById('budgetCurrencySymbol').textContent = CURRENCY_SYMBOLS[currency] || '$';
}

async function loadCurrentBudget() {
    try {
        if (!currentFund || !currentFund.fundId) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        const budget = await window.modeManager.loadGroupBudget();
        
        if (budget && budget.enabled) {
            document.getElementById('budgetAmount').value = budget.amount;
            document.getElementById('budgetCurrency').value = budget.currency;
            document.getElementById('budgetPeriod').value = budget.period;
            updateBudgetCurrencySymbol();
        }
    } catch (error) {
        console.error('Error loading current budget:', error);
    }
}

// Handle budget form submission
document.addEventListener('DOMContentLoaded', () => {
    const budgetForm = document.getElementById('budgetForm');
    if (budgetForm) {
        budgetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                const amount = parseFloat(document.getElementById('budgetAmount').value);
                const currency = document.getElementById('budgetCurrency').value;
                const period = document.getElementById('budgetPeriod').value;
                
                const alertThresholds = [];
                if (document.getElementById('alert50').checked) alertThresholds.push(50);
                if (document.getElementById('alert80').checked) alertThresholds.push(80);
                if (document.getElementById('alert100').checked) alertThresholds.push(100);
                
                showLoading('Setting budget...');
                
                window.modeManager.currentGroupId = currentFund.fundId;
                
                await window.modeManager.setGroupBudget({
                    amount,
                    currency,
                    period,
                    alertThresholds
                });
                
                hideLoading();
                showToast('✅ Budget set successfully!', 'success');
                closeBudgetModal();
                
                // Reload budget status
                await loadBudgetStatus();
                
            } catch (error) {
                hideLoading();
                console.error('Error setting budget:', error);
                showToast('Error: ' + error.message, 'error');
            }
        });
    }
});

async function loadBudgetStatus() {
    try {
        if (!currentFund || !currentFund.fundId) return;
        
        window.modeManager.currentGroupId = currentFund.fundId;
        const status = await window.modeManager.calculateBudgetStatus();
        
        const statusBar = document.getElementById('budgetStatusBar');
        const budgetContent = document.getElementById('budgetContent');
        
        if (!status) {
            statusBar.style.display = 'none';
            return;
        }
        
        statusBar.style.display = 'block';
        
        const progressColor = status.status === 'exceeded' ? '#ef4444' : 
                             status.status === 'warning' ? '#f59e0b' : '#10b981';
        
        const progressWidth = Math.min(status.percentage, 100);
        
        budgetContent.innerHTML = `
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 1.5rem; border-left: 4px solid ${progressColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <p style="margin: 0; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                            ${formatCurrency(status.spent, status.currency)} of ${formatCurrency(status.budget, status.currency)}
                        </p>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: bold; color: ${progressColor};">
                                ${status.percentage.toFixed(0)}%
                            </div>
                            <div style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">
                                ${status.remaining >= 0 ? formatCurrency(status.remaining, status.currency) + ' left' : 'Exceeded by ' + formatCurrency(Math.abs(status.remaining), status.currency)}
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="btn-icon-small" onclick="editBudget()" title="Edit Budget">
                                ✏️
                            </button>
                            <button class="btn-icon-small" onclick="deleteBudget()" title="Delete Budget" style="color: #ef4444;">
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(0,0,0,0.3); height: 12px; border-radius: 6px; overflow: hidden;">
                    <div style="background: ${progressColor}; height: 100%; width: ${progressWidth}%; transition: width 0.3s ease;"></div>
                </div>
                
                ${status.status === 'exceeded' ? 
                    `<div style="margin-top: 1rem; padding: 0.75rem; background: rgba(239, 68, 68, 0.1); border-radius: 8px; border-left: 3px solid #ef4444;">
                        <strong style="color: #ef4444;">⚠️ Budget Exceeded!</strong>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                            You've spent ${formatCurrency(status.spent - status.budget, status.currency)} over budget.
                        </p>
                    </div>` : 
                status.status === 'warning' ?
                    `<div style="margin-top: 1rem; padding: 0.75rem; background: rgba(245, 158, 11, 0.1); border-radius: 8px; border-left: 3px solid #f59e0b;">
                        <strong style="color: #f59e0b;">⚡ Warning: Approaching Limit</strong>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: rgba(255,255,255,0.8);">
                            You're at ${status.percentage.toFixed(0)}% of your budget. Consider slowing down spending.
                        </p>
                    </div>` : ''}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading budget status:', error);
    }
}

async function editBudget() {
    showBudgetModal();
}

async function deleteBudget() {
    try {
        const confirmed = confirm('Are you sure you want to delete the budget? This action cannot be undone.');
        if (!confirmed) return;
        
        showLoading('Deleting budget...');
        
        window.modeManager.currentGroupId = currentFund.fundId;
        
        // Delete budget by setting it to null/disabled
        await window.FirebaseConfig.writeDb(
            `groups/${currentFund.fundId}/budget`,
            null
        );
        
        hideLoading();
        showToast('Budget deleted successfully', 'success');
        
        // Reload budget status (will hide it)
        await loadBudgetStatus();
        
    } catch (error) {
        hideLoading();
        console.error('Error deleting budget:', error);
        showToast('Error deleting budget', 'error');
    }
}

// Toggle collapsible sections
function toggleCollapsible(contentId) {
    const content = document.getElementById(contentId);
    const toggle = document.getElementById(contentId + 'Toggle');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        if (toggle) toggle.style.transform = 'rotate(180deg)';
    } else {
        content.style.display = 'none';
        if (toggle) toggle.style.transform = 'rotate(0deg)';
    }
}

// ============================================
// RECEIPT SCANNING WITH OPENAI
// ============================================

function getOpenAIKey() {
    return localStorage.getItem('openai_api_key');
}

function showOpenAIConfigModal() {
    const modal = document.getElementById('openaiConfigModal');
    const input = document.getElementById('openaiApiKey');
    input.value = getOpenAIKey() || '';
    modal.style.display = 'flex';
}

function closeOpenAIConfigModal() {
    document.getElementById('openaiConfigModal').style.display = 'none';
}

function saveOpenAIConfig() {
    const apiKey = document.getElementById('openaiApiKey').value.trim();
    
    if (!apiKey) {
        showToast('Please enter a valid API key', 'error');
        return;
    }
    
    if (!apiKey.startsWith('sk-')) {
        showToast('Invalid API key format. Should start with "sk-"', 'error');
        return;
    }
    
    localStorage.setItem('openai_api_key', apiKey);
    showToast('✅ API key saved successfully!', 'success');
    closeOpenAIConfigModal();
}

function triggerReceiptScan() {
    // Check if API key is configured
    const apiKey = getOpenAIKey();
    if (!apiKey) {
        showToast('Please configure your OpenAI API key first', 'warning');
        showOpenAIConfigModal();
        return;
    }
    
    document.getElementById('receiptImageInput').click();
}

async function handleReceiptImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }
    
    // Validate file size (max 20MB for OpenAI)
    if (file.size > 20 * 1024 * 1024) {
        showToast('Image too large. Please use an image under 20MB', 'error');
        return;
    }
    
    try {
        // Show scanning indicator
        const scanningIndicator = document.getElementById('scanningIndicator');
        scanningIndicator.style.display = 'block';
        
        // Convert image to base64
        const base64Image = await fileToBase64(file);
        
        // Call OpenAI Vision API
        const extractedData = await scanReceiptWithOpenAI(base64Image);
        
        // Fill form with extracted data
        if (extractedData) {
            fillExpenseFormFromReceipt(extractedData);
            showToast('✅ Receipt scanned successfully!', 'success');
        }
        
    } catch (error) {
        console.error('Error scanning receipt:', error);
        showToast('Error scanning receipt: ' + error.message, 'error');
    } finally {
        // Hide scanning indicator
        document.getElementById('scanningIndicator').style.display = 'none';
        // Clear file input
        event.target.value = '';
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function scanReceiptWithOpenAI(base64Image) {
    const apiKey = getOpenAIKey();
    
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Analyze this receipt/ticket image and extract the following information in JSON format:
{
  "amount": <total amount as number>,
  "currency": <currency code like "USD", "EUR", "MXN", etc.>,
  "description": <brief description of what was purchased>,
  "date": <date in YYYY-MM-DD format>,
  "category": <one of: "food", "transport", "housing", "utilities", "entertainment", "shopping", "health", "travel", "subscription", "other">
}

If you cannot find some information, use null for that field. Be as accurate as possible with the amount and date. For description, summarize the main items purchased.`
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        })
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
        throw new Error('No response from OpenAI');
    }
    
    // Parse JSON from response
    try {
        // Extract JSON from markdown code blocks if present
        const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
        const parsed = JSON.parse(jsonStr);
        
        console.log('Extracted receipt data:', parsed);
        return parsed;
    } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Could not parse receipt data from image');
    }
}

function fillExpenseFormFromReceipt(data) {
    // Fill description
    if (data.description) {
        document.getElementById('expenseDescription').value = data.description;
    }
    
    // Fill amount
    if (data.amount) {
        document.getElementById('expenseAmount').value = data.amount;
    }
    
    // Fill currency
    if (data.currency) {
        const currencySelect = document.getElementById('expenseCurrency');
        const currencyOption = Array.from(currencySelect.options).find(
            opt => opt.value === data.currency.toUpperCase()
        );
        if (currencyOption) {
            currencySelect.value = data.currency.toUpperCase();
            updateCurrencySymbol();
        }
    }
    
    // Fill date
    if (data.date) {
        document.getElementById('expenseDate').value = data.date;
    }
    
    // Fill category
    if (data.category) {
        const categorySelect = document.getElementById('expenseCategory');
        const categoryOption = Array.from(categorySelect.options).find(
            opt => opt.value === data.category.toLowerCase()
        );
        if (categoryOption) {
            categorySelect.value = data.category.toLowerCase();
        }
    }
    
    // Scroll to form to show filled data
    document.getElementById('expenseDescription').focus();
}

// ============================================
// ANALYTICS
// ============================================

let currentTimeframe = 'month';
let analyticsCharts = {};

function showAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'flex';
    loadAnalytics(currentTimeframe);
}

function closeAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    modal.style.display = 'none';
    
    // Destroy charts
    Object.values(analyticsCharts).forEach(chart => {
        if (chart) chart.destroy();
    });
    analyticsCharts = {};
}

function switchTimeframe(timeframe) {
    currentTimeframe = timeframe;
    
    // Update button states
    document.querySelectorAll('.btn-timeframe').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadAnalytics(timeframe);
}

async function loadAnalytics(timeframe) {
    try {
        if (!currentFund || !currentFund.fundId) return;
        
        showLoading('Generating analytics...');
        
        window.modeManager.currentGroupId = currentFund.fundId;
        const analytics = await window.modeManager.generateAnalytics(timeframe);
        
        // Detect currencies
        const currencies = Object.keys(analytics.byCurrency);
        let displayCurrency = 'USD';
        let currencyNote = '';
        
        if (currencies.length === 1) {
            // Single currency - use it
            displayCurrency = currencies[0];
            currencyNote = '';
        } else if (currencies.length > 1) {
            // Multiple currencies - show note
            displayCurrency = '';
            currencyNote = `<div style="background: rgba(255,165,0,0.2); border-left: 3px solid #ffa502; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>⚠️ Multiple Currencies Detected:</strong> ${currencies.join(', ')}
                <br><small style="color: rgba(255,255,255,0.7);">Amounts shown in original currencies. Future update will convert to a single currency.</small>
            </div>`;
        }
        
        const currencySymbol = displayCurrency ? (CURRENCY_SYMBOLS[displayCurrency] || '$') : '';
        
        // Update stats
        const statsContainer = document.getElementById('analyticsStats');
        statsContainer.innerHTML = `
            ${currencyNote}
            <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px;">
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">Total Spent${displayCurrency ? ' (' + displayCurrency + ')' : ''}</div>
                <div style="font-size: 2rem; font-weight: bold; color: white;">${currencySymbol}${analytics.totalSpent.toFixed(2)}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 1.5rem; border-radius: 12px;">
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">Expenses</div>
                <div style="font-size: 2rem; font-weight: bold; color: white;">${analytics.expenseCount}</div>
            </div>
            <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 1.5rem; border-radius: 12px;">
                <div style="font-size: 0.85rem; color: rgba(255,255,255,0.8); margin-bottom: 0.5rem;">Average${displayCurrency ? ' (' + displayCurrency + ')' : ''}</div>
                <div style="font-size: 2rem; font-weight: bold; color: white;">${currencySymbol}${analytics.averageExpense.toFixed(2)}</div>
            </div>
        `;
        
        // Render charts
        renderCategoryChart(analytics.byCategory);
        renderMemberChart(analytics.byMember);
        renderTimelineChart(analytics.byMonth, displayCurrency);
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error('Error loading analytics:', error);
        showToast('Error loading analytics', 'error');
    }
}

function renderCategoryChart(byCategory) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    // Destroy previous chart
    if (analyticsCharts.category) analyticsCharts.category.destroy();
    
    const labels = Object.keys(byCategory);
    const data = Object.values(byCategory);
    
    analyticsCharts.category = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.map(l => capitalizeFirst(l)),
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea', '#f093fb', '#4facfe', '#fa709a',
                    '#764ba2', '#f5576c', '#00f2fe', '#fee140'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: 'rgba(255,255,255,0.8)' }
                }
            }
        }
    });
}

function renderMemberChart(byMember) {
    const ctx = document.getElementById('memberChart');
    if (!ctx) return;
    
    if (analyticsCharts.member) analyticsCharts.member.destroy();
    
    const labels = Object.keys(byMember);
    const data = Object.values(byMember);
    
    analyticsCharts.member = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Amount Paid',
                data: data,
                backgroundColor: '#667eea'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

function renderTimelineChart(byMonth, displayCurrency = '') {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;
    
    if (analyticsCharts.timeline) analyticsCharts.timeline.destroy();
    
    const labels = Object.keys(byMonth).sort();
    const data = labels.map(month => byMonth[month]);
    
    const chartLabel = displayCurrency 
        ? `Monthly Spending (${displayCurrency})`
        : 'Monthly Spending';
    
    analyticsCharts.timeline = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: chartLabel,
                data: data,
                borderColor: '#4facfe',
                backgroundColor: 'rgba(79, 172, 254, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: 'rgba(255,255,255,0.8)' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                x: {
                    ticks: { color: 'rgba(255,255,255,0.8)' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                }
            }
        }
    });
}

async function exportToCSV() {
    try {
        window.modeManager.currentGroupId = currentFund.fundId;
        const analytics = await window.modeManager.generateAnalytics('all');
        
        // Create CSV content
        let csv = 'Category,Amount\n';
        Object.entries(analytics.byCategory).forEach(([cat, amount]) => {
            csv += `${cat},${amount}\n`;
        });
        
        // Download
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentFund.name}_analytics_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        showToast('✅ CSV exported', 'success');
        
    } catch (error) {
        console.error('Error exporting CSV:', error);
        showToast('Error exporting CSV', 'error');
    }
}

function exportToPDF() {
    showToast('PDF export coming soon!', 'info');
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

let notificationsCache = [];
let unreadCount = 0;
let notificationSystemInitialized = false;
let notificationRefreshInterval = null;

/**
 * Initialize notification system
 */
function initNotificationSystem() {
    // Prevent multiple initializations
    if (notificationSystemInitialized) {
        console.log('ℹ️ Notification system already initialized');
        return;
    }
    
    const notificationsBtn = document.getElementById('notificationsBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');
    const closeNotificationsBtn = document.getElementById('closeNotificationsBtn');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    if (!notificationsBtn || !notificationsPanel) {
        console.error('❌ Notification elements not found in DOM');
        return;
    }
    
    console.log('🔔 Initializing notification system...');
    
    // Event listeners for close and mark all read buttons (not for main button, it uses onclick)
    if (closeNotificationsBtn) {
        closeNotificationsBtn.addEventListener('click', () => {
            notificationsPanel.classList.add('hidden');
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }
    
    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (notificationsPanel && !notificationsPanel.classList.contains('hidden')) {
            if (!notificationsPanel.contains(e.target) && !notificationsBtn.contains(e.target)) {
                notificationsPanel.classList.add('hidden');
            }
        }
    });
    
    // Load notifications if user is logged in
    if (userAddress || firebase.auth().currentUser) {
        loadNotifications();
        // Refresh notifications every 30 seconds
        if (notificationRefreshInterval) {
            clearInterval(notificationRefreshInterval);
        }
        notificationRefreshInterval = setInterval(loadNotifications, 30000);
    }
    
    notificationSystemInitialized = true;
    console.log('✅ Notification system initialized');
}

/**
 * Toggle notifications panel visibility
 */
function toggleNotificationsPanel() {
    const panel = document.getElementById('notificationsPanel');
    if (!panel) {
        console.error('Notifications panel not found!');
        return;
    }
    
    const wasHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    
    if (wasHidden) {
        closeNotificationBanner();
    }
    
    // Mark visible notifications as read after a delay
    if (!panel.classList.contains('hidden')) {
        setTimeout(() => {
            const unreadNotifs = notificationsCache.filter(n => !n.read);
            unreadNotifs.forEach(notif => {
                markNotificationAsRead(notif.id);
            });
        }, 2000);
    }
}

// Make function globally available
window.toggleNotificationsPanel = toggleNotificationsPanel;

/**
 * Load user notifications from Firebase
 */
async function loadNotifications() {
    try {
        const userId = firebase.auth().currentUser?.uid || userAddress;
        console.log('📥 Loading notifications for user:', userId);
        if (!userId) {
            console.log('⚠️ No user ID, skipping notification load');
            return;
        }
        
        const notificationsRef = firebase.database().ref(`notifications/${userId}`);
        console.log('🔍 Querying notifications path:', `notifications/${userId}`);
        
        notificationsRef.orderByChild('timestamp').limitToLast(50).once('value', (snapshot) => {
            const notifications = [];
            
            snapshot.forEach((childSnapshot) => {
                const notification = {
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                };
                notifications.unshift(notification); // Most recent first
            });
            
            console.log(`✅ Loaded ${notifications.length} notifications`);
            if (notifications.length > 0) {
                console.log('First notification:', notifications[0]);
            }
            
            notificationsCache = notifications;
            unreadCount = notifications.filter(n => !n.read).length;
            console.log(`📊 Unread count: ${unreadCount}`);
            
            renderNotifications();
            updateNotificationBadge();
        });
        
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

/**
 * Render notifications in the panel
 */
function renderNotifications() {
    console.log('🎨 Rendering notifications, count:', notificationsCache.length);
    const notificationsList = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyNotifications');
    
    if (!notificationsList) {
        console.error('❌ notificationsList element not found!');
        return;
    }
    
    if (notificationsCache.length === 0) {
        console.log('📭 No notifications, showing empty state');
        if (emptyState) {
            emptyState.classList.remove('hidden');
        } else {
            console.warn('⚠️ emptyNotifications element not found');
        }
        notificationsList.innerHTML = '';
        return;
    }
    
    console.log('📬 Rendering notification items');
    if (emptyState) emptyState.classList.add('hidden');
    
    notificationsList.innerHTML = notificationsCache.map(notif => {
        const isUnread = !notif.read;
        const timeAgo = getTimeAgo(notif.timestamp);
        
        // Handle both old format (message is object) and new format (message is string)
        let title, message, type, fundId, expenseId;
        
        if (typeof notif.message === 'object' && notif.message !== null) {
            // Old format: entire notification data was nested in message field
            title = notif.message.title || 'Notificación';
            message = notif.message.message || '';
            type = notif.message.type || notif.type;
            fundId = notif.message.fundId || notif.fundId;
            expenseId = notif.message.expenseId || notif.expenseId;
        } else {
            // New format: proper structure
            title = notif.title || 'Notificación';
            message = notif.message || '';
            type = notif.type;
            fundId = notif.fundId;
            expenseId = notif.expenseId;
        }
        
        return `
            <div class="notification-item ${isUnread ? 'unread' : ''}" data-id="${notif.id}" onclick="handleNotificationClick('${notif.id}', '${type}', '${fundId || ''}', '${expenseId || ''}')">
                <div class="notification-header">
                    <div class="notification-icon">${getNotificationIcon(type)}</div>
                    <div class="notification-content">
                        <h4 class="notification-title">${title}</h4>
                        <p class="notification-message">${message}</p>
                        <div class="notification-time">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    console.log(`✅ Rendered ${notificationsCache.length} notification items`);
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type) {
    const icons = {
        'expense_added': '💸',
        'expense_deleted': '🗑️',
        'expense_delete_requested': '⚠️',
        'payment_received': '💰',
        'group_paused': '⏸️',
        'group_reactivated': '▶️',
        'group_deleted': '🗑️',
        'invitation': '📨',
        'vote_required': '🗳️',
        'proposal_approved': '✅',
        'proposal_rejected': '❌',
        'member_joined': '👥',
        'member_removed': '🚫',
        'removal_requested': '⚠️',
        'fund_goal_reached': '🎯',
        'default': '🔔'
    };
    return icons[type] || icons.default;
}

/**
 * Get notification title by type
 */
function getNotificationTitle(type) {
    const titles = {
        'expense_added': 'New Expense Added',
        'expense_deleted': 'Expense Deleted',
        'expense_delete_requested': 'Delete Request',
        'payment_received': 'Payment Received',
        'group_paused': 'Group Paused',
        'group_reactivated': 'Group Reactivated',
        'group_deleted': 'Group Deleted',
        'invitation': 'Invitation',
        'vote_required': 'Vote Required',
        'proposal_approved': 'Proposal Approved',
        'proposal_rejected': 'Proposal Rejected',
        'member_joined': 'New Member Joined',
        'member_removed': 'Member Removed',
        'removal_requested': 'Removal Request',
        'fund_goal_reached': 'Goal Reached',
        'default': 'Notification'
    };
    return titles[type] || titles.default;
}

/**
 * Get relative time string
 */
function getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    
    return new Date(timestamp).toLocaleDateString();
}

/**
 * Update notification badge count
 */
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    updateNotificationBanner();
}

/**
 * Mark notification as read
 */
async function markNotificationAsRead(notificationId) {
    try {
        const userId = firebase.auth().currentUser?.uid || userAddress;
        if (!userId) return;
        
        await firebase.database().ref(`notifications/${userId}/${notificationId}`).update({
            read: true
        });
        
        // Update cache
        const notif = notificationsCache.find(n => n.id === notificationId);
        if (notif && !notif.read) {
            notif.read = true;
            unreadCount = Math.max(0, unreadCount - 1);
            updateNotificationBadge();
            renderNotifications();
        }
        
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

/**
 * Mark all notifications as read
 */
async function markAllNotificationsAsRead() {
    try {
        const userId = firebase.auth().currentUser?.uid || userAddress;
        if (!userId) return;
        
        const updates = {};
        notificationsCache.forEach(notif => {
            if (!notif.read) {
                updates[`notifications/${userId}/${notif.id}/read`] = true;
            }
        });
        
        if (Object.keys(updates).length > 0) {
            await firebase.database().ref().update(updates);
            
            // Update cache
            notificationsCache.forEach(notif => notif.read = true);
            unreadCount = 0;
            updateNotificationBadge();
            renderNotifications();
            
            showToast('All notifications marked as read', 'success');
        }
        
    } catch (error) {
        console.error('Error marking all as read:', error);
        showToast('Error updating notifications', 'error');
    }
}

// Make function globally available
window.markAllNotificationsAsRead = markAllNotificationsAsRead;

/**
 * Delete all notifications
 */
async function deleteAllNotifications() {
    try {
        const userId = firebase.auth().currentUser?.uid || userAddress;
        if (!userId) {
            console.error('No user logged in');
            return;
        }

        console.log('🗑️ Deleting all notifications for user:', userId);
        await firebase.database().ref(`notifications/${userId}`).remove();
        
        // Clear cache and UI
        notificationsCache = [];
        unreadCount = 0;
        updateNotificationBadge();
        renderNotifications();
        
        console.log('✅ All notifications deleted');
        showToast('All notifications deleted', 'success');
        
    } catch (error) {
        console.error('❌ Error deleting notifications:', error);
        showToast('Error deleting notifications', 'error');
    }
}

// Make function globally available
window.deleteAllNotifications = deleteAllNotifications;

/**
 * Close notification banner
 */
function closeNotificationBanner() {
    const banner = document.getElementById('notificationBanner');
    if (banner) {
        banner.classList.add('hidden');
    }
}

// Make function globally available
window.closeNotificationBanner = closeNotificationBanner;

/**
 * Update notification banner on main page
 */
function updateNotificationBanner() {
    const banner = document.getElementById('notificationBanner');
    const bannerText = document.getElementById('notificationBannerText');
    
    if (!banner || !bannerText) return;
    
    if (unreadCount > 0) {
        bannerText.textContent = `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`;
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
    }
}

// ============================================
// PROFILE PANEL MANAGEMENT
// ============================================

/**
 * Open profile panel
 */
function openProfilePanel() {
    const panel = document.getElementById('profilePanel');
    if (!panel) return;

    panel.classList.remove('hidden');
    
    // Load profile data
    loadProfileData();
    
    // Close notifications panel if open
    const notificationsPanel = document.getElementById('notificationsPanel');
    if (notificationsPanel && !notificationsPanel.classList.contains('hidden')) {
        toggleNotificationsPanel();
    }
}

/**
 * Close profile panel
 */
function closeProfilePanel() {
    const panel = document.getElementById('profilePanel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

/**
 * Switch between profile tabs
 */
function switchProfileTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`.profile-tab[data-tab="${tabName}"]`)?.classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.profile-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`profileTab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`)?.classList.add('active');
    
    // Load specific tab data
    if (tabName === 'groups') {
        loadProfileGroups();
    }
}

/**
 * Load profile data
 */
async function loadProfileData() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        // Update avatar
        const avatarText = document.getElementById('profileAvatarText');
        if (avatarText) {
            const displayName = user.displayName || user.email;
            avatarText.textContent = displayName.charAt(0).toUpperCase();
        }

        // Update user info in header
        const userName = document.getElementById('profileUserName');
        const userEmail = document.getElementById('profileUserEmail');
        if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
        if (userEmail) userEmail.textContent = user.email;

        // Update auth badge
        const authBadge = document.getElementById('profileAuthBadge');
        if (authBadge) {
            const badgeText = authBadge.querySelector('.badge-text');
            if (user.providerData[0]) {
                const providerId = user.providerData[0].providerId;
                if (providerId === 'google.com') {
                    badgeText.textContent = 'Google';
                } else if (providerId === 'password') {
                    badgeText.textContent = 'Email/Password';
                } else {
                    badgeText.textContent = 'Firebase Auth';
                }
            }
        }

        // Update wallet badge if connected
        const walletBadge = document.getElementById('profileWalletBadge');
        const walletText = document.getElementById('profileWalletText');
        if (walletBadge && walletText) {
            if (userAddress) {
                walletBadge.style.display = 'inline-flex';
                walletText.textContent = `${userAddress.substring(0, 6)}...${userAddress.substring(38)}`;
            } else {
                walletBadge.style.display = 'none';
            }
        }

        // Load stats
        await loadProfileStats();

        // Load overview tab data
        loadProfileOverview();

    } catch (error) {
        console.error('Error loading profile data:', error);
    }
}

/**
 * Load profile statistics
 */
async function loadProfileStats() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        // Count groups
        const userGroupsData = await window.FirebaseConfig.readDb(`users/${user.uid}/groups`);
        const groupCount = userGroupsData ? Object.keys(userGroupsData).length : 0;
        document.getElementById('profileStatsGroups').textContent = groupCount;

        // Calculate total expenses and transactions
        let totalExpenses = 0;
        let totalTransactions = 0;

        if (userGroupsData) {
            for (const groupId of Object.keys(userGroupsData)) {
                const groupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
                if (groupData && groupData.expenses) {
                    const expenses = Object.values(groupData.expenses);
                    totalTransactions += expenses.length;
                    
                    // Sum expenses where user was the payer
                    expenses.forEach(expense => {
                        if (expense.paidBy === user.uid) {
                            totalExpenses += parseFloat(expense.amountUSD || expense.amount || 0);
                        }
                    });
                }
            }
        }

        document.getElementById('profileStatsExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('profileStatsTransactions').textContent = totalTransactions;

    } catch (error) {
        console.error('Error loading profile stats:', error);
    }
}

/**
 * Load overview tab data
 */
function loadProfileOverview() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    // Account info
    document.getElementById('profileInfoEmail').textContent = user.email;
    document.getElementById('profileInfoUID').textContent = user.uid;
    
    // Member since
    const creationDate = new Date(user.metadata.creationTime);
    document.getElementById('profileInfoMemberSince').textContent = creationDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Last login
    const lastLoginDate = new Date(user.metadata.lastSignInTime);
    document.getElementById('profileInfoLastLogin').textContent = getTimeAgo(lastLoginDate.getTime());
}

/**
 * Load user groups in profile
 */
async function loadProfileGroups() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const groupsList = document.getElementById('profileGroupsList');
    if (!groupsList) return;

    try {
        const userGroupsData = await window.FirebaseConfig.readDb(`users/${user.uid}/groups`);
        
        if (!userGroupsData || Object.keys(userGroupsData).length === 0) {
            groupsList.innerHTML = '<p class="empty-state-text">No groups yet. Create your first group!</p>';
            return;
        }

        const groupsHTML = [];
        for (const [groupId, groupRef] of Object.entries(userGroupsData)) {
            const groupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
            if (!groupData) continue;

            const groupName = groupData.name || groupData.fundName || 'Unnamed Group';
            const memberCount = groupData.members ? Object.keys(groupData.members).length : 0;
            const isCreator = groupData.creator === user.uid || groupData.createdBy === user.email;
            const role = isCreator ? 'Creator' : 'Member';

            groupsHTML.push(`
                <div class="profile-group-card" onclick="openGroupFromProfile('${groupId}')">
                    <div class="group-card-info">
                        <div class="group-card-name">${groupName}</div>
                        <div class="group-card-meta">
                            ${role} • ${memberCount} member${memberCount !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div class="group-card-icon">👥</div>
                </div>
            `);
        }

        groupsList.innerHTML = groupsHTML.join('');

    } catch (error) {
        console.error('Error loading profile groups:', error);
        groupsList.innerHTML = '<p class="empty-state-text">Error loading groups</p>';
    }
}

/**
 * Open a group from profile panel
 */
async function openGroupFromProfile(groupId) {
    closeProfilePanel();
    
    try {
        showLoading('Loading group...');
        
        const groupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
        if (!groupData) {
            hideLoading();
            showToast('Group not found', 'error');
            return;
        }

        currentFund = {
            fundId: groupId,
            fundAddress: groupId,
            fundName: groupData.name || groupData.fundName,
            fundType: groupData.fundType || 0,
            isSimpleMode: true,
            members: groupData.members,
            creator: groupData.creator || groupData.createdBy,
            name: groupData.name || groupData.fundName,
            ...groupData
        };

        // Hide dashboard, show detail
        document.getElementById('dashboardSection').classList.remove('active');
        document.getElementById('fundDetailSection').classList.add('active');

        await loadSimpleModeDetailView();
        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Error opening group:', error);
        showToast('Error opening group', 'error');
    }
}

/**
 * Export user data
 */
async function exportUserData() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
        showToast('Preparing export...', 'info');

        const userData = {
            profile: {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                createdAt: user.metadata.creationTime,
                lastLogin: user.metadata.lastSignInTime
            },
            groups: [],
            expenses: []
        };

        // Get all user groups
        const userGroupsData = await window.FirebaseConfig.readDb(`users/${user.uid}/groups`);
        if (userGroupsData) {
            for (const groupId of Object.keys(userGroupsData)) {
                const groupData = await window.FirebaseConfig.readDb(`groups/${groupId}`);
                if (groupData) {
                    userData.groups.push({
                        id: groupId,
                        name: groupData.name || groupData.fundName,
                        createdAt: groupData.createdAt,
                        members: groupData.members,
                        expenses: groupData.expenses || {}
                    });

                    // Add expenses
                    if (groupData.expenses) {
                        Object.entries(groupData.expenses).forEach(([expenseId, expense]) => {
                            userData.expenses.push({
                                groupId,
                                groupName: groupData.name || groupData.fundName,
                                ...expense
                            });
                        });
                    }
                }
            }
        }

        // Create and download JSON file
        const dataStr = JSON.stringify(userData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `antpool-data-${user.uid}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        showToast('Data exported successfully', 'success');

    } catch (error) {
        console.error('Error exporting data:', error);
        showToast('Error exporting data', 'error');
    }
}

/**
 * Confirm sign out
 */
function confirmSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        signOutFromFirebase();
        closeProfilePanel();
    }
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const isDark = document.getElementById('settingDarkMode').checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('darkMode', isDark);
    showToast(isDark ? 'Dark mode enabled' : 'Light mode enabled', 'success');
}

// Make functions globally available
window.openProfilePanel = openProfilePanel;
window.closeProfilePanel = closeProfilePanel;
window.switchProfileTab = switchProfileTab;
window.openGroupFromProfile = openGroupFromProfile;
window.exportUserData = exportUserData;
window.confirmSignOut = confirmSignOut;
window.toggleDarkMode = toggleDarkMode;


/**
 * Handle notification click
 */
function handleNotificationClick(notificationId, type, fundId, expenseId) {
    markNotificationAsRead(notificationId);
    
    // Navigate based on notification type
    if (fundId && fundId !== 'test') {
        console.log('🔍 Opening fund:', fundId);
        // Use openFund which handles both blockchain and simple mode funds
        if (typeof openFund === 'function') {
            openFund(fundId);
        } else {
            console.warn('⚠️ openFund function not available');
        }
    }
    
    // Close panel
    const panel = document.getElementById('notificationsPanel');
    if (panel) {
        panel.classList.add('hidden');
    }
}

// Make function globally available
window.handleNotificationClick = handleNotificationClick;

/**
 * Create a new notification
 */
async function createNotification(userId, notificationData) {
    try {
        if (!userId) return;
        
        const notification = {
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            fundId: notificationData.fundId || null,
            expenseId: notificationData.expenseId || null,
            timestamp: Date.now(),
            read: false
        };
        
        await firebase.database().ref(`notifications/${userId}`).push(notification);
        
        console.log('✅ Notification created for user:', userId, 'Type:', notificationData.type);
        
    } catch (error) {
        console.error('❌ Error creating notification:', error);
    }
}

// Make function globally available
window.createNotification = createNotification;

/**
 * Notify all group members except the actor
 */
async function notifyGroupMembers(fundId, type, message, extraData = {}) {
    try {
        const membersSnapshot = await firebase.database().ref(`groups/${fundId}/members`).once('value');
        const members = membersSnapshot.val() || {};
        
        const notificationPromises = Object.keys(members).map(memberId => {
            if (members[memberId]) {
                const notificationData = {
                    type: type,
                    title: getNotificationTitle(type),
                    message: message,
                    fundId: fundId,
                    expenseId: extraData.expenseId || null
                };
                return createNotification(memberId, notificationData);
            }
        }).filter(Boolean);
        
        await Promise.all(notificationPromises);
        
    } catch (error) {
        console.error('Error notifying group members:', error);
    }
}

// Make function globally available
window.notifyGroupMembers = notifyGroupMembers;

// Notification system will be initialized after Firebase auth is ready
// See firebase-config.js auth state listener