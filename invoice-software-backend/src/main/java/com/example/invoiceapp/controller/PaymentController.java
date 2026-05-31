package com.example.invoiceapp.controller;

import com.example.invoiceapp.entity.Payment;
import com.example.invoiceapp.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public Payment addPayment(
            @PathVariable Long invoiceId,
            @RequestBody Payment payment
    ) {
        return paymentService.addPayment(invoiceId, payment);
    }

    @GetMapping("/invoice/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public List<Payment> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        return paymentService.getPaymentsByInvoice(invoiceId);
    }
}