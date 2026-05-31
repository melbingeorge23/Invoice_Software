import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const CUSTOMER_API_URL = `${API_BASE_URL}/api/customers`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createCustomer = async (customerData) => {
  const response = await axios.post(CUSTOMER_API_URL, customerData, getAuthHeaders());
  return response.data;
};

export const getAllCustomers = async () => {
  const response = await axios.get(CUSTOMER_API_URL, getAuthHeaders());
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`${CUSTOMER_API_URL}/${id}`, customerData, getAuthHeaders());
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axios.delete(`${CUSTOMER_API_URL}/${id}`, getAuthHeaders());
  return response.data;
};