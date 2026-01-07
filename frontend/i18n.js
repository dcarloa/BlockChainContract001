// 🌍 Internationalization System
// Default language: English

const translations = {
    en: {
        // Navigation
        nav: {
            features: "The Colony",
            howItWorks: "How Ants Work",
            benefits: "Ant Power",
            faq: "FAQ",
            launchApp: "Join Colony"
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
                title: "Create New Group",
                sections: {
                    type: "Group Type",
                    typeDesc: "Select the main purpose",
                    basic: "Basic Information",
                    basicDesc: "Define name, budget and description",
                    privacy: "Privacy",
                    privacyDesc: "Control who can join",
                    voting: "Voting Rules",
                    votingDesc: "Define how expenses are approved"
                },
                types: {
                    travel: "Travel",
                    travelDesc: "Vacations and adventures",
                    savings: "Savings",
                    savingsDesc: "Group financial goal",
                    roommates: "Roommates",
                    roommatesDesc: "Shared expenses",
                    other: "Other",
                    otherDesc: "Custom purpose"
                },
                fields: {
                    name: "Group Name",
                    namePlaceholder: "E.g.: Trip to Cancun 2025",
                    description: "Description",
                    descriptionPlaceholder: "Describe the group's purpose and what type of expenses will be managed...",
                    budget: "Budget or Goal",
                    budgetBadge: "Optional",
                    budgetHint: "Leave at 0 for unlimited expenses",
                    privateToggle: "Private Group",
                    privateDesc: "Only accessible with invitation",
                    approvalPercentage: "Approval Percentage",
                    approvalHint: "% of votes in favor to approve",
                    minimumVotes: "Minimum Votes",
                    minimumVotesHint: "Minimum quantity required"
                },
                buttons: {
                    cancel: "Cancel",
                    create: "Create Fund",
                    creating: "Creating..."
                },
                success: "Fund created successfully!"
            },
            fundDetail: {
                tabs: {
                    deposit: "Deposit",
                    invite: "Invite",
                    propose: "Propose Expense",
                    vote: "Vote",
                    history: "History",
                    balances: "Balances",
                    members: "Members",
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
                    privacy: "Privacy",
                    active: "Active",
                    inactive: "Inactive",
                    public: "Public",
                    private: "Private"
                },
                badges: {
                    travel: "Travel",
                    savings: "Savings",
                    shared: "Shared",
                    other: "Other",
                    creator: "Creator",
                    member: "Member"
                },
                banners: {
                    invitation: "You have a pending invitation to this fund",
                    accept: "Accept Invitation",
                    closed: "This fund is closed. No more actions allowed."
                },
                deposit: {
                    title: "Contribute to Common Pot",
                    subtitle: "Deposit money to the group. Useful for future expenses or to balance accounts.",
                    amount: "Amount to Deposit (ETH)",
                    amountPlaceholder: "0.0",
                    currentContribution: "Your current contribution",
                    button: "Contribute to Pot",
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
                    subtitle: "Invite friends to join the group. They must accept the invitation.",
                    infoTitle: "Information:",
                    infoPoints: [
                        "Only the group creator can invite",
                        "Invitees will see the invitation in their dashboard",
                        "They must accept before recording expenses",
                        "You cannot invite yourself"
                    ],
                    addressLabel: "Nickname or Address",
                    addressPlaceholder: "e.g.: Bob or 0x123...",
                    addressHelp: "Enter the user's nickname or their Ethereum address",
                    button: "Send Invitation",
                    sending: "Sending...",
                    success: "Invitation sent!"
                },
                propose: {
                    title: "Propose Expense",
                    subtitle: "Propose using money from the common pot to pay an external provider. The group will vote on approval.",
                    howItWorks: "How it works:",
                    howItWorksPoints: [
                        "Propose paying an expense from the common pot (hotel, restaurant, etc.)",
                        "Indicate who will be paid (external provider with their address)",
                        "The group votes whether to approve or reject using the pot money",
                        "If approved, money is sent directly from the pot to the provider"
                    ],
                    recipientLabel: "Who will be paid (Provider address)",
                    recipientPlaceholder: "0x123... (hotel address, restaurant, etc.)",
                    recipientHelp: "Ethereum address of the external agent who will receive payment",
                    amountLabel: "Amount to Pay (ETH)",
                    amountPlaceholder: "0.0",
                    amountHelp: "Amount that will be paid from the common pot to the provider",
                    descriptionLabel: "Expense Description",
                    descriptionPlaceholder: "e.g.: 3 nights hotel in Cancun - Payment to Marriott, Group dinner at La Costa Restaurant...",
                    descriptionHelp: "Explain the reason for the expense and who will be paid",
                    involvedMembersLabel: "Who is involved in this expense?",
                    involvedMembersHelp: "Select the members who will share this expense. Only selected members can vote on this proposal.",
                    selectAllMembers: "Select All",
                    deselectAllMembers: "Deselect All",
                    noMembersSelected: "You must select at least one member",
                    button: "Propose Use of Funds",
                    creating: "Creating...",
                    success: "Proposal created!"
                },
                vote: {
                    title: "Vote on Proposals",
                    description: "Here you will see all pending proposals that need your vote.",
                    noProposals: "No pending proposals",
                    noProposalsSubtitle: "When a member creates a proposal, it will appear here for you to vote",
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
                    executeSuccess: "Proposal executed!",
                    borrowedWarning: "⚠️ BORROWED FUNDS ALERT",
                    borrowedWarningText: "This expense exceeds the contributions of the involved members. ALL members must vote.",
                    totalBorrowed: "Total borrowed from non-involved members:",
                    borrowedPerPerson: "Borrowed per non-involved member:",
                    allMustVote: "All fund members can vote on this proposal"
                },
                history: {
                    title: "Proposal History",
                    description: "View all proposals that have been approved, rejected, or executed.",
                    empty: "No history",
                    emptySubtitle: "When proposals are approved or rejected, they will appear here"
                },
                balances: {
                    title: "Group Balances",
                    description: "View how much each member owes or is owed based on their contributions and share of approved expenses.",
                    currentBalance: "Current Balance",
                    totalContributions: "Total Contributions",
                    totalExpenses: "Total Expenses",
                    howItWorks: "How balances are calculated:",
                    howItWorksPoints: [
                        "Total Contributions: Sum of all deposits made by members",
                        "Total Expenses: Sum of all approved and executed proposals",
                        "Fair Share: Total expenses ÷ Number of active members",
                        "Individual Balance: Member's contribution - Fair share",
                        "Green (+): You contributed more, others owe you. Red (-): You owe to the group"
                    ],
                    empty: "No members",
                    emptySubtitle: "Balances will appear when members start contributing"
                },
                qrScanner: {
                    title: "Scan QR Code",
                    warning: "IMPORTANT - Read carefully:",
                    warningPoints: [
                        "Base Network Only: The address MUST be a valid address on the Base blockchain",
                        "Verify carefully: If you send funds to an incorrect address, they will be lost forever",
                        "No refunds: Blockchain transactions are irreversible",
                        "Your responsibility: Double-check that the address belongs to the intended recipient"
                    ],
                    detected: "Address detected:",
                    finalConfirmation: "FINAL CONFIRMATION",
                    confirmationText: "By clicking 'Confirm', you declare that:",
                    confirmationPoints: [
                        "This address is correct and belongs to the intended recipient",
                        "This address is on the Base blockchain",
                        "You understand that funds sent to an incorrect address cannot be recovered",
                        "You assume full responsibility for this address"
                    ],
                    checkboxLabel: "I have verified the address and accept full responsibility",
                    confirmButton: "Confirm and Use Address",
                    cancelButton: "Cancel",
                    cancelScan: "Cancel Scan",
                    invalidQR: "The QR code does not contain a valid Ethereum address",
                    noAddress: "No scanned address",
                    mustConfirm: "You must confirm that you verified the address",
                    scanSuccess: "Address scanned and confirmed",
                    cameraError: "Error starting camera. Check permissions."
                },
                manage: {
                    title: "Fund Management",
                    subtitle: "Advanced options to manage the fund.",
                    memberManagement: "Member Management",
                    kickMember: "Kick Member",
                    kickDescription: "Remove a member from the group, returning their proportional share of current funds.",
                    howItWorks: "How it works:",
                    kickPoints: [
                        "Member is removed from the group permanently",
                        "Receives: (Their contribution / Total contributions) × Current balance",
                        "Cannot participate in future votes",
                        "Their previous votes remain recorded"
                    ],
                    noMembersToKick: "No members to kick",
                    noMembersSubtitle: "Only one member in the group or you are not the creator",
                    dangerZone: "Danger Zone",
                    closeAndDistribute: "Close and Distribute Fund",
                    closeDescription: "This action will permanently close the fund and distribute all remaining funds proportionally among contributors according to their contribution.",
                    warning: "Warning:",
                    warningPoints: [
                        "This action is irreversible",
                        "Only the fund creator can execute it",
                        "Each contributor will receive: (their contribution / total) × current balance",
                        "The fund will be permanently closed",
                        "No more deposits or proposals will be allowed"
                    ],
                    distributionPreview: "Distribution Preview",
                    previewButton: "Preview Distribution",
                    closeButton: "Close and Distribute Fund",
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
            loading: {
                default: "Loading...",
                selectWallet: "Select your wallet...",
                connecting: "Connecting with",
                switchingNetwork: "Switching network...",
                disconnecting: "Disconnecting wallet...",
                redirecting: "Redirecting to home page...",
                verifyingNickname: "Verifying nickname...",
                checkingNickname: "Checking current nickname...",
                checkingAvailability: "Checking availability...",
                settingNickname: "Setting nickname...",
                loadingFunds: "Loading your funds...",
                acceptingInvite: "Accepting invitation to",
                loadingFundDetails: "Loading fund details...",
                loadingFund: "Loading fund...",
                deactivatingFund: "Deactivating fund...",
                reactivatingGroup: "Reactivating group...",
                deletingGroup: "Deleting group...",
                hidingFund: "Hiding fund...",
                creatingGroup: "Creating group...",
                creatingSimpleGroup: "Creating Simple Mode group...",
                creatingBlockchainFund: "Creating blockchain fund...",
                waitingColonyConfirmation: "🐜 Waiting for colony confirmation...",
                loadingNewGroup: "Loading your new group...",
                loadingNewFund: "Loading your new fund...",
                depositingFunds: "Depositing funds...",
                sendingInvite: "Sending invitation...",
                acceptingInvitation: "Accepting invitation...",
                creatingProposal: "Creating proposal...",
                voting: "Voting...",
                executing: "Executing...",
                closingFund: "Closing fund...",
                withdrawing: "Withdrawing...",
                kicking: "Removing member...",
                loadingProposals: "Loading proposals...",
                loadingMembers: "Loading members...",
                loadingBalances: "Loading balances...",
                signingInGoogle: "Signing in with Google...",
                signingIn: "Signing in...",
                creatingAccount: "Creating account...",
                signingOut: "Signing out...",
                waitingBlockchainConfirmation: "⏳ Waiting for blockchain confirmation...",
                recalculatingBalances: "🐜 Recalculating balances...",
                updatingMembers: "🐜 Updating members...",
                updatingColonies: "🐜 Updating colonies...",
                syncingColony: "🐜 Syncing with the colony... (this may take a few seconds)",
                syncingVoteCount: "🐜 Syncing vote count... (this may take a few seconds)",
                updatingBalances: "🐜 Updating balances...",
                calculatingDistribution: "Calculating distribution...",
                closingAndDistributing: "Closing fund and distributing...",
                creatingRecurringExpense: "Creating recurring expense...",
                settingBudget: "Setting budget...",
                deletingBudget: "Deleting budget...",
                generatingAnalytics: "Generating analytics...",
                loadingGroup: "Loading group...",
                connectingMetaMask: "Connecting with MetaMask...",
                loadingFundInfo: "Loading fund information...",
                resolvingRecipient: "Resolving recipient...",
                registeringVote: "Registering vote...",
                cancelingProposal: "Canceling proposal...",
                executingProposal: "Executing proposal..."
            },
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
            features: "La Colonia",
            howItWorks: "Cómo Trabajan las Hormigas",
            benefits: "Poder Hormiga",
            faq: "FAQ",
            launchApp: "Unirse a la Colonia"
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
                title: "Crear Nuevo Grupo",
                sections: {
                    type: "Tipo de Grupo",
                    typeDesc: "Selecciona el propósito principal",
                    basic: "Información Básica",
                    basicDesc: "Define nombre, presupuesto y descripción",
                    privacy: "Privacidad",
                    privacyDesc: "Controla quién puede unirse",
                    voting: "Reglas de Votación",
                    votingDesc: "Define cómo se aprueban los gastos"
                },
                types: {
                    travel: "Viaje",
                    travelDesc: "Vacaciones y aventuras",
                    savings: "Ahorro",
                    savingsDesc: "Meta financiera grupal",
                    roommates: "Roommates",
                    roommatesDesc: "Gastos compartidos",
                    other: "Otro",
                    otherDesc: "Propósito personalizado"
                },
                fields: {
                    name: "Nombre del Grupo",
                    namePlaceholder: "Ej: Viaje a Cancún 2025",
                    description: "Descripción",
                    descriptionPlaceholder: "Describe el propósito del grupo y qué tipo de gastos se manejarán...",
                    budget: "Presupuesto o Meta",
                    budgetBadge: "Opcional",
                    budgetHint: "Deja en 0 para gastos sin límite",
                    privateToggle: "Grupo Privado",
                    privateDesc: "Solo pueden unirse con invitación",
                    approvalPercentage: "Porcentaje de Aprobación",
                    approvalHint: "% de votos a favor para aprobar",
                    minimumVotes: "Votos Mínimos",
                    minimumVotesHint: "Cantidad mínima requerida"
                },
                buttons: {
                    cancel: "Cancelar",
                    create: "Crear Fondo",
                    creating: "Creando..."
                },
                success: "¡Fondo creado exitosamente!"
            },
            fundDetail: {
                tabs: {
                    deposit: "Depositar",
                    invite: "Invitar",
                    propose: "Proponer Gasto",
                    vote: "Votar",
                    history: "Historial",
                    balances: "Balances",
                    members: "Miembros",
                    manage: "Gestionar"
                },
                info: {
                    balance: "Balance",
                    members: "Miembros",
                    proposals: "Propuestas",
                    target: "Meta",
                    noLimit: "Sin límite",
                    progress: "Progreso",
                    yourContribution: "Tu Aportación",
                    backToDashboard: "Volver a Mis Grupos",
                    loading: "Cargando...",
                    type: "Tipo",
                    status: "Estado",
                    privacy: "Privacidad",
                    active: "Activo",
                    inactive: "Inactivo",
                    public: "Público",
                    private: "Privado"
                },
                badges: {
                    travel: "Viaje",
                    savings: "Ahorro",
                    shared: "Compartido",
                    other: "Otro",
                    creator: "Creador",
                    member: "Miembro"
                },
                banners: {
                    invitation: "Tienes una invitación pendiente a este fondo",
                    accept: "Aceptar Invitación",
                    closed: "Este fondo está cerrado. No se permiten más acciones."
                },
                deposit: {
                    title: "Aportar al Bote Común",
                    subtitle: "Deposita dinero al grupo. Útil para gastos futuros o para equilibrar balances.",
                    amount: "Monto a Depositar (ETH)",
                    amountPlaceholder: "0.0",
                    currentContribution: "Tu contribución actual",
                    button: "Aportar al Bote",
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
                    subtitle: "Invita a amigos a unirse al grupo. Deben aceptar la invitación.",
                    infoTitle: "Información:",
                    infoPoints: [
                        "Solo el creador del grupo puede invitar",
                        "Los invitados verán la invitación en su panel",
                        "Deben aceptar antes de registrar gastos",
                        "No puedes invitarte a ti mismo"
                    ],
                    addressLabel: "Nickname o Dirección",
                    addressPlaceholder: "Ej: Bob o 0x123...",
                    addressHelp: "Ingresa el nickname del usuario o su dirección Ethereum",
                    button: "Enviar Invitación",
                    sending: "Enviando...",
                    success: "¡Invitación enviada!"
                },
                propose: {
                    title: "Proponer Gasto",
                    subtitle: "Propón usar dinero del bote común para pagar a un proveedor externo. El grupo votará la aprobación.",
                    howItWorks: "Cómo funciona:",
                    howItWorksPoints: [
                        "Propones pagar un gasto del bote común (hotel, restaurante, etc.)",
                        "Indicas quién será pagado (proveedor externo con su dirección)",
                        "El grupo vota si aprueba o rechaza usar el dinero del bote",
                        "Si se aprueba, el dinero se envía directamente del bote al proveedor"
                    ],
                    recipientLabel: "Quién será pagado (Dirección del proveedor)",
                    recipientPlaceholder: "0x123... (dirección hotel, restaurante, etc.)",
                    recipientHelp: "Dirección Ethereum del agente externo que recibirá el pago",
                    amountLabel: "Monto a Pagar (ETH)",
                    amountPlaceholder: "0.0",
                    amountHelp: "Cantidad que se pagará del bote común al proveedor",
                    descriptionLabel: "Descripción del Gasto",
                    descriptionPlaceholder: "Ej: 3 noches hotel en Cancún - Pago a Marriott, Cena grupal en Restaurante La Costa...",
                    descriptionHelp: "Explica el motivo del gasto y quién será pagado",
                    involvedMembersLabel: "¿Quiénes están involucrados en este gasto?",
                    involvedMembersHelp: "Selecciona los miembros que compartirán este gasto. Solo los miembros seleccionados podrán votar en esta propuesta.",
                    selectAllMembers: "Seleccionar Todos",
                    deselectAllMembers: "Deseleccionar Todos",
                    noMembersSelected: "Debes seleccionar al menos un miembro",
                    button: "Proponer Uso de Fondos",
                    creating: "Creando...",
                    success: "¡Propuesta creada!"
                },
                vote: {
                    title: "Votar Propuestas",
                    description: "Aquí verás todas las propuestas pendientes que necesitan tu voto.",
                    noProposals: "No hay propuestas pendientes",
                    noProposalsSubtitle: "Cuando un miembro cree una propuesta, aparecerá aquí para que votes",
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
                    executeSuccess: "¡Propuesta ejecutada!",
                    borrowedWarning: "⚠️ ALERTA DE FONDOS PRESTADOS",
                    borrowedWarningText: "Este gasto excede las contribuciones de los miembros involucrados. TODOS los miembros deben votar.",
                    totalBorrowed: "Total prestado de miembros no involucrados:",
                    borrowedPerPerson: "Prestado por cada miembro no involucrado:",
                    allMustVote: "Todos los miembros del fondo pueden votar en esta propuesta"
                },
                history: {
                    title: "Historial de Propuestas",
                    description: "Visualiza todas las propuestas que han sido aprobadas, rechazadas o ejecutadas.",
                    empty: "Sin historial",
                    emptySubtitle: "Cuando se aprueben o rechacen propuestas, aparecerán aquí"
                },
                balances: {
                    title: "Balances del Grupo",
                    description: "Visualiza cuánto debe o le deben a cada miembro según sus aportaciones y su parte de los gastos aprobados.",
                    currentBalance: "Balance Actual",
                    totalContributions: "Total Aportaciones",
                    totalExpenses: "Total Gastos",
                    howItWorks: "Cómo se calculan los balances:",
                    howItWorksPoints: [
                        "Total Aportaciones: Suma de todos los depósitos realizados por los miembros",
                        "Total Gastos: Suma de todas las propuestas aprobadas y ejecutadas",
                        "Parte Justa: Total gastos ÷ Número de miembros activos",
                        "Balance Individual: Aportación del miembro - Parte justa",
                        "Verde (+): Aportaste más, otros te deben. Rojo (-): Debes al grupo"
                    ],
                    empty: "Sin miembros",
                    emptySubtitle: "Los balances aparecerán cuando los miembros empiecen a aportar"
                },
                qrScanner: {
                    title: "Escanear Código QR",
                    warning: "IMPORTANTE - Lee con atención:",
                    warningPoints: [
                        "Solo Red Base: La dirección DEBE ser una dirección válida en la blockchain de Base",
                        "Verifica cuidadosamente: Si envías fondos a una dirección incorrecta, se perderán para siempre",
                        "Sin reembolsos: Las transacciones en blockchain son irreversibles",
                        "Tu responsabilidad: Verifica dos veces que la dirección pertenece al destinatario correcto"
                    ],
                    detected: "Dirección detectada:",
                    finalConfirmation: "CONFIRMACIÓN FINAL",
                    confirmationText: "Al hacer clic en 'Confirmar', declaras que:",
                    confirmationPoints: [
                        "Esta dirección es correcta y pertenece al destinatario previsto",
                        "Esta dirección está en la blockchain de Base",
                        "Entiendes que los fondos enviados a una dirección incorrecta no pueden recuperarse",
                        "Asumes toda la responsabilidad por esta dirección"
                    ],
                    checkboxLabel: "He verificado la dirección y acepto toda la responsabilidad",
                    confirmButton: "Confirmar y Usar Dirección",
                    cancelButton: "Cancelar",
                    cancelScan: "Cancelar Escaneo",
                    invalidQR: "El código QR no contiene una dirección Ethereum válida",
                    noAddress: "No hay dirección escaneada",
                    mustConfirm: "Debes confirmar que verificaste la dirección",
                    scanSuccess: "Dirección escaneada y confirmada",
                    cameraError: "Error al iniciar la cámara. Verifica los permisos."
                },
                manage: {
                    title: "Gestión del Fondo",
                    subtitle: "Opciones avanzadas para administrar el fondo.",
                    memberManagement: "Gestión de Miembros",
                    kickMember: "Expulsar Miembro",
                    kickDescription: "Expulsa a un miembro del grupo devolviéndole su parte proporcional de los fondos actuales.",
                    howItWorks: "Cómo funciona:",
                    kickPoints: [
                        "El miembro es removido del grupo permanentemente",
                        "Recibe: (Su aportación / Total aportaciones) × Balance actual",
                        "No podrá participar en votaciones futuras",
                        "Sus votos anteriores quedan registrados"
                    ],
                    noMembersToKick: "No hay miembros para expulsar",
                    noMembersSubtitle: "Solo hay un miembro en el grupo o no eres el creador",
                    dangerZone: "Zona de Peligro",
                    closeAndDistribute: "Cerrar y Distribuir Fondo",
                    closeDescription: "Esta acción cerrará permanentemente el fondo y distribuirá todos los fondos restantes proporcionalmente entre los contribuyentes según su aportación.",
                    warning: "Advertencia:",
                    warningPoints: [
                        "Esta acción es irreversible",
                        "Solo el creador del fondo puede ejecutarla",
                        "Cada contribuyente recibirá: (su aportación / total) × balance actual",
                        "El fondo quedará cerrado permanentemente",
                        "No se podrán hacer más depósitos ni propuestas"
                    ],
                    distributionPreview: "Vista Previa de Distribución",
                    previewButton: "Vista Previa de Distribución",
                    closeButton: "Cerrar y Distribuir Fondo",
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
            loading: {
                default: "Cargando...",
                selectWallet: "Selecciona tu wallet...",
                connecting: "Conectando con",
                switchingNetwork: "Cambiando de red...",
                disconnecting: "Desconectando wallet...",
                redirecting: "Redirigiendo a la página principal...",
                verifyingNickname: "Verificando nickname...",
                checkingNickname: "Verificando nickname actual...",
                checkingAvailability: "Verificando disponibilidad...",
                settingNickname: "Estableciendo nickname...",
                loadingFunds: "Cargando tus fondos...",
                acceptingInvite: "Aceptando invitación a",
                loadingFundDetails: "Cargando detalles del fondo...",
                loadingFund: "Cargando fondo...",
                deactivatingFund: "Desactivando fondo...",
                reactivatingGroup: "Reactivando grupo...",
                deletingGroup: "Eliminando grupo...",
                hidingFund: "Ocultando fondo...",
                creatingGroup: "Creando grupo...",
                creatingSimpleGroup: "Creando grupo en Modo Simple...",
                creatingBlockchainFund: "Creando fondo blockchain...",
                waitingColonyConfirmation: "🐜 Esperando confirmación de la colonia...",
                loadingNewGroup: "Cargando tu nuevo grupo...",
                loadingNewFund: "Cargando tu nuevo fondo...",
                depositingFunds: "Depositando fondos...",
                sendingInvite: "Enviando invitación...",
                acceptingInvitation: "Aceptando invitación...",
                creatingProposal: "Creando propuesta...",
                voting: "Votando...",
                executing: "Ejecutando...",
                closingFund: "Cerrando fondo...",
                withdrawing: "Retirando...",
                kicking: "Removiendo miembro...",
                loadingProposals: "Cargando propuestas...",
                loadingMembers: "Cargando miembros...",
                loadingBalances: "Cargando balances...",
                signingInGoogle: "Iniciando sesión con Google...",
                signingIn: "Iniciando sesión...",
                creatingAccount: "Creando cuenta...",
                signingOut: "Cerrando sesión...",
                waitingBlockchainConfirmation: "⏳ Esperando confirmación de blockchain...",
                recalculatingBalances: "🐜 Recalculando balances...",
                updatingMembers: "🐜 Actualizando miembros...",
                updatingColonies: "🐜 Actualizando colonias...",
                syncingColony: "🐜 Sincronizando con la colonia... (esto puede tomar unos segundos)",
                syncingVoteCount: "🐜 Sincronizando conteo de votos... (esto puede tomar unos segundos)",
                updatingBalances: "🐜 Actualizando balances...",
                calculatingDistribution: "Calculando distribución...",
                closingAndDistributing: "Cerrando fondo y distribuyendo...",
                creatingRecurringExpense: "Creando gasto recurrente...",
                settingBudget: "Estableciendo presupuesto...",
                deletingBudget: "Eliminando presupuesto...",
                generatingAnalytics: "Generando análisis...",
                loadingGroup: "Cargando grupo...",
                connectingMetaMask: "Conectando con MetaMask...",
                loadingFundInfo: "Cargando información del fondo...",
                resolvingRecipient: "Resolviendo destinatario...",
                registeringVote: "Registrando voto...",
                cancelingProposal: "Cancelando propuesta...",
                executingProposal: "Ejecutando propuesta..."
            },
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
