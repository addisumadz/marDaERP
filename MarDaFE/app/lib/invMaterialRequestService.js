"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvMaterialRequestService {
  async getAll({ page = 0, size = 20, storeId, branchId, status } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-material-requests/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    if (branchId) url += `&branchId=${branchId}`;
    if (status) url += `&status=${status}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-material-requests/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-material-requests`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-material-requests/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async submit(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-material-requests/${id}/submit`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async cancel(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-material-requests/${id}/cancel`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-material-requests/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invMaterialRequestService = new InvMaterialRequestService();
export default invMaterialRequestService;
