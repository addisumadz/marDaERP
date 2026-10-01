"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invDisposalService from "../../../lib/invDisposalService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import {
  Trash2, Plus, X, Eye, Send, Play, Ban,
  ChevronLeft, ChevronRight, Printer, Calendar, Building2,
  User, AlertCircle
} from "lucide-react";

const statusColors = { DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700", IN_APPROVAL: "bg-amber-100 text-amber-700", APPROVED: "bg-green-100 text-green-700", EXECUTED: "bg-emerald-100 text-emerald-700", REJECTED: "bg-red-100 text-red-700", CANCELLED: "bg-gray-200 text-gray-500" };
const disposalTypes = ["DAMAGED", "EXPIRED", "OBSOLETE", "SCRAP", "OTHER"];
const disposalTypeColors = { DAMAGED: "bg-red-100 text-red-700", EXPIRED: "bg-orange-100 text-orange-700", OBSOLETE: "bg-gray-100 text-gray-700", SCRAP: "bg-amber-100 text-amber-700", OTHER: "bg-blue-100 text-blue-700" };

export default function InvDisposalPage() {
  const [disposals, setDisposals] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState({
    storeId: "", disposalType: "DAMAGED", reason: "", disposalMethod: "",
    committeeMembers: "", remarks: "", lines: [{ itemId: "", quantity: "", reason: "", remarks: "" }]
  });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page]);

  const loadLookups = async () => { try { const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]); setStores(s); setItems(i); } catch {} };
  const loadData = async () => { setLoading(true); try { const data = await invDisposalService.getAll({ page, size: 15 }); setDisposals(data.content || []); setTotalPages(data.totalPages || 0); } catch { toast.error("Failed"); } setLoading(false); };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { itemId: "", quantity: "", reason: "", remarks: "" }] });
  const removeLine = (idx) => setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, field, value) => { const lines = [...form.lines]; lines[idx][field] = value; setForm({ ...form, lines }); };
  const resetForm = () => setForm({ storeId: "", disposalType: "DAMAGED", reason: "", disposalMethod: "", committeeMembers: "", remarks: "", lines: [{ itemId: "", quantity: "", reason: "", remarks: "" }] });

  const handleCreate = async () => {
    if (!form.storeId) { toast.error("Store is required"); return; }
    const validLines = form.lines.filter(l => l.itemId && l.quantity);
    if (validLines.length === 0) { toast.error("Add at least one item"); return; }
    try {
      await invDisposalService.create({ ...form, storeId: Number(form.storeId), lines: validLines.map(l => ({ itemId: Number(l.itemId), quantity: l.quantity, reason: l.reason, remarks: l.remarks })) });
      toast.success("Disposal record created"); setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleSubmit = async (id) => { if (!confirm("Submit to approval workflow?")) return; try { await invDisposalService.submit(id); toast.success("Submitted for approval"); loadData(); if (detailModal?.id === id) setDetailModal(await invDisposalService.getById(id)); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleExecute = async (id) => { if (!confirm("Execute this disposal? Stock will be deducted and a write-off journal entry created.")) return; try { await invDisposalService.execute(id); toast.success("Executed — stock deducted!"); loadData(); if (detailModal?.id === id) setDetailModal(await invDisposalService.getById(id)); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleCancel = async (id) => { if (!confirm("Cancel?")) return; try { await invDisposalService.cancel(id); toast.success("Cancelled"); loadData(); if (detailModal?.id === id) setDetailModal(null); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleViewDetail = async (id) => { try { setDetailModal(await invDisposalService.getById(id)); } catch { toast.error("Failed"); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Trash2 className="w-7 h-7 text-red-600" /> Disposal & Write-Off</h1>
          <p className="text-sm text-gray-500 mt-1">Dispose of damaged, expired, or obsolete materials through approval workflow</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"><Plus className="w-4 h-4" /> New Disposal</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Disposal #</th><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Store</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               disposals.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No disposals found</td></tr> :
               disposals.map(d => (
                <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{d.disposalNumber}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${disposalTypeColors[d.disposalType]}`}>{d.disposalType}</span></td>
                  <td className="px-5 py-3">{d.store?.storeName}</td>
                  <td className="px-5 py-3 text-gray-600">{d.disposalDate}</td>
                  <td className="px-5 py-3 text-right font-mono">ETB {Number(d.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[d.status]}`}>{d.status?.replace(/_/g, " ")}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleViewDetail(d.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                      {d.status === "DRAFT" && <button onClick={() => handleSubmit(d.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Submit"><Send className="w-4 h-4" /></button>}
                      {d.status === "APPROVED" && <button onClick={() => handleExecute(d.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Execute"><Play className="w-4 h-4" /></button>}
                      {["DRAFT", "SUBMITTED"].includes(d.status) && <button onClick={() => handleCancel(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Cancel"><Ban className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (<div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50"><span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {/* ─── Create Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[88vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10"><h2 className="text-lg font-semibold">New Disposal / Write-Off</h2><button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Store *</label>
                  <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Disposal Type *</label>
                  <select value={form.disposalType} onChange={(e) => setForm({ ...form, disposalType: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">{disposalTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Reason *</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Disposal Method</label>
                  <input value={form.disposalMethod} onChange={(e) => setForm({ ...form, disposalMethod: e.target.value })} placeholder="e.g. Auction, Burning, Recycling" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
                <div><label className="block text-sm font-medium mb-1">Committee Members</label>
                  <input value={form.committeeMembers} onChange={(e) => setForm({ ...form, committeeMembers: e.target.value })} placeholder="Names of committee members" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              </div>
              <h3 className="font-semibold pt-2 border-t">Items to Dispose</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div className="col-span-5"><label className="block text-xs text-gray-500 mb-1">Item</label>
                    <select value={line.itemId} onChange={(e) => updateLine(idx, "itemId", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}</select></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Qty</label>
                    <input type="number" value={line.quantity} onChange={(e) => updateLine(idx, "quantity", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Reason</label>
                    <input value={line.reason} onChange={(e) => updateLine(idx, "reason", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Remarks</label>
                    <input value={line.remarks} onChange={(e) => updateLine(idx, "remarks", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-1">{form.lines.length > 1 && <button onClick={() => removeLine(idx)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>}</div>
                </div>
              ))}
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md">Create Disposal</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col border overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-red-50/70 via-white to-orange-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-100 text-red-600"><Trash2 className="w-6 h-6" /></div>
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-lg font-bold font-mono">{detailModal.disposalNumber}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${disposalTypeColors[detailModal.disposalType]}`}>{detailModal.disposalType}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>{detailModal.status?.replace(/_/g, " ")}</span></div>
                  <p className="text-xs text-gray-500">Disposal & Write-Off Record</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold"><Printer className="w-3.5 h-3.5" /> Print</button>
                <button onClick={() => setDetailModal(null)} className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border text-xs">
                <div><span className="text-gray-400 font-medium mb-1 block">Store</span><span className="font-semibold text-sm">{detailModal.store?.storeName || "—"}</span></div>
                <div><span className="text-gray-400 font-medium mb-1 block">Date</span><span className="font-semibold text-sm">{detailModal.disposalDate || "—"}</span></div>
                <div><span className="text-gray-400 font-medium mb-1 block">Method</span><span className="font-semibold text-sm">{detailModal.disposalMethod || "—"}</span></div>
              </div>
              {detailModal.reason && <div className="p-3 bg-red-50 rounded-lg text-sm"><span className="font-medium text-red-700">Reason:</span> {detailModal.reason}</div>}
              {detailModal.committeeMembers && <div className="p-3 bg-blue-50 rounded-lg text-sm"><span className="font-medium text-blue-700">Committee:</span> {detailModal.committeeMembers}</div>}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-2.5 text-left">#</th><th className="px-4 py-2.5 text-left">Item</th><th className="px-4 py-2.5 text-right">Qty</th><th className="px-4 py-2.5 text-right">Unit Cost</th><th className="px-4 py-2.5 text-right">Total</th><th className="px-4 py-2.5 text-left">Reason</th></tr></thead>
                  <tbody className="divide-y">
                    {(detailModal.lines || []).map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{line.item?.itemName}<span className="block text-xs text-gray-400 font-mono">{line.item?.itemCode}</span></td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(line.quantity || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono">ETB {Number(line.unitCost || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono">ETB {Number(line.totalCost || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-gray-600">{line.reason || "—"}</td>
                      </tr>))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold"><tr><td colSpan={4} className="px-4 py-2.5 text-right">Total Write-Off:</td><td className="px-4 py-2.5 text-right font-mono text-red-600">ETB {Number(detailModal.totalAmount || 0).toLocaleString()}</td><td></td></tr></tfoot>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              {detailModal.status === "DRAFT" && <button onClick={() => handleSubmit(detailModal.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Send className="w-4 h-4" /> Submit to Workflow</button>}
              {detailModal.status === "APPROVED" && <button onClick={() => handleExecute(detailModal.id)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><Play className="w-4 h-4" /> Execute Disposal</button>}
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
