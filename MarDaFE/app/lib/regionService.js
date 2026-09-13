"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class RegionService {
  async getAllRegion(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "regionByStatus/" + status, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
  
    return res;
  }
 
  createRegion(region) {
  
    let user_accessToken = getAccesToken();
    const data = axios.post(commonUrl + "region", region, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
  async getRegionByStatusAndId(status, regionId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "regionByStatusAndId/" + status + "/" + regionId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
  
  async getZoneByStatusAndRegionId(status, regionId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "zoneByStatusAndRegionId/" + status + "/" + regionId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
  updateRegion(region, regionId) { 
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "region/" + regionId, region, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
 

  deactivateRegion(region) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "deactivateRegion", region, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
}
