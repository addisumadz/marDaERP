"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class InvTransferService {
  async getAll({ page = 0, size = 20, status } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}inv-transfers/all?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}inv-transfers/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async create(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}inv-transfers`, data, { headers: authHeader(token) });
    return res.data;
  }

  async submit(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-transfers/${id}/submit`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async updateLines(id, lines) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-transfers/${id}/update-lines`, { lines }, { headers: authHeader(token) });
    return res.data;
  }

  async approve(id, data = {}) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-transfers/${id}/approve`, data, { headers: authHeader(token) });
    return res.data;
  }

  async ship(id, dispatchData = {}) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-transfers/${id}/ship`, dispatchData, { headers: authHeader(token) });
    return res.data;
  }

  async receive(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-transfers/${id}/receive`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async reject(id, reason = "") {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}inv-transfers/${id}/reject`, { reason }, { headers: authHeader(token) });
    return res.data;
  }
}

const invTransferService = new InvTransferService();
export default invTransferService;
