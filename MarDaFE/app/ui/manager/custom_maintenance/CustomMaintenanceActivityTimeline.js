"use client";
import { useState, useEffect } from "react";
import {
  Clock,
  User,
  Shield,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Banknote,
  Wrench,
  PackageCheck,
  UserPlus,
  RefreshCw,
  XCircle,
  Ban,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { getStatusBadge } from "./CustomMaintenanceStepper";

export default function CustomMaintenanceActivityTimeline({ requestId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requestId) {
      loadLogs();
    }
  }, [requestId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await customMaintenanceService.getMaintenanceLogs(requestId);
      setLogs(data || []);
    } catch (e) {
      console.warn("Could not load maintenance activity logs:", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "REQUEST_CREATED":
        return <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case "SURVEY_PLUMBER_ASSIGNED":
      case "MAINTENANCE_PLUMBER_ASSIGNED":
        return <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "SURVEY_PLUMBER_REASSIGNED":
      case "MAINTENANCE_PLUMBER_REASSIGNED":
        return <RefreshCw className="w-4 h-4 text-orange-600 dark:text-orange-400" />;
      case "SURVEY_SUBMITTED":
        return <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case "SURVEY_RETURNED_FOR_REVISION":
        return <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case "PAYMENT_APPROVED":
        return <Banknote className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case "MATERIALS_DISPATCHED":
        return <PackageCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case "MAINTENANCE_COMPLETED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case "SURVEY_REJECTED_UNFEASIBLE":
        return <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case "APPLICATION_CANCELLED":
        return <Ban className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        የስራ እንቅስቃሴ ታሪክ በመጫን ላይ...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-gray-400">
        ምንም የስራ እንቅስቃሴ አልተመዘገበም
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
      {logs.map((log) => {
        const toBadge = log.toStatus ? getStatusBadge(log.toStatus) : null;
        const fromBadge = log.fromStatus ? getStatusBadge(log.fromStatus) : null;

        return (
          <div key={log.id} className="relative group">
            {/* Timeline Node Icon */}
            <div className="absolute -left-4 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shadow-sm">
              {getActionIcon(log.action)}
            </div>

            <div className="ml-5 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-150 dark:border-gray-700 shadow-xs space-y-1.5 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-gray-900 dark:text-white">
                    {log.action?.replace(/_/g, " ")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <User className="w-3 h-3 text-gray-400" />
                    {log.actorUsername}
                  </span>
                  {log.actorRole && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-mono font-medium">
                      {log.actorRole}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(log.createdAt)}
                </span>
              </div>

              {/* Status Transition Badges */}
              {(fromBadge || toBadge) && (
                <div className="flex items-center gap-1.5 text-[10px] pt-0.5">
                  {fromBadge && (
                    <span className={`px-2 py-0.5 rounded-full font-medium ${fromBadge.color}`}>
                      {fromBadge.text}
                    </span>
                  )}
                  {fromBadge && toBadge && <ArrowRight className="w-3 h-3 text-gray-400" />}
                  {toBadge && (
                    <span className={`px-2 py-0.5 rounded-full font-bold ${toBadge.color}`}>
                      {toBadge.text}
                    </span>
                  )}
                </div>
              )}

              {/* Remarks / Comments */}
              {log.comments && (
                <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50/70 dark:bg-gray-750 p-2 rounded-lg border border-gray-100 dark:border-gray-700/60 mt-1 flex items-start gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{log.comments}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
