package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.MergeSectionsRequest;
import com.capstone.University.Time.Table.manager.DTO.MergeSectionsResponse;
import com.capstone.University.Time.Table.manager.Service.CourseMappingService;
import com.capstone.University.Time.Table.manager.Service.MergeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
