"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvGroupService {
  async getAll({ page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-groups/all?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getByCategory(categoryId, { page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-groups/by-category/${categoryId}?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getAllActive() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-groups/active`, { headers: authHeader(token) });
    const data = res.data;
    return Array.isArray(data) ? data : data.content || [];
  }

  async getActiveByCategory(categoryId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-groups/active/by-category/${categoryId}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-groups`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-groups/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-groups/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invGroupService = new InvGroupService();
export default invGroupService;
