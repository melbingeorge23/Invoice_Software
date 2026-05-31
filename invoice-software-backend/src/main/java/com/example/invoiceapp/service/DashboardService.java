package com.example.invoiceapp.service;

import com.example.invoiceapp.dto.DashboardSummary;
import com.example.invoiceapp.repository.InvoiceRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final InvoiceRepository invoiceRepository;

    public DashboardService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public DashboardSummary getDashboardSummary() {
        Long totalInvoices = invoiceRepository.count();
        Double totalRevenue = invoiceRepository.getTotalRevenue();
        Double totalTax = invoiceRepository.getTotalTax();

        return new DashboardSummary(totalInvoices, totalRevenue, totalTax);
    }
}