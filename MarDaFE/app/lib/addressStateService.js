"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class AddressStateService {
  /**
   * Fetches all address states
   * @returns {Promise<Array>} The list of address states
   */
  async getAllAddressStates() {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-states/all`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching all address states:", error);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of address states
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getAddressStatesPaginated({ pageIndex, pageSize, status }) {
    const user_accessToken = getAccesToken();
    const res = await axios.get(
      `${commonUrl}address-states/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
      {
        headers: authHeader(user_accessToken),
      }
    );
    return res.data;
  }

  /**
   * Fetches a single address state by ID
   * @param {number} id - The ID of the address state
   * @returns {Promise<object>} The address state data
   */
  async getAddressStateById(id) {
    if (!id) return null;
    const user_accessToken = getAccesToken();
    const res = await axios.get(`${commonUrl}address-states/${id}`, {
      headers: authHeader(user_accessToken),
    });
    return res.data;
  }

  /**
   * Creates a new address state
   * @param {object} addressStateData - The address state data to create
   * @returns {Promise<object>} The created address state
   */
  async createAddressState(addressStateData) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}address-states`, addressStateData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Updates an existing address state
   * @param {number} id - The ID of the address state to update
   * @param {object} addressStateData - The updated address state data
   * @returns {Promise<object>} The updated address state
   */
  async updateAddressState(id, addressStateData) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}address-states/${id}`, addressStateData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Deactivates an address state (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the address state
   * @param {object} params.data - Additional data for deactivation
   * @returns {Promise<void>}
   */
  async deactivateAddressState({ id, data }) {
    const token = getAccesToken();
    await axios.put(
      `${commonUrl}address-states/${id}/deactivate`,
      data || {},
      { headers: authHeader(token) }
    );
  }

  /**
   * Activates an address state
   * @param {number} id - The ID of the address state to activate
   * @returns {Promise<object>} The activated address state
   */
  async activateAddressState(id) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}address-states/${id}/activate`,
      {},
      { headers: authHeader(token) }
    );
    return res.data;
  }

  /**
   * Permanently deletes an address state
   * @param {number} id - The ID of the address state to delete
   * @returns {Promise<void>}
   */
  async deleteAddressState(id) {
    const token = getAccesToken();
    await axios.delete(`${commonUrl}address-states/${id}`, {
      headers: authHeader(token),
    });
  }

  /**
   * Fetches address states by country ID
   * @param {number} countryId - The ID of the country
   * @returns {Promise<Array>} The list of address states for the country
   */
  async getAddressStatesByCountryId(countryId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}address-states/country/${countryId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }
}
