package com.capstone.University.Time.Table.manager.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "coursemaster")
public class Course {
    @Id
    @Column(name = "CourseCode", length = 7)
    private String courseCode;

    @Column(name = "CourseTitle")
    private String courseTitle;

    @Column(name = "L")
    private Short l;

    @Column(name = "T")
    private Short t;

    @Column(name = "P")
    private Short p;

    @Column(name = "Credit")
    private Short credit;

    @Column(name = "CourseType")
    private String courseType;

    @Column(name = "Domain")
    private String domain;

    @Column(name = "Remarks")
    private String remarks;

    @Column(name = "CourseNature")
    private Character courseNature;

    @ManyToMany(mappedBy = "courses")
    @JsonIgnoreProperties("courses")
    private Set<Section> sections = new HashSet<>();

    @OneToMany(mappedBy = "courseEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"courseEntity", "sectionEntity"})
    private List<CourseMapping> courseMappings = new ArrayList<>();
}
