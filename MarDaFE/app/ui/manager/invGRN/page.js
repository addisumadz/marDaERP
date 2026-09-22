"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import invGrnService from "../../../lib/invGrnService";
import invPurchaseOrderService from "../../../lib/invPurchaseOrderService";
import invStoreService from "../../../lib/invStoreService";
import fncAccountService from "../../../lib/fncAccountService";
import fncBillingAccountMapService from "../../../lib/fncBillingAccountMapService";
import { CompanyProfileService } from "../../../lib/companyProfileService";
import { generateGrnPdf } from "./grnPdf";
import {
  PackageCheck,
  Plus,
  X,
  Eye,
  Check,
  Search,
  Printer,
  FileCheck,
  Building2,
  Calendar,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Link2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Loader2,
  ArrowRight,
  AlertTriangle
} from "lucide-react";

const statusColors = {
  DRAFT: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700",
  CONFIRMED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-700"
};

function getUomString(item) {
  if (!item) return "Pcs";
  const uom = item.unitOfMeasure || item.uom;
  if (!uom) return "Pcs";
  if (typeof uom === "string") return uom;
  if (typeof uom === "object") {
    return uom.unitCode || uom.unitName || uom.unitNameAm || "Pcs";
  }
  return "Pcs";
}

function InvGRNContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlPoId = searchParams.get("poId");

  const [grns, setGrns] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [poPickerOpen, setPoPickerOpen] = useState(false);
  const [openPos, setOpenPos] = useState([]);
  const [loadingOpenPos, setLoadingOpenPos] = useState(false);
  const [poSearch, setPoSearch] = useState("");
  const [printingId, setPrintingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Selected PO & Form
  const [selectedPo, setSelectedPo] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [form, setForm] = useState({
    purchaseOrderId: "",
    storeId: "",
    supplierId: "",
    supplierInvoiceNumber: "",
    remarks: "",
    lines: []
  });
  const [formErrors, setFormErrors] = useState({});

  // Finance Integration Accounts & Mappings
  const [accounts, setAccounts] = useState([]);
  const [accountMappings, setAccountMappings] = useState({});

  useEffect(() => {
    loadStores();
    loadFinanceMappings();
    loadCompanyProfile();
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [page]);

  // Handle URL query parameter ?poId=xxx
  useEffect(() => {
    if (urlPoId) {
      handleSelectPOById(urlPoId);
    }
  }, [urlPoId]);

  const loadStores = async () => {
    try {
      const activeStores = await invStoreService.getAllActive();
      setStores(activeStores || []);
    } catch (e) {
      console.warn("Could not load stores:", e);
    }
  };

  const loadCompanyProfile = async () => {
    try {
      const cpService = new CompanyProfileService();
      const cp = await cpService.getLatest();
      setCompanyProfile(cp);
    } catch (e) {}
  };

  const loadFinanceMappings = async () => {
    try {
      const [accs, savedMappings] = await Promise.all([
        fncAccountService.getPostableAccounts().catch(() => []),
        fncBillingAccountMapService.getAllMappings().catch(() => [])
      ]);
      setAccounts(accs || []);

      const map = {};
      if (Array.isArray(savedMappings)) {
        savedMappings.forEach((m) => {
          if (m.mappingKey) map[m.mappingKey] = m.accountId;
        });
      }
      setAccountMappings(map);
    } catch (e) {
      console.warn("Could not load finance mappings:", e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invGrnService.getAll({ page, size: 15 });
      setGrns(data?.content || []);
      setTotalPages(data?.totalPages || 0);
    } catch (e) {
      toast.error("Failed to load Goods Received Notes");
    }
    setLoading(false);
  };

  const loadOpenPOs = async () => {
    setLoadingOpenPos(true);
    try {
      const pos = await invGrnService.getOpenPurchaseOrders();
      setOpenPos(pos || []);
    } catch (e) {
      toast.error("Failed to load open Purchase Orders");
    }
    setLoadingOpenPos(false);
  };

  const handleOpenPoPicker = () => {
    loadOpenPOs();
    setPoPickerOpen(true);
  };

  const handleSelectPOById = async (poId) => {
    try {
      const po = await invPurchaseOrderService.getById(poId);
      if (!po) {
        toast.error("Purchase Order not found");
        return;
      }
      populateFormFromPo(po);
    } catch (e) {
      toast.error("Failed to load PO details");
    }
  };

  const populateFormFromPo = (po) => {
    setSelectedPo(po);

    // Populate lines with remaining unreceived quantities
    const lines = (po.lines || []).map((l) => {
      const ordered = Number(l.orderedQuantity || 0);
      const received = Number(l.receivedQuantity || 0);
      const remaining = Math.max(0, ordered - received);

      return {
        itemId: l.item?.id,
        poLineId: l.id,
        itemCode: l.item?.itemCode,
        itemName: l.item?.itemName,
        itemNameAm: l.item?.itemNameAm || l.item?.itemNameAmharic || "",
        uom: getUomString(l.item),
        orderedQuantity: ordered,
        alreadyReceived: received,
        remainingBalance: remaining,
        receivedQuantity: remaining,
        acceptedQuantity: remaining,
        rejectedQuantity: 0,
        unitCost: Number(l.unitPrice || 0),
        batchNumber: "",
        expiryDate: "",
        rejectionReason: "",
      };
    });

    setForm({
      purchaseOrderId: po.id,
      storeId: po.store?.id || "",
      supplierId: po.supplier?.id || "",
      supplierInvoiceNumber: "",
      remarks: `Goods received against PO ${po.poNumber}`,
      lines,
    });

    setFormErrors({});
    setPoPickerOpen(false);
    setCreateModalOpen(true);
  };

  const updateLine = (idx, field, value) => {
    const updated = [...form.lines];
    updated[idx][field] = value;

    if (field === "receivedQuantity") {
      const rec = Number(value) || 0;
      const rej = Number(updated[idx].rejectedQuantity) || 0;
      updated[idx].acceptedQuantity = Math.max(0, rec - rej);
    } else if (field === "rejectedQuantity") {
      const rej = Number(value) || 0;
      const rec = Number(updated[idx].receivedQuantity) || 0;
      updated[idx].acceptedQuantity = Math.max(0, rec - rej);
    }

    setForm({ ...form, lines: updated });

    if (formErrors.lineErrors?.[idx] || formErrors.lines) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        if (copy.lineErrors?.[idx]) {
          const updatedLineErrs = { ...copy.lineErrors[idx] };
          delete updatedLineErrs[field];
          if (field === "rejectedQuantity" && (Number(value) || 0) === 0) {
            delete updatedLineErrs.rejectionReason;
          }
          if (Object.keys(updatedLineErrs).length === 0) {
            delete copy.lineErrors[idx];
          } else {
            copy.lineErrors[idx] = updatedLineErrs;
          }
          if (Object.keys(copy.lineErrors).length === 0) {
            delete copy.lineErrors;
          }
        }
        if (copy.lines && (field === "acceptedQuantity" || field === "receivedQuantity")) {
          delete copy.lines;
        }
        return copy;
      });
    }
  };

  // Calculations for Create Modal
  const createCalculations = useMemo(() => {
    let totalAcceptedUnits = 0;
    let totalRejectedUnits = 0;
    let grandTotalValue = 0;

    (form.lines || []).forEach((l) => {
      const acc = Number(l.acceptedQuantity || 0);
      const rej = Number(l.rejectedQuantity || 0);
      const cost = Number(l.unitCost || 0);

      totalAcceptedUnits += acc;
      totalRejectedUnits += rej;
      grandTotalValue += acc * cost;
    });

    return { totalAcceptedUnits, totalRejectedUnits, grandTotalValue };
  }, [form.lines]);

  // Dynamic Finance Accounts for GRN Preview
  const financePreview = useMemo(() => {
    const drAccountId = accountMappings["INV_DR_GRN_ASSET"];
    const crAccountId = accountMappings["INV_CR_GRN_PAYABLE"];

    const drAccount = accounts.find((a) => a.id === drAccountId) ||
      accounts.find((a) => a.accountCode === "1300" || a.accountCode.startsWith("1300")) || {
        accountCode: "1300",
        accountName: "Inventory Asset (Default)",
        isDefault: true,
      };

    const crAccount = accounts.find((a) => a.id === crAccountId) ||
      accounts.find((a) => a.accountCode === "2100" || a.accountCode.startsWith("2100")) || {
        accountCode: "2100",
        accountName: "Accounts Payable / GR-IR (Default)",
        isDefault: true,
      };

    const isCustomMapped = !!(drAccountId && crAccountId);

    return { drAccount, crAccount, isCustomMapped };
  }, [accountMappings, accounts]);

  const validateForm = () => {
    const errors = {};
    const lineErrors = {};

    if (!form.purchaseOrderId) {
      errors.purchaseOrderId = "Purchase Order is required. Please select an approved PO.";
    }
    if (!form.storeId) {
      errors.storeId = "Receiving Store is required.";
    }
    if (!form.supplierInvoiceNumber || !form.supplierInvoiceNumber.trim()) {
      errors.supplierInvoiceNumber = "Supplier Delivery Note / Invoice Number is mandatory.";
    }

    if (!form.lines || form.lines.length === 0) {
      errors.lines = "At least one item line is required.";
    } else {
      let hasAccepted = false;
      form.lines.forEach((l, idx) => {
        const itemErr = {};
        const acc = Number(l.acceptedQuantity);
        const rej = Number(l.rejectedQuantity);
        const rec = Number(l.receivedQuantity);

        if (isNaN(rec) || rec < 0) {
          itemErr.receivedQuantity = "Delivered qty must be ≥ 0";
        }
        if (isNaN(acc) || acc < 0) {
          itemErr.acceptedQuantity = "Accepted qty must be ≥ 0";
        } else if (acc > 0) {
          hasAccepted = true;
        }

        if (isNaN(rej) || rej < 0) {
          itemErr.rejectedQuantity = "Rejected qty must be ≥ 0";
        } else if (rej > 0 && (!l.rejectionReason || !l.rejectionReason.trim())) {
          itemErr.rejectionReason = "Rejection reason is mandatory when rejected qty > 0";
        }

        if (Object.keys(itemErr).length > 0) {
          lineErrors[idx] = itemErr;
        }
      });

      if (!hasAccepted) {
        errors.lines = "At least one item must have an accepted quantity greater than 0.";
      }
    }

    if (Object.keys(lineErrors).length > 0) {
      errors.lineErrors = lineErrors;
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      const summaryMsg = errors.purchaseOrderId || errors.supplierInvoiceNumber || errors.lines || "Please fill in all mandatory fields highlighted in red.";
      toast.error(summaryMsg);
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await invGrnService.create(form);
      toast.success("Goods Received Note created as DRAFT");
      setCreateModalOpen(false);
      setSelectedPo(null);
      setFormErrors({});
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to create GRN");
    }
    setSubmitting(false);
  };

  const handleConfirmGrn = async (grnId) => {
    setSubmitting(true);
    try {
      const confirmed = await invGrnService.confirm(grnId);
      toast.success("GRN Confirmed: Stock on Hand incremented & Finance Journal Entry posted!");
      setConfirmModal(null);
      if (detailModal && detailModal.id === grnId) {
        setDetailModal(confirmed);
      }
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to confirm GRN");
    }
    setSubmitting(false);
  };

  const handlePrintPdf = async (grn) => {
    setPrintingId(grn.id);
    try {
      await generateGrnPdf(grn, companyProfile, { preview: true });
      toast.success("GRN PDF generated successfully");
    } catch (e) {
      console.error("GRN PDF generation error:", e);
      toast.error("Error generating GRN PDF Note: " + (e.message || "Unknown error"));
    } finally {
      setPrintingId(null);
    }
  };

  const viewDetail = async (id) => {
    try {
      const full = await invGrnService.getById(id);
      setDetailModal(full);
    } catch (e) {
      toast.error("Failed to load GRN details");
    }
  };

  // Filtered Table Rows
  const filteredGrns = useMemo(() => {
    return grns.filter((g) => {
      if (filterStatus && g.status !== filterStatus) return false;
      if (filterStore && String(g.store?.id || g.storeId) !== String(filterStore)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const num = (g.grnNumber || "").toLowerCase();
        const poNum = (g.purchaseOrder?.poNumber || "").toLowerCase();
        const supp = (g.supplier?.supplierName || "").toLowerCase();
        const invNo = (g.supplierInvoiceNumber || "").toLowerCase();
        if (!num.includes(q) && !poNum.includes(q) && !supp.includes(q) && !invNo.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [grns, filterStatus, filterStore, searchQuery]);

  // Metrics
  const metrics = useMemo(() => {
    const total = grns.length;
    const confirmed = grns.filter((g) => g.status === "CONFIRMED").length;
    const draft = grns.filter((g) => g.status === "DRAFT").length;
    return { total, confirmed, draft };
  }, [grns]);

  return (
    <div className="space-y-6">
      {/* ─── Header ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 rounded-xl">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Goods Received Notes (GRN)
              </h1>
              <p className="text-xs font-amharic text-gray-500 dark:text-gray-400">
                የዕቃ መረከቢያ ሰነዶች አስተዳደር (Receiving Workbench & Stock Intake)
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Receive physical vendor deliveries against Purchase Orders, inspect items, update inventory on hand, and automatically post balanced General Ledger journal vouchers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/ui/manager/fncInventoryAccountMap"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-medium transition-all"
            title="Configure Chart of Accounts for Inventory"
          >
            <Link2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Account Mapping
          </Link>
          <button
            onClick={handleOpenPoPicker}
            className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors shadow-sm font-medium text-sm"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Select Purchase Order
          </button>
          <button
            onClick={() => {
              setSelectedPo(null);
              setFormErrors({});
              setForm({
                purchaseOrderId: "",
                storeId: "",
                supplierId: "",
                supplierInvoiceNumber: "",
                remarks: "",
                lines: [],
              });
              handleOpenPoPicker();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 shadow-md transition-all font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New GRN
          </button>
        </div>
      </div>

      {/* ─── Metric Badges ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Goods Received</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Confirmed & Stock Posted</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.confirmed}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Draft / Pending Intake</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{metrics.draft}</div>
          </div>
        </div>
      </div>

      {/* ─── Filters & Search ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search GRN #, PO #, Supplier, or Invoice #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT (ረቂቅ)</option>
          <option value="CONFIRMED">CONFIRMED (የተረጋገጠ)</option>
        </select>

        <select
          value={filterStore}
          onChange={(e) => {
            setFilterStore(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">All Stores</option>
          {stores.map((st) => (
            <option key={st.id} value={st.id}>
              {st.storeName}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Main GRN Table ─────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3.5 text-left">GRN Number</th>
                <th className="px-5 py-3.5 text-left">PO Reference</th>
                <th className="px-5 py-3.5 text-left">Supplier</th>
                <th className="px-5 py-3.5 text-left">Receiving Store</th>
                <th className="px-5 py-3.5 text-left">Date</th>
                <th className="px-5 py-3.5 text-right">Received Amount</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">GL Journal</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-2" />
                    Loading Goods Received Notes...
                  </td>
                </tr>
              ) : filteredGrns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                    <PackageCheck className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    No Goods Received Notes found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredGrns.map((g) => {
                  const jvNumber = g.journalEntry?.entryNumber || g.journalEntry?.referenceNumber;
                  const isConfirmed = g.status === "CONFIRMED";

                  return (
                    <tr
                      key={g.id}
                      className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-semibold text-teal-700 dark:text-teal-400">
                        {g.grnNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        {g.purchaseOrder ? (
                          <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                            {g.purchaseOrder.poNumber}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                        {g.supplier?.supplierName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                        {g.store?.storeName || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {g.receivedDate}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        ETB {Number(g.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            statusColors[g.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {g.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {jvNumber ? (
                          <Link
                            href="/ui/manager/fncJournalEntries"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 hover:underline"
                            title="View posted General Ledger Journal Entry"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {jvNumber}
                          </Link>
                        ) : isConfirmed ? (
                          <span className="text-xs text-gray-400">GL Integrated</span>
                        ) : (
                          <span className="text-xs text-amber-500 italic">Pending Confirm</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Detail */}
                          <button
                            onClick={() => viewDetail(g.id)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600"
                            title="View GRN Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Print PDF Note */}
                          <button
                            onClick={() => handlePrintPdf(g)}
                            disabled={printingId === g.id}
                            className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 disabled:opacity-50"
                            title="Print Bilingual GRN Receipt PDF"
                          >
                            <Printer className={`w-4 h-4 ${printingId === g.id ? "animate-spin" : ""}`} />
                          </button>

                          {/* Confirm GRN (DRAFT only) */}
                          {g.status === "DRAFT" && (
                            <button
                              onClick={() => setConfirmModal(g)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600"
                              title="Confirm Receipt & Post Stock/Finance"
                            >
                              <Check className="w-4 h-4" />
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
            <span className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── PO Sourcing Picker Modal ───────────────────────── */}
      {poPickerOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Select Purchase Order to Receive
                </h3>
              </div>
              <button
                onClick={() => setPoPickerOpen(false)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter POs by number or supplier..."
                  value={poSearch}
                  onChange={(e) => setPoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {loadingOpenPos ? (
                <div className="py-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-600" />
                  Loading eligible Purchase Orders...
                </div>
              ) : openPos.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  No open Purchase Orders ready for receipt. Orders must be in <strong>SENT_TO_SUPPLIER</strong>, <strong>APPROVED_L2</strong>, or <strong>PARTIALLY_RECEIVED</strong> status.
                </div>
              ) : (
                openPos
                  .filter((po) => {
                    if (!poSearch) return true;
                    const q = poSearch.toLowerCase();
                    return (
                      (po.poNumber || "").toLowerCase().includes(q) ||
                      (po.supplier?.supplierName || "").toLowerCase().includes(q)
                    );
                  })
                  .map((po) => (
                    <div
                      key={po.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                            {po.poNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[po.status] || "bg-gray-100"}`}>
                            {po.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          <strong>Supplier:</strong> {po.supplier?.supplierName || "—"} &bull;{" "}
                          <strong>Store:</strong> {po.store?.storeName || "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Order Date: {po.orderDate} &bull; Total Value: ETB {Number(po.grandTotal || 0).toLocaleString()} &bull; {po.lines?.length || 0} line item(s)
                        </div>
                      </div>

                      <button
                        onClick={() => populateFormFromPo(po)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-xs font-semibold shadow flex items-center gap-1.5 whitespace-nowrap"
                      >
                        Select & Receive <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex justify-end">
              <button
                onClick={() => setPoPickerOpen(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Create / Receive Workbench Modal ───────────────── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-2.5">
                <PackageCheck className="w-6 h-6 text-teal-600" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Receive Goods & Create GRN
                  </h2>
                  <p className="text-xs text-gray-500">
                    Physical Stock Intake & Quality Inspection Workbench
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setSelectedPo(null);
                  setFormErrors({});
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* PO & Sourcing Summary Card */}
              {selectedPo ? (
                <div className="bg-teal-50/50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                      Sourced Purchase Order
                    </span>
                    <button
                      onClick={handleOpenPoPicker}
                      className="text-xs text-teal-700 hover:underline font-medium"
                    >
                      Change PO
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400 text-xs block">PO Number</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        {selectedPo.poNumber}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Supplier</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {selectedPo.supplier?.supplierName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">Receiving Store</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedPo.store?.storeName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs block">PO Status</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800 dark:bg-teal-800 dark:text-teal-200">
                        {selectedPo.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  formErrors.purchaseOrderId ? "border-red-400 bg-red-50/20 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600"
                }`}>
                  <FileCheck className={`w-8 h-8 mx-auto mb-2 ${formErrors.purchaseOrderId ? "text-red-500" : "text-gray-400"}`} />
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    No Purchase Order selected. Standard ERP receiving must be referenced to an approved PO.
                  </p>
                  {formErrors.purchaseOrderId && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mb-3">
                      {formErrors.purchaseOrderId}
                    </p>
                  )}
                  <button
                    onClick={handleOpenPoPicker}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-teal-700"
                  >
                    Select Purchase Order
                  </button>
                </div>
              )}

              {/* Vendor Invoice & Receipt Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Supplier Delivery Note / Invoice Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-981 or DN-0044"
                    value={form.supplierInvoiceNumber}
                    onChange={(e) => {
                      setForm({ ...form, supplierInvoiceNumber: e.target.value });
                      if (formErrors.supplierInvoiceNumber) {
                        setFormErrors((prev) => ({ ...prev, supplierInvoiceNumber: "" }));
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors ${
                      formErrors.supplierInvoiceNumber ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                    }`}
                  />
                  {formErrors.supplierInvoiceNumber && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">{formErrors.supplierInvoiceNumber}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Receipt Remarks / Store Notes
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received in good condition at Main Store"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Receiving & Inspection Lines Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                    Line Item Quality Inspection & Quantities
                  </h3>
                  <span className="text-xs text-gray-500">
                    {form.lines?.length || 0} line item(s) to verify
                  </span>
                </div>

                {formErrors.lines && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{formErrors.lines}</span>
                  </div>
                )}

                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase">
                      <tr>
                        <th className="px-3 py-2.5 text-left">Item Description</th>
                        <th className="px-3 py-2.5 text-center w-14">UOM</th>
                        <th className="px-3 py-2.5 text-right w-16">Ordered</th>
                        <th className="px-3 py-2.5 text-right w-16">Unreceived</th>
                        <th className="px-3 py-2.5 text-right w-20">Delivered</th>
                        <th className="px-3 py-2.5 text-right w-20 text-emerald-600">Accepted</th>
                        <th className="px-3 py-2.5 text-right w-20 text-red-600">Rejected</th>
                        <th className="px-3 py-2.5 text-right w-24">Unit Cost</th>
                        <th className="px-3 py-2.5 text-right w-28">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {form.lines.map((line, idx) => (
                        <React.Fragment key={idx}>
                          <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {line.itemCode ? <span className="font-mono text-teal-600 mr-1">[{line.itemCode}]</span> : null}
                                {line.itemName}
                              </div>
                              {line.itemNameAm && (
                                <div className="text-[11px] text-gray-400">{line.itemNameAm}</div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-500">
                              {typeof line.uom === "object" ? (line.uom?.unitCode || line.uom?.unitName || "Pcs") : (line.uom || "Pcs")}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-gray-500">
                              {line.orderedQuantity}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-teal-600 font-semibold">
                              {line.remainingBalance}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                value={line.receivedQuantity}
                                onChange={(e) => updateLine(idx, "receivedQuantity", e.target.value)}
                                className={`w-16 px-1.5 py-1 text-right font-mono text-xs border rounded bg-white dark:bg-gray-700 transition-colors ${
                                  formErrors.lineErrors?.[idx]?.receivedQuantity ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-gray-300 dark:border-gray-600"
                                }`}
                              />
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                value={line.acceptedQuantity}
                                onChange={(e) => updateLine(idx, "acceptedQuantity", e.target.value)}
                                className={`w-16 px-1.5 py-1 text-right font-mono font-bold text-xs border rounded bg-white dark:bg-gray-700 text-emerald-600 transition-colors ${
                                  formErrors.lineErrors?.[idx]?.acceptedQuantity ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-emerald-300 dark:border-emerald-700"
                                }`}
                              />
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <input
                                type="number"
                                min="0"
                                value={line.rejectedQuantity}
                                onChange={(e) => updateLine(idx, "rejectedQuantity", e.target.value)}
                                className={`w-16 px-1.5 py-1 text-right font-mono text-xs border rounded bg-white dark:bg-gray-700 text-red-600 transition-colors ${
                                  formErrors.lineErrors?.[idx]?.rejectedQuantity ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-red-300 dark:border-red-700"
                                }`}
                              />
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                              ETB {Number(line.unitCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-white">
                              ETB {(Number(line.acceptedQuantity || 0) * Number(line.unitCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>

                          {/* Secondary Row for Batch #, Expiry Date, and Rejection Reason */}
                          <tr className="bg-gray-50/40 dark:bg-gray-750/30 border-b border-gray-100 dark:border-gray-700">
                            <td colSpan={9} className="px-3 py-1.5">
                              <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500">
                                <div className="flex items-center gap-1">
                                  <span>Batch #:</span>
                                  <input
                                    type="text"
                                    placeholder="Optional Batch"
                                    value={line.batchNumber}
                                    onChange={(e) => updateLine(idx, "batchNumber", e.target.value)}
                                    className="px-1.5 py-0.5 border rounded text-[11px] bg-white dark:bg-gray-700 w-28"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>Expiry:</span>
                                  <input
                                    type="date"
                                    value={line.expiryDate}
                                    onChange={(e) => updateLine(idx, "expiryDate", e.target.value)}
                                    className="px-1.5 py-0.5 border rounded text-[11px] bg-white dark:bg-gray-700"
                                  />
                                </div>
                                {Number(line.rejectedQuantity) > 0 && (
                                  <div className="flex flex-col flex-1">
                                    <div className="flex items-center gap-1 text-red-600">
                                      <span className="font-semibold">Rejection Reason *:</span>
                                      <input
                                        type="text"
                                        placeholder="Specify defect, breakage, or discrepancy..."
                                        value={line.rejectionReason}
                                        onChange={(e) => updateLine(idx, "rejectionReason", e.target.value)}
                                        className={`px-2 py-0.5 border rounded text-[11px] bg-white dark:bg-gray-700 flex-1 text-red-700 transition-colors ${
                                          formErrors.lineErrors?.[idx]?.rejectionReason ? "border-red-500 ring-1 ring-red-500 bg-red-50/20" : "border-red-300"
                                        }`}
                                      />
                                    </div>
                                    {formErrors.lineErrors?.[idx]?.rejectionReason && (
                                      <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                                        {formErrors.lineErrors[idx].rejectionReason}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── Financial Posting Preview (General Ledger) ─── */}
              <div className="bg-gradient-to-r from-blue-50/70 to-teal-50/70 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200 uppercase tracking-wider">
                      General Ledger Posting Preview (Double-Entry)
                    </span>
                  </div>
                  {!financePreview.isCustomMapped && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Using standard chart defaults
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center gap-1 font-bold text-blue-600 mb-1">
                      <TrendingDown className="w-3.5 h-3.5" /> Debit (DR) &mdash; Inventory Asset
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {financePreview.drAccount.accountCode} &bull; {financePreview.drAccount.accountName}
                    </div>
                    <div className="text-right font-mono font-bold text-blue-600 mt-1">
                      ETB {createCalculations.grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-teal-100 dark:border-teal-900">
                    <div className="flex items-center gap-1 font-bold text-emerald-600 mb-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Credit (CR) &mdash; Accounts Payable / GR-IR
                    </div>
                    <div className="text-gray-900 dark:text-white font-medium">
                      {financePreview.crAccount.accountCode} &bull; {financePreview.crAccount.accountName}
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-600 mt-1">
                      ETB {createCalculations.grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {!financePreview.isCustomMapped && (
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    Want custom GL accounts? Configure them in{" "}
                    <Link
                      href="/ui/manager/fncInventoryAccountMap"
                      className="text-teal-600 hover:underline font-medium"
                    >
                      Inventory Account Mapping
                    </Link>
                    .
                  </p>
                )}
              </div>

              {/* Grand Total Summary Box */}
              <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-500">Accepted Units: </span>
                  <strong className="font-mono text-emerald-600">
                    {createCalculations.totalAcceptedUnits}
                  </strong>
                  {createCalculations.totalRejectedUnits > 0 && (
                    <span className="ml-3 text-red-600 font-mono">
                      ({createCalculations.totalRejectedUnits} rejected)
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-gray-500 text-xs block">Total Received Value</span>
                  <span className="text-lg font-bold font-mono text-teal-600 dark:text-teal-400">
                    ETB {createCalculations.grandTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setSelectedPo(null);
                  setFormErrors({});
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium text-sm shadow disabled:opacity-40 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                {submitting ? "Creating..." : "Save GRN as Draft"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ───────────────────────────────────── */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
              <div className="flex items-center gap-3">
                <PackageCheck className="w-6 h-6 text-teal-600" />
                <div>
                  <h2 className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                    {detailModal.grnNumber}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Goods Received Note & Warehouse Stock Intake Details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintPdf(detailModal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-100"
                >
                  <Printer className="w-3.5 h-3.5" /> Print PDF Note
                </button>
                <button
                  onClick={() => setDetailModal(null)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Receipt Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-sm">
                <div>
                  <span className="text-xs text-gray-400 block">Sourced PO</span>
                  <span className="font-mono font-bold text-teal-600">
                    {detailModal.purchaseOrder?.poNumber || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Supplier</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {detailModal.supplier?.supplierName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Receiving Store</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detailModal.store?.storeName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Receipt Date</span>
                  <span className="text-gray-900 dark:text-white">{detailModal.receivedDate}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Vendor Invoice #</span>
                  <span className="font-mono">{detailModal.supplierInvoiceNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Received By</span>
                  <span>{detailModal.receivedBy || detailModal.createdBy || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>
                    {detailModal.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Total Value</span>
                  <span className="font-mono font-bold text-teal-600">
                    ETB {Number(detailModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Finance Integration Box */}
              {detailModal.journalEntry ? (
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="font-bold">General Ledger Journal Entry Posted:</div>
                      <div className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                        {detailModal.journalEntry.entryNumber || detailModal.journalEntry.referenceNumber}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/ui/manager/fncJournalEntries"
                    className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
                  >
                    View in GL <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ) : detailModal.status === "CONFIRMED" ? (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Stock intake confirmed and audited in Inventory Ledger.</span>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>This GRN is currently DRAFT. Confirming will update warehouse stock and post a General Ledger journal entry.</span>
                  </div>
                </div>
              )}

              {/* Line Items Table */}
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                  Itemized Received Lines
                </h3>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-600">
                      <tr>
                        <th className="px-4 py-2.5 text-left">Item</th>
                        <th className="px-4 py-2.5 text-right">Delivered</th>
                        <th className="px-4 py-2.5 text-right font-bold text-emerald-600">Accepted</th>
                        <th className="px-4 py-2.5 text-right text-red-600">Rejected</th>
                        <th className="px-4 py-2.5 text-right">Unit Cost</th>
                        <th className="px-4 py-2.5 text-right">Total (ETB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(detailModal.lines || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">
                            No item lines found for this Goods Received Note.
                          </td>
                        </tr>
                      ) : (
                        detailModal.lines.map((l, i) => {
                          const unitCost = Number(l.unitCost || 0);
                          const accepted = Number(l.acceptedQuantity || 0);
                          const total = Number(l.totalCost) || (accepted * unitCost);

                          return (
                            <tr key={l.id || i} className="hover:bg-gray-50/50">
                              <td className="px-4 py-2.5">
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{l.item?.itemName || "Unnamed Item"}</span>
                                  {l.item?.itemNameAm && (
                                    <span className="text-gray-400 text-[11px] font-amharic">
                                      ({l.item.itemNameAm})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono flex flex-wrap gap-2 mt-0.5">
                                  {l.item?.itemCode && <span>Code: {l.item.itemCode}</span>}
                                  {l.batchNumber && <span>• Batch: {l.batchNumber}</span>}
                                  {l.expiryDate && <span>• Exp: {l.expiryDate}</span>}
                                  {l.rejectionReason && (
                                    <span className="text-red-500">• Reason: {l.rejectionReason}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono">{l.receivedQuantity}</td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">
                                {l.acceptedQuantity}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-red-600">
                                {l.rejectedQuantity || 0}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono">
                                ETB {unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold">
                                ETB {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                      <tr>
                        <td colSpan={5} className="px-4 py-2.5 text-right">
                          Grand Total Received:
                        </td>
                        <td className="px-4 py-2.5 text-right font-mono text-teal-600">
                          ETB {Number(detailModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              {detailModal.status === "DRAFT" && (
                <button
                  onClick={() => {
                    const target = detailModal;
                    setDetailModal(null);
                    setConfirmModal(target);
                  }}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Confirm GRN
                </button>
              )}
              <button
                onClick={() => setDetailModal(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Confirm GRN Confirmation Modal ─────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Confirm Goods Received Note?
              </h3>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Confirming <strong className="font-mono text-teal-600">{confirmModal.grnNumber}</strong> will perform the following permanent ERP actions:
            </p>

            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1.5 pl-4 list-disc">
              <li>Increment physical warehouse <strong>Stock on Hand</strong> for accepted items.</li>
              <li>Update PO line cumulative received quantities and transition PO status.</li>
              <li>Post a balanced <strong>General Ledger Journal Voucher</strong> (Dr. Inventory Asset / Cr. Accounts Payable).</li>
            </ul>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmGrn(confirmModal.id)}
                disabled={submitting}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 shadow disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {submitting ? "Confirming..." : "Confirm & Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvGRNPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading Goods Received Notes...</div>}>
      <InvGRNContent />
    </Suspense>
  );
}
