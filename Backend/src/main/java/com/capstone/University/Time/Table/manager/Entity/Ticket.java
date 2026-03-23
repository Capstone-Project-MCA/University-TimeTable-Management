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
    private String TicketId;

    @Column(name = "Section", length = 5, nullable = false)
    private String Section;

    @Column(name = "Coursecode", length = 7, nullable = false)
    private String Coursecode;

    @Column(name = "GroupNo", nullable = false, columnDefinition = "TINYINT UNSIGNED")
    private Short GroupNo;

    @Column(name = "LectureNo", nullable = false)
    private Short LectureNo;

    @Column(name = "Day", length = 10)
    private String Day;

    @Column(name = "Time")
    private LocalTime Time;

    @Column(name = "MergedCode", length = 7)
    private String MergedCode;

    @Column(name = "FacultyUID", length = 5)
    private String FacultyUID;

    @Column(name = "RoomNo", length = 10)
    private String RoomNo;

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
