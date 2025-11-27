# 🌐 Interfaz Web para TravelFund

## 📋 ¿Qué incluye?

Una interfaz web completa y moderna para interactuar con el smart contract **TravelFund** sin necesidad de usar la consola de Hardhat.

### ✨ Características

- 🔗 **Conexión con MetaMask**: Conecta tu wallet fácilmente
- 💵 **Depósitos**: Interfaz visual para depositar ETH
- 📝 **Crear Propuestas**: Formulario intuitivo para proponer gastos
- 🗳️ **Votación**: Vota a favor o en contra con un clic
- 💸 **Ejecución**: Ejecuta propuestas aprobadas
- ⚙️ **Gestión**: Cierra el fondo y retira fondos proporcionales
- 📊 **Dashboard**: Vista completa del estado del fondo
- 🎨 **Diseño Moderno**: Interfaz responsive y atractiva

## 🚀 Cómo Usar

### **Paso 1: Instalar Dependencias**

Si aún no has instalado las dependencias:

```powershell
npm install
```

Esto instalará Express para el servidor web.

### **Paso 2: Compilar el Contrato**

```powershell
npm run compile
```

### **Paso 3: Iniciar Blockchain Local** (Terminal 1)

```powershell
npm run node
```

Deja esta terminal abierta.

### **Paso 4: Desplegar el Contrato** (Terminal 2)

```powershell
npm run deploy:travel
```

⚠️ **IMPORTANTE**: Copia la dirección del contrato desplegado. La necesitarás en la interfaz.

Ejemplo de salida:
```
✅ TravelFund desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

### **Paso 5: Iniciar el Servidor Web** (Terminal 3)

```powershell
npm run frontend
```

### **Paso 6: Abrir la Interfaz**

Abre tu navegador en: **http://localhost:3000**

### **Paso 7: Configurar MetaMask**

1. Instala [MetaMask](https://metamask.io/) si no lo tienes
2. Conecta MetaMask a tu red local:
   - Red: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
3. Importa una cuenta de prueba de Hardhat:
   - Copia una clave privada del nodo Hardhat (Terminal 1)
   - En MetaMask: Importar cuenta → Pegar clave privada

### **Paso 8: Usar la Interfaz**

1. **Conectar Wallet**: Haz clic en "Conectar Wallet"
2. **Configurar Contrato**: Pega la dirección del contrato desplegado
3. **¡Listo!** Ya puedes:
   - Depositar fondos
   - Crear propuestas
   - Votar
   - Ejecutar gastos aprobados
   - Gestionar el fondo

## 📂 Estructura de Archivos

```
frontend/
├── index.html      # Estructura HTML
├── styles.css      # Estilos y diseño
└── app.js          # Lógica e interacción con el contrato

scripts/
└── server.js       # Servidor Express
```

## 🎯 Funcionalidades de la Interfaz

### **1. Dashboard Principal**
- Balance total del fondo
- Número de contribuyentes
- Estado del fondo (Activo/Cerrado)
- Configuración de votación

### **2. Tab: Depositar**
- Formulario para depositar ETH
- Ver tu contribución actual
- Lista de todos los contribuyentes

### **3. Tab: Proponer Gasto**
- Campo para dirección del destinatario
- Monto a solicitar
- Descripción del gasto
- Validaciones automáticas

### **4. Tab: Votar**
- Lista de propuestas pendientes
- Información detallada de cada propuesta
- Botones para votar a favor/en contra
- Barra de progreso de votación
- Indicador de votos necesarios

### **5. Tab: Ejecutar**
- Propuestas aprobadas listas para ejecutar
- Un clic para transferir fondos
- Historial de ejecuciones

### **6. Tab: Gestión**
- Ver tu parte proporcional
- Cerrar el fondo (solo creador)
- Retirar fondos después del cierre

## 🎨 Capturas de Concepto

La interfaz incluye:
- ✅ Diseño gradient moderno (morado/azul)
- ✅ Cards con sombras suaves
- ✅ Animaciones de hover
- ✅ Notificaciones toast
- ✅ Loading overlay durante transacciones
- ✅ Responsive para móviles
- ✅ Colores intuitivos (verde=éxito, rojo=peligro)

## 🔧 Personalización

### **Cambiar Puerto del Servidor**

Edita `scripts/server.js`:
```javascript
const PORT = 3000; // Cambia a tu puerto preferido
```

### **Modificar Estilos**

Edita `frontend/styles.css` - Variables CSS al inicio:
```css
:root {
    --primary: #4F46E5;      /* Color principal */
    --secondary: #10B981;    /* Color secundario */
    --danger: #EF4444;       /* Color de peligro */
    /* ... */
}
```

## 🐛 Troubleshooting

### **MetaMask no conecta**
- Asegúrate de estar en la red correcta (Localhost 8545)
- Verifica que Hardhat node esté corriendo
- Prueba refrescar la página

### **"Contract not found"**
- Verifica que copiaste la dirección correcta
- Asegúrate de haber compilado y desplegado el contrato
- Revisa la consola del navegador para errores

### **Transacciones fallan**
- Verifica que tienes suficiente ETH en tu cuenta
- Confirma que eres contribuyente (debes depositar primero)
- Revisa los requisitos de cada función

### **Estilos no cargan**
- Refresca la página (Ctrl+F5)
- Verifica que `styles.css` y `app.js` estén en `/frontend`
- Revisa la consola del navegador

## 🚀 Desplegar en Producción

Para usar en una testnet real (Sepolia):

1. **Despliega en Sepolia**:
   ```powershell
   npx hardhat run scripts/deployTravelFund.js --network sepolia
   ```

2. **Configura MetaMask**:
   - Cambia a Sepolia Test Network
   - Obtén ETH de prueba en faucets

3. **Usa la interfaz normalmente**:
   - La interfaz detecta automáticamente la red
   - Funciona igual que en local

## 📚 Recursos Adicionales

- [Documentación de MetaMask](https://docs.metamask.io/)
- [Ethers.js Docs](https://docs.ethers.org/)
- [Express.js Guide](https://expressjs.com/)

## 💡 Tips de Uso

1. **Prueba con múltiples cuentas**: Importa varias cuentas de Hardhat para simular múltiples amigos
2. **Monitorea transacciones**: Revisa la terminal de Hardhat para ver las transacciones en tiempo real
3. **Guarda la dirección**: La interfaz guarda la dirección del contrato en localStorage
4. **Actualiza info**: Usa el botón "Actualizar" después de cambios importantes

## 🎉 ¡Listo!

Ahora tienes una interfaz web completa para gestionar fondos de viaje con tus amigos de forma descentralizada.

**¿Preguntas?** Revisa la documentación principal en `/docs/TRAVELFUND.md`
