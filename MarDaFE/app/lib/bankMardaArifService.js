"use client";
import axios from "axios";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl(); // e.g. http://localhost:8082/api/card_managenment/

export class BankMardaArifService {
  async fetchByDateRange(fromDate, toDate) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}mardaarif-bank-payments/fetch`,
      { fromDate, toDate },
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async startProcessAsync(fromDate, toDate, kifyaWer) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}mardaarif-bank-payments/process-async`,
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
    formData.append("file", file);
    formData.append("fromDate", fromDate);
    formData.append("toDate", toDate);

    const res = await axios.post(
      `${commonUrl}mardaarif-bank-payments/upload-csv`,
      formData,
      {
        headers: {
          ...authHeader(token),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  }

  async submitSingleBill(billData) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}submit-bill-to-mardaarif`,
      billData,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async extendBillsWithPenalty(payload) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}mardaarif/update-bills`,
      payload,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async extendBillsWithPenaltyLocal(payload) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}mardaarif/update-bills-local`,
      payload,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async forwardBulkUpdateCsvFile(fileFile) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append("file", fileFile);
    const res = await axios.post(
      `${commonUrl}mardaarif/update-bills-bulk-file`,
      formData,
      {
        headers: {
          ...authHeader(token),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  }

  async markBillsSentToMardaArif(payload) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}mardaarif/mark-sent`,
      payload,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async cancelBills(readingIds) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}mardaarif/cancel-bills`,
      { readingIds },
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async forwardCustomersBillDataFile(file) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post(
      `${commonUrl}mardaarif/customers-bill-data-file`,
      formData,
      {
        headers: {
          ...authHeader(token),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  }
}

const bankMardaArifService = new BankMardaArifService();
export default bankMardaArifService;
