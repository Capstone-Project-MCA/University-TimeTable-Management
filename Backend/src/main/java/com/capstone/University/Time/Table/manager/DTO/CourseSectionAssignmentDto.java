package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CourseSectionAssignmentDto {
    private List<String> courseIds;
    private List<String> sectionIds;
}
