// Admin Dashboard - Protected Analytics
// Author: Ant Pool Team
// Description: Secure admin-only dashboard with real-time metrics and funnel analysis

// ===== CONFIGURATION =====
let adminDashboardUser = null;
let database = null;
let cachedGroups = null; // Single read, reuse everywhere

// ===== AUTHENTICATION =====
function initAuth() {
    database = firebase.database();

    firebase.auth().onAuthStateChanged(async (user) => {
        adminDashboardUser = user;

        if (!user) {
            window.location.href = 'index.html';
            return;
        }

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
        const snapshot = await database.ref('system/admins/' + uid).once('value');
        return snapshot.exists() && snapshot.val() === true;
    } catch (error) {
        console.error('Error checking admin access:', error);
        return false;
    }
}

function logout() {
    firebase.auth().signOut().then(() => { window.location.href = 'index.html'; });
}

// ===== DASHBOARD INITIALIZATION =====
async function initDashboard() {
    updateLastUpdated();
    setInterval(updateLastUpdated, 60000);

    document.getElementById('refreshBtn').addEventListener('click', () => {
        cachedGroups = null;
        initDashboard();
    });

    // Single read for all groups data
    try {
        const snap = await database.ref('groups').once('value');
        cachedGroups = snap.val() || {};
    } catch (e) {
        console.error('Error loading groups:', e);
        cachedGroups = {};
    }

    // Load all metrics
    const [userData] = await Promise.all([
        loadUserMetrics(),
        loadGroupMetrics(),
        loadTransactionMetrics(),
        loadColonyMetrics(),
        loadFunnelMetrics(),
        loadRecentGroups(),
        loadUserAcquisitionSources()
    ]);

    initCharts(userData);
    setupRealtimeListeners();
}

function updateLastUpdated() {
    const el = document.getElementById('lastUpdated');
    if (el) el.textContent = new Date().toLocaleTimeString();
}

// ===== HELPER =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function timeAgo(timestamp) {
    if (!timestamp) return '-';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    const days = Math.floor(hrs / 24);
    if (days < 30) return days + 'd ago';
    return new Date(timestamp).toLocaleDateString();
}

// ===== USER METRICS =====
async function loadUserMetrics() {
    try {
        const snapshot = await database.ref('users').once('value');
        const users = snapshot.val() || {};
        const userList = Object.entries(users).map(([uid, data]) => ({ uid, ...data }));
        const userCount = userList.length;

        document.getElementById('totalUsers').textContent = userCount.toLocaleString();

        // Active users (7 days)
        const sevenDaysAgo = Date.now() - 7 * 86400000;
        let activeCount = 0;
        userList.forEach(u => {
            if ((u.lastActive && u.lastActive > sevenDaysAgo) || (u.createdAt && u.createdAt > sevenDaysAgo)) activeCount++;
        });
        document.getElementById('activeUsers').textContent = activeCount.toLocaleString();
        document.getElementById('activePercent').textContent = userCount > 0 ? Math.round((activeCount / userCount) * 100) : 0;

        // New users (last 30 days, last 7 days)
        const thirtyDaysAgo = Date.now() - 30 * 86400000;
        let newMonth = 0, newWeek = 0;
        userList.forEach(u => {
            if (u.createdAt && u.createdAt > thirtyDaysAgo) newMonth++;
            if (u.createdAt && u.createdAt > sevenDaysAgo) newWeek++;
        });
        document.getElementById('userGrowthMonth').textContent = newMonth;
        document.getElementById('userGrowthWeek').textContent = newWeek;

        return { total: userCount, active: activeCount, newMonth, newWeek, users: userList };
    } catch (error) {
        console.error('Error loading user metrics:', error);
        return { total: 0, active: 0, newMonth: 0, newWeek: 0, users: [] };
    }
}

// ===== GROUP METRICS =====
async function loadGroupMetrics() {
    try {
        const groups = cachedGroups;
        const entries = Object.entries(groups);
        const groupCount = entries.length;
        document.getElementById('totalGroups').textContent = groupCount.toLocaleString();

        const sevenDaysAgo = Date.now() - 7 * 86400000;
        let newGroups = 0, personalGroups = 0, sharedGroups = 0, activeGroups = 0;

        entries.forEach(([id, g]) => {
            if (g.createdAt && g.createdAt > sevenDaysAgo) newGroups++;
            if (id.startsWith('grp_personal_')) personalGroups++;
            else sharedGroups++;
            const memberCount = g.members ? Object.keys(g.members).length : 0;
            const expenseCount = g.expenses ? Object.keys(g.expenses).length : 0;
            if (memberCount > 0 && expenseCount > 0) activeGroups++;
        });

        document.getElementById('groupGrowth').textContent = newGroups;
        document.getElementById('sharedGroups').textContent = sharedGroups;
        document.getElementById('personalGroups').textContent = personalGroups;
        document.getElementById('activeGroupsCount').textContent = activeGroups;
    } catch (error) {
        console.error('Error loading group metrics:', error);
    }
}

// ===== TRANSACTION METRICS =====
async function loadTransactionMetrics() {
    try {
        const groups = cachedGroups;
        let totalTx = 0, totalVolume = 0, last7dTx = 0, last7dVolume = 0;
        const currencyVolumes = {};
        const sevenDaysAgo = Date.now() - 7 * 86400000;

        Object.entries(groups).forEach(([id, group]) => {
            if (id.startsWith('grp_personal_')) return; // skip personal
            if (group.expenses) {
                Object.values(group.expenses).forEach(exp => {
                    const amount = parseFloat(exp.amount) || 0;
                    totalTx++;
                    totalVolume += amount;
                    const cur = exp.currency || 'USD';
                    currencyVolumes[cur] = (currencyVolumes[cur] || 0) + amount;
                    if (exp.timestamp && exp.timestamp > sevenDaysAgo) {
                        last7dTx++;
                        last7dVolume += amount;
                    }
                });
            }
        });

        document.getElementById('totalTransactions').textContent = totalTx.toLocaleString();
        document.getElementById('transactionVolume').textContent = '$' + totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 });
        document.getElementById('weeklyTx').textContent = last7dTx;
        document.getElementById('weeklyVolume').textContent = '$' + last7dVolume.toLocaleString(undefined, { maximumFractionDigits: 0 });

        // Avg expense
        const avgExpense = totalTx > 0 ? (totalVolume / totalTx) : 0;
        document.getElementById('avgExpense').textContent = '$' + avgExpense.toFixed(2);

        return { totalTx, totalVolume, currencyVolumes };
    } catch (error) {
        console.error('Error loading transaction metrics:', error);
        return { totalTx: 0, totalVolume: 0, currencyVolumes: {} };
    }
}

// ===== COLONY METRICS =====
async function loadColonyMetrics() {
    try {
        const groups = cachedGroups;
        let activeColonies = 0, totalChests = 0;
        const stateCount = { forming: 0, active: 0, stable: 0, consolidated: 0 };

        Object.values(groups).forEach(group => {
            if (group.colonySystem) {
                activeColonies++;
                totalChests += group.colonySystem.chestsOpened || 0;
                const state = group.colonySystem.state || 'forming';
                if (stateCount[state] !== undefined) stateCount[state]++;
            }
        });

        document.getElementById('activeColonies').textContent = activeColonies;
        document.getElementById('colonyChests').textContent = totalChests;
        document.getElementById('colonyForming').textContent = stateCount.forming;
        document.getElementById('colonyActive').textContent = stateCount.active;
        document.getElementById('colonyStable').textContent = stateCount.stable;
        document.getElementById('colonyConsolidated').textContent = stateCount.consolidated;
    } catch (error) {
        console.error('Error loading colony metrics:', error);
    }
}

// ===== FUNNEL METRICS =====
async function loadFunnelMetrics() {
    try {
        const snap = await database.ref('users').once('value');
        const users = snap.val() || {};
        const groups = cachedGroups;
        const userList = Object.values(users);

        // Total registered
        const totalRegistered = userList.length;

        // Users with at least 1 shared group
        let usersWithGroup = 0;
        let usersWithExpense = 0;
        let usersWithMultipleGroups = 0;

        Object.entries(users).forEach(([uid, userData]) => {
            if (!userData.groups) return;
            const userGroups = Object.keys(userData.groups).filter(gid => !gid.startsWith('grp_personal_'));
            if (userGroups.length > 0) usersWithGroup++;
            if (userGroups.length > 1) usersWithMultipleGroups++;

            // Check if user has added expenses in any shared group
            let hasExpense = false;
            userGroups.forEach(gid => {
                const group = groups[gid];
                if (group && group.expenses) {
                    Object.values(group.expenses).forEach(exp => {
                        if (exp.paidBy === uid || exp.createdBy === uid) hasExpense = true;
                    });
                }
            });
            if (hasExpense) usersWithExpense++;
        });

        // Activation rates
        const groupRate = totalRegistered > 0 ? Math.round((usersWithGroup / totalRegistered) * 100) : 0;
        const expenseRate = totalRegistered > 0 ? Math.round((usersWithExpense / totalRegistered) * 100) : 0;
        const multiGroupRate = totalRegistered > 0 ? Math.round((usersWithMultipleGroups / totalRegistered) * 100) : 0;

        document.getElementById('funnelRegistered').textContent = totalRegistered;
        document.getElementById('funnelWithGroup').textContent = usersWithGroup;
        document.getElementById('funnelGroupRate').textContent = groupRate + '%';
        document.getElementById('funnelWithExpense').textContent = usersWithExpense;
        document.getElementById('funnelExpenseRate').textContent = expenseRate + '%';
        document.getElementById('funnelMultiGroup').textContent = usersWithMultipleGroups;
        document.getElementById('funnelMultiGroupRate').textContent = multiGroupRate + '%';

        // Funnel bar widths
        document.getElementById('funnelBarRegistered').style.width = '100%';
        document.getElementById('funnelBarGroup').style.width = groupRate + '%';
        document.getElementById('funnelBarExpense').style.width = expenseRate + '%';
        document.getElementById('funnelBarMulti').style.width = multiGroupRate + '%';
    } catch (error) {
        console.error('Error loading funnel metrics:', error);
    }
}

// ===== USER ACQUISITION SOURCES =====
async function loadUserAcquisitionSources() {
    try {
        const snap = await database.ref('users').once('value');
        const users = snap.val() || {};
        const sources = {};

        Object.values(users).forEach(u => {
            const src = u.signupSource || 'unknown';
            sources[src] = (sources[src] || 0) + 1;
        });

        const tbody = document.getElementById('acquisitionTable');
        if (!tbody) return;
        tbody.innerHTML = '';

        const sorted = Object.entries(sources).sort((a, b) => b[1] - a[1]);
        const total = Object.values(sources).reduce((s, v) => s + v, 0);

        sorted.forEach(([src, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${escapeHtml(src)}</strong></td>
                <td>${count}</td>
                <td>
                    <div style="display:flex;align-items:center;gap:0.5rem;">
                        <div style="flex:1;background:#e2e8f0;border-radius:4px;height:8px;overflow:hidden;">
                            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#667eea,#764ba2);border-radius:4px;"></div>
                        </div>
                        <span style="font-weight:600;min-width:3ch;">${pct}%</span>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        if (sorted.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:#94a3b8;">No acquisition data yet. UTM tracking just enabled.</td></tr>';
        }
    } catch (error) {
        console.error('Error loading acquisition sources:', error);
    }
}

// ===== RECENT GROUPS TABLE =====
async function loadRecentGroups() {
    try {
        const groups = cachedGroups;
        const groupArray = Object.entries(groups)
            .filter(([id]) => !id.startsWith('grp_personal_'))
            .map(([id, group]) => ({ id, ...group }));

        groupArray.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        const recentGroups = groupArray.slice(0, 15);

        const tbody = document.getElementById('recentGroupsTable');
        tbody.innerHTML = '';

        for (const group of recentGroups) {
            const row = document.createElement('tr');
            const memberCount = group.members ? Object.keys(group.members).length : 0;
            const expenseCount = group.expenses ? Object.keys(group.expenses).length : 0;
            const totalVolume = group.expenses ? Object.values(group.expenses).reduce((s, e) => s + (parseFloat(e.amount) || 0), 0) : 0;
            const currency = group.currency || 'USD';
            const createdDate = group.createdAt ? timeAgo(group.createdAt) : '-';
            const hasActivity = expenseCount > 0;
            const colonyState = group.colonySystem?.state || '-';

            row.innerHTML = `
                <td><strong>${escapeHtml(group.name || 'Unnamed')}</strong></td>
                <td>${memberCount}</td>
                <td>${expenseCount}</td>
                <td>${currency} ${totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td><span class="colony-badge ${colonyState}">${colonyState}</span></td>
                <td><span class="badge ${hasActivity ? 'active' : 'inactive'}">${hasActivity ? 'Active' : 'Empty'}</span></td>
                <td>${createdDate}</td>
            `;
            tbody.appendChild(row);
        }

        if (recentGroups.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:2rem;color:#94a3b8;">No groups found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading recent groups:', error);
    }
}

// ===== CHARTS =====
let charts = {};

async function initCharts(userData) {
    await Promise.all([
        createUserGrowthChart(userData),
        createTransactionChart(),
        createCurrencyChart(),
        createGroupSizeChart(),
        createExpenseTimelineChart()
    ]);
}

async function createUserGrowthChart(userData) {
    try {
        const users = (userData && userData.users) || [];
        const days = 30;
        const labels = [];
        const dailyData = [];
        const cumulativeData = [];

        // Sort users by createdAt for cumulative
        const sortedUsers = users.filter(u => u.createdAt).sort((a, b) => a.createdAt - b.createdAt);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dayStart = date.getTime();
            const dayEnd = dayStart + 86400000;

            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            let count = 0;
            sortedUsers.forEach(u => { if (u.createdAt >= dayStart && u.createdAt < dayEnd) count++; });
            dailyData.push(count);

            // Cumulative
            let cum = 0;
            sortedUsers.forEach(u => { if (u.createdAt < dayEnd) cum++; });
            cumulativeData.push(cum);
        }

        const ctx = document.getElementById('userGrowthChart').getContext('2d');
        charts.userGrowth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'New Users',
                        data: dailyData,
                        backgroundColor: 'rgba(102, 126, 234, 0.7)',
                        borderRadius: 4,
                        order: 2
                    },
                    {
                        label: 'Total Users',
                        data: cumulativeData,
                        type: 'line',
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2,
                        yAxisID: 'y1',
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Daily' } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Cumulative' } }
                }
            }
        });
    } catch (error) { console.error('Chart error:', error); }
}

async function createTransactionChart() {
    try {
        const groups = cachedGroups;
        const days = 14;
        const labels = [];
        const countData = [];
        const volumeData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dayStart = date.getTime();
            const dayEnd = dayStart + 86400000;

            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

            let count = 0, vol = 0;
            Object.entries(groups).forEach(([id, g]) => {
                if (id.startsWith('grp_personal_')) return;
                if (g.expenses) {
                    Object.values(g.expenses).forEach(exp => {
                        if (exp.timestamp >= dayStart && exp.timestamp < dayEnd) {
                            count++;
                            vol += parseFloat(exp.amount) || 0;
                        }
                    });
                }
            });
            countData.push(count);
            volumeData.push(vol);
        }

        const ctx = document.getElementById('transactionChart').getContext('2d');
        charts.transaction = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Expenses',
                        data: countData,
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderRadius: 4
                    },
                    {
                        label: 'Volume ($)',
                        data: volumeData,
                        type: 'line',
                        borderColor: '#ef4444',
                        borderWidth: 2,
                        pointRadius: 2,
                        tension: 0.3,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: 'index' },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Count' } },
                    y1: { beginAtZero: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Volume ($)' } }
                }
            }
        });
    } catch (error) { console.error('Chart error:', error); }
}

async function createCurrencyChart() {
    try {
        const groups = cachedGroups;
        const currencyVolumes = {};
        Object.entries(groups).forEach(([id, g]) => {
            if (id.startsWith('grp_personal_')) return;
            if (g.expenses) {
                Object.values(g.expenses).forEach(exp => {
                    const cur = exp.currency || 'USD';
                    currencyVolumes[cur] = (currencyVolumes[cur] || 0) + (parseFloat(exp.amount) || 0);
                });
            }
        });

        const sorted = Object.entries(currencyVolumes).sort((a, b) => b[1] - a[1]);
        const labels = sorted.map(([k]) => k);
        const data = sorted.map(([, v]) => v);
        const colors = ['#667eea', '#764ba2', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

        const ctx = document.getElementById('currencyChart').getContext('2d');
        charts.currency = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 2, borderColor: '#fff' }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    } catch (error) { console.error('Chart error:', error); }
}

async function createGroupSizeChart() {
    try {
        const groups = cachedGroups;
        const sizes = { '1': 0, '2': 0, '3-4': 0, '5-7': 0, '8+': 0 };

        Object.entries(groups).forEach(([id, g]) => {
            if (id.startsWith('grp_personal_')) return;
            const m = g.members ? Object.keys(g.members).length : 0;
            if (m <= 1) sizes['1']++;
            else if (m === 2) sizes['2']++;
            else if (m <= 4) sizes['3-4']++;
            else if (m <= 7) sizes['5-7']++;
            else sizes['8+']++;
        });

        const ctx = document.getElementById('groupSizeChart').getContext('2d');
        charts.groupSize = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(sizes).map(k => k + ' members'),
                datasets: [{
                    label: 'Groups',
                    data: Object.values(sizes),
                    backgroundColor: ['#94a3b8', '#667eea', '#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 6
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
        });
    } catch (error) { console.error('Chart error:', error); }
}

async function createExpenseTimelineChart() {
    try {
        const groups = cachedGroups;
        // Hourly distribution (what hour do users add expenses)
        const hourly = new Array(24).fill(0);

        Object.entries(groups).forEach(([id, g]) => {
            if (id.startsWith('grp_personal_')) return;
            if (g.expenses) {
                Object.values(g.expenses).forEach(exp => {
                    if (exp.timestamp) {
                        const h = new Date(exp.timestamp).getHours();
                        hourly[h]++;
                    }
                });
            }
        });

        const labels = hourly.map((_, i) => i.toString().padStart(2, '0') + ':00');
        const ctx = document.getElementById('expenseTimeChart').getContext('2d');
        charts.expenseTime = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Expenses by Hour',
                    data: hourly,
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
            }
        });
    } catch (error) { console.error('Chart error:', error); }
}

// ===== REAL-TIME LISTENERS =====
function setupRealtimeListeners() {
    database.ref('users').on('child_added', () => {
        setTimeout(() => loadUserMetrics(), 2000);
    });
    database.ref('groups').on('child_changed', () => {
        setTimeout(async () => {
            const snap = await database.ref('groups').once('value');
            cachedGroups = snap.val() || {};
            loadGroupMetrics();
            loadTransactionMetrics();
            loadRecentGroups();
        }, 2000);
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    database = firebase.database();
    initAuth();
});
