"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";

import { baseURL } from "./httpCommon/http-common";
const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

export class DepositService {
  async getAllDeposit(status) {
    let user_accessToken = getAccesToken();
    const res = await axios.get(
      commonUrl + "depositsByStatus/" + status,
      {
        method: "Get",
        headers: authHeader(user_accessToken),
      }
    );
    return res;
  }
  async  checkExistingDeposit(patientId, status)  {
 
    const user_accessToken = getAccesToken();
    const res = await axios.get(commonUrl + "checkDeposits/"+ patientId + "/" + status,
    {
      method: "Get",
      headers: authHeader(user_accessToken),
    }

  );
  
   
  return res.data; // Adjust based on the API response format
  
};
  createPatientDeposit(patient_id,cashierId,deposit) {
    let user_accessToken = getAccesToken(); 
 
    const data = axios.post(commonUrl + "deposit/" + patient_id+ "/" + cashierId ,deposit,
      {
        headers: authHeader(user_accessToken),
      }
    );
    return data;
  }
 
  updatePatientDeposit(deposit, cashierId,depositId) {
 
    let user_accessToken = getAccesToken();
   const data = axios.put(commonUrl + "updateDeposit/" +  cashierId + "/" + depositId,deposit,
     {
       headers: authHeader(user_accessToken),
     }
   );
   return data;
 } 
 async getDepositByStatusAndPatientId(status, patientId) {
  let user_accessToken = getAccesToken();
  const res = await axios.get(
    commonUrl + "depositByStatusAndPatientId/" + status + "/" + patientId,
    {
      method: "Get",
      headers: authHeader(user_accessToken),
    }
  );
  return res;
}

async getFilteredDeposits(status, { startDate, endDate, dateFilterField, cashierId, search }) {
  let user_accessToken = getAccesToken();

  // Construct the URL with query parameters
  const url = new URL(commonUrl + "depositsByStatus");
  console.log("startDate")
  console.log(startDate)
  console.log("dateFilterField")
  console.log(dateFilterField)
  // Append parameters only if they are not null or undefined
  if (startDate) url.searchParams.append('startDate', startDate);
  if (endDate) url.searchParams.append('endDate', endDate);
  if (dateFilterField) url.searchParams.append('dateFilterField', dateFilterField);
  if (cashierId) url.searchParams.append('cashierId', cashierId);
  if (search) url.searchParams.append('search', search);
  if (status) url.searchParams.append('status', status);

  try {
    const res = await axios.get(url.toString(), {
      headers: authHeader(user_accessToken),
    });
    console.log("res.data")
    console.log(res.data)
    return res;

  } catch (error) {
    // Handle errors appropriately
    console.error("Error fetching filtered deposits:", error);
    throw error;
  }
}



}
