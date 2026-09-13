"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockQueryService from "../../../lib/invStockService";
import invStoreService from "../../../lib/invStoreService";
import { AlertTriangle, TrendingDown } from "lucide-react";

export default function InvLowStockPage() {
  const [stores, setStores] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { if (selectedStore) loadLowStock(); }, [selectedStore]);

  const loadStores = async () => { try { const s = await invStoreService.getAllActive(); setStores(s); if (s.length > 0) setSelectedStore(s[0].id); } catch {} };

  const loadLowStock = async () => {
    setLoading(true);
    try {
      const data = await invStockQueryService.getLowStockItems(selectedStore);
      setLowStockItems(data || []);
    } catch { toast.error("Failed"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><AlertTriangle className="w-7 h-7 text-amber-500" /> Low Stock Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Items below reorder level that need restocking</p>
        </div>
        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
        </select>
      </div>

      {!loading && lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
          <div><p className="font-semibold text-red-700">{lowStockItems.length} items need restocking!</p><p className="text-sm text-red-600">These items are at or below their reorder level.</p></div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Code</th><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-left">Category</th><th className="px-5 py-3 text-right">On Hand</th><th className="px-5 py-3 text-right">Reorder Level</th><th className="px-5 py-3 text-right">Reorder Qty</th><th className="px-5 py-3 text-center">Urgency</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               lowStockItems.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-green-600 font-medium">✅ All items are above reorder level!</td></tr> :
               lowStockItems.map((s) => {
                const ratio = s.item?.reorderLevel > 0 ? s.quantityOnHand / s.item.reorderLevel : 1;
                const urgency = ratio === 0 ? "OUT OF STOCK" : ratio <= 0.5 ? "CRITICAL" : "LOW";
                const urgencyColor = ratio === 0 ? "bg-red-600 text-white" : ratio <= 0.5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
                return (
                  <tr key={s.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10">
                    <td className="px-5 py-3 font-mono font-semibold text-indigo-600">{s.item?.itemCode}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{s.item?.itemName}</td>
                    <td className="px-5 py-3 text-gray-600">{s.item?.category?.categoryCode}</td>
                    <td className="px-5 py-3 text-right font-mono font-bold text-red-600">{Number(s.quantityOnHand).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-500">{s.item?.reorderLevel}</td>
                    <td className="px-5 py-3 text-right font-mono text-gray-500">{s.item?.reorderQuantity}</td>
                    <td className="px-5 py-3 text-center"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${urgencyColor}`}><TrendingDown className="w-3 h-3" />{urgency}</span></td>
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
