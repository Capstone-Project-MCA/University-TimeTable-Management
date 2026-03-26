package com.capstone.University.Time.Table.manager.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "roommaster")
public class Room {
    @Id
    @Column(name = "RoomNo", length = 10)
    private String roomNo;

    @Column(name = "SeatingCapacity", nullable = false)
    private Short seatingCapacity;

    @Column(name = "RoomType", nullable = false)
    private Short roomType;

    @Column(name = "Level", nullable = false)
    private Short level;

    @OneToMany(mappedBy = "roomEntity", cascade = CascadeType.ALL)
    private List<Ticket> tickets = new ArrayList<>();
}
