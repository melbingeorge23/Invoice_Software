import { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceList from "./pages/InvoiceList";
import CustomerMaster from "./pages/CustomerMaster";
import ProductMaster from "./pages/ProductMaster";
import AppLayout from "./components/AppLayout";
import CompanyProfile from "./pages/CompanyProfile";
import Reports from "./pages/Reports";
import CustomerStatement from "./pages/CustomerStatement";
import UserManagement from "./pages/UserManagement";

import { getAllInvoices } from "./api/invoiceApi";
import { getDashboardSummary } from "./api/dashboardApi";
import { getAllCustomers } from "./api/customerApi";
import { getAllProducts } from "./api/productApi";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [activePage, setActivePage] = useState("dashboard");

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [invoiceToEdit, setInvoiceToEdit] = useState(null);

  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    totalTax: 0
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const isAdmin = currentUser?.role === "ADMIN";

  const fetchInvoices = async () => {
    try {
      const data = await getAllInvoices();
      setInvoices(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const data = await getAllCustomers();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const refreshData = () => {
    fetchInvoices();
    fetchDashboardSummary();
    fetchCustomers();
    fetchProducts();
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setActivePage("dashboard");
  };

  const handleEditInvoice = (invoice) => {
    setInvoiceToEdit(invoice);
    setActivePage("create-invoice");
  };

  const handleFormSuccess = () => {
    refreshData();
    setInvoiceToEdit(null);
    setActivePage("invoices");
  };

  const handleCancelEdit = () => {
    setInvoiceToEdit(null);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(search) ||
      invoice.customerName?.toLowerCase().includes(search) ||
      invoice.customerPhone?.toLowerCase().includes(search) ||
      invoice.customerGstNumber?.toLowerCase().includes(search);

    const invoiceDate = invoice.invoiceDate;

    const matchesFromDate = fromDate ? invoiceDate >= fromDate : true;
    const matchesToDate = toDate ? invoiceDate <= toDate : true;

    return matchesSearch && matchesFromDate && matchesToDate;
  });

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <AppLayout
      currentUser={currentUser}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={handleLogout}
    >

    {activePage === "company-profile" && isAdmin && (
      <CompanyProfile />
     )}

     {activePage === "user-management" && isAdmin && (
      <UserManagement currentUser={currentUser} />
     )}

      {activePage === "dashboard" && (
        <Dashboard summary={summary} invoices={invoices} />
      )}

      {activePage === "reports" && (
        <Reports invoices={invoices} />
      )}

      {activePage === "customer-statement" && (
        <CustomerStatement invoices={invoices} customers={customers} />
      )}

      {activePage === "create-invoice" && (
        <CreateInvoice
          onInvoiceCreated={handleFormSuccess}
          invoiceToEdit={invoiceToEdit}
          onCancelEdit={handleCancelEdit}
          customers={customers}
          products={products}
        />
      )}

      {activePage === "invoices" && (
        <>
          <div className="card">
            <div className="section-heading">
              <h3>Search & Filter Invoices</h3>
              <p>Find invoices by number, customer, phone, GST, or date.</p>
            </div>

            <input
              type="text"
              className="search-input"
              placeholder="Search by invoice number, customer name, phone, or GST number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="filter-grid">
              <div className="form-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>

              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setSearchTerm("");
                  setFromDate("");
                  setToDate("");
                }}
              >
                Clear Filters
              </button>
            </div>

            {(searchTerm || fromDate || toDate) && (
              <p className="search-result-text">
                Showing {filteredInvoices.length} result(s)
              </p>
            )}
          </div>

          <InvoiceList
            invoices={filteredInvoices}
            onInvoiceDeleted={refreshData}
            onEditInvoice={handleEditInvoice}
            currentUser={currentUser}
          />
        </>
      )}

      {activePage === "customers" && isAdmin && (
        <CustomerMaster
          customers={customers}
          onCustomerChange={fetchCustomers}
        />
      )}

      {activePage === "products" && isAdmin && (
        <ProductMaster
          products={products}
          onProductChange={fetchProducts}
        />
      )}
    </AppLayout>
  );
}

export default App;