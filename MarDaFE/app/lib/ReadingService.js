// lib/readingService.js
import axios from "axios";
import authHeader from "./authHeader/authhheader"; // Assuming this path is correct
import getAccesToken from "./getToken"; // Assuming this path is correct
import { baseURL } from "./httpCommon/http-common"; // Assuming this path is correct

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl(); // Get the base URL for your API

export class ReadingService {
  /**
   * Fetches a list of readings (bills) filtered by status and kifyaWer (Ethiopian month and year string).
   * @param {string} status - The status to filter by (e.g., 'ACTIVE').
   * @param {string} kifyaWer - The Ethiopian month and year string (e.g., 'መስከረም, 2016').
   * @returns {Promise<Array>} - A promise that resolves to an array of BillingReadingDTOs.
   */
  async getFilteredReadings(status, kifyaWer) {
    try {
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}filtered`, {
        // Use commonUrl
        params: {
          status: status,
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      // console.log("Filtered readings fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching filtered readings:", error);
      throw error;
    }
  }

  async uploadReadingsExcel(file, kifyaWer) {
    try {
      const user_accessToken = getAccesToken();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kifyaWer", kifyaWer);

      const res = await axios.post(`${commonUrl}readingsimport`, formData, {
        headers: {
          ...authHeader(user_accessToken),
          "Content-Type": "multipart/form-data",
        },
        timeout: 600000,
      });
      return res.data;
    } catch (error) {
      console.error("Error uploading readings excel:", error);
      throw error;
    }
  }

  // ==== Real async generation with backend progress ====
  startGenerateAsync = async (readingIds) => {
    if (!readingIds || readingIds.length === 0) {
      throw new Error("No readings selected for bill generation.");
    }
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}generate-async`,
        { readingIds },
        { headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) } }
      );
      return res.data; // { success, jobId }
    } catch (error) {
      console.error("Error starting async generation:", error);
      throw new Error(
        error.response?.data?.message || "Failed to start async bill generation."
      );
    }
  };

  getProgress = async (jobId) => {
    if (!jobId) throw new Error("jobId is required");
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}progress/${jobId}`, {
        headers: authHeader(user_accessToken),
        timeout: 15000,
      });
      return res.data; // { success, total, processed, percent, done, status, message }
    } catch (error) {
      // Surface 404 as a clear error to stop polling
      const msg = error.response?.data?.message || error.message || "Failed to get progress";
      const e = new Error(msg);
      e.status = error?.response?.status;
      throw e;
    }
  };

  getProgressLogs = async (jobId) => {
    if (!jobId) throw new Error("jobId is required");
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}progress/${jobId}/logs`, {
        headers: authHeader(user_accessToken),
        timeout: 15000,
      });
      return res.data; // { success, logs: [] }
    } catch (error) {
      console.error("Error getting progress logs:", error);
      return { success: false, logs: [] };
    }
  };

  startBulkApplyReadingsAsync = async ({ accountNumbers, kifyaWer, strategy }) => {
    if (!accountNumbers || accountNumbers.length === 0) {
      throw new Error("No customer accounts selected.");
    }
    if (!kifyaWer) {
      throw new Error("kifyaWer is required.");
    }
    if (!strategy) {
      throw new Error("strategy is required.");
    }
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}bulk-apply-readings-async`,
        { accountNumbers, kifyaWer, strategy },
        { headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) } }
      );
      return res.data; // { success, jobId }
    } catch (error) {
      console.error("Error starting bulk apply readings async:", error);
      throw new Error(
        error.response?.data?.message || "Failed to start bulk apply readings."
      );
    }
  };


  /**
   * Deletes an active reading (marks deleted + void) and creates a new reading row
   * with the provided previous/current readings.
   */
  async deleteActiveAndCreateNewReading(readingId, previousReading, currentReading) {
    try {
      const user_accessToken = getAccesToken();
      const payload = {
        id: readingId,
        previousReading: parseInt(previousReading),
        currentReading: parseInt(currentReading),
      };
      const response = await axios.post(
        `${commonUrl}deleteAndRecreate`,
        payload,
        { headers: authHeader(user_accessToken), timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting and recreating reading:', error);
      throw error;
    }
  }

  async getFilteredReadingsSelectedCustomer(id) {
    try {
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}filtered`, {
        // Use commonUrl
        params: {
          customerId: id,
        },
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      // console.log("Filtered readings fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching filtered readings:", error);
      throw error;
    }
  }

  async getCombinedBillDataForCustomer(id) {
    if (!id) return { bills: [], wuzifBills: [] }; // Return a default shape
    try {
      const user_accessToken = getAccesToken();
      // Call the new backend endpoint we just created
      const res = await axios.get(`${commonUrl}customer/${id}/all-bill-data`, {
        headers: authHeader(user_accessToken),
        timeout: 20000,
      });
      //console.log("Combined bill data fetched:", res.data);

      return res.data; // This will return an object: { bills: [...], wuzifBills: [...] }
    } catch (error) {
      console.error("Error fetching combined bill data:", error);
      throw error;
    }
  }

  async getBillFilteredReadings(status, kifyaWer) {
    try {
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}Billfiltered`, {
        // Use commonUrl
        params: {
          status: status,
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      // console.log("Filtered readings fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching filtered readings:", error);
      throw error;
    }
  }

  // Fast lightweight count of generated bills for KPI executive reporting
  async getBilledCount(kifyaWer) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}bills-count`, {
        params: { status: "ACTIVE", kifyaWer },
        headers: authHeader(user_accessToken),
        timeout: 5000,
      });
      if (typeof res.data === "number") return res.data;
      if (typeof res.data?.count === "number") return res.data.count;
      return Number(res.data) || 0;
    } catch {
      // Graceful fallback: If /bills-count endpoint is not yet active, fall back to counting Billfiltered or return 0
      try {
        const user_accessToken = getAccesToken();
        const fallbackRes = await axios.get(`${commonUrl}Billfiltered`, {
          params: { status: "ACTIVE", kifyaWer },
          headers: authHeader(user_accessToken),
          timeout: 10000,
        });
        return Array.isArray(fallbackRes.data) ? fallbackRes.data.length : 0;
      } catch {
        return 0;
      }
    }
  }

  // Fast distinct list of billing periods from database
  async getDistinctKifyaWerList() {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}distinct-kifya-wer`, {
        headers: authHeader(user_accessToken),
        timeout: 6000,
      });
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  }

  async getBillFilteredReadingsSupport(status, kifyaWer) {
    try {
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}BillFilteredSupport`, {
        // Use commonUrl
        params: {
          status: status,
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      // console.log("Filtered readings fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching filtered readings:", error);
      throw error;
    }
  }

  async getBillFilteredReadingsSupportMerged(kifyaWer) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}BillFilteredSupportMerged`, {
        params: {
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching Support Merged readings:", error);
      throw error;
    }
  }


  async getReadingManagementFiltered(status, kifyaWer) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}ReadingManagement`, {
        params: {
          status: status,
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken),
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching reading management data:", error);
      throw error;
    }
  }

  async getFilteredReadingsOnly(status, kifyaWer) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}filteredSimplified`, {
        params: {
          status: status,
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken),
      });
      // console.log("Filtered simplified readings fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching filtered simplified readings:", error);
      throw error;
    }
  }

  /**
   * Fetches a list of readings (bills) filtered by status only.
   * @param {string} status - The status to filter by (e.g., 'ACTIVE').
   * @returns {Promise<Array>} - A promise that resolves to an array of BillingReadingDTOs.
   */

  async getReadingsByStatus(status) {
    console.log("before try  by status fetched:");

    try {
      console.log("in  try  by status fetched:");
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}BillByStatus/${status}`, {
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      console.log("Readings by status fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error(`Error fetching readings by status ${status}:`, error);
      throw error;
    }
  }
  /**
   * Fetches the full details of a specific reading.
   * This would be used if you had a "View Details" modal for individual bills.
   * @param {number} id - The ID of the reading to fetch.
   * @returns {Promise<Object>} - A promise that resolves to the full BillingReading entity.
   */
  async getReadingDetails(id) {
    if (!id) return null; // Ensure ID is provided
    try {
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}readings/${id}`, {
        // Use commonUrl
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching reading details for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetch reading detail with consumption breakdown
   * GET /api/card_managenment/readings/{id}/detail
   */
  async getReadingDetailWithConsumption(id) {
    if (!id) return null;
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}readings/${id}/detail`, {
        headers: authHeader(user_accessToken),
        timeout: 15000,
      });
      // Log the full raw response payload for debugging/compare
      // eslint-disable-next-line no-console
      // console.log('[ReadingService] getReadingDetailWithConsumption response', {
      //   id,
      //   url: `${commonUrl}readings/${id}/detail`,
      //   dataType: typeof res?.data,
      //   data: res?.data,
      // });
      return res.data; // { reading: {...}, consumption: [...] }
    } catch (error) {
      console.error(`Error fetching reading detail with consumption for ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Fetches the bill preview for a specific reading.
   * @param {number} id - The ID of the reading to preview.
   * @returns {Promise<Object>} - A promise that resolves to the bill preview details.
   */
  async getBillPreview(id) {
    if (!id) return null;
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}readings/${id}/preview`, {
        headers: authHeader(user_accessToken),
        timeout: 15000,
      });
      return res.data;
    } catch (error) {
      console.error(`Error fetching bill preview for ID ${id}:`, error);
      throw error;
    }
  }

  // You can add other methods here as needed, e.g., for creating, updating, deleting readings.

  // /**
  //  * Adds a new reading record.
  //  * @param {object} readingData - The data for the new reading.
  //  * @returns {Promise<object>} - A promise that resolves to the newly created reading object.
  //  */
  // async addReading(readingData) {
  //   try {
  //     const user_accessToken = getAccesToken();
  //     const res = await axios.post(commonUrl, readingData, {
  //       headers: authHeader(user_accessToken),
  //     });
  //     return res.data;
  //   } catch (error) {
  //     console.error("Error adding reading:", error);
  //     throw new Error(
  //       error.response?.data?.message || "Failed to add reading."
  //     );
  //   }
  // }

  /**
   * Updates an existing reading record.
   * @param {number} id - The ID of the reading to update.
   * @param {object} readingData - The updated data.
   * @returns {Promise<object>} - A promise that resolves to the updated reading object.
   */
  /**
   * Changes the status and optionally updates readings
   * @param {number} readingId - The ID of the reading to update
   * @param {string} status - The new status (e.g., "deleted", "active")
   * @param {number} [previousReading=null] - Optional previous reading value
   * @param {number} [currentReading=null] - Optional current reading value
   * @returns {Promise<Object>} - A promise that resolves to the response
   */
  async changeReadingStatus(readingId, status, previousReading = null, currentReading = null) {
    try {
      const user_accessToken = getAccesToken();
      const payload = { id: readingId, status };

      // Only include readings if they are provided
      if (previousReading !== null) {
        payload.previousReading = previousReading;
      }
      if (currentReading !== null) {
        payload.currentReading = currentReading;
      }

      const response = await axios.post(
        `${commonUrl}readingStatusChanger`,
        payload,
        { headers: { 'Content-Type': 'application/json', ...authHeader(user_accessToken) }, timeout: 15000 }
      );
      return response.data;
    } catch (error) {
      console.error('Error changing reading status:', error);
      throw error;
    }
  }

  async generateBillsWithReadings(readingIds, previousReading = null, currentReading = null) {
    try {
      const user_accessToken = getAccesToken();
      const payload = { readingIds };

      // Only include readings if they are provided
      if (previousReading !== null) {
        payload.previousReading = previousReading;
      }
      if (currentReading !== null) {
        payload.currentReading = currentReading;
      }

      const response = await axios.post(
        `${commonUrl}generateWithReadings`,
        payload,
        { headers: authHeader(user_accessToken) }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating bills with readings:', error);
      throw error;
    }
  }

  /**
   * Deletes a reading record.
   * @param {number} id - The ID of the reading to delete.
   * @returns {Promise<object>} - A promise that resolves on successful deletion.
   */
  async deleteReading(id) {
    try {
      const user_accessToken = getAccesToken();
      await axios.delete(`${commonUrl}${id}`, {
        headers: authHeader(user_accessToken),
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting reading:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete reading."
      );
    }
  }

  // ==================== NEW FUNCTION ====================
  /**
   * Fetches a list of customers who do not have a reading for a given kifyaWer.
   * @param {string} kifyaWer - The Ethiopian month and year string (e.g., 'መስከረም, 2016').
   * @returns {Promise<Array>} - A promise that resolves to an array of CustomerListDTOs.
   */
  async getCustomersWithoutReading(kifyaWer) {
    try {
      const user_accessToken = getAccesToken(); // Get the access token
      const res = await axios.get(`${commonUrl}customer/withoutReading`, {
        // Endpoint for customers without reading
        params: {
          kifyaWer: kifyaWer,
        },
        headers: authHeader(user_accessToken), // Add authentication headers
      });
      // console.log("Customers without reading fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching customers without reading:", error);
      throw error;
    }
  }
  // ======================================================

  /**
   * Fetches the last known reading for a specific customer account for a given period.
   * @param {string} accountNumber - The customer's account number.
   * @param {string} kifyaWer - The current kifyaWer string.
   * @returns {Promise<Object>} - A promise resolving to { previousReading: 12345 }.
   */
  async getPreviousReading(accountNumber, kifyaWer) {
    // Added kifyaWer parameter
    //  console.log("kifyaWerFormatted2", kifyaWer);
    // console.log("accountNumber", accountNumber);

    try {
      const user_accessToken = getAccesToken();
      const res = await axios.get(`${commonUrl}previous-reading-bill`, {
        params: {
          accountNumber, // Parameter 1
          kifyaWer, // Parameter 2
        },
        headers: authHeader(user_accessToken),
      });
      //console.log("Previous reading fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching previous reading:", error);
      // Preserve status code so callers can distinguish 404 vs other errors
      const message =
        error.response?.data?.message || "Failed to fetch previous reading.";
      const err = new Error(message);
      if (error?.response?.status) {
        err.status = error.response.status;
      }
      throw err;
    }
  }
  // ======================================================

  /**
   * Adds a new reading record.
   */
  // async addReading(readingData) {
  //   try {
  //     console.log("Adding reading with data:", readingData);
  //     const user_accessToken = getAccesToken();
  //     // Assuming your POST endpoint is the root of the reading controller
  //     const res = await axios.post(`${commonUrl}`, readingData, {
  //       headers: authHeader(user_accessToken),
  //     });
  //     return res.data;
  //   } catch (error) {
  //     console.error("Error adding reading:", error);
  //     throw new Error(
  //       error.response?.data?.message || "Failed to add reading."
  //     );
  //   }
  // }

  async addReading(customerAccountNumber, lastReading, kifyaWer, previousReading = undefined) {
    try {
      const user_accessToken = getAccesToken(); // Your token retrieval function

      const readingData = {
        customerAccountNumber,
        lastReading,
        kifyaWer,
      };
      // Include previousReading only when provided
      if (previousReading !== undefined && previousReading !== null) {
        readingData.previousReading = previousReading;
      }
      const endpoint = `${commonUrl.replace(/\/$/, "")}`;
      //console.log("Endpoint for adding reading:", endpoint);
      //console.log("Adding reading with data 333:", readingData);
      const res = await axios.post(endpoint, readingData, {
        headers: {
          ...authHeader(user_accessToken),
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      return res.data;
    } catch (error) {
      console.error("Error adding reading:", error);

      // Enhanced error handling
      let errorMessage = "Failed to add reading.";
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again.";
        } else if (error.response.status === 400) {
          errorMessage =
            "Invalid data: " +
            (error.response.data.message || "Please check your input.");
        }
      }

      throw new Error(errorMessage);
    }
  }

  async updateReading(id, readingData) {
    try {
      const user_accessToken = getAccesToken();

      const payload = {
        customerAccountNumber: readingData.customerAccountNumber,
        lastReading: readingData.lastReading,
        kifyaWer: readingData.kifyaWer,
      };

      const endpoint = `${commonUrl.replace(/\/$/, "")}/${id}`;

      const res = await axios.put(
        endpoint,
        payload,
        {
          headers: {
            ...authHeader(user_accessToken),
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      return res.data;
    } catch (error) {
      console.error("Error updating reading:", error);

      let errorMessage = "Failed to update reading.";
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized - Please login again.";
        } else if (error.response.status === 400) {
          errorMessage =
            "Invalid data: " +
            (error.response.data.message || "Please check your input.");
        }
      }

      throw new Error(errorMessage);
    }
  }

  // async generateBills(readingIds) {
  //   if (!readingIds || readingIds.length === 0) {
  //     throw new Error("No readings selected for bill generation.");
  //   }
  //   try {
  //     // Assuming your API endpoint is /api/v1/billing/generate
  //     const response = await fetch("/api/v1/billing/generate", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ readingIds }), // Send IDs in the correct format
  //     });

  //     if (!response.ok) {
  //       const errorText = await response.text();
  //       throw new Error(errorText || "Failed to generate bills.");
  //     }
  //     return await response.text(); // Return the success message from the backend
  //   } catch (error) {
  //     throw new Error(error.message || "An unknown error occurred.");
  //   }
  // }

  // Ensure axios, commonUrl, getAccesToken, and authHeader are accessible in this scope.
  async generateBills(readingIds) {
    if (!readingIds || readingIds.length === 0) {
      throw new Error("No readings selected for bill generation.");
    }

    try {
      const user_accessToken = getAccesToken(); // Assuming this function exists
      const res = await axios.post(
        `${commonUrl}generate`,
        { readingIds: readingIds }, // Body for POST request
        {
          headers: {
            "Content-Type": "application/json",
            ...authHeader(user_accessToken), // Merge with auth headers
          },
        }
      );

      console.log("Bills generation response:", res.data);
      return res.data; // Return the success message from the backend
    } catch (error) {
      console.error("Error generating bills:", error);
      throw new Error(
        error.response?.data ||
        "An unknown error occurred during bill generation."
      );
    }
  }

  // ===================== Wuzif Actions =====================
  async removeWuzif(readingId) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}wuzif/${readingId}/remove-wuzif`,
        {},
        { headers: authHeader(user_accessToken), timeout: 15000 }
      );
      return res.data;
    } catch (error) {
      console.error('Error removing wuzif:', error);
      throw error;
    }
  }

  async returnWuzif(readingId) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}wuzif/${readingId}/return-wuzif`,
        {},
        { headers: authHeader(user_accessToken), timeout: 15000 }
      );
      return res.data;
    } catch (error) {
      console.error('Error returning wuzif:', error);
      throw error;
    }
  }

  async removeKitate(readingId) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}wuzif/${readingId}/remove-kitate`,
        {},
        { headers: authHeader(user_accessToken), timeout: 15000 }
      );
      return res.data;
    } catch (error) {
      console.error('Error removing kitate:', error);
      throw error;
    }
  }

  async returnKitate(readingId) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}wuzif/${readingId}/return-kitate`,
        {},
        { headers: authHeader(user_accessToken), timeout: 15000 }
      );
      return res.data;
    } catch (error) {
      console.error('Error returning kitate:', error);
      throw error;
    }
  }

  async transferKitatToOldArrears(accountNumber, totalKitat) {
    try {
      const user_accessToken = getAccesToken();
      const payload = { accountNumber, totalKitat };
      const res = await axios.post(
        `${commonUrl}wuzif/transfer-kitat-to-old-arrears`,
        payload,
        { headers: authHeader(user_accessToken), timeout: 15000 }
      );
      return res.data;
    } catch (error) {
      console.error('Error transferring kitat to old arrears:', error);
      throw error;
    }
  }

  async applyConsumptionBasedCorrection(readingIds, reason, percent, baseType) {
    if (!readingIds || readingIds.length === 0) {
      throw new Error("No readings provided for correction.");
    }
    try {
      const user_accessToken = getAccesToken();
      const payload = { readingIds, reason, percent, baseType };
      const res = await axios.post(
        `${commonUrl}bills/consumption-based-correction`,
        payload,
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 60000,
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error applying consumption-based correction:', error);
      throw error;
    }
  }

  async voidBillsAndRevertToReadings(readingIds) {
    if (!readingIds || readingIds.length === 0) {
      throw new Error("No readings provided to void.");
    }
    try {
      const user_accessToken = getAccesToken();
      const payload = { readingIds };
      const res = await axios.post(
        `${commonUrl}bills/void-and-revert-to-readings`,
        payload,
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 60000,
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error voiding and reverting bills to readings:', error);
      throw error;
    }
  }

  async initAverageConsumption(accountNumbers, kifyaWer, months) {
    if (!Array.isArray(accountNumbers) || accountNumbers.length === 0) {
      throw new Error("No account numbers provided.");
    }
    if (!kifyaWer) {
      throw new Error("kifyaWer is required.");
    }
    if (!months || months <= 0) {
      throw new Error("Months must be greater than zero.");
    }
    try {
      const user_accessToken = getAccesToken();
      const payload = { accountNumbers, kifyaWer, months };
      const res = await axios.post(
        `${commonUrl}bills/average-consumption-init`,
        payload,
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 900000, // 5 minutes — bulk operation across many customers
        }
      );
      return res.data;
    } catch (error) {
      console.error('Error initializing average consumption:', error);
      throw error;
    }
  }

  async prepareMobileCsvForReader(request) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}mobile-csv/prepare`,
        request,
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 90000,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error preparing mobile CSV for reader:", error);
      throw error;
    }
  }

  // ==================== Wuzif Report ====================
  async getWuzifReportForCustomer(customerId) {
    try {
      const user_accessToken = getAccesToken();
      // Matches the endpoint added to ReadingController
      const res = await axios.get(`${commonUrl}wuzif/report/${customerId}`, {
        headers: authHeader(user_accessToken),
        timeout: 15000,
      });
      return res.data;
    } catch (error) {
      console.error('Error fetching wuzif report for customer:', error);
      throw error;
    }
  }

  async getBulkWuzifReportForCustomer(accountNumbers, kifyaWer) {
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}wuzif/report/bulk`,
        { accountNumbers, kifyaWer },
        { headers: authHeader(user_accessToken), timeout: 900000 }
      );
      return res.data;
    } catch (error) {
      console.error('Error fetching bulk wuzif report:', error);
      throw error;
    }
  }

  /**
   * Checks which of the given reading IDs still have active unpaid wuzif records.
   * @param {number[]} readingIds - Array of reading IDs to check.
   * @returns {Promise<Object>} - { success, wuzifReadingIds, totalChecked, totalWithWuzif }
   */
  async checkWuzifOccurrence(readingIds) {
    if (!readingIds || readingIds.length === 0) {
      return { success: true, wuzifReadingIds: [], totalChecked: 0, totalWithWuzif: 0 };
    }
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}check-wuzif-occurrence`,
        { readingIds },
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 60000,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking wuzif occurrence:", error);
      throw error;
    }
  }

  /**
   * Checks which of the given reading IDs have unpaid previous-month bills
   * (mirrors formalizeArrearsFor logic, read-only — does NOT create wuzif records).
   * @param {number[]} readingIds
   * @returns {Promise<Object>} - { success, havingWuzifReadingIds, totalChecked, totalWithUnpaidPrev }
   */
  async checkForHavingWuzif(readingIds) {
    if (!readingIds || readingIds.length === 0) {
      return { success: true, havingWuzifReadingIds: [], totalChecked: 0, totalWithUnpaidPrev: 0 };
    }
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}check-for-having-wuzif`,
        { readingIds },
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 120000,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking for having wuzif:", error);
      throw error;
    }
  }

  /**
   * Checks which reading IDs exist in the wuzif table as billingReadingActualPayment
   * with deleted = 'active' (regardless of payment status).
   * @param {number[]} readingIds
   * @returns {Promise<Object>} - { success, wuzifListReadingIds, totalChecked, totalInWuzifList }
   */
  async checkWuzifList(readingIds) {
    if (!readingIds || readingIds.length === 0) {
      return { success: true, wuzifListReadingIds: [], totalChecked: 0, totalInWuzifList: 0 };
    }
    try {
      const user_accessToken = getAccesToken();
      const res = await axios.post(
        `${commonUrl}check-wuzif-list`,
        { readingIds },
        {
          headers: { "Content-Type": "application/json", ...authHeader(user_accessToken) },
          timeout: 60000,
        }
      );
      return res.data;
    } catch (error) {
      console.error("Error checking wuzif list:", error);
      throw error;
    }
  }

  /**
   * Fetches the yearly consumption summary report for a date range.
   * @param {number} fromYear - Start Ethiopian year
   * @param {number} fromMonth - Start month index (1-based, 1=Meskerem)
   * @param {number} toYear - End Ethiopian year
   * @param {number} toMonth - End month index (1-based)
   * @param {number|null} customerTypeId - Optional customer type filter
   * @param {number|null} branchId - Optional branch filter
   * @returns {Promise<Object>} - { success, data: [...] }
   */
  async getYearlyConsumptionReport(fromYear, fromMonth, toYear, toMonth, customerTypeId, branchId) {
    try {
      const user_accessToken = getAccesToken();
      const params = { fromYear, fromMonth, toYear, toMonth };
      if (customerTypeId) params.customerTypeId = customerTypeId;
      if (branchId) params.branchId = branchId;
      const res = await axios.get(`${commonUrl}reports/yearly-consumption`, {
        params,
        headers: authHeader(user_accessToken),
        timeout: 60000,
      });
      return res.data;
    } catch (error) {
      console.error("Error fetching yearly consumption report:", error);
      throw error;
    }
  }
}
