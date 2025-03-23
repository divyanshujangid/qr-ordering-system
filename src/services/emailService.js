// services/emailService.js
import axios from 'axios';

export const emailReceiptService = {
  /**
   * Send an email with receipt details
   * @param {Object} emailData - Contains to, subject, and html content
   * @returns {Promise} - Resolves when email is sent successfully
   */
  sendEmail(emailData) {
    return axios.post('/api/send-receipt-email', emailData);
  }
};