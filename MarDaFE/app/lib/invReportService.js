"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvBinCardService {
  async getBinCard({ storeId, itemId, fromDate, toDate }) {
    const token = getAccesToken();
    const url = `${commonUrl}inv-bin-card?storeId=${storeId}&itemId=${itemId}&fromDate=${fromDate}&toDate=${toDate}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }
}

class InvReportService {
  async getStockMovement({ storeId, fromDate, toDate, categoryId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-reports/stock-movement?storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getConsumption({ storeId, fromDate, toDate, departmentId, categoryId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-reports/consumption?storeId=${storeId}&fromDate=${fromDate}&toDate=${toDate}`;
    if (departmentId) url += `&departmentId=${departmentId}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }
}

export const invBinCardService = new InvBinCardService();
export const invReportService = new InvReportService();
