import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getCompanyProfile,
  saveCompanyProfile,
  uploadCompanyLogo,
  fetchCompanyLogoBlobUrl
} from "../api/companyProfileApi";

function CompanyProfile() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyAddress: "",
    phone: "",
    email: "",
    gstNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: ""
  });

  const [savedProfile, setSavedProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    fetchCompanyProfile();

    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogo = async () => {
    try {
      const logoUrl = await fetchCompanyLogoBlobUrl();

      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }

      setLogoPreviewUrl(logoUrl);
    } catch (error) {
      setLogoPreviewUrl("");
    }
  };

  const fetchCompanyProfile = async () => {
    try {
      const data = await getCompanyProfile();

      if (data) {
        const profileData = {
          companyName: data.companyName || "",
          companyAddress: data.companyAddress || "",
          phone: data.phone || "",
          email: data.email || "",
          gstNumber: data.gstNumber || "",
          bankName: data.bankName || "",
          accountNumber: data.accountNumber || "",
          ifscCode: data.ifscCode || "",
          upiId: data.upiId || ""
        };

        setFormData(profileData);
        setSavedProfile(profileData);
        setIsEditing(false);

        await fetchLogo();
      } else {
        setIsEditing(true);
      }
    } catch (error) {
      console.error(error);
      setIsEditing(true);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("Logo image should be less than 1 MB");
      return;
    }

    try {
      setLogoUploading(true);

      await uploadCompanyLogo(file);
      await fetchLogo();

      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload logo");
    } finally {
      setLogoUploading(false);
      e.target.value = "";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (savedProfile) {
      setFormData(savedProfile);
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.companyAddress || !formData.phone) {
      toast.error("Please fill company name, address, and phone");
      return;
    }

    try {
      setLoading(true);

      const data = await saveCompanyProfile(formData);

      const updatedProfile = {
        companyName: data.companyName || "",
        companyAddress: data.companyAddress || "",
        phone: data.phone || "",
        email: data.email || "",
        gstNumber: data.gstNumber || "",
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        ifscCode: data.ifscCode || "",
        upiId: data.upiId || ""
      };

      setSavedProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);

      toast.success("Company profile saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save company profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing && savedProfile) {
    return (
      <div className="company-profile-page">
        <div className="company-profile-card">
          <div className="company-profile-header">
            <div className="company-logo-preview">
              {logoPreviewUrl ? (
                <img src={logoPreviewUrl} alt="Company Logo" />
              ) : (
                <span>
                  {savedProfile.companyName?.charAt(0)?.toUpperCase() || "C"}
                </span>
              )}
            </div>

            <div>
              <h2>{savedProfile.companyName}</h2>
              <p>{savedProfile.companyAddress}</p>
            </div>

            <button className="action-btn edit-action" onClick={handleEdit}>
              Edit
            </button>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Phone</span>
              <strong>{savedProfile.phone || "-"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Email</span>
              <strong>{savedProfile.email || "-"}</strong>
            </div>

            <div className="profile-info-item">
              <span>GST Number</span>
              <strong>{savedProfile.gstNumber || "-"}</strong>
            </div>

            <div className="profile-info-item">
              <span>Logo</span>
              <strong>{logoPreviewUrl ? "Uploaded" : "Not uploaded"}</strong>
            </div>
          </div>

          <div className="payment-card">
            <h3>Payment Details</h3>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span>Bank Name</span>
                <strong>{savedProfile.bankName || "-"}</strong>
              </div>

              <div className="profile-info-item">
                <span>Account Number</span>
                <strong>{savedProfile.accountNumber || "-"}</strong>
              </div>

              <div className="profile-info-item">
                <span>IFSC Code</span>
                <strong>{savedProfile.ifscCode || "-"}</strong>
              </div>

              <div className="profile-info-item">
                <span>UPI ID</span>
                <strong>{savedProfile.upiId || "-"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-heading">
        <h3>{savedProfile ? "Edit Company Profile" : "Company Profile Settings"}</h3>
        <p>These details will appear on generated invoice PDFs.</p>
      </div>

      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
          />
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            placeholder="Enter GST number"
          />
        </div>

        <div className="form-group full-width">
          <label>Company Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            disabled={logoUploading}
          />
        </div>

        {logoPreviewUrl && (
          <div className="logo-form-preview full-width">
            <span>Logo Preview</span>
            <img src={logoPreviewUrl} alt="Logo Preview" />
          </div>
        )}

        <div className="form-group full-width">
          <label>Company Address *</label>
          <input
            type="text"
            name="companyAddress"
            value={formData.companyAddress}
            onChange={handleChange}
            placeholder="Enter company address"
          />
        </div>

        <div className="form-group">
          <label>Bank Name</label>
          <input
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            placeholder="Enter bank name"
          />
        </div>

        <div className="form-group">
          <label>Account Number</label>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            placeholder="Enter account number"
          />
        </div>

        <div className="form-group">
          <label>IFSC Code</label>
          <input
            type="text"
            name="ifscCode"
            value={formData.ifscCode}
            onChange={handleChange}
            placeholder="Enter IFSC code"
          />
        </div>

        <div className="form-group">
          <label>UPI ID</label>
          <input
            type="text"
            name="upiId"
            value={formData.upiId}
            onChange={handleChange}
            placeholder="Enter UPI ID"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <span className="loading-text">Saving</span> : "Save Company Profile"}
        </button>

        {savedProfile && (
          <button type="button" className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export default CompanyProfile;