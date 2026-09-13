"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import workflowService from "../../../lib/workflowService";
import { GitBranch, Plus, X, Edit2, Trash2, ChevronDown, ChevronUp, Check, CircleDot, Settings2, ArrowUpDown } from "lucide-react";

const DOC_TYPES = ["PURCHASE_REQUISITION", "PURCHASE_ORDER", "STOCK_TRANSFER", "STOCK_ADJUSTMENT", "ISSUE_VOUCHER"];

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [stepModal, setStepModal] = useState(null); // templateId when adding step
  const [editTemplate, setEditTemplate] = useState(null);
  const [editStep, setEditStep] = useState(null);
  const [tForm, setTForm] = useState({ templateCode: "", templateName: "", documentType: "", description: "", isActive: true });
  const [sForm, setSForm] = useState({ stepOrder: 1, stepName: "", stepNameAm: "", approverRoleCode: "", isRequired: true, minAmount: "", maxAmount: "", autoApproveBelow: "", slaHours: 48, canReject: true });

  useEffect(() => { loadData(); loadRoles(); }, []);

  const loadData = async () => { setLoading(true); try { setTemplates(await workflowService.getTemplates()); } catch {} setLoading(false); };
  const loadRoles = async () => { try { setRoles(await workflowService.getAllRoles()); } catch {} };

  const openCreateTemplate = () => { setEditTemplate(null); setTForm({ templateCode: "", templateName: "", documentType: "", description: "", isActive: true }); setTemplateModal(true); };
  const openEditTemplate = (t) => { setEditTemplate(t); setTForm({ templateCode: t.templateCode, templateName: t.templateName, documentType: t.documentType, description: t.description || "", isActive: t.isActive }); setTemplateModal(true); };

  const handleSaveTemplate = async () => {
    if (!tForm.templateCode || !tForm.templateName || !tForm.documentType) { toast.error("Code, name, and document type required"); return; }
    try {
      if (editTemplate) { await workflowService.updateTemplate(editTemplate.id, tForm); toast.success("Template updated"); }
      else { await workflowService.createTemplate(tForm); toast.success("Template created"); }
      setTemplateModal(false); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleDeleteTemplate = async (id) => { if (!confirm("Delete this template and all its steps?")) return; try { await workflowService.deleteTemplate(id); toast.success("Deleted"); loadData(); } catch (e) { toast.error("Error"); } };

  const openAddStep = (templateId) => {
    const t = templates.find(t => t.id === templateId);
    const nextOrder = t?.steps?.length ? Math.max(...t.steps.map(s => s.stepOrder)) + 1 : 1;
    setEditStep(null); setStepModal(templateId);
    setSForm({ stepOrder: nextOrder, stepName: "", stepNameAm: "", approverRoleCode: "", isRequired: true, minAmount: "", maxAmount: "", autoApproveBelow: "", slaHours: 48, canReject: true });
  };

  const openEditStep = (templateId, step) => {
    setEditStep(step); setStepModal(templateId);
    setSForm({ stepOrder: step.stepOrder, stepName: step.stepName, stepNameAm: step.stepNameAm || "", approverRoleCode: step.approverRoleCode, isRequired: step.isRequired, minAmount: step.minAmount || "", maxAmount: step.maxAmount || "", autoApproveBelow: step.autoApproveBelow || "", slaHours: step.slaHours, canReject: step.canReject });
  };

  const handleSaveStep = async () => {
    if (!sForm.stepName || !sForm.approverRoleCode) { toast.error("Name and role required"); return; }
    try {
      if (editStep) { await workflowService.updateStep(editStep.id, sForm); toast.success("Step updated"); }
      else { await workflowService.addStep(stepModal, sForm); toast.success("Step added"); }
      setStepModal(null); loadData();
    } catch (e) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleDeleteStep = async (stepId) => { if (!confirm("Delete this step?")) return; try { await workflowService.deleteStep(stepId); toast.success("Step deleted"); loadData(); } catch (e) { toast.error("Error"); } };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><GitBranch className="w-7 h-7 text-indigo-600" /> Workflow Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Configure approval workflows and step sequences for each document type</p>
        </div>
        <button onClick={openCreateTemplate} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md transition-all"><Plus className="w-4 h-4" /> New Template</button>
      </div>

      {/* Templates List */}
      {loading ? <div className="text-center text-gray-400 py-12">Loading...</div> :
        templates.length === 0 ? <div className="text-center text-gray-400 py-12">No workflow templates configured</div> :
        <div className="space-y-4">
          {templates.map(t => (
            <div key={t.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Template Header */}
              <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors" onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}>
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${t.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{t.templateName}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                      <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{t.templateCode}</span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded font-medium">{t.documentType?.replace(/_/g, " ")}</span>
                      <span>{t.steps?.length || 0} steps</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openEditTemplate(t); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(t.id); }} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                  {expandedId === t.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Steps — expanded */}
              {expandedId === t.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
                  {/* Visual stepper preview */}
                  {t.steps?.length > 0 && (
                    <div className="flex items-center mb-5 px-2">
                      {t.steps.map((step, i) => (
                        <div key={step.id} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">{step.stepOrder}</div>
                            <span className="text-xs mt-1 text-center font-medium text-gray-600 dark:text-gray-400 max-w-[120px] truncate">{step.stepName}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{step.approverRoleCode}</span>
                          </div>
                          {i < t.steps.length - 1 && <div className="flex-1 h-0.5 mx-2 bg-indigo-200 dark:bg-indigo-800 rounded-full" />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Steps table */}
                  <table className="w-full text-sm mb-3">
                    <thead><tr className="text-xs text-gray-500 uppercase border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left">Order</th><th className="py-2 text-left">Step Name</th><th className="py-2 text-left">Approver Role</th>
                      <th className="py-2 text-center">Required</th><th className="py-2 text-right">Min Amount</th><th className="py-2 text-right">Auto-Approve Below</th>
                      <th className="py-2 text-center">SLA</th><th className="py-2 text-center">Actions</th>
                    </tr></thead>
                    <tbody>
                      {(t.steps || []).map(step => (
                        <tr key={step.id} className="border-b border-gray-100 dark:border-gray-700/50">
                          <td className="py-2 font-mono font-bold text-indigo-600">{step.stepOrder}</td>
                          <td className="py-2 text-gray-800 dark:text-gray-200">{step.stepName}{step.stepNameAm && <span className="text-gray-400 ml-1 text-xs">({step.stepNameAm})</span>}</td>
                          <td className="py-2"><span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-xs font-mono">{step.approverRoleCode}</span></td>
                          <td className="py-2 text-center">{step.isRequired ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-gray-400">Optional</span>}</td>
                          <td className="py-2 text-right font-mono text-gray-600">{step.minAmount ? `ETB ${Number(step.minAmount).toLocaleString()}` : "—"}</td>
                          <td className="py-2 text-right font-mono text-gray-600">{step.autoApproveBelow ? `< ETB ${Number(step.autoApproveBelow).toLocaleString()}` : "—"}</td>
                          <td className="py-2 text-center text-gray-600">{step.slaHours}h</td>
                          <td className="py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => openEditStep(t.id, step)} className="p-1 rounded hover:bg-blue-50 text-blue-600"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleDeleteStep(step.id)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button onClick={() => openAddStep(t.id)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Step</button>
                </div>
              )}
            </div>
          ))}
        </div>
      }

      {/* Template Modal */}
      {templateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editTemplate ? "Edit Template" : "New Workflow Template"}</h2>
              <button onClick={() => setTemplateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Code *</label>
                  <input value={tForm.templateCode} onChange={e => setTForm({...tForm, templateCode: e.target.value})} disabled={!!editTemplate} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50" placeholder="PR_APPROVAL" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type *</label>
                  <select value={tForm.documentType} onChange={e => setTForm({...tForm, documentType: e.target.value})} disabled={!!editTemplate} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50">
                    <option value="">Select</option>
                    {DOC_TYPES.map(d => <option key={d} value={d}>{d.replace(/_/g, " ")}</option>)}
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Template Name *</label>
                <input value={tForm.templateName} onChange={e => setTForm({...tForm, templateName: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Purchase Requisition Approval" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea value={tForm.description} onChange={e => setTForm({...tForm, description: e.target.value})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none" /></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={tForm.isActive} onChange={e => setTForm({...tForm, isActive: e.target.checked})} className="rounded" /> Active</label>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => setTemplateModal(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveTemplate} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editTemplate ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Step Modal */}
      {stepModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editStep ? "Edit Step" : "Add Approval Step"}</h2>
              <button onClick={() => setStepModal(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Step Order *</label>
                  <input type="number" value={sForm.stepOrder} onChange={e => setSForm({...sForm, stepOrder: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Approver Role *</label>
                  <select value={sForm.approverRoleCode} onChange={e => setSForm({...sForm, approverRoleCode: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.roleCode}>{r.roleName} ({r.roleCode})</option>)}
                  </select></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Step Name *</label>
                <input value={sForm.stepName} onChange={e => setSForm({...sForm, stepName: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Department Manager Approval" /></div>
              <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amharic Name</label>
                <input value={sForm.stepNameAm} onChange={e => setSForm({...sForm, stepNameAm: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs text-gray-500 mb-1">Min Amount (ETB)</label>
                  <input type="number" value={sForm.minAmount} onChange={e => setSForm({...sForm, minAmount: e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Optional" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Max Amount (ETB)</label>
                  <input type="number" value={sForm.maxAmount} onChange={e => setSForm({...sForm, maxAmount: e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Optional" /></div>
                <div><label className="block text-xs text-gray-500 mb-1">Auto-Approve Below</label>
                  <input type="number" value={sForm.autoApproveBelow} onChange={e => setSForm({...sForm, autoApproveBelow: e.target.value})} className="w-full px-2 py-1.5 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Optional" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs text-gray-500 mb-1">SLA Hours</label>
                  <input type="number" value={sForm.slaHours} onChange={e => setSForm({...sForm, slaHours: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" /></div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sForm.isRequired} onChange={e => setSForm({...sForm, isRequired: e.target.checked})} className="rounded" /> Required</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={sForm.canReject} onChange={e => setSForm({...sForm, canReject: e.target.checked})} className="rounded" /> Can Reject</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <button onClick={() => setStepModal(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveStep} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md">{editStep ? "Update" : "Add Step"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
