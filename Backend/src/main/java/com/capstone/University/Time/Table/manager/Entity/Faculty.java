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
    private String facultyUid;

    @Column(name = "FacultyName", length = 50, nullable = false)
    private String facultyName;

    @Column(name = "FacultyDomain", length = 20, nullable = false)
    private String facultyDomain;

    @Column(name = "CurrentLoad", nullable = false)
    private Short currentLoad = 0;

    @Column(name = "ExpectedLoad", nullable = false)
    private Short expectedLoad = 0;

    @OneToMany(mappedBy = "facultyEntity", cascade = CascadeType.ALL)
    private List<CourseMapping> courseMappings = new ArrayList<>();

    @OneToMany(mappedBy = "facultyEntity", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();
}
