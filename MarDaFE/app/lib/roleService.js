"use client";

import axios from "axios";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import { baseURL } from "./httpCommon/http-common";/// Fixed import path
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();
class RoleService {
  

   async getAllRoles() {
     const userAccessToken = getAccesToken();
     try {
       const response = await axios.get(`${this.baseUrl}userRoles`, {
         headers: authHeader(userAccessToken),
       });
       console.log("Fetched roles:", response.data);
       return response.data;
    } catch (error) {
       console.error("Error fetching roles:", error);
       throw error;
     }
   }

  async getAllRoles() {
    const userAccessToken = getAccesToken();
    try {
      const response = await axios.get(`${commonUrl}roles`, {
        headers: authHeader(userAccessToken),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async createRole(role) {
    const sampleRole = {
      name: "ROLE_USER"/// Ensure this matches an enum value defined in ERole
    };
    const userAccessToken = getAccesToken();
    try {
      const response = await axios.post(`${commonUrl}roles`, sampleRole, {
        headers: authHeader(userAccessToken),
      });
      return response.data;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  }

  async getRoleById(roleId) {
   const userAccessToken = getAccesToken();
    try {
      const response = await axios.get(`${commonUrl}api/roles/${roleId}`, {
        headers: authHeader(userAccessToken),
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      throw error;
    }
  }

  async updateRole(roleId, roleUpdates) {
    const userAccessToken = getAccesToken();
    try {
      const response = await axios.put(`${commonUrl}api/roles/${roleId}`, roleUpdates, {
        headers: authHeader(userAccessToken),
      });
      return response.data;
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }

  async deleteRole(roleId) {
    const userAccessToken = getAccesToken();
    try {
      const response = await axios.delete(`${commonUrl}api/roles/${roleId}`, {
        headers: authHeader(userAccessToken),
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
