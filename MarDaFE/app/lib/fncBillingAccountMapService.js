"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncBillingAccountMapService {
  async getAllMappings() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-billing-account-map/all`, { headers: authHeader(token) });
    return res.data;
  }

  async saveMappings(mappings) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-billing-account-map`, mappings, { headers: authHeader(token) });
    return res.data;
  }
}

const fncBillingAccountMapService = new FncBillingAccountMapService();
export default fncBillingAccountMapService;
