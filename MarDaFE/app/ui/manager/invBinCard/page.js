"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { invBinCardService } from "../../../lib/invReportService";
import invStoreService from "../../../lib/invStoreService";
import invItemService from "../../../lib/invItemService";
import { BookMarked, Search, Printer, Download, Building2, Package, Calendar } from "lucide-react";

const txnTypeLabels = {
  RECEIVE: "Received (GRN)", ISSUE_SALE: "Issued (Sale)", ISSUE_INTERNAL: "Issued (Internal)",
  TRANSFER_IN: "Transfer In", TRANSFER_OUT: "Transfer Out", ADJUSTMENT_PLUS: "Adjustment (+)",
  ADJUSTMENT_MINUS: "Adjustment (-)", RETURN: "Returned", DISPOSAL: "Disposed"
};

export default function InvBinCardPage() {
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [itemId, setItemId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [binCard, setBinCard] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadLookups(); }, []);
  const loadLookups = async () => { try { const [s, i] = await Promise.all([invStoreService.getAllActive(), invItemService.getAllActive()]); setStores(s); setItems(i); } catch {} };

  const handleSearch = async () => {
    if (!storeId || !itemId || !fromDate || !toDate) { toast.error("All fields are required"); return; }
    setLoading(true);
    try { setBinCard(await invBinCardService.getBinCard({ storeId, itemId, fromDate, toDate })); } catch (e) { toast.error(e.response?.data?.message || "Error loading bin card"); setBinCard(null); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BookMarked className="w-7 h-7 text-indigo-600" /> Bin Card (Model 22)</h1>
        <p className="text-sm text-gray-500 mt-1">የዕቃ ካርድ ሞዴል 22 — Ethiopian government standard stock card format</p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 items-end">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm"><option value="">Select Store</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Item</label>
            <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm"><option value="">Select Item</option>{items.map(i => <option key={i.id} value={i.id}>{i.itemCode} — {i.itemName}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm" /></div>
          <button onClick={handleSearch} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50">
            <Search className="w-4 h-4" /> {loading ? "Loading..." : "Generate"}
          </button>
        </div>
      </div>

      {/* Bin Card Result */}
      {binCard && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 print:shadow-none print:border-black">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-amber-50 via-white to-orange-50 dark:from-amber-950/30 dark:via-gray-800 dark:to-orange-950/30 print:bg-white">
            <div className="text-center mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">BIN CARD (MODEL 22)</h2>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">የዕቃ ካርድ ሞዴል 22</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2"><Package className="w-4 h-4 text-indigo-500" /><div><span className="text-gray-500 block text-xs">Item / ዕቃ</span><span className="font-semibold">{binCard.item?.itemName}</span><span className="block text-xs font-mono text-gray-400">{binCard.item?.itemCode}</span></div></div>
              <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500" /><div><span className="text-gray-500 block text-xs">Store / ግምጃ ቤት</span><span className="font-semibold">{binCard.store?.storeName}</span></div></div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-indigo-500" /><div><span className="text-gray-500 block text-xs">Period / ጊዜ</span><span className="font-semibold">{binCard.fromDate} — {binCard.toDate}</span></div></div>
              <div><span className="text-gray-500 block text-xs">UoM / መለኪያ</span><span className="font-semibold">{binCard.item?.unitOfMeasure || "—"}</span></div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 print:bg-gray-200">
                <tr className="border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-bold">Date<br/><span className="text-xs font-normal text-gray-500">ቀን</span></th>
                  <th className="px-4 py-3 text-left font-bold">Voucher Ref<br/><span className="text-xs font-normal text-gray-500">ማስረጃ</span></th>
                  <th className="px-4 py-3 text-left font-bold">Type<br/><span className="text-xs font-normal text-gray-500">ዓይነት</span></th>
                  <th className="px-4 py-3 text-right font-bold">Received<br/><span className="text-xs font-normal text-gray-500">ገቢ</span></th>
                  <th className="px-4 py-3 text-right font-bold">Issued<br/><span className="text-xs font-normal text-gray-500">ወጪ</span></th>
                  <th className="px-4 py-3 text-right font-bold">Balance<br/><span className="text-xs font-normal text-gray-500">ቀሪ</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {/* Opening Balance Row */}
                <tr className="bg-blue-50/50 dark:bg-blue-900/10 font-semibold">
                  <td className="px-4 py-2.5" colSpan={3}>Opening Balance / የመጀመሪያ ቀሪ</td>
                  <td className="px-4 py-2.5"></td>
                  <td className="px-4 py-2.5"></td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold">{Number(binCard.openingBalance || 0).toLocaleString()}</td>
                </tr>
                {/* Transaction Rows */}
                {(binCard.entries || []).map((entry, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{entry.date}</td>
                    <td className="px-4 py-2 font-mono text-xs text-indigo-600">{entry.transactionNumber}</td>
                    <td className="px-4 py-2 text-xs">{txnTypeLabels[entry.transactionType] || entry.transactionType}</td>
                    <td className="px-4 py-2 text-right font-mono text-green-600 font-semibold">{entry.received != null ? Number(entry.received).toLocaleString() : ""}</td>
                    <td className="px-4 py-2 text-right font-mono text-red-600 font-semibold">{entry.issued != null ? Number(entry.issued).toLocaleString() : ""}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{Number(entry.balance || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {(binCard.entries || []).length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No transactions in this period</td></tr>
                )}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-700/60 font-bold border-t-2 border-gray-300 print:bg-gray-200">
                <tr>
                  <td className="px-4 py-3" colSpan={3}>Totals / ድምር</td>
                  <td className="px-4 py-3 text-right font-mono text-green-700">{Number(binCard.totalReceived || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-red-700">{Number(binCard.totalIssued || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-lg">{Number(binCard.closingBalance || 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Print Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t print:hidden">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><Printer className="w-4 h-4" /> Print Bin Card</button>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:bg-gray-200 { background: #e5e7eb !important; }
          .print\\:border-black { border-color: black !important; }
        }
      `}</style>
    </div>
  );
}
