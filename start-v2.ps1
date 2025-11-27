# ============================================
# TRAVELFUND V2 - INICIO RÁPIDO
# ============================================

Write-Host ""
Write-Host "🚀 ========================================" -ForegroundColor Cyan
Write-Host "   TravelFund V2 - Inicio Rápido" -ForegroundColor Cyan
Write-Host "   ========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Node.js esté instalado
Write-Host "✓ Verificando Node.js..." -ForegroundColor Yellow
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Error: Node.js no está instalado" -ForegroundColor Red
    Write-Host "   Descarga desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}
Write-Host "   Node.js: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Verificar que las dependencias estén instaladas
Write-Host "✓ Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}
Write-Host "   ✓ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# Compilar contratos
Write-Host "✓ Compilando contratos..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error compilando contratos" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Contratos compilados" -ForegroundColor Green
Write-Host ""

# Verificar si la red local está corriendo
Write-Host "✓ Verificando red local..." -ForegroundColor Yellow
$networkRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8545" -Method POST -Body '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' -ContentType "application/json" -TimeoutSec 2 -ErrorAction Stop
    $networkRunning = $true
    Write-Host "   ✓ Red local ya está corriendo" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Red local no detectada, iniciando..." -ForegroundColor Yellow
}

if (-not $networkRunning) {
    # Iniciar red local en una nueva ventana
    Write-Host "   Iniciando Hardhat Network..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🔗 Hardhat Network' -ForegroundColor Cyan; npx hardhat node"
    Write-Host "   ⏳ Esperando que la red inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Write-Host "   ✓ Red local iniciada" -ForegroundColor Green
}
Write-Host ""

# Desplegar contrato V2
Write-Host "✓ Desplegando TravelFundV2 (vacio)..." -ForegroundColor Yellow
npx hardhat run scripts/deployTravelFundV2Clean.js --network localhost
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error desplegando contrato" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Verificar si el servidor frontend está corriendo
Write-Host "✓ Verificando servidor frontend..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 2 -ErrorAction Stop
    $serverRunning = $true
    Write-Host "   ✓ Servidor ya está corriendo" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Servidor no detectado, iniciando..." -ForegroundColor Yellow
}

if (-not $serverRunning) {
    # Iniciar servidor en una nueva ventana
    Write-Host "   Iniciando servidor frontend..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '🌐 Frontend Server' -ForegroundColor Cyan; node scripts/server.js"
    Write-Host "   ⏳ Esperando que el servidor inicie..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Write-Host "   ✓ Servidor frontend iniciado" -ForegroundColor Green
}
Write-Host ""

# Abrir navegador
Write-Host "✓ Abriendo navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process "http://localhost:3001/index-v2.html"
Write-Host "   ✓ Aplicación abierta en el navegador" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✨ TravelFund V2 está listo!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PASOS SIGUIENTES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 🦊 Configura MetaMask:" -ForegroundColor White
Write-Host "   - Red: Hardhat Local" -ForegroundColor Gray
Write-Host "   - RPC URL: http://127.0.0.1:8545" -ForegroundColor Gray
Write-Host "   - Chain ID: 31337" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🔑 Importa una cuenta de prueba:" -ForegroundColor White
Write-Host "   - Clave privada: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor Gray
Write-Host "   (Esta es la cuenta #0 de Hardhat con 10,000 ETH de prueba)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🎯 Usa la aplicación:" -ForegroundColor White
Write-Host "   ✓ Conecta tu wallet" -ForegroundColor Gray
Write-Host "   ✓ Establece tu nickname" -ForegroundColor Gray
Write-Host "   ✓ Invita amigos (usa sus nicknames)" -ForegroundColor Gray
Write-Host "   ✓ Deposita fondos" -ForegroundColor Gray
Write-Host "   ✓ Crea propuestas" -ForegroundColor Gray
Write-Host "   ✓ Vota y ejecuta" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 RECURSOS:" -ForegroundColor Yellow
Write-Host "   • Frontend: http://localhost:3001/index-v2.html" -ForegroundColor Gray
Write-Host "   • Guía completa: docs/GuiaDetallada.txt" -ForegroundColor Gray
Write-Host "   • Auditoría de seguridad: docs/SecurityAudit.txt" -ForegroundColor Gray
Write-Host ""
Write-Host "⚡ Para detener los servicios:" -ForegroundColor Yellow
Write-Host "   Cierra las ventanas de PowerShell que se abrieron" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
