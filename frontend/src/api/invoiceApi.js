import axios from "axios";
import { API_BASE_URL } from "./apiConfig";

// const API_BASE_URL = "http://localhost:8080/api/invoices";
const INVOICE_API_URL = `${API_BASE_URL}/api/invoices`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const createInvoice = async (invoiceData) => {
  const response = await axios.post(INVOICE_API_URL, invoiceData, getAuthHeaders());
  return response.data;
};

export const getAllInvoices = async () => {
  const response = await axios.get(INVOICE_API_URL, getAuthHeaders());
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${INVOICE_API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const updateInvoice = async (id, invoiceData) => {
  const response = await axios.put(`${INVOICE_API_URL}/${id}`, invoiceData, getAuthHeaders());
  return response.data;
};

export const downloadInvoicePdf = async (id) => {
  const response = await axios.get(`${INVOICE_API_URL}/${id}/pdf`, {
    responseType: "blob",
    ...getAuthHeaders()
  });

  const fileURL = window.URL.createObjectURL(new Blob([response.data]));
  const fileLink = document.createElement("a");

  fileLink.href = fileURL;
  fileLink.setAttribute("download", `invoice-${id}.pdf`);

  document.body.appendChild(fileLink);
  fileLink.click();
  fileLink.remove();
};

export const viewInvoicePdf = async (id) => {
  const newWindow = window.open("", "_blank");

  const response = await axios.get(`${INVOICE_API_URL}/${id}/pdf`, {
    responseType: "blob",
    ...getAuthHeaders()
  });

  const fileURL = window.URL.createObjectURL(
    new Blob([response.data], { type: "application/pdf" })
  );

  newWindow.location.href = fileURL;
};