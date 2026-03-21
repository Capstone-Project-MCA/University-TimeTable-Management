package com.capstone.University.Time.Table.manager.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MergeSectionsResponse {
    private String mergeCode;
    private String courseCode;
    private List<String> sectionIds;
    private int updatedMappings;
    private String message;
}
