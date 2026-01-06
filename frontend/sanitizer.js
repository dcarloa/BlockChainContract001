/**
 * Input Sanitizer - Protección contra XSS y contenido malicioso
 * Limpia y valida todos los inputs de usuario antes de guardar/renderizar
 * 
 * Requiere: DOMPurify (cargado desde CDN)
 */

const Sanitizer = {
    /**
     * Sanitizar HTML permitiendo tags básicos seguros
     * @param {string} dirty HTML potencialmente peligroso
     * @returns {string} HTML limpio
     */
    sanitizeHTML(dirty) {
        if (!dirty || typeof dirty !== 'string') {
            return '';
        }
        
        // Verificar que DOMPurify esté disponible
        if (typeof DOMPurify === 'undefined') {
            console.warn('⚠️ DOMPurify not loaded, using basic sanitization');
            return this.sanitizeText(dirty);
        }
        
        return DOMPurify.sanitize(dirty, {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p'],
            ALLOWED_ATTR: [],
            KEEP_CONTENT: true
        });
    },
    
    /**
     * Sanitizar texto completamente (sin HTML)
     * @param {string} dirty Texto potencialmente peligroso
     * @returns {string} Texto limpio sin tags HTML
     */
    sanitizeText(dirty) {
        if (!dirty || typeof dirty !== 'string') {
            return '';
        }
        
        // Si DOMPurify está disponible, usarlo
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(dirty, {
                ALLOWED_TAGS: [],
                KEEP_CONTENT: true
            });
        }
        
        // Fallback: escape manual de caracteres peligrosos
        return dirty
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },
    
    /**
     * Sanitizar URL verificando protocolo seguro
     * @param {string} url URL a validar
     * @returns {string} URL segura o cadena vacía
     */
    sanitizeURL(url) {
        if (!url || typeof url !== 'string') {
            return '';
        }
        
        try {
            const parsed = new URL(url);
            // Solo permitir http y https
            if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
                return url;
            }
        } catch (e) {
            // URL inválida
            return '';
        }
        
        return '';
    },
    
    /**
     * Sanitizar email
     * @param {string} email Email a validar
     * @returns {string} Email sanitizado
     */
    sanitizeEmail(email) {
        if (!email || typeof email !== 'string') {
            return '';
        }
        
        return email.trim().toLowerCase();
    },
    
    /**
     * Sanitizar número
     * @param {*} value Valor a convertir a número
     * @returns {number} Número válido o 0
     */
    sanitizeNumber(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    }
};

// ============================================
// VALIDATORS
// ============================================

const Validators = {
    /**
     * Validar información de grupo
     * @param {Object} groupInfo Datos del grupo
     * @returns {Object} Datos validados y sanitizados
     * @throws {Error} Si hay errores de validación
     */
    validateGroupInfo(groupInfo) {
        const errors = [];
        
        // Validar nombre
        if (!groupInfo.name || typeof groupInfo.name !== 'string') {
            errors.push("El nombre del grupo es requerido");
        } else if (groupInfo.name.trim().length === 0) {
            errors.push("El nombre del grupo no puede estar vacío");
        } else if (groupInfo.name.length > 100) {
            errors.push("El nombre es muy largo (máximo 100 caracteres)");
        }
        
        // Validar descripción
        if (groupInfo.description && groupInfo.description.length > 500) {
            errors.push("La descripción es muy larga (máximo 500 caracteres)");
        }
        
        // Validar monto objetivo
        if (groupInfo.targetAmount !== undefined && groupInfo.targetAmount !== null) {
            const amount = parseFloat(groupInfo.targetAmount);
            if (isNaN(amount)) {
                errors.push("Monto objetivo inválido");
            } else if (amount < 0) {
                errors.push("El monto objetivo no puede ser negativo");
            } else if (amount > 10000000) {
                errors.push("El monto objetivo es demasiado alto (máximo 10,000,000)");
            }
        }
        
        // Validar moneda
        if (groupInfo.currency && !/^[A-Z]{3}$/.test(groupInfo.currency)) {
            errors.push("Código de moneda inválido (usa formato ISO: USD, EUR, etc)");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
        
        // Sanitizar y retornar
        return {
            name: Sanitizer.sanitizeText(groupInfo.name.trim()),
            description: Sanitizer.sanitizeText((groupInfo.description || '').trim()),
            targetAmount: groupInfo.targetAmount ? Sanitizer.sanitizeNumber(groupInfo.targetAmount) : 0,
            currency: groupInfo.currency ? groupInfo.currency.toUpperCase() : 'USD'
        };
    },
    
    /**
     * Validar información de gasto
     * @param {Object} expenseInfo Datos del gasto
     * @returns {Object} Datos validados y sanitizados
     * @throws {Error} Si hay errores de validación
     */
    validateExpenseInfo(expenseInfo) {
        const errors = [];
        
        // Validar descripción
        if (!expenseInfo.description || typeof expenseInfo.description !== 'string') {
            errors.push("La descripción del gasto es requerida");
        } else if (expenseInfo.description.trim().length === 0) {
            errors.push("La descripción no puede estar vacía");
        } else if (expenseInfo.description.length > 500) {
            errors.push("La descripción es muy larga (máximo 500 caracteres)");
        }
        
        // Validar monto
        const amount = parseFloat(expenseInfo.amount);
        if (isNaN(amount)) {
            errors.push("Monto inválido");
        } else if (amount <= 0) {
            errors.push("El monto debe ser mayor a cero");
        } else if (amount > 1000000) {
            errors.push("El monto es demasiado alto (máximo 1,000,000)");
        }
        
        // Validar categoría
        const validCategories = [
            'food', 
            'transport', 
            'housing', 
            'utilities', 
            'entertainment', 
            'shopping', 
            'health', 
            'travel', 
            'subscription', 
            'accommodation', 
            'other', 
            'recurring'
        ];
        if (expenseInfo.category && !validCategories.includes(expenseInfo.category)) {
            errors.push("Categoría inválida");
        }
        
        // Validar notas
        if (expenseInfo.notes && expenseInfo.notes.length > 1000) {
            errors.push("Las notas son muy largas (máximo 1000 caracteres)");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
        
        // Sanitizar y retornar
        return {
            description: Sanitizer.sanitizeText(expenseInfo.description.trim()),
            amount: Sanitizer.sanitizeNumber(amount),
            category: expenseInfo.category || 'other',
            notes: expenseInfo.notes ? Sanitizer.sanitizeText(expenseInfo.notes.trim()) : '',
            currency: expenseInfo.currency ? expenseInfo.currency.toUpperCase() : 'USD'
        };
    },
    
    /**
     * Validar información de pago/settlement
     * @param {Object} settlementInfo Datos del pago
     * @returns {Object} Datos validados y sanitizados
     * @throws {Error} Si hay errores de validación
     */
    validateSettlementInfo(settlementInfo) {
        const errors = [];
        
        // Validar from y to
        if (!settlementInfo.from || typeof settlementInfo.from !== 'string') {
            errors.push("ID del pagador requerido");
        }
        
        if (!settlementInfo.to || typeof settlementInfo.to !== 'string') {
            errors.push("ID del receptor requerido");
        }
        
        if (settlementInfo.from === settlementInfo.to) {
            errors.push("No puedes registrar un pago a ti mismo");
        }
        
        // Validar monto
        const amount = parseFloat(settlementInfo.amount);
        if (isNaN(amount)) {
            errors.push("Monto inválido");
        } else if (amount <= 0) {
            errors.push("El monto debe ser mayor a cero");
        } else if (amount > 1000000) {
            errors.push("El monto es demasiado alto (máximo 1,000,000)");
        }
        
        // Validar notas
        if (settlementInfo.notes && settlementInfo.notes.length > 500) {
            errors.push("Las notas son muy largas (máximo 500 caracteres)");
        }
        
        if (errors.length > 0) {
            throw new Error(errors.join('\n'));
        }
        
        // Sanitizar y retornar
        return {
            from: settlementInfo.from,
            to: settlementInfo.to,
            amount: Sanitizer.sanitizeNumber(amount),
            method: settlementInfo.method || 'cash',
            notes: settlementInfo.notes ? Sanitizer.sanitizeText(settlementInfo.notes.trim()) : ''
        };
    },
    
    /**
     * Validar email
     * @param {string} email Email a validar
     * @returns {string} Email validado
     * @throws {Error} Si el email es inválido
     */
    validateEmail(email) {
        if (!email || typeof email !== 'string') {
            throw new Error("Email requerido");
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Email inválido");
        }
        
        return Sanitizer.sanitizeEmail(email);
    },
    
    /**
     * Validar nickname/nombre de usuario
     * @param {string} nickname Nickname a validar
     * @returns {string} Nickname validado
     * @throws {Error} Si el nickname es inválido
     */
    validateNickname(nickname) {
        if (!nickname || typeof nickname !== 'string') {
            throw new Error("Nombre requerido");
        }
        
        if (nickname.length < 2) {
            throw new Error("El nombre debe tener al menos 2 caracteres");
        }
        
        if (nickname.length > 50) {
            throw new Error("El nombre es muy largo (máximo 50 caracteres)");
        }
        
        // Solo permitir letras, números, espacios y algunos caracteres especiales
        if (!/^[a-zA-Z0-9\s\-_áéíóúÁÉÍÓÚñÑ]+$/.test(nickname)) {
            throw new Error("El nombre contiene caracteres no permitidos");
        }
        
        return Sanitizer.sanitizeText(nickname.trim());
    }
};

// ============================================
// HELPER PARA RENDERIZADO SEGURO
// ============================================

/**
 * Renderizar texto de usuario de forma segura (sin innerHTML)
 * @param {HTMLElement} element Elemento donde renderizar
 * @param {string} text Texto a renderizar
 */
function safeRender(element, text) {
    if (!element) return;
    
    // Usar textContent en lugar de innerHTML
    element.textContent = Sanitizer.sanitizeText(text);
}

/**
 * Renderizar HTML sanitizado
 * @param {HTMLElement} element Elemento donde renderizar
 * @param {string} html HTML a renderizar
 */
function safeRenderHTML(element, html) {
    if (!element) return;
    
    element.innerHTML = Sanitizer.sanitizeHTML(html);
}

// ============================================
// EXPORTS
// ============================================

window.Sanitizer = Sanitizer;
window.Validators = Validators;
window.safeRender = safeRender;
window.safeRenderHTML = safeRenderHTML;

console.log('✅ Sanitizer and Validators initialized');
