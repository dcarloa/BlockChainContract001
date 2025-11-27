const hre = require("hardhat");

async function main() {
    console.log("");
    console.log("🚀 =======================================");
    console.log("   TravelFundV2 - Despliegue Limpio");
    console.log("=======================================");
    console.log("");

    // Obtener la cuenta que despliega
    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Desplegando con la cuenta:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("");

    // Generar un ID único para el fondo
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const fundId = `TF-${timestamp}-${randomSuffix}`;

    // Configuración del fondo - USUARIO DEBE CAMBIAR ESTO
    const tripName = "Mi Fondo de Viaje";
    const description = "Fondo compartido para gastos del viaje";
    const targetAmount = hre.ethers.parseEther("10"); // Meta: 10 ETH
    const isPrivate = true; // true = requiere invitación, false = público
    const approvalPercentage = 60; // 60% de votos a favor para aprobar
    const minimumVotes = 2; // Mínimo 2 votos para ejecutar

    console.log("⚙️  Configuración del fondo:");
    console.log("   Fund ID:", fundId);
    console.log("   Nombre del viaje:", tripName);
    console.log("   Descripción:", description);
    console.log("   Meta:", hre.ethers.formatEther(targetAmount), "ETH");
    console.log("   Privado:", isPrivate ? "Sí" : "No");
    console.log("   Porcentaje de aprobación:", approvalPercentage + "%");
    console.log("   Mínimo de votos:", minimumVotes);
    console.log("");

    // Desplegar el contrato
    console.log("🚀 Desplegando contrato TravelFundV2...");
    const TravelFundV2 = await hre.ethers.getContractFactory("TravelFundV2");
    const travelFund = await TravelFundV2.deploy(
        fundId,
        tripName,
        description,
        targetAmount,
        isPrivate,
        approvalPercentage,
        minimumVotes
    );

    await travelFund.waitForDeployment();
    const contractAddress = await travelFund.getAddress();

    console.log("✅ TravelFundV2 desplegado en:", contractAddress);
    console.log("");

    // Guardar la información del contrato
    const fs = require('fs');
    const contractInfo = {
        address: contractAddress,
        fundId: fundId,
        tripName: tripName,
        description: description,
        targetAmount: hre.ethers.formatEther(targetAmount),
        isPrivate: isPrivate,
        approvalPercentage: approvalPercentage,
        minimumVotes: minimumVotes,
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployedAt: new Date().toISOString(),
        deployer: deployer.address
    };

    fs.writeFileSync(
        'frontend/contract-info.json',
        JSON.stringify(contractInfo, null, 2)
    );

    console.log("📁 Información guardada en: frontend/contract-info.json");
    console.log("");

    console.log("=============================================================");
    console.log("✨ CONTRATO DESPLEGADO - LISTO PARA USAR");
    console.log("=============================================================");
    console.log("");
    console.log("📋 Información del fondo:");
    console.log("   Fund ID:", fundId);
    console.log("   Nombre:", tripName);
    console.log("   Creador:", deployer.address);
    console.log("   Estado: 🟢 Activo");
    console.log("   Tipo:", isPrivate ? "🔒 Privado" : "🌐 Público");
    console.log("");
    console.log("💰 Finanzas:");
    console.log("   Meta:", hre.ethers.formatEther(targetAmount), "ETH");
    console.log("   Balance actual: 0.0 ETH");
    console.log("   Progreso: 0%");
    console.log("");
    console.log("👥 Contribuyentes: 0");
    console.log("📊 Propuestas: 0");
    console.log("");
    console.log("⚙️  Configuración:");
    console.log("   Aprobación requerida:", approvalPercentage + "%");
    console.log("   Votos mínimos:", minimumVotes);
    console.log("");
    console.log("");
    console.log("💡 PRÓXIMOS PASOS:");
    console.log("");
    console.log("1. 🌐 Abrir la interfaz web:");
    console.log("   http://localhost:3001/index-v2.html");
    console.log("");
    console.log("2. 🔗 Conectar MetaMask:");
    console.log("   - Seleccionar red 'Hardhat Local'");
    console.log("   - Usar la cuenta:", deployer.address);
    console.log("");
    console.log("3. 👤 Establecer tu nickname:");
    console.log("   - Serás el creador del fondo");
    console.log("   - Elige un alias único (ej: 'Juan', 'Maria', etc.)");
    console.log("");
    console.log("4. 💵 Depositar fondos:");
    console.log("   - Haz tu primer depósito");
    console.log("   - Esto te convierte en contribuyente activo");
    console.log("");
    console.log("5. 🎫 Invitar amigos:", isPrivate ? "(Requerido - Fondo Privado)" : "(Opcional - Fondo Público)");
    console.log("   - Usa la pestaña 'Invite'");
    console.log("   - Invita por nickname o dirección");
    console.log("   - Ellos deben aceptar la invitación");
    console.log("");
    console.log("6. 📝 Crear propuestas:");
    console.log("   - Define gastos del viaje");
    console.log("   - Los miembros votarán");
    console.log("");
    console.log("─────────────────────────────────────────────────────────────");
    console.log("🎉 ¡Comienza tu fondo de viaje desde cero!");
    console.log("─────────────────────────────────────────────────────────────");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
