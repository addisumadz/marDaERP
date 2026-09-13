"use client";
import React from "react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import fncAccountService from "../../../lib/fncAccountService";
import { BookOpen, Plus, Edit, Trash2, ChevronRight, ChevronDown, Search, X } from "lucide-react";

const ACCOUNT_TYPES = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

const TYPE_CONFIG = {
  ASSET: {
    label: "Assets",
    labelAm: "ንብረቶች",
    normalBalance: "DR",
    color: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-700",
    badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  LIABILITY: {
    label: "Liabilities",
    labelAm: "እዳዎች",
    normalBalance: "CR",
    color: "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-700",
    badgeColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  },
  EQUITY: {
    label: "Equity",
    labelAm: "የባለቤትነት ድርሻ",
    normalBalance: "CR",
    color: "bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-700",
    badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
  REVENUE: {
    label: "Revenue",
    labelAm: "ገቢ",
    normalBalance: "CR",
    color: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-700",
    badgeColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  EXPENSE: {
    label: "Expenses",
    labelAm: "ወጪዎች",
    normalBalance: "DR",
    color: "bg-orange-50 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-700",
    badgeColor: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  },
};

export default function FncAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedSections, setExpandedSections] = useState(new Set(ACCOUNT_TYPES));
  const [expandedParents, setExpandedParents] = useState(new Set());
  const [form, setForm] = useState({ accountCode: "", accountName: "", accountNameAm: "", accountType: "ASSET", parentAccountId: null, isHeader: false, description: "" });

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await fncAccountService.getAllAccounts();
      setAccounts(data);
    } catch (e) { toast.error("Failed to load accounts"); }
    setLoading(false);
  };

  // Filter accounts by search
  const filtered = useMemo(() => {
    if (!search) return accounts;
    return accounts.filter(a => {
      return a.accountCode.toLowerCase().includes(search.toLowerCase()) ||
        a.accountName.toLowerCase().includes(search.toLowerCase()) ||
        (a.accountNameAm && a.accountNameAm.includes(search));
    });
  }, [accounts, search]);

  // Group filtered accounts by type, then build parent-child hierarchy
  const groupedByType = useMemo(() => {
    const groups = {};
    ACCOUNT_TYPES.forEach(type => {
      const typeAccounts = filtered.filter(a => a.accountType === type);
      // Separate parents (headers / top-level) and children
      const parents = typeAccounts.filter(a => a.isHeader || !a.parentAccountId);
      const children = typeAccounts.filter(a => !a.isHeader && a.parentAccountId);

      // Build tree: parent → children
      const tree = parents.map(parent => ({
        ...parent,
        children: children.filter(c => c.parentAccountId === parent.id),
      }));

      // Also include orphan children (whose parent might be filtered out or in a different type)
      const assignedChildIds = new Set(tree.flatMap(p => p.children.map(c => c.id)));
      const orphans = children.filter(c => !assignedChildIds.has(c.id));
      orphans.forEach(o => tree.push({ ...o, children: [] }));

      groups[type] = { accounts: tree, totalCount: typeAccounts.length };
    });
    return groups;
  }, [filtered]);

  // Auto-expand all parents that have children (on first load / data change)
  useEffect(() => {
    const parentIds = new Set();
    Object.values(groupedByType).forEach(group => {
      group.accounts.forEach(p => {
        if (p.children && p.children.length > 0) parentIds.add(p.id);
      });
    });
    setExpandedParents(parentIds);
  }, [accounts]);

  const headerAccounts = useMemo(() => accounts.filter(a => a.isHeader || !a.parentAccountId), [accounts]);

  const toggleSection = (type) => {
    const next = new Set(expandedSections);
    next.has(type) ? next.delete(type) : next.add(type);
    setExpandedSections(next);
  };

  const toggleParent = (id) => {
    const next = new Set(expandedParents);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedParents(next);
  };

  const openCreate = () => {
    setEditingAccount(null);
    setForm({ accountCode: "", accountName: "", accountNameAm: "", accountType: "ASSET", parentAccountId: null, isHeader: false, description: "" });
    setModalOpen(true);
  };

  const openEdit = (acc) => {
    setEditingAccount(acc);
    setForm({
      accountCode: acc.accountCode, accountName: acc.accountName, accountNameAm: acc.accountNameAm || "",
      accountType: acc.accountType, parentAccountId: acc.parentAccountId || null, isHeader: acc.isHeader, description: acc.description || ""
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!form.accountCode || !form.accountName || !form.accountType) {
        toast.error("Account code, name, and type are required"); return;
      }
      if (editingAccount) {
        await fncAccountService.updateAccount(editingAccount.id, form);
        toast.success("Account updated");
      } else {
        await fncAccountService.createAccount(form);
        toast.success("Account created");
      }
      setModalOpen(false);
      loadAccounts();
    } catch (e) {
      toast.error(e.response?.data?.message || "Error saving account");
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Are you sure you want to deactivate this account?")) return;
    try {
      await fncAccountService.deactivateAccount(id);
      toast.success("Account deactivated");
      loadAccounts();
    } catch (e) { toast.error(e.response?.data?.message || "Error deactivating account"); }
  };

  // ─── Child Row Component ───────────────────────────────────────
  const ChildRow = ({ acc }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <td className="px-3 py-1.5 font-mono text-xs text-gray-900 dark:text-white pl-8">{acc.accountCode}</td>
      <td className="px-3 py-1.5 text-gray-700 dark:text-gray-300">
        <span className="text-gray-300 dark:text-gray-600 mr-1.5">└</span>
        {acc.accountName}
      </td>
      <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400 text-xs">{acc.accountNameAm || "—"}</td>
      <td className="px-3 py-1.5 text-center"><span className="text-gray-400 text-xs">Postable</span></td>
      <td className="px-3 py-1.5 text-center">
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => openEdit(acc)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDeactivate(acc.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Deactivate">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );

  // ─── Parent Row Component (collapsible Level 2) ────────────────
  const ParentRow = ({ parent }) => {
    const hasChildren = parent.children && parent.children.length > 0;
    const isExpanded = expandedParents.has(parent.id);

    return (
      <React.Fragment>
        <tr className={`transition-colors ${parent.isHeader ? "font-semibold bg-gray-50/50 dark:bg-gray-750/30" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}`}>
          <td className="px-3 py-2 font-mono text-xs text-gray-900 dark:text-white">
            {hasChildren ? (
              <button onClick={() => toggleParent(parent.id)} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
                {isExpanded ? <ChevronDown className="w-3 h-3 text-indigo-500" /> : <ChevronRight className="w-3 h-3 text-gray-400" />}
                {parent.accountCode}
              </button>
            ) : (
              <span className="pl-4">{parent.accountCode}</span>
            )}
          </td>
          <td className="px-3 py-2 text-gray-900 dark:text-white">
            {parent.accountName}
            {hasChildren && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {parent.children.length} sub
              </span>
            )}
          </td>
          <td className="px-3 py-2 text-gray-600 dark:text-gray-400 text-xs">{parent.accountNameAm || "—"}</td>
          <td className="px-3 py-2 text-center">
            {parent.isHeader ? <span className="text-indigo-600 dark:text-indigo-400 text-xs font-semibold">Header</span> : <span className="text-gray-400 text-xs">Postable</span>}
          </td>
          <td className="px-3 py-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <button onClick={() => openEdit(parent)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="Edit">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDeactivate(parent.id)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Deactivate">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && parent.children.map(child => (
          <ChildRow key={child.id} acc={child} />
        ))}
      </React.Fragment>
    );
  };

  // ─── Type Section Component (like Budget Management) ──────────
  const TypeSection = ({ type }) => {
    const config = TYPE_CONFIG[type];
    const group = groupedByType[type];
    const expanded = expandedSections.has(type);

    if (group.totalCount === 0 && search) return null;

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(type)}
          className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold text-sm uppercase tracking-wide transition-colors ${config.color}`}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <BookOpen className="w-4 h-4" />
          {config.label} / {config.labelAm}
          <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${config.normalBalance === "DR" ? "bg-blue-200/60 text-blue-800 dark:bg-blue-800/40 dark:text-blue-300" : "bg-green-200/60 text-green-800 dark:bg-green-800/40 dark:text-green-300"}`}>
            {config.normalBalance}
          </span>
          <span className="ml-auto font-mono text-xs normal-case">
            {group.totalCount} account{group.totalCount !== 1 ? "s" : ""}
          </span>
        </button>
        {expanded && (
          <div className="border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/80">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[120px]">Code</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">Account Name</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 w-[160px]">Amharic</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[80px]">Role</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {group.accounts.map(parent => (
                  <ParentRow key={parent.id} parent={parent} />
                ))}
                {group.accounts.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-400 text-xs">{search ? "No matching accounts" : "No accounts in this category"}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" /> Chart of Accounts
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{accounts.length} accounts configured</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all">
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by code, name, or Amharic name..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {/* Grouped Accounts by Type */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
      ) : (
        ACCOUNT_TYPES.map(type => <TypeSection key={type} type={type} />)
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAccount ? "Edit Account" : "New Account"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Code *</label>
                  <input type="text" value={form.accountCode} onChange={(e) => setForm({ ...form, accountCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g. 1110" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Type *</label>
                  <select value={form.accountType} onChange={(e) => setForm({ ...form, accountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name (English) *</label>
                <input type="text" value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Name (Amharic)</label>
                <input type="text" value={form.accountNameAm} onChange={(e) => setForm({ ...form, accountNameAm: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Account</label>
                <select value={form.parentAccountId || ""} onChange={(e) => setForm({ ...form, parentAccountId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">None (Top Level)</option>
                  {headerAccounts.map(a => <option key={a.id} value={a.id}>{a.accountCode} - {a.accountName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isHeader} onChange={(e) => setForm({ ...form, isHeader: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Header Account (not for posting)</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">
                {editingAccount ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
