package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class CourseMappingDto {
    private String Section;
    private String Coursecode;
    private Short GroupNo;
    private String AttendanceType;
    private String Mergecode;
    private Boolean MergeStatus;
    private String FacultyUID;
    private Short L;
    private Short T;
    private Short P;
    private String Reserveslot;
    private Character CourseNature;
    private String mappingType;
}
