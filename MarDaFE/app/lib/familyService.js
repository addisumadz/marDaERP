"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class FamilyService {
  async getAllCustomerFamily(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "customerFamilysByStatus/" + status,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  async getFamilyByCustomerId(status, customerId) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "customerFamilysByStatusAndCustomerId/" + status + "/" + customerId,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }


  createFamily(family, customerId) {
    let user_accessToken = getAccesToken();
    family.status = 'Active'

    const data = axios.post(commonUrl + "family/" + customerId, family, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }


  //   viewPatientAppointment(appointment, appointmentId) {

  //      let user_accessToken = getAccesToken();
  //     const data = axios.put(commonUrl + "viewpatient/" + appointmentId,appointment,
  //       {
  //         headers: authHeader(user_accessToken),
  //       }
  //     );
  //     return data;
  //   }
  //   removePatientAppointment(appointment, appointmentId) {

  //     let user_accessToken = getAccesToken();
  //    const data = axios.put(commonUrl + "removepatient/" + appointmentId,appointment,
  //      {
  //        headers: authHeader(user_accessToken),
  //      }
  //    );
  //    return data;
  //  } 
  createCustomerFamily(customer_id, customer_family) {
    let user_accessToken = getAccesToken();

    const data = axios.post(commonUrl + "customerFamily/" + customer_id,
      customer_family,
      {
        headers: authHeader(user_accessToken),
      }
    );
    return data;
  }
  deactivateFamilyById(id) {
    let user_accessToken = getAccesToken();
    const data = axios.put(commonUrl + "deactivateFamily/" + id, {
      headers: authHeader(user_accessToken),
    });
    return data;
  }
}
