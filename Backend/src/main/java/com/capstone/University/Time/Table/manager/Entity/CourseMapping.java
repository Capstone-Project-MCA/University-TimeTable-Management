package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "coursemapping")
@IdClass(CourseMappingId.class)
public class CourseMapping {
    @Id
    @Column(name = "Section", length = 5)
    private String Section;

    @Id
    @Column(name = "Coursecode", length = 7)
    private String Coursecode;

    @Id
    @Column(name = "GroupNo", nullable = false)
    private Short GroupNo;

    @Column(name = "AttendanceType", length = 15, nullable = false)
    private String AttendanceType;

    @Column(name = "Mergecode", length = 7)
    private String Mergecode;

    @Column(name = "MergeStatus", nullable = false)
    private Boolean MergeStatus;

    @Column(name = "FacultyUID", length = 5)
    private String FacultyUID;

    @Column(name = "L", nullable = false)
    private Short L;

    @Column(name = "T", nullable = false)
    private Short T;

    @Column(name = "P", nullable = false)
    private Short P;

    @Column(name = "Reserveslot", length = 50)
    private String Reserveslot;

    @Column(name = "CourseNature", nullable = false)
    private Character CourseNature;

    @ManyToOne
    @JoinColumn(name = "Section", insertable = false, updatable = false)
    private Section sectionEntity;

    @ManyToOne
    @JoinColumn(name = "Coursecode", insertable = false, updatable = false)
    private Course courseEntity;

    @ManyToOne
    @JoinColumn(name = "FacultyUID", insertable = false, updatable = false)
    private Faculty facultyEntity;
}
