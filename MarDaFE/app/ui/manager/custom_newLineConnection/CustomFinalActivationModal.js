"use client";
import { useState, useEffect } from "react";
import { X, CheckCircle2, Loader2, Gauge, MapPin, Navigation } from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { DropdownService } from "../../../lib/dropdownService";

const dropdownService = new DropdownService();

export default function CustomFinalActivationModal({ isOpen, onClose, onSuccess, request }) {
  const [submitting, setSubmitting] = useState(false);
  const [meterSizes, setMeterSizes] = useState([]);
  const [readers, setReaders] = useState([]);
  const [tariffs, setTariffs] = useState([]);

  const [form, setForm] = useState({
    meterNumber: "",
    meterSizeId: "",
    initialReading: 0.0,
    assignedReaderId: "",
    locationCoordination: "",
    billingTariffId: "",
    customerFullNameEng: "",
  });

  useEffect(() => {
    if (isOpen && request) {
      setForm({
        meterNumber: request.meterNumber || "",
        meterSizeId: request.meterSizeId ? String(request.meterSizeId) : "",
        initialReading: request.initialReading || 0.0,
        assignedReaderId: request.assignedReader?.id ? String(request.assignedReader.id) : "",
        locationCoordination: request.locationCoordination || "",
        billingTariffId: "",
        customerFullNameEng: request.customerFullNameEng || "",
      });
      loadReferences();
    }
  }, [isOpen, request]);

  const loadReferences = async () => {
    try {
      const branchId = request.branch?.id;
      const [sizesRes, readersRes] = await Promise.allSettled([
        dropdownService.getMeterSizes(),
        branchId ? dropdownService.getReadersByBranch(branchId) : dropdownService.getActiveMeterReaders(),
      ]);

      let loadedSizes = [];
      if (sizesRes.status === "fulfilled" && Array.isArray(sizesRes.value)) {
        loadedSizes = sizesRes.value;
        setMeterSizes(loadedSizes);
      }

      let loadedReaders = [];
      if (readersRes.status === "fulfilled" && Array.isArray(readersRes.value)) {
        loadedReaders = readersRes.value;
      }

      if (loadedReaders.length === 0) {
        try {
          const fallbackReaders = await dropdownService.getActiveMeterReaders();
          if (Array.isArray(fallbackReaders)) {
            loadedReaders = fallbackReaders;
          }
        } catch (err) {
          console.warn("Fallback readers error:", err);
        }
      }
      setReaders(loadedReaders);

      // Pre-fill meter size (default to 0.5" or ID 1) and assigned reader
      setForm((prev) => {
        let sizeId = prev.meterSizeId;
        if (!sizeId && loadedSizes.length > 0) {
          const halfInch = loadedSizes.find(
            (s) =>
              String(s.name || s.sizeDescription || "").includes("0.5") ||
              String(s.name || s.sizeDescription || "").includes("1/2")
          );
          sizeId = halfInch ? String(halfInch.id) : String(loadedSizes[0].id);
        }

        let readerId = prev.assignedReaderId;
        if (!readerId && loadedReaders.length > 0) {
          readerId = request.assignedReader?.id ? String(request.assignedReader.id) : String(loadedReaders[0].id);
        }

        return {
          ...prev,
          meterSizeId: sizeId || prev.meterSizeId,
          assignedReaderId: readerId || prev.assignedReaderId,
        };
      });
    } catch (e) {
      console.warn("Reference load fallback:", e);
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

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!form.meterNumber.trim()) {
      toast.error("እባክዎ የቆጣሪ ቁጥር (Meter Number) ያስገቡ");
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
        customerFullNameEng: cleanStr(form.customerFullNameEng),
        meterSizeId: cleanId(form.meterSizeId),
        initialReading: Number(form.initialReading) || 0.0,
        assignedReaderId: cleanId(form.assignedReaderId),
        locationCoordination: cleanStr(form.locationCoordination),
        billingTariffId: cleanId(form.billingTariffId),
      };

      await customNewLineConnectionService.finalizeActivation(request.id, payload);
      toast.success("ደንበኛው በቋሚ የቢሊንግ ሲስተም ላይ ነቅቷል! ወርሃዊ ንባብ ሊነበብበት ይችላል");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ደንበኛውን ማንቃት አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-green-700 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <h2 className="text-base font-bold">የመጨረሻ ምዝገባ እና ደንበኛውን ማግበሪያ (Final Activation)</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info summary */}
        <div className="bg-emerald-50 dark:bg-emerald-950/30 px-6 py-3 border-b border-emerald-100 dark:border-emerald-900/30 text-xs flex justify-between items-center">
          <span>ማመልከቻ: <strong className="font-mono">{request.applicationNumber}</strong></span>
          <span>
            ደንበኛ: <strong>{request.customerFullName}</strong>
            {request.customerFullNameEng && (
              <span className="text-gray-500 font-normal ml-1">({request.customerFullNameEng})</span>
            )}
          </span>
          <span className="text-emerald-700 dark:text-emerald-300 font-semibold">ዝርጋታ ተጠናቋል ✓</span>
        </div>

        {/* Form */}
        <form onSubmit={handleActivate} className="p-6 space-y-4 text-xs">
          <p className="text-gray-500">
            የውሃ መስመር ዝርጋታው በተሳካ ሁኔታ ተጠናቋል። ደንበኛውን እንደ መደበኛ የቢል ደንበኛ ለማንቃት የቆጣሪውን መረጃ ይሙሉ:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የደንበኛ ሙሉ ስም (እንግሊዝኛ / Full Name English)
              </label>
              <input
                type="text"
                value={form.customerFullNameEng}
                onChange={(e) => setForm({ ...form, customerFullNameEng: e.target.value })}
                placeholder="e.g. Amlaku Tekola Ahmed"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የውሃ ቆጣሪ ቁጥር (Water Meter Number) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.meterNumber}
                  onChange={(e) => setForm({ ...form, meterNumber: e.target.value })}
                  placeholder="ለምሳሌ: WM-998823"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none pl-8"
                />
                <Gauge className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የመነሻ ንባብ (Initial Reading)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.initialReading}
                onChange={(e) => setForm({ ...form, initialReading: e.target.value })}
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የቆጣሪ መጠን (Meter Size)
              </label>
              <select
                value={form.meterSizeId}
                onChange={(e) => setForm({ ...form, meterSizeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="">መጠን ይምረጡ</option>
                {meterSizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name ? `${s.name}" (${s.name} ኢንች)` : s.sizeDescription || `${s.id}"`}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የተመደበ ቆጣሪ አንባቢ (Assigned Meter Reader)
              </label>
              <select
                value={form.assignedReaderId}
                onChange={(e) => setForm({ ...form, assignedReaderId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none"
              >
                <option value="">ቆጣሪ አንባቢ ይምረጡ</option>
                {readers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name || (r.firstName ? `${r.firstName} ${r.lastName || ""}` : r.userName)} {r.userName && !r.name ? `(${r.userName})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {tariffs.length > 0 && (
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የታሪፍ ዓይነት (Billing Tariff)
                </label>
                <select
                  value={form.billingTariffId}
                  onChange={(e) => setForm({ ...form, billingTariffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white outline-none"
                >
                  <option value="">ታሪፍ ይምረጡ</option>
                  {tariffs.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tariffName || t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የጂኦሎኬሽን መጋጠሚያ (GPS Coordinates: Lat, Long)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={form.locationCoordination}
                    onChange={(e) => setForm({ ...form, locationCoordination: e.target.value })}
                    placeholder="ለምሳሌ: 9.032123, 38.748123"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white font-mono outline-none pl-8"
                  />
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                </div>
                <button
                  type="button"
                  onClick={handleGetCoordinates}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-lg font-medium transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" /> GPS ያግኙ
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              ይቅር
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {submitting ? "በማንቃት ላይ..." : "ደንበኛውን አንቃና ጨርስ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
