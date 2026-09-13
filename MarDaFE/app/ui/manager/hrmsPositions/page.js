"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import hrmsDepartmentService from "../../../lib/hrmsDepartmentService";
import { 
  Briefcase, 
  ListTree, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users 
} from "lucide-react";

export default function HrmsPositionsPage() {
  const [positions, setPositions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [jobGrades, setJobGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    positionCode: "",
    positionTitle: "",
    positionTitleAm: "",
    departmentId: "",
    jobGradeId: "",
    approvedHeadcount: 1,
    isHazardous: false,
    requiresShiftWork: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [posData, deptData, gradesData] = await Promise.all([
        hrmsDepartmentService.getAllPositions().catch(() => []),
        hrmsDepartmentService.getAllDepartments().catch(() => []),
        hrmsDepartmentService.getAllJobGrades().catch(() => [])
      ]);
      setPositions(Array.isArray(posData) ? posData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setJobGrades(Array.isArray(gradesData) ? gradesData : []);
    } catch (e) {
      toast.error("Failed to load positions");
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.positionCode || !form.positionTitle) {
      toast.error("Position code and title are required");
      return;
    }
    try {
      const selectedDept = departments.find(d => d.id === Number(form.departmentId));
      const selectedGrade = jobGrades.find(g => g.id === Number(form.jobGradeId));
      await hrmsDepartmentService.createPosition({
        positionCode: form.positionCode,
        positionTitle: form.positionTitle,
        positionTitleAm: form.positionTitleAm,
        department: selectedDept,
        jobGrade: selectedGrade,
        approvedHeadcount: Number(form.approvedHeadcount),
        isHazardous: form.isHazardous,
        requiresShiftWork: form.requiresShiftWork,
        isActive: true
      });

      toast.success("Position created successfully");
      setModalOpen(false);
      setForm({
        positionCode: "",
        positionTitle: "",
        positionTitleAm: "",
        departmentId: "",
        jobGradeId: "",
        approvedHeadcount: 1,
        isHazardous: false,
        requiresShiftWork: false
      });
      loadData();
    } catch (e) {
      toast.error("Failed to save position");
    }
  };

  const filtered = positions.filter(p => {
    const term = searchTerm.toLowerCase();
    return !term || 
      p.positionTitle?.toLowerCase().includes(term) || 
      p.positionCode?.toLowerCase().includes(term) ||
      p.department?.departmentName?.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ListTree className="w-7 h-7 text-indigo-600" /> Positions & Job Grades (የሥራ መደቦችና ደረጃ)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Job specifications, approved headcounts, hazardous work indicators & shift assignments
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow font-medium transition-all"
        >
          <Plus className="w-4 h-4" /> Add Position
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
            placeholder="Search position title, code, or department..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-5 py-3.5 text-left">Position Code</th>
                <th className="px-5 py-3.5 text-left">Position Title</th>
                <th className="px-5 py-3.5 text-left">Department</th>
                <th className="px-5 py-3.5 text-left">Job Grade</th>
                <th className="px-5 py-3.5 text-center">Approved Headcount</th>
                <th className="px-5 py-3.5 text-center">Conditions</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading positions...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">No positions found</td>
                </tr>
              ) : (
                filtered.map(pos => (
                  <tr key={pos.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {pos.positionCode}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white">{pos.positionTitle}</div>
                      {pos.positionTitleAm && (
                        <div className="text-xs text-gray-400">{pos.positionTitleAm}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">
                      {pos.department?.departmentName || "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {pos.jobGrade?.gradeCode || "GR-DEFAULT"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center font-bold text-gray-800 dark:text-gray-200">
                      {pos.approvedHeadcount}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {pos.isHazardous && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200" title="Hazardous chemical exposure">
                            <AlertTriangle className="w-3 h-3" /> Hazardous
                          </span>
                        )}
                        {pos.requiresShiftWork && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200" title="Shift Work 24/7">
                            <Clock className="w-3 h-3" /> Shift
                          </span>
                        )}
                        {!pos.isHazardous && !pos.requiresShiftWork && (
                          <span className="text-xs text-gray-400">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="flex items-center justify-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Position Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <ListTree className="w-5 h-5 text-indigo-600" /> Add Water Utility Position
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Position Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. POS-WTP-OP"
                    value={form.positionCode}
                    onChange={e => setForm({...form, positionCode: e.target.value.toUpperCase()})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Headcount *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.approvedHeadcount}
                    onChange={e => setForm({...form, approvedHeadcount: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Position Title (English) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Water Treatment Plant Operator"
                  value={form.positionTitle}
                  onChange={e => setForm({...form, positionTitle: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                  Position Title (Amharic)
                </label>
                <input
                  type="text"
                  placeholder="e.g. የውሃ ማጣሪያ ፕላንት ኦፕሬተር"
                  value={form.positionTitleAm}
                  onChange={e => setForm({...form, positionTitleAm: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={form.departmentId}
                    onChange={e => setForm({...form, departmentId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.departmentName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 dark:text-gray-300 mb-1">
                    Job Grade *
                  </label>
                  <select
                    value={form.jobGradeId}
                    onChange={e => setForm({...form, jobGradeId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-700"
                    required
                  >
                    <option value="">Select Grade</option>
                    {jobGrades.map(g => (
                      <option key={g.id} value={g.id}>{g.gradeCode} - {g.gradeName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isHazardous}
                    onChange={e => setForm({...form, isHazardous: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Hazardous Work (Chemicals/Chambers)</span>
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requiresShiftWork}
                    onChange={e => setForm({...form, requiresShiftWork: e.target.checked})}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>24/7 Continuous Shift</span>
                </label>
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
                  Save Position
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
