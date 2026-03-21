package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.SectionDto;
import com.capstone.University.Time.Table.manager.Entity.Section;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SectionMapper {
    SectionDto toDto(Section section);

    @Mapping(target = "courses", ignore = true)
    @Mapping(target = "courseMappings", ignore = true)
    Section toEntity(SectionDto sectionDto);
}
