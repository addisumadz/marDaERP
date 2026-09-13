"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncBillingAccountMapService from "../../../lib/fncBillingAccountMapService";
import fncAccountService from "../../../lib/fncAccountService";
import { Settings, Save, Loader2, BookOpen, TrendingUp, TrendingDown } from "lucide-react";

// ── Bill Preparation mapping keys (BP_ prefix) ──
// Each charge type has a DEBIT (receivable asset) and CREDIT (revenue/liability) pair
const BP_MAPPINGS = [
  {
    chargeKey: "WATER_CONSUMPTION",
    label: "የውሃ ፍጆታ ብር (Current Month Water consumption)",
    labelAm: "የውሃ ፍጆታ ብር",
    dbField: "yezihWerFjotaKfya",
    drKey: "BP_DR_WATER_CONSUMPTION",
    crKey: "BP_CR_WATER_CONSUMPTION",
    drDesc: "1222-0006 — Current Month Water consumption",
    crDesc: "4001-0005 — Current Month Water consumption",
    crType: "REVENUE",
  },
  {
    chargeKey: "METER_RENT",
    label: "ቆጣሪ ኪራይ (Meter Rent)",
    labelAm: "ቆጣሪ ኪራይ",
    dbField: "kotariKiray",
    drKey: "BP_DR_METER_RENT",
    crKey: "BP_CR_METER_RENT",
    drDesc: "1222-0007 — Meter Rent",
    crDesc: "4001-0006 — Meter Rent",
    crType: "REVENUE",
  },
  {
    chargeKey: "ADDITIONAL_CHARGE",
    label: "ተጨማሪ ክፍያ (Bill Additional Payment)",
    labelAm: "ተጨማሪ ክፍያ",
    dbField: "techemariKfya",
    drKey: "BP_DR_ADDITIONAL_CHARGE",
    crKey: "BP_CR_ADDITIONAL_CHARGE",
    drDesc: "1222-0008 — Bill Additional Payment",
    crDesc: "4001-0007 — Bill Additional Payment",
    crType: "REVENUE",
  },
  {
    chargeKey: "WUZIF_CONSUMPTION",
    label: "ውዝፍ ፍጆታ ክፍያ (Arrears Water Consumption)",
    labelAm: "ውዝፍ ፍጆታ ክፍያ",
    dbField: "wuzifFjotaKfya",
    drKey: "BP_DR_WUZIF_CONSUMPTION",
    crKey: "BP_CR_WUZIF_CONSUMPTION",
    drDesc: "1222-0009 — Arrears Water Consumption",
    crDesc: "4001-0008 — Arrears Water Consumption",
    crType: "REVENUE",
  },
  {
    chargeKey: "WUZIF_METER_RENT",
    label: "ውዝፍ ቆጣሪ ኪራይ (Arrears Meter rent)",
    labelAm: "ውዝፍ ቆጣሪ ኪራይ",
    dbField: "wuzifKotariKiray",
    drKey: "BP_DR_WUZIF_METER_RENT",
    crKey: "BP_CR_WUZIF_METER_RENT",
    drDesc: "1222-0010 — Arrears Meter rent",
    crDesc: "4001-0009 — Arrears Meter rent",
    crType: "REVENUE",
  },
  {
    chargeKey: "WUZIF_ADDITIONAL",
    label: "ውዝፍ ተጨማሪ ክፍያ (Arrears Bill Additional Payment)",
    labelAm: "ውዝፍ ተጨማሪ ክፍያ",
    dbField: "wuzifTechemariKfya",
    drKey: "BP_DR_WUZIF_ADDITIONAL",
    crKey: "BP_CR_WUZIF_ADDITIONAL",
    drDesc: "1222-0011 — Arrears Bill Additional Payment",
    crDesc: "4001-0010 — Arrears Bill Additional Payment",
    crType: "REVENUE",
  },
  {
    chargeKey: "PENALTY",
    label: "ቅጣት (Bill Penalty)",
    labelAm: "ቅጣት",
    dbField: "kitat",
    drKey: "BP_DR_PENALTY",
    crKey: "BP_CR_PENALTY",
    drDesc: "1222-0012 — Bill Penalty",
    crDesc: "4001-0011 — Bill Penalty",
    crType: "REVENUE",
  },
  {
    chargeKey: "CARRIED_FORWARD",
    label: "የተላለፈ(ነባር) ውዝፍ (Bill Old system Arrears)",
    labelAm: "የተላለፈ(ነባር) ውዝፍ",
    dbField: "wuzifHisab - (wuzifKotariKiray + wuzifFjotaKfya + wuzifDerekKoshasha + wuzifTechemariKfya)",
    drKey: "BP_DR_CARRIED_FORWARD",
    crKey: "BP_CR_CARRIED_FORWARD",
    drDesc: "1222-0013 — Bill Old system Arrears",
    crDesc: "4001-0012 — Bill Old system Arrears",
    crType: "REVENUE",
  },
  {
    chargeKey: "SERVICE_CHARGE",
    label: "የአገልግሎት ክፍያ (Bill Service Charge)",
    labelAm: "የአገልግሎት ክፍያ",
    dbField: "billing_additional_payment_1_value",
    drKey: "BP_DR_SERVICE_CHARGE",
    crKey: "BP_CR_SERVICE_CHARGE",
    drDesc: "1222-0014 — Bill Service Charge",
    crDesc: "4001-0013 — Bill Service Charge",
    crType: "REVENUE",
  },
  {
    chargeKey: "WASTE_CHARGE",
    label: "የዚህ ወር ደረቅ ቆሻሻ (Dry Wast)",
    labelAm: "ደረቅ ቆሻሻ",
    dbField: "additionalHisab",
    drKey: "BP_DR_WASTE_CHARGE",
    crKey: "BP_CR_WASTE_CHARGE",
    drDesc: "1222-0015 — Dry Wast",
    crDesc: "2005-0004 — Dry Wast",
    crType: "LIABILITY",
  },
  {
    chargeKey: "SCHOOL_FEEDING",
    label: "የትምህርት ቤት ምገባ (School Feeding)",
    labelAm: "የትምህርት ቤት ምገባ",
    dbField: "billing_additional_payment_2_value",
    drKey: "BP_DR_SCHOOL_FEEDING",
    crKey: "BP_CR_SCHOOL_FEEDING",
    drDesc: "1222-0016 — School Feeding",
    crDesc: "2005-0005 — School Feeding",
    crType: "LIABILITY",
  },
  {
    chargeKey: "WUZIF_SERVICE_CHARGE",
    label: "ውዝፍ የአገልግሎት ክፍያ (Arrears Bill Service Charge)",
    labelAm: "ውዝፍ የአገልግሎት ክፍያ",
    dbField: "billing_additional_payment_1_wuzif",
    drKey: "BP_DR_WUZIF_SERVICE_CHARGE",
    crKey: "BP_CR_WUZIF_SERVICE_CHARGE",
    drDesc: "1222-0017 — Arrears Bill Service Charge",
    crDesc: "2005-0006 — Arrears Bill Service Charge",
    crType: "LIABILITY",
  },
  {
    chargeKey: "WUZIF_WASTE",
    label: "ውዝፍ ደረቅ ቆሻሻ (Arrears Dry Wast)",
    labelAm: "ውዝፍ ደረቅ ቆሻሻ",
    dbField: "wuzifDerekKoshasha",
    drKey: "BP_DR_WUZIF_WASTE",
    crKey: "BP_CR_WUZIF_WASTE",
    drDesc: "1222-0018 — Arrears Dry Wast",
    crDesc: "2005-0007 — Arrears Dry Wast",
    crType: "LIABILITY",
  },
  {
    chargeKey: "WUZIF_SCHOOL_FEEDING",
    label: "ውዝፍ የትምህርት ቤት ምገባ (Arrears School Feeding)",
    labelAm: "ውዝፍ የትምህርት ቤት ምገባ",
    dbField: "billing_additional_payment_2_wuzif",
    drKey: "BP_DR_WUZIF_SCHOOL_FEEDING",
    crKey: "BP_CR_WUZIF_SCHOOL_FEEDING",
    drDesc: "1222-0019 — Arrears School Feeding",
    crDesc: "2005-0008 — Arrears School Feeding",
    crType: "LIABILITY",
  },
];

export default function FncBillPrepAccountMapPage() {
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

      // Build mappings object — only BP_ keys
      const map = {};
      if (Array.isArray(savedMappings)) {
        savedMappings.forEach(m => {
          if (m.mappingKey && m.mappingKey.startsWith("BP_")) {
            map[m.mappingKey] = m.accountId;
          }
        });
      }
      setMappings(map);
    } catch (e) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const updateMapping = (key, accountId) => {
    setMappings(prev => ({ ...prev, [key]: accountId ? Number(accountId) : null }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const mappingArray = Object.entries(mappings)
        .filter(([, accountId]) => accountId)
        .map(([mappingKey, accountId]) => {
          const bp = BP_MAPPINGS.find(b => b.drKey === mappingKey || b.crKey === mappingKey);
          const isDr = mappingKey.includes("_DR_");
          return {
            mappingKey,
            accountId,
            label: bp ? `${isDr ? "DR" : "CR"}: ${bp.label}` : mappingKey,
          };
        });
      await fncBillingAccountMapService.saveMappings(mappingArray);
      toast.success("Bill Preparation mappings saved successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error saving mappings");
    }
    setSaving(false);
  };

  const assetAccounts = accounts.filter(a => a.accountType === "ASSET");
  const revenueAccounts = accounts.filter(a => a.accountType === "REVENUE");
  const expenseAccounts = accounts.filter(a => a.accountType === "EXPENSE");
  const liabilityAccounts = accounts.filter(a => a.accountType === "LIABILITY");

  const renderDropdown = (mappingKey, accountList) => (
    <select
      value={mappings[mappingKey] || ""}
      onChange={(e) => updateMapping(mappingKey, e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
    >
      <option value="">— Select Account —</option>
      {accountList.map(a => (
        <option key={a.id} value={a.id}>{a.accountCode} — {a.accountName}</option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Count configured vs total
  const totalKeys = BP_MAPPINGS.length * 2; // DR + CR for each
  const configuredKeys = Object.values(mappings).filter(v => v).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-teal-600" /> Bill Preparation — Account Mapping
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Step 1: Map each billing charge to its Receivable (DR) and Revenue (CR) accounts for Bill Preparation journal entries.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {configuredKeys} / {totalKeys} mappings configured
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Mappings"}
        </button>
      </div>

      {/* Info box */}
      <div className="bg-teal-50 dark:bg-teal-900/10 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-sm text-teal-800 dark:text-teal-300">
        <strong>How it works:</strong> When you push "Bill Preparation" on the Bill-to-Journal page, each charge type creates a paired journal line:
        <strong> DR</strong> (Receivable sub-account) / <strong>CR</strong> (Revenue account) — giving full detail on both sides.
      </div>

      {/* Mapping Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/20 dark:to-green-900/20 border-b border-teal-200 dark:border-teal-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h2 className="font-bold text-teal-800 dark:text-teal-300">Bill Preparation — DR / CR Account Pairs</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 w-8">#</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Charge Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">DB Field</th>
                <th className="text-left px-4 py-3 font-semibold text-blue-700 dark:text-blue-300 min-w-[280px]">
                  <span className="flex items-center gap-1"><TrendingDown className="w-4 h-4" /> Debit — Receivable (ASSET)</span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-green-700 dark:text-green-300 min-w-[280px]">
                  <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Credit — Revenue / Liability</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {BP_MAPPINGS.map((bp, idx) => (
                <tr key={bp.chargeKey} className={`border-b border-gray-100 dark:border-gray-700 ${idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-750"}`}>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900 dark:text-white">{bp.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{bp.dbField}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">DR — {bp.drDesc}</span>
                      {renderDropdown(bp.drKey, assetAccounts)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">CR ({bp.crType || "REVENUE"}) — {bp.crDesc}</span>
                      {renderDropdown(bp.crKey, bp.crType === "LIABILITY" ? liabilityAccounts : revenueAccounts)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
        <strong>Note:</strong> These mappings are used exclusively by the "Bill Preparation (Step 1)" push on the Bill-to-Journal page.
        Each row creates a paired journal line: <strong>DR Receivable / CR Revenue or Liability</strong> for the charge amount.
        Make sure both DR and CR are configured for each charge type before pushing.
      </div>
    </div>
  );
}
