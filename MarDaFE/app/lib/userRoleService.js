"use client";
import authHeader from "./authHeader/authhheader";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class UserRoleService {
  async getAll() {
    const res = await axios.get(`${commonUrl}user-roles/all`, { headers: authHeader() });
    return res.data;
  }

  async getByStatus(status, page = 0, size = 10) {
    const res = await axios.get(`${commonUrl}user-roles/status/${status}`,
      { params: { page, size }, headers: authHeader() }
    );
    return res.data;
  }

  async getById(id) {
    const res = await axios.get(`${commonUrl}user-roles/${id}`, { headers: authHeader() });
    return res.data;
  }

  async create(payload) {
    const res = await axios.post(`${commonUrl}user-roles`, payload, { headers: authHeader() });
    return res.data;
  }

  async update(id, payload) {
    const res = await axios.put(`${commonUrl}user-roles/${id}`, payload, { headers: authHeader() });
    return res.data;
  }

  async deactivate(id) {
    const res = await axios.post(`${commonUrl}user-roles/${id}/deactivate`, {}, { headers: authHeader() });
    return res.data;
  }

  async activate(id) {
    const res = await axios.post(`${commonUrl}user-roles/${id}/activate`, {}, { headers: authHeader() });
    return res.data;
  }

  async getStatistics() {
    const res = await axios.get(`${commonUrl}user-roles/statistics`, { headers: authHeader() });
    return res.data;
  }
}
