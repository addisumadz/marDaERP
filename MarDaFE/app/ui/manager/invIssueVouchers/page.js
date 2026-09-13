"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invIssueVoucherService from "../../../lib/invIssueVoucherService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import { PackageX, Plus, X, Eye, Check, CheckCheck, ChevronLeft, ChevronRight } from "lucide-react";

const statusColors = { DRAFT: "bg-gray-100 text-gray-700", APPROVED: "bg-amber-100 text-amber-700", ISSUED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700" };
const issueTypes = ["SALE", "INTERNAL_USE", "PROJECT"];

export default function InvIssueVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [form, setForm] = useState({ storeId: "", issueType: "INTERNAL_USE", issuedTo: "", department: "", remarks: "", lines: [{ itemId: "", requestedQuantity: "" }] });

  useEffect(() => { loadLookups(); }, []);
  useEffect(() => { loadData(); }, [page]);

  const loadLookups = async () => { try { const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]); setStores(s); setItems(i); } catch {} };
  const loadData = async () => { setLoading(true); try { const data = await invIssueVoucherService.getAll({ page, size: 15 }); setVouchers(data.content || []); setTotalPages(data.totalPages || 0); } catch { toast.error("Failed"); } setLoading(false); };

  const addLine = () => setForm({ ...form, lines: [...form.lines, { itemId: "", requestedQuantity: "" }] });
  const removeLine = (idx) => setForm({ ...form, lines: form.lines.filter((_, i) => i !== idx) });
  const updateLine = (idx, field, value) => { const lines = [...form.lines]; lines[idx][field] = value; setForm({ ...form, lines }); };

  const handleCreate = async () => {
    if (!form.storeId || !form.issuedTo) { toast.error("Store and Issued To are required"); return; }
    const validLines = form.lines.filter(l => l.itemId && l.requestedQuantity);
    if (validLines.length === 0) { toast.error("Add at least one line"); return; }
    try {
      await invIssueVoucherService.create({ ...form, storeId: Number(form.storeId), lines: validLines.map(l => ({ itemId: Number(l.itemId), requestedQuantity: l.requestedQuantity })) });
      toast.success("Issue voucher created"); setModalOpen(false); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleApprove = async (id) => {
    try { await invIssueVoucherService.approve(id); toast.success("Approved — ready to issue"); loadData(); setDetailModal(null); }
    catch (e) { toast.error(e.response?.data?.message || "Error — possible insufficient stock"); }
  };

  const handleIssue = async (id) => {
    if (!confirm("Issue this voucher? Stock will be deducted and a finance entry created.")) return;
    try { await invIssueVoucherService.issue(id); toast.success("Issued — stock deducted!"); loadData(); setDetailModal(null); }
    catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><PackageX className="w-7 h-7 text-indigo-600" /> Issue Vouchers</h1>
          <p className="text-sm text-gray-500 mt-1">Issue stock for sale, internal use, or projects</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Issue</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Voucher #</th><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Store</th><th className="px-5 py-3 text-left">Issued To</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               vouchers.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No vouchers found</td></tr> :
               vouchers.map(v => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{v.voucherNumber}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{v.issueType?.replace("_", " ")}</span></td>
                  <td className="px-5 py-3">{v.store?.storeName}</td>
                  <td className="px-5 py-3">{v.issuedTo}</td>
                  <td className="px-5 py-3 text-gray-600">{v.issuedDate}</td>
                  <td className="px-5 py-3 text-right font-mono">ETB {Number(v.totalAmount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-center"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[v.status]}`}>{v.status}</span></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={async () => { try { setDetailModal(await invIssueVoucherService.getById(v.id)); } catch {} }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Eye className="w-4 h-4" /></button>
                      {v.status === "DRAFT" && <button onClick={() => handleApprove(v.id)} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Approve"><Check className="w-4 h-4" /></button>}
                      {v.status === "APPROVED" && <button onClick={() => handleIssue(v.id)} className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Issue"><CheckCheck className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (<div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50"><span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button><button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button></div></div>)}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10"><h2 className="text-lg font-semibold">New Issue Voucher</h2><button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store *</label>
                  <select value={form.storeId} onChange={(e) => setForm({ ...form, storeId: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type *</label>
                  <select value={form.issueType} onChange={(e) => setForm({ ...form, issueType: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700">{issueTypes.map(t => <option key={t} value={t}>{t.replace("_", " ")}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issued To *</label>
                  <input value={form.issuedTo} onChange={(e) => setForm({ ...form, issuedTo: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700" /></div>
              <h3 className="font-semibold pt-2 border-t">Items to Issue</h3>
              {form.lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                  <div className="col-span-7"><label className="block text-xs text-gray-500 mb-1">Item</label>
                    <select value={line.itemId} onChange={(e) => updateLine(idx, "itemId", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700"><option value="">Select</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}</select></div>
                  <div className="col-span-4"><label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input type="number" value={line.requestedQuantity} onChange={(e) => updateLine(idx, "requestedQuantity", e.target.value)} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700" /></div>
                  <div className="col-span-1">{form.lines.length > 1 && <button onClick={() => removeLine(idx)} className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg"><X className="w-4 h-4" /></button>}</div>
                </div>
              ))}
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 sticky bottom-0">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCreate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Create Voucher</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
