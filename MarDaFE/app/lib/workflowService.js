"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class WorkflowService {
  // ─── Templates ──────────────────────────────────────
  async getTemplates() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/templates`, { headers: authHeader(token) });
    return res.data;
  }

  async getActiveTemplates() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/templates/active`, { headers: authHeader(token) });
    return res.data;
  }

  async getTemplate(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/templates/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async createTemplate(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}workflows/templates`, data, { headers: authHeader(token) });
    return res.data;
  }

  async updateTemplate(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}workflows/templates/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async deleteTemplate(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}workflows/templates/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  // ─── Steps ──────────────────────────────────────────
  async getSteps(templateId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/templates/${templateId}/steps`, { headers: authHeader(token) });
    return res.data;
  }

  async addStep(templateId, data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}workflows/templates/${templateId}/steps`, data, { headers: authHeader(token) });
    return res.data;
  }

  async updateStep(stepId, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}workflows/steps/${stepId}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async deleteStep(stepId) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}workflows/steps/${stepId}`, { headers: authHeader(token) });
    return res.data;
  }

  // ─── Instances ──────────────────────────────────────
  async getInstance(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/instances/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async getInstanceByDocument(documentType, documentId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/instances/by-document?documentType=${documentType}&documentId=${documentId}`, { headers: authHeader(token) });
    return res.data;
  }

  async approveStep(instanceId, comments) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}workflows/instances/${instanceId}/approve`, { comments }, { headers: authHeader(token) });
    return res.data;
  }

  async rejectStep(instanceId, reason) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}workflows/instances/${instanceId}/reject`, { reason }, { headers: authHeader(token) });
    return res.data;
  }

  async getMyPending() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/my-pending`, { headers: authHeader(token) });
    return res.data;
  }

  async getMyPendingCount() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/my-pending/count`, { headers: authHeader(token) });
    return res.data;
  }

  // ─── Role Assignments ───────────────────────────────
  async getRoleAssignments() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/role-assignments`, { headers: authHeader(token) });
    return res.data;
  }

  async getUserRoles(userId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/role-assignments/user/${userId}`, { headers: authHeader(token) });
    return res.data;
  }

  async assignRole(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}workflows/role-assignments`, data, { headers: authHeader(token) });
    return res.data;
  }

  async revokeRole(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}workflows/role-assignments/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  // ─── Reference ──────────────────────────────────────
  async getAllRoles() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/roles`, { headers: authHeader(token) });
    return res.data;
  }

  async getAllUsers() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/users`, { headers: authHeader(token) });
    return res.data;
  }

  // ─── Menu Permissions (Visual Sidebar Mapping) ──────
  async getMenuPermissions(roleId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}workflows/menu-permissions/${roleId}`, { headers: authHeader(token) });
    return Array.isArray(res.data) ? res.data : [];
  }

  async saveMenuPermissions(roleId, pageCodes) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}workflows/menu-permissions/${roleId}`, { pageCodes }, { headers: authHeader(token) });
    return res.data;
  }
}

const workflowService = new WorkflowService();
export default workflowService;
