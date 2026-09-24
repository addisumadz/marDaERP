"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class CustomNewLineConnectionService {
  getHeaders() {
    const token = getAccesToken();
    return authHeader(token);
  }

  // 1. Applications
  async createApplication(data) {
    const res = await axios.post(`${commonUrl}custom-new-line/applications`, data, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getApplications({ page = 0, size = 20, status, branchId, search } = {}) {
    let url = `${commonUrl}custom-new-line/applications?page=${page}&size=${size}`;
    if (status && status !== "ALL") url += `&status=${encodeURIComponent(status)}`;
    if (branchId) url += `&branchId=${branchId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    const res = await axios.get(url, { headers: this.getHeaders() });
    return res.data;
  }

  async getApplicationById(id) {
    const res = await axios.get(`${commonUrl}custom-new-line/applications/${id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getDepartmentStats(branchId = null) {
    const url = branchId
      ? `${commonUrl}custom-new-line/stats?branchId=${branchId}`
      : `${commonUrl}custom-new-line/stats`;
    const res = await axios.get(url, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  // 2. Technical Survey
  async assignSurveyPlumber(id, { plumberId, notes }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/assign-survey-plumber`,
      { plumberId, notes },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async submitSurvey(id, { plumberNotes, items, fees }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/submit-survey`,
      { plumberNotes, items, fees },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 3. Revenue Payment Approval
  async approvePayment(id, { receiptNumber, referenceNumber, remarks, updatedItems, updatedFees }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/approve-payment`,
      { receiptNumber, referenceNumber, remarks, updatedItems, updatedFees },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async getApplicationItems(id) {
    const res = await axios.get(`${commonUrl}custom-new-line/applications/${id}/items`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async getApplicationFees(id) {
    const res = await axios.get(`${commonUrl}custom-new-line/applications/${id}/fees`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  // 4. Store Material Dispatch
  async dispatchMaterials(id, { storeId, remarks }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/dispatch-materials`,
      { storeId, remarks },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 5. Installation Stage
  async assignInstallationPlumber(id, { plumberId, notes }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/assign-installation-plumber`,
      { plumberId, notes },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async completeInstallation(id, { notes }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/complete-installation`,
      { notes },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 6. Final Customer Activation
  async finalizeActivation(id, data) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/finalize-activation`,
      data,
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 7. Supervisory & Management Operations
  async getApplicationLogs(id) {
    const res = await axios.get(`${commonUrl}custom-new-line/applications/${id}/logs`, {
      headers: this.getHeaders(),
    });
    return res.data || [];
  }

  async reassignPlumber(id, { plumberId, mode = "survey", reason = "" }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/reassign-plumber`,
      { plumberId, mode, reason },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async rejectOrCancelApplication(id, { actionType = "REJECT_SURVEY_UNFEASIBLE", reason = "" }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/reject-cancel`,
      { actionType, reason },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  async returnForRevision(id, { remarks = "" }) {
    const res = await axios.put(
      `${commonUrl}custom-new-line/applications/${id}/return-revision`,
      { remarks },
      { headers: this.getHeaders() }
    );
    return res.data;
  }

  // 8. Catalogs & Auxiliary
  async getCommonMaterials() {
    const res = await axios.get(`${commonUrl}custom-new-line/common-materials`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async saveCommonMaterial(material) {
    const res = await axios.post(`${commonUrl}custom-new-line/common-materials`, material, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async deleteCommonMaterial(id) {
    const res = await axios.delete(`${commonUrl}custom-new-line/common-materials/${id}`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getFeeTypes() {
    const res = await axios.get(`${commonUrl}custom-new-line/fee-types`, {
      headers: this.getHeaders(),
    });
    return res.data;
  }

  async getAvailablePlumbers(branchId) {
    let url = `${commonUrl}custom-new-line/plumbers`;
    if (branchId) url += `?branchId=${branchId}`;
    const res = await axios.get(url, { headers: this.getHeaders() });
    return res.data;
  }

  async getBranchCatalogStock(branchId) {
    let url = `${commonUrl}custom-new-line/branch-catalog-stock`;
    if (branchId) url += `?branchId=${branchId}`;
    const res = await axios.get(url, { headers: this.getHeaders() });
    return res.data;
  }
}

const customNewLineConnectionService = new CustomNewLineConnectionService();
export default customNewLineConnectionService;
