"use client";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import fncOpeningBalanceService from "../../../lib/fncOpeningBalanceService";
import fncAccountService from "../../../lib/fncAccountService";
import { DollarSign, Save, Trash2, Search, AlertCircle, CheckCircle } from "lucide-react";

const TYPE_COLORS = {
  ASSET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  LIABILITY: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  EQUITY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  REVENUE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  EXPENSE: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

function FncOpeningBalancesContent() {
  const searchParams = useSearchParams();
  const fyIdParam = searchParams.get("fyId");

  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState([]);
  const [editRows, setEditRows] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [fy, acc] = await Promise.all([
          fncFiscalYearService.getAllFiscalYears(),
          fncAccountService.getPostableAccounts(),
        ]);
        setFiscalYears(fy);
        setAccounts(acc);
        if (fyIdParam) {
          setSelectedFy(Number(fyIdParam));
        } else if (fy.length > 0) {
          setSelectedFy(fy[0].id);
        }
      } catch (e) { toast.error("Failed to load data"); }
      setLoading(false);
    })();
  }, [fyIdParam]);

  useEffect(() => { if (selectedFy) loadBalances(); }, [selectedFy]);

  const loadBalances = async () => {
    try {
      const data = await fncOpeningBalanceService.getByFiscalYear(selectedFy);
      setBalances(data);
      const map = {};
      data.forEach(ob => { map[ob.accountId] = { debit: ob.debitAmount, credit: ob.creditAmount }; });
      setEditRows(map);
    } catch (e) { setBalances([]); setEditRows({}); }
  };

  const selectedFyObj = fiscalYears.find(f => f.id === Number(selectedFy));
  const isClosed = selectedFyObj?.isClosed;

  // Merge accounts with their saved balances for display
  const rows = useMemo(() => {
    return accounts.map(acc => {
      const saved = balances.find(b => b.accountId === acc.id);
      const edit = editRows[acc.id];
      return {
        ...acc,
        savedDebit: saved?.debitAmount || 0,
        savedCredit: saved?.creditAmount || 0,
        editDebit: edit?.debit ?? saved?.debitAmount ?? 0,
        editCredit: edit?.credit ?? saved?.creditAmount ?? 0,
        hasBalance: (saved?.debitAmount || 0) > 0 || (saved?.creditAmount || 0) > 0,
        isDirty: edit && (
          (edit.debit ?? 0) !== (saved?.debitAmount ?? 0) ||
          (edit.credit ?? 0) !== (saved?.creditAmount ?? 0)
        ),
      };
    });
  }, [accounts, balances, editRows]);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (search && !r.accountCode.toLowerCase().includes(search.toLowerCase()) &&
          !r.accountName.toLowerCase().includes(search.toLowerCase()) &&
          !(r.accountNameAm && r.accountNameAm.includes(search))) return false;
      if (typeFilter && r.accountType !== typeFilter) return false;
      if (showOnlyWithBalance && !r.hasBalance && !r.isDirty) return false;
      return true;
    });
  }, [rows, search, typeFilter, showOnlyWithBalance]);

  const totals = useMemo(() => {
    const totalDebit = rows.reduce((s, r) => s + Number(r.editDebit || 0), 0);
    const totalCredit = rows.reduce((s, r) => s + Number(r.editCredit || 0), 0);
    return { totalDebit, totalCredit, isBalanced: Math.abs(totalDebit - totalCredit) < 0.01 };
  }, [rows]);

  const updateRow = (accountId, field, value) => {
    setEditRows(prev => ({
      ...prev,
      [accountId]: { ...prev[accountId], [field]: Number(value) || 0 }
    }));
  };

  const handleSaveRow = async (accountId) => {
    const edit = editRows[accountId];
    if (!edit) return;
    setSaving(prev => ({ ...prev, [accountId]: true }));
    try {
      await fncOpeningBalanceService.saveOpeningBalance({
        accountId, fiscalYearId: Number(selectedFy),
        debitAmount: Number(edit.debit || 0), creditAmount: Number(edit.credit || 0),
      });
      toast.success("Saved");
      await loadBalances();
    } catch (e) { toast.error(e.response?.data?.message || "Error saving"); }
    setSaving(prev => ({ ...prev, [accountId]: false }));
  };

  const handleDeleteRow = async (accountId) => {
    updateRow(accountId, "debit", 0);
    updateRow(accountId, "credit", 0);
    setSaving(prev => ({ ...prev, [accountId]: true }));
    try {
      await fncOpeningBalanceService.saveOpeningBalance({
        accountId, fiscalYearId: Number(selectedFy), debitAmount: 0, creditAmount: 0,
      });
      toast.success("Balance cleared");
      await loadBalances();
    } catch (e) { toast.error("Error clearing"); }
    setSaving(prev => ({ ...prev, [accountId]: false }));
  };

  const handleSaveAll = async () => {
    const dirtyRows = rows.filter(r => r.isDirty);
    if (dirtyRows.length === 0) { toast.info("No changes to save"); return; }
    let saved = 0;
    for (const r of dirtyRows) {
      try {
        await fncOpeningBalanceService.saveOpeningBalance({
          accountId: r.id, fiscalYearId: Number(selectedFy),
          debitAmount: Number(editRows[r.id]?.debit || 0),
          creditAmount: Number(editRows[r.id]?.credit || 0),
        });
        saved++;
      } catch (e) { toast.error(`Error saving ${r.accountCode}`); }
    }
    toast.success(`${saved} balance(s) saved`);
    await loadBalances();
  };

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const dirtyCount = rows.filter(r => r.isDirty).length;

  // Double-entry rule: ASSET & EXPENSE have normal Debit balance; LIABILITY, EQUITY & REVENUE have normal Credit balance
  const isDebitNormal = (accountType) => accountType === "ASSET" || accountType === "EXPENSE";
  const normalBalanceLabel = (accountType) => isDebitNormal(accountType) ? "DR" : "CR";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-indigo-600" /> Opening Balances
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set starting balances for each account per fiscal year</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
            {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName} {f.isClosed ? "(Closed)" : ""}</option>)}
          </select>
          {!isClosed && dirtyCount > 0 && (
            <button onClick={handleSaveAll} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md">
              <Save className="w-4 h-4" /> Save All ({dirtyCount})
            </button>
          )}
        </div>
      </div>

      {/* Balance Summary */}
      <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border-2 ${totals.isBalanced ? "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-800" : "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800"}`}>
        <div className="flex items-center gap-2">
          {totals.isBalanced ? <CheckCircle className="w-6 h-6 text-green-600" /> : <AlertCircle className="w-6 h-6 text-red-600" />}
          <span className={`font-bold text-lg ${totals.isBalanced ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
            {totals.isBalanced ? "Balanced ✓" : "Not Balanced ✗"}
          </span>
        </div>
        <div className="flex gap-6 text-sm">
          <div className="text-center"><p className="text-gray-500">Total Debits</p><p className="font-bold font-mono text-gray-900 dark:text-white">ETB {fmt(totals.totalDebit)}</p></div>
          <div className="text-center"><p className="text-gray-500">Total Credits</p><p className="font-bold font-mono text-gray-900 dark:text-white">ETB {fmt(totals.totalCredit)}</p></div>
          {!totals.isBalanced && <div className="text-center"><p className="text-gray-500">Difference</p><p className="font-bold font-mono text-red-600">ETB {fmt(Math.abs(totals.totalDebit - totals.totalCredit))}</p></div>}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search accounts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">All Types</option>
          <option value="ASSET">Asset</option><option value="LIABILITY">Liability</option>
          <option value="EQUITY">Equity</option><option value="REVENUE">Revenue</option><option value="EXPENSE">Expense</option>
        </select>
        <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={showOnlyWithBalance} onChange={(e) => setShowOnlyWithBalance(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">With balance only</span>
        </label>
      </div>

      {/* Accounts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"><tr>
                <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Code</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Account Name</th>
                <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Type</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 w-20">Normal</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 w-40">Debit (ETB)</th>
                <th className="px-3 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 w-40">Credit (ETB)</th>
                <th className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-300 w-24">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-gray-50 dark:hover:bg-gray-750 ${r.isDirty ? "bg-yellow-50 dark:bg-yellow-900/10" : ""}`}>
                    <td className="px-3 py-2 font-mono text-gray-900 dark:text-white">{r.accountCode}</td>
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{r.accountName}</td>
                    <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[r.accountType] || ""}`}>{r.accountType}</span></td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${isDebitNormal(r.accountType) ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`}>
                        {normalBalanceLabel(r.accountType)}
                      </span>
                    </td>
                    <td className="px-3 py-1">
                      {isDebitNormal(r.accountType) ? (
                        <input type="number" min="0" step="0.01" disabled={isClosed}
                          value={(editRows[r.id]?.debit ?? r.savedDebit) || ""}
                          onChange={(e) => updateRow(r.id, "debit", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-right font-mono text-sm text-gray-900 dark:text-white disabled:opacity-50" />
                      ) : (
                        <div className="w-full px-2 py-1.5 text-right font-mono text-sm text-gray-300 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 select-none" title="Credit-normal account — debit not allowed">—</div>
                      )}
                    </td>
                    <td className="px-3 py-1">
                      {!isDebitNormal(r.accountType) ? (
                        <input type="number" min="0" step="0.01" disabled={isClosed}
                          value={(editRows[r.id]?.credit ?? r.savedCredit) || ""}
                          onChange={(e) => updateRow(r.id, "credit", e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-right font-mono text-sm text-gray-900 dark:text-white disabled:opacity-50" />
                      ) : (
                        <div className="w-full px-2 py-1.5 text-right font-mono text-sm text-gray-300 dark:text-gray-600 border border-dashed border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 select-none" title="Debit-normal account — credit not allowed">—</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {!isClosed && (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleSaveRow(r.id)} disabled={saving[r.id] || !r.isDirty}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded disabled:opacity-30" title="Save">
                            <Save className="w-4 h-4" />
                          </button>
                          {r.hasBalance && (
                            <button onClick={() => handleDeleteRow(r.id)} disabled={saving[r.id]}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded disabled:opacity-30" title="Clear">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-12 text-center text-gray-500">No accounts found</td></tr>}
              </tbody>
              <tfoot>
                <tr className={`font-bold ${totals.isBalanced ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                  <td colSpan={4} className="px-3 py-3 text-right">Totals:</td>
                  <td className="px-3 py-3 text-right font-mono">{fmt(totals.totalDebit)}</td>
                  <td className="px-3 py-3 text-right font-mono">{fmt(totals.totalCredit)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {isClosed && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-center text-yellow-800 dark:text-yellow-300">
          🔒 This fiscal year is closed. Opening balances are read-only.
        </div>
      )}
    </div>
  );
}

export default function FncOpeningBalancesPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>}>
      <FncOpeningBalancesContent />
    </Suspense>
  );
}
