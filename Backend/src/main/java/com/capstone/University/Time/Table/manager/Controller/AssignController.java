package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.DTO.CourseSectionAssignmentDto;
import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Service.AssignService;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assign")
@CrossOrigin(origins = "http://localhost:5173")
public class AssignController {

    @Autowired
    private AssignService assignService;

    @PostMapping("/assign-courses")
    public ResponseEntity<List<Pair<SectionDto, List<CourseDto>>>> assignCoursesToSection(
            @RequestBody CourseSectionAssignmentDto courseSectionAssignmentDto)
    {
        return ResponseEntity.ok(assignService.assignCoursesToSection(courseSectionAssignmentDto));
    }

    @GetMapping("/error")
    public ResponseEntity<List<String>> courseAssignErrors(){
        return ResponseEntity.ok(assignService.courseAssignErrors());
    }
}
