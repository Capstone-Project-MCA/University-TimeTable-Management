package com.capstone.University.Time.Table.manager.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseMappingId implements Serializable {
    private String Section;
    private String Coursecode;
    private Short GroupNo;
}
