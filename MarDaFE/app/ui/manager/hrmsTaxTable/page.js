"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsPayrollService from "../../../lib/hrmsPayrollService";
import { 
  Scale, 
  Percent, 
  ShieldCheck, 
  Info, 
  Calculator,
  ArrowRight
} from "lucide-react";

export default function HrmsTaxTablePage() {
  const [brackets, setBrackets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick calculator test state
  const [testIncome, setTestIncome] = useState(15000);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await hrmsPayrollService.getTaxBrackets();
      setBrackets(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load tax brackets");
    }
    setLoading(false);
  };

  // Helper compute tax
  const calculateTestTax = (income) => {
    const inc = Number(income) || 0;
    if (inc <= 600) return { tax: 0, rate: 0, deduction: 0 };
    if (inc <= 1650) return { tax: inc * 0.10 - 60, rate: 10, deduction: 60 };
    if (inc <= 3200) return { tax: inc * 0.15 - 142.50, rate: 15, deduction: 142.50 };
    if (inc <= 5250) return { tax: inc * 0.20 - 302.50, rate: 20, deduction: 302.50 };
    if (inc <= 7800) return { tax: inc * 0.25 - 565.00, rate: 25, deduction: 565.00 };
    if (inc <= 10900) return { tax: inc * 0.30 - 955.00, rate: 30, deduction: 955.00 };
    return { tax: inc * 0.35 - 1500.00, rate: 35, deduction: 1500.00 };
  };

  const testResult = calculateTestTax(testIncome);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" /> Statutory Tax Brackets - Schedule A (የገቢ ግብር ሰንጠረዥ)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Federal Democratic Republic of Ethiopia Income Tax Proclamation No. 979/2016
          </p>
        </div>
      </div>

      {/* Info Alert Box */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong>Schedule A Employment Income Tax Rule:</strong> Tax is computed progressively based on monthly taxable earnings. 
          The first 600 ETB is 100% tax exempt. Monthly employment income exceeding 10,900 ETB is subject to the top marginal statutory rate of 35% with standard formula deduction of 1,500.00 ETB.
        </div>
      </div>

      {/* Schedule A Brackets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
          <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
            Progressive Schedule A Brackets
          </span>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
            7 Tiers • Official Formula
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 text-center">Tier #</th>
                <th className="px-5 py-3.5 text-left">Monthly Taxable Range (ETB)</th>
                <th className="px-5 py-3.5 text-center">Statutory Tax Rate (%)</th>
                <th className="px-5 py-3.5 text-right">Deductible Offset (Birr)</th>
                <th className="px-5 py-3.5 text-left">Calculation Formula Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading statutory tax brackets...</td>
                </tr>
              ) : brackets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No brackets configured</td>
                </tr>
              ) : (
                brackets.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5 text-center font-bold text-gray-500">
                      #{b.weight}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900 dark:text-white">
                      {b.description}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {b.percentBirr}%
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-gray-800 dark:text-gray-200">
                      {b.totalDeductibleTillThis ? b.totalDeductibleTillThis.toFixed(2) : "0.00"} ETB
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500 font-mono">
                      {b.percentBirr === 0 ? "Tax = 0" : `(Taxable × ${b.percentBirr}%) - ${b.totalDeductibleTillThis}`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Tax Simulator */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-indigo-600" /> Interactive Schedule A Tax Simulator
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
              Monthly Taxable Income (ETB)
            </label>
            <input
              type="number"
              value={testIncome}
              onChange={e => setTestIncome(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 text-base font-bold font-mono text-gray-900 dark:text-white"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400 uppercase">Effective Tier</div>
              <div className="text-lg font-bold text-indigo-600">{testResult.rate}% Bracket</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 uppercase">Deduction</div>
              <div className="text-base font-mono font-bold text-gray-700 dark:text-gray-300">{testResult.deduction.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
            <div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 uppercase font-semibold">Calculated Income Tax</div>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 font-mono">
                {testResult.tax.toFixed(2)} ETB
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">Effective Rate</div>
              <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {testIncome > 0 ? ((testResult.tax / testIncome) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
