"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import getSession from "./getSession";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class DropdownService {
  // Fetches a list of kebeles
  async getKebeles() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/kebeles`, {
      headers: authHeader(token),
    });
    // console.log("Kebeles fetched:", res.data);
    return res.data;
  }

  // Fetches a list of branches
  async getBranches() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/branches`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Alias: explicitly express active branches
  async getActiveBranches() {
    return this.getBranches();
  }

  // Fetches active roles (deleted = active) and flattens page content to array
  async getActiveRoles() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}user-roles/status/active`, {
      params: { page: 0, size: 1000 },
      headers: authHeader(token),
    });
    const page = res.data;
    const content = Array.isArray(page) ? page : (page?.content || []);
    // Normalize to dropdown-like items retaining roleCode
    return content.map((r) => ({ id: r.id, name: r.roleName, roleName: r.roleName, roleCode: r.roleCode }));
  }

  // Helper: get the Meter Reader role where roleCode = 'mobileanbabi'
  async getMeterReaderRoleByCode() {
    const roles = await this.getActiveRoles();
    return roles.find((r) => String(r.roleCode).toLowerCase() === "mobileanbabi");
  }

  // Fetch active users by roleCode by first resolving to roleName, then hitting usersByRoleAndStatus
  async getActiveUsersByRoleCode(roleCode) {
    const token = getAccesToken();
    const roles = await this.getActiveRoles();
    const matched = roles.find((r) => String(r.roleCode).toLowerCase() === String(roleCode).toLowerCase());
    if (!matched) return [];
    const res = await axios.get(`${commonUrl}usersByRoleAndStatus`, {
      params: { roleName: matched.roleName, status: "active" },
      headers: authHeader(token),
    });
    return res.data;
  }

  // Convenience: get active meter readers where roleCode = 'mobileanbabi'
  async getActiveMeterReaders() {
    // Prefer new backend endpoint
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/meter-readers`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // New: get meter readers with optional branch filter
  async getMeterReaders({ branchId } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/meter-readers`, {
      params: branchId ? { branchId } : undefined,
      headers: authHeader(token),
    });
    return res.data;
  }

  // New: get users by role code (active only) with optional branch filter
  async getUsersByRoleCode(roleCode, { branchId } = {}) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/users-by-role-code`, {
      params: { roleCode, ...(branchId ? { branchId } : {}) },
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetches a list of customer types
  async getCustomerTypes() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/customer-types`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetches a list of meter sizes
  async getMeterSizes() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/meter-sizes`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetches ketenas based on a selected kebele ID, or all active ketenas if none selected
  async getKetenasByKebele(kebeleId) {
    const token = getAccesToken();
    const url = kebeleId
      ? `${commonUrl}dropdowns/ketenas/${kebeleId}`
      : `${commonUrl}dropdowns/ketenas`;
    const res = await axios.get(url, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetches all active ketenas
  async getAllKetenas() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/ketenas`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetches readers based on a selected branch ID
  async getReadersByBranch(branchId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/readers/${branchId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetch a user by ID (used to display assigned reader full name)
  async getUserById(userId) {
    if (!userId) return null;
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}users/user/${userId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetch a list of Billing Termination Reasons
  async getBillingTerminationReasons() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/billing-termination-reasons`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // Fetch active cashier users (role_id = 49) for cashier dropdown
  async getCashiers() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}dropdowns/cashiers`, {
      headers: authHeader(token),
    });
    return res.data;
  }
}
