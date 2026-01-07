// ============================================
// TRAVELFUND V2 - FRONTEND APPLICATION
// Simplified UX with Nicknames & Auto-Load
// ============================================

// Global Variables
let provider;
let signer;
let contract;
let userAddress;
let userNickname;
let contractInfo;
let selectedEthereum; // Guardar el proveedor seleccionado

// Contract ABI (solo las funciones que necesitamos)
const contractABI = [
    // View Functions
    "function fundId() view returns (string)",
    "function tripName() view returns (string)",
    "function description() view returns (string)",
    "function creator() view returns (address)",
    "function targetAmount() view returns (uint256)",
    "function isPrivate() view returns (bool)",
    "function fundActive() view returns (bool)",
    "function approvalPercentage() view returns (uint256)",
    "function minimumVotes() view returns (uint256)",
    "function proposalCount() view returns (uint256)",
    "function getBalance() view returns (uint256)",
    "function getContributorCount() view returns (uint256)",
    "function getProgressPercentage() view returns (uint256)",
    "function contributions(address) view returns (uint256)",
    "function nicknames(address) view returns (string)",
    "function memberStatus(address) view returns (uint8)",
    "function isNicknameAvailable(string) view returns (bool)",
    "function getAddressByNickname(string) view returns (address)",
    "function getNickname(address) view returns (string)",
    "function getContributorsWithNicknames() view returns (address[], string[], uint256[])",
    "function getFundInfo() view returns (string, string, string, address, string, uint256, uint256, uint256, uint256, uint256, bool, bool, uint256, uint256)",
    "function getProposal(uint256) view returns (uint256, address, string, address, string, uint256, string, uint256, uint256, uint256, uint256, bool, bool, bool, bool)",
    "function hasUserVoted(uint256, address) view returns (bool)",
    "function isProposalExpired(uint256) view returns (bool)",
    
    // Write Functions
    "function setNickname(string) external",
    "function inviteMemberByNickname(string) external",
    "function inviteMemberByAddress(address) external",
    "function acceptInvitation() external",
    "function deposit() payable external",
    "function createProposal(address, uint256, string) external returns (uint256)",
    "function vote(uint256, bool) external",
    "function cancelProposal(uint256) external",
    "function executeProposal(uint256) external",
    "function closeFund() external",
    "function withdrawProportional() external",
    
    // Events
    "event NicknameSet(address indexed user, string nickname)",
    "event MemberInvited(address indexed inviter, address indexed invitee, string inviteeNickname)",
    "event InvitationAccepted(address indexed member, string nickname)",
    "event ContributionReceived(address indexed contributor, uint256 amount, uint256 totalContributions)",
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, uint256 amount, string description, uint256 expiresAt)",
    "event VoteCast(uint256 indexed proposalId, address indexed voter, bool inFavor)",
    "event ProposalApproved(uint256 indexed proposalId)",
    "event ProposalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amount)",
    "event ProposalCancelled(uint256 indexed proposalId, address indexed proposer)"
];

// ============================================
// INITIALIZATION
// ============================================

// Variable global para el proveedor seleccionado (como en V1)
let metamaskProviderDirect = null;

window.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 TravelFund V2 iniciando...");
    
    // SOLUCIÓN: Guardar referencia directa a MetaMask sin modificar window.ethereum
    console.log("🔧 Buscando MetaMask entre proveedores...");
    
    if (window.ethereum) {
        if (window.ethereum.providers && Array.isArray(window.ethereum.providers)) {
            console.log(`📦 Detectados ${window.ethereum.providers.length} proveedores`);
            
            // Buscar MetaMask que NO sea Coinbase (igual que V1)
            metamaskProviderDirect = window.ethereum.providers.find(p => {
                return p.isMetaMask && !p.isCoinbaseWallet && !p.overrideIsMetaMask;
            });
            
            // Fallback: buscar cualquier MetaMask
            if (!metamaskProviderDirect) {
                metamaskProviderDirect = window.ethereum.providers.find(p => p.isMetaMask);
            }
            
            if (metamaskProviderDirect) {
                console.log("✅ MetaMask encontrado en array de proveedores");
            } else {
                console.warn("⚠️ No se encontró MetaMask en los proveedores");
            }
        } else if (window.ethereum.isMetaMask) {
            // Solo hay un proveedor
            metamaskProviderDirect = window.ethereum;
            console.log("✅ MetaMask detectado como proveedor único");
        }
        
        if (metamaskProviderDirect) {
            console.log("✅ Referencia directa a MetaMask guardada");
            console.log("ℹ️ Usaremos esta referencia para TODAS las llamadas");
        } else {
            console.error("❌ No se pudo encontrar MetaMask");
        }
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Diagnóstico detallado de wallets disponibles
    console.log("📊 Diagnóstico de Wallets:");
    console.log("- window.ethereum existe:", !!window.ethereum);
    
    if (window.ethereum) {
        console.log("- window.ethereum.isMetaMask:", window.ethereum.isMetaMask);
        console.log("- window.ethereum.isCoinbaseWallet:", window.ethereum.isCoinbaseWallet);
        
        if (window.ethereumOriginal && window.ethereumOriginal.providers) {
            console.log("- Múltiples proveedores detectados:", window.ethereumOriginal.providers.length);
            window.ethereumOriginal.providers.forEach((provider, index) => {
                console.log(`  [${index}] isMetaMask: ${provider.isMetaMask}, isCoinbase: ${provider.isCoinbaseWallet}`);
            });
        } else {
            console.log("- Un solo proveedor (o ya reemplazado)");
        }
    }
    
    // Check for MetaMask
    if (!window.ethereum) {
        console.log("❌ No se detectó ninguna wallet");
        document.getElementById('metamaskWarning').style.display = 'block';
        return;
    }
    
    // Auto-connect if previously connected
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            console.log("✅ Cuentas previamente conectadas, reconectando...");
            await connectWallet();
        }
    } catch (error) {
        console.log("⚠️ No hay cuentas previamente conectadas");
    }
});

// ============================================
// WALLET CONNECTION
// ============================================

async function connectWallet() {
    try {
        showLoading(t('app.loading.connectingMetaMask'));
        console.log("🔌 Iniciando conexión de wallet...");
        
        // Verificar que encontramos MetaMask
        if (!metamaskProviderDirect) {
            hideLoading();
            console.error("❌ MetaMask no está disponible");
            showToast("⚠️ No se detectó MetaMask. Por favor instala la extensión.", "error");
            throw new Error("MetaMask no encontrado");
        }
        
        console.log("✅ Usando referencia directa a MetaMask (como V1)");
        
        // Guardar el proveedor seleccionado globalmente
        selectedEthereum = metamaskProviderDirect;
        
        console.log("📞 Solicitando acceso a cuentas DIRECTAMENTE a MetaMask...");
        
        // Llamada DIRECTA al proveedor MetaMask (sin pasar por window.ethereum)
        await metamaskProviderDirect.request({ method: 'eth_requestAccounts' });
        
        // Crear provider usando la referencia directa
        console.log("🔧 Creando provider con referencia directa...");
        provider = new ethers.BrowserProvider(metamaskProviderDirect);
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        
        console.log("✅ Cuenta conectada:", userAddress);
        console.log("✅ Provider y signer creados");
        
        // Check network
        console.log("🌐 Verificando red...");
        const network = await provider.getNetwork();
        console.log("📡 Red actual - Chain ID:", network.chainId.toString());
        
        if (network.chainId !== 31337n) {
            hideLoading();
            console.error("❌ Red incorrecta. Se requiere Chain ID: 31337");
            showToast("⚠️ Por favor cambia a la red Hardhat Local (Chain ID: 31337)", "warning");
            return;
        }
        
        console.log("✅ Red correcta (Hardhat Local)");
        console.log("✅ Wallet conectada exitosamente:", userAddress);
        
        // Update UI
        document.getElementById('connectWallet').innerHTML = `
            <span class="btn-icon">✅</span>
            <span>${userAddress.substring(0, 6)}...${userAddress.substring(38)}</span>
        `;
        document.getElementById('connectWallet').disabled = true;
        
        // Auto-load contract
        await autoLoadContract();
        
        hideLoading();
        
    } catch (error) {
        hideLoading();
        console.error("❌ Error conectando wallet:", error);
        console.error("📋 Detalles del error:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        // Mensajes de error más descriptivos
        let errorMessage = "Error: " + error.message;
        
        if (error.message.includes("No provider selected")) {
            errorMessage = "⚠️ Error de selección de proveedor. SOLUCIÓN: Desactiva Coinbase Wallet en chrome://extensions";
            console.log("💡 INSTRUCCIONES:");
            console.log("1. Abre chrome://extensions en tu navegador");
            console.log("2. Busca 'Coinbase Wallet'");
            console.log("3. Desactívalo (toggle OFF)");
            console.log("4. Recarga esta página (F5)");
        } else if (error.message.includes("User rejected")) {
            errorMessage = "❌ Conexión rechazada por el usuario";
        }
        
        showToast(errorMessage, "error");
    }
}

// ============================================
// CONTRACT AUTO-LOAD
// ============================================

async function autoLoadContract() {
    try {
        // Fetch contract info from auto-generated file
        const response = await fetch('/contract-info.json');
        if (!response.ok) {
            throw new Error("Contrato no encontrado. Por favor despliega primero.");
        }
        
        contractInfo = await response.json();
        console.log("📄 Información del contrato cargada:", contractInfo);
        
        // Create contract instance
        contract = new ethers.Contract(
            contractInfo.address,
            contractABI,
            signer
        );
        
        console.log("✅ Contrato conectado:", contractInfo.address);
        
        // Check user's nickname
        userNickname = await contract.getNickname(userAddress);
        const isActualNickname = userNickname !== userAddress;
        
        if (!isActualNickname) {
            // Show welcome/setup nickname section
            document.getElementById('welcomeSection').style.display = 'block';
        } else {
            // User has nickname, proceed to main app
            await initializeApp();
        }
        
    } catch (error) {
        console.error("Error cargando contrato:", error);
        showToast("Error cargando contrato: " + error.message, "error");
    }
}

// ============================================
// APP INITIALIZATION
// ============================================

async function initializeApp() {
    try {
        showLoading(t('app.loading.loadingFundInfo'));
        
        // Display user nickname
        document.getElementById('nicknameDisplay').textContent = userNickname;
        document.getElementById('userNickname').style.display = 'flex';
        
        // Load fund information
        await loadFundInfo();
        
        // Check membership status
        const memberStatus = await contract.memberStatus(userAddress);
        
        // MemberStatus enum: 0=NotInvited, 1=Invited, 2=Active
        if (memberStatus === 1n) {
            // User has pending invitation
            document.getElementById('acceptInvitationSection').style.display = 'block';
        }
        
        // Show main content
        document.getElementById('fundLoadedSection').style.display = 'block';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('welcomeSection').style.display = 'none';
        
        // Load initial data
        await loadContributors();
        await loadProposals();
        
        // Setup event listeners for contract events
        setupContractEventListeners();
        
        hideLoading();
        showToast("✅ Bienvenido, " + userNickname + "!", "success");
        
    } catch (error) {
        hideLoading();
        console.error("Error inicializando app:", error);
        showToast("Error: " + error.message, "error");
    }
}

// ============================================
// FUND INFORMATION
// ============================================

async function loadFundInfo() {
    const fundInfo = await contract.getFundInfo();
    
    // Destructure fund info
    const [
        id, name, desc, fundCreator, creatorNickname, target, 
        currentBalance, totalContrib, contributorCount, proposalCountValue,
        active, isPrivateFund, approvalPct, minVotes
    ] = fundInfo;
    
    // Update UI
    document.getElementById('fundName').textContent = name;
    document.getElementById('fundDescription').textContent = desc || "Sin descripción";
    
    // Privacy badge
    const privacyBadge = document.getElementById('fundPrivacyBadge');
    privacyBadge.textContent = isPrivateFund ? '🔒 Privado' : '🌐 Público';
    privacyBadge.className = isPrivateFund ? 'badge badge-private' : 'badge badge-public';
    
    // Status badge
    const statusBadge = document.getElementById('fundStatusBadge');
    statusBadge.textContent = active ? '🟢 Activo' : '🔴 Cerrado';
    statusBadge.className = active ? 'badge badge-success' : 'badge badge-danger';
    
    // Progress
    const progress = await contract.getProgressPercentage();
    document.getElementById('progressPercent').textContent = progress.toString();
    document.getElementById('progressFill').style.width = progress.toString() + '%';
    document.getElementById('currentAmount').textContent = ethers.formatEther(currentBalance);
    document.getElementById('targetAmount').textContent = ethers.formatEther(target);
    
    // Summary stats
    document.getElementById('totalBalance').textContent = ethers.formatEther(currentBalance);
    document.getElementById('contributorCount').textContent = contributorCount.toString();
    document.getElementById('proposalCount').textContent = proposalCountValue.toString();
    
    // Voting requirements
    document.getElementById('requiredApproval').textContent = approvalPct.toString() + '%';
    document.getElementById('minVotes').textContent = minVotes.toString();
    
    // User's contribution
    const myContribution = await contract.contributions(userAddress);
    document.getElementById('myContribution').textContent = ethers.formatEther(myContribution) + ' ETH';
}

// ============================================
// NICKNAME MANAGEMENT
// ============================================

async function setNickname() {
    try {
        const nickname = document.getElementById('nicknameInput').value.trim();
        
        if (!nickname) {
            showToast("⚠️ Por favor ingresa un nickname", "warning");
            return;
        }
        
        if (nickname.length < 3 || nickname.length > 32) {
            showToast("⚠️ El nickname debe tener entre 3 y 32 caracteres", "warning");
            return;
        }
        
        // Check if available
        const isAvailable = await contract.isNicknameAvailable(nickname);
        if (!isAvailable) {
            showToast("⚠️ Este nickname ya está en uso. Elige otro.", "warning");
            return;
        }
        
        showLoading(t('app.loading.settingNickname'));
        
        const tx = await contract.setNickname(nickname);
        await tx.wait();
        
        userNickname = nickname;
        
        hideLoading();
        showToast("✅ Nickname establecido: " + nickname, "success");
        
        // Initialize app
        await initializeApp();
        
    } catch (error) {
        hideLoading();
        console.error("Error estableciendo nickname:", error);
        if (error.message.includes("solo puede contener letras y numeros")) {
            showToast("⚠️ El nickname solo puede contener letras y números", "warning");
        } else {
            showToast("Error: " + error.message, "error");
        }
    }
}

// ============================================
// INVITATION MANAGEMENT
// ============================================

async function inviteMember() {
    try {
        const search = document.getElementById('inviteSearch').value.trim();
        
        if (!search) {
            showToast("⚠️ Ingresa un nickname o dirección", "warning");
            return;
        }
        
        showLoading(t('app.loading.sendingInvite'));
        
        let tx;
        
        // Check if it's an address (starts with 0x)
        if (search.startsWith('0x') && search.length === 42) {
            tx = await contract.inviteMemberByAddress(search);
        } else {
            // It's a nickname
            tx = await contract.inviteMemberByNickname(search);
        }
        
        await tx.wait();
        
        hideLoading();
        showToast("✅ Invitación enviada a " + search, "success");
        
        document.getElementById('inviteSearch').value = '';
        
    } catch (error) {
        hideLoading();
        console.error("Error enviando invitación:", error);
        
        if (error.message.includes("Nickname no encontrado")) {
            showToast("⚠️ Nickname no encontrado. Verifica que sea correcto.", "warning");
        } else if (error.message.includes("Ya esta invitado")) {
            showToast("⚠️ Este usuario ya fue invitado o ya es miembro", "warning");
        } else if (error.message.includes("Fondo lleno")) {
            showToast("⚠️ El fondo alcanzó el límite máximo de 50 miembros", "warning");
        } else {
            showToast("Error: " + error.message, "error");
        }
    }
}

async function acceptInvitation() {
    try {
        showLoading(t('app.loading.acceptingInvitation'));
        
        const tx = await contract.acceptInvitation();
        await tx.wait();
        
        hideLoading();
        showToast("✅ ¡Bienvenido al fondo! Ya puedes depositar y votar.", "success");
        
        document.getElementById('acceptInvitationSection').style.display = 'none';
        
        await loadFundInfo();
        
    } catch (error) {
        hideLoading();
        console.error("Error aceptando invitación:", error);
        showToast("Error: " + error.message, "error");
    }
}

// ============================================
// DEPOSIT FUNDS
// ============================================

async function deposit() {
    try {
        const amount = document.getElementById('depositAmount').value;
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast("⚠️ Ingresa una cantidad válida", "warning");
            return;
        }
        
        showLoading(t('app.loading.depositingFunds'));
        
        const tx = await contract.deposit({
            value: ethers.parseEther(amount)
        });
        
        await tx.wait();
        
        hideLoading();
        showToast("✅ Depósito exitoso: " + amount + " ETH", "success");
        
        document.getElementById('depositAmount').value = '';
        
        await loadFundInfo();
        await loadContributors();
        
    } catch (error) {
        hideLoading();
        console.error("Error depositando:", error);
        
        if (error.message.includes("No estas autorizado")) {
            showToast("⚠️ Debes ser miembro activo para depositar. Acepta la invitación primero.", "warning");
        } else if (error.message.includes("Fondo lleno")) {
            showToast("⚠️ El fondo alcanzó el límite de miembros", "warning");
        } else {
            showToast("Error: " + error.message, "error");
        }
    }
}

// ============================================
// CREATE PROPOSAL
// ============================================

async function createProposal() {
    try {
        const recipientSearch = document.getElementById('proposalRecipientSearch').value.trim();
        const amount = document.getElementById('proposalAmount').value;
        const description = document.getElementById('proposalDesc').value.trim();
        
        if (!recipientSearch) {
            showToast("⚠️ Especifica quién recibirá el pago", "warning");
            return;
        }
        
        if (!amount || parseFloat(amount) <= 0) {
            showToast("⚠️ Ingresa un monto válido", "warning");
            return;
        }
        
        if (!description) {
            showToast("⚠️ Agrega una descripción", "warning");
            return;
        }
        
        showLoading(t('app.loading.resolvingRecipient'));
        
        let recipientAddress;
        
        // Check if it's an address
        if (recipientSearch.startsWith('0x') && recipientSearch.length === 42) {
            recipientAddress = recipientSearch;
        } else {
            // It's a nickname, resolve it
            recipientAddress = await contract.getAddressByNickname(recipientSearch);
            if (recipientAddress === ethers.ZeroAddress) {
                hideLoading();
                showToast("⚠️ Nickname no encontrado", "warning");
                return;
            }
        }
        
        showLoading(t('app.loading.creatingProposal'));
        
        const tx = await contract.createProposal(
            recipientAddress,
            ethers.parseEther(amount),
            description
        );
        
        const receipt = await tx.wait();
        
        hideLoading();
        showToast("✅ Propuesta creada exitosamente", "success");
        
        // Clear form
        document.getElementById('proposalRecipientSearch').value = '';
        document.getElementById('proposalAmount').value = '';
        document.getElementById('proposalDesc').value = '';
        
        // Switch to vote tab
        switchTab('vote');
        await loadProposals();
        
    } catch (error) {
        hideLoading();
        console.error("Error creando propuesta:", error);
        
        if (error.message.includes("Monto excede limite")) {
            showToast("⚠️ El monto excede el 80% del balance. Reduce la cantidad.", "warning");
        } else {
            showToast("Error: " + error.message, "error");
        }
    }
}

// ============================================
// LOAD PROPOSALS
// ============================================

async function loadProposals() {
    const proposalsList = document.getElementById('proposalsList');
    proposalsList.innerHTML = '<div class="loading-message">Cargando propuestas...</div>';
    
    try {
        const count = await contract.proposalCount();
        
        if (count === 0n) {
            proposalsList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>No hay propuestas activas</p>
                    <small>Crea la primera propuesta en la pestaña "Proponer"</small>
                </div>
            `;
            return;
        }
        
        proposalsList.innerHTML = '';
        
        // Load all proposals
        for (let i = 1; i <= Number(count); i++) {
            const proposal = await contract.getProposal(i);
            const card = createProposalCard(proposal, i);
            proposalsList.appendChild(card);
        }
        
    } catch (error) {
        console.error("Error cargando propuestas:", error);
        proposalsList.innerHTML = '<div class="error-message">Error cargando propuestas</div>';
    }
}

function createProposalCard(proposal, id) {
    const [
        proposalId, proposer, proposerNickname, recipient, recipientNickname,
        amount, description, votesFor, votesAgainst, createdAt, expiresAt,
        executed, cancelled, approved, expired
    ] = proposal;
    
    const card = document.createElement('div');
    card.className = 'proposal-card';
    
    // Status badge
    let statusClass = 'status-pending';
    let statusText = '⏳ Pendiente';
    
    if (cancelled) {
        statusClass = 'status-cancelled';
        statusText = '❌ Cancelada';
    } else if (executed) {
        statusClass = 'status-executed';
        statusText = '✅ Ejecutada';
    } else if (expired) {
        statusClass = 'status-expired';
        statusText = '⏰ Expirada';
    } else if (approved) {
        statusClass = 'status-approved';
        statusText = '✓ Aprobada';
    }
    
    const totalVotes = Number(votesFor) + Number(votesAgainst);
    const votesForPct = totalVotes > 0 ? (Number(votesFor) * 100 / totalVotes) : 0;
    const votesAgainstPct = totalVotes > 0 ? (Number(votesAgainst) * 100 / totalVotes) : 0;
    
    card.innerHTML = `
        <div class="proposal-header">
            <div class="proposal-id">Propuesta #${id}</div>
            <div class="proposal-status ${statusClass}">${statusText}</div>
        </div>
        
        <div class="proposal-description">${description}</div>
        
        <div class="proposal-info">
            <p><strong>Monto:</strong> ${ethers.formatEther(amount)} ETH</p>
            <p><strong>Destinatario:</strong> ${recipientNickname}</p>
            <p><strong>Propuesto por:</strong> ${proposerNickname}</p>
        </div>
        
        <div class="vote-stats">
            <div class="vote-bar">
                <div class="vote-bar-label">
                    <span>A favor</span>
                    <span>${votesFor.toString()} votos (${votesForPct.toFixed(0)}%)</span>
                </div>
                <div class="vote-progress">
                    <div class="vote-progress-fill vote-for" style="width: ${votesForPct}%"></div>
                </div>
            </div>
            
            <div class="vote-bar">
                <div class="vote-bar-label">
                    <span>En contra</span>
                    <span>${votesAgainst.toString()} votos (${votesAgainstPct.toFixed(0)}%)</span>
                </div>
                <div class="vote-progress">
                    <div class="vote-progress-fill vote-against" style="width: ${votesAgainstPct}%"></div>
                </div>
            </div>
        </div>
        
        <div class="vote-buttons" id="voteButtons-${id}"></div>
    `;
    
    // Add action buttons
    const buttonsContainer = card.querySelector(`#voteButtons-${id}`);
    
    if (!executed && !cancelled && !expired) {
        // Check if user voted
        contract.hasUserVoted(id, userAddress).then(hasVoted => {
            if (hasVoted) {
                buttonsContainer.innerHTML = '<p class="text-muted">✓ Ya votaste en esta propuesta</p>';
            } else {
                buttonsContainer.innerHTML = `
                    <button class="btn-primary" onclick="vote(${id}, true)">
                        <span class="btn-icon">👍</span>
                        <span>Votar A Favor</span>
                    </button>
                    <button class="btn-danger" onclick="vote(${id}, false)">
                        <span class="btn-icon">👎</span>
                        <span>Votar En Contra</span>
                    </button>
                `;
                
                // If user is proposer and no votes, add cancel button
                if (proposer.toLowerCase() === userAddress.toLowerCase() && totalVotes === 0) {
                    buttonsContainer.innerHTML += `
                        <button class="btn-secondary" onclick="cancelProposal(${id})">
                            <span class="btn-icon">🚫</span>
                            <span>Cancelar</span>
                        </button>
                    `;
                }
            }
        });
        
        // Add execute button if approved
        if (approved) {
            setTimeout(() => {
                buttonsContainer.innerHTML += `
                    <button class="btn-primary" onclick="executeProposal(${id})">
                        <span class="btn-icon">💸</span>
                        <span>Ejecutar Propuesta</span>
                    </button>
                `;
            }, 100);
        }
    }
    
    return card;
}

// ============================================
// VOTING
// ============================================

async function vote(proposalId, inFavor) {
    try {
        showLoading(t('app.loading.registeringVote'));
        
        const tx = await contract.vote(proposalId, inFavor);
        await tx.wait();
        
        hideLoading();
        showToast("✅ Voto registrado: " + (inFavor ? "A favor" : "En contra"), "success");
        
        await loadProposals();
        
    } catch (error) {
        hideLoading();
        console.error("Error votando:", error);
        showToast("Error: " + error.message, "error");
    }
}

async function cancelProposal(proposalId) {
    if (!confirm('¿Estás seguro de cancelar esta propuesta?')) {
        return;
    }
    
    try {
        showLoading(t('app.loading.cancelingProposal'));
        
        const tx = await contract.cancelProposal(proposalId);
        await tx.wait();
        
        hideLoading();
        showToast("✅ Propuesta cancelada", "success");
        
        await loadProposals();
        
    } catch (error) {
        hideLoading();
        console.error("Error cancelando:", error);
        showToast("Error: " + error.message, "error");
    }
}

async function executeProposal(proposalId) {
    try {
        showLoading(t('app.loading.executingProposal'));
        
        const tx = await contract.executeProposal(proposalId);
        await tx.wait();
        
        hideLoading();
        showToast("✅ Propuesta ejecutada exitosamente", "success");
        
        await loadFundInfo();
        await loadProposals();
        
    } catch (error) {
        hideLoading();
        console.error("Error ejecutando:", error);
        showToast("Error: " + error.message, "error");
    }
}

// ============================================
// LOAD MEMBERS
// ============================================

async function loadContributors() {
    const membersList = document.getElementById('membersList');
    membersList.innerHTML = '<div class="loading-message">Cargando miembros...</div>';
    
    try {
        const [addresses, nicknames, amounts] = await contract.getContributorsWithNicknames();
        
        if (addresses.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">👥</span>
                    <p>Aún no hay contribuyentes</p>
                </div>
            `;
            return;
        }
        
        membersList.innerHTML = '';
        
        for (let i = 0; i < addresses.length; i++) {
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            
            const isCurrentUser = addresses[i].toLowerCase() === userAddress.toLowerCase();
            
            memberCard.innerHTML = `
                <div class="member-avatar">${nicknames[i].charAt(0).toUpperCase()}</div>
                <div class="member-info">
                    <div class="member-name">
                        ${nicknames[i]}
                        ${isCurrentUser ? '<span class="badge badge-primary">Tú</span>' : ''}
                    </div>
                    <div class="member-address">${addresses[i]}</div>
                </div>
                <div class="member-contribution">
                    ${ethers.formatEther(amounts[i])} ETH
                </div>
            `;
            
            membersList.appendChild(memberCard);
        }
        
    } catch (error) {
        console.error("Error cargando miembros:", error);
        membersList.innerHTML = '<div class="error-message">Error cargando miembros</div>';
    }
}

// ============================================
// CONTRACT EVENT LISTENERS
// ============================================

function setupContractEventListeners() {
    // Listen to deposit events
    contract.on("ContributionReceived", (contributor, amount) => {
        console.log("💰 Nuevo depósito:", ethers.formatEther(amount), "ETH");
        loadFundInfo();
        loadContributors();
    });
    
    // Listen to new proposals
    contract.on("ProposalCreated", (proposalId) => {
        console.log("📝 Nueva propuesta:", proposalId.toString());
        loadProposals();
    });
    
    // Listen to votes
    contract.on("VoteCast", (proposalId, voter, inFavor) => {
        console.log("🗳️ Nuevo voto en propuesta #" + proposalId.toString());
        loadProposals();
    });
    
    // Listen to executed proposals
    contract.on("ProposalExecuted", (proposalId) => {
        console.log("✅ Propuesta ejecutada:", proposalId.toString());
        loadFundInfo();
        loadProposals();
    });
}

// ============================================
// UI HELPERS
// ============================================

function setupEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    document.getElementById('diagnosisBtn').addEventListener('click', showDiagnosis);
    
    // Nickname
    document.getElementById('setNicknameBtn')?.addEventListener('click', setNickname);
    
    // Invitations
    document.getElementById('inviteBtn')?.addEventListener('click', inviteMember);
    document.getElementById('acceptInvitationBtn')?.addEventListener('click', acceptInvitation);
    
    // Deposit
    document.getElementById('depositBtn')?.addEventListener('click', deposit);
    
    // Proposal
    document.getElementById('createProposalBtn')?.addEventListener('click', createProposal);
    document.getElementById('refreshProposals')?.addEventListener('click', loadProposals);
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('tab-' + tabName).classList.add('active');
}

function showLoading(text = "Procesando...") {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// ============================================
// DIAGNOSIS TOOL
// ============================================

function showDiagnosis() {
    console.clear();
    console.log("╔════════════════════════════════════════╗");
    console.log("║   🔍 DIAGNÓSTICO DE WALLETS            ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("");
    
    // 1. Verificar window.ethereum
    console.log("1️⃣ WINDOW.ETHEREUM:");
    console.log("   Existe:", !!window.ethereum);
    
    if (!window.ethereum) {
        console.log("   ❌ No hay ninguna wallet instalada");
        alert("❌ No se detectó ninguna wallet.\n\nInstala MetaMask desde: https://metamask.io/download/");
        return;
    }
    
    // 2. Verificar proveedor principal
    console.log("");
    console.log("2️⃣ PROVEEDOR PRINCIPAL (window.ethereum):");
    console.log("   isMetaMask:", window.ethereum.isMetaMask);
    console.log("   isCoinbaseWallet:", window.ethereum.isCoinbaseWallet);
    console.log("   isBraveWallet:", window.ethereum.isBraveWallet);
    
    if (window.ethereumOriginal) {
        console.log("   ℹ️ NOTA: window.ethereum fue reemplazado al inicio");
        console.log("   ℹ️ Esto fuerza el uso de MetaMask directo");
    }
    
    // 3. Verificar múltiples proveedores
    console.log("");
    console.log("3️⃣ PROVEEDORES MÚLTIPLES:");
    const checkProviders = window.ethereumOriginal || window.ethereum;
    if (checkProviders.providers) {
        console.log("   Total proveedores:", checkProviders.providers.length);
        console.log("");
        
        checkProviders.providers.forEach((provider, index) => {
            console.log(`   [${index}] Proveedor:`);
            console.log(`       isMetaMask: ${provider.isMetaMask}`);
            console.log(`       isCoinbaseWallet: ${provider.isCoinbaseWallet}`);
            console.log(`       isBraveWallet: ${provider.isBraveWallet}`);
            
            if (provider.isMetaMask && !provider.isCoinbaseWallet) {
                console.log(`       ✅ Este es MetaMask puro`);
            }
        });
    } else {
        console.log("   Solo hay un proveedor");
    }
    
    // 4. Recomendaciones
    console.log("");
    console.log("4️⃣ RECOMENDACIONES:");
    
    let metamaskFound = false;
    let coinbaseFound = false;
    
    const checkProviders2 = window.ethereumOriginal || window.ethereum;
    if (checkProviders2.providers) {
        metamaskFound = checkProviders2.providers.some(p => p.isMetaMask && !p.isCoinbaseWallet);
        coinbaseFound = checkProviders2.providers.some(p => p.isCoinbaseWallet);
    } else {
        metamaskFound = window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet;
        coinbaseFound = window.ethereum.isCoinbaseWallet;
    }
    
    // Verificar si se aplicó el override
    if (window.ethereumOriginal && window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet) {
        console.log("   ✅ Override aplicado correctamente");
        console.log("   ℹ️ window.ethereum apunta directamente a MetaMask");
    }
    
    if (!metamaskFound) {
        console.log("   ❌ MetaMask NO detectado");
        console.log("   📥 SOLUCIÓN: Instala MetaMask");
        console.log("      https://metamask.io/download/");
    } else {
        console.log("   ✅ MetaMask detectado correctamente");
    }
    
    if (coinbaseFound) {
        console.log("   ⚠️ Coinbase Wallet detectado (causa conflictos)");
        console.log("   🔧 SOLUCIÓN:");
        console.log("      1. Abre: chrome://extensions");
        console.log("      2. Busca: Coinbase Wallet");
        console.log("      3. Desactívalo temporalmente (toggle OFF)");
        console.log("      4. Recarga esta página (F5)");
    }
    
    console.log("");
    console.log("═══════════════════════════════════════");
    console.log("");
    
    // Mostrar alerta con resumen
    let alertMessage = "🔍 DIAGNÓSTICO DE WALLETS\n\n";
    
    if (!metamaskFound && !coinbaseFound) {
        alertMessage += "❌ No hay wallets compatibles instaladas.\n\n";
        alertMessage += "SOLUCIÓN:\n";
        alertMessage += "Instala MetaMask desde:\n";
        alertMessage += "https://metamask.io/download/";
    } else if (!metamaskFound && coinbaseFound) {
        alertMessage += "❌ Solo se detectó Coinbase Wallet.\n\n";
        alertMessage += "SOLUCIÓN:\n";
        alertMessage += "1. Instala MetaMask\n";
        alertMessage += "2. O desactiva Coinbase temporalmente";
    } else if (metamaskFound && coinbaseFound) {
        alertMessage += "⚠️ Múltiples wallets detectadas.\n\n";
        alertMessage += "DETECTADO:\n";
        alertMessage += "✅ MetaMask (correcto)\n";
        alertMessage += "⚠️ Coinbase Wallet (causa conflictos)\n\n";
        alertMessage += "SOLUCIÓN:\n";
        alertMessage += "1. Abre: chrome://extensions\n";
        alertMessage += "2. Desactiva Coinbase Wallet\n";
        alertMessage += "3. Recarga la página (F5)\n\n";
        alertMessage += "Ver consola (F12) para más detalles.";
    } else {
        alertMessage += "✅ MetaMask detectado correctamente.\n\n";
        alertMessage += "Puedes conectar tu wallet ahora.";
    }
    
    alert(alertMessage);
}

// Make functions globally available
window.vote = vote;
window.cancelProposal = cancelProposal;
window.executeProposal = executeProposal;
