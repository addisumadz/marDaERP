"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import fncFiscalYearService from "../../../lib/fncFiscalYearService";
import { Calendar, Plus, Lock, Unlock, X, DollarSign, ArrowRight } from "lucide-react";

export default function FncFiscalYearsPage() {
  const router = useRouter();
  const [fiscalYears, setFiscalYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [closeModal, setCloseModal] = useState(null);
  const [carryModal, setCarryModal] = useState(null);
  const [targetFy, setTargetFy] = useState("");
  const [carrying, setCarrying] = useState(false);
  const [form, setForm] = useState({ fiscalYearName: "", startDate: "", endDate: "" });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try { setFiscalYears(await fncFiscalYearService.getAllFiscalYears()); }
    catch (e) { toast.error("Failed to load data"); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.fiscalYearName || !form.startDate || !form.endDate) { toast.error("All fields are required"); return; }
    try {
      await fncFiscalYearService.createFiscalYear(form);
      toast.success("Fiscal year created");
      setModalOpen(false);
      setForm({ fiscalYearName: "", startDate: "", endDate: "" });
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error creating fiscal year"); }
  };

  const handleClose = async (id) => {
    try {
      await fncFiscalYearService.closeFiscalYear(id);
      toast.success("Fiscal year closed successfully");
      setCloseModal(null);
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error closing fiscal year"); }
  };

  const handleReopen = async (id) => {
    if (!confirm("Reopen this fiscal year? This will allow new entries to be posted.")) return;
    try {
      await fncFiscalYearService.reopenFiscalYear(id);
      toast.success("Fiscal year reopened");
      loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error reopening fiscal year"); }
  };

  const handleCarryForward = async () => {
    if (!targetFy) { toast.error("Please select a target fiscal year"); return; }
    setCarrying(true);
    try {
      await fncFiscalYearService.carryForwardBalances(carryModal.id, Number(targetFy));
      toast.success("Balances carried forward successfully");
      setCarryModal(null);
      router.push(`/ui/manager/fncOpeningBalances?fyId=${targetFy}`);
    } catch (e) { toast.error(e.response?.data?.message || "Error carrying forward balances"); }
    setCarrying(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600" /> Fiscal Years
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Ethiopian fiscal year: Hamle 1 – Sene 30</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4" /> New Fiscal Year
        </button>
      </div>

      {/* Fiscal Years Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
        ) : fiscalYears.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center text-gray-500">No fiscal years configured. Create one to get started.</div>
        ) : (
          fiscalYears.map(fy => (
            <div key={fy.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 ${fy.isClosed ? "bg-gray-50 dark:bg-gray-750" : "bg-white dark:bg-gray-800"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fy.isClosed ? "bg-red-100 dark:bg-red-900/30" : "bg-green-100 dark:bg-green-900/30"}`}>
                    {fy.isClosed ? <Lock className="w-5 h-5 text-red-600" /> : <Calendar className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{fy.fiscalYearName}</h2>
                    <p className="text-sm text-gray-500">{fy.startDate} → {fy.endDate}</p>
                  </div>
                </div>
                <span className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium ${fy.isClosed ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"}`}>
                  {fy.isClosed ? "Closed" : "Open"}
                </span>
              </div>

              {/* Actions */}
              <div className="p-4 flex flex-wrap gap-3">
                {/* Opening Balances */}
                <button onClick={() => router.push(`/ui/manager/fncOpeningBalances?fyId=${fy.id}`)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium text-sm">Manage Opening Balances</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Close / Reopen Fiscal Year */}
                {!fy.isClosed ? (
                  <button onClick={() => setCloseModal(fy)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium text-sm">Close Fiscal Year</span>
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button onClick={() => handleReopen(fy.id)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                      <Unlock className="w-4 h-4" />
                      <span className="font-medium text-sm">Reopen Fiscal Year</span>
                    </button>
                    <button onClick={() => { setCarryModal(fy); setTargetFy(""); }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                      <span className="font-medium text-sm">Carry Forward Balances</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">New Fiscal Year</h2>
                    <p className="text-indigo-200 text-xs">Ethiopian calendar: Hamle 1 – Sene 30</p>
                  </div>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Fiscal Year Name <span className="text-red-500">*</span></label>
                <input type="text" value={form.fiscalYearName} onChange={(e) => setForm({ ...form, fiscalYearName: e.target.value })}
                  placeholder="e.g. 2017 ዓ.ም." className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">End Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleCreate} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all">
                <Plus className="w-4 h-4 inline mr-1.5" />Create Fiscal Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Confirmation Modal */}
      {closeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCloseModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header with warning gradient */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Close Fiscal Year</h2>
                    <p className="text-orange-100 text-xs">{closeModal.fiscalYearName}</p>
                  </div>
                </div>
                <button onClick={() => setCloseModal(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            {/* Body */}
            <div className="p-6">
              <div className="bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/40 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <div>
                    <p className="text-amber-900 dark:text-amber-200 font-semibold text-sm mb-2">Please review before proceeding:</p>
                    <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1.5">
                      <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> All draft entries must be posted or deleted first</li>
                      <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> No new entries can be posted after closing</li>
                      <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Opening balances become read-only</li>
                      <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> You can reopen the year later if needed</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">
                Are you sure you want to close <strong className="text-gray-900 dark:text-white">{closeModal.fiscalYearName}</strong> ({closeModal.startDate} → {closeModal.endDate})?
              </p>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setCloseModal(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={() => handleClose(closeModal.id)} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-xl hover:from-orange-600 hover:to-red-600 shadow-lg shadow-red-500/25 transition-all">
                <Lock className="w-4 h-4 inline mr-1.5" />Close Fiscal Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Carry Forward Modal */}
      {carryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setCarryModal(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Carry Forward Balances</h2>
                    <p className="text-purple-100 text-xs">From: {carryModal.fiscalYearName}</p>
                  </div>
                </div>
                <button onClick={() => setCarryModal(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This will roll forward the closing balances of all Asset, Liability, and Equity accounts from <strong>{carryModal.fiscalYearName}</strong> to the selected target year as opening balances. Revenue and Expense accounts will be closed into Retained Earnings.
              </p>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Target Open Fiscal Year <span className="text-red-500">*</span></label>
                <select value={targetFy} onChange={(e) => setTargetFy(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all">
                  <option value="">Select target open year...</option>
                  {fiscalYears.filter(f => !f.isClosed && f.id !== carryModal.id).map(f => (
                    <option key={f.id} value={f.id}>{f.fiscalYearName} ({f.startDate} to {f.endDate})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button onClick={() => setCarryModal(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
              <button onClick={handleCarryForward} disabled={carrying || !targetFy} className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50">
                {carrying ? "Processing..." : "Carry Forward"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
