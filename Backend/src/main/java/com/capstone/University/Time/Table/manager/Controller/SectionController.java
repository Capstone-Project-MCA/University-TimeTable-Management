package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Service.UploadSectionFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.*;

@RestController
@RequestMapping("/section")
@CrossOrigin(origins = "http://localhost:5173")
public class SectionController {
    @Autowired
    private UploadSectionFileService uploadSectionFileService;

    @GetMapping("/read")
    public List<Section> readSectionExcelFile(MultipartFile file) {
        return uploadSectionFileService.readSectionExcelFile(file);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadSectionFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse response = uploadSectionFileService.processSectionExcelFile(file, save);
        return ResponseEntity.ok(response);
    }
}
