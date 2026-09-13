"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsAttendanceService from "../../../lib/hrmsAttendanceService";
import hrmsEmployeeService from "../../../lib/hrmsEmployeeService";
import { 
  Timer, 
  Clock, 
  Calendar, 
  CheckCircle, 
  Search, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  RefreshCw,
  AlertTriangle
} from "lucide-react";

export default function HrmsAttendancePage() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [reconciling, setReconciling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const [attData, shiftData, empData] = await Promise.all([
        hrmsAttendanceService.getDailyAttendance(selectedDate).catch(() => []),
        hrmsAttendanceService.getShiftSchedules().catch(() => []),
        hrmsEmployeeService.getAllEmployees().catch(() => [])
      ]);
      setAttendanceRecords(Array.isArray(attData) ? attData : []);
      setShifts(Array.isArray(shiftData) ? shiftData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (e) {
      toast.error("Failed to load attendance records");
    }
    setLoading(false);
  };

  const handleApproveOvertime = async (recordId) => {
    try {
      await hrmsAttendanceService.approveOvertime(recordId);
      toast.success("Overtime approved for payroll processing");
      loadAttendance();
    } catch (e) {
      toast.error("Failed to approve overtime");
    }
  };

  const handleReconcileEmployee = async (employeeId) => {
    setReconciling(true);
    try {
      await hrmsAttendanceService.reconcileDaily(employeeId, selectedDate);
      toast.success("Biometric logs reconciled successfully");
      loadAttendance();
    } catch (e) {
      toast.error("Reconciliation failed");
    }
    setReconciling(false);
  };

  const filteredRecords = attendanceRecords.filter(r => {
    const empName = `${r.employee?.firstName || ""} ${r.employee?.middleName || ""} ${r.employee?.lastName || ""}`.toLowerCase();
    const code = (r.employee?.employeeCode || "").toLowerCase();
    return !searchTerm || empName.includes(searchTerm.toLowerCase()) || code.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Timer className="w-7 h-7 text-indigo-600" /> Shift & Attendance (የፈረቃና አሻራ ክትትል)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            24/7 Water Utility Shift Rostering & Overtime Multipliers (Proc. 1156: 1.5x, 1.75x, 2.0x, 2.5x)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm font-medium shadow-sm"
          />
          <button
            onClick={loadAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Overtime & Attendance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-gray-400">Total Shift Roster</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{shifts.length} Active Shifts</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-500">Present On-Duty</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {attendanceRecords.filter(r => r.attendanceStatus === "PRESENT").length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-purple-500">Daytime OT Hours (1.5x)</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {attendanceRecords.reduce((sum, r) => sum + (r.daytimeOvertimeHours || 0), 0).toFixed(1)} hrs
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-indigo-500">Night Differential (1.75x)</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">
            {attendanceRecords.reduce((sum, r) => sum + (r.nighttimeOvertimeHours || 0), 0).toFixed(1)} hrs
          </div>
        </div>
      </div>

      {/* Search & Shift Reference Ribbon */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search employee or code..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {shifts.slice(0, 4).map(s => (
            <span key={s.id} className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300">
              {s.shiftName}: {s.startTime?.substring(0, 5)} - {s.endTime?.substring(0, 5)}
            </span>
          ))}
        </div>
      </div>

      {/* Attendance & Punch Log Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 text-left">Employee</th>
                <th className="px-5 py-3.5 text-left">Shift</th>
                <th className="px-5 py-3.5 text-center">First In</th>
                <th className="px-5 py-3.5 text-center">Last Out</th>
                <th className="px-5 py-3.5 text-center">Work Hours</th>
                <th className="px-5 py-3.5 text-center">OT (Day / Night / Hol)</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">OT Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">Loading daily attendance records...</td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No attendance records for {selectedDate}. Use biometric device sync to ingest punches.
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {record.employee?.firstName} {record.employee?.middleName}
                      </div>
                      <div className="text-xs text-gray-400">{record.employee?.employeeCode}</div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-600 dark:text-gray-400">
                      {record.shiftSchedule?.shiftName || "General Office"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-xs">
                      {record.firstCheckInTime ? record.firstCheckInTime.substring(11, 16) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-mono text-xs">
                      {record.lastCheckOutTime ? record.lastCheckOutTime.substring(11, 16) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-gray-800 dark:text-gray-200">
                      {record.actualHoursWorked?.toFixed(1) || "0.0"} hrs
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs font-mono">
                      <span className="text-purple-600 font-bold">{record.daytimeOvertimeHours || 0}h (1.5x)</span>
                      {" / "}
                      <span className="text-indigo-600 font-bold">{record.nighttimeOvertimeHours || 0}h (1.75x)</span>
                      {" / "}
                      <span className="text-amber-600 font-bold">{record.holidayOvertimeHours || 0}h (2.5x)</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.attendanceStatus === "PRESENT" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                        record.attendanceStatus === "LATE" ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {record.attendanceStatus || "LOGGED"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {record.daytimeOvertimeHours > 0 || record.nighttimeOvertimeHours > 0 || record.holidayOvertimeHours > 0 ? (
                        record.isOvertimeApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Approved
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApproveOvertime(record.id)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium shadow-sm transition-all"
                          >
                            Approve OT
                          </button>
                        )
                      ) : (
                        <span className="text-xs text-gray-400">Regular</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
