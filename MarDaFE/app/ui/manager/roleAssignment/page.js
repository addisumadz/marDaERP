"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import workflowService from "../../../lib/workflowService";
import { menuGroups } from "../../components/Sidebar/sidebarConfig";
import { 
  Shield, 
  Plus, 
  X, 
  UserCheck, 
  Search, 
  Save, 
  ChevronDown, 
  ChevronUp, 
  CheckSquare, 
  Square, 
  LayoutGrid, 
  Settings, 
  Check, 
  Layers, 
  Sparkles,
  Users,
  Building2,
  Calendar,
  DollarSign
} from "lucide-react";

export default function RoleAssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ userAccountId: "", userRoleId: "", branchId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Menu Access state
  const [menuRoleId, setMenuRoleId] = useState("");
  const [checkedPages, setCheckedPages] = useState(new Set());
  const [menuLoading, setMenuLoading] = useState(false);
  const [menuSaving, setMenuSaving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [menuSearchTerm, setMenuSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users"); // "users" | "menus"

  useEffect(() => { loadData(); loadRef(); }, []);

  const loadData = async () => { 
    setLoading(true); 
    try { 
      setAssignments(await workflowService.getRoleAssignments()); 
    } catch {} 
    setLoading(false); 
  };

  const loadRef = async () => { 
    try { 
      setUsers(await workflowService.getAllUsers()); 
      const fetchedRoles = await workflowService.getAllRoles();
      // Ensure standard HRMS roles appear in the system role lists even before explicit DB re-migration
      const defaultHrmsRoles = [
        { id: 9101, roleCode: "M_HR_OFFICER", roleName: "Human Resource Officer (የሰው ኃይል ባለሙያ)" },
        { id: 9102, roleCode: "M_PAYROLL_OFFICER", roleName: "Payroll Officer (የደመወዝ ባለሙያ)" }
      ];
      const merged = [...(fetchedRoles || [])];
      defaultHrmsRoles.forEach(dr => {
        if (!merged.some(r => r.roleCode === dr.roleCode)) {
          merged.push(dr);
        }
      });
      setRoles(merged); 
    } catch {} 
  };

  const handleAssign = async () => {
    if (!form.userAccountId || !form.userRoleId) { toast.error("User and role are required"); return; }
    try {
      await workflowService.assignRole(form);
      toast.success("Role assigned");
      setModalOpen(false); setForm({ userAccountId: "", userRoleId: "", branchId: "" }); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this role assignment?")) return;
    try { await workflowService.revokeRole(id); toast.success("Role revoked"); loadData(); }
    catch (e) { toast.error("Error"); }
  };

  // Group assignments by user
  const grouped = {};
  assignments.forEach(a => {
    const uid = a.userAccount?.id;
    if (!grouped[uid]) grouped[uid] = { user: a.userAccount, roles: [] };
    grouped[uid].roles.push(a);
  });

  const filteredUsers = Object.values(grouped).filter(g => {
    const name = `${g.user?.firstName || ""} ${g.user?.midleName || ""} ${g.user?.userName || ""}`.toLowerCase();
    const matchSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
    const matchRole = !filterRole || g.roles.some(r => r.userRole?.roleCode === filterRole);
    return matchSearch && matchRole;
  });

  // ─── Menu Access Logic (Organized by Module, Task vs Setting) ──────────────
  const moduleGroups = menuGroups.map((group, modIdx) => {
    const items = [];
    group.items.forEach((item, itemIdx) => {
      const isSetting = item.title.toLowerCase().includes("setting") || 
                        item.title.includes("ማስተካከያ") ||
                        item.title.toLowerCase().includes("bracket") ||
                        item.title.toLowerCase().includes("tariff") ||
                        item.title.toLowerCase().includes("account map") ||
                        item.title.toLowerCase().includes("device");
      const isReport = item.title.toLowerCase().includes("report") || 
                       item.title.includes("ሪፖርት") ||
                       item.title.toLowerCase().includes("ledger") ||
                       item.title.toLowerCase().includes("sheet") ||
                       item.title.toLowerCase().includes("balance");

      if (item.children && item.children.length > 0) {
        const children = item.children.map(child => ({
          pageCode: child.path?.split("/").pop() || "",
          title: child.title,
          path: child.path,
        })).filter(c => c.pageCode && c.pageCode !== "#");

        if (children.length > 0) {
          items.push({
            id: `${modIdx}_${itemIdx}`,
            type: "group",
            title: item.title,
            groupName: group.name,
            isSetting,
            isReport,
            isTask: !isSetting && !isReport,
            children
          });
        }
      } else {
        const pageCode = item.path?.split("/").pop() || "";
        if (pageCode && pageCode !== "#" && pageCode !== "manager") {
          items.push({
            id: `${modIdx}_${itemIdx}`,
            type: "item",
            pageCode,
            title: item.title,
            path: item.path,
            groupName: group.name,
            isSetting: false,
            isReport: false,
            isTask: true
          });
        }
      }
    });
    return {
      id: `mod_${modIdx}`,
      name: group.name,
      items
    };
  }).filter(g => g.items.length > 0);

  // All page codes across entire menu
  const allPageCodes = [];
  moduleGroups.forEach(m => {
    m.items.forEach(i => {
      if (i.type === "group") {
        i.children.forEach(c => allPageCodes.push(c.pageCode));
      } else {
        allPageCodes.push(i.pageCode);
      }
    });
  });

  const loadMenuPermissions = async (roleId) => {
    if (!roleId) { setCheckedPages(new Set()); return; }
    setMenuLoading(true);
    try {
      const codes = await workflowService.getMenuPermissions(roleId);
      setCheckedPages(new Set(codes));
      // Auto-expand all groups
      const allGroupIds = [];
      moduleGroups.forEach(m => m.items.forEach(i => { if (i.type === "group") allGroupIds.push(i.id); }));
      setExpandedGroups(new Set(allGroupIds));
    } catch { setCheckedPages(new Set()); }
    setMenuLoading(false);
  };

  useEffect(() => { 
    if (menuRoleId) loadMenuPermissions(menuRoleId); 
    else setCheckedPages(new Set()); 
  }, [menuRoleId]);

  const togglePage = (pageCode) => {
    setCheckedPages(prev => {
      const next = new Set(prev);
      if (next.has(pageCode)) next.delete(pageCode); else next.add(pageCode);
      return next;
    });
  };

  const toggleGroup = (children) => {
    const allChecked = children.every(c => checkedPages.has(c.pageCode));
    setCheckedPages(prev => {
      const next = new Set(prev);
      children.forEach(c => { if (allChecked) next.delete(c.pageCode); else next.add(c.pageCode); });
      return next;
    });
  };

  const toggleModule = (moduleItem) => {
    const modPages = [];
    moduleItem.items.forEach(i => {
      if (i.type === "group") i.children.forEach(c => modPages.push(c.pageCode));
      else modPages.push(i.pageCode);
    });
    const allChecked = modPages.every(p => checkedPages.has(p));
    setCheckedPages(prev => {
      const next = new Set(prev);
      modPages.forEach(p => {
        if (allChecked) next.delete(p);
        else next.add(p);
      });
      return next;
    });
  };

  const toggleExpandGroup = (groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId); else next.add(groupId);
      return next;
    });
  };

  const expandAllGroups = () => {
    const allGroupIds = [];
    moduleGroups.forEach(m => m.items.forEach(i => { if (i.type === "group") allGroupIds.push(i.id); }));
    setExpandedGroups(new Set(allGroupIds));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const selectAllPages = () => {
    setCheckedPages(new Set(allPageCodes));
  };

  const clearAllPages = () => {
    setCheckedPages(new Set());
  };

  const handleSaveMenu = async () => {
    if (!menuRoleId) { toast.error("Select a role first"); return; }
    setMenuSaving(true);
    try {
      await workflowService.saveMenuPermissions(menuRoleId, Array.from(checkedPages));
      toast.success("Menu permissions saved successfully!");
    } catch (e) { toast.error(e.response?.data?.message || "Error saving permissions"); }
    setMenuSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" /> Role Assignment & Menu Access
          </h1>
          <p className="text-sm text-gray-500 mt-1">Assign roles to users and configure granular task and settings access</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all">
          <Plus className="w-4 h-4" /> Assign Role
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab("users")} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "users" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <UserCheck className="w-4 h-4 inline mr-2" />User Role Assignments
        </button>
        <button onClick={() => setActiveTab("menus")} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "menus" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <LayoutGrid className="w-4 h-4 inline mr-2" />Menu Access by Role (Tasks & Settings)
        </button>
      </div>

      {/* ─── TAB 1: User Role Assignments ─── */}
      {activeTab === "users" && (
        <>
          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Search by name or username..." />
            </div>
            <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Roles</option>
              {roles.map(r => <option key={r.id} value={r.roleCode}>{r.roleName} ({r.roleCode})</option>)}
            </select>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-indigo-600">{Object.keys(grouped).length}</div>
              <div className="text-sm text-gray-500">Users with extra roles</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-600">{assignments.length}</div>
              <div className="text-sm text-gray-500">Total assignments</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-purple-600">{roles.length}</div>
              <div className="text-sm text-gray-500">Available roles</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-2xl font-bold text-amber-600">{users.length}</div>
              <div className="text-sm text-gray-500">Total users</div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Username</th>
                    <th className="px-5 py-3 text-left">Primary Role</th>
                    <th className="px-5 py-3 text-left">Additional Roles</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">Loading...</td></tr> :
                   filteredUsers.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">No role assignments found</td></tr> :
                   filteredUsers.map(g => (
                    <tr key={g.user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {(g.user.firstName || "?")[0]}{(g.user.midleName || "?")[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{g.user.firstName} {g.user.midleName} {g.user.lastName}</div>
                            <div className="text-xs text-gray-400">{g.user.branch?.branchName || ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-600 dark:text-gray-400">{g.user.userName}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                          {g.user.userRole?.roleName || g.user.userRole?.roleCode || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {g.roles.map(r => (
                            <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-xs font-medium">
                              {r.userRole?.roleName || r.userRole?.roleCode}
                              <button onClick={() => handleRevoke(r.id)} className="hover:text-red-500 ml-0.5" title="Revoke"><X className="w-3 h-3" /></button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => { setForm({ userAccountId: g.user.id, userRoleId: "", branchId: "" }); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600" title="Add role"><Plus className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ─── TAB 2: Menu Access by Role (Tasks & Settings) ─── */}
      {activeTab === "menus" && (
        <div className="space-y-4">
          {/* Role Selector & Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1 w-full lg:w-auto">
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5">
                  Select Role to Configure Menu Permissions
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <select 
                    value={menuRoleId} 
                    onChange={e => setMenuRoleId(e.target.value)} 
                    className="w-full sm:max-w-md px-3.5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium shadow-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">— Choose a role to configure —</option>
                    {roles.filter(r => r.roleCode !== "billzgjt" && r.roleCode !== "systemadmin").map(r => (
                      <option key={r.id} value={r.id}>
                        {r.roleName} ({r.roleCode})
                      </option>
                    ))}
                  </select>
                  {menuRoleId && (
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={menuSearchTerm}
                        onChange={e => setMenuSearchTerm(e.target.value)}
                        placeholder="Search menu or code..."
                        className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>

              {menuRoleId && (
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                  <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm text-indigo-700 dark:text-indigo-300">
                    <span className="font-bold">{checkedPages.size}</span> of {allPageCodes.length} pages permitted
                  </div>
                  <button 
                    onClick={handleSaveMenu} 
                    disabled={menuSaving} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-md disabled:opacity-50 transition-all font-medium"
                  >
                    <Save className="w-4 h-4" /> {menuSaving ? "Saving..." : "Save Menu Access"}
                  </button>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            {menuRoleId && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-500">Quick Actions:</span>
                  <button onClick={selectAllPages} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded text-gray-700 dark:text-gray-200 transition-colors">
                    Select All
                  </button>
                  <button onClick={clearAllPages} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded text-gray-700 dark:text-gray-200 transition-colors">
                    Clear All
                  </button>
                  <button onClick={expandAllGroups} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded text-gray-700 dark:text-gray-200 transition-colors">
                    Expand All
                  </button>
                  <button onClick={collapseAllGroups} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded text-gray-700 dark:text-gray-200 transition-colors">
                    Collapse All
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Tasks / Operations</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Settings / Master Data</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Reports</span>
                </div>
              </div>
            )}

            {!menuRoleId && (
              <div className="mt-3 text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <strong>How it works:</strong> Select a role above → configure which task pages and setting pages that role is permitted to access in the sidebar → click <strong>Save Menu Access</strong>. System Administrators always have full system access.
              </div>
            )}
          </div>

          {/* Module-wise Tasks & Settings Checkbox Tree */}
          {menuRoleId && (
            <div className="space-y-4">
              {menuLoading ? (
                <div className="p-16 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  Loading role permissions...
                </div>
              ) : (
                moduleGroups.map((moduleItem) => {
                  // Filter items if searching
                  const sTerm = menuSearchTerm.toLowerCase().trim();
                  const visibleItems = moduleItem.items.filter(item => {
                    if (!sTerm) return true;
                    if (item.title.toLowerCase().includes(sTerm)) return true;
                    if (item.pageCode && item.pageCode.toLowerCase().includes(sTerm)) return true;
                    if (item.children && item.children.some(c => c.title.toLowerCase().includes(sTerm) || c.pageCode.toLowerCase().includes(sTerm))) return true;
                    return false;
                  });

                  if (visibleItems.length === 0) return null;

                  // Module selection summary
                  const modPages = [];
                  moduleItem.items.forEach(i => {
                    if (i.type === "group") i.children.forEach(c => modPages.push(c.pageCode));
                    else modPages.push(i.pageCode);
                  });
                  const checkedCountInMod = modPages.filter(p => checkedPages.has(p)).length;
                  const allModChecked = modPages.length > 0 && checkedCountInMod === modPages.length;
                  const someModChecked = checkedCountInMod > 0 && !allModChecked;

                  return (
                    <div key={moduleItem.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                      {/* Module Section Header */}
                      <div className="px-5 py-3.5 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-800 dark:to-indigo-950/20 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleModule(moduleItem)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              allModChecked ? "bg-indigo-600 border-indigo-600 text-white" : 
                              someModChecked ? "bg-indigo-100 border-indigo-400 text-indigo-600" : 
                              "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                            }`}
                            title="Toggle all items in this module"
                          >
                            {allModChecked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                            {someModChecked && <div className="w-2 h-2 bg-indigo-600 rounded-sm" />}
                          </button>
                          <span className="font-bold text-sm tracking-wide text-gray-900 dark:text-white uppercase flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            {moduleItem.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {checkedCountInMod} / {modPages.length} active
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleModule(moduleItem)} 
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium px-2 py-1 rounded"
                          >
                            {allModChecked ? "Deselect Module" : "Select Module"}
                          </button>
                        </div>
                      </div>

                      {/* Subgroups (Task vs Setting) */}
                      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                        {visibleItems.map((item) => {
                          if (item.type === "group") {
                            const filteredChildren = item.children.filter(c => 
                              !sTerm || c.title.toLowerCase().includes(sTerm) || c.pageCode.toLowerCase().includes(sTerm)
                            );
                            const allGroupChecked = item.children.every(c => checkedPages.has(c.pageCode));
                            const someGroupChecked = item.children.some(c => checkedPages.has(c.pageCode));
                            const isExpanded = expandedGroups.has(item.id) || !!sTerm;

                            return (
                              <div key={item.id} className="transition-colors">
                                {/* Group Title Bar */}
                                <div 
                                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                                  onClick={() => toggleExpandGroup(item.id)}
                                >
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); toggleGroup(item.children); }}
                                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                        allGroupChecked ? "bg-indigo-600 border-indigo-600 text-white" : 
                                        someGroupChecked ? "bg-indigo-100 border-indigo-400 text-indigo-600" : 
                                        "border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700"
                                      }`}
                                    >
                                      {allGroupChecked && <Check className="w-3 h-3" strokeWidth={3} />}
                                      {someGroupChecked && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-sm" />}
                                    </button>
                                    <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{item.title}</span>
                                    
                                    {/* Task / Setting / Report Pill Badge */}
                                    {item.isSetting ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                        Settings / Master Data
                                      </span>
                                    ) : item.isReport ? (
                                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                        Reports
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                        Tasks / Operations
                                      </span>
                                    )}

                                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                                      {item.children.filter(c => checkedPages.has(c.pageCode)).length}/{item.children.length}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                  </div>
                                </div>

                                {/* Expanded Children Grid */}
                                {isExpanded && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 px-6 py-3 bg-gray-50/50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700/50">
                                    {filteredChildren.map((child) => (
                                      <label 
                                        key={child.pageCode} 
                                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                                          checkedPages.has(child.pageCode) 
                                            ? "bg-white dark:bg-gray-700 border-indigo-200 dark:border-indigo-600 shadow-sm" 
                                            : "bg-transparent border-transparent hover:bg-white/60 dark:hover:bg-gray-700/40"
                                        }`}
                                      >
                                        <input 
                                          type="checkbox" 
                                          checked={checkedPages.has(child.pageCode)} 
                                          onChange={() => togglePage(child.pageCode)}
                                          className="w-4 h-4 mt-0.5 rounded text-indigo-600 border-gray-300 dark:border-gray-500 focus:ring-indigo-500" 
                                        />
                                        <div className="flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {child.title}
                                          </div>
                                          <div className="text-[11px] font-mono text-gray-400 truncate">
                                            {child.pageCode}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          } else {
                            // Standalone leaf item
                            return (
                              <label key={item.id} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors">
                                <div className="flex items-center gap-3">
                                  <input 
                                    type="checkbox" 
                                    checked={checkedPages.has(item.pageCode)} 
                                    onChange={() => togglePage(item.pageCode)}
                                    className="w-4 h-4 rounded text-indigo-600 border-gray-300 dark:border-gray-500 focus:ring-indigo-500" 
                                  />
                                  <div>
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.title}</span>
                                    <span className="text-xs text-gray-400 ml-2 font-mono">({item.pageCode})</span>
                                  </div>
                                </div>
                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  Tasks / Operations
                                </span>
                              </label>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Assign Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><UserCheck className="w-5 h-5 text-indigo-500" /> Assign Role</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">User *</label>
                <select value={form.userAccountId} onChange={e => setForm({...form, userAccountId: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select User</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.midleName} — {u.userName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
                <select value={form.userRoleId} onChange={e => setForm({...form, userRoleId: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.roleName} ({r.roleCode})</option>)}
                </select>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <strong>Note:</strong> This assigns an additional role to the user. Their primary role (set during account creation) remains unchanged.
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">Cancel</button>
              <button onClick={handleAssign} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">Assign Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
