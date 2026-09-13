"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsPayrollService from "../../../lib/hrmsPayrollService";
import { 
  DollarSign, 
  Settings, 
  Search, 
  Tag, 
  Check, 
  X, 
  Scale, 
  Layers,
  Percent,
  Plus
} from "lucide-react";

export default function HrmsSalaryConfigsPage() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await hrmsPayrollService.getSalaryConfigurations();
      setConfigs(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load salary components");
    }
    setLoading(false);
  };

  const filtered = configs.filter(c => {
    const term = searchTerm.toLowerCase();
    return !term || 
      c.configTitle?.toLowerCase().includes(term) || 
      c.configCode?.toLowerCase().includes(term) ||
      c.configTitleAm?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-indigo-600" /> Salary Components & Allowances (የደመወዝ መዋቅር)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Rules engine parameters: Taxable allowances, statutory deductions, pensions & overtime rules
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search component title, code, or description..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Components Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 text-left">Code</th>
                <th className="px-5 py-3.5 text-left">Component Title</th>
                <th className="px-5 py-3.5 text-center">Type / Unit</th>
                <th className="px-5 py-3.5 text-right">Default Value</th>
                <th className="px-5 py-3.5 text-center">Taxable</th>
                <th className="px-5 py-3.5 text-center">Deductible</th>
                <th className="px-5 py-3.5 text-center">Additive</th>
                <th className="px-5 py-3.5 text-center">Pension Base</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading salary components...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">No salary configurations found</td>
                </tr>
              ) : (
                filtered.map(cfg => (
                  <tr key={cfg.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {cfg.configCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">{cfg.configTitle}</div>
                      {cfg.configTitleAm && (
                        <div className="text-xs text-gray-400">{cfg.configTitleAm}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {cfg.isPercent ? "Percentage (%)" : "Fixed (ETB)"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-900 dark:text-white">
                      {cfg.configValue} {cfg.isPercent ? "%" : "ETB"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cfg.isTaxed ? (
                        <span className="inline-flex p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cfg.isDeductible ? (
                        <span className="inline-flex p-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cfg.isAdditive ? (
                        <span className="inline-flex p-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
                          <X className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {cfg.isPension ? (
                        <span className="inline-flex p-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="inline-flex p-1 rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700">
                          <X className="w-3.5 h-3.5" />
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
