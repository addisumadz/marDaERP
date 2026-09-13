"use client";
import authHeader from "./authHeader/authhheader";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class CompanyProfileService {
  async getById(id) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${commonUrl}company-profile/${id}`, {
        headers: authHeader(token),
      });
      console.log("profile",res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching company profile by ID:", error);
      throw error;
    }
  }
  async getLatest() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${commonUrl}company-profile/latest`, {
        headers: authHeader(token),
      });
      console.log("profile(latest)", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching latest company profile:", error);
      throw error;
    }
  }

  async update(id, payload) {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${commonUrl}company-profile/${id}`, payload, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error updating company profile:", error);
      throw error;
    }
  }

  async initialize() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${commonUrl}company-profile/initialize`, {}, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error initializing company profile:", error);
      throw error;
    }
  }
}
