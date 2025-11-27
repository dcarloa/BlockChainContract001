const hre = require("hardhat");

async function main() {
    console.log("");
    console.log("🏭 =======================================");
    console.log("   FundFactory - Despliegue");
    console.log("=======================================");
    console.log("");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📝 Desplegando con la cuenta:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH");
    console.log("");

    // Desplegar FundFactory
    console.log("🚀 Desplegando FundFactory...");
    const FundFactory = await hre.ethers.getContractFactory("FundFactory");
    const factory = await FundFactory.deploy();
    
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    
    console.log("✅ FundFactory desplegado en:", factoryAddress);
    console.log("");

    // Guardar información del factory
    const factoryInfo = {
        address: factoryAddress,
        network: "localhost",
        chainId: "31337",
        deployedAt: new Date().toISOString(),
        deployer: deployer.address
    };

    const fs = require("fs");
    fs.writeFileSync(
        "frontend/factory-info.json",
        JSON.stringify(factoryInfo, null, 2)
    );

    console.log("📁 Información guardada en: frontend/factory-info.json");
    console.log("");
    console.log("=============================================================");
    console.log("✨ FACTORY DESPLEGADO - LISTO PARA CREAR FONDOS");
    console.log("=============================================================");
    console.log("");
    console.log("📋 Información del Factory:");
    console.log("   Dirección:", factoryAddress);
    console.log("   Deployer:", deployer.address);
    console.log("   Red: Hardhat Local (Chain ID: 31337)");
    console.log("");
    console.log("💡 PRÓXIMOS PASOS:");
    console.log("");
    console.log("1. 🌐 Abrir la interfaz web:");
    console.log("   http://localhost:3001/");
    console.log("");
    console.log("2. 🔗 Conectar MetaMask:");
    console.log("   - Asegúrate de estar en 'Hardhat Local'");
    console.log("   - Usa cualquier cuenta de prueba");
    console.log("");
    console.log("3. 👤 Establecer tu nickname:");
    console.log("   - Al conectar por primera vez, se te pedirá un nickname");
    console.log("   - Este nickname será global para todos tus fondos");
    console.log("");
    console.log("4. ➕ Crear tu primer fondo:");
    console.log("   - Click en 'Crear Nuevo Fondo'");
    console.log("   - Elige el tipo: Viaje, Ahorro, Cuenta Compartida");
    console.log("   - Define nombre, meta y configuración");
    console.log("");
    console.log("5. 🎉 ¡Comienza a usar tu fondo!");
    console.log("   - Invita amigos");
    console.log("   - Deposita fondos");
    console.log("   - Crea propuestas");
    console.log("");
    console.log("─────────────────────────────────────────────────────────────");
    console.log("🎯 Cada usuario puede crear fondos ilimitados!");
    console.log("─────────────────────────────────────────────────────────────");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
