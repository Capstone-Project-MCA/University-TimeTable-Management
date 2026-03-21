package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.CourseMappingDto;
import com.capstone.University.Time.Table.manager.Entity.CourseMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMappingMapper {
    CourseMappingDto toDto(CourseMapping courseMapping);

    @Mapping(target = "sectionEntity", ignore = true)
    @Mapping(target = "courseEntity", ignore = true)
    @Mapping(target = "facultyEntity", ignore = true)
    CourseMapping toEntity(CourseMappingDto courseMappingDto);
}
