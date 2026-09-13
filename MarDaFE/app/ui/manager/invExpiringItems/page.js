"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockQueryService from "../../../lib/invStockService";
import invStoreService from "../../../lib/invStoreService";
import { Timer, AlertTriangle } from "lucide-react";

export default function InvExpiringItemsPage() {
  const [stores, setStores] = useState([]);
  const [expiringItems, setExpiringItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");
  const [daysThreshold, setDaysThreshold] = useState(90);

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { if (selectedStore) loadData(); }, [selectedStore, daysThreshold]);

  const loadStores = async () => { try { const s = await invStoreService.getAllActive(); setStores(s); if (s.length > 0) setSelectedStore(s[0].id); } catch {} };
  const loadData = async () => {
    setLoading(true);
    try { setExpiringItems(await invStockQueryService.getExpiringItems(selectedStore, daysThreshold)); }
    catch { toast.error("Failed"); }
    setLoading(false);
  };

  const daysUntilExpiry = (dateStr) => {
    if (!dateStr) return Infinity;
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return Math.ceil(diff);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Timer className="w-7 h-7 text-amber-500" /> Expiring Items</h1>
          <p className="text-sm text-gray-500 mt-1">Track items approaching expiry (chemicals, perishables)</p>
        </div>
        <div className="flex gap-3">
          <select value={daysThreshold} onChange={(e) => setDaysThreshold(Number(e.target.value))} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value={30}>Next 30 days</option><option value={60}>Next 60 days</option><option value={90}>Next 90 days</option><option value={180}>Next 6 months</option><option value={365}>Next year</option>
          </select>
          <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 uppercase text-xs tracking-wider">
              <tr><th className="px-5 py-3 text-left">Item Code</th><th className="px-5 py-3 text-left">Item Name</th><th className="px-5 py-3 text-left">Batch #</th><th className="px-5 py-3 text-left">Expiry Date</th><th className="px-5 py-3 text-right">Days Left</th><th className="px-5 py-3 text-center">Alert</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               expiringItems.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-green-600 font-medium">✅ No items expiring within {daysThreshold} days!</td></tr> :
               expiringItems.map((item, i) => {
                const days = daysUntilExpiry(item.expiryDate);
                const urgency = days <= 0 ? "EXPIRED" : days <= 30 ? "URGENT" : days <= 90 ? "SOON" : "OK";
                const urgencyColor = days <= 0 ? "bg-red-600 text-white" : days <= 30 ? "bg-red-100 text-red-700" : days <= 90 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700";
                return (
                  <tr key={i} className={`${days <= 0 ? "bg-red-50" : days <= 30 ? "bg-amber-50/50" : ""} hover:bg-gray-50 dark:hover:bg-gray-700/30`}>
                    <td className="px-5 py-3 font-mono text-indigo-600">{item.item?.itemCode || item.itemCode}</td>
                    <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{item.item?.itemName || item.itemName}</td>
                    <td className="px-5 py-3 font-mono text-gray-600">{item.batchNumber || "—"}</td>
                    <td className="px-5 py-3 text-gray-700">{item.expiryDate}</td>
                    <td className={`px-5 py-3 text-right font-mono font-bold ${days <= 0 ? "text-red-600" : days <= 30 ? "text-amber-600" : "text-gray-700"}`}>{days <= 0 ? "EXPIRED" : `${days} days`}</td>
                    <td className="px-5 py-3 text-center"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${urgencyColor}`}>{days <= 30 && <AlertTriangle className="w-3 h-3" />}{urgency}</span></td>
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
