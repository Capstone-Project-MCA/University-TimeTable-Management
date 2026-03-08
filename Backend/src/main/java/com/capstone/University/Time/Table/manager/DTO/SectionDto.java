package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class SectionDto {
    private String SectionId;
    private Short Strength;
    private Short NumberOfGroups;
    private String ProgramName;
    private Short Semester;
    private Short Batch;
    private Short ProgramType;
    private Double ProgramDuration;
    private String ProgramCode;
}
