package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CourseMapping {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

//    private Section section;

    private String AttendanceType;
    private int GroupNo;

    private String MergeCode;
    private Boolean MergeStatus;

    private Long FacultyUID;

    private int L;
    private int T;
    private int P;

    private String reserveSlot;
    private Character CourseNature;
}
