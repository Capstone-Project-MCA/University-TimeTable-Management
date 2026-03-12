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
@Table(name = "coursemaster")
public class Course {
    @Id
    @Column(name = "CourseCode")
    private String CourseCode;

    @Column(name = "CourseTitle")
    private String CourseTitle;

    @Column(name = "L")
    private Short L;

    @Column(name = "T")
    private Short T;

    @Column(name = "P")
    private Short P;

    @Column(name = "Credit")
    private Short Credit;

    @Column(name = "CourseType")
    private String CourseType;

    @Column(name = "Domain")
    private String Domain;

    @Column(name = "Remarks")
    private String remarks;

    @Column(name = "CourseNature")
    private Character CourseNature;

    @ManyToMany(mappedBy = "courses")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("courses")
    private java.util.Set<Section> sections = new java.util.HashSet<>();

    @OneToMany(mappedBy = "courseEntity")

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"courseEntity", "sectionEntity"})
    private List<CourseMapping> courseMappings = new ArrayList<>();
}
