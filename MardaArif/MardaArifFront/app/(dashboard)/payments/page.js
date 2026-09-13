"use client";
import { useEffect, useState } from "react";
import { getPayments, searchPayments, reconcilePayment, bulkReconcile, getActiveCities } from "../../lib/arifApiService";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([loadPayments(), loadCities()]);
  }, []);

  async function loadCities() {
    try { setCities(await getActiveCities() || []); } catch (err) { console.error(err); }
  }

  async function loadPayments() {
    setLoading(true);
    try {
      const data = await getPayments(selectedCity || undefined, fromDate || undefined, toDate || undefined);
      setPayments(data || []);
      setSelectedIds([]);
    } catch (err) {
      showToast("Failed to load payments", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) { loadPayments(); return; }
    setLoading(true);
    try {
      setPayments(await searchPayments(searchQuery, selectedCity || undefined) || []);
    } catch (err) {
      showToast("Search failed", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReconcile(id) {
    try {
      await reconcilePayment(id);
      showToast("Payment reconciled");
      loadPayments();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleBulkReconcile() {
    if (selectedIds.length === 0) return;
    try {
      await bulkReconcile(selectedIds);
      showToast(`${selectedIds.length} payments reconciled`);
      loadPayments();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function toggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    const unreconciledIds = payments.filter((p) => !p.reconciled).map((p) => p.id);
    if (selectedIds.length === unreconciledIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unreconciledIds);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 9000);
  }

  const cityName = (cityId) => cities.find((c) => c.id === cityId)?.cityName || cityId;

  return (
    <>
      <div className="main-header">
        <h1>Payment Hub</h1>
        {selectedIds.length > 0 && (
          <button className="btn btn-primary" onClick={handleBulkReconcile}>
            ✅ Reconcile {selectedIds.length} Selected
          </button>
        )}
      </div>

      <div className="main-body">
        {/* Filters */}
        <div className="filters-bar">
          <div className="form-group">
            <label>City</label>
            <select className="select" value={selectedCity} onChange={(e) => { setSelectedCity(e.target.value); }}>
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.cityName} ({c.cityCode})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>From Date</label>
            <input type="date" className="input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>To Date</label>
            <input type="date" className="input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>&nbsp;</label>
            <button className="btn btn-primary" onClick={loadPayments}>Filter</button>
          </div>
          <div className="form-group" style={{ flex: 1, maxWidth: 280 }}>
            <label>Search</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input className="input" placeholder="Account #, Name..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
              <button className="btn btn-secondary" onClick={handleSearch}>🔍</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>{payments.length} Payments</h3>
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
          ) : payments.length === 0 ? (
            <div className="empty-state">
              <h3>No payments found</h3>
              <p>Payments will appear here after bills are paid</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input type="checkbox"
                        checked={selectedIds.length > 0 && selectedIds.length === payments.filter((p) => !p.reconciled).length}
                        onChange={toggleSelectAll} />
                    </th>
                    <th>Customer</th>
                    <th>Account</th>
                    <th>Bill #</th>
                    <th>City</th>
                    <th>Amount</th>
                    <th>Bank</th>
                    <th>Reference</th>
                    <th>Date</th>
                    <th>Reconciled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} style={{ background: selectedIds.includes(p.id) ? "rgba(99,102,241,0.06)" : undefined }}>
                      <td>
                        {!p.reconciled && (
                          <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                        )}
                      </td>
                      <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.customerName}</td>
                      <td>{p.customerId}</td>
                      <td>{p.billNumber}</td>
                      <td><span className="badge badge-purple">{cityName(p.cityId)}</span></td>
                      <td style={{ fontWeight: 600, color: "var(--success)" }}>
                        {Number(p.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td>{p.bankName || "—"}</td>
                      <td style={{ fontSize: 11, color: "var(--text-muted)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.bankTransactionReference || "—"}
                      </td>
                      <td style={{ fontSize: 12 }}>{p.paidOn || "—"}</td>
                      <td>
                        <span className={`badge ${p.reconciled ? "badge-success" : "badge-warning"}`}>
                          {p.reconciled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        {!p.reconciled && (
                          <button className="btn btn-sm btn-success" onClick={() => handleReconcile(p.id)}>
                            Reconcile
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </>
  );
}
