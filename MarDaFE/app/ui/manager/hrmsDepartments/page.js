"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsDepartmentService from "../../../lib/hrmsDepartmentService";
import hrmsEmployeeService from "../../../lib/hrmsEmployeeService";
import { 
  Building2, 
  Plus, 
  Search, 
  Layers, 
  CheckCircle2, 
  FolderTree, 
  DollarSign,
  UserCheck,
  Pencil,
  X
} from "lucide-react";

export default function HrmsDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    departmentCode: "",
    departmentName: "",
    departmentNameAm: "",
    costCenterCode: "",
    managerEmployeeId: "",
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptData, empData] = await Promise.all([
        hrmsDepartmentService.getAllDepartments().catch(() => []),
        hrmsEmployeeService.getAllEmployees().catch(() => [])
      ]);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setEmployees(Array.isArray(empData) ? empData : []);
    } catch (e) {
      toast.error("Failed to load departments or employees");
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setForm({
      departmentCode: "",
      departmentName: "",
      departmentNameAm: "",
      costCenterCode: "",
      managerEmployeeId: "",
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setForm({
      departmentCode: dept.departmentCode || "",
      departmentName: dept.departmentName || "",
      departmentNameAm: dept.departmentNameAm || "",
      costCenterCode: dept.costCenterCode || "",
      managerEmployeeId: dept.managerEmployeeId ? String(dept.managerEmployeeId) : "",
      isActive: dept.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.departmentCode || !form.departmentName) {
      toast.error("Department Code and Name are required");
      return;
    }
    try {
      const payload = {
        ...form,
        managerEmployeeId: form.managerEmployeeId ? Number(form.managerEmployeeId) : null
      };
      if (editingDept) {
        await hrmsDepartmentService.updateDepartment(editingDept.id, payload);
        toast.success("Department updated successfully");
      } else {
        await hrmsDepartmentService.createDepartment(payload);
        toast.success("Department created successfully");
      }
      setModalOpen(false);
      setEditingDept(null);
      setForm({ departmentCode: "", departmentName: "", departmentNameAm: "", costCenterCode: "", managerEmployeeId: "", isActive: true });
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save department");
    }
  };

  const filtered = departments.filter(d => {
    const term = searchTerm.toLowerCase();
    const mgrName = d.managerEmployee?.fullName || employees.find(e => e.id === d.managerEmployeeId)?.fullName || "";
    return !term || 
      d.departmentName?.toLowerCase().includes(term) || 
      d.departmentCode?.toLowerCase().includes(term) ||
      d.departmentNameAm?.toLowerCase().includes(term) ||
      mgrName.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-indigo-600" /> Departments & Units (የሥራ ክፍሎች)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Organizational hierarchy, Department Managers & Purchase Approval Authorities
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by code, name, manager..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400">Loading departments...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">No departments found</div>
        ) : (
          filtered.map(dept => {
            const manager = dept.managerEmployee || employees.find(e => e.id === dept.managerEmployeeId);
            return (
              <div 
                key={dept.id} 
                className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {dept.departmentCode}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                      <button 
                        onClick={() => handleOpenEdit(dept)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-indigo-600 transition-colors"
                        title="Edit Department"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {dept.departmentName}
                  </h3>
                  {dept.departmentNameAm && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {dept.departmentNameAm}
                    </p>
                  )}

                  {/* Manager Badge */}
                  <div className="mt-3.5 flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/40 rounded-lg text-xs">
                    <UserCheck className={`w-4 h-4 ${manager ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400"}`} />
                    <div className="truncate">
                      <div className="text-[10px] text-gray-400 uppercase font-medium">Department Manager / Head</div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {manager ? (
                          <>
                            <span>{manager.fullName}</span>
                            {manager.position?.positionTitle && (
                              <span className="text-gray-400 text-[11px] ml-1">({manager.position.positionTitle})</span>
                            )}
                          </>
                        ) : (
                          <span className="italic text-amber-600 dark:text-amber-400">No Manager Assigned</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1.5 font-mono">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                    Cost Center: {dept.costCenterCode || "CC-DEFAULT"}
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">Water Utility</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" /> {editingDept ? "Edit Department" : "Add New Department"}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Department Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. WTP-PROD"
                  value={form.departmentCode}
                  onChange={e => setForm({...form, departmentCode: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Department Name (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Water Production & Treatment"
                  value={form.departmentName}
                  onChange={e => setForm({...form, departmentName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Department Name (Amharic)
                </label>
                <input
                  type="text"
                  placeholder="e.g. የውሃ ማጣሪያና ማምረቻ መምሪያ"
                  value={form.departmentNameAm}
                  onChange={e => setForm({...form, departmentNameAm: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                />
              </div>

              {/* Department Manager Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Department Manager / Head (የክፍል ኃላፊ)
                </label>
                <select
                  value={form.managerEmployeeId}
                  onChange={e => setForm({...form, managerEmployeeId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">-- No Manager Assigned --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.employeeId}) {emp.position?.positionTitle ? `— ${emp.position.positionTitle}` : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  The designated manager who approves Purchase Requisitions and leaves originating from this department.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Finance Cost Center Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CC-101"
                  value={form.costCenterCode}
                  onChange={e => setForm({...form, costCenterCode: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow"
                >
                  {editingDept ? "Update Department" : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
