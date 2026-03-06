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
public class Section {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private Integer strength;
    private Integer numberOfGroups;
    private String programName;
    private Integer semester;
    private Integer batch;
    private Integer programType;
    private Double programDuration;
    private String programCode;
}
