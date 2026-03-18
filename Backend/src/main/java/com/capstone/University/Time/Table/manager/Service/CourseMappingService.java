package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import com.capstone.University.Time.Table.manager.Entity.CourseMappingId;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Repository.CourseMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseMappingService {

    @Autowired
    private CourseMappingRepository courseMappingRepository;

    public List<CourseMappingDto> getAllCourseMappings() {
        return courseMappingRepository.findAll()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CourseMappingDto mapToDto(CourseMapping entity) {
        CourseMappingDto dto = new CourseMappingDto();
        dto.setSection(entity.getSection());
        dto.setCoursecode(entity.getCoursecode());
        dto.setGroupNo(entity.getGroupNo());
        dto.setAttendanceType(entity.getAttendanceType());
        dto.setMergecode(entity.getMergecode());
        dto.setMergeStatus(entity.getMergeStatus());
        dto.setFacultyUID(entity.getFacultyUID());
        dto.setL(entity.getL());
        dto.setT(entity.getT());
        dto.setP(entity.getP());
        dto.setReserveslot(entity.getReserveslot());
        dto.setCourseNature(entity.getCourseNature());
        dto.setMappingType(entity.getMappingType());
        return dto;
    }

    public CourseMappingDto assignFacultyAndMergeCode(String section, String coursecode, Short groupNo, String mappingType, String facultyUID, String mergeCode, String reserveSlot) {
        CourseMappingId id = new CourseMappingId(section, coursecode, groupNo, mappingType);
        
        CourseMapping existMapping = courseMappingRepository.findById(id).orElse(null);
        if(existMapping == null) {
            throw new ResourceNotFoundException("Course Mapping not found");
        }
        
        if(facultyUID != null) existMapping.setFacultyUID(facultyUID);
        if(mergeCode != null) existMapping.setMergecode(mergeCode);
        if(reserveSlot != null) existMapping.setReserveslot(reserveSlot);
        
        courseMappingRepository.save(existMapping);
        return mapToDto(existMapping);
    }
}
