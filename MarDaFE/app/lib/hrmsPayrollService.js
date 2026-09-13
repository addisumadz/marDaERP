"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class HrmsPayrollService {
  async getPayrollRuns() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll/runs`, { headers: authHeader(token) });
    return res.data;
  }

  async getPayrollRunById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll/runs/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async getPayrollRunItems(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll/runs/${id}/items`, { headers: authHeader(token) });
    return res.data;
  }

  async generatePayrollRun(payload, userId = 1) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/payroll/runs/generate?userId=${userId}`, payload, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async getTaxBrackets() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll/tax-brackets`, { headers: authHeader(token) });
    return res.data;
  }

  async getSalaryConfigurations() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll/salary-configurations`, { headers: authHeader(token) });
    return res.data;
  }

  async previewJournal(payrollRunId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll-journal/preview/${payrollRunId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async pushPayrollToJournal(payrollRunId) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/payroll-journal/push/${payrollRunId}`, {}, {
      headers: authHeader(token),
    });
    return res.data;
  }

  getCbeExportUrl(payrollRunId) {
    return `${commonUrl}hrms/bank-disbursement/cbe/${payrollRunId}`;
  }

  getAbayExportUrl(payrollRunId) {
    return `${commonUrl}hrms/bank-disbursement/abay/${payrollRunId}`;
  }
}

const hrmsPayrollService = new HrmsPayrollService();
export default hrmsPayrollService;
