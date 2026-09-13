"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class CampanyProfileService {
  async getAllCampanyProfile(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "campanyProfileByStatus/" + status, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
    return res;
  }

  // New: backend endpoint uses capitalized path under /api/card_managenment
  async getCompanyProfileByStatus(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "CompanyProfileByStatus/" + status,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  createCampanyProfile(campanyProfile) {
 
    let user_accessToken = getAccesToken();
    const data = axios.post(commonUrl + "campanyProfile", campanyProfile, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
  async getCampanyProfileByStatusAndId(status, campanyProfileId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "campanyProfileByStatusAndId/" + status + "/" + campanyProfileId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  
  updateCampanyProfile(campanyProfile, campanyProfileId) {
  
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "campanyProfile/" + campanyProfileId, campanyProfile, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
 

  deactivateCampanyProfile(campanyProfile) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "deactivateCampanyProfile", campanyProfile, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
}
