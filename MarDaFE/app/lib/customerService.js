"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import getSession from "./getSession";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class CustomerService {
  /**
   * Fetches a paginated list of customer DTOs.
   * @param {object} params - The parameters for pagination.
   * @param {number} params.pageIndex - The current page index.
   * @param {number} params.pageSize - The number of items per page.
   * @param {string} params.status - The customer status to filter by.
   * @returns {Promise<object>} The paginated data from the API.
   */
  async getCustomersPaginated({ pageIndex, pageSize, status }) {
    const user_accessToken = getAccesToken();
    const res = await axios.get(
      `${commonUrl}customer/customers/paginated/${status}?page=${pageIndex}&size=${pageSize}`,
      {
        headers: authHeader(user_accessToken),
      }
    );
    // The response is a Spring Page object, e.g., { content: [], totalElements: X, ... }
    return res.data;
  }

  async getCustomersPaginatedFiltered({ pageIndex, pageSize, status, customerTypeId, kebeleId, ketenaId, branchId, readerId, search }) {
    const user_accessToken = getAccesToken();
    let url = `${commonUrl}customer/customers/paginated-filtered?status=${encodeURIComponent(status)}&page=${pageIndex}&size=${pageSize}`;
    if (customerTypeId) url += `&customerTypeId=${encodeURIComponent(customerTypeId)}`;
    if (kebeleId) url += `&kebeleId=${encodeURIComponent(kebeleId)}`;
    if (ketenaId) url += `&ketenaId=${encodeURIComponent(ketenaId)}`;
    if (branchId) url += `&branchId=${encodeURIComponent(branchId)}`;
    if (readerId) url += `&readerId=${encodeURIComponent(readerId)}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const res = await axios.get(url, {
      headers: authHeader(user_accessToken),
    });
    return res.data;
  }


  async updateAdditionalMonthlyPaymentBulk({ amount, customerIds }) {
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      return;
    }
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      return;
    }

    const token = getAccesToken();
    await axios.post(
      `${commonUrl}customer/additional-monthly-payment/bulk-update`,
      { amount, customerIds },
      { headers: authHeader(token) }
    );
  }

  async updateTechemariBulk({ fieldName, amount, customerIds }) {
    // amount is required, but can be 0. fieldName can be anything.
    if (typeof amount !== "number" || Number.isNaN(amount)) {
      console.error("Invalid amount for Techemari update:", amount);
      return;
    }
    if (!Array.isArray(customerIds) || customerIds.length === 0) {
      console.error("No customerIds provided for Techemari update");
      return;
    }

    const token = getAccesToken();
    const payload = {
      fieldName: fieldName ? fieldName : null, // Send null if empty string
      amount: amount,
      customerIds: customerIds
    };
    console.log("Sending Techemari bulk update payload:", payload);

    try {
      await axios.post(
        `${commonUrl}customer/techemari/bulk-update`,
        payload,
        { headers: authHeader(token) }
      );
    } catch (error) {
      console.error("Error in updateTechemariBulk service:", error.response || error);
      throw error; // Re-throw to be caught by page.js
    }
  }

  // Bulk assign a reader to multiple customers
  async assignReaderBulk({ readerId, customerIds }) {
    if (!readerId || !Array.isArray(customerIds) || customerIds.length === 0) return;
    const token = getAccesToken();
    await axios.post(
      `${commonUrl}customer/assign-reader`,
      { readerId, customerIds },
      { headers: authHeader(token) }
    );
  }

  /**
      * Fetches a list of all registered customers.
      */
  async getAllCustomers() {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}customer/all`, {
        headers: authHeader(token)
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching all customers:", error);
      throw error;
    }
  }

  /**
   * Fetches the full details for a single customer by their ID.
   * @param {number} id - The ID of the customer.
   * @returns {Promise<object>} The full customer data.
   */
  async getCustomerById(id) {
    if (!id) return null;
    const user_accessToken = getAccesToken();
    const res = await axios.get(`${commonUrl}customer/customer/${id}`, {
      headers: authHeader(user_accessToken),
    });
    console.log("Customer data fetched:", res.data);
    return res.data;
  }

  /**
   * Find customer by account number.
   */
  async getCustomerByAccountNumber(accountNumber) {
    if (!accountNumber) return null;
    const token = getAccesToken();
    const url = `${commonUrl}customer/by-account-number`;
    try {
      console.log("CustomerService.getCustomerByAccountNumber ->", {
        url,
        query: `accountNumber=${encodeURIComponent(accountNumber)}`,
        hasToken: Boolean(token),
      });
      // Explicitly construct query string to satisfy Spring @RequestParam
      const urlWithParams = `${url}?accountNumber=${encodeURIComponent(accountNumber)}`;
      const res = await axios.get(urlWithParams, {
        headers: authHeader(token),
      });
      console.log("CustomerService.getCustomerByAccountNumber response:", res.data);
      return res.data; // BillingCustomerInfoDTO
    } catch (error) {
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error("CustomerService.getCustomerByAccountNumber error", { status, data, message: error?.message });
      throw error;
    }
  }

  async createCustomer(customerData) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}customer`, customerData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async updateCustomer(id, customerData) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}customer/${id}`, customerData, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deactivateCustomer({ id, data }) {
    const token = getAccesToken();
    await axios.put(
      `${commonUrl}customer/${id}/deactivate`,
      data || {},
      { headers: authHeader(token) }
    );
  }

  async activateCustomer(id) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}customer/${id}/activate`,
      {},
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async completeDeleteCustomer(id) {
    if (!id) return;
    const token = getAccesToken();
    await axios.put(
      `${commonUrl}customer/${id}/complete-delete`,
      {},
      { headers: authHeader(token) }
    );
  }

  async importCustomers(file) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${commonUrl}customer/import`, formData, {
      headers: {
        ...authHeader(token),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

  async updateCustomersFromExcel(file) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${commonUrl}customer/import/update`, formData, {
      headers: {
        ...authHeader(token),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }

  async getNextAccountNumber(kebeleId) {
    if (!kebeleId) return "";
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}customer/next-account-number`, {
      params: { kebeleId },
      headers: authHeader(token),
    });
    return res.data;
  }

  // You'll also need a service for the company profile
  async getCompanySettings() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}customer/settings`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // --- Meters: BillingCustomerInfoMeter operations ---
  async getMetersByCustomer(customerId) {
    if (!customerId) return [];
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}customer/${customerId}/meters`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async createMeter(customerId, meterData) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}customer/${customerId}/meters`,
      meterData,
      {
        headers: {
          ...authHeader(token),
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  }

  async updateMeter(meterId, meterData) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}customer/meters/${meterId}`,
      meterData,
      {
        headers: {
          ...authHeader(token),
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data;
  }

  async deleteMeter(meterId) {
    const token = getAccesToken();
    await axios.delete(`${commonUrl}customer/meters/${meterId}`, {
      headers: authHeader(token),
    });
  }

  /**
   * Bulk update GPS (locationCoordination) for multiple customers.
   * @param {Array<{customerId: number, locationCoordination: string}>} entries
   */
  async updateGpsBulk(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return;
    const token = getAccesToken();
    await axios.post(
      `${commonUrl}customer/update-gps-bulk`,
      { entries },
      { headers: authHeader(token) }
    );
  }

  //   async getAllCustomers(status) {
  //     let user_accessToken = getAccesToken();
  //     const res = await axios.get(commonUrl + "customerByStatus/" + status, {
  //       method: "GET",
  //       headers: authHeader(user_accessToken),
  //     });

  //     return res;
  //   }

  //   async getCustomerById(id) {
  //     let user_accessToken = getAccesToken();

  //     const res = await axios.get(`${commonUrl}billingCustomerInfo/${id}`, {
  //       method: "GET",
  //       headers: authHeader(user_accessToken),
  //     });

  //     return res;
  //   }
}

