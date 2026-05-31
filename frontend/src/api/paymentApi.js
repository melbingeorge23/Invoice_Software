import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/payments";

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
    `${API_BASE_URL}/invoice/${invoiceId}`,
    paymentData,
    getAuthHeaders()
  );

  return response.data;
};

export const getPaymentsByInvoice = async (invoiceId) => {
  const response = await axios.get(
    `${API_BASE_URL}/invoice/${invoiceId}`,
    getAuthHeaders()
  );

  return response.data;
};