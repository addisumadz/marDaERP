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
  Gauge,
  Navigation,
} from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { DropdownService } from "../../../lib/dropdownService";

const dropdownService = new DropdownService();

export default function CustomInstallationCompletionModal({
  isOpen,
  onClose,
  onSuccess,
  request,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [meterSizes, setMeterSizes] = useState([]);
  const [isLoadingSizes, setIsLoadingSizes] = useState(false);

  const [form, setForm] = useState({
    meterNumber: "",
    meterSizeId: "",
    initialReading: 0.0,
    locationCoordination: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && request) {
      setForm({
        meterNumber: request.meterNumber || "",
        meterSizeId: request.meterSizeId ? String(request.meterSizeId) : "",
        initialReading: request.initialReading !== undefined && request.initialReading !== null ? request.initialReading : 0.0,
        locationCoordination: request.locationCoordination || "",
        notes: request.installationNotes || "የውሃ መስመር ዝርጋታው በቴክኒክ ክፍል ተጠናቆ ፍተሻ ተደርጓል። (Physical piping connection completed and pressure tested.)",
      });
      loadMeterSizes();
    }
  }, [isOpen, request]);

  const loadMeterSizes = async () => {
    setIsLoadingSizes(true);
    try {
      const sizes = await dropdownService.getMeterSizes();
      if (Array.isArray(sizes)) {
        setMeterSizes(sizes);
        setForm((prev) => {
          if (!prev.meterSizeId && sizes.length > 0) {
            // Find 0.5" default or first
            const halfInch = sizes.find(
              (s) =>
                String(s.name || s.sizeDescription || "").includes("0.5") ||
                String(s.name || s.sizeDescription || "").includes("1/2")
            );
            return {
              ...prev,
              meterSizeId: halfInch ? String(halfInch.id) : String(sizes[0].id),
            };
          }
          return prev;
        });
      }
    } catch (err) {
      console.warn("Failed to load meter sizes:", err);
    } finally {
      setIsLoadingSizes(false);
    }
  };

  const handleGetCoordinates = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
          setForm((prev) => ({ ...prev, locationCoordination: coords }));
          toast.success("GPS መገኛ ተገኝቷል: " + coords);
        },
        (err) => {
          toast.error("GPS መገኛ ማግኘት አልተቻለም: " + err.message);
        }
      );
    } else {
      toast.error("መሳሪያዎ ጂኦሎኬሽን አይደግፍም");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.meterNumber.trim()) {
      toast.error("እባክዎ የተተከለውን የውሃ ቆጣሪ ቁጥር (Meter Number) ያስገቡ!");
      return;
    }

    setSubmitting(true);
    try {
      const cleanStr = (val) => {
        if (typeof val !== "string") return null;
        const trimmed = val.trim();
        return trimmed === "" ? null : trimmed;
      };

      const cleanId = (val) => {
        if (!val || String(val).trim() === "") return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      };

      const payload = {
        meterNumber: cleanStr(form.meterNumber),
        meterSizeId: cleanId(form.meterSizeId),
        initialReading: Number(form.initialReading) || 0.0,
        locationCoordination: cleanStr(form.locationCoordination),
        notes: form.notes.trim() || "Physical piping connection completed and verified by technical officer",
      };

      await customNewLineConnectionService.completeInstallation(request.id, payload);
      toast.success(
        `ለማመልከቻ #${request.applicationNumber} የመስመር ዝርጋታ እና የቆጣሪ መረጃ (${payload.meterNumber}) በተሳካ ሁኔታ ተመዝግቧል!`
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
        {/* ─── Header with Ambient Gradient ─────────────────────────── */}
        <div className="relative overflow-hidden px-6 pt-6 pb-5 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
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
                    የመስመር ዝርጋታ ማጠናቀቂያ እና የቆጣሪ ምዝገባ
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-400/25 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    <Sparkles className="w-2.5 h-2.5" /> Step 6 - Technical
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
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
                <span>ያከናወነው የቴክኒክ ባለሙያ: <strong className="font-bold">{plumberName}</strong></span>
              </div>
            </div>
          </div>

          {/* Technical Department Meter Encoding Section */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-gray-200">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <span>የተተከለው ቆጣሪ መረጃ (Meter Technical Specs)</span>
              </div>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                በቴክኒክ የሚሞላ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Meter Number */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የውሃ ቆጣሪ ቁጥር (Water Meter Serial Number) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.meterNumber}
                    onChange={(e) => setForm({ ...form, meterNumber: e.target.value })}
                    placeholder="ለምሳሌ: WM-998823 ወይም 24080123"
                    className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none pl-8"
                  />
                  <Gauge className="w-4 h-4 text-emerald-500 absolute left-2.5 top-2.5" />
                </div>
              </div>

              {/* Meter Size */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የቆጣሪ መጠን (Meter Caliber/Size)
                </label>
                <select
                  value={form.meterSizeId}
                  onChange={(e) => setForm({ ...form, meterSizeId: e.target.value })}
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

              {/* Initial Reading */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የመነሻ ንባብ (Initial Index Reading)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={form.initialReading}
                  onChange={(e) => setForm({ ...form, initialReading: e.target.value })}
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* GPS Coordinates */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የተተከለበት ቦታ ጂኦሎኬሽን (Installation GPS Coordinates)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={form.locationCoordination}
                      onChange={(e) => setForm({ ...form, locationCoordination: e.target.value })}
                      placeholder="e.g. 9.032123, 38.748123"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono outline-none focus:ring-2 focus:ring-emerald-500 text-xs pl-8"
                    />
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGetCoordinates}
                    className="flex items-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-xl font-medium transition-colors shrink-0 text-xs"
                  >
                    <Navigation className="w-3.5 h-3.5" /> GPS ያግኙ
                  </button>
                </div>
              </div>
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
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="የተከናወነውን ዝርጋታ እና የውሃ ግፊት ፍተሻ ማስታወሻ እዚህ ያስገቡ..."
              className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
            />
          </div>

          {/* Verification Callout Box */}
          <div className="bg-white dark:bg-gray-800 p-3.5 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/80 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                የውሃ መስመር ዝርጋታው እና የቆጣሪ ተከላው መጠናቀቁን ያረጋግጣሉ?
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                ይህ እርምጃ ቆጣሪውን መዝግቦ ማመልከቻውን ወደ መጨረሻው <strong>ደረጃ 7፡ የደንበኛ ማግበሪያ (Customer Activation)</strong> ያሸጋግረዋል።
              </p>
            </div>
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
              {submitting ? "በማረጋገጥ ላይ..." : "አዎ፣ ዝርጋታውና ቆጣሪው ተመዝግቧል ✓"}
              {!submitting && <ArrowRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
