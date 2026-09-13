"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class AddressCountryService {
  /**
   * Fetches all address countries
   * @returns {Promise<Array>} The list of address countries
   */
  async getAllAddressCountries() {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-countries/all`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching all address countries:", error);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of address countries
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getAddressCountriesPaginated({ pageIndex, pageSize, status }) {
    const user_accessToken = getAccesToken();
    const res = await axios.get(
      `${commonUrl}address-countries/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
      {
        headers: authHeader(user_accessToken),
      }
    );
    return res.data;
  }

  /**
   * Fetches a single address country by ID
   * @param {number} id - The ID of the address country
   * @returns {Promise<object>} The address country data
   */
  async getAddressCountryById(id) {
    if (!id) return null;
    const user_accessToken = getAccesToken();
    const res = await axios.get(`${commonUrl}address-countries/${id}`, {
      headers: authHeader(user_accessToken),
    });
    return res.data;
  }

  /**
   * Creates a new address country
   * @param {object} addressCountryData - The address country data to create
   * @returns {Promise<object>} The created address country
   */
  async createAddressCountry(addressCountryData) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}address-countries`, addressCountryData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Updates an existing address country
   * @param {number} id - The ID of the address country to update
   * @param {object} addressCountryData - The updated address country data
   * @returns {Promise<object>} The updated address country
   */
  async updateAddressCountry(id, addressCountryData) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}address-countries/${id}`, addressCountryData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  /**
   * Deactivates an address country (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the address country
   * @param {object} params.data - Additional data for deactivation
   * @returns {Promise<void>}
   */
  async deactivateAddressCountry({ id, data }) {
    const token = getAccesToken();
    await axios.put(
      `${commonUrl}address-countries/${id}/deactivate`,
      data || {},
      { headers: authHeader(token) }
    );
  }

  /**
   * Activates an address country
   * @param {number} id - The ID of the address country to activate
   * @returns {Promise<object>} The activated address country
   */
  async activateAddressCountry(id) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}address-countries/${id}/activate`,
      {},
      { headers: authHeader(token) }
    );
    return res.data;
  }

  /**
   * Permanently deletes an address country
   * @param {number} id - The ID of the address country to delete
   * @returns {Promise<void>}
   */
  async deleteAddressCountry(id) {
    const token = getAccesToken();
    await axios.delete(`${commonUrl}address-countries/${id}`, {
      headers: authHeader(token),
    });
  }

}
