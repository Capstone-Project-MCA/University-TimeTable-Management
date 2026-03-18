package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.Service.CourseMappingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/mappings")
public class CourseMappingController {

    @Autowired
    private CourseMappingService courseMappingService;

    @GetMapping
    public ResponseEntity<List<CourseMappingDto>> getAllMappings() {
        return new ResponseEntity<>(courseMappingService.getAllCourseMappings(), HttpStatus.OK);
    }

    @PutMapping("/assign")
    public ResponseEntity<CourseMappingDto> assignFacultyAndDetails(@RequestBody Map<String, Object> payload) {
        String section = (String) payload.get("section");
        String coursecode = (String) payload.get("coursecode");
        Short groupNo = ((Number) payload.get("groupNo")).shortValue();
        String mappingType = (String) payload.get("mappingType");
        
        String facultyUID = (String) payload.get("facultyUID");
        String mergeCode = (String) payload.get("mergeCode");
        String reserveSlot = (String) payload.get("reserveSlot");
        
        CourseMappingDto updated = courseMappingService.assignFacultyAndMergeCode(
                section, coursecode, groupNo, mappingType, facultyUID, mergeCode, reserveSlot);
                
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }
}
