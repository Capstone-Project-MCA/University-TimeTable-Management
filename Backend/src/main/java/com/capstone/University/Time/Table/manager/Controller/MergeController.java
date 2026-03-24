package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.MergeDTO;
import com.capstone.University.Time.Table.manager.Service.MergeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/merge")
@CrossOrigin(origins = "*")
public class MergeController {

    @Autowired
    private MergeService mergeService;

    @PostMapping("/merge-section")
    public ResponseEntity<?> mergeSections(@RequestBody MergeDTO mergeDTO) {
        try {
            List<CourseMappingDto> result = mergeService.mergeSection(mergeDTO);
            // Extract the merge code from the first result to return to the frontend
            String mergeCode = result.isEmpty() ? null : result.get(0).getMergecode();
            return ResponseEntity.ok(Map.of(
                    "mergeCode", mergeCode != null ? mergeCode : "",
                    "mappings", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @DeleteMapping("/unmerge/{mergeCode}")
    public ResponseEntity<?> unmergeGroup(@PathVariable String mergeCode) {
        try {
            mergeService.unmergeGroup(mergeCode);
            return ResponseEntity.ok(Map.of("message", "Group " + mergeCode + " deleted successfully."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }

    @PutMapping("/update-merge/{mergeCode}")
    public ResponseEntity<?> updateMergeGroup(
            @PathVariable String mergeCode,
            @RequestBody MergeDTO mergeDTO)
    {
        try {
            List<CourseMappingDto> result = mergeService.updateMergeSection(mergeCode, mergeDTO);
            return ResponseEntity.ok(Map.of(
                    "mergeCode", mergeCode,
                    "mappings", result
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", e.getMessage())
            );
        }
    }
}
