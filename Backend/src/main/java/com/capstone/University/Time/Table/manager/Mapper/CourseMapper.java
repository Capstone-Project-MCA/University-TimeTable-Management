package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseDto toDto(Course course);

    @Mapping(target = "sections", ignore = true)
    @Mapping(target = "courseMappings", ignore = true)
    Course toEntity(CourseDto courseDto);
}
