/**
 * Rate Limiter - Protección contra abuso de operaciones
 * Previene spam de creación de grupos, gastos y otras operaciones
 * 
 * Uso:
 * await window.RateLimiter.checkLimit('createGroup', 5, 3600000); // 5 grupos/hora
 * await window.RateLimiter.recordAction('createGroup');
 */

class RateLimiter {
    constructor() {
        this.actions = {}; // {action: [timestamp1, timestamp2, ...]}
        this.loadFromStorage();
        
        // Limpiar datos antiguos cada 5 minutos
        setInterval(() => this.cleanupOldData(), 5 * 60 * 1000);
    }
    
    /**
     * Verificar si una acción está permitida según límites
     * @param {string} action Nombre de la acción (ej: 'createGroup')
     * @param {number} maxAttempts Máximo de intentos permitidos
     * @param {number} windowMs Ventana de tiempo en milisegundos
     * @returns {Promise<boolean>} true si está permitido
     * @throws {Error} Si se excede el límite
     */
    async checkLimit(action, maxAttempts, windowMs) {
        const now = Date.now();
        
        // Obtener historial de acciones
        let history = this.actions[action] || [];
        
        // Filtrar solo acciones dentro de la ventana de tiempo
        const recentActions = history.filter(timestamp => now - timestamp < windowMs);
        
        // Verificar límite
        if (recentActions.length >= maxAttempts) {
            const oldestAction = Math.min(...recentActions);
            const waitTime = Math.ceil((windowMs - (now - oldestAction)) / 1000);
            
            const minutes = Math.floor(waitTime / 60);
            const seconds = waitTime % 60;
            
            let waitMessage;
            if (minutes > 0) {
                waitMessage = `${minutes} minuto${minutes > 1 ? 's' : ''}`;
                if (seconds > 0) {
                    waitMessage += ` y ${seconds} segundo${seconds > 1 ? 's' : ''}`;
                }
            } else {
                waitMessage = `${seconds} segundo${seconds > 1 ? 's' : ''}`;
            }
            
            throw new Error(`⏱️ Límite de operaciones excedido. Por favor espera ${waitMessage} antes de intentar nuevamente.`);
        }
        
        return true;
    }
    
    /**
     * Registrar que se realizó una acción
     * @param {string} action Nombre de la acción
     */
    async recordAction(action) {
        const now = Date.now();
        
        if (!this.actions[action]) {
            this.actions[action] = [];
        }
        
        this.actions[action].push(now);
        
        // Mantener solo últimas 100 acciones por tipo
        if (this.actions[action].length > 100) {
            this.actions[action] = this.actions[action].slice(-100);
        }
        
        this.saveToStorage();
    }
    
    /**
     * Verificar cuántos intentos quedan disponibles
     * @param {string} action Nombre de la acción
     * @param {number} maxAttempts Máximo de intentos
     * @param {number} windowMs Ventana de tiempo
     * @returns {Object} {remaining, resetIn}
     */
    getRemaining(action, maxAttempts, windowMs) {
        const now = Date.now();
        const history = this.actions[action] || [];
        const recentActions = history.filter(timestamp => now - timestamp < windowMs);
        
        const remaining = Math.max(0, maxAttempts - recentActions.length);
        
        let resetIn = 0;
        if (recentActions.length > 0) {
            const oldestAction = Math.min(...recentActions);
            resetIn = Math.max(0, windowMs - (now - oldestAction));
        }
        
        return {
            remaining,
            resetIn: Math.ceil(resetIn / 1000), // en segundos
            total: maxAttempts
        };
    }
    
    /**
     * Limpiar datos antiguos (más de 24 horas)
     */
    cleanupOldData() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        for (const action in this.actions) {
            this.actions[action] = this.actions[action].filter(
                timestamp => now - timestamp < maxAge
            );
            
            // Eliminar arrays vacíos
            if (this.actions[action].length === 0) {
                delete this.actions[action];
            }
        }
        
        this.saveToStorage();
    }
    
    /**
     * Resetear límites para una acción (solo para testing)
     * @param {string} action Nombre de la acción
     */
    reset(action) {
        if (action) {
            delete this.actions[action];
        } else {
            this.actions = {};
        }
        this.saveToStorage();
    }
    
    /**
     * Cargar datos de localStorage
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem('rateLimitData');
            if (data) {
                const parsed = JSON.parse(data);
                // Validar que sea un objeto
                if (parsed && typeof parsed === 'object') {
                    this.actions = parsed;
                }
            }
        } catch (error) {
            console.error('❌ Error loading rate limit data:', error);
            this.actions = {};
        }
    }
    
    /**
     * Guardar datos a localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('rateLimitData', JSON.stringify(this.actions));
        } catch (error) {
            console.error('❌ Error saving rate limit data:', error);
        }
    }
}

// ============================================
// LÍMITES CONFIGURADOS POR OPERACIÓN
// ============================================

const RATE_LIMITS = {
    // Crear grupo: 5 por hora
    createGroup: { 
        maxAttempts: 5, 
        windowMs: 3600000, // 1 hora
        description: "Creación de grupos"
    },
    
    // Agregar gasto: 20 por minuto
    addExpense: { 
        maxAttempts: 20, 
        windowMs: 60000, // 1 minuto
        description: "Agregar gastos"
    },
    
    // Registrar pago: 10 por minuto
    recordSettlement: { 
        maxAttempts: 10, 
        windowMs: 60000, // 1 minuto
        description: "Registrar pagos"
    },
    
    // Invitar miembros: 10 por hora
    inviteMember: { 
        maxAttempts: 10, 
        windowMs: 3600000, // 1 hora
        description: "Invitar miembros"
    },
    
    // Gastos recurrentes: 3 por hora
    createRecurring: {
        maxAttempts: 3,
        windowMs: 3600000, // 1 hora
        description: "Crear gastos recurrentes"
    },
    
    // Actualizar grupo: 20 por hora
    updateGroup: {
        maxAttempts: 20,
        windowMs: 3600000, // 1 hora
        description: "Actualizar configuración"
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verificar límite de operación con configuración predefinida
 * @param {string} operation Nombre de la operación
 * @returns {Promise<boolean>}
 */
async function checkRateLimit(operation) {
    const config = RATE_LIMITS[operation];
    
    if (!config) {
        console.warn(`⚠️ No rate limit configured for operation: ${operation}`);
        return true;
    }
    
    return await window.RateLimiter.checkLimit(
        operation, 
        config.maxAttempts, 
        config.windowMs
    );
}

/**
 * Registrar operación realizada
 * @param {string} operation Nombre de la operación
 */
async function recordRateLimitAction(operation) {
    return await window.RateLimiter.recordAction(operation);
}

/**
 * Obtener información sobre límites restantes
 * @param {string} operation Nombre de la operación
 * @returns {Object}
 */
function getRateLimitInfo(operation) {
    const config = RATE_LIMITS[operation];
    
    if (!config) {
        return null;
    }
    
    return window.RateLimiter.getRemaining(
        operation,
        config.maxAttempts,
        config.windowMs
    );
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Crear instancia global
window.RateLimiter = new RateLimiter();

// Exportar funciones helper
window.checkRateLimit = checkRateLimit;
window.recordRateLimitAction = recordRateLimitAction;
window.getRateLimitInfo = getRateLimitInfo;
window.RATE_LIMITS = RATE_LIMITS;

console.log('✅ Rate Limiter initialized with limits:', RATE_LIMITS);
