"use client";
import { useEffect, useState } from "react";
import { getDashboardStats, getCityStats, getRecentPayments, getCurrentUser } from "../../lib/arifApiService";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [cityStats, setCityStats] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [s, cs, rp] = await Promise.all([
        getDashboardStats(),
        getCityStats(),
        getRecentPayments(),
      ]);
      setStats(s);
      setCityStats(cs || []);
      setRecentPayments(rp || []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="main-header">
        <h1>Dashboard</h1>
        <div className="header-actions">
          <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
            Welcome, <strong>{user?.name || "Admin"}</strong>
          </span>
        </div>
      </div>

      <div className="main-body">
        {/* Stat Cards */}
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-icon purple">🏙️</div>
            <div className="stat-info">
              <h3>{stats?.activeCities || 0}</h3>
              <p>Active Cities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue">📄</div>
            <div className="stat-info">
              <h3>{stats?.totalBills?.toLocaleString() || 0}</h3>
              <p>Total Bills</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">⏳</div>
            <div className="stat-info">
              <h3>{stats?.pendingBills?.toLocaleString() || 0}</h3>
              <p>Pending Bills</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-info">
              <h3>{stats?.paidBills?.toLocaleString() || 0}</h3>
              <p>Paid Bills</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">💰</div>
            <div className="stat-info">
              <h3>{Number(stats?.totalPaidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <p>Total Paid (ETB)</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">📊</div>
            <div className="stat-info">
              <h3>{Number(stats?.totalPendingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <p>Pending Amount (ETB)</p>
            </div>
          </div>
        </div>

        {/* Per-City Stats */}
        {cityStats.length > 0 && (
          <div className="table-container" style={{ marginBottom: 24 }}>
            <div className="table-header">
              <h3>City Performance</h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Bills</th>
                  <th>Pending</th>
                  <th>Paid</th>
                  <th>Revenue (ETB)</th>
                  <th>Last Sync</th>
                </tr>
              </thead>
              <tbody>
                {cityStats.map((city, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{city.cityName}</td>
                    <td><span className="badge badge-purple">{city.cityCode}</span></td>
                    <td>
                      <span className={`badge ${city.isActive ? "badge-success" : "badge-danger"}`}>
                        {city.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{city.totalBills?.toLocaleString()}</td>
                    <td>{city.pendingBills?.toLocaleString()}</td>
                    <td>{city.paidBills?.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: "var(--success)" }}>
                      {Number(city.totalPaidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {city.lastSyncAt ? new Date(city.lastSyncAt).toLocaleString() : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Payments */}
        <div className="table-container">
          <div className="table-header">
            <h3>Recent Payments</h3>
          </div>
          {recentPayments.length === 0 ? (
            <div className="empty-state">
              <h3>No payments yet</h3>
              <p>Payments will appear here as cities sync their bills</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Account</th>
                  <th>Bill #</th>
                  <th>Amount</th>
                  <th>Bank</th>
                  <th>Date</th>
                  <th>Reconciled</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500, color: "var(--text-primary)" }}>{p.customerName}</td>
                    <td>{p.customerId}</td>
                    <td>{p.billNumber}</td>
                    <td style={{ fontWeight: 600, color: "var(--success)" }}>
                      {Number(p.paidAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td>{p.bankName}</td>
                    <td style={{ fontSize: 12 }}>{p.paidOn}</td>
                    <td>
                      <span className={`badge ${p.reconciled ? "badge-success" : "badge-warning"}`}>
                        {p.reconciled ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
