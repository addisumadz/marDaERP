"use client";
import { useState, useEffect, useMemo } from "react";
import { X, PackageCheck, Loader2, Store, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import invStoreService from "../../../lib/invStoreService";
import invStockService from "../../../lib/invStockService";
import { getUserRoles, isAdminRole, hasAnyRole } from "./customMaintenanceUserRoles";

export default function CustomStoreDispatchModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  userRoles: propUserRoles,
}) {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storeStockMap, setStoreStockMap] = useState({});
  const [loadingStock, setLoadingStock] = useState(false);
  const [isAssignedStoreLocked, setIsAssignedStoreLocked] = useState(false);

  // Determine effective user roles and check if store material release is permitted
  const effectiveRoles = useMemo(() => {
    if (propUserRoles && Array.isArray(propUserRoles) && propUserRoles.length > 0) {
      return propUserRoles;
    }
    return getUserRoles();
  }, [propUserRoles]);

  const isStore = useMemo(() => {
    return hasAnyRole(effectiveRoles, [
      "m_branch_store",
      "m_main_store",
      "storemanager",
      "store person",
      "asset officer",
      "storekeeper",
      "inv_storekeeper",
      "መደብር",
      "መጋዘን",
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

  // Gebi / Revenue Officer (and other non-store roles) must NEVER have store dispatch capability
  const canDispatch = useMemo(() => {
    if (isRevenueOfficer && !isStore) {
      return false;
    }
    return isStore || (isAdminRole(effectiveRoles) && !isRevenueOfficer);
  }, [isStore, isRevenueOfficer, effectiveRoles]);

  useEffect(() => {
    if (isOpen) {
      loadStores();
      setRemarks("");
      setStoreStockMap({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedStoreId) {
      loadStoreStock(selectedStoreId);
    }
  }, [selectedStoreId]);

  const loadStores = async () => {
    setLoading(true);
    try {
      let storeList = [];
      let locked = false;

      // 1. Try to load user's explicitly assigned stores from inv-store-users/my-stores
      try {
        const myStoreUsers = await invStoreService.getMyStores();
        if (Array.isArray(myStoreUsers) && myStoreUsers.length > 0) {
          storeList = myStoreUsers
            .map((su) => su.store)
            .filter((s) => s && s.deleted !== "Yes");
          if (storeList.length > 0) {
            locked = true;
          }
        }
      } catch (err) {
        console.warn("Could not load my-stores:", err);
      }

      // 2. If no stores assigned, fallback to branch store
      if (storeList.length === 0 && invStoreService && invStoreService.getAll) {
        const res = await invStoreService.getAll();
        const allStores = Array.isArray(res) ? res : res.content || [];
        if (request?.branch?.id) {
          const branchStores = allStores.filter((s) => s.branch?.id === request.branch.id);
          storeList = branchStores.length > 0 ? branchStores : allStores;
        } else {
          storeList = allStores;
        }
      }

      setStores(storeList);
      setIsAssignedStoreLocked(locked || storeList.length === 1);
      if (storeList.length > 0) {
        setSelectedStoreId(String(storeList[0].id));
      }
    } catch (e) {
      console.warn("Store load fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadStoreStock = async (storeId) => {
    setLoadingStock(true);
    try {
      const res = await invStockService.getStockByStore(storeId, { size: 200 });
      const stockList = Array.isArray(res) ? res : res?.content || [];
      const map = {};
      stockList.forEach((s) => {
        if (s.item?.id) {
          map[s.item.id] = Number(s.availableQuantity ?? s.quantityOnHand ?? 0);
        }
      });
      setStoreStockMap(map);
    } catch (e) {
      console.warn("Could not load store stock:", e);
    } finally {
      setLoadingStock(false);
    }
  };

  const utilityItems = (request?.items || []).filter((it) => Number(it.utilityQuantity) > 0);

  // Check if any item has stock deficit
  const hasInsufficientStock = utilityItems.some((it) => {
    const itemId = it.invItem?.id || it.maintenanceCommonMaterial?.invItem?.id;
    if (itemId && itemId in storeStockMap) {
      return (storeStockMap[itemId] || 0) < Number(it.utilityQuantity || 0);
    }
    return false;
  });

  const handleDispatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customMaintenanceService.dispatchMaterials(request.id, {
        storeId: selectedStoreId ? Number(selectedStoreId) : null,
        remarks,
      });
      toast.success("የጥገና እቃዎች ከመጋዘን ወጥተው ለባለሙያው በተሳካ ሁኔታ ተሰጥተዋል! የፋይናንስ ሰነድም ተመዝግቧል።");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "እቃዎችን ማውጣት አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-teal-200" />
            <h2 className="text-base font-bold">
              {canDispatch
                ? "የጥገና ዕቃዎች ማውጫ እና ማረጋገጫ (Store Material Dispatch)"
                : "የጥገና ዕቃዎች ዝርዝር እይታ (Store Material Overview)"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Summary Card */}
          <div className="bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-xl p-3.5 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-teal-700 dark:text-teal-400 font-semibold">የጥገና ቁጥር:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{request.requestNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-teal-700 dark:text-teal-400 font-semibold">የደንበኛ ስም:</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{request.customerFullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-teal-700 dark:text-teal-400 font-semibold">የጥገና ዓይነት:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {request.maintenanceType?.typeNameAm || "አጠቃላይ ጥገና"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-teal-700 dark:text-teal-400 font-semibold">የክፍያ ደረሰኝ ቁጥር:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{request.paymentReceiptNumber || "ተረጋግጧል"}</span>
            </div>
          </div>

          {/* Store Selection */}
          <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-teal-600" />
                ዕቃው የሚወጣበት መጋዘን (Store) <span className="text-red-500">*</span>
              </span>
              {isAssignedStoreLocked && (
                <span className="text-[10px] text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-2 py-0.5 rounded-full font-semibold">
                  የተመደበ መጋዘን (ቋሚ)
                </span>
              )}
            </label>
            {loading ? (
              <div className="text-xs text-gray-500 py-1 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                መጋዘን በመጫን ላይ...
              </div>
            ) : (
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                disabled={(isAssignedStoreLocked && stores.length <= 1) || !canDispatch}
                required
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed font-medium"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.storeName} ({s.storeCode})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Stock Warning Banner if insufficient */}
          {hasInsufficientStock && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>አንዳንድ እቃዎች በተመረጠው ስቶር ውስጥ በቂ ቀሪ የላቸውም! እባክዎ መጀመሪያ እቃ ወደ ስቶሩ ያስገቡ ወይም የተለየ ስቶር ይምረጡ።</span>
            </div>
          )}

          {/* Utility Materials Checklist */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                ከድርጅቱ መጋዘን የሚወጡ ዕቃዎች ዝርዝር ({utilityItems.length} እቃዎች):
              </label>
              {loadingStock && (
                <span className="text-[10px] text-teal-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> የስቶር ቀሪ በመፈተሽ ላይ...
                </span>
              )}
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-xl max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
              {utilityItems.length === 0 ? (
                <div className="p-4 text-center text-xs text-gray-400">
                  ከድርጅቱ የሚወጣ ዕቃ የለም (ሁሉም ዕቃዎች በደንበኛው ከውጭ የሚቀርቡ ናቸው)
                </div>
              ) : (
                utilityItems.map((it, idx) => {
                  const itemId = it.invItem?.id || it.maintenanceCommonMaterial?.invItem?.id;
                  const availableStock = itemId && itemId in storeStockMap ? storeStockMap[itemId] : null;
                  const isDeficit = availableStock !== null && availableStock < Number(it.utilityQuantity || 0);

                  return (
                    <div key={idx} className={`p-2.5 flex items-center justify-between text-xs hover:bg-gray-50 dark:hover:bg-gray-700/30 ${isDeficit ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {it.itemNameAm || it.itemName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                          {it.utilityQuantity} {it.unitOfMeasure}
                        </span>

                        {availableStock !== null ? (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isDeficit 
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800" 
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          }`}>
                            በስቶር ያለ: {availableStock}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">-</span>
                        )}

                        <span className="text-gray-400">|</span>
                        <span className="font-mono text-gray-600 dark:text-gray-300">
                          {(Number(it.utilityTotalPrice) || 0).toFixed(2)} ብር
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {canDispatch ? (
            <form onSubmit={handleDispatch} className="space-y-4">
              {/* Remarks */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የስቶር ኃላፊ ማስታወሻ (Remarks)
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="ለምሳሌ: ዕቃው ለባለሙያው ተረክቧል..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={submitting || hasInsufficientStock}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {submitting ? "በማውጣት ላይ..." : "ዕቃዎቹን አስረክብ (Release & Deduct Stock)"}
                </button>
              </div>
            </form>
          ) : (
            /* Non-Store / Gebi Officer Read-Only Card (Material Release Button Removed) */
            <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-xs pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-700 text-teal-700 dark:text-teal-400 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>የስቶር እቃዎች ማስረከቢያ (Store Material Release)</span>
              </div>
              <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-1.5 text-teal-900 dark:text-teal-200">
                <p className="font-bold text-xs">
                  ይህ ደረጃ በመደብር ክፍል (Storekeeper / Inventory Store) ብቻ የሚከናወን ነው
                </p>
                <p className="text-[11px] text-teal-800 dark:text-teal-300 leading-relaxed">
                  ዕቃዎችን ከስቶር ማውጣት እና ማስረከብ የመደብር ክፍል ኃላፊነት ስለሆነ ለገቢዎች/ሌሎች ክፍሎች ተዘግቷል። ደንበኛው ወይም ባለሙያው እቃውን ከመደብር ክፍል እንዲረከብ ያሳውቁ።
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
