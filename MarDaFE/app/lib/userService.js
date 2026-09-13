"use client";

import axios from "axios";
import { toast } from "react-toastify";
import { baseURL } from "./httpCommon/http-common";
import authHeader from "./authHeader/authhheader";
import getAccessToken from "./getToken";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

// Create a reusable Axios instance
const api = axios.create({
  baseURL: commonUrl,
});

// Add a request interceptor to include the auth header
api.interceptors.request.use(
  (config) => {
    const userAccessToken = getAccessToken();
    if (userAccessToken) {
      config.headers = { ...config.headers, ...authHeader(userAccessToken) };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Centralized error handler
const handleError = (error) => {
  let errorMessage = "An unexpected error occurred.";
  if (error.response) {
    const { status, data } = error.response;
    const message = data.message || error.message;
    if (status === 400) {
      errorMessage = message;
    } else {
      errorMessage = `Unexpected Error: ${message}`;
    }
    toast.error(message);
  } else if (error.request) {
    errorMessage = "Network error, please try again.";
  } else {
    errorMessage = "Error setting up request.";
  }
  return { error: errorMessage };
};

class UserService {
  async getAllUsers(status) {
    try {
      const response = await api.get(`userByStatus/${status}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async getUserById(userId) {
    try {
      const response = await api.get(`user/${userId}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async checkUsername(username) {
    try {
      const response = await api.get(`checkUsername/${username}`);
      return response.data;
    } catch (error) {
      console.error("Error checking username:", error);
      throw error;
    }
  }

  async createUser(user) {
    try {
      user.status = "active";
      const response = await api.post("user", user);
      toast.success("User added successfully!");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async getAllRoles() {
    try {
      const response = await api.get("userRoles");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async assignRoles(userId, roleIds) {
    try {
      const response = await api.post(`assignRoles/${userId}`, roleIds);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async deactivateUser(userId) {
    try {
      const response = await api.patch(`user/${userId}/deactivate`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async updatePassword(id, newPassword) {
    try {
      const response = await api.put(`changePassword/${id}/${newPassword}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async getUsersByDate(status, dateFrom, dateTo) {
    try {
      const response = await api.get(
        `usersByStatusAndByDate/${status}/${dateFrom}/${dateTo}`
      );
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async updateUser(userId, userToSubmit) {
    try {
      const response = await api.put(`user/${userId}`, userToSubmit);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }

  async getAllUsersByRoleName(roleName, status) {
    try {
      const response = await api.get("usersByRoleAndStatus", {
        params: { roleName, status },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
}

export const userService = new UserService();
