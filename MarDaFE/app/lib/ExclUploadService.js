"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

/**
 * Service class for handling file management operations,
 * such as Excel file uploads.
 */
export class ExclUploadService {
  /**
   * Uploads an Excel file to the backend.
   * @param {File} file The Excel file to be uploaded.
   * @returns {Promise<any>} The response from the axios post request.
   */
  async getAllMembers() {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "getAllMembers", {
      method: "Get",
      headers: authHeader(user_accessToken),
    });

    return res;
  }
  async uploadExcel(file) {
    let user_accessToken = getAccesToken();

    // Create a FormData object to properly handle file uploads.
    const formData = new FormData();
    formData.append("file", file); // The key 'file' must match the backend @RequestParam("file").

    const res = await axios.post(
      commonUrl + "uploadexcl", // Your specific endpoint for the upload (e.g., /upload)
      formData, // The data being sent
      {
        // Pass the authentication headers.
        // Axios will automatically set the 'Content-Type' to 'multipart/form-data'
        // with the correct boundary when you send a FormData object.
        headers: authHeader(user_accessToken),
      }
    );

    return res;
  }
}
