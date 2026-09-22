"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import invPurchaseRequisitionService from "../../../lib/invPurchaseRequisitionService";
import workflowService from "../../../lib/workflowService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import invCategoryService from "../../../lib/invCategoryService";
import invUserStoreService from "../../../lib/invUserStoreService";
import { UserAccountService } from "../../../lib/userAccountService";

const userService = new UserAccountService();
import {
  FileText,
  FileCheck,
  Plus,
  X,
  Eye,
  Check,
  CheckCheck,
  XCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CircleDot,
  Clock,
  MessageSquare,
  Sparkles,
  UserCheck,
  Building2,
  AlertCircle,
  Loader2,
  Printer,
  Search,
  ChevronDown,
  Tag,
  Package,
  PackageSearch,
  Filter
} from "lucide-react";
import { generatePurchaseRequisitionPdf } from "./purchaseRequisitionPdf";

/* ─── Status Colors ────────────────────────────────────────── */
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  APPROVED_L1: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  APPROVED_L2: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  CONVERTED_TO_PO: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  CANCELLED: "bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300",
};

/* ─── Dynamic Approval Stepper ─────────────────────────────── */
function ApprovalStepper({ status, templateSteps = [], currentStep = null, rejectionReason = "" }) {
  const rejected = status === "REJECTED";
  const isDraft = status === "DRAFT";
  const isFullyApproved = status === "APPROVED" || status === "APPROVED_L2" || status === "CONVERTED_TO_PO";

  // Build steps from active workflow template, falling back to standard 2-step if none
  const effectiveSteps = templateSteps.length > 0 ? templateSteps : [
    { stepOrder: 1, stepName: "Dept. Manager Approval", approverRoleCode: "M_TECHNICAL_MANAGER" },
    { stepOrder: 2, stepName: "Finance Manager Approval", approverRoleCode: "M_FINANCE_HEAD" }
  ];

  const steps = [
    { key: "DRAFT", label: "Request Created", role: "Requester" },
    ...effectiveSteps.map(s => ({
      key: `STEP_${s.stepOrder}`,
      label: s.stepName,
      labelAm: s.stepNameAm,
      role: s.approverRoleCode,
      stepOrder: s.stepOrder,
      sla: s.slaHours,
    })),
    { key: "APPROVED", label: "Ready for PO", role: "PO Ready" },
    ...(status === "CONVERTED_TO_PO" ? [{ key: "CONVERTED_TO_PO", label: "Converted to PO", role: "Purchaser" }] : [])
  ];

  // Determine active step index
  let activeIdx = 0;
  if (isDraft) {
    activeIdx = 0;
  } else if (isFullyApproved) {
    activeIdx = steps.length - 1;
  } else if (currentStep) {
    const idx = steps.findIndex(s => s.stepOrder === currentStep.stepOrder);
    activeIdx = idx >= 0 ? idx : 1;
  } else if (status === "APPROVED_L1") {
    activeIdx = Math.min(2, steps.length - 2);
  } else {
    activeIdx = 1;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between overflow-x-auto py-1">
        {steps.map((step, i) => {
          const done = !rejected && (isFullyApproved || activeIdx > i);
          const current = !rejected && activeIdx === i && !isFullyApproved;
          return (
            <div key={step.key} className="flex items-center flex-1 min-w-[120px] last:flex-none">
              {/* Step Circle & Titles */}
              <div className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  done ? "bg-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/40" :
                  current ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 ring-4 ring-indigo-100 dark:ring-indigo-900/40" :
                  "bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                }`}>
                  {done ? <Check className="w-4 h-4" /> : current ? <CircleDot className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                  done ? "text-green-600 dark:text-green-400" :
                  current ? "text-indigo-600 dark:text-indigo-400 font-semibold" :
                  "text-gray-400 dark:text-gray-500"
                }`}>
                  {step.label}
                </span>
                {step.role && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 max-w-[110px] truncate">
                    {step.role}
                  </span>
                )}
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                  done ? "bg-green-400 dark:bg-green-600" : "bg-gray-200 dark:bg-gray-600"
                }`} />
              )}
            </div>
          );
        })}
      </div>
      {rejected && (
        <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 text-sm font-medium">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>Requisition Rejected: {rejectionReason || "Approval was denied."}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Searchable Item Selection Dropdown Component ─────────── */
function SearchableItemSelect({
  items = [],
  categories = [],
  selectedItemId = "",
  lineCategoryId = "",
  onSelect,
  onCategoryFilterChange,
  hasError = false,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalCategoryFilter, setInternalCategoryFilter] = useState(lineCategoryId || "");
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keep internal category filter aligned with line category if provided
  useEffect(() => {
    setInternalCategoryFilter(lineCategoryId || "");
  }, [lineCategoryId]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Find currently selected item
  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null;
    return items.find((i) => String(i.id) === String(selectedItemId)) || null;
  }, [items, selectedItemId]);

  // Filter items by category & search query
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      // Category filter check
      if (internalCategoryFilter) {
        const itemCatId = item.category?.id ?? item.categoryId;
        if (String(itemCatId) !== String(internalCategoryFilter)) {
          return false;
        }
      }
      // Query filter check
      if (!q) return true;
      const code = (item.itemCode || "").toLowerCase();
      const name = (item.itemName || "").toLowerCase();
      const nameAm = (item.itemNameAm || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      return code.includes(q) || name.includes(q) || nameAm.includes(q) || desc.includes(q);
    });
  }, [items, internalCategoryFilter, searchQuery]);

  // Limit visible items to prevent DOM lag on very large catalogs
  const visibleItems = useMemo(() => filteredItems.slice(0, 80), [filteredItems]);

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onSelect(null);
  };

  const handleCategoryPillClick = (e, catId) => {
    e.stopPropagation();
    setInternalCategoryFilter(catId);
    if (onCategoryFilterChange) {
      onCategoryFilterChange(catId);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      {selectedItem ? (
        <div
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`w-full px-2.5 py-1.5 border rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-xs ${
            hasError
              ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
              : isOpen
              ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-gray-700"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 shrink-0">
              {selectedItem.itemCode}
            </span>
            <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
              {selectedItem.itemName}
              {selectedItem.itemNameAm && (
                <span className="text-gray-500 text-[11px] font-normal ml-1">
                  ({selectedItem.itemNameAm})
                </span>
              )}
            </span>
            {selectedItem.category?.categoryName && (
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 shrink-0">
                {selectedItem.category.categoryName}
              </span>
            )}
            {(selectedItem.unitOfMeasure?.unitCode || selectedItem.unitOfMeasure?.unitName) && (
              <span className="hidden md:inline-block text-[10px] text-gray-400 shrink-0">
                • {selectedItem.unitOfMeasure?.unitCode || selectedItem.unitOfMeasure?.unitName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-1.5">
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && setIsOpen(true)}
          className={`w-full px-2.5 py-2 border rounded-lg flex items-center justify-between cursor-pointer transition-all shadow-xs ${
            hasError
              ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
              : isOpen
              ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-gray-700"
              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-indigo-400"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 min-w-0 text-gray-400">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs truncate">
              {internalCategoryFilter
                ? "Search item in category... (እቃ ይምረጡ)"
                : "Search or select item... (እቃ ይምረጡ)"}
            </span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
        </div>
      )}

      {/* Floating Popover Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150 min-w-[300px]">
          {/* Search & Category Filter Header */}
          <div className="p-2.5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/50 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by code (e.g. PIPE), name, or Amharic..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills inside Popover */}
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px] scrollbar-none">
                <button
                  type="button"
                  onClick={(e) => handleCategoryPillClick(e, "")}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                    !internalCategoryFilter
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  All Categories ({items.length})
                </button>
                {categories.map((c) => {
                  const catCount = items.filter((i) => (i.category?.id ?? i.categoryId) === c.id).length;
                  const isCatActive = String(internalCategoryFilter) === String(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={(e) => handleCategoryPillClick(e, String(c.id))}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors ${
                        isCatActive
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {c.categoryName} {catCount > 0 ? `(${catCount})` : ""}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50">
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => {
                const isItemActive = String(selectedItemId) === String(item.id);
                const itemCatName = item.category?.categoryName ||
                  categories.find(c => c.id === (item.category?.id ?? item.categoryId))?.categoryName;
                const uom = item.unitOfMeasure?.unitCode || item.unitOfMeasure?.unitName;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className={`p-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                      isItemActive
                        ? "bg-indigo-50 dark:bg-indigo-900/40"
                        : "hover:bg-indigo-50/60 dark:hover:bg-indigo-900/20"
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/50 dark:border-indigo-800/50">
                          {item.itemCode}
                        </span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                          {item.itemName}
                        </span>
                        {item.itemNameAm && (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400">
                            ({item.itemNameAm})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                        {itemCatName && (
                          <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">
                            {itemCatName}
                          </span>
                        )}
                        {uom && (
                          <span>Unit: <strong className="text-gray-700 dark:text-gray-300">{uom}</strong></span>
                        )}
                        {item.defaultUnitCost && Number(item.defaultUnitCost) > 0 && (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400">
                            Est. Cost: ETB {Number(item.defaultUnitCost).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isItemActive && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <PackageSearch className="w-7 h-7 mx-auto text-gray-400 opacity-60" />
                <p>
                  No items found
                  {searchQuery && (
                    <span> matching <strong className="text-gray-700 dark:text-gray-300">"{searchQuery}"</strong></span>
                  )}
                  {internalCategoryFilter && (
                    <span> in this category</span>
                  )}
                </p>
                {(searchQuery || internalCategoryFilter) && (
                  <div className="flex items-center justify-center gap-2 pt-1">
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="px-2 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Clear search
                      </button>
                    )}
                    {internalCategoryFilter && (
                      <button
                        type="button"
                        onClick={(e) => handleCategoryPillClick(e, "")}
                        className="px-2 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        Show all categories
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700/40 border-t border-gray-100 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <span>
              Showing {visibleItems.length} of {filteredItems.length} items
              {filteredItems.length > 80 ? " (type to narrow down)" : ""}
            </span>
            <span className="hidden sm:inline">Press Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function InvPurchaseRequisitionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const rawRoles = session?.user?.roles || session?.roles || [];
  const userRoles = Array.isArray(rawRoles) ? rawRoles : [];

  const [prs, setPrs] = useState([]);
  const [wfInstances, setWfInstances] = useState({}); // prId -> WfWorkflowInstance
  const [templateSteps, setTemplateSteps] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myStores, setMyStores] = useState([]);
  const [assignedStore, setAssignedStore] = useState(null);
  const [currentUserBranch, setCurrentUserBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [approveComments, setApproveComments] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectErrors, setRejectErrors] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [form, setForm] = useState({
    storeId: "",
    remarks: "",
    lines: [{ categoryId: "", itemId: "", requestedQuantity: "", estimatedUnitCost: "", purpose: "" }]
  });
  const [formErrors, setFormErrors] = useState({});

  /* ── Role helpers with Admin Override ── */
  const normalizedRoles = userRoles.map(r => String(r || "").replace(/^ROLE_/i, "").toLowerCase());
  const isSuperAdmin = normalizedRoles.some(r => ["billzgjt", "systemadmin", "admin"].includes(r));
  const isMainOffice = currentUserBranch?.branchCode?.toUpperCase() === "MO" ||
    (currentUserBranch?.branchName && currentUserBranch.branchName.toLowerCase().includes("main"));
  const isMainOfficeOrAdmin = isSuperAdmin || isMainOffice;
  const isRequester = isSuperAdmin || isMainOffice || normalizedRoles.some(r =>
    ["m_branch_store", "m_gebi_officer", "inv_storekeeper", "inv_manager"].includes(r)
  );

  // Initial load
  useEffect(() => {
    loadLookups();
    loadWorkflowTemplate();
  }, []);

  useEffect(() => {
    if (session?.user?.id && !currentUserBranch) {
      userService.getUserById(session.user.id).then(userProfile => {
        if (userProfile && userProfile.branchId) {
          const storeInBranch = stores.find(s => s.branch?.id === userProfile.branchId);
          setCurrentUserBranch({
            id: userProfile.branchId,
            branchCode: storeInBranch?.branch?.branchCode || "",
            branchName: userProfile.branchName || storeInBranch?.branch?.branchDescription || ""
          });
        }
      }).catch(() => {});
    }
  }, [session?.user?.id, stores, currentUserBranch]);

  useEffect(() => {
    loadData();
  }, [page, filterStatus, filterStore]);

  const loadLookups = async () => {
    try {
      const [st, it, cats, mySt, userProfile] = await Promise.all([
        invStoreService.getAllActive(),
        invItemService.getAllActive(),
        invCategoryService.getAllActive().catch(() => []),
        invUserStoreService.getMyStores().catch(() => []),
        session?.user?.id ? userService.getUserById(session.user.id).catch(() => null) : null
      ]);
      setStores(st || []);
      setItems(it || []);
      setCategories(cats || []);

      const activeUserStores = (mySt || []).filter(s => s.isActive !== false && s.store);
      setMyStores(activeUserStores);

      const primary = activeUserStores.find(s => s.isPrimary)?.store || activeUserStores[0]?.store || null;
      setAssignedStore(primary);

      if (userProfile && userProfile.branchId) {
        const storeInBranch = (st || []).find(s => s.branch?.id === userProfile.branchId);
        setCurrentUserBranch({
          id: userProfile.branchId,
          branchCode: storeInBranch?.branch?.branchCode || "",
          branchName: userProfile.branchName || storeInBranch?.branch?.branchDescription || ""
        });
      }
    } catch {}
  };

  const loadWorkflowTemplate = async () => {
    try {
      const activeTemplates = await workflowService.getActiveTemplates();
      const prTemplate = (activeTemplates || []).find(t => t.documentType === "PURCHASE_REQUISITION");
      if (prTemplate && prTemplate.steps) {
        setTemplateSteps(prTemplate.steps);
      }
    } catch (e) {
      console.warn("Could not load workflow template steps:", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invPurchaseRequisitionService.getAll({
        page,
        size: 15,
        storeId: filterStore || undefined,
        status: filterStatus || undefined
      });
      const prList = data.content || [];
      setPrs(prList);
      setTotalPages(data.totalPages || 0);

      // Query workflow instances for PRs in parallel
      const instanceMap = {};
      await Promise.all(
        prList.map(async (pr) => {
          try {
            const inst = await workflowService.getInstanceByDocument("PURCHASE_REQUISITION", pr.id);
            if (inst && inst.id) {
              instanceMap[pr.id] = inst;
            }
          } catch (_) {}
        })
      );
      setWfInstances(instanceMap);
    } catch {
      toast.error("Failed to load purchase requisitions");
    }
    setLoading(false);
  };

  /* ── Line item management ── */
  const addLine = () => setForm({
    ...form,
    lines: [...form.lines, { categoryId: "", itemId: "", requestedQuantity: "", estimatedUnitCost: "", purpose: "" }]
  });
  const removeLine = (idx) => {
    const updatedLines = form.lines.filter((_, i) => i !== idx);
    setForm({ ...form, lines: updatedLines });
    if (formErrors.lines) {
      const updatedLineErrors = formErrors.lines.filter((_, i) => i !== idx);
      setFormErrors({ ...formErrors, lines: updatedLineErrors });
    }
  };
  const updateLine = (idx, field, value) => {
    const lines = [...form.lines];
    lines[idx][field] = value;
    setForm({ ...form, lines });

    if (formErrors.lines?.[idx]?.[field]) {
      const newErrors = { ...formErrors };
      if (newErrors.lines?.[idx]) {
        const lineErr = { ...newErrors.lines[idx] };
        delete lineErr[field];
        newErrors.lines[idx] = lineErr;
      }
      setFormErrors(newErrors);
    }
  };

  const handleItemSelect = (idx, selectedItem) => {
    const lines = [...form.lines];
    if (!selectedItem) {
      lines[idx].itemId = "";
      setForm({ ...form, lines });
      return;
    }
    lines[idx].itemId = String(selectedItem.id);
    const catId = selectedItem.category?.id ?? selectedItem.categoryId;
    if (catId) {
      lines[idx].categoryId = String(catId);
    }
    // Pre-fill estimated unit cost if empty or 0
    if ((!lines[idx].estimatedUnitCost || Number(lines[idx].estimatedUnitCost) === 0) && selectedItem.defaultUnitCost) {
      lines[idx].estimatedUnitCost = String(selectedItem.defaultUnitCost);
    }
    setForm({ ...form, lines });

    if (formErrors.lines?.[idx]?.itemId) {
      const newErrors = { ...formErrors };
      if (newErrors.lines?.[idx]) {
        const lineErr = { ...newErrors.lines[idx] };
        delete lineErr.itemId;
        newErrors.lines[idx] = lineErr;
      }
      setFormErrors(newErrors);
    }
  };

  const handleLineCategoryChange = (idx, newCatId) => {
    const lines = [...form.lines];
    lines[idx].categoryId = newCatId;
    // If current selected item does not belong to newCatId (and newCatId is not empty), clear item
    if (newCatId && lines[idx].itemId) {
      const currentItem = items.find(i => String(i.id) === String(lines[idx].itemId));
      const currentCatId = currentItem ? (currentItem.category?.id ?? currentItem.categoryId) : null;
      if (currentItem && String(currentCatId) !== String(newCatId)) {
        lines[idx].itemId = "";
      }
    }
    setForm({ ...form, lines });
  };

  /* ── Validation ── */
  const validateForm = () => {
    const errs = {};
    const effectiveStoreId = form.storeId || (assignedStore ? String(assignedStore.id) : "");
    if (!effectiveStoreId) {
      errs.storeId = "Please select a target receiving store";
    }
    if (!form.lines || form.lines.length === 0) {
      errs.general = "At least one item line is required";
    } else {
      const lineErrs = [];
      let hasLineErr = false;
      form.lines.forEach((line, idx) => {
        const lErr = {};
        if (!line.itemId) {
          lErr.itemId = "Item required";
          hasLineErr = true;
        }
        if (!line.requestedQuantity || Number(line.requestedQuantity) <= 0) {
          lErr.requestedQuantity = "Qty > 0 required";
          hasLineErr = true;
        }
        if (line.estimatedUnitCost === "" || line.estimatedUnitCost === null || Number(line.estimatedUnitCost) < 0) {
          lErr.estimatedUnitCost = "Cost ≥ 0 required";
          hasLineErr = true;
        }
        lineErrs[idx] = lErr;
      });
      if (hasLineErr) {
        errs.lines = lineErrs;
      }
    }
    setFormErrors(errs);
    return errs;
  };

  /* ── Creation ── */
  const openCreateModal = () => {
    let defaultStoreId = "";
    if (assignedStore) {
      defaultStoreId = String(assignedStore.id);
    } else if (currentUserBranch?.id) {
      const branchStores = stores.filter(s => s.branch?.id === currentUserBranch.id);
      if (branchStores.length > 0) {
        defaultStoreId = String(branchStores[0].id);
      }
    }

    setForm({
      storeId: defaultStoreId,
      remarks: "",
      lines: [{ categoryId: "", itemId: "", requestedQuantity: "", estimatedUnitCost: "", purpose: "" }]
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleCreate = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      const missing = [];
      if (errs.storeId) missing.push("Store");
      if (errs.general) missing.push("At least one line item");
      if (errs.lines) missing.push("Item selection, quantity > 0, and unit cost on lines");
      toast.error(`Please complete all mandatory fields: ${missing.join(", ")}`);
      return;
    }

    if (!isSuperAdmin && !assignedStore && !form.storeId) {
      toast.error("No store assigned to your account. Please configure at /ui/manager/invUserStore");
      return;
    }

    const validLines = form.lines.filter(l => l.itemId && l.requestedQuantity && Number(l.requestedQuantity) > 0);
    setSubmitting(true);
    try {
      await invPurchaseRequisitionService.create({
        storeId: Number(form.storeId || assignedStore?.id),
        remarks: form.remarks,
        lines: validLines.map(l => ({
          itemId: Number(l.itemId),
          requestedQuantity: l.requestedQuantity,
          estimatedUnitCost: l.estimatedUnitCost,
          purpose: l.purpose
        }))
      });
      toast.success("Requisition created successfully");
      setModalOpen(false);
      setForm({ storeId: "", remarks: "", lines: [{ categoryId: "", itemId: "", requestedQuantity: "", estimatedUnitCost: "", purpose: "" }] });
      setFormErrors({});
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Creation failed");
    }
    setSubmitting(false);
  };

  /* ── Workflow Actions (Submit, Approve, Reject) ── */
  const handleSubmitRequisition = async (id) => {
    setSubmitting(true);
    try {
      await invPurchaseRequisitionService.submit(id);
      toast.success("Submitted for approval");
      loadData();
      if (detailModal && detailModal.id === id) setDetailModal(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Submission failed");
    }
    setSubmitting(false);
  };

  const handleApprove = async () => {
    if (!approveModal) return;
    setSubmitting(true);
    try {
      const inst = wfInstances[approveModal.id];
      if (inst && inst.id) {
        // Approve via dynamic workflow engine
        await workflowService.approveStep(inst.id, approveComments || "Approved");
      } else {
        // Fallback to legacy
        await invPurchaseRequisitionService.approveL1(approveModal.id);
      }
      toast.success("Requisition step approved");
      setApproveModal(null);
      setApproveComments("");
      setDetailModal(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    }
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectErrors("Rejection reason is required");
      toast.error("Please provide a reason for rejecting this requisition");
      return;
    }
    setRejectErrors("");
    setSubmitting(true);
    try {
      const inst = wfInstances[rejectModal.id];
      if (inst && inst.id) {
        // Reject via dynamic workflow engine
        await workflowService.rejectStep(inst.id, rejectReason);
      } else {
        // Fallback to legacy
        await invPurchaseRequisitionService.reject(rejectModal.id, rejectReason);
      }
      toast.success("Requisition rejected");
      setRejectModal(null);
      setRejectReason("");
      setDetailModal(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Rejection failed");
    }
    setSubmitting(false);
  };

  const viewDetail = async (prId) => {
    try {
      const pr = await invPurchaseRequisitionService.getById(prId);
      // Ensure instance is loaded
      let inst = wfInstances[prId];
      if (!inst) {
        try {
          inst = await workflowService.getInstanceByDocument("PURCHASE_REQUISITION", prId);
          if (inst) setWfInstances(prev => ({ ...prev, [prId]: inst }));
        } catch (_) {}
      }
      setDetailModal(pr);
    } catch {
      toast.error("Failed to load details");
    }
  };

  /* ── Print Approved Purchase Requisition PDF ── */
  const handlePrintPdf = async (pr) => {
    try {
      setPrintingId(pr.id);
      const wfInstance = wfInstances[pr.id] || null;
      await generatePurchaseRequisitionPdf(pr, wfInstance);
      toast.success("Purchase Requisition PDF generated successfully");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF: " + (err.message || "Unknown error"));
    } finally {
      setPrintingId(null);
    }
  };

  /* ── Check if user can approve the current step ── */
  const canUserApprove = (prId) => {
    const inst = wfInstances[prId];
    if (isSuperAdmin) return true;
    if (inst && inst.status === "IN_PROGRESS" && inst.currentStep) {
      const reqRole = (inst.currentStep.approverRoleCode || "").toLowerCase();
      return normalizedRoles.includes(reqRole);
    }
    // Fallback: if no instance, check status
    const pr = prs.find(p => p.id === prId);
    if (pr?.status === "SUBMITTED") {
      return normalizedRoles.some(r => ["m_technical_manager", "m_branch_manager", "inv_manager"].includes(r));
    }
    if (pr?.status === "APPROVED_L1") {
      return normalizedRoles.some(r => ["m_finance_head", "fnc"].includes(r));
    }
    return false;
  };

  /* ── Get Pending Label ── */
  const getPendingLabel = (pr) => {
    const inst = wfInstances[pr.id];
    if (inst && inst.status === "IN_PROGRESS" && inst.currentStep) {
      return `${inst.currentStep.stepName} (${inst.currentStep.approverRoleCode})`;
    }
    if (pr.status === "DRAFT") return "Requester (Draft)";
    if (pr.status === "SUBMITTED") return "Dept. Manager";
    if (pr.status === "APPROVED_L1") return "Finance Manager";
    if (pr.status === "APPROVED_L2" || pr.status === "APPROVED") return "Purchase Officer (PO Ready)";
    if (pr.status === "CONVERTED_TO_PO") return "PO Created";
    return "";
  };

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-indigo-600" /> Purchase Requisitions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dynamic ERP Approval Workflow: Requisitions route through configured workflow steps
          </p>
        </div>
        {isRequester && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all font-medium"
          >
            <Plus className="w-4 h-4" /> New Requisition
          </button>
        )}
      </div>

      {/* ─── Top Stepper Overview ───────────────────────────── */}
      <ApprovalStepper
        status={filterStatus || "DRAFT"}
        templateSteps={templateSteps}
      />

      {/* ─── Filter Bar ────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterStore}
          onChange={(e) => { setFilterStore(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        >
          <option value="">{isMainOfficeOrAdmin ? "All Stores" : "All Branch Stores"}</option>
          {(isMainOfficeOrAdmin
            ? stores
            : (currentUserBranch?.id
                ? stores.filter(s => s.branch?.id === currentUserBranch.id)
                : (myStores.length > 0 ? myStores.map(ms => ms.store) : stores)
              )
          ).filter(Boolean).map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
        >
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      {/* ─── Requisitions Table ─────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">PR Number</th>
                <th className="px-5 py-3 text-left">Store</th>
                <th className="px-5 py-3 text-left">Requested By</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-right">Est. Amount</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Pending With</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading requisitions...</td></tr>
              ) : prs.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No requisitions found</td></tr>
              ) : (
                prs.map(pr => {
                  const inst = wfInstances[pr.id];
                  const canAct = (pr.status === "SUBMITTED" || pr.status === "APPROVED_L1") && canUserApprove(pr.id);

                  return (
                    <tr key={pr.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{pr.requisitionNumber}</td>
                      <td className="px-5 py-3 text-gray-700 dark:text-gray-300">{pr.store?.storeName || "—"}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{pr.requestedBy}</td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{pr.requestedDate}</td>
                      <td className="px-5 py-3 text-right font-mono font-medium">
                        ETB {Number(pr.totalEstimatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[pr.status] || "bg-gray-100"}`}>
                          {pr.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {pr.status !== "REJECTED" && pr.status !== "CONVERTED_TO_PO" && (
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            {getPendingLabel(pr)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => viewDetail(pr.id)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                            title="View Requisition & Workflow Trail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print PDF for Approved Requisitions */}
                          {(pr.status === "APPROVED" || pr.status === "APPROVED_L2" || pr.status === "CONVERTED_TO_PO") && (
                            <button
                              onClick={() => handlePrintPdf(pr)}
                              disabled={printingId === pr.id}
                              className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 disabled:opacity-50"
                              title="Print Approved Purchase Requisition PDF"
                            >
                              <Printer className={`w-4 h-4 ${printingId === pr.id ? "animate-spin" : ""}`} />
                            </button>
                          )}

                          {/* Convert to Purchase Order */}
                          {(pr.status === "APPROVED" || pr.status === "APPROVED_L2") && (
                            <button
                              onClick={() => router.push(`/ui/manager/invPurchaseOrders?convertPrId=${pr.id}`)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              title="Convert to Purchase Order"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Submit Draft */}
                          {pr.status === "DRAFT" && isRequester && (
                            <button
                              onClick={() => handleSubmitRequisition(pr.id)}
                              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
                              title="Submit for Approval"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Dynamic Step Approval / Rejection */}
                          {canAct && (
                            <>
                              <button
                                onClick={() => setApproveModal(pr)}
                                className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
                                title="Approve Current Step"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectModal(pr)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                                title="Reject Requisition"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Create Requisition Modal ──────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Purchase Requisition</h2>
                  <p className="text-xs text-gray-500">Create a material / goods requisition for approval</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Store <span className="text-red-500">*</span>
                    {assignedStore && !isSuperAdmin && (
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 ml-2 font-normal">
                        (Assigned Store)
                      </span>
                    )}
                  </label>
                  <select
                    value={form.storeId}
                    disabled={!isSuperAdmin && Boolean(assignedStore)}
                    onChange={(e) => {
                      setForm({ ...form, storeId: e.target.value });
                      if (formErrors.storeId) {
                        setFormErrors({ ...formErrors, storeId: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs transition-colors ${
                      !isSuperAdmin && Boolean(assignedStore) ? "opacity-75 cursor-not-allowed bg-gray-100 dark:bg-gray-800" : ""
                    } ${
                      formErrors.storeId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Store</option>
                    {(isMainOfficeOrAdmin
                      ? stores
                      : (currentUserBranch?.id
                          ? stores.filter(s => s.branch?.id === currentUserBranch.id)
                          : (myStores.length > 0 ? myStores.map(ms => ms.store) : stores)
                        )
                    ).filter(Boolean).map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
                  </select>
                  {!isSuperAdmin && !assignedStore && !currentUserBranch?.id && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> No store or branch assigned to your account.
                    </p>
                  )}
                  {formErrors.storeId && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.storeId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
                  <input
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    placeholder="Optional purpose / remarks"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-xs"
                  />
                </div>
              </div>

              {formErrors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              {/* Line Items Header & Cost Summary */}
              {(() => {
                const totalEstimatedRequisition = form.lines.reduce((sum, l) => {
                  const q = Number(l.requestedQuantity) || 0;
                  const c = Number(l.estimatedUnitCost) || 0;
                  return sum + (q * c);
                }, 0);

                return (
                  <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <Package className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Line Items ({form.lines.length})
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Filter by category or search directly by item code / name
                        </p>
                      </div>
                      {totalEstimatedRequisition > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-3 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Est. Total:</span>
                          <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">
                            ETB {totalEstimatedRequisition.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {form.lines.map((line, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50/70 dark:bg-gray-700/30 rounded-xl p-3.5 border border-gray-200 dark:border-gray-700/60 space-y-2.5 transition-all shadow-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                                {idx + 1}
                              </span>
                              Line Item #{idx + 1}
                            </span>
                            {form.lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors flex items-center gap-1 text-xs"
                                title="Remove Line"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                            {/* Item Category Filter */}
                            <div className="md:col-span-3">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                                <Tag className="w-3 h-3 text-indigo-500" /> Category
                              </label>
                              <select
                                value={line.categoryId || ""}
                                onChange={(e) => handleLineCategoryChange(idx, e.target.value)}
                                className="w-full px-2.5 py-2 text-xs border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-xs"
                              >
                                <option value="">All Categories ({items.length})</option>
                                {categories.map((c) => {
                                  const count = items.filter(i => (i.category?.id ?? i.categoryId) === c.id).length;
                                  return (
                                    <option key={c.id} value={c.id}>
                                      {c.categoryName} {count > 0 ? `(${count})` : ""}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>

                            {/* Searchable Item Selection */}
                            <div className="md:col-span-5">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                  <Package className="w-3 h-3 text-indigo-500" /> Item <span className="text-red-500">*</span>
                                </span>
                                {line.itemId && (
                                  <span className="text-[10px] text-gray-500">
                                    {items.find(i => String(i.id) === String(line.itemId))?.unitOfMeasure?.unitCode
                                      ? `Unit: ${items.find(i => String(i.id) === String(line.itemId))?.unitOfMeasure?.unitCode}`
                                      : ""}
                                  </span>
                                )}
                              </label>
                              <SearchableItemSelect
                                items={items}
                                categories={categories}
                                selectedItemId={line.itemId}
                                lineCategoryId={line.categoryId}
                                onSelect={(item) => handleItemSelect(idx, item)}
                                onCategoryFilterChange={(catId) => handleLineCategoryChange(idx, catId)}
                                hasError={Boolean(formErrors.lines?.[idx]?.itemId)}
                              />
                              {formErrors.lines?.[idx]?.itemId && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {formErrors.lines[idx].itemId}
                                </p>
                              )}
                            </div>

                            {/* Quantity */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Qty <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={line.requestedQuantity}
                                onChange={(e) => updateLine(idx, "requestedQuantity", e.target.value)}
                                placeholder="0"
                                className={`w-full px-2.5 py-2 text-xs border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-right shadow-xs transition-colors ${
                                  formErrors.lines?.[idx]?.requestedQuantity
                                    ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                }`}
                              />
                              {formErrors.lines?.[idx]?.requestedQuantity && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {formErrors.lines[idx].requestedQuantity}
                                </p>
                              )}
                            </div>

                            {/* Estimated Unit Cost */}
                            <div className="md:col-span-2">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Est. Cost <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={line.estimatedUnitCost}
                                onChange={(e) => updateLine(idx, "estimatedUnitCost", e.target.value)}
                                placeholder="0.00"
                                className={`w-full px-2.5 py-2 text-xs border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-right shadow-xs transition-colors ${
                                  formErrors.lines?.[idx]?.estimatedUnitCost
                                    ? "border-red-500 ring-1 ring-red-500 bg-red-50/20"
                                    : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                }`}
                              />
                              {formErrors.lines?.[idx]?.estimatedUnitCost && (
                                <p className="text-[11px] text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> {formErrors.lines[idx].estimatedUnitCost}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Purpose / Remarks for line */}
                          <div>
                            <input
                              value={line.purpose}
                              onChange={(e) => updateLine(idx, "purpose", e.target.value)}
                              placeholder="Usage purpose / remarks for this item (optional)"
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addLine}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors border border-indigo-200/50 dark:border-indigo-800/50"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Another Item Line
                    </button>
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 sticky bottom-0">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md font-medium disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? "Creating..." : "Create Requisition"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal with Stepper & Chronological Audit Trail ─ */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-mono">{detailModal.requisitionNumber}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>
                  {detailModal.status?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(detailModal.status === "APPROVED" || detailModal.status === "APPROVED_L2" || detailModal.status === "CONVERTED_TO_PO") && (
                  <button
                    onClick={() => handlePrintPdf(detailModal)}
                    disabled={printingId === detailModal.id}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-200 dark:border-purple-700 disabled:opacity-50"
                    title="Print PDF Note"
                  >
                    <Printer className={`w-3.5 h-3.5 ${printingId === detailModal.id ? "animate-spin" : ""}`} />
                    {printingId === detailModal.id ? "Preparing PDF..." : "Print PDF"}
                  </button>
                )}
                <button onClick={() => setDetailModal(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Dynamic Stepper */}
              <ApprovalStepper
                status={detailModal.status}
                templateSteps={templateSteps}
                currentStep={wfInstances[detailModal.id]?.currentStep}
                rejectionReason={detailModal.rejectionReason}
              />

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl">
                <div>
                  <span className="text-gray-500 text-xs block">Store</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{detailModal.store?.storeName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Requested By</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{detailModal.requestedBy}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Date</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{detailModal.requestedDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Total Amount</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                    ETB {Number(detailModal.totalEstimatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Chronological Workflow Audit Trail */}
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" /> Workflow Approval Audit Trail
                </h4>

                {wfInstances[detailModal.id]?.actions && wfInstances[detailModal.id]?.actions.length > 0 ? (
                  <div className="space-y-2">
                    {wfInstances[detailModal.id].actions.map((act, i) => (
                      <div key={i} className="flex items-start justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 dark:text-gray-200">{act.step?.stepName || `Step ${act.step?.stepOrder || i + 1}`}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              act.action === "APPROVED" ? "bg-green-100 text-green-700" :
                              act.action === "REJECTED" ? "bg-red-100 text-red-700" :
                              "bg-amber-100 text-amber-700"
                            }`}>
                              {act.action}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            By <strong className="text-gray-800 dark:text-gray-200">{act.actedBy}</strong>
                            {act.comments && <span className="ml-1 italic text-gray-500">— &ldquo;{act.comments}&rdquo;</span>}
                          </p>
                        </div>
                        <span className="text-gray-400 font-mono text-[11px] whitespace-nowrap">
                          {act.actedAt ? new Date(act.actedAt).toLocaleString() : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">
                    {detailModal.status === "DRAFT" ? "Requisition has not been submitted yet." : "No approval actions recorded yet."}
                  </div>
                )}

                {detailModal.rejectionReason && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mt-2 pt-2 border-t border-red-200 dark:border-red-800 text-xs">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Rejection Reason: <strong>{detailModal.rejectionReason}</strong></span>
                  </div>
                )}
              </div>

              {/* Line items table */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Requested Line Items</h4>
                <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Est. Unit Cost</th>
                      <th className="px-4 py-2 text-right">Estimated Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(detailModal.lines || []).map((l, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{l.item?.itemName || l.item?.itemCode}</td>
                        <td className="px-4 py-2 text-right font-mono">{l.requestedQuantity}</td>
                        <td className="px-4 py-2 text-right font-mono">ETB {Number(l.estimatedUnitCost).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold">ETB {Number(l.estimatedTotal).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-right font-semibold">Total Estimated Amount:</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-indigo-600">
                        ETB {Number(detailModal.totalEstimatedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <div className="text-xs text-gray-500">
                {detailModal.status === "SUBMITTED" && `Pending Step: ${getPendingLabel(detailModal)}`}
                {(detailModal.status === "APPROVED" || detailModal.status === "APPROVED_L2") && "Fully Approved — Ready for Purchase Order"}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                  Close
                </button>

                {/* Print PDF for Approved Requisitions */}
                {(detailModal.status === "APPROVED" || detailModal.status === "APPROVED_L2" || detailModal.status === "CONVERTED_TO_PO") && (
                  <button
                    onClick={() => handlePrintPdf(detailModal)}
                    disabled={printingId === detailModal.id}
                    className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2 font-medium disabled:opacity-50"
                  >
                    <Printer className={`w-4 h-4 ${printingId === detailModal.id ? "animate-spin" : ""}`} />
                    {printingId === detailModal.id ? "Generating PDF..." : "Print Requisition PDF"}
                  </button>
                )}

                {/* Convert to PO */}
                {(detailModal.status === "APPROVED" || detailModal.status === "APPROVED_L2") && (
                  <button
                    onClick={() => router.push(`/ui/manager/invPurchaseOrders?convertPrId=${detailModal.id}`)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2 font-medium"
                  >
                    <FileCheck className="w-4 h-4" /> Convert to PO
                  </button>
                )}

                {/* Requester submits draft */}
                {detailModal.status === "DRAFT" && isRequester && (
                  <button
                    onClick={() => handleSubmitRequisition(detailModal.id)}
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit Requisition
                  </button>
                )}

                {/* Step Approver actions */}
                {(detailModal.status === "SUBMITTED" || detailModal.status === "APPROVED_L1") && canUserApprove(detailModal.id) && (
                  <>
                    <button
                      onClick={() => setRejectModal(detailModal)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setApproveModal(detailModal)}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Approve Step
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Approval Modal with Remarks ─────────────────────── */}
      {approveModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
              <h2 className="text-lg font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
                <Check className="w-5 h-5" /> Approve {approveModal.requisitionNumber}
              </h2>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {wfInstances[approveModal.id]?.currentStep?.stepName || "Approve Requisition Step"}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg text-xs space-y-1">
                <p><span className="text-gray-500">Store:</span> <strong>{approveModal.store?.storeName}</strong></p>
                <p><span className="text-gray-500">Total Amount:</span> <strong>ETB {Number(approveModal.totalEstimatedAmount || 0).toLocaleString()}</strong></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Approval Comments (Optional)
                </label>
                <textarea
                  value={approveComments}
                  onChange={(e) => setApproveComments(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none shadow-sm"
                  placeholder="e.g. Approved. Requirements verified against inventory store."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => { setApproveModal(null); setApproveComments(""); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md font-medium disabled:opacity-50"
              >
                {submitting ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal with Mandatory Reason ──────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
              <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject {rejectModal.requisitionNumber}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectErrors) setRejectErrors("");
                  }}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none shadow-sm transition-colors ${
                    rejectErrors ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Explain why this requisition is being rejected..."
                />
                {rejectErrors && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {rejectErrors}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); setRejectErrors(""); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {submitting ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

