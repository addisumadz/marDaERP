"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-toastify";
import fncBudgetService from "../../../lib/fncBudgetService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import fncAccountService from "../../../lib/fncAccountService";
import {
  Wallet, Save, Check, ChevronDown, ChevronRight,
  Calculator, TrendingUp, TrendingDown, AlertCircle, Loader2, SplitSquareHorizontal
} from "lucide-react";

export default function FncBudgetManagementPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFyId, setSelectedFyId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [budget, setBudget] = useState(null);
  const [lines, setLines] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [revenueExpanded, setRevenueExpanded] = useState(true);
  const [expenseExpanded, setExpenseExpanded] = useState(true);

  // ─── Load fiscal years & accounts on mount ──────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [fy, acc] = await Promise.all([
          fncFiscalYearService.getAllFiscalYears(),
          fncAccountService.getPostableAccounts(),
        ]);
        setFiscalYears(fy);
        setAccounts(acc.filter(a => a.accountType === "REVENUE" || a.accountType === "EXPENSE"));
        // Auto-select the first open fiscal year
        const open = fy.find(f => !f.isClosed);
        if (open) setSelectedFyId(String(open.id));
      } catch (e) {
        toast.error("Failed to load data");
      }
      setLoading(false);
    })();
  }, []);

  // ─── When fiscal year changes, ensure budget exists ─────────────
  useEffect(() => {
    if (!selectedFyId) return;
    loadBudgetForFy(Number(selectedFyId));
  }, [selectedFyId]);

  const loadBudgetForFy = async (fyId) => {
    setLoadingBudget(true);
    setDirty(false);
    try {
      const data = await fncBudgetService.ensureBudgetForFiscalYear(fyId);
      setBudget(data);
      // Build lines map from existing budget lines
      const map = {};
      (data.lines || []).forEach(l => {
        map[l.accountId] = {
          q1: l.q1Amount || 0,
          q2: l.q2Amount || 0,
          q3: l.q3Amount || 0,
          q4: l.q4Amount || 0,
          annual: l.annualAmount || 0,
          notes: l.notes || "",
        };
      });
      setLines(map);
    } catch (e) {
      toast.error("Failed to load budget");
      setBudget(null);
      setLines({});
    }
    setLoadingBudget(false);
  };

  // ─── Derived data ──────────────────────────────────────────────
  const revenueAccounts = useMemo(() => accounts.filter(a => a.accountType === "REVENUE"), [accounts]);
  const expenseAccounts = useMemo(() => accounts.filter(a => a.accountType === "EXPENSE"), [accounts]);

  const getLine = useCallback((accountId) => {
    return lines[accountId] || { q1: 0, q2: 0, q3: 0, q4: 0, annual: 0, notes: "" };
  }, [lines]);

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const totals = useMemo(() => {
    let totalRevenue = 0, totalExpense = 0;
    let revQ1 = 0, revQ2 = 0, revQ3 = 0, revQ4 = 0;
    let expQ1 = 0, expQ2 = 0, expQ3 = 0, expQ4 = 0;
    revenueAccounts.forEach(a => {
      const v = getLine(a.id);
      revQ1 += Number(v.q1 || 0); revQ2 += Number(v.q2 || 0);
      revQ3 += Number(v.q3 || 0); revQ4 += Number(v.q4 || 0);
      totalRevenue += Number(v.annual || 0);
    });
    expenseAccounts.forEach(a => {
      const v = getLine(a.id);
      expQ1 += Number(v.q1 || 0); expQ2 += Number(v.q2 || 0);
      expQ3 += Number(v.q3 || 0); expQ4 += Number(v.q4 || 0);
      totalExpense += Number(v.annual || 0);
    });
    return {
      totalRevenue, totalExpense,
      surplus: totalRevenue - totalExpense,
      revQ1, revQ2, revQ3, revQ4,
      expQ1, expQ2, expQ3, expQ4,
    };
  }, [lines, revenueAccounts, expenseAccounts, getLine]);

  // ─── Update a single cell ──────────────────────────────────────
  const updateLine = (accountId, field, value) => {
    setDirty(true);
    setLines(prev => {
      const cur = prev[accountId] || { q1: 0, q2: 0, q3: 0, q4: 0, annual: 0, notes: "" };
      const upd = { ...cur, [field]: field === "notes" ? value : (Number(value) || 0) };
      if (field !== "annual" && field !== "notes") {
        upd.annual = (Number(upd.q1) || 0) + (Number(upd.q2) || 0) + (Number(upd.q3) || 0) + (Number(upd.q4) || 0);
      }
      return { ...prev, [accountId]: upd };
    });
  };

  // ─── Allocate annual evenly across quarters ────────────────────
  const allocateAnnual = (accountId) => {
    const cur = lines[accountId];
    if (!cur || !cur.annual || cur.annual <= 0) {
      toast.warning("Enter an annual amount first");
      return;
    }
    const quarter = Math.round((cur.annual / 4) * 100) / 100;
    const remainder = Math.round((cur.annual - quarter * 4) * 100) / 100;
    setDirty(true);
    setLines(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        q1: quarter,
        q2: quarter,
        q3: quarter,
        q4: quarter + remainder,
      },
    }));
  };

  // ─── Save all lines ───────────────────────────────────────────
  const handleSave = async () => {
    if (!budget) return;
    setSaving(true);
    const payload = Object.entries(lines)
      .filter(([, v]) => (Number(v.annual) || 0) > 0)
      .map(([id, v]) => ({
        accountId: Number(id),
        annualAmount: Number(v.annual) || 0,
        q1Amount: Number(v.q1) || 0,
        q2Amount: Number(v.q2) || 0,
        q3Amount: Number(v.q3) || 0,
        q4Amount: Number(v.q4) || 0,
        notes: v.notes,
      }));
    try {
      await fncBudgetService.updateBudgetLines(budget.id, payload);
      toast.success("Budget saved successfully");
      setDirty(false);
      // Reload to get updated totals
      await loadBudgetForFy(Number(selectedFyId));
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    }
    setSaving(false);
  };

  // ─── Approve budget ────────────────────────────────────────────
  const handleApprove = async () => {
    if (!budget) return;
    if (dirty) { toast.warning("Save changes before approving"); return; }
    if (!confirm("Approve this budget? Once approved, changes will mark it as REVISED.")) return;
    try {
      await fncBudgetService.approveBudget(budget.id);
      toast.success("Budget approved");
      await loadBudgetForFy(Number(selectedFyId));
    } catch (e) {
      toast.error("Failed to approve");
    }
  };

  const isApproved = budget?.status === "APPROVED";
  const statusColor = budget?.status === "APPROVED"
    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700"
    : budget?.status === "REVISED"
      ? "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700"
      : "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700";

  // ─── Account row component ─────────────────────────────────────
  const AccountRow = ({ acc }) => {
    const v = getLine(acc.id);
    return (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <td className="px-3 py-1.5 text-xs sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-100 dark:border-gray-700">
          <span className="font-mono text-indigo-600 dark:text-indigo-400 mr-1.5">{acc.accountCode}</span>
          <span className="text-gray-700 dark:text-gray-300">{acc.accountName}</span>
        </td>
        {["q1", "q2", "q3", "q4"].map(q => (
          <td key={q} className="px-1 py-1">
            <input
              type="number"
              min="0"
              step="0.01"
              value={v[q] || ""}
              onChange={(e) => updateLine(acc.id, q, e.target.value)}
              placeholder="0.00"
              className="w-full px-2 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-right font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </td>
        ))}
        <td className="px-3 py-1.5 text-right font-mono font-bold text-xs text-gray-900 dark:text-white">
          {fmt(v.annual)}
        </td>
        <td className="px-1 py-1 text-center">
          <button
            onClick={() => allocateAnnual(acc.id)}
            title="Enter annual amount below, then click to split evenly into quarters"
            className="p-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-500 transition-colors"
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>
    );
  };

  // ─── Section table ─────────────────────────────────────────────
  const SectionTable = ({ title, titleAm, icon: Icon, color, accs, expanded, setExpanded, subtotals }) => (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm uppercase tracking-wide transition-colors ${color}`}
      >
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        <Icon className="w-4 h-4" />
        {title} / {titleAm}
        <span className="ml-auto font-mono text-xs normal-case">
          Total: ETB {fmt(subtotals.annual)}
        </span>
      </button>
      {expanded && (
        <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-700/80">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-700/80 z-10 border-r border-gray-100 dark:border-gray-600 w-[280px]">Account</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[110px]">Q1</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[110px]">Q2</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[110px]">Q3</th>
                <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[110px]">Q4</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 w-[120px]">Annual</th>
                <th className="px-2 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[40px]" title="Allocate annual evenly">÷4</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {accs.map(a => <AccountRow key={a.id} acc={a} />)}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700/80 font-bold">
              <tr>
                <td className="px-3 py-2 text-xs sticky left-0 bg-gray-50 dark:bg-gray-700/80 z-10 border-r border-gray-100 dark:border-gray-600">
                  Subtotal
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">{fmt(subtotals.q1)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{fmt(subtotals.q2)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{fmt(subtotals.q3)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{fmt(subtotals.q4)}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">{fmt(subtotals.annual)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Header Bar ─────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
              <p className="text-xs text-gray-500">Select a fiscal year to set budget amounts per account</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Fiscal Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Fiscal Year:</label>
              <select
                value={selectedFyId}
                onChange={(e) => setSelectedFyId(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none min-w-[180px]"
              >
                <option value="">Select...</option>
                {fiscalYears.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.fiscalYearName} {f.isClosed ? "(Closed)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Badge */}
            {budget && (
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                {budget.status}
              </span>
            )}

            {/* Action Buttons */}
            {budget && budget.status !== "APPROVED" && (
              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors dark:bg-green-900/20 dark:text-green-400 dark:border-green-700"
              >
                <Check className="w-4 h-4" /> Approve
              </button>
            )}

            {budget && (
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Budget"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── No FY selected ─────────────────────────────────────── */}
      {!selectedFyId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-16 text-center">
          <Calculator className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Select a fiscal year above to start budgeting</p>
        </div>
      )}

      {/* ── Loading state ──────────────────────────────────────── */}
      {selectedFyId && loadingBudget && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* ── Budget Spreadsheet ─────────────────────────────────── */}
      {budget && !loadingBudget && (
        <>
          {/* Unsaved changes indicator */}
          {dirty && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              You have unsaved changes
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 opacity-80" />
                <span className="text-xs font-medium opacity-80">Total Revenue Budget</span>
              </div>
              <p className="text-2xl font-bold font-mono">ETB {fmt(totals.totalRevenue)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-5 h-5 opacity-80" />
                <span className="text-xs font-medium opacity-80">Total Expense Budget</span>
              </div>
              <p className="text-2xl font-bold font-mono">ETB {fmt(totals.totalExpense)}</p>
            </div>
            <div className={`bg-gradient-to-br ${totals.surplus >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} rounded-xl p-4 text-white shadow-lg`}>
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-5 h-5 opacity-80" />
                <span className="text-xs font-medium opacity-80">{totals.surplus >= 0 ? "Surplus" : "Deficit"}</span>
              </div>
              <p className="text-2xl font-bold font-mono">ETB {fmt(Math.abs(totals.surplus))}</p>
            </div>
          </div>

          {/* Revenue Section */}
          <SectionTable
            title="Revenue" titleAm="ገቢ"
            icon={TrendingUp}
            color="bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
            accs={revenueAccounts}
            expanded={revenueExpanded}
            setExpanded={setRevenueExpanded}
            subtotals={{ q1: totals.revQ1, q2: totals.revQ2, q3: totals.revQ3, q4: totals.revQ4, annual: totals.totalRevenue }}
          />

          {/* Expense Section */}
          <SectionTable
            title="Expenses" titleAm="ወጪዎች"
            icon={TrendingDown}
            color="bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700"
            accs={expenseAccounts}
            expanded={expenseExpanded}
            setExpanded={setExpenseExpanded}
            subtotals={{ q1: totals.expQ1, q2: totals.expQ2, q3: totals.expQ3, q4: totals.expQ4, annual: totals.totalExpense }}
          />

          {/* Bottom Save Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row justify-between items-center gap-3 sticky bottom-4 z-20">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">{budget.budgetName}</span>
              {" · "}
              <span className="text-green-600">Revenue: {fmt(totals.totalRevenue)}</span>
              {" · "}
              <span className="text-red-600">Expense: {fmt(totals.totalExpense)}</span>
              {" · "}
              <span className={totals.surplus >= 0 ? "text-blue-600" : "text-orange-600"}>
                {totals.surplus >= 0 ? "Surplus" : "Deficit"}: {fmt(Math.abs(totals.surplus))}
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !dirty}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Budget"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
