import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { isInvoiceOverdue } from "../utils/invoiceUtils";

function Dashboard({ summary, invoices }) {
  const revenueByDateMap = {};

  invoices.forEach((invoice) => {
    const date = invoice.invoiceDate || "Unknown";

    if (!revenueByDateMap[date]) {
      revenueByDateMap[date] = {
        date,
        revenue: 0,
        tax: 0
      };
    }

    revenueByDateMap[date].revenue += invoice.grandTotal || 0;
    revenueByDateMap[date].tax += invoice.taxAmount || 0;
  });

  const revenueChartData = Object.values(revenueByDateMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const customerMap = {};

  invoices.forEach((invoice) => {
    const customer = invoice.customerName || "Unknown";

    if (!customerMap[customer]) {
      customerMap[customer] = {
        customer,
        total: 0
      };
    }

    customerMap[customer].total += invoice.grandTotal || 0;
  });

  const topCustomerData = Object.values(customerMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const latestInvoices = [...invoices]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const unpaidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "UNPAID"
  ).length;

  const partialInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "PARTIAL"
  ).length;

  const totalPendingAmount = invoices.reduce(
    (sum, invoice) => sum + (invoice.balanceAmount || 0),
    0
  );

  const overdueInvoices = invoices.filter((invoice) =>
    isInvoiceOverdue(invoice)
  );

  const overdueAmount = overdueInvoices.reduce(
    (sum, invoice) => sum + (invoice.balanceAmount || 0),
    0
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid">
        <div className="metric-card blue">
          <span>Total Invoices</span>
          <h2>{summary.totalInvoices}</h2>
          <p>Invoices created so far</p>
        </div>

        <div className="metric-card green">
          <span>Total Revenue</span>
          <h2>₹{Number(summary.totalRevenue || 0).toLocaleString("en-IN")}</h2>
          <p>Grand total collected</p>
        </div>

        <div className="metric-card purple">
          <span>Total Tax</span>
          <h2>₹{Number(summary.totalTax || 0).toLocaleString("en-IN")}</h2>
          <p>Tax amount generated</p>
        </div>

        <div className="metric-card red">
          <span>Pending Amount</span>
          <h2>₹{Number(totalPendingAmount || 0).toLocaleString("en-IN")}</h2>
          <p>{unpaidInvoices + partialInvoices} invoice(s) pending</p>
        </div>

        <div className="metric-card red">
          <span>Overdue Amount</span>
          <h2>₹{Number(overdueAmount || 0).toLocaleString("en-IN")}</h2>
          <p>{overdueInvoices.length} overdue invoice(s)</p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="section-heading">
            <h3>Revenue Trend</h3>
            <p>Daily invoice revenue overview</p>
          </div>

          <div className="chart-box">
            {revenueChartData.length === 0 ? (
              <div className="empty-chart">
                No revenue data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    fill="url(#revenueGradient)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="section-heading">
            <h3>Top Customers</h3>
            <p>Customers by total billing value</p>
          </div>

          <div className="chart-box">
            {topCustomerData.length === 0 ? (
              <div className="empty-chart">
                No customer billing data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topCustomerData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  barCategoryGap="40%"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="customer" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#7c3aed" radius={[10, 10, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>Latest Invoices</h3>
          <p>Recently created billing records</p>
        </div>

        {latestInvoices.length === 0 ? (
          <p>No invoices found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {latestInvoices.map((invoice) => {
                const overdue = isInvoiceOverdue(invoice);

                return (
                  <tr key={invoice.id} className={overdue ? "overdue-row" : ""}>
                    <td>{invoice.invoiceNumber}</td>
                    <td>{invoice.customerName}</td>
                    <td>{invoice.invoiceDate}</td>
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
                    <td>₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;