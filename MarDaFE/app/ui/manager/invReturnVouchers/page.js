"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invReturnVoucherService from "../../../lib/invReturnVoucherService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import {
  RotateCcw, Plus, X, Eye, Check, CheckCheck, Trash2, Ban,
  ChevronLeft, ChevronRight, Printer, Calendar, Building2,
  User, FileText, Clock, Package, ArrowRight
} from "lucide-react";

const statusColors = { DRAFT: "bg-gray-100 text-gray-700", APPROVED: "bg-amber-100 text-amber-700", RECEIVED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700" };
const returnTypeLabels = { RETURN_FROM_DEPARTMENT: "From Department", RETURN_TO_SUPPLIER: "To Supplier" };
const returnTypeColors = { RETURN_FROM_DEPARTMENT: "bg-blue-100 text-blue-700", RETURN_TO_SUPPLIER: "bg-purple-100 text-purple-700" };
const conditionOptions = ["GOOD", "DAMAGED", "EXPIRED", "DEFECTIVE"];

export default function InvReturnVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({
    storeId: "", returnType: "RETURN_FROM_DEPARTMENT", returnedBy: "", department: "",
    reason: "", remarks: "", originalIssueVoucherId: "",
    lines: [{ itemId: "", quantity: "", conditionStatus: "GOOD", remarks: "" }]
  });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page, filterStatus]);

  const loadLookups = async () => { try { const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]); setStores(s); setItems(i); } catch {} };
  const loadData = async () => {
    setLoading(true);
    try { const data = await invReturnVoucherService.getAll({ page, size: 15, status: filterStatus || undefined }); setVouchers(data.content || []); setTotalPages(data.totalPages || 0); } catch { toast.error("Failed"); }
    setLoading(false);
  };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { itemId: "", quantity: "", conditionStatus: "GOOD", remarks: "" }] });
  const removeLine = (idx) => setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, field, value) => { const lines = [...form.lines]; lines[idx][field] = value; setForm({ ...form, lines }); };
  const resetForm = () => setForm({ storeId: "", returnType: "RETURN_FROM_DEPARTMENT", returnedBy: "", department: "", reason: "", remarks: "", originalIssueVoucherId: "", lines: [{ itemId: "", quantity: "", conditionStatus: "GOOD", remarks: "" }] });

  const handleCreate = async () => {
    if (!form.storeId || !form.returnedBy) { toast.error("Store and Returned By are required"); return; }
    const validLines = form.lines.filter(l => l.itemId && l.quantity);
    if (validLines.length === 0) { toast.error("Add at least one item line"); return; }
    try {
      const payload = { ...form, storeId: Number(form.storeId), lines: validLines.map(l => ({ itemId: Number(l.itemId), quantity: l.quantity, conditionStatus: l.conditionStatus, remarks: l.remarks })) };
      if (form.originalIssueVoucherId) payload.originalIssueVoucherId = Number(form.originalIssueVoucherId);
      await invReturnVoucherService.create(payload);
      toast.success("Return voucher created"); setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleApprove = async (id) => { try { await invReturnVoucherService.approve(id); toast.success("Approved"); loadData(); if (detailModal?.id === id) setDetailModal(await invReturnVoucherService.getById(id)); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleReceive = async (id) => { if (!confirm("Receive this return? Stock will be updated and a journal entry created.")) return; try { await invReturnVoucherService.receive(id); toast.success("Received — stock updated!"); loadData(); if (detailModal?.id === id) setDetailModal(await invReturnVoucherService.getById(id)); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleCancel = async (id) => { if (!confirm("Cancel this return voucher?")) return; try { await invReturnVoucherService.cancel(id); toast.success("Cancelled"); loadData(); if (detailModal?.id === id) setDetailModal(null); } catch (e) { toast.error(e.response?.data?.message || "Error"); } };
  const handleViewDetail = async (id) => { try { setDetailModal(await invReturnVoucherService.getById(id)); } catch { toast.error("Failed"); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><RotateCcw className="w-7 h-7 text-indigo-600" /> Return Vouchers</h1>
          <p className="text-sm text-gray-500 mt-1">Return materials from department or to supplier (Model 21 / SRV)</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700">
            <option value="">All Statuses</option>{Object.keys(statusColors).map(s => <option key={s} value={s}>{s}</option>)}</select>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Return</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Voucher #</th><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Store</th><th className="px-5 py-3 text-left">Returned By</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               vouchers.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No return vouchers found</td></tr> :
               vouchers.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{v.voucherNumber}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${returnTypeColors[v.returnType]}`}>{returnTypeLabels[v.returnType]}</span></td>
                  <td className="px-5 py-3">{v.store?.storeName}</td>
                  <td className="px-5 py-3">{v.returnedBy}</td>
                  <td className="px-5 py-3 text-gray-600">{v.returnDate}</td>
                  <td className="px-5 py-3 text-right font-mono">ETB {Number(v.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[v.status]}`}>{v.status}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleViewDetail(v.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View"><Eye className="w-4 h-4" /></button>
                      {v.status === "DRAFT" && <button onClick={() => handleApprove(v.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Approve"><Check className="w-4 h-4" /></button>}
                      {v.status === "APPROVED" && <button onClick={() => handleReceive(v.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Receive"><CheckCheck className="w-4 h-4" /></button>}
                      {v.status === "DRAFT" && <button onClick={() => handleCancel(v.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Cancel"><Ban className="w-4 h-4" /></button>}
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
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10"><h2 className="text-lg font-semibold">New Return Voucher</h2><button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium mb-1">Store *</label>
                  <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Return Type *</label>
                  <select value={form.returnType} onChange={(e) => setForm({ ...form, returnType: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">
                    <option value="RETURN_FROM_DEPARTMENT">From Department</option><option value="RETURN_TO_SUPPLIER">To Supplier</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Returned By *</label>
                  <input value={form.returnedBy} onChange={(e) => setForm({ ...form, returnedBy: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Department</label>
                  <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
                {form.returnType === "RETURN_FROM_DEPARTMENT" && (
                  <div><label className="block text-sm font-medium mb-1">Original Issue Voucher ID</label>
                    <input type="number" value={form.originalIssueVoucherId} onChange={(e) => setForm({ ...form, originalIssueVoucherId: e.target.value })} placeholder="e.g. 42" className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
                )}
              </div>
              <div><label className="block text-sm font-medium mb-1">Reason</label>
                <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              <h3 className="font-semibold pt-2 border-t">Items to Return</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div className="col-span-5"><label className="block text-xs text-gray-500 mb-1">Item</label>
                    <select value={line.itemId} onChange={(e) => updateLine(idx, "itemId", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}</select></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Qty</label>
                    <input type="number" value={line.quantity} onChange={(e) => updateLine(idx, "quantity", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Condition</label>
                    <select value={line.conditionStatus} onChange={(e) => updateLine(idx, "conditionStatus", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700">{conditionOptions.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Remarks</label>
                    <input value={line.remarks} onChange={(e) => updateLine(idx, "remarks", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-1">{form.lines.length > 1 && <button onClick={() => removeLine(idx)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>}</div>
                </div>
              ))}
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Create Return</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-16 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col border overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 dark:from-indigo-950/40 dark:via-gray-800 dark:to-blue-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"><RotateCcw className="w-6 h-6" /></div>
                <div>
                  <div className="flex items-center gap-2"><h2 className="text-lg font-bold font-mono">{detailModal.voucherNumber}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${returnTypeColors[detailModal.returnType]}`}>{returnTypeLabels[detailModal.returnType]}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>{detailModal.status}</span></div>
                  <p className="text-xs text-gray-500 mt-0.5">Store Return Voucher (Model 21 / SRV)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold"><Printer className="w-3.5 h-3.5" /> Print</button>
                <button onClick={() => setDetailModal(null)} className="p-1.5 hover:bg-gray-100 text-gray-400 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl border text-xs">
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> Store</span><span className="font-semibold text-sm">{detailModal.store?.storeName || "—"}</span></div>
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><User className="w-3.5 h-3.5 text-indigo-500" /> Returned By</span><span className="font-semibold text-sm">{detailModal.returnedBy || "—"}</span></div>
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Return Date</span><span className="font-semibold text-sm">{detailModal.returnDate || "—"}</span></div>
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><Package className="w-3.5 h-3.5 text-indigo-500" /> Original IV</span><span className="font-semibold text-sm font-mono">{detailModal.originalIssueVoucher?.voucherNumber || "—"}</span></div>
              </div>
              {detailModal.reason && <div className="p-3 bg-blue-50 rounded-lg text-sm"><span className="font-medium text-blue-700">Reason:</span> {detailModal.reason}</div>}
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-2.5 text-left">#</th><th className="px-4 py-2.5 text-left">Item</th><th className="px-4 py-2.5 text-right">Qty</th><th className="px-4 py-2.5 text-center">Condition</th><th className="px-4 py-2.5 text-right">Unit Cost</th><th className="px-4 py-2.5 text-right">Total</th></tr></thead>
                  <tbody className="divide-y">
                    {(detailModal.lines || []).map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5"><span className="font-medium">{line.item?.itemName || "—"}</span><span className="block text-xs text-gray-400 font-mono">{line.item?.itemCode}</span></td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(line.quantity || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${line.conditionStatus === "GOOD" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{line.conditionStatus}</span></td>
                        <td className="px-4 py-2.5 text-right font-mono">ETB {Number(line.unitCost || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono">ETB {Number(line.totalCost || 0).toLocaleString()}</td>
                      </tr>))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-semibold"><tr><td colSpan={5} className="px-4 py-2.5 text-right">Total:</td><td className="px-4 py-2.5 text-right font-mono">ETB {Number(detailModal.totalAmount || 0).toLocaleString()}</td></tr></tfoot>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              {detailModal.status === "DRAFT" && <button onClick={() => handleApprove(detailModal.id)} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"><Check className="w-4 h-4" /> Approve</button>}
              {detailModal.status === "APPROVED" && <button onClick={() => handleReceive(detailModal.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><CheckCheck className="w-4 h-4" /> Receive & Process</button>}
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
