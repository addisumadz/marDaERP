"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import arifpayService from "@/app/lib/arifpayService";
import {
  CreditCard,
  Key,
  Lock,
  Globe,
  Building2,
  Landmark,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  Server,
  ExternalLink,
  Sparkles,
} from "lucide-react";

// Official Ethiopian Bank SWIFT/BIC codes supported by ArifPay Gateway
const ARIFPAY_SUPPORTED_BANKS = [
  { code: "CBETETAA", name: "Commercial Bank of Ethiopia (CBE)", short: "CBE" },
  { code: "AWINETAA", name: "Awash International Bank", short: "Awash" },
  { code: "ABYSETAA", name: "Bank of Abyssinia", short: "Abyssinia" },
  { code: "DASHETAA", name: "Dashen Bank", short: "Dashen" },
  { code: "CBORETAA", name: "Cooperative Bank of Oromia", short: "Coop / Coopay" },
  { code: "HIBRETAA", name: "Hibret Bank (United Bank)", short: "Hibret" },
  { code: "NIBIETAA", name: "Nib International Bank", short: "Nib" },
  { code: "WGINETAA", name: "Wegagen Bank", short: "Wegagen" },
  { code: "BUNAETAA", name: "Bunna International Bank", short: "Bunna" },
  { code: "BERHETAA", name: "Berhan Bank", short: "Berhan" },
  { code: "ABAYETAA", name: "Abay Bank", short: "Abay" },
  { code: "ENATETAA", name: "Enat Bank", short: "Enat" },
  { code: "TELEBIRR", name: "Telebirr SuperApp / Mobile Money", short: "Telebirr" },
];

export default function ArifpaySettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [customBankMode, setCustomBankMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: null,
    apiKey: "",
    merchantId: "",
    apiUrl: "https://gateway.arifpay.net/api/checkout/session",
    successUrl: "",
    cancelUrl: "",
    errorUrl: "",
    notifyUrl: "",
    beneficiaryBank: "CBETETAA",
    beneficiaryAccount: "",
    updatedAt: null,
  });

  // Track original loaded state for dirty-check / cancel
  const [originalData, setOriginalData] = useState(null);

  // Helper to normalize legacy bank names to SWIFT/BIC codes
  const normalizeBankCode = (val) => {
    if (!val) return "CBETETAA";
    const upper = String(val).trim().toUpperCase();
    if (upper === "COMMERCIAL BANK OF ETHIOPIA" || upper === "CBE") return "CBETETAA";
    if (upper.includes("AWASH")) return "AWINETAA";
    if (upper.includes("ABYSSINIA") || upper === "BOA") return "ABYSETAA";
    if (upper.includes("DASHEN")) return "DASHETAA";
    if (upper.includes("OROMIA") || upper.includes("COOP")) return "CBORETAA";
    if (upper.includes("HIBRET") || upper.includes("UNITED BANK")) return "HIBRETAA";
    if (upper.includes("NIB")) return "NIBIETAA";
    if (upper.includes("WEGAGEN")) return "WGINETAA";
    if (upper.includes("BUNNA")) return "BUNAETAA";
    if (upper.includes("BERHAN")) return "BERHETAA";
    if (upper.includes("ABAY")) return "ABAYETAA";
    if (upper.includes("ENAT")) return "ENATETAA";
    if (upper.includes("TELEBIRR")) return "TELEBIRR";
    return val;
  };

  // Fetch current config from backend
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await arifpayService.getConfig();
      if (data) {
        const normalizedBank = normalizeBankCode(data.beneficiaryBank);
        const resolved = {
          ...data,
          apiUrl: data.apiUrl || "https://gateway.arifpay.net/api/checkout/session",
          beneficiaryBank: normalizedBank,
        };
        setFormData(resolved);
        setOriginalData(resolved);

        // Check if bank code is custom (not in predefined list)
        const inList = ARIFPAY_SUPPORTED_BANKS.some((b) => b.code === normalizedBank);
        if (!inList && normalizedBank) {
          setCustomBankMode(true);
        }
      }
    } catch (err) {
      console.error("[ArifpaySetting] Failed to load config:", err);
      toast.error(err?.response?.data?.message || "Failed to load ArifPay settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.info(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Pre-fill Production Defaults
  const handleLoadProductionDefaults = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:9000";
    const beOrigin = origin.replace(":9000", ":9092");

    setFormData((prev) => ({
      ...prev,
      apiUrl: "https://gateway.arifpay.net/api/checkout/session",
      successUrl: `${origin}/ui/manager/payWithArifpay?status=success`,
      cancelUrl: `${origin}/ui/manager/payWithArifpay?status=cancel`,
      errorUrl: `${origin}/ui/manager/payWithArifpay?status=error`,
      notifyUrl: `${beOrigin}/api/mardaerp/payments/arifpay/callback`,
      beneficiaryBank: prev.beneficiaryBank || "CBETETAA",
    }));
    toast.info("Applied live production redirect and webhook URLs.");
  };

  // Discard changes
  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      toast.info("Reset to last saved configuration.");
    }
  };

  // Save changes
  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!formData.apiKey?.trim()) {
      toast.error("ArifPay Production API Key is required");
      return;
    }
    if (!formData.merchantId?.trim()) {
      toast.error("ArifPay Merchant ID is required");
      return;
    }
    if (!formData.apiUrl?.trim()) {
      toast.error("Gateway API URL is required");
      return;
    }
    if (!formData.beneficiaryBank?.trim()) {
      toast.error("Beneficiary Bank SWIFT/BIC Code is required");
      return;
    }
    if (!formData.beneficiaryAccount?.trim()) {
      toast.error("Beneficiary Settlement Account Number is required");
      return;
    }

    setSaving(true);
    try {
      const saved = await arifpayService.saveConfig(formData);
      setFormData(saved);
      setOriginalData(saved);
      toast.success("Live production ArifPay settings successfully saved!");
    } catch (err) {
      console.error("[ArifpaySetting] Save error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to save ArifPay configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedBankObj = useMemo(() => {
    return ARIFPAY_SUPPORTED_BANKS.find((b) => b.code === formData.beneficiaryBank);
  }, [formData.beneficiaryBank]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb pageName="ArifPay Production Settings" />

      {/* Header Banner - Strictly Production */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-500/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-400/30">
                <CreditCard className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  ArifPay Production Settings
                  <span className="text-xs font-normal text-indigo-300">
                    • የአሪፍፔይ የቀጥታ ምርት ማስተካከያ
                  </span>
                </h1>
                <p className="text-sm text-slate-300">
                  Configure live merchant API credentials, settlement destination bank accounts, and production webhook endpoints.
                </p>
              </div>
            </div>
          </div>

          {/* Environment Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE PRODUCTION GATEWAY</span>
            </div>

            <button
              onClick={fetchConfig}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/20 active:scale-95"
            >
              <RotateCcw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Live Gateway Callout */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-200 border border-emerald-500/20">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold text-emerald-300">
                Direct Hosted Checkout:
              </span>{" "}
              When cashiers initiate payments, MarDa ERP forwards payers directly to the official ArifPay checkout portal (
              <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300 font-mono">
                {formData.apiUrl || "https://gateway.arifpay.net/api/checkout/session"}
              </code>
              ). Payers choose their preferred method (Telebirr, CBE Birr, Awash Birr, cards) directly on ArifPay.
            </div>
          </div>
        </div>
      </div>

      {/* Quick Fill Action Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 text-sm dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Production Quick Setup:</span>
        </div>
        <button
          type="button"
          onClick={handleLoadProductionDefaults}
          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          <Zap className="h-3.5 w-3.5" />
          Apply Live Production URLs
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Card 1: API Gateway Credentials */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Key className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Live API Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authentication tokens issued by the official ArifPay Merchant Portal
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Live API Key (Header: x-arifpay-key){" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? "text" : "password"}
                    name="apiKey"
                    value={formData.apiKey || ""}
                    onChange={handleChange}
                    placeholder="Enter your live production API Key"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-20 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <div className="absolute right-2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title={showApiKey ? "Hide API Key" : "Show API Key"}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy(formData.apiKey, "API Key")}
                      className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Copy API Key"
                    >
                      {copiedField === "API Key" ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Issued under your ArifPay live production contract.
                </p>
              </div>

              {/* Merchant ID */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Merchant ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    name="merchantId"
                    value={formData.merchantId || ""}
                    onChange={handleChange}
                    placeholder="e.g. APMG:001084"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.merchantId, "Merchant ID")}
                    className="absolute right-2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy Merchant ID"
                  >
                    {copiedField === "Merchant ID" ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Your official registered ArifPay merchant identifier.
                </p>
              </div>

              {/* Gateway API URL (Locked to production) */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Production Gateway Checkout Endpoint{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    name="apiUrl"
                    value={formData.apiUrl || "https://gateway.arifpay.net/api/checkout/session"}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.apiUrl, "API URL")}
                    className="absolute right-2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy Gateway Endpoint"
                  >
                    {copiedField === "API URL" ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Standard production session endpoint:{" "}
                  <code className="text-indigo-600 dark:text-indigo-400">
                    https://gateway.arifpay.net/api/checkout/session
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Settlement Bank Account & SWIFT/BIC Code (Reference) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Landmark className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Merchant Settlement Account (Reference)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your registered bank account on file with ArifPay where collected utility revenues are settled
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Beneficiary Bank Code Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Settlement Bank (SWIFT/BIC Code){" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomBankMode(!customBankMode)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {customBankMode ? "Choose from List" : "Enter Custom Code"}
                  </button>
                </div>

                {!customBankMode ? (
                  <select
                    name="beneficiaryBank"
                    value={formData.beneficiaryBank || "CBETETAA"}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                    required
                  >
                    {ARIFPAY_SUPPORTED_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    name="beneficiaryBank"
                    value={formData.beneficiaryBank || ""}
                    onChange={handleChange}
                    placeholder="Enter ArifPay SWIFT/BIC code (e.g. CBETETAA)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                )}

                {/* Selected Bank Confirmation Badge */}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Selected Code:</span>
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {formData.beneficiaryBank || "Not selected"}
                  </span>
                  {selectedBankObj && (
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      • {selectedBankObj.short}
                    </span>
                  )}
                </div>
              </div>

              {/* Beneficiary Account Number */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Beneficiary Account Number{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryAccount"
                  value={formData.beneficiaryAccount || ""}
                  onChange={handleChange}
                  placeholder="e.g. 1000123456789"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  The verified bank account registered with your ArifPay merchant onboarding contract.
                </p>
              </div>

              {/* Settlement Callout */}
              <div className="rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  Direct Merchant Settlement
                </div>
                In standard C2B utility collections, customer payments are automatically deposited into your ArifPay-registered bank account. Customers freely select their payment channel (CBE, Telebirr, Awash, Card) directly on the official ArifPay portal.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Redirect URLs (Browser Experience) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <Globe className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Browser Redirect & Return URLs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where the payer is redirected once payment is completed, cancelled, or declined on ArifPay
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Success URL */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Success Return URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                name="successUrl"
                value={formData.successUrl || ""}
                onChange={handleChange}
                placeholder="http://.../payWithArifpay?status=success"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> ArifPay appends ?sessionId=...
              </p>
            </div>

            {/* Cancel URL */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Cancel Return URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                name="cancelUrl"
                value={formData.cancelUrl || ""}
                onChange={handleChange}
                placeholder="http://.../payWithArifpay?status=cancel"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Returns if user clicks Cancel on checkout
              </p>
            </div>

            {/* Error URL */}
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Error Return URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                name="errorUrl"
                value={formData.errorUrl || ""}
                onChange={handleChange}
                placeholder="http://.../payWithArifpay?status=error"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Returns on card/bank gateway decline
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Webhook Notification (Server-to-Server) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <Server className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Server Webhook Notification Callback URL (notifyUrl)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ArifPay backend asynchronously dispatches transaction confirmations to this endpoint
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Public Endpoint
            </span>
          </div>

          <div className="space-y-3">
            <div className="relative flex items-center">
              <input
                type="url"
                name="notifyUrl"
                value={formData.notifyUrl || ""}
                onChange={handleChange}
                placeholder="http://YOUR_PUBLIC_DOMAIN:9092/api/mardaerp/payments/arifpay/callback"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="button"
                onClick={() => handleCopy(formData.notifyUrl, "Webhook URL")}
                className="absolute right-2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Copy Webhook Callback URL"
              >
                {copiedField === "Webhook URL" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl bg-violet-50/70 p-3 text-xs text-violet-800 dark:bg-violet-950/30 dark:text-violet-200 border border-violet-100 dark:border-violet-900/40">
              <Info className="h-4 w-4 shrink-0 text-violet-500 mt-0.5" />
              <div>
                <strong>Webhook Routing:</strong> The Spring Boot backend permits incoming HTTP POST calls at{" "}
                <code className="bg-violet-100 dark:bg-violet-900/60 px-1 py-0.5 rounded font-mono">
                  /api/mardaerp/payments/arifpay/callback
                </code>{" "}
                without session cookies so ArifPay can post real-time receipt confirmations. In production, ensure this URL resolves through your public domain or reverse proxy.
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {formData.updatedAt && (
              <span>
                Last saved:{" "}
                <strong className="text-slate-700 dark:text-slate-300">
                  {new Date(formData.updatedAt).toLocaleString()}
                </strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Discard Changes
            </button>

            <button
              type="submit"
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Production Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
