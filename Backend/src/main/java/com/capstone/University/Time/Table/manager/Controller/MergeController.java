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
    public ResponseEntity<List<CourseMappingDto>> mergeSections(@RequestBody MergeDTO mergeDTO) {
        return ResponseEntity.ok(mergeService.mergeSection(mergeDTO));
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
    public ResponseEntity<List<CourseMappingDto>> updateMergeGroup(
            @PathVariable String mergeCode,
            @RequestBody MergeDTO mergeDTO)
    {
        return ResponseEntity.ok(mergeService.updateMergeSection(mergeCode, mergeDTO));
    }
}
