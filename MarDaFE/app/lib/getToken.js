let __cachedRawToken = null;
let __cachedToken = null;

export default function getToken() {
  // Return null if not available to avoid sending bogus Authorization headers
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem('user_token');
    if (raw === __cachedRawToken && __cachedToken) {
      return __cachedToken;
    }
    if (!raw) {
      return null;
    }
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
  } catch (e) {
    // Malformed JSON or unexpected shape
    console.error('Error parsing token from localStorage:', e);
    return null;
  }
}