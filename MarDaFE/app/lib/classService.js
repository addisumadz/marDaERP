"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class ClassService  {
  async getAllClass(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "classByStatus/" + status, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
  
    return res;
  }
 
  createClass(createdClass) {

    let user_accessToken = getAccesToken();
    const data = axios.post(commonUrl + "class", createdClass, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
  async getClassByStatusAndId(status, classId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "classByStatusAndId/" + status + "/" + classId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
  
  async getSectionByStatusAndClassId(status, classId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "sectionByStatusAndClassId/" + status + "/" + classId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
  updateClass(updatedClass, classId) { 
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "class/" + classId, updatedClass, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
 

  deactivateClass(deactivateClass) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "deactivateClass", deactivateClass, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
}
