"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { invReportService } from "../../../lib/invReportService";
import invStoreService from "../../../lib/invStoreService";
import { BarChart3, Search, Printer, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function InvReportsPage() {
  const [stores, setStores] = useState([]);
  const [activeTab, setActiveTab] = useState("movement");
  const [storeId, setStoreId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadLookups(); }, []);
  const loadLookups = async () => { try { setStores(await invStoreService.getAllActive()); } catch {} };

  const handleGenerate = async () => {
    if (!storeId || !fromDate || !toDate) { toast.error("Store and date range are required"); return; }
    setLoading(true);
    try {
      if (activeTab === "movement") {
        setData(await invReportService.getStockMovement({ storeId, fromDate, toDate }));
      } else {
        setData(await invReportService.getConsumption({ storeId, fromDate, toDate }));
      }
    } catch (e) { toast.error(e.response?.data?.message || "Error"); setData(null); }
    setLoading(false);
  };

  const tabs = [
    { key: "movement", label: "Stock Movement Summary", desc: "Opening → Received → Issued → Closing per item" },
    { key: "consumption", label: "Consumption Report", desc: "Issue aggregation by category" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 className="w-7 h-7 text-indigo-600" /> Inventory Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Stock movement analysis and consumption reports</p>
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 border-b">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setData(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
          <div><label className="block text-sm font-medium mb-1">Store</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm"><option value="">Select</option>{stores.map(s => <option key={s.id} value={s.id}>{s.storeName}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1">From Date</label>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm" /></div>
          <div><label className="block text-sm font-medium mb-1">To Date</label>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-sm" /></div>
          <button onClick={handleGenerate} disabled={loading} className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md disabled:opacity-50">
            <Search className="w-4 h-4" /> {loading ? "Loading..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Stock Movement Report */}
      {activeTab === "movement" && data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-blue-950/30 dark:via-gray-800 dark:to-indigo-950/30 flex justify-between items-center">
            <div><h2 className="text-lg font-bold">Stock Movement Summary</h2><p className="text-sm text-gray-500">{data.fromDate} — {data.toDate} • {data.totalItems} items</p></div>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold"><Printer className="w-3.5 h-3.5" /> Print</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 uppercase tracking-wider">
                <tr><th className="px-3 py-2.5 text-left">Item</th><th className="px-3 py-2.5 text-right">Opening</th><th className="px-3 py-2.5 text-right">Received</th><th className="px-3 py-2.5 text-right">Returned</th><th className="px-3 py-2.5 text-right">Issued</th><th className="px-3 py-2.5 text-right">Transfer</th><th className="px-3 py-2.5 text-right">Adjusted</th><th className="px-3 py-2.5 text-right">Disposed</th><th className="px-3 py-2.5 text-right font-bold">Closing</th><th className="px-3 py-2.5 text-right">Value</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {(data.items || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                    <td className="px-3 py-2"><span className="font-medium">{item.itemName}</span><span className="block text-gray-400 font-mono">{item.itemCode}</span></td>
                    <td className="px-3 py-2 text-right font-mono">{Number(item.openingBalance || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono text-green-600">{Number(item.received || 0) > 0 ? `+${Number(item.received).toLocaleString()}` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-blue-600">{Number(item.returned || 0) > 0 ? `+${Number(item.returned).toLocaleString()}` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-red-600">{Number(item.issued || 0) > 0 ? `-${Number(item.issued).toLocaleString()}` : "—"}</td>
                    <td className={`px-3 py-2 text-right font-mono ${Number(item.transferNet || 0) > 0 ? "text-green-600" : Number(item.transferNet || 0) < 0 ? "text-red-600" : ""}`}>
                      {Number(item.transferNet || 0) !== 0 ? Number(item.transferNet).toLocaleString() : "—"}</td>
                    <td className={`px-3 py-2 text-right font-mono ${Number(item.adjustmentNet || 0) > 0 ? "text-green-600" : Number(item.adjustmentNet || 0) < 0 ? "text-red-600" : ""}`}>
                      {Number(item.adjustmentNet || 0) !== 0 ? Number(item.adjustmentNet).toLocaleString() : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono text-red-600">{Number(item.disposed || 0) > 0 ? `-${Number(item.disposed).toLocaleString()}` : "—"}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold">{Number(item.closingBalance || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 text-right font-mono">ETB {Number(item.closingValue || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Consumption Report */}
      {activeTab === "consumption" && data && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gradient-to-r from-orange-50 via-white to-amber-50 dark:from-orange-950/30 dark:via-gray-800 dark:to-amber-950/30 flex justify-between items-center">
            <div><h2 className="text-lg font-bold">Consumption Report</h2><p className="text-sm text-gray-500">{data.fromDate} — {data.toDate}</p></div>
            <div className="flex items-center gap-4">
              <div className="text-right"><span className="text-xs text-gray-500 block">Total Value</span><span className="text-lg font-bold font-mono text-red-600">ETB {Number(data.grandTotalValue || 0).toLocaleString()}</span></div>
              <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold"><Printer className="w-3.5 h-3.5" /> Print</button>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {(data.categories || []).map((cat, idx) => (
              <div key={idx} className="border rounded-xl overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-700/40">
                  <span className="font-semibold text-sm">{cat.categoryName}</span>
                  <div className="flex gap-6 text-xs">
                    <span>Qty: <strong className="font-mono">{Number(cat.totalQuantity || 0).toLocaleString()}</strong></span>
                    <span>Value: <strong className="font-mono text-red-600">ETB {Number(cat.totalValue || 0).toLocaleString()}</strong></span>
                  </div>
                </div>
              </div>
            ))}
            {(data.categories || []).length === 0 && <p className="text-center text-gray-400 py-8">No consumption data for this period</p>}
          </div>
        </div>
      )}
    </div>
  );
}
