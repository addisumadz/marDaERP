"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvStoreService {
  async getAll({ page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stores/all?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getAllActive() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stores/active`, { headers: authHeader(token) });
    const data = res.data;
    return Array.isArray(data) ? data : data.content || [];
  }

  async getMainStore() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stores/main`, { headers: authHeader(token) });
    return res.data;
  }

  async getMyStores() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-store-users/my-stores`, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stores/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-stores`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-stores/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-stores/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invStoreService = new InvStoreService();
export default invStoreService;
