"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncFiscalYearService {
  async getAllFiscalYears() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-fiscal-years/all`, { headers: authHeader(token) });
    return res.data;
  }

  async getCurrentFiscalYear() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-fiscal-years/current`, { headers: authHeader(token) });
    return res.data;
  }

  async getOpenFiscalYears() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-fiscal-years/open`, { headers: authHeader(token) });
    return res.data;
  }

  async createFiscalYear(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}fnc-fiscal-years`, data, { headers: authHeader(token) });
    return res.data;
  }

  async closeFiscalYear(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-fiscal-years/${id}/close`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async reopenFiscalYear(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-fiscal-years/${id}/reopen`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async carryForwardBalances(closedId, newId) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-fiscal-years/${closedId}/carry-forward?newFiscalYearId=${newId}`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const fncFiscalYearService = new FncFiscalYearService();
export default fncFiscalYearService;
