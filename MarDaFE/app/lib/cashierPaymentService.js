"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class CashierPaymentService {
  /**
   * Record a front-office (cashier) payment for a bill (reading)
   * @param {number} id - BillingReading ID
   * @param {{ amount: number, moneyCollectedDate?: string|Date, remark?: string, cashierUserId?: number }} payload
   */
  async updateCashierPayment(id, payload) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}${id}/cashier-payment`, payload, {
      headers: authHeader(token),
    });
    console.log(res.data);
    return res.data;
  }
}

const cashierPaymentService = new CashierPaymentService();
export default cashierPaymentService;
