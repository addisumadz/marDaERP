"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import invPurchaseOrderService from "../../../lib/invPurchaseOrderService";
import invPurchaseRequisitionService from "../../../lib/invPurchaseRequisitionService";
import invSupplierService from "../../../lib/invSupplierService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import workflowService from "../../../lib/workflowService";
import { generatePurchaseOrderPdf } from "./purchaseOrderPdf";
import {
  FileCheck,
  Plus,
  X,
  Eye,
  Check,
  CheckCheck,
  XCircle,
  Send,
  Truck,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CircleDot,
  Clock,
  Printer,
  Building2,
  Sparkles,
  Link2,
  Search,
  FileText,
  RefreshCw,
  AlertCircle,
  Loader2,
  ExternalLink
} from "lucide-react";

/* ─── Status Colors ────────────────────────────────────────── */
const statusColors = {
  DRAFT: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  APPROVED_L1: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  APPROVED_L2: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  SENT_TO_SUPPLIER: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  PARTIALLY_RECEIVED: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  FULLY_RECEIVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

/* ─── Dynamic Approval Stepper for Purchase Orders ─────────── */
function ApprovalStepper({ status, templateSteps = [], currentStep = null, rejectionReason = "" }) {
  const rejected = status === "CANCELLED";
  const isDraft = status === "DRAFT";
  const isFullyApproved = status === "APPROVED_L2" || status === "SENT_TO_SUPPLIER" || status === "PARTIALLY_RECEIVED" || status === "FULLY_RECEIVED";

  const effectiveSteps = templateSteps.length > 0 ? templateSteps : [
    { stepOrder: 1, stepName: "Finance Review", approverRoleCode: "M_FINANCE_HEAD" },
    { stepOrder: 2, stepName: "General Manager Approval", approverRoleCode: "BILLZGJ_ADMIN" }
  ];

  const steps = [
    { key: "DRAFT", label: "Draft Created", role: "Purchaser" },
    ...effectiveSteps.map(s => ({
      key: `STEP_${s.stepOrder}`,
      label: s.stepName,
      labelAm: s.stepNameAm,
      role: s.approverRoleCode,
      stepOrder: s.stepOrder,
      sla: s.slaHours,
    })),
    { key: "APPROVED_L2", label: "Approved", role: "Authorized" },
    { key: "SENT_TO_SUPPLIER", label: "Issued to Vendor", role: "Supplier Sent" },
  ];

  let activeIdx = 0;
  if (isDraft) {
    activeIdx = 0;
  } else if (status === "SENT_TO_SUPPLIER" || status === "PARTIALLY_RECEIVED" || status === "FULLY_RECEIVED") {
    activeIdx = steps.length - 1;
  } else if (status === "APPROVED_L2") {
    activeIdx = steps.length - 2;
  } else if (currentStep) {
    const idx = steps.findIndex(s => s.stepOrder === currentStep.stepOrder);
    activeIdx = idx >= 0 ? idx : 1;
  } else if (status === "APPROVED_L1") {
    activeIdx = 1;
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
          <span>Purchase Order Cancelled / Rejected: {rejectionReason || "Approval denied."}</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
function InvPurchaseOrdersContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRoles = session?.user?.roles || session?.roles || [];
  const userRoles = Array.isArray(rawRoles) ? rawRoles : [];

  const [pos, setPos] = useState([]);
  const [wfInstances, setWfInstances] = useState({});
  const [templateSteps, setTemplateSteps] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [approveComments, setApproveComments] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  // PR Sourcing & Conversion
  const [prPickerModal, setPrPickerModal] = useState(false);
  const [approvedPrs, setApprovedPrs] = useState([]);
  const [loadingPrs, setLoadingPrs] = useState(false);
  const [selectedPr, setSelectedPr] = useState(null);

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [filterSupplier, setFilterSupplier] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState({
    supplierId: "",
    storeId: "",
    requisitionId: "",
    expectedDeliveryDate: "",
    paymentTerms: "Net 30 Days",
    deliveryTerms: "Delivered to Store (DDP)",
    remarks: "",
    vatRate: "15",
    lines: [{ itemId: "", orderedQuantity: "", unitPrice: "" }]
  });
  const [formErrors, setFormErrors] = useState({});
  const [rejectErrors, setRejectErrors] = useState("");

  /* ── Role helpers with Admin Override ── */
  const normalizedRoles = userRoles.map(r => String(r || "").replace(/^ROLE_/i, "").toLowerCase());
  const isSuperAdmin = normalizedRoles.some(r => ["billzgjt", "systemadmin", "admin"].includes(r));
  const isPurchaser = isSuperAdmin || normalizedRoles.some(r =>
    ["m_purchasing_officer", "m_branch_store", "inv_manager", "inv_storekeeper"].includes(r)
  );

  // Initial load
  useEffect(() => {
    loadLookups();
    loadWorkflowTemplate();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, filterStatus, filterStore]);

  // Check URL query param convertPrId
  useEffect(() => {
    const convertPrId = searchParams.get("convertPrId");
    if (convertPrId) {
      loadAndConvertPr(convertPrId);
    }
  }, [searchParams]);

  const loadLookups = async () => {
    try {
      const [s, st, i] = await Promise.all([
        invSupplierService.getAllActive(),
        invStoreService.getAllActive(),
        invItemService.getAllActive()
      ]);
      setSuppliers(s || []);
      setStores(st || []);
      setItems(i || []);
    } catch {}
  };

  const loadWorkflowTemplate = async () => {
    try {
      const activeTemplates = await workflowService.getActiveTemplates();
      const poTemplate = (activeTemplates || []).find(t => t.documentType === "PURCHASE_ORDER");
      if (poTemplate && poTemplate.steps) {
        setTemplateSteps(poTemplate.steps);
      }
    } catch (e) {
      console.warn("Could not load workflow template for PO:", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invPurchaseOrderService.getAll({
        page,
        size: 15,
        status: filterStatus || undefined,
        storeId: filterStore || undefined
      });
      const poList = data.content || [];
      setPos(poList);
      setTotalPages(data.totalPages || 0);

      // Query workflow instances for POs in parallel
      const instanceMap = {};
      await Promise.all(
        poList.map(async (po) => {
          try {
            const inst = await workflowService.getInstanceByDocument("PURCHASE_ORDER", po.id);
            if (inst && inst.id) {
              instanceMap[po.id] = inst;
            }
          } catch (_) {}
        })
      );
      setWfInstances(instanceMap);
    } catch {
      toast.error("Failed to load purchase orders");
    }
    setLoading(false);
  };

  /* ── Fetch Approved Requisitions for Sourcing ── */
  const openPrPicker = async () => {
    setLoadingPrs(true);
    setPrPickerModal(true);
    try {
      const list = await invPurchaseOrderService.getApprovedRequisitions();
      setApprovedPrs(list || []);
    } catch {
      toast.error("Could not fetch approved requisitions");
    }
    setLoadingPrs(false);
  };

  const loadAndConvertPr = async (prId) => {
    try {
      const pr = await invPurchaseRequisitionService.getById(prId);
      if (pr) {
        handleSelectPr(pr);
      }
    } catch (e) {
      toast.error("Could not load requisition for conversion");
    }
  };

  const handleSelectPr = (pr) => {
    setSelectedPr(pr);
    const prLines = pr.lines && pr.lines.length > 0
      ? pr.lines.map(l => ({
          itemId: String(l.item?.id || l.itemId || ""),
          orderedQuantity: String(l.approvedQuantity ?? l.requestedQuantity ?? 1),
          unitPrice: String(l.estimatedUnitCost ?? 0)
        }))
      : [{ itemId: "", orderedQuantity: "", unitPrice: "" }];

    setForm(prev => ({
      ...prev,
      storeId: String(pr.store?.id || pr.storeId || prev.storeId || ""),
      requisitionId: String(pr.id),
      remarks: pr.remarks ? `Converted from PR #${pr.requisitionNumber}: ${pr.remarks}` : `Converted from PR #${pr.requisitionNumber}`,
      lines: prLines
    }));

    setPrPickerModal(false);
    setModalOpen(true);
    toast.info(`Imported ${prLines.length} item(s) from PR #${pr.requisitionNumber}`);
  };

  const clearSelectedPr = () => {
    setSelectedPr(null);
    setForm(prev => ({
      ...prev,
      requisitionId: "",
      lines: [{ itemId: "", orderedQuantity: "", unitPrice: "" }]
    }));
  };

  /* ── Line item management ── */
  const addLine = () => setForm(prev => ({
    ...prev,
    lines: [...prev.lines, { itemId: "", orderedQuantity: "", unitPrice: "" }]
  }));

  const removeLine = (idx) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== idx)
    }));
    if (formErrors.lines) {
      const updatedLineErrors = formErrors.lines.filter((_, i) => i !== idx);
      setFormErrors(prev => ({ ...prev, lines: updatedLineErrors }));
    }
  };

  const updateLine = (idx, field, value) => {
    const lines = [...form.lines];
    lines[idx][field] = value;
    setForm(prev => ({ ...prev, lines }));

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

  /* ── Validation ── */
  const validateForm = () => {
    const errs = {};
    if (!form.supplierId) {
      errs.supplierId = "Supplier (Vendor) is required";
    }
    if (!form.storeId) {
      errs.storeId = "Receiving store is required";
    }
    if (!form.lines || form.lines.length === 0) {
      errs.general = "At least one purchase order item line is required";
    } else {
      const lineErrs = [];
      let hasLineErr = false;
      form.lines.forEach((line, idx) => {
        const lErr = {};
        if (!line.itemId) {
          lErr.itemId = "Item required";
          hasLineErr = true;
        }
        if (!line.orderedQuantity || Number(line.orderedQuantity) <= 0) {
          lErr.orderedQuantity = "Qty > 0 required";
          hasLineErr = true;
        }
        if (line.unitPrice === "" || line.unitPrice === null || Number(line.unitPrice) < 0) {
          lErr.unitPrice = "Price ≥ 0 required";
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

  /* ── Live Financial Calculations ── */
  const liveCalculations = useMemo(() => {
    const subtotal = form.lines.reduce((acc, l) => {
      const q = parseFloat(l.orderedQuantity) || 0;
      const p = parseFloat(l.unitPrice) || 0;
      return acc + (q * p);
    }, 0);
    const rate = parseFloat(form.vatRate) || 0;
    const vat = subtotal * (rate / 100);
    const total = subtotal + vat;
    return { subtotal, vat, total };
  }, [form.lines, form.vatRate]);

  /* ── Create Purchase Order ── */
  const handleCreate = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) {
      const missing = [];
      if (errs.supplierId) missing.push("Supplier");
      if (errs.storeId) missing.push("Store");
      if (errs.general) missing.push("At least one line item");
      if (errs.lines) missing.push("Valid item, quantity > 0, and unit price on lines");
      toast.error(`Please complete all mandatory fields: ${missing.join(", ")}`);
      return;
    }

    const validLines = form.lines.filter(l => l.itemId && l.orderedQuantity && Number(l.orderedQuantity) > 0);
    setSubmitting(true);
    try {
      await invPurchaseOrderService.create({
        supplierId: Number(form.supplierId),
        storeId: Number(form.storeId),
        requisitionId: form.requisitionId ? Number(form.requisitionId) : null,
        expectedDeliveryDate: form.expectedDeliveryDate || null,
        paymentTerms: form.paymentTerms || null,
        deliveryTerms: form.deliveryTerms || null,
        vatRate: form.vatRate || "15",
        remarks: form.remarks || null,
        lines: validLines.map(l => ({
          itemId: Number(l.itemId),
          orderedQuantity: Number(l.orderedQuantity),
          unitPrice: Number(l.unitPrice || 0)
        }))
      });

      toast.success("Purchase Order created successfully");
      setModalOpen(false);
      setSelectedPr(null);
      setForm({
        supplierId: "",
        storeId: "",
        requisitionId: "",
        expectedDeliveryDate: "",
        paymentTerms: "Net 30 Days",
        deliveryTerms: "Delivered to Store (DDP)",
        remarks: "",
        vatRate: "15",
        lines: [{ itemId: "", orderedQuantity: "", unitPrice: "" }]
      });
      setFormErrors({});
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create purchase order");
    }
    setSubmitting(false);
  };

  /* ── Submit for Approval ── */
  const handleSubmitOrder = async (id) => {
    try {
      await invPurchaseOrderService.submit(id);
      toast.success("Purchase order submitted for approval");
      loadData();
      if (detailModal?.id === id) setDetailModal(null);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit purchase order");
    }
  };

  /* ── Approve Step ── */
  const handleApprove = async () => {
    if (!approveModal) return;
    setSubmitting(true);
    try {
      const inst = wfInstances[approveModal.id];
      if (inst && inst.id) {
        await workflowService.approveStep(inst.id, approveComments || "Approved");
      } else {
        await invPurchaseOrderService.approveL1(approveModal.id);
      }
      toast.success("Purchase order step approved");
      setApproveModal(null);
      setApproveComments("");
      setDetailModal(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Approval failed");
    }
    setSubmitting(false);
  };

  /* ── Reject Step ── */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setRejectErrors("Rejection reason is required");
      toast.error("Please provide a reason for rejecting this purchase order");
      return;
    }
    setRejectErrors("");
    setSubmitting(true);
    try {
      const inst = wfInstances[rejectModal.id];
      if (inst && inst.id) {
        await workflowService.rejectStep(inst.id, rejectReason);
      } else {
        await invPurchaseOrderService.reject(rejectModal.id, rejectReason);
      }
      toast.success("Purchase order rejected");
      setRejectModal(null);
      setRejectReason("");
      setDetailModal(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Rejection failed");
    }
    setSubmitting(false);
  };

  /* ── Send to Supplier ── */
  const handleSendToSupplier = async (id) => {
    try {
      await invPurchaseOrderService.sendToSupplier(id);
      toast.success("Purchase order successfully issued to supplier");
      loadData();
      if (detailModal?.id === id) {
        const updated = await invPurchaseOrderService.getById(id);
        setDetailModal(updated);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to send to supplier");
    }
  };

  /* ── View Detail ── */
  const viewDetail = async (poId) => {
    try {
      const po = await invPurchaseOrderService.getById(poId);
      let inst = wfInstances[poId];
      if (!inst) {
        try {
          inst = await workflowService.getInstanceByDocument("PURCHASE_ORDER", poId);
          if (inst) setWfInstances(prev => ({ ...prev, [poId]: inst }));
        } catch (_) {}
      }
      setDetailModal(po);
    } catch {
      toast.error("Failed to load details");
    }
  };

  /* ── Print PDF ── */
  const handlePrintPdf = async (po) => {
    try {
      setPrintingId(po.id);
      const wfInstance = wfInstances[po.id] || null;
      await generatePurchaseOrderPdf(po, wfInstance);
      toast.success("Purchase Order PDF generated successfully");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF: " + (err.message || "Unknown error"));
    } finally {
      setPrintingId(null);
    }
  };

  /* ── Check if user can approve the current step ── */
  const canUserApprove = (poId) => {
    const inst = wfInstances[poId];
    if (isSuperAdmin) return true;
    if (inst && inst.status === "IN_PROGRESS" && inst.currentStep) {
      const reqRole = (inst.currentStep.approverRoleCode || "").toLowerCase();
      return normalizedRoles.includes(reqRole);
    }
    const po = pos.find(p => p.id === poId);
    if (po?.status === "SUBMITTED") {
      return normalizedRoles.some(r => ["m_finance_head", "fnc", "m_technical_manager"].includes(r));
    }
    if (po?.status === "APPROVED_L1") {
      return normalizedRoles.some(r => ["billzgjt_admin", "billzgjt", "systemadmin"].includes(r));
    }
    return false;
  };

  /* ── Pending Step Label ── */
  const getPendingLabel = (po) => {
    const inst = wfInstances[po.id];
    if (inst && inst.status === "IN_PROGRESS" && inst.currentStep) {
      return `${inst.currentStep.stepName} (${inst.currentStep.approverRoleCode})`;
    }
    if (po.status === "DRAFT") return "Purchaser (Draft)";
    if (po.status === "SUBMITTED") return "Finance Review";
    if (po.status === "APPROVED_L1") return "GM Approval";
    if (po.status === "APPROVED_L2") return "Approved (Ready to Issue)";
    if (po.status === "SENT_TO_SUPPLIER") return "Issued to Vendor";
    if (po.status === "PARTIALLY_RECEIVED") return "Receiving in Progress";
    if (po.status === "FULLY_RECEIVED") return "Goods Received";
    return "";
  };

  const filteredPos = useMemo(() => {
    return pos.filter(po => {
      if (filterSupplier && String(po.supplier?.id) !== filterSupplier) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const num = (po.poNumber || "").toLowerCase();
        const supp = (po.supplier?.supplierName || "").toLowerCase();
        const pr = (po.requisition?.requisitionNumber || "").toLowerCase();
        if (!num.includes(q) && !supp.includes(q) && !pr.includes(q)) return false;
      }
      return true;
    });
  }, [pos, filterSupplier, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, approve, and issue vendor purchase orders directly or sourced from approved purchase requisitions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={openPrPicker}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors shadow-sm font-medium text-sm"
            title="Browse Approved Requisitions to generate PO"
          >
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Convert Approved PR
          </button>
          <button
            onClick={() => { setSelectedPr(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all duration-200 font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New Purchase Order
          </button>
        </div>
      </div>

      {/* ─── Filters & Search ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search PO #, Supplier, or Ref PR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          {Object.keys(statusColors).map(s => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>

        <select
          value={filterStore}
          onChange={(e) => { setFilterStore(e.target.value); setPage(0); }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Stores</option>
          {stores.map(st => (
            <option key={st.id} value={st.id}>{st.storeName}</option>
          ))}
        </select>

        <select
          value={filterSupplier}
          onChange={(e) => setFilterSupplier(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Suppliers</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.supplierName}</option>
          ))}
        </select>

        <button
          onClick={loadData}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ─── Orders Table ───────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left">PO Number</th>
                <th className="px-5 py-3.5 text-left">Supplier</th>
                <th className="px-5 py-3.5 text-left">Store</th>
                <th className="px-5 py-3.5 text-left">Ref PR</th>
                <th className="px-5 py-3.5 text-left">Order Date</th>
                <th className="px-5 py-3.5 text-right">Grand Total (ETB)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Pending Step</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">Loading purchase orders...</td></tr>
              ) : filteredPos.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-400">No purchase orders found.</td></tr>
              ) : (
                filteredPos.map(po => {
                  const canAct = (po.status === "SUBMITTED" || po.status === "APPROVED_L1") && canUserApprove(po.id);
                  const isApproved = po.status === "APPROVED_L2" || po.status === "SENT_TO_SUPPLIER" || po.status === "PARTIALLY_RECEIVED" || po.status === "FULLY_RECEIVED";

                  return (
                    <tr key={po.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {po.poNumber}
                      </td>
                      <td className="px-5 py-3 text-gray-800 dark:text-gray-200 font-medium">
                        {po.supplier?.supplierName || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                        {po.store?.storeName || "—"}
                      </td>
                      <td className="px-5 py-3">
                        {po.requisition ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                            <Link2 className="w-3 h-3" />
                            {po.requisition.requisitionNumber}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">Direct PO</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                        {po.orderDate}
                      </td>
                      <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">
                        ETB {Number(po.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[po.status] || "bg-gray-100"}`}>
                          {po.status?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {po.status !== "CANCELLED" && (
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            {getPendingLabel(po)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => viewDetail(po.id)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                            title="View PO Details & Audit Trail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print PDF */}
                          {isApproved && (
                            <button
                              onClick={() => handlePrintPdf(po)}
                              disabled={printingId === po.id}
                              className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 disabled:opacity-50"
                              title="Print Vendor Purchase Order Note"
                            >
                              <Printer className={`w-4 h-4 ${printingId === po.id ? "animate-spin" : ""}`} />
                            </button>
                          )}

                          {/* Submit Draft */}
                          {po.status === "DRAFT" && isPurchaser && (
                            <button
                              onClick={() => handleSubmitOrder(po.id)}
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
                                onClick={() => setApproveModal(po)}
                                className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"
                                title="Approve Current Step"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectModal(po)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500"
                                title="Reject Purchase Order"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Issue to Vendor */}
                          {po.status === "APPROVED_L2" && isPurchaser && (
                            <button
                              onClick={() => handleSendToSupplier(po.id)}
                              className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600"
                              title="Send / Issue to Supplier"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Receive Goods (GRN) Shortcut */}
                          {(po.status === "SENT_TO_SUPPLIER" || po.status === "APPROVED_L2" || po.status === "PARTIALLY_RECEIVED") && (
                            <button
                              onClick={() => router.push(`/ui/manager/invGRN?poId=${po.id}`)}
                              className="p-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                              title="Receive Goods (GRN)"
                            >
                              <PackageCheck className="w-4 h-4" />
                            </button>
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

      {/* ─── Approved Requisition Picker Modal ─────────────────── */}
      {prPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Select Approved Purchase Requisition to Convert
                </h2>
              </div>
              <button onClick={() => setPrPickerModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The following purchase requisitions have been fully approved by the department and finance heads, and are waiting to be converted into Purchase Orders:
              </p>

              {loadingPrs ? (
                <div className="text-center py-12 text-gray-400">Loading approved requisitions...</div>
              ) : approvedPrs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                  <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">No unconverted approved requisitions found.</p>
                  <p className="text-xs text-gray-400 mt-1">Make sure purchase requisitions have reached final approval.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {approvedPrs.map(pr => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{pr.requisitionNumber}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">APPROVED</span>
                          <span className="text-xs text-gray-500">• {pr.requestedDate}</span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          Store: <strong className="text-gray-800 dark:text-gray-100">{pr.store?.storeName || "—"}</strong>
                          <span className="mx-2">|</span>
                          Requested By: <strong>{pr.requestedBy}</strong>
                          <span className="mx-2">|</span>
                          Est. Total: <strong className="text-indigo-600 dark:text-indigo-400 font-mono">ETB {Number(pr.totalEstimatedAmount || 0).toLocaleString()}</strong>
                        </div>
                        {pr.remarks && <p className="text-xs text-gray-400 italic">&ldquo;{pr.remarks}&rdquo;</p>}
                      </div>

                      <button
                        onClick={() => handleSelectPr(pr)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-semibold shadow flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Convert to PO
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => setPrPickerModal(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create Purchase Order Modal ────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Purchase Order</h2>
                <p className="text-xs text-gray-500">Create vendor purchase order with real-time tax & line pricing</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Sourcing derivation banner */}
              {selectedPr && (
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-purple-900 dark:text-purple-200 font-medium">
                      Derived from Requisition <strong className="font-mono">{selectedPr.requisitionNumber}</strong> ({selectedPr.store?.storeName})
                    </span>
                  </div>
                  <button
                    onClick={clearSelectedPr}
                    className="text-purple-600 dark:text-purple-400 hover:underline text-[11px] font-semibold"
                  >
                    Clear Sourcing
                  </button>
                </div>
              )}

              {/* Core Commercial Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier (Vendor) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.supplierId}
                    onChange={(e) => {
                      setForm({ ...form, supplierId: e.target.value });
                      if (formErrors.supplierId) {
                        setFormErrors({ ...formErrors, supplierId: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-colors ${
                      formErrors.supplierId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.supplierCode ? `${s.supplierCode} — ` : ""}{s.supplierName}
                      </option>
                    ))}
                  </select>
                  {formErrors.supplierId && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.supplierId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Receiving Store <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.storeId}
                    onChange={(e) => {
                      setForm({ ...form, storeId: e.target.value });
                      if (formErrors.storeId) {
                        setFormErrors({ ...formErrors, storeId: null });
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm transition-colors ${
                      formErrors.storeId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <option value="">Select Store</option>
                    {stores.map(st => (
                      <option key={st.id} value={st.id}>{st.storeName}</option>
                    ))}
                  </select>
                  {formErrors.storeId && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {formErrors.storeId}
                    </p>
                  )}
                </div>
              </div>

              {formErrors.general && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{formErrors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms</label>
                  <input
                    value={form.paymentTerms}
                    onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                    placeholder="e.g. Net 30, Cash On Delivery"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Terms</label>
                  <input
                    value={form.deliveryTerms}
                    onChange={(e) => setForm({ ...form, deliveryTerms: e.target.value })}
                    placeholder="e.g. Delivered to Store, FOB"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks / Note</label>
                <input
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Optional internal remarks or procurement purpose"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Line Items */}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Order Line Items</h3>
                  <span className="text-xs text-gray-500">Confirm quoted commercial unit prices</span>
                </div>

                {form.lines.map((line, idx) => {
                  const lineTotal = (parseFloat(line.orderedQuantity) || 0) * (parseFloat(line.unitPrice) || 0);
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-start bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-500 mb-1">
                          Item <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={line.itemId}
                          onChange={(e) => updateLine(idx, "itemId", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                            formErrors.lines?.[idx]?.itemId ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          <option value="">Select Item</option>
                          {items.map(i => (
                            <option key={i.id} value={i.id}>{i.itemCode ? `${i.itemCode} — ` : ""}{i.itemName}</option>
                          ))}
                        </select>
                        {formErrors.lines?.[idx]?.itemId && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.lines[idx].itemId}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="0.0001"
                          value={line.orderedQuantity}
                          onChange={(e) => updateLine(idx, "orderedQuantity", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right font-mono transition-colors ${
                            formErrors.lines?.[idx]?.orderedQuantity ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {formErrors.lines?.[idx]?.orderedQuantity && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.lines[idx].orderedQuantity}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">
                          Unit Price (ETB) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(idx, "unitPrice", e.target.value)}
                          className={`w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right font-mono transition-colors ${
                            formErrors.lines?.[idx]?.unitPrice ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                        {formErrors.lines?.[idx]?.unitPrice && (
                          <p className="text-[11px] text-red-600 dark:text-red-400 mt-1">{formErrors.lines[idx].unitPrice}</p>
                        )}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-500 mb-1">Line Total</label>
                        <div className="px-2 py-1.5 text-sm font-mono font-semibold text-right text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg truncate">
                          {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-center pt-6">
                        {form.lines.length > 1 && (
                          <button
                            onClick={() => removeLine(idx)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Remove Line"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={addLine}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Item Line
                </button>
              </div>

              {/* Tax & Grand Total Summary Bar */}
              <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl space-y-2 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                    ETB {liveCalculations.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">VAT Rate (%):</span>
                    <input
                      type="number"
                      value={form.vatRate}
                      onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                      className="w-16 px-2 py-0.5 text-xs border border-gray-300 rounded bg-white dark:bg-gray-700 font-mono text-right"
                    />
                  </div>
                  <span className="font-mono font-medium text-gray-800 dark:text-gray-200">
                    ETB {liveCalculations.vat.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-base pt-2 border-t border-gray-200 dark:border-gray-600 font-bold">
                  <span className="text-gray-900 dark:text-white">Grand Total:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    ETB {liveCalculations.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 sticky bottom-0">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Creating..." : "Create Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal with Stepper & Chronological Audit Trail ─ */}
      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white font-mono">{detailModal.poNumber}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>
                  {detailModal.status?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(detailModal.status === "APPROVED_L2" || detailModal.status === "SENT_TO_SUPPLIER" || detailModal.status === "PARTIALLY_RECEIVED" || detailModal.status === "FULLY_RECEIVED") && (
                  <button
                    onClick={() => handlePrintPdf(detailModal)}
                    disabled={printingId === detailModal.id}
                    className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-200 dark:border-purple-700 disabled:opacity-50"
                    title="Print Vendor PO Note"
                  >
                    <Printer className={`w-3.5 h-3.5 ${printingId === detailModal.id ? "animate-spin" : ""}`} />
                    {printingId === detailModal.id ? "Preparing PDF..." : "Print PO PDF"}
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
                rejectionReason={detailModal.remarks}
              />

              {/* Meta Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm bg-gray-50 dark:bg-gray-700/20 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-gray-500 text-xs block">Supplier (Vendor)</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{detailModal.supplier?.supplierName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Receiving Store</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{detailModal.store?.storeName || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Ref Requisition</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400 font-mono">
                    {detailModal.requisition?.requisitionNumber || "Direct PO"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Grand Total</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                    ETB {Number(detailModal.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Order Date</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{detailModal.orderDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Expected Delivery</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{detailModal.expectedDeliveryDate || "Standard"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Payment Terms</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{detailModal.paymentTerms || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block">Delivery Terms</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{detailModal.deliveryTerms || "—"}</span>
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
                    {detailModal.status === "DRAFT" ? "Purchase order has not been submitted for approval yet." : "No workflow actions recorded yet."}
                  </div>
                )}
              </div>

              {/* Line Items Table with Receiving Progress */}
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Ordered Line Items</h4>
                <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-right">Ordered Qty</th>
                      <th className="px-4 py-2 text-right">Received Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Total (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(detailModal.lines || []).map((l, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-gray-800 dark:text-gray-200 font-medium">
                          {l.item?.itemCode ? `${l.item.itemCode} — ` : ""}{l.item?.itemName}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{l.orderedQuantity}</td>
                        <td className="px-4 py-2 text-right font-mono">
                          <span className={Number(l.receivedQuantity || 0) >= Number(l.orderedQuantity) ? "text-green-600 font-bold" : "text-gray-500"}>
                            {l.receivedQuantity || 0}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right font-mono">ETB {Number(l.unitPrice).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold">ETB {Number(l.totalPrice).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <td colSpan={4} className="px-4 py-1.5 text-right text-xs text-gray-500">Subtotal:</td>
                      <td className="px-4 py-1.5 text-right font-mono font-medium">
                        ETB {Number(detailModal.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-1.5 text-right text-xs text-gray-500">VAT ({detailModal.vatRate}%):</td>
                      <td className="px-4 py-1.5 text-right font-mono font-medium">
                        ETB {Number(detailModal.vatAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200 dark:border-gray-600">
                      <td colSpan={4} className="px-4 py-2 text-right font-bold">Grand Total:</td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        ETB {Number(detailModal.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                {detailModal.status === "APPROVED_L2" && "Approved — Ready for Supplier Issuance"}
                {detailModal.status === "SENT_TO_SUPPLIER" && "Issued to Vendor — Awaiting Goods Receipt (GRN)"}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                  Close
                </button>

                {/* Print PDF */}
                {(detailModal.status === "APPROVED_L2" || detailModal.status === "SENT_TO_SUPPLIER" || detailModal.status === "PARTIALLY_RECEIVED" || detailModal.status === "FULLY_RECEIVED") && (
                  <button
                    onClick={() => handlePrintPdf(detailModal)}
                    disabled={printingId === detailModal.id}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-1.5 shadow"
                  >
                    <Printer className={`w-4 h-4 ${printingId === detailModal.id ? "animate-spin" : ""}`} />
                    Print PDF
                  </button>
                )}

                {/* Submit Draft */}
                {detailModal.status === "DRAFT" && isPurchaser && (
                  <button
                    onClick={() => handleSubmitOrder(detailModal.id)}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit for Approval
                  </button>
                )}

                {/* Approver Actions */}
                {(detailModal.status === "SUBMITTED" || detailModal.status === "APPROVED_L1") && canUserApprove(detailModal.id) && (
                  <>
                    <button
                      onClick={() => setRejectModal(detailModal)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 text-sm font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => setApproveModal(detailModal)}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold shadow flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Approve Step
                    </button>
                  </>
                )}

                {/* Send to Supplier */}
                {detailModal.status === "APPROVED_L2" && isPurchaser && (
                  <button
                    onClick={() => handleSendToSupplier(detailModal.id)}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold shadow flex items-center gap-2"
                  >
                    <Truck className="w-4 h-4" /> Issue to Supplier
                  </button>
                )}

                {/* Receive Goods (GRN) Shortcut */}
                {(detailModal.status === "SENT_TO_SUPPLIER" || detailModal.status === "APPROVED_L2" || detailModal.status === "PARTIALLY_RECEIVED") && (
                  <button
                    onClick={() => {
                      const targetId = detailModal.id;
                      setDetailModal(null);
                      router.push(`/ui/manager/invGRN?poId=${targetId}`);
                    }}
                    className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm font-semibold shadow flex items-center gap-2"
                  >
                    <PackageCheck className="w-4 h-4" /> Receive Goods (GRN)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Approve Modal ───────────────────────────────────── */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              Approve Purchase Order
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Confirm approval for PO <strong className="font-mono">{approveModal.poNumber}</strong> (ETB {Number(approveModal.grandTotal || 0).toLocaleString()}).
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Approval Comments (Optional)</label>
              <textarea
                value={approveComments}
                onChange={(e) => setApproveComments(e.target.value)}
                placeholder="e.g. Budget verified, approved for vendor issuance"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setApproveModal(null); setApproveComments(""); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 shadow disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Approving..." : "Confirm Approval"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Modal ────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Reject Purchase Order
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Please state the reason for rejecting PO <strong className="font-mono">{rejectModal.poNumber}</strong>.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  if (rejectErrors.rejectReason) {
                    setRejectErrors(prev => ({ ...prev, rejectReason: "" }));
                  }
                }}
                placeholder="Enter mandatory rejection reason..."
                rows={3}
                className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                  rejectErrors.rejectReason ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {rejectErrors.rejectReason && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{rejectErrors.rejectReason}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); setRejectErrors({}); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting}
                className="px-5 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 shadow disabled:opacity-50 flex items-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Rejecting..." : "Reject Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvPurchaseOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Purchase Orders...</div>}>
      <InvPurchaseOrdersContent />
    </Suspense>
  );
}
