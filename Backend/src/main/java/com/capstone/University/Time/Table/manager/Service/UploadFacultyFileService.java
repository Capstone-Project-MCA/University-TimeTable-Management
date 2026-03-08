package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import com.capstone.University.Time.Table.manager.Repository.FacultyRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.ByteArrayOutputStream;
import java.util.*;

@Service
public class UploadFacultyFileService {
    @Autowired
    private FacultyRepository facultyRepository;

    public List<Faculty> readFacultyExcelFile(MultipartFile file){
        List<Faculty> localFacultyList = new ArrayList<>();

        try(Workbook workbook = WorkbookFactory.create(file.getInputStream())){
            DataFormatter formatter = new DataFormatter(); formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);
            int rowIndex = 0;
            for(Row row : sheet){
                if(rowIndex++ == 0)
                    continue;

                if(row == null || row.getCell(0) == null)
                    continue;

                Faculty faculty = new Faculty();
                faculty.setFacultyUID(formatter.formatCellValue(row.getCell(0)).trim());
                localFacultyList.add(faculty);
            }
        }
        catch (Exception e){
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
        return localFacultyList;
    }

    public UploadResponse processFacultyExcelFile(MultipartFile file, boolean save){
        List<Faculty> correctFaculty = new ArrayList<>();
        List<Pair<Faculty, List<String>>> faultyFacultys = new ArrayList<>();

        Set<String> facultyIdsSet = new HashSet<>();
        Set<String> facultyNamesSet = new HashSet<>();

        try(Workbook workbook = WorkbookFactory.create(file.getInputStream())){
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);

            int rowIndex = 0;
            for(Row row : sheet){
                //Skip header row
                if(rowIndex++ == 0) continue;

                if(row == null || row.getCell(0) == null) continue;

                Faculty faculty = new Faculty();
                List<String> faults = new ArrayList<>();

//-------------------------- Faculty UID-----------------------------------
                Cell uid = row.getCell(0);
                if (uid != null) {
                    String value = formatter.formatCellValue(uid).trim();
                    int colIndex = uid.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        try {
                            String facultyId = value;
                            if(facultyIdsSet.add(facultyId)){
                                faculty.setFacultyUID(facultyId);
                            }else{
                                faults.add("Duplicate Faculty UID at Row -> "
                                        + (row.getRowNum() + 1)
                                        + " and Col -> "
                                        + colIndex);
                            }
                        }
                        catch (NumberFormatException e) {
                            faults.add("Invalid Faculty ID at Row -> "
                                    + (row.getRowNum() + 1)
                                    + " and Col -> "
                                    + colIndex);
                        }
                    }
                    else {
                        faults.add("Faculty ID is empty at Row -> "
                                + (row.getRowNum() + 1)
                                + " and Col -> "
                                + colIndex);
                    }

                }
                else {
                    faults.add("Faculty ID is empty at Row -> " + (row.getRowNum() + 1));
                }

//---------------------------- Faculty Name------------------------------------
                Cell name = row.getCell(1);
                if(name != null) {
                    String facultyName = formatter.formatCellValue(name).trim();
                    int colIndex = name.getColumnIndex() + 1;

                    if(!facultyName.isEmpty()) {
                        if(facultyNamesSet.add(facultyName)) {
                            faculty.setFacultyName(facultyName);
                        }
                        else{
                            faults.add("Duplicate Faculty Name at Row -> "
                            + (row.getRowNum() + 1)
                            + " and Col -> "
                            + colIndex);
                        }
                    }
                    else{
                        faults.add("Faculty Name is empty at Row -> "
                        + (row.getRowNum() + 1)
                        + " and Col -> "
                        + colIndex);
                    }
                }
                else{
                    faults.add("Faculty Name is empty at Row -> " + (row.getRowNum() + 1));
                }

//------------------------------ Faculty Domain----------------------------
                Cell domain = row.getCell(2);
                if(domain != null) {
                    String facultyDomain = formatter.formatCellValue(domain).trim();
                    int colIndex = domain.getColumnIndex() + 1;
                    if(!facultyDomain.isEmpty()) {
                        faculty.setFacultyDomain(facultyDomain);
                    }
                    else{
                        faults.add("Faculty Domain is empty at Row -> "
                                + (row.getRowNum() + 1));
                    }
                }
                else{
                    faults.add("Domain is empty at Row -> " + (row.getRowNum() + 1));
                }

                if(faults.isEmpty()){
                    correctFaculty.add(faculty);
                }
                else{
                    faultyFacultys.add(Pair.of(faculty, faults));
                }
            }

            if(save){
                facultyRepository.saveAll(correctFaculty);
            }

            // Generate Output Excel
            Workbook outWorkbook = new XSSFWorkbook();
            Sheet outSheet = outWorkbook.createSheet("Faculties");

            Row headerRow = outSheet.createRow(0);
            String[] columns = {
                    "FacultyUID", "FacultyName", "FacultyDomain",
                    "Current Load", "ExpectedLoad", "Status"
            };

            for(int i = 0; i < columns.length; i++){
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            int outRowIdx = 1;

            // Add correct Courses
            for(Faculty faculty : correctFaculty){
                Row outRow = outSheet.createRow(outRowIdx++);
                fillFacultyRow(outRow, faculty, "OK");
            }

            for(Pair<Faculty, List<String>> pair : faultyFacultys){
                Row outRow = outSheet.createRow(outRowIdx++);
                fillFacultyRow(outRow, pair.getLeft(), String.join(",", pair.getRight()));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            outWorkbook.write(out);
            outWorkbook.close();

            UploadResponse response = new UploadResponse();
            response.setCorrectCount(correctFaculty.size());
            response.setFaultCount(faultyFacultys.size());
            response.setFileData(Base64.getEncoder().encodeToString(out.toByteArray()));

            return response;
        }
        catch (Exception e){
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
    }

    private void fillFacultyRow(Row row, Faculty faculty, String status){
        row.createCell(0).setCellValue(faculty.getFacultyUID() != null ? faculty.getFacultyUID() : "");
        row.createCell(1).setCellValue(faculty.getFacultyName() != null ? faculty.getFacultyName() : "");
        row.createCell(2).setCellValue(faculty.getFacultyDomain() != null ? faculty.getFacultyDomain() : "");
        row.createCell(3).setCellValue(faculty.getCurrentLoad() != null ? faculty.getCurrentLoad().toString() : "");
        row.createCell(4).setCellValue(faculty.getExpectedLoad() != null ? faculty.getExpectedLoad().toString() : "");
        row.createCell(5).setCellValue(status);
    }
}
