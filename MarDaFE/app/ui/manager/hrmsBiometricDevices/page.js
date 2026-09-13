"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsAttendanceService from "../../../lib/hrmsAttendanceService";
import { 
  Shield, 
  Cpu, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  MapPin, 
  Activity, 
  Radio 
} from "lucide-react";

export default function HrmsBiometricDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    deviceName: "",
    deviceIp: "",
    port: 4370,
    serialNumber: "",
    deviceModel: "ZKTeco SilkBio-101TC",
    locationName: "",
    protocol: "ZK_TCP",
    isActive: true
  });

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await hrmsAttendanceService.getBiometricDevices();
      setDevices(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Failed to load biometric devices");
    }
    setLoading(false);
  };

  const handleProcessLogs = async () => {
    setSyncing(true);
    try {
      const res = await hrmsAttendanceService.processUnprocessedLogs();
      toast.success(`Processed ${res?.processedCount ?? 0} raw punch records into daily attendance!`);
    } catch (e) {
      toast.error("Failed to process biometric punch logs");
    }
    setSyncing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.deviceName || !form.deviceIp) {
      toast.error("Device Name and IP Address are required");
      return;
    }
    try {
      await hrmsAttendanceService.saveBiometricDevice({
        ...form,
        port: Number(form.port)
      });
      toast.success("Biometric hardware device registered successfully");
      setModalOpen(false);
      setForm({
        deviceName: "",
        deviceIp: "",
        port: 4370,
        serialNumber: "",
        deviceModel: "ZKTeco SilkBio-101TC",
        locationName: "",
        protocol: "ZK_TCP",
        isActive: true
      });
      loadDevices();
    } catch (e) {
      toast.error("Failed to register device");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="w-7 h-7 text-indigo-600" /> Biometric Hardware Devices (የጣት አሻራ መሣሪያዎች)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            ZKTeco & Hikvision biometric terminal registry, TCP/IP push polling & automated log evaluation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleProcessLogs}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow font-medium transition-all disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Processing Raw Logs..." : "Sync & Process Logs"}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-medium transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Add Terminal
          </button>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading biometric hardware...</div>
        ) : devices.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">No biometric terminals configured</div>
        ) : (
          devices.map(device => (
            <div 
              key={device.id} 
              className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <Cpu className="w-5 h-5" />
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                  </span>
                </div>

                <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                  {device.deviceName}
                </h3>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  Model: {device.deviceModel || "ZKTeco"}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">IP Endpoint:</span>
                    <span className="font-mono font-bold">{device.deviceIp}:{device.port}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Serial #:</span>
                    <span className="font-mono">{device.serialNumber || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Protocol:</span>
                    <span className="font-semibold text-indigo-600">{device.protocol || "ZK_TCP"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{device.locationName || "Water Utility Site"}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Device Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Cpu className="w-5 h-5 text-indigo-600" /> Register Biometric Terminal
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Device Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. WTP Central Plant Terminal"
                  value={form.deviceName}
                  onChange={e => setForm({...form, deviceName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    IP Address *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 192.168.1.201"
                    value={form.deviceIp}
                    onChange={e => setForm({...form, deviceIp: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    TCP Port *
                  </label>
                  <input
                    type="number"
                    value={form.port}
                    onChange={e => setForm({...form, port: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Device Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZKTeco SilkBio-101TC"
                    value={form.deviceModel}
                    onChange={e => setForm({...form, deviceModel: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ZK-WTP-001"
                    value={form.serialNumber}
                    onChange={e => setForm({...form, serialNumber: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Location / Installation Site
                </label>
                <input
                  type="text"
                  placeholder="e.g. Main Water Treatment Plant Entrance Gate"
                  value={form.locationName}
                  onChange={e => setForm({...form, locationName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow"
                >
                  Register Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
