package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;
import java.time.LocalTime;

@Data
public class TicketDto {
    private String ticketId;
    private String section;
    private String courseCode;
    private Short groupNo;
    private Short lectureNo;
    private String day;
    private LocalTime time;
    private String mergedCode;
    private String mappingType;
    private String facultyUid;
    private String roomNo;
}
