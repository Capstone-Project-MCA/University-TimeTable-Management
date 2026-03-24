package com.capstone.University.Time.Table.manager.DTO;

import lombok.Data;
import java.util.List;

@Data
public class MergeSectionsRequest {
    private String courseCode;
    private List<String> sectionIds;
    private String existingMergeCode;
    private Short groupNo;
}
