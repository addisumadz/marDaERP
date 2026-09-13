"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BankPaymentImportService {
  /**
   * Updates multiple billing reading records with bank payment information
   * @param {Array} updateRequests - Array of update requests with id and updates
   * @returns {Promise<object>} The update results
   */
  async updateBankPayments(updateRequests) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}bulk-update-bank-payments`,
        { updates: updateRequests },
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error updating bank payments:", error);
      throw error;
    }
  }

  /**
   * Updates a single billing reading record with bank payment information
   * @param {number} id - The ID of the billing reading record
   * @param {object} updates - The updates to apply
   * @returns {Promise<object>} The updated record
   */
  async updateSingleBankPayment(id, updates) {
    try {
      const token = getAccesToken();
      const res = await axios.put(
        `${commonUrl}${id}/bank-payment`,
        updates,
        {
          headers: authHeader(token),
        }
      );
      return res.data;
    } catch (error) {
      console.error(`Error updating bank payment for record ${id}:`, error);
      throw error;
    }
  }
}

const bankPaymentImportService = new BankPaymentImportService();
export default bankPaymentImportService;
