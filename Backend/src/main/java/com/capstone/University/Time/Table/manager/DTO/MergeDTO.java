package com.capstone.University.Time.Table.manager.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MergeDTO {
    private String courseCode;
    private List<String> sectionIds;
    private Short groupNo;
    private String mappingType;
}
