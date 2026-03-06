package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.Entity.Course;
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
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
        return localCourseList;
    }

    public UploadResponse processCourseExcelFile(MultipartFile file, boolean save) {
        List<Course> correctCourses = new ArrayList<>();
        List<Pair<Course, List<String>>> faultyCourses = new ArrayList<>();

        Set<String> courseCodes = new HashSet<>();
        Set<String> courseTitles = new HashSet<>();

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
                Cell cell = row.getCell(0);

                if (cell != null) {
                    String courseCode = formatter.formatCellValue(cell).trim();
                    int colIndex = cell.getColumnIndex() + 1;

                    if (!courseCode.isEmpty()) {
                        if (!courseCodes.add(courseCode)) {
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
                Cell cell1 = row.getCell(1);
                if (cell1 != null) {
                    String courseTitle = formatter.formatCellValue(cell1).trim();
                    int colIndex1 = cell1.getColumnIndex() + 1;

                    if (!courseTitle.isEmpty()) {
                        if (courseTitles.add(courseTitle)) {
                            course.setCourseTitle(courseTitle);
                        } else {
                            faults.add("Duplicate Course Title found at Row -> "
                                    + (row.getRowNum() + 1)
                                    + " and Col -> "
                                    + colIndex1);
                        }

                    } else {
                        faults.add("Course Title is empty at Row -> "
                                + (row.getRowNum() + 1)
                                + " and Col -> "
                                + colIndex1);
                    }

                } else {
                    faults.add("Course Title is empty at Row -> " + (row.getRowNum() + 1));
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

                // Credit
                try {
                    String creditStr = formatter.formatCellValue(row.getCell(5));
                    if (!creditStr.isEmpty()) {
                        double credit = Double.parseDouble(creditStr);
                        if (credit <= 4) {
                            course.setCredit(creditStr);
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
                String courseType = formatter.formatCellValue(row.getCell(6));
                if (courseType.equals("CR") || courseType.equals("DE") || courseType.equals("OM")
                        || courseType.equals("OE")
                        || courseType.equals("PW") || courseType.equals("DM") || courseType.equals("HC")
                        || courseType.equals("PE")
                        || courseType.equals("HE") || courseType.equals("SP")) {
                    course.setCourseType(courseType);
                } else {
                    faults.add("Course Type is Invalid!!");
                }

                // Domain
                String domain = formatter.formatCellValue(row.getCell(7));
                if (!domain.equals("")) {
                    course.setDomain(domain);
                } else {
                    faults.add("Domain is empty!!");
                }

                // Remarks
                course.setRemarks(formatter.formatCellValue(row.getCell(8)));

                // Course Nature
                String nature = formatter.formatCellValue(row.getCell(9));
                if (nature.equals("L") || nature.equals("P") || nature.equals("B")
                        || nature.equals("T") || nature.equals("C")) {
                    course.setCourseNature(nature.charAt(0));
                } else {
                    faults.add("Nature is Invalid!!");
                }

                if (faults.isEmpty()) {
                    correctCourses.add(course);
                } else {
                    faultyCourses.add(Pair.of(course, faults));
                }
            }

            if (save) {
                correctCourses.forEach(course -> {
                    if (course.getStatus().contains("OK") || course.getStatus().contains("PENDING")) {
                        courseRepository.save(course);
                    }
                });
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
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
    }

    private void fillCourseRow(Row row, Course course, String status) {
        row.createCell(0).setCellValue(course.getCourseCode() != null ? course.getCourseCode() : "");
        row.createCell(1).setCellValue(course.getCourseTitle() != null ? course.getCourseTitle() : "");
        row.createCell(2).setCellValue(course.getL() != null ? String.valueOf(course.getL()) : "");
        row.createCell(3).setCellValue(course.getT() != null ? String.valueOf(course.getT()) : "");
        row.createCell(4).setCellValue(course.getP() != null ? String.valueOf(course.getP()) : "");
        row.createCell(5).setCellValue(course.getCredit() != null ? course.getCredit() : "");
        row.createCell(6).setCellValue(course.getCourseType() != null ? course.getCourseType() : "");
        row.createCell(7).setCellValue(course.getDomain() != null ? course.getDomain() : "");
        row.createCell(8).setCellValue(course.getRemarks() != null ? course.getRemarks() : "");
        row.createCell(9)
                .setCellValue(course.getCourseNature() != null ? String.valueOf(course.getCourseNature()) : "");
        row.createCell(10).setCellValue(status);
    }
}
