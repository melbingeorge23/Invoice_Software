import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/customers";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createCustomer = async (customerData) => {
  const response = await axios.post(API_BASE_URL, customerData, getAuthHeaders());
  return response.data;
};

export const getAllCustomers = async () => {
  const response = await axios.get(API_BASE_URL, getAuthHeaders());
  return response.data;
};

export const updateCustomer = async (id, customerData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, customerData, getAuthHeaders());
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeaders());
  return response.data;
};