package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Section;
import com.capstone.University.Time.Table.manager.Service.SectionService;
import com.capstone.University.Time.Table.manager.Service.UploadSectionFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/section")
@CrossOrigin(origins = "*")
public class SectionController {

    @Autowired
    private SectionService sectionService;

    @Autowired
    private UploadSectionFileService uploadSectionFileService;

// ========================================= File Upload Endpoints ================================================
    @GetMapping("/read")
    public ResponseEntity<List<Section>> readSectionExcelFile(@RequestParam("file") MultipartFile file) {
        List<Section> sections = uploadSectionFileService.readSectionExcelFile(file);
        return ResponseEntity.ok(sections);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadSectionFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse response = uploadSectionFileService.processSectionExcelFile(file, save);
        return ResponseEntity.ok(response);
    }

// ========================================= CRUD Endpoints =======================================================
    @GetMapping("/all")
    public ResponseEntity<List<SectionDto>> getAllSections() {
        List<SectionDto> sections = sectionService.getAllSections();
        return ResponseEntity.ok(sections);
    }

    @GetMapping("/{sectionId}")
    public ResponseEntity<SectionDto> getSectionById(@PathVariable String sectionId) {
        SectionDto section = sectionService.getSectionById(sectionId);
        return ResponseEntity.ok(section);
    }

    @PostMapping("/create")
    public ResponseEntity<SectionDto> createSection(@RequestBody Section section) {
        SectionDto createdSection = sectionService.createSection(section);
        return new ResponseEntity<>(createdSection, HttpStatus.CREATED);
    }

    @PutMapping("/update/{sectionId}")
    public ResponseEntity<SectionDto> updateSection(
            @PathVariable String sectionId,
            @RequestBody Section section) {
        SectionDto updatedSection = sectionService.updateSection(sectionId, section);
        return ResponseEntity.ok(updatedSection);
    }

    @DeleteMapping("/delete/{sectionId}")
    public ResponseEntity<Void> deleteSection(@PathVariable String sectionId) {
        sectionService.deleteSection(sectionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/all")
    public ResponseEntity<Void> deleteAllSections() {
        sectionService.deleteAllSections();
        return ResponseEntity.noContent().build();
    }

}
