"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class AddressStreetsService {
  /**
   * Fetches all address streets
   * @returns {Promise<Array>} The list of address streets
   */
  async getAllAddressStreets() {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-streets/all`, {
        headers: authHeader(token),
      });
      console.log("res.data", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching all address streets:", error);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of address streets
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getAddressStreetsPaginated({ pageIndex, pageSize, status }) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-streets/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching paginated address streets:", error);
      throw error;
    }
  }

  /**
   * Fetches a single address street by ID
   * @param {number} id - The ID of the address street
   * @returns {Promise<object>} The address street data
   */
  async getAddressStreetById(id) {
    if (!id) return null;
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-streets/${id}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching address street with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Gets streets by city ID
   * @param {number} cityId - The ID of the city
   * @returns {Promise<Array>} The list of streets in the city
   */
  async getStreetsByCityId(cityId) {
    if (!cityId) return [];
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-streets/city/${cityId}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching streets for city ${cityId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new address street
   * @param {object} streetData - The address street data to create
   * @returns {Promise<object>} The created address street
   */
  async createAddressStreet(streetData) {
    try {
      const token = getAccesToken();
      const res = await axios.post(`${commonUrl}address-streets`, streetData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error creating address street:", error);
      throw error;
    }
  }

  /**
   * Updates an existing address street
   * @param {number} id - The ID of the address street to update
   * @param {object} streetData - The updated address street data
   * @returns {Promise<object>} The updated address street
   */
  async updateAddressStreet(id, streetData) {
    try {
      const token = getAccesToken();
      const res = await axios.put(`${commonUrl}address-streets/${id}`, streetData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating address street with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activates an address street
   * @param {number} id - The ID of the address street to activate
   * @returns {Promise<object>} The activated address street
   */
  async activateAddressStreet(id) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}address-streets/${id}/activate`,
        {},
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error activating address street with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivates an address street (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the address street
   * @param {string} [params.remark] - Optional remark for deactivation
   * @returns {Promise<object>} The deactivated address street
   */
  async deactivateAddressStreet({ id, remark = "" }) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}address-streets/${id}/deactivate`,
        { remark },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error deactivating address street with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes an address street permanently
   * @param {number} id - The ID of the address street to delete
   * @returns {Promise<void>}
   */
  async deleteAddressStreet(id) {
    try {
      const token = getAccesToken();
      await axios.delete(`${commonUrl}address-streets/${id}`, {
        headers: authHeader(token),
      });
    } catch (error) {
      console.error(`Error deleting address street with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a street code already exists
   * @param {string} streetCode - The street code to check
   * @returns {Promise<boolean>} True if the code exists, false otherwise
   */
  async checkStreetCodeExists(streetCode) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-streets/exists/code/${streetCode}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking if street code exists:", error);
      throw error;
    }
  }

  /**
   * Checks if a street name already exists
   * @param {string} streetName - The street name to check
   * @returns {Promise<boolean>} True if the name exists, false otherwise
   */
  async checkStreetNameExists(streetName) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-streets/exists/name/${streetName}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking if street name exists:", error);
      throw error;
    }
  }

  /**
   * Gets street statistics by city
   * @param {number} cityId - The ID of the city
   * @returns {Promise<object>} The statistics data
   */
  async getStreetStatsByCity(cityId) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-streets/stats/city/${cityId}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error fetching street statistics for city ${cityId}:`, error);
      throw error;
    }
  }

  /**
   * Gets all active streets
   * @returns {Promise<Array>} The list of active streets
   */
  async getActiveStreets() {
    try {
      return await this.getAddressStreetsPaginated({ 
        status: 'ACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for active streets
      });
    } catch (error) {
      console.error("Error fetching active streets:", error);
      throw error;
    }
  }

  /**
   * Gets all inactive streets
   * @returns {Promise<Array>} The list of inactive streets
   */
  async getInactiveStreets() {
    try {
      return await this.getAddressStreetsPaginated({ 
        status: 'INACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for inactive streets
      });
    } catch (error) {
      console.error("Error fetching inactive streets:", error);
      throw error;
    }
  }

  /**
   * Gets all deleted streets
   * @returns {Promise<Array>} The list of deleted streets
   */
  async getDeletedStreets() {
    try {
      return await this.getAddressStreetsPaginated({ 
        status: 'DELETED', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for deleted streets
      });
    } catch (error) {
      console.error("Error fetching deleted streets:", error);
      throw error;
    }
  }
}

const addressStreetsService = new AddressStreetsService();
export default addressStreetsService;
