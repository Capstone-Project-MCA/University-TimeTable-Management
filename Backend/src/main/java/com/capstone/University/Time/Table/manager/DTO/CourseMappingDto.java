package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class CourseMappingDto {
    private Long courseMappingId;
    private String section;
    private String courseCode;
    private Short groupNo;
    private String mappingType;
    private String attendanceType;
    private String mergeCode;
    private Boolean mergeStatus;
    private String facultyUid;
    private Short l;
    private Short t;
    private Short p;
    private String reserveSlot;
    private Character courseNature;
}
