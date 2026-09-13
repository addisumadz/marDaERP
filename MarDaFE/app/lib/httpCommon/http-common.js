export class baseURL {
  getUrl() {
    // Use Next.js proxy route to avoid CORS issues
    // This will be rewritten to the backend URL by next.config.js
    let baseURL = "/backend/api/card_managenment/";

    // Prefer explicit public API URL when provided (works for prod/static/CDN too)
    if (process.env.NEXT_PUBLIC_API_URL) {
      baseURL = process.env.NEXT_PUBLIC_API_URL;
    }
    
    // Previous hardcoded IPs (kept as comments for reference)
    // let baseURL = "http://192.168.137.220:8081/hims/api/card_managenment/";
    // let baseURL = "http://192.168.8.106:8082/api/card_managenment/";
    // let baseURL = "http://192.168.137.137:8082/api/card_managenment/";
    // let baseURL = "http://10.161.70.140:8082/api/card_managenment/";

    return baseURL;
  }
}
