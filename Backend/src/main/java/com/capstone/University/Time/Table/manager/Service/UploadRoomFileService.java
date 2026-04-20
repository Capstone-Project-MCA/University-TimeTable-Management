package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Room;
import com.capstone.University.Time.Table.manager.Exception.FileProcessingException;
import com.capstone.University.Time.Table.manager.Repository.RoomRepository;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.*;

@Service
public class UploadRoomFileService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> readRoomExcelFile(MultipartFile file) {
        List<Room> localRoomList = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() <= 1)
                    continue;

                if (row == null || row.getCell(0) == null)
                    continue;
                Room room = new Room();
                room.setRoomNo(formatter.formatCellValue(row.getCell(0)));
                localRoomList.add(room);
            }
        } catch (Exception e) {
            throw new FileProcessingException(
                    "Failed to read the room Excel file. Please ensure the file is a valid .xlsx format and is not corrupted.",
                    e);
        }
        return localRoomList;
    }

    public UploadResponse processRoomExcelFile(MultipartFile file, boolean save) {
        List<Room> correctRoomList = new ArrayList<>();
        List<Pair<Room, List<String>>> faultyRooms = new ArrayList<>();

        Set<String> roomNumbersSet = new HashSet<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            DataFormatter formatter = new DataFormatter();
            Sheet sheet = workbook.getSheetAt(0);

            for (Row row : sheet) {
                if (row.getRowNum() <= 1)
                    continue;
                if (row == null || row.getCell(0) == null)
                    continue;

                Room room = new Room();
                List<String> faults = new ArrayList<>();

                // ----------------------------------Room
                // Number-----------------------------------
                Cell roomNumberCell = row.getCell(0);
                if (roomNumberCell != null) {
                    String value = formatter.formatCellValue(roomNumberCell);
                    int colIndex = roomNumberCell.getColumnIndex() + 1;

                    if (!value.isEmpty()) {
                        if (roomNumbersSet.add(value)) {
                            room.setRoomNo(value);
                        } else {
                            faults.add("Duplicate room number at Row "
                                    + (row.getRowNum() + 1)
                                    + " and Column " + colIndex);
                        }
                    } else {
                        faults.add("Room number is empty!! at Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty!!");
                }

                // ---------------------------------Seating
                // Capacity--------------------------------
                Cell seatingCell = row.getCell(1);
                if (seatingCell != null) {
                    String value = formatter.formatCellValue(seatingCell);
                    int colIndex = seatingCell.getColumnIndex() + 1;

                    try {
                        room.setSeatingCapacity(Short.parseShort(value));
                    } catch (NumberFormatException e) {
                        faults.add("Invalid seating capacity at Row "
                                + (row.getRowNum() + 1)
                                + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty!!");
                }

                // ---------------------------------Room
                // type--------------------------------------------
                Cell roomTypeCell = row.getCell(2);
                if (roomTypeCell != null) {
                    String value = formatter.formatCellValue(roomTypeCell);
                    int colIndex = roomTypeCell.getColumnIndex() + 1;

                    try {
                        room.setRoomType(Short.parseShort(value));
                    } catch (NumberFormatException e) {
                        faults.add("Invalid Room Type at Row "
                                + (row.getRowNum() + 1)
                                + " and Column " + colIndex);
                    }
                } else {
                    faults.add("Cell is empty!!");
                }

                // -----------------------------------Level------------------------------------------
                Cell levelCell = row.getCell(3);
                if (levelCell != null) {
                    String value = formatter.formatCellValue(levelCell);
                    int colIndex = levelCell.getColumnIndex() + 1;

                    try {
                        room.setLevel(Short.parseShort(value));
                    } catch (NumberFormatException e) {
                        faults.add("Invalid Level at Row "
                                + (row.getRowNum() + 1)
                                + " and Column " + colIndex);
                    }
                }

                if (faults.isEmpty()) {
                    correctRoomList.add(room);
                } else {
                    faultyRooms.add(Pair.of(room, faults));
                }
            }

            if (save) {
                roomRepository.saveAll(correctRoomList);
            }

            Workbook outWorkbook = new XSSFWorkbook();
            Sheet outSheet = outWorkbook.createSheet("Rooms");

            Row headerRow = outSheet.createRow(0);
            String[] columns = {
                    "Room No", "Seating capacity", "Room type", "Level", "status"
            };

            for (int i = 0; i < columns.length; i++) {
                headerRow.createCell(i).setCellValue(columns[i]);
            }

            int outRowIdx = 1;

            for (Room room : correctRoomList) {
                Row row = outSheet.createRow(outRowIdx++);
                fillRoomRow(row, room, "OK");
            }

            for (Pair<Room, List<String>> pair : faultyRooms) {
                Row row = outSheet.createRow(outRowIdx++);
                fillRoomRow(row, pair.getLeft(), String.join(", ", pair.getRight()));
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            outWorkbook.write(out);
            outWorkbook.close();

            UploadResponse response = new UploadResponse();
            response.setCorrectCount(correctRoomList.size());
            response.setFaultCount(faultyRooms.size());
            response.setFileData(Base64.getEncoder().encodeToString(out.toByteArray()));

            return response;
        } catch (Exception e) {
            throw new FileProcessingException(
                    "Failed to process the room Excel file. Please verify the file format and ensure all required columns (RoomNo, SeatingCapacity, RoomType, Level) are present.",
                    e);
        }
    }

    private void fillRoomRow(Row row, Room room, String status) {
        row.createCell(0).setCellValue(room.getRoomNo() != null ? room.getRoomNo() : "");
        row.createCell(1).setCellValue(room.getSeatingCapacity() != null ? room.getSeatingCapacity().toString() : "");
        row.createCell(2).setCellValue(room.getRoomType() != null ? room.getRoomType().toString() : "");
        row.createCell(3).setCellValue(room.getLevel() != null ? room.getLevel().toString() : "");
        row.createCell(4).setCellValue(status);
    }
}
