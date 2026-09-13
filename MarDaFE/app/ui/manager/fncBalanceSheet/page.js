"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncReportService from "../../../lib/fncReportService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { PieChart } from "lucide-react";

export default function FncBalanceSheetPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => { try { const d = await fncFiscalYearService.getAllFiscalYears(); setFiscalYears(d); if (d.length > 0) setSelectedFy(d[0].id); } catch (e) {} })(); }, []);
  useEffect(() => { if (selectedFy) loadReport(); }, [selectedFy]);

  const loadReport = async () => {
    setLoading(true);
    try { setData(await fncReportService.getBalanceSheet(selectedFy)); } catch (e) { toast.error("Failed to load report"); }
    setLoading(false);
  };

  const fmt = (v) => `ETB ${Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const Section = ({ title, titleAm, items, total, color }) => (
    <div>
      <h3 className={`text-lg font-bold ${color} mb-3 border-b pb-1`}>{title} {titleAm && <span className="text-sm font-normal opacity-70">/ {titleAm}</span>}</h3>
      <div className="space-y-2">
        {(items || []).map((item, i) => (
          <div key={i} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg">
            <span className="text-gray-700 dark:text-gray-300">{item.accountCode} - {item.accountName}</span>
            <span className="font-mono font-medium text-gray-900 dark:text-white">{fmt(item.amount)}</span>
          </div>
        ))}
        <div className={`flex justify-between items-center px-4 py-3 rounded-lg font-bold bg-opacity-10 ${color}`}>
          <span>Total {title}</span>
          <span className="font-mono">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><PieChart className="w-7 h-7 text-purple-600" /> Balance Sheet</h1>
        <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : data ? (
          <div className="p-6 space-y-6">
            <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Balance Sheet / ሚዛን ሉህ</h2>
              <p className="text-sm text-gray-500">{data.fiscalYearName} | As of: {data.asOfDate}</p>
            </div>

            <Section title="Assets" titleAm="ንብረቶች" items={data.assets} total={data.totalAssets} color="text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" />
            <Section title="Liabilities" titleAm="እዳዎች" items={data.liabilities} total={data.totalLiabilities} color="text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" />
            <Section title="Equity" titleAm="የባለቤትነት ድርሻ" items={data.equity} total={data.totalEquity} color="text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800" />

            <div className="flex justify-between items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg font-bold">
              <span>Total Liabilities + Equity</span>
              <span className="font-mono">{fmt(data.totalLiabilitiesAndEquity)}</span>
            </div>

            <div className={`flex justify-between items-center px-6 py-4 rounded-xl font-bold text-xl ${data.isBalanced ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700" : "bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700"}`}>
              <span>{data.isBalanced ? "✅ Assets = Liabilities + Equity" : "❌ Balance Sheet does not balance"}</span>
              <span className="font-mono text-sm">{fmt(data.totalAssets)} = {fmt(data.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        ) : <p className="text-center py-16 text-gray-500">Select a fiscal year</p>}
      </div>
    </div>
  );
}
