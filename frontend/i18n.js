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
                title: "Work Together Like Ants",
                title2: "Build Wealth, Your Way",
                subtitle: "Just like ants work together, Ant Pool helps you track and split expenses effortlessly. Every ant contributes. Every ant benefits. Support 12 currencies worldwide with smart debt optimization.",
                cta: "Start Free Now",
                ctaExplore: "Explore Features",
                stats: {
                    free: "FREE",
                    forever: "Forever",
                    currencies: "12",
                    currenciesLabel: "Currencies",
                    smart: "SMART",
                    settlements: "Settlements"
                }
            },
            modesSection: {
                title: "Why Colonies Choose Ant Pool",
                subtitle: "Everything you need to manage shared expenses like nature intended",
                currencies12: {
                    title: "12 Currencies",
                    desc: "USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Track expenses in your local currency."
                },
                smartSettlements: {
                    title: "Smart Settlements",
                    desc: "AI-powered debt optimization. Minimize transactions automatically—like ants finding the shortest path."
                },
                free: {
                    title: "100% Free",
                    desc: "No subscriptions. No premium tiers. No ads. Free forever for unlimited groups and members."
                },
                mobileFirst: {
                    title: "Mobile First",
                    desc: "Optimized for phones, tablets, and desktop. Ants work everywhere, so does Ant Pool."
                },
                realTime: {
                    title: "Real-Time Updates",
                    desc: "Live expense tracking. Timeline filters. Instant notifications when colony members add expenses."
                },
                easySignIn: {
                    title: "Easy Sign-In",
                    desc: "Google or Email login. No technical knowledge needed. Join in seconds and start tracking."
                }
            },
            philosophy: {
                title: "The Ant Pool Philosophy",
                subtitle: "Inspired by nature's most efficient cooperators",
                workTogether: "Work Together",
                likeNature: "Like Nature Intended",
                multiCurrency: {
                    title: "Multi-Currency Support",
                    desc: "Track expenses in USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Global colonies, local currencies."
                },
                settlements: {
                    title: "Smart Settlements",
                    desc: "Debt optimization algorithm minimizes transactions. If Alice owes Bob and Bob owes Charlie, Alice pays Charlie directly."
                },
                timeline: {
                    title: "Timeline & Filters",
                    desc: "View expenses by week, month, or custom range. Every contribution is recorded and searchable with date filters."
                },
                updates: {
                    title: "Real-Time Updates",
                    desc: "All transactions visible to colony members. Instant notifications when expenses are added or modified."
                },
                mobile: {
                    title: "Mobile-First Design",
                    desc: "Compact cards, responsive layout, touch-optimized. Manage your colony from any device, anywhere."
                }
            },
            howItWorks: {
                title: "How Ants Cooperate",
                subtitle: "Follow the ant trail to collective success",
                threeSteps: "Three Steps to Colony Success",
                step1: {
                    title: "Create Your Colony",
                    desc: "Name your group, select your currency (12 supported), and invite members via email. Private or public—your choice."
                },
                step2: {
                    title: "Add Expenses as They Happen",
                    desc: "Every ant adds their expenses to the timeline. Date filters let you track weekly, monthly, or custom periods."
                },
                step3: {
                    title: "Smart Settlements",
                    desc: "Ant Pool calculates who owes whom with optimized debt paths. Settle outside the app—we just show you the shortest route."
                }
            },
            whereAnts: {
                title: "Where Ants Cooperate",
                subtitle: "Build your colony for any shared goal",
                travel: {
                    title: "Travel Colonies",
                    desc: "Explore the world as a swarm. Pool resources for adventures where every ant contributes and votes."
                },
                living: {
                    title: "Living Colonies",
                    desc: "Build your nest together. Share rent, utilities, groceries - just like ants share their home."
                },
                celebration: {
                    title: "Celebration Colonies",
                    desc: "Organize epic gatherings. From weddings to festivals - collective resources for collective joy."
                },
                business: {
                    title: "Business Colonies",
                    desc: "Build enterprises like anthills. Startup resources, investments, projects - transparent cooperation wins."
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
                subtitle: "Compare Ant Pool with competitors",
                globalColony: {
                    title: "Global Ant Colony",
                    desc: "12 currencies supported. Track expenses in USD, COP, EUR, MXN, and more. Like ants gathering from different sources, your colony works worldwide."
                },
                freeForever: {
                    title: "100% Free Forever",
                    desc: "No subscriptions. No premium tiers. No ads. Like ants sharing food freely in their colony, Ant Pool is completely free for everyone."
                },
                smartDebt: {
                    title: "Smart Debt Optimization",
                    desc: "Like ants finding the shortest path, our settlement algorithm minimizes transactions. If A owes B and B owes C, A pays C directly."
                },
                neverSleep: {
                    title: "Ants Never Sleep",
                    desc: "Access your colony 24/7 from any device. Mobile-optimized design. Timeline filters. Real-time updates. Work happens when it needs to."
                },
                comparisonTitle: "Ant Pool vs Competitors",
                comparisonFeature: "Feature",
                comparisonSE: "Ant Pool",
                comparisonTraditional: "Splitwise/Tricount",
                price: "Price",
                priceFree: "FREE Forever",
                pricePremium: "$3-5/month Premium",
                currencies: "Currencies",
                currencies12: "12 Currencies",
                currenciesLimited: "Limited (paid)",
                settlements: "Smart Settlements",
                settlementsAuto: "Auto-Optimized",
                settlementsManual: "Manual/Basic",
                timelineFilters: "Timeline Filters",
                dateFilters: "Date Filters",
                basicHistory: "Basic history",
                ads: "Ads",
                noAds: "No Ads",
                adsFreeTier: "Ads (free tier)",
                philosophy: "Philosophy",
                antColony: "Ant Colony",
                justApp: "Just an app"
            },
            faq: {
                title: "Frequently Asked Questions",
                subtitle: "Everything you need to know",
                q1: {
                    question: "Why is Ant Pool better than Splitwise or Tricount?",
                    answer: "Ant Pool is 100% free forever with no premium tiers or ads. We support 12 currencies (vs their limited free options), have smart settlement optimization to minimize transactions, and timeline filters for better expense tracking. Plus, our ant colony philosophy makes collaboration fun!"
                },
                q2: {
                    question: "How do I sign up for Ant Pool?",
                    answer: "Simply sign in with your Google account or Email. No downloads, no complicated setup. Create a group in seconds and start inviting your colony members!"
                },
                q3: {
                    question: "What currencies can I use?",
                    answer: "We support 12 currencies: USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Track expenses in multiple currencies within the same group. Perfect for international trips or global teams."
                },
                q4: {
                    question: "How does smart settlement optimization work?",
                    answer: "Our algorithm analyzes all debts and finds the minimum number of transactions needed. If Alice owes Bob $10 and Bob owes Charlie $10, instead of 2 transactions, Alice pays Charlie $10 directly. Just like ants finding the shortest path!"
                },
                q5: {
                    question: "Is my data secure?",
                    answer: "Absolutely! All data is protected by Firebase security. Only you and your group members can access your colony's information. We don't sell data, show ads, or track you."
                },
                q6: {
                    question: "Can I use Ant Pool on my phone?",
                    answer: "Yes! Ant Pool is mobile-first. Works perfectly on phones, tablets, and desktops. Progressive Web App (PWA) support means you can add it to your home screen."
                },
                q7: {
                    question: "How do I invite members to my group?",
                    answer: "Simply share the invite link or send email invitations from within the app. Members can join with Google or Email login - no downloads required."
                },
                q8: {
                    question: "What if someone doesn't pay their share?",
                    answer: "Ant Pool shows who owes what with complete transparency. Settlements happen outside the app (bank transfers, cash, etc.). We provide the calculations - you handle the payments."
                },
                q9: {
                    question: "Can I delete expenses or modify them?",
                    answer: "Yes! Group members can edit or delete expenses. All changes are recorded in the timeline for full transparency."
                },
                q10: {
                    question: "Is there a limit to how many groups I can create?",
                    answer: "No limits! Create unlimited groups for trips, roommates, family savings, events - whatever your colony needs. Completely free forever."
                }
            },
            cta: {
                title: "🐜 Ready to Join the Colony?",
                subtitle: "Be part of the cooperative finance revolution. Work together like ants. Build collective wealth.",
                button: "🐜 Enter the Ant Pool",
                noRegistration: "No queen ant • No worker exploitation • Pure cooperation"
            },
            footer: {
                tagline: "Made with ❤️ for cooperative expense management.",
                subtitle: "🐜 Open source • Community-driven • Built with ❤️",
                description: "🐜 Work together like ants. Track and split expenses cooperatively. Nature's wisdom meets modern expense management.",
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
                technology: "Built With",
                legal: "Legal",
                privacy: "Privacy Policy",
                terms: "Terms of Service",
                cookies: "Cookie Settings",
                firebase: "Firebase",
                javascript: "JavaScript",
                opensource: "Open Source",
                community: "Community",
                copyright: "© 2025 Ant Pool. Built by the colony, for the colony. Powered by modern web technologies."
            }
        },
        // App Platform
        app: {
            // Loading Overlay
            loadingOverlay: {
                loading: "Loading..."
            },
            // PWA Install Prompt
            pwa: {
                installTitle: "Install Ant Pool",
                installDesc: "Get the full app experience with offline access",
                installButton: "Install",
                dismissButton: "×"
            },
            // Sign In Modal
            signIn: {
                brandSubtitle: "Track expenses with your team.<br>Simple, fast, and free.",
                features: {
                    splitExpenses: "Split expenses easily",
                    realTimeTracking: "Real-time tracking",
                    securePrivate: "Secure & private"
                },
                getStarted: "Get Started",
                chooseMethod: "Choose your preferred sign-in method",
                continueWithGoogle: "Continue with Google",
                signInWithEmail: "Sign in with Email",
                advancedOptions: "Advanced Options",
                blockchainMode: "Blockchain Mode",
                optional: "Optional",
                blockchainDesc: "Connect your MetaMask wallet for automatic on-chain payments and settlements.",
                connectMetaMask: "Connect MetaMask",
                requiresMetaMask: "Requires MetaMask extension",
                emailAddress: "Email Address",
                emailPlaceholder: "your@email.com",
                password: "Password",
                signInButton: "Sign In",
                createNewAccount: "Create new account",
                backToOptions: "← Back to options",
                displayName: "Display Name",
                namePlaceholder: "Your Name",
                passwordPlaceholder: "Minimum 6 characters",
                createAccount: "Create Account",
                backToSignIn: "← Back to Sign In",
                // Limited Access Warnings
                limitedAccessGoogle: "Sign in with Google (Limited Access)",
                limitedAccessEmail: "Sign in with Email (Limited Access)",
                limitedAccessCreate: "Creating Account (Limited Access)",
                onlyAccess: "You will ONLY have access to Simple Mode features:",
                canDo: {
                    trackExpenses: "✅ Track expenses",
                    splitBills: "✅ Split bills with friends",
                    viewBalances: "✅ View balances",
                    simpleMode: "✅ Simple Mode - Expense tracking",
                    viewWhoOwes: "✅ View who owes what"
                },
                cannotDo: {
                    title: "You will NOT be able to:",
                    blockchain: "❌ Use Blockchain Mode",
                    autoPayments: "❌ Create automatic payments",
                    smartContracts: "❌ Use smart contracts",
                    onChain: "❌ Automatic smart contract payments",
                    transactions: "❌ On-chain transactions"
                },
                walletLater: "You can connect a wallet later to unlock blockchain features.",
                confirmGoogle: "Continue with Google Sign-In?",
                confirmCreate: "Create account with limited access?",
                withoutWallet: "Without a crypto wallet, you will ONLY have Simple Mode:",
                withoutMetaMask: "Without a crypto wallet (MetaMask), you will ONLY have access to:"
            },
            // User Menu
            userMenu: {
                signIn: "Sign In",
                accessSimpleMode: "Access Simple Mode",
                walletConnected: "Wallet Connected",
                account: "Account",
                profile: "Profile",
                signOut: "Sign Out",
                disconnectWallet: "Disconnect Wallet"
            },
            // Profile Panel
            profile: {
                title: "Profile",
                tabs: {
                    overview: "Overview",
                    groups: "Groups",
                    subscription: "Plan",
                    settings: "Settings"
                },
                overview: {
                    accountInfo: "Account Information",
                    email: "Email",
                    memberSince: "Member Since",
                    lastLogin: "Last Login",
                    recentActivity: "Recent Activity",
                    noActivity: "No recent activity"
                },
                groups: {
                    title: "My Groups",
                    newGroup: "New Group",
                    empty: "No groups yet"
                },
                subscription: {
                    title: "🐜 Subscription Plans",
                    subtitle: "Unlock premium features and support Ant Pool development",
                    currentPlan: "CURRENT PLAN",
                    recommended: "RECOMMENDED",
                    free: "Free",
                    pro: "PRO",
                    perMonth: "/month",
                    perYear: "/year",
                    savePercent: "Save 19%",
                    freeDesc: "Perfect for getting started",
                    proDesc: "Support development and get premium features",
                    subscribePro: "💎 Subscribe to PRO - $2.99/month",
                    manageSubscription: "⚙️ Manage Subscription",
                    earlyAdopter: "💡 Early adopters get lifetime discounts!",
                    or: "or"
                },
                settings: {
                    preferences: "Preferences",
                    darkMode: "🌙 Dark Mode",
                    darkModeDesc: "Toggle dark theme",
                    pushNotifications: "🔔 Push Notifications",
                    pushNotificationsDesc: "Get alerts on your device",
                    inAppNotifications: "🔔 In-App Notifications",
                    inAppNotificationsDesc: "Show notification panel",
                    accountActions: "Account Actions",
                    appSettings: "⚙️ App Settings",
                    exportData: "📥 Export My Data",
                    signOut: "🚪 Sign Out"
                }
            },
            // Notifications
            notifications: {
                title: "🔔 Notifications",
                markAllRead: "Mark all as read",
                deleteAll: "🗑️",
                empty: "🔕",
                noNotifications: "No notifications yet"
            },
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
                subtitle: "Share expenses simply or use blockchain for automatic payments. <strong>No wallet needed to start.</strong>",
                firstSet: "First, set a <strong>nickname</strong> to identify yourself in groups.",
                label: "Your Nickname *",
                placeholder: "Ex: John, Maria123, etc.",
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
                title: "Pending Invitations",
                count: "0"
            },
            dashboard: {
                title: "My Groups",
                createNew: "Create New Group",
                createButton: "Create New Group",
                createTapHere: "Tap here to create group",
                loading: "Loading your groups...",
                loadingDesc: "Please wait while we fetch your expense groups",
                searchPlaceholder: "🔍 Search groups by name...",
                sortBy: "Sort by:",
                sortRecent: "📅 Most Recent",
                sortOldest: "📅 Oldest First",
                sortNameAsc: "🔤 A → Z",
                sortNameDesc: "🔤 Z → A",
                empty: {
                    title: "Start your first adventure!",
                    subtitle: "Create your first group to manage shared expenses. <strong>No wallet needed</strong> - start with Simple Mode or use blockchain for automatic payments.",
                    button: "Create My First Group"
                },
                filters: {
                    all: "📋 All",
                    created: "👑 Created by me",
                    participating: "👥 Member of",
                    simple: "📝 Simple Mode",
                    blockchain: "⛓️ Blockchain"
                },
                card: {
                    members: "members",
                    inactive: "Inactive",
                    creator: "Creator",
                    member: "Member"
                }
            },
            createFund: {
                title: "✨ Create New Group",
                steps: {
                    basicInfo: "Basic Info",
                    mode: "Mode"
                },
                step1: {
                    title: "📝 What's your group name?",
                    subtitle: "Give it a name everyone will easily recognize",
                    groupIcon: "Group Icon",
                    iconHint: "Choose an icon that represents your group"
                },
                step2: {
                    title: "⚡ How do you want to manage expenses?",
                    subtitle: "Choose the mode that best fits your group"
                },
                modes: {
                    simple: {
                        title: "📝 Simple Mode",
                        recommended: "✨ Recommended",
                        description: "Perfect to get started. No wallet needed. Easily track expenses and split bills.",
                        features: {
                            login: "Login with Google or Email",
                            track: "Track debts",
                            approval: "Collaborative approval",
                            settle: "Settle outside the app"
                        }
                    },
                    blockchain: {
                        title: "⛓️ Blockchain Mode",
                        comingSoon: "🚀 Coming Soon",
                        inDevelopment: "IN DEVELOPMENT",
                        description: "Automatic smart contracts. On-chain voting and total transparency.",
                        features: {
                            wallet: "Requires crypto wallet",
                            automatic: "Automatic payments",
                            voting: "Blockchain voting",
                            trustless: "Trustless execution"
                        }
                    }
                },
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
                    namePlaceholder: "E.g: Dog Expenses, Cancun Trip, Roommates 2025",
                    nameHint: "💡 Use a clear and descriptive name",
                    description: "Description",
                    descriptionPlaceholder: "E.g: Shared expenses for food, walks, and pet care",
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
                    next: "Next →",
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
                    expenses: "Expenses",
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
                    closed: "Closed",
                    public: "Public",
                    private: "Private",
                    totalBalance: "Total Balance"
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
                    invitation: "You have a pending invitation for this fund",
                    invitationText: "You have a pending invitation for this fund",
                    accept: "Accept Invitation",
                    closedTitle: "Closed Group",
                    closedText: "This group has been permanently closed. Balances were settled proportionally among all members.",
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
                    title: "Fund Members",
                    empty: "No members yet",
                    removalRequestsTitle: "⚠️ Pending Removal Requests",
                    role: {
                        creator: "Creator",
                        active: "Active",
                        invited: "Invited"
                    }
                },
                invite: {
                    title: "Invite Members",
                    subtitle: "Share this group with friends! No wallet needed for Simple Mode.",
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
                    success: "Invitation sent!",
                    // Simple Mode invite UI
                    shareLink: "Share Link",
                    shareLinkDesc: "Copy this link and send it via WhatsApp, email, or any messenger:",
                    copyButton: "Copy",
                    emailTitle: "Send Email Invitation",
                    emailDesc: "Send an email invitation directly:",
                    emailPlaceholder: "friend@example.com",
                    emailButton: "Send Invitation",
                    howItWorks: "How it works:",
                    step1: "Friends click the link or accept the email invite",
                    step2: "They sign in with Google or create an account",
                    step3: "They're automatically added to the group",
                    step4: "No cryptocurrency wallet needed!"
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
                    emptySubtitle: "When proposals are approved or rejected, they will appear here",
                    // Simple Mode specific
                    addExpenseTitle: "Register an Expense",
                    addExpenseSubtitle: "Track shared expenses with your group. Split costs fairly and keep everyone in sync.",
                    addExpenseButton: "Add Expense",
                    addExpenseButtonSmall: "Click to add new payment",
                    quickActionsRecurring: "Recurring",
                    quickActionsRecurringTitle: "Set up recurring expenses like rent or subscriptions",
                    quickActionsBudget: "Budget",
                    quickActionsBudgetTitle: "Set spending limits and get alerts",
                    quickActionsAnalytics: "Analytics",
                    quickActionsAnalyticsTitle: "View spending analytics and insights",
                    quickActionsAISetup: "AI Setup",
                    quickActionsAISetupTitle: "Configure OpenAI for receipt scanning",
                    budgetTracker: "Budget Tracker",
                    recurringExpensesTitle: "Active Recurring Expenses",
                    recurringViewAll: "View All",
                    searchTitle: "Search & Filter",
                    searchPlaceholder: "🔍 Search by name...",
                    searchFrom: "From:",
                    searchTo: "To:",
                    searchClear: "Clear filters",
                    searchMyExpenses: "🙋 Only my expenses (where I'm involved)"
                },
                balances: {
                    title: "Group Balances",
                    description: "See who owes money and who is owed based on shared expenses",
                    descriptionFull: "View how much each member owes or is owed based on their contributions and share of approved expenses.",
                    currentBalance: "Current Balance",
                    totalContributions: "Total Contributions",
                    totalExpenses: "Total Expenses",
                    totalExpensesSimple: "Total Expenses",
                    perPerson: "Per Person",
                    activeMembers: "Active Members",
                    balanceOverview: "💰 Balance Overview",
                    smartSettlements: "Smart Settlements",
                    smartSettlementsSubtitle: "Simplify payments with one click",
                    timelineTitle: "📅 Expense Timeline",
                    timelineShow: "Show Timeline",
                    timelineHide: "Hide Timeline",
                    timelineFrom: "From:",
                    timelineTo: "To:",
                    timelineReset: "Reset",
                    howItWorks: "💡 How balances work:",
                    howItWorksPoints: [
                        "Total Contributions: Sum of all deposits made by members",
                        "Total Expenses: Sum of all approved and executed proposals",
                        "Fair Share: Total expenses ÷ Number of active members",
                        "Individual Balance: Member's contribution - Fair share",
                        "Green (+): You contributed more, others owe you. Red (-): You owe to the group"
                    ],
                    howItWorksGreen: "Others owe you money",
                    howItWorksRed: "You owe money to others",
                    howItWorksBalanced: "Simplified to minimize payments",
                    empty: "No members yet",
                    emptySubtitle: "Balances will appear when members start contributing to expenses"
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
                    title: "Fund Management",
                    subtitle: "Advanced options to manage the fund.",
                    subtitleGroup: "Advanced options to manage the group.",
                    memberManagement: "👥 Member Management",
                    kickMember: "Remove Member",
                    kickDescription: "Remove a member from the group by returning their proportional share of the current balance.",
                    kickDescriptionSimple: "Remove a member from the group, returning their proportional share of the current balance.",
                    howItWorks: "💡 How it works:",
                    kickPoint1: "The member is permanently removed from the group",
                    kickPoint2: "Receives: (Their contribution / Total contributions) × Current balance",
                    kickPoint3: "Cannot participate in future votes",
                    kickPoint4: "Their previous votes remain recorded",
                    noMembersToKick: "No members to remove",
                    noMembersSubtitle: "There is only one member in the group or you are not the creator",
                    dangerZone: "🚨 Danger Zone",
                    closeAndDistribute: "Close and Distribute Fund",
                    closeDescription: "This action will permanently close the group and settle all remaining balances proportionally among contributors according to their contribution.",
                    warning: "⚠️ Warning:",
                    warningPoint1: "This action is irreversible",
                    warningPoint2: "Only the fund creator can execute it",
                    warningPoint3: "Each contributor will receive: (their contribution / total) × current balance",
                    warningPoint4: "The fund will be permanently closed",
                    warningPoint5: "No more deposits or proposals can be made",
                    distributionPreview: "📊 Distribution Preview",
                    previewButton: "Distribution Preview",
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
                title: "Trabaja Junto Como Hormigas",
                title2: "Construye Riqueza, A Tu Manera",
                subtitle: "Al igual que las hormigas trabajan juntas, Ant Pool te ayuda a rastrear y dividir gastos sin esfuerzo. Cada hormiga contribuye. Cada hormiga se beneficia. Soporta 12 monedas en todo el mundo con optimización inteligente de deudas.",
                cta: "Comenzar Gratis Ahora",
                ctaExplore: "Explorar Características",
                stats: {
                    free: "GRATIS",
                    forever: "Para Siempre",
                    currencies: "12",
                    currenciesLabel: "Monedas",
                    smart: "INTELIGENTE",
                    settlements: "Liquidaciones"
                }
            },
            modesSection: {
                title: "Por Qué las Colonias Eligen Ant Pool",
                subtitle: "Todo lo que necesitas para gestionar gastos compartidos como la naturaleza lo intentó",
                currencies12: {
                    title: "12 Monedas",
                    desc: "USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Rastrea gastos en tu moneda local."
                },
                smartSettlements: {
                    title: "Liquidaciones Inteligentes",
                    desc: "Optimización de deudas con IA. Minimiza transacciones automáticamente—como hormigas encontrando el camino más corto."
                },
                free: {
                    title: "100% Gratis",
                    desc: "Sin suscripciones. Sin niveles premium. Sin anuncios. Gratis para siempre para grupos y miembros ilimitados."
                },
                mobileFirst: {
                    title: "Móvil Primero",
                    desc: "Optimizado para teléfonos, tabletas y escritorio. Las hormigas trabajan en todas partes, Ant Pool también."
                },
                realTime: {
                    title: "Actualizaciones en Tiempo Real",
                    desc: "Rastreo de gastos en vivo. Filtros de línea de tiempo. Notificaciones instantáneas cuando los miembros de la colonia agregan gastos."
                },
                easySignIn: {
                    title: "Inicio de Sesión Fácil",
                    desc: "Inicio con Google o Email. No se necesita conocimiento técnico. Únete en segundos y comienza a rastrear."
                }
            },
            philosophy: {
                title: "La Filosofía de Ant Pool",
                subtitle: "Inspirado en los cooperadores más eficientes de la naturaleza",
                workTogether: "Trabajar Juntos",
                likeNature: "Como La Naturaleza Lo Intentó",
                multiCurrency: {
                    title: "Soporte Multi-Moneda",
                    desc: "Rastrea gastos en USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Colonias globales, monedas locales."
                },
                settlements: {
                    title: "Liquidaciones Inteligentes",
                    desc: "El algoritmo de optimización de deudas minimiza transacciones. Si Alicia le debe a Bob y Bob le debe a Carlos, Alicia le paga directamente a Carlos."
                },
                timeline: {
                    title: "Línea de Tiempo y Filtros",
                    desc: "Ve gastos por semana, mes o rango personalizado. Cada contribución se registra y es buscable con filtros de fecha."
                },
                updates: {
                    title: "Actualizaciones en Tiempo Real",
                    desc: "Todas las transacciones visibles para los miembros de la colonia. Notificaciones instantáneas cuando se agregan o modifican gastos."
                },
                mobile: {
                    title: "Diseño Móvil Primero",
                    desc: "Tarjetas compactas, diseño responsivo, optimizado para táctil. Gestiona tu colonia desde cualquier dispositivo, en cualquier lugar."
                }
            },
            howItWorks: {
                title: "Cómo Cooperan las Hormigas",
                subtitle: "Sigue el rastro de hormigas hacia el éxito colectivo",
                threeSteps: "Tres Pasos Para el Éxito de la Colonia",
                step1: {
                    title: "Crea Tu Colonia",
                    desc: "Nombra tu grupo, selecciona tu moneda (12 soportadas) e invita miembros vía email. Privado o público—tú eliges."
                },
                step2: {
                    title: "Agrega Gastos Según Ocurran",
                    desc: "Cada hormiga agrega sus gastos a la línea de tiempo. Los filtros de fecha te permiten rastrear períodos semanales, mensuales o personalizados."
                },
                step3: {
                    title: "Liquidaciones Inteligentes",
                    desc: "Ant Pool calcula quién le debe a quién con rutas de deuda optimizadas. Liquida fuera de la app—solo te mostramos la ruta más corta."
                }
            },
            whereAnts: {
                title: "Dónde Cooperan las Hormigas",
                subtitle: "Construye tu colonia para cualquier objetivo compartido",
                travel: {
                    title: "Colonias de Viaje",
                    desc: "Explora el mundo como un enjambre. Agrupa recursos para aventuras donde cada hormiga contribuye y vota."
                },
                living: {
                    title: "Colonias de Vivienda",
                    desc: "Construye tu nido juntos. Comparte renta, servicios, víveres - como las hormigas comparten su hogar."
                },
                celebration: {
                    title: "Colonias de Celebración",
                    desc: "Organiza reuniones épicas. Desde bodas hasta festivales - recursos colectivos para alegría colectiva."
                },
                business: {
                    title: "Colonias de Negocios",
                    desc: "Construye empresas como hormigueros. Recursos de startup, inversiones, proyectos - la cooperación transparente gana."
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
                title: "Cómo Cooperan las Hormigas",
                subtitle: "Sigue el rastro de hormigas hacia el éxito colectivo",
                threeSteps: "Tres Pasos Para el Éxito de la Colonia",
                step1: {
                    title: "Crea Tu Colonia",
                    desc: "Nombra tu grupo, selecciona tu moneda (12 soportadas) e invita miembros vía email. Privado o público—tú eliges."
                },
                step2: {
                    title: "Agrega Gastos Según Ocurran",
                    desc: "Cada hormiga agrega sus gastos a la línea de tiempo. Los filtros de fecha te permiten rastrear períodos semanales, mensuales o personalizados."
                },
                step3: {
                    title: "Liquidaciones Inteligentes",
                    desc: "Ant Pool calcula quién le debe a quién con rutas de deuda optimizadas. Liquida fuera de la app—solo te mostramos la ruta más corta."
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
                title: "Por Qué Ant Pool Gana",
                subtitle: "Compara Ant Pool con competidores",
                globalColony: {
                    title: "Colonia de Hormigas Global",
                    desc: "12 monedas soportadas. Rastrea gastos en USD, COP, EUR, MXN, y más. Como hormigas recolectando de diferentes fuentes, tu colonia funciona en todo el mundo."
                },
                freeForever: {
                    title: "100% Gratis Para Siempre",
                    desc: "Sin suscripciones. Sin niveles premium. Sin anuncios. Como hormigas compartiendo comida libremente en su colonia, Ant Pool es completamente gratis para todos."
                },
                smartDebt: {
                    title: "Optimización Inteligente de Deudas",
                    desc: "Como hormigas encontrando el camino más corto, nuestro algoritmo de liquidación minimiza transacciones. Si A le debe a B y B le debe a C, A le paga directamente a C."
                },
                neverSleep: {
                    title: "Las Hormigas Nunca Duermen",
                    desc: "Accede a tu colonia 24/7 desde cualquier dispositivo. Diseño optimizado para móviles. Filtros de línea de tiempo. Actualizaciones en tiempo real. El trabajo ocurre cuando necesita."
                },
                comparisonTitle: "Ant Pool vs Competidores",
                comparisonFeature: "Característica",
                comparisonSE: "Ant Pool",
                comparisonTraditional: "Splitwise/Tricount",
                price: "Precio",
                priceFree: "GRATIS Para Siempre",
                pricePremium: "$3-5/mes Premium",
                currencies: "Monedas",
                currencies12: "12 Monedas",
                currenciesLimited: "Limitadas (pago)",
                settlements: "Liquidaciones Inteligentes",
                settlementsAuto: "Auto-Optimizado",
                settlementsManual: "Manual/Básico",
                timelineFilters: "Filtros de Línea de Tiempo",
                dateFilters: "Filtros de Fecha",
                basicHistory: "Historial básico",
                ads: "Anuncios",
                noAds: "Sin Anuncios",
                adsFreeTier: "Anuncios (gratis)",
                philosophy: "Filosofía",
                antColony: "Colonia de Hormigas",
                justApp: "Solo una app"
            },
            faq: {
                title: "Preguntas Frecuentes",
                subtitle: "Todo lo que necesitas saber",
                q1: {
                    question: "¿Por qué Ant Pool es mejor que Splitwise o Tricount?",
                    answer: "Ant Pool es 100% gratis para siempre sin niveles premium ni anuncios. Soportamos 12 monedas (vs sus opciones gratuitas limitadas), tenemos optimización inteligente de liquidación para minimizar transacciones, y filtros de línea de tiempo para mejor seguimiento de gastos. ¡Además, nuestra filosofía de colonia de hormigas hace que la colaboración sea divertida!"
                },
                q2: {
                    question: "¿Cómo me registro en Ant Pool?",
                    answer: "Simplemente inicia sesión con tu cuenta de Google o Email. Sin descargas, sin configuración complicada. ¡Crea un grupo en segundos y comienza a invitar a los miembros de tu colonia!"
                },
                q3: {
                    question: "¿Qué monedas puedo usar?",
                    answer: "Soportamos 12 monedas: USD, EUR, GBP, MXN, COP, BRL, CAD, AUD, JPY, CNY, INR, CHF. Rastrea gastos en múltiples monedas dentro del mismo grupo. Perfecto para viajes internacionales o equipos globales."
                },
                q4: {
                    question: "¿Cómo funciona la optimización inteligente de liquidación?",
                    answer: "Nuestro algoritmo analiza todas las deudas y encuentra el número mínimo de transacciones necesarias. Si Alicia le debe a Bob $10 y Bob le debe a Carlos $10, en lugar de 2 transacciones, Alicia le paga $10 directamente a Carlos. ¡Como hormigas encontrando el camino más corto!"
                },
                q5: {
                    question: "¿Mis datos están seguros?",
                    answer: "¡Absolutamente! Todos los datos están protegidos por la seguridad de Firebase. Solo tú y los miembros de tu grupo pueden acceder a la información de tu colonia. No vendemos datos, no mostramos anuncios, ni te rastreamos."
                },
                q6: {
                    question: "¿Puedo usar Ant Pool en mi teléfono?",
                    answer: "¡Sí! Ant Pool es móvil primero. Funciona perfectamente en teléfonos, tabletas y escritorios. El soporte de Aplicación Web Progresiva (PWA) significa que puedes agregarlo a tu pantalla de inicio."
                },
                q7: {
                    question: "¿Cómo invito miembros a mi grupo?",
                    answer: "Simplemente comparte el enlace de invitación o envía invitaciones por email desde dentro de la app. Los miembros pueden unirse con inicio de sesión de Google o Email - sin descargas requeridas."
                },
                q8: {
                    question: "¿Qué pasa si alguien no paga su parte?",
                    answer: "Ant Pool muestra quién debe qué con transparencia completa. Las liquidaciones ocurren fuera de la app (transferencias bancarias, efectivo, etc.). Nosotros proporcionamos los cálculos - tú manejas los pagos."
                },
                q9: {
                    question: "¿Puedo eliminar gastos o modificarlos?",
                    answer: "¡Sí! Los miembros del grupo pueden editar o eliminar gastos. Todos los cambios se registran en la línea de tiempo para transparencia total."
                },
                q10: {
                    question: "¿Hay un límite de cuántos grupos puedo crear?",
                    answer: "¡Sin límites! Crea grupos ilimitados para viajes, roommates, ahorros familiares, eventos - lo que tu colonia necesite. Completamente gratis para siempre."
                }
            },
            cta: {
                title: "🐜 ¿Listo para Unirte a la Colonia?",
                subtitle: "Sé parte de la revolución de finanzas cooperativas. Trabaja junto como hormigas. Construye riqueza colectiva.",
                button: "🐜 Entrar al Ant Pool",
                noRegistration: "Sin hormiga reina • Sin explotación laboral • Pura cooperación"
            },
            footer: {
                tagline: "Hecho con ❤️ para la gestión cooperativa de gastos.",
                subtitle: "🐜 Código abierto • Impulsado por la comunidad • Hecho con ❤️",
                description: "🐜 Trabaja junto como hormigas. Rastrea y divide gastos cooperativamente. La sabiduría de la naturaleza encuentra la gestión moderna de gastos.",
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
                technology: "Construido Con",
                legal: "Legal",
                privacy: "Política de Privacidad",
                terms: "Términos de Servicio",
                cookies: "Configuración de Cookies",
                firebase: "Firebase",
                javascript: "JavaScript",
                opensource: "Código Abierto",
                community: "Comunidad",
                copyright: "© 2025 Ant Pool. Construido por la colonia, para la colonia. Impulsado por tecnologías web modernas."
            }
        },
        // App Platform
        app: {
            // Loading Overlay
            loadingOverlay: {
                loading: "Cargando..."
            },
            // PWA Install Prompt
            pwa: {
                installTitle: "Instalar Ant Pool",
                installDesc: "Obtén la experiencia completa con acceso sin conexión",
                installButton: "Instalar",
                dismissButton: "×"
            },
            // Sign In Modal
            signIn: {
                brandSubtitle: "Rastrea gastos con tu equipo.<br>Simple, rápido y gratis.",
                features: {
                    splitExpenses: "Divide gastos fácilmente",
                    realTimeTracking: "Seguimiento en tiempo real",
                    securePrivate: "Seguro y privado"
                },
                getStarted: "Comenzar",
                chooseMethod: "Elige tu método de inicio de sesión",
                continueWithGoogle: "Continuar con Google",
                signInWithEmail: "Iniciar sesión con Email",
                advancedOptions: "Opciones Avanzadas",
                blockchainMode: "Modo Blockchain",
                optional: "Opcional",
                blockchainDesc: "Conecta tu wallet MetaMask para pagos y liquidaciones automáticas en cadena.",
                connectMetaMask: "Conectar MetaMask",
                requiresMetaMask: "Requiere extensión MetaMask",
                emailAddress: "Correo Electrónico",
                emailPlaceholder: "tu@email.com",
                password: "Contraseña",
                signInButton: "Iniciar Sesión",
                createNewAccount: "Crear nueva cuenta",
                backToOptions: "← Volver a opciones",
                displayName: "Nombre para Mostrar",
                namePlaceholder: "Tu Nombre",
                passwordPlaceholder: "Mínimo 6 caracteres",
                createAccount: "Crear Cuenta",
                backToSignIn: "← Volver a Iniciar Sesión",
                // Limited Access Warnings
                limitedAccessGoogle: "Iniciar sesión con Google (Acceso Limitado)",
                limitedAccessEmail: "Iniciar sesión con Email (Acceso Limitado)",
                limitedAccessCreate: "Crear Cuenta (Acceso Limitado)",
                onlyAccess: "SOLO tendrás acceso a funciones de Modo Simple:",
                canDo: {
                    trackExpenses: "✅ Rastrear gastos",
                    splitBills: "✅ Dividir cuentas con amigos",
                    viewBalances: "✅ Ver balances",
                    simpleMode: "✅ Modo Simple - Rastreo de gastos",
                    viewWhoOwes: "✅ Ver quién debe qué"
                },
                cannotDo: {
                    title: "NO podrás:",
                    blockchain: "❌ Usar Modo Blockchain",
                    autoPayments: "❌ Crear pagos automáticos",
                    smartContracts: "❌ Usar contratos inteligentes",
                    onChain: "❌ Pagos automáticos con contratos inteligentes",
                    transactions: "❌ Transacciones en cadena"
                },
                walletLater: "Puedes conectar una wallet más tarde para desbloquear funciones blockchain.",
                confirmGoogle: "¿Continuar con inicio de sesión de Google?",
                confirmCreate: "¿Crear cuenta con acceso limitado?",
                withoutWallet: "Sin una billetera cripto, SOLO tendrás Modo Simple:",
                withoutMetaMask: "Sin una billetera cripto (MetaMask), SOLO tendrás acceso a:"
            },
            // User Menu
            userMenu: {
                signIn: "Iniciar Sesión",
                accessSimpleMode: "Acceder a Modo Simple",
                walletConnected: "Wallet Conectada",
                account: "Cuenta",
                profile: "Perfil",
                signOut: "Cerrar Sesión",
                disconnectWallet: "Desconectar Wallet"
            },
            // Profile Panel
            profile: {
                title: "Perfil",
                tabs: {
                    overview: "Resumen",
                    groups: "Grupos",
                    subscription: "Plan",
                    settings: "Ajustes"
                },
                overview: {
                    accountInfo: "Información de Cuenta",
                    email: "Email",
                    memberSince: "Miembro Desde",
                    lastLogin: "Último Acceso",
                    recentActivity: "Actividad Reciente",
                    noActivity: "Sin actividad reciente"
                },
                groups: {
                    title: "Mis Grupos",
                    newGroup: "Nuevo Grupo",
                    empty: "Sin grupos aún"
                },
                subscription: {
                    title: "🐜 Planes de Suscripción",
                    subtitle: "Desbloquea funciones premium y apoya el desarrollo de Ant Pool",
                    currentPlan: "PLAN ACTUAL",
                    recommended: "RECOMENDADO",
                    free: "Gratis",
                    pro: "PRO",
                    perMonth: "/mes",
                    perYear: "/año",
                    savePercent: "Ahorra 19%",
                    freeDesc: "Perfecto para comenzar",
                    proDesc: "Apoya el desarrollo y obtén funciones premium",
                    subscribePro: "💎 Suscribirse a PRO - $2.99/mes",
                    manageSubscription: "⚙️ Gestionar Suscripción",
                    earlyAdopter: "💡 ¡Los primeros usuarios obtienen descuentos de por vida!",
                    or: "o"
                },
                settings: {
                    preferences: "Preferencias",
                    darkMode: "🌙 Modo Oscuro",
                    darkModeDesc: "Activar tema oscuro",
                    pushNotifications: "🔔 Notificaciones Push",
                    pushNotificationsDesc: "Recibe alertas en tu dispositivo",
                    inAppNotifications: "🔔 Notificaciones en App",
                    inAppNotificationsDesc: "Mostrar panel de notificaciones",
                    accountActions: "Acciones de Cuenta",
                    appSettings: "⚙️ Configuración de App",
                    exportData: "📥 Exportar Mis Datos",
                    signOut: "🚪 Cerrar Sesión"
                }
            },
            // Notifications
            notifications: {
                title: "🔔 Notificaciones",
                markAllRead: "Marcar todo como leído",
                deleteAll: "🗑️",
                empty: "🔕",
                noNotifications: "Sin notificaciones aún"
            },
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
                subtitle: "Comparte gastos simplemente o usa blockchain para pagos automáticos. <strong>No necesitas wallet para empezar.</strong>",
                firstSet: "Primero, establece un <strong>nickname</strong> para identificarte en los grupos.",
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
                title: "Invitaciones Pendientes",
                count: "0"
            },
            dashboard: {
                title: "Mis Grupos",
                createNew: "Crear Nuevo Grupo",
                createButton: "Crear Nuevo Grupo",
                createTapHere: "Toca aquí para crear grupo",
                loading: "Cargando tus grupos...",
                loadingDesc: "Por favor espera mientras obtenemos tus grupos de gastos",
                searchPlaceholder: "🔍 Buscar grupos por nombre...",
                sortBy: "Ordenar por:",
                sortRecent: "📅 Más Recientes",
                sortOldest: "📅 Más Antiguos",
                sortNameAsc: "🔤 A → Z",
                sortNameDesc: "🔤 Z → A",
                empty: {
                    title: "¡Comienza tu primera aventura!",
                    subtitle: "Crea tu primer grupo para gestionar gastos compartidos. <strong>No necesitas wallet</strong> - empieza con Modo Simple o usa blockchain para pagos automáticos.",
                    button: "Crear Mi Primer Grupo"
                },
                filters: {
                    all: "📋 Todos",
                    created: "👑 Creados por mí",
                    participating: "👥 Miembro de",
                    simple: "📝 Modo Simple",
                    blockchain: "⛓️ Blockchain"
                },
                card: {
                    members: "miembros",
                    inactive: "Inactivo",
                    creator: "Creador",
                    member: "Miembro"
                }
            },
            createFund: {
                title: "✨ Crear Nuevo Grupo",
                steps: {
                    basicInfo: "Información",
                    mode: "Modo"
                },
                step1: {
                    title: "📝 ¿Cuál es el nombre de tu grupo?",
                    subtitle: "Dale un nombre que todos reconozcan fácilmente",
                    groupIcon: "Ícono del Grupo",
                    iconHint: "Elige un ícono que represente a tu grupo"
                },
                step2: {
                    title: "⚡ ¿Cómo quieres gestionar los gastos?",
                    subtitle: "Elige el modo que mejor se adapte a tu grupo"
                },
                modes: {
                    simple: {
                        title: "📝 Modo Simple",
                        recommended: "✨ Recomendado",
                        description: "Perfecto para comenzar. No necesitas wallet. Rastrea gastos y divide cuentas fácilmente.",
                        features: {
                            login: "Ingreso con Google o Email",
                            track: "Rastreo de deudas",
                            approval: "Aprobación colaborativa",
                            settle: "Liquidación fuera de la app"
                        }
                    },
                    blockchain: {
                        title: "⛓️ Modo Blockchain",
                        comingSoon: "🚀 Próximamente",
                        inDevelopment: "EN DESARROLLO",
                        description: "Contratos inteligentes automáticos. Votación on-chain y transparencia total.",
                        features: {
                            wallet: "Requiere wallet cripto",
                            automatic: "Pagos automáticos",
                            voting: "Votación blockchain",
                            trustless: "Ejecución sin confianza"
                        }
                    }
                },
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
                    namePlaceholder: "Ej: Gastos de Perro, Viaje Cancún, Roommates 2025",
                    nameHint: "💡 Usa un nombre claro y descriptivo",
                    description: "Descripción",
                    descriptionPlaceholder: "Ej: Gastos compartidos para comida, paseos y cuidado de mascotas",
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
                    next: "Siguiente →",
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
                    expenses: "Gastos",
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
                    closed: "Cerrado",
                    public: "Público",
                    private: "Privado",
                    totalBalance: "Balance Total"
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
                    invitation: "Tienes una invitación pendiente para este fondo",
                    invitationText: "Tienes una invitación pendiente para este fondo",
                    accept: "Aceptar Invitación",
                    closedTitle: "Grupo Cerrado",
                    closedText: "Este grupo ha sido cerrado permanentemente. Los balances fueron liquidados proporcionalmente entre todos los miembros.",
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
                    title: "Miembros del Fondo",
                    empty: "Aún no hay miembros",
                    removalRequestsTitle: "⚠️ Solicitudes de Eliminación Pendientes",
                    role: {
                        creator: "Creador",
                        active: "Activo",
                        invited: "Invitado"
                    }
                },
                invite: {
                    title: "Invitar Miembros",
                    subtitle: "¡Comparte este grupo con amigos! No se necesita wallet para Modo Simple.",
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
                    success: "¡Invitación enviada!",
                    // Simple Mode invite UI
                    shareLink: "Compartir Enlace",
                    shareLinkDesc: "Copia este enlace y envíalo por WhatsApp, email o cualquier mensajero:",
                    copyButton: "Copiar",
                    emailTitle: "Enviar Invitación por Email",
                    emailDesc: "Envía una invitación por email directamente:",
                    emailPlaceholder: "amigo@ejemplo.com",
                    emailButton: "Enviar Invitación",
                    howItWorks: "Cómo funciona:",
                    step1: "Los amigos hacen clic en el enlace o aceptan el email de invitación",
                    step2: "Inician sesión con Google o crean una cuenta",
                    step3: "Son agregados automáticamente al grupo",
                    step4: "¡No se necesita wallet de criptomonedas!"
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
                    emptySubtitle: "Cuando se aprueben o rechacen propuestas, aparecerán aquí",
                    // Modo Simple específico
                    addExpenseTitle: "Registrar un Gasto",
                    addExpenseSubtitle: "Lleva un registro de gastos compartidos con tu grupo. Divide costos de manera justa y mantén a todos sincronizados.",
                    addExpenseButton: "Agregar Gasto",
                    addExpenseButtonSmall: "Click para agregar nuevo pago",
                    quickActionsRecurring: "Recurrentes",
                    quickActionsRecurringTitle: "Configura gastos recurrentes como renta o suscripciones",
                    quickActionsBudget: "Presupuesto",
                    quickActionsBudgetTitle: "Establece límites de gasto y recibe alertas",
                    quickActionsAnalytics: "Analíticas",
                    quickActionsAnalyticsTitle: "Ver analíticas y estadísticas de gastos",
                    quickActionsAISetup: "Config. IA",
                    quickActionsAISetupTitle: "Configurar OpenAI para escaneo de recibos",
                    budgetTracker: "Rastreador de Presupuesto",
                    recurringExpensesTitle: "Gastos Recurrentes Activos",
                    recurringViewAll: "Ver Todos",
                    searchTitle: "Buscar y Filtrar",
                    searchPlaceholder: "🔍 Buscar por nombre...",
                    searchFrom: "Desde:",
                    searchTo: "Hasta:",
                    searchClear: "Limpiar filtros",
                    searchMyExpenses: "🙋 Solo mis gastos (donde estoy involucrado)"
                },
                balances: {
                    title: "Balances del Grupo",
                    description: "Ver quién debe dinero y quién tiene saldo a favor según los gastos compartidos",
                    descriptionFull: "Visualiza cuánto debe o le deben a cada miembro según sus aportaciones y su parte de los gastos aprobados.",
                    currentBalance: "Balance Actual",
                    totalContributions: "Total Aportaciones",
                    totalExpenses: "Total Gastos",
                    totalExpensesSimple: "Total Gastos",
                    perPerson: "Por Persona",
                    activeMembers: "Miembros Activos",
                    balanceOverview: "💰 Resumen de Balances",
                    smartSettlements: "Liquidaciones Inteligentes",
                    smartSettlementsSubtitle: "Simplifica los pagos con un click",
                    timelineTitle: "📅 Línea de Tiempo de Gastos",
                    timelineShow: "Mostrar Línea de Tiempo",
                    timelineHide: "Ocultar Línea de Tiempo",
                    timelineFrom: "Desde:",
                    timelineTo: "Hasta:",
                    timelineReset: "Resetear",
                    howItWorks: "💡 Cómo funcionan los balances:",
                    howItWorksPoints: [
                        "Total Aportaciones: Suma de todos los depósitos realizados por los miembros",
                        "Total Gastos: Suma de todas las propuestas aprobadas y ejecutadas",
                        "Parte Justa: Total gastos ÷ Número de miembros activos",
                        "Balance Individual: Aportación del miembro - Parte justa",
                        "Verde (+): Aportaste más, otros te deben. Rojo (-): Debes al grupo"
                    ],
                    howItWorksGreen: "Otros te deben dinero",
                    howItWorksRed: "Tú debes dinero a otros",
                    howItWorksBalanced: "Simplificadas para minimizar pagos",
                    empty: "Aún no hay miembros",
                    emptySubtitle: "Los balances aparecerán cuando los miembros empiecen a contribuir en gastos"
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
                    title: "Gestión del Fondo",
                    subtitle: "Opciones avanzadas para administrar el fondo.",
                    subtitleGroup: "Opciones avanzadas para administrar el grupo.",
                    memberManagement: "👥 Gestión de Miembros",
                    kickMember: "Eliminar Miembro",
                    kickDescription: "Elimina a un miembro del grupo devolviendo su parte proporcional del saldo actual.",
                    kickDescriptionSimple: "Expulsa a un miembro del grupo devolviendo su parte proporcional del saldo actual.",
                    howItWorks: "💡 Cómo funciona:",
                    kickPoint1: "El miembro es removido del grupo permanentemente",
                    kickPoint2: "Recibe: (Su aportación / Total aportaciones) × Balance actual",
                    kickPoint3: "No podrá participar en votaciones futuras",
                    kickPoint4: "Sus votos anteriores quedan registrados",
                    noMembersToKick: "No hay miembros para eliminar",
                    noMembersSubtitle: "Solo hay un miembro en el grupo o no eres el creador",
                    dangerZone: "🚨 Zona de Peligro",
                    closeAndDistribute: "Cerrar y Distribuir Fondo",
                    closeDescription: "Esta acción cerrará permanentemente el grupo y liquidará todos los saldos restantes proporcionalmente entre los contribuyentes según su aportación.",
                    warning: "⚠️ Advertencia:",
                    warningPoint1: "Esta acción es irreversible",
                    warningPoint2: "Solo el creador del fondo puede ejecutarla",
                    warningPoint3: "Cada contribuyente recibirá: (su aportación / total) × balance actual",
                    warningPoint4: "El fondo quedará cerrado permanentemente",
                    warningPoint5: "No se podrán hacer más depósitos ni propuestas",
                    distributionPreview: "📊 Vista Previa de Distribución",
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
    
    console.log(`[i18n] Applying translations for language: ${lang}`);
    
    // Apply translations to elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    console.log(`[i18n] Found ${elements.length} elements with data-i18n`);
    
    let successCount = 0;
    let failCount = 0;
    
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        if (translation && translation !== key) {
            try {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else {
                    // Use textContent to safely set text (prevents XSS and preserves text-only content)
                    element.textContent = translation;
                }
                successCount++;
            } catch (error) {
                console.error(`[i18n] Error applying translation for key ${key}:`, error);
                failCount++;
            }
        } else {
            console.warn(`[i18n] Translation not found or empty for key: ${key}`);
            failCount++;
        }
    });
    
    console.log(`[i18n] Translation application complete: ${successCount} successful, ${failCount} failed`);
}

// Initialize translations on page load
if (typeof document !== 'undefined') {
    // Apply on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[i18n] DOMContentLoaded - applying translations');
        applyTranslations();
    });
    
    // Also apply if DOM is already loaded
    if (document.readyState !== 'loading') {
        console.log('[i18n] DOM already loaded - applying translations immediately');
        applyTranslations();
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, getCurrentLanguage, translations, applyTranslations };
}
