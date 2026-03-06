package com.capstone.University.Time.Table.manager.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    @Id
    private String RoomNo;

    private Integer seatingCapacity;
    private Integer RoomType;
    private Integer Level;
}
