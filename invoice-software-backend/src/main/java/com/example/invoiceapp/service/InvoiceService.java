package com.example.invoiceapp.service;

import com.example.invoiceapp.entity.Invoice;
import com.example.invoiceapp.entity.InvoiceItem;
import com.example.invoiceapp.repository.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    public Invoice createInvoice(Invoice invoice) {
        calculateInvoiceTotals(invoice);
        invoice.setInvoiceDate(LocalDate.now());

        Invoice savedInvoice = invoiceRepository.save(invoice);

        String invoiceNumber = "INV-" + String.format("%05d", savedInvoice.getId());
        savedInvoice.setInvoiceNumber(invoiceNumber);

        return invoiceRepository.save(savedInvoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    public Invoice updateInvoice(Long id, Invoice updatedInvoice) {
        Invoice existingInvoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        existingInvoice.setCustomerName(updatedInvoice.getCustomerName());
        existingInvoice.setCustomerPhone(updatedInvoice.getCustomerPhone());
        existingInvoice.setCustomerAddress(updatedInvoice.getCustomerAddress());
        existingInvoice.setCustomerGstNumber(updatedInvoice.getCustomerGstNumber());
        existingInvoice.setTaxPercentage(updatedInvoice.getTaxPercentage());

        existingInvoice.setPaymentMethod(updatedInvoice.getPaymentMethod());
        existingInvoice.setPaidAmount(updatedInvoice.getPaidAmount());
        existingInvoice.setDueDate(updatedInvoice.getDueDate());

        existingInvoice.getItems().clear();

        for (InvoiceItem item : updatedInvoice.getItems()) {
            item.setInvoice(existingInvoice);
            existingInvoice.getItems().add(item);
        }

        calculateInvoiceTotals(existingInvoice);

        return invoiceRepository.save(existingInvoice);
    }

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    private void calculateInvoiceTotals(Invoice invoice) {
    double subtotal = 0.0;

    for (InvoiceItem item : invoice.getItems()) {
        double lineTotal = item.getQuantity() * item.getPrice();

        item.setLineTotal(lineTotal);
        item.setInvoice(invoice);

        subtotal += lineTotal;
    }

    double taxAmount = subtotal * invoice.getTaxPercentage() / 100;
    double grandTotal = subtotal + taxAmount;

    double paidAmount = invoice.getPaidAmount() == null ? 0.0 : invoice.getPaidAmount();

    if (paidAmount < 0) {
        paidAmount = 0.0;
    }

    if (paidAmount > grandTotal) {
        paidAmount = grandTotal;
    }

    double balanceAmount = grandTotal - paidAmount;

    String paymentStatus;

    if (paidAmount == 0) {
        paymentStatus = "UNPAID";
    } else if (paidAmount < grandTotal) {
        paymentStatus = "PARTIAL";
    } else {
        paymentStatus = "PAID";
    }

    if (invoice.getPaymentMethod() == null || invoice.getPaymentMethod().isBlank()) {
        invoice.setPaymentMethod("CASH");
    }

    invoice.setSubtotal(subtotal);
    invoice.setTaxAmount(taxAmount);
    invoice.setGrandTotal(grandTotal);
    invoice.setPaidAmount(paidAmount);
    invoice.setBalanceAmount(balanceAmount);
    invoice.setPaymentStatus(paymentStatus);
}
}