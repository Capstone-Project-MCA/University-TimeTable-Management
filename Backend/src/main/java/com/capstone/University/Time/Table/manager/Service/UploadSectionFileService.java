package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Exception.FileProcessingException;
import com.capstone.University.Time.Table.manager.Repository.SectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayOutputStream;
import java.util.*;
import java.util.Base64;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;

@Service
public class UploadSectionFileService {

    @Autowired
    private SectionRepository sectionRepository;

    public List<Section> readSectionExcelFile(MultipartFile file) {
        List<Section> localSectionList = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = 0;
            for (Row row : sheet) {
                if (rowIndex++ == 0)
                    continue;

                if (row == null || row.getCell(0) == null)
                    continue;

                Section section = new Section();
                section.setSectionId(formatter.formatCellValue(row.getCell(0)).trim());
                localSectionList.add(section);
            }
        } catch (Exception e) {
            throw new FileProcessingException(
                    "Failed to read the section Excel file. Please ensure the file is a valid .xlsx format and is not corrupted.",
                    e);
        }
        return localSectionList;
    }

    public UploadResponse processSectionExcelFile(MultipartFile file, boolean save) {
        List<Section> correctSectionList = new ArrayList<>();
        List<Pair<Section, List<String>>> faultySections = new ArrayList<>();

        Set<String> sectionIdsSet = new HashSet<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = 0;

            for (Row row : sheet) {
                if (rowIndex++ == 0)
                    continue;
                if (row == null || row.getCell(0) == null)
                    continue;

                Section section = new Section();
                List<String> faults = new ArrayList<>();

                // ------------------------------ Section
                // ID-------------------------------------
                Cell idCell = row.getCell(0);
                if (idCell != null) {
                    String value = formatter.formatCellValue(idCell).trim();
                    int colIndex = idCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        String sectionId = value;

                        if (sectionIdsSet.add(sectionId)) {
                            section.setSectionId(sectionId);
                        } else {
                            faults.add("Duplicate Section ID at Row "
                                    + (row.getRowNum() + 1)
                                    + " and Column "
                                    + colIndex);
                        }
                    } else {
                        faults.add("Section ID is empty!! at Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty!!");
                }

                // ----------------------------Section
                // Strength-------------------------------------
                Cell strengthCell = row.getCell(1);
                if (strengthCell != null) {
                    String value = formatter.formatCellValue(strengthCell).trim();
                    int colIndex = strengthCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        try {
                            section.setStrength(Short.parseShort(value));
                        } catch (NumberFormatException e) {
                            faults.add("Invalid Strength at Row "
                                    + (row.getRowNum() + 1)
                                    + " and Column "
                                    + colIndex);
                        }
                    } else {
                        faults.add("Section Strength is empty!! at Row "
                                + (rowIndex + 1) + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // ---------------------------------Number of
                // Groups--------------------------------
                Cell numberOfGroupsCell = row.getCell(2);
                if (numberOfGroupsCell != null) {
                    String value = formatter.formatCellValue(numberOfGroupsCell).trim();
                    int colIndex = numberOfGroupsCell.getColumnIndex() + 1;

                    try {
                        section.setNumberOfGroups(Short.parseShort(value));
                    } catch (NumberFormatException e) {
                        faults.add("Invalid NumberOfGroups at Row "
                                + (row.getRowNum() + 1)
                                + " and Column "
                                + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }
                // ---------------------------------Programme
                // Name----------------------------------
                Cell programmeNameCell = row.getCell(3);
                if (programmeNameCell != null) {
                    String value = formatter.formatCellValue(programmeNameCell).trim();
                    int colIndex = programmeNameCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        section.setProgramName(value);
                    } else {
                        faults.add("Programme Name is empty!! at Row "
                                + (row.getRowNum() + 1) + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // ---------------------------------Semester-----------------------------------------
                Cell semesterCell = row.getCell(4);
                if (semesterCell != null) {
                    String value = formatter.formatCellValue(semesterCell).trim();
                    int colIndex = semesterCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        int sem = Integer.parseInt(value);
                        if (sem < 1 || sem > 8) {
                            faults.add("Invalid semester at Row " + (row.getRowNum() + 1));
                        } else {
                            section.setSemester((short) sem);
                        }
                    } else {
                        faults.add("Semester is empty!! at Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // -----------------------------------Batch-----------------------------------------
                Cell batchCell = row.getCell(5);
                if (batchCell != null) {
                    String value = formatter.formatCellValue(batchCell).trim();
                    int colIndex = batchCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        try {
                            section.setBatch(Short.parseShort(value));
                        } catch (NumberFormatException e) {
                            faults.add("Invalid Batch at Row "
                                    + (row.getRowNum() + 1)
                                    + " and Column "
                                    + colIndex);
                        }
                    } else {
                        faults.add("Batch is empty!! at Row "
                                + row.getRowNum() + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // --------------------------------Programme
                // Type----------------------------------
                Cell programmeTypeCell = row.getCell(6);
                if (programmeTypeCell != null) {
                    String value = formatter.formatCellValue(programmeTypeCell).trim();
                    int colIndex = programmeTypeCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        try {
                            section.setProgramType(Short.parseShort(value));
                        } catch (NumberFormatException e) {
                            faults.add("Invalid ProgramType at Row "
                                    + (row.getRowNum() + 1)
                                    + " and Column "
                                    + colIndex);
                        }
                    } else {
                        faults.add("Programme Type is empty!! at Row "
                                + row.getRowNum() + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // --------------------------------Programme
                // Duration--------------------------------
                Cell programmeDurationType = row.getCell(7);
                if (programmeDurationType != null) {
                    String value = formatter.formatCellValue(programmeDurationType).trim();
                    int colIndex = programmeDurationType.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        try {
                            section.setProgramDuration(Double.parseDouble(value));
                        } catch (NumberFormatException e) {
                            faults.add("Invalid ProgramDuration at Row "
                                    + (row.getRowNum() + 1)
                                    + " and Column "
                                    + colIndex);
                        }
                    } else {
                        faults.add("Programme Duration is empty!! at Row "
                                + row.getRowNum() + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                // ---------------------------------Programme
                // Code-----------------------------------
                Cell programmeCode = row.getCell(8);
                if (programmeCode != null) {
                    String value = formatter.formatCellValue(programmeCode).trim();
                    int colIndex = programmeCode.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        section.setProgramCode(value);
                    } else {
                        faults.add("Programme Code is empty!! at Row "
                                + row.getRowNum() + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty OR null -> " + (row.getRowNum() + 1));
                }

                if (faults.isEmpty()) {
                    correctSectionList.add(section);
                } else {
                    faultySections.add(Pair.of(section, faults));
                }
            }

            if (save) {
                sectionRepository.saveAll(correctSectionList);
            }

            Workbook outWorkbook = new XSSFWorkbook();
            Sheet outSheet = outWorkbook.createSheet("Sections");

            Row headerRow = outSheet.createRow(0);
            String[] columns = {
                    "sectionId", "Strength", "NumberOfGroups", "ProgrammeName",
                    "Semester", "Batch", "Programme Type", "Programme Duration",
                    "Programme Code", "status"
            };

            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            int outRowIdx = 1;

            for (Section section : correctSectionList) {
                Row row = outSheet.createRow(outRowIdx++);
                fillSectionRow(row, section, "OK");
            }

            for (Pair<Section, List<String>> pair : faultySections) {
                Row row = outSheet.createRow(outRowIdx++);
                fillSectionRow(row, pair.getLeft(), String.join(", ", pair.getRight()));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            outWorkbook.write(out);
            outWorkbook.close();

            UploadResponse response = new UploadResponse();
            response.setCorrectCount(correctSectionList.size());
            response.setFaultCount(faultySections.size());
            response.setFileData(Base64.getEncoder().encodeToString(out.toByteArray()));

            return response;
        } catch (Exception e) {
            throw new FileProcessingException(
                    "Failed to process the section Excel file. Please verify the file format and ensure all required columns (SectionId, Strength, NumberOfGroups, ProgrammeName, Semester, Batch, ProgrammeType, ProgrammeDuration, ProgrammeCode) are present.",
                    e);
        }
    }

    private void fillSectionRow(Row row, Section section, String status) {
        row.createCell(0).setCellValue(section.getSectionId() != null ? section.getSectionId() : "");
        row.createCell(1).setCellValue(section.getStrength() != null ? String.valueOf(section.getStrength()) : "");
        row.createCell(2)
                .setCellValue(section.getNumberOfGroups() != null ? String.valueOf(section.getNumberOfGroups()) : "");
        row.createCell(3)
                .setCellValue(section.getProgramName() != null ? String.valueOf(section.getProgramName()) : "");
        row.createCell(4).setCellValue(section.getSemester() != null ? String.valueOf(section.getSemester()) : "");
        row.createCell(5).setCellValue(section.getBatch() != null ? String.valueOf(section.getBatch()) : "");
        row.createCell(6)
                .setCellValue(section.getProgramType() != null ? String.valueOf(section.getProgramType()) : "");
        row.createCell(7)
                .setCellValue(section.getProgramDuration() != null ? String.valueOf(section.getProgramDuration()) : "");
        row.createCell(8).setCellValue(section.getProgramCode() != null ? section.getProgramCode() : "");
        row.createCell(9).setCellValue(status);
    }
}
