"use client";
import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Loader2,
  Gauge,
  MapPin,
  Navigation,
  User,
  Phone,
  Home,
  Tag,
  Hash,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "react-toastify";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { CustomerService } from "../../../lib/customerService";
import { DropdownService } from "../../../lib/dropdownService";

const customerService = new CustomerService();
const dropdownService = new DropdownService();

export default function CustomFinalActivationModal({ isOpen, onClose, onSuccess, request }) {
  const [submitting, setSubmitting] = useState(false);
  const [fetchingAccNum, setFetchingAccNum] = useState(false);
  const [meterSizes, setMeterSizes] = useState([]);
  const [readers, setReaders] = useState([]);

  const [form, setForm] = useState({
    accountNumber: "",
    meterNumber: "",
    meterSizeId: "",
    initialReading: 0.0,
    assignedReaderId: "",
    locationCoordination: "",
    billingTariffId: "",
    customerFullNameEng: "",
  });

  const extractKebeleId = () => {
    if (!request) return null;
    if (request.kebele && typeof request.kebele === "object") {
      return request.kebele.id;
    }
    if (request.kebeleId) return request.kebeleId;
    if (typeof request.kebele === "number") return request.kebele;
    return null;
  };

  const extractBranchId = () => {
    if (!request) return null;
    if (request.branch && typeof request.branch === "object") {
      return request.branch.id;
    }
    if (request.branchId) return request.branchId;
    if (typeof request.branch === "number") return request.branch;
    return null;
  };

  useEffect(() => {
    if (isOpen && request) {
      setForm({
        accountNumber: "",
        meterNumber: request.meterNumber || "",
        meterSizeId: request.meterSizeId ? String(request.meterSizeId) : "",
        initialReading:
          request.initialReading !== undefined && request.initialReading !== null
            ? request.initialReading
            : 0.0,
        assignedReaderId: request.assignedReader?.id ? String(request.assignedReader.id) : "",
        locationCoordination: request.locationCoordination || "",
        billingTariffId: "",
        customerFullNameEng: request.customerFullNameEng || "",
      });
      loadReferences();
      fetchNextAccountNumber();
    }
  }, [isOpen, request]);

  const fetchNextAccountNumber = async () => {
    const kId = extractKebeleId();
    if (!kId) return;
    setFetchingAccNum(true);
    try {
      const nextAcc = await customerService.getNextAccountNumber(kId);
      if (nextAcc) {
        setForm((prev) => ({
          ...prev,
          accountNumber: String(nextAcc),
        }));
      }
    } catch (err) {
      console.warn("Failed to fetch next account number:", err);
    } finally {
      setFetchingAccNum(false);
    }
  };

  const loadReferences = async () => {
    try {
      const bId = extractBranchId();
      const [sizesRes, readersRes] = await Promise.allSettled([
        dropdownService.getMeterSizes(),
        bId ? dropdownService.getReadersByBranch(bId) : dropdownService.getActiveMeterReaders(),
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

      // Pre-fill meter size and assigned reader
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
    if (!form.accountNumber.trim()) {
      toast.error("እባክዎ የሂሳብ ቁጥር (Account Number) ያስገቡ");
      return;
    }
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
        accountNumber: cleanStr(form.accountNumber),
        meterNumber: cleanStr(form.meterNumber),
        customerFullNameEng: cleanStr(form.customerFullNameEng),
        meterSizeId: cleanId(form.meterSizeId),
        initialReading: Number(form.initialReading) || 0.0,
        assignedReaderId: cleanId(form.assignedReaderId),
        locationCoordination: cleanStr(form.locationCoordination),
        billingTariffId: cleanId(form.billingTariffId),
      };

      await customNewLineConnectionService.finalizeActivation(request.id, payload);
      toast.success(
        `ደንበኛ ${request.customerFullName} በሂሳብ ቁጥር #${payload.accountNumber} በቋሚ የቢሊንግ ሲስተም ነቅቷል!`
      );
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ደንበኛውን ማንቃት አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  const rawKebele = request.kebele;
  const kebeleText = rawKebele
    ? typeof rawKebele === "object"
      ? rawKebele.streetsName || rawKebele.name || ""
      : String(rawKebele)
    : "";

  const rawKetena = request.ketena;
  const ketenaText = rawKetena
    ? typeof rawKetena === "object"
      ? rawKetena.name || ""
    : String(rawKetena)
    : "";

  const rawBranch = request.branch;
  const branchText = rawBranch
    ? typeof rawBranch === "object"
      ? rawBranch.name || rawBranch.branchDescription || ""
      : String(rawBranch)
    : "";

  const rawType = request.customerType;
  const customerTypeText = rawType
    ? typeof rawType === "object"
      ? rawType.name || ""
      : String(rawType)
    : "";

  const plumber = request.installationPlumber || request.surveyPlumber;
  const plumberName = plumber
    ? `${plumber.firstName || ""} ${plumber.lastName || ""}`.trim()
    : "የተመደበ የቴክኒክ ባለሙያ";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-150 dark:border-gray-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* ─── Hero Header ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden px-6 py-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-700 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                    የደንበኛ ማግበሪያ እና የሂሳብ ቁጥር አሰጣጥ
                  </h2>
                  <span className="text-[10px] bg-emerald-400/25 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-300/30">
                    <Sparkles className="w-2.5 h-2.5 inline mr-1" /> Step 7 - Customer Service
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

        {/* ─── Form Body ───────────────────────────────────────────── */}
        <form onSubmit={handleActivate} className="p-6 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
          {/* SECTION 1: Customer Personal & Household Profile (Comparison with customer page) */}
          <div className="bg-gray-50/70 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700/60 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-xs">
                <User className="w-4 h-4 text-emerald-600" />
                የደንበኛ የግል እና የመኖሪያ አድራሻ መረጃ (Customer Profile)
              </span>
              <span className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
                ደረጃ: ዝርጋታ ተጠናቋል ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
              <div>
                <span className="text-gray-500 block">የደንበኛ ሙሉ ስም (Amharic):</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{request.customerFullName}</span>
              </div>

              <div>
                <span className="text-gray-500 block">ስልክ ቁጥር (Phone):</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{request.phoneNumber || "—"}</span>
              </div>

              <div>
                <span className="text-gray-500 block">ቀበሌ እና ከተና (Kebele & Ketena):</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {kebeleText ? `ቀበሌ ${kebeleText}` : "—"} {ketenaText ? `/ ከተና ${ketenaText}` : ""}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">የቤት ቁጥር / ብሔራዊ መታወቂያ:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {request.houseNumber ? `ቤት ቁ. ${request.houseNumber}` : "—"}
                  {request.nationalIdNumber ? ` (መታወቂያ: ${request.nationalIdNumber})` : ""}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block">ቅርንጫፍ (Branch):</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{branchText || "—"}</span>
              </div>

              <div>
                <span className="text-gray-500 block">የደንበኛ ዓይነት (Customer Type):</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-300 font-bold">{customerTypeText || "መደበኛ"}</span>
              </div>

              {request.addressDescription && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500 block">ተጨማሪ አድራሻ / መለያ ቦታ (Landmark):</span>
                  <span className="text-gray-700 dark:text-gray-300 italic">{request.addressDescription}</span>
                </div>
              )}

              {/* English Name Input */}
              <div className="sm:col-span-2 pt-1 border-t border-gray-150 dark:border-gray-700">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የደንበኛ ሙሉ ስም በእንግሊዝኛ (Full Name in English)
                </label>
                <input
                  type="text"
                  value={form.customerFullNameEng}
                  onChange={(e) => setForm({ ...form, customerFullNameEng: e.target.value })}
                  placeholder="e.g. Abebe Kebede Wolde"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Technical Department Encoded Data (Step 6 Verification) */}
          <div className="bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-150 dark:border-emerald-900/40">
              <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-xs">
                <Gauge className="w-4 h-4 text-emerald-600" />
                በቴክኒክ ክፍል የተሞላ የቆጣሪ መረጃ (Technical Department Installation Record)
              </span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded">
                ደረጃ 6 ተከናውኗል ✓
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Meter Serial Number */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የውሃ ቆጣሪ ቁጥር (Meter Number) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.meterNumber}
                    onChange={(e) => setForm({ ...form, meterNumber: e.target.value })}
                    placeholder="WM-998823"
                    className="w-full px-3 py-2 border border-emerald-300 dark:border-emerald-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono font-bold focus:ring-2 focus:ring-emerald-500 outline-none pl-8 text-xs"
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
                  የመነሻ ንባብ (Initial Reading)
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

              {/* Installed By Plumber info */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ያከናወነው የቴክኒክ ባለሙያ (Installed By)
                </label>
                <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700/60 rounded-xl text-gray-700 dark:text-gray-300 font-medium">
                  {plumberName}
                </div>
              </div>

              {/* GPS Coordinates */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የቦታ አቀማመጥ ጂኦሎኬሽን (GPS Coordinates)
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

              {request.installationNotes && (
                <div className="sm:col-span-2 p-2.5 bg-emerald-100/40 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-gray-700 dark:text-gray-300">
                  <strong className="text-emerald-800 dark:text-emerald-300">የቴክኒክ ማጠቃለያ ማስታወሻ: </strong>
                  {request.installationNotes}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: Permanent Billing Setup & Account Number (Kebele Sequenced) */}
          <div className="bg-blue-50/40 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-blue-150 dark:border-blue-900/40">
              <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 text-xs">
                <Building2 className="w-4 h-4 text-blue-600" />
                የቋሚ ቢሊንግ ማግበሪያ እና የሂሳብ ቁጥር (Permanent Billing Configuration)
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
                በቀበሌ ተከታታይ ሂሳብ ቁጥር
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Number with Auto-generate helper and refresh button */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-blue-600" />
                    የደንበኛ ሂሳብ ቁጥር (Customer Account Number) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={fetchNextAccountNumber}
                    disabled={fetchingAccNum}
                    className="text-[11px] text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1 font-medium transition-colors"
                    title="ተከታታይ ሂሳብ ቁጥር በድጋሚ አስላ"
                  >
                    <RefreshCw className={`w-3 h-3 ${fetchingAccNum ? "animate-spin" : ""}`} />
                    በድጋሚ ፈልግ (Refresh)
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.accountNumber}
                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                    placeholder="ለምሳሌ: 10452"
                    className="w-full px-3 py-2 border-2 border-blue-400 dark:border-blue-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white font-mono font-extrabold text-sm text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500 outline-none pl-8"
                  />
                  <Hash className="w-4 h-4 text-blue-400 absolute left-2.5 top-3" />
                </div>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                  💡 ይህ ሂሳብ ቁጥር በቀበሌው {kebeleText ? `(${kebeleText})` : ""} የነባር ደንበኞች ከፍተኛ ቁጥር መሰረት በቅደም ተከተል ተሰልቷል።
                </p>
              </div>

              {/* Assigned Meter Reader */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የተመደበ ቆጣሪ አንባቢ (Assigned Meter Reader)
                </label>
                <div className="relative">
                  <select
                    value={form.assignedReaderId}
                    onChange={(e) => setForm({ ...form, assignedReaderId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  >
                    <option value="">ቆጣሪ አንባቢ ይምረጡ</option>
                    {readers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name || (r.firstName ? `${r.firstName} ${r.lastName || ""}` : r.userName)}{" "}
                        {r.userName && !r.name ? `(${r.userName})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Final Enrollment Notice Callout */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                ደንበኛውን ወደ ቋሚ የቢሊንግ ሲስተም (Customer Management) ማግበር
              </h4>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                ይህንን ማግበሪያ ሲያጠናቅቁ ደንበኛው በቋሚ የሸማቾች ዝርዝር (Consumer List) ውስጥ እንደ <strong>Active</strong> ደንበኛ ወዲያውኑ ይመዘገባል፤ ወርሃዊ ንባብ ሊነበብበት ይችላል።
              </p>
            </div>
          </div>

          {/* ─── Footer Buttons ──────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
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
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 rounded-xl shadow-md shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {submitting ? "በማንቃት ላይ..." : "ደንበኛውን አንቃና ጨርስ ✓"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
