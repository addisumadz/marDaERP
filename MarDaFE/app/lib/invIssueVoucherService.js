"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvIssueVoucherService {
  async getAll({ page = 0, size = 20, storeId, status } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-issue-vouchers/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    if (status) url += `&status=${status}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-issue-vouchers/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-issue-vouchers`, data, { headers: authHeader(token) });
    return res.data;
  }

  async approve(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-issue-vouchers/${id}/approve`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async issue(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-issue-vouchers/${id}/issue`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const invIssueVoucherService = new InvIssueVoucherService();
export default invIssueVoucherService;
