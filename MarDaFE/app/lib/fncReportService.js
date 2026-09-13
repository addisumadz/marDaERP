"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncReportService {
  async getTrialBalance(fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-reports/trial-balance?fiscalYearId=${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }

  async getIncomeStatement(fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-reports/income-statement?fiscalYearId=${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }

  async getBalanceSheet(fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-reports/balance-sheet?fiscalYearId=${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }

  async getGeneralLedger(accountId, fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-reports/general-ledger?accountId=${accountId}&fiscalYearId=${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }
}

const fncReportService = new FncReportService();
export default fncReportService;
