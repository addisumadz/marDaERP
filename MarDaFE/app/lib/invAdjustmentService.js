"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvAdjustmentService {
  async getAll({ page = 0, size = 20, storeId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-adjustments/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-adjustments/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-adjustments`, data, { headers: authHeader(token) });
    return res.data;
  }

  async approve(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-adjustments/${id}/approve`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async apply(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-adjustments/${id}/apply`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const invAdjustmentService = new InvAdjustmentService();
export default invAdjustmentService;
