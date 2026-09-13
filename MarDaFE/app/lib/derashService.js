// Derash service for submitting individual bills to Derash payment gateway
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();
const derashService = {
  /**
   * Submit a single customer bill to Derash
   * @param {Object} billData - Bill data in Derash format
   * @param {string} billData.bill_id - Unique bill identification
   * @param {string} billData.bill_desc - Description of bill breakdown
   * @param {string} billData.reason - Reason of the bill
   * @param {string} billData.amount_due - Total bill amount due
   * @param {string} billData.due_date - Due date in yyyy-mm-dd format
   * @param {boolean} billData.partial_pay_allowed - Whether partial payment is allowed
   * @param {string} billData.customer_id - Customer identifier
   * @param {string} billData.name - Customer/company name
   * @param {string} billData.mobile - Customer mobile number
   * @param {string} billData.email - Customer email
   * @returns {Promise<Object>} Response from Derash API
   */
  async submitBillToDerash(billData) {
    try {
      const response = await fetch(`${commonUrl}submit-bill-to-derash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(billData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error submitting bill to Derash:', error);
      throw error;
    }
  },

  /**
   * Test Derash API connectivity and configuration
   * @returns {Promise<Object>} Test result
   */
  async testDerashConnection() {
    try {
      const response = await fetch(`${commonUrl}bank-payments/test-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to test Derash configuration');
      }

      return await response.json();

    } catch (error) {
      console.error('Error testing Derash connection:', error);
      throw error;
    }
  },
};

export default derashService;
