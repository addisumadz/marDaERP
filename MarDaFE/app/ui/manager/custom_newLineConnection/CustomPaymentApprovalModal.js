"use client";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  Printer,
  CheckCircle,
  Loader2,
  Banknote,
  Store,
  Package,
  AlertCircle,
  RefreshCw,
  Building2,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { generateCostEstimationPdf } from "./customNewLinePdf";
import { getUserRoles, isAdminRole, hasAnyRole } from "./customNewLineUserRoles";

export default function CustomPaymentApprovalModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  userRoles: propUserRoles,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Catalogs & Store Data
  const [commonMaterials, setCommonMaterials] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);

  // Form states
  const [plumberNotes, setPlumberNotes] = useState("");
  const [items, setItems] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedCommonId, setSelectedCommonId] = useState("");

  // Payment form inputs (Specific to Step 4 Revenue Approval)
  const [receiptNumber, setReceiptNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  // Revision Return State
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionRemarks, setRevisionRemarks] = useState("");
  const [returningRevision, setReturningRevision] = useState(false);

  useEffect(() => {
    if (isOpen && request?.id) {
      setPlumberNotes(request.surveyPlumberNotes || "");
      setReceiptNumber(request.paymentReceiptNumber || "");
      setReferenceNumber(request.paymentReferenceNumber || "");
      setRemarks("");
      setIsRevisionOpen(false);
      setRevisionRemarks("");
      loadSurveyData();
    }
  }, [isOpen, request?.id]);

  const loadSurveyData = async () => {
    setLoading(true);
    try {
      const branchId = request.branch?.id;
      const [stockRes, fTypes, existingItems, existingFees] = await Promise.all([
        customNewLineConnectionService.getBranchCatalogStock(branchId),
        customNewLineConnectionService.getFeeTypes(),
        customNewLineConnectionService.getApplicationItems(request.id).catch(() => []),
        customNewLineConnectionService.getApplicationFees(request.id).catch(() => []),
      ]);

      const storeCatalog = stockRes && Array.isArray(stockRes.items) ? stockRes.items : [];
      if (stockRes && stockRes.storeName) {
        setStoreInfo({
          storeId: stockRes.storeId,
          storeName: stockRes.storeName,
          storeCode: stockRes.storeCode,
        });
      }
      setCommonMaterials(storeCatalog);
      setFeeTypes(fTypes || []);

      // Determine items source: existingItems from backend, or request.items
      const itemsToMap =
        existingItems && existingItems.length > 0
          ? existingItems
          : request.items && request.items.length > 0
          ? request.items
          : [];

      if (itemsToMap.length > 0) {
        const mapped = itemsToMap.map((it) => {
          const matched = storeCatalog.find(
            (c) =>
              (c.commonMaterialId && it.commonMaterial?.id && c.commonMaterialId === it.commonMaterial.id) ||
              c.materialName === it.itemName ||
              c.materialNameAm === it.itemNameAm
          );
          const avail = matched ? Number(matched.availableStock) || 0 : 0;
          const storePrice = matched ? Number(matched.unitPrice) || 0 : Number(it.utilityUnitPrice) || 0;
          const sQty =
            Number(it.surveyedQuantity) ||
            Number(it.utilityQuantity || 0) + Number(it.outsideQuantity || 0) ||
            0;
          const uQty = Math.min(sQty, avail);
          const oQty = Math.max(0, sQty - avail);
          const uPrice = Number(it.utilityUnitPrice) > 0 ? Number(it.utilityUnitPrice) : storePrice;
          const oPrice = Number(it.outsideUnitPrice) > 0 ? Number(it.outsideUnitPrice) : storePrice;

          return {
            id: it.id,
            commonMaterialId: it.commonMaterial?.id || matched?.commonMaterialId || null,
            invItemId: it.invItem?.id || matched?.invItemId || null,
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
        // Requirement: Pre-populate ALL common catalog items if not yet recorded
        const allItems = storeCatalog.map((cat) => {
          const storePrice = Number(cat.unitPrice) || 0;
          const avail = Number(cat.availableStock) || 0;
          return {
            commonMaterialId: cat.commonMaterialId || cat.id,
            invItemId: cat.invItemId || null,
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

      // Determine fees source
      const feesToMap =
        existingFees && existingFees.length > 0
          ? existingFees
          : request.additionalFees && request.additionalFees.length > 0
          ? request.additionalFees
          : [];

      if (feesToMap.length > 0) {
        setFees(
          feesToMap.map((f) => ({
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

  // ─── Item Handlers ────────────────────────────────────────────────────────
  // Auto-split: Updating surveyedQuantity automatically calculates:
  // utilityQuantity = min(surveyed, availableStock)
  // outsideQuantity = max(0, surveyed - availableStock)
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
      if (item.utilityUnitPrice == null || item.utilityUnitPrice === 0) {
        item.utilityUnitPrice = storePrice;
      }
      if (item.outsideUnitPrice == null || item.outsideUnitPrice === 0) {
        item.outsideUnitPrice = storePrice;
      }

      updated[index] = item;
      return updated;
    });
  };

  const handleUpdateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
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
      toast.info(`${mat.materialNameAm || mat.materialName} በዝርዝሩ ውስጥ አስቀድሞ ይገኛል`);
      setSelectedCommonId("");
      return;
    }

    const storePrice = Number(mat.unitPrice) || 0;
    const avail = Number(mat.availableStock) || 0;
    setItems([
      ...items,
      {
        commonMaterialId: mat.commonMaterialId || mat.id,
        invItemId: mat.invItemId || null,
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
        surveyedQuantity: 1,
        utilityQuantity: 0,
        utilityUnitPrice: 0,
        outsideQuantity: 1,
        outsideUnitPrice: 0,
        remarks: "",
        isCustom: true,
      },
    ]);
  };

  // ─── Fee Handlers ─────────────────────────────────────────────────────────
  const handleUpdateFee = (index, field, value) => {
    setFees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
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

    items.forEach((item) => {
      const uQty = Number(item.utilityQuantity) || 0;
      const uPrice = Number(item.utilityUnitPrice) || 0;
      utilityTotal += uQty * uPrice;

      const oQty = Number(item.outsideQuantity) || 0;
      const oPrice = Number(item.outsideUnitPrice) || 0;
      outsideTotal += oQty * oPrice;
    });

    let feesTotal = 0;
    fees.forEach((f) => {
      const qty = Number(f.quantity) || 0;
      const price = Number(f.unitPrice) || 0;
      feesTotal += qty * price;
    });

    const totalMaterials = utilityTotal + outsideTotal;
    const serviceCharge = totalMaterials * 0.55; // 55% of all materials
    const transportCharge = utilityTotal * 0.25; // 25% of utility materials
    const totalPayable = utilityTotal + serviceCharge + transportCharge + feesTotal;

    return {
      utilityTotal: Math.round(utilityTotal * 100) / 100,
      outsideTotal: Math.round(outsideTotal * 100) / 100,
      totalMaterials: Math.round(totalMaterials * 100) / 100,
      serviceCharge: Math.round(serviceCharge * 100) / 100,
      transportCharge: Math.round(transportCharge * 100) / 100,
      feesTotal: Math.round(feesTotal * 100) / 100,
      totalPayable: Math.round(totalPayable * 100) / 100,
    };
  }, [items, fees]);

  // ─── Confirm & Approve Payment ───────────────────────────────────────────
  const handleApprove = async (e) => {
    if (e) e.preventDefault();

    if (!receiptNumber.trim()) {
      toast.error("እባክዎ የደረሰኝ ቁጥር ያስገቡ");
      return;
    }

    const activeItems = items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0);
    if (activeItems.length === 0) {
      toast.error("እባክዎ ቢያንስ ለአንድ እቃ የተገመተ ብዛት (> 0) ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        receiptNumber: receiptNumber.trim(),
        referenceNumber: referenceNumber.trim(),
        remarks: remarks.trim(),
        updatedItems: activeItems.map((it) => ({
          commonMaterialId: it.commonMaterialId || null,
          invItemId: it.invItemId || null,
          itemName: it.itemNameAm || it.itemName || "ያልተገለጸ እቃ",
          itemNameAm: it.itemNameAm || it.itemName,
          unitOfMeasure: it.unitOfMeasure || "በቁጥር",
          surveyedQuantity: Number(it.surveyedQuantity) || 0,
          utilityQuantity: Number(it.utilityQuantity) || 0,
          utilityUnitPrice: Number(it.utilityUnitPrice) || 0,
          outsideQuantity: Number(it.outsideQuantity) || 0,
          outsideUnitPrice: Number(it.outsideUnitPrice) || 0,
          remarks: it.remarks || "",
        })),
        updatedFees: fees.map((f) => ({
          feeTypeId: f.feeTypeId || null,
          feeName: f.feeNameAm || f.feeName || "ተጨማሪ ክፍያ",
          feeNameAm: f.feeNameAm || f.feeName,
          unitName: f.unitName || "ብር",
          quantity: Number(f.quantity) || 1,
          unitPrice: Number(f.unitPrice) || 0,
          remarks: f.remarks || "",
        })),
      };

      await customNewLineConnectionService.approvePayment(request.id, payload);
      toast.success("ክፍያ በተሳካ ሁኔታ ጸድቋል! የዘመነው የእቃዎች ስሌት ተቀምጧል");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ክፍያውን ማጽደቅ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Return to Technical for Revision ────────────────────────────────────
  const handleReturnForRevision = async (e) => {
    if (e) e.preventDefault();
    if (!revisionRemarks.trim()) {
      toast.error("እባክዎ ለክለሳ የሚመለስበትን ምክንያት ይግለጹ");
      return;
    }
    setReturningRevision(true);
    try {
      await customNewLineConnectionService.returnForRevision(request.id, {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-6xl my-auto overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Banknote className="w-5 h-5 text-purple-200" />
            <div>
              <h2 className="text-base font-bold">
                {canConfirmPayment
                  ? "ደረጃ 4፡ የክፍያ ማረጋገጫ እና ማጽደቂያ (Step 4: Review Items, Update Prices & Approve Payment)"
                  : "ደረጃ 4፡ የዋጋ ግምት እና የክፍያ ማጠቃለያ (Step 4: Review Items & Payment Summary)"}
              </h2>
              <span className="text-xs text-purple-100 font-mono">
                ማመልከቻ ቁጥር: {request.applicationNumber} • ደንበኛ: {request.customerFullName}
              </span>
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
        <div className="p-5 overflow-y-auto space-y-5 text-gray-800 dark:text-gray-200 text-xs flex-1">
          {/* 1. Customer & Address Details */}
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
                  <div className="font-semibold text-purple-600 dark:text-purple-400">አዲስ መስመር ማዘርጋት</div>
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
                  <div className="font-semibold font-mono">
                    {request.nationalIdNumber || "—"} / {request.houseNumber || "—"}
                  </div>
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
                      ? request.kebele.streetsName.toLowerCase().includes("kebele") ||
                        request.kebele.streetsName.includes("ቀበሌ")
                        ? request.kebele.streetsName
                        : `ቀበሌ ${request.kebele.streetsName}`
                      : request.kebele?.name || "—"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">ቀጠና / ጦቢያ:</span>
                  <div className="font-semibold">
                    {request.ketena?.ketenaName
                      ? request.ketena.ketenaName.toLowerCase().includes("ketena") ||
                        request.ketena.ketenaName.includes("ቀጠና")
                        ? request.ketena.ketenaName
                        : `ቀጠና ${request.ketena.ketenaName}`
                      : request.ketena?.name || "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">አድራሻ ማብራሪያ:</span>
                  <div className="font-medium text-gray-700 dark:text-gray-300">
                    {request.addressDescription || "—"}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">የተመደበው ባለሙያ:</span>
                  <div className="font-semibold text-amber-600 dark:text-amber-400">
                    {request.surveyPlumber
                      ? `${request.surveyPlumber.firstName} ${request.surveyPlumber.lastName}`
                      : "ያልተመደበ"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Plumber Expert Report (የባለሙያ ሪፖርት) */}
          {request.surveyPlumberNotes && (
            <div className="bg-purple-50/50 dark:bg-purple-950/20 p-3.5 rounded-xl border border-purple-200 dark:border-purple-900/40">
              <span className="block text-xs font-bold text-purple-900 dark:text-purple-300 mb-0.5">
                የቴክኒክ ባለሙያ የመስክ ዳሰሳ ማስታወሻ (Plumber Field Assessment Notes):
              </span>
              <p className="text-xs text-purple-950 dark:text-purple-200 font-medium">
                {request.surveyPlumberNotes}
              </p>
            </div>
          )}

          {/* 3. Items Table (Matching Step 2 Layout with Auto-Split) */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  የእቃዎች ዝርዝር እና ዋጋ ማስተካከያ{" "}
                  <span className="text-xs font-normal text-gray-500">({items.length} እቃዎች)</span>
                </h3>
                {storeInfo?.storeName && (
                  <span className="text-[11px] font-semibold text-purple-800 dark:text-purple-200 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    <Store className="w-3.5 h-3.5" />
                    የቅርንጫፍ መጋዘን: {storeInfo.storeName} ({storeInfo.storeCode})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                {canConfirmPayment && (
                  <>
                    <div className="flex items-center gap-1">
                      <select
                        value={selectedCommonId}
                        onChange={(e) => setSelectedCommonId(e.target.value)}
                        className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 outline-none max-w-[200px]"
                      >
                        <option value="">ከካታሎግ እቃ ምረጥ...</option>
                        {commonMaterials.map((m) => (
                          <option key={m.commonMaterialId || m.id} value={m.commonMaterialId || m.id}>
                            {m.materialNameAm || m.materialName} (ክምችት: {m.availableStock || 0})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCommonItem}
                        disabled={!selectedCommonId}
                        className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        እቃ ጨምር
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> ሌላ እቃ
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={loadSurveyData}
                  className="p-1.5 text-gray-500 hover:text-purple-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="ዳግም ጫን"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Instruction banner */}
            <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 px-3 py-2 rounded-lg text-[11px] text-purple-900 dark:text-purple-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span>
                💡 <strong>ለክፍያ ማረጋገጫ:</strong> <strong>"የተገመተ ብዛት"</strong> ወይም <strong>የአንዱ ዋጋ</strong> ማስተካከል ይችላሉ። በመጋዘን ክምችት መሰረት <strong>ከድርጅቱ</strong> እና <strong>ከውጭ (Market) (የጎደለው)</strong> እቃዎች በራስ-ሰር ይከፋፈላሉ።
              </span>
              <span className="font-semibold text-purple-700 dark:text-purple-400 shrink-0">
                የተመረጡ: {items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0).length} እቃዎች
              </span>
            </div>

            {/* Replicated 2-Tier Items Table */}
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[11px] border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th rowSpan={2} className="px-2.5 py-2 text-center w-8">#</th>
                    <th rowSpan={2} className="px-3 py-2 min-w-[200px]">የሚያስፈልገው የእቃ አይነት</th>
                    <th rowSpan={2} className="px-2 py-2 text-center w-16">መለኪያ</th>
                    <th
                      rowSpan={2}
                      className="px-2 py-2 text-center w-24 bg-purple-100/80 dark:bg-purple-900/50 text-purple-900 dark:text-purple-100 border-2 border-purple-400 dark:border-purple-600"
                    >
                      የተገመተ ብዛት <span className="block text-[9px] font-normal text-purple-700 dark:text-purple-300">(መሙያ)</span>
                    </th>
                    <th
                      colSpan={3}
                      className="px-3 py-1 text-center bg-blue-50 dark:bg-blue-950/40 border-l border-r border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200"
                    >
                      ከድርጅቱ የተገዛ <span className="text-[10px] font-normal text-gray-500">(ከመጋዘን ክምችት)</span>
                    </th>
                    <th
                      colSpan={3}
                      className="px-3 py-1 text-center bg-amber-50 dark:bg-amber-950/40 border-r border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                    >
                      ከውጭ የተገዛ (Market) <span className="text-[10px] font-normal text-gray-500">(የጎደለው)</span>
                    </th>
                    <th rowSpan={2} className="px-2 py-2 min-w-[100px]">ምርመራ</th>
                    <th rowSpan={2} className="px-2 py-2 text-center w-10"></th>
                  </tr>
                  <tr className="border-t border-gray-200 dark:border-gray-700 text-[10px]">
                    {/* Utility columns */}
                    <th className="px-2 py-1 text-center bg-blue-50/60 dark:bg-blue-950/20 border-l border-blue-200 dark:border-blue-800 w-16">
                      ብዛት
                    </th>
                    <th className="px-2 py-1 text-center bg-blue-50/60 dark:bg-blue-950/20 w-24">
                      የአንዱ ዋጋ
                    </th>
                    <th className="px-2 py-1 text-center bg-blue-50/60 dark:bg-blue-950/20 border-r border-blue-200 dark:border-blue-800 w-24">
                      ጠቅላላ
                    </th>
                    {/* Outside columns */}
                    <th className="px-2 py-1 text-center bg-amber-50/60 dark:bg-amber-950/20 w-16">
                      ብዛት
                    </th>
                    <th className="px-2 py-1 text-center bg-amber-50/60 dark:bg-amber-950/20 w-24">
                      የአንዱ ዋጋ
                    </th>
                    <th className="px-2 py-1 text-center bg-amber-50/60 dark:bg-amber-950/20 border-r border-amber-200 dark:border-amber-800 w-24">
                      ጠቅላላ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-purple-600" />
                        የእቃዎች ዝርዝር በመጫን ላይ...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-400">
                        እስካሁን ምንም እቃ አልተመዘገበም።
                      </td>
                    </tr>
                  ) : (
                    items.map((it, idx) => {
                      const uTotal = (
                        (Number(it.utilityQuantity) || 0) * (Number(it.utilityUnitPrice) || 0)
                      ).toFixed(2);
                      const oTotal = (
                        (Number(it.outsideQuantity) || 0) * (Number(it.outsideUnitPrice) || 0)
                      ).toFixed(2);
                      const isSelected = (Number(it.surveyedQuantity) || 0) > 0;

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isSelected
                              ? "bg-purple-50/40 dark:bg-purple-950/20 font-medium border-l-4 border-l-purple-600"
                              : "hover:bg-gray-50/60 dark:hover:bg-gray-750 opacity-80 hover:opacity-100"
                          }`}
                        >
                          <td className="px-2 py-2 text-center font-mono text-gray-400">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              {it.isCustom ? (
                                <input
                                  type="text"
                                  disabled={!canConfirmPayment}
                                  value={it.itemNameAm || it.itemName}
                                  onChange={(e) => handleUpdateItem(idx, "itemNameAm", e.target.value)}
                                  placeholder="የእቃው ስም ይጻፉ..."
                                  className="w-full px-2 py-1 border border-purple-300 rounded bg-white dark:bg-gray-700 outline-none text-xs font-semibold"
                                />
                              ) : (
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {it.itemNameAm || it.itemName}
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
                                    መደበኛ ዋጋ: ETB {Number(it.unitPrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-center text-gray-600 dark:text-gray-300">
                            {it.unitOfMeasure}
                          </td>

                          {/* REVENUE/SUPERVISOR UPDATES TOTAL SURVEYED QUANTITY (AUTO-SPLITS) */}
                          <td className="px-2 py-2 text-center bg-purple-50/40 dark:bg-purple-900/10">
                            <input
                              type="number"
                              disabled={!canConfirmPayment}
                              min="0"
                              step="0.1"
                              value={it.surveyedQuantity === 0 ? "" : it.surveyedQuantity}
                              onChange={(e) => handleSurveyedQtyChange(idx, e.target.value)}
                              placeholder="0"
                              className="w-20 text-center font-bold px-2 py-1.5 border-2 border-purple-500 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-purple-500 outline-none text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                            />
                          </td>

                          {/* UTILITY COLUMNS - Qty Auto-computed, Price Verifiable */}
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
                              disabled={!canConfirmPayment}
                              min="0"
                              step="0.5"
                              value={it.utilityUnitPrice}
                              onChange={(e) =>
                                handleUpdateItem(idx, "utilityUnitPrice", parseFloat(e.target.value) || 0)
                              }
                              className="w-full text-right font-mono px-1.5 py-1 border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-blue-500 outline-none disabled:opacity-75 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-mono font-bold bg-blue-50/40 dark:bg-blue-950/20 border-r border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                            {uTotal}
                          </td>

                          {/* OUTSIDE (MARKET) COLUMNS - Qty Auto-computed, Price Verifiable */}
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
                              disabled={!canConfirmPayment}
                              min="0"
                              step="0.5"
                              value={it.outsideUnitPrice}
                              onChange={(e) =>
                                handleUpdateItem(idx, "outsideUnitPrice", parseFloat(e.target.value) || 0)
                              }
                              className="w-full text-right font-mono px-1.5 py-1 border border-amber-300 dark:border-amber-700 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium text-xs focus:ring-1 focus:ring-amber-500 outline-none disabled:opacity-75 disabled:bg-gray-100"
                            />
                          </td>
                          <td className="px-2 py-2 text-right font-mono font-bold bg-amber-50/40 dark:bg-amber-950/20 border-r border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">
                            {oTotal}
                          </td>

                          {/* REMARKS */}
                          <td className="px-2 py-2">
                            <input
                              type="text"
                              disabled={!canConfirmPayment}
                              value={it.remarks}
                              onChange={(e) => handleUpdateItem(idx, "remarks", e.target.value)}
                              placeholder="ምርመራ"
                              className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none text-xs"
                            />
                          </td>

                          {/* ACTION / RESET */}
                          <td className="px-1 py-2 text-center">
                            {isSelected && canConfirmPayment ? (
                              <button
                                type="button"
                                onClick={() => handleResetItemQty(idx)}
                                title="ብዛቱን ሰርዝ (ወደ 0 መልስ)"
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : null}
                          </td>
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
                      <td colSpan={2}></td>
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
              {canConfirmPayment && (
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
                    <th className="px-2 py-2 text-center w-24">ብዛት</th>
                    <th className="px-2 py-2 text-right w-28">የአንዱ ዋጋ</th>
                    <th className="px-3 py-2 text-right w-32">ጠቅላላ ዋጋ</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {fees.map((f, idx) => {
                    const lineTotal = ((Number(f.quantity) || 0) * (Number(f.unitPrice) || 0)).toFixed(2);
                    return (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-750">
                        <td className="px-2 py-1.5 text-center font-mono text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-1.5 font-medium">
                          <input
                            type="text"
                            disabled={!canConfirmPayment}
                            value={f.feeNameAm || f.feeName}
                            onChange={(e) => handleUpdateFee(idx, "feeNameAm", e.target.value)}
                            className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none disabled:opacity-80"
                          />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <input
                            type="text"
                            disabled={!canConfirmPayment}
                            value={f.unitName}
                            onChange={(e) => handleUpdateFee(idx, "unitName", e.target.value)}
                            className="w-full text-center px-1 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none disabled:opacity-80"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            disabled={!canConfirmPayment}
                            step="0.1"
                            value={f.quantity}
                            onChange={(e) => handleUpdateFee(idx, "quantity", e.target.value)}
                            className="w-full text-center font-mono px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none disabled:opacity-80"
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <input
                            type="number"
                            disabled={!canConfirmPayment}
                            step="0.5"
                            value={f.unitPrice}
                            onChange={(e) => handleUpdateFee(idx, "unitPrice", e.target.value)}
                            className="w-full text-right font-mono px-2 py-1 border border-gray-200 dark:border-gray-700 rounded bg-transparent outline-none disabled:opacity-80"
                          />
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {lineTotal}
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          {canConfirmPayment && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFee(idx)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-750 font-bold border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <td colSpan={5} className="px-3 py-2 text-right">
                      ተጨማሪ ክፍያዎች ጠቅላላ:
                    </td>
                    <td className="px-3 py-2 text-right font-mono">ETB {totals.feesTotal.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 5. Bottom Section: Payment Verification Form & Live Green Summary Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
            {/* Left side: Payment Confirmation Inputs (7 cols) */}
            <div className="lg:col-span-7">
              {canConfirmPayment ? (
                <div className="bg-purple-50/60 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800 space-y-3 shadow-sm">
                  <h4 className="font-bold text-sm text-purple-900 dark:text-purple-200 flex items-center gap-2 border-b border-purple-200 dark:border-purple-800 pb-1.5">
                    <Banknote className="w-4 h-4 text-purple-600" />
                    የክፍያ ማረጋገጫ ዝርዝሮች (Payment Confirmation)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        የደረሰኝ ቁጥር (Receipt No.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        placeholder="ለምሳሌ፡ REC-98213"
                        className="w-full px-3 py-2 text-xs font-mono font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                        የባንክ ማጣቀሻ / ቼክ ቁጥር (Reference No.)
                      </label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="አማራጭ የባንክ ቁጥር"
                        className="w-full px-3 py-2 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                      የክፍያ ማስታወሻ (Remarks)
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="አማራጭ ማስታወሻ..."
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {/* Return to Technical for Revision Box */}
                  {isRevisionOpen && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl space-y-2 animate-in fade-in">
                      <label className="block font-bold text-amber-900 dark:text-amber-200 text-xs">
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
                </div>
              ) : (
                /* Non-Revenue Role Read-Only Informational Card */
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>የክፍያ ማረጋገጫ (Payment Confirmation)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                    ይህ ደረጃ በገቢዎች ክፍል (Gebi Officer / Cashier) ብቻ የሚከናወን ነው። የክፍያ ደረሰኝ ቁጥር ማስገባት እና ክፍያ ማጽደቅ ለቴክኒክ ክፍል ተዘግቷል። ደንበኛው ክፍያውን በገቢዎች ክፍል እንዲፈጽም ያሳውቁ።
                  </p>
                </div>
              )}
            </div>

            {/* Right side: Payment Summary Card (Identical Green Box) (5 cols) */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="w-full rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2.5 shadow-sm">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm border-b border-emerald-200 dark:border-emerald-800 pb-1 flex items-center justify-between">
                  <span>የክፍያ ማጠቃለያ (Payment Summary)</span>
                  <Calculator className="w-4 h-4 text-emerald-600" />
                </h4>

                <div className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-300">
                  <div className="flex justify-between">
                    <span>ከድርጅቱ ለተገዙ እቃዎች ዋጋ:</span>
                    <span className="font-mono font-bold">ETB {totals.utilityTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ከውጭ ለተገዙ እቃዎች ዋጋ:</span>
                    <span className="font-mono font-bold">ETB {totals.outsideTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>የአገልግሎት ክፍያ (55%):</span>
                    <span className="font-mono font-bold">ETB {totals.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>የትራንስፖርት ክፍያ (25%):</span>
                    <span className="font-mono font-bold">ETB {totals.transportCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ተጨማሪ ክፍያዎች:</span>
                    <span className="font-mono font-bold">ETB {totals.feesTotal.toFixed(2)}</span>
                  </div>
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
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500 font-mono">
            {items.filter((it) => (Number(it.surveyedQuantity) || 0) > 0).length} የተመረጡ እቃዎች | ጠቅላላ ተከፋይ: ETB{" "}
            {totals.totalPayable.toFixed(2)}
          </span>

          <div className="flex items-center gap-2.5">
            {canConfirmPayment && (
              <button
                type="button"
                onClick={() => setIsRevisionOpen((prev) => !prev)}
                disabled={submitting}
                className="px-3 py-2 text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100/70 hover:bg-amber-200/70 dark:bg-amber-900/40 rounded-lg border border-amber-300 dark:border-amber-700 transition-colors flex items-center gap-1.5"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                ለክለሳ ወደ ቴክኒክ መልስ
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ይቅር
            </button>

            {canConfirmPayment ? (
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting || !receiptNumber.trim()}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                {submitting ? "በማጽደቅ ላይ..." : "ዋጋውን መዝግብ እና ክፍያውን አጽድቅ"}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
