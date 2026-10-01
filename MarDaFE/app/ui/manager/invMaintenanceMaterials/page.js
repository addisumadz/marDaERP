"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import invItemService from "../../../lib/invItemService";
import {
  Wrench,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Save,
  Loader2,
  Layers,
  Sparkles,
  Droplets,
  ExternalLink,
} from "lucide-react";

export default function InvMaintenanceMaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [invItems, setInvItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters
  const [searchQ, setSearchQ] = useState("");
  const [selectedFilterTypeId, setSelectedFilterTypeId] = useState("ALL");
  const [filterLink, setFilterLink] = useState("ALL"); // ALL, ACTIVE, INACTIVE, UNLINKED

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [invItemSearch, setInvItemSearch] = useState("");
  const [form, setForm] = useState({
    maintenanceTypeId: "",
    invItemId: "",
    displayOrder: 1,
    isActive: true,
  });

  useEffect(() => {
    loadData();
    loadInvItems();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mats, types] = await Promise.all([
        customMaintenanceService.getCommonMaterials(),
        customMaintenanceService.getMaintenanceTypes(),
      ]);
      setMaterials(mats || []);
      setMaintenanceTypes(types || []);
    } catch (err) {
      console.error(err);
      toast.error("የጥገና ዕቃዎች ካታሎግን መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const loadInvItems = async () => {
    try {
      const items = await invItemService.getAllActive();
      setInvItems(items || []);
    } catch (err) {
      console.warn("Could not load inventory items:", err);
    }
  };

  const resetForm = () => {
    const defaultType =
      selectedFilterTypeId !== "ALL"
        ? selectedFilterTypeId
        : maintenanceTypes[0]?.id
        ? String(maintenanceTypes[0].id)
        : "";

    setForm({
      maintenanceTypeId: defaultType,
      invItemId: "",
      displayOrder: materials.length + 1,
      isActive: true,
    });
    setInvItemSearch("");
    setEditId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditId(item.id);
    setForm({
      maintenanceTypeId: item.maintenanceType?.id ? String(item.maintenanceType.id) : "",
      invItemId: item.invItem?.id ? String(item.invItem.id) : "",
      displayOrder: item.displayOrder != null ? item.displayOrder : 1,
      isActive: item.isActive !== false,
    });
    setInvItemSearch("");
    setModalOpen(true);
  };

  const selectedInvItem = useMemo(() => {
    if (!form.invItemId) return null;
    return invItems.find((it) => String(it.id) === String(form.invItemId)) || null;
  }, [form.invItemId, invItems]);

  const filteredInvItemsForSelect = useMemo(() => {
    if (!invItemSearch.trim()) return invItems;
    const q = invItemSearch.toLowerCase().trim();
    return invItems.filter(
      (it) =>
        (it.itemCode && it.itemCode.toLowerCase().includes(q)) ||
        (it.itemName && it.itemName.toLowerCase().includes(q)) ||
        (it.itemNameAm && it.itemNameAm.toLowerCase().includes(q))
    );
  }, [invItems, invItemSearch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.maintenanceTypeId) {
      toast.error("እባክዎ የጥገና ዓይነት ይምረጡ!");
      return;
    }
    if (!form.invItemId) {
      toast.error("እባክዎ ከኢንቬንቶሪ ማስተር ዕቃ ይምረጡ!");
      return;
    }

    // Duplicate check for same maintenance type + invItem
    const duplicate = materials.find(
      (m) =>
        m.id !== editId &&
        String(m.maintenanceType?.id) === String(form.maintenanceTypeId) &&
        String(m.invItem?.id) === String(form.invItemId)
    );
    if (duplicate) {
      if (!confirm("ይህ ዕቃ ለዚህ የጥገና ዓይነት ቀድሞውኑ ተመዝግቧል። ደግመው ማስቀመጥ ይፈልጋሉ?")) {
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        id: editId || undefined,
        maintenanceType: { id: Number(form.maintenanceTypeId) },
        invItem: { id: Number(form.invItemId) },
        displayOrder: parseInt(form.displayOrder) || 1,
        isActive: form.isActive,
      };

      await customMaintenanceService.saveCommonMaterial(payload);
      toast.success(editId ? "የጥገና ዕቃው ተስተካክሏል!" : "አዲስ የጥገና ዕቃ ተመዝግቧል!");
      setModalOpen(false);
      resetForm();
      const updatedList = await customMaintenanceService.getCommonMaterials();
      setMaterials(updatedList || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "ዕቃውን ማስቀመጥ አልተቻለም");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("እርግጠኛ ነዎት ይህን ዕቃ ከካታሎግ መሰረዝ ይፈልጋሉ?")) return;
    try {
      await customMaintenanceService.deleteCommonMaterial(id);
      toast.success("ዕቃው ተሰርዟል");
      const updatedList = await customMaintenanceService.getCommonMaterials();
      setMaterials(updatedList || []);
    } catch (err) {
      console.error(err);
      toast.error("ዕቃውን መሰረዝ አልተቻለም");
    }
  };

  // Filtered
  const filtered = useMemo(() => {
    return materials.filter((m) => {
      const q = searchQ.toLowerCase().trim();
      const code = m.invItem?.itemCode || m.materialCode || "";
      const name = m.invItem?.itemName || m.materialName || "";
      const nameAm = m.invItem?.itemNameAm || m.materialNameAm || "";

      const matchSearch =
        !q ||
        code.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        nameAm.toLowerCase().includes(q);

      const matchType =
        selectedFilterTypeId === "ALL" ||
        (m.maintenanceType && String(m.maintenanceType.id) === String(selectedFilterTypeId));

      const isLinked = Boolean(m.invItem?.id);
      let matchStatus = true;
      if (filterLink === "ACTIVE") matchStatus = m.isActive !== false;
      else if (filterLink === "INACTIVE") matchStatus = m.isActive === false;
      else if (filterLink === "UNLINKED") matchStatus = !isLinked;

      return matchSearch && matchType && matchStatus;
    });
  }, [materials, searchQ, selectedFilterTypeId, filterLink]);

  const stats = useMemo(() => {
    const total = materials.length;
    const active = materials.filter((m) => m.isActive !== false).length;
    const linked = materials.filter((m) => m.invItem?.id).length;
    const unlinked = total - linked;
    const typeCount = maintenanceTypes.length;
    const waterMeters = materials.filter(
      (m) => m.invItem?.isWaterMeter || m.isWaterMeter
    ).length;
    return { total, active, linked, unlinked, typeCount, waterMeters };
  }, [materials, maintenanceTypes]);

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/ui/manager" className="hover:underline">Dashboard</Link>
            <span>/</span>
            <Link href="/ui/manager/invItems" className="hover:underline">Inventory Settings</Link>
            <span>/</span>
            <span className="text-gray-800 dark:text-gray-200 font-semibold">Maintenance Common Materials</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-indigo-600" />
            የጥገና ዕቃዎች ካታሎግ ማስተዳደሪያ
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            በጥገና ዓይነቶች ተከፋፍለው ለጥገና ሥራና ለግምት የሚውሉ ዕቃዎችን ከኢንቬንቶሪ ማስተር ጋር በማስተሳሰር ማስተዳደሪያ
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          አዲስ የጥገና ዕቃ አገናኝ
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ጠቅላላ የጥገና ዕቃዎች</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">{stats.total}</p>
          </div>
          <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">የጥገና ዓይነቶች</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1 font-mono">{stats.typeCount}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">የተመዘገቡ ክፍሎች</p>
          </div>
          <div className="w-11 h-11 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ንቁ ዕቃዎች (Active)</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{stats.active}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">በጥገና ዳሰሳ ላይ የሚታዩ</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ትስስር የሚቀራቸው</p>
            <p className={`text-2xl font-bold mt-1 font-mono ${stats.unlinked > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-400"}`}>
              {stats.unlinked}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{stats.unlinked > 0 ? "ከኢንቬንቶሪ ጋር ማስተሳሰር ያስፈልጋል" : "ሁሉም የተሳሰሩ ናቸው"}</p>
          </div>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stats.unlinked > 0 ? "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" : "bg-gray-100 dark:bg-gray-700 text-gray-400"}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="በስም ወይም በእቃ ኮድ ፈልግ..."
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 dark:text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Maintenance Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedFilterTypeId}
              onChange={(e) => setSelectedFilterTypeId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none font-medium"
            >
              <option value="ALL">ሁሉም የጥገና ዓይነቶች ({materials.length})</option>
              {maintenanceTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.typeNameAm} ({t.typeName})
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <select
              value={filterLink}
              onChange={(e) => setFilterLink(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none"
            >
              <option value="ALL">ሁሉም ሁኔታ ({materials.length})</option>
              <option value="ACTIVE">ንቁ ብቻ ({stats.active})</option>
              <option value="INACTIVE">ቦዝነዋል ({materials.length - stats.active})</option>
              {stats.unlinked > 0 && <option value="UNLINKED">ትስስር የሌላቸው ({stats.unlinked})</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 font-bold uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ቅደም</th>
                <th className="py-3 px-4">የጥገና ዓይነት</th>
                <th className="py-3 px-4">የዕቃ ኮድ</th>
                <th className="py-3 px-4">የዕቃው ስም (አማርኛ)</th>
                <th className="py-3 px-4">Material Name (Eng)</th>
                <th className="py-3 px-3 text-center">መለኪያ</th>
                <th className="py-3 px-4 text-right">የሽያጭ ዋጋ (ETB)</th>
                <th className="py-3 px-3 text-center">ቆጣሪ?</th>
                <th className="py-3 px-3 text-center">ሁኔታ</th>
                <th className="py-3 px-4 text-center w-24">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    ዕቃዎችን በመጫን ላይ...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    ምንም ዕቃ አልተገኘም
                  </td>
                </tr>
              ) : (
                filtered.map((m, idx) => {
                  const linked = m.invItem;
                  const itemCode = linked?.itemCode || m.materialCode || "—";
                  const nameAm = linked?.itemNameAm || m.materialNameAm || linked?.itemName || "—";
                  const nameEn = linked?.itemName || m.materialName || "—";
                  const uom = linked?.unitOfMeasure?.unitName || m.unitOfMeasure || "በቁጥር";
                  const price = linked?.defaultUnitCost != null ? Number(linked.defaultUnitCost) : (Number(m.defaultUnitPrice) || 0);
                  const isMeter = Boolean(linked?.isWaterMeter || m.isWaterMeter);

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-gray-400 font-medium">
                        {m.displayOrder || idx + 1}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {m.maintenanceType?.typeNameAm || m.maintenanceType?.typeName || "አጠቃላይ"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {itemCode}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{nameAm}</span>
                          {!linked && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              ያልተሳሰረ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">
                        {nameEn}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600 dark:text-gray-300 font-medium">
                        {uom}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {price > 0 ? price.toFixed(2) : "0.00"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isMeter ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300">
                            <Droplets className="w-3 h-3" /> ቆጣሪ
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.isActive !== false
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {m.isActive !== false ? "ንቁ" : "ቦዝኗል"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(m)}
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="አስተካክል"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            title="አስወግድ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-10 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-blue-700 to-sky-700 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-200" />
                <h3 className="font-bold text-sm">
                  {editId ? "የጥገና ዕቃ አስተካክል" : "አዲስ የጥገና ዕቃ አገናኝ"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Maintenance Type selection */}
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  የጥገና ዓይነት (Maintenance Type) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.maintenanceTypeId}
                  onChange={(e) => setForm({ ...form, maintenanceTypeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-medium outline-none"
                >
                  <option value="">-- የጥገና ዓይነት ይምረጡ --</option>
                  {maintenanceTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.typeNameAm} ({t.typeName})
                    </option>
                  ))}
                </select>
              </div>

              {/* InvItem Link Selector with Live Search */}
              <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold text-indigo-900 dark:text-indigo-300">
                    የኢንቬንቶሪ ማስተር ዕቃ ምረጥ <span className="text-red-500">*</span>
                  </label>
                  <Link
                    href="/ui/manager/invItems"
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    አዲስ ዕቃ መዝግብ <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>

                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-400">
                  የዕቃው ስም፣ ኮድ፣ መለኪያ እና የሽያጭ ዋጋ በቀጥታ ከኢንቬንቶሪ ማስተር ይወሰዳሉ።
                </p>

                {/* Search in dropdown list */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ዝርዝሩን ለማጣራት ፈልግ..."
                    value={invItemSearch}
                    onChange={(e) => setInvItemSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-indigo-200 dark:border-indigo-900 rounded-lg bg-white dark:bg-gray-800 dark:text-white outline-none"
                  />
                </div>

                <select
                  required
                  value={form.invItemId}
                  onChange={(e) => setForm({ ...form, invItemId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-indigo-300 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-800 dark:text-white outline-none font-medium"
                  size={5}
                >
                  <option value="" disabled className="text-gray-400">
                    -- ከዝርዝሩ ውስጥ ዕቃ ይምረጡ ({filteredInvItemsForSelect.length} የተገኙ) --
                  </option>
                  {filteredInvItemsForSelect.map((inv) => (
                    <option key={inv.id} value={inv.id} className="py-1">
                      {inv.itemCode} — {inv.itemNameAm || inv.itemName} ({inv.itemName}) — ETB {Number(inv.defaultUnitCost || 0).toFixed(2)}
                    </option>
                  ))}
                </select>

                {/* Selected Item Summary Card */}
                {selectedInvItem && (
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] space-y-2 shadow-sm">
                    <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-2">
                      <div>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {selectedInvItem.itemCode}
                        </span>
                        <h4 className="font-bold text-gray-900 dark:text-white text-xs mt-0.5">
                          {selectedInvItem.itemNameAm || selectedInvItem.itemName}
                        </h4>
                        <span className="text-gray-500 text-[10px]">{selectedInvItem.itemName}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-gray-400">የሽያጭ ዋጋ (Unit Cost)</span>
                        <span className="font-mono font-bold text-emerald-600 text-xs">
                          ETB {Number(selectedInvItem.defaultUnitCost || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div>
                        <span className="text-gray-400 text-[10px] block">መለኪያ (Unit):</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {selectedInvItem.unitOfMeasure?.unitName || "በቁጥር"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block">የዕቃ ዓይነት:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {selectedInvItem.isWaterMeter ? "የውሃ ቆጣሪ (Water Meter)" : "መደበኛ ዕቃ (Standard Material)"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Display Order & Active Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    የቅደም ተከተል ቁጥር (Display Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">በጥገና ዳሰሳ ፎርም ላይ የሚታይበት ቅደም ተከተል</p>
                </div>

                <div className="flex flex-col justify-center pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActiveCheckMnt"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                    />
                    <label htmlFor="isActiveCheckMnt" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      ዕቃው በካታሎግ ውስጥ ንቁ (Active) ይሁን
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">ቦዝኖ ከሆነ በጥገና ዳሰሳ ጥናቶች ላይ አይካተትም</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={saving || !form.invItemId || !form.maintenanceTypeId}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editId ? "አስተካክል" : "መዝግብ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
