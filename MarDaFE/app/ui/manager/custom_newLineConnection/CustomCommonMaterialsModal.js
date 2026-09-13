"use client";
import { useState, useEffect } from "react";
import { X, Plus, Printer, Save, Loader2, Wrench } from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { generateSurveyChecklistPdf } from "./customNewLinePdf";

export default function CustomCommonMaterialsModal({ isOpen, onClose }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Material Form
  const [showAdd, setShowAdd] = useState(false);
  const [newMat, setNewMat] = useState({
    materialCode: "",
    materialName: "",
    materialNameAm: "",
    unitOfMeasure: "በቁጥር",
    defaultUnitPrice: 0,
    displayOrder: 0,
  });

  useEffect(() => {
    if (isOpen) {
      loadMaterials();
      setShowAdd(false);
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMat.materialNameAm || !newMat.materialCode) {
      toast.error("የእቃ ኮድ እና የአማርኛ ስም ግዴታ ነው");
      return;
    }

    setSaving(true);
    try {
      await customNewLineConnectionService.saveCommonMaterial({
        ...newMat,
        defaultUnitPrice: Number(newMat.defaultUnitPrice) || 0,
        displayOrder: Number(newMat.displayOrder) || materials.length + 1,
        isActive: true,
      });
      toast.success("አዲስ እቃ ተመዝግቧል");
      setShowAdd(false);
      setNewMat({
        materialCode: "",
        materialName: "",
        materialNameAm: "",
        unitOfMeasure: "በቁጥር",
        defaultUnitPrice: 0,
        displayOrder: 0,
      });
      loadMaterials();
    } catch (error) {
      toast.error(error.response?.data?.message || "እቃውን መመዝገብ አልተቻለም");
    } finally {
      setSaving(false);
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
              <p className="text-[11px] text-gray-300">ለዳሰሳ ጥናትና ለግምት የሚውሉ የተመረጡ መደበኛ እቃዎች</p>
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
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">
              በካታሎግ ውስጥ ያሉ የተመዘገቡ እቃዎች ({materials.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAdd(!showAdd)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-800 dark:text-gray-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> {showAdd ? "ቅጽ ዝጋ" : "አዲስ እቃ መዝግብ"}
            </button>
          </div>

          {/* Add form */}
          {showAdd && (
            <form onSubmit={handleCreate} className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 animate-in fade-in">
              <h4 className="font-bold text-blue-900 dark:text-blue-200 text-xs">አዲስ የተለመደ እቃ መመዝገቢያ</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">የእቃ ኮድ *</label>
                  <input
                    type="text"
                    required
                    value={newMat.materialCode}
                    onChange={(e) => setNewMat({ ...newMat, materialCode: e.target.value })}
                    placeholder="MAT_EXAMPLE"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">የእቃ ስም (አማርኛ) *</label>
                  <input
                    type="text"
                    required
                    value={newMat.materialNameAm}
                    onChange={(e) => setNewMat({ ...newMat, materialNameAm: e.target.value })}
                    placeholder="ለምሳሌ: ቧንቧ 1/2"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Item Name (English)</label>
                  <input
                    type="text"
                    value={newMat.materialName}
                    onChange={(e) => setNewMat({ ...newMat, materialName: e.target.value })}
                    placeholder="e.g. GI Pipe 1/2"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">መለኪያ</label>
                  <input
                    type="text"
                    value={newMat.unitOfMeasure}
                    onChange={(e) => setNewMat({ ...newMat, unitOfMeasure: e.target.value })}
                    placeholder="በቁጥር / ሜትር"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">መደበኛ ዋጋ (ETB)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMat.defaultUnitPrice}
                    onChange={(e) => setNewMat({ ...newMat, defaultUnitPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">ቅደም ተከተል</label>
                  <input
                    type="number"
                    value={newMat.displayOrder}
                    onChange={(e) => setNewMat({ ...newMat, displayOrder: e.target.value })}
                    placeholder="1"
                    className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  መዝግብ
                </button>
              </div>
            </form>
          )}

          {/* Materials Table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
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
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                      እቃዎችን በመጫን ላይ...
                    </td>
                  </tr>
                ) : materials.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                      ምንም እቃ አልተገኘም
                    </td>
                  </tr>
                ) : (
                  materials.map((m, idx) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-3 py-2 text-center font-mono text-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2 font-mono font-medium text-blue-600 dark:text-blue-400">{m.materialCode}</td>
                      <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">{m.materialNameAm}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{m.materialName}</td>
                      <td className="px-3 py-2 text-center">{m.unitOfMeasure}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">
                        {Number(m.defaultUnitPrice).toFixed(2)}
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
