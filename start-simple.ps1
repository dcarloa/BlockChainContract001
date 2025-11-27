# Script simplificado - Todo en una terminal
# Este script ejecuta Hardhat node, despliega TravelFundV2 y inicia el frontend

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  TravelFund V2 - Inicio Simplificado" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "[ERROR] Node.js no esta instalado" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js detectado: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Compilar contratos
Write-Host "Compilando contratos..." -ForegroundColor Yellow
npx hardhat compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error compilando contratos" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Contratos compilados" -ForegroundColor Green
Write-Host ""

# Limpiar procesos previos
Write-Host "Limpiando procesos previos..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Iniciar nodo en background
Write-Host "Iniciando red local de Hardhat..." -ForegroundColor Yellow
$nodeJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx hardhat node
}

# Esperar a que el nodo este listo
Write-Host "Esperando a que la red inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "[OK] Red local lista" -ForegroundColor Green
Write-Host ""

# Desplegar contrato V2
Write-Host "Desplegando TravelFundV2 (vacio - sin datos precargados)..." -ForegroundColor Yellow
Write-Host ""
npx hardhat run scripts/deployTravelFundV2Clean.js --network localhost

# Verificar que el despliegue fue exitoso
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Error desplegando contrato" -ForegroundColor Red
    Stop-Job -Job $nodeJob -ErrorAction SilentlyContinue
    Remove-Job -Job $nodeJob -ErrorAction SilentlyContinue
    exit 1
}
Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "[OK] TravelFundV2 desplegado exitosamente" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Iniciar servidor frontend
Write-Host "Iniciando servidor frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "[WEB] Aplicacion disponible en: http://localhost:3001/index-v2.html" -ForegroundColor Cyan
Write-Host ""
Write-Host "[METAMASK] CONFIGURACION:" -ForegroundColor Yellow
Write-Host "   Red: Hardhat Local" -ForegroundColor White
Write-Host "   RPC: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "   Chain ID: 31337" -ForegroundColor White
Write-Host ""
Write-Host "[CUENTA] PRUEBA #0 (Alice):" -ForegroundColor Yellow
Write-Host "   Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Presiona Ctrl+C para detener todos los servicios" -ForegroundColor Yellow
Write-Host ""

# Abrir navegador después de 2 segundos
Start-Sleep -Seconds 2
Start-Process "http://localhost:3001/index-v2.html"

# Ejecutar frontend en foreground (se puede detener con Ctrl+C)
try {
    node scripts/server.js
} finally {
    Write-Host ""
    Write-Host "Deteniendo servicios..." -ForegroundColor Yellow
    Stop-Job -Job $nodeJob -ErrorAction SilentlyContinue
    Remove-Job -Job $nodeJob -ErrorAction SilentlyContinue
    Write-Host "[OK] Servicios detenidos." -ForegroundColor Green
    Write-Host ""
}
