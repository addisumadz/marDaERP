"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvPurchaseOrderService {
  async getAll({ page = 0, size = 20, status, storeId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-purchase-orders/all?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    if (storeId) url += `&storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-purchase-orders/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-purchase-orders`, data, { headers: authHeader(token) });
    return res.data;
  }

  async submit(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-orders/${id}/submit`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async approveL1(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-orders/${id}/approve-l1`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async approveL2(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-orders/${id}/approve-l2`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async sendToSupplier(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-orders/${id}/send-to-supplier`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async reject(id, reason) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-orders/${id}/reject`, { reason }, { headers: authHeader(token) });
    return res.data;
  }

  async getApprovedRequisitions() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-purchase-orders/approved-requisitions`, { headers: authHeader(token) });
    return res.data;
  }
}

const invPurchaseOrderService = new InvPurchaseOrderService();
export default invPurchaseOrderService;
