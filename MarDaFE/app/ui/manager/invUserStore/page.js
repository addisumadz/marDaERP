"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import invUserStoreService from "../../../lib/invUserStoreService";
import invStoreService from "../../../lib/invStoreService";
import { UserAccountService } from "../../../lib/userAccountService";
import {
  UserCheck,
  Warehouse,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Star,
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  Store,
  Calendar,
  Layers,
} from "lucide-react";

const userService = new UserAccountService();

export default function InvUserStorePage() {
  const [assignments, setAssignments] = useState([]);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStoreFilter, setSelectedStoreFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    storeId: "",
    userAccountId: "",
    roleInStore: "STORE_KEEPER",
    isPrimary: false,
    isActive: true,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [assignmentData, storeData, userData] = await Promise.all([
        invUserStoreService.getAll(),
        invStoreService.getAllActive(),
        userService.getAllUsers().catch(() => []),
      ]);

      setAssignments(Array.isArray(assignmentData) ? assignmentData : []);
      setStores(Array.isArray(storeData) ? storeData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch {
      toast.error("መረጃዎችን መጫን አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      storeId: "",
      userAccountId: "",
      roleInStore: "STORE_KEEPER",
      isPrimary: false,
      isActive: true,
      notes: "",
    });
    setEditId(null);
  };

  const openCreateModal = () => {
    resetForm();
    if (stores.length > 0) {
      setForm((prev) => ({ ...prev, storeId: String(stores[0].id) }));
    }
    if (users.length > 0) {
      setForm((prev) => ({ ...prev, userAccountId: String(users[0].id) }));
    }
    setModalOpen(true);
  };

  const openEditModal = (a) => {
    setEditId(a.id);
    setForm({
      storeId: String(a.store?.id || ""),
      userAccountId: String(a.userAccount?.id || ""),
      roleInStore: a.roleInStore || "STORE_KEEPER",
      isPrimary: Boolean(a.isPrimary),
      isActive: Boolean(a.isActive),
      notes: a.notes || "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.storeId || !form.userAccountId) {
      toast.error("እባክዎ መደብር እና ተጠቃሚ ይምረጡ");
      return;
    }

    setSubmitting(true);
    try {
      if (editId) {
        await invUserStoreService.update(editId, form);
        toast.success("የመደብር ተጠቃሚ ምደባ በተሳካ ሁኔታ ተስተካክሏል");
      } else {
        await invUserStoreService.assign(form);
        toast.success("ተጠቃሚው ለመደብሩ በተሳካ ሁኔታ ተመድቧል");
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || "ምደባውን ማከናወን አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("ይህንን የተጠቃሚ እና የመደብር ምደባ መሰረዝ ይፈልጋሉ?")) return;
    try {
      await invUserStoreService.delete(id);
      toast.success("ምደባው ተሰርዟል");
      loadData();
    } catch {
      toast.error("ምደባውን መሰረዝ አልተቻለም");
    }
  };

  const handleToggleStatus = async (assignment) => {
    try {
      await invUserStoreService.update(assignment.id, {
        isActive: !assignment.isActive,
      });
      toast.success("ሁኔታው ተቀይሯል");
      loadData();
    } catch {
      toast.error("ሁኔታ መቀየር አልተቻለም");
    }
  };

  // Filtered list
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchStore =
        selectedStoreFilter === "ALL" ||
        String(a.store?.id) === String(selectedStoreFilter);

      const uName = (
        (a.userAccount?.firstName || "") +
        " " +
        (a.userAccount?.lastName || "") +
        " " +
        (a.userAccount?.userName || "")
      ).toLowerCase();

      const sName = (
        (a.store?.storeName || "") +
        " " +
        (a.store?.storeCode || "")
      ).toLowerCase();

      const q = searchTerm.toLowerCase().trim();
      const matchSearch = !q || uName.includes(q) || sName.includes(q);

      return matchStore && matchSearch;
    });
  }, [assignments, selectedStoreFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => a.isActive).length;
    const primaryKeepers = assignments.filter((a) => a.isPrimary).length;
    const uniqueStores = new Set(assignments.map((a) => a.store?.id)).size;
    return { total, active, primaryKeepers, uniqueStores };
  }, [assignments]);

  const getRoleLabel = (role) => {
    switch (role) {
      case "STORE_KEEPER":
        return { text: "መጋዘን ሹም (Store Keeper)", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300" };
      case "STORE_MANAGER":
        return { text: "የመደብር ኃላፊ (Manager)", color: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" };
      case "STORE_OFFICER":
        return { text: "የመደብር ሰራተኛ (Store Officer)", color: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300" };
      default:
        return { text: role || "ተመዳቢ", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 dark:text-white">
                የመደብር ተጠቃሚዎች ምደባ (User Store Association)
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                የመጋዘን ሹሞች እና ተጠቃሚዎችን ከዋና እና ቅርንጫፍ መደብሮች ጋር ማቆራኘት
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="አድስ"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus className="w-4 h-4" /> አዲስ ምደባ (New Association)
          </button>
        </div>
      </div>

      {/* ─── KPI Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">ጠቅላላ ምደባዎች</div>
            <div className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</div>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">ንቁ ምደባዎች</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</div>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">ዋና መጋዘን ሹሞች</div>
            <div className="text-2xl font-black text-amber-500 mt-1">{stats.primaryKeepers}</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-xl">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">የተካተቱ መደብሮች</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.uniqueStores}</div>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ─── Search & Store Filters ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="በተጠቃሚ ስም ወይም በመደብር ስም ፈልግ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="sm:w-64">
          <select
            value={selectedStoreFilter}
            onChange={(e) => setSelectedStoreFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium"
          >
            <option value="ALL">ሁሉንም መደብሮች አሳይ (All Stores)</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.storeName} ({s.storeCode}) {s.isMainStore ? "★ ዋና መደብር" : "🏢 ቅርንጫፍ"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Assignments Table ───────────────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-5 py-3.5">መደብር (Store)</th>
                <th className="px-5 py-3.5">የተመደበው ተጠቃሚ (User)</th>
                <th className="px-5 py-3.5">የሲስተም ሚና (System Role)</th>
                <th className="px-5 py-3.5">በመደብሩ ያለው ኃላፊነት (Store Role)</th>
                <th className="px-5 py-3.5 text-center">ሁኔታ (Status)</th>
                <th className="px-5 py-3.5">የተመደበበት ቀን</th>
                <th className="px-5 py-3.5 text-center">ተግባራት (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    መረጃ በመጫን ላይ...
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    ምንም የተጠቃሚ እና የመደብር ምደባ አልተገኘም
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const roleBadge = getRoleLabel(a.roleInStore);
                  const userFullName =
                    ((a.userAccount?.firstName || "") +
                    " " +
                    (a.userAccount?.lastName || "")).trim() || a.userAccount?.userName;

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors"
                    >
                      {/* Store */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              a.store?.isMainStore
                                ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300"
                            }`}
                          >
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                              {a.store?.storeName}
                              {a.store?.isMainStore && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                  ዋና
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {a.store?.storeCode} {a.store?.branch ? `• ${a.store.branch.branchName}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {userFullName}
                          {a.isPrimary && (
                            <Star
                              className="w-3.5 h-3.5 text-amber-500 fill-amber-500"
                              title="ዋና መጋዘን ሹም (Primary Storekeeper)"
                            />
                          )}
                        </div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono">
                          @{a.userAccount?.userName}
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                          <Shield className="w-3 h-3 text-gray-400" />
                          {a.userAccount?.userRole?.roleName || "ተጠቃሚ"}
                        </span>
                      </td>

                      {/* Store Role */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${roleBadge.color}`}
                        >
                          {roleBadge.text}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(a)}
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            a.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                          }`}
                        >
                          {a.isActive ? "ንቁ (Active)" : "ቦዝኗል (Inactive)"}
                        </button>
                      </td>

                      {/* Assigned Date */}
                      <td className="px-5 py-3.5 text-xs text-gray-500 dark:text-gray-400">
                        {a.assignedDate
                          ? new Date(a.assignedDate).toLocaleDateString("en-CA")
                          : "—"}
                        {a.assignedBy && (
                          <div className="text-[10px] text-gray-400">በ: {a.assignedBy}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                            title="አስተካክል"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="ሰርዝ"
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

      {/* ─── Assignment Modal ────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-600 text-white">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                <h2 className="text-base font-bold">
                  {editId ? "ምደባውን አስተካክል (Edit Association)" : "አዲስ የመደብር ተጠቃሚ ምደባ (New Association)"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {/* Select Store */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  መደብር ይምረጡ (Select Store) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={Boolean(editId)}
                  value={form.storeId}
                  onChange={(e) => setForm({ ...form, storeId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">— መደብር ይምረጡ —</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.storeName} ({s.storeCode}) {s.isMainStore ? "★ ዋና መደብር" : "🏢 ቅርንጫፍ"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select User */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ተጠቃሚ ይምረጡ (Select User) <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  disabled={Boolean(editId)}
                  value={form.userAccountId}
                  onChange={(e) => setForm({ ...form, userAccountId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">— ተጠቃሚ ይምረጡ —</option>
                  {users.map((u) => {
                    const fullName =
                      ((u.firstName || "") + " " + (u.lastName || "")).trim() || u.userName;
                    return (
                      <option key={u.id} value={u.id}>
                        {fullName} (@{u.userName}) — {u.userRole?.roleName || "User"}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Role in Store */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  በመደብሩ ያለው ኃላፊነት (Role in Store)
                </label>
                <select
                  value={form.roleInStore}
                  onChange={(e) => setForm({ ...form, roleInStore: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                >
                  <option value="STORE_KEEPER">መጋዘን ሹም (Store Keeper)</option>
                  <option value="STORE_OFFICER">የመደብር ሰራተኛ / ረዳት (Store Officer)</option>
                  <option value="STORE_MANAGER">የመደብር ኃላፊ (Store Manager)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-xs flex items-center gap-1">
                      ዋና መጋዘን ሹም <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </div>
                    <div className="text-[10px] text-gray-400">Primary Storekeeper</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-xs">
                      ንቁ ምደባ (Active)
                    </div>
                    <div className="text-[10px] text-gray-400">Is active assignment</div>
                  </div>
                </label>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ማስታወሻ (Notes / Remarks)
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="ተጨማሪ ማስታወሻ..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  ይቅር (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? "በማስቀመጥ ላይ..." : editId ? "አስተካክል" : "መድብ (Save)"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
