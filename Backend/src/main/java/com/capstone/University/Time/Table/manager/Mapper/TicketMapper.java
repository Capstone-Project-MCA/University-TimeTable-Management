package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.TicketDto;
import com.capstone.University.Time.Table.manager.Entity.Ticket;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TicketMapper {
    TicketDto toDto(Ticket ticket);
    Ticket toEntity(TicketDto ticketDto);
}
