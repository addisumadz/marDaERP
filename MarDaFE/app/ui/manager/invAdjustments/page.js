"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invAdjustmentService from "../../../lib/invAdjustmentService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import { ClipboardCheck, Plus, X, Check, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";

const statusColors = { DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700", APPROVED: "bg-amber-100 text-amber-700", APPLIED: "bg-green-100 text-green-700" };

export default function InvAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState({ storeId: "", adjustmentType: "PHYSICAL_COUNT", remarks: "", lines: [{ itemId: "", actualQuantity: "", reason: "" }] });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page]);

  const loadLookups = async () => { try { const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]); setStores(s); setItems(i); } catch {} };
  const loadData = async () => { setLoading(true); try { const data = await invAdjustmentService.getAll({ page, size: 15 }); setAdjustments(data.content || []); setTotalPages(data.totalPages || 0); } catch { toast.error("Failed"); } setLoading(false); };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { itemId: "", actualQuantity: "", reason: "" }] });
  const removeLine = (idx) => setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, field, value) => { const lines = [...form.lines]; lines[idx][field] = value; setForm({ ...form, lines }); };

  const handleCreate = async () => {
    if (!form.storeId) { toast.error("Select a store"); return; }
    const validLines = form.lines.filter(l => l.itemId && l.actualQuantity !== "");
    if (validLines.length === 0) { toast.error("Add at least one line"); return; }
    try {
      await invAdjustmentService.create({ storeId: Number(form.storeId), adjustmentType: form.adjustmentType, remarks: form.remarks, lines: validLines.map(l => ({ itemId: Number(l.itemId), actualQuantity: l.actualQuantity, reason: l.reason })) });
      toast.success("Adjustment created with auto-variance calculation"); setModalOpen(false); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleApprove = async (id) => {
    try { await invAdjustmentService.approve(id); toast.success("Approved"); loadData(); }
    catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleApply = async (id) => {
    if (!confirm("Apply adjustment? Stock will be updated and a finance entry created for variances.")) return;
    try { await invAdjustmentService.apply(id); toast.success("Applied — stock adjusted!"); loadData(); }
    catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardCheck className="w-7 h-7 text-indigo-600" /> Stock Adjustments</h1>
          <p className="text-sm text-gray-500 mt-1">Physical counts and variance reconciliation</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Adjustment</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Adjustment #</th><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Store</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               adjustments.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No adjustments found</td></tr> :
               adjustments.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{a.adjustmentNumber}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">{a.adjustmentType?.replace("_", " ")}</span></td>
                  <td className="px-5 py-3">{a.store?.storeName}</td>
                  <td className="px-5 py-3 text-gray-600">{a.adjustmentDate}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[a.status]}`}>{a.status}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {(a.status === "DRAFT" || a.status === "SUBMITTED") && <button onClick={() => handleApprove(a.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Approve"><Check className="w-4 h-4" /></button>}
                      {a.status === "APPROVED" && <button onClick={() => handleApply(a.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Apply"><CheckCheck className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10"><h2 className="text-lg font-semibold">New Stock Adjustment</h2><button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">System quantities will be auto-populated. Enter the actual physical count — variance is calculated automatically.</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Store *</label>
                  <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Type</label>
                  <select value={form.adjustmentType} onChange={(e) => setForm({ ...form, adjustmentType: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                    <option value="PHYSICAL_COUNT">Physical Count</option><option value="WRITE_OFF">Write-Off</option><option value="DAMAGE">Damage</option><option value="CORRECTION">Correction</option>
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Remarks</label>
                <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              <h3 className="font-semibold pt-2 border-t">Count Lines</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 rounded-lg p-3">
                  <div className="col-span-5"><label className="text-xs text-gray-500">Item</label>
                    <select value={line.itemId} onChange={(e) => updateLine(idx, "itemId", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}</select></div>
                  <div className="col-span-2"><label className="text-xs text-gray-500">Actual Qty</label>
                    <input type="number" value={line.actualQuantity} onChange={(e) => updateLine(idx, "actualQuantity", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-4"><label className="text-xs text-gray-500">Reason</label>
                    <input value={line.reason} onChange={(e) => updateLine(idx, "reason", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-1">{form.lines.length > 1 && <button onClick={() => removeLine(idx)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>}</div>
                </div>
              ))}
              <button onClick={addLine} className="text-sm text-indigo-600 font-medium">+ Add Line</button>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Create Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
