"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import invTransferService from "../../../lib/invTransferService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import invStockQueryService from "../../../lib/invStockService";
import workflowService from "../../../lib/workflowService";
import invUserStoreService from "../../../lib/invUserStoreService";
import { UserAccountService } from "../../../lib/userAccountService";
import { generateTransferPdf } from "./transferPdf";

const userService = new UserAccountService();
import {
  ArrowLeftRight,
  Plus,
  X,
  Eye,
  Check,
  XCircle,
  Send,
  Truck,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CircleDot,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  Printer,
  AlertTriangle,
  Store,
  FileText,
  CheckCircle2,
  ArrowRight,
  Search,
  RefreshCw,
  Layers,
  Sparkles,
} from "lucide-react";

/* ─── Status Badge Colors ────────────────────────────────────────── */
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
  SUBMITTED: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  APPROVED: "bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800",
  IN_TRANSIT: "bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
  RECEIVED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
  CANCELLED: "bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800",
};

/* ─── Dynamic Configurable Stepper Component ─────────────────────── */
function TransferStepper({
  status,
  templateSteps = [],
  currentStep = null,
  remarks = "",
  fromStore = null,
  toStore = null,
}) {
  const isCancelled = status === "CANCELLED";
  const isDraft = status === "DRAFT";
  const isApproved = status === "APPROVED";
  const isInTransit = status === "IN_TRANSIT";
  const isReceived = status === "RECEIVED";

  // Effective approval steps from template or fallback standard
  const effectiveSteps = templateSteps.length > 0 ? templateSteps : [
    { stepOrder: 1, stepName: "Store Manager Approval", approverRoleCode: "M_STORE_MANAGER" },
    { stepOrder: 2, stepName: "Operations Review", approverRoleCode: "M_TECHNICAL_MANAGER" },
  ];

  const steps = [
    { key: "DRAFT", label: "Transfer Created", role: "Requester" },
    ...effectiveSteps.map((s) => ({
      key: `STEP_${s.stepOrder}`,
      label: s.stepName,
      labelAm: s.stepNameAm,
      role: s.approverRoleCode,
      stepOrder: s.stepOrder,
    })),
    {
      key: "DISPATCH",
      label: "Dispatched / In-Transit",
      role: fromStore?.storeName ? `Source: ${fromStore.storeName}` : "Source Storekeeper",
    },
    {
      key: "RECEIVE",
      label: "Goods Received",
      role: toStore?.storeName ? `Dest: ${toStore.storeName}` : "Destination Storekeeper",
    },
  ];

  // Calculate current active step index
  let activeIdx = 0;
  if (isDraft) {
    activeIdx = 0;
  } else if (isReceived) {
    activeIdx = steps.length - 1;
  } else if (isInTransit) {
    activeIdx = steps.length - 2;
  } else if (isApproved) {
    activeIdx = steps.length - 2;
  } else if (currentStep) {
    const idx = steps.findIndex((s) => s.stepOrder === currentStep.stepOrder);
    activeIdx = idx >= 0 ? idx : 1;
  } else {
    activeIdx = 1;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between overflow-x-auto py-1">
        {steps.map((step, i) => {
          const isDone = !isCancelled && (isReceived || (isInTransit && i <= steps.length - 2) || (isApproved && i <= steps.length - 3) || activeIdx > i);
          const isCurrent = !isCancelled && !isReceived && activeIdx === i;

          return (
            <div key={step.key} className="flex items-center flex-1 min-w-[130px] last:flex-none">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-emerald-900/30"
                      : isCurrent
                      ? "bg-indigo-600 text-white shadow-md ring-4 ring-indigo-100 dark:ring-indigo-900/40"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : isCurrent ? <CircleDot className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                    isDone
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : isCurrent
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                {step.role && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono mt-0.5 max-w-[120px] truncate">
                    {step.role}
                  </span>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-300 ${
                    isDone ? "bg-emerald-400 dark:bg-emerald-600" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {isCancelled && (
        <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 text-sm font-medium border border-red-200 dark:border-red-800">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          <span>Transfer Cancelled / Rejected: {remarks || "Approval or execution was declined."}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Stock Transfer Page ───────────────────────────────────── */
export default function InvTransfersPage() {
  const { data: session } = useSession();
  const rawRoles = session?.user?.roles || session?.roles || [];
  const userRoles = Array.isArray(rawRoles) ? rawRoles : [];
  const username = session?.user?.name || session?.user?.username || "system";

  // Role permissions
  const normalizedRoles = userRoles.map((r) => String(r || "").replace(/^ROLE_/i, "").toLowerCase());
  const isSuperAdmin = normalizedRoles.some((r) =>
    ["billzgjt", "systemadmin", "admin"].includes(r)
  );
  const isStoreManager = isSuperAdmin || normalizedRoles.some((r) =>
    ["m_store_manager", "inv_manager", "m_technical_manager"].includes(r)
  );
  const isStorekeeper = isSuperAdmin || normalizedRoles.some((r) =>
    ["inv_storekeeper", "m_branch_store", "storekeeper"].includes(r)
  );

  // Data states
  const [transfers, setTransfers] = useState([]);
  const [wfInstances, setWfInstances] = useState({}); // transferId -> WfWorkflowInstance
  const [templateSteps, setTemplateSteps] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [myStores, setMyStores] = useState([]);
  const [assignedStore, setAssignedStore] = useState(null);
  const [currentUserBranch, setCurrentUserBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Branch & Admin flags
  const isMainOffice = currentUserBranch?.branchCode?.toUpperCase() === "MO" ||
    (currentUserBranch?.branchName && currentUserBranch.branchName.toLowerCase().includes("main"));
  const isMainOfficeOrAdmin = isSuperAdmin || isMainOffice;

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFromStore, setFilterFromStore] = useState("");
  const [filterToStore, setFilterToStore] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Live Stock Cache for Create Transfer: `${storeId}_${itemId}` -> { onHand, reserved, available, loading }
  const [stockCache, setStockCache] = useState({});

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null); // transfer item
  const [approveComments, setApproveComments] = useState("");
  const [approveLines, setApproveLines] = useState([]);
  const [approveErrors, setApproveErrors] = useState({});
  const [rejectModal, setRejectModal] = useState(null); // transfer item
  const [rejectReason, setRejectReason] = useState("");
  const [rejectErrors, setRejectErrors] = useState("");
  const [shipModal, setShipModal] = useState(null); // transfer item
  const [shipForm, setShipForm] = useState({ waybillNumber: "", vehiclePlate: "", driverName: "" });
  const [shipErrors, setShipErrors] = useState({});
  const [receiveModal, setReceiveModal] = useState(null); // transfer item
  const [receiveLines, setReceiveLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  // Create Form State
  const [form, setForm] = useState({
    fromStoreId: "",
    toStoreId: "",
    remarks: "",
    lines: [{ itemId: "", quantity: "" }],
  });
  const [formErrors, setFormErrors] = useState({});

  // Initial load
  useEffect(() => {
    loadLookups();
    loadWorkflowTemplate();
  }, []);

  useEffect(() => {
    if (session?.user?.id && !currentUserBranch) {
      userService
        .getUserById(session.user.id)
        .then((userProfile) => {
          if (userProfile && userProfile.branchId) {
            const storeInBranch = stores.find((s) => s.branch?.id === userProfile.branchId);
            setCurrentUserBranch({
              id: userProfile.branchId,
              branchCode: storeInBranch?.branch?.branchCode || "",
              branchName: userProfile.branchName || storeInBranch?.branch?.branchDescription || "",
            });
          }
        })
        .catch(() => {});
    }
  }, [session?.user?.id, stores, currentUserBranch]);

  useEffect(() => {
    loadData();
  }, [page, filterStatus]);

  const loadLookups = async () => {
    try {
      const [sList, iList, mySt, userProfile] = await Promise.all([
        invStoreService.getAllActive(),
        invItemService.getAllActive(),
        invUserStoreService.getMyStores().catch(() => []),
        session?.user?.id ? userService.getUserById(session.user.id).catch(() => null) : null,
      ]);
      setStores(sList || []);
      setItems(iList || []);

      const activeUserStores = (mySt || []).filter((s) => s.isActive !== false && s.store);
      setMyStores(activeUserStores);
      const primary = activeUserStores.find((s) => s.isPrimary)?.store || activeUserStores[0]?.store || null;
      setAssignedStore(primary);

      if (userProfile && userProfile.branchId) {
        const storeInBranch = (sList || []).find((s) => s.branch?.id === userProfile.branchId);
        setCurrentUserBranch({
          id: userProfile.branchId,
          branchCode: storeInBranch?.branch?.branchCode || "",
          branchName: userProfile.branchName || storeInBranch?.branch?.branchDescription || "",
        });
      }
    } catch (e) {
      console.warn("Could not load lookups:", e);
    }
  };

  /* ── Custody & Step Authorization Helpers ── */
  // Checks if the logged-in user is an authorized custodian for a given store
  const isUserAuthorizedForStore = useCallback(
    (store) => {
      if (!store || !store.id) return false;
      if (isSuperAdmin) return true;

      const uid = session?.user?.id;
      const uname = (session?.user?.name || session?.user?.username || "").toLowerCase();

      // 1. Direct Store Keeper on store record
      if (store.storeKeeper) {
        if (uid && String(store.storeKeeper.id) === String(uid)) return true;
        if (uname && store.storeKeeper.userName && store.storeKeeper.userName.toLowerCase() === uname) return true;
      }

      // 2. Direct Manager on store record
      if (store.manager) {
        if (uid && String(store.manager.id) === String(uid)) return true;
        if (uname && store.manager.userName && store.manager.userName.toLowerCase() === uname) return true;
      }

      // 3. User store assignment match via inv_store_user (myStores)
      if (myStores && myStores.length > 0) {
        const isAssigned = myStores.some(
          (ms) => ms.store && String(ms.store.id) === String(store.id) && ms.isActive !== false
        );
        if (isAssigned) return true;
      }

      return false;
    },
    [isSuperAdmin, session?.user?.id, session?.user?.name, session?.user?.username, myStores]
  );

  // Check if user is authorized to approve/reject the active workflow step
  const canUserApproveStep = useCallback(
    (transfer) => {
      if (!transfer || transfer.status !== "SUBMITTED") return false;
      if (isSuperAdmin) return true;

      const inst = wfInstances[transfer.id];
      if (inst && inst.status === "IN_PROGRESS" && inst.currentStep) {
        const requiredRole = (inst.currentStep.approverRoleCode || "").toLowerCase().replace(/^role_/i, "");
        return normalizedRoles.includes(requiredRole);
      }
      // Fallback when no workflow instance or step
      return isStoreManager;
    },
    [isSuperAdmin, wfInstances, normalizedRoles, isStoreManager]
  );

  // Check if user can dispatch / ship from source store
  const canUserShip = useCallback(
    (transfer) => {
      if (!transfer || transfer.status !== "APPROVED") return false;
      return isSuperAdmin || isUserAuthorizedForStore(transfer.fromStore);
    },
    [isSuperAdmin, isUserAuthorizedForStore]
  );

  // Check if user can accept and receive into destination store
  const canUserReceive = useCallback(
    (transfer) => {
      if (!transfer || transfer.status !== "IN_TRANSIT") return false;
      return isSuperAdmin || isUserAuthorizedForStore(transfer.toStore);
    },
    [isSuperAdmin, isUserAuthorizedForStore]
  );

  const isAuthorizedCreator =
    isSuperAdmin ||
    isStoreManager ||
    isStorekeeper ||
    (myStores && myStores.length > 0) ||
    normalizedRoles.some((r) => ["m_branch_store", "inv_storekeeper", "m_gebi_officer", "inv_manager"].includes(r));

  const loadWorkflowTemplate = async () => {
    try {
      const activeTemplates = await workflowService.getActiveTemplates();
      const stTemplate = (activeTemplates || []).find((t) => t.documentType === "STOCK_TRANSFER");
      if (stTemplate && stTemplate.steps) {
        setTemplateSteps(stTemplate.steps);
      }
    } catch (e) {
      console.warn("Could not load workflow template steps:", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invTransferService.getAll({
        page,
        size: 15,
        status: filterStatus || undefined,
      });
      const list = data.content || [];
      setTransfers(list);
      setTotalPages(data.totalPages || 0);

      // Query workflow instances for active/in-progress transfers
      const instanceMap = {};
      await Promise.all(
        list.map(async (t) => {
          try {
            const inst = await workflowService.getInstanceByDocument("STOCK_TRANSFER", t.id);
            if (inst && inst.id) {
              instanceMap[t.id] = inst;
            }
          } catch (_) {}
        })
      );
      setWfInstances(instanceMap);
    } catch {
      toast.error("Failed to load transfers");
    }
    setLoading(false);
  };

  /* ── Live Stock Check Helper ──────────────────────────────────── */
  const fetchItemStock = useCallback(
    async (itemId, storeId, force = false) => {
      if (!itemId || !storeId) return null;
      const key = `${storeId}_${itemId}`;
      if (!force && stockCache[key] && !stockCache[key].loading) {
        return stockCache[key];
      }

      setStockCache((prev) => ({
        ...prev,
        [key]: { onHand: 0, reserved: 0, available: 0, loading: true },
      }));

      try {
        const res = await invStockQueryService.getItemStock(itemId, storeId);
        const data = res || {};
        const onHand = Number(data.quantityOnHand || 0);
        const reserved = Number(data.quantityReserved || 0);
        const available = Math.max(0, onHand - reserved);

        const stockInfo = { onHand, reserved, available, loading: false };
        setStockCache((prev) => ({ ...prev, [key]: stockInfo }));
        return stockInfo;
      } catch {
        const fallback = { onHand: 0, reserved: 0, available: 0, loading: false, notFound: true };
        setStockCache((prev) => ({ ...prev, [key]: fallback }));
        return fallback;
      }
    },
    [stockCache]
  );

  // When fromStoreId changes, refresh stock for all lines
  const handleFromStoreChange = (newStoreId) => {
    setForm((prev) => ({ ...prev, fromStoreId: newStoreId }));
    if (newStoreId) {
      form.lines.forEach((l) => {
        if (l.itemId) {
          fetchItemStock(l.itemId, newStoreId);
        }
      });
    }
    if (formErrors.fromStoreId) {
      setFormErrors((prev) => ({ ...prev, fromStoreId: "" }));
    }
  };

  /* ── Line item management ─────────────────────────────────────── */
  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [...prev.lines, { itemId: "", quantity: "" }],
    }));
  };

  const removeLine = (idx) => {
    setForm((prev) => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx),
    }));
    if (formErrors.lines && Array.isArray(formErrors.lines)) {
      setFormErrors((prev) => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== idx),
      }));
    }
  };

  const updateLine = (idx, field, value) => {
    const updated = [...form.lines];
    updated[idx][field] = value;
    setForm((prev) => ({ ...prev, lines: updated }));

    if (field === "itemId" && value && form.fromStoreId) {
      fetchItemStock(value, form.fromStoreId);
    }

    // Clear line error on change
    if (formErrors.lines?.[idx]?.[field]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        if (copy.lines?.[idx]) {
          const lineCopy = { ...copy.lines[idx] };
          delete lineCopy[field];
          copy.lines[idx] = lineCopy;
        }
        return copy;
      });
    }
  };

  /* ── Form Validation ──────────────────────────────────────────── */
  const validateCreateForm = () => {
    const errors = {};
    const lineErrors = [];

    if (!form.fromStoreId) {
      errors.fromStoreId = "Source Store is required.";
    }
    if (!form.toStoreId) {
      errors.toStoreId = "Destination Store is required.";
    }
    if (form.fromStoreId && form.toStoreId && form.fromStoreId === form.toStoreId) {
      errors.toStoreId = "Destination store must be different from source store.";
    }

    let hasValidLine = false;
    form.lines.forEach((l, idx) => {
      const itemErr = {};
      if (!l.itemId) {
        itemErr.itemId = "Select an item";
      }
      const qty = Number(l.quantity);
      if (!l.quantity || isNaN(qty) || qty <= 0) {
        itemErr.quantity = "Enter a quantity > 0";
      } else if (l.itemId && form.fromStoreId) {
        const key = `${form.fromStoreId}_${l.itemId}`;
        const stock = stockCache[key];
        if (stock && !stock.loading && qty > stock.available) {
          itemErr.quantity = `Exceeds available stock (max: ${stock.available})`;
        }
      }

      if (Object.keys(itemErr).length > 0) {
        lineErrors[idx] = itemErr;
      } else {
        hasValidLine = true;
      }
    });

    if (form.lines.length === 0 || !hasValidLine) {
      errors.general = "At least one valid item with positive quantity is required.";
    }
    if (lineErrors.some((e) => e && Object.keys(e).length > 0)) {
      errors.lines = lineErrors;
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error(errors.fromStoreId || errors.toStoreId || errors.general || "Please fix mandatory form inputs highlighted in red.");
      return false;
    }
    return true;
  };

  /* ── Create Transfer Handler ──────────────────────────────────── */
  const handleCreate = async () => {
    if (!validateCreateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        fromStoreId: Number(form.fromStoreId),
        toStoreId: Number(form.toStoreId),
        remarks: form.remarks ? form.remarks.trim() : "Inter-store transfer",
        lines: form.lines
          .filter((l) => l.itemId && Number(l.quantity) > 0)
          .map((l) => ({
            itemId: Number(l.itemId),
            quantity: Number(l.quantity),
          })),
      };

      const res = await invTransferService.create(payload);
      toast.success(`Transfer ${res.transferNumber || "created"} successfully in DRAFT state.`);
      setCreateModalOpen(false);
      setForm({
        fromStoreId: "",
        toStoreId: "",
        remarks: "",
        lines: [{ itemId: "", quantity: "" }],
      });
      setFormErrors({});
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create transfer");
    }
    setSubmitting(false);
  };

  /* ── Submit Transfer to Workflow Engine ───────────────────────── */
  const handleSubmit = async (transfer) => {
    setSubmitting(true);
    try {
      await invTransferService.submit(transfer.id);
      toast.success(`Transfer ${transfer.transferNumber} submitted for workflow approvals!`);
      loadData();
      if (detailModal?.id === transfer.id) {
        const full = await invTransferService.getById(transfer.id);
        setDetailModal(full);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit transfer");
    }
    setSubmitting(false);
  };

  /* ── Open Approve Modal with Line Adjustment & Stock Checks ──── */
  const handleOpenApproveModal = async (transfer) => {
    if (!canUserApproveStep(transfer)) {
      toast.error("You are not authorized to approve the current step for this transfer.");
      return;
    }

    let full = transfer;
    if (!transfer.lines || transfer.lines.length === 0) {
      try {
        full = await invTransferService.getById(transfer.id);
      } catch (e) {
        console.error("Failed to load transfer lines:", e);
      }
    }

    setApproveModal(full);
    setApproveComments("");
    setApproveErrors({});

    const linesData = (full.lines || []).map((l) => ({
      id: l.id,
      itemId: l.item?.id || l.itemId,
      item: l.item,
      originalQuantity: Number(l.quantity || 0),
      approvedQuantity: Number(l.quantity || 0),
      unitCost: Number(l.unitCost || 0),
    }));
    setApproveLines(linesData);

    const fromStoreId = full.fromStore?.id;
    if (fromStoreId) {
      linesData.forEach((l) => {
        if (l.itemId) {
          fetchItemStock(l.itemId, fromStoreId, true);
        }
      });
    }
  };

  const handleApproveLineQuantityChange = (idx, value) => {
    const updated = [...approveLines];
    updated[idx] = { ...updated[idx], approvedQuantity: value };
    setApproveLines(updated);

    if (approveErrors[idx]) {
      setApproveErrors((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    }
  };

  /* ── Workflow Step Approval ───────────────────────────────────── */
  const handleApproveConfirm = async () => {
    if (!approveModal) return;
    if (!canUserApproveStep(approveModal)) {
      toast.error("You are not authorized to approve the current step for this transfer.");
      return;
    }

    // Real-time stock validation against source store
    const fromStoreId = approveModal.fromStore?.id;
    const errors = {};
    let hasError = false;

    approveLines.forEach((l, idx) => {
      const qty = Number(l.approvedQuantity);
      if (l.approvedQuantity === "" || l.approvedQuantity === null || isNaN(qty) || qty <= 0) {
        errors[idx] = "Enter a valid quantity > 0";
        hasError = true;
      } else if (fromStoreId && l.itemId) {
        const stockKey = `${fromStoreId}_${l.itemId}`;
        const stock = stockCache[stockKey];
        if (stock && !stock.loading && qty > stock.available) {
          errors[idx] = `Exceeds source stock (max: ${stock.available})`;
          hasError = true;
        }
      }
    });

    if (hasError) {
      setApproveErrors(errors);
      toast.error("Please correct invalid quantities or lines exceeding source warehouse stock.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. If any line quantities were modified, persist them to the backend first
      const hasChanges = approveLines.some(
        (l) => Number(l.approvedQuantity) !== Number(l.originalQuantity)
      );

      const payloadLines = approveLines.map((l) => ({
        id: l.id,
        itemId: l.itemId,
        quantity: Number(l.approvedQuantity),
      }));

      if (hasChanges) {
        await invTransferService.updateLines(approveModal.id, payloadLines);
      }

      // 2. Complete workflow step approval or fallback direct approval
      const inst = wfInstances[approveModal.id];
      if (inst && inst.id && inst.status === "IN_PROGRESS") {
        await workflowService.approveStep(inst.id, approveComments || "Approved");
      } else {
        await invTransferService.approve(approveModal.id, { lines: payloadLines });
      }

      toast.success(`Transfer ${approveModal.transferNumber} step approved!`);
      setApproveModal(null);
      setApproveComments("");
      setApproveLines([]);
      setApproveErrors({});
      loadData();

      if (detailModal?.id === approveModal.id) {
        const full = await invTransferService.getById(approveModal.id);
        setDetailModal(full);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    }
    setSubmitting(false);
  };

  /* ── Workflow Step Rejection ──────────────────────────────────── */
  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    if (!canUserApproveStep(rejectModal)) {
      toast.error("You are not authorized to reject the current step for this transfer.");
      return;
    }
    if (!rejectReason || !rejectReason.trim()) {
      setRejectErrors("Rejection reason is mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      const inst = wfInstances[rejectModal.id];
      if (inst && inst.id && inst.status === "IN_PROGRESS") {
        await workflowService.rejectStep(inst.id, rejectReason.trim());
      } else {
        await invTransferService.reject(rejectModal.id, rejectReason.trim());
      }
      toast.info(`Transfer ${rejectModal.transferNumber} was rejected.`);
      setRejectModal(null);
      setRejectReason("");
      setRejectErrors("");
      loadData();
      if (detailModal?.id === rejectModal.id) {
        const full = await invTransferService.getById(rejectModal.id);
        setDetailModal(full);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Rejection failed");
    }
    setSubmitting(false);
  };

  /* ── Dispatch / Ship Handler ──────────────────────────────────── */
  const handleOpenShipModal = (transfer) => {
    if (!canUserShip(transfer)) {
      toast.error("You are not authorized to dispatch stock from the source warehouse.");
      return;
    }
    setShipModal(transfer);
    setShipForm({
      waybillNumber: transfer.waybillNumber || "",
      vehiclePlate: transfer.vehiclePlate || "",
      driverName: transfer.driverName || "",
    });
    setShipErrors({});
  };

  const handleShipConfirm = async () => {
    if (!shipModal) return;
    if (!canUserShip(shipModal)) {
      toast.error("You are not authorized to dispatch stock from the source warehouse.");
      return;
    }

    const errors = {};
    if (!shipForm.vehiclePlate.trim()) errors.vehiclePlate = "Vehicle plate number is required.";
    if (!shipForm.driverName.trim()) errors.driverName = "Driver name is required.";

    if (Object.keys(errors).length > 0) {
      setShipErrors(errors);
      toast.error("Please fill in required transport details.");
      return;
    }

    setSubmitting(true);
    try {
      await invTransferService.ship(shipModal.id, {
        waybillNumber: shipForm.waybillNumber.trim(),
        vehiclePlate: shipForm.vehiclePlate.trim(),
        driverName: shipForm.driverName.trim(),
      });
      toast.success(`Transfer ${shipModal.transferNumber} dispatched! Stock deducted from source warehouse.`);
      setShipModal(null);
      loadData();
      if (detailModal?.id === shipModal.id) {
        const full = await invTransferService.getById(shipModal.id);
        setDetailModal(full);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Dispatch failed");
    }
    setSubmitting(false);
  };

  /* ── Receive Goods Handler ────────────────────────────────────── */
  const handleOpenReceiveModal = (transfer) => {
    if (!canUserReceive(transfer)) {
      toast.error("Only the destination store owner or assigned storekeeper may confirm receipt.");
      return;
    }
    setReceiveModal(transfer);
    setReceiveLines(
      (transfer.lines || []).map((l) => ({
        id: l.id,
        item: l.item,
        quantity: Number(l.quantity || 0),
        receivedQuantity: l.receivedQuantity != null ? Number(l.receivedQuantity) : Number(l.quantity || 0),
      }))
    );
  };

  const handleReceiveConfirm = async () => {
    if (!receiveModal) return;
    if (!canUserReceive(receiveModal)) {
      toast.error("Only the destination store owner or assigned storekeeper may confirm receipt.");
      return;
    }

    setSubmitting(true);
    try {
      await invTransferService.receive(receiveModal.id);
      toast.success(`Transfer ${receiveModal.transferNumber} received! Stock added to destination store & GL Journal Entry posted.`);
      setReceiveModal(null);
      loadData();
      if (detailModal?.id === receiveModal.id) {
        const full = await invTransferService.getById(receiveModal.id);
        setDetailModal(full);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Receipt failed");
    }
    setSubmitting(false);
  };

  /* ── Open Detail Modal ────────────────────────────────────────── */
  const handleOpenDetail = async (transfer) => {
    try {
      const full = await invTransferService.getById(transfer.id);
      setDetailModal(full || transfer);
    } catch {
      setDetailModal(transfer);
    }
  };

  /* ── PDF Generation ───────────────────────────────────────────── */
  const handlePrintPdf = async (transfer) => {
    setPrintingId(transfer.id);
    try {
      await generateTransferPdf(transfer, null, { preview: true });
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate Transfer Note PDF");
    }
    setPrintingId(null);
  };

  /* ── Filtered Transfers List ──────────────────────────────────── */
  const filteredTransfers = useMemo(() => {
    return transfers.filter((t) => {
      const matchesSearch =
        !searchTerm ||
        (t.transferNumber && t.transferNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.fromStore?.storeName && t.fromStore.storeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.toStore?.storeName && t.toStore.storeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.waybillNumber && t.waybillNumber.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFrom = !filterFromStore || String(t.fromStore?.id) === String(filterFromStore);
      const matchesTo = !filterToStore || String(t.toStore?.id) === String(filterToStore);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [transfers, searchTerm, filterFromStore, filterToStore]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = transfers.length;
    const pending = transfers.filter((t) => t.status === "SUBMITTED").length;
    const inTransit = transfers.filter((t) => t.status === "IN_TRANSIT").length;
    const received = transfers.filter((t) => t.status === "RECEIVED").length;
    return { total, pending, inTransit, received };
  }, [transfers]);

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 dark:shadow-indigo-900/30">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Store Stock Transfers (የመጋዘን ዝውውር)
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Multi-tier inter-store movement with live stock checks, workflow approvals, and GL integration
              </p>
            </div>
          </div>
        </div>

        {isAuthorizedCreator && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                let defaultFromStoreId = "";
                if (assignedStore?.id) {
                  defaultFromStoreId = String(assignedStore.id);
                } else if (myStores.length > 0 && myStores[0]?.store?.id) {
                  defaultFromStoreId = String(myStores[0].store.id);
                } else if (currentUserBranch?.id) {
                  const bStores = stores.filter((s) => s.branch?.id === currentUserBranch.id);
                  if (bStores.length > 0) defaultFromStoreId = String(bStores[0].id);
                }

                setForm({
                  fromStoreId: defaultFromStoreId,
                  toStoreId: "",
                  remarks: "",
                  lines: [{ itemId: "", quantity: "" }],
                });
                setFormErrors({});
                setCreateModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-indigo-900/40 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>New Stock Transfer</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Total Transfers</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Pending Approvals</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{metrics.pending}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">In-Transit (Dispatched)</div>
            <div className="text-2xl font-bold text-purple-600 mt-0.5">{metrics.inTransit}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">Completed Receipts</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{metrics.received}</div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by transfer #, store, waybill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            {Object.keys(statusColors).map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          <select
            value={filterFromStore}
            onChange={(e) => setFilterFromStore(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">From: All Stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                From: {s.storeName}
              </option>
            ))}
          </select>

          <select
            value={filterToStore}
            onChange={(e) => setFilterToStore(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">To: All Stores</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                To: {s.storeName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={loadData}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          title="Refresh List"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Transfers Data Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/75 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs font-semibold tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3.5 text-left">Transfer #</th>
                <th className="px-5 py-3.5 text-left">Store Route (From → To)</th>
                <th className="px-5 py-3.5 text-left">Date</th>
                <th className="px-5 py-3.5 text-left">Workflow Step</th>
                <th className="px-5 py-3.5 text-right">Value (ETB)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      <span>Loading transfers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <ArrowLeftRight className="w-8 h-8 text-gray-300" />
                      <span className="font-medium text-gray-600 dark:text-gray-400">No stock transfers found</span>
                      <span className="text-xs text-gray-400">Try adjusting your status or store filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => {
                  const inst = wfInstances[t.id];
                  const currentStep = inst?.currentStep;
                  const canApprove = canUserApproveStep(t);
                  const canShip = canUserShip(t);
                  const canReceive = canUserReceive(t);

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                          <span>{t.transferNumber}</span>
                        </div>
                        {t.waybillNumber && (
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            WB: {t.waybillNumber}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {t.fromStore?.storeName || `Store #${t.fromStore?.id || "—"}`}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {t.toStore?.storeName || `Store #${t.toStore?.id || "—"}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                        {t.transferDate || (t.createdAt ? t.createdAt.substring(0, 10) : "—")}
                      </td>

                      <td className="px-5 py-3.5">
                        {t.status === "SUBMITTED" && currentStep ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800 w-fit">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="font-medium truncate max-w-[150px]">{currentStep.stepName}</span>
                          </div>
                        ) : t.status === "IN_TRANSIT" ? (
                          <div className="flex items-center gap-1.5 text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800 w-fit">
                            <Truck className="w-3 h-3 flex-shrink-0" />
                            <span>In Transit ({t.vehiclePlate || "En route"})</span>
                          </div>
                        ) : t.status === "RECEIVED" ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 w-fit">
                            <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                            <span>Fully Received</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-gray-900 dark:text-white">
                        ETB {Number(t.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[t.status] || "bg-gray-100 text-gray-700"}`}>
                          {t.status?.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Detail */}
                          <button
                            onClick={() => handleOpenDetail(t)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                            title="View Full Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print PDF */}
                          <button
                            onClick={() => handlePrintPdf(t)}
                            disabled={printingId === t.id}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 disabled:opacity-50"
                            title="Print Store Transfer Note (PDF)"
                          >
                            {printingId === t.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            ) : (
                              <Printer className="w-4 h-4" />
                            )}
                          </button>

                          {/* Submit Draft */}
                          {t.status === "DRAFT" && isAuthorizedCreator && (
                            <button
                              onClick={() => handleSubmit(t)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                              title="Submit to Workflow"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          )}

                          {/* Approve Step */}
                          {canApprove && (
                            <>
                              <button
                                onClick={() => handleOpenApproveModal(t)}
                                className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                                title="Approve Current Step"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setRejectModal(t);
                                  setRejectReason("");
                                  setRejectErrors("");
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                title="Reject Transfer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Ship / Dispatch */}
                          {canShip && (
                            <button
                              onClick={() => handleOpenShipModal(t)}
                              className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                              title="Dispatch / Ship Stock (Source Warehouse Custodian)"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Receive Stock */}
                          {canReceive && (
                            <button
                              onClick={() => handleOpenReceiveModal(t)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                              title="Receive Goods (Destination Warehouse Custodian)"
                            >
                              <PackageCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Pending Custodian Tooltips / Indicators */}
                          {t.status === "IN_TRANSIT" && !canReceive && (
                            <span
                              className="p-1.5 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              title={`Awaiting receipt confirmation by destination storekeeper (${t.toStore?.storeName || "Destination Store"})`}
                            >
                              <PackageCheck className="w-4 h-4 opacity-40" />
                            </span>
                          )}
                          {t.status === "APPROVED" && !canShip && (
                            <span
                              className="p-1.5 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                              title={`Awaiting dispatch by source storekeeper (${t.fromStore?.storeName || "Source Store"})`}
                            >
                              <Truck className="w-4 h-4 opacity-40" />
                            </span>
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Create New Stock Transfer (with Live Stock Checks) ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Inter-Store Transfer</h2>
                  <p className="text-xs text-gray-500">Checks source warehouse stock balances dynamically in real time</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Warehouse Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                    Source Store (የመነሻ መጋዘን) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.fromStoreId}
                    onChange={(e) => handleFromStoreChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                      formErrors.fromStoreId
                        ? "border-red-500 bg-red-50/20 focus:ring-red-500"
                        : "border-gray-200 dark:border-gray-600 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Select Source Store...</option>
                    {(isMainOfficeOrAdmin
                      ? stores
                      : myStores.length > 0
                      ? myStores.map((ms) => ms.store).filter(Boolean)
                      : currentUserBranch?.id
                      ? stores.filter((s) => s.branch?.id === currentUserBranch.id)
                      : stores
                    ).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.storeName} ({s.storeCode || `ID: ${s.id}`})
                      </option>
                    ))}
                  </select>
                  {formErrors.fromStoreId && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.fromStoreId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                    Destination Store (የመዳረሻ መጋዘን) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.toStoreId}
                    onChange={(e) => {
                      setForm((prev) => ({ ...prev, toStoreId: e.target.value }));
                      if (formErrors.toStoreId) setFormErrors((prev) => ({ ...prev, toStoreId: "" }));
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all ${
                      formErrors.toStoreId
                        ? "border-red-500 bg-red-50/20 focus:ring-red-500"
                        : "border-gray-200 dark:border-gray-600 focus:ring-indigo-500"
                    }`}
                  >
                    <option value="">Select Destination Store...</option>
                    {stores
                      .filter((s) => String(s.id) !== String(form.fromStoreId))
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.storeName} ({s.storeCode || `ID: ${s.id}`})
                        </option>
                      ))}
                  </select>
                  {formErrors.toStoreId && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {formErrors.toStoreId}
                    </p>
                  )}
                </div>
              </div>

              {/* Purpose / Remarks */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Transfer Purpose & Remarks (የዝውውሩ ምክንያት)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Replenishment of branch inventory, project allocation..."
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Items Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>Items to Transfer (የሚተላለፉ ዕቃዎች)</span>
                    <span className="text-xs font-normal text-gray-400">({form.lines.length} lines)</span>
                  </h3>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {form.lines.map((line, idx) => {
                    const lineErr = formErrors.lines?.[idx] || {};
                    const stockKey = form.fromStoreId && line.itemId ? `${form.fromStoreId}_${line.itemId}` : null;
                    const stock = stockKey ? stockCache[stockKey] : null;
                    const selectedItem = items.find((i) => String(i.id) === String(line.itemId));

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700 space-y-2.5"
                      >
                        <div className="grid grid-cols-12 gap-3 items-start">
                          {/* Item Selector */}
                          <div className="col-span-12 sm:col-span-7">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">
                              Select Item <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={line.itemId}
                              onChange={(e) => updateLine(idx, "itemId", e.target.value)}
                              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                                lineErr.itemId
                                  ? "border-red-500 bg-red-50/20"
                                  : "border-gray-200 dark:border-gray-600"
                              }`}
                            >
                              <option value="">Choose item...</option>
                              {items.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.itemCode} — {i.itemName} {i.itemNameAm ? `(${i.itemNameAm})` : ""}
                                </option>
                              ))}
                            </select>
                            {lineErr.itemId && (
                              <p className="text-[11px] text-red-500 mt-0.5">{lineErr.itemId}</p>
                            )}
                          </div>

                          {/* Quantity Input */}
                          <div className="col-span-10 sm:col-span-4">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">
                              Transfer Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              step="any"
                              placeholder="0"
                              value={line.quantity}
                              onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                              className={`w-full px-3 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono ${
                                lineErr.quantity
                                  ? "border-red-500 bg-red-50/20"
                                  : "border-gray-200 dark:border-gray-600"
                              }`}
                            />
                            {lineErr.quantity && (
                              <p className="text-[11px] text-red-500 mt-0.5 font-medium">{lineErr.quantity}</p>
                            )}
                          </div>

                          {/* Remove Line Button */}
                          <div className="col-span-2 sm:col-span-1 flex justify-end pt-6">
                            {form.lines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Remove line"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Live Stock Balance Indicator */}
                        {form.fromStoreId && line.itemId && (
                          <div className="flex items-center gap-2 pt-1 text-xs">
                            {stock?.loading ? (
                              <span className="flex items-center gap-1.5 text-gray-400">
                                <Loader2 className="w-3 h-3 animate-spin" /> Checking warehouse balance...
                              </span>
                            ) : stock ? (
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                                    stock.available > 0
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200"
                                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200"
                                  }`}
                                >
                                  {stock.available > 0 ? (
                                    <Check className="w-3 h-3" />
                                  ) : (
                                    <AlertTriangle className="w-3 h-3" />
                                  )}
                                  Available in Source Store: {stock.available.toLocaleString()}{" "}
                                  {selectedItem?.unitOfMeasure?.unitCode || "Pcs"}
                                </span>

                                <span className="text-gray-400 text-[11px]">
                                  (On-Hand: {stock.onHand} | Reserved: {stock.reserved})
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-[11px]">Stock balance pending check</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCreate}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-md disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Create Transfer (Draft)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Transfer Details (ERP View with Stepper & GL Links) ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {detailModal.transferNumber}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>
                    {detailModal.status?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Transfer Date: {detailModal.transferDate || (detailModal.createdAt ? detailModal.createdAt.substring(0, 10) : "—")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintPdf(detailModal)}
                  disabled={printingId === detailModal.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  {printingId === detailModal.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5" />
                  )}
                  <span>Print Note (PDF)</span>
                </button>
                <button
                  onClick={() => setDetailModal(null)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/25">
              <TransferStepper
                status={detailModal.status}
                templateSteps={templateSteps}
                currentStep={wfInstances[detailModal.id]?.currentStep}
                remarks={detailModal.remarks}
                fromStore={detailModal.fromStore}
                toStore={detailModal.toStore}
              />
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Store Routing & Carrier Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Store Routing */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Store Routing & Custodians</div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-xs text-gray-400">Source (From)</div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {detailModal.fromStore?.storeName || `Store #${detailModal.fromStore?.id}`}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {detailModal.fromStore?.storeCode || "Code —"}
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Custodian: {detailModal.fromStore?.storeKeeper?.fullName || detailModal.fromStore?.storeKeeper?.userName || "Assigned Storekeeper"}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-500 mx-2" />
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Destination (To)</div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {detailModal.toStore?.storeName || `Store #${detailModal.toStore?.id}`}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {detailModal.toStore?.storeCode || "Code —"}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        Custodian: {detailModal.toStore?.storeKeeper?.fullName || detailModal.toStore?.storeKeeper?.userName || "Assigned Storekeeper"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logistics & Carrier */}
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 space-y-1.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Logistics & Gate Pass</div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-gray-400">Waybill #:</span>{" "}
                      <span className="font-mono font-medium text-gray-900 dark:text-white">
                        {detailModal.waybillNumber || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Vehicle:</span>{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailModal.vehiclePlate || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Driver:</span>{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {detailModal.driverName || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">GL Entry:</span>{" "}
                      {detailModal.journalEntry ? (
                        <span className="font-mono font-semibold text-blue-600">
                          JV #{detailModal.journalEntry.entryNumber || detailModal.journalEntry.id}
                        </span>
                      ) : (
                        <span className="text-gray-400">Pending Receipt</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Transferred Items</h3>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Item</th>
                        <th className="px-4 py-2.5 text-center">UOM</th>
                        <th className="px-4 py-2.5 text-right">Shipped Qty</th>
                        <th className="px-4 py-2.5 text-right">Received Qty</th>
                        <th className="px-4 py-2.5 text-right">Unit Cost (ETB)</th>
                        <th className="px-4 py-2.5 text-right">Total (ETB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(detailModal.lines || []).map((l, idx) => (
                        <tr key={l.id || idx}>
                          <td className="px-4 py-2.5">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {l.item?.itemName}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">
                              {l.item?.itemCode}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-center text-gray-500">
                            {l.item?.unitOfMeasure?.unitCode || "Pcs"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                            {Number(l.quantity || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                            {detailModal.status === "RECEIVED" ? Number(l.receivedQuantity || l.quantity).toLocaleString() : "—"}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-gray-600">
                            {Number(l.unitCost || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {Number(l.totalCost || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white">
                      <tr>
                        <td colSpan={5} className="px-4 py-2.5 text-right">Total Transfer Value:</td>
                        <td className="px-4 py-2.5 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">
                          ETB {Number(detailModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Audit Trail Cards */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Audit Trail & Sign-offs</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/30">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">1. Requested By</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                      {detailModal.requestedBy || detailModal.createdBy || "—"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {detailModal.createdAt ? detailModal.createdAt.substring(0, 10) : "—"}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/30">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">2. Approved By</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                      {detailModal.approvedBy || "—"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {detailModal.approvedDate ? detailModal.approvedDate.substring(0, 10) : "—"}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/30">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">3. Dispatched By</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                      {detailModal.shippedBy || "—"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {detailModal.shippedDate ? detailModal.shippedDate.substring(0, 10) : "—"}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/30">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">4. Received By</div>
                    <div className="font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                      {detailModal.receivedBy || "—"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {detailModal.receivedDate ? detailModal.receivedDate.substring(0, 10) : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-500">
                {detailModal.status === "SUBMITTED" && !canUserApproveStep(detailModal) && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Approval: {wfInstances[detailModal.id]?.currentStep?.stepName || "Manager"} ({wfInstances[detailModal.id]?.currentStep?.approverRoleCode || "Role Required"})
                  </span>
                )}
                {detailModal.status === "APPROVED" && !canUserShip(detailModal) && (
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    Awaiting dispatch by source custodian ({detailModal.fromStore?.storeName})
                  </span>
                )}
                {detailModal.status === "IN_TRANSIT" && !canUserReceive(detailModal) && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <PackageCheck className="w-3.5 h-3.5" />
                    Final receipt must be confirmed by destination custodian ({detailModal.toStore?.storeName})
                  </span>
                )}
                {detailModal.status === "RECEIVED" && (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Fully received & stock intake posted
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDetailModal(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>

                {detailModal.status === "DRAFT" && isAuthorizedCreator && (
                  <button
                    onClick={() => handleSubmit(detailModal)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit to Workflow</span>
                  </button>
                )}

                {detailModal.status === "SUBMITTED" && canUserApproveStep(detailModal) && (
                  <>
                    <button
                      onClick={() => handleOpenApproveModal(detailModal)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve Step</span>
                    </button>
                    <button
                      onClick={() => {
                        setRejectModal(detailModal);
                        setRejectReason("");
                        setRejectErrors("");
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </>
                )}

                {detailModal.status === "APPROVED" && canUserShip(detailModal) && (
                  <button
                    onClick={() => handleOpenShipModal(detailModal)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Dispatch Stock</span>
                  </button>
                )}

                {detailModal.status === "IN_TRANSIT" && canUserReceive(detailModal) && (
                  <button
                    onClick={() => handleOpenReceiveModal(detailModal)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Confirm Receipt</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Approve Step (with Line Item Adjustments & Stock Checks) */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Approve Stock Transfer Step
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {wfInstances[approveModal.id]?.currentStep?.stepName || "Step Approval"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Transfer <span className="font-mono font-medium">{approveModal.transferNumber}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApproveModal(null)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Route & Authorization Info */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-semibold text-blue-900 dark:text-blue-300">
                      Current Step & Assigned Role Authorization
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                    Role: {wfInstances[approveModal.id]?.currentStep?.approverRoleCode || "AUTHORIZED_APPROVER"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-gray-700 dark:text-gray-300">
                  <span className="flex items-center gap-1 font-medium">
                    <Store className="w-3.5 h-3.5 text-gray-500" /> Source:{" "}
                    <strong>{approveModal.fromStore?.storeName || `Store #${approveModal.fromStore?.id}`}</strong>
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                  <span className="flex items-center gap-1 font-medium">
                    <Store className="w-3.5 h-3.5 text-gray-500" /> Destination:{" "}
                    <strong>{approveModal.toStore?.storeName || `Store #${approveModal.toStore?.id}`}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 pt-0.5">
                  You are authorized to review and adjust requested quantities. Approved quantities are verified in real time against source store stock balances.
                </p>
              </div>

              {/* Editable Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Line Items & Quantity Review
                  </h4>
                  <span className="text-xs text-gray-400">
                    {approveLines.length} {approveLines.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {approveLines.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5" />
                    <p className="text-xs">Loading line items...</p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 font-semibold uppercase">
                        <tr>
                          <th className="px-3 py-2.5 text-left">Item</th>
                          <th className="px-3 py-2.5 text-left">Source Store Stock</th>
                          <th className="px-3 py-2.5 text-right">Requested Qty</th>
                          <th className="px-3 py-2.5 text-right w-36">Approved Qty</th>
                          <th className="px-3 py-2.5 text-right">Unit Cost</th>
                          <th className="px-3 py-2.5 text-right">Total (ETB)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {approveLines.map((line, idx) => {
                          const stockKey = approveModal.fromStore?.id && line.itemId ? `${approveModal.fromStore.id}_${line.itemId}` : null;
                          const stock = stockKey ? stockCache[stockKey] : null;
                          const uom = line.item?.unitOfMeasure?.unitCode || "Pcs";
                          const isQuantityModified = Number(line.approvedQuantity) !== Number(line.originalQuantity);
                          const lineError = approveErrors[idx];

                          return (
                            <tr key={line.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                              {/* Item Description */}
                              <td className="px-3 py-2.5">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {line.item?.itemName}
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono">
                                  {line.item?.itemCode}
                                </div>
                              </td>

                              {/* Source Store Stock Availability */}
                              <td className="px-3 py-2.5">
                                {stock?.loading ? (
                                  <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Checking stock...
                                  </span>
                                ) : stock ? (
                                  <div>
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                        stock.available < Number(line.approvedQuantity || 0)
                                          ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
                                          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                      }`}
                                    >
                                      {stock.available < Number(line.approvedQuantity || 0) ? (
                                        <AlertTriangle className="w-3 h-3 text-red-500" />
                                      ) : (
                                        <Check className="w-3 h-3 text-emerald-500" />
                                      )}
                                      Avail: {stock.available.toLocaleString()} {uom}
                                    </span>
                                    {stock.reserved > 0 && (
                                      <div className="text-[10px] text-gray-400 mt-0.5">
                                        (On hand: {stock.onHand}, Rsvd: {stock.reserved})
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-[11px]">—</span>
                                )}
                              </td>

                              {/* Original Requested Quantity */}
                              <td className="px-3 py-2.5 text-right font-mono font-medium text-gray-600 dark:text-gray-300">
                                {Number(line.originalQuantity || 0).toLocaleString()} {uom}
                              </td>

                              {/* Approved Quantity Input */}
                              <td className="px-3 py-2.5 text-right">
                                <div className="inline-flex flex-col items-end">
                                  <input
                                    type="number"
                                    min="0.01"
                                    step="any"
                                    value={line.approvedQuantity}
                                    onChange={(e) => handleApproveLineQuantityChange(idx, e.target.value)}
                                    className={`w-28 px-2.5 py-1 text-xs rounded-lg border text-right font-mono font-bold transition-all ${
                                      lineError
                                        ? "border-red-500 bg-red-50/20 text-red-700 dark:text-red-400 focus:ring-red-500"
                                        : isQuantityModified
                                        ? "border-amber-400 bg-amber-50/30 text-amber-800 dark:text-amber-300 focus:ring-amber-500"
                                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-emerald-500"
                                    }`}
                                  />
                                  {isQuantityModified && !lineError && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                                      Modified (was {line.originalQuantity})
                                    </span>
                                  )}
                                  {lineError && (
                                    <span className="text-[10px] text-red-500 font-medium mt-0.5 max-w-[140px] text-right">
                                      {lineError}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Unit Cost */}
                              <td className="px-3 py-2.5 text-right font-mono text-gray-600 dark:text-gray-300">
                                {Number(line.unitCost || 0).toFixed(2)}
                              </td>

                              {/* Line Total */}
                              <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                {(Number(line.approvedQuantity || 0) * Number(line.unitCost || 0)).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-gray-50/75 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                        <tr>
                          <td colSpan={5} className="px-3 py-2.5 text-right font-semibold text-gray-700 dark:text-gray-300">
                            Total Approved Value:
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            ETB{" "}
                            {approveLines
                              .reduce(
                                (sum, l) => sum + Number(l.approvedQuantity || 0) * Number(l.unitCost || 0),
                                0
                              )
                              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Approval Remarks */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Approval Remarks / Comments (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter optional step approval remarks or reasons for quantity adjustments..."
                  value={approveComments}
                  onChange={(e) => setApproveComments(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="text-xs text-gray-500">
                {approveLines.some((l) => Number(l.approvedQuantity) !== Number(l.originalQuantity)) ? (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    One or more line quantities have been modified from original request.
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Quantities will be deducted from source store upon final dispatch.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setApproveModal(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleApproveConfirm}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Confirm Step Approval</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Reject Step (Mandatory Reason) ────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Reject Stock Transfer</h3>
                <p className="text-xs text-gray-500">Transfer {rejectModal.transferNumber}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Rejecting this transfer will cancel the request and notify the requester. Please specify a mandatory reason.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Reason for rejecting this stock transfer..."
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectErrors) setRejectErrors("");
                }}
                className={`w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white ${
                  rejectErrors ? "border-red-500 bg-red-50/20" : "border-gray-200 dark:border-gray-600"
                }`}
              />
              {rejectErrors && <p className="text-xs text-red-500 mt-1">{rejectErrors}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRejectConfirm}
                className="flex items-center gap-1.5 px-5 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Ship / Dispatch (Transport & Gate Pass Details) ────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {shipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Dispatch & Ship Stock</h3>
                <p className="text-xs text-gray-500">Transfer {shipModal.transferNumber}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              <div className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Notice
              </div>
              <p className="mt-0.5">
                Confirming shipment will deduct items immediately from <strong>{shipModal.fromStore?.storeName}</strong>. Please enter the carrier details.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Waybill / Gate Pass # (ዌይቢል ቁጥር)
                </label>
                <input
                  type="text"
                  placeholder="e.g. WB-2026-0045"
                  value={shipForm.waybillNumber}
                  onChange={(e) => setShipForm({ ...shipForm, waybillNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Vehicle Plate # (ተሸከርካሪ ሰሌዳ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3-34567 ET"
                  value={shipForm.vehiclePlate}
                  onChange={(e) => {
                    setShipForm({ ...shipForm, vehiclePlate: e.target.value });
                    if (shipErrors.vehiclePlate) setShipErrors((prev) => ({ ...prev, vehiclePlate: "" }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    shipErrors.vehiclePlate ? "border-red-500 bg-red-50/20" : "border-gray-200 dark:border-gray-600"
                  }`}
                />
                {shipErrors.vehiclePlate && <p className="text-xs text-red-500 mt-1">{shipErrors.vehiclePlate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Driver Name (አሽከርካሪ ስም) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abebe Kebede"
                  value={shipForm.driverName}
                  onChange={(e) => {
                    setShipForm({ ...shipForm, driverName: e.target.value });
                    if (shipErrors.driverName) setShipErrors((prev) => ({ ...prev, driverName: "" }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-xl border bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    shipErrors.driverName ? "border-red-500 bg-red-50/20" : "border-gray-200 dark:border-gray-600"
                  }`}
                />
                {shipErrors.driverName && <p className="text-xs text-red-500 mt-1">{shipErrors.driverName}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShipModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleShipConfirm}
                className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                <span>Confirm Dispatch (Ship)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: Receive Goods (Stock Intake & GL Posting) ─────────── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {receiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Receive Transferred Goods</h3>
                <p className="text-xs text-gray-500">Transfer {receiveModal.transferNumber}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
              <div className="font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Destination Warehouse Intake
              </div>
              <p className="mt-0.5">
                Receiving will add stock into <strong>{receiveModal.toStore?.storeName}</strong> and create the General Ledger Journal Entry automatically.
              </p>
            </div>

            {/* Items Inspection Summary */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-right">Shipped</th>
                    <th className="px-3 py-2 text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {receiveLines.map((l) => (
                    <tr key={l.id}>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-gray-900 dark:text-white">{l.item?.itemName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{l.item?.itemCode}</div>
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-gray-700 dark:text-gray-300">
                        {l.quantity}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-emerald-600">
                        {l.receivedQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReceiveModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleReceiveConfirm}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                <span>Confirm Receipt & Intake</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
