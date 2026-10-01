"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockCountService from "../../../lib/invStockCountService";
import invStoreService from "../../../lib/invStoreService";
import {
  ClipboardList, Plus, X, Eye, Play, Save, CheckCheck, Ban,
  ChevronLeft, ChevronRight, Calendar, Building2, AlertCircle,
  ArrowRight, TrendingUp, TrendingDown, Minus
} from "lucide-react";

const statusColors = { PLANNED: "bg-blue-100 text-blue-700", COUNTING: "bg-amber-100 text-amber-700", COUNTED: "bg-cyan-100 text-cyan-700", RECONCILED: "bg-purple-100 text-purple-700", ADJUSTED: "bg-green-100 text-green-700", CANCELLED: "bg-gray-200 text-gray-500" };

export default function InvStockCountPage() {
  const [counts, setCounts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [planModal, setPlanModal] = useState(false);
  const [countModal, setCountModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [planForm, setPlanForm] = useState({ storeId: "", countScope: "FULL", remarks: "" });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page]);

  const loadLookups = async () => { try { setStores(await invStoreService.getAllActive()); } catch {} };
  const loadData = async () => { setLoading(true); try { const data = await invStockCountService.getAll({ page, size: 15 }); setCounts(data.content || []); setTotalPages(data.totalPages || 0); } catch { toast.error("Failed"); } setLoading(false); };

  const handlePlan = async () => {
    if (!planForm.storeId) { toast.error("Store is required"); return; }
    try {
      await invStockCountService.plan({ storeId: Number(planForm.storeId), countScope: planForm.countScope, remarks: planForm.remarks });
      toast.success("Stock count planned — items populated from current stock"); setPlanModal(false); setPlanForm({ storeId: "", countScope: "FULL", remarks: "" }); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleStartCounting = async (id) => { try { await invStockCountService.startCounting(id); toast.success("Counting started"); loadData(); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };

  const handleOpenCount = async (id) => {
    try { const data = await invStockCountService.getById(id); setCountModal(data); } catch { toast.error("Failed to load count"); }
  };

  const handleSaveCount = async () => {
    if (!countModal) return;
    try {
      const lines = countModal.lines.map(l => ({ id: l.id, physicalQuantity: l.physicalQuantity, remarks: l.remarks }));
      const updated = await invStockCountService.saveCount(countModal.id, { lines });
      toast.success("Count saved"); setCountModal(updated); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleReconcile = async (id) => {
    if (!confirm("Reconcile this count? A Stock Adjustment will be auto-created for any variances.")) return;
    try { await invStockCountService.reconcile(id); toast.success("Reconciled — adjustment created for variances"); loadData(); setCountModal(null); } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleCancel = async (id) => { if (!confirm("Cancel this stock count?")) return; try { await invStockCountService.cancel(id); toast.success("Cancelled"); loadData(); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleViewDetail = async (id) => { try { setDetailModal(await invStockCountService.getById(id)); } catch { toast.error("Failed"); } };

  const updateCountLine = (lineId, field, value) => {
    if (!countModal) return;
    const lines = countModal.lines.map(l => l.id === lineId ? { ...l, [field]: value } : l);
    setCountModal({ ...countModal, lines });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList className="w-7 h-7 text-indigo-600" /> Physical Stock Count</h1>
          <p className="text-sm text-gray-500 mt-1">Plan → Count → Reconcile with auto Stock Adjustment</p>
        </div>
        <button onClick={() => setPlanModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Count Plan</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Count #</th><th className="px-5 py-3 text-left">Store</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-center">Scope</th><th className="px-5 py-3 text-right">System Value</th><th className="px-5 py-3 text-right">Variance</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               counts.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No stock counts found</td></tr> :
               counts.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{c.countNumber}</td>
                  <td className="px-5 py-3">{c.store?.storeName}</td>
                  <td className="px-5 py-3 text-gray-600">{c.countDate}</td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{c.countScope}</span></td>
                  <td className="px-5 py-3 text-right font-mono">ETB {Number(c.totalSystemValue || 0).toLocaleString()}</td>
                  <td className={`px-5 py-3 text-right font-mono font-semibold ${Number(c.totalVarianceValue || 0) < 0 ? "text-red-600" : Number(c.totalVarianceValue || 0) > 0 ? "text-green-600" : ""}`}>
                    {Number(c.totalVarianceValue || 0) !== 0 ? `ETB ${Number(c.totalVarianceValue).toLocaleString()}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[c.status]}`}>{c.status}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleViewDetail(c.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                      {c.status === "PLANNED" && <button onClick={() => handleStartCounting(c.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Start Counting"><Play className="w-4 h-4" /></button>}
                      {(c.status === "COUNTING" || c.status === "PLANNED") && <button onClick={() => handleOpenCount(c.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Enter Counts"><ClipboardList className="w-4 h-4" /></button>}
                      {c.status === "COUNTED" && <button onClick={() => handleReconcile(c.id)} className="p-1.5 rounded-lg hover:bg-purple-50 text-purple-600" title="Reconcile"><CheckCheck className="w-4 h-4" /></button>}
                      {["PLANNED", "COUNTING"].includes(c.status) && <button onClick={() => handleCancel(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Cancel"><Ban className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (<div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50"><span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {/* ─── Plan Modal ─── */}
      {planModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b"><h2 className="text-lg font-semibold">Plan New Stock Count</h2><button onClick={() => setPlanModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Store *</label>
                <select value={planForm.storeId} onChange={(e) => setPlanForm({ ...planForm, storeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
              <div><label className="block text-sm font-medium mb-1">Count Scope</label>
                <select value={planForm.countScope} onChange={(e) => setPlanForm({ ...planForm, countScope: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                  <option value="FULL">Full Store Count</option><option value="BY_CATEGORY">By Category</option><option value="SELECTIVE">Selective</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea value={planForm.remarks} onChange={(e) => setPlanForm({ ...planForm, remarks: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => setPlanModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handlePlan} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Create Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Count Entry Modal ─── */}
      {countModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col border overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-amber-50 via-white to-orange-50 dark:from-amber-950/40 dark:via-gray-800 dark:to-orange-950/40">
              <div>
                <h2 className="text-lg font-bold font-mono">{countModal.countNumber} — Enter Physical Counts</h2>
                <p className="text-xs text-gray-500">Enter the physical quantity for each item. Variances are auto-calculated.</p>
              </div>
              <button onClick={() => setCountModal(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0">
                  <tr><th className="px-4 py-2.5 text-left">#</th><th className="px-4 py-2.5 text-left">Item</th><th className="px-4 py-2.5 text-right">System Qty</th><th className="px-4 py-2.5 text-right">Physical Qty</th><th className="px-4 py-2.5 text-right">Variance</th><th className="px-4 py-2.5 text-left">Remarks</th></tr>
                </thead>
                <tbody className="divide-y">
                  {(countModal.lines || []).map((line, idx) => {
                    const variance = line.physicalQuantity != null ? Number(line.physicalQuantity) - Number(line.systemQuantity) : null;
                    return (
                      <tr key={line.id} className={`hover:bg-gray-50 ${variance != null && variance !== 0 ? (variance > 0 ? "bg-green-50/50" : "bg-red-50/50") : ""}`}>
                        <td className="px-4 py-2 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2"><span className="font-medium">{line.item?.itemName}</span><span className="block text-xs text-gray-400 font-mono">{line.item?.itemCode}</span></td>
                        <td className="px-4 py-2 text-right font-mono">{Number(line.systemQuantity || 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-right"><input type="number" value={line.physicalQuantity ?? ""} onChange={(e) => updateCountLine(line.id, "physicalQuantity", e.target.value)} className="w-24 px-2 py-1 text-sm text-right border rounded-lg bg-white dark:bg-gray-700 font-mono" placeholder="Count" /></td>
                        <td className={`px-4 py-2 text-right font-mono font-semibold ${variance != null ? (variance > 0 ? "text-green-600" : variance < 0 ? "text-red-600" : "text-gray-400") : "text-gray-300"}`}>
                          {variance != null ? (variance > 0 ? `+${variance}` : variance) : "—"}
                        </td>
                        <td className="px-4 py-2"><input value={line.remarks || ""} onChange={(e) => updateCountLine(line.id, "remarks", e.target.value)} className="w-full px-2 py-1 text-sm border rounded-lg bg-white dark:bg-gray-700" placeholder="Note" /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                {countModal.lines?.filter(l => l.physicalQuantity != null).length || 0} / {countModal.lines?.length || 0} items counted
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveCount} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"><Save className="w-4 h-4" /> Save Progress</button>
                {countModal.status === "COUNTED" && <button onClick={() => handleReconcile(countModal.id)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"><CheckCheck className="w-4 h-4" /> Reconcile</button>}
                <button onClick={() => setCountModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col border overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600"><ClipboardList className="w-6 h-6" /></div>
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-lg font-bold font-mono">{detailModal.countNumber}</h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>{detailModal.status}</span></div>
                  <p className="text-xs text-gray-500">Physical Stock Count Details</p>
                </div>
              </div>
              <button onClick={() => setDetailModal(null)} className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border text-xs">
                <div><span className="text-gray-400 font-medium mb-1 block">Store</span><span className="font-semibold text-sm">{detailModal.store?.storeName || "—"}</span></div>
                <div><span className="text-gray-400 font-medium mb-1 block">Count Date</span><span className="font-semibold text-sm">{detailModal.countDate || "—"}</span></div>
                <div><span className="text-gray-400 font-medium mb-1 block">System Value</span><span className="font-semibold text-sm font-mono">ETB {Number(detailModal.totalSystemValue || 0).toLocaleString()}</span></div>
                <div><span className="text-gray-400 font-medium mb-1 block">Variance Value</span><span className={`font-semibold text-sm font-mono ${Number(detailModal.totalVarianceValue || 0) < 0 ? "text-red-600" : "text-green-600"}`}>ETB {Number(detailModal.totalVarianceValue || 0).toLocaleString()}</span></div>
              </div>
              {detailModal.stockAdjustment && (
                <div className="p-3 bg-purple-50 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-purple-700">Auto-generated Adjustment:</span>
                  <span className="font-mono font-bold">{detailModal.stockAdjustment.adjustmentNumber}</span>
                </div>
              )}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-2.5 text-left">#</th><th className="px-4 py-2.5 text-left">Item</th><th className="px-4 py-2.5 text-right">System</th><th className="px-4 py-2.5 text-right">Physical</th><th className="px-4 py-2.5 text-right">Variance</th><th className="px-4 py-2.5 text-center">Counted</th></tr></thead>
                  <tbody className="divide-y">
                    {(detailModal.lines || []).map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium">{line.item?.itemName}<span className="block text-xs text-gray-400 font-mono">{line.item?.itemCode}</span></td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(line.systemQuantity || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{line.physicalQuantity != null ? Number(line.physicalQuantity).toLocaleString() : "—"}</td>
                        <td className={`px-4 py-2.5 text-right font-mono font-semibold ${Number(line.varianceQuantity || 0) > 0 ? "text-green-600" : Number(line.varianceQuantity || 0) < 0 ? "text-red-600" : ""}`}>
                          {line.varianceQuantity != null ? Number(line.varianceQuantity).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2.5 text-center">{line.isCounted ? <span className="text-green-500">✓</span> : <span className="text-gray-300">—</span>}</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
