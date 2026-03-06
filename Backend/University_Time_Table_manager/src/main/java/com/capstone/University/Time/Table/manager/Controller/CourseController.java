package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Service.UploadCourseFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;

@RestController
@RequestMapping("/course")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    @Autowired
    private UploadCourseFileService uploadFileService;

    @GetMapping("/read")
    public List<Course> readCoursesFromFile(MultipartFile file) throws IOException {
        return uploadFileService.readCourseExcelFile(file);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadCourses(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse response = uploadFileService.processCourseExcelFile(file, save);
        return ResponseEntity.ok(response);
    }
}
