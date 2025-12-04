// 🌍 Internationalization System
// Default language: English

const translations = {
    en: {
        // Navigation
        nav: {
            features: "Features",
            howItWorks: "How It Works",
            benefits: "Benefits",
            faq: "FAQ",
            launchApp: "Launch App"
        },
        // Settings
        settings: {
            title: "Settings",
            language: "Language",
            theme: "Theme",
            lightMode: "Light Mode",
            darkMode: "Dark Mode"
        },
        // Phone Preview
        phone: {
            title: "Trip to Cancun 2025",
            members: "members",
            active: "Active",
            balance: "Total Balance",
            target: "Target",
            progress: "Progress",
            deposit: "Deposit",
            vote: "Vote",
            viewMembers: "Members",
            recentActivity: "Recent Activity",
            deposited: "deposited",
            hoursAgo: "hours ago",
            proposalApproved: "Proposal approved",
            dayAgo: "day ago",
            transactionCost: "Cost per transaction",
            transparent: "Transparent",
            confirmation: "Confirmation",
            seeDemo: "See Demo"
        },
        // Landing Page
        landing: {
            hero: {
                title: "Shared Expenses on Blockchain",
                subtitle: "Create funds, manage expenses and vote on proposals with total transparency. No intermediaries, no hidden fees.",
                cta: "Start Free",
                stats: {
                    users: "Active Users",
                    funds: "Total Funds",
                    confirmation: "Confirmation"
                }
            },
            features: {
                title: "Why SplitExpense?",
                subtitle: "The ultimate solution for shared expenses",
                items: {
                    transparent: {
                        title: "100% Transparent",
                        desc: "All transactions on blockchain. No hidden accounts, no surprises. Verify every movement in real time."
                    },
                    secure: {
                        title: "Ultra Secure",
                        desc: "Your funds in smart contracts audited on Base. Only you and your group control the money."
                    },
                    voting: {
                        title: "Democratic Voting",
                        desc: "Every expense requires group approval. Fair and transparent voting system."
                    },
                    fast: {
                        title: "Instant",
                        desc: "Transactions confirmed in seconds on Base L2. No more endless waits."
                    },
                    nocustody: {
                        title: "Non-Custodial",
                        desc: "We never touch your money. Everything stays in smart contracts under your control."
                    },
                    flexible: {
                        title: "Totally Flexible",
                        desc: "From trips with friends to family savings. Adapt SplitExpense to any situation."
                    }
                }
            },
            howItWorks: {
                title: "How Does It Work?",
                subtitle: "Create your fund in 3 simple steps",
                steps: {
                    create: {
                        title: "Create Fund",
                        desc: "Choose a name, set a goal and invite your friends with a simple link."
                    },
                    deposit: {
                        title: "Deposit",
                        desc: "Each member deposits their share. Everything recorded transparently on blockchain."
                    },
                    vote: {
                        title: "Vote & Spend",
                        desc: "Create proposals, vote as a group and execute approved expenses."
                    }
                }
            },
            useCases: {
                title: "Perfect For...",
                items: {
                    travel: {
                        title: "Trips with Friends",
                        desc: "Manage hotel, flights and shared activities expenses. Everyone deposits and votes on expenses."
                    },
                    family: {
                        title: "Family Savings",
                        desc: "Save together for house, car or vacation. Full transparency for all members."
                    },
                    roommates: {
                        title: "Roommates",
                        desc: "Shared rent, services and supplies. No more hassles collecting money."
                    },
                    events: {
                        title: "Events & Celebrations",
                        desc: "Organize bachelor parties, birthdays or celebrations. Fair budget management."
                    }
                }
            },
            benefits: {
                title: "Why use Blockchain?",
                noIntermediaries: {
                    title: "No Intermediaries",
                    desc: "You control your money. No dependence on banks or centralized platforms."
                },
                immutable: {
                    title: "Immutable & Auditable",
                    desc: "Every transaction is permanently recorded. Impossible to manipulate."
                },
                openSource: {
                    title: "Open Source",
                    desc: "The smart contract is public. Anyone can verify its security."
                },
                available: {
                    title: "Available 24/7",
                    desc: "No banking hours. Works 24 hours a day, every day."
                },
                comparisonTitle: "SplitExpense vs Traditional Alternatives",
                comparisonFeature: "Feature",
                comparisonSE: "SplitExpense",
                comparisonTraditional: "Traditional Apps",
                transparency: "Transparency",
                total: "Total",
                limited: "Limited",
                fees: "Fees",
                control: "Control",
                yours: "Yours",
                company: "Company",
                audit: "Audit",
                public: "Public",
                private: "Private",
                availability: "Availability"
            },
            cta: {
                title: "Ready to transform your shared expenses?",
                subtitle: "Join thousands of users already using SplitExpense",
                button: "Start for Free",
                noRegistration: "No registration • No fees • No intermediaries"
            },
            footer: {
                tagline: "Made with ❤️ using Ethereum & Base.",
                subtitle: "Open source • Non-custodial • Decentralized",
                description: "The most transparent way to manage shared expenses using blockchain.",
                product: "Product",
                features: "Features",
                howItWorks: "How It Works",
                benefits: "Benefits",
                launchApp: "Launch App",
                resources: "Resources",
                faq: "FAQ",
                explorer: "Explorer",
                github: "GitHub",
                baseNetwork: "Base Network",
                technology: "Technology",
                ethereum: "Ethereum",
                baseL2: "Base L2",
                solidity: "Solidity",
                hardhat: "Hardhat"
            }
        },
        // App Platform
        app: {
            header: {
                subtitle: "Shared Expense Manager",
                connect: "Connect Wallet",
                disconnect: "Disconnect"
            },
            nav: {
                dashboard: "Dashboard",
                createFund: "Create Fund",
                disconnect: "Disconnect"
            },
            welcome: {
                title: "Welcome to SplitExpense",
                subtitle: "Shared funds management on blockchain",
                connect: "Connect Wallet",
                connecting: "Connecting...",
                setNickname: "Set Nickname"
            },
            nickname: {
                title: "Welcome to SplitExpense!",
                subtitle: "You need to set a nickname to identify yourself in groups and create funds.",
                label: "Your Nickname *",
                placeholder: "e.g.: John, Maria123, etc.",
                help: "3-32 characters, letters and numbers only. It will identify you in all your groups.",
                button: "Set Nickname and Continue",
                save: "Save Nickname",
                success: "Nickname saved successfully!"
            },
            stats: {
                fundsCreated: "Funds Created",
                activeFunds: "Active Funds",
                totalETH: "Total ETH"
            },
            invitations: {
                title: "Pending Invitations"
            },
            dashboard: {
                title: "My Groups",
                createNew: "Create New Group",
                empty: {
                    title: "Start your first adventure!",
                    subtitle: "Create your first group to manage shared expenses with friends, family or colleagues. It's fast, secure and transparent.",
                    button: "Create My First Group"
                },
                filters: {
                    all: "All",
                    created: "Created",
                    participating: "Participating",
                    travel: "Travel",
                    savings: "Savings",
                    shared: "Shared"
                },
                card: {
                    members: "members",
                    inactive: "Inactive",
                    creator: "Creator",
                    member: "Member"
                }
            },
            createFund: {
                title: "Create New Fund",
                form: {
                    name: "Fund Name",
                    namePlaceholder: "Trip to Cancun 2025",
                    description: "Description",
                    descriptionPlaceholder: "Shared fund for trip expenses...",
                    target: "Target Amount (ETH)",
                    targetPlaceholder: "0.5",
                    targetHelp: "Leave at 0 for unlimited",
                    type: "Fund Type",
                    types: {
                        travel: "Travel",
                        savings: "Savings",
                        shared: "Shared",
                        other: "Other"
                    },
                    privacy: "Privacy",
                    public: "Public (Anyone can join)",
                    private: "Private (Invitation only)",
                    create: "Create Fund",
                    creating: "Creating..."
                },
                success: "Fund created successfully!"
            },
            fundDetail: {
                tabs: {
                    deposit: "Deposit",
                    members: "Members",
                    invite: "Invite",
                    propose: "Propose",
                    vote: "Vote",
                    manage: "Manage"
                },
                info: {
                    balance: "Balance",
                    members: "Members",
                    proposals: "Proposals",
                    target: "Target",
                    noLimit: "No Limit",
                    progress: "Progress",
                    yourContribution: "Your Contribution",
                    backToDashboard: "Back to My Groups",
                    loading: "Loading...",
                    type: "Type",
                    status: "Status",
                    privacy: "Privacy"
                },
                banners: {
                    invitation: "You have a pending invitation to this fund",
                    accept: "Accept Invitation",
                    closed: "This fund is closed. No more actions allowed."
                },
                deposit: {
                    title: "Deposit to Fund",
                    amount: "Amount (ETH)",
                    button: "Deposit",
                    depositing: "Depositing...",
                    success: "Deposit successful!"
                },
                members: {
                    title: "Fund Members",
                    empty: "No members yet",
                    role: {
                        creator: "Creator",
                        active: "Active",
                        invited: "Invited"
                    }
                },
                invite: {
                    title: "Invite Members",
                    address: "Member Address",
                    button: "Send Invitation",
                    sending: "Sending...",
                    success: "Invitation sent!"
                },
                propose: {
                    title: "Create Proposal",
                    recipient: "Recipient Address",
                    amount: "Amount (ETH)",
                    description: "Description",
                    descriptionPlaceholder: "Describe the expense...",
                    button: "Create Proposal",
                    creating: "Creating...",
                    success: "Proposal created!"
                },
                vote: {
                    title: "Vote on Proposals",
                    empty: "No proposals to vote",
                    status: {
                        pending: "Pending",
                        approved: "Approved",
                        rejected: "Rejected",
                        executed: "Executed"
                    },
                    votes: "votes",
                    voteFor: "Vote For",
                    voteAgainst: "Vote Against",
                    execute: "Execute",
                    voting: "Voting...",
                    executing: "Executing...",
                    success: "Vote recorded!",
                    executeSuccess: "Proposal executed!"
                },
                manage: {
                    title: "Fund Management",
                    pause: "Pause Fund",
                    pausing: "Pausing...",
                    pauseSuccess: "Fund paused. Now in read-only mode.",
                    pauseConfirm: "Pause fund? This will block all transactions (deposits, proposals, votes). The fund will remain visible in read-only mode."
                }
            },
            toast: {
                error: "Error",
                success: "Success",
                warning: "Warning",
                info: "Info"
            },
            loading: "Loading...",
            back: "Back"
        },
        // Settings
        settings: {
            language: "Language",
            theme: "Theme",
            lightMode: "Light Mode",
            darkMode: "Dark Mode"
        }
    },
    es: {
        // Navigation
        nav: {
            features: "Características",
            howItWorks: "Cómo Funciona",
            benefits: "Beneficios",
            faq: "FAQ",
            launchApp: "Abrir App"
        },
        // Settings
        settings: {
            title: "Configuración",
            language: "Idioma",
            theme: "Tema",
            lightMode: "Modo Claro",
            darkMode: "Modo Oscuro"
        },
        // Phone Preview
        phone: {
            title: "Viaje a Cancún 2025",
            members: "miembros",
            active: "Activo",
            balance: "Balance Total",
            target: "Meta",
            progress: "Progreso",
            deposit: "Depositar",
            vote: "Votar",
            viewMembers: "Miembros",
            recentActivity: "Actividad Reciente",
            deposited: "depositó",
            hoursAgo: "Hace 2 horas",
            proposalApproved: "Propuesta aprobada",
            dayAgo: "Hace 1 día",
            transactionCost: "Costo por transacción",
            transparent: "Transparente",
            confirmation: "Confirmación",
            seeDemo: "Ver Demo"
        },
        // Landing Page
        landing: {
            hero: {
                title: "Gastos Compartidos en Blockchain",
                subtitle: "Crea fondos, administra gastos y vota propuestas con total transparencia. Sin intermediarios, sin comisiones ocultas.",
                cta: "Comenzar Gratis",
                stats: {
                    users: "Usuarios Activos",
                    funds: "Fondos Totales",
                    confirmation: "Confirmación"
                }
            },
            features: {
                title: "¿Por qué SplitExpense?",
                subtitle: "La solución definitiva para gastos compartidos",
                items: {
                    transparent: {
                        title: "100% Transparente",
                        desc: "Todas las transacciones en blockchain. Sin cuentas ocultas, sin sorpresas. Verifica cada movimiento en tiempo real."
                    },
                    secure: {
                        title: "Ultra Seguro",
                        desc: "Tus fondos en smart contracts auditados en Base. Solo tú y tu grupo controlan el dinero."
                    },
                    voting: {
                        title: "Votación Democrática",
                        desc: "Cada gasto requiere aprobación del grupo. Sistema de votación justo y transparente."
                    },
                    fast: {
                        title: "Instantáneo",
                        desc: "Transacciones confirmadas en segundos en Base L2. Sin más esperas interminables."
                    },
                    nocustody: {
                        title: "Sin Custodia",
                        desc: "Nunca tocamos tu dinero. Todo permanece en smart contracts bajo tu control."
                    },
                    flexible: {
                        title: "Totalmente Flexible",
                        desc: "Desde viajes con amigos hasta ahorros familiares. Adapta SplitExpense a cualquier situación."
                    }
                }
            },
            howItWorks: {
                title: "¿Cómo Funciona?",
                subtitle: "Crea tu fondo en 3 simples pasos",
                steps: {
                    create: {
                        title: "Crear Fondo",
                        desc: "Elige un nombre, establece una meta e invita a tus amigos con un simple link."
                    },
                    deposit: {
                        title: "Depositar",
                        desc: "Cada miembro deposita su parte. Todo registrado transparentemente en blockchain."
                    },
                    vote: {
                        title: "Votar y Gastar",
                        desc: "Crea propuestas, vota en grupo y ejecuta gastos aprobados."
                    }
                }
            },
            useCases: {
                title: "Perfecto Para...",
                items: {
                    travel: {
                        title: "Viajes con Amigos",
                        desc: "Administra gastos de hotel, vuelos y actividades compartidas. Todos depositan y votan los gastos."
                    },
                    family: {
                        title: "Ahorros Familiares",
                        desc: "Ahorren juntos para casa, auto o vacaciones. Transparencia total para todos los miembros."
                    },
                    roommates: {
                        title: "Roommates",
                        desc: "Renta, servicios y provisiones compartidas. Sin más líos cobrando dinero."
                    },
                    events: {
                        title: "Eventos y Celebraciones",
                        desc: "Organiza despedidas, cumpleaños o celebraciones. Gestión justa del presupuesto."
                    }
                }
            },
            benefits: {
                title: "¿Por qué usar Blockchain?",
                noIntermediaries: {
                    title: "Sin Intermediarios",
                    desc: "Tú controlas tu dinero. No dependes de bancos o plataformas centralizadas."
                },
                immutable: {
                    title: "Inmutable y Auditable",
                    desc: "Cada transacción queda registrada permanentemente. Imposible de manipular."
                },
                openSource: {
                    title: "Código Abierto",
                    desc: "El contrato inteligente es público. Cualquiera puede verificar su seguridad."
                },
                available: {
                    title: "Disponible 24/7",
                    desc: "Sin horarios bancarios. Funciona las 24 horas del día, todos los días."
                },
                comparisonTitle: "SplitExpense vs Alternativas Tradicionales",
                comparisonFeature: "Característica",
                comparisonSE: "SplitExpense",
                comparisonTraditional: "Apps Tradicionales",
                transparency: "Transparencia",
                total: "Total",
                limited: "Limitada",
                fees: "Comisiones",
                control: "Control",
                yours: "Tuyo",
                company: "Empresa",
                audit: "Auditoría",
                public: "Pública",
                private: "Privada",
                availability: "Disponibilidad"
            },
            cta: {
                title: "¿Listo para transformar tus gastos compartidos?",
                subtitle: "Únete a miles de usuarios que ya usan SplitExpense",
                button: "Comenzar Gratis",
                noRegistration: "Sin registro • Sin comisiones • Sin intermediarios"
            },
            footer: {
                tagline: "Hecho con ❤️ usando Ethereum & Base.",
                subtitle: "Código abierto • Sin custodia • Descentralizado",
                description: "La forma más transparente de gestionar gastos compartidos usando blockchain.",
                product: "Producto",
                features: "Características",
                howItWorks: "Cómo Funciona",
                benefits: "Beneficios",
                launchApp: "Lanzar App",
                resources: "Recursos",
                faq: "FAQ",
                explorer: "Explorador",
                github: "GitHub",
                baseNetwork: "Base Network",
                technology: "Tecnología",
                ethereum: "Ethereum",
                baseL2: "Base L2",
                solidity: "Solidity",
                hardhat: "Hardhat"
            }
        },
        // App Platform
        app: {
            header: {
                subtitle: "Gestor de Gastos Compartidos",
                connect: "Conectar Wallet",
                disconnect: "Desconectar"
            },
            nav: {
                dashboard: "Panel",
                createFund: "Crear Fondo",
                disconnect: "Desconectar"
            },
            welcome: {
                title: "Bienvenido a SplitExpense",
                subtitle: "Gestión de fondos compartidos en blockchain",
                connect: "Conectar Wallet",
                connecting: "Conectando...",
                setNickname: "Establecer Apodo"
            },
            nickname: {
                title: "¡Bienvenido a SplitExpense!",
                subtitle: "Necesitas establecer un nickname para identificarte en los grupos y poder crear fondos.",
                label: "Tu Nickname *",
                placeholder: "Ej: Juan, Maria123, etc.",
                help: "3-32 caracteres, solo letras y números. Te identificará en todos tus grupos.",
                button: "Establecer Nickname y Continuar",
                save: "Guardar Apodo",
                success: "¡Apodo guardado exitosamente!"
            },
            stats: {
                fundsCreated: "Grupos Creados",
                activeFunds: "Grupos Activos",
                totalETH: "ETH Total"
            },
            invitations: {
                title: "Invitaciones Pendientes"
            },
            dashboard: {
                title: "Mis Grupos",
                createNew: "Crear Nuevo Grupo",
                empty: {
                    title: "¡Comienza tu primera aventura!",
                    subtitle: "Crea tu primer grupo para gestionar gastos compartidos con amigos, familia o compañeros. Es rápido, seguro y transparente.",
                    button: "Crear Mi Primer Grupo"
                },
                filters: {
                    all: "Todos",
                    created: "Creados",
                    participating: "Participando",
                    travel: "Viajes",
                    savings: "Ahorros",
                    shared: "Compartidos"
                },
                card: {
                    members: "miembros",
                    inactive: "Inactivo",
                    creator: "Creador",
                    member: "Miembro"
                }
            },
            createFund: {
                title: "Crear Nuevo Fondo",
                form: {
                    name: "Nombre del Fondo",
                    namePlaceholder: "Viaje a Cancún 2025",
                    description: "Descripción",
                    descriptionPlaceholder: "Fondo compartido para gastos del viaje...",
                    target: "Monto Meta (ETH)",
                    targetPlaceholder: "0.5",
                    targetHelp: "Dejar en 0 para ilimitado",
                    type: "Tipo de Fondo",
                    types: {
                        travel: "Viaje",
                        savings: "Ahorro",
                        shared: "Compartido",
                        other: "Otro"
                    },
                    privacy: "Privacidad",
                    public: "Público (Cualquiera puede unirse)",
                    private: "Privado (Solo por invitación)",
                    create: "Crear Fondo",
                    creating: "Creando..."
                },
                success: "¡Fondo creado exitosamente!"
            },
            fundDetail: {
                tabs: {
                    deposit: "Depositar",
                    members: "Miembros",
                    invite: "Invitar",
                    propose: "Proponer",
                    vote: "Votar",
                    manage: "Gestionar"
                },
                info: {
                    balance: "Balance",
                    members: "Miembros",
                    proposals: "Propuestas",
                    target: "Meta",
                    noLimit: "Sin Límite",
                    progress: "Progreso",
                    yourContribution: "Tu Aportación",
                    backToDashboard: "Volver a Mis Grupos",
                    loading: "Cargando...",
                    type: "Tipo",
                    status: "Estado",
                    privacy: "Privacidad"
                },
                banners: {
                    invitation: "Tienes una invitación pendiente a este fondo",
                    accept: "Aceptar Invitación",
                    closed: "Este fondo está cerrado. No se permiten más acciones."
                },
                deposit: {
                    title: "Depositar al Fondo",
                    amount: "Monto (ETH)",
                    button: "Depositar",
                    depositing: "Depositando...",
                    success: "¡Depósito exitoso!"
                },
                members: {
                    title: "Miembros del Fondo",
                    empty: "Aún no hay miembros",
                    role: {
                        creator: "Creador",
                        active: "Activo",
                        invited: "Invitado"
                    }
                },
                invite: {
                    title: "Invitar Miembros",
                    address: "Dirección del Miembro",
                    button: "Enviar Invitación",
                    sending: "Enviando...",
                    success: "¡Invitación enviada!"
                },
                propose: {
                    title: "Crear Propuesta",
                    recipient: "Dirección del Destinatario",
                    amount: "Monto (ETH)",
                    description: "Descripción",
                    descriptionPlaceholder: "Describe el gasto...",
                    button: "Crear Propuesta",
                    creating: "Creando...",
                    success: "¡Propuesta creada!"
                },
                vote: {
                    title: "Votar Propuestas",
                    empty: "No hay propuestas para votar",
                    status: {
                        pending: "Pendiente",
                        approved: "Aprobada",
                        rejected: "Rechazada",
                        executed: "Ejecutada"
                    },
                    votes: "votos",
                    voteFor: "A Favor",
                    voteAgainst: "En Contra",
                    execute: "Ejecutar",
                    voting: "Votando...",
                    executing: "Ejecutando...",
                    success: "¡Voto registrado!",
                    executeSuccess: "¡Propuesta ejecutada!"
                },
                manage: {
                    title: "Gestión del Fondo",
                    pause: "Pausar Fondo",
                    pausing: "Pausando...",
                    pauseSuccess: "Fondo pausado. Ahora está en modo solo lectura.",
                    pauseConfirm: "¿Pausar el fondo? Esto bloqueará todas las transacciones (depósitos, propuestas, votos). El fondo seguirá visible en modo solo lectura."
                }
            },
            toast: {
                error: "Error",
                success: "Éxito",
                warning: "Advertencia",
                info: "Información"
            },
            loading: "Cargando...",
            back: "Volver"
        },
        // Settings
        settings: {
            language: "Idioma",
            theme: "Tema",
            lightMode: "Modo Claro",
            darkMode: "Modo Oscuro"
        }
    }
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
    const saved = localStorage.getItem('language');
    if (saved) return saved;
    
    // Auto-detect browser language
    const browserLang = navigator.language.split('-')[0];
    return ['en', 'es'].includes(browserLang) ? browserLang : 'en';
}

// Set language
function setLanguage(lang) {
    if (!translations[lang]) {
        console.error(`Language ${lang} not supported`);
        return;
    }
    localStorage.setItem('language', lang);
    location.reload(); // Reload to apply translations
}

// Get translation by key path (e.g., 'landing.hero.title')
function t(path) {
    const lang = getCurrentLanguage();
    const keys = path.split('.');
    let value = translations[lang];
    
    for (const key of keys) {
        if (value && typeof value === 'object') {
            value = value[key];
        } else {
            console.warn(`Translation not found: ${path} for language ${lang}`);
            return path;
        }
    }
    
    return value || path;
}

// Apply translations to page elements with data-i18n attribute
function applyTranslations() {
    const lang = getCurrentLanguage();
    document.documentElement.lang = lang;
    
    // Apply translations to elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
}

// Initialize translations on page load
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyTranslations);
    } else {
        applyTranslations();
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, getCurrentLanguage, translations, applyTranslations };
}
