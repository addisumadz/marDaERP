"use client";
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  Gauge,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { DropdownService } from "../../../lib/dropdownService";

const dropdownService = new DropdownService();

export default function CustomMaintenanceCompletionModal({ isOpen, onClose, onSuccess, request }) {
  const [submitting, setSubmitting] = useState(false);
  const [meterSizes, setMeterSizes] = useState([]);
  const [isMeterChanged, setIsMeterChanged] = useState(false);

  const [form, setForm] = useState({
    previousMeterFinalReading: "",
    newMeterNumber: "",
    newMeterSizeId: "",
    newMeterInitialReading: "0.0",
    finalMeterReading: "",
    notes: "",
  });

  const checkHasMeterMaterial = (req) => {
    if (!req) return false;
    const typeText = String(req.maintenanceType?.typeNameAm || req.maintenanceType?.typeName || "").toLowerCase();
    if (typeText.includes("ቆጣሪ") || typeText.includes("meter")) return true;

    return (req.items || []).some((it) => {
      const name = String(it.itemName || it.itemNameAm || it.invItem?.name || "").toLowerCase();
      return (
        it.isWaterMeter ||
        it.invItem?.isWaterMeter ||
        it.invItem?.id === 2 ||
        name.includes("water meter") ||
        name.includes("ቆጣሪ") ||
        (name.includes("meter") && !name.includes("parameter"))
      );
    });
  };

  useEffect(() => {
    if (isOpen && request) {
      const hasMeter = checkHasMeterMaterial(request);
      setIsMeterChanged(hasMeter);
      setForm({
        previousMeterFinalReading: "",
        newMeterNumber: "",
        newMeterSizeId: "",
        newMeterInitialReading: "0.0",
        finalMeterReading: "",
        notes: "የጥገና ስራው ተጠናቆ ፍተሻ ተደርጓል። (Physical maintenance repair completed and verified.)",
      });
      loadMeterSizes();
    }
  }, [isOpen, request]);

  const loadMeterSizes = async () => {
    try {
      const sizes = await dropdownService.getMeterSizes();
      if (Array.isArray(sizes)) {
        setMeterSizes(sizes);
        const halfInch = sizes.find(
          (s) =>
            String(s.name || s.sizeDescription || "").includes("0.5") ||
            String(s.name || s.sizeDescription || "").includes("1/2")
        );
        if (halfInch) {
          setForm((prev) => ({ ...prev, newMeterSizeId: String(halfInch.id) }));
        }
      }
    } catch (err) {
      console.warn("Failed to load meter sizes:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isMeterChanged && !form.newMeterNumber.trim()) {
      toast.error("እባክዎ አዲሱን የተተከለ የውሃ ቆጣሪ ቁጥር (New Meter Number) ያስገቡ!");
      return;
    }

    if (!form.notes.trim()) {
      toast.error("እባክዎ የስራ ማጠቃለያ ማስታወሻ ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      const cleanStr = (val) => {
        if (typeof val !== "string") return null;
        const trimmed = val.trim();
        return trimmed === "" ? null : trimmed;
      };

      const cleanNum = (val) => {
        if (val === "" || val === null || val === undefined) return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
      };

      const payload = {
        notes: form.notes.trim(),
        isMeterChanged: Boolean(isMeterChanged),
        newMeterNumber: isMeterChanged ? cleanStr(form.newMeterNumber) : null,
        newMeterSizeId: isMeterChanged && form.newMeterSizeId ? Number(form.newMeterSizeId) : null,
        newMeterInitialReading: isMeterChanged ? (cleanNum(form.newMeterInitialReading) ?? 0.0) : null,
        previousMeterFinalReading: isMeterChanged ? cleanNum(form.previousMeterFinalReading) : null,
        finalMeterReading: !isMeterChanged ? cleanNum(form.finalMeterReading) : null,
      };

      await customMaintenanceService.completeMaintenance(request.id, payload);

      if (isMeterChanged) {
        toast.success(
          `የጥገና ስራው ተጠናቋል! አዲሱ ቆጣሪ #${payload.newMeterNumber} በደንበኛው ዋና መዝገብ ላይ ተተክቷል።`
        );
      } else {
        toast.success("የጥገና ስራው በተሳካ ሁኔታ መጠናቀቁ ተረጋግጧል!");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "የጥገና ማጠናቀቂያውን መመዝገብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const currentMeterNum = request.meterNumber || request.customer?.meterNumber || "ያልተመዘገበ";
  const plumber = request.maintenancePlumber || request.surveyPlumber;
  const plumberName = plumber
    ? `${plumber.firstName || ""} ${plumber.lastName || ""}`.trim()
    : "የተመደበ ባለሙያ";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-700 w-full max-w-xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-emerald-700 via-teal-700 to-green-700 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <CheckSquare className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                    የጥገና ስራ ማጠናቀቂያ እና ማረጋገጫ
                  </h2>
                  <span className="text-[10px] bg-emerald-400/25 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    <Sparkles className="w-2.5 h-2.5 inline mr-1" /> Step 7 - Completion
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-mono mt-0.5">
                  የጥገና ቁጥር #{request.requestNumber}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
          {/* Customer & Maintenance Summary Card */}
          <div className="bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-2xl p-3.5 space-y-2">
            <div className="flex justify-between items-center pb-1.5 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-800 dark:text-gray-200">{request.customerFullName}</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                ሂሳብ: {request.accountNumber}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 dark:text-gray-300">
              <div>
                <span className="text-gray-400 block">የጥገና ዓይነት:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {request.maintenanceType?.typeNameAm || "አጠቃላይ ጥገና"}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block">ያከናወነው ባለሙያ:</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">{plumberName}</span>
              </div>
              <div>
                <span className="text-gray-400 block">የነበረው ቆጣሪ (Current Meter):</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{currentMeterNum}</span>
              </div>
              <div>
                <span className="text-gray-400 block">ስልክ ቁጥር:</span>
                <span className="font-mono">{request.phoneNumber || "—"}</span>
              </div>
            </div>
          </div>

          {/* Meter Replacement Interactive Toggle */}
          <div className="p-3.5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-200 dark:border-blue-800/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                    የውሃ ቆጣሪ ቅየራ ተካሂዷል? (Meter Change / Replacement)
                  </h4>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    ጥገናው የቆጣሪ ቅየራን ካካተተ አዲሱ ቆጣሪ በደንበኛው መዝገብ ላይ በቀጥታ እንዲተካ ይህንን ያብሩ።
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isMeterChanged}
                  onChange={(e) => setIsMeterChanged(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* IF METER CHANGED -> New Meter Encoding Form */}
          {isMeterChanged ? (
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-xs">
                  <Gauge className="w-4 h-4 text-emerald-600" />
                  የአዲሱ ቆጣሪ መረጃ እና የቀድሞ ቆጣሪ ማጠቃለያ
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                  Customer Page Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Previous Meter Final Reading */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የቀድሞው ቆጣሪ ({currentMeterNum}) የመጨረሻ ንባብ
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.previousMeterFinalReading}
                    onChange={(e) => setForm({ ...form, previousMeterFinalReading: e.target.value })}
                    placeholder="ለምሳሌ: 452.1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">ከመነሳቱ በፊት የነበረው ንባብ</span>
                </div>

                {/* New Meter Number */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    አዲሱ የቆጣሪ ቁጥር (New Meter Serial Number) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required={isMeterChanged}
                      value={form.newMeterNumber}
                      onChange={(e) => setForm({ ...form, newMeterNumber: e.target.value })}
                      placeholder="WM-88231 ወይም 24080123"
                      className="w-full px-3 py-2 border border-emerald-400 dark:border-emerald-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none pl-8 text-xs"
                    />
                    <Gauge className="w-4 h-4 text-emerald-500 absolute left-2.5 top-2.5" />
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5">አዲሱ የተተከለው ቆጣሪ ቁጥር</span>
                </div>

                {/* New Meter Size */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የአዲሱ ቆጣሪ መጠን (Meter Caliber/Size)
                  </label>
                  <select
                    value={form.newMeterSizeId}
                    onChange={(e) => setForm({ ...form, newMeterSizeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  >
                    <option value="">መጠን ይምረጡ</option>
                    {meterSizes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name ? `${s.name}" (${s.name} ኢንች)` : s.sizeDescription || `${s.id}"`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* New Meter Starting Reading */}
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የአዲሱ ቆጣሪ መነሻ ንባብ (Initial Index Reading)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={form.newMeterInitialReading}
                    onChange={(e) => setForm({ ...form, newMeterInitialReading: e.target.value })}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">የአዲሱ ቆጣሪ መነሻ ንባብ (በተለምዶ 0.0)</span>
                </div>
              </div>

              {/* Callout Notice */}
              <div className="p-2.5 bg-emerald-100/60 dark:bg-emerald-900/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  ይህ ማረጋገጫ ሲጸድቅ በ<strong>ደንበኞች ዝርዝር (Customer Page)</strong> ላይ የደንበኛው ቆጣሪ ወደ <strong>{form.newMeterNumber || "[አዲስ ቆጣሪ]"}</strong> በራስሰር ይቀየራል፤ ለወርሃዊ ንባብም አዲሱ መነሻ ንባብ ስራ ላይ ይውላል።
                </span>
              </div>
            </div>
          ) : (
            /* IF NO METER CHANGE -> Simple Dial Reading Input */
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                የቆጣሪ ወቅታዊ ንባብ (Meter Test / Calibration Reading)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={form.finalMeterReading}
                onChange={(e) => setForm({ ...form, finalMeterReading: e.target.value })}
                placeholder="ለምሳሌ: 120.5 (አማራጭ)"
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
              />
              <span className="text-[10px] text-gray-400 block mt-0.5">
                ቆጣሪው ካልተነካ ወይም ካልተስተካከለ ይህን ሳጥን ባዶ መተው ይችላሉ።
              </span>
            </div>
          )}

          {/* Completion Notes */}
          <div className="space-y-1">
            <label className="block font-semibold text-gray-700 dark:text-gray-300">
              የስራ ማጠቃለያ ማስታወሻ (Maintenance Notes) <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="የተከናወነውን የጥገና ስራ ውጤት፣ የተፈተሸበትን ሁኔታ እና የባለሙያ ማረጋገጫ ያስገቡ..."
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
            >
              ይቅር (Cancel)
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? "በማረጋገጥ ላይ..." : isMeterChanged ? "አዲሱን ቆጣሪ መዝግብና ጥገናውን አጠናቅቅ ✓" : "ጥገናው መጠናቀቁን አረጋግጥ ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
