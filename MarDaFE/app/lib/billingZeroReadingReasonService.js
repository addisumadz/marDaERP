"use client";
import authHeader from "./authHeader/authhheader";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BillingZeroReadingReasonService {
  // Get all reasons
  async getAllReasons() {
    const response = await axios.get(
      `${commonUrl}billing-zero-reading-reasons/all`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Get by status, paginated
  async getReasonsByStatus(status, page = 0, size = 10) {
    const response = await axios.get(
      `${commonUrl}billing-zero-reading-reasons/status/${status}`,
      { params: { page, size }, headers: authHeader() }
    );
    return response.data;
  }

  // Get by id
  async getReasonById(id) {
    const response = await axios.get(
      `${commonUrl}billing-zero-reading-reasons/${id}`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Create
  async createReason(payload) {
    const response = await axios.post(
      `${commonUrl}billing-zero-reading-reasons`,
      payload,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Update
  async updateReason(id, payload) {
    const response = await axios.put(
      `${commonUrl}billing-zero-reading-reasons/${id}`,
      payload,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Deactivate
  async deactivateReason({ id, remark }) {
    const response = await axios.post(
      `${commonUrl}billing-zero-reading-reasons/${id}/deactivate`,
      { remark },
      { headers: authHeader() }
    );
    return response.data;
  }

  // Activate
  async activateReason(id) {
    const response = await axios.post(
      `${commonUrl}billing-zero-reading-reasons/${id}/activate`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  }

  async getStatistics() {
    const response = await axios.get(
      `${commonUrl}billing-zero-reading-reasons/statistics`,
      { headers: authHeader() }
    );
    return response.data;
  }
}
