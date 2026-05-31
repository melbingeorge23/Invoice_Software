package com.example.invoiceapp.entity;

import jakarta.persistence.*;

@Entity
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String companyName;

    @Column(length = 1000)
    private String companyAddress;

    private String phone;
    private String email;
    private String gstNumber;

    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String upiId;
    private String logoFileName;

    private String logoContentType;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] logoImage;

    public CompanyProfile() {
    }

    public Long getId() {
        return id;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getCompanyAddress() {
        return companyAddress;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public String getBankName() {
        return bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getIfscCode() {
        return ifscCode;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setCompanyAddress(String companyAddress) {
        this.companyAddress = companyAddress;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public void setIfscCode(String ifscCode) {
        this.ifscCode = ifscCode;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getLogoFileName() {
    return logoFileName;
}

public void setLogoFileName(String logoFileName) {
    this.logoFileName = logoFileName;
}

public String getLogoContentType() {
    return logoContentType;
}

public void setLogoContentType(String logoContentType) {
    this.logoContentType = logoContentType;
}

public byte[] getLogoImage() {
    return logoImage;
}

public void setLogoImage(byte[] logoImage) {
    this.logoImage = logoImage;
}

    
}