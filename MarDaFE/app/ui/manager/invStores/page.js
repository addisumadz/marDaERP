"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import invStoreService from "../../../lib/invStoreService";
import { DropdownService } from "../../../lib/dropdownService";
import { UserAccountService } from "../../../lib/userAccountService";
import { Warehouse, Plus, X, Edit2, Trash2, Star, Building2, User } from "lucide-react";

const dropdownService = new DropdownService();
const userService = new UserAccountService();

export default function InvStoresPage() {
  const [stores, setStores] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    storeCode: "",
    storeName: "",
    storeNameAm: "",
    isMainStore: false,
    location: "",
    isActive: true,
    branchId: "",
    storeKeeperId: "",
    managerId: "",
  });

  useEffect(() => {
    loadData();
    loadLookups();
  }, []);

  const loadLookups = async () => {
    try {
      const [bList, uList] = await Promise.allSettled([
        dropdownService.getBranches(),
        userService.getAllUsers(),
      ]);
      if (bList.status === "fulfilled") setBranches(bList.value || []);
      if (uList.status === "fulfilled") {
        const rawUsers = uList.value || [];
        setUsers(Array.isArray(rawUsers) ? rawUsers : rawUsers.content || []);
      }
    } catch (err) {
      console.warn("Error loading store lookups:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await invStoreService.getAll();
      const list = data.content || data || [];
      setStores(Array.isArray(list) ? list : []);
    } catch {
      toast.error("Failed to load stores");
      setStores([]);
    } finally {
      setLoading(false);
    }
  };


  const resetForm = () => {
    setForm({
      storeCode: "",
      storeName: "",
      storeNameAm: "",
      isMainStore: false,
      location: "",
      isActive: true,
      branchId: "",
      storeKeeperId: "",
      managerId: "",
    });
    setEditId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setForm({
      storeCode: s.storeCode,
      storeName: s.storeName,
      storeNameAm: s.storeNameAm || "",
      isMainStore: Boolean(s.isMainStore),
      location: s.location || "",
      isActive: Boolean(s.isActive),
      branchId: s.branch?.id ? String(s.branch.id) : "",
      storeKeeperId: s.storeKeeper?.id ? String(s.storeKeeper.id) : "",
      managerId: s.manager?.id ? String(s.manager.id) : "",
    });
    setEditId(s.id);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.storeCode || !form.storeName) {
      toast.error("Code and Name required");
      return;
    }
    try {
      const payload = {
        ...form,
        branchId: form.branchId ? Number(form.branchId) : null,
        storeKeeperId: form.storeKeeperId ? Number(form.storeKeeperId) : null,
        managerId: form.managerId ? Number(form.managerId) : null,
      };

      if (editId) {
        await invStoreService.update(editId, payload);
        toast.success("Store updated");
      } else {
        await invStoreService.create(payload);
        toast.success("Store created");
      }
      setModalOpen(false);
      resetForm();
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error saving store");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this store?")) return;
    try {
      await invStoreService.delete(id);
      toast.success("Store deleted");
      loadData();
    } catch {
      toast.error("Error deleting store");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Warehouse className="w-7 h-7 text-indigo-600" /> Stores Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Main store and branch stores configuration & assignments
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> New Store
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-400">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No stores configured</div>
        ) : (
          stores.map((store) => (
            <div
              key={store.id}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border-2 ${
                store.isMainStore
                  ? "border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-950/40"
                  : "border-gray-200 dark:border-gray-700"
              } p-5 hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      store.isMainStore
                        ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      {store.storeName}
                      {store.isMainStore && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" title="Main Store" />
                      )}
                    </h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-semibold">
                      {store.storeCode}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(store)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {store.storeNameAm && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                  {store.storeNameAm}
                </p>
              )}

              <div className="mt-3 space-y-1 text-xs">
                {store.branch && (
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-medium">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>
                      ቅርንጫፍ:{" "}
                      <strong>
                        {store.branch.branchDescription || store.branch.name || `Branch ${store.branch.id}`}
                      </strong>
                    </span>
                  </div>
                )}
                {store.storeKeeper && (
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <User className="w-3.5 h-3.5" />
                    <span>
                      ስቶር ኃላፊ:{" "}
                      <strong>{store.storeKeeper.fullName || store.storeKeeper.userName}</strong>
                    </span>
                  </div>
                )}
                {store.location && (
                  <p className="text-gray-400">📍 {store.location}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    store.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                  }`}
                >
                  {store.isActive ? "Active" : "Inactive"}
                </span>
                {store.isMainStore && (
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    ዋና መጋዘን (Main Store)
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg my-auto overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <h2 className="text-base font-bold">
                {editId ? "መጋዘን / ስቶር አርትዕ (Edit Store)" : "አዲስ መጋዘን መመዝገቢያ (New Store)"}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="p-1 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Store Code *
                  </label>
                  <input
                    value={form.storeCode}
                    onChange={(e) =>
                      setForm({ ...form, storeCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. ST1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white uppercase font-mono font-bold"
                    disabled={Boolean(editId)}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.isMainStore}
                      onChange={(e) =>
                        setForm({ ...form, isMainStore: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      ዋና መጋዘን (Main Store)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የመጋዘን ስም (Store Name) *
                </label>
                <input
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  placeholder="e.g. SheSha Ber Warehouse"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የመጋዘን ስም በአማርኛ (Store Name Amharic)
                </label>
                <input
                  value={form.storeNameAm}
                  onChange={(e) => setForm({ ...form, storeNameAm: e.target.value })}
                  placeholder="ምሳሌ: ሼሻ በር መጋዘን"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                />
              </div>

              {/* Branch Association Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  ተጓዳኝ ቅርንጫፍ (Associated Branch) *
                </label>
                <select
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white font-medium"
                >
                  <option value="">ቅርንጫፍ ይምረጡ (Select Branch)</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branchDescription || b.name || `Branch ${b.id}`}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  አዲስ መስመር ዝርጋታ ላይ እቃዎች ከዚህ ቅርንጫፍ ስቶር ይወጣሉ
                </p>
              </div>

              {/* Store Keeper Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  የተመደበ ስቶር ኃላፊ (Primary Store Keeper)
                </label>
                <select
                  value={form.storeKeeperId}
                  onChange={(e) => setForm({ ...form, storeKeeperId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                >
                  <option value="">ተጠቃሚ ይምረጡ (Select Keeper)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName || u.userName} {u.roleName ? `(${u.roleName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  አካባቢ / መገኛ (Location)
                </label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Ground Floor, Block B"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    ይህ መጋዘን ንቁ ነው (Active Store)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                ሰርዝ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-md transition-all"
              >
                {editId ? "አስተካክል (Update)" : "መዝግብ (Create)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
