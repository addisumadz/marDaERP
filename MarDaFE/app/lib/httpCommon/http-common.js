import axios from "axios";

// Helper to determine the auth refresh URL
function getAuthRefreshUrl() {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    let base = process.env.NEXT_PUBLIC_API_URL.trim();
    base = base.replace(/\/api\/(mardaerp|card_managenmentRole|mardaerpRole|card_managenment)\/?.*$/, "");
    if (base.endsWith("/")) base = base.slice(0, -1);
    return `${base}/api/auth/refreshtoken`;
  }
  return "/backend/api/auth/refreshtoken";
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Configure global Axios interceptor for automatic 401 Unauthorized handling & transparent token refresh
if (typeof window !== "undefined" && !window.__axios401InterceptorAttached) {
  window.__axios401InterceptorAttached = true;
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Only handle 401 Unauthorized (expired/invalid credentials).
      // Do NOT treat 403 Forbidden as an expired session.
      if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
        const isAuthEndpoint = originalRequest.url?.includes("/api/auth/");
        if (!isAuthEndpoint) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = "Bearer " + token;
                return axios(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          // Retrieve refresh token from localStorage or sessionStorage
          let refreshToken = null;
          try {
            refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
              const raw = localStorage.getItem("user_token") || sessionStorage.getItem("user_token");
              if (raw) {
                const parsed = JSON.parse(raw);
                refreshToken = parsed?.refreshToken || parsed?.user?.refreshToken;
              }
            }
          } catch (_) {}

          if (refreshToken) {
            try {
              const refreshUrl = getAuthRefreshUrl();
              const response = await axios.post(
                refreshUrl,
                { refreshToken },
                { headers: { "Content-Type": "application/json" } }
              );

              const newAccessToken = response.data?.accessToken || response.data?.token;
              const newRefreshToken = response.data?.refreshToken;

              if (newAccessToken) {
                // Update storage with fresh tokens
                try {
                  const raw = localStorage.getItem("user_token");
                  if (raw) {
                    const sessionData = JSON.parse(raw);
                    sessionData.accessToken = newAccessToken;
                    sessionData.token = newAccessToken;
                    if (newRefreshToken) sessionData.refreshToken = newRefreshToken;
                    localStorage.setItem("user_token", JSON.stringify(sessionData));
                  }
                  localStorage.setItem("token", newAccessToken);
                  if (newRefreshToken) {
                    localStorage.setItem("refreshToken", newRefreshToken);
                  }
                } catch (_) {}

                processQueue(null, newAccessToken);
                isRefreshing = false;

                // Retry original request with fresh access token
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
                return axios(originalRequest);
              }
            } catch (refreshErr) {
              processQueue(refreshErr, null);
              isRefreshing = false;
            }
          } else {
            isRefreshing = false;
          }

          // If refresh token is missing or refresh failed: clear storage and redirect cleanly
          try {
            localStorage.removeItem("user_token");
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            sessionStorage.clear();
          } catch (_) {}

          if (!window.location.pathname.startsWith("/signin")) {
            window.location.href = "/signin?error=SessionExpired";
          }
        }
      }

      return Promise.reject(error);
    }
  );
}

export class baseURL {
  getUrl() {
    // Use Next.js proxy route to avoid CORS issues
    // This will be rewritten to the backend URL by next.config.js
    let baseURL = "/backend/api/mardaerp/";

    // Prefer explicit public API URL when provided (works for prod/static/CDN too)
    if (process.env.NEXT_PUBLIC_API_URL) {
      baseURL = process.env.NEXT_PUBLIC_API_URL;
    }

    if (!baseURL.endsWith("/")) {
      baseURL += "/";
    }

    return baseURL;
  }
}

