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
@Table(name = "roommaster")
public class Room {
    @Id
    @Column(name = "RoomNo", length = 10)
    private String RoomNo;

    @Column(name = "SeatingCapacity", nullable = false)
    private Short SeatingCapacity;

    @Column(name = "RoomType", nullable = false)
    private Short RoomType;

    @Column(name = "Level", nullable = false)
    private Short Level;
}
