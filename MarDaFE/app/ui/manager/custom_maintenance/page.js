"use client";
import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { useSession } from "next-auth/react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Wrench,
  Plus,
  Search,
  RefreshCw,
  Eye,
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
  Filter,
  AlertTriangle,
  History,
  Ban,
  XCircle,
} from "lucide-react";

import customMaintenanceService from "../../../lib/customMaintenanceService";
import CustomMaintenanceStepper, { getStatusBadge } from "./CustomMaintenanceStepper";
import CustomMaintenanceRequestModal from "./CustomMaintenanceRequestModal";
import CustomMaintenancePlumberAssignModal from "./CustomMaintenancePlumberAssignModal";
import CustomMaintenanceMaterialSurveyModal from "./CustomMaintenanceMaterialSurveyModal";
import CustomPaymentApprovalModal from "./CustomPaymentApprovalModal";
import CustomStoreDispatchModal from "./CustomStoreDispatchModal";
import CustomMaintenanceCompletionModal from "./CustomMaintenanceCompletionModal";
import CustomMaintenanceCommonMaterialsModal from "./CustomMaintenanceCommonMaterialsModal";
import CustomMaintenanceViewModal from "./CustomMaintenanceViewModal";
import CustomMaintenanceActivityTimeline from "./CustomMaintenanceActivityTimeline";
import CustomMaintenanceRejectCancelModal from "./CustomMaintenanceRejectCancelModal";
import { generateSurveyChecklistPdf, generateCostEstimationPdf } from "./customMaintenancePdf";
import { UserAccountService } from "../../../lib/userAccountService";
import { DropdownService } from "../../../lib/dropdownService";
import {
  WORKFLOW_ACTION_LABEL,
  getMaintenanceBannerText,
  getMaintenanceRoleActionCount,
  isMaintenanceActionRequiredForRole,
} from "../../../lib/workflowRoleActionHelper";
import {
  getUserRoles,
  canRegisterMaintenance,
  canAssignSurveyPlumber,
  canEncodeSurveyItems,
  canApprovePayment,
  canDispatchStoreItems,
  canAssignMaintenancePlumber,
  canCompleteMaintenance,
  getUserRoleBadge,
  isAdminRole,
} from "./customMaintenanceUserRoles";

const userService = new UserAccountService();
const dropdownService = new DropdownService();

export default function CustomMaintenancePage() {
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

  // Maintenance Types for filtering
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("ALL");

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
    customMaintenanceService.getMaintenanceTypes().then((t) => setMaintenanceTypes(t || [])).catch(() => {});
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

  // Filter for requests waiting for currently logged in user's action
  const [onlyMyActions, setOnlyMyActions] = useState(false);

  // Calculate pending role action count
  const myPendingActionCount = useMemo(() => {
    return getMaintenanceRoleActionCount(stats, userRoles);
  }, [stats, userRoles]);

  // Set default active tab based on user's functional department role
  useEffect(() => {
    if (!isAdmin && userRoles && userRoles.length > 0) {
      if (canAssignSurveyPlumber(userRoles) && !canRegisterMaintenance(userRoles)) {
        setActiveTab("CS_INTAKE");
      } else if (canApprovePayment(userRoles) && !canRegisterMaintenance(userRoles)) {
        setActiveTab("REVENUE");
      } else if (canDispatchStoreItems(userRoles) && !canRegisterMaintenance(userRoles)) {
        setActiveTab("STORE");
      }
    }
  }, [userRoles, isAdmin]);

  // Modals state
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [isPlumberModalOpen, setIsPlumberModalOpen] = useState(false);
  const [plumberModalMode, setPlumberModalMode] = useState("survey"); // "survey" | "maintenance"
  const [isPlumberReassign, setIsPlumberReassign] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isCommonMaterialsOpen, setIsCommonMaterialsOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRejectCancelModalOpen, setIsRejectCancelModalOpen] = useState(false);
  const [rejectCancelDefaultType, setRejectCancelDefaultType] = useState("REJECT_SURVEY_UNFEASIBLE");

  // Drawer Tab State
  const [drawerTab, setDrawerTab] = useState("DETAILS"); // "DETAILS" | "TIMELINE"

  // Selected item for modals
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Load Data
  const loadData = useCallback(async () => {
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
      else if (activeTab === "MAINTENANCE") statusFilter = "MAINTENANCE_IN_PROGRESS";
      else if (activeTab === "COMPLETED") statusFilter = "MAINTENANCE_COMPLETED";
      else if (activeTab === "REJECTED_CANCELLED") statusFilter = "REJECTED_OR_CANCELLED";

      const [res, statsData] = await Promise.all([
        customMaintenanceService.getRequests({
          page,
          size: pageSize,
          status: statusFilter,
          branchId: effectiveBranchId,
          maintenanceTypeId: selectedTypeId !== "ALL" ? Number(selectedTypeId) : null,
          search: searchTerm,
        }),
        customMaintenanceService.getDepartmentStats(effectiveBranchId),
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
  }, [activeTab, page, pageSize, searchTerm, effectiveBranchId, selectedTypeId, isAdmin, isProfileLoaded]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter requests when "የእርሶን እርምጃ የሚጠብቁትን ብቻ አሳይ" is active
  const displayedRequests = useMemo(() => {
    if (!onlyMyActions) return requests;
    return requests.filter((r) => isMaintenanceActionRequiredForRole(r.status, userRoles));
  }, [requests, onlyMyActions, userRoles]);

  // Contextual View / 360° Dossier Action Handler
  const handleViewAction = (req) => {
    setSelectedRequest(req);
    setIsViewModalOpen(true);
  };

  const handleActionFromView = (req, actionType) => {
    setSelectedRequest(req);
    if (actionType === "survey_plumber") {
      handleOpenAssignPlumber(req, "survey");
    } else if (actionType === "survey_form") {
      handleOpenSurvey(req);
    } else if (actionType === "payment_approval") {
      handleOpenPayment(req);
    } else if (actionType === "store_dispatch") {
      handleOpenDispatch(req);
    } else if (actionType === "maintenance_plumber") {
      handleOpenAssignPlumber(req, "maintenance");
    } else if (actionType === "complete_maintenance") {
      handleOpenCompletion(req);
    }
  };

  const handleOpenAssignPlumber = (req, mode = "survey", isReassign = false) => {
    setSelectedRequest(req);
    setPlumberModalMode(mode);
    setIsPlumberReassign(isReassign);
    setIsPlumberModalOpen(true);
  };

  const handleOpenRejectCancel = (req, type = "REJECT_SURVEY_UNFEASIBLE") => {
    setSelectedRequest(req);
    setRejectCancelDefaultType(type);
    setIsRejectCancelModalOpen(true);
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

  const handleOpenCompletion = (req) => {
    setSelectedRequest(req);
    setIsCompletionModalOpen(true);
  };

  // Tabs configuration
  const TABS = [
    { key: "ALL", label: "ሁሉም ጥያቄዎች", count: totalElements },
    { key: "CS_INTAKE", label: "1. ምዝገባ / መጠባበቂያ", count: stats?.pendingSurveyAssignment || 0 },
    { key: "TECH_SURVEY", label: "2. የዳሰሳ ጥናት ላይ", count: stats?.surveyInProgress || 0 },
    { key: "REVENUE", label: "3. ክፍያ ማረጋገጫ", count: stats?.pendingPaymentApproval || 0 },
    { key: "STORE", label: "4. ዕቃ ማውጫ", count: stats?.pendingStoreCollection || 0 },
    { key: "MAINTENANCE", label: "5. ጥገና ስራ ላይ", count: stats?.maintenanceInProgress || 0 },
    { key: "COMPLETED", label: "6. የተጠናቀቁ", count: stats?.maintenanceCompleted || 0 },
    { key: "REJECTED_CANCELLED", label: "7. ውድቅ / የተሰረዙ", count: stats?.rejectedOrCancelled || 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 sm:p-6 space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Top Banner & Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl text-white shadow-sm">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                  የደንበኞች ጥገና አገልግሎት አስተዳደር
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleBadge.color}`}>
                  {roleBadge.title}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                የተመዘገቡ ደንበኞች የጥገና ጥያቄዎች ክትትል፣ የቴክኒክ ዳሰሳ፣ የክፍያ ስሌት፣ የስቶር እቃዎችና የጥገና ስራ ማጠናቀቂያ
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCommonMaterialsOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Layers className="w-4 h-4 text-blue-600" />
            የጥገና ዕቃዎች ካታሎግ
          </button>

          {canRegisterMaintenance(userRoles) && (
            <button
              onClick={() => setIsReqModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              አዲስ የጥገና ጥያቄ ጀምር
            </button>
          )}

          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="አድስ (Refresh)"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
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
                <span>⚡ {getMaintenanceBannerText(myPendingActionCount)}</span>
                <span className="text-[11px] bg-amber-500 text-white font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-sm">
                  {WORKFLOW_ACTION_LABEL}
                </span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                እባክዎ የእርሶን እርምጃ የሚጠብቁትን የጥገና ጥያቄዎች ከዚህ በታች ያሉትን አዝራሮች በመጫን ያከናውኑ።
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div
          onClick={() => {
            setActiveTab("CS_INTAKE");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "CS_INTAKE"
              ? "bg-amber-50 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-amber-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>ባለሙያ የሚጠብቁ</span>
            {canAssignSurveyPlumber(userRoles) && Number(stats?.pendingSurveyAssignment || 0) > 0 ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            {stats?.pendingSurveyAssignment || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">የዳሰሳ ጥናት ምደባ</div>
          {canAssignSurveyPlumber(userRoles) && Number(stats?.pendingSurveyAssignment || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-amber-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab("TECH_SURVEY");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "TECH_SURVEY"
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-400 ring-2 ring-blue-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>የዳሰሳ ጥናት ላይ</span>
            {canEncodeSurveyItems(userRoles) && Number(stats?.surveyInProgress || 0) > 0 ? (
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            ) : (
              <Wrench className="w-3.5 h-3.5 text-blue-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">
            {stats?.surveyInProgress || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ዕቃና ክፍያ መሙያ</div>
          {canEncodeSurveyItems(userRoles) && Number(stats?.surveyInProgress || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-blue-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab("REVENUE");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "REVENUE"
              ? "bg-purple-50 dark:bg-purple-950/30 border-purple-400 ring-2 ring-purple-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-purple-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>ክፍያ የሚጠብቁ</span>
            {canApprovePayment(userRoles) && Number(stats?.pendingPaymentApproval || 0) > 0 ? (
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            ) : (
              <Banknote className="w-3.5 h-3.5 text-purple-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1 font-mono">
            {stats?.pendingPaymentApproval || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">የገቢዎች ማረጋገጫ</div>
          {canApprovePayment(userRoles) && Number(stats?.pendingPaymentApproval || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-purple-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab("STORE");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "STORE"
              ? "bg-teal-50 dark:bg-teal-950/30 border-teal-400 ring-2 ring-teal-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-teal-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>እቃ ማውጫ</span>
            {canDispatchStoreItems(userRoles) && Number(stats?.pendingStoreCollection || 0) > 0 ? (
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
            ) : (
              <PackageCheck className="w-3.5 h-3.5 text-teal-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400 mt-1 font-mono">
            {stats?.pendingStoreCollection || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ከመጋዘን ርክክብ</div>
          {canDispatchStoreItems(userRoles) && Number(stats?.pendingStoreCollection || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-teal-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab("MAINTENANCE");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "MAINTENANCE"
              ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-400 ring-2 ring-cyan-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-cyan-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>ጥገና ስራ ላይ</span>
            {(canCompleteMaintenance(userRoles) || canAssignMaintenancePlumber(userRoles)) && Number(stats?.maintenanceInProgress || 0) > 0 ? (
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            )}
          </div>
          <div className="text-xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1 font-mono">
            {stats?.maintenanceInProgress || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">በባለሙያ ጥገና ላይ</div>
          {(canCompleteMaintenance(userRoles) || canAssignMaintenancePlumber(userRoles)) && Number(stats?.maintenanceInProgress || 0) > 0 && (
            <div className="mt-1.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-900/60 px-1.5 py-0.5 rounded-full animate-pulse border border-cyan-300">
                ⚡ የእርሶን እርምጃ ይጠብቆታል
              </span>
            </div>
          )}
        </div>

        <div
          onClick={() => {
            setActiveTab("COMPLETED");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "COMPLETED"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-emerald-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>የተጠናቀቁ ጥገናዎች</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            {stats?.maintenanceCompleted || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ተፈትሸው የተጠናቀቁ</div>
        </div>

        <div
          onClick={() => {
            setActiveTab("REJECTED_CANCELLED");
            setPage(0);
          }}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all relative ${
            activeTab === "REJECTED_CANCELLED"
              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-400 ring-2 ring-rose-400/20"
              : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-rose-300"
          }`}
        >
          <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>ውድቅ / የተሰረዙ</span>
            <Ban className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 font-mono">
            {stats?.rejectedOrCancelled || 0}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">ያልተሳኩ / የተሰረዙ</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-100 dark:border-gray-700 text-xs">
          {TABS.map((tab) => {
            const hasMyActionInTab =
              (tab.key === "CS_INTAKE" && canAssignSurveyPlumber(userRoles) && Number(stats?.pendingSurveyAssignment || 0) > 0) ||
              (tab.key === "TECH_SURVEY" && canEncodeSurveyItems(userRoles) && Number(stats?.surveyInProgress || 0) > 0) ||
              (tab.key === "REVENUE" && canApprovePayment(userRoles) && Number(stats?.pendingPaymentApproval || 0) > 0) ||
              (tab.key === "STORE" && canDispatchStoreItems(userRoles) && Number(stats?.pendingStoreCollection || 0) > 0) ||
              (tab.key === "MAINTENANCE" && (canCompleteMaintenance(userRoles) || canAssignMaintenancePlumber(userRoles)) && Number(stats?.maintenanceInProgress || 0) > 0);

            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(0);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 relative ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {hasMyActionInTab && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === tab.key ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Branch Filter & Maintenance Type Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex-1 w-full sm:max-w-md relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              placeholder="በጥገና ቁጥር፣ በደንበኛ ስም፣ በሂሳብ ቁጥር፣ በቆጣሪ ወይም በስልክ ይፈልጉ..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {/* Maintenance Type Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={selectedTypeId}
                onChange={(e) => {
                  setSelectedTypeId(e.target.value);
                  setPage(0);
                }}
                className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white text-xs outline-none font-medium"
              >
                <option value="ALL">ሁሉም የጥገና ዓይነቶች</option>
                {maintenanceTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.typeNameAm}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {isAdmin ? (
                <select
                  value={selectedBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setPage(0);
                  }}
                  className="px-2.5 py-1.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white text-xs outline-none font-medium"
                >
                  <option value="ALL">ሁሉም ቅርንጫፎች (All Branches)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchName}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 font-semibold rounded-xl text-xs border border-blue-200 dark:border-blue-800">
                  {userBranchName || "ቅርንጫፍ"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Requests Data Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-100 dark:border-gray-700 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-10 text-center">ተ.ቁ</th>
                <th className="py-3 px-3">የጥገና ቁጥር</th>
                <th className="py-3 px-3">የደንበኛ ስም እና ሂሳብ</th>
                <th className="py-3 px-3">ስልክ ቁጥር</th>
                <th className="py-3 px-3">የጥገና ዓይነት</th>
                <th className="py-3 px-3">ቅርንጫፍ</th>
                <th className="py-3 px-3 text-center">ደረጃ / ሁኔታ</th>
                <th className="py-3 px-3">የተመዘገበበት ቀን</th>
                <th className="py-3 px-3 text-center">ቀጣይ እርምጃ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    የጥገና ጥያቄዎችን በመጫን ላይ...
                  </td>
                </tr>
              ) : displayedRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    {onlyMyActions
                      ? "የእርሶን እርምጃ የሚጠብቅ ምንም የጥገና ጥያቄ የለም ✓"
                      : "ምንም የተገኘ የጥገና ጥያቄ የለም።"}
                  </td>
                </tr>
              ) : (
                displayedRequests.map((req, idx) => {
                  const statusInfo = getStatusBadge(req.status);
                  const isExpanded = expandedRequestId === req.id;
                  const isMyAction = isMaintenanceActionRequiredForRole(req.status, userRoles);

                  return (
                    <Fragment key={req.id}>
                      <tr
                        className={`transition-colors ${
                          isMyAction
                            ? "bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-l-amber-500 shadow-sm hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            : "hover:bg-blue-50/30 dark:hover:bg-gray-700/40"
                        }`}
                      >
                        <td className="py-3 px-3 text-center text-gray-400 font-mono">
                          {page * pageSize + idx + 1}
                        </td>

                        {/* Request Number */}
                        <td className="py-3 px-3">
                          <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                            {req.requestNumber}
                          </span>
                        </td>

                        {/* Customer Info */}
                        <td className="py-3 px-3">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {req.customerFullName}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-2">
                            <span className="font-mono">ሂሳብ: {req.accountNumber}</span>
                            {req.meterNumber && <span>| ቆጣሪ: {req.meterNumber}</span>}
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="py-3 px-3 font-mono text-gray-700 dark:text-gray-300">
                          {req.phoneNumber}
                        </td>

                        {/* Maintenance Type */}
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {req.maintenanceType?.typeNameAm || "አጠቃላይ ጥገና"}
                          </span>
                        </td>

                        {/* Branch */}
                        <td className="py-3 px-3 text-gray-700 dark:text-gray-300 font-medium">
                          {req.branch?.branchName || "—"}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>

                          {/* SLA Aging Indicator */}
                          {req.status !== "MAINTENANCE_COMPLETED" &&
                            req.status !== "APPLICATION_CANCELLED" &&
                            req.status !== "SURVEY_REJECTED_UNFEASIBLE" &&
                            (() => {
                              const dt = new Date(req.createdAt);
                              const diffDays = Math.floor((new Date() - dt) / (1000 * 60 * 60 * 24));
                              if (diffDays >= 4) {
                                return (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300">
                                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                                      {diffDays} ቀናት (SLA አሳሳቢ)
                                    </span>
                                  </div>
                                );
                              } else if (diffDays >= 2) {
                                return (
                                  <div className="mt-1">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300">
                                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                                      {diffDays} ቀናት
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                          {isMyAction && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 animate-pulse shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
                                ⚡ {WORKFLOW_ACTION_LABEL}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-gray-500 text-[11px] font-mono">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "—"}
                        </td>

                        {/* Contextual Action Button & 360 View Action */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Eye button ALWAYS opens comprehensive 360 Dossier view */}
                            <button
                              type="button"
                              onClick={() => handleViewAction(req)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                              title="ሙሉ መረጃ ተመልከት (360° View Dossier)"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Relative Step Action Button */}
                            {req.status === "RETURNED_FOR_REVISION" && canEncodeSurveyItems(userRoles) && (
                              <button
                                onClick={() => handleOpenSurvey(req)}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                                title="የክለሳ አስተያየቶችን ተመልክተው ዕቃዎችን ያስተካክሉ"
                              >
                                <Calculator className="w-3 h-3" />
                                ዕቃዎች አስተካክል
                              </button>
                            )}

                            {req.status === "RETURNED_FOR_REVISION" && (canAssignSurveyPlumber(userRoles) || isAdmin) && (
                              <button
                                onClick={() => handleOpenAssignPlumber(req, "survey", true)}
                                className="p-1.5 text-amber-700 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900/40 rounded-lg transition-colors"
                                title="ዳሰሳ ባለሙያ ቀይር (Reassign)"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {req.status === "PENDING_SURVEY_ASSIGNMENT" && canAssignSurveyPlumber(userRoles) && (
                              <button
                                onClick={() => handleOpenAssignPlumber(req, "survey")}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                <Wrench className="w-3 h-3" />
                                ባለሙያ መድብ
                              </button>
                            )}

                            {req.status === "SURVEY_IN_PROGRESS" && canEncodeSurveyItems(userRoles) && (
                              <button
                                onClick={() => handleOpenSurvey(req)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                <Calculator className="w-3 h-3" />
                                ዕቃና ክፍያ ሙላ
                              </button>
                            )}

                            {req.status === "SURVEY_IN_PROGRESS" && (canAssignSurveyPlumber(userRoles) || isAdmin) && (
                              <button
                                onClick={() => handleOpenAssignPlumber(req, "survey", true)}
                                className="p-1.5 text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                                title="የዳሰሳ ባለሙያ ቀይር (Reassign)"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {req.status === "PENDING_PAYMENT_APPROVAL" && canApprovePayment(userRoles) && (
                              <button
                                onClick={() => handleOpenPayment(req)}
                                className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                <Banknote className="w-3 h-3" />
                                ክፍያ አጽድቅ
                              </button>
                            )}

                            {req.status === "PENDING_STORE_COLLECTION" && canDispatchStoreItems(userRoles) && (
                              <button
                                onClick={() => handleOpenDispatch(req)}
                                className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                <PackageCheck className="w-3 h-3" />
                                ዕቃ አስረክብ
                              </button>
                            )}

                            {req.status === "MATERIALS_COLLECTED" && canAssignMaintenancePlumber(userRoles) && (
                              <button
                                onClick={() => handleOpenAssignPlumber(req, "maintenance")}
                                className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                <Wrench className="w-3 h-3" />
                                የጥገና ባለሙያ መድብ
                              </button>
                            )}

                            {req.status === "MAINTENANCE_IN_PROGRESS" && canCompleteMaintenance(userRoles) && (
                              <button
                                onClick={() => handleOpenCompletion(req)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1 shadow-sm animate-pulse ring-2 ring-offset-1 ring-amber-400"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                ጥገናውን አጠናቅቅ
                              </button>
                            )}

                            {req.status === "MAINTENANCE_IN_PROGRESS" && (canAssignMaintenancePlumber(userRoles) || isAdmin) && (
                              <button
                                onClick={() => handleOpenAssignPlumber(req, "maintenance", true)}
                                className="p-1.5 text-cyan-700 hover:bg-cyan-100 dark:text-cyan-300 dark:hover:bg-cyan-900/40 rounded-lg transition-colors"
                                title="የጥገና ባለሙያ ቀይር (Reassign)"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}

                            {/* Print PDF trigger */}
                            <button
                              type="button"
                              onClick={() => generateCostEstimationPdf(req)}
                              className="p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              title="ቅጽ አትም (Print PDF)"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            {/* Expand Details Trigger */}
                            <button
                              type="button"
                              onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                              title={isExpanded ? "ዝርዝር ደብቅ" : "ዝርዝር አሳይ"}
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Details Drawer Row */}
                      {isExpanded && (
                        <tr className="bg-blue-50/20 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700">
                          <td colSpan={9} className="p-4">
                            <div className="space-y-4 animate-in fade-in">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                                  <Layers className="w-4 h-4 text-blue-600" />
                                  የጥገና ጥያቄ {req.requestNumber} ዝርዝር የስራ ሂደት (Workflow Progress)
                                </h4>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleViewAction(req)}
                                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> ሙሉ መረጃ (360° Dossier) ➔
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedRequestId(null)}
                                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 px-2 py-1"
                                  >
                                    ዝጋ ✕
                                  </button>
                                </div>
                              </div>

                              {/* Drawer Sub-Tabs (Details vs Activity Timeline) */}
                              <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                <button
                                  type="button"
                                  onClick={() => setDrawerTab("DETAILS")}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    drawerTab === "DETAILS"
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                  }`}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  አጠቃላይ መረጃ
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDrawerTab("TIMELINE")}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
                                    drawerTab === "TIMELINE"
                                      ? "bg-blue-600 text-white shadow-sm"
                                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                  }`}
                                >
                                  <History className="w-3.5 h-3.5 text-indigo-500" />
                                  የስራ ሂደት ታሪክ እና ኦዲት (Logs)
                                </button>
                              </div>

                              {/* Stepper */}
                              <CustomMaintenanceStepper currentStatus={req.status} />

                              {/* Drawer Tab Content */}
                              {drawerTab === "TIMELINE" ? (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                                  <CustomMaintenanceActivityTimeline requestId={req.id} />
                                </div>
                              ) : (
                                <div className="space-y-4">
                                  {/* Rejection / Cancellation Alerts */}
                                  {req.rejectionReason && (
                                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                                      <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                      <div>
                                        <div className="font-bold">የዳሰሳ ጥናት ውድቅ የተደረገበት ምክንያት:</div>
                                        <div className="mt-0.5 text-rose-800 dark:text-rose-300">{req.rejectionReason}</div>
                                        <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-1">
                                          ውድቅ ያደረገው: {req.rejectedBy || "—"} {req.rejectedDate ? `| ቀን: ${new Date(req.rejectedDate).toLocaleString()}` : ""}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {req.cancellationReason && (
                                    <div className="p-3.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-xs text-gray-800 dark:text-gray-200 flex items-start gap-2.5">
                                      <Ban className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                                      <div>
                                        <div className="font-bold">ጥያቄው የተሰረዘበት ምክንያት:</div>
                                        <div className="mt-0.5">{req.cancellationReason}</div>
                                      </div>
                                    </div>
                                  )}

                                  {/* 4 Cards Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                      <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የደንበኛ እና አድራሻ መረጃ</div>
                                      <div>ስም: <strong>{req.customerFullName}</strong></div>
                                      <div>ሂሳብ ቁጥር: <strong className="font-mono">{req.accountNumber}</strong></div>
                                      <div>ስልክ: <strong className="font-mono">{req.phoneNumber}</strong></div>
                                      <div>ቀበሌ/ቀጠና: <span>{req.kebele?.streetsName || "—"} / {req.ketena?.ketenaName || "—"}</span></div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                      <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የቴክኒክ ባለሙያ መረጃ</div>
                                      <div>ዳሰሳ ባለሙያ: <strong>{req.surveyPlumber ? `${req.surveyPlumber.firstName} ${req.surveyPlumber.lastName}` : "ያልተመደበ"}</strong></div>
                                      <div>ጥገና ባለሙያ: <strong>{req.maintenancePlumber ? `${req.maintenancePlumber.firstName} ${req.maintenancePlumber.lastName}` : "ያልተመደበ"}</strong></div>
                                      <div className="text-[11px] text-gray-500 mt-1 truncate" title={req.surveyPlumberNotes}>
                                        ማስታወሻ: {req.surveyPlumberNotes || "—"}
                                      </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                      <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የክፍያ ሁኔታ</div>
                                      <div>ሁኔታ: <strong>{req.isPaid ? "ተከፍሏል ✓" : "አልተከፈለም"}</strong></div>
                                      <div>ደረሰኝ ቁጥር: <strong className="font-mono">{req.paymentReceiptNumber || "—"}</strong></div>
                                      <div>ጠቅላላ ክፍያ: <strong className="font-mono text-blue-600">ETB {Number(req.totalPayableAmount || 0).toFixed(2)}</strong></div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                      <div className="font-bold text-gray-700 dark:text-gray-300 border-b pb-1 mb-2">የችግሩ መግለጫ</div>
                                      <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-3">
                                        {req.problemDescription || "መግለጫ አልተሰጠም"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Supervisory Action Bar */}
                                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
                                    {(req.status === "SURVEY_IN_PROGRESS" || req.status === "RETURNED_FOR_REVISION") && (canAssignSurveyPlumber(userRoles) || isAdmin) && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAssignPlumber(req, "survey", true)}
                                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        የዳሰሳ ባለሙያ ቀይር (Reassign)
                                      </button>
                                    )}

                                    {req.status === "MAINTENANCE_IN_PROGRESS" && (canAssignMaintenancePlumber(userRoles) || isAdmin) && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenAssignPlumber(req, "maintenance", true)}
                                        className="px-3 py-1.5 text-xs font-semibold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 rounded-lg border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5 transition-colors"
                                      >
                                        <UserCheck className="w-3.5 h-3.5" />
                                        የጥገና ባለሙያ ቀይር (Reassign)
                                      </button>
                                    )}

                                    {(req.status === "SURVEY_IN_PROGRESS" || req.status === "RETURNED_FOR_REVISION") && (canEncodeSurveyItems(userRoles) || canAssignSurveyPlumber(userRoles) || isAdmin) && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRejectCancel(req, "REJECT_SURVEY_UNFEASIBLE")}
                                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-1.5 transition-colors"
                                      >
                                        <XCircle className="w-3.5 h-3.5" />
                                        የዳሰሳ ጥናት ውድቅ አድርግ
                                      </button>
                                    )}

                                    {req.status !== "MAINTENANCE_COMPLETED" && req.status !== "APPLICATION_CANCELLED" && req.status !== "SURVEY_REJECTED_UNFEASIBLE" && (canRegisterMaintenance(userRoles) || isAdmin) && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenRejectCancel(req, "CANCEL_APPLICATION")}
                                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center gap-1.5 transition-colors"
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                        ጥያቄውን ሰርዝ (Cancel)
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
            <div>
              ገጽ {page + 1} ከ {totalPages} (ጠቅላላ {totalElements} ጥያቄዎች)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                ቀዳሚ
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold"
              >
                ቀጣይ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals Mounting */}
      <CustomMaintenanceRequestModal
        isOpen={isReqModalOpen}
        onClose={() => setIsReqModalOpen(false)}
        onSuccess={loadData}
        userBranchId={effectiveBranchId}
      />

      <CustomMaintenancePlumberAssignModal
        isOpen={isPlumberModalOpen}
        onClose={() => setIsPlumberModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
        mode={plumberModalMode}
        isReassign={isPlumberReassign}
      />

      <CustomMaintenanceMaterialSurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
        readOnly={
          Boolean(selectedRequest?.isPaid) ||
          [
            "PENDING_STORE_COLLECTION",
            "MATERIALS_COLLECTED",
            "MAINTENANCE_IN_PROGRESS",
            "MAINTENANCE_COMPLETED",
            "SURVEY_REJECTED_UNFEASIBLE",
            "APPLICATION_CANCELLED",
          ].includes(selectedRequest?.status)
        }
        onRejectSurvey={(r) => handleOpenRejectCancel(r, "REJECT_SURVEY_UNFEASIBLE")}
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

      <CustomMaintenanceCompletionModal
        isOpen={isCompletionModalOpen}
        onClose={() => setIsCompletionModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
      />

      <CustomMaintenanceCommonMaterialsModal
        isOpen={isCommonMaterialsOpen}
        onClose={() => setIsCommonMaterialsOpen(false)}
      />

      <CustomMaintenanceViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        request={selectedRequest}
        userRoles={userRoles}
        onOpenAction={handleActionFromView}
      />

      <CustomMaintenanceRejectCancelModal
        isOpen={isRejectCancelModalOpen}
        onClose={() => setIsRejectCancelModalOpen(false)}
        onSuccess={loadData}
        request={selectedRequest}
        defaultActionType={rejectCancelDefaultType}
      />
    </div>
  );
}
