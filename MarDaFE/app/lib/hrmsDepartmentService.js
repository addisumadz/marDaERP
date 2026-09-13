"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class HrmsDepartmentService {
  async getAllDepartments() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/departments`, { headers: authHeader(token) });
    return res.data;
  }

  async createDepartment(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/departments`, data, { headers: authHeader(token) });
    return res.data;
  }

  async getAllPositions() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/departments/positions`, { headers: authHeader(token) });
    return res.data;
  }

  async createPosition(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}hrms/departments/positions`, data, { headers: authHeader(token) });
    return res.data;
  }

  async getAllJobGrades() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/departments/grades`, { headers: authHeader(token) });
    return res.data;
  }
}

const hrmsDepartmentService = new HrmsDepartmentService();
export default hrmsDepartmentService;
