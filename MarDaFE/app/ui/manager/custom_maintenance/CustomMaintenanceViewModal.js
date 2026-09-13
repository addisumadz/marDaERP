"use client";
import { useState, useEffect, useMemo } from "react";
import {
  X,
  User,
  Phone,
  Home,
  Building,
  Calendar,
  Wrench,
  Package,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Calculator,
  Banknote,
  PackageCheck,
  ShieldAlert,
  Layers,
  MapPin,
  Clock,
  ExternalLink,
  GripHorizontal,
} from "lucide-react";
import CustomMaintenanceStepper, { getStatusBadge } from "./CustomMaintenanceStepper";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { generateCostEstimationPdf, generateSurveyChecklistPdf } from "./customMaintenancePdf";
import {
  canAssignSurveyPlumber,
  canEncodeSurveyItems,
  canApprovePayment,
  canDispatchStoreItems,
  canAssignMaintenancePlumber,
  canCompleteMaintenance,
} from "./customMaintenanceUserRoles";

export default function CustomMaintenanceViewModal({
  isOpen,
  onClose,
  request,
  userRoles = [],
  onOpenAction = () => {},
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [fees, setFees] = useState([]);
  const [freshRequest, setFreshRequest] = useState(null);

  // Movable / Draggable Modal State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleMouseDown = (e) => {
    // Only drag on left click and when not clicking interactive elements
    if (
      e.button !== 0 ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("select") ||
      e.target.closest("a")
    ) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (isOpen && request?.id) {
      setActiveTab("overview");
      loadDetails(request.id);
    } else {
      setFreshRequest(null);
      setItems([]);
      setFees([]);
    }
  }, [isOpen, request?.id]);

  const loadDetails = async (id) => {
    setLoading(true);
    try {
      const [reqData, itms, fs] = await Promise.all([
        customMaintenanceService.getRequestById(id).catch(() => null),
        customMaintenanceService.getRequestItems(id).catch(() => []),
        customMaintenanceService.getRequestFees(id).catch(() => []),
      ]);
      setFreshRequest(reqData || request);
      setItems(Array.isArray(itms) ? itms : []);
      setFees(Array.isArray(fs) ? fs : []);
    } catch (e) {
      console.warn("Failed to load maintenance details:", e);
      setFreshRequest(request);
    } finally {
      setLoading(false);
    }
  };

  const req = freshRequest || request;
  const statusInfo = useMemo(() => (req?.status ? getStatusBadge(req.status) : { text: "", color: "" }), [req?.status]);

  if (!isOpen || !req) return null;

  // Calculate item totals
  const utilityItemsTotal = items.reduce(
    (sum, it) => sum + (Number(it.utilityQuantity || 0) * Number(it.utilityUnitPrice || 0)),
    0
  );
  const outsideItemsTotal = items.reduce(
    (sum, it) => sum + (Number(it.outsideQuantity || 0) * Number(it.outsideUnitPrice || 0)),
    0
  );
  const totalMaterials = utilityItemsTotal + outsideItemsTotal;
  const totalAdditionalFees = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "transform 0.08s ease-out",
        }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        
        {/* Header - Movable / Draggable */}
        <div
          onMouseDown={handleMouseDown}
          className="px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between shadow-md cursor-move select-none"
          title="ተጭነው ያንቀሳቅሱ (Click & drag to move modal)"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Wrench className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">የጥገና ጥያቄ ሙሉ መረጃ (Maintenance Dossier)</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-white/20 border border-white/30 text-white">
                  {req.requestNumber}
                </span>
                <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 text-[10px] text-blue-200 border border-white/20">
                  <GripHorizontal className="w-3 h-3" /> ለማንቀሳቀስ ይጎትቱ (Drag)
                </span>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-2 mt-0.5">
                <span>ቅርንጫፍ: <strong>{req.branch?.branchName || req.branch?.branchDescription || "—"}</strong></span>
                <span>•</span>
                <span>ዓይነት: <strong>{req.maintenanceType?.typeNameAm || req.maintenanceType?.typeNameEn || "አጠቃላይ ጥገና"}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusInfo.color}`}>
              {statusInfo.text}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="ዝጋ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Stepper */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
          <CustomMaintenanceStepper currentStatus={req.status} />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6 bg-white dark:bg-gray-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <User className="w-4 h-4" />
            የደንበኛ እና የችግሩ መረጃ
          </button>
          <button
            onClick={() => setActiveTab("survey")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "survey"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <Calculator className="w-4 h-4" />
            የዳሰሳ ጥናትና ዕቃዎች ({items.length})
          </button>
          <button
            onClick={() => setActiveTab("payment")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "payment"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <Banknote className="w-4 h-4" />
            ክፍያ እና ማጽደቂያ
          </button>
          <button
            onClick={() => setActiveTab("execution")}
            className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "execution"
                ? "border-blue-600 text-blue-600 dark:text-blue-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            መደብር እና ጥገና አፈፃፀም
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {/* TAB 1: OVERVIEW & CUSTOMER */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    የደንበኛ መለያ መረጃ (Customer Profile)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 block text-[11px]">ሙሉ ስም:</span>
                      <strong className="text-gray-900 dark:text-white text-sm">{req.customerFullName}</strong>
                      {req.customerFullNameEng && (
                        <div className="text-[11px] text-gray-400">{req.customerFullNameEng}</div>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">የውሃ ሂሳብ ቁጥር:</span>
                      <strong className="font-mono text-blue-700 dark:text-blue-400 text-sm">{req.accountNumber}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">የቆጣሪ ቁጥር:</span>
                      <strong className="font-mono text-gray-800 dark:text-gray-200">{req.meterNumber || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">ስልክ ቁጥር:</span>
                      <strong className="font-mono text-gray-800 dark:text-gray-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-green-600" />
                        {req.phoneNumber}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">ብሔራዊ መታወቂያ / ፋይዳ:</span>
                      <span className="font-mono">{req.nationalIdNumber || "—"}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">የደንበኛ ዓይነት:</span>
                      <span>{req.customerType?.customerTypeDescription || "የግል ደንበኛ"}</span>
                    </div>
                  </div>
                </div>

                {/* Address & Location Card */}
                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    የአድራሻ እና የመገኛ ቦታ (Location & Address)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-gray-500 block text-[11px]">ቅርንጫፍ:</span>
                      <strong>{req.branch?.branchName || req.branch?.branchDescription || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">ቀበሌ:</span>
                      <strong>{req.kebele?.streetsName || req.kebele?.name || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">ቀጠና:</span>
                      <strong>{req.ketena?.ketenaName || req.ketena?.name || "—"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">የቤት ቁጥር:</span>
                      <strong className="font-mono">{req.houseNumber || "—"}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block text-[11px]">የአድራሻ / የመገኛ መግለጫ:</span>
                      <span className="text-gray-700 dark:text-gray-300 italic">
                        {req.addressDescription || "ተጨማሪ መግለጫ አልተሰጠም"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Problem Description Card */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 pb-2 mb-2 flex items-center gap-2 border-b border-amber-200 dark:border-amber-800/60">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  የጥገናው ዝርዝር ችግር (Reported Issue & Problem)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-amber-800 dark:text-amber-400 block text-[11px]">የጥገና ዓይነት:</span>
                    <strong className="text-amber-900 dark:text-amber-200 text-sm">
                      {req.maintenanceType?.typeNameAm || req.maintenanceType?.typeNameEn || "አጠቃላይ ጥገና"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-amber-800 dark:text-amber-400 block text-[11px]">የተመዘገበበት ቀን:</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      {req.createdAt ? new Date(req.createdAt).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-800 dark:text-amber-400 block text-[11px]">መዝጋቢ ሠራተኛ:</span>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{req.registeredBy || "ሲስተም"}</span>
                  </div>
                  <div className="md:col-span-3 pt-2">
                    <span className="text-amber-800 dark:text-amber-400 block text-[11px]">የችግሩ ዝርዝር መግለጫ:</span>
                    <p className="mt-1 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/40 text-gray-800 dark:text-gray-200 leading-relaxed font-sans">
                      {req.problemDescription || "ምንም ዝርዝር መግለጫ አልተመዘገበም"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SURVEY & MATERIALS */}
          {activeTab === "survey" && (
            <div className="space-y-6">
              {/* Plumber & Survey Notes */}
              <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800/60">
                <h4 className="font-bold text-blue-950 dark:text-blue-300 pb-2 mb-3 flex items-center gap-2 border-b border-blue-200 dark:border-blue-800/60">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  የቴክኒክ ዳሰሳ ጥናት መረጃ (Survey Assignment & Notes)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 block text-[11px]">የተመደበው ዳሰሳ ባለሙያ:</span>
                    <strong className="text-gray-900 dark:text-white text-sm">
                      {req.surveyPlumber ? `${req.surveyPlumber.firstName} ${req.surveyPlumber.lastName}` : "ያልተመደበ"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">የተመደበበት ቀን:</span>
                    <span className="font-mono">
                      {req.surveyAssignedDate ? new Date(req.surveyAssignedDate).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-gray-500 block text-[11px]">የባለሙያ የዳሰሳ ማስታወሻ:</span>
                    <div className="mt-1 p-2.5 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900 text-gray-700 dark:text-gray-300 italic">
                      {req.surveyPlumberNotes || "ምንም የዳሰሳ ማስታወሻ አልገባም"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Materials Table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    የሚያስፈልጉ ዕቃዎች ዝርዝር (Estimated Maintenance Materials)
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => generateSurveyChecklistPdf(items, req)}
                      className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      የዳሰሳ ፎርም አትም
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-dashed border-gray-300 text-gray-400">
                    ዕቃዎች ገና አልተመዘገቡም (የዳሰሳ ጥናት አልተጠናቀቀም)።
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800 font-bold text-gray-600 dark:text-gray-300">
                        <tr>
                          <th className="py-2.5 px-3">ተ.ቁ</th>
                          <th className="py-2.5 px-3">የዕቃው ስም (Item Description)</th>
                          <th className="py-2.5 px-3">መለያ</th>
                          <th className="py-2.5 px-3 text-center">አጠቃላይ ብዛት</th>
                          <th className="py-2.5 px-3 text-center">ከመደብር (Utility)</th>
                          <th className="py-2.5 px-3 text-right">የመደብር ዋጋ</th>
                          <th className="py-2.5 px-3 text-center">ከውጭ (Outside)</th>
                          <th className="py-2.5 px-3 text-right">የውጭ ዋጋ</th>
                          <th className="py-2.5 px-3 text-right font-bold">ጠቅላላ ዋጋ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {items.map((it, idx) => {
                          const uQty = Number(it.utilityQuantity || 0);
                          const uPrice = Number(it.utilityUnitPrice || 0);
                          const oQty = Number(it.outsideQuantity || 0);
                          const oPrice = Number(it.outsideUnitPrice || 0);
                          const lineTotal = (uQty * uPrice) + (oQty * oPrice);

                          return (
                            <tr key={it.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="py-2 px-3 font-mono text-gray-400">{idx + 1}</td>
                              <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">
                                {it.itemNameAm || it.itemName}
                                {it.itemNameAm && it.itemName && it.itemNameAm !== it.itemName && (
                                  <span className="block text-[10px] text-gray-400 font-normal">{it.itemName}</span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-gray-500 font-mono text-[11px]">
                                {it.unitOfMeasure || "በቁጥር"}
                              </td>
                              <td className="py-2 px-3 text-center font-bold">
                                {it.surveyedQuantity || (uQty + oQty)}
                              </td>
                              <td className="py-2 px-3 text-center text-teal-700 dark:text-teal-400 font-semibold">
                                {uQty > 0 ? uQty : "—"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono">
                                {uPrice > 0 ? uPrice.toFixed(2) : "—"}
                              </td>
                              <td className="py-2 px-3 text-center text-amber-700 dark:text-amber-400 font-semibold">
                                {oQty > 0 ? oQty : "—"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono">
                                {oPrice > 0 ? oPrice.toFixed(2) : "—"}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-blue-700 dark:text-blue-400">
                                ETB {lineTotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Subtotals */}
                {items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                    <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-lg border border-teal-200 dark:border-teal-800 text-center">
                      <span className="text-[11px] text-teal-700 dark:text-teal-400 block">የመደብር ዕቃዎች ድምር (Utility):</span>
                      <strong className="text-base font-mono text-teal-900 dark:text-teal-200">
                        ETB {utilityItemsTotal.toFixed(2)}
                      </strong>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 block">የውጭ ግዢ ዕቃዎች ድምር (Outside):</span>
                      <strong className="text-base font-mono text-amber-900 dark:text-amber-200">
                        ETB {outsideItemsTotal.toFixed(2)}
                      </strong>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
                      <span className="text-[11px] text-blue-700 dark:text-blue-400 block">ጠቅላላ የዕቃዎች ዋጋ:</span>
                      <strong className="text-base font-mono text-blue-900 dark:text-blue-200">
                        ETB {totalMaterials.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FEES & PAYMENT */}
          {activeTab === "payment" && (
            <div className="space-y-6">
              {/* Payment Summary Header Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                  <span className="text-purple-700 dark:text-purple-400 block font-semibold text-xs mb-1">
                    የክፍያ ሁኔታ (Payment Status)
                  </span>
                  <div className="flex items-center gap-2">
                    {req.isPaid ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 font-bold rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ተከፍሏል (PAID)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-bold rounded-full flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> ያልተከፈለ (UNPAID)
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-[11px] space-y-1">
                    <div>ደረሰኝ ቁጥር: <strong className="font-mono">{req.paymentReceiptNumber || "—"}</strong></div>
                    <div>ማመሳከሪያ: <strong className="font-mono">{req.paymentReferenceNumber || "—"}</strong></div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-gray-500 block text-xs mb-1 font-semibold">ያጸደቀው የገቢዎች ባለሙያ</span>
                  <strong className="text-sm text-gray-900 dark:text-white block">{req.paymentApprovedBy || "ያልጸደቀ"}</strong>
                  <span className="text-[11px] text-gray-400 font-mono mt-2 block">
                    ቀን: {req.paymentApprovedDate ? new Date(req.paymentApprovedDate).toLocaleString() : "—"}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-md flex flex-col justify-center">
                  <span className="text-blue-100 text-xs uppercase tracking-wider font-semibold">
                    ጠቅላላ የሚከፈል ክፍያ (Grand Total Payable)
                  </span>
                  <div className="text-2xl font-mono font-bold mt-1">
                    ETB {Number(req.totalPayableAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-blue-200 mt-1">
                    ዕቃዎች + የአገልግሎት 55% + የትራንስፖርት 25% + ተጨማሪ
                  </span>
                </div>
              </div>

              {/* Detailed Cost Breakdown Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/60 font-bold border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span>የዋጋ ስሌት ዝርዝር (Cost Computation Breakdown)</span>
                  <button
                    onClick={() => generateCostEstimationPdf(req)}
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" /> የዋጋ ማጠቃለያ አትም (PDF)
                  </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
                  <div className="flex justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <span className="text-gray-600 dark:text-gray-300">1. የመደብር ዕቃዎች ድምር (Utility Material Cost):</span>
                    <span className="font-mono font-bold">ETB {Number(req.materialsUtilityTotal || utilityItemsTotal || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <span className="text-gray-600 dark:text-gray-300">2. የውጭ ግዢ ዕቃዎች ድምር (Outside Material Cost):</span>
                    <span className="font-mono font-bold">ETB {Number(req.materialsOutsideTotal || outsideItemsTotal || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <span className="text-gray-600 dark:text-gray-300">3. የአገልግሎት ክፍያ (Service Charge {req.serviceChargePercent || 55}%):</span>
                    <span className="font-mono font-bold">ETB {Number(req.serviceChargeAmount || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <span className="text-gray-600 dark:text-gray-300">4. የትራንስፖርት ክፍያ (Transport Charge {req.transportChargePercent || 25}%):</span>
                    <span className="font-mono font-bold">ETB {Number(req.transportChargeAmount || 0).toFixed(2)}</span>
                  </div>

                  {fees.map((fee, i) => (
                    <div key={fee.id || i} className="flex justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 bg-purple-50/20">
                      <span className="text-gray-600 dark:text-gray-300">
                        + {fee.feeType?.nameAm || fee.feeType?.nameEn || fee.feeType?.code || "ተጨማሪ ክፍያ"} ({fee.remarks || "ልዩ"}):
                      </span>
                      <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                        ETB {Number(fee.amount || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-bold text-sm">
                    <span>ጠቅላላ ተከፋይ ድምር (Total Payable Amount):</span>
                    <span className="font-mono text-base text-blue-700 dark:text-blue-300">
                      ETB {Number(req.totalPayableAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STORE DISPATCH & EXECUTION */}
          {activeTab === "execution" && (
            <div className="space-y-6">
              {/* Store Dispatch Section */}
              <div className="bg-teal-50/40 dark:bg-teal-950/20 p-4 rounded-xl border border-teal-200 dark:border-teal-800">
                <h4 className="font-bold text-teal-950 dark:text-teal-300 pb-2 mb-3 flex items-center gap-2 border-b border-teal-200 dark:border-teal-800">
                  <PackageCheck className="w-4 h-4 text-teal-600" />
                  የመደብር ዕቃ ርክክብ (Store Material Dispatch)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="text-gray-500 block text-[11px]">ዕቃ አስረካቢ ስቶር ጠባቂ:</span>
                    <strong className="text-gray-900 dark:text-white">
                      {req.storekeeperUsername || "ገና አልወጣም"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">የወጣበት ቀን:</span>
                    <span className="font-mono font-semibold">
                      {req.materialsCollectedDate ? new Date(req.materialsCollectedDate).toLocaleString() : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">የዕቃ መውጫ ቫውቸር (Issue Voucher):</span>
                    <strong className="font-mono text-teal-800 dark:text-teal-300">
                      {req.invIssueVoucher?.voucherNumber || req.invIssueVoucher?.id || "—"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Maintenance Execution & Dual Plumber Comparison */}
              <div className="bg-cyan-50/40 dark:bg-cyan-950/20 p-4 rounded-xl border border-cyan-200 dark:border-cyan-800 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-cyan-200 dark:border-cyan-800">
                  <h4 className="font-bold text-cyan-950 dark:text-cyan-300 flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-cyan-600" />
                    የጥገና ባለሙያዎች እና አፈፃፀም (Technician Assignments & Execution)
                  </h4>
                  {req.surveyPlumber && req.maintenancePlumber && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200">
                      {req.surveyPlumber.id === req.maintenancePlumber.id
                        ? "✓ ተመሳሳይ ባለሙያ (Same Plumber for Survey & Repair)"
                        : "የተለያዩ ባለሙያዎች (Different Survey & Repair Plumbers)"}
                    </span>
                  )}
                </div>

                {/* Side-by-Side Comparison: Stage 2 Survey vs Stage 6 Repair */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stage 2 Plumber */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                      ደረጃ 2: የዳሰሳ ጥናትና ግምት ባለሙያ (Survey Plumber)
                    </span>
                    <strong className="text-sm text-gray-900 dark:text-white block">
                      {req.surveyPlumber
                        ? `${req.surveyPlumber.firstName} ${req.surveyPlumber.lastName}`
                        : "ያልተመደበ"}
                    </strong>
                    <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
                      <div>ስልክ: <span className="font-mono text-gray-700 dark:text-gray-300">{req.surveyPlumber?.phoneNumber || "—"}</span></div>
                      <div>የተመደበበት ቀን: <span className="font-mono">{req.surveyAssignedDate ? new Date(req.surveyAssignedDate).toLocaleString() : "—"}</span></div>
                      <div className="italic pt-1 text-gray-600 dark:text-gray-300">ማስታወሻ: {req.surveyPlumberNotes || "—"}</div>
                    </div>
                  </div>

                  {/* Stage 6 Plumber */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-cyan-200 dark:border-cyan-800/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 block mb-1">
                      ደረጃ 6: የተግባር ጥገና አፈፃፀም ባለሙያ (Repair Plumber)
                    </span>
                    <strong className="text-sm text-gray-900 dark:text-white block">
                      {req.maintenancePlumber
                        ? `${req.maintenancePlumber.firstName} ${req.maintenancePlumber.lastName}`
                        : "ገና አልተመደበም"}
                    </strong>
                    <div className="mt-2 text-[11px] text-gray-500 space-y-0.5">
                      <div>ስልክ: <span className="font-mono text-gray-700 dark:text-gray-300">{req.maintenancePlumber?.phoneNumber || "—"}</span></div>
                      <div>የተመደበበት ቀን: <span className="font-mono">{req.maintenanceAssignedDate ? new Date(req.maintenanceAssignedDate).toLocaleString() : "—"}</span></div>
                      <div>የተጠናቀቀበት ቀን: <span className="font-mono font-semibold text-emerald-600">{req.maintenanceCompletedDate ? new Date(req.maintenanceCompletedDate).toLocaleString() : "—"}</span></div>
                      <div>የመጨረሻ ቆጣሪ ንባብ: <strong className="font-mono">{req.finalMeterReading || "—"}</strong></div>
                      <div className="italic pt-1 text-gray-600 dark:text-gray-300">ማስታወሻ: {req.maintenanceNotes || "—"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateCostEstimationPdf(req)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1 text-gray-700 dark:text-gray-200 font-semibold"
            >
              <Printer className="w-4 h-4" />
              ቅጽ አትም (Print PDF)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Contextual Action Button if current user role matches ticket stage */}
            {req.status === "PENDING_SURVEY_ASSIGNMENT" && canAssignSurveyPlumber(userRoles) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAction(req, "survey_plumber");
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                ዳሰሳ ባለሙያ መድብ ➔
              </button>
            )}

            {req.status === "SURVEY_IN_PROGRESS" && canEncodeSurveyItems(userRoles) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAction(req, "survey_form");
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Calculator className="w-4 h-4" />
                ዕቃና ክፍያ ሙላ ➔
              </button>
            )}

            {req.status === "PENDING_PAYMENT_APPROVAL" && canApprovePayment(userRoles) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAction(req, "payment_approval");
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Banknote className="w-4 h-4" />
                ክፍያ አጽድቅ ➔
              </button>
            )}

            {req.status === "PENDING_STORE_COLLECTION" && canDispatchStoreItems(userRoles) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAction(req, "store_dispatch");
                }}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <PackageCheck className="w-4 h-4" />
                ዕቃ አስረክብ ➔
              </button>
            )}

            {req.status === "MATERIALS_COLLECTED" && canAssignMaintenancePlumber(userRoles) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAction(req, "maintenance_plumber");
                }}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <Wrench className="w-4 h-4" />
                የጥገና ባለሙያ መድብ ➔
              </button>
            )}

            {req.status === "MAINTENANCE_IN_PROGRESS" && canCompleteMaintenance(userRoles) && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAction(req, "complete_maintenance");
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                ጥገናውን አጠናቅቅ ➔
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-bold"
            >
              ዝጋ (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
