"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncReportService from "../../../lib/fncReportService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { Scale } from "lucide-react";

export default function FncTrialBalancePage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadFiscalYears(); }, []);

  const loadFiscalYears = async () => {
    try { const d = await fncFiscalYearService.getAllFiscalYears(); setFiscalYears(d); if (d.length > 0) { setSelectedFy(d[0].id); } } catch (e) {}
  };

  useEffect(() => { if (selectedFy) loadReport(); }, [selectedFy]);

  const loadReport = async () => {
    setLoading(true);
    try { setData(await fncReportService.getTrialBalance(selectedFy)); } catch (e) { toast.error("Failed to load trial balance"); }
    setLoading(false);
  };

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Scale className="w-7 h-7 text-indigo-600" /> Trial Balance</h1>
        <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm">
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : data ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <p className="text-sm text-gray-600 dark:text-gray-400">Fiscal Year: <strong>{data.fiscalYearName}</strong> | As of: <strong>{data.asOfDate}</strong> | Currency: <strong>ETB</strong></p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700"><tr>
                  <th className="px-4 py-3 text-left font-semibold">Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Account Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Amharic</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-right font-semibold">Debit (ETB)</th>
                  <th className="px-4 py-3 text-right font-semibold">Credit (ETB)</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(data.rows || []).map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-2 font-mono">{r.accountCode}</td>
                      <td className="px-4 py-2">{r.accountName}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{r.accountNameAm || "—"}</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">{r.accountType}</span></td>
                      <td className="px-4 py-2 text-right font-mono">{r.debitBalance > 0 ? fmt(r.debitBalance) : ""}</td>
                      <td className="px-4 py-2 text-right font-mono">{r.creditBalance > 0 ? fmt(r.creditBalance) : ""}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={`font-bold text-lg ${data.isBalanced ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                    <td colSpan={4} className="px-4 py-3 text-right">{data.isBalanced ? "✅ BALANCED" : "❌ UNBALANCED"} — Totals:</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(data.totalDebit)}</td>
                    <td className="px-4 py-3 text-right font-mono">{fmt(data.totalCredit)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        ) : <p className="text-center py-16 text-gray-500">Select a fiscal year to view trial balance</p>}
      </div>
    </div>
  );
}
