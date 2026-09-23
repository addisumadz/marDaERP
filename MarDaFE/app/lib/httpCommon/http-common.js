import axios from "axios";

// Configure global Axios interceptor for automatic 401 Unauthorized handling
if (typeof window !== "undefined" && !window.__axios401InterceptorAttached) {
  window.__axios401InterceptorAttached = true;
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // If the 401 is from signin itself, do not loop redirect
        const isAuthEndpoint = error.config?.url?.includes("/api/auth/signin");
        if (!isAuthEndpoint) {
          try {
            localStorage.removeItem("user_token");
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

    return baseURL;
  }
}

