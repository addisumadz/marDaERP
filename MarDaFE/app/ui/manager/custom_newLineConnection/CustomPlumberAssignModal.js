"use client";
import { useState, useEffect } from "react";
import { X, Wrench, Loader2, UserCheck, Printer } from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { generateSurveyChecklistPdf } from "./customNewLinePdf";

export default function CustomPlumberAssignModal({ isOpen, onClose, onSuccess, request, mode = "survey" }) {
  const [plumbers, setPlumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlumberId, setSelectedPlumberId] = useState("");
  const [notes, setNotes] = useState("");

  const isSurvey = mode === "survey";

  useEffect(() => {
    if (isOpen) {
      loadPlumbers();
      setSelectedPlumberId("");
      setNotes("");
    }
  }, [isOpen]);

  const loadPlumbers = async () => {
    setLoading(true);
    try {
      const data = await customNewLineConnectionService.getAvailablePlumbers(request?.branch?.id);
      setPlumbers(data || []);
      if (data && data.length > 0) {
        setSelectedPlumberId(String(data[0].id));
      }
    } catch (e) {
      console.error(e);
      toast.error("የባለሙያዎችን ዝርዝር ማግኘት አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPlumberId) {
      toast.error("እባክዎ ባለሙያ ይምረጡ");
      return;
    }

    setSubmitting(true);
    try {
      if (isSurvey) {
        await customNewLineConnectionService.assignSurveyPlumber(request.id, {
          plumberId: Number(selectedPlumberId),
          notes,
        });
        toast.success("ለዳሰሳ ጥናት ባለሙያ በተሳካ ሁኔታ ተመድቧል");

        // Automatically trigger survey checklist PDF print for the plumber
        try {
          const assignedPlumber = plumbers.find((p) => String(p.id) === String(selectedPlumberId));
          const enrichedReq = {
            ...request,
            surveyPlumber: assignedPlumber
              ? {
                  firstName: assignedPlumber.fullName?.split(" ")[0] || assignedPlumber.userName,
                  lastName: assignedPlumber.fullName?.split(" ").slice(1).join(" ") || "",
                  userName: assignedPlumber.userName,
                  phoneNumber: assignedPlumber.phoneNumber,
                }
              : request.surveyPlumber,
            surveyPlumberNotes: notes || request.surveyPlumberNotes,
          };
          await generateSurveyChecklistPdf([], enrichedReq);
        } catch (pdfErr) {
          console.warn("Survey checklist PDF auto-print warning:", pdfErr);
        }
      } else {
        await customNewLineConnectionService.assignInstallationPlumber(request.id, {
          plumberId: Number(selectedPlumberId),
          notes,
        });
        toast.success("ለመስመር ዝርጋታ ባለሙያ በተሳካ ሁኔታ ተመድቧል");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ባለሙያ መመደብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-amber-600 to-orange-600 text-white">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-200" />
            <h2 className="text-base font-bold">
              {isSurvey ? "የዳሰሳ ጥናት ባለሙያ (Plumber) መመደቢያ" : "የመስመር ዝርጋታ ባለሙያ መመደቢያ"}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Request Brief */}
        <div className="bg-amber-50/60 dark:bg-amber-950/20 px-6 py-3 border-b border-amber-100 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-300 flex justify-between items-center">
          <span>ማመልከቻ: <strong className="font-mono">{request.applicationNumber}</strong></span>
          <span>ደንበኛ: <strong>{request.customerFullName}</strong></span>
          <span>ቅርንጫፍ: <strong>{request.branch?.branchDescription || request.branch?.name || "ዋና ቅርንጫፍ"}</strong></span>
        </div>

        {/* Form */}
        <form onSubmit={handleAssign} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              የቅርንጫፉ ባለሙያ (Branch Plumber) ይምረጡ <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" /> የቅርንጫፉን ባለሙያዎች በመጫን ላይ...
              </div>
            ) : plumbers.length === 0 ? (
              <div className="text-xs text-red-500 py-2 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900">
                ለዚህ ቅርንጫፍ ({request.branch?.branchDescription || "የተመረጠው ቅርንጫፍ"}) የተመደበ የቧንቧ ባለሙያ (CUSTOM_PLUMBER) አልተገኘም። እባክዎ በተጠቃሚዎች አስተዳደር ላይ ለዚህ ቅርንጫፍ ባለሙያ መመደቡን ያረጋግጡ።
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {plumbers.map((p) => (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPlumberId === String(p.id)
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-400/30"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plumber"
                        value={p.id}
                        checked={selectedPlumberId === String(p.id)}
                        onChange={(e) => setSelectedPlumberId(e.target.value)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {p.fullName || p.userName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          {p.phoneNumber || p.roleName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-medium">
                      {p.roleName || "Plumber"}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              ተጨማሪ ማስታወሻ / መመሪያ ለባለሙያው
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ለምሳሌ: የደንበኛውን ቤት በአስቸኳይ በመጎብኘት አስፈላጊውን ርቀት ይለኩ..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ይቅር
            </button>
            <button
              type="submit"
              disabled={submitting || plumbers.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              {submitting ? "በመመደብ ላይ..." : "ባለሙያውን መድብ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
