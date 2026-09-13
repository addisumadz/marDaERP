"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class ZoneService {
  async getAllZone(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "zoneByStatus/" + status, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
    return res;
  }

  createZone(zone, region_id) {
    let user_accessToken = getAccesToken();
    const data = axios.post(commonUrl + "zone/" + region_id, zone, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  async getZoneByStatusAndId(status, zoneId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "zoneByStatusAndId/" + status + "/" + zoneId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  updateZone(zone, zone_id) {
    
    let user_accessToken = getAccesToken();
    let regionId = zone.regionId;
    const data = axios.put(commonUrl + "zone/" + zone_id +"/"+regionId, zone, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  deleteZone(zoneId) {
    let user_accessToken = getAccesToken();
    const data = axios.delete(commonUrl + "deleteZone/" + zoneId, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  deactivateZone(zone) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "deactivateZone", zone, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

 
  async getWoredasByStatusAndZoneId(status, zoneId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "woredaByStatusAndZoneId/" + status + "/" + zoneId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
}
