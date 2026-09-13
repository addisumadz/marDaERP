"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  GitBranch,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Wrench,
  Calculator,
  Banknote,
  PackageCheck,
  CheckCircle2,
  Printer,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileText,
  Clock,
  Building2,
  Phone,
  Layers,
  Sparkles,
  Shield,
  AlertTriangle,
  Filter,
  Zap,
} from "lucide-react";

import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import CustomNewLineStepper, { getStatusBadge } from "./CustomNewLineStepper";
import CustomApplicationModal from "./CustomApplicationModal";
import CustomPlumberAssignModal from "./CustomPlumberAssignModal";
import CustomMaterialSurveyModal from "./CustomMaterialSurveyModal";
import CustomPaymentApprovalModal from "./CustomPaymentApprovalModal";
import CustomStoreDispatchModal from "./CustomStoreDispatchModal";
import CustomInstallationCompletionModal from "./CustomInstallationCompletionModal";
import CustomFinalActivationModal from "./CustomFinalActivationModal";
import CustomCommonMaterialsModal from "./CustomCommonMaterialsModal";
import { generateSurveyChecklistPdf, generateCostEstimationPdf } from "./customNewLinePdf";
import { UserAccountService } from "../../../lib/userAccountService";
import { DropdownService } from "../../../lib/dropdownService";
import {
  WORKFLOW_ACTION_LABEL,
  getNewLineBannerText,
  getNewLineRoleActionCount,
  isNewLineActionRequiredForRole,
} from "../../../lib/workflowRoleActionHelper";

const userService = new UserAccountService();
const dropdownService = new DropdownService();
import {
  getUserRoles,
  canRegisterApplication,
  canAssignSurveyPlumber,
  canEncodeSurveyItems,
  canApprovePayment,
  canDispatchStoreItems,
  canAssignInstallationPlumber,
  canCompleteInstallation,
  canFinalizeCustomerActivation,
  getUserRoleBadge,
  isAdminRole,
} from "./customNewLineUserRoles";

export default function CustomNewLineConnectionPage() {
  const { data: session } = useSession();

  // Role Permissions
  const userRoles = useMemo(() => getUserRoles(session), [session]);
  const roleBadge = useMemo(() => getUserRoleBadge(userRoles), [userRoles]);
  const isAdmin = useMemo(() => isAdminRole(userRoles), [userRoles]);

  // Synchronous initial branch extractor to prevent any flash of other branches' data
  const initialBranch = useMemo(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user_details");
        if (stored) {
          const parsed = JSON.parse(stored);
          const bId = parsed?.branchId || parsed?.branch?.id;
          const bName = parsed?.branchName || parsed?.branch?.branchDescription || parsed?.branch?.name || "";
          if (bId) return { id: bId, name: bName };
        }
      } catch {}
    }
    return { id: null, name: "" };
  }, []);

  // User Profile & Branch States
  const [currentUser, setCurrentUser] = useState(null);
  const [userBranchId, setUserBranchId] = useState(initialBranch.id);
  const [userBranchName, setUserBranchName] = useState(initialBranch.name);
  const [isProfileLoaded, setIsProfileLoaded] = useState(Boolean(initialBranch.id));
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(
    initialBranch.id ? String(initialBranch.id) : "ALL"
  );

  useEffect(() => {
    const uid = session?.user?.id || session?.id;
    if (uid) {
      userService
        .getUserById(uid)
        .then((u) => {
          if (u) {
            setCurrentUser(u);
            if (u.branchId) {
              setUserBranchId(u.branchId);
              setUserBranchName(u.branchName || "");
              setSelectedBranchId(String(u.branchId));
            }
          }
        })
        .catch((err) => console.warn("Error loading user profile:", err))
        .finally(() => setIsProfileLoaded(true));
    } else {
      setIsProfileLoaded(true);
    }
    dropdownService.getBranches().then((b) => setBranches(b || [])).catch(() => {});
  }, [session]);

  const effectiveBranchId = useMemo(() => {
    if (isAdmin) {
      return selectedBranchId === "ALL" ? null : Number(selectedBranchId);
    }
    return userBranchId;
  }, [isAdmin, selectedBranchId, userBranchId]);

  // Data & KPI states
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [onlyMyActions, setOnlyMyActions] = useState(false);

  // Compute total pending actions for the logged-in user's role
  const myPendingActionCount = useMemo(() => {
    return getNewLineRoleActionCount(stats, userRoles);
  }, [stats, userRoles]);

  // Set default active tab based on user's functional department role
  useEffect(() => {
    if (!isAdmin && userRoles && userRoles.length > 0) {
      if (canAssignSurveyPlumber(userRoles) && !canRegisterApplication(userRoles)) {
        setActiveTab("CS_INTAKE");
      } else if (canApprovePayment(userRoles) && !canRegisterApplication(userRoles)) {
        setActiveTab("REVENUE");
      } else if (canDispatchStoreItems(userRoles) && !canRegisterApplication(userRoles)) {
        setActiveTab("STORE");
      }
    }
  }, [userRoles, isAdmin]);

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [isPlumberModalOpen, setIsPlumberModalOpen] = useState(false);
  const [plumberModalMode, setPlumberModalMode] = useState("survey"); // "survey" | "installation"
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isInstallationModalOpen, setIsInstallationModalOpen] = useState(false);
  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [isCommonMaterialsOpen, setIsCommonMaterialsOpen] = useState(false);

  // Selected item for modals
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Load Data
  const loadData = useCallback(async () => {
    // For non-admin users, hold off until branch is resolved so all branch data never flashes
    if (!isAdmin && !isProfileLoaded) {
      return;
    }
    setLoading(true);
    try {
      let statusFilter = "ALL";
      if (activeTab === "CS_INTAKE") statusFilter = "PENDING_SURVEY_ASSIGNMENT";
      else if (activeTab === "TECH_SURVEY") statusFilter = "SURVEY_IN_PROGRESS";
      else if (activeTab === "REVENUE") statusFilter = "PENDING_PAYMENT_APPROVAL";
      else if (activeTab === "STORE") statusFilter = "PENDING_STORE_COLLECTION";
      else if (activeTab === "INSTALLATION") statusFilter = "INSTALLATION_IN_PROGRESS";
      else if (activeTab === "COMPLETED") statusFilter = "FINAL_ACTIVATION_COMPLETED";

      const [res, statsData] = await Promise.all([
        customNewLineConnectionService.getApplications({
          page,
          size: pageSize,
          status: statusFilter,
          branchId: effectiveBranchId,
          search: searchTerm,
        }),
        customNewLineConnectionService.getDepartmentStats(effectiveBranchId),
      ]);

      setRequests(res?.content || []);
      setTotalPages(res?.totalPages || 0);
      setTotalElements(res?.totalElements || 0);
      setStats(statsData || {});

      // Notify sidebar to refresh its real-time badge count
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("marda_workflow_action_performed"));
      }
    } catch (error) {
      console.error(error);
      toast.error("መረጃ መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, pageSize, searchTerm, effectiveBranchId, isAdmin, isProfileLoaded]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter requests when "የእርሶን እርምጃ የሚጠብቁትን ብቻ አሳይ" is active
  const displayedRequests = useMemo(() => {
    if (!onlyMyActions) return requests;
    return requests.filter((r) => isNewLineActionRequiredForRole(r.status, userRoles));
  }, [requests, onlyMyActions, userRoles]);

  // Contextual View / Relative Action Handlers
  const handleViewAction = (req) => {
    switch (req.status) {
      case "PENDING_SURVEY_ASSIGNMENT":
        if (canAssignSurveyPlumber(userRoles)) {
          handleOpenAssignPlumber(req, "survey");
        } else {
          setExpandedRequestId((prev) => (prev === req.id ? null : req.id));
        }
        break;
      case "SURVEY_IN_PROGRESS":
        handleOpenSurvey(req);
        break;
      case "PENDING_PAYMENT_APPROVAL":
        handleOpenPayment(req);
        break;
      case "PENDING_STORE_COLLECTION":
        handleOpenDispatch(req);
        break;
      case "MATERIALS_COLLECTED":
        if (canAssignInstallationPlumber(userRoles)) {
          handleOpenAssignPlumber(req, "installation");
        } else {
          handleOpenSurvey(req);
        }
        break;
      case "INSTALLATION_IN_PROGRESS":
        if (canCompleteInstallation(userRoles)) {
          handleOpenInstallationCompletion(req);
        } else {
          handleOpenSurvey(req);
        }
        break;
      case "INSTALLATION_COMPLETED":
        if (canFinalizeCustomerActivation(userRoles)) {
          handleOpenActivation(req);
        } else {
          handleOpenSurvey(req);
        }
        break;
      case "FINAL_ACTIVATION_COMPLETED":
      default:
        handleOpenSurvey(req);
        break;
    }
  };

  const getViewActionTitle = (req) => {
    switch (req.status) {
      case "PENDING_SURVEY_ASSIGNMENT":
        return "የዳሰሳ ጥናት ባለሙያ መመደቢያ ይመልከቱ / መድብ";
      case "SURVEY_IN_PROGRESS":
        return "የዳሰሳ ጥናት እቃዎች መዝግብ / ይመልከቱ";
      case "PENDING_PAYMENT_APPROVAL":
        return "የዋጋ ግምት እና ክፍያ ማጽደቂያ ይመልከቱ";
      case "PENDING_STORE_COLLECTION":
        return "የስቶር እቃዎች ማስረከቢያ ይመልከቱ";
      case "MATERIALS_COLLECTED":
        return "የመስመር ዝርጋታ ባለሙያ መመደቢያ ይመልከቱ";
      case "INSTALLATION_IN_PROGRESS":
        return "የመስመር ዝርጋታ ማረጋገጫ ይመልከቱ";
      case "INSTALLATION_COMPLETED":
        return "የደንበኛ ማግበሪያ (Final Activation) ፎርም ይመልከቱ";
      case "FINAL_ACTIVATION_COMPLETED":
      default:
        return "የተጠናቀቀ ዝርዝር መረጃ ይመልከቱ";
    }
  };

  const handleOpenAssignPlumber = (req, mode) => {
    setSelectedRequest(req);
    setPlumberModalMode(mode);
    setIsPlumberModalOpen(true);
  };

  const handleOpenSurvey = (req) => {
    setSelectedRequest(req);
    setIsSurveyModalOpen(true);
  };

  const handleOpenPayment = (req) => {
    setSelectedRequest(req);
    setIsPaymentModalOpen(true);
  };

  const handleOpenDispatch = (req) => {
    setSelectedRequest(req);
    setIsDispatchModalOpen(true);
  };

  const handleOpenActivation = (req) => {
    setSelectedRequest(req);
    setIsActivationModalOpen(true);
  };

  const handleOpenInstallationCompletion = (req) => {
    setSelectedRequest(req);
    setIsInstallationModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
              <GitBranch className="w-6 h-6" />
            </span>
            የአዲስ ውሃ መስመር ዝርጋታ አስተዳደር
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Customer Service & New Line Connection Workflow Management (4 Departments Lifecycle)
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleBadge.color}`}>
              <Shield className="w-3.5 h-3.5" />
              የእርስዎ ሚና: {roleBadge.title}
            </span>
            {userBranchName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Building2 className="w-3.5 h-3.5" />
                ቅርንጫፍ: {userBranchName}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsCommonMaterialsOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-xl transition-all"
          >
            <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            የተለመዱ እቃዎች ካታሎግ
          </button>
          {canRegisterApplication(userRoles) && (
            <button
              type="button"
              onClick={() => setIsAppModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" /> አዲስ ማመልከቻ መዝግብ
            </button>
          )}
        </div>
      </div>

      {/* ─── Top Action-Alert Banner ("የእርሶን እርምጃ (ስራ) ይጠብቆታል") ──────── */}
      {myPendingActionCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-amber-950/40 border-2 border-amber-400 dark:border-amber-600 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-md animate-bounce shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2 flex-wrap">
                <span>⚡ {getNewLineBannerText(myPendingActionCount)}</span>
                <span className="text-[11px] bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  {WORKFLOW_ACTION_LABEL}
                </span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                እባክዎ የእርሶን እርምጃ የሚጠብቁትን ማመልከቻዎች ከዚህ በታች ያሉትን አዝራሮች በመጫን ያከናውኑ።
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyMyActions((prev) => !prev)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${
                onlyMyActions
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              {onlyMyActions ? "ሁሉንም አሳይ (Show All)" : "የእርሶን እርምጃ የሚጠብቁትን ብቻ አሳይ"}
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab("CS_INTAKE")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "CS_INTAKE"
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">ባለሙያ በመጠባበቅ</span>
            {canAssignSurveyPlumber(userRoles) && Number(stats?.pendingSurveyAssignment || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
            {stats?.pendingSurveyAssignment || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Customer Service</div>
          {canAssignSurveyPlumber(userRoles) && Number(stats?.pendingSurveyAssignment || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-amber-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => setActiveTab("TECH_SURVEY")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "TECH_SURVEY"
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-400 ring-2 ring-blue-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">የዳሰሳ ጥናት ላይ</span>
            {canEncodeSurveyItems(userRoles) && Number(stats?.surveyInProgress || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
            {stats?.surveyInProgress || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Technical Department</div>
          {canEncodeSurveyItems(userRoles) && Number(stats?.surveyInProgress || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-blue-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => setActiveTab("REVENUE")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "REVENUE"
              ? "bg-purple-50 dark:bg-purple-950/30 border-purple-400 ring-2 ring-purple-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">ክፍያ በመጠባበቅ</span>
            {canApprovePayment(userRoles) && Number(stats?.pendingPaymentApproval || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">
            {stats?.pendingPaymentApproval || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Revenue Office</div>
          {canApprovePayment(userRoles) && Number(stats?.pendingPaymentApproval || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-purple-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => setActiveTab("STORE")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "STORE"
              ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 ring-2 ring-indigo-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">ዕቃ ማውጣት (ስቶር)</span>
            {canDispatchStoreItems(userRoles) && Number(stats?.pendingStoreCollection || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
            {stats?.pendingStoreCollection || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Inventory Store</div>
          {canDispatchStoreItems(userRoles) && Number(stats?.pendingStoreCollection || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-indigo-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => setActiveTab("INSTALLATION")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "INSTALLATION"
              ? "bg-teal-50 dark:bg-teal-950/30 border-teal-400 ring-2 ring-teal-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-teal-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">ዝርጋታ ላይ ያሉ</span>
            {canCompleteInstallation(userRoles) && Number(stats?.installationInProgress || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-0.5">
            {stats?.installationInProgress || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Field Installation</div>
          {canCompleteInstallation(userRoles) && Number(stats?.installationInProgress || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-teal-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => setActiveTab("COMPLETED")}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "COMPLETED"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-gray-500">የነቁ ቋሚ ደንበኞች</span>
            {canFinalizeCustomerActivation(userRoles) && Number(stats?.installationCompleted || 0) > 0 && (
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            )}
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {stats?.finalActivationCompleted || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Active Customers</div>
          {canFinalizeCustomerActivation(userRoles) && Number(stats?.installationCompleted || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-green-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል ({stats.installationCompleted})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          {/* Department Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { key: "ALL", label: "ሁሉም ጥያቄዎች" },
              { key: "CS_INTAKE", label: "ምዝገባ / አዲስ ጥያቄ" },
              { key: "TECH_SURVEY", label: "ቴክኒክ (ዳሰሳ ጥናት)" },
              { key: "REVENUE", label: "ገቢዎች (ክፍያ)" },
              { key: "STORE", label: "ስቶር (ዕቃ ማስረከብ)" },
              { key: "INSTALLATION", label: "የመስመር ዝርጋታ" },
              { key: "COMPLETED", label: "የነቁ ደንበኞች" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box & Branch Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {isAdmin && (
              <div className="flex items-center gap-1 text-xs">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white outline-none font-medium"
                >
                  <option value="ALL">ሁሉም ቅርንጫፎች (All Branches)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchDescription || b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="relative flex-1 sm:w-60">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadData()}
                placeholder="በማመልከቻ ቁጥር፣ ስም ወይም ስልክ ፈልግ..."
                className="w-full px-3 py-1.5 pl-8 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </div>
            <button
              type="button"
              onClick={loadData}
              className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              title="አድስ"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-300 uppercase font-semibold text-[10px] border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-3 py-3 w-8"></th>
                <th className="px-4 py-3">የማመልከቻ ቁጥር</th>
                <th className="px-4 py-3">የደንበኛ ስም / ስልክ</th>
                <th className="px-3 py-3">ቀበሌ / ቤት ቁጥር</th>
                <th className="px-3 py-3">የጥያቄ ደረጃ (Status)</th>
                <th className="px-3 py-3 text-right">ጠቅላላ ተከፋይ</th>
                <th className="px-4 py-3 text-center">ቀጣይ እርምጃ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    መረጃ በመጫን ላይ...
                  </td>
                </tr>
              ) : displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    {onlyMyActions
                      ? "የእርሶን እርምጃ የሚጠብቅ ምንም ማመልከቻ የለም ✓"
                      : "ምንም ማመልከቻ አልተገኘም"}
                  </td>
                </tr>
              ) : (
                displayedRequests.map((req) => {
                  const badge = getStatusBadge(req.status);
                  const isExpanded = expandedRequestId === req.id;
                  const isMyAction = isNewLineActionRequiredForRole(req.status, userRoles);

                  return (
                    <tr
                      key={req.id}
                      className={`group transition-colors ${
                        isMyAction
                          ? "bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-l-amber-500 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          : "hover:bg-blue-50/30 dark:hover:bg-blue-950/10"
                      }`}
                    >
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                          className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {req.applicationNumber}
                        <div className="text-[10px] text-gray-400 font-normal">
                          {req.customerType?.customerTypeDescription || "የግል ደንበኛ"}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{req.customerFullName}</div>
                        {req.customerFullNameEng && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            {req.customerFullNameEng}
                          </div>
                        )}
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" /> {req.phoneNumber}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 dark:text-gray-300">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {req.kebele?.streetsName
                            ? (req.kebele.streetsName.toLowerCase().includes("kebele") || req.kebele.streetsName.includes("ቀበሌ")
                                ? req.kebele.streetsName
                                : `ቀበሌ ${req.kebele.streetsName}`)
                            : (req.kebele?.name || "ቀበሌ —")}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                          {req.ketena && (
                            <span className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-gray-600 dark:text-gray-300">
                              {req.ketena.ketenaName
                                ? (req.ketena.ketenaName.toLowerCase().includes("ketena") || req.ketena.ketenaName.includes("ቀጠና")
                                    ? req.ketena.ketenaName
                                    : `ቀጠና ${req.ketena.ketenaName}`)
                                : (req.ketena.name || "")}
                            </span>
                          )}
                          <span>ቤት: {req.houseNumber || "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.color}`}>
                          {badge.text}
                        </span>
                        {isMyAction && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 animate-pulse shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
                              ⚡ {WORKFLOW_ACTION_LABEL}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                        ETB {Number(req.totalPayableAmount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* 1. Stage 1 -> Assign Plumber for Survey */}
                          {req.status === "PENDING_SURVEY_ASSIGNMENT" && (
                            canAssignSurveyPlumber(userRoles) ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignPlumber(req, "survey")}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                ባለሙያ መድብ
                              </button>
                            ) : (
                              <span className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded font-medium">
                                ባለሙያ በመጠባበቅ (ቴክኒክ)
                              </span>
                            )
                          )}

                          {/* 2. Stage 2 -> Encode Survey Form & Print Checklist */}
                          {req.status === "SURVEY_IN_PROGRESS" && (
                            <>
                              {canEncodeSurveyItems(userRoles) && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenSurvey(req)}
                                  className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-blue-400"
                                >
                                  እቃዎች መዝግብ
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => generateSurveyChecklistPdf([], req)}
                                className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                                title="የዳሰሳ ፎርም አትም"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* 3. Stage 3 -> Revenue Payment Approval */}
                          {req.status === "PENDING_PAYMENT_APPROVAL" && (
                            <>
                              {canApprovePayment(userRoles) ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPayment(req)}
                                  className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-purple-400"
                                >
                                  ክፍያ አጽድቅ
                                </button>
                              ) : (
                                <span className="text-[11px] text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded font-medium">
                                  ክፍያ በመጠባበቅ (ገቢዎች)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => generateCostEstimationPdf(req)}
                                className="p-1 text-gray-500 hover:text-purple-600 rounded hover:bg-gray-100"
                                title="የዋጋ ማጠቃለያ አትም"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* 4. Stage 4 -> Store Dispatch */}
                          {req.status === "PENDING_STORE_COLLECTION" && (
                            canDispatchStoreItems(userRoles) ? (
                              <button
                                type="button"
                                onClick={() => handleOpenDispatch(req)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-teal-400"
                              >
                                እቃዎች አውጣ
                              </button>
                            ) : (
                              <span className="text-[11px] text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded font-medium">
                                ዕቃ ማውጣት (መደብር)
                              </span>
                            )
                          )}

                          {/* 5. Stage 5 -> Assign Installation Plumber */}
                          {req.status === "MATERIALS_COLLECTED" && (
                            canAssignInstallationPlumber(userRoles) ? (
                              <button
                                type="button"
                                onClick={() => handleOpenAssignPlumber(req, "installation")}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-cyan-400"
                              >
                                ባለሙያ መድብ (ዝርጋታ)
                              </button>
                            ) : (
                              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded font-medium">
                                ዝርጋታ በመጠባበቅ (ቴክኒክ)
                              </span>
                            )
                          )}

                          {/* 6. Stage 6 -> Complete Installation */}
                          {req.status === "INSTALLATION_IN_PROGRESS" && (
                            canCompleteInstallation(userRoles) ? (
                              <button
                                type="button"
                                onClick={() => handleOpenInstallationCompletion(req)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-emerald-400"
                              >
                                ዝርጋታ ተጠናቋል ✓
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-medium">
                                ዝርጋታ ላይ (ቴክኒክ)
                              </span>
                            )
                          )}

                          {/* 7. Stage 7 -> Final Activation */}
                          {req.status === "INSTALLATION_COMPLETED" && (
                            canFinalizeCustomerActivation(userRoles) ? (
                              <button
                                type="button"
                                onClick={() => handleOpenActivation(req)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all animate-pulse ring-2 ring-offset-1 ring-green-400"
                              >
                                ደንበኛውን አንቃ
                              </button>
                            ) : (
                              <span className="text-[11px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded font-medium">
                                ማግበር በመጠባበቅ (ደንበኞች)
                              </span>
                            )
                          )}

                          {/* 8. Stage 8 -> Completed */}
                          {req.status === "FINAL_ACTIVATION_COMPLETED" && (
                            <span className="text-xs text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> የነቃ
                            </span>
                          )}

                          {/* View summary / contextual action button */}
                          <button
                            type="button"
                            onClick={() => handleViewAction(req)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title={getViewActionTitle(req)}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Expandable Details Drawer */}
        {expandedRequestId && (() => {
          const expReq = requests.find((r) => r.id === expandedRequestId);
          if (!expReq) return null;

          return (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  የማመልከቻ {expReq.applicationNumber} ዝርዝር የስራ ሂደት (Workflow Progress)
                </h4>
                <button
                  type="button"
                  onClick={() => setExpandedRequestId(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  ዝጋ ✕
                </button>
              </div>

              {/* Stepper */}
              <CustomNewLineStepper currentStatus={expReq.status} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የደንበኛ እና አድራሻ መረጃ</div>
                  <div>ስም: <strong>{expReq.customerFullName}</strong></div>
                  {expReq.customerFullNameEng && (
                    <div>English Name: <strong>{expReq.customerFullNameEng}</strong></div>
                  )}
                  <div>ስልክ: <strong className="font-mono">{expReq.phoneNumber}</strong></div>
                  <div>ቅርንጫፍ: <strong>{expReq.branch?.branchDescription || expReq.branch?.name || "—"}</strong></div>
                  <div>
                    ቀበሌ: <strong>
                      {expReq.kebele?.streetsName
                        ? (expReq.kebele.streetsName.toLowerCase().includes("kebele") || expReq.kebele.streetsName.includes("ቀበሌ")
                            ? expReq.kebele.streetsName
                            : `ቀበሌ ${expReq.kebele.streetsName}`)
                        : (expReq.kebele?.name || "—")}
                    </strong>
                  </div>
                  <div>
                    ቀጠና: <strong>
                      {expReq.ketena?.ketenaName
                        ? (expReq.ketena.ketenaName.toLowerCase().includes("ketena") || expReq.ketena.ketenaName.includes("ቀጠና")
                            ? expReq.ketena.ketenaName
                            : `ቀጠና ${expReq.ketena.ketenaName}`)
                        : (expReq.ketena?.name || "—")}
                    </strong>
                  </div>
                  <div>ቤት ቁጥር: <strong>{expReq.houseNumber || "—"}</strong></div>
                  {expReq.addressDescription && (
                    <div className="text-[11px] text-gray-500 mt-1 truncate" title={expReq.addressDescription}>
                      መግለጫ: {expReq.addressDescription}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የቴክኒክ ባለሙያ መረጃ</div>
                  <div>ዳሰሳ ባለሙያ: <strong>{expReq.surveyPlumber ? `${expReq.surveyPlumber.firstName} ${expReq.surveyPlumber.lastName}` : "ያልተመደበ"}</strong></div>
                  <div>ዝርጋታ ባለሙያ: <strong>{expReq.installationPlumber ? `${expReq.installationPlumber.firstName} ${expReq.installationPlumber.lastName}` : "ያልተመደበ"}</strong></div>
                  <div>የባለሙያ ማስታወሻ: <span className="text-gray-500">{expReq.surveyPlumberNotes || "—"}</span></div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የክፍያ መረጃ</div>
                  <div>የተከፈለ: <strong>{expReq.isPaid ? "አዎ ✓" : "አይደለም"}</strong></div>
                  <div>ደረሰኝ ቁጥር: <strong className="font-mono">{expReq.paymentReceiptNumber || "—"}</strong></div>
                  <div>ጠቅላላ ክፍያ: <strong className="font-mono text-blue-600">ETB {Number(expReq.totalPayableAmount || 0).toFixed(2)}</strong></div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የቆጣሪ እና ማግበሪያ መረጃ</div>
                  <div>ቆጣሪ ቁጥር: <strong className="font-mono">{expReq.meterNumber || "ያልገባ"}</strong></div>
                  <div>መነሻ ንባብ: <strong>{expReq.initialReading || 0.0}</strong></div>
                  <div>GPS መጋጠሚያ: <span className="font-mono text-[10px]">{expReq.locationCoordination || "—"}</span></div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Pagination */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-2">
          <span>ጠቅላላ {totalElements} ማመልከቻዎች ተገኝተዋል (ገጽ {page + 1} ከ {totalPages || 1})</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              ቀዳሚ
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40"
            >
              ቀጣይ
            </button>
          </div>
        </div>
      </div>

      {/* ─── MODALS ──────────────────────────────────────────────────────── */}
      <CustomApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSuccess={loadData}
        userBranchId={userBranchId}
        userBranchName={userBranchName}
      />

      <CustomPlumberAssignModal
        isOpen={isPlumberModalOpen}
        onClose={() => setIsPlumberModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
        mode={plumberModalMode}
      />

      <CustomMaterialSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
      />

      <CustomPaymentApprovalModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
        userRoles={userRoles}
      />

      <CustomStoreDispatchModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
        userRoles={userRoles}
      />

      <CustomInstallationCompletionModal
        isOpen={isInstallationModalOpen}
        onClose={() => setIsInstallationModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
      />

      <CustomFinalActivationModal
        isOpen={isActivationModalOpen}
        onClose={() => setIsActivationModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
      />

      <CustomCommonMaterialsModal
        isOpen={isCommonMaterialsOpen}
        onClose={() => setIsCommonMaterialsOpen(false)}
      />
    </div>
  );
}
