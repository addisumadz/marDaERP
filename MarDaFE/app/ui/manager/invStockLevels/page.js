"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockQueryService from "../../../lib/invStockService";
import invStoreService from "../../../lib/invStoreService";
import { Boxes, Search, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";

export default function InvStockLevelsPage() {
  const [stocks, setStocks] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");
  const [valuation, setValuation] = useState(null);
  const [page, setPage] = useState(0);

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { if (selectedStore) { loadStock(); loadValuation(); } }, [selectedStore, page]);

  const loadStores = async () => {
    try {
      const data = await invStoreService.getAllActive();
      setStores(data);
      if (data.length > 0) setSelectedStore(data[0].id);
    } catch { toast.error("Failed to load stores"); }
  };

  const loadStock = async () => {
    setLoading(true);
    try {
      const data = await invStockQueryService.getStockByStore(selectedStore, { page, size: 20 });
      setStocks(data.content || []);
    } catch { toast.error("Failed to load stock"); }
    setLoading(false);
  };

  const loadValuation = async () => {
    try { setValuation(await invStockQueryService.getStockValuation(selectedStore)); } catch {}
  };

  const isLowStock = (stock) => {
    const item = stock.item;
    return item?.reorderLevel && stock.quantityOnHand <= item.reorderLevel;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Boxes className="w-7 h-7 text-indigo-600" /> Stock Levels</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time stock levels by store</p>
        </div>
        <select value={selectedStore} onChange={(e) => { setSelectedStore(e.target.value); setPage(0); }} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-w-[200px]">
          {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      {valuation && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Total Stock Value</p>
                <p className="text-2xl font-bold">ETB {Number(valuation.totalValue || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <Boxes className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Total Items</p>
                <p className="text-2xl font-bold">{stocks.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 opacity-80" />
              <div>
                <p className="text-sm opacity-80">Low Stock Items</p>
                <p className="text-2xl font-bold">{stocks.filter(isLowStock).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Item Code</th>
                <th className="px-5 py-3 text-left">Item Name</th>
                <th className="px-5 py-3 text-left">Category</th>
                <th className="px-5 py-3 text-right">On Hand</th>
                <th className="px-5 py-3 text-right">Reorder Level</th>
                <th className="px-5 py-3 text-right">Avg Cost</th>
                <th className="px-5 py-3 text-right">Stock Value</th>
                <th className="px-5 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               stocks.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No stock data for this store</td></tr> :
               stocks.map((s) => {
                const low = isLowStock(s);
                const value = (s.quantityOnHand * (s.weightedAvgCost || 0)).toFixed(2);
                return (
                  <tr key={s.id} className={`transition-colors ${low ? "bg-red-50 dark:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"}`}>
                    <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{s.item?.itemCode}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{s.item?.itemName}</td>
                    <td className="px-5 py-3 text-gray-600">{s.item?.category?.categoryCode || "—"}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">{Number(s.quantityOnHand).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-500">{s.item?.reorderLevel || "—"}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-700 dark:text-gray-300">ETB {Number(s.weightedAvgCost || 0).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono font-semibold text-gray-900 dark:text-white">ETB {Number(value).toLocaleString()}</td>
                    <td className="px-5 py-3 text-center">
                      {low ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700"><TrendingDown className="w-3 h-3" /> Low</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
