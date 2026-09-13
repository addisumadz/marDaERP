"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class WoredaService {
  async getAllWoreda(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "woredaByStatus/" + status, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
    return res;
  }

  createWoreda(woreda, zone_id) {
    let user_accessToken = getAccesToken();
    const data = axios.post(commonUrl + "woreda/" + zone_id, woreda, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  async getWoredaByStatusAndId(status, woredaId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "woredaByStatusAndId/" + status + "/" + woredaId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  updateWoreda(woreda, woreda_id,zoneId) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "woreda/" + woreda_id+"/"+zoneId, woreda, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  deleteWoreda(woredaId) {
    let user_accessToken = getAccesToken();
    const data = axios.delete(commonUrl + "deleteWoreda/" + woredaId, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }

  deactivateWoreda(woreda) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "deactivateWoreda", woreda, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
  async getKebelesByStatusAndWoredaId(status, woredaId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "kebelesByStatusAndWoredaId/" + status + "/" + woredaId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
 
}
