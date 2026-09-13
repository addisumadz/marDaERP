"use client";
import axios from "axios";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl(); // e.g. http://localhost:8082/api/card_managenment/

export class BankDerashService {
  async fetchByDateRange(fromDate, toDate) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}bank-payments/fetch`,
      { fromDate, toDate },
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async processByDateRange(fromDate, toDate, kifyaWer) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}bank-payments/process`,
      { fromDate, toDate, kifyaWer },
      { headers: authHeader(token) }
    );
    return res.data; // BankProcessResultDTO
  }

  async startProcessAsync(fromDate, toDate, kifyaWer) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}bank-payments/process-async`,
      { fromDate, toDate, kifyaWer },
      { headers: authHeader(token) }
    );
    return res.data; // { success, jobId }
  }

  async getProgress(jobId) {
    if (!jobId) throw new Error("jobId is required");
    const res = await axios.get(`${commonUrl}progress/${jobId}`, {
      timeout: 15000,
    });
    return res.data; // { success, total, processed, percent, done, status, message }
  }

  async getProgressLogs(jobId) {
    if (!jobId) throw new Error("jobId is required");
    const res = await axios.get(`${commonUrl}progress/${jobId}/logs`, {
      timeout: 15000,
    });
    return res.data; // { success, logs: [] }
  }

  async getProcessResult(jobId) {
    if (!jobId) throw new Error("jobId is required");
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}bank-payments/process-result/${jobId}`, {
      headers: authHeader(token),
      timeout: 90000,
    });
    return res.data; // { success, result }
  }

  async uploadCsv(file, fromDate, toDate) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fromDate', fromDate);
    formData.append('toDate', toDate);
    const res = await axios.post(
      `${commonUrl}bank-payments/upload-csv`,
      formData,
      {
        headers: {
          ...authHeader(token),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  }

  async fetchSinglePaidBill(billId) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}bank-payments/single`,
      {
        params: { billId },
        headers: authHeader(token),
      }
    );
    return res.data;
  }

  async submitSingleBill(billData) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}submit-bill-to-derash`,
      billData,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async extendBillsWithPenalty(payload) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}derash/update-bills`,
      payload,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async markBillsSentToBank(payload) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}derash/mark-sent`,
      payload,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async cancelBills(readingIds) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}derash/cancel-bills`,
      { readingIds },
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async forwardCustomersBillDataFile(file) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(
      `${commonUrl}derash/customers-bill-data-file`,
      formData,
      {
        headers: {
          ...authHeader(token),
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  }
}

const bankDerashService = new BankDerashService();
export default bankDerashService;
