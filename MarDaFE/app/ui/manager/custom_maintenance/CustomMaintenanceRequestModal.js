"use client";
import { useState, useEffect } from "react";
import { X, Wrench, Search, Loader2, UserCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { CustomerService } from "../../../lib/customerService";

const customerService = new CustomerService();

export default function CustomMaintenanceRequestModal({
  isOpen,
  onClose,
  onSuccess,
  userBranchId = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Reference Catalogs
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Form Fields
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [phoneOverride, setPhoneOverride] = useState("");
  const [addressDescription, setAddressDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setSelectedCustomer(null);
      setSelectedTypeId("");
      setProblemDescription("");
      setPhoneOverride("");
      setAddressDescription("");

      loadMaintenanceTypes();
    }
  }, [isOpen]);

  const loadMaintenanceTypes = async () => {
    try {
      setLoadingTypes(true);
      const types = await customMaintenanceService.getMaintenanceTypes();
      setMaintenanceTypes(types || []);
      if (types && types.length > 0) {
        setSelectedTypeId(String(types[0].id));
      }
    } catch (err) {
      console.error("Failed to load maintenance types:", err);
    } finally {
      setLoadingTypes(false);
    }
  };

  const handleSearchCustomers = async (e) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      toast.warning("እባክዎ መፈለጊያ ቃል ያስገቡ (ስም፣ ሂሳብ ቁጥር፣ ቆጣሪ ቁጥር ወይም ስልክ)");
      return;
    }

    try {
      setSearching(true);
      const res = await customerService.getCustomersPaginatedFiltered({
        pageIndex: 0,
        pageSize: 15,
        status: "active",
        branchId: userBranchId || null,
        search: query,
      });

      const list = res?.content || (Array.isArray(res) ? res : []);
      setSearchResults(list);
      if (list.length === 0) {
        toast.info("ምንም የተገኘ ደንበኛ የለም");
      }
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("ደንበኞችን መፈለግ አልተቻለም");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = (cust) => {
    setSelectedCustomer(cust);
    setSearchResults([]);
    setPhoneOverride(cust.phoneNumber || "");
    setAddressDescription(cust.addressDescription || "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      toast.error("እባክዎ መጀመሪያ የተመዘገበ ደንበኛ ይምረጡ");
      return;
    }
    if (!problemDescription.trim()) {
      toast.error("እባክዎ ያጋጠመውን ችግር መግለጫ ያስገቡ");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerId: selectedCustomer.id,
        maintenanceTypeId: selectedTypeId ? Number(selectedTypeId) : null,
        problemDescription: problemDescription.trim(),
        customerFullName: selectedCustomer.fullName,
        customerFullNameEng: selectedCustomer.fullNameEng,
        phoneNumber: phoneOverride?.trim() || selectedCustomer.phoneNumber,
        accountNumber: selectedCustomer.accountNumber,
        meterNumber: selectedCustomer.meterNumber,
        branchId: selectedCustomer.branch?.id || userBranchId,
        kebeleId: selectedCustomer.addressStreet?.id,
        ketenaId: selectedCustomer.addressKetena?.id,
        customerTypeId: selectedCustomer.billingCustomerType?.id,
        addressDescription: addressDescription?.trim() || selectedCustomer.addressDescription,
      };

      const res = await customMaintenanceService.createRequest(payload);
      toast.success(`የጥገና ጥያቄ ተመዝግቧል! የጥገና ቁጥር: ${res.requestNumber}`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Submit maintenance request failed:", err);
      toast.error(err.response?.data?.message || "የጥገና ጥያቄውን መመዝገብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-200" />
            <h2 className="text-lg font-bold">አዲስ የደንበኛ ጥገና አገልግሎት ጥያቄ መመዝገቢያ</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step A: Registered Customer Search & Selection */}
          {!selectedCustomer ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-3.5 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                  የጥገና አገልግሎት የሚሰጠው በሲስተሙ ለተመዘገቡ ደንበኞች ነው። ደንበኛውን በ<strong>ሂሳብ ቁጥር</strong>፣ በ<strong>ቆጣሪ ቁጥር</strong>፣ በ<strong>ስም</strong> ወይም በ<strong>ስልክ ቁጥር</strong> ይፈልጉና ይምረጡ።
                </div>
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearchCustomers} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="በመለያ ቁጥር፣ በቆጣሪ ቁጥር፣ በስም ወይም በስልክ ቁጥር ይፈልጉ..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  ፈልግ
                </button>
              </form>

              {/* Results List */}
              {searchResults.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/60 bg-white dark:bg-gray-800 shadow-sm">
                  {searchResults.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCustomer(c)}
                      className="p-3 hover:bg-blue-50/70 dark:hover:bg-blue-900/20 cursor-pointer flex items-center justify-between transition-colors group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span>{c.fullName}</span>
                          {c.fullNameEng && <span className="text-xs text-gray-400 font-normal">({c.fullNameEng})</span>}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                          <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px] text-gray-700 dark:text-gray-300">
                            ሂሳብ: {c.accountNumber}
                          </span>
                          <span>ቆጣሪ: {c.meterNumber || "—"}</span>
                          <span>ስልክ: {c.phoneNumber || "—"}</span>
                          <span>ቅርንጫፍ: {c.branch?.branchName || "—"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors"
                      >
                        ምረጥ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Selected Customer Card */
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  የተመረጠ ደንበኛ (Customer Selected)
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  ደንበኛ ቀይር (Change)
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-emerald-100 dark:border-emerald-900/40">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-[11px]">የደንበኛ ሙሉ ስም:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">{selectedCustomer.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-[11px]">የሂሳብ ቁጥር:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{selectedCustomer.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-[11px]">የውሃ ቆጣሪ ቁጥር:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{selectedCustomer.meterNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-[11px]">ስልክ ቁጥር:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedCustomer.phoneNumber || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-[11px]">ቀበሌ / ቀጠና:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedCustomer.addressStreet?.streetsName ? `ቀበሌ ${selectedCustomer.addressStreet.streetsName}` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-[11px]">ቅርንጫፍ:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedCustomer.branch?.branchName || "—"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step B: Maintenance Request Details Form */}
          {selectedCustomer && (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    የጥገናው ዓይነት (Maintenance Type) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedTypeId}
                    onChange={(e) => setSelectedTypeId(e.target.value)}
                    required
                    disabled={loadingTypes}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    {maintenanceTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.typeNameAm} ({t.typeName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    ተለዋጭ / ተደራሽ ስልክ ቁጥር (Phone Override)
                  </label>
                  <input
                    type="text"
                    value={phoneOverride}
                    onChange={(e) => setPhoneOverride(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ያጋጠመው ችግር ዝርዝር መግለጫ (Problem Description) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  placeholder="ለምሳሌ: የመስመር መቆራረጥ፣ የቧንቧ ፍሳሽ ወይም የውሃ ቆጣሪ መስበር..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የአድራሻ ዝርዝር ወይም ልዩ መለያ ቦታ (Address Description / Landmark)
                </label>
                <input
                  type="text"
                  value={addressDescription}
                  onChange={(e) => setAddressDescription(e.target.value)}
                  placeholder="ለምሳሌ: ከአንደኛ ደረጃ ት/ቤት አጠገብ"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  የጥገና ጥያቄውን መዝግብ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
