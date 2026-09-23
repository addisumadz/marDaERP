"use client";
import { useState, useEffect } from "react";
import { X, UserPlus, Loader2, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import customNewLineConnectionService from "../../../lib/custom_newLineConnectionService";
import { DropdownService } from "../../../lib/dropdownService";
import { AddressStreetsService } from "../../../lib/addressStreetsService";
import { AddressKetenaService } from "../../../lib/addressKetenaService";
import { UserAccountService } from "../../../lib/userAccountService";
import { transliterateNamePhonetic, handleAmharicInputChange } from "../../../helpers/amharicInput";

const dropdownService = new DropdownService();
const streetsService = new AddressStreetsService();
const ketenaService = new AddressKetenaService();
const userService = new UserAccountService();

export default function CustomApplicationModal({
  isOpen,
  onClose,
  onSuccess,
  userBranchId = null,
  userBranchName = "",
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isKetenasLoading, setIsKetenasLoading] = useState(false);
  const [resolvedBranchId, setResolvedBranchId] = useState(userBranchId);
  const [resolvedBranchName, setResolvedBranchName] = useState(userBranchName);

  // Amharic phonetic keyboard and phone digit state
  const [isAmharicKeyboardOn, setIsAmharicKeyboardOn] = useState(true);
  const [phoneDigits, setPhoneDigits] = useState("");

  // Dropdown reference lists
  const [kebeles, setKebeles] = useState([]);
  const [ketenas, setKetenas] = useState([]);
  const [customerTypes, setCustomerTypes] = useState([]);
  const [branches, setBranches] = useState([]);

  // Form State
  const [form, setForm] = useState({
    applicantName: "",
    customerFullName: "",
    customerFullNameEng: "",
    phoneNumber: "+251",
    nationalIdNumber: "",
    houseNumber: "",
    kebeleId: "",
    ketenaId: "",
    customerTypeId: "",
    branchId: "",
    addressDescription: "",
  });

  useEffect(() => {
    if (isOpen) {
      loadDropdowns();
      setKetenas([]);
      setPhoneDigits("");
      setIsAmharicKeyboardOn(true);

      const initialBranchId = userBranchId ? String(userBranchId) : "";
      setResolvedBranchId(userBranchId);
      setResolvedBranchName(userBranchName);

      setForm({
        applicantName: "",
        customerFullName: "",
        customerFullNameEng: "",
        phoneNumber: "",
        nationalIdNumber: "",
        houseNumber: "",
        kebeleId: "",
        ketenaId: "",
        customerTypeId: "",
        branchId: initialBranchId,
        addressDescription: "",
      });

      // Auto-detect branch from session / user profile if not passed via props
      if (!userBranchId) {
        const uid = session?.user?.id || session?.id;
        if (uid) {
          userService.getUserById(uid).then((u) => {
            if (u?.branchId) {
              setResolvedBranchId(u.branchId);
              setResolvedBranchName(u.branchName || "");
              setForm((prev) => ({ ...prev, branchId: String(u.branchId) }));
            }
          }).catch((err) => console.warn("Could not fetch user branch:", err));
        }
      }
    }
  }, [isOpen, userBranchId, userBranchName, session]);

  const loadDropdowns = async () => {
    setLoading(true);
    try {
      const [streetsRes, cRes, bRes] = await Promise.allSettled([
        streetsService.getAllAddressStreets(),
        dropdownService.getCustomerTypes(),
        dropdownService.getBranches(),
      ]);

      let loadedKebeles = [];
      if (streetsRes.status === "fulfilled" && Array.isArray(streetsRes.value)) {
        loadedKebeles = streetsRes.value.filter(
          (k) => (k.status ? k.status === "active" : true) && (k.deleted ? k.deleted === "active" : true)
        );
        if (loadedKebeles.length === 0) loadedKebeles = streetsRes.value;
      }
      if (loadedKebeles.length === 0) {
        const fallbackKebeles = await dropdownService.getKebeles();
        loadedKebeles = fallbackKebeles || [];
      }
      setKebeles(loadedKebeles);

      if (cRes.status === "fulfilled") setCustomerTypes(cRes.value || []);
      if (bRes.status === "fulfilled") setBranches(bRes.value || []);
    } catch (e) {
      console.warn("Dropdown load fallback:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleKebeleChange = async (selectedKebeleId) => {
    setForm((prev) => ({ ...prev, kebeleId: selectedKebeleId, ketenaId: "" }));
    if (!selectedKebeleId) {
      setKetenas([]);
      return;
    }

    setIsKetenasLoading(true);
    try {
      let list = [];
      try {
        list = await ketenaService.getKetenasByStreetsId(Number(selectedKebeleId));
      } catch (err) {
        console.warn("ketenaService.getKetenasByStreetsId failed, falling back to dropdownService:", err);
      }
      if (!list || list.length === 0) {
        list = await dropdownService.getKetenasByKebele(Number(selectedKebeleId));
      }
      const activeKetenas = (list || []).filter((kt) =>
        kt.deleted ? kt.deleted === "active" : true
      );
      setKetenas(activeKetenas.length > 0 ? activeKetenas : (list || []));
    } catch (e) {
      console.error("Error loading ketenas:", e);
      toast.error("ቀጠናዎችን መጫን አልተቻለም");
      setKetenas([]);
    } finally {
      setIsKetenasLoading(false);
    }
  };

  const formatKebeleLabel = (k) => {
    const name = k.streetsName || k.name || k.kebeleName || k.streetName;
    if (!name) return `ቀበሌ ${k.id}`;
    const nameStr = String(name).trim();
    if (nameStr.toLowerCase().includes("kebele") || nameStr.includes("ቀበሌ")) {
      return nameStr;
    }
    return `ቀበሌ ${nameStr}`;
  };

  const formatKetenaLabel = (kt) => {
    const name = kt.ketenaName || kt.name;
    if (!name) return `ቀጠና ${kt.id}`;
    const nameStr = String(name).trim();
    if (nameStr.toLowerCase().includes("ketena") || nameStr.includes("ቀጠና")) {
      return nameStr;
    }
    return `ቀጠና ${nameStr}`;
  };

  const handlePhoneChange = (e) => {
    let raw = e.target.value || "";
    // Keep only numeric digits
    let digits = raw.replace(/\D/g, "");
    // If user pasted with 251 or 0 prefix, strip it
    if (digits.startsWith("251")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("0")) {
      digits = digits.slice(1);
    }
    // Restrict strictly to 9 numbers
    digits = digits.slice(0, 9);
    setPhoneDigits(digits);
    setForm((prev) => ({
      ...prev,
      phoneNumber: digits ? `+251${digits}` : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerFullName.trim()) {
      toast.error("የደንበኛ ሙሉ ስም ማስገባት ግዴታ ነው");
      return;
    }
    if (!phoneDigits || phoneDigits.length !== 9) {
      toast.error("እባክዎ ከ +251 ቀጥሎ ያሉትን 9 አሃዞች በትክክል ያስገቡ (ለምሳሌ፡ 912345678)");
      return;
    }
    if (!phoneDigits.startsWith("9") && !phoneDigits.startsWith("7")) {
      toast.warning("የሞባይል ስልክ ቁጥር በ 9 ወይም 7 መጀመር አለበት");
    }

    setSubmitting(true);
    try {
      // Sanitize: convert empty/whitespace-only strings to null so the DB stores NULL
      // instead of empty strings for optional fields (matching CustomerFormModal.js pattern)
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

      const fullPhoneNumber = `+251${phoneDigits}`;

      const payload = {
        applicantName: cleanStr(form.applicantName) || cleanStr(form.customerFullName),
        customerFullName: cleanStr(form.customerFullName),
        customerFullNameEng: cleanStr(form.customerFullNameEng),
        phoneNumber: cleanStr(fullPhoneNumber),
        nationalIdNumber: cleanStr(form.nationalIdNumber),
        houseNumber: cleanStr(form.houseNumber),
        kebeleId: cleanId(form.kebeleId),
        ketenaId: cleanId(form.ketenaId),
        customerTypeId: cleanId(form.customerTypeId),
        branchId: cleanId(form.branchId) || cleanId(resolvedBranchId),
        addressDescription: cleanStr(form.addressDescription),
      };

      const res = await customNewLineConnectionService.createApplication(payload);
      toast.success(`አዲስ የመስመር ጥያቄ ተመዝግቧል! የማመልከቻ ቁጥር: ${res.applicationNumber}`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ጥያቄውን መመዝገብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-200" />
            <h2 className="text-lg font-bold">አዲስ የውሃ መስመር ዝርጋታ ማመልከቻ መመዝገቢያ</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  የደንበኛ ሙሉ ስም (አማርኛ) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAmharicKeyboardOn((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
                    isAmharicKeyboardOn
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
                      : "bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                  title="በእንግሊዝኛ ፊደል ሲጽፉ በራስ-ሰር ወደ አማርኛ ይቀይራል"
                >
                  <span>{isAmharicKeyboardOn ? "⌨️ አማርኛ (በራስ-ሰር)" : "🔤 English (Latin)"}</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={form.customerFullName}
                onChange={(e) => {
                  handleAmharicInputChange(
                    e,
                    (val) => setForm((prev) => ({ ...prev, customerFullName: val })),
                    isAmharicKeyboardOn
                  );
                }}
                onBlur={(e) => {
                  if (isAmharicKeyboardOn && e.target.value) {
                    setForm((prev) => ({
                      ...prev,
                      customerFullName: transliterateNamePhonetic(e.target.value),
                    }));
                  }
                }}
                placeholder="ለምሳሌ: አምላኩ ተካላ አህመድ"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                {isAmharicKeyboardOn
                  ? "💡 በዊንዶውስ 10 የአማርኛ ኪቦርድ ህግ (ለምሳሌ፡ alemu -> አለሙ፣ kebede -> ከበደ)"
                  : "የቀጥታ ፊደላት አጻጻፍ በርቷል"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Customer Full Name (English)
                </label>
                {form.customerFullNameEng && (
                  <button
                    type="button"
                    onClick={() => {
                      const amh = transliterateNamePhonetic(form.customerFullNameEng);
                      if (amh) setForm((prev) => ({ ...prev, customerFullName: amh }));
                    }}
                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    title="ይህን ስም ወደ አማርኛ ስም መሙያ ይገልብጡ"
                  >
                    🔄 ወደ አማርኛ ገልብጥ
                  </button>
                )}
              </div>
              <input
                type="text"
                value={form.customerFullNameEng}
                onChange={(e) => setForm({ ...form, customerFullNameEng: e.target.value })}
                placeholder="e.g. Amlaku Tekola Ahmed"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የአገልግሎት ጠያቂው ስም (የተወካይ ስም)
              </label>
              <input
                type="text"
                value={form.applicantName}
                onChange={(e) => {
                  handleAmharicInputChange(
                    e,
                    (val) => setForm((prev) => ({ ...prev, applicantName: val })),
                    isAmharicKeyboardOn
                  );
                }}
                onBlur={(e) => {
                  if (isAmharicKeyboardOn && e.target.value) {
                    setForm((prev) => ({
                      ...prev,
                      applicantName: transliterateNamePhonetic(e.target.value),
                    }));
                  }
                }}
                placeholder="ጠያቂው የተለየ ከሆነ ያስገቡ"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span>ስልክ ቁጥር (Phone Number) <span className="text-red-500">*</span></span>
                <span className="text-[10px] font-mono text-gray-400">
                  {phoneDigits.length}/9 ቁጥሮች
                </span>
              </label>
              <div className="flex rounded-lg shadow-sm border border-gray-300 dark:border-gray-600 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 bg-gray-50 dark:bg-gray-700/50">
                <span className="inline-flex items-center px-3 bg-gray-200/80 dark:bg-gray-600/80 border-r border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-mono text-xs font-bold select-none">
                  +251
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  required
                  maxLength={9}
                  value={phoneDigits}
                  onChange={handlePhoneChange}
                  placeholder="9XXXXXXXX"
                  className="w-full px-3 py-2 text-sm font-mono tracking-wider bg-transparent dark:text-white outline-none"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                ከ +251 ቀጥሎ ያሉትን 9 አሃዞች ብቻ ያስገቡ (በ 9 ወይም 7 የሚጀምር)
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የመታወቂያ ቁጥር
              </label>
              <input
                type="text"
                value={form.nationalIdNumber}
                onChange={(e) => setForm({ ...form, nationalIdNumber: e.target.value })}
                placeholder="የቀበሌ ወይም የብሔራዊ መታወቂያ"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የቤት ቁጥር
              </label>
              <input
                type="text"
                value={form.houseNumber}
                onChange={(e) => setForm({ ...form, houseNumber: e.target.value })}
                placeholder="የቤት ቁጥር"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                ቀበሌ (Kebele / Street)
              </label>
              <select
                value={form.kebeleId}
                onChange={(e) => handleKebeleChange(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">ቀበሌ ይምረጡ</option>
                {kebeles.map((k) => (
                  <option key={k.id} value={k.id}>
                    {formatKebeleLabel(k)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span>ቀጠና / ጦቢያ (Ketena)</span>
                {isKetenasLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />}
              </label>
              <select
                value={form.ketenaId}
                onChange={(e) => setForm({ ...form, ketenaId: e.target.value })}
                disabled={!form.kebeleId || isKetenasLoading}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800/60 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!form.kebeleId
                    ? "መጀመሪያ ቀበሌ ይምረጡ"
                    : isKetenasLoading
                    ? "ቀጠናዎችን በመጫን ላይ..."
                    : ketenas.length === 0
                    ? "ምንም ቀጠና አልተገኘም"
                    : "ቀጠና ይምረጡ"}
                </option>
                {ketenas.map((kt) => (
                  <option key={kt.id} value={kt.id}>
                    {formatKetenaLabel(kt)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                የደንበኛ ዓይነት
              </label>
              <select
                value={form.customerTypeId}
                onChange={(e) => setForm({ ...form, customerTypeId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">የደንበኛ ዓይነት ይምረጡ</option>
                {customerTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.customerTypeDescription || ct.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-500" />
                  ቅርንጫፍ (Branch) <span className="text-red-500">*</span>
                </span>
                {resolvedBranchId && (
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    የተጠቃሚው ቅርንጫፍ (ቋሚ)
                  </span>
                )}
              </label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                disabled={Boolean(resolvedBranchId)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800/80 disabled:text-gray-700 dark:disabled:text-gray-300 disabled:cursor-not-allowed font-medium"
              >
                <option value="">ቅርንጫፍ ይምረጡ</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchDescription || b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              አድራሻ ማብራሪያ (የአካባቢው መለያ)
            </label>
            <textarea
              rows={2}
              value={form.addressDescription}
              onChange={(e) => {
                handleAmharicInputChange(
                  e,
                  (val) => setForm((prev) => ({ ...prev, addressDescription: val })),
                  isAmharicKeyboardOn
                );
              }}
              placeholder="ለምሳሌ: ከመስጊዱ በስተጀርባ፣ ከዋናው አስፋልት 100 ሜትር ገባ ብሎ..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
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
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {submitting ? "በመመዝገብ ላይ..." : "ማመልከቻውን መዝግብ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
