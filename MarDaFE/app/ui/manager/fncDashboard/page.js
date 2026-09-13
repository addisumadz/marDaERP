"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncReportService from "../../../lib/fncReportService";
import fncJournalEntryService from "../../../lib/fncJournalEntryService";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import fncAccountService from "../../../lib/fncAccountService";
import { Landmark, TrendingUp, TrendingDown, FileText, DollarSign, BookOpen, AlertCircle } from "lucide-react";

export default function FncDashboardPage() {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedFy, setSelectedFy] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [trialBalance, setTrialBalance] = useState(null);
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [accountCount, setAccountCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiscalYears();
  }, []);

  useEffect(() => {
    if (selectedFy) loadDashboardData();
  }, [selectedFy]);

  const loadFiscalYears = async () => {
    try {
      const data = await fncFiscalYearService.getAllFiscalYears();
      setFiscalYears(data);
      if (data.length > 0) setSelectedFy(data[0].id);
    } catch (e) { toast.error("Failed to load fiscal years"); }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [entries, tb, is, accounts] = await Promise.all([
        fncJournalEntryService.getAllEntries({ page: 0, size: 5, fiscalYearId: selectedFy }),
        fncReportService.getTrialBalance(selectedFy).catch(() => null),
        fncReportService.getIncomeStatement(selectedFy).catch(() => null),
        fncAccountService.getAllAccounts().catch(() => []),
      ]);
      setRecentEntries(entries?.content || []);
      setTrialBalance(tb);
      setIncomeStatement(is);
      setAccountCount(accounts?.length || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const formatCurrency = (val) => {
    if (val == null || isNaN(val)) return "ETB 0.00";
    return `ETB ${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const statusColor = (status) => {
    if (status === "POSTED") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    if (status === "DRAFT") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-7 h-7 text-indigo-600" />
            Finance Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Double-Entry Accounting System • ETB Currency</p>
        </div>
        <select
          value={selectedFy || ""}
          onChange={(e) => setSelectedFy(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500"
        >
          {fiscalYears.map((fy) => (
            <option key={fy.id} value={fy.id}>
              {fy.fiscalYearName} {fy.isClosed ? "(Closed)" : "(Open)"}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(incomeStatement?.totalRevenue)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-200 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(incomeStatement?.totalExpense)}</p>
                </div>
                <TrendingDown className="w-10 h-10 text-red-200 opacity-80" />
              </div>
            </div>
            <div className={`bg-gradient-to-br ${(incomeStatement?.netIncome || 0) >= 0 ? "from-green-500 to-green-600" : "from-orange-500 to-orange-600"} rounded-xl p-5 text-white shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Net Income</p>
                  <p className="text-2xl font-bold mt-1">{formatCurrency(incomeStatement?.netIncome)}</p>
                </div>
                <DollarSign className="w-10 h-10 opacity-80" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Active Accounts</p>
                  <p className="text-2xl font-bold mt-1">{accountCount}</p>
                </div>
                <BookOpen className="w-10 h-10 text-purple-200 opacity-80" />
              </div>
            </div>
          </div>

          {/* Trial Balance Status & Recent Entries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trial Balance Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Trial Balance Status
              </h2>
              {trialBalance ? (
                <div className="space-y-4">
                  <div className={`flex items-center justify-center p-4 rounded-lg ${trialBalance.isBalanced ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"}`}>
                    <span className={`text-lg font-bold ${trialBalance.isBalanced ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                      {trialBalance.isBalanced ? "✅ Balanced" : "❌ Unbalanced"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Debits</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(trialBalance.totalDebit)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Credits</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(trialBalance.totalCredit)}</p>
                    </div>
                  </div>
                  <p className="text-center text-sm text-gray-500">{trialBalance.rows?.length || 0} accounts with activity</p>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No data for selected fiscal year</p>
              )}
            </div>

            {/* Recent Journal Entries */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Journal Entries
              </h2>
              {recentEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{entry.entryNumber}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{entry.description}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(entry.totalDebit)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(entry.status)}`}>
                          {entry.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No journal entries yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
