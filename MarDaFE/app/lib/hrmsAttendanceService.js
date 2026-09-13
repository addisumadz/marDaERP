"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class HrmsAttendanceService {
  async getDailyAttendance(date) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/attendance/daily?date=${date}`, { headers: authHeader(token) });
    return res.data;
  }

  async getEmployeeAttendance(employeeId, start, end) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/attendance/employee/${employeeId}?start=${start}&end=${end}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async reconcileDaily(employeeId, date) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/attendance/reconcile/${employeeId}?date=${date}`, {}, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async approveOvertime(recordId, userId = 1) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}hrms/attendance/records/${recordId}/approve-overtime?userId=${userId}`, {}, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async getShiftSchedules() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/attendance/shifts`, { headers: authHeader(token) });
    return res.data;
  }

  async getBiometricDevices() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/biometric/devices`, { headers: authHeader(token) });
    return res.data;
  }

  async saveBiometricDevice(device) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/biometric/devices`, device, { headers: authHeader(token) });
    return res.data;
  }

  async processUnprocessedLogs() {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/biometric/process-unprocessed`, {}, { headers: authHeader(token) });
    return res.data;
  }
}

const hrmsAttendanceService = new HrmsAttendanceService();
export default hrmsAttendanceService;
