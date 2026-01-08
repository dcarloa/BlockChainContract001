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
            balance: "Total Expenses",
            target: "Budget",
            progress: "Progress",
            deposit: "Add Expense",
            vote: "Timeline",
            viewMembers: "Members",
            recentActivity: "Recent Activity",
            deposited: "paid restaurant",
            hoursAgo: "hours ago",
            proposalApproved: "Settlement calculated",
            dayAgo: "day ago",
            transactionCost: "Cost per transaction",
            transparent: "Transparent",
            confirmation: "Confirmation",
            seeDemo: "See Demo"
        },
        // Landing Page
        landing: {
            hero: {
                title: "Split Expenses Like Ants Work Together",
                subtitle: "Track shared expenses, split bills, and settle debts with smart optimization. 12 currencies supported. Free forever.",
                cta: "Start Free",
                stats: {
                    users: "Active Users",
                    funds: "Total Groups",
                    confirmation: "Confirmation"
                }
            },
            features: {
                title: "Why Ant Pool?",
                subtitle: "The ultimate solution for shared expenses",
                items: {
                    transparent: {
                        title: "100% Transparent",
                        desc: "All transactions visible to group members. No hidden accounts, no surprises. Verify every movement in real time."
                    },
                    secure: {
                        title: "Ultra Secure",
                        desc: "Your data protected by Firebase security. Only you and your group can access the information."
                    },
                    voting: {
                        title: "Smart Settlements",
                        desc: "AI-powered debt optimization. Minimize transactions automatically—like ants finding the shortest path."
                    },
                    fast: {
                        title: "12 Currencies",
                        desc: "USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Track expenses in your local currency."
                    },
                    nocustody: {
                        title: "Free Forever",
                        desc: "No subscriptions, no premium tiers, no ads. Completely free for unlimited groups and members."
                    },
                    flexible: {
                        title: "Totally Flexible",
                        desc: "From trips with friends to family savings. Adapt Ant Pool to any situation."
                    }
                }
            },
            howItWorks: {
                title: "How Does It Work?",
                subtitle: "Create your group in 3 simple steps",
                steps: {
                    create: {
                        title: "Create Group",
                        desc: "Choose a name, select a currency and invite your friends with email."
                    },
                    deposit: {
                        title: "Track Expenses",
                        desc: "Each member adds their expenses. Everything recorded transparently in the timeline."
                    },
                    vote: {
                        title: "Smart Settlements",
                        desc: "See who owes whom with optimized payments. Settle debts outside the app."
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
                title: "Why Ant Pool Wins",
                noIntermediaries: {
                    title: "Global Ant Colony",
                    desc: "12 currencies supported. Track expenses in USD, COP, EUR, MXN, and more. Your colony works worldwide."
                },
                immutable: {
                    title: "100% Free Forever",
                    desc: "No subscriptions. No premium tiers. No ads. Like ants sharing food freely in their colony."
                },
                openSource: {
                    title: "Smart Debt Optimization",
                    desc: "Like ants finding the shortest path, our algorithm minimizes transactions automatically."
                },
                available: {
                    title: "Available 24/7",
                    desc: "Access your colony anytime from any device. Mobile-optimized design. Real-time updates."
                },
                comparisonTitle: "Ant Pool vs Competitors",
                comparisonFeature: "Feature",
                comparisonSE: "Ant Pool",
                comparisonTraditional: "Splitwise/Tricount",
                transparency: "Price",
                total: "FREE Forever",
                limited: "$3-5/month Premium",
                fees: "Currencies",
                control: "Smart Settlements",
                yours: "Yours",
                company: "Company",
                audit: "Audit",
                public: "Public",
                private: "Private",
                availability: "Availability"
            },
            cta: {
                title: "Ready to transform your shared expenses?",
                subtitle: "Join thousands of users already using Ant Pool",
                button: "Start for Free",
                noRegistration: "No subscriptions • No ads • Pure cooperation"
            },
            footer: {
                tagline: "Made with ❤️ for cooperative expense management.",
                subtitle: "Free forever • Mobile-first • Collaborative",
                description: "The most transparent way to manage shared expenses with smart optimization.",
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
                createFund: "Create Group",
                disconnect: "Disconnect"
            },
            welcome: {
                title: "Welcome to Ant Pool",
                subtitle: "Shared expense management made simple",
                connect: "Connect Wallet",
                connecting: "Connecting...",
                setNickname: "Set Nickname"
            },
            nickname: {
                title: "Welcome to Ant Pool!",
                subtitle: "You need to set a nickname to identify yourself in groups and create them.",
                label: "Your Nickname *",
                placeholder: "e.g.: John, Maria123, etc.",
                help: "3-32 characters, letters and numbers only. It will identify you in all your groups.",
                button: "Set Nickname and Continue",
                save: "Save Nickname",
                success: "Nickname saved successfully!"
            },
            stats: {
                groupsCreated: "Groups Created",
                activeGroups: "Active Groups",
                groupsJoined: "Groups Joined"
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
                    create: "Create Group",
                    creating: "Creating..."
                },
                success: "Group created successfully!"
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
                    invitation: "You have a pending invitation to this group",
                    accept: "Accept Invitation",
                    closed: "This group is closed. No more actions allowed."
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
                    title: "Group Members",
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
                    button: "Propose Settlement",
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
                    borrowedWarning: "⚠️ BORROWED BALANCE ALERT",
                    borrowedWarningText: "This expense exceeds the contributions of the involved members. ALL members must vote.",
                    totalBorrowed: "Total borrowed from non-involved members:",
                    borrowedPerPerson: "Borrowed per non-involved member:",
                    allMustVote: "All group members can vote on this proposal"
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
                        "Verify carefully: If you send money to an incorrect address, it will be lost forever",
                        "No refunds: Blockchain transactions are irreversible",
                        "Your responsibility: Double-check that the address belongs to the intended recipient"
                    ],
                    detected: "Address detected:",
                    finalConfirmation: "FINAL CONFIRMATION",
                    confirmationText: "By clicking 'Confirm', you declare that:",
                    confirmationPoints: [
                        "This address is correct and belongs to the intended recipient",
                        "This address is on the Base blockchain",
                        "You understand that money sent to an incorrect address cannot be recovered",
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
                    title: "Group Management",
                    subtitle: "Advanced options to manage the group.",
                    memberManagement: "Member Management",
                    kickMember: "Kick Member",
                    kickDescription: "Remove a member from the group, returning their proportional share of the current balance.",
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
                    closeAndDistribute: "Close and Settle Group",
                    closeDescription: "This action will permanently close the group and settle all remaining balances proportionally among contributors according to their contribution.",
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
                loadingFunds: "Loading your groups...",
                acceptingInvite: "Accepting invitation to",
                loadingFundDetails: "Loading group details...",
                loadingFund: "Loading group...",
                deactivatingFund: "Deactivating fund...",
                reactivatingGroup: "Reactivating group...",
                deletingGroup: "Deleting group...",
                hidingFund: "Hiding fund...",
                creatingGroup: "Creating group...",
                creatingSimpleGroup: "Creating Simple Mode group...",
                creatingBlockchainFund: "Creating blockchain group...",
                waitingColonyConfirmation: "🐜 Waiting for colony confirmation...",
                loadingNewGroup: "Loading your new group...",
                loadingNewFund: "Loading your new group...",
                depositingFunds: "Adding to balance...",
                sendingInvite: "Sending invitation...",
                acceptingInvitation: "Accepting invitation...",
                creatingProposal: "Creating proposal...",
                voting: "Voting...",
                executing: "Executing...",
                closingFund: "Closing group...",
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
                loadingFundInfo: "Loading group information...",
                resolvingRecipient: "Resolving recipient...",
                registeringVote: "Registering vote...",
                cancelingProposal: "Canceling proposal...",
                executingProposal: "Executing proposal...",
                openingPortal: "Opening customer portal..."
            },
            errors: {
                notLoggedIn: "You must be logged in",
                noSubscription: "No subscription found",
                portalError: "Failed to open customer portal"
            },
            subscription: {
                paymentSuccess: "🎉 Welcome to PRO! Your subscription is now active.",
                paymentCancelled: "Payment was cancelled. You can subscribe anytime from your profile."
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
            balance: "Gastos Totales",
            target: "Presupuesto",
            progress: "Progreso",
            deposit: "Agregar Gasto",
            vote: "Cronología",
            viewMembers: "Miembros",
            recentActivity: "Actividad Reciente",
            deposited: "pagó restaurante",
            hoursAgo: "Hace 2 horas",
            proposalApproved: "Liquidación calculada",
            dayAgo: "Hace 1 día",
            transactionCost: "Costo por transacción",
            transparent: "Transparente",
            confirmation: "Confirmación",
            seeDemo: "Ver Demo"
        },
        // Landing Page
        landing: {
            hero: {
                title: "Divide Gastos Como Hormigas Trabajan Juntas",
                subtitle: "Rastrea gastos compartidos, divide cuentas y liquida deudas con optimización inteligente. 12 monedas soportadas. Gratis para siempre.",
                cta: "Comenzar Gratis",
                stats: {
                    users: "Usuarios Activos",
                    funds: "Grupos Totales",
                    confirmation: "Confirmación"
                }
            },
            features: {
                title: "¿Por qué Ant Pool?",
                subtitle: "La solución definitiva para gastos compartidos",
                items: {
                    transparent: {
                        title: "100% Transparente",
                        desc: "Todas las transacciones visibles para los miembros del grupo. Sin cuentas ocultas, sin sorpresas. Verifica cada movimiento en tiempo real."
                    },
                    secure: {
                        title: "Ultra Seguro",
                        desc: "Tus datos protegidos por la seguridad de Firebase. Solo tú y tu grupo pueden acceder a la información."
                    },
                    voting: {
                        title: "Liquidaciones Inteligentes",
                        desc: "Optimización de deudas con IA. Minimiza transacciones automáticamente—como hormigas encontrando el camino más corto."
                    },
                    fast: {
                        title: "12 Monedas",
                        desc: "USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Rastrea gastos en tu moneda local."
                    },
                    nocustody: {
                        title: "Gratis Para Siempre",
                        desc: "Sin suscripciones, sin niveles premium, sin anuncios. Completamente gratis para grupos y miembros ilimitados."
                    },
                    flexible: {
                        title: "Totalmente Flexible",
                        desc: "Desde viajes con amigos hasta ahorros familiares. Adapta Ant Pool a cualquier situación."
                    }
                }
            },
            howItWorks: {
                title: "¿Cómo Funciona?",
                subtitle: "Crea tu grupo en 3 simples pasos",
                steps: {
                    create: {
                        title: "Crear Grupo",
                        desc: "Elige un nombre, selecciona una moneda e invita a tus amigos con email."
                    },
                    deposit: {
                        title: "Rastrear Gastos",
                        desc: "Cada miembro agrega sus gastos. Todo registrado transparentemente en la línea de tiempo."
                    },
                    vote: {
                        title: "Liquidaciones Inteligentes",
                        desc: "Ve quién le debe a quién con pagos optimizados. Liquida deudas fuera de la app."
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
                title: "¿Por qué Ant Pool Gana?",
                noIntermediaries: {
                    title: "Colonia de Hormigas Global",
                    desc: "12 monedas soportadas. Rastrea gastos en USD, COP, EUR, MXN, y más. Tu colonia funciona en todo el mundo."
                },
                immutable: {
                    title: "100% Gratis Para Siempre",
                    desc: "Sin suscripciones. Sin niveles premium. Sin anuncios. Como hormigas compartiendo comida libremente en su colonia."
                },
                openSource: {
                    title: "Optimización Inteligente de Deudas",
                    desc: "Como hormigas encontrando el camino más corto, nuestro algoritmo minimiza transacciones automáticamente."
                },
                available: {
                    title: "Disponible 24/7",
                    desc: "Accede a tu colonia en cualquier momento desde cualquier dispositivo. Diseño optimizado para móviles. Actualizaciones en tiempo real."
                },
                comparisonTitle: "Ant Pool vs Competidores",
                comparisonFeature: "Característica",
                comparisonSE: "Ant Pool",
                comparisonTraditional: "Splitwise/Tricount",
                transparency: "Precio",
                total: "GRATIS Para Siempre",
                limited: "$3-5/mes Premium",
                fees: "Monedas",
                control: "Liquidaciones Inteligentes",
                yours: "Tuyo",
                company: "Empresa",
                audit: "Auditoría",
                public: "Pública",
                private: "Privada",
                availability: "Disponibilidad"
            },
            cta: {
                title: "¿Listo para transformar tus gastos compartidos?",
                subtitle: "Únete a miles de usuarios que ya usan Ant Pool",
                button: "Comenzar Gratis",
                noRegistration: "Sin suscripciones • Sin anuncios • Pura cooperación"
            },
            footer: {
                tagline: "Hecho con ❤️ para la gestión cooperativa de gastos.",
                subtitle: "Gratis para siempre • Enfocado en móviles • Colaborativo",
                description: "La forma más transparente de gestionar gastos compartidos con optimización inteligente.",
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
                createFund: "Crear Grupo",
                disconnect: "Desconectar"
            },
            welcome: {
                title: "Bienvenido a Ant Pool",
                subtitle: "Gestión de gastos compartidos simplificada",
                connect: "Conectar Wallet",
                connecting: "Conectando...",
                setNickname: "Establecer Apodo"
            },
            nickname: {
                title: "¡Bienvenido a Ant Pool!",
                subtitle: "Necesitas establecer un nickname para identificarte en los grupos y poder crearlos.",
                label: "Tu Nickname *",
                placeholder: "Ej: Juan, Maria123, etc.",
                help: "3-32 caracteres, solo letras y números. Te identificará en todos tus grupos.",
                button: "Establecer Nickname y Continuar",
                save: "Guardar Apodo",
                success: "¡Apodo guardado exitosamente!"
            },
            stats: {
                groupsCreated: "Grupos Creados",
                activeGroups: "Grupos Activos",
                groupsJoined: "Grupos Unidos"
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
                    create: "Crear Grupo",
                    creating: "Creando..."
                },
                success: "¡Grupo creado exitosamente!"
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
                    invitation: "Tienes una invitación pendiente a este grupo",
                    accept: "Aceptar Invitación",
                    closed: "Este grupo está cerrado. No se permiten más acciones."
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
                    title: "Miembros del Grupo",
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
                    button: "Proponer Liquidación",
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
                    borrowedWarning: "⚠️ ALERTA DE SALDO PRESTADO",
                    borrowedWarningText: "Este gasto excede las contribuciones de los miembros involucrados. TODOS los miembros deben votar.",
                    totalBorrowed: "Total prestado de miembros no involucrados:",
                    borrowedPerPerson: "Prestado por cada miembro no involucrado:",
                    allMustVote: "Todos los miembros del grupo pueden votar en esta propuesta"
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
                        "Verifica cuidadosamente: Si envías dinero a una dirección incorrecta, se perderá para siempre",
                        "Sin reembolsos: Las transacciones en blockchain son irreversibles",
                        "Tu responsabilidad: Verifica dos veces que la dirección pertenece al destinatario correcto"
                    ],
                    detected: "Dirección detectada:",
                    finalConfirmation: "CONFIRMACIÓN FINAL",
                    confirmationText: "Al hacer clic en 'Confirmar', declaras que:",
                    confirmationPoints: [
                        "Esta dirección es correcta y pertenece al destinatario previsto",
                        "Esta dirección está en la blockchain de Base",
                        "Entiendes que el dinero enviado a una dirección incorrecta no puede recuperarse",
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
                    title: "Gestión del Grupo",
                    subtitle: "Opciones avanzadas para administrar el grupo.",
                    memberManagement: "Gestión de Miembros",
                    kickMember: "Expulsar Miembro",
                    kickDescription: "Expulsa a un miembro del grupo devolviendo su parte proporcional del saldo actual.",
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
                    closeAndDistribute: "Cerrar y Liquidar Grupo",
                    closeDescription: "Esta acción cerrará permanentemente el grupo y liquidará todos los saldos restantes proporcionalmente entre los contribuyentes según su aportación.",
                    warning: "Advertencia:",
                    warningPoints: [
                        "Esta acción es irreversible",
                        "Solo el creador del grupo puede ejecutarla",,
                        "Cada contribuyente recibirá: (su aportación / total) × balance actual",
                        "El grupo quedará cerrado permanentemente",
                        "No se podrán hacer más depósitos ni propuestas"
                    ],
                    distributionPreview: "Vista Previa de Distribución",
                    previewButton: "Vista Previa de Distribución",
                    closeButton: "Cerrar y Liquidar Grupo",
                    pause: "Pausar Grupo",
                    pausing: "Pausando...",
                    pauseSuccess: "Grupo pausado. Ahora está en modo solo lectura.",
                    pauseConfirm: "¿Pausar el grupo? Esto bloqueará todas las transacciones (depósitos, propuestas, votos). El grupo seguirá visible en modo solo lectura."
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
                loadingFunds: "Cargando tus grupos...",
                acceptingInvite: "Aceptando invitación a",
                loadingFundDetails: "Cargando detalles del grupo...",
                loadingFund: "Cargando grupo...",
                deactivatingFund: "Desactivando grupo...",
                reactivatingGroup: "Reactivando grupo...",
                deletingGroup: "Eliminando grupo...",
                hidingFund: "Ocultando grupo...",
                creatingGroup: "Creando grupo...",
                creatingSimpleGroup: "Creando grupo en Modo Simple...",
                creatingBlockchainFund: "Creando grupo blockchain...",
                waitingColonyConfirmation: "🐜 Esperando confirmación de la colonia...",
                loadingNewGroup: "Cargando tu nuevo grupo...",
                loadingNewFund: "Cargando tu nuevo grupo...",
                depositingFunds: "Agregando al saldo...",
                sendingInvite: "Enviando invitación...",
                acceptingInvitation: "Aceptando invitación...",
                creatingProposal: "Creando propuesta...",
                voting: "Votando...",
                executing: "Ejecutando...",
                closingFund: "Cerrando grupo...",
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
                executingProposal: "Ejecutando propuesta...",
                openingPortal: "Abriendo portal de cliente..."
            },
            errors: {
                notLoggedIn: "Debes iniciar sesión",
                noSubscription: "No se encontró suscripción",
                portalError: "Error al abrir el portal de cliente"
            },
            subscription: {
                paymentSuccess: "🎉 ¡Bienvenido a PRO! Tu suscripción está activa.",
                paymentCancelled: "Pago cancelado. Puedes suscribirte cuando quieras desde tu perfil."
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
