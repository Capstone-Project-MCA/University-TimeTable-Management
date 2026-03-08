package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMappingMapper {
    CourseMappingDto toDto(CourseMapping courseMapping);
    CourseMapping toEntity(CourseMappingDto courseMappingDto);
}
