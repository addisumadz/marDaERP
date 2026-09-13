"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsPayrollAccountMapService from "../../../lib/hrmsPayrollAccountMapService";
import fncAccountService from "../../../lib/fncAccountService";
import { 
  Link as LinkIcon, 
  Save, 
  Settings, 
  BookOpen, 
  Info, 
  CheckCircle2, 
  Landmark,
  ArrowRight
} from "lucide-react";

export default function HrmsAccountMapPage() {
  const [mappings, setMappings] = useState([]);
  const [postableAccounts, setPostableAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mapsData, accData] = await Promise.all([
        hrmsPayrollAccountMapService.getAllMappings().catch(() => []),
        fncAccountService.getPostableAccounts().catch(() => [])
      ]);
      setMappings(Array.isArray(mapsData) ? mapsData : []);
      setPostableAccounts(Array.isArray(accData) ? accData : []);
    } catch (e) {
      toast.error("Failed to load payroll GL mappings");
    }
    setLoading(false);
  };

  const handleAccountChange = (mappingId, accountId) => {
    setMappings(prev => prev.map(m => {
      if (m.id === mappingId) {
        return {
          ...m,
          chartOfAccount: accountId ? { id: Number(accountId) } : null
        };
      }
      return m;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await hrmsPayrollAccountMapService.saveMappings(mappings);
      toast.success("Payroll Chart of Accounts mappings saved successfully!");
      loadData();
    } catch (e) {
      toast.error("Failed to save mappings");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LinkIcon className="w-7 h-7 text-indigo-600" /> Payroll GL Account Mapping (ደመወዝ ሂሳብ ማገናኛ)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure dynamic General Ledger posting destinations for balanced DR/CR payroll journal vouchers
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow font-medium transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving Mappings..." : "Save GL Mappings"}
        </button>
      </div>

      {/* Info Callout */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong>Balanced Journal Voucher Integration:</strong> When monthly payroll is finalized, the system creates an automated balanced 
          journal entry in <code>FncJournalEntry</code>. Each debit component (Basic Salary, Employer Pension 11%, Overtime) and credit component 
          (Income Tax Payable, Total Pension 18% Payable, Net Salary Payable) is posted directly to the accounts mapped below.
        </div>
      </div>

      {/* Mappings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 text-left">Mapping Key</th>
                <th className="px-5 py-3.5 text-left">Payroll Item Description</th>
                <th className="px-5 py-3.5 text-center">Entry Side</th>
                <th className="px-5 py-3.5 text-left">Destination Chart of Account (GL)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading payroll account mappings...</td>
                </tr>
              ) : mappings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No account mappings found</td>
                </tr>
              ) : (
                mappings.map(mapItem => (
                  <tr key={mapItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {mapItem.mappingKey}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {mapItem.mappingDescription}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        mapItem.entrySide === "DEBIT" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" 
                          : "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                      }`}>
                        {mapItem.entrySide}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={mapItem.chartOfAccount?.id || ""}
                        onChange={e => handleAccountChange(mapItem.id, e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-medium focus:bg-white"
                      >
                        <option value="">— Select GL Account —</option>
                        {postableAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.accountCode} - {acc.accountName} ({acc.accountType})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {mapItem.chartOfAccount?.id ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-500 font-semibold">
                          Pending Setup
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
