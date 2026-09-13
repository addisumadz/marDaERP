"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invUnitService from "../../../lib/invUnitService";
import { Ruler, Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

export default function InvUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ unitCode: "", unitName: "", unitNameAm: "", isActive: true });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { const data = await invUnitService.getAll(); setUnits(data.content || []); }
    catch { toast.error("Failed to load units"); }
    setLoading(false);
  };

  const resetForm = () => { setForm({ unitCode: "", unitName: "", unitNameAm: "", isActive: true }); setEditId(null); };
  const openCreate = () => { resetForm(); setModalOpen(true); };
  const openEdit = (u) => {
    setForm({ unitCode: u.unitCode, unitName: u.unitName, unitNameAm: u.unitNameAm || "", isActive: u.isActive });
    setEditId(u.id); setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.unitCode || !form.unitName) { toast.error("Code and Name are required"); return; }
    try {
      if (editId) { await invUnitService.update(editId, form); toast.success("Unit updated"); }
      else { await invUnitService.create(form); toast.success("Unit created"); }
      setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error saving unit"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this unit?")) return;
    try { await invUnitService.delete(id); toast.success("Deleted"); loadData(); } catch { toast.error("Error"); }
  };

  const handleToggle = async (id) => {
    try { await invUnitService.toggleActive(id); loadData(); } catch { toast.error("Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Ruler className="w-7 h-7 text-indigo-600" /> Units of Measure
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Define measurement units for inventory items</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4" /> New Unit
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Code</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Name (Am)</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
            ) : units.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No units found</td></tr>
            ) : units.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-6 py-4 font-mono font-semibold text-indigo-600">{u.unitCode}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{u.unitName}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{u.unitNameAm || "—"}</td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => handleToggle(u.id)} className="inline-flex items-center gap-1">
                    {u.isActive ? <ToggleRight className="w-5 h-5 text-green-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    <span className={`text-xs font-semibold ${u.isActive ? "text-green-700" : "text-gray-400"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Unit" : "New Unit"}</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                <input value={form.unitCode} onChange={(e) => setForm({ ...form, unitCode: e.target.value.toUpperCase() })} placeholder="PCS" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" disabled={!!editId} /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input value={form.unitName} onChange={(e) => setForm({ ...form, unitName: e.target.value })} placeholder="Pieces" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Amharic)</label>
                <input value={form.unitNameAm} onChange={(e) => setForm({ ...form, unitNameAm: e.target.value })} placeholder="ብዛት" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
