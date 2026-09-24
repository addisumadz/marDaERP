"use client";
import { useState, useEffect } from "react";
import { X, Printer, Loader2, Wrench, Info, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { generateSurveyChecklistPdf } from "./customNewLinePdf";

export default function CustomCommonMaterialsModal({ isOpen, onClose }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
    }
  }, [isOpen]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const list = await customNewLineConnectionService.getCommonMaterials();
      setMaterials(list || []);
    } catch (e) {
      console.error(e);
      toast.error("ካታሎግ መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintChecklist = () => {
    if (materials.length === 0) {
      toast.warn("ምንም እቃ አልተገኘም");
      return;
    }
    generateSurveyChecklistPdf(materials, null);
    toast.success("የዳሰሳ ጥናት ፎርም (PDF) ተዘጋጅቷል");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-base font-bold">የተለመዱ የመስመር ዝርጋታ እቃዎች ካታሎግ</h2>
              <p className="text-[11px] text-gray-300">ለዳሰሳ ጥናትና ለግምት የሚውሉ የተመረጡ መደበኛ እቃዎች (እይታ ብቻ)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintChecklist}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" /> የዳሰሳ ጥናት ፎርም አትም (PDF)
            </button>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Read-only / Setting Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
            <div className="flex items-center gap-2 text-xs">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>
                ይህ ካታሎግ ዝርዝሩን ለማየትና ፎርም ለማተም ብቻ ያገለግላል። አዳዲስ ዕቃዎችን ለመመዝገብ ወይም ለማስተካከል በ <strong>Inventory Settings &gt; New Line Common Materials</strong> ገጽ ይጠቀሙ።
              </span>
            </div>
            <Link
              href="/ui/manager/invNewLineMaterials"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 underline whitespace-nowrap"
            >
              ወደ ማስተዳደሪያ ገጽ ሂድ <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>

          <div className="flex justify-between items-center text-gray-500 font-medium">
            <span>በካታሎግ ውስጥ ያሉ የተመዘገቡ እቃዎች ({materials.length})</span>
          </div>

          {/* Materials Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-3 py-2 w-10 text-center">#</th>
                  <th className="px-3 py-2">የእቃው ኮድ</th>
                  <th className="px-4 py-2">የእቃው ስም (አማርኛ)</th>
                  <th className="px-4 py-2">English Name</th>
                  <th className="px-3 py-2 text-center">መለኪያ</th>
                  <th className="px-4 py-2 text-right">መደበኛ ዋጋ (ETB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                      እቃዎችን በመጫን ላይ...
                    </td>
                  </tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      ምንም እቃ አልተገኘም
                    </td>
                  </tr>
                ) : (
                  materials.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-3 py-2 text-center font-mono text-gray-400">{m.displayOrder || idx + 1}</td>
                      <td className="px-3 py-2 font-mono font-medium text-blue-600 dark:text-blue-400">{m.materialCode}</td>
                      <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">{m.materialNameAm}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{m.materialName || "—"}</td>
                      <td className="px-3 py-2 text-center">{m.unitOfMeasure}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">
                        {(Number(m.defaultUnitPrice) || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
