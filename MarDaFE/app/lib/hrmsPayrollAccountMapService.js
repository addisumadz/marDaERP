"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class HrmsPayrollAccountMapService {
  async getAllMappings() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}hrms/payroll/account-maps`, { headers: authHeader(token) });
    return res.data;
  }

  async saveMappings(mappings) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}hrms/payroll/account-maps`, mappings, { headers: authHeader(token) });
    return res.data;
  }
}

const hrmsPayrollAccountMapService = new HrmsPayrollAccountMapService();
export default hrmsPayrollAccountMapService;
