import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser
} from "../api/userApi";

function UserManagement({ currentUser })  {
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "STAFF"
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEditing = editingUserId !== null;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "STAFF"
    });

    setEditingUserId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "STAFF"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.role) {
      toast.error("Please fill name, email, and role");
      return;
    }

    if (!isEditing && !formData.password) {
      toast.error("Password is required for new user");
      return;
    }

    try {
      setLoading(true);

      if (isEditing) {
        await updateUser(editingUserId, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        toast.success("User updated successfully");
      } else {
        await createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        });

        toast.success("User created successfully");
      }

      resetForm();
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update user" : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
  if (user.email === currentUser.email) {
    toast.error("You cannot delete your own account");
    return;
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to delete ${user.name}?`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await deleteUser(user.id);
    toast.success("User deleted successfully");
    fetchUsers();
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete user");
  }
};

  return (
    <div className="user-management-page">
      <div className="card">
        <div className="section-heading">
          <h3>{isEditing ? "Edit User" : "Create User"}</h3>
          <p>
            Create admin or staff login accounts for the billing software.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="invoice-form">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter user name"
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
              disabled={isEditing}
            />
          </div>

          <div className="form-group">
            <label>
              Password {isEditing ? "(leave blank to keep old password)" : "*"}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={isEditing ? "Optional new password" : "Enter password"}
            />
          </div>

          <div className="form-group">
            <label>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? (
              <span className="loading-text">
                {isEditing ? "Updating" : "Creating"}
              </span>
            ) : isEditing ? (
              "Update User"
            ) : (
              "Create User"
            )}
          </button>

          {isEditing && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <div className="section-heading">
          <h3>User List</h3>
          <p>Manage admin and staff accounts.</p>
        </div>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>
                    {user.email}
                    {user.email === currentUser.email && (
                    <span className="current-user-tag"> You</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.role === "ADMIN" ? "paid" : "partial"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="action-btn edit-action"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>

                      <button
                        className="action-btn delete-action"
                        onClick={() => handleDelete(user)}
                        disabled={user.email === currentUser.email}
                    >
                        Delete
                     </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default UserManagement;