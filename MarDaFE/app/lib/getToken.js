let __cachedRawToken = null;
let __cachedToken = null;

export default function getToken() {
  // Return null if not available to avoid sending bogus Authorization headers
  if (typeof window === "undefined") return null;
  try {
    let raw = localStorage.getItem('user_token');
    if (!raw) {
      raw = localStorage.getItem('token') || sessionStorage.getItem('user_token') || sessionStorage.getItem('token');
    }
    if (raw === __cachedRawToken && __cachedToken) {
      return __cachedToken;
    }
    if (!raw) {
      return null;
    }
    try {
      const session = JSON.parse(raw);
      // Try common shapes/keys
      const candidates = [
        session?.accessToken,
        session?.token,
        session?.access_token,
        session?.data?.accessToken,
        session?.user?.accessToken,
      ].filter(Boolean);
      const token = candidates.length > 0 ? String(candidates[0]) : null;
      __cachedRawToken = raw;
      __cachedToken = token && token.length > 0 ? token : null;
      return __cachedToken;
    } catch (_) {
      // If raw is already a plain token string (e.g. JWT)
      if (typeof raw === "string" && raw.trim().length > 0) {
        __cachedRawToken = raw;
        __cachedToken = raw.trim();
        return __cachedToken;
      }
      return null;
    }
  } catch (e) {
    // Malformed JSON or unexpected shape
    console.error('Error parsing token from storage:', e);
    return null;
  }
}