package com.capstone.University.Time.Table.manager.Mapper;

import com.capstone.University.Time.Table.manager.DTO.RoomDto;
import com.capstone.University.Time.Table.manager.Entity.Room;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoomMapper {
    RoomDto toDto(Room room);
    Room toEntity(RoomDto roomDto);
}
