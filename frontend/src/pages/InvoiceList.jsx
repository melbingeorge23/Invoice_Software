import {
  deleteInvoice,
  downloadInvoicePdf,
  viewInvoicePdf
} from "../api/invoiceApi";
import { useState } from "react";
import PaymentModal from "../components/PaymentModal";
import { isInvoiceOverdue } from "../utils/invoiceUtils";
import toast from "react-hot-toast";

function InvoiceList({ invoices, onInvoiceDeleted, onEditInvoice, currentUser }) {
  const isAdmin = currentUser?.role === "ADMIN";

  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this invoice?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteInvoice(id);
      toast.success("Invoice deleted successfully");
      onInvoiceDeleted();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <div className="card">
      <div className="section-heading">
        <h3>Invoice List</h3>
        <p>View, download, and manage generated invoices.</p>
      </div>

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Due Date</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((invoice) => {
              const overdue = isInvoiceOverdue(invoice);

              return (
                <tr
                  key={invoice.id}
                  className={overdue ? "overdue-row" : ""}
                >
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.customerName}</td>
                  <td>{invoice.customerPhone}</td>

                  <td>
                    {invoice.items && invoice.items.length > 0 ? (
                      <ul>
                        {invoice.items.map((item) => (
                          <li key={item.id}>
                            {item.productName} - {item.quantity} × ₹{item.price}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No items"
                    )}
                  </td>

                  <td>₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN")}</td>

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

                  <td>₹{Number(invoice.paidAmount || 0).toLocaleString("en-IN")}</td>
                  <td>₹{Number(invoice.balanceAmount || 0).toLocaleString("en-IN")}</td>
                  <td>{invoice.dueDate || "-"}</td>
                  <td>{invoice.invoiceDate}</td>

                  <td>
                    <div className="table-actions">
  {isAdmin && (
    <button
      className="action-btn edit-action"
      onClick={() => onEditInvoice(invoice)}
    >
      Edit
    </button>
  )}

{invoice.balanceAmount > 0 && (
  <button
    className="action-btn payment-action"
    onClick={() => setSelectedInvoiceForPayment(invoice)}
  >
    Pay
  </button>
)}

  <button
    className="action-btn view-action"
    onClick={() => viewInvoicePdf(invoice.id)}
  >
    View
  </button>

  <button
    className="action-btn pdf-action"
    onClick={() => downloadInvoicePdf(invoice.id)}
  >
    Download
  </button>

  {isAdmin && (
    <button
      className="action-btn delete-action"
      onClick={() => handleDelete(invoice.id)}
    >
      Delete
    </button>
  )}
</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {selectedInvoiceForPayment && (
  <PaymentModal
    invoice={selectedInvoiceForPayment}
    onClose={() => setSelectedInvoiceForPayment(null)}
    onPaymentAdded={() => {
      onInvoiceDeleted();
      setSelectedInvoiceForPayment(null);
    }}
  />
)}
    </div>
  );
}

export default InvoiceList;