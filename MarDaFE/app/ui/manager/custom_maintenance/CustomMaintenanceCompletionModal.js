"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Gauge, CheckSquare } from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";

export default function CustomMaintenanceCompletionModal({ isOpen, onClose, onSuccess, request }) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [finalMeterReading, setFinalMeterReading] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setFinalMeterReading("");
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customMaintenanceService.completeMaintenance(request.id, {
        notes: notes.trim() || "Physical maintenance work completed successfully.",
        finalMeterReading: finalMeterReading !== "" ? parseFloat(finalMeterReading) : null,
      });

      toast.success("የጥገና ስራው በተሳካ ሁኔታ ተጠናቋል!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "የጥገና ማጠናቀቂያውን መመዝገብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700 text-white">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-200" />
            <h2 className="text-lg font-bold">የጥገና ስራ ማጠናቀቂያ እና ማረጋገጫ</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Customer & Plumber Summary */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3.5 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">የጥገና ቁጥር:</span>
              <span className="font-mono font-bold text-gray-900 dark:text-white">{request.requestNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">የደንበኛ ስም:</span>
              <span className="font-bold text-gray-900 dark:text-white">{request.customerFullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">የጥገና ዓይነት:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {request.maintenanceType?.typeNameAm || "አጠቃላይ ጥገና"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-800 dark:text-emerald-300 font-semibold">የተመደበ ባለሙያ:</span>
              <span className="font-bold text-emerald-900 dark:text-emerald-200">
                {request.maintenancePlumber?.firstName || request.surveyPlumber?.firstName || "ባለሙያ"}{" "}
                {request.maintenancePlumber?.lastName || request.surveyPlumber?.lastName || ""}
              </span>
            </div>
          </div>

          {/* Final Meter Reading */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              የቆጣሪ ንባብ (አዲስ ቆጣሪ ከተቀየረ ወይም ከተስተካከለ)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={finalMeterReading}
              onChange={(e) => setFinalMeterReading(e.target.value)}
              placeholder="ለምሳሌ: 0.0 ወይም ወቅታዊ ንባብ"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
            <span className="text-[11px] text-gray-400 block mt-0.5">
              ቆጣሪው ካልተቀየረ ወይም ካልተነካ ይህን ሳጥን ባዶ መተው ይችላሉ።
            </span>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              የስራ ማጠቃለያ ማስታወሻ (Maintenance Completion Notes) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="የተከናወነውን የጥገና ስራ ውጤት፣ የተፈተሸበትን ሁኔታ እና የባለሙያ ማረጋገጫ ያስገቡ..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              ሰርዝ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              ጥገናው መጠናቀቁን አረጋግጥ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
