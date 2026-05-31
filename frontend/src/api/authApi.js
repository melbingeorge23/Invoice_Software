import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const AUTH_API_URL = `${API_BASE_URL}/api/auth`;

export const login = async (loginData) => {
  const response = await axios.post(`${AUTH_API_URL}/login`, loginData);
  return response.data;
};

export const register = async (registerData) => {
  const response = await axios.post(`${AUTH_API_URL}/register`, registerData);
  return response.data;
};