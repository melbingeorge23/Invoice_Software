import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import "./invoice.css";
import companyLogo from "./assets/Molsys1.png";
import Dashboard from "./Dashboard";

Modal.setAppElement("#root");

const InvoiceApp = () => {
  const [page, setPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("");
  const [designation, setDesignation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPO, setIsGeneratingPO] = useState(false);
  const [isGeneratingQuotation, setIsGeneratingQuotation] = useState(false);
  
  const [invoiceRows, setInvoiceRows] = useState([
    { description: '', quantity: '', price: '' }
  ]);

  const [invoiceData, setInvoiceData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    recipient: '',
    gstinRecipient: '',
    netTotal: '0.00',
    gst: '0.00',
    grandTotal: '0.00'
  });

  const resetForm = () => {
  setInvoiceRows([{ description: '', quantity: '', price: '' }]);
  setInvoiceData({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    recipient: '',
    gstinRecipient: '',
    netTotal: '0.00',
    gst: '0.00',
    grandTotal: '0.00'
  });
  // Add any other state resets you need here
};

  const [purchaseOrderData, setPurchaseOrderData] = useState({
    date: new Date().toISOString().split('T')[0],
    poNumber: "",
    recipient: "",
    hsnCode: "",
    gstin: "",
    netTotal: 0,
    taxAmount: 0,
    grandTotal: 0,
    amountWords: "",
    items: [{ project: "", service: "", quantity: "", unitPrice: "" }]
  });

  const resetPOForm = () => {
  setPurchaseOrderData({
    date: new Date().toISOString().split('T')[0],
    poNumber: "",
    recipient: "",
    hsnCode: "",
    gstin: "",
    netTotal: 0,
    taxAmount: 0,
    grandTotal: 0,
    amountWords: "",
    items: [{ project: "", service: "", quantity: "", unitPrice: "" }]
  });
};

  const [recipients, setRecipients] = useState([""]);
  const [quotationRows, setQuotationRows] = useState([
    { catNo: "", description: "", qty: "", price: "" },
  ]);


  const [quotationData, setQuotationData] = useState({
  reference: '',
  date: new Date().toISOString().split('T')[0],
  gstin: ''
});

//   const resetQuotationForm = () => {
//   setQuotationRows([{ catNo: "", description: "", qty: "", price: "" }]);
//   setRecipients([""]);
//   // Reset any other quotation-related states here
// };
const resetQuotationForm = () => {
  setQuotationData({
    reference: '',
    date: new Date().toISOString().split('T')[0],
    gstin: ''
  });
  setQuotationRows([{ catNo: "", description: "", qty: "", price: "" }]);
  setRecipients([""]);
};

  const token = localStorage.getItem("token");
  const [pdfURL, setPdfURL] = useState("");
  const [showPDF, setShowPDF] = useState(false);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token);
      setPage(2);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  const handleDropdownChange = (e) => setSelectedOption(e.target.value);
  const handleDesignationChange = (e) => setDesignation(e.target.value);

  // const handleSubmit = () => {
  //   if (selectedOption) {
  //     setPage(
  //       selectedOption === "tax-invoice"
  //         ? 3
  //         : selectedOption === "quotation"
  //         ? 4
  //         : 5
  //     );
  //   } else {
  //     alert("Please select an option.");
  //   }
  // };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length >= 1 && value.length <= 4) {
      setPasswordStrength("Poor");
    } else if (value.length >= 5 && value.length <= 8) {
      setPasswordStrength("Fair");
    } else if (
      value.length > 8 &&
      /[A-Z]/.test(value) &&
      /[!@#$%^&*]/.test(value)
    ) {
      setPasswordStrength("Strong");
    } else {
      setPasswordStrength("Fair");
    }
  };

  useEffect(() => {
    calculateTotal();
  }, [invoiceRows]);

  const calculateTotal = () => {
    let netTotal = 0;
    
    if (Array.isArray(invoiceRows)) {
      invoiceRows.forEach(row => {
        const quantity = parseFloat(row.quantity) || 0;
        const price = parseFloat(row.price) || 0;
        
        if (!isNaN(quantity)) {
          netTotal += quantity * (isNaN(price) ? 0 : price);
        }
      });
    }

    const gst = netTotal * 0.18;
    const grandTotal = netTotal + gst;

    setInvoiceData(prev => ({
      ...prev,
      netTotal: netTotal.toFixed(2),
      gst: gst.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }));
  };

  const handleInvoiceRowChange = (index, event) => {
    const { name, value } = event.target;
    const updatedRows = invoiceRows.map((row, i) =>
      i === index ? { ...row, [name]: value } : row
    );
    setInvoiceRows(updatedRows);
  };

  const addRow = () => {
    setInvoiceRows([
      ...invoiceRows,
      { description: "", quantity: "", price: "" }
    ]);
  };

  const calculateTotals = (items) => {
    const validItems = items || [];
    let netTotal = validItems.reduce(
      (acc, item) => acc + ((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)),
      0
    );
    let taxAmount = (netTotal * 0.18).toFixed(2);
    let grandTotal = (parseFloat(netTotal) + parseFloat(taxAmount)).toFixed(2);

    setPurchaseOrderData(prev => ({
      ...prev,
      netTotal,
      taxAmount,
      grandTotal,
      amountWords: convertToWords(grandTotal),
    }));
  };

  const handlePurchaseOrderChange = (index, e) => {
    const { name, value } = e.target;
    const updatedItems = [...purchaseOrderData.items];
    updatedItems[index] = { ...updatedItems[index], [name]: value };
    
    setPurchaseOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
    
    calculateTotals(updatedItems);
  };

  const addPurchaseOrderRow = () => {
    setPurchaseOrderData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { project: "", service: "", quantity: "", unitPrice: "" },
      ],
    }));
  };

  const removePurchaseOrderRow = (index) => {
    const updatedItems = purchaseOrderData.items.filter((_, i) => i !== index);
    setPurchaseOrderData(prev => ({
      ...prev,
      items: updatedItems
    }));
    calculateTotals(updatedItems);
  };

  const convertToWords = (num) => {
    return num ? `${num} INR` : "";
  };

  const handleRecipientChange = (index, event) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index] = event.target.value;
    setRecipients(updatedRecipients);
  };

  const addRecipient = () => {
    setRecipients([...recipients, ""]);
  };

  const removeRecipient = (index) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const removeRow = (index) => {
    setInvoiceRows(invoiceRows.filter((_, i) => i !== index));
  };

  // const handleQuotationRowChange = (index, field, value) => {
  //   const updatedRows = [...quotationRows];
  //   updatedRows[index][field] = value;
  //   setQuotationRows(updatedRows);
  // };
  const handleQuotationRowChange = (index, field, value) => {
  const updatedRows = [...quotationRows];
  updatedRows[index][field] = value;
  setQuotationRows(updatedRows);
};

  const [pdfUrl, setPdfUrl] = useState("");

   const handleGeneratePDF = async () => {
  setIsGenerating(true);
  try {
    const items = invoiceRows
      .filter(row => row.description && row.quantity && row.price)
      .map(row => ({
        description: row.description,
        quantity: parseInt(row.quantity) || 0,
        unitPrice: parseFloat(row.price) || 0
      }));

    if (items.length === 0) {
      alert("Please add at least one valid item");
      return;
    }

    const requestData = {
      refNo: invoiceData.reference,
      date: invoiceData.date,
      toAddress: invoiceData.recipient,
      gstNumber: invoiceData.gstinRecipient,
      items: items
    };

    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:8080/api/invoice/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to generate invoice');
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Get filename from content disposition
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `invoice_${invoiceData.reference || new Date().getTime()}.docx`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Clear all form fields after successful generation
    resetForm();
    
    // Optional: Show success message
    alert('Invoice generated and downloaded successfully!');

  } catch (error) {
    console.error('Error generating invoice:', error);
    alert('Error generating invoice: ' + error.message);
  } finally {
    setIsGenerating(false);
  }
};


const handleGeneratePO = async () => {
  setIsGeneratingPO(true);
  try {
    const items = purchaseOrderData.items
      .filter(item => item.project && item.service && item.quantity && item.unitPrice)
      .map(item => ({
        project: item.project,
        service: item.service,
        quantity: parseInt(item.quantity) || 0,
        unitPrice: parseFloat(item.unitPrice) || 0
      }));

    if (items.length === 0) {
      alert("Please add at least one valid item");
      return;
    }

    const requestData = {
      poNumber: purchaseOrderData.poNumber,
      date: purchaseOrderData.date,
      toAddress: purchaseOrderData.recipient,
      gstNumber: purchaseOrderData.gstin,
      items: items
    };

    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:8080/api/purchase-order/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to generate purchase order');
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Get filename from content disposition
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `purchase_order_${purchaseOrderData.poNumber || new Date().getTime()}.docx`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

     resetPOForm();

    // Optional: Show success message
    alert('Purchase Order generated and downloaded successfully!');

  } catch (error) {
    console.error('Error generating purchase order:', error);
    alert('Error generating purchase order: ' + error.message);
  } finally {
    setIsGeneratingPO(false);
  }
};


const handleGenerateQuotation = async () => {
  setIsGeneratingQuotation(true);
  try {
    // Validate required fields
    if (!quotationData.reference) {
      alert("Please enter a Reference Number");
      return;
    }
    
    if (recipients.some(r => !r.trim())) {
      alert("Please enter all recipient details");
      return;
    }

    if (!quotationData.gstin) {
      alert("Please enter GSTIN");
      return;
    }

    const items = quotationRows
      .filter(row => row.catNo && row.description && row.qty && row.price)
      .map(row => ({
        catNo: row.catNo,
        description: row.description,
        quantity: parseInt(row.qty) || 0,
        unitPrice: parseFloat(row.price) || 0
      }));

    if (items.length === 0) {
      alert("Please add at least one valid item");
      return;
    }

    const requestData = {
      refNo: quotationData.reference,
      date: quotationData.date,
      toAddress: recipients.join("\n"), // Combine all recipients
      gstNumber: quotationData.gstin,
      items: items
    };

    const token = localStorage.getItem('token');

    const response = await fetch('http://localhost:8080/api/quotation/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to generate quotation');
    }

    // Handle file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Get filename from content disposition
    const contentDisposition = response.headers.get('content-disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1].replace(/"/g, '')
      : `quotation_${quotationData.reference || new Date().getTime()}.docx`;
    
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // Reset form after successful generation
    resetQuotationForm();
    
    // Show success message
    alert('Quotation generated and downloaded successfully!');

  } catch (error) {
    console.error('Error generating quotation:', error);
    alert('Error generating quotation: ' + error.message);
  } finally {
    setIsGeneratingQuotation(false);
  }
};


  const logout = () => {
    alert("Logging out...");
    setPage(2);
  };

  const addQuotationRow = () => {
    setQuotationRows([
      ...quotationRows,
      { catNo: "", description: "", qty: "", price: "" },
    ]);
  };

  const removeQuotationRow = (index) => {
    setQuotationRows(quotationRows.filter((_, i) => i !== index));
  };

  

  const handleLogout = () => {
    localStorage.removeItem("token");
    setPage(1);
  };

  return (
    <div className="app-container">
      {page === 1 && (
        <div className="auth-container">
          <div className="auth-card">
            <div className="company-logo-container">
              <img src={companyLogo} alt="Company Logo" className="company-logo" />
            </div>
            <div className="auth-header">
              <h2>Invoice Management System</h2>
              <p>Sign in to your account</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}

      {/* {page === 2 && (
        <div className="dashboard-container">
          <header className="dashboard-header">
            <div className="company-logo">
              <img src={companyLogo} alt="Company Logo" />
            </div>
            <h1 className="dashboard-title">Invoice Management System</h1>
            <button onClick={handleLogout} className="btn-logout">
              <span>Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
              </svg>
            </button>
          </header>
          <div className="dashboard-content">
            <div className="document-selector">
              <h2>Create New Document</h2>
              <div className="form-group">
                <label htmlFor="document-type">Select Document Type</label>
                <select
                  id="document-type"
                  value={selectedOption}
                  onChange={handleDropdownChange}
                  className="form-control"
                >
                  <option value="">Select an option</option>
                  <option value="tax-invoice">Tax Invoice</option>
                  <option value="quotation">Quotation</option>
                  <option value="purchase-order">Purchase Order</option>
                </select>
              </div>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={!selectedOption}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )} */}
       {/* {page === 2 && (
        <Dashboard setPage={setPage} handleLogout={handleLogout} />
      )} */}
      {page === 2 && (
        <Dashboard 
          setPage={setPage} 
          handleLogout={handleLogout}
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
      )}

      {page === 3 && selectedOption === "tax-invoice" && (
        <div className="document-container">
          <header className="document-header">
            <div className="company-logo">
              <img src={companyLogo} alt="Company Logo" />
            </div>
            <h2>Tax Invoice</h2>
            <div className="document-actions">
              
              <button 
      onClick={handleGeneratePDF} 
      className="btn btn-generate"
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Generating...
        </>
      ) : (
        'Generate Invoice'
      )}
    </button>
              <button onClick={() => setPage(2)} className="btn btn-back">
                Back
              </button>
            </div>
          </header>

          <div className="document-body">
            <div className="invoice-header-section">
              <div className="invoice-meta">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={invoiceData.date}
                    onChange={(e) =>
                      setInvoiceData({ ...invoiceData, date: e.target.value })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Reference No</label>
                  <input
                    type="text"
                    name="reference"
                    value={invoiceData.reference}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        reference: e.target.value,
                      })
                    }
                    className="form-control"
                    placeholder="Enter reference number"
                  />
                </div>
              </div>

              <div className="invoice-recipient">
                <label>Bill To</label>
                <textarea
                  name="recipient"
                  value={invoiceData.recipient}
                  onChange={(e) =>
                    setInvoiceData({ ...invoiceData, recipient: e.target.value })
                  }
                  placeholder="Enter recipient details"
                  className="form-control"
                  rows="3"
                />
                <div className="form-group">
                  <label>GSTIN</label>
                  <input
                    type="text"
                    name="gstinRecipient"
                    value={invoiceData.gstinRecipient}
                    onChange={(e) =>
                      setInvoiceData({
                        ...invoiceData,
                        gstinRecipient: e.target.value,
                      })
                    }
                    className="form-control"
                    placeholder="Enter GSTIN"
                  />
                </div>
              </div>
            </div>

            <div className="invoice-items">
              <div className="table-responsive">
                <table className="document-table">
                  <thead>
                    <tr>
                      <th width="50%">Description</th>
                      <th width="15%">Quantity</th>
                      <th width="20%">Price (₹)</th>
                      <th width="15%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceRows.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            name="description"
                            value={row.description}
                            onChange={(e) => handleInvoiceRowChange(index, e)}
                            placeholder="Enter description"
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="quantity"
                            value={row.quantity}
                            onChange={(e) => handleInvoiceRowChange(index, e)}
                            placeholder="Qty"
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="price"
                            value={row.price}
                            onChange={(e) => handleInvoiceRowChange(index, e)}
                            placeholder="Price"
                            className="form-control"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => removeRow(index)}
                            className="btn-remove"
                            title="Remove item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addRow} className="btn-add-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add New Item
              </button>
            </div>

            <div className="invoice-summary">
              <div className="summary-row">
                <label>Net Total:</label>
                <input
                  type="text"
                  name="netTotal"
                  value={`₹ ${invoiceData.netTotal}`}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="summary-row">
                <label>GST @ 18%:</label>
                <input
                  type="text"
                  name="gst"
                  value={`₹ ${invoiceData.gst}`}
                  readOnly
                  className="form-control"
                />
              </div>
              <div className="summary-row total">
                <label>Grand Total:</label>
                <input
                  type="text"
                  name="grandTotal"
                  value={`₹ ${invoiceData.grandTotal}`}
                  readOnly
                  className="form-control"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 4 && selectedOption === "quotation" && (
        <div className="document-container">
          <header className="document-header">
            <div className="company-logo">
              <img src={companyLogo} alt="Company Logo" />
            </div>
            <h2>Quotation</h2>
            <div className="document-actions">
              
              <button 
  onClick={handleGenerateQuotation} 
  className="btn btn-generate"
  disabled={isGeneratingQuotation}
>
  {isGeneratingQuotation ? (
    <>
      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      Generating...
    </>
  ) : (
    'Generate Quotation'
  )}
</button>
              <button onClick={() => setPage(2)} className="btn btn-back">
                Back
              </button>
            </div>
          </header>

          <div className="document-body">
            <div className="quotation-header-section">
             
              <div className="quotation-meta">
  <div className="form-group">
    <label>Date</label>
    <input 
      type="date" 
      value={quotationData.date}
      onChange={(e) => setQuotationData({...quotationData, date: e.target.value})}
      className="form-control" 
    />
  </div>
  <div className="form-group">
    <label>Reference No</label>
    <input
      type="text"
      value={quotationData.reference}
      onChange={(e) => setQuotationData({...quotationData, reference: e.target.value})}
      className="form-control"
      placeholder="Enter reference number"
    />
  </div>
</div>

              <div className="quotation-recipients">
                <label>Recipients</label>
                {recipients.map((recipient, index) => (
                  <div key={index} className="recipient-item">
                    <textarea
                      placeholder="Enter recipient details"
                      rows="3"
                      value={recipient}
                      onChange={(e) => handleRecipientChange(index, e)}
                      className="form-control"
                    />
                    <button
                      onClick={() => removeRecipient(index)}
                      className="btn-remove"
                      title="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                ))}
                <button onClick={addRecipient} className="btn-add-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                  </svg>
                  Add Recipient
                </button>
              </div>

          
              <div className="form-group">
  <label>GSTIN</label>
  <input
    type="text"
    value={quotationData.gstin}
    onChange={(e) => setQuotationData({...quotationData, gstin: e.target.value})}
    className="form-control"
    placeholder="Enter GSTIN"
  />
</div>
            </div>

            <div className="quotation-items">
              <div className="table-responsive">
                <table className="document-table">
                  <thead>
                    <tr>
                      <th width="15%">Cat No.</th>
                      <th width="45%">Description</th>
                      <th width="15%">Qty</th>
                      <th width="20%">Price (INR)</th>
                      <th width="5%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationRows.map((row, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="text"
                            value={row.catNo}
                            onChange={(e) =>
                              handleQuotationRowChange(
                                index,
                                "catNo",
                                e.target.value
                              )
                            }
                            placeholder="Enter Cat No."
                            className="form-control"
                          />
                        </td>
                        <td>
                          <textarea
                            rows="2"
                            value={row.description}
                            onChange={(e) =>
                              handleQuotationRowChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Enter Description"
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) =>
                              handleQuotationRowChange(
                                index,
                                "qty",
                                e.target.value
                              )
                            }
                            placeholder="Qty"
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.price}
                            onChange={(e) =>
                              handleQuotationRowChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            placeholder="Price (INR)"
                            className="form-control"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => removeQuotationRow(index)}
                            className="btn-remove"
                            title="Remove item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button onClick={addQuotationRow} className="btn-add-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add Item
              </button>
            </div>
          </div>

          {pdfUrl && (
            <Modal
              isOpen={!!pdfUrl}
              onRequestClose={() => setPdfUrl("")}
              className="pdf-modal"
              overlayClassName="pdf-modal-overlay"
            >
              <div className="modal-header">
                <h3>Generated Quotation</h3>
                <button
                  onClick={() => setPdfUrl("")}
                  className="btn-icon close-btn"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <iframe
                  src={pdfUrl}
                  width="100%"
                  height="500px"
                  title="Quotation PDF"
                ></iframe>
              </div>
            </Modal>
          )}
        </div>
      )}

      {page === 5 && selectedOption === "purchase-order" && (
        <div className="document-container">
          <header className="document-header">
            <div className="company-logo">
              <img src={companyLogo} alt="Company Logo" />
            </div>
            <h2>Purchase Order</h2>
            <div className="document-actions">
              
              <button 
      onClick={handleGeneratePO} 
      className="btn btn-generate"
      disabled={isGeneratingPO}
    >
      {isGeneratingPO ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Generating...
        </>
      ) : (
        'Generate PO'
      )}
    </button>
              <button onClick={() => setPage(2)} className="btn btn-secondary">
                Back
              </button>
            </div>
          </header>

          <div className="document-body">
            <div className="po-header-section">
              <div className="po-meta">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={purchaseOrderData.date}
                    onChange={(e) =>
                      setPurchaseOrderData({
                        ...purchaseOrderData,
                        date: e.target.value,
                      })
                    }
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>PO Number</label>
                  <input
                    type="text"
                    value={purchaseOrderData.poNumber}
                    onChange={(e) =>
                      setPurchaseOrderData({
                        ...purchaseOrderData,
                        poNumber: e.target.value,
                      })
                    }
                    className="form-control"
                    placeholder="Enter PO number"
                  />
                </div>
              </div>

              <div className="po-recipient">
                <label>Vendor Details</label>
                <textarea
                  value={purchaseOrderData.recipient}
                  onChange={(e) =>
                    setPurchaseOrderData({
                      ...purchaseOrderData,
                      recipient: e.target.value,
                    })
                  }
                  placeholder="Enter vendor details"
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>GSTIN</label>
                <input
                  type="text"
                  value={purchaseOrderData.gstin}
                  onChange={(e) =>
                    setPurchaseOrderData({
                      ...purchaseOrderData,
                      gstin: e.target.value,
                    })
                  }
                  className="form-control"
                  placeholder="Enter GSTIN"
                />
              </div>
            </div>

            <div className="po-items">
              <div className="table-responsive">
                <table className="document-table">
                  <thead>
                    <tr>
                      <th width="5%">#</th>
                      <th width="25%">Project</th>
                      <th width="25%">Service</th>
                      <th width="10%">Qty</th>
                      <th width="15%">Unit Price</th>
                      <th width="15%">Cost</th>
                      <th width="5%">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrderData.items.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            name="project"
                            value={item.project}
                            onChange={(e) => handlePurchaseOrderChange(index, e)}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="service"
                            value={item.service}
                            onChange={(e) => handlePurchaseOrderChange(index, e)}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="quantity"
                            value={item.quantity}
                            onChange={(e) => handlePurchaseOrderChange(index, e)}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="unitPrice"
                            value={item.unitPrice}
                            onChange={(e) => handlePurchaseOrderChange(index, e)}
                            className="form-control"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={(item.quantity * item.unitPrice).toFixed(2)}
                            readOnly
                            className="form-control"
                          />
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => removePurchaseOrderRow(index)}
                            className="btn-remove"
                            title="Remove item"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                              <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           
              <button onClick={addPurchaseOrderRow} className="btn-add-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
                Add Item
              </button>
            </div>

            <div className="po-summary">
              <div className="summary-row">
                <label>Net Total:</label>
                <span>{purchaseOrderData.netTotal.toFixed(2)} INR</span>
              </div>
              <div className="summary-row">
                <label>Taxes (18%):</label>
                <span>{purchaseOrderData.taxAmount} INR</span>
              </div>
              <div className="summary-row total">
                <label>Grand Total:</label>
                <span>{purchaseOrderData.grandTotal} INR</span>
              </div>
            </div>
          </div>

          <Modal
            isOpen={showPDF}
            onRequestClose={() => setShowPDF(false)}
            className="pdf-modal"
            overlayClassName="pdf-modal-overlay"
          >
            <div className="modal-header">
              <h3>Purchase Order</h3>
              <button
                onClick={() => setShowPDF(false)}
                className="btn-icon close-btn"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <iframe
                src={pdfURL}
                width="100%"
                height="500px"
                title="Purchase Order PDF"
              ></iframe>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowPDF(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </Modal>
        </div>
      )}
    </div>
  );
};

export default InvoiceApp;