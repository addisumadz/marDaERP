"use client";
import axios from "axios";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class BankInvoiceCompareService {
  /**
   * Compares a bank payment CSV file with system readings for a selected kifyaWer month.
   * @param {File} file - The uploaded CSV file
   * @param {string} kifyaWer - The billing period (e.g. "መስከረም, 2017")
   * @returns {Promise<object>} BankInvoiceCompareResultDTO
   */
  async compareCsv(file, kifyaWer) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kifyaWer", kifyaWer);

    const res = await axios.post(
      `${commonUrl}bank-payments/compare-csv`,
      formData,
      {
        headers: {
          ...authHeader(token),
          "Content-Type": "multipart/form-data",
        },
        timeout: 120000,
      }
    );
    return res.data;
  }

  /**
   * Downloads a corrected CSV where only bill_id is replaced with the system's invoice numbers.
   * All other columns and data remain 100% unchanged.
   * @param {File} file - The uploaded CSV file
   * @param {string} kifyaWer - The billing period (e.g. "መስከረም, 2017")
   */
  async exportCorrectedCsv(file, kifyaWer) {
    const token = getAccesToken();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("kifyaWer", kifyaWer);

    const res = await axios.post(
      `${commonUrl}bank-payments/export-corrected-csv`,
      formData,
      {
        headers: {
          ...authHeader(token),
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
        timeout: 120000,
      }
    );

    // Extract filename from Content-Disposition if present
    let filename = `corrected_${file.name || "bank_payments.csv"}`;
    const disposition = res.headers["content-disposition"];
    if (disposition && disposition.indexOf("filename=") !== -1) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        filename = match[1].replace(/['"]/g, "");
      }
    }

    const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true, filename };
  }
}

const bankInvoiceCompareService = new BankInvoiceCompareService();
export default bankInvoiceCompareService;
