"use client";
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import hrmsLeaveService from "../../../lib/hrmsLeaveService";
import hrmsEmployeeService from "../../../lib/hrmsEmployeeService";
import EtDatePicker from "mui-ethiopian-datepicker";
import EthiopianCalendarConverterPure from "../../../lib/ethiopianCalendarConverterPure";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  User, 
  AlertCircle,
  FileText,
  Check,
  ChevronDown
} from "lucide-react";

export default function HrmsLeavePage() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [actionModal, setActionModal] = useState({ open: false, type: "", request: null, reason: "" });

  const [form, setForm] = useState({
    employeeId: "",
    leaveTypeId: "",
    startDateEc: "",
    endDateEc: "",
    requestedDays: 1,
    reason: "",
    replacementEmployeeId: ""
  });

  // Ethiopian Calendar Date Picker States
  const [startDatePickerValue, setStartDatePickerValue] = useState(null);
  const [endDatePickerValue, setEndDatePickerValue] = useState(null);

  // Searchable Employee Dropdown States
  const [empSearchQuery, setEmpSearchQuery] = useState("");
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);
  const empDropdownRef = useRef(null);

  // Close employee search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (empDropdownRef.current && !empDropdownRef.current.contains(e.target)) {
        setIsEmpDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getEmpName = (emp) => {
    if (!emp) return "";
    if (emp.fullName) return emp.fullName;
    const parts = [emp.firstName, emp.middleName, emp.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : (emp.employeeId || emp.employeeCode || `Employee #${emp.id}`);
  };

  const getEmpCode = (emp) => {
    if (!emp) return "";
    return emp.employeeId || emp.employeeCode || `EMP-${emp.id}`;
  };

  const getEmpDept = (emp) => {
    if (!emp) return "";
    return emp.department?.departmentName || emp.department?.name || emp.dutyStation || "Head Office";
  };

  const selectedEmployee = employees.find(
    (emp) => String(emp.id) === String(form.employeeId)
  );

  const filteredEmployeesForModal = employees.filter((emp) => {
    if (!empSearchQuery.trim()) return true;
    const q = empSearchQuery.toLowerCase();
    const fullName = (emp.fullName || "").toLowerCase();
    const fullNameAm = (emp.fullNameAm || "").toLowerCase();
    const splitName = `${emp.firstName || ""} ${emp.middleName || ""} ${emp.lastName || ""}`.toLowerCase();
    const code = String(emp.employeeId || emp.employeeCode || "").toLowerCase();
    const dept = String(emp.department?.departmentName || emp.department?.name || emp.dutyStation || "").toLowerCase();
    const pos = String(emp.position?.positionTitle || emp.positionTitle || "").toLowerCase();
    return (
      fullName.includes(q) ||
      fullNameAm.includes(q) ||
      splitName.includes(q) ||
      code.includes(q) ||
      dept.includes(q) ||
      pos.includes(q)
    );
  });

  const handleCloseModal = () => {
    setModalOpen(false);
    setEmpSearchQuery("");
    setIsEmpDropdownOpen(false);
    setStartDatePickerValue(null);
    setEndDatePickerValue(null);
    setForm({
      employeeId: "",
      leaveTypeId: "",
      startDateEc: "",
      endDateEc: "",
      requestedDays: 1,
      reason: "",
      replacementEmployeeId: ""
    });
  };

  const calculateDiffDays = (start, end) => {
    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return null;
    const msPerDay = 1000 * 60 * 60 * 24;
    const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const endUtc = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
    const diffDays = Math.round((endUtc - startUtc) / msPerDay) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const formatDateGC = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const formatEcDisplay = (ecStr, gcStr) => {
    if (ecStr) return ecStr;
    if (!gcStr) return "—";
    try {
      const eth = EthiopianCalendarConverterPure.gregorianToEthiopian(gcStr);
      return `${String(eth.day).padStart(2, "0")}/${String(eth.month).padStart(2, "0")}/${eth.year}`;
    } catch (e) {
      return gcStr;
    }
  };

  const handleStartDateChange = (date) => {
    setStartDatePickerValue(date);
    if (!date || isNaN(date.getTime())) {
      setForm(prev => ({ ...prev, startDateEc: "" }));
      return;
    }
    try {
      const eth = EthiopianCalendarConverterPure.gregorianToEthiopian(date);
      const ecStr = `${String(eth.day).padStart(2, "0")}/${String(eth.month).padStart(2, "0")}/${eth.year}`;
      
      let nextDays = form.requestedDays;
      if (endDatePickerValue && !isNaN(endDatePickerValue.getTime())) {
        const days = calculateDiffDays(date, endDatePickerValue);
        if (days) nextDays = days;
      }
      
      setForm(prev => ({
        ...prev,
        startDateEc: ecStr,
        requestedDays: nextDays
      }));
    } catch (err) {
      console.error("Error formatting Ethiopian start date:", err);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDatePickerValue(date);
    if (!date || isNaN(date.getTime())) {
      setForm(prev => ({ ...prev, endDateEc: "" }));
      return;
    }
    try {
      const eth = EthiopianCalendarConverterPure.gregorianToEthiopian(date);
      const ecStr = `${String(eth.day).padStart(2, "0")}/${String(eth.month).padStart(2, "0")}/${eth.year}`;
      
      let nextDays = form.requestedDays;
      if (startDatePickerValue && !isNaN(startDatePickerValue.getTime())) {
        const days = calculateDiffDays(startDatePickerValue, date);
        if (days) nextDays = days;
      }
      
      setForm(prev => ({
        ...prev,
        endDateEc: ecStr,
        requestedDays: nextDays
      }));
    } catch (err) {
      console.error("Error formatting Ethiopian end date:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, typesData, empData] = await Promise.all([
        hrmsLeaveService.getAllRequests().catch(() => []),
        hrmsLeaveService.getLeaveTypes().catch(() => []),
        hrmsEmployeeService.getAllEmployees().catch(() => [])
      ]);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setLeaveTypes(Array.isArray(typesData) ? typesData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (e) {
      toast.error("Failed to load leave records");
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    try {
      await hrmsLeaveService.approveLeaveRequest(id);
      toast.success("Leave request approved");
      setActionModal({ open: false, type: "", request: null, reason: "" });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to approve request");
    }
  };

  const handleReject = async () => {
    if (!actionModal.reason) {
      toast.error("Rejection reason is required");
      return;
    }
    try {
      await hrmsLeaveService.rejectLeaveRequest(actionModal.request.id, 1, actionModal.reason);
      toast.success("Leave request rejected");
      setActionModal({ open: false, type: "", request: null, reason: "" });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to reject request");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeId || !form.leaveTypeId || !form.startDateEc || !form.endDateEc) {
      toast.error("Please fill in all mandatory fields (including Start and End Dates)");
      return;
    }

    if (startDatePickerValue && endDatePickerValue && endDatePickerValue < startDatePickerValue) {
      toast.error("End date cannot be earlier than start date");
      return;
    }

    try {
      const selectedType = leaveTypes.find(t => t.id === Number(form.leaveTypeId));
      const startDateGc = startDatePickerValue ? formatDateGC(startDatePickerValue) : "";
      const endDateGc = endDatePickerValue ? formatDateGC(endDatePickerValue) : "";

      let ethYear = 2018;
      if (form.startDateEc) {
        const parts = form.startDateEc.split("/");
        if (parts.length === 3 && !isNaN(parts[2])) {
          ethYear = parseInt(parts[2], 10);
        }
      }

      await hrmsLeaveService.submitLeaveRequest({
        leaveType: selectedType,
        leaveStart: startDateGc || undefined,
        leaveEnd: endDateGc || undefined,
        startDateEc: form.startDateEc,
        endDateEc: form.endDateEc,
        leaveDays: Number(form.requestedDays),
        requestedDays: Number(form.requestedDays),
        year: ethYear,
        leaveReason: form.reason,
        reason: form.reason
      }, form.employeeId);

      toast.success("Leave request submitted successfully");
      handleCloseModal();
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to submit leave request");
    }
  };

  const filteredRequests = requests.filter(r => {
    const empName = (getEmpName(r.employee) || "").toLowerCase();
    const empAm = (r.employee?.fullNameAm || "").toLowerCase();
    const typeName = (r.leaveType?.typeName || "").toLowerCase();
    const typeNameAm = (r.leaveType?.typeNameAm || "").toLowerCase();
    const matchesSearch =
      !searchTerm ||
      empName.includes(searchTerm.toLowerCase()) ||
      empAm.includes(searchTerm.toLowerCase()) ||
      typeName.includes(searchTerm.toLowerCase()) ||
      typeNameAm.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter || r.approvalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600" /> Leave Management (የዕረፍት ፈቃድ ማኔጅመንት)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Ethiopian Labour Proclamation No. 1156/2019 compliant leave approvals & tracking
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> New Leave Application
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-gray-400">Total Applications</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{requests.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-amber-500">Pending Review</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">
            {requests.filter(r => (r.status === "PENDING" || r.approvalStatus === "PENDING")).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-500">Approved Leaves</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {requests.filter(r => (r.status === "APPROVED" || r.approvalStatus === "APPROVED")).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-xs font-semibold uppercase text-red-500">Rejected / Returned</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {requests.filter(r => (r.status === "REJECTED" || r.approvalStatus === "REJECTED")).length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by employee name or leave type..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 text-left">Employee</th>
                <th className="px-5 py-3.5 text-left">Leave Type</th>
                <th className="px-5 py-3.5 text-left">Duration (Ge'ez)</th>
                <th className="px-5 py-3.5 text-center">Days</th>
                <th className="px-5 py-3.5 text-left">Reason</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading leave applications...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No leave requests found</td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getEmpName(req.employee)}
                        {req.employee?.fullNameAm && (
                          <span className="ml-1.5 text-xs text-gray-400 font-normal">
                            ({req.employee.fullNameAm})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {getEmpCode(req.employee)} • {getEmpDept(req.employee)}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{req.leaveType?.typeName}</div>
                      <div className="text-xs text-gray-400">{req.leaveType?.typeNameAm}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatEcDisplay(req.startDateEc, req.leaveStart)} → {formatEcDisplay(req.endDateEc, req.leaveEnd)}
                      </div>
                      {(req.leaveStart || req.leaveEnd) && (
                        <div className="text-[10px] text-gray-400 font-sans">
                          GC: {req.leaveStart || "—"} ~ {req.leaveEnd || "—"}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">
                      {req.requestedDays || req.leaveDays || 0}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {req.reason || req.leaveReason || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        (req.status === "APPROVED" || req.approvalStatus === "APPROVED") ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" :
                        (req.status === "REJECTED" || req.approvalStatus === "REJECTED") ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {req.approvalStatus || req.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {(req.status === "PENDING" || req.approvalStatus === "PENDING") ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                            title="Approve Leave"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setActionModal({ open: true, type: "REJECT", request: req, reason: "" })}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                            title="Reject Leave"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Application Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Apply for Leave
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Searchable Employee Selector */}
              <div className="relative" ref={empDropdownRef}>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">
                    Employee (ሠራተኛ) <span className="text-red-500">*</span>
                  </label>
                  {selectedEmployee && (
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, employeeId: "" });
                        setEmpSearchQuery("");
                        setIsEmpDropdownOpen(true);
                      }}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-medium"
                    >
                      Change (ቀይር)
                    </button>
                  )}
                </div>

                {selectedEmployee ? (
                  /* Selected Employee Display Card */
                  <div
                    onClick={() => setIsEmpDropdownOpen((prev) => !prev)}
                    className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                        {(getEmpName(selectedEmployee) || "E")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {getEmpName(selectedEmployee)}
                          {selectedEmployee.fullNameAm && (
                            <span className="ml-1.5 text-[11px] text-gray-500 font-normal">
                              ({selectedEmployee.fullNameAm})
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold">
                            {getEmpCode(selectedEmployee)}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {getEmpDept(selectedEmployee)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-gray-400">
                      <ChevronDown className={`w-4 h-4 transition-transform ${isEmpDropdownOpen ? "rotate-180" : ""}`} />
                    </div>
                  </div>
                ) : (
                  /* Trigger Input / Button when none selected */
                  <div
                    onClick={() => setIsEmpDropdownOpen(true)}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm flex items-center justify-between cursor-pointer transition-all ${
                      isEmpDropdownOpen
                        ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-white dark:bg-gray-700"
                        : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <span className="text-gray-400 text-xs">
                      -- ሠራተኛ በስም፣ በኮድ ወይም በክፍል ይፈልጉ (Search Employee...) --
                    </span>
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                {/* Dropdown Floating Panel */}
                {isEmpDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    {/* Search Field inside dropdown */}
                    <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/50">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-400" />
                        <input
                          type="text"
                          autoFocus
                          value={empSearchQuery}
                          onChange={(e) => setEmpSearchQuery(e.target.value)}
                          placeholder="ስም፣ ኮድ (EMP-...) ወይም ክፍል ፈልግ..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {empSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setEmpSearchQuery("")}
                            className="absolute right-2 top-2 text-xs text-gray-400 hover:text-gray-600"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filtered Employees Scrollable List */}
                    <div className="max-h-52 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700/40">
                      {filteredEmployeesForModal.length === 0 ? (
                        <div className="p-4 text-center text-xs text-gray-400">
                          ምንም የተገኘ ሠራተኛ የለም (No employees found matching &quot;{empSearchQuery}&quot;)
                        </div>
                      ) : (
                        filteredEmployeesForModal.map((emp) => {
                          const isSelected = String(emp.id) === String(form.employeeId);
                          const name = getEmpName(emp);
                          const code = getEmpCode(emp);
                          const dept = getEmpDept(emp);
                          const initial = (name || "E")[0].toUpperCase();

                          return (
                            <div
                              key={emp.id}
                              onClick={() => {
                                setForm({ ...form, employeeId: String(emp.id) });
                                setIsEmpDropdownOpen(false);
                                setEmpSearchQuery("");
                              }}
                              className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors text-left ${
                                isSelected
                                  ? "bg-indigo-50 dark:bg-indigo-950/50"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                                  {initial}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                    {name}
                                    {emp.fullNameAm && (
                                      <span className="ml-1.5 text-[11px] text-gray-500 font-normal">
                                        ({emp.fullNameAm})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                                      {code}
                                    </span>
                                    <span>•</span>
                                    <span className="truncate">
                                      {dept}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Leave Type *</label>
                <select
                  value={form.leaveTypeId}
                  onChange={e => setForm({...form, leaveTypeId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                  required
                >
                  <option value="">Select Leave Type</option>
                  {leaveTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.typeName} ({type.typeNameAm}) — Default: {type.defaultDays} days
                    </option>
                  ))}
                </select>
              </div>

              {/* Ethiopian Calendar Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                    <span>Start Date (Ge'ez) *</span>
                    {form.startDateEc && (
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {form.startDateEc}
                      </span>
                    )}
                  </label>
                  <EtDatePicker
                    value={startDatePickerValue}
                    onChange={handleStartDateChange}
                    size="small"
                    fullWidth
                    placeholder="DD/MM/YYYY"
                    sx={{
                      width: "100%",
                      backgroundColor: "rgb(249 250 251)",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    የመጀመሪያ ቀን (በኢትዮጵያ የቀን አቆጣጠር)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 dark:text-gray-300 mb-1 flex items-center justify-between">
                    <span>End Date (Ge'ez) *</span>
                    {form.endDateEc && (
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {form.endDateEc}
                      </span>
                    )}
                  </label>
                  <EtDatePicker
                    value={endDatePickerValue}
                    onChange={handleEndDateChange}
                    minDate={startDatePickerValue || undefined}
                    size="small"
                    fullWidth
                    placeholder="DD/MM/YYYY"
                    sx={{
                      width: "100%",
                      backgroundColor: "rgb(249 250 251)",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    የመጨረሻ ቀን (በኢትዮጵያ የቀን አቆጣጠር)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Requested Days *
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={form.requestedDays}
                  onChange={e => setForm({...form, requestedDays: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
                  required
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Auto-calculated from start &amp; end dates (inclusive). You may also adjust manually if required.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">Reason / Justification</label>
                <textarea
                  rows="2"
                  value={form.reason}
                  onChange={e => setForm({...form, reason: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-sm"
                  placeholder="Details regarding leave request..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {actionModal.open && actionModal.type === "REJECT" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-red-600 flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5" /> Reject Leave Request
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Please enter the official rejection reason for {getEmpName(actionModal.request?.employee)}:
            </p>
            <textarea
              rows="3"
              value={actionModal.reason}
              onChange={e => setActionModal({...actionModal, reason: e.target.value})}
              placeholder="e.g. Critical operational duty required during requested period..."
              className="w-full px-3 py-2 border rounded-lg text-sm mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setActionModal({ open: false, type: "", request: null, reason: "" })}
                className="px-4 py-2 border rounded-lg text-sm text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
