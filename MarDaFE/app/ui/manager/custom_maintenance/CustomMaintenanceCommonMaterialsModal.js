"use client";
import { useState, useEffect } from "react";
import { X, Plus, Edit2, Trash2, CheckCircle, Loader2, Package, Filter } from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";

export default function CustomMaintenanceCommonMaterialsModal({ isOpen, onClose }) {
  const [materials, setMaterials] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [selectedFilterTypeId, setSelectedFilterTypeId] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    maintenanceTypeId: "",
    materialCode: "",
    materialName: "",
    materialNameAm: "",
    unitOfMeasure: "በቁጥር",
    defaultUnitPrice: 0,
    displayOrder: 1,
    isActive: true,
  });

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

  const handleOpenAdd = () => {
    const defaultType = selectedFilterTypeId !== "ALL" ? selectedFilterTypeId : (maintenanceTypes[0]?.id ? String(maintenanceTypes[0].id) : "");
    setEditForm({
      id: null,
      maintenanceTypeId: defaultType,
      materialCode: `MNT-MAT-${Date.now().toString().slice(-4)}`,
      materialName: "",
      materialNameAm: "",
      unitOfMeasure: "በቁጥር",
      defaultUnitPrice: 0,
      displayOrder: materials.length + 1,
      isActive: true,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (item) => {
    setEditForm({
      id: item.id,
      maintenanceTypeId: item.maintenanceType?.id ? String(item.maintenanceType.id) : "",
      materialCode: item.materialCode,
      materialName: item.materialName,
      materialNameAm: item.materialNameAm,
      unitOfMeasure: item.unitOfMeasure,
      defaultUnitPrice: item.defaultUnitPrice,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editForm.materialName || !editForm.materialNameAm) {
      toast.error("የእቃው ስም በአማርኛ እና በእንግሊዘኛ መሞላት አለበት");
      return;
    }
    if (!editForm.maintenanceTypeId) {
      toast.error("እባክዎ የጥገና ዓይነት ይምረጡ");
      return;
    }

    try {
      const payload = {
        id: editForm.id,
        maintenanceType: { id: Number(editForm.maintenanceTypeId) },
        materialCode: editForm.materialCode,
        materialName: editForm.materialName,
        materialNameAm: editForm.materialNameAm,
        unitOfMeasure: editForm.unitOfMeasure,
        defaultUnitPrice: parseFloat(editForm.defaultUnitPrice) || 0,
        displayOrder: parseInt(editForm.displayOrder) || 1,
        isActive: editForm.isActive,
      };

      await customMaintenanceService.saveCommonMaterial(payload);
      toast.success("የጥገና ካታሎግ ዕቃ ተቀምጧል!");
      setIsEditing(false);
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("ዕቃውን ማስቀመጥ አልተቻለም");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("እርግጠኛ ነዎት ይህን ዕቃ ከካታሎግ መሰረዝ ይፈልጋሉ?")) return;
    try {
      await customMaintenanceService.deleteCommonMaterial(id);
      toast.success("ዕቃው ተሰርዟል");
      loadData();
    } catch (err) {
      console.error(err);
      toast.error("ዕቃውን መሰረዝ አልተቻለም");
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
            <h2 className="text-lg font-bold">የተለመዱ የጥገና ዕቃዎች ካታሎግ ማስተዳደሪያ</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Add Action Bar */}
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

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            አዲስ ዕቃ መዝግብ
          </button>
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
                    <th className="py-2.5 px-3 w-24 text-right">መነሻ ዋጋ</th>
                    <th className="py-2.5 px-3 w-20 text-center">ድርጊት</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        ምንም የተመዘገበ ዕቃ የለም።
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((m, idx) => (
                      <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-2 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-semibold text-blue-700 dark:text-blue-400">
                          {m.maintenanceType?.typeNameAm || "አጠቃላይ"}
                        </td>
                        <td className="py-2 px-3 font-mono text-gray-600 dark:text-gray-400">{m.materialCode}</td>
                        <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white">{m.materialNameAm}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-300">{m.materialName}</td>
                        <td className="py-2 px-3 text-center text-gray-500">{m.unitOfMeasure}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {(Number(m.defaultUnitPrice) || 0).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(m)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="አስተካክል"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="አስወግድ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Inline Add/Edit Drawer / Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  {editForm.id ? "ዕቃውን አስተካክል" : "አዲስ የካታሎግ ዕቃ መዝግብ"}
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የጥገና ዓይነት (Maintenance Type) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editForm.maintenanceTypeId}
                    onChange={(e) => setEditForm({ ...editForm, maintenanceTypeId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    {maintenanceTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.typeNameAm} ({t.typeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">የዕቃው ኮድ</label>
                  <input
                    type="text"
                    required
                    value={editForm.materialCode}
                    onChange={(e) => setEditForm({ ...editForm, materialCode: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-mono bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የዕቃው ስም (አማርኛ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.materialNameAm}
                    onChange={(e) => setEditForm({ ...editForm, materialNameAm: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Material Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.materialName}
                    onChange={(e) => setEditForm({ ...editForm, materialName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">መለኪያ</label>
                    <input
                      type="text"
                      value={editForm.unitOfMeasure}
                      onChange={(e) => setEditForm({ ...editForm, unitOfMeasure: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">መነሻ ዋጋ (ETB)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={editForm.defaultUnitPrice}
                      onChange={(e) => setEditForm({ ...editForm, defaultUnitPrice: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg font-mono bg-gray-50 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700"
                  >
                    ሰርዝ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                  >
                    መዝግብ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
