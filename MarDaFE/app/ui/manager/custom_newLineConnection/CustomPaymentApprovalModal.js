"use client";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle,
  Loader2,
  Banknote,
  FileCheck2,
  Package,
  Store,
  Layers,
  RefreshCw,
  Edit3,
  Calculator,
  AlertCircle,
  Building2,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import invItemService from "../../../lib/invItemService";
import invStoreService from "../../../lib/invStoreService";
import { getUserRoles, isAdminRole, hasAnyRole } from "./customNewLineUserRoles";

export default function CustomPaymentApprovalModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  userRoles: propUserRoles,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  // Determine effective user roles and check if payment confirmation is permitted
  const effectiveRoles = useMemo(() => {
    if (propUserRoles && Array.isArray(propUserRoles) && propUserRoles.length > 0) {
      return propUserRoles;
    }
    return getUserRoles();
  }, [propUserRoles]);

  const isTechnical = useMemo(() => {
    return hasAnyRole(effectiveRoles, [
      "custom_technical",
      "techhalafi",
      "plumber forman",
      "plumber",
      "wqexpert",
      "technical manager",
      "m_technical_manager",
      "ቴክኒክ",
      "ቧንቧ",
      "ፎርማን",
    ]);
  }, [effectiveRoles]);

  const isRevenueOfficer = useMemo(() => {
    return hasAnyRole(effectiveRoles, [
      "custom_revenuoff",
      "cashier",
      "m_gebi_officer",
      "income officer",
      "ገቢ",
      "ካሸር",
      "ገቢ ሰብሳቢ",
      "revenue",
    ]);
  }, [effectiveRoles]);

  // Technical role users must NEVER have payment confirmation capability
  const canConfirmPayment = useMemo(() => {
    if (isTechnical && !isRevenueOfficer) {
      return false;
    }
    return isRevenueOfficer || (isAdminRole(effectiveRoles) && !isTechnical);
  }, [isTechnical, isRevenueOfficer, effectiveRoles]);

  // Payment form inputs
  const [receiptNumber, setReceiptNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  // Review & Editable Items State
  const [items, setItems] = useState([]);
  const [branchStore, setBranchStore] = useState(null);
  const [invItems, setInvItems] = useState([]);

  // Load Survey Items & Branch Store InvItems
  useEffect(() => {
    if (isOpen && request?.id) {
      loadSurveyData();
    }
  }, [isOpen, request?.id]);

  const loadSurveyData = async () => {
    setLoadingItems(true);
    try {
      // 1. Fetch survey items for this application
      const surveyItems = await customNewLineConnectionService.getApplicationItems(request.id);

      // 2. Fetch all active stores to identify the branch store for this application
      const allStores = await invStoreService.getAllActive();
      const targetBranchId = request.branch?.id;
      const bStore =
        allStores.find((s) => s.branch?.id === targetBranchId) ||
        allStores.find((s) => !s.isMainStore) ||
        allStores[0] ||
        null;
      setBranchStore(bStore);

      // 3. Fetch system InvItems (for branch store reference)
      const allInvItems = await invItemService.getAllActive();
      setInvItems(allInvItems);

      // 4. Map survey items with their matched InvItem reference
      const mapped = (surveyItems || []).map((it) => {
        // Find matching InvItem by invItem.id, commonMaterial name, or itemName
        const matchedInv =
          (it.invItem?.id && allInvItems.find((inv) => inv.id === it.invItem.id)) ||
          allInvItems.find(
            (inv) =>
              inv.itemName?.toLowerCase() === it.itemName?.toLowerCase() ||
              (inv.itemNameAm && inv.itemNameAm === it.itemNameAm)
          ) ||
          null;

        const isUtil = Number(it.utilityQuantity || 0) > 0;
        const qty = isUtil ? Number(it.utilityQuantity) : Number(it.outsideQuantity || it.surveyedQuantity || 1);
        const uPrice = isUtil ? Number(it.utilityUnitPrice || 0) : Number(it.outsideUnitPrice || 0);

        return {
          id: it.id,
          itemName: it.itemName,
          itemNameAm: it.itemNameAm || it.itemName,
          unitOfMeasure: it.unitOfMeasure || "በቁጥር",
          isUtility: isUtil,
          quantity: qty,
          unitPrice: uPrice > 0 ? uPrice : (matchedInv?.defaultUnitCost ? Number(matchedInv.defaultUnitCost) : 0),
          invItem: matchedInv || it.invItem || null,
          invItemId: matchedInv?.id || it.invItem?.id || null,
          commonMaterialId: it.commonMaterial?.id || null,
          remarks: it.remarks || "",
        };
      });

      setItems(mapped);
    } catch (err) {
      console.error(err);
      toast.error("የዳሰሳ እቃዎችን መጫን አልተቻለም");
    } finally {
      setLoadingItems(false);
    }
  };

  // Live Recalculations: 55% Service Charge, 25% Transport Charge
  const financials = useMemo(() => {
    let utilityMaterialsTotal = 0;
    let outsideMaterialsTotal = 0;

    items.forEach((it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unitPrice || 0);
      const subtotal = q * p;
      if (it.isUtility) {
        utilityMaterialsTotal += subtotal;
      } else {
        outsideMaterialsTotal += subtotal;
      }
    });

    const totalMaterials = utilityMaterialsTotal + outsideMaterialsTotal;
    const serviceCharge = totalMaterials * 0.55;
    const transportCharge = utilityMaterialsTotal * 0.25;
    const additionalFeesTotal = Number(request?.additionalFeesTotal || 0);
    const totalPayable = utilityMaterialsTotal + serviceCharge + transportCharge + additionalFeesTotal;

    return {
      utilityMaterialsTotal,
      outsideMaterialsTotal,
      totalMaterials,
      serviceCharge,
      transportCharge,
      additionalFeesTotal,
      totalPayable,
    };
  }, [items, request?.additionalFeesTotal]);

  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplyInvItemPrice = (index, invItem) => {
    if (!invItem) return;
    const cost = Number(invItem.defaultUnitCost || 0);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        unitPrice: cost,
        invItemId: invItem.id,
        invItem: invItem,
      };
      return updated;
    });
    toast.info(`የ"${invItem.itemName}" ዋጋ ETB ${cost.toFixed(2)} ተተግብሯል`);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!receiptNumber.trim()) {
      toast.error("እባክዎ የደረሰኝ ቁጥር ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare updatedItems for backend recalculation & persistence
      const updatedItemsPayload = items.map((it) => {
        const q = Number(it.quantity || 0);
        const p = Number(it.unitPrice || 0);
        return {
          itemName: it.itemName,
          itemNameAm: it.itemNameAm,
          unitOfMeasure: it.unitOfMeasure,
          surveyedQuantity: q,
          utilityQuantity: it.isUtility ? q : 0,
          utilityUnitPrice: it.isUtility ? p : 0,
          outsideQuantity: !it.isUtility ? q : 0,
          outsideUnitPrice: !it.isUtility ? p : 0,
          invItemId: it.invItemId,
          commonMaterialId: it.commonMaterialId,
          remarks: it.remarks,
        };
      });

      await customNewLineConnectionService.approvePayment(request.id, {
        receiptNumber,
        referenceNumber,
        remarks,
        updatedItems: updatedItemsPayload,
      });

      toast.success("ክፍያ በተሳካ ሁኔታ ጸድቋል! የዘመነው የዋጋ ስሌት ተቀምጧል");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ክፍያውን ማጽደቅ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-5xl overflow-hidden animate-in fade-in zoom-in duration-200 my-auto">
        {/* ─── Modal Header ─────────────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Banknote className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                {canConfirmPayment
                  ? "ደረጃ 4፡ የክፍያ ማረጋገጫ እና ማጽደቂያ (Step 4: Review Items, Update Prices & Approve Payment)"
                  : "ደረጃ 4፡ የዋጋ ግምት እና የክፍያ ማጠቃለያ (Step 4: Review Items & Payment Summary)"}
              </h2>
              <p className="text-xs text-purple-200 mt-0.5">
                ማመልከቻ #{request.applicationNumber} • ደንበኛ: {request.customerFullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ─── Branch Store Banner ──────────────────────────────────────── */}
        <div className="bg-purple-50 dark:bg-purple-950/40 px-6 py-2.5 border-b border-purple-100 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
            <Store className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold">የቅርንጫፍ መደብር (Branch Store):</span>
            <span className="bg-purple-200/70 dark:bg-purple-900/60 px-2 py-0.5 rounded-md font-bold font-mono">
              {branchStore ? `${branchStore.storeName} (${branchStore.storeCode})` : "ዋና / ቅርንጫፍ መደብር"}
            </span>
            {request.branch && (
              <span className="text-gray-500 dark:text-gray-400">
                • ቅርንጫፍ: {request.branch.branchName}
              </span>
            )}
          </div>
          <div className="text-[11px] text-purple-700 dark:text-purple-300 flex items-center gap-1 font-medium">
            <Info className="w-3.5 h-3.5" />
            የእቃዎች ዋጋ ከሲስተሙ የቅርንጫፍ መደብር ካታሎግ (InvItem) ተመሳክሯል
          </div>
        </div>

        {/* ─── Main Content Grid ────────────────────────────────────────── */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Items Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                {canConfirmPayment ? "የእቃዎች ዝርዝር እና የዋጋ ማስተካከያ (Review Items & Prices)" : "የእቃዎች ዝርዝር እይታ (Surveyed Items Overview)"}
              </h3>
              <button
                type="button"
                onClick={loadSurveyData}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingItems ? "animate-spin" : ""}`} /> ዳግም ጫን
              </button>
            </div>

            {loadingItems ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                የእቃዎች ዝርዝር በመጫን ላይ...
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-xs">
                ምንም እቃዎች አልተመዘገቡም
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-700 text-[11px]">
                    <tr>
                      <th className="px-3 py-2.5">እቃ (Material)</th>
                      <th className="px-2 py-2.5">ምንጭ (Source)</th>
                      <th className="px-2 py-2.5 w-20 text-center">ብዛት (Qty)</th>
                      <th className="px-2 py-2.5 w-28 text-right">የነጠላ ዋጋ (Unit Price)</th>
                      <th className="px-3 py-2.5 text-right">ጠቅላላ (Subtotal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {items.map((it, idx) => {
                      const qty = Number(it.quantity || 0);
                      const uPrice = Number(it.unitPrice || 0);
                      const subtotal = qty * uPrice;

                      return (
                        <tr
                          key={it.id || idx}
                          className="hover:bg-purple-50/20 dark:hover:bg-purple-950/10 transition-colors"
                        >
                          {/* Item Name & InvItem reference */}
                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {it.itemNameAm || it.itemName}
                            </div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                              <span>መለኪያ: {it.unitOfMeasure}</span>
                              {it.invItem && (
                                <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 px-1 rounded">
                                  #{it.invItem.itemCode}
                                </span>
                              )}
                            </div>
                            {canConfirmPayment && it.invItem && (
                              <button
                                type="button"
                                onClick={() => handleApplyInvItemPrice(idx, it.invItem)}
                                className="mt-1 text-[10px] text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                              >
                                ከመደብር ዋጋ ውሰድ (ETB {Number(it.invItem.defaultUnitCost || 0).toFixed(2)})
                              </button>
                            )}
                          </td>

                          {/* Source: Utility vs Outside */}
                          <td className="px-2 py-2.5">
                            <select
                              disabled={!canConfirmPayment}
                              value={it.isUtility ? "UTILITY" : "OUTSIDE"}
                              onChange={(e) =>
                                handleUpdateItem(idx, "isUtility", e.target.value === "UTILITY")
                              }
                              className={`px-1.5 py-1 text-[11px] font-bold rounded-md border outline-none disabled:opacity-75 disabled:cursor-not-allowed ${
                                it.isUtility
                                  ? "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                                  : "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <option value="UTILITY">ከድርጅት</option>
                              <option value="OUTSIDE">ከውጭ</option>
                            </select>
                          </td>

                          {/* Quantity */}
                          <td className="px-2 py-2.5 text-center">
                            <input
                              type="number"
                              disabled={!canConfirmPayment}
                              min="0"
                              step="0.01"
                              value={it.quantity}
                              onChange={(e) =>
                                handleUpdateItem(idx, "quantity", parseFloat(e.target.value) || 0)
                              }
                              className="w-16 px-1.5 py-1 text-center font-mono font-bold text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-purple-500 outline-none disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Unit Price (ETB) */}
                          <td className="px-2 py-2.5 text-right">
                            <input
                              type="number"
                              disabled={!canConfirmPayment}
                              min="0"
                              step="0.01"
                              value={it.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)
                              }
                              className="w-24 px-1.5 py-1 text-right font-mono font-bold text-xs border border-purple-300 dark:border-purple-600 rounded bg-white dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-purple-500 outline-none disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* Subtotal */}
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                            ETB {subtotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Financial Breakdown & Payment Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Live Financial Summary Card */}
            <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/30 dark:via-indigo-950/30 dark:to-blue-950/30 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-purple-200 dark:border-purple-800">
                <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-purple-600" />
                  የክፍያ ስሌት ማጠቃለያ (Live Calculation)
                </span>
                <span className="text-[10px] bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  ስታቲክ ተመኖች (55% & 25%)
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>ከድርጅቱ የሚገዙ እቃዎች:</span>
                <span className="font-mono font-semibold">
                  ETB {financials.utilityMaterialsTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <span>ከውጭ የሚገዙ እቃዎች:</span>
                <span className="font-mono">
                  ETB {financials.outsideMaterialsTotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-purple-700 dark:text-purple-300 font-medium">
                <span>የአገልግሎት ክፍያ (55%):</span>
                <span className="font-mono font-bold">
                  ETB {financials.serviceCharge.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-indigo-700 dark:text-indigo-300 font-medium">
                <span>የትራንስፖርት ክፍያ (25%):</span>
                <span className="font-mono font-bold">
                  ETB {financials.transportCharge.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                <span>ተጨማሪ ክፍያዎች (ዳሰሳ እና ግንኙነት):</span>
                <span className="font-mono">
                  ETB {financials.additionalFeesTotal.toFixed(2)}
                </span>
              </div>

              <div className="border-t-2 border-purple-300 dark:border-purple-700 pt-2 flex justify-between items-center">
                <span className="font-extrabold text-sm text-purple-950 dark:text-purple-100">
                  ጠቅላላ የሚከፈል (Total):
                </span>
                <span className="font-black text-lg font-mono text-purple-700 dark:text-purple-300">
                  ETB {financials.totalPayable.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Record Form - ONLY FOR GEBI / REVENUE OFFICER */}
            {canConfirmPayment ? (
              <form onSubmit={handleApprove} className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 pb-1 border-b border-gray-100 dark:border-gray-700">
                  <FileCheck2 className="w-4 h-4 text-purple-600" />
                  የክፍያ ደረሰኝ መረጃ (Payment Details)
                </h4>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የደረሰኝ ቁጥር (Receipt Number) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptNumber}
                    onChange={(e) => setReceiptNumber(e.target.value)}
                    placeholder="ለምሳሌ: REC-892301"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የባንክ ማመሳከሪያ ቁጥር (Bank Ref / Telebirr ID)
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="CBE / Telebirr / Derash Reference"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ተጨማሪ ማስታወሻ (Remarks)
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="አማራጭ ማስታወሻ"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    ይቅር (Cancel)
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {submitting ? "በማጽደቅ ላይ..." : "ዋጋውን መዝግብ እና ክፍያውን አጽድቅ"}
                  </button>
                </div>
              </form>
            ) : (
              /* Technical Role Read-Only Informational Card (Payment Confirm Button Removed) */
              <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 text-amber-700 dark:text-amber-400 font-bold">
                  <AlertCircle className="w-4 h-4" />
                  <span>የክፍያ ማረጋገጫ (Payment Confirmation)</span>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5 text-amber-900 dark:text-amber-200">
                  <p className="font-bold text-xs">
                    ይህ ደረጃ በገቢዎች ክፍል (Gebi Officer / Cashier) ብቻ የሚከናወን ነው
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    የክፍያ ደረሰኝ ቁጥር ማስገባት እና ክፍያ ማጽደቅ የገቢዎች ክፍል ተግባር ስለሆነ ለቴክኒክ ክፍል ተዘግቷል። ደንበኛው ክፍያውን በገቢዎች ክፍል እንዲፈጽም ያሳውቁ።
                  </p>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                  >
                    ዝጋ (Close)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
