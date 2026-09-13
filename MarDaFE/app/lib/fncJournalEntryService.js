"use client";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";
import axios from "axios";
import { baseURL } from "./httpCommon/http-common";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class FncJournalEntryService {
  async getAllEntries({ page = 0, size = 20, status, fiscalYearId } = {}) {
    const token = getAccesToken();
    let url = `${commonUrl}fnc-journal-entries/all?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    if (fiscalYearId) url += `&fiscalYearId=${fiscalYearId}`;
    const res = await axios.get(url, { headers: authHeader(token) });
    return res.data;
  }

  async getEntryById(id) {
    const token = getAccesToken();
    const res = await axios.get(`${commonUrl}fnc-journal-entries/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async createEntry(data) {
    const token = getAccesToken();
    const res = await axios.post(`${commonUrl}fnc-journal-entries`, data, { headers: authHeader(token) });
    return res.data;
  }

  async updateEntry(id, data) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-journal-entries/${id}`, data, { headers: authHeader(token) });
    return res.data;
  }

  async postEntry(id) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-journal-entries/${id}/post`, {}, { headers: authHeader(token) });
    return res.data;
  }

  async voidEntry(id, reason) {
    const token = getAccesToken();
    const res = await axios.put(`${commonUrl}fnc-journal-entries/${id}/void`, { reason }, { headers: authHeader(token) });
    return res.data;
  }

  async deleteEntry(id) {
    const token = getAccesToken();
    const res = await axios.delete(`${commonUrl}fnc-journal-entries/${id}`, { headers: authHeader(token) });
    return res.data;
  }

  async getUnpushedBillCount(kifyaWer) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}fnc-journal-entries/unpushed-count?kifyaWer=${encodeURIComponent(kifyaWer)}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async getUnpushedPaidBillCount(kifyaWer) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}fnc-journal-entries/unpushed-paid-count?kifyaWer=${encodeURIComponent(kifyaWer)}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async getJournalBalanceSummary(kifyaWer) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}fnc-journal-entries/journal-balance-summary?kifyaWer=${encodeURIComponent(kifyaWer)}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async getUnpaidBillsSummary(kifyaWer) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}fnc-journal-entries/unpaid-bills-summary?kifyaWer=${encodeURIComponent(kifyaWer)}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }

  async getEntriesByBillingMonth(billingMonth) {
    const token = getAccesToken();
    const res = await axios.get(
      `${commonUrl}fnc-journal-entries/by-billing-month?billingMonth=${encodeURIComponent(billingMonth)}`,
      { headers: authHeader(token) }
    );
    return res.data;
  }
}

const fncJournalEntryService = new FncJournalEntryService();
export default fncJournalEntryService;
