package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Course {
    @Id
    private String CourseCode;

    private String CourseTitle;
    private Short L;
    private Short T;
    private Short P;
    private String Credit;
    private String CourseType;
    private String Domain;
    private String remarks;
    private Character CourseNature;

    @ElementCollection
    private List<String> status = new ArrayList<>(List.of("PENDING"));
}
