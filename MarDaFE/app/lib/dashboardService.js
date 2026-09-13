import axios from "axios";
import { baseURL } from "./httpCommon/http-common";
import authHeader from "./authHeader/authhheader";
import getAccesToken from "./getToken";

const baseUrl = new baseURL();
const commonUrl = baseUrl.getUrl();

class DashboardService {
    async getSummary() {
        const token = getAccesToken();
        try {
            // Backend is mapped to /api/card_managenment/dashboard/summary
            // commonUrl is .../api/card_managenment/
            return await axios.get(`${commonUrl}dashboard/summary`, {
                headers: authHeader(token)
            });
        } catch (err) {
            console.error("Dashboard Service Error (getSummary):", err);
            throw err;
        }
    }

    async refreshSummary(user = "System") {
        const token = getAccesToken();
        try {
            // Backend is mapped to /api/card_managenment/dashboard/refresh
            return await axios.post(`${commonUrl}dashboard/refresh?user=${user}`, {}, {
                headers: authHeader(token)
            });
        } catch (err) {
            console.error("Dashboard Service Error (refreshSummary):", err);
            throw err;
        }
    }
}

export default new DashboardService();
