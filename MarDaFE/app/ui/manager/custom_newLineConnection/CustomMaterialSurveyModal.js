"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Calculator, Printer, Send, Loader2, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { generateCostEstimationPdf } from "./customNewLinePdf";

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

export default function CustomMaterialSurveyModal({ isOpen, onClose, onSuccess, request, onRejectSurvey, readOnly = false }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commonMaterials, setCommonMaterials] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);

  // Form states
  const [plumberNotes, setPlumberNotes] = useState("");
  const [items, setItems] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedCommonId, setSelectedCommonId] = useState("");

  // Determine if survey is locked in read-only mode (e.g. payment approved)
  const isReadOnly = useMemo(() => {
    if (readOnly) return true;
    if (!request) return false;
    return Boolean(
      request.isPaid ||
      request.paymentReceiptNumber ||
      request.paymentApprovedDate ||
      [
        "PENDING_STORE_COLLECTION",
        "MATERIALS_COLLECTED",
        "INSTALLATION_ASSIGNED",
        "INSTALLATION_IN_PROGRESS",
        "INSTALLATION_COMPLETED",
        "FINAL_ACTIVATION_COMPLETED",
      ].includes(request.status)
    );
  }, [readOnly, request]);

  useEffect(() => {
    if (isOpen && request) {
      setPlumberNotes(request.surveyPlumberNotes || "");
      loadCatalogs();
    }
  }, [isOpen, request]);

  const loadCatalogs = async () => {
    setLoading(true);
    try {
      const branchId = request.branch?.id;
      const [stockRes, fTypes] = await Promise.all([
        customNewLineConnectionService.getBranchCatalogStock(branchId),
        customNewLineConnectionService.getFeeTypes(),
      ]);

      const storeCatalog = (stockRes && Array.isArray(stockRes.items)) ? stockRes.items : [];
      if (stockRes && stockRes.storeName) {
        setStoreInfo({
          storeId: stockRes.storeId,
          storeName: stockRes.storeName,
          storeCode: stockRes.storeCode,
        });
      }
      setCommonMaterials(storeCatalog);
      setFeeTypes(fTypes || []);

      // If request has previously saved items, map them with catalog stock info
      if (request.items && request.items.length > 0) {
        const mapped = request.items.map((it) => {
          const matched = storeCatalog.find(
            (c) =>
              (c.commonMaterialId && it.commonMaterial?.id && c.commonMaterialId === it.commonMaterial.id) ||
              c.materialName === it.itemName ||
              c.materialNameAm === it.itemNameAm
          );
          const avail = matched ? (Number(matched.availableStock) || 0) : 0;
          const storePrice = matched ? (Number(matched.unitPrice) || 0) : (Number(it.utilityUnitPrice) || 0);
          const sQty = Number(it.surveyedQuantity) || 0;
          const uQty = it.utilityQuantity != null ? Number(it.utilityQuantity) : Math.min(sQty, avail);
          const oQty = it.outsideQuantity != null ? Number(it.outsideQuantity) : Math.max(0, sQty - avail);
          const uPrice = it.utilityUnitPrice != null ? Number(it.utilityUnitPrice) : storePrice;
          const oPrice = it.outsideUnitPrice != null ? Number(it.outsideUnitPrice) : storePrice;

          const isMeter = Boolean(it.isWaterMeter || it.invItem?.isWaterMeter || matched?.isWaterMeter || isWaterMeterItem(it) || isWaterMeterItem(matched));
          return {
            commonMaterialId: it.commonMaterial?.id || matched?.commonMaterialId || null,
            invItemId: it.invItem?.id || matched?.invItemId || null,
            isWaterMeter: isMeter,
            itemName: it.itemName,
            itemNameAm: it.itemNameAm || it.itemName,
            unitOfMeasure: it.unitOfMeasure || matched?.unitOfMeasure || "በቁጥር",
            availableStock: avail,
            unitPrice: storePrice,
            surveyedQuantity: sQty,
            utilityQuantity: uQty,
            utilityUnitPrice: uPrice,
            outsideQuantity: oQty,
            outsideUnitPrice: oPrice,
            remarks: it.remarks || "",
          };
        });
        setItems(mapped);
      } else {
        // Requirement: Pre-populate ALL common catalog items
        const allItems = storeCatalog.map((cat) => {
          const storePrice = Number(cat.unitPrice) || 0;
          const avail = Number(cat.availableStock) || 0;
          const isMeter = Boolean(cat.isWaterMeter || isWaterMeterItem(cat));
          return {
            commonMaterialId: cat.commonMaterialId || cat.id,
            invItemId: cat.invItemId || null,
            isWaterMeter: isMeter,
            itemName: cat.materialName,
            itemNameAm: cat.materialNameAm || cat.materialName,
            unitOfMeasure: cat.unitOfMeasure || "በቁጥር",
            availableStock: avail,
            unitPrice: storePrice,
            surveyedQuantity: 0,
            utilityQuantity: 0,
            utilityUnitPrice: storePrice,
            outsideQuantity: 0,
            outsideUnitPrice: storePrice,
            remarks: "",
          };
        });
        setItems(allItems);
      }

      // If fees are not yet populated on request, pre-populate default fee types
      if (!request.additionalFees || request.additionalFees.length === 0) {
        setFees(
          (fTypes || []).map((ft) => ({
            feeTypeId: ft.id,
            feeName: ft.feeName,
            feeNameAm: ft.feeNameAm,
            unitName: ft.unitName || "ብር",
            quantity: 1,
            unitPrice: Number(ft.defaultAmount) || 0,
            remarks: "",
          }))
        );
      } else {
        setFees(
          request.additionalFees.map((f) => ({
            feeTypeId: f.feeType?.id || null,
            feeName: f.feeName,
            feeNameAm: f.feeNameAm || f.feeName,
            unitName: f.unitName || "ብር",
            quantity: Number(f.quantity) || 1,
            unitPrice: Number(f.unitPrice) || 0,
            remarks: f.remarks || "",
          }))
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("ካታሎጎችንና የመጋዘን መረጃዎችን መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  // ─── Item Handlers ────────────────────────────────────────────────────────
  // Auto-split: Technical enters surveyedQuantity only;
  // utilityQuantity = min(surveyed, availableStock)
  // outsideQuantity = max(0, surveyed - availableStock)
  // Both prices use the branch store unit price.
  const handleSurveyedQtyChange = (index, value) => {
    setItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      item.surveyedQuantity = value;

      const num = value === "" ? 0 : Math.max(0, parseFloat(value) || 0);
      const avail = Number(item.availableStock) || 0;
      const storePrice = Number(item.unitPrice || item.utilityUnitPrice || 0);

      const uQty = Math.min(num, avail);
      const oQty = Math.max(0, num - avail);

      item.utilityQuantity = Math.round(uQty * 100) / 100;
      item.outsideQuantity = Math.round(oQty * 100) / 100;
      item.utilityUnitPrice = storePrice;
      item.outsideUnitPrice = storePrice;

      updated[index] = item;
      return updated;
    });
  };

  const handleResetItemQty = (index) => {
    handleSurveyedQtyChange(index, 0);
  };

  const handleAddCommonItem = () => {
    if (!selectedCommonId) return;
    const mat = commonMaterials.find(
      (m) => String(m.commonMaterialId || m.id) === String(selectedCommonId)
    );
    if (!mat) return;

    // Check if already in list
    const existingIdx = items.findIndex(
      (it) => String(it.commonMaterialId) === String(mat.commonMaterialId || mat.id)
    );
    if (existingIdx !== -1) {
      // Focus or increment
      toast.info(`${mat.materialNameAm || mat.materialName} በዝርዝሩ ውስጥ አስቀድሞ ይገኛል`);
      setSelectedCommonId("");
      return;
    }

    const storePrice = Number(mat.unitPrice) || 0;
    const avail = Number(mat.availableStock) || 0;
    const isMeter = Boolean(mat.isWaterMeter || isWaterMeterItem(mat));
    setItems([
      ...items,
      {
        commonMaterialId: mat.commonMaterialId || mat.id,
        invItemId: mat.invItemId || null,
        isWaterMeter: isMeter,
        itemName: mat.materialName,
        itemNameAm: mat.materialNameAm || mat.materialName,
        unitOfMeasure: mat.unitOfMeasure || "በቁጥር",
        availableStock: avail,
        unitPrice: storePrice,
        surveyedQuantity: 1,
        utilityQuantity: Math.min(1, avail),
        utilityUnitPrice: storePrice,
        outsideQuantity: Math.max(0, 1 - avail),
        outsideUnitPrice: storePrice,
        remarks: "",
      },
    ]);
    setSelectedCommonId("");
  };

  const handleAddCustomItem = () => {
    setItems([
      ...items,
      {
        commonMaterialId: null,
        invItemId: null,
        itemName: "",
        itemNameAm: "",
        unitOfMeasure: "በቁጥር",
        availableStock: 0,
        unitPrice: 0,
        surveyedQuantity: 0,
        utilityQuantity: 0,
        utilityUnitPrice: 0,
        outsideQuantity: 0,
        outsideUnitPrice: 0,
        remarks: "",
        isCustom: true,
      },
    ]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // ─── Fee Handlers ─────────────────────────────────────────────────────────
  const handleUpdateFee = (index, field, value) => {
    const updated = [...fees];
    updated[index][field] = value;
    setFees(updated);
  };

  const handleAddCustomFee = () => {
    setFees([
      ...fees,
      {
        feeTypeId: null,
        feeName: "",
        feeNameAm: "",
        unitName: "ብር",
        quantity: 1,
        unitPrice: 0,
        remarks: "",
      },
    ]);
  };

  const handleRemoveFee = (index) => {
    setFees(fees.filter((_, i) => i !== index));
  };

  // ─── Real-time Mathematical Calculations ─────────────────────────────────
  const totals = useMemo(() => {
    let utilityTotal = 0;
    let outsideTotal = 0;
    let meterUtilityTotal = 0;

    items.forEach((item) => {
      const uQty = Number(item.utilityQuantity) || 0;
      const uPrice = Number(item.utilityUnitPrice) || 0;
      const uTotal = uQty * uPrice;
      utilityTotal += uTotal;

      const oQty = Number(item.outsideQuantity) || 0;
      const oPrice = Number(item.outsideUnitPrice) || 0;
      const oTotal = oQty * oPrice;
      outsideTotal += oTotal;

      if (isWaterMeterItem(item) && uQty > 0) {
        meterUtilityTotal += uTotal;
      }
    });

    let feesTotal = 0;
    fees.forEach((f) => {
      const qty = Number(f.quantity) || 0;
      const price = Number(f.unitPrice) || 0;
      feesTotal += qty * price;
    });

    const totalMaterials = utilityTotal + outsideTotal;
    // Special Rule: Water meter provided from corporation/store is exempt from 25% transport charge
    const materialsSubjectToTransport = Math.max(0, totalMaterials - meterUtilityTotal);
    const transportCharge = materialsSubjectToTransport * 0.25;
    // 55% service charge still includes all materials + transport charge
    const serviceCharge = (totalMaterials + transportCharge) * 0.55;
    const totalPayable = utilityTotal + serviceCharge + transportCharge + feesTotal;

    return {
      utilityTotal: Math.round(utilityTotal * 100) / 100,
      outsideTotal: Math.round(outsideTotal * 100) / 100,
      meterUtilityTotal: Math.round(meterUtilityTotal * 100) / 100,
      totalMaterials: Math.round(totalMaterials * 100) / 100,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      transportCharge: Math.round(transportCharge * 100) / 100,
      feesTotal: Math.round(feesTotal * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
    };
  }, [items, fees]);

  // ─── Submit to Revenue ───────────────────────────────────────────────────
  const handleSubmitSurvey = async () => {
    // Only send items with surveyedQuantity > 0
    const activeItems = items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0);

    if (activeItems.length === 0) {
      toast.error("እባክዎ ቢያንስ ለአንድ እቃ የተገመተ ብዛት (> 0) ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        plumberNotes,
        items: activeItems.map((it) => ({
          commonMaterialId: it.commonMaterialId,
          invItemId: it.invItemId,
          isWaterMeter: isWaterMeterItem(it),
          itemName: it.itemNameAm || it.itemName || "ያልተገለጸ እቃ",
          itemNameAm: it.itemNameAm || it.itemName,
          unitOfMeasure: it.unitOfMeasure,
          surveyedQuantity: Number(it.surveyedQuantity) || 0,
          utilityQuantity: Number(it.utilityQuantity) || 0,
          utilityUnitPrice: Number(it.utilityUnitPrice) || 0,
          outsideQuantity: Number(it.outsideQuantity) || 0,
          outsideUnitPrice: Number(it.outsideUnitPrice) || 0,
          remarks: it.remarks,
        })),
        fees: fees.map((f) => ({
          feeTypeId: f.feeTypeId,
          feeName: f.feeNameAm || f.feeName || "ተጨማሪ ክፍያ",
          feeNameAm: f.feeNameAm || f.feeName,
          unitName: f.unitName,
          quantity: Number(f.quantity) || 1,
          unitPrice: Number(f.unitPrice) || 0,
          remarks: f.remarks,
        })),
      };

      await customNewLineConnectionService.submitSurvey(request.id, payload);
      toast.success("የእቃዎች ዝርዝር እና ክፍያ ተሰልቶ ወደ ገቢዎች ክፍል በተሳካ ሁኔታ ተልኳል!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "የዳሰሳ ጥናት መረጃ መመዝገብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintCostEstimation = () => {
    const activeItems = items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0);
    const previewRequest = {
      ...request,
      surveyPlumberNotes: plumberNotes,
      items: (activeItems.length > 0 ? activeItems : items).map((it) => ({
        ...it,
        utilityTotalPrice: (Number(it.utilityQuantity) || 0) * (Number(it.utilityUnitPrice) || 0),
        outsideTotalPrice: (Number(it.outsideQuantity) || 0) * (Number(it.outsideUnitPrice) || 0),
      })),
      additionalFees: fees.map((f) => ({
        ...f,
        totalPrice: (Number(f.quantity) || 0) * (Number(f.unitPrice) || 0),
      })),
      materialsUtilityTotal: totals.utilityTotal,
      materialsOutsideTotal: totals.outsideTotal,
      serviceChargeAmount: totals.serviceCharge,
      transportChargeAmount: totals.transportCharge,
      additionalFeesTotal: totals.feesTotal,
      totalPayableAmount: totals.totalPayable,
    };
    generateCostEstimationPdf(previewRequest);
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-5xl my-auto overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-700 to-indigo-700 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            {isReadOnly ? <Lock className="w-5 h-5 text-emerald-200" /> : <Calculator className="w-5 h-5 text-blue-200" />}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold">
                  {isReadOnly ? "የዳሰሳ ጥናትና የእቃዎች ዝርዝር (ዕይታ ብቻ / Read-only)" : "የጥያቄ ማስተካከያ እና የእቃዎች ዝርዝር መሙያ ቅጽ"}
                </h2>
                {isReadOnly && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> ክፍያ ጸድቋል {request.paymentReceiptNumber ? `(ደረሰኝ ቁ.: ${request.paymentReceiptNumber})` : ""}
                  </span>
                )}
              </div>
              <span className="text-xs text-blue-100 font-mono">ማመልከቻ ቁጥር: {request.applicationNumber}</span>
            </div>
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

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-gray-800 dark:text-gray-200 text-xs">
          {/* 1. Customer & Address Details (Replicating Screenshot Top Box) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Info */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-700 pb-1">
                የደንበኛው መረጃ
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">የደንበኛ ዓይነት:</span>
                  <div className="font-semibold">{request.customerType?.customerTypeDescription || "የግል"}</div>
                </div>
                <div>
                  <span className="text-gray-500">የአገልግሎት ዓይነት:</span>
                  <div className="font-semibold text-blue-600 dark:text-blue-400">አዲስ መስመር ማዘርጋት</div>
                </div>
                <div>
                  <span className="text-gray-500">የጠያቂው ስም:</span>
                  <div className="font-semibold">{request.applicantName || "—"}</div>
                </div>
                <div>
                  <span className="text-gray-500">የደንበኛ ስም:</span>
                  <div className="font-semibold">{request.customerFullName}</div>
                </div>
                <div>
                  <span className="text-gray-500">ስልክ ቁጥር:</span>
                  <div className="font-semibold font-mono">{request.phoneNumber}</div>
                </div>
                <div>
                  <span className="text-gray-500">መታወቂያ / የቤት ቁጥር:</span>
                  <div className="font-semibold font-mono">{request.nationalIdNumber || "—"} / {request.houseNumber || "—"}</div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm border-b border-gray-200 dark:border-gray-700 pb-1">
                አድራሻ
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">ቀበሌ:</span>
                  <div className="font-semibold">
                    {request.kebele?.streetsName
                      ? (request.kebele.streetsName.toLowerCase().includes("kebele") || request.kebele.streetsName.includes("ቀበሌ")
                          ? request.kebele.streetsName
                          : `ቀበሌ ${request.kebele.streetsName}`)
                      : (request.kebele?.name || "—")}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">ቀጠና / ጦቢያ:</span>
                  <div className="font-semibold">
                    {request.ketena?.ketenaName
                      ? (request.ketena.ketenaName.toLowerCase().includes("ketena") || request.ketena.ketenaName.includes("ቀጠና")
                          ? request.ketena.ketenaName
                          : `ቀጠና ${request.ketena.ketenaName}`)
                      : (request.ketena?.name || "—")}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">አድራሻ ማብራሪያ:</span>
                  <div className="font-medium text-gray-700 dark:text-gray-300">{request.addressDescription || "—"}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">የተመደበው ባለሙያ:</span>
                  <div className="font-semibold text-amber-600 dark:text-amber-400">
                    {request.surveyPlumber ? `${request.surveyPlumber.firstName} ${request.surveyPlumber.lastName}` : "ያልተመደበ"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Plumber Expert Report (የባለሙያ ሪፖርት) */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-900/40">
            <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
              የባለሙያ ሪፖርት (Plumber / Technician Field Assessment Notes)
            </label>
            <textarea
              rows={2}
              value={plumberNotes}
              onChange={(e) => setPlumberNotes(e.target.value)}
              disabled={isReadOnly}
              readOnly={isReadOnly}
              placeholder={isReadOnly ? "ምንም ማስታወሻ አልተመዘገበም" : "ባለሙያው በመስክ ላይ ያገኘውን ሁኔታ፣ የመስመር ርቀት፣ የቁፋሮ ሁኔታ ወይም ልዩ ሁኔታዎችን እዚህ ይመዝግቡ..."}
              className={`w-full px-3 py-2 text-xs border rounded-lg outline-none ${
                isReadOnly
                  ? "bg-gray-100 dark:bg-gray-700/60 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                  : "border-blue-200 dark:border-blue-800 bg-white dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
              }`}
            />
          </div>

          {/* 3. Items Table (የእቃዎች ዝርዝር) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  የእቃዎች ዝርዝር <span className="text-xs font-normal text-gray-500">({items.length} ካታሎግ እቃዎች)</span>
                </h3>
                {storeInfo?.storeName && (
                  <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                    🏢 የቅርንጫፍ መጋዘን: {storeInfo.storeName} ({storeInfo.storeCode})
                  </span>
                )}
              </div>
              {!isReadOnly && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> ሌላ ያልተካተተ እቃ
                  </button>
                </div>
              )}
            </div>

            {/* Instruction banner / Locked banner */}
            {isReadOnly ? (
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 px-3 py-2 rounded-lg text-[11px] text-emerald-900 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    <strong>የተረጋገጠ መረጃ:</strong> የዚህ ማመልከቻ ክፍያ በገቢዎች ክፍል ስለተረጋገጠ የእቃዎች ዝርዝር፣ ብዛት እና ዋጋ ላይ ለውጥ ማድረግ አይቻልም (Read-only)።
                  </span>
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                  የተረጋገጡ: {items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0).length} እቃዎች
                </span>
              </div>
            ) : (
              <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 px-3 py-2 rounded-lg text-[11px] text-blue-900 dark:text-blue-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span>
                  💡 <strong>ለቴክኒካል ባለሙያ:</strong> እባክዎ <strong>"የተገመተ ብዛት"</strong> ብቻ ያስገቡ። በቅርንጫፉ መጋዘን ክምችት መሰረት <strong>ከድርጅቱ</strong> እና <strong>ከውጭ (Market)</strong> የተገዛው እንዲሁም ዋጋው ከመጋዘኑ በራስ-ሰር ይሰላል።
                </span>
                <span className="font-semibold text-blue-700 dark:text-blue-400 shrink-0">
                  የተመረጡ: {items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0).length} እቃዎች
                </span>
              </div>
            )}

            {/* Replicated Items Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[11px] border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th rowSpan={2} className="px-2.5 py-2 text-center w-8">#</th>
                    <th rowSpan={2} className="px-3 py-2 min-w-[200px]">የሚያስፈልገው የእቃ አይነት</th>
                    <th rowSpan={2} className="px-2 py-2 text-center w-16">መለኪያ</th>
                    <th rowSpan={2} className={`px-2 py-2 text-center w-24 ${
                      isReadOnly
                        ? "bg-gray-200/80 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                        : "bg-blue-100/80 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 border-2 border-blue-400 dark:border-blue-600"
                    }`}>
                      የተገመተ ብዛት {!isReadOnly && <span className="block text-[9px] font-normal text-blue-700 dark:text-blue-300">(መሙያ)</span>}
                    </th>
                    <th colSpan={3} className="px-3 py-1 text-center bg-blue-50 dark:bg-blue-950/40 border-l border-r border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200">
                      ከድርጅቱ የተገዛ <span className="text-[10px] font-normal text-gray-500">(ከመጋዘን ክምችት)</span>
                    </th>
                    <th colSpan={3} className="px-3 py-1 text-center bg-amber-50 dark:bg-amber-950/40 border-r border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200">
                      ከውጭ የተገዛ (Market) <span className="text-[10px] font-normal text-gray-500">(የጎደለው)</span>
                    </th>
                    <th rowSpan={2} className="px-2 py-2 min-w-[100px]">ምርመራ</th>
                    {!isReadOnly && <th rowSpan={2} className="px-2 py-2 text-center w-10"></th>}
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    {/* Utility columns */}
                    <th className="px-2 py-1 text-center bg-blue-50/60 dark:bg-blue-950/20 border-l border-blue-200 dark:border-blue-800 w-16">ብዛት</th>
                    <th className="px-2 py-1 text-center bg-blue-50/60 dark:bg-blue-950/20 w-20">የአንዱ ዋጋ</th>
                    <th className="px-2 py-1 text-center bg-blue-50/60 dark:bg-blue-950/20 border-r border-blue-200 dark:border-blue-800 w-24">ጠቅላላ</th>
                    {/* Outside columns */}
                    <th className="px-2 py-1 text-center bg-amber-50/60 dark:bg-amber-950/20 w-16">ብዛት</th>
                    <th className="px-2 py-1 text-center bg-amber-50/60 dark:bg-amber-950/20 w-20">የአንዱ ዋጋ</th>
                    <th className="px-2 py-1 text-center bg-amber-50/60 dark:bg-amber-950/20 border-r border-amber-200 dark:border-amber-800 w-24">ጠቅላላ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={isReadOnly ? 11 : 12} className="px-4 py-8 text-center text-gray-400">
                        እስካሁን ምንም እቃ አልተጨመረም።
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => {
                      const uTotal = ((Number(it.utilityQuantity) || 0) * (Number(it.utilityUnitPrice) || 0)).toFixed(2);
                      const oTotal = ((Number(it.outsideQuantity) || 0) * (Number(it.outsideUnitPrice) || 0)).toFixed(2);
                      const isSelected = (Number(it.surveyedQuantity) || 0) > 0;

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-blue-50/60 dark:bg-blue-900/20 font-medium border-l-4 border-l-blue-600"
                              : "hover:bg-gray-50/60 dark:hover:bg-gray-750 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <td className="px-2 py-2 text-center font-mono text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              {it.isCustom && !isReadOnly ? (
                                <input
                                  type="text"
                                  value={it.itemNameAm || it.itemName}
                                  onChange={(e) => handleUpdateItem(idx, "itemNameAm", e.target.value)}
                                  placeholder="የእቃው ስም ይጻፉ..."
                                  className="w-full px-2 py-1 border border-blue-300 rounded bg-white dark:bg-gray-700 outline-none text-xs font-semibold"
                                />
                              ) : (
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {it.itemNameAm || it.itemName}
                                </span>
                              )}
                              {isWaterMeterItem(it) && (
                                <span className="inline-block mt-0.5 w-fit text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                  የውሃ ቆጣሪ (25% ነፃ)
                                </span>
                              )}
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {it.availableStock > 0 ? (
                                  <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                                    መጋዘን ክምችት: {it.availableStock} {it.unitOfMeasure}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                                    መጋዘን ክምችት: 0 (ከውጭ ገበያ)
                                  </span>
                                )}
                                {it.unitPrice > 0 && (
                                  <span className="text-[10px] text-gray-500 font-mono">
                                    ዋጋ: ETB {Number(it.unitPrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-300">
                            {it.unitOfMeasure}
                          </td>

                          {/* TECHNICAL ENCODES ONLY THIS FIELD (DISABLED WHEN READ-ONLY) */}
                          <td className={`px-2 py-2 text-center ${isReadOnly ? "bg-gray-50/50 dark:bg-gray-800/40" : "bg-blue-50/40 dark:bg-blue-900/10"}`}>
                            {isReadOnly ? (
                              <input
                                type="number"
                                readOnly
                                disabled
                                value={it.surveyedQuantity === 0 ? "" : it.surveyedQuantity}
                                className="w-20 text-center font-bold px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700/60 text-gray-900 dark:text-white cursor-not-allowed text-xs"
                              />
                            ) : (
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={it.surveyedQuantity === 0 ? "" : it.surveyedQuantity}
                                onChange={(e) => handleSurveyedQtyChange(idx, e.target.value)}
                                placeholder="0"
                                className="w-20 text-center font-bold px-2 py-1.5 border-2 border-blue-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                              />
                            )}
                          </td>

                          {/* UTILITY COLUMNS - DISABLED FOR TECHNICAL */}
                          <td className="px-2 py-2 bg-blue-50/20 dark:bg-blue-950/10 border-l border-blue-100 dark:border-blue-900/30">
                            <input
                              type="number"
                              readOnly
                              disabled
                              value={it.utilityQuantity}
                              className="w-full text-center font-mono px-1.5 py-1 border border-blue-200/50 dark:border-blue-800/40 rounded bg-gray-100 dark:bg-gray-700/60 text-blue-700 dark:text-blue-300 cursor-not-allowed font-semibold text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 bg-blue-50/20 dark:bg-blue-950/10">
                            <input
                              type="number"
                              readOnly
                              disabled
                              value={it.utilityUnitPrice}
                              className="w-full text-right font-mono px-1.5 py-1 border border-blue-200/50 dark:border-blue-800/40 rounded bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400 cursor-not-allowed text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-mono font-bold bg-blue-50/40 dark:bg-blue-950/20 border-r border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                            {uTotal}
                          </td>

                          {/* OUTSIDE (MARKET) COLUMNS - DISABLED FOR TECHNICAL */}
                          <td className="px-2 py-2 bg-amber-50/20 dark:bg-amber-950/10">
                            <input
                              type="number"
                              readOnly
                              disabled
                              value={it.outsideQuantity}
                              className="w-full text-center font-mono px-1.5 py-1 border border-amber-200/50 dark:border-amber-800/40 rounded bg-gray-100 dark:bg-gray-700/60 text-amber-700 dark:text-amber-300 cursor-not-allowed font-semibold text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 bg-amber-50/20 dark:bg-amber-950/10">
                            <input
                              type="number"
                              readOnly
                              disabled
                              value={it.outsideUnitPrice}
                              className="w-full text-right font-mono px-1.5 py-1 border border-amber-200/50 dark:border-amber-800/40 rounded bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-400 cursor-not-allowed text-xs"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-mono font-bold bg-amber-50/40 dark:bg-amber-950/20 border-r border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                            {oTotal}
                          </td>

                          {/* REMARKS */}
                          <td className="px-2 py-2">
                            {isReadOnly ? (
                              <span className="text-gray-700 dark:text-gray-300 px-1">{it.remarks || "—"}</span>
                            ) : (
                              <input
                                type="text"
                                value={it.remarks}
                                onChange={(e) => handleUpdateItem(idx, "remarks", e.target.value)}
                                placeholder="ምርመራ"
                                className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none text-xs"
                              />
                            )}
                          </td>

                          {/* ACTION / RESET (HIDDEN WHEN READ-ONLY) */}
                          {!isReadOnly && (
                            <td className="px-1 py-2 text-center">
                              {isSelected ? (
                                <button
                                  type="button"
                                  onClick={() => handleResetItemQty(idx)}
                                  title="ብዛቱን ሰርዝ (ወደ 0 መልስ)"
                                  className="px-1.5 py-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs font-bold"
                                >
                                  ✕
                                </button>
                              ) : it.isCustom ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : null}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {items.length > 0 && (
                  <tfoot className="bg-gray-50 dark:bg-gray-750 font-bold border-t border-gray-200 dark:border-gray-700">
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-right text-blue-700 dark:text-blue-300">
                        ከድርጅቱ የተገዛ ጠቅላላ:
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-blue-700 dark:text-blue-300 border-r border-blue-200 dark:border-blue-800">
                        ETB {totals.utilityTotal.toFixed(2)}
                      </td>
                      <td colSpan={2} className="px-3 py-2 text-right text-amber-700 dark:text-amber-300">
                        ከውጭ የተገዛ ጠቅላላ:
                      </td>
                      <td className="px-2 py-2 text-right font-mono text-amber-700 dark:text-amber-300 border-r border-amber-200 dark:border-amber-800">
                        ETB {totals.outsideTotal.toFixed(2)}
                      </td>
                      <td colSpan={isReadOnly ? 1 : 2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* 4. Additional Fees (ተጨማሪ ክፍያዎች) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                ተጨማሪ ክፍያዎች (Additional Fees & Services)
              </h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddCustomFee}
                  className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded text-xs font-medium"
                >
                  <Plus className="w-3 h-3" /> ክፍያ ጨምር
                </button>
              )}
            </div>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="px-2.5 py-2 w-8 text-center">#</th>
                    <th className="px-3 py-2 min-w-[200px]">ተጨማሪ ክፍያ ዓይነት</th>
                    <th className="px-2 py-2 text-center w-20">መለኪያ</th>
                    <th className="px-2 py-2 text-center w-24">የባለሙያ ግምት / ብዛት</th>
                    <th className="px-2 py-2 text-right w-28">የአንዱ ዋጋ</th>
                    <th className="px-3 py-2 text-right w-32">ጠቅላላ ዋጋ</th>
                    {!isReadOnly && <th className="px-2 py-2 w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {fees.map((f, idx) => {
                    const lineTotal = ((Number(f.quantity) || 0) * (Number(f.unitPrice) || 0)).toFixed(2);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                        <td className="px-2 py-1.5 text-center font-mono text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-1.5 font-medium">
                          {isReadOnly ? (
                            <span>{f.feeNameAm || f.feeName}</span>
                          ) : (
                            <input
                              type="text"
                              value={f.feeNameAm || f.feeName}
                              onChange={(e) => handleUpdateFee(idx, "feeNameAm", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none"
                            />
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {isReadOnly ? (
                            <span>{f.unitName}</span>
                          ) : (
                            <input
                              type="text"
                              value={f.unitName}
                              onChange={(e) => handleUpdateFee(idx, "unitName", e.target.value)}
                              className="w-full text-center px-1 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none"
                            />
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          {isReadOnly ? (
                            <div className="text-center font-mono">{f.quantity}</div>
                          ) : (
                            <input
                              type="number"
                              step="0.1"
                              value={f.quantity}
                              onChange={(e) => handleUpdateFee(idx, "quantity", e.target.value)}
                              className="w-full text-center font-mono px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none"
                            />
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          {isReadOnly ? (
                            <div className="text-right font-mono">ETB {Number(f.unitPrice || 0).toFixed(2)}</div>
                          ) : (
                            <input
                              type="number"
                              step="0.5"
                              value={f.unitPrice}
                              onChange={(e) => handleUpdateFee(idx, "unitPrice", e.target.value)}
                              className="w-full text-right font-mono px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none"
                            />
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {lineTotal}
                        </td>
                        {!isReadOnly && (
                          <td className="px-1 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveFee(idx)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-750 font-bold border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right">ተጨማሪ ክፍያዎች ጠቅላላ:</td>
                    <td className="px-3 py-2 text-right font-mono">ETB {totals.feesTotal.toFixed(2)}</td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. Payment Summary Card (Identical to Screenshot Green Box) */}
          <div className="flex justify-end">
            <div className="w-full sm:w-96 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2.5 shadow-sm">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm border-b border-emerald-200 dark:border-emerald-800 pb-1">
                የክፍያ ማጠቃለያ (Payment Summary)
              </h4>

              <div className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-300">
                <div className="flex justify-between">
                  <span>ከድርጅቱ ለተገዙ እቃዎች ዋጋ:</span>
                  <span className="font-mono font-bold">ETB {totals.utilityTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>የትራንስፖርት ክፍያ (25%):</span>
                  <span className="font-mono font-bold">ETB {totals.transportCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>የአገልግሎት ክፍያ (55%):</span>
                  <span className="font-mono font-bold">ETB {totals.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ተጨማሪ ክፍያዎች:</span>
                  <span className="font-mono font-bold">ETB {totals.feesTotal.toFixed(2)}</span>
                </div>
                {totals.meterUtilityTotal > 0 && (
                  <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium italic pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                    *(የውሃ ቆጣሪ ከመጋዘን ስለሆነ ከ 25% ትራንስፖርት ክፍያ ነፃ ተደርጓል)*
                  </p>
                )}
              </div>

              <div className="border-t-2 border-emerald-300 dark:border-emerald-700 pt-2 flex justify-between items-center text-emerald-950 dark:text-emerald-100">
                <span className="font-bold text-sm">ጠቅላላ ክፍያ:</span>
                <span className="font-extrabold text-base font-mono text-emerald-700 dark:text-emerald-300">
                  ETB {totals.totalPayable.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            {items.length} እቃዎች | ጠቅላላ ተከፋይ: ETB {totals.totalPayable.toFixed(2)}
          </span>
          <div className="flex items-center gap-2.5">
            {!isReadOnly && onRejectSurvey && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRejectSurvey(request);
                }}
                disabled={submitting}
                className="px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
              >
                ያልተፈቀደ / አይቻልም (ውድቅ አድርግ)
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                isReadOnly
                  ? "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white shadow-sm font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {isReadOnly ? "ዝጋ" : "ይቅር"}
            </button>
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSubmitSurvey}
                disabled={submitting || items.length === 0}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {submitting ? "በመላክ ላይ..." : "አረጋግጥና ወደ ገቢዎች ላክ"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
