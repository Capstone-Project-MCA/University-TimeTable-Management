package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.DTO.UploadResponse;
import com.capstone.University.Time.Table.manager.Entity.Course;
import com.capstone.University.Time.Table.manager.Service.CourseService;
import com.capstone.University.Time.Table.manager.Service.UploadCourseFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/course")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UploadCourseFileService uploadFileService;

// ========================================= File Upload Endpoints ================================================
    @GetMapping("/read")
    public ResponseEntity<List<Course>> readCoursesFromFile(@RequestParam("file") MultipartFile file) {
        List<Course> courses = uploadFileService.readCourseExcelFile(file);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponse> uploadCourses(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "save", defaultValue = "false") boolean save) {
        UploadResponse response = uploadFileService.processCourseExcelFile(file, save);
        return ResponseEntity.ok(response);
    }

// ========================================= CRUD Endpoints =======================================================
    @GetMapping("/all")
    public ResponseEntity<List<CourseDto>> getAllCourses() {
        List<CourseDto> courses = courseService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/code/{courseCode}")
    public ResponseEntity<CourseDto> getCourseByCourseCode(@PathVariable String courseCode) {
        CourseDto course = courseService.getCourseByCourseCode(courseCode);
        return ResponseEntity.ok(course);
    }

    @GetMapping("/title/{courseTitle}")
    public ResponseEntity<CourseDto> getCourseByCourseTitle(@PathVariable String courseTitle) {
        CourseDto course = courseService.getCourseByCourseTitle(courseTitle);
        return ResponseEntity.ok(course);
    }

    @PostMapping("/create")
    public ResponseEntity<CourseDto> createCourse(@RequestBody Course course) {
        CourseDto createdCourse = courseService.createNewCourse(course);
        return new ResponseEntity<>(createdCourse, HttpStatus.CREATED);
    }

    @PutMapping("/update/{courseCode}")
    public ResponseEntity<CourseDto> updateCourse(
            @PathVariable String courseCode,
            @RequestBody Course course) {
        CourseDto updatedCourse = courseService.updateCourseByUID(courseCode, course);
        return ResponseEntity.ok(updatedCourse);
    }

    @DeleteMapping("/delete/code/{courseCode}")
    public ResponseEntity<Void> deleteCourseByCourseCode(@PathVariable String courseCode) {
        courseService.deleteCourseByCourseCode(courseCode);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/title/{courseTitle}")
    public ResponseEntity<Void> deleteCourseByCourseTitle(@PathVariable String courseTitle) {
        courseService.deleteCourseByCourseTitle(courseTitle);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/all")
    public ResponseEntity<Void> deleteAllCourses() {
        courseService.deleteAllCourses();
        return ResponseEntity.noContent().build();
    }
}
