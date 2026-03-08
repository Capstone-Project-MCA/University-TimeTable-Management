package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ticket")
public class Ticket {
    @Id
    @Column(name = "TicketId", length = 7)
    private String TicketId;

    @Column(name = "Section", length = 5, nullable = false)
    private String Section;

    @Column(name = "Coursecode", length = 7, nullable = false)
    private String Coursecode;

    @Column(name = "GroupNo", nullable = false)
    private Short GroupNo;

    @Column(name = "LectureNo", nullable = false)
    private Short LectureNo;

    @Column(name = "Day", length = 10, nullable = false)
    private String Day;

    @Column(name = "Time", nullable = false)
    private LocalTime Time;

    @Column(name = "MergedCode", length = 7, nullable = false)
    private String MergedCode;

    @Column(name = "FacultyUID", length = 5, nullable = false)
    private String FacultyUID;

    @Column(name = "RoomNo", length = 10)
    private String RoomNo;
}
