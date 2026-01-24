// Admin Dashboard - Protected Analytics
// Author: Ant Pool Team
// Description: Secure admin-only dashboard with real-time metrics

// ===== CONFIGURATION =====
const ADMIN_UIDS = [
    // Add your admin UIDs here
    // Example: 'abcd1234efgh5678ijkl',
];

// Auto-add current user as admin if no admins configured
let adminDashboardUser = null;
let database = null;

// ===== AUTHENTICATION =====
function initAuth() {
    firebase.auth().onAuthStateChanged(async (user) => {
        adminDashboardUser = user;
        
        if (!user) {
            // Not logged in - redirect to main app
            window.location.href = 'index.html';
            return;
        }

        // Check if user is admin
        const isAdmin = await checkAdminAccess(user.uid);
        
        if (isAdmin) {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('dashboardContent').style.display = 'block';
            initDashboard();
        } else {
            document.getElementById('loadingScreen').style.display = 'none';
            document.getElementById('accessDenied').style.display = 'block';
        }
    });
}

async function checkAdminAccess(uid) {
    try {
        // Check hardcoded admins
        if (ADMIN_UIDS.includes(uid)) {
            return true;
        }

        // Check Firebase admins list
        const adminRef = database.ref('system/admins/' + uid);
        const snapshot = await adminRef.once('value');
        
        if (snapshot.exists() && snapshot.val() === true) {
            return true;
        }

        // Auto-grant admin if no admins configured
        if (ADMIN_UIDS.length === 0) {
            const adminsRef = database.ref('system/admins');
            const adminsSnapshot = await adminsRef.once('value');
            
            if (!adminsSnapshot.exists()) {
                // First user becomes admin
                await database.ref('system/admins/' + uid).set(true);
                console.log('First admin created:', uid);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
    }
}

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'index.html';
    });
}

// ===== DASHBOARD INITIALIZATION =====
async function initDashboard() {
    database = firebase.database();
    
    // Update last updated time
    updateLastUpdated();
    setInterval(updateLastUpdated, 60000); // Every minute

    // Load all metrics
    await Promise.all([
        loadUserMetrics(),
        loadGroupMetrics(),
        loadTransactionMetrics(),
        loadColonyMetrics(),
        loadMascotMetrics(),
        loadRecentGroups()
    ]);

    // Initialize charts
    initCharts();

    // Set up real-time listeners
    setupRealtimeListeners();
}

function updateLastUpdated() {
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
}

// ===== USER METRICS =====
async function loadUserMetrics() {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val() || {};
        
        const userCount = Object.keys(users).length;
        document.getElementById('totalUsers').textContent = userCount.toLocaleString();

        // Active users (last 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        let activeCount = 0;

        Object.values(users).forEach(user => {
            if (user.lastActive && user.lastActive > sevenDaysAgo) {
                activeCount++;
            }
        });

        document.getElementById('activeUsers').textContent = activeCount.toLocaleString();
        const activePercent = userCount > 0 ? Math.round((activeCount / userCount) * 100) : 0;
        document.getElementById('activePercent').textContent = activePercent;

        // User growth (last 30 days)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        let newUsers = 0;

        Object.values(users).forEach(user => {
            if (user.createdAt && user.createdAt > thirtyDaysAgo) {
                newUsers++;
            }
        });

        document.getElementById('userGrowth').textContent = newUsers.toLocaleString();

        return { total: userCount, active: activeCount, newUsers };
    } catch (error) {
        console.error('Error loading user metrics:', error);
        return { total: 0, active: 0, newUsers: 0 };
    }
}

// ===== GROUP METRICS =====
async function loadGroupMetrics() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};
        
        const groupCount = Object.keys(groups).length;
        document.getElementById('totalGroups').textContent = groupCount.toLocaleString();

        // Group growth (last 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        let newGroups = 0;

        Object.values(groups).forEach(group => {
            if (group.createdAt && group.createdAt > sevenDaysAgo) {
                newGroups++;
            }
        });

        document.getElementById('groupGrowth').textContent = newGroups.toLocaleString();

        return { total: groupCount, newGroups, groups };
    } catch (error) {
        console.error('Error loading group metrics:', error);
        return { total: 0, newGroups: 0, groups: {} };
    }
}

// ===== TRANSACTION METRICS =====
async function loadTransactionMetrics() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};
        
        let totalTransactions = 0;
        let totalVolume = 0;
        const currencyVolumes = {};

        Object.values(groups).forEach(group => {
            if (group.expenses) {
                const expenses = Object.values(group.expenses);
                totalTransactions += expenses.length;

                expenses.forEach(expense => {
                    const amount = parseFloat(expense.amount) || 0;
                    totalVolume += amount;

                    const currency = expense.currency || 'USD';
                    currencyVolumes[currency] = (currencyVolumes[currency] || 0) + amount;
                });
            }
        });

        document.getElementById('totalTransactions').textContent = totalTransactions.toLocaleString();
        document.getElementById('transactionVolume').textContent = totalVolume.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });

        return { total: totalTransactions, volume: totalVolume, currencyVolumes };
    } catch (error) {
        console.error('Error loading transaction metrics:', error);
        return { total: 0, volume: 0, currencyVolumes: {} };
    }
}

// ===== COLONY METRICS =====
async function loadColonyMetrics() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};
        
        let activeColonies = 0;
        let totalChests = 0;

        Object.values(groups).forEach(group => {
            if (group.colonySystem) {
                activeColonies++;
                totalChests += group.colonySystem.chestsOpened || 0;
            }
        });

        document.getElementById('activeColonies').textContent = activeColonies.toLocaleString();
        document.getElementById('colonyChests').textContent = totalChests.toLocaleString();

        return { active: activeColonies, chests: totalChests };
    } catch (error) {
        console.error('Error loading colony metrics:', error);
        return { active: 0, chests: 0 };
    }
}

// ===== MASCOT METRICS =====
async function loadMascotMetrics() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};
        
        let activeMascots = 0;
        let totalLevels = 0;

        Object.values(groups).forEach(group => {
            if (group.mascotSystem) {
                activeMascots++;
                totalLevels += group.mascotSystem.level || 1;
            }
        });

        const avgLevel = activeMascots > 0 ? Math.round(totalLevels / activeMascots) : 0;

        document.getElementById('activeMascots').textContent = activeMascots.toLocaleString();
        document.getElementById('mascotLevels').textContent = avgLevel.toLocaleString();

        return { active: activeMascots, avgLevel };
    } catch (error) {
        console.error('Error loading mascot metrics:', error);
        return { active: 0, avgLevel: 0 };
    }
}

// ===== RECENT GROUPS TABLE =====
async function loadRecentGroups() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};
        
        // Convert to array and sort by creation date
        const groupArray = Object.entries(groups).map(([id, group]) => ({
            id,
            ...group
        }));

        groupArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // Take top 10
        const recentGroups = groupArray.slice(0, 10);

        // Render table
        const tbody = document.getElementById('recentGroupsTable');
        tbody.innerHTML = '';

        for (const group of recentGroups) {
            const row = document.createElement('tr');
            
            const memberCount = group.members ? Object.keys(group.members).length : 0;
            const expenseCount = group.expenses ? Object.keys(group.expenses).length : 0;
            const createdDate = group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '-';
            const isActive = group.lastActivity && (Date.now() - group.lastActivity < 7 * 24 * 60 * 60 * 1000);

            row.innerHTML = `
                <td><strong>${escapeHtml(group.name || 'Unnamed Group')}</strong></td>
                <td>${escapeHtml(group.createdBy || '-')}</td>
                <td>${memberCount}</td>
                <td>${expenseCount}</td>
                <td><span class="badge ${isActive ? 'active' : 'inactive'}">${isActive ? 'Active' : 'Inactive'}</span></td>
                <td>${createdDate}</td>
            `;
            
            tbody.appendChild(row);
        }

        if (recentGroups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #94a3b8;">No groups found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading recent groups:', error);
        document.getElementById('recentGroupsTable').innerHTML = 
            '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #ef4444;">Error loading groups</td></tr>';
    }
}

// ===== CHARTS =====
let charts = {};

async function initCharts() {
    await Promise.all([
        createUserGrowthChart(),
        createTransactionChart(),
        createCurrencyChart(),
        createGroupTypeChart()
    ]);
}

async function createUserGrowthChart() {
    try {
        const usersRef = database.ref('users');
        const snapshot = await usersRef.once('value');
        const users = snapshot.val() || {};

        // Last 30 days
        const days = 30;
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            const dayStart = date.getTime();
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            
            let count = 0;
            Object.values(users).forEach(user => {
                if (user.createdAt >= dayStart && user.createdAt < dayEnd) {
                    count++;
                }
            });
            
            data.push(count);
        }

        const ctx = document.getElementById('userGrowthChart').getContext('2d');
        charts.userGrowth = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'New Users',
                    data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating user growth chart:', error);
    }
}

async function createTransactionChart() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};

        // Last 7 days
        const days = 7;
        const labels = [];
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            const dayStart = date.getTime();
            const dayEnd = dayStart + (24 * 60 * 60 * 1000);
            
            let volume = 0;
            Object.values(groups).forEach(group => {
                if (group.expenses) {
                    Object.values(group.expenses).forEach(expense => {
                        if (expense.timestamp >= dayStart && expense.timestamp < dayEnd) {
                            volume += parseFloat(expense.amount) || 0;
                        }
                    });
                }
            });
            
            data.push(volume);
        }

        const ctx = document.getElementById('transactionChart').getContext('2d');
        charts.transaction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Transaction Volume',
                    data,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: '#f59e0b',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating transaction chart:', error);
    }
}

async function createCurrencyChart() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};

        const currencyVolumes = {};

        Object.values(groups).forEach(group => {
            if (group.expenses) {
                Object.values(group.expenses).forEach(expense => {
                    const currency = expense.currency || 'USD';
                    const amount = parseFloat(expense.amount) || 0;
                    currencyVolumes[currency] = (currencyVolumes[currency] || 0) + amount;
                });
            }
        });

        const labels = Object.keys(currencyVolumes);
        const data = Object.values(currencyVolumes);
        const colors = [
            '#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', 
            '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'
        ];

        const ctx = document.getElementById('currencyChart').getContext('2d');
        charts.currency = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating currency chart:', error);
    }
}

async function createGroupTypeChart() {
    try {
        const groupsRef = database.ref('groups');
        const snapshot = await groupsRef.once('value');
        const groups = snapshot.val() || {};

        let withColony = 0;
        let withMascot = 0;
        let withBoth = 0;
        let withNeither = 0;

        Object.values(groups).forEach(group => {
            const hasColony = !!group.colonySystem;
            const hasMascot = !!group.mascotSystem;

            if (hasColony && hasMascot) {
                withBoth++;
            } else if (hasColony) {
                withColony++;
            } else if (hasMascot) {
                withMascot++;
            } else {
                withNeither++;
            }
        });

        const ctx = document.getElementById('groupTypeChart').getContext('2d');
        charts.groupType = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Colony + Mascot', 'Colony Only', 'Mascot Only', 'Neither'],
                datasets: [{
                    data: [withBoth, withColony, withMascot, withNeither],
                    backgroundColor: ['#10b981', '#667eea', '#f59e0b', '#94a3b8'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error creating group type chart:', error);
    }
}

// ===== REAL-TIME LISTENERS =====
function setupRealtimeListeners() {
    // Listen for new users
    database.ref('users').on('child_added', () => {
        setTimeout(() => loadUserMetrics(), 1000);
    });

    // Listen for new groups
    database.ref('groups').on('child_added', () => {
        setTimeout(() => {
            loadGroupMetrics();
            loadRecentGroups();
        }, 1000);
    });
}

// ===== UTILITIES =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    initAuth();
});
