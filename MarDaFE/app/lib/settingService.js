"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class SettingService {
  // Get all settings by status
  async getAllSettingsByStatus(status) {
     
         
    let user_accessToken = getAccesToken();
       
    const res = await axios.get(commonUrl + "settingsByStatus/" + status, {
      method: "GET",
      headers: authHeader(user_accessToken),
    }); 
    return res.data;
  }

  // Create a new setting
  async createSetting(setting) {
    delete setting.id; // Remove the 'id' property if it exists

    let user_accessToken = getAccesToken();
    const data = await axios.post(commonUrl + "createSetting", setting, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  // Get setting by ID
  async getSettingById(id) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "setting/" + id, {
      method: "GET",
      headers: authHeader(user_accessToken),
    });
    return res.data;
  }

  // Update setting
  async updateSetting(id, setting) {
    let user_accessToken = getAccesToken();
    const data = await axios.put(commonUrl + "updateSetting/" + id, setting, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  // Delete setting by ID
  async deleteSetting(id) {
    let user_accessToken = getAccesToken();
    const data = await axios.delete(commonUrl + "setting/" + id, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
}
