"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BillingPenaltyTarifService {
  // Get all penalty tarifs
  async getAllPenaltyTarifs() {
    const response = await axios.get(
      `${commonUrl}billing-penalty-tarifs/all`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Get penalty tarifs by status with pagination
  async getPenaltyTarifsByStatus(status, page = 0, size = 10) {
    const response = await axios.get(
      `${commonUrl}billing-penalty-tarifs/status/${status}`,
      {
        params: { page, size },
        headers: authHeader(),
      }
    );
    return response.data;
  }

  // Get penalty tarif by ID
  async getPenaltyTarifById(id) {
    const response = await axios.get(
      `${commonUrl}billing-penalty-tarifs/${id}`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Create new penalty tarif
  async createPenaltyTarif(penaltyTarifData) {
    const response = await axios.post(
      `${commonUrl}billing-penalty-tarifs`,
      penaltyTarifData,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Update existing penalty tarif
  async updatePenaltyTarif(id, penaltyTarifData) {
    const response = await axios.put(
      `${commonUrl}billing-penalty-tarifs/${id}`,
      penaltyTarifData,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Deactivate penalty tarif
  async deactivatePenaltyTarif(payload) {
    const response = await axios.post(
      `${commonUrl}billing-penalty-tarifs/${payload.id}/deactivate`,
      { remark: payload.remark },
      { headers: authHeader() }
    );
    return response.data;
  }

  // Activate penalty tarif
  async activatePenaltyTarif(id) {
    const response = await axios.post(
      `${commonUrl}billing-penalty-tarifs/${id}/activate`,
      {},
      { headers: authHeader() }
    );
    return response.data;
  }

  // Get penalty tarifs by customer type
  async getPenaltyTarifsByCustomerType(customerTypeId, page = 0, size = 10) {
    const response = await axios.get(
      `${commonUrl}billing-penalty-tarifs/customer-type/${customerTypeId}`,
      {
        params: { page, size },
        headers: authHeader(),
      }
    );
    return response.data;
  }

  // Get active customer types for dropdown
  async getActiveCustomerTypes() {
    const response = await axios.get(
      `${commonUrl}billing-penalty-tarifs/customer-types/active`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Get penalty tarif statistics
  async getPenaltyTarifStatistics() {
    const response = await axios.get(
      `${commonUrl}billing-penalty-tarifs/statistics`,
      { headers: authHeader() }
    );
    return response.data;
  }

  // Check if penalty tarif exists by customer type and number of months
  async checkPenaltyTarifExists(customerTypeId, numberOfMonth, excludeId = null) {
    let url = `${commonUrl}billing-penalty-tarifs/exists?customerTypeId=${customerTypeId}&numberOfMonth=${numberOfMonth}`;
    if (excludeId) {
      url += `&excludeId=${excludeId}`;
    }
    const response = await axios.get(url, {
      headers: authHeader(),
    });
    return response.data;
  }
}
