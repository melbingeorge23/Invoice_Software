import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/company-profile";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getCompanyProfile = async () => {
  const response = await axios.get(API_BASE_URL, getAuthHeaders());
  return response.data;
};

export const saveCompanyProfile = async (profileData) => {
  const response = await axios.post(API_BASE_URL, profileData, getAuthHeaders());
  return response.data;
};



export const uploadCompanyLogo = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const token = localStorage.getItem("token");

  const response = await axios.post(`${API_BASE_URL}/logo`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data;
};

export const fetchCompanyLogoBlobUrl = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.get(`${API_BASE_URL}/logo`, {
    responseType: "blob",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return URL.createObjectURL(response.data);
};