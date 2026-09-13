"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class SmsService {
  async sendTestSms(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}sms/test`, data, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async sendTestSmsViaJasmin(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}sms/test/jasmin`, data, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async sendBulkBillSms(readingIds, smsMeta = {}) {
    const token = getAccesToken();
    const payload = { readingIds, ...smsMeta };
    const res = await axios.post(`${commonUrl}sms/bulk-bills`, payload, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async sendBulkBillSmsSilent(readingIds, smsMeta = {}) {
    const token = getAccesToken();
    const payload = { readingIds, ...smsMeta };
    // Call the new silent endpoint
    const res = await axios.post(`${commonUrl}sms/bulk-bills-silent`, payload, {
      headers: authHeader(token),
    });
    return res.data;
  }

  async getBulkBillSmsExportData(readingIds, smsMeta = {}) {
    const token = getAccesToken();
    const payload = { readingIds, ...smsMeta };
    const res = await axios.post(`${commonUrl}sms/bulk-bills-export`, payload, {
      headers: authHeader(token),
      timeout: 120000,
    });
    return res.data;
  }

  async sendDirectBulkSms(readingIds, message) {
    const token = getAccesToken();
    const payload = { readingIds, message };
    const res = await axios.post(`${commonUrl}sms/bulk-direct-message`, payload, {
      headers: authHeader(token),
    });
    return res.data;
  }
}
