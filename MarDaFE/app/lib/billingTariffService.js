"use client";
import authHeader from "./authHeader/authhheader";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BillingTariffService {
  // Get all tariffs
  async getAllTariffs() {
    const response = await axios.get(`${commonUrl}billing-tariffs/all`, {
      headers: authHeader(),
    });
    return response.data;
  }

  // Get tariffs by status with pagination
  async getTariffsByStatus(status, page = 0, size = 10) {
    const response = await axios.get(
      `${commonUrl}billing-tariffs/status/${status}`,
      {
        params: { page, size },
        headers: authHeader(),
      }
    );
    return response.data;
  }

  // Get tariff by ID
  async getTariffById(id) {
    const response = await axios.get(`${commonUrl}billing-tariffs/${id}`, {
      headers: authHeader(),
    });
    return response.data;
  }

  // Create tariff
  async createTariff(payload) {
    const response = await axios.post(`${commonUrl}billing-tariffs`, payload, {
      headers: authHeader(),
    });
    return response.data;
  }

  // Update tariff
  async updateTariff(id, payload) {
    const response = await axios.put(
      `${commonUrl}billing-tariffs/${id}`,
      payload,
      {
        headers: authHeader(),
      }
    );
    return response.data;
  }

  // Deactivate
  async deactivateTariff(payload) {
    const response = await axios.post(
      `${commonUrl}billing-tariffs/${payload.id}/deactivate`,
      { remark: payload.remark || "" },
      { headers: authHeader() }
    );
    return response.data;
  }

  // Activate
  async activateTariff(id) {
    const response = await axios.post(
      `${commonUrl}billing-tariffs/${id}/activate`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  }
}
