"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import fncBudgetService from "../../../lib/fncBudgetService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { BarChart3, AlertTriangle, CheckCircle } from "lucide-react";

export default function FncBudgetVsActualPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const fy = await fncFiscalYearService.getAllFiscalYears();
        setFiscalYears(fy);
        if (fy.length > 0) setSelectedFy(fy[0].id);
      } catch (e) {}
    })();
  }, []);

  useEffect(() => { if (selectedFy) loadReport(); }, [selectedFy]);

  const loadReport = async () => {
    setLoading(true);
    try { setData(await fncBudgetService.getBudgetVsActual(selectedFy)); }
    catch (e) { toast.error("Failed to load report"); setData([]); }
    setLoading(false);
  };

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const revenueRows = useMemo(() => data.filter(r => r.accountType === "REVENUE"), [data]);
  const expenseRows = useMemo(() => data.filter(r => r.accountType === "EXPENSE"), [data]);

  const totals = useMemo(() => {
    const revBudget = revenueRows.reduce((s, r) => s + Number(r.budgetAmount || 0), 0);
    const revActual = revenueRows.reduce((s, r) => s + Number(r.actualAmount || 0), 0);
    const expBudget = expenseRows.reduce((s, r) => s + Number(r.budgetAmount || 0), 0);
    const expActual = expenseRows.reduce((s, r) => s + Number(r.actualAmount || 0), 0);
    return { revBudget, revActual, expBudget, expActual };
  }, [revenueRows, expenseRows]);

  const utilizationColor = (u) => {
    const n = Number(u || 0);
    if (n >= 100) return "text-red-600 bg-red-50 dark:bg-red-900/20";
    if (n >= 80) return "text-orange-600 bg-orange-50 dark:bg-orange-900/20";
    if (n >= 50) return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    return "text-green-600 bg-green-50 dark:bg-green-900/20";
  };

  const varianceIcon = (v, type) => {
    const n = Number(v || 0);
    if (type === "EXPENSE") return n >= 0 ? <CheckCircle className="w-3.5 h-3.5 text-green-500 inline" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline" />;
    return n <= 0 ? <CheckCircle className="w-3.5 h-3.5 text-green-500 inline" /> : <AlertTriangle className="w-3.5 h-3.5 text-orange-500 inline" />;
  };

  const ProgressBar = ({ value }) => {
    const pct = Math.min(Number(value || 0), 150);
    const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-500" : pct >= 50 ? "bg-yellow-500" : "bg-green-500";
    return (
      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    );
  };

  const Section = ({ title, titleAm, rows, color }) => (
    <div className="mb-6">
      <h3 className={`text-sm font-bold ${color} mb-3 uppercase tracking-wider`}>{title} <span className="font-normal opacity-70">/ {titleAm}</span></h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700"><tr>
            <th className="px-3 py-2.5 text-left font-semibold">Code</th>
            <th className="px-3 py-2.5 text-left font-semibold">Account</th>
            <th className="px-3 py-2.5 text-right font-semibold">Budget (ETB)</th>
            <th className="px-3 py-2.5 text-right font-semibold">Actual (ETB)</th>
            <th className="px-3 py-2.5 text-right font-semibold">Variance (ETB)</th>
            <th className="px-3 py-2.5 text-center font-semibold">Utilization</th>
            <th className="px-3 py-2.5 text-center font-semibold w-24">Progress</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-3 py-2 font-mono text-xs">{r.accountCode}</td>
                <td className="px-3 py-2 text-gray-900 dark:text-white">{r.accountName}</td>
                <td className="px-3 py-2 text-right font-mono">{fmt(r.budgetAmount)}</td>
                <td className="px-3 py-2 text-right font-mono font-medium">{fmt(r.actualAmount)}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {varianceIcon(r.variance, r.accountType)} {fmt(r.variance)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${utilizationColor(r.utilization)}`}>
                    {Number(r.utilization || 0).toFixed(1)}%
                  </span>
                </td>
                <td className="px-3 py-2 flex justify-center"><ProgressBar value={r.utilization} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-500">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600" /> Budget vs Actual
          </h1>
          <p className="text-sm text-gray-500 mt-1">Compare budgeted amounts to actual spending</p>
        </div>
        <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Revenue Budget", value: totals.revBudget, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" },
          { label: "Revenue Actual", value: totals.revActual, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" },
          { label: "Expense Budget", value: totals.expBudget, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800" },
          { label: "Expense Actual", value: totals.expActual, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
        ].map((c, i) => (
          <div key={i} className={`rounded-xl border p-4 ${c.bg}`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold font-mono ${c.color}`}>ETB {fmt(c.value)}</p>
          </div>
        ))}
      </div>

      {/* Report */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : (
          <>
            <Section title="Revenue" titleAm="ገቢ" rows={revenueRows} color="text-green-700 dark:text-green-400" />
            <Section title="Expenses" titleAm="ወጪዎች" rows={expenseRows} color="text-red-700 dark:text-red-400" />
          </>
        )}
      </div>
    </div>
  );
}
