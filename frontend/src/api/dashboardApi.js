import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const DASHBOARD_API_URL = `${API_BASE_URL}/api/dashboard`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getDashboardSummary = async () => {
  const response = await axios.get(`${DASHBOARD_API_URL}/summary`, getAuthHeaders());
  return response.data;
};