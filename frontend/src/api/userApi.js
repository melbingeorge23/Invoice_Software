import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const USER_API_URL = `${API_BASE_URL}/api/users`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getAllUsers = async () => {
  const response = await axios.get(USER_API_URL, getAuthHeaders());
  return response.data;
};

export const createUser = async (userData) => {
  const response = await axios.post(USER_API_URL, userData, getAuthHeaders());
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await axios.put(`${USER_API_URL}/${id}`, userData, getAuthHeaders());
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await axios.delete(`${USER_API_URL}/${id}`, getAuthHeaders());
  return response.data;
};