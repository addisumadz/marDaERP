"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invMaterialRequestService from "../../../lib/invMaterialRequestService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import {
  FileEdit, Plus, X, Eye, Send, Ban, Trash2,
  ChevronLeft, ChevronRight, Printer, Calendar, Building2,
  User, FileText, Clock, AlertCircle, Package, ExternalLink
} from "lucide-react";

const statusColors = {
  DRAFT: "bg-gray-100 text-gray-700", SUBMITTED: "bg-blue-100 text-blue-700",
  IN_APPROVAL: "bg-amber-100 text-amber-700", APPROVED: "bg-green-100 text-green-700",
  PARTIALLY_ISSUED: "bg-cyan-100 text-cyan-700", ISSUED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700", CANCELLED: "bg-gray-200 text-gray-500"
};
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"];
const priorityColors = { LOW: "bg-gray-100 text-gray-600", NORMAL: "bg-blue-100 text-blue-600", HIGH: "bg-orange-100 text-orange-600", URGENT: "bg-red-100 text-red-700" };

export default function InvMaterialRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState({
    storeId: "", purpose: "", priority: "NORMAL", neededByDate: "", remarks: "",
    lines: [{ itemId: "", requestedQuantity: "", remarks: "" }]
  });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page, filterStatus]);

  const loadLookups = async () => {
    try {
      const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]);
      setStores(s); setItems(i);
    } catch {}
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invMaterialRequestService.getAll({ page, size: 15, status: filterStatus || undefined });
      setRequests(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { toast.error("Failed to load material requests"); }
    setLoading(false);
  };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { itemId: "", requestedQuantity: "", remarks: "" }] });
  const removeLine = (idx) => setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, field, value) => { const lines = [...form.lines]; lines[idx][field] = value; setForm({ ...form, lines }); };

  const resetForm = () => setForm({ storeId: "", purpose: "", priority: "NORMAL", neededByDate: "", remarks: "", lines: [{ itemId: "", requestedQuantity: "", remarks: "" }] });

  const handleCreate = async () => {
    if (!form.storeId) { toast.error("Store is required"); return; }
    const validLines = form.lines.filter(l => l.itemId && l.requestedQuantity);
    if (validLines.length === 0) { toast.error("Add at least one item line"); return; }
    try {
      await invMaterialRequestService.create({
        ...form, storeId: Number(form.storeId),
        lines: validLines.map(l => ({ itemId: Number(l.itemId), requestedQuantity: l.requestedQuantity, remarks: l.remarks }))
      });
      toast.success("Material request created"); setModalOpen(false); resetForm(); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error creating request"); }
  };

  const handleSubmit = async (id) => {
    if (!confirm("Submit this request to the approval workflow?")) return;
    try {
      await invMaterialRequestService.submit(id);
      toast.success("Submitted to workflow for approval");
      loadData();
      if (detailModal && detailModal.id === id) {
        const updated = await invMaterialRequestService.getById(id);
        setDetailModal(updated);
      }
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleCancel = async (id) => {
    if (!confirm("Cancel this material request?")) return;
    try {
      await invMaterialRequestService.cancel(id);
      toast.success("Request cancelled");
      loadData();
      if (detailModal && detailModal.id === id) setDetailModal(null);
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this draft request permanently?")) return;
    try {
      await invMaterialRequestService.delete(id);
      toast.success("Deleted"); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleViewDetail = async (id) => {
    try {
      const data = await invMaterialRequestService.getById(id);
      setDetailModal(data);
    } catch { toast.error("Failed to load details"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileEdit className="w-7 h-7 text-indigo-600" /> Material Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Request materials from store — routed through approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }} className="px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700">
            <option value="">All Statuses</option>
            {Object.keys(statusColors).map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Request</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Request #</th>
                <th className="px-5 py-3 text-left">Store</th>
                <th className="px-5 py-3 text-left">Requested By</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-center">Priority</th>
                <th className="px-5 py-3 text-right">Est. Amount</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               requests.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No material requests found</td></tr> :
               requests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{r.requestNumber}</td>
                  <td className="px-5 py-3">{r.store?.storeName}</td>
                  <td className="px-5 py-3">{r.requestedBy}</td>
                  <td className="px-5 py-3 text-gray-600">{r.requestedDate}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[r.priority]}`}>{r.priority}</span></td>
                  <td className="px-5 py-3 text-right font-mono">ETB {Number(r.totalEstimatedAmount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status]}`}>{r.status?.replace(/_/g, " ")}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleViewDetail(r.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="View Details"><Eye className="w-4 h-4" /></button>
                      {r.status === "DRAFT" && <button onClick={() => handleSubmit(r.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Submit to Workflow"><Send className="w-4 h-4" /></button>}
                      {r.status === "DRAFT" && <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                      {["DRAFT", "SUBMITTED", "IN_APPROVAL"].includes(r.status) && <button onClick={() => handleCancel(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400" title="Cancel"><Ban className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (<div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50"><span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {/* ─── Create Material Request Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[88vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10"><h2 className="text-lg font-semibold">New Material Request</h2><button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store *</label>
                  <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Needed By</label>
                  <input type="date" value={form.neededByDate} onChange={(e) => setForm({ ...form, neededByDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose / Reason</label>
                <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              <h3 className="font-semibold pt-2 border-t">Items Requested</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div className="col-span-6"><label className="block text-xs text-gray-500 mb-1">Item</label>
                    <select value={line.itemId} onChange={(e) => updateLine(idx, "itemId", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}</select></div>
                  <div className="col-span-2"><label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input type="number" value={line.requestedQuantity} onChange={(e) => updateLine(idx, "requestedQuantity", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-3"><label className="block text-xs text-gray-500 mb-1">Remarks</label>
                    <input value={line.remarks} onChange={(e) => updateLine(idx, "remarks", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-1">{form.lines.length > 1 && <button onClick={() => removeLine(idx)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>}</div>
                </div>
              ))}
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Create Request</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Detail Modal ─── */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-16 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 dark:from-indigo-950/40 dark:via-gray-800 dark:to-blue-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"><FileEdit className="w-6 h-6" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-mono text-gray-900 dark:text-white">{detailModal.requestNumber}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[detailModal.priority]}`}>{detailModal.priority}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>{detailModal.status?.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Material Request — Department Stock Requisition</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-semibold"><Printer className="w-3.5 h-3.5" /> Print</button>
                <button onClick={() => setDetailModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-750/50 rounded-xl border text-xs">
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><Building2 className="w-3.5 h-3.5 text-indigo-500" /> Store</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{detailModal.store?.storeName || "—"}</span></div>
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><User className="w-3.5 h-3.5 text-indigo-500" /> Requested By</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{detailModal.requestedBy || "—"}</span></div>
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><Calendar className="w-3.5 h-3.5 text-indigo-500" /> Request Date</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{detailModal.requestedDate || "—"}</span></div>
                <div><span className="text-gray-400 font-medium flex items-center gap-1 mb-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> Needed By</span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{detailModal.neededByDate || "—"}</span></div>
              </div>

              {detailModal.purpose && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                  <span className="font-medium text-blue-700 dark:text-blue-300">Purpose:</span> {detailModal.purpose}
                </div>
              )}

              {detailModal.issueVoucher && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-700 dark:text-green-300">Linked Issue Voucher:</span>
                  <span className="font-mono font-bold">{detailModal.issueVoucher.voucherNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.issueVoucher.status]}`}>{detailModal.issueVoucher.status}</span>
                </div>
              )}

              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/40 text-gray-500 uppercase text-xs">
                    <tr><th className="px-4 py-2.5 text-left">#</th><th className="px-4 py-2.5 text-left">Item</th><th className="px-4 py-2.5 text-right">Requested</th><th className="px-4 py-2.5 text-right">Approved</th><th className="px-4 py-2.5 text-right">Issued</th><th className="px-4 py-2.5 text-right">Est. Cost</th></tr>
                  </thead>
                  <tbody className="divide-y">
                    {(detailModal.lines || []).map((line, idx) => (
                      <tr key={line.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <td className="px-4 py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-2.5"><span className="font-medium">{line.item?.itemName || "—"}</span><span className="block text-xs text-gray-400 font-mono">{line.item?.itemCode}</span></td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(line.requestedQuantity || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{line.approvedQuantity != null ? Number(line.approvedQuantity).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2.5 text-right font-mono">{Number(line.issuedQuantity || 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-mono">ETB {(Number(line.requestedQuantity || 0) * Number(line.estimatedUnitCost || 0)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/40 font-semibold">
                    <tr><td colSpan={5} className="px-4 py-2.5 text-right">Total Estimated:</td><td className="px-4 py-2.5 text-right font-mono">ETB {Number(detailModal.totalEstimatedAmount || 0).toLocaleString()}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
              {detailModal.status === "DRAFT" && <button onClick={() => handleSubmit(detailModal.id)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Send className="w-4 h-4" /> Submit to Workflow</button>}
              {["DRAFT", "SUBMITTED"].includes(detailModal.status) && <button onClick={() => handleCancel(detailModal.id)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Ban className="w-4 h-4" /> Cancel</button>}
              <button onClick={() => setDetailModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
