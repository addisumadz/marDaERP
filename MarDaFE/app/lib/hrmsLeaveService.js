"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class HrmsLeaveService {
  async getLeaveTypes() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/leave/types`, { headers: authHeader(token) });
    return res.data;
  }

  async getAllRequests() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/leave/requests`, { headers: authHeader(token) });
    return res.data;
  }

  async getEmployeeRequests(employeeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/leave/requests/employee/${employeeId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async getEmployeeAllocations(employeeId, fiscalYearEc = 2018) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}hrms/leave/allocations/employee/${employeeId}?fiscalYearEc=${fiscalYearEc}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async submitLeaveRequest(request, employeeId, userId = 1) {
    const token = getAccesToken();
    const res = await axios.post(
      `${commonUrl}hrms/leave/requests?employeeId=${employeeId}&userId=${userId}`,
      request,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async approveLeaveRequest(requestId, userId = 1) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}hrms/leave/requests/${requestId}/approve?userId=${userId}`,
      {},
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async rejectLeaveRequest(requestId, userId = 1, reason = "") {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}hrms/leave/requests/${requestId}/reject?userId=${userId}&reason=${encodeURIComponent(reason)}`,
      {},
      { headers: authHeader(token) }
    );
    return res.data;
  }
}

const hrmsLeaveService = new HrmsLeaveService();
export default hrmsLeaveService;
