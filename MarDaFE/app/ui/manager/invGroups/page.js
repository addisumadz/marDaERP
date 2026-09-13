"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invGroupService from "../../../lib/invGroupService";
import invCategoryService from "../../../lib/invCategoryService";
import { ListTree, Plus, X, Edit2, Trash2 } from "lucide-react";

export default function InvGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterCat, setFilterCat] = useState("");
  const [form, setForm] = useState({ groupCode: "", groupName: "", groupNameAm: "", categoryId: "", isActive: true });

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadData(); }, [filterCat]);

  const loadCategories = async () => { try { const data = await invCategoryService.getAllActive(); setCategories(Array.isArray(data) ? data : data.content || []); } catch {} };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = filterCat ? await invGroupService.getByCategory(filterCat) : await invGroupService.getAll();
      setGroups(data.content || []);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  const resetForm = () => { setForm({ groupCode: "", groupName: "", groupNameAm: "", categoryId: "", isActive: true }); setEditId(null); };

  const handleSubmit = async () => {
    if (!form.groupCode || !form.groupName || !form.categoryId) { toast.error("Code, Name, and Category are required"); return; }
    try {
      if (editId) { await invGroupService.update(editId, form); toast.success("Updated"); }
      else { await invGroupService.create(form); toast.success("Created"); }
      setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await invGroupService.delete(id); toast.success("Deleted"); loadData(); } catch { toast.error("Error"); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ListTree className="w-7 h-7 text-indigo-600" /> Item Groups</h1>
          <p className="text-sm text-gray-500 mt-1">Sub-classification within categories</p>
        </div>
        <button onClick={() => { resetForm(); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Group</button>
      </div>

      <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.categoryCode} — {c.categoryName}</option>)}
      </select>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left">Code</th>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
             groups.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No groups found</td></tr> :
             groups.map(g => (
              <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4 font-mono font-semibold text-indigo-600">{g.groupCode}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{g.groupName}</td>
                <td className="px-6 py-4 text-gray-600">{g.category?.categoryCode || "—"}</td>
                <td className="px-6 py-4 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${g.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{g.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => { setForm({ groupCode: g.groupCode, groupName: g.groupName, groupNameAm: g.groupNameAm || "", categoryId: g.category?.id || "", isActive: g.isActive }); setEditId(g.id); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
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
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Group" : "New Group"}</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.categoryCode} — {c.categoryName}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                <input value={form.groupCode} onChange={(e) => setForm({ ...form, groupCode: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={!!editId} /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input value={form.groupName} onChange={(e) => setForm({ ...form, groupName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Amharic)</label>
                <input value={form.groupNameAm} onChange={(e) => setForm({ ...form, groupNameAm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
