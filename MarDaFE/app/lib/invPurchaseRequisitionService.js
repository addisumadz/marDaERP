"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvPurchaseRequisitionService {
  async getAll({ page = 0, size = 20, storeId, status } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-purchase-requisitions/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    if (status) url += `&status=${status}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-purchase-requisitions/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-purchase-requisitions`, data, { headers: authHeader(token) });
    return res.data;
  }

  async submit(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-requisitions/${id}/submit`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async approveL1(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-requisitions/${id}/approve-l1`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async approveL2(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-requisitions/${id}/approve-l2`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async reject(id, reason) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-purchase-requisitions/${id}/reject`, { reason }, { headers: authHeader(token) });
    return res.data;
  }
}

const invPurchaseRequisitionService = new InvPurchaseRequisitionService();
export default invPurchaseRequisitionService;
