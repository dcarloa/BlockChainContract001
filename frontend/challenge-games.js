// ============================================
// CHALLENGE GAMES SYSTEM
// Party mode for deciding who pays expenses
// ============================================

let challengeState = {
    mode: null, // 'physical' or 'remote'
    gameType: null,
    players: [],
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
    challengeState.players = getCurrentFundMembers();
    
    if (mode === 'physical') {
        showGameSelection();
    } else {
        showRemoteOptions();
    }
}

function getCurrentFundMembers() {
    // Get current fund members
    if (!currentFund || !currentFund.members) return [];
    
    // Convert members object to array
    const membersArray = Object.entries(currentFund.members).map(([uid, memberData]) => {
        return {
            address: uid,
            nickname: memberData.name || memberData.email || 'Member'
        };
    });
    
    return membersArray;
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

function showGameSelection() {
    document.getElementById('challengeModeSelection').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
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
                    <p>Tap the button as fast as you can when it turns green!</p>
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

function startQuickTapRound(playerAddress) {
    const gameArea = document.getElementById('gamePlayArea');
    
    gameArea.innerHTML = `
        <div class="game-turn-screen">
            <div class="quick-tap-waiting">
                <div class="pulse-indicator"></div>
                <p>WAIT FOR GREEN...</p>
            </div>
        </div>
    `;
    
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    
    setTimeout(() => {
        quickTapStartTime = Date.now();
        gameArea.innerHTML = `
            <div class="game-turn-screen">
                <button class="quick-tap-button" onclick="recordQuickTapTime('${playerAddress}')">
                    🟢 TAP NOW!
                </button>
            </div>
        `;
    }, delay);
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
    
    for (let i = 0; i < challengeState.players.length; i++) {
        challengeState.currentPlayerIndex = i;
        const player = challengeState.players[i];
        
        await showNumberGuessTurn(player, secretNumber);
    }
    
    // Calculate distances from secret number
    for (let playerAddr in challengeState.scores) {
        const guess = challengeState.scores[playerAddr];
        challengeState.scores[playerAddr] = Math.abs(guess - secretNumber);
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
                    <h3>🎯 Guess the Number</h3>
                    <p>I'm thinking of a number between 1 and 100...</p>
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
            <div class="spinner-wheel-container">
                <div class="spinner-wheel" id="spinnerWheel"></div>
            </div>
            <div class="spinner-status">Spinning...</div>
        </div>
    `;
    
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
    }
    
    showRemoteResult(selectedPlayer, method);
}

async function spinTheWheel(preselected = null) {
    return new Promise((resolve) => {
        const wheel = document.getElementById('spinnerWheel');
        const players = challengeState.players;
        
        // Create wheel segments
        players.forEach((player, index) => {
            const segment = document.createElement('div');
            segment.className = 'wheel-segment';
            segment.textContent = player.nickname;
            segment.style.transform = `rotate(${(360 / players.length) * index}deg)`;
            wheel.appendChild(segment);
        });
        
        // Spin animation
        wheel.style.animation = 'spin 3s ease-out';
        
        setTimeout(() => {
            const selected = preselected || players[Math.floor(Math.random() * players.length)];
            resolve(selected);
        }, 3000);
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
        'balance': 'Balance-Based'
    };
    
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
            </div>
            <div class="result-actions">
                <button class="btn btn-secondary" onclick="executeRemoteSelection('${method}')">
                    🔄 Spin Again
                </button>
                <button class="btn btn-primary" onclick="confirmChallengeResult('${player.address}')">
                    Confirm & Create Expense
                </button>
            </div>
        </div>
    `;
}

// ============================================
// RESULTS DISPLAY
// ============================================

function showResults(scoringType, extraInfo = null) {
    const gameArea = document.getElementById('gamePlayArea');
    
    // Sort scores
    const sortedPlayers = Object.entries(challengeState.scores)
        .map(([addr, score]) => ({
            player: challengeState.players.find(p => p.address === addr),
            score: score
        }))
        .sort((a, b) => {
            if (scoringType === 'lower_wins') {
                return a.score - b.score;
            } else {
                return b.score - a.score;
            }
        });
    
    const winner = sortedPlayers[0];
    const loser = sortedPlayers[sortedPlayers.length - 1];
    
    const gameNames = {
        'quickTap': '⚡ Quick Tap',
        'numberGuess': '🎯 Number Guess',
        'colorMatch': '🎨 Color Match',
        'shakeIt': '📳 Shake It'
    };
    
    const resultsHTML = sortedPlayers.map((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index === sortedPlayers.length - 1 ? '💸' : '  ';
        return `
            <div class="result-row ${index === sortedPlayers.length - 1 ? 'loser-row' : ''}">
                <span class="result-medal">${medal}</span>
                <span class="result-name">${item.player.nickname}</span>
                <span class="result-score">${item.score}${challengeState.gameType === 'quickTap' ? 'ms' : ''}</span>
            </div>
        `;
    }).join('');
    
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
        scores: {},
        currentPlayerIndex: 0,
        expenseData: null
    };
    
    // Reset modal views
    document.getElementById('challengeModeSelection').style.display = 'block';
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('remoteSelection').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'none';
}

// ============================================
// INITIALIZATION
// ============================================

console.log('✅ Challenge Games System loaded');
