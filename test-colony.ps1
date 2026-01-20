# 🐜 Colonia Viva - Quick Test Script
# Run this script to quickly test the colony system locally

param(
    [switch]$Deploy,
    [switch]$DeployFunctions,
    [switch]$DeployAll,
    [switch]$Logs,
    [switch]$Test
)

$ErrorActionPreference = "Stop"

Write-Host "Ant Pool - Colonia Viva Test Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
Set-Location $PSScriptRoot

# Function to check if Firebase is logged in
function Test-FirebaseAuth {
    $result = firebase projects:list 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Not logged in to Firebase. Run: firebase login" -ForegroundColor Red
        exit 1
    }
}

# Deploy hosting only
if ($Deploy) {
    Write-Host "Deploying frontend to Firebase Hosting..." -ForegroundColor Yellow
    Test-FirebaseAuth
    firebase deploy --only hosting
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment complete!" -ForegroundColor Green
        Write-Host "Visit: https://blockchaincontract001.web.app" -ForegroundColor Cyan
    }
    exit
}

# Deploy functions only
if ($DeployFunctions) {
    Write-Host "Deploying Cloud Functions..." -ForegroundColor Yellow
    Test-FirebaseAuth
    firebase deploy --only functions
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Functions deployed!" -ForegroundColor Green
    }
    exit
}

# Deploy everything
if ($DeployAll) {
    Write-Host "Deploying everything (hosting, database, functions)..." -ForegroundColor Yellow
    Test-FirebaseAuth
    firebase deploy --only "hosting,database,functions"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Full deployment complete!" -ForegroundColor Green
        Write-Host "Visit: https://blockchaincontract001.web.app" -ForegroundColor Cyan
    }
    exit
}

# View function logs
if ($Logs) {
    Write-Host "Viewing Cloud Function logs..." -ForegroundColor Yellow
    Test-FirebaseAuth
    firebase functions:log --limit 50
    exit
}

# Run tests
if ($Test) {
    Write-Host "Opening browser for testing..." -ForegroundColor Yellow
    Start-Process "https://blockchaincontract001.web.app"
    
    Write-Host ""
    Write-Host "Test Instructions:" -ForegroundColor Cyan
    Write-Host "1. Sign in to the app" -ForegroundColor White
    Write-Host "2. Create or open a Simple Mode group" -ForegroundColor White
    Write-Host "3. Open browser console (F12)" -ForegroundColor White
    Write-Host "4. Run test commands:" -ForegroundColor White
    Write-Host ""
    Write-Host "   // Create test chest" -ForegroundColor Gray
    Write-Host "   await ColonySystem.createTestChest(currentFund.fundAddress, 'active')" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   // Run all tests" -ForegroundColor Gray
    Write-Host "   colonyTest.all()" -ForegroundColor Yellow
    Write-Host ""
    exit
}

# No parameters - show help
Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "  .\test-colony.ps1 -Deploy          Deploy frontend only" -ForegroundColor White
Write-Host "  .\test-colony.ps1 -DeployFunctions Deploy functions only" -ForegroundColor White
Write-Host "  .\test-colony.ps1 -DeployAll       Deploy everything" -ForegroundColor White
Write-Host "  .\test-colony.ps1 -Logs            View function logs" -ForegroundColor White
Write-Host "  .\test-colony.ps1 -Test            Open browser for testing" -ForegroundColor White
Write-Host ""
Write-Host "Examples:" -ForegroundColor Yellow
Write-Host "  .\test-colony.ps1 -Deploy" -ForegroundColor Gray
Write-Host "  .\test-colony.ps1 -DeployAll" -ForegroundColor Gray
Write-Host "  .\test-colony.ps1 -Logs" -ForegroundColor Gray
Write-Host ""
Write-Host "Quick Testing:" -ForegroundColor Cyan
Write-Host "1. Run: .\test-colony.ps1 -Test" -ForegroundColor White
Write-Host "2. Sign in to the app" -ForegroundColor White
Write-Host "3. Open a group and check for colony visual" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  COLONY_SYSTEM.md           - Feature documentation" -ForegroundColor White
Write-Host "  COLONY_TESTING_GUIDE.md    - Testing guide" -ForegroundColor White
Write-Host "  COLONY_COMMANDS.md         - Command reference" -ForegroundColor White
Write-Host "  COLONY_DEPLOYMENT_SUMMARY.md - Deployment summary" -ForegroundColor White
Write-Host ""
