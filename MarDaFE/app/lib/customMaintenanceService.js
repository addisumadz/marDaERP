"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class CustomMaintenanceService {
  getHeaders() {
    const token = getAccesToken();
    return authHeader(token);
  }

  // 1. Maintenance Requests
  async createRequest(data) {
    const res = await axios.post(`${commonUrl}custom-maintenance/requests`, data, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getRequests({ page = 0, size = 20, status, branchId, maintenanceTypeId, search } = {}) {
    let url = `${commonUrl}custom-maintenance/requests?page=${page}&size=${size}`;
    if (status && status !== "ALL") url += `&status=${encodeURIComponent(status)}`;
    if (branchId) url += `&branchId=${branchId}`;
    if (maintenanceTypeId) url += `&maintenanceTypeId=${maintenanceTypeId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await axios.get(url, { headers: this.getHeaders() });
    return res.data;
  }

  async getRequestById(id) {
    const res = await axios.get(`${commonUrl}custom-maintenance/requests/${id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getDepartmentStats(branchId = null) {
    const url = branchId
      ? `${commonUrl}custom-maintenance/stats?branchId=${branchId}`
      : `${commonUrl}custom-maintenance/stats`;
    const res = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  // 2. Technical Survey (Step 2)
  async assignSurveyPlumber(id, { plumberId, notes }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/assign-survey-plumber`,
      { plumberId, notes },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 3. Technical Survey Submission (Step 3)
  async submitSurvey(id, { maintenanceTypeId, plumberNotes, items, fees }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/submit-survey`,
      { maintenanceTypeId, plumberNotes, items, fees },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 4. Revenue Payment Approval (Step 4)
  async approvePayment(id, { receiptNumber, referenceNumber, remarks, updatedItems, updatedFees }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/approve-payment`,
      { receiptNumber, referenceNumber, remarks, updatedItems, updatedFees },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async getRequestItems(id) {
    const res = await axios.get(`${commonUrl}custom-maintenance/requests/${id}/items`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async getRequestFees(id) {
    const res = await axios.get(`${commonUrl}custom-maintenance/requests/${id}/fees`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  // 5. Store Material Dispatch (Step 5)
  async dispatchMaterials(id, { storeId, remarks }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/dispatch-materials`,
      { storeId, remarks },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 6. Maintenance Execution (Step 6)
  async assignMaintenancePlumber(id, { plumberId, notes }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/assign-maintenance-plumber`,
      { plumberId, notes },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 7. Maintenance Completion & Verification (Step 7)
  async completeMaintenance(id, { notes, finalMeterReading }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/complete-maintenance`,
      { notes, finalMeterReading },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 7.1 Activity Logs & Audit Timeline
  async getMaintenanceLogs(id) {
    const res = await axios.get(`${commonUrl}custom-maintenance/requests/${id}/logs`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  // 7.2 Supervisory Operations
  async reassignPlumber(id, { plumberId, mode = "survey", reason = "" }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/reassign-plumber`,
      { plumberId, mode, reason },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async rejectOrCancelRequest(id, { actionType = "REJECT_SURVEY_UNFEASIBLE", reason = "" }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/reject-cancel`,
      { actionType, reason },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async rejectOrCancelApplication(id, params) {
    return this.rejectOrCancelRequest(id, params);
  }

  async returnForRevision(id, { remarks = "" }) {
    const res = await axios.put(
      `${commonUrl}custom-maintenance/requests/${id}/return-revision`,
      { remarks },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 8. Reference Catalogs & Types
  async getMaintenanceTypes() {
    const res = await axios.get(`${commonUrl}custom-maintenance/maintenance-types`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async saveMaintenanceType(type) {
    const res = await axios.post(`${commonUrl}custom-maintenance/maintenance-types`, type, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getCommonMaterials(maintenanceTypeId = null) {
    let url = `${commonUrl}custom-maintenance/common-materials`;
    if (maintenanceTypeId) url += `?maintenanceTypeId=${maintenanceTypeId}`;
    const res = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async saveCommonMaterial(material) {
    const res = await axios.post(`${commonUrl}custom-maintenance/common-materials`, material, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async deleteCommonMaterial(id) {
    const res = await axios.delete(`${commonUrl}custom-maintenance/common-materials/${id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getFeeTypes() {
    const res = await axios.get(`${commonUrl}custom-maintenance/fee-types`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async getAvailablePlumbers(branchId = null) {
    const url = branchId
      ? `${commonUrl}custom-maintenance/plumbers?branchId=${branchId}`
      : `${commonUrl}custom-maintenance/plumbers`;
    const res = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async getBranchCatalogStock(branchId = null, maintenanceTypeId = null) {
    let url = `${commonUrl}custom-maintenance/branch-catalog-stock`;
    const params = [];
    if (branchId) params.push(`branchId=${branchId}`);
    if (maintenanceTypeId) params.push(`maintenanceTypeId=${maintenanceTypeId}`);
    if (params.length > 0) url += `?${params.join("&")}`;
    const res = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return res.data || { items: [] };
  }
}

const customMaintenanceService = new CustomMaintenanceService();
export default customMaintenanceService;
