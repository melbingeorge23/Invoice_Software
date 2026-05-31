import { useEffect, useState } from "react";
import { createInvoice, updateInvoice } from "../api/invoiceApi";
import toast from "react-hot-toast";

function CreateInvoice({ onInvoiceCreated, invoiceToEdit, onCancelEdit, customers, products }) {

  const [formData, setFormData] = useState({
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerGstNumber: "",
  taxPercentage: "18",
  paymentMethod: "CASH",
  paidAmount: "",
  dueDate: ""
});

  const [items, setItems] = useState([
    {
      productName: "",
      quantity: "",
      price: ""
    }
  ]);

  const [loading, setLoading] = useState(false);

  const isEditing = invoiceToEdit !== null;

  useEffect(() => {
    if (invoiceToEdit) {
      setFormData({
        customerName: invoiceToEdit.customerName || "",
        customerPhone: invoiceToEdit.customerPhone || "",
        customerAddress: invoiceToEdit.customerAddress || "",
        customerGstNumber: invoiceToEdit.customerGstNumber || "",
        taxPercentage: invoiceToEdit.taxPercentage || "18"
      });

      if (invoiceToEdit.items && invoiceToEdit.items.length > 0) {
        setFormData({
  customerName: invoiceToEdit.customerName || "",
  customerPhone: invoiceToEdit.customerPhone || "",
  customerAddress: invoiceToEdit.customerAddress || "",
  customerGstNumber: invoiceToEdit.customerGstNumber || "",
  taxPercentage: invoiceToEdit.taxPercentage || "18",
  paymentMethod: invoiceToEdit.paymentMethod || "CASH",
  paidAmount: invoiceToEdit.paidAmount || "",
  dueDate: invoiceToEdit.dueDate || ""
});
      }
    }
  }, [invoiceToEdit]);

  const resetForm = () => {
    setFormData({
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerGstNumber: "",
  taxPercentage: "18",
  paymentMethod: "CASH",
  paidAmount: "",
  dueDate: ""
});

    setItems([
      {
        productName: "",
        quantity: "",
        price: ""
      }
    ]);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleItemChange = (index, e) => {
    const updatedItems = [...items];
    updatedItems[index][e.target.name] = e.target.value;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        productName: "",
        quantity: "",
        price: ""
      }
    ]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error("At least one item is required");
      return;
    }

    const updatedItems = items.filter((_, itemIndex) => itemIndex !== index);
    setItems(updatedItems);
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.customerAddress ||
      !formData.taxPercentage
    ) {
      toast.error("Please fill all customer fields");
      return;
    }

    for (const item of items) {
      if (!item.productName || !item.quantity || !item.price) {
        toast.error("Please fill all item fields");
        return;
      }
    }

    const invoicePayload = {
  customerName: formData.customerName,
  customerPhone: formData.customerPhone,
  customerAddress: formData.customerAddress,
  customerGstNumber: formData.customerGstNumber,
  taxPercentage: Number(formData.taxPercentage),
  paymentMethod: formData.paymentMethod,
  paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
  dueDate: formData.dueDate || null,
  items: items.map((item) => ({
    productName: item.productName,
    quantity: Number(item.quantity),
    price: Number(item.price)
  }))
};

    try {
      setLoading(true);

      if (isEditing) {
        await updateInvoice(invoiceToEdit.id, invoicePayload);
        toast.success("Invoice updated successfully");
      } else {
        await createInvoice(invoicePayload);
        toast.success("Invoice created successfully");
      }

      resetForm();
      onInvoiceCreated();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update invoice" : "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (e) => {
  const selectedCustomerId = e.target.value;

  if (!selectedCustomerId) {
    return;
  }

  const selectedCustomer = customers.find(
    (customer) => customer.id === Number(selectedCustomerId)
  );

  if (selectedCustomer) {
    setFormData({
      ...formData,
      customerName: selectedCustomer.customerName,
      customerPhone: selectedCustomer.customerPhone,
      customerAddress: selectedCustomer.customerAddress,
      customerGstNumber: selectedCustomer.customerGstNumber || ""
    });
  }
};

const handleProductSelect = (index, e) => {
  const selectedProductId = e.target.value;

  if (!selectedProductId) {
    return;
  }

  const selectedProduct = products.find(
    (product) => product.id === Number(selectedProductId)
  );

  if (selectedProduct) {
    const updatedItems = [...items];

    updatedItems[index] = {
      ...updatedItems[index],
      productName: selectedProduct.productName,
      price: selectedProduct.price
    };

    setItems(updatedItems);
  }
};

  return (
    <div className="card">
      <h2>{isEditing ? "Edit Invoice" : "Create Invoice"}</h2>

      {isEditing && (
        <p className="edit-mode-message">
          Editing invoice: <strong>{invoiceToEdit.invoiceNumber}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="invoice-form">
          <div className="form-group">
            <div className="form-group">
  <label>Select Saved Customer</label>
  <select onChange={handleCustomerSelect} defaultValue="">
    <option value="">-- Select Customer --</option>

    {customers.map((customer) => (
      <option key={customer.id} value={customer.id}>
        {customer.customerName} - {customer.customerPhone}
      </option>
    ))}
  </select>
</div>
            <label>Customer Name *</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label>Customer Phone *</label>
            <input
              type="text"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="form-group">
            <label>Customer Address *</label>
            <input
              type="text"
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              placeholder="Enter customer address"
            />
          </div>

          <div className="form-group">
            <label>Customer GST Number</label>
            <input
              type="text"
              name="customerGstNumber"
              value={formData.customerGstNumber}
              onChange={handleChange}
              placeholder="Enter GST number"
            />
          </div>

          <div className="form-group">
            <label>Tax Percentage *</label>
            <input
              type="number"
              name="taxPercentage"
              value={formData.taxPercentage}
              onChange={handleChange}
              placeholder="Enter tax percentage"
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
  <label>Paid Amount</label>
  <input
    type="number"
    name="paidAmount"
    value={formData.paidAmount}
    onChange={handleChange}
    placeholder="Enter paid amount"
  />
</div>

<div className="form-group">
  <label>Due Date</label>
  <input
    type="date"
    name="dueDate"
    value={formData.dueDate}
    onChange={handleChange}
  />
</div>

        </div>

        <h3>Invoice Items</h3>

        {items.map((item, index) => (
          <div className="item-row" key={index}>
            <div className="form-group">
              <div className="form-group">
  <label>Select Saved Product</label>
  <select onChange={(e) => handleProductSelect(index, e)} defaultValue="">
    <option value="">-- Select Product --</option>

    {products.map((product) => (
      <option key={product.id} value={product.id}>
        {product.productName} - ₹{product.price}
      </option>
    ))}
  </select>
</div>


              <label>Product/Service *</label>
              <input
                type="text"
                name="productName"
                value={item.productName}
                onChange={(e) => handleItemChange(index, e)}
                placeholder="Product/service name"
              />
            </div>

            <div className="form-group">
              <label>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, e)}
                placeholder="Qty"
              />
            </div>

            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                name="price"
                value={item.price}
                onChange={(e) => handleItemChange(index, e)}
                placeholder="Price"
              />
            </div>

            <button
              type="button"
              className="delete-btn"
              onClick={() => removeItem(index)}
            >
              Remove
            </button>
          </div>
        ))}

        <button type="button" className="add-btn" onClick={addItem}>
          Add Item
        </button>

        <button type="submit" disabled={loading}>
          {loading
  ? isEditing
    ? <span className="loading-text">Updating</span>
    : <span className="loading-text">Creating</span>
  : isEditing
  ? "Update Invoice"
  : "Create Invoice"}
        </button>

        {isEditing && (
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel Edit
          </button>
        )}
      </form>
    </div>
  );
}

export default CreateInvoice;