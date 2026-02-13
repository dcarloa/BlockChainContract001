// ============================================
// CHALLENGE GAMES SYSTEM
// Party mode for deciding who pays expenses
// ============================================

let challengeState = {
    mode: null, // 'physical' or 'remote'
    gameType: null,
    players: [],
    allMembers: [], // All fund members for selection
    scores: {},
    currentPlayerIndex: 0,
    expenseData: null
};

// ============================================
// MODE SELECTION
// ============================================

function showChallengeModeSelection() {
    const modal = document.getElementById('challengeModeModal');
    if (modal) {
        modal.style.display = 'flex';
        resetChallengeState();
    }
}

function selectChallengeMode(mode) {
    challengeState.mode = mode;
    challengeState.allMembers = getCurrentFundMembers();
    
    // Show player selection screen
    showPlayerSelection();
}

function getCurrentFundMembers() {
    // Get current fund members
    if (!currentFund || !currentFund.members) return [];
    
    // Convert members object to array
    const membersArray = Object.entries(currentFund.members).map(([uid, memberData]) => {
        return {
            address: uid,
            nickname: memberData.name || memberData.email || 'Member',
            selected: true // Default all selected
        };
    });
    
    return membersArray;
}

// ============================================
// PLAYER SELECTION
// ============================================

function showPlayerSelection() {
    document.getElementById('challengeModeSelection').style.display = 'none';
    document.getElementById('playerSelection').style.display = 'block';
    
    renderPlayerSelectionList();
    updateSelectedCount();
}

function renderPlayerSelectionList() {
    const listContainer = document.getElementById('playerSelectionList');
    
    if (!challengeState.allMembers || challengeState.allMembers.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #888;">No members available</p>';
        return;
    }
    
    listContainer.innerHTML = challengeState.allMembers.map((member, index) => {
        const initial = member.nickname.charAt(0).toUpperCase();
        const checked = member.selected ? 'checked' : '';
        const selectedClass = member.selected ? 'selected' : '';
        
        return `
            <div class="player-checkbox-item ${selectedClass}" onclick="togglePlayerSelection(${index}, event)">
                <input type="checkbox" ${checked} onchange="togglePlayerSelection(${index}, event)">
                <div class="player-checkbox-info">
                    <div class="player-checkbox-avatar">${initial}</div>
                    <div class="player-checkbox-name">${member.nickname}</div>
                </div>
            </div>
        `;
    }).join('');
}

function togglePlayerSelection(index, event) {
    // Prevent double-toggle from clicking both container and checkbox
    if (event && event.target.type === 'checkbox') {
        event.stopPropagation();
    } else if (event && event.target.type !== 'checkbox') {
        event.preventDefault();
    }
    
    challengeState.allMembers[index].selected = !challengeState.allMembers[index].selected;
    renderPlayerSelectionList();
    updateSelectedCount();
}

function toggleSelectAllPlayers() {
    const allSelected = challengeState.allMembers.every(m => m.selected);
    
    // Toggle all
    challengeState.allMembers.forEach(m => {
        m.selected = !allSelected;
    });
    
    renderPlayerSelectionList();
    updateSelectedCount();
    
    // Update button text
    const selectAllText = document.getElementById('selectAllText');
    const selectAllIcon = document.getElementById('selectAllIcon');
    if (!allSelected) {
        selectAllText.textContent = 'Deselect All';
        selectAllIcon.textContent = '☑️';
    } else {
        selectAllText.textContent = 'Select All';
        selectAllIcon.textContent = '☐';
    }
}

function updateSelectedCount() {
    const selectedCount = challengeState.allMembers.filter(m => m.selected).length;
    document.getElementById('selectedPlayerCount').textContent = selectedCount;
    
    // Enable/disable continue button
    const confirmBtn = document.getElementById('confirmPlayersBtn');
    if (selectedCount >= 2) {
        confirmBtn.disabled = false;
    } else {
        confirmBtn.disabled = true;
    }
    
    // Update Select All button state
    const allSelected = challengeState.allMembers.every(m => m.selected);
    const selectAllText = document.getElementById('selectAllText');
    const selectAllIcon = document.getElementById('selectAllIcon');
    if (allSelected) {
        selectAllText.textContent = 'Deselect All';
        selectAllIcon.textContent = '☑️';
    } else {
        selectAllText.textContent = 'Select All';
        selectAllIcon.textContent = '☐';
    }
}

function confirmPlayerSelection() {
    // Set selected players
    challengeState.players = challengeState.allMembers.filter(m => m.selected);
    
    if (challengeState.players.length < 2) {
        alert('Please select at least 2 players');
        return;
    }
    
    // Hide player selection and show next step
    document.getElementById('playerSelection').style.display = 'none';
    
    if (challengeState.mode === 'physical') {
        showGameSelection();
    } else {
        showRemoteOptions();
    }
}

function backToModeSelection() {
    document.getElementById('playerSelection').style.display = 'none';
    document.getElementById('challengeModeSelection').style.display = 'block';
    challengeState.mode = null;
}

function getMemberNickname(address) {
    // Helper to get nickname from address
    if (!currentFund || !address) return 'Player';
    
    // For Simple Mode, check members object
    if (currentFund.members && currentFund.members[address]) {
        return currentFund.members[address].name || currentFund.members[address].email || 'Player';
    }
    
    // For Blockchain Mode, check memberNicknames
    if (currentFund.memberNicknames && currentFund.memberNicknames[address]) {
        return currentFund.memberNicknames[address];
    }
    
    // Fallback to shortened address
    return address.substring(0, 6);
}

// ============================================
// PHYSICAL MODE - GAME SELECTION
// ============================================

async function showGameSelection() {
    // ✅ SUBSCRIPTION CHECK: Verify allowed games
    if (window.SubscriptionManager && window.FirebaseConfig) {
        const user = window.FirebaseConfig.getCurrentUser();
        if (user) {
            const allowed = await window.SubscriptionManager.getAllowedMinigames(user.uid);
            
            // Hide games not allowed for FREE tier
            const gameCards = document.querySelectorAll('#gameSelection .game-card');
            gameCards.forEach(card => {
                const gameType = card.getAttribute('onclick')?.match(/selectGame\('([^']+)'\)/)?.[1];
                if (gameType && !isGameAllowed(gameType, allowed)) {
                    card.classList.add('game-locked');
                    card.onclick = null;
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.SubscriptionManager.showUpgradeModal('All Minigames', `Unlock ${gameType} and all other games with PRO!`);
                    });
                    
                    // Add PRO badge
                    if (!card.querySelector('.pro-badge-game')) {
                        const badge = document.createElement('div');
                        badge.className = 'pro-badge-game';
                        badge.textContent = '💎 PRO';
                        badge.style.cssText = 'position: absolute; top: 8px; right: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;';
                        card.style.position = 'relative';
                        card.appendChild(badge);
                    }
                }
            });
        }
    }
    
    document.getElementById('challengeModeSelection').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
}

function isGameAllowed(gameType, allowed) {
    // Map game types to minigame IDs
    const gameMapping = {
        'memoryCards': 'memoryMatch',
        'colorMatch': 'memoryMatch', // Both count as memory-based
        'shakeIt': 'treasureHunt', // Physical games
        'quickTap': 'treasureHunt',
        'numberGuess': 'treasureHunt',
        'mathChallenge': 'mathQuiz',
        'wordScramble': 'wordScramble',
        'colorSwap': 'colorSwap',
        'aiTrivia': 'memoryMatch' // Advanced game
    };
    
    const minigameId = gameMapping[gameType] || gameType;
    return [...allowed.attended, ...allowed.unattended].includes(minigameId);
}

function selectGame(gameType) {
    challengeState.gameType = gameType;
    startPhysicalGame(gameType);
}

// ============================================
// PHYSICAL GAMES
// ============================================

async function startPhysicalGame(gameType) {
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';
    
    challengeState.currentPlayerIndex = 0;
    challengeState.scores = {};
    
    switch(gameType) {
        case 'quickTap':
            await playQuickTap();
            break;
        case 'colorMatch':
            await playColorMatch();
            break;
        case 'shakeIt':
            await playShakeIt();
            break;
        case 'numberGuess':
            await playNumberGuess();
            break;
        case 'memoryCards':
            await playMemoryCards();
            break;
        case 'mathChallenge':
            await playMathChallenge();
            break;
        case 'aiTrivia':
            await playAITrivia();
            break;
        case 'rhythmBattle':
            await playRhythmBattle();
            break;
        case 'emojiHunt':
            await playEmojiHunt();
            break;
    }
}

// Quick Tap Game
async function playQuickTap() {
    for (let i = 0; i < challengeState.players.length; i++) {
        challengeState.currentPlayerIndex = i;
        const player = challengeState.players[i];
        
        await showQuickTapTurn(player);
    }
    
    showResults('lower_wins');
}

async function showQuickTapTurn(player) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        currentCallback = resolve;
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <div class="player-avatar">👤</div>
                    <h2>${player.nickname}'s Turn</h2>
                </div>
                <div class="game-instructions">
                    <p>🐜 Tap the button as fast as a worker ant when it turns green!</p>
                    <div class="ready-indicator">GET READY...</div>
                </div>
                <button class="btn btn-secondary" onclick="startQuickTapRound('${player.address}')">
                    Ready!
                </button>
            </div>
        `;
    });
}

let quickTapStartTime = 0;
let currentCallback = null;
let quickTapEarlyClickTime = null;
let isWaitingForGreen = false;
let roundStartTime = 0;

function startQuickTapRound(playerAddress) {
    const gameArea = document.getElementById('gamePlayArea');
    isWaitingForGreen = true;
    quickTapEarlyClickTime = null;
    roundStartTime = Date.now(); // Track when waiting period starts
    
    // Create waiting screen with click detection
    gameArea.innerHTML = `
        <div class="game-turn-screen" onclick="handleEarlyClick('${playerAddress}')">
            <div class="quick-tap-waiting">
                <div class="pulse-indicator"></div>
                <p>🐜 WAIT FOR GREEN...</p>
                <small style="color: #888; margin-top: 10px;">⚠️ Patient like an ant!</small>
            </div>
        </div>
    `;
    
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    setTimeout(() => {
        if (!isWaitingForGreen) return; // Player clicked early, don't show green button
        
        quickTapStartTime = Date.now();
        isWaitingForGreen = false;
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <button class="quick-tap-button" onclick="recordQuickTapTime('${playerAddress}')">
                    🟢 TAP NOW!
                </button>
            </div>
        `;
    }, delay);
}

function handleEarlyClick(playerAddress) {
    if (!isWaitingForGreen) return; // Already processed or green is showing
    
    isWaitingForGreen = false;
    const clickTime = Date.now();
    
    // Calculate how long they waited before clicking early (lower = worse)
    const waitTime = clickTime - roundStartTime;
    
    // Store as negative to indicate elimination, value is how long they waited
    challengeState.scores[playerAddress] = -waitTime;
    
    const gameArea = document.getElementById('gamePlayArea');
    const player = challengeState.players.find(p => p.address === playerAddress);
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="score-display">
                <div class="score-icon" style="font-size: 4rem;">❌</div>
                <h2>${player.nickname}</h2>
                <div class="score-value" style="color: #e74c3c;">ELIMINATED!</div>
                <p>🐜 You clicked too early!</p>
                <small style="color: #888;">Wait for the green like a disciplined ant</small>
            </div>
            <button class="btn btn-primary" onclick="nextPlayer()">
                Next Player →
            </button>
        </div>
    `;
}

function recordQuickTapTime(playerAddress) {
    const reactionTime = Date.now() - quickTapStartTime;
    challengeState.scores[playerAddress] = reactionTime;
    
    const gameArea = document.getElementById('gamePlayArea');
    const player = challengeState.players.find(p => p.address === playerAddress);
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="score-display">
                <div class="score-icon">⚡</div>
                <h2>${player.nickname}</h2>
                <div class="score-value">${reactionTime}ms</div>
                <p>Great reaction time!</p>
            </div>
            <button class="btn btn-primary" onclick="nextPlayer()">
                Next Player →
            </button>
        </div>
    `;
}

function nextPlayer() {
    if (currentCallback) {
        currentCallback();
        currentCallback = null;
    }
}

// Number Guess Game
async function playNumberGuess() {
    const secretNumber = Math.floor(Math.random() * 100) + 1;
    
    // Store original guesses separately
    challengeState.guesses = {};
    
    for (let i = 0; i < challengeState.players.length; i++) {
        challengeState.currentPlayerIndex = i;
        const player = challengeState.players[i];
        
        await showNumberGuessTurn(player, secretNumber);
    }
    
    // Calculate distances from secret number for scoring
    for (let playerAddr in challengeState.scores) {
        const guess = challengeState.scores[playerAddr];
        challengeState.guesses[playerAddr] = guess; // Store original guess
        challengeState.scores[playerAddr] = Math.abs(guess - secretNumber); // Store distance for ranking
    }
    
    showResults('lower_wins', secretNumber);
}

async function showNumberGuessTurn(player, secretNumber) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        currentCallback = resolve;
        const previousGuesses = Object.entries(challengeState.scores)
            .map(([addr, guess]) => {
                const p = challengeState.players.find(pl => pl.address === addr);
                return `<div class="previous-guess">${p.nickname}: ${guess}</div>`;
            }).join('');
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <div class="player-avatar">👤</div>
                    <h2>${player.nickname}'s Turn</h2>
                </div>
                <div class="game-instructions">
                    <h3>🎯🐜 Guess the Number</h3>
                    <p>Use your ant intuition to find the hidden number between 1 and 100...</p>
                </div>
                ${previousGuesses ? `<div class="previous-guesses">${previousGuesses}</div>` : ''}
                <input type="number" 
                       id="numberGuessInput" 
                       class="form-input" 
                       min="1" 
                       max="100" 
                       placeholder="Enter your guess">
                <button class="btn btn-primary" onclick="recordNumberGuess('${player.address}')">
                    Submit Guess
                </button>
            </div>
        `;
        
        document.getElementById('numberGuessInput').focus();
    });
}

function recordNumberGuess(playerAddress) {
    const guess = parseInt(document.getElementById('numberGuessInput').value);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
        showToast("Please enter a number between 1 and 100", "warning");
        return;
    }
    
    challengeState.scores[playerAddress] = guess;
    if (currentCallback) {
        currentCallback();
        currentCallback = null;
    }
}

// ============================================
// REMOTE MODE - AUTOMATIC SELECTION
// ============================================

function showRemoteOptions() {
    document.getElementById('challengeModeSelection').style.display = 'none';
    document.getElementById('remoteSelection').style.display = 'block';
}

function selectRemoteMethod(method) {
    challengeState.gameType = method;
    executeRemoteSelection(method);
}

async function executeRemoteSelection(method) {
    document.getElementById('remoteSelection').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';
    
    const gameArea = document.getElementById('gamePlayArea');
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <h2 style="margin-bottom: 1rem; color: var(--text-primary);">🎲 Selecting Player...</h2>
            <div class="spinner-wheel-container" id="wheelContainer">
                <div class="spinner-pointer">▼</div>
                <div class="spinner-wheel" id="spinnerWheel">
                    ${challengeState.players.map((p, i) => `
                        <div class="wheel-segment" style="--index: ${i}; --total: ${challengeState.players.length};">
                            <span class="segment-text">${p.nickname}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="spinner-status" id="spinStatus">🎯 Get ready...</div>
        </div>
    `;
    
    // Small delay before starting spin
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let selectedPlayer;
    
    switch(method) {
        case 'random':
            selectedPlayer = await spinTheWheel();
            break;
        case 'fair':
            selectedPlayer = selectByFairRotation();
            await spinTheWheel(selectedPlayer);
            break;
        case 'balance':
            selectedPlayer = selectByBalance();
            await spinTheWheel(selectedPlayer);
            break;
        case 'dice':
            selectedPlayer = await playDiceBattle();
            break;
        case 'cards':
            selectedPlayer = await playCardDraw();
            break;
        case 'antPool':
            selectedPlayer = await playAntPoolRoulette();
            break;
    }
    
    showRemoteResult(selectedPlayer, method);
}

async function spinTheWheel(preselected = null) {
    return new Promise((resolve) => {
        const wheel = document.getElementById('spinnerWheel');
        const container = document.getElementById('wheelContainer');
        const statusEl = document.getElementById('spinStatus');
        const players = challengeState.players;
        
        // Determine selected player
        const selected = preselected || players[Math.floor(Math.random() * players.length)];
        const selectedIndex = players.findIndex(p => p.address === selected.address);
        
        // Calculate final rotation to land on selected player
        // The pointer is at the top (0 degrees), segments are positioned clockwise
        const segmentAngle = 360 / players.length;
        // We need to rotate so the selected segment is under the pointer (top)
        // Subtract 180 to fix the offset issue
        const targetAngle = (selectedIndex * segmentAngle) - (segmentAngle / 2);
        const spins = 360 * 5; // 5 full rotations
        const finalRotation = spins + targetAngle;
        
        // Add active glow effect
        container.classList.add('active');
        statusEl.textContent = '🎲 Spinning...';
        statusEl.style.animation = 'pulse 0.8s ease-in-out infinite';
        
        // Apply single smooth animation from start to finish
        // Starts fast, ends slow - no pause
        wheel.style.transition = 'transform 4.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        wheel.style.transform = `rotate(${finalRotation}deg)`;
        
        // Update status at midpoint
        setTimeout(() => {
            statusEl.textContent = '🎯 Slowing down...';
        }, 2500);
        
        // After animation completes
        setTimeout(() => {
            container.classList.remove('active');
            statusEl.textContent = `🎉 ${selected.nickname} selected!`;
            statusEl.style.animation = 'none';
            
            setTimeout(() => {
                resolve(selected);
            }, 800);
        }, 4500);
    });
}

function selectByFairRotation() {
    // TODO: Implement logic to select player who has paid least
    // For now, just select randomly
    const players = challengeState.players;
    return players[Math.floor(Math.random() * players.length)];
}

function selectByBalance() {
    // TODO: Implement logic to select based on current balance
    // For now, just select randomly
    const players = challengeState.players;
    return players[Math.floor(Math.random() * players.length)];
}

function showRemoteResult(player, method) {
    const gameArea = document.getElementById('gamePlayArea');
    const methodNames = {
        'random': 'Random Selection',
        'fair': 'Fair Rotation',
        'balance': 'Balance-Based',
        'dice': 'Dice Battle',
        'cards': 'Card Draw',
        'antPool': '🐜 Ant Pool Roulette'
    };
    
    // Get justification for Ant Pool method
    let justificationHTML = '';
    if (method === 'antPool' && challengeState.antPoolJustification) {
        justificationHTML = `
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(102, 126, 234, 0.1); border-radius: 8px;">
                <p style="font-size: 0.95rem; color: var(--text-secondary);">
                    <strong>🐜 ${challengeState.antPoolCriterion}</strong><br>
                    ${challengeState.antPoolJustification}
                </p>
            </div>
        `;
    }
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="result-screen">
                <div class="result-icon">🎉</div>
                <h2>Result!</h2>
                <div class="result-winner">
                    <div class="winner-avatar">💸</div>
                    <h3>${player.nickname}</h3>
                    <p>will pay!</p>
                </div>
                <div class="result-method">
                    <small>Method: ${methodNames[method]}</small>
                </div>
                ${justificationHTML}
            </div>
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="executeRemoteSelection('${method}')">
                    🔄 Try Again
                </button>
                <button class="btn btn-primary" onclick="confirmChallengeResult('${player.address}')">
                    Confirm & Create Expense
                </button>
            </div>
        </div>
    `;
}

// ============================================
// NEW REMOTE METHODS: DICE BATTLE & CARD DRAW
// ============================================

async function playDiceBattle() {
    const gameArea = document.getElementById('gamePlayArea');
    const players = challengeState.players;
    const rolls = {};
    
    // Show intro
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎲</div>
                <h2>Dice Battle!</h2>
                <p style="font-size: 1.2rem; margin: 1rem 0;">Each member will roll the dice...</p>
                <p style="color: var(--text-secondary);">Lowest roll loses!</p>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Roll for each player
    for (const player of players) {
        const roll = await showDiceRoll(player);
        rolls[player.address] = roll;
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Show all results and determine loser
    const results = Object.entries(rolls).map(([addr, roll]) => ({
        player: players.find(p => p.address === addr),
        roll
    }));
    
    results.sort((a, b) => a.roll - b.roll);
    const loser = results[0].player;
    const losersWithSameRoll = results.filter(r => r.roll === results[0].roll);
    
    let finalLoser = loser;
    let tieMessage = '';
    
    if (losersWithSameRoll.length > 1) {
        finalLoser = losersWithSameRoll[Math.floor(Math.random() * losersWithSameRoll.length)].player;
        const otherLosers = losersWithSameRoll
            .filter(r => r.player.address !== finalLoser.address)
            .map(r => r.player.nickname)
            .join(', ');
        tieMessage = `⚖️ Tied at ${results[0].roll} with ${otherLosers}. Selected randomly.`;
    }
    
    // Show final results
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <h2 style="text-align: center; margin-bottom: 2rem;">🎲 Dice Results</h2>
            <div class="dice-results">
                ${results.map((r, idx) => `
                    <div class="dice-result-item ${r.player.address === finalLoser.address ? 'loser' : ''}">
                        <div class="dice-result-medal">
                            ${idx === 0 ? '💸' : idx === results.length - 1 ? '🎉' : '🎲'}
                        </div>
                        <div class="dice-result-info">
                            <div class="dice-result-name">${r.player.nickname}</div>
                            <div class="dice-result-roll">Rolled: ${r.roll}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${tieMessage ? `<div class="tie-explanation">${tieMessage}</div>` : ''}
            <div style="text-align: center; margin-top: 2rem; padding: 1.5rem; background: rgba(245, 87, 108, 0.1); border-radius: 12px;">
                <h3 style="margin: 0;">${finalLoser.nickname} pays! 💸</h3>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    return finalLoser;
}

async function showDiceRoll(player) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 2rem;">${player.nickname}'s Turn</h2>
                    <div class="dice-container">
                        <div class="dice rolling" id="diceDisplay">🎲</div>
                    </div>
                    <p style="margin-top: 2rem; color: var(--text-secondary);">Rolling...</p>
                </div>
            </div>
        `;
        
        const diceEl = document.getElementById('diceDisplay');
        const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
        let rollCount = 0;
        
        const rollInterval = setInterval(() => {
            diceEl.textContent = diceFaces[Math.floor(Math.random() * 6)];
            rollCount++;
            
            if (rollCount > 15) {
                clearInterval(rollInterval);
                const finalRoll = Math.floor(Math.random() * 6) + 1;
                diceEl.textContent = diceFaces[finalRoll - 1];
                diceEl.classList.remove('rolling');
                diceEl.classList.add('final');
                
                setTimeout(() => {
                    gameArea.innerHTML = `
                        <div class="game-turn-screen">
                            <div style="text-align: center; padding: 2rem;">
                                <h2>${player.nickname}</h2>
                                <div class="dice-container">
                                    <div class="dice final" style="font-size: 8rem;">${diceFaces[finalRoll - 1]}</div>
                                </div>
                                <h3 style="margin-top: 1rem; color: var(--primary);">Rolled ${finalRoll}</h3>
                            </div>
                        </div>
                    `;
                    setTimeout(() => resolve(finalRoll), 1000);
                }, 500);
            }
        }, 100);
    });
}

async function playCardDraw() {
    const gameArea = document.getElementById('gamePlayArea');
    const players = challengeState.players;
    const draws = {};
    
    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['♠️', '♥️', '♦️', '♣️'];
    const cardValues = {'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13};
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎴</div>
                <h2>Card Draw!</h2>
                <p style="font-size: 1.2rem; margin: 1rem 0;">Each member draws a card...</p>
                <p style="color: var(--text-secondary);">Lowest card loses!</p>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    for (const player of players) {
        const card = await showCardDraw(player, cards, suits);
        draws[player.address] = card;
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    const results = Object.entries(draws).map(([addr, card]) => ({
        player: players.find(p => p.address === addr),
        card,
        value: cardValues[card.rank]
    }));
    
    results.sort((a, b) => a.value - b.value);
    const loser = results[0].player;
    const losersWithSameCard = results.filter(r => r.value === results[0].value);
    
    let finalLoser = loser;
    let tieMessage = '';
    
    if (losersWithSameCard.length > 1) {
        finalLoser = losersWithSameCard[Math.floor(Math.random() * losersWithSameCard.length)].player;
        const otherLosers = losersWithSameCard
            .filter(r => r.player.address !== finalLoser.address)
            .map(r => r.player.nickname)
            .join(', ');
        tieMessage = `⚖️ Tied with ${losersWithSameCard[0].card.rank}. Selected randomly from: ${otherLosers}.`;
    }
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <h2 style="text-align: center; margin-bottom: 2rem;">🎴 Card Results</h2>
            <div class="card-results">
                ${results.map((r, idx) => `
                    <div class="card-result-item ${r.player.address === finalLoser.address ? 'loser' : ''}">
                        <div class="card-result-medal">
                            ${idx === 0 ? '💸' : idx === results.length - 1 ? '🎉' : '🎴'}
                        </div>
                        <div class="card-result-info">
                            <div class="card-result-name">${r.player.nickname}</div>
                            <div class="playing-card ${r.card.suit === '♥️' || r.card.suit === '♦️' ? 'red' : 'black'}">
                                ${r.card.rank}${r.card.suit}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${tieMessage ? `<div class="tie-explanation">${tieMessage}</div>` : ''}
            <div style="text-align: center; margin-top: 2rem; padding: 1.5rem; background: rgba(245, 87, 108, 0.1); border-radius: 12px;">
                <h3 style="margin: 0;">${finalLoser.nickname} pays! 💸</h3>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    return finalLoser;
}

async function showCardDraw(player, cards, suits) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 2rem;">${player.nickname}'s Turn</h2>
                    <div class="card-draw-container">
                        <div class="card-back flipping">🎴</div>
                    </div>
                    <p style="margin-top: 2rem; color: var(--text-secondary);">Drawing card...</p>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const rank = cards[Math.floor(Math.random() * cards.length)];
            const suit = suits[Math.floor(Math.random() * suits.length)];
            const isRed = suit === '♥️' || suit === '♦️';
            
            gameArea.innerHTML = `
                <div class="game-turn-screen">
                    <div style="text-align: center; padding: 2rem;">
                        <h2>${player.nickname}</h2>
                        <div class="card-draw-container">
                            <div class="playing-card large ${isRed ? 'red' : 'black'}" style="font-size: 6rem; padding: 2rem;">
                                ${rank}${suit}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            setTimeout(() => resolve({rank, suit}), 1000);
        }, 1500);
    });
}

// ============================================
// ANT POOL ROULETTE - COLONY INTELLIGENCE
// ============================================

async function playAntPoolRoulette() {
    const gameArea = document.getElementById('gamePlayArea');
    const players = challengeState.players;
    
    // Show intro with ant animation
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div style="text-align: center; padding: 2rem;">
                <div class="ant-march" style="font-size: 4rem; margin-bottom: 1rem;">
                    🐜🐜🐜
                </div>
                <h2>🐜 Ant Pool Roulette</h2>
                <p style="font-size: 1.2rem; margin: 1rem 0;">The colony is gathering data...</p>
                <p style="color: var(--text-secondary);">Using ant intelligence to analyze group metadata!</p>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Define possible criteria with ant-themed names
    const criteria = [
        {
            id: 'least_spent',
            name: '🐜 Smallest Contribution',
            description: 'The ant who carried the least weight',
            icon: '💸',
            selector: () => selectByLeastSpent(),
            getJustification: (player) => {
                const amount = player.totalSpent || 0;
                return `${player.nickname} has the smallest contribution: ${amount.toFixed(2)} ${player.currency || 'USD'}`;
            }
        },
        {
            id: 'least_transactions',
            name: '🐜 Laziest Worker',
            description: 'The ant who made fewest trips',
            icon: '📊',
            selector: () => selectByFewestTransactions(),
            getJustification: (player) => {
                const count = player.transactionCount || 0;
                return `${player.nickname} has made the fewest expenses: ${count} transaction${count !== 1 ? 's' : ''}`;
            }
        },
        {
            id: 'device_owner',
            name: '🐜 Tunnel Owner',
            description: 'The ant who owns this device',
            icon: '📱',
            selector: () => selectDeviceOwner(),
            getJustification: (player) => `${player.nickname} is the owner of this device`
        },
        {
            id: 'group_creator',
            name: '🐜 Queen Ant',
            description: 'The ant who created this colony',
            icon: '👑',
            selector: () => selectGroupCreator(),
            getJustification: (player) => `${player.nickname} created this group (the queen must contribute!)`
        },
        {
            id: 'random_ant',
            name: '🐜 Random Scout',
            description: 'A randomly chosen ant from the colony',
            icon: '🎲',
            selector: () => players[Math.floor(Math.random() * players.length)],
            getJustification: (player) => `${player.nickname} was randomly selected by the colony`
        },
        {
            id: 'alphabetical',
            name: '🐜 First in Line',
            description: 'The ant whose name comes first alphabetically',
            icon: '🔤',
            selector: () => selectAlphabetical(),
            getJustification: (player) => `${player.nickname}'s name comes first in alphabetical order`
        },
        {
            id: 'reverse_alphabetical',
            name: '🐜 Last in Line',
            description: 'The ant whose name comes last alphabetically',
            icon: '🔠',
            selector: () => selectReverseAlphabetical(),
            getJustification: (player) => `${player.nickname}'s name comes last in alphabetical order`
        },
        {
            id: 'longest_name',
            name: '🐜 Longest Name',
            description: 'The ant with the most letters in their name',
            icon: '📝',
            selector: () => selectLongestName(),
            getJustification: (player) => `${player.nickname} has the longest name (${player.nickname.length} characters)`
        },
        {
            id: 'shortest_name',
            name: '🐜 Shortest Name',
            description: 'The ant with the fewest letters in their name',
            icon: '✏️',
            selector: () => selectShortestName(),
            getJustification: (player) => `${player.nickname} has the shortest name (${player.nickname.length} characters)`
        },
        {
            id: 'most_recent',
            name: '🐜 Newest Recruit',
            description: 'The ant who joined the colony most recently',
            icon: '🆕',
            selector: () => selectMostRecentJoin(),
            getJustification: (player) => `${player.nickname} is the newest member of the colony`
        },
        {
            id: 'oldest_member',
            name: '🐜 Veteran Ant',
            description: 'The ant who joined the colony first',
            icon: '⏳',
            selector: () => selectOldestMember(),
            getJustification: (player) => `${player.nickname} is the oldest member of the colony`
        },
        {
            id: 'lucky_number',
            name: '🐜 Lucky Number',
            description: 'Random selection based on colony numbers',
            icon: '🍀',
            selector: () => selectByLuckyNumber(),
            getJustification: (player) => `${player.nickname} was chosen by the colony's lucky number algorithm`
        }
    ];
    
    // Spin the roulette to select a criterion
    const selectedCriterion = await spinCriteriaRoulette(criteria);
    
    // Show selected criterion with more detail
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">${selectedCriterion.icon}</div>
                <h2 style="color: var(--primary);">${selectedCriterion.name}</h2>
                <p style="font-size: 1.2rem; color: var(--text-secondary); margin: 1.5rem 0;">
                    ${selectedCriterion.description}
                </p>
                <div style="padding: 1.5rem; background: rgba(102, 126, 234, 0.1); border-radius: 12px; margin-top: 2rem;">
                    <p style="font-size: 1.1rem;">🐜 The colony has chosen this criterion...</p>
                </div>
                <div class="ant-march" style="margin-top: 2rem;">
                    🐜 Analyzing all members... 🐜
                </div>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Execute the selection
    const selectedPlayer = selectedCriterion.selector();
    const justification = selectedCriterion.getJustification(selectedPlayer);
    
    // Show suspense before revealing
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 6rem; margin-bottom: 1rem;">🤔</div>
                <h2>The colony is deciding...</h2>
                <div class="ant-march" style="margin-top: 2rem; font-size: 3rem;">
                    🐜🐜🐜🐜🐜
                </div>
                <p style="color: var(--text-secondary); margin-top: 2rem; font-size: 1.1rem;">
                    Calculating based on: ${selectedCriterion.name}
                </p>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Show result with clear justification
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🐜</div>
                <h2 style="margin-bottom: 2rem;">Colony Decision!</h2>
                <div style="margin: 2rem 0; padding: 2.5rem; background: rgba(245, 87, 108, 0.15); border: 2px solid #f5576c; border-radius: 16px;">
                    <div style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 1rem;">
                        ${selectedCriterion.icon} ${selectedCriterion.name}
                    </div>
                    <h3 style="font-size: 2.5rem; color: #f5576c; margin: 1.5rem 0;">
                        ${selectedPlayer.nickname}
                    </h3>
                    <div style="padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px; margin-top: 1.5rem;">
                        <p style="font-size: 1.1rem; line-height: 1.6;">
                            ℹ️ <strong>Reason:</strong> ${justification}
                        </p>
                    </div>
                </div>
                <div class="ant-march" style="margin-top: 1rem;">
                    🐜🐜🐜 The colony has spoken! 🐜🐜🐜
                </div>
            </div>
        </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Store justification for final results screen
    challengeState.antPoolJustification = justification;
    challengeState.antPoolCriterion = selectedCriterion.name;
    
    return selectedPlayer;
}

async function spinCriteriaRoulette(criteria) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 2rem;">🐜 Spinning the Colony Wheel...</h2>
                    <div class="criteria-roulette" id="criteriaDisplay">
                        <div style="font-size: 3rem; padding: 2rem;">
                            ${criteria[0].icon}
                        </div>
                    </div>
                    <div class="ant-march" style="margin-top: 2rem;">
                        🐜 🐜 🐜
                    </div>
                </div>
            </div>
        `;
        
        const displayEl = document.getElementById('criteriaDisplay');
        let spinCount = 0;
        const maxSpins = 20;
        
        const spinInterval = setInterval(() => {
            const randomCriterion = criteria[Math.floor(Math.random() * criteria.length)];
            displayEl.innerHTML = `
                <div style="font-size: 3rem; padding: 2rem; animation: pulse 0.3s;">
                    ${randomCriterion.icon}
                </div>
                <p style="font-size: 1.2rem; font-weight: 600;">${randomCriterion.name}</p>
            `;
            spinCount++;
            
            if (spinCount >= maxSpins) {
                clearInterval(spinInterval);
                const finalCriterion = criteria[Math.floor(Math.random() * criteria.length)];
                displayEl.innerHTML = `
                    <div style="font-size: 5rem; padding: 2rem; animation: dice-land 0.5s;">
                        ${finalCriterion.icon}
                    </div>
                    <p style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${finalCriterion.name}</p>
                `;
                setTimeout(() => resolve(finalCriterion), 1000);
            }
        }, 150);
    });
}

function selectByLeastSpent() {
    const players = challengeState.players;
    
    // Calculate total spent per player from group expenses
    if (currentFund && currentFund.expenses) {
        players.forEach(player => {
            let totalSpent = 0;
            let transactionCount = 0;
            
            Object.values(currentFund.expenses).forEach(expense => {
                if (expense.paidBy === player.address) {
                    totalSpent += Math.abs(expense.amount || 0);
                    transactionCount++;
                }
            });
            
            player.totalSpent = totalSpent;
            player.transactionCount = transactionCount;
            player.currency = currentFund.currency || 'USD';
        });
        
        // Sort by total spent (ascending) and return the one with least contribution
        const sorted = [...players].sort((a, b) => (a.totalSpent || 0) - (b.totalSpent || 0));
        return sorted[0];
    }
    
    // Fallback to random if no expense data available
    return players[Math.floor(Math.random() * players.length)];
}

function selectByFewestTransactions() {
    const players = challengeState.players;
    
    // Calculate transaction count per player
    if (currentFund && currentFund.expenses) {
        players.forEach(player => {
            let count = 0;
            let totalSpent = 0;
            
            Object.values(currentFund.expenses).forEach(expense => {
                if (expense.paidBy === player.address) {
                    count++;
                    totalSpent += Math.abs(expense.amount || 0);
                }
            });
            
            player.transactionCount = count;
            player.totalSpent = totalSpent;
            player.currency = currentFund.currency || 'USD';
        });
        
        // Sort by transaction count (ascending)
        const sorted = [...players].sort((a, b) => (a.transactionCount || 0) - (b.transactionCount || 0));
        return sorted[0];
    }
    
    // Fallback to random
    return players[Math.floor(Math.random() * players.length)];
}

function selectDeviceOwner() {
    const players = challengeState.players;
    // Try to find the current user (device owner)
    if (window.currentAccount) {
        const owner = players.find(p => p.address.toLowerCase() === window.currentAccount.toLowerCase());
        if (owner) return owner;
    }
    // Fallback to random
    return players[Math.floor(Math.random() * players.length)];
}

function selectGroupCreator() {
    const players = challengeState.players;
    // In a real implementation, this would check who created the group
    // For now, select first member as placeholder
    return players[0];
}

function selectAlphabetical() {
    const players = challengeState.players;
    const sorted = [...players].sort((a, b) => a.nickname.localeCompare(b.nickname));
    return sorted[0];
}

function selectLongestName() {
    const players = challengeState.players;
    const sorted = [...players].sort((a, b) => b.nickname.length - a.nickname.length);
    return sorted[0];
}

function selectShortestName() {
    const players = challengeState.players;
    const sorted = [...players].sort((a, b) => a.nickname.length - b.nickname.length);
    return sorted[0];
}

function selectReverseAlphabetical() {
    const players = challengeState.players;
    const sorted = [...players].sort((a, b) => b.nickname.localeCompare(a.nickname));
    return sorted[0];
}

function selectMostRecentJoin() {
    const players = challengeState.players;
    
    // Check if we have join date information
    if (currentFund && currentFund.members) {
        players.forEach(player => {
            const memberData = currentFund.members[player.address];
            player.joinedAt = memberData?.joinedAt || Date.now();
        });
        
        // Sort by join date (descending - most recent first)
        const sorted = [...players].sort((a, b) => (b.joinedAt || 0) - (a.joinedAt || 0));
        return sorted[0];
    }
    
    // Fallback to random
    return players[Math.floor(Math.random() * players.length)];
}

function selectOldestMember() {
    const players = challengeState.players;
    
    // Check if we have join date information
    if (currentFund && currentFund.members) {
        players.forEach(player => {
            const memberData = currentFund.members[player.address];
            player.joinedAt = memberData?.joinedAt || Date.now();
        });
        
        // Sort by join date (ascending - oldest first)
        const sorted = [...players].sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0));
        return sorted[0];
    }
    
    // Fallback to random
    return players[Math.floor(Math.random() * players.length)];
}

function selectByLuckyNumber() {
    const players = challengeState.players;
    // Use a pseudo-random selection based on timestamp + player count
    const seed = Date.now() % players.length;
    const luckyIndex = (seed + Math.floor(Math.random() * players.length)) % players.length;
    return players[luckyIndex];
}

// ============================================
// RESULTS DISPLAY
// ============================================

function showResults(scoringType, extraInfo = null) {
    const gameArea = document.getElementById('gamePlayArea');
    
    // Ensure all players have a score entry
    challengeState.players.forEach(player => {
        if (challengeState.scores[player.address] === undefined) {
            // Player didn't finish their turn (shouldn't happen, but just in case)
            challengeState.scores[player.address] = Infinity; // Worst possible score
        }
    });
    
    // Separate eliminated players (negative scores = early clicks) from valid players
    const entries = Object.entries(challengeState.scores);
    const validPlayers = [];
    const eliminatedPlayers = [];
    
    entries.forEach(([addr, score]) => {
        const playerData = {
            player: challengeState.players.find(p => p.address === addr),
            score: score
        };
        
        if (score < 0) {
            // Negative score = eliminated (clicked early)
            // Convert to positive for display (how long they waited before clicking early)
            playerData.score = Math.abs(score);
            playerData.eliminated = true;
            eliminatedPlayers.push(playerData);
        } else {
            validPlayers.push(playerData);
        }
    });
    
    // Sort valid players by score
    validPlayers.sort((a, b) => {
        if (scoringType === 'lower_wins') {
            return a.score - b.score;
        } else {
            return b.score - a.score;
        }
    });
    
    // Sort eliminated players by who waited least (worst first)
    eliminatedPlayers.sort((a, b) => a.score - b.score);
    
    // Combine: valid players first, then eliminated players (worst performers last)
    const sortedPlayers = [...validPlayers, ...eliminatedPlayers];
    
    const winner = sortedPlayers[0];
    const loser = sortedPlayers[sortedPlayers.length - 1];
    
    const gameNames = {
        'quickTap': '⚡ Quick Tap',
        'numberGuess': '🎯 Number Guess',
        'colorMatch': '🎨 Color Match',
        'shakeIt': '📳 Shake It'
    };
    
    const resultsHTML = sortedPlayers.map((item, index) => {
        const isLoser = index === sortedPlayers.length - 1;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : isLoser ? '💸' : '  ';
        
        let scoreDisplay;
        if (item.eliminated) {
            scoreDisplay = `<span style="color: #e74c3c;">ELIMINATED (${item.score.toFixed(0)}ms)</span>`;
        } else if (item.score === Infinity) {
            scoreDisplay = `<span style="color: #888;">Did not play</span>`;
        } else if (challengeState.gameType === 'numberGuess') {
            // For number guess, show: "Guessed X (off by Y)"
            const originalGuess = challengeState.guesses[item.player.address];
            const distance = item.score;
            scoreDisplay = `Guessed ${originalGuess} <span style="color: #888; font-size: 0.85em;">(off by ${distance})</span>`;
        } else if (challengeState.gameType === 'quickTap') {
            scoreDisplay = `${item.score}ms`;
        } else if (challengeState.gameType === 'memoryCards') {
            scoreDisplay = item.score === 999 ? 'Gave Up' : `${item.score.toFixed(1)}s`;
        } else {
            scoreDisplay = `${item.score}`;
        }
        
        return `
            <div class="result-row ${isLoser ? 'loser-row' : ''} ${item.eliminated ? 'eliminated-row' : ''}">
                <span class="result-medal">${medal}</span>
                <span class="result-name">${item.player.nickname}</span>
                <span class="result-score">${scoreDisplay}</span>
            </div>
        `;
    }).join('');
    
    // Generate explanation for why loser was selected
    let explanationText = '';
    if (loser.score === Infinity) {
        explanationText = `<p class="loser-explanation">Did not complete their turn</p>`;
    } else if (loser.eliminated) {
        explanationText = `<p class="loser-explanation">Clicked too early! Only waited ${loser.score.toFixed(0)}ms before the green button appeared.</p>`;
    } else if (challengeState.gameType === 'quickTap') {
        explanationText = `<p class="loser-explanation">Slowest reaction time: ${loser.score}ms</p>`;
    } else if (challengeState.gameType === 'numberGuess') {
        const loserGuess = challengeState.guesses[loser.player.address];
        const loserDistance = loser.score;
        explanationText = `<p class="loser-explanation">Guessed ${loserGuess}, which was ${loserDistance} away from ${extraInfo}</p>`;
    }
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="result-screen">
                <div class="result-icon">🏆</div>
                <h2>Results</h2>
                <h3>${gameNames[challengeState.gameType] || 'Challenge'}</h3>
                ${extraInfo ? `<p class="result-extra-info">Secret number was: ${extraInfo}</p>` : ''}
            </div>
            <div class="results-list">
                ${resultsHTML}
            </div>
            <div class="result-announcement">
                <div class="loser-badge">💸</div>
                <h3>${loser.player.nickname} will pay!</h3>
                ${explanationText}
            </div>
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="startPhysicalGame('${challengeState.gameType}')">
                    🔄 Play Again
                </button>
                <button class="btn btn-primary" onclick="confirmChallengeResult('${loser.player.address}')">
                    Confirm & Create Expense
                </button>
            </div>
        </div>
    `;
}

// ============================================
// CONFIRMATION & EXPENSE CREATION
// ============================================

function showResultsWithTime(mode) {
    const gameArea = document.getElementById('gamePlayArea');
    
    // Get all players with their scores and times
    const playerResults = challengeState.players.map(player => ({
        player,
        score: challengeState.scores[player.address] || 0,
        time: challengeState.times[player.address] || 0
    }));
    
    // Sort by score first, then by time for tiebreaker
    playerResults.sort((a, b) => {
        if (mode === 'higher_wins') {
            if (b.score !== a.score) return b.score - a.score;
            return a.time - b.time; // Lower time is better
        } else {
            if (a.score !== b.score) return a.score - b.score;
            return a.time - b.time; // Lower time is better
        }
    });
    
    const loser = playerResults[playerResults.length - 1];
    const winner = playerResults[0];
    
    // Check for ties at loser position
    const loserScore = loser.score;
    const losersWithSameScore = playerResults.filter(p => p.score === loserScore);
    let tieExplanation = '';
    
    if (losersWithSameScore.length > 1 && loser.time > 0) {
        tieExplanation = `<p class="tie-explanation">🎯 Tied at ${loserScore} correct! Lost by time: ${loser.time.toFixed(1)}s vs ${losersWithSameScore[0].time.toFixed(1)}s</p>`;
    }
    
    const resultsHTML = playerResults.map((item, index) => {
        const isLoser = index === playerResults.length - 1;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : isLoser ? '💸' : '';
        
        return `
            <div class="result-row ${isLoser ? 'loser-row' : ''}">
                <span class="result-medal">${medal}</span>
                <span class="result-name">${item.player.nickname}</span>
                <span class="result-score">${item.score} correct (${item.time.toFixed(1)}s)</span>
            </div>
        `;
    }).join('');
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="result-screen">
                <div class="result-icon">🏆</div>
                <h2>Results</h2>
            </div>
            <div class="results-list">
                ${resultsHTML}
            </div>
            <div class="result-announcement">
                <div class="loser-badge">💸</div>
                <h3>${loser.player.nickname} will pay!</h3>
                ${tieExplanation}
            </div>
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="startPhysicalGame('${challengeState.gameType}')">
                    🔄 Play Again
                </button>
                <button class="btn btn-primary" onclick="confirmChallengeResult('${loser.player.address}')">
                    Confirm & Create Expense
                </button>
            </div>
        </div>
    `;
}

function showResultsWithTiebreaker(mode) {
    const gameArea = document.getElementById('gamePlayArea');
    
    const playerResults = challengeState.players.map(player => ({
        player,
        score: challengeState.scores[player.address] || 0
    }));
    
    // Sort by score
    playerResults.sort((a, b) => {
        if (mode === 'higher_wins') {
            return b.score - a.score;
        } else {
            return a.score - b.score;
        }
    });
    
    // Check for ties at loser position
    let loser;
    const loserScore = playerResults[playerResults.length - 1].score;
    const losersWithSameScore = playerResults.filter(p => p.score === loserScore);
    
    let tieExplanation = '';
    if (losersWithSameScore.length > 1) {
        // Random selection among tied losers
        loser = losersWithSameScore[Math.floor(Math.random() * losersWithSameScore.length)];
        const otherLosers = losersWithSameScore.filter(p => p.player.address !== loser.player.address).map(p => p.player.nickname).join(', ');
        tieExplanation = `<p class="tie-explanation">⚖️ Tied with ${otherLosers} at ${loserScore}. Selected randomly.</p>`;
    } else {
        loser = playerResults[playerResults.length - 1];
    }
    
    const resultsHTML = playerResults.map((item, index) => {
        const isLoser = item.player.address === loser.player.address;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : isLoser ? '💸' : '';
        
        let scoreDisplay = item.score;
        if (challengeState.gameType === 'memoryCards') {
            scoreDisplay = item.score === 999 ? 'Gave Up' : `${item.score.toFixed(1)}s`;
        } else if (challengeState.gameType === 'shakeIt') {
            scoreDisplay = `${item.score} shakes`;
        }
        
        return `
            <div class="result-row ${isLoser ? 'loser-row' : ''}">
                <span class="result-medal">${medal}</span>
                <span class="result-name">${item.player.nickname}</span>
                <span class="result-score">${scoreDisplay}</span>
            </div>
        `;
    }).join('');
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="result-screen">
                <div class="result-icon">🏆</div>
                <h2>Results</h2>
            </div>
            <div class="results-list">
                ${resultsHTML}
            </div>
            <div class="result-announcement">
                <div class="loser-badge">💸</div>
                <h3>${loser.player.nickname} will pay!</h3>
                ${tieExplanation}
            </div>
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="startPhysicalGame('${challengeState.gameType}')">
                    🔄 Play Again
                </button>
                <button class="btn btn-primary" onclick="confirmChallengeResult('${loser.player.address}')">
                    Confirm & Create Expense
                </button>
            </div>
        </div>
    `;
}

function confirmChallengeResult(payerAddress) {
    // Store the payer information
    challengeState.selectedPayer = payerAddress;
    
    // Close challenge modal
    closeChallengeModal();
    
    // Pre-fill the expense form with the selected payer
    prefillExpenseWithChallenge(payerAddress);
}

function prefillExpenseWithChallenge(payerAddress) {
    // Show the expense modal
    showAddExpenseModal();
    
    // Check the payer checkbox
    setTimeout(() => {
        const paidByCheckboxes = document.querySelectorAll('#expensePaidBy input[type="checkbox"]');
        paidByCheckboxes.forEach(cb => {
            if (cb.value === payerAddress) {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });
        
        // Add a visual indicator that this was challenge-selected
        const form = document.getElementById('addExpenseForm');
        if (form && !document.getElementById('challengeIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'challengeIndicator';
            indicator.className = 'challenge-indicator';
            indicator.innerHTML = `
                <div class="challenge-badge">
                    🎮 Challenge Selected: ${getMemberNickname(payerAddress)} will pay
                </div>
            `;
            form.insertBefore(indicator, form.firstChild.nextSibling);
        }
    }, 100);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function closeChallengeModal() {
    const modal = document.getElementById('challengeModeModal');
    if (modal) {
        modal.style.display = 'none';
        resetChallengeState();
    }
}

function resetChallengeState() {
    challengeState = {
        mode: null,
        gameType: null,
        players: [],
        allMembers: [],
        scores: {},
        currentPlayerIndex: 0,
        expenseData: null
    };
    
    // Reset modal views
    document.getElementById('challengeModeSelection').style.display = 'block';
    document.getElementById('playerSelection').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('remoteSelection').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'none';
}

// ============================================
// GAME IMPLEMENTATIONS
// ============================================

// Color Match Game
async function playColorMatch() {
    const colors = [
        { name: 'RED', color: '#FF0000' },
        { name: 'BLUE', color: '#0000FF' },
        { name: 'GREEN', color: '#00FF00' },
        { name: 'YELLOW', color: '#FFFF00' },
        { name: 'PURPLE', color: '#9932CC' },
        { name: 'ORANGE', color: '#FF8C00' }
    ];
    
    challengeState.times = {}; // Track times for tiebreaker
    
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        
        // Show player intro
        await showPlayerIntro(player, 'Color Match', 'Tap the COLOR of the text, not the word!');
        
        let correctAnswers = 0;
        let totalTime = 0;
        const rounds = 5;
        
        for (let round = 0; round < rounds; round++) {
            const wordColor = colors[Math.floor(Math.random() * colors.length)];
            const textColor = colors[Math.floor(Math.random() * colors.length)];
            
            const result = await showColorMatchRound(player, wordColor, textColor, round + 1, rounds);
            if (result.correct) correctAnswers++;
            totalTime += result.time;
        }
        
        challengeState.scores[player.address] = correctAnswers;
        challengeState.times[player.address] = totalTime;
    }
    
    showResultsWithTime('higher_wins');
}

async function showPlayerIntro(player, gameName, instructions) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="player-transition">
                    <div class="player-avatar-large">👤</div>
                    <h2>${player.nickname}'s Turn</h2>
                    <div class="game-name">${gameName}</div>
                    <p class="game-instructions">${instructions}</p>
                    <button class="btn btn-primary" onclick="continueGame()">
                        I'm Ready!
                    </button>
                </div>
            </div>
        `;
        
        window.continueGame = () => {
            resolve();
            window.continueGame = null;
        };
    });
}

async function showColorMatchRound(player, wordColor, textColor, round, totalRounds) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        const startTime = Date.now();
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <h2>${player.nickname} - Round ${round}/${totalRounds}</h2>
                    <p>What COLOR is the text? (Not the word!)</p>
                </div>
                <div class="color-match-word" style="color: ${textColor.color}; font-size: 3rem; font-weight: bold; margin: 2rem 0;">
                    ${wordColor.name}
                </div>
                <div class="color-match-options">
                    ${[
                        { name: 'RED', color: '#FF0000' },
                        { name: 'BLUE', color: '#0000FF' },
                        { name: 'GREEN', color: '#00FF00' },
                        { name: 'YELLOW', color: '#FFFF00' },
                        { name: 'PURPLE', color: '#9932CC' },
                        { name: 'ORANGE', color: '#FF8C00' }
                    ].map(c => `
                        <button class="color-option-btn" 
                                style="background: ${c.color};"
                                onclick="selectColorAnswer('${c.name}', '${textColor.name}', this)">
                            ${c.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        window.colorMatchResolve = (isCorrect) => {
            const time = (Date.now() - startTime) / 1000;
            resolve({ correct: isCorrect, time });
        };
    });
}

function selectColorAnswer(selected, correct, btn) {
    const isCorrect = selected === correct;
    btn.style.opacity = '0.6';
    
    setTimeout(() => {
        if (window.colorMatchResolve) {
            window.colorMatchResolve(isCorrect);
            window.colorMatchResolve = null;
        }
    }, 300);
}

// Shake It Game
async function playShakeIt() {
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        
        // Show player intro
        await showPlayerIntro(player, 'Shake It!', 'Shake your phone as hard as you can!');
        
        const shakeCount = await showShakeItTurn(player);
        challengeState.scores[player.address] = shakeCount;
    }
    
    showResultsWithTiebreaker('higher_wins');
}

async function showShakeItTurn(player) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        let shakeCount = 0;
        let lastTime = Date.now();
        let lastX = 0, lastY = 0, lastZ = 0;
        const shakeDuration = 5000; // 5 seconds
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <h2>${player.nickname}'s Turn</h2>
                    <p>Shake your phone as hard as you can!</p>
                </div>
                <div class="shake-counter">
                    <div class="shake-icon">📳</div>
                    <div class="shake-count" id="shakeCount">0</div>
                    <div class="shake-label">shakes</div>
                </div>
                <div class="shake-timer" id="shakeTimer">5.0s</div>
                <button class="btn btn-primary" id="startShakeBtn" onclick="startShaking()">
                    Start Shaking!
                </button>
            </div>
        `;
        
        window.shakeGameResolve = resolve;
        window.shakeGameData = { shakeCount, shakeDuration, lastTime, lastX, lastY, lastZ };
    });
}

function startShaking() {
    const btn = document.getElementById('startShakeBtn');
    btn.style.display = 'none';
    
    const { shakeDuration } = window.shakeGameData;
    const startTime = Date.now();
    
    const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (shakeDuration - elapsed) / 1000);
        document.getElementById('shakeTimer').textContent = remaining.toFixed(1) + 's';
        
        if (remaining <= 0) {
            clearInterval(timer);
            if (window.deviceMotionHandler) {
                window.removeEventListener('devicemotion', window.deviceMotionHandler);
            }
            if (window.shakeGameResolve) {
                window.shakeGameResolve(window.shakeGameData.shakeCount);
                window.shakeGameResolve = null;
            }
        }
    }, 100);
    
    window.deviceMotionHandler = function(event) {
        const { acceleration } = event;
        if (!acceleration) return;
        
        const currentTime = Date.now();
        const { lastTime, lastX, lastY, lastZ } = window.shakeGameData;
        
        if (currentTime - lastTime > 100) {
            const deltaX = Math.abs(acceleration.x - lastX);
            const deltaY = Math.abs(acceleration.y - lastY);
            const deltaZ = Math.abs(acceleration.z - lastZ);
            
            const totalDelta = deltaX + deltaY + deltaZ;
            
            if (totalDelta > 30) {
                window.shakeGameData.shakeCount++;
                document.getElementById('shakeCount').textContent = window.shakeGameData.shakeCount;
                document.getElementById('shakeCount').style.animation = 'none';
                setTimeout(() => {
                    document.getElementById('shakeCount').style.animation = 'shake-pulse 0.3s';
                }, 10);
            }
            
            window.shakeGameData.lastX = acceleration.x;
            window.shakeGameData.lastY = acceleration.y;
            window.shakeGameData.lastZ = acceleration.z;
            window.shakeGameData.lastTime = currentTime;
        }
    };
    
    window.addEventListener('devicemotion', window.deviceMotionHandler);
}

// Memory Cards Game
async function playMemoryCards() {
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        
        // Show player intro
        await showPlayerIntro(player, 'Memory Cards', 'Find all matching pairs as fast as you can!');
        
        const time = await showMemoryCardsTurn(player);
        challengeState.scores[player.address] = time; // Store time in seconds
    }
    
    showResults('lower_wins'); // Lower time wins (fastest)
}

async function showMemoryCardsTurn(player) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        const emojis = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓'];
        const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <h2>${player.nickname}'s Turn</h2>
                    <p>Find all matching pairs!</p>
                </div>
                <div class="memory-stats">
                    <div class="stat-item">
                        <span class="stat-label">⏱️ Time:</span>
                        <span id="memoryTime" class="stat-value">0.0s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">🎯 Pairs:</span>
                        <span id="memoryPairs" class="stat-value">0/6</span>
                    </div>
                </div>
                <div class="memory-grid">
                    ${cards.map((emoji, idx) => `
                        <div class="memory-card" data-emoji="${emoji}" data-index="${idx}" onclick="flipMemoryCard(this)">
                            <div class="card-front">❓</div>
                            <div class="card-back">${emoji}</div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-secondary" style="margin-top: 1.5rem;" onclick="giveUpMemory()">
                    🏳️ Give Up
                </button>
            </div>
        `;
        
        window.memoryGameData = {
            flipped: [],
            matched: [],
            startTime: Date.now(),
            pairsFound: 0,
            resolve
        };
        
        window.giveUpMemory = () => {
            if (timer) clearInterval(timer);
            const elapsed = 999; // Penalty time for giving up
            resolve(elapsed);
        };
        
        const timer = setInterval(() => {
            const elapsed = (Date.now() - window.memoryGameData.startTime) / 1000;
            document.getElementById('memoryTime').textContent = elapsed.toFixed(1) + 's';
            
            if (window.memoryGameData.pairsFound >= 6) {
                clearInterval(timer);
                setTimeout(() => {
                    resolve(elapsed);
                }, 500);
            }
        }, 100);
    });
}

function flipMemoryCard(card) {
    if (!window.memoryGameData) return;
    const { flipped, matched } = window.memoryGameData;
    
    const index = parseInt(card.dataset.index);
    if (flipped.includes(index) || matched.includes(index) || flipped.length >= 2) return;
    
    card.classList.add('flipped');
    flipped.push(index);
    
    if (flipped.length === 2) {
        const card1 = document.querySelector(`[data-index="${flipped[0]}"]`);
        const card2 = document.querySelector(`[data-index="${flipped[1]}"]`);
        
        if (card1.dataset.emoji === card2.dataset.emoji) {
            matched.push(...flipped);
            window.memoryGameData.pairsFound++;
            document.getElementById('memoryPairs').textContent = `${window.memoryGameData.pairsFound}/6`;
            flipped.length = 0;
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                flipped.length = 0;
            }, 800);
        }
    }
}

// Math Challenge Game
async function playMathChallenge() {
    challengeState.times = {}; // Track times for tiebreaker
    
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        
        // Show player intro
        await showPlayerIntro(player, 'Math Challenge', 'Solve equations as fast as you can!');
        
        let correctAnswers = 0;
        let totalTime = 0;
        const rounds = 5;
        
        for (let round = 0; round < rounds; round++) {
            const result = await showMathChallengeTurn(player, round + 1, rounds);
            if (result.correct) correctAnswers++;
            totalTime += result.time;
        }
        
        challengeState.scores[player.address] = correctAnswers;
        challengeState.times[player.address] = totalTime;
    }
    
    showResultsWithTime('higher_wins');
}

async function showMathChallengeTurn(player, round, totalRounds) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        // Easier math: smaller numbers and simpler operations
        let a = Math.floor(Math.random() * 12) + 1; // 1-12
        let b = Math.floor(Math.random() * 12) + 1; // 1-12
        const ops = ['+', '-', '*'];
        const op = ops[Math.floor(Math.random() * ops.length)];
        let answer;
        
        // Make sure subtraction doesn't result in negative
        if (op === '-' && b > a) {
            const temp = a;
            a = b;
            b = temp;
        }
        
        switch(op) {
            case '+': answer = a + b; break;
            case '-': answer = a - b; break;
            case '*': answer = a * b; break;
        }
        
        const startTime = Date.now();
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <h2>${player.nickname} - Round ${round}/${totalRounds}</h2>
                </div>
                <div class="math-equation">
                    ${a} ${op} ${b} = ?
                </div>
                <input type="number" 
                       id="mathAnswer" 
                       class="form-input" 
                       placeholder="Your answer"
                       autofocus>
                <button class="btn btn-primary" onclick="submitMathAnswer(${answer}, ${startTime})">
                    Submit
                </button>
            </div>
        `;
        
        window.mathChallengeResolve = resolve;
        
        document.getElementById('mathAnswer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitMathAnswer(answer, startTime);
            }
        });
    });
}

function submitMathAnswer(correct, startTime) {
    const userAnswer = parseInt(document.getElementById('mathAnswer').value);
    const time = (Date.now() - startTime) / 1000;
    
    if (window.mathChallengeResolve) {
        window.mathChallengeResolve({
            correct: userAnswer === correct,
            time
        });
        window.mathChallengeResolve = null;
    }
}

// AI Trivia Game (requires OpenAI API)
async function playAITrivia() {
    // Check if OpenAI API key is configured
    const apiKey = localStorage.getItem('openai_api_key');
    
    if (!apiKey) {
        const gameArea = document.getElementById('gamePlayArea');
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="result-screen">
                    <div class="result-icon">⚠️</div>
                    <h2>OpenAI API Required</h2>
                    <p>This game requires an OpenAI API key to generate questions.</p>
                    <p>Please configure your API key in Settings → Configure OpenAI API first.</p>
                    <button class="btn btn-primary" onclick="resetChallengeState()">
                        Go Back
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        let correctAnswers = 0;
        const rounds = 3;
        
        for (let round = 0; round < rounds; round++) {
            const result = await showAITriviaTurn(player, apiKey, round + 1, rounds);
            if (result) correctAnswers++;
        }
        
        challengeState.scores[player.address] = correctAnswers;
    }
    
    showResults('higher_wins');
}

async function showAITriviaTurn(player, apiKey, round, totalRounds) {
    const gameArea = document.getElementById('gamePlayArea');
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="loading-spinner">🤖 Generating question...</div>
        </div>
    `;
    
    try {
        const question = await generateTriviaQuestion(apiKey);
        
        return new Promise((resolve) => {
            gameArea.innerHTML = `
                <div class="game-turn-screen">
                    <div class="game-player-indicator">
                        <h2>${player.nickname} - Round ${round}/${totalRounds}</h2>
                    </div>
                    <div class="trivia-question">
                        <h3>${question.question}</h3>
                    </div>
                    <div class="trivia-options">
                        ${question.options.map((opt, idx) => `
                            <button class="trivia-option-btn" onclick="selectTriviaAnswer(${idx}, ${question.correctIndex})">
                                ${opt}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
            
            window.triviaResolve = resolve;
        });
    } catch (error) {
        console.error('AI Trivia error:', error);
        showToast('Failed to generate question', 'error');
        return false;
    }
}

async function generateTriviaQuestion(apiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: 'Generate a fun trivia question with 4 multiple choice options. Return ONLY a JSON object with this structure: {"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0}. Make it about general knowledge, pop culture, or science.'
            }],
            temperature: 0.8
        })
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
}

function selectTriviaAnswer(selected, correct) {
    const isCorrect = selected === correct;
    
    if (window.triviaResolve) {
        setTimeout(() => {
            window.triviaResolve(isCorrect);
            window.triviaResolve = null;
        }, 500);
    }
}

// ============================================
// NEW GAMES: RHYTHM BATTLE & EMOJI HUNT
// ============================================

// Rhythm Battle Game
async function playRhythmBattle() {
    challengeState.scores = {};
    
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        
        await showPlayerIntro(player, 'Rhythm Battle', 'Watch the pattern and repeat it perfectly!');
        
        const score = await showRhythmBattleTurn(player);
        challengeState.scores[player.address] = score;
    }
    
    showResultsWithTiebreaker('higher_wins');
}

async function showRhythmBattleTurn(player) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        const colors = ['red', 'blue', 'green', 'yellow'];
        const rounds = 5;
        let currentRound = 1;
        let totalScore = 0;
        
        function startRound() {
            if (currentRound > rounds) {
                resolve(totalScore);
                return;
            }
            
            const patternLength = currentRound + 2;
            const pattern = [];
            for (let i = 0; i < patternLength; i++) {
                pattern.push(colors[Math.floor(Math.random() * colors.length)]);
            }
            
            showPattern(pattern);
        }
        
        async function showPattern(pattern) {
            const colorEmojis = {red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡'};
            
            gameArea.innerHTML = `
                <div class="game-turn-screen">
                    <div class="game-player-indicator">
                        <h2>${player.nickname} - Round ${currentRound}/${rounds}</h2>
                        <p>Watch the pattern carefully!</p>
                    </div>
                    <div class="rhythm-display" id="rhythmDisplay">
                        <div style="font-size: 3rem; padding: 2rem;">👀 Watch...</div>
                    </div>
                    <div class="rhythm-buttons" style="opacity: 0.3; pointer-events: none;">
                        ${colors.map(color => `
                            <button class="rhythm-btn rhythm-${color}" data-color="${color}">
                                ${colorEmojis[color]}
                            </button>
                        `).join('')}
                    </div>
                    <div class="rhythm-score">Score: ${totalScore}</div>
                </div>
            `;
            
            for (let i = 0; i < pattern.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 600));
                const btn = document.querySelector(`.rhythm-${pattern[i]}`);
                btn.style.transform = 'scale(1.2)';
                btn.style.boxShadow = '0 0 30px currentColor';
                
                await new Promise(resolve => setTimeout(resolve, 400));
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = '';
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            getPlayerInput(pattern);
        }
        
        function getPlayerInput(pattern) {
            const buttonsDiv = document.querySelector('.rhythm-buttons');
            buttonsDiv.style.opacity = '1';
            buttonsDiv.style.pointerEvents = 'auto';
            
            document.getElementById('rhythmDisplay').innerHTML = `
                <div style="font-size: 2rem; padding: 2rem;">🎵 Repeat the pattern!</div>
            `;
            
            let playerPattern = [];
            
            const buttons = document.querySelectorAll('.rhythm-btn');
            buttons.forEach(btn => {
                btn.onclick = () => {
                    const color = btn.dataset.color;
                    playerPattern.push(color);
                    
                    btn.style.transform = 'scale(1.2)';
                    setTimeout(() => btn.style.transform = 'scale(1)', 200);
                    
                    const currentIndex = playerPattern.length - 1;
                    if (playerPattern[currentIndex] !== pattern[currentIndex]) {
                        showRoundResult(false, pattern, playerPattern);
                        return;
                    }
                    
                    if (playerPattern.length === pattern.length) {
                        totalScore += pattern.length;
                        showRoundResult(true, pattern, playerPattern);
                    }
                };
            });
        }
        
        async function showRoundResult(success, pattern, playerPattern) {
            const colorEmojis = {red: '🔴', blue: '🔵', green: '🟢', yellow: '🟡'};
            const patternStr = pattern.map(c => colorEmojis[c]).join(' ');
            const playerStr = playerPattern.map(c => colorEmojis[c]).join(' ');
            
            gameArea.innerHTML = `
                <div class="game-turn-screen">
                    <div style="font-size: 5rem; margin: 2rem 0;">
                        ${success ? '✅' : '❌'}
                    </div>
                    <h3>${success ? 'Perfect!' : 'Oops!'}</h3>
                    <p>Pattern was: ${patternStr}</p>
                    ${!success ? `<p>You got: ${playerStr}</p>` : ''}
                    <div class="rhythm-score">Total Score: ${totalScore}</div>
                </div>
            `;
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            currentRound++;
            startRound();
        }
        
        startRound();
    });
}

// Emoji Hunt Game
async function playEmojiHunt() {
    challengeState.times = {};
    
    for (let i = 0; i < challengeState.players.length; i++) {
        const player = challengeState.players[i];
        
        await showPlayerIntro(player, 'Emoji Hunt', 'Find all the matching emojis as fast as you can!');
        
        const time = await showEmojiHuntTurn(player);
        challengeState.times[player.address] = time;
    }
    
    showResultsWithTime('lower_wins');
}

async function showEmojiHuntTurn(player) {
    return new Promise((resolve) => {
        const gameArea = document.getElementById('gamePlayArea');
        const allEmojis = ['🍎', '🍌', '🍒', '🍇', '🍊', '🍓', '🥝', '🍑', '🍋', '🍉', 
                           '🍍', '🥥', '🥑', '🍆', '🥕', '🌽', '🥒', '🥦', '🍅', '🥔'];
        const targetEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
        const targetCount = 3 + Math.floor(Math.random() * 3);
        
        const gridSize = 40;
        const emojis = [];
        
        for (let i = 0; i < targetCount; i++) {
            emojis.push({ emoji: targetEmoji, isTarget: true });
        }
        
        while (emojis.length < gridSize) {
            const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
            if (randomEmoji !== targetEmoji || Math.random() < 0.1) {
                emojis.push({ emoji: randomEmoji, isTarget: randomEmoji === targetEmoji });
            }
        }
        
        emojis.sort(() => Math.random() - 0.5);
        
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <div class="game-player-indicator">
                    <h2>${player.nickname}'s Turn</h2>
                    <p>Find all: <span style="font-size: 2rem;">${targetEmoji}</span></p>
                </div>
                <div class="emoji-hunt-stats">
                    <div class="stat-item">
                        <span class="stat-label">⏱️ Time:</span>
                        <span id="emojiTime" class="stat-value">0.0s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">🎯 Found:</span>
                        <span id="emojiFound" class="stat-value">0/${targetCount}</span>
                    </div>
                </div>
                <div class="emoji-hunt-grid">
                    ${emojis.map((item, idx) => `
                        <div class="emoji-cell" data-index="${idx}" data-target="${item.isTarget}" onclick="clickEmojiCell(this)">
                            ${item.emoji}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        window.emojiHuntData = {
            targetCount,
            found: 0,
            startTime: Date.now(),
            resolve
        };
        
        const timer = setInterval(() => {
            if (!window.emojiHuntData) {
                clearInterval(timer);
                return;
            }
            
            const elapsed = (Date.now() - window.emojiHuntData.startTime) / 1000;
            document.getElementById('emojiTime').textContent = elapsed.toFixed(1) + 's';
            
            if (window.emojiHuntData.found >= targetCount) {
                clearInterval(timer);
                setTimeout(() => {
                    resolve(elapsed);
                    window.emojiHuntData = null;
                }, 500);
            }
        }, 100);
    });
}

function clickEmojiCell(cell) {
    if (!window.emojiHuntData || cell.classList.contains('found') || cell.classList.contains('wrong')) return;
    
    const isTarget = cell.dataset.target === 'true';
    
    if (isTarget) {
        cell.classList.add('found');
        cell.style.background = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        cell.style.transform = 'scale(1.2)';
        setTimeout(() => cell.style.transform = 'scale(1)', 200);
        
        window.emojiHuntData.found++;
        document.getElementById('emojiFound').textContent = `${window.emojiHuntData.found}/${window.emojiHuntData.targetCount}`;
    } else {
        cell.classList.add('wrong');
        cell.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
        cell.style.animation = 'shake 0.3s';
        setTimeout(() => {
            cell.style.background = '';
            cell.style.animation = '';
            cell.classList.remove('wrong');
        }, 500);
    }
}

// ============================================
// INITIALIZATION
// ============================================
