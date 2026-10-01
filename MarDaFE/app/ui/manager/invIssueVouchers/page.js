"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import invIssueVoucherService from "../../../lib/invIssueVoucherService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import {
  PackageX,
  Plus,
  X,
  Eye,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  Building2,
  User,
  FileText,
  ShieldCheck,
  ExternalLink,
  Layers,
  Clock,
  AlertCircle
} from "lucide-react";

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
    try {
      await invIssueVoucherService.approve(id);
      toast.success("Approved — ready to issue");
      loadData();
      if (detailModal && detailModal.id === id) {
        const updated = await invIssueVoucherService.getById(id);
        setDetailModal(updated);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error — possible insufficient stock");
    }
  };

  const handleIssue = async (id) => {
    if (!confirm("Issue this voucher? Stock will be deducted and a finance entry created.")) return;
    try {
      await invIssueVoucherService.issue(id);
      toast.success("Issued — stock deducted!");
      loadData();
      if (detailModal && detailModal.id === id) {
        const updated = await invIssueVoucherService.getById(id);
        setDetailModal(updated);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const data = await invIssueVoucherService.getById(id);
      setDetailModal(data);
    } catch (e) {
      toast.error("Failed to load voucher details");
    }
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
                      <button onClick={() => handleViewDetail(v.id)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-900/30" title="View Details / Preview"><Eye className="w-4 h-4" /></button>
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

      {/* ─── Create Issue Voucher Modal ─── */}
      {modalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[88vh] overflow-y-auto my-auto">
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

      {/* ─── Preview / Detail Modal ─── */}
      {detailModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 sm:pt-16 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 dark:from-indigo-950/40 dark:via-gray-800 dark:to-blue-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                  <PackageX className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold font-mono text-gray-900 dark:text-white">
                      {detailModal.voucherNumber}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {detailModal.issueType?.replace("_", " ")}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>
                      {detailModal.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Store Stock Issue Voucher & Dispatch Details
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold transition-colors"
                  title="Print Voucher"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setDetailModal(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-750/50 rounded-xl border border-gray-100 dark:border-gray-700/60 text-xs">
                <div>
                  <span className="text-gray-400 font-medium flex items-center gap-1 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Source Store
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {detailModal.store?.storeName || "—"}
                  </span>
                  {detailModal.store?.storeCode && (
                    <span className="block text-[11px] font-mono text-gray-500 mt-0.5">
                      Code: {detailModal.store.storeCode}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 font-medium flex items-center gap-1 mb-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" /> Issued To
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {detailModal.issuedTo || "—"}
                  </span>
                  {detailModal.department && (
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Dept: {detailModal.department}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 font-medium flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Issued Date
                  </span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                    {detailModal.issuedDate || "—"}
                  </span>
                  {detailModal.createdAt && (
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      Created: {new Date(detailModal.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 font-medium flex items-center gap-1 mb-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Total Valuation
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-base">
                    ETB {Number(detailModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block mb-1">Created By</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {detailModal.createdBy || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block mb-1">Approved By</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {detailModal.approvedBy || "Pending Approval"}
                  </span>
                  {detailModal.approvedDate && (
                    <span className="block text-[11px] text-gray-500 mt-0.5">
                      {new Date(detailModal.approvedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-gray-400 font-medium block mb-1">Issued By</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {detailModal.issuedBy || "Pending Issuance"}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 font-medium block mb-1">Status</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[detailModal.status]}`}>
                    {detailModal.status}
                  </span>
                </div>
              </div>

              {/* Remarks Banner if present */}
              {detailModal.remarks && (
                <div className="bg-gray-50 dark:bg-gray-750/30 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                  <FileText className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">Remarks / Purpose:</span>
                    <p className="mt-0.5 whitespace-pre-wrap">{detailModal.remarks}</p>
                  </div>
                </div>
              )}

              {/* General Ledger / Finance Integration Banner */}
              {detailModal.journalEntry ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold">General Ledger Journal Entry Posted:</div>
                      <div className="font-mono text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                        {detailModal.journalEntry.entryNumber || detailModal.journalEntry.referenceNumber || `Journal #${detailModal.journalEntry.id}`}
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/ui/manager/fncJournalEntries"
                    className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
                  >
                    View in GL <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : detailModal.status === "APPROVED" ? (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Voucher has been approved. Clicking <strong>Issue & Deduct Stock</strong> will deduct warehouse inventory and automatically generate the General Ledger journal entry.
                  </span>
                </div>
              ) : detailModal.status === "DRAFT" ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    This voucher is currently in <strong>DRAFT</strong>. Stock availability will be validated and reserved upon approval.
                  </span>
                </div>
              ) : null}

              {/* Line Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Issued Line Items</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-mono">
                      {(detailModal.lines || []).length} item{(detailModal.lines || []).length === 1 ? "" : "s"}
                    </span>
                  </h3>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-gray-600 dark:text-gray-300 tracking-wider">
                      <tr>
                        <th className="px-3 py-2.5 text-center w-12">#</th>
                        <th className="px-4 py-2.5 text-left">Item Details</th>
                        <th className="px-3 py-2.5 text-center">UoM</th>
                        <th className="px-4 py-2.5 text-right">Requested</th>
                        <th className="px-4 py-2.5 text-right font-medium text-amber-600">Approved</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-emerald-600">Issued</th>
                        <th className="px-4 py-2.5 text-right">Unit Cost</th>
                        <th className="px-4 py-2.5 text-right">Total (ETB)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(detailModal.lines || []).length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-400 italic">
                            No item lines found on this issue voucher.
                          </td>
                        </tr>
                      ) : (
                        detailModal.lines.map((l, i) => {
                          const unitCost = Number(l.unitCost || 0);
                          const qty = Number(l.issuedQuantity || l.requestedQuantity || 0);
                          const total = Number(l.totalCost) || (qty * unitCost);
                          const unitName = l.item?.unitOfMeasure?.unitName || l.item?.unitOfMeasure?.unitCode || l.item?.primaryUnit?.unitName || "PCS";

                          return (
                            <tr key={l.id || i} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/30">
                              <td className="px-3 py-2.5 text-center font-mono text-gray-400">{i + 1}</td>
                              <td className="px-4 py-2.5">
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {l.item?.itemName || "Unnamed Item"}
                                  {l.item?.itemNameAm && (
                                    <span className="text-gray-400 text-[11px] font-normal ml-1">
                                      ({l.item.itemNameAm})
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                                  Code: {l.item?.itemCode || "—"}
                                  {l.serialTracking && ` • Serial: ${l.serialTracking.serialNumber || l.serialTracking.id}`}
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-300 font-medium">
                                {unitName}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                                {Number(l.requestedQuantity || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-medium text-amber-600">
                                {l.approvedQuantity != null ? Number(l.approvedQuantity).toLocaleString() : "—"}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-600">
                                {l.issuedQuantity != null ? Number(l.issuedQuantity).toLocaleString() : "0"}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                                ETB {unitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2.5 text-right font-mono font-semibold text-gray-900 dark:text-white">
                                ETB {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-bold border-t border-gray-200 dark:border-gray-700">
                      <tr>
                        <td colSpan={7} className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
                          Grand Total Valuation:
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-sm text-indigo-600 dark:text-indigo-400">
                          ETB {Number(detailModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <div className="text-xs text-gray-500">
                Voucher Status: <span className={`px-2 py-0.5 rounded-full font-semibold ${statusColors[detailModal.status]}`}>{detailModal.status}</span>
              </div>
              <div className="flex items-center gap-3">
                {detailModal.status === "DRAFT" && (
                  <button
                    type="button"
                    onClick={() => handleApprove(detailModal.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-xs font-semibold shadow transition-colors"
                  >
                    <Check className="w-4 h-4" /> Approve Voucher
                  </button>
                )}
                {detailModal.status === "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => handleIssue(detailModal.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-semibold shadow transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" /> Issue & Deduct Stock
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setDetailModal(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
