package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(
    name = "coursemapping",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "UK_coursemapping_biz_key",
            columnNames = {"Section", "Coursecode", "GroupNo", "MappingType"}
        )
    }
)
public class CourseMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CourseMappingId")
    private Long courseMappingId;

    @Column(name = "Section", length = 5, nullable = false)
    private String section;

    @Column(name = "Coursecode", length = 7, nullable = false)
    private String courseCode;

    @Column(name = "GroupNo", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short groupNo;

    @Column(name = "MappingType", nullable = false)
    private String mappingType;

    @Column(name = "AttendanceType", length = 15, nullable = false)
    private String attendanceType = "Regular";

    @Column(name = "Mergecode", length = 7)
    private String mergeCode;

    @Column(name = "MergeStatus", nullable = false)
    private Boolean mergeStatus = false;

    @Column(name = "FacultyUID", length = 5)
    private String facultyUid;

    @Column(name = "L", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short l = (short) 0;

    @Column(name = "T", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short t = (short) 0;

    @Column(name = "P", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short p = (short) 0;

    @Column(name = "Reserveslot", length = 50)
    private String reserveSlot;

    @Column(name = "CourseNature", nullable = false)
    private Character courseNature;

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
