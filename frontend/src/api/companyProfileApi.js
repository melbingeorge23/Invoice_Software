import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const COMPANY_PROFILE_API_URL = `${API_BASE_URL}/api/company-profile`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getCompanyProfile = async () => {
  const response = await axios.get(COMPANY_PROFILE_API_URL, getAuthHeaders());
  return response.data;
};

export const saveCompanyProfile = async (profileData) => {
  const response = await axios.post(COMPANY_PROFILE_API_URL, profileData, getAuthHeaders());
  return response.data;
};



export const uploadCompanyLogo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");

  const response = await axios.post(`${COMPANY_PROFILE_API_URL}/logo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};

export const fetchCompanyLogoBlobUrl = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${COMPANY_PROFILE_API_URL}/logo`, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return URL.createObjectURL(response.data);
};