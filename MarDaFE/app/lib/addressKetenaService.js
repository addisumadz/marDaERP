"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class AddressKetenaService {
  /**
   * Fetches all address ketenas
   * @returns {Promise<Array>} The list of address ketenas
   */
  async getAllAddressKetenas() {
    try {
      const token = getAccesToken();
     // console.log("AddressKetena API call - Token:", token ? `Present (${token.length} chars)` : "Missing");
      //console.log("AddressKetena API call - URL:", `${commonUrl}address-ketenas/all`);
      //console.log("AddressKetena API call - Headers:", authHeader(token));
      
      const res = await axios.get(`${commonUrl}address-ketenas/all`, {
        headers: authHeader(token),
      });
      console.log("AddressKetena API call - Success:", res.data);
      return res.data;
    } catch (error) {
      //console.error("AddressKetena API call - Error:", error);
      //console.error("AddressKetena API call - Error response:", error.response?.data);
      //console.error("AddressKetena API call - Error status:", error.response?.status);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of address ketenas
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getAddressKetenasPaginated({ pageIndex, pageSize, status }) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-ketenas/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching paginated address ketenas:", error);
      throw error;
    }
  }

  /**
   * Fetches a single address ketena by ID
   * @param {number} id - The ID of the address ketena
   * @returns {Promise<object>} The address ketena data
   */
  async getAddressKetenaById(id) {
    if (!id) return null;
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-ketenas/${id}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching address ketena with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Gets ketenas by streets ID
   * @param {number} streetsId - The ID of the street
   * @returns {Promise<Array>} The list of ketenas in the street
   */
  async getKetenasByStreetsId(streetsId) {
    if (!streetsId) return [];
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-ketenas/streets/${streetsId}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching ketenas for street ${streetsId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new address ketena
   * @param {object} ketenaData - The address ketena data to create
   * @returns {Promise<object>} The created address ketena
   */
  async createAddressKetena(ketenaData) {
    try {
      const token = getAccesToken();
      const res = await axios.post(`${commonUrl}address-ketenas`, ketenaData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error creating address ketena:", error);
      throw error;
    }
  }

  /**
   * Updates an existing address ketena
   * @param {number} id - The ID of the address ketena to update
   * @param {object} ketenaData - The updated address ketena data
   * @returns {Promise<object>} The updated address ketena
   */
  async updateAddressKetena(id, ketenaData) {
    try {
      const token = getAccesToken();
      const res = await axios.put(`${commonUrl}address-ketenas/${id}`, ketenaData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating address ketena with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activates an address ketena
   * @param {number} id - The ID of the address ketena to activate
   * @returns {Promise<object>} The activated address ketena
   */
  async activateAddressKetena(id) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}address-ketenas/${id}/activate`,
        {},
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error activating address ketena with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivates an address ketena (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the address ketena
   * @param {string} [params.remark] - Optional remark for deactivation
   * @returns {Promise<object>} The deactivated address ketena
   */
  async deactivateAddressKetena({ id, remark = "" }) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}address-ketenas/${id}/deactivate`,
        { remark },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error deactivating address ketena with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes an address ketena permanently
   * @param {number} id - The ID of the address ketena to delete
   * @returns {Promise<void>}
   */
  async deleteAddressKetena(id) {
    try {
      const token = getAccesToken();
      await axios.delete(`${commonUrl}address-ketenas/${id}`, {
        headers: authHeader(token),
      });
    } catch (error) {
      console.error(`Error deleting address ketena with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a ketena code already exists
   * @param {string} ketenaCode - The ketena code to check
   * @returns {Promise<boolean>} True if the code exists, false otherwise
   */
  async checkKetenaCodeExists(ketenaCode) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-ketenas/exists/code/${ketenaCode}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking if ketena code exists:", error);
      throw error;
    }
  }

  /**
   * Checks if a ketena name already exists
   * @param {string} ketenaName - The ketena name to check
   * @returns {Promise<boolean>} True if the name exists, false otherwise
   */
  async checkKetenaNameExists(ketenaName) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-ketenas/exists/name/${ketenaName}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking if ketena name exists:", error);
      throw error;
    }
  }

  /**
   * Gets ketena statistics by street
   * @param {number} streetsId - The ID of the street
   * @returns {Promise<object>} The statistics data
   */
  async getKetenaStatsByStreet(streetsId) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-ketenas/stats/streets/${streetsId}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error fetching ketena statistics for street ${streetsId}:`, error);
      throw error;
    }
  }

  /**
   * Gets all active ketenas
   * @returns {Promise<Array>} The list of active ketenas
   */
  async getActiveKetenas() {
    try {
      return await this.getAddressKetenasPaginated({ 
        status: 'ACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for active ketenas
      });
    } catch (error) {
      console.error("Error fetching active ketenas:", error);
      throw error;
    }
  }

  /**
   * Gets all inactive ketenas
   * @returns {Promise<Array>} The list of inactive ketenas
   */
  async getInactiveKetenas() {
    try {
      return await this.getAddressKetenasPaginated({ 
        status: 'INACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for inactive ketenas
      });
    } catch (error) {
      console.error("Error fetching inactive ketenas:", error);
      throw error;
    }
  }

  /**
   * Gets all deleted ketenas
   * @returns {Promise<Array>} The list of deleted ketenas
   */
  async getDeletedKetenas() {
    try {
      return await this.getAddressKetenasPaginated({ 
        status: 'DELETED', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for deleted ketenas
      });
    } catch (error) {
      console.error("Error fetching deleted ketenas:", error);
      throw error;
    }
  }

  /**
   * Count ketenas by streets (legacy method for backward compatibility)
   * @param {number} streetsId - The ID of the street
   * @returns {Promise<object>} The count data
   */
  async countKetenasByStreets(streetsId) {
    try {
      const stats = await this.getKetenaStatsByStreet(streetsId);
      return stats.totalCount || 0;
    } catch (error) {
      console.error(`Error counting ketenas for street ${streetsId}:`, error);
      throw error;
    }
  }

  /**
   * Count active ketenas by streets (legacy method for backward compatibility)
   * @param {number} streetsId - The ID of the street
   * @returns {Promise<object>} The count data
   */
  async countActiveKetenasByStreets(streetsId) {
    try {
      const stats = await this.getKetenaStatsByStreet(streetsId);
      return stats.activeCount || 0;
    } catch (error) {
      console.error(`Error counting active ketenas for street ${streetsId}:`, error);
      throw error;
    }
  }
}

const addressKetenaService = new AddressKetenaService();
export default addressKetenaService;
