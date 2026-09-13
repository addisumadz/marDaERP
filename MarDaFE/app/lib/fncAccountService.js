"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncAccountService {
  async getAllAccounts() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-accounts/all`, { headers: authHeader(token) });
    return res.data;
  }

  async getAccountTree() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-accounts/tree`, { headers: authHeader(token) });
    return res.data;
  }

  async getPostableAccounts() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-accounts/postable`, { headers: authHeader(token) });
    return res.data;
  }

  async getAccountsByType(type) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-accounts/by-type/${type}`, { headers: authHeader(token) });
    return res.data;
  }

  async searchAccounts(query) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-accounts/search?q=${encodeURIComponent(query)}`, { headers: authHeader(token) });
    return res.data;
  }

  async getAccountById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-accounts/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async createAccount(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}fnc-accounts`, data, { headers: authHeader(token) });
    return res.data;
  }

  async updateAccount(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-accounts/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async deactivateAccount(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-accounts/${id}/deactivate`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async activateAccount(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-accounts/${id}/activate`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const fncAccountService = new FncAccountService();
export default fncAccountService;
