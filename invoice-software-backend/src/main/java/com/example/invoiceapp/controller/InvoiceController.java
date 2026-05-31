package com.example.invoiceapp.controller;

import com.example.invoiceapp.entity.Invoice;
import com.example.invoiceapp.service.InvoicePdfService;
import com.example.invoiceapp.service.InvoiceService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "http://localhost:5173")
public class InvoiceController {

    private final InvoiceService invoiceService;

    private final InvoicePdfService invoicePdfService;


    public InvoiceController(InvoiceService invoiceService, InvoicePdfService invoicePdfService) {
    this.invoiceService = invoiceService;
    this.invoicePdfService = invoicePdfService;
}

    @PostMapping
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public Invoice createInvoice(@RequestBody Invoice invoice) {
    return invoiceService.createInvoice(invoice);
}

    @GetMapping
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public List<Invoice> getAllInvoices() {
    return invoiceService.getAllInvoices();
}

    @GetMapping("/{id}")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public Invoice getInvoiceById(@PathVariable Long id) {
    return invoiceService.getInvoiceById(id);
}

    @DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public String deleteInvoice(@PathVariable Long id) {
    invoiceService.deleteInvoice(id);
    return "Invoice deleted successfully";
}

    @PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public Invoice updateInvoice(@PathVariable Long id, @RequestBody Invoice invoice) {
    return invoiceService.updateInvoice(id, invoice);
}
    @GetMapping("/{id}/pdf")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long id) {
    Invoice invoice = invoiceService.getInvoiceById(id);

    byte[] pdfBytes = invoicePdfService.generateInvoicePdf(invoice);

    return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + id + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdfBytes);
}
    
}