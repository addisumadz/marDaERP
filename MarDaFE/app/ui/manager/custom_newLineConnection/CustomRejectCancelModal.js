"use client";
import { useState, useEffect } from "react";
import { X, AlertTriangle, Loader2, XCircle, Ban } from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";

export default function CustomRejectCancelModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  defaultActionType = "REJECT_SURVEY_UNFEASIBLE",
}) {
  const [actionType, setActionType] = useState(defaultActionType);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActionType(defaultActionType);
      setReason("");
    }
  }, [isOpen, defaultActionType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("እባክዎ የተሟላ ምክንያት ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      await customNewLineConnectionService.rejectOrCancelApplication(request.id, {
        actionType,
        reason: reason.trim(),
      });
      toast.success(
        actionType === "CANCEL_APPLICATION"
          ? "ማመልከቻው በተሳካ ሁኔታ ተሰርዟል"
          : "የዳሰሳ ጥናቱ ቴክኒካል መስፈርት ባለማሟላቱ ውድቅ ተደርጓል"
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "እርምጃውን ማከናወን አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const isReject = actionType === "REJECT_SURVEY_UNFEASIBLE";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div
          className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center text-white ${
            isReject
              ? "bg-gradient-to-r from-rose-600 to-red-700"
              : "bg-gradient-to-r from-gray-700 to-gray-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {isReject ? <XCircle className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
            <h2 className="text-base font-bold">
              {isReject ? "የቴክኒክ ዳሰሳ ጥናት ውድቅ ማድረጊያ" : "የማመልከቻ ስረዛ"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Brief */}
        <div className="bg-gray-50 dark:bg-gray-750 px-6 py-3 border-b border-gray-100 dark:border-gray-700 text-xs flex justify-between items-center text-gray-600 dark:text-gray-300">
          <span>
            ማመልከቻ: <strong className="font-mono">{request.applicationNumber}</strong>
          </span>
          <span>
            ደንበኛ: <strong>{request.customerFullName}</strong>
          </span>
          <span>
            ቅርንጫፍ: <strong>{request.branch?.branchDescription || request.branch?.name || "—"}</strong>
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Action Type Selection */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-2">
              የእርምጃ ዓይነት ይምረጡ
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  actionType === "REJECT_SURVEY_UNFEASIBLE"
                    ? "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-400/30"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="REJECT_SURVEY_UNFEASIBLE"
                  checked={actionType === "REJECT_SURVEY_UNFEASIBLE"}
                  onChange={() => setActionType("REJECT_SURVEY_UNFEASIBLE")}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="font-bold">ዳሰሳ ውድቅ (Feasibility Failed)</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    በአካባቢው የውሃ መስመር የለም / ርቀት ከ100 ሜትር በላይ ነው
                  </div>
                </div>
              </label>

              <label
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                  actionType === "CANCEL_APPLICATION"
                    ? "border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white ring-2 ring-gray-400/30"
                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                }`}
              >
                <input
                  type="radio"
                  name="actionType"
                  value="CANCEL_APPLICATION"
                  checked={actionType === "CANCEL_APPLICATION"}
                  onChange={() => setActionType("CANCEL_APPLICATION")}
                  className="mt-0.5 text-gray-600 focus:ring-gray-500"
                />
                <div>
                  <div className="font-bold">ማመልከቻ ሰርዝ (Cancel Application)</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                    በደንበኛ ጥያቄ ወይም በክፍያ አለመፈጸም ምክንያት
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              ይህ እርምጃ በማመልከቻው የስራ ሂደት ላይ እንደ ማጠቃለያ (Terminal Exception) የሚመዘገብ ሲሆን
              ምክንያቱ በሲስተሙ የስራ እንቅስቃሴ ታሪክ (Audit Log) ላይ ይቀመጣል።
            </span>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              የውድቅ ወይም የስረዛ ዝርዝር ምክንያት <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ለምሳሌ: በአካባቢው የውሃ ማስተላለፊያ ቱቦ የሌለ በመሆኑ እና የኔትወርክ ማስፋፊያ የሚጠይቅ በመሆኑ..."
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              ይቅር (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all disabled:opacity-50 ${
                isReject
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-gray-700 hover:bg-gray-800"
              }`}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isReject ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <Ban className="w-4 h-4" />
              )}
              {submitting ? "በማስመዝገብ ላይ..." : isReject ? "ዳሰሳውን ውድቅ አድርግ" : "ማመልከቻውን ሰርዝ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
