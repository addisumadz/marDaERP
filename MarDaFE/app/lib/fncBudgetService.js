"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncBudgetService {
  async getAllBudgets() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-budgets/all`, { headers: authHeader(token) });
    return res.data;
  }

  async getBudgetsByFiscalYear(fyId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-budgets/by-fiscal-year/${fyId}`, { headers: authHeader(token) });
    return res.data;
  }

  async ensureBudgetForFiscalYear(fyId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-budgets/by-fiscal-year/${fyId}/ensure`, { headers: authHeader(token) });
    return res.data;
  }

  async getBudgetById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-budgets/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async createBudget(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}fnc-budgets`, data, { headers: authHeader(token) });
    return res.data;
  }

  async updateBudgetLines(id, lines) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-budgets/${id}/lines`, lines, { headers: authHeader(token) });
    return res.data;
  }

  async approveBudget(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-budgets/${id}/approve`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async deleteBudget(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}fnc-budgets/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async getBudgetVsActual(fiscalYearId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-budgets/vs-actual?fiscalYearId=${fiscalYearId}`, { headers: authHeader(token) });
    return res.data;
  }
}

const fncBudgetService = new FncBudgetService();
export default fncBudgetService;
