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
@Table(name = "facultymaster")
public class Faculty {
    @Id
    @Column(name = "FacultyUID", length = 5)
    private String FacultyUID;

    @Column(name = "FacultyName", length = 30, nullable = false)
    private String FacultyName;

    @Column(name = "FacultyDomain", length = 4, nullable = false)
    private String FacultyDomain;

    @Column(name = "CurrentLoad", nullable = false)
    private Short CurrentLoad;

    @Column(name = "ExpectedLoad", nullable = false)
    private Short ExpectedLoad;
}
