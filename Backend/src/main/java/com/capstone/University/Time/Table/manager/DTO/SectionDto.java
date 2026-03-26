package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class SectionDto {
    private String sectionId;
    private Short strength;
    private Short numberOfGroups;
    private String programName;
    private Short semester;
    private Short batch;
    private Short programType;
    private Double programDuration;
    private String programCode;
}
