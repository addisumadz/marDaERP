"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fncBillingAccountMapService from "../../../lib/fncBillingAccountMapService";
import fncAccountService from "../../../lib/fncAccountService";
import { BillingBanksService } from "../../../lib/billingBanksService";
import { Settings, Save, Loader2, Landmark, Info } from "lucide-react";

const billingBanksService = new BillingBanksService();

// Fixed mapping keys — Debit Side (Payment Location accounts only)
const FIXED_MAPPINGS = [
  { key: "OFFICE_CASH", label: "Office Cash Account (ቢሮ ጥሬ ገንዘብ)", type: "ASSET", description: "Cash collected at the front office cashier" },
  { key: "PREPAID_ACCOUNT", label: "Prepaid/Credit Account", type: "ASSET", description: "Customer prepaid/credit balances" },
];

const TYPE_BADGE = {
  ASSET: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
};

export default function FncBillingAccountMapPage() {
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [mappings, setMappings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [accs, savedMappings, banksData] = await Promise.all([
        fncAccountService.getPostableAccounts(),
        fncBillingAccountMapService.getAllMappings().catch(() => []),
        billingBanksService.getAllBillingBanks().then(r => Array.isArray(r?.data) ? r.data : (Array.isArray(r) ? r : [])).catch(() => []),
      ]);
      setAccounts(accs || []);
      setBanks(banksData || []);

      // Build mappings object from saved data (exclude BP_ keys — those belong to Bill Prep page)
      const map = {};
      if (Array.isArray(savedMappings)) {
        savedMappings.forEach(m => {
          if (m.mappingKey && !m.mappingKey.startsWith("BP_")) {
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
          const fixed = FIXED_MAPPINGS.find(f => f.key === mappingKey);
          return {
            mappingKey,
            accountId,
            label: fixed?.label || `Bank: ${mappingKey}`,
          };
        });
      await fncBillingAccountMapService.saveMappings(mappingArray);
      toast.success("Mappings saved successfully");
    } catch (e) {
      toast.error(e.response?.data?.message || "Error saving mappings");
    }
    setSaving(false);
  };

  const assetAccounts = accounts.filter(a => a.accountType === "ASSET");

  const renderDropdown = (mappingKey) => (
    <select
      value={mappings[mappingKey] || ""}
      onChange={(e) => updateMapping(mappingKey, e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
    >
      <option value="">— Select Account —</option>
      {assetAccounts.map(a => (
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

  const totalKeys = FIXED_MAPPINGS.length + banks.length;
  const configuredKeys = Object.values(mappings).filter(v => v).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-indigo-600" /> Collection Account Mapping
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Step 2/3: Map payment locations to their ASSET accounts (where collected cash is received).
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {configuredKeys} / {totalKeys} mappings configured
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save All Mappings"}
        </button>
      </div>

      {/* How it works */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-sm text-indigo-800 dark:text-indigo-300">
        <strong className="flex items-center gap-1 mb-1"><Info className="w-4 h-4" /> How Collection Entries Work:</strong>
        When you push a payment location on the Bill-to-Journal page, the system creates:<br />
        <strong>DR</strong> → The ASSET account mapped below (cash received) <br />
        <strong>CR</strong> → The Receivable sub-accounts from <strong>Bill Prep Account Map</strong> (clears the A/R created in Step 1)
      </div>

      {/* Payment Location Accounts (ASSET) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 flex items-center gap-2">
          <Landmark className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-blue-800 dark:text-blue-300">Payment Location — Cash Accounts (ASSET)</h2>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Map each payment collection method to its corresponding ASSET account. These are the <strong>DEBIT</strong> accounts for collection journal entries.
          </p>

          {/* Fixed: Office and Prepaid */}
          {FIXED_MAPPINGS.map(mapping => (
            <div key={mapping.key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              <div>
                <span className="font-medium text-gray-900 dark:text-white text-sm">{mapping.label}</span>
                <p className="text-xs text-gray-400">{mapping.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_BADGE.ASSET}`}>ASSET</span>
              </div>
              <div>{renderDropdown(mapping.key)}</div>
            </div>
          ))}

          {/* Dynamic: Bank accounts */}
          {banks.length > 0 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bank / Agent Payment Accounts</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Each bank/agent where customers pay their bills. Map to the corresponding Cash at Bank ASSET account.
                </p>
              </div>
              {banks.map(bank => {
                const key = `BANK_${bank.id || bank.bankCode}`;
                return (
                  <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{bank.bankName}</span>
                      <p className="text-xs text-gray-400">Bank Code: {bank.bankCode || bank.gatewayCode || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${TYPE_BADGE.ASSET}`}>ASSET</span>
                    </div>
                    <div>{renderDropdown(key)}</div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-300">
        <strong>Note:</strong> These mappings are used by the "Bill to Journal" page for the <strong>DEBIT</strong> side of collection entries (Steps 2/3).
        The <strong>CREDIT</strong> side (Receivable accounts) is configured separately in the <strong>Bill Prep Account Map</strong> settings page.
      </div>
    </div>
  );
}
