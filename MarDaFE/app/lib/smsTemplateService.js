"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class SmsTemplateService {
  async getAllTemplates() {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}sms-templates`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async getTemplateByCode(code) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}sms-templates/${code}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async saveTemplate(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}sms-templates`, data, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async deleteTemplate(code) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}sms-templates/${code}`, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async resetTemplate(code) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}sms-templates/${code}/reset`, {}, {
      headers: authHeader(token),
    });
    return res.data;
  }
}

