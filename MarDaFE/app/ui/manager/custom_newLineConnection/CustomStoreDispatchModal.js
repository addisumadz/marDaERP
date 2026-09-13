"use client";
import { useState, useEffect, useMemo } from "react";
import { X, PackageCheck, Loader2, Store, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import invStoreService from "../../../lib/invStoreService";
import invStockService from "../../../lib/invStockService";
import { getUserRoles, isAdminRole, hasAnyRole } from "./customNewLineUserRoles";

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
    const itemId = it.invItem?.id || it.commonMaterial?.invItem?.id;
    if (itemId && itemId in storeStockMap) {
      return (storeStockMap[itemId] || 0) < Number(it.utilityQuantity || 0);
    }
    return false;
  });

  const handleDispatch = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customNewLineConnectionService.dispatchMaterials(request.id, {
        storeId: selectedStoreId ? Number(selectedStoreId) : null,
        remarks,
      });
      toast.success("እቃዎች ከስቶር ወጥተው ለደንበኛው/ባለሙያው በተሳካ ሁኔታ ተሰጥተዋል! የፋይናንስ ሰነድም ተመዝግቧል።");
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-teal-700 to-emerald-700 text-white">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-teal-200" />
            <h2 className="text-base font-bold">
              {canDispatch
                ? "የስቶር እቃዎች ማስረከቢያ (Store Material Release)"
                : "የስቶር እቃዎች ዝርዝር እይታ (Store Material Overview)"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <div className="bg-teal-50 dark:bg-teal-950/30 p-3 rounded-xl border border-teal-200 dark:border-teal-800 flex justify-between">
            <span>ማመልከቻ: <strong className="font-mono">{request.applicationNumber}</strong></span>
            <span>ደንበኛ: <strong>{request.customerFullName}</strong></span>
            <span>ደረሰኝ: <strong className="font-mono">{request.paymentReceiptNumber || "የተከፈለ"}</strong></span>
          </div>

          {/* Store Selector */}
          {stores.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-teal-600" />
                  ዕቃው የሚወጣበት ስቶር (Issuing Store)
                </span>
                {isAssignedStoreLocked ? (
                  <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                    የእርስዎ የተመደበ ስቶር (ቋሚ)
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500">የቅርንጫፍ ስቶር</span>
                )}
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                disabled={isAssignedStoreLocked || !canDispatch}
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed font-medium"
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.storeName} ({s.storeCode || ""})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock Warning Banner if insufficient */}
          {hasInsufficientStock && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>አንዳንድ እቃዎች በተመረጠው ስቶር ውስጥ በቂ ቀሪ የላቸውም! እባክዎ መጀመሪያ እቃ ወደ ስቶሩ ያስገቡ ወይም የተለየ ስቶር ይምረጡ።</span>
            </div>
          )}

          {/* Items Table */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                ከድርጅቱ የሚረከቡ እቃዎች ዝርዝር ({utilityItems.length} እቃዎች)
              </h4>
              {loadingStock && (
                <span className="text-[10px] text-teal-600 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> የስቶር ቀሪ በመፈተሽ ላይ...
                </span>
              )}
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold text-[10px]">
                  <tr>
                    <th className="px-3 py-1.5">እቃ</th>
                    <th className="px-2 py-1.5 text-center">መለኪያ</th>
                    <th className="px-2 py-1.5 text-center">የሚወጣ ብዛት</th>
                    <th className="px-2 py-1.5 text-center">በስቶር ያለ</th>
                    <th className="px-3 py-1.5 text-right">የአንዱ ዋጋ</th>
                    <th className="px-3 py-1.5 text-right">ጠቅላላ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {utilityItems.map((it, i) => {
                    const itemId = it.invItem?.id || it.commonMaterial?.invItem?.id;
                    const availableStock = itemId && itemId in storeStockMap ? storeStockMap[itemId] : null;
                    const isDeficit = availableStock !== null && availableStock < Number(it.utilityQuantity || 0);

                    return (
                      <tr key={i} className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${isDeficit ? "bg-rose-50/50 dark:bg-rose-950/20" : ""}`}>
                        <td className="px-3 py-1.5 font-medium">{it.itemNameAm || it.itemName}</td>
                        <td className="px-2 py-1.5 text-center text-gray-500">{it.unitOfMeasure || "በቁጥር"}</td>
                        <td className="px-2 py-1.5 text-center font-bold text-teal-600 dark:text-teal-400">
                          {it.utilityQuantity}
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          {availableStock !== null ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDeficit 
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800" 
                                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            }`}>
                              {availableStock}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-[10px]">-</span>
                          )}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          ETB {Number(it.utilityUnitPrice || 0).toFixed(2)}
                        </td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">
                          ETB {Number(it.utilityTotalPrice || 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {canDispatch ? (
            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የስቶር ኃላፊ ማስታወሻ
                </label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="ለምሳሌ: ሁሉም እቃዎች ተሟልተው ለደንበኛው ተሰጥተዋል"
                  className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ይቅር
                </button>
                <button
                  type="submit"
                  disabled={submitting || hasInsufficientStock}
                  className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {submitting ? "በማውጣት ላይ..." : "እቃዎችን አስረክብ (Release & Deduct Stock)"}
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
