package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.CourseDto;
import com.capstone.University.Time.Table.manager.Entity.Course;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseDto toDto(Course course);
    Course toEntity(CourseDto courseDto);
}
