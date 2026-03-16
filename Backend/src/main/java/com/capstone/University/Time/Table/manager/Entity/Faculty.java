package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "facultymaster")
public class Faculty {
    @Id
    @Column(name = "FacultyUID", length = 5)
    private String FacultyUID;

    @Column(name = "FacultyName", length = 50, nullable = false)
    private String FacultyName;

    @Column(name = "FacultyDomain", length = 20, nullable = false)
    private String FacultyDomain;

    @Column(name = "CurrentLoad", nullable = false)
    private Short CurrentLoad=0;

    @Column(name = "ExpectedLoad", nullable = false)
    private Short ExpectedLoad=0;

    @OneToMany(mappedBy = "facultyEntity", cascade = CascadeType.ALL)
    private List<CourseMapping> courseMappings = new ArrayList<>();

    @OneToMany(mappedBy = "facultyEntity", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();
}
