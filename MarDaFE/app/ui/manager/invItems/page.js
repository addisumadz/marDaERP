"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invItemService from "../../../lib/invItemService";
import invCategoryService from "../../../lib/invCategoryService";
import invGroupService from "../../../lib/invGroupService";
import invUnitService from "../../../lib/invUnitService";
import { PackageSearch, Plus, X, Edit2, Trash2, Search, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

const ITEM_USAGES = ["FOR_SALE", "INTERNAL_USE", "BOTH"];

export default function InvItemsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [form, setForm] = useState({
    itemName: "", itemNameAm: "", description: "", categoryId: "", itemGroupId: "",
    unitOfMeasureId: "", reorderLevel: 10, reorderQuantity: 50, itemUsage: "BOTH",
    defaultUnitCost: "", isActive: true,
  });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page, filterCategory]);

  const loadLookups = async () => {
    try {
      const [cats, uoms] = await Promise.all([invCategoryService.getAllActive(), invUnitService.getAllActive()]);
      setCategories(cats); setUnits(uoms);
    } catch { toast.error("Failed to load lookups"); }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = searchQ
        ? await invItemService.search(searchQ, { page, size: 15 })
        : await invItemService.getAll({ page, size: 15, categoryId: filterCategory || undefined });
      setItems(data.content || []); setTotalPages(data.totalPages || 0);
    } catch { toast.error("Failed to load items"); }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault(); setPage(0); loadData();
  };

  const loadGroups = async (catId) => {
    if (!catId) { setGroups([]); return; }
    try { setGroups(await invGroupService.getActiveByCategory(catId)); } catch { setGroups([]); }
  };

  const resetForm = () => {
    setForm({ itemName: "", itemNameAm: "", description: "", categoryId: "", itemGroupId: "", unitOfMeasureId: "", reorderLevel: 10, reorderQuantity: 50, itemUsage: "BOTH", defaultUnitCost: "", isActive: true });
    setEditId(null); setGroups([]);
  };

  const openCreate = () => { resetForm(); setModalOpen(true); };

  const openEdit = (item) => {
    setForm({
      itemName: item.itemName, itemNameAm: item.itemNameAm || "", description: item.description || "",
      categoryId: item.category?.id || "", itemGroupId: item.itemGroup?.id || "",
      unitOfMeasureId: item.unitOfMeasure?.id || "", reorderLevel: item.reorderLevel || 0,
      reorderQuantity: item.reorderQuantity || 0, itemUsage: item.itemUsage || "BOTH",
      defaultUnitCost: item.defaultUnitCost || "", isActive: item.isActive,
    });
    if (item.category?.id) loadGroups(item.category.id);
    setEditId(item.id); setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.itemName || !form.categoryId || !form.unitOfMeasureId) { toast.error("Name, Category, and Unit are required"); return; }
    try {
      if (editId) { await invItemService.update(editId, form); toast.success("Item updated"); }
      else { await invItemService.create(form); toast.success("Item created — code auto-generated!"); }
      setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error saving item"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    try { await invItemService.delete(id); toast.success("Deleted"); loadData(); } catch { toast.error("Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageSearch className="w-7 h-7 text-indigo-600" /> Items Master
          </h1>
          <p className="text-sm text-gray-500 mt-1">Item codes are auto-generated from category code (e.g., PIPE-00001)</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4" /> New Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search items..." className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <button type="submit" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 text-gray-700 dark:text-gray-300">Search</button>
        </form>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setSearchQ(""); setPage(0); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.categoryCode} — {c.categoryName}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-left">Unit</th>
                <th className="px-5 py-3 text-left">Tracking</th>
                <th className="px-5 py-3 text-right">Default Cost</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No items found</td></tr>
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{item.itemCode}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900 dark:text-white">{item.itemName}</div>
                    {item.itemNameAm && <div className="text-xs text-gray-500">{item.itemNameAm}</div>}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{item.category?.categoryCode || "—"}</td>
                  <td className="px-5 py-3 text-gray-600 dark:text-gray-400">{item.unitOfMeasure?.unitCode || "—"}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{item.trackingType || "NONE"}</span></td>
                  <td className="px-5 py-3 text-right font-mono text-gray-700 dark:text-gray-300">{item.defaultUnitCost ? `ETB ${Number(item.defaultUnitCost).toLocaleString()}` : "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Item" : "New Item"}</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {!editId && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-sm text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <PackageSearch className="w-4 h-4" /> Item code will be auto-generated from category (e.g., PIPE-00001)
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={(e) => { setForm({ ...form, categoryId: e.target.value, itemGroupId: "" }); loadGroups(e.target.value); }} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.categoryCode} — {c.categoryName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group</label>
                  <select value={form.itemGroupId} onChange={(e) => setForm({ ...form, itemGroupId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">No Group</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.groupCode} — {g.groupName}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (English) *</label>
                <input value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} placeholder="2-inch PVC Pipe" className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Amharic)</label>
                <input value={form.itemNameAm} onChange={(e) => setForm({ ...form, itemNameAm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit *</label>
                  <select value={form.unitOfMeasureId} onChange={(e) => setForm({ ...form, unitOfMeasureId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.unitCode} — {u.unitName}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usage</label>
                  <select value={form.itemUsage} onChange={(e) => setForm({ ...form, itemUsage: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {ITEM_USAGES.map(u => <option key={u} value={u}>{u.replace("_", " ")}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Cost (ETB)</label>
                  <input type="number" step="0.01" value={form.defaultUnitCost} onChange={(e) => setForm({ ...form, defaultUnitCost: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Level</label>
                  <input type="number" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reorder Quantity</label>
                  <input type="number" value={form.reorderQuantity} onChange={(e) => setForm({ ...form, reorderQuantity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 sticky bottom-0">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
