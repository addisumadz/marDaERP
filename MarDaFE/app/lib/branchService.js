"use client";
import authHeader from "./authHeader/authhheader";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BranchService {
  async getAll() {
    const res = await axios.get(`${commonUrl}branchs/all`, { headers: authHeader() });
    return res.data;
  }

  async getByStatus(status, page = 0, size = 10) {
    const res = await axios.get(`${commonUrl}branchs/status/${status}`,
      { params: { page, size }, headers: authHeader() }
    );
    return res.data;
  }

  async getById(id) {
    const res = await axios.get(`${commonUrl}branchs/${id}`, { headers: authHeader() });
    return res.data;
  }

  async create(payload) {
    const res = await axios.post(`${commonUrl}branchs`, payload, { headers: authHeader() });
    return res.data;
  }

  async update(id, payload) {
    const res = await axios.put(`${commonUrl}branchs/${id}`, payload, { headers: authHeader() });
    return res.data;
  }

  async deactivate(id) {
    const res = await axios.post(`${commonUrl}branchs/${id}/deactivate`, {}, { headers: authHeader() });
    return res.data;
  }

  async activate(id) {
    const res = await axios.post(`${commonUrl}branchs/${id}/activate`, {}, { headers: authHeader() });
    return res.data;
  }

  async getStatistics() {
    const res = await axios.get(`${commonUrl}branchs/statistics`, { headers: authHeader() });
    return res.data;
  }
}
