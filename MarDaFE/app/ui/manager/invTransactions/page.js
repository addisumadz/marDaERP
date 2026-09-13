"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStockQueryService from "../../../lib/invStockService";
import invStoreService from "../../../lib/invStoreService";
import { History, ChevronLeft, ChevronRight } from "lucide-react";

const txnTypeColors = {
  RECEIVE: "bg-green-100 text-green-700", ISSUE_SALE: "bg-red-100 text-red-700", ISSUE_INTERNAL: "bg-orange-100 text-orange-700",
  ISSUE_PROJECT: "bg-yellow-100 text-yellow-700", TRANSFER_OUT: "bg-purple-100 text-purple-700", TRANSFER_IN: "bg-cyan-100 text-cyan-700",
  ADJUSTMENT_PLUS: "bg-blue-100 text-blue-700", ADJUSTMENT_MINUS: "bg-amber-100 text-amber-700",
};

export default function InvTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { loadStores(); }, []);
  useEffect(() => { if (selectedStore) loadData(); }, [selectedStore, page]);

  const loadStores = async () => {
    try {
      const s = await invStoreService.getAllActive();
      const list = Array.isArray(s) ? s : [];
      setStores(list);
      if (list.length > 0) setSelectedStore(list[0].id);
    } catch {
      setStores([]);
    }
  };
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invStockQueryService.getTransactions({ storeId: selectedStore, page, size: 25 });
      setTransactions(Array.isArray(data.content) ? data.content : []);
      setTotalPages(data.totalPages || 0);
    } catch {
      toast.error("Failed");
      setTransactions([]);
    }
    setLoading(false);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><History className="w-7 h-7 text-indigo-600" /> Transaction History</h1>
          <p className="text-sm text-gray-500 mt-1">Complete audit trail of all stock movements</p>
        </div>
        <select value={selectedStore} onChange={(e) => { setSelectedStore(e.target.value); setPage(0); }} className="px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          {stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 uppercase text-xs tracking-wider">
              <tr><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-left">Txn #</th><th className="px-4 py-3 text-left">Type</th><th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-right">Cost</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3 text-left">By</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               transactions.length === 0 ? <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No transactions found</td></tr> :
               transactions.map((t, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-2.5 text-gray-600 text-xs">{t.transactionDate}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{t.transactionNumber}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${txnTypeColors[t.transactionType] || "bg-gray-100"}`}>{t.transactionType?.replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{t.item?.itemCode} — {t.item?.itemName}</td>
                  <td className={`px-4 py-2.5 text-right font-mono font-semibold ${["RECEIVE", "TRANSFER_IN", "ADJUSTMENT_PLUS"].includes(t.transactionType) ? "text-green-600" : "text-red-600"}`}>
                    {["RECEIVE", "TRANSFER_IN", "ADJUSTMENT_PLUS"].includes(t.transactionType) ? "+" : "-"}{Number(t.quantity).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-600">ETB {Number(t.unitCost || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">{Number(t.balanceAfter || 0).toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{t.performedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
