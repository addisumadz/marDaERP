"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvItemService {
  async getAll({ page = 0, size = 20, categoryId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-items/all?page=${page}&size=${size}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getAllActive() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-items/active`, { headers: authHeader(token) });
    const data = res.data;
    return Array.isArray(data) ? data : data.content || [];
  }

  async search(q, { page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-items/search?q=${encodeURIComponent(q)}&page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-items/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async getItemStock(id, storeId) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-items/${id}/stock`;
    if (storeId) url += `?storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getLowStock() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-items/low-stock`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-items`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-items/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-items/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invItemService = new InvItemService();
export default invItemService;
