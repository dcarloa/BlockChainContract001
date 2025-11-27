const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Desactivar CSP del servidor - usar el del HTML meta tag
app.use((req, res, next) => {
    // Headers para compatibilidad con MetaMask
    res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    // No agregar CSP header para que use el del meta tag
    next();
});

// Servir archivos estáticos desde la carpeta frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Ruta para obtener la dirección del contrato (compatibilidad V1)
app.get('/contract-address.json', (req, res) => {
    const contractAddressPath = path.join(__dirname, '../frontend/contract-address.json');
    const contractInfoPath = path.join(__dirname, '../frontend/contract-info.json');
    
    // Intentar enviar contract-info.json primero (V2), si no existe usar contract-address.json (V1)
    const fs = require('fs');
    if (fs.existsSync(contractInfoPath)) {
        res.sendFile(contractInfoPath);
    } else if (fs.existsSync(contractAddressPath)) {
        res.sendFile(contractAddressPath);
    } else {
        res.status(404).json({ error: 'Contract not deployed yet' });
    }
});

// Ruta para obtener información completa del contrato (V2)
app.get('/contract-info.json', (req, res) => {
    const contractInfoPath = path.join(__dirname, '../frontend/contract-info.json');
    const fs = require('fs');
    if (fs.existsSync(contractInfoPath)) {
        res.sendFile(contractInfoPath);
    } else {
        res.status(404).json({ error: 'Contract V2 not deployed yet' });
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log('   TravelFund Frontend Server');
    console.log('   ========================================');
    console.log('');
    console.log(`   🌐 Servidor corriendo en: http://localhost:${PORT}`);
    console.log('');
    console.log('   📋 Pasos para usar:');
    console.log('   1. Asegúrate de tener MetaMask instalado');
    console.log('   2. Conecta tu wallet en la interfaz');
    console.log('   3. Configura la dirección del contrato');
    console.log('   4. ¡Comienza a usar TravelFund!');
    console.log('');
    console.log('   ⚡ Presiona Ctrl+C para detener el servidor');
    console.log('   ========================================');
    console.log('');
});
