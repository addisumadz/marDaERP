"use client";

import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import { getActiveCities, getSmsLogs, registerSms, sendBulkSms, clearSmsLogs } from "../../lib/arifApiService";

export default function SmsPage() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [smsLogs, setSmsLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Import Modal & Preview
  const [importRows, setImportRows] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef(null);

  // Configuration Modal & State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState("https://smsethiopia.et/api/sms/send");
  const [apiKey, setApiKey] = useState("2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027");

  // Selection
  const [selectedSmsIds, setSelectedSmsIds] = useState(new Set());

  // Sending progress
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    loadCities();
    // Load config from localStorage if available
    const savedUrl = localStorage.getItem("arif_sms_gateway_url");
    const savedKey = localStorage.getItem("arif_sms_api_key");
    if (savedUrl) setGatewayUrl(savedUrl);
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    if (selectedCity) {
      loadSmsLogs();
    } else {
      setSmsLogs([]);
    }
    setSelectedSmsIds(new Set());
    setCurrentPage(1);
  }, [selectedCity]);

  async function loadCities() {
    try {
      const data = await getActiveCities();
      setCities(data || []);
      if (data && data.length > 0) {
        setSelectedCity(String(data[0].id));
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to load cities", "error");
    }
  }

  async function loadSmsLogs() {
    if (!selectedCity) return;
    setLoading(true);
    try {
      const data = await getSmsLogs(Number(selectedCity), statusFilter || undefined);
      setSmsLogs(data || []);
    } catch (err) {
      showToast("Failed to load SMS logs", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  const getCityName = (cityId) => {
    return cities.find((c) => String(c.id) === String(cityId))?.cityName || `City #${cityId}`;
  };

  const handleSaveConfig = () => {
    localStorage.setItem("arif_sms_gateway_url", gatewayUrl);
    localStorage.setItem("arif_sms_api_key", apiKey);
    showToast("Gateway configuration saved locally");
    setShowConfigModal(false);
  };

  const handleResetConfig = () => {
    const defaultUrl = "https://smsethiopia.et/api/sms/send";
    const defaultKey = "BKND6LXRKF819XB54J77IFEU9AB3JT9O:381";
    setGatewayUrl(defaultUrl);
    setApiKey(defaultKey);
    localStorage.setItem("arif_sms_gateway_url", defaultUrl);
    localStorage.setItem("arif_sms_api_key", defaultKey);
    showToast("Reset to default configuration");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (data.length < 2) {
          showToast("Excel file is empty or missing content.", "error");
          return;
        }

        const headers = data[0].map(h => String(h || "").trim());

        // Match headers: no, CityName, accountNumber, PhoneNumber, Message, billMonth
        const idxNo = headers.findIndex(h => h.toLowerCase() === "no");
        const idxCity = headers.findIndex(h => h.toLowerCase() === "cityname");
        const idxAcc = headers.findIndex(h => h.toLowerCase() === "accountnumber");
        const idxPhone = headers.findIndex(h => h.toLowerCase() === "phonenumber");
        const idxMsg = headers.findIndex(h => h.toLowerCase() === "message");
        const idxMonth = headers.findIndex(h => h.toLowerCase() === "billmonth");

        if (idxCity === -1 || idxPhone === -1 || idxMsg === -1) {
          showToast("Invalid format. Headers must include: no, CityName, accountNumber, PhoneNumber, Message, billMonth", "error");
          return;
        }

        const parsedRows = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row || row.length === 0) continue;
          if (row.every(cell => cell === null || cell === undefined || String(cell).trim() === "")) continue;

          parsedRows.push({
            excelNo: idxNo !== -1 ? String(row[idxNo] || "") : String(i),
            cityName: idxCity !== -1 ? String(row[idxCity] || "").trim() : "",
            accountNumber: idxAcc !== -1 ? String(row[idxAcc] || "").trim() : "",
            phoneNumber: idxPhone !== -1 ? String(row[idxPhone] || "").trim() : "",
            message: idxMsg !== -1 ? String(row[idxMsg] || "").trim() : "",
            billMonth: idxMonth !== -1 ? String(row[idxMonth] || "").trim() : "",
          });
        }

        if (parsedRows.length === 0) {
          showToast("No valid rows found in Excel sheet.", "error");
          return;
        }

        setImportRows(parsedRows);
        setShowImportModal(true);
      } catch (err) {
        console.error(err);
        showToast("Error parsing file. Check formatting.", "error");
      }
    };
    reader.readAsBinaryString(file);
    // Reset file input value so same file can be uploaded again
    e.target.value = "";
  };

  const handleRegisterSms = async () => {
    if (!selectedCity) return;
    try {
      const payload = importRows.map(row => ({
        cityId: Number(selectedCity),
        excelNo: row.excelNo,
        cityName: row.cityName,
        accountNumber: row.accountNumber,
        phoneNumber: row.phoneNumber,
        message: row.message,
        billMonth: row.billMonth
      }));

      await registerSms(payload);
      showToast(`Successfully registered ${payload.length} SMS messages`);
      setShowImportModal(false);
      setImportRows([]);
      loadSmsLogs();
    } catch (err) {
      showToast(err.message || "Failed to register SMS logs", "error");
    }
  };

  const handleClearLogs = async () => {
    if (!selectedCity) return;
    if (!confirm("Are you sure you want to clear all SMS logs for the selected city? This cannot be undone.")) return;

    try {
      await clearSmsLogs(Number(selectedCity));
      showToast("Cleared all logs successfully");
      loadSmsLogs();
      setSelectedSmsIds(new Set());
    } catch (err) {
      showToast(err.message || "Failed to clear logs", "error");
    }
  };

  const handleSendSelected = async () => {
    if (selectedSmsIds.size === 0) {
      showToast("Please select at least one SMS message to send", "warning");
      return;
    }

    setSending(true);
    setSendResult(null);

    const ids = Array.from(selectedSmsIds);

    try {
      const response = await sendBulkSms(ids, gatewayUrl, apiKey);
      showToast(`Sending finished: ${response.sent} sent, ${response.failed} failed`);
      setSendResult({
        total: response.total,
        sent: response.sent,
        failed: response.failed
      });
      loadSmsLogs();
      setSelectedSmsIds(new Set());
    } catch (err) {
      showToast(err.message || "Failed to send messages", "error");
    } finally {
      setSending(false);
    }
  };

  const handleSendSingle = async (smsId) => {
    setSending(true);
    setSendResult(null);
    try {
      const response = await sendBulkSms([smsId], gatewayUrl, apiKey);
      if (response.sent > 0) {
        showToast("SMS sent successfully!");
      } else {
        showToast("Failed to send SMS. Check logs.", "error");
      }
      loadSmsLogs();
    } catch (err) {
      showToast(err.message || "Failed to send SMS", "error");
    } finally {
      setSending(false);
    }
  };

  // Check matching city name
  const currentCityName = cities.find(c => String(c.id) === String(selectedCity))?.cityName || "";
  const getCityMismatchCount = () => {
    return importRows.filter(r => r.cityName.toLowerCase() !== currentCityName.toLowerCase()).length;
  };

  // Filtering Logic
  const filteredLogs = smsLogs.filter((log) => {
    const accMatch = log.accountNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = log.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const msgMatch = log.message?.toLowerCase().includes(searchQuery.toLowerCase());
    const noMatch = log.excelNo?.toLowerCase().includes(searchQuery.toLowerCase());

    const searchMatch = searchQuery === "" || accMatch || phoneMatch || msgMatch || noMatch;
    const statusMatch = statusFilter === "" || log.status === statusFilter;

    return searchMatch && statusMatch;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const currentSms = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);
      if (start === 1) end = 5;
      else if (end === totalPages) start = totalPages - 4;
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allFilteredIds = filteredLogs.map(s => s.id);
      setSelectedSmsIds(new Set(allFilteredIds));
    } else {
      setSelectedSmsIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const next = new Set(selectedSmsIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSmsIds(next);
  };

  const isAllSelected = filteredLogs.length > 0 && selectedSmsIds.size === filteredLogs.length;

  // Stats
  const statPending = smsLogs.filter(s => s.status === "PENDING").length;
  const statSending = smsLogs.filter(s => s.status === "SENDING").length;
  const statSent = smsLogs.filter(s => s.status === "SENT").length;
  const statFailed = smsLogs.filter(s => s.status === "FAILED").length;

  return (
    <>
      <div className="main-header">
        <h1>SMS Gateway Provider & Logs</h1>
        <div className="header-actions">
          <a href="/sms_template.csv" download className="btn btn-secondary" style={{ textDecoration: "none" }}>
            📋 Download Template
          </a>
          <button className="btn btn-secondary" onClick={() => setShowConfigModal(true)}>
            ⚙️ Configure Gateway
          </button>
          <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
            📥 Import Excel/CSV
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="main-body">
        {/* Dynamic Statistics */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon purple">💬</div>
            <div className="stat-info">
              <h3>{smsLogs.length}</h3>
              <p>Total Registered</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">⏳</div>
            <div className="stat-info">
              <h3>{statPending}</h3>
              <p>Pending Send</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{statSent}</h3>
              <p>Sent Messages</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">❌</div>
            <div className="stat-info">
              <h3>{statFailed}</h3>
              <p>Failed Messages</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="form-group">
            <label>Selected City</label>
            <select
              className="select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Choose City...</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.cityName} ({c.cityCode})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Filter Status</label>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="SENDING">SENDING</option>
              <option value="SENT">SENT</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, maxWidth: 360 }}>
            <label>Search Logs</label>
            <input
              className="input"
              placeholder="Search by account, phone, message..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {selectedCity && (
            <div style={{ display: "flex", gap: 8, paddingBottom: 16 }}>
              <button
                className="btn btn-success"
                onClick={handleSendSelected}
                disabled={selectedSmsIds.size === 0 || sending}
              >
                🚀 Send Selected ({selectedSmsIds.size})
              </button>
              <button
                className="btn btn-secondary"
                style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
                onClick={handleClearLogs}
                disabled={smsLogs.length === 0 || sending}
              >
                🗑️ Clear Logs
              </button>
            </div>
          )}
        </div>

        {/* Sending overlay info */}
        {sending && (
          <div className="card-glass" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 16, border: "1px solid var(--accent-primary)" }}>
            <div className="spinner" />
            <div>
              <h4 style={{ fontWeight: 600, color: "var(--text-primary)" }}>Sending in progress...</h4>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Please wait while the server transmits the messages to the API gateway.</p>
            </div>
          </div>
        )}

        {sendResult && (
          <div className="card" style={{ marginBottom: 20, borderColor: "var(--success-bg)" }}>
            <h4 style={{ fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: 8 }}>
              🎉 Transmission Complete
            </h4>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
              Processed <strong>{sendResult.total}</strong> SMS messages. Sent: <strong>{sendResult.sent}</strong>. Failed: <strong style={{ color: sendResult.failed > 0 ? "var(--danger)" : "var(--text-secondary)" }}>{sendResult.failed}</strong>.
            </p>
          </div>
        )}

        {/* SMS List Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>{filteredLogs.length} Registered SMS logs for {getCityName(selectedCity)}</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          ) : !selectedCity ? (
            <div className="empty-state">
              <h3>No City Selected</h3>
              <p>Choose a city from the dropdown to manage and import SMS messages.</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              <h3>No SMS Logs Found</h3>
              <p>Import an Excel file with the correct headers or adjust your filter rules.</p>
            </div>
          ) : (
            <div>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "40px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          style={{ transform: "scale(1.2)", cursor: "pointer" }}
                        />
                      </th>
                      <th style={{ width: "60px", textAlign: "center" }}>No</th>
                      <th>City</th>
                      <th>Account #</th>
                      <th>Phone Number</th>
                      <th>Message</th>
                      <th>Bill Month</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSms.map((log) => (
                      <tr key={log.id} style={{ background: selectedSmsIds.has(log.id) ? "rgba(99, 102, 241, 0.05)" : "transparent" }}>
                        <td style={{ textAlign: "center" }}>
                          <input
                            type="checkbox"
                            checked={selectedSmsIds.has(log.id)}
                            onChange={() => handleSelectRow(log.id)}
                            style={{ transform: "scale(1.1)", cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>
                          {log.excelNo}
                        </td>
                        <td>
                          <span className="badge badge-purple">{log.cityName}</span>
                        </td>
                        <td>{log.accountNumber}</td>
                        <td style={{ fontWeight: 500 }}>{log.phoneNumber}</td>
                        <td style={{ maxWidth: 280, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={log.message}>
                          {log.message}
                        </td>
                        <td>{log.billMonth}</td>
                        <td>
                          <span
                            className={`badge ${log.status === "SENT"
                                ? "badge-success"
                                : log.status === "FAILED"
                                  ? "badge-danger"
                                  : log.status === "SENDING"
                                    ? "badge-info"
                                    : "badge-warning"
                              }`}
                            title={log.errorMessage || ""}
                            style={{ cursor: log.errorMessage ? "help" : "default" }}
                          >
                            {log.status} {log.errorMessage && "⚠️"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleSendSingle(log.id)}
                            disabled={sending}
                            style={{ padding: "4px 8px", fontSize: 12 }}
                          >
                            🚀 Send
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderTop: "1px solid var(--border-color)",
                flexWrap: "wrap",
                gap: 12
              }}>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  Showing <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{Math.min(currentPage * pageSize, filteredLogs.length)}</span> of{" "}
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{filteredLogs.length}</span> entries
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 8 }}>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>Show</span>
                    <select
                      className="select"
                      style={{ width: "auto", padding: "4px 24px 4px 8px", fontSize: 12, height: 28 }}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span style={{ color: "var(--text-muted)", fontSize: 13 }}>entries</span>
                  </div>

                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>

                  {getPageNumbers().map(page => (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: "4px 10px", fontSize: 12, minWidth: 28, justifyContent: "center" }}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 850 }}>
            <div className="modal-header">
              <h3>Excel Import Preview ({importRows.length} rows parsed)</h3>
              <button
                style={{ background: "none", border: "none", fontSize: 20, color: "var(--text-muted)", cursor: "pointer" }}
                onClick={() => {
                  setShowImportModal(false);
                  setImportRows([]);
                }}
              >
                ✕
              </button>
            </div>

            {getCityMismatchCount() > 0 && (
              <div style={{
                background: "var(--warning-bg)",
                border: "1px solid var(--warning)",
                color: "var(--warning)",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                fontSize: 13,
                marginBottom: 16
              }}>
                ⚠️ <strong>Warning:</strong> {getCityMismatchCount()} imported records have a CityName value that does not match the currently selected city (<strong>{currentCityName}</strong>). They will still be registered under {currentCityName}.
              </div>
            )}

            <div style={{ overflowY: "auto", maxHeight: 400, border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
              <table style={{ fontSize: 13 }}>
                <thead>
                  <tr style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <th>No</th>
                    <th>City Name</th>
                    <th>Account #</th>
                    <th>Phone Number</th>
                    <th>Message</th>
                    <th>Bill Month</th>
                  </tr>
                </thead>
                <tbody>
                  {importRows.map((row, idx) => {
                    const hasMismatch = row.cityName.toLowerCase() !== currentCityName.toLowerCase();
                    return (
                      <tr key={idx} style={{ background: hasMismatch ? "rgba(245, 158, 11, 0.04)" : "transparent" }}>
                        <td>{row.excelNo}</td>
                        <td>
                          <span className={`badge ${hasMismatch ? 'badge-warning' : 'badge-purple'}`}>
                            {row.cityName}
                          </span>
                        </td>
                        <td>{row.accountNumber}</td>
                        <td style={{ fontWeight: 500 }}>{row.phoneNumber}</td>
                        <td style={{ maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.message}>
                          {row.message}
                        </td>
                        <td>{row.billMonth}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowImportModal(false);
                  setImportRows([]);
                }}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRegisterSms}>
                📥 Register {importRows.length} SMS Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Configuration Modal */}
      {showConfigModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>SMS Gateway Configuration</h3>
              <button
                style={{ background: "none", border: "none", fontSize: 20, color: "var(--text-muted)", cursor: "pointer" }}
                onClick={() => setShowConfigModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label>API Gateway Endpoint URL</label>
              <input
                className="input"
                placeholder="https://smsethiopia.et/api/sms/send"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>API Token / KEY</label>
              <input
                className="input"
                type="password"
                placeholder="Gateway Token..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div style={{
              background: "rgba(99, 102, 241, 0.05)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              padding: "10px 14px",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
              color: "var(--text-secondary)",
              marginBottom: 16
            }}>
              💡 Configurations are securely saved in your browser's local storage and used securely on the backend server for proxy transmission.
            </div>

            <div className="modal-footer" style={{ justifyContent: "space-between" }}>
              <button className="btn btn-secondary" style={{ color: "var(--danger)" }} onClick={handleResetConfig}>
                Reset to Default
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSaveConfig}>
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </>
  );
}
