# Script para iniciar el entorno de desarrollo completo de TravelFund

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "   TravelFund - Entorno de Desarrollo" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar procesos de Node.js previos
Write-Host "Limpiando procesos previos..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Paso 2: Iniciar nodo de Hardhat en una nueva ventana
Write-Host "Iniciando nodo de Hardhat..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npx hardhat node"
Start-Sleep -Seconds 5

# Paso 3: Desplegar el contrato
Write-Host "Desplegando contrato TravelFund..." -ForegroundColor Yellow
npx hardhat run scripts/deployTravelFund.js --network localhost

# Paso 4: Iniciar servidor frontend en una nueva ventana
Write-Host ""
Write-Host "Iniciando servidor frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run frontend"
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Todo listo!" -ForegroundColor Green
Write-Host ""
Write-Host "   Informacion importante:" -ForegroundColor Cyan
Write-Host "   - Nodo Hardhat: http://127.0.0.1:8545" -ForegroundColor White
Write-Host "   - Frontend: http://localhost:3001" -ForegroundColor White
Write-Host ""
Write-Host "   Pasos siguientes:" -ForegroundColor Cyan
Write-Host "   1. Abre http://localhost:3001 en tu navegador" -ForegroundColor White
Write-Host "   2. Instala MetaMask si aun no lo tienes" -ForegroundColor White
Write-Host "   3. Conecta tu wallet" -ForegroundColor White
Write-Host "   4. Copia la direccion del contrato que se mostro arriba" -ForegroundColor White
Write-Host "   5. Pegala en el campo Direccion del Contrato en la interfaz" -ForegroundColor White
Write-Host ""
Write-Host "   Para detener los servidores, cierra las ventanas de PowerShell" -ForegroundColor Yellow
Write-Host ""
