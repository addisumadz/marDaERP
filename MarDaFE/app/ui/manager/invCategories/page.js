"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invCategoryService from "../../../lib/invCategoryService";
import { Tag, Plus, X, Edit2, Trash2, ChevronDown } from "lucide-react";

const ITEM_TYPES = ["CONSUMABLE", "NON_CONSUMABLE", "SERVICE"];
const TRACKING_TYPES = ["NONE", "BATCH", "EXPIRY", "SERIAL", "MOTOR"];

const trackingLabels = {
  NONE: "No Tracking",
  BATCH: "Batch Number (Papers, etc.)",
  EXPIRY: "Expiry Date (Chemicals)",
  SERIAL: "Serial Number (Electronics)",
  MOTOR: "Motor/Chassis/Plate (Vehicles)",
};

export default function InvCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    categoryCode: "", categoryName: "", categoryNameAm: "",
    description: "", itemType: "CONSUMABLE", trackingType: "NONE", isActive: true,
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invCategoryService.getAll();
      setCategories(data.content || []);
    } catch { toast.error("Failed to load categories"); }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ categoryCode: "", categoryName: "", categoryNameAm: "", description: "", itemType: "CONSUMABLE", trackingType: "NONE", isActive: true });
    setEditId(null);
  };

  const openCreate = () => { resetForm(); setModalOpen(true); };

  const openEdit = (cat) => {
    setForm({
      categoryCode: cat.categoryCode, categoryName: cat.categoryName,
      categoryNameAm: cat.categoryNameAm || "", description: cat.description || "",
      itemType: cat.itemType, trackingType: cat.trackingType, isActive: cat.isActive,
    });
    setEditId(cat.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.categoryCode || !form.categoryName) { toast.error("Code and Name are required"); return; }
    try {
      if (editId) {
        await invCategoryService.update(editId, form);
        toast.success("Category updated");
      } else {
        await invCategoryService.create(form);
        toast.success("Category created");
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error saving category"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try { await invCategoryService.delete(id); toast.success("Deleted"); loadData(); }
    catch { toast.error("Error deleting"); }
  };

  const badgeColor = (type) => {
    const colors = { CONSUMABLE: "bg-blue-100 text-blue-700", NON_CONSUMABLE: "bg-purple-100 text-purple-700", SERVICE: "bg-green-100 text-green-700" };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const trackBadge = (type) => {
    const colors = { NONE: "bg-gray-100 text-gray-600", BATCH: "bg-yellow-100 text-yellow-700", EXPIRY: "bg-red-100 text-red-700", SERIAL: "bg-indigo-100 text-indigo-700", MOTOR: "bg-orange-100 text-orange-700" };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-7 h-7 text-indigo-600" /> Item Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage item classification and tracking behavior</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Code</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Name (Am)</th>
                <th className="px-6 py-3 text-left">Item Type</th>
                <th className="px-6 py-3 text-left">Tracking</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No categories found. Create your first one!</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">{cat.categoryCode}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{cat.categoryName}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{cat.categoryNameAm || "—"}</td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor(cat.itemType)}`}>{cat.itemType}</span></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${trackBadge(cat.trackingType)}`}>{trackingLabels[cat.trackingType]}</span></td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${cat.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Category" : "New Category"}</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                  <input value={form.categoryCode} onChange={(e) => setForm({ ...form, categoryCode: e.target.value.toUpperCase() })} placeholder="e.g., PIPE" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent" disabled={!!editId} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item Type *</label>
                  <select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    {ITEM_TYPES.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (English) *</label>
                <input value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} placeholder="Pipes & Fittings" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Amharic)</label>
                <input value={form.categoryNameAm} onChange={(e) => setForm({ ...form, categoryNameAm: e.target.value })} placeholder="ቧንቧዎች" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tracking Type *</label>
                <select value={form.trackingType} onChange={(e) => setForm({ ...form, trackingType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                  {TRACKING_TYPES.map(t => <option key={t} value={t}>{trackingLabels[t]}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-1">Determines how items in this category are tracked (serial numbers, batch, expiry, etc.)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" id="cat-active" />
                <label htmlFor="cat-active" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
