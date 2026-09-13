"use client";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle,
  Loader2,
  Banknote,
  FileCheck2,
  Package,
  Layers,
  Calculator,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { getUserRoles, isAdminRole, hasAnyRole } from "./customMaintenanceUserRoles";

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
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (isOpen && request?.id) {
      loadData();
      setReceiptNumber("");
      setReferenceNumber("");
      setRemarks("");
    }
  }, [isOpen, request?.id]);

  const loadData = async () => {
    setLoadingItems(true);
    try {
      const [itms, fs] = await Promise.all([
        customMaintenanceService.getRequestItems(request.id),
        customMaintenanceService.getRequestFees(request.id),
      ]);

      setItems(
        (itms || []).map((it) => ({
          id: it.id,
          maintenanceCommonMaterialId: it.maintenanceCommonMaterial?.id || null,
          invItemId: it.invItem?.id || null,
          itemName: it.itemName,
          itemNameAm: it.itemNameAm || it.itemName,
          unitOfMeasure: it.unitOfMeasure || "በቁጥር",
          surveyedQuantity: Number(it.surveyedQuantity) || 0,
          utilityQuantity: Number(it.utilityQuantity) || 0,
          utilityUnitPrice: Number(it.utilityUnitPrice) || 0,
          outsideQuantity: Number(it.outsideQuantity) || 0,
          outsideUnitPrice: Number(it.outsideUnitPrice) || 0,
          remarks: it.remarks || "",
        }))
      );

      setFees(
        (fs || []).map((f) => ({
          id: f.id,
          feeTypeId: f.feeType?.id || null,
          feeName: f.feeName,
          feeNameAm: f.feeNameAm || f.feeName,
          unitName: f.unitName || "ብር",
          quantity: Number(f.quantity) || 1,
          unitPrice: Number(f.unitPrice) || 0,
          remarks: f.remarks || "",
        }))
      );
    } catch (err) {
      console.error(err);
      toast.error("የጥገና እቃዎችን መጫን አልተቻለም");
    } finally {
      setLoadingItems(false);
    }
  };

  const handleItemPriceChange = (idx, field, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: num };
    setItems(updated);
  };

  const handleFeePriceChange = (idx, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    const updated = [...fees];
    updated[idx] = { ...updated[idx], unitPrice: num };
    setFees(updated);
  };

  // Real-time recalculated totals
  const financials = useMemo(() => {
    let utilityMaterialsTotal = 0;
    let outsideMaterialsTotal = 0;

    items.forEach((it) => {
      utilityMaterialsTotal += (Number(it.utilityQuantity) || 0) * (Number(it.utilityUnitPrice) || 0);
      outsideMaterialsTotal += (Number(it.outsideQuantity) || 0) * (Number(it.outsideUnitPrice) || 0);
    });

    const totalMaterials = utilityMaterialsTotal + outsideMaterialsTotal;
    const serviceCharge = totalMaterials * 0.55;
    const transportCharge = utilityMaterialsTotal * 0.25;

    let additionalFeesTotal = 0;
    fees.forEach((f) => {
      additionalFeesTotal += (Number(f.quantity) || 0) * (Number(f.unitPrice) || 0);
    });

    const totalPayable = utilityMaterialsTotal + serviceCharge + transportCharge + additionalFeesTotal;

    return {
      utilityMaterialsTotal,
      outsideMaterialsTotal,
      serviceCharge,
      transportCharge,
      additionalFeesTotal,
      totalPayable,
    };
  }, [items, fees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiptNumber.trim()) {
      toast.error("እባክዎ የደረሰኝ ቁጥር ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        receiptNumber: receiptNumber.trim(),
        referenceNumber: referenceNumber.trim() || null,
        remarks: remarks.trim() || null,
        updatedItems: items.map((it) => ({
          maintenanceCommonMaterialId: it.maintenanceCommonMaterialId,
          invItemId: it.invItemId,
          itemName: it.itemName,
          itemNameAm: it.itemNameAm,
          unitOfMeasure: it.unitOfMeasure,
          surveyedQuantity: it.surveyedQuantity,
          utilityQuantity: it.utilityQuantity,
          utilityUnitPrice: it.utilityUnitPrice,
          outsideQuantity: it.outsideQuantity,
          outsideUnitPrice: it.outsideUnitPrice,
          remarks: it.remarks,
        })),
        updatedFees: fees.map((f) => ({
          feeTypeId: f.feeTypeId,
          feeName: f.feeName,
          feeNameAm: f.feeNameAm,
          unitName: f.unitName,
          quantity: f.quantity,
          unitPrice: f.unitPrice,
          remarks: f.remarks,
        })),
      };

      await customMaintenanceService.approvePayment(request.id, payload);
      toast.success("የጥገና አገልግሎት ክፍያ በተሳካ ሁኔታ ጸድቋል!");
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
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-purple-200" />
            <h2 className="text-lg font-bold">
              {canConfirmPayment
                ? "የጥገና አገልግሎት ክፍያ ማጽደቂያ እና ዋጋ ማረጋገጫ"
                : "የጥገና አገልግሎት የዋጋ ግምት እና የክፍያ ማጠቃለያ"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer Summary Card */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4 text-xs">
            <div>
              <span className="text-purple-600 dark:text-purple-400 block text-[11px]">የጥገና ቁጥር:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">{request.requestNumber}</span>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 block text-[11px]">የደንበኛ ስም:</span>
              <span className="font-bold text-gray-900 dark:text-white text-sm">{request.customerFullName}</span>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 block text-[11px]">የሂሳብ ቁጥር:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{request.accountNumber}</span>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 block text-[11px]">የጥገና ዓይነት:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {request.maintenanceType?.typeNameAm || "አጠቃላይ ጥገና"}
              </span>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 block text-[11px]">ጠቅላላ ክፍያ (Total):</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-base">
                {financials.totalPayable.toFixed(2)} ብር
              </span>
            </div>
          </div>

          {/* Section 1: Item Price Review */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              የዕቃዎች ዋጋ ምርመራ (Review & Edit Material Prices)
            </h4>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-600 text-[11px]">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">ተ.ቁ</th>
                    <th className="py-2 px-3">የዕቃው ዝርዝር</th>
                    <th className="py-2 px-3 w-16 text-center">መለኪያ</th>
                    <th className="py-2 px-3 w-20 text-right">ከድርጅቱ</th>
                    <th className="py-2 px-3 w-24 text-right">የአንዱ ዋጋ (ETB)</th>
                    <th className="py-2 px-3 w-24 text-right">ድርጅት ጠቅላላ</th>
                    <th className="py-2 px-3 w-20 text-right">ከውጭ</th>
                    <th className="py-2 px-3 w-24 text-right">ውጭ ጠቅላላ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-4 text-center text-gray-400">
                        {loadingItems ? "እቃዎችን በመጫን ላይ..." : "ምንም የተገመተ ዕቃ የለም"}
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => {
                      const uQty = Number(it.utilityQuantity) || 0;
                      const uPrice = Number(it.utilityUnitPrice) || 0;
                      const oQty = Number(it.outsideQuantity) || 0;
                      const uTotal = uQty * uPrice;
                      const oTotal = oQty * uPrice;

                      return (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="py-2 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-gray-800 dark:text-gray-200">
                            {it.itemNameAm || it.itemName}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-500">{it.unitOfMeasure}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {uQty.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              disabled={!canConfirmPayment}
                              min="0"
                              step="any"
                              value={it.utilityUnitPrice}
                              onChange={(e) => handleItemPriceChange(idx, "utilityUnitPrice", e.target.value)}
                              className="w-20 px-1.5 py-0.5 text-right font-mono font-bold border border-purple-300 dark:border-purple-600 rounded bg-purple-50/40 text-purple-900 dark:text-purple-200 disabled:opacity-75 disabled:cursor-not-allowed"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                            {uTotal.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                            {oQty.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                            {oTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Financial Calculation Breakdown */}
          <div className="bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4 text-purple-600" />
              የክፍያ ስሌት ዝርዝር
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block text-[11px]">1. ከድርጅቱ ዕቃዎች ዋጋ:</span>
                <span className="font-mono font-bold">{financials.utilityMaterialsTotal.toFixed(2)} ብር</span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block text-[11px]">2. ከውጭ የሚገዙ ዕቃዎች ግምት:</span>
                <span className="font-mono font-bold text-amber-700">{financials.outsideMaterialsTotal.toFixed(2)} ብር</span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block text-[11px]">3. የአገልግሎት ክፍያ (55% Service):</span>
                <span className="font-mono font-bold text-blue-700">{financials.serviceCharge.toFixed(2)} ብር</span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block text-[11px]">4. የትራንስፖርት ክፍያ (25% Transport):</span>
                <span className="font-mono font-bold text-indigo-700">{financials.transportCharge.toFixed(2)} ብር</span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 block text-[11px]">5. ተጨማሪ ክፍያዎች:</span>
                <span className="font-mono font-bold text-purple-700">{financials.additionalFeesTotal.toFixed(2)} ብር</span>
              </div>
              <div className="bg-purple-700 text-white p-2.5 rounded-lg shadow-sm">
                <span className="text-purple-100 block text-[11px]">ጠቅላላ የሚከፈል ድምር:</span>
                <span className="font-mono font-bold text-base">{financials.totalPayable.toFixed(2)} ብር</span>
              </div>
            </div>
          </div>

          {/* Section 3: Receipt & Payment Details Form (Only for Revenue Officers) */}
          {canConfirmPayment ? (
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-purple-600" />
                የክፍያ ደረሰኝ መረጃ (Payment Receipt Details)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
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
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  ክፍያውን አጽድቅ (Approve Payment)
                </button>
              </div>
            </form>
          ) : (
            /* Technical Role Read-Only Informational Card (Payment Confirm Button Removed) */
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 text-amber-700 dark:text-amber-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>የክፍያ ማረጋገጫ መረጃ (Payment Confirmation)</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5 text-amber-900 dark:text-amber-200">
                <p className="font-bold text-xs">
                  ይህ ደረጃ በገቢዎች ክፍል (Gebi Officer / Cashier) ብቻ የሚከናወን ነው
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  የደረሰኝ ቁጥር ማስገባት እና ክፍያ ማጽደቅ የገቢዎች ክፍል ተግባር ስለሆነ ለቴክኒክ ክፍል ተዘግቷል። ደንበኛው ክፍያውን በገቢዎች ክፍል እንዲፈጽም ያሳውቁ።
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
  );
}
