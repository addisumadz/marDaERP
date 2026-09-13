"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockQueryService from "../../../lib/invStockService";
import invStoreService from "../../../lib/invStoreService";
import { DollarSign } from "lucide-react";

export default function InvStockValuationPage() {
  const [stores, setStores] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { if (selectedStore) loadValuation(); }, [selectedStore]);

  const loadStores = async () => { try { const s = await invStoreService.getAllActive(); setStores(s); if (s.length > 0) setSelectedStore(s[0].id); } catch {} };

  const loadValuation = async () => {
    setLoading(true);
    try {
      const data = await invStockQueryService.getStockByStore(selectedStore, { size: 200 });
      const items = data.content || [];
      const enriched = items.map(s => ({ ...s, value: (s.quantityOnHand || 0) * (s.weightedAvgCost || 0) }));
      enriched.sort((a, b) => b.value - a.value);
      setValuations(enriched);
      setTotalValue(enriched.reduce((sum, v) => sum + v.value, 0));
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><DollarSign className="w-7 h-7 text-indigo-600" /> Stock Valuation Report</h1>
          <p className="text-sm text-gray-500 mt-1">Weighted average cost valuation by store</p>
        </div>
        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
        </select>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-xl p-6 shadow-lg">
        <p className="text-sm opacity-80">Total Inventory Value ({stores.find(s => s.id == selectedStore)?.storeName})</p>
        <p className="text-4xl font-bold mt-2">ETB {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        <p className="text-sm opacity-70 mt-1">{valuations.length} items in stock</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">#</th><th className="px-5 py-3 text-left">Code</th><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-right">Qty</th><th className="px-5 py-3 text-right">Avg Cost</th><th className="px-5 py-3 text-right">Value</th><th className="px-5 py-3 text-right">% of Total</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               valuations.map((v, i) => (
                <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 font-mono text-indigo-600">{v.item?.itemCode}</td>
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{v.item?.itemName}</td>
                  <td className="px-5 py-3 text-right font-mono">{Number(v.quantityOnHand).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right font-mono text-gray-600">ETB {Number(v.weightedAvgCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">ETB {v.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${totalValue > 0 ? (v.value / totalValue * 100) : 0}%` }}></div></div>
                      <span className="text-xs text-gray-500">{totalValue > 0 ? (v.value / totalValue * 100).toFixed(1) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-700/50 font-semibold"><tr><td colSpan={5} className="px-5 py-3 text-right">Grand Total:</td><td className="px-5 py-3 text-right font-mono text-indigo-600 text-base">ETB {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td><td className="px-5 py-3 text-right text-sm">100%</td></tr></tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
