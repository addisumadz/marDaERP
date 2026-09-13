"use client";
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  Wrench,
  User,
  Phone,
  MapPin,
  FileCheck,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";

export default function CustomInstallationCompletionModal({
  isOpen,
  onClose,
  onSuccess,
  request,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen && request) {
      setNotes("የውሃ መስመር ዝርጋታው በቴክኒክ ክፍል ተጠናቆ ፍተሻ ተደርጓል። (Physical piping connection completed and pressure tested.)");
    }
  }, [isOpen, request]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await customNewLineConnectionService.completeInstallation(request.id, {
        notes: notes.trim() || "Physical piping connection completed and verified by technical officer",
      });
      toast.success(
        `ለማመልከቻ #${request.applicationNumber} የመስመር ዝርጋታ መጠናቀቁ በተሳካ ሁኔታ ጸድቋል! ወደ ማግበሪያ ተላልፏል።`
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ዝርጋታውን ማጽደቅ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const plumber = request.installationPlumber || request.surveyPlumber;
  const plumberName = plumber
    ? `${plumber.firstName || ""} ${plumber.lastName || ""}`.trim()
    : "የተመደበ የቴክኒክ ባለሙያ";

  const rawKebele = request.kebele;
  const kebeleText = rawKebele
    ? typeof rawKebele === "object"
      ? (rawKebele.streetsName || rawKebele.name || "")
      : String(rawKebele)
    : "";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-emerald-150 dark:border-emerald-900/40 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* ─── Fancy Header with Ambient Gradient ─────────────────────────── */}
        <div className="relative overflow-hidden px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
          {/* Ambient Glow Circles */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner ring-4 ring-white/10">
                <CheckCircle2 className="w-7 h-7 text-emerald-100 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                    የመስመር ዝርጋታ ማጠናቀቂያ ማረጋገጫ
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-400/25 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    <Sparkles className="w-2.5 h-2.5" /> Step 6
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-mono mt-0.5">
                  ማመልከቻ #{request.applicationNumber}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={submitting}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Modal Form Body ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Customer & Plumber Info Card */}
          <div className="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-cyan-50/30 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-150 dark:border-emerald-900/40">
              <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                {request.customerFullName}
              </span>
              <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                {request.applicationNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-400">
              {request.customerPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-mono">{request.customerPhone}</span>
                </div>
              )}
              {kebeleText && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    {kebeleText.toLowerCase().includes("kebele") || kebeleText.includes("ቀበሌ")
                      ? kebeleText
                      : `ቀበሌ ${kebeleText}`}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 col-span-2 text-emerald-900 dark:text-emerald-200 font-medium">
                <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>ያከናወነው ባለሙያ: <strong className="font-bold">{plumberName}</strong></span>
              </div>
            </div>
          </div>

          {/* Verification Callout Box */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/80 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                የውሃ መስመር ዝርጋታው ሙሉ በሙሉ መጠናቀቁን ያረጋግጣሉ?
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                ይህ እርምጃ የመስክ ዝርጋታው መጠናቀቁን በማረጋገጥ ማመልከቻውን ወደ መጨረሻው <strong>ደረጃ 7፡ የደንበኛ ማግበሪያ (Final Customer Activation)</strong> ያሸጋግረዋል።
              </p>
            </div>
          </div>

          {/* Technician Completion Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                የቴክኒክ ማጠቃለያ ማስታወሻ (Technician Notes)
              </span>
              <span className="text-[10px] text-gray-400 font-normal">አማራጭ</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="የተከናወነውን ዝርጋታ እና የውሃ ግፊት ፍተሻ ማስታወሻ እዚህ ያስገቡ..."
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
            />
          </div>

          {/* ─── Footer Action Buttons ─────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              ይቅር (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {submitting ? "በማረጋገጥ ላይ..." : "አዎ፣ ዝርጋታው ተጠናቋል ✓"}
              {!submitting && <ArrowRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
