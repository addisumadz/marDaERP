"use client";

import authHeader from "./authHeader/authhheader";
import getAccessToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

 class UserService {
 
  async getAllUsers(status) {

    const userAccessToken = getAccessToken();
    const response = await axios.get(commonUrl + "userByStatus/"+ status, {
      method: "Get",
      headers: authHeader(userAccessToken),
    });
   
    return response.data;
  }

  async getUserById(userId) {
    const userAccessToken = getAccessToken();
    const response = await axios.get(`${commonUrl}user/${userId}`, {
      headers: authHeader(userAccessToken),
    });
    return response;
  }

  async checkUsername(username) {
    try {
      const userAccessToken = getAccessToken();
      const response = await axios.get(`${commonUrl}checkUsername/${username}`, {
        headers: authHeader(userAccessToken),
      });
      return response.data;/// Returns true if the username is already registered, false otherwise
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;/// Rethrow error to be handled by the caller
    }
  }
  async   createUser(user) {
    user.status = 'active';
  
    let user_accessToken = getAccessToken();
  
    try {
      const response = await axios.post(commonUrl + "user", user, {
        headers: authHeader(user_accessToken),
      });
  
      return response.data;/// Successful response
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      
      if (error.response) {
       /// Server responded with a status other than 200 range
        const status = error.response.status;
        const message = error.response.data.message || error.message;
  
        if (status === 400) {
         /// Handle specific error cases based on status code or message
          
          errorMessage = message;
         
        } else {
         /// Handle other statuses
          errorMessage = `Unexpected Error: ${message}`;
        }
      } else if (error.request) {
       /// Request was made but no response was received
        errorMessage = "Network error, please try again.";
      } else {
       /// Something happened in setting up the request
        errorMessage = "Error setting up request.";
      }
  
     /// Return the error message
      return { error: errorMessage };
    }
  }
  
  
   

  async getAllRoles() {
  
    const userAccessToken = getAccessToken();
    const response = await axios.get(commonUrl + "userRoles", {
      method: "Get",
      headers: authHeader(userAccessToken),
    });
    console.log("fetchedRoles")
    console.log(response.data)
    return response.data;
  }

  async updateUserRoles(userId, roleIds) {
    const response = await fetch(`/api/users/${userId}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roleIds }),
    });
    if (!response.ok) throw new Error('Failed to update roles');
    return response.json();
  }

  deactivateUser(userId) {
    const userAccessToken = getAccessToken();
    return axios.patch(`${commonUrl}user/${userId}/deactivate`, {}, {
      headers: authHeader(userAccessToken),
    });
  }
 ///// updatePassword(userId, newPassword) {
 /////   const userAccessToken = getAccessToken();
 /////   return axios.patch(`${commonUrl}user/${userId}/updatePassword`, { newPassword }, {
 /////     headers: authHeader(userAccessToken),
 /////   });
 ///// }
  updatePassword(id, newPassword) {
    console.log("newPassword")
    console.log(newPassword)
    console.log(id)
    let userAccessToken = getAccessToken(); 
    const data = axios.put(commonUrl + "changePassword/" +id + "/" +  newPassword, {
      headers: authHeader(userAccessToken),
    });
    return data;
  }
  async getUsersByDate(status, dateFrom, dateTo) {
    const userAccessToken = getAccessToken();
    const response = await axios.get(`${commonUrl}usersByStatusAndByDate/${status}/${dateFrom}/${dateTo}`, {
      headers: authHeader(userAccessToken),
    });
    return response;
  }
  async updateUser(user) {
    console.log("user")
    console.log(user)
    const userAccessToken = getAccessToken();
    try {
      const response = await axios.put(`${commonUrl}user/${user.id}`, user, {
        headers: authHeader(userAccessToken),
      });
      return response.data;
    } catch (error) {
      let errorMessage = "An unexpected error occurred.";
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message || error.message;
        if (status === 400) {
          errorMessage = message;
        } else {
          errorMessage = `Unexpected Error: ${message}`;
        }
      } else if (error.request) {
        errorMessage = "Network error, please try again.";
      } else {
        errorMessage = "Error setting up request.";
      }
      return { error: errorMessage };
    }
  }

  async updateUserRoles(userId, roleIds) {
    const response = await fetch(`/api/users/${userId}/roles`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roleIds }),
    });
    if (!response.ok) throw new Error('Failed to update roles');
    return response.json();
  }

}
export const userService = new UserService();