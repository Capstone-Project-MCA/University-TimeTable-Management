package com.capstone.University.Time.Table.manager.Service;

import com.capstone.University.Time.Table.manager.DTO.RoomDto;
import com.capstone.University.Time.Table.manager.Entity.Room;
import com.capstone.University.Time.Table.manager.Exception.DuplicateResourceException;
import com.capstone.University.Time.Table.manager.Exception.ResourceNotFoundException;
import com.capstone.University.Time.Table.manager.Mapper.RoomMapper;
import com.capstone.University.Time.Table.manager.Repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomMapper roomMapper;

//------------------------------------- All Room get Requests Service -------------------------------------------------
    public RoomDto getRoomByRoomNo(String roomNo) {
        Room room = roomRepository.findByRoomNo(roomNo);
        if(room == null){
            throw new ResourceNotFoundException("Room not found with room no: " + roomNo + "'");
        }
        return roomMapper.toDto(room);
    }

    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toDto)
                .toList();

    }

//------------------------------------- All Room Post Requests Service -------------------------------------------------
    public RoomDto createNewRoom(Room room) {
        Room existsRoom = roomRepository.findByRoomNo(room.getRoomNo());
        if(existsRoom != null){
            throw new DuplicateResourceException("Room already exists with room no: " + room.getRoomNo());
        }

        roomRepository.save(room);
        return roomMapper.toDto(room);
    }

//-------------------------------------- All Room Put Requests Service -------------------------------------------------
    public RoomDto updateRoomByRoomNo(String roomNo, Room room) {
        Room existsRoom = roomRepository.findByRoomNo(roomNo);

        if(existsRoom == null){
            throw new ResourceNotFoundException("Room not found with room no: " + roomNo + "'");
        }

        Room updatedRoom = new Room();
        updatedRoom.setRoomNo(room.getRoomNo());
        updatedRoom.setSeatingCapacity(room.getSeatingCapacity());
        updatedRoom.setRoomType(room.getRoomType());
        updatedRoom.setLevel(room.getLevel());

        roomRepository.save(updatedRoom);
        return roomMapper.toDto(updatedRoom);
    }

//------------------------------------- All Room Delete Requests Service -----------------------------------------------
    public void deleteRoomByRoomNo(String roomNo) {
        Room existsRoom = roomRepository.findByRoomNo(roomNo);
        if(existsRoom == null){
            throw new ResourceNotFoundException("Room not found with room no: " + roomNo + "'");
        }
        roomRepository.delete(existsRoom);
    }

    public void deleteAllRooms() {
        roomRepository.deleteAll();
    }
}
