"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvReturnVoucherService {
  async getAll({ page = 0, size = 20, storeId, status, returnType } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-return-vouchers/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    if (status) url += `&status=${status}`;
    if (returnType) url += `&returnType=${returnType}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-return-vouchers/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-return-vouchers`, data, { headers: authHeader(token) });
    return res.data;
  }

  async approve(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-return-vouchers/${id}/approve`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async receive(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-return-vouchers/${id}/receive`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async cancel(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-return-vouchers/${id}/cancel`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async delete(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}inv-return-vouchers/${id}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invReturnVoucherService = new InvReturnVoucherService();
export default invReturnVoucherService;
