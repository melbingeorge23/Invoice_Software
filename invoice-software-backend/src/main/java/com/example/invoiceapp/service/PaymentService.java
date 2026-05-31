package com.example.invoiceapp.service;

import com.example.invoiceapp.entity.Invoice;
import com.example.invoiceapp.entity.Payment;
import com.example.invoiceapp.repository.InvoiceRepository;
import com.example.invoiceapp.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public Payment addPayment(Long invoiceId, Payment payment) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        if (payment.getAmount() == null || payment.getAmount() <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        if (invoice.getBalanceAmount() != null && payment.getAmount() > invoice.getBalanceAmount()) {
            throw new RuntimeException("Payment amount cannot be greater than balance amount");
        }

        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }

        if (payment.getPaymentMethod() == null || payment.getPaymentMethod().isBlank()) {
            payment.setPaymentMethod("CASH");
        }

        payment.setInvoice(invoice);

        Payment savedPayment = paymentRepository.save(payment);

        double existingPaidAmount = invoice.getPaidAmount() == null ? 0.0 : invoice.getPaidAmount();
        double updatedPaidAmount = existingPaidAmount + payment.getAmount();

        double grandTotal = invoice.getGrandTotal() == null ? 0.0 : invoice.getGrandTotal();

        if (updatedPaidAmount > grandTotal) {
            updatedPaidAmount = grandTotal;
        }

        double balanceAmount = grandTotal - updatedPaidAmount;

        String paymentStatus;

        if (updatedPaidAmount == 0) {
            paymentStatus = "UNPAID";
        } else if (updatedPaidAmount < grandTotal) {
            paymentStatus = "PARTIAL";
        } else {
            paymentStatus = "PAID";
        }

        invoice.setPaidAmount(updatedPaidAmount);
        invoice.setBalanceAmount(balanceAmount);
        invoice.setPaymentStatus(paymentStatus);
        invoice.setPaymentMethod(payment.getPaymentMethod());

        invoiceRepository.save(invoice);

        return savedPayment;
    }

    public List<Payment> getPaymentsByInvoice(Long invoiceId) {
        return paymentRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId);
    }
}