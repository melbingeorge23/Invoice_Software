import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/products";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createProduct = async (productData) => {
  const response = await axios.post(API_BASE_URL, productData, getAuthHeaders());
  return response.data;
};

export const getAllProducts = async () => {
  const response = await axios.get(API_BASE_URL, getAuthHeaders());
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_BASE_URL}/${id}`, productData, getAuthHeaders());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeaders());
  return response.data;
};