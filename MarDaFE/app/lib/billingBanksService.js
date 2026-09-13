"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BillingBanksService {
  /**
   * Fetches all billing banks
   * @returns {Promise<Array>} The list of billing banks
   */
  async getAllBillingBanks() {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}billing-banks/all`, {
        headers: authHeader(token),
      });
      //console.log("res.data bank", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching all billing banks:", error);
      throw error;
    }
  }

  /**
   * Fetches a paginated list of billing banks
   * @param {object} params - The parameters for pagination
   * @param {number} params.pageIndex - The current page index
   * @param {number} params.pageSize - The number of items per page
   * @param {string} params.status - The status to filter by
   * @returns {Promise<object>} The paginated data from the API
   */
  async getBillingBanksPaginated({ pageIndex, pageSize, status }) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}billing-banks/by-status/${status}?page=${pageIndex}&size=${pageSize}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching paginated billing banks:", error);
      throw error;
    }
  }

  /**
   * Fetches a single billing bank by ID
   * @param {number} id - The ID of the billing bank
   * @returns {Promise<object>} The billing bank data
   */
  async getBillingBankById(id) {
    if (!id) return null;
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}billing-banks/${id}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching billing bank with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Creates a new billing bank
   * @param {object} bankData - The billing bank data to create
   * @returns {Promise<object>} The created billing bank
   */
  async createBillingBank(bankData) {
    try {
      const token = getAccesToken();
      const res = await axios.post(`${commonUrl}billing-banks`, bankData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error creating billing bank:", error);
      throw error;
    }
  }

  /**
   * Updates an existing billing bank
   * @param {number} id - The ID of the billing bank to update
   * @param {object} bankData - The updated billing bank data
   * @returns {Promise<object>} The updated billing bank
   */
  async updateBillingBank(id, bankData) {
    try {
      const token = getAccesToken();
      const res = await axios.put(`${commonUrl}billing-banks/${id}`, bankData, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error(`Error updating billing bank with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activates a billing bank
   * @param {number} id - The ID of the billing bank to activate
   * @returns {Promise<object>} The activated billing bank
   */
  async activateBillingBank(id) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}billing-banks/${id}/activate`,
        {},
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error activating billing bank with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivates a billing bank (soft delete)
   * @param {object} params - The parameters for deactivation
   * @param {number} params.id - The ID of the billing bank
   * @param {string} [params.remark] - Optional remark for deactivation
   * @returns {Promise<object>} The deactivated billing bank
   */
  async deactivateBillingBank({ id, remark = "" }) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}billing-banks/${id}/deactivate`,
        { remark },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error deactivating billing bank with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Gets billing bank statistics
   * @returns {Promise<object>} The statistics data
   */
  async getBankStatistics() {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}billing-banks/statistics`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching bank statistics:", error);
      throw error;
    }
  }

  /**
   * Gets current user's permissions for a page code.
   * For BillingBanks, this still calls the existing /billing-banks/permissions endpoint,
   * but allows the caller to be explicit about the pageCode for future generalization.
   *
   * @param {string} [pageCode="billingBanks"] - The page code to use for permission lookup
   * @returns {Promise<object>} The permissions data
   */
  async getPagePermissions(pageCode = "billingBanks") {
    try {
      const token = getAccesToken();
      // Currently backend BillingBanksController is hard-wired to use its own PAGE_CODE,
      // so we ignore pageCode in the URL and keep compatibility.
      const res = await axios.get(`${commonUrl}billing-banks/permissions`, {
        headers: authHeader(token),
      });
      return {
        ...res.data,
        pageCode,
      };
    } catch (error) {
      console.error("Error fetching billing bank page permissions:", error);
      throw error;
    }
  }

  /**
   * Gets all active banks
   * @returns {Promise<Array>} The list of active banks
   */
  async getActiveBanks() {
    try {
      return await this.getBillingBanksPaginated({ 
        status: 'ACTIVE', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for active banks
      });
    } catch (error) {
      console.error("Error fetching active banks:", error);
      throw error;
    }
  }

  /**
   * Gets all deleted banks
   * @returns {Promise<Array>} The list of deleted banks
   */
  async getDeletedBanks() {
    try {
      return await this.getBillingBanksPaginated({ 
        status: 'DELETED', 
        pageIndex: 0, 
        pageSize: 1000 // Assuming a reasonable limit for deleted banks
      });
    } catch (error) {
      console.error("Error fetching deleted banks:", error);
      throw error;
    }
  }
}

const billingBanksService = new BillingBanksService();
export default billingBanksService;
