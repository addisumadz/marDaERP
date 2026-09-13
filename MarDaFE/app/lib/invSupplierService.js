"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvSupplierService {
  async getAll({ page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-suppliers/all?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getAllActive() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-suppliers/active`, { headers: authHeader(token) });
    const data = res.data;
    return Array.isArray(data) ? data : data.content || [];
  }

  async search(q, { page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-suppliers/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-suppliers/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-suppliers`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-suppliers/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-suppliers/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invSupplierService = new InvSupplierService();
export default invSupplierService;
