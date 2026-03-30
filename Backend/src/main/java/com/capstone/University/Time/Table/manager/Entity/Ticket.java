package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ticket")
public class Ticket {
    @Id
    @Column(name = "TicketId", length = 30)
    private String ticketId;

    @Column(name = "Section", length = 5, nullable = false)
    private String section;

    @Column(name = "Coursecode", length = 7, nullable = false)
    private String courseCode;

    @Column(name = "GroupNo", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short groupNo;

    @Column(name = "LectureNo", nullable = false)
    private Short lectureNo;

    @Column(name = "Day", length = 10)
    private String day;

    @Column(name = "Time")
    private LocalTime time;

    @Column(name = "MergedCode", length = 7, nullable = false, columnDefinition = "VARCHAR(7) DEFAULT ''")
    private String mergedCode = "";

    @Column(name = "MappingType", length = 1)
    private String mappingType;

    @Column(name = "FacultyUID", length = 5)
    private String facultyUid;

    @Column(name = "RoomNo", length = 10)
    private String roomNo;

    @Column(name = "CourseMappingId")
    private Long courseMappingId;

    @ManyToOne
    @JoinColumn(name = "CourseMappingId", referencedColumnName = "CourseMappingId", insertable = false, updatable = false)
    private CourseMapping courseMappingEntity;

    @ManyToOne
    @JoinColumn(name = "FacultyUID", insertable = false, updatable = false)
    private Faculty facultyEntity;

    @ManyToOne
    @JoinColumn(name = "RoomNo", insertable = false, updatable = false)
    private Room roomEntity;
}
