package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.MergeSectionsRequest;
import com.capstone.University.Time.Table.manager.DTO.MergeSectionsResponse;
import com.capstone.University.Time.Table.manager.Service.CourseMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/mappings")
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

    // ── Merge Sections endpoint ─────────────────────────────

    @PostMapping("/merge")
    public ResponseEntity<?> mergeSections(@RequestBody MergeSectionsRequest request) {
        try {
            MergeSectionsResponse response = courseMappingService.mergeSections(
                    request.getCourseCode(),
                    request.getSectionIds()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}
