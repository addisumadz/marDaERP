"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class UserRoleCrudService {
  async getAll() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}user-roles/all`, { headers: authHeader(token) });
    return Array.isArray(res.data) ? res.data : [];
  }

  async getByStatus(status, page = 0, size = 20) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}user-roles/status/${status}?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}user-roles/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}user-roles`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}user-roles/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async deactivate(id) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}user-roles/${id}/deactivate`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async activate(id) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}user-roles/${id}/activate`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async getStatistics() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}user-roles/statistics`, { headers: authHeader(token) });
    return res.data;
  }
}

const userRoleCrudService = new UserRoleCrudService();
export default userRoleCrudService;
