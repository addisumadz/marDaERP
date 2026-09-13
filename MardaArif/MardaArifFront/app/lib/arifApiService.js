// MardaArif API Service — communicates with MardaArif Backend (port 8083)

const API_BASE = typeof window !== 'undefined' ? '/backend' : (process.env.BACKEND_URL || 'http://localhost:8083');

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('arif_token') : null;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

async function handleResponse(res) {
    if (res.status === 401) {
        // Token expired or invalid
        if (typeof window !== 'undefined') {
            localStorage.removeItem('arif_token');
            localStorage.removeItem('arif_user');
            window.location.href = '/signin';
        }
        throw new Error('Unauthorized');
    }
    const data = await res.json().catch(() => null);
    if (!res.ok) {
        throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
    }
    return data;
}

// ============ AUTH ============
export async function login(username, password) {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await handleResponse(res);
    if (data.accessToken) {
        localStorage.setItem('arif_token', data.accessToken);
        localStorage.setItem('arif_user', JSON.stringify({
            id: data.id,
            username: data.username,
            name: data.name,
            roles: data.roles,
        }));
    }
    return data;
}

export function logout() {
    localStorage.removeItem('arif_token');
    localStorage.removeItem('arif_user');
    window.location.href = '/signin';
}

export function getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('arif_user');
    return user ? JSON.parse(user) : null;
}

export function isAuthenticated() {
    return !!localStorage.getItem('arif_token');
}

// ============ DASHBOARD ============
export async function getDashboardStats() {
    const res = await fetch(`${API_BASE}/api/dashboard/stats`, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function getCityStats() {
    const res = await fetch(`${API_BASE}/api/dashboard/city-stats`, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function getRecentPayments() {
    const res = await fetch(`${API_BASE}/api/dashboard/recent-payments`, { headers: getAuthHeaders() });
    return handleResponse(res);
}

// ============ CITIES ============
export async function getCities() {
    const res = await fetch(`${API_BASE}/api/cities`, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function getActiveCities() {
    const res = await fetch(`${API_BASE}/api/cities/active`, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function getCity(id) {
    const res = await fetch(`${API_BASE}/api/cities/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function createCity(cityData) {
    const res = await fetch(`${API_BASE}/api/cities`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(cityData),
    });
    return handleResponse(res);
}

export async function updateCity(id, cityData) {
    const res = await fetch(`${API_BASE}/api/cities/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(cityData),
    });
    return handleResponse(res);
}

export async function deactivateCity(id) {
    const res = await fetch(`${API_BASE}/api/cities/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function generateCityApiKey(id) {
    const res = await fetch(`${API_BASE}/api/cities/${id}/generate-key`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

// ============ BILLS ============
export async function getBills(cityId) {
    const url = cityId ? `${API_BASE}/api/bills?cityId=${cityId}` : `${API_BASE}/api/bills`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function searchBills(query, cityId) {
    let url = `${API_BASE}/api/bills/search?query=${encodeURIComponent(query)}`;
    if (cityId) url += `&cityId=${cityId}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function markBillPaid(id, paymentData) {
    const res = await fetch(`${API_BASE}/api/bills/${id}/mark-paid`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
    });
    return handleResponse(res);
}

// ============ PAYMENTS ============
export async function getPayments(cityId, fromDate, toDate) {
    let url = `${API_BASE}/api/payments?`;
    const params = [];
    if (cityId) params.push(`cityId=${cityId}`);
    if (fromDate) params.push(`fromDate=${fromDate}`);
    if (toDate) params.push(`toDate=${toDate}`);
    url += params.join('&');
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function searchPayments(query, cityId) {
    let url = `${API_BASE}/api/payments/search?query=${encodeURIComponent(query)}`;
    if (cityId) url += `&cityId=${cityId}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function reconcilePayment(id) {
    const res = await fetch(`${API_BASE}/api/payments/${id}/reconcile`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function bulkReconcile(ids) {
    const res = await fetch(`${API_BASE}/api/payments/bulk-reconcile`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids }),
    });
    return handleResponse(res);
}

// ============ SMS ============
export async function getSmsLogs(cityId, status) {
    let url = `${API_BASE}/api/sms?cityId=${cityId}`;
    if (status) url += `&status=${status}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    return handleResponse(res);
}

export async function registerSms(smsList) {
    const res = await fetch(`${API_BASE}/api/sms/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(smsList),
    });
    return handleResponse(res);
}

export async function clearSmsLogs(cityId) {
    const res = await fetch(`${API_BASE}/api/sms/clear?cityId=${cityId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function sendBulkSms(ids, gatewayUrl, apiKey) {
    const res = await fetch(`${API_BASE}/api/sms/send-bulk`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids, gatewayUrl, apiKey }),
    });
    return handleResponse(res);
}

// ============ ARIFPAY PAYMENTS ============
export async function initiateArifpayPayment(billId, phone) {
    const res = await fetch(`${API_BASE}/api/payments/arifpay/initiate/${billId}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ phone: phone || undefined }),
    });
    return handleResponse(res);
}

export async function checkArifpayStatus(sessionId) {
    const res = await fetch(`${API_BASE}/api/payments/arifpay/status/${sessionId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}


