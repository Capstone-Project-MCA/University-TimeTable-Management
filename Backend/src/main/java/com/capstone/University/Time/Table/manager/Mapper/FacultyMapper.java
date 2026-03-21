package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.FacultyDto;
import com.capstone.University.Time.Table.manager.Entity.Faculty;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FacultyMapper {
    FacultyDto toDto(Faculty faculty);

    @Mapping(target = "courseMappings", ignore = true)
    @Mapping(target = "tickets", ignore = true)
    Faculty toEntity(FacultyDto facultyDto);
}
