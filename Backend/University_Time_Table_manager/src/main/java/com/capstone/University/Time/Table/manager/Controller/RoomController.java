package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Room;
import com.capstone.University.Time.Table.manager.Service.UploadRoomFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/room")
@CrossOrigin(origins = "http://localhost:5173")
public class RoomController {

    @Autowired
    private UploadRoomFileService uploadRoomFileService;

    @GetMapping("/read")
    public List<Room> readRoomExcelFile(MultipartFile file) {
        return uploadRoomFileService.readRoomExcelFile(file);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadRoomFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse response = uploadRoomFileService.processRoomExcelFile(file, save);
        return ResponseEntity.ok(response);
    }
}
