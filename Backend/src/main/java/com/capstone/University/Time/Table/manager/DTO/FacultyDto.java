package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;

@Data
public class FacultyDto {
    private String facultyUid;
    private String facultyName;
    private String facultyDomain;
    private Short currentLoad;
    private Short expectedLoad;
}
