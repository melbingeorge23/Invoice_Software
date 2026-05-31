import { useState } from "react";
import { createCustomer, deleteCustomer, updateCustomer } from "../api/customerApi";
import toast from "react-hot-toast";

function CustomerMaster({ customers, onCustomerChange }) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerGstNumber: ""
  });

  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const isEditing = editingCustomerId !== null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerGstNumber: ""
    });

    setEditingCustomerId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast.error("Please fill customer name, phone, and address");
      return;
    }

    try {
      if (isEditing) {
        await updateCustomer(editingCustomerId, formData);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(formData);
        toast.success("Customer created successfully");
      }

      resetForm();
      onCustomerChange();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update customer" : "Failed to create customer");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomerId(customer.id);

    setFormData({
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      customerAddress: customer.customerAddress,
      customerGstNumber: customer.customerGstNumber || ""
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCustomer(id);
      toast.success("Customer deleted successfully");
      onCustomerChange();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete customer");
    }
  };

  return (
    <div className="card">
      <h2>Customer Master</h2>

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-group">
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
            placeholder="Enter address"
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

        <button type="submit">
          {isEditing ? "Update Customer" : "Add Customer"}
        </button>

        {isEditing && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <h3>Customer List</h3>

      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>GST Number</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.customerName}</td>
                <td>{customer.customerPhone}</td>
                <td>{customer.customerAddress}</td>
                <td>{customer.customerGstNumber}</td>
                <td>
                  <button onClick={() => handleEdit(customer)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(customer.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CustomerMaster;