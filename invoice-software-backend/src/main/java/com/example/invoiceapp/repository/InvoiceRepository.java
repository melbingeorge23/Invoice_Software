package com.example.invoiceapp.repository;

import com.example.invoiceapp.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i")
    Double getTotalRevenue();

    @Query("SELECT COALESCE(SUM(i.taxAmount), 0) FROM Invoice i")
    Double getTotalTax();
}