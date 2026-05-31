import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const PRODUCT_API_URL = `${API_BASE_URL}/api/products`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createProduct = async (productData) => {
  const response = await axios.post(PRODUCT_API_URL, productData, getAuthHeaders());
  return response.data;
};

export const getAllProducts = async () => {
  const response = await axios.get(PRODUCT_API_URL, getAuthHeaders());
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${PRODUCT_API_URL}/${id}`, productData, getAuthHeaders());
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${PRODUCT_API_URL}/${id}`, getAuthHeaders());
  return response.data;
};