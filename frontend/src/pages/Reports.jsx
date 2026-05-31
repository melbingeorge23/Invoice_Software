import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import toast from "react-hot-toast";

import { isInvoiceOverdue } from "../utils/invoiceUtils";

function Reports({ invoices }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("ALL");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const invoiceDate = invoice.invoiceDate;

      const matchesFromDate = fromDate ? invoiceDate >= fromDate : true;
      const matchesToDate = toDate ? invoiceDate <= toDate : true;

      const matchesStatus =
        paymentStatus === "ALL"
          ? true
          : paymentStatus === "OVERDUE"
          ? isInvoiceOverdue(invoice)
          : invoice.paymentStatus === paymentStatus;

      return matchesFromDate && matchesToDate && matchesStatus;
    });
  }, [invoices, fromDate, toDate, paymentStatus]);

  const totalRevenue = filteredInvoices.reduce(
    (sum, invoice) => sum + (invoice.grandTotal || 0),
    0
  );

  const paidRevenue = filteredInvoices.reduce(
    (sum, invoice) => sum + (invoice.paidAmount || 0),
    0
  );

  const pendingAmount = filteredInvoices.reduce(
    (sum, invoice) => sum + (invoice.balanceAmount || 0),
    0
  );

  const paidInvoices = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "PAID"
  ).length;

  const partialInvoices = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "PARTIAL"
  ).length;

  const unpaidInvoices = filteredInvoices.filter(
    (invoice) => invoice.paymentStatus === "UNPAID"
  ).length;

  const overdueInvoices = filteredInvoices.filter((invoice) =>
    isInvoiceOverdue(invoice)
  ).length;

  const overdueAmount = filteredInvoices.reduce(
    (sum, invoice) =>
      isInvoiceOverdue(invoice) ? sum + (invoice.balanceAmount || 0) : sum,
    0
  );

  const dateWiseMap = {};

  filteredInvoices.forEach((invoice) => {
    const date = invoice.invoiceDate || "Unknown";

    if (!dateWiseMap[date]) {
      dateWiseMap[date] = {
        date,
        totalInvoices: 0,
        revenue: 0,
        paid: 0,
        pending: 0
      };
    }

    dateWiseMap[date].totalInvoices += 1;
    dateWiseMap[date].revenue += invoice.grandTotal || 0;
    dateWiseMap[date].paid += invoice.paidAmount || 0;
    dateWiseMap[date].pending += invoice.balanceAmount || 0;
  });

  const dateWiseReports = Object.values(dateWiseMap).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const monthlyMap = {};

  filteredInvoices.forEach((invoice) => {
    if (!invoice.invoiceDate) {
      return;
    }

    const month = invoice.invoiceDate.slice(0, 7);

    if (!monthlyMap[month]) {
      monthlyMap[month] = {
        month,
        revenue: 0,
        paid: 0,
        pending: 0
      };
    }

    monthlyMap[month].revenue += invoice.grandTotal || 0;
    monthlyMap[month].paid += invoice.paidAmount || 0;
    monthlyMap[month].pending += invoice.balanceAmount || 0;
  });

  const monthlyRevenueData = Object.values(monthlyMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const clearFilters = () => {
    setFromDate("");
    setToDate("");
    setPaymentStatus("ALL");
  };

  const exportInvoicesAsCSV = () => {
    if (filteredInvoices.length === 0) {
      toast.error("No invoices available to export");
      return;
    }

    const headers = [
      "Invoice Number",
      "Customer Name",
      "Customer Phone",
      "Invoice Date",
      "Due Date",
      "Grand Total",
      "Paid Amount",
      "Balance Amount",
      "Payment Status",
      "Overdue",
      "Payment Method"
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.invoiceNumber || "",
      invoice.customerName || "",
      invoice.customerPhone || "",
      invoice.invoiceDate || "",
      invoice.dueDate || "",
      invoice.grandTotal || 0,
      invoice.paidAmount || 0,
      invoice.balanceAmount || 0,
      invoice.paymentStatus || "",
      isInvoiceOverdue(invoice) ? "YES" : "NO",
      invoice.paymentMethod || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "filtered-invoice-report.csv");

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="report-header-card">
        <div>
          <h2>Reports & Analytics</h2>
          <p>Track revenue, payments, pending balances, and overdue invoices.</p>
        </div>

        <button onClick={exportInvoicesAsCSV}>
          Export CSV
        </button>
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>Report Filters</h3>
          <p>Filter reports by date range and payment status.</p>
        </div>

        <div className="report-filter-grid">
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

          <div className="form-group">
            <label>Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="UNPAID">Unpaid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>

          <button type="button" className="cancel-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <p className="search-result-text">
          Showing {filteredInvoices.length} invoice(s)
        </p>
      </div>

      <div className="dashboard-grid">
        <div className="metric-card blue">
          <span>Total Revenue</span>
          <h2>{formatCurrency(totalRevenue)}</h2>
          <p>Filtered invoice value</p>
        </div>

        <div className="metric-card green">
          <span>Paid Revenue</span>
          <h2>{formatCurrency(paidRevenue)}</h2>
          <p>Amount received</p>
        </div>

        <div className="metric-card red">
          <span>Pending Amount</span>
          <h2>{formatCurrency(pendingAmount)}</h2>
          <p>Amount yet to be received</p>
        </div>

        <div className="metric-card purple">
          <span>Total Invoices</span>
          <h2>{filteredInvoices.length}</h2>
          <p>Filtered invoices</p>
        </div>

        <div className="metric-card red">
          <span>Overdue Amount</span>
          <h2>{formatCurrency(overdueAmount)}</h2>
          <p>{overdueInvoices} overdue invoice(s)</p>
        </div>
      </div>

      <div className="status-report-grid">
        <div className="status-report-card paid-card">
          <span>Paid</span>
          <h3>{paidInvoices}</h3>
        </div>

        <div className="status-report-card partial-card">
          <span>Partial</span>
          <h3>{partialInvoices}</h3>
        </div>

        <div className="status-report-card unpaid-card">
          <span>Unpaid</span>
          <h3>{unpaidInvoices}</h3>
        </div>

        <div className="status-report-card overdue-card">
          <span>Overdue</span>
          <h3>{overdueInvoices}</h3>
          <p>{formatCurrency(overdueAmount)}</p>
        </div>
      </div>

      <div className="chart-card">
        <div className="section-heading">
          <h3>Monthly Revenue Chart</h3>
          <p>Month-wise revenue, paid amount, and pending amount.</p>
        </div>

        <div className="chart-box">
          {monthlyRevenueData.length === 0 ? (
            <div className="empty-chart">
              No monthly report data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={monthlyRevenueData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                barCategoryGap="40%"
                barGap={6}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name === "revenue"
                      ? "Revenue"
                      : name === "paid"
                      ? "Paid"
                      : "Pending"
                  ]}
                />

                <Bar
                  dataKey="revenue"
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                  barSize={22}
                />

                <Bar
                  dataKey="paid"
                  fill="#059669"
                  radius={[8, 8, 0, 0]}
                  barSize={22}
                />

                <Bar
                  dataKey="pending"
                  fill="#ef4444"
                  radius={[8, 8, 0, 0]}
                  barSize={22}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>Date-wise Revenue Report</h3>
          <p>Daily invoice revenue, paid amount, and pending amount.</p>
        </div>

        {dateWiseReports.length === 0 ? (
          <p>No report data available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Invoices</th>
                <th>Revenue</th>
                <th>Paid</th>
                <th>Pending</th>
              </tr>
            </thead>

            <tbody>
              {dateWiseReports.map((report) => (
                <tr key={report.date}>
                  <td>{report.date}</td>
                  <td>{report.totalInvoices}</td>
                  <td>{formatCurrency(report.revenue)}</td>
                  <td>{formatCurrency(report.paid)}</td>
                  <td>{formatCurrency(report.pending)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>Payment Status Report</h3>
          <p>Invoices grouped by payment status.</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Invoice Count</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>
                <span className="status-badge paid">PAID</span>
              </td>
              <td>{paidInvoices}</td>
            </tr>

            <tr>
              <td>
                <span className="status-badge partial">PARTIAL</span>
              </td>
              <td>{partialInvoices}</td>
            </tr>

            <tr>
              <td>
                <span className="status-badge unpaid">UNPAID</span>
              </td>
              <td>{unpaidInvoices}</td>
            </tr>

            <tr>
              <td>
                <span className="status-badge overdue">OVERDUE</span>
              </td>
              <td>{overdueInvoices}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Reports;