"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class AddressCityService {
  /**
   * Fetches all address cities
   * @returns {Promise<Array>} The list of address cities
   */
  async getAllAddressCities() {
    try {
      const token = getAccesToken();
      console.log("AddressCity API call - Token:", token ? `Present (${token.length} chars)` : "Missing");
      console.log("AddressCity API call - URL:", `${commonUrl}address-cities/all`);
      console.log("AddressCity API call - Headers:", authHeader(token));
      
      const res = await axios.get(`${commonUrl}address-cities/all`, {
        headers: authHeader(token),
      });
      console.log("AddressCity API call - Success:", res.data);
      return res.data;
    } catch (error) {
      console.error("AddressCity API call - Error:", error);
      console.error("AddressCity API call - Error response:", error.response?.data);
      console.error("AddressCity API call - Error status:", error.response?.status);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of address cities
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getAddressCitiesPaginated({ pageIndex, pageSize, status }) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-cities/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching paginated address cities:", error);
      throw error;
    }
  }

  /**
   * Fetches a single address city by ID
   * @param {number} id - The ID of the address city
   * @returns {Promise<object>} The address city data
   */
  async getAddressCityById(id) {
    if (!id) return null;
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-cities/${id}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching address city with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Gets cities by zone ID
   * @param {number} zoneId - The ID of the zone
   * @returns {Promise<Array>} The list of cities in the zone
   */
  async getCitiesByZoneId(zoneId) {
    if (!zoneId) return [];
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}address-cities/zone/${zoneId}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching cities for zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new address city
   * @param {object} cityData - The address city data to create
   * @returns {Promise<object>} The created address city
   */
  async createAddressCity(cityData) {
    try {
      const token = getAccesToken();
      const res = await axios.post(`${commonUrl}address-cities`, cityData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error creating address city:", error);
      throw error;
    }
  }

  /**
   * Updates an existing address city
   * @param {number} id - The ID of the address city to update
   * @param {object} cityData - The updated address city data
   * @returns {Promise<object>} The updated address city
   */
  async updateAddressCity(id, cityData) {
    try {
      const token = getAccesToken();
      const res = await axios.put(`${commonUrl}address-cities/${id}`, cityData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating address city with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activates an address city
   * @param {number} id - The ID of the address city to activate
   * @returns {Promise<object>} The activated address city
   */
  async activateAddressCity(id) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}address-cities/${id}/activate`,
        {},
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error activating address city with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivates an address city (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the address city
   * @param {string} [params.remark] - Optional remark for deactivation
   * @returns {Promise<object>} The deactivated address city
   */
  async deactivateAddressCity({ id, remark = "" }) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}address-cities/${id}/deactivate`,
        { remark },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error deactivating address city with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deletes an address city permanently
   * @param {number} id - The ID of the address city to delete
   * @returns {Promise<void>}
   */
  async deleteAddressCity(id) {
    try {
      const token = getAccesToken();
      await axios.delete(`${commonUrl}address-cities/${id}`, {
        headers: authHeader(token),
      });
    } catch (error) {
      console.error(`Error deleting address city with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Checks if a city code already exists
   * @param {string} cityCode - The city code to check
   * @returns {Promise<boolean>} True if the code exists, false otherwise
   */
  async checkCityCodeExists(cityCode) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-cities/exists/code/${cityCode}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking if city code exists:", error);
      throw error;
    }
  }

  /**
   * Checks if a city name already exists
   * @param {string} cityName - The city name to check
   * @returns {Promise<boolean>} True if the name exists, false otherwise
   */
  async checkCityNameExists(cityName) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-cities/exists/name/${cityName}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking if city name exists:", error);
      throw error;
    }
  }

  /**
   * Gets city statistics by zone
   * @param {number} zoneId - The ID of the zone
   * @returns {Promise<object>} The statistics data
   */
  async getCityStatsByZone(zoneId) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-cities/stats/zone/${zoneId}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error fetching city statistics for zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Gets city statistics by state
   * @param {number} stateId - The ID of the state
   * @returns {Promise<object>} The statistics data
   */
  async getCityStatsByState(stateId) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}address-cities/stats/state/${stateId}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error fetching city statistics for state ${stateId}:`, error);
      throw error;
    }
  }

  /**
   * Gets all active cities
   * @returns {Promise<Array>} The list of active cities
   */
  async getActiveCities() {
    try {
      return await this.getAddressCitiesPaginated({ 
        status: 'ACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for active cities
      });
    } catch (error) {
      console.error("Error fetching active cities:", error);
      throw error;
    }
  }

  /**
   * Gets all inactive cities
   * @returns {Promise<Array>} The list of inactive cities
   */
  async getInactiveCities() {
    try {
      return await this.getAddressCitiesPaginated({ 
        status: 'INACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for inactive cities
      });
    } catch (error) {
      console.error("Error fetching inactive cities:", error);
      throw error;
    }
  }

  /**
   * Gets all deleted cities
   * @returns {Promise<Array>} The list of deleted cities
   */
  async getDeletedCities() {
    try {
      return await this.getAddressCitiesPaginated({ 
        status: 'DELETED', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for deleted cities
      });
    } catch (error) {
      console.error("Error fetching deleted cities:", error);
      throw error;
    }
  }
}

const addressCityService = new AddressCityService();
export default addressCityService;
