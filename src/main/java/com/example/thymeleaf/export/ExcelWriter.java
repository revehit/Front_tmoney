package com.example.thymeleaf.export;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;

import java.io.OutputStream;
import java.util.List;
import java.util.stream.Stream;

public class ExcelWriter {

    public static <T> void write(String sheetName,
                                 List<ExportColumn<T>> columns,
                                 Stream<T> stream,
                                 OutputStream out) throws Exception {
        try (SXSSFWorkbook wb = new SXSSFWorkbook(200)) {
            wb.setCompressTempFiles(true);
            SXSSFSheet sheet = wb.createSheet(sheetName == null ? "Sheet1" : sheetName);
            sheet.createFreezePane(0, 1);

            // 필요한 열만 auto-size 추적
            sheet.trackAllColumnsForAutoSizing();

            // 헤더 스타일
            CellStyle head = wb.createCellStyle();
            Font bold = wb.createFont();
            bold.setBold(true);
            head.setFont(bold);
            head.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            head.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            head.setBorderBottom(BorderStyle.THIN);

            // 헤더
            Row r0 = sheet.createRow(0);
            for (int c = 0; c < columns.size(); c++) {
                Cell cell = r0.createCell(c, CellType.STRING);
                cell.setCellValue(columns.get(c).getHeader());
                cell.setCellStyle(head);
            }

            // 데이터
            final int EXCEL_MAX = 1_048_576;
            int rowIdx = 1, sheetNo = 1;
            try (stream) {
                for (T item : (Iterable<T>) stream::iterator) {
                    Row r = sheet.createRow(rowIdx++);
                    for (int c = 0; c < columns.size(); c++) {
                        Cell cell = r.createCell(c, CellType.STRING);
                        String v = safe(columns.get(c).getExtractor().apply(item));
                        cell.setCellValue(v);
                    }
                    if (rowIdx >= EXCEL_MAX) {
                        sheet = wb.createSheet((sheetName == null ? "Sheet" : sheetName) + "-" + (++sheetNo));
                        sheet.createFreezePane(0, 1);
                        sheet.trackAllColumnsForAutoSizing();
                        r0 = sheet.createRow(0);
                        for (int c = 0; c < columns.size(); c++) {
                            Cell cell = r0.createCell(c, CellType.STRING);
                            cell.setCellValue(columns.get(c).getHeader());
                            cell.setCellStyle(head);
                        }
                        rowIdx = 1;
                    }
                }
            }

            // auto-size (대량이면 일부만)
            int limit = Math.min(columns.size(), 6); // 과다 비용 방지
            for (int c = 0; c < limit; c++) sheet.autoSizeColumn(c);

            wb.write(out);
        }
    }

    private static String safe(String s) {
        if (s == null) return "";
        if (s.isEmpty()) return "";
        char ch = s.charAt(0);
        return (ch == '=' || ch == '+' || ch == '-' || ch == '@') ? "'" + s : s;
    }
}