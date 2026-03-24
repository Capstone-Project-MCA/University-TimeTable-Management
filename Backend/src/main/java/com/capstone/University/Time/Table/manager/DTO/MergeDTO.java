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
    String courseCode;
    List<String> sectionIds;
    Short groupNo;
    String mappingType;
    String existingMergeCode;
}
