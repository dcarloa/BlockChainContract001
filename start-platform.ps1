# =====================================================
# TRAVELFUND PLATFORM - START SCRIPT
# Plataforma Multi-Fondo con Factory Pattern
# =====================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TRAVELFUND PLATFORM - INICIO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === PASO 1: Verificar dependencias ===
Write-Host "► Paso 1: Verificando dependencias..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "  ⚠️  node_modules no encontrado. Instalando dependencias..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
}

Write-Host "  ✓ Dependencias verificadas" -ForegroundColor Green
Write-Host ""

# === PASO 2: Detener procesos anteriores ===
Write-Host "► Paso 2: Limpiando procesos anteriores..." -ForegroundColor Yellow

# Detener Hardhat Node (puerto 8545)
$hardhatProcess = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($hardhatProcess) {
    Stop-Process -Id $hardhatProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Proceso Hardhat anterior detenido" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

# Detener Express Server (puerto 3001)
$serverProcess = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($serverProcess) {
    Stop-Process -Id $serverProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Servidor anterior detenido" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host "  ✓ Procesos limpiados" -ForegroundColor Green
Write-Host ""

# === PASO 3: Compilar contratos ===
Write-Host "► Paso 3: Compilando contratos inteligentes..." -ForegroundColor Yellow

npx hardhat clean | Out-Null
npx hardhat compile

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Error al compilar contratos" -ForegroundColor Red
    exit 1
}

Write-Host "  ✓ Contratos compilados exitosamente" -ForegroundColor Green
Write-Host ""

# === PASO 4: Iniciar Hardhat Node ===
Write-Host "► Paso 4: Iniciando red blockchain local..." -ForegroundColor Yellow

$hardhatJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npx hardhat node
}

# Esperar a que Hardhat Node esté listo
Write-Host "  ⏳ Esperando que la red se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar que el puerto 8545 esté escuchando
$maxAttempts = 10
$attempt = 0
$hardhatReady = $false

while ($attempt -lt $maxAttempts -and -not $hardhatReady) {
    $attempt++
    $connection = Get-NetTCPConnection -LocalPort 8545 -ErrorAction SilentlyContinue
    if ($connection) {
        $hardhatReady = $true
        Write-Host "  ✓ Red blockchain lista en http://127.0.0.1:8545" -ForegroundColor Green
    } else {
        Write-Host "  ⏳ Intento $attempt/$maxAttempts..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $hardhatReady) {
    Write-Host "  ❌ Error: No se pudo iniciar Hardhat Node" -ForegroundColor Red
    Stop-Job -Job $hardhatJob
    Remove-Job -Job $hardhatJob
    exit 1
}

Write-Host ""

# === PASO 5: Desplegar FundFactory ===
Write-Host "► Paso 5: Desplegando FundFactory..." -ForegroundColor Yellow

npx hardhat run scripts/deployFactory.js --network localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ Error al desplegar FundFactory" -ForegroundColor Red
    Stop-Job -Job $hardhatJob
    Remove-Job -Job $hardhatJob
    exit 1
}

Write-Host "  ✓ FundFactory desplegado correctamente" -ForegroundColor Green
Write-Host ""

# === PASO 6: Iniciar servidor web ===
Write-Host "► Paso 6: Iniciando servidor web..." -ForegroundColor Yellow

$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node scripts/server.js
}

# Esperar a que el servidor esté listo
Write-Host "  ⏳ Esperando que el servidor se inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Verificar que el puerto 3001 esté escuchando
$maxAttempts = 10
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    $connection = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
    if ($connection) {
        $serverReady = $true
        Write-Host "  ✓ Servidor web listo en http://localhost:3001" -ForegroundColor Green
    } else {
        Write-Host "  ⏳ Intento $attempt/$maxAttempts..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $serverReady) {
    Write-Host "  ❌ Error: No se pudo iniciar el servidor web" -ForegroundColor Red
    Stop-Job -Job $hardhatJob
    Stop-Job -Job $serverJob
    Remove-Job -Job $hardhatJob
    Remove-Job -Job $serverJob
    exit 1
}

Write-Host ""

# === PASO 7: Abrir navegador ===
Write-Host "► Paso 7: Abriendo navegador..." -ForegroundColor Yellow
Start-Sleep -Seconds 1
Start-Process "http://localhost:3001/"
Write-Host "  ✓ Navegador abierto" -ForegroundColor Green
Write-Host ""

# === INFORMACIÓN FINAL ===
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ PLATAFORMA INICIADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 INFORMACIÓN DEL SISTEMA:" -ForegroundColor Cyan
Write-Host "  • Red Blockchain:  http://127.0.0.1:8545" -ForegroundColor White
Write-Host "  • Chain ID:        31337" -ForegroundColor White
Write-Host "  • Interfaz Web:    http://localhost:3001/" -ForegroundColor White
Write-Host ""
Write-Host "🔧 CONFIGURACIÓN DE METAMASK:" -ForegroundColor Cyan
Write-Host "  • Nombre:          Hardhat Local" -ForegroundColor White
Write-Host "  • RPC URL:         http://127.0.0.1:8545" -ForegroundColor White
Write-Host "  • Chain ID:        31337" -ForegroundColor White
Write-Host "  • Símbolo:         ETH" -ForegroundColor White
Write-Host ""
Write-Host "👥 CUENTAS DE PRUEBA (primeras 4):" -ForegroundColor Cyan
Write-Host "  Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" -ForegroundColor White
Write-Host "  Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor White
Write-Host "  Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" -ForegroundColor White
Write-Host "  Account #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906" -ForegroundColor White
Write-Host ""
Write-Host "💡 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "  1. Conecta MetaMask con una cuenta de prueba" -ForegroundColor White
Write-Host "  2. Establece tu nickname único" -ForegroundColor White
Write-Host "  3. Crea tu primer fondo de cualquier tipo" -ForegroundColor White
Write-Host "  4. Invita a amigos y comienza a gestionar fondos" -ForegroundColor White
Write-Host ""
Write-Host "📚 CARACTERÍSTICAS DE LA PLATAFORMA:" -ForegroundColor Cyan
Write-Host "  ✓ Fondos ilimitados por usuario" -ForegroundColor Green
Write-Host "  ✓ Sistema de nicknames global" -ForegroundColor Green
Write-Host "  ✓ Invitaciones para fondos privados" -ForegroundColor Green
Write-Host "  ✓ Propuestas y votación democrática" -ForegroundColor Green
Write-Host "  ✓ Dashboard con todos tus fondos" -ForegroundColor Green
Write-Host "  ✓ Navegación SPA sin recargar página" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  PARA DETENER LA PLATAFORMA:" -ForegroundColor Yellow
Write-Host "  Presiona Ctrl+C en esta ventana" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# === MANTENER PROCESOS ACTIVOS ===
Write-Host "⏳ Plataforma en ejecución. Presiona Ctrl+C para detener..." -ForegroundColor Yellow
Write-Host ""

try {
    # Esperar indefinidamente hasta que el usuario presione Ctrl+C
    while ($true) {
        Start-Sleep -Seconds 1
        
        # Verificar que los procesos sigan activos
        if ($hardhatJob.State -ne 'Running') {
            Write-Host "⚠️  Hardhat Node se detuvo inesperadamente" -ForegroundColor Red
            break
        }
        if ($serverJob.State -ne 'Running') {
            Write-Host "⚠️  Servidor web se detuvo inesperadamente" -ForegroundColor Red
            break
        }
    }
} finally {
    # Limpiar procesos al salir
    Write-Host ""
    Write-Host "► Deteniendo plataforma..." -ForegroundColor Yellow
    
    Stop-Job -Job $hardhatJob -ErrorAction SilentlyContinue
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $hardhatJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
    
    Write-Host "  ✓ Plataforma detenida" -ForegroundColor Green
    Write-Host ""
    Write-Host "Hasta pronto!" -ForegroundColor Cyan
}
