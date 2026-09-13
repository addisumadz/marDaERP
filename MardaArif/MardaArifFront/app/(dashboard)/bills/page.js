"use client";
import { useEffect, useState } from "react";
import { getBills, searchBills, getActiveCities, markBillPaid, initiateArifpayPayment, checkArifpayStatus } from "../../lib/arifApiService";

export default function BillsPage() {
  const [bills, setBills] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Arifpay Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalBill, setModalBill] = useState(null);
  const [phoneDigits, setPhoneDigits] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    // Check if redirecting back from ArifPay
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const sessionId = params.get("sessionId");

    if (status) {
      // Clear URL query parameters to avoid repeating status checks on reload
      window.history.replaceState({}, document.title, window.location.pathname);

      if (status === "success" && sessionId) {
        showToast("Verifying payment status...", "info");
        checkArifpayStatus(sessionId)
          .then((res) => {
            if (res.status === "SUCCESS") {
              showToast("Bill successfully paid with ArifPay!");
            } else {
              showToast(`ArifPay payment status: ${res.status}`, "warning");
            }
            loadBills();
          })
          .catch((err) => {
            showToast(`Failed to verify payment status: ${err.message}`, "error");
          });
      } else if (status === "cancel") {
        showToast("Payment was cancelled.", "warning");
      } else if (status === "error") {
        showToast("An error occurred during payment.", "error");
      }
    }

    Promise.all([loadBills(), loadCities()]);
  }, []);

  async function loadCities() {
    try {
      const data = await getActiveCities();
      setCities(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadBills(cityId) {
    setLoading(true);
    try {
      const data = await getBills(cityId || selectedCity || undefined);
      setBills(data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast("Failed to load bills", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) { loadBills(); return; }
    setLoading(true);
    try {
      const data = await searchBills(searchQuery, selectedCity || undefined);
      setBills(data || []);
      setCurrentPage(1);
    } catch (err) {
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleCityChange(cityId) {
    setSelectedCity(cityId);
    setSearchQuery("");
    loadBills(cityId);
  }

  async function handleMarkPaid(bill) {
    const amount = prompt("Enter paid amount:", bill.amountDue);
    if (!amount) return;
    try {
      await markBillPaid(bill.id, { paidAmount: parseFloat(amount), paidOn: new Date().toISOString().split("T")[0], bankName: "Manual", bankTransactionReference: "MANUAL-" + Date.now() });
      showToast("Bill marked as paid");
      loadBills();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function handlePayWithArifpay(bill) {
    setModalBill(bill);
    let digits = "";
    if (bill.phoneNumber) {
      const cleaned = bill.phoneNumber.replace(/[^\d]/g, "");
      if (cleaned.length >= 9) {
        digits = cleaned.slice(-9);
      } else {
        digits = cleaned;
      }
    }
    setPhoneDigits(digits);
    setSubmittingPayment(false);
    setIsModalOpen(true);
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 9000);
  }

  function getStatusBadge(status) {
    const map = { PENDING: "badge-warning", PAID: "badge-success", CANCELLED: "badge-danger", EXPIRED: "badge-info" };
    return map[status] || "badge-info";
  }

  const cityName = (cityId) => cities.find((c) => c.id === cityId)?.cityName || cityId;

  // Pagination Logic
  const totalPages = Math.ceil(bills.length / pageSize);
  const currentBills = bills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) {
        end = 5;
      } else if (end === totalPages) {
        start = totalPages - 4;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <>
      <div className="main-header">
        <h1>Bill Management</h1>
      </div>

      <div className="main-body">
        {/* Filters */}
        <div className="filters-bar">
          <div className="form-group">
            <label>City</label>
            <select className="select" value={selectedCity} onChange={(e) => handleCityChange(e.target.value)}>
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.cityName} ({c.cityCode})</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, maxWidth: 320 }}>
            <label>Search</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="Account #, Name, Bill ID..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>{bills.length} Bills</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          ) : bills.length === 0 ? (
            <div className="empty-state">
              <h3>No bills found</h3>
              <p>Bills will appear here as cities send them via the API</p>
            </div>
          ) : (
            <div>
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: "60px", textAlign: "center" }}>#</th>
                      <th>Bill ID</th>
                      <th>City</th>
                      <th>Customer ID</th>
                      <th>Customer Name</th>
                      <th>Reason</th>
                      <th>Cons.</th>
                      <th>Amount Due</th>
                      <th>Paid</th>
                      <th>Status</th>
                      <th>Valid Until</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBills.map((bill, index) => (
                      <tr key={bill.id}>
                        <td style={{ fontWeight: 600, color: "var(--text-muted)", textAlign: "center" }}>
                          {(currentPage - 1) * pageSize + index + 1}
                        </td>
                        <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{bill.billId}</td>
                        <td><span className="badge badge-purple">{cityName(bill.cityId)}</span></td>
                        <td>{bill.customerId}</td>
                        <td>{bill.customerName}</td>
                        <td style={{ fontSize: 13 }} title={bill.billReason}>{bill.billReason?.length > 20 ? bill.billReason.substring(0, 20) + '...' : (bill.billReason || "—")}</td>
                        <td>{bill.consumption || "—"}</td>
                        <td style={{ fontWeight: 600 }}>{Number(bill.amountDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ color: "var(--success)", fontWeight: 600 }}>{bill.paidAmount ? Number(bill.paidAmount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}</td>
                        <td><span className={`badge ${getStatusBadge(bill.status)}`}>{bill.status}</span></td>
                        <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{bill.validUntil || "—"}</td>
                        <td>
                          {bill.status === "PENDING" && (
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-sm btn-success" onClick={() => handleMarkPaid(bill)}>Mark Paid</button>
                              <button className="btn btn-sm btn-primary" onClick={() => handlePayWithArifpay(bill)}>Pay with Arifpay</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {bills.length > 0 && (
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
                    Showing <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{bills.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{" "}
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{Math.min(currentPage * pageSize, bills.length)}</span> of{" "}
                    <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{bills.length}</span> entries
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {/* Page Size Selector */}
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
                      style={{ padding: "4px 10px", fontSize: 12, opacity: currentPage === 1 ? 0.5 : 1 }}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          padding: "4px 10px",
                          fontSize: 12,
                          minWidth: 28,
                          justifyContent: "center"
                        }}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="btn btn-sm btn-secondary"
                      style={{ padding: "4px 10px", fontSize: 12, opacity: currentPage === totalPages ? 0.5 : 1 }}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && modalBill && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>Pay with ArifPay</h3>
              <button
                className="btn-icon"
                style={{ border: "none", background: "transparent", color: "var(--text-secondary)", fontSize: 20 }}
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (submittingPayment) return;
              const trimmed = phoneDigits.trim();
              if (!/^\d{9}$/.test(trimmed)) {
                showToast("Please enter exactly 9 digits after 251", "error");
                return;
              }
              const phone = "251" + trimmed;
              setSubmittingPayment(true);
              try {
                showToast("Redirecting to ArifPay...", "info");
                const res = await initiateArifpayPayment(modalBill.id, phone);
                if (res.checkoutUrl) {
                  window.location.href = res.checkoutUrl;
                } else {
                  showToast("Failed to retrieve checkout URL from ArifPay", "error");
                  setSubmittingPayment(false);
                }
              } catch (err) {
                showToast(err.message || "Failed to initiate payment", "error");
                setSubmittingPayment(false);
              }
            }}>
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 12 }}>
                  You are initiating payment for <strong>{modalBill.customerName || "Customer"}</strong> (Bill ID: {modalBill.billId}).
                </p>
                <div style={{ background: "rgba(0,0,0,0.15)", padding: 12, borderRadius: "var(--radius-md)", marginBottom: 20, border: "1px solid var(--border-color)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Amount Due:</span>
                    <span style={{ fontWeight: 600, color: "var(--accent-primary-hover)" }}>{Number(modalBill.amountDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} ETB</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Customer ID:</span>
                    <span style={{ color: "var(--text-primary)" }}>{modalBill.customerId}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Payer&apos;s Mobile Number</label>
                  <div style={{
                    display: "flex",
                    alignItems: "stretch",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-color)",
                    overflow: "hidden",
                    background: "var(--bg-input)"
                  }}>
                    <div style={{
                      padding: "10px 14px",
                      background: "rgba(255, 255, 255, 0.04)",
                      borderRight: "1px solid var(--border-color)",
                      color: "var(--text-muted)",
                      userSelect: "none",
                      display: "flex",
                      alignItems: "center",
                      fontWeight: 600,
                      fontSize: 14
                    }}>
                      251
                    </div>
                    <input
                      type="text"
                      className="input"
                      style={{
                        border: "none",
                        background: "transparent",
                        flex: 1,
                        padding: "10px 14px",
                        outline: "none",
                        boxShadow: "none",
                        borderRadius: 0,
                        fontWeight: 500,
                        letterSpacing: "0.05em"
                      }}
                      placeholder="9XXXXXXXX"
                      maxLength={9}
                      value={phoneDigits}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhoneDigits(val);
                      }}
                      autoFocus
                      required
                    />
                  </div>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                    Enter the remaining 9 digits of the payment phone number (e.g. 911223344)
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submittingPayment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingPayment}
                >
                  {submittingPayment ? (
                    <>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, marginRight: 6 }} />
                      Processing...
                    </>
                  ) : (
                    "Pay with Arifpay"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </>
  );
}
