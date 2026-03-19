package com.capstone.University.Time.Table.manager.Controller;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.DTO.CourseSectionAssignmentDto;
import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
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

    @PostMapping("/save-all-faculty")
    public ResponseEntity<List<CourseMappingDto>> saveAllFacultyMappings(
            @RequestBody List<CourseMapping> courseMappings)
    {
        return ResponseEntity.ok(assignService.saveAllFacultyAssign(courseMappings));
    }

    @PutMapping("/assign-multiple/{facultyUID}/{sectionId}")
    public ResponseEntity<List<Pair<String, Pair<String, List<CourseMappingDto>>>>> assignMultiple(
            @PathVariable String facultyUID,
            @PathVariable String sectionId,
            @RequestBody List<CourseMapping> courseMappings
    ){
        return ResponseEntity.ok(assignService.assignMultipleCoursesToFaculty(facultyUID, sectionId, courseMappings));
    }

    @PutMapping("/assign-faculty")
    public ResponseEntity<CourseMappingDto> assignFacultyToSection(
            @RequestBody CourseMapping courseMapping)
    {
        return ResponseEntity.ok(assignService.assignFacultyToCoursesAndSection(courseMapping));
    }
}
