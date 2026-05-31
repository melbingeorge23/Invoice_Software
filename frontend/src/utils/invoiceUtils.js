export const isInvoiceOverdue = (invoice) => {
  if (!invoice.dueDate) {
    return false;
  }

  if ((invoice.balanceAmount || 0) <= 0) {
    return false;
  }

  if (invoice.paymentStatus === "PAID") {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};