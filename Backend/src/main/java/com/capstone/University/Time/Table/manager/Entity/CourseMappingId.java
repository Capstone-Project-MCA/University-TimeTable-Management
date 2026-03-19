package com.capstone.University.Time.Table.manager.Entity;

import lombok.*;

import java.io.Serializable;

// This class is retained for backward compatibility but is no longer used as an @IdClass.
// CourseMapping now uses a single auto-increment Long primary key (courseMappingId).
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
