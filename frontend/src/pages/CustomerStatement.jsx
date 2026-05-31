import { useMemo, useState } from "react";
import { isInvoiceOverdue } from "../utils/invoiceUtils";

function CustomerStatement({ invoices, customers }) {
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState("");

  const customerOptions = useMemo(() => {
    const customerMap = {};

    customers.forEach((customer) => {
      customerMap[customer.customerPhone] = {
        name: customer.customerName,
        phone: customer.customerPhone,
        gst: customer.customerGstNumber || "",
        address: customer.customerAddress || ""
      };
    });

    invoices.forEach((invoice) => {
      if (!customerMap[invoice.customerPhone]) {
        customerMap[invoice.customerPhone] = {
          name: invoice.customerName,
          phone: invoice.customerPhone,
          gst: invoice.customerGstNumber || "",
          address: invoice.customerAddress || ""
        };
      }
    });

    return Object.values(customerMap).filter((customer) => customer.phone);
  }, [customers, invoices]);

  const selectedCustomer = customerOptions.find(
    (customer) => customer.phone === selectedCustomerPhone
  );

  const customerInvoices = invoices.filter(
    (invoice) => invoice.customerPhone === selectedCustomerPhone
  );

  const totalBilled = customerInvoices.reduce(
    (sum, invoice) => sum + (invoice.grandTotal || 0),
    0
  );

  const totalPaid = customerInvoices.reduce(
    (sum, invoice) => sum + (invoice.paidAmount || 0),
    0
  );

  const totalPending = customerInvoices.reduce(
    (sum, invoice) => sum + (invoice.balanceAmount || 0),
    0
  );

  const overdueInvoices = customerInvoices.filter((invoice) =>
    isInvoiceOverdue(invoice)
  );

  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + (invoice.balanceAmount || 0),
    0
  );

  const paidInvoices = customerInvoices.filter(
    (invoice) => invoice.paymentStatus === "PAID"
  ).length;

  const partialInvoices = customerInvoices.filter(
    (invoice) => invoice.paymentStatus === "PARTIAL"
  ).length;

  const unpaidInvoices = customerInvoices.filter(
    (invoice) => invoice.paymentStatus === "UNPAID"
  ).length;

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const exportCustomerStatementCSV = () => {
    if (!selectedCustomer || customerInvoices.length === 0) {
      alert("No customer statement available to export");
      return;
    }

    const headers = [
      "Invoice Number",
      "Invoice Date",
      "Due Date",
      "Grand Total",
      "Paid Amount",
      "Balance Amount",
      "Payment Status",
      "Overdue",
      "Payment Method"
    ];

    const rows = customerInvoices.map((invoice) => [
      invoice.invoiceNumber || "",
      invoice.invoiceDate || "",
      invoice.dueDate || "",
      invoice.grandTotal || 0,
      invoice.paidAmount || 0,
      invoice.balanceAmount || 0,
      invoice.paymentStatus || "",
      isInvoiceOverdue(invoice) ? "YES" : "NO",
      invoice.paymentMethod || ""
    ]);

    const summaryRows = [
      [],
      ["Customer Statement Summary"],
      ["Customer Name", selectedCustomer.name],
      ["Phone", selectedCustomer.phone],
      ["GST", selectedCustomer.gst],
      ["Total Invoices", customerInvoices.length],
      ["Total Billed", totalBilled],
      ["Total Paid", totalPaid],
      ["Total Pending", totalPending],
      ["Overdue Amount", overdueAmount],
      []
    ];

    const csvContent = [
      ...summaryRows.map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      ),
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `${selectedCustomer.name}-statement.csv`.replaceAll(" ", "-")
    );

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="customer-statement-page">
      <div className="report-header-card">
        <div>
          <h2>Customer Statement</h2>
          <p>View customer-wise invoice history, paid amount, and pending balance.</p>
        </div>

        <button onClick={exportCustomerStatementCSV}>
          Export Statement
        </button>
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>Select Customer</h3>
          <p>Choose a customer to view their complete billing statement.</p>
        </div>

        <div className="statement-filter-grid">
          <div className="form-group">
            <label>Customer</label>
            <select
              value={selectedCustomerPhone}
              onChange={(e) => setSelectedCustomerPhone(e.target.value)}
            >
              <option value="">-- Select Customer --</option>

              {customerOptions.map((customer) => (
                <option key={customer.phone} value={customer.phone}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!selectedCustomer ? (
        <div className="empty-state-card">
          <h3>No customer selected</h3>
          <p>Select a customer to generate their statement.</p>
        </div>
      ) : (
        <>
          <div className="company-profile-card">
            <div className="company-profile-header">
              <div className="company-logo-preview">
                <span>{selectedCustomer.name?.charAt(0)?.toUpperCase()}</span>
              </div>

              <div>
                <h2>{selectedCustomer.name}</h2>
                <p>{selectedCustomer.address || "No address available"}</p>
              </div>

              <span className="status-badge partial">
                {customerInvoices.length} Invoice(s)
              </span>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span>Phone</span>
                <strong>{selectedCustomer.phone || "-"}</strong>
              </div>

              <div className="profile-info-item">
                <span>GST Number</span>
                <strong>{selectedCustomer.gst || "-"}</strong>
              </div>

              <div className="profile-info-item">
                <span>Total Billed</span>
                <strong>{formatCurrency(totalBilled)}</strong>
              </div>

              <div className="profile-info-item">
                <span>Total Pending</span>
                <strong>{formatCurrency(totalPending)}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="metric-card blue">
              <span>Total Invoices</span>
              <h2>{customerInvoices.length}</h2>
              <p>Invoices generated for this customer</p>
            </div>

            <div className="metric-card green">
              <span>Total Paid</span>
              <h2>{formatCurrency(totalPaid)}</h2>
              <p>Amount received</p>
            </div>

            <div className="metric-card red">
              <span>Total Pending</span>
              <h2>{formatCurrency(totalPending)}</h2>
              <p>Amount yet to be received</p>
            </div>

            <div className="metric-card red">
              <span>Overdue Amount</span>
              <h2>{formatCurrency(overdueAmount)}</h2>
              <p>{overdueInvoices.length} overdue invoice(s)</p>
            </div>

            <div className="metric-card purple">
              <span>Status Split</span>
              <h2>{paidInvoices}/{partialInvoices}/{unpaidInvoices}</h2>
              <p>Paid / Partial / Unpaid</p>
            </div>
          </div>

          <div className="card">
            <div className="section-heading">
              <h3>Invoice History</h3>
              <p>All invoices created for this customer.</p>
            </div>

            {customerInvoices.length === 0 ? (
              <p>No invoices found for this customer.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Invoice No</th>
                    <th>Date</th>
                    <th>Due Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Method</th>
                  </tr>
                </thead>

                <tbody>
                  {customerInvoices.map((invoice) => {
                    const overdue = isInvoiceOverdue(invoice);

                    return (
                      <tr
                        key={invoice.id}
                        className={overdue ? "overdue-row" : ""}
                      >
                        <td>{invoice.invoiceNumber}</td>
                        <td>{invoice.invoiceDate}</td>
                        <td>{invoice.dueDate || "-"}</td>
                        <td>{formatCurrency(invoice.grandTotal)}</td>
                        <td>{formatCurrency(invoice.paidAmount)}</td>
                        <td>{formatCurrency(invoice.balanceAmount)}</td>
                        <td>
                          <span
                            className={`status-badge ${
                              overdue
                                ? "overdue"
                                : invoice.paymentStatus?.toLowerCase()
                            }`}
                          >
                            {overdue ? "OVERDUE" : invoice.paymentStatus}
                          </span>
                        </td>
                        <td>{invoice.paymentMethod || "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerStatement;