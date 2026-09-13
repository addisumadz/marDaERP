"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncJournalEntryService from "../../../lib/fncJournalEntryService";
import fncAccountService from "../../../lib/fncAccountService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { FileEdit, Plus, X, Check, Ban, Trash2, Eye } from "lucide-react";

export default function FncJournalEntriesPage() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [fyFilter, setFyFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewEntry, setViewEntry] = useState(null);
  const [voidModal, setVoidModal] = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [form, setForm] = useState({ entryDate: "", fiscalYearId: "", referenceNumber: "", description: "", lines: [{ accountId: "", description: "", debitAmount: 0, creditAmount: 0 }, { accountId: "", description: "", debitAmount: 0, creditAmount: 0 }] });

  useEffect(() => { loadAccounts(); loadFiscalYears(); }, []);
  useEffect(() => { loadEntries(); }, [page, statusFilter, fyFilter]);

  const loadAccounts = async () => { try { setAccounts(await fncAccountService.getPostableAccounts()); } catch (e) {} };
  const loadFiscalYears = async () => { try { const d = await fncFiscalYearService.getAllFiscalYears(); setFiscalYears(d); } catch (e) {} };

  const loadEntries = async () => {
    setLoading(true);
    try {
      const params = { page, size: 15 };
      if (statusFilter) params.status = statusFilter;
      if (fyFilter) params.fiscalYearId = Number(fyFilter);
      const data = await fncJournalEntryService.getAllEntries(params);
      setEntries(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (e) { toast.error("Failed to load entries"); }
    setLoading(false);
  };

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totalDebit = form.lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const addLine = () => setForm({ ...form, lines: [...form.lines, { accountId: "", description: "", debitAmount: 0, creditAmount: 0 }] });
  const removeLine = (i) => { if (form.lines.length <= 2) return; setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) }); };
  const updateLine = (i, field, val) => { const lines = [...form.lines]; lines[i] = { ...lines[i], [field]: val }; setForm({ ...form, lines }); };

  const openCreate = () => {
    const today = new Date().toISOString().split("T")[0];
    const openFy = fiscalYears.find(f => !f.isClosed);
    setForm({ entryDate: today, fiscalYearId: openFy?.id || "", referenceNumber: "", description: "", lines: [{ accountId: "", description: "", debitAmount: 0, creditAmount: 0 }, { accountId: "", description: "", debitAmount: 0, creditAmount: 0 }] });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.fiscalYearId || !form.entryDate) { toast.error("Date, fiscal year, and description are required"); return; }
    if (!isBalanced) { toast.error("Debits must equal Credits"); return; }
    for (const l of form.lines) { if (!l.accountId) { toast.error("All lines must have an account"); return; } }
    try {
      await fncJournalEntryService.createEntry({ ...form, fiscalYearId: Number(form.fiscalYearId), lines: form.lines.map(l => ({ ...l, accountId: Number(l.accountId), debitAmount: Number(l.debitAmount), creditAmount: Number(l.creditAmount) })) });
      toast.success("Journal entry created");
      setModalOpen(false);
      loadEntries();
    } catch (e) { toast.error(e.response?.data?.message || "Error creating entry"); }
  };

  const handlePost = async (id) => {
    if (!confirm("Post this entry? This will update the general ledger.")) return;
    try { await fncJournalEntryService.postEntry(id); toast.success("Entry posted"); loadEntries(); } catch (e) { toast.error(e.response?.data?.message || "Error posting"); }
  };

  const handleVoid = async () => {
    try { await fncJournalEntryService.voidEntry(voidModal, voidReason); toast.success("Entry voided"); setVoidModal(null); setVoidReason(""); loadEntries(); } catch (e) { toast.error(e.response?.data?.message || "Error voiding"); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this draft entry?")) return;
    try { await fncJournalEntryService.deleteEntry(id); toast.success("Entry deleted"); loadEntries(); } catch (e) { toast.error(e.response?.data?.message || "Error deleting"); }
  };

  const statusColor = (s) => s === "POSTED" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : s === "DRAFT" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><FileEdit className="w-7 h-7 text-indigo-600" /> Journal Entries</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"><Plus className="w-4 h-4" /> New Entry</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Status</option><option value="DRAFT">Draft</option><option value="POSTED">Posted</option><option value="VOID">Void</option>
        </select>
        <select value={fyFilter} onChange={(e) => { setFyFilter(e.target.value); setPage(0); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Fiscal Years</option>
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Entry #</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Debit (ETB)</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Credit (ETB)</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {entries.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-400 font-medium">{e.entryNumber}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{e.entryDate}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">{e.description}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{fmt(e.totalDebit)}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-900 dark:text-white">{fmt(e.totalCredit)}</td>
                    <td className="px-4 py-3 text-center"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(e.status)}`}>{e.status}</span></td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => setViewEntry(e)} className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                        {e.status === "DRAFT" && <button onClick={() => handlePost(e.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg" title="Post"><Check className="w-4 h-4" /></button>}
                        {e.status === "POSTED" && <button onClick={() => { setVoidModal(e.id); setVoidReason(""); }} className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg" title="Void"><Ban className="w-4 h-4" /></button>}
                        {e.status === "DRAFT" && <button onClick={() => handleDelete(e.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No journal entries found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Prev</button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{viewEntry.entryNumber}</h2>
              <button onClick={() => setViewEntry(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900 dark:text-white">{viewEntry.entryDate}</span></div>
              <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(viewEntry.status)}`}>{viewEntry.status}</span></div>
              <div className="col-span-2"><span className="text-gray-500">Description:</span> <span className="font-medium text-gray-900 dark:text-white">{viewEntry.description}</span></div>
              {viewEntry.referenceNumber && <div><span className="text-gray-500">Reference:</span> <span className="font-medium">{viewEntry.referenceNumber}</span></div>}
            </div>
            <table className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                <th className="px-3 py-2 text-left">Account</th><th className="px-3 py-2 text-left">Description</th>
                <th className="px-3 py-2 text-right">Debit</th><th className="px-3 py-2 text-right">Credit</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(viewEntry.lines || []).map((l, i) => (
                  <tr key={i}><td className="px-3 py-2 font-mono text-xs">{l.accountCode} - {l.accountName}</td><td className="px-3 py-2">{l.description || "—"}</td>
                    <td className="px-3 py-2 text-right font-mono">{l.debitAmount > 0 ? fmt(l.debitAmount) : ""}</td>
                    <td className="px-3 py-2 text-right font-mono">{l.creditAmount > 0 ? fmt(l.creditAmount) : ""}</td></tr>
                ))}
                <tr className="font-bold bg-gray-50 dark:bg-gray-700"><td colSpan={2} className="px-3 py-2 text-right">Totals:</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt(viewEntry.totalDebit)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt(viewEntry.totalCredit)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Void Modal */}
      {voidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Void Journal Entry</h2>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for voiding</label>
            <textarea value={voidReason} onChange={(e) => setVoidReason(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setVoidModal(null)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={handleVoid} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Void Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">New Journal Entry</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Date *</label>
                <input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Fiscal Year *</label>
                <select value={form.fiscalYearId} onChange={(e) => setForm({ ...form, fiscalYearId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select...</option>{fiscalYears.filter(f => !f.isClosed).map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
                </select></div>
              <div><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Reference #</label>
                <input type="text" value={form.referenceNumber} onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
            </div>
            <div className="mb-4"><label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description *</label>
              <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. Salary payment for Meskerem" /></div>

            <div className="mb-2 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Entry Lines</h3>
              <button onClick={addLine} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">+ Add Line</button>
            </div>
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700"><tr>
                  <th className="px-3 py-2 text-left w-2/5">Account</th><th className="px-3 py-2 text-left">Line Description</th>
                  <th className="px-3 py-2 text-right w-28">Debit</th><th className="px-3 py-2 text-right w-28">Credit</th><th className="px-3 py-2 w-10"></th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {form.lines.map((l, i) => (
                    <tr key={i}><td className="px-2 py-1">
                      <select value={l.accountId} onChange={(e) => updateLine(i, "accountId", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs">
                        <option value="">Select account...</option>{accounts.map(a => <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>)}
                      </select></td>
                      <td className="px-2 py-1"><input type="text" value={l.description} onChange={(e) => updateLine(i, "description", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs" /></td>
                      <td className="px-2 py-1"><input type="number" min="0" step="0.01" value={l.debitAmount || ""} onChange={(e) => updateLine(i, "debitAmount", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right text-xs" /></td>
                      <td className="px-2 py-1"><input type="number" min="0" step="0.01" value={l.creditAmount || ""} onChange={(e) => updateLine(i, "creditAmount", e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-right text-xs" /></td>
                      <td className="px-2 py-1"><button onClick={() => removeLine(i)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded" disabled={form.lines.length <= 2}><X className="w-3 h-3" /></button></td>
                    </tr>
                  ))}
                  <tr className={`font-bold ${isBalanced ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                    <td colSpan={2} className="px-3 py-2 text-right">Totals:</td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(totalDebit)}</td>
                    <td className="px-3 py-2 text-right font-mono">{fmt(totalCredit)}</td>
                    <td className="px-2 py-2 text-center">{isBalanced ? <Check className="w-4 h-4 text-green-600" /> : <X className="w-4 h-4 text-red-600" />}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!isBalanced && totalDebit > 0 && <p className="text-red-600 text-sm mt-2">⚠ Difference: ETB {fmt(Math.abs(totalDebit - totalCredit))}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">Cancel</button>
              <button onClick={handleSave} disabled={!isBalanced} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Save as Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
