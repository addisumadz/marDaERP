"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncCashBookService {
  async getCashBankAccounts() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-cashbook/accounts`, { headers: authHeader(token) });
    return res.data;
  }

  async getEntries(accountId, fiscalYearId, startDate, endDate) {
    const token = getAccesToken();
    let url = `${commonUrl}fnc-cashbook/entries?accountId=${accountId}&fiscalYearId=${fiscalYearId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getSummary(fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-cashbook/summary?fiscalYearId=${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }
}

const fncCashBookService = new FncCashBookService();
export default fncCashBookService;
