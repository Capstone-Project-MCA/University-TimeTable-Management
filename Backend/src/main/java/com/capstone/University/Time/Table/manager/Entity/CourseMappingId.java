package com.capstone.University.Time.Table.manager.Entity;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseMappingId implements Serializable {
    private String Section;
    private String Coursecode;
    private Short GroupNo;
    private String mappingType;
}
