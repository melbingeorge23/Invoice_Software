import React, { useState, useEffect } from "react";
import axios from "axios";
import companyLogo from "./assets/Molsys1.png";
import documentImage from "./assets/dashboard.jpg";
import './dashboard.css';

const Dashboard = ({ setPage, handleLogout, selectedOption, setSelectedOption }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    invoices: 0,
    quotations: 0,
    purchaseOrders: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8080/api/documents", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setDocuments(response.data.documents);
        setStats(response.data.stats);
      } catch (err) {
        setError("Failed to fetch documents");
        console.error("Error fetching documents:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8080/api/documents/search?ref=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDocuments(response.data);
    } catch (err) {
      setError("Search failed");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = async () => {
    setSearchTerm("");
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8080/api/documents", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setDocuments(response.data.documents);
    } catch (err) {
      setError("Failed to reset search");
      console.error("Reset error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDropdownChange = (e) => setSelectedOption(e.target.value);

    const handleSubmit = () => {
  if (selectedOption) {
    setSelectedOption(selectedOption); // Update parent component's state
    setPage(
      selectedOption === "tax-invoice"
        ? 3
        : selectedOption === "quotation"
        ? 4
        : 5
    );
  } else {
    alert("Please select an option.");
  }
};

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
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
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Invoices</h3>
            <p>{stats.invoices}</p>
            <small>Total Generated</small>
          </div>
          <div className="stat-card">
            <h3>Quotations</h3>
            <p>{stats.quotations}</p>
            <small>Total Generated</small>
          </div>
          <div className="stat-card">
            <h3>Purchase Orders</h3>
            <p>{stats.purchaseOrders}</p>
            <small>Total Generated</small>
          </div>
        </div>

        <div className="document-creation-container">
          <div className="document-creator">
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
          <div className="document-image">
            <img src={documentImage} alt="Document creation illustration" />
          </div>
        </div>

        <div className="dashboard-search">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by reference number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch} className="btn-search">
              Search
            </button>
            {searchTerm && (
              <button onClick={handleResetSearch} className="btn-reset">
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="document-list">
          <h2>Recent Documents</h2>
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : documents.length === 0 ? (
            <div className="no-documents">No documents found</div>
          ) : (
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference No</th>
                  <th>Date</th>
                  <th>Recipient</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.type}</td>
                    <td>{doc.reference}</td>
                    <td>{formatDate(doc.date)}</td>
                    <td>{doc.recipient.substring(0, 30)}...</td>
                    <td>₹{doc.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;