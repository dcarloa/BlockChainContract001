// ============================================
// COLONY SYSTEM - Quick Testing Script
// ============================================
// Copy and paste this into browser console for quick testing

console.log('🐜 Colony System Test Suite Loaded');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Helper: Get current group ID from URL or current context
function getCurrentGroupId() {
    // Try from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlGroupId = urlParams.get('fund');
    if (urlGroupId) return urlGroupId;
    
    // Try from global context
    if (window.currentFund && window.currentFund.fundAddress) {
        return window.currentFund.fundAddress;
    }
    
    console.error('❌ No group ID found. Please navigate to a group first.');
    return null;
}

// Test 1: Check System Status
async function testSystemStatus() {
    console.log('\n📋 Test 1: System Status');
    console.log('─────────────────────────');
    
    console.log('✓ ColonySystem loaded:', typeof ColonySystem !== 'undefined');
    console.log('✓ Feature enabled:', window.COLONY_FEATURE_ENABLED);
    console.log('✓ Firebase initialized:', typeof firebase !== 'undefined');
    console.log('✓ User authenticated:', firebase.auth().currentUser !== null);
    
    if (firebase.auth().currentUser) {
        console.log('  User ID:', firebase.auth().currentUser.uid);
    }
}

// Test 2: Check Current Group Colony
async function testCurrentGroupColony() {
    console.log('\n📋 Test 2: Current Group Colony');
    console.log('─────────────────────────────────');
    
    const groupId = getCurrentGroupId();
    if (!groupId) return;
    
    console.log('Group ID:', groupId);
    
    try {
        const colonyData = await ColonySystem.getColonyData(groupId);
        console.log('Colony Data:', colonyData);
        
        if (colonyData) {
            console.log('  State:', colonyData.state);
            console.log('  Consecutive Weeks:', colonyData.consecutiveActiveWeeks || 0);
            console.log('  Total Activity:', colonyData.totalActivity || 0);
        } else {
            console.log('⚠️ No colony data yet - group needs activity');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Test 3: Check Weekly Chests
async function testWeeklyChests() {
    console.log('\n📋 Test 3: Weekly Chests');
    console.log('─────────────────────────');
    
    const groupId = getCurrentGroupId();
    if (!groupId) return;
    
    const weekId = ColonySystem.getCurrentWeekId();
    console.log('Current Week:', weekId);
    
    try {
        const chest = await ColonySystem.getWeeklyChest(groupId, weekId);
        console.log('Weekly Chest:', chest);
        
        if (chest) {
            console.log('  State:', chest.state);
            console.log('  Is Opened:', chest.isOpened);
            console.log('  Description:', chest.description);
        } else {
            console.log('⚠️ No chest for current week');
        }
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Test 4: Create Test Chest
async function testCreateChest(state = 'active') {
    console.log(`\n📋 Test 4: Create Test Chest (${state})`);
    console.log('─────────────────────────────────────');
    
    const groupId = getCurrentGroupId();
    if (!groupId) return;
    
    try {
        const chest = await ColonySystem.createTestChest(groupId, state);
        console.log('✅ Test chest created:', chest);
        console.log('💡 Reload the page to see the banner');
        
        return chest;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Test 5: Trigger Weekly Evaluation
async function testWeeklyEvaluation(forceRecreate = false) {
    console.log('\n📋 Test 5: Trigger Weekly Evaluation');
    console.log('──────────────────────────────────────');
    
    try {
        console.log('⏳ Triggering evaluation...');
        const result = await ColonySystem.triggerWeeklyEvaluation(forceRecreate);
        console.log('✅ Evaluation complete:', result);
        console.log(`  Groups evaluated: ${result.groupsEvaluated}`);
        console.log(`  Chests created: ${result.chestsCreated}`);
        console.log(`  Week ID: ${result.weekId}`);
        
        if (result.results && result.results.length > 0) {
            console.log('\nDetailed Results:');
            result.results.forEach((r, i) => {
                console.log(`  ${i+1}. ${r.groupId}: ${r.status}`, r);
            });
        }
        
        return result;
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Test 6: Visual Rendering Test
async function testVisualRendering() {
    console.log('\n📋 Test 6: Visual Rendering');
    console.log('─────────────────────────────');
    
    const states = ['forming', 'active', 'stable', 'consolidated'];
    
    console.log('Creating test visuals for all states...');
    
    for (const state of states) {
        const svg = ColonySystem.renderColonyVisual(state, 80);
        console.log(`✓ ${state}:`, svg ? 'Rendered' : 'Failed');
    }
}

// Run All Tests
async function runAllTests() {
    console.clear();
    console.log('🐜 COLONY SYSTEM - COMPLETE TEST SUITE');
    console.log('═══════════════════════════════════════');
    
    await testSystemStatus();
    await testCurrentGroupColony();
    await testWeeklyChests();
    await testVisualRendering();
    
    console.log('\n✅ All tests complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 Available Commands:');
    console.log('  testSystemStatus()       - Check if system is loaded');
    console.log('  testCurrentGroupColony() - View current group colony');
    console.log('  testWeeklyChests()       - Check weekly chests');
    console.log('  testCreateChest(state)   - Create test chest');
    console.log('  testWeeklyEvaluation()   - Trigger manual evaluation');
    console.log('  testVisualRendering()    - Test SVG rendering');
    console.log('  runAllTests()            - Run all tests');
}

// Quick Commands
window.colonyTest = {
    status: testSystemStatus,
    colony: testCurrentGroupColony,
    chests: testWeeklyChests,
    create: testCreateChest,
    evaluate: testWeeklyEvaluation,
    visuals: testVisualRendering,
    all: runAllTests
};

console.log('\n💡 Quick Commands Available:');
console.log('  colonyTest.status()           - System status');
console.log('  colonyTest.colony()           - Current colony');
console.log('  colonyTest.chests()           - Weekly chests');
console.log('  colonyTest.create("active")   - Create test chest');
console.log('  colonyTest.evaluate()         - Trigger evaluation');
console.log('  colonyTest.all()              - Run all tests');
console.log('\nOr run individual functions listed above.');
