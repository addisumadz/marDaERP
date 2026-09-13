"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvGrnService {
  async getAll({ page = 0, size = 20, storeId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-grns/all?page=${page}&size=${size}`;
    if (storeId) url += `&storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-grns/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-grns`, data, { headers: authHeader(token) });
    return res.data;
  }

  async confirm(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-grns/${id}/confirm`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async getOpenPurchaseOrders() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-grns/open-purchase-orders`, { headers: authHeader(token) });
    return res.data;
  }
}

const invGrnService = new InvGrnService();
export default invGrnService;
