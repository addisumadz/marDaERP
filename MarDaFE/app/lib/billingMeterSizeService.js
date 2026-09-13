"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BillingMeterSizeService {
  // Get all meter sizes
  async getAllMeterSizes() {
    const response = await axios.get(
      `${commonUrl}billing-meter-sizes/all`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Get meter sizes by status with pagination
  async getMeterSizesByStatus(status, page = 0, size = 10) {
    const response = await axios.get(
      `${commonUrl}billing-meter-sizes/status/${status}`,
      {
        params: { page, size },
        headers: authHeader(),
      }
    );
    return response.data;
  }

  // Get meter size by ID
  async getMeterSizeById(id) {
    const response = await axios.get(
      `${commonUrl}billing-meter-sizes/${id}`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Create new meter size
  async createMeterSize(meterSizeData) {
    const response = await axios.post(
      `${commonUrl}billing-meter-sizes`,
      meterSizeData,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Update existing meter size
  async updateMeterSize(id, meterSizeData) {
    const response = await axios.put(
      `${commonUrl}billing-meter-sizes/${id}`,
      meterSizeData,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Deactivate meter size
  async deactivateMeterSize(payload) {
    const response = await axios.post(
      `${commonUrl}billing-meter-sizes/${payload.id}/deactivate`,
      { remark: payload.remark },
      { headers: authHeader() }
    );
    return response.data;
  }

  // Activate meter size
  async activateMeterSize(id) {
    const response = await axios.post(
      `${commonUrl}billing-meter-sizes/${id}/activate`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  }

  // Get meter size statistics
  async getMeterSizeStatistics() {
    const response = await axios.get(
      `${commonUrl}billing-meter-sizes/statistics`,
      { headers: authHeader() }
    );
    return response.data;
  }
}
