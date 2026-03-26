package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class CourseDto {
    private String courseCode;
    private String courseTitle;
    private Short l;
    private Short t;
    private Short p;
    private Short credit;
    private String courseType;
    private String domain;
    private String remarks;
    private Character courseNature;
}
