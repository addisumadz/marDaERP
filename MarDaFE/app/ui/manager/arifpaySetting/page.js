"use client";

import { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  ShieldCheck,
  Zap,
  Info,
  Server,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function ArifpaySettingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

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
    beneficiaryBank: "Commercial Bank of Ethiopia",
    beneficiaryAccount: "",
    updatedAt: null,
  });

  // Track original loaded state for dirty-check / cancel
  const [originalData, setOriginalData] = useState(null);

  // Popular Ethiopian banks for 1-click select
  const bankPresets = [
    "Commercial Bank of Ethiopia",
    "Awash Bank",
    "Dashen Bank",
    "Bank of Abyssinia",
    "Cooperative Bank of Oromia",
    "Hibret Bank",
    "Telebirr",
  ];

  // Fetch current config from backend
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const data = await arifpayService.getConfig();
      if (data) {
        setFormData(data);
        setOriginalData(data);
      }
    } catch (err) {
      console.error("[ArifpaySetting] Failed to load config:", err);
      toast.error(
        err?.response?.data?.message || "Failed to load ArifPay settings"
      );
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

  const isMockMode =
    !formData.apiKey || formData.apiKey === "test_api_key_123456789";

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
      beneficiaryBank: prev.beneficiaryBank || "Commercial Bank of Ethiopia",
    }));
    toast.info("Applied production URL defaults. Enter your live API Key & Merchant ID.");
  };

  // Pre-fill Sandbox Defaults
  const handleLoadSandboxDefaults = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost:9000";
    const beOrigin = origin.replace(":9000", ":9092");

    setFormData((prev) => ({
      ...prev,
      apiKey: "test_api_key_123456789",
      merchantId: "test_merchant_id",
      apiUrl: "https://gateway.arifpay.net/api/checkout/session",
      successUrl: `${origin}/ui/manager/payWithArifpay?status=success`,
      cancelUrl: `${origin}/ui/manager/payWithArifpay?status=cancel`,
      errorUrl: `${origin}/ui/manager/payWithArifpay?status=error`,
      notifyUrl: `${beOrigin}/api/mardaerp/payments/arifpay/callback`,
      beneficiaryBank: "Commercial Bank of Ethiopia",
      beneficiaryAccount: "1000123456789",
    }));
    toast.info("Loaded sandbox / mock test template.");
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

    // Basic client validation
    if (!formData.apiKey?.trim()) {
      toast.error("API Key is required");
      return;
    }
    if (!formData.merchantId?.trim()) {
      toast.error("Merchant ID is required");
      return;
    }
    if (!formData.apiUrl?.trim()) {
      toast.error("Gateway API URL is required");
      return;
    }
    if (!formData.beneficiaryBank?.trim()) {
      toast.error("Beneficiary Bank Name is required");
      return;
    }
    if (!formData.beneficiaryAccount?.trim()) {
      toast.error("Beneficiary Account Number is required");
      return;
    }

    setSaving(true);
    try {
      const saved = await arifpayService.saveConfig(formData);
      setFormData(saved);
      setOriginalData(saved);
      toast.success("ArifPay settings successfully saved!");
    } catch (err) {
      console.error("[ArifpaySetting] Save error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to save ArifPay configuration"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb pageName="ArifPay Production Settings" />

      {/* Header Banner */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-400/30">
                <CreditCard className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  ArifPay Production & API Settings
                  <span className="text-xs font-normal text-indigo-300">
                    • የአሪፍፔይ ማስተካከያ
                  </span>
                </h1>
                <p className="text-sm text-slate-300">
                  Configure live production gateway credentials, merchant bank settlement accounts, and webhook redirects.
                </p>
              </div>
            </div>
          </div>

          {/* Environment Status Badge */}
          <div className="flex flex-wrap items-center gap-2">
            {isMockMode ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-sm backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>SANDBOX / MOCK MODE</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-sm backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>LIVE PRODUCTION GATEWAY</span>
              </div>
            )}

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

        {/* Mode Notification Banner */}
        <div className="mt-4 border-t border-white/10 pt-4">
          {isMockMode ? (
            <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-3.5 text-xs text-amber-200 border border-amber-500/20">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-semibold text-amber-300">
                  Development Mock Mode is currently active:
                </span>{" "}
                Payment sessions will simulate instant approvals locally without charging customer bank accounts.
                To go live, enter your live production ArifPay API Key and Merchant ID provided by ArifPay onboarding.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 p-3.5 text-xs text-emerald-200 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <span className="font-semibold text-emerald-300">
                  Production Mode Connected:
                </span>{" "}
                All checkout sessions are securely generated through ArifPay gateway (
                <code className="bg-black/30 px-1 py-0.5 rounded text-emerald-300 font-mono">
                  {formData.apiUrl}
                </code>
                ) and funds are deposited into your registered settlement bank account.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preset Quick Fill Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3.5 text-sm dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span>Quick Setup Templates:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadProductionDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <Zap className="h-3.5 w-3.5" />
            Apply Live Production URLs
          </button>
          <button
            type="button"
            onClick={handleLoadSandboxDefaults}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <Server className="h-3.5 w-3.5" />
            Load Sandbox / Mock Template
          </button>
        </div>
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
                  API Gateway Credentials
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authentication tokens issued by ArifPay merchant portal
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  ArifPay API Key (Header: x-arifpay-key){" "}
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
                  Keep this confidential. In sandbox mock mode, use:{" "}
                  <code className="text-indigo-600 dark:text-indigo-400">
                    test_api_key_123456789
                  </code>
                </p>
              </div>

              {/* Merchant ID */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Merchant ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="merchantId"
                  value={formData.merchantId || ""}
                  onChange={handleChange}
                  placeholder="e.g. MERCH_12345678"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Your registered ArifPay Merchant account identifier.
                </p>
              </div>

              {/* Gateway API URL */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Gateway Checkout Endpoint URL{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="url"
                    name="apiUrl"
                    value={formData.apiUrl || ""}
                    onChange={handleChange}
                    placeholder="https://gateway.arifpay.net/api/checkout/session"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-10 text-sm font-mono text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(formData.apiUrl, "API URL")}
                    className="absolute right-2 rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Copy API URL"
                  >
                    {copiedField === "API URL" ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Default ArifPay session creation endpoint:{" "}
                  <code className="text-indigo-600 dark:text-indigo-400">
                    https://gateway.arifpay.net/api/checkout/session
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Settlement Bank Account */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Landmark className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  Settlement & Beneficiary Account
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Designate where customer payments are deposited
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Beneficiary Bank Name */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Beneficiary Bank Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="beneficiaryBank"
                  value={formData.beneficiaryBank || ""}
                  onChange={handleChange}
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />

                {/* Bank Presets Chips */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {bankPresets.map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          beneficiaryBank: bank,
                        }))
                      }
                      className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                        formData.beneficiaryBank === bank
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
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
                  Target bank account number registered with your ArifPay merchant contract.
                </p>
              </div>

              {/* Informational callout */}
              <div className="mt-4 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  Settlement Verification
                </div>
                During payment initiation, ArifPay validates that the beneficiary bank and account correspond to your merchant onboarding credentials.
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
                Customer Return & Redirect URLs
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Where customer browsers are redirected when completing, canceling, or failing a payment
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
                <CheckCircle2 className="h-3 w-3" /> Returns with sessionId & nonce
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
                  Webhook Notification Callback URL (notifyUrl)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ArifPay backend dispatches asynchronous transaction confirmations to this URL
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
                placeholder="http://localhost:9092/api/mardaerp/payments/arifpay/callback"
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
                <strong>Webhook Security Notice:</strong> The Spring Boot backend permits incoming HTTP POST calls at{" "}
                <code className="bg-violet-100 dark:bg-violet-900/60 px-1 py-0.5 rounded font-mono">
                  /api/mardaerp/payments/arifpay/callback
                </code>{" "}
                without session cookies so ArifPay can post instantaneous receipt confirmations. In production, ensure this URL is exposed via your public domain or reverse proxy.
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
