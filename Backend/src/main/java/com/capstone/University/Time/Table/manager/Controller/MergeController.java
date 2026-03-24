package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.MergeSectionsRequest;
import com.capstone.University.Time.Table.manager.DTO.MergeSectionsResponse;
import com.capstone.University.Time.Table.manager.Service.MergeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/merge")
@CrossOrigin(origins = "*")
public class MergeController {

    @Autowired
    private MergeService mergeService;

    @PostMapping("/merge-section")
    public ResponseEntity<?> mergeSections(@RequestBody MergeSectionsRequest request) {
        try {
            MergeSectionsResponse response = mergeService.mergeSections(
                    request.getCourseCode(),
                    request.getSectionIds(),
                    request.getExistingMergeCode(),
                    request.getGroupNo()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
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
}
