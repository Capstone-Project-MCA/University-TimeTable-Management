package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Exception.FileProcessingException;
import com.capstone.University.Time.Table.manager.Repository.CourseRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.Base64;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;

@Service
public class UploadCourseFileService {
    @Autowired
    private CourseRepository courseRepository;

    public List<Course> readCourseExcelFile(MultipartFile file) {
        List<Course> localCourseList = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);
            int rowIndex = 0;
            for (Row row : sheet) {
                if (rowIndex++ == 0)
                    continue;
                if (row == null || row.getCell(0) == null)
                    continue;
                Course course = new Course();
                course.setCourseCode(formatter.formatCellValue(row.getCell(0)).trim());
                localCourseList.add(course);
            }
        } catch (Exception e) {
            throw new FileProcessingException(
                    "Failed to read the course Excel file. " +
                    "Please ensure the file is a valid .xlsx format and is not corrupted.",
                    e);
        }
        return localCourseList;
    }

    public UploadResponse processCourseExcelFile(MultipartFile file, boolean save) {
        List<Course> correctCourses = new ArrayList<>();
        List<Pair<Course, List<String>>> faultyCourses = new ArrayList<>();

        Set<String> courseCodesSet = new HashSet<>();
        Set<String> courseTitlesSet = new HashSet<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = 0;

            for (Row row : sheet) {
                // Skip header row
                if (rowIndex++ == 0)
                    continue;

                // Skip empty rows
                if (row == null || row.getCell(0) == null)
                    continue;

                Course course = new Course();
                List<String> faults = new ArrayList<>();

                // Course Code
                Cell cellCode = row.getCell(0);

                if (cellCode != null) {
                    String courseCode = formatter.formatCellValue(cellCode).trim();
                    int colIndex = cellCode.getColumnIndex() + 1;

                    if (!courseCode.isEmpty()) {
                        if (!courseCodesSet.add(courseCode)) {
                            faults.add("Duplicate Course code found at Row -> "
                                    + (row.getRowNum() + 1)
                                    + " and Col -> "
                                    + colIndex);
                        } else {
                            course.setCourseCode(courseCode);
                        }
                    } else {
                        faults.add("Course Code is empty at Row -> "
                                + (row.getRowNum() + 1)
                                + " and Col -> "
                                + colIndex);
                    }
                }

                // Course Title
                Cell cellTitle = row.getCell(1);
                if (cellTitle != null) {
                    String courseTitle = formatter.formatCellValue(cellTitle).trim();
                    int colIndex = cellTitle.getColumnIndex() + 1;

                    if (!courseTitle.isEmpty()) {
                        if (courseTitlesSet.add(courseTitle)) {
                            course.setCourseTitle(courseTitle);
                        } else {
                            faults.add("Duplicate Course Title found at Row -> "
                                    + (row.getRowNum() + 1)
                                    + " and Col -> "
                                    + colIndex);
                        }

                    } else {
                        faults.add("Course Title is empty at Row -> "
                                + (row.getRowNum() + 1)
                                + " and Col -> "
                                + colIndex);
                    }

                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // L
                try {
                    String lStr = formatter.formatCellValue(row.getCell(2));
                    if (!lStr.isEmpty()) {
                        short lValue = Short.parseShort(lStr);
                        if (lValue <= 5) {
                            course.setL(lValue);
                        } else {
                            faults.add("L value is above 5!!");
                        }
                    } else {
                        faults.add("L value is empty!!");
                    }
                } catch (NumberFormatException e) {
                    faults.add("L value must be a number!!");
                }

                // T
                try {
                    String tStr = formatter.formatCellValue(row.getCell(3));
                    if (!tStr.isEmpty()) {
                        short tValue = Short.parseShort(tStr);
                        if (tValue <= 5) {
                            course.setT(tValue);
                        } else {
                            faults.add("T value is above 5!!");
                        }
                    } else {
                        faults.add("T value is empty!!");
                    }
                } catch (NumberFormatException e) {
                    faults.add("T value must be a number!!");
                }

                // P
                try {
                    String pStr = formatter.formatCellValue(row.getCell(4));
                    if (!pStr.isEmpty()) {
                        short pValue = Short.parseShort(pStr);
                        if (pValue <= 5) {
                            course.setP(pValue);
                        } else {
                            faults.add("P value is above 5!!");
                        }
                    } else {
                        faults.add("P value is empty!!");
                    }
                } catch (NumberFormatException e) {
                    faults.add("P value must be a number!!");
                }

                try {
                    String creditStr = formatter.formatCellValue(row.getCell(5));
                    if (!creditStr.isEmpty()) {
                        short credit = Short.parseShort(creditStr);
                        if (credit <= 4) {
                            course.setCredit(credit);
                        } else {
                            faults.add("Credit value is above 4!!");
                        }
                    } else {
                        faults.add("Credit value is empty!!");
                    }
                } catch (NumberFormatException e) {
                    faults.add("Credit value must be a number!!");
                }

                // Course Type
                Cell courseTypeCell = row.getCell(6);
                if (courseTypeCell != null) {
                    String courseType = formatter.formatCellValue(courseTypeCell);
                    int colIndex = courseTypeCell.getColumnIndex() + 1;

                    if (!courseType.isEmpty()) {
                        Set<String> allowedTypes = Set.of(
                                "CR", "DE", "OM", "OE", "PW", "DM", "HC", "PE", "HE", "SP");

                        if (allowedTypes.contains(courseType)) {
                            course.setCourseType(courseType);
                        } else {
                            faults.add(
                                    "Invalid Course Type at Row: " + (row.getRowNum() + 1) + " and Col: " + colIndex);
                        }
                    } else {
                        faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                    }
                }

                // Domain
                Cell domainCell = row.getCell(8);
                if (domainCell != null) {
                    String domain = formatter.formatCellValue(domainCell);
                    int colIndex = domainCell.getColumnIndex() + 1;

                    if (!domain.isBlank()) {
                        course.setDomain(domain);
                    } else {
                        faults.add("Domain is empty!! at Row "
                                + (row.getRowNum() + 1) + " and Col: " + colIndex);
                    }
                }

                // Remarks
                course.setRemarks(formatter.formatCellValue(row.getCell(8)));

                // Course Nature
                Cell natureCell = row.getCell(9);
                if (natureCell != null) {
                    String nature = formatter.formatCellValue(natureCell);
                    int colIndex = natureCell.getColumnIndex() + 1;

                    if (!nature.isEmpty()) {
                        Set<String> allowedNature = Set.of("L", "P", "B", "T", "C");

                        if (allowedNature.contains(nature)) {
                            course.setCourseNature(nature.charAt(0));
                        } else {
                            faults.add("Invalid Course Nature at Row: "
                                    + (row.getRowNum() + 1) + " and Col: " + colIndex);
                        }
                    } else {
                        faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                    }
                }

                if (faults.isEmpty()) {
                    correctCourses.add(course);
                } else {
                    faultyCourses.add(Pair.of(course, faults));
                }
            }

            if (save) {
                courseRepository.saveAll(correctCourses);
            }

            // Generate Output Excel
            Workbook outWorkbook = new XSSFWorkbook();
            Sheet outSheet = outWorkbook.createSheet("Courses");

            Row headerRow = outSheet.createRow(0);
            String[] columns = {
                    "CourseCode", "CourseTitle", "L", "T", "P",
                    "Credit", "CourseType", "Domain", "Remarks", "CourseNature", "status"
            };
            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            int outRowIdx = 1;

            // Add correct courses
            for (Course course : correctCourses) {
                Row row = outSheet.createRow(outRowIdx++);
                fillCourseRow(row, course, "OK");
            }

            // Add faulty courses
            for (Pair<Course, List<String>> pair : faultyCourses) {
                Row row = outSheet.createRow(outRowIdx++);
                fillCourseRow(row, pair.getLeft(), String.join(", ", pair.getRight()));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            outWorkbook.write(out);
            outWorkbook.close();

            UploadResponse response = new UploadResponse();
            response.setCorrectCount(correctCourses.size());
            response.setFaultCount(faultyCourses.size());
            response.setFileData(Base64.getEncoder().encodeToString(out.toByteArray()));

            return response;
        } catch (Exception e) {
            throw new FileProcessingException(
                    "Failed to process the course Excel file. " +
                    "Please verify the file format and ensure all required columns " +
                    "(CourseCode, CourseTitle, L, T, P, Credit, CourseType, Domain, CourseNature) " +
                    "are present.",
                    e);
        }
    }

    private void fillCourseRow(Row row, Course course, String status) {
        row.createCell(0).setCellValue(course.getCourseCode() != null ? course.getCourseCode() : "");
        row.createCell(1).setCellValue(course.getCourseTitle() != null ? course.getCourseTitle() : "");
        row.createCell(2).setCellValue(course.getL() != null ? String.valueOf(course.getL()) : "");
        row.createCell(3).setCellValue(course.getT() != null ? String.valueOf(course.getT()) : "");
        row.createCell(4).setCellValue(course.getP() != null ? String.valueOf(course.getP()) : "");
        row.createCell(5).setCellValue(course.getCredit() != null ? String.valueOf(course.getCredit()) : "");
        row.createCell(6).setCellValue(course.getCourseType() != null ? course.getCourseType() : "");
        row.createCell(7).setCellValue(course.getDomain() != null ? course.getDomain() : "");
        row.createCell(8).setCellValue(course.getRemarks() != null ? course.getRemarks() : "");
        row.createCell(9)
                .setCellValue(course.getCourseNature() != null ? String.valueOf(course.getCourseNature()) : "");
        row.createCell(10).setCellValue(status);
    }
}
