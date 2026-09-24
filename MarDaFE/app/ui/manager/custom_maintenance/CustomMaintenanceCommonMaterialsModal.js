"use client";
import { useState, useEffect } from "react";
import { X, Package, Filter, Loader2, Info, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import customMaintenanceService from "../../../lib/customMaintenanceService";

export default function CustomMaintenanceCommonMaterialsModal({ isOpen, onClose }) {
  const [materials, setMaterials] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [selectedFilterTypeId, setSelectedFilterTypeId] = useState("ALL");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mats, types] = await Promise.all([
        customMaintenanceService.getCommonMaterials(),
        customMaintenanceService.getMaintenanceTypes(),
      ]);
      setMaterials(mats || []);
      setMaintenanceTypes(types || []);
    } catch (e) {
      console.error(e);
      toast.error("ካታሎግ መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    if (selectedFilterTypeId === "ALL") return true;
    return m.maintenanceType && String(m.maintenanceType.id) === String(selectedFilterTypeId);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-4xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-800 via-indigo-800 to-sky-800 text-white shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-200" />
            <div>
              <h2 className="text-base font-bold">የተለመዱ የጥገና ዕቃዎች ካታሎግ</h2>
              <p className="text-[11px] text-blue-200">በጥገና ዓይነት የተከፋፈሉ መደበኛ እቃዎች (እይታ ብቻ)</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only / Inventory Settings Notice */}
        <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-indigo-900 dark:text-indigo-200 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              ይህ ካታሎግ የጥገና ዕቃዎችን ዝርዝር ለማየት ብቻ የሚያገለግል ነው። አዳዲስ የጥገና ዕቃዎችን ለመመዝገብ፣ ለማስተካከል ወይም ለመሰረዝ በ <strong>Inventory Settings &gt; Maintenance Common Materials</strong> ገጽ ይጠቀሙ።
            </span>
          </div>
          <Link
            href="/ui/manager/invMaintenanceMaterials"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 underline whitespace-nowrap"
          >
            ወደ ማስተዳደሪያ ገጽ ሂድ <ExternalLink className="w-3 h-3 ml-0.5" />
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 dark:bg-gray-700/30 shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">በጥገና ዓይነት አጣራ:</span>
            <select
              value={selectedFilterTypeId}
              onChange={(e) => setSelectedFilterTypeId(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white font-medium"
            >
              <option value="ALL">ሁሉም የጥገና ዓይነቶች ({materials.length})</option>
              {maintenanceTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.typeNameAm} ({t.typeName})
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-gray-500">
            የተገኙ ዕቃዎች: <strong className="text-gray-900 dark:text-white font-mono">{filteredMaterials.length}</strong>
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-600" />
              ካታሎግ በመጫን ላይ...
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">ተ.ቁ</th>
                    <th className="py-2.5 px-3">የጥገና ዓይነት</th>
                    <th className="py-2.5 px-3">የእቃው ኮድ</th>
                    <th className="py-2.5 px-3">የእቃው ስም (አማርኛ)</th>
                    <th className="py-2.5 px-3">Material Name (Eng)</th>
                    <th className="py-2.5 px-3 w-20 text-center">መለኪያ</th>
                    <th className="py-2.5 px-3 w-24 text-right">መነሻ ዋጋ (ETB)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        ምንም የተመዘገበ ዕቃ የለም።
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="py-2 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-blue-700 dark:text-blue-400">
                          {m.maintenanceType?.typeNameAm || "አጠቃላይ"}
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-600 dark:text-gray-400">{m.materialCode}</td>
                        <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">{m.materialNameAm}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{m.materialName || "—"}</td>
                        <td className="py-2 px-3 text-center text-gray-500">{m.unitOfMeasure}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {(Number(m.defaultUnitPrice) || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
