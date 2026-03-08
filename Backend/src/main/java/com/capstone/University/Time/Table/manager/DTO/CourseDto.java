package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class CourseDto {
    private String CourseCode;
    private String CourseTitle;
    private Short L;
    private Short T;
    private Short P;
    private Short Credit;
    private String CourseType;
    private String Domain;
    private String remarks;
    private Character CourseNature;
}
