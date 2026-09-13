"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncReportService from "../../../lib/fncReportService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { TrendingUp } from "lucide-react";

export default function FncIncomeStatementPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { try { const d = await fncFiscalYearService.getAllFiscalYears(); setFiscalYears(d); if (d.length > 0) setSelectedFy(d[0].id); } catch (e) {} })(); }, []);
  useEffect(() => { if (selectedFy) loadReport(); }, [selectedFy]);

  const loadReport = async () => {
    setLoading(true);
    try { setData(await fncReportService.getIncomeStatement(selectedFy)); } catch (e) { toast.error("Failed to load report"); }
    setLoading(false);
  };

  const fmt = (v) => `ETB ${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-7 h-7 text-green-600" /> Income Statement</h1>
        <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : data ? (
          <div className="p-6 space-y-6">
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Income Statement</h2>
              <p className="text-sm text-gray-500">{data.fiscalYearName} | Period: {data.period}</p>
            </div>

            {/* Revenue Section */}
            <div>
              <h3 className="text-lg font-bold text-green-700 dark:text-green-400 mb-3 border-b border-green-200 dark:border-green-800 pb-1">Revenue / ገቢ</h3>
              <div className="space-y-2">
                {(data.revenueItems || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{item.accountCode} - {item.accountName} {item.accountNameAm && <span className="text-gray-400 text-sm">({item.accountNameAm})</span>}</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{fmt(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-lg font-bold">
                  <span className="text-green-800 dark:text-green-300">Total Revenue</span>
                  <span className="font-mono text-green-800 dark:text-green-300">{fmt(data.totalRevenue)}</span>
                </div>
              </div>
            </div>

            {/* Expense Section */}
            <div>
              <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-3 border-b border-red-200 dark:border-red-800 pb-1">Expenses / ወጪዎች</h3>
              <div className="space-y-2">
                {(data.expenseItems || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">{item.accountCode} - {item.accountName} {item.accountNameAm && <span className="text-gray-400 text-sm">({item.accountNameAm})</span>}</span>
                    <span className="font-mono font-medium text-gray-900 dark:text-white">{fmt(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-red-50 dark:bg-red-900/20 rounded-lg font-bold">
                  <span className="text-red-800 dark:text-red-300">Total Expenses</span>
                  <span className="font-mono text-red-800 dark:text-red-300">{fmt(data.totalExpense)}</span>
                </div>
              </div>
            </div>

            {/* Net Income */}
            <div className={`flex justify-between items-center px-6 py-4 rounded-xl font-bold text-xl ${data.netIncome >= 0 ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700" : "bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700"}`}>
              <span>{data.netIncome >= 0 ? "Net Income / የተጣራ ትርፍ" : "Net Loss / የተጣራ ኪሳራ"}</span>
              <span className="font-mono">{fmt(data.netIncome)}</span>
            </div>
          </div>
        ) : <p className="text-center py-16 text-gray-500">Select a fiscal year</p>}
      </div>
    </div>
  );
}
