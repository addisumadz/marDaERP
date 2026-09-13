"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import userRoleCrudService from "../../../lib/userRoleCrudService";
import { KeyRound, Plus, X, Edit2, Trash2, ToggleLeft, ToggleRight, Search, ChevronLeft, ChevronRight } from "lucide-react";

const emptyForm = { roleCode: "", roleName: "", isStore: false, isFormanExpert: false, isWaterMeterReader: false };

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDeleted, setFilterDeleted] = useState("active");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => { loadData(); loadStats(); }, [page, filterDeleted]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await userRoleCrudService.getByStatus(filterDeleted, page, 15);
      setRoles(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { toast.error("Failed to load roles"); }
    setLoading(false);
  };

  const loadStats = async () => {
    try { setStats(await userRoleCrudService.getStatistics()); } catch {}
  };

  const openCreate = () => { setEditRole(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (role) => {
    setEditRole(role);
    setForm({ roleCode: role.roleCode, roleName: role.roleName, isStore: role.isStore || role.store || false, isFormanExpert: role.isFormanExpert || role.formanExpert || false, isWaterMeterReader: role.isWaterMeterReader || role.waterMeterReader || false });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.roleCode || !form.roleName) { toast.error("Role code and name are required"); return; }
    try {
      if (editRole) { await userRoleCrudService.update(editRole.id, form); toast.success("Role updated"); }
      else { await userRoleCrudService.create(form); toast.success("Role created"); }
      setModalOpen(false); loadData(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleToggle = async (role) => {
    try {
      if (role.deleted === "active") { await userRoleCrudService.deactivate(role.id); toast.success("Role deactivated"); }
      else { await userRoleCrudService.activate(role.id); toast.success("Role activated"); }
      loadData(); loadStats();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const filtered = roles.filter(r => {
    const term = searchTerm.toLowerCase();
    return !term || r.roleCode?.toLowerCase().includes(term) || r.roleName?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><KeyRound className="w-7 h-7 text-indigo-600" /> Role Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage system roles for user access control</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"><Plus className="w-4 h-4" /> New Role</button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-indigo-600">{stats.totalRoles ?? stats.total ?? 0}</div>
            <div className="text-sm text-gray-500">Total Roles</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600">{stats.activeRoles ?? stats.active ?? 0}</div>
            <div className="text-sm text-gray-500">Active</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-red-500">{stats.deletedRoles ?? stats.deleted ?? 0}</div>
            <div className="text-sm text-gray-500">Deactivated</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.storeRoles ?? 0}</div>
            <div className="text-sm text-gray-500">Store Roles</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Search roles..." />
        </div>
        <select value={filterDeleted} onChange={e => { setFilterDeleted(e.target.value); setPage(0); }} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
          <option value="active">Active</option>
          <option value="deleted">Deactivated</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-5 py-3 text-left">Role Code</th>
                <th className="px-5 py-3 text-left">Role Name</th>
                <th className="px-5 py-3 text-center">Store</th>
                <th className="px-5 py-3 text-center">Forman/Expert</th>
                <th className="px-5 py-3 text-center">Meter Reader</th>
                <th className="px-5 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
               filtered.length === 0 ? <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">No roles found</td></tr> :
               filtered.map(role => (
                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{role.roleCode}</span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{role.roleName}</td>
                  <td className="px-5 py-3 text-center">
                    {(role.isStore || role.store) ? <span className="text-green-500 text-xs font-bold">✓</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {(role.isFormanExpert || role.formanExpert) ? <span className="text-green-500 text-xs font-bold">✓</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    {(role.isWaterMeterReader || role.waterMeterReader) ? <span className="text-green-500 text-xs font-bold">✓</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.deleted === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"}`}>
                      {role.deleted === "active" ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600" title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleToggle(role)} className={`p-1.5 rounded-lg ${role.deleted === "active" ? "hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500" : "hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600"}`} title={role.deleted === "active" ? "Deactivate" : "Activate"}>
                        {role.deleted === "active" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <span className="text-sm text-gray-500">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editRole ? "Edit Role" : "New Role"}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Code *</label>
                <input value={form.roleCode} onChange={e => setForm({...form, roleCode: e.target.value.toUpperCase()})} disabled={!!editRole} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono disabled:opacity-50" placeholder="INV_MANAGER" />
                <span className="text-xs text-gray-400 mt-0.5 block">Must be unique, uppercase, no spaces (use underscores)</span>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name *</label>
                <input value={form.roleName} onChange={e => setForm({...form, roleName: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Inventory Manager" /></div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Role Flags</h4>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.isStore} onChange={e => setForm({...form, isStore: e.target.checked})} className="rounded w-4 h-4 text-indigo-600" />
                  <div><span className="font-medium">Store Role</span><p className="text-xs text-gray-400">Can access inventory/store operations</p></div>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.isFormanExpert} onChange={e => setForm({...form, isFormanExpert: e.target.checked})} className="rounded w-4 h-4 text-indigo-600" />
                  <div><span className="font-medium">Forman / Expert</span><p className="text-xs text-gray-400">Field supervision role</p></div>
                </label>
                <label className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.isWaterMeterReader} onChange={e => setForm({...form, isWaterMeterReader: e.target.checked})} className="rounded w-4 h-4 text-indigo-600" />
                  <div><span className="font-medium">Water Meter Reader</span><p className="text-xs text-gray-400">Mobile meter reading access</p></div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editRole ? "Update" : "Create Role"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
