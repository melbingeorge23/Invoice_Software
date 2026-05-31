package com.example.invoiceapp.service;

import com.example.invoiceapp.entity.CompanyProfile;
import com.example.invoiceapp.entity.Invoice;
import com.example.invoiceapp.entity.InvoiceItem;
import com.lowagie.text.*;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
public class InvoicePdfService {

    private final CompanyProfileService companyProfileService;

    public InvoicePdfService(CompanyProfileService companyProfileService) {
        this.companyProfileService = companyProfileService;
    }

    public byte[] generateInvoicePdf(Invoice invoice) {
        try {
            CompanyProfile companyProfile = companyProfileService.getCompanyProfile();

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            Document document = new Document(PageSize.A4, 36, 36, 32, 32);
            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    22,
                    new Color(15, 23, 42)
            );

            Font companyFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    16,
                    new Color(15, 23, 42)
            );

            Font headingFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    12,
                    new Color(15, 23, 42)
            );

            Font normalFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    10,
                    new Color(51, 65, 85)
            );

            Font smallFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    9,
                    new Color(100, 116, 139)
            );

            Font whiteBoldFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    10,
                    Color.WHITE
            );

            Font totalFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    12,
                    new Color(15, 23, 42)
            );

            addHeader(document, companyProfile, titleFont, companyFont, smallFont);

            addSpacing(document, 10);

            addInvoiceAndCustomerSection(document, invoice, headingFont, normalFont);

            addSpacing(document, 12);

            addItemsTable(document, invoice, whiteBoldFont, normalFont);

            addSpacing(document, 12);

            addTotalsAndPaymentSection(
                    document,
                    invoice,
                    companyProfile,
                    headingFont,
                    normalFont,
                    totalFont
            );

            addSpacing(document, 18);

            Paragraph footer = new Paragraph("Thank you for your business!", headingFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            Paragraph footerNote = new Paragraph("This is a system-generated invoice.", smallFont);
            footerNote.setAlignment(Element.ALIGN_CENTER);
            document.add(footerNote);

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private void addHeader(
            Document document,
            CompanyProfile companyProfile,
            Font titleFont,
            Font companyFont,
            Font smallFont
    ) throws DocumentException {

        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{2.1f, 1f});

        PdfPCell companyCell = new PdfPCell();
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setPadding(0);

        if (companyProfile != null && companyProfile.getLogoImage() != null) {
            try {
                Image logo = Image.getInstance(companyProfile.getLogoImage());
                logo.scaleToFit(75, 60);
                companyCell.addElement(logo);
            } catch (Exception ignored) {
                // If logo fails, PDF continues without logo.
            }
        }

        String companyName = companyProfile != null
                ? nullSafe(companyProfile.getCompanyName())
                : "InvoicePro Billing Suite";

        String companyAddress = companyProfile != null
                ? nullSafe(companyProfile.getCompanyAddress())
                : "-";

        String phone = companyProfile != null
                ? nullSafe(companyProfile.getPhone())
                : "-";

        String email = companyProfile != null
                ? nullSafe(companyProfile.getEmail())
                : "-";

        String gst = companyProfile != null
                ? nullSafe(companyProfile.getGstNumber())
                : "-";

        Paragraph name = new Paragraph(companyName, companyFont);
        name.setSpacingBefore(4);
        companyCell.addElement(name);

        companyCell.addElement(new Paragraph(companyAddress, smallFont));
        companyCell.addElement(new Paragraph("Phone: " + phone + " | Email: " + email, smallFont));
        companyCell.addElement(new Paragraph("GST: " + gst, smallFont));

        PdfPCell invoiceTitleCell = new PdfPCell();
        invoiceTitleCell.setBorder(Rectangle.NO_BORDER);
        invoiceTitleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        invoiceTitleCell.setVerticalAlignment(Element.ALIGN_TOP);
        invoiceTitleCell.setPadding(0);

        Paragraph title = new Paragraph("TAX INVOICE", titleFont);
        title.setAlignment(Element.ALIGN_RIGHT);
        invoiceTitleCell.addElement(title);

        Paragraph subtitle = new Paragraph("Official billing document", smallFont);
        subtitle.setAlignment(Element.ALIGN_RIGHT);
        invoiceTitleCell.addElement(subtitle);

        headerTable.addCell(companyCell);
        headerTable.addCell(invoiceTitleCell);

        document.add(headerTable);

        addDivider(document);
    }

    private void addInvoiceAndCustomerSection(
            Document document,
            Invoice invoice,
            Font headingFont,
            Font normalFont
    ) throws DocumentException {

        PdfPTable sectionTable = new PdfPTable(2);
        sectionTable.setWidthPercentage(100);
        sectionTable.setWidths(new float[]{1f, 1f});

        PdfPCell invoiceInfo = createBoxCell();
        invoiceInfo.addElement(new Paragraph("Invoice Details", headingFont));
        invoiceInfo.addElement(new Paragraph("Invoice No: " + nullSafe(invoice.getInvoiceNumber()), normalFont));
        invoiceInfo.addElement(new Paragraph("Invoice Date: " + invoice.getInvoiceDate(), normalFont));
        invoiceInfo.addElement(new Paragraph("Due Date: " + formatDate(invoice.getDueDate()), normalFont));
        invoiceInfo.addElement(new Paragraph("Payment Status: " + nullSafe(invoice.getPaymentStatus()), normalFont));
        invoiceInfo.addElement(new Paragraph("Payment Method: " + nullSafe(invoice.getPaymentMethod()), normalFont));

        PdfPCell customerInfo = createBoxCell();
        customerInfo.addElement(new Paragraph("Bill To", headingFont));
        customerInfo.addElement(new Paragraph("Name: " + nullSafe(invoice.getCustomerName()), normalFont));
        customerInfo.addElement(new Paragraph("Phone: " + nullSafe(invoice.getCustomerPhone()), normalFont));
        customerInfo.addElement(new Paragraph("Address: " + nullSafe(invoice.getCustomerAddress()), normalFont));
        customerInfo.addElement(new Paragraph("GST: " + nullSafe(invoice.getCustomerGstNumber()), normalFont));

        sectionTable.addCell(invoiceInfo);
        sectionTable.addCell(customerInfo);

        document.add(sectionTable);
    }

    private void addItemsTable(
            Document document,
            Invoice invoice,
            Font whiteBoldFont,
            Font normalFont
    ) throws DocumentException {

        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{0.7f, 4f, 1.1f, 1.5f, 1.7f});

        table.addCell(createHeaderCell("#", whiteBoldFont));
        table.addCell(createHeaderCell("Product / Service", whiteBoldFont));
        table.addCell(createHeaderCell("Qty", whiteBoldFont));
        table.addCell(createHeaderCell("Price", whiteBoldFont));
        table.addCell(createHeaderCell("Line Total", whiteBoldFont));

        int index = 1;

        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                table.addCell(createBodyCell(String.valueOf(index), normalFont, Element.ALIGN_CENTER));
                table.addCell(createBodyCell(nullSafe(item.getProductName()), normalFont, Element.ALIGN_LEFT));
                table.addCell(createBodyCell(String.valueOf(item.getQuantity()), normalFont, Element.ALIGN_CENTER));
                table.addCell(createBodyCell(formatCurrency(item.getPrice()), normalFont, Element.ALIGN_RIGHT));
                table.addCell(createBodyCell(formatCurrency(item.getLineTotal()), normalFont, Element.ALIGN_RIGHT));
                index++;
            }
        }

        document.add(table);
    }

    private void addTotalsAndPaymentSection(
            Document document,
            Invoice invoice,
            CompanyProfile companyProfile,
            Font headingFont,
            Font normalFont,
            Font totalFont
    ) throws DocumentException {

        PdfPTable bottomTable = new PdfPTable(2);
        bottomTable.setWidthPercentage(100);
        bottomTable.setWidths(new float[]{1.3f, 1f});

        PdfPCell paymentCell = createBoxCell();
        paymentCell.addElement(new Paragraph("Payment Details", headingFont));
        paymentCell.addElement(new Paragraph("Payment Method: " + nullSafe(invoice.getPaymentMethod()), normalFont));
        paymentCell.addElement(new Paragraph("Due Date: " + formatDate(invoice.getDueDate()), normalFont));

        if (companyProfile != null) {
            paymentCell.addElement(new Paragraph("Bank: " + nullSafe(companyProfile.getBankName()), normalFont));
            paymentCell.addElement(new Paragraph("Account No: " + nullSafe(companyProfile.getAccountNumber()), normalFont));
            paymentCell.addElement(new Paragraph("IFSC: " + nullSafe(companyProfile.getIfscCode()), normalFont));
            paymentCell.addElement(new Paragraph("UPI ID: " + nullSafe(companyProfile.getUpiId()), normalFont));
        } else {
            paymentCell.addElement(new Paragraph("Company payment details not configured.", normalFont));
        }

        PdfPCell totalCell = createBoxCell();

        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(100);
        totalsTable.setWidths(new float[]{1f, 1f});

        totalsTable.addCell(createTotalLabelCell("Subtotal", normalFont));
        totalsTable.addCell(createTotalValueCell(formatCurrency(invoice.getSubtotal()), normalFont));

        totalsTable.addCell(createTotalLabelCell("Tax (" + formatTaxPercentage(invoice.getTaxPercentage()) + "%)", normalFont));
        totalsTable.addCell(createTotalValueCell(formatCurrency(invoice.getTaxAmount()), normalFont));

        PdfPCell grandTotalLabel = createTotalLabelCell("Grand Total", totalFont);
        grandTotalLabel.setBackgroundColor(new Color(241, 245, 249));

        PdfPCell grandTotalValue = createTotalValueCell(formatCurrency(invoice.getGrandTotal()), totalFont);
        grandTotalValue.setBackgroundColor(new Color(241, 245, 249));

        totalsTable.addCell(grandTotalLabel);
        totalsTable.addCell(grandTotalValue);

        totalsTable.addCell(createTotalLabelCell("Paid Amount", normalFont));
        totalsTable.addCell(createTotalValueCell(formatCurrency(invoice.getPaidAmount()), normalFont));

        totalsTable.addCell(createTotalLabelCell("Balance Amount", normalFont));
        totalsTable.addCell(createTotalValueCell(formatCurrency(invoice.getBalanceAmount()), normalFont));

        totalsTable.addCell(createTotalLabelCell("Payment Status", normalFont));
        totalsTable.addCell(createTotalValueCell(nullSafe(invoice.getPaymentStatus()), normalFont));

        totalCell.addElement(new Paragraph("Billing Summary", headingFont));
        totalCell.addElement(totalsTable);

        bottomTable.addCell(paymentCell);
        bottomTable.addCell(totalCell);

        document.add(bottomTable);
    }

    private PdfPCell createHeaderCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(37, 99, 235));
        cell.setPadding(9);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(new Color(37, 99, 235));
        return cell;
    }

    private PdfPCell createBodyCell(String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(9);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(new Color(226, 232, 240));
        return cell;
    }

    private PdfPCell createBoxCell() {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(12);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setBackgroundColor(new Color(248, 250, 252));
        return cell;
    }

    private PdfPCell createTotalLabelCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setHorizontalAlignment(Element.ALIGN_LEFT);
        return cell;
    }

    private PdfPCell createTotalValueCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(8);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }

    private void addDivider(Document document) throws DocumentException {
        Paragraph divider = new Paragraph(" ");
        divider.setSpacingBefore(8);
        divider.setSpacingAfter(8);
        document.add(divider);

        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setFixedHeight(2);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setBackgroundColor(new Color(37, 99, 235));

        line.addCell(cell);
        document.add(line);
    }

    private void addSpacing(Document document, int height) throws DocumentException {
        Paragraph spacing = new Paragraph(" ");
        spacing.setSpacingBefore(height);
        document.add(spacing);
    }

    private String formatCurrency(Double amount) {
        if (amount == null) {
            return "Rs. 0.00";
        }

        return "Rs. " + String.format("%.2f", amount);
    }

    private String formatTaxPercentage(Double taxPercentage) {
        if (taxPercentage == null) {
            return "0";
        }

        return String.format("%.2f", taxPercentage);
    }

    private String formatDate(Object date) {
        if (date == null) {
            return "-";
        }

        return String.valueOf(date);
    }

    private String nullSafe(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}