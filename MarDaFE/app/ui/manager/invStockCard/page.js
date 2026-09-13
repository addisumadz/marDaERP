"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockQueryService from "../../../lib/invStockService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import { ClipboardList, Search } from "lucide-react";

const txnTypeColors = {
  RECEIVE: "bg-green-100 text-green-700", ISSUE_SALE: "bg-red-100 text-red-700", ISSUE_INTERNAL: "bg-orange-100 text-orange-700",
  TRANSFER_OUT: "bg-purple-100 text-purple-700", TRANSFER_IN: "bg-cyan-100 text-cyan-700",
  ADJUSTMENT_PLUS: "bg-blue-100 text-blue-700", ADJUSTMENT_MINUS: "bg-amber-100 text-amber-700",
};

export default function InvStockCardPage() {
  const [transactions, setTransactions] = useState([]);
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  useEffect(() => { loadLookups(); }, []);

  const loadLookups = async () => {
    try {
      const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]);
      setStores(s); setItems(i);
    } catch {}
  };

  const loadCard = async () => {
    if (!selectedItem || !selectedStore) { toast.error("Select both item and store"); return; }
    setLoading(true);
    try { setTransactions(await invStockQueryService.getStockCard(selectedItem, selectedStore)); }
    catch { toast.error("Failed to load stock card"); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><ClipboardList className="w-7 h-7 text-indigo-600" /> Stock Card</h1>
        <p className="text-sm text-gray-500 mt-1">Complete transaction history for a specific item in a store</p>
      </div>

      <div className="flex gap-3 flex-wrap items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store</label>
          <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Select Store</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[250px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item</label>
          <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">Select Item</option>
            {items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}
          </select>
        </div>
        <button onClick={loadCard} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">
          <Search className="w-4 h-4" /> Load Card
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Transaction #</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Unit Cost</th>
                <th className="px-4 py-3 text-right">Total Cost</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               transactions.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">{selectedItem && selectedStore ? "No transactions found" : "Select an item and store to view the stock card"}</td></tr> :
               transactions.map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-2.5 text-gray-600">{txn.transactionDate}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{txn.transactionNumber}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${txnTypeColors[txn.transactionType] || "bg-gray-100"}`}>{txn.transactionType?.replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{txn.referenceType} #{txn.referenceId || ""}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-semibold ${["RECEIVE", "TRANSFER_IN", "ADJUSTMENT_PLUS"].includes(txn.transactionType) ? "text-green-600" : "text-red-600"}`}>
                    {["RECEIVE", "TRANSFER_IN", "ADJUSTMENT_PLUS"].includes(txn.transactionType) ? "+" : "-"}{Number(txn.quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700">ETB {Number(txn.unitCost || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700">ETB {Number(txn.totalCost || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">{Number(txn.balanceAfter || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
