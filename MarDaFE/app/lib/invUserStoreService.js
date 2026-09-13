"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvUserStoreService {
  async getAll() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-store-users/all`, { headers: authHeader(token) });
    return res.data || [];
  }

  async getByStore(storeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-store-users/by-store/${storeId}`, { headers: authHeader(token) });
    return res.data || [];
  }

  async getByUser(userId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-store-users/by-user/${userId}`, { headers: authHeader(token) });
    return res.data || [];
  }

  async getMyStores() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-store-users/my-stores`, { headers: authHeader(token) });
    return res.data || [];
  }

  async assign(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-store-users`, data, { headers: authHeader(token) });
    return res.data;
  }

  async update(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-store-users/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-store-users/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invUserStoreService = new InvUserStoreService();
export default invUserStoreService;
