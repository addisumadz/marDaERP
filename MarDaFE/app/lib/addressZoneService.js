"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class AddressZoneService {
  /**
   * Fetches all address zones
   * @returns {Promise<Array>} The list of address zones
   */
  async getAllAddressZones() {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-zones/all`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching all address zones:", error);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of address zones
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getAddressZonesPaginated({ pageIndex, pageSize, status }) {
    const user_accessToken = getAccesToken();
    const res = await axios.get(
      `${commonUrl}address-zones/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
      {
        headers: authHeader(user_accessToken),
      }
    );
    return res.data;
  }

  /**
   * Fetches a single address zone by ID
   * @param {number} id - The ID of the address zone
   * @returns {Promise<object>} The address zone data
   */
  async getAddressZoneById(id) {
    if (!id) return null;
    const user_accessToken = getAccesToken();
    const res = await axios.get(`${commonUrl}address-zones/${id}`, {
      headers: authHeader(user_accessToken),
    });
    return res.data;
  }

  /**
   * Creates a new address zone
   * @param {object} addressZoneData - The address zone data to create
   * @returns {Promise<object>} The created address zone
   */
  async createAddressZone(addressZoneData) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}address-zones`, addressZoneData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Updates an existing address zone
   * @param {number} id - The ID of the address zone to update
   * @param {object} addressZoneData - The updated address zone data
   * @returns {Promise<object>} The updated address zone
   */
  async updateAddressZone(id, addressZoneData) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}address-zones/${id}`, addressZoneData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Deactivates an address zone (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the address zone
   * @param {object} params.data - Additional data for deactivation
   * @returns {Promise<void>}
   */
  async deactivateAddressZone({ id, data }) {
    const token = getAccesToken();
    await axios.put(
      `${commonUrl}address-zones/${id}/deactivate`,
      data || {},
      { headers: authHeader(token) }
    );
  }

  /**
   * Activates an address zone
   * @param {number} id - The ID of the address zone to activate
   * @returns {Promise<object>} The activated address zone
   */
  async activateAddressZone(id) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}address-zones/${id}/activate`,
      {},
      { headers: authHeader(token) }
    );
    return res.data;
  }

  /**
   * Permanently deletes an address zone
   * @param {number} id - The ID of the address zone to delete
   * @returns {Promise<void>}
   */
  async deleteAddressZone(id) {
    const token = getAccesToken();
    await axios.delete(`${commonUrl}address-zones/${id}`, {
      headers: authHeader(token),
    });
  }

  /**
   * Fetches address zones by state ID
   * @param {number} stateId - The ID of the state
   * @returns {Promise<Array>} The list of address zones for the state
   */
  async getAddressZonesByStateId(stateId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}address-zones/state/${stateId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Gets zone statistics by state
   * @param {number} stateId - The ID of the state
   * @returns {Promise<object>} The zone statistics
   */
  async getZoneStatsByState(stateId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}address-zones/stats/state/${stateId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Checks if zone code exists
   * @param {string} zoneCode - The zone code to check
   * @returns {Promise<boolean>} Whether the zone code exists
   */
  async checkZoneCodeExists(zoneCode) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}address-zones/exists/code/${zoneCode}`, {
      headers: authHeader(token),
    });
    return res.data.exists;
  }

  /**
   * Checks if zone name exists
   * @param {string} zoneName - The zone name to check
   * @returns {Promise<boolean>} Whether the zone name exists
   */
  async checkZoneNameExists(zoneName) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}address-zones/exists/name/${zoneName}`, {
      headers: authHeader(token),
    });
    return res.data.exists;
  }
}

const addressZoneService = new AddressZoneService();
export default addressZoneService;
