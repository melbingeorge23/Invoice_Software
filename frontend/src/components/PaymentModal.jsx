import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { addPayment, getPaymentsByInvoice } from "../api/paymentApi";

function PaymentModal({ invoice, onClose, onPaymentAdded }) {
  const [formData, setFormData] = useState({
    amount: "",
    paymentMethod: "CASH",
    paymentDate: new Date().toISOString().split("T")[0],
    note: ""
  });

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const balanceAmount = invoice?.balanceAmount || 0;

  useEffect(() => {
    fetchPayments();
  }, [invoice]);

  const fetchPayments = async () => {
    if (!invoice?.id) {
      return;
    }

    try {
      const data = await getPaymentsByInvoice(invoice.id);
      setPayments(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = Number(formData.amount);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount");
      return;
    }

    if (amount > balanceAmount) {
      toast.error("Payment amount cannot exceed balance amount");
      return;
    }

    try {
      setLoading(true);

      await addPayment(invoice.id, {
        amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        note: formData.note
      });

      toast.success("Payment added successfully");

      setFormData({
        amount: "",
        paymentMethod: "CASH",
        paymentDate: new Date().toISOString().split("T")[0],
        note: ""
      });

      await fetchPayments();
      onPaymentAdded();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  if (!invoice) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <div className="modal-header">
          <div>
            <h2>Mark Payment</h2>
            <p>
              {invoice.invoiceNumber} - {invoice.customerName}
            </p>
          </div>

          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="payment-summary-grid">
          <div className="profile-info-item">
            <span>Grand Total</span>
            <strong>₹{Number(invoice.grandTotal || 0).toLocaleString("en-IN")}</strong>
          </div>

          <div className="profile-info-item">
            <span>Paid</span>
            <strong>₹{Number(invoice.paidAmount || 0).toLocaleString("en-IN")}</strong>
          </div>

          <div className="profile-info-item">
            <span>Balance</span>
            <strong>₹{Number(invoice.balanceAmount || 0).toLocaleString("en-IN")}</strong>
          </div>

          <div className="profile-info-item">
            <span>Status</span>
            <strong>{invoice.paymentStatus}</strong>
          </div>
        </div>

        {balanceAmount > 0 ? (
          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-group">
              <label>Payment Amount *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Enter payment amount"
              />
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Payment Date</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Note</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="Optional note"
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? <span className="loading-text">Saving</span> : "Add Payment"}
            </button>
          </form>
        ) : (
          <div className="paid-message">
            This invoice is fully paid.
          </div>
        )}

        <div className="payment-history-section">
          <h3>Payment History</h3>

          {payments.length === 0 ? (
            <p>No payments recorded yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Note</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.paymentDate}</td>
                    <td>₹{Number(payment.amount || 0).toLocaleString("en-IN")}</td>
                    <td>{payment.paymentMethod}</td>
                    <td>{payment.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;