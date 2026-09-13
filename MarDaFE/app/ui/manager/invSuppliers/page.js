"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invSupplierService from "../../../lib/invSupplierService";
import { Truck, Plus, X, Edit2, Trash2, Search, ChevronLeft, ChevronRight, Phone, Mail, Building2 } from "lucide-react";

export default function InvSuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [form, setForm] = useState({
    supplierCode: "", supplierName: "", supplierNameAm: "", tin: "", phone: "", email: "",
    address: "", city: "", contactPerson: "", contactPhone: "", bankName: "", bankAccountNumber: "", isActive: true,
  });

  useEffect(() => { loadData(); }, [page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = searchQ ? await invSupplierService.search(searchQ, { page, size: 15 }) : await invSupplierService.getAll({ page, size: 15 });
      setSuppliers(data.content || []); setTotalPages(data.totalPages || 0);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(0); loadData(); };

  const resetForm = () => { setForm({ supplierCode: "", supplierName: "", supplierNameAm: "", tin: "", phone: "", email: "", address: "", city: "", contactPerson: "", contactPhone: "", bankName: "", bankAccountNumber: "", isActive: true }); setEditId(null); };

  const openEdit = (s) => {
    setForm({ supplierCode: s.supplierCode, supplierName: s.supplierName, supplierNameAm: s.supplierNameAm || "", tin: s.tin || "", phone: s.phone || "", email: s.email || "", address: s.address || "", city: s.city || "", contactPerson: s.contactPerson || "", contactPhone: s.contactPhone || "", bankName: s.bankName || "", bankAccountNumber: s.bankAccountNumber || "", isActive: s.isActive });
    setEditId(s.id); setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.supplierCode || !form.supplierName) { toast.error("Code and Name are required"); return; }
    try {
      if (editId) { await invSupplierService.update(editId, form); toast.success("Updated"); }
      else { await invSupplierService.create(form); toast.success("Created"); }
      setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => { if (!confirm("Delete?")) return; try { await invSupplierService.delete(id); toast.success("Deleted"); loadData(); } catch { toast.error("Error"); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Truck className="w-7 h-7 text-indigo-600" /> Suppliers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage vendor/supplier master data</p>
        </div>
        <button onClick={() => { resetForm(); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Supplier</button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search by name, code, or TIN..." className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <button type="submit" className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 text-gray-700 dark:text-gray-300">Search</button>
      </form>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">TIN</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">City</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               suppliers.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No suppliers found</td></tr> :
               suppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{s.supplierCode}</td>
                  <td className="px-5 py-3"><div className="font-medium text-gray-900 dark:text-white">{s.supplierName}</div></td>
                  <td className="px-5 py-3 font-mono text-gray-600">{s.tin || "—"}</td>
                  <td className="px-5 py-3">
                    <div className="text-gray-700 dark:text-gray-300">{s.phone && <span className="flex items-center gap-1 text-xs"><Phone className="w-3 h-3" />{s.phone}</span>}</div>
                    {s.email && <span className="flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3" />{s.email}</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-600">{s.city || "—"}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{s.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Supplier" : "New Supplier"}</h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code *</label>
                  <input value={form.supplierCode} onChange={(e) => setForm({ ...form, supplierCode: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" disabled={!!editId} /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TIN</label>
                  <input value={form.tin} onChange={(e) => setForm({ ...form, tin: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (Amharic)</label>
                <input value={form.supplierNameAm} onChange={(e) => setForm({ ...form, supplierNameAm: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">Contact Person</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Name</label>
                  <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                  <input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">Bank Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                  <input value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                  <input value={form.bankAccountNumber} onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 sticky bottom-0">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editId ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
