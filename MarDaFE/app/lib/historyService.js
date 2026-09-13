"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class HistoryService {
  async getAllPatientHistory(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "patientHistorysByStatus/" + status,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  async getAllPatientHistoryByStatusAndPaymentStatus(status, paymentStatus) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "patientHistorysByStatusAndPaymentStatus/" + status + "/" + paymentStatus,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
  async getHistoryByPatientId(status, patient_id) {
    let user_accessToken = getAccesToken();
  
    const res = await axios.get(commonUrl + "patientHistorysByStatusAndPatientId/" + status + "/" + patient_id,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }

  createPatientAppointment(patient_id, appointment) {
    let user_accessToken = getAccesToken();

    const data = axios.post(commonUrl + "appointment/" + patient_id, appointment,
      {
        headers: authHeader(user_accessToken),
      }
    );
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
  createPatientHistory(patient_id, patient_history) {
    let user_accessToken = getAccesToken();

    const data = axios.post(commonUrl + "patientHistory/" + patient_id,
      patient_history,
      {
        headers: authHeader(user_accessToken),
      }
    );
    return data;
  }
  async getAllPatientHistoryByDate(status, dateFrom, dateTo) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "patientsHistoryByStatusAndByDate/" + status + "/" + dateFrom + "/" + dateTo, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
    return res;
  }
  async getAllPatientHistoryByDateAndPaymentStatus(status, paymentStatus, dateFrom, dateTo) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "patientsHistoryByStatusAndByDateAndPaymentStatus/" + status + "/" + paymentStatus + "/" + dateFrom + "/" + dateTo, {
      method: "Get",
      headers: authHeader(user_accessToken),
    });
    return res;
  }
}
