package com.example.taxinvoice.service;

import com.example.taxinvoice.entity.*;
import com.example.taxinvoice.repository.InvoiceRepository;
import com.example.taxinvoice.repository.UserRepository;
import org.apache.poi.util.Units;
import org.apache.poi.wp.usermodel.HeaderFooterType;
import org.apache.poi.xwpf.model.XWPFHeaderFooterPolicy;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.*;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final UserRepository userRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, UserRepository userRepository) {
        this.invoiceRepository = invoiceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public File generateWordFileAndSaveToDB(String userEmail, String refNumber, LocalDate date, String toAddress,
                                            String gstNumber, List<InvoiceItemDTO> items,
                                            BigDecimal netTotal, BigDecimal gst, BigDecimal grandTotal,
                                            String amountWords) throws IOException {

        // Fetch the authenticated user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create and save Invoice entity
        Invoice invoice = new Invoice();
        invoice.setRefNo(refNumber);
        invoice.setDate(date);
        invoice.setToAddress(toAddress);
        invoice.setGstNumber(gstNumber);
        invoice.setNetTotal(netTotal);
        invoice.setGst(gst);
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountWords(amountWords);
        invoice.setUser(user);

        // Convert DTOs to InvoiceItem entities
        List<InvoiceItem> invoiceItems = new ArrayList<>();
        for (InvoiceItemDTO itemDto : items) {
            InvoiceItem item = new InvoiceItem();
            item.setDescription(itemDto.getDescription());
            item.setQuantity(itemDto.getQuantity());
            item.setUnitPrice(itemDto.getUnitPrice());
            item.setTotal(itemDto.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
            item.setInvoice(invoice);
            invoiceItems.add(item);
        }
        invoice.setItems(invoiceItems);

        // Save the invoice (which will cascade to items)
        invoice = invoiceRepository.save(invoice);

        // Create "generated" folder if it doesn't exist
        String directoryPath = "generated";
        Files.createDirectories(Paths.get(directoryPath));

        // Define file path
        String fileName = directoryPath + "/Invoice_" + refNumber + "_" + System.currentTimeMillis() + ".docx";

        // Create a new Word document
        XWPFDocument document = new XWPFDocument();

        // Add Full-Width Header and Footer (with increased height)
        addFullWidthHeaderAndFooter(document, "header.png", "footer.png");

        // Add Title
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = title.createRun();
        setFont(titleRun, "Century Gothic", 18, false);
        titleRun.setText("Invoice");

        // Add Order Details
        XWPFParagraph details = document.createParagraph();
        details.setAlignment(ParagraphAlignment.LEFT);

        if (details.getCTP().getPPr() == null) {
            details.getCTP().addNewPPr();
        }

        if (details.getCTP().getPPr().getTabs() == null) {
            details.getCTP().getPPr().addNewTabs();
        }

        org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTabStop tabStop =
                details.getCTP().getPPr().getTabs().addNewTab();
        tabStop.setVal(org.openxmlformats.schemas.wordprocessingml.x2006.main.STTabJc.RIGHT);
        tabStop.setPos(9000);

        XWPFRun detailsRun = details.createRun();
        setFont(detailsRun, "Century Gothic", 11, false);

        detailsRun.setText("Date: " + date.toString());
        detailsRun.addTab();
        detailsRun.setText("Ref No: " + refNumber);
        detailsRun.addBreak();
        detailsRun.setText("To: " + toAddress);
        detailsRun.addBreak();
        detailsRun.setText("GST: " + gstNumber);
        detailsRun.addBreak();
        detailsRun.addBreak();

        // Create a table with borders
        XWPFTable table = document.createTable();
        setTableBorders(table);
        table.setWidth("100%");

        // Create table headers
        XWPFTableRow headerRow = table.getRow(0);
        createTableCell(headerRow.getCell(0), "Description of Sevices", true, 5000);
        createTableCell(headerRow.addNewTableCell(), "Qty", true, 1500);
        createTableCell(headerRow.addNewTableCell(), "Price (INR) Per Sample", true, 2500);

        // Populate table with data
        for (InvoiceItemDTO item : items) {
            XWPFTableRow row = table.createRow();
            createTableCell(row.getCell(0), item.getDescription(), false, 5000);
            createTableCell(row.getCell(1), String.valueOf(item.getQuantity()), false, 1500);
            createTableCell(row.getCell(2), formatCurrency(item.getUnitPrice()), false, 2500);
        }

        // Add Net Total, GST, Grand Total in Table Rows
        XWPFTableRow netTotalRow = table.createRow();
        createTableCell(netTotalRow.getCell(0), "Net Total", true, 5000);
        createTableCell(netTotalRow.getCell(2), formatCurrency(netTotal), false, 2500);

        XWPFTableRow gstRow = table.createRow();
        createTableCell(gstRow.getCell(0), "GST (18%)", true, 5000);
        createTableCell(gstRow.getCell(2), formatCurrency(gst), false, 2500);

        XWPFTableRow grandTotalRow = table.createRow();
        createTableCell(grandTotalRow.getCell(0), "Grand Total", true, 5000);
        createTableCell(grandTotalRow.getCell(2), formatCurrency(grandTotal), false, 2500);

        for (XWPFTableRow row : table.getRows()) {
            for (XWPFTableCell cell : row.getTableCells()) {
                cell.setWidth("auto");
            }
        }

        XWPFParagraph amountWordsParagraph = document.createParagraph();
        amountWordsParagraph.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun amountWordsRun = amountWordsParagraph.createRun();
        setFont(amountWordsRun, "Century Gothic", 11, false);
        amountWordsRun.setText("Amount (Words): Rupees " + amountWords + " Only");
        amountWordsRun.addBreak();
        amountWordsRun.addBreak();

        XWPFParagraph staticDetails = document.createParagraph();
        staticDetails.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun staticRun = staticDetails.createRun();
        setFont(staticRun, "Century Gothic", 11, false);

        XWPFParagraph para3 = document.createParagraph();
        para3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun staticRun3 = para3.createRun();
        setFont(staticRun3, "Century Gothic", 15, false);
        staticRun3.setBold(true);
        staticRun3.setFontSize(15);
        XWPFParagraph para3Content = document.createParagraph();
        XWPFRun normalRun3 = para3Content.createRun();
        setFont(normalRun3, "Century Gothic", 9, false);

        staticRun.setText("SAC: 3821");
        staticRun.addBreak();
        staticRun.setText("GSTIN: 29AALCM9252C1Z7");
        staticRun.addBreak();
        staticRun.addBreak();

        staticRun3.setText("Terms & Conditions:");
        staticRun3.addBreak();

        String[] terms = {
                "1) 100% payment along with Raw data and Purchase Order.",
                "2) The payment shall be through cheque/Draft in favor of 'Molsys Private Limited' or to the account through NEFT/RTGS/IMPS:",
                "   Bank Name: ICICI, Sahakarnagar branch",
                "   A/c Name: Molsys Private Limited",
                "   A/c No.: 060405002959 (Current A/c)",
                "   IFSC: ICIC0000604",
                "   GSTIN: 29AALCM9252C1Z7",
                "   SWIFT CODE: ICICINBBCTS",
                "3) No other bank charge should be deducted from the total amount.",
                "4) If payment is not received by the due date, interest shall accrue on all unpaid amounts at the rate of 1.5% per month.",
                "5) Please include your invoice number with your payment.",
                "6) Data storage is a chargeable service. Kindly note delayed payments will incur additional storage charges as per the company's policy",
        };
        for (String term : terms) {
            normalRun3.setText(term);
            normalRun3.addBreak();
        }

        // Add Signature block
        XWPFParagraph signature = document.createParagraph();
        signature.setAlignment(ParagraphAlignment.LEFT);

        try {
            InputStream sigImageStream = getClass().getClassLoader().getResourceAsStream("sign.png");
            if (sigImageStream == null) {
                throw new FileNotFoundException("Signature image not found in resources!");
            }
            XWPFRun imageRun = signature.createRun();
            imageRun.addPicture(sigImageStream, Document.PICTURE_TYPE_PNG, "sign.png", Units.toEMU(100), Units.toEMU(50));
            sigImageStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        XWPFRun signatureRun = signature.createRun();
        setFont(signatureRun, "Century Gothic", 11, true);
        signatureRun.addBreak();
        signatureRun.setText("Yours sincerely,");
        signatureRun.addBreak();
        signatureRun.setText("Authorized Signature,");
        signatureRun.addBreak();
        signatureRun.setText("Molsys Pvt. Ltd.");
        signatureRun.addBreak();
        signatureRun.setText("Yelahanka, Bangalore-65");

        // Save the document
        File outputFile = new File(fileName);
        FileOutputStream fos = new FileOutputStream(outputFile);
        document.write(fos);
        fos.close();
        document.close();

        return outputFile;
    }

    private void setTableBorders(XWPFTable table) {
        table.setInsideHBorder(XWPFTable.XWPFBorderType.SINGLE, 4, 0, "000000");
        table.setInsideVBorder(XWPFTable.XWPFBorderType.SINGLE, 4, 0, "000000");
        table.setBottomBorder(XWPFTable.XWPFBorderType.SINGLE, 4, 0, "000000");
        table.setTopBorder(XWPFTable.XWPFBorderType.SINGLE, 4, 0, "000000");
        table.setLeftBorder(XWPFTable.XWPFBorderType.SINGLE, 4, 0, "000000");
        table.setRightBorder(XWPFTable.XWPFBorderType.SINGLE, 4, 0, "000000");

        for (XWPFTableRow row : table.getRows()) {
            for (XWPFTableCell cell : row.getTableCells()) {
                addBordersToCell(cell);
            }
        }
    }

    private void addBordersToCell(XWPFTableCell cell) {
        CTTcBorders borders = cell.getCTTc().addNewTcPr().addNewTcBorders();
        borders.addNewTop().setVal(STBorder.SINGLE);
        borders.addNewBottom().setVal(STBorder.SINGLE);
        borders.addNewLeft().setVal(STBorder.SINGLE);
        borders.addNewRight().setVal(STBorder.SINGLE);
    }

    private void addFullWidthHeaderAndFooter(XWPFDocument document, String headerImagePath, String footerImagePath) throws IOException {
        XWPFHeaderFooterPolicy policy = document.createHeaderFooterPolicy();

        XWPFHeader header = policy.createHeader(XWPFHeaderFooterPolicy.DEFAULT);
        addFullWidthImage(header, headerImagePath, 80);

        XWPFFooter footer = policy.createFooter(XWPFHeaderFooterPolicy.DEFAULT);
        addFullWidthImage(footer, footerImagePath, 80);

        addPageNumber(document);
    }

    private void addFullWidthImage(XWPFHeaderFooter headerFooter, String imagePath, int height) throws IOException {
        XWPFTable table = headerFooter.createTable(1, 1);
        table.setWidth("100%");
        XWPFTableCell cell = table.getRow(0).getCell(0);
        XWPFParagraph paragraph = cell.addParagraph();
        paragraph.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun run = paragraph.createRun();
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(imagePath)) {
            if (inputStream != null) {
                run.addPicture(inputStream, Document.PICTURE_TYPE_PNG, imagePath, Units.toEMU(500), Units.toEMU(60));
            } else {
                System.out.println("Image not found: " + imagePath);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createTableCell(XWPFTableCell cell, String text, boolean isHeader, int width) {
        cell.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(width));
        XWPFParagraph paragraph = cell.addParagraph();
        paragraph.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun run = paragraph.createRun();
        setFont(run, "Century Gothic", 11, isHeader);
        run.setText(text);
    }

    private void setFont(XWPFRun run, String font, int size, boolean bold) {
        run.setFontFamily(font);
        run.setFontSize(size);
        run.setBold(bold);
    }

    private String formatCurrency(BigDecimal value) {
        return NumberFormat.getCurrencyInstance(new Locale("en", "IN")).format(value);
    }

    private void addPageNumber(XWPFDocument document) {
        XWPFFooter footer = document.createFooter(HeaderFooterType.DEFAULT);
        XWPFParagraph paragraph = footer.createParagraph();
        paragraph.setAlignment(ParagraphAlignment.CENTER);

        CTP ctp = paragraph.getCTP();

        XWPFRun run1 = paragraph.createRun();
        run1.setFontSize(9);
        run1.setFontFamily("Century Gothic");
        run1.setText("Page ");

        CTSimpleField pageNumberField = ctp.addNewFldSimple();
        pageNumberField.setInstr("PAGE \\* MERGEFORMAT");
        pageNumberField.setDirty(true);

        XWPFRun run2 = paragraph.createRun();
        run2.setFontSize(9);
        run2.setFontFamily("Century Gothic");
        run2.setText(" of ");

        CTSimpleField totalPagesField = ctp.addNewFldSimple();
        totalPagesField.setInstr("NUMPAGES \\* MERGEFORMAT");
        totalPagesField.setDirty(true);
    }


    public File generatePdfFile(InvoiceRequestDTO requestDTO) throws IOException {
        // Similar to generateWordFile but create PDF using libraries like Apache PDFBox or iText
        // Implement PDF generation logic here
        return null;
    }
}
