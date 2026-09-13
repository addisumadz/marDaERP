"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class HrmsEmployeeService {
  async getAllEmployees(search = "") {
    const token = getAccesToken();
    const url = search
      ? `${commonUrl}hrms/employees?search=${encodeURIComponent(search)}`
      : `${commonUrl}hrms/employees`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getEmployeeById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/employees/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async createEmployee(employee, userId) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/employees?userId=${userId || 1}`, employee, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async updateEmployee(id, employee, userId) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}hrms/employees/${id}?userId=${userId || 1}`, employee, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deleteEmployee(id, userId) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}hrms/employees/${id}?userId=${userId || 1}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // ─── Education ──────────────────────────────────────────
  async getEmployeeEducation(employeeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/employees/${employeeId}/education`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async addEmployeeEducation(employeeId, education, userId = 1) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/employees/${employeeId}/education?userId=${userId}`, education, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deleteEmployeeEducation(eduId) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}hrms/employees/education/${eduId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // ─── Work Experience ────────────────────────────────────
  async getEmployeeExperience(employeeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/employees/${employeeId}/experience`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async addEmployeeExperience(employeeId, experience, userId = 1) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/employees/${employeeId}/experience?userId=${userId}`, experience, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deleteEmployeeExperience(expId) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}hrms/employees/experience/${expId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // ─── Skills ─────────────────────────────────────────────
  async getEmployeeSkills(employeeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/employees/${employeeId}/skills`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async addEmployeeSkill(employeeId, skill, userId = 1) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/employees/${employeeId}/skills?userId=${userId}`, skill, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deleteEmployeeSkill(skillId) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}hrms/employees/skills/${skillId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  // ─── Dependents ─────────────────────────────────────────
  async getEmployeeDependents(employeeId) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/employees/${employeeId}/dependents`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async addEmployeeDependent(employeeId, dependent, userId = 1) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/employees/${employeeId}/dependents?userId=${userId}`, dependent, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deleteEmployeeDependent(depId) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}hrms/employees/dependents/${depId}`, {
      headers: authHeader(token),
    });
    return res.data;
  }
}

const hrmsEmployeeService = new HrmsEmployeeService();
export default hrmsEmployeeService;
