// 🌍 Internationalization System
// Default language: English

const translations = {
    en: {
        // Landing Page
        landing: {
            hero: {
                title: "Shared Expenses on Blockchain",
                subtitle: "Create funds, manage expenses and vote on proposals with total transparency. No intermediaries, no hidden fees.",
                cta: "Launch App",
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
            cta: {
                title: "Ready to transform your shared expenses?",
                subtitle: "Join thousands of users already using SplitExpense",
                button: "Start for Free"
            },
            footer: {
                tagline: "Made with ❤️ using Ethereum & Base.",
                subtitle: "Open source • Non-custodial • Decentralized",
                links: {
                    product: "Product",
                    resources: "Resources",
                    legal: "Legal"
                }
            }
        },
        // App Platform
        app: {
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
                title: "Choose Your Nickname",
                subtitle: "This is how other members will see you",
                placeholder: "Enter your nickname",
                save: "Save Nickname",
                success: "Nickname saved successfully!"
            },
            dashboard: {
                title: "My Funds",
                empty: {
                    title: "No funds yet",
                    subtitle: "Create your first fund to start managing shared expenses",
                    button: "Create First Fund"
                },
                filters: {
                    all: "All",
                    creator: "Created",
                    member: "Member",
                    active: "Active",
                    inactive: "Inactive"
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
                    balance: "Total Balance",
                    members: "Members",
                    proposals: "Proposals",
                    target: "Target",
                    noLimit: "No Limit",
                    progress: "Progress",
                    yourContribution: "Your Contribution"
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
        // Landing Page
        landing: {
            hero: {
                title: "Gastos Compartidos en Blockchain",
                subtitle: "Crea fondos, administra gastos y vota propuestas con total transparencia. Sin intermediarios, sin comisiones ocultas.",
                cta: "Abrir App",
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
            cta: {
                title: "¿Listo para transformar tus gastos compartidos?",
                subtitle: "Únete a miles de usuarios que ya usan SplitExpense",
                button: "Comenzar Gratis"
            },
            footer: {
                tagline: "Hecho con ❤️ usando Ethereum & Base.",
                subtitle: "Código abierto • Sin custodia • Descentralizado",
                links: {
                    product: "Producto",
                    resources: "Recursos",
                    legal: "Legal"
                }
            }
        },
        // App Platform
        app: {
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
                title: "Elige Tu Apodo",
                subtitle: "Así te verán los demás miembros",
                placeholder: "Ingresa tu apodo",
                save: "Guardar Apodo",
                success: "¡Apodo guardado exitosamente!"
            },
            dashboard: {
                title: "Mis Fondos",
                empty: {
                    title: "Aún no tienes fondos",
                    subtitle: "Crea tu primer fondo para empezar a gestionar gastos compartidos",
                    button: "Crear Primer Fondo"
                },
                filters: {
                    all: "Todos",
                    creator: "Creados",
                    member: "Miembro",
                    active: "Activos",
                    inactive: "Inactivos"
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
                    balance: "Balance Total",
                    members: "Miembros",
                    proposals: "Propuestas",
                    target: "Meta",
                    noLimit: "Sin Límite",
                    progress: "Progreso",
                    yourContribution: "Tu Aportación"
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
    return localStorage.getItem('language') || 'en';
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

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, getCurrentLanguage, translations };
}
