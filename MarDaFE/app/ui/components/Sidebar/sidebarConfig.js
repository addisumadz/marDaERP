
import {
    Home,
    CreditCard,
    Users,
    Building2,
    MapPin,
    Shield,
    Banknote,
    Scale,
    FileText,
    AlertCircle,
    ScrollText,
    FileQuestion,
    Receipt,
    History,
    LifeBuoy,
    Upload,
    Send,
    MessageSquare,
    Building,
    Landmark,
    LayoutDashboard,
    BookOpen,
    FileEdit,
    BookMarked,
    TrendingUp,
    PieChart,
    Calendar,
    Wallet,
    BarChart3,
    DollarSign,
    Settings,
    ArrowRightLeft,
    Link,
    Package,
    PackagePlus,
    PackageCheck,
    PackageX,
    Truck,
    Warehouse,
    ClipboardList,
    ShoppingCart,
    FileCheck,
    ArrowLeftRight,
    ClipboardCheck,
    Boxes,
    Tag,
    Ruler,
    ListTree,
    UserCheck,
    PackageSearch,
    BarChart2,
    AlertTriangle,
    Timer,
    GitBranch,
    FileSpreadsheet,
    FileSearch,
    PiggyBank,
    Wrench
} from "lucide-react";

export const menuGroups = [
    {
        name: "MENU",
        items: [
            {
                title: "ዋናው ገጽ",
                path: "/ui/manager",
                icon: Home,
                roles: ["billzgjt", "Cashier", "mobileanbabi", "M_BRANCH_STORE", "M_GEBI_OFFICER", "M_TECHNICAL_MANAGER", "M_FINANCE_HEAD", "M_PURCHASING_OFFICER", "M_BRANCH_MANAGER"],
            },
            {
                title: "የቢል ክፍያ (Cashier)",
                path: "/ui/manager/cashier",
                icon: CreditCard,
                roles: ["Cashier"],
                excludeRoles: ["billzgjt", "systemadmin", "FNC", "mobileanbabi"],
            },
            {
                title: "የደንበኛ ዝርዝር",
                path: "/ui/manager/customerList",
                icon: Users,
                roles: ["FNC"],
                excludeRoles: ["billzgjt", "Cashier", "systemadmin", "mobileanbabi"],
            },
            // System Admin Items
            {
                title: "Users",
                path: "/ui/manager/users",
                icon: Users,
                roles: ["systemadmin"],
            },
            {
                title: "Branches",
                path: "/ui/manager/branches",
                icon: Building2,
                roles: ["systemadmin"],
            },
            {
                title: "Address States",
                path: "/ui/manager/addressState",
                icon: MapPin,
                roles: ["systemadmin"],
            },
            {
                title: "Bank List",
                path: "/ui/manager/billingBanks",
                icon: Building,
                roles: ["systemadmin"],
            },
            {
                title: "Permissions Management",
                path: "/ui/manager/wbillPermissions",
                icon: Shield,
                roles: ["systemadmin"],
            },
            {
                title: "Meter Rent",
                path: "/ui/manager/billingMeterRents",
                icon: Banknote,
                roles: ["systemadmin"],
            },
            {
                title: "Meter Sizes",
                path: "/ui/manager/billingMeterSizes",
                icon: Scale,
                roles: ["systemadmin"],
            },
            {
                title: "Zero Reading Reasons",
                path: "/ui/manager/billingZeroReadingReasons",
                icon: FileQuestion,
                roles: ["systemadmin"],
            },
            {
                title: "Company Informations",
                path: "/ui/manager/billingCompanyInformations",
                icon: FileText,
                roles: ["systemadmin"],
            },
            {
                title: "Penalty Tarifs",
                path: "/ui/manager/billingPenaltyTarifs",
                icon: AlertCircle,
                roles: ["systemadmin"],
            },
            {
                title: "Billing Tariffs",
                path: "/ui/manager/billingTariffs",
                icon: ScrollText,
                roles: ["systemadmin"],
            },
            {
                title: "Company Profile",
                path: "/ui/manager/companyProfileSingle",
                icon: Building,
                roles: ["systemadmin"],
            },
            // Manager (billzgjt) Grouped Items
            {
                title: "የደንበኛ ዝርዝር",
                path: "/ui/manager/customerList",
                icon: Users,
                roles: ["billzgjt"],
            },
            {
                title: "Bill Preparation",
                path: "#", // Group header
                icon: FileText,
                roles: ["billzgjt"],
                children: [
                    {
                        title: "ንባብ እና ደረሰኝ ዝግጅት",
                        path: "/ui/manager/readingList",
                        icon: FileText,
                    },
                    {
                        title: "የተዘጋጀ ደረሰኝ",
                        path: "/ui/manager/billList",
                        icon: Receipt,
                    },
                    {
                        title: "የደንበኛ ታሪክ",
                        path: "/ui/manager/customerHistory",
                        icon: History,
                    },
                    {
                        title: "ቢል ማኔጅመንት",
                        path: "/ui/manager/billsupport",
                        icon: LifeBuoy,
                    },
                    {
                        title: "የቢል SMS መላኪያ",
                        path: "/ui/manager/SendBillSms",
                        icon: MessageSquare,
                    },
                    {
                        title: "ዓመታዊ ሪፖርት",
                        path: "/ui/manager/yearlyReport",
                        icon: BarChart3,
                    },
                    {
                        title: "ንባብ ማኔጅመንት",
                        path: "/ui/manager/readingmanagement",
                        icon: LifeBuoy,
                    },
                    {
                        title: "ንባብ ማስገቢያ",
                        path: "/ui/manager/ImportReadings",
                        icon: Upload,
                    },
                    {
                        title: "Billing Setting",
                        path: "/ui/manager/billingSetting",
                        icon: Calendar,
                    }
                ]
            },
            {
                title: "Bank Management",
                path: "#", // Group header
                icon: Send,
                roles: ["billzgjt"],
                children: [
                    {
                        title: "Send To Derash",
                        path: "/ui/manager/SendToDerash",
                        icon: Send,
                    },
                    {
                        title: "Send To Unicash",
                        path: "/ui/manager/SendToUnicash",
                        icon: Send,
                    },
                    {
                        title: "Bank Import Derash",
                        path: "/ui/manager/BankImportDerash",
                        icon: Upload,
                    },
                    {
                        title: "Bank Import Unicash",
                        path: "/ui/manager/BankImportUnicash",
                        icon: Upload,
                    },
                    {
                        title: "Send To MardaArif",
                        path: "/ui/manager/SendToMardaArif",
                        icon: Send,
                    },
                    {
                        title: "Send Bill SMS",
                        path: "/ui/manager/SendBillSms",
                        icon: MessageSquare,
                    },
                    {
                        title: "Bank Import MardaArif",
                        path: "/ui/manager/BankImportMardaArif",
                        icon: Upload,
                    },
                    {
                        title: "Bank Import Files",
                        path: "/ui/manager/BankImportFiles",
                        icon: FileText,
                    }
                ]
            }
        ],
    },
    {
        name: "CUSTOMER SERVICE",
        items: [
            {
                title: "የደንበኞች አገልግሎት (Customer Service)",
                path: "#",
                icon: Users,
                roles: ["billzgjt", "systemadmin", "M_CUSTOMER_SERVICE", "M_TECHNICAL_MANAGER", "M_GEBI_OFFICER", "M_BRANCH_STORE", "Cashier"],
                children: [
                    {
                        title: "አዲስ መስመር ዝርጋታ (New Line)",
                        path: "/ui/manager/custom_newLineConnection",
                        icon: GitBranch,
                    },
                    {
                        title: "የደንበኞች ጥገና (Maintenance)",
                        path: "/ui/manager/custom_maintenance",
                        icon: Wrench,
                    }
                ]
            }
        ],
    },
    {
        name: "INVENTORY",
        items: [
            // Inventory Operations — daily store operations
            {
                title: "Inventory Operations",
                path: "#",
                icon: Package,
                roles: ["M_BRANCH_STORE", "M_GEBI_OFFICER", "M_TECHNICAL_MANAGER", "billzgjt"],
                children: [
                    {
                        title: "Issue Vouchers",
                        path: "/ui/manager/invIssueVouchers",
                        icon: PackageX,
                    },
                    {
                        title: "Stock Transfers",
                        path: "/ui/manager/invTransfers",
                        icon: ArrowLeftRight,
                    },
                    {
                        title: "Stock Adjustments",
                        path: "/ui/manager/invAdjustments",
                        icon: ClipboardCheck,
                    },
                    {
                        title: "Stock Levels",
                        path: "/ui/manager/invStockLevels",
                        icon: Boxes,
                    },
                    {
                        title: "Stock Card",
                        path: "/ui/manager/invStockCard",
                        icon: ClipboardList,
                    }
                ]
            },
            // Inventory Reports
            {
                title: "Inventory Reports",
                path: "#",
                icon: BarChart2,
                roles: ["M_BRANCH_STORE", "M_GEBI_OFFICER", "M_BRANCH_MANAGER", "billzgjt"],
                children: [
                    {
                        title: "Stock Valuation",
                        path: "/ui/manager/invStockValuation",
                        icon: DollarSign,
                    },
                    {
                        title: "Low Stock Alerts",
                        path: "/ui/manager/invLowStock",
                        icon: AlertTriangle,
                    },
                    {
                        title: "Transaction History",
                        path: "/ui/manager/invTransactions",
                        icon: History,
                    },
                    {
                        title: "Expiring Items",
                        path: "/ui/manager/invExpiringItems",
                        icon: Timer,
                    }
                ]
            },
            // Inventory Settings — master data config
            {
                title: "Inventory Settings",
                path: "#",
                icon: Settings,
                roles: ["M_BRANCH_STORE", "M_GEBI_OFFICER", "M_TECHNICAL_MANAGER", "systemadmin", "billzgjt"],
                children: [
                    {
                        title: "Item Categories",
                        path: "/ui/manager/invCategories",
                        icon: Tag,
                    },
                    {
                        title: "Item Groups",
                        path: "/ui/manager/invGroups",
                        icon: ListTree,
                    },
                    {
                        title: "Items Master",
                        path: "/ui/manager/invItems",
                        icon: PackageSearch,
                    },
                    {
                        title: "Units of Measure",
                        path: "/ui/manager/invUnits",
                        icon: Ruler,
                    },
                    {
                        title: "New Line Common Materials",
                        path: "/ui/manager/invNewLineMaterials",
                        icon: GitBranch,
                    },
                    {
                        title: "Maintenance Common Materials",
                        path: "/ui/manager/invMaintenanceMaterials",
                        icon: Wrench,
                    },
                    {
                        title: "Stores",
                        path: "/ui/manager/invStores",
                        icon: Warehouse,
                    },
                    {
                        title: "Store Users",
                        path: "/ui/manager/invUserStore",
                        icon: UserCheck,
                    },
                    {
                        title: "Suppliers",
                        path: "/ui/manager/invSuppliers",
                        icon: Truck,
                    },
                    {
                        title: "Finance Account Mapping",
                        path: "/ui/manager/fncInventoryAccountMap",
                        icon: Link,
                    }
                ]
            }
        ],
    },
    {
        name: "PURCHASE",
        items: [
            // Purchase Management — procurement workflow
            {
                title: "Purchase Management",
                path: "#",
                icon: ShoppingCart,
                roles: ["M_PURCHASING_OFFICER", "M_BRANCH_MANAGER", "M_FINANCE_HEAD", "M_GEBI_OFFICER", "billzgjt"],
                children: [
                    {
                        title: "Purchase Requisitions",
                        path: "/ui/manager/invPurchaseRequisitions",
                        icon: FileText,
                    },
                    {
                        title: "Purchase Orders",
                        path: "/ui/manager/invPurchaseOrders",
                        icon: FileCheck,
                    },
                    {
                        title: "Goods Received",
                        path: "/ui/manager/invGRN",
                        icon: PackageCheck,
                    }
                ]
            }
        ],
    },
    {
        name: "FINANCE",
        items: [
            // Financial Operations
            {
                title: "Financial Operations",
                path: "#",
                icon: Wallet,
                roles: ["M_FINANCE_HEAD", "FNC", "billzgjt"],
                children: [
                    {
                        title: "Journal Entries",
                        path: "/ui/manager/fncJournalEntries",
                        icon: BookOpen,
                    },
                    {
                        title: "General Ledger",
                        path: "/ui/manager/fncGeneralLedger",
                        icon: FileSpreadsheet,
                    },
                    {
                        title: "Cash Collections",
                        path: "/ui/manager/fncCashCollections",
                        icon: Banknote,
                    },
                    {
                        title: "Bank Reconciliation",
                        path: "/ui/manager/fncBankReconciliation",
                        icon: FileSearch,
                    },
                    {
                        title: "Budget Management",
                        path: "/ui/manager/fncBudget",
                        icon: PiggyBank,
                    },
                    {
                        title: "Payables",
                        path: "/ui/manager/fncPayables",
                        icon: Receipt,
                    },
                    {
                        title: "Receivables",
                        path: "/ui/manager/fncReceivables",
                        icon: CreditCard,
                    }
                ]
            },
            // Financial Reports
            {
                title: "Financial Reports",
                path: "#",
                icon: BarChart3,
                roles: ["M_FINANCE_HEAD", "FNC", "M_BRANCH_MANAGER", "billzgjt"],
                children: [
                    {
                        title: "Trial Balance",
                        path: "/ui/manager/fncTrialBalance",
                        icon: Scale,
                    },
                    {
                        title: "Income Statement",
                        path: "/ui/manager/fncIncomeStatement",
                        icon: TrendingUp,
                    },
                    {
                        title: "Balance Sheet",
                        path: "/ui/manager/fncBalanceSheet",
                        icon: PieChart,
                    },
                    {
                        title: "Budget vs Actual",
                        path: "/ui/manager/fncBudgetVsActual",
                        icon: BarChart3,
                    }
                ]
            },
            // Financial Settings — one-time setup
            {
                title: "Financial Settings",
                path: "#",
                icon: Settings,
                roles: ["M_FINANCE_HEAD", "FNC", "billzgjt"],
                children: [
                    {
                        title: "Chart of Accounts",
                        path: "/ui/manager/fncAccounts",
                        icon: BookOpen,
                    },
                    {
                        title: "Fiscal Years",
                        path: "/ui/manager/fncFiscalYears",
                        icon: Calendar,
                    },
                    {
                        title: "Opening Balances",
                        path: "/ui/manager/fncOpeningBalances",
                        icon: DollarSign,
                    },
                    {
                        title: "Collection Account Map",
                        path: "/ui/manager/fncBillingAccountMap",
                        icon: Link,
                    },
                    {
                        title: "Bill Prep Account Map",
                        path: "/ui/manager/fncBillPrepAccountMap",
                        icon: Link,
                    },
                    {
                        title: "Inventory Account Map",
                        path: "/ui/manager/fncInventoryAccountMap",
                        icon: Link,
                    }
                ]
            }
        ],
    },
    {
        name: "HUMAN RESOURCES",
        items: [
            // HRMS Tasks & Operations
            {
                title: "HRMS Operations (ተግባራት)",
                path: "#",
                icon: Users,
                roles: ["billzgjt", "systemadmin", "M_HR_OFFICER", "M_PAYROLL_OFFICER", "M_FINANCE_HEAD", "M_BRANCH_MANAGER"],
                children: [
                    {
                        title: "Employee Directory (የሠራተኞች መዝገብ)",
                        path: "/ui/manager/hrmsEmployees",
                        icon: Users,
                    },
                    {
                        title: "Payroll to Journal (ደመወዝ ወደ ጆርናል)",
                        path: "/ui/manager/hrmsPayrollToJournal",
                        icon: Landmark,
                    },
                    {
                        title: "Leave Management (የዕረፍት ፈቃድ)",
                        path: "/ui/manager/hrmsLeave",
                        icon: Calendar,
                    },
                    {
                        title: "Shift & Attendance (የፈረቃና አሻራ ክትትል)",
                        path: "/ui/manager/hrmsAttendance",
                        icon: Timer,
                    },
                ]
            },
            // HRMS Settings & Configuration
            {
                title: "HRMS Settings (ማስተካከያዎች)",
                path: "#",
                icon: Settings,
                roles: ["billzgjt", "systemadmin", "M_HR_OFFICER"],
                children: [
                    {
                        title: "Departments & Units (የሥራ ክፍሎች)",
                        path: "/ui/manager/hrmsDepartments",
                        icon: Building2,
                    },
                    {
                        title: "Positions & Grades (የሥራ መደቦች)",
                        path: "/ui/manager/hrmsPositions",
                        icon: ListTree,
                    },
                    {
                        title: "Salary Components (የደመወዝ መዋቅር)",
                        path: "/ui/manager/hrmsSalaryConfigs",
                        icon: DollarSign,
                    },
                    {
                        title: "Tax Brackets (የገቢ ግብር ሰንጠረዥ)",
                        path: "/ui/manager/hrmsTaxTable",
                        icon: Scale,
                    },
                    {
                        title: "Payroll Account Map (ደመወዝ ሂሳብ ማገናኛ)",
                        path: "/ui/manager/hrmsAccountMap",
                        icon: Link,
                    },
                    {
                        title: "Biometric Devices (የጣት አሻራ መሣሪያ)",
                        path: "/ui/manager/hrmsBiometricDevices",
                        icon: Shield,
                    },
                ]
            }
        ],
    },
    {
        name: "ADMINISTRATION",
        items: [
            {
                title: "Workflow & Roles",
                path: "#",
                icon: GitBranch,
                roles: ["systemadmin", "billzgjt"],
                children: [
                    {
                        title: "Workflow Templates",
                        path: "/ui/manager/workflowTemplates",
                        icon: GitBranch,
                    },
                    {
                        title: "Role Management",
                        path: "/ui/manager/roleManagement",
                        icon: Settings,
                    },
                    {
                        title: "Role Assignment",
                        path: "/ui/manager/roleAssignment",
                        icon: Shield,
                    }
                ]
            }
        ],
    },

];

