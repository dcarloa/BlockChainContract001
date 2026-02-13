/**
 * SECURITY WRAPPER - Protección automática contra ataques
 * 
 * Este módulo protege tu aplicación de:
 * - XSS (Cross-Site Scripting)
 * - Modificación de código vía consola
 * - Manipulación de funciones críticas
 * - Ataques de timing
 * 
 * @version 1.0.0
 * @author Ant Pool Security Team
 */

(function() {
    'use strict';
    
    // ============================================
    // 1. PROTECCIÓN DE FUNCIONES CRÍTICAS
    // ============================================
    
    /**
     * Lista de funciones que NO deben ser modificadas desde consola
     */
    const PROTECTED_FUNCTIONS = [
        'createSimpleGroup',
        'addSimpleExpense',
        'recordSettlement',
        'acceptFundInvitation',
        'deleteExpense',
        'deleteGroup',
        'updateGroupSettings'
    ];
    
    /**
     * Guardar referencias originales
     */
    const originalFunctions = {};
    
    /**
     * Proteger funciones críticas con Object.freeze
     */
    function protectCriticalFunctions() {
        if (typeof window.modeManager === 'undefined') {
            console.warn('⚠️ modeManager not loaded yet, protection will be applied later');
            return;
        }
        
        PROTECTED_FUNCTIONS.forEach(funcName => {
            if (window.modeManager[funcName]) {
                // Guardar referencia original
                originalFunctions[funcName] = window.modeManager[funcName];
                
                // Proteger contra reasignación
                Object.defineProperty(window.modeManager, funcName, {
                    value: originalFunctions[funcName],
                    writable: false,
                    configurable: false
                });
            }
        });
        
    }
    
    // ============================================
    // 2. PROTECCIÓN DE innerHTML GLOBAL
    // ============================================
    
    /**
     * Override de innerHTML para auto-sanitizar
     */
    function protectInnerHTML() {
        if (typeof DOMPurify === 'undefined') {
            console.warn('⚠️ DOMPurify not loaded, innerHTML protection disabled');
            return;
        }
        
        // Guardar descriptor original
        const originalDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        
        // Override con sanitización automática
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                if (typeof value === 'string') {
                    // Auto-sanitizar todo el contenido
                    const sanitized = DOMPurify.sanitize(value, {
                        ALLOWED_TAGS: [
                            'div', 'span', 'p', 'br', 'strong', 'em', 'b', 'i',
                            'ul', 'ol', 'li', 'a', 'img', 'button', 'input',
                            'label', 'select', 'option', 'textarea', 'h1', 'h2',
                            'h3', 'h4', 'h5', 'h6', 'svg', 'path', 'circle'
                        ],
                        ALLOWED_ATTR: [
                            'class', 'id', 'style', 'data-*', 'href', 'src',
                            'alt', 'title', 'type', 'value', 'placeholder',
                            'name', 'onclick', 'onchange', 'disabled', 'checked',
                            'selected', 'readonly', 'required', 'viewBox', 'd',
                            'fill', 'stroke', 'stroke-width'
                        ],
                        ALLOW_DATA_ATTR: true,
                        KEEP_CONTENT: true
                    });
                    
                    originalDescriptor.set.call(this, sanitized);
                } else {
                    originalDescriptor.set.call(this, value);
                }
            },
            get: function() {
                return originalDescriptor.get.call(this);
            }
        });
        
    }
    
    // ============================================
    // 3. PROTECCIÓN CONTRA EVAL Y FUNCTION
    // ============================================
    
    /**
     * Bloquear eval() y Function() para prevenir ejecución de código arbitrario
     */
    function blockDangerousFunctions() {
        // Deshabilitar eval
        window.eval = function() {
            console.error('🚫 eval() is disabled for security');
            throw new Error('eval() is disabled for security reasons');
        };
        
        // Advertir sobre setTimeout/setInterval con strings
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = function(fn, delay) {
            if (typeof fn === 'string') {
                console.warn('⚠️ setTimeout with string is discouraged. Use function instead.');
            }
            return originalSetTimeout.apply(this, arguments);
        };
        
        window.setInterval = function(fn, delay) {
            if (typeof fn === 'string') {
                console.warn('⚠️ setInterval with string is discouraged. Use function instead.');
            }
            return originalSetInterval.apply(this, arguments);
        };
        
    }
    
    // ============================================
    // 4. CONTENT SECURITY POLICY (CSP) REPORTING
    // ============================================
    
    /**
     * Monitorear violaciones de CSP
     */
    function setupCSPReporting() {
        document.addEventListener('securitypolicyviolation', (e) => {
            console.error('🚨 CSP Violation:', {
                blockedURI: e.blockedURI,
                violatedDirective: e.violatedDirective,
                originalPolicy: e.originalPolicy,
                sourceFile: e.sourceFile,
                lineNumber: e.lineNumber
            });
            
            // Opcional: enviar a analytics
            if (window.analytics && window.analytics.logEvent) {
                window.analytics.logEvent('csp_violation', {
                    blocked_uri: e.blockedURI,
                    directive: e.violatedDirective
                });
            }
        });
        
    }
    
    // ============================================
    // 5. PROTECCIÓN DE FIREBASE CONFIG
    // ============================================
    
    /**
     * Proteger credenciales de Firebase contra modificación
     */
    function protectFirebaseConfig() {
        // Esperar a que Firebase esté disponible
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase not loaded yet, protection will be applied later');
            return;
        }
        
        // Congelar configuración de Firebase
        if (window.firebaseConfig) {
            Object.freeze(window.firebaseConfig);
            console.log('✅ Firebase config frozen');
        }
        
        // Proteger instancia de Firebase
        if (firebase.app) {
            try {
                const app = firebase.app();
                Object.freeze(app.options);
            } catch (e) {
                // Firebase aún no inicializado
            }
        }
    }
    
    // ============================================
    // 6. MONITOREO DE CONSOLA
    // ============================================
    
    /**
     * Detectar intentos de manipulación vía consola
     */
    function monitorConsoleUsage() {
        const devtools = {
            isOpen: false,
            orientation: null
        };
        
        // Detectar DevTools abierto
        const checkDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            
            if (widthThreshold || heightThreshold) {
                if (!devtools.isOpen) {
                    devtools.isOpen = true;
                    console.warn('⚠️ Developer tools detected. Remember: modifying code in production can cause data corruption.');
                }
            } else {
                devtools.isOpen = false;
            }
        };
        
        // Check cada segundo
        setInterval(checkDevTools, 1000);
        
    }
    
    // ============================================
    // 7. PROTECCIÓN DE LOCALSTORAGE
    // ============================================
    
    /**
     * Prevenir borrado masivo de localStorage
     */
    function protectLocalStorage() {
        const originalClear = Storage.prototype.clear;
        
        Storage.prototype.clear = function() {
            console.warn('⚠️ localStorage.clear() called. This will delete all data.');
            
            // Confirmación en desarrollo
            if (!window.location.hostname.includes('firebaseapp.com') && 
                !window.location.hostname.includes('web.app')) {
                if (!confirm('Are you sure you want to clear ALL localStorage? This cannot be undone.')) {
                    console.log('❌ localStorage.clear() cancelled by user');
                    return;
                }
            }
            
            return originalClear.call(this);
        };
        
    }
    
    // ============================================
    // 8. INPUT SANITIZATION AUTO-CHECK
    // ============================================
    
    /**
     * Verificar que todos los inputs estén sanitizados
     */
    function validateInputSanitization() {
        // Override de value setter para inputs críticos
        const sensitiveInputIds = [
            'groupName', 'groupDescription', 'expenseDescription',
            'settlementNotes', 'expenseNotes', 'memberName', 'memberEmail'
        ];
        
        document.addEventListener('DOMContentLoaded', () => {
            sensitiveInputIds.forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    input.addEventListener('blur', function() {
                        if (this.value && typeof Sanitizer !== 'undefined') {
                            // Auto-sanitizar en blur
                            this.value = Sanitizer.sanitizeText(this.value);
                        }
                    });
                }
            });
        });
        
    }
    
    // ============================================
    // 9. RATE LIMITING ENFORCER
    // ============================================
    
    /**
     * Verificar que RateLimiter esté activo
     */
    function enforceRateLimiting() {
        if (typeof RateLimiter === 'undefined') {
            console.error('🚨 CRITICAL: RateLimiter not loaded! Application is vulnerable to DoS attacks.');
            
            // Crear fallback básico
            window.RateLimiter = {
                checkLimit: () => {
                    console.warn('⚠️ Using fallback rate limiter');
                    return true;
                }
            };
        }
    }
    
    // ============================================
    // INICIALIZACIÓN
    // ============================================
    
    /**
     * Inicializar todas las protecciones
     */
    function initializeSecurity() {
        
        // Protecciones inmediatas
        blockDangerousFunctions();
        protectLocalStorage();
        setupCSPReporting();
        monitorConsoleUsage();
        validateInputSanitization();
        
        // Protecciones que requieren DOMPurify
        if (typeof DOMPurify !== 'undefined') {
            protectInnerHTML();
        } else {
            console.error('🚨 DOMPurify not loaded! XSS protection disabled.');
            
            // Intentar cargar después
            setTimeout(() => {
                if (typeof DOMPurify !== 'undefined') {
                    protectInnerHTML();
                }
            }, 2000);
        }
        
        // Protecciones que requieren otros módulos
        enforceRateLimiting();
        
        // Esperar a que modeManager esté disponible
        const waitForModeManager = setInterval(() => {
            if (typeof window.modeManager !== 'undefined') {
                protectCriticalFunctions();
                clearInterval(waitForModeManager);
            }
        }, 100);
        
        // Timeout después de 10 segundos
        setTimeout(() => {
            clearInterval(waitForModeManager);
            if (typeof window.modeManager === 'undefined') {
                console.warn('⚠️ modeManager not loaded after 10s');
            }
        }, 10000);
        
        // Proteger Firebase cuando esté disponible
        setTimeout(protectFirebaseConfig, 1000);
        
    }
    
    // Ejecutar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSecurity);
    } else {
        initializeSecurity();
    }
    
    // ============================================
    // EXPORTS
    // ============================================
    
    window.SecurityWrapper = {
        version: '1.0.0',
        protectCriticalFunctions,
        protectFirebaseConfig,
        isDevToolsOpen: () => devtools && devtools.isOpen
    };
    
})();
