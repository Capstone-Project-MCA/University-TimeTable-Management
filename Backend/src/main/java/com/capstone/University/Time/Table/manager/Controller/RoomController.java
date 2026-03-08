package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.RoomDto;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Room;
import com.capstone.University.Time.Table.manager.Service.RoomService;
import com.capstone.University.Time.Table.manager.Service.UploadRoomFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/room")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @Autowired
    private UploadRoomFileService uploadRoomFileService;

    // ========================================= File Upload Endpoints
    // ================================================

    @GetMapping("/read")
    public ResponseEntity<List<Room>> readRoomExcelFile(@RequestParam("file") MultipartFile file) {
        List<Room> rooms = uploadRoomFileService.readRoomExcelFile(file);
        return ResponseEntity.ok(rooms);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadRoomFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse response = uploadRoomFileService.processRoomExcelFile(file, save);
        return ResponseEntity.ok(response);
    }

    // ========================================= CRUD Endpoints
    // =======================================================

    @GetMapping("/all")
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        List<RoomDto> rooms = roomService.getAllRooms();
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomNo}")
    public ResponseEntity<RoomDto> getRoomByRoomNo(@PathVariable String roomNo) {
        RoomDto room = roomService.getRoomByRoomNo(roomNo);
        return ResponseEntity.ok(room);
    }

    @PostMapping("/create")
    public ResponseEntity<RoomDto> createRoom(@RequestBody Room room) {
        RoomDto createdRoom = roomService.createNewRoom(room);
        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }

    @PutMapping("/update/{roomNo}")
    public ResponseEntity<RoomDto> updateRoom(
            @PathVariable String roomNo,
            @RequestBody Room room) {
        RoomDto updatedRoom = roomService.updateRoomByRoomNo(roomNo, room);
        return ResponseEntity.ok(updatedRoom);
    }

    @DeleteMapping("/delete/{roomNo}")
    public ResponseEntity<Void> deleteRoomByRoomNo(@PathVariable String roomNo) {
        roomService.deleteRoomByRoomNo(roomNo);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/all")
    public ResponseEntity<Void> deleteAllRooms() {
        roomService.deleteAllRooms();
        return ResponseEntity.noContent().build();
    }
}
