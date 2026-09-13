"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BankPaymentFileService {
  async listFiles() {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}bank-payments/files`,
        { headers: authHeader(token) }
      );
      return res.data;
    } catch (error) {
      console.error("Error listing bank payment files:", error);
      throw error;
    }
  }

  async downloadFile(filename, type) {
    try {
      const token = getAccesToken();
      const res = await axios.get(
        `${commonUrl}bank-payments/download-file`,
        {
          params: { name: filename, type },
          headers: authHeader(token),
          responseType: "blob",
        }
      );
      return res.data; // Blob
    } catch (error) {
      console.error("Error downloading bank payment file:", error);
      throw error;
    }
  }
}

const bankPaymentFileService = new BankPaymentFileService();
export default bankPaymentFileService;
