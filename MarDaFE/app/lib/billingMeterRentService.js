"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();


export class BillingMeterRentService {
  // Get all meter rents
  async getAllMeterRents() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${commonUrl}billing-meter-rents/all`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching all meter rents:", error);
      throw error;
    }
  }

  // Get meter rents by status with pagination
  async getMeterRentsByStatus(status, page = 0, size = 10) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${commonUrl}billing-meter-rents/status/${status}?page=${page}&size=${size}`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching meter rents by status:", error);
      throw error;
    }
  }

  // Get meter rent by ID
  async getMeterRentById(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${commonUrl}billing-meter-rents/${id}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching meter rent by ID:", error);
      throw error;
    }
  }

  // Create new meter rent
  async createMeterRent(meterRentData) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${commonUrl}billing-meter-rents`,
        meterRentData,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error creating meter rent:", error);
      throw error;
    }
  }

  // Update existing meter rent
  async updateMeterRent(id, meterRentData) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${commonUrl}billing-meter-rents/${id}`,
        meterRentData,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error updating meter rent:", error);
      throw error;
    }
  }

  // Deactivate meter rent
  async deactivateMeterRent(payload) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${commonUrl}billing-meter-rents/${payload.id}/deactivate`,
        { remark: payload.remark || "" },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error deactivating meter rent:", error);
      throw error;
    }
  }

  // Activate meter rent
  async activateMeterRent(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${commonUrl}billing-meter-rents/${id}/activate`,
        {},
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error activating meter rent:", error);
      throw error;
    }
  }

  // Get meter rent statistics
  async getMeterRentStatistics() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${commonUrl}billing-meter-rents/statistics`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching meter rent statistics:", error);
      throw error;
    }
  }

  // Get active customer types for dropdown
  async getActiveCustomerTypes() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${commonUrl}billing-meter-rents/customer-types`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching active customer types:", error);
      throw error;
    }
  }

  // Get active meter sizes for dropdown
  async getActiveMeterSizes() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${commonUrl}billing-meter-rents/meter-sizes`,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error fetching active meter sizes:", error);
      throw error;
    }
  }
}
