"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class PagePermissionsService {
  async getPermissionsForPage(pageCode) {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}page-permissions/${pageCode}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching page permissions:", error);
      throw error;
    }
  }

  async getPermissionsForRole(roleId) {
    try {
      const token = getAccesToken();
      const res = await axios.get(`${commonUrl}page-permissions/roles/${roleId}`, {
        headers: authHeader(token),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching permissions for role:", error);
      throw error;
    }
  }

  async updateRolePermissions(pageCode, roleId, payload) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}page-permissions/${pageCode}/roles/${roleId}`,
        payload,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error updating role page permissions:", error);
      throw error;
    }
  }
}

const pagePermissionsService = new PagePermissionsService();
export default pagePermissionsService;
