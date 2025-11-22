

package com.example.taxinvoice.controller;

import com.example.taxinvoice.entity.NumberToWordsConverter;
import com.example.taxinvoice.entity.InvoiceItemDTO;
import com.example.taxinvoice.entity.InvoiceRequestDTO;
import com.example.taxinvoice.service.InvoiceService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/invoice")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/generate")
    public ResponseEntity<InputStreamResource> generateInvoice(@RequestBody InvoiceRequestDTO requestDTO) throws IOException {
        // Get authenticated user's email
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        // Calculate totals
        BigDecimal netTotal = requestDTO.getItems().stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gst = netTotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = netTotal.add(gst);
        String amountWords = NumberToWordsConverter.convert(grandTotal.intValue());

        // Generate file
        File generatedFile = invoiceService.generateWordFileAndSaveToDB(
                userEmail, requestDTO.getRefNo(), requestDTO.getDate(), requestDTO.getToAddress(),
                requestDTO.getGstNumber(), requestDTO.getItems(), netTotal, gst, grandTotal, amountWords
        );

        // Prepare file for download
        InputStreamResource resource = new InputStreamResource(new FileInputStream(generatedFile));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + generatedFile.getName() + "\"")
                .contentLength(generatedFile.length())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}