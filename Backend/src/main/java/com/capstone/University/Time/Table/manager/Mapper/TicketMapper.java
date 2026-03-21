package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.TicketDto;
import com.capstone.University.Time.Table.manager.Entity.Ticket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    TicketDto toDto(Ticket ticket);

    @Mapping(target = "courseMappingId", ignore = true)
    @Mapping(target = "courseMappingEntity", ignore = true)
    @Mapping(target = "facultyEntity", ignore = true)
    @Mapping(target = "roomEntity", ignore = true)
    Ticket toEntity(TicketDto ticketDto);
}
