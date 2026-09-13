"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class UserAccountService {
  async getAllUsers() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}users/all`, { headers: authHeader(token) });
    return res.data;
  }

  async getUsersPaginated({ pageIndex, pageSize, status }) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}users/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async getUserById(id) {
    if (!id) return null;
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}users/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async createUser(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}users`, data, { headers: authHeader(token) });
    return res.data;
  }

  async updateUser(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}users/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async deactivateUser({ id }) {
    const token = getAccesToken();
    await axios.put(`${commonUrl}users/${id}/deactivate`, {}, { headers: authHeader(token) });
  }

  async activateUser(id) {
    const token = getAccesToken();
    await axios.put(`${commonUrl}users/${id}/activate`, {}, { headers: authHeader(token) });
  }

  async deleteUser(id) {
    const token = getAccesToken();
    await axios.delete(`${commonUrl}users/${id}`, { headers: authHeader(token) });
  }

  async changePassword(id, payload) {
    const token = getAccesToken();
    await axios.put(`${commonUrl}users/${id}/change-password`, payload, { headers: authHeader(token) });
  }
}
