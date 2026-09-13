"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvUnitService {
  async getAll({ page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-units/all?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getAllActive() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-units/active`, { headers: authHeader(token) });
    const data = res.data;
    return Array.isArray(data) ? data : data.content || [];
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-units/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-units`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-units/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-units/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async toggleActive(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-units/${id}/toggle-active`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const invUnitService = new InvUnitService();
export default invUnitService;
