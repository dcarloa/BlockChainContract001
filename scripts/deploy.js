async function main() {
  console.log("🚀 Desplegando contratos...\n");

  // Obtener la cuenta que despliega
  const [deployer] = await ethers.getSigners();
  console.log("📝 Desplegando contratos con la cuenta:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance de la cuenta:", ethers.formatEther(balance), "ETH\n");

  // ========================================
  // Desplegar HelloWorld
  // ========================================
  console.log("📄 Desplegando HelloWorld...");
  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy("¡Hola Mundo desde Ethereum!");
  await helloWorld.waitForDeployment();
  
  const helloWorldAddress = await helloWorld.getAddress();
  console.log("✅ HelloWorld desplegado en:", helloWorldAddress);
  console.log("   Mensaje inicial:", await helloWorld.message());
  console.log("");

  // ========================================
  // Desplegar SimpleToken
  // ========================================
  console.log("🪙 Desplegando SimpleToken...");
  const SimpleToken = await ethers.getContractFactory("SimpleToken");
  const initialSupply = ethers.parseEther("1000000"); // 1 millón de tokens
  const simpleToken = await SimpleToken.deploy("MiPrimerToken", "MPT", initialSupply);
  await simpleToken.waitForDeployment();
  
  const simpleTokenAddress = await simpleToken.getAddress();
  console.log("✅ SimpleToken desplegado en:", simpleTokenAddress);
  console.log("   Nombre:", await simpleToken.name());
  console.log("   Símbolo:", await simpleToken.symbol());
  console.log("   Supply total:", ethers.formatEther(await simpleToken.totalSupply()), "tokens");
  console.log("");

  // ========================================
  // Interactuar con los contratos
  // ========================================
  console.log("🔧 Probando interacciones...\n");

  // Probar HelloWorld
  console.log("📝 Cambiando mensaje en HelloWorld...");
  const tx1 = await helloWorld.setMessage("¡Contrato desplegado exitosamente!");
  await tx1.wait();
  console.log("✅ Nuevo mensaje:", await helloWorld.message());
  console.log("   Cambios realizados:", (await helloWorld.messageChangeCount()).toString());
  console.log("");

  // Probar SimpleToken
  console.log("💸 Probando transferencia de tokens...");
  const recipientAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Dirección de ejemplo
  const transferAmount = ethers.parseEther("1000");
  const tx2 = await simpleToken.transfer(recipientAddress, transferAmount);
  await tx2.wait();
  console.log("✅ Transferidos", ethers.formatEther(transferAmount), "tokens a", recipientAddress);
  console.log("   Balance del destinatario:", ethers.formatEther(await simpleToken.balanceOf(recipientAddress)), "tokens");
  console.log("");

  // ========================================
  // Resumen final
  // ========================================
  console.log("=" .repeat(70));
  console.log("✨ ¡Despliegue completado exitosamente! ✨");
  console.log("=" .repeat(70));
  console.log("\n📋 Resumen de direcciones:");
  console.log("   HelloWorld:  ", helloWorldAddress);
  console.log("   SimpleToken: ", simpleTokenAddress);
  console.log("\n💡 Próximos pasos:");
  console.log("   1. Guarda estas direcciones para interactuar con tus contratos");
  console.log("   2. Verifica los contratos en Etherscan (si estás en una testnet pública)");
  console.log("   3. Prueba las funciones desde una interfaz web o con Hardhat console");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error durante el despliegue:", error);
    process.exit(1);
  });
