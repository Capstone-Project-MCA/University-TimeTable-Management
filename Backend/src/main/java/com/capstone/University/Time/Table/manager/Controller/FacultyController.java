package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.FacultyDto;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import com.capstone.University.Time.Table.manager.Service.FacultyService;
import com.capstone.University.Time.Table.manager.Service.UploadFacultyFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private UploadFacultyFileService uploadFacultyFileService;

// ========================================= File Upload Endpoints ================================================
    @GetMapping("/read")
    public ResponseEntity<List<Faculty>> readFacultyFromFile(@RequestParam("file") MultipartFile file) {
        List<Faculty> faculties = uploadFacultyFileService.readFacultyExcelFile(file);
        return ResponseEntity.ok(faculties);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadFacultyFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse uploadResponse = uploadFacultyFileService.processFacultyExcelFile(file, save);
        return ResponseEntity.ok(uploadResponse);
    }

// ========================================= CRUD Endpoints =======================================================
    @GetMapping("/all")
    public ResponseEntity<List<FacultyDto>> getAllFaculties() {
        List<FacultyDto> faculties = facultyService.getAllFaculties();
        return ResponseEntity.ok(faculties);
    }

    @GetMapping("/uid/{facultyUID}")
    public ResponseEntity<FacultyDto> getFacultyByUID(@PathVariable String facultyUID) {
        FacultyDto faculty = facultyService.getFacultyByUID(facultyUID);
        return ResponseEntity.ok(faculty);
    }

    @GetMapping("/name/{facultyName}")
    public ResponseEntity<FacultyDto> getFacultyByName(@PathVariable String facultyName) {
        FacultyDto faculty = facultyService.getFacultyByFacultyName(facultyName);
        return ResponseEntity.ok(faculty);
    }

    @PostMapping("/create")
    public ResponseEntity<FacultyDto> createFaculty(@RequestBody Faculty faculty) {
        FacultyDto createdFaculty = facultyService.createFaculty(faculty);
        return new ResponseEntity<>(createdFaculty, HttpStatus.CREATED);
    }

    @PutMapping("/update/{facultyUID}")
    public ResponseEntity<FacultyDto> updateFaculty(
            @PathVariable String facultyUID,
            @RequestBody Faculty faculty) {
        FacultyDto updatedFaculty = facultyService.updateFacultyByUID(facultyUID, faculty);
        return ResponseEntity.ok(updatedFaculty);
    }

    @DeleteMapping("/delete/{facultyUID}")
    public ResponseEntity<Void> deleteFacultyByUID(@PathVariable String facultyUID) {
        facultyService.deleteFacultyByUID(facultyUID);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/all")
    public ResponseEntity<Void> deleteAllFaculties() {
        facultyService.deleteAllFaculties();
        return ResponseEntity.noContent().build();
    }
}
