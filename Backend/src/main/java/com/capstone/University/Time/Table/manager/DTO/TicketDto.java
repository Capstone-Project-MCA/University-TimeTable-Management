package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;
import java.time.LocalTime;

@Data
public class TicketDto {
    private String TicketId;
    private String Section;
    private String Coursecode;
    private Short GroupNo;
    private Short LectureNo;
    private String Day;
    private LocalTime Time;
    private String MergedCode;
    private String FacultyUID;
    private String RoomNo;
}
