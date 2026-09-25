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
  const [filterLink, setFilterLink] = useState("ALL"); // ALL, LINKED, UNLINKED

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    maintenanceTypeId: "",
    materialCode: "",
    materialName: "",
    materialNameAm: "",
    unitOfMeasure: "በቁጥር",
    defaultUnitPrice: 0,
    displayOrder: 1,
    isActive: true,
    invItemId: "",
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [mats, types, items] = await Promise.all([
        customMaintenanceService.getCommonMaterials(),
        customMaintenanceService.getMaintenanceTypes(),
        invItemService.getAllActive().catch(() => []),
      ]);
      setMaterials(mats || []);
      setMaintenanceTypes(types || []);
      setInvItems(items || []);
    } catch (err) {
      console.error(err);
      toast.error("የጥገና ዕቃዎች ካታሎግን መጫን አልተቻለም");
    } finally {
      setLoading(false);
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
      materialCode: `MNT-MAT-${Date.now().toString().slice(-4)}`,
      materialName: "",
      materialNameAm: "",
      unitOfMeasure: "በቁጥር",
      defaultUnitPrice: 0,
      displayOrder: materials.length + 1,
      isActive: true,
      invItemId: "",
    });
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
      materialCode: item.materialCode || "",
      materialName: item.materialName || "",
      materialNameAm: item.materialNameAm || "",
      unitOfMeasure: item.unitOfMeasure || "በቁጥር",
      defaultUnitPrice: item.defaultUnitPrice != null ? item.defaultUnitPrice : 0,
      displayOrder: item.displayOrder != null ? item.displayOrder : 1,
      isActive: item.isActive !== false,
      invItemId: item.invItem?.id ? String(item.invItem.id) : "",
    });
    setModalOpen(true);
  };

  const handleInvItemSelect = (selectedId) => {
    const matched = invItems.find((it) => String(it.id) === String(selectedId));
    if (matched) {
      setForm((prev) => ({
        ...prev,
        invItemId: selectedId,
        materialName: prev.materialName ? prev.materialName : matched.itemName,
        materialNameAm: prev.materialNameAm ? prev.materialNameAm : (matched.itemNameAm || matched.itemName),
        unitOfMeasure: prev.unitOfMeasure && prev.unitOfMeasure !== "በቁጥር" ? prev.unitOfMeasure : (matched.unitOfMeasure?.unitName || matched.unitOfMeasure?.unitNameAm || prev.unitOfMeasure),
        defaultUnitPrice: matched.defaultUnitCost || prev.defaultUnitPrice || 0,
      }));
    } else {
      setForm((prev) => ({ ...prev, invItemId: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.materialNameAm || !form.materialCode) {
      toast.error("የዕቃ ኮድ እና የአማርኛ ስም መሞላት አለባቸው!");
      return;
    }
    if (!form.maintenanceTypeId) {
      toast.error("እባክዎ የጥገና ዓይነት ይምረጡ!");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editId || undefined,
        maintenanceType: { id: Number(form.maintenanceTypeId) },
        materialCode: form.materialCode.trim(),
        materialName: form.materialName ? form.materialName.trim() : "",
        materialNameAm: form.materialNameAm.trim(),
        unitOfMeasure: form.unitOfMeasure || "በቁጥር",
        defaultUnitPrice: parseFloat(form.defaultUnitPrice) || 0,
        displayOrder: parseInt(form.displayOrder) || 1,
        isActive: form.isActive,
        invItem: form.invItemId ? { id: Number(form.invItemId) } : null,
      };

      await customMaintenanceService.saveCommonMaterial(payload);
      toast.success(editId ? "ዕቃው ተስተካክሏል!" : "አዲስ የጥገና ዕቃ ተመዝግቧል!");
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
      const matchSearch =
        !q ||
        (m.materialCode && m.materialCode.toLowerCase().includes(q)) ||
        (m.materialName && m.materialName.toLowerCase().includes(q)) ||
        (m.materialNameAm && m.materialNameAm.toLowerCase().includes(q));

      const matchType =
        selectedFilterTypeId === "ALL" ||
        (m.maintenanceType && String(m.maintenanceType.id) === String(selectedFilterTypeId));

      const isLinked = Boolean(m.invItem?.id);
      const matchLink =
        filterLink === "ALL"
          ? true
          : filterLink === "LINKED"
          ? isLinked
          : !isLinked;

      return matchSearch && matchType && matchLink;
    });
  }, [materials, searchQ, selectedFilterTypeId, filterLink]);

  const stats = useMemo(() => {
    const total = materials.length;
    const linked = materials.filter((m) => m.invItem?.id).length;
    const unlinked = total - linked;
    const typeCount = maintenanceTypes.length;
    return { total, linked, unlinked, typeCount };
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
            በጥገና ዓይነቶች ተከፋፍለው ለጥገና ሥራና ለግምት የሚውሉ መደበኛ ዕቃዎች ማስተዳደሪያና ከኢንቬንቶሪ ማስተር ማስተሳሰሪያ
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          አዲስ የጥገና ዕቃ መዝግብ
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
          </div>
          <div className="w-11 h-11 bg-sky-50 dark:bg-sky-900/30 rounded-xl flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ከኢንቬንቶሪ የተሳሰሩ</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{stats.linked}</p>
          </div>
          <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ትስስር የሚቀራቸው</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">{stats.unlinked}</p>
          </div>
          <div className="w-11 h-11 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
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

          {/* InvItem link filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">ትስስር:</span>
            <select
              value={filterLink}
              onChange={(e) => setFilterLink(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white outline-none"
            >
              <option value="ALL">ሁሉም ({materials.length})</option>
              <option value="LINKED">የተሳሰሩ ({stats.linked})</option>
              <option value="UNLINKED">ያልተሳሰሩ ({stats.unlinked})</option>
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
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-4">የጥገና ዓይነት</th>
                <th className="py-3 px-4">የዕቃ ኮድ</th>
                <th className="py-3 px-4">የዕቃው ስም (አማርኛ)</th>
                <th className="py-3 px-4">Material Name (Eng)</th>
                <th className="py-3 px-4">የተሳሰረ የኢንቬንቶሪ ዕቃ (InvItem)</th>
                <th className="py-3 px-3 text-center">መለኪያ</th>
                <th className="py-3 px-4 text-right">መነሻ ዋጋ (ETB)</th>
                <th className="py-3 px-3 text-center">ሁኔታ</th>
                <th className="py-3 px-4 text-center w-24">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    የጥገና ዕቃዎችን በመጫን ላይ...
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
                  const linkedItem = m.invItem;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-gray-400 font-medium">
                        {m.displayOrder || idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                        {m.maintenanceType?.typeNameAm || "አጠቃላይ"}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-gray-700 dark:text-gray-300">
                        {m.materialCode}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-gray-900 dark:text-white">
                        {m.materialNameAm}
                      </td>
                      <td className="py-2.5 px-4 text-gray-600 dark:text-gray-300">
                        {m.materialName || "—"}
                      </td>
                      <td className="py-2.5 px-4">
                        {linkedItem ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            {linkedItem.itemCode || "ITEM"}: {linkedItem.itemName}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                            <HelpCircle className="w-3 h-3" /> ያልተሳሰረ
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center text-gray-600 dark:text-gray-300 font-medium">
                        {m.unitOfMeasure}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                        {linkedItem && Number(linkedItem.defaultUnitCost) > 0 ? (
                          <div title="ከኢንቬንቶሪ ማስተር በቀጥታ የተወሰደ የሽያጭ ዋጋ">
                            <span>{(Number(linkedItem.defaultUnitCost) || 0).toFixed(2)}</span>
                            <span className="block text-[9px] font-normal text-emerald-600 dark:text-emerald-400">ማስተር ዋጋ</span>
                          </div>
                        ) : (
                          <span>{(Number(m.defaultUnitPrice) || 0).toFixed(2)}</span>
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
                  {editId ? "የጥገና ዕቃ አስተካክል" : "አዲስ የጥገና ዕቃ መዝግብ"}
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

              {/* InvItem Link Selector */}
              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 rounded-xl space-y-1.5">
                <label className="block font-bold text-indigo-900 dark:text-indigo-300">
                  ከኢንቬንቶሪ ማስተር ዕቃ ጋር አገናኝ (InvItem Link)
                </label>
                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-400">
                  ከኢንቬንቶሪ ዕቃዎች ጋር ማገናኘት በስቶር ያለውን ክምችት ለማየትና ክፍያ ሲፈጸም ወዲያውኑ ወጪ ለማድረግ ያግዛል።
                </p>
                <select
                  value={form.invItemId}
                  onChange={(e) => handleInvItemSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-indigo-300 dark:border-indigo-800 rounded-lg bg-white dark:bg-gray-800 dark:text-white outline-none"
                >
                  <option value="">-- ከኢንቬንቶሪ ማስተር ምረጥ (አማራጭ) --</option>
                  {invItems.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.itemCode} - {inv.itemName} {inv.itemNameAm ? `(${inv.itemNameAm})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    የዕቃ ኮድ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.materialCode}
                    onChange={(e) => setForm({ ...form, materialCode: e.target.value })}
                    placeholder="MNT-MAT-01"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    መለኪያ (Unit of Measure)
                  </label>
                  <input
                    type="text"
                    value={form.unitOfMeasure}
                    onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
                    placeholder="በቁጥር / ሜትር"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  የዕቃው ስም (አማርኛ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.materialNameAm}
                  onChange={(e) => setForm({ ...form, materialNameAm: e.target.value })}
                  placeholder="ለምሳሌ፡ የውሃ ቆጣሪ 1/2"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Material Name (English)
                </label>
                <input
                  type="text"
                  value={form.materialName}
                  onChange={(e) => setForm({ ...form, materialName: e.target.value })}
                  placeholder="e.g. Water Meter 1/2"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    መነሻ ዋጋ (ETB) {form.invItemId && <span className="text-[10px] text-emerald-600 font-normal">(ከኢንቬንቶሪ ማስተር ጋር የተሳሰረ)</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.defaultUnitPrice}
                    onChange={(e) => setForm({ ...form, defaultUnitPrice: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono outline-none"
                  />
                  {form.invItemId && (
                    <p className="text-[10px] text-gray-500 mt-1">
                      * ለዚህ ዕቃ የሽያጭ ዋጋ በዋናነት የሚወሰደው ከኢንቬንቶሪ ማስተር (InvItem.defaultUnitCost) ነው።
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    የቅደም ተከተል ቁጥር
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center gap-2">
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
                  disabled={saving}
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
