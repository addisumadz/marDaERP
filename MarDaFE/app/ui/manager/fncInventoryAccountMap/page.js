"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncBillingAccountMapService from "../../../lib/fncBillingAccountMapService";
import fncAccountService from "../../../lib/fncAccountService";
import {
  Settings,
  Save,
  Loader2,
  BookOpen,
  TrendingUp,
  TrendingDown,
  PackageCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// ── Inventory transaction events & mapping key pairs (INV_ prefix) ──
const INV_MAPPINGS = [
  {
    eventKey: "GRN_RECEIPT",
    label: "የዕቃ መቀበያ ሰነድ (GRN Stock Intake)",
    labelAm: "የዕቃ መቀበያ ሰነድ",
    description: "Posted when Goods Received Note (GRN) is confirmed after vendor delivery",
    drKey: "INV_DR_GRN_ASSET",
    crKey: "INV_CR_GRN_PAYABLE",
    drDesc: "1300 — Inventory Asset (የዕቃ ንብረት ሂሳብ)",
    crDesc: "2100 — Accounts Payable / GR-IR (የሚከፈል እዳ)",
    drDefaultCode: "1300",
    crDefaultCode: "2100",
    drAccountType: "ASSET",
    crAccountType: "LIABILITY",
  },
  {
    eventKey: "INTERNAL_ISSUE",
    label: "የዕቃ ወጪ ሰነድ (Store Issue / Dept Consumption)",
    labelAm: "የዕቃ ወጪ ሰነድ",
    description: "Posted when items are issued to internal branch departments or projects",
    drKey: "INV_DR_ISSUE_EXPENSE",
    crKey: "INV_CR_ISSUE_ASSET",
    drDesc: "6200 — Operating Supplies Expense (የስራ ማስኬጃ ዕቃዎች ወጪ)",
    crDesc: "1300 — Inventory Asset (የዕቃ ንብረት ሂሳብ)",
    drDefaultCode: "6200",
    crDefaultCode: "1300",
    drAccountType: "EXPENSE",
    crAccountType: "ASSET",
  },
  {
    eventKey: "INVENTORY_SALE",
    label: "የዕቃ ሽያጭ / ወጪ (Customer Sale & COGS)",
    labelAm: "የዕቃ ሽያጭ",
    description: "Posted for commercial customer sales, fittings, or commercial dispatches",
    drKey: "INV_DR_SALE_COGS",
    crKey: "INV_CR_SALE_ASSET",
    drDesc: "5100 — Cost of Goods Sold / COGS (የተሸጡ ዕቃዎች ወጪ)",
    crDesc: "1300 — Inventory Asset (የዕቃ ንብረት ሂሳብ)",
    drDefaultCode: "5100",
    crDefaultCode: "1300",
    drAccountType: "EXPENSE",
    crAccountType: "ASSET",
  },
  {
    eventKey: "ADJUST_GAIN",
    label: "የዕቃ ቆጠራ ትርፍ ማስተካከያ (Stock Adjustment — Surplus / Gain)",
    labelAm: "የዕቃ ቆጠራ ትርፍ",
    description: "Posted when physical audit count reveals higher stock than system balance",
    drKey: "INV_DR_ADJUST_GAIN_ASSET",
    crKey: "INV_CR_ADJUST_GAIN_REV",
    drDesc: "1300 — Inventory Asset (የዕቃ ንብረት ሂሳብ)",
    crDesc: "6300 — Inventory Gain / Variance (የዕቃ ማስተካከያ ትርፍ)",
    drDefaultCode: "1300",
    crDefaultCode: "6300",
    drAccountType: "ASSET",
    crAccountType: "REVENUE",
  },
  {
    eventKey: "ADJUST_LOSS",
    label: "የዕቃ ቆጠራ ጉድለት/ብልሽት (Stock Adjustment — Loss / Write-off)",
    labelAm: "የዕቃ ቆጠራ ጉድለት/ብልሽት",
    description: "Posted when physical count reveals shortage, damaged, or expired stock",
    drKey: "INV_DR_ADJUST_LOSS_EXP",
    crKey: "INV_CR_ADJUST_LOSS_ASSET",
    drDesc: "6300 — Inventory Loss / Shrinkage (የዕቃ ብልሽት/ኪሳራ ወጪ)",
    crDesc: "1300 — Inventory Asset (የዕቃ ንብረት ሂሳብ)",
    drDefaultCode: "6300",
    crDefaultCode: "1300",
    drAccountType: "EXPENSE",
    crAccountType: "ASSET",
  },
  {
    eventKey: "STORE_TRANSFER",
    label: "የዕቃ መጋዘን ዝውውር (Inter-Store Transfer / In-Transit)",
    labelAm: "የዕቃ መጋዘን ዝውውር",
    description: "Posted during transfer of stock between branch stores or central warehouse",
    drKey: "INV_DR_TRANSFER_ASSET",
    crKey: "INV_CR_TRANSFER_ASSET",
    drDesc: "1301 — In-Transit / Destination Store (ተቀባይ መጋዘን)",
    crDesc: "1300 — Source Store Asset (አውጪ መጋዘን)",
    drDefaultCode: "1301",
    crDefaultCode: "1300",
    drAccountType: "ASSET",
    crAccountType: "ASSET",
  },
];

export default function FncInventoryAccountMapPage() {
  const [accounts, setAccounts] = useState([]);
  const [mappings, setMappings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, savedMappings] = await Promise.all([
        fncAccountService.getPostableAccounts(),
        fncBillingAccountMapService.getAllMappings().catch(() => []),
      ]);
      setAccounts(accs || []);

      // Build mappings object — only INV_ keys
      const map = {};
      if (Array.isArray(savedMappings)) {
        savedMappings.forEach((m) => {
          if (m.mappingKey && m.mappingKey.startsWith("INV_")) {
            map[m.mappingKey] = m.accountId;
          }
        });
      }
      setMappings(map);
    } catch (e) {
      toast.error("Failed to load account mapping data");
    }
    setLoading(false);
  };

  const updateMapping = (key, accountId) => {
    setMappings((prev) => ({ ...prev, [key]: accountId ? Number(accountId) : null }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const mappingArray = Object.entries(mappings)
        .filter(([, accountId]) => accountId)
        .map(([mappingKey, accountId]) => {
          const inv = INV_MAPPINGS.find((b) => b.drKey === mappingKey || b.crKey === mappingKey);
          const isDr = mappingKey.includes("_DR_");
          return {
            mappingKey,
            accountId,
            label: inv ? `${isDr ? "DR" : "CR"}: ${inv.label}` : mappingKey,
          };
        });

      await fncBillingAccountMapService.saveMappings(mappingArray);
      toast.success("Inventory Chart of Accounts mappings saved successfully!");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error saving inventory account mappings");
    }
    setSaving(false);
  };

  // Quick helper to match accounts by default code
  const autoMatchDefaults = () => {
    const updated = { ...mappings };
    let matchedCount = 0;

    INV_MAPPINGS.forEach((inv) => {
      if (!updated[inv.drKey] && inv.drDefaultCode) {
        const found = accounts.find(
          (a) => a.accountCode === inv.drDefaultCode || a.accountCode.startsWith(inv.drDefaultCode)
        );
        if (found) {
          updated[inv.drKey] = found.id;
          matchedCount++;
        }
      }
      if (!updated[inv.crKey] && inv.crDefaultCode) {
        const found = accounts.find(
          (a) => a.accountCode === inv.crDefaultCode || a.accountCode.startsWith(inv.crDefaultCode)
        );
        if (found) {
          updated[inv.crKey] = found.id;
          matchedCount++;
        }
      }
    });

    setMappings(updated);
    if (matchedCount > 0) {
      toast.info(`Auto-matched ${matchedCount} account(s) using standard chart codes`);
    } else {
      toast.info("No unmapped standard codes found in active accounts");
    }
  };

  // Accounts grouped by category
  const assetAccounts = accounts.filter((a) => a.accountType === "ASSET");
  const liabilityAccounts = accounts.filter((a) => a.accountType === "LIABILITY");
  const expenseAccounts = accounts.filter((a) => a.accountType === "EXPENSE");
  const revenueAccounts = accounts.filter((a) => a.accountType === "REVENUE");

  const getAccountListForType = (type) => {
    if (type === "ASSET") return assetAccounts;
    if (type === "LIABILITY") return liabilityAccounts;
    if (type === "EXPENSE") return expenseAccounts;
    if (type === "REVENUE") return revenueAccounts;
    return accounts;
  };

  const renderDropdown = (mappingKey, expectedType, placeholderDesc) => {
    const accountList = getAccountListForType(expectedType);
    const selectedId = mappings[mappingKey];
    const selectedAcc = accounts.find((a) => a.id === selectedId);

    return (
      <div className="space-y-1">
        <select
          value={selectedId || ""}
          onChange={(e) => updateMapping(mappingKey, e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg text-sm transition-all ${
            selectedId
              ? "border-blue-400 dark:border-blue-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-500"
          }`}
        >
          <option value="">— Select {expectedType} Account ({placeholderDesc}) —</option>
          {accountList.map((a) => (
            <option key={a.id} value={a.id}>
              {a.accountCode} — {a.accountName} {a.accountNameAm ? `(${a.accountNameAm})` : ""}
            </option>
          ))}
        </select>
        {selectedAcc && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              Configured: <strong>{selectedAcc.accountCode}</strong> &bull; {selectedAcc.accountName}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
        <p className="text-sm text-gray-500">Loading Chart of Accounts & Inventory Mappings...</p>
      </div>
    );
  }

  // Count configured vs total
  const totalKeys = INV_MAPPINGS.length * 2; // DR + CR for each
  const configuredKeys = Object.values(mappings).filter((v) => v).length;
  const isFullyConfigured = configuredKeys === totalKeys;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/40 rounded-lg text-teal-700 dark:text-teal-300">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inventory — Chart of Accounts Mapping
              </h1>
              <p className="text-xs font-amharic text-gray-500 dark:text-gray-400">
                የዕቃ አስተዳደር የሂሳብ መደቦች ማስተካከያ (General Ledger Integration)
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Map each inventory transaction event to its General Ledger Debit (DR) and Credit (CR) accounts for automatic journal voucher posting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={autoMatchDefaults}
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-all"
            title="Auto-match using standard account codes (1300, 2100, 5100, 6200, 6300)"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Auto-Match Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md transition-all disabled:opacity-50 font-medium text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving Mappings..." : "Save All Mappings"}
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Postable Accounts Available</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{accounts.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Configured Mappings</div>
            <div className="text-xl font-bold text-teal-600 dark:text-teal-400">
              {configuredKeys} <span className="text-sm font-normal text-gray-400">/ {totalKeys}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-3">
          <div
            className={`p-3 rounded-lg ${
              isFullyConfigured
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"
                : "bg-amber-50 dark:bg-amber-900/30 text-amber-600"
            }`}
          >
            {isFullyConfigured ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Integration Status</div>
            <div
              className={`text-sm font-bold ${
                isFullyConfigured ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
              }`}
            >
              {isFullyConfigured ? "Fully Configured" : `${totalKeys - configuredKeys} unmapped (using defaults)`}
            </div>
          </div>
        </div>
      </div>

      {/* Info Explainer */}
      <div className="bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-sm text-teal-900 dark:text-teal-200 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>How Inventory & General Ledger Integration Works:</span>
        </div>
        <p className="text-xs text-teal-800 dark:text-teal-300 leading-relaxed">
          Whenever a store transaction occurs (e.g., confirming a <strong>Goods Received Note</strong>, issuing stock to internal departments, or posting physical inventory adjustments), the system creates a balanced double-entry journal voucher using these mapped accounts.
          If an account mapping is left unselected, the backend automatically uses standard chart defaults (<code className="bg-teal-100 dark:bg-teal-800/40 px-1 py-0.5 rounded">1300</code>, <code className="bg-teal-100 dark:bg-teal-800/40 px-1 py-0.5 rounded">2100</code>, etc.).
        </p>
      </div>

      {/* Mapping Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 border-b border-teal-200 dark:border-teal-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <h2 className="font-bold text-teal-900 dark:text-teal-200">
              Inventory Transaction &mdash; DR / CR Account Pairs
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-teal-100 dark:bg-teal-800/40 text-teal-800 dark:text-teal-300 rounded-full">
            {INV_MAPPINGS.length} Transaction Types
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600 text-xs uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-10">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 min-w-[240px]">
                  Transaction Event / Type
                </th>
                <th className="text-left px-4 py-3 font-semibold text-blue-700 dark:text-blue-300 min-w-[320px]">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-4 h-4 text-blue-600" /> Debit (DR) Account
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-300 min-w-[320px]">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> Credit (CR) Account
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {INV_MAPPINGS.map((inv, idx) => (
                <tr
                  key={inv.eventKey}
                  className={`${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/40 dark:bg-gray-750"} hover:bg-blue-50/30 dark:hover:bg-gray-700/40 transition-colors`}
                >
                  <td className="px-4 py-4 text-gray-400 font-mono text-xs align-top">{idx + 1}</td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {inv.label}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{inv.description}</p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 font-mono">
                        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {inv.drKey}
                        </span>
                        <ArrowRight className="w-3 h-3 text-gray-400" />
                        <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {inv.crKey}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                          DR ({inv.drAccountType})
                        </span>
                        <span className="text-gray-400">Default: {inv.drDefaultCode}</span>
                      </div>
                      {renderDropdown(inv.drKey, inv.drAccountType, inv.drDesc)}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          CR ({inv.crAccountType})
                        </span>
                        <span className="text-gray-400">Default: {inv.crDefaultCode}</span>
                      </div>
                      {renderDropdown(inv.crKey, inv.crAccountType, inv.crDesc)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
