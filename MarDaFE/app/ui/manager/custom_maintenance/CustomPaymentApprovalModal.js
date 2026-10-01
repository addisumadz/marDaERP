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
  Printer,
} from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { getUserRoles, isAdminRole, hasAnyRole } from "./customMaintenanceUserRoles";
import { generateCostEstimationPdf } from "./customMaintenancePdf";

export const isWaterMeterItem = (it) => {
  if (!it) return false;
  if (it.isWaterMeter === true || it.invItem?.isWaterMeter === true) return true;
  if (it.commonMaterial?.isWaterMeter === true || it.maintenanceCommonMaterial?.isWaterMeter === true) return true;
  if (it.invItemId === 2 || it.invItem?.id === 2) return true;
  const name = `${it.materialCode || ""} ${it.itemCode || ""} ${it.itemName || ""} ${it.itemNameAm || ""}`.toLowerCase();
  return (
    name.includes("water meter") ||
    name.includes("water_meter") ||
    name.includes("ቆጣሪ") ||
    (name.includes("meter") && !name.includes("parameter"))
  );
};

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

  // Determine if payment has already been approved for this request
  const isPaymentApproved = useMemo(() => {
    if (!request) return false;
    return Boolean(
      request.isPaid ||
      (request.status &&
        request.status !== "PENDING_PAYMENT_APPROVAL" &&
        request.status !== "SURVEY_IN_PROGRESS" &&
        request.status !== "PENDING_SURVEY_ASSIGNMENT" &&
        request.status !== "RETURNED_FOR_REVISION") ||
      request.paymentReceiptNumber ||
      request.paymentApprovedDate
    );
  }, [request]);

  // Technical role users must NEVER have payment confirmation capability.
  // When payment is already approved, NO ONE can edit items/prices or approve payment again.
  const canConfirmPayment = useMemo(() => {
    if (isPaymentApproved) {
      return false;
    }
    if (isTechnical && !isRevenueOfficer) {
      return false;
    }
    return isRevenueOfficer || (isAdminRole(effectiveRoles) && !isTechnical);
  }, [isPaymentApproved, isTechnical, isRevenueOfficer, effectiveRoles]);

  // Payment form inputs
  const [receiptNumber, setReceiptNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  // Return for Revision state
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionRemarks, setRevisionRemarks] = useState("");
  const [returningRevision, setReturningRevision] = useState(false);

  // Review & Editable Items State
  const [items, setItems] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    if (isOpen && request?.id) {
      loadData();
      setReceiptNumber(request.paymentReceiptNumber || "");
      setReferenceNumber(request.paymentReferenceNumber || "");
      setRemarks("");
      setIsRevisionOpen(false);
      setRevisionRemarks("");
    }
  }, [isOpen, request?.id]);

  const loadData = async () => {
    setLoadingItems(true);
    try {
      const branchId = request.branch?.id;
      const mTypeId = request.maintenanceType?.id;
      const [itms, fs, stockRes] = await Promise.all([
        customMaintenanceService.getRequestItems(request.id).catch(() => []),
        customMaintenanceService.getRequestFees(request.id).catch(() => []),
        customMaintenanceService.getBranchCatalogStock(branchId, mTypeId).catch(() => ({ items: [] })),
      ]);

      const storeCatalog = stockRes && Array.isArray(stockRes.items) ? stockRes.items : [];

      setItems(
        (itms || []).map((it) => {
          const matched = storeCatalog.find(
            (c) =>
              (c.maintenanceCommonMaterialId && it.maintenanceCommonMaterial?.id && c.maintenanceCommonMaterialId === it.maintenanceCommonMaterial.id) ||
              c.materialName === it.itemName ||
              c.materialNameAm === it.itemNameAm
          );
          const storePrice = matched ? Number(matched.unitPrice) || 0 : Number(it.utilityUnitPrice) || 0;
          const uPrice = storePrice > 0 ? storePrice : (Number(it.utilityUnitPrice) || 0);
          const rawOPrice = Number(it.outsideUnitPrice) || 0;
          const oPrice = (rawOPrice >= storePrice && rawOPrice > 0) ? rawOPrice : (storePrice > 0 ? storePrice : (rawOPrice > 0 ? rawOPrice : uPrice));

          const isMeter = Boolean(
            it.isWaterMeter ||
              it.invItem?.isWaterMeter ||
              it.maintenanceCommonMaterial?.isWaterMeter ||
              isWaterMeterItem(it) ||
              isWaterMeterItem(matched)
          );
          return {
            id: it.id,
            maintenanceCommonMaterialId: it.maintenanceCommonMaterial?.id || matched?.maintenanceCommonMaterialId || null,
            invItemId: it.invItem?.id || matched?.invItemId || null,
            isWaterMeter: isMeter,
            itemName: it.itemName,
            itemNameAm: it.itemNameAm || it.itemName,
            unitOfMeasure: it.unitOfMeasure || matched?.unitOfMeasure || "በቁጥር",
            availableStock: matched ? Number(matched.availableStock) || 0 : (Number(it.availableStock) || 0),
            unitPrice: storePrice,
            surveyedQuantity: Number(it.surveyedQuantity) || (Number(it.utilityQuantity || 0) + Number(it.outsideQuantity || 0)) || 0,
            utilityQuantity: Number(it.utilityQuantity) || 0,
            utilityUnitPrice: uPrice,
            outsideQuantity: Number(it.outsideQuantity) || 0,
            outsideUnitPrice: oPrice,
            remarks: it.remarks || "",
          };
        })
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

  const handleSurveyedQtyChange = (idx, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[idx] };
      item.surveyedQuantity = val;
      const avail = Number(item.availableStock) || 0;
      const storePrice = Number(item.unitPrice || item.utilityUnitPrice || 0);

      const uQty = Math.min(num, avail);
      const oQty = Math.max(0, num - avail);
      item.utilityQuantity = Math.round(uQty * 100) / 100;
      item.outsideQuantity = Math.round(oQty * 100) / 100;

      if (storePrice > 0) {
        item.utilityUnitPrice = storePrice;
      }
      if (item.outsideUnitPrice == null || item.outsideUnitPrice === 0 || (storePrice > 0 && item.outsideUnitPrice < storePrice)) {
        item.outsideUnitPrice = storePrice;
      }
      updated[idx] = item;
      return updated;
    });
  };

  const handleItemPriceChange = (idx, field, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: num };
      return updated;
    });
  };

  const handleFeePriceChange = (idx, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setFees((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], unitPrice: num };
      return updated;
    });
  };

  // Real-time recalculated totals
  const financials = useMemo(() => {
    let utilityMaterialsTotal = 0;
    let outsideMaterialsTotal = 0;
    let meterUtilityTotal = 0;

    items.forEach((it) => {
      const uQty = Number(it.utilityQuantity) || 0;
      const uPrice = Number(it.utilityUnitPrice) || 0;
      const oQty = Number(it.outsideQuantity) || 0;
      const oPrice = Number(it.outsideUnitPrice) || 0;

      const uLine = uQty * uPrice;
      const oLine = oQty * oPrice;

      utilityMaterialsTotal += uLine;
      outsideMaterialsTotal += oLine;

      if (isWaterMeterItem(it) && uQty > 0) {
        meterUtilityTotal += uLine;
      }
    });

    const totalMaterials = utilityMaterialsTotal + outsideMaterialsTotal;
    // 25% Transport Charge is strictly calculated from items supplied by the water utility (excluding store water meter).
    // Water meter from store is EXEMPT from both 25% transport and 55% service charge.
    const materialsSubjectToTransport = Math.max(0, utilityMaterialsTotal - meterUtilityTotal);
    const transportCharge = materialsSubjectToTransport * 0.25;

    const materialsSubjectToService = Math.max(0, totalMaterials - meterUtilityTotal);
    const serviceCharge = (materialsSubjectToService + transportCharge) * 0.55;

    let additionalFeesTotal = 0;
    fees.forEach((f) => {
      additionalFeesTotal += (Number(f.quantity) || 0) * (Number(f.unitPrice) || 0);
    });

    const totalPayable = utilityMaterialsTotal + serviceCharge + transportCharge + additionalFeesTotal;

    return {
      utilityMaterialsTotal: Math.round(utilityMaterialsTotal * 100) / 100,
      outsideMaterialsTotal: Math.round(outsideMaterialsTotal * 100) / 100,
      meterUtilityTotal: Math.round(meterUtilityTotal * 100) / 100,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      transportCharge: Math.round(transportCharge * 100) / 100,
      additionalFeesTotal: Math.round(additionalFeesTotal * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
    };
  }, [items, fees]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!receiptNumber.trim()) {
      toast.error("እባክዎ የደረሰኝ ቁጥር ያስገቡ");
      return;
    }

    const activeItems = items.filter(
      (it) =>
        (Number(it.surveyedQuantity) || 0) > 0 ||
        (Number(it.utilityQuantity) || 0) > 0 ||
        (Number(it.outsideQuantity) || 0) > 0
    );
    if (activeItems.length === 0) {
      toast.error("እባክዎ ቢያንስ ለአንድ ዕቃ ብዛት ያስገቡ");
      return;
    }

    // Validation: for all items with outsideQuantity > 0, outsideUnitPrice must be >= store inventory price
    for (const it of activeItems) {
      if ((Number(it.outsideQuantity) || 0) > 0) {
        const invPrice = Number(it.unitPrice || it.utilityUnitPrice || 0);
        const outPrice = Number(it.outsideUnitPrice) || 0;
        if (invPrice > 0 && outPrice < invPrice) {
          toast.error(
            `"${it.itemNameAm || it.itemName}" የገበያ ዋጋ (${outPrice.toFixed(2)}) ከመጋዘን መደበኛ ዋጋ (${invPrice.toFixed(2)}) ማነስ አይችልም`
          );
          return;
        }
      }
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
          isWaterMeter: isWaterMeterItem(it),
          itemName: it.itemName,
          itemNameAm: it.itemNameAm,
          unitOfMeasure: it.unitOfMeasure,
          surveyedQuantity: Number(it.surveyedQuantity) || 0,
          utilityQuantity: Number(it.utilityQuantity) || 0,
          utilityUnitPrice: Number(it.utilityUnitPrice) || 0,
          outsideQuantity: Number(it.outsideQuantity) || 0,
          outsideUnitPrice: Number(it.outsideUnitPrice) || 0,
          remarks: it.remarks || "",
        })),
        updatedFees: fees.map((f) => ({
          feeTypeId: f.feeTypeId,
          feeName: f.feeName,
          feeNameAm: f.feeNameAm,
          unitName: f.unitName,
          quantity: Number(f.quantity) || 1,
          unitPrice: Number(f.unitPrice) || 0,
          remarks: f.remarks || "",
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

  const handleReturnForRevision = async (e) => {
    if (e) e.preventDefault();
    if (!revisionRemarks.trim()) {
      toast.error("እባክዎ ለክለሳ የሚመለስበትን ምክንያት ይግለጹ");
      return;
    }
    setReturningRevision(true);
    try {
      await customMaintenanceService.returnForRevision(request.id, {
        remarks: revisionRemarks.trim(),
      });
      toast.success("ለክለሳ ወደ ቴክኒክ ክፍል በተሳካ ሁኔታ ተመልሷል");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "ወደ ቴክኒክ መመለስ አልተቻለም");
    } finally {
      setReturningRevision(false);
    }
  };

  const handlePrintCostEstimation = () => {
    const rawItems = Array.isArray(items) ? items : Array.isArray(request.items) ? request.items : [];
    const activeItems = rawItems.filter((it) => {
      const sQty = Number(it.surveyedQuantity || it.quantity || 0);
      const uQty = Number(it.utilityQuantity || 0);
      const oQty = Number(it.outsideQuantity || 0);
      const uTot = Number(it.utilityTotalPrice || 0);
      const oTot = Number(it.outsideTotalPrice || 0);
      return sQty > 0 || uQty > 0 || oQty > 0 || uTot > 0 || oTot > 0;
    });

    generateCostEstimationPdf({
      ...request,
      items: activeItems.length > 0 ? activeItems : rawItems,
      additionalFees: Array.isArray(fees) ? fees : request.additionalFees,
      materialsUtilityTotal: financials.utilityMaterialsTotal,
      materialsOutsideTotal: financials.outsideMaterialsTotal,
      serviceChargeAmount: financials.serviceCharge,
      transportChargeAmount: financials.transportCharge,
      additionalFeesTotal: financials.additionalFeesTotal,
      totalPayableAmount: financials.totalPayable,
      receiptNumber: receiptNumber || request.receiptNumber,
      referenceNumber: referenceNumber || request.referenceNumber,
    });
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintCostEstimation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> ማጠቃለያውን አትም
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
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

          {/* Instruction banner */}
          <div className={`px-4 py-2.5 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 border ${
            isPaymentApproved
              ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-purple-50/70 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-300"
          }`}>
            <span>
              {isPaymentApproved ? (
                <>
                  🔒 <strong>የተጠናቀቀ የክፍያ መረጃ:</strong> ክፍያው ስለጸደቀ የእቃዎች ዝርዝር፣ ብዛት እና ዋጋዎች ለውጥ ማድረግ አይቻልም (Read-only)።
                </>
              ) : (
                <>
                  💡 <strong>ለክፍያ ማረጋገጫ:</strong> ከመጋዘን የቀረቡ ዕቃዎች ብዛትና ዋጋ ከመጋዘን ክምችት የተወሰደ በመሆኑ አይቀየርም። ለጎደሉ (ከውጭ ገበያ) ዕቃዎች ብቻ የገበያ ዋጋ ማስተካከል ይችላሉ (ዋጋው ከመጋዘን መደበኛ ዋጋ ማነስ የለበትም)።
                </>
              )}
            </span>
            <span className={`font-semibold shrink-0 ${isPaymentApproved ? "text-emerald-700 dark:text-emerald-400" : "text-purple-700 dark:text-purple-400"}`}>
              የተካተቱ: {items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0 || (Number(it.utilityQuantity) || 0) > 0 || (Number(it.outsideQuantity) || 0) > 0).length} ዕቃዎች
            </span>
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
                    <th className="py-2.5 px-2.5 w-10 text-center">ተ.ቁ</th>
                    <th className="py-2.5 px-3 min-w-[170px]">የዕቃው ዝርዝር</th>
                    <th className="py-2.5 px-2.5 w-14 text-center">መለኪያ</th>
                    <th className="py-2.5 px-2.5 w-24 text-center bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200">
                      የተገመተ ብዛት
                    </th>
                    <th className="py-2.5 px-2 text-right bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 w-16">
                      ከድርጅቱ
                    </th>
                    <th className="py-2.5 px-2 text-right bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 w-24">
                      የአንዱ ዋጋ
                    </th>
                    <th className="py-2.5 px-2.5 text-right bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 w-24">
                      ድርጅት ጠቅላላ
                    </th>
                    <th className="py-2.5 px-2 text-right bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 w-16">
                      ከውጭ
                    </th>
                    <th className="py-2.5 px-2 text-right bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 w-24">
                      የገበያ ዋጋ
                    </th>
                    <th className="py-2.5 px-2.5 text-right bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 w-24">
                      ውጭ ጠቅላላ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-4 text-center text-gray-400">
                        {loadingItems ? "እቃዎችን በመጫን ላይ..." : "ምንም የተገመተ ዕቃ የለም"}
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => {
                      const uQty = Number(it.utilityQuantity) || 0;
                      const uPrice = Number(it.utilityUnitPrice) || 0;
                      const oQty = Number(it.outsideQuantity) || 0;
                      const oPrice = Number(it.outsideUnitPrice) || 0;
                      const uTotal = uQty * uPrice;
                      const oTotal = oQty * oPrice;

                      const isStoreItem = uQty > 0;
                      const hasOutside = oQty > 0;
                      const inventoryPrice = Number(it.unitPrice || it.utilityUnitPrice || 0);
                      const isBelowInventory = hasOutside && inventoryPrice > 0 && Number(it.outsideUnitPrice || 0) < inventoryPrice;

                      return (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="py-2 px-2.5 text-center text-gray-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {it.itemNameAm || it.itemName}
                            </div>
                            {isWaterMeterItem(it) && (
                              <span className="inline-block mt-0.5 w-fit text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                የውሃ ቆጣሪ (25% እና 55% ነፃ)
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-center text-gray-500">{it.unitOfMeasure}</td>

                          {/* Surveyed Quantity: Locked if Store Item */}
                          <td className="py-2 px-2 text-center bg-purple-50/30 dark:bg-purple-950/10">
                            {isStoreItem ? (
                              <div className="flex flex-col items-center">
                                <input
                                  type="number"
                                  readOnly
                                  disabled
                                  value={it.surveyedQuantity === 0 ? "" : it.surveyedQuantity}
                                  className="w-18 text-center font-bold px-1.5 py-1 border border-purple-200 dark:border-purple-800 rounded bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200 text-xs cursor-not-allowed"
                                />
                                <span className="text-[9px] text-gray-500 dark:text-gray-400 font-medium mt-0.5" title="በቴክኒክ ክፍል የተገመተ (መቀየር አይቻልም)">
                                  🔒 በቴክኒክ የተገመተ
                                </span>
                              </div>
                            ) : (
                              <input
                                type="number"
                                disabled={!canConfirmPayment}
                                min="0"
                                step="0.1"
                                value={it.surveyedQuantity === 0 ? "" : it.surveyedQuantity}
                                onChange={(e) => handleSurveyedQtyChange(idx, e.target.value)}
                                className="w-18 text-center font-bold px-1.5 py-1 border border-purple-400 dark:border-purple-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                              />
                            )}
                          </td>

                          {/* Utility Columns: Qty & Price Locked to Inventory */}
                          <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-blue-50/20 dark:bg-blue-950/10">
                            {uQty.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right bg-blue-50/20 dark:bg-blue-950/10">
                            <input
                              type="number"
                              readOnly
                              disabled
                              value={it.utilityUnitPrice}
                              className="w-20 px-1.5 py-1 text-right font-mono font-bold border border-blue-200 dark:border-blue-800 rounded bg-gray-100 dark:bg-gray-700/60 text-blue-700 dark:text-blue-300 text-xs cursor-not-allowed"
                            />
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-gray-900 dark:text-white bg-blue-50/20 dark:bg-blue-950/10">
                            {uTotal.toFixed(2)}
                          </td>

                          {/* Outside Columns: Qty Read-Only, Price Verifiable (>= Inventory Price) */}
                          <td className="py-2 px-2 text-right font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/20 dark:bg-amber-950/10">
                            {oQty.toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-right bg-amber-50/20 dark:bg-amber-950/10">
                            <div className="flex flex-col items-end">
                              <input
                                type="number"
                                disabled={!canConfirmPayment || !hasOutside}
                                min={inventoryPrice > 0 ? inventoryPrice : 0}
                                step="0.5"
                                value={it.outsideUnitPrice}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  handleItemPriceChange(idx, "outsideUnitPrice", val);
                                }}
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  if (hasOutside && inventoryPrice > 0 && val < inventoryPrice) {
                                    handleItemPriceChange(idx, "outsideUnitPrice", inventoryPrice);
                                    toast.warn(
                                      `${it.itemNameAm || it.itemName}: የገበያ ዋጋ ከመጋዘን ዋጋ (ETB ${inventoryPrice.toFixed(2)}) ማነስ ስለማይችል ወደ መጋዘን ዋጋ ተስተካክሏል`
                                    );
                                  }
                                }}
                                className={`w-20 px-1.5 py-1 text-right font-mono font-bold border rounded text-xs outline-none disabled:opacity-75 disabled:bg-gray-100 dark:disabled:bg-gray-700/60 ${
                                  isBelowInventory
                                    ? "border-red-500 bg-red-50/60 dark:bg-red-950/30 text-red-600 focus:ring-1 focus:ring-red-500"
                                    : "border-amber-300 dark:border-amber-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500"
                                }`}
                              />
                              {isBelowInventory && (
                                <span className="text-[9px] text-red-600 dark:text-red-400 font-semibold mt-0.5">
                                  ⚠️ ≥ ETB {inventoryPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-gray-900 dark:text-white bg-amber-50/20 dark:bg-amber-950/10">
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
            {financials.meterUtilityTotal > 0 && (
              <p className="text-[10.5px] text-purple-800 dark:text-purple-300 font-medium italic pt-1 border-t border-purple-200 dark:border-purple-800/60">
                *(የውሃ ቆጣሪ ከመጋዘን ስለሆነ ከ 25% ትራንስፖርት እና ከ 55% ሰርቪስ ክፍያ ነፃ ተደርጓል፤ የመሸጫ ዋጋ ብቻ ተደምሯል)*
              </p>
            )}
          </div>

          {/* Section 3: Receipt & Payment Details Form / Approved Read-Only View */}
          {isPaymentApproved ? (
            <div className="space-y-3 bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>የተከፈለ እና የጸደቀ ክፍያ መረጃ (Approved Payment Details - Read-only)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-emerald-950 dark:text-emerald-200">
                <div>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">የደረሰኝ ቁጥር:</span>
                  <strong className="font-mono text-sm">{request.paymentReceiptNumber || request.receiptNumber || "—"}</strong>
                </div>
                <div>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">የባንክ ማመሳከሪያ:</span>
                  <strong className="font-mono text-sm">{request.paymentReferenceNumber || request.referenceNumber || "—"}</strong>
                </div>
                <div>
                  <span className="block text-[11px] text-gray-500 dark:text-gray-400">የክፍያ ሁኔታ:</span>
                  <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 rounded font-bold text-xs mt-0.5">
                    የተከፈለ እና የጸደቀ (PAID) ✓
                  </span>
                </div>
              </div>
              {(request.paymentRemarks || request.remarks) && (
                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">ማስታወሻ: </span>{request.paymentRemarks || request.remarks}
                </div>
              )}
              <div className="flex justify-end pt-2 border-t border-emerald-200/60">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  ዝጋ (Close)
                </button>
              </div>
            </div>
          ) : canConfirmPayment ? (
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

              {/* Revision Drawer */}
              {isRevisionOpen && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-xl space-y-2">
                  <label className="block font-bold text-amber-900 dark:text-amber-200">
                    ወደ ቴክኒክ ክፍል የሚላክ የክለሳ ምክንያት / ማስታወሻ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={revisionRemarks}
                    onChange={(e) => setRevisionRemarks(e.target.value)}
                    placeholder="ለምሳሌ: የእቃዎቹ ብዛት ወይም ዋጋ ማስተካከያ ስለሚያስፈልገው እንደገና ይፈተሽ..."
                    className="w-full px-3 py-1.5 text-xs border border-amber-300 dark:border-amber-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRevisionOpen(false)}
                      className="px-3 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      ዝጋ
                    </button>
                    <button
                      type="button"
                      disabled={returningRevision}
                      onClick={handleReturnForRevision}
                      className="px-4 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm disabled:opacity-50"
                    >
                      {returningRevision ? "በመመለስ ላይ..." : "ወደ ቴክኒክ ክፍል ላክ"}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsRevisionOpen((prev) => !prev)}
                  disabled={submitting}
                  className="px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100/70 hover:bg-amber-200/70 dark:bg-amber-900/40 rounded-xl border border-amber-300 dark:border-amber-700 transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  ለክለሳ ወደ ቴክኒክ መልስ
                </button>
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
