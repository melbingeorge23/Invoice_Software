package com.example.invoiceapp.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String invoiceNumber;

    private String customerName;
    private String customerPhone;
    private String customerAddress;
    private String customerGstNumber;

    private Double taxPercentage;

    private Double subtotal;
    private Double taxAmount;
    private Double grandTotal;

    private String paymentStatus;

private String paymentMethod;

private Double paidAmount;

private Double balanceAmount;

private LocalDate dueDate;


@OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
@JsonManagedReference
private List<Payment> payments = new ArrayList<>();

    private LocalDate invoiceDate;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<InvoiceItem> items = new ArrayList<>();

    public Invoice() {
    }

    public Long getId() {
        return id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public String getCustomerGstNumber() {
        return customerGstNumber;
    }

    public Double getTaxPercentage() {
        return taxPercentage;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public Double getTaxAmount() {
        return taxAmount;
    }

    public Double getGrandTotal() {
        return grandTotal;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public void setCustomerGstNumber(String customerGstNumber) {
        this.customerGstNumber = customerGstNumber;
    }

    public void setTaxPercentage(Double taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }

    public void setGrandTotal(Double grandTotal) {
        this.grandTotal = grandTotal;
    }

    public void setInvoiceDate(LocalDate invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items;
    }

    public String getPaymentStatus() {
    return paymentStatus;
}

public String getPaymentMethod() {
    return paymentMethod;
}

public Double getPaidAmount() {
    return paidAmount;
}

public Double getBalanceAmount() {
    return balanceAmount;
}

public LocalDate getDueDate() {
    return dueDate;
}

public void setPaymentStatus(String paymentStatus) {
    this.paymentStatus = paymentStatus;
}

public void setPaymentMethod(String paymentMethod) {
    this.paymentMethod = paymentMethod;
}

public void setPaidAmount(Double paidAmount) {
    this.paidAmount = paidAmount;
}

public void setBalanceAmount(Double balanceAmount) {
    this.balanceAmount = balanceAmount;
}

public void setDueDate(LocalDate dueDate) {
    this.dueDate = dueDate;
}

public List<Payment> getPayments() {
    return payments;
}

public void setPayments(List<Payment> payments) {
    this.payments = payments;
}

}