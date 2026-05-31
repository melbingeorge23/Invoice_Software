import { useState } from "react";
import { createProduct, deleteProduct, updateProduct } from "../api/productApi";
import toast from "react-hot-toast";

function ProductMaster({ products, onProductChange }) {
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    description: ""
  });

  const [editingProductId, setEditingProductId] = useState(null);

  const isEditing = editingProductId !== null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      price: "",
      description: ""
    });

    setEditingProductId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.productName || !formData.price) {
      toast.error("Please fill product name and price");
      return;
    }

    const payload = {
      productName: formData.productName,
      price: Number(formData.price),
      description: formData.description
    };

    try {
      if (isEditing) {
        await updateProduct(editingProductId, payload);
        toast.success("Product updated successfully");
      } else {
        await createProduct(payload);
        toast.success("Product created successfully");
      }

      resetForm();
      onProductChange();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update product" : "Failed to create product");
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product.id);

    setFormData({
      productName: product.productName,
      price: product.price,
      description: product.description || ""
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this product?");

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      onProductChange();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="card">
      <h2>Product Master</h2>

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-group">
          <label>Product/Service Name *</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="Enter product/service name"
          />
        </div>

        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="Enter price"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter description"
          />
        </div>

        <button type="submit">
          {isEditing ? "Update Product" : "Add Product"}
        </button>

        {isEditing && (
          <button type="button" className="cancel-btn" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      <h3>Product List</h3>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Product/Service</th>
              <th>Price</th>
              <th>Description</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.productName}</td>
                <td>₹{product.price}</td>
                <td>{product.description}</td>
                <td>
                  <button onClick={() => handleEdit(product)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
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

export default ProductMaster;