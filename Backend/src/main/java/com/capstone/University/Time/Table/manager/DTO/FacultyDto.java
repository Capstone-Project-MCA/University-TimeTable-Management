package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class FacultyDto {
    private String FacultyUID;
    private String FacultyName;
    private String FacultyDomain;
    private Short CurrentLoad;
    private Short ExpectedLoad;
}
