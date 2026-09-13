"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncReportService from "../../../lib/fncReportService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import fncAccountService from "../../../lib/fncAccountService";
import { BookMarked } from "lucide-react";

export default function FncGeneralLedgerPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [fy, acc] = await Promise.all([fncFiscalYearService.getAllFiscalYears(), fncAccountService.getPostableAccounts()]);
        setFiscalYears(fy);
        setAccounts(acc);
        if (fy.length > 0) setSelectedFy(fy[0].id);
      } catch (e) {}
    };
    load();
  }, []);

  const loadLedger = async () => {
    if (!selectedAccount || !selectedFy) return;
    setLoading(true);
    try { setData(await fncReportService.getGeneralLedger(selectedAccount, selectedFy)); } catch (e) { toast.error("Failed to load ledger"); }
    setLoading(false);
  };

  useEffect(() => { if (selectedAccount && selectedFy) loadLedger(); }, [selectedAccount, selectedFy]);

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const selectedAccObj = accounts.find(a => a.id === Number(selectedAccount));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BookMarked className="w-7 h-7 text-indigo-600" /> General Ledger</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Select Fiscal Year</option>
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
        <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="">Select Account</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        {selectedAccObj && <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          <p className="font-semibold text-gray-900 dark:text-white">{selectedAccObj.accountCode} - {selectedAccObj.accountName}</p>
          <p className="text-sm text-gray-500">Type: {selectedAccObj.accountType} | Normal Balance: {selectedAccObj.normalBalance} | Currency: ETB</p>
        </div>}
        {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700"><tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Entry #</th>
                <th className="px-4 py-3 text-left font-semibold">Description</th>
                <th className="px-4 py-3 text-right font-semibold">Debit (ETB)</th>
                <th className="px-4 py-3 text-right font-semibold">Credit (ETB)</th>
                <th className="px-4 py-3 text-right font-semibold">Balance (ETB)</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="px-4 py-2">{r.date}</td>
                    <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400">{r.entryNumber}</td>
                    <td className="px-4 py-2 max-w-xs truncate">{r.description}</td>
                    <td className="px-4 py-2 text-right font-mono">{r.debit > 0 ? fmt(r.debit) : ""}</td>
                    <td className="px-4 py-2 text-right font-mono">{r.credit > 0 ? fmt(r.credit) : ""}</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold">{fmt(r.balance)}</td>
                  </tr>
                ))}
                {data.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">{selectedAccount ? "No transactions found" : "Select an account to view ledger"}</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
