"use client";
import { useEffect, useState } from "react";
import { getCities, createCity, updateCity, deactivateCity, generateCityApiKey } from "../../lib/arifApiService";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [form, setForm] = useState({ cityName: "", cityCode: "", wbmsBaseUrl: "", contactPhone: "", contactEmail: "" });
  const [toast, setToast] = useState(null);

  useEffect(() => { loadCities(); }, []);

  async function loadCities() {
    try {
      const data = await getCities();
      setCities(data || []);
    } catch (err) {
      showToast("Failed to load cities", "error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 9000);
  }

  function openAddModal() {
    setEditingCity(null);
    setForm({ cityName: "", cityCode: "", wbmsBaseUrl: "", contactPhone: "", contactEmail: "" });
    setShowModal(true);
  }

  function openEditModal(city) {
    setEditingCity(city);
    setForm({
      cityName: city.cityName,
      cityCode: city.cityCode,
      wbmsBaseUrl: city.wbmsBaseUrl || "",
      contactPhone: city.contactPhone || "",
      contactEmail: city.contactEmail || "",
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingCity) {
        await updateCity(editingCity.id, { ...form, active: editingCity.active });
        showToast("City updated successfully");
      } else {
        await createCity(form);
        showToast("City created successfully");
      }
      setShowModal(false);
      loadCities();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleDeactivate(id) {
    if (!confirm("Deactivate this city?")) return;
    try {
      await deactivateCity(id);
      showToast("City deactivated");
      loadCities();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  async function handleGenerateKey(id) {
    try {
      const data = await generateCityApiKey(id);
      showToast(`New API Key: ${data.apiKey}`);
      loadCities();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  if (loading) {
    return <div className="loading-page"><div className="spinner" /></div>;
  }

  return (
    <>
      <div className="main-header">
        <h1>City Management</h1>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add City</button>
      </div>

      <div className="main-body">
        <div className="table-container">
          <div className="table-header">
            <h3>{cities.length} Cities</h3>
          </div>
          {cities.length === 0 ? (
            <div className="empty-state">
              <h3>No cities configured</h3>
              <p>Add a city to start receiving bills from WBMS instances</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>City Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th>API Key</th>
                  <th>WBMS URL</th>
                  <th>Last Sync</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{city.cityName}</td>
                    <td><span className="badge badge-purple">{city.cityCode}</span></td>
                    <td>
                      <span className={`badge ${city.active ? "badge-success" : "badge-danger"}`}>
                        {city.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <code style={{
                        fontSize: 11, background: "var(--bg-input)", padding: "3px 8px",
                        borderRadius: 4, color: "var(--text-muted)", maxWidth: 160,
                        display: "inline-block", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {city.apiKey}
                      </code>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>{city.wbmsBaseUrl || "—"}</td>
                    <td style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {city.lastSyncAt ? new Date(city.lastSyncAt).toLocaleString() : "Never"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(city)}>Edit</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleGenerateKey(city.id)}>🔑 Key</button>
                        {city.active && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeactivate(city.id)} style={{ fontSize: 12, padding: "4px 8px" }}>
                            Disable
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCity ? "Edit City" : "Add New City"}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>City Name *</label>
                <input className="input" value={form.cityName} onChange={(e) => setForm({ ...form, cityName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>City Code *</label>
                <input className="input" value={form.cityCode} onChange={(e) => setForm({ ...form, cityCode: e.target.value })} required placeholder="e.g. AA, DR, HW" />
              </div>
              <div className="form-group">
                <label>WBMS Base URL</label>
                <input className="input" value={form.wbmsBaseUrl} onChange={(e) => setForm({ ...form, wbmsBaseUrl: e.target.value })} placeholder="http://city-ip:9092/" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input className="input" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input className="input" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCity ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </>
  );
}
