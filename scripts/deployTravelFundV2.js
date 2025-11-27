// SPDX-License-Identifier: MIT
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("\n🚀 =======================================");
    console.log("   TravelFundV2 - Despliegue Mejorado");
    console.log("=======================================\n");

    const [deployer, friend1, friend2, friend3] = await hre.ethers.getSigners();

    console.log("📝 Desplegando con la cuenta:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "ETH\n");

    // Generar un ID único para el fondo
    const fundId = `TF-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const tripName = "Viaje a Cancún 2025";
    const description = "Fondo compartido para nuestro viaje de verano a Cancún";
    const targetAmount = hre.ethers.parseEther("20"); // Meta: 20 ETH
    const isPrivate = true; // Requiere invitación
    const approvalPercentage = 60; // 60% de votos necesarios
    const minimumVotes = 2; // Mínimo 2 votos

    console.log("⚙️  Configuración del fondo:");
    console.log(`   Fund ID: ${fundId}`);
    console.log(`   Nombre del viaje: ${tripName}`);
    console.log(`   Descripción: ${description}`);
    console.log(`   Meta: ${hre.ethers.formatEther(targetAmount)} ETH`);
    console.log(`   Privado: ${isPrivate ? 'Sí' : 'No'}`);
    console.log(`   Porcentaje de aprobación: ${approvalPercentage}%`);
    console.log(`   Mínimo de votos: ${minimumVotes}\n`);

    // Desplegar contrato
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

    // Guardar dirección del contrato y metadata
    const contractInfo = {
        address: contractAddress,
        fundId: fundId,
        tripName: tripName,
        description: description,
        targetAmount: targetAmount.toString(),
        isPrivate: isPrivate,
        approvalPercentage: approvalPercentage,
        minimumVotes: minimumVotes,
        network: hre.network.name,
        chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
        deployedAt: new Date().toISOString(),
        deployer: deployer.address
    };

    const outputPath = path.join(__dirname, '../frontend/contract-info.json');
    fs.writeFileSync(outputPath, JSON.stringify(contractInfo, null, 2));
    console.log("   📁 Información guardada en: frontend/contract-info.json\n");

    // ============================================
    // SIMULACIÓN DE USO CON NICKNAMES E INVITACIONES
    // ============================================

    console.log("📊 SIMULACIÓN DE USO DEL CONTRATO\n");

    // Paso 1: Establecer nicknames
    console.log("👤 Paso 1: Establecer nicknames");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    await travelFund.connect(deployer).setNickname("Alice");
    console.log("   ✓ Deployer estableció nickname: Alice");
    
    await travelFund.connect(friend1).setNickname("Bob");
    console.log("   ✓ Friend1 estableció nickname: Bob");
    
    await travelFund.connect(friend2).setNickname("Charlie");
    console.log("   ✓ Friend2 estableció nickname: Charlie");
    
    await travelFund.connect(friend3).setNickname("Diana");
    console.log("   ✓ Friend3 estableció nickname: Diana\n");

    // Paso 2: Invitar amigos (fondo privado)
    console.log("🎫 Paso 2: Invitar amigos al fondo");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    // Alice (deployer/creator) ya es miembro activo automáticamente
    // Deposita primero para poder invitar
    await travelFund.connect(deployer).deposit({ value: hre.ethers.parseEther("3") });
    console.log("   ✓ Alice depositó 3 ETH\n");
    
    await travelFund.connect(deployer).inviteMemberByNickname("Bob");
    console.log("   ✓ Alice invitó a Bob");
    
    await travelFund.connect(deployer).inviteMemberByAddress(friend2.address);
    console.log("   ✓ Alice invitó a Charlie (por dirección)");
    
    await travelFund.connect(deployer).inviteMemberByNickname("Diana");
    console.log("   ✓ Alice invitó a Diana\n");

    // Paso 3: Aceptar invitaciones
    console.log("✅ Paso 3: Aceptar invitaciones");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    await travelFund.connect(friend1).acceptInvitation();
    console.log("   ✓ Bob aceptó la invitación");
    
    await travelFund.connect(friend2).acceptInvitation();
    console.log("   ✓ Charlie aceptó la invitación");
    
    await travelFund.connect(friend3).acceptInvitation();
    console.log("   ✓ Diana aceptó la invitación\n");

    // Paso 4: Depositar fondos
    console.log("💵 Paso 4: Los amigos depositan fondos");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    await travelFund.connect(friend1).deposit({ value: hre.ethers.parseEther("2.5") });
    console.log("   ✓ Bob depositó 2.5 ETH");
    
    await travelFund.connect(friend2).deposit({ value: hre.ethers.parseEther("2") });
    console.log("   ✓ Charlie depositó 2 ETH");
    
    await travelFund.connect(friend3).deposit({ value: hre.ethers.parseEther("1.5") });
    console.log("   ✓ Diana depositó 1.5 ETH");

    const totalBalance = await travelFund.getBalance();
    const contributorCount = await travelFund.getContributorCount();
    const progress = await travelFund.getProgressPercentage();
    
    console.log(`\n   💰 Balance total: ${hre.ethers.formatEther(totalBalance)} ETH`);
    console.log(`   👥 Contribuyentes: ${contributorCount}`);
    console.log(`   📈 Progreso hacia meta: ${progress}%\n`);

    // Paso 5: Crear propuesta
    console.log("📝 Paso 5: Crear propuesta de gasto");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    const proposal1Tx = await travelFund.connect(friend1).createProposal(
        friend1.address,
        hre.ethers.parseEther("4"),
        "Hotel en Cancún - 3 noches todo incluido"
    );
    await proposal1Tx.wait();
    
    console.log("   ✓ Propuesta #1 creada por Bob:");
    console.log("     - Monto: 4.0 ETH");
    console.log("     - Destinatario: Bob");
    console.log("     - Descripción: 'Hotel en Cancún - 3 noches todo incluido'\n");

    // Paso 6: Votación
    console.log("🗳️  Paso 6: Votación de la propuesta");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    await travelFund.connect(deployer).vote(1, true);
    console.log("   Alice votó: ✅ A FAVOR");
    
    await travelFund.connect(friend1).vote(1, true);
    console.log("   Bob votó: ✅ A FAVOR");
    
    await travelFund.connect(friend2).vote(1, true);
    console.log("   Charlie votó: ✅ A FAVOR");

    const proposal1 = await travelFund.getProposal(1);
    
    console.log(`\n   📊 Resultado:`);
    console.log(`     - Votos a favor: ${proposal1.votesFor}`);
    console.log(`     - Votos en contra: ${proposal1.votesAgainst}`);
    console.log(`     - Estado: ${proposal1.approved ? '✅ APROBADA' : '⏳ PENDIENTE'}\n`);

    // Paso 7: Ejecutar propuesta
    console.log("💸 Paso 7: Ejecutar la propuesta aprobada");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    const balanceBefore = await hre.ethers.provider.getBalance(friend1.address);
    
    await travelFund.connect(deployer).executeProposal(1);
    
    const balanceAfter = await hre.ethers.provider.getBalance(friend1.address);
    const received = balanceAfter - balanceBefore;
    
    console.log("   ✓ Propuesta ejecutada exitosamente");
    console.log(`   💰 Bob recibió: ${hre.ethers.formatEther(received)} ETH`);
    
    const newBalance = await travelFund.getBalance();
    console.log(`   📊 Balance restante del fondo: ${hre.ethers.formatEther(newBalance)} ETH\n`);

    // Paso 8: Segunda propuesta con cancelación
    console.log("📝 Paso 8: Segunda propuesta - Tours (luego cancelada)");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    const proposal2Tx = await travelFund.connect(friend2).createProposal(
        friend2.address,
        hre.ethers.parseEther("2"),
        "Tours en Chichen Itza + Cenote + Comida"
    );
    await proposal2Tx.wait();
    
    console.log("   ✓ Propuesta #2 creada por Charlie");
    console.log("   ✓ Charlie canceló la propuesta (cambió de opinión)\n");
    
    await travelFund.connect(friend2).cancelProposal(2);

    // Paso 9: Tercera propuesta
    console.log("📝 Paso 9: Tercera propuesta - Actividades");
    console.log("──────────────────────────────────────────────────────────────────────");
    
    const proposal3Tx = await travelFund.connect(friend3).createProposal(
        friend3.address,
        hre.ethers.parseEther("1.5"),
        "Snorkel + Buceo en arrecife + Renta de equipo"
    );
    await proposal3Tx.wait();
    
    console.log("   ✓ Propuesta #3 creada por Diana:");
    console.log("     - Monto: 1.5 ETH");
    console.log("     - Descripción: 'Snorkel + Buceo en arrecife + Renta de equipo'\n");

    // Resumen final
    console.log("======================================================================");
    console.log("✨ RESUMEN FINAL");
    console.log("======================================================================\n");

    const fundInfo = await travelFund.getFundInfo();
    const [addresses, nicknames, amounts] = await travelFund.getContributorsWithNicknames();
    
    console.log("📋 Información del fondo:");
    console.log(`   Fund ID: ${fundInfo.id}`);
    console.log(`   Nombre: ${fundInfo.name}`);
    console.log(`   Creador: ${fundInfo.creatorNickname} (${fundInfo.fundCreator})`);
    console.log(`   Estado: ${fundInfo.active ? '🟢 Activo' : '🔴 Cerrado'}`);
    console.log(`   Tipo: ${fundInfo.private_ ? '🔒 Privado' : '🌐 Público'}\n`);

    console.log("💰 Finanzas:");
    console.log(`   Meta: ${hre.ethers.formatEther(fundInfo.target)} ETH`);
    console.log(`   Progreso: ${progress}%`);
    console.log(`   Total depositado: ${hre.ethers.formatEther(fundInfo.totalContrib)} ETH`);
    console.log(`   Balance actual: ${hre.ethers.formatEther(fundInfo.currentBalance)} ETH\n`);

    console.log("👥 Contribuyentes:");
    for (let i = 0; i < addresses.length; i++) {
        console.log(`   ${i + 1}. ${nicknames[i]}: ${hre.ethers.formatEther(amounts[i])} ETH`);
    }

    console.log(`\n📊 Estadísticas:`);
    console.log(`   Contribuyentes: ${fundInfo.contributorCount}`);
    console.log(`   Propuestas creadas: ${fundInfo.proposalCountValue}`);
    console.log(`   Propuestas ejecutadas: 1`);
    console.log(`   Propuestas canceladas: 1`);
    console.log(`   Propuestas pendientes: 1\n`);

    console.log("⚙️  Configuración:");
    console.log(`   Aprobación requerida: ${fundInfo.approvalPct}%`);
    console.log(`   Votos mínimos: ${fundInfo.minVotes}\n`);

    console.log("\n💡 PRÓXIMOS PASOS:\n");
    console.log("1. 🌐 Abrir la interfaz web:");
    console.log("   http://localhost:3001\n");
    
    console.log("2. 🔗 Conectar MetaMask:");
    console.log("   - Seleccionar red 'Hardhat Local'");
    console.log("   - Importar una cuenta de prueba\n");
    
    console.log("3. 👤 Establecer tu nickname:");
    console.log("   - Click en 'Set Nickname'");
    console.log("   - Elegir un alias único\n");
    
    console.log("4. 🎫 Invitar amigos:");
    console.log("   - Usa nicknames en lugar de direcciones");
    console.log("   - Los amigos deben aceptar la invitación\n");
    
    console.log("5. 💵 Realizar operaciones:");
    console.log("   - Depositar fondos");
    console.log("   - Crear propuestas");
    console.log("   - Votar y ejecutar\n");

    console.log("──────────────────────────────────────────────────────────────────────");
    console.log("🎉 ¡Fondo de viaje V2 desplegado y funcionando!");
    console.log("──────────────────────────────────────────────────────────────────────\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
