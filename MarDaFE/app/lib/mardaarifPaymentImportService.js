import axios from 'axios';
import { baseURL } from './httpCommon/http-common';

export class MardaArifPaymentImportService {
  constructor() {
    const b = new baseURL();
    this.baseURL = b.getUrl().replace(/\/$/, ''); // ensure no trailing slash
  }

  /**
   * Update multiple billing reading records with MardaArif payment information
   * @param {Array} updateRequests - Array of update requests with id and updates
   * @returns {Promise} Response from the server
   */
  async updateMardaArifPayments(updateRequests) {
    try {
      const requestBody = {
        updates: updateRequests
      };

      console.log('Sending MardaArif payment updates:', requestBody);

      const response = await axios.put(
        `${this.baseURL}/bulk-update-mardaarif`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('MardaArif payment update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating MardaArif payments:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }
      
      throw error;
    }
  }

  /**
   * Import MardaArif payments from CSV file
   * @param {File} file - CSV file containing MardaArif payment data
   * @param {string} kifyaWer - The billing period
   * @returns {Promise} Import report from the server
   */
  async importMardaArifPaymentsFromCsv(file, kifyaWer) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kifyaWer', kifyaWer);

      console.log('Importing MardaArif payments from CSV:', file.name, 'for period:', kifyaWer);

      const response = await axios.post(
        `${this.baseURL}/import-mardaarif-csv`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('MardaArif CSV import response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error importing MardaArif CSV:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      throw error;
    }
  }
}
