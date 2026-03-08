package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.FacultyDto;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FacultyMapper {
    FacultyDto toDto(Faculty faculty);
    Faculty toEntity(FacultyDto facultyDto);
}
