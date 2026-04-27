package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.Entity.Ticket;
import com.capstone.University.Time.Table.manager.Repository.TicketRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class TicketExcelExportService {

    private final TicketRepository ticketRepository;

    @Autowired
    public TicketExcelExportService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    /**
     * Generates an Excel (.xlsx) file containing all ticket data.
     * Row 1 = headers, Row 2 onwards = data.
     */
    public byte[] exportTicketsToExcel() throws IOException {
        List<Ticket> tickets = ticketRepository.findAll();

        try (XSSFWorkbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Tickets");

            // ── Header style ──────────────────────────────────────────────
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // ── Data cell style ───────────────────────────────────────────
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);

            // ── Column headers (must match ticket table as-is) ────────────
            String[] headers = {
                "Ticket ID", "Section", "Course Code", "Group No",
                "Lecture No", "Day", "Time", "Merged Code",
                "Mapping Type", "Faculty UID", "Room No", "Course Mapping ID"
            };

            // Row 0 = header row (1st row in Excel)
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // ── Data rows (from row 1 onward = 2nd row in Excel) ─────────
            int rowIdx = 1;
            for (Ticket ticket : tickets) {
                Row row = sheet.createRow(rowIdx++);

                createCell(row, 0, ticket.getTicketId(), dataStyle);
                createCell(row, 1, ticket.getSection(), dataStyle);
                createCell(row, 2, ticket.getCourseCode(), dataStyle);
                createCell(row, 3, ticket.getGroupNo() != null ? ticket.getGroupNo().toString() : "", dataStyle);
                createCell(row, 4, ticket.getLectureNo() != null ? ticket.getLectureNo().toString() : "", dataStyle);
                createCell(row, 5, ticket.getDay() != null ? ticket.getDay() : "", dataStyle);
                createCell(row, 6, ticket.getTime() != null ? ticket.getTime().toString() : "", dataStyle);
                createCell(row, 7, ticket.getMergedCode() != null ? ticket.getMergedCode() : "", dataStyle);
                createCell(row, 8, ticket.getMappingType() != null ? ticket.getMappingType() : "", dataStyle);
                createCell(row, 9, ticket.getFacultyUid() != null ? ticket.getFacultyUid() : "", dataStyle);
                createCell(row, 10, ticket.getRoomNo() != null ? ticket.getRoomNo() : "", dataStyle);
                createCell(row, 11, ticket.getCourseMappingId() != null ? ticket.getCourseMappingId().toString() : "", dataStyle);
            }

            // Auto-size columns for readability
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }
}
