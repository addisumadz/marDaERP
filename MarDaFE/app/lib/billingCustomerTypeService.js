"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BillingCustomerTypeService {
  // Get all customer types
  async getAllCustomerTypes() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${commonUrl}billing-customer-types/all`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching all customer types:", error);
      throw error;
    }
  }

  // Get customer types by status with pagination
  async getCustomerTypesByStatus(status, page = 0, size = 10) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${commonUrl}billing-customer-types/status/${status}?page=${page}&size=${size}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching customer types by status:", error);
      throw error;
    }
  }

  // Get customer type by ID
  async getCustomerTypeById(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${commonUrl}billing-customer-types/${id}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching customer type by ID:", error);
      throw error;
    }
  }

  // Create new customer type
  async createCustomerType(customerTypeData) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${commonUrl}billing-customer-types`,
        customerTypeData,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error creating customer type:", error);
      throw error;
    }
  }

  // Update existing customer type
  async updateCustomerType(id, customerTypeData) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${commonUrl}billing-customer-types/${id}`,
        customerTypeData,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error updating customer type:", error);
      throw error;
    }
  }

  // Deactivate customer type
  async deactivateCustomerType(payload) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${commonUrl}billing-customer-types/${payload.id}/deactivate`,
        { remark: payload.remark || "" },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error deactivating customer type:", error);
      throw error;
    }
  }

  // Activate customer type
  async activateCustomerType(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${commonUrl}billing-customer-types/${id}/activate`,
        {},
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error activating customer type:", error);
      throw error;
    }
  }

  // Get customer type statistics
  async getCustomerTypeStatistics() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${commonUrl}billing-customer-types/statistics`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching customer type statistics:", error);
      throw error;
    }
  }
}
