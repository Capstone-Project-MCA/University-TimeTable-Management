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
@Table(name = "sectionmaster")
public class Section {
    @Id
    @Column(name = "SectionId", length = 5)
    private String sectionId;

    @Column(name = "Strength", nullable = false)
    private Short strength;

    @Column(name = "NumberOfGroups", nullable = false)
    private Short numberOfGroups;

    @Column(name = "ProgramName", length = 12, nullable = false)
    private String programName;

    @Column(name = "Semester", nullable = false)
    private Short semester;

    @Column(name = "Batch", nullable = false)
    private Short batch;

    @Column(name = "ProgramType", nullable = false)
    private Short programType;

    @Column(name = "ProgramDuration", nullable = false)
    private Double programDuration;

    @Column(name = "ProgramCode", length = 9, nullable = false)
    private String programCode;

    @ManyToMany
    @JoinTable(
        name = "section_course",
        joinColumns = @JoinColumn(name = "section_id"),
        inverseJoinColumns = @JoinColumn(name = "course_code", columnDefinition = "VARCHAR(255)")
    )
    @JsonIgnoreProperties("sections")
    private Set<Course> courses = new HashSet<>();

    @OneToMany(mappedBy = "sectionEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"sectionEntity", "courseEntity"})
    private List<CourseMapping> courseMappings = new ArrayList<>();
}
