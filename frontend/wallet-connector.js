// Multi-Wallet Support Module
// Supports: MetaMask, Coinbase Wallet, Base Wallet, WalletConnect (mobile)

class WalletConnector {
    constructor() {
        this.provider = null;
        this.connectedWallet = null;
        this.supportedWallets = this.detectWallets();
    }

    // Detect available wallets
    detectWallets() {
        const wallets = [];

        // MetaMask
        if (typeof window.ethereum !== 'undefined') {
            if (window.ethereum.isMetaMask) {
                wallets.push({
                    id: 'metamask',
                    name: 'MetaMask',
                    icon: '🦊',
                    detected: true,
                    provider: window.ethereum
                });
            }
            
            // Coinbase Wallet / Base Wallet
            if (window.ethereum.isCoinbaseWallet) {
                wallets.push({
                    id: 'coinbase',
                    name: 'Coinbase Wallet',
                    icon: '🔵',
                    detected: true,
                    provider: window.ethereum
                });
            }
        }

        // Check for multiple providers (when multiple wallets installed)
        if (window.ethereum?.providers?.length > 0) {
            window.ethereum.providers.forEach(provider => {
                if (provider.isMetaMask && !wallets.find(w => w.id === 'metamask')) {
                    wallets.push({
                        id: 'metamask',
                        name: 'MetaMask',
                        icon: '🦊',
                        detected: true,
                        provider: provider
                    });
                }
                if (provider.isCoinbaseWallet && !wallets.find(w => w.id === 'coinbase')) {
                    wallets.push({
                        id: 'coinbase',
                        name: 'Coinbase Wallet',
                        icon: '🔵',
                        detected: true,
                        provider: provider
                    });
                }
            });
        }

        // WalletConnect (always available as fallback)
        wallets.push({
            id: 'walletconnect',
            name: 'WalletConnect',
            icon: '📱',
            detected: true,
            mobile: true
        });

        return wallets;
    }

    // Show wallet selection modal
    showWalletSelector() {
        return new Promise((resolve, reject) => {
            const wallets = this.detectWallets();
            
            if (wallets.length === 0) {
                reject(new Error('No se detectaron wallets. Por favor instala MetaMask o Coinbase Wallet.'));
                return;
            }

            // Create modal
            const modal = document.createElement('div');
            modal.className = 'wallet-modal';
            modal.innerHTML = `
                <div class="wallet-modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="wallet-modal-content">
                    <div class="wallet-modal-header">
                        <h2>Conectar Wallet</h2>
                        <button class="wallet-modal-close" onclick="this.closest('.wallet-modal').remove()">×</button>
                    </div>
                    <div class="wallet-modal-body">
                        <p class="wallet-modal-subtitle">Elige tu wallet preferida para continuar</p>
                        <div class="wallet-options">
                            ${wallets.map(wallet => `
                                <button class="wallet-option" data-wallet="${wallet.id}">
                                    <span class="wallet-icon">${wallet.icon}</span>
                                    <span class="wallet-name">${wallet.name}</span>
                                    ${wallet.mobile ? '<span class="wallet-badge">Móvil</span>' : ''}
                                    ${!wallet.detected ? '<span class="wallet-badge install">Instalar</span>' : ''}
                                </button>
                            `).join('')}
                        </div>
                        <div class="wallet-modal-footer">
                            <p class="wallet-help">
                                ¿No tienes una wallet? 
                                <a href="https://metamask.io/download/" target="_blank">Instalar MetaMask</a>
                            </p>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Add click handlers
            modal.querySelectorAll('.wallet-option').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const walletId = btn.dataset.wallet;
                    const wallet = wallets.find(w => w.id === walletId);
                    
                    modal.remove();
                    
                    try {
                        const result = await this.connect(wallet);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        });
    }

    // Connect to selected wallet
    async connect(wallet) {
        try {
            let provider;

            switch (wallet.id) {
                case 'metamask':
                case 'coinbase':
                    if (!wallet.provider) {
                        throw new Error(`${wallet.name} no está instalado`);
                    }
                    provider = wallet.provider;
                    
                    // Request account access
                    const accounts = await provider.request({ 
                        method: 'eth_requestAccounts' 
                    });
                    
                    if (!accounts || accounts.length === 0) {
                        throw new Error('No se pudo acceder a las cuentas');
                    }
                    
                    this.provider = provider;
                    this.connectedWallet = wallet.id;
                    
                    return {
                        provider: provider,
                        address: accounts[0],
                        walletType: wallet.id,
                        walletName: wallet.name
                    };

                case 'walletconnect':
                    return await this.connectWalletConnect();

                default:
                    throw new Error('Wallet no soportada');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            throw error;
        }
    }

    // WalletConnect integration (for mobile wallets)
    async connectWalletConnect() {
        try {
            // Check if WalletConnect is available
            if (typeof window.WalletConnectProvider === 'undefined') {
                // Load WalletConnect dynamically
                await this.loadWalletConnectScript();
            }

            const WalletConnectProvider = window.WalletConnectProvider.default;
            
            const provider = new WalletConnectProvider({
                rpc: {
                    31337: 'http://localhost:8545', // Hardhat local
                    84532: 'https://sepolia.base.org', // Base Sepolia
                    8453: 'https://mainnet.base.org', // Base Mainnet
                    137: 'https://polygon-rpc.com' // Polygon
                },
                chainId: 31337 // Default to local
            });

            await provider.enable();

            this.provider = provider;
            this.connectedWallet = 'walletconnect';

            return {
                provider: provider,
                address: provider.accounts[0],
                walletType: 'walletconnect',
                walletName: 'WalletConnect'
            };
        } catch (error) {
            throw new Error('Error conectando con WalletConnect: ' + error.message);
        }
    }

    // Load WalletConnect script dynamically
    loadWalletConnectScript() {
        return new Promise((resolve, reject) => {
            if (window.WalletConnectProvider) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Disconnect wallet
    async disconnect() {
        if (this.connectedWallet === 'walletconnect' && this.provider?.disconnect) {
            await this.provider.disconnect();
        }
        
        this.provider = null;
        this.connectedWallet = null;
    }

    // Get current network info
    async getNetwork() {
        if (!this.provider) return null;

        try {
            const chainId = await this.provider.request({ method: 'eth_chainId' });
            return {
                chainId: parseInt(chainId, 16),
                chainIdHex: chainId
            };
        } catch (error) {
            console.error('Error getting network:', error);
            return null;
        }
    }

    // Switch network
    async switchNetwork(chainId) {
        if (!this.provider) {
            throw new Error('No hay wallet conectada');
        }

        const chainIdHex = '0x' + chainId.toString(16);

        try {
            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }],
            });
            return true;
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    await this.addNetwork(chainId);
                    return true;
                } catch (addError) {
                    throw addError;
                }
            }
            throw switchError;
        }
    }

    // Add network to wallet
    async addNetwork(chainId) {
        const networks = {
            31337: {
                chainId: '0x7a69',
                chainName: 'Hardhat Local',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['http://127.0.0.1:8545'],
                blockExplorerUrls: null
            },
            84532: {
                chainId: '0x14a34',
                chainName: 'Base Sepolia',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org']
            },
            8453: {
                chainId: '0x2105',
                chainName: 'Base',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://mainnet.base.org'],
                blockExplorerUrls: ['https://basescan.org']
            },
            137: {
                chainId: '0x89',
                chainName: 'Polygon',
                nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                rpcUrls: ['https://polygon-rpc.com'],
                blockExplorerUrls: ['https://polygonscan.com']
            }
        };

        const networkConfig = networks[chainId];
        if (!networkConfig) {
            throw new Error('Red no soportada');
        }

        await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
        });
    }

    // Check if wallet is mobile
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Get deep link for mobile wallets
    getMobileDeepLink() {
        const currentUrl = window.location.href;
        const metamaskDeepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        const coinbaseDeepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(currentUrl)}`;
        
        return {
            metamask: metamaskDeepLink,
            coinbase: coinbaseDeepLink
        };
    }
}

// Export singleton instance
window.walletConnector = new WalletConnector();

// Utility function for easy access
async function connectWallet() {
    try {
        const result = await window.walletConnector.showWalletSelector();
        return result;
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        throw error;
    }
}

// Export for use in other scripts
window.connectWallet = connectWallet;

console.log('🔌 Multi-Wallet Connector loaded');
console.log('📱 Detected wallets:', window.walletConnector.supportedWallets.map(w => w.name));
