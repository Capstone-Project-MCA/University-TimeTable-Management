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
    private String SectionId;

    @Column(name = "Strength", nullable = false)
    private Short Strength;

    @Column(name = "NumberOfGroups", nullable = false)
    private Short NumberOfGroups;

    @Column(name = "ProgramName", length = 12, nullable = false)
    private String ProgramName;

    @Column(name = "Semester", nullable = false)
    private Short Semester;

    @Column(name = "Batch", nullable = false)
    private Short Batch;

    @Column(name = "ProgramType", nullable = false)
    private Short ProgramType;

    @Column(name = "ProgramDuration", nullable = false)
    private Double ProgramDuration;

    @Column(name = "ProgramCode", length = 9, nullable = false)
    private String ProgramCode;

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
