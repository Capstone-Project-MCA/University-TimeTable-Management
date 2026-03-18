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
    @JsonIgnoreProperties("courses")
    private Set<Section> sections = new HashSet<>();

    @OneToMany(mappedBy = "courseEntity", cascade = CascadeType.ALL, orphanRemoval = true)

    @JsonIgnoreProperties({"courseEntity", "sectionEntity"})
    private List<CourseMapping> courseMappings = new ArrayList<>();
}
