"use client";
import { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, Calculator, Printer, Send, Loader2, RefreshCw, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
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

export default function CustomMaintenanceMaterialSurveyModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  onRejectSurvey,
  readOnly = false,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
        "MAINTENANCE_IN_PROGRESS",
        "MAINTENANCE_COMPLETED",
      ].includes(request.status)
    );
  }, [readOnly, request]);

  // Catalogs
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [commonMaterials, setCommonMaterials] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);

  // Form states
  const [plumberNotes, setPlumberNotes] = useState("");
  const [items, setItems] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedCommonId, setSelectedCommonId] = useState("");

  useEffect(() => {
    if (isOpen && request) {
      setPlumberNotes(request.surveyPlumberNotes || "");
      const initType = request.maintenanceType?.id ? String(request.maintenanceType.id) : "";
      setSelectedTypeId(initType);
      loadInitialData(initType);
    }
  }, [isOpen, request]);

  const loadInitialData = async (typeId) => {
    setLoading(true);
    try {
      const branchId = request.branch?.id;
      const [types, fTypes] = await Promise.all([
        customMaintenanceService.getMaintenanceTypes(),
        customMaintenanceService.getFeeTypes(),
      ]);

      setMaintenanceTypes(types || []);
      setFeeTypes(fTypes || []);

      const activeTypeId = typeId || (types && types.length > 0 ? String(types[0].id) : null);
      if (!selectedTypeId && activeTypeId) {
        setSelectedTypeId(String(activeTypeId));
      }

      await loadCatalogStockForType(activeTypeId, branchId);

      // Check if fees exist on request or fetch from backend
      let reqFees = (request.additionalFees && request.additionalFees.length > 0) ? request.additionalFees : [];
      if (reqFees.length === 0 && request.id) {
        try {
          const fetchedFees = await customMaintenanceService.getRequestFees(request.id);
          if (fetchedFees && fetchedFees.length > 0) reqFees = fetchedFees;
        } catch (e) {
          console.warn("Could not fetch fees:", e);
        }
      }

      if (reqFees.length > 0) {
        setFees(
          reqFees.map((f) => ({
            id: f.id,
            feeTypeId: f.feeType?.id || f.feeTypeId,
            feeName: f.feeName,
            feeNameAm: f.feeNameAm || f.feeName,
            unitName: f.unitName || "ብር",
            quantity: Number(f.quantity) || 1,
            unitPrice: Number(f.unitPrice) || 0,
            remarks: f.remarks || "",
          }))
        );
      } else {
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
      }

    } catch (e) {
      console.error(e);
      toast.error("ካታሎጎችንና የመጋዘን መረጃዎችን መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const loadCatalogStockForType = async (mTypeId, branchId = request?.branch?.id) => {
    try {
      const stockRes = await customMaintenanceService.getBranchCatalogStock(
        branchId,
        mTypeId ? Number(mTypeId) : null
      );

      const storeCatalog = stockRes && Array.isArray(stockRes.items) ? stockRes.items : [];
      if (stockRes && stockRes.storeName) {
        setStoreInfo({
          storeId: stockRes.storeId,
          storeName: stockRes.storeName,
          storeCode: stockRes.storeCode,
        });
      }
      setCommonMaterials(storeCatalog);

      // If request has previously saved items, map them (or fetch from backend if empty)
      let reqItems = (request.items && request.items.length > 0) ? request.items : [];
      if (reqItems.length === 0 && request.id) {
        try {
          const fetchedItems = await customMaintenanceService.getRequestItems(request.id);
          if (fetchedItems && fetchedItems.length > 0) reqItems = fetchedItems;
        } catch (e) {
          console.warn("Could not fetch request items:", e);
        }
      }

      if (reqItems.length > 0) {
        const mapped = reqItems.map((it) => {
          const matched = storeCatalog.find(
            (c) =>
              (c.commonMaterialId && it.maintenanceCommonMaterial?.id && c.commonMaterialId === it.maintenanceCommonMaterial.id) ||
              c.materialName === it.itemName ||
              c.materialNameAm === it.itemNameAm
          );
          const avail = matched ? Number(matched.availableStock) || 0 : 0;
          const storePrice = matched ? Number(matched.unitPrice) || 0 : Number(it.utilityUnitPrice) || 0;
          const sQty = Number(it.surveyedQuantity) || 0;
          const uQty = it.utilityQuantity != null ? Number(it.utilityQuantity) : Math.min(sQty, avail);
          const oQty = it.outsideQuantity != null ? Number(it.outsideQuantity) : Math.max(0, sQty - avail);
          const uPrice = it.utilityUnitPrice != null ? Number(it.utilityUnitPrice) : storePrice;
          const oPrice = it.outsideUnitPrice != null ? Number(it.outsideUnitPrice) : storePrice;

          const isMeter = Boolean(
            it.isWaterMeter ||
              it.invItem?.isWaterMeter ||
              matched?.isWaterMeter ||
              isWaterMeterItem(it) ||
              isWaterMeterItem(matched)
          );
          return {
            maintenanceCommonMaterialId: it.maintenanceCommonMaterial?.id || matched?.commonMaterialId || null,
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
        // Pre-populate common items for the selected maintenance type
        const allItems = storeCatalog.map((cat) => {
          const storePrice = Number(cat.unitPrice) || 0;
          const avail = Number(cat.availableStock) || 0;
          const isMeter = Boolean(cat.isWaterMeter || isWaterMeterItem(cat));
          return {
            maintenanceCommonMaterialId: cat.commonMaterialId || cat.id,
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
    } catch (err) {
      console.error("Failed to load catalog stock for type:", err);
    }
  };

  const handleMaintenanceTypeChange = async (newTypeId) => {
    setSelectedTypeId(newTypeId);
    setLoading(true);
    try {
      await loadCatalogStockForType(newTypeId);
      toast.info("የተመረጠው የጥገና ዓይነት ካታሎግ ተጭኗል");
    } finally {
      setLoading(false);
    }
  };

  // ─── Item Handlers ────────────────────────────────────────────────────────
  // Auto-split: Technical enters surveyedQuantity only;
  // utilityQuantity = min(surveyed, availableStock)
  // outsideQuantity = max(0, surveyed - availableStock)
  const handleSurveyedQtyChange = (idx, value) => {
    const sQty = Math.max(0, parseFloat(value) || 0);
    const updated = [...items];
    const item = { ...updated[idx] };
    const avail = Number(item.availableStock) || 0;

    item.surveyedQuantity = sQty;
    item.utilityQuantity = Math.min(sQty, avail);
    item.outsideQuantity = Math.max(0, sQty - avail);
    item.utilityUnitPrice = item.unitPrice;
    item.outsideUnitPrice = item.unitPrice;

    updated[idx] = item;
    setItems(updated);
  };

  const handleItemRemarksChange = (idx, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], remarks: value };
    setItems(updated);
  };

  const handleAddCommonMaterial = () => {
    if (!selectedCommonId) return;
    const cat = commonMaterials.find((c) => String(c.commonMaterialId || c.id) === String(selectedCommonId));
    if (!cat) return;

    if (items.some((it) => it.maintenanceCommonMaterialId && String(it.maintenanceCommonMaterialId) === String(selectedCommonId))) {
      toast.info("ይህ ዕቃ አስቀድሞ በዝርዝሩ ውስጥ ተካቷል");
      return;
    }

    const avail = Number(cat.availableStock) || 0;
    const price = Number(cat.unitPrice) || 0;
    const isMeter = Boolean(cat.isWaterMeter || isWaterMeterItem(cat));
    const newItem = {
      maintenanceCommonMaterialId: cat.commonMaterialId || cat.id,
      invItemId: cat.invItemId || null,
      isWaterMeter: isMeter,
      itemName: cat.materialName,
      itemNameAm: cat.materialNameAm || cat.materialName,
      unitOfMeasure: cat.unitOfMeasure || "በቁጥር",
      availableStock: avail,
      unitPrice: price,
      surveyedQuantity: 0,
      utilityQuantity: 0,
      utilityUnitPrice: price,
      outsideQuantity: 0,
      outsideUnitPrice: price,
      remarks: "",
    };

    setItems([...items, newItem]);
    setSelectedCommonId("");
  };

  const handleAddCustomItem = () => {
    setItems([
      ...items,
      {
        maintenanceCommonMaterialId: null,
        invItemId: null,
        itemName: "Custom Item",
        itemNameAm: "አዲስ የተለየ ዕቃ",
        unitOfMeasure: "በቁጥር",
        availableStock: 0,
        unitPrice: 0,
        surveyedQuantity: 0,
        utilityQuantity: 0,
        utilityUnitPrice: 0,
        outsideQuantity: 0,
        outsideUnitPrice: 0,
        remarks: "",
      },
    ]);
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // ─── Fee Handlers ─────────────────────────────────────────────────────────
  const handleFeeChange = (idx, field, value) => {
    const updated = [...fees];
    updated[idx] = { ...updated[idx], [field]: value };
    setFees(updated);
  };

  const handleAddFee = () => {
    setFees([
      ...fees,
      {
        feeTypeId: null,
        feeName: "Custom Fee",
        feeNameAm: "ተጨማሪ ክፍያ",
        unitName: "ብር",
        quantity: 1,
        unitPrice: 0,
        remarks: "",
      },
    ]);
  };

  const handleRemoveFee = (idx) => {
    setFees(fees.filter((_, i) => i !== idx));
  };

  // ─── Real-Time Financial Calculations ─────────────────────────────────────
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
    // Special Rule for Maintenance: Water meter from store is EXEMPT from both 25% transport and 55% service charge.
    // Its material sale value is simply summed into total payable via utilityMaterialsTotal.
    const materialsSubjectToOverhead = Math.max(0, totalMaterials - meterUtilityTotal);
    const transportCharge = materialsSubjectToOverhead * 0.25;
    const serviceCharge = (materialsSubjectToOverhead + transportCharge) * 0.55;

    let additionalFeesTotal = 0;
    fees.forEach((f) => {
      const qty = Number(f.quantity) || 0;
      const price = Number(f.unitPrice) || 0;
      additionalFeesTotal += qty * price;
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

  // ─── Submission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const activeItems = items.filter((it) => Number(it.surveyedQuantity) > 0);
    if (activeItems.length === 0 && fees.length === 0) {
      toast.warning("እባክዎ ቢያንስ የአንድ ዕቃ የተገመተ ብዛት ወይም ተጨማሪ ክፍያ ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        maintenanceTypeId: selectedTypeId ? Number(selectedTypeId) : null,
        plumberNotes,
        items: items.map((it) => ({
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
          remarks: it.remarks,
        })),
        fees: fees.map((f) => ({
          feeTypeId: f.feeTypeId,
          feeName: f.feeName,
          feeNameAm: f.feeNameAm,
          unitName: f.unitName,
          quantity: Number(f.quantity) || 1,
          unitPrice: Number(f.unitPrice) || 0,
          remarks: f.remarks,
        })),
      };

      await customMaintenanceService.submitSurvey(request.id, payload);
      toast.success("የጥገና ዕቃዎችና ክፍያዎች ግምት በተሳካ ሁኔታ ተልኳል!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ግምቱን ማስገባት አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-6xl my-6 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            {isReadOnly ? <Lock className="w-5 h-5 text-emerald-200" /> : <Calculator className="w-5 h-5 text-blue-200" />}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold">
                  {isReadOnly ? "የጥገና ዳሰሳ ጥናትና የእቃዎች ዝርዝር (ዕይታ ብቻ / Read-only)" : "የጥገና ዕቃዎች እና ክፍያዎች ግምት መሙያ (Material & Fee Encoding)"}
                </h2>
                {isReadOnly && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/30 text-emerald-100 border border-emerald-300/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> ክፍያ ጸድቋል {request.paymentReceiptNumber ? `(ደረሰኝ ቁ.: ${request.paymentReceiptNumber})` : ""}
                  </span>
                )}
              </div>
              <div className="text-xs text-blue-100 mt-0.5 flex flex-wrap items-center gap-3">
                <span>የጥገና ቁጥር: <strong className="font-mono">{request.requestNumber}</strong></span>
                <span>ደንበኛ: <strong>{request.customerFullName}</strong></span>
                <span>ሂሳብ ቁጥር: <strong className="font-mono">{request.accountNumber}</strong></span>
                <span>ቅርንጫፍ: <strong>{request.branch?.branchDescription || request.branch?.branchName || request.branch?.name || "—"}</strong></span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Maintenance Type Selector & Store Stock Info Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/40 dark:to-gray-700/20 p-4 rounded-xl border border-blue-100 dark:border-gray-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                የጥገናው ዓይነት (Maintenance Type Category):
              </label>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedTypeId}
                  disabled={isReadOnly}
                  onChange={(e) => handleMaintenanceTypeChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-blue-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:opacity-80"
                >
                  {maintenanceTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.typeNameAm} ({t.typeName})
                    </option>
                  ))}
                </select>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => loadCatalogStockForType(selectedTypeId)}
                    title="ካታሎጉን እንደገና ጫን"
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
              <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">
                የጥገና ዓይነት ሲቀይሩ ለዚያ ጥገና የተመደቡ የተለመዱ ዕቃዎች በራስ-ሰር ይጫናሉ።
              </span>
            </div>

            {/* Store Information */}
            <div className="text-right text-xs space-y-1">
              <div className="text-gray-500 dark:text-gray-400">የዕቃ መጋዘን (Store):</div>
              <div className="font-bold text-gray-900 dark:text-white flex items-center justify-end gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {storeInfo ? `${storeInfo.storeName} (${storeInfo.storeCode})` : "የቅርንጫፍ መጋዘን"}
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                የቴክኒክ ባለሙያ የተገመተ ብዛት ሲያስገባ ሲስተሙ በመጋዘን ክምችት መሰረት ከድርጅትና ከውጭ ይከፋፍላል።
              </div>
            </div>
          </div>

          {/* Plumber Survey Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              የዳሰሳ ጥናት ባለሙያ ሪፖርት / አስተያየት (Technician Survey Notes)
            </label>
            <textarea
              rows={2}
              value={plumberNotes}
              readOnly={isReadOnly}
              onChange={(e) => setPlumberNotes(e.target.value)}
              placeholder="ስለ መስመሩ ሁኔታ፣ ስለተደረገው ምርመራ ወይም ያጋጠመ ችግር ማስታወሻ ያስገቡ..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none read-only:bg-gray-100 dark:read-only:bg-gray-750"
            />
          </div>

          {/* Section 1: Materials Catalog & Auto-Split Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span>1. የተለመዱ የጥገና ዕቃዎች ካታሎግ (Materials Catalog)</span>
                <span className="text-xs font-normal text-gray-500">({items.length} ዕቃዎች)</span>
              </h3>
              {!isReadOnly && (
                <div className="flex items-center gap-2">
                  {/* Add from dropdown */}
                  <select
                    value={selectedCommonId}
                    onChange={(e) => setSelectedCommonId(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white max-w-xs"
                  >
                    <option value="">-- ከካታሎግ ዕቃ መርጠው ያክሉ --</option>
                    {commonMaterials.map((m) => (
                      <option key={m.commonMaterialId || m.id} value={m.commonMaterialId || m.id}>
                        {m.materialNameAm || m.materialName} ({m.availableStock} አለ)
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCommonMaterial}
                    disabled={!selectedCommonId}
                    className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    አክል
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    ልዩ ዕቃ
                  </button>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-600 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">ተ.ቁ</th>
                    <th className="py-2.5 px-3 min-w-[180px]">የዕቃው ዝርዝር</th>
                    <th className="py-2.5 px-3 w-16 text-center">መለኪያ</th>
                    <th className="py-2.5 px-3 w-20 text-center">በመጋዘን</th>
                    <th className="py-2.5 px-3 w-28 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 text-center">
                      የተገመተ ብዛት <span className="text-red-500">*</span>
                    </th>
                    <th className="py-2.5 px-3 w-20 text-right">ከድርጅቱ</th>
                    <th className="py-2.5 px-3 w-24 text-right">የአንዱ ዋጋ</th>
                    <th className="py-2.5 px-3 w-24 text-right">ድርጅት ጠቅላላ</th>
                    <th className="py-2.5 px-3 w-20 text-right">ከውጭ</th>
                    <th className="py-2.5 px-3 w-24 text-right">ውጭ ጠቅላላ</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-6 text-center text-gray-400">
                        ምንም ዕቃ አልተካተተም። እባክዎ ከላይ ካለው ካታሎግ ይምረጡ።
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => {
                      const avail = Number(it.availableStock) || 0;
                      const hasStock = avail > 0;
                      const sQty = Number(it.surveyedQuantity) || 0;
                      const uQty = Number(it.utilityQuantity) || 0;
                      const oQty = Number(it.outsideQuantity) || 0;
                      const uPrice = Number(it.utilityUnitPrice) || 0;
                      const uTotal = uQty * uPrice;
                      const oTotal = oQty * uPrice;

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors ${
                            sQty > 0 ? "bg-blue-50/20 dark:bg-blue-950/10 font-medium" : ""
                          }`}
                        >
                          <td className="py-2 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3">
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {it.itemNameAm || it.itemName}
                            </div>
                            {isWaterMeterItem(it) && (
                              <span className="inline-block mt-0.5 w-fit text-[10px] font-bold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                                የውሃ ቆጣሪ (25% እና 55% ነፃ)
                              </span>
                            )}
                            {it.itemNameAm && it.itemName && it.itemNameAm !== it.itemName && (
                              <div className="text-[10px] text-gray-400">{it.itemName}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center text-gray-500">{it.unitOfMeasure}</td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                                hasStock
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                              }`}
                            >
                              {avail}
                            </span>
                          </td>
                          {/* Surveyed Quantity editable by Technical */}
                          <td className="py-2 px-3 bg-blue-50/50 dark:bg-blue-950/30">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              disabled={isReadOnly}
                              value={it.surveyedQuantity === 0 ? "" : it.surveyedQuantity}
                              onChange={(e) => handleSurveyedQtyChange(idx, e.target.value)}
                              placeholder="0"
                              className="w-full px-2 py-1 text-center font-bold text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono disabled:bg-gray-100 dark:disabled:bg-gray-750 disabled:opacity-75"
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {uQty.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-gray-600 dark:text-gray-300">
                            {uPrice.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                            {uTotal.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                            {oQty.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-gray-600 dark:text-gray-300">
                            {oTotal.toFixed(2)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="text-gray-400 hover:text-red-600 p-1 transition-colors"
                                title="አስወግድ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Additional Fees Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">
                2. ተጨማሪ የአገልግሎት ክፍያዎች (Labor & Inspection Fees)
              </h3>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddFee}
                  className="px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  ክፍያ አክል
                </button>
              )}
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 font-bold border-b border-gray-200 dark:border-gray-600 text-[11px]">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">ተ.ቁ</th>
                    <th className="py-2 px-3">የክፍያው ዓይነት</th>
                    <th className="py-2 px-3 w-20 text-center">መለኪያ</th>
                    <th className="py-2 px-3 w-24 text-center">ብዛት</th>
                    <th className="py-2 px-3 w-28 text-right">የአንዱ ዋጋ</th>
                    <th className="py-2 px-3 w-32 text-right">ጠቅላላ ክፍያ</th>
                    <th className="py-2 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                  {fees.map((f, idx) => {
                    const qty = Number(f.quantity) || 0;
                    const price = Number(f.unitPrice) || 0;
                    const total = qty * price;

                    return (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-2 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={f.feeNameAm || f.feeName}
                            onChange={(e) => handleFeeChange(idx, "feeNameAm", e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-transparent focus:ring-1 focus:ring-blue-500 outline-none font-medium disabled:opacity-80"
                          />
                        </td>
                        <td className="py-2 px-3 text-center text-gray-500">{f.unitName || "ብር"}</td>
                        <td className="py-2 px-3 text-center">
                          <input
                            type="number"
                            min="1"
                            step="any"
                            disabled={isReadOnly}
                            value={f.quantity}
                            onChange={(e) => handleFeeChange(idx, "quantity", e.target.value)}
                            className="w-16 px-1.5 py-1 text-center text-xs border border-gray-200 dark:border-gray-600 rounded font-mono disabled:opacity-80"
                          />
                        </td>
                        <td className="py-2 px-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            disabled={isReadOnly}
                            value={f.unitPrice}
                            onChange={(e) => handleFeeChange(idx, "unitPrice", e.target.value)}
                            className="w-24 px-1.5 py-1 text-right text-xs border border-gray-200 dark:border-gray-600 rounded font-mono disabled:opacity-80"
                          />
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {total.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFee(idx)}
                              className="text-gray-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Financial Summary Card */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              የዋጋ ስሌት ማጠቃለያ (Financial Breakdown)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">1. ከድርጅቱ ዕቃዎች ዋጋ:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                  {financials.utilityMaterialsTotal.toFixed(2)} ብር
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">2. ከውጭ የሚገዙ ዕቃዎች ግምት:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                  {financials.outsideMaterialsTotal.toFixed(2)} ብር
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">3. የአገልግሎት ክፍያ (55% Service):</span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm">
                  {financials.serviceCharge.toFixed(2)} ብር
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">4. የትራንስፖርት ክፍያ (25% Transport):</span>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                  {financials.transportCharge.toFixed(2)} ብር
                </span>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400 block text-[11px]">5. ተጨማሪ ክፍያዎች (Fees):</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-400 text-sm">
                  {financials.additionalFeesTotal.toFixed(2)} ብር
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-lg shadow-sm">
                <span className="text-blue-100 block text-[11px]">ጠቅላላ የሚከፈል ድምር:</span>
                <span className="font-mono font-bold text-base">
                  {financials.totalPayable.toFixed(2)} ብር
                </span>
              </div>
            </div>
            {financials.meterUtilityTotal > 0 && (
              <p className="text-[10.5px] text-blue-800 dark:text-blue-300 font-medium italic pt-1 border-t border-blue-200 dark:border-blue-800/60">
                *(የውሃ ቆጣሪ ከመጋዘን ስለሆነ ከ 25% ትራንስፖርት እና ከ 55% ሰርቪስ ክፍያ ነፃ ተደርጓል፤ የመሸጫ ዋጋ ብቻ ተደምሯል)*
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                const activeItems = items.filter((it) => {
                  const sQty = Number(it.surveyedQuantity || it.quantity || 0);
                  const uQty = Number(it.utilityQuantity || 0);
                  const oQty = Number(it.outsideQuantity || 0);
                  const uTot = Number(it.utilityTotalPrice || 0);
                  const oTot = Number(it.outsideTotalPrice || 0);
                  return sQty > 0 || uQty > 0 || oQty > 0 || uTot > 0 || oTot > 0;
                });
                const enriched = {
                  ...request,
                  maintenanceType: maintenanceTypes.find((t) => String(t.id) === String(selectedTypeId)) || request.maintenanceType,
                  items: activeItems.length > 0 ? activeItems : items,
                  materialsUtilityTotal: financials.utilityMaterialsTotal,
                  materialsOutsideTotal: financials.outsideMaterialsTotal,
                  serviceChargeAmount: financials.serviceCharge,
                  transportChargeAmount: financials.transportCharge,
                  additionalFeesTotal: financials.additionalFeesTotal,
                  totalPayableAmount: financials.totalPayable,
                };
                generateCostEstimationPdf(enriched);
              }}
              className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              የዋጋ ማጠቃለያ ቅጽ አትም (PDF)
            </button>

            <div className="flex items-center gap-3">
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
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isReadOnly
                    ? "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white shadow-sm font-bold"
                    : "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200"
                }`}
              >
                {isReadOnly ? "ዝጋ" : "ሰርዝ"}
              </button>
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  ግምቱን ለክፍያ ላክ (Submit Estimation)
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

