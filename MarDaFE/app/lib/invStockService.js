"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvStockQueryService {
  async getStockByStore(storeId, { page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stock/by-store/${storeId}?page=${page}&size=${size}`, { headers: authHeader(token) });
    return res.data;
  }

  async getItemStock(itemId, storeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stock/item/${itemId}/store/${storeId}`, { headers: authHeader(token) });
    return res.data;
  }

  async getLowStock(storeId) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-stock/low-stock`;
    if (storeId) url += `?storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getStockValuation(storeId) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-stock/valuation`;
    if (storeId) url += `?storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getTransactions({ itemId, storeId, page = 0, size = 20 } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-stock/transactions?page=${page}&size=${size}`;
    if (itemId) url += `&itemId=${itemId}`;
    if (storeId) url += `&storeId=${storeId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getStockCard(itemId, storeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-stock/stock-card?itemId=${itemId}&storeId=${storeId}`, { headers: authHeader(token) });
    return res.data;
  }
}

const invStockQueryService = new InvStockQueryService();
export default invStockQueryService;
