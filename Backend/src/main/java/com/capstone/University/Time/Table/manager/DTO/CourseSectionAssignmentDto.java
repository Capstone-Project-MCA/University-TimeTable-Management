package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

import java.util.List;

@Data
public class CourseSectionAssignmentDto {
    private List<String> courseId;
    private List<String> sectionIds;
}
