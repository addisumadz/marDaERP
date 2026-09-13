"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncOpeningBalanceService {
  async getByFiscalYear(fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-opening-balances/by-fiscal-year/${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }

  async saveOpeningBalance(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}fnc-opening-balances`, data, { headers: authHeader(token) });
    return res.data;
  }
}

const fncOpeningBalanceService = new FncOpeningBalanceService();
export default fncOpeningBalanceService;
