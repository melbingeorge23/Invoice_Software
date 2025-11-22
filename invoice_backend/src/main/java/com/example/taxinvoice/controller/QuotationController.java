package com.example.taxinvoice.controller;

import com.example.taxinvoice.entity.NumberToWordsConverter;
import com.example.taxinvoice.entity.QuotationItemDTO;
import com.example.taxinvoice.entity.QuotationRequestDTO;
import com.example.taxinvoice.service.QuotationService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/quotation")
public class QuotationController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(QuotationController.class);


    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

//    @PostMapping("/generate")
//    public ResponseEntity<String> generateQuotation(@RequestBody QuotationRequestDTO requestDTO) {
//        try {
//            // ✅ Get authenticated user's email
//            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//            String userEmail = authentication.getName(); // Extract email from token
//
//            if (userEmail == null || userEmail.isEmpty()) {
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated.");
//            }
//
//
//            List<QuotationItemDTO> items = requestDTO.getItems();
//            if (items == null || items.isEmpty()) {
//                return ResponseEntity.badRequest().body("Items list cannot be null or empty");
//            }
//
//            // ✅ Calculate totals
//            BigDecimal netTotal = requestDTO.getItems().stream()
//                    .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
//                    .reduce(BigDecimal.ZERO, BigDecimal::add);
//
//            BigDecimal gst = netTotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
//            BigDecimal grandTotal = netTotal.add(gst);
//            String amountWords = NumberToWordsConverter.convert(grandTotal.intValue());
//
//            // ✅ Call the correct method to generate the file
//            File generatedFile = quotationService.generateWordFileAndSaveToDB(
//                    userEmail, requestDTO.getRefNo(), requestDTO.getDate(), requestDTO.getToAddress(),
//                    requestDTO.getGstNumber(), requestDTO.getItems(), netTotal, gst, grandTotal, amountWords
//            );
//
//            return ResponseEntity.ok("File saved at: " + generatedFile.getAbsolutePath());
//
//        } catch (Exception e) {
//            logger.error("Error generating quotation", e);  // Log the error
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
//        }
//    }
@PostMapping("/generate")
public ResponseEntity<byte[]> generateQuotation(@RequestBody QuotationRequestDTO requestDTO) {
    try {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        if (userEmail == null || userEmail.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        List<QuotationItemDTO> items = requestDTO.getItems();
        if (items == null || items.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        // Calculate totals
        BigDecimal netTotal = items.stream()
                .map(item -> item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gst = netTotal.multiply(new BigDecimal("0.18")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = netTotal.add(gst);
        String amountWords = NumberToWordsConverter.convert(grandTotal.intValue());

        // Generate the file
        File generatedFile = quotationService.generateWordFileAndSaveToDB(
                userEmail, requestDTO.getRefNo(), requestDTO.getDate(), requestDTO.getToAddress(),
                requestDTO.getGstNumber(), items, netTotal, gst, grandTotal, amountWords
        );

        // Read the file into byte array
        byte[] fileContent = Files.readAllBytes(generatedFile.toPath());

        // Set headers for download
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename(generatedFile.getName())
                .build());

        // Delete the temporary file
        Files.delete(generatedFile.toPath());

        return new ResponseEntity<>(fileContent, headers, HttpStatus.OK);

    } catch (Exception e) {
        logger.error("Error generating quotation", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
    }
}

}
