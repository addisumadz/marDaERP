"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncCashBookService from "../../../lib/fncCashBookService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { BookOpen, ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";

export default function FncCashBookPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [selectedFy, setSelectedFy] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("summary");

  useEffect(() => {
    (async () => {
      try {
        const [fy, acc] = await Promise.all([fncFiscalYearService.getAllFiscalYears(), fncCashBookService.getCashBankAccounts()]);
        setFiscalYears(fy); setCashAccounts(acc);
        if (fy.length > 0) setSelectedFy(fy[0].id);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  useEffect(() => { if (selectedFy) loadSummary(); }, [selectedFy]);

  const loadSummary = async () => {
    try { setSummary(await fncCashBookService.getSummary(selectedFy)); } catch (e) { setSummary([]); }
  };

  const loadEntries = async () => {
    if (!selectedAccount || !selectedFy) { toast.error("Select account and fiscal year"); return; }
    setLoading(true);
    try {
      const d = await fncCashBookService.getEntries(selectedAccount, selectedFy, startDate, endDate);
      setData(d); setView("detail");
    } catch (e) { toast.error("Failed to load"); }
    setLoading(false);
  };

  useEffect(() => { if (selectedAccount && selectedFy && view === "detail") loadEntries(); }, [selectedAccount, selectedFy]);

  const fmt = (v) => Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BookOpen className="w-7 h-7 text-indigo-600" /> Cash & Bank Book</h1>
          <p className="text-sm text-gray-500 mt-1">Track daily cash inflows, outflows and balances</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setView("summary"); setData(null); }} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "summary" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>Summary</button>
          <button onClick={() => setView("detail")} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "detail" ? "bg-indigo-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"}`}>Detail</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex flex-col sm:flex-row gap-3">
        <select value={selectedFy} onChange={(e) => setSelectedFy(Number(e.target.value))} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          {fiscalYears.map(f => <option key={f.id} value={f.id}>{f.fiscalYearName}</option>)}
        </select>
        {view === "detail" && (<>
          <select value={selectedAccount} onChange={(e) => setSelectedAccount(Number(e.target.value))} className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Select Cash/Bank Account</option>
            {cashAccounts.map(a => <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>)}
          </select>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="From" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="To" />
          <button onClick={loadEntries} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">Load</button>
        </>)}
      </div>

      {/* Summary View */}
      {view === "summary" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Wallet className="w-5 h-5 text-indigo-600" /> Cash Position Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700"><tr>
                <th className="px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-4 py-3 text-left font-semibold">Account Name</th>
                <th className="px-4 py-3 text-left font-semibold">Amharic</th>
                <th className="px-4 py-3 text-right font-semibold">Current Balance (ETB)</th>
                <th className="px-4 py-3 text-center font-semibold">Action</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {summary.map((r, i) => (
                  <tr key={i} className={`${r.isTotal ? "bg-indigo-50 dark:bg-indigo-900/20 font-bold text-lg" : "hover:bg-gray-50 dark:hover:bg-gray-750"}`}>
                    <td className="px-4 py-3 font-mono">{r.accountCode}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{r.accountName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{r.accountNameAm || ""}</td>
                    <td className={`px-4 py-3 text-right font-mono ${Number(r.currentBalance) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      ETB {fmt(r.currentBalance)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!r.isTotal && <button onClick={() => { setSelectedAccount(r.id); setView("detail"); }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">View Book →</button>}
                    </td>
                  </tr>
                ))}
                {summary.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No cash accounts found</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail View */}
      {view === "detail" && data && (
        <>
          {/* Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-blue-100 text-xs font-medium">Opening Balance</p>
              <p className="text-xl font-bold font-mono mt-1">ETB {fmt(data.openingBalance)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-green-100 text-xs font-medium flex items-center gap-1"><ArrowDownCircle className="w-3.5 h-3.5" /> Total Receipts</p>
              <p className="text-xl font-bold font-mono mt-1">ETB {fmt(data.totalReceipts)}</p>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-red-100 text-xs font-medium flex items-center gap-1"><ArrowUpCircle className="w-3.5 h-3.5" /> Total Payments</p>
              <p className="text-xl font-bold font-mono mt-1">ETB {fmt(data.totalPayments)}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <p className="text-indigo-100 text-xs font-medium">Closing Balance</p>
              <p className="text-xl font-bold font-mono mt-1">ETB {fmt(data.closingBalance)}</p>
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <p className="font-bold text-gray-900 dark:text-white">{data.accountCode} — {data.accountName}</p>
              <p className="text-sm text-gray-500">{data.fiscalYearName} | {data.startDate} to {data.endDate}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700"><tr>
                  <th className="px-4 py-2.5 text-left font-semibold">Date</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Entry #</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Ref</th>
                  <th className="px-4 py-2.5 text-left font-semibold">Description</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-green-700">Receipt (ETB)</th>
                  <th className="px-4 py-2.5 text-right font-semibold text-red-700">Payment (ETB)</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Balance (ETB)</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Opening Balance Row */}
                  <tr className="bg-blue-50 dark:bg-blue-900/10 font-medium">
                    <td className="px-4 py-2" colSpan={4}>Opening Balance / የመክፈቻ ቀሪ ሂሳብ</td>
                    <td className="px-4 py-2 text-right"></td>
                    <td className="px-4 py-2 text-right"></td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{fmt(data.openingBalance)}</td>
                  </tr>
                  {(data.entries || []).map((e, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-4 py-2">{e.date}</td>
                      <td className="px-4 py-2 font-mono text-indigo-600 dark:text-indigo-400 text-xs">{e.entryNumber}</td>
                      <td className="px-4 py-2 text-xs text-gray-500">{e.referenceNumber || "—"}</td>
                      <td className="px-4 py-2 max-w-xs truncate text-gray-700 dark:text-gray-300">{e.description}</td>
                      <td className="px-4 py-2 text-right font-mono text-green-600">{Number(e.receipt) > 0 ? fmt(e.receipt) : ""}</td>
                      <td className="px-4 py-2 text-right font-mono text-red-600">{Number(e.payment) > 0 ? fmt(e.payment) : ""}</td>
                      <td className="px-4 py-2 text-right font-mono font-semibold">{fmt(e.balance)}</td>
                    </tr>
                  ))}
                  {(data.entries || []).length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No transactions in this period</td></tr>}
                  {/* Closing Balance Row */}
                  <tr className="bg-indigo-50 dark:bg-indigo-900/10 font-bold">
                    <td className="px-4 py-3" colSpan={4}>Closing Balance / የመዝጊያ ቀሪ ሂሳብ</td>
                    <td className="px-4 py-3 text-right font-mono text-green-700">{fmt(data.totalReceipts)}</td>
                    <td className="px-4 py-3 text-right font-mono text-red-700">{fmt(data.totalPayments)}</td>
                    <td className="px-4 py-3 text-right font-mono text-indigo-700">{fmt(data.closingBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === "detail" && !data && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border p-12 text-center text-gray-500">
          Select a cash/bank account and click Load to view the book
        </div>
      )}
    </div>
  );
}
