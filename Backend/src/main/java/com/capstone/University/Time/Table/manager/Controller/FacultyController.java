package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import com.capstone.University.Time.Table.manager.Service.UploadFacultyFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/faculty")
@CrossOrigin(origins = "http://localhost:5173")
public class FacultyController {

    @Autowired
    private UploadFacultyFileService uploadFacultyFileService;

    @GetMapping("/read")
    public List<Faculty> readFacultyFromFile(MultipartFile file) {
        return uploadFacultyFileService.readFacultyExcelFile(file);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFacultyFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save
    ) {
        UploadResponse uploadResponse = uploadFacultyFileService.processFacultyExcelFile(file, save);
        return ResponseEntity.ok(uploadResponse);
    }
}
