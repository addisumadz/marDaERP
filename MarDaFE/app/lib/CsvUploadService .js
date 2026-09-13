"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class CsvUploadService {
  /**
   * Uploads the member data CSV file to the backend.
   * @param {File} file The CSV file to upload.
   * @returns {Promise} An axios promise representing the API call.
   */
  async uploadMembersCsv(file) {
    let user_accessToken = getAccesToken();

    // ---- DEBUGGING ----
    console.log("Access Token being sent:", user_accessToken);
    const headers = authHeader(user_accessToken);
    console.log("Headers being sent:", headers);
    // -------------------
    if (!file) {
      throw new Error("No file provided for upload.");
    }
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(commonUrl + "upload", formData, {
      headers: authHeader(user_accessToken),
    });
    return res;
  }

  /**
   * NEW METHOD: Uploads an array of member objects as a JSON payload.
   * @param {Array<Object>} membersData - The array of parsed member data.
   */
  uploadMembersJson(membersData) {
    // The endpoint now expects a JSON array, not FormData
    return axios.post(`${API_URL}/upload-json`, membersData, {
      headers: {
        "Content-Type": "application/json", // Set content type to JSON
      },
    });
  }
}
