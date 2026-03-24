package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.Service.CourseMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/mappings")
public class CourseMappingController {

    @Autowired
    private CourseMappingService courseMappingService;

    @GetMapping
    public ResponseEntity<List<CourseMappingDto>> getAllMappings() {
        return ResponseEntity.ok(courseMappingService.getAllCourseMappings());
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAllMappings() {
        courseMappingService.deleteAllMappings();
        return ResponseEntity.noContent().build();
    }
}
