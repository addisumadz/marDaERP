"use client";
import axios from "axios";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class ArifpayService {
  /**
   * Initiate an ArifPay payment checkout session for a bill reading
   * @param {number|string} readingId
   * @param {string|object} phoneOrOptions - Payer's phone (+2519...) or options object { phone, saveToCustomer }
   * @returns {Promise<{ sessionId: string, checkoutUrl: string }>}
   */
  async initiatePayment(readingId, phoneOrOptions) {
    const token = getAccesToken();
    let body = {};
    if (typeof phoneOrOptions === "string") {
      body.phone = phoneOrOptions;
    } else if (phoneOrOptions && typeof phoneOrOptions === "object") {
      body = { ...phoneOrOptions };
    }
    const res = await axios.post(
      `${commonUrl}payments/arifpay/initiate/${readingId}`,
      body,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  /**
   * Check status of an ArifPay payment session
   * @param {string} sessionId
   * @returns {Promise<{ status: string, details?: any, readingId?: number }>}
   */
  async checkStatus(sessionId) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}payments/arifpay/status/${sessionId}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  /**
   * Get current ArifPay configuration
   * @returns {Promise<any>}
   */
  async getConfig() {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}payments/arifpay/config`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  /**
   * Save or update ArifPay configuration
   * @param {object} configData
   * @returns {Promise<any>}
   */
  async saveConfig(configData) {
    const token = getAccesToken();
    const res = await axios.put(
      `${commonUrl}payments/arifpay/config`,
      configData,
      { headers: authHeader(token) }
    );
    return res.data;
  }
}

const arifpayService = new ArifpayService();
export default arifpayService;
