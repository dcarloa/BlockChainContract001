require("dotenv").config();

console.log("🔍 Verificando configuración del .env");
console.log("=====================================");
console.log("");

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
    console.log("❌ PRIVATE_KEY no encontrada en .env");
} else {
    console.log("✅ PRIVATE_KEY encontrada");
    console.log("   Longitud:", privateKey.length, "caracteres");
    console.log("   Primeros 4 caracteres:", privateKey.substring(0, 4));
    
    if (privateKey.startsWith("0x")) {
        console.log("⚠️  La PRIVATE_KEY empieza con '0x' - debe quitarse");
    }
    
    if (privateKey.includes(" ")) {
        console.log("⚠️  La PRIVATE_KEY contiene espacios - deben quitarse");
    }
    
    if (privateKey === "tu_clave_privada_de_metamask_aqui" || 
        privateKey === "TU_PRIVATE_KEY_AQUI_SIN_0x") {
        console.log("⚠️  La PRIVATE_KEY es un placeholder - debe reemplazarse con tu key real");
    }
    
    // Try to validate format (should be 64 hex characters)
    if (privateKey.length === 64 && /^[0-9a-fA-F]+$/.test(privateKey)) {
        console.log("✅ Formato de PRIVATE_KEY válido (64 caracteres hex)");
    } else if (privateKey.length === 66 && privateKey.startsWith("0x")) {
        console.log("⚠️  PRIVATE_KEY tiene formato con 0x - quítalo para que sean 64 caracteres");
    } else {
        console.log("❌ Formato de PRIVATE_KEY inválido");
        console.log("   Debe ser 64 caracteres hexadecimales (sin 0x)");
    }
}

console.log("");
console.log("Otras variables:");
console.log("   BASESCAN_API_KEY:", process.env.BASESCAN_API_KEY ? "✅ Configurada" : "⚠️  No configurada (opcional)");
console.log("   ETHERSCAN_API_KEY:", process.env.ETHERSCAN_API_KEY ? "✅ Configurada" : "⚠️  No configurada (opcional)");
