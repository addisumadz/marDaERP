"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvStockCountService {
  async getAll({ page = 0, size = 20, storeId, status } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-stock-counts/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    if (status) url += `&status=${status}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stock-counts/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async plan(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-stock-counts/plan`, data, { headers: authHeader(token) });
    return res.data;
  }

  async startCounting(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-stock-counts/${id}/start-counting`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async saveCount(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-stock-counts/${id}/save-count`, data, { headers: authHeader(token) });
    return res.data;
  }

  async reconcile(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-stock-counts/${id}/reconcile`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async cancel(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-stock-counts/${id}/cancel`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const invStockCountService = new InvStockCountService();
export default invStockCountService;
