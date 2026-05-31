import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

const PAYMENT_API_URL = `${API_BASE_URL}/api/payments`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const addPayment = async (invoiceId, paymentData) => {
  const response = await axios.post(
    `${PAYMENT_API_URL}/invoice/${invoiceId}`,
    paymentData,
    getAuthHeaders()
  );

  return response.data;
};

export const getPaymentsByInvoice = async (invoiceId) => {
  const response = await axios.get(
    `${PAYMENT_API_URL}/invoice/${invoiceId}`,
    getAuthHeaders()
  );

  return response.data;
};