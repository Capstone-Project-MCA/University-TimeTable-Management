package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
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

    @OneToMany(mappedBy = "sectionEntity")
    private List<CourseMapping> courseMappings = new ArrayList<>();
}
