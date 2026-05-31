package com.example.invoiceapp.dto;

public class DashboardSummary {

    private Long totalInvoices;
    private Double totalRevenue;
    private Double totalTax;

    public DashboardSummary() {
    }

    public DashboardSummary(Long totalInvoices, Double totalRevenue, Double totalTax) {
        this.totalInvoices = totalInvoices;
        this.totalRevenue = totalRevenue;
        this.totalTax = totalTax;
    }

    public Long getTotalInvoices() {
        return totalInvoices;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public Double getTotalTax() {
        return totalTax;
    }

    public void setTotalInvoices(Long totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public void setTotalTax(Double totalTax) {
        this.totalTax = totalTax;
    }
}