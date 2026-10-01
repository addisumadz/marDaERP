"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvDisposalService {
  async getAll({ page = 0, size = 20, storeId, status } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-disposals/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    if (status) url += `&status=${status}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-disposals/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-disposals`, data, { headers: authHeader(token) });
    return res.data;
  }

  async submit(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-disposals/${id}/submit`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async execute(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-disposals/${id}/execute`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async cancel(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-disposals/${id}/cancel`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-disposals/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invDisposalService = new InvDisposalService();
export default invDisposalService;
