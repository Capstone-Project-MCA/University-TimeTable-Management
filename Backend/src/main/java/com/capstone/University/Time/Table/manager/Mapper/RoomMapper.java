package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.RoomDto;
import com.capstone.University.Time.Table.manager.Entity.Room;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    RoomDto toDto(Room room);

    @Mapping(target = "tickets", ignore = true)
    Room toEntity(RoomDto roomDto);
}
